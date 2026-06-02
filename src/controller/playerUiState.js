export function getPlaybackButtonState(paused) {
  return {
    iconName: paused ? 'play' : 'pause',
    label: paused ? 'Play' : 'Pause',
  };
}

export function getQueueStatusText({ hasTrack, currentIndex, queueLength }) {
  return hasTrack && currentIndex >= 0
    ? `${currentIndex + 1} of ${queueLength}`
    : `0 of ${queueLength}`;
}

export function normalizeAudioQualityForReact(quality, qualityIcons = {}) {
  if (!quality) return null;
  return {
    label: quality.label || 'Audio quality unknown',
    labelTop: quality.labelTop || quality.label || 'Audio quality unknown',
    labelBottom: quality.labelBottom || '',
    iconType: quality.iconType || '',
    iconUrl: quality.iconType ? qualityIcons[quality.iconType] : '',
    iconAlt: getAudioQualityIconAlt(quality.iconType),
  };
}

export function getAudioQualityIconAlt(iconType) {
  if (iconType === 'cd') return 'CD Audio';
  if (iconType === 'hires') return 'Hi-Res Audio';
  if (iconType === 'mp3') return 'MP3 Audio';
  return '';
}

export function getVolumeIconName(volume) {
  if (volume <= 0) return 'volumeMuted';
  if (volume < 0.34) return 'volumeLow';
  if (volume < 0.67) return 'volumeMedium';
  return 'volumeHigh';
}
