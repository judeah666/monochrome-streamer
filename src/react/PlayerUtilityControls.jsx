import React from 'react';

const PLAYER_ICONS = {
  download: '/player-icons/download.svg',
  queue: '/player-icons/list-ul.svg',
  volumeHigh: '/player-icons/volume-high.svg',
  volumeMedium: '/player-icons/volume-medium.svg',
  volumeLow: '/player-icons/volume-low.svg',
  volumeMuted: '/player-icons/volume-xmark.svg',
};
const playerIconControlClassName = 'icon-button player-icon-control tw-inline-flex tw-items-center tw-justify-center tw-border-0 tw-bg-transparent tw-p-0 tw-text-inherit tw-cursor-pointer tw-transition hover:tw-text-accent';
const audioQualityClassName = 'audio-quality-info tw-inline-flex tw-items-center tw-gap-2 tw-text-text';
const qualityLabelClassName = 'tw-grid tw-leading-tight';

export function PlayerUtilityControls({
  hasTrack = false,
  currentTrackTitle = '',
  downloadName = '',
  favorite = false,
  queueOpen = false,
  volume = 1,
  showQuality = false,
  quality = null,
  onFavorite,
  onDownload,
  onQueueToggle,
  onVolumeToggle,
}) {
  const volumeIcon = getVolumeIcon(volume);
  const favoriteLabel = favorite ? 'Unfavorite current track' : 'Favorite current track';

  return (
    <>
      <button
        id="favorite-track-button"
        className={`${playerIconControlClassName}${favorite ? ' active' : ''}`}
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

      <button
        id="download-track-link"
        className={`icon-link ${playerIconControlClassName}`}
        type="button"
        aria-label={hasTrack ? `Download ${currentTrackTitle}` : 'Download current track'}
        aria-disabled={hasTrack ? undefined : 'true'}
        disabled={!hasTrack}
        onClick={() => {
          if (hasTrack) onDownload?.();
        }}
      >
        <PlayerSymbol icon={PLAYER_ICONS.download} />
      </button>

      <button
        id="queue-toggle-button"
        className={`${playerIconControlClassName}${queueOpen ? ' active' : ''}`}
        type="button"
        aria-label="Open queue"
        aria-pressed={queueOpen}
        onClick={() => onQueueToggle?.()}
      >
        <PlayerSymbol icon={PLAYER_ICONS.queue} />
      </button>

      <button
        id="volume-btn"
        className={playerIconControlClassName}
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
    <div id="audio-quality-info" className={audioQualityClassName} title={label}>
      {iconUrl ? (
        <img id="audio-quality-icon" src={iconUrl} alt={iconAlt} />
      ) : (
        <i id="audio-quality-fallback-icon" className="fa-solid fa-file-audio" aria-hidden="true" />
      )}
      <span id="audio-quality-label" className={qualityLabelClassName}>
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
