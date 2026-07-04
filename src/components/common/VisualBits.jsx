import React, { useEffect, useState } from 'react';
import { AUDIO_QUALITY_ICONS } from '../../assets/icons/audio-quality/index.js';
import { PLAYBACK_MODE_ICONS } from '../../assets/icons/player/index.js';

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
  remove: 'fa-trash-can',
  shuffle: 'fa-shuffle',
  skipBack: 'fa-backward-step',
  skipForward: 'fa-forward-step',
};

const MEDIA_TYPE_ICONS = {
  CD: '/assets/icons/media-type/compact-disc.svg',
  'Digital Media': '/assets/icons/media-type/file-waveform.svg',
  Vinyl: '/assets/icons/media-type/record-vinyl.svg',
  'Cassette Tape': '/assets/icons/media-type/cassette-tape.svg',
};

const PLAYER_ICONS = {
  clearQueue: '/assets/icons/player/trash.svg',
  download: '/assets/icons/player/download.svg',
  queue: '/assets/icons/player/list-ul.svg',
  remove: '/assets/icons/player/trash.svg',
  volumeHigh: '/assets/icons/player/volume-high.svg',
  volumeLow: '/assets/icons/player/volume-low.svg',
  volumeMedium: '/assets/icons/player/volume-medium.svg',
  volumeMuted: '/assets/icons/player/volume-xmark.svg',
  ...PLAYBACK_MODE_ICONS,
};

export function FontAwesomeIcon({ name, className = '' }) {
  const iconClass = ICONS[name] || name || ICONS.play;
  return <i className={`fa-solid ${iconClass}${className ? ` ${className}` : ''}`} aria-hidden="true"></i>;
}

export function PlayerIcon({ name, src = '', className = '' }) {
  const iconUrl = src || PLAYER_ICONS[name];
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

export function CoverImage({
  src = '',
  alt = '',
  className = '',
  placeholderClassName = 'album-art-placeholder',
  placeholderWrapperClassName = '',
  placeholderProps = {},
  onError,
  ...imageProps
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    const placeholder = <CoverPlaceholder className={placeholderClassName || className} />;
    if (placeholderWrapperClassName) {
      return (
        <span className={placeholderWrapperClassName} {...placeholderProps}>
          {placeholder}
        </span>
      );
    }
    return React.cloneElement(placeholder, placeholderProps);
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      {...imageProps}
    />
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
