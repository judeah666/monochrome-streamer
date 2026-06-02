import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAddAlbumBodySnapshot,
  buildAddAlbumModalSnapshot,
  buildArtistEditorBodySnapshot,
  buildArtistEditorModalSnapshot,
  buildLyricsEditorBodySnapshot,
  buildLyricsEditorModalSnapshot,
  buildTagEditorBodySnapshot,
  buildTagEditorModalSnapshot,
} from '../src/controller/editorViewPresenter.js';

test('buildArtistEditor snapshots prepare modal shell and body data', () => {
  const modal = buildArtistEditorModalSnapshot('Artist One');
  const body = buildArtistEditorBodySnapshot({
    imageUrl: 'https://image',
    bio: 'Bio',
    sourceUrl: 'https://source',
  });

  assert.equal(modal.title, 'Edit Artist One');
  assert.equal(modal.bodyRootId, 'artist-editor-body-root');
  assert.equal(modal.saveLabel, 'Save artist');
  assert.deepEqual(body, {
    imageUrl: 'https://image',
    bio: 'Bio',
    sourceUrl: 'https://source',
  });
});

test('buildTagEditor snapshots normalize album tag defaults', () => {
  const album = {
    title: 'Album One',
    artist: 'Track Artist One',
    albumArtist: 'Album Artist One',
    date: '1999-01-01',
    mediaType: 'CD',
    coverUrl: '/cover.jpg',
  };
  const modal = buildTagEditorModalSnapshot(album.title);
  const body = buildTagEditorBodySnapshot(album, [{ id: 'track-1' }], {
    extractYear: (date) => date.slice(0, 4),
  });

  assert.equal(modal.title, 'Edit Album One');
  assert.equal(modal.bodyRootId, 'tag-editor-body-root');
  assert.equal(modal.saveLabel, 'Save tags');
  assert.equal(body.albumArtist, 'Album Artist One');
  assert.equal(body.year, '1999');
  assert.equal(body.mediaTypes, 'CD');
  assert.equal(body.searchQuery, 'Album Artist One Album One');
  assert.deepEqual(body.tracks, [{ id: 'track-1' }]);
});

test('buildTagEditor snapshots default scanned album metadata to collection digital', () => {
  const body = buildTagEditorBodySnapshot({ title: 'Untyped Album' }, []);

  assert.deepEqual(body.mediaTypes, ['Digital Media']);
  assert.equal(body.status, 'Collection');
});

test('buildAddAlbum snapshots default manual albums to wishlist with no media type', () => {
  const modal = buildAddAlbumModalSnapshot();
  const body = buildAddAlbumBodySnapshot();

  assert.equal(modal.title, 'Add Album');
  assert.equal(modal.saveLabel, 'Add album');
  assert.deepEqual(body.mediaTypes, []);
  assert.equal(body.status, 'Wishlist');
});

test('buildLyricsEditor snapshots include track context and cached lyrics', () => {
  const track = {
    title: 'Song One',
    artist: 'Artist One',
    album: 'Album One',
  };
  const modal = buildLyricsEditorModalSnapshot(track);
  const body = buildLyricsEditorBodySnapshot(track, {
    syncedLyrics: '[00:01.00]Hi',
    plainLyrics: 'Hi',
  });

  assert.equal(modal.title, 'Lyrics for Song One');
  assert.equal(modal.caption, 'Artist One • Album One');
  assert.equal(modal.bodyRootClassName, 'tag-editor-body lyrics-editor-body');
  assert.equal(body.query, 'Artist One Song One');
  assert.equal(body.syncedLyrics, '[00:01.00]Hi');
  assert.equal(body.plainLyrics, 'Hi');
});
