import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addTrackIdsToQueue,
  clearQueueState,
  getPlaybackQueueIds,
  removeTrackIdFromQueue,
  reorderQueueState,
  setPlaybackQueueIds,
  syncShuffledQueueIds,
} from '../src/controller/queueState.js';

function createState(overrides = {}) {
  return {
    currentTrackId: null,
    queueIds: [],
    shuffledQueueIds: [],
    shuffleActive: false,
    ...overrides,
  };
}

test('setPlaybackQueueIds keeps the normal queue order when shuffle is off', () => {
  const state = createState();

  setPlaybackQueueIds(state, ['a', 'b', 'c'], 'b');

  assert.deepEqual(state.queueIds, ['a', 'b', 'c']);
  assert.deepEqual(state.shuffledQueueIds, ['a', 'b', 'c']);
  assert.deepEqual(getPlaybackQueueIds(state), ['a', 'b', 'c']);
});

test('setPlaybackQueueIds pins the current track first when shuffle is on', () => {
  const state = createState({ shuffleActive: true });

  setPlaybackQueueIds(state, ['a', 'b', 'c', 'd'], 'c');

  assert.deepEqual(state.queueIds, ['a', 'b', 'c', 'd']);
  assert.equal(state.shuffledQueueIds[0], 'c');
  assert.deepEqual(new Set(state.shuffledQueueIds), new Set(['a', 'b', 'c', 'd']));
});

test('addTrackIdsToQueue ignores duplicate ids and syncs shuffle state', () => {
  const state = createState({ queueIds: ['a'], shuffledQueueIds: ['a'] });

  const changed = addTrackIdsToQueue(state, ['a', 'b', 'c']);

  assert.equal(changed, true);
  assert.deepEqual(state.queueIds, ['a', 'b', 'c']);
  assert.deepEqual(state.shuffledQueueIds, ['a', 'b', 'c']);
});

test('addTrackIdsToQueue appends new ids without reshuffling upcoming shuffled tracks', () => {
  const state = createState({
    currentTrackId: 'b',
    queueIds: ['a', 'b', 'c'],
    shuffledQueueIds: ['b', 'c', 'a'],
    shuffleActive: true,
  });

  const changed = addTrackIdsToQueue(state, ['a', 'd', 'e']);

  assert.equal(changed, true);
  assert.deepEqual(state.queueIds, ['a', 'b', 'c', 'd', 'e']);
  assert.deepEqual(state.shuffledQueueIds, ['b', 'c', 'a', 'd', 'e']);
});

test('clearQueueState keeps the current track and disables shuffle', () => {
  const state = createState({
    currentTrackId: 'b',
    queueIds: ['a', 'b', 'c'],
    shuffledQueueIds: ['b', 'c', 'a'],
    shuffleActive: true,
  });

  clearQueueState(state);

  assert.deepEqual(state.queueIds, ['b']);
  assert.deepEqual(state.shuffledQueueIds, ['b']);
  assert.equal(state.shuffleActive, false);
});

test('removeTrackIdFromQueue does not remove the current track', () => {
  const state = createState({
    currentTrackId: 'b',
    queueIds: ['a', 'b', 'c'],
    shuffledQueueIds: ['b', 'c', 'a'],
  });

  assert.equal(removeTrackIdFromQueue(state, 'b'), false);
  assert.deepEqual(state.queueIds, ['a', 'b', 'c']);
});

test('reorderQueueState uses the active queue order and disables shuffle', () => {
  const state = createState({
    queueIds: ['a', 'b', 'c'],
    shuffledQueueIds: ['b', 'c', 'a'],
    shuffleActive: true,
  });

  const changed = reorderQueueState(state, 'a', 'b');

  assert.equal(changed, true);
  assert.deepEqual(state.queueIds, ['a', 'b', 'c']);
  assert.deepEqual(state.shuffledQueueIds, ['a', 'b', 'c']);
  assert.equal(state.shuffleActive, false);
});

test('removeTrackIdFromQueue preserves the remaining shuffled order', () => {
  const state = createState({
    currentTrackId: 'b',
    queueIds: ['a', 'b', 'c', 'd'],
    shuffledQueueIds: ['b', 'd', 'c', 'a'],
    shuffleActive: true,
  });

  const changed = removeTrackIdFromQueue(state, 'c');

  assert.equal(changed, true);
  assert.deepEqual(state.queueIds, ['a', 'b', 'd']);
  assert.deepEqual(state.shuffledQueueIds, ['b', 'd', 'a']);
});

test('syncShuffledQueueIds mirrors the normal queue when shuffle is off', () => {
  const state = createState({ queueIds: ['x', 'y'], shuffledQueueIds: ['y', 'x'] });

  syncShuffledQueueIds(state);

  assert.deepEqual(state.shuffledQueueIds, ['x', 'y']);
});
