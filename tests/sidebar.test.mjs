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

  const navItems = ['Home', 'Library', 'Playlists', 'Favorites', 'Wishlist', 'Settings', 'Admin'];
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
