import React from 'react';
import { RecentAlbumsCarousel } from './RecentAlbumsCarousel.jsx';

export function HomeIntro({ showBanner = true, albums = [], onOpen, onPlay, albumHeading = '', albumCaption = '' }) {
  return <>
    {showBanner ? <RecentAlbumsCarousel albums={albums} onOpen={onOpen} onPlay={onPlay} /> : null}
    {albumHeading ? <div className="section-heading"><div><h3>{albumHeading}</h3><p>{albumCaption}</p></div></div> : null}
  </>;
}
