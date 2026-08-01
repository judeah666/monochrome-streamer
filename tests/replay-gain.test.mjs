import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createReplayGainMetadata } from '../lib/library.mjs';
import {
  readTrackFromDatabase,
  writeLibraryDatabase,
} from '../lib/library-db.mjs';
import { DEFAULT_SETTINGS } from '../src/controller/constants.js';
import {
  getReplayGainMultiplier,
  normalizeReplayGainMode,
  normalizeReplayGainPreamp,
} from '../src/controller/replayGain.js';
import { normalizeSettings } from '../src/controller/settingsStore.js';

test('ReplayGain metadata keeps standard track and album gain values', () => {
  assert.deepEqual(createReplayGainMetadata({
    replaygain_track_gain: { dB: -7.25, ratio: 0.18 },
    replaygain_track_peak: { dB: -0.1, ratio: 0.98 },
    replaygain_album_gain: { dB: -8.5, ratio: 0.14 },
    replaygain_album_peak: { dB: 0.2, ratio: 1.02 },
  }), {
    trackGainDb: -7.25,
    trackPeak: 0.98,
    albumGainDb: -8.5,
    albumPeak: 1.02,
  });
  assert.equal(createReplayGainMetadata({}), null);
});

test('ReplayGain selects track or album gain and applies the configured preamp', () => {
  const replayGain = {
    trackGainDb: -6,
    trackPeak: null,
    albumGainDb: -9,
    albumPeak: null,
  };

  assert.ok(Math.abs(getReplayGainMultiplier(replayGain, 'track', 3) - (10 ** (-3 / 20))) < 0.000001);
  assert.ok(Math.abs(getReplayGainMultiplier(replayGain, 'album', 3) - (10 ** (-6 / 20))) < 0.000001);
  assert.equal(getReplayGainMultiplier(replayGain, 'off', 12), 1);
  assert.equal(getReplayGainMultiplier(null, 'track', 3), 1);
});

test('ReplayGain falls back to track gain in album mode and prevents clipping', () => {
  const replayGain = {
    trackGainDb: 6,
    trackPeak: 0.8,
    albumGainDb: null,
    albumPeak: null,
  };

  assert.equal(getReplayGainMultiplier(replayGain, 'album', 0), 1.25);
});

test('ReplayGain settings use safe bounds and requested defaults', () => {
  assert.equal(DEFAULT_SETTINGS.replayGainMode, 'track');
  assert.equal(DEFAULT_SETTINGS.replayGainPreamp, 3);
  assert.equal(normalizeReplayGainMode('album'), 'album');
  assert.equal(normalizeReplayGainMode('invalid'), 'track');
  assert.equal(normalizeReplayGainPreamp(30), 15);
  assert.equal(normalizeReplayGainPreamp(-30), -15);
  assert.deepEqual(normalizeSettings({ replayGainMode: 'off', replayGainPreamp: '4.5' }), {
    replayGainMode: 'off',
    replayGainPreamp: 4.5,
  });
});

test('ReplayGain metadata survives a library database round trip', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-replay-gain-${process.pid}-${Date.now()}.sqlite`);
  const replayGain = {
    trackGainDb: -5.5,
    trackPeak: 0.91,
    albumGainDb: -7,
    albumPeak: 0.95,
  };
  try {
    await writeLibraryDatabase(databasePath, {
      generatedAt: '2026-08-01T00:00:00.000Z',
      tracks: [{
        id: 'track-1',
        title: 'Track',
        artist: 'Artist',
        albumArtist: 'Artist',
        album: 'Album',
        trackNumber: 1,
        discNumber: 1,
        date: '2026',
        year: 2026,
        relativePath: 'Artist/Album/01 - Track.flac',
        path: '/music/Artist/Album/01 - Track.flac',
        fileSize: 100,
        mtimeMs: 1,
        scanMetadata: true,
        scanDurations: false,
        coverArtPath: '',
        cachedCoverPath: '',
        cachedCoverFormat: '',
        hasEmbeddedCover: false,
        duration: 180,
        audioQuality: { format: 'FLAC' },
        replayGain,
        collectionName: '',
      }],
      albums: [{
        id: 'album-1',
        title: 'Album',
        artist: 'Artist',
        albumArtist: 'Artist',
        date: '2026',
        year: 2026,
        collectionName: '',
        collectionNames: [],
        coverTrackId: 'track-1',
        trackIds: ['track-1'],
        audioQuality: { format: 'FLAC' },
      }],
    });

    assert.deepEqual((await readTrackFromDatabase(databasePath, 'track-1')).replayGain, replayGain);
  } finally {
    rmSync(databasePath, { force: true });
    rmSync(`${databasePath}-shm`, { force: true });
    rmSync(`${databasePath}-wal`, { force: true });
  }
});
