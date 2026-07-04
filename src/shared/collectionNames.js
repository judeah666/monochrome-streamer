export function parseCollectionNames(value) {
  const seen = new Set();
  const names = [];

  for (const part of String(value || '').split(/[,\t\u001f]+/u)) {
    const name = normalizeCollectionNamePart(part);
    if (!name) continue;
    const key = normalizeCollectionNameKey(name);
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }

  return names;
}

export function normalizeCollectionNamePart(value) {
  return String(value || '').trim().replace(/\s+/gu, ' ');
}

export function normalizeCollectionNameKey(value) {
  return normalizeCollectionNamePart(value).toLowerCase();
}

export function replaceCollectionName(rawValue, fromName, toName = '') {
  const sourceKey = normalizeCollectionNameKey(fromName);
  if (!sourceKey) return normalizeCollectionNamePart(rawValue);

  const cleanToName = normalizeCollectionNamePart(toName);
  const nextNames = [];
  const seen = new Set();
  for (const name of parseCollectionNames(rawValue)) {
    const replacement = normalizeCollectionNameKey(name) === sourceKey ? cleanToName : name;
    if (!replacement) continue;
    const key = normalizeCollectionNameKey(replacement);
    if (seen.has(key)) continue;
    seen.add(key);
    nextNames.push(replacement);
  }
  return nextNames.join(', ');
}
