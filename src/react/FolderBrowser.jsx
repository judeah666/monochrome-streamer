import React from 'react';

export function FolderBrowser({
  rootListing,
  folderCacheEntries = [],
  expandedPaths = [],
  loadingPaths = [],
  currentTrackId = '',
  playing = false,
  isFavoriteTrack,
  onToggleFolder,
  onPlayFolder,
  onPlayTrack,
  onToggleFavorite,
}) {
  if (!rootListing) {
    return <p className="empty-state">Loading folders from database...</p>;
  }

  const folderCache = new Map(folderCacheEntries);
  const expandedSet = new Set(expandedPaths);
  const loadingSet = new Set(loadingPaths);
  const hasContent = Boolean(rootListing.folders?.length || rootListing.tracks?.length);

  if (!hasContent) {
    return <p className="empty-state">No folders matched this filter.</p>;
  }

  return (
    <>
      {(rootListing.folders || []).map((folder) => (
        <FolderNode
          key={folder.path || folder.name}
          folder={folder}
          folderCache={folderCache}
          expandedSet={expandedSet}
          loadingSet={loadingSet}
          currentTrackId={currentTrackId}
          playing={playing}
          isFavoriteTrack={isFavoriteTrack}
          onToggleFolder={onToggleFolder}
          onPlayFolder={onPlayFolder}
          onPlayTrack={onPlayTrack}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
      {(rootListing.tracks || []).map((track) => (
        <FolderTrackRow
          key={track.id}
          track={track}
          queueTracks={rootListing.tracks || []}
          currentTrackId={currentTrackId}
          playing={playing}
          favorite={Boolean(isFavoriteTrack?.(track.id))}
          onPlayTrack={onPlayTrack}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </>
  );
}

function FolderNode({
  folder,
  folderCache,
  expandedSet,
  loadingSet,
  currentTrackId,
  playing,
  isFavoriteTrack,
  onToggleFolder,
  onPlayFolder,
  onPlayTrack,
  onToggleFavorite,
}) {
  const folderPath = normalizeFolderPath(folder.path || folder.name);
  const listing = folderCache.get(folderPath);
  const expanded = expandedSet.has(folderPath);
  const loading = loadingSet.has(folderPath);
  const canPlayFolder = Boolean(folder.canPlayFolder)
    || Number(folder.directTrackCount || 0) > 0
    || Boolean(folder.hasDirectTracks);
  const childCount = Number(folder.trackCount || 0);

  return (
    <details
      className="folder-node"
      open={expanded}
      onToggle={(event) => {
        if (event.currentTarget.open !== expanded) {
          onToggleFolder?.(folderPath, event.currentTarget.open);
        }
      }}
    >
      <summary>
        <span className="folder-node-arrow" aria-hidden="true">
          <span className="folder-arrow-closed"><i className="fa-solid fa-chevron-right"></i></span>
          <span className="folder-arrow-open"><i className="fa-solid fa-chevron-down"></i></span>
        </span>
        <span className="folder-node-main">
          <span className="folder-node-name">{folder.name}</span>
          <span className="folder-node-meta">{childCount} track{childCount === 1 ? '' : 's'}</span>
        </span>
        {canPlayFolder ? (
          <button
            type="button"
            className="folder-node-play"
            aria-label={`Play ${folder.name} folder`}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              event.stopPropagation();
              onPlayFolder?.(folderPath);
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onPlayFolder?.(folderPath);
            }}
          >
            <i className="fa-solid fa-play"></i>
          </button>
        ) : null}
      </summary>
      <div className="folder-node-body">
        {expanded ? (
          <FolderNodeBody
            listing={listing}
            loading={loading}
            folderCache={folderCache}
            expandedSet={expandedSet}
            loadingSet={loadingSet}
            currentTrackId={currentTrackId}
            playing={playing}
            isFavoriteTrack={isFavoriteTrack}
            onToggleFolder={onToggleFolder}
            onPlayFolder={onPlayFolder}
            onPlayTrack={onPlayTrack}
            onToggleFavorite={onToggleFavorite}
          />
        ) : null}
      </div>
    </details>
  );
}

function FolderNodeBody({
  listing,
  loading,
  folderCache,
  expandedSet,
  loadingSet,
  currentTrackId,
  playing,
  isFavoriteTrack,
  onToggleFolder,
  onPlayFolder,
  onPlayTrack,
  onToggleFavorite,
}) {
  if (!listing) {
    return <p className="empty-state">{loading ? 'Loading folder...' : 'Loading folder...'}</p>;
  }

  return (
    <>
      {(listing.folders || []).map((folder) => (
        <FolderNode
          key={folder.path || folder.name}
          folder={folder}
          folderCache={folderCache}
          expandedSet={expandedSet}
          loadingSet={loadingSet}
          currentTrackId={currentTrackId}
          playing={playing}
          isFavoriteTrack={isFavoriteTrack}
          onToggleFolder={onToggleFolder}
          onPlayFolder={onPlayFolder}
          onPlayTrack={onPlayTrack}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
      {(listing.tracks || []).map((track) => (
        <FolderTrackRow
          key={track.id}
          track={track}
          queueTracks={listing.tracks || []}
          currentTrackId={currentTrackId}
          playing={playing}
          favorite={Boolean(isFavoriteTrack?.(track.id))}
          onPlayTrack={onPlayTrack}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </>
  );
}

function FolderTrackRow({
  track,
  queueTracks,
  currentTrackId,
  playing,
  favorite,
  onPlayTrack,
  onToggleFavorite,
}) {
  const active = track.id === currentTrackId;
  const isPlaying = active && playing;

  return (
    <div className={`folder-track-row${active ? ' is-active' : ''}`}>
      <button type="button" className="folder-track-main" aria-label={`Play ${track.title}`} onClick={() => onPlayTrack?.(track, queueTracks)}>
        <strong>{track.title}</strong>
        <span>{String(track.relativePath || '').replaceAll('\\', ' / ')}</span>
      </button>
      <div className="row-actions">
        <button
          type="button"
          className={`favorite-toggle-button${favorite ? ' active' : ''}`}
          aria-label={`${favorite ? 'Unfavorite' : 'Favorite'} ${track.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite?.(track.id);
          }}
        >
          <i className={`${favorite ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
        </button>
        <button
          type="button"
          className="row-play-button"
          aria-label={`Play ${track.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onPlayTrack?.(track, queueTracks, { toggleIfCurrent: true });
          }}
        >
          <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
      </div>
    </div>
  );
}

function normalizeFolderPath(folderPath) {
  return String(folderPath || '')
    .replace(/\\/gu, '/')
    .replace(/^\/+|\/+$/gu, '')
    .replace(/\/+/gu, '/')
    .trim();
}
