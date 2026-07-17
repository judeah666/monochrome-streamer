import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const componentsPromise = loadComponents();

async function loadComponents() {
  const result = await build({
    stdin: {
      contents: [
        "export { Sidebar } from './src/components/navigation/Sidebar.jsx';",
        "export { CoverCaseStack } from './src/pages/LoginView.jsx';",
      ].join('\n'),
      resolveDir: fileURLToPath(new URL('..', import.meta.url)),
      sourcefile: 'login-overlay-components.jsx',
      loader: 'jsx',
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    loader: { '.svg': 'dataurl' },
    write: false,
  });
  const output = result.outputFiles[0];
  assert.ok(output, 'Expected bundled login components');
  return import(`data:text/javascript;base64,${Buffer.from(output.text).toString('base64')}`);
}

test('login view shows close only for a closable app session', async () => {
  const source = await readFile(new URL('../src/pages/LoginView.jsx', import.meta.url), 'utf8');

  assert.match(source, /canClose \? \([\s\S]*className="login-close-button btn-icon"[\s\S]*aria-label="Close login"/u);
  assert.match(source, /<form[^>]*method="post" action="\/login"/u);
  assert.match(source, /onSubmit=\{handleSubmit\}/u);
  assert.match(source, /await onSubmit\([\s\S]*setSubmitting\(false\);[\s\S]*catch \(error\)[\s\S]*setSubmitting\(false\);/u);
});

test('signed-in login view uses POST logout control instead of stale GET link', async () => {
  const source = await readFile(new URL('../src/pages/LoginView.jsx', import.meta.url), 'utf8');

  assert.match(source, /data-logout-button="true"/u);
  assert.doesNotMatch(source, /href="\/logout"/u);
});

test('guest login entry points are buttons controlled by the app router', async () => {
  const { Sidebar } = await componentsPromise;
  const sidebar = renderToStaticMarkup(React.createElement(Sidebar, {
    currentUser: { username: 'Guest', role: 'guest', authDisabled: true },
  }));
  const playlistSource = await readFile(new URL('../src/components/library/PlaylistBrowser.jsx', import.meta.url), 'utf8');

  assert.match(sidebar, /<button[^>]*aria-label="Login"/u);
  assert.doesNotMatch(sidebar, /href="\/login"/u);
  assert.match(playlistSource, /<button className="primary-button"[^>]*onClick=\{\(\) => onLogin\?\.\(\)\}[^>]*>Sign in<\/button>/u);
  assert.doesNotMatch(playlistSource, /href="\/login"/u);
});

test('controller distinguishes hash overlay from restricted login shell', async () => {
  const source = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');

  assert.match(source, /const shouldBootstrapLoginRoute = isLoginOnlyLocation\(\)/u);
  assert.match(source, /function openLoginView\(\)[\s\S]*state\.loginReturnHash[\s\S]*getLoginHash\(\)/u);
  assert.match(source, /function closeLoginView\(\)[\s\S]*state\.loginRouteOnly[\s\S]*state\.loginReturnHash/u);
  assert.match(source, /Accept: 'application\/json'/u);
  assert.match(source, /new AbortController\(\)[\s\S]*20_000[\s\S]*signal: abortController\.signal/u);
  assert.match(source, /Login request timed out\. Please try again\./u);
  assert.match(source, /window\.history\.replaceState\(null, '',[\s\S]*window\.location\.reload\(\)/u);
  assert.doesNotMatch(source, /window\.location\.assign\(sanitizeLoginNext\(payload\.redirectTo/u);
  assert.match(source, /onLogin: openLoginView/u);
  assert.match(source, /hydrateLibrary[\s\S]*setLoginAmbientCoversFromAlbums\(library\.albums \|\| \[\]\)/u);
  assert.match(source, /function setLoginAmbientCoversFromAlbums\(albums = \[\]\)[\s\S]*state\.ambientCovers\.length >= 4[\s\S]*covers\.length >= 6/u);
  assert.doesNotMatch(source, /state\.loginRouteOnly = false/u);
});

test('login cover fan renders four supplied album covers', async () => {
  const { CoverCaseStack } = await componentsPromise;
  const markup = renderToStaticMarkup(React.createElement(CoverCaseStack, {
    covers: Array.from({ length: 6 }, (_, index) => ({
      coverUrl: `/api/albums/album-${index + 1}/cover`,
    })),
  }));

  assert.equal(markup.match(/<img\b/gu)?.length, 4);
  assert.doesNotMatch(markup, /radial-gradient\(circle_at_center/u);
});

test('server keeps native redirects and adds explicit JSON login responses', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const handleLoginStart = source.indexOf('async function handleLogin');
  const handleLoginEnd = source.indexOf('async function authenticateUser', handleLoginStart);
  const block = source.slice(handleLoginStart, handleLoginEnd);

  assert.match(block, /request\.headers\.accept[\s\S]*application\/json/u);
  assert.match(block, /respondJson\(response, 401,[\s\S]*Invalid username or password/u);
  assert.match(block, /respondJson\(response, 200,[\s\S]*redirectTo: next/u);
  assert.match(block, /'Set-Cookie': createSessionCookie\(token, request\)/u);
  assert.match(block, /redirect\(response, getLoginAppRedirectPath\(next/u);
  assert.match(block, /response\.writeHead\(303/u);
});

test('login overlay owns viewport scrolling and safe-area close positioning', async () => {
  const source = await readFile(new URL('../public/css/00-foundation.css', import.meta.url), 'utf8');

  assert.match(source, /body\[data-view="login"\] \{[\s\S]*overflow: hidden/u);
  assert.match(source, /\.login-view-shell \{[\s\S]*height: 100dvh[\s\S]*overflow-y: auto/u);
  assert.match(source, /body\[data-view="login"\]\.has-ambient-cover \.app-ambient-cover \{[\s\S]*var\(--ambient-cover-image\) center \/ cover no-repeat/u);
  assert.match(source, /\.login-glass-card \{[\s\S]*background: color-mix[\s\S]*backdrop-filter: blur/u);
  assert.match(source, /\.login-close-button \{[\s\S]*safe-area-inset-top[\s\S]*safe-area-inset-left/u);
});
