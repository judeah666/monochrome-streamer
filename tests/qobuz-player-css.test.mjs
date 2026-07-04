import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('qobuz player CSS keeps thicker seek and volume controls', async () => {
  const playerCss = await readFile(new URL('../public/css/05-player.css', import.meta.url), 'utf8');
  const responsiveCss = await readFile(new URL('../public/css/09-responsive.css', import.meta.url), 'utf8');

  assert.match(playerCss, /body\.player-layout-qobuz \s*\{[^}]*--player-height:\s*100px;/u);
  assert.doesNotMatch(playerCss, /body\.player-layout-qobuz \s*\{[^}]*--player-height:\s*88px;/u);
  assert.doesNotMatch(playerCss, /body\.player-layout-qobuz \s*\{[^}]*--player-height:\s*76px;/u);
  assert.match(playerCss, /body\.player-layout-qobuz \.now-playing-bar \s*\{[^}]*left:\s*var\(--sidebar-width\);/u);
  assert.doesNotMatch(playerCss, /body\.player-layout-qobuz \.now-playing-bar \s*\{[^}]*left:\s*0;/u);
  assert.match(playerCss, /body\.player-layout-qobuz \.sidebar \s*\{[^}]*height:\s*100vh;/u);
  assert.doesNotMatch(playerCss, /body\.player-layout-qobuz \.sidebar \s*\{[^}]*height:\s*calc\(100vh - var\(--player-height\)\);/u);
  assert.match(playerCss, /body\.player-layout-qobuz \.progress-container \s*\{[^}]*inset:\s*0 0 auto 0;/u);
  assert.doesNotMatch(playerCss, /body\.player-layout-qobuz \.progress-container \s*\{[^}]*inset:\s*-[0-9]+px 0 auto 0;/u);
  assert.match(playerCss, /body\.player-layout-qobuz \.progress-bar \{/u);
  assert.match(playerCss, /body\.player-layout-qobuz \.volume-bar \{/u);
  assert.match(playerCss, /body\.player-layout-qobuz \.progress-bar::before \{/u);
  assert.match(playerCss, /body\.player-layout-qobuz \.volume-bar::before \{/u);

  assert.doesNotMatch(
    playerCss,
    /body\.player-layout-qobuz \.progress-bar \s*\{[^}]*height:\s*3px;/u,
  );
  assert.doesNotMatch(
    playerCss,
    /body\.player-layout-qobuz \.volume-bar \s*\{[^}]*height:\s*2px;/u,
  );

  assert.match(responsiveCss, /body\.player-layout-qobuz \.progress-bar \{/u);
  assert.match(responsiveCss, /body\.player-layout-qobuz \.now-playing-bar \s*\{[^}]*left:\s*0;/u);
  assert.match(responsiveCss, /@media \(min-width: 721px\) and \(max-width: 960px\)[\s\S]*body\.player-layout-qobuz \.now-playing-bar \s*\{[^}]*left:\s*var\(--sidebar-width\);/u);
  assert.match(responsiveCss, /@media \(min-width: 721px\) and \(max-width: 960px\)[\s\S]*body\.player-layout-qobuz \.sidebar \s*\{[^}]*height:\s*100vh;/u);
  assert.match(
    responsiveCss,
    /body\.player-layout-qobuz \.progress-bar \s*\{[^}]*height:\s*11px;/u,
  );
  assert.doesNotMatch(
    responsiveCss,
    /@media \(min-width: 721px\) and \(max-width: 960px\)[\s\S]*body\.player-layout-qobuz \.sidebar \s*\{[^}]*height:\s*calc\(100vh - var\(--player-height\)\);/u,
  );
  assert.doesNotMatch(
    responsiveCss,
    /body\.player-layout-qobuz \.progress-bar \s*\{[^}]*height:\s*5px;/u,
  );
});
