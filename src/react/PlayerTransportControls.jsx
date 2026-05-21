import React from 'react';

export function PlayerTransportControls({
  playing = false,
  shuffleActive = false,
  repeatActive = false,
  repeatLabel = 'Repeat off',
  playIconHtml = '',
  shuffleIconHtml = '',
  previousIconHtml = '',
  nextIconHtml = '',
  repeatIconHtml = '',
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
        className={`transport-icon-button${shuffleActive ? ' active' : ''}`}
        type="button"
        title={shuffleActive ? 'Shuffle on' : 'Shuffle off'}
        aria-label={shuffleActive ? 'Shuffle on' : 'Shuffle off'}
        aria-pressed={shuffleActive}
        onClick={() => onShuffle?.()}
        dangerouslySetInnerHTML={{ __html: shuffleIconHtml }}
      />
      <button
        id="prev-btn"
        type="button"
        title="Previous"
        aria-label="Previous"
        onClick={() => onPrevious?.()}
        dangerouslySetInnerHTML={{ __html: previousIconHtml }}
      />
      <button
        id="play-pause-btn"
        className="play-pause-btn"
        type="button"
        title={playing ? 'Pause' : 'Play'}
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={() => onPlayPause?.()}
        dangerouslySetInnerHTML={{ __html: playIconHtml }}
      />
      <button
        id="next-btn"
        type="button"
        title="Next"
        aria-label="Next"
        onClick={() => onNext?.()}
        dangerouslySetInnerHTML={{ __html: nextIconHtml }}
      />
      <button
        id="repeat-btn"
        className={`transport-icon-button${repeatActive ? ' active' : ''}`}
        type="button"
        title={repeatLabel}
        aria-label={repeatLabel}
        aria-pressed={repeatActive}
        onClick={() => onRepeat?.()}
        dangerouslySetInnerHTML={{ __html: repeatIconHtml }}
      />
    </>
  );
}
