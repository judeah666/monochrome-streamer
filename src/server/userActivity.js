export const USER_ONLINE_WINDOW_MS = 90 * 1000;

export function buildUserPresenceMap(sessionSource, now = Date.now()) {
  const sessions = sessionSource instanceof Map ? sessionSource.values() : sessionSource || [];
  const presence = new Map();

  for (const session of sessions) {
    const username = String(session?.username || '').trim();
    const lastSeenAt = Number(session?.lastSeenAt) || 0;
    const expiresAt = Number(session?.expiresAt) || 0;
    if (!username || expiresAt < now || now - lastSeenAt > USER_ONLINE_WINDOW_MS) continue;

    const key = username.toLowerCase();
    const current = presence.get(key) || {
      online: true,
      lastSeenAt: '',
      lastSeenTimestamp: 0,
      nowPlaying: null,
    };
    if (lastSeenAt > current.lastSeenTimestamp) {
      current.lastSeenTimestamp = lastSeenAt;
      current.lastSeenAt = new Date(lastSeenAt).toISOString();
    }

    const playback = normalizeRecentPlayback(session.playback, now);
    if (playback && shouldReplacePlayback(current.nowPlaying, playback)) {
      current.nowPlaying = playback;
    }
    presence.set(key, current);
  }

  for (const value of presence.values()) {
    delete value.lastSeenTimestamp;
  }
  return presence;
}

function normalizeRecentPlayback(playback, now) {
  const updatedAt = Number(playback?.updatedAt) || 0;
  if (!playback?.trackId || now - updatedAt > USER_ONLINE_WINDOW_MS) return null;
  return {
    trackId: String(playback.trackId),
    title: String(playback.title || 'Unknown track'),
    artist: String(playback.artist || 'Unknown artist'),
    album: String(playback.album || ''),
    playing: playback.playing === true,
    updatedAt: new Date(updatedAt).toISOString(),
    updatedTimestamp: updatedAt,
  };
}

function shouldReplacePlayback(current, candidate) {
  if (!current) return true;
  if (candidate.playing !== current.playing) return candidate.playing;
  return candidate.updatedTimestamp > current.updatedTimestamp;
}

export function serializeUserPresence(presence) {
  if (!presence) {
    return { online: false, lastSeenAt: '', nowPlaying: null };
  }
  const nowPlaying = presence.nowPlaying ? { ...presence.nowPlaying } : null;
  if (nowPlaying) delete nowPlaying.updatedTimestamp;
  return {
    online: presence.online === true,
    lastSeenAt: presence.lastSeenAt || '',
    nowPlaying,
  };
}
