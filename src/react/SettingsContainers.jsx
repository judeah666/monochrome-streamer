import React, { useSyncExternalStore } from 'react';
import { SettingsTabs } from './SettingsTabs.jsx';
import { AppearanceSettings } from './AppearanceSettings.jsx';
import { InterfaceSettings } from './InterfaceSettings.jsx';
import { AudioSettings, DownloadSettings, InstanceSettings, SystemSettings } from './RemainingSettings.jsx';

function useSettingsSnapshots(store) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export function SettingsTabsContainer({ store }) {
  const { tabs } = useSettingsSnapshots(store);
  return <SettingsTabs {...tabs} />;
}

export function SettingsPanelContainer({ store }) {
  const { panel } = useSettingsSnapshots(store);

  if (panel.tab === 'appearance') return <AppearanceSettings {...panel} />;
  if (panel.tab === 'interface') return <InterfaceSettings {...panel} />;
  if (panel.tab === 'audio') return <AudioSettings {...panel} />;
  if (panel.tab === 'downloads') return <DownloadSettings {...panel} />;
  if (panel.tab === 'instances') return <InstanceSettings {...panel} />;
  if (panel.tab === 'system') return <SystemSettings {...panel} />;
  return null;
}
