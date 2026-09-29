import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('recently added banner supports mobile layout and reduced motion', async () => {
  const css = await readFile(new URL('../public/css/02-browse-cards-tracks.css', import.meta.url), 'utf8');
  assert.match(css, /\.recent-stories-stage\s*\{[^}]*touch-action: pan-y/su);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*?\.recent-stories-stage\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\)/u);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?transition: none/u);
});
