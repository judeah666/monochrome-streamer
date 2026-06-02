import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildArtistInfoPayload,
  buildLyricsPayload,
  buildTagEditorPayload,
  collectTagTrackRows,
} from '../src/controller/editorPayloads.js';

function createInput(value) {
  return { value };
}

test('buildArtistInfoPayload trims editable artist fields', () => {
  assert.deepEqual(buildArtistInfoPayload({
    imageUrl: ' https://example.com/a.jpg ',
    bio: ' Bio ',
    sourceUrl: ' https://source.example ',
  }), {
    imageUrl: 'https://example.com/a.jpg',
    bio: 'Bio',
    sourceUrl: 'https://source.example',
  });
});

test('collectTagTrackRows reads the compact album tag rows', () => {
  const row = {
    dataset: { trackId: 'track-1', discNumber: '2' },
    querySelector(selector) {
      return {
        '.tag-track-title': createInput(' Title '),
        '.tag-track-artist': createInput(' Artist '),
        '.tag-track-number': createInput(' 4 '),
      }[selector];
    },
  };

  assert.deepEqual(collectTagTrackRows([row]), [{
    id: 'track-1',
    title: 'Title',
    artist: 'Artist',
    trackNumber: '4',
    discNumber: '2',
  }]);
});

test('buildTagEditorPayload mirrors date into year for local overrides', () => {
  assert.deepEqual(buildTagEditorPayload({
    albumTitle: ' Album ',
    albumArtist: ' Artist ',
    date: ' 1999 ',
    genre: ' Pop ',
    collectionName: ' 90s Album Collection ',
    mediaTypes: ['CD', 'Vinyl'],
    status: 'Wishlist',
    coverUrl: ' /cover.jpg ',
    musicBrainzId: 'mbid',
    tracks: [{ id: 'track-1' }],
  }), {
    albumTitle: 'Album',
    albumArtist: 'Artist',
    date: '1999',
    year: '1999',
    genre: 'Pop',
    collectionName: '90s Album Collection',
    mediaTypes: ['CD', 'Vinyl'],
    status: 'Wishlist',
    coverUrl: '/cover.jpg',
    musicBrainzId: 'mbid',
    tracks: [{ id: 'track-1' }],
  });
});

test('buildTagEditorPayload defaults edited scanned albums to collection digital', () => {
  assert.deepEqual(buildTagEditorPayload(), {
    albumTitle: '',
    albumArtist: '',
    date: '',
    year: '',
    genre: '',
    collectionName: '',
    mediaTypes: ['Digital Media'],
    status: 'Collection',
    coverUrl: '',
    musicBrainzId: '',
    tracks: [],
  });
});

test('buildTagEditorPayload can create manual wishlist albums with no media type', () => {
  const payload = buildTagEditorPayload({
    albumTitle: 'Wanted One',
    mediaTypes: [],
    status: 'Wishlist',
  });

  assert.equal(payload.albumTitle, 'Wanted One');
  assert.deepEqual(payload.mediaTypes, []);
  assert.equal(payload.status, 'Wishlist');
});

test('buildLyricsPayload stores timestamped plain input as synced lyrics', () => {
  const parseSyncedLyrics = (value) => String(value).includes('[00:01.00]') ? [{ time: 1, text: 'Line' }] : [];

  assert.deepEqual(buildLyricsPayload({
    syncedInput: '',
    plainInput: '[00:01.00]Line',
    parseSyncedLyrics,
  }), {
    syncedLyrics: '[00:01.00]Line',
    plainLyrics: '',
    source: 'manual',
  });

  assert.deepEqual(buildLyricsPayload({
    syncedInput: ' Synced ',
    plainInput: 'Plain',
    parseSyncedLyrics,
  }), {
    syncedLyrics: 'Synced',
    plainLyrics: 'Plain',
    source: 'manual',
  });
});
