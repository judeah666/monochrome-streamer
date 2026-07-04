import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAlbumDetailSnapshot,
  createAlbumCardView,
  createTrackRowView,
} from '../src/controller/albumViewPresenter.js';

const album = {
  id: 'album-1',
  title: 'Album One',
  artist: 'Track Artist One',
  albumArtist: 'Album Artist One',
  year: '2024',
  mediaTypes: ['CD'],
  status: 'Collection',
  audioQuality: { label: 'Hi-Res' },
};

const tracks = [
  {
    id: 'track-1',
    title: 'First Song',
    artist: 'Artist One',
    album: 'Album One',
    trackNumber: 1,
    discNumber: 1,
    relativePath: 'Artist/Album/01 First Song.flac',
    coverUrl: '/cover.jpg',
  },
  {
    id: 'track-2',
    title: 'Second Song',
    artist: 'Artist One',
    album: 'Album One',
    trackNumber: 2,
    discNumber: 1,
    relativePath: 'Artist/Album/02 Second Song.flac',
  },
];

test('createAlbumCardView normalizes album card fields', () => {
  const card = createAlbumCardView(album, {
    getAlbumMediaTypes: () => ['CD', 'Vinyl'],
    isWishlistAlbum: () => true,
  });

  assert.deepEqual(card, {
    id: 'album-1',
    title: 'Album One',
    artist: 'Album Artist One',
    albumArtist: 'Album Artist One',
    year: '2024',
    status: 'Collection',
    mediaTypes: ['CD', 'Vinyl'],
    audioQuality: { label: 'Hi-Res' },
    coverUrl: '',
    wishlist: true,
  });
});

test('createTrackRowView marks favorite, active, and playing state', () => {
  const row = createTrackRowView(tracks[0], {
    isFavoriteTrack: (trackId) => trackId === 'track-1',
    currentTrackId: 'track-1',
    playing: true,
    getTrackFolderPath: () => 'Artist/Album',
  });

  assert.equal(row.favorite, true);
  assert.equal(row.active, true);
  assert.equal(row.playing, true);
  assert.equal(row.folderPath, 'Artist/Album');
});

test('buildAlbumDetailSnapshot uses hero track cover, filters tracks, and creates meta text', () => {
  const snapshot = buildAlbumDetailSnapshot({
    album,
    albumTracks: tracks,
    searchTerm: 'second',
    sameArtistAlbums: [
      { id: 'ep-1', title: 'EP', artist: 'Track Artist One', albumArtist: 'Album Artist One', trackCount: 2 },
      { id: 'full-1', title: 'Full', artist: 'Track Artist One', albumArtist: 'Album Artist One', trackCount: 10 },
    ],
    relatedAlbumLimit: 1,
    favorite: true,
    shareCopied: true,
    currentTrackId: 'track-2',
    playing: false,
    helpers: {
      trackMatchesSearch: (track, searchTerm) => track.title.toLowerCase().includes(searchTerm),
      partitionAlbums: (albums) => [albums.slice(0, 1), albums.slice(1)],
      getAlbumFolderPath: () => 'Artist/Album',
      getAlbumMediaTypes: () => ['Digital Media'],
      isWishlistAlbum: () => false,
      isFavoriteTrack: (trackId) => trackId === 'track-2',
      getTrackFolderPath: () => 'Artist/Album',
    },
  });

  assert.equal(snapshot.album.coverUrl, '/cover.jpg');
  assert.equal(snapshot.album.folder, 'Artist/Album');
  assert.equal(snapshot.album.meta, '2024 • 2 tracks • filtered by "second"');
  assert.deepEqual(snapshot.tracks.map((track) => track.id), ['track-2']);
  assert.equal(snapshot.tracks[0].favorite, true);
  assert.equal(snapshot.favorite, true);
  assert.equal(snapshot.shareCopied, true);
  assert.equal(snapshot.canQueue, true);
  assert.deepEqual(snapshot.relatedAlbums.map((related) => related.id), ['full-1']);
  assert.deepEqual(snapshot.epAlbums.map((ep) => ep.id), ['ep-1']);
});

test('buildAlbumDetailSnapshot returns an empty album view model when album is missing', () => {
  assert.deepEqual(buildAlbumDetailSnapshot(), { album: null });
});
