import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildUserPresenceMap,
  serializeUserPresence,
  USER_ONLINE_WINDOW_MS,
} from '../src/server/userActivity.js';

test('user presence reports recent sessions and their current playback', () => {
  const now = 1_800_000_000_000;
  const sessions = new Map([
    ['token', {
      username: 'listener',
      lastSeenAt: now - 10_000,
      expiresAt: now + 60_000,
      playback: {
        trackId: 'track-1',
        title: 'Current Song',
        artist: 'Current Artist',
        album: 'Current Album',
        playing: true,
        updatedAt: now - 5_000,
      },
    }],
  ]);

  const result = serializeUserPresence(buildUserPresenceMap(sessions, now).get('listener'));
  assert.equal(result.online, true);
  assert.equal(result.nowPlaying.title, 'Current Song');
  assert.equal(result.nowPlaying.playing, true);
});

test('user presence excludes expired and inactive sessions', () => {
  const now = 1_800_000_000_000;
  const sessions = [
    { username: 'expired', lastSeenAt: now, expiresAt: now - 1 },
    { username: 'inactive', lastSeenAt: now - USER_ONLINE_WINDOW_MS - 1, expiresAt: now + 60_000 },
  ];

  const presence = buildUserPresenceMap(sessions, now);
  assert.equal(presence.size, 0);
  assert.deepEqual(serializeUserPresence(null), { online: false, lastSeenAt: '', nowPlaying: null });
});

test('playing sessions take precedence over paused sessions for the same user', () => {
  const now = 1_800_000_000_000;
  const presence = buildUserPresenceMap([
    {
      username: 'listener',
      lastSeenAt: now,
      expiresAt: now + 60_000,
      playback: { trackId: 'paused', title: 'Paused', playing: false, updatedAt: now },
    },
    {
      username: 'listener',
      lastSeenAt: now - 1_000,
      expiresAt: now + 60_000,
      playback: { trackId: 'playing', title: 'Playing', playing: true, updatedAt: now - 1_000 },
    },
  ], now).get('listener');

  assert.equal(serializeUserPresence(presence).nowPlaying.trackId, 'playing');
});
