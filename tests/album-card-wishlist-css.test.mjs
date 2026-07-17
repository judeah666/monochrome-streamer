import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('wishlist album-card icons use the noticeable theme-derived icon color', async () => {
  const [tailwindSource, bridgeCss, appController] = await Promise.all([
    readFile(new URL('../src/styles/tailwind.css', import.meta.url), 'utf8'),
    readFile(new URL('../public/css/11-react-bridges.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8'),
  ]);

  for (const source of [tailwindSource, bridgeCss]) {
    const block = source.match(
      /\.album-card-footer-row\.is-wishlist,[\s\S]*?\.album-card-footer-row\.is-wishlist \.media-type-symbol \{[\s\S]*?\}/u,
    )?.[0] || '';

    assert.match(block, /color: var\(--wishlist-icon-color\)/u);
    assert.doesNotMatch(block, /drop-shadow/u);
    assert.doesNotMatch(block, /color: var\(--wishlist-text\)/u);
  }

  assert.match(appController, /--wishlist-icon-color/u);
  assert.match(appController, /isLight\s*\? '#000000'/u);
  assert.match(appController, /color-mix\(in srgb, var\(--accent\) 76%, #ffffff\)/u);
});
