import { createReadStream, existsSync, promises as fs } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildByteRange,
  createTrackId,
  getContentType,
  scanMusicLibrary,
} from './lib/library.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const configPath = path.join(__dirname, 'config.json');

const defaultConfig = {
  title: 'Monochrome-Streamer',
  libraryPath: '',
  artistInfoPath: 'artist-info.json',
  artistOverridesPath: 'artist-overrides.json',
  albumOverridesPath: 'album-overrides.json',
  lyricsOverridesPath: 'lyrics-overrides.json',
  lyricsSidecarPath: 'lyrics',
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

if (!libraryRoot || !existsSync(libraryRoot)) {
  console.error(`Music library path is missing or invalid: ${libraryRoot || '(empty)'}`);
  console.error(`Copy ${path.basename(configPath)} from config.example.json and set "libraryPath" first.`);
  process.exit(1);
}

let libraryCache = null;
let trackMap = new Map();
let cachePromise = null;
let artistInfoCache = new Map();
let manualArtistInfoCache = null;
let artistOverridesCache = null;
let albumOverridesCache = null;
let lyricsOverridesCache = null;

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    if (url.pathname === '/api/config') {
      return respondJson(response, 200, {
        title: config.title,
        generatedAt: libraryCache?.generatedAt ?? null,
      });
    }

    if (url.pathname === '/api/library') {
      const library = await ensureLibrary();
      return respondJson(response, 200, await createLibraryPayload(library));
    }

    if (url.pathname === '/api/rescan' && request.method === 'POST') {
      const library = await refreshLibrary();
      return respondJson(response, 200, await createLibraryPayload(library));
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

await refreshLibrary();
await migrateLyricsOverridesToSidecars();

server.listen(config.port, config.host, () => {
  console.log(`Monochrome-Streamer ready at http://${config.host}:${config.port}`);
  console.log(`Streaming from: ${libraryRoot}`);
});

async function loadConfig() {
  const fileConfig = existsSync(configPath)
    ? JSON.parse(await fs.readFile(configPath, 'utf8'))
    : {};

  return {
    ...defaultConfig,
    ...fileConfig,
    title: process.env.APP_TITLE || fileConfig.title || defaultConfig.title,
    libraryPath: process.env.MUSIC_LIBRARY_PATH || fileConfig.libraryPath || defaultConfig.libraryPath,
    artistInfoPath: process.env.ARTIST_INFO_PATH || fileConfig.artistInfoPath || defaultConfig.artistInfoPath,
    artistOverridesPath: process.env.ARTIST_OVERRIDES_PATH || fileConfig.artistOverridesPath || defaultConfig.artistOverridesPath,
    albumOverridesPath: process.env.ALBUM_OVERRIDES_PATH || fileConfig.albumOverridesPath || defaultConfig.albumOverridesPath,
    lyricsOverridesPath: process.env.LYRICS_OVERRIDES_PATH || fileConfig.lyricsOverridesPath || defaultConfig.lyricsOverridesPath,
    lyricsSidecarPath: process.env.LYRICS_SIDECAR_PATH || fileConfig.lyricsSidecarPath || defaultConfig.lyricsSidecarPath,
    host: process.env.HOST || fileConfig.host || defaultConfig.host,
    port: Number.parseInt(process.env.PORT || fileConfig.port || defaultConfig.port, 10),
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

async function refreshLibrary() {
  cachePromise = scanMusicLibrary(libraryRoot).then((library) => {
    libraryCache = library;
    trackMap = new Map(library.tracks.map((track) => [track.id, track]));
    return library;
  });

  return cachePromise.finally(() => {
    cachePromise = null;
  });
}

async function createLibraryPayload(library) {
  const overrides = await getAlbumOverrides();
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
    albums: library.albums.map((album) => {
      const override = overrides.albums?.[album.id] || null;
      const scannedCoverUrl = album.coverTrackId ? `/api/tracks/${album.coverTrackId}/cover` : null;
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
      const scannedCoverUrl = track.coverArtPath || track.embeddedCover ? `/api/tracks/${track.id}/cover` : null;
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

async function streamTrack(response, trackId, rangeHeader) {
  const track = trackMap.get(trackId);
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
  const track = trackMap.get(trackId);
  if (!track?.coverArtPath && !track?.embeddedCover) {
    return respondJson(response, 404, { error: 'Cover art not found' });
  }

  if (track.coverArtPath) {
    const stats = await fs.stat(track.coverArtPath);
    response.writeHead(200, {
      'Content-Length': String(stats.size),
      'Content-Type': getContentType(track.coverArtPath),
      'Cache-Control': 'public, max-age=300',
    });
    createReadStream(track.coverArtPath).pipe(response);
    return;
  }

  response.writeHead(200, {
    'Content-Length': String(track.embeddedCover.data.length),
    'Content-Type': track.embeddedCover.format || 'image/jpeg',
    'Cache-Control': 'public, max-age=300',
  });
  response.end(track.embeddedCover.data);
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
  const allowed = new Set(['CD', 'Digital Media', 'Vinyl']);
  const values = Array.isArray(value) ? value : [value];
  const mediaTypes = values.map(cleanText).filter((item) => allowed.has(item));
  return mediaTypes.length > 0 ? [...new Set(mediaTypes)] : ['Digital Media'];
}

function normalizeAlbumStatus(value) {
  const allowed = new Set(['Collection', 'Wanted']);
  const status = cleanText(value);
  return allowed.has(status) ? status : 'Collection';
}

async function getAlbumOverrides() {
  if (!albumOverridesPath) {
    return { albums: {} };
  }

  if (albumOverridesCache) {
    return albumOverridesCache;
  }

  if (!existsSync(albumOverridesPath)) {
    albumOverridesCache = { albums: {} };
    return albumOverridesCache;
  }

  const rawOverrides = JSON.parse(await fs.readFile(albumOverridesPath, 'utf8'));
  albumOverridesCache = {
    albums: rawOverrides.albums && typeof rawOverrides.albums === 'object'
      ? rawOverrides.albums
      : {},
  };
  return albumOverridesCache;
}

async function writeAlbumOverrides(overrides) {
  if (!albumOverridesPath) {
    throw new HttpError(400, 'Album cover editing is not configured.');
  }

  await fs.mkdir(path.dirname(albumOverridesPath), { recursive: true });
  await fs.writeFile(albumOverridesPath, `${JSON.stringify(overrides, null, 2)}\n`, 'utf8');
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
  if (!lyricsOverridesPath) {
    return { tracks: {} };
  }

  if (lyricsOverridesCache) {
    return lyricsOverridesCache;
  }

  if (!existsSync(lyricsOverridesPath)) {
    lyricsOverridesCache = { tracks: {} };
    return lyricsOverridesCache;
  }

  const rawOverrides = JSON.parse(await fs.readFile(lyricsOverridesPath, 'utf8'));
  lyricsOverridesCache = {
    tracks: rawOverrides.tracks && typeof rawOverrides.tracks === 'object'
      ? rawOverrides.tracks
      : {},
  };
  return lyricsOverridesCache;
}

async function writeLyricsOverrides(overrides) {
  if (!lyricsOverridesPath) {
    throw new HttpError(400, 'Lyrics editing is not configured.');
  }

  await fs.mkdir(path.dirname(lyricsOverridesPath), { recursive: true });
  await fs.writeFile(lyricsOverridesPath, `${JSON.stringify(overrides, null, 2)}\n`, 'utf8');
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
  if (!artistOverridesPath) {
    return { artists: {} };
  }

  if (artistOverridesCache) {
    return artistOverridesCache;
  }

  if (!existsSync(artistOverridesPath)) {
    artistOverridesCache = { artists: {} };
    return artistOverridesCache;
  }

  const rawOverrides = JSON.parse(await fs.readFile(artistOverridesPath, 'utf8'));
  artistOverridesCache = {
    artists: rawOverrides.artists && typeof rawOverrides.artists === 'object'
      ? rawOverrides.artists
      : {},
  };
  return artistOverridesCache;
}

async function writeArtistOverrides(overrides) {
  if (!artistOverridesPath) {
    throw new HttpError(400, 'Artist editing is not configured.');
  }

  await fs.mkdir(path.dirname(artistOverridesPath), { recursive: true });
  await fs.writeFile(artistOverridesPath, `${JSON.stringify(overrides, null, 2)}\n`, 'utf8');
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
