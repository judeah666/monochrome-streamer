import React from 'react';
import { TrackList } from './TrackList.jsx';

const playlistBrowserClassName = 'playlist-browser tw-grid tw-grid-cols-[260px_minmax(0,1fr)] tw-gap-[18px] max-[860px]:tw-grid-cols-1';
const playlistListClassName = 'playlist-list tw-grid tw-content-start tw-gap-3';
const playlistCardBaseClassName = 'playlist-card tw-rounded-[18px] tw-border tw-border-line tw-bg-surface tw-p-4 tw-text-left tw-backdrop-blur-md tw-transition hover:tw-border-[color-mix(in_srgb,var(--accent)_38%,transparent)] hover:tw-bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface))]';
const playlistCardActiveClassName = ' is-active tw-border-[color-mix(in_srgb,var(--accent)_38%,transparent)] tw-bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface))]';
const playlistDetailClassName = 'playlist-detail tw-min-w-0';
const playlistHeaderClassName = 'playlist-detail-header';
const playlistTitleClassName = 'tw-m-0 tw-text-[1.2rem]';
const playlistDescriptionClassName = 'tw-m-0 tw-mt-1 tw-text-muted';
const playlistTrackListClassName = 'track-list track-list-shell tw-mt-4';
const renderLimitNoticeClassName = 'render-limit-notice tw-col-span-full tw-m-0 tw-mt-2.5 tw-rounded-[16px] tw-border tw-border-line tw-bg-[var(--background-soft)] tw-px-3.5 tw-py-3 tw-text-[0.9rem] tw-font-bold tw-text-muted';

export function PlaylistBrowser({
  playlists = [],
  selectedPlaylistId = '',
  limit = 160,
  onSelectPlaylist,
  onPlayTrack,
  onFavoriteTrack,
  onAddTrackToQueue,
  onArtistClick,
}) {
  const activePlaylist = playlists.find((playlist) => playlist.id === selectedPlaylistId) ?? playlists[0] ?? null;
  const visibleTracks = activePlaylist?.tracks?.slice(0, limit) || [];

  if (!playlists.length) {
    return <p className="empty-state">No playlists are available right now.</p>;
  }

  return (
    <div className={playlistBrowserClassName}>
      <div className={playlistListClassName}>
        {playlists.map((playlist) => (
          <button
            key={playlist.id}
            type="button"
            className={`${playlistCardBaseClassName}${playlist.id === activePlaylist?.id ? playlistCardActiveClassName : ''}`}
            onClick={() => onSelectPlaylist?.(playlist.id)}
          >
            <strong className="tw-block">{playlist.title}</strong>
            <span className="tw-text-muted">{playlist.tracks.length} track{playlist.tracks.length === 1 ? '' : 's'}</span>
            <p className="tw-m-0 tw-mt-2 tw-text-muted">{playlist.description}</p>
          </button>
        ))}
      </div>

      <div className={playlistDetailClassName}>
        {activePlaylist ? (
          <>
            <div className={playlistHeaderClassName}>
              <div>
                <h4 className={playlistTitleClassName}>{activePlaylist.title}</h4>
                <p className={playlistDescriptionClassName}>{activePlaylist.description}</p>
              </div>
            </div>
            <div className={playlistTrackListClassName}>
              {activePlaylist.tracks.length === 0 ? (
                <p className="empty-state">This playlist is empty right now.</p>
              ) : (
                <>
                  <TrackList
                    tracks={visibleTracks}
                    variant="standard"
                    showAlbum
                    onPlay={onPlayTrack}
                    onFavorite={onFavoriteTrack}
                    onAddQueue={onAddTrackToQueue}
                    onArtistClick={onArtistClick}
                  />
                  {activePlaylist.tracks.length > limit ? (
                    <p className={renderLimitNoticeClassName}>Showing {limit} of {activePlaylist.tracks.length} tracks. Use search or select fewer folders to narrow this view.</p>
                  ) : null}
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
