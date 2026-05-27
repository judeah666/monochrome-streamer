export function buildLibraryFilterSnapshot({
  alphabetFilters = [],
  activeLetter = 'all',
  mediaTypeIcons = {},
  activeMediaTypes = [],
  showMediaType = true,
} = {}) {
  return {
    alphabetFilters,
    activeLetter,
    mediaTypes: Object.entries(mediaTypeIcons).map(([value, icon]) => ({ value, icon })),
    activeMediaTypes: [...activeMediaTypes],
    showMediaType,
  };
}

export function buildLibraryPagerSnapshot({
  page = {},
  total = 0,
  itemLabel = 'item',
  showPageSize = false,
} = {}) {
  return {
    page,
    total,
    itemLabel,
    showPageSize,
  };
}

export function buildAlbumCollectionSnapshot({
  albums = [],
  emptyMessage = 'No albums found.',
  compact = false,
  wrapGrid = false,
  filterProps = null,
  pagerProps = null,
  prepareAlbum,
} = {}) {
  return {
    albums: albums.map(prepareAlbum),
    emptyMessage,
    compact,
    wrapGrid,
    showFilter: Boolean(filterProps),
    showPager: Boolean(pagerProps),
    ...(filterProps || {}),
    ...(pagerProps || {}),
  };
}

export function buildTrackCollectionSnapshot({
  tracks = [],
  total = tracks.length,
  limit = 160,
  emptyMessage = 'No tracks yet.',
  variant = 'standard',
  showAlbum = true,
  prepareTrack,
} = {}) {
  return {
    tracks: tracks.map(prepareTrack),
    total,
    limit,
    emptyMessage,
    variant,
    showAlbum,
  };
}

export function buildLibraryArtistsPanelSnapshot({
  artists = [],
  filterProps = {},
  pagerProps = {},
  emptyMessage = 'No artists matched this filter.',
  prepareArtist,
} = {}) {
  return {
    artists: artists.map(prepareArtist),
    filterProps,
    pagerProps,
    emptyMessage,
  };
}

export function buildLibraryTracksPanelSnapshot({
  tracks = [],
  searchTerm = '',
  filterProps = {},
  pagerProps = {},
  prepareTrack,
} = {}) {
  return {
    tracks: tracks.map(prepareTrack),
    searchTerm,
    filterProps,
    pagerProps,
  };
}
