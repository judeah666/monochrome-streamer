import React from 'react';
import { CoverPlaceholder } from '../common/VisualBits.jsx';

const resultsClassName = 'tag-scraper-results tw-grid tw-gap-2.5';
const tagCardClassName = [
  'tag-suggestion-card tw-grid tw-grid-cols-[58px_minmax(0,1fr)_auto] tw-items-center tw-gap-3.5',
  'tw-rounded-[18px] tw-border tw-border-line tw-bg-[var(--glass)] tw-p-2.5',
].join(' ');
const suggestionCoverClassName = 'tw-h-[58px] tw-w-[58px] tw-rounded-[14px] tw-object-cover';
const suggestionCopyClassName = 'tw-grid tw-min-w-0 tw-gap-1';
const truncateClassName = 'tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap';
const lyricsResultClassName = [
  'tag-scraper-result tw-grid tw-w-full tw-gap-1 tw-rounded-[16px] tw-border tw-border-line',
  'tw-bg-[var(--glass)] tw-p-3 tw-text-left tw-text-text tw-transition hover:tw-border-accent hover:tw-bg-surface2',
].join(' ');

export function TagSuggestionResults({ suggestions = [], onApply }) {
  return (
    <div className={resultsClassName}>
      {suggestions.map((suggestion, index) => (
        <article key={suggestion.id || `${suggestion.title}-${index}`} className={tagCardClassName}>
          {suggestion.coverUrl ? (
            <img className={suggestionCoverClassName} src={suggestion.coverUrl} alt={`${suggestion.title || 'Release'} cover art`} loading="lazy" />
          ) : (
            <span>
              <CoverPlaceholder className="track-thumb-placeholder" />
            </span>
          )}
          <div className={suggestionCopyClassName}>
            <strong className={truncateClassName}>{suggestion.title || 'Untitled release'}</strong>
            <span className={`${truncateClassName} tw-text-muted`}>{suggestion.artist || 'Unknown artist'}</span>
            <small className={`${truncateClassName} tw-text-muted`}>{[suggestion.date, suggestion.country, suggestion.status].filter(Boolean).join(' • ')}</small>
          </div>
          <button type="button" className="secondary-button" onClick={() => onApply?.(index)}>
            Apply
          </button>
        </article>
      ))}
    </div>
  );
}

export function LyricsSuggestionResults({ suggestions = [], onApply }) {
  return (
    <div className={resultsClassName}>
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.title || 'lyrics'}-${suggestion.artist || 'unknown'}-${index}`}
          type="button"
          className={lyricsResultClassName}
          data-lyrics-index={index}
          onClick={() => onApply?.(index)}
        >
          <strong className={truncateClassName}>{suggestion.title || 'Untitled track'}</strong>
          <span className={`${truncateClassName} tw-text-muted`}>
            {suggestion.artist || 'Unknown artist'}{suggestion.album ? ` • ${suggestion.album}` : ''}
          </span>
          <small className="tw-text-muted">{getLyricsKind(suggestion)}</small>
        </button>
      ))}
    </div>
  );
}

function getLyricsKind(suggestion) {
  if (suggestion.syncedLyrics) return 'Synced lyrics';
  if (suggestion.plainLyrics) return 'Plain lyrics';
  if (suggestion.instrumental) return 'Instrumental';
  return 'No lyric text';
}
