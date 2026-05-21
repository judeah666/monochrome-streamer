import React from 'react';

export function FullscreenLyrics({
  mode = 'empty',
  message = '',
  syncedLines = [],
  plainLines = [],
  queueTracks = [],
  currentIndex = -1,
  onSeek,
  onPlayTrack,
}) {
  if (mode === 'synced') {
    return (
      <>
        {syncedLines.map((line, index) => (
          <button
            key={`${line.time}-${index}`}
            type="button"
            className="fullscreen-lyric-line"
            data-lyric-index={index}
            data-time={line.time}
            onClick={() => onSeek?.(line.time)}
          >
            <span>{line.text}</span>
          </button>
        ))}
      </>
    );
  }

  if (mode === 'plain') {
    return (
      <>
        {plainLines.map((line, index) => (
          <div key={`${line}-${index}`} className="fullscreen-lyric-line is-plain">
            <span>{line}</span>
          </div>
        ))}
      </>
    );
  }

  if (mode === 'queue') {
    if (!queueTracks.length || currentIndex < 0) {
      return <div className="fullscreen-lyrics-empty">Your queue will appear here.</div>;
    }

    const startIndex = Math.max(0, currentIndex - 5);
    const visibleTracks = queueTracks.slice(startIndex, currentIndex + 9);

    return (
      <>
        {visibleTracks.map((track, visibleIndex) => {
          const queueIndex = startIndex + visibleIndex;
          const distance = Math.abs(queueIndex - currentIndex);
          const active = queueIndex === currentIndex;
          const blurClass = distance > 3 ? ' is-distant' : distance > 1 ? ' is-soft' : '';
          return (
            <button
              key={`${track.id}-${queueIndex}`}
              type="button"
              className={`fullscreen-lyric-line${active ? ' is-active' : ''}${blurClass}`}
              data-track-id={track.id}
              onClick={() => onPlayTrack?.(track.id)}
            >
              <span>{track.title}</span>
              <small>{track.artist}</small>
            </button>
          );
        })}
      </>
    );
  }

  return <div className="fullscreen-lyrics-empty">{message || 'Start playing a track to fill this view.'}</div>;
}
