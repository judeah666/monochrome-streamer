export function getSyncedLyricLines(lyrics) {
  if (!lyrics) return [];
  const syncedLines = parseSyncedLyrics(lyrics.syncedLyrics || '');
  if (syncedLines.length > 0) return syncedLines;
  return parseSyncedLyrics(lyrics.plainLyrics || '');
}

export function getPlainLyricLines(lyrics) {
  const plainLyrics = lyrics?.plainLyrics || lyrics?.syncedLyrics || '';
  return String(plainLyrics)
    .split('\n')
    .map((line) => line.replace(timestampTagPattern(), '').trim())
    .filter(Boolean);
}

export function createLyricsSignature(trackId, lines) {
  const first = lines[0];
  const last = lines.at(-1);
  return `${trackId}:${lines.length}:${first?.time ?? 0}:${last?.time ?? 0}:${last?.text ?? ''}`;
}

export function createPlainLyricsSignature(trackId, lines) {
  return `${trackId}:${lines.length}:${lines[0] || ''}:${lines.at(-1) || ''}`;
}

export function shouldHideFullscreenLyricsByDefault(isMobileViewport) {
  return Boolean(isMobileViewport);
}

export function parseSyncedLyrics(value) {
  const lines = [];
  let offset = 0;
  const timePattern = timestampTagPattern();
  for (const rawLine of String(value || '').split('\n')) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const offsetMatch = /^\[offset:([+-]?\d+)\]$/iu.exec(trimmed);
    if (offsetMatch) {
      offset = Number(offsetMatch[1]) / 1000;
      continue;
    }

    if (/^\[(?:ar|al|ti|au|by|length|re|ve):/iu.test(trimmed)) continue;

    const timestamps = [...trimmed.matchAll(timePattern)];
    if (timestamps.length > 0) {
      const text = trimmed.replace(timePattern, '').trim();
      if (!text) continue;
      for (const timestamp of timestamps) {
        lines.push({ time: parseTimestampMatch(timestamp, offset), text });
      }
      continue;
    }

    const looseMatch = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\s+(.+)$/u.exec(trimmed);
    if (!looseMatch) continue;
    const text = looseMatch[5].trim();
    if (!text) continue;
    lines.push({ time: parseTimestampMatch(looseMatch, offset), text });
  }
  return lines.sort((a, b) => a.time - b.time);
}

export function timestampTagPattern() {
  return /[\[<](?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?[\]>]/gu;
}

export function getActiveLyricIndex(lines, currentTime) {
  if (lines.length === 0) return -1;
  let activeIndex = -1;
  for (const [index, line] of lines.entries()) {
    if (Number(line.dataset?.time ?? line.time) <= currentTime) activeIndex = index;
  }
  return activeIndex < 0 ? 0 : activeIndex;
}

export function updateSyncedLyricsHighlight({
  container,
  currentTime,
  forceScroll = false,
  centerLine = centerActiveLyricLine,
}) {
  if (container.dataset.mode !== 'synced') return -1;
  const lines = [...container.querySelectorAll('.fullscreen-lyric-line[data-time]')];
  if (lines.length === 0) return -1;

  const activeIndex = getActiveLyricIndex(lines, Number.isFinite(currentTime) ? currentTime : 0);
  const previousActiveIndex = Number(container.dataset.activeLyricIndex || -1);

  for (const [index, line] of lines.entries()) {
    const distance = Math.abs(index - activeIndex);
    line.classList.toggle('is-active', index === activeIndex);
    line.classList.toggle('is-soft', distance > 1 && distance <= 3);
    line.classList.toggle('is-distant', distance > 3);
  }

  if (forceScroll || activeIndex !== previousActiveIndex) {
    container.dataset.activeLyricIndex = String(activeIndex);
    centerLine(container, lines[activeIndex], forceScroll ? 'auto' : 'smooth');
  }

  return activeIndex;
}

export function centerActiveLyricLine(container, line, behavior = 'smooth') {
  if (!container || !line) return;

  const containerRect = container.getBoundingClientRect();
  const lineRect = line.getBoundingClientRect();
  const lineCenter = lineRect.top + (lineRect.height / 2);
  const containerCenter = containerRect.top + (containerRect.height / 2);
  const scrollDelta = lineCenter - containerCenter;
  container.scrollTo({
    top: container.scrollTop + scrollDelta,
    behavior,
  });
}

function parseTimestampMatch(match, offset = 0) {
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const fraction = match[4] ? Number(`0.${match[4].padEnd(3, '0').slice(0, 3)}`) : 0;
  return Math.max(0, (hours * 3600) + (minutes * 60) + seconds + fraction + offset);
}
