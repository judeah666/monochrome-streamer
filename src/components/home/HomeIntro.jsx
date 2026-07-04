import React from 'react';

export function HomeIntro({
  showBanner = true,
  eyebrow = 'Local Audio',
  title = 'Your server, your collection, your rules.',
  subtitle = 'Browse your albums, open them like a proper detail page, and control playback from a full bottom player.',
  albumHeading = '',
  albumCaption = '',
}) {
  return (
    <>
      {showBanner ? (
        <section className="home-hero">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="lede">{subtitle}</p>
        </section>
      ) : null}

      {albumHeading ? (
        <div className="section-heading">
          <div>
            <h3>{albumHeading}</h3>
            <p>{albumCaption}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
