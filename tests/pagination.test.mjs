import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  buildPaginationItems,
  getPaginationOffset,
  getPaginationState,
} from '../src/utils/pagination.js';

async function loadLibraryPager() {
  const entryUrl = new URL('../src/components/library/LibraryControls.jsx', import.meta.url);
  const result = await build({
    entryPoints: [fileURLToPath(entryUrl)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    external: ['react', 'react-dom'],
  });
  const output = result.outputFiles[0];
  assert.ok(output, 'Expected bundled library pager output');
  const bundleDir = fileURLToPath(new URL('../node_modules/.cache/monochrome-streamer-tests', import.meta.url));
  await mkdir(bundleDir, { recursive: true });
  const bundlePath = path.join(bundleDir, `pagination-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`);
  await writeFile(bundlePath, output.text, 'utf8');
  return import(pathToFileURL(bundlePath).href);
}

test('pagination items show nearby pages with first, last, and ellipses', () => {
  assert.deepEqual(buildPaginationItems(1, 4), [1, 2, 3, 4]);
  assert.deepEqual(buildPaginationItems(2, 20), [1, 2, 3, 'ellipsis-end', 20]);
  assert.deepEqual(buildPaginationItems(10, 20), [1, 'ellipsis-start', 10, 'ellipsis-end', 20]);
  assert.deepEqual(buildPaginationItems(19, 20), [1, 'ellipsis-start', 18, 19, 20]);
});

test('pagination state and direct page offsets stay bounded', () => {
  assert.deepEqual(getPaginationState({ total: 1929, limit: 50, offset: 50 }), {
    currentPage: 2,
    totalPages: 39,
    items: [1, 2, 3, 'ellipsis-end', 39],
  });
  const page = { total: 1929, limit: 50, offset: 50 };
  assert.equal(getPaginationOffset(page, 3), 100);
  assert.equal(getPaginationOffset(page, 'previous'), 0);
  assert.equal(getPaginationOffset(page, 'next'), 100);
  assert.equal(getPaginationOffset(page, 999), 1900);
});

test('library pager renders centered rounded page navigation', async () => {
  const { LibraryPager } = await loadLibraryPager();
  const html = renderToStaticMarkup(React.createElement(LibraryPager, {
    page: { total: 1929, limit: 50, offset: 50, hasPrevious: true, hasNext: true },
    total: 1929,
    itemLabel: 'album',
    showPageSize: true,
  }));

  assert.match(html, /library-pager-navigation/u);
  assert.match(html, /aria-current="page"/u);
  assert.match(html, /data-library-page-number="1"/u);
  assert.match(html, /data-library-page-number="39"/u);
  assert.match(html, /tw-justify-self-center/u);
  assert.match(html, /tw-rounded-pill/u);
  assert.doesNotMatch(html, /data-library-page-number="6"/u);
});

test('library pager stays hidden when results fit on one page', async () => {
  const { LibraryPager } = await loadLibraryPager();
  const singlePageHtml = renderToStaticMarkup(React.createElement(LibraryPager, {
    page: { total: 24, limit: 50, offset: 0, hasPrevious: false, hasNext: false },
    total: 24,
    itemLabel: 'album',
    showPageSize: true,
  }));
  const emptyHtml = renderToStaticMarkup(React.createElement(LibraryPager, {
    page: { total: 0, limit: 50, offset: 0, hasPrevious: false, hasNext: false },
    total: 0,
    itemLabel: 'album',
  }));

  assert.equal(singlePageHtml, '');
  assert.equal(emptyHtml, '');
});
