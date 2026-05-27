import React from 'react';
import { AudioQualityBadge, CoverPlaceholder, FontAwesomeIcon, MediaTypeIcons } from './VisualBits.jsx';

const albumCardBaseClassName = [
  'album-card tw-group tw-grid tw-grid-rows-[auto_1fr] tw-overflow-hidden tw-rounded-[var(--radius)]',
  'tw-border tw-border-line tw-bg-surface tw-p-0 tw-text-left tw-shadow-panel tw-backdrop-blur-[18px]',
  'tw-cursor-pointer tw-transition tw-duration-200 hover:-tw-translate-y-0.5 hover:tw-border-[var(--line-strong)] hover:tw-bg-surface2',
].join(' ');
const albumCardCompactClassName = `${albumCardBaseClassName} compact tw-rounded-[20px]`;
const albumCardMediaClassName = 'album-card-media tw-relative';
const albumCardImageClassName = 'tw-block tw-aspect-square tw-w-full tw-object-cover';
const albumCardPlaceholderClassName = 'album-card-placeholder-host tw-block tw-w-full';
const albumCardPlayClassName = [
  'album-card-play tw-absolute tw-left-1/2 tw-top-1/2 tw-inline-flex tw-h-14 tw-w-14',
  'tw-items-center tw-justify-center',
  'tw-rounded-pill tw-border tw-border-[color-mix(in_srgb,var(--accent)_72%,var(--text)_28%)]',
  'tw-bg-[color-mix(in_srgb,var(--accent)_92%,transparent)] tw-text-[var(--accent-contrast)] tw-opacity-0',
  'tw-pointer-events-none tw-shadow-panel tw-transition tw-duration-200 group-hover:tw-opacity-100 group-hover:tw-pointer-events-auto',
  'group-focus-within:tw-opacity-100 group-focus-within:tw-pointer-events-auto',
].join(' ');
const albumMetaClassName = 'meta tw-grid tw-grid-rows-[auto_auto_auto_1fr] tw-p-3.5 tw-text-center';
const albumTitleClassName = 'tw-m-0 tw-mb-1 tw-font-display tw-leading-[1.12] tw-tracking-[-0.035em]';
const albumTextClassName = 'tw-m-0 tw-leading-[1.35] tw-text-muted';
const albumYearClassName = 'album-card-year tw-m-0 tw-mt-1 tw-text-[0.84rem] tw-leading-[1.35] tw-text-muted';
const albumFooterBaseClassName = [
  'album-card-footer tw-mt-3 tw-inline-flex tw-flex-wrap tw-items-center tw-justify-center',
  'tw-gap-2.5 tw-self-end tw-text-muted',
].join(' ');
const albumFormatClassName = 'album-card-format tw-m-0 tw-inline-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-2.5 tw-leading-none tw-text-inherit';

export function AlbumGrid({ albums = [], compact = false, onOpen, onPlay }) {
  return (
    <>
      {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          compact={compact}
          onOpen={() => onOpen?.(album.id)}
          onPlay={() => onPlay?.(album.id)}
        />
      ))}
    </>
  );
}

function AlbumCard({ album, compact, onOpen, onPlay }) {
  const className = compact ? albumCardCompactClassName : albumCardBaseClassName;
  const year = album.year || 'Unknown year';

  return (
    <article
      className={className}
      tabIndex={0}
      role="button"
      aria-label={`Open ${album.title} by ${album.artist}`}
      onClick={() => onOpen?.()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen?.();
        }
      }}
    >
      <div className={albumCardMediaClassName}>
        {album.coverUrl ? (
          <img className={albumCardImageClassName} src={album.coverUrl} alt={`${album.title} cover art`} loading="lazy" />
        ) : (
          <span className={albumCardPlaceholderClassName}>
            <CoverPlaceholder />
          </span>
        )}
        <AudioQualityBadge quality={album.audioQuality} />
        <button
          type="button"
          className={albumCardPlayClassName}
          aria-label={`Play ${album.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onPlay?.();
          }}
        >
          <FontAwesomeIcon name="play" />
        </button>
      </div>

      <div className={albumMetaClassName}>
        <h4 className={albumTitleClassName}>{album.title}</h4>
        <p className={albumTextClassName}>{album.artist}</p>
        <p className={albumYearClassName}>{year}</p>
        <div className={`${albumFooterBaseClassName}${album.wishlist ? ' is-wishlist tw-text-[var(--wishlist-text)]' : ''}`}>
          <p className={albumFormatClassName} title={album.status || 'Collection'}>
            <MediaTypeIcons mediaTypes={album.mediaTypes} />
          </p>
        </div>
      </div>
    </article>
  );
}
