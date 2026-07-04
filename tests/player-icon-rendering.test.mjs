import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
    PlayerTransportControls: '../src/components/player/PlayerTransportControls.jsx',
    QueueList: '../src/components/queue/QueueList.jsx',
    QueuePanel: '../src/components/queue/QueuePanel.jsx',
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
    external: ['react'],
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

test('player utility controls use player SVG assets when assets exist', async () => {
  const modules = await modulesPromise;
  const { PlayerUtilityControls } = modules.PlayerUtilityControls;
  const utility = renderToStaticMarkup(React.createElement(PlayerUtilityControls, {
    hasTrack: true,
    currentTrackTitle: 'Song',
    volume: 0.5,
  }));

  assert.match(utility, /player-symbol/u);
  assert.match(utility, /--player-icon/u);
  assert.match(utility, /download\.svg/u);
  assert.match(utility, /list-ul\.svg/u);
  assert.match(utility, /volume-medium\.svg/u);
});

test('shuffle and repeat render playback mode SVG icons', async () => {
  const modules = await modulesPromise;
  const { PlayerTransportControls } = modules.PlayerTransportControls;
  const offTransport = renderToStaticMarkup(React.createElement(PlayerTransportControls, {
    playing: false,
    shuffleActive: false,
    repeatActive: false,
    repeatMode: 'off',
  }));
  const activeTransport = renderToStaticMarkup(React.createElement(PlayerTransportControls, {
    playing: false,
    shuffleActive: true,
    repeatActive: true,
    repeatMode: 'one',
  }));

  assert.match(offTransport, /player-symbol/u);
  assert.match(offTransport, /--player-icon/u);
  assert.match(offTransport, /shuffle-off\.svg/u);
  assert.match(offTransport, /repeat-off\.svg/u);
  assert.match(activeTransport, /shuffle\.svg/u);
  assert.match(activeTransport, /repeat-1\.svg/u);
});

test('queue player-surface actions use player SVG assets when assets exist', async () => {
  const modules = await modulesPromise;
  const { QueuePanel } = modules.QueuePanel;
  const { QueueList } = modules.QueueList;
  const track = { id: 'one', title: 'One', artist: 'Artist', album: 'Album', coverUrl: '' };
  const panel = renderToStaticMarkup(React.createElement(QueuePanel, {
    open: true,
    tracks: [track],
    canDownload: true,
  }));
  const list = renderToStaticMarkup(React.createElement(QueueList, {
    tracks: [track],
  }));

  assert.match(panel, /--player-icon/u);
  assert.match(panel, /download\.svg/u);
  assert.match(panel, /trash\.svg/u);
  assert.match(list, /--player-icon/u);
  assert.match(list, /trash\.svg/u);
});

test('player icon source prefers player SVG assets before Font Awesome fallback', async () => {
  const utilitySource = await readFile(new URL('../src/components/player/PlayerUtilityControls.jsx', import.meta.url), 'utf8');
  const queueListSource = await readFile(new URL('../src/components/queue/QueueList.jsx', import.meta.url), 'utf8');
  const visualBitsSource = await readFile(new URL('../src/components/common/VisualBits.jsx', import.meta.url), 'utf8');
  const controllerSource = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');

  assert.match(utilitySource, /<PlayerIcon name="download"/u);
  assert.match(utilitySource, /<PlayerIcon name="queue"/u);
  assert.match(utilitySource, /<PlayerIcon name=\{volumeIconName\}/u);
  assert.match(queueListSource, /<PlayerIcon name="remove"/u);
  assert.match(visualBitsSource, /queue:\s*'\/assets\/icons\/player\/list-ul\.svg'/u);
  assert.match(visualBitsSource, /volumeMedium:\s*'\/assets\/icons\/player\/volume-medium\.svg'/u);
  assert.doesNotMatch(visualBitsSource, /PLAYER_ICON_URL_CLASSES|player-symbol-fa/u);
  assert.match(controllerSource, /const iconUrl = PLAYER_ICONS\[name\]/u);
  assert.doesNotMatch(controllerSource, /if \(ICONS\[name\]\) return materialIcon\(name\)/u);
  assert.doesNotMatch(utilitySource, /getShuffleIcon|getRepeatIcon/u);
});
