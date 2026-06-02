import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBrowseRoute,
  getAlbumHash,
  getArtistHash,
  getCollectionHash,
  getFullscreenReturnHash,
  isValidBrowseView,
  parseRouteFromHash,
} from '../src/controller/routeState.js';

test('parseRouteFromHash returns fullscreen route', () => {
  assert.deepEqual(parseRouteFromHash('#fullscreen'), {
    route: { view: 'fullscreen', albumId: null, artistName: null },
    artistNameToLoad: null,
    collectionNameToLoad: null,
  });
});

test('parseRouteFromHash returns album route only when album exists', () => {
  assert.deepEqual(parseRouteFromHash('#album/album%201', {
    browseView: 'library',
    hasAlbum: (albumId) => albumId === 'album 1',
  }), {
    route: { view: 'album', albumId: 'album 1', artistName: null },
    artistNameToLoad: null,
    collectionNameToLoad: null,
  });

  assert.deepEqual(parseRouteFromHash('#album/missing', {
    browseView: 'library',
    hasAlbum: () => false,
  }), {
    route: { view: 'library', albumId: null, artistName: null },
    artistNameToLoad: null,
    collectionNameToLoad: null,
  });
});

test('parseRouteFromHash returns artist route and load hint', () => {
  assert.deepEqual(parseRouteFromHash('#artist/Utada%20Hikaru'), {
    route: { view: 'artist', albumId: null, artistName: 'Utada Hikaru' },
    artistNameToLoad: 'Utada Hikaru',
    collectionNameToLoad: null,
  });
});

test('parseRouteFromHash returns collection route and load hint', () => {
  assert.deepEqual(parseRouteFromHash('#collection/80s%20Albums'), {
    route: { view: 'collection', albumId: null, artistName: null, collectionName: '80s Albums' },
    artistNameToLoad: null,
    collectionNameToLoad: '80s Albums',
  });
});

test('route helpers encode hashes and browse routes', () => {
  assert.deepEqual(createBrowseRoute('favorites'), { view: 'favorites', albumId: null, artistName: null });
  assert.equal(getAlbumHash('album 1'), 'album/album%201');
  assert.equal(getArtistHash('A/B'), 'artist/A%2FB');
  assert.equal(getCollectionHash('A/B'), 'collection/A%2FB');
});

test('fullscreen return hash ignores already fullscreen hash', () => {
  assert.equal(getFullscreenReturnHash('#album/1'), '#album/1');
  assert.equal(getFullscreenReturnHash('#fullscreen'), '');
  assert.equal(getFullscreenReturnHash(''), '');
});

test('isValidBrowseView accepts sidebar views only', () => {
  assert.equal(isValidBrowseView('home'), true);
  assert.equal(isValidBrowseView('wishlist'), true);
  assert.equal(isValidBrowseView('album'), false);
});
