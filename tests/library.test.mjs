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
  readLibraryAlbumPage,
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
