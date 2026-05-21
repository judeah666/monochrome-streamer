import React, { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { QueueList } from './QueueList.jsx';
import { QueuePanel } from './QueuePanel.jsx';
import { PlayerUtilityControls } from './PlayerUtilityControls.jsx';
import { PlayerNowPlaying } from './PlayerNowPlaying.jsx';
import { PlayerTransportControls } from './PlayerTransportControls.jsx';
import { AlbumGrid } from './AlbumGrid.jsx';
import { AlbumCollection } from './AlbumCollection.jsx';
import { AlbumDetail } from './AlbumDetail.jsx';
import { TrackList } from './TrackList.jsx';
import { ArtistGrid } from './ArtistGrid.jsx';
import { SettingsTabs } from './SettingsTabs.jsx';
import { AppearanceSettings } from './AppearanceSettings.jsx';
import { InterfaceSettings } from './InterfaceSettings.jsx';
import { AudioSettings, DownloadSettings, InstanceSettings, SystemSettings } from './RemainingSettings.jsx';
import { LyricsEditorBody } from './LyricsEditor.jsx';
import { AlbumTagEditorBody } from './AlbumTagEditor.jsx';
import { FolderBrowser } from './FolderBrowser.jsx';
import { PlaylistBrowser } from './PlaylistBrowser.jsx';
import { ArtistEditorBody } from './ArtistEditor.jsx';
import { FullscreenLyrics } from './FullscreenLyrics.jsx';
import { Sidebar } from './Sidebar.jsx';
import { EditorModal } from './EditorModal.jsx';

const mountedRoots = new WeakMap();

function ReactBridge() {
  useEffect(() => {
    document.documentElement.dataset.react = 'ready';
    window.dispatchEvent(new CustomEvent('monochrome:react-ready'));

    return () => {
      delete document.documentElement.dataset.react;
    };
  }, []);

  return null;
}

const rootElement = document.querySelector('#react-root');

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ReactBridge />
    </React.StrictMode>,
  );
}

window.MonochromeReact = {
  renderQueueList(container, props) {
    if (!container) return;
    let root = mountedRoots.get(container);
    if (!root) {
      root = createRoot(container);
      mountedRoots.set(container, root);
    }
    root.render(
      <React.StrictMode>
        <QueueList {...props} />
      </React.StrictMode>,
    );
  },
  renderQueuePanel(container, props) {
    renderReactRoot(container, <QueuePanel {...props} />);
  },
  renderPlayerUtilityControls(container, props) {
    if (!container) return;
    let root = mountedRoots.get(container);
    if (!root) {
      root = createRoot(container);
      mountedRoots.set(container, root);
    }
    root.render(
      <React.StrictMode>
        <PlayerUtilityControls {...props} />
      </React.StrictMode>,
    );
  },
  renderPlayerNowPlaying(container, props) {
    if (!container) return;
    let root = mountedRoots.get(container);
    if (!root) {
      root = createRoot(container);
      mountedRoots.set(container, root);
    }
    root.render(
      <React.StrictMode>
        <PlayerNowPlaying {...props} />
      </React.StrictMode>,
    );
  },
  renderPlayerTransportControls(container, props) {
    if (!container) return;
    let root = mountedRoots.get(container);
    if (!root) {
      root = createRoot(container);
      mountedRoots.set(container, root);
    }
    root.render(
      <React.StrictMode>
        <PlayerTransportControls {...props} />
      </React.StrictMode>,
    );
  },
  renderAlbumGrid(container, props) {
    if (!container) return;
    let root = mountedRoots.get(container);
    if (!root) {
      root = createRoot(container);
      mountedRoots.set(container, root);
    }
    root.render(
      <React.StrictMode>
        <AlbumGrid {...props} />
      </React.StrictMode>,
    );
  },
  renderAlbumCollection(container, props) {
    renderReactRoot(container, <AlbumCollection {...props} />);
  },
  renderAlbumDetail(container, props) {
    renderReactRoot(container, <AlbumDetail {...props} />);
  },
  renderTrackList(container, props) {
    if (!container) return;
    let root = mountedRoots.get(container);
    if (!root) {
      root = createRoot(container);
      mountedRoots.set(container, root);
    }
    root.render(
      <React.StrictMode>
        <TrackList {...props} />
      </React.StrictMode>,
    );
  },
  renderArtistGrid(container, props) {
    if (!container) return;
    let root = mountedRoots.get(container);
    if (!root) {
      root = createRoot(container);
      mountedRoots.set(container, root);
    }
    root.render(
      <React.StrictMode>
        <ArtistGrid {...props} />
      </React.StrictMode>,
    );
  },
  renderSettingsTabs(container, props) {
    if (!container) return;
    let root = mountedRoots.get(container);
    if (!root) {
      root = createRoot(container);
      mountedRoots.set(container, root);
    }
    root.render(
      <React.StrictMode>
        <SettingsTabs {...props} />
      </React.StrictMode>,
    );
  },
  renderAppearanceSettings(container, props) {
    if (!container) return;
    let root = mountedRoots.get(container);
    if (!root) {
      root = createRoot(container);
      mountedRoots.set(container, root);
    }
    root.render(
      <React.StrictMode>
        <AppearanceSettings {...props} />
      </React.StrictMode>,
    );
  },
  renderInterfaceSettings(container, props) {
    if (!container) return;
    let root = mountedRoots.get(container);
    if (!root) {
      root = createRoot(container);
      mountedRoots.set(container, root);
    }
    root.render(
      <React.StrictMode>
        <InterfaceSettings {...props} />
      </React.StrictMode>,
    );
  },
  renderAudioSettings(container, props) {
    renderReactRoot(container, <AudioSettings {...props} />);
  },
  renderDownloadSettings(container, props) {
    renderReactRoot(container, <DownloadSettings {...props} />);
  },
  renderInstanceSettings(container, props) {
    renderReactRoot(container, <InstanceSettings {...props} />);
  },
  renderSystemSettings(container, props) {
    renderReactRoot(container, <SystemSettings {...props} />);
  },
  renderLyricsEditorBody(container, props) {
    renderReactRoot(container, <LyricsEditorBody key={props.renderKey} {...props} />);
  },
  renderAlbumTagEditorBody(container, props) {
    renderReactRoot(container, <AlbumTagEditorBody key={props.renderKey} {...props} />, { sync: true });
  },
  renderFolderBrowser(container, props) {
    renderReactRoot(container, <FolderBrowser {...props} />);
  },
  renderPlaylistBrowser(container, props) {
    renderReactRoot(container, <PlaylistBrowser {...props} />);
  },
  renderArtistEditorBody(container, props) {
    renderReactRoot(container, <ArtistEditorBody key={props.renderKey} {...props} />, { sync: true });
  },
  renderFullscreenLyrics(container, props) {
    renderReactRoot(container, <FullscreenLyrics key={props.renderKey} {...props} />, { sync: true });
  },
  renderSidebar(container, props) {
    renderReactRoot(container, <Sidebar {...props} />);
  },
  renderEditorModal(container, props) {
    renderReactRoot(container, <EditorModal {...props} />, { sync: true });
  },
  unmount(container) {
    const root = mountedRoots.get(container);
    if (!root) return;
    root.unmount();
    mountedRoots.delete(container);
  },
};

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
