import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const sidebarModulePromise = loadSidebarModule();

async function loadSidebarModule() {
  const sidebarEntry = new URL('../src/components/navigation/Sidebar.jsx', import.meta.url);
  const result = await build({
    entryPoints: [fileURLToPath(sidebarEntry)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
  });
  const output = result.outputFiles[0];
  assert.ok(output, 'Expected bundled sidebar output');
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(output.text).toString('base64')}`;
  return import(moduleUrl);
}

test('sidebar nav items render both icon wrappers and compact-mode labels', async () => {
  const { Sidebar } = await sidebarModulePromise;
  const html = renderToStaticMarkup(React.createElement(Sidebar, {
    settings: {
      showHome: true,
      showLibrary: true,
      showFavorites: true,
      sidebarCollapsed: true,
    },
    activeView: 'home',
    currentUser: { username: 'admin', role: 'admin' },
  }));

  const navItems = ['Home', 'Collections', 'Playlists', 'Favorites', 'Wishlist', 'Albums', 'Artists', 'Songs', 'Options', 'Admin'];
  for (const label of navItems) {
    const buttonPattern = new RegExp(
      `<button[^>]*>[\\s\\S]*?<span class="sidebar-nav-icon"[^>]*>[\\s\\S]*?</span>[\\s\\S]*?<span class="sidebar-nav-label">${label}</span>[\\s\\S]*?</button>`,
      'u',
    );
    assert.match(html, buttonPattern);
  }
});

test('base sidebar stylesheet hides only labels in compact mode', async () => {
  const source = await readFile(new URL('../public/css/01-shell-sidebar.css', import.meta.url), 'utf8');

  assert.match(source, /body\.sidebar-collapsed \.nav-link \.sidebar-nav-label,/u);
  assert.doesNotMatch(source, /body\.sidebar-collapsed \.nav-link span,/u);
  assert.match(source, /body\.sidebar-collapsed \.nav-link \.sidebar-nav-icon \{/u);
  assert.match(source, /body\.sidebar-collapsed \.nav-link \.sidebar-nav-icon \.fa-solid,/u);
});

test('sidebar scan status only renders while scanning', async () => {
  const { Sidebar } = await sidebarModulePromise;
  const readyHtml = renderToStaticMarkup(React.createElement(Sidebar, {
    scan: {
      isScanning: false,
      statusLabel: 'Ready',
      percent: 100,
      indexedText: 'Indexed today',
    },
  }));
  const scanningHtml = renderToStaticMarkup(React.createElement(Sidebar, {
    scan: {
      isScanning: true,
      statusLabel: 'Scanning',
      percent: 42,
      indexedText: 'Indexed today',
    },
  }));

  assert.doesNotMatch(readyHtml, /id="library-status"/u);
  assert.match(scanningHtml, /id="library-status"/u);
  assert.match(scanningHtml, /class="sidebar-progress-bar"/u);
  assert.match(scanningHtml, /role="progressbar"/u);
  assert.match(scanningHtml, /aria-valuenow="42"/u);
  assert.match(scanningHtml, /class="sidebar-progress-fill"[^>]*width:42%/u);
  assert.match(scanningHtml, />42%<\/strong>/u);
  assert.doesNotMatch(scanningHtml, /sidebar-progress-ring|<svg/u);
});

test('sidebar scan progress uses horizontal bar CSS instead of the old ring', async () => {
  const source = await readFile(new URL('../public/css/01-shell-sidebar.css', import.meta.url), 'utf8');
  const responsiveSource = await readFile(new URL('../public/css/09-responsive.css', import.meta.url), 'utf8');

  assert.match(source, /\.sidebar-progress-bar \{/u);
  assert.match(source, /\.sidebar-progress-fill \{/u);
  assert.match(source, /\.sidebar-progress-percent \{/u);
  assert.match(source, /body\.sidebar-collapsed \.sidebar-progress-bar \{/u);
  assert.doesNotMatch(`${source}\n${responsiveSource}`, /sidebar-progress-ring|sidebar-progress-track|sidebar-progress-value/u);
});

test('sidebar statistics use a plain divided footer with navigation-sized muted rows', async () => {
  const source = await readFile(new URL('../public/css/01-shell-sidebar.css', import.meta.url), 'utf8');
  const responsiveSource = await readFile(new URL('../public/css/09-responsive.css', import.meta.url), 'utf8');

  assert.match(source, /\.sidebar-bottom \{[^}]*border-top: 1px solid var\(--line\)/u);
  assert.match(source, /\.sidebar-bottom::before \{\s*content: none;/u);
  assert.match(source, /\.stat-card \{[\s\S]*grid-template-columns: 28px minmax\(0, 1fr\)/u);
  assert.match(source, /\.stat-icon \.sidebar-symbol \{[\s\S]*width: 1\.38rem/u);
  assert.match(source, /\.stat-card strong \{[\s\S]*font-size: inherit/u);
  assert.match(responsiveSource, /grid-template-columns: 28px minmax\(0, 1fr\)/u);
  assert.match(responsiveSource, /width: 1\.35rem;[\s\S]*height: 1\.35rem/u);
});

test('sidebar groups destinations and marks only the selected library section active', async () => {
  const { Sidebar } = await sidebarModulePromise;
  for (const tab of ['albums', 'artists', 'tracks']) {
    const html = renderToStaticMarkup(React.createElement(Sidebar, {
      activeView: 'library', libraryTab: tab, currentUser: { role: 'admin' },
    }));
    assert.deepEqual([...html.matchAll(/role="group" aria-label="([^"]+)"/gu)].map(m => m[1]), ['MENU', 'LIBRARY', 'SETTINGS']);
    assert.deepEqual([...html.matchAll(/id="nav-([^"]+)"[^>]*aria-current="page"/gu)].map(m => m[1]), [tab]);
    assert.doesNotMatch(html, /id="nav-library"/u);
  }
});

test('sidebar respects library visibility and admin permissions', async () => {
  const { Sidebar } = await sidebarModulePromise;
  const html = renderToStaticMarkup(React.createElement(Sidebar, {
    settings: { showLibrary: false, showHome: false, showFavorites: false },
    currentUser: { role: 'guest' },
  }));
  assert.doesNotMatch(html, /id="nav-(?:albums|artists|tracks|collections|admin|home|favorites|wishlist)"/u);
  assert.doesNotMatch(html, /aria-label="LIBRARY"/u);
  assert.match(html, /id="nav-settings"/u);
  assert.match(html, /id="nav-playlists"/u);
});
