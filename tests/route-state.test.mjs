import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBrowseRoute,
  getAlbumHash,
  getAlbumShareUrl,
  getArtistHash,
  getCollectionHash,
  getFullscreenReturnHash,
  getLoginHash,
  getPlayingHash,
  getRouteHash,
  isValidBrowseView,
  parseRouteFromHash,
} from '../src/controller/routeState.js';

test('parseRouteFromHash returns fullscreen view for playing and legacy hashes', () => {
  const fullscreenRoute = {
    route: { view: 'fullscreen', albumId: null, artistName: null },
    artistNameToLoad: null,
    collectionNameToLoad: null,
  };

  assert.deepEqual(parseRouteFromHash('#playing'), fullscreenRoute);
  assert.deepEqual(parseRouteFromHash('#/playing'), fullscreenRoute);
  assert.deepEqual(parseRouteFromHash('#fullscreen'), fullscreenRoute);
  assert.deepEqual(parseRouteFromHash('#/fullscreen'), fullscreenRoute);
});

test('parseRouteFromHash supports login and stable browse return hashes', () => {
  assert.deepEqual(parseRouteFromHash('#login'), {
    route: { view: 'login', albumId: null, artistName: null },
    artistNameToLoad: null,
    collectionNameToLoad: null,
  });
  assert.deepEqual(parseRouteFromHash('#library'), {
    route: createBrowseRoute('library'),
    artistNameToLoad: null,
    collectionNameToLoad: null,
  });
  assert.deepEqual(parseRouteFromHash('#playlists'), {
    route: createBrowseRoute('playlists'),
    artistNameToLoad: null,
    collectionNameToLoad: null,
  });
});

test('parseRouteFromHash preserves album routes before album data is loaded', () => {
  assert.deepEqual(parseRouteFromHash('#album/album%201', {
    browseView: 'library',
  }), {
    route: { view: 'album', albumId: 'album 1', artistName: null },
    artistNameToLoad: null,
    collectionNameToLoad: null,
  });

  assert.deepEqual(parseRouteFromHash('#album/missing', {
    browseView: 'library',
  }), {
    route: { view: 'album', albumId: 'missing', artistName: null },
    artistNameToLoad: null,
    collectionNameToLoad: null,
  });
});

test('parseRouteFromHash safely rejects malformed encoded route segments', () => {
  assert.deepEqual(parseRouteFromHash('#album/%E0%A4%A', { browseView: 'library' }), {
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

  assert.deepEqual(parseRouteFromHash('#/artist/Utada%20Hikaru'), {
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

  assert.deepEqual(parseRouteFromHash('#/collection/80s%20Albums'), {
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
  assert.equal(getPlayingHash(), 'playing');
  assert.equal(getLoginHash(), 'login');
  assert.equal(getRouteHash(createBrowseRoute('home')), '');
  assert.equal(getRouteHash(createBrowseRoute('library')), 'library');
  assert.equal(getRouteHash({ view: 'album', albumId: 'album 1' }), 'album/album%201');
  assert.equal(getRouteHash({ view: 'artist', artistName: 'A/B' }), 'artist/A%2FB');
  assert.equal(getRouteHash({ view: 'collection', collectionName: 'A/B' }), 'collection/A%2FB');
});

test('album share urls preserve the current app path and replace the hash', () => {
  assert.equal(getAlbumShareUrl('album 1', {
    href: 'https://music.example/app/?theme=light#library',
  }), 'https://music.example/share/album/album%201');

  assert.equal(getAlbumShareUrl('A/B & C', {
    href: 'https://music.example/#album/old',
  }), 'https://music.example/share/album/A%2FB%20%26%20C');
});

test('fullscreen return hash ignores current and legacy playing hashes', () => {
  assert.equal(getFullscreenReturnHash('#album/1'), '#album/1');
  assert.equal(getFullscreenReturnHash('#playing'), '');
  assert.equal(getFullscreenReturnHash('#/playing'), '');
  assert.equal(getFullscreenReturnHash('#fullscreen'), '');
  assert.equal(getFullscreenReturnHash('#/fullscreen'), '');
  assert.equal(getFullscreenReturnHash(''), '');
});

test('isValidBrowseView accepts sidebar views only', () => {
  assert.equal(isValidBrowseView('home'), true);
  assert.equal(isValidBrowseView('playlists'), true);
  assert.equal(isValidBrowseView('wishlist'), true);
  assert.equal(isValidBrowseView('album'), false);
});
