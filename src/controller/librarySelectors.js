export function compareTrackOrder(left, right) {
  return (
    compareNullableTrackNumber(left.discNumber, right.discNumber)
    || compareNullableTrackNumber(left.trackNumber, right.trackNumber)
    || left.title.localeCompare(right.title)
  );
}

export function compareNullableTrackNumber(left, right) {
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  const leftValid = Number.isFinite(leftNumber);
  const rightValid = Number.isFinite(rightNumber);
  if (!leftValid && !rightValid) return 0;
  if (!leftValid) return 1;
  if (!rightValid) return -1;
  return leftNumber - rightNumber;
}

export function getRandomAlbumIds(albums, limit, random = Math.random) {
  const shuffled = [...albums];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, limit).map((album) => album.id);
}

export function getFilteredTracks(tracks, searchTerm) {
  if (!searchTerm) return tracks;
  return tracks.filter((track) => trackMatchesSearch(track, searchTerm));
}

export function getFilteredAlbums(albums, filteredTracks, searchTerm) {
  if (!searchTerm) return albums;
  const filteredAlbumIds = new Set(filteredTracks.map((track) => track.albumId).filter(Boolean));
  const filteredAlbumKeys = new Set(filteredTracks.map((track) => `${track.albumArtist || track.artist}::${track.album}`));
  return albums.filter((album) => (
    albumMatchesSearch(album, searchTerm)
    || filteredAlbumIds.has(album.id)
    || filteredAlbumKeys.has(`${album.albumArtist || album.artist}::${album.title}`)
  ));
}

export function getHomeAlbums({
  searchTerm,
  homeAlbumIds,
  albumMap,
  filteredAlbums,
  limit = 50,
}) {
  if (!searchTerm && homeAlbumIds.length > 0) {
    const randomized = homeAlbumIds
      .map((id) => albumMap.get(id))
      .filter(Boolean);
    if (randomized.length > 0) {
      return randomized.slice(0, limit);
    }
  }

  const filteredById = new Map(filteredAlbums.map((album) => [album.id, album]));
  const randomized = homeAlbumIds
    .map((id) => filteredById.get(id))
    .filter(Boolean);

  if (randomized.length >= Math.min(limit, filteredAlbums.length)) {
    return randomized.slice(0, limit);
  }

  const seenIds = new Set(randomized.map((album) => album.id));
  const remaining = filteredAlbums.filter((album) => !seenIds.has(album.id));
  return [...randomized, ...remaining].slice(0, limit);
}

export function trackMatchesSearch(track, searchTerm) {
  if (!searchTerm) return true;
  return fieldsMatchSearch([track.title], searchTerm);
}

export function albumMatchesSearch(album, searchTerm) {
  if (!searchTerm) return true;
  return fieldsMatchSearch([
    album.title,
    album.artist,
    album.albumArtist,
    album.collectionName,
    album.year,
  ], searchTerm);
}

export function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replace(/['’`]/gu, '')
    .replace(/&/gu, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}

function fieldsMatchSearch(fields, searchTerm) {
  const needle = normalizeSearchText(searchTerm);
  if (!needle) return true;

  const haystack = normalizeSearchText(fields.filter(Boolean).join(' '));
  if (!haystack) return false;
  if (haystack.includes(needle)) return true;

  const tokens = needle.split(' ').filter(Boolean);
  return tokens.length > 0 && tokens.every((token) => haystack.includes(token));
}

export function findAlbumByTrack(track, { albumMap, albums }) {
  if (track.albumId) {
    return albumMap.get(track.albumId) ?? null;
  }
  return albums.find((album) => (
    (album.albumArtist || album.artist) === (track.albumArtist || track.artist)
    && album.title === track.album
  )) ?? null;
}

export function buildArtistGroups(tracks, { findAlbum, albumMap }) {
  const groups = new Map();

  for (const track of tracks) {
    if (!groups.has(track.artist)) {
      groups.set(track.artist, {
        name: track.artist,
        tracks: [],
        albumIds: new Set(),
      });
    }

    const group = groups.get(track.artist);
    group.tracks.push(track);
    const album = findAlbum(track);
    if (album) {
      group.albumIds.add(album.id);
    }
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      albums: [...group.albumIds].map((albumId) => albumMap.get(albumId)).filter(Boolean),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function sortArtistAlbumsByYear(albums = []) {
  return [...albums].sort((left, right) => {
    const leftYear = getSortableAlbumYear(left);
    const rightYear = getSortableAlbumYear(right);
    if (leftYear === null && rightYear !== null) return 1;
    if (leftYear !== null && rightYear === null) return -1;
    if (leftYear !== rightYear) return leftYear - rightYear;
    return String(left?.title || '').localeCompare(String(right?.title || ''), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });
}

function getSortableAlbumYear(album) {
  const match = String(album?.year || '').match(/\b(\d{4})\b/u);
  if (!match) return null;
  const year = Number(match[1]);
  return year > 0 ? year : null;
}

export function partitionAlbums(albums, getAlbumTracks) {
  const eps = [];
  const full = [];

  for (const album of albums) {
    const tracks = getAlbumTracks(album.id);
    const isEp = tracks.length <= 5 || /ep|single/iu.test(album.title);
    if (isEp) {
      eps.push(album);
    } else {
      full.push(album);
    }
  }

  return [eps, full];
}

export function getAlbumFolderPath(tracks) {
  const folderPaths = (tracks || [])
    .map((track) => getTrackFolderPath(track?.relativePath || ''))
    .filter(Boolean);
  if (folderPaths.length === 0) return '';

  const commonParts = folderPaths[0].split('/');
  for (const folderPath of folderPaths.slice(1)) {
    const parts = folderPath.split('/');
    let index = 0;
    while (index < commonParts.length && commonParts[index] === parts[index]) {
      index += 1;
    }
    commonParts.length = index;
    if (commonParts.length === 0) break;
  }
  return commonParts.join('/');
}

export function getTrackFolderPath(relativePath) {
  const normalizedPath = String(relativePath || '').replaceAll('\\', '/');
  const lastSlash = normalizedPath.lastIndexOf('/');
  return lastSlash > 0 ? normalizedPath.slice(0, lastSlash) : '';
}

export function isWishlistAlbum(album) {
  const status = String(album?.status || '').trim().toLowerCase();
  return status === 'wishlist' || status === 'wanted';
}

export function filterAlbumsByMediaType(albums, mediaTypeFilters) {
  if (!mediaTypeFilters || mediaTypeFilters.size === 0) return albums;
  return albums.filter((album) => {
    const mediaTypes = Array.isArray(album.mediaTypes) ? album.mediaTypes : [album.mediaType];
    for (const mediaType of mediaTypes) {
      if (mediaTypeFilters.has(normalizeMediaTypeName(mediaType))) return true;
    }
    return false;
  });
}

export function getAlbumMediaTypes(album) {
  const mediaTypes = Array.isArray(album.mediaTypes) ? album.mediaTypes : [album.mediaType];
  const normalized = mediaTypes.map(normalizeMediaTypeName).filter(Boolean);
  if (normalized.length > 0) return normalized;
  return album?.manual ? [] : ['Digital Media'];
}

export function normalizeMediaTypeName(mediaType) {
  const normalized = String(mediaType || '').trim();
  if (!normalized) return '';
  if (/^cassette[-\s]?tape$/iu.test(normalized)) return 'Cassette Tape';
  return normalized;
}
