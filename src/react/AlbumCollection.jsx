import React from 'react';
import { AlbumGrid } from './AlbumGrid.jsx';
import { LibraryFilterBar, LibraryPager } from './LibraryControls.jsx';

const albumGridClassName = 'album-grid tw-grid tw-gap-4';
const libraryAlbumGridClassName = 'library-album-grid tw-grid tw-gap-4';

export function AlbumCollection({
  albums = [],
  emptyMessage = 'No albums found.',
  compact = false,
  showFilter = false,
  showPager = false,
  pager = {},
  itemLabel = 'album',
  showPageSize = false,
  alphabetFilters = [],
  activeLetter = 'all',
  mediaTypes = [],
  activeMediaTypes = [],
  onLetter,
  onMediaType,
  onOpen,
  onPlay,
  onPage,
  onPageSize,
  wrapGrid = false,
}) {
  return (
    <>
      {showFilter ? (
        <LibraryFilterBar
          alphabetFilters={alphabetFilters}
          activeLetter={activeLetter}
          mediaTypes={mediaTypes}
          activeMediaTypes={activeMediaTypes}
          onLetter={onLetter}
          onMediaType={onMediaType}
        />
      ) : null}

      {albums.length === 0 ? (
        <p className="empty-state">{emptyMessage}</p>
      ) : wrapGrid ? (
        <div className={compact ? libraryAlbumGridClassName : albumGridClassName}>
          <AlbumGrid albums={albums} compact={compact} onOpen={onOpen} onPlay={onPlay} />
        </div>
      ) : (
        <AlbumGrid albums={albums} compact={compact} onOpen={onOpen} onPlay={onPlay} />
      )}

      {showPager ? (
        <LibraryPager
          page={pager}
          total={pager.total || 0}
          itemLabel={itemLabel}
          showPageSize={showPageSize}
          onPage={onPage}
          onPageSize={onPageSize}
        />
      ) : null}
    </>
  );
}
