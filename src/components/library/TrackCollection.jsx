import React from 'react';
import { TrackList } from './TrackList.jsx';

const trackListClassName = 'track-list-react';
const renderLimitNoticeClassName = 'render-limit-notice tw-col-span-full tw-m-0 tw-mt-2.5 tw-rounded-[16px] tw-border tw-border-line tw-bg-[var(--background-soft)] tw-px-3.5 tw-py-3 tw-text-[0.9rem] tw-font-bold tw-text-muted';

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
        <p className={renderLimitNoticeClassName}>
          Showing {limit} of {visibleTotal} tracks. Use search or select fewer folders to narrow this view.
        </p>
      ) : null}
    </>
  );
}
