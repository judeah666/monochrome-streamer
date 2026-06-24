import test from 'node:test';
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  addPlaylistTrack,
  createPlaylist,
  deletePlaylist,
  deletePlaylistsForOwner,
  readPlaylist,
  readPlaylists,
  removePlaylistTrack,
  writeLibraryDatabase,
} from '../lib/library-db.mjs';

test('playlists are owner-scoped, ordered, duplicate-safe, and survive rescans', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-playlists-${Date.now()}.sqlite`);
  const owner = 'user:alice';
  try {
    await writeLibraryDatabase(databasePath, createLibrary(['track-1', 'track-2']));
    const playlist = await createPlaylist(databasePath, owner, 'playlist-1', '  Road   Trip  ');
    assert.equal(playlist.name, 'Road Trip');

    await assert.rejects(
      () => createPlaylist(databasePath, owner, 'playlist-duplicate', 'road trip'),
      (error) => error.code === 'PLAYLIST_NAME_EXISTS',
    );

    assert.equal((await addPlaylistTrack(databasePath, owner, playlist.id, 'track-2')).added, true);
    assert.equal((await addPlaylistTrack(databasePath, owner, playlist.id, 'track-1')).added, true);
    assert.equal((await addPlaylistTrack(databasePath, owner, playlist.id, 'track-2')).added, false);
    assert.deepEqual(
      (await readPlaylist(databasePath, owner, playlist.id)).tracks.map((track) => track.id),
      ['track-2', 'track-1'],
    );
    assert.equal(await readPlaylist(databasePath, 'user:bob', playlist.id), null);

    await writeLibraryDatabase(databasePath, createLibrary(['track-1']));
    assert.deepEqual(
      (await readPlaylist(databasePath, owner, playlist.id)).tracks.map((track) => track.id),
      ['track-1'],
    );
    assert.equal((await readPlaylists(databasePath, owner))[0].trackCount, 1);

    await writeLibraryDatabase(databasePath, createLibrary(['track-1', 'track-2']));
    assert.deepEqual(
      (await readPlaylist(databasePath, owner, playlist.id)).tracks.map((track) => track.id),
      ['track-2', 'track-1'],
    );

    assert.equal((await removePlaylistTrack(databasePath, owner, playlist.id, 'track-2')).removed, true);
    assert.deepEqual(
      (await readPlaylist(databasePath, owner, playlist.id)).tracks.map((track) => track.id),
      ['track-1'],
    );
    assert.equal(await deletePlaylist(databasePath, 'user:bob', playlist.id), false);
    assert.equal(await deletePlaylistsForOwner(databasePath, owner), 1);
    assert.deepEqual(await readPlaylists(databasePath, owner), []);
  } finally {
    rmSync(databasePath, { force: true });
  }
});

test('playlist validation permits empty playlists and rejects invalid names and tracks', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-playlist-validation-${Date.now()}.sqlite`);
  try {
    const empty = await createPlaylist(databasePath, 'admin', 'empty-playlist', 'Empty');
    assert.deepEqual(empty.tracks, []);
    await assert.rejects(
      () => createPlaylist(databasePath, 'admin', 'missing-name', '   '),
      (error) => error.code === 'PLAYLIST_NAME_REQUIRED',
    );
    await assert.rejects(
      () => createPlaylist(databasePath, 'admin', 'long-name', 'x'.repeat(101)),
      (error) => error.code === 'PLAYLIST_NAME_TOO_LONG',
    );
    await assert.rejects(
      () => addPlaylistTrack(databasePath, 'admin', empty.id, 'missing-track'),
      (error) => error.code === 'TRACK_NOT_FOUND',
    );
  } finally {
    rmSync(databasePath, { force: true });
  }
});

function createLibrary(trackIds) {
  const tracks = trackIds.map((id, index) => ({
    id,
    title: `Track ${index + 1}`,
    artist: 'Artist',
    albumArtist: 'Artist',
    album: 'Album',
    trackNumber: index + 1,
    discNumber: 1,
    date: '2026',
    year: 2026,
    relativePath: `Artist/Album/${id}.flac`,
    path: `/music/Artist/Album/${id}.flac`,
    fileSize: 1,
    mtimeMs: 1,
    scanMetadata: true,
    scanDurations: false,
    coverArtPath: '',
    cachedCoverPath: '',
    cachedCoverFormat: '',
    hasEmbeddedCover: false,
    duration: 180,
    audioQuality: null,
  }));
  return {
    generatedAt: new Date().toISOString(),
    trackCount: tracks.length,
    albumCount: tracks.length ? 1 : 0,
    tracks,
    albums: tracks.length ? [{
      id: 'album-1',
      title: 'Album',
      artist: 'Artist',
      albumArtist: 'Artist',
      date: '2026',
      year: 2026,
      collectionName: '',
      coverTrackId: tracks[0].id,
      trackIds: tracks.map((track) => track.id),
      audioQuality: null,
    }] : [],
  };
}
