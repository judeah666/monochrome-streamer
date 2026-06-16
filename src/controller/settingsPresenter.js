import {
  DEFAULT_SETTINGS,
  PALETTE_THEMES,
  THEME_BASE_OPTIONS,
} from './constants.js';
import { getThemePreview as resolveThemePreview } from './themeResolver.js';

export function toTitleCase(value) {
  return String(value).replace(/(^|\s|-)\w/gu, (match) => match.toUpperCase());
}

export function getThemeAccent(themeName, settings = DEFAULT_SETTINGS) {
  return resolveThemePreview(themeName, settings).accent;
}

export function getThemePreview(themeName, settings = DEFAULT_SETTINGS) {
  return resolveThemePreview(themeName, settings);
}

export function createDefaultWidgetSettings(origin = '') {
  const statsUrl = `${origin}/api/widget/stats`;
  return {
    enabled: false,
    apiKey: '',
    hasApiKey: false,
    widgetCorsOrigin: '*',
    source: 'none',
    endpoint: '/api/widget/stats',
    statsUrl,
    exampleUrl: `${statsUrl}?apiKey=YOUR_KEY`,
  };
}

export function getAlbumCardSizePreviewData(displayTitle = DEFAULT_SETTINGS.libraryTitle) {
  return {
    title: 'Sampler Album',
    artist: displayTitle,
    year: '2026',
    mediaTypes: ['CD', 'Digital Media', 'Vinyl', 'Cassette Tape'],
    status: 'Collection',
  };
}

export function buildSettingsTabsSnapshot({ tabs = [], activeTab = 'appearance' } = {}) {
  return {
    tabs,
    activeTab,
  };
}

export function buildSettingsPanelSnapshot({
  tab = 'appearance',
  settings = DEFAULT_SETTINGS,
  title = DEFAULT_SETTINGS.libraryTitle,
  displayTitle = title,
  origin = '',
  tracksLength = 0,
  albumsLength = 0,
  routeView = 'home',
  generatedAt = '',
  queueLength = 0,
  widgetSettings = null,
  libraryFolders = null,
  pendingLibraryFolders = null,
  libraryTotals = {},
} = {}) {
  const base = {
    tab,
    settings: { ...settings },
  };

  if (tab === 'appearance') {
    const builtInThemes = ['system', 'black', 'white', 'dark', 'ocean', 'purple', 'forest', 'mocha', 'macchiato', 'frappe', 'latte', 'custom'];
    const paletteThemes = Object.entries(PALETTE_THEMES).map(([value, theme]) => ({
      value,
      label: theme.label,
    }));
    return {
      ...base,
      title,
      themeOptions: [
        ...builtInThemes.map((theme) => ({
          value: theme,
          label: toTitleCase(theme),
        })),
        ...paletteThemes,
      ].map((theme) => ({
        ...theme,
        ...getThemePreview(theme.value, settings),
      })),
      themeBaseOptions: THEME_BASE_OPTIONS,
      fontOptions: [
        ['jakarta', 'Plus Jakarta Sans'],
        ['inter', 'Inter'],
        ['system', 'System UI'],
        ['mono', 'Monospace'],
        ['serif', 'Serif'],
      ],
      customThemeBaseOptions: THEME_BASE_OPTIONS,
      preview: getAlbumCardSizePreviewData(displayTitle),
    };
  }

  if (tab === 'interface') {
    return {
      ...base,
      libraryPageSizeOptions: [[25, '25'], [50, '50'], [100, '100'], [200, '200'], [500, '500']],
      nowPlayingClickOptions: [
        ['album', 'Go To Album'],
        ['fullscreen', 'Go To Now Playing'],
        ['artist', 'Go To Artist'],
        ['none', 'Do Nothing'],
      ],
    };
  }

  if (tab === 'audio') {
    return {
      ...base,
      playerLayoutOptions: [
        ['floating', 'Floating Player'],
        ['qobuz', 'Qobuz Player'],
      ],
    };
  }

  if (tab === 'downloads') {
    return {
      ...base,
      downloadQualityOptions: [
        ['original', 'Original Local File'],
        ['mp3', 'MP3 320 kbps (convert on download)'],
      ],
      bulkDownloadOptions: [
        ['browser', 'One-by-one browser downloads'],
        ['zip', 'ZIP archive before downloading'],
      ],
    };
  }

  if (tab === 'instances') {
    const widget = widgetSettings || createDefaultWidgetSettings(origin);
    return {
      ...base,
      instanceUrl: settings.instanceUrl || origin,
      instancePlaceholder: origin,
      currentApiText: `${origin} · ${tracksLength} tracks · ${albumsLength} albums`,
      widgetSettings: widget,
      debugText: JSON.stringify({
        route: routeView,
        libraryGeneratedAt: generatedAt,
        queueLength,
        widgetApiEnabled: Boolean(widget.enabled),
      }, null, 2),
    };
  }

  if (tab === 'system') {
    const folders = libraryFolders || { available: [], selected: [], scan: null };
    const effectiveSelectedFolders = pendingLibraryFolders || folders.selected || [];
    const scan = folders.scan || {};
    const percent = Number.isFinite(scan.percent) ? scan.percent : 0;
    return {
      ...base,
      folders: {
        available: folders.available || [],
        selected: effectiveSelectedFolders,
      },
      selectedLabel: effectiveSelectedFolders.length ? effectiveSelectedFolders.join(', ') : 'No folders selected yet',
      scan: {
        statusLabel: toTitleCase(scan.status || 'idle'),
        percent,
        currentFolder: scan.currentFolder || '',
        processed: Number.isFinite(scan.processedFiles) ? scan.processedFiles : 0,
        total: Number.isFinite(scan.totalFiles) ? scan.totalFiles : 0,
        reused: Number.isFinite(scan.reusedFiles) ? scan.reusedFiles : 0,
        parsed: Number.isFinite(scan.parsedFiles) ? scan.parsedFiles : 0,
      },
      stats: {
        tracks: libraryTotals.tracks || tracksLength,
        albums: libraryTotals.albums || albumsLength,
      },
    };
  }

  return base;
}
