export function buildArtistInfoPayload({ imageUrl = '', bio = '', sourceUrl = '' } = {}) {
  return {
    imageUrl: String(imageUrl || '').trim(),
    bio: String(bio || '').trim(),
    sourceUrl: String(sourceUrl || '').trim(),
  };
}

export function collectTagTrackRows(rows) {
  return [...rows].map((row) => ({
    id: row.dataset.trackId,
    title: row.querySelector('.tag-track-title').value.trim(),
    artist: row.querySelector('.tag-track-artist').value.trim(),
    trackNumber: row.querySelector('.tag-track-number').value.trim(),
    discNumber: row.dataset.discNumber || '1',
  }));
}

export function buildTagEditorPayload({
  albumTitle = '',
  albumArtist = '',
  date = '',
  genre = '',
  mediaTypes = ['Digital Media'],
  status = 'Collection',
  coverUrl = '',
  musicBrainzId = '',
  tracks = [],
} = {}) {
  const normalizedDate = String(date || '').trim();
  return {
    albumTitle: String(albumTitle || '').trim(),
    albumArtist: String(albumArtist || '').trim(),
    date: normalizedDate,
    year: normalizedDate,
    genre: String(genre || '').trim(),
    mediaTypes,
    status: status || 'Collection',
    coverUrl: String(coverUrl || '').trim(),
    musicBrainzId,
    tracks,
  };
}

export function buildLyricsPayload({ syncedInput = '', plainInput = '', parseSyncedLyrics }) {
  const syncedLyrics = String(syncedInput || '').trim();
  const plainLyrics = String(plainInput || '').trim();
  const plainHasTimestamps = !syncedLyrics && parseSyncedLyrics(plainLyrics).length > 0;
  return {
    syncedLyrics: plainHasTimestamps ? plainLyrics : syncedLyrics,
    plainLyrics: plainHasTimestamps ? '' : plainLyrics,
    source: 'manual',
  };
}
