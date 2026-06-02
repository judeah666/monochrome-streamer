import React from 'react';

const ICONS = {
  addQueue: 'fa-plus',
  back: 'fa-arrow-left',
  clearQueue: 'fa-broom',
  close: 'fa-xmark',
  edit: 'fa-pen-to-square',
  favorite: 'fa-heart',
  pause: 'fa-pause',
  play: 'fa-play',
  repeat: 'fa-repeat',
  shuffle: 'fa-shuffle',
  skipBack: 'fa-backward-step',
  skipForward: 'fa-forward-step',
};

const MEDIA_TYPE_ICONS = {
  CD: '/media-type-icons/compact-disc.svg',
  'Digital Media': '/media-type-icons/file-waveform.svg',
  Vinyl: '/media-type-icons/record-vinyl.svg',
  'Cassette Tape': '/media-type-icons/cassette-tape.svg',
};

const PLAYER_ICONS = {
  clearQueue: '/player-icons/trash.svg',
  download: '/player-icons/download.svg',
};

const AUDIO_QUALITY_ICONS = {
  hires: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjzgkp7vuwaecsDEPlp7MlW-oqGVNzD26tWA&s',
  mp3: '/audio-quality-icons/file-mp3.svg',
};

export function FontAwesomeIcon({ name, className = '' }) {
  const iconClass = ICONS[name] || name || ICONS.play;
  return <i className={`fa-solid ${iconClass}${className ? ` ${className}` : ''}`} aria-hidden="true"></i>;
}

export function PlayerIcon({ name, className = '' }) {
  const iconUrl = PLAYER_ICONS[name];
  if (!iconUrl) return <FontAwesomeIcon name={name} className={className} />;

  return (
    <i
      className={`player-symbol${className ? ` ${className}` : ''}`}
      style={{ '--player-icon': `url('${iconUrl}')` }}
      aria-hidden="true"
    ></i>
  );
}

export function CoverPlaceholder({ className = 'album-art-placeholder' }) {
  return (
    <div className={`${className} cover-placeholder-art`}>
      <i className="fa-solid fa-record-vinyl" aria-hidden="true"></i>
    </div>
  );
}

export function ArtistPlaceholder({ name = 'Artist', initials = '', className = 'artist-image-fallback' }) {
  return (
    <div className={className}>
      <i className="fa-solid fa-user" aria-hidden="true"></i>
      <span>{initials || getArtistInitials(name)}</span>
    </div>
  );
}

export function MediaTypeIcons({ mediaTypes = [], includeLabels = false }) {
  const normalized = getMediaTypes(mediaTypes);
  return (
    <>
      {normalized.map((mediaType) => (
        <span key={mediaType} className="media-type-icon" title={mediaType}>
          <i
            className="media-type-symbol"
            style={{ '--media-type-icon': `url('${MEDIA_TYPE_ICONS[mediaType] || MEDIA_TYPE_ICONS['Digital Media']}')` }}
            aria-hidden="true"
          ></i>
          {includeLabels ? <span>{mediaType}</span> : null}
        </span>
      ))}
    </>
  );
}

export function AudioQualityBadge({ quality, includeLabel = false }) {
  if (!quality || quality.iconType !== 'hires') return null;

  const label = quality.label || quality.labelTop || 'Hi-Res Audio';
  return (
    <span className="audio-quality-badge" title={label}>
      <img src={AUDIO_QUALITY_ICONS.hires} alt="Hi-Res Audio" loading="lazy" />
      {includeLabel ? <span>{quality.labelTop || label}</span> : null}
    </span>
  );
}

function getMediaTypes(mediaTypes) {
  const values = Array.isArray(mediaTypes) ? mediaTypes : [mediaTypes];
  const normalized = values.map(normalizeMediaTypeName).filter(Boolean);
  return normalized.length > 0 ? normalized : [];
}

function normalizeMediaTypeName(mediaType) {
  const normalized = String(mediaType || '').trim();
  if (!normalized) return '';
  if (/^cassette[-\s]?tape$/iu.test(normalized)) return 'Cassette Tape';
  return normalized;
}

function getArtistInitials(name) {
  const words = String(name || 'Artist').split(/\s+/u).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() || '').join('') || 'AR';
}
