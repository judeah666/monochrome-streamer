import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { mergeTargetedLibraryScan } from '../lib/library.mjs';
import { resolveLibraryScanRequest } from '../src/server/libraryScanPolicy.js';

function track(id, folder, title = id) {
  return {
    id,
    title,
    artist: 'Artist',
    albumArtist: 'Artist',
    album: `${folder} Album`,
    relativePath: `${folder}/Album/${id}.flac`,
    trackNumber: 1,
    discNumber: 1,
    audioQuality: {},
  };
}

test('scan modes distinguish incremental, targeted, and full metadata work', () => {
  const selected = ['English Music', 'Pinoy Music'];

  assert.deepEqual(resolveLibraryScanRequest({ mode: 'changes' }, selected), {
    mode: 'changes',
    selectedFolders: selected,
    scanFolders: selected,
    forceMetadataRefresh: false,
    targeted: false,
  });
  assert.deepEqual(resolveLibraryScanRequest({ mode: 'folders', folders: ['Pinoy Music'] }, selected), {
    mode: 'folders',
    selectedFolders: selected,
    scanFolders: ['Pinoy Music'],
    forceMetadataRefresh: true,
    targeted: true,
  });
  assert.equal(resolveLibraryScanRequest({ mode: 'full' }, selected).forceMetadataRefresh, true);
});

test('targeted scans reject folders outside the saved selection', () => {
  assert.throws(
    () => resolveLibraryScanRequest({ mode: 'folders', folders: ['Not Selected'] }, ['Selected']),
    /must already be selected/u,
  );
  assert.throws(
    () => resolveLibraryScanRequest({ mode: 'folders', folders: [] }, ['Selected']),
    /Choose at least one/u,
  );
  assert.throws(
    () => resolveLibraryScanRequest(
      { mode: 'folders', folders: ['Selected'] },
      ['Selected'],
      [],
    ),
    /not currently available/u,
  );
});

test('targeted scan merge replaces only its folder and preserves other selected folders', () => {
  const oldEnglish = track('old-english', 'English Music');
  const oldPinoy = track('old-pinoy', 'Pinoy Music');
  const removedFolder = track('removed', 'Removed Music');
  const newPinoy = track('new-pinoy', 'Pinoy Music');
  const cachedLibrary = {
    albums: [],
    tracks: [oldEnglish, oldPinoy, removedFolder],
  };
  const scannedLibrary = {
    generatedAt: '2026-07-30T00:00:00.000Z',
    tracks: [newPinoy],
  };

  const merged = mergeTargetedLibraryScan(cachedLibrary, scannedLibrary, {
    selectedFolders: ['English Music', 'Pinoy Music'],
    scannedFolders: ['Pinoy Music'],
  });

  assert.deepEqual(merged.tracks.map((item) => item.id).sort(), ['new-pinoy', 'old-english']);
  assert.equal(merged.trackCount, 2);
  assert.equal(merged.albumCount, 2);
  assert.equal(merged.generatedAt, scannedLibrary.generatedAt);
});

test('an empty targeted result removes deleted tracks only from that folder', () => {
  const merged = mergeTargetedLibraryScan({
    albums: [],
    tracks: [track('keep', 'English Music'), track('delete', 'Pinoy Music')],
  }, {
    generatedAt: '2026-07-30T00:00:00.000Z',
    tracks: [],
  }, {
    selectedFolders: ['English Music', 'Pinoy Music'],
    scannedFolders: ['Pinoy Music'],
  });

  assert.deepEqual(merged.tracks.map((item) => item.id), ['keep']);
});

test('settings expose incremental, one-folder, and explicit full scan controls', async () => {
  const adminSource = await readFile(new URL('../src/react/admin.jsx', import.meta.url), 'utf8');
  const settingsSource = await readFile(new URL('../src/components/settings/RemainingSettings.jsx', import.meta.url), 'utf8');
  const controllerSource = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');

  for (const source of [adminSource, settingsSource]) {
    assert.match(source, /Scan Changes/u);
    assert.match(source, /Scan Folder/u);
    assert.match(source, /Full Rescan/u);
  }
  assert.match(adminSource, /mode: scanMode, folders: scanFolders/u);
  assert.match(controllerSource, /JSON\.stringify\(scanRequest\)/u);
  assert.match(controllerSource, /saveLibraryFolders\('folders', \[folder\]\)/u);
});
