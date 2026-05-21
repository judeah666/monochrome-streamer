import React from 'react';

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
  const className = compact ? 'album-card compact' : 'album-card';
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
      <div className="album-card-media">
        {album.coverUrl ? (
          <img src={album.coverUrl} alt={`${album.title} cover art`} loading="lazy" />
        ) : (
          <span className="album-card-placeholder-host" dangerouslySetInnerHTML={{ __html: album.coverPlaceholderHtml }} />
        )}
        <span dangerouslySetInnerHTML={{ __html: album.audioBadgeHtml }} />
        <button
          type="button"
          className="album-card-play"
          aria-label={`Play ${album.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onPlay?.();
          }}
          dangerouslySetInnerHTML={{ __html: album.playIconHtml }}
        />
      </div>

      <div className="meta">
        <h4>{album.title}</h4>
        <p>{album.artist}</p>
        <p className="album-card-year">{year}</p>
        <div className={`album-card-footer${album.wanted ? ' is-wanted' : ''}`}>
          <p
            className="album-card-format"
            title={album.status || 'Collection'}
            dangerouslySetInnerHTML={{ __html: album.mediaIconsHtml }}
          />
        </div>
      </div>
    </article>
  );
}
