export function hasFavorite(favoriteIds, id) {
  return favoriteIds.has(id);
}

export function toggleFavoriteId(favoriteIds, validIds, id) {
  if (!validIds.has(id)) return false;
  if (favoriteIds.has(id)) {
    favoriteIds.delete(id);
  } else {
    favoriteIds.add(id);
  }
  return true;
}

export function addFavoriteIds(favoriteIds, validIds, ids) {
  let changed = false;
  for (const id of ids) {
    if (!validIds.has(id) || favoriteIds.has(id)) continue;
    favoriteIds.add(id);
    changed = true;
  }
  return changed;
}
