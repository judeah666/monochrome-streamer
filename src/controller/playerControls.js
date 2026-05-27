import { clamp, getRelativePointerPosition } from './utils.js';

export function getProgressState(audioPlayer) {
  const duration = Number.isFinite(audioPlayer.duration) ? audioPlayer.duration : 0;
  const currentTime = Number.isFinite(audioPlayer.currentTime) ? audioPlayer.currentTime : 0;
  return {
    currentTime,
    duration,
    ratio: duration > 0 ? currentTime / duration : 0,
  };
}

export function updateProgressElements({
  progressFill,
  fullscreenProgressFill,
  currentTimeElement,
  totalDurationElement,
  fullscreenCurrentTimeElement,
  fullscreenTotalDurationElement,
  progress,
  formatTime,
}) {
  const percent = `${progress.ratio * 100}%`;
  progressFill.style.width = percent;
  fullscreenProgressFill.style.width = percent;
  currentTimeElement.textContent = formatTime(progress.currentTime);
  totalDurationElement.textContent = formatTime(progress.duration);
  fullscreenCurrentTimeElement.textContent = formatTime(progress.currentTime);
  fullscreenTotalDurationElement.textContent = formatTime(progress.duration);
}

export function seekFromProgressBar({
  audioPlayer,
  event,
  bar,
  onProgress,
  onPersist,
  persist = true,
}) {
  if (!Number.isFinite(audioPlayer.duration) || audioPlayer.duration <= 0) return;
  const ratio = getRelativePointerPosition(event, bar);
  audioPlayer.currentTime = audioPlayer.duration * ratio;
  onProgress?.();
  if (persist) onPersist?.();
}

export function bindSeekControl(bar, {
  audioPlayer,
  onProgress,
  onPersist,
}) {
  let ignoreNextClick = false;

  const updateFromPointer = (event, { persist = true } = {}) => {
    event.preventDefault?.();
    seekFromProgressBar({
      audioPlayer,
      event,
      bar,
      onProgress,
      onPersist,
      persist,
    });
  };

  bar.addEventListener('click', (event) => {
    if (ignoreNextClick) {
      ignoreNextClick = false;
      return;
    }
    updateFromPointer(event);
  });

  bar.addEventListener('pointerdown', (event) => {
    ignoreNextClick = true;
    updateFromPointer(event, { persist: false });
    bar.setPointerCapture?.(event.pointerId);

    const handlePointerMove = (moveEvent) => updateFromPointer(moveEvent, { persist: false });
    const handlePointerUp = () => {
      onPersist?.();
      bar.removeEventListener('pointermove', handlePointerMove);
      bar.removeEventListener('pointerup', handlePointerUp);
      bar.removeEventListener('pointercancel', handlePointerUp);
    };

    bar.addEventListener('pointermove', handlePointerMove);
    bar.addEventListener('pointerup', handlePointerUp);
    bar.addEventListener('pointercancel', handlePointerUp);
  });
}

export function getNextVolumeState({ volume, lastVolume }, nextVolume) {
  const clampedVolume = clamp(nextVolume, 0, 1);
  return {
    volume: clampedVolume,
    lastVolume: clampedVolume > 0 ? clampedVolume : lastVolume,
  };
}

export function getMutedVolumeState({ volume, lastVolume }) {
  if (volume === 0) {
    return getNextVolumeState({ volume, lastVolume }, lastVolume || 0.7);
  }
  return {
    volume: 0,
    lastVolume: volume,
  };
}

export function bindVolumeControl(bar, {
  getVolume,
  setVolume,
}) {
  const updateFromPointer = (event) => {
    event.preventDefault();
    setVolume(getRelativePointerPosition(event, bar));
  };

  bar.addEventListener('click', updateFromPointer);
  bar.addEventListener('pointerdown', (event) => {
    updateFromPointer(event);
    bar.setPointerCapture?.(event.pointerId);

    const handlePointerMove = (moveEvent) => updateFromPointer(moveEvent);
    const handlePointerUp = () => {
      bar.removeEventListener('pointermove', handlePointerMove);
      bar.removeEventListener('pointerup', handlePointerUp);
      bar.removeEventListener('pointercancel', handlePointerUp);
    };

    bar.addEventListener('pointermove', handlePointerMove);
    bar.addEventListener('pointerup', handlePointerUp);
    bar.addEventListener('pointercancel', handlePointerUp);
  });
  bar.addEventListener('wheel', (event) => {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    setVolume(getVolume() + (direction * 0.04));
  }, { passive: false });
}

export function updateVolumeElements({ volumeFill, fullscreenVolumeFill, volume }) {
  const percent = `${volume * 100}%`;
  volumeFill.style.width = percent;
  fullscreenVolumeFill.style.width = percent;
}
