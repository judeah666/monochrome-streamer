import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('home recently added rail uses horizontal flex overflow', async () => {
  const browseCss = await readFile(new URL('../public/css/02-browse-cards-tracks.css', import.meta.url), 'utf8');
  const responsiveCss = await readFile(new URL('../public/css/09-responsive.css', import.meta.url), 'utf8');

  assert.match(browseCss, /\.home-album-rail \{[^}]*display:\s*flex;/su);
  assert.match(browseCss, /\.home-album-rail \{[^}]*overflow-x:\s*auto;/su);
  assert.match(browseCss, /\.home-album-rail \{[^}]*scroll-snap-type:\s*x proximity;/su);
  assert.match(browseCss, /\.home-album-rail \.album-card \{[^}]*flex:\s*0 0 clamp/su);
  assert.doesNotMatch(browseCss, /\.home-album-rail \{[^}]*grid-template-columns:/su);
  assert.match(responsiveCss, /\.home-album-rail \.album-card \{[^}]*flex-basis:\s*clamp/su);
});
