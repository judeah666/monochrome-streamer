import React from 'react';

const scraperPanelClassName = [
  'tag-scraper-panel tw-rounded-[24px] tw-border tw-border-line tw-bg-surface',
  'tw-p-[18px] tw-backdrop-blur-md',
].join(' ');
const scraperSearchClassName = 'tag-scraper-search tw-grid tw-grid-cols-[minmax(0,1fr)_auto] tw-items-end tw-gap-3 max-[720px]:tw-grid-cols-1';
const fieldClassName = 'tw-grid tw-gap-2 tw-text-[0.76rem] tw-uppercase tw-tracking-[0.14em] tw-text-muted';
const inputClassName = [
  'tw-min-h-[42px] tw-w-full tw-rounded-[14px] tw-border tw-border-line',
  'tw-bg-[var(--input-surface)] tw-px-3 tw-py-2.5 tw-text-text tw-normal-case tw-tracking-normal',
].join(' ');
const statusClassName = 'tag-scraper-status tw-my-3 tw-text-muted';
const resultsClassName = 'tag-scraper-results tw-grid tw-gap-2.5';
const formClassName = 'lyrics-editor-form tw-grid tw-grid-cols-2 tw-gap-4 max-[720px]:tw-grid-cols-1';
const textareaClassName = [
  'tw-min-h-[320px] tw-w-full tw-resize-y tw-rounded-[16px] tw-border tw-border-line',
  'tw-bg-[var(--input-surface)] tw-p-3.5 tw-font-mono tw-text-text tw-normal-case tw-leading-normal tw-tracking-normal',
].join(' ');

export function LyricsEditorBody({ query = '', syncedLyrics = '', plainLyrics = '', status = 'Search LRCLIB for synced or plain lyrics.' }) {
  return (
    <>
      <section className={scraperPanelClassName}>
        <div className={scraperSearchClassName}>
          <label className={fieldClassName}>
            <span>Online search</span>
            <input className={inputClassName} id="lyrics-scraper-query" type="search" autoComplete="off" defaultValue={query} />
          </label>
          <button id="lyrics-scraper-search-button" className="secondary-button" type="button">Search LRCLIB</button>
        </div>
        <p id="lyrics-scraper-status" className={statusClassName}>{status}</p>
        <div id="lyrics-scraper-results" className={resultsClassName} />
      </section>

      <form className={formClassName}>
        <label className={fieldClassName}>
          <span>Synced lyrics (LRC)</span>
          <textarea className={textareaClassName} id="lyrics-synced-input" rows="12" placeholder="[00:12.50] First lyric line" defaultValue={syncedLyrics} />
        </label>
        <label className={fieldClassName}>
          <span>Plain lyrics</span>
          <textarea className={textareaClassName} id="lyrics-plain-input" rows="12" placeholder="Paste plain lyrics here..." defaultValue={plainLyrics} />
        </label>
      </form>
    </>
  );
}
