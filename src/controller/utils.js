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

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
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
