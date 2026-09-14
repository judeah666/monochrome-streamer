import React from 'react';
import { ArtistPlaceholder } from '../common/VisualBits.jsx';

const artistCardClassName = 'artist-card album-card-shell';
const artistImageClassName = 'artist-card-image album-card-media';
const artistImgClassName = 'tw-block tw-h-full tw-w-full tw-object-cover';
const artistPlaceholderClassName = 'artist-placeholder-host tw-block tw-h-full tw-w-full';
const artistNameClassName = 'album-card-title artist-card-name';

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
              <img className={artistImgClassName} src={artist.imageUrl} alt={`${artist.name} artist image`} loading="lazy" decoding="async" />
            ) : (
              <span className={artistPlaceholderClassName}>
                <ArtistPlaceholder name={artist.name} />
              </span>
            )}
          </div>
          <div className="meta album-card-meta">
            <h4 className={artistNameClassName} title={artist.name}>{artist.name}</h4>
          </div>
        </article>
      ))}
    </>
  );
}
