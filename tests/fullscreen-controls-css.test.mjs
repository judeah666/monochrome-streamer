import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('fullscreen transport and volume controls use centered icon boxes', async () => {
  const source = await readFile(new URL('../public/css/06-fullscreen.css', import.meta.url), 'utf8');

  assert.match(source, /\.fullscreen-buttons button \{[\s\S]*padding: 0;[\s\S]*line-height: 1;/u);
  assert.match(source, /\.fullscreen-buttons button > \.fa-solid,[\s\S]*display: block;[\s\S]*line-height: 1;/u);
  assert.match(source, /\.fullscreen-volume-container \{[\s\S]*display: grid;[\s\S]*grid-template-columns: 32px minmax\(0, 1fr\);[\s\S]*align-items: center;/u);
  assert.match(source, /\.fs-volume-btn \{[\s\S]*padding: 0;[\s\S]*justify-self: center;[\s\S]*line-height: 1;/u);
  assert.match(source, /\.fs-volume-btn > span \{[\s\S]*display: grid;[\s\S]*place-items: center;/u);
  assert.match(source, /\.fs-volume-btn \.player-symbol \{[\s\S]*display: block;/u);
  assert.match(source, /\.fs-volume-bar \{[\s\S]*width: 100%;[\s\S]*align-self: center;/u);
});
