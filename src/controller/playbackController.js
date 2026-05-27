import { REPEAT_MODES } from './constants.js';
import {
  getPlaybackQueueIds,
  setPlaybackQueueIds,
  syncShuffledQueueIds,
} from './queueState.js';

export function createPlaybackController({
  state,
  audioPlayer,
  getFilteredTracks,
  getDefaultQueueForTrack,
  loadTrackLyrics,
  persistPlaybackState,
  updatePlayerUi,
  updateProgressUi,
  render,
  onPlaybackError = console.error,
  onLyricsError = console.warn,
}) {
  const refreshPlayer = () => {
    updatePlayerUi();
    render();
  };

  const playAudio = () => audioPlayer.play().catch(onPlaybackError);

  function getPlaybackQueue() {
    return getPlaybackQueueIds(state);
  }

  function rebuildShuffledQueue(currentTrackId = state.currentTrackId) {
    syncShuffledQueueIds(state, currentTrackId);
  }

  function playTrack(track, queueTracks = null) {
    const nextQueueTracks = queueTracks ?? getDefaultQueueForTrack(track);
    setPlaybackQueueIds(state, nextQueueTracks.map((item) => item.id), track.id);

    state.currentTrackId = track.id;
    state.lyricsRefreshRequestedIds.delete(track.id);
    Promise.resolve(loadTrackLyrics(track.id)).catch((error) => onLyricsError('Unable to load lyrics', error));
    audioPlayer.src = track.streamUrl;
    audioPlayer.playbackRate = 1;
    persistPlaybackState();
    playAudio();
    refreshPlayer();
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
    const queueTracks = respectExistingQueue
      ? getPlaybackQueue().map((id) => state.trackMap.get(id)).filter(Boolean)
      : null;
    playTrack(track, queueTracks);
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
    playNextTrack();
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

  return {
    cycleRepeatMode,
    getPlaybackQueue,
    handleTrackEnded,
    playNextTrack,
    playPreviousTrack,
    playTrack,
    playTrackById,
    rebuildShuffledQueue,
    togglePlayback,
    toggleShuffle,
  };
}
