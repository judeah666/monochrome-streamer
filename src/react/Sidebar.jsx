import React from 'react';

const NAV_ITEMS = [
  ['home', 'Home', '/sidebar-icons/house.svg'],
  ['library', 'Library', '/sidebar-icons/album-collection.svg'],
  ['favorites', 'Favorites', '/sidebar-icons/heart-pulse.svg'],
  ['wishlist', 'Wishlist', '/sidebar-icons/bookmark.svg'],
  ['settings', 'Settings', '/sidebar-icons/gear.svg'],
];
const brandClassName = 'sidebar-brand tw-min-w-0';
const sidebarTopClassName = 'sidebar-topbar tw-flex tw-items-center tw-justify-between tw-gap-2';
const sidebarToggleClassName = 'sidebar-toggle-button tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-pill tw-border tw-border-line tw-bg-[var(--glass)] tw-p-0 tw-text-accent';
const titleClassName = 'tw-m-0 tw-min-w-0 tw-break-words tw-font-display tw-text-[clamp(1.45rem,2vw,2rem)] tw-leading-[1.05] tw-tracking-[-0.05em]';
const navClassName = 'sidebar-nav tw-grid tw-gap-2';
const navButtonClassName = 'nav-link tw-flex tw-items-center tw-gap-3 tw-rounded-[16px] tw-border tw-border-transparent tw-px-4 tw-py-3 tw-text-left tw-transition';
const activeNavClassName = ' is-active tw-border-accent tw-bg-accent tw-text-[var(--accent-contrast)] tw-shadow-glow';
const sidebarBottomClassName = 'sidebar-bottom tw-mt-auto tw-grid tw-gap-3';
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
  mobile = false,
  onNavigate,
  onToggle,
  onThemeToggle,
}) {
  const isLightTheme = settings.theme === 'white'
    || settings.theme === 'latte'
    || (settings.theme === 'custom' && settings.customThemeBase === 'light');
  const themeMode = isLightTheme ? 'light' : 'dark';
  const visibleItems = NAV_ITEMS.filter(([id]) => {
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

      <nav className={navClassName}>
        {visibleItems.map(([id, label, icon]) => (
          <button
            key={id}
            id={`nav-${id}`}
            className={`${navButtonClassName}${activeView === id ? activeNavClassName : ''}`}
            type="button"
            title={label}
            onClick={() => onNavigate?.(id)}
          >
            <i className="sidebar-symbol" style={{ '--sidebar-icon': `url('${icon}')` }} aria-hidden="true"></i>
            <span>{label}</span>
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
