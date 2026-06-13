import React, { useMemo, useState } from 'react';
import { EditorModal } from './EditorModal.jsx';
import { LyricsSuggestionResults, TagSuggestionResults } from './ScraperResults.jsx';
import { CoverImage } from './VisualBits.jsx';

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
const trackCellClassName = [
  'tw-min-h-[42px] tw-rounded-[14px] tw-border tw-border-line',
  'tw-bg-[var(--input-surface)] tw-px-3 tw-py-2.5 tw-normal-case tw-tracking-normal tw-text-text',
].join(' ');
const trackRowInputClassName = `${inputClassName} tw-min-h-[46px]`;
const trackRowActionsClassName = 'tw-flex tw-items-center tw-justify-end tw-gap-2 max-[720px]:tw-justify-start';
const scraperPanelClassName = [
  'tag-scraper-panel tw-rounded-[24px] tw-border tw-border-line tw-bg-surface',
  'tw-p-[18px] tw-backdrop-blur-md',
].join(' ');
const scraperSearchClassName = 'tag-scraper-search tw-grid tw-grid-cols-[minmax(0,1fr)_auto] tw-items-end tw-gap-3 max-[720px]:tw-grid-cols-1';
const scraperStatusClassName = 'tag-scraper-status tw-my-3 tw-text-muted';
const formClassName = 'lyrics-editor-form tw-grid tw-grid-cols-2 tw-gap-4 max-[720px]:tw-grid-cols-1';
const textareaClassName = [
  'tw-min-h-[320px] tw-w-full tw-resize-y tw-rounded-[16px] tw-border tw-border-line',
  'tw-bg-[var(--input-surface)] tw-p-3.5 tw-font-mono tw-text-text tw-normal-case tw-leading-normal tw-tracking-normal',
].join(' ');
const artistFormClassName = 'artist-editor-form tw-grid tw-gap-4';
const artistTextareaClassName = `${inputClassName} tw-min-h-[150px] tw-resize-y tw-leading-normal`;
const editorStatusClassName = 'tw-m-0 tw-text-[0.86rem] tw-text-muted';

export function ArtistEditorModal({
  eyebrow = '',
  title = '',
  titleId = '',
  caption = '',
  closeLabel = 'Close editor',
  resetLabel = 'Reset',
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  imageUrl = '',
  bio = '',
  sourceUrl = '',
  onClose,
  onSave,
  onReset,
}) {
  const [form, setForm] = useState(() => ({ imageUrl, bio, sourceUrl }));
  const [busy, setBusy] = useState({ save: false, reset: false });
  const [status, setStatus] = useState('');

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    if (!onSave) return;
    setBusy((current) => ({ ...current, save: true }));
    setStatus('');
    try {
      await onSave(form);
    } catch (error) {
      setStatus(error?.message || 'Unable to save artist info.');
    } finally {
      setBusy((current) => ({ ...current, save: false }));
    }
  };

  const handleReset = async () => {
    if (!onReset) return;
    setBusy((current) => ({ ...current, reset: true }));
    setStatus('');
    try {
      await onReset();
    } catch (error) {
      setStatus(error?.message || 'Unable to clear artist info.');
    } finally {
      setBusy((current) => ({ ...current, reset: false }));
    }
  };

  return (
    <EditorModal
      eyebrow={eyebrow}
      title={title}
      titleId={titleId}
      caption={caption}
      closeLabel={closeLabel}
      resetLabel={resetLabel}
      cancelLabel={cancelLabel}
      saveLabel={saveLabel}
      onClose={onClose}
      onCancel={onClose}
      onReset={handleReset}
      onSave={handleSave}
      resetDisabled={busy.reset || busy.save}
      saveDisabled={busy.save || busy.reset}
    >
      <div className={editorBodyClassName}>
        {status ? <p className={editorStatusClassName}>{status}</p> : null}
        <form className={artistFormClassName} onSubmit={(event) => event.preventDefault()}>
          <label className={fieldClassName}>
            <span>Artist image URL</span>
            <input className={inputClassName} type="url" placeholder="https://..." autoComplete="off" value={form.imageUrl} onChange={updateField('imageUrl')} autoFocus />
          </label>
          <label className={fieldClassName}>
            <span>Artist bio / info</span>
            <textarea className={artistTextareaClassName} rows="6" placeholder="Write or paste artist info..." value={form.bio} onChange={updateField('bio')}></textarea>
          </label>
          <label className={fieldClassName}>
            <span>Source URL</span>
            <input className={inputClassName} type="url" placeholder="https://..." autoComplete="off" value={form.sourceUrl} onChange={updateField('sourceUrl')} />
          </label>
        </form>
      </div>
    </EditorModal>
  );
}

export function LyricsEditorModal({
  eyebrow = '',
  title = '',
  titleId = '',
  caption = '',
  closeLabel = 'Close editor',
  resetLabel = 'Reset',
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  query = '',
  syncedLyrics = '',
  plainLyrics = '',
  status = 'Search LRCLIB for synced or plain lyrics.',
  onClose,
  onSearch,
  onSave,
  onReset,
}) {
  const [form, setForm] = useState(() => ({
    query,
    syncedLyrics,
    plainLyrics,
  }));
  const [suggestions, setSuggestions] = useState([]);
  const [statusMessage, setStatusMessage] = useState(status);
  const [busy, setBusy] = useState({ search: false, save: false, reset: false });

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSearch = async () => {
    if (!onSearch) return;
    setBusy((current) => ({ ...current, search: true }));
    setStatusMessage('Searching LRCLIB...');
    setSuggestions([]);
    try {
      const nextSuggestions = await onSearch(form.query);
      setSuggestions(nextSuggestions);
      setStatusMessage(
        nextSuggestions.length === 0
          ? 'No lyrics found. You can paste lyrics manually.'
          : `${nextSuggestions.length} result${nextSuggestions.length === 1 ? '' : 's'} found.`,
      );
    } catch (error) {
      setStatusMessage(error?.message || 'Unable to search lyrics.');
    } finally {
      setBusy((current) => ({ ...current, search: false }));
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    setBusy((current) => ({ ...current, save: true }));
    setStatusMessage('Saving lyrics...');
    try {
      await onSave({
        syncedLyrics: form.syncedLyrics,
        plainLyrics: form.plainLyrics,
      });
    } catch (error) {
      setStatusMessage(error?.message || 'Unable to save lyrics.');
    } finally {
      setBusy((current) => ({ ...current, save: false }));
    }
  };

  const handleReset = async () => {
    if (!onReset) return;
    setBusy((current) => ({ ...current, reset: true }));
    try {
      await onReset();
      setForm((current) => ({ ...current, syncedLyrics: '', plainLyrics: '' }));
      setSuggestions([]);
      setStatusMessage('Lyrics reset.');
    } catch (error) {
      setStatusMessage(error?.message || 'Unable to reset lyrics.');
    } finally {
      setBusy((current) => ({ ...current, reset: false }));
    }
  };

  const applySuggestion = (index) => {
    const suggestion = suggestions[index];
    if (!suggestion) return;
    setForm((current) => ({
      ...current,
      syncedLyrics: suggestion.syncedLyrics || '',
      plainLyrics: suggestion.plainLyrics || '',
    }));
    setStatusMessage(
      suggestion.syncedLyrics
        ? 'Synced lyrics loaded. Save to keep them locally.'
        : 'Plain lyrics loaded. Save to keep them locally.',
    );
  };

  return (
    <EditorModal
      eyebrow={eyebrow}
      title={title}
      titleId={titleId}
      caption={caption}
      closeLabel={closeLabel}
      resetLabel={resetLabel}
      cancelLabel={cancelLabel}
      saveLabel={saveLabel}
      onClose={onClose}
      onCancel={onClose}
      onReset={handleReset}
      onSave={handleSave}
      resetDisabled={busy.reset || busy.save}
      saveDisabled={busy.save || busy.reset}
    >
      <div className={editorBodyClassName}>
        <section className={scraperPanelClassName}>
          <div className={scraperSearchClassName}>
            <label className={fieldClassName}>
              <span>Online search</span>
              <input className={inputClassName} type="search" autoComplete="off" value={form.query} onChange={updateField('query')} onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                handleSearch();
              }} autoFocus />
            </label>
            <button className="secondary-button" type="button" disabled={busy.search} onClick={handleSearch}>Search LRCLIB</button>
          </div>
          <p className={scraperStatusClassName}>{statusMessage}</p>
          <LyricsSuggestionResults suggestions={suggestions} onApply={applySuggestion} />
        </section>

        <form className={formClassName} onSubmit={(event) => event.preventDefault()}>
          <label className={fieldClassName}>
            <span>Synced lyrics (LRC)</span>
            <textarea className={textareaClassName} rows="12" placeholder="[00:12.50] First lyric line" value={form.syncedLyrics} onChange={updateField('syncedLyrics')} />
          </label>
          <label className={fieldClassName}>
            <span>Plain lyrics</span>
            <textarea className={textareaClassName} rows="12" placeholder="Paste plain lyrics here..." value={form.plainLyrics} onChange={updateField('plainLyrics')} />
          </label>
        </form>
      </div>
    </EditorModal>
  );
}

export function AlbumTagEditorModal({
  eyebrow = '',
  title = '',
  titleId = '',
  caption = '',
  closeLabel = 'Close editor',
  resetLabel = 'Reset',
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  mode = 'edit',
  musicBrainzId = '',
  albumTitleValue = '',
  albumArtist = '',
  year = '',
  genre = '',
  collectionName = '',
  collectionOptions = [],
  mediaTypes = ['Digital Media'],
  status = 'Collection',
  coverUrl = '',
  searchQuery = '',
  scraperStatus = 'Search MusicBrainz to fill this album automatically.',
  tracks = [],
  manual = false,
  onClose,
  onSearch,
  onLoadSuggestionDetail,
  onSave,
  onReset,
}) {
  const [form, setForm] = useState(() => ({
    title: albumTitleValue,
    albumArtist,
    year,
    genre,
    collectionName,
    mediaTypes: normalizeMediaTypes(mediaTypes),
    status,
    coverUrl,
    searchQuery,
    tracks: normalizeTracks(tracks),
    musicBrainzId,
  }));
  const [suggestions, setSuggestions] = useState([]);
  const [statusMessage, setStatusMessage] = useState(scraperStatus);
  const [busy, setBusy] = useState({ search: false, save: false, reset: false, apply: false });
  const tracksEditable = mode === 'add' || manual;

  const tracksByDisc = useMemo(() => groupTracksByDisc(form.tracks), [form.tracks]);
  const collectionListId = useMemo(() => `collection-options-${Math.random().toString(36).slice(2)}`, []);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleMediaType = (mediaType) => {
    setForm((current) => {
      const next = new Set(current.mediaTypes);
      if (next.has(mediaType)) {
        next.delete(mediaType);
      } else {
        next.add(mediaType);
      }
      return { ...current, mediaTypes: [...next] };
    });
  };

  const updateTrack = (trackId, field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      tracks: current.tracks.map((track) => (
        track.id === trackId
          ? { ...track, [field]: value }
          : track
      )),
    }));
  };

  const addTrack = (discNumber = '1') => {
    setForm((current) => ({
      ...current,
      tracks: [
        ...current.tracks,
        createEmptyTrack({
          index: current.tracks.length,
          discNumber,
          trackNumber: getNextTrackNumberForDisc(current.tracks, discNumber),
          artist: current.albumArtist,
        }),
      ],
    }));
  };

  const removeTrack = (trackId) => {
    setForm((current) => ({
      ...current,
      tracks: current.tracks.filter((track) => track.id !== trackId),
    }));
  };

  const handleSearch = async () => {
    if (!onSearch) return;
    setBusy((current) => ({ ...current, search: true }));
    setStatusMessage('Searching MusicBrainz...');
    setSuggestions([]);
    try {
      const nextSuggestions = await onSearch(form.searchQuery);
      setSuggestions(nextSuggestions);
      setStatusMessage(
        nextSuggestions.length
          ? `Found ${nextSuggestions.length} possible release${nextSuggestions.length === 1 ? '' : 's'}.`
          : 'No MusicBrainz releases found. Try a simpler artist + album search.',
      );
    } catch (error) {
      setStatusMessage(error?.message || 'Unable to search MusicBrainz.');
    } finally {
      setBusy((current) => ({ ...current, search: false }));
    }
  };

  const applySuggestion = async (index) => {
    const suggestion = suggestions[index];
    if (!suggestion || !onLoadSuggestionDetail) return;
    setBusy((current) => ({ ...current, apply: true }));
    setStatusMessage(`Loading track list for ${suggestion.title}...`);
    try {
      const detail = await onLoadSuggestionDetail(suggestion);
      setForm((current) => ({
        ...current,
        title: detail.albumTitle || suggestion.title || current.title,
        albumArtist: detail.albumArtist || suggestion.artist || current.albumArtist,
        year: detail.year || current.year,
        genre: detail.genre || current.genre,
        coverUrl: detail.coverUrl || suggestion.coverUrl || current.coverUrl,
        musicBrainzId: detail.id || suggestion.id || current.musicBrainzId,
        tracks: mergeSuggestedTracks(current.tracks, detail.tracks || []),
      }));
      setStatusMessage(`Applied MusicBrainz release${detail.sourceUrl ? `: ${detail.sourceUrl}` : '.'}`);
    } catch (error) {
      setStatusMessage(error?.message || 'Unable to apply MusicBrainz result.');
    } finally {
      setBusy((current) => ({ ...current, apply: false }));
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    setBusy((current) => ({ ...current, save: true }));
    setStatusMessage('Saving local tag overrides...');
    try {
      await onSave({
        albumTitle: form.title,
        albumArtist: form.albumArtist,
        date: form.year,
        genre: form.genre,
        collectionName: form.collectionName,
        mediaTypes: form.mediaTypes,
        status: form.status,
        coverUrl: form.coverUrl,
        musicBrainzId: form.musicBrainzId,
        tracks: tracksEditable
          ? form.tracks.map((track) => ({
              id: track.id,
              title: String(track.title || '').trim(),
              artist: String(track.artist || '').trim(),
              trackNumber: String(track.trackNumber || '').trim(),
              discNumber: String(track.discNumber || '1'),
            }))
          : undefined,
      });
    } catch (error) {
      setStatusMessage(error?.message || 'Unable to save album tags.');
    } finally {
      setBusy((current) => ({ ...current, save: false }));
    }
  };

  const handleReset = async () => {
    if (mode === 'add') {
      setForm(createEmptyAlbumForm());
      setSuggestions([]);
      setStatusMessage('Search MusicBrainz to fill this wishlist album automatically.');
      return;
    }
    if (!onReset) return;
    setBusy((current) => ({ ...current, reset: true }));
    setStatusMessage('Resetting local tag overrides...');
    try {
      await onReset();
    } catch (error) {
      setStatusMessage(error?.message || 'Unable to reset album tags.');
    } finally {
      setBusy((current) => ({ ...current, reset: false }));
    }
  };

  return (
    <EditorModal
      eyebrow={eyebrow}
      title={title}
      titleId={titleId}
      caption={caption}
      closeLabel={closeLabel}
      resetLabel={resetLabel}
      cancelLabel={cancelLabel}
      saveLabel={saveLabel}
      onClose={onClose}
      onCancel={onClose}
      onReset={handleReset}
      onSave={handleSave}
      resetDisabled={busy.reset || busy.save || busy.apply}
      saveDisabled={busy.save || busy.reset || busy.apply}
    >
      <div className={editorBodyClassName}>
        <form className={editorFormClassName} onSubmit={(event) => event.preventDefault()}>
          <div className={coverFrameClassName}>
            <CoverImage
              className={coverArtClassName}
              src={form.coverUrl}
              alt={`${form.title || 'Album'} cover art`}
              placeholderClassName={coverArtClassName}
            />
          </div>

          <div className={editorFieldsClassName}>
            <label className={fieldClassName}>
              <span>Album title</span>
              <input className={inputClassName} type="text" autoComplete="off" value={form.title} onChange={updateField('title')} autoFocus />
            </label>
            <label className={fieldClassName}>
              <span>Album artist</span>
              <input className={inputClassName} type="text" autoComplete="off" value={form.albumArtist} onChange={updateField('albumArtist')} />
            </label>
            <label className={fieldClassName}>
              <span>Year</span>
              <input className={inputClassName} type="text" placeholder="2021" autoComplete="off" inputMode="numeric" value={form.year} onChange={updateField('year')} />
            </label>
            <label className={fieldClassName}>
              <span>Genre</span>
              <input className={inputClassName} type="text" autoComplete="off" value={form.genre} onChange={updateField('genre')} />
            </label>
            <label className={wideFieldClassName}>
              <span>Collection name</span>
              <input
                className={inputClassName}
                type="text"
                placeholder="Example: 80s Album Collection"
                autoComplete="off"
                list={collectionOptions.length ? collectionListId : undefined}
                value={form.collectionName}
                onChange={updateField('collectionName')}
              />
              {collectionOptions.length ? (
                <datalist id={collectionListId}>
                  {collectionOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              ) : null}
            </label>
            <fieldset className={mediaTypePickerClassName}>
              <span>Media type</span>
              <div className={mediaTypeOptionsClassName}>
                {mediaTypeOptions.map((option) => {
                  const active = form.mediaTypes.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`${mediaTypeOptionClassName}${active ? ' is-active' : ''}`}
                      aria-pressed={active}
                      onClick={() => toggleMediaType(option.value)}
                    >
                      <i className="media-type-symbol" style={{ '--media-type-icon': `url('${option.icon}')` }} aria-hidden="true"></i>
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <label className={fieldClassName}>
              <span>Status</span>
              <select className={inputClassName} value={form.status} onChange={updateField('status')}>
                <option>Collection</option>
                <option value="Wishlist">Wishlist</option>
              </select>
            </label>
            <label className={wideFieldClassName}>
              <span>Cover URL</span>
              <input className={inputClassName} type="url" placeholder="https://..." autoComplete="off" value={form.coverUrl} onChange={updateField('coverUrl')} />
            </label>
          </div>
        </form>

        <section className={scraperPanelClassName}>
          <div className={scraperSearchClassName}>
            <label className={fieldClassName}>
              <span>Online search</span>
              <input className={inputClassName} type="search" autoComplete="off" value={form.searchQuery} onChange={updateField('searchQuery')} onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                handleSearch();
              }} />
            </label>
            <button className="secondary-button" type="button" disabled={busy.search || busy.apply} onClick={handleSearch}>Search MusicBrainz</button>
          </div>
          <p className={scraperStatusClassName}>{statusMessage}</p>
          <TagSuggestionResults suggestions={suggestions} onApply={applySuggestion} />
        </section>

        <section className={trackEditorClassName}>
          <div className="section-heading">
            <div>
              <h3>Tracks</h3>
              <p>
                {tracksEditable
                  ? `${form.tracks.length} track${form.tracks.length === 1 ? '' : 's'} saved for this album.`
                  : `${form.tracks.length} track${form.tracks.length === 1 ? '' : 's'} in this album.`}
              </p>
            </div>
            {tracksEditable ? (
              <button className="secondary-button" type="button" onClick={() => addTrack('1')}>
                Add track
              </button>
            ) : null}
          </div>
          <div className={trackListClassName}>
            {form.tracks.length === 0 ? (
              tracksEditable ? (
                <div className="tw-grid tw-gap-3">
                  <p className="empty-state">No tracks added yet.</p>
                  <div>
                    <button className="secondary-button" type="button" onClick={() => addTrack('1')}>
                      Add first track
                    </button>
                  </div>
                </div>
              ) : (
                <p className="empty-state">This album has no tracks to show.</p>
              )
            ) : tracksByDisc.map(([discNumber, discTracks]) => (
              <article key={discNumber} className={discCardClassName}>
                <header className={discHeaderClassName}>
                  <div className="tw-flex tw-items-baseline tw-gap-2">
                    <span className="label">Disc</span>
                    <strong>{discNumber}</strong>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-3 max-[720px]:tw-flex-wrap">
                    <span className="tw-text-[0.86rem] tw-text-muted">{discTracks.length} track{discTracks.length === 1 ? '' : 's'}</span>
                    {tracksEditable ? (
                      <button className="secondary-button" type="button" onClick={() => addTrack(String(discNumber))}>
                        Add track
                      </button>
                    ) : null}
                  </div>
                </header>
                <div
                  className={`${discTrackHeaderClassName}${tracksEditable ? ' tw-grid-cols-[72px_minmax(180px,1fr)_minmax(160px,0.8fr)_120px]' : ''}`}
                  aria-hidden="true"
                >
                  <span>#</span>
                  <span>Title</span>
                  <span>Artist</span>
                  {tracksEditable ? <span>Action</span> : null}
                </div>
                <div className={discTrackListClassName}>
                  {discTracks.map((track) => (
                    <div
                      key={track.id}
                      className={`${trackRowClassName}${tracksEditable ? ' tw-grid-cols-[72px_minmax(180px,1fr)_minmax(160px,0.8fr)_120px]' : ''}`}
                    >
                      {tracksEditable ? (
                        <>
                          <input className={trackRowInputClassName} type="number" min="1" value={track.trackNumber || ''} aria-label="Track number" onChange={updateTrack(track.id, 'trackNumber')} />
                          <input className={trackRowInputClassName} type="text" value={track.title || ''} aria-label="Track title" onChange={updateTrack(track.id, 'title')} />
                          <input className={trackRowInputClassName} type="text" value={track.artist || ''} aria-label="Track artist" onChange={updateTrack(track.id, 'artist')} />
                          <div className={trackRowActionsClassName}>
                            <button className="secondary-button" type="button" onClick={() => removeTrack(track.id)}>
                              Remove
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={trackCellClassName}>{track.trackNumber || '-'}</div>
                          <div className={trackCellClassName}>{track.title || 'Untitled track'}</div>
                          <div className={trackCellClassName}>{track.artist || 'Unknown artist'}</div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </EditorModal>
  );
}

function normalizeMediaTypes(mediaTypes) {
  const values = Array.isArray(mediaTypes) ? mediaTypes : [mediaTypes];
  return values.filter(Boolean);
}

function normalizeTracks(tracks) {
  if (!Array.isArray(tracks)) return [];
  return tracks.map((track, index) => ({
    id: track.id || `track-${index}`,
    title: track.title || '',
    artist: track.artist || '',
    trackNumber: track.trackNumber || '',
    discNumber: String(track.discNumber || '1'),
  }));
}

function groupTracksByDisc(tracks) {
  const groups = new Map();
  for (const track of tracks) {
    const discNumber = track.discNumber || '1';
    if (!groups.has(discNumber)) {
      groups.set(discNumber, []);
    }
    groups.get(discNumber).push(track);
  }
  return [...groups.entries()].sort(([discA], [discB]) => Number(discA) - Number(discB));
}

function mergeSuggestedTracks(existingTracks, suggestedTracks) {
  const baseTracks = existingTracks.length > 0 ? existingTracks : normalizeTracks(suggestedTracks);
  return baseTracks.map((track, index) => {
    const suggestion = suggestedTracks[index];
    if (!suggestion) return track;
    return {
      ...track,
      id: track.id || suggestion.id || `track-${index}`,
      title: suggestion.title || track.title,
      artist: suggestion.artist || track.artist,
      trackNumber: suggestion.trackNumber || track.trackNumber || String(index + 1),
      discNumber: String(suggestion.discNumber || track.discNumber || '1'),
    };
  });
}

function getNextTrackNumberForDisc(tracks, discNumber) {
  const matches = tracks
    .filter((track) => String(track.discNumber || '1') === String(discNumber || '1'))
    .map((track) => Number(track.trackNumber))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (matches.length === 0) return '1';
  return String(Math.max(...matches) + 1);
}

function createEmptyTrack({ index = 0, discNumber = '1', trackNumber = '1', artist = '' } = {}) {
  return {
    id: `manual-track-${Date.now().toString(36)}-${index.toString(36)}`,
    title: '',
    artist: artist || '',
    trackNumber: String(trackNumber || '1'),
    discNumber: String(discNumber || '1'),
  };
}

function createEmptyAlbumForm() {
  return {
    title: '',
    albumArtist: '',
    year: '',
    genre: '',
    collectionName: '',
    mediaTypes: [],
    status: 'Wishlist',
    coverUrl: '',
    searchQuery: '',
    tracks: [createEmptyTrack()],
    musicBrainzId: '',
  };
}
