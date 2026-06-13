import React from 'react';
import { AlbumCollection } from './AlbumCollection.jsx';
import { LibraryFilterBar, LibraryPager } from './LibraryControls.jsx';
import { CoverImage } from './VisualBits.jsx';

export function CollectionBrowser({
  folders = [],
  selectedFolder = null,
  loading = false,
  errorMessage = '',
  filterProps = null,
  pagerProps = null,
  albumCollectionProps = {},
  onOpenFolder,
  onBack,
  onPage,
  onPageSize,
}) {
  if (selectedFolder) {
    return (
      <div className="collection-browser">
        <div className="collection-browser-header">
          <button className="secondary-button collection-back-button" type="button" onClick={() => onBack?.()}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
            <span>Collections</span>
          </button>
          <div>
            <h3>{selectedFolder.name}</h3>
            <p>{selectedFolder.path}</p>
          </div>
        </div>
        <AlbumCollection {...albumCollectionProps} />
      </div>
    );
  }

  if (errorMessage) {
    return <p className="empty-state">Unable to load collection folders: {errorMessage}</p>;
  }

  return (
    <>
      {filterProps ? <LibraryFilterBar {...filterProps} /> : null}
      {loading ? (
        <p className="empty-state">Loading collections...</p>
      ) : folders.length ? (
        <div className="collection-folder-grid">
          {folders.map((folder) => (
            <button
              key={folder.path}
              className="collection-folder-card"
              type="button"
              onClick={() => onOpenFolder?.(folder.path)}
            >
              <span className="collection-folder-icon" aria-hidden="true">
                <CoverImage
                  src={folder.coverUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  placeholderClassName="album-art-placeholder collection-folder-cover-placeholder"
                />
              </span>
              <strong>{folder.name}</strong>
              <span>{folder.albumCount || folder.trackCount || 0} album{(folder.albumCount || folder.trackCount) === 1 ? '' : 's'}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="empty-state">No album collections matched this search.</p>
      )}
      {pagerProps ? <LibraryPager {...pagerProps} onPage={onPage} onPageSize={onPageSize} /> : null}
    </>
  );
}
