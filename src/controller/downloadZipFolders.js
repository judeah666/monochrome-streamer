export function normalizeDownloadDiscNumber(value) {
  const discNumber = Number.parseInt(String(value || '').trim(), 10);
  return Number.isFinite(discNumber) && discNumber > 0 ? discNumber : 1;
}

export function appendDiscFolder(folder, discNumber) {
  const cleanFolder = String(folder || '').replace(/\/+$/u, '');
  const discFolder = `CD${normalizeDownloadDiscNumber(discNumber)}`;
  return cleanFolder ? `${cleanFolder}/${discFolder}` : discFolder;
}

export function createZipFolderResolver(tracks = [], {
  getBaseFolder = () => '',
  getDiscNumber = (track) => track?.discNumber,
} = {}) {
  const discsByFolder = new Map();

  for (const track of Array.isArray(tracks) ? tracks : []) {
    const baseFolder = String(getBaseFolder(track) || '');
    const discNumber = normalizeDownloadDiscNumber(getDiscNumber(track));
    if (!discsByFolder.has(baseFolder)) {
      discsByFolder.set(baseFolder, new Set());
    }
    discsByFolder.get(baseFolder).add(discNumber);
  }

  const multiDiscFolders = new Set();
  for (const [baseFolder, discNumbers] of discsByFolder.entries()) {
    if (discNumbers.size > 1 || [...discNumbers].some((discNumber) => discNumber > 1)) {
      multiDiscFolders.add(baseFolder);
    }
  }

  return (track) => {
    const baseFolder = String(getBaseFolder(track) || '');
    if (!multiDiscFolders.has(baseFolder)) return baseFolder;
    return appendDiscFolder(baseFolder, getDiscNumber(track));
  };
}
