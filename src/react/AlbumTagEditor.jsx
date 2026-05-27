import React from 'react';

const mediaTypeOptions = [
  { value: 'CD', label: 'CD', icon: '/media-type-icons/compact-disc.svg' },
  { value: 'Digital Media', label: 'Digital', icon: '/media-type-icons/file-waveform.svg' },
  { value: 'Vinyl', label: 'Vinyl', icon: '/media-type-icons/record-vinyl.svg' },
  { value: 'Cassette Tape', label: 'Cassette', icon: '/media-type-icons/cassette-tape.svg' },
];

const editorBodyClassName = [
  'tag-editor-body tw-grid tw-min-h-0 tw-flex-1 tw-content-start tw-gap-[22px]',
  'tw-overflow-y-auto tw-overflow-x-hidden tw-p-6 max-[720px]:tw-p-4',
].join(' ');
const editorFormClassName = 'tag-editor-form tw-grid tw-grid-cols-[180px_minmax(0,1fr)] tw-gap-[22px] max-[720px]:tw-grid-cols-1';
const coverFrameClassName = 'tag-editor-cover';
const coverArtClassName = 'tw-h-[180px] tw-w-[180px] tw-rounded-[24px] tw-object-cover';
const editorFieldsClassName = 'tag-editor-fields tw-grid tw-grid-cols-2 tw-gap-3.5 max-[720px]:tw-grid-cols-1';
const fieldClassName = 'tw-grid tw-gap-2 tw-text-[0.76rem] tw-uppercase tw-tracking-[0.14em] tw-text-muted';
const inputClassName = [
  'tw-min-h-[42px] tw-w-full tw-rounded-[14px] tw-border tw-border-line',
  'tw-bg-[var(--input-surface)] tw-px-3 tw-py-2.5 tw-text-text tw-normal-case tw-tracking-normal',
].join(' ');
const wideFieldClassName = `wide-field ${fieldClassName} tw-col-span-full`;
const mediaTypePickerClassName = `wide-field media-type-picker ${fieldClassName} tw-col-span-full tw-m-0 tw-border-0 tw-p-0`;
const mediaTypeOptionsClassName = 'media-type-options tw-grid tw-grid-cols-4 tw-gap-2.5 max-[720px]:tw-grid-cols-2';
const mediaTypeOptionClassName = [
  'tw-flex tw-min-h-12 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2',
  'tw-rounded-[16px] tw-border tw-border-line tw-bg-[var(--glass)] tw-text-muted',
].join(' ');
const trackEditorClassName = 'tag-track-editor tw-grid tw-gap-3.5';
const trackListClassName = 'tag-track-list tw-grid tw-gap-2.5';
const discCardClassName = 'tag-disc-card tw-grid tw-gap-3 tw-rounded-[20px] tw-border tw-border-line tw-bg-[var(--glass)] tw-p-3.5';
const discHeaderClassName = [
  'tag-disc-card-header tw-flex tw-items-center tw-justify-between tw-gap-3',
  'tw-border-b tw-border-line tw-pb-2.5 max-[720px]:tw-flex-col max-[720px]:tw-items-start',
].join(' ');
const discTrackHeaderClassName = [
  'tag-disc-track-header tw-grid tw-grid-cols-[72px_minmax(180px,1fr)_minmax(160px,0.8fr)]',
  'tw-items-center tw-gap-2.5 tw-px-1 tw-pb-0.5 tw-text-[0.68rem] tw-uppercase tw-tracking-[0.16em] tw-text-muted',
  'max-[720px]:tw-grid-cols-1',
].join(' ');
const discTrackListClassName = 'tag-disc-track-list tw-grid tw-gap-1.5';
const trackRowClassName = [
  'tag-track-row tw-grid tw-grid-cols-[72px_minmax(180px,1fr)_minmax(160px,0.8fr)]',
  'tw-items-center tw-gap-2.5 max-[720px]:tw-grid-cols-1',
].join(' ');
const scraperPanelClassName = [
  'tag-scraper-panel tw-rounded-[24px] tw-border tw-border-line tw-bg-surface',
  'tw-p-[18px] tw-backdrop-blur-md',
].join(' ');
const scraperSearchClassName = 'tag-scraper-search tw-grid tw-grid-cols-[minmax(0,1fr)_auto] tw-items-end tw-gap-3 max-[720px]:tw-grid-cols-1';
const scraperStatusClassName = 'tag-scraper-status tw-my-3 tw-text-muted';
const scraperResultsClassName = 'tag-scraper-results tw-grid tw-gap-2.5';

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
    <div className={editorBodyClassName}>
      <form id="tag-editor-form" className={editorFormClassName}>
        <div className={coverFrameClassName}>
          <img id="tag-editor-cover-preview" className={coverArtClassName} alt="" hidden />
          <div id="tag-editor-cover-fallback" className={`cover-fallback ${coverArtClassName}`}>
            <i className="fa-solid fa-record-vinyl" aria-hidden="true"></i>
          </div>
        </div>

        <div className={editorFieldsClassName}>
          <label className={fieldClassName}>
            <span>Album title</span>
            <input id="tag-album-title" className={inputClassName} type="text" autoComplete="off" defaultValue={title} />
          </label>
          <label className={fieldClassName}>
            <span>Album artist</span>
            <input id="tag-album-artist" className={inputClassName} type="text" autoComplete="off" defaultValue={albumArtist} />
          </label>
          <label className={fieldClassName}>
            <span>Year</span>
            <input id="tag-album-date" className={inputClassName} type="text" placeholder="2021" autoComplete="off" inputMode="numeric" defaultValue={year} />
          </label>
          <label className={fieldClassName}>
            <span>Genre</span>
            <input id="tag-album-genre" className={inputClassName} type="text" autoComplete="off" defaultValue={genre} />
          </label>
          <fieldset className={mediaTypePickerClassName}>
            <span>Media type</span>
            <div className={mediaTypeOptionsClassName} id="tag-album-media-types">
              {mediaTypeOptions.map((option) => (
                <label key={option.value} className={mediaTypeOptionClassName}>
                  <input type="checkbox" value={option.value} defaultChecked={selectedMediaTypes.has(option.value)} />
                  <i className="media-type-symbol" style={{ '--media-type-icon': `url('${option.icon}')` }} aria-hidden="true"></i>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className={fieldClassName}>
            <span>Status</span>
            <select id="tag-album-status" className={inputClassName} defaultValue={status}>
              <option>Collection</option>
              <option value="Wishlist">Wishlist</option>
            </select>
          </label>
          <label className={wideFieldClassName}>
            <span>Cover URL</span>
            <input id="tag-album-cover-url" className={inputClassName} type="url" placeholder="https://..." autoComplete="off" defaultValue={coverUrl} />
          </label>
        </div>
      </form>

      <section className={trackEditorClassName}>
        <div className="section-heading">
          <div>
            <h3>Tracks</h3>
            <p>{safeTracks.length} track{safeTracks.length === 1 ? '' : 's'} loaded for editing.</p>
          </div>
        </div>
        <div id="tag-track-list" className={trackListClassName}>
          {safeTracks.length === 0 ? (
            <p className="empty-state">This album has no tracks to edit.</p>
          ) : tracksByDisc.map(([discNumber, discTracks]) => (
            <article key={discNumber} className={discCardClassName}>
              <header className={discHeaderClassName}>
                <div className="tw-flex tw-items-baseline tw-gap-2">
                  <span className="label">Disc</span>
                  <strong>{discNumber}</strong>
                </div>
                <span className="tw-text-[0.86rem] tw-text-muted">{discTracks.length} track{discTracks.length === 1 ? '' : 's'}</span>
              </header>
              <div className={discTrackHeaderClassName} aria-hidden="true">
                <span>#</span>
                <span>Title</span>
                <span>Artist</span>
              </div>
              <div className={discTrackListClassName}>
                {discTracks.map((track) => (
                  <div
                    key={track.id}
                    className={trackRowClassName}
                    data-track-id={track.id}
                    data-disc-number={String(track.discNumber || discNumber)}
                  >
                    <input className={`tag-track-number ${inputClassName}`} type="number" min="1" defaultValue={track.trackNumber || ''} aria-label="Track number" />
                    <input className={`tag-track-title ${inputClassName}`} type="text" defaultValue={track.title || ''} aria-label="Track title" />
                    <input className={`tag-track-artist ${inputClassName}`} type="text" defaultValue={track.artist || ''} aria-label="Track artist" />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={scraperPanelClassName}>
        <div className={scraperSearchClassName}>
          <label className={fieldClassName}>
            <span>Online search</span>
            <input id="tag-scraper-query" className={inputClassName} type="search" autoComplete="off" defaultValue={searchQuery} />
          </label>
          <button id="tag-scraper-search-button" className="secondary-button" type="button">Search MusicBrainz</button>
        </div>
        <p id="tag-scraper-status" className={scraperStatusClassName}>{scraperStatus}</p>
        <div id="tag-scraper-results" className={scraperResultsClassName}></div>
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
