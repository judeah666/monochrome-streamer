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
import { SettingsPanelContainer, SettingsTabsContainer } from './SettingsContainers.jsx';
import { AdminSettingsPanel } from './admin.jsx';
import { LyricsEditorBody } from './LyricsEditor.jsx';
import { AlbumTagEditorBody } from './AlbumTagEditor.jsx';
import { FolderBrowser } from './FolderBrowser.jsx';
import { PlaylistBrowser } from './PlaylistBrowser.jsx';
import { ArtistEditorBody } from './ArtistEditor.jsx';
import { FullscreenLyrics } from './FullscreenLyrics.jsx';
import { Sidebar } from './Sidebar.jsx';
import { EditorModal } from './EditorModal.jsx';
import { LyricsSuggestionResults, TagSuggestionResults } from './ScraperResults.jsx';
import { IconHtml } from './IconHtml.jsx';

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
  renderLibraryArtistsPanel: LibraryArtistsPanel,
  renderLibraryTracksPanel: LibraryTracksPanel,
  renderSettingsPanel: SettingsPanelContainer,
  renderFolderBrowser: FolderBrowser,
  renderPlaylistBrowser: PlaylistBrowser,
  renderSidebar: Sidebar,
};

export function installMonochromeReactBridge(targetWindow = window) {
  const bridge = {};

  for (const [name, Component] of Object.entries(persistentRenderers)) {
    bridge[name] = (container, props) => renderReactRoot(container, <Component {...props} />);
  }

  for (const [name, Component] of Object.entries(rootRenderers)) {
    bridge[name] = (container, props) => renderReactRoot(container, <Component {...props} />);
  }

  bridge.renderLyricsEditorBody = (container, props) =>
    renderReactRoot(container, <LyricsEditorBody key={props.renderKey} {...props} />);
  bridge.renderAlbumTagEditorBody = (container, props) =>
    renderReactRoot(container, <AlbumTagEditorBody key={props.renderKey} {...props} />, { sync: true });
  bridge.renderArtistEditorBody = (container, props) =>
    renderReactRoot(container, <ArtistEditorBody key={props.renderKey} {...props} />, { sync: true });
  bridge.renderFullscreenLyrics = (container, props) =>
    renderReactRoot(container, <FullscreenLyrics key={props.renderKey} {...props} />, { sync: true });
  bridge.renderEditorModal = (container, props) =>
    renderReactRoot(container, <EditorModal {...props} />, { sync: true });
  bridge.renderTagSuggestionResults = (container, props) =>
    renderReactRoot(container, <TagSuggestionResults {...props} />, { sync: true });
  bridge.renderLyricsSuggestionResults = (container, props) =>
    renderReactRoot(container, <LyricsSuggestionResults {...props} />, { sync: true });
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
