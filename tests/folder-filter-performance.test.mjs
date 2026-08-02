import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const databaseSource = await readFile(new URL('../lib/library-db.mjs', import.meta.url), 'utf8');
const controllerSource = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');

test('album folder filtering starts from the indexed track folder lookup', () => {
  const helperStart = databaseSource.indexOf('function addAlbumFolderFilter');
  const helperEnd = databaseSource.indexOf('function addTrackFolderFilter', helperStart);
  const helperSource = databaseSource.slice(helperStart, helperEnd);

  assert.match(helperSource, /tracks INDEXED BY idx_tracks_folder_path/u);
  assert.match(helperSource, /albums\.id IN/u);
  assert.doesNotMatch(helperSource, /WHERE album_tracks\.album_id = albums\.id/u);
});

test('browse library ignores a response after its filter query becomes stale', () => {
  const loadStart = controllerSource.indexOf('async function loadLibraryPage');
  const loadEnd = controllerSource.indexOf('function getHomeAlbumsCacheKey', loadStart);
  const loadSource = controllerSource.slice(loadStart, loadEnd);

  assert.match(loadSource, /requestedQueryKey !== getLibraryPageQueryKey\(offset\)/u);
  assert.ok(
    loadSource.indexOf('requestedQueryKey !== getLibraryPageQueryKey(offset)')
      < loadSource.indexOf('hydrateLibrary({ title: state.title }, library)'),
  );
});
