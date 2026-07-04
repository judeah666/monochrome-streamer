import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('docker entrypoint defaults to smart auto chown instead of recursive chown on every start', async () => {
  const dockerfile = await readFile(new URL('../Dockerfile', import.meta.url), 'utf8');
  const entrypoint = await readFile(new URL('../docker-entrypoint.sh', import.meta.url), 'utf8');
  const envExample = await readFile(new URL('../.env.example', import.meta.url), 'utf8');

  assert.match(dockerfile, /ENV CHOWN_DATA=auto/u);
  assert.match(envExample, /CHOWN_DATA=auto/u);
  assert.match(entrypoint, /chown_data_mode="\$\{CHOWN_DATA:-auto\}"/u);
  assert.match(entrypoint, /can_write_as_target/u);
  assert.match(entrypoint, /CHOWN_DATA=true: recursively fixing data ownership/u);
  assert.match(entrypoint, /CHOWN_DATA=false: skipping data ownership check/u);
  assert.match(entrypoint, /CHOWN_DATA=auto: data paths already writable/u);
});

test('startup server paths use timing logs, cached summary, and background cover optimization', async () => {
  const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');

  assert.match(server, /const serverBootStartedAt = performance\.now\(\)/u);
  assert.match(server, /function logStartupTiming/u);
  assert.match(server, /function getLibrarySummary/u);
  assert.match(server, /let librarySummaryCache = null/u);
  assert.match(server, /const librarySummary = await getLibrarySummary\(\)/u);
  assert.match(server, /scheduleAlbumCoverCache\(library\)/u);
  assert.match(server, /updateTrackCoverCacheRecords\(libraryDatabasePath, library\.tracks \|\| \[\]\)/u);
  assert.doesNotMatch(server, /await populateAlbumCoverCache\(library\);\s*return library;/u);
});

test('cover optimization failures are persisted across restarts', async () => {
  const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');

  assert.match(server, /await loadCoverOptimizationFailures\(\)/u);
  assert.match(server, /optimization-failures\.json/u);
  assert.match(server, /persistCoverOptimizationFailures/u);
  assert.match(server, /coverOptimizationFailures\.add\(failureKey\)/u);
});

test('initial client boot defers home album fetches unless the route is home', async () => {
  const source = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');
  const initStart = source.indexOf('async function init()');
  const initEnd = source.indexOf('async function initLoginRoute', initStart);
  const initBlock = source.slice(initStart, initEnd);

  assert.match(initBlock, /if \(state\.route\.view === 'home' && !state\.searchTerm\)/u);
  assert.match(initBlock, /loadHomeAlbums\(\)/u);
  assert.match(initBlock, /loadRecentlyAddedAlbums\(\)/u);
});
