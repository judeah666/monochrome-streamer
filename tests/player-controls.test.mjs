import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bindSeekControl,
  getMutedVolumeState,
  getNextVolumeState,
  getProgressState,
  seekFromProgressBar,
  updateProgressElements,
  updateVolumeElements,
} from '../src/controller/playerControls.js';

function createStyleTarget() {
  return {
    style: { width: '' },
    textContent: '',
  };
}

test('getProgressState normalizes invalid audio duration', () => {
  assert.deepEqual(getProgressState({ currentTime: 10, duration: Number.NaN }), {
    currentTime: 10,
    duration: 0,
    ratio: 0,
  });
});

test('updateProgressElements writes both player progress displays', () => {
  const refs = {
    progressFill: createStyleTarget(),
    fullscreenProgressFill: createStyleTarget(),
    currentTimeElement: createStyleTarget(),
    totalDurationElement: createStyleTarget(),
    fullscreenCurrentTimeElement: createStyleTarget(),
    fullscreenTotalDurationElement: createStyleTarget(),
  };

  updateProgressElements({
    ...refs,
    progress: { currentTime: 30, duration: 120, ratio: 0.25 },
    formatTime: (seconds) => `${seconds}s`,
  });

  assert.equal(refs.progressFill.style.width, '25%');
  assert.equal(refs.fullscreenProgressFill.style.width, '25%');
  assert.equal(refs.currentTimeElement.textContent, '30s');
  assert.equal(refs.totalDurationElement.textContent, '120s');
});

test('seekFromProgressBar seeks using the clicked ratio', () => {
  const audioPlayer = { currentTime: 0, duration: 100 };
  const bar = {
    getBoundingClientRect: () => ({ left: 0, width: 200 }),
  };
  let progressed = 0;
  let persisted = 0;

  seekFromProgressBar({
    audioPlayer,
    bar,
    event: { clientX: 50 },
    onProgress: () => progressed += 1,
    onPersist: () => persisted += 1,
  });

  assert.equal(audioPlayer.currentTime, 25);
  assert.equal(progressed, 1);
  assert.equal(persisted, 1);
});

test('bindSeekControl updates while dragging and persists once on release', () => {
  const listeners = new Map();
  const audioPlayer = { currentTime: 0, duration: 100 };
  const bar = {
    getBoundingClientRect: () => ({ left: 0, width: 200 }),
    setPointerCapture: () => {},
    addEventListener: (eventName, handler) => {
      listeners.set(eventName, handler);
    },
    removeEventListener: (eventName) => {
      listeners.delete(eventName);
    },
  };
  let progressed = 0;
  let persisted = 0;

  bindSeekControl(bar, {
    audioPlayer,
    onProgress: () => progressed += 1,
    onPersist: () => persisted += 1,
  });

  listeners.get('pointerdown')({ clientX: 40, pointerId: 1, preventDefault: () => {} });
  listeners.get('pointermove')({ clientX: 100, preventDefault: () => {} });
  listeners.get('pointerup')();

  assert.equal(audioPlayer.currentTime, 50);
  assert.equal(progressed, 2);
  assert.equal(persisted, 1);
});

test('volume state clamps values and preserves last non-zero volume', () => {
  assert.deepEqual(getNextVolumeState({ volume: 0.5, lastVolume: 0.5 }, 1.5), {
    volume: 1,
    lastVolume: 1,
  });
  assert.deepEqual(getNextVolumeState({ volume: 0.5, lastVolume: 0.5 }, 0), {
    volume: 0,
    lastVolume: 0.5,
  });
  assert.deepEqual(getMutedVolumeState({ volume: 0.6, lastVolume: 0.4 }), {
    volume: 0,
    lastVolume: 0.6,
  });
  assert.deepEqual(getMutedVolumeState({ volume: 0, lastVolume: 0.4 }), {
    volume: 0.4,
    lastVolume: 0.4,
  });
});

test('updateVolumeElements writes both volume bars', () => {
  const volumeFill = createStyleTarget();
  const fullscreenVolumeFill = createStyleTarget();

  updateVolumeElements({ volumeFill, fullscreenVolumeFill, volume: 0.42 });

  assert.equal(volumeFill.style.width, '42%');
  assert.equal(fullscreenVolumeFill.style.width, '42%');
});
