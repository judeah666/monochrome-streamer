export function buildEditorModalSnapshot({
  eyebrow = '',
  title = '',
  titleId = '',
  caption = '',
  closeButtonId = '',
  closeLabel = 'Close editor',
  bodyRootId = '',
  bodyRootClassName = '',
  resetButtonId = '',
  resetLabel = 'Reset',
  cancelButtonId = '',
  cancelLabel = 'Cancel',
  saveButtonId = '',
  saveLabel = 'Save',
} = {}) {
  return {
    eyebrow,
    title,
    titleId,
    caption,
    closeButtonId,
    closeLabel,
    bodyRootId,
    bodyRootClassName,
    resetButtonId,
    resetLabel,
    cancelButtonId,
    cancelLabel,
    saveButtonId,
    saveLabel,
  };
}

export function buildArtistEditorModalSnapshot(artistName = 'Artist') {
  return buildEditorModalSnapshot({
    eyebrow: 'Artist Editor',
    title: `Edit ${artistName}`,
    titleId: 'artist-editor-title',
    caption: 'Add an artist image and local profile info.',
    closeButtonId: 'artist-editor-close-button',
    closeLabel: 'Close artist editor',
    bodyRootId: 'artist-editor-body-root',
    resetButtonId: 'artist-editor-reset-button',
    resetLabel: 'Clear edited info',
    cancelButtonId: 'artist-editor-cancel-button',
    saveButtonId: 'artist-editor-save-button',
    saveLabel: 'Save artist',
  });
}

export function buildArtistEditorBodySnapshot(info = {}) {
  return {
    imageUrl: info?.imageUrl || '',
    bio: info?.bio || '',
    sourceUrl: info?.sourceUrl || '',
  };
}

export function buildTagEditorModalSnapshot(albumTitle = 'Album') {
  return buildEditorModalSnapshot({
    eyebrow: 'Album Tag Editor',
    title: `Edit ${albumTitle}`,
    titleId: 'tag-editor-title',
    caption: 'These edits are saved as local overrides. Your original audio files are not rewritten.',
    closeButtonId: 'tag-editor-close-button',
    closeLabel: 'Close tag editor',
    bodyRootId: 'tag-editor-body-root',
    resetButtonId: 'tag-editor-reset-button',
    resetLabel: 'Reset overrides',
    cancelButtonId: 'tag-editor-cancel-button',
    saveButtonId: 'tag-editor-save-button',
    saveLabel: 'Save tags',
  });
}

export function buildAddAlbumModalSnapshot() {
  return buildEditorModalSnapshot({
    eyebrow: 'Wishlist Album',
    title: 'Add Album',
    titleId: 'tag-editor-title',
    caption: 'Create a wishlist album manually. These details are saved locally and do not rewrite audio files.',
    closeButtonId: 'tag-editor-close-button',
    closeLabel: 'Close tag editor',
    bodyRootId: 'tag-editor-body-root',
    resetButtonId: 'tag-editor-reset-button',
    resetLabel: 'Clear form',
    cancelButtonId: 'tag-editor-cancel-button',
    saveButtonId: 'tag-editor-save-button',
    saveLabel: 'Add album',
  });
}

export function buildTagEditorBodySnapshot(album, tracks = [], { extractYear = () => '' } = {}) {
  return {
    title: album.title || '',
    albumArtist: album.albumArtist || album.artist || '',
    year: album.year || extractYear(album.date) || '',
    genre: album.genre || '',
    collectionName: album.collectionName || '',
    mediaTypes: album.mediaTypes || album.mediaType || ['Digital Media'],
    status: album.status || 'Collection',
    coverUrl: album.customCoverUrl || album.coverUrl || '',
    searchQuery: `${album.albumArtist || album.artist || ''} ${album.title || ''}`.trim(),
    scraperStatus: 'Search MusicBrainz to fill this album automatically.',
    tracks,
  };
}

export function buildAddAlbumBodySnapshot() {
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
    scraperStatus: 'Search MusicBrainz to fill this wishlist album automatically.',
    tracks: [],
  };
}

export function buildLyricsEditorModalSnapshot(track) {
  return buildEditorModalSnapshot({
    eyebrow: 'Lyrics Editor',
    title: `Lyrics for ${track.title}`,
    titleId: 'lyrics-editor-title',
    caption: `${track.artist} • ${track.album}`,
    closeButtonId: 'lyrics-editor-close-button',
    closeLabel: 'Close lyrics editor',
    bodyRootId: 'lyrics-editor-body-root',
    bodyRootClassName: 'tag-editor-body lyrics-editor-body',
    resetButtonId: 'lyrics-editor-reset-button',
    resetLabel: 'Reset lyrics',
    cancelButtonId: 'lyrics-editor-cancel-button',
    saveButtonId: 'lyrics-editor-save-button',
    saveLabel: 'Save lyrics',
  });
}

export function buildLyricsEditorBodySnapshot(track, lyrics = {}) {
  return {
    query: `${track.artist} ${track.title}`,
    syncedLyrics: lyrics?.syncedLyrics || '',
    plainLyrics: lyrics?.plainLyrics || '',
    status: 'Search LRCLIB for synced or plain lyrics.',
  };
}
