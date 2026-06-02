import React from 'react';
import { AlbumGrid } from './AlbumGrid.jsx';
import { CoverPlaceholder } from './VisualBits.jsx';

const heroClassName = [
  'collection-detail-hero tw-relative tw-grid tw-grid-cols-[220px_minmax(0,1fr)] tw-items-center tw-gap-7',
  'tw-overflow-hidden tw-rounded-[30px] tw-border tw-border-line tw-bg-surface tw-p-[34px]',
  'tw-shadow-panel tw-backdrop-blur-[22px] max-[860px]:tw-grid-cols-1 max-[860px]:tw-p-6',
].join(' ');
const coverFrameClassName = 'collection-detail-cover tw-aspect-square tw-w-full tw-max-w-[220px] tw-overflow-hidden tw-rounded-[24px] tw-border tw-border-line tw-bg-surface2';
const coverImageClassName = 'tw-h-full tw-w-full tw-object-cover';
const copyClassName = 'tw-min-w-0';
const titleClassName = 'tw-m-0 tw-text-[clamp(2.4rem,4vw,4rem)] tw-leading-[0.94] tw-tracking-[-0.05em]';
const albumGridClassName = 'library-album-grid tw-grid tw-grid-cols-[repeat(auto-fill,minmax(var(--album-card-size),1fr))] tw-gap-3.5';

export function CollectionDetail({
  name = 'Collection',
  meta = '',
  bio = '',
  coverUrl = '',
  albums = [],
  albumsTitle = 'Albums',
  albumsCaption = 'Albums assigned to this collection.',
  loading = false,
  onOpenAlbum,
  onPlayAlbum,
}) {
  return (
    <>
      <section className={heroClassName}>
        <div className={coverFrameClassName}>
          {coverUrl ? (
            <img className={coverImageClassName} src={coverUrl} alt={`${name} collection cover`} />
          ) : (
            <CoverPlaceholder />
          )}
        </div>
        <div className={copyClassName}>
          <p className="eyebrow">Collection</p>
          <h2 className={titleClassName}>{name}</h2>
          <p className="artist-detail-meta">{meta}</p>
          <p className="artist-detail-bio">{bio}</p>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <h3>{albumsTitle}</h3>
            <p>{albumsCaption}</p>
          </div>
        </div>
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
