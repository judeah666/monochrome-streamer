import { normalizeLibraryFolderList } from '../shared/libraryFolders.js';

const SCAN_MODES = new Set(['changes', 'folders', 'full']);

export function resolveLibraryScanRequest(payload = {}, selectedFolders = [], availableFolders = null) {
  const selected = normalizeLibraryFolderList(selectedFolders);
  const mode = String(payload?.mode || 'full').trim().toLowerCase();
  if (!SCAN_MODES.has(mode)) {
    throw new Error('Scan mode must be changes, folders, or full.');
  }

  if (mode !== 'folders') {
    return {
      mode,
      selectedFolders: selected,
      scanFolders: selected,
      forceMetadataRefresh: mode === 'full',
      targeted: false,
    };
  }

  const requested = normalizeLibraryFolderList(payload.folders);
  if (requested.length === 0) {
    throw new Error('Choose at least one selected folder to scan.');
  }

  const selectedSet = new Set(selected);
  const invalid = requested.filter((folder) => !selectedSet.has(folder));
  if (invalid.length > 0) {
    throw new Error(`Scan folders must already be selected: ${invalid.join(', ')}.`);
  }
  if (Array.isArray(availableFolders)) {
    const availableSet = new Set(normalizeLibraryFolderList(availableFolders));
    const unavailable = requested.filter((folder) => !availableSet.has(folder));
    if (unavailable.length > 0) {
      throw new Error(`Scan folders are not currently available: ${unavailable.join(', ')}.`);
    }
  }

  return {
    mode,
    selectedFolders: selected,
    scanFolders: requested,
    forceMetadataRefresh: true,
    targeted: requested.length < selected.length,
  };
}
