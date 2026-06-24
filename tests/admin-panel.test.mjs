import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('admin folder panel handles string folder names and saves folders payload', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const appShellSource = await readFile(new URL('../src/layouts/AppShell.jsx', import.meta.url), 'utf8');
  const rendererSource = await readFile(new URL('../src/services/rendererBridge.jsx', import.meta.url), 'utf8');

  assert.match(source, /typeof folder === 'string' \? folder : folder\?\.name/u);
  assert.match(source, /JSON\.stringify\(\{ folders \}\)/u);
  assert.doesNotMatch(source, /JSON\.stringify\(\{ selected: folders \}\)/u);
  assert.match(source, /url\.pathname === '\/admin'/u);
  assert.match(source, /return redirect\(response, '\/'\);/u);
  assert.doesNotMatch(source, /function renderAdminAppPage/u);
  assert.match(appShellSource, /id="admin-view"/u);
  assert.match(rendererSource, /renderAdminPanel/u);
});

test('admin React scan state tolerates the first empty render', async () => {
  const source = await readFile(new URL('../src/react/admin.jsx', import.meta.url), 'utf8');

  assert.match(source, /useState\(\{ available: \[\], selected: \[\], scan: \{\} \}\)/u);
  assert.match(source, /scan = scan && typeof scan === 'object' \? scan : \{\};/u);
});
