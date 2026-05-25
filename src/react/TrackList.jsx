import React from 'react';

export function TrackList({
  tracks = [],
  variant = 'standard',
  showAlbum = true,
  onPlay,
  onFavorite,
  onAddQueue,
  onArtistClick,
  onAlbumClick,
}) {
  if (variant === 'album') {
    return (
      <>
        {groupTracksByDisc(tracks).map(([discNumber, discTracks]) => (
          <React.Fragment key={discNumber}>
            <div className="album-disc-header">
              <span>Disc {discNumber}</span>
              <small>{discTracks.length} track{discTracks.length === 1 ? '' : 's'}</small>
            </div>
            {discTracks.map((track) => (
              <AlbumTrackRow
                key={track.id}
                track={track}
                onPlay={(options) => onPlay?.(track.id, options)}
                onFavorite={() => onFavorite?.(track.id)}
                onAddQueue={() => onAddQueue?.(track.id)}
                onArtistClick={() => onArtistClick?.(track.artist)}
                onAlbumClick={() => onAlbumClick?.(track.id)}
              />
            ))}
          </React.Fragment>
        ))}
      </>
    );
  }

  return (
    <>
      {tracks.map((track) => {
        return (
          <TrackRow
            key={track.id}
            track={track}
            showAlbum={showAlbum}
            onPlay={(options) => onPlay?.(track.id, options)}
            onFavorite={() => onFavorite?.(track.id)}
            onAddQueue={() => onAddQueue?.(track.id)}
            onArtistClick={() => onArtistClick?.(track.artist)}
            onAlbumClick={() => onAlbumClick?.(track.id)}
          />
        );
      })}
    </>
  );
}

function TrackRow({ track, showAlbum, onPlay, onFavorite, onAddQueue, onArtistClick, onAlbumClick }) {
  return (
    <article className={`track-row${track.active ? ' is-active' : ''}`} onClick={() => onPlay?.({ toggle: false })}>
      {track.coverUrl ? (
        <img src={track.coverUrl} alt={`${track.album} cover art`} loading="lazy" />
      ) : (
        <span className="track-placeholder-host" dangerouslySetInnerHTML={{ __html: track.coverPlaceholderHtml }} />
      )}
      <div className="track-copy">
        <h4>{track.title}</h4>
        <p>
          <ArtistInlineButton artist={track.artist} onArtistClick={onArtistClick} />
          {showAlbum ? (
            <>
              <span aria-hidden="true"> · </span>
              <AlbumInlineButton album={track.album} onAlbumClick={onAlbumClick} />
            </>
          ) : null}
        </p>
        {track.folderPath ? <p className="track-folder-path">{track.folderPath}</p> : null}
      </div>
      <TrackActions track={track} onFavorite={onFavorite} onAddQueue={onAddQueue} onPlay={onPlay} />
    </article>
  );
}

function AlbumTrackRow({ track, onPlay, onFavorite, onAddQueue, onArtistClick, onAlbumClick }) {
  return (
    <article className={`album-track-row${track.active ? ' is-active' : ''}`} onClick={() => onPlay?.({ toggle: false })}>
      <span className="track-index">{track.trackNumber ?? '•'}</span>
      <div className="track-title-group">
        <strong>{track.title}</strong>
        <ArtistInlineButton artist={track.artist} onArtistClick={onArtistClick} />
      </div>
      <AlbumInlineButton className="track-album-name" album={track.album} onAlbumClick={onAlbumClick} />
      <TrackActions track={track} onFavorite={onFavorite} onAddQueue={onAddQueue} onPlay={onPlay} />
    </article>
  );
}

function ArtistInlineButton({ artist, onArtistClick }) {
  if (!artist) return <span>Unknown artist</span>;

  return (
    <button
      type="button"
      className="artist-inline-link"
      onClick={(event) => {
        event.stopPropagation();
        onArtistClick?.();
      }}
    >
      {artist}
    </button>
  );
}

function AlbumInlineButton({ album, className = '', onAlbumClick }) {
  if (!album) return <span className={className}>Unknown album</span>;

  return (
    <button
      type="button"
      className={`album-inline-link${className ? ` ${className}` : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        onAlbumClick?.();
      }}
    >
      {album}
    </button>
  );
}

function TrackActions({ track, onFavorite, onAddQueue, onPlay }) {
  return (
    <div className="row-actions">
      <button
        type="button"
        className={`favorite-toggle-button${track.favorite ? ' active' : ''}`}
        aria-label={`${track.favorite ? 'Unfavorite' : 'Favorite'} ${track.title}`}
        onClick={(event) => {
          event.stopPropagation();
          onFavorite?.();
        }}
        dangerouslySetInnerHTML={{ __html: track.favoriteIconHtml }}
      />
      <button
        type="button"
        className="queue-track-button"
        aria-label={`Add ${track.title} to queue`}
        onClick={(event) => {
          event.stopPropagation();
          onAddQueue?.();
        }}
        dangerouslySetInnerHTML={{ __html: track.addQueueIconHtml }}
      />
      <button
        type="button"
        className="row-play-button"
        aria-label={`${track.playing ? 'Pause' : 'Play'} ${track.title}`}
        onClick={(event) => {
          event.stopPropagation();
          onPlay?.({ toggle: true });
        }}
        dangerouslySetInnerHTML={{ __html: track.playIconHtml }}
      />
    </div>
  );
}

function groupTracksByDisc(tracks) {
  const groups = new Map();
  for (const track of tracks) {
    const discNumber = track.discNumber || 1;
    if (!groups.has(discNumber)) {
      groups.set(discNumber, []);
    }
    groups.get(discNumber).push(track);
  }
  return [...groups.entries()].sort(([leftDisc], [rightDisc]) => Number(leftDisc) - Number(rightDisc));
}
