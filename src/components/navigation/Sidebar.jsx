import React from 'react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: '/assets/icons/sidebar/house.svg' },
  { id: 'library', label: 'Library', icon: '/assets/icons/sidebar/album-collection.svg' },
  { id: 'playlists', label: 'Playlists', faIcon: 'fa-list-ul' },
  { id: 'favorites', label: 'Favorites', icon: '/assets/icons/sidebar/heart-pulse.svg' },
  { id: 'wishlist', label: 'Wishlist', icon: '/assets/icons/sidebar/bookmark.svg' },
  { id: 'settings', label: 'Settings', icon: '/assets/icons/sidebar/gear.svg' },
  { id: 'admin', label: 'Admin', faIcon: 'fa-user-shield', adminOnly: true },
];
const brandClassName = 'sidebar-brand tw-mb-3 tw-min-w-0';
const sidebarTopClassName = 'sidebar-topbar tw-mb-3 tw-flex tw-min-w-0 tw-items-center tw-justify-between tw-gap-2.5';
const sidebarToggleClassName = 'sidebar-toggle-button tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-pill tw-border tw-border-line tw-bg-[var(--glass)] tw-p-0 tw-text-accent';
const titleClassName = 'tw-m-0 tw-min-w-0 tw-break-words tw-font-display tw-text-[clamp(1.45rem,2vw,2rem)] tw-leading-[1.05] tw-tracking-[-0.05em]';
const navClassName = 'sidebar-nav tw-mb-6 tw-grid tw-gap-2';
const navButtonClassName = 'nav-link tw-flex tw-items-center tw-gap-3 tw-rounded-[16px] tw-border tw-border-transparent tw-px-4 tw-py-3 tw-text-left tw-text-muted tw-transition hover:tw-bg-[var(--glass-strong)] hover:tw-text-text';
const activeNavClassName = ' is-active tw-border-accent tw-bg-accent tw-text-[var(--accent-contrast)] tw-shadow-glow';
const sidebarBottomClassName = 'sidebar-bottom tw-mt-auto tw-grid tw-gap-3 tw-pt-[22px]';
const sidebarUserClassName = 'sidebar-user-section tw-my-4';
const statsClassName = 'sidebar-stats tw-grid tw-gap-3';
const statCardClassName = 'stat-card tw-grid tw-min-h-[50px] tw-grid-cols-[42px_minmax(0,1fr)] tw-items-center tw-gap-3';
const statIconClassName = 'stat-icon tw-inline-flex tw-h-[42px] tw-w-[42px] tw-items-center tw-justify-center tw-text-accent';
const statusClassName = 'sidebar-status tw-grid tw-min-w-0 tw-justify-items-center tw-gap-1.5 tw-overflow-hidden tw-pt-2 tw-text-center tw-text-[0.78rem] tw-leading-[1.35] tw-text-muted';
const accountClassName = [
  'sidebar-account tw-grid tw-min-w-0 tw-grid-cols-[38px_minmax(0,1fr)_auto] tw-items-center tw-gap-2',
  'tw-rounded-[18px] tw-border tw-border-line tw-bg-[var(--glass)] tw-p-2 tw-text-text tw-backdrop-blur-md',
].join(' ');
const accountIconClassName = 'sidebar-account-icon tw-inline-grid tw-h-[38px] tw-w-[38px] tw-place-items-center tw-rounded-pill tw-bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] tw-text-accent';
const accountCopyClassName = 'sidebar-account-copy tw-grid tw-min-w-0 tw-content-center';
const accountActionsClassName = 'sidebar-account-actions tw-flex tw-gap-1.5';
const accountActionClassName = 'sidebar-account-action tw-inline-grid tw-h-8 tw-w-8 tw-place-items-center tw-rounded-pill tw-border tw-border-line tw-bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] tw-text-muted';

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
            <span className="sidebar-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={sidebarBottomClassName}>
        <div className={statsClassName}>
          <StatCard label="Albums" value={albumCount} icon="/assets/icons/sidebar/album.svg" />
          <StatCard label="Tracks" value={trackCount} icon="/assets/icons/sidebar/list-music.svg" />
        </div>
        <ScanStatus scan={scan} />
      </div>
    </>
  );
}

function AccountBlock({ user }) {
  const username = user?.username || 'Guest';
  const role = user?.role === 'admin' ? 'Admin' : (user?.role === 'guest' ? 'Guest' : 'User');
  const downloadLabel = user?.canDownload === false ? 'Downloads off' : 'Downloads on';
  const accountTitle = `${username} • ${role} • ${downloadLabel}`;
  const authDisabled = user?.authDisabled === true;
  const actionLabel = authDisabled ? 'Login' : 'Logout';
  const actionIcon = authDisabled ? 'fa-arrow-right-to-bracket' : 'fa-arrow-right-from-bracket';

  return (
    <div className={accountClassName} title={accountTitle}>
      <span className={accountIconClassName} aria-hidden="true">
        <i className="fa-solid fa-user"></i>
      </span>
      <div className={accountCopyClassName}>
        <strong>{username}</strong>
      </div>
      <div className={accountActionsClassName}>
        {authDisabled ? (
          <a className={accountActionClassName} href="/login" title={actionLabel} aria-label={actionLabel}>
            <i className={`fa-solid ${actionIcon}`} aria-hidden="true"></i>
          </a>
        ) : (
          <button
            className={accountActionClassName}
            type="button"
            data-logout-button="true"
            title={actionLabel}
            aria-label={actionLabel}
          >
            <i className={`fa-solid ${actionIcon}`} aria-hidden="true"></i>
          </button>
        )}
      </div>
    </div>
  );
}

function NavIcon({ item }) {
  if (item.faIcon) {
    return (
      <span className="sidebar-nav-icon" aria-hidden="true">
        <i className={`fa-solid ${item.faIcon}`}></i>
      </span>
    );
  }

  return (
    <span className="sidebar-nav-icon" aria-hidden="true">
      <i
        className="sidebar-symbol"
        style={{ '--sidebar-icon': `url('${item.icon}')` }}
      ></i>
    </span>
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
  if (!scan?.isScanning) return null;

  return (
    <div id="library-status" className={statusClassName}>
      <strong className="sidebar-status-state">{scan.statusLabel}</strong>
      <div
        className="sidebar-progress-bar"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={scan.percent}
        aria-label={`Scan progress ${scan.percent}%`}
      >
        <span className="sidebar-progress-fill" style={{ width: `${scan.percent}%` }}></span>
      </div>
      <strong className="sidebar-progress-percent">{scan.percent}%</strong>
      <span className="sidebar-status-indexed">{scan.indexedText}</span>
    </div>
  );
}
