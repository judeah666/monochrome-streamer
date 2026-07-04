export function createAlbumCardView(album, {
  getAlbumMediaTypes = () => [],
  isWishlistAlbum = () => false,
} = {}) {
  const albumArtist = album.albumArtist || album.artist || 'Unknown artist';
  return {
    id: album.id,
    title: album.title || 'Untitled album',
    artist: albumArtist,
    albumArtist,
    year: album.year || 'Unknown year',
    status: album.status || 'Collection',
    mediaTypes: getAlbumMediaTypes(album),
    audioQuality: album.audioQuality || null,
    coverUrl: album.coverUrl || '',
    wishlist: isWishlistAlbum(album),
  };
}

export function createTrackRowView(track, {
  isFavoriteTrack = () => false,
  currentTrackId = '',
  playing = false,
  getTrackFolderPath = () => '',
} = {}) {
  return {
    id: track.id,
    title: track.title || 'Untitled track',
    artist: track.artist || 'Unknown artist',
    album: track.album || 'Unknown album',
    trackNumber: track.trackNumber,
    discNumber: track.discNumber || 1,
    folderPath: getTrackFolderPath(track.relativePath || ''),
    coverUrl: track.coverUrl || '',
    favorite: isFavoriteTrack(track.id),
    playing: track.id === currentTrackId && playing,
    active: track.id === currentTrackId,
  };
}

export function buildAlbumDetailSnapshot({
  album = null,
  albumTracks = [],
  searchTerm = '',
  sameArtistAlbums = [],
  relatedAlbumLimit = 50,
  favorite = false,
  shareCopied = false,
  downloadActive = false,
  downloadBusy = false,
  playing = false,
  currentTrackId = '',
  helpers = {},
} = {}) {
  if (!album) return { album: null };

  const {
    trackMatchesSearch = () => true,
    partitionAlbums = (albums) => [[], albums],
    getAlbumFolderPath = () => '',
    getAlbumMediaTypes = () => [],
    isWishlistAlbum = () => false,
    isFavoriteTrack = () => false,
    getTrackFolderPath = () => '',
  } = helpers;

  const filteredTracks = albumTracks.filter((track) => trackMatchesSearch(track, searchTerm));
  const heroTrack = albumTracks[0] ?? null;
  const [epAlbums, fullAlbums] = partitionAlbums(sameArtistAlbums);
  const trackCountLabel = `${albumTracks.length} track${albumTracks.length === 1 ? '' : 's'}`;
  const albumFacts = [album.year || ''];
  const meta = [
    ...albumFacts,
    trackCountLabel,
    searchTerm ? `filtered by "${searchTerm}"` : '',
  ].filter(Boolean).join(' • ');

  return {
    album: {
      id: album.id,
      title: album.title,
      artist: album.albumArtist || album.artist,
      albumArtist: album.albumArtist || album.artist,
      coverUrl: album.fullCoverUrl || album.coverUrl || heroTrack?.coverUrl || '',
      coverBackdrop: album.fullCoverUrl || album.coverUrl || heroTrack?.coverUrl || '',
      folder: getAlbumFolderPath(albumTracks),
      mediaTypes: getAlbumMediaTypes(album),
      audioQuality: album.audioQuality || null,
      wishlist: isWishlistAlbum(album),
      meta,
    },
    tracks: filteredTracks.map((track) => createTrackRowView(track, {
      isFavoriteTrack,
      currentTrackId,
      playing,
      getTrackFolderPath,
    })),
    relatedAlbums: fullAlbums.slice(0, relatedAlbumLimit).map((candidate) => createAlbumCardView(candidate, {
      getAlbumMediaTypes,
      isWishlistAlbum,
    })),
    epAlbums: epAlbums.slice(0, relatedAlbumLimit).map((candidate) => createAlbumCardView(candidate, {
      getAlbumMediaTypes,
      isWishlistAlbum,
    })),
    favorite,
    shareCopied,
    downloadActive,
    downloadBusy,
    canQueue: albumTracks.length > 0,
  };
}
