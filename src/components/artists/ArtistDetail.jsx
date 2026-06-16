import React from 'react';
import { AlbumGrid } from '../albums/AlbumGrid.jsx';
import { ArtistPlaceholder, FontAwesomeIcon } from '../common/VisualBits.jsx';

const artistHeroClassName = [
  'artist-hero tw-relative tw-grid tw-grid-cols-[220px_minmax(0,1fr)] tw-items-center tw-gap-7',
  'tw-overflow-hidden tw-rounded-[30px] tw-border tw-border-line tw-bg-surface tw-p-[34px]',
  'tw-shadow-panel tw-backdrop-blur-[22px] max-[860px]:tw-grid-cols-1 max-[860px]:tw-p-6',
].join(' ');
const artistImageClassName = 'artist-hero-image tw-grid tw-aspect-square tw-w-full tw-max-w-[220px] tw-place-items-center tw-overflow-hidden tw-rounded-pill tw-border tw-border-line';
const artistImgClassName = 'tw-h-full tw-w-full tw-object-cover';
const artistFallbackClassName = 'artist-image-fallback tw-h-full tw-w-full';
const artistCopyClassName = 'artist-hero-copy tw-min-w-0';
const artistTitleClassName = 'tw-m-0 tw-text-[clamp(2.4rem,4vw,4rem)] tw-leading-[0.94] tw-tracking-[-0.05em]';
const artistMetaClassName = 'artist-detail-meta tw-m-0 tw-mt-2.5 tw-text-[1.02rem] tw-text-muted';
const artistBioClassName = 'artist-detail-bio tw-m-0 tw-mt-3 tw-max-w-[72ch] tw-text-text';
const artistActionsClassName = 'artist-actions tw-mt-5 tw-flex tw-flex-wrap tw-items-center tw-gap-3';
const artistAlbumsSectionClassName = 'content-section';
const artistAlbumGridClassName = 'library-album-grid tw-grid tw-grid-cols-[repeat(auto-fill,minmax(var(--album-card-size),1fr))] tw-gap-3.5';

export function ArtistDetail({
  name = 'Artist',
  eyebrow = 'Artist',
  meta = '',
  bio = '',
  imageUrl = '',
  sourceUrl = '',
  sourceLabel = 'Local source',
  editLabel = 'Edit artist image/info',
  albums = [],
  loading = false,
  showEdit = true,
  onEdit,
  onOpenAlbum,
  onPlayAlbum,
}) {
  return (
    <>
      <section
        id="artist-hero"
        className={artistHeroClassName}
        style={imageUrl ? { '--artist-image': `url("${imageUrl}")` } : undefined}
      >
        <div className={artistImageClassName}>
          {imageUrl ? (
            <img id="artist-detail-image" className={artistImgClassName} src={imageUrl} alt={`${name} artist image`} />
          ) : (
            <ArtistPlaceholder name={name} className={artistFallbackClassName} />
          )}
        </div>

        <div className={artistCopyClassName}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="artist-detail-name" className={artistTitleClassName}>{name}</h2>
          <p id="artist-detail-meta" className={artistMetaClassName}>{meta}</p>
          <p id="artist-detail-bio" className={artistBioClassName}>{bio}</p>
          <div className={artistActionsClassName}>
            {sourceUrl ? (
              <a id="artist-detail-source" className="artist-source-link" href={sourceUrl} target="_blank" rel="noreferrer">
                {sourceLabel}
              </a>
            ) : null}
            {showEdit ? (
              <button
                id="edit-artist-button"
                className="icon-button artist-edit-button"
                type="button"
                title={editLabel}
                aria-label={editLabel}
                disabled={loading}
                onClick={() => onEdit?.()}
              >
                <FontAwesomeIcon name="edit" />
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className={artistAlbumsSectionClassName}>
        <div id="artist-album-grid" className={artistAlbumGridClassName}>
          {loading ? (
            <p className="empty-state">Loading artist albums...</p>
          ) : albums.length ? (
            <AlbumGrid albums={albums} compact onOpen={onOpenAlbum} onPlay={onPlayAlbum} />
          ) : (
            <p className="empty-state">No albums found for this artist.</p>
          )}
        </div>
      </section>
    </>
  );
}
