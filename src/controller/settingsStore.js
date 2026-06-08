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
  persistThemeCookie(settings);
}

export function readStoredSettings() {
  const storedSettings = readStoredObject(STORAGE_KEYS.settings);
  const hadLegacyZipFolderKey = Boolean(
    storedSettings
    && typeof storedSettings === 'object'
    && !Array.isArray(storedSettings)
    && Object.prototype.hasOwnProperty.call(storedSettings, 'folderTemplate')
  );
  const normalizedSettings = normalizeSettings(storedSettings);
  persistThemeCookie({
    ...DEFAULT_SETTINGS,
    ...normalizedSettings,
  });
  if (hadLegacyZipFolderKey) {
    persistSettings({
      ...DEFAULT_SETTINGS,
      ...normalizedSettings,
    });
  }
  return {
    ...DEFAULT_SETTINGS,
    ...normalizedSettings,
  };
}

export function normalizeSettings(settings) {
  const normalized = settings && typeof settings === 'object' && !Array.isArray(settings)
    ? { ...settings }
    : {};

  removeLegacySettings(normalized);
  migrateLegacyDownloadTemplateKeys(normalized);

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

function migrateLegacyDownloadTemplateKeys(settings) {
  if (!settings || typeof settings !== 'object') return;
  const legacyFolderTemplate = typeof settings.folderTemplate === 'string'
    ? settings.folderTemplate.trim()
    : '';
  const currentZipEntryTemplate = typeof settings.zipEntryFolderTemplate === 'string'
    ? settings.zipEntryFolderTemplate.trim()
    : '';
  if (legacyFolderTemplate && !currentZipEntryTemplate) {
    settings.zipEntryFolderTemplate = settings.folderTemplate;
  }
  delete settings.folderTemplate;
}

function persistThemeCookie(settings) {
  if (typeof document === 'undefined') return;
  try {
    const themePayload = encodeURIComponent(JSON.stringify({
      theme: settings?.theme || DEFAULT_SETTINGS.theme,
      themeBase: settings?.themeBase || settings?.customThemeBase || DEFAULT_SETTINGS.themeBase,
      customThemeBase: settings?.customThemeBase || settings?.themeBase || DEFAULT_SETTINGS.customThemeBase,
      customAccent: settings?.customAccent || DEFAULT_SETTINGS.customAccent,
    }));
    document.cookie = `${STORAGE_KEYS.themeCookie}=${themePayload}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch (error) {
    // Ignore cookie sync issues and keep localStorage as the primary source of truth.
  }
}
