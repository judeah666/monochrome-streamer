import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildArtistGroups,
  compareTrackOrder,
  filterAlbumsByMediaType,
  findAlbumByTrack,
  getAlbumFolderPath,
  getAlbumMediaTypes,
  getFilteredTracks,
  getFilteredAlbums,
  getHomeAlbums,
  getRandomAlbumIds,
  getTrackFolderPath,
  isWishlistAlbum,
  normalizeMediaTypeName,
  trackMatchesSearch,
} from '../src/controller/librarySelectors.js';

test('compareTrackOrder sorts by disc first, then track number', () => {
  const tracks = [
    { discNumber: 2, trackNumber: 1, title: 'Disc 2' },
    { discNumber: 1, trackNumber: 2, title: 'Second' },
    { discNumber: 1, trackNumber: 1, title: 'First' },
  ];

  assert.deepEqual(tracks.sort(compareTrackOrder).map((track) => track.title), ['First', 'Second', 'Disc 2']);
});

test('track search only matches track titles', () => {
  const track = { title: 'Automatic', album: 'First Love', artist: 'Utada Hikaru' };

  assert.equal(trackMatchesSearch(track, 'auto'), true);
  assert.equal(trackMatchesSearch(track, 'first love'), false);
  assert.deepEqual(getFilteredTracks([track], 'utada'), []);
});

test('album search keeps direct album title matches even when tracks do not match', () => {
  const albums = [
    { id: 'album-1', title: 'DJ Traxx Demo Mix', artist: 'Various Artists' },
    { id: 'album-2', title: 'Budots Dance', artist: 'Dredcore' },
  ];
  const tracks = [
    { id: 'track-1', albumId: 'album-2', title: 'DJ Traxx Demo Mix', album: 'Budots Dance', artist: 'Dredcore' },
  ];
  const filteredTracks = getFilteredTracks(tracks, 'dj traxx demo mix');

  assert.deepEqual(
    getFilteredAlbums(albums, filteredTracks, 'dj traxx demo mix').map((album) => album.id),
    ['album-1', 'album-2'],
  );
});

test('album search normalizes punctuation and token spacing', () => {
  const albums = [
    { id: 'album-1', title: 'For Lover’s Only IV', artist: 'Various Artists', year: 2000 },
    { id: 'album-2', title: 'Different Album', artist: 'Various Artists' },
  ];

  assert.deepEqual(
    getFilteredAlbums(albums, [], 'for lovers only').map((album) => album.id),
    ['album-1'],
  );
});

test('media type helpers normalize cassette tape and default scanned albums to digital', () => {
  assert.equal(normalizeMediaTypeName('cassette-tape'), 'Cassette Tape');
  assert.deepEqual(getAlbumMediaTypes({ mediaTypes: [] }), ['Digital Media']);
  assert.deepEqual(getAlbumMediaTypes({ manual: true, mediaTypes: [] }), []);
  assert.deepEqual(getAlbumMediaTypes({ mediaTypes: ['CD', 'cassette tape'] }), ['CD', 'Cassette Tape']);
});

test('filterAlbumsByMediaType keeps albums with any selected media type', () => {
  const albums = [
    { title: 'A', mediaTypes: ['CD'] },
    { title: 'B', mediaTypes: ['Cassette Tape'] },
    { title: 'C', mediaTypes: ['Vinyl'] },
  ];

  assert.deepEqual(
    filterAlbumsByMediaType(albums, new Set(['Cassette Tape', 'Vinyl'])).map((album) => album.title),
    ['B', 'C'],
  );
});

test('wishlist status accepts old wanted value for compatibility', () => {
  assert.equal(isWishlistAlbum({ status: 'Wishlist' }), true);
  assert.equal(isWishlistAlbum({ status: 'Wanted' }), true);
  assert.equal(isWishlistAlbum({ status: 'Collection' }), false);
});

test('folder path helpers keep common album folder', () => {
  assert.equal(getTrackFolderPath('Asian Music/Artist/Album/01.flac'), 'Asian Music/Artist/Album');
  assert.equal(getAlbumFolderPath([
    { relativePath: 'Asian Music/Artist/Album/CD1/01.flac' },
    { relativePath: 'Asian Music/Artist/Album/CD2/01.flac' },
  ]), 'Asian Music/Artist/Album');
});

test('findAlbumByTrack uses album id first then artist/title fallback', () => {
  const album = { id: 'album-1', title: 'First Love', artist: 'Track Artist', albumArtist: 'Utada Hikaru' };
  const albumMap = new Map([[album.id, album]]);

  assert.equal(findAlbumByTrack({ albumId: 'album-1' }, { albumMap, albums: [] }), album);
  assert.equal(findAlbumByTrack(
    { album: 'First Love', artist: 'Featured Artist', albumArtist: 'Utada Hikaru' },
    { albumMap: new Map(), albums: [album] },
  ), album);
});

test('buildArtistGroups groups by track artist instead of album artist', () => {
  const album = { id: 'album-1', title: 'Duets', artist: 'Album Artist' };
  const tracks = [
    { id: 'track-1', artist: 'Singer A' },
    { id: 'track-2', artist: 'Singer B' },
  ];
  const groups = buildArtistGroups(tracks, {
    albumMap: new Map([[album.id, album]]),
    findAlbum: () => album,
  });

  assert.deepEqual(groups.map((group) => group.name), ['Singer A', 'Singer B']);
});

test('getRandomAlbumIds uses supplied random source for deterministic tests', () => {
  const albums = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const ids = getRandomAlbumIds(albums, 2, () => 0);

  assert.deepEqual(ids, ['b', 'c']);
});

test('getHomeAlbums uses randomized ids first and fills remaining slots', () => {
  const albums = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const albumMap = new Map(albums.map((album) => [album.id, album]));

  assert.deepEqual(getHomeAlbums({
    searchTerm: '',
    homeAlbumIds: ['c', 'a'],
    albumMap,
    filteredAlbums: albums,
    limit: 3,
  }).map((album) => album.id), ['c', 'a']);

  assert.deepEqual(getHomeAlbums({
    searchTerm: 'x',
    homeAlbumIds: ['c'],
    albumMap,
    filteredAlbums: albums,
    limit: 3,
  }).map((album) => album.id), ['c', 'a', 'b']);
});
