import React from 'react';
import { AlbumCollection } from './AlbumCollection.jsx';
import { CoverPlaceholder } from './VisualBits.jsx';

export function CollectionBrowser({
  folders = [],
  selectedFolder = null,
  loading = false,
  errorMessage = '',
  albumCollectionProps = {},
  onOpenFolder,
  onBack,
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

  if (loading) {
    return <p className="empty-state">Loading collections...</p>;
  }

  if (errorMessage) {
    return <p className="empty-state">Unable to load collection folders: {errorMessage}</p>;
  }

  if (!folders.length) {
    return <p className="empty-state">No album collections matched this search.</p>;
  }

  return (
    <div className="collection-folder-grid">
      {folders.map((folder) => (
        <button
          key={folder.path}
          className="collection-folder-card"
          type="button"
          onClick={() => onOpenFolder?.(folder.path)}
        >
          <span className="collection-folder-icon" aria-hidden="true">
            {folder.coverUrl ? (
              <img src={folder.coverUrl} alt="" loading="lazy" />
            ) : (
              <CoverPlaceholder />
            )}
          </span>
          <strong>{folder.name}</strong>
          <span>{folder.albumCount || folder.trackCount || 0} album{(folder.albumCount || folder.trackCount) === 1 ? '' : 's'}</span>
          <small>{folder.path}</small>
        </button>
      ))}
    </div>
  );
}
