import React from 'react';
import { AlbumGrid } from '../albums/AlbumGrid.jsx';

export function HomeAlbumSections({
  recentlyAddedAlbums = [],
  recommendedAlbums = [],
  showRecentlyAdded = true,
  emptyMessage = 'No albums matched this search.',
  onOpen,
  onPlay,
}) {
  const hasRecentlyAdded = showRecentlyAdded && recentlyAddedAlbums.length > 0;
  const hasRecommended = recommendedAlbums.length > 0;

  if (!hasRecentlyAdded && !hasRecommended) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="home-album-sections">
      {hasRecentlyAdded ? (
        <HomeAlbumSection title="Recently Added" variant="rail">
          <div className="home-album-rail" aria-label="Recently Added albums">
            <AlbumGrid albums={recentlyAddedAlbums} onOpen={onOpen} onPlay={onPlay} />
          </div>
        </HomeAlbumSection>
      ) : null}

      {hasRecommended ? (
        <HomeAlbumSection title="Recommended Albums">
          <div className="home-recommended-grid album-grid">
            <AlbumGrid albums={recommendedAlbums} onOpen={onOpen} onPlay={onPlay} />
          </div>
        </HomeAlbumSection>
      ) : null}
    </div>
  );
}

function HomeAlbumSection({ title, variant = 'grid', children }) {
  return (
    <section className={`home-album-section home-album-section-${variant}`}>
      <div className="home-album-section-header">
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}
