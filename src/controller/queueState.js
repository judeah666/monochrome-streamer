export function getPlaybackQueueIds(state) {
  return state.shuffleActive ? state.shuffledQueueIds : state.queueIds;
}

export function setPlaybackQueueIds(state, trackIds, currentTrackId = state.currentTrackId) {
  state.queueIds = [...trackIds];
  syncShuffledQueueIds(state, currentTrackId);
}

function shuffleQueueIds(trackIds) {
  const shuffled = [...trackIds];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

export function syncShuffledQueueIds(state, currentTrackId = state.currentTrackId) {
  if (!state.shuffleActive) {
    state.shuffledQueueIds = [...state.queueIds];
    return;
  }

  const remaining = shuffleQueueIds(state.queueIds.filter((id) => id !== currentTrackId));
  state.shuffledQueueIds = currentTrackId ? [currentTrackId, ...remaining] : remaining;
}

export function addTrackIdsToQueue(state, trackIds) {
  const existingIds = new Set(state.queueIds);
  const uniqueNewIds = trackIds.filter((id) => !existingIds.has(id));
  if (uniqueNewIds.length === 0) return false;

  state.queueIds = [...state.queueIds, ...uniqueNewIds];
  if (!state.shuffleActive) {
    state.shuffledQueueIds = [...state.queueIds];
    return true;
  }

  const shuffledSet = new Set(state.shuffledQueueIds);
  const missingIds = state.queueIds.filter((id) => !shuffledSet.has(id));
  state.shuffledQueueIds = [...state.shuffledQueueIds, ...missingIds];
  return true;
}

export function clearQueueState(state) {
  if (!state.currentTrackId) {
    state.queueIds = [];
    state.shuffledQueueIds = [];
  } else {
    state.queueIds = [state.currentTrackId];
    state.shuffledQueueIds = [state.currentTrackId];
  }
  state.shuffleActive = false;
}

export function removeTrackIdFromQueue(state, trackId) {
  if (!trackId || trackId === state.currentTrackId) return false;
  const nextQueueIds = state.queueIds.filter((id) => id !== trackId);
  const nextShuffledQueueIds = state.shuffledQueueIds.filter((id) => id !== trackId);
  if (nextQueueIds.length === state.queueIds.length && nextShuffledQueueIds.length === state.shuffledQueueIds.length) {
    return false;
  }

  state.queueIds = nextQueueIds;
  state.shuffledQueueIds = nextShuffledQueueIds;
  return true;
}

export function reorderQueueState(state, dragTrackId, targetTrackId) {
  if (!dragTrackId || !targetTrackId || dragTrackId === targetTrackId) return false;

  const nextQueue = [...getPlaybackQueueIds(state)];
  const dragIndex = nextQueue.indexOf(dragTrackId);
  const targetIndex = nextQueue.indexOf(targetTrackId);
  if (dragIndex === -1 || targetIndex === -1) return false;

  nextQueue.splice(dragIndex, 1);
  nextQueue.splice(targetIndex, 0, dragTrackId);

  state.queueIds = nextQueue;
  state.shuffledQueueIds = nextQueue;
  state.shuffleActive = false;
  return true;
}
