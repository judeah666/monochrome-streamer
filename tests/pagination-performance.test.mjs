import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sourcesPromise = Promise.all([
  readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8'),
  readFile(new URL('../server.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../lib/library-db.mjs', import.meta.url), 'utf8'),
]);

test('later album artist and track pages send their already-known total', async () => {
  const [controllerSource, serverSource, databaseSource] = await sourcesPromise;

  assert.match(controllerSource, /appendKnownPageTotal\(params, offset, state\.libraryPage\)/u);
  assert.match(controllerSource, /appendKnownPageTotal\(params, offset, state\.artistPage\)/u);
  assert.match(controllerSource, /appendKnownPageTotal\(params, offset, state\.trackPage\)/u);
  assert.match(serverSource, /knownTotal: url\.searchParams\.get\('knownTotal'\)/u);
  assert.match(databaseSource, /const knownTotal = normalizeKnownPageTotal\(options\.knownTotal\)/u);
  assert.match(databaseSource, /const totalAlbums = knownTotal\s*\?\?/u);
  assert.match(databaseSource, /const totalTracks = knownTotal\s*\?\?/u);
});

test('adjacent page prefetch waits for idle time and respects cache invalidation', async () => {
  const [controllerSource] = await sourcesPromise;

  const start = controllerSource.indexOf('function scheduleIdlePagePrefetch');
  const end = controllerSource.indexOf('function scheduleLibraryPagePrefetch', start);
  const block = controllerSource.slice(start, end);
  assert.match(block, /window\.requestIdleCallback\(run, \{ timeout: 1000 \}\)/u);
  assert.match(block, /cacheGeneration !== getCurrentGeneration\(\)/u);
  assert.match(block, /window\.setTimeout\(run, 250\)/u);
});

test('an arriving album page clears loading before its single result render', async () => {
  const [controllerSource] = await sourcesPromise;
  const start = controllerSource.indexOf('async function loadLibraryPage');
  const end = controllerSource.indexOf('function getHomeAlbumsCacheKey', start);
  const block = controllerSource.slice(start, end);
  const clearIndex = block.indexOf("state.libraryPageLoadingKey = ''");
  const resultRenderIndex = block.indexOf('render();', clearIndex);
  const prefetchIndex = block.indexOf('scheduleLibraryPagePrefetch', resultRenderIndex);

  assert.ok(clearIndex > -1);
  assert.ok(resultRenderIndex > clearIndex);
  assert.ok(prefetchIndex > resultRenderIndex);
});
