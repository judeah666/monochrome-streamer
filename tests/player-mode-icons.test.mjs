import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  PLAYBACK_MODE_ICONS,
  getRepeatIcon,
  getShuffleIcon,
} from '../src/assets/icons/player/index.js';

function assetName(assetUrl) {
  return String(assetUrl).split('/').at(-1);
}

test('shuffle resolves to the supplied off and on artwork', () => {
  assert.equal(assetName(getShuffleIcon(false)), 'shuffle-off.svg');
  assert.equal(assetName(getShuffleIcon(true)), 'shuffle.svg');
  assert.equal(getShuffleIcon(false), PLAYBACK_MODE_ICONS.shuffleOff);
  assert.equal(getShuffleIcon(true), PLAYBACK_MODE_ICONS.shuffleOn);
});

test('repeat resolves each playback mode to its dedicated artwork', () => {
  assert.equal(assetName(getRepeatIcon('off')), 'repeat-off.svg');
  assert.equal(assetName(getRepeatIcon('all')), 'repeat-all.svg');
  assert.equal(assetName(getRepeatIcon('one')), 'repeat-1.svg');
});

test('unknown repeat modes safely render repeat off', () => {
  assert.equal(getRepeatIcon('unexpected'), PLAYBACK_MODE_ICONS.repeatOff);
});

test('all playback mode SVGs inherit the current theme color', async () => {
  const iconUrls = Object.values(PLAYBACK_MODE_ICONS);
  const sources = await Promise.all(iconUrls.map((iconUrl) => (
    readFile(new URL(`../src/assets/icons/player/${assetName(iconUrl)}`, import.meta.url), 'utf8')
  )));
  for (const source of sources) {
    assert.match(source, /(?:fill|stroke)="currentColor"/u);
    assert.match(source, /viewBox="0 0 640 640"/u);
  }
});
