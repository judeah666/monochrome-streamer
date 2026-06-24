import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeLibraryFilterState,
  readLibraryFilterState,
  writeLibraryFilterState,
} from '../src/controller/libraryFilterPersistence.js';

test('normalizes persisted library filters and removes unsupported values', () => {
  assert.deepEqual(normalizeLibraryFilterState({
    letter: 'b',
    mediaTypes: ['CD', 'Unknown', 'CD'],
    folders: ['Music', 'Music', '', 'Archive'],
  }, { validMediaTypes: ['CD', 'Vinyl'] }), {
    letter: 'B',
    mediaTypes: ['CD'],
    folders: ['Music', 'Archive'],
  });
});

test('reads and writes the same durable filter snapshot', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };

  writeLibraryFilterState(storage, 'filters', {
    letter: '#',
    mediaTypes: ['Vinyl'],
    folders: ['Asian Music'],
  }, { validMediaTypes: ['Vinyl'] });

  assert.deepEqual(readLibraryFilterState(storage, 'filters', {
    validMediaTypes: ['Vinyl'],
  }), {
    letter: '#',
    mediaTypes: ['Vinyl'],
    folders: ['Asian Music'],
  });
});

test('falls back safely when persisted filter JSON is malformed', () => {
  const storage = { getItem: () => '{broken' };
  assert.deepEqual(readLibraryFilterState(storage, 'filters'), {
    letter: 'all',
    mediaTypes: [],
    folders: [],
  });
});
