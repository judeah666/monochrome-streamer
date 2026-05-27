import { buildPlayerSnapshot } from './playerPresenter.js';

export function createPlayerStore(actions = {}) {
  let snapshot = buildPlayerSnapshot();
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
