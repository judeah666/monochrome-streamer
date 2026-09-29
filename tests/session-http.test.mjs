import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

test('HTTP admin and managed-user sessions survive restart and logout revokes access', { timeout: 45000 }, async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'ms-http-auth-'));
  const music = path.join(dir, 'music');
  await mkdir(music);
  const port = 19876;
  const base = `http://127.0.0.1:${port}`;
  let child;
  let output = '';
  const stop = async () => {
    if (!child || child.exitCode !== null) return;
    await new Promise(resolve => { child.once('exit', resolve); child.kill(); });
  };
  const start = async () => {
    child = spawn(process.execPath, ['server.mjs'], {
      cwd: new URL('..', import.meta.url),
      env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), DATA_DIR: dir,
        MUSIC_LIBRARY_PATH: music, LIBRARY_DATABASE_PATH: path.join(dir, 'library.sqlite'),
        AUTH_USERS_PATH: path.join(dir, 'users.json'), WIDGET_SETTINGS_PATH: path.join(dir, 'widget.json'),
        COVER_CACHE_PATH: path.join(dir, 'covers'), AUTO_SCAN_ON_START: 'false',
        ADMIN_USERNAME: 'auth-test-admin', ADMIN_PASSWORD: 'test-admin-password-123', REQUIRE_HTTPS_FOR_AUTH: 'false' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    for (let i = 0; i < 100; i++) {
      if (child.exitCode !== null) throw new Error(`Test server exited: ${output}`);
      try { if ((await fetch(`${base}/api/public/bootstrap`)).ok) return; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Test server did not start');
  };
  const request = async (route, cookie = '', options = {}) => {
    const response = await fetch(base + route, { ...options, headers: { Cookie: cookie, Origin: base, Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers } });
    return { response, body: await response.json() };
  };
  try {
    await start();
    const login = await request('/login', '', { method: 'POST', body: JSON.stringify({ username: 'auth-test-admin', password: 'test-admin-password-123' }) });
    assert.equal(login.response.status, 200);
    const cookie = login.response.headers.get('set-cookie').split(';')[0];
    assert.ok(cookie.startsWith(`ms_session_${port}=`));
    const me = await request('/api/auth/me', cookie);
    assert.equal(me.body.user.role, 'admin');
    assert.equal((await request('/api/admin/users', cookie)).body.admin.username, 'auth-test-admin');
    const created = await request('/api/admin/users', cookie, { method: 'POST', headers: { 'X-CSRF-Token': me.body.csrfToken }, body: JSON.stringify({ username: 'listener', password: 'listener-password-123' }) });
    assert.equal(created.response.status, 200, JSON.stringify(created.body));
    const userLogin = await request('/login', '', { method: 'POST', body: JSON.stringify({ username: 'listener', password: 'listener-password-123' }) });
    const userCookie = userLogin.response.headers.get('set-cookie').split(';')[0];
    await stop();
    await start();
    assert.equal((await request('/api/auth/me', cookie)).body.user.role, 'admin');
    assert.equal((await request('/api/admin/users', cookie)).response.status, 200);
    assert.equal((await request('/api/auth/me', userCookie)).body.user.role, 'user');
    assert.equal((await request('/api/admin/users', userCookie)).response.status, 403);
    assert.equal((await request('/logout', cookie, { method: 'POST', headers: { 'X-CSRF-Token': me.body.csrfToken } })).response.status, 200);
    await stop();
    await start();
    assert.notEqual((await request('/api/auth/me', cookie)).body.user?.role, 'admin');
  } finally { await stop(); await rm(dir, { recursive: true, force: true }); }
});
