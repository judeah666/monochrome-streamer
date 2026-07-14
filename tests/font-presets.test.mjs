import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  DEFAULT_SETTINGS,
  FONT_OPTIONS,
  FONT_PRESETS,
} from '../src/controller/constants.js';
import { normalizeSettings } from '../src/controller/settingsStore.js';
import { getContentType } from '../lib/library.mjs';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDirectory, '..');
const fontCss = readFileSync(resolve(projectRoot, 'public/css/00-fonts.css'), 'utf8');
const appControllerSource = readFileSync(resolve(projectRoot, 'src/controller/appController.js'), 'utf8');
const adminSource = readFileSync(resolve(projectRoot, 'src/react/admin.jsx'), 'utf8');
const tailwindSource = readFileSync(resolve(projectRoot, 'tailwind.config.js'), 'utf8');

test('every selectable font has a stable preset', () => {
  for (const [value] of FONT_OPTIONS) {
    assert.equal(typeof FONT_PRESETS[value], 'string', `Missing font preset: ${value}`);
  }
});

test('bundled font files are lazy CSS faces with swap fallback', () => {
  const bundledFiles = [...fontCss.matchAll(/url\("\.\.\/fonts\/([^"?]+)"\)/gu)].map((match) => match[1]);

  assert.equal(bundledFiles.length, 13);
  assert.equal((fontCss.match(/font-display:\s*swap/gu) || []).length, 13);
  for (const filename of bundledFiles) {
    assert.equal(existsSync(resolve(projectRoot, 'public/fonts', filename)), true, `Missing bundled font: ${filename}`);
  }
});

test('unknown legacy font selections normalize to the stable default', () => {
  assert.equal(normalizeSettings({ fontPreset: 'removed-custom-font' }).fontPreset, DEFAULT_SETTINGS.fontPreset);
  assert.equal(normalizeSettings({ fontPreset: 'gotham' }).fontPreset, 'gotham');
});

test('the static server identifies bundled font formats correctly', () => {
  assert.equal(getContentType('font.ttf'), 'font/ttf');
  assert.equal(getContentType('font.otf'), 'font/otf');
});

test('selected fonts apply to body and display text in every app surface', () => {
  assert.match(appControllerSource, /setProperty\('--font-body', selectedFont\)/u);
  assert.match(appControllerSource, /setProperty\('--font-display', selectedFont\)/u);
  assert.match(adminSource, /setProperty\('--font-body', selectedFont\)/u);
  assert.match(adminSource, /setProperty\('--font-display', selectedFont\)/u);
  assert.match(tailwindSource, /display:\s*'var\(--font-display\)'/u);
  assert.doesNotMatch(tailwindSource, /display:\s*\['Space Grotesk'/u);
});
