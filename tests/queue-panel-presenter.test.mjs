import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQueuePanelSnapshot, createQueueTrackView } from '../src/controller/queuePanelPresenter.js';
import { createQueuePanelStore } from '../src/controller/queuePanelStore.js';

const tracks = new Map([
  ['one', { id: 'one', title: 'One', artist: 'Artist A', album: 'Album A', coverUrl: '/one.jpg' }],
  ['two', { id: 'two', title: 'Two', artist: 'Artist B', album: 'Album B' }],
  ['three', { id: 'three', title: 'Three', artist: 'Artist C', album: 'Album C', coverUrl: '/three.jpg' }],
]);

test('createQueueTrackView keeps only queue UI fields and normalizes missing covers', () => {
  assert.deepEqual(createQueueTrackView(tracks.get('two')), {
    id: 'two',
    title: 'Two',
    artist: 'Artist B',
    album: 'Album B',
    coverUrl: '',
  });
});

test('buildQueuePanelSnapshot maps visible queue tracks and preserves queue totals', () => {
  const snapshot = buildQueuePanelSnapshot({
    open: true,
    queueIds: ['missing', 'one', 'two', 'three'],
    trackMap: tracks,
    currentTrackId: 'two',
    favoriteTrackIds: new Set(['one', 'three']),
    limit: 2,
  });

  assert.equal(snapshot.open, true);
  assert.equal(snapshot.total, 3);
  assert.equal(snapshot.limit, 2);
  assert.equal(snapshot.canDownload, true);
  assert.equal(snapshot.currentTrackId, 'two');
  assert.deepEqual(snapshot.favoriteTrackIds, ['one', 'three']);
  assert.deepEqual(snapshot.tracks.map((track) => track.id), ['one', 'two']);
});

test('buildQueuePanelSnapshot treats zero limit as unlimited', () => {
  const snapshot = buildQueuePanelSnapshot({
    queueIds: ['one', 'two', 'three'],
    trackMap: tracks,
    limit: 0,
  });

  assert.deepEqual(snapshot.tracks.map((track) => track.id), ['one', 'two', 'three']);
});

test('buildQueuePanelSnapshot preserves disabled download state', () => {
  const snapshot = buildQueuePanelSnapshot({
    queueIds: ['one'],
    trackMap: tracks,
    canDownload: false,
  });

  assert.equal(snapshot.canDownload, false);
});

test('createQueuePanelStore publishes snapshot updates to subscribers', () => {
  const store = createQueuePanelStore({ onClose: () => {} });
  let calls = 0;
  const unsubscribe = store.subscribe(() => {
    calls += 1;
  });

  const nextSnapshot = buildQueuePanelSnapshot({
    open: true,
    queueIds: ['one'],
    trackMap: tracks,
  });
  store.setSnapshot(nextSnapshot);

  assert.equal(calls, 1);
  assert.equal(store.getSnapshot(), nextSnapshot);
  assert.equal(typeof store.actions.onClose, 'function');

  unsubscribe();
  store.setSnapshot(buildQueuePanelSnapshot());
  assert.equal(calls, 1);
});
