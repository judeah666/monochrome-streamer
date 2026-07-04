import React from 'react';
import { QueueList } from './QueueList.jsx';
import { FontAwesomeIcon, PlayerIcon } from '../common/VisualBits.jsx';

const queueHeaderClassName = 'queue-panel-header tw-flex tw-items-center tw-justify-between tw-gap-4 tw-border-b tw-border-line tw-px-5 tw-py-4';
const queueTitleClassName = 'tw-m-0 tw-text-[1.45rem] tw-tracking-[-0.04em]';
const queueActionsClassName = 'queue-panel-actions tw-flex tw-items-center tw-gap-2';
const queueIconButtonClassName = 'icon-button queue-icon-control tw-inline-flex tw-h-11 tw-w-11 tw-items-center tw-justify-center tw-rounded-pill tw-border tw-border-line tw-bg-[var(--glass)] tw-p-0';
const queueListClassName = 'queue-list tw-grid tw-gap-3 tw-overflow-y-auto tw-p-3';

export function QueuePanel({
  open = false,
  tracks = [],
  total = 0,
  limit = 0,
  canDownload = true,
  downloadActive = false,
  downloadBusy = false,
  currentTrackId = '',
  favoriteTrackIds = [],
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
      <div className={queueHeaderClassName}>
        <h2 className={queueTitleClassName}>Queue</h2>
        <div className={queueActionsClassName}>
          <button
            type="button"
            className={`${queueIconButtonClassName}${downloadBusy ? ' is-download-busy' : ''}`}
            aria-label={downloadBusy ? 'Downloading queue' : 'Download queue'}
            aria-busy={downloadBusy ? 'true' : undefined}
            disabled={tracks.length === 0 || !canDownload || downloadActive}
            onClick={() => onDownload?.()}
          >
            {downloadBusy ? <span className="download-busy-spinner" aria-hidden="true"></span> : <PlayerIcon name="download" />}
          </button>
          <button
            type="button"
            className={queueIconButtonClassName}
            aria-label="Favorite queue"
            disabled={tracks.length === 0}
            onClick={() => onFavoriteQueue?.()}
          >
            <FontAwesomeIcon name="favorite" />
          </button>
          <button
            type="button"
            className={queueIconButtonClassName}
            aria-label="Clear queue"
            disabled={clearDisabled}
            onClick={() => onClear?.()}
          >
            <PlayerIcon name="clearQueue" />
          </button>
          <button
            type="button"
            className={queueIconButtonClassName}
            aria-label="Close queue"
            onClick={() => onClose?.()}
          >
            <FontAwesomeIcon name="close" />
          </button>
        </div>
      </div>
      <div className={queueListClassName}>
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
