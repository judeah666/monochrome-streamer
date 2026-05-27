import test from 'node:test';
import assert from 'node:assert/strict';
import { seekAudioBy, setAudioCurrentTime } from '../src/controller/mediaSession.js';

function createAudio(overrides = {}) {
  return {
    currentTime: 0,
    duration: 120,
    playbackRate: 1,
    fastSeekTime: null,
    fastSeek(time) {
      this.fastSeekTime = time;
      this.currentTime = time;
    },
    ...overrides,
  };
}

test('setAudioCurrentTime clamps seek time to the track duration', () => {
  const audio = createAudio({ currentTime: 20, duration: 60 });
  let progressUpdates = 0;
  let persisted = 0;

  setAudioCurrentTime(audio, 90, {
    onProgress: () => progressUpdates += 1,
    onPersist: () => persisted += 1,
  });

  assert.equal(audio.currentTime, 60);
  assert.equal(progressUpdates, 1);
  assert.equal(persisted, 1);
});

test('seekAudioBy moves relative to the current audio time', () => {
  const audio = createAudio({ currentTime: 45, duration: 100 });

  seekAudioBy(audio, -10);

  assert.equal(audio.currentTime, 35);
});

test('setAudioCurrentTime uses fastSeek when requested and available', () => {
  const audio = createAudio({ currentTime: 0, duration: 100 });

  setAudioCurrentTime(audio, 25, { fastSeek: true });

  assert.equal(audio.fastSeekTime, 25);
  assert.equal(audio.currentTime, 25);
});
