import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  mergeDiscoveredLibraryFolders,
  normalizeLibraryFolderList,
} from '../src/shared/libraryFolders.js';

test('normalizeLibraryFolderList dedupes, sorts, and rejects unsafe folder names', () => {
  assert.deepEqual(normalizeLibraryFolderList([
    'Pinoy Music',
    'English Music',
    'Pinoy Music',
    '../escape',
    'nested/../escape',
    { name: 'Asian Music' },
  ]), ['Asian Music', 'English Music', 'Pinoy Music']);
});

test('mergeDiscoveredLibraryFolders records a first known baseline without selecting everything', () => {
  const result = mergeDiscoveredLibraryFolders({
    available: ['Asian Music', 'English Music', 'Pinoy Music'],
    selected: ['English Music'],
  });

  assert.deepEqual(result.added, []);
  assert.deepEqual(result.merged, ['English Music']);
  assert.deepEqual(result.knownNext, ['Asian Music', 'English Music', 'Pinoy Music']);
  assert.equal(result.knownChanged, true);
});

test('mergeDiscoveredLibraryFolders adds only folders missing from the known baseline', () => {
  const result = mergeDiscoveredLibraryFolders({
    available: ['Asian Music', 'English Music', 'Pinoy Music'],
    selected: ['English Music'],
    known: ['Asian Music', 'English Music'],
  });

  assert.deepEqual(result.added, ['Pinoy Music']);
  assert.deepEqual(result.merged, ['English Music', 'Pinoy Music']);
});

test('manual rescan is forced while startup scan stays incremental', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');

  assert.match(source, /async function startLibraryScan\(\{ forceMetadataRefresh = true \} = \{\}\)/u);
  assert.match(source, /refreshLibrary\(selectedFolders, \{ forceMetadataRefresh \}\)/u);
  assert.match(source, /startLibraryScan\(\{ forceMetadataRefresh: false \}\)/u);
  assert.match(source, /const selectedFolders = await getSelectedLibraryFolders\(\)/u);
  assert.doesNotMatch(source, /resolveSelectedLibraryFoldersForScan/u);
});

test('main and admin refresh folders merge and save newly discovered folders', async () => {
  const appSource = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');
  const adminSource = await readFile(new URL('../src/react/admin.jsx', import.meta.url), 'utf8');

  assert.match(appSource, /mergeDiscoveredLibraryFolders\(folders\)/u);
  assert.match(appSource, /Added \$\{resolved\.added\.length\} new folder/u);
  assert.match(appSource, /method: 'POST'[\s\S]*folders: resolved\.merged[\s\S]*known: resolved\.knownNext/u);
  assert.match(adminSource, /refreshFoldersAndIncludeNew/u);
  assert.match(adminSource, /mergeDiscoveredLibraryFolders\(data\)/u);
  assert.match(adminSource, /method: 'POST'[\s\S]*folders: resolved\.merged[\s\S]*known: resolved\.knownNext/u);
});
