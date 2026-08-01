import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  canPollInDocument,
  getAdminPollingDelay,
  getScanPollingDelay,
} from '../src/shared/pollingPolicy.js';

test('scan polling stays responsive while scanning and backs off while idle', () => {
  assert.equal(getScanPollingDelay('scanning'), 1000);
  assert.equal(getScanPollingDelay('ready'), 30_000);
  assert.equal(getScanPollingDelay('error'), 30_000);
});

test('admin polling runs only on live-data tabs at bounded intervals', () => {
  assert.equal(getAdminPollingDelay('users'), 10_000);
  assert.equal(getAdminPollingDelay('system'), 5000);
  assert.equal(getAdminPollingDelay('downloads'), null);
  assert.equal(getAdminPollingDelay('instances'), null);
});

test('hidden documents suspend polling', () => {
  assert.equal(canPollInDocument({ hidden: false, visibilityState: 'visible' }), true);
  assert.equal(canPollInDocument({ hidden: true, visibilityState: 'hidden' }), false);
  assert.equal(canPollInDocument({ visibilityState: 'hidden' }), false);
});

test('app and admin polling restart through visibility-aware non-overlapping timers', async () => {
  const appSource = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');
  const adminSource = await readFile(new URL('../src/react/admin.jsx', import.meta.url), 'utf8');

  assert.match(appSource, /visibilitychange', handleScanPollingVisibilityChange/u);
  assert.match(appSource, /if \(!canPollInDocument\(document\)\) return;/u);
  assert.match(appSource, /getScanPollingDelay\(state\.libraryFolders\?\.scan\?\.status\)/u);
  assert.match(adminSource, /getAdminPollingDelay\(activeTab\)/u);
  assert.match(adminSource, /document\.addEventListener\('visibilitychange', handleVisibilityChange\)/u);
  assert.doesNotMatch(adminSource, /setInterval\(/u);
});
