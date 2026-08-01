import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the reduced corner pass preserves the established glass surfaces', async () => {
  const source = await readFile(new URL('../src/styles/tailwind.css', import.meta.url), 'utf8');
  const sidebarCss = await readFile(new URL('../public/css/01-shell-sidebar.css', import.meta.url), 'utf8');
  const playerCss = await readFile(new URL('../public/css/05-player.css', import.meta.url), 'utf8');
  const queueCss = await readFile(new URL('../public/css/07-queue.css', import.meta.url), 'utf8');

  assert.match(source, /Keep the established glass surfaces while using a tighter corner scale/u);
  assert.match(
    source,
    /body:not\(\[data-view='login'\]\):not\(\[data-view='fullscreen'\]\) \.album-card-shell:hover\s*\{[\s\S]*?transform:\s*none;/u,
  );
  const cornerOverrides = source.slice(source.indexOf('/* Keep the established glass surfaces'));
  assert.doesNotMatch(cornerOverrides, /(?:background|backdrop-filter)\s*:/u);
  assert.match(cornerOverrides, /box-shadow:\s*none/u);
  assert.match(sidebarCss, /\.sidebar\s*\{[\s\S]*?background:\s*var\(--glass-heavy\);[\s\S]*?backdrop-filter:\s*blur\(18px\);/u);
  assert.match(playerCss, /\.now-playing-bar\s*\{[\s\S]*?background:\s*var\(--glass-heavy\);[\s\S]*?backdrop-filter:\s*blur\(18px\);/u);
  assert.match(queueCss, /\.queue-panel\s*\{[\s\S]*?background:\s*var\(--glass-heavy\);[\s\S]*?backdrop-filter:\s*blur\(18px\);/u);
});
