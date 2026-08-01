import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { markAppBootFailed, markAppReady } from '../src/controller/appBoot.js';

test('the initial document shows a startup screen before the React shell', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const css = await readFile(new URL('../public/css/00-foundation.css', import.meta.url), 'utf8');

  assert.ok(html.indexOf('id="app-boot-screen"') < html.indexOf('id="react-root"'));
  assert.match(css, /body:not\(\[data-app-ready="true"\]\) #react-root/u);
  assert.match(css, /body\[data-app-ready="true"\] \.app-boot-screen/u);
});

test('app boot state reveals the app on success and exposes startup errors', () => {
  const message = { textContent: '' };
  const detail = { textContent: '' };
  const attributes = new Map();
  const screen = {
    dataset: {},
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name),
    querySelector: (selector) => selector.includes('message') ? message : detail,
  };
  const documentRef = {
    body: { dataset: {} },
    querySelector: () => screen,
  };

  markAppReady(documentRef);
  assert.equal(documentRef.body.dataset.appReady, 'true');
  assert.equal(attributes.get('aria-hidden'), 'true');

  markAppBootFailed(new Error('Server unavailable.'), documentRef);
  assert.equal(documentRef.body.dataset.appReady, undefined);
  assert.equal(screen.dataset.state, 'error');
  assert.equal(message.textContent, 'Unable to start the app');
  assert.match(detail.textContent, /Server unavailable/u);
});
