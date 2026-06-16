import React, { useSyncExternalStore } from 'react';
import { QueuePanel } from './QueuePanel.jsx';

export function QueuePanelContainer({ store }) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  return <QueuePanel {...snapshot} {...store.actions} />;
}
