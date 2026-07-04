import { createHash } from 'node:crypto';
import {
  getPlaybackTranscodingCapability,
  normalizePlaybackQuality,
  shouldTranscodePlaybackQuality,
} from '../shared/playbackQuality.js';

export const PLAYBACK_TRANSCODE_PROFILE_VERSION = '1';

export function getPlaybackTranscodeProfile(format) {
  const normalized = normalizePlaybackQuality(format);
  if (normalized === 'cd') {
    return {
      format: 'cd',
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
  if (normalized === 'mp3') {
    return {
      format: 'mp3',
      extension: '.mp3',
      contentType: 'audio/mpeg',
      ffmpegArgs: [
        '-codec:a',
        'libmp3lame',
        '-b:a',
        '320k',
        '-f',
        'mp3',
      ],
    };
  }
  return null;
}

export function shouldUsePlaybackTranscode(track, format) {
  const normalized = normalizePlaybackQuality(format);
  if (normalized === 'original') return false;
  return shouldTranscodePlaybackQuality(track?.audioQuality, normalized);
}

export function createPlaybackTranscodeCacheKey(track, format) {
  const normalized = normalizePlaybackQuality(format);
  const payload = [
    PLAYBACK_TRANSCODE_PROFILE_VERSION,
    normalized,
    String(track?.relativePath || ''),
    String(track?.path || ''),
    String(track?.fileSize || ''),
    String(track?.mtimeMs || ''),
  ].join('|');
  return createHash('sha256').update(payload).digest('hex');
}

export function getPlaybackTranscodeContentType(format) {
  const profile = getPlaybackTranscodeProfile(format);
  return profile?.contentType || '';
}

export function getPlaybackTranscodeExtension(format) {
  const profile = getPlaybackTranscodeProfile(format);
  return profile?.extension || '';
}

export { getPlaybackTranscodingCapability };
