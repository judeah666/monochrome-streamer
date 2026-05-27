export function createQueuePanelStore(actions = {}) {
  let snapshot = {
    open: false,
    tracks: [],
    total: 0,
    limit: 0,
    currentTrackId: '',
    favoriteTrackIds: [],
  };
  const listeners = new Set();

  return {
    actions,
    getSnapshot() {
      return snapshot;
    },
    setSnapshot(nextSnapshot) {
      snapshot = nextSnapshot;
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
