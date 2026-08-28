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
  canPreloadNextTrack = () => true,
  loadTrackLyrics,
  persistPlaybackState,
  updatePlayerUi,
  updateProgressUi,
  render,
  applyPlaybackVolume = () => {},
  onAudioPlayerChanged = () => {},
  onPlaybackError = console.error,
  onLyricsError = console.warn,
  onPreloadError = () => {},
}) {
  let activeAudioPlayer = audioPlayer;
  let preloadedNextTrack = null;

  const refreshPlayer = () => {
    updatePlayerUi();
    render();
  };

  const playAudio = () => activeAudioPlayer.play().catch(onPlaybackError);

  function retireAudioPlayer(player) {
    if (!player) return;
    try {
      player.pause?.();
      player.removeAttribute?.('src');
      player.load?.();
    } catch (error) {
      onPreloadError(error);
    }
  }

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
    applyPlaybackVolume(track);
    state.lyricsRefreshRequestedIds.delete(track.id);
    Promise.resolve(loadTrackLyrics(track.id)).catch((error) => onLyricsError('Unable to load lyrics', error));
    activeAudioPlayer.src = options.streamUrl || getTrackStreamUrl(track);
    activeAudioPlayer.playbackRate = 1;
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

    if (activeAudioPlayer.paused) {
      playAudio();
    } else {
      activeAudioPlayer.pause();
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
      activeAudioPlayer.currentTime = 0;
      playAudio();
    } else if (state.repeatMode === 'all' && queue.length > 0) {
      playTrackById(queue[0]);
    } else {
      activeAudioPlayer.pause();
      activeAudioPlayer.currentTime = 0;
      persistPlaybackState();
      refreshPlayer();
    }
  }

  function playPreviousTrack() {
    clearPreloadedTrack();
    if (activeAudioPlayer.currentTime > 3) {
      activeAudioPlayer.currentTime = 0;
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
      activeAudioPlayer.currentTime = 0;
      updateProgressUi();
      persistPlaybackState();
    }
  }

  function handleTrackEnded() {
    if (state.repeatMode === 'one') {
      clearPreloadedTrack();
      activeAudioPlayer.currentTime = 0;
      playAudio();
      return;
    }
    const nextTarget = getNextPlaybackTarget();
    if (nextTarget && preloadedNextTrack?.trackId === nextTarget.track.id) {
      promotePreloadedTrack(nextTarget.track);
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
    if (state.repeatMode === 'one') return null;
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
    if (!state.settings.gaplessPlayback
      || state.repeatMode === 'one'
      || !createPreloadAudio
      || !canPreloadNextTrack()) {
      clearPreloadedTrack();
      return;
    }
    if (activeAudioPlayer.paused) {
      clearPreloadedTrack();
      return;
    }
    const duration = Number.isFinite(activeAudioPlayer.duration) ? activeAudioPlayer.duration : 0;
    const currentTime = Number.isFinite(activeAudioPlayer.currentTime) ? activeAudioPlayer.currentTime : 0;
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
      priming: false,
      primed: false,
      promoted: false,
      streamUrl,
      trackId: nextTarget.track.id,
    };

    try {
      preloadAudio.preload = 'auto';
      preloadAudio.src = streamUrl;
      preloadAudio.load?.();
      primePreloadedAudio(preloadedNextTrack);
    } catch (error) {
      clearPreloadedTrack();
      onPreloadError(error);
    }
  }

  function primePreloadedAudio(preparedTrack) {
    const preloadAudio = preparedTrack?.audio;
    if (!preloadAudio || typeof preloadAudio.addEventListener !== 'function') return;

    const warmDecoder = () => {
      if (preparedTrack !== preloadedNextTrack || preparedTrack.priming || preparedTrack.primed) return;
      preparedTrack.priming = true;
      preloadAudio.muted = true;
      let playResult;
      try {
        playResult = preloadAudio.play?.();
      } catch {
        preloadAudio.muted = false;
        preparedTrack.priming = false;
        return;
      }
      Promise.resolve(playResult).then(() => {
        preparedTrack.priming = false;
        if (preparedTrack.promoted) return;
        if (preparedTrack !== preloadedNextTrack) return;
        preloadAudio.pause?.();
        preloadAudio.currentTime = 0;
        preloadAudio.muted = false;
        preparedTrack.primed = true;
      }).catch(() => {
        preloadAudio.muted = false;
        preparedTrack.priming = false;
      });
    };

    preparedTrack.canPlayHandler = warmDecoder;
    if (Number(preloadAudio.readyState) >= 3) {
      warmDecoder();
    } else {
      preloadAudio.addEventListener('canplay', warmDecoder, { once: true });
    }
  }

  function promotePreloadedTrack(track) {
    const preparedTrack = preloadedNextTrack;
    if (!preparedTrack || preparedTrack.trackId !== track.id) return false;
    preloadedNextTrack = null;
    preparedTrack.promoted = true;
    preparedTrack.audio.removeEventListener?.('canplay', preparedTrack.canPlayHandler);
    preparedTrack.audio.muted = false;

    const previousAudioPlayer = activeAudioPlayer;
    activeAudioPlayer = preparedTrack.audio;
    state.currentTrackId = track.id;
    onAudioPlayerChanged(activeAudioPlayer, previousAudioPlayer);
    applyPlaybackVolume(track);
    activeAudioPlayer.playbackRate = 1;
    playAudio();

    state.lyricsRefreshRequestedIds.delete(track.id);
    Promise.resolve(loadTrackLyrics(track.id)).catch((error) => onLyricsError('Unable to load lyrics', error));
    persistPlaybackState();
    refreshPlayer();
    retireAudioPlayer(previousAudioPlayer);
    return true;
  }

  function clearPreloadedTrack() {
    if (!preloadedNextTrack) return;
    const preloadAudio = preloadedNextTrack.audio;
    preloadAudio.removeEventListener?.('canplay', preloadedNextTrack.canPlayHandler);
    preloadedNextTrack.promoted = true;
    preloadedNextTrack = null;
    retireAudioPlayer(preloadAudio);
  }

  return {
    clearPreloadedTrack,
    cycleRepeatMode,
    getAudioPlayer: () => activeAudioPlayer,
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
