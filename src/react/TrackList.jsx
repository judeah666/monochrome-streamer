import React from 'react';
import { CoverPlaceholder, FontAwesomeIcon } from './VisualBits.jsx';

const albumDiscHeaderClassName = [
  'album-disc-header tw-flex tw-items-center tw-justify-between tw-gap-3.5',
  'tw-border-b tw-border-line tw-bg-[color-mix(in_srgb,var(--surface-2)_78%,transparent)]',
  'tw-px-5 tw-py-3 tw-text-text tw-uppercase tw-tracking-[0.16em]',
].join(' ');
const trackRowBaseClassName = [
  'track-row track-row-shell',
].join(' ');
const trackRowActiveClassName = ' is-active';
const trackImageClassName = 'tw-h-[76px] tw-w-[76px] tw-rounded-[16px] tw-object-cover';
const trackPlaceholderClassName = 'track-placeholder-host tw-block tw-h-[76px] tw-w-[76px]';
const trackCopyClassName = 'track-copy tw-min-w-0';
const trackTitleClassName = 'track-copy-title';
const trackMetaClassName = 'track-copy-meta';
const trackFolderClassName = 'track-folder-path tw-m-0 tw-mt-1 tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-text-[0.78rem] tw-text-muted tw-opacity-80';
const albumTrackRowBaseClassName = [
  'album-track-row album-track-row-shell',
].join(' ');
const trackIndexClassName = 'track-index tw-text-muted';
const trackTitleGroupClassName = 'track-title-group tw-grid tw-min-w-0 tw-gap-1';
const inlineButtonClassName = 'tw-min-w-0 tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-inherit tw-cursor-pointer hover:tw-text-accent';
const albumInlineButtonClassName = `album-inline-link ${inlineButtonClassName}`;
const artistInlineButtonClassName = `artist-inline-link ${inlineButtonClassName}`;
const rowActionsClassName = 'row-actions track-action-row';
const rowIconButtonClassName = 'track-action-button';

export function TrackList({
  tracks = [],
  variant = 'standard',
  showAlbum = true,
  onPlay,
  onFavorite,
  onAddQueue,
  onArtistClick,
  onAlbumClick,
}) {
  if (variant === 'album') {
    return (
      <>
        {groupTracksByDisc(tracks).map(([discNumber, discTracks]) => (
          <React.Fragment key={discNumber}>
            <div className={albumDiscHeaderClassName}>
              <span className="tw-text-[0.78rem] tw-font-black">Disc {discNumber}</span>
              <small className="tw-text-[0.72rem] tw-normal-case tw-tracking-[0.02em] tw-text-muted">{discTracks.length} track{discTracks.length === 1 ? '' : 's'}</small>
            </div>
            {discTracks.map((track) => (
              <AlbumTrackRow
                key={track.id}
                track={track}
                onPlay={(options) => onPlay?.(track.id, options)}
                onFavorite={() => onFavorite?.(track.id)}
                onAddQueue={() => onAddQueue?.(track.id)}
                onArtistClick={() => onArtistClick?.(track.artist)}
                onAlbumClick={() => onAlbumClick?.(track.id)}
              />
            ))}
          </React.Fragment>
        ))}
      </>
    );
  }

  return (
    <>
      {tracks.map((track) => {
        return (
          <TrackRow
            key={track.id}
            track={track}
            showAlbum={showAlbum}
            onPlay={(options) => onPlay?.(track.id, options)}
            onFavorite={() => onFavorite?.(track.id)}
            onAddQueue={() => onAddQueue?.(track.id)}
            onArtistClick={() => onArtistClick?.(track.artist)}
            onAlbumClick={() => onAlbumClick?.(track.id)}
          />
        );
      })}
    </>
  );
}

function TrackRow({ track, showAlbum, onPlay, onFavorite, onAddQueue, onArtistClick, onAlbumClick }) {
  return (
    <article className={`${trackRowBaseClassName}${track.active ? trackRowActiveClassName : ''}`} onClick={() => onPlay?.({ toggle: false })}>
      {track.coverUrl ? (
        <img className={trackImageClassName} src={track.coverUrl} alt={`${track.album} cover art`} loading="lazy" />
      ) : (
        <span className={trackPlaceholderClassName}>
          <CoverPlaceholder className="track-thumb-placeholder" />
        </span>
      )}
      <div className={trackCopyClassName}>
        <h4 className={trackTitleClassName}>{track.title}</h4>
        <p className={trackMetaClassName}>
          <ArtistInlineButton artist={track.artist} onArtistClick={onArtistClick} />
          {showAlbum ? (
            <>
              <span aria-hidden="true"> · </span>
              <AlbumInlineButton album={track.album} onAlbumClick={onAlbumClick} />
            </>
          ) : null}
        </p>
        {track.folderPath ? <p className={trackFolderClassName}>{track.folderPath}</p> : null}
      </div>
      <TrackActions track={track} onFavorite={onFavorite} onAddQueue={onAddQueue} onPlay={onPlay} />
    </article>
  );
}

function AlbumTrackRow({ track, onPlay, onFavorite, onAddQueue, onArtistClick, onAlbumClick }) {
  return (
    <article className={`${albumTrackRowBaseClassName}${track.active ? trackRowActiveClassName : ''}`} onClick={() => onPlay?.({ toggle: false })}>
      <span className={trackIndexClassName}>{track.trackNumber ?? '•'}</span>
      <div className={trackTitleGroupClassName}>
        <strong className="tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap">{track.title}</strong>
        <ArtistInlineButton artist={track.artist} onArtistClick={onArtistClick} />
      </div>
      <AlbumInlineButton className="track-album-name tw-text-muted" album={track.album} onAlbumClick={onAlbumClick} />
      <TrackActions track={track} onFavorite={onFavorite} onAddQueue={onAddQueue} onPlay={onPlay} />
    </article>
  );
}

function ArtistInlineButton({ artist, onArtistClick }) {
  if (!artist) return <span>Unknown artist</span>;

  return (
    <button
      type="button"
      className={artistInlineButtonClassName}
      onClick={(event) => {
        event.stopPropagation();
        onArtistClick?.();
      }}
    >
      {artist}
    </button>
  );
}

function AlbumInlineButton({ album, className = '', onAlbumClick }) {
  if (!album) return <span className={className}>Unknown album</span>;

  return (
    <button
      type="button"
      className={`${albumInlineButtonClassName}${className ? ` ${className}` : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        onAlbumClick?.();
      }}
    >
      {album}
    </button>
  );
}

function TrackActions({ track, onFavorite, onAddQueue, onPlay }) {
  return (
    <div className={rowActionsClassName}>
      <button
        type="button"
        className={`favorite-toggle-button ${rowIconButtonClassName}${track.favorite ? ' active' : ''}`}
        aria-label={`${track.favorite ? 'Unfavorite' : 'Favorite'} ${track.title}`}
        onClick={(event) => {
          event.stopPropagation();
          onFavorite?.();
        }}
      >
        <FontAwesomeIcon name="favorite" />
      </button>
      <button
        type="button"
        className={`queue-track-button ${rowIconButtonClassName}`}
        aria-label={`Add ${track.title} to queue`}
        onClick={(event) => {
          event.stopPropagation();
          onAddQueue?.();
        }}
      >
        <FontAwesomeIcon name="addQueue" />
      </button>
      <button
        type="button"
        className={`row-play-button ${rowIconButtonClassName}`}
        aria-label={`${track.playing ? 'Pause' : 'Play'} ${track.title}`}
        onClick={(event) => {
          event.stopPropagation();
          onPlay?.({ toggle: true });
        }}
      >
        <FontAwesomeIcon name={track.playing ? 'pause' : 'play'} />
      </button>
    </div>
  );
}

function groupTracksByDisc(tracks) {
  const groups = new Map();
  for (const track of tracks) {
    const discNumber = track.discNumber || 1;
    if (!groups.has(discNumber)) {
      groups.set(discNumber, []);
    }
    groups.get(discNumber).push(track);
  }
  return [...groups.entries()].sort(([leftDisc], [rightDisc]) => Number(leftDisc) - Number(rightDisc));
}
