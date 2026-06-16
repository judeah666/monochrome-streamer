import React from 'react';
import { CoverImage } from '../common/VisualBits.jsx';

const coverClassName = 'cover tw-h-full tw-w-full tw-rounded-[14px] tw-object-cover tw-cursor-pointer';
const coverFallbackClassName = 'player-cover-fallback tw-grid tw-place-items-center tw-rounded-[14px] tw-cursor-pointer';
const detailsClassName = 'details tw-min-w-0 tw-cursor-pointer';
const titleClassName = 'title tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-font-extrabold';
const albumClassName = 'album tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-text-muted';
const albumLinkClassName = `${albumClassName} player-album-link hover:tw-text-accent`;
const artistClassName = 'artist tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-text-muted';
const artistButtonClassName = `${artistClassName} player-artist-link tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-cursor-pointer hover:tw-text-accent`;

export function PlayerNowPlaying({
  track = null,
  album = null,
  coverUrl = '',
  coverAlt = '',
  title = 'Select a track',
  albumTitle = '',
  artist = 'Your queue will appear here.',
  onNowPlayingClick,
  onAlbumClick,
  onArtistClick,
}) {
  const hasTrack = Boolean(track);

  return (
    <>
      <CoverImage
        id="player-cover"
        className={coverClassName}
        src={coverUrl}
        alt={coverAlt}
        decoding="async"
        fetchPriority="high"
        role="button"
        tabIndex={0}
        placeholderClassName={coverFallbackClassName}
        placeholderProps={{ id: 'player-cover-fallback', role: 'button', tabIndex: 0 }}
        onClick={() => onNowPlayingClick?.()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onNowPlayingClick?.();
          }
        }}
      />

      <div className={detailsClassName} onClick={() => onNowPlayingClick?.()}>
        <div id="player-title" className={titleClassName}>
          {title}
        </div>
        {hasTrack && album ? (
          <a
            id="player-album"
            className={albumLinkClassName}
            href={`#album/${encodeURIComponent(album.id)}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAlbumClick?.();
            }}
          >
            {albumTitle}
          </a>
        ) : (
          <div id="player-album" className={albumClassName}>
            {albumTitle}
          </div>
        )}
        {hasTrack ? (
          <button
            id="player-artist"
            type="button"
            className={artistButtonClassName}
            onClick={(event) => {
              event.stopPropagation();
              onArtistClick?.();
            }}
          >
            {artist}
          </button>
        ) : (
          <div id="player-artist" className={artistClassName}>
            {artist}
          </div>
        )}
      </div>
    </>
  );
}
