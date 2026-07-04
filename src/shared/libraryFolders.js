export function normalizeLibraryFolderList(folders = []) {
  const seen = new Set();
  const normalizedFolders = [];

  for (const folder of Array.isArray(folders) ? folders : []) {
    const value = typeof folder === 'string'
      ? folder
      : folder?.path || folder?.value || folder?.name || folder?.label || '';
    const normalized = String(value || '')
      .replaceAll('\\', '/')
      .replace(/^\/+|\/+$/gu, '')
      .trim();
    if (!normalized || normalized.includes('..') || seen.has(normalized)) continue;
    seen.add(normalized);
    normalizedFolders.push(normalized);
  }

  return normalizedFolders.sort((left, right) => left.localeCompare(right));
}

export function mergeDiscoveredLibraryFolders({ available = [], selected = [], known = [] } = {}) {
  const normalizedAvailable = normalizeLibraryFolderList(available);
  const normalizedSelected = normalizeLibraryFolderList(selected);
  const normalizedKnown = normalizeLibraryFolderList(known);
  const knownSet = new Set(normalizedKnown);
  const added = normalizedKnown.length > 0
    ? normalizedAvailable.filter((folder) => !knownSet.has(folder))
    : [];
  const merged = normalizeLibraryFolderList([...normalizedSelected, ...added]);
  const knownNext = normalizeLibraryFolderList([...normalizedKnown, ...normalizedAvailable]);

  return {
    available: normalizedAvailable,
    selected: normalizedSelected,
    known: normalizedKnown,
    added,
    merged,
    knownNext,
    knownChanged: knownNext.length !== normalizedKnown.length
      || knownNext.some((folder, index) => folder !== normalizedKnown[index]),
  };
}
