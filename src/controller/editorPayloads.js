export function buildArtistInfoPayload({ imageUrl = '', bio = '', sourceUrl = '' } = {}) {
  return {
    imageUrl: String(imageUrl || '').trim(),
    bio: String(bio || '').trim(),
    sourceUrl: String(sourceUrl || '').trim(),
  };
}

export function buildTagEditorPayload({
  albumTitle = '',
  albumArtist = '',
  date = '',
  genre = '',
  collectionName = '',
  mediaTypes = ['Digital Media'],
  status = 'Collection',
  coverUrl = '',
  coverDataUrl = '',
  coverFilename = '',
  musicBrainzId = '',
  tracks,
} = {}) {
  const normalizedDate = String(date || '').trim();
  const payload = {
    albumTitle: String(albumTitle || '').trim(),
    albumArtist: String(albumArtist || '').trim(),
    date: normalizedDate,
    year: normalizedDate,
    genre: String(genre || '').trim(),
    collectionName: String(collectionName || '').trim(),
    mediaTypes,
    status: status || 'Collection',
    coverUrl: String(coverUrl || '').trim(),
    musicBrainzId,
  };
  const uploadedCoverDataUrl = String(coverDataUrl || '').trim();
  if (uploadedCoverDataUrl) {
    payload.coverDataUrl = uploadedCoverDataUrl;
    payload.coverFilename = String(coverFilename || '').trim();
  }
  if (Array.isArray(tracks)) {
    payload.tracks = tracks;
  }
  return payload;
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
