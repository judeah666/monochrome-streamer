import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/controller/appState.js';

test('fullscreen lyrics are hidden by default', () => {
  assert.equal(createInitialState().fullscreenLyricsHidden, true);
});

test('paging request state starts empty', () => {
  const state = createInitialState();

  assert.equal(state.wishlistFetchId, 0);
  assert.equal(state.artistLibraryCacheGeneration, 0);
  assert.equal(state.folderCacheGeneration, 0);
  assert.equal(state.libraryPageCache.size, 0);
  assert.equal(state.browsePageCache.size, 0);
  assert.equal(state.browsePageRequests.size, 0);
  assert.equal(state.artistLibraryRequests.size, 0);
  assert.equal(state.folderRequests.size, 0);
  assert.equal(state.collectionNameOptionsRequest, null);
  assert.equal(state.homeAlbumRequest, null);
  assert.equal(state.homeAlbumRequestKey, '');
});
