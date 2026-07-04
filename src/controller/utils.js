export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getRelativePointerPosition(event, element) {
  const rect = element.getBoundingClientRect();
  return clamp((event.clientX - rect.left) / rect.width, 0, 1);
}

export function formatTimestamp(value) {
  if (!value) return 'unknown time';
  return new Date(value).toLocaleString();
}

export function extractYear(value) {
  const match = String(value || '').match(/\b(\d{4})\b/u);
  return match ? match[1] : '';
}

export function formatSeconds(value) {
  if (!Number.isFinite(value) || value <= 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function applyTemplate(template, values) {
  return String(template || '').replace(/\{(\w+)\}/gu, (_, key) => values[key] ?? '');
}

export function sanitizeFilename(value) {
  return String(value || 'download')
    .replace(/[<>:"/\\|?*]+/gu, '-')
    .replace(/\s+/gu, ' ')
    .trim() || 'download';
}

export function getFileExtension(relativePath) {
  const match = String(relativePath || '').match(/(\.[a-z0-9]{2,5})$/iu);
  return match ? match[1] : '';
}

export function readStoredObject(key) {
  const rawValue = localStorage.getItem(key);
  if (rawValue == null) return {};

  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function readStoredNumber(key, fallbackValue) {
  const rawValue = localStorage.getItem(key);
  if (rawValue == null) return fallbackValue;
  const parsed = Number.parseFloat(rawValue);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
}

export function readStoredNumberFromObject(key, property, fallbackValue) {
  const parsed = readStoredObject(key);
  const value = Number.parseFloat(parsed[property]);
  return Number.isFinite(value) ? value : fallbackValue;
}

export function readStoredIdSet(key) {
  const rawValue = localStorage.getItem(key);
  if (rawValue == null) return new Set();

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

export function writeStoredIdSet(key, values) {
  localStorage.setItem(key, JSON.stringify([...values]));
}

let csrfToken = '';

export function setCsrfToken(value) {
  csrfToken = String(value || '').trim();
  if (typeof window !== 'undefined') {
    window.__MONOCHROME_CSRF_TOKEN__ = csrfToken;
  }
}

export function getCsrfToken() {
  if (csrfToken) return csrfToken;
  if (typeof window !== 'undefined') {
    return String(window.__MONOCHROME_CSRF_TOKEN__ || '').trim();
  }
  return '';
}

export function isStateChangingMethod(method) {
  const normalizedMethod = String(method || '').toUpperCase();
  return normalizedMethod === 'POST' || normalizedMethod === 'PUT' || normalizedMethod === 'PATCH' || normalizedMethod === 'DELETE';
}

export async function fetchJson(url, options = {}) {
  const startedAt = typeof performance !== 'undefined' ? performance.now() : 0;
  const method = options.method || (options.body != null ? 'POST' : 'GET');
  const headers = new Headers(options.headers || {});
  if (options.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (isStateChangingMethod(method)) {
    const currentCsrfToken = getCsrfToken();
    if (currentCsrfToken) headers.set('X-CSRF-Token', currentCsrfToken);
  }
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'same-origin',
    ...options,
    method,
    headers,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }
  const payload = await response.json();
  logClientPerf('fetchJson', `${method} ${url}`, startedAt);
  return payload;
}

function logClientPerf(kind, label, startedAt, thresholdMs = 250) {
  if (!startedAt || typeof performance === 'undefined' || typeof window === 'undefined') return;
  const enabled = window.__MONOCHROME_DEBUG_PERF__
    || window.localStorage?.getItem('MONOCHROME_DEBUG_PERF') === 'true';
  if (!enabled) return;
  const elapsedMs = Math.round(performance.now() - startedAt);
  if (elapsedMs < thresholdMs) return;
  console.debug(`[perf] ${kind} ${label}: ${elapsedMs}ms`);
}

export async function postBlob(url, body, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const currentCsrfToken = getCsrfToken();
  if (currentCsrfToken) headers.set('X-CSRF-Token', currentCsrfToken);
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'same-origin',
    ...options,
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body || {}),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }
  return response;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function delay(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}
