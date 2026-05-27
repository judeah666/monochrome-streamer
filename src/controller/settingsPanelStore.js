import { buildSettingsPanelSnapshot, buildSettingsTabsSnapshot } from './settingsPresenter.js';

export function createSettingsPanelStore() {
  let tabsSnapshot = buildSettingsTabsSnapshot();
  let panelSnapshot = buildSettingsPanelSnapshot();
  let snapshot = {
    tabs: tabsSnapshot,
    panel: panelSnapshot,
  };
  const listeners = new Set();

  return {
    getSnapshot() {
      return snapshot;
    },
    getTabsSnapshot() {
      return tabsSnapshot;
    },
    getPanelSnapshot() {
      return panelSnapshot;
    },
    setSnapshots({ tabs, panel } = {}) {
      if (tabs) tabsSnapshot = tabs;
      if (panel) panelSnapshot = panel;
      snapshot = {
        tabs: tabsSnapshot,
        panel: panelSnapshot,
      };
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
