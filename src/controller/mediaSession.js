import { clamp } from './utils.js';

export function setupMediaSessionActions({
  audioPlayer,
  hasCurrentTrack,
  onPreviousTrack,
  onNextTrack,
  onSeekBy,
  onSeekTo,
  onError = console.error,
}) {
  if (!('mediaSession' in navigator)) return;

  const actionHandlers = {
    play: () => {
      if (hasCurrentTrack?.()) audioPlayer.play().catch(onError);
    },
    pause: () => audioPlayer.pause(),
    previoustrack: () => onPreviousTrack?.(),
    nexttrack: () => onNextTrack?.(),
    seekbackward: (details) => {
      const offset = Number(details?.seekOffset) || 10;
      onSeekBy?.(-offset);
    },
    seekforward: (details) => {
      const offset = Number(details?.seekOffset) || 10;
      onSeekBy?.(offset);
    },
    seekto: (details) => {
      if (!Number.isFinite(details?.seekTime)) return;
      onSeekTo?.(details.seekTime, { fastSeek: Boolean(details.fastSeek) });
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

export function seekAudioBy(audioPlayer, offsetSeconds, callbacks = {}) {
  const currentTime = Number.isFinite(audioPlayer.currentTime) ? audioPlayer.currentTime : 0;
  setAudioCurrentTime(audioPlayer, currentTime + offsetSeconds, callbacks);
}

export function setAudioCurrentTime(audioPlayer, time, { fastSeek = false, onProgress, onPersist } = {}) {
  const duration = Number.isFinite(audioPlayer.duration) ? audioPlayer.duration : 0;
  const nextTime = duration > 0 ? clamp(time, 0, duration) : Math.max(0, time);
  if (fastSeek && typeof audioPlayer.fastSeek === 'function') {
    audioPlayer.fastSeek(nextTime);
  } else {
    audioPlayer.currentTime = nextTime;
  }
  onProgress?.();
  onPersist?.();
}

export function updateMediaSession(track, { audioPlayer, currentTrackId } = {}) {
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
  updateMediaSessionPlaybackState({ audioPlayer, currentTrackId });
  updateMediaSessionPositionState(audioPlayer);
}

export function updateMediaSessionPlaybackState({ audioPlayer, currentTrackId } = {}) {
  if (!('mediaSession' in navigator)) return;
  if (!currentTrackId) {
    navigator.mediaSession.playbackState = 'none';
  } else {
    navigator.mediaSession.playbackState = audioPlayer.paused ? 'paused' : 'playing';
  }
}

export function updateMediaSessionPositionState(audioPlayer) {
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

export function buildMediaSessionArtwork(track) {
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

export function toAbsoluteUrl(url) {
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return url;
  }
}
