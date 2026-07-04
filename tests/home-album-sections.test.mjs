import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const homeSectionsModulePromise = loadHomeSectionsModule();

async function loadHomeSectionsModule() {
  const entry = new URL('../src/components/home/HomeAlbumSections.jsx', import.meta.url);
  const result = await build({
    entryPoints: [fileURLToPath(entry)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    external: ['react'],
    loader: { '.svg': 'dataurl' },
    write: false,
  });
  const output = result.outputFiles[0];
  assert.ok(output, 'Expected bundled home sections output');
  const bundleDir = fileURLToPath(new URL('../node_modules/.cache/monochrome-streamer-tests', import.meta.url));
  await mkdir(bundleDir, { recursive: true });
  const bundlePath = path.join(bundleDir, `home-sections-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`);
  await writeFile(bundlePath, output.text, 'utf8');
  return import(pathToFileURL(bundlePath).href);
}

const album = {
  id: 'album-1',
  title: 'Album One',
  artist: 'Album Artist',
  year: '2026',
  mediaTypes: ['Digital Media'],
  status: 'Collection',
};

test('home album sections render recently added before recommended albums', async () => {
  const { HomeAlbumSections } = await homeSectionsModulePromise;
  const html = renderToStaticMarkup(React.createElement(HomeAlbumSections, {
    recentlyAddedAlbums: [album],
    recommendedAlbums: [{ ...album, id: 'album-2', title: 'Album Two' }],
  }));

  assert.ok(html.indexOf('Recently Added') < html.indexOf('Recommended Albums'));
  assert.match(html, /class="[^"]*home-album-rail/u);
});

test('home album sections hide recently added when disabled', async () => {
  const { HomeAlbumSections } = await homeSectionsModulePromise;
  const html = renderToStaticMarkup(React.createElement(HomeAlbumSections, {
    recentlyAddedAlbums: [album],
    recommendedAlbums: [album],
    showRecentlyAdded: false,
  }));

  assert.doesNotMatch(html, /Recently Added/u);
  assert.match(html, /Recommended Albums/u);
});
