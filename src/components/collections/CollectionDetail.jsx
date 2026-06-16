import React from 'react';
import { AlbumGrid } from '../albums/AlbumGrid.jsx';
import { CoverImage } from '../common/VisualBits.jsx';

const heroClassName = [
  'collection-detail-hero tw-relative tw-grid tw-grid-cols-[220px_minmax(0,1fr)] tw-items-center tw-gap-7 tw-text-left',
  'tw-overflow-hidden tw-rounded-[30px] tw-border tw-border-line tw-bg-surface tw-p-[34px]',
  'tw-shadow-panel tw-backdrop-blur-[22px] max-[860px]:tw-grid-cols-1 max-[860px]:tw-justify-items-center max-[860px]:tw-p-6 max-[860px]:tw-text-center',
].join(' ');
const coverFrameClassName = 'collection-detail-cover tw-aspect-square tw-w-full tw-max-w-[220px] tw-overflow-hidden tw-rounded-[24px] tw-border tw-border-line tw-bg-surface2';
const coverImageClassName = 'tw-h-full tw-w-full tw-object-cover';
const copyClassName = 'tw-min-w-0 tw-grid max-[860px]:tw-justify-items-center';
const titleClassName = 'tw-m-0 tw-text-[clamp(2.4rem,4vw,4rem)] tw-leading-[0.94] tw-tracking-[-0.05em]';
const albumGridClassName = 'library-album-grid tw-grid tw-grid-cols-[repeat(auto-fill,minmax(var(--album-card-size),1fr))] tw-gap-3.5';

export function CollectionDetail({
  name = 'Collection',
  meta = '',
  bio = '',
  coverUrl = '',
  albums = [],
  loading = false,
  showEdit = false,
  onRename,
  onChangeCover,
  onDelete,
  onOpenAlbum,
  onPlayAlbum,
}) {
  return (
    <>
      <section className={heroClassName}>
        <div className={coverFrameClassName}>
          <CoverImage
            className={coverImageClassName}
            src={coverUrl}
            alt={`${name} collection cover`}
            loading="lazy"
            decoding="async"
            placeholderClassName={`${coverImageClassName} cover-fallback`}
          />
        </div>
        <div className={copyClassName}>
          <p className="eyebrow">Collection</p>
          <h2 className={titleClassName}>{name}</h2>
          <p className="artist-detail-meta">{meta}</p>
          <p className="artist-detail-bio">{bio}</p>
          {showEdit ? (
            <div className="collection-detail-actions">
              <button className="secondary-button" type="button" onClick={() => onChangeCover?.()}>
                <i className="fa-solid fa-image collection-detail-action-icon" aria-hidden="true"></i>
                <span className="collection-detail-action-label">Change Cover</span>
              </button>
              <button className="secondary-button" type="button" onClick={() => onRename?.()}>
                <i className="fa-solid fa-pen-to-square collection-detail-action-icon" aria-hidden="true"></i>
                <span className="collection-detail-action-label">Rename Collection</span>
              </button>
              <button className="secondary-button danger-button" type="button" onClick={() => onDelete?.()}>
                <i className="fa-solid fa-trash collection-detail-action-icon" aria-hidden="true"></i>
                <span className="collection-detail-action-label">Delete Collection</span>
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="content-section">
        <div className={albumGridClassName}>
          {loading ? (
            <p className="empty-state">Loading collection albums...</p>
          ) : albums.length ? (
            <AlbumGrid albums={albums} compact onOpen={onOpenAlbum} onPlay={onPlayAlbum} />
          ) : (
            <p className="empty-state">No albums found in this collection.</p>
          )}
        </div>
      </section>
    </>
  );
}
