import React from 'react';
import { ArtistPlaceholder } from './VisualBits.jsx';

const artistCardClassName = [
  'artist-card tw-grid tw-justify-items-center tw-gap-3 tw-rounded-[24px] tw-border tw-border-line',
  'tw-bg-surface tw-p-4 tw-text-center tw-shadow-panel tw-backdrop-blur-md tw-cursor-pointer',
  'tw-transition hover:-tw-translate-y-0.5 hover:tw-border-[var(--line-strong)] hover:tw-bg-surface2',
].join(' ');
const artistImageClassName = 'artist-card-image tw-grid tw-aspect-square tw-w-full tw-place-items-center tw-overflow-hidden tw-rounded-pill tw-border tw-border-line';
const artistImgClassName = 'tw-h-full tw-w-full tw-object-cover';
const artistPlaceholderClassName = 'artist-placeholder-host tw-block tw-h-full tw-w-full';
const artistNameClassName = 'tw-min-w-0 tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap tw-font-extrabold';

export function ArtistGrid({ artists = [], onOpen }) {
  return (
    <>
      {artists.map((artist) => (
        <article
          key={artist.name}
          className={artistCardClassName}
          tabIndex={0}
          role="button"
          aria-label={`Open ${artist.name}`}
          onClick={() => onOpen?.(artist.name)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onOpen?.(artist.name);
            }
          }}
        >
          <div className={artistImageClassName}>
            {artist.imageUrl ? (
              <img className={artistImgClassName} src={artist.imageUrl} alt={`${artist.name} artist image`} loading="lazy" />
            ) : (
              <span className={artistPlaceholderClassName}>
                <ArtistPlaceholder name={artist.name} />
              </span>
            )}
          </div>
          <strong className={artistNameClassName}>{artist.name}</strong>
        </article>
      ))}
    </>
  );
}
