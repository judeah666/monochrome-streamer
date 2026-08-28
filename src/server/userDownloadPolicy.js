import {
  DOWNLOAD_QUALITY_VALUES,
  normalizeDownloadQuality,
} from '../shared/downloadQuality.js';

export function getManagedUserDownloadQualityOverride(user) {
  const value = String(user?.downloadQuality || '').trim().toLowerCase();
  return DOWNLOAD_QUALITY_VALUES.includes(value) ? value : null;
}

export function parseManagedUserDownloadQuality(value) {
  if (value == null || String(value).trim() === '' || String(value).trim().toLowerCase() === 'inherit') {
    return null;
  }
  const normalized = String(value).trim().toLowerCase();
  if (!DOWNLOAD_QUALITY_VALUES.includes(normalized)) {
    throw new RangeError('Invalid download quality.');
  }
  return normalized;
}

export function getEffectiveManagedUserDownloadQuality(user, globalDownloadQuality) {
  return getManagedUserDownloadQualityOverride(user)
    || normalizeDownloadQuality(globalDownloadQuality);
}

export function resolveRequestedDownloadQuality(user, requestedQuality) {
  if (user?.role === 'user') return normalizeDownloadQuality(user.downloadQuality);
  return normalizeDownloadQuality(requestedQuality);
}
