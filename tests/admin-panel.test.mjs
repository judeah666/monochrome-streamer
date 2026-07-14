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

test('font controls live in Admin System and use the shared app settings callback', async () => {
  const adminSource = await readFile(new URL('../src/react/admin.jsx', import.meta.url), 'utf8');
  const appearanceSource = await readFile(new URL('../src/components/settings/AppearanceSettings.jsx', import.meta.url), 'utf8');
  const controllerSource = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');

  assert.match(adminSource, /<PanelGroup title="App Font"/u);
  assert.match(adminSource, /onFontSettingChange\('fontPreset'/u);
  assert.match(adminSource, /onFontSettingChange\('fontSize'/u);
  assert.doesNotMatch(appearanceSource, /data-setting="fontPreset"/u);
  assert.doesNotMatch(appearanceSource, /data-setting="fontSize"/u);
  assert.match(controllerSource, /onAppSettingChange: \(key, value\) => updateSetting\(key, value, true\)/u);
});
