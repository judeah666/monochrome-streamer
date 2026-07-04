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
    duration: 0,
    ended: false,
    paused: true,
    playbackRate: 1,
    src: '',
    loadCount: 0,
    playCount: 0,
    pauseCount: 0,
    removedAttributes: [],
    load() {
      this.loadCount += 1;
    },
    play() {
      this.paused = false;
      this.ended = false;
      this.playCount += 1;
      return Promise.resolve();
    },
    pause() {
      this.paused = true;
      this.pauseCount += 1;
    },
    removeAttribute(name) {
      this.removedAttributes.push(name);
      if (name === 'src') this.src = '';
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

test('playNextTrack preserves a stable shuffled queue order', () => {
  const { audioPlayer, controller, state, tracks } = createHarness({
    state: {
      currentTrackId: 'a',
      queueIds: ['a', 'b', 'c'],
      shuffledQueueIds: ['a', 'c', 'b'],
      shuffleActive: true,
    },
  });

  controller.playNextTrack();

  assert.equal(state.currentTrackId, 'c');
  assert.equal(audioPlayer.src, tracks[2].streamUrl);
  assert.deepEqual(state.queueIds, ['a', 'b', 'c']);
  assert.deepEqual(state.shuffledQueueIds, ['a', 'c', 'b']);
});

test('playPreviousTrack preserves a stable shuffled queue order', () => {
  const { audioPlayer, controller, state, tracks } = createHarness({
    state: {
      currentTrackId: 'c',
      queueIds: ['a', 'b', 'c'],
      shuffledQueueIds: ['a', 'c', 'b'],
      shuffleActive: true,
    },
  });

  controller.playPreviousTrack();

  assert.equal(state.currentTrackId, 'a');
  assert.equal(audioPlayer.src, tracks[0].streamUrl);
  assert.deepEqual(state.queueIds, ['a', 'b', 'c']);
  assert.deepEqual(state.shuffledQueueIds, ['a', 'c', 'b']);
});

test('handleTrackEnded keeps the shuffled order stable during autoplay', () => {
  const { audioPlayer, controller, state, tracks } = createHarness({
    state: {
      currentTrackId: 'a',
      queueIds: ['a', 'b', 'c'],
      shuffledQueueIds: ['a', 'c', 'b'],
      shuffleActive: true,
      settings: { gaplessPlayback: true },
    },
  });

  controller.handleTrackEnded();

  assert.equal(state.currentTrackId, 'c');
  assert.equal(audioPlayer.src, tracks[2].streamUrl);
  assert.deepEqual(state.queueIds, ['a', 'b', 'c']);
  assert.deepEqual(state.shuffledQueueIds, ['a', 'c', 'b']);
});

test('near-end preload is skipped when gapless playback is disabled', () => {
  const createdPreloads = [];
  const { controller } = createHarness({
    audioPlayer: { ...createAudio(), paused: false, duration: 100, currentTime: 96 },
    state: {
      currentTrackId: 'a',
      queueIds: ['a', 'b', 'c'],
      settings: { gaplessPlayback: false },
    },
    controller: {
      createPreloadAudio: () => {
        const audio = createAudio();
        createdPreloads.push(audio);
        return audio;
      },
    },
  });

  controller.maybePreloadNextTrack();

  assert.equal(createdPreloads.length, 0);
});

test('near-end preload starts only for the next expected track', () => {
  const createdPreloads = [];
  const { controller, tracks } = createHarness({
    audioPlayer: { ...createAudio(), paused: false, duration: 100, currentTime: 93 },
    state: {
      currentTrackId: 'a',
      queueIds: ['a', 'b', 'c'],
      settings: { gaplessPlayback: true },
    },
    controller: {
      createPreloadAudio: () => {
        const audio = createAudio();
        createdPreloads.push(audio);
        return audio;
      },
    },
  });

  controller.maybePreloadNextTrack();
  controller.maybePreloadNextTrack();

  assert.equal(createdPreloads.length, 1);
  assert.equal(createdPreloads[0].src, tracks[1].streamUrl);
  assert.equal(createdPreloads[0].preload, 'auto');
  assert.equal(createdPreloads[0].loadCount, 1);
});

test('repeat one does not preload next and restarts the current track', () => {
  const createdPreloads = [];
  const audioPlayer = { ...createAudio(), paused: false, duration: 100, currentTime: 96 };
  const { controller, state } = createHarness({
    audioPlayer,
    state: {
      currentTrackId: 'a',
      queueIds: ['a', 'b', 'c'],
      repeatMode: 'one',
      settings: { gaplessPlayback: true },
    },
    controller: {
      createPreloadAudio: () => {
        const audio = createAudio();
        createdPreloads.push(audio);
        return audio;
      },
    },
  });

  controller.maybePreloadNextTrack();
  controller.handleTrackEnded();

  assert.equal(createdPreloads.length, 0);
  assert.equal(state.currentTrackId, 'a');
  assert.equal(audioPlayer.currentTime, 0);
  assert.equal(audioPlayer.playCount, 1);
});

test('repeat all preloads the first track from the end of the queue', () => {
  const createdPreloads = [];
  const { controller, tracks } = createHarness({
    audioPlayer: { ...createAudio(), paused: false, duration: 100, currentTime: 96 },
    state: {
      currentTrackId: 'c',
      queueIds: ['a', 'b', 'c'],
      repeatMode: 'all',
      settings: { gaplessPlayback: true },
    },
    controller: {
      createPreloadAudio: () => {
        const audio = createAudio();
        createdPreloads.push(audio);
        return audio;
      },
    },
  });

  controller.maybePreloadNextTrack();

  assert.equal(createdPreloads.length, 1);
  assert.equal(createdPreloads[0].src, tracks[0].streamUrl);
});

test('preloaded audio is cleaned up on manual next track changes', () => {
  const createdPreloads = [];
  const { controller, state } = createHarness({
    audioPlayer: { ...createAudio(), paused: false, duration: 100, currentTime: 96 },
    state: {
      currentTrackId: 'a',
      queueIds: ['a', 'b', 'c'],
      settings: { gaplessPlayback: true },
    },
    controller: {
      createPreloadAudio: () => {
        const audio = createAudio();
        createdPreloads.push(audio);
        return audio;
      },
    },
  });

  controller.maybePreloadNextTrack();
  controller.playNextTrack();

  assert.equal(state.currentTrackId, 'b');
  assert.equal(createdPreloads[0].pauseCount, 1);
  assert.deepEqual(createdPreloads[0].removedAttributes, ['src']);
});

test('ended playback uses the preloaded next-track URL when available', () => {
  const createdPreloads = [];
  let urlVersion = 1;
  const { audioPlayer, controller, state } = createHarness({
    audioPlayer: { ...createAudio(), paused: false, duration: 100, currentTime: 96 },
    state: {
      currentTrackId: 'a',
      queueIds: ['a', 'b', 'c'],
      settings: { gaplessPlayback: true },
    },
    controller: {
      createPreloadAudio: () => {
        const audio = createAudio();
        createdPreloads.push(audio);
        return audio;
      },
      getTrackStreamUrl: (track) => `${track.streamUrl}?v=${urlVersion}`,
    },
  });

  controller.maybePreloadNextTrack();
  urlVersion = 2;
  controller.handleTrackEnded();

  assert.equal(state.currentTrackId, 'b');
  assert.equal(audioPlayer.src, '/stream/b?v=1');
  assert.equal(createdPreloads[0].pauseCount, 1);
});

test('playback quality URL changes invalidate the near-end preload', () => {
  const createdPreloads = [];
  let playbackQuality = 'original';
  const { controller } = createHarness({
    audioPlayer: { ...createAudio(), paused: false, duration: 100, currentTime: 96 },
    state: {
      currentTrackId: 'a',
      queueIds: ['a', 'b', 'c'],
      settings: { gaplessPlayback: true },
    },
    controller: {
      createPreloadAudio: () => {
        const audio = createAudio();
        createdPreloads.push(audio);
        return audio;
      },
      getTrackStreamUrl: (track) => `${track.streamUrl}?format=${playbackQuality}`,
    },
  });

  controller.maybePreloadNextTrack();
  playbackQuality = 'mp3';
  controller.maybePreloadNextTrack();

  assert.equal(createdPreloads.length, 2);
  assert.equal(createdPreloads[0].pauseCount, 1);
  assert.deepEqual(createdPreloads[0].removedAttributes, ['src']);
  assert.equal(createdPreloads[1].src, '/stream/b?format=mp3');
});

test('playTrack can resolve a playback-format specific stream URL', () => {
  const { audioPlayer, controller, tracks } = createHarness({
    controller: {
      getTrackStreamUrl: (track) => `${track.streamUrl}?format=mp3`,
    },
  });

  controller.playTrack(tracks[0], tracks);

  assert.equal(audioPlayer.src, '/stream/a?format=mp3');
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
