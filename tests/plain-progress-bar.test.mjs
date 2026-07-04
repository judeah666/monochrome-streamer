import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('floating player uses the plain progress bar without waveform overlay', async () => {
  const shell = await readFile(new URL('../src/layouts/AppShell.jsx', import.meta.url), 'utf8');
  const controller = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../public/css/05-player.css', import.meta.url), 'utf8');

  assert.match(shell, /id="progress-bar"[\s\S]*id="progress-fill"/u);
  assert.doesNotMatch(shell, /progress-waveform/u);
  assert.doesNotMatch(controller, /\/waveform\?bars=/u);
  assert.doesNotMatch(controller, /syncFloatingWaveform|renderFloatingWaveform|progress-waveform/u);
  assert.doesNotMatch(css, /has-waveform|progress-waveform|waveform-loading/u);
});
