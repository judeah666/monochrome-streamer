import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEffectivePlaybackAudioQuality,
  createPlaybackQualityOptions,
  isHiResAudioQuality,
  normalizePlaybackQuality,
  shouldTranscodePlaybackQuality,
} from '../src/shared/playbackQuality.js';
import {
  createPlaybackTranscodeCacheKey,
  getPlaybackTranscodeProfile,
  shouldUsePlaybackTranscode,
} from '../src/server/playbackTranscoding.js';

test('playback quality normalization falls back to original', () => {
  assert.equal(normalizePlaybackQuality('mp3'), 'mp3');
  assert.equal(normalizePlaybackQuality('CD'), 'cd');
  assert.equal(normalizePlaybackQuality('weird'), 'original');
});

test('hi-res detection and playback transcode decisions match the selected format', () => {
  const hiRes = { bitDepth: 24, sampleRate: 96000 };
  const cd = { bitDepth: 16, sampleRate: 44100 };
  const lossy = { bitrate: 320000, iconType: 'mp3' };

  assert.equal(isHiResAudioQuality(hiRes), true);
  assert.equal(isHiResAudioQuality(cd), false);
  assert.equal(shouldTranscodePlaybackQuality(hiRes, 'cd'), true);
  assert.equal(shouldTranscodePlaybackQuality(cd, 'cd'), false);
  assert.equal(shouldTranscodePlaybackQuality(lossy, 'cd'), false);
  assert.equal(shouldTranscodePlaybackQuality(cd, 'mp3'), true);
});

test('effective playback quality reflects transcoded output only when needed', () => {
  const hiRes = { label: 'Hi-Res 24-Bit / up to 96 KHz', labelTop: 'Hi-Res 24-Bit', labelBottom: 'up to 96 KHz', iconType: 'hires', bitDepth: 24, sampleRate: 96000 };
  const cd = { label: 'CD 16-Bit / 44.1 KHz', labelTop: 'CD 16-Bit', labelBottom: '44.1 KHz', iconType: 'cd', bitDepth: 16, sampleRate: 44100 };

  assert.equal(createEffectivePlaybackAudioQuality(hiRes, 'cd').label, 'CD FLAC 16-Bit / 44.1 KHz');
  assert.equal(createEffectivePlaybackAudioQuality(cd, 'cd').label, cd.label);
  assert.equal(createEffectivePlaybackAudioQuality(hiRes, 'mp3').label, 'MP3 320 kbps');
});

test('playback quality options disable transcodes when ffmpeg is unavailable', () => {
  const unavailable = createPlaybackQualityOptions({ ffmpegAvailable: false, formats: ['original'] });
  assert.equal(unavailable.find((option) => option.value === 'cd').disabled, true);
  assert.equal(unavailable.find((option) => option.value === 'mp3').disabled, true);

  const available = createPlaybackQualityOptions({ ffmpegAvailable: true, formats: ['original', 'cd', 'mp3'] });
  assert.equal(available.find((option) => option.value === 'cd').disabled, false);
  assert.equal(available.find((option) => option.value === 'mp3').disabled, false);
});

test('server playback transcode helpers build stable profiles and cache keys', () => {
  const track = {
    relativePath: 'Albums/Artist/Track.flac',
    path: 'D:/Music/Albums/Artist/Track.flac',
    fileSize: 12345,
    mtimeMs: 67890,
    audioQuality: { bitDepth: 24, sampleRate: 96000 },
  };

  assert.equal(getPlaybackTranscodeProfile('cd').extension, '.flac');
  assert.equal(getPlaybackTranscodeProfile('mp3').extension, '.mp3');
  assert.equal(shouldUsePlaybackTranscode(track, 'cd'), true);
  assert.equal(shouldUsePlaybackTranscode({ ...track, audioQuality: { bitDepth: 16, sampleRate: 44100 } }, 'cd'), false);
  assert.equal(createPlaybackTranscodeCacheKey(track, 'cd'), createPlaybackTranscodeCacheKey(track, 'cd'));
  assert.notEqual(createPlaybackTranscodeCacheKey(track, 'cd'), createPlaybackTranscodeCacheKey(track, 'mp3'));
});
