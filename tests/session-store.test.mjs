import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { PersistentSessionStore, sessionCookieName } from '../src/server/sessionStore.js';
import { createSessionRecord, refreshSessionRecord } from '../src/server/securityPolicy.js';

test('sessions survive restart, retain CSRF, and persist logout revocation', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'ms-sessions-'));
  try {
    const file = path.join(dir, 'sessions.json');
    const store = new PersistentSessionStore(file);
    const session = createSessionRecord({ username: 'admin', role: 'admin' });
    session.playback = { trackId: 'private' };
    store.set('test-token', session);
    const restarted = new PersistentSessionStore(file);
    assert.equal(restarted.get('test-token').csrfToken, session.csrfToken);
    assert.equal(restarted.get('test-token').lastSeenAt, 0);
    assert.equal(restarted.get('test-token').playback, undefined);
    restarted.delete('test-token');
    assert.equal(new PersistentSessionStore(file).size, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('NAS instances on different ports have independent session cookies', () => {
  assert.notEqual(sessionCookieName('nas:8888'), sessionCookieName('nas:8889'));
  assert.equal(sessionCookieName('[::1]:8888'), 'ms_session_8888');
  assert.equal(sessionCookieName('music.example.com'), 'ms_session_default');
});

test('credential changes and account deletion revoke saved admin and user sessions', async () => {
  const source = readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
  const fn = source.match(/async function getSessionUser\(request\) \{[\s\S]*?\n\}/u)[0];
  const config = { adminUsername: 'admin', adminPassword: 'original-test-password' };
  const sessions = new Map();
  const store = { users: [{ username: 'listener', passwordHash: 'hash1' }], downloadSettings: {} };
  const context = vm.createContext({ config, sessions, createHash, refreshSessionRecord,
    shouldRequireSecureAuth: () => false, getSessionToken: () => 'token',
    readAuthStore: async () => store, normalizeDownloadSettings: () => ({}),
    getEffectiveManagedUserDownloadQuality: () => 'original',
  });
  vm.runInContext(fn, context);
  sessions.set('token', { ...createSessionRecord({ username: 'admin', role: 'admin' }), credentialVersion: createHash('sha256').update(JSON.stringify([config.adminUsername, config.adminPassword])).digest('hex') });
  assert.equal((await context.getSessionUser({})).role, 'admin');
  config.adminPassword = 'changed-test-password';
  assert.equal(await context.getSessionUser({}), null);
  assert.equal(sessions.size, 0);
  sessions.set('token', { ...createSessionRecord({ username: 'listener', role: 'user' }), credentialVersion: 'hash1' });
  assert.equal((await context.getSessionUser({})).role, 'user');
  store.users[0].passwordHash = 'hash2';
  assert.equal(await context.getSessionUser({}), null);
  sessions.set('token', { ...createSessionRecord({ username: 'listener', role: 'user' }), credentialVersion: 'hash2' });
  store.users = [];
  assert.equal(await context.getSessionUser({}), null);
});
