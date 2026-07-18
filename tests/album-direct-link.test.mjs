import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sourcesPromise = Promise.all([
  readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/albums/AlbumDetail.jsx', import.meta.url), 'utf8'),
]);

test('direct album routes hydrate the requested album without falling back to home', async () => {
  const [controllerSource] = await sourcesPromise;

  assert.match(controllerSource, /if \(route\.view === 'album' && !state\.albumMap\.has\(route\.albumId\)\) \{\s*loadAlbumRoute\(route\.albumId\)/u);
  assert.match(controllerSource, /fetchJson\(`\/api\/albums\/\$\{encodeURIComponent\(albumId\)\}\/tracks`\)/u);
  assert.match(controllerSource, /const isAlbumView = state\.route\.view === 'album';/u);
  assert.doesNotMatch(controllerSource, /function renderAlbumDetail\(album\) \{\s*if \(!album\) \{\s*navigateToView/u);
});

test('album loading and missing states remain inside the album view', async () => {
  const [, albumDetailSource] = await sourcesPromise;

  assert.match(albumDetailSource, /loading \? 'Loading album\.\.\.'/u);
  assert.match(albumDetailSource, /error \|\| 'Album was not found\.'/u);
  assert.match(albumDetailSource, /Back to library/u);
});

test('opening an album recovers when its hash is already in the address bar', async () => {
  const [controllerSource] = await sourcesPromise;
  const start = controllerSource.indexOf('function openAlbum(albumId)');
  const end = controllerSource.indexOf('async function shareAlbumLink', start);
  const block = controllerSource.slice(start, end);

  assert.match(block, /if \(window\.location\.hash === nextHash\)/u);
  assert.match(block, /updateRouteFromLocation\(\)/u);
  assert.match(block, /render\(\)/u);
});
