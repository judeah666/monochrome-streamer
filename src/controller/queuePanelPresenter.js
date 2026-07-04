export function createQueueTrackView(track) {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    coverUrl: track.coverUrl || '',
  };
}

export function buildQueuePanelSnapshot({
  open = false,
  queueIds = [],
  trackMap,
  currentTrackId = '',
  favoriteTrackIds = [],
  limit = 0,
  canDownload = true,
  downloadActive = false,
  downloadBusy = false,
} = {}) {
  const queue = queueIds.map((id) => trackMap?.get(id)).filter(Boolean);
  const visibleLimit = Math.max(0, Number(limit) || 0);
  const visibleQueue = visibleLimit > 0 ? queue.slice(0, visibleLimit) : queue;

  return {
    open: Boolean(open),
    tracks: visibleQueue.map(createQueueTrackView),
    total: queue.length,
    limit: visibleLimit,
    canDownload: Boolean(canDownload),
    downloadActive: Boolean(downloadActive),
    downloadBusy: Boolean(downloadBusy),
    currentTrackId: currentTrackId || '',
    favoriteTrackIds: [...favoriteTrackIds],
  };
}
