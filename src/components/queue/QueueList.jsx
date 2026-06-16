import React, { useState } from 'react';
import { CoverImage } from '../common/VisualBits.jsx';

const REMOVE_ICON = '/assets/icons/player/trash.svg';
const queueItemBaseClassName = [
  'queue-item tw-grid tw-grid-cols-[38px_58px_minmax(0,1fr)_auto] tw-items-center tw-gap-3',
  'tw-rounded-[18px] tw-border tw-border-line tw-bg-surface tw-p-3 tw-transition',
  'hover:tw-border-[var(--line-strong)] hover:tw-bg-surface2',
].join(' ');
const queueItemActiveClassName = ' is-active tw-border-[color-mix(in_srgb,var(--accent)_42%,transparent)] tw-bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]';
const queueDragClassName = ' is-dragging tw-opacity-60';
const queueDropTargetClassName = ' drop-target tw-border-accent';
const queueHandleClassName = 'queue-drag-handle tw-inline-flex tw-h-[38px] tw-w-[38px] tw-items-center tw-justify-center tw-rounded-pill tw-border tw-border-line tw-bg-[var(--glass)] tw-p-0';
const queueImageClassName = 'tw-h-[58px] tw-w-[58px] tw-rounded-[12px] tw-object-cover';
const queueFallbackClassName = 'queue-thumb-fallback cover-placeholder-art tw-grid tw-h-[58px] tw-w-[58px] tw-place-items-center tw-rounded-[12px]';
const queueMainClassName = 'queue-item-main tw-min-w-0 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-inherit tw-cursor-pointer';
const queueCopyClassName = 'queue-item-copy tw-grid tw-min-w-0 tw-gap-1';
const queueTextClassName = 'tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap';
const queueTrailingClassName = 'queue-item-trailing tw-flex tw-items-center';
const queueActionsClassName = 'queue-item-actions tw-flex tw-items-center tw-gap-2';
const queueActionButtonClassName = 'tw-inline-flex tw-h-[38px] tw-w-[38px] tw-items-center tw-justify-center tw-rounded-pill tw-border tw-border-line tw-bg-[var(--glass)] tw-p-0';

export function QueueList({
  tracks = [],
  total = 0,
  limit = 0,
  currentTrackId = '',
  favoriteTrackIds = [],
  onPlay,
  onFavorite,
  onRemove,
  onReorder,
}) {
  const [dragTrackId, setDragTrackId] = useState('');
  const [dropTargetId, setDropTargetId] = useState('');
  const favoriteSet = new Set(favoriteTrackIds);

  if (tracks.length === 0) {
    return <p className="empty-state">Your queue is empty.</p>;
  }

  return (
    <>
      {tracks.map((track) => {
        const favorite = favoriteSet.has(track.id);
        const isCurrent = track.id === currentTrackId;
        const isDropTarget = dropTargetId === track.id && dragTrackId !== track.id;

        return (
          <article
            key={track.id}
            className={[
              queueItemBaseClassName,
              isCurrent ? queueItemActiveClassName : '',
              dragTrackId === track.id ? queueDragClassName : '',
              isDropTarget ? queueDropTargetClassName : '',
            ].filter(Boolean).join(' ')}
            draggable
            data-track-id={track.id}
            onDragStart={(event) => {
              setDragTrackId(track.id);
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', track.id);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (dragTrackId && dragTrackId !== track.id) {
                setDropTargetId(track.id);
              }
            }}
            onDragLeave={() => {
              if (dropTargetId === track.id) setDropTargetId('');
            }}
            onDrop={(event) => {
              event.preventDefault();
              const droppedTrackId = dragTrackId || event.dataTransfer.getData('text/plain');
              setDragTrackId('');
              setDropTargetId('');
              onReorder?.(droppedTrackId, track.id);
            }}
            onDragEnd={() => {
              setDragTrackId('');
              setDropTargetId('');
            }}
          >
            <button type="button" className={queueHandleClassName} aria-label={`Drag ${track.title}`}>
              <i className="fa-solid fa-grip-lines" aria-hidden="true" />
            </button>

            <CoverImage
              className={queueImageClassName}
              src={track.coverUrl}
              alt={`${track.album} cover art`}
              loading="lazy"
              decoding="async"
              placeholderClassName={queueFallbackClassName}
            />

            <button type="button" className={queueMainClassName} aria-label={`Play ${track.title}`} onClick={() => onPlay?.(track.id)}>
              <div className={queueCopyClassName}>
                <strong className={queueTextClassName}>{track.title}</strong>
                <span className={`${queueTextClassName} tw-text-muted`}>{track.artist}</span>
              </div>
            </button>

            <div className={queueTrailingClassName}>
              <div className={queueActionsClassName}>
                <button
                  type="button"
                  className={`queue-item-favorite ${queueActionButtonClassName}${favorite ? ' active' : ''}`}
                  aria-label={`${favorite ? 'Unfavorite' : 'Favorite'} ${track.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onFavorite?.(track.id);
                  }}
                >
                  <i className="fa-solid fa-heart" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`queue-item-remove ${queueActionButtonClassName}`}
                  aria-label={`Remove ${track.title} from queue`}
                  disabled={isCurrent}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove?.(track.id);
                  }}
                >
                  <i className="player-symbol" style={{ '--player-icon': `url('${REMOVE_ICON}')` }} aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        );
      })}

      {total > limit ? (
        <p className="limit-notice">Showing {limit} of {total} queue tracks.</p>
      ) : null}
    </>
  );
}
