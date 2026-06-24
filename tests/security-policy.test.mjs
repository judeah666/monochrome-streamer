import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  createSessionRecord,
  isPlaceholderWidgetApiKey,
  isWeakAdminCredentials,
  normalizeCorsOrigin,
  refreshSessionRecord,
  SESSION_ABSOLUTE_MS,
  SESSION_IDLE_MS,
} from '../src/server/securityPolicy.js';

test('security policy flags weak admin credentials', () => {
  assert.equal(isWeakAdminCredentials('admin', 'admin'), true);
  assert.equal(isWeakAdminCredentials('guestguestguest', 'guestguestguest'), true);
  assert.equal(isWeakAdminCredentials('admin', 'short'), true);
  assert.equal(isWeakAdminCredentials('streamer-admin', 'correct-horse-battery'), false);
});

test('session records include csrf tokens and respect idle versus absolute expiry', () => {
  const now = 1_700_000_000_000;
  const session = createSessionRecord({ username: 'tester', role: 'admin' }, now);

  assert.equal(session.username, 'tester');
  assert.equal(session.role, 'admin');
  assert.ok(session.csrfToken);
  assert.equal(session.lastSeenAt, now);
  assert.equal(session.expiresAt, now + SESSION_IDLE_MS);

  const refreshed = refreshSessionRecord(session, now + 60_000);
  assert.equal(refreshed.expiresAt, now + 60_000 + SESSION_IDLE_MS);

  const nearAbsoluteExpiry = createSessionRecord({ username: 'tester', role: 'user' }, now);
  nearAbsoluteExpiry.expiresAt = now + SESSION_ABSOLUTE_MS;
  const clipped = refreshSessionRecord(nearAbsoluteExpiry, now + SESSION_ABSOLUTE_MS - 500);
  assert.equal(clipped.expiresAt, now + SESSION_ABSOLUTE_MS);

  const expired = refreshSessionRecord(createSessionRecord({ username: 'tester', role: 'user' }, now), now + SESSION_ABSOLUTE_MS + 1);
  assert.equal(expired, null);
});

test('widget security helpers reject wildcard origins and placeholder keys', () => {
  assert.equal(normalizeCorsOrigin('*'), '');
  assert.equal(normalizeCorsOrigin('https://example.com/path?q=1'), 'https://example.com');
  assert.equal(normalizeCorsOrigin('javascript:alert(1)'), '');
  assert.equal(isPlaceholderWidgetApiKey('change-this-widget-key'), true);
  assert.equal(isPlaceholderWidgetApiKey('ms_real_key_value'), false);
});

test('server source locks down admin exports, download posts, and admin-only editor writes', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const appSource = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');
  const adminSource = await readFile(new URL('../src/react/admin.jsx', import.meta.url), 'utf8');
  const configExample = await readFile(new URL('../config.example.json', import.meta.url), 'utf8');

  assert.match(source, /noAuth:\s*true/u);
  assert.match(source, /anonymousDownloadsEnabled:\s*false/u);
  assert.match(configExample, /"noAuth":\s*true/u);
  assert.match(configExample, /"anonymousDownloadsEnabled":\s*false/u);

  assert.match(source, /url\.pathname === '\/api\/admin\/database\/export'[\s\S]*request\.method === 'POST'/u);
  assert.doesNotMatch(source, /url\.pathname === '\/api\/admin\/database\/export' && request\.method === 'GET'/u);
  assert.match(source, /const downloadMatch = \/\^\\\/api\\\/tracks\\\/\(\[\^\/\]\+\)\\\/download\$\/u[\s\S]*request\.method !== 'POST'/u);
  assert.match(source, /artistInfoMatch[\s\S]*assertPrivilegedMutation\(request, authUser, \{ requireAdmin: true \}\)/u);
  assert.match(source, /lyricsMatch[\s\S]*assertPrivilegedMutation\(request, authUser, \{ requireAdmin: true \}\)/u);
  assert.match(source, /function createSessionCookie\(token, request, options = \{\}\)[\s\S]*SameSite=Strict/u);
  assert.match(source, /function getSecurityHeaders\(\)[\s\S]*X-Frame-Options/u);

  assert.match(appSource, /postBlob\(getTrackDownloadEndpoint\(track\)/u);
  assert.match(adminSource, /fetch\('\/api\/admin\/database\/export', \{[\s\S]*method: 'POST'/u);
});
