import React, { useEffect, useId, useState } from 'react';

const NEW_PLAYLIST_VALUE = 'new';

export function PlaylistDialog({
  mode = 'create',
  playlists = [],
  trackTitle = '',
  busy = false,
  status = '',
  onClose,
  onCreate,
  onAdd,
}) {
  const titleId = useId();
  const selectId = useId();
  const [selection, setSelection] = useState(playlists[0]?.id || NEW_PLAYLIST_VALUE);
  const [name, setName] = useState('');

  useEffect(() => {
    setSelection((currentSelection) => {
      if (mode === 'create') return NEW_PLAYLIST_VALUE;
      if (currentSelection === NEW_PLAYLIST_VALUE) return currentSelection;
      return playlists.some((playlist) => playlist.id === currentSelection)
        ? currentSelection
        : (playlists[0]?.id || NEW_PLAYLIST_VALUE);
    });
  }, [mode, playlists]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [busy, onClose]);

  const creating = mode === 'create' || selection === NEW_PLAYLIST_VALUE;
  const selectedPlaylist = playlists.find((playlist) => playlist.id === selection);
  const submit = (event) => {
    event.preventDefault();
    if (creating) onCreate?.(name);
    else onAdd?.(selection);
  };

  return (
    <div className="playlist-dialog-content" role="document">
      <header className="playlist-dialog-header">
        <div>
          <span className="eyebrow">Playlist</span>
          <h2 id={titleId}>{mode === 'create' ? 'New Playlist' : 'Add to Playlist'}</h2>
          {trackTitle ? <p>Add “{trackTitle}” to one playlist.</p> : null}
        </div>
        <button type="button" className="icon-button" aria-label="Close playlist dialog" onClick={onClose} disabled={busy}>
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </header>
      <form className="playlist-dialog-form" onSubmit={submit}>
        {mode === 'add' ? (
          <div className="playlist-select-group">
            <label className="playlist-select-field" htmlFor={selectId}>
              <span>Choose a playlist</span>
              <select
                id={selectId}
                name="playlist"
                value={creating ? '' : selection}
                disabled={busy || playlists.length === 0}
                autoFocus={!creating}
                onChange={(event) => setSelection(event.target.value)}
              >
                <option value="" disabled>{playlists.length === 0 ? 'No playlists yet' : 'Choose a playlist'}</option>
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name} ({playlist.trackCount} track{playlist.trackCount === 1 ? '' : 's'})
                  </option>
                ))}
              </select>
              {selectedPlaylist ? (
                <small>{selectedPlaylist.trackCount} track{selectedPlaylist.trackCount === 1 ? '' : 's'} currently in this playlist</small>
              ) : null}
            </label>
            <button
              type="button"
              className="secondary-button playlist-create-option"
              disabled={busy}
              onClick={() => setSelection(NEW_PLAYLIST_VALUE)}
            >
              <i className="fa-solid fa-plus" aria-hidden="true" /> Create a new playlist
            </button>
          </div>
        ) : null}
        {creating ? (
          <label className="playlist-name-field">
            <span>Playlist name</span>
            <input
              type="text"
              value={name}
              maxLength={100}
              autoFocus={creating}
              required
              disabled={busy}
              onChange={(event) => setName(event.target.value)}
              placeholder="My playlist"
            />
          </label>
        ) : null}
        {status ? <p className="playlist-dialog-status" role="status">{status}</p> : null}
        <footer className="playlist-dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="primary-button" disabled={busy || (creating && !name.trim())}>
            {busy ? 'Saving...' : creating ? 'Create Playlist' : 'Add Track'}
          </button>
        </footer>
      </form>
    </div>
  );
}
