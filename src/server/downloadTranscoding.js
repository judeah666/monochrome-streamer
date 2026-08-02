import {
  getDownloadMp3BitrateKbps,
  normalizeDownloadQuality,
  shouldConvertDownloadQuality,
} from '../shared/downloadQuality.js';

export function getDownloadTranscodeProfile(value) {
  const quality = normalizeDownloadQuality(value);
  if (quality === 'cd') {
    return {
      quality,
      extension: '.flac',
      contentType: 'audio/flac',
      ffmpegArgs: [
        '-codec:a',
        'flac',
        '-sample_fmt',
        's16',
        '-ar',
        '44100',
        '-f',
        'flac',
      ],
    };
  }

  const bitrateKbps = getDownloadMp3BitrateKbps(quality);
  if (bitrateKbps > 0) {
    return {
      quality,
      extension: '.mp3',
      contentType: 'audio/mpeg',
      ffmpegArgs: [
        '-codec:a',
        'libmp3lame',
        '-b:a',
        `${bitrateKbps}k`,
        '-f',
        'mp3',
      ],
    };
  }

  return null;
}

export function shouldUseDownloadTranscode(track, value) {
  return shouldConvertDownloadQuality(track?.audioQuality, value);
}
