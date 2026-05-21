import React from 'react';
import { QueueList } from './QueueList.jsx';

export function QueuePanel({
  open = false,
  tracks = [],
  total = 0,
  limit = 0,
  currentTrackId = '',
  favoriteTrackIds = [],
  icons = {},
  onClose,
  onDownload,
  onFavoriteQueue,
  onClear,
  onPlay,
  onFavorite,
  onRemove,
  onReorder,
}) {
  if (!open) return null;

  const clearDisabled = tracks.length === 0 || (tracks.length === 1 && tracks[0].id === currentTrackId);

  return (
    <>
      <div className="queue-panel-header">
        <h2>Queue</h2>
        <div className="queue-panel-actions">
          <button
            type="button"
            className="icon-button queue-icon-control"
            aria-label="Download queue"
            disabled={tracks.length === 0}
            onClick={() => onDownload?.()}
            dangerouslySetInnerHTML={{ __html: icons.download || '' }}
          />
          <button
            type="button"
            className="icon-button queue-icon-control"
            aria-label="Favorite queue"
            disabled={tracks.length === 0}
            onClick={() => onFavoriteQueue?.()}
            dangerouslySetInnerHTML={{ __html: icons.favorite || '' }}
          />
          <button
            type="button"
            className="icon-button queue-icon-control"
            aria-label="Clear queue"
            disabled={clearDisabled}
            onClick={() => onClear?.()}
            dangerouslySetInnerHTML={{ __html: icons.clear || '' }}
          />
          <button
            type="button"
            className="icon-button queue-icon-control"
            aria-label="Close queue"
            onClick={() => onClose?.()}
            dangerouslySetInnerHTML={{ __html: icons.close || '' }}
          />
        </div>
      </div>
      <div className="queue-list">
        <QueueList
          tracks={tracks}
          total={total}
          limit={limit}
          currentTrackId={currentTrackId}
          favoriteTrackIds={favoriteTrackIds}
          onPlay={onPlay}
          onFavorite={onFavorite}
          onRemove={onRemove}
          onReorder={onReorder}
        />
      </div>
    </>
  );
}
