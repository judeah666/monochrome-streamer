import React from 'react';
import { AlbumGrid } from './AlbumGrid.jsx';
import { TrackList } from '../library/TrackList.jsx';
import { AudioQualityBadge, CoverImage, FontAwesomeIcon, MediaTypeIcons } from '../common/VisualBits.jsx';

const albumHeroClassName = [
  'album-hero tw-relative tw-overflow-hidden tw-rounded-[30px] tw-border tw-border-line',
  'tw-bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_10%,transparent),transparent),var(--glass-heavy)]',
  'tw-shadow-panel tw-backdrop-blur-[22px]',
].join(' ');
const albumHeroScrimClassName = 'album-hero-scrim tw-absolute tw-inset-0';
const albumHeroContentClassName = [
  'album-hero-content tw-relative tw-z-[1] tw-grid tw-grid-cols-[300px_minmax(0,1fr)]',
  'tw-items-center tw-gap-7 tw-p-[34px] max-[860px]:tw-grid-cols-1 max-[860px]:tw-p-6',
].join(' ');
const albumCoverFrameClassName = 'album-cover-frame';
const albumCoverImageClassName = 'tw-h-[300px] tw-w-[300px] tw-rounded-[30px] tw-object-cover';
const albumCoverFallbackClassName = `cover-fallback ${albumCoverImageClassName}`;
const albumHeroCopyClassName = 'album-hero-copy tw-min-w-0';
const albumTitleClassName = 'tw-m-0 tw-text-[clamp(2.5rem,4vw,4rem)] tw-leading-[0.94] tw-tracking-[-0.05em]';
const albumMetaClassName = 'album-detail-meta tw-m-0 tw-mt-2.5 tw-text-[1.02rem] tw-text-muted';
const albumArtistClassName = 'album-detail-artist tw-m-0 tw-mt-2.5 tw-text-[1.02rem] tw-text-text';
const albumFolderClassName = 'album-detail-folder tw-m-0 tw-mt-2.5 tw-overflow-wrap-anywhere tw-text-[1.02rem] tw-text-muted';
const albumActionsClassName = 'album-actions tw-mt-6 tw-flex tw-flex-wrap tw-items-center tw-gap-3';
const albumActionButtonClassName = 'album-action-button tw-inline-flex tw-items-center tw-justify-center tw-gap-2.5';
const albumActionIconClassName = 'album-action-icon';
const albumContentLayoutClassName = 'album-content-layout tw-mt-7 tw-grid tw-grid-cols-[minmax(0,1fr)_320px] tw-gap-7 max-[1100px]:tw-grid-cols-1';
const albumMainClassName = 'album-main tw-overflow-hidden tw-rounded-[24px] tw-border tw-border-line tw-bg-[var(--glass-heavy)] tw-shadow-panel tw-backdrop-blur-[22px]';
const trackTableHeaderClassName = [
  'track-table-header tw-grid tw-grid-cols-[56px_minmax(0,1fr)_minmax(120px,180px)_auto]',
  'tw-items-center tw-gap-[18px] tw-border-b tw-border-line tw-px-5 tw-pb-3.5 tw-pt-[18px]',
  'tw-text-[0.86rem] tw-text-muted max-[720px]:tw-hidden',
].join(' ');
const trackTableClassName = 'track-table tw-grid';
const albumSidebarClassName = 'album-sidebar tw-grid tw-content-start tw-gap-0';
const relatedSectionClassName = 'content-section tw-mt-0 tw-overflow-hidden tw-rounded-[24px] tw-border tw-border-line tw-bg-[var(--glass-heavy)] tw-p-[18px] tw-shadow-panel tw-backdrop-blur-[22px]';
const relatedTitleClassName = 'tw-m-0 tw-mb-3.5 tw-text-[1.1rem]';
const sideCardGridClassName = 'side-card-grid';

export function AlbumDetail({
  album,
  loading = false,
  error = '',
  onBack,
  tracks = [],
  relatedAlbums = [],
  epAlbums = [],
  favorite = false,
  shareCopied = false,
  downloadActive = false,
  downloadBusy = false,
  canQueue = false,
  canDownload = true,
  onPlayAlbum,
  onQueueAlbum,
  onDownloadAlbum,
  onShareAlbum,
  onEditAlbum,
  onFavoriteAlbum,
  onPlayTrack,
  onFavoriteTrack,
  onAddTrackQueue,
  onAddTrackPlaylist,
  onDownloadTrack,
  onArtistClick,
  onAlbumClick,
  onOpenAlbum,
  onPlayRelatedAlbum,
}) {
  if (!album) {
    return (
      <section className="content-section">
        <p className="empty-state">{loading ? 'Loading album...' : (error || 'Album was not found.')}</p>
        {!loading ? (
          <button className="secondary-button" type="button" onClick={() => onBack?.()}>
            Back to library
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <>
      <section className={albumHeroClassName} style={album.coverBackdrop ? { '--album-cover': `url("${album.coverBackdrop}")` } : undefined}>
        <div className={albumHeroScrimClassName}></div>
        <div className={albumHeroContentClassName}>
          <div className={albumCoverFrameClassName}>
            <CoverImage
              className={albumCoverImageClassName}
              src={album.coverUrl}
              alt={`${album.title} cover art`}
              decoding="async"
              fetchPriority="high"
              placeholderClassName={albumCoverFallbackClassName}
            />
          </div>

          <div className={albumHeroCopyClassName}>
            <p className="album-detail-format">
              <span className={`album-detail-format-card${album.wishlist ? ' is-wishlist' : ''}`}>
                <MediaTypeIcons mediaTypes={album.mediaTypes} includeLabels />
              </span>
              <AudioQualityBadge quality={album.audioQuality} includeLabel />
            </p>
            <h2 className={albumTitleClassName}>{album.title}</h2>
            <p className={albumMetaClassName}>{album.meta}</p>
            <p className={albumArtistClassName}>By {album.artist}</p>
            {album.folder ? <p className={albumFolderClassName}>Folder: {album.folder}</p> : null}
            <div className={albumActionsClassName}>
              <button className={`primary-button ${albumActionButtonClassName}`} type="button" disabled={!canQueue} aria-label="Play album" title="Play album" onClick={() => onPlayAlbum?.(album.id)}>
                <i className={`fa-solid fa-play ${albumActionIconClassName}`} aria-hidden="true"></i>
                <span className="album-action-label">Play album</span>
              </button>
              <button className={`secondary-button ${albumActionButtonClassName}`} type="button" disabled={!canQueue} aria-label="Add album to queue" title="Add album to queue" onClick={() => onQueueAlbum?.(album.id)}>
                <i className={`fa-solid fa-list-ul ${albumActionIconClassName}`} aria-hidden="true"></i>
                <span className="album-action-label">Add to queue</span>
              </button>
              <button
                className={`secondary-button ${albumActionButtonClassName}${downloadBusy ? ' is-download-busy' : ''}`}
                type="button"
                disabled={!canQueue || !canDownload || downloadActive}
                aria-label={downloadBusy ? 'Downloading album' : 'Download album'}
                aria-busy={downloadBusy ? 'true' : undefined}
                title={downloadBusy ? 'Downloading album' : 'Download album'}
                onClick={() => onDownloadAlbum?.(album.id)}
              >
                {downloadBusy ? (
                  <span className="download-busy-spinner" aria-hidden="true"></span>
                ) : (
                  <i className={`fa-solid fa-download ${albumActionIconClassName}`} aria-hidden="true"></i>
                )}
                <span className="album-action-label">{downloadBusy ? 'Downloading' : 'Download'}</span>
              </button>
              <button
                className={`secondary-button ${albumActionButtonClassName}`}
                type="button"
                aria-label={shareCopied ? 'Album link copied' : 'Share album link'}
                title={shareCopied ? 'Album link copied' : 'Share album link'}
                onClick={() => onShareAlbum?.(album.id)}
              >
                <i className={`fa-solid fa-link ${albumActionIconClassName}`} aria-hidden="true"></i>
                <span className="album-action-label">{shareCopied ? 'Copied' : 'Share'}</span>
              </button>
              {onEditAlbum ? (
                <button
                  className="icon-button album-edit-button"
                  type="button"
                  aria-label="Edit album"
                  title="Edit album"
                  onClick={() => onEditAlbum(album.id)}
                >
                  <FontAwesomeIcon name="edit" />
                </button>
              ) : null}
              <button
                className={`icon-button album-favorite-button${favorite ? ' active' : ''}`}
                type="button"
                aria-label={favorite ? 'Unfavorite album' : 'Favorite album'}
                aria-pressed={favorite}
                title={favorite ? 'Unfavorite album' : 'Favorite album'}
                onClick={() => onFavoriteAlbum?.(album.id)}
              >
                <FontAwesomeIcon name="favorite" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className={albumContentLayoutClassName}>
        <section className={albumMainClassName}>
          <div className={trackTableHeaderClassName}>
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span>Action</span>
          </div>
          <div className={trackTableClassName}>
            {tracks.length === 0 ? (
              <p className="empty-state">No tracks matched this album search.</p>
            ) : (
              <TrackList
                tracks={tracks}
                variant="album"
                onPlay={onPlayTrack}
                onFavorite={onFavoriteTrack}
                onAddQueue={onAddTrackQueue}
                onAddPlaylist={onAddTrackPlaylist}
                onDownload={onDownloadTrack}
                onArtistClick={onArtistClick}
                onAlbumClick={onAlbumClick}
              />
            )}
          </div>
        </section>

        <aside className={albumSidebarClassName}>
          <RelatedAlbums
            title={`More albums from ${album.artist}`}
            albums={relatedAlbums}
            onOpen={onOpenAlbum}
            onPlay={onPlayRelatedAlbum}
          />
          <RelatedAlbums
            title={`EPs and Singles from ${album.artist}`}
            albums={epAlbums}
            onOpen={onOpenAlbum}
            onPlay={onPlayRelatedAlbum}
          />
        </aside>
      </div>
    </>
  );
}

function RelatedAlbums({ title, albums = [], onOpen, onPlay }) {
  if (albums.length === 0) return null;

  return (
    <section className={relatedSectionClassName}>
      <h3 className={relatedTitleClassName}>{title}</h3>
      <div className={sideCardGridClassName}>
        <AlbumGrid albums={albums} compact onOpen={onOpen} onPlay={onPlay} />
      </div>
    </section>
  );
}
