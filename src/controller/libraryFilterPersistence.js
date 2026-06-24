const VALID_LETTERS = new Set(['all', '#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]);

function normalizeStringList(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

export function normalizeLibraryFilterState(value, { validMediaTypes = [] } = {}) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const rawLetter = String(source.letter || 'all');
  const normalizedLetter = rawLetter === '#' ? '#' : rawLetter.toUpperCase();
  const allowedMediaTypes = new Set(validMediaTypes);

  return {
    letter: VALID_LETTERS.has(normalizedLetter) ? normalizedLetter : 'all',
    mediaTypes: normalizeStringList(source.mediaTypes)
      .filter((mediaType) => allowedMediaTypes.size === 0 || allowedMediaTypes.has(mediaType)),
    folders: normalizeStringList(source.folders),
  };
}

export function readLibraryFilterState(storage, key, options = {}) {
  try {
    const rawValue = storage?.getItem?.(key);
    return normalizeLibraryFilterState(rawValue ? JSON.parse(rawValue) : {}, options);
  } catch {
    return normalizeLibraryFilterState({}, options);
  }
}

export function writeLibraryFilterState(storage, key, value, options = {}) {
  const normalized = normalizeLibraryFilterState(value, options);
  storage?.setItem?.(key, JSON.stringify(normalized));
  return normalized;
}
