import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLyricsSignature,
  createPlainLyricsSignature,
  getActiveLyricIndex,
  getPlainLyricLines,
  getSyncedLyricLines,
  parseSyncedLyrics,
  updateSyncedLyricsHighlight,
  shouldHideFullscreenLyricsByDefault,
} from '../src/controller/fullscreenLyricsState.js';

test('defaults fullscreen lyrics by viewport without changing later toggle state', () => {
  assert.equal(shouldHideFullscreenLyricsByDefault(false), false);
  assert.equal(shouldHideFullscreenLyricsByDefault(true), true);
});

function createLine(time) {
  const classes = new Set();
  return {
    dataset: { time: String(time) },
    classList: {
      toggle(name, active) {
        if (active) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      },
    },
  };
}

test('parseSyncedLyrics supports LRC timestamps, offsets, and multiple timestamps', () => {
  const lines = parseSyncedLyrics(`
    [offset:500]
    [00:01.00][00:03.00]Hello
    00:05.25 Loose line
    [ar:Ignored Artist]
  `);

  assert.deepEqual(lines, [
    { time: 1.5, text: 'Hello' },
    { time: 3.5, text: 'Hello' },
    { time: 5.75, text: 'Loose line' },
  ]);
});

test('getSyncedLyricLines falls back to timestamped plain lyrics', () => {
  const lines = getSyncedLyricLines({
    syncedLyrics: '',
    plainLyrics: '[00:10.00]Fallback line',
  });

  assert.deepEqual(lines, [{ time: 10, text: 'Fallback line' }]);
});

test('getPlainLyricLines strips timestamp tags', () => {
  assert.deepEqual(getPlainLyricLines({
    syncedLyrics: '[00:01.00]First\n[00:02.00]Second',
    plainLyrics: '',
  }), ['First', 'Second']);
});

test('lyrics signatures include stable identifying content', () => {
  const syncedLines = [
    { time: 1, text: 'First' },
    { time: 5, text: 'Last' },
  ];

  assert.equal(createLyricsSignature('track-1', syncedLines), 'track-1:2:1:5:Last');
  assert.equal(createPlainLyricsSignature('track-1', ['First', 'Last']), 'track-1:2:First:Last');
});

test('getActiveLyricIndex returns the current synced lyric line', () => {
  assert.equal(getActiveLyricIndex([{ time: 1 }, { time: 3 }, { time: 5 }], 0), 0);
  assert.equal(getActiveLyricIndex([{ time: 1 }, { time: 3 }, { time: 5 }], 3.5), 1);
  assert.equal(getActiveLyricIndex([], 3.5), -1);
});

test('updateSyncedLyricsHighlight toggles active and distance classes', () => {
  const lines = [
    createLine(1),
    createLine(3),
    createLine(5),
    createLine(7),
    createLine(9),
    createLine(11),
    createLine(13),
    createLine(15),
  ];
  let centered = null;
  const container = {
    dataset: { mode: 'synced', activeLyricIndex: '-1' },
    querySelectorAll() {
      return lines;
    },
  };

  const activeIndex = updateSyncedLyricsHighlight({
    container,
    currentTime: 7.2,
    centerLine: (_container, line, behavior) => {
      centered = { line, behavior };
    },
  });

  assert.equal(activeIndex, 3);
  assert.equal(container.dataset.activeLyricIndex, '3');
  assert.equal(lines[3].classList.contains('is-active'), true);
  assert.equal(lines[1].classList.contains('is-soft'), true);
  assert.equal(lines[7].classList.contains('is-distant'), true);
  assert.equal(centered.line, lines[3]);
  assert.equal(centered.behavior, 'smooth');
});
