import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('audio settings describe gapless autoplay near-end preparation', async () => {
  const source = await readFile(new URL('../src/components/settings/RemainingSettings.jsx', import.meta.url), 'utf8');

  assert.match(source, /title="Gapless Autoplay"/u);
  assert.match(source, /Prepare the next queued track near the end/u);
  assert.doesNotMatch(source, /title="Autoplay Queue"/u);
});
