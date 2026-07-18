import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const trackListModulePromise = loadTrackListModule();

async function loadTrackListModule() {
  const result = await build({
    entryPoints: [fileURLToPath(new URL('../src/components/library/TrackList.jsx', import.meta.url))],
    bundle: true,
    format: 'esm',
    platform: 'node',
    external: ['react'],
    loader: { '.svg': 'dataurl' },
    write: false,
  });
  const output = result.outputFiles[0];
  assert.ok(output, 'Expected bundled track list output');
  const bundleDir = fileURLToPath(new URL('../node_modules/.cache/monochrome-streamer-tests', import.meta.url));
  await mkdir(bundleDir, { recursive: true });
  const bundlePath = path.join(bundleDir, `track-list-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`);
  await writeFile(bundlePath, output.text, 'utf8');
  return import(pathToFileURL(bundlePath).href);
}

const track = {
  id: 'track-1',
  title: 'Download Me',
  artist: 'Test Artist',
  album: 'Test Album',
  trackNumber: 1,
  discNumber: 1,
};

test('track rows render the bundled download action only when a callback is provided', async () => {
  const { TrackList } = await trackListModulePromise;
  const signedInHtml = renderToStaticMarkup(React.createElement(TrackList, {
    tracks: [track],
    variant: 'album',
    onDownload: () => {},
  }));
  const guestHtml = renderToStaticMarkup(React.createElement(TrackList, {
    tracks: [track],
    variant: 'album',
  }));

  assert.match(signedInHtml, /class="download-track-button track-action-button"/u);
  assert.match(signedInHtml, /aria-label="Download Download Me"/u);
  assert.match(signedInHtml, /class="player-symbol"/u);
  assert.match(signedInHtml, /class="track-action-menu-toggle track-action-button"/u);
  assert.match(signedInHtml, /aria-label="Show actions for Download Me"/u);
  assert.match(signedInHtml, /class="track-action-menu"/u);
  assert.doesNotMatch(signedInHtml, /row-play-button/u);
  assert.doesNotMatch(guestHtml, /download-track-button/u);
  assert.doesNotMatch(guestHtml, /aria-label="Download Download Me"/u);
  assert.doesNotMatch(guestHtml, /row-play-button/u);
});

test('track download callbacks are gated to non-guest users and reuse the secure download helper', async () => {
  const controllerSource = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');

  assert.match(controllerSource, /function canCurrentUserDownloadTracks\(\)[\s\S]*state\.currentUser\.role !== 'guest'[\s\S]*state\.canDownload !== false/u);
  assert.match(controllerSource, /function downloadTrackFromRow\(trackOrId\)[\s\S]*triggerTrackBrowserDownload\(track, \{ target: `track:\$\{track\.id\}` \}\)/u);
  assert.match(controllerSource, /onDownloadTrack: canCurrentUserDownloadTracks\(\) \? downloadTrackFromRow : null/u);
});

test('mobile track actions collapse behind the expand button', async () => {
  const responsiveCss = await readFile(new URL('../public/css/09-responsive.css', import.meta.url), 'utf8');
  const tailwindSource = await readFile(new URL('../src/styles/tailwind.css', import.meta.url), 'utf8');
  const albumDetailSource = await readFile(new URL('../src/components/albums/AlbumDetail.jsx', import.meta.url), 'utf8');

  assert.match(tailwindSource, /\.track-action-button\s*\{[\s\S]*?\}\s*\.track-action-menu-toggle\s*\{\s*display:\s*none/u);
  assert.match(tailwindSource, /tw-grid-cols-\[56px_minmax\(0,1fr\)_minmax\(120px,180px\)_auto\]/u);
  assert.match(albumDetailSource, /tw-grid-cols-\[56px_minmax\(0,1fr\)_minmax\(120px,180px\)_auto\]/u);
  assert.doesNotMatch(tailwindSource, /minmax\(120px,180px\)_192px/u);
  assert.match(responsiveCss, /\.track-action-row \.track-action-menu-toggle\s*\{[\s\S]*display:\s*inline-flex/u);
  assert.match(responsiveCss, /\.track-action-row \.track-action-menu\s*\{[\s\S]*position:\s*absolute[\s\S]*display:\s*none/u);
  assert.match(responsiveCss, /\.track-action-row\.is-expanded \.track-action-menu\s*\{[\s\S]*display:\s*flex/u);
});
