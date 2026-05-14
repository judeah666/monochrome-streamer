import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

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

export async function scanMusicLibrary(libraryPath) {
  const normalizedRoot = path.resolve(libraryPath);
  const tracks = [];
  const coverCache = new Map();
  const metadataParser = await loadMetadataParser();

  await walkDirectory(normalizedRoot, async (filePath) => {
    if (!isAudioFile(filePath)) {
      return;
    }

    const relativePath = path.relative(normalizedRoot, filePath);
    const directoryPath = path.dirname(filePath);
    const coverArtPath = await findCoverArt(directoryPath, coverCache);
    const fallbackMetadata = inferTrackMetadata(relativePath);
    const tagMetadata = await readTaggedMetadata(filePath, metadataParser);
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
      coverArtPath,
      embeddedCover: tagMetadata.embeddedCover,
      duration: tagMetadata.duration,
      audioQuality: tagMetadata.audioQuality,
    });
  });

  tracks.sort(compareTracks);
  const albums = buildAlbums(tracks);

  return {
    generatedAt: new Date().toISOString(),
    trackCount: tracks.length,
    albumCount: albums.length,
    tracks,
    albums,
  };
}

async function loadMetadataParser() {
  try {
    return await import('music-metadata');
  } catch {
    return null;
  }
}

async function readTaggedMetadata(filePath, metadataParser) {
  if (!metadataParser?.parseFile) {
    return {
      title: '',
      artist: '',
      album: '',
      albumArtist: '',
      trackNumber: null,
      discNumber: null,
      date: '',
      year: null,
      duration: null,
      audioQuality: createAudioQuality({}, filePath),
      embeddedCover: null,
    };
  }

  try {
    const parsed = await metadataParser.parseFile(filePath, {
      duration: true,
      skipCovers: false,
    });
    const picture = parsed.common.picture?.[0] || null;
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
      trackNumber: parsed.common.track?.no || null,
      discNumber: parsed.common.disk?.no || null,
      date,
      year: normalizeTagYear(parsed.common.year || date),
      duration: Number.isFinite(parsed.format.duration) ? parsed.format.duration : null,
      audioQuality: createAudioQuality(parsed.format, filePath),
      embeddedCover: picture
        ? {
            data: Buffer.from(picture.data),
            format: picture.format || 'image/jpeg',
          }
        : null,
    };
  } catch {
    return {
      title: '',
      artist: '',
      album: '',
      albumArtist: '',
      trackNumber: null,
      discNumber: null,
      date: '',
      year: null,
      duration: null,
      audioQuality: createAudioQuality({}, filePath),
      embeddedCover: null,
    };
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
    trackNumber: tagMetadata.trackNumber ?? fallbackMetadata.trackNumber,
    discNumber: tagMetadata.discNumber ?? fallbackMetadata.discNumber,
  };
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

function buildAlbums(tracks) {
  const albumMap = new Map();

  for (const track of tracks) {
    const albumArtist = track.albumArtist || track.artist;
    const albumKey = `${albumArtist}::${track.album}`;
    if (!albumMap.has(albumKey)) {
      albumMap.set(albumKey, {
        id: createTrackId(albumKey),
        title: track.album,
        artist: albumArtist,
        albumArtist,
        date: track.date || '',
        year: track.year || null,
        coverTrackId: track.coverArtPath || track.embeddedCover ? track.id : null,
        trackIds: [],
      });
    }

    const album = albumMap.get(albumKey);
    album.trackIds.push(track.id);
    if (!album.date && track.date) {
      album.date = track.date;
    }
    if (!album.year && track.year) {
      album.year = track.year;
    }
    if (!album.coverTrackId && (track.coverArtPath || track.embeddedCover)) {
      album.coverTrackId = track.id;
    }
  }

  for (const album of albumMap.values()) {
    const albumTracks = album.trackIds.map((trackId) => tracks.find((track) => track.id === trackId)).filter(Boolean);
    album.audioQuality = getBestAudioQuality(albumTracks.map((track) => track.audioQuality).filter(Boolean));
  }

  return [...albumMap.values()].sort((left, right) => {
    return left.artist.localeCompare(right.artist) || left.title.localeCompare(right.title);
  });
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
