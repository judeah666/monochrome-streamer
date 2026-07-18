import React from 'react';
import { PlayerIcon } from '../common/VisualBits.jsx';

const folderNodeClassName = 'folder-node tw-m-0 tw-pl-[22px]';
const folderSummaryClassName = [
  'tw-grid tw-grid-cols-[24px_minmax(0,1fr)_auto] tw-items-center tw-gap-3 tw-cursor-pointer',
  'tw-list-none tw-rounded-[16px] tw-border tw-border-line tw-bg-surface tw-px-3.5 tw-py-3',
  'tw-backdrop-blur-md hover:tw-border-[var(--line-strong)] hover:tw-bg-surface2',
].join(' ');
const folderArrowClassName = 'folder-node-arrow tw-inline-flex tw-w-6 tw-items-center tw-justify-center tw-text-muted';
const folderMainClassName = 'folder-node-main tw-grid tw-min-w-0 tw-gap-1';
const folderNameClassName = 'folder-node-name tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-font-bold';
const folderMetaClassName = 'folder-node-meta tw-text-[0.88rem] tw-text-muted';
const folderPlayClassName = 'folder-node-play tw-inline-flex tw-h-[38px] tw-w-[38px] tw-flex-none tw-items-center tw-justify-center tw-rounded-pill tw-border tw-border-line tw-bg-[var(--glass)] tw-text-text hover:tw-border-accent hover:tw-bg-accent hover:tw-text-[var(--accent-contrast)]';
const folderBodyClassName = 'folder-node-body tw-ml-[11px] tw-mt-3 tw-grid tw-gap-2.5 tw-pl-[22px]';
const folderTrackRowBaseClassName = 'folder-track-row tw-grid tw-grid-cols-[minmax(0,1fr)_auto] tw-items-center tw-gap-3 tw-rounded-[16px] tw-border tw-border-line tw-bg-surface tw-px-3 tw-py-2.5 tw-backdrop-blur-md';
const folderTrackActiveClassName = ' is-active tw-border-[color-mix(in_srgb,var(--accent)_42%,transparent)] tw-bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]';
const folderTrackMainClassName = 'folder-track-main tw-min-w-0 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-inherit';
const folderTrackTextClassName = 'tw-block tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap';
const rowActionsClassName = 'row-actions tw-flex tw-items-center tw-gap-2';
const rowButtonClassName = 'tw-inline-flex tw-h-[38px] tw-w-[38px] tw-items-center tw-justify-center tw-rounded-pill tw-border tw-border-line tw-bg-[var(--glass)] tw-p-0';

export function FolderBrowser({
  rootListing,
  folderCacheEntries = [],
  expandedPaths = [],
  loadingPaths = [],
  currentTrackId = '',
  isFavoriteTrack,
  onToggleFolder,
  onPlayFolder,
  onPlayTrack,
  onToggleFavorite,
  onDownloadTrack,
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
          isFavoriteTrack={isFavoriteTrack}
          onToggleFolder={onToggleFolder}
          onPlayFolder={onPlayFolder}
          onPlayTrack={onPlayTrack}
          onToggleFavorite={onToggleFavorite}
          onDownloadTrack={onDownloadTrack}
        />
      ))}
      {(rootListing.tracks || []).map((track) => (
        <FolderTrackRow
          key={track.id}
          track={track}
          queueTracks={rootListing.tracks || []}
          currentTrackId={currentTrackId}
          favorite={Boolean(isFavoriteTrack?.(track.id))}
          onPlayTrack={onPlayTrack}
          onToggleFavorite={onToggleFavorite}
          onDownloadTrack={onDownloadTrack}
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
  isFavoriteTrack,
  onToggleFolder,
  onPlayFolder,
  onPlayTrack,
  onToggleFavorite,
  onDownloadTrack,
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
      className={folderNodeClassName}
      open={expanded}
      onToggle={(event) => {
        if (event.currentTarget.open !== expanded) {
          onToggleFolder?.(folderPath, event.currentTarget.open);
        }
      }}
    >
      <summary className={folderSummaryClassName}>
        <span className={folderArrowClassName} aria-hidden="true">
          <span className="folder-arrow-closed"><i className="fa-solid fa-chevron-right"></i></span>
          <span className="folder-arrow-open"><i className="fa-solid fa-chevron-down"></i></span>
        </span>
        <span className={folderMainClassName}>
          <span className={folderNameClassName}>{folder.name}</span>
          <span className={folderMetaClassName}>{childCount} track{childCount === 1 ? '' : 's'}</span>
        </span>
        {canPlayFolder ? (
          <button
            type="button"
            className={folderPlayClassName}
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
      <div className={folderBodyClassName}>
        {expanded ? (
          <FolderNodeBody
            listing={listing}
            loading={loading}
            folderCache={folderCache}
            expandedSet={expandedSet}
            loadingSet={loadingSet}
            currentTrackId={currentTrackId}
            isFavoriteTrack={isFavoriteTrack}
            onToggleFolder={onToggleFolder}
            onPlayFolder={onPlayFolder}
            onPlayTrack={onPlayTrack}
            onToggleFavorite={onToggleFavorite}
            onDownloadTrack={onDownloadTrack}
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
  isFavoriteTrack,
  onToggleFolder,
  onPlayFolder,
  onPlayTrack,
  onToggleFavorite,
  onDownloadTrack,
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
          isFavoriteTrack={isFavoriteTrack}
          onToggleFolder={onToggleFolder}
          onPlayFolder={onPlayFolder}
          onPlayTrack={onPlayTrack}
          onToggleFavorite={onToggleFavorite}
          onDownloadTrack={onDownloadTrack}
        />
      ))}
      {(listing.tracks || []).map((track) => (
        <FolderTrackRow
          key={track.id}
          track={track}
          queueTracks={listing.tracks || []}
          currentTrackId={currentTrackId}
          favorite={Boolean(isFavoriteTrack?.(track.id))}
          onPlayTrack={onPlayTrack}
          onToggleFavorite={onToggleFavorite}
          onDownloadTrack={onDownloadTrack}
        />
      ))}
    </>
  );
}

function FolderTrackRow({
  track,
  queueTracks,
  currentTrackId,
  favorite,
  onPlayTrack,
  onToggleFavorite,
  onDownloadTrack,
}) {
  const active = track.id === currentTrackId;
  return (
    <div className={`${folderTrackRowBaseClassName}${active ? folderTrackActiveClassName : ''}`}>
      <button type="button" className={folderTrackMainClassName} aria-label={`Play ${track.title}`} onClick={() => onPlayTrack?.(track, queueTracks)}>
        <strong className={folderTrackTextClassName}>{track.title}</strong>
        <span className={`${folderTrackTextClassName} tw-mt-1 tw-text-[0.88rem] tw-text-muted`}>{String(track.relativePath || '').replaceAll('\\', ' / ')}</span>
      </button>
      <div className={rowActionsClassName}>
        <button
          type="button"
          className={`favorite-toggle-button ${rowButtonClassName}${favorite ? ' active' : ''}`}
          aria-label={`${favorite ? 'Unfavorite' : 'Favorite'} ${track.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite?.(track.id);
          }}
        >
          <i className={`${favorite ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
        </button>
        {onDownloadTrack ? (
          <button
            type="button"
            className={`download-track-button ${rowButtonClassName}`}
            aria-label={`Download ${track.title}`}
            onClick={(event) => {
              event.stopPropagation();
              onDownloadTrack(track);
            }}
          >
            <PlayerIcon name="download" />
          </button>
        ) : null}
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
