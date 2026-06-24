import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSettingsPanelSnapshot,
  buildSettingsTabsSnapshot,
  createDefaultWidgetSettings,
  getAlbumCardSizePreviewData,
  getThemeAccent,
  toTitleCase,
} from '../src/controller/settingsPresenter.js';
import { DEFAULT_SETTINGS, SETTINGS_TABS } from '../src/controller/constants.js';
import { createSettingsPanelStore } from '../src/controller/settingsPanelStore.js';
import { getHueRotationDegrees } from '../src/controller/themeResolver.js';

test('buildSettingsTabsSnapshot marks the active settings tab', () => {
  assert.deepEqual(buildSettingsTabsSnapshot({ tabs: SETTINGS_TABS, activeTab: 'audio' }), {
    tabs: SETTINGS_TABS,
    activeTab: 'audio',
  });
});

test('appearance settings snapshot contains theme options and preview data', () => {
  const snapshot = buildSettingsPanelSnapshot({
    tab: 'appearance',
    settings: { ...DEFAULT_SETTINGS, customAccent: '#ff0000' },
    title: 'Library',
    displayTitle: 'My Library',
  });

  assert.equal(snapshot.tab, 'appearance');
  assert.equal(snapshot.title, 'Library');
  assert.equal(snapshot.preview.artist, 'My Library');
  assert.equal(snapshot.themeOptions.find((theme) => theme.value === 'custom').accent, '#ff0000');
  assert.ok(snapshot.fontOptions.length > 0);
});

test('light theme previews use readable text for built-in themes', () => {
  const snapshot = buildSettingsPanelSnapshot({
    tab: 'appearance',
    settings: { ...DEFAULT_SETTINGS, themeBase: 'light', customThemeBase: 'light' },
    title: 'Library',
    displayTitle: 'My Library',
  });

  assert.equal(snapshot.themeOptions.find((theme) => theme.value === 'forest').text, '#17130f');
  assert.equal(snapshot.themeOptions.find((theme) => theme.value === 'ocean').text, '#17130f');
});

test('system settings snapshot normalizes scan status and selected folders', () => {
  const snapshot = buildSettingsPanelSnapshot({
    tab: 'system',
    settings: DEFAULT_SETTINGS,
    libraryFolders: {
      available: ['Music', 'More Music'],
      selected: ['Music'],
      scan: {
        status: 'scanning',
        percent: 42,
        currentFolder: 'Music',
        processedFiles: 10,
        totalFiles: 20,
        reusedFiles: 7,
        parsedFiles: 3,
      },
    },
    pendingLibraryFolders: ['More Music'],
    libraryTotals: { tracks: 100, albums: 12 },
  });

  assert.deepEqual(snapshot.folders.selected, ['More Music']);
  assert.equal(snapshot.selectedLabel, 'More Music');
  assert.equal(snapshot.scan.statusLabel, 'Scanning');
  assert.equal(snapshot.scan.percent, 42);
  assert.equal(snapshot.stats.tracks, 100);
});

test('instance settings snapshot builds widget defaults from origin', () => {
  const snapshot = buildSettingsPanelSnapshot({
    tab: 'instances',
    settings: DEFAULT_SETTINGS,
    origin: 'http://localhost:8888',
    tracksLength: 9,
    albumsLength: 3,
    routeView: 'library',
    generatedAt: 'today',
    queueLength: 2,
  });

  assert.equal(snapshot.instanceUrl, 'http://localhost:8888');
  assert.match(snapshot.currentApiText, /9 tracks/);
  assert.equal(snapshot.widgetSettings.statsUrl, 'http://localhost:8888/api/widget/stats');
  assert.match(snapshot.debugText, /"route": "library"/);
});

test('settings presenter helper functions stay deterministic', () => {
  assert.equal(toTitleCase('edge-to-edge'), 'Edge-To-Edge');
  assert.equal(getThemeAccent('custom', { customAccent: '#123456' }), '#123456');
  assert.equal(createDefaultWidgetSettings('http://x').exampleUrl, 'http://x/api/widget/stats?apiKey=YOUR_KEY');
  assert.equal(getAlbumCardSizePreviewData('Streamer').artist, 'Streamer');
});

test('MP3 quality hue rotation follows the theme accent without flattening the icon', () => {
  assert.equal(getHueRotationDegrees('#e44b4d'), 0);
  assert.equal(getHueRotationDegrees('#00ff00'), 121);
  assert.equal(getHueRotationDegrees('#0000ff'), 241);
});

test('settings panel store publishes combined snapshots', () => {
  const store = createSettingsPanelStore();
  let calls = 0;
  const unsubscribe = store.subscribe(() => {
    calls += 1;
  });

  store.setSnapshots({
    tabs: buildSettingsTabsSnapshot({ tabs: SETTINGS_TABS, activeTab: 'system' }),
    panel: buildSettingsPanelSnapshot({ tab: 'system', settings: DEFAULT_SETTINGS }),
  });

  assert.equal(calls, 1);
  assert.equal(store.getSnapshot().tabs.activeTab, 'system');
  assert.equal(store.getSnapshot().panel.tab, 'system');

  unsubscribe();
  store.setSnapshots({ panel: buildSettingsPanelSnapshot({ tab: 'audio', settings: DEFAULT_SETTINGS }) });
  assert.equal(calls, 1);
});
