import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlayerSnapshot } from '../src/controller/playerPresenter.js';
import { createPlayerStore } from '../src/controller/playerStore.js';

const track = {
  id: 'track-1',
  title: 'Song One',
  artist: 'Artist One',
  album: 'Album One',
  coverUrl: '/cover.jpg',
  streamUrl: '/api/tracks/track-1/stream',
};

test('buildPlayerSnapshot creates the now-playing, transport, and utility view models', () => {
  const snapshot = buildPlayerSnapshot({
    track,
    album: { id: 'album-1' },
    paused: false,
    shuffleActive: true,
    repeatMode: 'one',
    repeatLabel: 'Repeat one',
    queueOpen: true,
    volume: 0.4,
    showQuality: true,
    quality: { label: 'CD 16-Bit' },
    favorite: true,
    downloadName: 'Song One.flac',
  });

  assert.deepEqual(snapshot.nowPlaying, {
    track: { id: 'track-1' },
    album: { id: 'album-1' },
    coverUrl: '/cover.jpg',
    coverAlt: 'Album One cover art',
    title: 'Song One',
    albumTitle: 'Album One',
    artist: 'Artist One',
  });
  assert.deepEqual(snapshot.transport, {
    playing: true,
    shuffleActive: true,
    repeatActive: true,
    repeatMode: 'one',
    repeatLabel: 'Repeat one',
  });
  assert.equal('downloadUrl' in snapshot.utility, false);
  assert.equal(snapshot.utility.downloadName, 'Song One.flac');
  assert.equal(snapshot.utility.canDownload, true);
  assert.equal(snapshot.utility.favorite, true);
  assert.equal(snapshot.utility.showQuality, true);
});

test('buildPlayerSnapshot hides quality and playback state when no track is active', () => {
  const snapshot = buildPlayerSnapshot({
    paused: false,
    showQuality: true,
    quality: { label: 'Hi-Res' },
  });

  assert.equal(snapshot.nowPlaying.title, 'Select a track');
  assert.equal(snapshot.nowPlaying.artist, 'Your queue will appear here.');
  assert.equal(snapshot.transport.playing, false);
  assert.equal(snapshot.utility.hasTrack, false);
  assert.equal(snapshot.utility.showQuality, false);
  assert.equal(snapshot.utility.canDownload, true);
  assert.equal('downloadUrl' in snapshot.utility, false);
});

test('buildPlayerSnapshot carries explicit download availability state', () => {
  const snapshot = buildPlayerSnapshot({
    track,
    canDownload: false,
  });

  assert.equal(snapshot.utility.canDownload, false);
});

test('createPlayerStore publishes player snapshot changes', () => {
  const store = createPlayerStore({ transport: { onNext: () => {} } });
  let calls = 0;
  const unsubscribe = store.subscribe(() => {
    calls += 1;
  });
  const snapshot = buildPlayerSnapshot({ track });

  store.setSnapshot(snapshot);

  assert.equal(calls, 1);
  assert.equal(store.getSnapshot(), snapshot);
  assert.equal(typeof store.actions.transport.onNext, 'function');

  unsubscribe();
  store.setSnapshot(buildPlayerSnapshot());
  assert.equal(calls, 1);
});
