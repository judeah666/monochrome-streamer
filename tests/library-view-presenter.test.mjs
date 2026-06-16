import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAlbumCollectionSnapshot,
  buildLibraryArtistsPanelSnapshot,
  buildLibraryFilterSnapshot,
  buildLibraryPagerSnapshot,
  buildLibraryTracksPanelSnapshot,
  buildTrackCollectionSnapshot,
} from '../src/controller/libraryViewPresenter.js';

test('buildLibraryFilterSnapshot maps media type icons and active filters', () => {
  const snapshot = buildLibraryFilterSnapshot({
    alphabetFilters: ['all', 'A'],
    activeLetter: 'A',
    mediaTypeIcons: { CD: '/cd.svg', Vinyl: '/vinyl.svg' },
    activeMediaTypes: new Set(['Vinyl']),
    showMediaType: true,
  });

  assert.deepEqual(snapshot.alphabetFilters, ['all', 'A']);
  assert.equal(snapshot.activeLetter, 'A');
  assert.deepEqual(snapshot.mediaTypes, [
    { value: 'CD', icon: '/cd.svg' },
    { value: 'Vinyl', icon: '/vinyl.svg' },
  ]);
  assert.deepEqual(snapshot.activeMediaTypes, ['Vinyl']);
  assert.equal(snapshot.showMediaType, true);
});

test('buildLibraryPagerSnapshot keeps pager metadata compact', () => {
  assert.deepEqual(buildLibraryPagerSnapshot({
    page: { offset: 50, limit: 50 },
    total: 200,
    itemLabel: 'album',
    showPageSize: true,
  }), {
    page: { offset: 50, limit: 50 },
    total: 200,
    itemLabel: 'album',
    showPageSize: true,
    loading: false,
  });

  assert.equal(buildLibraryPagerSnapshot({ loading: true }).loading, true);
});

test('buildAlbumCollectionSnapshot prepares album cards and attaches filter/pager props', () => {
  const snapshot = buildAlbumCollectionSnapshot({
    albums: [{ id: 'a' }],
    prepareAlbum: (album) => ({ id: album.id, title: 'Prepared' }),
    emptyMessage: 'Empty',
    compact: true,
    wrapGrid: true,
    filterProps: { activeLetter: 'B' },
    pagerProps: { total: 1 },
  });

  assert.deepEqual(snapshot.albums, [{ id: 'a', title: 'Prepared' }]);
  assert.equal(snapshot.emptyMessage, 'Empty');
  assert.equal(snapshot.compact, true);
  assert.equal(snapshot.wrapGrid, true);
  assert.equal(snapshot.showFilter, true);
  assert.equal(snapshot.showPager, true);
  assert.equal(snapshot.activeLetter, 'B');
  assert.equal(snapshot.total, 1);
});

test('buildTrackCollectionSnapshot prepares track rows and preserves render limits', () => {
  const snapshot = buildTrackCollectionSnapshot({
    tracks: [{ id: 't' }],
    total: 10,
    limit: 5,
    emptyMessage: 'No tracks',
    showAlbum: false,
    prepareTrack: (track) => ({ id: track.id, title: 'Prepared Track' }),
  });

  assert.deepEqual(snapshot.tracks, [{ id: 't', title: 'Prepared Track' }]);
  assert.equal(snapshot.total, 10);
  assert.equal(snapshot.limit, 5);
  assert.equal(snapshot.showAlbum, false);
});

test('buildLibraryArtistsPanelSnapshot and tracks panel snapshot prepare rows', () => {
  const artists = buildLibraryArtistsPanelSnapshot({
    artists: [{ name: 'Artist' }],
    prepareArtist: (artist) => ({ name: artist.name, imageUrl: '' }),
    filterProps: { activeLetter: 'all' },
    pagerProps: { total: 1 },
  });
  const tracks = buildLibraryTracksPanelSnapshot({
    tracks: [{ id: 'track' }],
    searchTerm: 'track',
    filterProps: { activeLetter: 'T' },
    pagerProps: { total: 1 },
    prepareTrack: (track) => ({ id: track.id }),
  });

  assert.deepEqual(artists.artists, [{ name: 'Artist', imageUrl: '' }]);
  assert.equal(artists.filterProps.activeLetter, 'all');
  assert.deepEqual(tracks.tracks, [{ id: 'track' }]);
  assert.equal(tracks.searchTerm, 'track');
  assert.equal(tracks.pagerProps.total, 1);
});
