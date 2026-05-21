import React from 'react';

const mediaTypeOptions = [
  { value: 'CD', label: 'CD', icon: '/media-type-icons/compact-disc.svg' },
  { value: 'Digital Media', label: 'Digital', icon: '/media-type-icons/file-waveform.svg' },
  { value: 'Vinyl', label: 'Vinyl', icon: '/media-type-icons/record-vinyl.svg' },
  { value: 'Cassette Tape', label: 'Cassette', icon: '/media-type-icons/cassette-tape.svg' },
];

export function AlbumTagEditorBody({
  title = '',
  albumArtist = '',
  year = '',
  genre = '',
  mediaTypes = ['Digital Media'],
  status = 'Collection',
  coverUrl = '',
  searchQuery = '',
  scraperStatus = 'Search MusicBrainz to fill this album automatically.',
  tracks = [],
}) {
  const safeTracks = Array.isArray(tracks) ? tracks : [];
  const selectedMediaTypes = new Set((Array.isArray(mediaTypes) ? mediaTypes : [mediaTypes]).filter(Boolean));
  const tracksByDisc = groupTracksByDisc(safeTracks);

  return (
    <div className="tag-editor-body">
      <form id="tag-editor-form" className="tag-editor-form">
        <div className="tag-editor-cover">
          <img id="tag-editor-cover-preview" alt="" hidden />
          <div id="tag-editor-cover-fallback" className="cover-fallback">
            <i className="fa-solid fa-record-vinyl" aria-hidden="true"></i>
          </div>
        </div>

        <div className="tag-editor-fields">
          <label>
            <span>Album title</span>
            <input id="tag-album-title" type="text" autoComplete="off" defaultValue={title} />
          </label>
          <label>
            <span>Album artist</span>
            <input id="tag-album-artist" type="text" autoComplete="off" defaultValue={albumArtist} />
          </label>
          <label>
            <span>Year</span>
            <input id="tag-album-date" type="text" placeholder="2021" autoComplete="off" inputMode="numeric" defaultValue={year} />
          </label>
          <label>
            <span>Genre</span>
            <input id="tag-album-genre" type="text" autoComplete="off" defaultValue={genre} />
          </label>
          <fieldset className="wide-field media-type-picker">
            <span>Media type</span>
            <div className="media-type-options" id="tag-album-media-types">
              {mediaTypeOptions.map((option) => (
                <label key={option.value}>
                  <input type="checkbox" value={option.value} defaultChecked={selectedMediaTypes.has(option.value)} />
                  <i className="media-type-symbol" style={{ '--media-type-icon': `url('${option.icon}')` }} aria-hidden="true"></i>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            <span>Status</span>
            <select id="tag-album-status" defaultValue={status}>
              <option>Collection</option>
              <option>Wanted</option>
            </select>
          </label>
          <label className="wide-field">
            <span>Cover URL</span>
            <input id="tag-album-cover-url" type="url" placeholder="https://..." autoComplete="off" defaultValue={coverUrl} />
          </label>
        </div>
      </form>

      <section className="tag-track-editor">
        <div className="section-heading">
          <div>
            <h3>Tracks</h3>
            <p>{safeTracks.length} track{safeTracks.length === 1 ? '' : 's'} loaded for editing.</p>
          </div>
        </div>
        <div id="tag-track-list" className="tag-track-list">
          {safeTracks.length === 0 ? (
            <p className="empty-state">This album has no tracks to edit.</p>
          ) : tracksByDisc.map(([discNumber, discTracks]) => (
            <article key={discNumber} className="tag-disc-card">
              <header className="tag-disc-card-header">
                <div>
                  <span className="label">Disc</span>
                  <strong>{discNumber}</strong>
                </div>
                <span>{discTracks.length} track{discTracks.length === 1 ? '' : 's'}</span>
              </header>
              <div className="tag-disc-track-header" aria-hidden="true">
                <span>#</span>
                <span>Title</span>
                <span>Artist</span>
              </div>
              <div className="tag-disc-track-list">
                {discTracks.map((track) => (
                  <div
                    key={track.id}
                    className="tag-track-row"
                    data-track-id={track.id}
                    data-disc-number={String(track.discNumber || discNumber)}
                  >
                    <input className="tag-track-number" type="number" min="1" defaultValue={track.trackNumber || ''} aria-label="Track number" />
                    <input className="tag-track-title" type="text" defaultValue={track.title || ''} aria-label="Track title" />
                    <input className="tag-track-artist" type="text" defaultValue={track.artist || ''} aria-label="Track artist" />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tag-scraper-panel">
        <div className="tag-scraper-search">
          <label>
            <span>Online search</span>
            <input id="tag-scraper-query" type="search" autoComplete="off" defaultValue={searchQuery} />
          </label>
          <button id="tag-scraper-search-button" className="secondary-button" type="button">Search MusicBrainz</button>
        </div>
        <p id="tag-scraper-status" className="tag-scraper-status">{scraperStatus}</p>
        <div id="tag-scraper-results" className="tag-scraper-results"></div>
      </section>
    </div>
  );
}

function groupTracksByDisc(tracks) {
  const groups = new Map();
  for (const track of tracks) {
    const discNumber = track.discNumber || 1;
    if (!groups.has(discNumber)) {
      groups.set(discNumber, []);
    }
    groups.get(discNumber).push(track);
  }
  return [...groups.entries()].sort(([discA], [discB]) => Number(discA) - Number(discB));
}
