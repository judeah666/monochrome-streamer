import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseCollectionNames } from '../src/shared/collectionNames.js';

export const AUDIO_EXTENSIONS = new Set([
  '.mp3',
  '.flac',
  '.m4a',
  '.aac',
  '.ogg',
  '.opus',
  '.wav',
  '.webm',
]);

const COVER_FILENAMES = ['cover', 'folder', 'front', 'album', 'art'];
const COVER_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

export async function scanMusicLibrary(libraryPath, options = {}) {
  const normalizedRoot = path.resolve(libraryPath);
  const tracks = [];
  const coverCache = new Map();
  const scanMetadata = options.scanMetadata !== 'filename';
  const scanDurations = options.scanDurations === true;
  const forceMetadataRefresh = options.forceMetadataRefresh === true;
  const metadataParser = scanMetadata ? await loadMetadataParser() : null;
  const roots = getScanRoots(normalizedRoot, options.includeFolders);
  const cachedTracks = new Map(
    Array.isArray(options.cachedTracks)
      ? options.cachedTracks.map((track) => [track.relativePath, track])
      : [],
  );
  const skipInitialCount = options.skipInitialCount === true;
  let totalFiles = skipInitialCount
    ? getEstimatedTotalFiles(cachedTracks, options.includeFolders)
    : await countAudioFilesInRoots(roots);
  let processedFiles = 0;
  let reusedFiles = 0;
  let parsedFiles = 0;

  options.onProgress?.({
    phase: 'scanning',
    totalFiles,
    processedFiles,
    percent: 0,
    currentFolder: '',
  });

  for (const root of roots) {
    await walkDirectory(root, async (filePath) => {
      if (!isAudioFile(filePath)) {
        return;
      }

      const relativePath = path.relative(normalizedRoot, filePath);
      const currentFolder = getTopLevelFolder(relativePath);
      const stats = await fs.stat(filePath);
      options.onProgress?.({
        phase: 'scanning',
        totalFiles,
        processedFiles,
        reusedFiles,
        parsedFiles,
        percent: getScanPercent(processedFiles, totalFiles),
        currentFolder,
      });
      const cachedTrack = cachedTracks.get(relativePath);
      if (canReuseCachedTrack(cachedTrack, stats, { scanMetadata, scanDurations, forceMetadataRefresh })) {
        tracks.push({
          ...cachedTrack,
          path: filePath,
        });
        processedFiles += 1;
        reusedFiles += 1;
        if (skipInitialCount && processedFiles > totalFiles) {
          totalFiles = processedFiles;
        }
        options.onProgress?.({
          phase: 'scanning',
          totalFiles,
          processedFiles,
          reusedFiles,
          parsedFiles,
          percent: getScanPercent(processedFiles, totalFiles),
          currentFolder,
        });
        return;
      }

      const directoryPath = path.dirname(filePath);
      const coverArtPath = await findCoverArt(directoryPath, coverCache);
      const fallbackMetadata = inferTrackMetadata(relativePath);
      const tagMetadata = await readTaggedMetadata(filePath, metadataParser, { scanDurations });
      const metadata = mergeTrackMetadata(fallbackMetadata, tagMetadata);
      const id = createTrackId(relativePath);

      tracks.push({
        id,
        title: metadata.title,
        artist: metadata.artist,
        albumArtist: metadata.albumArtist,
        album: metadata.album,
        trackNumber: metadata.trackNumber,
        discNumber: metadata.discNumber,
        date: tagMetadata.date,
        year: tagMetadata.year,
        relativePath,
        path: filePath,
        fileSize: stats.size,
        mtimeMs: Math.round(stats.mtimeMs),
        scanMetadata,
        scanDurations,
        coverArtPath,
        hasEmbeddedCover: tagMetadata.hasEmbeddedCover || !coverArtPath,
        duration: tagMetadata.duration,
        audioQuality: tagMetadata.audioQuality,
        collectionName: tagMetadata.collectionName,
      });
      processedFiles += 1;
      parsedFiles += 1;
      if (skipInitialCount && processedFiles > totalFiles) {
        totalFiles = processedFiles;
      }
      options.onProgress?.({
        phase: 'scanning',
        totalFiles,
        processedFiles,
        reusedFiles,
        parsedFiles,
        percent: getScanPercent(processedFiles, totalFiles),
        currentFolder,
      });
    });
  }

  tracks.sort(compareTracks);
  const albums = buildAlbums(tracks, {
    cachedAlbums: options.cachedAlbums,
    cachedTracks: options.cachedTracks,
  });

  return {
    generatedAt: new Date().toISOString(),
    trackCount: tracks.length,
    albumCount: albums.length,
    tracks,
    albums,
  };
}

function getEstimatedTotalFiles(cachedTracks, includeFolders = null) {
  if (!Array.isArray(includeFolders)) return cachedTracks.size;

  const normalizedFolders = includeFolders
    .map((folder) => normalizeRelativePath(folder))
    .filter(Boolean);
  if (normalizedFolders.length === 0) return 0;

  let total = 0;
  for (const relativePath of cachedTracks.keys()) {
    const normalizedPath = normalizeRelativePath(relativePath);
    if (normalizedFolders.some((folder) => normalizedPath === folder || normalizedPath.startsWith(`${folder}/`))) {
      total += 1;
    }
  }
  return total;
}

function normalizeRelativePath(value) {
  return String(value || '')
    .replaceAll('\\', '/')
    .replace(/^\/+/u, '')
    .replace(/\/+$/u, '');
}

function canReuseCachedTrack(track, stats, options) {
  if (!track) return false;
  if (options.forceMetadataRefresh) return false;
  return (
    track.fileSize === stats.size
    && track.mtimeMs === Math.round(stats.mtimeMs)
    && track.scanMetadata === options.scanMetadata
    && track.scanDurations === options.scanDurations
  );
}

function getScanRoots(normalizedRoot, includeFolders = null) {
  if (!Array.isArray(includeFolders)) return [normalizedRoot];

  return includeFolders
    .map((folder) => path.resolve(normalizedRoot, String(folder || '')))
    .filter((folderPath) => folderPath === normalizedRoot || folderPath.startsWith(`${normalizedRoot}${path.sep}`));
}

async function countAudioFilesInRoots(roots) {
  let total = 0;
  for (const root of roots) {
    total += await countAudioFiles(root);
  }
  return total;
}

async function countAudioFiles(rootPath) {
  let total = 0;
  let entries = [];
  try {
    entries = await fs.readdir(rootPath, { withFileTypes: true });
  } catch {
    return 0;
  }

  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      total += await countAudioFiles(entryPath);
    } else if (entry.isFile() && isAudioFile(entryPath)) {
      total += 1;
    }
  }
  return total;
}

function getScanPercent(processedFiles, totalFiles) {
  if (!totalFiles) return 100;
  return Math.min(100, Math.max(0, Math.round((processedFiles / totalFiles) * 100)));
}

function getTopLevelFolder(relativePath) {
  return relativePath.replace(/\\/gu, '/').split('/').filter(Boolean)[0] || '';
}

async function loadMetadataParser() {
  try {
    return await import('music-metadata');
  } catch {
    return null;
  }
}

async function readTaggedMetadata(filePath, metadataParser, options = {}) {
  if (!metadataParser?.parseFile) {
    return {
      title: '',
      artist: '',
      album: '',
      albumArtist: '',
      collectionName: '',
      trackNumber: null,
      discNumber: null,
      date: '',
      year: null,
      duration: null,
      audioQuality: createAudioQuality({}, filePath),
      hasEmbeddedCover: false,
    };
  }

  try {
    const parsed = await metadataParser.parseFile(filePath, {
      duration: options.scanDurations === true,
      skipCovers: true,
    });
    const date = normalizeTagDate(
      parsed.common.date
        || parsed.common.originaldate
        || parsed.common.releasedate
        || parsed.common.year,
    );

    return {
      title: parsed.common.title || '',
      artist: normalizeTagArtists(parsed.common.artists) || parsed.common.artist || '',
      album: parsed.common.album || '',
      albumArtist: parsed.common.albumartist || '',
      collectionName: extractCollectionTag(parsed),
      trackNumber: parsed.common.track?.no || null,
      discNumber: parsed.common.disk?.no || null,
      date,
      year: normalizeTagYear(parsed.common.year || date),
      duration: Number.isFinite(parsed.format.duration) ? parsed.format.duration : null,
      audioQuality: createAudioQuality(parsed.format, filePath),
      hasEmbeddedCover: false,
    };
  } catch {
    return {
      title: '',
      artist: '',
      album: '',
      albumArtist: '',
      collectionName: '',
      trackNumber: null,
      discNumber: null,
      date: '',
      year: null,
      duration: null,
      audioQuality: createAudioQuality({}, filePath),
      hasEmbeddedCover: false,
    };
  }
}

export async function readEmbeddedCover(filePath) {
  const metadataParser = await loadMetadataParser();
  if (!metadataParser?.parseFile) return null;

  try {
    const parsed = await metadataParser.parseFile(filePath, {
      duration: false,
      skipCovers: false,
    });
    const picture = parsed.common.picture?.[0] || null;
    if (!picture?.data) return null;

    return {
      data: Buffer.from(picture.data),
      format: picture.format || 'image/jpeg',
    };
  } catch {
    return null;
  }
}

function mergeTrackMetadata(fallbackMetadata, tagMetadata) {
  const artist = tagMetadata.artist || fallbackMetadata.artist;
  const albumArtist = tagMetadata.albumArtist || artist;
  return {
    title: tagMetadata.title || fallbackMetadata.title,
    artist,
    albumArtist,
    album: tagMetadata.album || fallbackMetadata.album,
    collectionName: tagMetadata.collectionName || '',
    trackNumber: tagMetadata.trackNumber ?? fallbackMetadata.trackNumber,
    discNumber: tagMetadata.discNumber ?? fallbackMetadata.discNumber,
  };
}

function extractCollectionTag(parsed) {
  const common = parsed?.common || {};
  const commonValue = common.collection || common.albumcollection || common.albumCollection || '';
  if (commonValue) return normalizeTagValue(commonValue);

  for (const tags of Object.values(parsed?.native || {})) {
    if (!Array.isArray(tags)) continue;
    for (const tag of tags) {
      const key = String(tag?.id || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
      if (!['collection', 'albumcollection'].includes(key)) continue;
      const value = normalizeTagValue(tag?.value);
      if (value) return value;
    }
  }

  return '';
}

function normalizeTagValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return String(value || '').trim();
}

function normalizeTagArtists(artists) {
  if (!Array.isArray(artists) || artists.length === 0) return '';
  return artists.filter(Boolean).join(', ');
}

function normalizeTagDate(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const match = text.match(/\b\d{4}(?:-\d{2}(?:-\d{2})?)?\b/u);
  return match ? match[0] : text;
}

function normalizeTagYear(value) {
  const match = String(value || '').match(/\b(\d{4})\b/u);
  return match ? match[1] : null;
}

function createAudioQuality(format, filePath = '') {
  const sampleRate = Number.isFinite(format.sampleRate) ? format.sampleRate : null;
  const bitDepth = Number.isFinite(format.bitsPerSample) ? format.bitsPerSample : null;
  const bitrate = Number.isFinite(format.bitrate) ? Math.round(format.bitrate) : null;
  const codec = String(format.codec || format.container || '').toLowerCase();
  const extension = path.extname(filePath).toLowerCase();
  const pathText = String(filePath).toLowerCase();
  const isMp3 = codec.includes('mpeg') || codec.includes('mp3') || extension === '.mp3';
  const isFlac = codec.includes('flac') || extension === '.flac';
  const kbps = bitrate ? Math.round(bitrate / 1000) : null;

  if (bitDepth && bitDepth >= 24 && sampleRate && sampleRate > 96000) {
    return {
      label: 'Hi-Res 24-Bit / up to 192 KHz',
      labelTop: 'Hi-Res 24-Bit',
      labelBottom: 'up to 192 KHz',
      iconType: 'hires',
      bitDepth,
      sampleRate,
      bitrate,
    };
  }

  if (bitDepth && bitDepth >= 24 && sampleRate && sampleRate > 44100) {
    return {
      label: 'Hi-Res 24-Bit / up to 96 KHz',
      labelTop: 'Hi-Res 24-Bit',
      labelBottom: 'up to 96 KHz',
      iconType: 'hires',
      bitDepth,
      sampleRate,
      bitrate,
    };
  }

  if (bitDepth === 16 && sampleRate === 44100) {
    return {
      label: 'CD 16-Bit / 44.1 KHz',
      labelTop: 'CD 16-Bit',
      labelBottom: '44.1 KHz',
      iconType: 'cd',
      bitDepth,
      sampleRate,
      bitrate,
    };
  }

  if (isMp3 && kbps && kbps >= 300) {
    return {
      label: 'MP3 320 kbps',
      labelTop: 'MP3',
      labelBottom: '320 kbps',
      iconType: 'mp3',
      bitDepth,
      sampleRate,
      bitrate,
    };
  }

  if (isMp3) {
    const fallbackKbps = kbps || 320;
    return {
      label: `MP3 ${fallbackKbps} kbps`,
      labelTop: 'MP3',
      labelBottom: `${fallbackKbps} kbps`,
      iconType: 'mp3',
      bitDepth,
      sampleRate,
      bitrate: bitrate || fallbackKbps * 1000,
    };
  }

  if (isFlac && /24[\s-]?bit|24bit|hi[\s-]?res|hires/u.test(pathText)) {
    const highRate = /192/u.test(pathText);
    return {
      label: highRate ? 'Hi-Res 24-Bit / up to 192 KHz' : 'Hi-Res 24-Bit / up to 96 KHz',
      labelTop: 'Hi-Res 24-Bit',
      labelBottom: highRate ? 'up to 192 KHz' : 'up to 96 KHz',
      iconType: 'hires',
      bitDepth: bitDepth || 24,
      sampleRate: sampleRate || (highRate ? 192000 : 96000),
      bitrate,
    };
  }

  if (isFlac) {
    return {
      label: 'Lossless FLAC',
      labelTop: 'Lossless',
      labelBottom: 'FLAC',
      iconType: 'cd',
      bitDepth,
      sampleRate,
      bitrate,
    };
  }

  return {
    label: formatAudioQualityFallback({ bitDepth, sampleRate, kbps, isMp3 }),
    labelTop: formatAudioQualityTop({ bitDepth, kbps, isMp3 }),
    labelBottom: formatAudioQualityBottom({ sampleRate, kbps, isMp3 }),
    iconType: isMp3 ? 'mp3' : 'audio',
    bitDepth,
    sampleRate,
    bitrate,
  };
}

function formatAudioQualityFallback({ bitDepth, sampleRate, kbps, isMp3 }) {
  if (isMp3 && kbps) return `MP3 ${kbps} kbps`;
  if (bitDepth && sampleRate) return `${bitDepth}-Bit / ${formatSampleRate(sampleRate)}`;
  if (sampleRate) return formatSampleRate(sampleRate);
  return 'Audio quality unknown';
}

function formatAudioQualityTop({ bitDepth, kbps, isMp3 }) {
  if (isMp3) return 'MP3';
  if (bitDepth) return `${bitDepth}-Bit`;
  if (kbps) return `${kbps} kbps`;
  return 'Audio';
}

function formatAudioQualityBottom({ sampleRate, kbps, isMp3 }) {
  if (isMp3 && kbps) return `${kbps} kbps`;
  if (sampleRate) return formatSampleRate(sampleRate);
  return 'quality unknown';
}

function formatSampleRate(sampleRate) {
  return sampleRate % 1000 === 0
    ? `${sampleRate / 1000} KHz`
    : `${(sampleRate / 1000).toFixed(1)} KHz`;
}

export function inferTrackMetadata(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  const segments = normalized.split('/').filter(Boolean);
  const filename = segments.at(-1) ?? '';
  const basename = path.posix.basename(filename, path.posix.extname(filename));
  const parsedFilename = parseTrackBasename(basename);
  const albumDirectory = segments.length >= 2 ? segments.at(-2) : null;
  const artistDirectory = segments.length >= 3 ? segments.at(-3) : null;

  return {
    title: parsedFilename.title || humanizeName(basename),
    artist: artistDirectory ? humanizeName(artistDirectory) : 'Unknown Artist',
    album: albumDirectory ? humanizeName(albumDirectory) : 'Singles',
    trackNumber: parsedFilename.trackNumber,
    discNumber: parsedFilename.discNumber,
  };
}

export function createTrackId(relativePath) {
  return createHash('sha1').update(relativePath).digest('hex').slice(0, 16);
}

export function getContentType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.mp3':
      return 'audio/mpeg';
    case '.flac':
      return 'audio/flac';
    case '.m4a':
      return 'audio/mp4';
    case '.aac':
      return 'audio/aac';
    case '.ogg':
      return 'audio/ogg';
    case '.opus':
      return 'audio/ogg';
    case '.wav':
      return 'audio/wav';
    case '.webm':
      return 'audio/webm';
    case '.ttf':
      return 'font/ttf';
    case '.otf':
      return 'font/otf';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.avif':
      return 'image/avif';
    default:
      return 'application/octet-stream';
  }
}

export function buildByteRange(rangeHeader, fileSize) {
  if (!rangeHeader) {
    return {
      start: 0,
      end: fileSize - 1,
      statusCode: 200,
      contentLength: fileSize,
      contentRange: null,
    };
  }

  const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  if (!match) {
    throw new Error('Invalid Range header');
  }

  let [, startText, endText] = match;
  let start = startText === '' ? NaN : Number.parseInt(startText, 10);
  let end = endText === '' ? NaN : Number.parseInt(endText, 10);

  if (Number.isNaN(start)) {
    const suffixLength = Number.isNaN(end) ? fileSize : end;
    start = Math.max(fileSize - suffixLength, 0);
    end = fileSize - 1;
  } else if (Number.isNaN(end)) {
    end = fileSize - 1;
  }

  if (start < 0 || end < start || start >= fileSize) {
    throw new RangeError('Requested range not satisfiable');
  }

  end = Math.min(end, fileSize - 1);

  return {
    start,
    end,
    statusCode: 206,
    contentLength: end - start + 1,
    contentRange: `bytes ${start}-${end}/${fileSize}`,
  };
}

async function walkDirectory(rootPath, onFile) {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      await walkDirectory(entryPath, onFile);
    } else if (entry.isFile()) {
      await onFile(entryPath);
    }
  }
}

function isAudioFile(filePath) {
  return AUDIO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

async function findCoverArt(directoryPath, coverCache) {
  if (coverCache.has(directoryPath)) {
    return coverCache.get(directoryPath);
  }

  const files = await fs.readdir(directoryPath, { withFileTypes: true });
  const fileNames = files.filter((entry) => entry.isFile()).map((entry) => entry.name);

  for (const baseName of COVER_FILENAMES) {
    for (const extension of COVER_EXTENSIONS) {
      const match = fileNames.find((name) => name.toLowerCase() === `${baseName}${extension}`);
      if (match) {
        const coverPath = path.join(directoryPath, match);
        coverCache.set(directoryPath, coverPath);
        return coverPath;
      }
    }
  }

  const firstImage = fileNames.find((name) => COVER_EXTENSIONS.includes(path.extname(name).toLowerCase()));
  const coverPath = firstImage ? path.join(directoryPath, firstImage) : null;
  coverCache.set(directoryPath, coverPath);
  return coverPath;
}

function parseTrackBasename(basename) {
  const patterns = [
    /^(?<disc>\d{1,2})\s*[-_.]\s*(?<track>\d{1,2})\s*[-_.]\s*(?<title>.+)$/u,
    /^(?<track>\d{1,2})\s*[-_.]\s*(?<title>.+)$/u,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(basename);
    if (match?.groups) {
      return {
        discNumber: match.groups.disc ? Number.parseInt(match.groups.disc, 10) : null,
        trackNumber: match.groups.track ? Number.parseInt(match.groups.track, 10) : null,
        title: humanizeName(match.groups.title),
      };
    }
  }

  return {
    discNumber: null,
    trackNumber: null,
    title: humanizeName(basename),
  };
}

function humanizeName(value) {
  return String(value)
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compareTracks(left, right) {
  return (
    left.artist.localeCompare(right.artist) ||
    left.album.localeCompare(right.album) ||
    compareNullableNumber(left.discNumber, right.discNumber) ||
    compareNullableNumber(left.trackNumber, right.trackNumber) ||
    left.title.localeCompare(right.title)
  );
}

function compareNullableNumber(left, right) {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return left - right;
}

export function buildAlbums(tracks, { cachedAlbums = [], cachedTracks = [] } = {}) {
  const albumGroups = groupTracksByAlbumFolder(tracks);
  const albumIds = resolveAlbumGroupIds(albumGroups, { cachedAlbums, cachedTracks });
  const albums = albumGroups.map((group) => {
    const [firstTrack] = group.tracks;
    const album = {
      id: albumIds.get(group.key),
      title: firstTrack.album,
      artist: group.albumArtist,
      albumArtist: group.albumArtist,
      date: '',
      year: null,
      collectionName: '',
      collectionNames: [],
      coverTrackId: null,
      trackIds: [],
      folderPaths: [],
    };

    for (const track of group.tracks) {
      const trackFolderPath = getTrackFolderPath(track.relativePath || '');
      album.trackIds.push(track.id);
      for (const collectionName of parseCollectionNames(track.collectionName)) {
        if (!album.collectionNames.some((name) => name.toLowerCase() === collectionName.toLowerCase())) {
          album.collectionNames.push(collectionName);
        }
      }
      if (trackFolderPath && !album.folderPaths.includes(trackFolderPath)) {
        album.folderPaths.push(trackFolderPath);
      }
      if (!album.date && track.date) {
        album.date = track.date;
      }
      if (!album.year && track.year) {
        album.year = track.year;
      }
      if (!album.coverTrackId && (track.coverArtPath || track.hasEmbeddedCover)) {
        album.coverTrackId = track.id;
      }
    }

    return album;
  });

  for (const album of albums) {
    if (album.collectionNames.length > 0) {
      album.collectionName = album.collectionNames.join(', ');
    }
  }

  assignInferredCollectionNames(albums);

  const trackMap = new Map(tracks.map((track) => [track.id, track]));
  for (const album of albums) {
    const albumTracks = album.trackIds.map((trackId) => trackMap.get(trackId)).filter(Boolean);
    album.audioQuality = getBestAudioQuality(albumTracks.map((track) => track.audioQuality).filter(Boolean));
    delete album.folderPaths;
  }

  return albums.sort((left, right) => {
    return left.artist.localeCompare(right.artist) || left.title.localeCompare(right.title) || left.id.localeCompare(right.id);
  });
}

function groupTracksByAlbumFolder(tracks) {
  const groups = new Map();

  for (const track of tracks) {
    const albumArtist = track.albumArtist || track.artist;
    const baseKey = `${albumArtist}::${track.album}`;
    const folderIdentity = getAlbumFolderIdentity(track.relativePath || '');
    const folderKey = normalizeAlbumFolderKey(folderIdentity);
    const key = `${baseKey}::${folderKey}`;
    if (!groups.has(key)) {
      groups.set(key, { key, baseKey, albumArtist, folderKey, tracks: [] });
    }
    groups.get(key).tracks.push(track);
  }

  return [...groups.values()].sort((left, right) => (
    left.baseKey.localeCompare(right.baseKey)
    || left.folderKey.localeCompare(right.folderKey)
  ));
}

function resolveAlbumGroupIds(groups, { cachedAlbums = [], cachedTracks = [] } = {}) {
  const ids = new Map();
  const usedIds = new Set();
  const cachedTrackMap = new Map(
    (Array.isArray(cachedTracks) ? cachedTracks : []).map((track) => [track.id, track]),
  );
  const cachedByBaseKey = new Map();

  for (const album of Array.isArray(cachedAlbums) ? cachedAlbums : []) {
    const albumArtist = album.albumArtist || album.artist;
    const baseKey = `${albumArtist}::${album.title}`;
    const trackIds = new Set(Array.isArray(album.trackIds) ? album.trackIds : []);
    const folderKeys = new Set(
      [...trackIds]
        .map((trackId) => cachedTrackMap.get(trackId))
        .filter(Boolean)
        .map((track) => normalizeAlbumFolderKey(getAlbumFolderIdentity(track.relativePath || '')))
        .filter(Boolean),
    );
    if (!cachedByBaseKey.has(baseKey)) cachedByBaseKey.set(baseKey, []);
    cachedByBaseKey.get(baseKey).push({ id: album.id, trackIds, folderKeys });
  }

  const groupsByBaseKey = new Map();
  for (const group of groups) {
    if (!groupsByBaseKey.has(group.baseKey)) groupsByBaseKey.set(group.baseKey, []);
    groupsByBaseKey.get(group.baseKey).push(group);
  }
  for (const [baseKey, matchingGroups] of groupsByBaseKey) {
    const candidates = cachedByBaseKey.get(baseKey) || [];
    const assignments = [];
    for (const group of matchingGroups) {
      const groupTrackIds = new Set(group.tracks.map((track) => track.id));
      for (const candidate of candidates) {
        const overlap = [...groupTrackIds].filter((trackId) => candidate.trackIds.has(trackId)).length;
        const folderMatch = candidate.folderKeys.size === 1 && candidate.folderKeys.has(group.folderKey);
        if (overlap > 0 || folderMatch) {
          assignments.push({ group, candidate, overlap, folderMatch });
        }
      }
    }

    // Prefer the prior folder/track match so splitting an album does not invalidate its existing ID.
    assignments.sort((left, right) => (
      Number(right.folderMatch) - Number(left.folderMatch)
      || right.overlap - left.overlap
      || left.group.folderKey.localeCompare(right.group.folderKey)
      || left.candidate.id.localeCompare(right.candidate.id)
    ));
    const assignedGroups = new Set();
    const assignedCandidates = new Set();
    for (const assignment of assignments) {
      if (assignedGroups.has(assignment.group.key) || assignedCandidates.has(assignment.candidate.id)) continue;
      ids.set(assignment.group.key, assignment.candidate.id);
      usedIds.add(assignment.candidate.id);
      assignedGroups.add(assignment.group.key);
      assignedCandidates.add(assignment.candidate.id);
    }

    const remainingGroups = matchingGroups.filter((group) => !ids.has(group.key));
    const remainingCandidates = candidates.filter((candidate) => !assignedCandidates.has(candidate.id));
    if (remainingGroups.length === 1 && remainingCandidates.length === 1) {
      ids.set(remainingGroups[0].key, remainingCandidates[0].id);
      usedIds.add(remainingCandidates[0].id);
    }

    const legacyId = createTrackId(baseKey);
    for (const group of matchingGroups) {
      if (ids.has(group.key)) continue;
      const id = !usedIds.has(legacyId)
        ? legacyId
        : createTrackId(`${baseKey}::${group.folderKey}`);
      ids.set(group.key, id);
      usedIds.add(id);
    }
  }

  return ids;
}

export function getAlbumFolderIdentity(relativePath) {
  const trackFolderPath = getTrackFolderPath(relativePath);
  if (!trackFolderPath) return '';
  const segments = trackFolderPath.split('/').filter(Boolean);
  if (segments.length > 1 && isDiscFolderName(segments.at(-1))) {
    segments.pop();
  }
  return segments.join('/');
}

function normalizeAlbumFolderKey(value) {
  return String(value || '').replace(/\\/gu, '/').replace(/\/+$/gu, '');
}

function isDiscFolderName(value) {
  return /^(?:cd|disc|disk|side)\s*[-_.]?\s*(?:\d+|[a-z])(?:\s*(?:of|\/|-)?\s*\d+)?$/iu.test(String(value || '').trim());
}

function getTrackFolderPath(relativePath) {
  const normalized = String(relativePath || '').replace(/\\/gu, '/');
  const index = normalized.lastIndexOf('/');
  return index > -1 ? normalized.slice(0, index) : '';
}

export function inferCollectionNameFromFolderPath(folderPath, albumTitle = '') {
  return inferCollectionCandidateFromFolderPath(folderPath, albumTitle)?.name || '';
}

function assignInferredCollectionNames(albums) {
  const candidatesByAlbumId = new Map();
  const groupsByPath = new Map();

  for (const album of albums) {
    const candidates = [];
    for (const folderPath of album.folderPaths || []) {
      const candidate = inferCollectionCandidateFromFolderPath(folderPath, album.title);
      if (!candidate) continue;
      candidates.push(candidate);
      if (!groupsByPath.has(candidate.path)) {
        groupsByPath.set(candidate.path, {
          name: candidate.name,
          albumIds: new Set(),
        });
      }
      groupsByPath.get(candidate.path).albumIds.add(album.id);
    }
    candidatesByAlbumId.set(album.id, candidates);
  }

  for (const album of albums) {
    if (parseCollectionNames(album.collectionName).length > 0) continue;
    const selected = (candidatesByAlbumId.get(album.id) || [])
      .find((candidate) => (groupsByPath.get(candidate.path)?.albumIds.size || 0) > 1);
    album.collectionName = selected?.name || '';
    album.collectionNames = parseCollectionNames(album.collectionName);
  }
}

function inferCollectionCandidateFromFolderPath(folderPath, albumTitle = '') {
  const segments = String(folderPath || '').split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const ancestorSegments = segments.slice(0, -1);
  for (let index = ancestorSegments.length - 1; index >= 0; index -= 1) {
    const segment = ancestorSegments[index];
    if (!/\bcollections?\b/iu.test(normalizeCollectionText(segment))) continue;
    return {
      name: humanizeName(segment),
      path: segments.slice(0, index + 1).join('/'),
    };
  }

  const normalizedAlbumTitle = normalizeCollectionText(albumTitle);
  for (let index = ancestorSegments.length - 1; index >= 0; index -= 1) {
    const segment = ancestorSegments[index];
    const normalizedSegment = normalizeCollectionText(segment);
    const hasCollectionWord = /\bcollections?\b/iu.test(normalizedSegment);
    const hasAlbumWord = /\balbums?\b/iu.test(normalizedSegment);
    const containsAlbumTitle = normalizedAlbumTitle
      && normalizedSegment.includes(normalizedAlbumTitle)
      && normalizedAlbumTitle.length >= 3;
    if (hasCollectionWord && (hasAlbumWord || containsAlbumTitle)) {
      return {
        name: humanizeName(segment),
        path: segments.slice(0, index + 1).join('/'),
      };
    }
  }

  const joinedPath = normalizeCollectionText(segments.join(' '));
  if (/\bcollections?\b/iu.test(joinedPath) && /\balbums?\b/iu.test(joinedPath)) {
    const index = ancestorSegments.findIndex((segment) => /\bcollections?\b/iu.test(normalizeCollectionText(segment)));
    if (index >= 0) {
      const segment = ancestorSegments[index];
      return {
        name: humanizeName(segment),
        path: segments.slice(0, index + 1).join('/'),
      };
    }
  }

  return null;
}

function normalizeCollectionText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[_()[\]{}.,-]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function getBestAudioQuality(qualities) {
  if (qualities.length === 0) return createAudioQuality({});

  return [...qualities].sort((left, right) => getAudioQualityRank(right) - getAudioQualityRank(left))[0];
}

function getAudioQualityRank(quality) {
  const bitDepth = quality?.bitDepth || 0;
  const sampleRate = quality?.sampleRate || 0;
  const bitrate = quality?.bitrate || 0;

  if (bitDepth >= 24 && sampleRate > 96000) return 5000 + sampleRate;
  if (bitDepth >= 24 && sampleRate > 44100) return 4000 + sampleRate;
  if (bitDepth === 16 && sampleRate === 44100) return 3000;
  if (bitrate >= 300000) return 2000 + bitrate;
  return bitDepth * 10 + sampleRate / 1000 + bitrate / 1000000;
}
