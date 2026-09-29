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
    stdin: { contents: "export { HomeAlbumSections } from './HomeAlbumSections.jsx'; export { HomeIntro } from './HomeIntro.jsx';", resolveDir: path.dirname(fileURLToPath(entry)), loader: 'jsx' },
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

test('home album sections keep recommendations without duplicating the banner carousel', async () => {
  const { HomeAlbumSections } = await homeSectionsModulePromise;
  const html = renderToStaticMarkup(React.createElement(HomeAlbumSections, {
    recentlyAddedAlbums: [album],
    recommendedAlbums: [{ ...album, id: 'album-2', title: 'Album Two' }],
  }));

  assert.match(html, /Recommended Albums/u);
  assert.doesNotMatch(html, /Recently Added/u);
  assert.match(html, /home-recommended-grid/u);
});

test('home recommendations render independently of the banner', async () => {
  const { HomeAlbumSections } = await homeSectionsModulePromise;
  const html = renderToStaticMarkup(React.createElement(HomeAlbumSections, {
    recentlyAddedAlbums: [album],
    recommendedAlbums: [album],
    showRecentlyAdded: false,
  }));

  assert.doesNotMatch(html, /Recently Added/u);
  assert.match(html, /Recommended Albums/u);
});


test('banner shows the album carousel and no legacy welcome text', async () => {
  const { HomeIntro } = await homeSectionsModulePromise;
  const html = renderToStaticMarkup(React.createElement(HomeIntro, {
    albums: [album], title: 'Old welcome text', subtitle: 'Old subtitle',
  }));
  assert.match(html, /Recently Added/u);
  assert.match(html, /Album One/u);
  assert.match(html, /Play Album One/u);
  assert.match(html, /aria-roledescription="carousel"/u);
  assert.doesNotMatch(html, /Old welcome text|Old subtitle/u);
  assert.match(html, /disabled="" aria-label="Next recently added album"/u);
});

test('empty or disabled banner does not render carousel controls', async () => {
  const { HomeIntro } = await homeSectionsModulePromise;
  for (const props of [{ albums: [] }, { albums: [album], showBanner: false }]) {
    assert.equal(renderToStaticMarkup(React.createElement(HomeIntro, props)), '');
  }
});
