import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('album card endpoints request lightweight payloads and cache recent albums', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const homeRouteStart = source.indexOf("if (url.pathname === '/api/home-albums')");
  const recentRouteStart = source.indexOf("if (url.pathname === '/api/recently-added-albums')");
  const tracksRouteStart = source.indexOf("if (url.pathname === '/api/tracks')", recentRouteStart);
  const homeRoute = source.slice(homeRouteStart, recentRouteStart);
  const recentRoute = source.slice(recentRouteStart, tracksRouteStart);

  assert.match(homeRoute, /includeTracks:\s*false/u);
  assert.match(homeRoute, /includeCoverTracks:\s*true/u);
  assert.match(recentRoute, /includeTracks:\s*false/u);
  assert.match(recentRoute, /includeCoverTracks:\s*true/u);
  assert.match(recentRoute, /recentlyAddedAlbumPageCache\.get/u);
  assert.match(recentRoute, /setRecentlyAddedAlbumCache/u);
});

test('lightweight library payloads omit album track id lists', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const payloadStart = source.indexOf('async function createLibraryPayload');
  const payloadEnd = source.indexOf('function getDeletedAlbumIdSet', payloadStart);
  const payloadSource = source.slice(payloadStart, payloadEnd);

  assert.match(payloadSource, /const isLightweight = Boolean\(library\.lightweight\)/u);
  assert.match(payloadSource, /delete albumPayload\.trackIds/u);
  assert.doesNotMatch(payloadSource, /existsSync/u);
});

test('album cover streaming uses the lightweight cover lookup path', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const streamStart = source.indexOf('async function streamAlbumCover');
  const streamEnd = source.indexOf('async function streamCover', streamStart);
  const streamSource = source.slice(streamStart, streamEnd);

  assert.match(streamSource, /getAlbumCoverEntry\(albumId\)/u);
  assert.match(streamSource, /readLibraryAlbumPage\(libraryDatabasePath/u);
  assert.doesNotMatch(streamSource, /ensureLibrary\(\)/u);
});
