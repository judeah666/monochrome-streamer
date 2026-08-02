export const DOWNLOAD_QUALITY_VALUES = ['original', 'cd', 'mp3', 'mp3-256', 'mp3-128'];

export const DOWNLOAD_QUALITY_OPTIONS = [
  ['original', 'Original Local File'],
  ['cd', 'CD Quality FLAC 16-bit / 44.1 KHz (convert hi-res only)'],
  ['mp3', 'MP3 320 kbps (convert on download)'],
  ['mp3-256', 'MP3 256 kbps (convert on download)'],
  ['mp3-128', 'MP3 128 kbps (convert on download)'],
];

export const DOWNLOAD_QUALITY_SHORT_LABELS = {
  original: 'Original',
  cd: 'CD FLAC 16-bit',
  mp3: 'MP3 320',
  'mp3-256': 'MP3 256',
  'mp3-128': 'MP3 128',
};

export function normalizeDownloadQuality(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return DOWNLOAD_QUALITY_VALUES.includes(normalized) ? normalized : 'original';
}

export function isMp3DownloadQuality(value) {
  return normalizeDownloadQuality(value).startsWith('mp3');
}

export function getDownloadMp3BitrateKbps(value) {
  const normalized = normalizeDownloadQuality(value);
  if (normalized === 'mp3-256') return 256;
  if (normalized === 'mp3-128') return 128;
  return normalized === 'mp3' ? 320 : 0;
}

export function shouldConvertDownloadQuality(audioQuality, value) {
  const normalized = normalizeDownloadQuality(value);
  if (isMp3DownloadQuality(normalized)) return true;
  if (normalized !== 'cd') return false;
  return (Number(audioQuality?.bitDepth) || 0) > 16;
}

export function getDownloadFileExtension(audioQuality, value, sourceExtension = '') {
  const normalized = normalizeDownloadQuality(value);
  if (isMp3DownloadQuality(normalized)) return '.mp3';
  if (normalized === 'cd' && shouldConvertDownloadQuality(audioQuality, normalized)) return '.flac';
  return sourceExtension;
}

export function getDownloadQualityLabel(value) {
  return DOWNLOAD_QUALITY_SHORT_LABELS[normalizeDownloadQuality(value)];
}
