import React, { useState } from 'react';

const REMOVE_ICON = '/player-icons/trash.svg';

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
      {tracks.map((track, index) => {
        const favorite = favoriteSet.has(track.id);
        const isCurrent = track.id === currentTrackId;
        const isDropTarget = dropTargetId === track.id && dragTrackId !== track.id;

        return (
          <article
            key={track.id}
            className={[
              'queue-item',
              isCurrent ? 'is-active' : '',
              dragTrackId === track.id ? 'is-dragging' : '',
              isDropTarget ? 'drop-target' : '',
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
            <button type="button" className="queue-drag-handle" aria-label={`Drag ${track.title}`}>
              <i className="fa-solid fa-grip-lines" aria-hidden="true" />
            </button>

            {track.coverUrl ? (
              <img src={track.coverUrl} alt={`${track.album} cover art`} loading="lazy" />
            ) : (
              <div className="queue-thumb-fallback cover-placeholder-art">
                <i className="fa-solid fa-record-vinyl" aria-hidden="true" />
              </div>
            )}

            <button type="button" className="queue-item-main" aria-label={`Play ${track.title}`} onClick={() => onPlay?.(track.id)}>
              <div className="queue-item-copy">
                <strong>{track.title}</strong>
                <span>{track.artist}</span>
              </div>
            </button>

            <div className="queue-item-trailing">
              <span className="queue-item-index">{index + 1}</span>
              <div className="queue-item-actions">
                <button
                  type="button"
                  className={`queue-item-favorite${favorite ? ' active' : ''}`}
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
                  className="queue-item-remove"
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
