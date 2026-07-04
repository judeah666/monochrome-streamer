import { statSync } from 'node:fs';

export function getFileFreshness(filePath, statFile = statSync) {
  const cleanPath = String(filePath || '').trim();
  if (!cleanPath) return '';
  try {
    const stats = statFile(cleanPath);
    if (!stats) return '';
    const size = Number(stats.size);
    const mtimeMs = Number(stats.mtimeMs);
    if (!Number.isFinite(size) || !Number.isFinite(mtimeMs)) return '';
    return `${Math.max(0, size).toString(36)}-${Math.max(0, Math.floor(mtimeMs)).toString(36)}`;
  } catch {
    return '';
  }
}

export function getEmbeddedCoverFreshness(track = {}) {
  if (!track?.hasEmbeddedCover) return '';
  const fileSize = Number(track.fileSize);
  const mtimeMs = Number(track.mtimeMs);
  if (!Number.isFinite(fileSize) && !Number.isFinite(mtimeMs)) return '';
  return [
    Number.isFinite(fileSize) ? Math.max(0, fileSize).toString(36) : 'unknown',
    Number.isFinite(mtimeMs) ? Math.max(0, Math.floor(mtimeMs)).toString(36) : 'unknown',
  ].join('-');
}

export function getCoverVersion(track = {}, { cachedCover = null, statFile = statSync } = {}) {
  const externalFreshness = getFileFreshness(track?.coverArtPath, statFile);
  if (externalFreshness) return `file-${externalFreshness}`;

  const embeddedFreshness = getEmbeddedCoverFreshness(track);
  if (embeddedFreshness) return `embedded-${embeddedFreshness}`;

  const cachedFreshness = getFileFreshness(cachedCover?.path || track?.cachedCoverPath, statFile);
  return cachedFreshness ? `cache-${cachedFreshness}` : '';
}

export function getCoverOptimizationFailureKey(kind, sourceId, freshness) {
  const cleanKind = String(kind || '').trim();
  const cleanSourceId = String(sourceId || '').trim();
  const cleanFreshness = String(freshness || '').trim();
  if (!cleanKind || !cleanSourceId || !cleanFreshness) return '';
  return `${cleanKind}:${cleanSourceId}:${cleanFreshness}`;
}
