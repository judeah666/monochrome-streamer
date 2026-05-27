import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addFavoriteIds,
  hasFavorite,
  toggleFavoriteId,
} from '../src/controller/favoritesState.js';

test('hasFavorite checks membership', () => {
  assert.equal(hasFavorite(new Set(['a']), 'a'), true);
  assert.equal(hasFavorite(new Set(['a']), 'b'), false);
});

test('toggleFavoriteId only toggles valid ids', () => {
  const favorites = new Set(['a']);
  const validIds = new Map([['a', {}], ['b', {}]]);

  assert.equal(toggleFavoriteId(favorites, validIds, 'a'), true);
  assert.equal(favorites.has('a'), false);

  assert.equal(toggleFavoriteId(favorites, validIds, 'b'), true);
  assert.equal(favorites.has('b'), true);

  assert.equal(toggleFavoriteId(favorites, validIds, 'missing'), false);
  assert.equal(favorites.has('missing'), false);
});

test('addFavoriteIds adds only valid non-duplicate ids', () => {
  const favorites = new Set(['a']);
  const validIds = new Map([['a', {}], ['b', {}], ['c', {}]]);

  assert.equal(addFavoriteIds(favorites, validIds, ['a', 'b', 'missing', 'c']), true);
  assert.deepEqual([...favorites].sort(), ['a', 'b', 'c']);

  assert.equal(addFavoriteIds(favorites, validIds, ['a', 'b']), false);
});
