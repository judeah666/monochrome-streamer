import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const modulesPromise = loadModules();

async function loadModules() {
  const entries = {
    PlayerUtilityControls: '../src/components/player/PlayerUtilityControls.jsx',
    QueuePanel: '../src/components/queue/QueuePanel.jsx',
    AlbumDetail: '../src/components/albums/AlbumDetail.jsx',
    PlaylistBrowser: '../src/components/library/PlaylistBrowser.jsx',
    DownloadStatusToast: '../src/components/common/DownloadStatusToast.jsx',
  };
  const loaded = {};
  for (const [name, entry] of Object.entries(entries)) {
    loaded[name] = await loadBundledModule(entry);
  }
  return loaded;
}

async function loadBundledModule(entry) {
  const result = await build({
    entryPoints: [fileURLToPath(new URL(entry, import.meta.url))],
    bundle: true,
    format: 'esm',
    platform: 'node',
    external: ['react', 'react-dom'],
    loader: { '.svg': 'dataurl' },
    write: false,
  });
  const output = result.outputFiles[0];
  assert.ok(output, `Expected bundled output for ${entry}`);
  const bundleDir = fileURLToPath(new URL('../node_modules/.cache/monochrome-streamer-tests', import.meta.url));
  await mkdir(bundleDir, { recursive: true });
  const bundlePath = path.join(bundleDir, `${path.basename(entry)}-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`);
  await writeFile(bundlePath, output.text, 'utf8');
  return import(pathToFileURL(bundlePath).href);
}

test('player utility download button shows busy state and disables during downloads', async () => {
  const { PlayerUtilityControls } = await modulesPromise.then((modules) => modules.PlayerUtilityControls);
  const html = renderToStaticMarkup(React.createElement(PlayerUtilityControls, {
    hasTrack: true,
    currentTrackTitle: 'Song One',
    canDownload: true,
    downloadActive: true,
    downloadBusy: true,
  }));

  assert.match(html, /id="download-track-link"/u);
  assert.match(html, /aria-busy="true"/u);
  assert.match(html, /disabled=""/u);
  assert.match(html, /download-busy-spinner/u);
});

test('queue download button shows busy state and disables during downloads', async () => {
  const { QueuePanel } = await modulesPromise.then((modules) => modules.QueuePanel);
  const html = renderToStaticMarkup(React.createElement(QueuePanel, {
    open: true,
    tracks: [{ id: 'one', title: 'One', artist: 'Artist', album: 'Album' }],
    downloadActive: true,
    downloadBusy: true,
  }));

  assert.match(html, /aria-label="Downloading queue"/u);
  assert.match(html, /aria-busy="true"/u);
  assert.match(html, /disabled=""/u);
  assert.match(html, /download-busy-spinner/u);
});

test('album detail download button shows busy state and disables during downloads', async () => {
  const { AlbumDetail } = await modulesPromise.then((modules) => modules.AlbumDetail);
  const html = renderToStaticMarkup(React.createElement(AlbumDetail, {
    album: {
      id: 'album-one',
      title: 'Album One',
      artist: 'Artist One',
      meta: '2026 - 1 track',
      mediaTypes: ['Digital Media'],
    },
    canQueue: true,
    canDownload: true,
    downloadActive: true,
    downloadBusy: true,
  }));

  assert.match(html, /aria-label="Downloading album"/u);
  assert.match(html, /aria-busy="true"/u);
  assert.match(html, /disabled=""/u);
  assert.match(html, />Downloading<\/span>/u);
});

test('playlist detail download button follows permission and busy state', async () => {
  const { PlaylistBrowser } = await modulesPromise.then((modules) => modules.PlaylistBrowser);
  const playlist = {
    id: 'playlist-one',
    name: 'Road Trip',
    trackCount: 2,
    tracks: [
      { id: 'one', title: 'One', artist: 'Artist', album: 'Album' },
      { id: 'two', title: 'Two', artist: 'Artist', album: 'Album' },
    ],
  };
  const busyHtml = renderToStaticMarkup(React.createElement(PlaylistBrowser, {
    canUsePlaylists: true,
    selectedPlaylistId: playlist.id,
    selectedPlaylist: playlist,
    canDownload: true,
    downloadActive: true,
    downloadBusy: true,
  }));
  assert.match(busyHtml, /aria-label="Downloading playlist"/u);
  assert.match(busyHtml, /aria-busy="true"/u);
  assert.match(busyHtml, /download-busy-spinner/u);
  assert.match(busyHtml, /disabled=""/u);

  const disabledHtml = renderToStaticMarkup(React.createElement(PlaylistBrowser, {
    canUsePlaylists: true,
    selectedPlaylistId: playlist.id,
    selectedPlaylist: playlist,
    canDownload: false,
  }));
  assert.match(disabledHtml, /disabled="" aria-label="Download playlist"/u);

  const emptyHtml = renderToStaticMarkup(React.createElement(PlaylistBrowser, {
    canUsePlaylists: true,
    selectedPlaylistId: 'empty',
    selectedPlaylist: { id: 'empty', name: 'Empty', trackCount: 0, tracks: [] },
    canDownload: true,
  }));
  assert.match(emptyHtml, /disabled="" aria-label="Download playlist"/u);
});

test('playlist download action keeps the complete playlist when search filters the rows', async () => {
  const { PlaylistBrowser } = await modulesPromise.then((modules) => modules.PlaylistBrowser);
  const playlist = {
    id: 'playlist-one',
    name: 'Road Trip',
    trackCount: 2,
    tracks: [
      { id: 'one', title: 'Visible Song', artist: 'Artist', album: 'Album' },
      { id: 'two', title: 'Hidden Song', artist: 'Artist', album: 'Album' },
    ],
  };
  let downloadedPlaylist = null;
  const browserTree = PlaylistBrowser({
    canUsePlaylists: true,
    selectedPlaylistId: playlist.id,
    selectedPlaylist: playlist,
    searchTerm: 'Visible',
    canDownload: true,
    onDownloadPlaylist: (selected) => { downloadedPlaylist = selected; },
  });
  const detailTree = browserTree.type(browserTree.props);
  const downloadButton = findElement(detailTree, (element) => (
    element.type === 'button' && element.props?.['aria-label'] === 'Download playlist'
  ));
  assert.ok(downloadButton);
  downloadButton.props.onClick();
  assert.equal(downloadedPlaylist, playlist);
  assert.deepEqual(downloadedPlaylist.tracks.map((track) => track.id), ['one', 'two']);
});

test('download status toast renders active, complete, and failed states', async () => {
  const { DownloadStatusToast } = await modulesPromise.then((modules) => modules.DownloadStatusToast);
  const preparing = renderToStaticMarkup(React.createElement(DownloadStatusToast, {
    phase: 'preparing',
    label: 'Album One',
    detail: 'Preparing album download...',
  }));
  assert.match(preparing, /role="status"/u);
  assert.match(preparing, /aria-busy="true"/u);
  assert.match(preparing, /Preparing album download/u);

  const complete = renderToStaticMarkup(React.createElement(DownloadStatusToast, {
    phase: 'complete',
    label: 'Album One',
  }));
  assert.match(complete, /Download ready/u);
  assert.doesNotMatch(complete, /aria-busy="true"/u);

  const failed = renderToStaticMarkup(React.createElement(DownloadStatusToast, {
    phase: 'failed',
    label: 'Album One',
    error: 'Network failed',
  }));
  assert.match(failed, /role="alert"/u);
  assert.match(failed, /Network failed/u);
});

test('app controller routes all download entry points through shared activity state', async () => {
  const source = await import('node:fs/promises')
    .then(({ readFile }) => readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8'));

  assert.match(source, /async function runDownloadActivity/u);
  assert.match(source, /target:\s*'queue'/u);
  assert.match(source, /target:\s*`album:\$\{albumId\}`/u);
  assert.match(source, /target:\s*`playlist:\$\{playlist\.id\}`/u);
  assert.match(source, /const tracks = Array\.isArray\(playlist\.tracks\)/u);
  assert.match(source, /submitBulkDownload\(tracks, getBulkDownloadFilename\(\{[\s\S]*name: playlist\.name/u);
  assert.match(source, /triggerTrackBrowserDownload\(track,\s*\{\s*target:\s*'fullscreen'\s*\}\)/u);
  assert.match(source, /triggerTrackBrowserDownload\(track,\s*\{\s*target:\s*'player'\s*\}\)/u);
  assert.match(source, /setDownloadPhase\('downloading'/u);
});

function findElement(node, predicate) {
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findElement(child, predicate);
      if (match) return match;
    }
    return null;
  }
  if (typeof node !== 'object') return null;
  if (predicate(node)) return node;
  return findElement(node.props?.children, predicate);
}
