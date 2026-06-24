import React from 'react';
import { ArtistGrid } from '../artists/ArtistGrid.jsx';
import { LibraryFilterBar, LibraryPager } from './LibraryControls.jsx';
import { TrackList } from './TrackList.jsx';

const artistGridClassName = 'artist-card-grid';
const trackListClassName = 'track-list track-list-shell library-track-search-list';

function EmptyState({ children }) {
  return <p className="empty-state">{children}</p>;
}

export function LibraryArtistsPanel({
  artists = [],
  filterProps = {},
  pagerProps = {},
  emptyMessage = 'No artists matched this filter.',
  onOpenArtist,
}) {
  return (
    <>
      <LibraryFilterBar {...filterProps} />
      {artists.length === 0 ? (
        <EmptyState>{emptyMessage}</EmptyState>
      ) : (
        <div className={artistGridClassName}>
          <ArtistGrid artists={artists} onOpen={onOpenArtist} />
        </div>
      )}
      <LibraryPager {...pagerProps} />
    </>
  );
}

export function LibraryTracksPanel({
  tracks = [],
  searchTerm = '',
  filterProps = {},
  pagerProps = {},
  promptMessage = 'Search for a track title, artist, album, or file path to show tracks here.',
  emptyMessage = 'No tracks matched this search.',
  onPlayTrack,
  onFavoriteTrack,
  onAddTrackToQueue,
  onAddTrackToPlaylist,
  onArtistClick,
  onAlbumClick,
}) {
  const hasSearch = Boolean(searchTerm);

  return (
    <>
      <LibraryFilterBar {...filterProps} />
      {!hasSearch ? (
        <EmptyState>{promptMessage}</EmptyState>
      ) : tracks.length === 0 ? (
        <>
          <EmptyState>{emptyMessage}</EmptyState>
          <LibraryPager {...pagerProps} />
        </>
      ) : (
        <>
          <div className={trackListClassName}>
            <TrackList
              tracks={tracks}
              variant="standard"
              showAlbum
              onPlay={onPlayTrack}
              onFavorite={onFavoriteTrack}
              onAddQueue={onAddTrackToQueue}
              onAddPlaylist={onAddTrackToPlaylist}
              onArtistClick={onArtistClick}
              onAlbumClick={onAlbumClick}
            />
          </div>
          <LibraryPager {...pagerProps} />
        </>
      )}
    </>
  );
}
