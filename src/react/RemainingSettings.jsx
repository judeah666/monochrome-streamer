import React from 'react';

export function AudioSettings({ settings, playerLayoutOptions = [] }) {
  return (
    <SettingsGroup title="Playback" description="Controls that work with the browser audio element and your local files.">
      <label className="settings-field">
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
    <SettingsGroup title="Downloads" description="Direct browser downloads for your local files.">
      <label className="settings-field">
        <span>Download Quality</span>
        <select data-setting="downloadQuality" defaultValue={settings.downloadQuality}>
          {downloadQualityOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label className="settings-field">
        <span>Bulk Download Method</span>
        <select data-setting="bulkDownloadMethod" defaultValue={settings.bulkDownloadMethod}>
          {bulkDownloadOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label className="settings-field">
        <span>Filename Template</span>
        <input type="text" data-setting="filenameTemplate" defaultValue={settings.filenameTemplate} />
      </label>
      <label className="settings-field">
        <span>Folder Template</span>
        <input type="text" data-setting="folderTemplate" defaultValue={settings.folderTemplate} />
      </label>
      <p className="settings-help">Available: {'{discNumber}'}, {'{trackNumber}'}, {'{artist}'}, {'{title}'}, {'{album}'}, {'{albumArtist}'}, {'{year}'}. Browser security may ignore folders in the download name.</p>
      <SettingToggle settingKey="includeCoverFile" title="Include Cover File" description="Stored preference for future ZIP/export downloads." checked={settings.includeCoverFile} />
      <SettingToggle settingKey="generateM3u" title="Generate M3U" description="Stored preference for future playlist exports." checked={settings.generateM3u} />
      <SettingToggle settingKey="generateJson" title="Generate JSON" description="Stored preference for future metadata exports." checked={settings.generateJson} />
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
        <label className="settings-field">
          <span>Instance URL</span>
          <input type="url" data-setting="instanceUrl" defaultValue={instanceUrl} placeholder={instancePlaceholder} />
        </label>
        <div className="setting-row">
          <div>
            <strong>Current API</strong>
            <span>{currentApiText}</span>
          </div>
          <button type="button" className="secondary-button" data-settings-action="check-instance">Check</button>
        </div>
        <SettingToggle settingKey="devMode" title="Dev Mode" description="Show local API details for debugging this self-hosted app." checked={settings.devMode} />
      </SettingsGroup>
      <SettingsGroup title="Widget API" description="Create a small API endpoint for dashboards and other apps that only need library counts.">
        <div className="widget-api-settings" data-widget-api-settings>
          <SettingToggle settingKey="" title="Enable Widget API" description="Allow /api/widget/stats when the API key matches." checked={widget.enabled} extraAttrs={{ 'data-widget-enabled': true }} />
          <label className="settings-field">
            <span>API Key</span>
            <input type="text" data-widget-api-key defaultValue={widget.apiKey || ''} placeholder="Generate a key or paste your own" spellCheck="false" />
          </label>
          <label className="settings-field">
            <span>CORS Origin</span>
            <input type="text" data-widget-cors-origin defaultValue={widget.widgetCorsOrigin || '*'} placeholder="* or https://your-dashboard.local" spellCheck="false" />
          </label>
          <div className="setting-row widget-api-url-row">
            <div>
              <strong>Widget URL</strong>
              <span>{widget.exampleUrl}</span>
            </div>
            <div className="settings-actions">
              <button type="button" className="secondary-button" data-settings-action="copy-widget-api-url">Copy URL</button>
              <button type="button" className="secondary-button" data-settings-action="test-widget-api">Test</button>
            </div>
          </div>
          <div className="settings-actions">
            <button type="button" className="secondary-button" data-settings-action="generate-widget-api-key">Generate API Key</button>
            <button type="button" className="primary-button" data-settings-action="save-widget-api">Save Widget API</button>
          </div>
          <p className="settings-help">Current source: {widget.source}. Stats endpoint: {widget.statsUrl}</p>
        </div>
      </SettingsGroup>
      {settings.devMode ? (
        <SettingsGroup title="Debug" description="Read-only runtime information.">
          <div className="settings-code">{debugText}</div>
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
        <div className="setting-row scan-status-row">
          <div>
            <strong>{statusText}</strong>
            <span>{scanDetail}</span>
          </div>
          <button type="button" className="secondary-button" data-settings-action="refresh-library-folders">Refresh Folders</button>
        </div>
        <div className="scan-progress" aria-label="Scan progress">
          <span style={{ width: `${scan.percent}%` }} />
        </div>
        <p className="settings-help" data-library-folder-summary>Selected folders: {selectedLabel}</p>
      </SettingsGroup>

      <SettingsGroup title="Library Folders" description="Choose which top-level folders inside your mounted music folder should be indexed.">
        <div className="library-folder-list">
          {folderRows.length ? folderRows.map((folder) => (
            <label key={folder} className="library-folder-option">
              <input type="checkbox" data-library-folder={folder} defaultChecked={selectedFolders.has(folder)} />
              <span>{folder}</span>
            </label>
          )) : <p className="settings-help">No top-level folders were found in the mounted music folder.</p>}
        </div>
        <div className="settings-actions">
          <button type="button" className="secondary-button" data-settings-action="save-library-folders">Save Selected Folders</button>
          <button type="button" className="primary-button" data-settings-action="save-and-scan-library-folders">Save & Scan</button>
        </div>
        <p className="settings-help">Tip: start with one artist folder, scan, then add more folders after the app is stable.</p>
      </SettingsGroup>

      <SettingsGroup title="Library System" description="Maintenance for your local index and browser data.">
        <div className="setting-row">
          <div>
            <strong>Cache</strong>
            <span>{settings.cacheEnabled ? 'Browser settings cache is enabled.' : 'Browser settings cache is disabled.'}</span>
          </div>
          <button type="button" className="secondary-button" data-settings-action="clear-cache">Clear Cache</button>
        </div>
        <SettingToggle settingKey="cacheEnabled" title="Cache" description="Stores local settings and favorites in this browser." checked={settings.cacheEnabled} />
        <SettingToggle settingKey="autoUpdate" title="Auto-Update App" description="Reserved for a future service worker reload flow." checked={settings.autoUpdate} />
        <div className="setting-row">
          <div>
            <strong>Rescan Library</strong>
            <span>Ask the server to index your music folder again.</span>
          </div>
          <button type="button" className="secondary-button" data-settings-action="rescan-library">Rescan</button>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Backup & Restore" description="Export or import local UI settings as JSON.">
        <div className="setting-row">
          <div>
            <strong>Export All Settings</strong>
            <span>Download appearance, interface, audio, download, instance, and system settings.</span>
          </div>
          <div className="settings-actions">
            <button type="button" className="secondary-button" data-settings-action="export-settings">Export</button>
            <button type="button" className="secondary-button" data-settings-action="import-settings">Import</button>
          </div>
        </div>
        <div className="setting-row danger">
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
    <section className="settings-group">
      <div className="settings-group-heading">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className="settings-group-body">{children}</div>
    </section>
  );
}

function SettingToggle({ settingKey, title, description, checked, extraAttrs = {} }) {
  const inputProps = settingKey
    ? { 'data-setting': settingKey }
    : {};
  return (
    <label className="setting-row">
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
