import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { stat } from 'node:fs/promises';
import sharp from 'sharp';
import { BACKGROUND_PATTERNS, applyBackgroundPattern } from '../src/controller/backgroundPatterns.js';
import { normalizeSettings } from '../src/controller/settingsStore.js';
import { DEFAULT_SETTINGS } from '../src/controller/constants.js';

test('background settings default to blue audio doodles and reject unknown or imported URLs', () => {
  assert.equal(DEFAULT_SETTINGS.backgroundPattern, 'audio-doodles');
  assert.equal(({ ...DEFAULT_SETTINGS, ...normalizeSettings({}) }).backgroundPattern, 'audio-doodles');
  for (const value of [undefined, null, '', 'old-pattern', 'https://example.com/a.png', {}]) {
    assert.equal(normalizeSettings({ backgroundPattern: value }).backgroundPattern, 'audio-doodles');
  }
  for (const pattern of BACKGROUND_PATTERNS) {
    assert.equal(normalizeSettings({ backgroundPattern: pattern.value }).backgroundPattern, pattern.value);
  }
});

test('switching patterns and clearing them updates only background state; reapplying is a no-op', () => {
  const properties = new Map();
  let mutations = 0;
  let enabled = false;
  const body = {
    dataset: {},
    classList: { toggle(name, value) { enabled = value; mutations++; } },
    style: {
      setProperty(name, value) { properties.set(name, value); mutations++; },
      removeProperty(name) { properties.delete(name); mutations++; },
    },
  };
  for (const pattern of BACKGROUND_PATTERNS.slice(1)) {
    applyBackgroundPattern(body, pattern.value);
    assert.equal(enabled, true);
    assert.ok(properties.get('--background-pattern').includes(pattern.image));
    const before = mutations;
    applyBackgroundPattern(body, pattern.value);
    assert.equal(mutations, before);
  }
  applyBackgroundPattern(body, 'none');
  assert.equal(enabled, false);
  assert.equal(properties.has('--background-pattern'), false);
});

test('bundled patterns stay within small tile and download budgets', async () => {
  assert.equal(BACKGROUND_PATTERNS.length, 7);
  for (const pattern of BACKGROUND_PATTERNS.slice(1)) {
    const file = new URL('../src' + pattern.image, import.meta.url);
    assert.ok((await stat(file)).size < 80 * 1024);
    const metadata = await sharp(fileURLToPath(file)).metadata();
    assert.ok(metadata.width <= 500 && metadata.height <= 400);
  }
});

// Exercise the production handler over HTTP, including its /assets directory mapping.
test('every pattern URL serves a decodable WebP through the static handler', async () => {
  const { readFile, access } = await import('node:fs/promises');
  const { createReadStream, existsSync } = await import('node:fs');
  const { createServer } = await import('node:http');
  const path = await import('node:path');
  const { runInNewContext } = await import('node:vm');
  const { getContentType } = await import('../lib/library.mjs');
  const { getStaticAssetCacheControl } = await import('../src/server/staticCachePolicy.js');
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const start = source.indexOf('async function serveStaticAsset(');
  const end = source.indexOf('async function renderVersionedStylesheet(', start);
  assert.ok(start >= 0 && end > start);
  const handler = runInNewContext(source.slice(start, end) + '; serveStaticAsset;', {
    path, existsSync, createReadStream, getContentType, getStaticAssetCacheControl,
    publicDir: fileURLToPath(new URL('../public', import.meta.url)),
    assetsDir: fileURLToPath(new URL('../src/assets', import.meta.url)),
    getSecurityHeaders: () => ({}),
    respondJson(response, status, value) { response.writeHead(status); response.end(JSON.stringify(value)); },
    console,
  });
  const server = createServer((request, response) => handler(request.url, response));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    for (const pattern of BACKGROUND_PATTERNS.slice(1)) {
      const response = await fetch('http://127.0.0.1:' + server.address().port + pattern.image);
      assert.equal(response.status, 200, pattern.image);
      assert.equal(response.headers.get('content-type'), 'image/webp');
      const bytes = Buffer.from(await response.arrayBuffer());
      assert.equal((await sharp(bytes).metadata()).format, 'webp');
    }
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
