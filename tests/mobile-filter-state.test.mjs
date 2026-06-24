import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAlphabetFilterLabel,
  getFolderFilterLabel,
} from '../src/utils/mobileFilters.js';

test('mobile folder filter label summarizes the active folder count', () => {
  assert.equal(getFolderFilterLabel(), 'All folders');
  assert.equal(getFolderFilterLabel([]), 'All folders');
  assert.equal(getFolderFilterLabel(['Asian Music']), 'Folders · 1');
  assert.equal(getFolderFilterLabel(['Asian Music', 'Pinoy Music']), 'Folders · 2');
});

test('mobile alphabet filter label reports the current selection', () => {
  assert.equal(getAlphabetFilterLabel(), 'A–Z · All');
  assert.equal(getAlphabetFilterLabel('all'), 'A–Z · All');
  assert.equal(getAlphabetFilterLabel('#'), 'A–Z · #');
  assert.equal(getAlphabetFilterLabel('b'), 'A–Z · B');
});
