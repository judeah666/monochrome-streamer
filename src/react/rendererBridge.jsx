import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { QueueList } from './QueueList.jsx';
import { QueuePanelContainer } from './QueuePanelContainer.jsx';
import {
  PlayerNowPlayingContainer,
  PlayerTransportControlsContainer,
  PlayerUtilityControlsContainer,
} from './PlayerContainers.jsx';
import { AlbumGrid } from './AlbumGrid.jsx';
import { AlbumCollection } from './AlbumCollection.jsx';
import { AlbumDetail } from './AlbumDetail.jsx';
import { CollectionBrowser } from './CollectionBrowser.jsx';
import { CollectionDetail } from './CollectionDetail.jsx';
import { TrackList } from './TrackList.jsx';
import { TrackCollection } from './TrackCollection.jsx';
import { ArtistGrid } from './ArtistGrid.jsx';
import { ArtistDetail } from './ArtistDetail.jsx';
import { LibraryFilterBar, LibraryPager } from './LibraryControls.jsx';
import { LibraryArtistsPanel, LibraryTracksPanel } from './LibraryPanels.jsx';
import { LibraryTabs } from './LibraryTabs.jsx';
import { SettingsPanelContainer, SettingsTabsContainer } from './SettingsContainers.jsx';
import { AdminSettingsPanel } from './admin.jsx';
import { FolderBrowser } from './FolderBrowser.jsx';
import { PlaylistBrowser } from './PlaylistBrowser.jsx';
import { FullscreenLyrics } from './FullscreenLyrics.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { HomeIntro } from './HomeIntro.jsx';
import { AdminIntro, FavoritesIntro, LibraryIntro, SettingsIntro, SettingsStatus, WishlistIntro } from './SectionIntros.jsx';
import { AlbumTagEditorModal, ArtistEditorModal, LyricsEditorModal } from './EditorModals.jsx';
import { IconHtml } from './IconHtml.jsx';
import { LoginView } from './LoginView.jsx';

const mountedRoots = new WeakMap();

const persistentRenderers = {
  renderQueueList: QueueList,
  renderPlayerUtilityControls: PlayerUtilityControlsContainer,
  renderPlayerNowPlaying: PlayerNowPlayingContainer,
  renderPlayerTransportControls: PlayerTransportControlsContainer,
  renderAlbumGrid: AlbumGrid,
  renderTrackList: TrackList,
  renderArtistGrid: ArtistGrid,
  renderSettingsTabs: SettingsTabsContainer,
};

const rootRenderers = {
  renderQueuePanel: QueuePanelContainer,
  renderAlbumCollection: AlbumCollection,
  renderCollectionBrowser: CollectionBrowser,
  renderCollectionDetail: CollectionDetail,
  renderAlbumDetail: AlbumDetail,
  renderTrackCollection: TrackCollection,
  renderArtistDetail: ArtistDetail,
  renderLibraryFilterBar: LibraryFilterBar,
  renderLibraryPager: LibraryPager,
  renderLibraryTabs: LibraryTabs,
  renderLibraryArtistsPanel: LibraryArtistsPanel,
  renderLibraryTracksPanel: LibraryTracksPanel,
  renderSettingsPanel: SettingsPanelContainer,
  renderFolderBrowser: FolderBrowser,
  renderPlaylistBrowser: PlaylistBrowser,
  renderSidebar: Sidebar,
  renderTopbar: Topbar,
  renderHomeIntro: HomeIntro,
  renderLibraryIntro: LibraryIntro,
  renderFavoritesIntro: FavoritesIntro,
  renderWishlistIntro: WishlistIntro,
  renderSettingsIntro: SettingsIntro,
  renderSettingsStatus: SettingsStatus,
  renderAdminIntro: AdminIntro,
  renderLoginView: LoginView,
};

export function installMonochromeReactBridge(targetWindow = window) {
  const bridge = {};

  for (const [name, Component] of Object.entries(persistentRenderers)) {
    bridge[name] = (container, props) => renderReactRoot(container, <Component {...props} />);
  }

  for (const [name, Component] of Object.entries(rootRenderers)) {
    bridge[name] = (container, props) => renderReactRoot(container, <Component {...props} />);
  }

  bridge.renderLyricsEditorModal = (container, props) =>
    renderReactRoot(container, <LyricsEditorModal key={props.renderKey} {...props} />, { sync: true });
  bridge.renderAlbumTagEditorModal = (container, props) =>
    renderReactRoot(container, <AlbumTagEditorModal key={props.renderKey} {...props} />, { sync: true });
  bridge.renderArtistEditorModal = (container, props) =>
    renderReactRoot(container, <ArtistEditorModal key={props.renderKey} {...props} />, { sync: true });
  bridge.renderFullscreenLyrics = (container, props) =>
    renderReactRoot(container, <FullscreenLyrics key={props.renderKey} {...props} />, { sync: true });
  bridge.renderIconHtml = (container, props) =>
    renderReactRoot(container, <IconHtml {...props} />, { sync: true });
  bridge.renderAdminPanel = (container, props) =>
    renderReactRoot(container, <AdminSettingsPanel embedded {...props} />);
  bridge.unmount = unmountReactRoot;

  targetWindow.MonochromeReact = bridge;
  return bridge;
}

function renderReactRoot(container, element, { sync = false } = {}) {
  if (!container) return;
  let root = mountedRoots.get(container);
  if (!root) {
    root = createRoot(container);
    mountedRoots.set(container, root);
  }
  const tree = (
    <React.StrictMode>
      {element}
    </React.StrictMode>
  );
  if (sync) {
    flushSync(() => root.render(tree));
    return;
  }
  root.render(tree);
}

function unmountReactRoot(container) {
  const root = mountedRoots.get(container);
  if (!root) return;
  root.unmount();
  mountedRoots.delete(container);
}
