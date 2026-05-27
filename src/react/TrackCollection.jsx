import React from 'react';
import { TrackList } from './TrackList.jsx';

const trackListClassName = 'track-list-react';

export function TrackCollection({
  tracks = [],
  total = 0,
  limit = 160,
  emptyMessage = 'No tracks yet.',
  variant = 'standard',
  showAlbum = true,
  onPlayTrack,
  onFavoriteTrack,
  onAddTrackToQueue,
  onArtistClick,
  onAlbumClick,
}) {
  if (!tracks.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  const visibleTotal = total || tracks.length;

  return (
    <>
      <div className={trackListClassName}>
        <TrackList
          tracks={tracks}
          variant={variant}
          showAlbum={showAlbum}
          onPlay={onPlayTrack}
          onFavorite={onFavoriteTrack}
          onAddQueue={onAddTrackToQueue}
          onArtistClick={onArtistClick}
          onAlbumClick={onAlbumClick}
        />
      </div>
      {visibleTotal > limit ? (
        <p className="render-limit-notice">
          Showing {limit} of {visibleTotal} tracks. Use search or select fewer folders to narrow this view.
        </p>
      ) : null}
    </>
  );
}
