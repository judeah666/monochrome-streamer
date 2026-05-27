export function buildPlayerSnapshot({
  track = null,
  album = null,
  paused = true,
  shuffleActive = false,
  repeatMode = 'off',
  repeatLabel = 'Repeat off',
  queueOpen = false,
  volume = 1,
  showQuality = false,
  quality = null,
  favorite = false,
  downloadName = '',
} = {}) {
  const hasTrack = Boolean(track);
  const albumView = album ? { id: album.id } : null;

  return {
    nowPlaying: {
      track: hasTrack ? { id: track.id } : null,
      album: albumView,
      coverUrl: track?.coverUrl || '',
      coverAlt: hasTrack ? `${track.album} cover art` : '',
      title: track?.title || 'Select a track',
      albumTitle: track?.album || '',
      artist: track?.artist || 'Your queue will appear here.',
    },
    transport: {
      playing: !paused && hasTrack,
      shuffleActive: Boolean(shuffleActive),
      repeatActive: repeatMode !== 'off',
      repeatMode,
      repeatLabel,
    },
    utility: {
      hasTrack,
      currentTrackTitle: track?.title || '',
      downloadName: hasTrack ? downloadName : '',
      favorite: Boolean(favorite),
      queueOpen: Boolean(queueOpen),
      volume,
      showQuality: Boolean(showQuality && hasTrack),
      quality,
    },
  };
}
