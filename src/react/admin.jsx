import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DEFAULT_SETTINGS, FONT_OPTIONS, FONT_PRESETS, STORAGE_KEYS } from '../controller/constants.js';
import { isLightTheme, resolveThemePreset } from '../controller/themeResolver.js';
import { getCsrfToken } from '../controller/utils.js';
import { mergeDiscoveredLibraryFolders } from '../shared/libraryFolders.js';

const ADMIN_TABS = [
  ['users', 'Users', 'fa-users'],
  ['downloads', 'Downloads', 'fa-download'],
  ['instances', 'Instances', 'fa-key'],
  ['system', 'System', 'fa-server'],
];
const EXCEL_MEDIA_TYPES = ['CD', 'Digital Media', 'Vinyl', 'Cassette Tape'];

const settingGroupClassName = [
  'settings-group admin-settings-group tw-grid tw-grid-cols-[minmax(180px,0.35fr)_minmax(0,1fr)] tw-gap-[22px]',
  'tw-rounded-[22px] tw-border tw-border-line tw-bg-[linear-gradient(135deg,var(--glass),transparent_58%),var(--surface)]',
  'tw-p-5 tw-backdrop-blur-lg max-[1200px]:tw-grid-cols-1',
].join(' ');
const settingBodyClassName = 'settings-group-body tw-grid tw-min-w-0 tw-gap-3';
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
const settingsFieldStackClassName = 'tw-grid tw-gap-3';
const settingsActionsClassName = 'settings-actions tw-flex tw-flex-wrap tw-items-center tw-gap-2.5';
const settingsHelpClassName = 'settings-help tw-mt-2 tw-text-muted tw-leading-relaxed';
const scanProgressClassName = 'scan-progress tw-h-2.5 tw-overflow-hidden tw-rounded-pill tw-border tw-border-line tw-bg-[var(--background-soft)]';
const libraryFolderListClassName = [
  'library-folder-list tw-grid tw-max-h-[280px] tw-grid-cols-[repeat(auto-fill,minmax(190px,1fr))]',
  'tw-gap-2.5 tw-overflow-auto tw-rounded-[18px] tw-border tw-border-line tw-bg-[var(--background-soft)] tw-p-2',
].join(' ');
const libraryFolderOptionClassName = [
  'library-folder-option tw-flex tw-min-h-[42px] tw-items-center tw-gap-2.5',
  'tw-rounded-[14px] tw-border tw-border-line tw-bg-surface tw-px-3 tw-py-2.5 tw-font-extrabold tw-text-text',
].join(' ');

export function AdminSettingsPanel({ embedded = false, appSettings = null, onAppSettingChange = null }) {
  const savedSettings = loadSavedSettings();
  const adminThemeMode = isLightTheme(savedSettings) ? 'light' : 'dark';
  const [activeTab, setActiveTab] = useState('users');
  const [status, setStatus] = useState('');
  const [config, setConfig] = useState(null);
  const [users, setUsers] = useState({ admin: null, users: [] });
  const [downloadSettings, setDownloadSettings] = useState(null);
  const [widget, setWidget] = useState(null);
  const [folders, setFolders] = useState({ available: [], selected: [], scan: {} });
  const [selectedFolders, setSelectedFolders] = useState(new Set());
  const [fontSettings, setFontSettings] = useState(() => getFontSettings(appSettings || savedSettings));

  const appTitle = config?.title || 'Monochrome-Streamer';
  const adminUser = users.admin?.username || 'admin';

  useEffect(() => {
    applySavedTheme();
    loadAll().catch((error) => setStatus(error.message));
  }, []);

  useEffect(() => {
    if (embedded && appSettings) {
      setFontSettings(getFontSettings(appSettings));
    }
  }, [embedded, appSettings?.fontPreset, appSettings?.fontSize]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (activeTab === 'system') {
        loadFolders({ quiet: true }).catch(() => {});
      }
      if (activeTab === 'users') {
        loadUsers().catch(() => {});
      }
    }, activeTab === 'system' || activeTab === 'users' ? 2500 : 5000);
    return () => window.clearInterval(timer);
  }, [activeTab]);

  async function loadAll() {
    const [configData] = await Promise.all([
      api('/api/config').catch(() => null),
      loadUsers(),
      loadDownloadSettings(),
      loadWidget(),
      loadFolders({ quiet: true, syncSelection: true }),
    ]);
    setConfig(configData);
  }

  async function loadUsers() {
    const data = await api('/api/admin/users');
    setUsers(data);
  }

  async function loadDownloadSettings() {
    const data = await api('/api/admin/download-settings');
    setDownloadSettings(data);
  }

  async function loadWidget() {
    const data = await api('/api/widget/settings');
    setWidget(data);
  }

  async function loadFolders({ quiet = false, syncSelection = !quiet } = {}) {
    const data = await api('/api/library/folders');
    const available = normalizeAvailableFolders(data.available);
    const selected = new Set(data.selected || []);
    setFolders({ ...data, available });
    if (syncSelection) setSelectedFolders(selected);
    if (!quiet) setStatus('Folders refreshed.');
  }

  async function refreshFoldersAndIncludeNew() {
    const data = await api('/api/library/folders');
    const resolved = mergeDiscoveredLibraryFolders(data);
    let nextData = data;
    if (resolved.added.length > 0 || resolved.knownChanged) {
      nextData = await api('/api/library/folders', {
        method: 'POST',
        body: JSON.stringify({ folders: resolved.merged, known: resolved.knownNext }),
      });
    }
    const available = normalizeAvailableFolders(nextData.available);
    const selected = new Set(nextData.selected || []);
    setFolders({ ...nextData, available });
    setSelectedFolders(selected);
    setStatus(resolved.added.length > 0
      ? `Added ${resolved.added.length} new folder${resolved.added.length === 1 ? '' : 's'} to the scan list.`
      : 'Library folder list refreshed.');
  }

  async function logout() {
    const headers = new Headers();
    const csrfToken = getCsrfToken();
    if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
    await fetch('/logout', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers,
    });
    window.location.assign('/login');
  }

  async function saveSelectedFolders({ scan = false } = {}) {
    const chosen = [...selectedFolders];
    await api('/api/library/folders', {
      method: 'POST',
      body: JSON.stringify({ folders: chosen }),
    });
    if (scan) {
      await api('/api/rescan', { method: 'POST', body: '{}' });
      setStatus('Scan started.');
    } else {
      setStatus(`Saved ${chosen.length} selected folder${chosen.length === 1 ? '' : 's'}.`);
    }
    await loadFolders({ quiet: true, syncSelection: true });
  }

  function changeFontSetting(key, value) {
    const nextValue = key === 'fontSize' ? Number(value) : value;
    setFontSettings((current) => ({ ...current, [key]: nextValue }));
    if (typeof onAppSettingChange === 'function') {
      onAppSettingChange(key, nextValue);
      return;
    }
    const nextSettings = { ...loadSavedSettings(), [key]: nextValue };
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(nextSettings));
    applySavedTheme();
  }

  const scan = normalizeScan(folders.scan);
  const selectedLabel = selectedFolders.size ? [...selectedFolders].join(', ') : 'No folders selected yet';

  if (embedded) {
    return (
      <div className="admin-settings-embedded tw-grid tw-gap-4">
        <div className="admin-settings-subtabs settings-tabs" role="tablist" aria-label="Admin settings sections">
          {ADMIN_TABS.map(([id, label, icon]) => (
            <button
              key={id}
              className={`admin-subtab${activeTab === id ? ' is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
            >
              <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {status ? <p className="settings-status admin-status">{status}</p> : null}

        {activeTab === 'users' ? (
          <UsersPanel users={users} onUsersChanged={setUsers} setStatus={setStatus} />
        ) : null}
        {activeTab === 'downloads' ? (
          <DownloadsPanel settings={downloadSettings} onSaved={loadDownloadSettings} setStatus={setStatus} />
        ) : null}
        {activeTab === 'instances' ? (
          <InstancesPanel widget={widget} onReload={loadWidget} setStatus={setStatus} />
        ) : null}
        {activeTab === 'system' ? (
          <SystemPanel
            folders={folders.available}
            selectedFolders={selectedFolders}
            setSelectedFolders={setSelectedFolders}
            selectedLabel={selectedLabel}
            scan={scan}
            onRefresh={() => refreshFoldersAndIncludeNew()}
            onSave={() => saveSelectedFolders({ scan: false })}
            onSaveScan={() => saveSelectedFolders({ scan: true })}
            fontSettings={fontSettings}
            onFontSettingChange={changeFontSetting}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="admin-app-shell app-shell tw-grid tw-min-h-screen tw-grid-cols-[var(--sidebar-width)_minmax(0,1fr)]">
      <aside className="sidebar admin-sidebar tw-sticky tw-top-0 tw-flex tw-h-screen tw-min-w-0 tw-flex-col tw-overflow-x-hidden tw-overflow-y-auto tw-border-r tw-border-line tw-bg-[var(--glass-heavy)] tw-px-[18px] tw-pb-[22px] tw-pt-[18px] tw-backdrop-blur-[18px]">
        <div className="sidebar-brand tw-mb-3 tw-min-w-0">
          <div className="sidebar-topbar tw-mb-3 tw-flex tw-min-w-0 tw-items-center tw-justify-between tw-gap-2.5">
            <a className={`sidebar-theme-toggle is-${adminThemeMode} admin-open-app`} href="/" title="Open main app">
              <span className="sidebar-theme-knob" aria-hidden="true"><i className="fa-solid fa-music"></i></span>
              <span className="sidebar-theme-label">App</span>
            </a>
          </div>
          <h1 id="app-title" className="tw-m-0 tw-min-w-0 tw-break-words tw-font-display tw-text-[clamp(1.45rem,2vw,2rem)] tw-leading-[1.05] tw-tracking-[-0.05em]">{appTitle}</h1>
          <p className="eyebrow admin-eyebrow">Admin Panel</p>
        </div>

        <nav className="sidebar-nav tw-mb-6 tw-grid tw-gap-2">
          {ADMIN_TABS.map(([id, label, icon]) => (
            <button
              key={id}
              className={`nav-link tw-flex tw-items-center tw-gap-3 tw-rounded-[16px] tw-border tw-border-transparent tw-px-4 tw-py-3 tw-text-left tw-text-muted tw-transition hover:tw-bg-[var(--glass-strong)] hover:tw-text-text${activeTab === id ? ' is-active tw-border-accent tw-bg-accent tw-text-[var(--accent-contrast)] tw-shadow-glow' : ''}`}
              type="button"
              onClick={() => setActiveTab(id)}
            >
              <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom tw-mt-auto tw-grid tw-gap-3 tw-pt-[22px]">
          <div className="sidebar-account tw-grid tw-min-w-0 tw-grid-cols-[38px_minmax(0,1fr)_auto] tw-items-center tw-gap-2 tw-rounded-[18px] tw-border tw-border-line tw-bg-[var(--glass)] tw-p-2 tw-text-text tw-backdrop-blur-md" title={`Signed in as ${adminUser}`}>
            <span className="sidebar-account-icon tw-inline-grid tw-h-[38px] tw-w-[38px] tw-place-items-center tw-rounded-pill tw-bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] tw-text-accent" aria-hidden="true"><i className="fa-solid fa-user-shield"></i></span>
            <div className="sidebar-account-copy tw-grid tw-min-w-0 tw-content-center">
              <strong>{adminUser}</strong>
              <span>Admin account</span>
            </div>
            <div className="sidebar-account-actions tw-flex tw-gap-1.5">
              <a className="sidebar-account-action tw-inline-grid tw-h-8 tw-w-8 tw-place-items-center tw-rounded-pill tw-border tw-border-line tw-bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] tw-text-muted" href="/" title="Open app" aria-label="Open app"><i className="fa-solid fa-house"></i></a>
              <button
                className="sidebar-account-action tw-inline-grid tw-h-8 tw-w-8 tw-place-items-center tw-rounded-pill tw-border tw-border-line tw-bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] tw-text-muted"
                type="button"
                title="Logout"
                aria-label="Logout"
                onClick={() => logout().catch((error) => setStatus(error.message))}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="page-shell admin-page-shell">
        <section className="content-card admin-hero">
          <p className="eyebrow">Server Controls</p>
          <h2>{activeTabLabel(activeTab)}</h2>
          <p>Admin-only settings for users, downloads, widget API, and library scanning.</p>
          {status ? <p className="admin-status">{status}</p> : null}
        </section>

        {activeTab === 'users' ? (
          <UsersPanel users={users} onUsersChanged={setUsers} setStatus={setStatus} />
        ) : null}
        {activeTab === 'downloads' ? (
          <DownloadsPanel settings={downloadSettings} onSaved={loadDownloadSettings} setStatus={setStatus} />
        ) : null}
        {activeTab === 'instances' ? (
          <InstancesPanel widget={widget} onReload={loadWidget} setStatus={setStatus} />
        ) : null}
        {activeTab === 'system' ? (
          <SystemPanel
            folders={folders.available}
            selectedFolders={selectedFolders}
            setSelectedFolders={setSelectedFolders}
            selectedLabel={selectedLabel}
            scan={scan}
            onRefresh={() => refreshFoldersAndIncludeNew()}
            onSave={() => saveSelectedFolders({ scan: false })}
            onSaveScan={() => saveSelectedFolders({ scan: true })}
            fontSettings={fontSettings}
            onFontSettingChange={changeFontSetting}
          />
        ) : null}
      </main>
    </div>
  );
}

function UsersPanel({ users, onUsersChanged, setStatus }) {
  async function onSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const updatedUsers = await api('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        username: form.get('username'),
        password: form.get('password'),
        downloadsEnabled: form.get('downloadsEnabled') === 'true',
      }),
    });
    formElement.reset();
    onUsersChanged(updatedUsers);
    setStatus('User saved.');
  }

  async function toggleDownloads(username) {
    const user = users.users.find((item) => item.username === username);
    if (!user) return;
    const updatedUsers = await api(`/api/admin/users/${encodeURIComponent(username)}`, {
      method: 'PATCH',
      body: JSON.stringify({ downloadsEnabled: !user.downloadsEnabled }),
    });
    onUsersChanged(updatedUsers);
    setStatus('Download permission updated.');
  }

  async function deleteUser(username) {
    if (!window.confirm(`Delete user ${username}?`)) return;
    const updatedUsers = await api(`/api/admin/users/${encodeURIComponent(username)}`, { method: 'DELETE' });
    onUsersChanged(updatedUsers);
    setStatus('User deleted.');
  }

  return (
    <PanelGroup title="Users" description="Add accounts for family or friends. Downloads can be disabled per account.">
      <form className="admin-form" onSubmit={onSubmit}>
        <label className={settingsFieldClassName}>
          <span>Username</span>
          <input name="username" required />
        </label>
        <label className={settingsFieldClassName}>
          <span>Password</span>
          <input name="password" type="password" minLength="6" required />
        </label>
        <label className={settingsFieldClassName}>
          <span>Downloads</span>
          <select name="downloadsEnabled" defaultValue="true">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </label>
        <div className={settingsActionsClassName}>
          <button className="primary-button" type="submit">Add / Update User</button>
        </div>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>User</th><th>Role</th><th>Downloads</th><th>Action</th></tr></thead>
          <tbody>
            {users.admin ? (
              <tr><td>{users.admin.username}</td><td>Admin</td><td>Enabled</td><td>Environment</td></tr>
            ) : null}
            {(users.users || []).map((user) => (
              <tr key={user.username}>
                <td>{user.username}</td>
                <td>User</td>
                <td>
                  <button className="secondary-button" type="button" onClick={() => toggleDownloads(user.username)}>
                    {user.downloadsEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
                <td><button className="secondary-button danger" type="button" onClick={() => deleteUser(user.username)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelGroup>
  );
}

function DownloadsPanel({ settings, onSaved, setStatus }) {
  if (!settings) return <LoadingPanel />;

  async function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const savedSettings = await api('/api/admin/download-settings', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    localStorage.setItem(STORAGE_KEYS.downloadSettingsSync, JSON.stringify({
      timestamp: Date.now(),
      settings: savedSettings,
    }));
    window.dispatchEvent(new CustomEvent('monochrome:download-settings-updated', {
      detail: savedSettings,
    }));
    setStatus('Download settings saved.');
    await onSaved(savedSettings);
  }

  return (
    <PanelGroup title="Downloads" description="Download originals or convert to MP3 before the file leaves the server.">
      <form className="admin-form" onSubmit={onSubmit}>
        <label className={settingsFieldClassName}>
          <span>Download Quality</span>
          <select name="downloadQuality" defaultValue={settings.downloadQuality}>
            <option value="original">Original Local File</option>
            <option value="mp3">MP3 320 kbps</option>
          </select>
        </label>
        <p className={settingsHelpClassName}>MP3 downloads are converted server-side with ffmpeg at 320 kbps. Playback still uses the original local file.</p>
        <label className={settingsFieldClassName}>
          <span>Bulk Download Method</span>
          <select name="bulkDownloadMethod" defaultValue={settings.bulkDownloadMethod}>
            <option value="browser">One-by-one browser downloads</option>
            <option value="zip">ZIP archive before downloading</option>
          </select>
        </label>
        <div className={settingsFieldClassName}>
          <span>Filename Templates</span>
          <div className={settingsFieldStackClassName}>
            <label className={settingsFieldStackClassName}>
              <span>Tracks Filename Template</span>
              <input name="filenameTemplate" defaultValue={settings.filenameTemplate} />
            </label>
            <label className={settingsFieldStackClassName}>
              <span>ZIP Filename Template</span>
              <input name="archiveFilenameTemplate" defaultValue={settings.archiveFilenameTemplate} />
            </label>
          </div>
        </div>
        <p className={settingsHelpClassName}>Tracks template is used for one-by-one browser downloads. Available: {'{discNumber}'}, {'{trackNumber}'}, {'{artist}'}, {'{title}'}, {'{album}'}, {'{albumArtist}'}, {'{year}'}.</p>
        <p className={settingsHelpClassName}>ZIP template is only used to name queue and album ZIP downloads. Available: {'{name}'}, {'{album}'}, {'{albumTitle}'}, {'{albumArtist}'}, {'{artist}'}, {'{year}'}, {'{trackCount}'}.</p>
        <div className={settingsActionsClassName}>
          <button className="primary-button" type="submit">Save Downloads</button>
        </div>
      </form>
    </PanelGroup>
  );
}

function InstancesPanel({ widget, onReload, setStatus }) {
  const [apiKey, setApiKey] = useState(widget?.apiKey || '');

  useEffect(() => setApiKey(widget?.apiKey || ''), [widget?.apiKey]);

  if (!widget) return <LoadingPanel />;

  async function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api('/api/widget/settings', {
      method: 'POST',
      body: JSON.stringify({
        enabled: form.get('enabled') === 'true',
        apiKey: form.get('apiKey'),
        widgetCorsOrigin: form.get('widgetCorsOrigin') || '*',
      }),
    });
    setStatus('Widget API settings saved.');
    await onReload();
  }

  function generateKey() {
    const makePart = () => globalThis.crypto?.randomUUID
      ? crypto.randomUUID().replaceAll('-', '')
      : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    setApiKey(`${makePart()}${makePart()}`);
  }

  return (
    <PanelGroup title="Instances" description="Create a small API endpoint for dashboards and apps that only need library counts.">
      <form className="admin-form" onSubmit={onSubmit}>
        <label className={settingsFieldClassName}>
          <span>Widget API</span>
          <select name="enabled" defaultValue={String(Boolean(widget.enabled))}>
            <option value="false">Disabled</option>
            <option value="true">Enabled</option>
          </select>
        </label>
        <label className={settingsFieldClassName}>
          <span>API Key</span>
          <input name="apiKey" value={apiKey} onChange={(event) => setApiKey(event.target.value)} spellCheck="false" />
        </label>
        <label className={settingsFieldClassName}>
          <span>CORS Origin</span>
          <input name="widgetCorsOrigin" defaultValue={widget.widgetCorsOrigin || '*'} spellCheck="false" />
        </label>
        <div className={`${settingRowClassName} widget-api-url-row`}>
          <div>
            <strong>Widget URL</strong>
            <span>{widget.exampleUrl || '/api/widget/stats?apiKey=YOUR_KEY'}</span>
          </div>
          <div className={settingsActionsClassName}>
            <button type="button" className="secondary-button" onClick={generateKey}>Generate API Key</button>
            <button type="submit" className="primary-button">Save Widget API</button>
          </div>
        </div>
      </form>
    </PanelGroup>
  );
}

function SystemPanel({
  folders,
  selectedFolders,
  setSelectedFolders,
  selectedLabel,
  scan,
  onRefresh,
  onSave,
  onSaveScan,
  fontSettings,
  onFontSettingChange,
}) {
  const importInputRef = useRef(null);
  const [databaseStatus, setDatabaseStatus] = useState('');
  const [excelStatus, setExcelStatus] = useState('');
  const [excelWishlistOnly, setExcelWishlistOnly] = useState(false);
  const [excelMediaTypes, setExcelMediaTypes] = useState(new Set());
  const [excelFolders, setExcelFolders] = useState(new Set());
  const stats = useMemo(() => ({
    tracks: scan.tracks || 0,
    albums: scan.albums || 0,
  }), [scan]);
  const scanDetail = `${scan.currentFolder ? `Scanning ${scan.currentFolder}` : selectedLabel} · ${scan.processed}/${scan.total} files · ${scan.reused} cached · ${scan.parsed} parsed · ${stats.tracks} tracks · ${stats.albums} albums`;

  function toggleFolder(folder) {
    setSelectedFolders((current) => {
      const next = new Set(current);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  }

  function toggleExcelMediaType(mediaType) {
    setExcelMediaTypes((current) => {
      const next = new Set(current);
      if (next.has(mediaType)) next.delete(mediaType);
      else next.add(mediaType);
      return next;
    });
  }

  function toggleExcelFolder(folder) {
    setExcelFolders((current) => {
      const next = new Set(current);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  }

  async function exportDatabase() {
    setDatabaseStatus('Preparing database export...');
    const response = await fetch('/api/admin/database/export', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: buildProtectedHeaders(),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Database export failed.');
    }
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition') || '';
    const filename = getFilenameFromContentDisposition(disposition) || `monochrome-streamer-database-${new Date().toISOString().slice(0, 10)}.sqlite`;
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    setDatabaseStatus('Database export downloaded.');
  }

  async function exportExcel() {
    setExcelStatus('Preparing Excel export...');
    const response = await fetch('/api/admin/database/export-excel', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: buildProtectedHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        wishlistOnly: excelWishlistOnly,
        mediaTypes: [...excelMediaTypes],
        folders: [...excelFolders],
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Excel export failed.');
    }
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition') || '';
    const filename = getFilenameFromContentDisposition(disposition) || `monochrome-streamer-albums-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    const count = response.headers.get('X-Album-Export-Count');
    setExcelStatus(`Excel export downloaded${count ? ` with ${count} album${count === '1' ? '' : 's'}` : ''}.`);
  }

  async function importDatabase(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!window.confirm('Importing a database will replace the current library database after creating a backup. Continue?')) {
      return;
    }
    setDatabaseStatus(`Importing ${file.name}...`);
    const response = await fetch('/api/admin/database/import', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/vnd.sqlite3',
      },
      body: file,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Database import failed.');
    }
    setDatabaseStatus(`Database imported: ${data.albumCount || 0} albums, ${data.trackCount || 0} tracks. Refreshing folders...`);
    await onRefresh();
    setDatabaseStatus(`Database imported: ${data.albumCount || 0} albums, ${data.trackCount || 0} tracks.`);
  }

  return (
    <>
      <PanelGroup title="App Font" description="Choose the font used by this browser. The existing selection remains stored with the app settings.">
        <label className={settingsFieldClassName}>
          <span>Font Preset</span>
          <select
            value={fontSettings.fontPreset}
            onChange={(event) => onFontSettingChange('fontPreset', event.target.value)}
          >
            {FONT_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className={settingsFieldClassName}>
          <span>Font Size <strong>{fontSettings.fontSize}%</strong></span>
          <input
            type="range"
            min="75"
            max="140"
            step="5"
            value={fontSettings.fontSize}
            onChange={(event) => onFontSettingChange('fontSize', event.target.value)}
          />
        </label>
      </PanelGroup>

      <PanelGroup title="Scan Status" description="Watch the current scan and choose which folders are included.">
        <div className={`${settingRowClassName} scan-status-row`}>
          <div>
            <strong>{scan.statusLabel} · {scan.percent}%</strong>
            <span>{scanDetail}</span>
          </div>
          <button type="button" className="secondary-button" onClick={onRefresh}>Refresh Folders</button>
        </div>
        <div className={scanProgressClassName} aria-label="Scan progress">
          <span className="tw-block tw-h-full tw-rounded-pill tw-bg-[linear-gradient(90deg,var(--accent),color-mix(in_srgb,var(--accent)_55%,#fff))] tw-transition-[width]" style={{ width: `${scan.percent}%` }} />
        </div>
        <p className={settingsHelpClassName}>Selected folders: {selectedLabel}</p>
      </PanelGroup>

      <PanelGroup title="Database Backup" description="Export or import the SQLite library database, including scanned albums and local overrides.">
        <div className={settingRowClassName}>
          <div>
            <strong>Library Database</strong>
            <span>Export creates a consistent SQLite snapshot. Import validates the file and saves a timestamped backup before replacing the current database.</span>
            {databaseStatus ? <p className={settingsHelpClassName}>{databaseStatus}</p> : null}
          </div>
          <div className={settingsActionsClassName}>
            <button
              type="button"
              className="secondary-button"
              onClick={() => exportDatabase().catch((error) => setDatabaseStatus(error.message))}
            >
              Export Database
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => importInputRef.current?.click()}
            >
              Import Database
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".sqlite,.sqlite3,.db,application/vnd.sqlite3,application/octet-stream"
              hidden
              onChange={(event) => importDatabase(event).catch((error) => setDatabaseStatus(error.message))}
            />
          </div>
        </div>
      </PanelGroup>

      <PanelGroup title="Excel Export" description="Export a filtered album spreadsheet for cataloging, sharing, or checking your collection outside the app.">
        <label className={settingRowClassName}>
          <span>
            <strong>Wishlist only</strong>
            <span>Only include albums marked as Wishlist.</span>
          </span>
          <input
            type="checkbox"
            checked={excelWishlistOnly}
            onChange={(event) => setExcelWishlistOnly(event.target.checked)}
          />
        </label>
        <div className={settingRowClassName}>
          <div>
            <strong>Media types</strong>
            <span>Leave everything off to export every media type.</span>
          </div>
          <div className={settingsActionsClassName}>
            {EXCEL_MEDIA_TYPES.map((mediaType) => (
              <button
                key={mediaType}
                type="button"
                className={excelMediaTypes.has(mediaType) ? 'primary-button' : 'secondary-button'}
                onClick={() => toggleExcelMediaType(mediaType)}
              >
                {mediaType}
              </button>
            ))}
          </div>
        </div>
        <div className={settingsFieldStackClassName}>
          <div>
            <strong>Folders</strong>
            <p className={settingsHelpClassName}>Leave all folders off to export every selected album in the database.</p>
          </div>
          <div className={libraryFolderListClassName}>
            {folders.length ? folders.map((folder) => (
              <label key={folder} className={libraryFolderOptionClassName}>
                <input type="checkbox" checked={excelFolders.has(folder)} onChange={() => toggleExcelFolder(folder)} />
                <span>{folder}</span>
              </label>
            )) : <p className={settingsHelpClassName}>No top-level folders were found in the mounted music folder.</p>}
          </div>
        </div>
        <div className={settingsActionsClassName}>
          <button
            type="button"
            className="primary-button"
            onClick={() => exportExcel().catch((error) => setExcelStatus(error.message))}
          >
            Export Excel
          </button>
          {excelStatus ? <span className={settingsHelpClassName}>{excelStatus}</span> : null}
        </div>
      </PanelGroup>

      <PanelGroup title="Library Folders" description="Choose which top-level folders inside your mounted music folder should be indexed.">
        <div className={libraryFolderListClassName}>
          {folders.length ? folders.map((folder) => (
            <label key={folder} className={libraryFolderOptionClassName}>
              <input type="checkbox" checked={selectedFolders.has(folder)} onChange={() => toggleFolder(folder)} />
              <span>{folder}</span>
            </label>
          )) : <p className={settingsHelpClassName}>No top-level folders were found in the mounted music folder.</p>}
        </div>
        <div className={settingsActionsClassName}>
          <button type="button" className="secondary-button" onClick={onSave}>Save Selected Folders</button>
          <button type="button" className="primary-button" onClick={onSaveScan}>Save & Scan</button>
        </div>
        <p className={settingsHelpClassName}>Tip: start with one artist folder, scan, then add more folders after the app is stable.</p>
      </PanelGroup>
    </>
  );
}

function PanelGroup({ title, description, children }) {
  return (
    <section className={settingGroupClassName}>
      <div className="settings-group-heading">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className={settingBodyClassName}>{children}</div>
    </section>
  );
}

function LoadingPanel() {
  return (
    <PanelGroup title="Loading" description="Fetching admin settings from the server.">
      <p className={settingsHelpClassName}>One moment.</p>
    </PanelGroup>
  );
}

async function api(url, options = {}) {
  const method = options.method || (options.body != null ? 'POST' : 'GET');
  const response = await fetch(url, {
    ...options,
    method,
    cache: 'no-store',
    credentials: 'same-origin',
    headers: {
      ...buildProtectedHeaders(options.body != null ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function buildProtectedHeaders(headers = {}) {
  const result = { ...headers };
  const csrfToken = getCsrfToken();
  if (csrfToken) result['X-CSRF-Token'] = csrfToken;
  return result;
}

function getFilenameFromContentDisposition(value) {
  const utf8Match = /filename\*=UTF-8''([^;]+)/iu.exec(value || '');
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }
  const asciiMatch = /filename="([^"]+)"/iu.exec(value || '');
  return asciiMatch?.[1] || '';
}

function normalizeAvailableFolders(folders) {
  return (Array.isArray(folders) ? folders : [])
    .map((folder) => typeof folder === 'string' ? folder : folder?.name)
    .filter(Boolean);
}

function normalizeScan(scan = {}) {
  scan = scan && typeof scan === 'object' ? scan : {};
  const status = scan.status || 'idle';
  return {
    statusLabel: toTitleCase(status),
    percent: Math.max(0, Math.min(100, Math.round(scan.percent || 0))),
    currentFolder: scan.currentFolder || '',
    processed: scan.processedFiles || 0,
    total: scan.totalFiles || 0,
    reused: scan.reusedFiles || 0,
    parsed: scan.parsedFiles || 0,
    tracks: scan.trackCount || 0,
    albums: scan.albumCount || 0,
  };
}

function activeTabLabel(tab) {
  return ADMIN_TABS.find(([id]) => id === tab)?.[1] || 'Admin';
}

function toTitleCase(value) {
  return String(value || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) || 'Idle';
}

function applySavedTheme() {
  const settings = loadSavedSettings();
  const theme = resolveThemePreset(settings.theme, settings);
  const accent = theme.accent;
  const isLight = isLightTheme(settings);
  const root = document.documentElement;
  const softInk = isLight ? 'rgba(23, 19, 15, 0.06)' : 'rgba(255, 255, 255, 0.06)';
  const strongInk = isLight ? 'rgba(23, 19, 15, 0.11)' : 'rgba(255, 255, 255, 0.11)';
  const selectedFont = FONT_PRESETS[settings.fontPreset] || FONT_PRESETS.jakarta;
  root.style.setProperty('--font-body', selectedFont);
  root.style.setProperty('--font-display', selectedFont);
  root.style.setProperty('--app-font-size', `${settings.fontSize || 100}%`);
  root.style.setProperty('--background', theme.background);
  root.style.setProperty('--surface', theme.surface);
  root.style.setProperty('--surface-2', theme.surface2);
  root.style.setProperty('--background-soft', softInk);
  root.style.setProperty('--background-strong', strongInk);
  root.style.setProperty('--glass', softInk);
  root.style.setProperty('--glass-strong', strongInk);
  root.style.setProperty('--glass-heavy', isLight ? 'rgba(255, 255, 255, 0.58)' : 'rgba(10, 10, 10, 0.76)');
  root.style.setProperty('--input-surface', isLight ? 'rgba(255, 255, 255, 0.58)' : 'rgba(255, 255, 255, 0.055)');
  root.style.setProperty('--hover-surface', isLight ? 'rgba(23, 19, 15, 0.1)' : 'rgba(255, 255, 255, 0.12)');
  root.style.setProperty('--placeholder-surface', isLight ? 'rgba(255, 255, 255, 0.62)' : '#101010');
  root.style.setProperty('--active-control-text', isLight ? '#ffffff' : '#111111');
  root.style.setProperty('--line', isLight ? 'rgba(23, 19, 15, 0.12)' : 'rgba(255, 255, 255, 0.09)');
  root.style.setProperty('--line-strong', isLight ? 'rgba(23, 19, 15, 0.22)' : 'rgba(255, 255, 255, 0.18)');
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--muted', theme.muted);
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-contrast', getReadableTextColor(accent));
  root.style.setProperty('--body-top', theme.bodyTop);
  root.style.setProperty('--body-mid', theme.bodyMid);
  root.style.setProperty('--body-bottom', theme.bodyBottom);
  document.body.classList.toggle('light-ui', isLight);
}

function getReadableTextColor(hexColor) {
  const hex = String(hexColor || '').replace('#', '').trim();
  const expanded = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
  if (!/^[0-9a-f]{6}$/iu.test(expanded)) return '#111111';
  const red = parseInt(expanded.slice(0, 2), 16);
  const green = parseInt(expanded.slice(2, 4), 16);
  const blue = parseInt(expanded.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.58 ? '#111111' : '#ffffff';
}

function loadSavedSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}');
    return { ...DEFAULT_SETTINGS, ...(saved && typeof saved === 'object' ? saved : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function getFontSettings(settings = DEFAULT_SETTINGS) {
  return {
    fontPreset: FONT_PRESETS[settings.fontPreset] ? settings.fontPreset : DEFAULT_SETTINGS.fontPreset,
    fontSize: Number.isFinite(Number(settings.fontSize)) ? Number(settings.fontSize) : DEFAULT_SETTINGS.fontSize,
  };
}

export function mountStandaloneAdmin(rootElement) {
  if (!rootElement) return null;
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AdminSettingsPanel />
    </React.StrictMode>,
  );
  return root;
}

const standaloneRoot = document.querySelector('#admin-root');
if (standaloneRoot) {
  mountStandaloneAdmin(standaloneRoot);
}
