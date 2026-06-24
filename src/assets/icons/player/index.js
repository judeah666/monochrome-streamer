export const PLAYBACK_MODE_ICONS = {
  shuffleOff: '/assets/icons/player/shuffle-off.svg',
  shuffleOn: '/assets/icons/player/shuffle.svg',
  repeatOff: '/assets/icons/player/repeat-off.svg',
  repeatAll: '/assets/icons/player/repeat-all.svg',
  repeatOne: '/assets/icons/player/repeat-1.svg',
};

export function getShuffleIcon(shuffleActive = false) {
  return shuffleActive ? PLAYBACK_MODE_ICONS.shuffleOn : PLAYBACK_MODE_ICONS.shuffleOff;
}

export function getRepeatIcon(repeatMode = 'off') {
  if (repeatMode === 'one') return PLAYBACK_MODE_ICONS.repeatOne;
  if (repeatMode === 'all') return PLAYBACK_MODE_ICONS.repeatAll;
  return PLAYBACK_MODE_ICONS.repeatOff;
}
