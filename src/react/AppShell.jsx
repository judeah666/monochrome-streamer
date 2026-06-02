function SidebarIcon({ icon }) {
  return (
    <i
      className="sidebar-symbol"
      style={{ '--sidebar-icon': `url('/sidebar-icons/${icon}.svg')` }}
      aria-hidden="true"
    />
  );
}

function SidebarShell() {
  return (
    <>
      <aside
        id="app-sidebar"
        className="sidebar"
      >
        <div className="sidebar-brand tw-mb-3 tw-min-w-0">
          <div className="tw-min-w-0">
            <div className="sidebar-topbar tw-mb-3 tw-flex tw-min-w-0 tw-items-center tw-justify-between tw-gap-2.5">
              <button className="sidebar-theme-toggle is-dark" type="button" aria-label="Switch theme">
                <span className="sidebar-theme-knob" aria-hidden="true">
                  <i className="fa-solid fa-moon" />
                </span>
                <span className="sidebar-theme-label">Dark</span>
              </button>
              <button
                id="sidebar-toggle-button"
                className="sidebar-toggle-button tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-pill tw-border tw-border-line tw-bg-[var(--glass)] tw-p-0 tw-text-accent"
                type="button"
                aria-label="Collapse sidebar"
                aria-expanded="true"
              >
                <i className="fa-solid fa-chevron-left" aria-hidden="true" />
              </button>
            </div>
            <h1 id="app-title" className="tw-m-0 tw-min-w-0 tw-break-words tw-font-display tw-text-[clamp(1.45rem,2vw,2rem)] tw-leading-[1.05] tw-tracking-[-0.05em]">
              Monochrome-Streamer
            </h1>
          </div>
        </div>

        <nav className="sidebar-nav tw-mb-6 tw-grid tw-gap-2">
          <button id="nav-home" className="nav-link is-active tw-flex tw-items-center tw-gap-3 tw-rounded-[16px] tw-border tw-border-transparent tw-px-4 tw-py-3 tw-text-left tw-transition" type="button" title="Home">
            <SidebarIcon icon="house" />
            <span>Home</span>
          </button>
          <button id="nav-library" className="nav-link tw-flex tw-items-center tw-gap-3 tw-rounded-[16px] tw-border tw-border-transparent tw-px-4 tw-py-3 tw-text-left tw-transition" type="button" title="Library">
            <SidebarIcon icon="album-collection" />
            <span>Library</span>
          </button>
          <button id="nav-favorites" className="nav-link tw-flex tw-items-center tw-gap-3 tw-rounded-[16px] tw-border tw-border-transparent tw-px-4 tw-py-3 tw-text-left tw-transition" type="button" title="Favorites">
            <SidebarIcon icon="heart-pulse" />
            <span>Favorites</span>
          </button>
          <button id="nav-wishlist" className="nav-link tw-flex tw-items-center tw-gap-3 tw-rounded-[16px] tw-border tw-border-transparent tw-px-4 tw-py-3 tw-text-left tw-transition" type="button" title="Wishlist">
            <SidebarIcon icon="bookmark" />
            <span>Wishlist</span>
          </button>
          <button id="nav-settings" className="nav-link tw-flex tw-items-center tw-gap-3 tw-rounded-[16px] tw-border tw-border-transparent tw-px-4 tw-py-3 tw-text-left tw-transition" type="button" title="Settings">
            <SidebarIcon icon="gear" />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-bottom tw-mt-auto tw-grid tw-gap-3 tw-pt-[22px]">
          <div className="sidebar-stats tw-grid tw-gap-3">
            <div className="stat-card stat-card-albums tw-grid tw-min-h-[50px] tw-grid-cols-[42px_minmax(0,1fr)] tw-items-center tw-gap-3" title="Albums">
              <span className="stat-icon tw-inline-flex tw-h-[42px] tw-w-[42px] tw-items-center tw-justify-center tw-text-accent">
                <SidebarIcon icon="album" />
              </span>
              <strong id="album-count">0</strong>
            </div>
            <div className="stat-card stat-card-tracks tw-grid tw-min-h-[50px] tw-grid-cols-[42px_minmax(0,1fr)] tw-items-center tw-gap-3" title="Tracks">
              <span className="stat-icon tw-inline-flex tw-h-[42px] tw-w-[42px] tw-items-center tw-justify-center tw-text-accent">
                <SidebarIcon icon="list-music" />
              </span>
              <strong id="track-count">0</strong>
            </div>
          </div>

          <div id="library-status" className="sidebar-status tw-grid tw-min-w-0 tw-justify-items-center tw-gap-1.5 tw-overflow-hidden tw-pt-2 tw-text-center tw-text-[0.78rem] tw-leading-[1.35] tw-text-muted">
            Scan idle · 0%
          </div>
        </div>
      </aside>
      <div id="sidebar-overlay" className="sidebar-overlay" hidden />
    </>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <button
        id="mobile-sidebar-button"
        className="icon-button mobile-sidebar-button"
        type="button"
        aria-label="Open sidebar"
        aria-expanded="false"
        aria-controls="app-sidebar"
      >
        <i className="fa-solid fa-bars" aria-hidden="true" />
      </button>

      <button id="back-button" className="icon-button" type="button" hidden aria-label="Back to library">
        <i className="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>

      <label className="search-bar">
        <i className="fa-solid fa-magnifying-glass search-icon" aria-hidden="true" />
        <input id="search-input" type="search" placeholder="Search for tracks, artists, albums..." />
      </label>

      <button id="clear-search-button" className="icon-button" type="button" hidden aria-label="Clear search">
        <i className="fa-solid fa-xmark" aria-hidden="true" />
      </button>
    </header>
  );
}

function HomeView() {
  return (
    <section id="home-view" className="view">
      <section id="home-hero" className="home-hero">
        <p id="home-hero-eyebrow" className="eyebrow">
          Local Audio
        </p>
        <h2 id="home-hero-title">Your server, your collection, your rules.</h2>
        <p id="home-hero-subtitle" className="lede">
          Browse your albums, open them like a proper detail page, and control playback from a full bottom player.
        </p>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <h3>Recommended Albums</h3>
            <p id="home-album-caption" />
          </div>
        </div>
        <div id="album-grid" className="album-grid" />
      </section>
    </section>
  );
}

function LibraryView() {
  return (
    <section id="library-view" className="view" hidden>
      <section className="content-section library-browser">
        <div className="section-heading">
          <div>
            <h3>Browse Library</h3>
            <p id="library-browser-caption">Browse albums, collections, artists, tracks, and playlists from your scanned library.</p>
          </div>
        </div>

        <div className="library-browser-tabs" role="tablist" aria-label="Library browser">
          <button
            id="library-tab-folders"
            className="library-tab"
            type="button"
            role="tab"
            aria-selected="false"
          >
            Folders
          </button>
          <button id="library-tab-albums" className="library-tab is-active" type="button" role="tab" aria-selected="true">
            Albums
          </button>
          <button id="library-tab-collections" className="library-tab" type="button" role="tab" aria-selected="false">
            Collections
          </button>
          <button id="library-tab-artists" className="library-tab" type="button" role="tab" aria-selected="false">
            Artists
          </button>
          <button id="library-tab-tracks" className="library-tab" type="button" role="tab" aria-selected="false">
            Tracks
          </button>
          <button id="library-tab-playlists" className="library-tab" type="button" role="tab" aria-selected="false">
            Playlists
          </button>
        </div>

        <div id="library-panel-folders" className="library-panel" role="tabpanel" hidden />
        <div id="library-panel-albums" className="library-panel" role="tabpanel" />
        <div id="library-panel-collections" className="library-panel" role="tabpanel" hidden />
        <div id="library-panel-artists" className="library-panel" role="tabpanel" hidden />
        <div id="library-panel-tracks" className="library-panel" role="tabpanel" hidden />
        <div id="library-panel-playlists" className="library-panel" role="tabpanel" hidden />
      </section>
    </section>
  );
}

function FavoritesView() {
  return (
    <section id="favorites-view" className="view" hidden>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <h3>Favorite Albums</h3>
            <p id="favorite-album-caption">Albums you marked for quick access.</p>
          </div>
        </div>
        <div id="favorite-album-grid" className="album-grid" />
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <h3>Favorite Tracks</h3>
            <p id="favorite-track-caption">Tracks you marked for quick access.</p>
          </div>
        </div>
        <div id="favorite-track-list" className="track-list track-list-shell" />
      </section>
    </section>
  );
}

function WishlistView() {
  return (
    <section id="wishlist-view" className="view" hidden>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <h3>Wishlist Albums</h3>
            <p id="wishlist-album-caption">Albums marked as Wishlist in your local album tags.</p>
          </div>
          <button id="wishlist-add-album-button" className="primary-button" type="button">
            <i className="fa-solid fa-plus" aria-hidden="true"></i>
            <span>Add album</span>
          </button>
        </div>
        <div id="wishlist-album-grid" className="album-grid" />
      </section>
    </section>
  );
}

function SettingsView() {
  return (
    <section id="settings-view" className="view" hidden>
      <section className="content-section settings-shell">
        <div className="section-heading">
          <div>
            <h3>Settings</h3>
            <p>Local-first controls adapted from Monochrome for your self-hosted library.</p>
          </div>
        </div>

        <div id="settings-tabs" className="settings-tabs" role="tablist" aria-label="Settings sections" />
        <div id="settings-panels" className="settings-panels">
          <div id="settings-react-panel-host" className="settings-react-panel" />
        </div>
        <p id="settings-status" className="settings-status" aria-live="polite" />
      </section>
    </section>
  );
}

function AdminView() {
  return (
    <section id="admin-view" className="view" hidden>
      <section className="content-section settings-shell admin-main-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Server Controls</p>
            <h3>Admin Panel</h3>
            <p>Admin-only controls for users, downloads, widget API, and library scanning.</p>
          </div>
        </div>
        <div id="admin-panel-root" />
      </section>
    </section>
  );
}

function ArtistView() {
  return (
    <section id="artist-view" className="view" hidden>
      <section id="artist-hero" className="artist-hero">
        <div className="artist-hero-image">
          <img id="artist-detail-image" alt="" hidden />
          <div id="artist-detail-fallback" className="artist-image-fallback">
            <i className="fa-solid fa-user" aria-hidden="true" />
            <span>Artist</span>
          </div>
        </div>
        <div className="artist-hero-copy">
          <p className="eyebrow">Artist</p>
          <h2 id="artist-detail-name">Artist Name</h2>
          <p id="artist-detail-meta" className="artist-detail-meta" />
          <p id="artist-detail-bio" className="artist-detail-bio" />
          <div className="artist-actions">
            <a id="artist-detail-source" className="artist-source-link" href="#" target="_blank" rel="noreferrer" hidden>
              Source
            </a>
            <button id="edit-artist-button" className="secondary-button" type="button">
              <i className="fa-solid fa-image" aria-hidden="true" />
              <span>Edit image/info</span>
            </button>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <h3 id="artist-albums-title">Albums</h3>
            <p id="artist-albums-caption">Albums from this artist in your local library.</p>
          </div>
        </div>
        <div id="artist-album-grid" className="library-album-grid" />
      </section>
    </section>
  );
}

function AlbumView() {
  return (
    <section id="album-view" className="view" hidden>
      <section id="album-hero" className="album-hero">
        <div className="album-hero-scrim" />
        <div className="album-hero-content">
          <div className="album-cover-frame">
            <img id="album-detail-cover" alt="" hidden />
            <div id="album-detail-cover-fallback" className="cover-fallback">
              <i className="fa-solid fa-record-vinyl" aria-hidden="true" />
            </div>
          </div>

          <div className="album-hero-copy">
            <p id="album-detail-format" className="album-detail-format" />
            <h2 id="album-detail-title">Album Title</h2>
            <p id="album-detail-meta" className="album-detail-meta" />
            <p id="album-detail-artist" className="album-detail-artist" />
            <p id="album-detail-folder" className="album-detail-folder" />
            <div className="album-actions">
              <button id="play-album-button" className="primary-button" type="button">
                Play album
              </button>
              <button id="queue-album-button" className="secondary-button" type="button">
                Add to queue
              </button>
              <button id="shuffle-album-button" className="secondary-button" type="button">
                Shuffle
              </button>
              <button
                id="edit-album-cover-button"
                className="icon-button album-edit-button"
                type="button"
                aria-label="Edit album cover"
              >
                <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
              </button>
              <button
                id="favorite-album-button"
                className="icon-button album-favorite-button"
                type="button"
                aria-label="Favorite album"
              >
                <i className="fa-solid fa-heart" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="album-content-layout">
        <section className="album-main">
          <div className="track-table-header">
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span>Action</span>
          </div>
          <div id="album-track-list" className="track-table" />
        </section>

        <aside className="album-sidebar">
          <section id="more-albums-section" className="content-section" hidden>
            <h3 id="more-albums-title">More albums</h3>
            <div id="more-albums-grid" className="side-card-grid" />
          </section>

          <section id="eps-section" className="content-section" hidden>
            <h3 id="eps-title">EPs and Singles</h3>
            <div id="eps-grid" className="side-card-grid" />
          </section>
        </aside>
      </div>
    </section>
  );
}

function ContentShell() {
  return (
    <div className="page-shell">
      <Topbar />
      <main className="content">
        <HomeView />
        <LibraryView />
        <FavoritesView />
        <WishlistView />
        <SettingsView />
        <AdminView />
        <ArtistView />
        <AlbumView />
      </main>
    </div>
  );
}

function NowPlayingFooter() {
  return (
    <footer className="now-playing-bar">
      <div id="player-track-info-root" className="track-info" />

      <div className="player-controls">
        <div id="player-transport-controls" className="buttons" />

        <div className="progress-container">
          <span id="current-time">0:00</span>
          <div id="progress-bar" className="progress-bar" aria-label="Seek">
            <div id="progress-fill" className="progress-fill" />
          </div>
          <span id="total-duration">0:00</span>
        </div>
      </div>

      <div className="volume-controls">
        <div className="queue-status">
          <span className="label">Queue</span>
          <strong id="queue-status">0 of 0</strong>
        </div>
        <div id="player-utility-controls" className="player-utility-controls" />
        <div id="volume-bar" className="volume-bar" aria-label="Volume">
          <div id="volume-fill" className="volume-fill" />
        </div>
      </div>
    </footer>
  );
}

function FullscreenOverlay() {
  return (
    <section id="fullscreen-cover-overlay" className="fullscreen-cover-overlay" aria-label="Now playing full view" hidden>
      <div className="fullscreen-backdrop" />
      <canvas id="fullscreen-visualizer" className="fullscreen-visualizer" aria-hidden="true" />
      <div className="fullscreen-top-actions">
        <button id="close-fullscreen-cover-btn" type="button" aria-label="Close fullscreen player">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        <button id="toggle-fullscreen-lyrics-btn" type="button" aria-label="Toggle lyrics panel">
          <i className="fa-solid fa-microphone-lines" aria-hidden="true" />
        </button>
        <button id="fs-visualizer-btn" type="button" aria-label="Visualizer">
          <i className="fa-solid fa-wave-square" aria-hidden="true" />
        </button>
        <button id="toggle-ui-btn" type="button" aria-label="Toggle fullscreen controls">
          <i className="fa-solid fa-eye-slash" aria-hidden="true" />
        </button>
      </div>

      <div className="fullscreen-shell">
        <div className="fullscreen-main-view">
          <div className="fullscreen-media-column">
            <div id="fullscreen-artwork-card" className="fullscreen-artwork-card">
              <img id="fullscreen-cover-image" alt="" hidden />
              <div id="fullscreen-cover-fallback" className="cover-fallback">
                <i className="fa-solid fa-record-vinyl" aria-hidden="true" />
              </div>
            </div>

            <div className="fullscreen-track-info">
              <div className="fullscreen-track-text">
                <h2 id="fullscreen-track-title">Select a track</h2>
                <h3 id="fullscreen-track-artist">Your queue will appear here.</h3>
              </div>
              <div className="fullscreen-actions">
                <button id="fs-like-btn" className="btn-icon" type="button" aria-label="Favorite current track">
                  <i className="fa-solid fa-heart" aria-hidden="true" />
                </button>
                <button id="fs-edit-btn" className="btn-icon" type="button" aria-label="Open current album">
                  <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                </button>
                <button id="fs-download-btn" className="btn-icon" type="button" aria-label="Download current track">
                  <i className="fa-solid fa-download" aria-hidden="true" />
                </button>
                <button id="fs-lyrics-edit-btn" className="btn-icon" type="button" aria-label="Add or edit lyrics">
                  <i className="fa-solid fa-microphone-lines" aria-hidden="true" />
                </button>
                <button id="fs-queue-btn" className="btn-icon" type="button" aria-label="Open queue">
                  <i className="fa-solid fa-list" aria-hidden="true" />
                </button>
              </div>
              <div id="fullscreen-next-track" className="fullscreen-next-track" hidden>
                <span className="label">Up Next</span>
                <span id="fullscreen-next-track-value" className="value" />
              </div>
            </div>

            <div className="fullscreen-controls">
              <div className="fullscreen-progress-container">
                <span id="fs-current-time">0:00</span>
                <div id="fs-progress-bar" className="progress-bar" aria-label="Seek">
                  <div id="fs-progress-fill" className="progress-fill" />
                </div>
                <span id="fs-total-duration">0:00</span>
              </div>
              <div className="fullscreen-buttons">
                <button id="fs-shuffle-btn" type="button" title="Shuffle" aria-label="Shuffle">
                  <i className="fa-solid fa-shuffle" aria-hidden="true" />
                </button>
                <button id="fs-prev-btn" type="button" title="Previous" aria-label="Previous">
                  <i className="fa-solid fa-backward-step" aria-hidden="true" />
                </button>
                <button id="fs-play-pause-btn" className="play-pause-btn" type="button" title="Play" aria-label="Play">
                  <i className="fa-solid fa-play" aria-hidden="true" />
                </button>
                <button id="fs-next-btn" type="button" title="Next" aria-label="Next">
                  <i className="fa-solid fa-forward-step" aria-hidden="true" />
                </button>
                <button id="fs-repeat-btn" type="button" title="Repeat" aria-label="Repeat">
                  <i className="fa-solid fa-repeat" aria-hidden="true" />
                </button>
              </div>
              <div className="fullscreen-volume-container">
                <button id="fs-volume-btn" className="fs-volume-btn" type="button" aria-label="Mute">
                  <i className="fa-solid fa-volume-high" aria-hidden="true" />
                </button>
                <div id="fs-volume-bar" className="fs-volume-bar" aria-label="Volume">
                  <div id="fs-volume-fill" className="fs-volume-fill" />
                </div>
              </div>
            </div>
          </div>

          <aside id="fullscreen-lyrics-pane" className="fullscreen-lyrics-pane">
            <div className="fullscreen-lyrics-shell">
              <div id="fullscreen-lyrics-content" className="fullscreen-lyrics-content">
                <div className="fullscreen-lyrics-empty">Start playing a track to fill this view.</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function QueuePanelShell() {
  return (
    <>
      <aside id="queue-panel" className="queue-panel" hidden>
        <div className="queue-panel-header">
          <h2>Queue</h2>
          <div className="queue-panel-actions">
            <button
              id="queue-download-button"
              className="icon-button queue-icon-control"
              type="button"
              aria-label="Download queue"
            >
              <i className="fa-solid fa-download" aria-hidden="true" />
            </button>
            <button
              id="queue-favorite-button"
              className="icon-button queue-icon-control"
              type="button"
              aria-label="Favorite queue"
            >
              <i className="fa-solid fa-heart" aria-hidden="true" />
            </button>
            <button
              id="queue-clear-button"
              className="icon-button queue-icon-control"
              type="button"
              aria-label="Clear queue"
            >
              <i className="fa-solid fa-broom" aria-hidden="true" />
            </button>
            <button
              id="queue-close-button"
              className="icon-button queue-icon-control"
              type="button"
              aria-label="Close queue"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div id="queue-list" className="queue-list" />
      </aside>
      <div id="queue-overlay" className="queue-overlay" hidden />
    </>
  );
}

function TagEditorShell() {
  return (
    <>
      <div id="tag-editor-overlay" className="modal-overlay" hidden />
      <section id="tag-editor-modal" className="tag-editor-modal" role="dialog" aria-modal="true" aria-labelledby="tag-editor-title" hidden>
        <header className="tag-editor-header">
          <div>
            <p className="eyebrow">Album Tag Editor</p>
            <h2 id="tag-editor-title">Edit album</h2>
            <p id="tag-editor-caption">These edits are saved as local overrides. Your original audio files are not rewritten.</p>
          </div>
          <button id="tag-editor-close-button" className="icon-button" type="button" aria-label="Close tag editor">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div id="tag-editor-body-root" />

        <footer className="tag-editor-footer">
          <button id="tag-editor-reset-button" className="secondary-button" type="button">
            Reset overrides
          </button>
          <div>
            <button id="tag-editor-cancel-button" className="secondary-button" type="button">
              Cancel
            </button>
            <button id="tag-editor-save-button" className="primary-button" type="button">
              Save tags
            </button>
          </div>
        </footer>
      </section>
    </>
  );
}

function ArtistEditorShell() {
  return (
    <>
      <div id="artist-editor-overlay" className="modal-overlay" hidden />
      <section
        id="artist-editor-modal"
        className="tag-editor-modal artist-editor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artist-editor-title"
        hidden
      >
        <header className="tag-editor-header">
          <div>
            <p className="eyebrow">Artist Editor</p>
            <h2 id="artist-editor-title">Edit artist info</h2>
            <p id="artist-editor-caption">Add an artist image and local profile info.</p>
          </div>
          <button id="artist-editor-close-button" className="icon-button" type="button" aria-label="Close artist editor">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div id="artist-editor-body-root" />

        <footer className="tag-editor-footer">
          <button id="artist-editor-reset-button" className="secondary-button" type="button">
            Clear edited info
          </button>
          <div>
            <button id="artist-editor-cancel-button" className="secondary-button" type="button">
              Cancel
            </button>
            <button id="artist-editor-save-button" className="primary-button" type="button">
              Save artist
            </button>
          </div>
        </footer>
      </section>
    </>
  );
}

function LyricsEditorShell() {
  return (
    <>
      <div id="lyrics-editor-overlay" className="modal-overlay" hidden />
      <section
        id="lyrics-editor-modal"
        className="tag-editor-modal lyrics-editor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lyrics-editor-title"
        hidden
      >
        <header className="tag-editor-header">
          <div>
            <p className="eyebrow">Lyrics Editor</p>
            <h2 id="lyrics-editor-title">Add lyrics</h2>
            <p id="lyrics-editor-caption">Save synced LRC or plain lyrics locally and beside the music file.</p>
          </div>
          <button id="lyrics-editor-close-button" className="icon-button" type="button" aria-label="Close lyrics editor">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div id="lyrics-editor-body-root" className="tag-editor-body lyrics-editor-body" />

        <footer className="tag-editor-footer">
          <button id="lyrics-editor-reset-button" className="secondary-button" type="button">
            Reset lyrics
          </button>
          <div>
            <button id="lyrics-editor-cancel-button" className="secondary-button" type="button">
              Cancel
            </button>
            <button id="lyrics-editor-save-button" className="primary-button" type="button">
              Save lyrics
            </button>
          </div>
        </footer>
      </section>
    </>
  );
}

export function AppShell() {
  return (
    <div className="app-react-shell">
      <div className="app-shell">
        <SidebarShell />
        <ContentShell />
      </div>
      <NowPlayingFooter />
      <FullscreenOverlay />
      <QueuePanelShell />
      <TagEditorShell />
      <ArtistEditorShell />
      <LyricsEditorShell />
    </div>
  );
}
