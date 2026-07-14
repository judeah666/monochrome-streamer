export const BROWSE_VIEWS = new Set(['home', 'library', 'playlists', 'favorites', 'wishlist', 'settings', 'admin', 'login']);
const PLAYING_HASHES = new Set(['playing', 'fullscreen']);

export function parseRouteFromHash(hashValue, {
  browseView = 'home',
  hasAlbum = () => false,
} = {}) {
  const hash = String(hashValue || '').replace(/^#\/?/, '');
  const albumMatch = /^album\/(.+)$/u.exec(hash);
  const artistMatch = /^artist\/(.+)$/u.exec(hash);
  const collectionMatch = /^collection\/(.+)$/u.exec(hash);

  if (PLAYING_HASHES.has(hash)) {
    return {
      route: { view: 'fullscreen', albumId: null, artistName: null },
      artistNameToLoad: null,
      collectionNameToLoad: null,
    };
  }

  if (hash === 'login') {
    return {
      route: { view: 'login', albumId: null, artistName: null },
      artistNameToLoad: null,
      collectionNameToLoad: null,
    };
  }

  if (albumMatch) {
    const albumId = decodeURIComponent(albumMatch[1]);
    if (hasAlbum(albumId)) {
      return {
        route: { view: 'album', albumId, artistName: null },
        artistNameToLoad: null,
        collectionNameToLoad: null,
      };
    }
  }

  if (artistMatch) {
    const artistName = decodeURIComponent(artistMatch[1]);
    return {
      route: { view: 'artist', albumId: null, artistName },
      artistNameToLoad: artistName,
      collectionNameToLoad: null,
    };
  }

  if (collectionMatch) {
    const collectionName = decodeURIComponent(collectionMatch[1]);
    return {
      route: { view: 'collection', albumId: null, artistName: null, collectionName },
      artistNameToLoad: null,
      collectionNameToLoad: collectionName,
    };
  }

  if (BROWSE_VIEWS.has(hash)) {
    return {
      route: createBrowseRoute(hash),
      artistNameToLoad: null,
      collectionNameToLoad: null,
    };
  }

  return {
    route: { view: browseView, albumId: null, artistName: null },
    artistNameToLoad: null,
    collectionNameToLoad: null,
  };
}

export function createBrowseRoute(view) {
  return { view, albumId: null, artistName: null };
}

export function getAlbumHash(albumId) {
  return `album/${encodeURIComponent(albumId)}`;
}

export function getAlbumShareUrl(albumId, locationLike = globalThis.location) {
  const hash = `#${getAlbumHash(albumId)}`;
  try {
    const url = new URL(String(locationLike?.href || '/'));
    url.hash = hash;
    return url.toString();
  } catch {
    const origin = String(locationLike?.origin || '').replace(/\/$/u, '');
    const pathname = String(locationLike?.pathname || '/');
    const search = String(locationLike?.search || '');
    return `${origin}${pathname}${search}${hash}`;
  }
}

export function getArtistHash(artistName) {
  return `artist/${encodeURIComponent(artistName)}`;
}

export function getCollectionHash(collectionName) {
  return `collection/${encodeURIComponent(collectionName)}`;
}

export function getPlayingHash() {
  return 'playing';
}

export function getLoginHash() {
  return 'login';
}

export function getRouteHash(route = {}) {
  if (route.view === 'album' && route.albumId) return getAlbumHash(route.albumId);
  if (route.view === 'artist' && route.artistName) return getArtistHash(route.artistName);
  if (route.view === 'collection' && route.collectionName) return getCollectionHash(route.collectionName);
  if (route.view === 'fullscreen') return getPlayingHash();
  if (BROWSE_VIEWS.has(route.view) && route.view !== 'home') return route.view;
  return '';
}

export function getFullscreenReturnHash(currentHash) {
  const normalized = String(currentHash || '').replace(/^#\/?/u, '');
  return normalized && !PLAYING_HASHES.has(normalized) ? currentHash : '';
}

export function isValidBrowseView(view) {
  return BROWSE_VIEWS.has(view);
}
