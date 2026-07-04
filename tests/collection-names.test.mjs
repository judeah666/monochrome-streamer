import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCollectionNames,
  replaceCollectionName,
} from '../src/shared/collectionNames.js';

test('parseCollectionNames splits comma and tab delimited values', () => {
  assert.deepEqual(parseCollectionNames('80s Hits, Road Trip\tFavorites'), [
    '80s Hits',
    'Road Trip',
    'Favorites',
  ]);
});

test('parseCollectionNames trims whitespace and removes duplicate names case-insensitively', () => {
  assert.deepEqual(parseCollectionNames(' Hits , hits\tDeep  Cuts,, HITS '), [
    'Hits',
    'Deep Cuts',
  ]);
});

test('replaceCollectionName edits one parsed collection without removing siblings', () => {
  assert.equal(replaceCollectionName('Hits, Road Trip\tFavorites', 'road trip', 'Car Mix'), 'Hits, Car Mix, Favorites');
  assert.equal(replaceCollectionName('Hits, Road Trip\tFavorites', 'road trip', ''), 'Hits, Favorites');
});
