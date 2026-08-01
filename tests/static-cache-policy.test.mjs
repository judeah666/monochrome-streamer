import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  getStaticAssetCacheControl,
  isImmutableViteAsset,
} from '../src/server/staticCachePolicy.js';

test('content-hashed Vite chunks and assets use immutable browser caching', () => {
  const immutable = 'public, max-age=31536000, immutable';

  assert.equal(isImmutableViteAsset('/react/chunks/appController-BbQl56jk.js'), true);
  assert.equal(isImmutableViteAsset('/react/assets/hi-res-quality-DGjg3BPj.svg'), true);
  assert.equal(
    getStaticAssetCacheControl('/react/chunks/appController-BbQl56jk.js', '.js'),
    immutable,
  );
  assert.equal(
    getStaticAssetCacheControl('/react/assets/hi-res-quality-DGjg3BPj.svg', '.svg'),
    immutable,
  );
});

test('entry bundles, HTML, and styles remain uncached for immediate deployments', () => {
  assert.equal(getStaticAssetCacheControl('/react/app.js', '.js'), 'no-store');
  assert.equal(getStaticAssetCacheControl('/react/admin.js', '.js'), 'no-store');
  assert.equal(getStaticAssetCacheControl('/index.html', '.html'), 'no-store');
  assert.equal(getStaticAssetCacheControl('/styles.css', '.css'), 'no-store');
  assert.equal(getStaticAssetCacheControl('/tailwind.css', '.css'), 'no-store');
  assert.equal(getStaticAssetCacheControl('/react/chunks/appController.js', '.js'), 'no-store');
});

test('unhashed static assets retain the existing short cache policy', () => {
  assert.equal(isImmutableViteAsset('/assets/icons/shuffle.svg'), false);
  assert.equal(
    getStaticAssetCacheControl('/assets/icons/shuffle.svg', '.svg'),
    'public, max-age=300',
  );
});

test('the static file server applies the shared cache policy', async () => {
  const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');

  assert.match(
    server,
    /getStaticAssetCacheControl\(normalizedPath, path\.extname\(resolvedPath\)\)/u,
  );
});
