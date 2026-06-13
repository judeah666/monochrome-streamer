import test from 'node:test';
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
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
