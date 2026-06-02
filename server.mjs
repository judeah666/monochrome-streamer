import { createReadStream, existsSync, promises as fs } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
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
  readAlbumOverridesDatabase,
  readArtistOverridesDatabase,
  readCollectionFolderAlbumPage,
  readCollectionFolders,
  readLibraryAlbumPage,
  readLibraryDatabase,
  readLibraryDatabaseSummary,
  readLyricsOverridesDatabase,
  readRandomAlbumPage,
  readArtistLibrary,
  readArtistPage,
  readFolderLibrary,
  readFolderListing,
  readTrackPage,
  readTrackFromDatabase,
  writeAlbumOverridesDatabase,
  writeArtistOverridesDatabase,
  writeLibraryDatabase,
  writeLyricsOverridesDatabase,
} from './lib/library-db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const configPath = path.join(__dirname, 'config.json');
let ffmpegAvailablePromise = null;

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
  adminUsername: 'admin',
  adminPassword: 'admin',
  widgetApiKey: '',
  widgetCorsOrigin: '*',
  host: '0.0.0.0',
  port: 8888,
};

const config = await loadConfig();
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
let lyricsOverridesCache = null;
let selectedLibraryFoldersCache = null;
let widgetSettingsCache = await readWidgetSettings();
let authStoreCache = null;
const sessions = new Map();

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

    const authUser = await getAuthenticatedUser(request);

    if (url.pathname === '/login' || url.pathname === '/login/') {
      if (request.method === 'POST') {
        return handleLogin(request, response, url);
      }
      return respondHtml(response, 200, renderLoginPage({
        next: url.searchParams.get('next') || '/',
        title: config.title,
        currentUser: authUser,
      }));
    }

    if (url.pathname === '/logout' || url.pathname === '/logout/') {
      const token = getSessionToken(request);
      if (token) sessions.delete(token);
      response.writeHead(303, {
        Location: '/login',
        'Set-Cookie': createSessionCookie('', { maxAge: 0 }),
        'Cache-Control': 'no-store',
      });
      response.end();
      return;
    }

    if (!authUser) {
      return requireLogin(request, response, url);
    }

    if (url.pathname === '/api/auth/me') {
      return respondJson(response, 200, { user: createPublicUser(authUser) });
    }

    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      return redirect(response, '/');
    }

    if (url.pathname.startsWith('/api/admin/')) {
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      return handleAdminApi(request, response, url);
    }

    if (url.pathname === '/api/widget/settings') {
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      if (request.method === 'GET') {
        return respondJson(response, 200, getWidgetSettingsPayload(request));
      }
      if (request.method === 'POST') {
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
        downloadSettings: await getDownloadSettings(),
      });
    }

    if (url.pathname === '/api/library') {
      if (url.searchParams.has('limit') || url.searchParams.has('offset') || url.searchParams.has('search')) {
        const pageOptions = {
          limit: url.searchParams.get('limit'),
          offset: url.searchParams.get('offset'),
          search: url.searchParams.get('search'),
          letter: url.searchParams.get('letter'),
        };
        const mediaTypeAlbumFilter = await getAlbumIdFilterForMediaTypes(url.searchParams.get('mediaTypes'));
        if (mediaTypeAlbumFilter?.albumIds) {
          pageOptions.albumIds = mediaTypeAlbumFilter.albumIds;
        }
        if (mediaTypeAlbumFilter?.excludeAlbumIds) {
          pageOptions.excludeAlbumIds = mediaTypeAlbumFilter.excludeAlbumIds;
        }
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
      const library = await readLibraryAlbumPage(libraryDatabasePath, {
        limit: url.searchParams.get('limit'),
        offset: url.searchParams.get('offset'),
        search,
        albumIds: scannedAlbumIds,
      });
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

    if (url.pathname === '/api/collections-albums') {
      const pageOptions = {
        limit: url.searchParams.get('limit'),
        offset: url.searchParams.get('offset'),
        search: url.searchParams.get('search'),
        letter: url.searchParams.get('letter'),
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
      const library = await readCollectionFolderAlbumPage(libraryDatabasePath, collectionPath, pageOptions);
      const visibleManualAlbums = filterManualAlbumsBySearch(collectionSources.manualAlbums, pageOptions.search);
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
      const library = await readRandomAlbumPage(libraryDatabasePath, {
        limit: url.searchParams.get('limit') || 50,
      });
      primeTrackMap(library.tracks);
      return respondJson(response, 200, await createLibraryPayload(library));
    }

    if (url.pathname === '/api/tracks') {
      const trackIds = url.searchParams.get('ids')
        ? url.searchParams.get('ids').split(',').map((id) => id.trim()).filter(Boolean)
        : [];
      const library = await readTrackPage(libraryDatabasePath, {
        limit: url.searchParams.get('limit'),
        offset: url.searchParams.get('offset'),
        search: url.searchParams.get('search'),
        letter: url.searchParams.get('letter'),
        trackIds,
      });
      primeTrackMap(library.tracks);
      return respondJson(response, 200, await createLibraryPayload(library));
    }

    const albumTracksMatch = /^\/api\/albums\/([^/]+)\/tracks$/u.exec(url.pathname);
    if (albumTracksMatch && request.method === 'GET') {
      const albumId = decodeURIComponent(albumTracksMatch[1]);
      const library = await readLibraryAlbumPage(libraryDatabasePath, {
        albumIds: [albumId],
      });
      primeTrackMap(library.tracks);
      return respondJson(response, 200, await createLibraryPayload(library));
    }

    if (url.pathname === '/api/folders') {
      const listing = await readFolderListing(libraryDatabasePath, url.searchParams.get('path') || '', {
        search: url.searchParams.get('search') || '',
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
      }));
    }

    const artistLibraryMatch = /^\/api\/artists\/([^/]+)\/library$/u.exec(url.pathname);
    if (artistLibraryMatch) {
      const artistName = decodeURIComponent(artistLibraryMatch[1]);
      const library = await readArtistLibrary(libraryDatabasePath, artistName);
      primeTrackMap(library.tracks);
      return respondJson(response, 200, await createLibraryPayload(library));
    }

    if (url.pathname === '/api/rescan' && request.method === 'POST') {
      if (!isAdminUser(authUser)) {
        return respondJson(response, 403, { error: 'Admin access required.' });
      }
      const scan = await startLibraryScan();
      return respondJson(response, 202, { scan });
    }

    if (url.pathname === '/api/library/folders') {
      if (request.method === 'POST') {
        if (!isAdminUser(authUser)) {
          return respondJson(response, 403, { error: 'Admin access required.' });
        }
        const result = await updateSelectedLibraryFolders(request);
        return respondJson(response, 200, result);
      }
      return respondJson(response, 200, await getLibraryFoldersPayload());
    }

    const artistInfoMatch = /^\/api\/artists\/([^/]+)\/info$/u.exec(url.pathname);
    if (artistInfoMatch) {
      const artistName = decodeURIComponent(artistInfoMatch[1]);
      if (request.method === 'POST') {
        const artistInfo = await updateArtistInfo(artistName, request);
        return respondJson(response, 200, artistInfo);
      }
      const artistInfo = await getArtistInfo(artistName);
      return respondJson(response, 200, artistInfo);
    }

    const albumCoverMatch = /^\/api\/albums\/([^/]+)\/cover$/u.exec(url.pathname);
    if (albumCoverMatch && request.method === 'POST') {
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

    if (url.pathname === '/api/albums' && request.method === 'POST') {
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
      if (!canUserDownload(authUser)) {
        return respondJson(response, 403, { error: 'Downloads are disabled for this account.' });
      }
      return downloadTrack(response, decodeURIComponent(downloadMatch[1]), url);
    }

    if (url.pathname === '/api/downloads/bulk' && request.method === 'POST') {
      if (!canUserDownload(authUser)) {
        return respondJson(response, 403, { error: 'Downloads are disabled for this account.' });
      }
      return downloadBulkTracks(response, request);
    }

    const lyricsMatch = /^\/api\/tracks\/([^/]+)\/lyrics$/u.exec(url.pathname);
    if (lyricsMatch) {
      const trackId = decodeURIComponent(lyricsMatch[1]);
      if (request.method === 'POST') {
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
      return streamCover(response, decodeURIComponent(coverMatch[1]));
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
    adminUsername: process.env.ADMIN_USERNAME || fileConfig.adminUsername || defaultConfig.adminUsername,
    adminPassword: process.env.ADMIN_PASSWORD || fileConfig.adminPassword || defaultConfig.adminPassword,
    widgetApiKey: process.env.WIDGET_API_KEY || fileConfig.widgetApiKey || defaultConfig.widgetApiKey,
    widgetCorsOrigin: process.env.WIDGET_CORS_ORIGIN || fileConfig.widgetCorsOrigin || defaultConfig.widgetCorsOrigin,
    host: process.env.HOST || fileConfig.host || defaultConfig.host,
    port: Number.parseInt(process.env.PORT || fileConfig.port || defaultConfig.port, 10),
  };
}

async function getAuthenticatedUser(request) {
  const token = getSessionToken(request);
  if (!token) return null;

  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  session.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  if (session.role === 'admin') {
    return {
      username: config.adminUsername,
      role: 'admin',
      downloadsEnabled: true,
    };
  }

  const store = await readAuthStore();
  const user = store.users.find((candidate) => candidate.username === session.username);
  if (!user) {
    sessions.delete(token);
    return null;
  }

  return {
    username: user.username,
    role: 'user',
    downloadsEnabled: user.downloadsEnabled !== false,
  };
}

async function handleLogin(request, response, url) {
  const body = await readRequestPayload(request, 64 * 1024);
  const username = cleanText(body.username);
  const password = String(body.password || '');
  const user = await authenticateUser(username, password);

  if (!user) {
    return respondHtml(response, 401, renderLoginPage({
      next: cleanRedirectPath(body.next || url.searchParams.get('next') || '/'),
      title: config.title,
      error: 'Invalid username or password.',
    }));
  }

  const token = createSession(user);
  const next = cleanRedirectPath(body.next || url.searchParams.get('next') || '/');
  response.writeHead(303, {
    Location: next,
    'Set-Cookie': createSessionCookie(token),
    'Cache-Control': 'no-store',
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
  sessions.set(token, {
    username: user.username,
    role: user.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

function createPublicUser(user) {
  return {
    username: user.username,
    role: user.role,
    canDownload: canUserDownload(user),
  };
}

function isAdminUser(user) {
  return user?.role === 'admin';
}

function canUserDownload(user) {
  return isAdminUser(user) || user?.downloadsEnabled !== false;
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
  return getAdminUsersPayload();
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
    authStoreCache = {
      users: Array.isArray(raw.users) ? raw.users : [],
      downloadSettings: normalizeDownloadSettings(raw.downloadSettings),
    };
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
    folderTemplate: '{albumArtist}/{year} - {albumTitle}',
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
    folderTemplate: cleanText(settings.folderTemplate) || defaults.folderTemplate,
  };
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

function timingSafeTextEqual(left, right) {
  const leftHash = createHash('sha256').update(String(left)).digest();
  const rightHash = createHash('sha256').update(String(right)).digest();
  return timingSafeEqual(leftHash, rightHash);
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

function createSessionCookie(token, options = {}) {
  const maxAge = Number.isFinite(options.maxAge) ? options.maxAge : 7 * 24 * 60 * 60;
  return [
    `ms_session=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ].join('; ');
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
  return redirect(response, `/login?next=${encodeURIComponent(`${url.pathname}${url.search}` || '/')}`);
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
  const restrictAlbumIds = Array.isArray(options.albumIds);
  const albumIds = restrictAlbumIds ? new Set(options.albumIds.filter(Boolean)) : null;
  const excludeAlbumIds = new Set(Array.isArray(options.excludeAlbumIds) ? options.excludeAlbumIds.filter(Boolean) : []);
  const includedAlbums = restrictAlbumIds
    ? library.albums.filter((album) => albumIds.has(album.id))
    : library.albums;
  const baseAlbums = excludeAlbumIds.size > 0
    ? includedAlbums.filter((album) => !excludeAlbumIds.has(album.id))
    : includedAlbums;
  const albums = search
    ? baseAlbums.filter((album) => [album.title, album.artist, album.albumArtist].some((value) =>
      String(value || '').toLowerCase().includes(search)
    ))
    : baseAlbums;
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

async function ensureLibrary() {
  if (libraryCache) {
    return libraryCache;
  }
  if (!cachePromise) {
    cachePromise = refreshLibrary();
  }
  return cachePromise;
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

    if (track.cachedCoverPath && existsSync(track.cachedCoverPath)) {
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
  if (track.coverArtPath && existsSync(track.coverArtPath)) {
    const extension = path.extname(track.coverArtPath).toLowerCase() || '.jpg';
    const targetPath = getCachedCoverPath(album.id, extension);
    try {
      await fs.copyFile(track.coverArtPath, targetPath);
      return {
        path: targetPath,
        format: getContentType(targetPath),
      };
    } catch {
      return null;
    }
  }

  if (!track.hasEmbeddedCover) return null;

  const embeddedCover = await readEmbeddedCover(track.path);
  if (!embeddedCover?.data) return null;

  const extension = getImageExtension(embeddedCover.format);
  const targetPath = getCachedCoverPath(album.id, extension);
  await fs.writeFile(targetPath, embeddedCover.data);
  return {
    path: targetPath,
    format: embeddedCover.format || getContentType(targetPath),
  };
}

function getCachedCoverPath(albumId, extension) {
  const safeExtension = ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(extension) ? extension : '.jpg';
  return path.join(coverCachePath, `${albumId}${safeExtension}`);
}

function getImageExtension(contentType = '') {
  const normalized = String(contentType).toLowerCase();
  if (normalized.includes('png')) return '.png';
  if (normalized.includes('webp')) return '.webp';
  if (normalized.includes('avif')) return '.avif';
  if (normalized.includes('jpeg') || normalized.includes('jpg')) return '.jpg';
  return '.jpg';
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
  const widgetCorsOrigin = String(payload.widgetCorsOrigin ?? current.widgetCorsOrigin ?? '*').trim() || '*';

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
  const origin = `http://${request.headers.host || `${config.host}:${config.port}`}`;
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
  return {
    enabled: storedEnabled ?? Boolean(apiKey),
    apiKey,
    widgetCorsOrigin: String(widgetSettingsCache?.widgetCorsOrigin || config.widgetCorsOrigin || '*').trim() || '*',
    source: storedApiKey ? 'settings' : (envApiKey ? 'environment' : 'none'),
  };
}

function normalizeWidgetSettings(settings) {
  return {
    enabled: Boolean(settings?.enabled),
    apiKey: String(settings?.apiKey || '').trim(),
    widgetCorsOrigin: String(settings?.widgetCorsOrigin || '*').trim() || '*',
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
  const librarySummary = await readLibraryDatabaseSummary(libraryDatabasePath);
  const trackAlbumOverrideMap = new Map();
  const trackAlbumMap = new Map();

  for (const album of library.albums) {
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
    trackCount: library.trackCount,
    albumCount: library.albumCount,
    totalTrackCount: librarySummary.trackCount,
    totalAlbumCount: librarySummary.albumCount,
    page: library.page || null,
    albums: library.albums.map((album) => {
      const override = overrides.albums?.[album.id] || null;
      const coverTrack = album.coverTrackId ? trackMap.get(album.coverTrackId) : null;
      const scannedCoverUrl = coverTrack?.cachedCoverPath || coverTrack?.coverArtPath || coverTrack?.hasEmbeddedCover
        ? `/api/tracks/${album.coverTrackId}/cover`
        : null;
      const hasMediaOverride = override && (
        Object.hasOwn(override, 'mediaTypes') || Object.hasOwn(override, 'mediaType')
      );
      const albumArtistName = override?.albumArtist || album.albumArtist || album.artist;
      return {
        ...album,
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
        customCoverUrl: override?.coverUrl || null,
        scannedCoverUrl,
      };
    }),
    tracks: library.tracks.map((track) => {
      const albumOverride = trackAlbumOverrideMap.get(track.id) || null;
      const album = trackAlbumMap.get(track.id) || null;
      const trackOverride = albumOverride?.tracks?.[track.id] || null;
      const scannedCoverUrl = track.cachedCoverPath || track.coverArtPath || track.hasEmbeddedCover
        ? `/api/tracks/${track.id}/cover`
        : null;
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

async function getWishlistAlbumIds() {
  const { scannedAlbumIds } = await getWishlistAlbumSources();
  return scannedAlbumIds;
}

async function getWishlistAlbumSources() {
  const overrides = await getAlbumOverrides();
  const scannedAlbumIds = [];
  const manualAlbums = [];
  for (const [albumId, override] of Object.entries(overrides.albums || {})) {
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
    trackIds: [],
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

async function createCollectionFoldersPayload({ search = '', letter = 'all', limit, offset } = {}) {
  const payload = await readCollectionFolders(libraryDatabasePath, { search });
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
    });
    for (const albumId of albumIds) {
      albumFolderKeys.set(albumId, folderKey);
    }
  }
  const overrides = await getAlbumOverrides();

  for (const [albumId, override] of Object.entries(overrides.albums || {})) {
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
  const page = createPageInfo({ limit, offset }, visibleFolders.length);
  const pagedFolders = visibleFolders.slice(page.offset, page.offset + page.limit);
  const folders = await Promise.all(pagedFolders.map(async (folder) => {
    return {
      ...folder,
      coverUrl: await getCollectionFolderCoverUrl(folder, overrides),
    };
  }));

  return {
    ...payload,
    page,
    folders: folders
      .map((folder) => ({
        ...folder,
        albumIds: [...folder.albumIds],
        albumCount: folder.albumIds.size,
        trackCount: folder.albumIds.size,
      })),
  };
}

async function getCollectionFolderCoverUrl(folder, overrides) {
  const collectionName = cleanText(folder.name || folder.path);
  if (folder.coverTrackId) {
    return `/api/tracks/${folder.coverTrackId}/cover`;
  }
  const manualAlbum = Object.entries(overrides.albums || {})
    .filter(([albumId, override]) => {
      const isManual = override?.manual || albumId.startsWith('manual-');
      return isManual && normalizeCollectionName(override?.collectionName) === normalizeCollectionName(collectionName);
    })
    .map(([albumId, override]) => createManualAlbumFromOverride(albumId, override))
    .filter((album) => album.coverUrl)
    .sort(compareAlbumsNaturally)[0];

  return cleanText(manualAlbum?.coverUrl);
}

async function getAlbumCoverUrl(album, overrides) {
  const overrideCoverUrl = cleanText(overrides.albums?.[album.id]?.coverUrl);
  if (overrideCoverUrl) return overrideCoverUrl;
  if (album.coverUrl) return album.coverUrl;
  if (!album.coverTrackId) return '';
  const coverTrack = await getTrackById(album.coverTrackId);
  return coverTrack?.cachedCoverPath || coverTrack?.coverArtPath || coverTrack?.hasEmbeddedCover
    ? `/api/tracks/${album.coverTrackId}/cover`
    : '';
}

async function getCollectionAlbumSources(collectionName) {
  const normalizedTarget = normalizeCollectionName(collectionName);
  const overrides = await getAlbumOverrides();
  const scannedAlbumIds = [];
  const excludeAlbumIds = [];
  const manualAlbums = [];

  for (const [albumId, override] of Object.entries(overrides.albums || {})) {
    if (!Object.hasOwn(override || {}, 'collectionName')) continue;
    const overrideCollectionName = cleanText(override?.collectionName);
    const matches = normalizeCollectionName(overrideCollectionName) === normalizedTarget;
    const isManual = override?.manual || albumId.startsWith('manual-');

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
  const term = cleanText(search).toLowerCase();
  if (!term) return albums;
  return albums.filter((album) => [
    album.title,
    album.artist,
    album.albumArtist,
    album.genre,
    album.year,
  ].some((value) => String(value || '').toLowerCase().includes(term)));
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
    'Cache-Control': 'no-store',
  };

  if (range.contentRange) {
    headers['Content-Range'] = range.contentRange;
  }

  response.writeHead(range.statusCode, headers);
  createReadStream(track.path, { start: range.start, end: range.end }).pipe(response);
}

async function downloadTrack(response, trackId, url) {
  const track = await getTrackById(trackId);
  if (!track) {
    return respondJson(response, 404, { error: 'Track not found' });
  }

  const quality = normalizeDownloadQuality(url.searchParams.get('quality'));
  const requestedName = sanitizeDownloadFilename(url.searchParams.get('filename'));

  if (quality === 'mp3') {
    return downloadTrackAsMp3(response, track, requestedName);
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
  if (quality === 'mp3' && !await isFfmpegAvailable()) {
    return respondJson(response, 503, {
      error: 'MP3 conversion requires ffmpeg. Rebuild the Docker image or install ffmpeg on the server.',
    });
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

async function downloadTrackAsMp3(response, track, requestedName) {
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
  });
  response.on('close', () => {
    if (!ffmpeg.killed) ffmpeg.kill('SIGKILL');
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
    .slice(0, 1200);
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

async function streamCover(response, trackId) {
  const track = await getTrackById(trackId);
  if (!track?.cachedCoverPath && !track?.coverArtPath && !track?.hasEmbeddedCover) {
    return respondJson(response, 404, { error: 'Cover art not found' });
  }

  if (track.cachedCoverPath && existsSync(track.cachedCoverPath)) {
    const stats = await fs.stat(track.cachedCoverPath);
    response.writeHead(200, {
      'Content-Length': String(stats.size),
      'Content-Type': track.cachedCoverFormat || getContentType(track.cachedCoverPath),
      'Cache-Control': 'public, max-age=604800, immutable',
    });
    createReadStream(track.cachedCoverPath).pipe(response);
    return;
  }

  if (track.coverArtPath) {
    const stats = await fs.stat(track.coverArtPath);
    response.writeHead(200, {
      'Content-Length': String(stats.size),
      'Content-Type': getContentType(track.coverArtPath),
      'Cache-Control': 'public, max-age=604800',
    });
    createReadStream(track.coverArtPath).pipe(response);
    return;
  }

  const embeddedCover = await readEmbeddedCover(track.path);
  if (!embeddedCover) {
    track.hasEmbeddedCover = false;
    return respondJson(response, 404, { error: 'Cover art not found' });
  }

  response.writeHead(200, {
    'Content-Length': String(embeddedCover.data.length),
    'Content-Type': embeddedCover.format || 'image/jpeg',
    'Cache-Control': 'public, max-age=604800',
  });
  response.end(embeddedCover.data);
}

async function updateAlbumCoverOverride(albumId, request) {
  const library = await ensureLibrary();
  const album = library.albums.find((candidate) => candidate.id === albumId);
  if (!album) {
    throw new HttpError(404, 'Album not found');
  }

  const payload = await readRequestJson(request, 64 * 1024);
  const coverUrl = String(payload.coverUrl || '').trim();
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

  const payload = await readRequestJson(request, 512 * 1024);

  if (payload.reset) {
    delete overrides.albums[album.id];
    await writeAlbumOverrides(overrides);
    return { albumId: album.id, reset: true, manual: Boolean(album.manual) };
  }

  const coverUrl = cleanText(payload.coverUrl);
  if (coverUrl && !isAllowedCoverUrl(coverUrl)) {
    throw new HttpError(400, 'Cover URL must be an http, https, or local / path.');
  }

  const allowedTrackIds = new Set(album.trackIds);
  const trackOverrides = {};
  for (const track of Array.isArray(payload.tracks) ? payload.tracks : []) {
    const trackId = cleanText(track.id);
    if (!allowedTrackIds.has(trackId)) continue;

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

async function createManualAlbum(request) {
  const payload = await readRequestJson(request, 512 * 1024);
  const coverUrl = cleanText(payload.coverUrl);
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
    tracks: {},
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
  return {
    generatedAt: null,
    trackCount: 0,
    albumCount: manualAlbums.length,
    albums: manualAlbums,
    tracks: [],
    page: {
      limit: manualAlbums.length || 1,
      offset: 0,
      total: manualAlbums.length,
      hasNext: false,
      hasPrevious: false,
    },
  };
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

function serveStaticAsset(requestPath, response) {
  const normalizedPath = requestPath === '/' ? '/index.html' : requestPath;
  const resolvedPath = path.normalize(path.join(publicDir, normalizedPath));

  if (!resolvedPath.startsWith(publicDir)) {
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
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    }));
}

function renderLoginPage({ next = '/', title = 'Monochrome-Streamer', error = '', currentUser = null } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login | ${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: dark; --accent: #eb9200; --bg: #060606; --panel: rgba(18,18,18,.86); --line: rgba(255,255,255,.14); --text: #f6f3ed; --muted: rgba(246,243,237,.68); }
    * { box-sizing: border-box; }
    body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px; font-family: "Plus Jakarta Sans", "Segoe UI", sans-serif; background: radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 36%), var(--bg); color: var(--text); }
    main { width: min(420px, 100%); border: 1px solid var(--line); border-radius: 30px; padding: 30px; background: linear-gradient(145deg, rgba(255,255,255,.08), transparent), var(--panel); box-shadow: 0 28px 90px rgba(0,0,0,.45); backdrop-filter: blur(22px); }
    p { color: var(--muted); line-height: 1.5; }
    h1 { margin: 0; font-size: clamp(2rem, 6vw, 3.1rem); line-height: .95; letter-spacing: -.06em; }
    label { display: grid; gap: 8px; margin-top: 18px; color: var(--muted); font-weight: 800; font-size: .82rem; text-transform: uppercase; letter-spacing: .14em; }
    input { width: 100%; border: 1px solid var(--line); border-radius: 18px; padding: 14px 16px; background: rgba(255,255,255,.08); color: var(--text); font: inherit; outline: none; }
    input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent); }
    button { width: 100%; margin-top: 22px; border: 0; border-radius: 999px; padding: 15px 18px; background: var(--accent); color: #111; font: inherit; font-weight: 950; cursor: pointer; }
    .error { margin: 16px 0 0; padding: 12px 14px; border-radius: 16px; background: rgba(255,80,80,.16); color: #ffd7d7; }
    .session { margin: 16px 0 0; padding: 12px 14px; border: 1px solid var(--line); border-radius: 16px; background: rgba(255,255,255,.06); }
    .session a { color: var(--accent); font-weight: 900; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p>Sign in to open your local streamer.</p>
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
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  response.end(payload);
}

function respondHtml(response, statusCode, html) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
    'Cache-Control': 'no-store',
  });
  response.end(html);
}

function redirect(response, location) {
  response.writeHead(303, {
    Location: location,
    'Cache-Control': 'no-store',
  });
  response.end();
}

function getWidgetCorsHeaders() {
  const settings = getEffectiveWidgetSettings();
  return {
    'Access-Control-Allow-Origin': settings.widgetCorsOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, X-API-Key, Content-Type',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
  };
}

function respondWidgetOptions(response) {
  response.writeHead(204, getWidgetCorsHeaders());
  response.end();
}

function respondWidgetJson(response, statusCode, body) {
  const payload = JSON.stringify(body);
  response.writeHead(statusCode, {
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

function timingSafeStringEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}
