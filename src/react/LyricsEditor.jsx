import React from 'react';

export function LyricsEditorBody({ query = '', syncedLyrics = '', plainLyrics = '', status = 'Search LRCLIB for synced or plain lyrics.' }) {
  return (
    <>
      <section className="tag-scraper-panel">
        <div className="tag-scraper-search">
          <label>
            <span>Online search</span>
            <input id="lyrics-scraper-query" type="search" autoComplete="off" defaultValue={query} />
          </label>
          <button id="lyrics-scraper-search-button" className="secondary-button" type="button">Search LRCLIB</button>
        </div>
        <p id="lyrics-scraper-status" className="tag-scraper-status">{status}</p>
        <div id="lyrics-scraper-results" className="tag-scraper-results" />
      </section>

      <form className="lyrics-editor-form">
        <label>
          <span>Synced lyrics (LRC)</span>
          <textarea id="lyrics-synced-input" rows="12" placeholder="[00:12.50] First lyric line" defaultValue={syncedLyrics} />
        </label>
        <label>
          <span>Plain lyrics</span>
          <textarea id="lyrics-plain-input" rows="12" placeholder="Paste plain lyrics here..." defaultValue={plainLyrics} />
        </label>
      </form>
    </>
  );
}
