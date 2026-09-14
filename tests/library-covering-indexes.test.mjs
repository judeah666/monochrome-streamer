import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { writeLibraryDatabase, readLibraryAlbumPage } from '../lib/library-db.mjs';

for (const migrate of [false, true]) {
  test(`covering folder indexes preserve album membership (${migrate ? 'version 6 upgrade' : 'new database'})`, async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'library-covering-'));
    const file = path.join(dir, 'library.sqlite');
    try {
      const folders = ['Various', 'Various/Nested/CD 1', 'Various/Nested/CD 2', 'Various Other', 'Various%_'];
      const tracks = folders.map((folder, i) => ({ id: `t${i}`, title: `Song ${i}`, artist: 'Artist', albumArtist: 'Artist', album: `Album ${i}`, relativePath: `${folder}/song.flac` }));
      const albums = tracks.map((t, i) => ({ id: `a${i}`, title: t.album, artist: 'Artist', albumArtist: 'Artist', trackIds: [t.id] }));
      await writeLibraryDatabase(file, { generatedAt: 'fixture', tracks, albums });
      let db = new DatabaseSync(file);
      const searchBefore = db.prepare('SELECT * FROM albums_fts ORDER BY rowid').all();
      if (migrate) db.exec('DROP INDEX idx_tracks_folder_path; DROP INDEX idx_album_tracks_track; CREATE INDEX idx_tracks_folder_path ON tracks(folder_path); CREATE INDEX idx_album_tracks_track ON album_tracks(track_id); PRAGMA user_version=6');
      db.close();
      const page = await readLibraryAlbumPage(file, { folders: ['Various'], includeTracks: false });
      assert.equal(page.albumCount, 3);
      assert.deepEqual(page.albums.map(a => a.id).sort(), ['a0', 'a1', 'a2']);
      const literal = await readLibraryAlbumPage(file, { folders: ['Various%_'], includeTracks: false });
      assert.deepEqual(literal.albums.map(a => a.id), ['a4']);
      db = new DatabaseSync(file);
      try {
        assert.equal(db.prepare('PRAGMA user_version').get().user_version, 7);
        assert.deepEqual(db.prepare('SELECT * FROM albums_fts ORDER BY rowid').all(), searchBefore);
        const plan = db.prepare(`EXPLAIN QUERY PLAN SELECT album_tracks.album_id FROM tracks INDEXED BY idx_tracks_folder_path INNER JOIN album_tracks ON album_tracks.track_id=tracks.id WHERE tracks.folder_path >= ? AND tracks.folder_path < ?`).all('Various/', 'Various0');
        assert.ok(plan.some(row => row.detail.includes('COVERING INDEX idx_tracks_folder_path')));
        assert.ok(plan.some(row => row.detail.includes('COVERING INDEX idx_album_tracks_track')));
      } finally { db.close(); }
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
}
