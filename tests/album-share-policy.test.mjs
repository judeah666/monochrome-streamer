import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_ALBUM_SHARE_HOURS,
  hashAlbumShareToken,
  isAlbumShareToken,
  MAX_ALBUM_SHARE_HOURS,
  MIN_ALBUM_SHARE_HOURS,
  normalizeAlbumShareStore,
  parseAlbumShareDurationHours,
  removeExpiredAlbumShares,
  resolveAlbumShare,
} from '../src/server/albumSharePolicy.js';

const token = 'a'.repeat(43);
const now = 1_700_000_000_000;

test('album share durations accept custom whole hours within 30 days', () => {
  assert.equal(MIN_ALBUM_SHARE_HOURS, 1);
  assert.equal(MAX_ALBUM_SHARE_HOURS, 720);
  assert.equal(DEFAULT_ALBUM_SHARE_HOURS, 24);
  for (const hours of [1, 2, 12, 24, 36, 168, 719, 720]) {
    assert.equal(parseAlbumShareDurationHours(hours), hours);
    assert.equal(parseAlbumShareDurationHours(String(hours)), hours);
  }
  for (const invalid of [undefined, null, '', 0, -1, 1.5, 721, 86400]) {
    assert.equal(parseAlbumShareDurationHours(invalid), null);
  }
});

test('album share tokens are URL-safe and resolved by hash', () => {
  assert.equal(isAlbumShareToken(token), true);
  assert.equal(isAlbumShareToken('52f3caed30c09fcb'), false);
  assert.equal(isAlbumShareToken(`${token}!`), false);

  const share = {
    tokenHash: hashAlbumShareToken(token),
    albumId: 'album-1',
    createdBy: 'admin',
    createdAt: now,
    expiresAt: now + 60_000,
  };
  const store = normalizeAlbumShareStore({ shares: [share] });
  assert.deepEqual(resolveAlbumShare(store, token, now), { status: 'active', share });
  assert.equal(resolveAlbumShare(store, 'b'.repeat(43), now).status, 'missing');
  assert.equal(resolveAlbumShare(store, '52f3caed30c09fcb', now).status, 'missing');
  assert.equal(resolveAlbumShare(store, token, share.expiresAt).status, 'expired');
});

test('expired share records become compact tombstones for the branded expired page', () => {
  const expiredShare = {
    tokenHash: hashAlbumShareToken(token),
    albumId: 'album-1',
    createdBy: 'admin',
    createdAt: now - 120_000,
    expiresAt: now - 60_000,
  };
  const { store, changed } = removeExpiredAlbumShares({ shares: [expiredShare] }, now);
  assert.equal(changed, true);
  assert.deepEqual(store.shares, []);
  assert.deepEqual(store.expiredTokenHashes, [{ tokenHash: expiredShare.tokenHash, removedAt: now }]);
  assert.equal(resolveAlbumShare(store, token, now).status, 'expired');
});
