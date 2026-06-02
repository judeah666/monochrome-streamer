import React from 'react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: '/sidebar-icons/house.svg' },
  { id: 'library', label: 'Library', icon: '/sidebar-icons/album-collection.svg' },
  { id: 'favorites', label: 'Favorites', icon: '/sidebar-icons/heart-pulse.svg' },
  { id: 'wishlist', label: 'Wishlist', icon: '/sidebar-icons/bookmark.svg' },
  { id: 'settings', label: 'Settings', icon: '/sidebar-icons/gear.svg' },
  { id: 'admin', label: 'Admin', faIcon: 'fa-user-shield', adminOnly: true },
];
const brandClassName = 'sidebar-brand tw-min-w-0';
const sidebarTopClassName = 'sidebar-topbar tw-flex tw-items-center tw-justify-between tw-gap-2';
const sidebarToggleClassName = 'sidebar-toggle-button tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-pill tw-border tw-border-line tw-bg-[var(--glass)] tw-p-0 tw-text-accent';
const titleClassName = 'tw-m-0 tw-min-w-0 tw-break-words tw-font-display tw-text-[clamp(1.45rem,2vw,2rem)] tw-leading-[1.05] tw-tracking-[-0.05em]';
const navClassName = 'sidebar-nav tw-grid tw-gap-2';
const navButtonClassName = 'nav-link tw-flex tw-items-center tw-gap-3 tw-rounded-[16px] tw-border tw-border-transparent tw-px-4 tw-py-3 tw-text-left tw-transition';
const activeNavClassName = ' is-active tw-border-accent tw-bg-accent tw-text-[var(--accent-contrast)] tw-shadow-glow';
const sidebarBottomClassName = 'sidebar-bottom tw-mt-auto tw-grid tw-gap-3';
const sidebarUserClassName = 'sidebar-user-section';
const statsClassName = 'sidebar-stats tw-grid tw-gap-3';
const statCardClassName = 'stat-card tw-flex tw-items-center tw-gap-4';
const statIconClassName = 'stat-icon tw-inline-flex tw-items-center tw-justify-center';
const statusClassName = 'sidebar-status tw-grid tw-justify-items-center tw-gap-2';

export function Sidebar({
  title = 'Monochrome-Streamer',
  showTitle = true,
  activeView = 'home',
  settings = {},
  albumCount = 0,
  trackCount = 0,
  scan = {},
  currentUser = null,
  mobile = false,
  onNavigate,
  onToggle,
  onThemeToggle,
}) {
  const isLightTheme = settings.themeBase === 'light'
    || (!settings.themeBase && (settings.theme === 'white' || settings.theme === 'latte' || settings.customThemeBase === 'light'));
  const themeMode = isLightTheme ? 'light' : 'dark';
  const isAdmin = currentUser?.role === 'admin';
  const visibleItems = NAV_ITEMS.filter(({ id, adminOnly }) => {
    if (adminOnly) return isAdmin;
    if (id === 'home') return settings.showHome !== false;
    if (id === 'library') return settings.showLibrary !== false;
    if (id === 'favorites' || id === 'wishlist') return settings.showFavorites !== false;
    return true;
  });

  return (
    <>
      <div className={brandClassName}>
        <div>
          <div className={sidebarTopClassName}>
            <button
              className={`sidebar-theme-toggle is-${themeMode}`}
              type="button"
              aria-label={`Switch to ${isLightTheme ? 'dark' : 'light'} mode`}
              aria-pressed={isLightTheme}
              title={`Switch to ${isLightTheme ? 'dark' : 'light'} mode`}
              onClick={() => onThemeToggle?.()}
            >
              <span className="sidebar-theme-knob" aria-hidden="true">
                <i className={`fa-solid ${isLightTheme ? 'fa-sun' : 'fa-moon'}`}></i>
              </span>
              <span className="sidebar-theme-label">{isLightTheme ? 'Light' : 'Dark'}</span>
            </button>
            <button
              id="sidebar-toggle-button"
              className={sidebarToggleClassName}
              type="button"
              aria-label={mobile ? 'Close sidebar' : (settings.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}
              aria-expanded={mobile ? true : !settings.sidebarCollapsed}
              onClick={() => onToggle?.()}
            >
              <i className={`fa-solid ${mobile ? 'fa-xmark' : (settings.sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left')}`} aria-hidden="true"></i>
            </button>
          </div>
          {showTitle ? <h1 id="app-title" className={titleClassName}>{title}</h1> : null}
        </div>
      </div>

      <div className={sidebarUserClassName}>
        <AccountBlock user={currentUser} />
      </div>

      <nav className={navClassName}>
        {visibleItems.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`${navButtonClassName}${activeView === item.id ? activeNavClassName : ''}`}
            type="button"
            title={item.label}
            onClick={() => onNavigate?.(item.id)}
          >
            <NavIcon item={item} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={sidebarBottomClassName}>
        <div className={statsClassName}>
          <StatCard label="Albums" value={albumCount} icon="/sidebar-icons/album.svg" />
          <StatCard label="Tracks" value={trackCount} icon="/sidebar-icons/list-music.svg" />
        </div>
        <ScanStatus scan={scan} />
      </div>
    </>
  );
}

function AccountBlock({ user }) {
  const username = user?.username || 'Guest';
  const role = user?.role === 'admin' ? 'Admin' : 'User';
  const downloadLabel = user?.canDownload === false ? 'Downloads off' : 'Downloads on';
  const accountTitle = `${username} • ${role} • ${downloadLabel}`;

  return (
    <div className="sidebar-account" title={accountTitle}>
      <span className="sidebar-account-icon" aria-hidden="true">
        <i className="fa-solid fa-user"></i>
      </span>
      <div className="sidebar-account-copy">
        <strong>{username}</strong>
      </div>
      <div className="sidebar-account-actions">
        <a className="sidebar-account-action" href="/logout" title="Logout" aria-label="Logout">
          <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
        </a>
      </div>
    </div>
  );
}

function NavIcon({ item }) {
  if (item.faIcon) {
    return <i className={`fa-solid ${item.faIcon}`} aria-hidden="true"></i>;
  }

  return (
    <i
      className="sidebar-symbol"
      style={{ '--sidebar-icon': `url('${item.icon}')` }}
      aria-hidden="true"
    ></i>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className={statCardClassName} title={label}>
      <span className={statIconClassName}>
        <i className="sidebar-symbol" style={{ '--sidebar-icon': `url('${icon}')` }} aria-hidden="true"></i>
      </span>
      <strong>{value}</strong>
    </div>
  );
}

function ScanStatus({ scan }) {
  return (
    <div id="library-status" className={statusClassName}>
      <strong className="sidebar-status-state">{scan.statusLabel}</strong>
      <div
        className="sidebar-progress-ring"
        style={{
          '--scan-progress-offset': scan.progressOffset,
          '--scan-progress-circumference': scan.circumference,
        }}
        role="img"
        aria-label={`Scan progress ${scan.percent}%`}
      >
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle className="sidebar-progress-track" cx="50" cy="50" r="42"></circle>
          <circle className="sidebar-progress-value" cx="50" cy="50" r="42"></circle>
        </svg>
        <strong>{scan.percent}%</strong>
      </div>
      <span className="sidebar-status-indexed">{scan.indexedText}</span>
    </div>
  );
}
