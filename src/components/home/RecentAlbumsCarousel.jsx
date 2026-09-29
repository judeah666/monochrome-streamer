import React, { useEffect, useRef, useState } from 'react';
import { AudioQualityBadge, CoverImage, MediaTypeIcons } from '../common/VisualBits.jsx';

export function RecentAlbumsCarousel({ albums = [], onOpen, onPlay }) {
  const [selectedId, setSelectedId] = useState(null);
  const touchStart = useRef(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const albumIds = JSON.stringify(albums.map(album => album.id));
  useEffect(() => {
    const ids = JSON.parse(albumIds);
    if (ids.length < 2 || paused || hovered) return undefined;
    let timer;
    const schedule = () => {
      window.clearTimeout(timer);
      if (document.hidden) return;
      timer = window.setTimeout(() => {
        const current = Math.max(0, ids.indexOf(selectedId));
        setSelectedId(ids[(current + 1) % ids.length]);
      }, 5000);
    };
    schedule();
    document.addEventListener('visibilitychange', schedule);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [albumIds, selectedId, paused, hovered]);
  if (!albums.length) return null;
  const index = Math.max(0, albums.findIndex(album => album.id === selectedId));
  const album = albums[index];
  const move = delta => setSelectedId(albums[(index + delta + albums.length) % albums.length].id);
  const cover = (item, className) => (
    <CoverImage key={item.id} src={item.coverUrl} alt={`${item.title} cover art`} className={className}
      width={400} height={400} loading="eager" decoding="async"
      placeholderClassName="album-art-placeholder recent-cover-fallback" placeholderWrapperClassName="recent-cover-placeholder" />
  );
  const metadata = item => (
    <span className="album-card-meta">
      <span className="album-card-title">{item.title}</span>
      <span className="album-card-text">{item.artist}</span>
      <span className="album-card-year-text">{item.year || 'Unknown year'}</span>
      <span className={'album-card-footer-row' + (item.wishlist ? ' is-wishlist' : '')}>
        <span className="album-card-format-row" title={item.status || 'Collection'}><MediaTypeIcons mediaTypes={item.mediaTypes} /></span>
      </span>
    </span>
  );
  const nextCount = Math.min(4, albums.length - 1);
  const previews = offsets => offsets.map(offset => {
    const item = albums[(index + offset + albums.length) % albums.length];
    return (
      <button key={item.id} className={`album-card album-card-shell recent-story-peek${offset > 2 ? ' is-distant' : ''}`}
        type="button" onClick={() => setSelectedId(item.id)} aria-label={`Show ${item.title} by ${item.artist}`} title={`${item.title} — ${item.artist}`}>
        <span className="album-card-media tw-relative tw-block">
          {cover(item, 'recent-story-cover')}
          <AudioQualityBadge quality={item.audioQuality} />
        </span>
        {metadata(item)}
      </button>
    );
  });
  return (
    <section className="recent-stories" aria-label="Recently Added albums" aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}>
      <header className="recent-stories-header">
        <h2>Recently Added</h2>
        <span>{index + 1} / {albums.length}</span>
      </header>
      <div className="recent-stories-stage" onTouchStart={event => {
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }} onTouchEnd={event => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.x;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(touch.clientY - start.y)) {
          event.preventDefault();
          move(dx < 0 ? 1 : -1);
        }
      }} onTouchCancel={() => { touchStart.current = null; }}>
        <article className="album-card album-card-shell recent-story-feature" aria-roledescription="slide" aria-label={`${index + 1} of ${albums.length}`}>
          <button type="button" className="album-card-media tw-relative recent-story-artwork" onClick={() => onOpen?.(album.id)} aria-label={`Open ${album.title} by ${album.artist}`}>
            {cover(album, 'recent-story-cover')}
            <AudioQualityBadge quality={album.audioQuality} />
          </button>
          <div className="album-card-meta recent-story-copy" aria-live={paused || hovered ? 'polite' : 'off'} aria-atomic="true">
            <h3 className="album-card-title">{album.title}</h3>
            <p className="album-card-text">{album.artist}</p>
            <p className="album-card-year-text">{album.year || 'Unknown year'}</p>
            <span className={'album-card-footer-row' + (album.wishlist ? ' is-wishlist' : '')}>
              <span className="album-card-format-row" title={album.status || 'Collection'}><MediaTypeIcons mediaTypes={album.mediaTypes} /></span>
            </span>
            <div className="recent-story-actions">
              <button className="primary-button" type="button" onClick={() => onPlay?.(album.id)} aria-label={`Play ${album.title}`}><i className="fa-solid fa-play" aria-hidden="true" /> Play album</button>
            </div>
          </div>
        </article>
        <div className="recent-story-neighbors is-next">
          {previews(Array.from({ length: nextCount }, (_, i) => i + 1))}
        </div>
      </div>
      <footer className="recent-stories-footer">
        <button type="button" disabled={albums.length < 2} onClick={() => setPaused(value => !value)} aria-label={paused ? 'Resume automatic slideshow' : 'Pause automatic slideshow'} title={paused ? 'Resume automatic slideshow' : 'Pause automatic slideshow'}><i className={paused ? 'fa-solid fa-play' : 'fa-solid fa-pause'} aria-hidden="true" /></button>
        <div className="recent-story-position" aria-hidden="true"><span style={{ width: `${100 / albums.length}%`, left: `${100 * index / albums.length}%` }} /></div>
        <button type="button" onClick={() => move(-1)} disabled={albums.length < 2} aria-label="Previous recently added album"><i className="fa-solid fa-chevron-left" aria-hidden="true" /></button>
        <button type="button" onClick={() => move(1)} disabled={albums.length < 2} aria-label="Next recently added album"><i className="fa-solid fa-chevron-right" aria-hidden="true" /></button>
      </footer>
    </section>
  );
}
