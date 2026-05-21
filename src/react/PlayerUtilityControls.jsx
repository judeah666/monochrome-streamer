import React from 'react';

const PLAYER_ICONS = {
  download: '/player-icons/download.svg',
  queue: '/player-icons/list-ul.svg',
  volumeHigh: '/player-icons/volume-high.svg',
  volumeMedium: '/player-icons/volume-medium.svg',
  volumeLow: '/player-icons/volume-low.svg',
  volumeMuted: '/player-icons/volume-xmark.svg',
};

export function PlayerUtilityControls({
  hasTrack = false,
  currentTrackTitle = '',
  downloadUrl = '#',
  downloadName = '',
  favorite = false,
  queueOpen = false,
  volume = 1,
  showQuality = false,
  quality = null,
  onFavorite,
  onQueueToggle,
  onVolumeToggle,
}) {
  const volumeIcon = getVolumeIcon(volume);
  const favoriteLabel = favorite ? 'Unfavorite current track' : 'Favorite current track';

  return (
    <>
      <button
        id="favorite-track-button"
        className={`icon-button player-icon-control${favorite ? ' active' : ''}`}
        type="button"
        aria-label={favoriteLabel}
        aria-pressed={favorite}
        title={favoriteLabel}
        disabled={!hasTrack}
        onClick={() => {
          if (hasTrack) onFavorite?.();
        }}
      >
        <i className="fa-solid fa-heart" aria-hidden="true" />
      </button>

      <a
        id="download-track-link"
        className="icon-button icon-link player-icon-control"
        href={hasTrack ? downloadUrl : '#'}
        download={hasTrack ? downloadName : undefined}
        aria-label={hasTrack ? `Download ${currentTrackTitle}` : 'Download current track'}
        aria-disabled={hasTrack ? undefined : 'true'}
      >
        <PlayerSymbol icon={PLAYER_ICONS.download} />
      </a>

      <button
        id="queue-toggle-button"
        className={`icon-button player-icon-control${queueOpen ? ' active' : ''}`}
        type="button"
        aria-label="Open queue"
        aria-pressed={queueOpen}
        onClick={() => onQueueToggle?.()}
      >
        <PlayerSymbol icon={PLAYER_ICONS.queue} />
      </button>

      <button
        id="volume-btn"
        className="icon-button player-icon-control"
        type="button"
        aria-label={volume <= 0 ? 'Unmute' : 'Mute'}
        onClick={() => onVolumeToggle?.()}
      >
        <PlayerSymbol icon={volumeIcon} />
      </button>

      {showQuality && hasTrack ? <AudioQualityInfo quality={quality} /> : null}
    </>
  );
}

function AudioQualityInfo({ quality }) {
  const label = quality?.label || 'Audio quality unknown';
  const labelTop = quality?.labelTop || label;
  const labelBottom = quality?.labelBottom || '';
  const iconUrl = quality?.iconUrl || '';
  const iconAlt = quality?.iconAlt || '';

  return (
    <div id="audio-quality-info" className="audio-quality-info" title={label}>
      {iconUrl ? (
        <img id="audio-quality-icon" src={iconUrl} alt={iconAlt} />
      ) : (
        <i id="audio-quality-fallback-icon" className="fa-solid fa-file-audio" aria-hidden="true" />
      )}
      <span id="audio-quality-label">
        <span className="audio-quality-top">{labelTop}</span>
        {labelBottom ? <span className="audio-quality-bottom">{labelBottom}</span> : null}
      </span>
    </div>
  );
}

function getVolumeIcon(volume) {
  if (volume <= 0) return PLAYER_ICONS.volumeMuted;
  if (volume < 0.34) return PLAYER_ICONS.volumeLow;
  if (volume < 0.67) return PLAYER_ICONS.volumeMedium;
  return PLAYER_ICONS.volumeHigh;
}

function PlayerSymbol({ icon }) {
  return <i className="player-symbol" style={{ '--player-icon': `url('${icon}')` }} aria-hidden="true" />;
}
