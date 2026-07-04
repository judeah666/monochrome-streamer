import { REPEAT_MODES } from './constants.js';
import {
  getPlaybackQueueIds,
  setPlaybackQueueIds,
  syncShuffledQueueIds,
} from './queueState.js';

const GAPLESS_PRELOAD_WINDOW_SECONDS = 8;

export function createPlaybackController({
  state,
  audioPlayer,
  getFilteredTracks,
  getDefaultQueueForTrack,
  getTrackStreamUrl = (track) => track?.streamUrl || '',
  createPreloadAudio = null,
  loadTrackLyrics,
  persistPlaybackState,
  updatePlayerUi,
  updateProgressUi,
  render,
  onPlaybackError = console.error,
  onLyricsError = console.warn,
  onPreloadError = () => {},
}) {
  let preloadedNextTrack = null;

  const refreshPlayer = () => {
    updatePlayerUi();
    render();
  };

  const playAudio = () => audioPlayer.play().catch(onPlaybackError);

  function getPlaybackQueue() {
    return getPlaybackQueueIds(state);
  }

  function rebuildShuffledQueue(currentTrackId = state.currentTrackId) {
    clearPreloadedTrack();
    syncShuffledQueueIds(state, currentTrackId);
  }

  function loadTrack(track, options = {}) {
    clearPreloadedTrack();
    state.currentTrackId = track.id;
    state.lyricsRefreshRequestedIds.delete(track.id);
    Promise.resolve(loadTrackLyrics(track.id)).catch((error) => onLyricsError('Unable to load lyrics', error));
    audioPlayer.src = options.streamUrl || getTrackStreamUrl(track);
    audioPlayer.playbackRate = 1;
    persistPlaybackState();
    playAudio();
    refreshPlayer();
  }

  function playTrack(track, queueTracks = null) {
    const nextQueueTracks = queueTracks ?? getDefaultQueueForTrack(track);
    setPlaybackQueueIds(state, nextQueueTracks.map((item) => item.id), track.id);
    loadTrack(track);
  }

  function togglePlayback() {
    if (!state.currentTrackId) {
      const firstTrack = getFilteredTracks()[0] ?? state.tracks[0];
      if (firstTrack) {
        playTrack(firstTrack, getDefaultQueueForTrack(firstTrack));
      }
      return;
    }

    if (audioPlayer.paused) {
      playAudio();
    } else {
      audioPlayer.pause();
    }
    refreshPlayer();
  }

  function playTrackById(trackId, respectExistingQueue = true) {
    const track = state.trackMap.get(trackId);
    if (!track) return;
    if (respectExistingQueue) {
      loadTrack(track);
      return;
    }
    playTrack(track);
  }

  function playNextTrack() {
    clearPreloadedTrack();
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
      playAudio();
    } else if (state.repeatMode === 'all' && queue.length > 0) {
      playTrackById(queue[0]);
    } else {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      persistPlaybackState();
      refreshPlayer();
    }
  }

  function playPreviousTrack() {
    clearPreloadedTrack();
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
      clearPreloadedTrack();
      audioPlayer.currentTime = 0;
      playAudio();
      return;
    }
    if (!state.settings.gaplessPlayback) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      persistPlaybackState();
      refreshPlayer();
      return;
    }
    const nextTarget = getNextPlaybackTarget();
    if (nextTarget && preloadedNextTrack?.trackId === nextTarget.track.id) {
      const streamUrl = preloadedNextTrack.streamUrl;
      loadTrack(nextTarget.track, { streamUrl });
      return;
    }
    playNextTrack();
  }

  function toggleShuffle() {
    clearPreloadedTrack();
    state.shuffleActive = !state.shuffleActive;
    rebuildShuffledQueue();
    persistPlaybackState({ includeTime: false });
    updatePlayerUi();
  }

  function cycleRepeatMode() {
    clearPreloadedTrack();
    const currentIndex = REPEAT_MODES.indexOf(state.repeatMode);
    state.repeatMode = REPEAT_MODES[(currentIndex + 1) % REPEAT_MODES.length];
    persistPlaybackState({ includeTime: false });
    updatePlayerUi();
  }

  function getNextPlaybackTarget() {
    if (!state.settings.gaplessPlayback || state.repeatMode === 'one') return null;
    const queue = getPlaybackQueue();
    if (queue.length === 0 || !state.currentTrackId) return null;
    const currentIndex = queue.indexOf(state.currentTrackId);
    if (currentIndex === -1) return null;
    const nextTrackId = currentIndex < queue.length - 1
      ? queue[currentIndex + 1]
      : state.repeatMode === 'all'
        ? queue[0]
        : '';
    if (!nextTrackId || nextTrackId === state.currentTrackId) return null;
    const track = state.trackMap.get(nextTrackId);
    return track ? { track } : null;
  }

  function maybePreloadNextTrack() {
    if (!state.settings.gaplessPlayback || state.repeatMode === 'one' || !createPreloadAudio) {
      clearPreloadedTrack();
      return;
    }
    if (audioPlayer.paused) {
      clearPreloadedTrack();
      return;
    }
    const duration = Number.isFinite(audioPlayer.duration) ? audioPlayer.duration : 0;
    const currentTime = Number.isFinite(audioPlayer.currentTime) ? audioPlayer.currentTime : 0;
    if (duration <= 0 || currentTime < 0 || duration - currentTime > GAPLESS_PRELOAD_WINDOW_SECONDS) {
      return;
    }

    const nextTarget = getNextPlaybackTarget();
    if (!nextTarget) {
      clearPreloadedTrack();
      return;
    }

    const streamUrl = getTrackStreamUrl(nextTarget.track);
    if (preloadedNextTrack?.trackId === nextTarget.track.id && preloadedNextTrack.streamUrl === streamUrl) {
      return;
    }

    clearPreloadedTrack();
    const preloadAudio = createPreloadAudio();
    if (!preloadAudio) return;
    preloadedNextTrack = {
      audio: preloadAudio,
      streamUrl,
      trackId: nextTarget.track.id,
    };

    try {
      preloadAudio.preload = 'auto';
      preloadAudio.src = streamUrl;
      preloadAudio.load?.();
    } catch (error) {
      clearPreloadedTrack();
      onPreloadError(error);
    }
  }

  function clearPreloadedTrack() {
    if (!preloadedNextTrack) return;
    const preloadAudio = preloadedNextTrack.audio;
    preloadedNextTrack = null;
    try {
      preloadAudio.pause?.();
      preloadAudio.removeAttribute?.('src');
      preloadAudio.load?.();
    } catch (error) {
      onPreloadError(error);
    }
  }

  return {
    clearPreloadedTrack,
    cycleRepeatMode,
    getPlaybackQueue,
    handleTrackEnded,
    maybePreloadNextTrack,
    playNextTrack,
    playPreviousTrack,
    playTrack,
    playTrackById,
    rebuildShuffledQueue,
    togglePlayback,
    toggleShuffle,
  };
}
