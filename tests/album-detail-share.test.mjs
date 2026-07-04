import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const albumDetailModulePromise = loadAlbumDetailModule();

async function loadAlbumDetailModule() {
  const albumDetailEntry = new URL('../src/components/albums/AlbumDetail.jsx', import.meta.url);
  const result = await build({
    entryPoints: [fileURLToPath(albumDetailEntry)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    external: ['react'],
    loader: { '.svg': 'dataurl' },
    write: false,
  });
  const output = result.outputFiles[0];
  assert.ok(output, 'Expected bundled album detail output');
  const bundleDir = fileURLToPath(new URL('../node_modules/.cache/monochrome-streamer-tests', import.meta.url));
  await mkdir(bundleDir, { recursive: true });
  const bundlePath = path.join(bundleDir, `album-detail-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`);
  await writeFile(bundlePath, output.text, 'utf8');
  return import(pathToFileURL(bundlePath).href);
}

const album = {
  id: 'album-1',
  title: 'Album One',
  artist: 'Album Artist',
  meta: '2024 - 2 tracks',
  mediaTypes: ['Digital Media'],
};

test('album detail renders a share action and copied feedback', async () => {
  const { AlbumDetail } = await albumDetailModulePromise;

  const shareHtml = renderToStaticMarkup(React.createElement(AlbumDetail, {
    album,
    onShareAlbum: () => {},
  }));
  assert.match(shareHtml, /aria-label="Share album link"/u);
  assert.match(shareHtml, />Share<\/span>/u);

  const copiedHtml = renderToStaticMarkup(React.createElement(AlbumDetail, {
    album,
    shareCopied: true,
    onShareAlbum: () => {},
  }));
  assert.match(copiedHtml, /aria-label="Album link copied"/u);
  assert.match(copiedHtml, />Copied<\/span>/u);
});

test('album detail share action calls the supplied handler with the album id', async () => {
  const { AlbumDetail } = await albumDetailModulePromise;
  let sharedAlbumId = '';
  const tree = AlbumDetail({
    album,
    onShareAlbum: (albumId) => {
      sharedAlbumId = albumId;
    },
  });

  const shareButton = findElement(tree, (element) => (
    element.type === 'button'
    && element.props?.['aria-label'] === 'Share album link'
  ));
  assert.ok(shareButton, 'Expected album share button');

  shareButton.props.onClick();
  assert.equal(sharedAlbumId, 'album-1');
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
