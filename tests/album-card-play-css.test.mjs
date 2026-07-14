import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('album cards show only a larger translucent play icon', async () => {
  const [tailwindSource, bridgeCss] = await Promise.all([
    readFile(new URL('../src/styles/tailwind.css', import.meta.url), 'utf8'),
    readFile(new URL('../public/css/11-react-bridges.css', import.meta.url), 'utf8'),
  ]);

  for (const source of [tailwindSource, bridgeCss]) {
    const start = source.indexOf('.album-card-play-button {');
    const end = source.indexOf('.album-card-meta {', start);
    const block = source.slice(start, end);

    assert.match(block, /border: 0/u);
    assert.match(block, /background: transparent/u);
    assert.match(block, /box-shadow: none/u);
    assert.match(block, /color: var\(--accent\)/u);
    assert.match(block, /opacity: 0\.95/u);
    assert.match(block, /font-size: 60px/u);
    assert.match(block, /-webkit-text-stroke: 2px #fff/u);
  }
});
