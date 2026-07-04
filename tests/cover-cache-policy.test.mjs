import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  getCoverOptimizationFailureKey,
  getCoverVersion,
} from '../src/server/coverCachePolicy.js';

function statFixture(entries) {
  return (filePath) => {
    const stats = entries[filePath];
    if (!stats) throw new Error(`Missing stat fixture for ${filePath}`);
    return stats;
  };
}

test('cover versions are stable across scan timestamps and change with source freshness', () => {
  const track = {
    coverArtPath: '/music/cover.jpg',
    fileSize: 100,
    mtimeMs: 10,
    hasEmbeddedCover: true,
  };
  const firstStat = statFixture({
    '/music/cover.jpg': { size: 12345, mtimeMs: 1111 },
  });
  const changedStat = statFixture({
    '/music/cover.jpg': { size: 12345, mtimeMs: 2222 },
  });

  assert.equal(getCoverVersion(track, { statFile: firstStat }), 'file-9ix-uv');
  assert.equal(getCoverVersion(track, { statFile: firstStat }), 'file-9ix-uv');
  assert.equal(getCoverVersion(track, { statFile: changedStat }), 'file-9ix-1pq');
});

test('embedded and cached cover versions use stable source fingerprints', () => {
  const embeddedTrack = {
    fileSize: 987654,
    mtimeMs: 123456,
    hasEmbeddedCover: true,
  };
  const cachedTrack = {
    cachedCoverPath: '/cache/album.webp',
  };
  const statFile = statFixture({
    '/cache/album.webp': { size: 321, mtimeMs: 654 },
  });

  assert.equal(getCoverVersion(embeddedTrack, { statFile }), 'embedded-l62u-2n9c');
  assert.equal(getCoverVersion(cachedTrack, { statFile }), 'cache-8x-i6');
});

test('cover optimization failure keys retry when source freshness changes', () => {
  const first = getCoverOptimizationFailureKey('embedded-cover', '/music/song.flac:1000', 'abc');
  const repeated = getCoverOptimizationFailureKey('embedded-cover', '/music/song.flac:1000', 'abc');
  const changed = getCoverOptimizationFailureKey('embedded-cover', '/music/song.flac:1000', 'def');

  assert.equal(first, repeated);
  assert.notEqual(first, changed);
});

test('cover source no longer uses scan-wide generatedAt for cache busting', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const albumGrid = await readFile(new URL('../src/components/albums/AlbumGrid.jsx', import.meta.url), 'utf8');
  const appController = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');
  const pollStart = appController.indexOf('async function pollLibraryScan()');
  const pollEnd = appController.indexOf('function applyPlaybackQualityChange()', pollStart);
  const pollBlock = appController.slice(pollStart, pollEnd);

  assert.doesNotMatch(source, /createAlbumCoverUrl\([^\n]*library\.generatedAt/u);
  assert.doesNotMatch(source, /createTrackCoverUrl\([^\n]*library\.generatedAt/u);
  assert.match(source, /getFastCoverVersion\(coverTrack/u);
  assert.doesNotMatch(source, /function hasTrackCover\(/u);
  assert.match(source, /const coverOptimizationFailures = new Set\(\)/u);
  assert.match(source, /writeOptimizedWebpCoverOnce/u);
  assert.match(albumGrid, /key=\{album\.id\}/u);
  assert.doesNotMatch(pollBlock, /loadHomeAlbums|loadRecentlyAddedAlbums|setAmbientCover/u);
  assert.doesNotMatch(appController, /setAmbientCoverFromAlbums\(library\.albums \|\| \[\], \{ force: true \}\)/u);
});

test('track-number label runtime paths stay removed', async () => {
  const runtimeSources = await Promise.all([
    readFile(new URL('../server.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../lib/library.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/controller/albumViewPresenter.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/library/TrackList.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/editors/EditorModals.jsx', import.meta.url), 'utf8'),
  ]);

  for (const source of runtimeSources) {
    assert.doesNotMatch(source, /trackNumberLabel/u);
  }
});
