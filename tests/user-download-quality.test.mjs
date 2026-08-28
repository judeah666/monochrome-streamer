import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getEffectiveManagedUserDownloadQuality,
  getManagedUserDownloadQualityOverride,
  parseManagedUserDownloadQuality,
  resolveRequestedDownloadQuality,
} from '../src/server/userDownloadPolicy.js';

test('managed users without an override inherit the global download quality', () => {
  const user = { role: 'user', username: 'listener' };

  assert.equal(getManagedUserDownloadQualityOverride(user), null);
  assert.equal(getEffectiveManagedUserDownloadQuality(user, 'mp3-256'), 'mp3-256');
});

test('managed user quality input accepts inheritance and rejects unknown profiles', () => {
  assert.equal(parseManagedUserDownloadQuality(null), null);
  assert.equal(parseManagedUserDownloadQuality('inherit'), null);
  assert.equal(parseManagedUserDownloadQuality(' MP3-256 '), 'mp3-256');
  assert.throws(() => parseManagedUserDownloadQuality('lossless-max'), /Invalid download quality/u);
});

test('managed user overrides replace the global download quality', () => {
  const user = { role: 'user', username: 'listener', downloadQuality: 'cd' };

  assert.equal(getManagedUserDownloadQualityOverride(user), 'cd');
  assert.equal(getEffectiveManagedUserDownloadQuality(user, 'mp3-128'), 'cd');
});

test('managed download requests cannot override their enforced quality', () => {
  const user = { role: 'user', username: 'listener', downloadQuality: 'mp3-128' };

  assert.equal(resolveRequestedDownloadQuality(user, 'original'), 'mp3-128');
  assert.equal(resolveRequestedDownloadQuality({ role: 'admin' }, 'cd'), 'cd');
  assert.equal(resolveRequestedDownloadQuality({ role: 'guest' }, 'mp3'), 'mp3');
});
