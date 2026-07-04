import React from 'react';

const settingsGroupClassName = [
  'settings-group tw-grid tw-grid-cols-[minmax(180px,0.35fr)_minmax(0,1fr)] tw-gap-[22px]',
  'tw-rounded-[22px] tw-border tw-border-line tw-bg-[linear-gradient(135deg,var(--glass),transparent_58%),var(--surface)]',
  'tw-p-5 tw-backdrop-blur-lg max-[1200px]:tw-grid-cols-1',
].join(' ');

const settingsGroupBodyClassName = 'settings-group-body tw-grid tw-min-w-0 tw-gap-3';

const settingRowClassName = [
  'setting-row tw-grid tw-grid-cols-[minmax(0,1fr)_auto] tw-items-center tw-gap-4',
  'tw-rounded-[18px] tw-border tw-border-line tw-bg-[var(--glass)] tw-p-3.5 tw-backdrop-blur-md',
  'max-[720px]:tw-grid-cols-1 max-[720px]:tw-items-start',
].join(' ');

const settingsFieldClassName = [
  'settings-field tw-grid tw-grid-cols-[180px_minmax(0,1fr)] tw-items-center tw-gap-4',
  'tw-rounded-[18px] tw-border tw-border-line tw-bg-[var(--glass)] tw-p-3.5 tw-backdrop-blur-md',
  'max-[720px]:tw-grid-cols-1 max-[720px]:tw-items-start',
].join(' ');

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
        <div className={`${settingRowClassName} is-disabled`}>
          <div>
            <strong>Show Settings in Sidebar</strong>
            <span>Always visible so you cannot lock yourself out.</span>
          </div>
          <span className="settings-pill tw-rounded-pill tw-border tw-border-line tw-px-2.5 tw-py-1.5 tw-text-[0.82rem] tw-font-extrabold tw-uppercase tw-tracking-[0.08em] tw-text-muted">Always on</span>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Navigation" description="Interaction behavior adapted to this local app.">
        <SettingToggle
          settingKey="showRecentlyAdded"
          title="Show Recently Added on Home"
          description="Display the horizontal Recently Added album row above recommended albums."
          checked={settings.showRecentlyAdded}
        />
        <SettingToggle
          settingKey="closePanelsOnNavigation"
          title="Close Panels on Navigation"
          description="Close queue and editor panels when switching views."
          checked={settings.closePanelsOnNavigation}
        />
        <SettingToggle
          settingKey="showFolderBrowser"
          title="Show Folder Browser"
          description="Adds the advanced Folders tab back to Library for checking the raw server folder structure."
          checked={settings.showFolderBrowser}
        />
        <label className={settingsFieldClassName}>
          <span>Library Albums Per Page</span>
          <select data-setting="libraryPageSize" defaultValue={settings.libraryPageSize}>
            {libraryPageSizeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={settingsFieldClassName}>
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
    <section className={settingsGroupClassName}>
      <div className="settings-group-heading">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className={settingsGroupBodyClassName}>{children}</div>
    </section>
  );
}

function SettingToggle({ settingKey, title, description, checked }) {
  return (
    <label className={settingRowClassName}>
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <input type="checkbox" data-setting={settingKey} defaultChecked={checked} />
    </label>
  );
}
