const appTitle = document.querySelector('#app-title');
const appSidebar = document.querySelector('#app-sidebar');
const albumCount = document.querySelector('#album-count');
const trackCount = document.querySelector('#track-count');
const libraryStatus = document.querySelector('#library-status');
const searchInput = document.querySelector('#search-input');
const clearSearchButton = document.querySelector('#clear-search-button');
const backButton = document.querySelector('#back-button');
const navHome = document.querySelector('#nav-home');
const navLibrary = document.querySelector('#nav-library');
const navFavorites = document.querySelector('#nav-favorites');
const navWanted = document.querySelector('#nav-wanted');
const navSettings = document.querySelector('#nav-settings');
const sidebarToggleButton = document.querySelector('#sidebar-toggle-button');
const mobileSidebarButton = document.querySelector('#mobile-sidebar-button');
const sidebarOverlay = document.querySelector('#sidebar-overlay');
const homeView = document.querySelector('#home-view');
const homeHero = document.querySelector('#home-hero');
const homeHeroEyebrow = document.querySelector('#home-hero-eyebrow');
const homeHeroTitle = document.querySelector('#home-hero-title');
const homeHeroSubtitle = document.querySelector('#home-hero-subtitle');
const libraryView = document.querySelector('#library-view');
const libraryBrowserCaption = document.querySelector('#library-browser-caption');
const libraryTabFolders = document.querySelector('#library-tab-folders');
const libraryTabAlbums = document.querySelector('#library-tab-albums');
const libraryTabArtists = document.querySelector('#library-tab-artists');
const libraryTabTracks = document.querySelector('#library-tab-tracks');
const libraryTabPlaylists = document.querySelector('#library-tab-playlists');
const libraryPanelFolders = document.querySelector('#library-panel-folders');
const libraryPanelAlbums = document.querySelector('#library-panel-albums');
const libraryPanelArtists = document.querySelector('#library-panel-artists');
const libraryPanelTracks = document.querySelector('#library-panel-tracks');
const libraryPanelPlaylists = document.querySelector('#library-panel-playlists');
const favoritesView = document.querySelector('#favorites-view');
const wantedView = document.querySelector('#wanted-view');
const settingsView = document.querySelector('#settings-view');
const artistView = document.querySelector('#artist-view');
const artistHero = document.querySelector('#artist-hero');
const artistDetailImage = document.querySelector('#artist-detail-image');
const artistDetailFallback = document.querySelector('#artist-detail-fallback');
const artistDetailName = document.querySelector('#artist-detail-name');
const artistDetailMeta = document.querySelector('#artist-detail-meta');
const artistDetailBio = document.querySelector('#artist-detail-bio');
const artistDetailSource = document.querySelector('#artist-detail-source');
const editArtistButton = document.querySelector('#edit-artist-button');
const artistAlbumsTitle = document.querySelector('#artist-albums-title');
const artistAlbumsCaption = document.querySelector('#artist-albums-caption');
const artistAlbumGrid = document.querySelector('#artist-album-grid');
const albumView = document.querySelector('#album-view');
const albumGrid = document.querySelector('#album-grid');
const homeAlbumCaption = document.querySelector('#home-album-caption');
const favoriteAlbumCaption = document.querySelector('#favorite-album-caption');
const favoriteTrackCaption = document.querySelector('#favorite-track-caption');
const favoriteAlbumGrid = document.querySelector('#favorite-album-grid');
const favoriteTrackList = document.querySelector('#favorite-track-list');
const wantedAlbumCaption = document.querySelector('#wanted-album-caption');
const wantedAlbumGrid = document.querySelector('#wanted-album-grid');
const settingsTabs = document.querySelector('#settings-tabs');
const settingsPanels = document.querySelector('#settings-panels');
const settingsStatus = document.querySelector('#settings-status');
const appFavicon = document.querySelector('#app-favicon');
const albumHero = document.querySelector('#album-hero');
const albumDetailCover = document.querySelector('#album-detail-cover');
const albumDetailCoverFallback = document.querySelector('#album-detail-cover-fallback');
const albumDetailTitle = document.querySelector('#album-detail-title');
const albumDetailFormat = document.querySelector('#album-detail-format');
const albumDetailMeta = document.querySelector('#album-detail-meta');
const albumDetailArtist = document.querySelector('#album-detail-artist');
const albumDetailFolder = document.querySelector('#album-detail-folder');
const albumTrackList = document.querySelector('#album-track-list');
const playAlbumButton = document.querySelector('#play-album-button');
const queueAlbumButton = document.querySelector('#queue-album-button');
const shuffleAlbumButton = document.querySelector('#shuffle-album-button');
const editAlbumCoverButton = document.querySelector('#edit-album-cover-button');
const favoriteAlbumButton = document.querySelector('#favorite-album-button');
const moreAlbumsSection = document.querySelector('#more-albums-section');
const moreAlbumsTitle = document.querySelector('#more-albums-title');
const moreAlbumsGrid = document.querySelector('#more-albums-grid');
const epsSection = document.querySelector('#eps-section');
const epsTitle = document.querySelector('#eps-title');
const epsGrid = document.querySelector('#eps-grid');
const audioPlayer = document.querySelector('#audio-player');
const playerTrackInfoRoot = document.querySelector('#player-track-info-root');
const playerTransportControls = document.querySelector('#player-transport-controls');
const currentTimeElement = document.querySelector('#current-time');
const totalDurationElement = document.querySelector('#total-duration');
const progressBar = document.querySelector('#progress-bar');
const progressFill = document.querySelector('#progress-fill');
const volumeBar = document.querySelector('#volume-bar');
const volumeFill = document.querySelector('#volume-fill');
const playerUtilityControls = document.querySelector('#player-utility-controls');
const fullscreenOverlay = document.querySelector('#fullscreen-cover-overlay');
const fullscreenBackdrop = document.querySelector('.fullscreen-backdrop');
const fullscreenVisualizer = document.querySelector('#fullscreen-visualizer');
const fullscreenCoverImage = document.querySelector('#fullscreen-cover-image');
const fullscreenCoverFallback = document.querySelector('#fullscreen-cover-fallback');
const fullscreenTrackTitle = document.querySelector('#fullscreen-track-title');
const fullscreenTrackArtist = document.querySelector('#fullscreen-track-artist');
const fullscreenNextTrack = document.querySelector('#fullscreen-next-track');
const fullscreenNextTrackValue = document.querySelector('#fullscreen-next-track-value');
const fullscreenLyricsContent = document.querySelector('#fullscreen-lyrics-content');
const closeFullscreenButton = document.querySelector('#close-fullscreen-cover-btn');
const toggleFullscreenLyricsButton = document.querySelector('#toggle-fullscreen-lyrics-btn');
const toggleFullscreenUiButton = document.querySelector('#toggle-ui-btn');
const fullscreenVisualizerButton = document.querySelector('#fs-visualizer-btn');
const fullscreenLikeButton = document.querySelector('#fs-like-btn');
const fullscreenEditButton = document.querySelector('#fs-edit-btn');
const fullscreenDownloadLink = document.querySelector('#fs-download-btn');
const fullscreenLyricsEditButton = document.querySelector('#fs-lyrics-edit-btn');
const fullscreenQueueButton = document.querySelector('#fs-queue-btn');
const fullscreenShuffleButton = document.querySelector('#fs-shuffle-btn');
const fullscreenPrevButton = document.querySelector('#fs-prev-btn');
const fullscreenPlayPauseButton = document.querySelector('#fs-play-pause-btn');
const fullscreenNextButton = document.querySelector('#fs-next-btn');
const fullscreenRepeatButton = document.querySelector('#fs-repeat-btn');
const fullscreenCurrentTimeElement = document.querySelector('#fs-current-time');
const fullscreenTotalDurationElement = document.querySelector('#fs-total-duration');
const fullscreenProgressBar = document.querySelector('#fs-progress-bar');
const fullscreenProgressFill = document.querySelector('#fs-progress-fill');
const fullscreenVolumeButton = document.querySelector('#fs-volume-btn');
const fullscreenVolumeBar = document.querySelector('#fs-volume-bar');
const fullscreenVolumeFill = document.querySelector('#fs-volume-fill');
const queueStatus = document.querySelector('#queue-status');
const queuePanel = document.querySelector('#queue-panel');
const queueCloseButton = document.querySelector('#queue-close-button');
const queueDownloadButton = document.querySelector('#queue-download-button');
const queueFavoriteButton = document.querySelector('#queue-favorite-button');
const queueClearButton = document.querySelector('#queue-clear-button');
const queueOverlay = document.querySelector('#queue-overlay');
const queueList = document.querySelector('#queue-list');
const tagEditorOverlay = document.querySelector('#tag-editor-overlay');
const tagEditorModal = document.querySelector('#tag-editor-modal');
const tagEditorTitle = document.querySelector('#tag-editor-title');
const tagEditorCaption = document.querySelector('#tag-editor-caption');
const tagEditorCloseButton = document.querySelector('#tag-editor-close-button');
const tagEditorCancelButton = document.querySelector('#tag-editor-cancel-button');
const tagEditorSaveButton = document.querySelector('#tag-editor-save-button');
const tagEditorResetButton = document.querySelector('#tag-editor-reset-button');
const tagEditorBodyRoot = document.querySelector('#tag-editor-body-root');
let tagAlbumTitleInput = null;
let tagAlbumArtistInput = null;
let tagAlbumDateInput = null;
let tagAlbumGenreInput = null;
let tagAlbumMediaTypesInput = null;
let tagAlbumStatusInput = null;
let tagAlbumCoverUrlInput = null;
let tagEditorCoverPreview = null;
let tagEditorCoverFallback = null;
let tagScraperQueryInput = null;
let tagScraperSearchButton = null;
let tagScraperStatus = null;
let tagScraperResults = null;
let tagTrackList = null;
const artistEditorOverlay = document.querySelector('#artist-editor-overlay');
const artistEditorModal = document.querySelector('#artist-editor-modal');
const artistEditorTitle = document.querySelector('#artist-editor-title');
const artistEditorCloseButton = document.querySelector('#artist-editor-close-button');
const artistEditorCancelButton = document.querySelector('#artist-editor-cancel-button');
const artistEditorSaveButton = document.querySelector('#artist-editor-save-button');
const artistEditorResetButton = document.querySelector('#artist-editor-reset-button');
const artistEditorBodyRoot = document.querySelector('#artist-editor-body-root');
let artistImageUrlInput = null;
let artistBioInput = null;
let artistSourceUrlInput = null;
const lyricsEditorOverlay = document.querySelector('#lyrics-editor-overlay');
const lyricsEditorModal = document.querySelector('#lyrics-editor-modal');
const lyricsEditorTitle = document.querySelector('#lyrics-editor-title');
const lyricsEditorCaption = document.querySelector('#lyrics-editor-caption');
const lyricsEditorCloseButton = document.querySelector('#lyrics-editor-close-button');
const lyricsEditorCancelButton = document.querySelector('#lyrics-editor-cancel-button');
const lyricsEditorSaveButton = document.querySelector('#lyrics-editor-save-button');
const lyricsEditorResetButton = document.querySelector('#lyrics-editor-reset-button');
const lyricsEditorBodyRoot = document.querySelector('#lyrics-editor-body-root');
let lyricsSyncedInput = null;
let lyricsPlainInput = null;
let lyricsScraperQueryInput = null;
let lyricsScraperSearchButton = null;
let lyricsScraperStatus = null;
let lyricsScraperResults = null;

const ICONS = {
  play: 'fa-play',
  pause: 'fa-pause',
  skipBack: 'fa-backward-step',
  skipForward: 'fa-forward-step',
  shuffle: 'fa-shuffle',
  repeat: 'fa-repeat',
  download: 'fa-download',
  volumeHigh: 'fa-volume-high',
  volumeLow: 'fa-volume-low',
  volumeMuted: 'fa-volume-xmark',
  queue: 'fa-list',
  close: 'fa-xmark',
  back: 'fa-arrow-left',
  favorite: 'fa-heart',
  remove: 'fa-trash-can',
  clearQueue: 'fa-broom',
  drag: 'fa-grip-lines',
  edit: 'fa-pen-to-square',
  image: 'fa-image',
  search: 'fa-magnifying-glass',
  chevronRight: 'fa-chevron-right',
  chevronDown: 'fa-chevron-down',
  compactDisc: 'fa-compact-disc',
  fileAudio: 'fa-file-audio',
  recordVinyl: 'fa-record-vinyl',
  filter: 'fa-filter',
  addQueue: 'fa-plus',
};

const PLAYER_ICONS = {
  download: '/player-icons/download.svg',
  queue: '/player-icons/list-ul.svg',
  remove: '/player-icons/trash.svg',
  clearQueue: '/player-icons/trash.svg',
  volumeHigh: '/player-icons/volume-high.svg',
  volumeMedium: '/player-icons/volume-medium.svg',
  volumeLow: '/player-icons/volume-low.svg',
  volumeMuted: '/player-icons/volume-xmark.svg',
};

const REPEAT_MODES = ['off', 'all', 'one'];
const MOBILE_SIDEBAR_QUERY = '(max-width: 720px)';
const STORAGE_KEYS = {
  volume: 'Monochrome-Streamer-volume',
  favoriteTracks: 'Monochrome-Streamer-favorite-track-ids',
  favoriteAlbums: 'Monochrome-Streamer-favorite-album-ids',
  settings: 'Monochrome-Streamer-settings',
  playback: 'Monochrome-Streamer-playback-state',
};

const DEFAULT_SETTINGS = {
  theme: 'black',
  fontPreset: 'jakarta',
  fontSize: 100,
  libraryPageSize: 50,
  customAccent: '#eb9200',
  customThemeBase: 'dark',
  libraryTitle: 'Monochrome-Streamer',
  showLibraryTitle: true,
  showHomeBanner: true,
  homeBannerEyebrow: 'Local Audio',
  homeBannerTitle: 'Your server, your collection, your rules.',
  homeBannerSubtitle: 'Browse your albums, open them like a proper detail page, and control playback from a full bottom player.',
  albumCoverBackground: true,
  dynamicColors: false,
  albumCardSize: 150,
  compactArtists: false,
  showHome: true,
  showLibrary: true,
  showFavorites: true,
  sidebarCollapsed: false,
  closePanelsOnNavigation: true,
  nowPlayingClickAction: 'fullscreen',
  nowPlayingClickActionUserSet: false,
  appIconUrl: '',
  playerLayout: 'floating',
  showQualityInfo: true,
  gaplessPlayback: true,
  downloadQuality: 'original',
  filenameTemplate: '{artist} - {title}',
  folderTemplate: '{albumArtist}/{year} - {albumTitle}',
  bulkDownloadMethod: 'browser',
  includeCoverFile: false,
  generateM3u: false,
  generateJson: false,
  instanceUrl: '',
  devMode: false,
  cacheEnabled: true,
  autoUpdate: false,
};

const NOW_PLAYING_CLICK_ACTIONS = new Set(['album', 'fullscreen', 'artist', 'none']);
const LEGACY_SETTING_KEYS = [
  'scrobbleLocal',
  'scrobbleThreshold',
  'loveOnFavorite',
  'listenBrainzToken',
  'malojaUrl',
  'malojaApiKey',
  'playbackQuality',
  'replayGainMode',
  'monoAudio',
  'exponentialVolume',
  'playbackSpeed',
  'preservePitch',
];

const SETTINGS_TABS = [
  ['appearance', 'Appearance'],
  ['interface', 'Interface'],
  ['audio', 'Audio'],
  ['downloads', 'Downloads'],
  ['instances', 'Instances'],
  ['system', 'System'],
];

const FONT_PRESETS = {
  jakarta: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
  inter: 'Inter, "Plus Jakarta Sans", sans-serif',
  system: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
  mono: '"IBM Plex Mono", "Cascadia Mono", Consolas, monospace',
  serif: 'Georgia, "Times New Roman", serif',
};

const THEME_PRESETS = {
  system: {
    background: '#090909',
    surface: 'rgba(15, 15, 15, 0.78)',
    surface2: 'rgba(20, 20, 20, 0.94)',
    text: '#f4f4f0',
    muted: 'rgba(244, 244, 240, 0.65)',
    accent: '#eb9200',
    bodyTop: '#1c120d',
    bodyMid: '#090909',
    bodyBottom: '#050505',
  },
  black: {
    background: '#050505',
    surface: 'rgba(12, 12, 12, 0.82)',
    surface2: 'rgba(15, 15, 15, 0.96)',
    text: '#f7f7f2',
    muted: 'rgba(247, 247, 242, 0.64)',
    accent: '#eb9200',
    bodyTop: '#19100a',
    bodyMid: '#070707',
    bodyBottom: '#030303',
  },
  white: {
    background: '#f6f2ea',
    surface: 'rgba(255, 255, 255, 0.78)',
    surface2: 'rgba(248, 244, 235, 0.96)',
    text: '#17130f',
    muted: 'rgba(23, 19, 15, 0.64)',
    accent: '#bc5b00',
    bodyTop: '#fff9ef',
    bodyMid: '#f0e8dc',
    bodyBottom: '#ded5c8',
  },
  dark: {
    background: '#0b0d10',
    surface: 'rgba(18, 21, 25, 0.82)',
    surface2: 'rgba(18, 21, 25, 0.96)',
    text: '#eef2f5',
    muted: 'rgba(238, 242, 245, 0.64)',
    accent: '#8fb4ff',
    bodyTop: '#111822',
    bodyMid: '#090b0f',
    bodyBottom: '#050608',
  },
  ocean: {
    background: '#061115',
    surface: 'rgba(8, 25, 31, 0.82)',
    surface2: 'rgba(9, 31, 38, 0.96)',
    text: '#edfafa',
    muted: 'rgba(237, 250, 250, 0.66)',
    accent: '#18c2c8',
    bodyTop: '#082630',
    bodyMid: '#061115',
    bodyBottom: '#020809',
  },
  purple: {
    background: '#110b16',
    surface: 'rgba(25, 16, 32, 0.82)',
    surface2: 'rgba(30, 18, 40, 0.96)',
    text: '#fbf3ff',
    muted: 'rgba(251, 243, 255, 0.64)',
    accent: '#be8cff',
    bodyTop: '#271333',
    bodyMid: '#110b16',
    bodyBottom: '#07040a',
  },
  forest: {
    background: '#07100b',
    surface: 'rgba(12, 28, 18, 0.82)',
    surface2: 'rgba(13, 34, 21, 0.96)',
    text: '#f2fbf4',
    muted: 'rgba(242, 251, 244, 0.64)',
    accent: '#71cf72',
    bodyTop: '#132a18',
    bodyMid: '#07100b',
    bodyBottom: '#030704',
  },
  mocha: {
    background: '#110d0a',
    surface: 'rgba(30, 22, 16, 0.82)',
    surface2: 'rgba(35, 26, 19, 0.96)',
    text: '#fff4e8',
    muted: 'rgba(255, 244, 232, 0.64)',
    accent: '#d39b64',
    bodyTop: '#2d2118',
    bodyMid: '#110d0a',
    bodyBottom: '#070504',
  },
  macchiato: {
    background: '#14151d',
    surface: 'rgba(29, 31, 43, 0.82)',
    surface2: 'rgba(36, 39, 54, 0.96)',
    text: '#f4f0ff',
    muted: 'rgba(244, 240, 255, 0.64)',
    accent: '#f5a97f',
    bodyTop: '#25283a',
    bodyMid: '#14151d',
    bodyBottom: '#08090d',
  },
  frappe: {
    background: '#171922',
    surface: 'rgba(34, 38, 52, 0.82)',
    surface2: 'rgba(41, 45, 62, 0.96)',
    text: '#f2f0fa',
    muted: 'rgba(242, 240, 250, 0.64)',
    accent: '#e5c890',
    bodyTop: '#2b3042',
    bodyMid: '#171922',
    bodyBottom: '#0a0b10',
  },
  latte: {
    background: '#eff1f5',
    surface: 'rgba(255, 255, 255, 0.8)',
    surface2: 'rgba(230, 233, 239, 0.96)',
    text: '#1e1e2e',
    muted: 'rgba(30, 30, 46, 0.64)',
    accent: '#fe640b',
    bodyTop: '#f8f2e7',
    bodyMid: '#eff1f5',
    bodyBottom: '#dce0e8',
  },
};

const MEDIA_TYPE_ICONS = {
  CD: '/media-type-icons/compact-disc.svg',
  'Digital Media': '/media-type-icons/file-waveform.svg',
  Vinyl: '/media-type-icons/record-vinyl.svg',
  'Cassette Tape': '/media-type-icons/cassette-tape.svg',
};
const MEDIA_TYPE_FILTERS = ['all', ...Object.keys(MEDIA_TYPE_ICONS)];

const AUDIO_QUALITY_ICONS = {
  hires: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjzgkp7vuwaecsDEPlp7MlW-oqGVNzD26tWA&s',
  cd: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/CD_Audio_icon.png',
};
const RENDER_LIMITS = {
  albums: 180,
  artists: 180,
  tracks: 240,
  queue: 220,
  folders: 160,
};
const ALPHABET_FILTERS = ['all', '#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

const state = {
  title: 'Monochrome-Streamer',
  generatedAt: null,
  albums: [],
  tracks: [],
  trackMap: new Map(),
  albumMap: new Map(),
  albumTracksMap: new Map(),
  artistGroups: [],
  artistGroupMap: new Map(),
  libraryFolders: { available: [], selected: [], scan: null },
  libraryPage: { limit: 50, offset: 0, total: 0, hasNext: false, hasPrevious: false },
  wantedPage: { limit: 50, offset: 0, total: 0, hasNext: false, hasPrevious: false },
  artistPage: { limit: 50, offset: 0, total: 0, hasNext: false, hasPrevious: false },
  trackPage: { limit: 50, offset: 0, total: 0, hasNext: false, hasPrevious: false },
  libraryTrackResults: [],
  libraryTotals: { albums: 0, tracks: 0 },
  folderCache: new Map(),
  folderLoading: new Set(),
  homeAlbumIds: [],
  wantedAlbums: [],
  wantedAlbumsLoaded: false,
  searchTerm: '',
  alphabetFilter: 'all',
  mediaTypeFilters: new Set(),
  browseView: 'home',
  route: { view: 'home', albumId: null },
  currentTrackId: null,
  queueIds: [],
  shuffledQueueIds: [],
  shuffleActive: false,
  repeatMode: 'off',
  volume: 0.7,
  lastVolume: 0.7,
  queueOpen: false,
  fullscreenReturnHash: '',
  fullscreenLyricsHidden: false,
  fullscreenUiHidden: false,
  favoriteTrackIds: new Set(),
  favoriteAlbumIds: new Set(),
  libraryTab: 'folders',
  settingsTab: 'appearance',
  settings: { ...DEFAULT_SETTINGS },
  pendingLibraryFolders: null,
  expandedFolderPaths: new Set(),
  selectedPlaylistId: 'favorites-tracks',
  artistInfoMap: new Map(),
  artistInfoLoading: new Set(),
  lyricsMap: new Map(),
  lyricsLoading: new Set(),
  lyricsRefreshRequestedIds: new Set(),
  tagEditorAlbumId: null,
  tagEditorMusicBrainzId: '',
  tagEditorSuggestions: [],
  artistEditorName: '',
  lyricsEditorTrackId: '',
  lyricsSuggestions: [],
  visualizerActive: true,
  lyricsFrameId: 0,
  lastPlaybackPersistedAt: 0,
  audioContext: null,
  audioSource: null,
  analyser: null,
  analyserData: null,
  visualizerFrameId: 0,
  scanPollId: null,
  scanPollInFlight: false,
  searchFetchId: 0,
  artistFetchId: 0,
};

let settingsReactPanelContainer = null;
let settingsReactPanelTab = '';

init().catch((error) => {
  console.error(error);
  libraryStatus.textContent = error.message || 'Failed to load library.';
});

async function init() {
  state.settings = readStoredSettings();

  const [config, libraryFolders] = await Promise.all([
    fetchJson('/api/config'),
    fetchJson('/api/library/folders').catch(() => ({ available: [], selected: [], scan: null })),
  ]);
  const library = await fetchLibraryPagePayload(0);

  state.libraryFolders = libraryFolders;
  hydrateLibrary(config, library);
  state.favoriteTrackIds = readStoredIdSet(STORAGE_KEYS.favoriteTracks);
  state.favoriteAlbumIds = readStoredIdSet(STORAGE_KEYS.favoriteAlbums);
  sanitizeStoredFavorites();
  state.volume = clamp(readStoredNumber(STORAGE_KEYS.volume, 0.7), 0, 1);
  state.lastVolume = state.volume || 0.7;
  audioPlayer.volume = state.volume;
  restorePlaybackState();
  applySettings();

  applyStaticIcons();
  bindEvents();
  setupMediaSessionActions();
  updateRouteFromLocation();
  render();
  syncVolumeUi();
  updatePlayerUi();
  if (state.libraryFolders?.scan?.status === 'scanning') {
    startScanStatusPolling(1200);
  }
  loadHomeAlbums().catch((error) => console.error(error));
}

function isMobileSidebarLayout() {
  return window.matchMedia(MOBILE_SIDEBAR_QUERY).matches;
}

function setMobileSidebarOpen(open) {
  const shouldOpen = Boolean(open) && isMobileSidebarLayout();
  document.body.classList.toggle('mobile-sidebar-open', shouldOpen);
  sidebarOverlay.hidden = !shouldOpen;
  mobileSidebarButton.setAttribute('aria-expanded', String(shouldOpen));
  updateSidebarToggleButton();
}

function updateSidebarToggleButton() {
  const sidebarToggleIcon = sidebarToggleButton.querySelector('.fa-solid');
  if (isMobileSidebarLayout()) {
    sidebarToggleButton.setAttribute('aria-expanded', String(document.body.classList.contains('mobile-sidebar-open')));
    sidebarToggleButton.setAttribute('aria-label', 'Close sidebar');
    if (sidebarToggleIcon) {
      sidebarToggleIcon.className = 'fa-solid fa-xmark';
    }
    return;
  }

  sidebarToggleButton.setAttribute('aria-expanded', String(!state.settings.sidebarCollapsed));
  sidebarToggleButton.setAttribute('aria-label', state.settings.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
  if (sidebarToggleIcon) {
    sidebarToggleIcon.className = `fa-solid ${state.settings.sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`;
  }
}

function navigateFromSidebar(view) {
  navigateToView(view);
  if (isMobileSidebarLayout()) {
    setMobileSidebarOpen(false);
  }
}

function bindEvents() {
  searchInput.addEventListener('input', () => {
    state.searchTerm = searchInput.value.trim().toLowerCase();
    queueVisiblePageFetch(0);
  });

  clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    state.searchTerm = '';
    searchInput.focus();
    queueVisiblePageFetch(0);
  });

  backButton.addEventListener('click', () => navigateToView(state.browseView));
  navHome.addEventListener('click', () => navigateFromSidebar('home'));
  navLibrary.addEventListener('click', () => navigateFromSidebar('library'));
  navFavorites.addEventListener('click', () => navigateFromSidebar('favorites'));
  navWanted.addEventListener('click', () => navigateFromSidebar('wanted'));
  navSettings.addEventListener('click', () => navigateFromSidebar('settings'));
  sidebarToggleButton.addEventListener('click', () => {
    if (isMobileSidebarLayout()) {
      setMobileSidebarOpen(false);
      return;
    }
    updateSetting('sidebarCollapsed', !state.settings.sidebarCollapsed, true);
  });
  mobileSidebarButton.addEventListener('click', () => setMobileSidebarOpen(true));
  sidebarOverlay.addEventListener('click', () => setMobileSidebarOpen(false));
  window.addEventListener('resize', () => {
    if (!isMobileSidebarLayout()) {
      setMobileSidebarOpen(false);
    }
    updateSidebarToggleButton();
    renderSidebar();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('mobile-sidebar-open')) {
      setMobileSidebarOpen(false);
    }
  });
  libraryTabFolders.addEventListener('click', () => setLibraryTab('folders'));
  libraryTabAlbums.addEventListener('click', () => setLibraryTab('albums'));
  libraryTabArtists.addEventListener('click', () => setLibraryTab('artists'));
  libraryTabTracks.addEventListener('click', () => setLibraryTab('tracks'));
  libraryTabPlaylists.addEventListener('click', () => setLibraryTab('playlists'));
  settingsTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-settings-tab]');
    if (!button) return;
    state.settingsTab = button.dataset.settingsTab;
    renderSettingsView();
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
    if (state.route.view === 'wanted') {
      const wantedLimit = state.wantedPage.limit || state.settings.libraryPageSize || 50;
      const wantedOffset = button.dataset.libraryPageAction === 'next'
        ? state.wantedPage.offset + wantedLimit
        : Math.max(0, state.wantedPage.offset - wantedLimit);
      loadWantedAlbumsPage(wantedOffset).catch((error) => console.error(error));
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
    loadLibraryPage(offset).catch((error) => console.error(error));
  });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-artist-page-action]');
    if (!button) return;
    const limit = state.artistPage.limit || state.settings.libraryPageSize || 50;
    const offset = button.dataset.artistPageAction === 'next'
      ? state.artistPage.offset + limit
      : Math.max(0, state.artistPage.offset - limit);
    loadArtistPage(offset).catch((error) => console.error(error));
  });
  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-library-page-size]');
    if (!select) return;
    updateSetting('libraryPageSize', Number(select.value), true);
    if (state.route.view === 'wanted') {
      loadWantedAlbumsPage(0).catch((error) => console.error(error));
    } else {
      if (state.route.view === 'library' && state.libraryTab === 'tracks') {
        loadTrackPage(0).catch((error) => console.error(error));
      } else {
        loadLibraryPage(0).catch((error) => console.error(error));
      }
    }
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
  lyricsEditorModal.addEventListener('click', (event) => {
    if (event.target.closest('#lyrics-editor-close-button') || event.target.closest('#lyrics-editor-cancel-button')) {
      closeLyricsEditor();
      return;
    }
    if (event.target.closest('#lyrics-editor-save-button')) {
      saveLyricsEditor().catch((error) => {
        setLyricsEditorStatus(error.message || 'Unable to save lyrics.');
      });
      return;
    }
    if (event.target.closest('#lyrics-editor-reset-button')) {
      resetLyricsEditor().catch((error) => {
        setLyricsEditorStatus(error.message || 'Unable to reset lyrics.');
      });
      return;
    }
    if (!event.target.closest('#lyrics-scraper-search-button')) return;
    searchLyricsSuggestions().catch((error) => {
      setLyricsEditorStatus(error.message || 'Unable to search lyrics.');
    });
  });
  lyricsEditorModal.addEventListener('keydown', (event) => {
    if (!event.target.closest('#lyrics-scraper-query')) return;
    if (event.key !== 'Enter') return;
    event.preventDefault();
    searchLyricsSuggestions().catch((error) => {
      setLyricsEditorStatus(error.message || 'Unable to search lyrics.');
    });
  });
  editArtistButton.addEventListener('click', () => {
    const artist = getCurrentArtist();
    if (!artist) return;
    openArtistEditor(artist);
  });
  artistEditorOverlay.addEventListener('click', closeArtistEditor);
  artistEditorModal.addEventListener('click', (event) => {
    if (event.target.closest('#artist-editor-close-button') || event.target.closest('#artist-editor-cancel-button')) {
      closeArtistEditor();
      return;
    }
    if (event.target.closest('#artist-editor-save-button')) {
      saveArtistEditor().catch((error) => {
        syncArtistEditorRefs();
        if (!artistBioInput) return;
        artistBioInput.setCustomValidity(error.message || 'Unable to save artist info.');
        artistBioInput.reportValidity();
        artistBioInput.setCustomValidity('');
      });
      return;
    }
    if (event.target.closest('#artist-editor-reset-button')) {
      resetArtistEditor().catch((error) => {
        syncArtistEditorRefs();
        if (!artistBioInput) return;
        artistBioInput.setCustomValidity(error.message || 'Unable to clear artist info.');
        artistBioInput.reportValidity();
        artistBioInput.setCustomValidity('');
      });
    }
  });
  tagEditorModal.addEventListener('input', (event) => {
    if (!event.target.closest('#tag-album-cover-url')) return;
    syncTagEditorCoverPreview();
  });
  tagEditorModal.addEventListener('click', (event) => {
    if (event.target.closest('#tag-editor-close-button') || event.target.closest('#tag-editor-cancel-button')) {
      closeTagEditor();
      return;
    }
    if (event.target.closest('#tag-editor-save-button')) {
      saveTagEditor().catch((error) => {
        setTagEditorStatus(error.message || 'Unable to save album tags.');
      });
      return;
    }
    if (event.target.closest('#tag-editor-reset-button')) {
      resetTagEditor().catch((error) => {
        setTagEditorStatus(error.message || 'Unable to reset album tags.');
      });
      return;
    }
    if (!event.target.closest('#tag-scraper-search-button')) return;
    searchTagSuggestions().catch((error) => {
      setTagEditorStatus(error.message || 'Unable to search MusicBrainz.');
    });
  });
  tagEditorModal.addEventListener('keydown', (event) => {
    if (!event.target.closest('#tag-scraper-query')) return;
    if (event.key !== 'Enter') return;
    event.preventDefault();
    searchTagSuggestions().catch((error) => {
      setTagEditorStatus(error.message || 'Unable to search MusicBrainz.');
    });
  });
  queueDownloadButton.addEventListener('click', () => {
    downloadQueueTracks().catch((error) => console.error(error));
  });
  fullscreenDownloadLink.addEventListener('click', (event) => {
    event.preventDefault();
    const track = getCurrentTrack();
    if (!track) return;
    triggerTrackDownload(track);
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

  playAlbumButton.addEventListener('click', () => {
    const album = getCurrentAlbum();
    if (!album) return;
    const tracks = getAlbumTracks(album.id);
    if (tracks.length === 0) return;
    state.shuffleActive = false;
    rebuildShuffledQueue();
    playTrack(tracks[0], tracks);
  });

  queueAlbumButton.addEventListener('click', () => {
    const album = getCurrentAlbum();
    if (!album) return;
    addTracksToQueue(getAlbumTracks(album.id));
  });

  shuffleAlbumButton.addEventListener('click', () => {
    const album = getCurrentAlbum();
    if (!album) return;
    const tracks = getAlbumTracks(album.id);
    if (tracks.length === 0) return;
    state.shuffleActive = true;
    playTrack(tracks[0], tracks);
  });

  editAlbumCoverButton.addEventListener('click', () => {
    const album = getCurrentAlbum();
    if (!album) return;
    openTagEditor(album).catch((error) => console.error(error));
  });

  favoriteAlbumButton.addEventListener('click', () => {
    const album = getCurrentAlbum();
    if (!album) return;
    toggleFavoriteAlbum(album.id);
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
    updateMediaSessionPlaybackState();
    updatePlayerUi();
    render();
  });
  audioPlayer.addEventListener('pause', () => {
    stopLyricsTicker();
    updateMediaSessionPlaybackState();
    updateProgressUi();
    updatePlayerUi();
    render();
  });
  audioPlayer.addEventListener('loadedmetadata', () => {
    updateProgressUi();
    updateMediaSessionPositionState();
    updateFullscreenLyricsHighlight({ forceScroll: true });
  });
  audioPlayer.addEventListener('timeupdate', () => {
    updateProgressUi();
    updateMediaSessionPositionState();
    maybePersistPlaybackProgress();
  });
  audioPlayer.addEventListener('ended', () => {
    stopLyricsTicker();
    handleTrackEnded();
  });

  progressBar.addEventListener('click', (event) => {
    if (!Number.isFinite(audioPlayer.duration) || audioPlayer.duration <= 0) return;
    const ratio = getRelativePointerPosition(event, progressBar);
    audioPlayer.currentTime = audioPlayer.duration * ratio;
    updateProgressUi();
    persistPlaybackState();
  });

  bindVolumeControl(volumeBar);
  fullscreenProgressBar.addEventListener('click', (event) => {
    if (!Number.isFinite(audioPlayer.duration) || audioPlayer.duration <= 0) return;
    const ratio = getRelativePointerPosition(event, fullscreenProgressBar);
    audioPlayer.currentTime = audioPlayer.duration * ratio;
    updateProgressUi();
    persistPlaybackState();
  });
  bindVolumeControl(fullscreenVolumeBar);

  fullscreenVolumeButton.addEventListener('click', toggleMute);
  window.addEventListener('hashchange', () => {
    updateRouteFromLocation();
    persistPlaybackState({ includeTime: false });
    render();
  });

  window.addEventListener('pagehide', () => persistPlaybackState());
  window.addEventListener('beforeunload', () => persistPlaybackState());
}

function hydrateLibrary(config, library) {
  state.title = config.title || state.title;
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
  appTitle.textContent = getDisplayTitle();
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
    state.albumTracksMap.set(
      album.id,
      album.trackIds.map((id) => state.trackMap.get(id)).filter(Boolean).sort(compareTrackOrder),
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
  if (state.route.view === 'wanted') {
    loadWantedAlbumsPage(offset).catch((error) => console.error(error));
    return;
  }
  if (state.route.view === 'library' && state.libraryTab === 'folders') {
    state.folderCache.clear();
    loadFolderListing('').catch((error) => console.error(error));
    render();
    return;
  }
  if (state.route.view === 'library' && state.libraryTab === 'artists') {
    queueArtistPageFetch(offset);
    return;
  }
  if (state.route.view === 'library' && state.libraryTab === 'tracks') {
    queueTrackPageFetch(offset);
    return;
  }
  queueLibraryPageFetch(offset);
}

async function loadLibraryPage(offset = 0) {
  const library = await fetchLibraryPagePayload(offset);
  hydrateLibrary({ title: state.title }, library);
  sanitizeStoredFavorites();
  render();
  updatePlayerUi();
}

async function loadHomeAlbums() {
  if (state.searchTerm) return;
  const library = await fetchJson('/api/home-albums?limit=50');
  mergeLibraryData(library);
  state.homeAlbumIds = getRandomAlbumIds(library.albums || [], 50);
  if (state.route.view === 'home') {
    render();
  }
}

async function loadWantedAlbumsPage(offset = 0) {
  const params = new URLSearchParams({
    limit: String(state.settings.libraryPageSize || 50),
    offset: String(Math.max(0, offset)),
  });
  if (state.searchTerm) {
    params.set('search', state.searchTerm);
  }
  const library = await fetchJson(`/api/wanted-albums?${params.toString()}`);
  mergeLibraryData(library);
  state.wantedAlbums = library.albums || [];
  state.wantedPage = library.page || {
    limit: state.settings.libraryPageSize || 50,
    offset: 0,
    total: state.wantedAlbums.length,
    hasNext: false,
    hasPrevious: false,
  };
  state.wantedAlbumsLoaded = true;
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

async function loadArtistPage(offset = 0) {
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

  if (['home', 'library', 'favorites', 'wanted', 'settings'].includes(storedPlayback.browseView)) {
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
  const hash = window.location.hash.replace(/^#/, '');
  const albumMatch = /^album\/(.+)$/u.exec(hash);
  const artistMatch = /^artist\/(.+)$/u.exec(hash);

  if (hash === 'fullscreen') {
    state.route = {
      view: 'fullscreen',
      albumId: null,
      artistName: null,
    };
  } else if (albumMatch && state.albumMap.has(decodeURIComponent(albumMatch[1]))) {
    state.route = {
      view: 'album',
      albumId: decodeURIComponent(albumMatch[1]),
      artistName: null,
    };
  } else if (artistMatch) {
    const artistName = decodeURIComponent(artistMatch[1]);
    state.route = {
      view: 'artist',
      albumId: null,
      artistName,
    };
    loadArtistLibrary(artistName)
      .then(() => render())
      .catch((error) => console.error(error));
  } else {
    state.route = {
      view: state.browseView,
      albumId: null,
      artistName: null,
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

  state.route = { view, albumId: null, artistName: null };
  persistPlaybackState({ includeTime: false });
  render();
  if (view === 'home') {
    loadHomeAlbums().catch((error) => console.error(error));
  }
}

function openAlbum(albumId) {
  window.location.hash = `album/${encodeURIComponent(albumId)}`;
  scrollPageToTop();
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
  loadArtistLibrary(artistName).catch((error) => console.error(error));
  window.location.hash = `artist/${encodeURIComponent(artistName)}`;
}

function openFullscreenPlayer() {
  if (!state.currentTrackId) return;
  state.fullscreenReturnHash = window.location.hash && window.location.hash !== '#fullscreen'
    ? window.location.hash
    : '';
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
  const filteredTracks = getFilteredTracks();
  const filteredAlbums = getFilteredAlbums(filteredTracks);
  const homeAlbums = getHomeAlbums(filteredAlbums);
  const currentAlbum = getCurrentAlbum();
  const currentArtist = getCurrentArtist();
  const isAlbumView = state.route.view === 'album' && !!currentAlbum;
  const isArtistView = state.route.view === 'artist';
  const isFavoritesView = state.route.view === 'favorites';
  const isWantedView = state.route.view === 'wanted';
  const isSettingsView = state.route.view === 'settings';
  const isFullscreenView = state.route.view === 'fullscreen';
  const isLibraryView = state.route.view === 'library' && !isAlbumView && !isArtistView;
  const isHomeView = state.route.view === 'home' && !isAlbumView && !isArtistView;

  renderSidebar({
    albumTotal: state.libraryTotals.albums || filteredAlbums.length,
    trackTotal: state.libraryTotals.tracks || filteredTracks.length,
  });

  homeView.hidden = !isHomeView;
  libraryView.hidden = !isLibraryView;
  favoritesView.hidden = !isFavoritesView;
  wantedView.hidden = !isWantedView;
  settingsView.hidden = !isSettingsView;
  artistView.hidden = !isArtistView;
  albumView.hidden = !isAlbumView;
  fullscreenOverlay.hidden = !isFullscreenView;
  backButton.hidden = !isAlbumView && !isArtistView;
  clearSearchButton.hidden = !state.searchTerm;
  homeHero.hidden = !isHomeView || !state.settings.showHomeBanner;
  document.body.dataset.view = state.route.view;

  navHome.classList.toggle('is-active', state.route.view === 'home');
  navLibrary.classList.toggle('is-active', state.route.view === 'library');
  navFavorites.classList.toggle('is-active', state.route.view === 'favorites');
  navWanted.classList.toggle('is-active', state.route.view === 'wanted');
  navSettings.classList.toggle('is-active', state.route.view === 'settings');

  homeAlbumCaption.textContent = state.searchTerm
    ? `Albums matching "${state.searchTerm}"`
    : state.route.view === 'library'
      ? 'Everything currently indexed on your server.'
      : '';

  if (isAlbumView) {
    renderAlbumDetail(currentAlbum);
  } else if (isArtistView) {
    renderArtistDetail(currentArtist);
  } else if (isLibraryView) {
    renderLibraryView(filteredTracks, filteredAlbums);
  } else if (isFavoritesView) {
    renderFavoritesView(filteredTracks);
  } else if (isWantedView) {
    renderWantedView();
  } else if (isSettingsView) {
    renderSettingsView();
  } else if (isFullscreenView) {
    renderFullscreenView();
  } else {
    renderAlbumCollection(albumGrid, homeAlbums, 'No albums matched this search.', { pageable: true });
  }

  renderQueuePanel();
}

function renderFavoritesView(filteredTracks) {
  const favoriteAlbums = state.albums.filter((album) => isFavoriteAlbum(album.id) && albumMatchesSearch(album));
  const favoriteTracks = filteredTracks.filter((track) => isFavoriteTrack(track.id));

  favoriteAlbumCaption.textContent = state.searchTerm
    ? `Favorite albums matching "${state.searchTerm}"`
    : 'Albums you marked for quick access.';
  favoriteTrackCaption.textContent = state.searchTerm
    ? `Favorite tracks matching "${state.searchTerm}"`
    : 'Tracks you marked for quick access.';

  renderAlbumCollection(favoriteAlbumGrid, favoriteAlbums, 'No favorite albums yet.');
  renderTrackCollection(favoriteTrackList, favoriteTracks, favoriteTracks, 'No favorite tracks yet.');
}

function renderWantedView() {
  wantedAlbumCaption.textContent = state.searchTerm
    ? `Wanted albums matching "${state.searchTerm}"`
    : 'Albums marked as Wanted in your local album tags.';
  wantedAlbumGrid.innerHTML = '';

  if (!state.wantedAlbumsLoaded) {
    wantedAlbumGrid.append(createEmptyState('Loading wanted albums...'));
    loadWantedAlbumsPage(0).catch((error) => {
      console.error(error);
      wantedAlbumGrid.innerHTML = '';
      wantedAlbumGrid.append(createEmptyState('Unable to load wanted albums.'));
    });
    return;
  }

  renderAlbumCollection(wantedAlbumGrid, state.wantedAlbums, 'No wanted albums yet.', {
    pagerType: 'wanted',
  });
}

function renderSettingsView() {
  preservePageScroll(() => {
    renderSettingsTabs();

    if (state.settingsTab === 'appearance' && renderAppearanceSettingsReact()) {
      settingsStatus.textContent = '';
      return;
    }
    if (state.settingsTab === 'interface' && renderInterfaceSettingsReact()) {
      settingsStatus.textContent = '';
      return;
    }
    if (renderRemainingSettingsReact(state.settingsTab)) {
      settingsStatus.textContent = '';
      return;
    }

    unmountSettingsReactPanel();
    const renderer = {
      appearance: renderAppearanceSettings,
      interface: renderInterfaceSettings,
      audio: renderAudioSettings,
      downloads: renderDownloadSettings,
      instances: renderInstanceSettings,
      system: renderSystemSettings,
    }[state.settingsTab] || renderAppearanceSettings;

    settingsPanels.innerHTML = renderer();
    settingsStatus.textContent = '';
  });
}

function unmountSettingsReactPanel() {
  if (!settingsReactPanelContainer) return;
  window.MonochromeReact?.unmount?.(settingsReactPanelContainer);
  settingsReactPanelContainer = null;
  settingsReactPanelTab = '';
}

function ensureSettingsReactPanel(tab) {
  if (settingsReactPanelContainer && settingsReactPanelTab === tab) {
    return settingsReactPanelContainer;
  }
  unmountSettingsReactPanel();
  settingsPanels.innerHTML = `<div class="settings-react-panel" data-settings-react-panel="${escapeHtml(tab)}"></div>`;
  settingsReactPanelContainer = settingsPanels.querySelector(`[data-settings-react-panel="${tab}"]`);
  settingsReactPanelTab = tab;
  return settingsReactPanelContainer;
}

function renderAppearanceSettingsReact() {
  if (!window.MonochromeReact?.renderAppearanceSettings) return false;
  settingsReactPanelContainer = ensureSettingsReactPanel('appearance');
  window.MonochromeReact.renderAppearanceSettings(settingsReactPanelContainer, {
    settings: { ...state.settings },
    title: state.title,
    themeOptions: ['system', 'black', 'white', 'dark', 'ocean', 'purple', 'forest', 'mocha', 'macchiato', 'frappe', 'latte', 'custom'].map((theme) => ({
      value: theme,
      label: toTitleCase(theme),
      accent: getThemeAccent(theme),
    })),
    fontOptions: [
      ['jakarta', 'Plus Jakarta Sans'],
      ['inter', 'Inter'],
      ['system', 'System UI'],
      ['mono', 'Monospace'],
      ['serif', 'Serif'],
    ],
    customThemeBaseOptions: [
      ['dark', 'Dark'],
      ['light', 'Light'],
    ],
    preview: getAlbumCardSizePreviewData(),
  });
  return true;
}

function renderInterfaceSettingsReact() {
  if (!window.MonochromeReact?.renderInterfaceSettings) return false;
  settingsReactPanelContainer = ensureSettingsReactPanel('interface');
  window.MonochromeReact.renderInterfaceSettings(settingsReactPanelContainer, {
    settings: { ...state.settings },
    libraryPageSizeOptions: [[25, '25'], [50, '50'], [100, '100']],
    nowPlayingClickOptions: [
      ['album', 'Go To Album'],
      ['fullscreen', 'Go To Now Playing'],
      ['artist', 'Go To Artist'],
      ['none', 'Do Nothing'],
    ],
  });
  return true;
}

function renderRemainingSettingsReact(tab) {
  const rendererName = {
    audio: 'renderAudioSettings',
    downloads: 'renderDownloadSettings',
    instances: 'renderInstanceSettings',
    system: 'renderSystemSettings',
  }[tab];
  if (!rendererName || !window.MonochromeReact?.[rendererName]) return false;

  settingsReactPanelContainer = ensureSettingsReactPanel(tab);
  window.MonochromeReact[rendererName](settingsReactPanelContainer, getReactSettingsPanelProps(tab));
  return true;
}

function getReactSettingsPanelProps(tab) {
  const base = {
    settings: { ...state.settings },
  };

  if (tab === 'audio') {
    return {
      ...base,
      playerLayoutOptions: [
        ['floating', 'Floating Player'],
        ['qobuz', 'Edge-to-Edge'],
      ],
    };
  }

  if (tab === 'downloads') {
    return {
      ...base,
      downloadQualityOptions: [
        ['original', 'Original Local File'],
        ['hires', 'Hi-Res Lossless (label only)'],
        ['lossless', 'Lossless (label only)'],
        ['mp3', 'MP3 Compatible (label only)'],
      ],
      bulkDownloadOptions: [['browser', 'Browser Downloads'], ['queue', 'Queue One-by-One']],
    };
  }

  if (tab === 'instances') {
    return {
      ...base,
      instanceUrl: state.settings.instanceUrl || window.location.origin,
      instancePlaceholder: window.location.origin,
      currentApiText: `${window.location.origin} · ${state.tracks.length} tracks · ${state.albums.length} albums`,
      debugText: JSON.stringify({
        route: state.route.view,
        libraryGeneratedAt: state.generatedAt,
        queueLength: state.queueIds.length,
      }, null, 2),
    };
  }

  if (tab === 'system') {
    const folders = state.libraryFolders || { available: [], selected: [], scan: null };
    const effectiveSelectedFolders = state.pendingLibraryFolders || folders.selected || [];
    const scan = folders.scan || {};
    const percent = Number.isFinite(scan.percent) ? scan.percent : 0;
    return {
      ...base,
      folders: {
        available: folders.available || [],
        selected: effectiveSelectedFolders,
      },
      selectedLabel: effectiveSelectedFolders.length ? effectiveSelectedFolders.join(', ') : 'No folders selected yet',
      scan: {
        statusLabel: toTitleCase(scan.status || 'idle'),
        percent,
        currentFolder: scan.currentFolder || '',
        processed: Number.isFinite(scan.processedFiles) ? scan.processedFiles : 0,
        total: Number.isFinite(scan.totalFiles) ? scan.totalFiles : 0,
        reused: Number.isFinite(scan.reusedFiles) ? scan.reusedFiles : 0,
        parsed: Number.isFinite(scan.parsedFiles) ? scan.parsedFiles : 0,
      },
      stats: {
        tracks: state.libraryTotals.tracks || state.tracks.length,
        albums: state.libraryTotals.albums || state.albums.length,
      },
    };
  }

  return base;
}

function renderSettingsTabs() {
  if (window.MonochromeReact?.renderSettingsTabs) {
    window.MonochromeReact.renderSettingsTabs(settingsTabs, {
      tabs: SETTINGS_TABS,
      activeTab: state.settingsTab,
    });
    return;
  }

  settingsTabs.innerHTML = SETTINGS_TABS.map(([id, label]) => {
    const active = state.settingsTab === id;
    return `<button class="settings-tab${active ? ' is-active' : ''}" type="button" role="tab" aria-selected="${active}" data-settings-tab="${id}">${label}</button>`;
  }).join('');
}

function renderAppearanceSettings() {
  return `
    ${settingsGroup('Theme', 'Choose your preferred color scheme.', `
      <div class="theme-grid">
        ${['system', 'black', 'white', 'dark', 'ocean', 'purple', 'forest', 'mocha', 'macchiato', 'frappe', 'latte', 'custom'].map((theme) => `
          <button type="button" class="theme-swatch${state.settings.theme === theme ? ' is-active' : ''}" data-setting-value="theme" data-value="${theme}">
            <span style="--swatch-color: ${escapeHtml(getThemeAccent(theme))}"></span>
            ${toTitleCase(theme)}
          </button>
        `).join('')}
      </div>
      <div class="settings-field theme-custom-field">
        <span>Custom Theme</span>
        <div class="theme-custom-controls">
          <label>
            <span>Accent</span>
            <input type="color" data-setting="customAccent" value="${escapeHtml(state.settings.customAccent)}" />
          </label>
          <label>
            <span>Base</span>
            <select data-setting="customThemeBase">
              ${selectOptions([
                ['dark', 'Dark'],
                ['light', 'Light'],
              ], state.settings.customThemeBase)}
            </select>
          </label>
        </div>
      </div>
    `)}
    ${settingsGroup('Font', 'Choose from presets. Custom Google Font URLs can still be added in code later if we want full upstream parity.', `
      <label class="settings-field">
        <span>Font Preset</span>
        <select data-setting="fontPreset">
          ${selectOptions([
            ['jakarta', 'Plus Jakarta Sans'],
            ['inter', 'Inter'],
            ['system', 'System UI'],
            ['mono', 'Monospace'],
            ['serif', 'Serif'],
          ], state.settings.fontPreset)}
        </select>
      </label>
      <label class="settings-field">
        <span>Font Size <strong>${state.settings.fontSize}%</strong></span>
        <input type="range" min="75" max="140" step="5" data-setting="fontSize" value="${state.settings.fontSize}" />
      </label>
    `)}
    ${settingsGroup('Text', 'Rename the app and the home banner without editing config files.', `
      <div class="settings-field library-title-field">
        <div class="library-title-label">
          <label class="settings-inline-toggle">
            <input type="checkbox" data-setting="showLibraryTitle" ${state.settings.showLibraryTitle ? 'checked' : ''} />
            <span>Show</span>
          </label>
          <span>Library Title</span>
        </div>
        <input type="text" data-setting="libraryTitle" value="${escapeHtml(state.settings.libraryTitle)}" placeholder="${escapeHtml(state.title)}" />
      </div>
      <label class="settings-field">
        <span>App / Browser Tab Icon URL</span>
        <input type="url" data-setting="appIconUrl" value="${escapeHtml(state.settings.appIconUrl)}" placeholder="/icon.png or https://example.com/icon.png" />
      </label>
      <div class="settings-field home-banner-field">
        <div class="home-banner-heading">
          <span>Home Banner</span>
          <label class="settings-inline-toggle">
            <span>Show</span>
            <input type="checkbox" data-setting="showHomeBanner" ${state.settings.showHomeBanner ? 'checked' : ''} />
          </label>
        </div>
        <div class="home-banner-controls">
          <label>
            <span>Eyebrow</span>
            <input type="text" data-setting="homeBannerEyebrow" value="${escapeHtml(state.settings.homeBannerEyebrow)}" />
          </label>
          <label>
            <span>Title</span>
            <input type="text" data-setting="homeBannerTitle" value="${escapeHtml(state.settings.homeBannerTitle)}" />
          </label>
          <label>
            <span>Subtitle</span>
            <input type="text" data-setting="homeBannerSubtitle" value="${escapeHtml(state.settings.homeBannerSubtitle)}" />
          </label>
        </div>
      </div>
    `)}
    ${renderVisualSettings()}
  `;
}

function renderVisualSettings() {
  return `
    <section class="settings-group visuals-settings-group">
      <div class="settings-group-heading">
        <h4>Visuals</h4>
        <p>Local equivalents of Monochrome appearance toggles.</p>
        ${renderAlbumCardSizePreview()}
      </div>
      <div class="settings-group-body">
        <div class="settings-field album-card-size-field">
          <span>Album Card Size <strong>${state.settings.albumCardSize}px</strong></span>
          <div class="album-card-size-controls">
            <input type="range" min="145" max="230" step="5" data-setting="albumCardSize" value="${state.settings.albumCardSize}" />
          </div>
        </div>
        ${settingToggle('albumCoverBackground', 'Album Cover Background', 'Use cover art as the blurred album-page backdrop.')}
        ${settingToggle('dynamicColors', 'Dynamic Colors', 'Reserved for future cover-palette accents. Your custom accent is used today.')}
        ${settingToggle('compactArtists', 'Compact Artists', 'Use smaller artist cards in the artist browser.')}
      </div>
    </section>
  `;
}

function renderInterfaceSettings() {
  return `
    ${settingsGroup('Sidebar', 'Choose which local navigation links are visible.', `
      ${settingToggle('showHome', 'Show Home in Sidebar', 'Display the Home link in sidebar navigation.')}
      ${settingToggle('showLibrary', 'Show Library in Sidebar', 'Display the Library link in sidebar navigation.')}
      ${settingToggle('showFavorites', 'Show Favorites in Sidebar', 'Display the Favorites link in sidebar navigation.')}
      ${settingToggle('sidebarCollapsed', 'Collapse Sidebar', 'Use icon-only navigation and compact sidebar status.')}
      <div class="setting-row is-disabled">
        <div><strong>Show Settings in Sidebar</strong><span>Always visible so you cannot lock yourself out.</span></div>
        <span class="settings-pill">Always on</span>
      </div>
    `)}
    ${settingsGroup('Navigation', 'Interaction behavior adapted to this local app.', `
      ${settingToggle('closePanelsOnNavigation', 'Close Panels on Navigation', 'Close queue and editor panels when switching views.')}
      <label class="settings-field">
        <span>Library Albums Per Page</span>
        <select data-setting="libraryPageSize">
          ${selectOptions([[25, '25'], [50, '50'], [100, '100']], state.settings.libraryPageSize)}
        </select>
      </label>
      <label class="settings-field">
        <span>Now Playing Click Action</span>
        <select data-setting="nowPlayingClickAction">
          ${selectOptions([
            ['album', 'Go To Album'],
            ['fullscreen', 'Go To Now Playing'],
            ['artist', 'Go To Artist'],
            ['none', 'Do Nothing'],
          ], state.settings.nowPlayingClickAction)}
        </select>
      </label>
    `)}
  `;
}

function renderAudioSettings() {
  return `
    ${settingsGroup('Playback', 'Controls that work with the browser audio element and your local files.', `
      <label class="settings-field">
        <span>Player Layout</span>
        <select data-setting="playerLayout">
          ${selectOptions([
            ['floating', 'Floating Player'],
            ['qobuz', 'Edge-to-Edge'],
          ], state.settings.playerLayout)}
        </select>
      </label>
      ${settingToggle('showQualityInfo', 'Show Quality Badges', 'Show the audio quality block in the player.')}
      ${settingToggle('gaplessPlayback', 'Autoplay Queue', 'Automatically continue to the next queued track when one ends.')}
    `)}
  `;
}

function renderDownloadSettings() {
  return `
    ${settingsGroup('Downloads', 'Direct browser downloads for your local files.', `
      <label class="settings-field">
        <span>Download Quality</span>
        <select data-setting="downloadQuality">
          ${selectOptions([
            ['original', 'Original Local File'],
            ['hires', 'Hi-Res Lossless (label only)'],
            ['lossless', 'Lossless (label only)'],
            ['mp3', 'MP3 Compatible (label only)'],
          ], state.settings.downloadQuality)}
        </select>
      </label>
      <label class="settings-field">
        <span>Bulk Download Method</span>
        <select data-setting="bulkDownloadMethod">
          ${selectOptions([['browser', 'Browser Downloads'], ['queue', 'Queue One-by-One']], state.settings.bulkDownloadMethod)}
        </select>
      </label>
      <label class="settings-field">
        <span>Filename Template</span>
        <input type="text" data-setting="filenameTemplate" value="${escapeHtml(state.settings.filenameTemplate)}" />
      </label>
      <label class="settings-field">
        <span>Folder Template</span>
        <input type="text" data-setting="folderTemplate" value="${escapeHtml(state.settings.folderTemplate)}" />
      </label>
      <p class="settings-help">Available: {discNumber}, {trackNumber}, {artist}, {title}, {album}, {albumArtist}, {year}. Browser security may ignore folders in the download name.</p>
      ${settingToggle('includeCoverFile', 'Include Cover File', 'Stored preference for future ZIP/export downloads.')}
      ${settingToggle('generateM3u', 'Generate M3U', 'Stored preference for future playlist exports.')}
      ${settingToggle('generateJson', 'Generate JSON', 'Stored preference for future metadata exports.')}
    `)}
  `;
}

function renderInstanceSettings() {
  const instanceUrl = state.settings.instanceUrl || window.location.origin;
  return `
    ${settingsGroup('Local Instance', 'Manage the API instance this browser is using.', `
      <label class="settings-field">
        <span>Instance URL</span>
        <input type="url" data-setting="instanceUrl" value="${escapeHtml(instanceUrl)}" placeholder="${escapeHtml(window.location.origin)}" />
      </label>
      <div class="setting-row">
        <div><strong>Current API</strong><span>${escapeHtml(window.location.origin)} · ${state.tracks.length} tracks · ${state.albums.length} albums</span></div>
        <button type="button" class="secondary-button" data-settings-action="check-instance">Check</button>
      </div>
      ${settingToggle('devMode', 'Dev Mode', 'Show local API details for debugging this self-hosted app.')}
    `)}
    ${state.settings.devMode ? settingsGroup('Debug', 'Read-only runtime information.', `
      <div class="settings-code">${escapeHtml(JSON.stringify({
        route: state.route.view,
        libraryGeneratedAt: state.generatedAt,
        queueLength: state.queueIds.length,
      }, null, 2))}</div>
    `) : ''}
  `;
}

function renderSystemSettings() {
  const folders = state.libraryFolders || { available: [], selected: [], scan: null };
  const effectiveSelectedFolders = state.pendingLibraryFolders || folders.selected || [];
  const selectedFolders = new Set(effectiveSelectedFolders);
  const folderRows = folders.available?.length
    ? folders.available.map((folder) => `
      <label class="library-folder-option">
        <input type="checkbox" data-library-folder="${escapeHtml(folder)}" ${selectedFolders.has(folder) ? 'checked' : ''} />
        <span>${escapeHtml(folder)}</span>
      </label>
    `).join('')
    : '<p class="settings-help">No top-level folders were found in the mounted music folder.</p>';
  const scan = folders.scan || {};
  const selectedLabel = effectiveSelectedFolders.length ? effectiveSelectedFolders.join(', ') : 'No folders selected yet';
  const percent = Number.isFinite(scan.percent) ? scan.percent : 0;
  const processed = Number.isFinite(scan.processedFiles) ? scan.processedFiles : 0;
  const total = Number.isFinite(scan.totalFiles) ? scan.totalFiles : 0;
  const reused = Number.isFinite(scan.reusedFiles) ? scan.reusedFiles : 0;
  const parsed = Number.isFinite(scan.parsedFiles) ? scan.parsedFiles : 0;

  return `
    ${settingsGroup('Scan Status', 'Watch the current scan and choose which folders are included.', `
      <div class="setting-row scan-status-row">
        <div>
          <strong>${escapeHtml(toTitleCase(scan.status || 'idle'))} · ${percent}%</strong>
          <span>${escapeHtml(scan.currentFolder ? `Scanning ${scan.currentFolder}` : selectedLabel)} · ${processed}/${total} files · ${reused} cached · ${parsed} parsed · ${state.libraryTotals.tracks || state.tracks.length} tracks · ${state.libraryTotals.albums || state.albums.length} albums</span>
        </div>
        <button type="button" class="secondary-button" data-settings-action="refresh-library-folders">Refresh Folders</button>
      </div>
      <div class="scan-progress" aria-label="Scan progress">
        <span style="width: ${percent}%"></span>
      </div>
      <p class="settings-help" data-library-folder-summary>Selected folders: ${escapeHtml(selectedLabel)}</p>
    `)}
    ${settingsGroup('Library Folders', 'Choose which top-level folders inside your mounted music folder should be indexed.', `
      <div class="library-folder-list">${folderRows}</div>
      <div class="settings-actions">
        <button type="button" class="secondary-button" data-settings-action="save-library-folders">Save Selected Folders</button>
        <button type="button" class="primary-button" data-settings-action="save-and-scan-library-folders">Save & Scan</button>
      </div>
      <p class="settings-help">Tip: start with one artist folder, scan, then add more folders after the app is stable.</p>
    `)}
    ${settingsGroup('Library System', 'Maintenance for your local index and browser data.', `
      <div class="setting-row">
        <div><strong>Cache</strong><span>${state.settings.cacheEnabled ? 'Browser settings cache is enabled.' : 'Browser settings cache is disabled.'}</span></div>
        <button type="button" class="secondary-button" data-settings-action="clear-cache">Clear Cache</button>
      </div>
      ${settingToggle('cacheEnabled', 'Cache', 'Stores local settings and favorites in this browser.')}
      ${settingToggle('autoUpdate', 'Auto-Update App', 'Reserved for a future service worker reload flow.')}
      <div class="setting-row">
        <div><strong>Rescan Library</strong><span>Ask the server to index your music folder again.</span></div>
        <button type="button" class="secondary-button" data-settings-action="rescan-library">Rescan</button>
      </div>
    `)}
    ${settingsGroup('Backup & Restore', 'Export or import local UI settings as JSON.', `
      <div class="setting-row">
        <div><strong>Export All Settings</strong><span>Download appearance, interface, audio, download, instance, and system settings.</span></div>
        <div class="settings-actions">
          <button type="button" class="secondary-button" data-settings-action="export-settings">Export</button>
          <button type="button" class="secondary-button" data-settings-action="import-settings">Import</button>
        </div>
      </div>
      <div class="setting-row danger">
        <div><strong>Reset Local Data</strong><span>Clear settings, favorites, and playback state from this browser.</span></div>
        <button type="button" class="secondary-button" data-settings-action="reset-local-data">Reset</button>
      </div>
    `)}
  `;
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
    if (state.libraryTab === 'artists') {
      loadArtistPage(0).catch((error) => console.error(error));
    } else {
      loadLibraryPage(0).catch((error) => console.error(error));
    }
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
    persistSettings();
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
  if (state.libraryFolders?.scan?.status === 'scanning') {
    startScanStatusPolling(getScanPollDelay());
  }
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
    ...(key === 'nowPlayingClickAction' ? { nowPlayingClickActionUserSet: true } : {}),
  };
  persistSettings();
  applySettings();
  if (['showQualityInfo', 'playerLayout'].includes(key)) {
    updatePlayerUi();
  }
  if (!avoidFullRender) {
    render();
  }
}

function applySettings() {
  applyThemeSettings();
  document.documentElement.style.setProperty('--font-body', FONT_PRESETS[state.settings.fontPreset] || FONT_PRESETS.jakarta);
  document.documentElement.style.setProperty('--app-font-size', `${15 * (state.settings.fontSize / 100)}px`);
  document.documentElement.style.setProperty('--album-card-size', `${clampAlbumCardSize(state.settings.albumCardSize)}px`);
  document.body.classList.toggle('no-album-cover-background', !state.settings.albumCoverBackground);
  document.body.classList.toggle('compact-artists', state.settings.compactArtists);
  document.body.classList.toggle('player-layout-qobuz', state.settings.playerLayout === 'qobuz');

  const displayTitle = getDisplayTitle();
  appTitle.textContent = displayTitle;
  appTitle.hidden = !state.settings.showLibraryTitle;
  document.title = `${displayTitle} | Local Streamer`;
  homeHeroEyebrow.textContent = state.settings.homeBannerEyebrow || DEFAULT_SETTINGS.homeBannerEyebrow;
  homeHeroTitle.textContent = state.settings.homeBannerTitle || DEFAULT_SETTINGS.homeBannerTitle;
  homeHeroSubtitle.textContent = state.settings.homeBannerSubtitle || DEFAULT_SETTINGS.homeBannerSubtitle;

  navHome.hidden = !state.settings.showHome;
  navLibrary.hidden = !state.settings.showLibrary;
  navFavorites.hidden = !state.settings.showFavorites;
  navWanted.hidden = !state.settings.showFavorites;
  document.body.classList.toggle('sidebar-collapsed', Boolean(state.settings.sidebarCollapsed));
  updateSidebarToggleButton();

  audioPlayer.playbackRate = 1;
  audioPlayer.volume = state.volume;
  renderPlayerUtilityControls();
  applyAppIcon();
  renderSidebar();
  const currentTrack = state.trackMap.get(state.currentTrackId);
  if (currentTrack) {
    syncPlayerUtilityElementRefs();
  }
}

function applyThemeSettings() {
  const themeName = state.settings.theme === 'custom'
    ? (state.settings.customThemeBase === 'light' ? 'latte' : 'black')
    : state.settings.theme;
  const theme = THEME_PRESETS[themeName] || THEME_PRESETS.black;
  const accent = state.settings.theme === 'custom' ? state.settings.customAccent : theme.accent;
  const root = document.documentElement;
  const isLight = themeName === 'white' || themeName === 'latte';
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
  root.style.setProperty('--wanted-line', isLight
    ? 'color-mix(in srgb, var(--accent) 44%, transparent)'
    : 'color-mix(in srgb, var(--accent) 66%, rgba(255, 255, 255, 0.22))');
  root.style.setProperty('--wanted-surface', isLight
    ? 'color-mix(in srgb, var(--accent) 13%, transparent)'
    : 'color-mix(in srgb, var(--accent) 20%, transparent)');
  root.style.setProperty('--wanted-text', isLight
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

function settingsGroup(title, description, content) {
  return `
    <section class="settings-group">
      <div class="settings-group-heading">
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(description)}</p>
      </div>
      <div class="settings-group-body">${content}</div>
    </section>
  `;
}

function settingToggle(key, title, description) {
  return `
    <label class="setting-row">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(description)}</span>
      </div>
      <input type="checkbox" data-setting="${key}" ${state.settings[key] ? 'checked' : ''} />
    </label>
  `;
}

function renderAlbumCardSizePreview() {
  const previewAlbum = getAlbumCardSizePreviewData();
  return `
    <div class="album-card-size-preview" aria-label="Album card size preview">
      <article class="album-card compact album-card-sample" aria-hidden="true">
        <div class="album-card-media">
          ${previewAlbum.coverPlaceholderHtml}
          <button type="button" class="album-card-play" tabindex="-1" aria-label="Preview play button">
            ${previewAlbum.playIconHtml}
          </button>
        </div>
        <div class="meta">
          <h4>${escapeHtml(previewAlbum.title)}</h4>
          <p>${escapeHtml(previewAlbum.artist)}</p>
          <p class="album-card-year">${escapeHtml(previewAlbum.year)}</p>
          <div class="album-card-footer">
            <p class="album-card-format">${previewAlbum.mediaIconsHtml}</p>
          </div>
        </div>
      </article>
      <p class="settings-help">Preview uses the same card style as Home, Library, Favorites, and artist album grids.</p>
    </div>
  `;
}

function getAlbumCardSizePreviewData() {
  const previewAlbum = {
    title: 'Sampler Album',
    artist: getDisplayTitle(),
    year: '2026',
    mediaTypes: ['CD', 'Digital Media', 'Vinyl', 'Cassette Tape'],
    status: 'Collection',
  };
  return {
    ...previewAlbum,
    coverPlaceholderHtml: createCoverPlaceholder('Album'),
    playIconHtml: materialIcon('play'),
    mediaIconsHtml: renderMediaTypeIcons(previewAlbum),
  };
}

function selectOptions(options, selectedValue) {
  return options.map(([value, label]) => (
    `<option value="${escapeHtml(value)}" ${String(selectedValue) === String(value) ? 'selected' : ''}>${escapeHtml(label)}</option>`
  )).join('');
}

function clampAlbumCardSize(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_SETTINGS.albumCardSize;
  return Math.min(230, Math.max(145, parsed));
}

function getThemeAccent(themeName) {
  if (themeName === 'custom') return state.settings.customAccent;
  return THEME_PRESETS[themeName]?.accent || THEME_PRESETS.black.accent;
}

function toTitleCase(value) {
  return String(value).replace(/(^|\s|-)\w/gu, (match) => match.toUpperCase());
}

function showSettingsStatus(message) {
  settingsStatus.textContent = message;
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
  window.MonochromeReact?.renderSidebar(appSidebar, {
    title: getDisplayTitle(),
    showTitle: state.settings.showLibraryTitle,
    activeView: state.route.view,
    settings: { ...state.settings },
    albumCount: albumTotal,
    trackCount: trackTotal,
    scan: getSidebarScanInfo(indexedAt),
    mobile: isMobileSidebarLayout(),
    onNavigate: navigateFromSidebar,
    onToggle: () => {
      if (isMobileSidebarLayout()) {
        setMobileSidebarOpen(false);
        return;
      }
      updateSetting('sidebarCollapsed', !state.settings.sidebarCollapsed, true);
    },
  });
}

function updateSidebarScanStatus(indexedAt = state.generatedAt) {
  renderSidebar({ indexedAt });
}

function setLibraryTab(tab) {
  state.libraryTab = tab;
  if (tab === 'folders') {
    loadFolderListing('').catch((error) => console.error(error));
  }
  if (tab === 'artists') {
    loadArtistPage(0).catch((error) => console.error(error));
  }
  if (tab === 'tracks' && state.searchTerm) {
    loadTrackPage(0).catch((error) => console.error(error));
  }
  render();
  scrollPageToTop();
}

function renderLibraryView(filteredTracks, filteredAlbums) {
  const tabs = [
    ['folders', libraryTabFolders, libraryPanelFolders],
    ['albums', libraryTabAlbums, libraryPanelAlbums],
    ['artists', libraryTabArtists, libraryPanelArtists],
    ['tracks', libraryTabTracks, libraryPanelTracks],
    ['playlists', libraryTabPlaylists, libraryPanelPlaylists],
  ];

  for (const [tabId, button, panel] of tabs) {
    const active = state.libraryTab === tabId;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
    panel.hidden = !active;
  }

  if (state.libraryTab === 'folders') {
    libraryBrowserCaption.textContent = 'Browse the exact folder structure from your local server.';
    renderFolderBrowser(filteredTracks);
  } else if (state.libraryTab === 'albums') {
    libraryBrowserCaption.textContent = 'Browse your scanned releases as album cards.';
    renderLibraryAlbumsPanel(filteredAlbums);
  } else if (state.libraryTab === 'artists') {
    libraryBrowserCaption.textContent = 'Browse the library grouped by album artist.';
    renderArtistsBrowser(filteredTracks);
  } else if (state.libraryTab === 'tracks') {
    libraryBrowserCaption.textContent = 'Search tracks directly without loading the whole library.';
    renderLibraryTracksPanel();
  } else {
    libraryBrowserCaption.textContent = 'Smart playlists built from your local library state.';
    renderPlaylistsBrowser(filteredTracks);
  }
}

function renderLibraryAlbumsPanel(albums) {
  const visibleAlbums = filterAlbumsByMediaType(albums);
  window.MonochromeReact?.renderAlbumCollection(libraryPanelAlbums, {
    albums: visibleAlbums.slice(0, RENDER_LIMITS.albums).map(prepareAlbumCardForReact),
    emptyMessage: 'No albums matched this filter.',
    compact: true,
    wrapGrid: true,
    showFilter: true,
    showPager: true,
    pager: {
      ...state.libraryPage,
      total: state.libraryPage.total ?? state.libraryTotals.albums ?? visibleAlbums.length,
    },
    itemLabel: 'album',
    showPageSize: true,
    alphabetFilters: ALPHABET_FILTERS,
    activeLetter: state.alphabetFilter,
    mediaTypes: getMediaTypeFilterOptions(),
    activeMediaTypes: [...state.mediaTypeFilters],
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
    onPageSize: (size) => {
      updateSetting('libraryPageSize', Number(size), true);
      loadLibraryPage(0).catch((error) => console.error(error));
    },
  });
}

function renderFolderBrowser(filteredTracks) {
  const listing = state.folderCache.get('') || null;

  window.MonochromeReact?.renderFolderBrowser(libraryPanelFolders, {
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

function renderArtistsBrowser(filteredTracks) {
  libraryPanelArtists.innerHTML = '';
  libraryPanelArtists.append(createLibraryFilterBar({ mediaType: false }));

  const artists = state.artistGroups;
  if (artists.length === 0) {
    libraryPanelArtists.append(createEmptyState('No artists matched this filter.'));
    libraryPanelArtists.append(createArtistPager());
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'artist-card-grid';
  renderArtistCards(grid, artists.slice(0, RENDER_LIMITS.artists));
  libraryPanelArtists.append(grid);
  libraryPanelArtists.append(createArtistPager());
}

function renderLibraryTracksPanel() {
  libraryPanelTracks.innerHTML = '';
  libraryPanelTracks.append(createLibraryFilterBar({ mediaType: false }));

  const tracks = state.libraryTrackResults || [];
  if (!state.searchTerm) {
    libraryPanelTracks.append(createEmptyState('Search for a track title, artist, album, or file path to show tracks here.'));
    return;
  }

  if (tracks.length === 0) {
    libraryPanelTracks.append(createEmptyState('No tracks matched this search.'));
    libraryPanelTracks.append(createTrackPager());
    return;
  }

  const list = document.createElement('div');
  list.className = 'track-list library-track-search-list';
  renderTrackRows(list, tracks.slice(0, RENDER_LIMITS.tracks), tracks, { variant: 'standard', showAlbum: true });
  libraryPanelTracks.append(list);
  libraryPanelTracks.append(createTrackPager());
}

function renderPlaylistsBrowser(filteredTracks) {
  const playlists = getSmartPlaylists(filteredTracks);
  if (!playlists.some((playlist) => playlist.id === state.selectedPlaylistId)) {
    state.selectedPlaylistId = playlists[0]?.id ?? 'favorites-tracks';
  }

  window.MonochromeReact?.renderPlaylistBrowser(libraryPanelPlaylists, {
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

function renderArtistCards(container, artists) {
  const root = document.createElement('div');
  root.className = 'artist-grid-react';
  container.append(root);

  for (const artist of artists.slice(0, 24)) {
    loadArtistInfo(artist.name);
  }

  window.MonochromeReact?.renderArtistGrid(root, {
    artists: artists.map(prepareArtistCardForReact),
    onOpen: openArtist,
  });
}

function prepareArtistCardForReact(artist) {
  const info = state.artistInfoMap.get(artist.name) || null;
  return {
    name: artist.name,
    imageUrl: info?.imageUrl || '',
    placeholderHtml: createArtistPlaceholder(artist.name),
  };
}

function renderArtistDetail(artist) {
  if (!artist) {
    const artistName = state.route.artistName || 'Artist';
    artistDetailName.textContent = artistName;
    artistDetailMeta.textContent = 'Loading artist library...';
    artistDetailBio.textContent = 'Loading albums and tracks from the database.';
    artistAlbumGrid.innerHTML = '<p class="empty-state">Loading artist albums...</p>';
    setImageOrFallback({
      imageElement: artistDetailImage,
      fallbackElement: artistDetailFallback,
      src: '',
      alt: `${artistName} artist image`,
    });
    artistDetailFallback.innerHTML = createArtistPlaceholderContent(artistName);
    artistHero.style.removeProperty('--artist-image');
    artistDetailSource.hidden = true;
    editArtistButton.innerHTML = materialIcon('edit');
    loadArtistLibrary(artistName)
      .then(() => render())
      .catch((error) => console.error(error));
    return;
  }

  const info = state.artistInfoMap.get(artist.name) || null;

  artistDetailName.textContent = artist.name;
  artistDetailMeta.textContent = `${artist.albums.length} album${artist.albums.length === 1 ? '' : 's'} • ${artist.tracks.length} track${artist.tracks.length === 1 ? '' : 's'}`;
  artistAlbumsTitle.textContent = `${artist.name} Albums`;
  artistAlbumsCaption.textContent = 'Albums from this artist in your local library.';

  setImageOrFallback({
    imageElement: artistDetailImage,
    fallbackElement: artistDetailFallback,
    src: info?.imageUrl || '',
    alt: `${artist.name} artist image`,
  });
  artistDetailFallback.innerHTML = createArtistPlaceholderContent(artist.name);

  if (info?.imageUrl) {
    artistHero.style.setProperty('--artist-image', `url("${info.imageUrl}")`);
  } else {
    artistHero.style.removeProperty('--artist-image');
  }

  artistDetailBio.textContent = info?.bio || 'Artist information is loading. You can also add this artist manually in artist-info.json.';
  artistDetailSource.hidden = !info?.sourceUrl;
  artistDetailSource.href = info?.sourceUrl || '#';
  artistDetailSource.textContent = info?.source === 'wikipedia' ? 'Wikipedia' : 'Local source';
  editArtistButton.innerHTML = materialIcon('edit');
  editArtistButton.title = info?.imageUrl || info?.bio ? 'Edit artist image/info' : 'Add artist image/info';
  editArtistButton.setAttribute('aria-label', editArtistButton.title);

  artistAlbumGrid.innerHTML = '';
  renderAlbumCards(artistAlbumGrid, artist.albums, { compact: true });

  loadArtistInfo(artist.name);
}

function openArtistEditor(artist) {
  const info = state.artistInfoMap.get(artist.name) || null;
  state.artistEditorName = artist.name;
  renderEditorModalShell(artistEditorModal, {
    eyebrow: 'Artist Editor',
    title: `Edit ${artist.name}`,
    titleId: 'artist-editor-title',
    caption: 'Add an artist image and local profile info.',
    closeButtonId: 'artist-editor-close-button',
    closeLabel: 'Close artist editor',
    bodyRootId: 'artist-editor-body-root',
    resetButtonId: 'artist-editor-reset-button',
    resetLabel: 'Clear edited info',
    cancelButtonId: 'artist-editor-cancel-button',
    saveButtonId: 'artist-editor-save-button',
    saveLabel: 'Save artist',
  });
  renderArtistEditorBody({
    imageUrl: info?.imageUrl || '',
    bio: info?.bio || '',
    sourceUrl: info?.sourceUrl || '',
  });
  syncArtistEditorRefs();
  artistEditorModal.hidden = false;
  artistEditorOverlay.hidden = false;
  artistImageUrlInput?.focus();
}

function closeArtistEditor() {
  state.artistEditorName = '';
  artistEditorModal.hidden = true;
  artistEditorOverlay.hidden = true;
  window.MonochromeReact?.unmount?.(document.querySelector('#artist-editor-body-root'));
  window.MonochromeReact?.unmount?.(artistEditorModal);
  syncArtistEditorRefs();
}

function renderArtistEditorBody(props = {}) {
  const bodyRoot = document.querySelector('#artist-editor-body-root');
  if (!bodyRoot) return;
  window.MonochromeReact?.renderArtistEditorBody(bodyRoot, {
    renderKey: `${state.artistEditorName || 'artist'}-${Date.now()}`,
    ...props,
  });
}

function syncArtistEditorRefs() {
  artistImageUrlInput = document.querySelector('#artist-image-url');
  artistBioInput = document.querySelector('#artist-bio');
  artistSourceUrlInput = document.querySelector('#artist-source-url');
}

async function saveArtistEditor() {
  if (!state.artistEditorName) return;
  syncArtistEditorRefs();
  const saveButton = document.querySelector('#artist-editor-save-button');
  if (saveButton) saveButton.disabled = true;
  try {
    const info = await fetchJson(`/api/artists/${encodeURIComponent(state.artistEditorName)}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: artistImageUrlInput?.value.trim() || '',
        bio: artistBioInput?.value.trim() || '',
        sourceUrl: artistSourceUrlInput?.value.trim() || '',
      }),
    });
    state.artistInfoMap.set(state.artistEditorName, info);
    closeArtistEditor();
    render();
  } finally {
    if (saveButton) saveButton.disabled = false;
  }
}

async function resetArtistEditor() {
  if (!state.artistEditorName || !window.confirm('Clear edited artist image and info?')) return;
  syncArtistEditorRefs();
  const resetButton = document.querySelector('#artist-editor-reset-button');
  if (resetButton) resetButton.disabled = true;
  try {
    const info = await fetchJson(`/api/artists/${encodeURIComponent(state.artistEditorName)}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset: true }),
    });
    state.artistInfoMap.set(state.artistEditorName, info);
    closeArtistEditor();
    render();
  } finally {
    if (resetButton) resetButton.disabled = false;
  }
}

function renderAlbumCollection(container, albums, emptyMessage, { pageable = false, pagerType = '' } = {}) {
  const visibleAlbums = filterAlbumsByMediaType(albums);
  const page = pagerType === 'wanted' ? state.wantedPage : state.libraryPage;
  const itemLabel = pagerType === 'wanted' ? 'wanted album' : 'album';
  const showPager = pageable || Boolean(pagerType);

  window.MonochromeReact?.renderAlbumCollection(container, {
    albums: visibleAlbums.map(prepareAlbumCardForReact),
    emptyMessage,
    compact: false,
    showFilter: pageable,
    showPager,
    pager: {
      ...page,
      total: page?.total ?? visibleAlbums.length,
    },
    itemLabel,
    showPageSize: pageable || pagerType === 'wanted',
    alphabetFilters: ALPHABET_FILTERS,
    activeLetter: state.alphabetFilter,
    mediaTypes: getMediaTypeFilterOptions(),
    activeMediaTypes: [...state.mediaTypeFilters],
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
    onPageSize: (size) => {
      updateSetting('libraryPageSize', Number(size), true);
      if (pagerType === 'wanted') {
        loadWantedAlbumsPage(0).catch((error) => console.error(error));
      } else {
        loadLibraryPage(0).catch((error) => console.error(error));
      }
    },
  });
}

function renderAlbumCards(container, albums, { compact = false } = {}) {
  const root = document.createElement('div');
  root.className = 'album-grid-react';
  container.append(root);

  window.MonochromeReact?.renderAlbumGrid(root, {
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
  return {
    id: album.id,
    title: album.title || 'Untitled album',
    artist: album.artist || 'Unknown artist',
    year: album.year || 'Unknown year',
    status: album.status || 'Collection',
    coverUrl: album.coverUrl || '',
    wanted: isWantedAlbum(album),
    coverPlaceholderHtml: createCoverPlaceholder('Album'),
    audioBadgeHtml: renderAudioQualityBadge(album.audioQuality),
    mediaIconsHtml: renderMediaTypeIcons(album),
    playIconHtml: materialIcon('play'),
  };
}

function createAlphabetIndex() {
  const nav = document.createElement('div');
  nav.className = 'alphabet-index';
  nav.setAttribute('aria-label', 'Alphabet filter');
  for (const letter of ALPHABET_FILTERS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.alphabetFilter = letter;
    button.className = letter === state.alphabetFilter ? 'is-active' : '';
    button.textContent = letter === 'all' ? 'All' : letter;
    button.setAttribute('aria-pressed', String(letter === state.alphabetFilter));
    nav.append(button);
  }
  return nav;
}

function createLibraryFilterBar({ mediaType = true } = {}) {
  const bar = document.createElement('div');
  bar.className = 'library-filter-bar';
  bar.append(createAlphabetIndex());
  if (mediaType) {
    bar.append(createMediaTypeFilter());
  }
  return bar;
}

function getMediaTypeFilterOptions() {
  return Object.entries(MEDIA_TYPE_ICONS).map(([value, icon]) => ({ value, icon }));
}

function handleAlbumCollectionPage(type, direction) {
  const page = type === 'wanted' ? state.wantedPage : state.libraryPage;
  const limit = page.limit || state.settings.libraryPageSize || 50;
  const offset = direction === 'next'
    ? page.offset + limit
    : Math.max(0, page.offset - limit);
  if (type === 'wanted') {
    loadWantedAlbumsPage(offset).catch((error) => console.error(error));
    return;
  }
  loadLibraryPage(offset).catch((error) => console.error(error));
}

function createMediaTypeFilter() {
  const group = document.createElement('div');
  group.className = 'media-type-filter';
  group.setAttribute('aria-label', 'Filter albums by media type');
  group.innerHTML = MEDIA_TYPE_FILTERS
    .filter((mediaType) => mediaType !== 'all')
    .map((mediaType) => {
      const active = state.mediaTypeFilters.has(mediaType);
      return `
        <button
          type="button"
          class="${active ? 'is-active' : ''}"
          data-media-type-filter-toggle="${escapeHtml(mediaType)}"
          aria-label="${active ? 'Disable' : 'Enable'} ${escapeHtml(mediaType)} filter"
          aria-pressed="${active}"
          title="${escapeHtml(mediaType)}"
        >
          <i class="media-type-symbol" style="--media-type-icon: url('${escapeHtml(MEDIA_TYPE_ICONS[mediaType])}')" aria-hidden="true"></i>
        </button>
      `;
    })
    .join('');
  return group;
}

function toggleMediaTypeFilter(mediaType) {
  if (state.mediaTypeFilters.has(mediaType)) {
    state.mediaTypeFilters.delete(mediaType);
  } else {
    state.mediaTypeFilters.add(mediaType);
  }
  queueVisiblePageFetch(0);
}

function createEmptyState(message) {
  const empty = document.createElement('p');
  empty.className = 'empty-state';
  empty.textContent = message;
  return empty;
}

function createLibraryPager() {
  const page = state.libraryPage || {};
  const total = page.total ?? state.libraryTotals.albums ?? state.albums.length;
  const limit = page.limit || state.settings.libraryPageSize || 50;
  const offset = page.offset || 0;
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(total, offset + limit);
  const pager = document.createElement('div');
  pager.className = 'library-pager';
  pager.innerHTML = `
    <div>
      <strong>${start}-${end}</strong>
      <span>of ${total} album${total === 1 ? '' : 's'}</span>
    </div>
    <label>
      <span>Per page</span>
      <select data-library-page-size>
        ${selectOptions([[25, '25'], [50, '50'], [100, '100']], limit)}
      </select>
    </label>
    <button type="button" class="secondary-button" data-library-page-action="previous" ${page.hasPrevious ? '' : 'disabled'}>Previous</button>
    <button type="button" class="secondary-button" data-library-page-action="next" ${page.hasNext ? '' : 'disabled'}>Next</button>
  `;
  return pager;
}

function createWantedPager() {
  const page = state.wantedPage || {};
  const total = page.total ?? state.wantedAlbums.length;
  const limit = page.limit || state.settings.libraryPageSize || 50;
  const offset = page.offset || 0;
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(total, offset + limit);
  const pager = document.createElement('div');
  pager.className = 'library-pager';
  pager.innerHTML = `
    <div>
      <strong>${start}-${end}</strong>
      <span>of ${total} wanted album${total === 1 ? '' : 's'}</span>
    </div>
    <label>
      <span>Per page</span>
      <select data-library-page-size>
        ${selectOptions([[25, '25'], [50, '50'], [100, '100']], limit)}
      </select>
    </label>
    <button type="button" class="secondary-button" data-library-page-action="previous" ${page.hasPrevious ? '' : 'disabled'}>Previous</button>
    <button type="button" class="secondary-button" data-library-page-action="next" ${page.hasNext ? '' : 'disabled'}>Next</button>
  `;
  return pager;
}

function createArtistPager() {
  const page = state.artistPage || {};
  const total = page.total ?? state.artistGroups.length;
  const limit = page.limit || state.settings.libraryPageSize || 50;
  const offset = page.offset || 0;
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(total, offset + limit);
  const pager = document.createElement('div');
  pager.className = 'library-pager';
  pager.innerHTML = `
    <div>
      <strong>${start}-${end}</strong>
      <span>of ${total} artist${total === 1 ? '' : 's'}</span>
    </div>
    <button type="button" class="secondary-button" data-artist-page-action="previous" ${page.hasPrevious ? '' : 'disabled'}>Previous</button>
    <button type="button" class="secondary-button" data-artist-page-action="next" ${page.hasNext ? '' : 'disabled'}>Next</button>
  `;
  return pager;
}

function createTrackPager() {
  const page = state.trackPage || {};
  const total = page.total ?? state.libraryTrackResults.length;
  const limit = page.limit || state.settings.libraryPageSize || 50;
  const offset = page.offset || 0;
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(total, offset + limit);
  const pager = document.createElement('div');
  pager.className = 'library-pager';
  pager.innerHTML = `
    <div>
      <strong>${start}-${end}</strong>
      <span>of ${total} track${total === 1 ? '' : 's'}</span>
    </div>
    <button type="button" class="secondary-button" data-library-page-action="previous" ${page.hasPrevious ? '' : 'disabled'}>Previous</button>
    <button type="button" class="secondary-button" data-library-page-action="next" ${page.hasNext ? '' : 'disabled'}>Next</button>
  `;
  return pager;
}

function renderTrackCollection(container, tracks, queueTracks, emptyMessage) {
  container.innerHTML = '';

  if (tracks.length === 0) {
    container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    return;
  }

  renderTrackRows(container, tracks.slice(0, RENDER_LIMITS.tracks), queueTracks, { variant: 'standard' });
  appendLimitNotice(container, tracks.length, RENDER_LIMITS.tracks, 'tracks');
}

function renderTrackRows(container, tracks, queueTracks, { variant = 'standard', showAlbum = true } = {}) {
  const root = document.createElement('div');
  root.className = 'track-list-react';
  container.append(root);

  window.MonochromeReact?.renderTrackList(root, {
    tracks: tracks.map(prepareTrackRowForReact),
    variant,
    showAlbum,
    onPlay: (trackId, options = {}) => {
      const track = state.trackMap.get(trackId);
      if (!track) return;
      if (options.toggle && track.id === state.currentTrackId) {
        togglePlayback();
        return;
      }
      const nextQueue = getQueueTracksForRenderedRow(track, queueTracks, variant);
      playTrack(track, nextQueue);
    },
    onFavorite: toggleFavoriteTrack,
    onAddQueue: (trackId) => {
      const track = state.trackMap.get(trackId);
      if (track) addTracksToQueue([track]);
    },
    onArtistClick: (artistName) => {
      if (artistName) openArtist(artistName);
    },
  });
}

function prepareTrackRowForReact(track) {
  const favorite = isFavoriteTrack(track.id);
  const playing = track.id === state.currentTrackId && !audioPlayer.paused;
  return {
    id: track.id,
    title: track.title || 'Untitled track',
    artist: track.artist || 'Unknown artist',
    album: track.album || 'Unknown album',
    trackNumber: track.trackNumber,
    folderPath: getTrackFolderPath(track.relativePath || ''),
    coverUrl: track.coverUrl || '',
    favorite,
    playing,
    active: track.id === state.currentTrackId,
    coverPlaceholderHtml: createCoverPlaceholder('Track', 'track-thumb-placeholder'),
    favoriteIconHtml: materialIcon('favorite', { filled: favorite }),
    addQueueIconHtml: materialIcon('addQueue'),
    playIconHtml: materialIcon(playing ? 'pause' : 'play'),
  };
}

function getQueueTracksForRenderedRow(track, queueTracks, variant) {
  if (variant === 'album') return [track];
  return Array.isArray(queueTracks) && queueTracks.length > 0 ? queueTracks : [track];
}

function createLimitNotice(total, shown, label) {
  const notice = document.createElement('p');
  notice.className = 'render-limit-notice';
  notice.textContent = total > shown
    ? `Showing ${shown} of ${total} ${label}. Use search or select fewer folders to narrow this view.`
    : '';
  notice.hidden = total <= shown;
  return notice;
}

function appendLimitNotice(container, total, shown, label) {
  if (total <= shown) return;
  container.append(createLimitNotice(total, shown, label));
}

function renderAlbumDetail(album) {
  if (!album) {
    navigateToView(state.browseView);
    return;
  }

  const albumTracks = getAlbumTracks(album.id).filter((track) => trackMatchesSearch(track));
  const allAlbumTracks = getAlbumTracks(album.id);
  const heroTrack = allAlbumTracks[0] ?? null;
  const sameArtistAlbums = state.albums.filter((candidate) => candidate.artist === album.artist && candidate.id !== album.id);
  const [epAlbums, fullAlbums] = partitionAlbums(sameArtistAlbums);
  const favorite = isFavoriteAlbum(album.id);
  const albumFacts = formatAlbumFacts(album);
  const wantedClass = isWantedAlbum(album) ? ' is-wanted' : '';
  const albumFolder = getAlbumFolderPath(allAlbumTracks);

  window.MonochromeReact?.renderAlbumDetail(albumView, {
    album: {
      id: album.id,
      title: album.title,
      artist: album.artist,
      coverUrl: album.coverUrl || heroTrack?.coverUrl || '',
      coverBackdrop: album.coverUrl || heroTrack?.coverUrl || '',
      folder: albumFolder,
      meta: [
        ...albumFacts,
        `${allAlbumTracks.length} track${allAlbumTracks.length === 1 ? '' : 's'}`,
        state.searchTerm ? `filtered by "${state.searchTerm}"` : '',
      ].filter(Boolean).join(' • '),
    },
    tracks: albumTracks.map(prepareTrackRowForReact),
    relatedAlbums: fullAlbums.slice(0, RENDER_LIMITS.albums).map(prepareAlbumCardForReact),
    epAlbums: epAlbums.slice(0, RENDER_LIMITS.albums).map(prepareAlbumCardForReact),
    favorite,
    canQueue: allAlbumTracks.length > 0,
    formatHtml: `
      <span class="album-detail-format-card${wantedClass}">
        ${renderMediaTypeIcons(album, { includeLabels: true })}
      </span>
      ${renderAudioQualityBadge(album.audioQuality, { includeLabel: true })}
    `,
    coverPlaceholderHtml: createCoverPlaceholder('Album'),
    favoriteIconHtml: materialIcon('favorite', { filled: favorite }),
    editIconHtml: materialIcon('edit'),
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

function renderRelatedAlbums({ section, titleElement, grid, albums, title }) {
  grid.innerHTML = '';

  if (albums.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  titleElement.textContent = title;
  renderAlbumCards(grid, albums.slice(0, RENDER_LIMITS.albums), { compact: true });
  appendLimitNotice(grid, albums.length, RENDER_LIMITS.albums, 'albums');
}

function renderQueuePanel() {
  queuePanel.hidden = !state.queueOpen;
  queueOverlay.hidden = !state.queueOpen;

  if (!state.queueOpen) {
    window.MonochromeReact?.unmount?.(queuePanel);
    return;
  }

  const queueIds = getPlaybackQueue();
  const queue = queueIds.map((id) => state.trackMap.get(id)).filter(Boolean);

  window.MonochromeReact?.renderQueuePanel(queuePanel, {
    open: state.queueOpen,
    tracks: queue.slice(0, RENDER_LIMITS.queue).map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      coverUrl: track.coverUrl || '',
    })),
    icons: {
      download: playerIcon('download'),
      favorite: materialIcon('favorite'),
      clear: playerIcon('clearQueue'),
      close: materialIcon('close'),
    },
    total: queue.length,
    limit: RENDER_LIMITS.queue,
    currentTrackId: state.currentTrackId || '',
    favoriteTrackIds: [...state.favoriteTrackIds],
    onClose: closeQueuePanel,
    onDownload: () => downloadQueueTracks().catch((error) => console.error(error)),
    onFavoriteQueue: () => favoriteTracks(getPlaybackQueue()),
    onClear: clearQueue,
    onPlay: (trackId) => playTrackById(trackId),
    onFavorite: (trackId) => toggleFavoriteTrack(trackId),
    onRemove: (trackId) => removeTrackFromQueue(trackId),
    onReorder: (dragTrackId, targetTrackId) => reorderQueue(dragTrackId, targetTrackId),
  });
}

function playAlbumFromCard(album) {
  const tracks = getAlbumTracks(album.id);
  if (tracks.length === 0) return;
  state.shuffleActive = false;
  rebuildShuffledQueue();
  playTrack(tracks[0], tracks);
}

function renderEditorModalShell(container, props) {
  window.MonochromeReact?.renderEditorModal(container, props);
}

async function openTagEditor(album) {
  state.tagEditorAlbumId = album.id;
  state.tagEditorMusicBrainzId = album.musicBrainzId || '';
  state.tagEditorSuggestions = [];

  const tracks = await ensureAlbumTracks(album);
  renderEditorModalShell(tagEditorModal, {
    eyebrow: 'Album Tag Editor',
    title: `Edit ${album.title}`,
    titleId: 'tag-editor-title',
    caption: 'These edits are saved as local overrides. Your original audio files are not rewritten.',
    closeButtonId: 'tag-editor-close-button',
    closeLabel: 'Close tag editor',
    bodyRootId: 'tag-editor-body-root',
    resetButtonId: 'tag-editor-reset-button',
    resetLabel: 'Reset overrides',
    cancelButtonId: 'tag-editor-cancel-button',
    saveButtonId: 'tag-editor-save-button',
    saveLabel: 'Save tags',
  });

  renderAlbumTagEditorBody({
    title: album.title || '',
    albumArtist: album.albumArtist || album.artist || '',
    year: album.year || extractYear(album.date) || '',
    genre: album.genre || '',
    mediaTypes: album.mediaTypes || album.mediaType || ['Digital Media'],
    status: album.status || 'Collection',
    coverUrl: album.customCoverUrl || album.coverUrl || '',
    searchQuery: `${album.artist || ''} ${album.title || ''}`.trim(),
    scraperStatus: 'Search MusicBrainz to fill this album automatically.',
    tracks,
  });
  syncTagEditorRefs();
  syncTagEditorCoverPreview();

  tagEditorModal.hidden = false;
  tagEditorOverlay.hidden = false;
  tagAlbumTitleInput?.focus();
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
  state.tagEditorMusicBrainzId = '';
  state.tagEditorSuggestions = [];
  tagEditorModal.hidden = true;
  tagEditorOverlay.hidden = true;
  window.MonochromeReact?.unmount?.(document.querySelector('#tag-editor-body-root'));
  window.MonochromeReact?.unmount?.(tagEditorModal);
  syncTagEditorRefs();
}

function renderAlbumTagEditorBody(props = {}) {
  const bodyRoot = document.querySelector('#tag-editor-body-root');
  if (!bodyRoot) return;
  window.MonochromeReact?.renderAlbumTagEditorBody(bodyRoot, {
    renderKey: `${state.tagEditorAlbumId || 'album'}-${Date.now()}`,
    ...props,
  });
}

function syncTagEditorRefs() {
  tagAlbumTitleInput = document.querySelector('#tag-album-title');
  tagAlbumArtistInput = document.querySelector('#tag-album-artist');
  tagAlbumDateInput = document.querySelector('#tag-album-date');
  tagAlbumGenreInput = document.querySelector('#tag-album-genre');
  tagAlbumMediaTypesInput = document.querySelector('#tag-album-media-types');
  tagAlbumStatusInput = document.querySelector('#tag-album-status');
  tagAlbumCoverUrlInput = document.querySelector('#tag-album-cover-url');
  tagEditorCoverPreview = document.querySelector('#tag-editor-cover-preview');
  tagEditorCoverFallback = document.querySelector('#tag-editor-cover-fallback');
  tagScraperQueryInput = document.querySelector('#tag-scraper-query');
  tagScraperSearchButton = document.querySelector('#tag-scraper-search-button');
  tagScraperStatus = document.querySelector('#tag-scraper-status');
  tagScraperResults = document.querySelector('#tag-scraper-results');
  tagTrackList = document.querySelector('#tag-track-list');
}

function setTagEditorStatus(message) {
  syncTagEditorRefs();
  if (tagScraperStatus) {
    tagScraperStatus.textContent = message || '';
  }
}

function syncTagEditorCoverPreview() {
  syncTagEditorRefs();
  if (!tagEditorCoverPreview || !tagEditorCoverFallback || !tagAlbumCoverUrlInput) return;
  setImageOrFallback({
    imageElement: tagEditorCoverPreview,
    fallbackElement: tagEditorCoverFallback,
    src: tagAlbumCoverUrlInput.value.trim(),
    alt: `${tagAlbumTitleInput.value || 'Album'} cover art`,
  });
}

async function searchTagSuggestions() {
  const albumId = state.tagEditorAlbumId;
  if (!albumId) return;
  syncTagEditorRefs();
  if (!tagScraperSearchButton || !tagScraperQueryInput || !tagScraperResults) return;

  tagScraperSearchButton.disabled = true;
  setTagEditorStatus('Searching MusicBrainz...');
  tagScraperResults.innerHTML = '';

  try {
    const query = tagScraperQueryInput.value.trim();
    const result = await fetchJson(`/api/albums/${encodeURIComponent(albumId)}/tag-suggestions?q=${encodeURIComponent(query)}`);
    state.tagEditorSuggestions = result.suggestions || [];
    renderTagSuggestions();
    setTagEditorStatus(state.tagEditorSuggestions.length
      ? `Found ${state.tagEditorSuggestions.length} possible release${state.tagEditorSuggestions.length === 1 ? '' : 's'}.`
      : 'No MusicBrainz releases found. Try a simpler artist + album search.');
  } finally {
    tagScraperSearchButton.disabled = false;
  }
}

function renderTagSuggestions() {
  syncTagEditorRefs();
  if (!tagScraperResults) return;
  tagScraperResults.innerHTML = '';

  for (const suggestion of state.tagEditorSuggestions) {
    const card = document.createElement('article');
    card.className = 'tag-suggestion-card';
    card.innerHTML = `
      ${suggestion.coverUrl
        ? `<img src="${suggestion.coverUrl}" alt="${escapeHtml(suggestion.title)} cover art" loading="lazy">`
        : createCoverPlaceholder('Track', 'track-thumb-placeholder')}
      <div>
        <strong>${escapeHtml(suggestion.title || 'Untitled release')}</strong>
        <span>${escapeHtml(suggestion.artist || 'Unknown artist')}</span>
        <small>${escapeHtml([suggestion.date, suggestion.country, suggestion.status].filter(Boolean).join(' • '))}</small>
      </div>
      <button type="button" class="secondary-button">Apply</button>
    `;

    card.querySelector('button').addEventListener('click', () => {
      applyTagSuggestion(suggestion).catch((error) => {
        setTagEditorStatus(error.message || 'Unable to apply MusicBrainz result.');
      });
    });
    tagScraperResults.append(card);
  }
}

async function applyTagSuggestion(suggestion) {
  syncTagEditorRefs();
  setTagEditorStatus(`Loading track list for ${suggestion.title}...`);
  const detail = await fetchJson(`/api/musicbrainz/releases/${encodeURIComponent(suggestion.id)}`);
  state.tagEditorMusicBrainzId = detail.id || suggestion.id || '';
  if (!tagAlbumTitleInput || !tagAlbumArtistInput || !tagAlbumDateInput || !tagAlbumGenreInput || !tagAlbumCoverUrlInput || !tagTrackList) return;

  tagAlbumTitleInput.value = detail.albumTitle || suggestion.title || tagAlbumTitleInput.value;
  tagAlbumArtistInput.value = detail.albumArtist || suggestion.artist || tagAlbumArtistInput.value;
  tagAlbumDateInput.value = detail.year || extractYear(detail.date || suggestion.date) || tagAlbumDateInput.value;
  tagAlbumGenreInput.value = detail.genre || tagAlbumGenreInput.value;
  tagAlbumCoverUrlInput.value = detail.coverUrl || suggestion.coverUrl || tagAlbumCoverUrlInput.value;
  syncTagEditorCoverPreview();

  const rows = [...tagTrackList.querySelectorAll('.tag-track-row')];
  for (const [index, row] of rows.entries()) {
    const track = detail.tracks?.[index];
    if (!track) continue;
    row.querySelector('.tag-track-title').value = track.title || row.querySelector('.tag-track-title').value;
    row.querySelector('.tag-track-artist').value = track.artist || row.querySelector('.tag-track-artist').value;
    row.querySelector('.tag-track-number').value = track.trackNumber || index + 1;
    row.dataset.discNumber = String(track.discNumber || row.dataset.discNumber || 1);
  }

  setTagEditorStatus(`Applied MusicBrainz release${detail.sourceUrl ? `: ${detail.sourceUrl}` : '.'}`);
}

async function saveTagEditor() {
  const albumId = state.tagEditorAlbumId;
  if (!albumId) return;
  syncTagEditorRefs();

  const saveButton = document.querySelector('#tag-editor-save-button');
  if (saveButton) saveButton.disabled = true;
  setTagEditorStatus('Saving local tag overrides...');

  try {
    const payload = collectTagEditorPayload();
    setTagEditorStatus('Saving local tag overrides...');
    const result = await fetchJson(`/api/albums/${encodeURIComponent(albumId)}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    hydrateLibrary({ title: state.title }, result.library);
    state.wantedAlbumsLoaded = false;
    sanitizeStoredFavorites();
    closeTagEditor();
    render();
    updatePlayerUi();
  } finally {
    if (saveButton) saveButton.disabled = false;
  }
}

async function resetTagEditor() {
  const albumId = state.tagEditorAlbumId;
  if (!albumId || !window.confirm('Clear all local tag overrides for this album?')) return;
  syncTagEditorRefs();

  const resetButton = document.querySelector('#tag-editor-reset-button');
  if (resetButton) resetButton.disabled = true;
  setTagEditorStatus('Resetting local tag overrides...');

  try {
    const result = await fetchJson(`/api/albums/${encodeURIComponent(albumId)}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset: true }),
    });
    hydrateLibrary({ title: state.title }, result.library);
    state.wantedAlbumsLoaded = false;
    sanitizeStoredFavorites();
    closeTagEditor();
    render();
    updatePlayerUi();
  } finally {
    if (resetButton) resetButton.disabled = false;
  }
}

function collectTagEditorPayload() {
  syncTagEditorRefs();
  const tracks = tagTrackList ? [...tagTrackList.querySelectorAll('.tag-track-row')].map((row) => ({
    id: row.dataset.trackId,
    title: row.querySelector('.tag-track-title').value.trim(),
    artist: row.querySelector('.tag-track-artist').value.trim(),
    trackNumber: row.querySelector('.tag-track-number').value.trim(),
    discNumber: row.dataset.discNumber || '1',
  })) : [];

  return {
    albumTitle: tagAlbumTitleInput?.value.trim() || '',
    albumArtist: tagAlbumArtistInput?.value.trim() || '',
    date: tagAlbumDateInput?.value.trim() || '',
    year: tagAlbumDateInput?.value.trim() || '',
    genre: tagAlbumGenreInput?.value.trim() || '',
    mediaTypes: getSelectedMediaTypes(),
    status: tagAlbumStatusInput?.value || 'Collection',
    coverUrl: tagAlbumCoverUrlInput?.value.trim() || '',
    musicBrainzId: state.tagEditorMusicBrainzId,
    tracks,
  };
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

function openLyricsEditor(track) {
  state.lyricsEditorTrackId = track.id;
  state.lyricsSuggestions = [];
  const cachedLyrics = state.lyricsMap.get(track.id);
  renderEditorModalShell(lyricsEditorModal, {
    eyebrow: 'Lyrics Editor',
    title: `Lyrics for ${track.title}`,
    titleId: 'lyrics-editor-title',
    caption: `${track.artist} • ${track.album}`,
    closeButtonId: 'lyrics-editor-close-button',
    closeLabel: 'Close lyrics editor',
    bodyRootId: 'lyrics-editor-body-root',
    bodyRootClassName: 'tag-editor-body lyrics-editor-body',
    resetButtonId: 'lyrics-editor-reset-button',
    resetLabel: 'Reset lyrics',
    cancelButtonId: 'lyrics-editor-cancel-button',
    saveButtonId: 'lyrics-editor-save-button',
    saveLabel: 'Save lyrics',
  });
  renderLyricsEditorBody({
    query: `${track.artist} ${track.title}`,
    syncedLyrics: cachedLyrics?.syncedLyrics || '',
    plainLyrics: cachedLyrics?.plainLyrics || '',
    status: 'Search LRCLIB for synced or plain lyrics.',
  });
  lyricsEditorOverlay.hidden = false;
  lyricsEditorModal.hidden = false;
  loadTrackLyrics(track.id, { force: true })
    .then(() => {
      const lyrics = state.lyricsMap.get(track.id);
      syncLyricsEditorRefs();
      if (lyricsSyncedInput) lyricsSyncedInput.value = lyrics?.syncedLyrics || lyricsSyncedInput.value;
      if (lyricsPlainInput) lyricsPlainInput.value = lyrics?.plainLyrics || lyricsPlainInput.value;
    })
    .catch((error) => {
      setLyricsEditorStatus(error.message || 'Unable to load saved lyrics.');
    });
}

function closeLyricsEditor() {
  state.lyricsEditorTrackId = '';
  state.lyricsSuggestions = [];
  window.MonochromeReact?.unmount?.(document.querySelector('#lyrics-editor-body-root'));
  window.MonochromeReact?.unmount?.(lyricsEditorModal);
  lyricsEditorOverlay.hidden = true;
  lyricsEditorModal.hidden = true;
}

function renderLyricsEditorBody(props = {}) {
  const bodyRoot = document.querySelector('#lyrics-editor-body-root');
  if (!bodyRoot) return;
  if (window.MonochromeReact?.renderLyricsEditorBody) {
    window.MonochromeReact.renderLyricsEditorBody(bodyRoot, {
      renderKey: `lyrics-${state.lyricsEditorTrackId}-${Date.now()}`,
      ...props,
    });
    syncLyricsEditorRefs();
    window.requestAnimationFrame(syncLyricsEditorRefs);
    return;
  }

  bodyRoot.innerHTML = `
    <section class="tag-scraper-panel">
      <div class="tag-scraper-search">
        <label>
          <span>Online search</span>
          <input id="lyrics-scraper-query" type="search" autocomplete="off" value="${escapeHtml(props.query || '')}" />
        </label>
        <button id="lyrics-scraper-search-button" class="secondary-button" type="button">Search LRCLIB</button>
      </div>
      <p id="lyrics-scraper-status" class="tag-scraper-status">${escapeHtml(props.status || 'Search LRCLIB for synced or plain lyrics.')}</p>
      <div id="lyrics-scraper-results" class="tag-scraper-results"></div>
    </section>
    <form class="lyrics-editor-form">
      <label>
        <span>Synced lyrics (LRC)</span>
        <textarea id="lyrics-synced-input" rows="12" placeholder="[00:12.50] First lyric line">${escapeHtml(props.syncedLyrics || '')}</textarea>
      </label>
      <label>
        <span>Plain lyrics</span>
        <textarea id="lyrics-plain-input" rows="12" placeholder="Paste plain lyrics here...">${escapeHtml(props.plainLyrics || '')}</textarea>
      </label>
    </form>
  `;
  syncLyricsEditorRefs();
}

function syncLyricsEditorRefs() {
  lyricsSyncedInput = document.querySelector('#lyrics-synced-input');
  lyricsPlainInput = document.querySelector('#lyrics-plain-input');
  lyricsScraperQueryInput = document.querySelector('#lyrics-scraper-query');
  lyricsScraperSearchButton = document.querySelector('#lyrics-scraper-search-button');
  lyricsScraperStatus = document.querySelector('#lyrics-scraper-status');
  lyricsScraperResults = document.querySelector('#lyrics-scraper-results');
}

function setLyricsEditorStatus(message) {
  syncLyricsEditorRefs();
  if (lyricsScraperStatus) lyricsScraperStatus.textContent = message;
}

async function searchLyricsSuggestions() {
  const trackId = state.lyricsEditorTrackId;
  if (!trackId) return;
  syncLyricsEditorRefs();
  if (lyricsScraperSearchButton) lyricsScraperSearchButton.disabled = true;
  setLyricsEditorStatus('Searching LRCLIB...');
  if (lyricsScraperResults) lyricsScraperResults.innerHTML = '';
  try {
    const query = lyricsScraperQueryInput?.value.trim() || '';
    const suggestions = await fetchJson(`/api/tracks/${encodeURIComponent(trackId)}/lyrics-suggestions?q=${encodeURIComponent(query)}`);
    state.lyricsSuggestions = suggestions;
    if (suggestions.length === 0) {
      setLyricsEditorStatus('No lyrics found. You can paste lyrics manually.');
      return;
    }
    setLyricsEditorStatus(`${suggestions.length} result${suggestions.length === 1 ? '' : 's'} found.`);
    if (!lyricsScraperResults) return;
    lyricsScraperResults.innerHTML = suggestions.map((suggestion, index) => `
      <button type="button" class="tag-scraper-result" data-lyrics-index="${index}">
        <strong>${escapeHtml(suggestion.title)}</strong>
        <span>${escapeHtml(suggestion.artist)}${suggestion.album ? ` • ${escapeHtml(suggestion.album)}` : ''}</span>
        <small>${suggestion.syncedLyrics ? 'Synced lyrics' : suggestion.plainLyrics ? 'Plain lyrics' : suggestion.instrumental ? 'Instrumental' : 'No lyric text'}</small>
      </button>
    `).join('');
    lyricsScraperResults.querySelectorAll('[data-lyrics-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const suggestion = state.lyricsSuggestions[Number(button.dataset.lyricsIndex)];
        if (!suggestion) return;
        syncLyricsEditorRefs();
        if (lyricsSyncedInput) lyricsSyncedInput.value = suggestion.syncedLyrics || '';
        if (lyricsPlainInput) lyricsPlainInput.value = suggestion.plainLyrics || '';
        setLyricsEditorStatus(suggestion.syncedLyrics
          ? 'Synced lyrics loaded. Save to keep them locally.'
          : 'Plain lyrics loaded. Save to keep them locally.');
      });
    });
  } finally {
    syncLyricsEditorRefs();
    if (lyricsScraperSearchButton) lyricsScraperSearchButton.disabled = false;
  }
}

async function saveLyricsEditor() {
  const trackId = state.lyricsEditorTrackId;
  if (!trackId) return;
  const saveButton = document.querySelector('#lyrics-editor-save-button');
  if (saveButton) saveButton.disabled = true;
  syncLyricsEditorRefs();
  setLyricsEditorStatus('Saving lyrics...');
  try {
    const syncedInput = lyricsSyncedInput?.value.trim() || '';
    const plainInput = lyricsPlainInput?.value.trim() || '';
    const plainHasTimestamps = !syncedInput && parseSyncedLyrics(plainInput).length > 0;
    setLyricsEditorStatus('Saving lyrics and .lrc sidecar...');
    await fetchJson(`/api/tracks/${encodeURIComponent(trackId)}/lyrics`, {
      method: 'POST',
      body: JSON.stringify({
        syncedLyrics: plainHasTimestamps ? plainInput : syncedInput,
        plainLyrics: plainHasTimestamps ? '' : plainInput,
        source: 'manual',
      }),
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
  } finally {
    if (saveButton) saveButton.disabled = false;
  }
}

async function resetLyricsEditor() {
  const trackId = state.lyricsEditorTrackId;
  if (!trackId || !window.confirm('Remove saved lyrics for this track?')) return;
  const resetButton = document.querySelector('#lyrics-editor-reset-button');
  if (resetButton) resetButton.disabled = true;
  try {
    await fetchJson(`/api/tracks/${encodeURIComponent(trackId)}/lyrics`, {
      method: 'POST',
      body: JSON.stringify({ reset: true }),
    });
    state.lyricsRefreshRequestedIds.delete(trackId);
    await loadTrackLyrics(trackId, { force: true });
    syncLyricsEditorRefs();
    if (lyricsSyncedInput) lyricsSyncedInput.value = '';
    if (lyricsPlainInput) lyricsPlainInput.value = '';
    renderFullscreenView();
    setLyricsEditorStatus('Lyrics reset.');
  } finally {
    if (resetButton) resetButton.disabled = false;
  }
}

function playTrack(track, queueTracks = null) {
  const nextQueueTracks = queueTracks ?? buildDefaultQueueForTrack(track);
  state.queueIds = nextQueueTracks.map((item) => item.id);

  if (state.shuffleActive) {
    rebuildShuffledQueue(track.id);
  } else {
    state.shuffledQueueIds = [...state.queueIds];
  }

  state.currentTrackId = track.id;
  state.lyricsRefreshRequestedIds.delete(track.id);
  loadTrackLyrics(track.id).catch((error) => console.warn('Unable to load lyrics', error));
  audioPlayer.src = track.streamUrl;
  audioPlayer.playbackRate = 1;
  persistPlaybackState();
  audioPlayer.play().catch((error) => console.error(error));
  updatePlayerUi();
  render();
}

function buildDefaultQueueForTrack(track) {
  const album = findAlbumByTrack(track);
  return album ? getAlbumTracks(album.id) : [track];
}

function togglePlayback() {
  if (!state.currentTrackId) {
    const firstTrack = getFilteredTracks()[0] ?? state.tracks[0];
    if (firstTrack) {
      playTrack(firstTrack, buildDefaultQueueForTrack(firstTrack));
    }
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play().catch((error) => console.error(error));
  } else {
    audioPlayer.pause();
  }
  updatePlayerUi();
  render();
}

function playNextTrack() {
  const queue = getPlaybackQueue();
  if (queue.length === 0 || !state.currentTrackId) return;

  const currentIndex = queue.indexOf(state.currentTrackId);
  if (currentIndex === -1) return;

  if (currentIndex < queue.length - 1) {
    playTrackById(queue[currentIndex + 1]);
    return;
  }

  if (state.repeatMode === 'one') {
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch((error) => console.error(error));
  } else if (state.repeatMode === 'all' && queue.length > 0) {
    playTrackById(queue[0]);
  } else {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    persistPlaybackState();
    updatePlayerUi();
    render();
  }
}

function playPreviousTrack() {
  if (audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0;
    updateProgressUi();
    persistPlaybackState();
    return;
  }

  const queue = getPlaybackQueue();
  if (queue.length === 0 || !state.currentTrackId) return;

  const currentIndex = queue.indexOf(state.currentTrackId);
  if (currentIndex > 0) {
    playTrackById(queue[currentIndex - 1]);
  } else {
    audioPlayer.currentTime = 0;
    updateProgressUi();
    persistPlaybackState();
  }
}

function handleTrackEnded() {
  if (state.repeatMode === 'one') {
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch((error) => console.error(error));
    return;
  }
  if (!state.settings.gaplessPlayback) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    persistPlaybackState();
    updatePlayerUi();
    render();
    return;
  }
  playNextTrack();
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
  const track = state.trackMap.get(trackId);
  if (!track) return;
  const queueTracks = respectExistingQueue
    ? getPlaybackQueue().map((id) => state.trackMap.get(id)).filter(Boolean)
    : null;
  playTrack(track, queueTracks);
}

function getPlaybackQueue() {
  return state.shuffleActive ? state.shuffledQueueIds : state.queueIds;
}

function rebuildShuffledQueue(currentTrackId = state.currentTrackId) {
  if (!state.shuffleActive) {
    state.shuffledQueueIds = [...state.queueIds];
    return;
  }

  const remaining = state.queueIds.filter((id) => id !== currentTrackId);
  for (let index = remaining.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [remaining[index], remaining[randomIndex]] = [remaining[randomIndex], remaining[index]];
  }

  state.shuffledQueueIds = currentTrackId ? [currentTrackId, ...remaining] : remaining;
}

function toggleShuffle() {
  state.shuffleActive = !state.shuffleActive;
  rebuildShuffledQueue();
  persistPlaybackState({ includeTime: false });
  updatePlayerUi();
}

function cycleRepeatMode() {
  const currentIndex = REPEAT_MODES.indexOf(state.repeatMode);
  state.repeatMode = REPEAT_MODES[(currentIndex + 1) % REPEAT_MODES.length];
  persistPlaybackState({ includeTime: false });
  updatePlayerUi();
}

function toggleMute() {
  if (state.volume === 0) {
    setVolume(state.lastVolume || 0.7);
  } else {
    state.lastVolume = state.volume;
    setVolume(0);
  }
}

function setupMediaSessionActions() {
  if (!('mediaSession' in navigator)) return;

  const actionHandlers = {
    play: () => {
      if (state.currentTrackId) audioPlayer.play().catch((error) => console.error(error));
    },
    pause: () => audioPlayer.pause(),
    previoustrack: () => playPreviousTrack(),
    nexttrack: () => playNextTrack(),
    seekbackward: (details) => {
      const offset = Number(details?.seekOffset) || 10;
      seekAudioBy(-offset);
    },
    seekforward: (details) => {
      const offset = Number(details?.seekOffset) || 10;
      seekAudioBy(offset);
    },
    seekto: (details) => {
      if (!Number.isFinite(details?.seekTime)) return;
      setAudioCurrentTime(details.seekTime, { fastSeek: Boolean(details.fastSeek) });
    },
  };

  for (const [action, handler] of Object.entries(actionHandlers)) {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      // Some Android/browser builds do not expose every action.
    }
  }
}

function seekAudioBy(offsetSeconds) {
  const currentTime = Number.isFinite(audioPlayer.currentTime) ? audioPlayer.currentTime : 0;
  setAudioCurrentTime(currentTime + offsetSeconds);
}

function setAudioCurrentTime(time, { fastSeek = false } = {}) {
  const duration = Number.isFinite(audioPlayer.duration) ? audioPlayer.duration : 0;
  const nextTime = duration > 0 ? clamp(time, 0, duration) : Math.max(0, time);
  if (fastSeek && typeof audioPlayer.fastSeek === 'function') {
    audioPlayer.fastSeek(nextTime);
  } else {
    audioPlayer.currentTime = nextTime;
  }
  updateProgressUi();
  persistPlaybackState();
}

function updateMediaSession(track) {
  if (!('mediaSession' in navigator)) return;

  if (!track) {
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = 'none';
    return;
  }

  const artwork = buildMediaSessionArtwork(track);
  if ('MediaMetadata' in window) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Unknown title',
      artist: track.artist || 'Unknown artist',
      album: track.album || '',
      artwork,
    });
  }
  updateMediaSessionPlaybackState();
  updateMediaSessionPositionState();
}

function buildMediaSessionArtwork(track) {
  const coverUrl = track.coverUrl ? toAbsoluteUrl(track.coverUrl) : '';
  if (!coverUrl) return [];
  return [
    { src: coverUrl, sizes: '96x96' },
    { src: coverUrl, sizes: '128x128' },
    { src: coverUrl, sizes: '192x192' },
    { src: coverUrl, sizes: '256x256' },
    { src: coverUrl, sizes: '512x512' },
  ];
}

function updateMediaSessionPlaybackState() {
  if (!('mediaSession' in navigator)) return;
  if (!state.currentTrackId) {
    navigator.mediaSession.playbackState = 'none';
  } else {
    navigator.mediaSession.playbackState = audioPlayer.paused ? 'paused' : 'playing';
  }
}

function updateMediaSessionPositionState() {
  if (!('mediaSession' in navigator) || typeof navigator.mediaSession.setPositionState !== 'function') return;
  const duration = Number.isFinite(audioPlayer.duration) ? audioPlayer.duration : 0;
  if (duration <= 0) return;
  const position = clamp(Number.isFinite(audioPlayer.currentTime) ? audioPlayer.currentTime : 0, 0, duration);
  try {
    navigator.mediaSession.setPositionState({
      duration,
      playbackRate: audioPlayer.playbackRate || 1,
      position,
    });
  } catch {
    // Ignore transient Android errors while metadata/duration are settling.
  }
}

function toAbsoluteUrl(url) {
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return url;
  }
}

function updatePlayerUi() {
  const track = state.currentTrackId ? state.trackMap.get(state.currentTrackId) : null;
  const queue = getPlaybackQueue();
  const currentIndex = track ? queue.indexOf(track.id) : -1;

  fullscreenPlayPauseButton.innerHTML = materialIcon(audioPlayer.paused ? 'play' : 'pause');
  fullscreenPlayPauseButton.title = audioPlayer.paused ? 'Play' : 'Pause';
  fullscreenPlayPauseButton.setAttribute('aria-label', audioPlayer.paused ? 'Play' : 'Pause');

  fullscreenShuffleButton.classList.toggle('active', state.shuffleActive);
  fullscreenShuffleButton.setAttribute('aria-pressed', String(state.shuffleActive));
  fullscreenShuffleButton.title = state.shuffleActive ? 'Shuffle on' : 'Shuffle off';
  fullscreenShuffleButton.setAttribute('aria-label', state.shuffleActive ? 'Shuffle on' : 'Shuffle off');
  fullscreenShuffleButton.innerHTML = materialIcon('shuffle');

  fullscreenRepeatButton.classList.toggle('active', state.repeatMode !== 'off');
  fullscreenRepeatButton.setAttribute('aria-pressed', String(state.repeatMode !== 'off'));
  fullscreenRepeatButton.title = getRepeatLabel();
  fullscreenRepeatButton.setAttribute('aria-label', getRepeatLabel());
  fullscreenRepeatButton.innerHTML = renderRepeatIcon();

  queueStatus.textContent = track && currentIndex >= 0 ? `${currentIndex + 1} of ${queue.length}` : `0 of ${queue.length}`;
  renderPlayerNowPlaying(track);
  renderPlayerTransportControls();
  renderPlayerUtilityControls(track);

  if (!track) {
    updateMediaSession(null);
    updateProgressUi();
    syncVolumeUi();
    renderFullscreenView();
    return;
  }

  updateMediaSession(track);

  updateProgressUi();
  syncVolumeUi();
  renderFullscreenView();
}

function renderPlayerNowPlaying(track = getCurrentTrack()) {
  if (!playerTrackInfoRoot) return;
  const album = track ? findAlbumByTrack(track) : null;
  window.MonochromeReact?.renderPlayerNowPlaying(playerTrackInfoRoot, {
    track,
    album,
    coverUrl: track?.coverUrl || '',
    coverAlt: track ? `${track.album} cover art` : '',
    title: track?.title || 'Select a track',
    albumTitle: track?.album || '',
    artist: track?.artist || 'Your queue will appear here.',
    onNowPlayingClick: handleNowPlayingClick,
    onAlbumClick: () => {
      if (album) openAlbum(album.id);
    },
    onArtistClick: () => {
      if (track?.artist) openArtist(track.artist);
    },
  });
}

function renderPlayerTransportControls() {
  if (!playerTransportControls) return;
  const playing = !audioPlayer.paused && Boolean(state.currentTrackId);
  window.MonochromeReact?.renderPlayerTransportControls(playerTransportControls, {
    playing,
    shuffleActive: state.shuffleActive,
    repeatActive: state.repeatMode !== 'off',
    repeatLabel: getRepeatLabel(),
    playIconHtml: materialIcon(playing ? 'pause' : 'play'),
    shuffleIconHtml: materialIcon('shuffle'),
    previousIconHtml: materialIcon('skipBack'),
    nextIconHtml: materialIcon('skipForward'),
    repeatIconHtml: renderRepeatIcon(),
    onPlayPause: togglePlayback,
    onPrevious: playPreviousTrack,
    onNext: playNextTrack,
    onShuffle: toggleShuffle,
    onRepeat: cycleRepeatMode,
  });
}

function renderPlayerUtilityControls(track = getCurrentTrack()) {
  if (!playerUtilityControls) return;
  const quality = track?.audioQuality || null;
  window.MonochromeReact?.renderPlayerUtilityControls(playerUtilityControls, {
    hasTrack: Boolean(track),
    currentTrackTitle: track?.title || '',
    downloadUrl: track?.streamUrl || '#',
    downloadName: track ? formatDownloadName(track) : '',
    favorite: track ? isFavoriteTrack(track.id) : false,
    queueOpen: state.queueOpen,
    volume: state.volume,
    showQuality: Boolean(state.settings.showQualityInfo && track),
    quality: normalizeAudioQualityForReact(quality),
    onFavorite: () => {
      if (state.currentTrackId) toggleFavoriteTrack(state.currentTrackId);
    },
    onQueueToggle: () => {
      state.queueOpen = !state.queueOpen;
      renderQueuePanel();
      updatePlayerUi();
    },
    onVolumeToggle: toggleMute,
  });
  syncPlayerUtilityElementRefs();
}

function normalizeAudioQualityForReact(quality) {
  if (!quality) return null;
  return {
    label: quality.label || 'Audio quality unknown',
    labelTop: quality.labelTop || quality.label || 'Audio quality unknown',
    labelBottom: quality.labelBottom || '',
    iconUrl: quality.iconType ? AUDIO_QUALITY_ICONS[quality.iconType] : '',
    iconAlt: quality.iconType === 'cd' ? 'CD Audio' : quality.iconType === 'hires' ? 'Hi-Res Audio' : '',
  };
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
  if (state.volume <= 0) return playerIcon('volumeMuted');
  if (state.volume < 0.34) return playerIcon('volumeLow');
  if (state.volume < 0.67) return playerIcon('volumeMedium');
  return playerIcon('volumeHigh');
}

function renderFullscreenView() {
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
    fullscreenDownloadLink.href = '#';
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
  fullscreenDownloadLink.href = track.streamUrl;
  fullscreenDownloadLink.download = formatDownloadName(track);
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

  const plainLyrics = lyrics?.plainLyrics || lyrics?.syncedLyrics || '';
  const plainLines = String(plainLyrics).split('\n').map((line) => line.replace(timestampTagPattern(), '').trim()).filter(Boolean);
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
  window.MonochromeReact?.renderFullscreenLyrics(fullscreenLyricsContent, {
    renderKey: props.signature || `${props.mode || 'empty'}-${Date.now()}`,
    ...props,
  });
}

function getSyncedLyricLines(lyrics) {
  if (!lyrics) return [];
  const syncedLines = parseSyncedLyrics(lyrics.syncedLyrics || '');
  if (syncedLines.length > 0) return syncedLines;
  return parseSyncedLyrics(lyrics.plainLyrics || '');
}

function createLyricsSignature(trackId, lines) {
  const first = lines[0];
  const last = lines.at(-1);
  return `${trackId}:${lines.length}:${first?.time ?? 0}:${last?.time ?? 0}:${last?.text ?? ''}`;
}

function createPlainLyricsSignature(trackId, lines) {
  return `${trackId}:${lines.length}:${lines[0] || ''}:${lines.at(-1) || ''}`;
}

function updateFullscreenLyricsHighlight({ forceScroll = false } = {}) {
  if (fullscreenLyricsContent.dataset.mode !== 'synced') return;
  const lines = [...fullscreenLyricsContent.querySelectorAll('.fullscreen-lyric-line[data-time]')];
  if (lines.length === 0) return;

  const currentTime = Number.isFinite(audioPlayer.currentTime) ? audioPlayer.currentTime : 0;
  let activeIndex = -1;
  for (const [index, line] of lines.entries()) {
    if (Number(line.dataset.time) <= currentTime) activeIndex = index;
  }
  if (activeIndex < 0) activeIndex = 0;

  const previousActiveIndex = Number(fullscreenLyricsContent.dataset.activeLyricIndex || -1);

  for (const [index, line] of lines.entries()) {
    const distance = Math.abs(index - activeIndex);
    line.classList.toggle('is-active', index === activeIndex);
    line.classList.toggle('is-soft', distance > 1 && distance <= 3);
    line.classList.toggle('is-distant', distance > 3);
  }

  if (forceScroll || activeIndex !== previousActiveIndex) {
    fullscreenLyricsContent.dataset.activeLyricIndex = String(activeIndex);
    centerActiveLyricLine(lines[activeIndex], forceScroll ? 'auto' : 'smooth');
  }
}

function centerActiveLyricLine(line, behavior = 'smooth') {
  if (!line) return;

  const containerRect = fullscreenLyricsContent.getBoundingClientRect();
  const lineRect = line.getBoundingClientRect();
  const lineCenter = lineRect.top + (lineRect.height / 2);
  const containerCenter = containerRect.top + (containerRect.height / 2);
  const scrollDelta = lineCenter - containerCenter;
  fullscreenLyricsContent.scrollTo({
    top: fullscreenLyricsContent.scrollTop + scrollDelta,
    behavior,
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

function parseSyncedLyrics(value) {
  const lines = [];
  let offset = 0;
  const timePattern = timestampTagPattern();
  for (const rawLine of String(value || '').split('\n')) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const offsetMatch = /^\[offset:([+-]?\d+)\]$/iu.exec(trimmed);
    if (offsetMatch) {
      offset = Number(offsetMatch[1]) / 1000;
      continue;
    }

    if (/^\[(?:ar|al|ti|au|by|length|re|ve):/iu.test(trimmed)) continue;

    const timestamps = [...trimmed.matchAll(timePattern)];
    if (timestamps.length > 0) {
      const text = trimmed.replace(timePattern, '').trim();
      if (!text) continue;
      for (const timestamp of timestamps) {
        const hours = Number(timestamp[1] || 0);
        const minutes = Number(timestamp[2] || 0);
        const seconds = Number(timestamp[3] || 0);
        const fraction = timestamp[4] ? Number(`0.${timestamp[4].padEnd(3, '0').slice(0, 3)}`) : 0;
        lines.push({ time: Math.max(0, (hours * 3600) + (minutes * 60) + seconds + fraction + offset), text });
      }
      continue;
    }

    const looseMatch = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\s+(.+)$/u.exec(trimmed);
    if (!looseMatch) continue;
    const hours = Number(looseMatch[1] || 0);
    const minutes = Number(looseMatch[2] || 0);
    const seconds = Number(looseMatch[3] || 0);
    const fraction = looseMatch[4] ? Number(`0.${looseMatch[4].padEnd(3, '0').slice(0, 3)}`) : 0;
    const text = looseMatch[5].trim();
    if (!text) continue;
    lines.push({ time: Math.max(0, (hours * 3600) + (minutes * 60) + seconds + fraction + offset), text });
  }
  return lines.sort((a, b) => a.time - b.time);
}

function timestampTagPattern() {
  return /[\[<](?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?[\]>]/gu;
}

function updateProgressUi() {
  const duration = Number.isFinite(audioPlayer.duration) ? audioPlayer.duration : 0;
  const currentTime = Number.isFinite(audioPlayer.currentTime) ? audioPlayer.currentTime : 0;
  const ratio = duration > 0 ? currentTime / duration : 0;

  progressFill.style.width = `${ratio * 100}%`;
  fullscreenProgressFill.style.width = `${ratio * 100}%`;
  currentTimeElement.textContent = formatSeconds(currentTime);
  totalDurationElement.textContent = formatSeconds(duration);
  fullscreenCurrentTimeElement.textContent = formatSeconds(currentTime);
  fullscreenTotalDurationElement.textContent = formatSeconds(duration);
  updateMediaSessionPositionState();
  updateFullscreenLyricsHighlight();
}

function setVolume(volume) {
  state.volume = clamp(volume, 0, 1);
  if (state.volume > 0) {
    state.lastVolume = state.volume;
  }
  audioPlayer.volume = state.volume;
  localStorage.setItem(STORAGE_KEYS.volume, String(state.volume));
  syncVolumeUi();
}

function bindVolumeControl(bar) {
  const updateFromPointer = (event) => {
    event.preventDefault();
    setVolume(getRelativePointerPosition(event, bar));
  };

  bar.addEventListener('click', updateFromPointer);
  bar.addEventListener('pointerdown', (event) => {
    updateFromPointer(event);
    bar.setPointerCapture?.(event.pointerId);

    const handlePointerMove = (moveEvent) => updateFromPointer(moveEvent);
    const handlePointerUp = () => {
      bar.removeEventListener('pointermove', handlePointerMove);
      bar.removeEventListener('pointerup', handlePointerUp);
      bar.removeEventListener('pointercancel', handlePointerUp);
    };

    bar.addEventListener('pointermove', handlePointerMove);
    bar.addEventListener('pointerup', handlePointerUp);
    bar.addEventListener('pointercancel', handlePointerUp);
  });
  bar.addEventListener('wheel', (event) => {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    setVolume(state.volume + (direction * 0.04));
  }, { passive: false });
}

function syncVolumeUi() {
  volumeFill.style.width = `${state.volume * 100}%`;
  fullscreenVolumeFill.style.width = `${state.volume * 100}%`;
  renderPlayerUtilityControls();
  if (state.volume === 0) {
    fullscreenVolumeButton.innerHTML = playerIcon('volumeMuted');
  } else if (state.volume < 0.34) {
    fullscreenVolumeButton.innerHTML = playerIcon('volumeLow');
  } else if (state.volume < 0.67) {
    fullscreenVolumeButton.innerHTML = playerIcon('volumeMedium');
  } else {
    fullscreenVolumeButton.innerHTML = playerIcon('volumeHigh');
  }
}

function ensureAudioVisualizer() {
  if (ensureAudioGraph()) return;
}

function ensureAudioGraph() {
  if (state.audioContext && state.audioSource && state.analyser) {
    state.audioContext.resume?.().catch(() => {});
    return true;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  state.audioContext = new AudioContextClass();
  state.audioSource = state.audioContext.createMediaElementSource(audioPlayer);
  state.analyser = state.audioContext.createAnalyser();
  state.analyser.fftSize = 128;
  state.analyserData = new Uint8Array(state.analyser.frequencyBinCount);
  state.audioSource.connect(state.analyser);
  state.analyser.connect(state.audioContext.destination);
  return true;
}

function updateVisualizerState() {
  fullscreenVisualizerButton.classList.toggle('active', state.visualizerActive);
  fullscreenVisualizer.hidden = !state.visualizerActive;
  if (state.visualizerActive && state.route.view === 'fullscreen' && !audioPlayer.paused) {
    ensureAudioVisualizer();
    startVisualizer();
  } else {
    stopVisualizer();
  }
}

function startVisualizer() {
  if (state.visualizerFrameId || !state.analyser || !state.analyserData) return;
  const context = fullscreenVisualizer.getContext('2d');
  const draw = () => {
    state.visualizerFrameId = requestAnimationFrame(draw);
    const width = fullscreenVisualizer.clientWidth;
    const height = fullscreenVisualizer.clientHeight;
    const scale = window.devicePixelRatio || 1;
    if (fullscreenVisualizer.width !== Math.floor(width * scale) || fullscreenVisualizer.height !== Math.floor(height * scale)) {
      fullscreenVisualizer.width = Math.floor(width * scale);
      fullscreenVisualizer.height = Math.floor(height * scale);
    }
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, width, height);
    state.analyser.getByteFrequencyData(state.analyserData);
    const bars = state.analyserData.length;
    const barWidth = width / bars;
    for (let index = 0; index < bars; index += 1) {
      const value = state.analyserData[index] / 255;
      const barHeight = Math.max(4, value * height * 0.42);
      context.fillStyle = `rgba(255, 255, 255, ${0.08 + value * 0.28})`;
      context.fillRect(index * barWidth, height - barHeight, Math.max(1, barWidth - 2), barHeight);
    }
  };
  draw();
}

function stopVisualizer() {
  if (!state.visualizerFrameId) return;
  cancelAnimationFrame(state.visualizerFrameId);
  state.visualizerFrameId = 0;
}

function applyStaticIcons() {
  renderPlayerNowPlaying();
  renderPlayerTransportControls();
  fullscreenShuffleButton.innerHTML = materialIcon('shuffle');
  fullscreenPrevButton.innerHTML = materialIcon('skipBack');
  fullscreenNextButton.innerHTML = materialIcon('skipForward');
  fullscreenRepeatButton.innerHTML = renderRepeatIcon();
  renderPlayerUtilityControls();
  queueDownloadButton.innerHTML = playerIcon('download');
  queueFavoriteButton.innerHTML = materialIcon('favorite');
  queueClearButton.innerHTML = playerIcon('clearQueue');
  queueCloseButton.innerHTML = materialIcon('close');
  editAlbumCoverButton.innerHTML = materialIcon('edit');
  favoriteAlbumButton.innerHTML = materialIcon('favorite');
  backButton.innerHTML = materialIcon('back');
  clearSearchButton.innerHTML = materialIcon('close');
}

function closeQueuePanel() {
  state.queueOpen = false;
  renderQueuePanel();
  updatePlayerUi();
}

function isFavoriteTrack(trackId) {
  return state.favoriteTrackIds.has(trackId);
}

function isFavoriteAlbum(albumId) {
  return state.favoriteAlbumIds.has(albumId);
}

function toggleFavoriteTrack(trackId) {
  if (!state.trackMap.has(trackId)) return;
  if (state.favoriteTrackIds.has(trackId)) {
    state.favoriteTrackIds.delete(trackId);
  } else {
    state.favoriteTrackIds.add(trackId);
  }
  persistFavorites();
  updatePlayerUi();
  render();
}

function toggleFavoriteAlbum(albumId) {
  if (!state.albumMap.has(albumId)) return;
  if (state.favoriteAlbumIds.has(albumId)) {
    state.favoriteAlbumIds.delete(albumId);
  } else {
    state.favoriteAlbumIds.add(albumId);
  }
  persistFavorites();
  render();
}

function favoriteTracks(trackIds) {
  let changed = false;
  for (const trackId of trackIds) {
    if (!state.trackMap.has(trackId) || state.favoriteTrackIds.has(trackId)) continue;
    state.favoriteTrackIds.add(trackId);
    changed = true;
  }

  if (!changed) return;
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
  for (const track of queue) {
    triggerTrackDownload(track);
    await delay(140);
  }
}

function triggerTrackDownload(track) {
  const link = document.createElement('a');
  link.href = track.streamUrl;
  link.download = formatDownloadName(track);
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
}

function addTracksToQueue(tracks) {
  const nextIds = (Array.isArray(tracks) ? tracks : [tracks])
    .map((track) => track?.id)
    .filter((id) => id && state.trackMap.has(id));
  if (nextIds.length === 0) return;

  const existingIds = new Set(state.queueIds);
  const uniqueNewIds = nextIds.filter((id) => !existingIds.has(id));
  if (uniqueNewIds.length === 0) return;

  state.queueIds = [...state.queueIds, ...uniqueNewIds];
  if (state.shuffleActive) {
    rebuildShuffledQueue();
  } else {
    state.shuffledQueueIds = [...state.queueIds];
  }
  persistPlaybackState({ includeTime: false });
  updatePlayerUi();
  render();
}

function clearQueue() {
  if (!state.currentTrackId) {
    state.queueIds = [];
    state.shuffledQueueIds = [];
  } else {
    state.queueIds = [state.currentTrackId];
    state.shuffledQueueIds = [state.currentTrackId];
  }
  state.shuffleActive = false;
  persistPlaybackState({ includeTime: false });
  updatePlayerUi();
  render();
}

function removeTrackFromQueue(trackId) {
  if (!trackId || trackId === state.currentTrackId) return;
  state.queueIds = state.queueIds.filter((id) => id !== trackId);
  state.shuffledQueueIds = state.shuffledQueueIds.filter((id) => id !== trackId);
  persistPlaybackState({ includeTime: false });
  updatePlayerUi();
  render();
}

function reorderQueue(dragTrackId, targetTrackId) {
  if (!dragTrackId || !targetTrackId || dragTrackId === targetTrackId) return;

  const nextQueue = [...getPlaybackQueue()];
  const dragIndex = nextQueue.indexOf(dragTrackId);
  const targetIndex = nextQueue.indexOf(targetTrackId);
  if (dragIndex === -1 || targetIndex === -1) return;

  nextQueue.splice(dragIndex, 1);
  nextQueue.splice(targetIndex, 0, dragTrackId);

  state.queueIds = nextQueue;
  state.shuffledQueueIds = nextQueue;
  state.shuffleActive = false;
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
  const groups = new Map();

  for (const track of tracks) {
    if (!groups.has(track.artist)) {
      groups.set(track.artist, {
        name: track.artist,
        tracks: [],
        albumIds: new Set(),
      });
    }

    const group = groups.get(track.artist);
    group.tracks.push(track);
    const album = findAlbumByTrack(track);
    if (album) {
      group.albumIds.add(album.id);
    }
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      albums: [...group.albumIds].map((albumId) => state.albumMap.get(albumId)).filter(Boolean),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
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
  if (!state.searchTerm) return state.tracks;
  return state.tracks.filter((track) => trackMatchesSearch(track));
}

function getFilteredAlbums(filteredTracks) {
  if (!state.searchTerm) return state.albums;
  const filteredAlbumIds = new Set(filteredTracks.map((track) => track.albumId).filter(Boolean));
  if (filteredAlbumIds.size > 0) {
    return state.albums.filter((album) => filteredAlbumIds.has(album.id));
  }

  const filteredAlbumKeys = new Set(filteredTracks.map((track) => `${track.albumArtist || track.artist}::${track.album}`));
  return state.albums.filter((album) => filteredAlbumKeys.has(`${album.albumArtist || album.artist}::${album.title}`));
}

function getRandomAlbumIds(albums, limit) {
  const shuffled = [...albums];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, limit).map((album) => album.id);
}

function getHomeAlbums(filteredAlbums) {
  if (!state.searchTerm && state.homeAlbumIds.length > 0) {
    const randomized = state.homeAlbumIds
      .map((id) => state.albumMap.get(id))
      .filter(Boolean);
    if (randomized.length > 0) {
      return randomized.slice(0, 50);
    }
  }

  const filteredById = new Map(filteredAlbums.map((album) => [album.id, album]));
  const randomized = state.homeAlbumIds
    .map((id) => filteredById.get(id))
    .filter(Boolean);

  if (randomized.length >= Math.min(50, filteredAlbums.length)) {
    return randomized.slice(0, 50);
  }

  const seenIds = new Set(randomized.map((album) => album.id));
  const remaining = filteredAlbums.filter((album) => !seenIds.has(album.id));
  return [...randomized, ...remaining].slice(0, 50);
}

function trackMatchesSearch(track) {
  if (!state.searchTerm) return true;

  return [track.title, track.artist, track.album, track.relativePath].some((value) =>
    value.toLowerCase().includes(state.searchTerm)
  );
}

function albumMatchesSearch(album) {
  if (!state.searchTerm) return true;
  return [album.title, album.artist, album.albumArtist].some((value) =>
    String(value || '').toLowerCase().includes(state.searchTerm)
  );
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
  return (
    compareNullableTrackNumber(left.discNumber, right.discNumber)
    || compareNullableTrackNumber(left.trackNumber, right.trackNumber)
    || left.title.localeCompare(right.title)
  );
}

function compareNullableTrackNumber(left, right) {
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  const leftValid = Number.isFinite(leftNumber);
  const rightValid = Number.isFinite(rightNumber);
  if (!leftValid && !rightValid) return 0;
  if (!leftValid) return 1;
  if (!rightValid) return -1;
  return leftNumber - rightNumber;
}

function findAlbumByTrack(track) {
  if (track.albumId) {
    return state.albumMap.get(track.albumId) ?? null;
  }
  return state.albums.find((album) => (
    (album.albumArtist || album.artist) === (track.albumArtist || track.artist)
    && album.title === track.album
  )) ?? null;
}

function partitionAlbums(albums) {
  const eps = [];
  const full = [];

  for (const album of albums) {
    const tracks = getAlbumTracks(album.id);
    const isEp = tracks.length <= 5 || /ep|single/i.test(album.title);
    if (isEp) {
      eps.push(album);
    } else {
      full.push(album);
    }
  }

  return [eps, full];
}

function formatAlbumFacts(album) {
  return [
    album.year || '',
  ].filter(Boolean);
}

function getAlbumFolderPath(tracks) {
  const folderPaths = (tracks || [])
    .map((track) => getTrackFolderPath(track?.relativePath || ''))
    .filter(Boolean);
  if (folderPaths.length === 0) return '';

  const commonParts = folderPaths[0].split('/');
  for (const folderPath of folderPaths.slice(1)) {
    const parts = folderPath.split('/');
    let index = 0;
    while (index < commonParts.length && commonParts[index] === parts[index]) {
      index += 1;
    }
    commonParts.length = index;
    if (commonParts.length === 0) break;
  }
  return commonParts.join('/');
}

function getTrackFolderPath(relativePath) {
  const normalizedPath = String(relativePath || '').replaceAll('\\', '/');
  const lastSlash = normalizedPath.lastIndexOf('/');
  return lastSlash > 0 ? normalizedPath.slice(0, lastSlash) : '';
}

function isWantedAlbum(album) {
  return String(album?.status || '').trim().toLowerCase() === 'wanted';
}

function filterAlbumsByMediaType(albums) {
  if (!state.mediaTypeFilters || state.mediaTypeFilters.size === 0) return albums;
  const selectedMediaTypes = state.mediaTypeFilters;
  return albums.filter((album) => {
    const mediaTypes = Array.isArray(album.mediaTypes) ? album.mediaTypes : [album.mediaType];
    for (const mediaType of mediaTypes) {
      if (selectedMediaTypes.has(normalizeMediaTypeName(mediaType))) return true;
    }
    return false;
  });
}

function getAlbumMediaTypes(album) {
  const mediaTypes = Array.isArray(album.mediaTypes) ? album.mediaTypes : [album.mediaType];
  const normalized = mediaTypes.map(normalizeMediaTypeName).filter(Boolean);
  return normalized.length > 0 ? normalized : ['Digital Media'];
}

function renderMediaTypeIcons(album, { includeLabels = false } = {}) {
  return getAlbumMediaTypes(album).map((mediaType) => {
    const iconUrl = MEDIA_TYPE_ICONS[mediaType] || MEDIA_TYPE_ICONS['Digital Media'];
    const label = includeLabels ? `<span>${escapeHtml(mediaType)}</span>` : '';
    return `<span class="media-type-icon" title="${escapeHtml(mediaType)}"><i class="media-type-symbol" style="--media-type-icon: url('${escapeHtml(iconUrl)}')" aria-hidden="true"></i>${label}</span>`;
  }).join('');
}

function normalizeMediaTypeName(mediaType) {
  const normalized = String(mediaType || '').trim();
  if (!normalized) return '';
  if (/^cassette[-\s]?tape$/iu.test(normalized)) return 'Cassette Tape';
  return normalized;
}

function renderAudioQualityBadge(quality, { includeLabel = false } = {}) {
  if (!quality || quality.iconType !== 'hires') return '';

  const icon = '<img src="' + AUDIO_QUALITY_ICONS.hires + '" alt="Hi-Res Audio" loading="lazy">';
  const label = includeLabel
    ? `<span>${escapeHtml(quality.labelTop || quality.label)}</span>`
    : '';
  return `<span class="audio-quality-badge" title="${escapeHtml(quality.label)}">${icon}${label}</span>`;
}

function setSelectedMediaTypes(mediaTypes) {
  syncTagEditorRefs();
  if (!tagAlbumMediaTypesInput) return;
  const selected = new Set((Array.isArray(mediaTypes) ? mediaTypes : [mediaTypes]).map(normalizeMediaTypeName));
  for (const input of tagAlbumMediaTypesInput.querySelectorAll('input[type="checkbox"]')) {
    input.checked = selected.has(input.value);
  }
}

function getSelectedMediaTypes() {
  syncTagEditorRefs();
  if (!tagAlbumMediaTypesInput) return ['Digital Media'];
  const selected = [...tagAlbumMediaTypesInput.querySelectorAll('input[type="checkbox"]:checked')]
    .map((input) => input.value);
  return selected.length > 0 ? selected : ['Digital Media'];
}

function createCoverPlaceholder(label = 'No cover', className = 'album-art-placeholder') {
  return `
    <div class="${className} cover-placeholder-art">
      <i class="fa-solid fa-record-vinyl" aria-hidden="true"></i>
    </div>
  `;
}

function createArtistPlaceholder(name) {
  return `<div class="artist-image-fallback">${createArtistPlaceholderContent(name)}</div>`;
}

function createArtistPlaceholderContent(name) {
  return `
    <i class="fa-solid fa-user" aria-hidden="true"></i>
    <span>${escapeHtml(getArtistInitials(name))}</span>
  `;
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

function getRelativePointerPosition(event, element) {
  const rect = element.getBoundingClientRect();
  return clamp((event.clientX - rect.left) / rect.width, 0, 1);
}

function formatTimestamp(value) {
  if (!value) return 'unknown time';
  return new Date(value).toLocaleString();
}

function extractYear(value) {
  const match = String(value || '').match(/\b(\d{4})\b/u);
  return match ? match[1] : '';
}

function formatSeconds(value) {
  if (!Number.isFinite(value) || value <= 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatDownloadName(track) {
  const album = findAlbumByTrack(track);
  const extension = getFileExtension(track.relativePath);
  const filename = applyTemplate(state.settings.filenameTemplate || DEFAULT_SETTINGS.filenameTemplate, {
    discNumber: track.discNumber || '',
    trackNumber: track.trackNumber || '',
    artist: track.artist,
    title: track.title,
    album: track.album,
    albumArtist: album?.albumArtist || album?.artist || track.albumArtist || track.artist,
    year: album?.year || extractYear(track.date) || '',
  });
  return `${sanitizeFilename(filename)}${extension}`;
}

function applyTemplate(template, values) {
  return String(template || '').replace(/\{(\w+)\}/gu, (_, key) => values[key] ?? '');
}

function sanitizeFilename(value) {
  return String(value || 'download')
    .replace(/[<>:"/\\|?*]+/gu, '-')
    .replace(/\s+/gu, ' ')
    .trim() || 'download';
}

function getFileExtension(relativePath) {
  const match = String(relativePath || '').match(/(\.[a-z0-9]{2,5})$/iu);
  return match ? match[1] : '';
}

function persistSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
}

function readStoredSettings() {
  const parsed = readStoredObject(STORAGE_KEYS.settings);
  removeLegacySettings(parsed);
  if (parsed.theme === 'machiatto') {
    parsed.theme = 'macchiato';
  }
  if (parsed.nowPlayingClickAction === 'library') {
    parsed.nowPlayingClickAction = 'artist';
  }
  if (parsed.nowPlayingClickAction === 'album' && !parsed.nowPlayingClickActionUserSet) {
    parsed.nowPlayingClickAction = DEFAULT_SETTINGS.nowPlayingClickAction;
  }
  if (parsed.nowPlayingClickAction && !NOW_PLAYING_CLICK_ACTIONS.has(parsed.nowPlayingClickAction)) {
    delete parsed.nowPlayingClickAction;
  }
  if (typeof parsed.libraryTitle === 'string' && parsed.libraryTitle.trim() === '') {
    delete parsed.libraryTitle;
  }
  if (parsed.albumCardSize != null) {
    parsed.albumCardSize = clampAlbumCardSize(parsed.albumCardSize);
  }
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
  };
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
        removeLegacySettings(parsed);
        if (parsed.nowPlayingClickAction === 'library') {
          parsed.nowPlayingClickAction = 'artist';
        }
        if (parsed.nowPlayingClickAction === 'album' && !parsed.nowPlayingClickActionUserSet) {
          parsed.nowPlayingClickAction = DEFAULT_SETTINGS.nowPlayingClickAction;
        }
        if (parsed.nowPlayingClickAction && !NOW_PLAYING_CLICK_ACTIONS.has(parsed.nowPlayingClickAction)) {
          delete parsed.nowPlayingClickAction;
        }
        if (parsed.albumCardSize != null) {
          parsed.albumCardSize = clampAlbumCardSize(parsed.albumCardSize);
        }
        state.settings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
        };
        persistSettings();
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

function removeLegacySettings(settings) {
  if (!settings || typeof settings !== 'object') return;
  for (const key of LEGACY_SETTING_KEYS) {
    delete settings[key];
  }
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function readStoredObject(key) {
  const rawValue = localStorage.getItem(key);
  if (rawValue == null) return {};

  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function readStoredNumber(key, fallbackValue) {
  const rawValue = localStorage.getItem(key);
  if (rawValue == null) return fallbackValue;
  const parsed = Number.parseFloat(rawValue);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
}

function readStoredNumberFromObject(key, property, fallbackValue) {
  const parsed = readStoredObject(key);
  const value = Number.parseFloat(parsed[property]);
  return Number.isFinite(value) ? value : fallbackValue;
}

function readStoredIdSet(key) {
  const rawValue = localStorage.getItem(key);
  if (rawValue == null) return new Set();

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function writeStoredIdSet(key, values) {
  localStorage.setItem(key, JSON.stringify([...values]));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}
