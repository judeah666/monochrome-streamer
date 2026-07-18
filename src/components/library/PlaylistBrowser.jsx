import React from 'react';
import { CoverImage } from '../common/VisualBits.jsx';
import { TrackList } from './TrackList.jsx';

const playlistGridClassName = 'playlist-library-grid tw-grid tw-grid-cols-[repeat(auto-fill,minmax(220px,1fr))] tw-gap-4';
const playlistCardClassName = [
  'playlist-card tw-grid tw-min-h-[150px] tw-content-between tw-gap-5 tw-rounded-[24px]',
  'tw-border tw-border-line tw-bg-surface tw-p-5 tw-text-left tw-text-text tw-shadow-panel',
  'tw-backdrop-blur-md tw-transition hover:tw-translate-y-[-2px] hover:tw-border-accent',
].join(' ');
const playlistHeroClassName = [
  'playlist-detail-hero tw-grid tw-grid-cols-[220px_minmax(0,1fr)] tw-items-center tw-gap-8',
  'tw-rounded-[30px] tw-border tw-border-line tw-bg-surface tw-p-7 tw-shadow-panel tw-backdrop-blur-xl',
  'max-[720px]:tw-grid-cols-1 max-[720px]:tw-justify-items-center max-[720px]:tw-p-5 max-[720px]:tw-text-center',
].join(' ');
const heroCoverClassName = 'tw-h-[220px] tw-w-[220px] tw-rounded-[26px] tw-object-cover tw-shadow-panel';
const heroPlaceholderClassName = 'album-art-placeholder tw-h-[220px] tw-w-[220px] tw-rounded-[26px]';

export function PlaylistBrowser({
  playlists = [],
  selectedPlaylist = null,
  selectedPlaylistId = '',
  canUsePlaylists = false,
  loading = false,
  error = '',
  searchTerm = '',
  onSelectPlaylist,
  onBack,
  onNewPlaylist,
  onDeletePlaylist,
  onPlayPlaylist,
  onQueuePlaylist,
  onPlayTrack,
  onFavoriteTrack,
  onAddTrackToQueue,
  onDownloadTrack,
  onRemoveTrack,
  onArtistClick,
  onAlbumClick,
  onLogin,
}) {
  if (!canUsePlaylists) {
    return (
      <section className="empty-state playlist-signin-state">
        <h3>Sign in to use playlists</h3>
        <p>Personal playlists are saved separately for every account.</p>
        <button className="primary-button" type="button" onClick={() => onLogin?.()}>Sign in</button>
      </section>
    );
  }

  if (selectedPlaylistId) {
    return (
      <PlaylistDetail
        playlist={selectedPlaylist}
        loading={loading}
        error={error}
        searchTerm={searchTerm}
        onBack={onBack}
        onDeletePlaylist={onDeletePlaylist}
        onPlayPlaylist={onPlayPlaylist}
        onQueuePlaylist={onQueuePlaylist}
        onPlayTrack={onPlayTrack}
        onFavoriteTrack={onFavoriteTrack}
        onAddTrackToQueue={onAddTrackToQueue}
        onDownloadTrack={onDownloadTrack}
        onRemoveTrack={onRemoveTrack}
        onArtistClick={onArtistClick}
        onAlbumClick={onAlbumClick}
      />
    );
  }

  return (
    <section className="playlist-library tw-grid tw-gap-5" aria-label="Your playlists">
      <header className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-4">
        <div>
          <h3 className="tw-m-0 tw-text-[1.45rem]">Your playlists</h3>
          <p className="tw-m-0 tw-mt-1 tw-text-muted">Open a playlist to play or manage its tracks.</p>
        </div>
        <button type="button" className="primary-button" onClick={onNewPlaylist}>
          <i className="fa-solid fa-plus" aria-hidden="true" /> New Playlist
        </button>
      </header>

      {loading && playlists.length === 0 ? <p className="empty-state">Loading playlists...</p> : null}
      {error ? <p className="settings-status-message is-error" role="alert">{error}</p> : null}
      {!loading && playlists.length === 0 ? <p className="empty-state">No playlists yet.</p> : null}

      {playlists.length > 0 ? (
        <div className={playlistGridClassName}>
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              type="button"
              className={playlistCardClassName}
              onClick={() => onSelectPlaylist?.(playlist.id)}
            >
              <span className="tw-inline-grid tw-h-12 tw-w-12 tw-place-items-center tw-rounded-full tw-bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] tw-text-[1.25rem] tw-text-accent">
                <i className="fa-solid fa-list-ul" aria-hidden="true" />
              </span>
              <span>
                <strong className="tw-block tw-text-[1.1rem]">{playlist.name}</strong>
                <span className="tw-mt-1 tw-block tw-text-muted">
                  {playlist.trackCount} track{playlist.trackCount === 1 ? '' : 's'}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function PlaylistDetail({
  playlist,
  loading,
  error,
  searchTerm,
  onBack,
  onDeletePlaylist,
  onPlayPlaylist,
  onQueuePlaylist,
  onPlayTrack,
  onFavoriteTrack,
  onAddTrackToQueue,
  onDownloadTrack,
  onRemoveTrack,
  onArtistClick,
  onAlbumClick,
}) {
  if (loading && !playlist) return <p className="empty-state">Loading playlist...</p>;
  if (error && !playlist) return <p className="settings-status-message is-error" role="alert">{error}</p>;
  if (!playlist) return <p className="empty-state">This playlist is unavailable.</p>;

  const playlistTracks = playlist.tracks || [];
  const normalizedSearch = String(searchTerm || '').trim().toLocaleLowerCase();
  const visibleTracks = playlistTracks
    .filter((track) => !normalizedSearch || String(track.title || '').toLocaleLowerCase().includes(normalizedSearch))
    .map((track, index) => ({ ...track, trackNumber: index + 1, discNumber: 1 }));
  const coverUrl = playlistTracks.find((track) => track.coverUrl)?.coverUrl || '';
  const hasTracks = playlistTracks.length > 0;

  return (
    <section className="playlist-detail-page tw-grid tw-gap-5" aria-live="polite">
      <button type="button" className="secondary-button tw-w-fit" onClick={onBack}>
        <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to playlists
      </button>

      <header className={playlistHeroClassName}>
        <CoverImage
          src={coverUrl}
          alt={`${playlist.name} playlist cover`}
          className={heroCoverClassName}
          placeholderClassName={heroPlaceholderClassName}
          loading="eager"
          decoding="async"
        />
        <div className="tw-min-w-0">
          <p className="eyebrow tw-m-0 tw-text-accent">Playlist</p>
          <h2 className="tw-m-0 tw-mt-2 tw-break-words tw-font-display tw-text-[clamp(2.2rem,5vw,4rem)] tw-leading-[0.98] tw-tracking-[-0.05em]">
            {playlist.name}
          </h2>
          <p className="tw-m-0 tw-mt-3 tw-text-muted">
            {playlist.trackCount} track{playlist.trackCount === 1 ? '' : 's'}
          </p>
          <div className="tw-mt-5 tw-flex tw-flex-wrap tw-gap-3 max-[720px]:tw-justify-center">
            <button type="button" className="primary-button" disabled={!hasTracks} onClick={() => onPlayPlaylist?.(playlist)}>
              <i className="fa-solid fa-play" aria-hidden="true" /> Play playlist
            </button>
            <button type="button" className="secondary-button" disabled={!hasTracks} onClick={() => onQueuePlaylist?.(playlist)}>
              <i className="fa-solid fa-plus" aria-hidden="true" /> Add to queue
            </button>
            <button type="button" className="secondary-button" onClick={() => onDeletePlaylist?.(playlist.id)}>
              <i className="fa-solid fa-trash" aria-hidden="true" /> Delete playlist
            </button>
          </div>
        </div>
      </header>

      <div className="playlist-track-table track-table track-list-shell tw-overflow-hidden tw-rounded-[26px] tw-border tw-border-line tw-shadow-panel">
        {!hasTracks ? (
          <p className="empty-state">This playlist is empty.</p>
        ) : visibleTracks.length === 0 ? (
          <p className="empty-state">No tracks matched this search.</p>
        ) : (
          <TrackList
            tracks={visibleTracks}
            variant="album"
            showDiscHeaders={false}
            showAlbum
            onPlay={onPlayTrack}
            onFavorite={onFavoriteTrack}
            onAddQueue={onAddTrackToQueue}
            onDownload={onDownloadTrack}
            onRemove={onRemoveTrack}
            onArtistClick={onArtistClick}
            onAlbumClick={onAlbumClick}
          />
        )}
      </div>
    </section>
  );
}
