import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DOWNLOAD_QUALITY_OPTIONS,
  getDownloadFileExtension,
  getDownloadMp3BitrateKbps,
  getDownloadQualityLabel,
  normalizeDownloadQuality,
  shouldConvertDownloadQuality,
} from '../src/shared/downloadQuality.js';
import {
  getDownloadTranscodeProfile,
  shouldUseDownloadTranscode,
} from '../src/server/downloadTranscoding.js';

test('download quality options include original, CD, and all MP3 bitrates', () => {
  assert.deepEqual(DOWNLOAD_QUALITY_OPTIONS.map(([value]) => value), [
    'original',
    'cd',
    'mp3',
    'mp3-256',
    'mp3-128',
  ]);
  assert.equal(normalizeDownloadQuality('MP3-256'), 'mp3-256');
  assert.equal(normalizeDownloadQuality('invalid'), 'original');
});

test('CD download conversion applies only above 16-bit and preserves other sources', () => {
  assert.equal(shouldConvertDownloadQuality({ bitDepth: 24, sampleRate: 96000 }, 'cd'), true);
  assert.equal(shouldConvertDownloadQuality({ bitDepth: 24, sampleRate: 44100 }, 'cd'), true);
  assert.equal(shouldConvertDownloadQuality({ bitDepth: 16, sampleRate: 96000 }, 'cd'), false);
  assert.equal(shouldConvertDownloadQuality({ bitDepth: 16, sampleRate: 44100 }, 'cd'), false);
  assert.equal(shouldConvertDownloadQuality({ bitrate: 320000 }, 'cd'), false);
  assert.equal(shouldUseDownloadTranscode({ audioQuality: { bitDepth: 24 } }, 'cd'), true);
  assert.equal(shouldUseDownloadTranscode({ audioQuality: { bitDepth: 16 } }, 'cd'), false);
});

test('download profiles use exact CD and MP3 ffmpeg output settings', () => {
  const cd = getDownloadTranscodeProfile('cd');
  assert.equal(cd.extension, '.flac');
  assert.deepEqual(cd.ffmpegArgs.slice(-6), ['-sample_fmt', 's16', '-ar', '44100', '-f', 'flac']);

  assert.equal(getDownloadMp3BitrateKbps('mp3'), 320);
  assert.equal(getDownloadMp3BitrateKbps('mp3-256'), 256);
  assert.equal(getDownloadMp3BitrateKbps('mp3-128'), 128);
  assert.ok(getDownloadTranscodeProfile('mp3').ffmpegArgs.includes('320k'));
  assert.ok(getDownloadTranscodeProfile('mp3-256').ffmpegArgs.includes('256k'));
  assert.ok(getDownloadTranscodeProfile('mp3-128').ffmpegArgs.includes('128k'));
});

test('download filenames follow the effective output instead of only the selected mode', () => {
  assert.equal(getDownloadFileExtension({ bitDepth: 24 }, 'cd', '.wav'), '.flac');
  assert.equal(getDownloadFileExtension({ bitDepth: 16 }, 'cd', '.flac'), '.flac');
  assert.equal(getDownloadFileExtension({ bitrate: 256000 }, 'cd', '.mp3'), '.mp3');
  assert.equal(getDownloadFileExtension({}, 'mp3-128', '.flac'), '.mp3');
  assert.equal(getDownloadQualityLabel('mp3-256'), 'MP3 256');
});
