import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const SESSION_IDLE_MS = 12 * 60 * 60 * 1000;
export const SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;
export const LOGIN_MAX_FAILURES = 5;
export const DOWNLOAD_WINDOW_MS = 60 * 1000;
export const DOWNLOAD_MAX_REQUESTS = 12;
export const MAX_BULK_DOWNLOAD_TRACKS = 250;
export const DEFAULT_MAX_CONCURRENT_MP3_DOWNLOADS = 2;

export function createSessionRecord({ username, role }, now = Date.now()) {
  return {
    username,
    role,
    csrfToken: randomBytes(24).toString('base64url'),
    createdAt: now,
    lastSeenAt: now,
    expiresAt: Math.min(now + SESSION_IDLE_MS, now + SESSION_ABSOLUTE_MS),
  };
}

export function refreshSessionRecord(session, now = Date.now()) {
  if (!session || typeof session !== 'object') return null;
  const createdAt = Number(session.createdAt) || now;
  const absoluteExpiry = createdAt + SESSION_ABSOLUTE_MS;
  const expiresAt = Number(session.expiresAt) || 0;
  if (expiresAt < now || absoluteExpiry < now) return null;

  session.createdAt = createdAt;
  session.lastSeenAt = now;
  session.expiresAt = Math.min(now + SESSION_IDLE_MS, absoluteExpiry);
  if (!session.csrfToken) {
    session.csrfToken = randomBytes(24).toString('base64url');
  }
  return session;
}

export function isWeakAdminCredentials(username, password) {
  const safeUsername = String(username || '').trim();
  const safePassword = String(password || '');
  if (!safeUsername || !safePassword) return true;
  if (safePassword.length < 12) return true;
  if (safeUsername.toLowerCase() === safePassword.toLowerCase()) return true;
  return safeUsername.toLowerCase() === 'admin' && safePassword === 'admin';
}

export function timingSafeStringEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function timingSafeTextEqual(left, right) {
  const leftHash = createHash('sha256').update(String(left)).digest();
  const rightHash = createHash('sha256').update(String(right)).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function normalizeCorsOrigin(value) {
  const candidate = String(value || '').trim();
  if (!candidate || candidate === '*') return '';
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.origin;
  } catch {
    return '';
  }
}

export function isPlaceholderWidgetApiKey(value) {
  const apiKey = String(value || '').trim();
  return !apiKey || apiKey === 'change-this-widget-key' || apiKey === 'YOUR_KEY';
}
