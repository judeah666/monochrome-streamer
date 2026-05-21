import React from 'react';

export function ArtistGrid({ artists = [], onOpen }) {
  return (
    <>
      {artists.map((artist) => (
        <article
          key={artist.name}
          className="artist-card"
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
          <div className="artist-card-image">
            {artist.imageUrl ? (
              <img src={artist.imageUrl} alt={`${artist.name} artist image`} loading="lazy" />
            ) : (
              <span className="artist-placeholder-host" dangerouslySetInnerHTML={{ __html: artist.placeholderHtml }} />
            )}
          </div>
          <strong>{artist.name}</strong>
        </article>
      ))}
    </>
  );
}
