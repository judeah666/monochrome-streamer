export const BROWSE_VIEWS = new Set(['home', 'library', 'favorites', 'wishlist', 'settings']);

export function parseRouteFromHash(hashValue, {
  browseView = 'home',
  hasAlbum = () => false,
} = {}) {
  const hash = String(hashValue || '').replace(/^#/, '');
  const albumMatch = /^album\/(.+)$/u.exec(hash);
  const artistMatch = /^artist\/(.+)$/u.exec(hash);

  if (hash === 'fullscreen') {
    return {
      route: { view: 'fullscreen', albumId: null, artistName: null },
      artistNameToLoad: null,
    };
  }

  if (albumMatch) {
    const albumId = decodeURIComponent(albumMatch[1]);
    if (hasAlbum(albumId)) {
      return {
        route: { view: 'album', albumId, artistName: null },
        artistNameToLoad: null,
      };
    }
  }

  if (artistMatch) {
    const artistName = decodeURIComponent(artistMatch[1]);
    return {
      route: { view: 'artist', albumId: null, artistName },
      artistNameToLoad: artistName,
    };
  }

  return {
    route: { view: browseView, albumId: null, artistName: null },
    artistNameToLoad: null,
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

export function getFullscreenReturnHash(currentHash) {
  return currentHash && currentHash !== '#fullscreen' ? currentHash : '';
}

export function isValidBrowseView(view) {
  return BROWSE_VIEWS.has(view);
}
