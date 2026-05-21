import React from 'react';
import { TrackList } from './TrackList.jsx';

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
    <div className="playlist-browser">
      <div className="playlist-list">
        {playlists.map((playlist) => (
          <button
            key={playlist.id}
            type="button"
            className={`playlist-card${playlist.id === activePlaylist?.id ? ' is-active' : ''}`}
            onClick={() => onSelectPlaylist?.(playlist.id)}
          >
            <strong>{playlist.title}</strong>
            <span>{playlist.tracks.length} track{playlist.tracks.length === 1 ? '' : 's'}</span>
            <p>{playlist.description}</p>
          </button>
        ))}
      </div>

      <div className="playlist-detail">
        {activePlaylist ? (
          <>
            <div className="playlist-detail-header">
              <div>
                <h4>{activePlaylist.title}</h4>
                <p>{activePlaylist.description}</p>
              </div>
            </div>
            <div className="track-list">
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
                    <p className="render-limit-notice">Showing {limit} of {activePlaylist.tracks.length} tracks. Use search or select fewer folders to narrow this view.</p>
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
