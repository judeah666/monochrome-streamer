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

const settingsHelpClassName = 'settings-help tw-mt-2 tw-text-muted tw-leading-relaxed';
const settingsActionsClassName = 'settings-actions tw-flex tw-flex-wrap tw-items-center tw-gap-2.5';
const scanProgressClassName = 'scan-progress tw-h-2.5 tw-overflow-hidden tw-rounded-pill tw-border tw-border-line tw-bg-[var(--background-soft)]';
const libraryFolderListClassName = [
  'library-folder-list tw-grid tw-max-h-[280px] tw-grid-cols-[repeat(auto-fill,minmax(190px,1fr))]',
  'tw-gap-2.5 tw-overflow-auto tw-rounded-[18px] tw-border tw-border-line tw-bg-[var(--background-soft)] tw-p-2',
].join(' ');
const libraryFolderOptionClassName = [
  'library-folder-option tw-flex tw-min-h-[42px] tw-items-center tw-gap-2.5',
  'tw-rounded-[14px] tw-border tw-border-line tw-bg-surface tw-px-3 tw-py-2.5 tw-font-extrabold tw-text-text',
].join(' ');

export function AudioSettings({ settings, playerLayoutOptions = [] }) {
  return (
    <SettingsGroup title="Playback" description="Controls that work with the browser audio element and your local files.">
      <label className={settingsFieldClassName}>
        <span>Player Layout</span>
        <select data-setting="playerLayout" defaultValue={settings.playerLayout}>
          {playerLayoutOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <SettingToggle settingKey="showQualityInfo" title="Show Quality Badges" description="Show the audio quality block in the player." checked={settings.showQualityInfo} />
      <SettingToggle settingKey="gaplessPlayback" title="Autoplay Queue" description="Automatically continue to the next queued track when one ends." checked={settings.gaplessPlayback} />
    </SettingsGroup>
  );
}

export function DownloadSettings({ settings, downloadQualityOptions = [], bulkDownloadOptions = [] }) {
  return (
    <SettingsGroup title="Downloads" description="Download originals or convert to MP3 before the file leaves the server.">
      <label className={settingsFieldClassName}>
        <span>Download Quality</span>
        <select data-setting="downloadQuality" defaultValue={settings.downloadQuality}>
          {downloadQualityOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <p className={settingsHelpClassName}>MP3 downloads are converted server-side with ffmpeg at 320 kbps. Playback still uses your original local file.</p>
      <label className={settingsFieldClassName}>
        <span>Bulk Download Method</span>
        <select data-setting="bulkDownloadMethod" defaultValue={settings.bulkDownloadMethod}>
          {bulkDownloadOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <p className={settingsHelpClassName}>Queue and album downloads can either start one file at a time or stream one ZIP archive from the server.</p>
      <label className={settingsFieldClassName}>
        <span>Filename Template</span>
        <input type="text" data-setting="filenameTemplate" defaultValue={settings.filenameTemplate} />
      </label>
      <p className={settingsHelpClassName}>Available: {'{discNumber}'}, {'{trackNumber}'}, {'{artist}'}, {'{title}'}, {'{album}'}, {'{albumArtist}'}, {'{year}'}.</p>
    </SettingsGroup>
  );
}

export function InstanceSettings({ settings, instanceUrl, instancePlaceholder, currentApiText, widgetSettings, debugText }) {
  const widget = widgetSettings || {
    enabled: false,
    apiKey: '',
    widgetCorsOrigin: '*',
    source: 'none',
    statsUrl: '/api/widget/stats',
    exampleUrl: '/api/widget/stats?apiKey=YOUR_KEY',
  };

  return (
    <>
      <SettingsGroup title="Local Instance" description="Manage the API instance this browser is using.">
        <label className={settingsFieldClassName}>
          <span>Instance URL</span>
          <input type="url" data-setting="instanceUrl" defaultValue={instanceUrl} placeholder={instancePlaceholder} />
        </label>
        <div className={settingRowClassName}>
          <div>
            <strong>Current API</strong>
            <span>{currentApiText}</span>
          </div>
          <button type="button" className="secondary-button" data-settings-action="check-instance">Check</button>
        </div>
        <SettingToggle settingKey="devMode" title="Dev Mode" description="Show local API details for debugging this self-hosted app." checked={settings.devMode} />
      </SettingsGroup>
      <SettingsGroup title="Widget API" description="Create a small API endpoint for dashboards and other apps that only need library counts.">
        <div className="widget-api-settings tw-grid tw-min-w-0 tw-gap-3" data-widget-api-settings>
          <SettingToggle settingKey="" title="Enable Widget API" description="Allow /api/widget/stats when the API key matches." checked={widget.enabled} extraAttrs={{ 'data-widget-enabled': true }} />
          <label className={settingsFieldClassName}>
            <span>API Key</span>
            <input type="text" data-widget-api-key defaultValue={widget.apiKey || ''} placeholder="Generate a key or paste your own" spellCheck="false" />
          </label>
          <label className={settingsFieldClassName}>
            <span>CORS Origin</span>
            <input type="text" data-widget-cors-origin defaultValue={widget.widgetCorsOrigin || '*'} placeholder="* or https://your-dashboard.local" spellCheck="false" />
          </label>
          <div className={`${settingRowClassName} widget-api-url-row`}>
            <div>
              <strong>Widget URL</strong>
              <span>{widget.exampleUrl}</span>
            </div>
            <div className={settingsActionsClassName}>
              <button type="button" className="secondary-button" data-settings-action="copy-widget-api-url">Copy URL</button>
              <button type="button" className="secondary-button" data-settings-action="test-widget-api">Test</button>
            </div>
          </div>
          <div className={settingsActionsClassName}>
            <button type="button" className="secondary-button" data-settings-action="generate-widget-api-key">Generate API Key</button>
            <button type="button" className="primary-button" data-settings-action="save-widget-api">Save Widget API</button>
          </div>
          <p className={settingsHelpClassName}>Current source: {widget.source}. Stats endpoint: {widget.statsUrl}</p>
        </div>
      </SettingsGroup>
      {settings.devMode ? (
        <SettingsGroup title="Debug" description="Read-only runtime information.">
          <div className="settings-code tw-rounded-[18px] tw-border tw-border-line tw-bg-[var(--glass)] tw-p-3.5 tw-font-mono tw-text-sm tw-text-text">{debugText}</div>
        </SettingsGroup>
      ) : null}
    </>
  );
}

export function SystemSettings({ settings, folders, scan, selectedLabel, stats }) {
  const selectedFolders = new Set(folders.selected || []);
  const folderRows = folders.available || [];
  const statusText = `${scan.statusLabel} · ${scan.percent}%`;
  const scanDetail = `${scan.currentFolder ? `Scanning ${scan.currentFolder}` : selectedLabel} · ${scan.processed}/${scan.total} files · ${scan.reused} cached · ${scan.parsed} parsed · ${stats.tracks} tracks · ${stats.albums} albums`;

  return (
    <>
      <SettingsGroup title="Scan Status" description="Watch the current scan and choose which folders are included.">
        <div className={`${settingRowClassName} scan-status-row`}>
          <div>
            <strong>{statusText}</strong>
            <span>{scanDetail}</span>
          </div>
          <button type="button" className="secondary-button" data-settings-action="refresh-library-folders">Refresh Folders</button>
        </div>
        <div className={scanProgressClassName} aria-label="Scan progress">
          <span className="tw-block tw-h-full tw-rounded-pill tw-bg-[linear-gradient(90deg,var(--accent),color-mix(in_srgb,var(--accent)_55%,#fff))] tw-transition-[width]" style={{ width: `${scan.percent}%` }} />
        </div>
        <p className={settingsHelpClassName} data-library-folder-summary>Selected folders: {selectedLabel}</p>
      </SettingsGroup>

      <SettingsGroup title="Library Folders" description="Choose which top-level folders inside your mounted music folder should be indexed.">
        <div className={libraryFolderListClassName}>
          {folderRows.length ? folderRows.map((folder) => (
            <label key={folder} className={libraryFolderOptionClassName}>
              <input type="checkbox" data-library-folder={folder} defaultChecked={selectedFolders.has(folder)} />
              <span>{folder}</span>
            </label>
          )) : <p className={settingsHelpClassName}>No top-level folders were found in the mounted music folder.</p>}
        </div>
        <div className={settingsActionsClassName}>
          <button type="button" className="secondary-button" data-settings-action="save-library-folders">Save Selected Folders</button>
          <button type="button" className="primary-button" data-settings-action="save-and-scan-library-folders">Save & Scan</button>
        </div>
        <p className={settingsHelpClassName}>Tip: start with one artist folder, scan, then add more folders after the app is stable.</p>
      </SettingsGroup>

      <SettingsGroup title="Library System" description="Maintenance for your local index and browser data.">
        <div className={settingRowClassName}>
          <div>
            <strong>Cache</strong>
            <span>{settings.cacheEnabled ? 'Browser settings cache is enabled.' : 'Browser settings cache is disabled.'}</span>
          </div>
          <button type="button" className="secondary-button" data-settings-action="clear-cache">Clear Cache</button>
        </div>
        <SettingToggle settingKey="cacheEnabled" title="Cache" description="Stores local settings and favorites in this browser." checked={settings.cacheEnabled} />
        <SettingToggle settingKey="autoUpdate" title="Auto-Update App" description="Reserved for a future service worker reload flow." checked={settings.autoUpdate} />
        <div className={settingRowClassName}>
          <div>
            <strong>Rescan Library</strong>
            <span>Ask the server to index your music folder again.</span>
          </div>
          <button type="button" className="secondary-button" data-settings-action="rescan-library">Rescan</button>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Backup & Restore" description="Export or import local UI settings as JSON.">
        <div className={settingRowClassName}>
          <div>
            <strong>Export All Settings</strong>
            <span>Download appearance, interface, audio, download, instance, and system settings.</span>
          </div>
          <div className={settingsActionsClassName}>
            <button type="button" className="secondary-button" data-settings-action="export-settings">Export</button>
            <button type="button" className="secondary-button" data-settings-action="import-settings">Import</button>
          </div>
        </div>
        <div className={`${settingRowClassName} danger tw-border-[rgba(255,82,82,0.36)] tw-bg-[rgba(255,82,82,0.08)]`}>
          <div>
            <strong>Reset Local Data</strong>
            <span>Clear settings, favorites, and playback state from this browser.</span>
          </div>
          <button type="button" className="secondary-button" data-settings-action="reset-local-data">Reset</button>
        </div>
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

function SettingToggle({ settingKey, title, description, checked, extraAttrs = {} }) {
  const inputProps = settingKey
    ? { 'data-setting': settingKey }
    : {};
  return (
    <label className={settingRowClassName}>
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <input
        key={`${settingKey || title}-${checked ? 'on' : 'off'}`}
        type="checkbox"
        {...inputProps}
        {...extraAttrs}
        defaultChecked={checked}
      />
    </label>
  );
}
