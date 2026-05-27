import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlaybackController } from '../src/controller/playbackController.js';

function createTrack(id, title = id) {
  return {
    id,
    title,
    streamUrl: `/stream/${id}`,
  };
}

function createAudio() {
  return {
    currentTime: 0,
    paused: true,
    playbackRate: 1,
    src: '',
    playCount: 0,
    pauseCount: 0,
    play() {
      this.paused = false;
      this.playCount += 1;
      return Promise.resolve();
    },
    pause() {
      this.paused = true;
      this.pauseCount += 1;
    },
  };
}

function createHarness(overrides = {}) {
  const tracks = [createTrack('a'), createTrack('b'), createTrack('c')];
  const state = {
    currentTrackId: null,
    favoriteTrackIds: new Set(),
    lyricsRefreshRequestedIds: new Set(),
    queueIds: [],
    repeatMode: 'off',
    settings: { gaplessPlayback: true },
    shuffleActive: false,
    shuffledQueueIds: [],
    trackMap: new Map(tracks.map((track) => [track.id, track])),
    tracks,
    ...overrides.state,
  };
  const audioPlayer = overrides.audioPlayer ?? createAudio();
  const calls = {
    persisted: 0,
    progress: 0,
    rendered: 0,
    ui: 0,
  };
  const controller = createPlaybackController({
    state,
    audioPlayer,
    getFilteredTracks: () => tracks,
    getDefaultQueueForTrack: () => tracks,
    loadTrackLyrics: () => Promise.resolve(),
    persistPlaybackState: () => calls.persisted += 1,
    updatePlayerUi: () => calls.ui += 1,
    updateProgressUi: () => calls.progress += 1,
    render: () => calls.rendered += 1,
    onPlaybackError: (error) => {
      throw error;
    },
    ...overrides.controller,
  });

  return {
    audioPlayer,
    calls,
    controller,
    state,
    tracks,
  };
}

test('playTrack sets the active track, source, and queue', () => {
  const { audioPlayer, calls, controller, state, tracks } = createHarness();

  controller.playTrack(tracks[1], tracks);

  assert.equal(state.currentTrackId, 'b');
  assert.deepEqual(state.queueIds, ['a', 'b', 'c']);
  assert.equal(audioPlayer.src, '/stream/b');
  assert.equal(audioPlayer.playbackRate, 1);
  assert.equal(audioPlayer.playCount, 1);
  assert.equal(calls.persisted, 1);
  assert.equal(calls.ui, 1);
  assert.equal(calls.rendered, 1);
});

test('playNextTrack advances within the current queue', () => {
  const { audioPlayer, controller, state, tracks } = createHarness({
    state: {
      currentTrackId: 'a',
      queueIds: ['a', 'b', 'c'],
      shuffledQueueIds: ['a', 'b', 'c'],
    },
  });

  controller.playNextTrack();

  assert.equal(state.currentTrackId, 'b');
  assert.equal(audioPlayer.src, tracks[1].streamUrl);
});

test('cycleRepeatMode rotates through all repeat modes', () => {
  const { controller, state } = createHarness();

  controller.cycleRepeatMode();
  assert.equal(state.repeatMode, 'all');

  controller.cycleRepeatMode();
  assert.equal(state.repeatMode, 'one');

  controller.cycleRepeatMode();
  assert.equal(state.repeatMode, 'off');
});
