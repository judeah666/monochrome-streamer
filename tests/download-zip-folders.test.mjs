import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appendDiscFolder,
  createZipFolderResolver,
  normalizeDownloadDiscNumber,
} from '../src/controller/downloadZipFolders.js';

test('normalizeDownloadDiscNumber falls back to disc 1 for missing or invalid values', () => {
  assert.equal(normalizeDownloadDiscNumber('2'), 2);
  assert.equal(normalizeDownloadDiscNumber(3), 3);
  assert.equal(normalizeDownloadDiscNumber(''), 1);
  assert.equal(normalizeDownloadDiscNumber('side a'), 1);
  assert.equal(normalizeDownloadDiscNumber(0), 1);
});

test('appendDiscFolder adds CD folders below the existing zip base folder', () => {
  assert.equal(appendDiscFolder('Artist/2024 - Album', 2), 'Artist/2024 - Album/CD2');
  assert.equal(appendDiscFolder('', 1), 'CD1');
  assert.equal(appendDiscFolder('Artist/Album/', '3'), 'Artist/Album/CD3');
});

test('createZipFolderResolver leaves single-disc albums unchanged', () => {
  const tracks = [
    { id: 'one', albumId: 'album-1', discNumber: 1 },
    { id: 'two', albumId: 'album-1', discNumber: 1 },
  ];
  const resolveFolder = createZipFolderResolver(tracks, {
    getBaseFolder: () => 'Artist/Album',
  });

  assert.equal(resolveFolder(tracks[0]), 'Artist/Album');
  assert.equal(resolveFolder(tracks[1]), 'Artist/Album');
});

test('createZipFolderResolver creates CD folders for multi-disc albums', () => {
  const tracks = [
    { id: 'one', albumId: 'album-1', discNumber: 1 },
    { id: 'two', albumId: 'album-1', discNumber: 2 },
  ];
  const resolveFolder = createZipFolderResolver(tracks, {
    getBaseFolder: () => 'Artist/Album',
  });

  assert.equal(resolveFolder(tracks[0]), 'Artist/Album/CD1');
  assert.equal(resolveFolder(tracks[1]), 'Artist/Album/CD2');
});

test('createZipFolderResolver handles each base folder independently', () => {
  const tracks = [
    { id: 'album-a-disc-1', albumId: 'album-a', discNumber: 1 },
    { id: 'album-a-disc-2', albumId: 'album-a', discNumber: 2 },
    { id: 'album-b-disc-1', albumId: 'album-b', discNumber: 1 },
  ];
  const resolveFolder = createZipFolderResolver(tracks, {
    getBaseFolder: (track) => track.albumId === 'album-a' ? 'Artist/A' : 'Artist/B',
  });

  assert.equal(resolveFolder(tracks[0]), 'Artist/A/CD1');
  assert.equal(resolveFolder(tracks[1]), 'Artist/A/CD2');
  assert.equal(resolveFolder(tracks[2]), 'Artist/B');
});
