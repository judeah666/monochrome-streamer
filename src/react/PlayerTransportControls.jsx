import React from 'react';
import { FontAwesomeIcon } from './VisualBits.jsx';

const transportButtonClassName = 'transport-icon-button tw-inline-flex tw-items-center tw-justify-center tw-border-0 tw-bg-transparent tw-p-0 tw-text-inherit tw-cursor-pointer tw-transition hover:tw-text-accent';
const transportMainButtonClassName = 'play-pause-btn tw-inline-flex tw-items-center tw-justify-center tw-rounded-pill tw-border-0 tw-bg-accent tw-p-0 tw-text-[var(--accent-contrast)] tw-shadow-glow tw-cursor-pointer';

export function PlayerTransportControls({
  playing = false,
  shuffleActive = false,
  repeatActive = false,
  repeatMode = 'off',
  repeatLabel = 'Repeat off',
  onPlayPause,
  onPrevious,
  onNext,
  onShuffle,
  onRepeat,
}) {
  return (
    <>
      <button
        id="shuffle-btn"
        className={`${transportButtonClassName}${shuffleActive ? ' active' : ''}`}
        type="button"
        title={shuffleActive ? 'Shuffle on' : 'Shuffle off'}
        aria-label={shuffleActive ? 'Shuffle on' : 'Shuffle off'}
        aria-pressed={shuffleActive}
        onClick={() => onShuffle?.()}
      >
        <FontAwesomeIcon name="shuffle" />
      </button>
      <button
        id="prev-btn"
        className={transportButtonClassName}
        type="button"
        title="Previous"
        aria-label="Previous"
        onClick={() => onPrevious?.()}
      >
        <FontAwesomeIcon name="skipBack" />
      </button>
      <button
        id="play-pause-btn"
        className={transportMainButtonClassName}
        type="button"
        title={playing ? 'Pause' : 'Play'}
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={() => onPlayPause?.()}
      >
        <FontAwesomeIcon name={playing ? 'pause' : 'play'} />
      </button>
      <button
        id="next-btn"
        className={transportButtonClassName}
        type="button"
        title="Next"
        aria-label="Next"
        onClick={() => onNext?.()}
      >
        <FontAwesomeIcon name="skipForward" />
      </button>
      <button
        id="repeat-btn"
        className={`${transportButtonClassName}${repeatActive ? ' active' : ''}`}
        type="button"
        title={repeatLabel}
        aria-label={repeatLabel}
        aria-pressed={repeatActive}
        onClick={() => onRepeat?.()}
      >
        <FontAwesomeIcon name="repeat" />
        {repeatMode === 'one' ? <span className="repeat-one-badge">1</span> : null}
      </button>
    </>
  );
}
