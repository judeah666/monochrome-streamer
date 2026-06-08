export const BROWSE_VIEWS = new Set(['home', 'library', 'favorites', 'wishlist', 'settings', 'admin', 'login']);

export function parseRouteFromHash(hashValue, {
  browseView = 'home',
  hasAlbum = () => false,
} = {}) {
  const hash = String(hashValue || '').replace(/^#\/?/, '');
  const albumMatch = /^album\/(.+)$/u.exec(hash);
  const artistMatch = /^artist\/(.+)$/u.exec(hash);
  const collectionMatch = /^collection\/(.+)$/u.exec(hash);

  if (hash === 'fullscreen') {
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

export function getArtistHash(artistName) {
  return `artist/${encodeURIComponent(artistName)}`;
}

export function getCollectionHash(collectionName) {
  return `collection/${encodeURIComponent(collectionName)}`;
}

export function getFullscreenReturnHash(currentHash) {
  return currentHash && currentHash !== '#fullscreen' && currentHash !== '#/fullscreen' ? currentHash : '';
}

export function isValidBrowseView(view) {
  return BROWSE_VIEWS.has(view);
}
