import React from 'react';
import { AlbumGrid } from './AlbumGrid.jsx';
import { TrackList } from './TrackList.jsx';

export function AlbumDetail({
  album,
  tracks = [],
  relatedAlbums = [],
  epAlbums = [],
  favorite = false,
  canQueue = false,
  formatHtml = '',
  coverPlaceholderHtml = '',
  favoriteIconHtml = '',
  editIconHtml = '',
  onPlayAlbum,
  onQueueAlbum,
  onShuffleAlbum,
  onEditAlbum,
  onFavoriteAlbum,
  onPlayTrack,
  onFavoriteTrack,
  onAddTrackQueue,
  onArtistClick,
  onAlbumClick,
  onOpenAlbum,
  onPlayRelatedAlbum,
}) {
  if (!album) return null;

  return (
    <>
      <section className="album-hero" style={album.coverBackdrop ? { '--album-cover': `url("${album.coverBackdrop}")` } : undefined}>
        <div className="album-hero-scrim"></div>
        <div className="album-hero-content">
          <div className="album-cover-frame">
            {album.coverUrl ? (
              <img src={album.coverUrl} alt={`${album.title} cover art`} />
            ) : (
              <div className="cover-fallback" dangerouslySetInnerHTML={{ __html: coverPlaceholderHtml }} />
            )}
          </div>

          <div className="album-hero-copy">
            <p className="album-detail-format" dangerouslySetInnerHTML={{ __html: formatHtml }} />
            <h2>{album.title}</h2>
            <p className="album-detail-meta">{album.meta}</p>
            <p className="album-detail-artist">By {album.artist}</p>
            {album.folder ? <p className="album-detail-folder">Folder: {album.folder}</p> : null}
            <div className="album-actions">
              <button className="primary-button" type="button" disabled={!canQueue} onClick={() => onPlayAlbum?.(album.id)}>Play album</button>
              <button className="secondary-button" type="button" disabled={!canQueue} onClick={() => onQueueAlbum?.(album.id)}>Add to queue</button>
              <button className="secondary-button" type="button" disabled={!canQueue} onClick={() => onShuffleAlbum?.(album.id)}>Shuffle</button>
              <button
                className="icon-button album-edit-button"
                type="button"
                aria-label="Edit album tags"
                title="Edit album tags"
                onClick={() => onEditAlbum?.(album.id)}
                dangerouslySetInnerHTML={{ __html: editIconHtml }}
              />
              <button
                className={`icon-button album-favorite-button${favorite ? ' active' : ''}`}
                type="button"
                aria-label={favorite ? 'Unfavorite album' : 'Favorite album'}
                aria-pressed={favorite}
                title={favorite ? 'Unfavorite album' : 'Favorite album'}
                onClick={() => onFavoriteAlbum?.(album.id)}
                dangerouslySetInnerHTML={{ __html: favoriteIconHtml }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="album-content-layout">
        <section className="album-main">
          <div className="track-table-header">
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span>Action</span>
          </div>
          <div className="track-table">
            {tracks.length === 0 ? (
              <p className="empty-state">No tracks matched this album search.</p>
            ) : (
              <TrackList
                tracks={tracks}
                variant="album"
                onPlay={onPlayTrack}
                onFavorite={onFavoriteTrack}
                onAddQueue={onAddTrackQueue}
                onArtistClick={onArtistClick}
                onAlbumClick={onAlbumClick}
              />
            )}
          </div>
        </section>

        <aside className="album-sidebar">
          <RelatedAlbums
            title={`More albums from ${album.artist}`}
            albums={relatedAlbums}
            onOpen={onOpenAlbum}
            onPlay={onPlayRelatedAlbum}
          />
          <RelatedAlbums
            title={`EPs and Singles from ${album.artist}`}
            albums={epAlbums}
            onOpen={onOpenAlbum}
            onPlay={onPlayRelatedAlbum}
          />
        </aside>
      </div>
    </>
  );
}

function RelatedAlbums({ title, albums = [], onOpen, onPlay }) {
  if (albums.length === 0) return null;

  return (
    <section className="content-section">
      <h3>{title}</h3>
      <div className="side-card-grid">
        <AlbumGrid albums={albums} compact onOpen={onOpen} onPlay={onPlay} />
      </div>
    </section>
  );
}
