import React, { useSyncExternalStore } from 'react';
import { SettingsTabs } from './SettingsTabs.jsx';
import { AppearanceSettings } from './AppearanceSettings.jsx';
import { InterfaceSettings } from './InterfaceSettings.jsx';
import { AudioSettings, DownloadSettings, InstanceSettings, SystemSettings } from './RemainingSettings.jsx';

function useSettingsSnapshots(store) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export function SettingsTabsContainer({ store, onSelect }) {
  const { tabs } = useSettingsSnapshots(store);
  return <SettingsTabs {...tabs} onSelect={onSelect} />;
}

export function SettingsPanelContainer({ store }) {
  const { panel } = useSettingsSnapshots(store);

  const components = { appearance: AppearanceSettings, interface: InterfaceSettings, audio: AudioSettings, downloads: DownloadSettings, instances: InstanceSettings, system: SystemSettings };
  const Component = components[panel.tab];
  return Component ? <div id="options-settings-panel" className="settings-category-panel" role="tabpanel" aria-labelledby={'options-tab-' + panel.tab}><Component {...panel} /></div> : null;
}
