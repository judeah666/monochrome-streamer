import React from 'react';

export function LibraryIntro({
  title = 'Browse Library',
  caption = '',
}) {
  return (
    <div className="section-heading">
      <div>
        <h3>{title}</h3>
        {caption ? <p>{caption}</p> : null}
      </div>
    </div>
  );
}

export function FavoritesIntro({
  title,
  caption,
}) {
  return (
    <div className="section-heading">
      <div>
        <h3>{title}</h3>
        <p>{caption}</p>
      </div>
    </div>
  );
}

export function WishlistIntro({
  title = 'Wishlist Albums',
  caption = 'Albums marked as Wishlist in your local album tags.',
  onAddAlbum,
}) {
  return (
    <div className="section-heading">
      <div>
        <h3>{title}</h3>
        <p>{caption}</p>
      </div>
      <button className="primary-button" type="button" onClick={() => onAddAlbum?.()}>
        <i className="fa-solid fa-plus" aria-hidden="true"></i>
        <span>Add album</span>
      </button>
    </div>
  );
}

export function SettingsIntro({
  title = 'Settings',
  caption = 'Local-first controls adapted from Monochrome for your self-hosted library.',
}) {
  return (
    <div className="section-heading">
      <div>
        <h3>{title}</h3>
        <p>{caption}</p>
      </div>
    </div>
  );
}

export function AdminIntro({
  eyebrow = 'Server Controls',
  title = 'Admin Panel',
  caption = 'Admin-only controls for users, downloads, widget API, and library scanning.',
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p>{caption}</p>
      </div>
    </div>
  );
}

export function SettingsStatus({ message = '' }) {
  if (!message) return null;
  return (
    <p className="settings-status" aria-live="polite">
      {message}
    </p>
  );
}
