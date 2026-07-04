import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { QueueList } from '../components/queue/QueueList.jsx';
import { QueuePanelContainer } from '../components/queue/QueuePanelContainer.jsx';
import {
  PlayerNowPlayingContainer,
  PlayerTransportControlsContainer,
  PlayerUtilityControlsContainer,
} from '../components/player/PlayerContainers.jsx';
import { AlbumGrid } from '../components/albums/AlbumGrid.jsx';
import { AlbumCollection } from '../components/albums/AlbumCollection.jsx';
import { AlbumDetail } from '../components/albums/AlbumDetail.jsx';
import { CollectionBrowser } from '../components/collections/CollectionBrowser.jsx';
import { CollectionDetail } from '../components/collections/CollectionDetail.jsx';
import { TrackList } from '../components/library/TrackList.jsx';
import { TrackCollection } from '../components/library/TrackCollection.jsx';
import { ArtistGrid } from '../components/artists/ArtistGrid.jsx';
import { ArtistDetail } from '../components/artists/ArtistDetail.jsx';
import { LibraryFilterBar, LibraryPager } from '../components/library/LibraryControls.jsx';
import { LibraryArtistsPanel, LibraryTracksPanel } from '../components/library/LibraryPanels.jsx';
import { LibraryTabs } from '../components/library/LibraryTabs.jsx';
import { SettingsPanelContainer, SettingsTabsContainer } from '../components/settings/SettingsContainers.jsx';
import { AdminSettingsPanel } from '../react/admin.jsx';
import { FolderBrowser } from '../components/library/FolderBrowser.jsx';
import { PlaylistBrowser } from '../components/library/PlaylistBrowser.jsx';
import { PlaylistDialog } from '../components/playlists/PlaylistDialog.jsx';
import { FullscreenLyrics } from '../pages/FullscreenLyrics.jsx';
import { Sidebar } from '../components/navigation/Sidebar.jsx';
import { Topbar } from '../components/navigation/Topbar.jsx';
import { HomeIntro } from '../components/home/HomeIntro.jsx';
import { HomeAlbumSections } from '../components/home/HomeAlbumSections.jsx';
import { AdminIntro, FavoritesIntro, LibraryIntro, SettingsIntro, SettingsStatus, WishlistIntro } from '../components/common/SectionIntros.jsx';
import { DownloadStatusToast } from '../components/common/DownloadStatusToast.jsx';
import {
  AlbumTagEditorModal,
  ArtistEditorModal,
  CollectionCoverEditorModal,
  LyricsEditorModal,
} from '../components/editors/EditorModals.jsx';
import { IconHtml } from '../components/common/IconHtml.jsx';
import { LoginView } from '../pages/LoginView.jsx';

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
  renderHomeAlbumSections: HomeAlbumSections,
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
  bridge.renderCollectionCoverEditorModal = (container, props) =>
    renderReactRoot(container, <CollectionCoverEditorModal key={props.renderKey} {...props} />, { sync: true });
  bridge.renderFullscreenLyrics = (container, props) =>
    renderReactRoot(container, <FullscreenLyrics key={props.renderKey} {...props} />, { sync: true });
  bridge.renderPlaylistDialog = (container, props) =>
    renderReactRoot(container, <PlaylistDialog key={props.renderKey} {...props} />, { sync: true });
  bridge.renderDownloadStatusToast = (container, props) =>
    renderReactRoot(container, <DownloadStatusToast {...props} />, { sync: true });
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
