import {
  DEFAULT_SETTINGS,
  LEGACY_SETTING_KEYS,
  NOW_PLAYING_CLICK_ACTIONS,
  STORAGE_KEYS,
} from './constants.js';
import { readStoredObject } from './utils.js';

export function clampAlbumCardSize(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_SETTINGS.albumCardSize;
  return Math.min(230, Math.max(145, parsed));
}

export function persistSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function readStoredSettings() {
  return {
    ...DEFAULT_SETTINGS,
    ...normalizeSettings(readStoredObject(STORAGE_KEYS.settings)),
  };
}

export function normalizeSettings(settings) {
  const normalized = settings && typeof settings === 'object' && !Array.isArray(settings)
    ? { ...settings }
    : {};

  removeLegacySettings(normalized);

  if (normalized.theme === 'machiatto') {
    normalized.theme = 'macchiato';
  }
  if (!['dark', 'light'].includes(normalized.themeBase)) {
    normalized.themeBase = ['dark', 'light'].includes(normalized.customThemeBase)
      ? normalized.customThemeBase
      : (normalized.theme === 'white' || normalized.theme === 'latte' ? 'light' : undefined);
  }
  if (normalized.themeBase) {
    normalized.customThemeBase = normalized.themeBase;
  } else {
    delete normalized.themeBase;
  }
  if (normalized.nowPlayingClickAction === 'library') {
    normalized.nowPlayingClickAction = 'artist';
  }
  if (normalized.nowPlayingClickAction === 'album' && !normalized.nowPlayingClickActionUserSet) {
    normalized.nowPlayingClickAction = DEFAULT_SETTINGS.nowPlayingClickAction;
  }
  if (normalized.nowPlayingClickAction && !NOW_PLAYING_CLICK_ACTIONS.has(normalized.nowPlayingClickAction)) {
    delete normalized.nowPlayingClickAction;
  }
  if (typeof normalized.libraryTitle === 'string' && normalized.libraryTitle.trim() === '') {
    delete normalized.libraryTitle;
  }
  if (normalized.albumCardSize != null) {
    normalized.albumCardSize = clampAlbumCardSize(normalized.albumCardSize);
  }
  if (normalized.bulkDownloadMethod && !['browser', 'zip'].includes(normalized.bulkDownloadMethod)) {
    normalized.bulkDownloadMethod = DEFAULT_SETTINGS.bulkDownloadMethod;
  }

  return normalized;
}

function removeLegacySettings(settings) {
  for (const key of LEGACY_SETTING_KEYS) {
    delete settings[key];
  }
}
