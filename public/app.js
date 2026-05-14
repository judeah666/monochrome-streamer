const appTitle = document.querySelector('#app-title');
const albumCount = document.querySelector('#album-count');
const trackCount = document.querySelector('#track-count');
const libraryStatus = document.querySelector('#library-status');
const rescanButton = document.querySelector('#rescan-button');
const searchInput = document.querySelector('#search-input');
const clearSearchButton = document.querySelector('#clear-search-button');
const backButton = document.querySelector('#back-button');
const navHome = document.querySelector('#nav-home');
const navLibrary = document.querySelector('#nav-library');
const navFavorites = document.querySelector('#nav-favorites');
const navSettings = document.querySelector('#nav-settings');
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
const libraryTabPlaylists = document.querySelector('#library-tab-playlists');
const libraryPanelFolders = document.querySelector('#library-panel-folders');
const libraryPanelAlbums = document.querySelector('#library-panel-albums');
const libraryPanelArtists = document.querySelector('#library-panel-artists');
const libraryPanelPlaylists = document.querySelector('#library-panel-playlists');
const favoritesView = document.querySelector('#favorites-view');
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
const settingsTabs = document.querySelector('#settings-tabs');
const settingsPanels = document.querySelector('#settings-panels');
const settingsStatus = document.querySelector('#settings-status');
const albumHero = document.querySelector('#album-hero');
const albumDetailCover = document.querySelector('#album-detail-cover');
const albumDetailCoverFallback = document.querySelector('#album-detail-cover-fallback');
const albumDetailTitle = document.querySelector('#album-detail-title');
const albumDetailFormat = document.querySelector('#album-detail-format');
const albumDetailMeta = document.querySelector('#album-detail-meta');
const albumDetailArtist = document.querySelector('#album-detail-artist');
const albumTrackList = document.querySelector('#album-track-list');
const playAlbumButton = document.querySelector('#play-album-button');
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
const playerCover = document.querySelector('#player-cover');
const playerCoverFallback = document.querySelector('#player-cover-fallback');
const playerTrackInfo = document.querySelector('.track-info');
const playerTitle = document.querySelector('#player-title');
const playerAlbum = document.querySelector('#player-album');
const playerArtist = document.querySelector('#player-artist');
const playPauseButton = document.querySelector('#play-pause-btn');
const prevButton = document.querySelector('#prev-btn');
const nextButton = document.querySelector('#next-btn');
const shuffleButton = document.querySelector('#shuffle-btn');
const repeatButton = document.querySelector('#repeat-btn');
const currentTimeElement = document.querySelector('#current-time');
const totalDurationElement = document.querySelector('#total-duration');
const progressBar = document.querySelector('#progress-bar');
const progressFill = document.querySelector('#progress-fill');
const volumeButton = document.querySelector('#volume-btn');
const volumeBar = document.querySelector('#volume-bar');
const volumeFill = document.querySelector('#volume-fill');
const audioQualityInfo = document.querySelector('#audio-quality-info');
const audioQualityIcon = document.querySelector('#audio-quality-icon');
const audioQualityFallbackIcon = document.querySelector('#audio-quality-fallback-icon');
const audioQualityLabel = document.querySelector('#audio-quality-label');
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
const queueToggleButton = document.querySelector('#queue-toggle-button');
const queuePanel = document.querySelector('#queue-panel');
const queueCloseButton = document.querySelector('#queue-close-button');
const queueDownloadButton = document.querySelector('#queue-download-button');
const queueFavoriteButton = document.querySelector('#queue-favorite-button');
const queueClearButton = document.querySelector('#queue-clear-button');
const queueOverlay = document.querySelector('#queue-overlay');
const queueList = document.querySelector('#queue-list');
const downloadTrackLink = document.querySelector('#download-track-link');
const tagEditorOverlay = document.querySelector('#tag-editor-overlay');
const tagEditorModal = document.querySelector('#tag-editor-modal');
const tagEditorTitle = document.querySelector('#tag-editor-title');
const tagEditorCaption = document.querySelector('#tag-editor-caption');
const tagEditorCloseButton = document.querySelector('#tag-editor-close-button');
const tagEditorCancelButton = document.querySelector('#tag-editor-cancel-button');
const tagEditorSaveButton = document.querySelector('#tag-editor-save-button');
const tagEditorResetButton = document.querySelector('#tag-editor-reset-button');
const tagAlbumTitleInput = document.querySelector('#tag-album-title');
const tagAlbumArtistInput = document.querySelector('#tag-album-artist');
const tagAlbumDateInput = document.querySelector('#tag-album-date');
const tagAlbumGenreInput = document.querySelector('#tag-album-genre');
const tagAlbumMediaTypesInput = document.querySelector('#tag-album-media-types');
const tagAlbumStatusInput = document.querySelector('#tag-album-status');
const tagAlbumCoverUrlInput = document.querySelector('#tag-album-cover-url');
const tagEditorCoverPreview = document.querySelector('#tag-editor-cover-preview');
const tagEditorCoverFallback = document.querySelector('#tag-editor-cover-fallback');
const tagScraperQueryInput = document.querySelector('#tag-scraper-query');
const tagScraperSearchButton = document.querySelector('#tag-scraper-search-button');
const tagScraperStatus = document.querySelector('#tag-scraper-status');
const tagScraperResults = document.querySelector('#tag-scraper-results');
const tagTrackList = document.querySelector('#tag-track-list');
const artistEditorOverlay = document.querySelector('#artist-editor-overlay');
const artistEditorModal = document.querySelector('#artist-editor-modal');
const artistEditorTitle = document.querySelector('#artist-editor-title');
const artistEditorCloseButton = document.querySelector('#artist-editor-close-button');
const artistEditorCancelButton = document.querySelector('#artist-editor-cancel-button');
const artistEditorSaveButton = document.querySelector('#artist-editor-save-button');
const artistEditorResetButton = document.querySelector('#artist-editor-reset-button');
const artistImageUrlInput = document.querySelector('#artist-image-url');
const artistBioInput = document.querySelector('#artist-bio');
const artistSourceUrlInput = document.querySelector('#artist-source-url');
const lyricsEditorOverlay = document.querySelector('#lyrics-editor-overlay');
const lyricsEditorModal = document.querySelector('#lyrics-editor-modal');
const lyricsEditorTitle = document.querySelector('#lyrics-editor-title');
const lyricsEditorCaption = document.querySelector('#lyrics-editor-caption');
const lyricsEditorCloseButton = document.querySelector('#lyrics-editor-close-button');
const lyricsEditorCancelButton = document.querySelector('#lyrics-editor-cancel-button');
const lyricsEditorSaveButton = document.querySelector('#lyrics-editor-save-button');
const lyricsEditorResetButton = document.querySelector('#lyrics-editor-reset-button');
const lyricsSyncedInput = document.querySelector('#lyrics-synced-input');
const lyricsPlainInput = document.querySelector('#lyrics-plain-input');
const lyricsScraperQueryInput = document.querySelector('#lyrics-scraper-query');
const lyricsScraperSearchButton = document.querySelector('#lyrics-scraper-search-button');
const lyricsScraperStatus = document.querySelector('#lyrics-scraper-status');
const lyricsScraperResults = document.querySelector('#lyrics-scraper-results');

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
};

const REPEAT_MODES = ['off', 'all', 'one'];
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
  customAccent: '#eb9200',
  customThemeBase: 'dark',
  libraryTitle: 'Monochrome-Streamer',
  homeBannerEyebrow: 'Local Audio',
  homeBannerTitle: 'Your server, your collection, your rules.',
  homeBannerSubtitle: 'Browse your albums, open them like a proper detail page, and control playback from a full bottom player.',
  albumCoverBackground: true,
  dynamicColors: false,
  compactAlbums: false,
  compactArtists: false,
  showHome: true,
  showLibrary: true,
  showFavorites: true,
  closePanelsOnNavigation: true,
  nowPlayingClickAction: 'album',
  playbackQuality: 'auto',
  playerLayout: 'floating',
  showQualityInfo: true,
  gaplessPlayback: true,
  replayGainMode: 'off',
  monoAudio: false,
  exponentialVolume: false,
  playbackSpeed: 1,
  preservePitch: true,
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
  CD: 'compactDisc',
  'Digital Media': 'fileAudio',
  Vinyl: 'recordVinyl',
};

const AUDIO_QUALITY_ICONS = {
  hires: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjzgkp7vuwaecsDEPlp7MlW-oqGVNzD26tWA&s',
  cd: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/CD_Audio_icon.png',
};

const state = {
  title: 'Monochrome-Streamer',
  generatedAt: null,
  albums: [],
  tracks: [],
  trackMap: new Map(),
  albumMap: new Map(),
  homeAlbumIds: [],
  searchTerm: '',
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
  draggingQueueTrackId: null,
  libraryTab: 'folders',
  settingsTab: 'appearance',
  settings: { ...DEFAULT_SETTINGS },
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
  analyser: null,
  analyserData: null,
  visualizerFrameId: 0,
};

init().catch((error) => {
  console.error(error);
  libraryStatus.textContent = error.message || 'Failed to load library.';
});

async function init() {
  const [config, library] = await Promise.all([
    fetchJson('/api/config'),
    fetchJson('/api/library'),
  ]);

  state.settings = readStoredSettings();
  hydrateLibrary(config, library);
  state.favoriteTrackIds = readStoredIdSet(STORAGE_KEYS.favoriteTracks);
  state.favoriteAlbumIds = readStoredIdSet(STORAGE_KEYS.favoriteAlbums);
  sanitizeStoredFavorites();
  state.volume = clamp(readStoredNumber(STORAGE_KEYS.volume, 0.7), 0, 1);
  state.lastVolume = state.volume || 0.7;
  audioPlayer.volume = getEffectiveVolume(state.volume);
  restorePlaybackState();
  applySettings();

  applyStaticIcons();
  bindEvents();
  updateRouteFromLocation();
  render();
  syncVolumeUi();
  updatePlayerUi();
}

function bindEvents() {
  searchInput.addEventListener('input', () => {
    state.searchTerm = searchInput.value.trim().toLowerCase();
    render();
  });

  clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    state.searchTerm = '';
    searchInput.focus();
    render();
  });

  backButton.addEventListener('click', () => navigateToView(state.browseView));
  navHome.addEventListener('click', () => navigateToView('home'));
  navLibrary.addEventListener('click', () => navigateToView('library'));
  navFavorites.addEventListener('click', () => navigateToView('favorites'));
  navSettings.addEventListener('click', () => navigateToView('settings'));
  libraryTabFolders.addEventListener('click', () => setLibraryTab('folders'));
  libraryTabAlbums.addEventListener('click', () => setLibraryTab('albums'));
  libraryTabArtists.addEventListener('click', () => setLibraryTab('artists'));
  libraryTabPlaylists.addEventListener('click', () => setLibraryTab('playlists'));
  settingsTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-settings-tab]');
    if (!button) return;
    state.settingsTab = button.dataset.settingsTab;
    renderSettingsView();
  });
  settingsPanels.addEventListener('input', handleSettingsInput);
  settingsPanels.addEventListener('change', handleSettingsInput);
  settingsPanels.addEventListener('click', (event) => {
    const button = event.target.closest('[data-settings-action], [data-setting-value]');
    if (!button) return;
    handleSettingsAction(button);
  });

  queueToggleButton.addEventListener('click', () => {
    state.queueOpen = !state.queueOpen;
    renderQueuePanel();
    updatePlayerUi();
  });

  queueCloseButton.addEventListener('click', closeQueuePanel);
  queueOverlay.addEventListener('click', closeQueuePanel);
  tagEditorCloseButton.addEventListener('click', closeTagEditor);
  tagEditorCancelButton.addEventListener('click', closeTagEditor);
  tagEditorOverlay.addEventListener('click', closeTagEditor);
  lyricsEditorCloseButton.addEventListener('click', closeLyricsEditor);
  lyricsEditorCancelButton.addEventListener('click', closeLyricsEditor);
  lyricsEditorOverlay.addEventListener('click', closeLyricsEditor);
  lyricsEditorSaveButton.addEventListener('click', () => {
    saveLyricsEditor().catch((error) => {
      lyricsScraperStatus.textContent = error.message || 'Unable to save lyrics.';
    });
  });
  lyricsEditorResetButton.addEventListener('click', () => {
    resetLyricsEditor().catch((error) => {
      lyricsScraperStatus.textContent = error.message || 'Unable to reset lyrics.';
    });
  });
  lyricsScraperSearchButton.addEventListener('click', () => {
    searchLyricsSuggestions().catch((error) => {
      lyricsScraperStatus.textContent = error.message || 'Unable to search lyrics.';
    });
  });
  lyricsScraperQueryInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    searchLyricsSuggestions().catch((error) => {
      lyricsScraperStatus.textContent = error.message || 'Unable to search lyrics.';
    });
  });
  editArtistButton.addEventListener('click', () => {
    const artist = getCurrentArtist();
    if (!artist) return;
    openArtistEditor(artist);
  });
  artistEditorCloseButton.addEventListener('click', closeArtistEditor);
  artistEditorCancelButton.addEventListener('click', closeArtistEditor);
  artistEditorOverlay.addEventListener('click', closeArtistEditor);
  artistEditorSaveButton.addEventListener('click', () => {
    saveArtistEditor().catch((error) => {
      artistBioInput.setCustomValidity(error.message || 'Unable to save artist info.');
      artistBioInput.reportValidity();
      artistBioInput.setCustomValidity('');
    });
  });
  artistEditorResetButton.addEventListener('click', () => {
    resetArtistEditor().catch((error) => {
      artistBioInput.setCustomValidity(error.message || 'Unable to clear artist info.');
      artistBioInput.reportValidity();
      artistBioInput.setCustomValidity('');
    });
  });
  tagEditorSaveButton.addEventListener('click', () => {
    saveTagEditor().catch((error) => {
      tagScraperStatus.textContent = error.message || 'Unable to save album tags.';
    });
  });
  tagEditorResetButton.addEventListener('click', () => {
    resetTagEditor().catch((error) => {
      tagScraperStatus.textContent = error.message || 'Unable to reset album tags.';
    });
  });
  tagAlbumCoverUrlInput.addEventListener('input', syncTagEditorCoverPreview);
  tagScraperSearchButton.addEventListener('click', () => {
    searchTagSuggestions().catch((error) => {
      tagScraperStatus.textContent = error.message || 'Unable to search MusicBrainz.';
    });
  });
  tagScraperQueryInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    searchTagSuggestions().catch((error) => {
      tagScraperStatus.textContent = error.message || 'Unable to search MusicBrainz.';
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

  rescanButton.addEventListener('click', async () => {
    rescanButton.disabled = true;
    rescanButton.textContent = 'Rescanning...';
    try {
      const library = await fetchJson('/api/rescan', { method: 'POST' });
      hydrateLibrary({ title: state.title }, library);
      sanitizeStoredFavorites();
      render();
      updatePlayerUi();
    } finally {
      rescanButton.disabled = false;
      rescanButton.textContent = 'Rescan library';
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
    openTagEditor(album);
  });

  favoriteAlbumButton.addEventListener('click', () => {
    const album = getCurrentAlbum();
    if (!album) return;
    toggleFavoriteAlbum(album.id);
  });

  playPauseButton.addEventListener('click', () => togglePlayback());
  prevButton.addEventListener('click', () => playPreviousTrack());
  nextButton.addEventListener('click', () => playNextTrack());
  shuffleButton.addEventListener('click', toggleShuffle);
  repeatButton.addEventListener('click', cycleRepeatMode);
  playerCover.addEventListener('click', (event) => {
    event.stopPropagation();
    handleNowPlayingClick();
  });
  playerCoverFallback.addEventListener('click', (event) => {
    event.stopPropagation();
    handleNowPlayingClick();
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
    updatePlayerUi();
    render();
  });
  audioPlayer.addEventListener('pause', () => {
    stopLyricsTicker();
    updateProgressUi();
    updatePlayerUi();
    render();
  });
  audioPlayer.addEventListener('loadedmetadata', () => {
    updateProgressUi();
    updateFullscreenLyricsHighlight({ forceScroll: true });
  });
  audioPlayer.addEventListener('timeupdate', () => {
    updateProgressUi();
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

  volumeButton.addEventListener('click', toggleMute);
  fullscreenVolumeButton.addEventListener('click', toggleMute);
  playerTrackInfo.addEventListener('click', handleNowPlayingClick);

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
  state.trackMap = new Map(library.tracks.map((track) => [track.id, track]));
  state.albumMap = new Map(library.albums.map((album) => [album.id, album]));
  state.homeAlbumIds = getRandomAlbumIds(library.albums, 50);
  appTitle.textContent = getDisplayTitle();
  libraryStatus.textContent = `Library indexed on ${formatTimestamp(library.generatedAt)}.`;
}

function sanitizeStoredFavorites() {
  state.favoriteTrackIds = new Set([...state.favoriteTrackIds].filter((id) => state.trackMap.has(id)));
  state.favoriteAlbumIds = new Set([...state.favoriteAlbumIds].filter((id) => state.albumMap.has(id)));
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

  if (['home', 'library', 'favorites', 'settings'].includes(storedPlayback.browseView)) {
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
  audioPlayer.playbackRate = Number(state.settings.playbackSpeed) || 1;
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
  } else if (artistMatch && getArtistGroup(decodeURIComponent(artistMatch[1]))) {
    state.route = {
      view: 'artist',
      albumId: null,
      artistName: decodeURIComponent(artistMatch[1]),
    };
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
}

function openAlbum(albumId) {
  window.location.hash = `album/${encodeURIComponent(albumId)}`;
}

function openArtist(artistName) {
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
  const isArtistView = state.route.view === 'artist' && !!currentArtist;
  const isFavoritesView = state.route.view === 'favorites';
  const isSettingsView = state.route.view === 'settings';
  const isFullscreenView = state.route.view === 'fullscreen';
  const isLibraryView = state.route.view === 'library' && !isAlbumView && !isArtistView;
  const isHomeView = state.route.view === 'home' && !isAlbumView && !isArtistView;

  albumCount.textContent = String(filteredAlbums.length);
  trackCount.textContent = String(filteredTracks.length);

  homeView.hidden = !isHomeView;
  libraryView.hidden = !isLibraryView;
  favoritesView.hidden = !isFavoritesView;
  settingsView.hidden = !isSettingsView;
  artistView.hidden = !isArtistView;
  albumView.hidden = !isAlbumView;
  fullscreenOverlay.hidden = !isFullscreenView;
  backButton.hidden = !isAlbumView && !isArtistView;
  clearSearchButton.hidden = !state.searchTerm;
  homeHero.hidden = !isHomeView;
  document.body.dataset.view = state.route.view;

  navHome.classList.toggle('is-active', state.route.view === 'home');
  navLibrary.classList.toggle('is-active', state.route.view === 'library');
  navFavorites.classList.toggle('is-active', state.route.view === 'favorites');
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
  } else if (isSettingsView) {
    renderSettingsView();
  } else if (isFullscreenView) {
    renderFullscreenView();
  } else {
    renderAlbumCollection(albumGrid, homeAlbums, 'No albums matched this search.');
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

function renderSettingsView() {
  settingsTabs.innerHTML = SETTINGS_TABS.map(([id, label]) => {
    const active = state.settingsTab === id;
    return `<button class="settings-tab${active ? ' is-active' : ''}" type="button" role="tab" aria-selected="${active}" data-settings-tab="${id}">${label}</button>`;
  }).join('');

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
      <label class="settings-field compact">
        <span>Custom Accent</span>
        <input type="color" data-setting="customAccent" value="${escapeHtml(state.settings.customAccent)}" />
      </label>
      <label class="settings-field">
        <span>Custom Theme Base</span>
        <select data-setting="customThemeBase">
          ${selectOptions([
            ['dark', 'Dark'],
            ['light', 'Light'],
          ], state.settings.customThemeBase)}
        </select>
      </label>
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
      <label class="settings-field">
        <span>Library Title</span>
        <input type="text" data-setting="libraryTitle" value="${escapeHtml(state.settings.libraryTitle)}" placeholder="${escapeHtml(state.title)}" />
      </label>
      <label class="settings-field">
        <span>Home Eyebrow</span>
        <input type="text" data-setting="homeBannerEyebrow" value="${escapeHtml(state.settings.homeBannerEyebrow)}" />
      </label>
      <label class="settings-field">
        <span>Home Banner Title</span>
        <input type="text" data-setting="homeBannerTitle" value="${escapeHtml(state.settings.homeBannerTitle)}" />
      </label>
      <label class="settings-field">
        <span>Home Banner Subtitle</span>
        <input type="text" data-setting="homeBannerSubtitle" value="${escapeHtml(state.settings.homeBannerSubtitle)}" />
      </label>
    `)}
    ${settingsGroup('Visuals', 'Local equivalents of Monochrome appearance toggles.', `
      ${settingToggle('albumCoverBackground', 'Album Cover Background', 'Use cover art as the blurred album-page backdrop.')}
      ${settingToggle('dynamicColors', 'Dynamic Colors', 'Reserved for future cover-palette accents. Your custom accent is used today.')}
      ${settingToggle('compactAlbums', 'Compact Albums', 'Use denser album cards across browse grids.')}
      ${settingToggle('compactArtists', 'Compact Artists', 'Use smaller artist cards in the artist browser.')}
    `)}
  `;
}

function renderInterfaceSettings() {
  return `
    ${settingsGroup('Sidebar', 'Choose which local navigation links are visible.', `
      ${settingToggle('showHome', 'Show Home in Sidebar', 'Display the Home link in sidebar navigation.')}
      ${settingToggle('showLibrary', 'Show Library in Sidebar', 'Display the Library link in sidebar navigation.')}
      ${settingToggle('showFavorites', 'Show Favorites in Sidebar', 'Display the Favorites link in sidebar navigation.')}
      <div class="setting-row is-disabled">
        <div><strong>Show Settings in Sidebar</strong><span>Always visible so you cannot lock yourself out.</span></div>
        <span class="settings-pill">Always on</span>
      </div>
    `)}
    ${settingsGroup('Navigation', 'Interaction behavior adapted to this local app.', `
      ${settingToggle('closePanelsOnNavigation', 'Close Panels on Navigation', 'Close queue and editor panels when switching views.')}
      <label class="settings-field">
        <span>Now Playing Click Action</span>
        <select data-setting="nowPlayingClickAction">
          ${selectOptions([
            ['album', 'Go to Album'],
            ['fullscreen', 'Go to Now Playing'],
            ['artist', 'Go to Artist'],
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
      <label class="settings-field">
        <span>Streaming Quality</span>
        <select data-setting="playbackQuality">
          ${selectOptions([
            ['auto', 'Auto (Original File)'],
            ['hires', 'Prefer Hi-Res Labels'],
            ['lossless', 'Prefer Lossless Labels'],
            ['mp3', 'Prefer MP3 Compatible'],
          ], state.settings.playbackQuality)}
        </select>
      </label>
      ${settingToggle('showQualityInfo', 'Show Quality Badges', 'Show the audio quality block in the player.')}
      ${settingToggle('gaplessPlayback', 'Gapless Playback', 'Keep queue transitions automatic. True gapless depends on browser decoding.')}
      <label class="settings-field">
        <span>ReplayGain Mode</span>
        <select data-setting="replayGainMode">
          ${selectOptions([['off', 'Off'], ['track', 'Track'], ['album', 'Album']], state.settings.replayGainMode)}
        </select>
      </label>
      ${settingToggle('monoAudio', 'Mono Audio', 'Saved for future Web Audio processing.')}
      ${settingToggle('exponentialVolume', 'Exponential Volume', 'Use a softer low-volume curve.')}
      <label class="settings-field">
        <span>Playback Speed <strong>${state.settings.playbackSpeed}x</strong></span>
        <input type="range" min="0.25" max="3" step="0.05" data-setting="playbackSpeed" value="${state.settings.playbackSpeed}" />
      </label>
      ${settingToggle('preservePitch', 'Preserve Pitch', 'Keep original pitch when changing playback speed.')}
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
  return `
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
  }
  updateSetting(key, value, event.type === 'input');
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
    rescanButton.click();
    showSettingsStatus('Rescan started.');
  } else if (action === 'check-instance') {
    fetchJson('/api/config')
      .then(() => showSettingsStatus('Local API is online.'))
      .catch(() => showSettingsStatus('Local API check failed.'));
  }
}

function updateSetting(key, value, avoidFullRender = false) {
  state.settings = {
    ...state.settings,
    [key]: value,
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
  document.body.classList.toggle('no-album-cover-background', !state.settings.albumCoverBackground);
  document.body.classList.toggle('compact-albums', state.settings.compactAlbums);
  document.body.classList.toggle('compact-artists', state.settings.compactArtists);
  document.body.classList.toggle('player-layout-qobuz', state.settings.playerLayout === 'qobuz');

  const displayTitle = getDisplayTitle();
  appTitle.textContent = displayTitle;
  document.title = `${displayTitle} | Local Streamer`;
  homeHeroEyebrow.textContent = state.settings.homeBannerEyebrow || DEFAULT_SETTINGS.homeBannerEyebrow;
  homeHeroTitle.textContent = state.settings.homeBannerTitle || DEFAULT_SETTINGS.homeBannerTitle;
  homeHeroSubtitle.textContent = state.settings.homeBannerSubtitle || DEFAULT_SETTINGS.homeBannerSubtitle;

  navHome.hidden = !state.settings.showHome;
  navLibrary.hidden = !state.settings.showLibrary;
  navFavorites.hidden = !state.settings.showFavorites;

  audioPlayer.playbackRate = Number(state.settings.playbackSpeed) || 1;
  audioPlayer.preservesPitch = Boolean(state.settings.preservePitch);
  audioPlayer.mozPreservesPitch = Boolean(state.settings.preservePitch);
  audioPlayer.webkitPreservesPitch = Boolean(state.settings.preservePitch);
  audioPlayer.volume = getEffectiveVolume(state.volume);
  audioQualityInfo.hidden = !state.settings.showQualityInfo || !state.currentTrackId;
  const currentTrack = state.trackMap.get(state.currentTrackId);
  if (currentTrack) {
    downloadTrackLink.download = formatDownloadName(currentTrack);
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

function selectOptions(options, selectedValue) {
  return options.map(([value, label]) => (
    `<option value="${escapeHtml(value)}" ${String(selectedValue) === String(value) ? 'selected' : ''}>${escapeHtml(label)}</option>`
  )).join('');
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

function setLibraryTab(tab) {
  state.libraryTab = tab;
  render();
}

function renderLibraryView(filteredTracks, filteredAlbums) {
  const tabs = [
    ['folders', libraryTabFolders, libraryPanelFolders],
    ['albums', libraryTabAlbums, libraryPanelAlbums],
    ['artists', libraryTabArtists, libraryPanelArtists],
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
  } else {
    libraryBrowserCaption.textContent = 'Smart playlists built from your local library state.';
    renderPlaylistsBrowser(filteredTracks);
  }
}

function renderLibraryAlbumsPanel(albums) {
  libraryPanelAlbums.innerHTML = '';

  if (albums.length === 0) {
    libraryPanelAlbums.innerHTML = '<p class="empty-state">No albums matched this search.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'library-album-grid';
  for (const album of albums) {
    grid.append(createAlbumCard(album, { compact: true }));
  }
  libraryPanelAlbums.append(grid);
}

function renderFolderBrowser(filteredTracks) {
  libraryPanelFolders.innerHTML = '';

  if (filteredTracks.length === 0) {
    libraryPanelFolders.innerHTML = '<p class="empty-state">No folders matched this search.</p>';
    return;
  }

  const tree = buildFolderTree(filteredTracks);
  const fragment = document.createDocumentFragment();

  for (const folder of tree.folders.values()) {
    fragment.append(createFolderNode(folder, filteredTracks, folder.name));
  }

  libraryPanelFolders.append(fragment);
}

function renderArtistsBrowser(filteredTracks) {
  libraryPanelArtists.innerHTML = '';

  const artists = buildArtistGroups(filteredTracks);
  if (artists.length === 0) {
    libraryPanelArtists.innerHTML = '<p class="empty-state">No artists matched this search.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'artist-card-grid';
  for (const artist of artists) {
    grid.append(createArtistCard(artist));
  }
  libraryPanelArtists.append(grid);
}

function renderPlaylistsBrowser(filteredTracks) {
  libraryPanelPlaylists.innerHTML = '';

  const playlists = getSmartPlaylists(filteredTracks);
  if (!playlists.some((playlist) => playlist.id === state.selectedPlaylistId)) {
    state.selectedPlaylistId = playlists[0]?.id ?? 'favorites-tracks';
  }

  const shell = document.createElement('div');
  shell.className = 'playlist-browser';

  const list = document.createElement('div');
  list.className = 'playlist-list';
  const detail = document.createElement('div');
  detail.className = 'playlist-detail';

  for (const playlist of playlists) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `playlist-card${playlist.id === state.selectedPlaylistId ? ' is-active' : ''}`;
    card.innerHTML = `
      <strong>${escapeHtml(playlist.title)}</strong>
      <span>${playlist.tracks.length} track${playlist.tracks.length === 1 ? '' : 's'}</span>
      <p>${escapeHtml(playlist.description)}</p>
    `;
    card.addEventListener('click', () => {
      state.selectedPlaylistId = playlist.id;
      render();
    });
    list.append(card);
  }

  const activePlaylist = playlists.find((playlist) => playlist.id === state.selectedPlaylistId) ?? playlists[0];
  detail.innerHTML = `
    <div class="playlist-detail-header">
      <div>
        <h4>${escapeHtml(activePlaylist.title)}</h4>
        <p>${escapeHtml(activePlaylist.description)}</p>
      </div>
    </div>
    <div class="track-list"></div>
  `;

  const trackList = detail.querySelector('.track-list');
  if (activePlaylist.tracks.length === 0) {
    trackList.innerHTML = '<p class="empty-state">This playlist is empty right now.</p>';
  } else {
    for (const track of activePlaylist.tracks) {
      trackList.append(createTrackRow(track, activePlaylist.tracks));
    }
  }

  shell.append(list, detail);
  libraryPanelPlaylists.append(shell);
}

function createArtistCard(artist) {
  const info = state.artistInfoMap.get(artist.name) || null;
  const card = document.createElement('article');
  card.className = 'artist-card';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Open ${artist.name}`);
  card.innerHTML = `
    <div class="artist-card-image">
      ${info?.imageUrl
        ? `<img src="${info.imageUrl}" alt="${escapeHtml(artist.name)} artist image" loading="lazy">`
        : createArtistPlaceholder(artist.name)}
      <button type="button" class="artist-card-play" aria-label="Play ${escapeHtml(artist.name)}">
        ${materialIcon('play')}
      </button>
    </div>
    <strong>${escapeHtml(artist.name)}</strong>
  `;
  card.addEventListener('click', () => openArtist(artist.name));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openArtist(artist.name);
    }
  });
  card.querySelector('.artist-card-play').addEventListener('click', (event) => {
    event.stopPropagation();
    playArtistFromCard(artist);
  });
  loadArtistInfo(artist.name);
  return card;
}

function playArtistFromCard(artist) {
  if (artist.tracks.length === 0) return;
  state.shuffleActive = false;
  rebuildShuffledQueue();
  playTrack(artist.tracks[0], artist.tracks);
}

function renderArtistDetail(artist) {
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
  for (const album of artist.albums) {
    artistAlbumGrid.append(createAlbumCard(album, { compact: true }));
  }

  loadArtistInfo(artist.name);
}

function openArtistEditor(artist) {
  const info = state.artistInfoMap.get(artist.name) || null;
  state.artistEditorName = artist.name;
  artistEditorTitle.textContent = `Edit ${artist.name}`;
  artistImageUrlInput.value = info?.imageUrl || '';
  artistBioInput.value = info?.bio || '';
  artistSourceUrlInput.value = info?.sourceUrl || '';
  artistEditorModal.hidden = false;
  artistEditorOverlay.hidden = false;
  artistImageUrlInput.focus();
}

function closeArtistEditor() {
  state.artistEditorName = '';
  artistEditorModal.hidden = true;
  artistEditorOverlay.hidden = true;
}

async function saveArtistEditor() {
  if (!state.artistEditorName) return;
  artistEditorSaveButton.disabled = true;
  try {
    const info = await fetchJson(`/api/artists/${encodeURIComponent(state.artistEditorName)}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: artistImageUrlInput.value.trim(),
        bio: artistBioInput.value.trim(),
        sourceUrl: artistSourceUrlInput.value.trim(),
      }),
    });
    state.artistInfoMap.set(state.artistEditorName, info);
    closeArtistEditor();
    render();
  } finally {
    artistEditorSaveButton.disabled = false;
  }
}

async function resetArtistEditor() {
  if (!state.artistEditorName || !window.confirm('Clear edited artist image and info?')) return;
  artistEditorResetButton.disabled = true;
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
    artistEditorResetButton.disabled = false;
  }
}

function renderAlbumCollection(container, albums, emptyMessage) {
  container.innerHTML = '';

  if (albums.length === 0) {
    container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    return;
  }

  for (const album of albums) {
    container.append(createAlbumCard(album, { compact: false }));
  }
}

function renderTrackCollection(container, tracks, queueTracks, emptyMessage) {
  container.innerHTML = '';

  if (tracks.length === 0) {
    container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    return;
  }

  for (const track of tracks) {
    container.append(createTrackRow(track, queueTracks));
  }
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

  albumDetailFormat.innerHTML = `
    ${renderMediaTypeIcons(album, { includeLabels: true })}
    ${renderAudioQualityBadge(album.audioQuality, { includeLabel: true })}
  `;
  albumDetailTitle.textContent = album.title;
  albumDetailArtist.textContent = `By ${album.artist}`;
  albumDetailMeta.textContent = [
    ...albumFacts,
    `${allAlbumTracks.length} track${allAlbumTracks.length === 1 ? '' : 's'}`,
    state.searchTerm ? `filtered by "${state.searchTerm}"` : '',
  ].filter(Boolean).join(' • ');
  favoriteAlbumButton.classList.toggle('active', favorite);
  favoriteAlbumButton.setAttribute('aria-pressed', String(favorite));
  favoriteAlbumButton.setAttribute('aria-label', favorite ? 'Unfavorite album' : 'Favorite album');
  favoriteAlbumButton.title = favorite ? 'Unfavorite album' : 'Favorite album';
  favoriteAlbumButton.innerHTML = materialIcon('favorite', { filled: favorite });
  editAlbumCoverButton.title = 'Edit album tags';
  editAlbumCoverButton.setAttribute('aria-label', 'Edit album tags');
  editAlbumCoverButton.innerHTML = materialIcon('edit');

  setImageOrFallback({
    imageElement: albumDetailCover,
    fallbackElement: albumDetailCoverFallback,
    src: album.coverUrl || heroTrack?.coverUrl || '',
    alt: `${album.title} cover art`,
  });

  if (album.coverUrl || heroTrack?.coverUrl) {
    albumHero.style.setProperty('--album-cover', `url("${album.coverUrl || heroTrack.coverUrl}")`);
  } else {
    albumHero.style.removeProperty('--album-cover');
  }

  albumTrackList.innerHTML = '';
  if (albumTracks.length === 0) {
    albumTrackList.innerHTML = '<p class="empty-state">No tracks matched this album search.</p>';
  } else {
    for (const track of albumTracks) {
      albumTrackList.append(createAlbumTrackRow(track, allAlbumTracks));
    }
  }

  renderRelatedAlbums({
    section: moreAlbumsSection,
    titleElement: moreAlbumsTitle,
    grid: moreAlbumsGrid,
    albums: fullAlbums,
    title: `More albums from ${album.artist}`,
  });

  renderRelatedAlbums({
    section: epsSection,
    titleElement: epsTitle,
    grid: epsGrid,
    albums: epAlbums,
    title: `EPs and Singles from ${album.artist}`,
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
  for (const album of albums) {
    grid.append(createAlbumCard(album, { compact: true }));
  }
}

function renderQueuePanel() {
  const queueIds = getPlaybackQueue();
  const queue = queueIds.map((id) => state.trackMap.get(id)).filter(Boolean);

  queuePanel.hidden = !state.queueOpen;
  queueOverlay.hidden = !state.queueOpen;
  queueList.innerHTML = '';

  queueDownloadButton.disabled = queue.length === 0;
  queueFavoriteButton.disabled = queue.length === 0;
  queueClearButton.disabled = queue.length === 0 || (queue.length === 1 && queue[0].id === state.currentTrackId);

  if (queue.length === 0) {
    queueList.innerHTML = '<p class="empty-state">Your queue is empty.</p>';
    return;
  }

  for (const [index, track] of queue.entries()) {
    const favorite = isFavoriteTrack(track.id);
    const isCurrent = track.id === state.currentTrackId;
    const item = document.createElement('article');
    item.className = `queue-item${isCurrent ? ' is-active' : ''}`;
    item.draggable = true;
    item.dataset.trackId = track.id;
    item.innerHTML = `
      <button type="button" class="queue-drag-handle" aria-label="Drag ${escapeHtml(track.title)}">
        ${materialIcon('drag')}
      </button>
      ${track.coverUrl
        ? `<img src="${track.coverUrl}" alt="${escapeHtml(track.album)} cover art" loading="lazy">`
        : createCoverPlaceholder('Track', 'queue-thumb-fallback')}
      <button type="button" class="queue-item-main" aria-label="Play ${escapeHtml(track.title)}">
        <div class="queue-item-copy">
          <strong>${escapeHtml(track.title)}</strong>
          <span>${escapeHtml(track.artist)}</span>
        </div>
      </button>
      <div class="queue-item-trailing">
        <span class="queue-item-index">${index + 1}</span>
        <div class="queue-item-actions">
          <button type="button" class="queue-item-favorite${favorite ? ' active' : ''}" aria-label="${favorite ? 'Unfavorite' : 'Favorite'} ${escapeHtml(track.title)}">
            ${materialIcon('favorite', { filled: favorite })}
          </button>
          <button type="button" class="queue-item-remove" aria-label="Remove ${escapeHtml(track.title)} from queue"${isCurrent ? ' disabled' : ''}>
            ${materialIcon('remove')}
          </button>
        </div>
      </div>
    `;

    const mainButton = item.querySelector('.queue-item-main');
    const favoriteButton = item.querySelector('.queue-item-favorite');
    const removeButton = item.querySelector('.queue-item-remove');

    mainButton.addEventListener('click', () => playTrackById(track.id));
    favoriteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleFavoriteTrack(track.id);
    });
    removeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      removeTrackFromQueue(track.id);
    });

    item.addEventListener('dragstart', (event) => {
      state.draggingQueueTrackId = track.id;
      item.classList.add('is-dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', track.id);
      }
    });

    item.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (state.draggingQueueTrackId && state.draggingQueueTrackId !== track.id) {
        clearQueueDropTargets();
        item.classList.add('drop-target');
      }
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drop-target');
    });

    item.addEventListener('drop', (event) => {
      event.preventDefault();
      const dragTrackId = state.draggingQueueTrackId || event.dataTransfer?.getData('text/plain');
      clearQueueDropTargets();
      reorderQueue(dragTrackId, track.id);
    });

    item.addEventListener('dragend', () => {
      state.draggingQueueTrackId = null;
      clearQueueDropTargets();
      item.classList.remove('is-dragging');
    });

    queueList.append(item);
  }
}

function createAlbumCard(album, { compact }) {
  const card = document.createElement('article');
  card.className = compact ? 'album-card compact' : 'album-card';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Open ${album.title} by ${album.artist}`);
  card.innerHTML = `
    <div class="album-card-media">
      ${album.coverUrl
        ? `<img src="${album.coverUrl}" alt="${escapeHtml(album.title)} cover art" loading="lazy">`
        : createCoverPlaceholder('Album')}
      ${renderAudioQualityBadge(album.audioQuality)}
      <button type="button" class="album-card-play" aria-label="Play ${escapeHtml(album.title)}">
        ${materialIcon('play')}
      </button>
    </div>
    <div class="meta">
      <h4>${escapeHtml(album.title)}</h4>
      <p>${escapeHtml(album.artist)}</p>
      <p class="album-card-year">${escapeHtml(album.year || 'Unknown year')}</p>
      <div class="album-card-footer${isWantedAlbum(album) ? ' is-wanted' : ''}">
        <p class="album-card-format" title="${escapeHtml(album.status || 'Collection')}">${renderMediaTypeIcons(album)}</p>
      </div>
    </div>
  `;

  card.addEventListener('click', () => openAlbum(album.id));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openAlbum(album.id);
    }
  });
  card.querySelector('.album-card-play').addEventListener('click', (event) => {
    event.stopPropagation();
    playAlbumFromCard(album);
  });
  return card;
}

function playAlbumFromCard(album) {
  const tracks = getAlbumTracks(album.id);
  if (tracks.length === 0) return;
  state.shuffleActive = false;
  rebuildShuffledQueue();
  playTrack(tracks[0], tracks);
}

function openTagEditor(album) {
  state.tagEditorAlbumId = album.id;
  state.tagEditorMusicBrainzId = album.musicBrainzId || '';
  state.tagEditorSuggestions = [];

  const tracks = getAlbumTracks(album.id);
  tagEditorTitle.textContent = `Edit ${album.title}`;
  tagEditorCaption.textContent = 'These edits are saved as local overrides. Your original audio files are not rewritten.';
  tagAlbumTitleInput.value = album.title || '';
  tagAlbumArtistInput.value = album.albumArtist || album.artist || '';
  tagAlbumDateInput.value = album.year || extractYear(album.date) || '';
  tagAlbumGenreInput.value = album.genre || '';
  setSelectedMediaTypes(album.mediaTypes || album.mediaType || ['Digital Media']);
  tagAlbumStatusInput.value = album.status || 'Collection';
  tagAlbumCoverUrlInput.value = album.customCoverUrl || album.coverUrl || '';
  tagScraperQueryInput.value = `${album.artist || ''} ${album.title || ''}`.trim();
  tagScraperStatus.textContent = 'Search MusicBrainz to fill this album automatically.';
  tagScraperResults.innerHTML = '';

  renderTagTrackEditor(tracks);
  syncTagEditorCoverPreview();

  tagEditorModal.hidden = false;
  tagEditorOverlay.hidden = false;
  tagAlbumTitleInput.focus();
}

function closeTagEditor() {
  state.tagEditorAlbumId = null;
  state.tagEditorMusicBrainzId = '';
  state.tagEditorSuggestions = [];
  tagEditorModal.hidden = true;
  tagEditorOverlay.hidden = true;
}

function renderTagTrackEditor(tracks) {
  tagTrackList.innerHTML = '';
  if (tracks.length === 0) {
    tagTrackList.innerHTML = '<p class="empty-state">This album has no tracks to edit.</p>';
    return;
  }

  const tracksByDisc = new Map();
  for (const track of tracks) {
    const discNumber = track.discNumber || 1;
    if (!tracksByDisc.has(discNumber)) {
      tracksByDisc.set(discNumber, []);
    }
    tracksByDisc.get(discNumber).push(track);
  }

  const sortedDiscs = [...tracksByDisc.entries()].sort(([discA], [discB]) => Number(discA) - Number(discB));
  for (const [discNumber, discTracks] of sortedDiscs) {
    const discCard = document.createElement('article');
    discCard.className = 'tag-disc-card';
    discCard.innerHTML = `
      <header class="tag-disc-card-header">
        <div>
          <span class="label">Disc</span>
          <strong>${escapeHtml(discNumber)}</strong>
        </div>
        <span>${discTracks.length} track${discTracks.length === 1 ? '' : 's'}</span>
      </header>
      <div class="tag-disc-track-header" aria-hidden="true">
        <span>#</span>
        <span>Title</span>
        <span>Artist</span>
      </div>
      <div class="tag-disc-track-list"></div>
    `;

    const discTrackList = discCard.querySelector('.tag-disc-track-list');
    for (const track of discTracks) {
      const row = document.createElement('div');
      row.className = 'tag-track-row';
      row.dataset.trackId = track.id;
      row.dataset.discNumber = String(track.discNumber || discNumber);
      row.innerHTML = `
        <input class="tag-track-number" type="number" min="1" value="${escapeHtml(track.trackNumber || '')}" aria-label="Track number" />
        <input class="tag-track-title" type="text" value="${escapeHtml(track.title)}" aria-label="Track title" />
        <input class="tag-track-artist" type="text" value="${escapeHtml(track.artist)}" aria-label="Track artist" />
      `;
      discTrackList.append(row);
    }

    tagTrackList.append(discCard);
  }
}

function syncTagEditorCoverPreview() {
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

  tagScraperSearchButton.disabled = true;
  tagScraperStatus.textContent = 'Searching MusicBrainz...';
  tagScraperResults.innerHTML = '';

  try {
    const query = tagScraperQueryInput.value.trim();
    const result = await fetchJson(`/api/albums/${encodeURIComponent(albumId)}/tag-suggestions?q=${encodeURIComponent(query)}`);
    state.tagEditorSuggestions = result.suggestions || [];
    renderTagSuggestions();
    tagScraperStatus.textContent = state.tagEditorSuggestions.length
      ? `Found ${state.tagEditorSuggestions.length} possible release${state.tagEditorSuggestions.length === 1 ? '' : 's'}.`
      : 'No MusicBrainz releases found. Try a simpler artist + album search.';
  } finally {
    tagScraperSearchButton.disabled = false;
  }
}

function renderTagSuggestions() {
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
        tagScraperStatus.textContent = error.message || 'Unable to apply MusicBrainz result.';
      });
    });
    tagScraperResults.append(card);
  }
}

async function applyTagSuggestion(suggestion) {
  tagScraperStatus.textContent = `Loading track list for ${suggestion.title}...`;
  const detail = await fetchJson(`/api/musicbrainz/releases/${encodeURIComponent(suggestion.id)}`);
  state.tagEditorMusicBrainzId = detail.id || suggestion.id || '';

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

  tagScraperStatus.textContent = `Applied MusicBrainz release${detail.sourceUrl ? `: ${detail.sourceUrl}` : '.'}`;
}

async function saveTagEditor() {
  const albumId = state.tagEditorAlbumId;
  if (!albumId) return;

  tagEditorSaveButton.disabled = true;
  tagScraperStatus.textContent = 'Saving local tag overrides...';

  try {
    const payload = collectTagEditorPayload();
    tagScraperStatus.textContent = 'Saving local tag overrides...';
    const result = await fetchJson(`/api/albums/${encodeURIComponent(albumId)}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    hydrateLibrary({ title: state.title }, result.library);
    sanitizeStoredFavorites();
    closeTagEditor();
    render();
    updatePlayerUi();
  } finally {
    tagEditorSaveButton.disabled = false;
  }
}

async function resetTagEditor() {
  const albumId = state.tagEditorAlbumId;
  if (!albumId || !window.confirm('Clear all local tag overrides for this album?')) return;

  tagEditorResetButton.disabled = true;
  tagScraperStatus.textContent = 'Resetting local tag overrides...';

  try {
    const result = await fetchJson(`/api/albums/${encodeURIComponent(albumId)}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset: true }),
    });
    hydrateLibrary({ title: state.title }, result.library);
    sanitizeStoredFavorites();
    closeTagEditor();
    render();
    updatePlayerUi();
  } finally {
    tagEditorResetButton.disabled = false;
  }
}

function collectTagEditorPayload() {
  const tracks = [...tagTrackList.querySelectorAll('.tag-track-row')].map((row) => ({
    id: row.dataset.trackId,
    title: row.querySelector('.tag-track-title').value.trim(),
    artist: row.querySelector('.tag-track-artist').value.trim(),
    trackNumber: row.querySelector('.tag-track-number').value.trim(),
    discNumber: row.dataset.discNumber || '1',
  }));

  return {
    albumTitle: tagAlbumTitleInput.value.trim(),
    albumArtist: tagAlbumArtistInput.value.trim(),
    date: tagAlbumDateInput.value.trim(),
    year: tagAlbumDateInput.value.trim(),
    genre: tagAlbumGenreInput.value.trim(),
    mediaTypes: getSelectedMediaTypes(),
    status: tagAlbumStatusInput.value,
    coverUrl: tagAlbumCoverUrlInput.value.trim(),
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
  lyricsEditorTitle.textContent = `Lyrics for ${track.title}`;
  lyricsEditorCaption.textContent = `${track.artist} • ${track.album}`;
  lyricsSyncedInput.value = cachedLyrics?.syncedLyrics || '';
  lyricsPlainInput.value = cachedLyrics?.plainLyrics || '';
  lyricsScraperQueryInput.value = `${track.artist} ${track.title}`;
  lyricsScraperStatus.textContent = 'Search LRCLIB for synced or plain lyrics.';
  lyricsScraperResults.innerHTML = '';
  lyricsEditorOverlay.hidden = false;
  lyricsEditorModal.hidden = false;
  loadTrackLyrics(track.id, { force: true })
    .then(() => {
      const lyrics = state.lyricsMap.get(track.id);
      lyricsSyncedInput.value = lyrics?.syncedLyrics || lyricsSyncedInput.value;
      lyricsPlainInput.value = lyrics?.plainLyrics || lyricsPlainInput.value;
    })
    .catch((error) => {
      lyricsScraperStatus.textContent = error.message || 'Unable to load saved lyrics.';
    });
}

function closeLyricsEditor() {
  state.lyricsEditorTrackId = '';
  state.lyricsSuggestions = [];
  lyricsEditorOverlay.hidden = true;
  lyricsEditorModal.hidden = true;
}

async function searchLyricsSuggestions() {
  const trackId = state.lyricsEditorTrackId;
  if (!trackId) return;
  lyricsScraperSearchButton.disabled = true;
  lyricsScraperStatus.textContent = 'Searching LRCLIB...';
  lyricsScraperResults.innerHTML = '';
  try {
    const query = lyricsScraperQueryInput.value.trim();
    const suggestions = await fetchJson(`/api/tracks/${encodeURIComponent(trackId)}/lyrics-suggestions?q=${encodeURIComponent(query)}`);
    state.lyricsSuggestions = suggestions;
    if (suggestions.length === 0) {
      lyricsScraperStatus.textContent = 'No lyrics found. You can paste lyrics manually.';
      return;
    }
    lyricsScraperStatus.textContent = `${suggestions.length} result${suggestions.length === 1 ? '' : 's'} found.`;
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
        lyricsSyncedInput.value = suggestion.syncedLyrics || '';
        lyricsPlainInput.value = suggestion.plainLyrics || '';
        lyricsScraperStatus.textContent = suggestion.syncedLyrics
          ? 'Synced lyrics loaded. Save to keep them locally.'
          : 'Plain lyrics loaded. Save to keep them locally.';
      });
    });
  } finally {
    lyricsScraperSearchButton.disabled = false;
  }
}

async function saveLyricsEditor() {
  const trackId = state.lyricsEditorTrackId;
  if (!trackId) return;
  lyricsEditorSaveButton.disabled = true;
  lyricsScraperStatus.textContent = 'Saving lyrics...';
  try {
    const syncedInput = lyricsSyncedInput.value.trim();
    const plainInput = lyricsPlainInput.value.trim();
    const plainHasTimestamps = !syncedInput && parseSyncedLyrics(plainInput).length > 0;
    lyricsScraperStatus.textContent = 'Saving lyrics and .lrc sidecar...';
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
    lyricsEditorSaveButton.disabled = false;
  }
}

async function resetLyricsEditor() {
  const trackId = state.lyricsEditorTrackId;
  if (!trackId || !window.confirm('Remove saved lyrics for this track?')) return;
  lyricsEditorResetButton.disabled = true;
  try {
    await fetchJson(`/api/tracks/${encodeURIComponent(trackId)}/lyrics`, {
      method: 'POST',
      body: JSON.stringify({ reset: true }),
    });
    state.lyricsRefreshRequestedIds.delete(trackId);
    await loadTrackLyrics(trackId, { force: true });
    lyricsSyncedInput.value = '';
    lyricsPlainInput.value = '';
    renderFullscreenView();
    lyricsScraperStatus.textContent = 'Lyrics reset.';
  } finally {
    lyricsEditorResetButton.disabled = false;
  }
}

function createTrackRow(track, queueTracks) {
  const favorite = isFavoriteTrack(track.id);
  const playing = track.id === state.currentTrackId && !audioPlayer.paused;
  const row = document.createElement('article');
  row.className = `track-row${track.id === state.currentTrackId ? ' is-active' : ''}`;
  row.innerHTML = `
    ${track.coverUrl
      ? `<img src="${track.coverUrl}" alt="${escapeHtml(track.album)} cover art" loading="lazy">`
      : createCoverPlaceholder('Track', 'track-thumb-placeholder')}
    <div class="track-copy">
      <h4>${escapeHtml(track.title)}</h4>
      <p>${escapeHtml(track.artist)} · ${escapeHtml(track.album)}</p>
    </div>
    <div class="row-actions">
      <button type="button" class="favorite-toggle-button${favorite ? ' active' : ''}" aria-label="${favorite ? 'Unfavorite' : 'Favorite'} ${escapeHtml(track.title)}">
        ${materialIcon('favorite', { filled: favorite })}
      </button>
      <button type="button" class="row-play-button" aria-label="Play ${escapeHtml(track.title)}">
        ${materialIcon(playing ? 'pause' : 'play')}
      </button>
    </div>
  `;

  row.addEventListener('click', () => playTrack(track, queueTracks));
  row.querySelector('.favorite-toggle-button').addEventListener('click', (event) => {
    event.stopPropagation();
    toggleFavoriteTrack(track.id);
  });
  row.querySelector('.row-play-button').addEventListener('click', (event) => {
    event.stopPropagation();
    if (track.id === state.currentTrackId) {
      togglePlayback();
    } else {
      playTrack(track, queueTracks);
    }
  });
  return row;
}

function createAlbumTrackRow(track, queueTracks) {
  const favorite = isFavoriteTrack(track.id);
  const playing = track.id === state.currentTrackId && !audioPlayer.paused;
  const row = document.createElement('article');
  row.className = `album-track-row${track.id === state.currentTrackId ? ' is-active' : ''}`;
  row.innerHTML = `
    <span class="track-index">${track.trackNumber ?? '•'}</span>
    <div class="track-title-group">
      <strong>${escapeHtml(track.title)}</strong>
      <span>${escapeHtml(track.artist)}</span>
    </div>
    <span class="track-album-name">${escapeHtml(track.album)}</span>
    <div class="row-actions">
      <button type="button" class="favorite-toggle-button${favorite ? ' active' : ''}" aria-label="${favorite ? 'Unfavorite' : 'Favorite'} ${escapeHtml(track.title)}">
        ${materialIcon('favorite', { filled: favorite })}
      </button>
      <button type="button" class="row-play-button" aria-label="Play ${escapeHtml(track.title)}">
        ${materialIcon(playing ? 'pause' : 'play')}
      </button>
    </div>
  `;

  row.addEventListener('click', () => playTrack(track, queueTracks));
  row.querySelector('.favorite-toggle-button').addEventListener('click', (event) => {
    event.stopPropagation();
    toggleFavoriteTrack(track.id);
  });
  row.querySelector('.row-play-button').addEventListener('click', (event) => {
    event.stopPropagation();
    if (track.id === state.currentTrackId) {
      togglePlayback();
    } else {
      playTrack(track, queueTracks);
    }
  });
  return row;
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
  audioPlayer.playbackRate = Number(state.settings.playbackSpeed) || 1;
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

function updatePlayerUi() {
  const track = state.currentTrackId ? state.trackMap.get(state.currentTrackId) : null;
  const queue = getPlaybackQueue();
  const currentIndex = track ? queue.indexOf(track.id) : -1;

  playPauseButton.innerHTML = materialIcon(audioPlayer.paused ? 'play' : 'pause');
  playPauseButton.title = audioPlayer.paused ? 'Play' : 'Pause';
  playPauseButton.setAttribute('aria-label', audioPlayer.paused ? 'Play' : 'Pause');
  fullscreenPlayPauseButton.innerHTML = materialIcon(audioPlayer.paused ? 'play' : 'pause');
  fullscreenPlayPauseButton.title = audioPlayer.paused ? 'Play' : 'Pause';
  fullscreenPlayPauseButton.setAttribute('aria-label', audioPlayer.paused ? 'Play' : 'Pause');

  shuffleButton.classList.toggle('active', state.shuffleActive);
  fullscreenShuffleButton.classList.toggle('active', state.shuffleActive);
  shuffleButton.setAttribute('aria-pressed', String(state.shuffleActive));
  fullscreenShuffleButton.setAttribute('aria-pressed', String(state.shuffleActive));
  shuffleButton.title = state.shuffleActive ? 'Shuffle on' : 'Shuffle off';
  fullscreenShuffleButton.title = state.shuffleActive ? 'Shuffle on' : 'Shuffle off';
  shuffleButton.setAttribute('aria-label', state.shuffleActive ? 'Shuffle on' : 'Shuffle off');
  fullscreenShuffleButton.setAttribute('aria-label', state.shuffleActive ? 'Shuffle on' : 'Shuffle off');
  shuffleButton.innerHTML = materialIcon('shuffle');
  fullscreenShuffleButton.innerHTML = materialIcon('shuffle');

  repeatButton.classList.toggle('active', state.repeatMode !== 'off');
  fullscreenRepeatButton.classList.toggle('active', state.repeatMode !== 'off');
  repeatButton.setAttribute('aria-pressed', String(state.repeatMode !== 'off'));
  fullscreenRepeatButton.setAttribute('aria-pressed', String(state.repeatMode !== 'off'));
  repeatButton.title = getRepeatLabel();
  fullscreenRepeatButton.title = getRepeatLabel();
  repeatButton.setAttribute('aria-label', getRepeatLabel());
  fullscreenRepeatButton.setAttribute('aria-label', getRepeatLabel());
  repeatButton.innerHTML = renderRepeatIcon();
  fullscreenRepeatButton.innerHTML = renderRepeatIcon();

  queueStatus.textContent = track && currentIndex >= 0 ? `${currentIndex + 1} of ${queue.length}` : `0 of ${queue.length}`;
  queueToggleButton.classList.toggle('active', state.queueOpen);
  queueToggleButton.setAttribute('aria-pressed', String(state.queueOpen));

  if (!track) {
    playerTitle.textContent = 'Select a track';
    playerAlbum.textContent = '';
    playerArtist.textContent = 'Your queue will appear here.';
    downloadTrackLink.href = '#';
    downloadTrackLink.setAttribute('aria-disabled', 'true');
    setImageOrFallback({
      imageElement: playerCover,
      fallbackElement: playerCoverFallback,
      src: '',
      alt: '',
    });
    audioQualityInfo.hidden = true;
    updateProgressUi();
    syncVolumeUi();
    renderFullscreenView();
    return;
  }

  playerTitle.textContent = track.title;
  playerAlbum.textContent = track.album;
  playerArtist.textContent = track.artist;
  downloadTrackLink.href = track.streamUrl;
  downloadTrackLink.download = formatDownloadName(track);
  downloadTrackLink.removeAttribute('aria-disabled');

  setImageOrFallback({
    imageElement: playerCover,
    fallbackElement: playerCoverFallback,
    src: track.coverUrl || '',
    alt: `${track.album} cover art`,
  });
  updateAudioQualityInfo(track.audioQuality);

  updateProgressUi();
  syncVolumeUi();
  renderFullscreenView();
}

function updateAudioQualityInfo(quality) {
  audioQualityInfo.hidden = !state.settings.showQualityInfo || !state.currentTrackId;
  if (!state.settings.showQualityInfo || !state.currentTrackId) return;

  const label = quality?.label || 'Audio quality unknown';
  const iconUrl = quality?.iconType ? AUDIO_QUALITY_ICONS[quality.iconType] : '';
  const labelTop = quality?.labelTop || label;
  const labelBottom = quality?.labelBottom || '';

  audioQualityInfo.title = label;
  audioQualityLabel.innerHTML = `
    <span class="audio-quality-top">${escapeHtml(labelTop)}</span>
    ${labelBottom ? `<span class="audio-quality-bottom">${escapeHtml(labelBottom)}</span>` : ''}
  `;

  if (iconUrl) {
    audioQualityIcon.hidden = false;
    audioQualityIcon.src = iconUrl;
    audioQualityIcon.alt = quality.iconType === 'cd' ? 'CD Audio' : 'Hi-Res Audio';
    audioQualityFallbackIcon.hidden = true;
  } else {
    audioQualityIcon.hidden = true;
    audioQualityIcon.removeAttribute('src');
    audioQualityIcon.alt = '';
    audioQualityFallbackIcon.hidden = false;
  }
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
    fullscreenLyricsContent.innerHTML = '<div class="fullscreen-lyrics-empty">Start playing a track to fill this view.</div>';
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
    fullscreenLyricsContent.innerHTML = syncedLines.map((line, index) => `
      <button type="button" class="fullscreen-lyric-line" data-lyric-index="${index}" data-time="${line.time}">
        <span>${escapeHtml(line.text)}</span>
      </button>
    `).join('');

    fullscreenLyricsContent.querySelectorAll('.fullscreen-lyric-line[data-time]').forEach((button) => {
      button.addEventListener('click', () => {
        audioPlayer.currentTime = Number(button.dataset.time) || 0;
        updateFullscreenLyricsHighlight({ forceScroll: true });
        persistPlaybackState();
      });
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
    fullscreenLyricsContent.innerHTML = plainLines.map((line) => `
      <div class="fullscreen-lyric-line is-plain">
        <span>${escapeHtml(line)}</span>
      </div>
    `).join('');
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
    fullscreenLyricsContent.innerHTML = '<div class="fullscreen-lyrics-empty">Your queue will appear here.</div>';
    return;
  }

  const startIndex = Math.max(0, currentIndex - 5);
  const visibleTracks = queueTracks.slice(startIndex, currentIndex + 9);
  fullscreenLyricsContent.innerHTML = visibleTracks.map((track, visibleIndex) => {
    const queueIndex = startIndex + visibleIndex;
    const distance = Math.abs(queueIndex - currentIndex);
    const active = queueIndex === currentIndex;
    const blurClass = distance > 3 ? ' is-distant' : distance > 1 ? ' is-soft' : '';
    return `
      <button type="button" class="fullscreen-lyric-line${active ? ' is-active' : ''}${blurClass}" data-track-id="${escapeHtml(track.id)}">
        <span>${escapeHtml(track.title)}</span>
        <small>${escapeHtml(track.artist)}</small>
      </button>
    `;
  }).join('');

  fullscreenLyricsContent.querySelectorAll('.fullscreen-lyric-line').forEach((button) => {
    button.addEventListener('click', () => playTrackById(button.dataset.trackId));
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
  updateFullscreenLyricsHighlight();
}

function setVolume(volume) {
  state.volume = clamp(volume, 0, 1);
  if (state.volume > 0) {
    state.lastVolume = state.volume;
  }
  audioPlayer.volume = getEffectiveVolume(state.volume);
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

function getEffectiveVolume(volume) {
  const normalized = clamp(volume, 0, 1);
  return state.settings.exponentialVolume ? normalized ** 2 : normalized;
}

function syncVolumeUi() {
  volumeFill.style.width = `${state.volume * 100}%`;
  fullscreenVolumeFill.style.width = `${state.volume * 100}%`;
  if (state.volume === 0) {
    volumeButton.innerHTML = materialIcon('volumeMuted');
    fullscreenVolumeButton.innerHTML = materialIcon('volumeMuted');
  } else if (state.volume < 0.5) {
    volumeButton.innerHTML = materialIcon('volumeLow');
    fullscreenVolumeButton.innerHTML = materialIcon('volumeLow');
  } else {
    volumeButton.innerHTML = materialIcon('volumeHigh');
    fullscreenVolumeButton.innerHTML = materialIcon('volumeHigh');
  }
}

function ensureAudioVisualizer() {
  if (state.audioContext && state.analyser) {
    state.audioContext.resume?.().catch(() => {});
    return;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  state.audioContext = new AudioContextClass();
  const source = state.audioContext.createMediaElementSource(audioPlayer);
  state.analyser = state.audioContext.createAnalyser();
  state.analyser.fftSize = 128;
  state.analyserData = new Uint8Array(state.analyser.frequencyBinCount);
  source.connect(state.analyser);
  state.analyser.connect(state.audioContext.destination);
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
  shuffleButton.innerHTML = materialIcon('shuffle');
  prevButton.innerHTML = materialIcon('skipBack');
  nextButton.innerHTML = materialIcon('skipForward');
  repeatButton.innerHTML = renderRepeatIcon();
  fullscreenShuffleButton.innerHTML = materialIcon('shuffle');
  fullscreenPrevButton.innerHTML = materialIcon('skipBack');
  fullscreenNextButton.innerHTML = materialIcon('skipForward');
  fullscreenRepeatButton.innerHTML = renderRepeatIcon();
  downloadTrackLink.innerHTML = materialIcon('download');
  volumeButton.innerHTML = materialIcon('volumeHigh');
  queueToggleButton.innerHTML = materialIcon('queue');
  queueDownloadButton.innerHTML = materialIcon('download');
  queueFavoriteButton.innerHTML = materialIcon('favorite');
  queueClearButton.innerHTML = materialIcon('clearQueue');
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
  state.draggingQueueTrackId = null;
  persistPlaybackState({ includeTime: false });
  updatePlayerUi();
  render();
}

function clearQueueDropTargets() {
  document.querySelectorAll('.queue-item.drop-target').forEach((item) => {
    item.classList.remove('drop-target');
  });
}

function materialIcon(name, { filled = false } = {}) {
  return `<i class="${filled ? 'fa-solid' : 'fa-solid'} ${ICONS[name]}" aria-hidden="true"></i>`;
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

function buildFolderTree(tracks) {
  const root = {
    name: 'root',
    folders: new Map(),
    tracks: [],
    trackCount: 0,
  };

  for (const track of tracks) {
    const normalized = track.relativePath.replaceAll('\\', '/');
    const parts = normalized.split('/').filter(Boolean);
    let cursor = root;
    cursor.trackCount += 1;

    for (const part of parts.slice(0, -1)) {
      if (!cursor.folders.has(part)) {
        cursor.folders.set(part, {
          name: part,
          folders: new Map(),
          tracks: [],
          trackCount: 0,
        });
      }
      cursor = cursor.folders.get(part);
      cursor.trackCount += 1;
    }

    cursor.tracks.push(track);
  }

  return root;
}

function createFolderNode(node, queueTracks, folderPath) {
  const details = document.createElement('details');
  details.className = 'folder-node';
  details.open = Boolean(state.searchTerm) || state.expandedFolderPaths.has(folderPath);
  const folderTracks = collectFolderTracks(node);
  details.innerHTML = `
    <summary>
      <span class="folder-node-arrow" aria-hidden="true">
        <span class="folder-arrow-closed">${materialIcon('chevronRight')}</span>
        <span class="folder-arrow-open">${materialIcon('chevronDown')}</span>
      </span>
      <span class="folder-node-main">
        <span class="folder-node-name">${escapeHtml(node.name)}</span>
        <span class="folder-node-meta">${node.trackCount} track${node.trackCount === 1 ? '' : 's'}</span>
      </span>
      <button type="button" class="folder-node-play" aria-label="Play ${escapeHtml(node.name)} folder">
        ${materialIcon('play')}
      </button>
    </summary>
  `;

  const body = document.createElement('div');
  body.className = 'folder-node-body';

  for (const child of node.folders.values()) {
    body.append(createFolderNode(child, queueTracks, `${folderPath}/${child.name}`));
  }

  for (const track of node.tracks) {
    body.append(createFolderTrackRow(track, queueTracks));
  }

  details.append(body);
  details.addEventListener('toggle', () => {
    if (details.open) {
      state.expandedFolderPaths.add(folderPath);
    } else {
      state.expandedFolderPaths.delete(folderPath);
    }
  });
  details.querySelector('.folder-node-play').addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (folderTracks.length === 0) return;
    state.expandedFolderPaths.add(folderPath);
    state.shuffleActive = false;
    rebuildShuffledQueue();
    playTrack(folderTracks[0], folderTracks);
  });
  return details;
}

function collectFolderTracks(node) {
  const tracks = [...node.tracks];
  for (const child of node.folders.values()) {
    tracks.push(...collectFolderTracks(child));
  }
  return tracks;
}

function createFolderTrackRow(track, queueTracks) {
  const favorite = isFavoriteTrack(track.id);
  const playing = track.id === state.currentTrackId && !audioPlayer.paused;
  const row = document.createElement('div');
  row.className = `folder-track-row${track.id === state.currentTrackId ? ' is-active' : ''}`;
  row.innerHTML = `
    <button type="button" class="folder-track-main" aria-label="Play ${escapeHtml(track.title)}">
      <strong>${escapeHtml(track.title)}</strong>
      <span>${escapeHtml(track.relativePath.replaceAll('\\', ' / '))}</span>
    </button>
    <div class="row-actions">
      <button type="button" class="favorite-toggle-button${favorite ? ' active' : ''}" aria-label="${favorite ? 'Unfavorite' : 'Favorite'} ${escapeHtml(track.title)}">
        ${materialIcon('favorite', { filled: favorite })}
      </button>
      <button type="button" class="row-play-button" aria-label="Play ${escapeHtml(track.title)}">
        ${materialIcon(playing ? 'pause' : 'play')}
      </button>
    </div>
  `;

  row.querySelector('.folder-track-main').addEventListener('click', () => playTrack(track, queueTracks));
  row.querySelector('.favorite-toggle-button').addEventListener('click', (event) => {
    event.stopPropagation();
    toggleFavoriteTrack(track.id);
  });
  row.querySelector('.row-play-button').addEventListener('click', (event) => {
    event.stopPropagation();
    if (track.id === state.currentTrackId) {
      togglePlayback();
    } else {
      playTrack(track, queueTracks);
    }
  });
  return row;
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
  return state.tracks.filter((track) => trackMatchesSearch(track));
}

function getFilteredAlbums(filteredTracks) {
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
  return buildArtistGroups(state.tracks).find((artist) => artist.name === artistName) ?? null;
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
  const album = state.albumMap.get(albumId);
  if (!album) return [];
  return album.trackIds
    .map((id) => state.trackMap.get(id))
    .filter(Boolean)
    .sort(compareTrackOrder);
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
    getAlbumMediaTypes(album).join(', '),
    album.status || 'Collection',
  ].filter(Boolean);
}

function isWantedAlbum(album) {
  return String(album?.status || '').trim().toLowerCase() === 'wanted';
}

function getAlbumMediaTypes(album) {
  const mediaTypes = Array.isArray(album.mediaTypes) ? album.mediaTypes : [album.mediaType];
  const normalized = mediaTypes.filter(Boolean);
  return normalized.length > 0 ? normalized : ['Digital Media'];
}

function renderMediaTypeIcons(album, { includeLabels = false } = {}) {
  return getAlbumMediaTypes(album).map((mediaType) => {
    const iconName = MEDIA_TYPE_ICONS[mediaType] || MEDIA_TYPE_ICONS['Digital Media'];
    const label = includeLabels ? `<span>${escapeHtml(mediaType)}</span>` : '';
    return `<span class="media-type-icon" title="${escapeHtml(mediaType)}">${materialIcon(iconName)}${label}</span>`;
  }).join('');
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
  const selected = new Set(Array.isArray(mediaTypes) ? mediaTypes : [mediaTypes]);
  for (const input of tagAlbumMediaTypesInput.querySelectorAll('input[type="checkbox"]')) {
    input.checked = selected.has(input.value);
  }
}

function getSelectedMediaTypes() {
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
  if (parsed.nowPlayingClickAction && !NOW_PLAYING_CLICK_ACTIONS.has(parsed.nowPlayingClickAction)) {
    delete parsed.nowPlayingClickAction;
  }
  if (typeof parsed.libraryTitle === 'string' && parsed.libraryTitle.trim() === '') {
    delete parsed.libraryTitle;
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
        if (parsed.nowPlayingClickAction && !NOW_PLAYING_CLICK_ACTIONS.has(parsed.nowPlayingClickAction)) {
          delete parsed.nowPlayingClickAction;
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
