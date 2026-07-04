export const PLAYBACK_QUALITY_VALUES = ['original', 'cd', 'mp3'];

export const PLAYBACK_QUALITY_LABELS = {
  original: 'Original',
  cd: 'CD FLAC (16-Bit / 44.1 KHz)',
  mp3: 'MP3 320 kbps',
};

export function normalizePlaybackQuality(value) {
  const normalized = String(value || '').toLowerCase();
  return PLAYBACK_QUALITY_VALUES.includes(normalized) ? normalized : 'original';
}

export function isHiResAudioQuality(quality) {
  const bitDepth = Number(quality?.bitDepth) || 0;
  const sampleRate = Number(quality?.sampleRate) || 0;
  return bitDepth > 16 || sampleRate > 44100;
}

export function shouldTranscodePlaybackQuality(quality, playbackQuality) {
  const normalized = normalizePlaybackQuality(playbackQuality);
  if (normalized === 'mp3') return true;
  if (normalized === 'cd') return isHiResAudioQuality(quality);
  return false;
}

export function createEffectivePlaybackAudioQuality(sourceQuality, playbackQuality) {
  const normalized = normalizePlaybackQuality(playbackQuality);
  if (normalized === 'mp3') {
    return {
      label: 'MP3 320 kbps',
      labelTop: 'MP3',
      labelBottom: '320 kbps',
      iconType: 'mp3',
      bitrate: 320000,
    };
  }
  if (normalized === 'cd' && isHiResAudioQuality(sourceQuality)) {
    return {
      label: 'CD FLAC 16-Bit / 44.1 KHz',
      labelTop: 'CD FLAC',
      labelBottom: '16-Bit / 44.1 KHz',
      iconType: 'cd',
      bitDepth: 16,
      sampleRate: 44100,
    };
  }
  return sourceQuality || null;
}

export function getPlaybackTranscodingCapability(ffmpegAvailable) {
  return {
    ffmpegAvailable: Boolean(ffmpegAvailable),
    formats: ffmpegAvailable ? ['original', 'cd', 'mp3'] : ['original'],
  };
}

export function createPlaybackQualityOptions(playbackTranscoding = {}) {
  const normalizedPlaybackTranscoding = playbackTranscoding || {};
  const capability = getPlaybackTranscodingCapability(normalizedPlaybackTranscoding.ffmpegAvailable);
  const availableFormats = new Set(
    Array.isArray(normalizedPlaybackTranscoding.formats) && normalizedPlaybackTranscoding.formats.length
      ? normalizedPlaybackTranscoding.formats
      : capability.formats,
  );
  return PLAYBACK_QUALITY_VALUES.map((value) => ({
    value,
    label: PLAYBACK_QUALITY_LABELS[value],
    disabled: value !== 'original' && !availableFormats.has(value),
  }));
}
