export function getFolderFilterLabel(activeFolders = []) {
  const count = Array.isArray(activeFolders) ? activeFolders.length : 0;
  return count > 0 ? `Folders · ${count}` : 'All folders';
}

export function getAlphabetFilterLabel(activeLetter = 'all') {
  const value = String(activeLetter || 'all');
  return `A–Z · ${value.toLowerCase() === 'all' ? 'All' : value.toUpperCase()}`;
}
