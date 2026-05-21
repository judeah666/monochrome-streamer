import React from 'react';

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
      {coverUrl ? (
        <img
          id="player-cover"
          className="cover"
          src={coverUrl}
          alt={coverAlt}
          role="button"
          tabIndex={0}
          onClick={() => onNowPlayingClick?.()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onNowPlayingClick?.();
            }
          }}
        />
      ) : (
        <div
          id="player-cover-fallback"
          className="player-cover-fallback"
          role="button"
          tabIndex={0}
          onClick={() => onNowPlayingClick?.()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onNowPlayingClick?.();
            }
          }}
        >
          <i className="fa-solid fa-record-vinyl" aria-hidden="true" />
        </div>
      )}

      <div className="details" onClick={() => onNowPlayingClick?.()}>
        <div id="player-title" className="title">
          {title}
        </div>
        {hasTrack && album ? (
          <a
            id="player-album"
            className="album player-album-link"
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
          <div id="player-album" className="album">
            {albumTitle}
          </div>
        )}
        {hasTrack ? (
          <button
            id="player-artist"
            type="button"
            className="artist player-artist-link"
            onClick={(event) => {
              event.stopPropagation();
              onArtistClick?.();
            }}
          >
            {artist}
          </button>
        ) : (
          <div id="player-artist" className="artist">
            {artist}
          </div>
        )}
      </div>
    </>
  );
}
