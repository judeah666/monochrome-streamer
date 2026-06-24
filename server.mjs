import { createReadStream, existsSync, promises as fs } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { randomBytes, scryptSync } from 'node:crypto';
import { PassThrough } from 'node:stream';
import { fileURLToPath } from 'node:url';
import yazl from 'yazl';
import {
  buildByteRange,
  createTrackId,
  getContentType,
  readEmbeddedCover,
  scanMusicLibrary,
} from './lib/library.mjs';
import {
  addPlaylistTrack,
  createPlaylist,
  deletePlaylist,
  deletePlaylistsForOwner,
  deleteCollectionInDatabase,
  exportLibraryDatabaseSnapshot,
  readAlbumOverridesDatabase,
  readArtistOverridesDatabase,
  readCollectionOverridesDatabase,
  readCollectionFolderAlbumPage,
  readCollectionFolders,
  readLibraryAlbumPage,
  readLibraryDatabase,
  readLibraryDatabaseSummary,
  readLyricsOverridesDatabase,
  readPlaylist,
  readPlaylists,
  readExcelAlbumExportRows,
  readRandomAlbumPage,
  readArtistLibrary,
  readArtistPage,
  readFolderLibrary,
  readFolderListing,
  readTrackPage,
  readTrackFromDatabase,
  renameCollectionInDatabase,
  removePlaylistTrack,
  validateLibraryDatabaseFile,
  writeAlbumOverridesDatabase,
  writeArtistOverridesDatabase,
  writeCollectionOverridesDatabase,
  writeLibraryDatabase,
  writeLyricsOverridesDatabase,
} from './lib/library-db.mjs';
import {
  DEFAULT_MAX_CONCURRENT_MP3_DOWNLOADS,
  DOWNLOAD_MAX_REQUESTS,
  DOWNLOAD_WINDOW_MS,
  isPlaceholderWidgetApiKey,
  isWeakAdminCredentials,
  LOGIN_LOCKOUT_MS,
  LOGIN_MAX_FAILURES,
  LOGIN_WINDOW_MS,
  MAX_BULK_DOWNLOAD_TRACKS,
  normalizeCorsOrigin,
  refreshSessionRecord,
  timingSafeStringEqual,
  timingSafeTextEqual,
  createSessionRecord,
} from './src/server/securityPolicy.js';
import {
  DEFAULT_SETTINGS,
  PALETTE_THEMES,
  STORAGE_KEYS,
  THEME_PRESETS,
} from './src/controller/constants.js';
import { normalizeSettings } from './src/controller/settingsStore.js';
import { getThemeBase, resolveThemePreset } from './src/controller/themeResolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const assetsDir = path.join(__dirname, 'src', 'assets');
const configPath = path.join(__dirname, 'config.json');
const envPath = process.env.ENV_PATH || path.join(__dirname, '.env');
let ffmpegAvailablePromise = null;
let sharpModulePromise = null;
let sharpWarningShown = false;

const defaultConfig = {
  title: 'Monochrome-Streamer',
  libraryPath: '',
  dataDir: '',
  artistInfoPath: 'artist-info.json',
  artistOverridesPath: 'artist-overrides.json',
  albumOverridesPath: 'album-overrides.json',
  lyricsOverridesPath: 'lyrics-overrides.json',
  lyricsSidecarPath: 'lyrics',
  libraryFoldersPath: 'library-folders.json',
  libraryDatabasePath: 'library.sqlite',
  coverCachePath: 'covers',
  widgetSettingsPath: 'widget-settings.json',
  authUsersPath: 'users.json',
  scanMetadata: 'tags',
  scanDurations: false,
  autoScanOnStart: false,
  noAuth: true,
  anonymousDownloadsEnabled: false,
  adminUsername: 'admin',
  adminPassword: 'admin',
  widgetApiKey: '',
  widgetCorsOrigin: '*',
  trustProxy: false,
  requireHttpsForAuth: false,
  maxConcurrentMp3Downloads: DEFAULT_MAX_CONCURRENT_MP3_DOWNLOADS,
  host: '0.0.0.0',
  port: 8888,
};

await loadEnvironmentFile(envPath);
const config = await loadConfig();
validateAdminConfiguration(config);
const libraryRoot = config.libraryPath ? path.resolve(config.libraryPath) : '';
const artistInfoPath = config.artistInfoPath ? path.resolve(__dirname, config.artistInfoPath) : '';
const artistOverridesPath = config.artistOverridesPath ? path.resolve(__dirname, config.artistOverridesPath) : '';
const albumOverridesPath = config.albumOverridesPath ? path.resolve(__dirname, config.albumOverridesPath) : '';
const lyricsOverridesPath = config.lyricsOverridesPath ? path.resolve(__dirname, config.lyricsOverridesPath) : '';
const lyricsSidecarPath = config.lyricsSidecarPath ? path.resolve(__dirname, config.lyricsSidecarPath) : '';
const libraryFoldersPath = config.libraryFoldersPath ? path.resolve(__dirname, config.libraryFoldersPath) : '';
const libraryDatabasePath = config.libraryDatabasePath ? path.resolve(__dirname, config.libraryDatabasePath) : '';
const legacyLibraryCachePath = config.libraryCachePath ? path.resolve(__dirname, config.libraryCachePath) : '';
const coverCachePath = config.coverCachePath ? path.resolve(__dirname, config.coverCachePath) : '';
const widgetSettingsPath = config.widgetSettingsPath ? path.resolve(__dirname, config.widgetSettingsPath) : '';
const authUsersPath = config.authUsersPath ? path.resolve(__dirname, config.authUsersPath) : '';
const NATURAL_SORTER = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const COVER_CACHE_EXTENSION = '.webp';
const COVER_CACHE_MAX_SIZE = 1000;
const COVER_CACHE_THUMBNAIL_SIZE = 500;
const COVER_CACHE_WEBP_QUALITY = 82;
const COVER_UPLOAD_MAX_BYTES = 16 * 1024 * 1024;
const HOME_ALBUM_CACHE_MS = 60 * 60 * 1000;
const HOME_ALBUM_CACHE_LIMIT = 24;

if (!libraryRoot || !existsSync(libraryRoot)) {
  console.error(`Music library path is missing or invalid: ${libraryRoot || '(empty)'}`);
  console.error(`Copy ${path.basename(configPath)} from config.example.json and set "libraryPath" first.`);
  process.exit(1);
}

let libraryCache = null;
let trackMap = new Map();
let cachePromise = null;
let scanState = {
  status: 'idle',
  startedAt: null,
  finishedAt: null,
  error: null,
  selectedFolders: [],
  currentFolder: '',
  processedFiles: 0,
  totalFiles: 0,
  reusedFiles: 0,
  parsedFiles: 0,
  percent: 0,
};
let artistInfoCache = new Map();
let manualArtistInfoCache = null;
let artistOverridesCache = null;
let albumOverridesCache = null;
let collectionOverridesCache = null;
let lyricsOverridesCache = null;
let selectedLibraryFoldersCache = null;
let widgetSettingsCache = await readWidgetSettings();
let authStoreCache = null;
let homeAlbumPageCache = new Map();
const sessions = new Map();
const loginAttempts = new Map();
const downloadAttempts = new Map();
let activeMp3DownloadRequests = 0;

await initializeScanStateFromStore();

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    if (url.pathname === '/api/widget/stats' || url.pathname === '/api/widgets/stats') {
      if (request.method === 'OPTIONS') {
        return respondWidgetOptions(response);
      }
      if (request.method !== 'GET') {
        return respondWidgetJson(response, 405, { error: 'Method Not Allowed' });
      }
      if (!isWidgetRequestAuthorized(request, url)) {
        return respondWidgetJson(response, 401, {
          error: config.widgetApiKey ? 'Invalid widget API key' : 'Widget API key is not configured',
        });
      }
      const librarySummary = libraryCache
        ? { generatedAt: libraryCache.generatedAt, trackCount: libraryCache.trackCount, albumCount: libraryCache.albumCount }
        : await readLibraryDatabaseSummary(libraryDatabasePath);
      return respondWidgetJson(response, 200, {
        title: config.title,
        albumCount: librarySummary.albumCount || 0,
        trackCount: librarySummary.trackCount || 0,
        generatedAt: librarySummary.generatedAt || null,
        scan: {
          status: scanState.status,
          percent: scanState.percent || 0,
          currentFolder: scanState.currentFolder || '',
          processedFiles: scanState.processedFiles || 0,
          totalFiles: scanState.totalFiles || 0,
          finishedAt: scanState.finishedAt || null,
          error: scanState.error || null,
        },
      });
    }

    if (url.pathname === '/api/public/bootstrap') {
      if (request.method !== 'GET') {
        return respondJson(response, 405, { error: 'Method Not Allowed' });
      }
      return respondJson(response, 200, await getPublicBootstrapPayload());
    }

    const isPublicLoginShellRequest = isLoginShellRequest(url);
    const authUser = await getAuthenticatedUser(request);

    if (url.pathname === '/login' || url.pathname === '/login/') {
      if (request.method === 'POST') {
        return handleLogin(request, response, url);
      }
      return serveStaticAsset('/', response);
    }

    if (url.pathname === '/logout' || url.pathname === '/logout/') {
      if (request.method !== 'POST') {
        return respondJson(response, 405, { error: 'Method Not Allowed' });
      }
      assertPrivilegedMutation(request, authUser);
      const token = getSessionToken(request);
      if (token) sessions.delete(token);
      response.writeHead(303, {
        Location: config.noAuth ? '/' : getLoginAppRedirectPath('/'),
        'Set-Cookie': createSessionCookie('', request, { maxAge: 0 }),
        'Cache-Control': 'no-store',
        ...getSecurityHeaders(),
      });
      response.end();
      return;
    }

    if (!authUser && !isPublicLoginShellRequest) {
      return requireLogin(request, response, url);
    }

    if (url.pathname === '/api/auth/me') {
      return respondJson(response, 200, {
        user: createPublicUser(authUser),
        csrfToken: getCsrfTokenForUser(authUser),
      });
    }

    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      return redirect(response, '/');
    }

    if (url.pathname.startsWith('/api/admin/')) {
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      if (isStateChangingMethod(request.method)) {
        assertPrivilegedMutation(request, authUser, { requireAdmin: true });
      }
      return handleAdminApi(request, response, url);
    }

    if (url.pathname === '/api/playlists') {
      return await handlePlaylistsCollectionApi(request, response, authUser);
    }

    const playlistTrackMatch = /^\/api\/playlists\/([^/]+)\/tracks\/([^/]+)$/u.exec(url.pathname);
    if (playlistTrackMatch) {
      return await handlePlaylistTrackApi(
        request,
        response,
        authUser,
        decodeURIComponent(playlistTrackMatch[1]),
        decodeURIComponent(playlistTrackMatch[2]),
      );
    }

    const playlistTracksMatch = /^\/api\/playlists\/([^/]+)\/tracks$/u.exec(url.pathname);
    if (playlistTracksMatch) {
      return await handlePlaylistTracksApi(
        request,
        response,
        authUser,
        decodeURIComponent(playlistTracksMatch[1]),
      );
    }

    const playlistMatch = /^\/api\/playlists\/([^/]+)$/u.exec(url.pathname);
    if (playlistMatch) {
      return await handlePlaylistApi(
        request,
        response,
        authUser,
        decodeURIComponent(playlistMatch[1]),
      );
    }

    if (url.pathname === '/api/widget/settings') {
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      if (request.method === 'GET') {
        return respondJson(response, 200, getWidgetSettingsPayload(request));
      }
      if (request.method === 'POST') {
        assertPrivilegedMutation(request, authUser, { requireAdmin: true });
        const payload = await updateWidgetSettings(request);
        return respondJson(response, 200, payload);
      }
      return respondJson(response, 405, { error: 'Method Not Allowed' });
    }

    if (url.pathname === '/api/config') {
      const librarySummary = libraryCache
        ? { generatedAt: libraryCache.generatedAt, trackCount: libraryCache.trackCount, albumCount: libraryCache.albumCount }
        : await readLibraryDatabaseSummary(libraryDatabasePath);
      return respondJson(response, 200, {
        title: config.title,
        generatedAt: librarySummary.generatedAt,
        trackCount: librarySummary.trackCount,
        albumCount: librarySummary.albumCount,
        scan: scanState,
        user: createPublicUser(authUser),
        csrfToken: getCsrfTokenForUser(authUser),
        downloadSettings: await getDownloadSettings(),
      });
    }

    if (url.pathname === '/api/library') {
      if (url.searchParams.has('limit') || url.searchParams.has('offset') || url.searchParams.has('search')) {
        let pageOptions = {
          limit: url.searchParams.get('limit'),
          offset: url.searchParams.get('offset'),
          search: url.searchParams.get('search'),
          letter: url.searchParams.get('letter'),
          folders: getFolderFilterParams(url),
          includeTracks: false,
          includeCoverTracks: true,
        };
        const mediaTypeAlbumFilter = await getAlbumIdFilterForMediaTypes(url.searchParams.get('mediaTypes'));
        if (mediaTypeAlbumFilter?.albumIds) {
          pageOptions.albumIds = mediaTypeAlbumFilter.albumIds;
        }
        if (mediaTypeAlbumFilter?.excludeAlbumIds) {
          pageOptions.excludeAlbumIds = mediaTypeAlbumFilter.excludeAlbumIds;
        }
        pageOptions = await applyDeletedAlbumExclusions(pageOptions);
        let library = await readLibraryAlbumPage(libraryDatabasePath, pageOptions);
        if (library.albumCount === 0 && library.trackCount === 0) {
          library = createPagedLibrary(await getCurrentLibrary(), pageOptions);
        }
        primeTrackMap(library.tracks);
        return respondJson(response, 200, await createLibraryPayload(library));
      }
      return respondJson(response, 200, await createLibraryPayload(await getCurrentLibrary()));
    }

    if (url.pathname === '/api/wishlist-albums' || url.pathname === '/api/wanted-albums') {
      const search = url.searchParams.get('search');
      const { scannedAlbumIds, manualAlbums } = await getWishlistAlbumSources();
      const visibleManualAlbums = filterManualAlbumsBySearch(manualAlbums, search);
      const library = await readLibraryAlbumPage(libraryDatabasePath, await applyDeletedAlbumExclusions({
        limit: url.searchParams.get('limit'),
        offset: url.searchParams.get('offset'),
        search,
        albumIds: scannedAlbumIds,
        includeTracks: false,
        includeCoverTracks: true,
      }));
      if (visibleManualAlbums.length > 0) {
        library.albums = [...visibleManualAlbums, ...library.albums];
        library.albumCount += visibleManualAlbums.length;
        if (library.page) {
          library.page.total += visibleManualAlbums.length;
        }
      }
      primeTrackMap(library.tracks);
      return respondJson(response, 200, await createLibraryPayload(library));
    }

    if (url.pathname === '/api/collections') {
      if (request.method !== 'GET') {
        return respondJson(response, 405, { error: 'Method not allowed' });
      }
      return respondJson(response, 200, await createCollectionOptionsPayload({
        search: url.searchParams.get('search'),
        folders: getFolderFilterParams(url),
      }));
    }

    if (url.pathname === '/api/collections/rename') {
      if (request.method !== 'POST') {
        return respondJson(response, 405, { error: 'Method not allowed' });
      }
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      assertPrivilegedMutation(request, authUser, { requireAdmin: true });
      return respondJson(response, 200, await renameCollectionName(request));
    }

    if (url.pathname === '/api/collections/delete') {
      if (request.method !== 'POST') {
        return respondJson(response, 405, { error: 'Method not allowed' });
      }
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      assertPrivilegedMutation(request, authUser, { requireAdmin: true });
      return respondJson(response, 200, await deleteCollectionName(request));
    }

    if (url.pathname === '/api/collections/cover') {
      if (request.method !== 'POST') {
        return respondJson(response, 405, { error: 'Method not allowed' });
      }
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      assertPrivilegedMutation(request, authUser, { requireAdmin: true });
      return respondJson(response, 200, await updateCollectionCoverOverride(request));
    }

    if (url.pathname === '/api/collections-albums') {
      let pageOptions = {
        limit: url.searchParams.get('limit'),
        offset: url.searchParams.get('offset'),
        search: url.searchParams.get('search'),
        letter: url.searchParams.get('letter'),
        folders: getFolderFilterParams(url),
        includeTracks: false,
        includeCoverTracks: true,
      };
      const collectionPath = url.searchParams.get('path');
      if (!collectionPath) {
        return respondJson(response, 200, await createCollectionFoldersPayload(pageOptions));
      }
      const collectionSources = await getCollectionAlbumSources(collectionPath);
      const mediaTypeAlbumFilter = await getAlbumIdFilterForMediaTypes(url.searchParams.get('mediaTypes'));
      if (mediaTypeAlbumFilter?.albumIds) {
        pageOptions.albumIds = mediaTypeAlbumFilter.albumIds;
      }
      if (mediaTypeAlbumFilter?.excludeAlbumIds) {
        pageOptions.excludeAlbumIds = mediaTypeAlbumFilter.excludeAlbumIds;
      }
      pageOptions.includeAlbumIds = collectionSources.scannedAlbumIds;
      pageOptions.excludeAlbumIds = [
        ...(pageOptions.excludeAlbumIds || []),
        ...collectionSources.excludeAlbumIds,
      ];
      pageOptions = await applyDeletedAlbumExclusions(pageOptions);
      const library = await readCollectionFolderAlbumPage(libraryDatabasePath, collectionPath, pageOptions);
      const visibleManualAlbums = pageOptions.folders?.length > 0
        ? []
        : filterManualAlbumsBySearch(collectionSources.manualAlbums, pageOptions.search);
      if (visibleManualAlbums.length > 0) {
        library.albums = [...visibleManualAlbums, ...library.albums].sort(compareAlbumsNaturally);
        library.albumCount += visibleManualAlbums.length;
        if (library.page) {
          library.page.total += visibleManualAlbums.length;
        }
      }
      primeTrackMap(library.tracks);
      return respondJson(response, 200, await createLibraryPayload(library));
    }

    if (url.pathname === '/api/home-albums') {
      const cacheKey = createHomeAlbumCacheKey(url);
      const cachedPayload = homeAlbumPageCache.get(cacheKey);
      if (cachedPayload) {
        return respondJson(response, 200, cachedPayload);
      }
      const mediaTypeAlbumFilter = await getAlbumIdFilterForMediaTypes(url.searchParams.get('mediaTypes'));
      let homeAlbumOptions = {
        limit: url.searchParams.get('limit') || 50,
        folders: getFolderFilterParams(url),
        albumIds: mediaTypeAlbumFilter?.albumIds,
        excludeAlbumIds: mediaTypeAlbumFilter?.excludeAlbumIds,
      };
      homeAlbumOptions = await applyDeletedAlbumExclusions(homeAlbumOptions);
      const library = await readRandomAlbumPage(libraryDatabasePath, homeAlbumOptions);
      primeTrackMap(library.tracks);
      const payload = await createLibraryPayload(library);
      setHomeAlbumCache(cacheKey, payload);
      return respondJson(response, 200, payload);
    }

    if (url.pathname === '/api/tracks') {
      const trackIds = url.searchParams.get('ids')
        ? url.searchParams.get('ids').split(',').map((id) => id.trim()).filter(Boolean)
        : [];
      const library = await readTrackPage(libraryDatabasePath, await applyDeletedAlbumExclusions({
        limit: url.searchParams.get('limit'),
        offset: url.searchParams.get('offset'),
        search: url.searchParams.get('search'),
        letter: url.searchParams.get('letter'),
        trackIds,
        folders: getFolderFilterParams(url),
      }));
      primeTrackMap(library.tracks);
      return respondJson(response, 200, await createLibraryPayload(library));
    }

    const albumTracksMatch = /^\/api\/albums\/([^/]+)\/tracks$/u.exec(url.pathname);
    if (albumTracksMatch && request.method === 'GET') {
      const albumId = decodeURIComponent(albumTracksMatch[1]);
      const library = await readLibraryAlbumPage(libraryDatabasePath, await applyDeletedAlbumExclusions({
        albumIds: [albumId],
      }));
      primeTrackMap(library.tracks);
      return respondJson(response, 200, await createLibraryPayload(library));
    }

    if (url.pathname === '/api/folders') {
      const listing = await readFolderListing(libraryDatabasePath, url.searchParams.get('path') || '', {
        search: url.searchParams.get('search') || '',
        rootFolders: getFolderFilterParams(url),
      });
      primeTrackMap(listing.tracks);
      return respondJson(response, 200, {
        ...listing,
        tracks: (await createLibraryPayload({
          generatedAt: null,
          trackCount: listing.tracks.length,
          albumCount: 0,
          albums: [],
          tracks: listing.tracks,
        })).tracks,
      });
    }

    if (url.pathname === '/api/folders/playqueue') {
      const library = await readFolderLibrary(libraryDatabasePath, url.searchParams.get('path') || '', {
        search: url.searchParams.get('search') || '',
      });
      primeTrackMap(library.tracks);
      return respondJson(response, 200, await createLibraryPayload(library));
    }

    if (url.pathname === '/api/artists') {
      return respondJson(response, 200, await readArtistPage(libraryDatabasePath, {
        limit: url.searchParams.get('limit'),
        offset: url.searchParams.get('offset'),
        search: url.searchParams.get('search'),
        letter: url.searchParams.get('letter'),
        folders: getFolderFilterParams(url),
      }));
    }

    const artistLibraryMatch = /^\/api\/artists\/([^/]+)\/library$/u.exec(url.pathname);
    if (artistLibraryMatch) {
      const artistName = decodeURIComponent(artistLibraryMatch[1]);
      const library = await readArtistLibrary(libraryDatabasePath, artistName, {
        folders: getFolderFilterParams(url),
      });
      primeTrackMap(library.tracks);
      return respondJson(response, 200, await createLibraryPayload(library));
    }

    if (url.pathname === '/api/rescan' && request.method === 'POST') {
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      assertPrivilegedMutation(request, authUser, { requireAdmin: true });
      const scan = await startLibraryScan();
      return respondJson(response, 202, { scan });
    }

    if (url.pathname === '/api/library/folders') {
      if (request.method === 'POST') {
        if (!isAdminUser(authUser)) {
          return respondJson(response, 403, { error: 'Admin access required.' });
        }
        assertPrivilegedMutation(request, authUser, { requireAdmin: true });
        const result = await updateSelectedLibraryFolders(request);
        return respondJson(response, 200, result);
      }
      return respondJson(response, 200, await getLibraryFoldersPayload());
    }

    const artistInfoMatch = /^\/api\/artists\/([^/]+)\/info$/u.exec(url.pathname);
    if (artistInfoMatch) {
      const artistName = decodeURIComponent(artistInfoMatch[1]);
      if (request.method === 'POST') {
        assertPrivilegedMutation(request, authUser, { requireAdmin: true });
        const artistInfo = await updateArtistInfo(artistName, request);
        return respondJson(response, 200, artistInfo);
      }
      const artistInfo = await getArtistInfo(artistName);
      return respondJson(response, 200, artistInfo);
    }

    const uploadedCoverMatch = /^\/api\/uploaded-covers\/([^/]+)$/u.exec(url.pathname);
    if (uploadedCoverMatch && request.method === 'GET') {
      return streamUploadedCover(response, decodeURIComponent(uploadedCoverMatch[1]));
    }

    const albumCoverMatch = /^\/api\/albums\/([^/]+)\/cover$/u.exec(url.pathname);
    if (albumCoverMatch && request.method === 'GET') {
      return streamAlbumCover(response, decodeURIComponent(albumCoverMatch[1]), url);
    }
    if (albumCoverMatch && request.method === 'POST') {
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      assertPrivilegedMutation(request, authUser, { requireAdmin: true });
      const albumId = decodeURIComponent(albumCoverMatch[1]);
      const result = await updateAlbumCoverOverride(albumId, request);
      const library = await ensureLibrary();
      return respondJson(response, 200, {
        ...result,
        library: await createLibraryPayload(library),
      });
    }

    const albumTagsMatch = /^\/api\/albums\/([^/]+)\/tags$/u.exec(url.pathname);
    if (albumTagsMatch && request.method === 'POST') {
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      assertPrivilegedMutation(request, authUser, { requireAdmin: true });
      const albumId = decodeURIComponent(albumTagsMatch[1]);
      const result = await updateAlbumTagOverride(albumId, request);
      const library = result.manual
        ? await createManualWishlistLibrary()
        : await ensureLibrary();
      return respondJson(response, 200, {
        ...result,
        library: await createLibraryPayload(library),
      });
    }
    if (albumTagsMatch && request.method === 'DELETE') {
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      assertPrivilegedMutation(request, authUser, { requireAdmin: true });
      const albumId = decodeURIComponent(albumTagsMatch[1]);
      const result = await deleteAlbumFromLibrary(albumId);
      const library = result.manual ? await createManualWishlistLibrary() : await ensureLibrary();
      return respondJson(response, 200, {
        ...result,
        library: await createLibraryPayload(library),
      });
    }

    if (url.pathname === '/api/albums' && request.method === 'POST') {
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      assertPrivilegedMutation(request, authUser, { requireAdmin: true });
      const result = await createManualAlbum(request);
      return respondJson(response, 201, result);
    }

    if (url.pathname === '/api/tag-suggestions' && request.method === 'GET') {
      const suggestions = await searchMusicBrainzTagSuggestions(url);
      return respondJson(response, 200, suggestions);
    }

    const albumSuggestionsMatch = /^\/api\/albums\/([^/]+)\/tag-suggestions$/u.exec(url.pathname);
    if (albumSuggestionsMatch && request.method === 'GET') {
      const albumId = decodeURIComponent(albumSuggestionsMatch[1]);
      const suggestions = await searchAlbumTagSuggestions(albumId, url);
      return respondJson(response, 200, suggestions);
    }

    const musicBrainzReleaseMatch = /^\/api\/musicbrainz\/releases\/([^/]+)$/u.exec(url.pathname);
    if (musicBrainzReleaseMatch && request.method === 'GET') {
      const releaseId = decodeURIComponent(musicBrainzReleaseMatch[1]);
      const suggestion = await fetchMusicBrainzReleaseSuggestion(releaseId);
      return respondJson(response, 200, suggestion);
    }

    const streamMatch = /^\/api\/tracks\/([^/]+)\/stream$/u.exec(url.pathname);
    if (streamMatch) {
      return streamTrack(response, decodeURIComponent(streamMatch[1]), request.headers.range);
    }

    const downloadMatch = /^\/api\/tracks\/([^/]+)\/download$/u.exec(url.pathname);
    if (downloadMatch) {
      if (request.method !== 'POST') {
        return respondJson(response, 405, { error: 'Method Not Allowed' });
      }
      if (!canUserDownload(authUser)) {
        return respondJson(response, 403, { error: 'Downloads are disabled for this account.' });
      }
      assertPrivilegedMutation(request, authUser);
      enforceDownloadRateLimit(request, authUser);
      return downloadTrack(response, request, decodeURIComponent(downloadMatch[1]));
    }

    if (url.pathname === '/api/downloads/bulk' && request.method === 'POST') {
      if (!canUserDownload(authUser)) {
        return respondJson(response, 403, { error: 'Downloads are disabled for this account.' });
      }
      assertPrivilegedMutation(request, authUser);
      enforceDownloadRateLimit(request, authUser);
      return downloadBulkTracks(response, request);
    }

    const lyricsMatch = /^\/api\/tracks\/([^/]+)\/lyrics$/u.exec(url.pathname);
    if (lyricsMatch) {
      const trackId = decodeURIComponent(lyricsMatch[1]);
      if (request.method === 'POST') {
        assertPrivilegedMutation(request, authUser, { requireAdmin: true });
        const lyrics = await updateTrackLyrics(trackId, request);
        return respondJson(response, 200, lyrics);
      }
      const lyrics = await getTrackLyrics(trackId);
      return respondJson(response, 200, lyrics);
    }

    const lyricsSuggestionsMatch = /^\/api\/tracks\/([^/]+)\/lyrics-suggestions$/u.exec(url.pathname);
    if (lyricsSuggestionsMatch && request.method === 'GET') {
      const trackId = decodeURIComponent(lyricsSuggestionsMatch[1]);
      const suggestions = await searchTrackLyrics(trackId, url);
      return respondJson(response, 200, suggestions);
    }

    const coverMatch = /^\/api\/tracks\/([^/]+)\/cover$/u.exec(url.pathname);
    if (coverMatch) {
      return streamCover(response, decodeURIComponent(coverMatch[1]), url);
    }

    if (url.pathname.startsWith('/api/')) {
      return respondJson(response, 404, { error: 'Not found' });
    }

    return serveStaticAsset(url.pathname, response);
  } catch (error) {
    console.error(error);
    if (error instanceof HttpError) {
      return respondJson(response, error.statusCode, { error: error.message });
    }
    return respondJson(response, 500, {
      error: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
});

server.listen(config.port, config.host, () => {
  console.log(`Monochrome-Streamer ready at http://${config.host}:${config.port}`);
  console.log(`Streaming from: ${libraryRoot}`);
  if (config.autoScanOnStart) {
    startLibraryScan();
  } else {
    console.log('Automatic startup scan is disabled. Open the Admin sidebar tab, then System, select folders, and scan.');
  }
});

async function loadConfig() {
  const fileConfig = existsSync(configPath)
    ? JSON.parse(await fs.readFile(configPath, 'utf8'))
    : {};
  const dataDir = process.env.DATA_DIR || fileConfig.dataDir || defaultConfig.dataDir;
  const dataPath = (filename) => (dataDir ? path.join(dataDir, filename) : filename);

  return {
    ...defaultConfig,
    ...fileConfig,
    dataDir,
    title: process.env.APP_TITLE || fileConfig.title || defaultConfig.title,
    libraryPath: process.env.MUSIC_LIBRARY_PATH || fileConfig.libraryPath || defaultConfig.libraryPath,
    artistInfoPath: process.env.ARTIST_INFO_PATH || fileConfig.artistInfoPath || defaultConfig.artistInfoPath,
    artistOverridesPath: process.env.ARTIST_OVERRIDES_PATH || fileConfig.artistOverridesPath || dataPath(defaultConfig.artistOverridesPath),
    albumOverridesPath: process.env.ALBUM_OVERRIDES_PATH || fileConfig.albumOverridesPath || dataPath(defaultConfig.albumOverridesPath),
    lyricsOverridesPath: process.env.LYRICS_OVERRIDES_PATH || fileConfig.lyricsOverridesPath || dataPath(defaultConfig.lyricsOverridesPath),
    lyricsSidecarPath: process.env.LYRICS_SIDECAR_PATH || fileConfig.lyricsSidecarPath || dataPath(defaultConfig.lyricsSidecarPath),
    libraryFoldersPath: process.env.LIBRARY_FOLDERS_PATH || fileConfig.libraryFoldersPath || dataPath(defaultConfig.libraryFoldersPath),
    libraryCachePath: process.env.LIBRARY_CACHE_PATH || fileConfig.libraryCachePath || dataPath('library-cache.json'),
    libraryDatabasePath: process.env.LIBRARY_DATABASE_PATH || fileConfig.libraryDatabasePath || dataPath(defaultConfig.libraryDatabasePath),
    coverCachePath: process.env.COVER_CACHE_PATH || fileConfig.coverCachePath || dataPath(defaultConfig.coverCachePath),
    widgetSettingsPath: process.env.WIDGET_SETTINGS_PATH || fileConfig.widgetSettingsPath || dataPath(defaultConfig.widgetSettingsPath),
    authUsersPath: process.env.AUTH_USERS_PATH || fileConfig.authUsersPath || dataPath(defaultConfig.authUsersPath),
    scanMetadata: normalizeScanMetadata(process.env.SCAN_METADATA || fileConfig.scanMetadata || defaultConfig.scanMetadata),
    scanDurations: parseBoolean(process.env.SCAN_DURATIONS ?? fileConfig.scanDurations ?? defaultConfig.scanDurations),
    autoScanOnStart: parseBoolean(process.env.AUTO_SCAN_ON_START ?? fileConfig.autoScanOnStart ?? defaultConfig.autoScanOnStart),
    noAuth: parseBoolean(process.env.NOAUTH ?? fileConfig.noAuth ?? defaultConfig.noAuth),
    anonymousDownloadsEnabled: parseBoolean(process.env.DOWNLOADS ?? fileConfig.anonymousDownloadsEnabled ?? defaultConfig.anonymousDownloadsEnabled),
    adminUsername: process.env.ADMIN_USERNAME || fileConfig.adminUsername || defaultConfig.adminUsername,
    adminPassword: process.env.ADMIN_PASSWORD || fileConfig.adminPassword || defaultConfig.adminPassword,
    widgetApiKey: process.env.WIDGET_API_KEY || fileConfig.widgetApiKey || defaultConfig.widgetApiKey,
    widgetCorsOrigin: process.env.WIDGET_CORS_ORIGIN || fileConfig.widgetCorsOrigin || defaultConfig.widgetCorsOrigin,
    trustProxy: parseBoolean(process.env.TRUST_PROXY ?? fileConfig.trustProxy ?? defaultConfig.trustProxy),
    requireHttpsForAuth: parseBoolean(process.env.REQUIRE_HTTPS_FOR_AUTH ?? fileConfig.requireHttpsForAuth ?? defaultConfig.requireHttpsForAuth),
    maxConcurrentMp3Downloads: Math.max(
      1,
      Number.parseInt(
        process.env.MAX_CONCURRENT_MP3_DOWNLOADS
        || fileConfig.maxConcurrentMp3Downloads
        || defaultConfig.maxConcurrentMp3Downloads,
        10,
      ) || DEFAULT_MAX_CONCURRENT_MP3_DOWNLOADS,
    ),
    host: process.env.HOST || fileConfig.host || defaultConfig.host,
    port: Number.parseInt(process.env.PORT || fileConfig.port || defaultConfig.port, 10),
  };
}

function validateAdminConfiguration(currentConfig) {
  if (!currentConfig) return;
  if (!isWeakAdminCredentials(currentConfig.adminUsername, currentConfig.adminPassword)) return;
  console.warn(
    'Warning: admin credentials are weak or default. The server will start, but internet-facing deployments should use a stronger ADMIN_USERNAME and ADMIN_PASSWORD pair.',
  );
}

async function loadEnvironmentFile(filePath) {
  if (!filePath || !existsSync(filePath)) return;

  const contents = await fs.readFile(filePath, 'utf8');
  for (const rawLine of contents.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const match = /^(?:export\s+)?([A-Z_][A-Z0-9_]*)=(.*)$/iu.exec(line);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] != null) continue;

    process.env[key] = parseEnvironmentValue(rawValue);
  }
}

function parseEnvironmentValue(rawValue) {
  const value = String(rawValue || '').trim();
  if (value.length < 2) return value;

  const quote = value[0];
  if ((quote !== '"' && quote !== "'") || value[value.length - 1] !== quote) {
    return value;
  }

  const unquoted = value.slice(1, -1);
  if (quote === "'") return unquoted;

  return unquoted
    .replaceAll('\\n', '\n')
    .replaceAll('\\r', '\r')
    .replaceAll('\\t', '\t')
    .replaceAll('\\"', '"')
    .replaceAll('\\\\', '\\');
}

function createGuestUser() {
  return {
    username: 'Guest',
    role: 'guest',
    downloadsEnabled: false,
    authDisabled: true,
    csrfToken: '',
  };
}

function shouldRequireSecureAuth() {
  return config.requireHttpsForAuth === true;
}

function isSecureRequest(request) {
  if (request.socket?.encrypted) return true;
  if (!config.trustProxy) return false;
  const forwardedProto = String(request.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  return forwardedProto === 'https';
}

function getRequestOrigin(request) {
  const host = String(request.headers.host || `${config.host}:${config.port}`).trim();
  const protocol = isSecureRequest(request) ? 'https' : 'http';
  return `${protocol}://${host}`;
}

function getRequestClientIp(request) {
  if (config.trustProxy) {
    const forwardedFor = String(request.headers['x-forwarded-for'] || '')
      .split(',')[0]
      .trim();
    if (forwardedFor) return forwardedFor;
  }
  return request.socket?.remoteAddress || 'unknown';
}

function assertSecureAuthRequest(request) {
  if (!shouldRequireSecureAuth() || isSecureRequest(request)) return;
  throw new HttpError(403, 'Secure HTTPS is required for login and authenticated actions.');
}

async function getSessionUser(request) {
  if (shouldRequireSecureAuth() && !isSecureRequest(request)) return null;
  const token = getSessionToken(request);
  if (!token) return null;

  const session = sessions.get(token);
  const activeSession = refreshSessionRecord(session, Date.now());
  if (!activeSession) {
    sessions.delete(token);
    return null;
  }

  if (activeSession.role === 'admin') {
    return {
      username: config.adminUsername,
      role: 'admin',
      downloadsEnabled: true,
      csrfToken: activeSession.csrfToken,
    };
  }

  const store = await readAuthStore();
  const user = store.users.find((candidate) => candidate.username === activeSession.username);
  if (!user) {
    sessions.delete(token);
    return null;
  }

  return {
    username: user.username,
    role: 'user',
    downloadsEnabled: user.downloadsEnabled !== false,
    csrfToken: activeSession.csrfToken,
  };
}

async function getAuthenticatedUser(request) {
  const sessionUser = await getSessionUser(request);
  if (sessionUser) return sessionUser;
  if (config.noAuth) return createGuestUser();
  return null;
}

async function handleLogin(request, response, url) {
  assertSecureAuthRequest(request);
  const body = await readRequestPayload(request, 64 * 1024);
  const username = cleanText(body.username);
  const password = String(body.password || '');
  enforceLoginRateLimit(request, username);
  const user = await authenticateUser(username, password);
  const next = cleanRedirectPath(body.next || url.searchParams.get('next') || '/');

  if (!user) {
    registerFailedLogin(request, username);
    return redirect(response, getLoginAppRedirectPath(next, { error: 'invalid' }), 303);
  }

  clearLoginAttempts(request, username);
  const token = createSession(user);
  response.writeHead(303, {
    Location: next,
    'Set-Cookie': createSessionCookie(token, request),
    'Cache-Control': 'no-store',
    ...getSecurityHeaders(),
  });
  response.end();
}

async function authenticateUser(username, password) {
  if (username === config.adminUsername && timingSafeTextEqual(password, config.adminPassword)) {
    return {
      username: config.adminUsername,
      role: 'admin',
      downloadsEnabled: true,
    };
  }

  const normalizedUsername = normalizeUsername(username);
  const store = await readAuthStore();
  const user = store.users.find((candidate) => candidate.username === normalizedUsername);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return {
    username: user.username,
    role: 'user',
    downloadsEnabled: user.downloadsEnabled !== false,
  };
}

function createSession(user) {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, createSessionRecord({
    username: user.username,
    role: user.role,
  }));
  return token;
}

function createPublicUser(user) {
  return {
    username: user.username,
    role: user.role,
    canDownload: canUserDownload(user),
    authDisabled: user.authDisabled === true,
  };
}

function isAdminUser(user) {
  return user?.role === 'admin';
}

function canUserDownload(user) {
  if (user?.role === 'guest') return false;
  return isAdminUser(user) || user?.downloadsEnabled !== false;
}

function getCsrfTokenForUser(user) {
  return user?.csrfToken || '';
}

function enforceLoginRateLimit(request, username) {
  const key = `${getRequestClientIp(request)}:${normalizeUsername(username) || 'unknown'}`;
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry) return;
  if (entry.blockedUntil && entry.blockedUntil > now) {
    throw new HttpError(429, 'Too many failed login attempts. Try again later.');
  }
  if (entry.windowStartedAt && now - entry.windowStartedAt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(key);
  }
}

function registerFailedLogin(request, username) {
  const key = `${getRequestClientIp(request)}:${normalizeUsername(username) || 'unknown'}`;
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now - entry.windowStartedAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, {
      failures: 1,
      windowStartedAt: now,
      blockedUntil: 0,
    });
    return;
  }
  entry.failures += 1;
  if (entry.failures >= LOGIN_MAX_FAILURES) {
    entry.blockedUntil = now + LOGIN_LOCKOUT_MS;
  }
}

function clearLoginAttempts(request, username) {
  const key = `${getRequestClientIp(request)}:${normalizeUsername(username) || 'unknown'}`;
  loginAttempts.delete(key);
}

function requireSessionUser(user) {
  if (!user || user.role === 'guest') {
    throw new HttpError(401, 'Login required.');
  }
}

function assertSameOriginRequest(request) {
  const expectedOrigin = getRequestOrigin(request);
  const origin = String(request.headers.origin || '').trim();
  if (origin) {
    if (origin !== expectedOrigin) {
      throw new HttpError(403, 'Origin check failed.');
    }
    return;
  }

  const referer = String(request.headers.referer || '').trim();
  if (!referer) {
    throw new HttpError(403, 'Origin check failed.');
  }

  try {
    const refererOrigin = new URL(referer).origin;
    if (refererOrigin !== expectedOrigin) {
      throw new HttpError(403, 'Origin check failed.');
    }
  } catch {
    throw new HttpError(403, 'Origin check failed.');
  }
}

function assertCsrfToken(request, user) {
  const providedToken = String(
    request.headers['x-csrf-token']
    || request.headers['x-monochrome-csrf-token']
    || '',
  ).trim();
  if (!providedToken || !timingSafeStringEqual(providedToken, getCsrfTokenForUser(user))) {
    throw new HttpError(403, 'CSRF token is missing or invalid.');
  }
}

function assertPrivilegedMutation(request, user, { requireAdmin = false } = {}) {
  if (!isStateChangingMethod(request.method)) return;
  assertSecureAuthRequest(request);
  requireSessionUser(user);
  if (requireAdmin && !isAdminUser(user)) {
    throw new HttpError(403, 'Admin access required.');
  }
  assertSameOriginRequest(request);
  assertCsrfToken(request, user);
}

function isStateChangingMethod(method) {
  return method === 'POST' || method === 'PATCH' || method === 'DELETE' || method === 'PUT';
}

function enforceDownloadRateLimit(request, user) {
  if (!user || user.role === 'guest') {
    throw new HttpError(403, 'Downloads are disabled for this account.');
  }
  const key = `${user.role}:${user.username}:${getSessionToken(request)}`;
  const now = Date.now();
  const entry = downloadAttempts.get(key);
  if (!entry || now - entry.windowStartedAt > DOWNLOAD_WINDOW_MS) {
    downloadAttempts.set(key, {
      count: 1,
      windowStartedAt: now,
    });
    return;
  }
  entry.count += 1;
  if (entry.count > DOWNLOAD_MAX_REQUESTS) {
    throw new HttpError(429, 'Too many download requests. Please wait a moment and try again.');
  }
}

function acquireMp3DownloadSlot() {
  if (activeMp3DownloadRequests >= config.maxConcurrentMp3Downloads) {
    throw new HttpError(429, 'Too many MP3 conversions are already running. Please try again soon.');
  }
  activeMp3DownloadRequests += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeMp3DownloadRequests = Math.max(0, activeMp3DownloadRequests - 1);
  };
}

async function handleAdminApi(request, response, url) {
  if (url.pathname === '/api/admin/users') {
    if (request.method === 'GET') {
      return respondJson(response, 200, await getAdminUsersPayload());
    }
    if (request.method === 'POST') {
      return respondJson(response, 200, await createManagedUser(request));
    }
  }

  const userMatch = /^\/api\/admin\/users\/([^/]+)$/u.exec(url.pathname);
  if (userMatch) {
    const username = decodeURIComponent(userMatch[1]);
    if (request.method === 'PATCH') {
      return respondJson(response, 200, await updateManagedUser(username, request));
    }
    if (request.method === 'DELETE') {
      return respondJson(response, 200, await deleteManagedUser(username));
    }
  }

  if (url.pathname === '/api/admin/download-settings') {
    if (request.method === 'GET') {
      return respondJson(response, 200, await getDownloadSettings());
    }
    if (request.method === 'POST') {
      return respondJson(response, 200, await updateDownloadSettings(request));
    }
  }

  if (url.pathname === '/api/admin/database/export') {
    if (request.method === 'POST') {
      return exportDatabaseBackup(response);
    }
    return respondJson(response, 405, { error: 'Method Not Allowed' });
  }

  if (url.pathname === '/api/admin/database/export-excel' && request.method === 'POST') {
    return exportExcelDatabaseReport(request, response);
  }

  if (url.pathname === '/api/admin/database/import' && request.method === 'POST') {
    return respondJson(response, 200, await importDatabaseBackup(request));
  }

  return respondJson(response, 404, { error: 'Not found' });
}

async function getAdminUsersPayload() {
  const store = await readAuthStore();
  return {
    admin: {
      username: config.adminUsername,
      role: 'admin',
      downloadsEnabled: true,
      source: 'environment',
    },
    users: store.users.map((user) => ({
      username: user.username,
      role: 'user',
      downloadsEnabled: user.downloadsEnabled !== false,
      createdAt: user.createdAt || '',
    })),
  };
}

async function createManagedUser(request) {
  const payload = await readRequestJson(request, 64 * 1024);
  const username = normalizeUsername(payload.username);
  const password = String(payload.password || '');
  if (!username) throw new HttpError(400, 'Username is required.');
  if (username === config.adminUsername) throw new HttpError(400, 'That username is reserved for the environment admin.');
  if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters.');

  const store = await readAuthStore();
  const existing = store.users.find((user) => user.username === username);
  const user = existing || {
    username,
    createdAt: new Date().toISOString(),
  };
  user.passwordHash = hashPassword(password);
  user.downloadsEnabled = payload.downloadsEnabled !== false;
  if (!existing) store.users.push(user);
  await writeAuthStore(store);
  return getAdminUsersPayload();
}

async function updateManagedUser(username, request) {
  const normalizedUsername = normalizeUsername(username);
  const payload = await readRequestJson(request, 64 * 1024);
  const store = await readAuthStore();
  const user = store.users.find((candidate) => candidate.username === normalizedUsername);
  if (!user) throw new HttpError(404, 'User not found.');

  if (typeof payload.downloadsEnabled === 'boolean') {
    user.downloadsEnabled = payload.downloadsEnabled;
  }
  if (payload.password) {
    const password = String(payload.password || '');
    if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters.');
    user.passwordHash = hashPassword(password);
  }
  await writeAuthStore(store);
  return getAdminUsersPayload();
}

async function deleteManagedUser(username) {
  const normalizedUsername = normalizeUsername(username);
  const store = await readAuthStore();
  store.users = store.users.filter((user) => user.username !== normalizedUsername);
  await writeAuthStore(store);
  for (const [token, session] of sessions.entries()) {
    if (session.username === normalizedUsername) sessions.delete(token);
  }
  await deletePlaylistsForOwner(libraryDatabasePath, `user:${normalizedUsername}`);
  return getAdminUsersPayload();
}

async function handlePlaylistsCollectionApi(request, response, authUser) {
  const ownerKey = requirePlaylistOwner(authUser);
  if (request.method === 'GET') {
    return respondJson(response, 200, {
      playlists: await readPlaylists(libraryDatabasePath, ownerKey),
    });
  }
  if (request.method === 'POST') {
    assertPrivilegedMutation(request, authUser);
    const payload = await readRequestJson(request, 64 * 1024);
    try {
      const playlist = await createPlaylist(
        libraryDatabasePath,
        ownerKey,
        `playlist-${randomBytes(16).toString('hex')}`,
        payload.name,
      );
      return respondJson(response, 201, { playlist });
    } catch (error) {
      throw mapPlaylistDatabaseError(error);
    }
  }
  return respondJson(response, 405, { error: 'Method Not Allowed' });
}

async function handlePlaylistApi(request, response, authUser, playlistId) {
  const ownerKey = requirePlaylistOwner(authUser);
  if (request.method === 'GET') {
    const playlist = await getPlaylistPayload(ownerKey, playlistId);
    if (!playlist) throw new HttpError(404, 'Playlist not found.');
    return respondJson(response, 200, { playlist });
  }
  if (request.method === 'DELETE') {
    assertPrivilegedMutation(request, authUser);
    const deleted = await deletePlaylist(libraryDatabasePath, ownerKey, playlistId);
    if (!deleted) throw new HttpError(404, 'Playlist not found.');
    return respondJson(response, 200, { deleted: true });
  }
  return respondJson(response, 405, { error: 'Method Not Allowed' });
}

async function handlePlaylistTracksApi(request, response, authUser, playlistId) {
  const ownerKey = requirePlaylistOwner(authUser);
  if (request.method !== 'POST') {
    return respondJson(response, 405, { error: 'Method Not Allowed' });
  }
  assertPrivilegedMutation(request, authUser);
  const payload = await readRequestJson(request, 64 * 1024);
  try {
    const result = await addPlaylistTrack(
      libraryDatabasePath,
      ownerKey,
      playlistId,
      String(payload.trackId || ''),
    );
    return respondJson(response, 200, {
      added: result.added,
      playlist: await createPlaylistPayload(result.playlist),
    });
  } catch (error) {
    throw mapPlaylistDatabaseError(error);
  }
}

async function handlePlaylistTrackApi(request, response, authUser, playlistId, trackId) {
  const ownerKey = requirePlaylistOwner(authUser);
  if (request.method !== 'DELETE') {
    return respondJson(response, 405, { error: 'Method Not Allowed' });
  }
  assertPrivilegedMutation(request, authUser);
  try {
    const result = await removePlaylistTrack(
      libraryDatabasePath,
      ownerKey,
      playlistId,
      trackId,
    );
    return respondJson(response, 200, {
      removed: result.removed,
      playlist: await createPlaylistPayload(result.playlist),
    });
  } catch (error) {
    throw mapPlaylistDatabaseError(error);
  }
}

function requirePlaylistOwner(authUser) {
  if (!authUser || authUser.role === 'guest') {
    throw new HttpError(403, 'Sign in to use playlists.');
  }
  if (authUser.role === 'admin') return 'admin';
  const username = normalizeUsername(authUser.username);
  if (!username) throw new HttpError(403, 'Sign in to use playlists.');
  return `user:${username}`;
}

async function getPlaylistPayload(ownerKey, playlistId) {
  const playlist = await readPlaylist(libraryDatabasePath, ownerKey, playlistId);
  return createPlaylistPayload(playlist);
}

async function createPlaylistPayload(playlist) {
  if (!playlist) return null;
  const orderedIds = playlist.tracks.map((track) => track.id);
  if (orderedIds.length === 0) return { ...playlist, tracks: [] };
  const library = await readTrackPage(libraryDatabasePath, { trackIds: orderedIds });
  primeTrackMap(library.tracks);
  const payload = await createLibraryPayload(library);
  const trackMapById = new Map(payload.tracks.map((track) => [track.id, track]));
  return {
    ...playlist,
    tracks: orderedIds.map((trackId) => trackMapById.get(trackId)).filter(Boolean),
  };
}

function mapPlaylistDatabaseError(error) {
  const statusByCode = {
    PLAYLIST_NAME_REQUIRED: 400,
    PLAYLIST_NAME_TOO_LONG: 400,
    PLAYLIST_INVALID: 400,
    PLAYLIST_NAME_EXISTS: 409,
    PLAYLIST_NOT_FOUND: 404,
    TRACK_NOT_FOUND: 404,
  };
  const statusCode = statusByCode[error?.code];
  return statusCode ? new HttpError(statusCode, error.message) : error;
}

async function getDownloadSettings() {
  const store = await readAuthStore();
  return normalizeDownloadSettings(store.downloadSettings);
}

async function updateDownloadSettings(request) {
  const payload = await readRequestJson(request, 64 * 1024);
  const store = await readAuthStore();
  store.downloadSettings = normalizeDownloadSettings(payload);
  await writeAuthStore(store);
  return store.downloadSettings;
}

async function exportDatabaseBackup(response) {
  if (!libraryDatabasePath) {
    throw new HttpError(400, 'Library database is not configured.');
  }
  if (!existsSync(libraryDatabasePath)) {
    throw new HttpError(404, 'Library database has not been created yet.');
  }

  const timestamp = createDatabaseTimestamp();
  const snapshotPath = path.join(path.dirname(libraryDatabasePath), `database-export-${timestamp}-${randomBytes(4).toString('hex')}.sqlite`);
  const snapshot = await exportLibraryDatabaseSnapshot(libraryDatabasePath, snapshotPath);
  const filename = `monochrome-streamer-database-${timestamp}.sqlite`;
  const stat = await fs.stat(snapshotPath);
  const stream = createReadStream(snapshotPath);
  stream.on('close', () => {
    fs.rm(snapshotPath, { force: true }).catch(() => {});
  });
  stream.on('error', (error) => {
    console.error(error);
    if (!response.headersSent) {
      respondJson(response, 500, { error: 'Failed to export database.' });
    } else {
      response.destroy(error);
    }
  });
  response.writeHead(200, {
    'Content-Type': 'application/vnd.sqlite3',
    'Content-Length': stat.size,
    'Content-Disposition': createContentDisposition(filename),
    'Cache-Control': 'no-store',
    'X-Library-Tracks': String(snapshot.trackCount || 0),
    'X-Library-Albums': String(snapshot.albumCount || 0),
  });
  stream.pipe(response);
}

async function exportExcelDatabaseReport(request, response) {
  if (!libraryDatabasePath) {
    throw new HttpError(400, 'Library database is not configured.');
  }
  if (!existsSync(libraryDatabasePath)) {
    throw new HttpError(404, 'Library database has not been created yet.');
  }

  const payload = await readRequestJson(request, 64 * 1024);
  const filters = {
    wishlistOnly: payload.wishlistOnly === true,
    mediaTypes: normalizeMediaTypes(payload.mediaTypes || [], { fallback: [] }),
    folders: Array.isArray(payload.folders)
      ? payload.folders.map((folder) => cleanText(folder)).filter(Boolean)
      : [],
  };
  const rows = await readExcelAlbumExportRows(libraryDatabasePath, filters);
  const timestamp = createDatabaseTimestamp();
  const workbook = await createAlbumExcelWorkbook(rows, filters);
  const filename = `monochrome-streamer-albums-${timestamp}.xlsx`;
  response.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Length': workbook.length,
    'Content-Disposition': createContentDisposition(filename),
    'Cache-Control': 'no-store',
    'X-Album-Export-Count': String(rows.length),
  });
  response.end(workbook);
}

async function createAlbumExcelWorkbook(rows, filters) {
  const headers = [
    'Album Title',
    'Album Artist',
    'Artist',
    'Year',
    'Date',
    'Genre',
    'Status',
    'Media Type',
    'Collection',
    'Tracks',
    'Folder',
    'All Folders',
    'Audio Quality',
    'Source',
    'Album ID',
  ];
  const worksheetRows = [
    headers,
    ...rows.map((row) => [
      row.title,
      row.albumArtist,
      row.artist,
      row.year,
      row.date,
      row.genre,
      row.status,
      row.mediaTypes.join(', '),
      row.collectionName,
      row.trackCount,
      row.folderPath,
      row.folderPaths,
      row.audioQuality,
      row.source,
      row.id,
    ]),
  ];
  const filterRows = [
    ['Filter', 'Value'],
    ['Wishlist only', filters.wishlistOnly ? 'Yes' : 'No'],
    ['Media types', filters.mediaTypes.length ? filters.mediaTypes.join(', ') : 'All'],
    ['Folders', filters.folders.length ? filters.folders.join(', ') : 'All'],
    ['Exported albums', rows.length],
    ['Generated at', new Date().toISOString()],
  ];

  return zipBuffersToBuffer({
    '[Content_Types].xml': createExcelContentTypesXml(),
    '_rels/.rels': createExcelRootRelsXml(),
    'xl/workbook.xml': createExcelWorkbookXml(),
    'xl/_rels/workbook.xml.rels': createExcelWorkbookRelsXml(),
    'xl/worksheets/sheet1.xml': createExcelWorksheetXml(worksheetRows, 'Albums'),
    'xl/worksheets/sheet2.xml': createExcelWorksheetXml(filterRows, 'Filters'),
    'xl/styles.xml': createExcelStylesXml(),
  });
}

function createExcelWorksheetXml(rows) {
  const sheetData = rows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const reference = `${excelColumnName(columnIndex + 1)}${rowIndex + 1}`;
      if (typeof value === 'number' && Number.isFinite(value)) {
        return `<c r="${reference}" s="${rowIndex === 0 ? 1 : 0}"><v>${value}</v></c>`;
      }
      return `<c r="${reference}" t="inlineStr" s="${rowIndex === 0 ? 1 : 0}"><is><t>${escapeXml(value)}</t></is></c>`;
    }).join('');
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="3" width="28" customWidth="1"/>
    <col min="4" max="8" width="16" customWidth="1"/>
    <col min="9" max="12" width="34" customWidth="1"/>
    <col min="13" max="15" width="22" customWidth="1"/>
  </cols>
  <sheetData>${sheetData}</sheetData>
</worksheet>`;
}

function createExcelContentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
}

function createExcelRootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

function createExcelWorkbookXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Albums" sheetId="1" r:id="rId1"/>
    <sheet name="Filters" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`;
}

function createExcelWorkbookRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function createExcelStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function excelColumnName(index) {
  let name = '';
  let number = index;
  while (number > 0) {
    const remainder = (number - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    number = Math.floor((number - 1) / 26);
  }
  return name;
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/gu, '')
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&apos;');
}

function zipBuffersToBuffer(files) {
  return new Promise((resolve, reject) => {
    const zip = new yazl.ZipFile();
    const chunks = [];
    zip.outputStream.on('data', (chunk) => chunks.push(chunk));
    zip.outputStream.on('end', () => resolve(Buffer.concat(chunks)));
    zip.outputStream.on('error', reject);
    Object.entries(files).forEach(([filename, content]) => {
      zip.addBuffer(Buffer.from(content, 'utf8'), filename);
    });
    zip.end();
  });
}

async function importDatabaseBackup(request) {
  if (!libraryDatabasePath) {
    throw new HttpError(400, 'Library database is not configured.');
  }
  if (cachePromise || scanState.status === 'scanning') {
    throw new HttpError(409, 'Wait for the current scan to finish before importing a database.');
  }

  const timestamp = createDatabaseTimestamp();
  const databaseDir = path.dirname(libraryDatabasePath);
  await fs.mkdir(databaseDir, { recursive: true });
  const importPath = path.join(databaseDir, `database-import-${timestamp}-${randomBytes(4).toString('hex')}.sqlite`);
  const maxImportBytes = 2 * 1024 * 1024 * 1024;

  try {
    const bytesWritten = await readRequestFile(request, importPath, maxImportBytes);
    if (bytesWritten === 0) {
      throw new HttpError(400, 'No database file was uploaded.');
    }

    const importedSummary = await validateLibraryDatabaseFile(importPath);
    await backupCurrentDatabaseFiles(timestamp);
    await replaceCurrentDatabase(importPath);
    invalidateDatabaseBackedCaches();
    await initializeScanStateFromStore();
    const summary = await readLibraryDatabaseSummary(libraryDatabasePath);
    return {
      imported: true,
      backupCreated: existsSync(`${libraryDatabasePath}.${timestamp}.bak`),
      trackCount: summary.trackCount || importedSummary.trackCount || 0,
      albumCount: summary.albumCount || importedSummary.albumCount || 0,
      generatedAt: summary.generatedAt || importedSummary.generatedAt || null,
    };
  } catch (error) {
    await fs.rm(importPath, { force: true }).catch(() => {});
    throw error;
  }
}

async function backupCurrentDatabaseFiles(timestamp) {
  const candidates = [
    libraryDatabasePath,
    `${libraryDatabasePath}-wal`,
    `${libraryDatabasePath}-shm`,
  ];
  await Promise.all(candidates.map(async (candidate) => {
    if (!existsSync(candidate)) return;
    await fs.copyFile(candidate, `${candidate}.${timestamp}.bak`);
  }));
}

async function replaceCurrentDatabase(importPath) {
  await fs.rm(`${libraryDatabasePath}-wal`, { force: true }).catch(() => {});
  await fs.rm(`${libraryDatabasePath}-shm`, { force: true }).catch(() => {});
  await fs.rm(libraryDatabasePath, { force: true }).catch(() => {});
  await fs.rename(importPath, libraryDatabasePath);
  await validateLibraryDatabaseFile(libraryDatabasePath);
}

function invalidateDatabaseBackedCaches() {
  invalidateLibraryMemoryCache();
  albumOverridesCache = null;
  artistOverridesCache = null;
  collectionOverridesCache = null;
  lyricsOverridesCache = null;
}

function createDatabaseTimestamp() {
  return new Date().toISOString().replace(/[:.]/gu, '-');
}

async function readAuthStore() {
  if (authStoreCache) return authStoreCache;
  const fallback = {
    users: [],
    downloadSettings: getDefaultDownloadSettings(),
  };
  if (!authUsersPath || !existsSync(authUsersPath)) {
    authStoreCache = fallback;
    return authStoreCache;
  }

  try {
    const raw = JSON.parse(await fs.readFile(authUsersPath, 'utf8'));
    const legacyDownloadSettingsMigrated = migrateLegacyDownloadSettingsObject(raw.downloadSettings);
    authStoreCache = {
      users: Array.isArray(raw.users) ? raw.users : [],
      downloadSettings: normalizeDownloadSettings(raw.downloadSettings),
    };
    if (legacyDownloadSettingsMigrated) {
      await fs.writeFile(authUsersPath, `${JSON.stringify(authStoreCache, null, 2)}\n`, 'utf8');
    }
    return authStoreCache;
  } catch (error) {
    console.warn(`Unable to read ${authUsersPath}:`, error instanceof Error ? error.message : error);
    authStoreCache = fallback;
    return authStoreCache;
  }
}

async function writeAuthStore(store) {
  if (!authUsersPath) throw new HttpError(400, 'User storage is not configured.');
  await fs.mkdir(path.dirname(authUsersPath), { recursive: true });
  authStoreCache = {
    users: Array.isArray(store.users) ? store.users : [],
    downloadSettings: normalizeDownloadSettings(store.downloadSettings),
  };
  await fs.writeFile(authUsersPath, `${JSON.stringify(authStoreCache, null, 2)}\n`, 'utf8');
}

function getDefaultDownloadSettings() {
  return {
    downloadQuality: 'original',
    bulkDownloadMethod: 'browser',
    filenameTemplate: '{artist} - {title}',
    archiveFilenameTemplate: '{name}',
    zipEntryFolderTemplate: '{albumArtist}/{year} - {albumTitle}',
  };
}

function normalizeDownloadSettings(settings = {}) {
  const defaults = getDefaultDownloadSettings();
  const downloadQuality = String(settings.downloadQuality || defaults.downloadQuality) === 'mp3' ? 'mp3' : 'original';
  const bulkDownloadMethod = String(settings.bulkDownloadMethod || defaults.bulkDownloadMethod) === 'zip' ? 'zip' : 'browser';
    return {
      ...defaults,
      downloadQuality,
      bulkDownloadMethod,
      filenameTemplate: cleanText(settings.filenameTemplate) || defaults.filenameTemplate,
      archiveFilenameTemplate: cleanText(settings.archiveFilenameTemplate) || defaults.archiveFilenameTemplate,
      zipEntryFolderTemplate: cleanText(settings.zipEntryFolderTemplate) || defaults.zipEntryFolderTemplate,
    };
  }

function migrateLegacyDownloadSettingsObject(settings = {}) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return false;
  const legacyFolderTemplate = cleanText(settings.folderTemplate);
  const currentZipEntryFolderTemplate = cleanText(settings.zipEntryFolderTemplate);
  let changed = false;
  if (legacyFolderTemplate && !currentZipEntryFolderTemplate) {
    settings.zipEntryFolderTemplate = legacyFolderTemplate;
    changed = true;
  }
  if (Object.prototype.hasOwnProperty.call(settings, 'folderTemplate')) {
    delete settings.folderTemplate;
    changed = true;
  }
  return changed;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  const [algorithm, salt, expectedHash] = String(passwordHash || '').split(':');
  if (algorithm !== 'scrypt' || !salt || !expectedHash) return false;
  const actualHash = scryptSync(String(password), salt, 64).toString('hex');
  return timingSafeTextEqual(actualHash, expectedHash);
}

function normalizeUsername(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/gu, '')
    .slice(0, 48);
}

function getSessionToken(request) {
  return parseCookies(request.headers.cookie || '').ms_session || '';
}

function parseCookies(cookieHeader) {
  const cookies = {};
  for (const part of String(cookieHeader || '').split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

function createSessionCookie(token, request, options = {}) {
  const maxAge = Number.isFinite(options.maxAge) ? options.maxAge : 7 * 24 * 60 * 60;
  const parts = [
    `ms_session=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
  ];
  if (shouldRequireSecureAuth() || isSecureRequest(request)) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function cleanRedirectPath(value) {
  const redirectPath = String(value || '/').trim();
  if (!redirectPath.startsWith('/') || redirectPath.startsWith('//')) return '/';
  if (redirectPath.startsWith('/login')) return '/';
  if (redirectPath === '/admin' || redirectPath.startsWith('/admin/')) return '/';
  return redirectPath;
}

function requireLogin(request, response, url) {
  if (url.pathname.startsWith('/api/')) {
    return respondJson(response, 401, { error: 'Login required.' });
  }
  return redirect(response, getLoginAppRedirectPath(`${url.pathname}${url.search}` || '/'));
}

function isLoginShellRequest(url) {
  return url.pathname === '/login'
    || url.pathname === '/login/'
    || (
      (url.pathname === '/' || url.pathname === '/index.html')
      && url.searchParams.get('login') === '1'
    );
}

function getLoginAppRedirectPath(next = '/', extraParams = {}) {
  const params = new URLSearchParams({ next: cleanRedirectPath(next) });
  for (const [key, value] of Object.entries(extraParams || {})) {
    if (value == null || value === '') continue;
    params.set(key, String(value));
  }
  return `/login?${params.toString()}`;
}

async function initializeScanStateFromStore() {
  const [librarySummary, selectedFolders] = await Promise.all([
    readLibraryDatabaseSummary(libraryDatabasePath).catch(() => createEmptyLibrary()),
    getSelectedLibraryFolders().catch(() => []),
  ]);
  const hasIndexedLibrary = (librarySummary.trackCount || 0) > 0 || (librarySummary.albumCount || 0) > 0;

  scanState = {
    ...scanState,
    status: hasIndexedLibrary ? 'ready' : 'idle',
    finishedAt: librarySummary.generatedAt || null,
    error: null,
    selectedFolders,
    currentFolder: '',
    processedFiles: librarySummary.trackCount || 0,
    totalFiles: librarySummary.trackCount || 0,
    reusedFiles: 0,
    parsedFiles: 0,
    percent: hasIndexedLibrary ? 100 : 0,
  };
}

async function getCurrentLibrary() {
  if (libraryCache) return libraryCache;
  const cachedLibrary = await readLibraryStore();
  if (cachedLibrary.tracks.length > 0 || cachedLibrary.albums.length > 0) {
    libraryCache = cachedLibrary;
    trackMap = new Map(cachedLibrary.tracks.map((track) => [track.id, track]));
    scanState = {
      ...scanState,
      status: 'ready',
      finishedAt: cachedLibrary.generatedAt || scanState.finishedAt || new Date().toISOString(),
      error: null,
      currentFolder: '',
      processedFiles: cachedLibrary.trackCount,
      totalFiles: cachedLibrary.trackCount,
      percent: 100,
    };
    return libraryCache;
  }
  return createEmptyLibrary();
}

function primeTrackMap(tracks) {
  for (const track of tracks || []) {
    trackMap.set(track.id, track);
  }
}

async function getTrackById(trackId) {
  const cachedTrack = trackMap.get(trackId);
  if (cachedTrack) return cachedTrack;
  const databaseTrack = await readTrackFromDatabase(libraryDatabasePath, trackId);
  if (databaseTrack) {
    trackMap.set(databaseTrack.id, databaseTrack);
  }
  return databaseTrack;
}

function createEmptyLibrary() {
  return {
    generatedAt: null,
    trackCount: 0,
    albumCount: 0,
    tracks: [],
    albums: [],
  };
}

function normalizePageLimit(value) {
  const parsed = Number.parseInt(value || 50, 10);
  return [25, 50, 100, 200, 500].includes(parsed) ? parsed : 50;
}

function normalizePageOffset(value) {
  return Math.max(0, Number.parseInt(value || 0, 10) || 0);
}

function parseFolderFilters(values) {
  const rawValues = Array.isArray(values) ? values : [values];
  return [...new Set(rawValues
    .map((value) => String(value || '')
      .replace(/\\/gu, '/')
      .replace(/^\/+|\/+$/gu, '')
      .replace(/\/+/gu, '/')
      .trim())
    .filter(Boolean))];
}

function getFolderFilterParams(url) {
  return parseFolderFilters(url.searchParams.getAll('folders'));
}

function createHomeAlbumCacheKey(url) {
  const folders = getFolderFilterParams(url).sort((left, right) => left.localeCompare(right));
  const mediaTypes = String(url.searchParams.get('mediaTypes') || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
  return JSON.stringify({
    bucket: Math.floor(Date.now() / HOME_ALBUM_CACHE_MS),
    limit: normalizePageLimit(url.searchParams.get('limit') || 50),
    folders,
    mediaTypes,
  });
}

function setHomeAlbumCache(cacheKey, payload) {
  homeAlbumPageCache.set(cacheKey, payload);
  if (homeAlbumPageCache.size <= HOME_ALBUM_CACHE_LIMIT) return;
  const oldestKey = homeAlbumPageCache.keys().next().value;
  if (oldestKey) homeAlbumPageCache.delete(oldestKey);
}

function clearHomeAlbumCache() {
  homeAlbumPageCache = new Map();
}

function invalidateLibraryMemoryCache() {
  libraryCache = null;
  trackMap = new Map();
  clearHomeAlbumCache();
}

function createPageInfo(options = {}, total = 0) {
  const limit = normalizePageLimit(options.limit);
  const offset = normalizePageOffset(options.offset);
  return {
    limit,
    offset,
    total,
    hasNext: offset + limit < total,
    hasPrevious: offset > 0,
  };
}

function createPagedLibrary(library, options = {}) {
  const limit = normalizePageLimit(options.limit);
  const offset = normalizePageOffset(options.offset);
  const search = String(options.search || '').trim().toLowerCase();
  const folderFilters = parseFolderFilters(options.folders || []);
  const restrictAlbumIds = Array.isArray(options.albumIds);
  const albumIds = restrictAlbumIds ? new Set(options.albumIds.filter(Boolean)) : null;
  const excludeAlbumIds = new Set(Array.isArray(options.excludeAlbumIds) ? options.excludeAlbumIds.filter(Boolean) : []);
  const tracksById = new Map((library.tracks || []).map((track) => [track.id, track]));
  const includedAlbums = restrictAlbumIds
    ? library.albums.filter((album) => albumIds.has(album.id))
    : library.albums;
  const baseAlbums = excludeAlbumIds.size > 0
    ? includedAlbums.filter((album) => !excludeAlbumIds.has(album.id))
    : includedAlbums;
  const folderAlbums = folderFilters.length > 0
    ? baseAlbums.filter((album) => (album.trackIds || []).some((trackId) =>
      trackMatchesFolderFilters(tracksById.get(trackId), folderFilters)
    ))
    : baseAlbums;
  const albums = search
    ? folderAlbums.filter((album) => [album.title, album.artist, album.albumArtist].some((value) =>
      String(value || '').toLowerCase().includes(search)
    ))
    : folderAlbums;
  const pageAlbums = albums.slice(offset, offset + limit);
  const trackIds = new Set(pageAlbums.flatMap((album) => album.trackIds || []));
  const tracks = library.tracks.filter((track) => trackIds.has(track.id));

  return {
    ...library,
    albums: pageAlbums,
    tracks,
    albumCount: albums.length,
    page: {
      limit,
      offset,
      total: albums.length,
      hasNext: offset + limit < albums.length,
      hasPrevious: offset > 0,
    },
  };
}

function getTrackFolderPathForFilter(track) {
  const relativePath = String(track?.relativePath || '')
    .replace(/\\/gu, '/')
    .replace(/^\/+|\/+$/gu, '')
    .replace(/\/+/gu, '/')
    .trim();
  const index = relativePath.lastIndexOf('/');
  return index > -1 ? relativePath.slice(0, index) : '';
}

function trackMatchesFolderFilters(track, folderFilters) {
  if (!track) return false;
  const folderPath = getTrackFolderPathForFilter(track);
  return folderFilters.some((folder) => folderPath === folder || folderPath.startsWith(`${folder}/`));
}

async function ensureLibrary() {
  if (libraryCache) {
    return libraryCache;
  }
  return getCurrentLibrary();
}

async function refreshLibrary(selectedFoldersInput = null) {
  const selectedFolders = selectedFoldersInput || (await getSelectedLibraryFolders());
  const cachedLibrary = await readLibraryStore();
  scanState = {
    status: 'scanning',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    error: null,
    selectedFolders,
    currentFolder: selectedFolders[0] || '',
    processedFiles: 0,
    totalFiles: 0,
    reusedFiles: 0,
    parsedFiles: 0,
    percent: 0,
  };

  cachePromise = scanMusicLibrary(libraryRoot, {
    scanMetadata: config.scanMetadata,
    scanDurations: config.scanDurations,
    includeFolders: selectedFolders,
    cachedTracks: cachedLibrary.tracks,
    skipInitialCount: Array.isArray(cachedLibrary.tracks) && cachedLibrary.tracks.length > 0,
    onProgress: updateScanProgress,
  }).then(async (library) => {
    await populateAlbumCoverCache(library);
    return library;
  }).then((library) => {
    libraryCache = library;
    trackMap = new Map(library.tracks.map((track) => [track.id, track]));
    return writeLibraryStore(library).then(() => library);
  }).then((library) => {
    scanState = {
      ...scanState,
      status: 'ready',
      finishedAt: new Date().toISOString(),
      error: null,
      currentFolder: '',
      processedFiles: library.trackCount,
      totalFiles: scanState.totalFiles || library.trackCount,
      percent: 100,
    };
    return library;
  }).catch((error) => {
    scanState = {
      ...scanState,
      status: 'error',
      finishedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Library scan failed',
    };
    throw error;
  });

  return cachePromise.finally(() => {
    cachePromise = null;
  });
}

async function startLibraryScan() {
  if (cachePromise) return scanState;
  const selectedFolders = await getSelectedLibraryFolders();
  scanState = {
    ...scanState,
    status: 'scanning',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    error: null,
    selectedFolders,
    currentFolder: selectedFolders[0] || '',
    processedFiles: 0,
    totalFiles: 0,
    reusedFiles: 0,
    parsedFiles: 0,
    percent: 0,
  };
  refreshLibrary(selectedFolders)
    .then(() => migrateLyricsOverridesToSidecars())
    .catch((error) => {
      console.error('Library scan failed:', error);
    });
  return scanState;
}

function updateScanProgress(progress) {
  scanState = {
    ...scanState,
    currentFolder: progress.currentFolder || scanState.currentFolder || '',
    processedFiles: Number.isFinite(progress.processedFiles) ? progress.processedFiles : scanState.processedFiles,
    totalFiles: Number.isFinite(progress.totalFiles) ? progress.totalFiles : scanState.totalFiles,
    reusedFiles: Number.isFinite(progress.reusedFiles) ? progress.reusedFiles : scanState.reusedFiles,
    parsedFiles: Number.isFinite(progress.parsedFiles) ? progress.parsedFiles : scanState.parsedFiles,
    percent: Number.isFinite(progress.percent) ? progress.percent : scanState.percent,
  };
}

async function populateAlbumCoverCache(library) {
  if (!coverCachePath) return;

  await fs.mkdir(coverCachePath, { recursive: true });
  const tracksById = new Map(library.tracks.map((track) => [track.id, track]));

  for (const album of library.albums || []) {
    const track = album.coverTrackId ? tracksById.get(album.coverTrackId) : null;
    if (!track) continue;

    const existingCover = findCachedAlbumCover(album.id, COVER_CACHE_MAX_SIZE);
    if (existingCover) {
      track.cachedCoverPath = existingCover.path;
      track.cachedCoverFormat = existingCover.format;
      track.hasEmbeddedCover = true;
      await ensureCachedAlbumCoverVariant(album.id, COVER_CACHE_THUMBNAIL_SIZE).catch(() => null);
      continue;
    }

    const cachedCover = await cacheAlbumCover(album, track);
    if (cachedCover) {
      track.cachedCoverPath = cachedCover.path;
      track.cachedCoverFormat = cachedCover.format;
      track.hasEmbeddedCover = true;
    }
  }
}

async function cacheAlbumCover(album, track) {
  const existingCover = findCachedAlbumCover(album.id, COVER_CACHE_MAX_SIZE);
  if (existingCover) {
    await ensureCachedAlbumCoverVariant(album.id, COVER_CACHE_THUMBNAIL_SIZE).catch(() => null);
    return existingCover;
  }

  const fullTargetPath = getCachedCoverPath(album.id, COVER_CACHE_MAX_SIZE);

  if (track.coverArtPath && existsSync(track.coverArtPath)) {
    try {
      const fullCover = await writeOptimizedWebpCover(track.coverArtPath, fullTargetPath, COVER_CACHE_MAX_SIZE);
      if (fullCover) {
        await writeOptimizedWebpCover(track.coverArtPath, getCachedCoverPath(album.id, COVER_CACHE_THUMBNAIL_SIZE), COVER_CACHE_THUMBNAIL_SIZE).catch(() => null);
      }
      return fullCover;
    } catch (error) {
      console.warn(`Unable to optimize cover art for ${album.title}:`, error instanceof Error ? error.message : error);
      return null;
    }
  }

  if (!track.hasEmbeddedCover) return null;

  const embeddedCover = await readEmbeddedCover(track.path);
  if (!embeddedCover?.data) return null;

  try {
    const fullCover = await writeOptimizedWebpCover(embeddedCover.data, fullTargetPath, COVER_CACHE_MAX_SIZE);
    if (fullCover) {
      await writeOptimizedWebpCover(embeddedCover.data, getCachedCoverPath(album.id, COVER_CACHE_THUMBNAIL_SIZE), COVER_CACHE_THUMBNAIL_SIZE).catch(() => null);
    }
    return fullCover;
  } catch (error) {
    console.warn(`Unable to optimize embedded cover for ${album.title}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

async function writeOptimizedWebpCover(source, targetPath, maxSize = COVER_CACHE_MAX_SIZE) {
  const sharp = await loadSharp();
  if (!sharp) return null;

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await sharp(source, { limitInputPixels: false })
    .rotate()
    .resize({
      width: maxSize,
      height: maxSize,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: COVER_CACHE_WEBP_QUALITY,
      effort: 4,
    })
    .toFile(targetPath);

  return {
    path: targetPath,
    format: 'image/webp',
  };
}

async function ensureCachedAlbumCoverVariant(albumId, size) {
  if (size === COVER_CACHE_MAX_SIZE) return findCachedAlbumCover(albumId, COVER_CACHE_MAX_SIZE);
  const existingCover = findCachedAlbumCover(albumId, size);
  if (existingCover) return existingCover;

  const fullCover = findCachedAlbumCover(albumId, COVER_CACHE_MAX_SIZE);
  if (!fullCover) return null;

  const targetPath = getCachedCoverPath(albumId, size);
  try {
    return await writeOptimizedWebpCover(fullCover.path, targetPath, size);
  } catch {
    return null;
  }
}

async function loadSharp() {
  if (!sharpModulePromise) {
    sharpModulePromise = import('sharp')
      .then((module) => module.default || module)
      .catch((error) => {
        if (!sharpWarningShown) {
          sharpWarningShown = true;
          console.warn('Cover optimization requires the optional sharp dependency. Rebuild/install dependencies to enable WebP cover caching.', error instanceof Error ? error.message : error);
        }
        return null;
      });
  }
  return sharpModulePromise;
}

function normalizeCoverSize(value) {
  const size = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(size) && size <= COVER_CACHE_THUMBNAIL_SIZE
    ? COVER_CACHE_THUMBNAIL_SIZE
    : COVER_CACHE_MAX_SIZE;
}

function getCachedCoverPath(albumId, size = COVER_CACHE_MAX_SIZE) {
  const normalizedSize = normalizeCoverSize(size);
  const suffix = normalizedSize === COVER_CACHE_MAX_SIZE ? '' : `-${normalizedSize}`;
  return path.join(coverCachePath, `${albumId}${suffix}${COVER_CACHE_EXTENSION}`);
}

function findCachedAlbumCover(albumId, size = COVER_CACHE_MAX_SIZE) {
  if (!coverCachePath || !albumId) return null;
  const candidatePath = getCachedCoverPath(albumId, size);
  if (existsSync(candidatePath)) {
    return {
      path: candidatePath,
      format: 'image/webp',
    };
  }
  return null;
}

function slugifyCoverSegment(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
}

function isUploadedCoverFilename(filename) {
  return /^[a-z0-9][a-z0-9._-]*\.webp$/iu.test(String(filename || ''));
}

function getUploadedCoverPath(filename) {
  if (!isUploadedCoverFilename(filename)) {
    throw new HttpError(404, 'Cover not found');
  }
  return path.join(coverCachePath, 'uploads', filename);
}

async function streamUploadedCover(response, filename) {
  if (!coverCachePath) {
    throw new HttpError(404, 'Cover not found');
  }
  const coverPath = getUploadedCoverPath(filename);
  if (!existsSync(coverPath)) {
    throw new HttpError(404, 'Cover not found');
  }
  return streamCoverFile(response, coverPath, 'image/webp', { immutable: true });
}

async function saveUploadedCoverDataUrl(dataUrl, { scope = 'cover', name = '' } = {}) {
  const raw = String(dataUrl || '').trim();
  if (!raw) return '';
  if (!coverCachePath) {
    throw new HttpError(500, 'Cover cache is not configured.');
  }
  const match = /^data:(image\/(?:png|jpe?g|webp|gif|avif));base64,([a-z0-9+/=\s]+)$/iu.exec(raw);
  if (!match) {
    throw new HttpError(400, 'Uploaded cover must be a base64 image data URL.');
  }

  const sharp = await loadSharp();
  if (!sharp) {
    throw new HttpError(500, 'Cover uploads require sharp/WebP support.');
  }

  const base64 = match[2].replace(/\s+/gu, '');
  const imageBuffer = Buffer.from(base64, 'base64');
  if (!imageBuffer.length) {
    throw new HttpError(400, 'Uploaded cover is empty.');
  }
  if (imageBuffer.length > COVER_UPLOAD_MAX_BYTES) {
    throw new HttpError(413, 'Uploaded cover is too large.');
  }

  const scopeSlug = slugifyCoverSegment(scope || 'cover').slice(0, 32) || 'cover';
  const nameHash = createHash('sha1').update(String(name || scopeSlug)).digest('hex').slice(0, 10);
  const contentHash = createHash('sha1').update(imageBuffer).digest('hex').slice(0, 16);
  const filename = `${scopeSlug}-${nameHash}-${contentHash}.webp`;
  const targetPath = getUploadedCoverPath(filename);
  await writeOptimizedWebpCover(imageBuffer, targetPath, COVER_CACHE_MAX_SIZE);
  return `/api/uploaded-covers/${encodeURIComponent(filename)}`;
}

async function readLibraryStore() {
  const databaseLibrary = await readLibraryDatabase(libraryDatabasePath);
  if (databaseLibrary.tracks.length > 0 || databaseLibrary.albums.length > 0) {
    return databaseLibrary;
  }

  if (!legacyLibraryCachePath || !existsSync(legacyLibraryCachePath)) return createEmptyLibrary();

  try {
    const raw = JSON.parse(await fs.readFile(legacyLibraryCachePath, 'utf8'));
    const tracks = Array.isArray(raw.tracks) ? raw.tracks : [];
    const legacyLibrary = {
      generatedAt: raw.generatedAt || null,
      trackCount: tracks.length,
      albumCount: Array.isArray(raw.albums) ? raw.albums.length : 0,
      tracks,
      albums: Array.isArray(raw.albums) ? raw.albums : [],
    };
    if (legacyLibrary.tracks.length > 0 || legacyLibrary.albums.length > 0) {
      await writeLibraryDatabase(libraryDatabasePath, legacyLibrary);
      console.log(`Migrated legacy library-cache.json into ${libraryDatabasePath}`);
    }
    return legacyLibrary;
  } catch {
    return createEmptyLibrary();
  }
}

async function writeLibraryStore(library) {
  await writeLibraryDatabase(libraryDatabasePath, library);
  clearHomeAlbumCache();
}

async function getLibraryFoldersPayload() {
  const [available, selected] = await Promise.all([
    listLibraryFolders(),
    getSelectedLibraryFolders(),
  ]);

  return {
    root: libraryRoot,
    available,
    selected,
    scan: scanState,
  };
}

async function listLibraryFolders() {
  const entries = await fs.readdir(libraryRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function getSelectedLibraryFolders() {
  if (selectedLibraryFoldersCache) return selectedLibraryFoldersCache;
  if (!libraryFoldersPath || !existsSync(libraryFoldersPath)) {
    selectedLibraryFoldersCache = [];
    return selectedLibraryFoldersCache;
  }

  try {
    const raw = JSON.parse(await fs.readFile(libraryFoldersPath, 'utf8'));
    selectedLibraryFoldersCache = normalizeLibraryFolders(raw.folders || []);
  } catch {
    selectedLibraryFoldersCache = [];
  }

  return selectedLibraryFoldersCache;
}

async function updateSelectedLibraryFolders(request) {
  const payload = await readRequestJson(request, 256 * 1024);
  const selected = normalizeLibraryFolders(payload.folders || []);
  await writeSelectedLibraryFolders(selected);
  libraryCache = null;
  trackMap = new Map();
  clearHomeAlbumCache();
  return getLibraryFoldersPayload();
}

async function writeSelectedLibraryFolders(folders) {
  if (!libraryFoldersPath) throw new HttpError(400, 'Library folder selection is not configured.');
  await fs.mkdir(path.dirname(libraryFoldersPath), { recursive: true });
  await fs.writeFile(libraryFoldersPath, `${JSON.stringify({ folders }, null, 2)}\n`, 'utf8');
  selectedLibraryFoldersCache = folders;
}

async function readWidgetSettings() {
  if (!widgetSettingsPath || !existsSync(widgetSettingsPath)) return null;

  try {
    const raw = JSON.parse(await fs.readFile(widgetSettingsPath, 'utf8'));
    return normalizeWidgetSettings(raw);
  } catch (error) {
    console.warn(`Unable to read ${path.basename(widgetSettingsPath)}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

async function updateWidgetSettings(request) {
  const payload = await readRequestJson(request, 64 * 1024);
  const current = getEffectiveWidgetSettings();
  const action = String(payload.action || '').trim();
  const shouldGenerate = action === 'generate-key';
  const enabled = typeof payload.enabled === 'boolean'
    ? payload.enabled
    : current.enabled;
  const apiKey = shouldGenerate
    ? createWidgetApiKey()
    : String(payload.apiKey ?? current.apiKey ?? '').trim();
  const widgetCorsOrigin = String(payload.widgetCorsOrigin ?? current.widgetCorsOrigin ?? '').trim();

  const settings = normalizeWidgetSettings({
    enabled,
    apiKey: enabled && !apiKey ? createWidgetApiKey() : apiKey,
    widgetCorsOrigin,
  });
  await writeWidgetSettings(settings);
  return getWidgetSettingsPayload(request);
}

async function writeWidgetSettings(settings) {
  if (!widgetSettingsPath) throw new HttpError(400, 'Widget settings are not configured.');
  await fs.mkdir(path.dirname(widgetSettingsPath), { recursive: true });
  await fs.writeFile(widgetSettingsPath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
  widgetSettingsCache = settings;
}

function getWidgetSettingsPayload(request) {
  const settings = getEffectiveWidgetSettings();
  const origin = getRequestOrigin(request);
  return {
    enabled: settings.enabled,
    apiKey: settings.apiKey,
    hasApiKey: Boolean(settings.apiKey),
    widgetCorsOrigin: settings.widgetCorsOrigin,
    source: settings.source,
    endpoint: '/api/widget/stats',
    statsUrl: `${origin}/api/widget/stats`,
    exampleUrl: settings.apiKey
      ? `${origin}/api/widget/stats?apiKey=${encodeURIComponent(settings.apiKey)}`
      : `${origin}/api/widget/stats?apiKey=YOUR_KEY`,
  };
}

function getEffectiveWidgetSettings() {
  const storedEnabled = typeof widgetSettingsCache?.enabled === 'boolean'
    ? widgetSettingsCache.enabled
    : null;
  const storedApiKey = String(widgetSettingsCache?.apiKey || '').trim();
  const envApiKey = String(config.widgetApiKey || '').trim();
  const apiKey = storedApiKey || envApiKey;
  const widgetCorsOrigin = normalizeCorsOrigin(widgetSettingsCache?.widgetCorsOrigin || config.widgetCorsOrigin || '');
  const hasSafeApiKey = !isPlaceholderWidgetApiKey(apiKey);
  return {
    enabled: Boolean(storedEnabled ?? Boolean(apiKey)) && hasSafeApiKey && Boolean(widgetCorsOrigin),
    apiKey,
    widgetCorsOrigin,
    source: storedApiKey ? 'settings' : (envApiKey ? 'environment' : 'none'),
  };
}

function normalizeWidgetSettings(settings) {
  const enabled = Boolean(settings?.enabled);
  const apiKey = String(settings?.apiKey || '').trim();
  const widgetCorsOrigin = String(settings?.widgetCorsOrigin || '').trim();

  if (enabled && isPlaceholderWidgetApiKey(apiKey)) {
    throw new HttpError(400, 'Enable the widget API only after setting a real API key.');
  }

  const normalizedOrigin = normalizeCorsOrigin(widgetCorsOrigin);
  if (enabled && !normalizedOrigin) {
    throw new HttpError(400, 'Widget CORS origin must be a specific http:// or https:// origin.');
  }

  return {
    enabled,
    apiKey,
    widgetCorsOrigin: normalizedOrigin,
  };
}

function createWidgetApiKey() {
  return `ms_${randomBytes(24).toString('base64url')}`;
}

function normalizeLibraryFolders(folders) {
  const seen = new Set();
  const safeFolders = [];

  for (const folder of Array.isArray(folders) ? folders : []) {
    const normalized = String(folder || '').replace(/\\/gu, '/').replace(/^\/+|\/+$/gu, '').trim();
    if (!normalized || normalized.includes('..') || path.isAbsolute(normalized) || seen.has(normalized)) continue;
    seen.add(normalized);
    safeFolders.push(normalized);
  }

  return safeFolders.sort((left, right) => left.localeCompare(right));
}

function normalizeScanMetadata(value) {
  return String(value || '').toLowerCase() === 'filename' ? 'filename' : 'tags';
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

async function createLibraryPayload(library) {
  const overrides = await getAlbumOverrides();
  const deletedAlbumIds = getDeletedAlbumIdSet(overrides);
  const sourceAlbums = Array.isArray(library.albums) ? library.albums : [];
  const sourceTracks = Array.isArray(library.tracks) ? library.tracks : [];
  const visibleAlbums = deletedAlbumIds.size > 0
    ? sourceAlbums.filter((album) => !deletedAlbumIds.has(album.id))
    : sourceAlbums;
  const deletedTrackIds = deletedAlbumIds.size > 0
    ? new Set(sourceAlbums
      .filter((album) => deletedAlbumIds.has(album.id))
      .flatMap((album) => Array.isArray(album.trackIds) ? album.trackIds : []))
    : new Set();
  const visibleTracks = deletedTrackIds.size > 0
    ? sourceTracks.filter((track) => !deletedTrackIds.has(track.id))
    : sourceTracks;
  const librarySummary = await readLibraryDatabaseSummary(libraryDatabasePath);
  const trackAlbumOverrideMap = new Map();
  const trackAlbumMap = new Map();

  for (const album of visibleAlbums) {
    const albumOverride = overrides.albums?.[album.id] || null;
    for (const trackId of album.trackIds) {
      trackAlbumMap.set(trackId, album);
      if (albumOverride) {
        trackAlbumOverrideMap.set(trackId, albumOverride);
      }
    }
  }

  return {
    title: config.title,
    generatedAt: library.generatedAt,
    trackCount: library.page ? library.trackCount : visibleTracks.length,
    albumCount: library.page ? library.albumCount : visibleAlbums.length,
    totalTrackCount: librarySummary.trackCount,
    totalAlbumCount: librarySummary.albumCount,
    lightweight: Boolean(library.lightweight),
    page: library.page || null,
    albums: visibleAlbums.map((album) => {
      const { coverTrack: hydratedCoverTrack = null, ...albumPayloadBase } = album;
      const override = overrides.albums?.[album.id] || null;
      const coverTrack = hydratedCoverTrack || (album.coverTrackId ? trackMap.get(album.coverTrackId) : null);
      const scannedCoverUrl = createAlbumCoverUrl(album, coverTrack, library.generatedAt, { size: COVER_CACHE_THUMBNAIL_SIZE });
      const scannedFullCoverUrl = createAlbumCoverUrl(album, coverTrack, library.generatedAt, { size: COVER_CACHE_MAX_SIZE });
      const hasMediaOverride = override && (
        Object.hasOwn(override, 'mediaTypes') || Object.hasOwn(override, 'mediaType')
      );
      const albumArtistName = override?.albumArtist || album.albumArtist || album.artist;
      return {
        ...albumPayloadBase,
        title: override?.albumTitle || album.title,
        artist: albumArtistName,
        albumArtist: albumArtistName,
        date: override?.date || album.date || null,
        year: override?.year || album.year || null,
        genre: override?.genre || '',
        collectionName: Object.hasOwn(override || {}, 'collectionName')
          ? cleanText(override.collectionName)
          : cleanText(album.collectionName),
        mediaTypes: hasMediaOverride
          ? normalizeMediaTypes(override.mediaTypes || override.mediaType, { fallback: [] })
          : ['Digital Media'],
        status: override?.status || 'Collection',
        audioQuality: album.audioQuality,
        musicBrainzId: override?.musicBrainzId || '',
        coverUrl: override?.coverUrl || scannedCoverUrl,
        fullCoverUrl: override?.coverUrl || scannedFullCoverUrl,
        customCoverUrl: override?.coverUrl || null,
        scannedCoverUrl,
        scannedFullCoverUrl,
      };
    }),
    tracks: visibleTracks.map((track) => {
      const albumOverride = trackAlbumOverrideMap.get(track.id) || null;
      const album = trackAlbumMap.get(track.id) || null;
      const trackOverride = albumOverride?.tracks?.[track.id] || null;
      const scannedCoverUrl = album
        ? createAlbumCoverUrl(album, album.coverTrackId ? trackMap.get(album.coverTrackId) : track, library.generatedAt, { size: COVER_CACHE_THUMBNAIL_SIZE })
        : createTrackCoverUrl(track, library.generatedAt, { size: COVER_CACHE_THUMBNAIL_SIZE });
      return {
        id: track.id,
        albumId: album?.id || '',
        title: trackOverride?.title || track.title,
        artist: trackOverride?.artist || track.artist,
        albumArtist: albumOverride?.albumArtist || album?.albumArtist || album?.artist || track.albumArtist || track.artist,
        album: albumOverride?.albumTitle || track.album,
        trackNumber: trackOverride?.trackNumber ?? track.trackNumber,
        discNumber: trackOverride?.discNumber ?? track.discNumber,
        relativePath: track.relativePath,
        streamUrl: `/api/tracks/${track.id}/stream`,
        coverUrl: albumOverride?.coverUrl || scannedCoverUrl,
        duration: track.duration,
        audioQuality: track.audioQuality,
      };
    }),
  };
}

function getDeletedAlbumIdSet(overrides = {}) {
  return new Set(Object.entries(overrides.albums || {})
    .filter(([, override]) => Boolean(override?.deleted))
    .map(([albumId]) => albumId));
}

async function getDeletedAlbumIds() {
  return [...getDeletedAlbumIdSet(await getAlbumOverrides())];
}

async function applyDeletedAlbumExclusions(options = {}) {
  const deletedAlbumIds = await getDeletedAlbumIds();
  if (deletedAlbumIds.length === 0) return options;
  return {
    ...options,
    excludeAlbumIds: [...new Set([...(options.excludeAlbumIds || []), ...deletedAlbumIds])],
  };
}

function createAlbumCoverUrl(album, coverTrack, version = '', { size = COVER_CACHE_THUMBNAIL_SIZE } = {}) {
  if (!album?.id || !hasTrackCover(coverTrack)) return null;
  return createVersionedApiUrl(`/api/albums/${encodeURIComponent(album.id)}/cover`, version, { size });
}

function createTrackCoverUrl(track, version = '', { size = COVER_CACHE_THUMBNAIL_SIZE } = {}) {
  if (!track?.id || !hasTrackCover(track)) return null;
  return createVersionedApiUrl(`/api/tracks/${encodeURIComponent(track.id)}/cover`, version, { size });
}

function hasTrackCover(track) {
  return Boolean(
    (track?.cachedCoverPath && existsSync(track.cachedCoverPath))
    || (track?.coverArtPath && existsSync(track.coverArtPath))
    || track?.hasEmbeddedCover
  );
}

function createVersionedApiUrl(pathname, version = '', params = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value === null || value === undefined || value === '') continue;
    searchParams.set(key, String(value));
  }
  const cleanVersion = String(version || '').trim();
  if (cleanVersion) searchParams.set('v', cleanVersion);
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

async function getPublicBootstrapPayload() {
  const randomLibrary = await readRandomAlbumPage(libraryDatabasePath, {
    limit: 32,
    offset: 0,
  });
  primeTrackMap(randomLibrary.tracks);
  const payload = await createLibraryPayload(randomLibrary);
  const coverAlbums = (payload.albums || []).filter((album) => album.coverUrl);
  const ambientAlbums = coverAlbums
    .map((album) => ({ album, sort: Math.random() }))
    .sort((left, right) => left.sort - right.sort)
    .slice(0, 6)
    .map(({ album }) => album);
  const ambientAlbum = ambientAlbums[0] || null;

  return {
    title: config.title,
    ambientCoverUrl: ambientAlbum?.coverUrl || '',
    ambientTitle: ambientAlbum?.title || '',
    ambientArtist: ambientAlbum?.albumArtist || ambientAlbum?.artist || '',
    ambientCovers: ambientAlbums.map((album) => ({
      coverUrl: album.coverUrl || '',
      title: album.title || '',
      artist: album.albumArtist || album.artist || '',
    })),
  };
}

async function getWishlistAlbumIds() {
  const { scannedAlbumIds } = await getWishlistAlbumSources();
  return scannedAlbumIds;
}

async function getWishlistAlbumSources() {
  const overrides = await getAlbumOverrides();
  const scannedAlbumIds = [];
  const manualAlbums = [];
  for (const [albumId, override] of Object.entries(overrides.albums || {})) {
    if (override?.deleted) continue;
    if (normalizeAlbumStatus(override?.status) !== 'Wishlist') continue;
    if (override?.manual || albumId.startsWith('manual-')) {
      manualAlbums.push(createManualAlbumFromOverride(albumId, override));
    } else {
      scannedAlbumIds.push(albumId);
    }
  }
  return { scannedAlbumIds, manualAlbums };
}

function createManualAlbumFromOverride(albumId, override = {}) {
  const albumTitle = cleanText(override.albumTitle || override.title) || 'Untitled Album';
  const albumArtist = cleanText(override.albumArtist || override.artist) || 'Unknown Artist';
  const manualTracks = getManualAlbumTracksFromOverride(albumId, override, { albumTitle, albumArtist });
  return {
    id: albumId,
    manual: true,
    title: albumTitle,
    artist: albumArtist,
    albumArtist,
    date: cleanText(override.date) || null,
    year: normalizeYear(override.year || override.date),
    genre: cleanText(override.genre),
    collectionName: cleanText(override.collectionName),
    mediaTypes: normalizeMediaTypes(override.mediaTypes || override.mediaType, { fallback: [] }),
    status: normalizeAlbumStatus(override.status || 'Wishlist'),
    audioQuality: null,
    musicBrainzId: cleanText(override.musicBrainzId),
    coverUrl: cleanText(override.coverUrl) || null,
    customCoverUrl: cleanText(override.coverUrl) || null,
    scannedCoverUrl: null,
    trackIds: manualTracks.map((track) => track.id),
    coverTrackId: null,
  };
}

function normalizeAlphabetFilter(letter) {
  const normalized = String(letter || 'all').trim().toUpperCase();
  if (normalized === '#' || /^[A-Z]$/u.test(normalized)) return normalized;
  return 'all';
}

function matchesAlphabetFilter(value, letter) {
  if (!letter || letter === 'all') return true;
  const first = cleanText(value).charAt(0).toUpperCase();
  if (letter === '#') return !/^[A-Z]$/u.test(first);
  return first === letter;
}

async function createCollectionFoldersPayload({ search = '', letter = 'all', limit, offset, folders = [], all = false } = {}) {
  const folderFilters = parseFolderFilters(folders);
  const payload = await readCollectionFolders(libraryDatabasePath, { search, folders: folderFilters });
  const normalizedSearch = cleanText(search).toLowerCase();
  const normalizedLetter = normalizeAlphabetFilter(letter);
  const foldersByName = new Map();
  const albumFolderKeys = new Map();
  for (const folder of payload.folders || []) {
    const albumIds = new Set(folder.albumIds || []);
    const folderKey = normalizeCollectionName(folder.name);
    foldersByName.set(folderKey, {
      ...folder,
      albumIds,
      albumCount: albumIds.size || folder.albumCount || folder.trackCount || 0,
      trackCount: albumIds.size || folder.albumCount || folder.trackCount || 0,
        coverTrackId: folder.coverTrackId || '',
        coverUrl: '',
        coverOverrideUrl: '',
      });
    for (const albumId of albumIds) {
      albumFolderKeys.set(albumId, folderKey);
    }
  }
  const overrides = await getAlbumOverrides();
  const collectionOverrides = await getCollectionOverrides();
  const deletedAlbumIds = getDeletedAlbumIdSet(overrides);

  for (const albumId of deletedAlbumIds) {
    const previousFolderKey = albumFolderKeys.get(albumId);
    if (previousFolderKey && foldersByName.has(previousFolderKey)) {
      const previousFolder = foldersByName.get(previousFolderKey);
      previousFolder.albumIds.delete(albumId);
      previousFolder.albumCount = previousFolder.albumIds.size;
      previousFolder.trackCount = previousFolder.albumIds.size;
    }
    albumFolderKeys.delete(albumId);
  }

  for (const [albumId, override] of Object.entries(overrides.albums || {})) {
    if (folderFilters.length > 0) continue;
    if (override?.deleted) continue;
    if (!Object.hasOwn(override || {}, 'collectionName')) continue;
    const collectionName = cleanText(override?.collectionName);
    const previousFolderKey = albumFolderKeys.get(albumId);
    if (previousFolderKey && foldersByName.has(previousFolderKey)) {
      const previousFolder = foldersByName.get(previousFolderKey);
      previousFolder.albumIds.delete(albumId);
      previousFolder.albumCount = previousFolder.albumIds.size;
      previousFolder.trackCount = previousFolder.albumIds.size;
      albumFolderKeys.delete(albumId);
    }
    if (!collectionName) continue;
    if (normalizedSearch && !collectionName.toLowerCase().includes(normalizedSearch)) continue;

    const normalizedName = normalizeCollectionName(collectionName);
    if (!foldersByName.has(normalizedName)) {
      foldersByName.set(normalizedName, {
        path: collectionName,
        name: collectionName,
        parentPath: '',
        albumIds: new Set(),
        albumCount: 0,
        trackCount: 0,
        coverTrackId: '',
        coverUrl: '',
        coverOverrideUrl: '',
      });
    }
    const folder = foldersByName.get(normalizedName);
    folder.albumIds.add(albumId);
    albumFolderKeys.set(albumId, normalizedName);
    folder.albumCount = folder.albumIds.size;
    folder.trackCount = folder.albumIds.size;
  }

  const visibleFolders = [...foldersByName.values()]
    .filter((folder) => folder.albumIds.size > 0)
    .filter((folder) => matchesAlphabetFilter(folder.name, normalizedLetter))
    .sort((left, right) => left.name.localeCompare(right.name));
  const page = all
    ? {
        limit: visibleFolders.length,
        offset: 0,
        total: visibleFolders.length,
        hasNext: false,
        hasPrevious: false,
      }
    : createPageInfo({ limit, offset }, visibleFolders.length);
  const pagedFolders = visibleFolders.slice(page.offset, page.offset + page.limit);
  const pagedCollectionFolders = await Promise.all(pagedFolders.map(async (folder) => {
    const coverOverrideUrl = getCollectionCoverOverrideUrl(folder.name || folder.path, collectionOverrides);
    return {
      ...folder,
      coverOverrideUrl,
      coverUrl: await getCollectionFolderCoverUrl(folder, overrides, collectionOverrides),
    };
  }));

  return {
    ...payload,
    page,
    folders: pagedCollectionFolders
      .map((folder) => ({
        ...folder,
        albumIds: [...folder.albumIds],
        albumCount: folder.albumIds.size,
        trackCount: folder.albumIds.size,
      })),
  };
}

async function createCollectionOptionsPayload(options = {}) {
  const search = cleanText(options.search).toLowerCase();
  const folderFilters = parseFolderFilters(options.folders);
  const payload = await readCollectionFolders(libraryDatabasePath, {
    search,
    folders: folderFilters,
  });
  const foldersByName = new Map();
  const albumFolderKeys = new Map();

  for (const folder of payload.folders || []) {
    const albumIds = new Set(folder.albumIds || []);
    const folderKey = normalizeCollectionName(folder.name);
    foldersByName.set(folderKey, {
      path: folder.path,
      name: folder.name,
      albumIds,
    });
    for (const albumId of albumIds) {
      albumFolderKeys.set(albumId, folderKey);
    }
  }

  const overrides = await getAlbumOverrides();
  const deletedAlbumIds = getDeletedAlbumIdSet(overrides);
  for (const albumId of deletedAlbumIds) {
    const previousFolderKey = albumFolderKeys.get(albumId);
    if (!previousFolderKey || !foldersByName.has(previousFolderKey)) continue;
    foldersByName.get(previousFolderKey).albumIds.delete(albumId);
    albumFolderKeys.delete(albumId);
  }

  for (const [albumId, override] of Object.entries(overrides.albums || {})) {
    if (folderFilters.length > 0) continue;
    if (override?.deleted) continue;
    if (!Object.hasOwn(override || {}, 'collectionName')) continue;

    const collectionName = cleanText(override?.collectionName);
    const previousFolderKey = albumFolderKeys.get(albumId);
    if (previousFolderKey && foldersByName.has(previousFolderKey)) {
      foldersByName.get(previousFolderKey).albumIds.delete(albumId);
      albumFolderKeys.delete(albumId);
    }
    if (!collectionName) continue;
    if (search && !collectionName.toLowerCase().includes(search)) continue;

    const normalizedName = normalizeCollectionName(collectionName);
    if (!foldersByName.has(normalizedName)) {
      foldersByName.set(normalizedName, {
        path: collectionName,
        name: collectionName,
        albumIds: new Set(),
      });
    }
    foldersByName.get(normalizedName).albumIds.add(albumId);
    albumFolderKeys.set(albumId, normalizedName);
  }

  return {
    generatedAt: payload.generatedAt,
    collections: [...foldersByName.values()]
      .filter((folder) => folder.albumIds.size > 0)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((folder) => ({
        name: folder.name,
        path: folder.path,
        albumCount: folder.albumIds.size,
        coverUrl: '',
        coverOverrideUrl: '',
      })),
  };
}

async function getCollectionFolderCoverUrl(folder, overrides, collectionOverrides = { collections: {} }) {
  const collectionName = cleanText(folder.name || folder.path);
  const overrideCoverUrl = getCollectionCoverOverrideUrl(collectionName, collectionOverrides);
  if (overrideCoverUrl) return overrideCoverUrl;

  const albumIds = folder.albumIds instanceof Set
    ? [...folder.albumIds]
    : Array.isArray(folder.albumIds) ? folder.albumIds : [];
  const albumOverrideCoverUrl = albumIds
    .map((albumId) => overrides.albums?.[albumId])
    .find((override) => !override?.deleted && cleanText(override?.coverUrl))?.coverUrl;
  if (albumOverrideCoverUrl) return cleanText(albumOverrideCoverUrl);

  if (folder.coverTrackId) {
    return createVersionedApiUrl(`/api/tracks/${encodeURIComponent(folder.coverTrackId)}/cover`, '', { size: COVER_CACHE_THUMBNAIL_SIZE });
  }
  const manualAlbum = Object.entries(overrides.albums || {})
    .filter(([albumId, override]) => {
      const isManual = override?.manual || albumId.startsWith('manual-');
      return !override?.deleted && isManual && normalizeCollectionName(override?.collectionName) === normalizeCollectionName(collectionName);
    })
    .map(([albumId, override]) => createManualAlbumFromOverride(albumId, override))
    .filter((album) => album.coverUrl)
    .sort(compareAlbumsNaturally)[0];

  return cleanText(manualAlbum?.coverUrl);
}

function getCollectionCoverOverrideUrl(collectionName, overrides) {
  const key = findCollectionOverrideKey(collectionName, overrides);
  return key ? cleanText(overrides.collections?.[key]?.coverUrl) : '';
}

function findCollectionOverrideKey(collectionName, overrides) {
  const target = normalizeCollectionName(collectionName);
  if (!target) return '';
  for (const key of Object.keys(overrides?.collections || {})) {
    if (normalizeCollectionName(key) === target) return key;
    if (normalizeCollectionName(overrides.collections?.[key]?.name) === target) return key;
  }
  return '';
}

async function getAlbumCoverUrl(album, overrides) {
  const overrideCoverUrl = cleanText(overrides.albums?.[album.id]?.coverUrl);
  if (overrideCoverUrl) return overrideCoverUrl;
  if (album.coverUrl) return album.coverUrl;
  if (!album.coverTrackId) return '';
  const coverTrack = await getTrackById(album.coverTrackId);
  return createAlbumCoverUrl(album, coverTrack, '', { size: COVER_CACHE_THUMBNAIL_SIZE }) || '';
}

async function getCollectionAlbumSources(collectionName) {
  const normalizedTarget = normalizeCollectionName(collectionName);
  const overrides = await getAlbumOverrides();
  const scannedAlbumIds = [];
  const excludeAlbumIds = [];
  const manualAlbums = [];

  for (const [albumId, override] of Object.entries(overrides.albums || {})) {
    const isManual = override?.manual || albumId.startsWith('manual-');
    if (override?.deleted) {
      if (!isManual) excludeAlbumIds.push(albumId);
      continue;
    }
    if (!Object.hasOwn(override || {}, 'collectionName')) continue;
    const overrideCollectionName = cleanText(override?.collectionName);
    const matches = normalizeCollectionName(overrideCollectionName) === normalizedTarget;

    if (matches && isManual) {
      manualAlbums.push(createManualAlbumFromOverride(albumId, override));
    } else if (matches) {
      scannedAlbumIds.push(albumId);
    } else if (!isManual) {
      excludeAlbumIds.push(albumId);
    }
  }

  return { scannedAlbumIds, excludeAlbumIds, manualAlbums };
}

function normalizeCollectionName(value) {
  return cleanText(value).toLowerCase().replace(/\s+/gu, ' ');
}

function compareAlbumsNaturally(left, right) {
  return NATURAL_SORTER.compare(cleanText(left.artist || left.albumArtist), cleanText(right.artist || right.albumArtist))
    || NATURAL_SORTER.compare(cleanText(left.title), cleanText(right.title))
    || NATURAL_SORTER.compare(cleanText(left.id), cleanText(right.id));
}

function filterManualAlbumsBySearch(albums, search) {
  const tokens = normalizeSearchTokens(search);
  if (tokens.length === 0) return albums;
  return albums.filter((album) => {
    const normalized = normalizeSearchText([
      album.title,
      album.artist,
      album.albumArtist,
      album.genre,
      album.year,
      album.collectionName,
    ].filter(Boolean).join(' '));
    return tokens.every((token) => normalized.includes(token));
  });
}

function normalizeSearchText(value) {
  return cleanText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replace(/['’`]/gu, '')
    .replace(/&/gu, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}

function normalizeSearchTokens(value) {
  return normalizeSearchText(value).split(' ').filter(Boolean);
}

async function getAlbumIdFilterForMediaTypes(value) {
  const selected = normalizeMediaTypeFilter(value);
  if (selected.length === 0) return null;

  const selectedSet = new Set(selected);
  if (selectedSet.size >= 4) return null;

  const overrides = await getAlbumOverrides();
  const overrideEntries = Object.entries(overrides.albums || {});
  const albumIds = [];
  const excludeAlbumIds = [];
  const includeDefaultDigital = selectedSet.has('Digital Media');

  for (const [albumId, override] of overrideEntries) {
    if (override?.deleted) {
      excludeAlbumIds.push(albumId);
      continue;
    }
    const hasMediaOverride = Object.hasOwn(override || {}, 'mediaTypes') || Object.hasOwn(override || {}, 'mediaType');
    if (!hasMediaOverride) continue;
    const mediaTypes = normalizeMediaTypes(override.mediaTypes || override.mediaType, { fallback: [] });
    if (mediaTypes.some((mediaType) => selectedSet.has(mediaType))) {
      albumIds.push(albumId);
    } else if (includeDefaultDigital) {
      excludeAlbumIds.push(albumId);
    }
  }

  if (includeDefaultDigital) {
    return { excludeAlbumIds };
  }
  return { albumIds };
}

async function streamTrack(response, trackId, rangeHeader) {
  const track = await getTrackById(trackId);
  if (!track) {
    return respondJson(response, 404, { error: 'Track not found' });
  }

  const stats = await fs.stat(track.path);
  let range;

  try {
    range = buildByteRange(rangeHeader, stats.size);
  } catch (error) {
    if (error instanceof RangeError) {
      response.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
      response.end();
      return;
    }
    throw error;
  }

  const headers = {
    'Accept-Ranges': 'bytes',
    'Content-Length': String(range.contentLength),
    'Content-Type': getContentType(track.path),
    'Cache-Control': 'private, no-transform',
    'X-Accel-Buffering': 'no',
    'X-Content-Type-Options': 'nosniff',
  };

  if (range.contentRange) {
    headers['Content-Range'] = range.contentRange;
  }

  response.writeHead(range.statusCode, headers);
  createReadStream(track.path, { start: range.start, end: range.end }).pipe(response);
}

async function downloadTrack(response, request, trackId) {
  const track = await getTrackById(trackId);
  if (!track) {
    return respondJson(response, 404, { error: 'Track not found' });
  }

  const payload = await readRequestPayload(request, 64 * 1024);
  const quality = normalizeDownloadQuality(payload.quality);
  const requestedName = sanitizeDownloadFilename(payload.filename);

  if (quality === 'mp3') {
    const releaseSlot = acquireMp3DownloadSlot();
    response.on('close', releaseSlot);
    return downloadTrackAsMp3(response, track, requestedName, releaseSlot);
  }

  return downloadOriginalTrack(response, track, requestedName);
}

async function downloadBulkTracks(response, request) {
  const payload = await readRequestPayload(request, 2_000_000);
  const quality = normalizeDownloadQuality(payload.quality);
  const trackRequests = normalizeBulkTrackRequests(payload.tracks || payload.trackIds);

  if (trackRequests.length === 0) {
    return respondJson(response, 400, { error: 'No tracks selected for download.' });
  }
  if (trackRequests.length > MAX_BULK_DOWNLOAD_TRACKS) {
    return respondJson(response, 400, {
      error: `Bulk downloads are limited to ${MAX_BULK_DOWNLOAD_TRACKS} tracks per request.`,
    });
  }
  if (quality === 'mp3' && !await isFfmpegAvailable()) {
    return respondJson(response, 503, {
      error: 'MP3 conversion requires ffmpeg. Rebuild the Docker image or install ffmpeg on the server.',
    });
  }

  let releaseSlot = null;
  if (quality === 'mp3') {
    releaseSlot = acquireMp3DownloadSlot();
    response.on('close', releaseSlot);
  }

  const tracks = [];
  const usedEntryNames = new Set();
  for (const trackRequest of trackRequests) {
    const track = await getTrackById(trackRequest.id);
    if (!track) continue;
    tracks.push({
      track,
      entryName: createUniqueZipEntryName(createZipEntryName(track, trackRequest, quality), usedEntryNames),
    });
  }

  if (tracks.length === 0) {
    return respondJson(response, 404, { error: 'Selected tracks were not found.' });
  }

  const zipName = sanitizeDownloadFilename(payload.filename) || 'download.zip';
  const zip = new yazl.ZipFile();
  const activeConversions = new Set();

  response.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-Disposition': createContentDisposition(zipName.endsWith('.zip') ? zipName : `${zipName}.zip`),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });

  zip.outputStream.on('error', (error) => {
    if (!response.destroyed) response.destroy(error);
  });
  zip.on('error', (error) => {
    if (!response.destroyed) response.destroy(error);
  });
  response.on('close', () => {
    for (const ffmpeg of activeConversions) {
      if (!ffmpeg.killed) ffmpeg.kill('SIGKILL');
    }
    releaseSlot?.();
  });

  for (const { track, entryName } of tracks) {
    if (quality === 'mp3') {
      zip.addReadStreamLazy(entryName, { compress: false }, (callback) => {
        const { stream, ffmpeg } = createMp3ConversionStream(track);
        activeConversions.add(ffmpeg);
        ffmpeg.on('close', () => activeConversions.delete(ffmpeg));
        callback(null, stream);
      });
    } else {
      const stats = await fs.stat(track.path);
      zip.addFile(track.path, entryName, {
        size: stats.size,
        compress: false,
      });
    }
  }

  zip.end();
  zip.outputStream.pipe(response);
}

async function downloadOriginalTrack(response, track, requestedName) {
  const stats = await fs.stat(track.path);
  const filename = requestedName || sanitizeDownloadFilename(path.basename(track.relativePath || track.path));

  response.writeHead(200, {
    'Content-Length': String(stats.size),
    'Content-Type': getContentType(track.path),
    'Content-Disposition': createContentDisposition(filename),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  createReadStream(track.path).pipe(response);
}

async function downloadTrackAsMp3(response, track, requestedName, releaseSlot = null) {
  if (!await isFfmpegAvailable()) {
    return respondJson(response, 503, {
      error: 'MP3 conversion requires ffmpeg. Rebuild the Docker image or install ffmpeg on the server.',
    });
  }

  const baseName = requestedName
    ? requestedName.replace(/\.[^.]+$/u, '')
    : path.basename(track.relativePath || track.title || 'track', path.extname(track.relativePath || ''));
  const filename = `${sanitizeDownloadFilename(baseName) || 'track'}.mp3`;

  response.writeHead(200, {
    'Content-Type': 'audio/mpeg',
    'Content-Disposition': createContentDisposition(filename),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });

  const ffmpeg = spawn('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    track.path,
    '-map',
    '0:a:0',
    '-vn',
    '-codec:a',
    'libmp3lame',
    '-b:a',
    '320k',
    '-f',
    'mp3',
    'pipe:1',
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderr = '';
  ffmpeg.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  ffmpeg.on('error', (error) => {
    console.error('Unable to start ffmpeg:', error);
    if (!response.destroyed) response.destroy(error);
  });
  ffmpeg.on('close', (code) => {
    if (code && !response.destroyed) {
      console.error(`ffmpeg exited with code ${code}: ${stderr.trim()}`);
      response.destroy(new Error('MP3 conversion failed'));
    }
    releaseSlot?.();
  });
  response.on('close', () => {
    if (!ffmpeg.killed) ffmpeg.kill('SIGKILL');
    releaseSlot?.();
  });

  ffmpeg.stdout.pipe(response);
}

function createMp3ConversionStream(track) {
  const stream = new PassThrough();
  const ffmpeg = spawn('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    track.path,
    '-map',
    '0:a:0',
    '-vn',
    '-codec:a',
    'libmp3lame',
    '-b:a',
    '320k',
    '-f',
    'mp3',
    'pipe:1',
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderr = '';
  ffmpeg.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  ffmpeg.on('error', (error) => {
    stream.destroy(error);
  });
  ffmpeg.on('close', (code) => {
    if (code) {
      stream.destroy(new Error(`MP3 conversion failed for ${track.title}: ${stderr.trim()}`));
    }
  });
  stream.on('close', () => {
    if (!ffmpeg.killed) ffmpeg.kill('SIGKILL');
  });

  ffmpeg.stdout.pipe(stream);
  return { stream, ffmpeg };
}

function normalizeDownloadQuality(value) {
  return String(value || '').toLowerCase() === 'mp3' ? 'mp3' : 'original';
}

function normalizeBulkTrackRequests(value) {
  const items = Array.isArray(value) ? value : [];
  const seen = new Set();
  return items
    .map((item) => {
      if (typeof item === 'string') return { id: item };
      if (item && typeof item === 'object') return item;
      return null;
    })
    .filter(Boolean)
    .map((item) => ({
      id: String(item.id || '').trim(),
      filename: sanitizeDownloadFilename(item.filename),
      folder: sanitizeZipFolder(item.folder),
    }))
    .filter((item) => {
      if (!item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, MAX_BULK_DOWNLOAD_TRACKS);
}

function createZipEntryName(track, trackRequest, quality) {
  const extension = quality === 'mp3'
    ? '.mp3'
    : path.extname(track.relativePath || track.path) || '.audio';
  const requestedBase = trackRequest.filename
    ? trackRequest.filename.replace(/\.[^.]+$/u, '')
    : path.basename(track.relativePath || track.title || 'track', path.extname(track.relativePath || ''));
  const filename = `${sanitizeDownloadFilename(requestedBase) || 'track'}${extension}`;
  const folder = trackRequest.folder ? `${trackRequest.folder}/` : '';
  return sanitizeZipEntryPath(`${folder}${filename}`);
}

function createUniqueZipEntryName(entryName, usedEntryNames) {
  const safeEntryName = entryName || 'track.audio';
  if (!usedEntryNames.has(safeEntryName)) {
    usedEntryNames.add(safeEntryName);
    return safeEntryName;
  }

  const extension = path.posix.extname(safeEntryName);
  const baseName = safeEntryName.slice(0, safeEntryName.length - extension.length);
  let index = 2;
  let candidate = `${baseName} (${index})${extension}`;
  while (usedEntryNames.has(candidate)) {
    index += 1;
    candidate = `${baseName} (${index})${extension}`;
  }
  usedEntryNames.add(candidate);
  return candidate;
}

function sanitizeZipFolder(value) {
  return sanitizeZipEntryPath(String(value || '').replace(/\/?$/u, ''));
}

function sanitizeZipEntryPath(value) {
  return String(value || '')
    .replace(/\\/gu, '/')
    .split('/')
    .map((part) => sanitizeDownloadFilename(part))
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/')
    .slice(0, 240);
}

function sanitizeDownloadFilename(value) {
  return String(value || '')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/gu, '-')
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, 180);
}

function createContentDisposition(filename) {
  const safeFilename = sanitizeDownloadFilename(filename) || 'download';
  const asciiFilename = safeFilename.replace(/[^\x20-\x7e]/gu, '_').replace(/"/gu, "'");
  return `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeRFC5987ValueChars(safeFilename)}`;
}

function encodeRFC5987ValueChars(value) {
  return encodeURIComponent(value)
    .replace(/['()*]/gu, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function isFfmpegAvailable() {
  if (!ffmpegAvailablePromise) {
    ffmpegAvailablePromise = new Promise((resolve) => {
      const check = spawn('ffmpeg', ['-version'], { stdio: 'ignore' });
      check.on('error', () => resolve(false));
      check.on('exit', (code) => resolve(code === 0));
    });
  }
  return ffmpegAvailablePromise;
}

async function streamAlbumCover(response, albumId, url = null) {
  const requestedSize = normalizeCoverSize(url?.searchParams?.get('size'));
  const library = await ensureLibrary();
  const album = library.albums.find((candidate) => candidate.id === albumId);
  if (!album?.coverTrackId) {
    return respondJson(response, 404, { error: 'Cover art not found' });
  }

  const track = trackMap.get(album.coverTrackId) || library.tracks.find((candidate) => candidate.id === album.coverTrackId);
  if (!track) {
    return respondJson(response, 404, { error: 'Cover art not found' });
  }

  const existingCover = findCachedAlbumCover(album.id, requestedSize)
    || (requestedSize !== COVER_CACHE_MAX_SIZE ? await ensureCachedAlbumCoverVariant(album.id, requestedSize) : null)
    || findCachedAlbumCover(album.id, COVER_CACHE_MAX_SIZE);
  if (existingCover) {
    return streamCoverFile(response, existingCover.path, existingCover.format, { immutable: true });
  }

  const cachedCover = await cacheAlbumCover(album, track);
  if (cachedCover) {
    track.cachedCoverPath = cachedCover.path;
    track.cachedCoverFormat = cachedCover.format;
    track.hasEmbeddedCover = true;
    const requestedCover = findCachedAlbumCover(album.id, requestedSize) || cachedCover;
    return streamCoverFile(response, requestedCover.path, requestedCover.format, { immutable: true });
  }

  return streamCover(response, track.id, url);
}

async function streamCover(response, trackId, url = null) {
  const track = await getTrackById(trackId);
  if (!track?.cachedCoverPath && !track?.coverArtPath && !track?.hasEmbeddedCover) {
    return respondJson(response, 404, { error: 'Cover art not found' });
  }

  const requestedSize = normalizeCoverSize(url?.searchParams?.get('size'));

  if (track.cachedCoverPath && existsSync(track.cachedCoverPath)) {
    if (requestedSize !== COVER_CACHE_MAX_SIZE) {
      const targetPath = path.join(coverCachePath, `track-${track.id}-${requestedSize}${COVER_CACHE_EXTENSION}`);
      if (existsSync(targetPath)) {
        return streamCoverFile(response, targetPath, 'image/webp', { immutable: true });
      }
      const resizedCover = await writeOptimizedWebpCover(track.cachedCoverPath, targetPath, requestedSize).catch(() => null);
      if (resizedCover) {
        return streamCoverFile(response, resizedCover.path, resizedCover.format, { immutable: true });
      }
    }
    return streamCoverFile(response, track.cachedCoverPath, track.cachedCoverFormat || getContentType(track.cachedCoverPath), { immutable: true });
  }

  if (track.coverArtPath && existsSync(track.coverArtPath)) {
    if (requestedSize !== COVER_CACHE_MAX_SIZE) {
      const targetPath = path.join(coverCachePath, `track-${track.id}-${requestedSize}${COVER_CACHE_EXTENSION}`);
      if (existsSync(targetPath)) {
        return streamCoverFile(response, targetPath, 'image/webp', { immutable: true });
      }
      const resizedCover = await writeOptimizedWebpCover(track.coverArtPath, targetPath, requestedSize).catch(() => null);
      if (resizedCover) {
        return streamCoverFile(response, resizedCover.path, resizedCover.format, { immutable: true });
      }
    }
    return streamCoverFile(response, track.coverArtPath, getContentType(track.coverArtPath));
  }

  const embeddedCover = await readEmbeddedCover(track.path);
  if (!embeddedCover) {
    track.hasEmbeddedCover = false;
    return respondJson(response, 404, { error: 'Cover art not found' });
  }

  if (requestedSize !== COVER_CACHE_MAX_SIZE) {
    const targetPath = path.join(coverCachePath, `track-${track.id}-${requestedSize}${COVER_CACHE_EXTENSION}`);
    if (existsSync(targetPath)) {
      return streamCoverFile(response, targetPath, 'image/webp', { immutable: true });
    }
    const resizedCover = await writeOptimizedWebpCover(embeddedCover.data, targetPath, requestedSize).catch(() => null);
    if (resizedCover) {
      return streamCoverFile(response, resizedCover.path, resizedCover.format, { immutable: true });
    }
  }

  response.writeHead(200, {
    'Content-Length': String(embeddedCover.data.length),
    'Content-Type': embeddedCover.format || 'image/jpeg',
    'Cache-Control': 'public, max-age=604800',
  });
  response.end(embeddedCover.data);
}

async function streamCoverFile(response, filePath, contentType, { immutable = false } = {}) {
  const stats = await fs.stat(filePath);
  response.writeHead(200, {
    'Content-Length': String(stats.size),
    'Content-Type': contentType || getContentType(filePath),
    'Cache-Control': immutable
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=604800',
    'Last-Modified': stats.mtime.toUTCString(),
    ETag: `"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`,
  });
  createReadStream(filePath).pipe(response);
}

async function updateAlbumCoverOverride(albumId, request) {
  const library = await ensureLibrary();
  const album = library.albums.find((candidate) => candidate.id === albumId);
  if (!album) {
    throw new HttpError(404, 'Album not found');
  }

  const payload = await readRequestJson(request, COVER_UPLOAD_MAX_BYTES + 1024 * 1024);
  let coverUrl = String(payload.coverUrl || '').trim();
  if (payload.coverDataUrl || coverUrl.startsWith('data:image/')) {
    coverUrl = await saveUploadedCoverDataUrl(payload.coverDataUrl || coverUrl, {
      scope: 'album',
      name: album.id,
    });
  }
  if (coverUrl && !isAllowedCoverUrl(coverUrl)) {
    throw new HttpError(400, 'Cover URL must be an http, https, or local / path.');
  }

  const overrides = await getAlbumOverrides();
  overrides.albums ||= {};
  const existingOverride = overrides.albums[album.id] || {};

  if (coverUrl) {
    overrides.albums[album.id] = {
      ...existingOverride,
      title: album.title,
      artist: album.artist,
      coverUrl,
      updatedAt: new Date().toISOString(),
    };
  } else {
    delete existingOverride.coverUrl;
    if (hasAlbumOverrideContent(existingOverride)) {
      overrides.albums[album.id] = {
        ...existingOverride,
        title: album.title,
        artist: album.artist,
        updatedAt: new Date().toISOString(),
      };
    } else {
      delete overrides.albums[album.id];
    }
  }

  await writeAlbumOverrides(overrides);

  return {
    albumId: album.id,
    coverUrl: coverUrl || null,
  };
}

async function renameCollectionName(request) {
  const payload = await readRequestJson(request, 64 * 1024);
  const fromName = cleanText(payload.fromName || payload.name);
  const toName = cleanText(payload.toName || payload.nextName);
  if (!fromName) {
    throw new HttpError(400, 'Collection name is required.');
  }
  if (!toName) {
    throw new HttpError(400, 'New collection name is required.');
  }
  if (normalizeCollectionName(fromName) === normalizeCollectionName(toName)) {
    return {
      renamed: 0,
      overrideUpdates: 0,
      collectionOverrideUpdates: 0,
      collections: await createCollectionOptionsPayload(),
    };
  }

  const databaseResult = await renameCollectionInDatabase(libraryDatabasePath, fromName, toName);
  const overrideUpdates = await renameCollectionInAlbumOverrides(fromName, toName);
  const collectionOverrideUpdates = await renameCollectionInCollectionOverrides(fromName, toName);
  invalidateLibraryMemoryCache();

  return {
    fromName,
    toName,
    renamed: databaseResult.updated || 0,
    overrideUpdates: overrideUpdates + collectionOverrideUpdates,
    collectionOverrideUpdates,
    collections: await createCollectionOptionsPayload(),
  };
}

async function deleteCollectionName(request) {
  const payload = await readRequestJson(request, 64 * 1024);
  const name = cleanText(payload.name || payload.collectionName);
  if (!name) {
    throw new HttpError(400, 'Collection name is required.');
  }

  const databaseResult = await deleteCollectionInDatabase(libraryDatabasePath, name);
  const overrideUpdates = await deleteCollectionFromAlbumOverrides(name);
  const collectionOverrideUpdates = await deleteCollectionFromCollectionOverrides(name);
  invalidateLibraryMemoryCache();

  return {
    name,
    deleted: databaseResult.updated || 0,
    overrideUpdates: overrideUpdates + collectionOverrideUpdates,
    collectionOverrideUpdates,
    collections: await createCollectionOptionsPayload(),
  };
}

async function updateCollectionCoverOverride(request) {
  const payload = await readRequestJson(request, COVER_UPLOAD_MAX_BYTES + 1024 * 1024);
  const name = cleanText(payload.name || payload.collectionName);
  let coverUrl = cleanText(payload.coverUrl);
  if (!name) {
    throw new HttpError(400, 'Collection name is required.');
  }
  if (payload.coverDataUrl || coverUrl.startsWith('data:image/')) {
    coverUrl = await saveUploadedCoverDataUrl(payload.coverDataUrl || coverUrl, {
      scope: 'collection',
      name,
    });
  }
  if (coverUrl && !isAllowedCoverUrl(coverUrl)) {
    throw new HttpError(400, 'Cover URL must be an http, https, or local / path.');
  }

  const overrides = await getCollectionOverrides();
  overrides.collections ||= {};
  const existingKey = findCollectionOverrideKey(name, overrides) || name;
  if (coverUrl) {
    overrides.collections[existingKey] = {
      ...(overrides.collections[existingKey] || {}),
      name,
      coverUrl,
      updatedAt: new Date().toISOString(),
    };
  } else {
    delete overrides.collections[existingKey];
  }

  await writeCollectionOverrides(overrides);
  return {
    name,
    coverUrl: coverUrl || null,
    collections: await createCollectionOptionsPayload(),
  };
}

async function renameCollectionInAlbumOverrides(fromName, toName) {
  const sourceKey = normalizeCollectionName(fromName);
  const overrides = await getAlbumOverrides();
  let changed = 0;
  for (const override of Object.values(overrides.albums || {})) {
    if (!Object.hasOwn(override || {}, 'collectionName')) continue;
    if (normalizeCollectionName(override.collectionName) !== sourceKey) continue;
    override.collectionName = toName;
    override.updatedAt = new Date().toISOString();
    changed += 1;
  }
  if (changed > 0) {
    await writeAlbumOverrides(overrides);
  }
  return changed;
}

async function deleteCollectionFromAlbumOverrides(name) {
  const sourceKey = normalizeCollectionName(name);
  const overrides = await getAlbumOverrides();
  let changed = 0;
  for (const [albumId, override] of Object.entries(overrides.albums || {})) {
    if (!Object.hasOwn(override || {}, 'collectionName')) continue;
    if (normalizeCollectionName(override.collectionName) !== sourceKey) continue;
    const nextOverride = {
      ...override,
      updatedAt: new Date().toISOString(),
    };
    delete nextOverride.collectionName;
    if (hasAlbumOverrideContent(nextOverride)) {
      overrides.albums[albumId] = nextOverride;
    } else {
      delete overrides.albums[albumId];
    }
    changed += 1;
  }
  if (changed > 0) {
    await writeAlbumOverrides(overrides);
  }
  return changed;
}

async function renameCollectionInCollectionOverrides(fromName, toName) {
  const overrides = await getCollectionOverrides();
  const sourceKey = findCollectionOverrideKey(fromName, overrides);
  if (!sourceKey) return 0;

  const existing = overrides.collections?.[sourceKey];
  if (!existing) return 0;

  overrides.collections ||= {};
  delete overrides.collections[sourceKey];
  overrides.collections[toName] = {
    ...existing,
    name: toName,
    updatedAt: new Date().toISOString(),
  };
  await writeCollectionOverrides(overrides);
  return 1;
}

async function deleteCollectionFromCollectionOverrides(name) {
  const overrides = await getCollectionOverrides();
  const sourceKey = findCollectionOverrideKey(name, overrides);
  if (!sourceKey) return 0;

  delete overrides.collections[sourceKey];
  await writeCollectionOverrides(overrides);
  return 1;
}

async function updateAlbumTagOverride(albumId, request) {
  const library = await ensureLibrary();
  const overrides = await getAlbumOverrides();
  overrides.albums ||= {};
  const existingManualOverride = overrides.albums?.[albumId];
  const album = library.albums.find((candidate) => candidate.id === albumId)
    || (existingManualOverride?.manual || albumId.startsWith('manual-')
      ? createManualAlbumFromOverride(albumId, existingManualOverride)
      : null);
  if (!album) {
    throw new HttpError(404, 'Album not found');
  }

  const payload = await readRequestJson(request, COVER_UPLOAD_MAX_BYTES + 1024 * 1024);

  if (payload.reset) {
    delete overrides.albums[album.id];
    await writeAlbumOverrides(overrides);
    return { albumId: album.id, reset: true, manual: Boolean(album.manual) };
  }

  let coverUrl = cleanText(payload.coverUrl);
  if (payload.coverDataUrl || coverUrl.startsWith('data:image/')) {
    coverUrl = await saveUploadedCoverDataUrl(payload.coverDataUrl || coverUrl, {
      scope: 'album',
      name: album.id,
    });
  }
  if (coverUrl && !isAllowedCoverUrl(coverUrl)) {
    throw new HttpError(400, 'Cover URL must be an http, https, or local / path.');
  }

  let trackOverrides = existingManualOverride?.tracks && typeof existingManualOverride.tracks === 'object'
    ? { ...existingManualOverride.tracks }
    : {};
  if (Array.isArray(payload.tracks)) {
    const allowedTrackIds = new Set(album.trackIds);
    trackOverrides = {};
    for (const track of payload.tracks) {
      const trackId = cleanText(track.id);
      if (!album.manual && !allowedTrackIds.has(trackId)) continue;
      if (album.manual && !trackId) continue;

      const override = {
        title: cleanText(track.title),
        artist: cleanText(track.artist),
        trackNumber: normalizePositiveInteger(track.trackNumber),
        discNumber: normalizePositiveInteger(track.discNumber),
      };

      if (hasTrackOverrideContent(override)) {
        trackOverrides[trackId] = override;
      }
    }
  }

  const override = {
    manual: Boolean(album.manual),
    title: album.title,
    artist: album.artist,
    albumTitle: cleanText(payload.albumTitle),
    albumArtist: cleanText(payload.albumArtist),
    date: cleanText(payload.date),
    year: normalizeYear(payload.year || payload.date),
    genre: cleanText(payload.genre),
    collectionName: cleanText(payload.collectionName),
    mediaTypes: normalizeMediaTypes(payload.mediaTypes || payload.mediaType, { fallback: [] }),
    status: normalizeAlbumStatus(payload.status),
    coverUrl,
    musicBrainzId: cleanText(payload.musicBrainzId),
    tracks: trackOverrides,
    updatedAt: new Date().toISOString(),
  };

  if (hasAlbumOverrideContent(override)) {
    overrides.albums[album.id] = override;
  } else {
    delete overrides.albums[album.id];
  }

  await writeAlbumOverrides(overrides);
  return {
    albumId: album.id,
    reset: !hasAlbumOverrideContent(override),
    manual: Boolean(album.manual),
  };
}

async function deleteAlbumFromLibrary(albumId) {
  const library = await ensureLibrary();
  const overrides = await getAlbumOverrides();
  overrides.albums ||= {};
  const existingOverride = overrides.albums?.[albumId] || null;
  const album = library.albums.find((candidate) => candidate.id === albumId)
    || (existingOverride?.manual || albumId.startsWith('manual-')
      ? createManualAlbumFromOverride(albumId, existingOverride)
      : null);

  if (!album && !existingOverride) {
    throw new HttpError(404, 'Album not found');
  }

  const isManual = Boolean(existingOverride?.manual || album?.manual || albumId.startsWith('manual-'));
  if (isManual) {
    delete overrides.albums[albumId];
  } else {
    overrides.albums[albumId] = {
      ...(existingOverride || {}),
      manual: false,
      title: cleanText(existingOverride?.title || album?.title),
      artist: cleanText(existingOverride?.artist || album?.artist),
      albumTitle: cleanText(existingOverride?.albumTitle || album?.title),
      albumArtist: cleanText(existingOverride?.albumArtist || album?.albumArtist || album?.artist),
      deleted: true,
      updatedAt: new Date().toISOString(),
    };
  }

  await writeAlbumOverrides(overrides);
  clearHomeAlbumCache();
  return { albumId, deleted: true, manual: isManual };
}

async function createManualAlbum(request) {
  const payload = await readRequestJson(request, COVER_UPLOAD_MAX_BYTES + 1024 * 1024);
  let coverUrl = cleanText(payload.coverUrl);
  if (payload.coverDataUrl || coverUrl.startsWith('data:image/')) {
    coverUrl = await saveUploadedCoverDataUrl(payload.coverDataUrl || coverUrl, {
      scope: 'album',
      name: payload.albumTitle || payload.albumArtist || 'manual',
    });
  }
  if (coverUrl && !isAllowedCoverUrl(coverUrl)) {
    throw new HttpError(400, 'Cover URL must be an http, https, or local / path.');
  }

  const albumTitle = cleanText(payload.albumTitle);
  if (!albumTitle) {
    throw new HttpError(400, 'Album title is required.');
  }

  const albumId = `manual-${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`;
  const overrides = await getAlbumOverrides();
  overrides.albums ||= {};
  overrides.albums[albumId] = {
    manual: true,
    title: albumTitle,
    artist: cleanText(payload.albumArtist),
    albumTitle,
    albumArtist: cleanText(payload.albumArtist),
    date: cleanText(payload.date),
    year: normalizeYear(payload.year || payload.date),
    genre: cleanText(payload.genre),
    collectionName: cleanText(payload.collectionName),
    mediaTypes: normalizeMediaTypes(payload.mediaTypes || payload.mediaType, { fallback: [] }),
    status: normalizeAlbumStatus(payload.status || 'Wishlist'),
    coverUrl,
    musicBrainzId: cleanText(payload.musicBrainzId),
    tracks: normalizeManualTrackOverrides(payload.tracks, albumId, cleanText(payload.albumArtist)),
    updatedAt: new Date().toISOString(),
  };
  await writeAlbumOverrides(overrides);

  return {
    albumId,
    library: await createLibraryPayload(await createManualWishlistLibrary()),
  };
}

async function createManualWishlistLibrary() {
  const { manualAlbums } = await getWishlistAlbumSources();
  const overrides = await getAlbumOverrides();
  const tracks = manualAlbums.flatMap((album) =>
    getManualAlbumTracksFromOverride(album.id, overrides.albums?.[album.id], {
      albumTitle: album.title,
      albumArtist: album.albumArtist || album.artist,
      coverUrl: album.coverUrl || '',
    }),
  );
  return {
    generatedAt: null,
    trackCount: tracks.length,
    albumCount: manualAlbums.length,
    albums: manualAlbums,
    tracks,
    page: {
      limit: manualAlbums.length || 1,
      offset: 0,
      total: manualAlbums.length,
      hasNext: false,
      hasPrevious: false,
    },
  };
}

function normalizeManualTrackOverrides(tracks, albumId, fallbackArtist = '') {
  if (!Array.isArray(tracks)) return {};
  const normalized = {};
  tracks.forEach((track, index) => {
    const trackId = cleanText(track.id) || `${albumId}-track-${index + 1}`;
    const override = {
      title: cleanText(track.title),
      artist: cleanText(track.artist) || fallbackArtist,
      trackNumber: normalizePositiveInteger(track.trackNumber) || index + 1,
      discNumber: normalizePositiveInteger(track.discNumber) || 1,
    };
    if (hasTrackOverrideContent(override)) {
      normalized[trackId] = override;
    }
  });
  return normalized;
}

function getManualAlbumTracksFromOverride(albumId, override = {}, { albumTitle = '', albumArtist = '', coverUrl = '' } = {}) {
  const entries = Object.entries(override?.tracks || {});
  return entries
    .map(([trackId, trackOverride], index) => ({
      id: trackId,
      manual: true,
      albumId,
      title: cleanText(trackOverride?.title) || `Track ${index + 1}`,
      artist: cleanText(trackOverride?.artist) || albumArtist || 'Unknown Artist',
      albumArtist: albumArtist || 'Unknown Artist',
      album: albumTitle || 'Untitled Album',
      trackNumber: normalizePositiveInteger(trackOverride?.trackNumber) || index + 1,
      discNumber: normalizePositiveInteger(trackOverride?.discNumber) || 1,
      relativePath: '',
      coverUrl: cleanText(coverUrl) || null,
      duration: 0,
      audioQuality: null,
    }))
    .sort((left, right) =>
      NATURAL_SORTER.compare(String(left.discNumber || 1), String(right.discNumber || 1))
      || NATURAL_SORTER.compare(String(left.trackNumber || 0), String(right.trackNumber || 0))
      || NATURAL_SORTER.compare(cleanText(left.title), cleanText(right.title)));
}

async function getTrackLyrics(trackId) {
  await ensureLibrary();
  const track = trackMap.get(trackId);
  if (!track) {
    throw new HttpError(404, 'Track not found');
  }

  const overrides = await getLyricsOverrides();
  const exactLyrics = overrides.tracks?.[trackId] || null;
  const fileFolderLyrics = await readLyricsFileBesideTrack(track);
  const sidecarLyrics = await readLyricsSidecar(track);
  const lyrics = fileFolderLyrics
    || sidecarLyrics
    || (lyricsHasText(exactLyrics)
    ? exactLyrics
    : findLyricsOverrideForTrack(overrides, track)?.lyrics || null);
  if (!sidecarLyrics && lyricsHasText(lyrics)) {
    await writeLyricsSidecar(track, lyrics);
  }
  return normalizeLyricsPayload(track, lyrics);
}

async function updateTrackLyrics(trackId, request) {
  await ensureLibrary();
  const track = trackMap.get(trackId);
  if (!track) {
    throw new HttpError(404, 'Track not found');
  }

  const payload = await readRequestJson(request, 512 * 1024);
  const overrides = await getLyricsOverrides();
  overrides.tracks ||= {};

  if (payload.reset) {
    delete overrides.tracks[trackId];
    const fallback = findLyricsOverrideForTrack(overrides, track);
    if (fallback) {
      delete overrides.tracks[fallback.trackId];
    }
    await writeLyricsSidecar(track, null);
    await writeLyricsFileBesideTrack(track, null);
    await writeLyricsOverrides(overrides);
    return normalizeLyricsPayload(track, null);
  }

  const syncedLyrics = cleanLyricsText(payload.syncedLyrics);
  const plainLyrics = cleanLyricsText(payload.plainLyrics);
  const source = cleanText(payload.source) || 'manual';
  const sourceUrl = cleanText(payload.sourceUrl);

  if (!syncedLyrics && !plainLyrics) {
    delete overrides.tracks[trackId];
    const fallback = findLyricsOverrideForTrack(overrides, track);
    if (fallback) {
      delete overrides.tracks[fallback.trackId];
    }
    await writeLyricsSidecar(track, null);
    await writeLyricsFileBesideTrack(track, null);
    await writeLyricsOverrides(overrides);
    return normalizeLyricsPayload(track, null);
  } else {
    const fallback = findLyricsOverrideForTrack(overrides, track);
    if (fallback && fallback.trackId !== trackId) {
      delete overrides.tracks[fallback.trackId];
    }
    overrides.tracks[trackId] = {
      title: track.title,
      artist: track.artist,
      album: track.album,
      syncedLyrics,
      plainLyrics,
      source,
      sourceUrl,
      updatedAt: new Date().toISOString(),
    };
    await writeLyricsSidecar(track, overrides.tracks[trackId]);
    await writeLyricsFileBesideTrack(track, overrides.tracks[trackId]);
  }

  await writeLyricsOverrides(overrides);
  return normalizeLyricsPayload(track, overrides.tracks[trackId] || null);
}

async function searchTrackLyrics(trackId, url) {
  const track = trackMap.get(trackId);
  if (!track) {
    throw new HttpError(404, 'Track not found');
  }

  const query = cleanText(url.searchParams.get('q'));
  const searchUrl = new URL('https://lrclib.net/api/search');
  if (query) {
    searchUrl.searchParams.set('q', query);
  } else {
    searchUrl.searchParams.set('track_name', track.title);
    searchUrl.searchParams.set('artist_name', track.artist);
    searchUrl.searchParams.set('album_name', track.album);
  }

  const response = await fetch(searchUrl, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Monochrome-Streamer/1.0 (local lyrics lookup)',
    },
  });
  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new HttpError(response.status, `LRCLIB request failed: ${response.status}`);
  }

  const data = await response.json();
  const results = Array.isArray(data) ? data : [data].filter(Boolean);
  return results.slice(0, 8).map((result) => ({
    id: result.id ?? null,
    title: cleanText(result.trackName || result.name || track.title),
    artist: cleanText(result.artistName || track.artist),
    album: cleanText(result.albumName || track.album),
    duration: Number(result.duration) || null,
    syncedLyrics: cleanLyricsText(result.syncedLyrics),
    plainLyrics: cleanLyricsText(result.plainLyrics),
    instrumental: Boolean(result.instrumental),
    source: 'LRCLIB',
    sourceUrl: result.id ? `https://lrclib.net/api/get/${result.id}` : 'https://lrclib.net',
  }));
}

async function searchAlbumTagSuggestions(albumId, url) {
  const library = await ensureLibrary();
  const album = library.albums.find((candidate) => candidate.id === albumId);
  if (!album) {
    throw new HttpError(404, 'Album not found');
  }

  const query = cleanText(url.searchParams.get('q')) || `${album.albumArtist || album.artist} ${album.title}`;
  const searchUrl = new URL('https://musicbrainz.org/ws/2/release');
  searchUrl.searchParams.set('fmt', 'json');
  searchUrl.searchParams.set('query', query);
  searchUrl.searchParams.set('limit', '8');

  const searchData = await fetchMusicBrainzJson(searchUrl);
  const releases = Array.isArray(searchData.releases) ? searchData.releases : [];
  const suggestions = releases.slice(0, 6).map((release) => normalizeMusicBrainzReleaseSearchResult(release));

  return {
    query,
    suggestions,
  };
}

async function searchMusicBrainzTagSuggestions(url) {
  const query = cleanText(url.searchParams.get('q'));
  if (!query) {
    return { query: '', suggestions: [] };
  }

  const searchUrl = new URL('https://musicbrainz.org/ws/2/release');
  searchUrl.searchParams.set('fmt', 'json');
  searchUrl.searchParams.set('query', query);
  searchUrl.searchParams.set('limit', '8');

  const searchData = await fetchMusicBrainzJson(searchUrl);
  const releases = Array.isArray(searchData.releases) ? searchData.releases : [];
  return {
    query,
    suggestions: releases.slice(0, 6).map((release) => normalizeMusicBrainzReleaseSearchResult(release)),
  };
}

async function fetchMusicBrainzReleaseSuggestion(releaseId) {
  const releaseUrl = new URL(`https://musicbrainz.org/ws/2/release/${encodeURIComponent(releaseId)}`);
  releaseUrl.searchParams.set('fmt', 'json');
  releaseUrl.searchParams.set('inc', 'artists+recordings+genres+release-groups');
  const release = await fetchMusicBrainzJson(releaseUrl);
  return normalizeMusicBrainzReleaseDetail(release);
}

async function fetchMusicBrainzJson(url) {
  let response;
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': 'Monochrome-Streamer/0.1 (local self-hosted music library)' },
    });
  } catch (error) {
    const certificateHint = error.cause?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
      ? ' On Windows/local Node, start with NODE_OPTIONS=--use-system-ca.'
      : '';
    throw new HttpError(502, `Unable to reach MusicBrainz.${certificateHint}`);
  }

  if (!response.ok) {
    throw new HttpError(response.status, `MusicBrainz request failed: ${response.status}`);
  }
  return response.json();
}

function normalizeMusicBrainzReleaseSearchResult(release) {
  return {
    id: release.id,
    title: release.title || '',
    artist: formatArtistCredit(release['artist-credit']),
    date: release.date || '',
    country: release.country || '',
    status: release.status || '',
    trackCount: release['track-count'] || null,
    score: release.score || 0,
    disambiguation: release.disambiguation || '',
    coverUrl: release.id ? `https://coverartarchive.org/release/${release.id}/front-250` : '',
  };
}

function normalizeMusicBrainzReleaseDetail(release) {
  const genres = Array.isArray(release.genres) ? release.genres : [];
  const genre = genres
    .slice()
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .map((item) => item.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(', ');
  const tracks = [];

  for (const medium of Array.isArray(release.media) ? release.media : []) {
    for (const track of Array.isArray(medium.tracks) ? medium.tracks : []) {
      tracks.push({
        title: track.title || track.recording?.title || '',
        artist: formatArtistCredit(track['artist-credit']) || formatArtistCredit(track.recording?.['artist-credit']),
        trackNumber: normalizePositiveInteger(track.number) || normalizePositiveInteger(track.position),
        discNumber: normalizePositiveInteger(medium.position),
        duration: track.length ? Math.round(track.length / 1000) : null,
      });
    }
  }

  return {
    id: release.id,
    albumTitle: release.title || '',
    albumArtist: formatArtistCredit(release['artist-credit']),
    date: release.date || '',
    year: normalizeYear(release.date),
    genre,
    coverUrl: release.id ? `https://coverartarchive.org/release/${release.id}/front-500` : '',
    sourceUrl: release.id ? `https://musicbrainz.org/release/${release.id}` : '',
    tracks,
  };
}

function formatArtistCredit(artistCredit) {
  if (!Array.isArray(artistCredit)) return '';
  return artistCredit
    .map((credit) => {
      if (typeof credit === 'string') return credit;
      return `${credit.name || credit.artist?.name || ''}${credit.joinphrase || ''}`;
    })
    .join('')
    .trim();
}

function hasAlbumOverrideContent(override) {
  if (!override) return false;
  return Boolean(
    override.albumTitle
      || override.albumArtist
      || override.date
      || override.year
      || override.genre
      || Object.hasOwn(override, 'collectionName')
      || override.mediaType
      || override.mediaTypes?.length > 0
      || override.status
      || override.coverUrl
      || override.musicBrainzId
      || override.deleted
      || Object.keys(override.tracks || {}).length > 0,
  );
}

function hasTrackOverrideContent(override) {
  return Boolean(
    override.title
      || override.artist
      || override.trackNumber
      || override.discNumber,
  );
}

function cleanText(value) {
  return String(value || '').trim();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#39;');
}

function cleanLyricsText(value) {
  return String(value || '').replace(/\r\n?/gu, '\n').trim();
}

function normalizePositiveInteger(value) {
  const number = Number.parseInt(String(value || '').trim(), 10);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function normalizeYear(value) {
  const match = String(value || '').match(/\b(\d{4})\b/u);
  return match ? match[1] : null;
}

function normalizeMediaTypes(value, { fallback = ['Digital Media'] } = {}) {
  const allowed = new Set(['CD', 'Digital Media', 'Vinyl', 'Cassette Tape']);
  const values = Array.isArray(value) ? value : [value];
  const mediaTypes = values.map(normalizeMediaTypeName).filter((item) => allowed.has(item));
  return mediaTypes.length > 0 ? [...new Set(mediaTypes)] : [...fallback];
}

function normalizeMediaTypeFilter(value) {
  if (!value) return [];
  const allowed = new Set(['CD', 'Digital Media', 'Vinyl', 'Cassette Tape']);
  const mediaTypes = String(value)
    .split(',')
    .map(normalizeMediaTypeName)
    .filter((mediaType) => allowed.has(mediaType));
  return [...new Set(mediaTypes)];
}

function normalizeMediaTypeName(value) {
  const mediaType = cleanText(value);
  if (/^cassette[-\s]?tape$/iu.test(mediaType)) return 'Cassette Tape';
  return mediaType;
}

function normalizeAlbumStatus(value) {
  const allowed = new Set(['Collection', 'Wishlist']);
  const status = cleanText(value);
  if (/^wanted$/iu.test(status)) return 'Wishlist';
  return allowed.has(status) ? status : 'Collection';
}

async function getAlbumOverrides() {
  if (albumOverridesCache) {
    return albumOverridesCache;
  }

  albumOverridesCache = await readAlbumOverridesDatabase(libraryDatabasePath);
  if (Object.keys(albumOverridesCache.albums || {}).length === 0) {
    const legacyOverrides = await readLegacyJsonOverrides(albumOverridesPath, 'albums');
    if (Object.keys(legacyOverrides.albums || {}).length > 0) {
      await writeAlbumOverridesDatabase(libraryDatabasePath, legacyOverrides);
      albumOverridesCache = legacyOverrides;
      console.log(`Migrated legacy album overrides into ${libraryDatabasePath}`);
    }
  }
  return albumOverridesCache;
}

async function writeAlbumOverrides(overrides) {
  if (!libraryDatabasePath) {
    throw new HttpError(400, 'Album cover editing is not configured.');
  }

  await writeAlbumOverridesDatabase(libraryDatabasePath, overrides);
  albumOverridesCache = overrides;
  clearHomeAlbumCache();
}

async function getCollectionOverrides() {
  if (collectionOverridesCache) {
    return collectionOverridesCache;
  }

  collectionOverridesCache = await readCollectionOverridesDatabase(libraryDatabasePath);
  return collectionOverridesCache;
}

async function writeCollectionOverrides(overrides) {
  if (!libraryDatabasePath) {
    throw new HttpError(400, 'Collection editing is not configured.');
  }

  await writeCollectionOverridesDatabase(libraryDatabasePath, overrides);
  collectionOverridesCache = overrides;
}

function normalizeLyricsPayload(track, lyrics) {
  return {
    trackId: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    syncedLyrics: lyrics?.syncedLyrics || '',
    plainLyrics: lyrics?.plainLyrics || '',
    source: lyrics?.source || '',
    sourceUrl: lyrics?.sourceUrl || '',
    updatedAt: lyrics?.updatedAt || null,
  };
}

async function readLyricsSidecar(track) {
  const sidecarFilePath = getLyricsSidecarPath(track);
  if (!sidecarFilePath || !existsSync(sidecarFilePath)) return null;

  const syncedLyrics = cleanLyricsText(await fs.readFile(sidecarFilePath, 'utf8'));
  if (!syncedLyrics) return null;

  const stats = await fs.stat(sidecarFilePath);
  return {
    title: track.title,
    artist: track.artist,
    album: track.album,
    syncedLyrics,
    plainLyrics: '',
    source: 'sidecar',
    sourceUrl: sidecarFilePath,
    updatedAt: stats.mtime.toISOString(),
  };
}

async function readLyricsFileBesideTrack(track) {
  const lyricsFilePath = getLyricsFileBesideTrackPath(track);
  if (!lyricsFilePath || !existsSync(lyricsFilePath)) return null;

  const syncedLyrics = cleanLyricsText(await fs.readFile(lyricsFilePath, 'utf8'));
  if (!syncedLyrics) return null;

  const stats = await fs.stat(lyricsFilePath);
  return {
    title: track.title,
    artist: track.artist,
    album: track.album,
    syncedLyrics,
    plainLyrics: '',
    source: 'file-sidecar',
    sourceUrl: lyricsFilePath,
    updatedAt: stats.mtime.toISOString(),
  };
}

async function writeLyricsSidecar(track, lyrics) {
  const sidecarFilePath = getLyricsSidecarPath(track);
  if (!sidecarFilePath) return;

  const syncedLyrics = cleanLyricsText(lyrics?.syncedLyrics);
  const plainLyrics = cleanLyricsText(lyrics?.plainLyrics);
  const lyricsText = syncedLyrics || plainLyrics;
  if (!lyricsText) {
    await fs.rm(sidecarFilePath, { force: true });
    return;
  }

  await fs.mkdir(path.dirname(sidecarFilePath), { recursive: true });
  await fs.writeFile(sidecarFilePath, `${lyricsText}\n`, 'utf8');
}

async function writeLyricsFileBesideTrack(track, lyrics) {
  const lyricsFilePath = getLyricsFileBesideTrackPath(track);
  if (!lyricsFilePath) return;

  const syncedLyrics = cleanLyricsText(lyrics?.syncedLyrics);
  const plainLyrics = cleanLyricsText(lyrics?.plainLyrics);
  const lyricsText = syncedLyrics || plainLyrics;
  if (!lyricsText) {
    await fs.rm(lyricsFilePath, { force: true });
    return;
  }

  await fs.writeFile(lyricsFilePath, `${lyricsText}\n`, 'utf8');
}

function getLyricsSidecarPath(track) {
  if (!lyricsSidecarPath || !track?.relativePath) return '';

  const basePath = path.resolve(lyricsSidecarPath);
  const normalizedRelativePath = track.relativePath.replace(/\\/gu, '/');
  const parsedPath = path.posix.parse(normalizedRelativePath);
  const relativeLyricsPath = path.join(parsedPath.dir, `${parsedPath.name}.lrc`);
  const sidecarFilePath = path.resolve(basePath, relativeLyricsPath);

  if (sidecarFilePath !== basePath && !sidecarFilePath.startsWith(`${basePath}${path.sep}`)) {
    throw new HttpError(400, 'Lyrics sidecar path is outside the configured lyrics folder.');
  }

  return sidecarFilePath;
}

function getLyricsFileBesideTrackPath(track) {
  if (!track?.path) return '';

  const basePath = path.resolve(libraryRoot);
  const trackPath = path.resolve(track.path);
  if (trackPath !== basePath && !trackPath.startsWith(`${basePath}${path.sep}`)) {
    throw new HttpError(400, 'Track path is outside the configured music library.');
  }

  const parsedPath = path.parse(trackPath);
  return path.join(parsedPath.dir, `${parsedPath.name}.lrc`);
}

async function migrateLyricsOverridesToSidecars() {
  if (!lyricsSidecarPath || !lyricsOverridesPath) return;

  try {
    const library = await ensureLibrary();
    const overrides = await getLyricsOverrides();
    let migratedCount = 0;

    for (const track of library.tracks) {
      const exactLyrics = overrides.tracks?.[track.id] || null;
      const lyrics = lyricsHasText(exactLyrics)
        ? exactLyrics
        : findLyricsOverrideForTrack(overrides, track)?.lyrics || null;
      if (!lyricsHasText(lyrics)) continue;

      const sidecarFilePath = getLyricsSidecarPath(track);
      if (sidecarFilePath && !existsSync(sidecarFilePath)) {
        await writeLyricsSidecar(track, lyrics);
        migratedCount += 1;
      }
    }

    if (migratedCount > 0) {
      console.log(`Migrated ${migratedCount} saved lyric file${migratedCount === 1 ? '' : 's'} to ${lyricsSidecarPath}`);
    }
  } catch (error) {
    console.warn('Unable to migrate saved lyrics to sidecar files:', error instanceof Error ? error.message : error);
  }
}

function findLyricsOverrideForTrack(overrides, track) {
  const entries = Object.entries(overrides.tracks || {})
    .filter(([, lyrics]) => lyricsHasText(lyrics));
  if (entries.length === 0) return null;

  const trackTitle = normalizeLyricsLookupValue(track.title);
  const trackArtist = normalizeLyricsLookupValue(track.artist);
  const trackAlbum = normalizeLyricsLookupValue(track.album);
  const exactMatch = entries.find(([, lyrics]) => (
    normalizeLyricsLookupValue(lyrics.title) === trackTitle
    && normalizeLyricsLookupValue(lyrics.artist) === trackArtist
    && normalizeLyricsLookupValue(lyrics.album) === trackAlbum
  ));
  if (exactMatch) {
    return { trackId: exactMatch[0], lyrics: exactMatch[1] };
  }

  const titleArtistMatches = entries.filter(([, lyrics]) => (
    normalizeLyricsLookupValue(lyrics.title) === trackTitle
    && normalizeLyricsLookupValue(lyrics.artist) === trackArtist
  ));
  if (titleArtistMatches.length === 1) {
    return { trackId: titleArtistMatches[0][0], lyrics: titleArtistMatches[0][1] };
  }

  return null;
}

function lyricsHasText(lyrics) {
  return Boolean(cleanText(lyrics?.syncedLyrics) || cleanText(lyrics?.plainLyrics));
}

function normalizeLyricsLookupValue(value) {
  return cleanText(value).toLowerCase().replace(/\s+/gu, ' ');
}

async function getLyricsOverrides() {
  if (lyricsOverridesCache) {
    return lyricsOverridesCache;
  }

  lyricsOverridesCache = await readLyricsOverridesDatabase(libraryDatabasePath);
  if (Object.keys(lyricsOverridesCache.tracks || {}).length === 0) {
    const legacyOverrides = await readLegacyJsonOverrides(lyricsOverridesPath, 'tracks');
    if (Object.keys(legacyOverrides.tracks || {}).length > 0) {
      await writeLyricsOverridesDatabase(libraryDatabasePath, legacyOverrides);
      lyricsOverridesCache = legacyOverrides;
      console.log(`Migrated legacy lyrics overrides into ${libraryDatabasePath}`);
    }
  }
  return lyricsOverridesCache;
}

async function writeLyricsOverrides(overrides) {
  if (!libraryDatabasePath) {
    throw new HttpError(400, 'Lyrics editing is not configured.');
  }

  await writeLyricsOverridesDatabase(libraryDatabasePath, overrides);
  lyricsOverridesCache = overrides;
}

async function readRequestJson(request, maxBytes) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > maxBytes) {
      throw new HttpError(413, 'Request body is too large.');
    }
  }

  try {
    return body ? JSON.parse(body) : {};
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
}

async function readRequestFile(request, filePath, maxBytes) {
  const handle = await fs.open(filePath, 'w');
  let bytesWritten = 0;
  try {
    for await (const chunk of request) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      bytesWritten += buffer.length;
      if (bytesWritten > maxBytes) {
        throw new HttpError(413, 'Uploaded database is too large.');
      }
      await handle.write(buffer);
    }
    return bytesWritten;
  } finally {
    await handle.close();
  }
}

async function readRequestPayload(request, maxBytes) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > maxBytes) {
      throw new HttpError(413, 'Request body is too large.');
    }
  }

  const contentType = String(request.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(body);
    const payload = params.get('payload');
    if (payload) {
      try {
        return JSON.parse(payload);
      } catch {
        throw new HttpError(400, 'Request payload must be valid JSON.');
      }
    }
    return Object.fromEntries(params.entries());
  }

  try {
    return body ? JSON.parse(body) : {};
  } catch {
    throw new HttpError(400, 'Request payload must be valid JSON.');
  }
}

async function readLegacyJsonOverrides(filePath, storeKey) {
  if (!filePath || !existsSync(filePath)) {
    return { [storeKey]: {} };
  }

  try {
    const rawOverrides = JSON.parse(await fs.readFile(filePath, 'utf8'));
    return {
      [storeKey]: rawOverrides[storeKey] && typeof rawOverrides[storeKey] === 'object'
        ? rawOverrides[storeKey]
        : {},
    };
  } catch (error) {
    console.warn(`Unable to migrate legacy ${path.basename(filePath)}:`, error instanceof Error ? error.message : error);
    return { [storeKey]: {} };
  }
}

function isAllowedCoverUrl(value) {
  if (value.startsWith('/')) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function getArtistInfo(artistName) {
  const normalizedName = normalizeArtistName(artistName);
  if (!normalizedName) {
    return createEmptyArtistInfo(artistName);
  }

  if (artistInfoCache.has(normalizedName)) {
    return artistInfoCache.get(normalizedName);
  }

  const editedInfo = await getEditedArtistInfo(normalizedName);
  if (editedInfo) {
    const info = {
      name: artistName,
      imageUrl: editedInfo.imageUrl || null,
      bio: editedInfo.bio || '',
      sourceUrl: editedInfo.sourceUrl || '',
      source: editedInfo.source || 'edited',
    };
    artistInfoCache.set(normalizedName, info);
    return info;
  }

  const manualInfo = await getManualArtistInfo(normalizedName);
  if (manualInfo) {
    const info = {
      name: artistName,
      imageUrl: manualInfo.imageUrl || null,
      bio: manualInfo.bio || '',
      sourceUrl: manualInfo.sourceUrl || '',
      source: manualInfo.source || 'manual',
    };
    artistInfoCache.set(normalizedName, info);
    return info;
  }

  const onlineInfo = await fetchWikipediaArtistInfo(artistName).catch((error) => {
    console.warn(`Unable to fetch artist info for ${artistName}:`, error.message);
    return null;
  });

  const info = onlineInfo || createEmptyArtistInfo(artistName);
  artistInfoCache.set(normalizedName, info);
  return info;
}

async function updateArtistInfo(artistName, request) {
  const normalizedName = normalizeArtistName(artistName);
  if (!normalizedName) {
    throw new HttpError(400, 'Artist name is required.');
  }

  const payload = await readRequestJson(request, 256 * 1024);
  const imageUrl = cleanText(payload.imageUrl);
  const sourceUrl = cleanText(payload.sourceUrl);
  if (imageUrl && !isAllowedCoverUrl(imageUrl)) {
    throw new HttpError(400, 'Artist image URL must be an http, https, or local / path.');
  }
  if (sourceUrl && !isAllowedCoverUrl(sourceUrl)) {
    throw new HttpError(400, 'Artist source URL must be an http, https, or local / path.');
  }

  const overrides = await getArtistOverrides();
  overrides.artists ||= {};

  if (payload.reset) {
    delete overrides.artists[artistName];
    for (const key of Object.keys(overrides.artists)) {
      if (normalizeArtistName(key) === normalizedName) {
        delete overrides.artists[key];
      }
    }
    await writeArtistOverrides(overrides);
    artistInfoCache.delete(normalizedName);
    return createEmptyArtistInfo(artistName);
  }

  const info = {
    imageUrl,
    bio: cleanText(payload.bio),
    sourceUrl,
    source: 'edited',
    updatedAt: new Date().toISOString(),
  };

  overrides.artists[artistName] = info;
  await writeArtistOverrides(overrides);

  const result = {
    name: artistName,
    imageUrl: info.imageUrl || null,
    bio: info.bio,
    sourceUrl: info.sourceUrl,
    source: info.source,
  };
  artistInfoCache.set(normalizedName, result);
  return result;
}

async function getEditedArtistInfo(normalizedName) {
  const overrides = await getArtistOverrides();
  for (const [name, info] of Object.entries(overrides.artists || {})) {
    if (normalizeArtistName(name) === normalizedName) {
      return info;
    }
  }
  return null;
}

async function getArtistOverrides() {
  if (artistOverridesCache) {
    return artistOverridesCache;
  }

  artistOverridesCache = await readArtistOverridesDatabase(libraryDatabasePath);
  if (Object.keys(artistOverridesCache.artists || {}).length === 0) {
    const legacyOverrides = await readLegacyJsonOverrides(artistOverridesPath, 'artists');
    if (Object.keys(legacyOverrides.artists || {}).length > 0) {
      await writeArtistOverridesDatabase(libraryDatabasePath, legacyOverrides);
      artistOverridesCache = legacyOverrides;
      console.log(`Migrated legacy artist overrides into ${libraryDatabasePath}`);
    }
  }
  return artistOverridesCache;
}

async function writeArtistOverrides(overrides) {
  if (!libraryDatabasePath) {
    throw new HttpError(400, 'Artist editing is not configured.');
  }

  await writeArtistOverridesDatabase(libraryDatabasePath, overrides);
  artistOverridesCache = overrides;
}

async function getManualArtistInfo(normalizedName) {
  if (!artistInfoPath) return null;

  if (!manualArtistInfoCache) {
    manualArtistInfoCache = new Map();
    if (existsSync(artistInfoPath)) {
      const rawInfo = JSON.parse(await fs.readFile(artistInfoPath, 'utf8'));
      for (const [name, info] of Object.entries(rawInfo.artists || rawInfo)) {
        manualArtistInfoCache.set(normalizeArtistName(name), info);
      }
    }
  }

  return manualArtistInfoCache.get(normalizedName) || null;
}

async function fetchWikipediaArtistInfo(artistName) {
  const searchUrl = new URL('https://en.wikipedia.org/w/api.php');
  searchUrl.searchParams.set('action', 'query');
  searchUrl.searchParams.set('list', 'search');
  searchUrl.searchParams.set('format', 'json');
  searchUrl.searchParams.set('srsearch', `${artistName} musician band`);
  searchUrl.searchParams.set('srlimit', '1');

  const searchResponse = await fetch(searchUrl, {
    headers: { 'User-Agent': 'Monochrome-Streamer/1.0' },
  });
  if (!searchResponse.ok) {
    throw new Error(`Wikipedia search failed: ${searchResponse.status}`);
  }

  const searchData = await searchResponse.json();
  const pageTitle = searchData.query?.search?.[0]?.title;
  if (!pageTitle) return null;

  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
  const summaryResponse = await fetch(summaryUrl, {
    headers: { 'User-Agent': 'Monochrome-Streamer/1.0' },
  });
  if (!summaryResponse.ok) {
    throw new Error(`Wikipedia summary failed: ${summaryResponse.status}`);
  }

  const summary = await summaryResponse.json();
  return {
    name: artistName,
    imageUrl: summary.thumbnail?.source || summary.originalimage?.source || null,
    bio: summary.extract || '',
    sourceUrl: summary.content_urls?.desktop?.page || '',
    source: 'wikipedia',
  };
}

function createEmptyArtistInfo(artistName) {
  return {
    name: artistName,
    imageUrl: null,
    bio: '',
    sourceUrl: '',
    source: 'none',
  };
}

function normalizeArtistName(value) {
  return String(value || '').trim().toLowerCase();
}

async function serveStaticAsset(requestPath, response) {
  const normalizedPath = requestPath === '/' ? '/index.html' : requestPath;
  const isSourceAsset = normalizedPath.startsWith('/assets/');
  const staticRoot = isSourceAsset ? assetsDir : publicDir;
  const staticPath = isSourceAsset ? normalizedPath.replace(/^\/assets\/?/u, '') : normalizedPath;
  const resolvedPath = path.normalize(path.join(staticRoot, staticPath));

  if (!resolvedPath.startsWith(staticRoot)) {
    return respondJson(response, 403, { error: 'Forbidden' });
  }

  if (!existsSync(resolvedPath)) {
    return respondJson(response, 404, { error: 'Not found' });
  }

  const contentType = getContentType(resolvedPath) === 'application/octet-stream'
    ? guessStaticContentType(resolvedPath)
    : getContentType(resolvedPath);

  const cacheControl = ['.html', '.js', '.css'].includes(path.extname(resolvedPath).toLowerCase())
    ? 'no-store'
    : 'public, max-age=300';

  if (!isSourceAsset && normalizedPath === '/styles.css') {
    const stylesheet = await renderVersionedStylesheet(resolvedPath);
    response.writeHead(200, {
      ...getSecurityHeaders(),
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    });
    response.end(stylesheet);
    return;
  }

  createReadStream(resolvedPath)
    .on('error', (error) => {
      console.error(error);
      if (!response.headersSent) {
        respondJson(response, 500, { error: 'Failed to load asset' });
      } else {
        response.destroy(error);
      }
    })
    .pipe(response.writeHead(200, {
      ...getSecurityHeaders(),
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    }));
}

async function renderVersionedStylesheet(stylesheetPath) {
  let stylesheet = await fs.readFile(stylesheetPath, 'utf8');
  const importMatches = [...stylesheet.matchAll(/@import\s+url\(["']?([^"')]+\.css)(?:\?[^"')]+)?["']?\);/g)];

  for (const match of importMatches) {
    const [fullMatch, importUrl] = match;
    const importedPath = path.normalize(path.join(path.dirname(stylesheetPath), importUrl));

    if (!importedPath.startsWith(publicDir)) {
      continue;
    }

    try {
      const stats = await fs.stat(importedPath);
      const separator = importUrl.includes('?') ? '&' : '?';
      stylesheet = stylesheet.replace(fullMatch, `@import url("${importUrl}${separator}v=${Math.round(stats.mtimeMs)}");`);
    } catch {
      // Keep the original import if a file is missing so the browser reports the normal CSS error.
    }
  }

  return stylesheet;
}

function renderLoginPage({ next = '/', title = 'Monochrome-Streamer', error = '', currentUser = null, noAuth = false, themeSettings = DEFAULT_SETTINGS } = {}) {
  const loginTheme = resolveLoginTheme(themeSettings);
  const loginThemeScript = renderLoginThemeScript();
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login | ${escapeHtml(title)}</title>
  <script>${loginThemeScript}</script>
  <style>
    :root {
      color-scheme: ${escapeHtml(loginTheme.colorScheme)};
      --accent: ${escapeHtml(loginTheme.accent)};
      --accent-contrast: ${escapeHtml(loginTheme.accentContrast)};
      --bg: ${escapeHtml(loginTheme.background)};
      --panel: ${escapeHtml(loginTheme.surface)};
      --line: ${escapeHtml(loginTheme.line)};
      --text: ${escapeHtml(loginTheme.text)};
      --muted: ${escapeHtml(loginTheme.muted)};
      --body-top: ${escapeHtml(loginTheme.bodyTop)};
      --body-mid: ${escapeHtml(loginTheme.bodyMid)};
      --body-bottom: ${escapeHtml(loginTheme.bodyBottom)};
    }
    * { box-sizing: border-box; }
    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: "Plus Jakarta Sans", "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 36%),
        linear-gradient(180deg, var(--body-top), var(--body-mid) 48%, var(--body-bottom));
      color: var(--text);
    }
    main { width: min(420px, 100%); border: 1px solid var(--line); border-radius: 30px; padding: 30px; background: linear-gradient(145deg, rgba(255,255,255,.08), transparent), var(--panel); box-shadow: 0 28px 90px rgba(0,0,0,.45); backdrop-filter: blur(22px); }
    p { color: var(--muted); line-height: 1.5; }
    h1 { margin: 0; font-size: clamp(2rem, 6vw, 3.1rem); line-height: .95; letter-spacing: -.06em; }
    label { display: grid; gap: 8px; margin-top: 18px; color: var(--muted); font-weight: 800; font-size: .82rem; text-transform: uppercase; letter-spacing: .14em; }
    input { width: 100%; border: 1px solid var(--line); border-radius: 18px; padding: 14px 16px; background: rgba(255,255,255,.08); color: var(--text); font: inherit; outline: none; }
    input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent); }
    button { width: 100%; margin-top: 22px; border: 0; border-radius: 999px; padding: 15px 18px; background: var(--accent); color: var(--accent-contrast); font: inherit; font-weight: 950; cursor: pointer; }
    .error { margin: 16px 0 0; padding: 12px 14px; border-radius: 16px; background: rgba(255,80,80,.16); color: #ffd7d7; }
    .session { margin: 16px 0 0; padding: 12px 14px; border: 1px solid var(--line); border-radius: 16px; background: rgba(255,255,255,.06); }
    .session a { color: var(--accent); font-weight: 900; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p>Sign in to open your local streamer.</p>
    ${noAuth ? '<p class="session">Anonymous browsing is enabled. Sign in here only if you need a user or admin session.</p>' : ''}
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    ${currentUser ? `<p class="session">Currently signed in as <strong>${escapeHtml(currentUser.username)}</strong>. Use this form to switch accounts, or <a href="/logout">logout</a>.</p>` : ''}
    <form method="post" action="/login">
      <input type="hidden" name="next" value="${escapeHtml(cleanRedirectPath(next))}">
      <label>Username <input name="username" autocomplete="username" required autofocus></label>
      <label>Password <input name="password" type="password" autocomplete="current-password" required></label>
      <button type="submit">Login</button>
    </form>
  </main>
</body>
</html>`;
}

function renderLoginThemeScript() {
  const payload = JSON.stringify({
    defaultSettings: DEFAULT_SETTINGS,
    paletteThemes: PALETTE_THEMES,
    themePresets: THEME_PRESETS,
    settingsStorageKey: STORAGE_KEYS.settings,
  });
  return `
(() => {
  const themePayload = ${payload};

  function parseSettings() {
    try {
      const raw = window.localStorage.getItem(themePayload.settingsStorageKey);
      if (!raw) return { ...themePayload.defaultSettings };
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { ...themePayload.defaultSettings };
      }
      return { ...themePayload.defaultSettings, ...parsed };
    } catch (error) {
      return { ...themePayload.defaultSettings };
    }
  }

  function parseHex(hexColor) {
    const normalized = String(hexColor || '').trim().replace('#', '');
    const expanded = /^[0-9a-f]{3}$/iu.test(normalized)
      ? normalized.split('').map((char) => char + char).join('')
      : normalized;
    if (!/^[0-9a-f]{6}$/iu.test(expanded)) {
      return { red: 17, green: 17, blue: 17 };
    }
    return {
      red: Number.parseInt(expanded.slice(0, 2), 16),
      green: Number.parseInt(expanded.slice(2, 4), 16),
      blue: Number.parseInt(expanded.slice(4, 6), 16),
    };
  }

  function toHex(color) {
    return '#' + [color.red, color.green, color.blue].map((value) => value.toString(16).padStart(2, '0')).join('');
  }

  function mix(baseColor, overlayColor, amount) {
    const base = parseHex(baseColor);
    const overlay = parseHex(overlayColor);
    const clamped = Math.max(0, Math.min(1, amount));
    return toHex({
      red: Math.round(base.red * (1 - clamped) + overlay.red * clamped),
      green: Math.round(base.green * (1 - clamped) + overlay.green * clamped),
      blue: Math.round(base.blue * (1 - clamped) + overlay.blue * clamped),
    });
  }

  function rgba(hexColor, alpha) {
    const color = parseHex(hexColor);
    return 'rgba(' + color.red + ', ' + color.green + ', ' + color.blue + ', ' + alpha + ')';
  }

  function getReadableTextColor(hexColor) {
    const { red, green, blue } = parseHex(hexColor);
    const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
    return luminance > 0.58 ? '#111111' : '#ffffff';
  }

  function createPairedTheme(palette, base) {
    const light = palette.light;
    const dark = palette.dark;
    if (base === 'light') {
      return {
        background: light,
        surface: rgba(mix(light, '#ffffff', 0.42), 0.82),
        surface2: rgba(mix(light, '#ffffff', 0.22), 0.96),
        text: dark,
        muted: rgba(dark, 0.68),
        accent: dark,
        bodyTop: mix(light, '#ffffff', 0.22),
        bodyMid: light,
        bodyBottom: mix(light, dark, 0.14),
      };
    }
    return {
      background: dark,
      surface: rgba(mix(dark, '#ffffff', 0.07), 0.84),
      surface2: rgba(mix(dark, '#ffffff', 0.11), 0.96),
      text: light,
      muted: rgba(light, 0.68),
      accent: light,
      bodyTop: mix(dark, light, 0.14),
      bodyMid: dark,
      bodyBottom: mix(dark, '#000000', 0.45),
    };
  }

  function createLightTheme(accent, preferredText, seedBackground) {
    const background = mix(seedBackground || '#f8f2e7', '#ffffff', 0.7);
    const surfaceBase = mix(background, '#ffffff', 0.62);
    const surface2Base = mix(background, '#ffffff', 0.34);
    const text = getReadableTextColor(background) === '#111111'
      ? '#17130f'
      : mix(preferredText || '#17130f', '#111111', 0.82);
    return {
      background,
      surface: rgba(surfaceBase, 0.82),
      surface2: rgba(surface2Base, 0.96),
      text,
      muted: rgba(text, 0.64),
      accent,
      bodyTop: mix(background, '#ffffff', 0.3),
      bodyMid: background,
      bodyBottom: mix(background, accent, 0.12),
    };
  }

  function createDarkTheme(accent, preferredText, seedBackground) {
    const background = mix(seedBackground || '#090909', '#000000', 0.5);
    const surfaceBase = mix(background, '#ffffff', 0.06);
    const surface2Base = mix(background, '#ffffff', 0.1);
    const text = getReadableTextColor(background) === '#ffffff'
      ? mix(preferredText || '#f7f7f2', '#ffffff', 0.7)
      : '#f7f7f2';
    return {
      background,
      surface: rgba(surfaceBase, 0.84),
      surface2: rgba(surface2Base, 0.96),
      text,
      muted: rgba(text, 0.66),
      accent,
      bodyTop: mix(background, accent, 0.16),
      bodyMid: background,
      bodyBottom: mix(background, '#000000', 0.6),
    };
  }

  function getThemeBase(settings) {
    if (settings.themeBase === 'light' || settings.themeBase === 'dark') {
      return settings.themeBase;
    }
    if (settings.customThemeBase === 'light' || settings.customThemeBase === 'dark') {
      return settings.customThemeBase;
    }
    return settings.theme === 'white' || settings.theme === 'latte' ? 'light' : 'dark';
  }

  function resolveThemePreset(themeName, settings) {
    const base = getThemeBase(settings);
    const palette = themePayload.paletteThemes[themeName];
    if (palette) {
      return createPairedTheme(palette, base);
    }
    const fallbackThemeName = themeName === 'custom'
      ? (base === 'light' ? 'latte' : 'black')
      : themeName;
    const preset = themePayload.themePresets[fallbackThemeName] || themePayload.themePresets.black;
    const accent = themeName === 'custom'
      ? (settings.customAccent || themePayload.defaultSettings.customAccent)
      : preset.accent;
    return base === 'light'
      ? createLightTheme(accent, preset.text, preset.background)
      : createDarkTheme(accent, preset.text, preset.background);
  }

  const settings = parseSettings();
  const theme = resolveThemePreset(settings.theme || themePayload.defaultSettings.theme, settings);
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-contrast', getReadableTextColor(theme.accent));
  root.style.setProperty('--bg', theme.background);
  root.style.setProperty('--panel', theme.surface);
  root.style.setProperty('--line', 'color-mix(in srgb, ' + theme.text + ' 14%, transparent)');
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--muted', theme.muted);
  root.style.setProperty('--body-top', theme.bodyTop);
  root.style.setProperty('--body-mid', theme.bodyMid);
  root.style.setProperty('--body-bottom', theme.bodyBottom);
  root.style.setProperty('--login-color-scheme', getThemeBase(settings) === 'light' ? 'light' : 'dark');
  root.dataset.loginTheme = settings.theme || themePayload.defaultSettings.theme;
  root.dataset.loginThemeBase = getThemeBase(settings);
})();
`.trim();
}

function getThemeSettingsFromRequest(request) {
  const cookies = parseCookies(request?.headers?.cookie || '');
  const raw = cookies[STORAGE_KEYS.themeCookie];
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...normalizeSettings(parsed),
    };
  } catch (error) {
    return { ...DEFAULT_SETTINGS };
  }
}

function resolveLoginTheme(settings = DEFAULT_SETTINGS) {
  const resolvedSettings = {
    ...DEFAULT_SETTINGS,
    ...normalizeSettings(settings),
  };
  const theme = resolveThemePreset(resolvedSettings.theme || DEFAULT_SETTINGS.theme, resolvedSettings);
  const lineAlpha = getThemeBase(resolvedSettings) === 'light' ? 0.18 : 0.14;
  return {
    colorScheme: getThemeBase(resolvedSettings) === 'light' ? 'light' : 'dark',
    accent: theme.accent,
    accentContrast: getReadableTextColor(theme.accent),
    background: theme.background,
    surface: theme.surface,
    line: rgba(theme.text, lineAlpha),
    text: theme.text,
    muted: theme.muted,
    bodyTop: theme.bodyTop,
    bodyMid: theme.bodyMid,
    bodyBottom: theme.bodyBottom,
  };
}

function renderMessagePage(title, message) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#080808;color:#f7f4ee;font-family:"Segoe UI",sans-serif}main{max-width:520px;padding:32px;border:1px solid rgba(255,255,255,.14);border-radius:28px;background:rgba(255,255,255,.06)}a{color:#eb9200}</style></head><body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><p><a href="/">Back to app</a></p></main></body></html>`;
}

function renderAdminPage({ title = 'Monochrome-Streamer', admin }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Admin | ${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: dark; --accent:#eb9200; --bg:#070707; --panel:rgba(20,20,20,.84); --panel2:rgba(255,255,255,.06); --line:rgba(255,255,255,.14); --text:#f7f4ee; --muted:rgba(247,244,238,.66); --danger:#ff5c5c; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; padding:28px; background:radial-gradient(circle at 8% 0%, color-mix(in srgb,var(--accent) 20%,transparent), transparent 34%), var(--bg); color:var(--text); font-family:"Plus Jakarta Sans","Segoe UI",sans-serif; }
    header, section { width:min(1120px,100%); margin:0 auto 18px; border:1px solid var(--line); border-radius:28px; background:linear-gradient(135deg,rgba(255,255,255,.07),transparent),var(--panel); box-shadow:0 20px 70px rgba(0,0,0,.32); backdrop-filter:blur(20px); }
    header { display:flex; justify-content:space-between; gap:18px; align-items:center; padding:24px; }
    section { padding:24px; }
    h1,h2 { margin:0; letter-spacing:-.055em; line-height:.95; }
    h1 { font-size:clamp(2.2rem,5vw,4rem); }
    h2 { font-size:1.7rem; margin-bottom:8px; }
    p { color:var(--muted); line-height:1.55; }
    a, button { color:inherit; }
    .actions { display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
    button, .button { border:1px solid var(--line); border-radius:999px; padding:11px 15px; background:var(--panel2); color:var(--text); font:inherit; font-weight:850; cursor:pointer; text-decoration:none; }
    .primary { border-color:var(--accent); background:var(--accent); color:#111; }
    .danger { color:#ffd7d7; border-color:color-mix(in srgb,var(--danger) 44%,var(--line)); }
    form { display:grid; gap:12px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; }
    label { display:grid; gap:7px; color:var(--muted); font-size:.78rem; text-transform:uppercase; letter-spacing:.12em; font-weight:850; }
    input, select { width:100%; border:1px solid var(--line); border-radius:16px; padding:12px 14px; background:rgba(255,255,255,.06); color:var(--text); font:inherit; }
    table { width:100%; border-collapse:collapse; margin-top:16px; overflow:hidden; border-radius:18px; }
    th,td { padding:13px 12px; border-bottom:1px solid var(--line); text-align:left; }
    th { color:var(--muted); font-size:.78rem; text-transform:uppercase; letter-spacing:.12em; }
    .tabs { display:flex; gap:10px; flex-wrap:wrap; margin:0 auto 18px; width:min(1120px,100%); }
    .tab.is-active { background:var(--accent); color:#111; border-color:var(--accent); }
    .panel[hidden] { display:none; }
    .status { min-height:1.4em; color:var(--accent); font-weight:850; }
    @media (max-width:720px){ body{padding:14px} header{align-items:flex-start;flex-direction:column} table{font-size:.9rem} }
  </style>
</head>
<body>
  <header>
    <div>
      <p>Signed in as ${escapeHtml(admin.username)}</p>
      <h1>Admin Panel</h1>
    </div>
    <div class="actions">
      <a class="button" href="/">Open app</a>
      <a class="button" href="/logout">Logout</a>
    </div>
  </header>
  <nav class="tabs">
    <button class="tab is-active" data-tab="users">Users</button>
    <button class="tab" data-tab="downloads">Downloads</button>
    <button class="tab" data-tab="instances">Instances</button>
    <button class="tab" data-tab="system">System</button>
  </nav>
  <section id="panel-users" class="panel">
    <h2>Users</h2>
    <p>Add users and choose whether each account can download tracks or ZIP archives.</p>
    <form id="user-form">
      <div class="grid">
        <label>Username <input name="username" required></label>
        <label>Password <input name="password" type="password" minlength="6" required></label>
        <label>Downloads <select name="downloadsEnabled"><option value="true">Enabled</option><option value="false">Disabled</option></select></label>
      </div>
      <div><button class="primary" type="submit">Add / Update User</button></div>
    </form>
    <div id="users-table"></div>
  </section>
  <section id="panel-downloads" class="panel" hidden>
    <h2>Downloads</h2>
    <p>These defaults are applied to the webapp for every logged-in user. Per-user download access is controlled in Users.</p>
    <form id="download-settings-form">
      <div class="grid">
        <label>Download Quality <select name="downloadQuality"><option value="original">Original Local File</option><option value="mp3">MP3 320 kbps</option></select></label>
        <label>Bulk Download Method <select name="bulkDownloadMethod"><option value="browser">One-by-one browser downloads</option><option value="zip">ZIP archive before downloading</option></select></label>
        <label>Filename Template <input name="filenameTemplate"></label>
      </div>
      <p>Available: {discNumber}, {trackNumber}, {artist}, {title}, {album}, {albumArtist}, {year}.</p>
      <button class="primary" type="submit">Save Download Settings</button>
    </form>
  </section>
  <section id="panel-instances" class="panel" hidden>
    <h2>Instances</h2>
    <p>Widget API settings for external dashboards and apps.</p>
    <form id="widget-form">
      <div class="grid">
        <label>Widget API <select name="enabled"><option value="false">Disabled</option><option value="true">Enabled</option></select></label>
        <label>API Key <input name="apiKey" placeholder="Generate or paste a key"></label>
        <label>CORS Origin <input name="widgetCorsOrigin" placeholder="*"></label>
      </div>
      <div class="actions"><button type="button" id="generate-widget-key">Generate Key</button><button class="primary" type="submit">Save Widget API</button></div>
      <p id="widget-url"></p>
    </form>
  </section>
  <section id="panel-system" class="panel" hidden>
    <h2>System</h2>
    <p>Choose top-level music folders and start scans from the admin panel.</p>
    <div class="actions"><button id="refresh-folders">Refresh Folders</button><button class="primary" id="save-scan">Save & Scan</button></div>
    <div id="scan-status" class="status"></div>
    <form id="folders-form" class="grid"></form>
  </section>
  <section><p id="admin-status" class="status"></p></section>
  <script>
    const status = document.querySelector('#admin-status');
    const setStatus = (message) => { status.textContent = message || ''; };
    const api = async (url, options = {}) => {
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Request failed');
      return data;
    };
    document.querySelectorAll('.tab').forEach((button) => button.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('is-active', tab === button));
      document.querySelectorAll('.panel').forEach((panel) => panel.hidden = panel.id !== 'panel-' + button.dataset.tab);
    }));
    async function loadUsers() {
      const data = await api('/api/admin/users');
      document.querySelector('#users-table').innerHTML = '<table><thead><tr><th>User</th><th>Role</th><th>Downloads</th><th></th></tr></thead><tbody>' +
        '<tr><td>' + data.admin.username + '</td><td>Admin</td><td>Enabled</td><td>Environment</td></tr>' +
        data.users.map((user) => '<tr><td>' + user.username + '</td><td>User</td><td><button data-downloads="' + user.username + '">' + (user.downloadsEnabled ? 'Enabled' : 'Disabled') + '</button></td><td><button class="danger" data-delete="' + user.username + '">Delete</button></td></tr>').join('') +
        '</tbody></table>';
    }
    document.querySelector('#user-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      await api('/api/admin/users', { method: 'POST', body: JSON.stringify({ username: form.get('username'), password: form.get('password'), downloadsEnabled: form.get('downloadsEnabled') === 'true' }) });
      event.currentTarget.reset(); setStatus('User saved.'); await loadUsers();
    });
    document.querySelector('#users-table').addEventListener('click', async (event) => {
      const downloadsUser = event.target.dataset.downloads;
      const deleteUser = event.target.dataset.delete;
      if (downloadsUser) {
        const users = await api('/api/admin/users');
        const user = users.users.find((item) => item.username === downloadsUser);
        await api('/api/admin/users/' + encodeURIComponent(downloadsUser), { method: 'PATCH', body: JSON.stringify({ downloadsEnabled: !user.downloadsEnabled }) });
        setStatus('Download permission updated.'); await loadUsers();
      }
      if (deleteUser && confirm('Delete user ' + deleteUser + '?')) {
        await api('/api/admin/users/' + encodeURIComponent(deleteUser), { method: 'DELETE' });
        setStatus('User deleted.'); await loadUsers();
      }
    });
    async function loadDownloadSettings() {
      const data = await api('/api/admin/download-settings');
      const form = document.querySelector('#download-settings-form');
      form.downloadQuality.value = data.downloadQuality;
      form.bulkDownloadMethod.value = data.bulkDownloadMethod;
      form.filenameTemplate.value = data.filenameTemplate;
    }
    document.querySelector('#download-settings-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      await api('/api/admin/download-settings', { method: 'POST', body: JSON.stringify(Object.fromEntries(form.entries())) });
      setStatus('Download settings saved.');
    });
    async function loadWidget() {
      const data = await api('/api/widget/settings');
      const form = document.querySelector('#widget-form');
      form.enabled.value = String(Boolean(data.enabled));
      form.apiKey.value = data.apiKey || '';
      form.widgetCorsOrigin.value = data.widgetCorsOrigin || '*';
      document.querySelector('#widget-url').textContent = 'Stats URL: ' + (data.statsUrl || '/api/widget/stats');
    }
    document.querySelector('#generate-widget-key').addEventListener('click', () => {
      const makePart = () => globalThis.crypto?.randomUUID
        ? crypto.randomUUID().replaceAll('-', '')
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      document.querySelector('#widget-form').apiKey.value = makePart() + makePart();
    });
    document.querySelector('#widget-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      await api('/api/widget/settings', { method: 'POST', body: JSON.stringify({ enabled: form.get('enabled') === 'true', apiKey: form.get('apiKey'), widgetCorsOrigin: form.get('widgetCorsOrigin') || '*' }) });
      setStatus('Widget settings saved.'); await loadWidget();
    });
    async function loadFolders() {
      const data = await api('/api/library/folders');
      document.querySelector('#scan-status').textContent = (data.scan?.status || 'idle') + ' · ' + (data.scan?.percent || 0) + '%';
      const selected = new Set(data.selected || []);
      const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
      const folders = (data.available || [])
        .map((folder) => typeof folder === 'string' ? folder : folder?.name)
        .filter(Boolean);
      document.querySelector('#folders-form').innerHTML = folders.length
        ? folders.map((folder) => '<label><input type="checkbox" name="folders" value="' + escapeHtml(folder) + '"' + (selected.has(folder) ? ' checked' : '') + '> ' + escapeHtml(folder) + '</label>').join('')
        : '<p>No top-level folders were found in /music.</p>';
    }
    document.querySelector('#refresh-folders').addEventListener('click', loadFolders);
    document.querySelector('#save-scan').addEventListener('click', async () => {
      const folders = [...new FormData(document.querySelector('#folders-form')).getAll('folders')];
      await api('/api/library/folders', { method: 'POST', body: JSON.stringify({ folders }) });
      await api('/api/rescan', { method: 'POST', body: '{}' });
      setStatus('Scan started.'); await loadFolders();
    });
    Promise.all([loadUsers(), loadDownloadSettings(), loadWidget(), loadFolders()]).catch((error) => setStatus(error.message));
  </script>
</body>
</html>`;
}

function guessStaticContentType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

function respondJson(response, statusCode, body) {
  const payload = JSON.stringify(body);
  response.writeHead(statusCode, {
    ...getSecurityHeaders(),
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  response.end(payload);
}

function respondHtml(response, statusCode, html) {
  response.writeHead(statusCode, {
    ...getSecurityHeaders(),
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
    'Cache-Control': 'no-store',
  });
  response.end(html);
}

function redirect(response, location) {
  response.writeHead(303, {
    ...getSecurityHeaders(),
    Location: location,
    'Cache-Control': 'no-store',
  });
  response.end();
}

function getSecurityHeaders() {
  return {
    'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    'Referrer-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}

function getWidgetCorsHeaders() {
  const settings = getEffectiveWidgetSettings();
  return {
    'Access-Control-Allow-Origin': settings.widgetCorsOrigin || 'null',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, X-API-Key, Content-Type',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
  };
}

function respondWidgetOptions(response) {
  response.writeHead(204, {
    ...getSecurityHeaders(),
    ...getWidgetCorsHeaders(),
  });
  response.end();
}

function respondWidgetJson(response, statusCode, body) {
  const payload = JSON.stringify(body);
  response.writeHead(statusCode, {
    ...getSecurityHeaders(),
    ...getWidgetCorsHeaders(),
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  response.end(payload);
}

function isWidgetRequestAuthorized(request, url) {
  const settings = getEffectiveWidgetSettings();
  const expectedKey = String(settings.apiKey || '').trim();
  if (!settings.enabled || !expectedKey) return false;
  const providedKey = String(
    url.searchParams.get('apiKey')
      || request.headers['x-api-key']
      || parseBearerToken(request.headers.authorization)
      || ''
  ).trim();
  if (!providedKey) return false;
  return timingSafeStringEqual(providedKey, expectedKey);
}

function parseBearerToken(value) {
  const match = /^Bearer\s+(.+)$/iu.exec(String(value || '').trim());
  return match ? match[1] : '';
}
