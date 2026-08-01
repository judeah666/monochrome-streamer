export const REPLAY_GAIN_MODES = new Set(['off', 'track', 'album']);

export function normalizeReplayGainMode(value, fallback = 'track') {
  return REPLAY_GAIN_MODES.has(value) ? value : fallback;
}

export function normalizeReplayGainPreamp(value, fallback = 3) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(15, Math.max(-15, number));
}

export function getReplayGainMultiplier(replayGain, mode, preampDb = 0) {
  if (!replayGain || mode === 'off') return 1;

  const useAlbumGain = mode === 'album' && Number.isFinite(replayGain.albumGainDb);
  const gainDb = useAlbumGain
    ? replayGain.albumGainDb
    : Number.isFinite(replayGain.trackGainDb)
      ? replayGain.trackGainDb
      : null;
  if (gainDb == null) return 1;

  const peak = useAlbumGain
    ? replayGain.albumPeak
    : replayGain.trackPeak;
  const requestedMultiplier = 10 ** ((gainDb + normalizeReplayGainPreamp(preampDb, 0)) / 20);
  const clippingSafeMultiplier = Number.isFinite(peak) && peak > 0
    ? Math.min(requestedMultiplier, 1 / peak)
    : requestedMultiplier;

  return Math.min(4, Math.max(0, clippingSafeMultiplier));
}
