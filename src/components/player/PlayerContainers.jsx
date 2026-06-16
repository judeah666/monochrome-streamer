import React, { useSyncExternalStore } from 'react';
import { PlayerNowPlaying } from './PlayerNowPlaying.jsx';
import { PlayerTransportControls } from './PlayerTransportControls.jsx';
import { PlayerUtilityControls } from './PlayerUtilityControls.jsx';

function usePlayerSnapshot(store) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export function PlayerNowPlayingContainer({ store }) {
  const snapshot = usePlayerSnapshot(store);
  return <PlayerNowPlaying {...snapshot.nowPlaying} {...store.actions.nowPlaying} />;
}

export function PlayerTransportControlsContainer({ store }) {
  const snapshot = usePlayerSnapshot(store);
  return <PlayerTransportControls {...snapshot.transport} {...store.actions.transport} />;
}

export function PlayerUtilityControlsContainer({ store }) {
  const snapshot = usePlayerSnapshot(store);
  return <PlayerUtilityControls {...snapshot.utility} {...store.actions.utility} />;
}
