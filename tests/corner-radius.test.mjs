import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('shared corner scale reduces panels and cards without changing round controls', async () => {
  const foundation = await readFile(new URL('../public/css/00-foundation.css', import.meta.url), 'utf8');
  const tailwindSource = await readFile(new URL('../src/styles/tailwind.css', import.meta.url), 'utf8');

  assert.match(foundation, /--radius-large:\s*20px/u);
  assert.match(foundation, /--radius:\s*16px/u);
  assert.match(foundation, /--radius-small:\s*12px/u);
  assert.match(foundation, /--radius-card:\s*16px/u);

  assert.match(tailwindSource, /\.tw-rounded-\\\[30px\\\][\s\S]*border-radius:\s*var\(--radius-large\)/u);
  assert.match(tailwindSource, /\.tw-rounded-\\\[24px\\\][\s\S]*border-radius:\s*var\(--radius\)/u);
  assert.match(tailwindSource, /\.tw-rounded-\\\[18px\\\][\s\S]*border-radius:\s*var\(--radius-small\)/u);
  assert.doesNotMatch(tailwindSource, /\.tw-rounded-pill[\s\S]*border-radius:\s*var\(--radius/u);
  assert.doesNotMatch(tailwindSource, /\.tw-rounded-full[\s\S]*border-radius:\s*var\(--radius/u);
});
