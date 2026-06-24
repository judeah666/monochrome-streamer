import React from 'react';
import { AUDIO_QUALITY_ICONS } from '../../assets/icons/audio-quality/index.js';

const PLAYER_ICONS = {
  download: '/assets/icons/player/download.svg',
  queue: '/assets/icons/player/list-ul.svg',
  volumeHigh: '/assets/icons/player/volume-high.svg',
  volumeMedium: '/assets/icons/player/volume-medium.svg',
  volumeLow: '/assets/icons/player/volume-low.svg',
  volumeMuted: '/assets/icons/player/volume-xmark.svg',
};
const playerIconControlClassName = 'icon-button player-icon-control tw-inline-flex tw-items-center tw-justify-center tw-border-0 tw-bg-transparent tw-p-0 tw-text-inherit tw-cursor-pointer tw-transition hover:tw-text-accent';
const audioQualityClassName = 'audio-quality-info tw-inline-flex tw-items-center tw-text-text';
const qualityLabelClassName = 'tw-grid tw-leading-tight';

export function PlayerUtilityControls({
  hasTrack = false,
  currentTrackTitle = '',
  downloadName = '',
  canDownload = true,
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
  const downloadDisabled = !hasTrack || !canDownload;

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
        aria-disabled={downloadDisabled ? 'true' : undefined}
        disabled={downloadDisabled}
        onClick={() => {
          if (!downloadDisabled) onDownload?.();
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
  const iconType = quality?.iconType || '';
  const iconUrl = AUDIO_QUALITY_ICONS[iconType] || quality?.iconUrl || '';
  const iconAlt = quality?.iconAlt || '';
  const qualityClassName = [
    audioQualityClassName,
    iconType ? `is-${iconType}` : '',
  ].filter(Boolean).join(' ');

  return (
    <div id="audio-quality-info" className={qualityClassName} title={label} aria-label={label}>
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
