const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const SHORT_CACHE_CONTROL = 'public, max-age=300';
const NO_STORE_CACHE_CONTROL = 'no-store';

const VITE_HASHED_ASSET_PATH = /^\/react\/(?:assets|chunks)\/[^/]+-[A-Za-z0-9_-]{8,}\.[A-Za-z0-9]+$/u;

export function isImmutableViteAsset(requestPath) {
  return VITE_HASHED_ASSET_PATH.test(String(requestPath || '').replaceAll('\\', '/'));
}

export function getStaticAssetCacheControl(requestPath, extension = '') {
  if (isImmutableViteAsset(requestPath)) {
    return IMMUTABLE_CACHE_CONTROL;
  }

  const normalizedExtension = String(extension || '').toLowerCase();
  if (['.html', '.js', '.css'].includes(normalizedExtension)) {
    return NO_STORE_CACHE_CONTROL;
  }

  return SHORT_CACHE_CONTROL;
}
