import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPlaybackButtonState,
  getQueueStatusText,
  getVolumeIconName,
  normalizeAudioQualityForReact,
} from '../src/controller/playerUiState.js';

test('getPlaybackButtonState returns the matching icon and label', () => {
  assert.deepEqual(getPlaybackButtonState(true), { iconName: 'play', label: 'Play' });
  assert.deepEqual(getPlaybackButtonState(false), { iconName: 'pause', label: 'Pause' });
});

test('getQueueStatusText reports active queue position or empty state', () => {
  assert.equal(getQueueStatusText({ hasTrack: true, currentIndex: 2, queueLength: 5 }), '3 of 5');
  assert.equal(getQueueStatusText({ hasTrack: false, currentIndex: -1, queueLength: 5 }), '0 of 5');
});

test('normalizeAudioQualityForReact maps quality labels and icons', () => {
  const quality = normalizeAudioQualityForReact({
    label: 'Hi-Res 24-Bit / up to 96 KHz',
    labelTop: 'Hi-Res 24-Bit',
    labelBottom: '96 KHz',
    iconType: 'hires',
  }, {
    hires: '/hires.png',
  });

  assert.deepEqual(quality, {
    label: 'Hi-Res 24-Bit / up to 96 KHz',
    labelTop: 'Hi-Res 24-Bit',
    labelBottom: '96 KHz',
    iconType: 'hires',
    iconUrl: '/hires.png',
    iconAlt: 'Hi-Res Audio',
  });
});

test('getVolumeIconName follows player volume thresholds', () => {
  assert.equal(getVolumeIconName(0), 'volumeMuted');
  assert.equal(getVolumeIconName(0.2), 'volumeLow');
  assert.equal(getVolumeIconName(0.5), 'volumeMedium');
  assert.equal(getVolumeIconName(0.9), 'volumeHigh');
});
