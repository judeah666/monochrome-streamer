import React from 'react';

export function InterfaceSettings({
  settings,
  libraryPageSizeOptions = [],
  nowPlayingClickOptions = [],
}) {
  return (
    <>
      <SettingsGroup title="Sidebar" description="Choose which local navigation links are visible.">
        <SettingToggle
          settingKey="showHome"
          title="Show Home in Sidebar"
          description="Display the Home link in sidebar navigation."
          checked={settings.showHome}
        />
        <SettingToggle
          settingKey="showLibrary"
          title="Show Library in Sidebar"
          description="Display the Library link in sidebar navigation."
          checked={settings.showLibrary}
        />
        <SettingToggle
          settingKey="showFavorites"
          title="Show Favorites in Sidebar"
          description="Display the Favorites link in sidebar navigation."
          checked={settings.showFavorites}
        />
        <SettingToggle
          settingKey="sidebarCollapsed"
          title="Collapse Sidebar"
          description="Use icon-only navigation and compact sidebar status."
          checked={settings.sidebarCollapsed}
        />
        <div className="setting-row is-disabled">
          <div>
            <strong>Show Settings in Sidebar</strong>
            <span>Always visible so you cannot lock yourself out.</span>
          </div>
          <span className="settings-pill">Always on</span>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Navigation" description="Interaction behavior adapted to this local app.">
        <SettingToggle
          settingKey="closePanelsOnNavigation"
          title="Close Panels on Navigation"
          description="Close queue and editor panels when switching views."
          checked={settings.closePanelsOnNavigation}
        />
        <label className="settings-field">
          <span>Library Albums Per Page</span>
          <select data-setting="libraryPageSize" defaultValue={settings.libraryPageSize}>
            {libraryPageSizeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="settings-field">
          <span>Now Playing Click Action</span>
          <select data-setting="nowPlayingClickAction" defaultValue={settings.nowPlayingClickAction}>
            {nowPlayingClickOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </SettingsGroup>
    </>
  );
}

function SettingsGroup({ title, description, children }) {
  return (
    <section className="settings-group">
      <div className="settings-group-heading">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className="settings-group-body">{children}</div>
    </section>
  );
}

function SettingToggle({ settingKey, title, description, checked }) {
  return (
    <label className="setting-row">
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <input type="checkbox" data-setting={settingKey} defaultChecked={checked} />
    </label>
  );
}
