import {
  ALPHABET_FILTERS,
  AUDIO_QUALITY_ICONS,
  DEFAULT_SETTINGS,
  FONT_PRESETS,
  ICONS,
  MEDIA_TYPE_FILTERS,
  MEDIA_TYPE_ICONS,
  MOBILE_SIDEBAR_QUERY,
  PLAYER_ICONS,
  RENDER_LIMITS,
  REPEAT_MODES,
  SETTINGS_TABS,
  STORAGE_KEYS,
} from './constants.js';
import { createInitialState } from './appState.js';
import { getDomRefs } from './domRefs.js';
import {
  addTrackIdsToQueue,
  clearQueueState,
  removeTrackIdFromQueue,
  reorderQueueState,
} from './queueState.js';
import { buildQueuePanelSnapshot } from './queuePanelPresenter.js';
import { createQueuePanelStore } from './queuePanelStore.js';
import { createPlaybackController } from './playbackController.js';
import {
  seekAudioBy,
  setAudioCurrentTime,
  setupMediaSessionActions,
  updateMediaSession,
  updateMediaSessionPlaybackState,
  updateMediaSessionPositionState,
} from './mediaSession.js';
import {
  getPlaybackButtonState,
  getQueueStatusText,
  getVolumeIconName,
  normalizeAudioQualityForReact,
} from './playerUiState.js';
import { buildPlayerSnapshot } from './playerPresenter.js';
import { createPlayerStore } from './playerStore.js';
import {
  bindWheelScrollLock,
  bindSeekControl as bindPlayerSeekControl,
  bindVolumeControl as bindPlayerVolumeControl,
  getMutedVolumeState,
  getNextVolumeState,
  getProgressState,
  updateProgressElements,
  updateVolumeElements,
} from './playerControls.js';
import {
  createLyricsSignature,
  createPlainLyricsSignature,
  getPlainLyricLines,
  getSyncedLyricLines,
  parseSyncedLyrics,
  updateSyncedLyricsHighlight,
} from './fullscreenLyricsState.js';
import {
  ensureAudioGraph,
  updateVisualizerState as updateFullscreenVisualizerState,
} from './visualizerController.js';
import {
  addFavoriteIds,
  hasFavorite,
  toggleFavoriteId,
} from './favoritesState.js';
import * as librarySelectors from './librarySelectors.js';
import {
  createBrowseRoute,
  getAlbumHash,
  getArtistHash,
  getCollectionHash,
  getFullscreenReturnHash,
  isValidBrowseView,
  parseRouteFromHash,
} from './routeState.js';
import {
  buildArtistInfoPayload,
  buildLyricsPayload,
  buildTagEditorPayload,
} from './editorPayloads.js';
import {
  hasReactRenderer,
  renderReact,
  unmountReact,
} from './reactRenderer.js';
import {
  clampAlbumCardSize,
  normalizeSettings,
  persistSettings,
  readStoredSettings,
} from './settingsStore.js';
import {
  applyTemplate,
  clamp,
  delay,
  escapeHtml,
  extractYear,
  fetchJson,
  formatSeconds,
  formatTimestamp,
  getFileExtension,
  readStoredIdSet,
  readStoredNumber,
  readStoredNumberFromObject,
  readStoredObject,
  sanitizeFilename,
  writeStoredIdSet,
} from './utils.js';
import {
  buildSettingsPanelSnapshot,
  buildSettingsTabsSnapshot,
  createDefaultWidgetSettings,
  toTitleCase,
} from './settingsPresenter.js';
import { isLightTheme, resolveThemePreset } from './themeResolver.js';
import { createSettingsPanelStore } from './settingsPanelStore.js';
import {
  buildAlbumDetailSnapshot,
  createAlbumCardView,
  createTrackRowView,
} from './albumViewPresenter.js';
import {
  buildAlbumCollectionSnapshot,
  buildLibraryArtistsPanelSnapshot,
  buildLibraryFilterSnapshot,
  buildLibraryPagerSnapshot,
  buildLibraryTracksPanelSnapshot,
  buildTrackCollectionSnapshot,
} from './libraryViewPresenter.js';
import {
  buildAddAlbumBodySnapshot,
  buildAddAlbumModalSnapshot,
  buildArtistEditorBodySnapshot,
  buildArtistEditorModalSnapshot,
  buildLyricsEditorBodySnapshot,
  buildLyricsEditorModalSnapshot,
  buildTagEditorBodySnapshot,
  buildTagEditorModalSnapshot,
} from './editorViewPresenter.js';

const {
  appSidebar,
  topbarRoot,
  sidebarOverlay,
  loginView,
  loginViewRoot,
  homeView,
  homeIntroRoot,
  libraryView,
  libraryIntroRoot,
  libraryTabsRoot,
  libraryPanelFolders,
  libraryPanelAlbums,
  libraryPanelCollections,
  libraryPanelArtists,
  libraryPanelTracks,
  libraryPanelPlaylists,
  favoritesView,
  wishlistView,
  settingsView,
  adminView,
  adminPanelRoot,
  artistView,
  albumView,
  albumGrid,
  favoriteAlbumsIntroRoot,
  favoriteTracksIntroRoot,
  favoriteAlbumGrid,
  favoriteTrackList,
  wishlistIntroRoot,
  wishlistAlbumGrid,
  settingsIntroRoot,
  settingsTabs,
  settingsPanels,
  settingsReactPanelHost,
  settingsStatusRoot,
  adminIntroRoot,
  appFavicon,
  audioPlayer,
  nowPlayingBar,
  playerTrackInfoRoot,
  playerTransportControls,
  currentTimeElement,
  totalDurationElement,
  progressBar,
  progressFill,
  volumeBar,
  volumeFill,
  playerUtilityControls,
  fullscreenOverlay,
  fullscreenBackdrop,
  fullscreenVisualizer,
  fullscreenCoverImage,
  fullscreenCoverFallback,
  fullscreenTrackTitle,
  fullscreenTrackArtist,
  fullscreenNextTrack,
  fullscreenNextTrackValue,
  fullscreenLyricsContent,
  closeFullscreenButton,
  toggleFullscreenLyricsButton,
  toggleFullscreenUiButton,
  fullscreenVisualizerButton,
  fullscreenLikeButton,
  fullscreenEditButton,
  fullscreenDownloadLink,
  fullscreenLyricsEditButton,
  fullscreenQueueButton,
  fullscreenShuffleButton,
  fullscreenPrevButton,
  fullscreenPlayPauseButton,
  fullscreenNextButton,
  fullscreenRepeatButton,
  fullscreenCurrentTimeElement,
  fullscreenTotalDurationElement,
  fullscreenProgressBar,
  fullscreenProgressFill,
  fullscreenVolumeButton,
  fullscreenVolumeBar,
  fullscreenVolumeFill,
  queueStatus,
  queuePanel,
  queueCloseButton,
  queueDownloadButton,
  queueFavoriteButton,
  queueClearButton,
  queueOverlay,
  queueList,
  tagEditorOverlay,
  tagEditorModal,
  artistEditorOverlay,
  artistEditorModal,
  lyricsEditorOverlay,
  lyricsEditorModal,
} = getDomRefs();

const state = createInitialState();
let queuePanelStore = null;
let playerStore = null;
let settingsPanelStore = null;
const playbackController = createPlaybackController({
  state,
  audioPlayer,
  getFilteredTracks,
  getDefaultQueueForTrack: buildDefaultQueueForTrack,
  loadTrackLyrics,
  persistPlaybackState,
  updatePlayerUi,
  updateProgressUi,
  render,
  onPlaybackError: (error) => console.error(error),
  onLyricsError: (message, error) => console.warn(message, error),
});

let settingsReactPanelContainer = settingsReactPanelHost;
let settingsReactPanelTab = '';
let playerReserveResizeObserver = null;
let playerReserveFrame = 0;
let measuredPlayerReserve = '';

const LIBRARY_TAB_REGISTRY = [
  ['folders', 'Folders', libraryPanelFolders],
  ['albums', 'Albums', libraryPanelAlbums],
  ['collections', 'Collections', libraryPanelCollections],
  ['artists', 'Artists', libraryPanelArtists],
  ['tracks', 'Tracks', libraryPanelTracks],
  ['playlists', 'Playlists', libraryPanelPlaylists],
];

const PRIMARY_VIEW_REGISTRY = {
  login: loginView,
  home: homeView,
  library: libraryView,
  favorites: favoritesView,
  wishlist: wishlistView,
  settings: settingsView,
  admin: adminView,
};

const SECONDARY_VIEW_VISIBILITY_REGISTRY = [
  { element: artistView, isVisible: (viewContext) => viewContext.isArtistView || viewContext.isCollectionView },
  { element: albumView, isVisible: (viewContext) => viewContext.isAlbumView },
  { element: fullscreenOverlay, isVisible: (viewContext) => viewContext.isFullscreenView },
];

const ROUTE_VIEW_RENDERERS = {
  login: () => renderLoginView(),
  album: ({ currentAlbum }) => renderAlbumDetail(currentAlbum),
  artist: ({ currentArtist }) => renderArtistDetail(currentArtist),
  collection: ({ currentCollectionName }) => renderCollectionDetail(currentCollectionName),
  library: ({ filteredTracks, filteredAlbums }) => renderLibraryView(filteredTracks, filteredAlbums),
  favorites: ({ filteredTracks }) => renderFavoritesView(filteredTracks),
  wishlist: () => renderWishlistView(),
  settings: () => renderSettingsView(),
  admin: () => renderAdminView(),
  fullscreen: () => renderFullscreenView(),
  home: ({ homeAlbums }) => renderAlbumCollection(albumGrid, homeAlbums, 'No albums matched this search.', { pageable: true }),
};

init().catch((error) => {
  console.error(error);
  state.libraryFolders = {
    ...(state.libraryFolders || {}),
    scan: { status: 'error', percent: 0 },
  };
  renderSidebar();
});

async function init() {
  state.settings = readStoredSettings();
  window.addEventListener('monochrome:download-settings-updated', handleDownloadSettingsUpdated);
  window.addEventListener('storage', handleStorageSync);

  const initialRouteResult = resolveRouteFromLocation({
    browseView: state.browseView,
    hasAlbum: () => false,
  });
  const shouldBootstrapLoginRoute = initialRouteResult.route.view === 'login';

  if (shouldBootstrapLoginRoute) {
    await initLoginRoute(initialRouteResult.route);
    return;
  }

  const [config, libraryFolders] = await Promise.all([
    fetchJson('/api/config'),
    fetchJson('/api/library/folders').catch(() => ({ available: [], selected: [], scan: null })),
    refreshWidgetSettings().catch(() => null),
  ]);
  applyServerConfig(config);
  const library = await fetchLibraryPagePayload(0);

  state.libraryFolders = libraryFolders;
  hydrateLibrary(config, library);
  state.favoriteTrackIds = readStoredIdSet(STORAGE_KEYS.favoriteTracks);
  state.favoriteAlbumIds = readStoredIdSet(STORAGE_KEYS.favoriteAlbums);
  sanitizeStoredFavorites();
  state.volume = clamp(readStoredNumber(STORAGE_KEYS.volume, 0.7), 0, 1);
  state.lastVolume = state.volume || 0.7;
  audioPlayer.volume = getEffectiveAudioVolume();
  restorePlaybackState();
  applySettings();

  applyStaticIcons();
  bindEvents();
  setupMediaSessionActions({
    audioPlayer,
    hasCurrentTrack: () => Boolean(state.currentTrackId),
    onPreviousTrack: playPreviousTrack,
    onNextTrack: playNextTrack,
    onSeekBy: (offsetSeconds) => seekAudioBy(audioPlayer, offsetSeconds, {
      onProgress: updateProgressUi,
      onPersist: persistPlaybackState,
    }),
    onSeekTo: (time, options = {}) => setAudioCurrentTime(audioPlayer, time, {
      ...options,
      onProgress: updateProgressUi,
      onPersist: persistPlaybackState,
    }),
    onError: (error) => console.error(error),
  });
  updateRouteFromLocation();
  render();
  syncVolumeUi();
  updatePlayerUi();
  setupMeasuredPlayerReserve();
  startScanStatusPolling(state.libraryFolders?.scan?.status === 'scanning' ? 1200 : 5000);
  loadHomeAlbums().catch((error) => console.error(error));
}

async function initLoginRoute(route) {
  state.route = route;
  state.loginRouteOnly = true;
  state.searchTerm = '';
  state.searchInputValue = '';
  state.currentUser = null;
  state.canDownload = false;

  applySettings();
  bindEvents();
  setupMeasuredPlayerReserve();

  try {
    const bootstrap = await fetchJson('/api/public/bootstrap');
    state.title = bootstrap?.title || state.title;
    state.ambientCovers = Array.isArray(bootstrap?.ambientCovers) ? bootstrap.ambientCovers : [];
    setAmbientCover(bootstrap?.ambientCoverUrl, {
      title: bootstrap?.ambientTitle,
      artist: bootstrap?.ambientArtist,
    });
  } catch (error) {
    state.ambientCovers = [];
    setAmbientCover('');
  }

  try {
    const auth = await fetchJson('/api/auth/me');
    state.currentUser = auth.user || null;
    state.canDownload = auth.user?.canDownload !== false;
    state.loginRouteOnly = false;
  } catch (error) {
    state.currentUser = null;
    state.canDownload = false;
  }

  updateRouteFromLocation();
  render();
}

function handleDownloadSettingsUpdated(event) {
  applyLiveDownloadSettings(event?.detail);
}

function handleStorageSync(event) {
  if (event?.key !== STORAGE_KEYS.downloadSettingsSync || !event.newValue) return;
  try {
    const payload = JSON.parse(event.newValue);
    applyLiveDownloadSettings(payload?.settings);
  } catch (error) {
    console.warn('Unable to sync download settings from storage event.', error);
  }
}

function applyLiveDownloadSettings(downloadSettings) {
  if (!downloadSettings || typeof downloadSettings !== 'object') return;
  state.settings = {
    ...state.settings,
    downloadQuality: downloadSettings.downloadQuality || state.settings.downloadQuality,
    bulkDownloadMethod: downloadSettings.bulkDownloadMethod || state.settings.bulkDownloadMethod,
    filenameTemplate: downloadSettings.filenameTemplate || state.settings.filenameTemplate,
    archiveFilenameTemplate: downloadSettings.archiveFilenameTemplate || state.settings.archiveFilenameTemplate,
    zipEntryFolderTemplate: downloadSettings.zipEntryFolderTemplate || state.settings.zipEntryFolderTemplate,
  };
}

function isMobileSidebarLayout() {
  return window.matchMedia(MOBILE_SIDEBAR_QUERY).matches;
}

function setMobileSidebarOpen(open) {
  const shouldOpen = Boolean(open) && isMobileSidebarLayout();
  document.body.classList.toggle('mobile-sidebar-open', shouldOpen);
  sidebarOverlay.hidden = !shouldOpen;
  renderTopbar();
  renderSidebar();
}

function navigateFromSidebar(view) {
  if (view === 'admin') {
    if (!isCurrentUserAdmin()) return;
    navigateToView('admin');
    if (isMobileSidebarLayout()) {
      setMobileSidebarOpen(false);
    }
    return;
  }
  navigateToView(view);
  if (isMobileSidebarLayout()) {
    setMobileSidebarOpen(false);
  }
}

function resetSearchState({ focus = false, refresh = true } = {}) {
  updateSearchValue('', { focus, refresh, immediate: true });
}

function bindEvents() {
  sidebarOverlay.addEventListener('click', () => setMobileSidebarOpen(false));
  window.addEventListener('resize', () => {
    if (!isMobileSidebarLayout()) {
      setMobileSidebarOpen(false);
    }
    renderSidebar();
    scheduleMeasuredPlayerReserve();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('mobile-sidebar-open')) {
      setMobileSidebarOpen(false);
    }
  });
  settingsPanels.addEventListener('input', handleSettingsInput);
  settingsPanels.addEventListener('change', handleSettingsInput);
  settingsPanels.addEventListener('change', handleLibraryFolderSelectionChange);
  document.addEventListener('click', (event) => {
    const alphabetButton = event.target.closest('[data-alphabet-filter]');
    if (alphabetButton) {
      state.alphabetFilter = alphabetButton.dataset.alphabetFilter || 'all';
      queueVisiblePageFetch(0);
      return;
    }

    const mediaTypeButton = event.target.closest('[data-media-type-filter-toggle]');
    if (mediaTypeButton) {
      const mediaType = normalizeMediaTypeName(mediaTypeButton.dataset.mediaTypeFilterToggle);
      if (!mediaType) return;
      toggleMediaTypeFilter(mediaType);
      return;
    }

    const button = event.target.closest('[data-library-page-action]');
    if (!button) return;
    if (state.route.view === 'wishlist') {
      const wishlistLimit = state.wishlistPage.limit || state.settings.libraryPageSize || 50;
      const wishlistOffset = button.dataset.libraryPageAction === 'next'
        ? state.wishlistPage.offset + wishlistLimit
        : Math.max(0, state.wishlistPage.offset - wishlistLimit);
      loadWishlistAlbumsPage(wishlistOffset).catch((error) => console.error(error));
      return;
    }
    if (state.route.view === 'library' && state.libraryTab === 'tracks') {
      const trackLimit = state.trackPage.limit || state.settings.libraryPageSize || 50;
      const trackOffset = button.dataset.libraryPageAction === 'next'
        ? state.trackPage.offset + trackLimit
        : Math.max(0, state.trackPage.offset - trackLimit);
      loadTrackPage(trackOffset).catch((error) => console.error(error));
      return;
    }
    const limit = state.libraryPage.limit || state.settings.libraryPageSize || 50;
    const offset = button.dataset.libraryPageAction === 'next'
      ? state.libraryPage.offset + limit
      : Math.max(0, state.libraryPage.offset - limit);
    loadLibraryPage(offset, { scrollTop: true }).catch((error) => console.error(error));
  });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-artist-page-action]');
    if (!button) return;
    const limit = state.artistPage.limit || state.settings.libraryPageSize || 50;
    const offset = button.dataset.artistPageAction === 'next'
      ? state.artistPage.offset + limit
      : Math.max(0, state.artistPage.offset - limit);
    loadArtistPage(offset, { scrollTop: true }).catch((error) => console.error(error));
  });
  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-library-page-size]');
    if (!select) return;
    changeLibraryPageSize(select.value);
  });
  settingsPanels.addEventListener('click', (event) => {
    const button = event.target.closest('[data-settings-action], [data-setting-value]');
    if (!button) return;
    handleSettingsAction(button);
  });

  queueCloseButton.addEventListener('click', closeQueuePanel);
  queueOverlay.addEventListener('click', closeQueuePanel);
  tagEditorOverlay.addEventListener('click', closeTagEditor);
  lyricsEditorOverlay.addEventListener('click', closeLyricsEditor);
  artistEditorOverlay.addEventListener('click', closeArtistEditor);
  queueDownloadButton.addEventListener('click', () => {
    downloadQueueTracks().catch((error) => console.error(error));
  });
  fullscreenDownloadLink.addEventListener('click', (event) => {
    event.preventDefault();
    const track = getCurrentTrack();
    if (!track) return;
    triggerTrackBrowserDownload(track);
  });
  queueFavoriteButton.addEventListener('click', () => {
    favoriteTracks(getPlaybackQueue());
  });
  queueClearButton.addEventListener('click', clearQueue);

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.artistEditorName) {
      closeArtistEditor();
      return;
    }
    if (event.key === 'Escape' && state.tagEditorAlbumId) {
      closeTagEditor();
      return;
    }
    if (event.key === 'Escape' && state.lyricsEditorTrackId) {
      closeLyricsEditor();
      return;
    }
    if (event.key === 'Escape' && state.queueOpen) {
      closeQueuePanel();
      return;
    }
    if (event.key === 'Escape' && state.route.view === 'fullscreen') {
      closeFullscreenPlayer();
    }
  });

  closeFullscreenButton.addEventListener('click', closeFullscreenPlayer);
  toggleFullscreenLyricsButton.addEventListener('click', () => {
    state.fullscreenLyricsHidden = !state.fullscreenLyricsHidden;
    renderFullscreenView();
  });
  toggleFullscreenUiButton.addEventListener('click', () => {
    state.fullscreenUiHidden = !state.fullscreenUiHidden;
    renderFullscreenView();
  });
  fullscreenVisualizerButton.addEventListener('click', () => {
    state.visualizerActive = !state.visualizerActive;
    updateVisualizerState();
  });
  fullscreenLikeButton.addEventListener('click', () => {
    if (state.currentTrackId) toggleFavoriteTrack(state.currentTrackId);
  });
  fullscreenEditButton.addEventListener('click', () => {
    const track = getCurrentTrack();
    const album = track ? findAlbumByTrack(track) : null;
    if (album) {
      closeFullscreenPlayer();
      openAlbum(album.id);
    }
  });
  fullscreenLyricsEditButton.addEventListener('click', () => {
    const track = getCurrentTrack();
    if (track) openLyricsEditor(track);
  });
  fullscreenQueueButton.addEventListener('click', () => {
    state.queueOpen = !state.queueOpen;
    renderQueuePanel();
    updatePlayerUi();
  });
  fullscreenPlayPauseButton.addEventListener('click', () => togglePlayback());
  fullscreenPrevButton.addEventListener('click', () => playPreviousTrack());
  fullscreenNextButton.addEventListener('click', () => playNextTrack());
  fullscreenShuffleButton.addEventListener('click', toggleShuffle);
  fullscreenRepeatButton.addEventListener('click', cycleRepeatMode);

  audioPlayer.addEventListener('play', () => {
    ensureAudioVisualizer();
    startLyricsTicker();
    updateMediaSessionPlaybackState({ audioPlayer, currentTrackId: state.currentTrackId });
    updatePlayerUi();
    render();
  });
  audioPlayer.addEventListener('pause', () => {
    stopLyricsTicker();
    updateMediaSessionPlaybackState({ audioPlayer, currentTrackId: state.currentTrackId });
    updateProgressUi();
    updatePlayerUi();
    render();
  });
  audioPlayer.addEventListener('loadedmetadata', () => {
    updateProgressUi();
    updateMediaSessionPositionState(audioPlayer);
    updateFullscreenLyricsHighlight({ forceScroll: true });
  });
  audioPlayer.addEventListener('timeupdate', () => {
    updateProgressUi();
    updateMediaSessionPositionState(audioPlayer);
    maybePersistPlaybackProgress();
  });
  audioPlayer.addEventListener('ended', () => {
    stopLyricsTicker();
    handleTrackEnded();
  });

  bindPlayerSeekControl(progressBar, {
    audioPlayer,
    onProgress: updateProgressUi,
    onPersist: persistPlaybackState,
  });

  bindVolumeControl(volumeBar);
  bindPlayerSeekControl(fullscreenProgressBar, {
    audioPlayer,
    onProgress: updateProgressUi,
    onPersist: persistPlaybackState,
  });
  bindVolumeControl(fullscreenVolumeBar);
  bindWheelScrollLock(nowPlayingBar);

  fullscreenVolumeButton.addEventListener('click', toggleMute);
  window.addEventListener('hashchange', () => {
    updateRouteFromLocation();
    if (state.loginRouteOnly && state.route.view !== 'login') {
      const { nextPath, errorCode } = getLoginRouteState();
      window.history.replaceState(null, '', getLoginRoutePath(nextPath, errorCode));
      updateRouteFromLocation();
      return;
    }
    persistPlaybackState({ includeTime: false });
    render();
  });

  window.addEventListener('pagehide', () => persistPlaybackState());
  window.addEventListener('beforeunload', () => persistPlaybackState());
}

function hydrateLibrary(config, library) {
  state.title = config.title || state.title;
  applyServerConfig(config);
  state.generatedAt = library.generatedAt;
  state.albums = library.albums;
  state.tracks = library.tracks;
  state.libraryTotals = {
    albums: library.totalAlbumCount ?? library.albumCount ?? state.libraryTotals.albums ?? library.albums.length,
    tracks: library.totalTrackCount ?? library.trackCount ?? state.libraryTotals.tracks ?? library.tracks.length,
  };
  state.libraryPage = library.page || {
    limit: state.settings.libraryPageSize || 50,
    offset: 0,
    total: state.libraryTotals.albums,
    hasNext: false,
    hasPrevious: false,
  };
  mergeLibraryData(library);
  state.artistGroups = buildArtistGroups(library.tracks);
  state.artistGroupMap = new Map(state.artistGroups.map((artist) => [artist.name, artist]));
  state.homeAlbumIds = getRandomAlbumIds(library.albums, 50);
  updateSidebarScanStatus();
}

function mergeLibraryData(library) {
  state.trackMap = new Map([
    ...state.trackMap,
    ...(library.tracks || []).map((track) => [track.id, track]),
  ]);
  state.albumMap = new Map([
    ...state.albumMap,
    ...(library.albums || []).map((album) => [album.id, album]),
  ]);
  for (const album of library.albums || []) {
    const trackIds = Array.isArray(album.trackIds) ? album.trackIds : [];
    state.albumTracksMap.set(
      album.id,
      trackIds.map((id) => state.trackMap.get(id)).filter(Boolean).sort(compareTrackOrder),
    );
  }
}

async function fetchLibraryPagePayload(offset = 0) {
  const params = new URLSearchParams({
    limit: String(state.settings.libraryPageSize || 50),
    offset: String(Math.max(0, offset)),
  });
  if (state.searchTerm) {
    params.set('search', state.searchTerm);
  }
  if (state.alphabetFilter !== 'all') {
    params.set('letter', state.alphabetFilter);
  }
  if (state.mediaTypeFilters.size > 0) {
    params.set('mediaTypes', [...state.mediaTypeFilters].join(','));
  }
  return fetchJson(`/api/library?${params.toString()}`);
}

function queueLibraryPageFetch(offset = 0) {
  const fetchId = ++state.searchFetchId;
  window.setTimeout(() => {
    if (fetchId !== state.searchFetchId) return;
    loadLibraryPage(offset).catch((error) => console.error(error));
  }, 220);
}

function queueVisiblePageFetch(offset = 0) {
  if (state.route.view === 'wishlist') {
    loadWishlistAlbumsPage(offset).catch((error) => console.error(error));
    return;
  }
  if (state.route.view === 'library' && state.libraryTab === 'folders') {
    if (!state.settings.showFolderBrowser) {
      state.libraryTab = 'albums';
      queueLibraryPageFetch(offset);
      return;
    }
    state.folderCache.clear();
    loadFolderListing('').catch((error) => console.error(error));
    render();
    return;
  }
  if (state.route.view === 'library' && state.libraryTab === 'artists') {
    queueArtistPageFetch(offset);
    return;
  }
  if (state.route.view === 'library' && state.libraryTab === 'collections') {
    loadCollectionFolders(offset).catch((error) => console.error(error));
    return;
  }
  if (state.route.view === 'collection') {
    loadCollectionAlbumsPage(offset).catch((error) => console.error(error));
    return;
  }
  if (state.route.view === 'library' && state.libraryTab === 'tracks') {
    queueTrackPageFetch(offset);
    return;
  }
  queueLibraryPageFetch(offset);
}

function clearPendingSearchUpdate() {
  if (!state.searchDebounceId) return;
  window.clearTimeout(state.searchDebounceId);
  state.searchDebounceId = 0;
}

function shouldFetchSearchResultsForCurrentView() {
  if (state.route.view === 'wishlist' || state.route.view === 'collection') {
    return true;
  }
  if (state.route.view !== 'library') {
    return false;
  }
  return state.libraryTab === 'albums'
    || state.libraryTab === 'collections'
    || state.libraryTab === 'artists'
    || state.libraryTab === 'tracks';
}

function commitSearchValue(value, { refresh = true } = {}) {
  const normalizedValue = String(value || '').trim().toLowerCase();
  const searchChanged = state.searchTerm !== normalizedValue;
  state.searchTerm = normalizedValue;
  state.searchDebounceId = 0;
  if (!refresh || !searchChanged) return;
  if (shouldFetchSearchResultsForCurrentView()) {
    queueVisiblePageFetch(0);
    return;
  }
  render();
}

function updateSearchValue(value, { focus = false, refresh = true, immediate = false } = {}) {
  state.searchInputValue = value;
  if (focus) state.searchFocusNonce += 1;
  renderTopbar();
  clearPendingSearchUpdate();
  if (immediate) {
    commitSearchValue(value, { refresh });
    return;
  }
  state.searchDebounceId = window.setTimeout(() => {
    commitSearchValue(value, { refresh });
  }, 180);
}

async function loadLibraryPage(offset = 0, { scrollTop = false } = {}) {
  const library = await fetchLibraryPagePayload(offset);
  hydrateLibrary({ title: state.title }, library);
  sanitizeStoredFavorites();
  render();
  updatePlayerUi();
  if (scrollTop) scrollPageToTop();
}

async function loadHomeAlbums() {
  if (state.searchTerm) return;
  const library = await fetchJson('/api/home-albums?limit=50');
  mergeLibraryData(library);
  state.homeAlbumIds = getRandomAlbumIds(library.albums || [], 50);
  setAmbientCoverFromAlbums(library.albums || [], { force: true });
  if (state.route.view === 'home') {
    render();
  }
}

async function loadWishlistAlbumsPage(offset = 0) {
  const params = new URLSearchParams({
    limit: String(state.settings.libraryPageSize || 50),
    offset: String(Math.max(0, offset)),
  });
  if (state.searchTerm) {
    params.set('search', state.searchTerm);
  }
  const library = await fetchJson(`/api/wishlist-albums?${params.toString()}`);
  mergeLibraryData(library);
  state.wishlistAlbums = library.albums || [];
  state.wishlistPage = library.page || {
    limit: state.settings.libraryPageSize || 50,
    offset: 0,
    total: state.wishlistAlbums.length,
    hasNext: false,
    hasPrevious: false,
  };
  state.wishlistAlbumsLoaded = true;
  render();
}

async function fetchArtistPagePayload(offset = 0) {
  const params = new URLSearchParams({
    limit: String(state.settings.libraryPageSize || 50),
    offset: String(Math.max(0, offset)),
  });
  if (state.searchTerm) {
    params.set('search', state.searchTerm);
  }
  if (state.alphabetFilter !== 'all') {
    params.set('letter', state.alphabetFilter);
  }
  return fetchJson(`/api/artists?${params.toString()}`);
}

function queueArtistPageFetch(offset = 0) {
  const fetchId = ++state.artistFetchId;
  window.setTimeout(() => {
    if (fetchId !== state.artistFetchId) return;
    loadArtistPage(offset).catch((error) => console.error(error));
  }, 220);
}

async function loadArtistPage(offset = 0, { scrollTop = false } = {}) {
  const payload = await fetchArtistPagePayload(offset);
  state.artistGroups = payload.artists || [];
  state.artistGroupMap = new Map(state.artistGroups.map((artist) => [artist.name, artist]));
  state.artistPage = payload.page || {
    limit: state.settings.libraryPageSize || 50,
    offset: 0,
    total: state.artistGroups.length,
    hasNext: false,
    hasPrevious: false,
  };
  if (scrollTop) {
    render();
    scrollPageToTop();
    return;
  }
  preservePageScroll(() => render());
}

async function fetchTrackPagePayload(offset = 0) {
  if (!state.searchTerm) {
    return {
      generatedAt: state.generatedAt,
      tracks: [],
      albums: [],
      page: {
        limit: state.settings.libraryPageSize || 50,
        offset: 0,
        total: 0,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }

  const params = new URLSearchParams({
    limit: String(state.settings.libraryPageSize || 50),
    offset: String(Math.max(0, offset)),
    search: state.searchTerm,
  });
  if (state.alphabetFilter !== 'all') {
    params.set('letter', state.alphabetFilter);
  }
  return fetchJson(`/api/tracks?${params.toString()}`);
}

function queueTrackPageFetch(offset = 0) {
  const fetchId = ++state.searchFetchId;
  window.setTimeout(() => {
    if (fetchId !== state.searchFetchId) return;
    loadTrackPage(offset).catch((error) => console.error(error));
  }, 220);
}

async function loadTrackPage(offset = 0) {
  const library = await fetchTrackPagePayload(offset);
  mergeLibraryData(library);
  state.libraryTrackResults = library.tracks || [];
  state.trackPage = library.page || {
    limit: state.settings.libraryPageSize || 50,
    offset: 0,
    total: state.libraryTrackResults.length,
    hasNext: false,
    hasPrevious: false,
  };
  preservePageScroll(() => render());
}

async function loadArtistLibrary(artistName) {
  const existing = state.artistGroupMap.get(artistName);
  if (existing?.tracks?.length > 0 && existing?.albums?.length > 0) return existing;

  const library = await fetchJson(`/api/artists/${encodeURIComponent(artistName)}/library`);
  mergeLibraryData(library);
  const group = buildArtistGroups(library.tracks).find((artist) => artist.name === artistName) || {
    name: artistName,
    tracks: library.tracks,
    albums: library.albums,
    albumIds: new Set(library.albums.map((album) => album.id)),
  };
  state.artistGroupMap.set(artistName, group);
  state.artistGroups = [
    ...state.artistGroups.filter((artist) => artist.name !== artistName),
    group,
  ].sort((left, right) => left.name.localeCompare(right.name));
  return group;
}

async function loadFolderListing(folderPath = '') {
  const normalizedPath = normalizeFolderPath(folderPath);
  if (state.folderLoading.has(normalizedPath)) return state.folderCache.get(normalizedPath) || null;
  state.folderLoading.add(normalizedPath);
  try {
    const params = new URLSearchParams({ path: normalizedPath });
    if (state.searchTerm) {
      params.set('search', state.searchTerm);
    }
    const listing = await fetchJson(`/api/folders?${params.toString()}`);
    mergeLibraryData({ tracks: listing.tracks || [], albums: [] });
    state.folderCache.set(normalizedPath, listing);
    if (state.route.view === 'library' && state.libraryTab === 'folders') {
      render();
    }
    return listing;
  } finally {
    state.folderLoading.delete(normalizedPath);
  }
}

async function loadFolderPlayQueue(folderPath = '') {
  const params = new URLSearchParams({ path: normalizeFolderPath(folderPath) });
  if (state.searchTerm) {
    params.set('search', state.searchTerm);
  }
  const library = await fetchJson(`/api/folders/playqueue?${params.toString()}`);
  mergeLibraryData(library);
  return library.tracks || [];
}

function normalizeFolderPath(folderPath) {
  return String(folderPath || '')
    .replace(/\\/gu, '/')
    .replace(/^\/+|\/+$/gu, '')
    .replace(/\/+/gu, '/')
    .trim();
}

function sanitizeStoredFavorites() {
  persistFavorites();
}

function restorePlaybackState() {
  const storedPlayback = readStoredObject(STORAGE_KEYS.playback);
  const storedQueueIds = Array.isArray(storedPlayback.queueIds)
    ? storedPlayback.queueIds.map(String).filter((id) => state.trackMap.has(id))
    : [];
  const storedShuffledQueueIds = Array.isArray(storedPlayback.shuffledQueueIds)
    ? storedPlayback.shuffledQueueIds.map(String).filter((id) => state.trackMap.has(id))
    : [];
  const currentTrackId = state.trackMap.has(String(storedPlayback.currentTrackId || ''))
    ? String(storedPlayback.currentTrackId)
    : null;

  if (isValidBrowseView(storedPlayback.browseView)) {
    state.browseView = storedPlayback.browseView;
  }
  state.fullscreenReturnHash = typeof storedPlayback.fullscreenReturnHash === 'string'
    ? storedPlayback.fullscreenReturnHash
    : '';
  state.shuffleActive = Boolean(storedPlayback.shuffleActive);
  state.repeatMode = REPEAT_MODES.includes(storedPlayback.repeatMode) ? storedPlayback.repeatMode : 'off';
  state.queueIds = storedQueueIds;
  state.shuffledQueueIds = storedShuffledQueueIds.length > 0 ? storedShuffledQueueIds : [...storedQueueIds];

  if (!currentTrackId) return;

  state.currentTrackId = currentTrackId;
  if (!state.queueIds.includes(currentTrackId)) {
    state.queueIds = [currentTrackId, ...state.queueIds];
  }
  if (!state.shuffledQueueIds.includes(currentTrackId)) {
    state.shuffledQueueIds = [currentTrackId, ...state.shuffledQueueIds];
  }
  const track = state.trackMap.get(currentTrackId);
  audioPlayer.src = track.streamUrl;
  audioPlayer.playbackRate = 1;
  loadTrackLyrics(track.id).catch((error) => console.warn('Unable to load lyrics', error));

  const restoredTime = Number(storedPlayback.currentTime);
  if (Number.isFinite(restoredTime) && restoredTime > 0) {
    audioPlayer.addEventListener('loadedmetadata', () => {
      const duration = Number.isFinite(audioPlayer.duration) ? audioPlayer.duration : 0;
      audioPlayer.currentTime = duration > 0 ? clamp(restoredTime, 0, Math.max(0, duration - 1)) : restoredTime;
      updateProgressUi();
    }, { once: true });
  }
}

function persistPlaybackState({ includeTime = true } = {}) {
  const currentTime = includeTime && Number.isFinite(audioPlayer.currentTime)
    ? audioPlayer.currentTime
    : readStoredNumberFromObject(STORAGE_KEYS.playback, 'currentTime', 0);
  localStorage.setItem(STORAGE_KEYS.playback, JSON.stringify({
    currentTrackId: state.currentTrackId || '',
    queueIds: state.queueIds.filter((id) => state.trackMap.has(id)),
    shuffledQueueIds: state.shuffledQueueIds.filter((id) => state.trackMap.has(id)),
    shuffleActive: state.shuffleActive,
    repeatMode: state.repeatMode,
    currentTime,
    browseView: state.browseView,
    fullscreenReturnHash: state.fullscreenReturnHash || '',
    routeHash: window.location.hash || '',
    savedAt: new Date().toISOString(),
  }));
}

function maybePersistPlaybackProgress() {
  const now = Date.now();
  if (now - state.lastPlaybackPersistedAt < 3000) return;
  state.lastPlaybackPersistedAt = now;
  persistPlaybackState();
}

function updateRouteFromLocation() {
  const { route, artistNameToLoad, collectionNameToLoad } = resolveRouteFromLocation({
    browseView: state.browseView,
    hasAlbum: (albumId) => state.albumMap.has(albumId),
  });
  state.route = route;
  if (route.view !== 'login') {
    clearLoginRouteSearchParams();
  }
  if (artistNameToLoad) {
    loadArtistLibrary(artistNameToLoad)
      .then(() => render())
      .catch((error) => console.error(error));
  }
  if (collectionNameToLoad) {
    state.selectedCollectionFolderPath = collectionNameToLoad;
    state.collectionAlbumsLoaded = false;
    loadCollectionAlbumsPage(0)
      .then(() => render())
      .catch((error) => console.error(error));
  }
}

async function loadCollectionAlbumsPage(offset = 0) {
  if (!state.selectedCollectionFolderPath) {
    await loadCollectionFolders();
    return;
  }
  const collectionPath = state.selectedCollectionFolderPath;
  if (state.collectionAlbumsLoading && state.collectionAlbumsLoadingPath === collectionPath) return;
  const fetchId = ++state.collectionAlbumsFetchId;
  state.collectionAlbumsLoading = true;
  state.collectionAlbumsLoadingPath = collectionPath;
  const params = new URLSearchParams({
    limit: String(state.settings.libraryPageSize || 50),
    offset: String(Math.max(0, offset)),
  });
  if (state.searchTerm) {
    params.set('search', state.searchTerm);
  }
  if (state.alphabetFilter !== 'all') {
    params.set('letter', state.alphabetFilter);
  }
  if (state.mediaTypeFilters.size > 0) {
    params.set('mediaTypes', [...state.mediaTypeFilters].join(','));
  }
  params.set('path', collectionPath);
  try {
    const library = await fetchJson(`/api/collections-albums?${params.toString()}`);
    if (fetchId !== state.collectionAlbumsFetchId || state.selectedCollectionFolderPath !== collectionPath) return;
    mergeLibraryData(library);
    state.collectionAlbums = library.albums || [];
    state.collectionPage = library.page || {
      limit: state.settings.libraryPageSize || 50,
      offset: 0,
      total: state.collectionAlbums.length,
      hasNext: false,
      hasPrevious: false,
    };
    state.collectionAlbumsLoaded = true;
    if (
      (state.route.view === 'library' && state.libraryTab === 'collections')
      || state.route.view === 'collection'
    ) {
      render();
    }
  } finally {
    if (fetchId === state.collectionAlbumsFetchId) {
      state.collectionAlbumsLoading = false;
      state.collectionAlbumsLoadingPath = '';
      if (
        (state.route.view === 'library' && state.libraryTab === 'collections')
        || state.route.view === 'collection'
      ) {
        render();
      }
    }
  }
}

async function loadCollectionFolders(offset = 0) {
  const fetchId = ++state.collectionFoldersFetchId;
  state.collectionFoldersLoading = true;
  state.collectionFoldersError = '';
  const params = new URLSearchParams({
    limit: String(state.settings.libraryPageSize || 50),
    offset: String(Math.max(0, offset)),
  });
  if (state.searchTerm) {
    params.set('search', state.searchTerm);
  }
  if (state.alphabetFilter !== 'all') {
    params.set('letter', state.alphabetFilter);
  }
  if (state.route.view === 'library' && state.libraryTab === 'collections' && !state.selectedCollectionFolderPath) {
    render();
  }
  try {
    const payload = await fetchJson(`/api/collections-albums?${params.toString()}`);
    if (fetchId !== state.collectionFoldersFetchId) return;
    state.collectionFolders = payload.folders || [];
    state.collectionFoldersPage = payload.page || {
      limit: state.settings.libraryPageSize || 50,
      offset: 0,
      total: state.collectionFolders.length,
      hasNext: false,
      hasPrevious: false,
    };
    state.collectionFoldersLoaded = true;
  } catch (error) {
    if (fetchId !== state.collectionFoldersFetchId) return;
    state.collectionFolders = [];
    state.collectionFoldersPage = {
      limit: state.settings.libraryPageSize || 50,
      offset: 0,
      total: 0,
      hasNext: false,
      hasPrevious: false,
    };
    state.collectionFoldersLoaded = true;
    state.collectionFoldersError = error instanceof Error ? error.message : 'Unable to load collection folders.';
    console.error(error);
  } finally {
    if (fetchId !== state.collectionFoldersFetchId) return;
    state.collectionFoldersLoading = false;
    if (
      (state.route.view === 'library' && state.libraryTab === 'collections' && !state.selectedCollectionFolderPath)
      || state.route.view === 'collection'
    ) {
      render();
    }
  }
}

function normalizeCollectionFolderKey(value) {
  return String(value || '').trim().toLowerCase();
}

function collectionFolderExists(collectionName) {
  const selectedKey = normalizeCollectionFolderKey(collectionName);
  if (!selectedKey) return false;
  return state.collectionFolders.some((folder) => (
    normalizeCollectionFolderKey(folder.path || folder.name) === selectedKey
  ));
}

function returnToCollectionLibrary() {
  state.route = createBrowseRoute('library');
  state.browseView = 'library';
  state.libraryTab = 'collections';
  state.selectedCollectionFolderPath = '';
  state.collectionAlbums = [];
  state.collectionAlbumsLoaded = false;
  state.collectionPage = {
    limit: state.settings.libraryPageSize || 50,
    offset: 0,
    total: 0,
    hasNext: false,
    hasPrevious: false,
  };
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
}

function applyServerConfig(config = {}) {
  state.currentUser = config.user || state.currentUser;
  state.canDownload = config.user?.canDownload !== false;
  if (config.downloadSettings) {
    state.settings = {
      ...state.settings,
      downloadQuality: config.downloadSettings.downloadQuality || state.settings.downloadQuality,
      bulkDownloadMethod: config.downloadSettings.bulkDownloadMethod || state.settings.bulkDownloadMethod,
      filenameTemplate: config.downloadSettings.filenameTemplate || state.settings.filenameTemplate,
      archiveFilenameTemplate: config.downloadSettings.archiveFilenameTemplate || state.settings.archiveFilenameTemplate,
      zipEntryFolderTemplate: config.downloadSettings.zipEntryFolderTemplate || state.settings.zipEntryFolderTemplate,
    };
  }
}

function navigateToView(view) {
  state.browseView = view;
  if (state.settings.closePanelsOnNavigation) {
    closeQueuePanel();
    closeTagEditor();
    closeArtistEditor();
    closeLyricsEditor();
  }
  if (window.location.hash) {
    window.location.hash = '';
    return;
  }

  state.route = createBrowseRoute(view);
  persistPlaybackState({ includeTime: false });
  render();
  if (view === 'home') {
    loadHomeAlbums().catch((error) => console.error(error));
  }
}

function shouldResetSearchForDetailNavigation() {
  if (!state.searchTerm) return false;
  if (state.route.view === 'artist') return true;
  return state.route.view === 'library' && state.libraryTab === 'tracks';
}

function openAlbum(albumId) {
  if (shouldResetSearchForDetailNavigation()) {
    resetSearchState({ refresh: false });
  }
  window.location.hash = getAlbumHash(albumId);
  scrollPageToTop();
}

async function openAlbumForTrackId(trackId) {
  const track = state.trackMap.get(trackId);
  if (!track) return;

  const album = findAlbumByTrack(track);
  if (album) {
    openAlbum(album.id);
    return;
  }

  if (!track.albumId) return;

  try {
    const library = await fetchJson(`/api/albums/${encodeURIComponent(track.albumId)}/tracks`);
    mergeLibraryData(library);
    const loadedAlbum = state.albumMap.get(track.albumId);
    if (loadedAlbum) {
      openAlbum(loadedAlbum.id);
    }
  } catch (error) {
    console.error('Unable to open album from track search result', error);
  }
}

function scrollPageToTop() {
  window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }));
}

function preservePageScroll(callback) {
  const left = window.scrollX;
  const top = window.scrollY;
  callback();
  window.requestAnimationFrame(() => window.scrollTo(left, top));
}

function openArtist(artistName) {
  if (shouldResetSearchForDetailNavigation()) {
    resetSearchState({ refresh: false });
  }
  loadArtistLibrary(artistName).catch((error) => console.error(error));
  window.location.hash = getArtistHash(artistName);
}

function openCollection(collectionName) {
  if (!collectionName) return;
  state.selectedCollectionFolderPath = collectionName;
  state.collectionAlbums = [];
  state.collectionAlbumsLoaded = false;
  state.collectionAlbumsFetchId += 1;
  loadCollectionAlbumsPage(0).catch((error) => console.error(error));
  window.location.hash = getCollectionHash(collectionName);
}

function openFullscreenPlayer() {
  if (!state.currentTrackId) return;
  state.fullscreenReturnHash = getFullscreenReturnHash(window.location.hash);
  persistPlaybackState({ includeTime: false });
  window.location.hash = 'fullscreen';
}

function handleNowPlayingClick() {
  if (!state.currentTrackId || state.settings.nowPlayingClickAction === 'none') return;
  const track = state.trackMap.get(state.currentTrackId);
  if (!track) return;

  const action = state.settings.nowPlayingClickAction;
  if (action === 'fullscreen') {
    openFullscreenPlayer();
    return;
  }
  if (action === 'artist') {
    openArtist(track.artist);
    return;
  }

  const album = findAlbumByTrack(track);
  if (album) openAlbum(album.id);
}

function closeFullscreenPlayer() {
  window.location.hash = state.fullscreenReturnHash || '';
}

function render() {
  if (state.route.view === 'admin' && !isCurrentUserAdmin()) {
    state.route = createBrowseRoute('home');
    state.browseView = 'home';
  }

  const viewContext = getRouteRenderContext();

  renderSidebar({
    albumTotal: state.libraryTotals.albums || viewContext.filteredAlbums.length,
    trackTotal: state.libraryTotals.tracks || viewContext.filteredTracks.length,
  });
  renderTopbar(viewContext);
  renderHomeIntro(viewContext);

  applyPrimaryViewVisibility(viewContext.activePrimaryView);
  if (!viewContext.isAdminView) {
    unmountReact(adminPanelRoot);
  }
  applySecondaryViewVisibility(viewContext);
  applyTopbarVisibility(viewContext);
  applyDocumentViewState();

  renderActiveRouteView(viewContext);

  renderQueuePanel();
  scheduleMeasuredPlayerReserve();
}

function renderFavoritesView(filteredTracks) {
  const favoriteAlbums = state.albums.filter((album) => isFavoriteAlbum(album.id) && albumMatchesSearch(album));
  const favoriteTracks = filteredTracks.filter((track) => isFavoriteTrack(track.id));

  renderFavoritesIntros();
  renderAlbumCollection(favoriteAlbumGrid, favoriteAlbums, 'No favorite albums yet.');
  renderTrackCollection(favoriteTrackList, favoriteTracks, favoriteTracks, 'No favorite tracks yet.');
}

function renderWishlistView() {
  renderWishlistIntro();

  if (!state.wishlistAlbumsLoaded) {
    renderAlbumCollection(wishlistAlbumGrid, [], 'Loading wishlist albums...');
    loadWishlistAlbumsPage(0).catch((error) => {
      console.error(error);
      renderAlbumCollection(wishlistAlbumGrid, [], 'Unable to load wishlist albums.');
    });
    return;
  }

  renderAlbumCollection(wishlistAlbumGrid, state.wishlistAlbums, 'No wishlist albums yet.', {
    pagerType: 'wishlist',
  });
}

function renderSettingsView() {
  preservePageScroll(() => {
    state.settingsTab = normalizeSettingsTab(state.settingsTab);
    publishSettingsSnapshot(state.settingsTab);
    renderSettingsIntro();
    renderSettingsTabs();
    renderSettingsPanelReact(state.settingsTab);
    state.settingsStatusMessage = '';
    renderSettingsStatus();
  });
}

function setSettingsTab(tab) {
  const nextTab = normalizeSettingsTab(tab);
  if (state.settingsTab === nextTab) return;
  state.settingsTab = nextTab;
  renderSettingsView();
}

function renderAdminView() {
  if (!hasReactRenderer('renderAdminPanel')) return;
  renderAdminIntro();
  renderReact('renderAdminPanel', adminPanelRoot, {});
}

function unmountSettingsReactPanel() {
  if (!settingsReactPanelContainer) return;
  unmountReact(settingsReactPanelContainer);
  settingsReactPanelTab = '';
}

function ensureSettingsReactPanel(tab) {
  if (settingsReactPanelContainer && settingsReactPanelTab === tab) {
    return settingsReactPanelContainer;
  }
  unmountSettingsReactPanel();
  settingsReactPanelContainer = settingsReactPanelHost;
  settingsReactPanelContainer.dataset.settingsReactPanel = tab;
  settingsReactPanelTab = tab;
  return settingsReactPanelContainer;
}

function getSettingsPanelStore() {
  if (settingsPanelStore) return settingsPanelStore;
  settingsPanelStore = createSettingsPanelStore();
  return settingsPanelStore;
}

function publishSettingsSnapshot(tab = state.settingsTab) {
  const settingsTab = normalizeSettingsTab(tab);
  getSettingsPanelStore().setSnapshots({
    tabs: buildSettingsTabsSnapshot({
      tabs: SETTINGS_TABS,
      activeTab: settingsTab,
    }),
    panel: buildSettingsPanelSnapshot({
      tab: settingsTab,
      settings: state.settings,
      title: state.title,
      displayTitle: getDisplayTitle(),
      origin: window.location.origin,
      tracksLength: state.tracks.length,
      albumsLength: state.albums.length,
      routeView: state.route.view,
      generatedAt: state.generatedAt,
      queueLength: state.queueIds.length,
      widgetSettings: state.widgetSettings,
      libraryFolders: state.libraryFolders,
      pendingLibraryFolders: state.pendingLibraryFolders,
      libraryTotals: state.libraryTotals,
    }),
  });
}

function renderSettingsPanelReact(tab) {
  if (!hasReactRenderer('renderSettingsPanel')) return false;
  publishSettingsSnapshot(tab);
  settingsReactPanelContainer = ensureSettingsReactPanel(tab);
  renderReact('renderSettingsPanel', settingsReactPanelContainer, { store: getSettingsPanelStore() });
  return true;
}

function renderSettingsTabs() {
  if (hasReactRenderer('renderSettingsTabs')) {
    publishSettingsSnapshot(state.settingsTab);
    renderReact('renderSettingsTabs', settingsTabs, {
      store: getSettingsPanelStore(),
      onSelect: setSettingsTab,
    });
  }
}

function renderSettingsIntro() {
  renderReact('renderSettingsIntro', settingsIntroRoot, {});
}

function renderSettingsStatus() {
  renderReact('renderSettingsStatus', settingsStatusRoot, {
    message: state.settingsStatusMessage,
  });
}

function renderAdminIntro() {
  renderReact('renderAdminIntro', adminIntroRoot, {});
}

function handleSettingsInput(event) {
  const input = event.target.closest('[data-setting]');
  if (!input) return;

  const key = input.dataset.setting;
  const value = readSettingInputValue(input);
  if (key === 'fontSize') {
    input.previousElementSibling?.querySelector('strong')?.replaceChildren(`${value}%`);
  } else if (key === 'albumCardSize') {
    input.closest('.album-card-size-field')?.querySelector('strong')?.replaceChildren(`${value}px`);
  }
  updateSetting(key, value, event.type === 'input');
  if (key === 'libraryPageSize') {
    changeLibraryPageSize(value, { alreadySaved: true });
  }
}

function handleSettingsAction(button) {
  if (button.dataset.settingValue) {
    updateSetting(button.dataset.settingValue, button.dataset.value);
    renderSettingsView();
    return;
  }

  const action = button.dataset.settingsAction;
  if (action === 'export-settings') {
    downloadJson('Monochrome-Streamer-settings.json', state.settings);
  } else if (action === 'import-settings') {
    importSettings();
  } else if (action === 'reset-local-data') {
    resetLocalData();
  } else if (action === 'clear-cache') {
    localStorage.removeItem(STORAGE_KEYS.settings);
    state.settings = { ...DEFAULT_SETTINGS };
    persistSettings(state.settings);
    applySettings();
    renderSettingsView();
    showSettingsStatus('Settings cache cleared and defaults restored.');
  } else if (action === 'rescan-library') {
    startLibraryScanAndPoll();
  } else if (action === 'refresh-library-folders') {
    refreshLibraryFolders();
  } else if (action === 'save-library-folders') {
    saveLibraryFolders(false);
  } else if (action === 'save-and-scan-library-folders') {
    saveLibraryFolders(true);
  } else if (action === 'check-instance') {
    fetchJson('/api/config')
      .then(() => showSettingsStatus('Local API is online.'))
      .catch(() => showSettingsStatus('Local API check failed.'));
  } else if (action === 'save-widget-api') {
    saveWidgetSettings(false);
  } else if (action === 'generate-widget-api-key') {
    saveWidgetSettings(true);
  } else if (action === 'copy-widget-api-url') {
    copyWidgetApiUrl();
  } else if (action === 'test-widget-api') {
    testWidgetApi();
  }
}

async function refreshWidgetSettings() {
  state.widgetSettings = await fetchJson('/api/widget/settings');
  return state.widgetSettings;
}

function readWidgetSettingsForm() {
  const form = settingsPanels.querySelector('[data-widget-api-settings]');
  return {
    enabled: Boolean(form?.querySelector('[data-widget-enabled]')?.checked),
    apiKey: form?.querySelector('[data-widget-api-key]')?.value?.trim() || '',
    widgetCorsOrigin: form?.querySelector('[data-widget-cors-origin]')?.value?.trim() || '*',
  };
}

async function saveWidgetSettings(generateKey) {
  try {
    const payload = readWidgetSettingsForm();
    if (generateKey) {
      payload.enabled = true;
      payload.action = 'generate-key';
    }
    state.widgetSettings = await fetchJson('/api/widget/settings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    renderSettingsView();
    showSettingsStatus(generateKey ? 'Widget API key generated.' : 'Widget API settings saved.');
  } catch (error) {
    console.error(error);
    showSettingsStatus('Unable to save widget API settings.');
  }
}

async function copyWidgetApiUrl() {
  const url = state.widgetSettings?.exampleUrl || createDefaultWidgetSettings(window.location.origin).exampleUrl;
  try {
    await navigator.clipboard.writeText(url);
    showSettingsStatus('Widget API URL copied.');
  } catch {
    showSettingsStatus(url);
  }
}

async function testWidgetApi() {
  const apiKey = settingsPanels.querySelector('[data-widget-api-key]')?.value?.trim()
    || state.widgetSettings?.apiKey
    || '';
  if (!apiKey) {
    showSettingsStatus('Generate or enter a widget API key first.');
    return;
  }
  try {
    const stats = await fetchJson(`/api/widget/stats?apiKey=${encodeURIComponent(apiKey)}`);
    showSettingsStatus(`Widget API online: ${stats.albumCount} albums, ${stats.trackCount} tracks.`);
  } catch (error) {
    console.error(error);
    showSettingsStatus('Widget API test failed. Check that it is enabled and the key is correct.');
  }
}

async function refreshLibraryFolders() {
  state.libraryFolders = await fetchJson('/api/library/folders');
  updateSidebarScanStatus();
  renderSettingsView();
  showSettingsStatus('Library folder list refreshed.');
}

async function saveLibraryFolders(shouldScan) {
  const folders = readCheckedLibraryFolders();

  state.libraryFolders = await fetchJson('/api/library/folders', {
    method: 'POST',
    body: JSON.stringify({ folders }),
  });
  state.pendingLibraryFolders = null;
  updateSidebarScanStatus();
  showSettingsStatus(`Saved ${folders.length} selected folder${folders.length === 1 ? '' : 's'}.`);
  renderSettingsView();

  if (!shouldScan) return;

  await startLibraryScanAndPoll();
}

function handleLibraryFolderSelectionChange(event) {
  if (!event.target.closest('[data-library-folder]')) return;
  state.pendingLibraryFolders = readCheckedLibraryFolders();
  updateLibraryFolderSummary();
}

function readCheckedLibraryFolders() {
  return [...settingsPanels.querySelectorAll('[data-library-folder]:checked')]
    .map((input) => input.dataset.libraryFolder)
    .filter(Boolean);
}

function updateLibraryFolderSummary() {
  const selectedLabel = state.pendingLibraryFolders?.length
    ? state.pendingLibraryFolders.join(', ')
    : 'No folders selected yet';
  settingsPanels.querySelectorAll('[data-library-folder-summary]').forEach((element) => {
    element.textContent = `Selected folders: ${selectedLabel}`;
  });
}

async function startLibraryScanAndPoll() {
  showSettingsStatus('Scanning selected folders...');
  await fetchJson('/api/rescan', { method: 'POST' });
  await pollLibraryScan();
}

async function pollLibraryScan() {
  if (state.scanPollId) {
    window.clearTimeout(state.scanPollId);
    state.scanPollId = null;
  }

  await refreshScanStatus();
  startScanStatusPolling(getScanPollDelay());
}

function startScanStatusPolling(delay = 5000) {
  if (state.scanPollId) {
    window.clearTimeout(state.scanPollId);
  }
  state.scanPollId = window.setTimeout(() => {
    pollLibraryScan().catch((error) => {
      console.error(error);
      startScanStatusPolling(5000);
    });
  }, delay);
}

function getScanPollDelay() {
  return state.libraryFolders?.scan?.status === 'scanning' ? 1000 : 5000;
}

async function refreshScanStatus() {
  if (state.scanPollInFlight) return;
  state.scanPollInFlight = true;

  try {
    const config = await fetchJson('/api/config');
    const previousGeneratedAt = state.generatedAt;
    const scan = config.scan || {};
    state.title = config.title || state.title;
    state.libraryFolders = {
      ...(state.libraryFolders || {}),
      scan,
    };
    updateSidebarScanStatus(config.generatedAt || state.generatedAt);

    const shouldRefreshLibrary = config.generatedAt
      && config.generatedAt !== previousGeneratedAt
      && scan.status !== 'scanning';

    if (shouldRefreshLibrary) {
      const library = await fetchLibraryPagePayload(0);
      hydrateLibrary({ title: state.title }, library);
      state.folderCache.clear();
      sanitizeStoredFavorites();
      render();
      updatePlayerUi();
    } else if (state.settingsTab === 'system') {
      renderSettingsView();
    }

    if (scan.status === 'scanning') {
      showSettingsStatus(`Scanning selected folders... ${scan.percent || 0}%`);
    } else if (scan.status === 'error') {
      showSettingsStatus(`Scan failed: ${scan.error || 'Unknown error'}`);
    } else if (shouldRefreshLibrary) {
      showSettingsStatus(`Scan complete: ${state.tracks.length} tracks, ${state.albums.length} albums.`);
    }
  } finally {
    state.scanPollInFlight = false;
  }
}

function updateSetting(key, value, avoidFullRender = false) {
  state.settings = {
    ...state.settings,
    [key]: value,
    ...(key === 'themeBase' ? { customThemeBase: value } : {}),
    ...(key === 'nowPlayingClickAction' ? { nowPlayingClickActionUserSet: true } : {}),
  };
  persistSettings(state.settings);
  applySettings();
  if (['showQualityInfo', 'playerLayout'].includes(key)) {
    updatePlayerUi();
  }
  if (!avoidFullRender) {
    render();
  }
}

function applySettings() {
  if (!state.settings.showFolderBrowser && state.libraryTab === 'folders') {
    state.libraryTab = 'albums';
  }
  applyThemeSettings();
  document.documentElement.style.setProperty('--font-body', FONT_PRESETS[state.settings.fontPreset] || FONT_PRESETS.jakarta);
  document.documentElement.style.setProperty('--app-font-size', `${15 * (state.settings.fontSize / 100)}px`);
  document.documentElement.style.setProperty('--album-card-size', `${clampAlbumCardSize(state.settings.albumCardSize)}px`);
  document.body.classList.toggle('no-album-cover-background', !state.settings.albumCoverBackground);
  document.body.classList.toggle('compact-artists', state.settings.compactArtists);
  const isQobuzLayout = state.settings.playerLayout === 'qobuz';
  document.body.classList.toggle('player-layout-qobuz', isQobuzLayout);
  document.body.classList.toggle('player-layout-floating', !isQobuzLayout);

  const displayTitle = getDisplayTitle();
  document.title = `${displayTitle} | Local Streamer`;

  document.body.classList.toggle('sidebar-collapsed', Boolean(state.settings.sidebarCollapsed));

  audioPlayer.playbackRate = 1;
  audioPlayer.volume = getEffectiveAudioVolume();
  renderPlayerUtilityControls();
  applyAppIcon();
  renderSidebar();
  const currentTrack = state.trackMap.get(state.currentTrackId);
  if (currentTrack) {
    syncPlayerUtilityElementRefs();
  }
}

function setAmbientCover(url = '', { title = '', artist = '' } = {}) {
  state.ambientCoverUrl = String(url || '').trim();
  state.ambientCoverTitle = String(title || '').trim();
  state.ambientCoverArtist = String(artist || '').trim();
  applyAmbientBackdrop();
}

function setAmbientCoverFromAlbums(albums = [], { force = false } = {}) {
  if (!force && state.ambientCoverUrl) return;
  const candidates = (Array.isArray(albums) ? albums : []).filter((album) => album?.coverUrl);
  if (!candidates.length) {
    if (!state.ambientCoverUrl) {
      applyAmbientBackdrop();
    }
    return;
  }
  const ambientAlbum = candidates[Math.floor(Math.random() * candidates.length)];
  setAmbientCover(ambientAlbum.coverUrl, {
    title: ambientAlbum.title,
    artist: ambientAlbum.albumArtist || ambientAlbum.artist,
  });
}

function applyAmbientBackdrop() {
  const coverUrl = String(state.ambientCoverUrl || '').trim();
  const root = document.documentElement;
  if (coverUrl) {
    root.style.setProperty('--ambient-cover-image', `url("${coverUrl}")`);
  } else {
    root.style.setProperty('--ambient-cover-image', 'none');
  }
  document.body.classList.toggle('has-ambient-cover', Boolean(coverUrl));
}

function applyThemeSettings() {
  const theme = resolveThemePreset(state.settings.theme, state.settings);
  const accent = theme.accent;
  const root = document.documentElement;
  const isLight = isLightTheme(state.settings);
  const softInk = isLight ? 'rgba(23, 19, 15, 0.06)' : 'rgba(255, 255, 255, 0.06)';
  const strongInk = isLight ? 'rgba(23, 19, 15, 0.11)' : 'rgba(255, 255, 255, 0.11)';

  root.style.setProperty('--background', theme.background);
  root.style.setProperty('--surface', theme.surface);
  root.style.setProperty('--surface-2', theme.surface2);
  root.style.setProperty('--background-soft', softInk);
  root.style.setProperty('--background-strong', strongInk);
  root.style.setProperty('--glass', softInk);
  root.style.setProperty('--glass-strong', strongInk);
  root.style.setProperty('--glass-heavy', isLight ? 'rgba(255, 255, 255, 0.58)' : 'rgba(10, 10, 10, 0.76)');
  root.style.setProperty('--input-surface', isLight ? 'rgba(255, 255, 255, 0.58)' : 'rgba(255, 255, 255, 0.055)');
  root.style.setProperty('--hover-surface', isLight ? 'rgba(23, 19, 15, 0.1)' : 'rgba(255, 255, 255, 0.12)');
  root.style.setProperty('--placeholder-surface', isLight ? 'rgba(255, 255, 255, 0.62)' : '#101010');
  root.style.setProperty('--active-control-text', isLight ? '#ffffff' : '#111111');
  root.style.setProperty('--line', isLight ? 'rgba(23, 19, 15, 0.12)' : 'rgba(255, 255, 255, 0.09)');
  root.style.setProperty('--line-strong', isLight ? 'rgba(23, 19, 15, 0.22)' : 'rgba(255, 255, 255, 0.18)');
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--muted', theme.muted);
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-contrast', getReadableTextColor(accent));
  root.style.setProperty('--wishlist-line', isLight
    ? 'color-mix(in srgb, var(--accent) 44%, transparent)'
    : 'color-mix(in srgb, var(--accent) 66%, rgba(255, 255, 255, 0.22))');
  root.style.setProperty('--wishlist-surface', isLight
    ? 'color-mix(in srgb, var(--accent) 13%, transparent)'
    : 'color-mix(in srgb, var(--accent) 20%, transparent)');
  root.style.setProperty('--wishlist-text', isLight
    ? 'color-mix(in srgb, var(--accent) 72%, #181818)'
    : 'color-mix(in srgb, var(--accent) 72%, #ffffff)');
  root.style.setProperty('--body-top', theme.bodyTop);
  root.style.setProperty('--body-mid', theme.bodyMid);
  root.style.setProperty('--body-bottom', theme.bodyBottom);
  document.body.classList.toggle('light-ui', isLight);
}

function getDisplayTitle() {
  return state.settings?.libraryTitle?.trim() || DEFAULT_SETTINGS.libraryTitle;
}

function applyAppIcon() {
  if (!appFavicon) return;
  const iconUrl = String(state.settings.appIconUrl || '').trim();
  if (iconUrl) {
    appFavicon.href = iconUrl;
    return;
  }
  appFavicon.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23111111'/%3E%3Ccircle cx='32' cy='32' r='19' fill='%23eb9200'/%3E%3Ccircle cx='32' cy='32' r='6' fill='%23111111'/%3E%3C/svg%3E";
}

function getReadableTextColor(hexColor) {
  const normalized = String(hexColor || '').replace('#', '');
  if (!/^[0-9a-f]{6}$/iu.test(normalized)) return '#111111';

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.58 ? '#111111' : '#ffffff';
}

function readSettingInputValue(input) {
  if (input.type === 'checkbox') return input.checked;
  if (input.type === 'range' || input.type === 'number') return Number(input.value);
  return input.value;
}

function showSettingsStatus(message) {
  state.settingsStatusMessage = message;
  renderSettingsStatus();
}

function changeLibraryPageSize(value, { alreadySaved = false } = {}) {
  const size = normalizeLibraryPageSize(value);
  if (!alreadySaved) {
    updateSetting('libraryPageSize', size, true);
  }
  state.libraryPage = { ...state.libraryPage, limit: size, offset: 0 };
  state.wishlistPage = { ...state.wishlistPage, limit: size, offset: 0 };
  state.artistPage = { ...state.artistPage, limit: size, offset: 0 };
  state.trackPage = { ...state.trackPage, limit: size, offset: 0 };
  state.collectionFoldersPage = { ...state.collectionFoldersPage, limit: size, offset: 0 };
  state.collectionPage = { ...state.collectionPage, limit: size, offset: 0 };
  queueVisiblePageFetch(0);
  render();
}

function normalizeLibraryPageSize(value) {
  const size = Number.parseInt(value, 10);
  return [25, 50, 100, 200, 500].includes(size) ? size : DEFAULT_SETTINGS.libraryPageSize;
}

function getSidebarScanInfo(indexedAt = state.generatedAt) {
  const scan = state.libraryFolders?.scan || {};
  const rawStatus = scan.status || 'idle';
  const status = rawStatus === 'idle' && indexedAt ? 'ready' : rawStatus;
  const percent = Number.isFinite(scan.percent) && rawStatus !== 'idle'
    ? scan.percent
    : (status === 'ready' ? 100 : 0);
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  const circumference = 2 * Math.PI * 42;
  const progressOffset = circumference * (1 - safePercent / 100);
  const indexedText = indexedAt ? `Indexed ${formatTimestamp(indexedAt)}` : 'Not indexed yet';
  return {
    statusLabel: toTitleCase(status),
    percent: safePercent,
    circumference,
    progressOffset,
    indexedText,
  };
}

function renderSidebar({
  albumTotal = state.libraryTotals.albums || state.albums.length,
  trackTotal = state.libraryTotals.tracks || state.tracks.length,
  indexedAt = state.generatedAt,
} = {}) {
  renderReact('renderSidebar', appSidebar, {
    title: getDisplayTitle(),
    showTitle: state.settings.showLibraryTitle,
    activeView: state.route.view,
    settings: { ...state.settings },
    albumCount: albumTotal,
    trackCount: trackTotal,
    scan: getSidebarScanInfo(indexedAt),
    currentUser: state.currentUser,
    mobile: isMobileSidebarLayout(),
    onNavigate: navigateFromSidebar,
    onThemeToggle: toggleSidebarTheme,
    onToggle: () => {
      if (isMobileSidebarLayout()) {
        setMobileSidebarOpen(false);
        return;
      }
      updateSetting('sidebarCollapsed', !state.settings.sidebarCollapsed, true);
    },
  });
}

function renderTopbar(viewContext = getRouteRenderContext()) {
  renderReact('renderTopbar', topbarRoot, {
    searchValue: state.searchInputValue,
    showBackButton: Boolean(
      viewContext.isAlbumView
      || viewContext.isArtistView
      || viewContext.isCollectionView
    ),
    showClearButton: Boolean(state.searchInputValue),
    mobileSidebarOpen: document.body.classList.contains('mobile-sidebar-open'),
    focusNonce: state.searchFocusNonce,
    onSearchChange: (value) => {
      updateSearchValue(value, { refresh: true });
    },
    onClearSearch: () => resetSearchState({ focus: true, refresh: true }),
    onBack: () => navigateToView(state.browseView),
    onOpenSidebar: () => setMobileSidebarOpen(true),
  });
}

function renderHomeIntro(viewContext = getRouteRenderContext()) {
  renderReact('renderHomeIntro', homeIntroRoot, {
    showBanner: Boolean(viewContext.isHomeView && state.settings.showHomeBanner),
    eyebrow: state.settings.homeBannerEyebrow || DEFAULT_SETTINGS.homeBannerEyebrow,
    title: state.settings.homeBannerTitle || DEFAULT_SETTINGS.homeBannerTitle,
    subtitle: state.settings.homeBannerSubtitle || DEFAULT_SETTINGS.homeBannerSubtitle,
    albumHeading: 'Recommended Albums',
    albumCaption: state.searchTerm
      ? `Albums matching "${state.searchTerm}"`
      : state.route.view === 'library'
        ? 'Everything currently indexed on your server.'
        : '',
  });
}

function renderLoginView() {
  const { nextPath, errorCode } = getLoginRouteState();
  renderReact('renderLoginView', loginViewRoot, {
    title: getDisplayTitle(),
    currentUser: state.currentUser,
    nextPath,
    errorCode,
    ambientCoverUrl: state.ambientCoverUrl,
    ambientTitle: state.ambientCoverTitle,
    ambientArtist: state.ambientCoverArtist,
    ambientCovers: state.ambientCovers,
  });
}

function resolveRouteFromLocation({ browseView, hasAlbum }) {
  const pathname = String(window.location.pathname || '').replace(/\/+$/, '') || '/';
  if (pathname === '/login') {
    return {
      route: {
        view: 'login',
        albumId: null,
        artistName: null,
        collectionName: null,
      },
      artistNameToLoad: '',
      collectionNameToLoad: '',
    };
  }
  return parseRouteFromHash(window.location.hash, {
    browseView,
    hasAlbum,
  });
}

function renderLibraryIntro() {
  const captionsByTab = {
    folders: 'Browse the exact folder structure from your local server.',
    albums: 'Browse your scanned releases as album cards.',
    collections: 'Browse album collections from your local album tags.',
    artists: 'Browse the library grouped by album artist.',
    tracks: 'Search tracks directly without loading the whole library.',
    playlists: 'Smart playlists built from your local library state.',
  };
  renderReact('renderLibraryIntro', libraryIntroRoot, {
    title: 'Browse Library',
    caption: captionsByTab[state.libraryTab] || captionsByTab.albums,
  });
}

function renderLibraryTabs() {
  renderReact('renderLibraryTabs', libraryTabsRoot, {
    tabs: LIBRARY_TAB_REGISTRY.map(([id, label]) => ({
      id,
      label,
      hidden: id === 'folders' && !state.settings.showFolderBrowser,
    })),
    activeTab: state.libraryTab,
    onSelect: setLibraryTab,
  });
}

function renderFavoritesIntros() {
  renderReact('renderFavoritesIntro', favoriteAlbumsIntroRoot, {
    title: 'Favorite Albums',
    caption: state.searchTerm
      ? `Favorite albums matching "${state.searchTerm}"`
      : 'Albums you marked for quick access.',
  });
  renderReact('renderFavoritesIntro', favoriteTracksIntroRoot, {
    title: 'Favorite Tracks',
    caption: state.searchTerm
      ? `Favorite tracks matching "${state.searchTerm}"`
      : 'Tracks you marked for quick access.',
  });
}

function renderWishlistIntro() {
  renderReact('renderWishlistIntro', wishlistIntroRoot, {
    title: 'Wishlist Albums',
    caption: state.searchTerm
      ? `Wishlist albums matching "${state.searchTerm}"`
      : 'Albums marked as Wishlist in your local album tags.',
    onAddAlbum: () => openAddAlbumEditor(),
  });
}

function isCurrentUserAdmin() {
  return state.currentUser?.role === 'admin';
}

function normalizeSettingsTab(tab = state.settingsTab) {
  const visibleTabIds = new Set(SETTINGS_TABS.map(([id]) => id));
  return visibleTabIds.has(tab) ? tab : 'appearance';
}

function toggleSidebarTheme() {
  updateSetting('themeBase', isLightTheme(state.settings) ? 'dark' : 'light');
}

function updateSidebarScanStatus(indexedAt = state.generatedAt) {
  renderSidebar({ indexedAt });
}

function getRouteRenderContext() {
  const filteredTracks = getFilteredTracks();
  const filteredAlbums = getFilteredAlbums(filteredTracks);
  const homeAlbums = getHomeAlbums(filteredAlbums);
  const currentAlbum = getCurrentAlbum();
  const currentArtist = getCurrentArtist();
  const currentCollectionName = state.route.collectionName || '';
  const isLoginView = state.route.view === 'login';
  const isAlbumView = state.route.view === 'album' && !!currentAlbum;
  const isArtistView = state.route.view === 'artist';
  const isCollectionView = state.route.view === 'collection';
  const isFavoritesView = state.route.view === 'favorites';
  const isWishlistView = state.route.view === 'wishlist';
  const isSettingsView = state.route.view === 'settings';
  const isAdminView = state.route.view === 'admin';
  const isFullscreenView = state.route.view === 'fullscreen';
  const isLibraryView = state.route.view === 'library' && !isLoginView && !isAlbumView && !isArtistView && !isCollectionView;
  const isHomeView = state.route.view === 'home' && !isLoginView && !isAlbumView && !isArtistView && !isCollectionView;
  const activePrimaryView = isLoginView
    ? 'login'
    : isHomeView
    ? 'home'
    : isLibraryView
      ? 'library'
      : isFavoritesView
        ? 'favorites'
        : isWishlistView
          ? 'wishlist'
          : isSettingsView
            ? 'settings'
            : isAdminView
              ? 'admin'
              : '';
  const activeRouteView = isLoginView
    ? 'login'
    : isAlbumView
    ? 'album'
    : isArtistView
      ? 'artist'
      : isCollectionView
        ? 'collection'
        : isLibraryView
          ? 'library'
          : isFavoritesView
            ? 'favorites'
            : isWishlistView
              ? 'wishlist'
              : isSettingsView
                ? 'settings'
                : isAdminView
                  ? 'admin'
                  : isFullscreenView
                    ? 'fullscreen'
                    : 'home';

  return {
    filteredTracks,
    filteredAlbums,
    homeAlbums,
    currentAlbum,
    currentArtist,
    currentCollectionName,
    isLoginView,
    isAlbumView,
    isArtistView,
    isCollectionView,
    isFavoritesView,
    isWishlistView,
    isSettingsView,
    isAdminView,
    isFullscreenView,
    isLibraryView,
    isHomeView,
    activePrimaryView,
    activeRouteView,
  };
}

function applyPrimaryViewVisibility(activePrimaryView) {
  for (const [viewId, element] of Object.entries(PRIMARY_VIEW_REGISTRY)) {
    element.hidden = viewId !== activePrimaryView;
  }
}

function applySecondaryViewVisibility(viewContext) {
  for (const { element, isVisible } of SECONDARY_VIEW_VISIBILITY_REGISTRY) {
    element.hidden = !isVisible(viewContext);
  }
}

function applyTopbarVisibility(viewContext) {
  const hideShellChrome = Boolean(viewContext.isLoginView || viewContext.isFullscreenView);
  topbarRoot.hidden = hideShellChrome;
  appSidebar.hidden = hideShellChrome;
  nowPlayingBar.hidden = hideShellChrome;
  if (hideShellChrome) {
    sidebarOverlay.hidden = true;
    document.body.classList.remove('mobile-sidebar-open');
  }
}

function applyDocumentViewState() {
  document.body.dataset.view = state.route.view;
}

function renderActiveRouteView(viewContext) {
  const renderRouteView = ROUTE_VIEW_RENDERERS[viewContext.activeRouteView] || ROUTE_VIEW_RENDERERS.home;
  renderRouteView(viewContext);
}

function getLoginRouteState() {
  const url = new URL(window.location.href);
  return {
    nextPath: sanitizeLoginNext(url.searchParams.get('next')),
    errorCode: String(url.searchParams.get('error') || '').trim().toLowerCase(),
  };
}

function sanitizeLoginNext(value) {
  const nextPath = String(value || '/').trim();
  if (!nextPath.startsWith('/') || nextPath.startsWith('//')) return '/';
  if (nextPath.startsWith('/login')) return '/';
  if (nextPath === '/admin' || nextPath.startsWith('/admin/')) return '/';
  return nextPath;
}

function getLoginRoutePath(nextPath = '/', errorCode = '') {
  const params = new URLSearchParams();
  params.set('next', sanitizeLoginNext(nextPath));
  if (errorCode) {
    params.set('error', errorCode);
  }
  return `/login?${params.toString()}`;
}

function clearLoginRouteSearchParams() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('next') && !url.searchParams.has('error')) return;
  url.searchParams.delete('next');
  url.searchParams.delete('error');
  const nextSearch = url.searchParams.toString();
  const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`;
  window.history.replaceState(null, '', nextUrl);
}

function setLibraryTab(tab) {
  if (tab === 'folders' && !state.settings.showFolderBrowser) {
    tab = 'albums';
  }
  const tabChanged = state.libraryTab !== tab;
  if (tabChanged && state.searchTerm) {
    resetSearchState({ refresh: false });
  }
  state.libraryTab = tab;
  if (tab === 'folders') {
    loadFolderListing('').catch((error) => console.error(error));
  }
  if (tab === 'artists') {
    loadArtistPage(0).catch((error) => console.error(error));
  }
  if (tab === 'collections') {
    state.selectedCollectionFolderPath = '';
    loadCollectionFolders().catch((error) => console.error(error));
  }
  if (tab === 'tracks' && state.searchTerm) {
    loadTrackPage(0).catch((error) => console.error(error));
  }
  render();
  scrollPageToTop();
}

function renderLibraryView(filteredTracks, filteredAlbums) {
  renderLibraryIntro();
  renderLibraryTabs();
  if (state.libraryTab === 'folders' && !state.settings.showFolderBrowser) {
    state.libraryTab = 'albums';
  }

  for (const [tabId, , panel] of LIBRARY_TAB_REGISTRY) {
    const visible = tabId !== 'folders' || state.settings.showFolderBrowser;
    panel.hidden = !visible;
    if (!visible) continue;
    panel.hidden = state.libraryTab !== tabId;
  }

  if (state.libraryTab === 'folders') {
    renderFolderBrowser();
  } else if (state.libraryTab === 'albums') {
    renderLibraryAlbumsPanel(filteredAlbums);
  } else if (state.libraryTab === 'collections') {
    renderLibraryCollectionsPanel();
  } else if (state.libraryTab === 'artists') {
    renderArtistsBrowser();
  } else if (state.libraryTab === 'tracks') {
    renderLibraryTracksPanel();
  } else {
    renderPlaylistsBrowser(filteredTracks);
  }
}

function renderLibraryAlbumsPanel(albums) {
  const visibleAlbums = filterAlbumsByMediaType(albums);
  const pager = {
    ...state.libraryPage,
    total: state.libraryPage.total ?? state.libraryTotals.albums ?? visibleAlbums.length,
  };
  renderReact('renderAlbumCollection', libraryPanelAlbums, {
    ...buildAlbumCollectionSnapshot({
      albums: visibleAlbums.slice(0, RENDER_LIMITS.albums),
      prepareAlbum: prepareAlbumCardForReact,
      emptyMessage: 'No albums matched this filter.',
      compact: true,
      wrapGrid: true,
      filterProps: getLibraryFilterBarProps(),
      pagerProps: buildLibraryPagerSnapshot({
        page: pager,
        total: pager.total,
        itemLabel: 'album',
        showPageSize: true,
      }),
    }),
    onLetter: (letter) => {
      state.alphabetFilter = letter || 'all';
      queueVisiblePageFetch(0);
    },
    onMediaType: toggleMediaTypeFilter,
    onOpen: openAlbum,
    onPlay: (albumId) => {
      const album = state.albumMap.get(albumId);
      if (album) playAlbumFromCard(album);
    },
    onPage: (direction) => handleAlbumCollectionPage('library', direction),
    onPageSize: changeLibraryPageSize,
  });
}

function renderLibraryCollectionsPanel() {
  if (!state.collectionFoldersLoaded && !state.collectionFoldersLoading) {
    loadCollectionFolders().catch((error) => console.error(error));
  }
  const page = state.collectionFoldersPage || {};
  renderReact('renderCollectionBrowser', libraryPanelCollections, {
    folders: state.collectionFolders,
    selectedFolder: null,
    loading: state.collectionFoldersLoading,
    errorMessage: state.collectionFoldersError,
    filterProps: getLibraryFilterBarProps({ mediaType: false }),
    pagerProps: buildLibraryPagerSnapshot({
      page,
      total: page.total ?? state.collectionFolders.length,
      itemLabel: 'collection',
      showPageSize: true,
    }),
    onOpenFolder: openCollection,
    onPage: (direction) => handleCollectionFolderPage(direction),
    onPageSize: changeLibraryPageSize,
  });
}

function renderFolderBrowser() {
  const listing = state.folderCache.get('') || null;

  renderReact('renderFolderBrowser', libraryPanelFolders, {
    rootListing: listing,
    folderCacheEntries: [...state.folderCache.entries()],
    expandedPaths: [...state.expandedFolderPaths],
    loadingPaths: [...state.folderLoading],
    currentTrackId: state.currentTrackId,
    playing: !audioPlayer.paused,
    isFavoriteTrack,
    onToggleFolder: handleFolderToggle,
    onPlayFolder: playFolderFromBrowser,
    onPlayTrack: playFolderTrackFromBrowser,
    onToggleFavorite: toggleFavoriteTrack,
  });
  if (!listing) {
    loadFolderListing('').catch((error) => console.error(error));
    return;
  }

  for (const folderPath of state.expandedFolderPaths) {
    if (state.folderCache.has(folderPath) || state.folderLoading.has(folderPath)) continue;
    loadFolderListing(folderPath).catch((error) => console.error(error));
  }
}

function handleFolderToggle(folderPath, expanded) {
  const normalizedPath = normalizeFolderPath(folderPath);
  if (expanded) {
    state.expandedFolderPaths.add(normalizedPath);
    if (!state.folderCache.has(normalizedPath)) {
      loadFolderListing(normalizedPath).catch((error) => console.error(error));
    }
  } else {
    state.expandedFolderPaths.delete(normalizedPath);
  }
  render();
}

async function playFolderFromBrowser(folderPath) {
  try {
    const folderTracks = await loadFolderPlayQueue(folderPath);
    if (!Array.isArray(folderTracks) || folderTracks.length === 0) return;
    state.shuffleActive = false;
    rebuildShuffledQueue();
    playTrack(folderTracks[0], folderTracks);
  } catch (error) {
    console.error(error);
  }
}

function playFolderTrackFromBrowser(track, queueTracks, { toggleIfCurrent = false } = {}) {
  if (!track?.id) return;
  if (toggleIfCurrent && track.id === state.currentTrackId) {
    togglePlayback();
    return;
  }
  const safeQueue = Array.isArray(queueTracks) && queueTracks.length > 0 ? queueTracks : [track];
  playTrack(track, safeQueue);
}

function renderArtistsBrowser() {
  const artists = state.artistGroups;
  for (const artist of artists.slice(0, 24)) {
    loadArtistInfo(artist.name);
  }

  renderReact('renderLibraryArtistsPanel', libraryPanelArtists, {
    ...buildLibraryArtistsPanelSnapshot({
      artists: artists.slice(0, RENDER_LIMITS.artists),
      prepareArtist: prepareArtistCardForReact,
      filterProps: getLibraryFilterBarProps({ mediaType: false }),
      pagerProps: getArtistPagerProps(),
      emptyMessage: 'No artists matched this filter.',
    }),
    onOpenArtist: openArtist,
  });
}

function renderLibraryTracksPanel() {
  const tracks = state.libraryTrackResults || [];
  renderReact('renderLibraryTracksPanel', libraryPanelTracks, {
    ...buildLibraryTracksPanelSnapshot({
      tracks: tracks.slice(0, RENDER_LIMITS.tracks),
      searchTerm: state.searchTerm,
      filterProps: getLibraryFilterBarProps({ mediaType: false }),
      pagerProps: getTrackPagerProps(),
      prepareTrack: prepareTrackRowForReact,
    }),
    onPlayTrack: (trackId, options = {}) => {
      const track = state.trackMap.get(trackId);
      if (!track) return;
      if (options.toggle && track.id === state.currentTrackId) {
        togglePlayback();
        return;
      }
      playTrack(track, getQueueTracksForRenderedRow(track, tracks, 'standard'));
    },
    onFavoriteTrack: toggleFavoriteTrack,
    onAddTrackToQueue: (trackId) => {
      const track = state.trackMap.get(trackId);
      if (track) addTracksToQueue([track]);
    },
    onArtistClick: (artistName) => {
      if (artistName) openArtist(artistName);
    },
    onAlbumClick: openAlbumForTrackId,
  });
}

function renderPlaylistsBrowser(filteredTracks) {
  const playlists = getSmartPlaylists(filteredTracks);
  if (!playlists.some((playlist) => playlist.id === state.selectedPlaylistId)) {
    state.selectedPlaylistId = playlists[0]?.id ?? 'favorites-tracks';
  }

  renderReact('renderPlaylistBrowser', libraryPanelPlaylists, {
    playlists: playlists.map(preparePlaylistForReact),
    selectedPlaylistId: state.selectedPlaylistId,
    limit: RENDER_LIMITS.tracks,
    onSelectPlaylist: (playlistId) => {
      state.selectedPlaylistId = playlistId;
      render();
    },
    onPlayTrack: (trackId, options = {}) => {
      const activePlaylist = playlists.find((playlist) => playlist.id === state.selectedPlaylistId) ?? playlists[0];
      const track = state.trackMap.get(trackId);
      if (!track) return;
      if (options.toggle && track.id === state.currentTrackId) {
        togglePlayback();
        return;
      }
      playTrack(track, activePlaylist?.tracks || [track]);
    },
    onFavoriteTrack: toggleFavoriteTrack,
    onAddTrackToQueue: (trackId) => {
      const track = state.trackMap.get(trackId);
      if (track) addTracksToQueue([track]);
    },
    onArtistClick: (artistName) => {
      if (artistName) openArtist(artistName);
    },
    onAlbumClick: (trackId) => {
      const track = state.trackMap.get(trackId);
      const album = track ? findAlbumByTrack(track) : null;
      if (album) openAlbum(album.id);
    },
  });
}

function preparePlaylistForReact(playlist) {
  return {
    ...playlist,
    tracks: playlist.tracks.map(prepareTrackRowForReact),
  };
}

function prepareArtistCardForReact(artist) {
  const info = state.artistInfoMap.get(artist.name) || null;
  return {
    name: artist.name,
    imageUrl: info?.imageUrl || '',
  };
}

function renderArtistDetail(artist) {
  if (!artist) {
    const artistName = state.route.artistName || 'Artist';
    renderReact('renderArtistDetail', artistView, {
      name: artistName,
      meta: 'Loading artist library...',
      bio: 'Loading albums and tracks from the database.',
      albums: [],
      albumsTitle: `${artistName} Albums`,
      loading: true,
    });
    loadArtistLibrary(artistName)
      .then(() => render())
      .catch((error) => console.error(error));
    return;
  }

  const info = state.artistInfoMap.get(artist.name) || null;
  renderReact('renderArtistDetail', artistView, {
    name: artist.name,
    meta: `${artist.albums.length} album${artist.albums.length === 1 ? '' : 's'} • ${artist.tracks.length} track${artist.tracks.length === 1 ? '' : 's'}`,
    bio: info?.bio || 'Artist information is loading. You can also add this artist manually in artist-info.json.',
    imageUrl: info?.imageUrl || '',
    sourceUrl: info?.sourceUrl || '',
    sourceLabel: info?.source === 'wikipedia' ? 'Wikipedia' : 'Local source',
    editLabel: info?.imageUrl || info?.bio ? 'Edit artist image/info' : 'Add artist image/info',
    albums: artist.albums.map(prepareAlbumCardForReact),
    albumsTitle: `${artist.name} Albums`,
    albumsCaption: 'Albums from this artist in your local library.',
    onEdit: () => openArtistEditor(artist),
    onOpenAlbum: openAlbum,
    onPlayAlbum: (albumId) => {
      const selectedAlbum = state.albumMap.get(albumId);
      if (selectedAlbum) playAlbumFromCard(selectedAlbum);
    },
  });

  loadArtistInfo(artist.name);
}

function renderCollectionDetail(collectionName) {
  if (!collectionName) return;
  if (state.selectedCollectionFolderPath !== collectionName) {
    state.selectedCollectionFolderPath = collectionName;
    state.collectionAlbumsLoaded = false;
  }
  if (!state.collectionAlbumsLoaded && !state.collectionAlbumsLoading) {
    loadCollectionAlbumsPage(0).catch((error) => console.error(error));
  }

  const pageTotal = state.collectionPage?.total ?? state.collectionAlbums.length;
  renderReact('renderCollectionDetail', artistView, {
    name: collectionName,
    meta: state.collectionAlbumsLoaded
      ? `${pageTotal} album${pageTotal === 1 ? '' : 's'}`
      : 'Loading collection albums...',
    bio: 'Albums grouped by the Collection name in your local album tags.',
    coverUrl: getCollectionCoverUrl(collectionName),
    albums: state.collectionAlbums.map(prepareAlbumCardForReact),
    albumsTitle: `${collectionName} Albums`,
    albumsCaption: 'Albums assigned to this collection.',
    loading: state.collectionAlbumsLoading && !state.collectionAlbumsLoaded,
    showEdit: false,
    onOpenAlbum: openAlbum,
    onPlayAlbum: (albumId) => {
      const selectedAlbum = state.albumMap.get(albumId);
      if (selectedAlbum) playAlbumFromCard(selectedAlbum);
    },
  });
}

function getCollectionCoverUrl(collectionName) {
  const firstAlbumCover = state.collectionAlbums[0]?.coverUrl;
  if (firstAlbumCover) return firstAlbumCover;
  const folder = state.collectionFolders.find((item) => item.path === collectionName || item.name === collectionName);
  return folder?.coverUrl || '';
}

function openArtistEditor(artist) {
  const info = state.artistInfoMap.get(artist.name) || null;
  state.artistEditorName = artist.name;
  renderArtistEditorModal({
    renderKey: `${artist.name}-${Date.now()}`,
    ...buildArtistEditorModalSnapshot(artist.name),
    ...buildArtistEditorBodySnapshot(info),
    onClose: closeArtistEditor,
    onSave: saveArtistEditor,
    onReset: resetArtistEditor,
  });
  artistEditorModal.hidden = false;
  artistEditorOverlay.hidden = false;
}

function closeArtistEditor() {
  state.artistEditorName = '';
  artistEditorModal.hidden = true;
  artistEditorOverlay.hidden = true;
  unmountReact(artistEditorModal);
}

function renderArtistEditorModal(props = {}) {
  renderReact('renderArtistEditorModal', artistEditorModal, props);
}

async function saveArtistEditor(formData = {}) {
  if (!state.artistEditorName) return;
  const info = await fetchJson(`/api/artists/${encodeURIComponent(state.artistEditorName)}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildArtistInfoPayload(formData)),
  });
  state.artistInfoMap.set(state.artistEditorName, info);
  closeArtistEditor();
  render();
}

async function resetArtistEditor() {
  if (!state.artistEditorName || !window.confirm('Clear edited artist image and info?')) return;
  const info = await fetchJson(`/api/artists/${encodeURIComponent(state.artistEditorName)}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reset: true }),
  });
  state.artistInfoMap.set(state.artistEditorName, info);
  closeArtistEditor();
  render();
}

function renderAlbumCollection(container, albums, emptyMessage, { pageable = false, pagerType = '' } = {}) {
  const visibleAlbums = filterAlbumsByMediaType(albums);
  const page = pagerType === 'wishlist' ? state.wishlistPage : state.libraryPage;
  const itemLabel = pagerType === 'wishlist' ? 'wishlist album' : 'album';
  const showPager = pageable || Boolean(pagerType);
  const pager = {
    ...page,
    total: page?.total ?? visibleAlbums.length,
  };

  renderReact('renderAlbumCollection', container, {
    ...buildAlbumCollectionSnapshot({
      albums: visibleAlbums,
      prepareAlbum: prepareAlbumCardForReact,
      emptyMessage,
      compact: false,
      filterProps: pageable ? getLibraryFilterBarProps() : null,
      pagerProps: showPager ? buildLibraryPagerSnapshot({
        page: pager,
        total: pager.total,
        itemLabel,
        showPageSize: pageable || pagerType === 'wishlist',
      }) : null,
    }),
    onLetter: (letter) => {
      state.alphabetFilter = letter || 'all';
      queueVisiblePageFetch(0);
    },
    onMediaType: toggleMediaTypeFilter,
    onOpen: openAlbum,
    onPlay: (albumId) => {
      const album = state.albumMap.get(albumId);
      if (album) playAlbumFromCard(album);
    },
    onPage: (direction) => handleAlbumCollectionPage(pagerType || 'library', direction),
    onPageSize: changeLibraryPageSize,
  });
}

function renderAlbumCards(container, albums, { compact = false } = {}) {
  renderReact('renderAlbumGrid', container, {
    albums: albums.map(prepareAlbumCardForReact),
    compact,
    onOpen: openAlbum,
    onPlay: (albumId) => {
      const album = state.albumMap.get(albumId);
      if (album) playAlbumFromCard(album);
    },
  });
}

function prepareAlbumCardForReact(album) {
  return createAlbumCardView(album, {
    getAlbumMediaTypes,
    isWishlistAlbum,
  });
}

function getLibraryFilterBarProps({ mediaType = true } = {}) {
  return {
    ...buildLibraryFilterSnapshot({
      alphabetFilters: ALPHABET_FILTERS,
      activeLetter: state.alphabetFilter,
      mediaTypeIcons: MEDIA_TYPE_ICONS,
      activeMediaTypes: state.mediaTypeFilters,
      showMediaType: mediaType,
    }),
    onLetter: (letter) => {
      state.alphabetFilter = letter || 'all';
      queueVisiblePageFetch(0);
    },
    onMediaType: toggleMediaTypeFilter,
  };
}

function handleAlbumCollectionPage(type, direction) {
  const page = type === 'wishlist'
    ? state.wishlistPage
    : type === 'collections'
      ? state.collectionPage
      : state.libraryPage;
  const limit = page.limit || state.settings.libraryPageSize || 50;
  const offset = direction === 'next'
    ? page.offset + limit
    : Math.max(0, page.offset - limit);
  if (type === 'wishlist') {
    loadWishlistAlbumsPage(offset).catch((error) => console.error(error));
    return;
  }
  if (type === 'collections') {
    loadCollectionAlbumsPage(offset).catch((error) => console.error(error));
    return;
  }
  loadLibraryPage(offset, { scrollTop: true }).catch((error) => console.error(error));
}

function handleCollectionFolderPage(direction) {
  const page = state.collectionFoldersPage || {};
  const limit = page.limit || state.settings.libraryPageSize || 50;
  const offset = direction === 'next'
    ? (page.offset || 0) + limit
    : Math.max(0, (page.offset || 0) - limit);
  loadCollectionFolders(offset).catch((error) => console.error(error));
}

function toggleMediaTypeFilter(mediaType) {
  const nextFilters = new Set(state.mediaTypeFilters);
  if (nextFilters.has(mediaType)) {
    nextFilters.delete(mediaType);
  } else {
    nextFilters.add(mediaType);
  }
  state.mediaTypeFilters = nextFilters;
  render();
  queueVisiblePageFetch(0);
}

function getArtistPagerProps() {
  const page = state.artistPage || {};
  return {
    ...buildLibraryPagerSnapshot({
      page,
      total: page.total ?? state.artistGroups.length,
      itemLabel: 'artist',
    }),
    onPage: (direction) => {
      const limit = state.artistPage.limit || state.settings.libraryPageSize || 50;
      const offset = direction === 'next'
        ? state.artistPage.offset + limit
        : Math.max(0, state.artistPage.offset - limit);
      loadArtistPage(offset, { scrollTop: true }).catch((error) => console.error(error));
    },
  };
}

function getTrackPagerProps() {
  const page = state.trackPage || {};
  return {
    ...buildLibraryPagerSnapshot({
      page,
      total: page.total ?? state.libraryTrackResults.length,
      itemLabel: 'track',
    }),
    onPage: (direction) => {
      const limit = state.trackPage.limit || state.settings.libraryPageSize || 50;
      const offset = direction === 'next'
        ? state.trackPage.offset + limit
        : Math.max(0, state.trackPage.offset - limit);
      loadTrackPage(offset).catch((error) => console.error(error));
    },
  };
}

function renderTrackCollection(container, tracks, queueTracks, emptyMessage) {
  renderReact('renderTrackCollection', container, {
    ...buildTrackCollectionSnapshot({
      tracks: tracks.slice(0, RENDER_LIMITS.tracks),
      total: tracks.length,
      limit: RENDER_LIMITS.tracks,
      emptyMessage,
      variant: 'standard',
      showAlbum: true,
      prepareTrack: prepareTrackRowForReact,
    }),
    onPlayTrack: (trackId, options = {}) => {
      const track = state.trackMap.get(trackId);
      if (!track) return;
      if (options.toggle && track.id === state.currentTrackId) {
        togglePlayback();
        return;
      }
      const nextQueue = getQueueTracksForRenderedRow(track, queueTracks, 'standard');
      playTrack(track, nextQueue);
    },
    onFavoriteTrack: toggleFavoriteTrack,
    onAddTrackToQueue: (trackId) => {
      const track = state.trackMap.get(trackId);
      if (track) addTracksToQueue([track]);
    },
    onArtistClick: (artistName) => {
      if (artistName) openArtist(artistName);
    },
    onAlbumClick: (trackId) => {
      openAlbumForTrackId(trackId);
    },
  });
}

function prepareTrackRowForReact(track) {
  return createTrackRowView(track, {
    isFavoriteTrack,
    currentTrackId: state.currentTrackId,
    playing: !audioPlayer.paused,
    getTrackFolderPath,
  });
}

function getQueueTracksForRenderedRow(track, queueTracks, variant) {
  if (variant === 'album') return [track];
  return Array.isArray(queueTracks) && queueTracks.length > 0 ? queueTracks : [track];
}

function renderAlbumDetail(album) {
  if (!album) {
    navigateToView(state.browseView);
    return;
  }

  const allAlbumTracks = getAlbumTracks(album.id);
  const albumArtist = album.albumArtist || album.artist;
  const sameArtistCandidates = state.albums.filter((candidate) => (
    (candidate.albumArtist || candidate.artist) === albumArtist
    && candidate.id !== album.id
  ));
  const sameArtistAlbums = getRandomAlbumIds(sameArtistCandidates, 10)
    .map((albumId) => state.albumMap.get(albumId))
    .filter(Boolean);
  const snapshot = buildAlbumDetailSnapshot({
    album,
    albumTracks: allAlbumTracks,
    searchTerm: state.searchTerm,
    sameArtistAlbums,
    relatedAlbumLimit: 10,
    favorite: isFavoriteAlbum(album.id),
    playing: !audioPlayer.paused,
    currentTrackId: state.currentTrackId,
    helpers: {
      trackMatchesSearch,
      partitionAlbums,
      getAlbumFolderPath,
      getAlbumMediaTypes,
      isWishlistAlbum,
      isFavoriteTrack,
      getTrackFolderPath,
    },
  });

  renderReact('renderAlbumDetail', albumView, {
    ...snapshot,
    onPlayAlbum: (albumId) => {
      const selectedAlbum = state.albumMap.get(albumId);
      if (!selectedAlbum) return;
      const tracks = getAlbumTracks(selectedAlbum.id);
      if (tracks.length === 0) return;
      state.shuffleActive = false;
      rebuildShuffledQueue();
      playTrack(tracks[0], tracks);
    },
    onQueueAlbum: (albumId) => {
      const selectedAlbum = state.albumMap.get(albumId);
      if (selectedAlbum) addTracksToQueue(getAlbumTracks(selectedAlbum.id));
    },
    onDownloadAlbum: (albumId) => {
      downloadAlbumTracks(albumId).catch((error) => console.error(error));
    },
    onShuffleAlbum: (albumId) => {
      const selectedAlbum = state.albumMap.get(albumId);
      if (!selectedAlbum) return;
      const tracks = getAlbumTracks(selectedAlbum.id);
      if (tracks.length === 0) return;
      state.shuffleActive = true;
      playTrack(tracks[0], tracks);
    },
    onEditAlbum: (albumId) => {
      const selectedAlbum = state.albumMap.get(albumId);
      if (selectedAlbum) openTagEditor(selectedAlbum).catch((error) => console.error(error));
    },
    onFavoriteAlbum: toggleFavoriteAlbum,
    onPlayTrack: (trackId, options = {}) => {
      const track = state.trackMap.get(trackId);
      if (!track) return;
      if (options.toggle && track.id === state.currentTrackId) {
        togglePlayback();
        return;
      }
      playTrack(track, [track]);
    },
    onFavoriteTrack: toggleFavoriteTrack,
    onAddTrackQueue: (trackId) => {
      const track = state.trackMap.get(trackId);
      if (track) addTracksToQueue([track]);
    },
    onArtistClick: (artistName) => {
      if (artistName) openArtist(artistName);
    },
    onAlbumClick: (trackId) => {
      const track = state.trackMap.get(trackId);
      const selectedAlbum = track ? findAlbumByTrack(track) : null;
      if (selectedAlbum) openAlbum(selectedAlbum.id);
    },
    onOpenAlbum: openAlbum,
    onPlayRelatedAlbum: (albumId) => {
      const selectedAlbum = state.albumMap.get(albumId);
      if (selectedAlbum) playAlbumFromCard(selectedAlbum);
    },
  });
}

function getQueuePanelStore() {
  if (queuePanelStore) return queuePanelStore;

  queuePanelStore = createQueuePanelStore({
    onClose: closeQueuePanel,
    onDownload: () => downloadQueueTracks().catch((error) => console.error(error)),
    onFavoriteQueue: () => favoriteTracks(getPlaybackQueue()),
    onClear: clearQueue,
    onPlay: (trackId) => playTrackById(trackId),
    onFavorite: (trackId) => toggleFavoriteTrack(trackId),
    onRemove: (trackId) => removeTrackFromQueue(trackId),
    onReorder: (dragTrackId, targetTrackId) => reorderQueue(dragTrackId, targetTrackId),
  });

  return queuePanelStore;
}

function renderQueuePanel() {
  queuePanel.hidden = !state.queueOpen;
  queueOverlay.hidden = !state.queueOpen;

  const store = getQueuePanelStore();
  store.setSnapshot(buildQueuePanelSnapshot({
    open: state.queueOpen,
    queueIds: getPlaybackQueue(),
    trackMap: state.trackMap,
    currentTrackId: state.currentTrackId,
    favoriteTrackIds: state.favoriteTrackIds,
    limit: RENDER_LIMITS.queue,
  }));

  renderReact('renderQueuePanel', queuePanel, { store });
}

function playAlbumFromCard(album) {
  const tracks = getAlbumTracks(album.id);
  if (tracks.length === 0) return;
  state.shuffleActive = false;
  rebuildShuffledQueue();
  playTrack(tracks[0], tracks);
}

async function openTagEditor(album) {
  state.tagEditorAlbumId = album.id;
  state.tagEditorMode = 'edit';
  state.tagEditorMusicBrainzId = album.musicBrainzId || '';
  state.tagEditorSuggestions = [];

  const tracks = await ensureAlbumTracks(album);
  const bodySnapshot = buildTagEditorBodySnapshot(album, tracks, { extractYear });
  const { title: albumTitleValue, ...tagBodyProps } = bodySnapshot;
  renderAlbumTagEditorModal({
    renderKey: `${album.id}-${Date.now()}`,
    ...buildTagEditorModalSnapshot(album.title),
    ...tagBodyProps,
    albumTitleValue,
    mode: 'edit',
    musicBrainzId: album.musicBrainzId || '',
    onClose: closeTagEditor,
    onSearch: searchTagSuggestions,
    onLoadSuggestionDetail: fetchTagSuggestionDetail,
    onSave: saveTagEditor,
    onReset: resetTagEditor,
  });

  tagEditorModal.hidden = false;
  tagEditorOverlay.hidden = false;
}

function openAddAlbumEditor() {
  state.tagEditorAlbumId = null;
  state.tagEditorMode = 'add';
  state.tagEditorMusicBrainzId = '';
  state.tagEditorSuggestions = [];

  const bodySnapshot = buildAddAlbumBodySnapshot();
  const { title: albumTitleValue, ...tagBodyProps } = bodySnapshot;
  renderAlbumTagEditorModal({
    renderKey: `add-album-${Date.now()}`,
    ...buildAddAlbumModalSnapshot(),
    ...tagBodyProps,
    albumTitleValue,
    mode: 'add',
    musicBrainzId: '',
    onClose: closeTagEditor,
    onSearch: searchTagSuggestions,
    onLoadSuggestionDetail: fetchTagSuggestionDetail,
    onSave: saveTagEditor,
    onReset: resetTagEditor,
  });

  tagEditorModal.hidden = false;
  tagEditorOverlay.hidden = false;
}

async function ensureAlbumTracks(album) {
  const existingTracks = getAlbumTracks(album.id);
  const trackIds = Array.isArray(album.trackIds) ? album.trackIds.filter(Boolean) : [];
  if (trackIds.length === 0 || existingTracks.length >= trackIds.length) {
    return existingTracks;
  }

  const library = await fetchJson(`/api/albums/${encodeURIComponent(album.id)}/tracks`);
  mergeLibraryData(library);
  return getAlbumTracks(album.id);
}

function closeTagEditor() {
  state.tagEditorAlbumId = null;
  state.tagEditorMode = 'edit';
  state.tagEditorMusicBrainzId = '';
  state.tagEditorSuggestions = [];
  tagEditorModal.hidden = true;
  tagEditorOverlay.hidden = true;
  unmountReact(tagEditorModal);
}

function renderAlbumTagEditorModal(props = {}) {
  renderReact('renderAlbumTagEditorModal', tagEditorModal, props);
}

async function searchTagSuggestions(query = '') {
  const albumId = state.tagEditorAlbumId;
  const endpoint = state.tagEditorMode === 'add'
    ? `/api/tag-suggestions?q=${encodeURIComponent(String(query || '').trim())}`
    : `/api/albums/${encodeURIComponent(albumId)}/tag-suggestions?q=${encodeURIComponent(String(query || '').trim())}`;
  const result = await fetchJson(endpoint);
  state.tagEditorSuggestions = result.suggestions || [];
  return state.tagEditorSuggestions;
}

async function fetchTagSuggestionDetail(suggestion) {
  const detail = await fetchJson(`/api/musicbrainz/releases/${encodeURIComponent(suggestion.id)}`);
  state.tagEditorMusicBrainzId = detail.id || suggestion.id || '';
  return {
    ...detail,
    year: detail.year || extractYear(detail.date || suggestion.date) || '',
  };
}

async function saveTagEditor(formData = {}) {
  const albumId = state.tagEditorAlbumId;
  if (state.tagEditorMode !== 'add' && !albumId) return;
  const payload = buildTagEditorPayload(formData);
  const endpoint = state.tagEditorMode === 'add'
    ? '/api/albums'
    : `/api/albums/${encodeURIComponent(albumId)}/tags`;
  const result = await fetchJson(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (result.library) {
    mergeLibraryData(result.library);
  }
  state.wishlistAlbumsLoaded = false;
  state.collectionFoldersLoaded = false;
  state.collectionAlbumsLoaded = false;
  if (state.route.view === 'collection') {
    state.selectedCollectionFolderPath = state.route.collectionName || payload.collectionName || state.selectedCollectionFolderPath;
    await loadCollectionFolders();
    if (!collectionFolderExists(state.selectedCollectionFolderPath)) {
      returnToCollectionLibrary();
      await loadCollectionFolders();
    } else {
      await loadCollectionAlbumsPage(0);
    }
  } else if (state.route.view === 'library' && state.libraryTab === 'collections') {
    await loadCollectionFolders();
  }
  if (state.tagEditorMode === 'add' || result.manual) {
    await loadWishlistAlbumsPage(0);
  } else if (result.library) {
    hydrateLibrary({ title: state.title }, result.library);
  }
  sanitizeStoredFavorites();
  closeTagEditor();
  render();
  updatePlayerUi();
}

async function resetTagEditor() {
  const albumId = state.tagEditorAlbumId;
  if (!albumId || !window.confirm('Clear all local tag overrides for this album?')) return;
  const result = await fetchJson(`/api/albums/${encodeURIComponent(albumId)}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reset: true }),
  });
  hydrateLibrary({ title: state.title }, result.library);
  state.wishlistAlbumsLoaded = false;
  state.collectionFoldersLoaded = false;
  state.collectionAlbumsLoaded = false;
  if (state.route.view === 'collection') {
    await loadCollectionFolders();
    if (!collectionFolderExists(state.selectedCollectionFolderPath)) {
      returnToCollectionLibrary();
      await loadCollectionFolders();
    } else {
      await loadCollectionAlbumsPage(0);
    }
  } else if (state.route.view === 'library' && state.libraryTab === 'collections') {
    await loadCollectionFolders();
  }
  sanitizeStoredFavorites();
  closeTagEditor();
  render();
  updatePlayerUi();
}

async function loadTrackLyrics(trackId, { force = false } = {}) {
  if (!trackId || state.lyricsLoading.has(trackId)) return;
  if (!force && state.lyricsMap.has(trackId)) return;
  state.lyricsLoading.add(trackId);
  try {
    const lyrics = await fetchJson(`/api/tracks/${encodeURIComponent(trackId)}/lyrics`);
    state.lyricsMap.set(trackId, lyrics);
    if (hasLyricsText(lyrics)) {
      state.lyricsRefreshRequestedIds.delete(trackId);
    }
    renderFullscreenView();
  } finally {
    state.lyricsLoading.delete(trackId);
  }
}

function hasLyricsText(lyrics) {
  return Boolean(lyrics?.syncedLyrics?.trim() || lyrics?.plainLyrics?.trim());
}

async function openLyricsEditor(track) {
  state.lyricsEditorTrackId = track.id;
  state.lyricsSuggestions = [];
  const cachedLyrics = state.lyricsMap.get(track.id) || {};
  let lyrics = cachedLyrics;
  try {
    await loadTrackLyrics(track.id, { force: true });
    lyrics = state.lyricsMap.get(track.id) || cachedLyrics;
  } catch (error) {
    console.warn(error.message || 'Unable to load saved lyrics.');
  }
  renderLyricsEditorModal({
    renderKey: `${track.id}-${Date.now()}`,
    ...buildLyricsEditorModalSnapshot(track),
    ...buildLyricsEditorBodySnapshot(track, lyrics),
    onClose: closeLyricsEditor,
    onSearch: searchLyricsSuggestions,
    onSave: saveLyricsEditor,
    onReset: resetLyricsEditor,
  });
  lyricsEditorOverlay.hidden = false;
  lyricsEditorModal.hidden = false;
}

function closeLyricsEditor() {
  state.lyricsEditorTrackId = '';
  state.lyricsSuggestions = [];
  unmountReact(lyricsEditorModal);
  lyricsEditorOverlay.hidden = true;
  lyricsEditorModal.hidden = true;
}

function renderLyricsEditorModal(props = {}) {
  renderReact('renderLyricsEditorModal', lyricsEditorModal, props);
}

async function searchLyricsSuggestions(query = '') {
  const trackId = state.lyricsEditorTrackId;
  if (!trackId) return;
  const suggestions = await fetchJson(`/api/tracks/${encodeURIComponent(trackId)}/lyrics-suggestions?q=${encodeURIComponent(String(query || '').trim())}`);
  state.lyricsSuggestions = suggestions;
  return suggestions;
}

async function saveLyricsEditor(formData = {}) {
  const trackId = state.lyricsEditorTrackId;
  if (!trackId) return;
  await fetchJson(`/api/tracks/${encodeURIComponent(trackId)}/lyrics`, {
    method: 'POST',
    body: JSON.stringify(buildLyricsPayload({
      syncedInput: formData.syncedLyrics,
      plainInput: formData.plainLyrics,
      parseSyncedLyrics,
    })),
  });
  state.lyricsRefreshRequestedIds.delete(trackId);
  await loadTrackLyrics(trackId, { force: true });
  const lyrics = state.lyricsMap.get(trackId);
  const lineCount = getSyncedLyricLines(lyrics).length;
  state.fullscreenLyricsHidden = false;
  closeLyricsEditor();
  renderFullscreenView();
  if (lineCount === 0 && (lyrics.syncedLyrics || lyrics.plainLyrics)) {
    console.warn('Lyrics saved, but no timestamped synced lines were detected.');
  }
}

async function resetLyricsEditor() {
  const trackId = state.lyricsEditorTrackId;
  if (!trackId || !window.confirm('Remove saved lyrics for this track?')) return;
  await fetchJson(`/api/tracks/${encodeURIComponent(trackId)}/lyrics`, {
    method: 'POST',
    body: JSON.stringify({ reset: true }),
  });
  state.lyricsRefreshRequestedIds.delete(trackId);
  await loadTrackLyrics(trackId, { force: true });
  renderFullscreenView();
}

function playTrack(track, queueTracks = null) {
  playbackController.playTrack(track, queueTracks);
}

function buildDefaultQueueForTrack(track) {
  const album = findAlbumByTrack(track);
  return album ? getAlbumTracks(album.id) : [track];
}

function togglePlayback() {
  playbackController.togglePlayback();
}

function playNextTrack() {
  playbackController.playNextTrack();
}

function playPreviousTrack() {
  playbackController.playPreviousTrack();
}

function handleTrackEnded() {
  playbackController.handleTrackEnded();
}

function getRepeatLabel() {
  if (state.repeatMode === 'one') return 'Repeat one';
  if (state.repeatMode === 'all') return 'Repeat all';
  return 'Repeat off';
}

function renderRepeatIcon() {
  return `
    ${materialIcon('repeat')}
    ${state.repeatMode === 'one' ? '<span class="repeat-one-badge">1</span>' : ''}
  `;
}

function playTrackById(trackId, respectExistingQueue = true) {
  playbackController.playTrackById(trackId, respectExistingQueue);
}

function getPlaybackQueue() {
  return playbackController.getPlaybackQueue();
}

function rebuildShuffledQueue(currentTrackId = state.currentTrackId) {
  playbackController.rebuildShuffledQueue(currentTrackId);
}

function toggleShuffle() {
  playbackController.toggleShuffle();
}

function cycleRepeatMode() {
  playbackController.cycleRepeatMode();
}

function toggleMute() {
  const nextVolumeState = getMutedVolumeState(state);
  state.lastVolume = nextVolumeState.lastVolume;
  setVolume(nextVolumeState.volume);
}

function updatePlayerUi() {
  const track = state.currentTrackId ? state.trackMap.get(state.currentTrackId) : null;
  const queue = getPlaybackQueue();
  const currentIndex = track ? queue.indexOf(track.id) : -1;

  const playbackButton = getPlaybackButtonState(audioPlayer.paused);
  renderIconHtml(fullscreenPlayPauseButton, materialIcon(playbackButton.iconName));
  fullscreenPlayPauseButton.title = playbackButton.label;
  fullscreenPlayPauseButton.setAttribute('aria-label', playbackButton.label);

  fullscreenShuffleButton.classList.toggle('active', state.shuffleActive);
  fullscreenShuffleButton.setAttribute('aria-pressed', String(state.shuffleActive));
  fullscreenShuffleButton.title = state.shuffleActive ? 'Shuffle on' : 'Shuffle off';
  fullscreenShuffleButton.setAttribute('aria-label', state.shuffleActive ? 'Shuffle on' : 'Shuffle off');
  renderIconHtml(fullscreenShuffleButton, materialIcon('shuffle'));

  fullscreenRepeatButton.classList.toggle('active', state.repeatMode !== 'off');
  fullscreenRepeatButton.setAttribute('aria-pressed', String(state.repeatMode !== 'off'));
  fullscreenRepeatButton.title = getRepeatLabel();
  fullscreenRepeatButton.setAttribute('aria-label', getRepeatLabel());
  renderIconHtml(fullscreenRepeatButton, renderRepeatIcon());

  queueStatus.textContent = getQueueStatusText({
    hasTrack: Boolean(track),
    currentIndex,
    queueLength: queue.length,
  });
  renderPlayerNowPlaying(track);
  renderPlayerTransportControls();
  renderPlayerUtilityControls(track);
  scheduleMeasuredPlayerReserve();

  if (!track) {
    updateMediaSession(null, { audioPlayer, currentTrackId: state.currentTrackId });
    updateProgressUi();
    syncVolumeUi();
    renderFullscreenView();
    scheduleMeasuredPlayerReserve();
    return;
  }

  updateMediaSession(track, { audioPlayer, currentTrackId: state.currentTrackId });

  updateProgressUi();
  syncVolumeUi();
  renderFullscreenView();
  scheduleMeasuredPlayerReserve();
}

function setupMeasuredPlayerReserve() {
  if (!nowPlayingBar) return;
  if ('ResizeObserver' in window && !playerReserveResizeObserver) {
    playerReserveResizeObserver = new ResizeObserver(scheduleMeasuredPlayerReserve);
    playerReserveResizeObserver.observe(nowPlayingBar);
  }
  scheduleMeasuredPlayerReserve();
}

function scheduleMeasuredPlayerReserve() {
  if (!nowPlayingBar) return;
  if (playerReserveFrame) {
    window.cancelAnimationFrame(playerReserveFrame);
  }
  playerReserveFrame = window.requestAnimationFrame(updateMeasuredPlayerReserve);
}

function updateMeasuredPlayerReserve() {
  playerReserveFrame = 0;
  if (!nowPlayingBar) return;
  const rect = nowPlayingBar.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const bottomOffset = Math.max(0, window.innerHeight - rect.bottom);
  const breathingRoom = window.matchMedia('(max-width: 960px)').matches ? 24 : 28;
  const nextReserve = `${Math.ceil(rect.height + bottomOffset + breathingRoom)}px`;
  if (nextReserve === measuredPlayerReserve) return;

  measuredPlayerReserve = nextReserve;
  document.documentElement.style.setProperty('--measured-player-reserve', nextReserve);
}

function getPlayerStore() {
  if (playerStore) return playerStore;

  playerStore = createPlayerStore({
    nowPlaying: {
      onNowPlayingClick: handleNowPlayingClick,
      onAlbumClick: () => {
        const currentTrack = getCurrentTrack();
        const album = currentTrack ? findAlbumByTrack(currentTrack) : null;
        if (album) openAlbum(album.id);
      },
      onArtistClick: () => {
        const currentTrack = getCurrentTrack();
        if (currentTrack?.artist) openArtist(currentTrack.artist);
      },
    },
    transport: {
      onPlayPause: togglePlayback,
      onPrevious: playPreviousTrack,
      onNext: playNextTrack,
      onShuffle: toggleShuffle,
      onRepeat: cycleRepeatMode,
    },
    utility: {
      onFavorite: () => {
        if (state.currentTrackId) toggleFavoriteTrack(state.currentTrackId);
      },
      onDownload: () => {
        const track = getCurrentTrack();
        if (track) triggerTrackBrowserDownload(track);
      },
      onQueueToggle: () => {
        state.queueOpen = !state.queueOpen;
        renderQueuePanel();
        updatePlayerUi();
      },
      onVolumeToggle: toggleMute,
    },
  });

  return playerStore;
}

function publishPlayerSnapshot(track = getCurrentTrack()) {
  const album = track ? findAlbumByTrack(track) : null;
  const quality = track?.audioQuality || null;
  getPlayerStore().setSnapshot(buildPlayerSnapshot({
    track,
    album,
    paused: audioPlayer.paused,
    shuffleActive: state.shuffleActive,
    repeatMode: state.repeatMode,
    repeatLabel: getRepeatLabel(),
    queueOpen: state.queueOpen,
    volume: state.volume,
    showQuality: Boolean(state.settings.showQualityInfo && track),
    quality: normalizeAudioQualityForReact(quality, AUDIO_QUALITY_ICONS),
    favorite: track ? isFavoriteTrack(track.id) : false,
    downloadName: track ? formatDownloadName(track) : '',
  }));
}

function renderPlayerNowPlaying(track = getCurrentTrack()) {
  if (!playerTrackInfoRoot) return;
  publishPlayerSnapshot(track);
  renderReact('renderPlayerNowPlaying', playerTrackInfoRoot, { store: getPlayerStore() });
}

function renderPlayerTransportControls() {
  if (!playerTransportControls) return;
  publishPlayerSnapshot();
  renderReact('renderPlayerTransportControls', playerTransportControls, { store: getPlayerStore() });
}

function renderPlayerUtilityControls(track = getCurrentTrack()) {
  if (!playerUtilityControls) return;
  publishPlayerSnapshot(track);
  renderReact('renderPlayerUtilityControls', playerUtilityControls, { store: getPlayerStore() });
  syncPlayerUtilityElementRefs();
}

function syncPlayerUtilityElementRefs() {
  return {
    favoriteTrackButton: document.querySelector('#favorite-track-button'),
    downloadTrackLink: document.querySelector('#download-track-link'),
    audioQualityInfo: document.querySelector('#audio-quality-info'),
    queueToggleButton: document.querySelector('#queue-toggle-button'),
    volumeButton: document.querySelector('#volume-btn'),
  };
}

function getVolumePlayerIcon() {
  return playerIcon(getVolumeIconName(state.volume));
}

function renderFullscreenView() {
  if (state.route.view !== 'fullscreen') {
    fullscreenOverlay.hidden = true;
    fullscreenOverlay.classList.remove('lyrics-hidden', 'ui-hidden', 'is-playing');
    updateVisualizerState();
    return;
  }

  fullscreenOverlay.hidden = false;
  const track = getCurrentTrack();
  const queue = getPlaybackQueue();
  const currentIndex = track ? queue.indexOf(track.id) : -1;
  const nextTrack = currentIndex >= 0 ? state.trackMap.get(queue[currentIndex + 1]) : null;

  fullscreenOverlay.classList.toggle('lyrics-hidden', state.fullscreenLyricsHidden);
  fullscreenOverlay.classList.toggle('ui-hidden', state.fullscreenUiHidden);
  fullscreenOverlay.classList.toggle('is-playing', !audioPlayer.paused && !!track);
  toggleFullscreenLyricsButton.classList.toggle('active', !state.fullscreenLyricsHidden);
  toggleFullscreenUiButton.classList.toggle('active', state.fullscreenUiHidden);
  updateVisualizerState();

  if (!track) {
    fullscreenTrackTitle.textContent = 'Select a track';
    fullscreenTrackArtist.textContent = 'Your queue will appear here.';
    fullscreenNextTrack.hidden = true;
    fullscreenDownloadLink.setAttribute('aria-disabled', 'true');
    fullscreenLikeButton.classList.remove('active');
    fullscreenBackdrop.style.removeProperty('--fullscreen-cover');
    setImageOrFallback({
      imageElement: fullscreenCoverImage,
      fallbackElement: fullscreenCoverFallback,
      src: '',
      alt: '',
    });
    renderFullscreenLyricsContent({
      mode: 'empty',
      message: 'Start playing a track to fill this view.',
      signature: 'empty',
    });
    return;
  }

  const cachedLyrics = state.lyricsMap.get(track.id);
  const needsInitialLyricsLoad = !state.lyricsMap.has(track.id);
  const needsEmptyCacheRefresh = state.lyricsMap.has(track.id)
    && !hasLyricsText(cachedLyrics)
    && !state.lyricsRefreshRequestedIds.has(track.id);
  if (!state.lyricsLoading.has(track.id) && (needsInitialLyricsLoad || needsEmptyCacheRefresh)) {
    state.lyricsRefreshRequestedIds.add(track.id);
    loadTrackLyrics(track.id, { force: needsEmptyCacheRefresh })
      .catch((error) => console.warn('Unable to load lyrics', error));
  }

  fullscreenTrackTitle.textContent = track.title;
  fullscreenTrackArtist.textContent = `${track.artist} • ${track.album}`;
  fullscreenDownloadLink.removeAttribute('aria-disabled');
  fullscreenLikeButton.classList.toggle('active', isFavoriteTrack(track.id));
  fullscreenLikeButton.setAttribute('aria-pressed', String(isFavoriteTrack(track.id)));
  const lyrics = state.lyricsMap.get(track.id);
  fullscreenLyricsEditButton.classList.toggle('active', Boolean(lyrics?.syncedLyrics || lyrics?.plainLyrics));

  setImageOrFallback({
    imageElement: fullscreenCoverImage,
    fallbackElement: fullscreenCoverFallback,
    src: track.coverUrl || '',
    alt: `${track.album} cover art`,
  });

  if (track.coverUrl) {
    fullscreenBackdrop.style.setProperty('--fullscreen-cover', `url("${track.coverUrl}")`);
  } else {
    fullscreenBackdrop.style.removeProperty('--fullscreen-cover');
  }

  if (nextTrack) {
    fullscreenNextTrack.hidden = false;
    fullscreenNextTrackValue.textContent = `${nextTrack.title} • ${nextTrack.artist}`;
  } else {
    fullscreenNextTrack.hidden = true;
  }

  renderFullscreenLyricsPane(track, queue, currentIndex);
}

function renderFullscreenLyricsPane(track, queue, currentIndex) {
  const lyrics = state.lyricsMap.get(track.id);
  const syncedLines = getSyncedLyricLines(lyrics);
  if (syncedLines.length > 0) {
    const lyricsSignature = createLyricsSignature(track.id, syncedLines);
    if (fullscreenLyricsContent.dataset.mode === 'synced'
      && fullscreenLyricsContent.dataset.lyricsSignature === lyricsSignature) {
      updateFullscreenLyricsHighlight();
      return;
    }

    fullscreenLyricsContent.dataset.mode = 'synced';
    fullscreenLyricsContent.dataset.lyricCount = String(syncedLines.length);
    fullscreenLyricsContent.dataset.activeLyricIndex = '-1';
    fullscreenLyricsContent.dataset.lyricsSignature = lyricsSignature;
    renderFullscreenLyricsContent({
      mode: 'synced',
      syncedLines,
      signature: lyricsSignature,
      onSeek: (time) => {
        audioPlayer.currentTime = Number(time) || 0;
        updateFullscreenLyricsHighlight({ forceScroll: true });
        persistPlaybackState();
      },
    });

    updateFullscreenLyricsHighlight({ forceScroll: true });
    return;
  }

  const plainLines = getPlainLyricLines(lyrics);
  if (plainLines.length > 0) {
    const lyricsSignature = createPlainLyricsSignature(track.id, plainLines);
    if (fullscreenLyricsContent.dataset.mode === 'plain'
      && fullscreenLyricsContent.dataset.lyricsSignature === lyricsSignature) {
      return;
    }

    fullscreenLyricsContent.dataset.mode = 'plain';
    fullscreenLyricsContent.dataset.lyricCount = String(plainLines.length);
    fullscreenLyricsContent.dataset.activeLyricIndex = '-1';
    fullscreenLyricsContent.dataset.lyricsSignature = lyricsSignature;
    renderFullscreenLyricsContent({
      mode: 'plain',
      plainLines,
      signature: lyricsSignature,
    });
    return;
  }

  renderFullscreenLyricsQueue(queue, currentIndex);
}

function renderFullscreenLyricsQueue(queue, currentIndex) {
  fullscreenLyricsContent.dataset.mode = 'queue';
  fullscreenLyricsContent.dataset.lyricCount = '0';
  fullscreenLyricsContent.dataset.activeLyricIndex = '-1';
  fullscreenLyricsContent.dataset.lyricsSignature = '';
  const queueTracks = queue.map((id) => state.trackMap.get(id)).filter(Boolean);
  if (queueTracks.length === 0 || currentIndex < 0) {
    renderFullscreenLyricsContent({
      mode: 'queue',
      queueTracks,
      currentIndex,
      signature: 'queue-empty',
      onPlayTrack: playTrackById,
    });
    return;
  }

  renderFullscreenLyricsContent({
    mode: 'queue',
    queueTracks,
    currentIndex,
    signature: `queue:${queue.join('|')}:${currentIndex}`,
    onPlayTrack: playTrackById,
  });
}

function renderFullscreenLyricsContent(props = {}) {
  renderReact('renderFullscreenLyrics', fullscreenLyricsContent, {
    renderKey: props.signature || `${props.mode || 'empty'}-${Date.now()}`,
    ...props,
  });
}

function updateFullscreenLyricsHighlight({ forceScroll = false } = {}) {
  const currentTime = Number.isFinite(audioPlayer.currentTime) ? audioPlayer.currentTime : 0;
  updateSyncedLyricsHighlight({
    container: fullscreenLyricsContent,
    currentTime,
    forceScroll,
  });
}

function startLyricsTicker() {
  if (state.lyricsFrameId) return;

  const tick = () => {
    updateFullscreenLyricsHighlight();
    state.lyricsFrameId = audioPlayer.paused
      ? 0
      : window.requestAnimationFrame(tick);
  };
  state.lyricsFrameId = window.requestAnimationFrame(tick);
}

function stopLyricsTicker() {
  if (!state.lyricsFrameId) return;
  window.cancelAnimationFrame(state.lyricsFrameId);
  state.lyricsFrameId = 0;
}

function updateProgressUi() {
  updateProgressElements({
    progressFill,
    fullscreenProgressFill,
    currentTimeElement,
    totalDurationElement,
    fullscreenCurrentTimeElement,
    fullscreenTotalDurationElement,
    progress: getProgressState(audioPlayer),
    formatTime: formatSeconds,
  });
  updateMediaSessionPositionState(audioPlayer);
  updateFullscreenLyricsHighlight();
}

function setVolume(volume) {
  const nextVolumeState = getNextVolumeState(state, volume);
  state.volume = nextVolumeState.volume;
  state.lastVolume = nextVolumeState.lastVolume;
  audioPlayer.volume = getEffectiveAudioVolume();
  localStorage.setItem(STORAGE_KEYS.volume, String(state.volume));
  syncVolumeUi();
}

function shouldUseDeviceVolume() {
  return window.matchMedia?.('(hover: none) and (pointer: coarse)').matches ?? false;
}

function getEffectiveAudioVolume() {
  return shouldUseDeviceVolume() ? 1 : state.volume;
}

function bindVolumeControl(bar) {
  bindPlayerVolumeControl(bar, {
    getVolume: () => state.volume,
    setVolume,
  });
}

function syncVolumeUi() {
  updateVolumeElements({ volumeFill, fullscreenVolumeFill, volume: state.volume });
  renderPlayerUtilityControls();
  renderIconHtml(fullscreenVolumeButton, getVolumePlayerIcon());
}

function ensureAudioVisualizer() {
  ensureAudioGraph({ state, audioPlayer, windowRef: window });
}

function updateVisualizerState() {
  updateFullscreenVisualizerState({
    state,
    audioPlayer,
    canvas: fullscreenVisualizer,
    button: fullscreenVisualizerButton,
    windowRef: window,
  });
}

function applyStaticIcons() {
  renderPlayerNowPlaying();
  renderPlayerTransportControls();
  renderIconHtml(fullscreenShuffleButton, materialIcon('shuffle'));
  renderIconHtml(fullscreenPrevButton, materialIcon('skipBack'));
  renderIconHtml(fullscreenNextButton, materialIcon('skipForward'));
  renderIconHtml(fullscreenRepeatButton, renderRepeatIcon());
  renderPlayerUtilityControls();
  renderIconHtml(queueDownloadButton, playerIcon('download'));
  renderIconHtml(queueFavoriteButton, materialIcon('favorite'));
  renderIconHtml(queueClearButton, playerIcon('clearQueue'));
  renderIconHtml(queueCloseButton, materialIcon('close'));
}

function renderIconHtml(element, html) {
  if (!element) return;
  renderReact('renderIconHtml', element, { html });
}

function closeQueuePanel() {
  state.queueOpen = false;
  renderQueuePanel();
  updatePlayerUi();
}

function isFavoriteTrack(trackId) {
  return hasFavorite(state.favoriteTrackIds, trackId);
}

function isFavoriteAlbum(albumId) {
  return hasFavorite(state.favoriteAlbumIds, albumId);
}

function toggleFavoriteTrack(trackId) {
  if (!toggleFavoriteId(state.favoriteTrackIds, state.trackMap, trackId)) return;
  persistFavorites();
  updatePlayerUi();
  render();
}

function toggleFavoriteAlbum(albumId) {
  if (!toggleFavoriteId(state.favoriteAlbumIds, state.albumMap, albumId)) return;
  persistFavorites();
  render();
}

function favoriteTracks(trackIds) {
  if (!addFavoriteIds(state.favoriteTrackIds, state.trackMap, trackIds)) return;
  persistFavorites();
  updatePlayerUi();
  render();
}

function persistFavorites() {
  writeStoredIdSet(STORAGE_KEYS.favoriteTracks, state.favoriteTrackIds);
  writeStoredIdSet(STORAGE_KEYS.favoriteAlbums, state.favoriteAlbumIds);
}

async function downloadQueueTracks() {
  const queue = getPlaybackQueue().map((id) => state.trackMap.get(id)).filter(Boolean);
  if (!ensureDownloadAllowed()) return;
  if (state.settings.bulkDownloadMethod === 'zip') {
    submitBulkDownload(queue, getBulkDownloadFilename({ name: 'Queue', tracks: queue }));
    return;
  }
  for (const track of queue) {
    triggerTrackBrowserDownload(track);
    await delay(140);
  }
}

async function downloadAlbumTracks(albumId) {
  const album = state.albumMap.get(albumId);
  if (!album) return;
  const tracks = getAlbumTracks(album.id);
  if (tracks.length === 0) return;
  if (!ensureDownloadAllowed()) return;

  if (state.settings.bulkDownloadMethod === 'zip') {
    submitBulkDownload(tracks, getBulkDownloadFilename({
      name: album.title || 'Album',
      albumTitle: album.title || 'Album',
      albumArtist: album.albumArtist || album.artist || '',
      year: album.year || '',
      tracks,
    }));
    return;
  }

  for (const track of tracks) {
    triggerTrackBrowserDownload(track);
    await delay(140);
  }
}

function triggerTrackBrowserDownload(track) {
  if (!ensureDownloadAllowed()) return;
  const link = document.createElement('a');
  link.href = getTrackDownloadUrl(track);
  link.download = getTrackBrowserDownloadFilename(track);
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
}

function ensureDownloadAllowed() {
  if (state.canDownload !== false) return true;
  window.alert('Downloads are disabled for this account.');
  return false;
}

function submitBulkDownload(tracks, filename) {
  const selectedTracks = (Array.isArray(tracks) ? tracks : [tracks]).filter(Boolean);
  if (selectedTracks.length === 0) return;

  const form = document.createElement('form');
  const payloadInput = document.createElement('input');
  form.method = 'post';
  form.action = '/api/downloads/bulk';
  form.style.display = 'none';
  payloadInput.type = 'hidden';
  payloadInput.name = 'payload';
  payloadInput.value = JSON.stringify({
    quality: state.settings.downloadQuality === 'mp3' ? 'mp3' : 'original',
    filename,
    tracks: selectedTracks.map((track) => ({
      id: track.id,
      filename: getTrackBrowserDownloadFilename(track),
      folder: getDownloadFolder(track),
    })),
  });
  form.append(payloadInput);
  document.body.append(form);
  form.submit();
  form.remove();
}

function addTracksToQueue(tracks) {
  const nextIds = (Array.isArray(tracks) ? tracks : [tracks])
    .map((track) => track?.id)
    .filter((id) => id && state.trackMap.has(id));
  if (nextIds.length === 0) return;

  if (!addTrackIdsToQueue(state, nextIds)) return;
  persistPlaybackState({ includeTime: false });
  updatePlayerUi();
  render();
}

function clearQueue() {
  clearQueueState(state);
  persistPlaybackState({ includeTime: false });
  updatePlayerUi();
  render();
}

function removeTrackFromQueue(trackId) {
  if (!removeTrackIdFromQueue(state, trackId)) return;
  persistPlaybackState({ includeTime: false });
  updatePlayerUi();
  render();
}

function reorderQueue(dragTrackId, targetTrackId) {
  if (!reorderQueueState(state, dragTrackId, targetTrackId)) return;
  persistPlaybackState({ includeTime: false });
  updatePlayerUi();
  render();
}

function materialIcon(name, { filled = false } = {}) {
  return `<i class="${filled ? 'fa-solid' : 'fa-solid'} ${ICONS[name]}" aria-hidden="true"></i>`;
}

function playerIcon(name) {
  const iconUrl = PLAYER_ICONS[name];
  if (!iconUrl) return materialIcon(name);
  return `<i class="player-symbol" style="--player-icon: url('${escapeHtml(iconUrl)}')" aria-hidden="true"></i>`;
}

async function loadArtistInfo(artistName) {
  if (state.artistInfoMap.has(artistName) || state.artistInfoLoading.has(artistName)) return;

  state.artistInfoLoading.add(artistName);
  try {
    const info = await fetchJson(`/api/artists/${encodeURIComponent(artistName)}/info`);
    state.artistInfoMap.set(artistName, info);
    render();
  } catch (error) {
    console.warn(`Unable to load artist info for ${artistName}`, error);
    state.artistInfoMap.set(artistName, {
      name: artistName,
      imageUrl: null,
      bio: '',
      sourceUrl: '',
      source: 'none',
    });
  } finally {
    state.artistInfoLoading.delete(artistName);
  }
}

function buildArtistGroups(tracks) {
  return librarySelectors.buildArtistGroups(tracks, {
    albumMap: state.albumMap,
    findAlbum: findAlbumByTrack,
  });
}

function getSmartPlaylists(filteredTracks) {
  const favoriteTracks = filteredTracks.filter((track) => isFavoriteTrack(track.id));
  const currentQueueTracks = getPlaybackQueue().map((id) => state.trackMap.get(id)).filter(Boolean);

  return [
    {
      id: 'favorites-tracks',
      title: 'Favorite Tracks',
      description: 'Every track you marked with a heart.',
      tracks: favoriteTracks,
    },
    {
      id: 'current-queue',
      title: 'Current Queue',
      description: 'Whatever is lined up in the bottom player right now.',
      tracks: currentQueueTracks,
    },
    {
      id: 'all-tracks',
      title: 'All Tracks',
      description: 'A full-library playlist from your current search/filter.',
      tracks: filteredTracks,
    },
  ];
}

function getFilteredTracks() {
  return librarySelectors.getFilteredTracks(state.tracks, state.searchTerm);
}

function getFilteredAlbums(filteredTracks) {
  return librarySelectors.getFilteredAlbums(state.albums, filteredTracks, state.searchTerm);
}

function getRandomAlbumIds(albums, limit) {
  return librarySelectors.getRandomAlbumIds(albums, limit);
}

function getHomeAlbums(filteredAlbums) {
  return librarySelectors.getHomeAlbums({
    searchTerm: state.searchTerm,
    homeAlbumIds: state.homeAlbumIds,
    albumMap: state.albumMap,
    filteredAlbums,
    limit: 50,
  });
}

function trackMatchesSearch(track) {
  return librarySelectors.trackMatchesSearch(track, state.searchTerm);
}

function albumMatchesSearch(album) {
  return librarySelectors.albumMatchesSearch(album, state.searchTerm);
}

function getCurrentAlbum() {
  return state.route.albumId ? state.albumMap.get(state.route.albumId) ?? null : null;
}

function getCurrentArtist() {
  return state.route.artistName ? getArtistGroup(state.route.artistName) : null;
}

function getCurrentTrack() {
  return state.currentTrackId ? state.trackMap.get(state.currentTrackId) ?? null : null;
}

function getArtistGroup(artistName) {
  return state.artistGroupMap.get(artistName) ?? null;
}

function getArtistInitials(name) {
  return name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';
}

function getAlbumTracks(albumId) {
  return state.albumTracksMap.get(albumId) || [];
}

function compareTrackOrder(left, right) {
  return librarySelectors.compareTrackOrder(left, right);
}

function compareNullableTrackNumber(left, right) {
  return librarySelectors.compareNullableTrackNumber(left, right);
}

function findAlbumByTrack(track) {
  return librarySelectors.findAlbumByTrack(track, {
    albumMap: state.albumMap,
    albums: state.albums,
  });
}

function partitionAlbums(albums) {
  return librarySelectors.partitionAlbums(albums, getAlbumTracks);
}

function getAlbumFolderPath(tracks) {
  return librarySelectors.getAlbumFolderPath(tracks);
}

function getTrackFolderPath(relativePath) {
  return librarySelectors.getTrackFolderPath(relativePath);
}

function isWishlistAlbum(album) {
  return librarySelectors.isWishlistAlbum(album);
}

function filterAlbumsByMediaType(albums) {
  return librarySelectors.filterAlbumsByMediaType(albums, state.mediaTypeFilters);
}

function getAlbumMediaTypes(album) {
  return librarySelectors.getAlbumMediaTypes(album);
}

function normalizeMediaTypeName(mediaType) {
  return librarySelectors.normalizeMediaTypeName(mediaType);
}

function setImageOrFallback({ imageElement, fallbackElement, src, alt }) {
  if (src) {
    imageElement.hidden = false;
    imageElement.src = src;
    imageElement.alt = alt;
    fallbackElement.hidden = true;
  } else {
    imageElement.hidden = true;
    imageElement.removeAttribute('src');
    imageElement.alt = '';
    fallbackElement.hidden = false;
  }
}

function formatDownloadName(track) {
  return getTrackBrowserDownloadFilename(track);
}

function getTrackBrowserDownloadFilename(track) {
  const album = findAlbumByTrack(track);
  const trackFilenameTemplate = state.settings.filenameTemplate || DEFAULT_SETTINGS.filenameTemplate;
  const extension = state.settings.downloadQuality === 'mp3'
    ? '.mp3'
    : getFileExtension(track.relativePath);
  const filename = applyTemplate(trackFilenameTemplate, {
    discNumber: track.discNumber || '',
    trackNumber: track.trackNumber || '',
    artist: track.artist,
    title: track.title,
    album: track.album,
    albumTitle: track.album,
    albumArtist: album?.albumArtist || album?.artist || track.albumArtist || track.artist,
    year: album?.year || extractYear(track.date) || '',
  });
  return `${sanitizeFilename(filename)}${extension}`;
}

function getTrackDownloadUrl(track) {
  const params = new URLSearchParams({
    quality: state.settings.downloadQuality === 'mp3' ? 'mp3' : 'original',
    filename: getTrackBrowserDownloadFilename(track),
  });
  return `/api/tracks/${encodeURIComponent(track.id)}/download?${params.toString()}`;
}

function getBulkDownloadFilename({ name = 'Download', albumTitle = '', albumArtist = '', year = '', tracks = [] } = {}) {
  const filename = applyTemplate(
    state.settings.archiveFilenameTemplate || DEFAULT_SETTINGS.archiveFilenameTemplate,
    {
      name,
      album: albumTitle || name,
      albumTitle: albumTitle || name,
      albumArtist,
      artist: albumArtist,
      year,
      trackCount: Array.isArray(tracks) ? tracks.length : 0,
    },
  );
  const sanitized = sanitizeFilename(filename) || sanitizeFilename(name) || 'download';
  return `${sanitized}.zip`;
}

function getDownloadFolder(track) {
  const album = findAlbumByTrack(track);
  const folder = applyTemplate(state.settings.zipEntryFolderTemplate || DEFAULT_SETTINGS.zipEntryFolderTemplate, {
    discNumber: track.discNumber || '',
    trackNumber: track.trackNumber || '',
    artist: track.artist,
    title: track.title,
    album: track.album,
    albumTitle: track.album,
    albumArtist: album?.albumArtist || album?.artist || track.albumArtist || track.artist,
    year: album?.year || extractYear(track.date) || '',
  });
  return sanitizeZipFolder(folder);
}

function sanitizeZipFolder(value) {
  return String(value || '')
    .replace(/\\/gu, '/')
    .split('/')
    .map((part) => sanitizeFilename(part))
    .filter(Boolean)
    .join('/');
}

function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        state.settings = {
          ...DEFAULT_SETTINGS,
          ...normalizeSettings(parsed),
        };
        persistSettings(state.settings);
        applySettings();
        render();
        showSettingsStatus('Settings imported.');
      } catch {
        showSettingsStatus('Unable to import settings JSON.');
      }
    });
    reader.readAsText(file);
  });
  input.click();
}

function resetLocalData() {
  if (!window.confirm('Reset local settings and favorites in this browser?')) return;
  localStorage.removeItem(STORAGE_KEYS.settings);
  localStorage.removeItem(STORAGE_KEYS.favoriteTracks);
  localStorage.removeItem(STORAGE_KEYS.favoriteAlbums);
  localStorage.removeItem(STORAGE_KEYS.playback);
  state.settings = { ...DEFAULT_SETTINGS };
  state.favoriteTrackIds = new Set();
  state.favoriteAlbumIds = new Set();
  state.currentTrackId = null;
  state.queueIds = [];
  state.shuffledQueueIds = [];
  audioPlayer.removeAttribute('src');
  applySettings();
  render();
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

