import React from 'react';

const NAV_ITEMS = [
  ['home', 'Home', '/sidebar-icons/house.svg'],
  ['library', 'Library', '/sidebar-icons/album-collection.svg'],
  ['favorites', 'Favorites', '/sidebar-icons/heart-pulse.svg'],
  ['wanted', 'Wanted', '/sidebar-icons/bookmark.svg'],
  ['settings', 'Settings', '/sidebar-icons/gear.svg'],
];

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
}) {
  const visibleItems = NAV_ITEMS.filter(([id]) => {
    if (id === 'home') return settings.showHome !== false;
    if (id === 'library') return settings.showLibrary !== false;
    if (id === 'favorites' || id === 'wanted') return settings.showFavorites !== false;
    return true;
  });

  return (
    <>
      <div className="sidebar-brand">
        <div>
          <div className="sidebar-eyebrow-row">
            <p className="eyebrow">Self-hosted</p>
            <button
              id="sidebar-toggle-button"
              className="sidebar-toggle-button"
              type="button"
              aria-label={mobile ? 'Close sidebar' : (settings.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}
              aria-expanded={mobile ? true : !settings.sidebarCollapsed}
              onClick={() => onToggle?.()}
            >
              <i className={`fa-solid ${mobile ? 'fa-xmark' : (settings.sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left')}`} aria-hidden="true"></i>
            </button>
          </div>
          {showTitle ? <h1 id="app-title">{title}</h1> : null}
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map(([id, label, icon]) => (
          <button
            key={id}
            id={`nav-${id}`}
            className={`nav-link${activeView === id ? ' is-active' : ''}`}
            type="button"
            title={label}
            onClick={() => onNavigate?.(id)}
          >
            <i className="sidebar-symbol" style={{ '--sidebar-icon': `url('${icon}')` }} aria-hidden="true"></i>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-stats">
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
    <div className="stat-card" title={label}>
      <span className="stat-icon">
        <i className="sidebar-symbol" style={{ '--sidebar-icon': `url('${icon}')` }} aria-hidden="true"></i>
      </span>
      <strong>{value}</strong>
    </div>
  );
}

function ScanStatus({ scan }) {
  return (
    <div id="library-status" className="sidebar-status">
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
