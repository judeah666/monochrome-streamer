import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  buildByteRange,
  createTrackId,
  inferCollectionNameFromFolderPath,
  inferTrackMetadata,
  scanMusicLibrary,
} from '../lib/library.mjs';
import {
  readCollectionFolderAlbumPage,
  readCollectionFolders,
  readLibraryAlbumPage,
  readRandomAlbumPage,
  readRecentlyAddedAlbumPage,
  readTrackPage,
  renameCollectionInDatabase,
  writeLibraryDatabase,
} from '../lib/library-db.mjs';

test('inferTrackMetadata uses folder structure and track number', () => {
  const metadata = inferTrackMetadata('Massive Attack\\Mezzanine\\03 - Teardrop.flac');

  assert.equal(metadata.artist, 'Massive Attack');
  assert.equal(metadata.album, 'Mezzanine');
  assert.equal(metadata.title, 'Teardrop');
  assert.equal(metadata.trackNumber, 3);
});

test('inferCollectionNameFromFolderPath uses the parent collection folder for multi-volume albums', () => {
  const collectionName = inferCollectionNameFromFolderPath(
    "Cruisin' Collection/Cruisin' Verse II (1998) (Bootleg)/CD 2",
    'Cruisin Verse II',
  );

  assert.equal(collectionName, "Cruisin' Collection");
});

test('scanMusicLibrary groups every album under a collection parent folder', async () => {
  const library = await scanMusicLibrary('./sample-library', { scanMetadata: 'filename', scanDurations: false });
  const cruisinAlbums = library.albums.filter((album) => album.collectionName === "Cruisin' Collection");

  assert.ok(cruisinAlbums.length > 1);
  assert.ok(cruisinAlbums.some((album) => album.artist.includes('Cruisin')));
});

test('scanMusicLibrary does not infer a collection from a single album name', async () => {
  const root = path.join(tmpdir(), `monochrome-false-collection-${Date.now()}`);
  try {
    const albumPath = path.join(root, 'Artist', 'The Essential Collection');
    mkdirSync(albumPath, { recursive: true });
    writeFileSync(path.join(albumPath, '01 - Song.mp3'), '');

    const library = await scanMusicLibrary(root, { scanMetadata: 'filename', scanDurations: false });

    assert.equal(library.albums.length, 1);
    assert.equal(library.albums[0].collectionName, '');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('scanMusicLibrary incremental refresh reuses unchanged cached tracks', async () => {
  const root = path.join(tmpdir(), `monochrome-incremental-scan-${Date.now()}`);
  try {
    const albumPath = path.join(root, 'Artist', 'Album');
    mkdirSync(albumPath, { recursive: true });
    writeFileSync(path.join(albumPath, '01 - First.mp3'), '');
    writeFileSync(path.join(albumPath, '02 - Second.mp3'), '');

    const firstScan = await scanMusicLibrary(root, { scanMetadata: 'filename', scanDurations: false });
    const progressEvents = [];
    const secondScan = await scanMusicLibrary(root, {
      scanMetadata: 'filename',
      scanDurations: false,
      cachedTracks: firstScan.tracks,
      skipInitialCount: true,
      onProgress: (event) => progressEvents.push(event),
    });

    assert.equal(secondScan.trackCount, 2);
    assert.equal(progressEvents[0].totalFiles, 2);
    assert.equal(progressEvents.at(-1).reusedFiles, 2);
    assert.equal(progressEvents.at(-1).parsedFiles, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('scanMusicLibrary forced metadata refresh reparses unchanged cached tracks', async () => {
  const root = path.join(tmpdir(), `monochrome-force-tag-scan-${Date.now()}`);
  try {
    const albumPath = path.join(root, 'Artist', 'Album');
    mkdirSync(albumPath, { recursive: true });
    writeFileSync(path.join(albumPath, '01 - First.mp3'), '');
    writeFileSync(path.join(albumPath, '02 - Second.mp3'), '');

    const firstScan = await scanMusicLibrary(root, { scanMetadata: 'filename', scanDurations: false });
    const progressEvents = [];
    const secondScan = await scanMusicLibrary(root, {
      scanMetadata: 'filename',
      scanDurations: false,
      cachedTracks: firstScan.tracks,
      forceMetadataRefresh: true,
      skipInitialCount: true,
      onProgress: (event) => progressEvents.push(event),
    });

    assert.equal(secondScan.trackCount, 2);
    assert.equal(progressEvents[0].totalFiles, 2);
    assert.equal(progressEvents.at(-1).reusedFiles, 0);
    assert.equal(progressEvents.at(-1).parsedFiles, 2);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('writeLibraryDatabase clears single-album collection-name false positives', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-false-collection-db-${Date.now()}.sqlite`);
  try {
    await writeLibraryDatabase(databasePath, {
      generatedAt: new Date().toISOString(),
      trackCount: 1,
      albumCount: 1,
      tracks: [
        {
          id: 'track-collection-name',
          title: 'Song',
          artist: 'Artist',
          albumArtist: 'Artist',
          album: 'The Essential Collection',
          trackNumber: 1,
          discNumber: 1,
          date: '',
          year: null,
          relativePath: 'Artist/The Essential Collection/01 - Song.mp3',
          path: '/music/Artist/The Essential Collection/01 - Song.mp3',
          fileSize: 1,
          mtimeMs: 1,
          scanMetadata: true,
          scanDurations: false,
          coverArtPath: '',
          cachedCoverPath: '',
          cachedCoverFormat: '',
          hasEmbeddedCover: false,
          duration: null,
          audioQuality: null,
        },
      ],
      albums: [
        {
          id: 'album-collection-name',
          title: 'The Essential Collection',
          artist: 'Artist',
          albumArtist: 'Artist',
          date: '',
          year: null,
          collectionName: "The Essential Collection",
          coverTrackId: '',
          trackIds: ['track-collection-name'],
          audioQuality: null,
        },
      ],
    });
    const db = new DatabaseSync(databasePath);
    try {
      db.prepare("UPDATE metadata SET value = '2' WHERE key = 'collectionInferenceVersion'").run();
      db.exec('PRAGMA user_version = 0');
    } finally {
      db.close();
    }

    const page = await readLibraryAlbumPage(databasePath, { search: 'essential', limit: 50, offset: 0 });

    assert.equal(page.albums.length, 1);
    assert.equal(page.albums[0].collectionName, '');
  } finally {
    rmSync(databasePath, { force: true });
  }
});

test('library database migrations install stable paging indexes once', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-database-indexes-${Date.now()}.sqlite`);
  try {
    await writeLibraryDatabase(databasePath, {
      generatedAt: new Date().toISOString(),
      trackCount: 1,
      albumCount: 1,
      tracks: [{
        id: 'track-indexed',
        title: 'Indexed Song',
        artist: 'Indexed Artist',
        albumArtist: 'Indexed Artist',
        album: 'Indexed Album',
        trackNumber: 1,
        discNumber: 1,
        date: '2026',
        year: 2026,
        relativePath: 'Indexed Artist/Indexed Album/01 - Indexed Song.flac',
        path: '/music/Indexed Artist/Indexed Album/01 - Indexed Song.flac',
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
      }],
      albums: [{
        id: 'album-indexed',
        title: 'Indexed Album',
        artist: 'Indexed Artist',
        albumArtist: 'Indexed Artist',
        date: '2026',
        year: 2026,
        collectionName: 'Indexed Collection',
        coverTrackId: '',
        trackIds: ['track-indexed'],
        audioQuality: null,
      }],
    });

    const db = new DatabaseSync(databasePath);
    try {
      const userVersion = Object.values(db.prepare('PRAGMA user_version').get())[0];
      const indexes = new Set(db.prepare(`
        SELECT name FROM sqlite_master WHERE type = 'index'
      `).all().map((row) => row.name));
      const albumPlan = db.prepare(`
        EXPLAIN QUERY PLAN SELECT * FROM albums ORDER BY artist, title LIMIT 50
      `).all().map((row) => row.detail).join(' ');
      const trackPlan = db.prepare(`
        EXPLAIN QUERY PLAN
        SELECT * FROM tracks ORDER BY artist, album, disc_number, track_number, title LIMIT 50
      `).all().map((row) => row.detail).join(' ');
      const collectionPlan = db.prepare(`
        EXPLAIN QUERY PLAN
        SELECT * FROM albums
        WHERE collection_name = ? COLLATE NOCASE
        ORDER BY artist, title
      `).all('indexed collection').map((row) => row.detail).join(' ');

      const searchTables = new Set(db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type = 'table' AND name IN ('albums_fts', 'tracks_fts')
      `).all().map((row) => row.name));
      const albumSearchCount = db.prepare(`
        SELECT COUNT(*) AS count FROM albums_fts WHERE albums_fts MATCH ?
      `).get('{title artist} : "indexed"').count;
      const trackSearchCount = db.prepare(`
        SELECT COUNT(*) AS count FROM tracks_fts WHERE tracks_fts MATCH ?
      `).get('title : "indexed"').count;

      assert.equal(userVersion, 4);
      assert.ok(indexes.has('idx_albums_library_order'));
      assert.ok(indexes.has('idx_albums_collection_order'));
      assert.ok(indexes.has('idx_albums_recently_added'));
      assert.ok(indexes.has('idx_tracks_library_order'));
      assert.ok(indexes.has('idx_tracks_artist_albums'));
      assert.deepEqual(searchTables, new Set(['albums_fts', 'tracks_fts']));
      assert.equal(albumSearchCount, 1);
      assert.equal(trackSearchCount, 1);
      assert.doesNotMatch(albumPlan, /TEMP B-TREE/u);
      assert.doesNotMatch(trackPlan, /TEMP B-TREE/u);
      assert.match(collectionPlan, /idx_albums_collection_order/u);
      assert.doesNotMatch(collectionPlan, /TEMP B-TREE/u);
    } finally {
      db.close();
    }
  } finally {
    rmSync(databasePath, { force: true });
  }
});

test('FTS search preserves normalized album and title-only track matching', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-fts-search-${Date.now()}.sqlite`);
  try {
    await writeLibraryDatabase(databasePath, {
      generatedAt: new Date().toISOString(),
      trackCount: 2,
      albumCount: 2,
      tracks: [
        createDatabaseTrack({
          id: 'track-beyonce',
          title: "Beyoncé's Déjà-Vu Anthem",
          artist: 'Search Artist',
          album: 'First Search Album',
          relativePath: "Search Artist/First Search Album/01 - Beyoncé's Déjà-Vu Anthem.flac",
        }),
        createDatabaseTrack({
          id: 'track-album-only',
          title: 'Unrelated Song',
          artist: 'Search Artist',
          album: 'Beyonce Deja Collection',
          relativePath: 'Search Artist/Beyonce Deja Collection/01 - Unrelated Song.flac',
        }),
      ],
      albums: [
        createDatabaseAlbum({
          id: 'album-beyonce',
          title: "For Lover's Only",
          collectionName: 'Old Collection',
          trackIds: ['track-beyonce'],
        }),
        createDatabaseAlbum({
          id: 'album-other',
          title: 'Different Album',
          trackIds: ['track-album-only'],
        }),
      ],
    });

    const albums = await readLibraryAlbumPage(databasePath, {
      search: 'for lovers only',
      limit: 50,
      offset: 0,
      includeTracks: false,
    });
    const tracks = await readTrackPage(databasePath, {
      search: 'beyonce deja',
      limit: 50,
      offset: 0,
    });
    const shortSearch = await readTrackPage(databasePath, {
      search: 'un',
      limit: 50,
      offset: 0,
    });
    await renameCollectionInDatabase(databasePath, 'Old Collection', 'Renamed Archive');
    const renamedCollections = await readCollectionFolders(databasePath, { search: 'renamed archive' });

    assert.deepEqual(albums.albums.map((album) => album.id), ['album-beyonce']);
    assert.deepEqual(tracks.tracks.map((track) => track.id), ['track-beyonce']);
    assert.deepEqual(shortSearch.tracks.map((track) => track.id), ['track-album-only']);
    assert.deepEqual(renamedCollections.folders.map((folder) => folder.name), ['Renamed Archive']);
  } finally {
    rmSync(databasePath, { force: true });
  }
});

test('readCollectionFolderAlbumPage sorts collection volumes naturally', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-natural-sort-${Date.now()}.sqlite`);
  try {
    await writeLibraryDatabase(databasePath, {
      generatedAt: new Date().toISOString(),
      trackCount: 0,
      albumCount: 3,
      tracks: [],
      albums: [
        createCollectionAlbum('album-10', 'Vol 10'),
        createCollectionAlbum('album-1', 'Vol 1'),
        createCollectionAlbum('album-2', 'Vol 2'),
      ],
    });

    const page = await readCollectionFolderAlbumPage(databasePath, 'Mega Collection', { limit: 50, offset: 0 });

    assert.deepEqual(page.albums.map((album) => album.title), ['Vol 1', 'Vol 2', 'Vol 10']);
  } finally {
    rmSync(databasePath, { force: true });
  }
});

test('readCollectionFolders exposes the first sorted album cover separately from fallback covers', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-collection-folder-cover-${Date.now()}.sqlite`);
  try {
    await writeLibraryDatabase(databasePath, {
      generatedAt: new Date().toISOString(),
      trackCount: 2,
      albumCount: 2,
      tracks: [
        createDatabaseTrack({
          id: 'track-first',
          title: 'First Track',
          artist: 'Search Artist',
          album: 'A First Album',
          relativePath: 'Search Artist/A First Album/01 - First.flac',
        }),
        {
          ...createDatabaseTrack({
            id: 'track-fallback',
            title: 'Fallback Track',
            artist: 'Search Artist',
            album: 'B Fallback Album',
            relativePath: 'Search Artist/B Fallback Album/01 - Fallback.flac',
          }),
          hasEmbeddedCover: true,
        },
      ],
      albums: [
        createDatabaseAlbum({
          id: 'album-first',
          title: 'A First Album',
          collectionName: 'Cover Collection',
          trackIds: ['track-first'],
        }),
        createDatabaseAlbum({
          id: 'album-fallback',
          title: 'B Fallback Album',
          collectionName: 'Cover Collection',
          coverTrackId: 'track-fallback',
          trackIds: ['track-fallback'],
        }),
      ],
    });

    const folders = await readCollectionFolders(databasePath, {});
    const [folder] = folders.folders;

    assert.equal(folder.name, 'Cover Collection');
    assert.equal(folder.firstAlbumId, 'album-first');
    assert.equal(folder.firstAlbumCoverTrackId, '');
    assert.equal(folder.coverTrackId, 'track-fallback');
  } finally {
    rmSync(databasePath, { force: true });
  }
});

test('collection pages include albums from comma and tab delimited collection names', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-multi-collection-${Date.now()}.sqlite`);
  try {
    await writeLibraryDatabase(databasePath, {
      generatedAt: new Date().toISOString(),
      trackCount: 1,
      albumCount: 1,
      tracks: [
        createDatabaseTrack({
          id: 'track-multi-collection',
          title: 'Shared Song',
          artist: 'Search Artist',
          album: 'Shared Album',
          relativePath: 'Search Artist/Shared Album/01 - Shared Song.flac',
        }),
      ],
      albums: [
        createDatabaseAlbum({
          id: 'album-multi-collection',
          title: 'Shared Album',
          collectionName: '80s Hits, Road Trip\tFavorites, road trip',
          trackIds: ['track-multi-collection'],
        }),
      ],
    });

    const folders = await readCollectionFolders(databasePath, {});
    const roadTrip = await readCollectionFolderAlbumPage(databasePath, 'Road Trip', { limit: 50, offset: 0 });
    const favorites = await readCollectionFolderAlbumPage(databasePath, 'Favorites', { limit: 50, offset: 0 });

    assert.deepEqual(folders.folders.map((folder) => folder.name), ['80s Hits', 'Favorites', 'Road Trip']);
    assert.deepEqual(folders.folders.map((folder) => folder.albumCount), [1, 1, 1]);
    assert.deepEqual(roadTrip.albums.map((album) => album.id), ['album-multi-collection']);
    assert.deepEqual(favorites.albums.map((album) => album.collectionNames), [['80s Hits', 'Road Trip', 'Favorites']]);
  } finally {
    rmSync(databasePath, { force: true });
  }
});

test('renaming and deleting one collection preserves other album memberships', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-multi-collection-rename-${Date.now()}.sqlite`);
  try {
    await writeLibraryDatabase(databasePath, {
      generatedAt: new Date().toISOString(),
      trackCount: 0,
      albumCount: 1,
      tracks: [],
      albums: [
        createDatabaseAlbum({
          id: 'album-multi-rename',
          title: 'Shared Album',
          collectionName: 'Road Trip, Favorites',
          trackIds: [],
        }),
      ],
    });

    await renameCollectionInDatabase(databasePath, 'Road Trip', 'Car Mix');
    let folders = await readCollectionFolders(databasePath, {});
    assert.deepEqual(folders.folders.map((folder) => folder.name), ['Car Mix', 'Favorites']);

    const carMix = await readCollectionFolderAlbumPage(databasePath, 'Car Mix', { limit: 50, offset: 0 });
    assert.deepEqual(carMix.albums[0].collectionNames, ['Car Mix', 'Favorites']);

    await renameCollectionInDatabase(databasePath, 'Car Mix', '');
    folders = await readCollectionFolders(databasePath, {});
    assert.deepEqual(folders.folders.map((folder) => folder.name), ['Favorites']);
  } finally {
    rmSync(databasePath, { force: true });
  }
});

test('readLibraryAlbumPage searches album names with normalized tokens', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-album-search-${Date.now()}.sqlite`);
  try {
    await writeLibraryDatabase(databasePath, {
      generatedAt: new Date().toISOString(),
      trackCount: 0,
      albumCount: 2,
      tracks: [],
      albums: [
        {
          id: 'album-1',
          title: "For Lover's Only IV",
          artist: 'Various Artists',
          albumArtist: 'Various Artists',
          date: '',
          year: 2000,
          collectionName: '',
          coverTrackId: '',
          trackIds: [],
          audioQuality: null,
        },
        {
          id: 'album-2',
          title: 'Different Album',
          artist: 'Various Artists',
          albumArtist: 'Various Artists',
          date: '',
          year: 2000,
          collectionName: '',
          coverTrackId: '',
          trackIds: [],
          audioQuality: null,
        },
      ],
    });

    const page = await readLibraryAlbumPage(databasePath, { search: 'for lovers only', limit: 50, offset: 0 });

    assert.deepEqual(page.albums.map((album) => album.id), ['album-1']);
    assert.equal(page.page.total, 1);
  } finally {
    rmSync(databasePath, { force: true });
  }
});

test('readRecentlyAddedAlbumPage sorts albums by newest track mtime and caps the page', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-recently-added-${Date.now()}.sqlite`);
  try {
    const tracks = Array.from({ length: 55 }, (_, index) => createDatabaseTrack({
      id: `track-recent-${index}`,
      title: `Recent Track ${index}`,
      artist: 'Recent Artist',
      album: `Recent Album ${index}`,
      relativePath: `Recent Artist/Recent Album ${index}/01 - Song.flac`,
      mtimeMs: index + 1,
    }));
    await writeLibraryDatabase(databasePath, {
      generatedAt: new Date().toISOString(),
      trackCount: tracks.length,
      albumCount: tracks.length,
      tracks,
      albums: tracks.map((track, index) => createDatabaseAlbum({
        id: `album-recent-${index}`,
        title: `Recent Album ${index}`,
        trackIds: [track.id],
      })),
    });

    const page = await readRecentlyAddedAlbumPage(databasePath, { limit: 50 });
    const db = new DatabaseSync(databasePath);
    const recentPlan = db.prepare(`
      EXPLAIN QUERY PLAN
      SELECT * FROM albums
      ORDER BY latest_mtime_ms DESC, artist, title
      LIMIT 50
    `).all().map((row) => row.detail).join(' ');
    db.close();

    assert.equal(page.albums.length, 50);
    assert.deepEqual(page.albums.slice(0, 3).map((album) => album.id), [
      'album-recent-54',
      'album-recent-53',
      'album-recent-52',
    ]);
    assert.equal(page.albumCount, 55);
    assert.match(recentPlan, /idx_albums_recently_added/u);
    assert.doesNotMatch(recentPlan, /TEMP B-TREE/u);
  } finally {
    rmSync(databasePath, { force: true });
  }
});

test('random and recently added album card pages can stay lightweight', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-lightweight-card-pages-${Date.now()}.sqlite`);
  try {
    const tracks = [
      createDatabaseTrack({
        id: 'track-a',
        title: 'Track A',
        artist: 'Artist',
        album: 'Album A',
        relativePath: 'Artist/Album A/01 - Track A.flac',
        mtimeMs: 10,
      }),
      createDatabaseTrack({
        id: 'track-b',
        title: 'Track B',
        artist: 'Artist',
        album: 'Album B',
        relativePath: 'Artist/Album B/01 - Track B.flac',
        mtimeMs: 20,
      }),
    ];
    await writeLibraryDatabase(databasePath, {
      generatedAt: new Date().toISOString(),
      trackCount: tracks.length,
      albumCount: tracks.length,
      tracks,
      albums: [
        createDatabaseAlbum({ id: 'album-a', title: 'Album A', trackIds: ['track-a'] }),
        createDatabaseAlbum({ id: 'album-b', title: 'Album B', trackIds: ['track-b'] }),
      ],
    });

    const randomPage = await readRandomAlbumPage(databasePath, { limit: 50, includeTracks: false, includeCoverTracks: true });
    const recentPage = await readRecentlyAddedAlbumPage(databasePath, { limit: 50, includeTracks: false, includeCoverTracks: true });

    assert.equal(randomPage.lightweight, true);
    assert.equal(recentPage.lightweight, true);
    assert.equal(randomPage.tracks.length, 0);
    assert.equal(recentPage.tracks.length, 0);
    assert.deepEqual(recentPage.albums.map((album) => album.trackCount), [1, 1]);
  } finally {
    rmSync(databasePath, { force: true });
  }
});

test('readLibraryAlbumPage hydrates detail tracks from album_tracks when cached ids are stale', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-stale-album-track-ids-${Date.now()}.sqlite`);
  try {
    await writeLibraryDatabase(databasePath, {
      generatedAt: new Date().toISOString(),
      trackCount: 1,
      albumCount: 1,
      tracks: [
        {
          id: 'track-1',
          title: 'Merry Christmas, Happy Holidays',
          artist: '*NSYNC',
          albumArtist: '*NSYNC',
          album: 'The Winter Album',
          trackNumber: 1,
          discNumber: 1,
          date: '1998',
          year: 1998,
          relativePath: 'NSYNC/The Winter Album/01 - Merry Christmas Happy Holidays.flac',
          path: '/music/NSYNC/The Winter Album/01 - Merry Christmas Happy Holidays.flac',
          fileSize: 1,
          mtimeMs: 1,
          scanMetadata: true,
          scanDurations: false,
          coverArtPath: '',
          cachedCoverPath: '',
          cachedCoverFormat: '',
          hasEmbeddedCover: false,
          duration: 240,
          audioQuality: null,
        },
      ],
      albums: [
        {
          id: 'album-1',
          title: 'The Winter Album',
          artist: '*NSYNC',
          albumArtist: '*NSYNC',
          date: '1998',
          year: 1998,
          collectionName: '',
          coverTrackId: 'track-1',
          trackIds: ['track-1'],
          audioQuality: null,
        },
      ],
    });

    const db = new DatabaseSync(databasePath);
    try {
      db.prepare("UPDATE albums SET track_ids_json = '[]' WHERE id = ?").run('album-1');
    } finally {
      db.close();
    }

    const page = await readLibraryAlbumPage(databasePath, { albumIds: ['album-1'], limit: 50, offset: 0 });

    assert.deepEqual(page.albums[0].trackIds, ['track-1']);
    assert.deepEqual(page.tracks.map((track) => track.id), ['track-1']);
  } finally {
    rmSync(databasePath, { force: true });
  }
});

function createCollectionAlbum(id, title) {
  return {
    id,
    title,
    artist: 'Various Artists',
    albumArtist: 'Various Artists',
    date: '',
    year: null,
    collectionName: 'Mega Collection',
    coverTrackId: '',
    trackIds: [],
    audioQuality: null,
  };
}

function createDatabaseTrack({ id, title, artist, album, relativePath, mtimeMs = 1 }) {
  return {
    id,
    title,
    artist,
    albumArtist: artist,
    album,
    trackNumber: 1,
    discNumber: 1,
    date: '2026',
    year: 2026,
    relativePath,
    path: `/music/${relativePath}`,
    fileSize: 1,
    mtimeMs,
    scanMetadata: true,
    scanDurations: false,
    coverArtPath: '',
    cachedCoverPath: '',
    cachedCoverFormat: '',
    hasEmbeddedCover: false,
    duration: 180,
    audioQuality: null,
  };
}

function createDatabaseAlbum({ id, title, collectionName = '', coverTrackId = '', trackIds }) {
  return {
    id,
    title,
    artist: 'Search Artist',
    albumArtist: 'Search Artist',
    date: '2026',
    year: 2026,
    collectionName,
    coverTrackId,
    trackIds,
    audioQuality: null,
  };
}

test('createTrackId is deterministic', () => {
  const left = createTrackId('Artist/Album/01 - Song.mp3');
  const right = createTrackId('Artist/Album/01 - Song.mp3');

  assert.equal(left, right);
  assert.match(left, /^[a-f0-9]{16}$/u);
});

test('buildByteRange handles regular partial requests', () => {
  const range = buildByteRange('bytes=100-199', 1000);

  assert.deepEqual(range, {
    start: 100,
    end: 199,
    statusCode: 206,
    contentLength: 100,
    contentRange: 'bytes 100-199/1000',
  });
});

test('buildByteRange handles suffix requests', () => {
  const range = buildByteRange('bytes=-128', 1000);

  assert.equal(range.start, 872);
  assert.equal(range.end, 999);
  assert.equal(range.statusCode, 206);
});
