import { createHash } from 'node:crypto';

export const MIN_ALBUM_SHARE_HOURS = 1;
export const MAX_ALBUM_SHARE_HOURS = 30 * 24;
export const DEFAULT_ALBUM_SHARE_HOURS = 24;
const ALBUM_SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/u;
const EXPIRED_SHARE_TOMBSTONE_MS = 90 * 24 * 60 * 60 * 1000;

export function parseAlbumShareDurationHours(value) {
  const hours = Number(value);
  return Number.isInteger(hours)
    && hours >= MIN_ALBUM_SHARE_HOURS
    && hours <= MAX_ALBUM_SHARE_HOURS
    ? hours
    : null;
}

export function isAlbumShareToken(value) {
  return ALBUM_SHARE_TOKEN_PATTERN.test(String(value || ''));
}

export function hashAlbumShareToken(token) {
  return createHash('sha256').update(String(token || '')).digest('hex');
}

export function normalizeAlbumShareStore(value) {
  const shares = Array.isArray(value?.shares) ? value.shares : [];
  const expiredTokenHashes = Array.isArray(value?.expiredTokenHashes) ? value.expiredTokenHashes : [];
  return {
    version: 1,
    shares: shares
      .filter((share) => (
        /^[a-f0-9]{64}$/u.test(String(share?.tokenHash || ''))
        && String(share?.albumId || '')
        && Number.isFinite(Number(share?.createdAt))
        && Number.isFinite(Number(share?.expiresAt))
      ))
      .map((share) => ({
        tokenHash: String(share.tokenHash),
        albumId: String(share.albumId),
        createdBy: String(share.createdBy || ''),
        createdAt: Number(share.createdAt),
        expiresAt: Number(share.expiresAt),
      })),
    expiredTokenHashes: expiredTokenHashes
      .filter((entry) => (
        /^[a-f0-9]{64}$/u.test(String(entry?.tokenHash || ''))
        && Number.isFinite(Number(entry?.removedAt))
      ))
      .map((entry) => ({
        tokenHash: String(entry.tokenHash),
        removedAt: Number(entry.removedAt),
      })),
  };
}

export function resolveAlbumShare(store, token, now = Date.now()) {
  if (!isAlbumShareToken(token)) return { status: 'missing', share: null };
  const tokenHash = hashAlbumShareToken(token);
  const normalized = normalizeAlbumShareStore(store);
  const share = normalized.shares.find((candidate) => candidate.tokenHash === tokenHash);
  if (normalized.expiredTokenHashes.some((entry) => entry.tokenHash === tokenHash)) {
    return { status: 'expired', share: null };
  }
  if (!share) return { status: 'missing', share: null };
  if (share.expiresAt <= now) return { status: 'expired', share };
  return { status: 'active', share };
}

export function removeExpiredAlbumShares(store, now = Date.now()) {
  const normalized = normalizeAlbumShareStore(store);
  const expiredShares = normalized.shares.filter((share) => share.expiresAt <= now);
  const shares = normalized.shares.filter((share) => share.expiresAt > now);
  const expiredTokenHashes = [
    ...normalized.expiredTokenHashes.filter((entry) => now - entry.removedAt < EXPIRED_SHARE_TOMBSTONE_MS),
    ...expiredShares.map((share) => ({ tokenHash: share.tokenHash, removedAt: now })),
  ].filter((entry, index, entries) => (
    entries.findIndex((candidate) => candidate.tokenHash === entry.tokenHash) === index
  ));
  return {
    store: { ...normalized, shares, expiredTokenHashes },
    changed: shares.length !== normalized.shares.length
      || expiredTokenHashes.length !== normalized.expiredTokenHashes.length,
  };
}
