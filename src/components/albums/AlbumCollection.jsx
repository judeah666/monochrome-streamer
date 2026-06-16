import React from 'react';
import { AlbumGrid } from './AlbumGrid.jsx';
import { LibraryFilterBar, LibraryPager } from '../library/LibraryControls.jsx';

const albumGridClassName = 'album-grid tw-grid tw-grid-cols-[repeat(auto-fill,minmax(var(--album-card-size),1fr))] tw-gap-4';
const libraryAlbumGridClassName = 'library-album-grid tw-grid tw-grid-cols-[repeat(auto-fill,minmax(var(--album-card-size),1fr))] tw-gap-3.5';

export function AlbumCollection({
  albums = [],
  emptyMessage = 'No albums found.',
  compact = false,
  showFilter = false,
  showPager = false,
  pager = null,
  page = {},
  total,
  itemLabel = 'album',
  showPageSize = false,
  loading = false,
  alphabetFilters = [],
  activeLetter = 'all',
  mediaTypes = [],
  activeMediaTypes = [],
  showMediaType = true,
  onLetter,
  onMediaType,
  onOpen,
  onPlay,
  onPage,
  onPageSize,
  wrapGrid = false,
}) {
  const pagerPage = pager?.page || page || {};
  const pagerTotalValue = total ?? pager?.total ?? 0;
  const pagerTotal = Number.isFinite(Number(pagerTotalValue)) ? Number(pagerTotalValue) : 0;

  return (
    <>
      {showFilter ? (
        <LibraryFilterBar
          alphabetFilters={alphabetFilters}
          activeLetter={activeLetter}
          mediaTypes={mediaTypes}
          activeMediaTypes={activeMediaTypes}
          showMediaType={showMediaType}
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
          page={pagerPage}
          total={pagerTotal}
          itemLabel={itemLabel}
          showPageSize={showPageSize}
          loading={loading}
          onPage={onPage}
          onPageSize={onPageSize}
        />
      ) : null}
    </>
  );
}
