import { createReadStream, existsSync, promises as fs } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
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
  scanMetadata: 'tags',
  scanDurations: false,
  autoScanOnStart: false,
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

    if (url.pathname === '/api/wanted-albums') {
      const wantedAlbumIds = await getWantedAlbumIds();
      const library = await readLibraryAlbumPage(libraryDatabasePath, {
        limit: url.searchParams.get('limit'),
        offset: url.searchParams.get('offset'),
        search: url.searchParams.get('search'),
        albumIds: wantedAlbumIds,
      });
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
      const scan = await startLibraryScan();
      return respondJson(response, 202, { scan });
    }

    if (url.pathname === '/api/library/folders') {
      if (request.method === 'POST') {
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
      const library = await ensureLibrary();
      return respondJson(response, 200, {
        ...result,
        library: await createLibraryPayload(library),
      });
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
    console.log('Automatic startup scan is disabled. Select folders in Settings > System, then scan.');
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
    scanMetadata: normalizeScanMetadata(process.env.SCAN_METADATA || fileConfig.scanMetadata || defaultConfig.scanMetadata),
    scanDurations: parseBoolean(process.env.SCAN_DURATIONS ?? fileConfig.scanDurations ?? defaultConfig.scanDurations),
    autoScanOnStart: parseBoolean(process.env.AUTO_SCAN_ON_START ?? fileConfig.autoScanOnStart ?? defaultConfig.autoScanOnStart),
    widgetApiKey: process.env.WIDGET_API_KEY || fileConfig.widgetApiKey || defaultConfig.widgetApiKey,
    widgetCorsOrigin: process.env.WIDGET_CORS_ORIGIN || fileConfig.widgetCorsOrigin || defaultConfig.widgetCorsOrigin,
    host: process.env.HOST || fileConfig.host || defaultConfig.host,
    port: Number.parseInt(process.env.PORT || fileConfig.port || defaultConfig.port, 10),
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

function createPagedLibrary(library, options = {}) {
  const limit = [25, 50, 100].includes(Number.parseInt(options.limit || 50, 10))
    ? Number.parseInt(options.limit || 50, 10)
    : 50;
  const offset = Math.max(0, Number.parseInt(options.offset || 0, 10) || 0);
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
      return {
        ...album,
        title: override?.albumTitle || album.title,
        artist: override?.albumArtist || album.artist,
        albumArtist: override?.albumArtist || album.albumArtist || album.artist,
        date: override?.date || album.date || null,
        year: override?.year || album.year || null,
        genre: override?.genre || '',
        mediaTypes: normalizeMediaTypes(override?.mediaTypes || override?.mediaType),
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
        albumArtist: albumOverride?.albumArtist || album?.albumArtist || track.albumArtist || track.artist,
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

async function getWantedAlbumIds() {
  const overrides = await getAlbumOverrides();
  return Object.entries(overrides.albums || {})
    .filter(([, override]) => normalizeAlbumStatus(override?.status) === 'Wanted')
    .map(([albumId]) => albumId);
}

async function getAlbumIdFilterForMediaTypes(value) {
  const selected = normalizeMediaTypeFilter(value);
  if (selected.length === 0) return null;

  const selectedSet = new Set(selected);
  if (selectedSet.size >= 4) return null;

  const overrides = await getAlbumOverrides();
  const overrideEntries = Object.entries(overrides.albums || {})
    .filter(([, override]) => override?.mediaTypes?.length > 0 || override?.mediaType);

  if (selectedSet.has('Digital Media')) {
    return {
      excludeAlbumIds: overrideEntries
        .filter(([, override]) => !normalizeMediaTypes(override.mediaTypes || override.mediaType).some((mediaType) => selectedSet.has(mediaType)))
        .map(([albumId]) => albumId),
    };
  }

  return {
    albumIds: overrideEntries
      .filter(([, override]) => normalizeMediaTypes(override.mediaTypes || override.mediaType).some((mediaType) => selectedSet.has(mediaType)))
      .map(([albumId]) => albumId),
  };
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
  const album = library.albums.find((candidate) => candidate.id === albumId);
  if (!album) {
    throw new HttpError(404, 'Album not found');
  }

  const payload = await readRequestJson(request, 512 * 1024);
  const overrides = await getAlbumOverrides();
  overrides.albums ||= {};

  if (payload.reset) {
    delete overrides.albums[album.id];
    await writeAlbumOverrides(overrides);
    return { albumId: album.id, reset: true };
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
    title: album.title,
    artist: album.artist,
    albumTitle: cleanText(payload.albumTitle),
    albumArtist: cleanText(payload.albumArtist),
    date: cleanText(payload.date),
    year: normalizeYear(payload.year || payload.date),
    genre: cleanText(payload.genre),
    mediaTypes: normalizeMediaTypes(payload.mediaTypes || payload.mediaType),
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

  const query = cleanText(url.searchParams.get('q')) || `${album.artist} ${album.title}`;
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

function normalizeMediaTypes(value) {
  const allowed = new Set(['CD', 'Digital Media', 'Vinyl', 'Cassette Tape']);
  const values = Array.isArray(value) ? value : [value];
  const mediaTypes = values.map(normalizeMediaTypeName).filter((item) => allowed.has(item));
  return mediaTypes.length > 0 ? [...new Set(mediaTypes)] : ['Digital Media'];
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
  const allowed = new Set(['Collection', 'Wanted']);
  const status = cleanText(value);
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

function getWidgetCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': config.widgetCorsOrigin || '*',
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
  const expectedKey = String(config.widgetApiKey || '').trim();
  if (!expectedKey) return false;
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
