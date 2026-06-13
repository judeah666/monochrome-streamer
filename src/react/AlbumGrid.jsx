import React from 'react';
import { AudioQualityBadge, CoverImage, FontAwesomeIcon, MediaTypeIcons } from './VisualBits.jsx';

const albumCardBaseClassName = [
  'album-card album-card-shell tw-group',
].join(' ');
const albumCardCompactClassName = `${albumCardBaseClassName} compact`;
const albumCardMediaClassName = 'album-card-media tw-relative';
const albumCardImageClassName = 'tw-block tw-aspect-square tw-w-full tw-object-cover';
const albumCardPlaceholderClassName = 'album-card-placeholder-host tw-block tw-w-full';
const albumCardPlayClassName = 'album-card-play album-card-play-button';
const albumMetaClassName = 'meta album-card-meta';
const albumTitleClassName = 'album-card-title';
const albumTextClassName = 'album-card-text';
const albumYearClassName = 'album-card-year album-card-year-text';
const albumFooterBaseClassName = 'album-card-footer album-card-footer-row';
const albumFormatClassName = 'album-card-format album-card-format-row';

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
        <CoverImage
          className={albumCardImageClassName}
          src={album.coverUrl}
          alt={`${album.title} cover art`}
          loading="lazy"
          decoding="async"
          placeholderClassName="album-art-placeholder album-card-cover-placeholder"
          placeholderWrapperClassName={albumCardPlaceholderClassName}
        />
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
        <div className={`${albumFooterBaseClassName}${album.wishlist ? ' is-wishlist' : ''}`}>
          <p className={albumFormatClassName} title={album.status || 'Collection'}>
            <MediaTypeIcons mediaTypes={album.mediaTypes} />
          </p>
        </div>
      </div>
    </article>
  );
}
