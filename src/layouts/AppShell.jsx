import { getRepeatIcon, getShuffleIcon } from '../assets/icons/player/index.js';
import { PlayerIcon } from '../components/common/VisualBits.jsx';

const staticLibraryTabs = [
  ['folders', 'Folders', false],
  ['albums', 'Albums', true],
  ['collections', 'Collections', false],
  ['artists', 'Artists', false],
  ['tracks', 'Tracks', false],
];

function SidebarShell() {
  return (
    <>
      <aside id="app-sidebar" className="sidebar" />
      <div id="sidebar-overlay" className="sidebar-overlay" hidden />
    </>
  );
}

function Topbar() {
  return (
    <div id="topbar-root" />
  );
}

function LoginView() {
  return (
    <section id="login-view" className="view" hidden>
      <div id="login-view-root" />
    </section>
  );
}

function HomeView() {
  return (
    <section id="home-view" className="view">
      <div id="home-intro-root" />

      <section className="content-section">
        <div id="album-grid" className="album-grid" />
      </section>
    </section>
  );
}

function LibraryView() {
  return (
    <section id="library-view" className="view" hidden>
      <section className="content-section library-browser">
        <div id="library-intro-root" />
        <div id="library-tabs-root" />

        {staticLibraryTabs.map(([tabId, , active]) => (
          <div
            key={tabId}
            id={`library-panel-${tabId}`}
            className="library-panel"
            role="tabpanel"
            hidden={!active}
          />
        ))}
      </section>
    </section>
  );
}

function PlaylistsView() {
  return (
    <section id="playlists-view" className="view" hidden>
      <section className="content-section library-browser">
        <div id="playlists-intro-root" />
        <div id="library-panel-playlists" className="library-panel" />
      </section>
    </section>
  );
}

function FavoritesView() {
  return (
    <section id="favorites-view" className="view" hidden>
      <section className="content-section">
        <div id="favorite-albums-intro-root" />
        <div id="favorite-album-grid" className="album-grid" />
      </section>

      <section className="content-section">
        <div id="favorite-tracks-intro-root" />
        <div id="favorite-track-list" className="track-list track-list-shell" />
      </section>
    </section>
  );
}

function WishlistView() {
  return (
    <section id="wishlist-view" className="view" hidden>
      <section className="content-section">
        <div id="wishlist-intro-root" />
        <div id="wishlist-album-grid" className="album-grid" />
      </section>
    </section>
  );
}

function SettingsView() {
  return (
    <section id="settings-view" className="view" hidden>
      <section className="content-section settings-shell">
        <div id="settings-intro-root" />

        <div id="settings-tabs" className="settings-tabs" role="tablist" aria-label="Settings sections" />
        <div id="settings-panels" className="settings-panels">
          <div id="settings-react-panel-host" className="settings-react-panel" />
        </div>
        <div id="settings-status-root" />
      </section>
    </section>
  );
}

function AdminView() {
  return (
    <section id="admin-view" className="view" hidden>
      <section className="content-section settings-shell admin-main-shell">
        <div id="admin-intro-root" />
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
        <LoginView />
        <HomeView />
        <LibraryView />
        <PlaylistsView />
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
                <button id="fs-shuffle-btn" type="button" title="Shuffle off" aria-label="Shuffle off" aria-pressed="false">
                  <PlayerIcon src={getShuffleIcon(false)} />
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
                <button id="fs-repeat-btn" type="button" title="Repeat off" aria-label="Repeat off" aria-pressed="false">
                  <PlayerIcon src={getRepeatIcon('off')} />
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
      <section id="tag-editor-modal" className="tag-editor-modal" role="dialog" aria-modal="true" aria-labelledby="tag-editor-title" hidden />
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
      />
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
      />
    </>
  );
}

function PlaylistDialogShell() {
  return (
    <>
      <div id="playlist-dialog-overlay" className="modal-overlay" hidden />
      <section
        id="playlist-dialog-modal"
        className="playlist-dialog-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Playlist"
        hidden
      />
    </>
  );
}

export function AppShell() {
  return (
    <div className="app-react-shell">
      <div className="app-ambient-cover" aria-hidden="true" />
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
      <PlaylistDialogShell />
    </div>
  );
}
