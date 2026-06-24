import { existsSync, promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const FOLDER_INDEX_VERSION = 5;
const DATABASE_SCHEMA_VERSION = 2;
const SEARCH_INDEX_VERSION = '1';
const COLLECTION_INFERENCE_VERSION = '3';
const NATURAL_SORTER = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const SEARCH_INDEX_AVAILABILITY = new WeakMap();

export async function readLibraryDatabase(databasePath) {
  if (!databasePath || !existsSync(databasePath)) return createEmptyLibrary();

  const db = await openDatabase(databasePath);
  try {
    const generatedAt = getMetadata(db, 'generatedAt');
    const tracks = db.prepare('SELECT * FROM tracks ORDER BY artist, album, disc_number, track_number, title').all()
      .map(rowToTrack);
    const albums = db.prepare('SELECT * FROM albums ORDER BY artist, title').all()
      .map(rowToAlbum);

    return {
      generatedAt,
      trackCount: tracks.length,
      albumCount: albums.length,
      tracks,
      albums,
    };
  } finally {
    db.close();
  }
}

export async function readLibraryDatabaseSummary(databasePath) {
  if (!databasePath || !existsSync(databasePath)) return createEmptyLibrarySummary();

  const db = await openDatabase(databasePath);
  try {
    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
      albumCount: db.prepare('SELECT COUNT(*) AS count FROM albums').get().count || 0,
    };
  } finally {
    db.close();
  }
}

export async function readExcelAlbumExportRows(databasePath, options = {}) {
  if (!databasePath || !existsSync(databasePath)) return [];

  const db = await openDatabase(databasePath);
  try {
    const where = [];
    const params = {};
    addAlbumFolderFilter(where, params, options.folders, 'excelExport');
    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const rows = db.prepare(`
      SELECT
        albums.*,
        album_overrides.payload_json AS override_json,
        COUNT(DISTINCT album_tracks.track_id) AS track_count,
        GROUP_CONCAT(DISTINCT tracks.folder_path) AS folder_paths
      FROM albums
      LEFT JOIN album_tracks ON album_tracks.album_id = albums.id
      LEFT JOIN tracks ON tracks.id = album_tracks.track_id
      LEFT JOIN album_overrides ON album_overrides.album_id = albums.id
      ${whereSql}
      GROUP BY albums.id
      ORDER BY albums.artist, albums.title
    `).all(params);

    const exportRows = rows
      .map(rowToExcelAlbumExport)
      .filter((row) => matchesExcelExportOptions(row, options));

    const folderFiltered = normalizeFolderFilters(options.folders).length > 0;
    if (!folderFiltered) {
      const manualRows = db.prepare(`
        SELECT album_id, payload_json
        FROM album_overrides
        WHERE album_id NOT IN (SELECT id FROM albums)
        ORDER BY album_id
      `).all();
      exportRows.push(...manualRows
        .map(rowToManualExcelAlbumExport)
        .filter(Boolean)
        .filter((row) => matchesExcelExportOptions(row, options)));
    }

    return exportRows.sort(compareExcelAlbumExports);
  } finally {
    db.close();
  }
}

export async function readTrackFromDatabase(databasePath, trackId) {
  if (!databasePath || !existsSync(databasePath) || !trackId) return null;

  const db = await openDatabase(databasePath);
  try {
    const row = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId);
    return row ? rowToTrack(row) : null;
  } finally {
    db.close();
  }
}

export async function readPlaylists(databasePath, ownerKey) {
  if (!databasePath || !ownerKey) return [];

  const db = await openDatabase(databasePath);
  try {
    return db.prepare(`
      SELECT
        playlists.id,
        playlists.name,
        playlists.created_at,
        playlists.updated_at,
        COUNT(tracks.id) AS track_count
      FROM playlists
      LEFT JOIN playlist_tracks ON playlist_tracks.playlist_id = playlists.id
      LEFT JOIN tracks ON tracks.id = playlist_tracks.track_id
      WHERE playlists.owner_key = ?
      GROUP BY playlists.id
      ORDER BY playlists.updated_at DESC, playlists.name COLLATE NOCASE
    `).all(ownerKey).map(rowToPlaylistSummary);
  } finally {
    db.close();
  }
}

export async function readPlaylist(databasePath, ownerKey, playlistId) {
  if (!databasePath || !ownerKey || !playlistId) return null;

  const db = await openDatabase(databasePath);
  try {
    return readPlaylistFromConnection(db, ownerKey, playlistId);
  } finally {
    db.close();
  }
}

export async function createPlaylist(databasePath, ownerKey, playlistId, name) {
  if (!databasePath || !ownerKey || !playlistId) {
    throw createPlaylistDatabaseError('PLAYLIST_INVALID', 'Playlist details are incomplete.');
  }
  const cleanName = normalizePlaylistName(name);
  if (!cleanName) {
    throw createPlaylistDatabaseError('PLAYLIST_NAME_REQUIRED', 'Playlist name is required.');
  }
  if (cleanName.length > 100) {
    throw createPlaylistDatabaseError('PLAYLIST_NAME_TOO_LONG', 'Playlist name must be 100 characters or fewer.');
  }

  const db = await openDatabase(databasePath);
  try {
    const now = new Date().toISOString();
    try {
      db.prepare(`
        INSERT INTO playlists (
          id, owner_key, name, normalized_name, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(playlistId, ownerKey, cleanName, cleanName.toLowerCase(), now, now);
    } catch (error) {
      if (String(error?.message || '').includes('UNIQUE constraint failed')) {
        throw createPlaylistDatabaseError('PLAYLIST_NAME_EXISTS', 'A playlist with that name already exists.');
      }
      throw error;
    }
    return readPlaylistFromConnection(db, ownerKey, playlistId);
  } finally {
    db.close();
  }
}

export async function addPlaylistTrack(databasePath, ownerKey, playlistId, trackId) {
  if (!databasePath || !ownerKey || !playlistId || !trackId) {
    throw createPlaylistDatabaseError('PLAYLIST_INVALID', 'Playlist and track are required.');
  }

  const db = await openDatabase(databasePath);
  try {
    assertOwnedPlaylist(db, ownerKey, playlistId);
    if (!db.prepare('SELECT 1 FROM tracks WHERE id = ?').get(trackId)) {
      throw createPlaylistDatabaseError('TRACK_NOT_FOUND', 'Track not found.');
    }

    const existing = db.prepare(`
      SELECT 1 FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?
    `).get(playlistId, trackId);
    if (existing) {
      return { added: false, playlist: readPlaylistFromConnection(db, ownerKey, playlistId) };
    }

    const nextPosition = db.prepare(`
      SELECT COALESCE(MAX(position), -1) + 1 AS position
      FROM playlist_tracks
      WHERE playlist_id = ?
    `).get(playlistId).position;
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO playlist_tracks (playlist_id, track_id, position, added_at)
      VALUES (?, ?, ?, ?)
    `).run(playlistId, trackId, nextPosition, now);
    db.prepare('UPDATE playlists SET updated_at = ? WHERE id = ? AND owner_key = ?')
      .run(now, playlistId, ownerKey);
    return { added: true, playlist: readPlaylistFromConnection(db, ownerKey, playlistId) };
  } finally {
    db.close();
  }
}

export async function removePlaylistTrack(databasePath, ownerKey, playlistId, trackId) {
  if (!databasePath || !ownerKey || !playlistId || !trackId) {
    throw createPlaylistDatabaseError('PLAYLIST_INVALID', 'Playlist and track are required.');
  }

  const db = await openDatabase(databasePath);
  try {
    assertOwnedPlaylist(db, ownerKey, playlistId);
    const result = db.prepare(`
      DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?
    `).run(playlistId, trackId);
    if (result.changes > 0) {
      db.prepare('UPDATE playlists SET updated_at = ? WHERE id = ? AND owner_key = ?')
        .run(new Date().toISOString(), playlistId, ownerKey);
    }
    return {
      removed: result.changes > 0,
      playlist: readPlaylistFromConnection(db, ownerKey, playlistId),
    };
  } finally {
    db.close();
  }
}

export async function deletePlaylist(databasePath, ownerKey, playlistId) {
  if (!databasePath || !ownerKey || !playlistId) return false;

  const db = await openDatabase(databasePath);
  try {
    return db.prepare('DELETE FROM playlists WHERE id = ? AND owner_key = ?')
      .run(playlistId, ownerKey).changes > 0;
  } finally {
    db.close();
  }
}

export async function deletePlaylistsForOwner(databasePath, ownerKey) {
  if (!databasePath || !ownerKey) return 0;

  const db = await openDatabase(databasePath);
  try {
    return db.prepare('DELETE FROM playlists WHERE owner_key = ?').run(ownerKey).changes;
  } finally {
    db.close();
  }
}

export async function readLibraryAlbumPage(databasePath, options = {}) {
  if (!databasePath || !existsSync(databasePath)) {
    return {
      ...createEmptyLibrary(),
      lightweight: options.includeTracks === false,
      page: createPageInfo(options, 0),
    };
  }

  const db = await openDatabase(databasePath);
  try {
    const limit = clampLimit(options.limit);
    const offset = Math.max(0, Number.parseInt(options.offset || 0, 10) || 0);
    const search = cleanSearchValue(options.search);
    const letter = normalizeLetterFilter(options.letter);
    const restrictAlbumIds = Array.isArray(options.albumIds);
    const albumIds = restrictAlbumIds ? options.albumIds.filter(Boolean) : [];
    const excludeAlbumIds = Array.isArray(options.excludeAlbumIds) ? options.excludeAlbumIds.filter(Boolean) : [];
    const where = [];
    const params = {};

    if (restrictAlbumIds && albumIds.length === 0) {
      return {
        generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
      albumCount: 0,
      tracks: [],
      albums: [],
      lightweight: options.includeTracks === false,
      page: createPageInfo(options, 0),
    };
  }

    addIndexedSearchFilter(db, where, params, 'albums', ['title', 'artist', 'album_artist', 'collection_name', 'year'], search, 'albumSearch');
    addLetterFilter(where, params, 'title', letter);

    if (albumIds.length > 0) {
      where.push(`id IN (${albumIds.map((_, index) => `$albumId${index}`).join(', ')})`);
      albumIds.forEach((albumId, index) => {
        params[`$albumId${index}`] = albumId;
      });
    }

    if (excludeAlbumIds.length > 0) {
      where.push(`id NOT IN (${excludeAlbumIds.map((_, index) => `$excludeAlbumId${index}`).join(', ')})`);
      excludeAlbumIds.forEach((albumId, index) => {
        params[`$excludeAlbumId${index}`] = albumId;
      });
    }

    addAlbumFolderFilter(where, params, options.folders, 'library');

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const totalAlbums = db.prepare(`SELECT COUNT(*) AS count FROM albums ${whereSql}`).get(params).count || 0;
    const rows = db.prepare(`
      SELECT * FROM albums
      ${whereSql}
      ORDER BY artist, title
      LIMIT $limit OFFSET $offset
    `).all({
      ...params,
      $limit: limit,
      $offset: offset,
    });

    const albumsWithRows = rows.map(rowToAlbum);
    const albums = attachCoverTracksForCardPage(
      db,
      shouldIncludePageTracks(options) ? hydrateAlbumTrackIds(db, albumsWithRows) : albumsWithRows,
      options,
    );
    const tracks = shouldIncludePageTracks(options)
      ? readTracksByIds(db, albums.flatMap((album) => album.trackIds || []))
      : [];

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
      albumCount: totalAlbums,
      tracks,
      albums,
      lightweight: !shouldIncludePageTracks(options),
      page: createPageInfo({ limit, offset, search }, totalAlbums),
    };
  } finally {
    db.close();
  }
}

export async function readCollectionAlbumPage(databasePath, options = {}) {
  if (!databasePath || !existsSync(databasePath)) {
    return {
      ...createEmptyLibrary(),
      lightweight: options.includeTracks === false,
      page: createPageInfo(options, 0),
    };
  }

  const db = await openDatabase(databasePath);
  try {
    const limit = clampLimit(options.limit);
    const offset = Math.max(0, Number.parseInt(options.offset || 0, 10) || 0);
    const search = cleanSearchValue(options.search);
    const letter = normalizeLetterFilter(options.letter);
    const restrictAlbumIds = Array.isArray(options.albumIds);
    const albumIds = restrictAlbumIds ? options.albumIds.filter(Boolean) : [];
    const excludeAlbumIds = Array.isArray(options.excludeAlbumIds) ? options.excludeAlbumIds.filter(Boolean) : [];
    const where = [
      `EXISTS (
        SELECT 1
        FROM album_tracks
        INNER JOIN tracks ON tracks.id = album_tracks.track_id
        WHERE album_tracks.album_id = albums.id
          AND LOWER(tracks.folder_path) LIKE '%album%'
          AND LOWER(tracks.folder_path) LIKE '%collection%'
      )`,
    ];
    const params = {};

    if (restrictAlbumIds && albumIds.length === 0) {
      return {
        generatedAt: getMetadata(db, 'generatedAt'),
        trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
        albumCount: 0,
        tracks: [],
        albums: [],
        lightweight: options.includeTracks === false,
        page: createPageInfo(options, 0),
      };
    }

    addIndexedSearchFilter(db, where, params, 'albums', ['title', 'artist', 'album_artist', 'collection_name', 'year'], search, 'collectionSearch');
    addLetterFilter(where, params, 'title', letter);

    if (albumIds.length > 0) {
      where.push(`id IN (${albumIds.map((_, index) => `$albumId${index}`).join(', ')})`);
      albumIds.forEach((albumId, index) => {
        params[`$albumId${index}`] = albumId;
      });
    }

    if (excludeAlbumIds.length > 0) {
      where.push(`id NOT IN (${excludeAlbumIds.map((_, index) => `$excludeAlbumId${index}`).join(', ')})`);
      excludeAlbumIds.forEach((albumId, index) => {
        params[`$excludeAlbumId${index}`] = albumId;
      });
    }

    addAlbumFolderFilter(where, params, options.folders, 'collection');

    const whereSql = `WHERE ${where.join(' AND ')}`;
    const totalAlbums = db.prepare(`SELECT COUNT(*) AS count FROM albums ${whereSql}`).get(params).count || 0;
    const rows = db.prepare(`
      SELECT * FROM albums
      ${whereSql}
      ORDER BY artist, title
      LIMIT $limit OFFSET $offset
    `).all({
      ...params,
      $limit: limit,
      $offset: offset,
    });

    const albums = attachCoverTracksForCardPage(db, rows.map(rowToAlbum), options);
    const tracks = shouldIncludePageTracks(options)
      ? readTracksByIds(db, albums.flatMap((album) => album.trackIds || []))
      : [];

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
      albumCount: totalAlbums,
      tracks,
      albums,
      lightweight: !shouldIncludePageTracks(options),
      page: createPageInfo({ limit, offset, search }, totalAlbums),
    };
  } finally {
    db.close();
  }
}

export async function readCollectionFolders(databasePath, options = {}) {
  if (!databasePath || !existsSync(databasePath)) {
    return { generatedAt: null, folders: [] };
  }

  const db = await openDatabase(databasePath);
  try {
    const search = cleanSearchValue(options.search);
    const params = {};
    const where = ["collection_name != ''"];
    addIndexedSearchFilter(db, where, params, 'albums', ['collection_name'], search, 'collectionNameSearch');
    addAlbumFolderFilter(where, params, options.folders, 'collectionList');

    const rows = db.prepare(`
      SELECT
        collection_name,
        COUNT(*) AS album_count,
        GROUP_CONCAT(id, char(31)) AS album_ids,
        (
          SELECT cover_track_id
          FROM albums AS cover_album
          WHERE cover_album.collection_name = albums.collection_name
            AND cover_album.cover_track_id != ''
          ORDER BY cover_album.artist, cover_album.title
          LIMIT 1
        ) AS cover_track_id
      FROM albums
      WHERE ${where.join(' AND ')}
      GROUP BY collection_name
      ORDER BY collection_name
    `).all(params);

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      folders: rows.map((row) => ({
        path: row.collection_name,
        name: row.collection_name,
        parentPath: '',
        albumCount: row.album_count || 0,
        trackCount: row.album_count || 0,
        coverTrackId: row.cover_track_id || '',
        albumIds: String(row.album_ids || '').split('\u001f').filter(Boolean),
      })),
    };
  } finally {
    db.close();
  }
}

function normalizeCollectionKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/gu, ' ');
}

async function updateCollectionName(databasePath, fromName, toName) {
  if (!databasePath || !existsSync(databasePath)) {
    return { updated: 0 };
  }

  const sourceKey = normalizeCollectionKey(fromName);
  if (!sourceKey) {
    return { updated: 0 };
  }

  const cleanToName = String(toName || '').trim();
  const db = await openDatabase(databasePath);
  try {
    const rows = db.prepare(`
      SELECT id, collection_name
      FROM albums
      WHERE collection_name != ''
    `).all();
    const matches = rows.filter((row) => normalizeCollectionKey(row.collection_name) === sourceKey);
    if (matches.length === 0) {
      return { updated: 0 };
    }

    const updateAlbum = db.prepare('UPDATE albums SET collection_name = ? WHERE id = ?');
    db.exec('BEGIN');
    try {
      for (const item of matches) {
        updateAlbum.run(cleanToName, item.id);
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }

    return { updated: matches.length };
  } finally {
    db.close();
  }
}

export async function renameCollectionInDatabase(databasePath, fromName, toName) {
  return updateCollectionName(databasePath, fromName, toName);
}

export async function deleteCollectionInDatabase(databasePath, name) {
  return updateCollectionName(databasePath, name, '');
}

export async function readCollectionFolderAlbumPage(databasePath, folderPath, options = {}) {
  if (!databasePath || !existsSync(databasePath) || !folderPath) {
    return {
      ...createEmptyLibrary(),
      lightweight: options.includeTracks === false,
      page: createPageInfo(options, 0),
    };
  }

  const db = await openDatabase(databasePath);
  try {
    const collectionName = String(folderPath || '').trim();
    const limit = clampLimit(options.limit);
    const offset = Math.max(0, Number.parseInt(options.offset || 0, 10) || 0);
    const search = cleanSearchValue(options.search);
    const letter = normalizeLetterFilter(options.letter);
    const restrictAlbumIds = Array.isArray(options.albumIds);
    const albumIds = restrictAlbumIds ? options.albumIds.filter(Boolean) : [];
    const includeAlbumIds = Array.isArray(options.includeAlbumIds) ? options.includeAlbumIds.filter(Boolean) : [];
    const excludeAlbumIds = new Set(Array.isArray(options.excludeAlbumIds) ? options.excludeAlbumIds.filter(Boolean) : []);
    const where = ['collection_name = $collectionName COLLATE NOCASE'];
    const params = {
      $collectionName: collectionName,
    };

    if (includeAlbumIds.length > 0) {
      where[0] = `(${where[0]} OR id IN (${includeAlbumIds.map((_, index) => `$includeAlbumId${index}`).join(', ')}))`;
      includeAlbumIds.forEach((albumId, index) => {
        params[`$includeAlbumId${index}`] = albumId;
      });
    }
    if (restrictAlbumIds) {
      if (albumIds.length === 0) {
        return {
          generatedAt: getMetadata(db, 'generatedAt'),
          trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
          albumCount: 0,
          tracks: [],
          albums: [],
          lightweight: options.includeTracks === false,
          page: createPageInfo(options, 0),
        };
      }
      where.push(`id IN (${albumIds.map((_, index) => `$albumId${index}`).join(', ')})`);
      albumIds.forEach((albumId, index) => {
        params[`$albumId${index}`] = albumId;
      });
    }
    if (excludeAlbumIds.size > 0) {
      const excludeList = [...excludeAlbumIds];
      where.push(`id NOT IN (${excludeList.map((_, index) => `$excludeAlbumId${index}`).join(', ')})`);
      excludeList.forEach((albumId, index) => {
        params[`$excludeAlbumId${index}`] = albumId;
      });
    }
    addIndexedSearchFilter(db, where, params, 'albums', ['title', 'artist', 'album_artist', 'collection_name', 'year'], search, 'collectionFolderSearch');
    addLetterFilter(where, params, 'title', letter);
    addAlbumFolderFilter(where, params, options.folders, 'collectionFolder');

    const whereSql = `WHERE ${where.join(' AND ')}`;
    const rows = db.prepare(`
      SELECT * FROM albums
      ${whereSql}
      ORDER BY artist, title
    `).all(params);
    const allAlbums = rows.map(rowToAlbum).sort(compareAlbumsNaturally);
    const totalAlbums = allAlbums.length;
    const pageAlbums = attachCoverTracksForCardPage(db, allAlbums.slice(offset, offset + limit), options);
    const pageTracks = shouldIncludePageTracks(options)
      ? readTracksByIds(db, [...new Set(pageAlbums.flatMap((album) => album.trackIds || []))])
      : [];

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
      albumCount: totalAlbums,
      tracks: pageTracks,
      albums: pageAlbums,
      lightweight: !shouldIncludePageTracks(options),
      page: createPageInfo({ limit, offset, search }, totalAlbums),
    };
  } finally {
    db.close();
  }
}

export async function readRandomAlbumPage(databasePath, options = {}) {
  if (!databasePath || !existsSync(databasePath)) {
    return createEmptyLibrary();
  }

  const db = await openDatabase(databasePath);
  try {
    const limit = clampLimit(options.limit || 50);
    const restrictAlbumIds = Array.isArray(options.albumIds);
    const albumIds = restrictAlbumIds ? options.albumIds.filter(Boolean) : [];
    const excludeAlbumIds = Array.isArray(options.excludeAlbumIds) ? options.excludeAlbumIds.filter(Boolean) : [];
    const where = [];
    const params = {};

    if (restrictAlbumIds && albumIds.length === 0) {
      return createEmptyLibrary();
    }

    if (albumIds.length > 0) {
      where.push(`id IN (${albumIds.map((_, index) => `$randomAlbumId${index}`).join(', ')})`);
      albumIds.forEach((albumId, index) => {
        params[`$randomAlbumId${index}`] = albumId;
      });
    }

    if (excludeAlbumIds.length > 0) {
      where.push(`id NOT IN (${excludeAlbumIds.map((_, index) => `$randomExcludeAlbumId${index}`).join(', ')})`);
      excludeAlbumIds.forEach((albumId, index) => {
        params[`$randomExcludeAlbumId${index}`] = albumId;
      });
    }

    addAlbumFolderFilter(where, params, options.folders, 'random');
    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const rows = db.prepare(`
      SELECT * FROM albums
      ${whereSql}
      ORDER BY RANDOM()
      LIMIT $limit
    `).all({ ...params, $limit: limit });
    const albums = rows.map(rowToAlbum);
    const trackIds = albums.flatMap((album) => album.trackIds || []);
    const tracks = readTracksByIds(db, trackIds);
    const totalAlbums = db.prepare(`SELECT COUNT(*) AS count FROM albums ${whereSql}`).get(params).count || 0;

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
      albumCount: totalAlbums,
      tracks,
      albums,
    };
  } finally {
    db.close();
  }
}

export async function readTrackPage(databasePath, options = {}) {
  if (!databasePath || !existsSync(databasePath)) {
    return {
      ...createEmptyLibrary(),
      page: createPageInfo(options, 0),
    };
  }

  const db = await openDatabase(databasePath);
  try {
    const offset = Math.max(0, Number.parseInt(options.offset || 0, 10) || 0);
    const search = cleanSearchValue(options.search);
    const letter = normalizeLetterFilter(options.letter);
    const trackIds = Array.isArray(options.trackIds) ? options.trackIds.filter(Boolean) : [];
    const excludeAlbumIds = Array.isArray(options.excludeAlbumIds) ? options.excludeAlbumIds.filter(Boolean) : [];
    const limit = trackIds.length > 0
      ? Math.max(trackIds.length, 1)
      : clampLimit(options.limit);
    const where = [];
    const params = {};

    addIndexedSearchFilter(db, where, params, 'tracks', ['title'], search, 'trackSearch');
    addLetterFilter(where, params, 'title', letter);

    if (trackIds.length > 0) {
      where.push(`id IN (${trackIds.map((_, index) => `$trackId${index}`).join(', ')})`);
      trackIds.forEach((trackId, index) => {
        params[`$trackId${index}`] = trackId;
      });
    }

    if (excludeAlbumIds.length > 0) {
      where.push(`NOT EXISTS (
        SELECT 1
        FROM album_tracks excluded_album_tracks
        WHERE excluded_album_tracks.track_id = tracks.id
          AND excluded_album_tracks.album_id IN (${excludeAlbumIds.map((_, index) => `$excludeAlbumId${index}`).join(', ')})
      )`);
      excludeAlbumIds.forEach((albumId, index) => {
        params[`$excludeAlbumId${index}`] = albumId;
      });
    }

    addTrackFolderFilter(where, params, options.folders, 'trackFolder');

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const totalTracks = db.prepare(`SELECT COUNT(*) AS count FROM tracks ${whereSql}`).get(params).count || 0;
    const tracks = db.prepare(`
      SELECT * FROM tracks
      ${whereSql}
      ORDER BY artist, album, disc_number, track_number, title
      LIMIT $limit OFFSET $offset
    `).all({
      ...params,
      $limit: limit,
      $offset: offset,
    }).map(rowToTrack);

    const albums = readAlbumsForTrackIds(db, tracks.map((track) => track.id));

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: totalTracks,
      albumCount: db.prepare('SELECT COUNT(*) AS count FROM albums').get().count || 0,
      tracks,
      albums,
      page: trackIds.length > 0
        ? {
          limit,
          offset,
          total: totalTracks,
          hasNext: offset + limit < totalTracks,
          hasPrevious: offset > 0,
        }
        : createPageInfo({ limit, offset, search }, totalTracks),
    };
  } finally {
    db.close();
  }
}

export async function readArtistPage(databasePath, options = {}) {
  if (!databasePath || !existsSync(databasePath)) {
    return {
      generatedAt: null,
      artists: [],
      page: createPageInfo(options, 0),
    };
  }

  const db = await openDatabase(databasePath);
  try {
    const limit = clampLimit(options.limit);
    const offset = Math.max(0, Number.parseInt(options.offset || 0, 10) || 0);
    const search = cleanSearchValue(options.search);
    const letter = normalizeLetterFilter(options.letter);
    const params = {};
    const artistWhere = [];
    addIndexedSearchFilter(db, artistWhere, params, 'tracks', ['artist'], search, 'artistSearch');
    addLetterFilter(artistWhere, params, 'artist', letter);
    addTrackFolderFilter(artistWhere, params, options.folders, 'artistFolder');
    const artistWhereSql = artistWhere.length > 0 ? `WHERE ${artistWhere.join(' AND ')}` : '';
    const total = db.prepare(`SELECT COUNT(*) AS count FROM (SELECT artist FROM tracks ${artistWhereSql} GROUP BY artist)`).get(params).count || 0;
    const artists = db.prepare(`
      SELECT
        tracks.artist AS name,
        COUNT(tracks.id) AS trackCount,
        COUNT(DISTINCT tracks.album_artist || '::' || tracks.album) AS albumCount
      FROM tracks
      ${artistWhereSql}
      GROUP BY tracks.artist
      ORDER BY tracks.artist
      LIMIT $limit OFFSET $offset
    `).all({
      ...params,
      $limit: limit,
      $offset: offset,
    }).map((row) => ({
      name: row.name,
      trackCount: row.trackCount || 0,
      albumCount: row.albumCount || 0,
      albums: [],
      tracks: [],
      albumIds: [],
    }));

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      artists,
      page: createPageInfo({ limit, offset, search }, total),
    };
  } finally {
    db.close();
  }
}

export async function readArtistLibrary(databasePath, artistName, options = {}) {
  if (!databasePath || !existsSync(databasePath) || !artistName) return createEmptyLibrary();

  const db = await openDatabase(databasePath);
  try {
    const where = ['artist = $artist'];
    const params = { $artist: artistName };
    addTrackFolderFilter(where, params, options.folders, 'artistLibraryFolder');
    const whereSql = `WHERE ${where.join(' AND ')}`;
    const tracks = db.prepare(`
      SELECT * FROM tracks
      ${whereSql}
      ORDER BY album, disc_number, track_number, title
    `).all(params).map(rowToTrack);
    const albums = readAlbumsForTrackIds(db, tracks.map((track) => track.id));

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: tracks.length,
      albumCount: albums.length,
      tracks,
      albums,
    };
  } finally {
    db.close();
  }
}

export async function readFolderListing(databasePath, folderPath = '', options = {}) {
  if (!databasePath || !existsSync(databasePath)) {
    return {
      path: normalizeFolderPath(folderPath),
      folders: [],
      tracks: [],
      trackCount: 0,
    };
  }

  const db = await openDatabase(databasePath);
  try {
    const normalizedPath = normalizeFolderPath(folderPath);
    const search = cleanSearchValue(options.search);
    const rootFolders = normalizedPath ? [] : normalizeFolderFilters(options.rootFolders);
    const folderWhere = ['parent_path = $parentPath'];
    const trackWhere = ['folder_path = $folderPath'];
    const folderParams = {
      $parentPath: normalizedPath,
    };
    const trackParams = {
      $folderPath: normalizedPath,
    };

    addTokenSearchFilter(folderWhere, folderParams, ['name'], search, 'folderSearch');
    addIndexedSearchFilter(db, trackWhere, trackParams, 'tracks', ['title', 'artist', 'album', 'normalized_relative_path'], search, 'folderTrackSearch');

    if (rootFolders.length > 0) {
      folderWhere.push(`path IN (${rootFolders.map((_, index) => `$rootFolder${index}`).join(', ')})`);
      rootFolders.forEach((folderPath, index) => {
        folderParams[`$rootFolder${index}`] = folderPath;
      });
    }

    const childFolders = db.prepare(`
      SELECT
        name,
        path,
        direct_track_count,
        total_track_count,
        (
          SELECT COUNT(*)
          FROM folders AS child
          WHERE child.parent_path = folders.path
            AND child.total_track_count > 0
            AND (
              LOWER(child.name) GLOB 'cd[0-9]*'
              OR LOWER(child.name) GLOB 'cd [0-9]*'
              OR LOWER(child.name) GLOB 'disc[0-9]*'
              OR LOWER(child.name) GLOB 'disc [0-9]*'
              OR LOWER(child.name) GLOB 'disk[0-9]*'
              OR LOWER(child.name) GLOB 'disk [0-9]*'
            )
        ) AS disc_child_count
      FROM folders
      WHERE ${folderWhere.join(' AND ')}
      ORDER BY name
    `).all(folderParams).map((row) => ({
      name: row.name,
      path: row.path,
      directTrackCount: row.direct_track_count || 0,
      trackCount: row.total_track_count || 0,
      hasDirectTracks: (row.direct_track_count || 0) > 0,
      hasDiscFolders: (row.disc_child_count || 0) > 0,
      canPlayFolder: (row.direct_track_count || 0) > 0 || (row.disc_child_count || 0) > 0,
    }));
    const directTracks = db.prepare(`
      SELECT * FROM tracks
      WHERE ${trackWhere.join(' AND ')}
      ORDER BY disc_number, track_number, title, normalized_relative_path
    `).all(trackParams).map(rowToTrack);
    const total = rootFolders.length > 0
      ? db.prepare(`
        SELECT COALESCE(SUM(total_track_count), 0) AS count
        FROM folders
        WHERE path IN (${rootFolders.map((_, index) => `$rootTotalFolder${index}`).join(', ')})
      `).get(Object.fromEntries(rootFolders.map((folderPath, index) => [`$rootTotalFolder${index}`, folderPath])))?.count || 0
      : (db.prepare(`
        SELECT COALESCE(total_track_count, 0) AS count
        FROM folders
        WHERE path = $folderPath
      `).get({ $folderPath: normalizedPath })?.count ?? (normalizedPath ? 0 : db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0));

    return {
      path: normalizedPath,
      folders: childFolders,
      tracks: directTracks,
      trackCount: total,
    };
  } finally {
    db.close();
  }
}

export async function readFolderLibrary(databasePath, folderPath = '', options = {}) {
  if (!databasePath || !existsSync(databasePath)) return createEmptyLibrary();

  const db = await openDatabase(databasePath);
  try {
    const normalizedPath = normalizeFolderPath(folderPath);
    const search = cleanSearchValue(options.search);
    const tracks = readTracksUnderFolder(db, normalizedPath, search).map(rowToTrack).sort(compareTracksForQueue);
    const albums = readAlbumsForTrackIds(db, tracks.map((track) => track.id));

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: tracks.length,
      albumCount: albums.length,
      tracks,
      albums,
    };
  } finally {
    db.close();
  }
}

export async function writeLibraryDatabase(databasePath, library) {
  if (!databasePath) return;

  const db = await openDatabase(databasePath);
  try {
    db.exec('BEGIN IMMEDIATE');
    db.prepare('DELETE FROM metadata').run();
    db.prepare('DELETE FROM album_tracks').run();
    db.prepare('DELETE FROM folders').run();
    db.prepare('DELETE FROM tracks').run();
    db.prepare('DELETE FROM albums').run();

    const insertMetadata = db.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)');
    insertMetadata.run('schemaVersion', String(FOLDER_INDEX_VERSION));
    insertMetadata.run('generatedAt', library.generatedAt || new Date().toISOString());
    insertMetadata.run('collectionInferenceVersion', COLLECTION_INFERENCE_VERSION);
    if (isSearchIndexAvailable(db)) {
      insertMetadata.run('searchIndexVersion', SEARCH_INDEX_VERSION);
    }

    const insertTrack = db.prepare(`
      INSERT INTO tracks (
        id, title, artist, album_artist, album, track_number, disc_number, date, year,
        relative_path, normalized_relative_path, folder_path, absolute_path, file_size, mtime_ms, scan_metadata, scan_durations,
        cover_art_path, cached_cover_path, cached_cover_format, has_embedded_cover,
        duration, audio_quality_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const track of library.tracks || []) {
      const normalizedRelativePath = normalizeFolderPath(track.relativePath || '');
      const folderPath = getParentFolderPath(normalizedRelativePath);
      insertTrack.run(
        track.id,
        track.title || '',
        track.artist || '',
        track.albumArtist || '',
        track.album || '',
        numberOrNull(track.trackNumber),
        numberOrNull(track.discNumber),
        track.date || '',
        track.year == null ? null : String(track.year),
        track.relativePath || '',
        normalizedRelativePath,
        folderPath,
        track.path || '',
        numberOrNull(track.fileSize),
        numberOrNull(track.mtimeMs),
        track.scanMetadata ? 1 : 0,
        track.scanDurations ? 1 : 0,
        track.coverArtPath || '',
        track.cachedCoverPath || '',
        track.cachedCoverFormat || '',
        track.hasEmbeddedCover ? 1 : 0,
        numberOrNull(track.duration),
        JSON.stringify(track.audioQuality || null),
      );
    }

    const insertFolder = db.prepare(`
      INSERT INTO folders (
        path, name, parent_path, depth, direct_track_count, total_track_count
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const folder of buildFolderRows(library.tracks || [])) {
      insertFolder.run(
        folder.path,
        folder.name,
        folder.parentPath,
        folder.depth,
        folder.directTrackCount,
        folder.totalTrackCount,
      );
    }

    const insertAlbum = db.prepare(`
      INSERT INTO albums (
        id, title, artist, album_artist, date, year, collection_name, cover_track_id, track_ids_json, audio_quality_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertAlbumTrack = db.prepare('INSERT INTO album_tracks (album_id, track_id, position) VALUES (?, ?, ?)');

    for (const album of library.albums || []) {
      insertAlbum.run(
        album.id,
        album.title || '',
        album.artist || '',
        album.albumArtist || '',
        album.date || '',
        album.year == null ? null : String(album.year),
        album.collectionName || '',
        album.coverTrackId || '',
        JSON.stringify(album.trackIds || []),
        JSON.stringify(album.audioQuality || null),
      );
      for (const [index, trackId] of (album.trackIds || []).entries()) {
        insertAlbumTrack.run(album.id, trackId, index);
      }
    }

    db.exec('COMMIT');
  } catch (error) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // Ignore rollback errors; the original error is more useful.
    }
    throw error;
  } finally {
    db.close();
  }
}

export async function readAlbumOverridesDatabase(databasePath) {
  return readOverrideTable(databasePath, 'album_overrides', 'album_id', 'albums');
}

export async function writeAlbumOverridesDatabase(databasePath, overrides) {
  return writeOverrideTable(databasePath, 'album_overrides', 'album_id', overrides?.albums || {});
}

export async function readArtistOverridesDatabase(databasePath) {
  return readOverrideTable(databasePath, 'artist_overrides', 'artist_name', 'artists');
}

export async function writeArtistOverridesDatabase(databasePath, overrides) {
  return writeOverrideTable(databasePath, 'artist_overrides', 'artist_name', overrides?.artists || {}, {
    normalizedColumn: 'normalized_name',
    normalizeKey: normalizeOverrideKey,
  });
}

export async function readCollectionOverridesDatabase(databasePath) {
  return readOverrideTable(databasePath, 'collection_overrides', 'collection_name', 'collections');
}

export async function writeCollectionOverridesDatabase(databasePath, overrides) {
  return writeOverrideTable(databasePath, 'collection_overrides', 'collection_name', overrides?.collections || {}, {
    normalizedColumn: 'normalized_name',
    normalizeKey: normalizeOverrideKey,
  });
}

export async function readLyricsOverridesDatabase(databasePath) {
  return readOverrideTable(databasePath, 'lyrics_overrides', 'track_id', 'tracks');
}

export async function writeLyricsOverridesDatabase(databasePath, overrides) {
  return writeOverrideTable(databasePath, 'lyrics_overrides', 'track_id', overrides?.tracks || {}, {
    extraColumns: ['title', 'artist', 'album'],
    getExtraValues: (lyrics) => [
      cleanOverrideText(lyrics?.title),
      cleanOverrideText(lyrics?.artist),
      cleanOverrideText(lyrics?.album),
    ],
  });
}

export async function validateLibraryDatabaseFile(databasePath) {
  if (!databasePath || !existsSync(databasePath)) {
    throw new Error('Database file was not found.');
  }

  const db = new DatabaseSync(databasePath);
  try {
    const integrityRow = db.prepare('PRAGMA integrity_check').get();
    const integrityValue = integrityRow ? Object.values(integrityRow)[0] : '';
    if (integrityValue !== 'ok') {
      throw new Error('SQLite integrity check failed.');
    }

    const requiredTables = ['metadata', 'tracks', 'albums', 'album_tracks', 'folders'];
    const tableRows = db.prepare(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name IN (${requiredTables.map(() => '?').join(', ')})
    `).all(...requiredTables);
    const foundTables = new Set(tableRows.map((row) => row.name));
    const missingTables = requiredTables.filter((tableName) => !foundTables.has(tableName));
    if (missingTables.length > 0) {
      throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
    }

    return {
      trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
      albumCount: db.prepare('SELECT COUNT(*) AS count FROM albums').get().count || 0,
      generatedAt: db.prepare("SELECT value FROM metadata WHERE key = 'generatedAt'").get()?.value || null,
    };
  } finally {
    db.close();
  }
}

export async function exportLibraryDatabaseSnapshot(databasePath, destinationPath) {
  if (!databasePath || !existsSync(databasePath)) {
    throw new Error('Database file was not found.');
  }
  if (!destinationPath) {
    throw new Error('Snapshot destination is required.');
  }

  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.rm(destinationPath, { force: true });
  const db = new DatabaseSync(databasePath);
  try {
    db.exec(`VACUUM INTO '${escapeSqlString(destinationPath)}'`);
  } finally {
    db.close();
  }
  return validateLibraryDatabaseFile(destinationPath);
}

async function readOverrideTable(databasePath, tableName, keyColumn, storeKey) {
  if (!databasePath) return { [storeKey]: {} };

  const db = await openDatabase(databasePath);
  try {
    const rows = db.prepare(`SELECT ${keyColumn} AS override_key, payload_json FROM ${tableName}`).all();
    const values = {};
    for (const row of rows) {
      const payload = parseJson(row.payload_json, null);
      if (!row.override_key || !payload) continue;
      values[row.override_key] = payload;
    }
    return { [storeKey]: values };
  } finally {
    db.close();
  }
}

async function writeOverrideTable(databasePath, tableName, keyColumn, values, options = {}) {
  if (!databasePath) return;

  const db = await openDatabase(databasePath);
  try {
    db.exec('BEGIN IMMEDIATE');
    db.prepare(`DELETE FROM ${tableName}`).run();

    const extraColumns = options.extraColumns || [];
    const columnNames = [
      keyColumn,
      ...(options.normalizedColumn ? [options.normalizedColumn] : []),
      ...extraColumns,
      'payload_json',
      'updated_at',
    ];
    const placeholders = columnNames.map(() => '?').join(', ');
    const insert = db.prepare(`INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${placeholders})`);

    for (const [key, payload] of Object.entries(values || {})) {
      if (!key || !payload || typeof payload !== 'object') continue;
      const updatedAt = cleanOverrideText(payload.updatedAt) || new Date().toISOString();
      insert.run(
        key,
        ...(options.normalizedColumn ? [options.normalizeKey ? options.normalizeKey(key) : key] : []),
        ...(options.getExtraValues ? options.getExtraValues(payload) : []),
        JSON.stringify(payload),
        updatedAt,
      );
    }

    db.exec('COMMIT');
  } catch (error) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // Keep the original error.
    }
    throw error;
  } finally {
    db.close();
  }
}

function readTracksUnderFolder(db, folderPath, search = '') {
  const where = [];
  const params = {};

  if (folderPath) {
    where.push("(folder_path = $folderPath OR folder_path LIKE $folderPrefix ESCAPE '\\')");
    params.$folderPath = folderPath;
    params.$folderPrefix = buildLikePrefix(folderPath, '/');
  }

  addIndexedSearchFilter(db, where, params, 'tracks', ['title', 'artist', 'album', 'normalized_relative_path'], search, 'folderLibrarySearch');

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  return db.prepare(`
    SELECT * FROM tracks
    ${whereSql}
    ORDER BY normalized_relative_path, disc_number, track_number, title
  `).all(params);
}

function normalizeFolderPath(folderPath) {
  return String(folderPath || '')
    .replace(/\\/gu, '/')
    .replace(/^\/+|\/+$/gu, '')
    .replace(/\/+/gu, '/')
    .trim();
}

function getFolderRemainder(relativePath, folderPath) {
  if (!folderPath) return relativePath;
  if (relativePath === folderPath) return '';
  return relativePath.startsWith(`${folderPath}/`) ? relativePath.slice(folderPath.length + 1) : '';
}

function getParentFolderPath(relativePath) {
  const normalizedPath = normalizeFolderPath(relativePath);
  const index = normalizedPath.lastIndexOf('/');
  return index > -1 ? normalizedPath.slice(0, index) : '';
}

function getFolderName(folderPath) {
  const normalizedPath = normalizeFolderPath(folderPath);
  if (!normalizedPath) return '';
  return normalizedPath.slice(normalizedPath.lastIndexOf('/') + 1);
}

function getFolderParentPath(folderPath) {
  const normalizedPath = normalizeFolderPath(folderPath);
  const index = normalizedPath.lastIndexOf('/');
  return index > -1 ? normalizedPath.slice(0, index) : '';
}

function getFolderDepth(folderPath) {
  const normalizedPath = normalizeFolderPath(folderPath);
  return normalizedPath ? normalizedPath.split('/').length : 0;
}

function getFolderAncestors(folderPath) {
  const normalizedPath = normalizeFolderPath(folderPath);
  if (!normalizedPath) return [];
  const parts = normalizedPath.split('/');
  return parts.map((_, index) => parts.slice(0, index + 1).join('/'));
}

function buildFolderRows(tracks) {
  const folderMap = new Map();

  const ensureFolder = (folderPath) => {
    const normalizedPath = normalizeFolderPath(folderPath);
    if (!normalizedPath || folderMap.has(normalizedPath)) return folderMap.get(normalizedPath);
    const folder = {
      path: normalizedPath,
      name: getFolderName(normalizedPath),
      parentPath: getFolderParentPath(normalizedPath),
      depth: getFolderDepth(normalizedPath),
      directTrackCount: 0,
      totalTrackCount: 0,
    };
    folderMap.set(normalizedPath, folder);
    return folder;
  };

  for (const track of tracks) {
    const folderPath = getParentFolderPath(track.relativePath || '');
    if (!folderPath) continue;
    for (const ancestor of getFolderAncestors(folderPath)) {
      ensureFolder(ancestor).totalTrackCount += 1;
    }
    ensureFolder(folderPath).directTrackCount += 1;
  }

  return [...folderMap.values()].sort((left, right) => left.path.localeCompare(right.path));
}

function escapeLike(value) {
  return String(value).replace(/[\\%_]/gu, (match) => `\\${match}`);
}

function buildLikePrefix(folderPath, separator) {
  const escapedSeparator = separator === '\\' ? '\\\\' : separator;
  return `${escapeLike(folderPath)}${escapedSeparator}%`;
}

function compareTrackRows(left, right) {
  return compareTracksForQueue(rowToTrack(left), rowToTrack(right));
}

function compareTracksForQueue(left, right) {
  return (
    left.relativePath.localeCompare(right.relativePath)
    || compareNullableNumber(left.discNumber, right.discNumber)
    || compareNullableNumber(left.trackNumber, right.trackNumber)
    || left.title.localeCompare(right.title)
  );
}

function compareNullableNumber(left, right) {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return Number(left) - Number(right);
}

function readTracksByIds(db, trackIds) {
  if (trackIds.length === 0) return [];
  const uniqueIds = [...new Set(trackIds)];
  const params = {};
  const placeholders = uniqueIds.map((trackId, index) => {
    params[`$trackId${index}`] = trackId;
    return `$trackId${index}`;
  }).join(', ');
  const order = new Map(uniqueIds.map((trackId, index) => [trackId, index]));
  return db.prepare(`SELECT * FROM tracks WHERE id IN (${placeholders})`).all(params)
    .map(rowToTrack)
    .sort((left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0));
}

function hydrateAlbumTrackIds(db, albums) {
  if (!albums.length) return albums;

  const albumIds = albums.map((album) => album.id).filter(Boolean);
  if (albumIds.length === 0) return albums;

  const params = {};
  const placeholders = albumIds.map((albumId, index) => {
    params[`$albumId${index}`] = albumId;
    return `$albumId${index}`;
  }).join(', ');
  const linkedRows = db.prepare(`
    SELECT album_tracks.album_id, album_tracks.track_id
    FROM album_tracks
    INNER JOIN tracks ON tracks.id = album_tracks.track_id
    WHERE album_tracks.album_id IN (${placeholders})
    ORDER BY album_tracks.album_id, album_tracks.position, tracks.disc_number, tracks.track_number, tracks.title
  `).all(params);
  const linkedTrackIds = new Map();
  for (const row of linkedRows) {
    const list = linkedTrackIds.get(row.album_id) || [];
    list.push(row.track_id);
    linkedTrackIds.set(row.album_id, list);
  }

  return albums.map((album) => {
    const trackIds = linkedTrackIds.get(album.id)
      || (Array.isArray(album.trackIds) && album.trackIds.length > 0
        ? album.trackIds
        : readTrackIdsByAlbumTags(db, album));
    return {
      ...album,
      trackIds,
    };
  });
}

function readTrackIdsByAlbumTags(db, album) {
  const albumTitle = String(album?.title || '').trim();
  if (!albumTitle) return [];

  const artist = String(album?.artist || '').trim();
  const albumArtist = String(album?.albumArtist || '').trim();
  const artistClauses = [];
  const params = { $albumTitle: albumTitle };

  if (albumArtist) {
    params.$albumArtist = albumArtist;
    artistClauses.push('album_artist = $albumArtist');
  }
  if (artist) {
    params.$artist = artist;
    artistClauses.push('artist = $artist', 'album_artist = $artist');
  }

  const artistSql = artistClauses.length > 0
    ? `AND (${[...new Set(artistClauses)].join(' OR ')})`
    : '';
  return db.prepare(`
    SELECT id
    FROM tracks
    WHERE album = $albumTitle
      ${artistSql}
    ORDER BY disc_number, track_number, title
  `).all(params).map((row) => row.id);
}

function shouldIncludePageTracks(options = {}) {
  return options.includeTracks !== false;
}

function attachCoverTracksForCardPage(db, albums, options = {}) {
  if (!albums.length || !options.includeCoverTracks) return albums;
  const coverTracks = readTracksByIds(
    db,
    albums.map((album) => album.coverTrackId).filter(Boolean),
  );
  if (coverTracks.length === 0) return albums;

  const coverTrackMap = new Map(coverTracks.map((track) => [track.id, track]));
  return albums.map((album) => ({
    ...album,
    coverTrack: coverTrackMap.get(album.coverTrackId) || null,
  }));
}

function readAlbumsForTrackIds(db, trackIds) {
  if (trackIds.length === 0) return [];
  const uniqueIds = [...new Set(trackIds)];
  const params = {};
  const placeholders = uniqueIds.map((trackId, index) => {
    params[`$trackId${index}`] = trackId;
    return `$trackId${index}`;
  }).join(', ');
  const albums = db.prepare(`
    SELECT DISTINCT albums.*
    FROM albums
    INNER JOIN album_tracks ON album_tracks.album_id = albums.id
    WHERE album_tracks.track_id IN (${placeholders})
    ORDER BY albums.artist, albums.title
  `).all(params).map(rowToAlbum);
  if (albums.length > 0) return albums;

  const tracks = readTracksByIds(db, trackIds);
  const albumKeys = [...new Set(tracks.map((track) => `${track.albumArtist || track.artist}::${track.album}`))];
  if (albumKeys.length === 0) return [];

  const fallbackParams = {};
  const fallbackWhere = albumKeys.map((key, index) => {
    const [artist, album] = key.split('::');
    fallbackParams[`$artist${index}`] = artist;
    fallbackParams[`$album${index}`] = album;
    return `(album_artist = $artist${index} AND title = $album${index})`;
  }).join(' OR ');

  return db.prepare(`
    SELECT * FROM albums
    WHERE ${fallbackWhere}
    ORDER BY artist, title
  `).all(fallbackParams).map(rowToAlbum);
}

async function openDatabase(databasePath) {
  await fs.mkdir(path.dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA synchronous = NORMAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 5000');
  db.function('normalize_search_text', { deterministic: true }, normalizeSearchIndexText);

  const databaseVersionRow = db.prepare('PRAGMA user_version').get();
  const databaseVersion = Number(Object.values(databaseVersionRow || {})[0]) || 0;
  if (databaseVersion >= DATABASE_SCHEMA_VERSION) {
    return db;
  }

  try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album_artist TEXT NOT NULL,
      album TEXT NOT NULL,
      track_number INTEGER,
      disc_number INTEGER,
      date TEXT,
      year TEXT,
      relative_path TEXT NOT NULL UNIQUE,
      normalized_relative_path TEXT NOT NULL DEFAULT '',
      folder_path TEXT NOT NULL DEFAULT '',
      absolute_path TEXT NOT NULL,
      file_size INTEGER,
      mtime_ms INTEGER,
      scan_metadata INTEGER NOT NULL DEFAULT 1,
      scan_durations INTEGER NOT NULL DEFAULT 0,
      cover_art_path TEXT,
      cached_cover_path TEXT,
      cached_cover_format TEXT,
      has_embedded_cover INTEGER NOT NULL DEFAULT 0,
      duration REAL,
      audio_quality_json TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album_artist, album);
    CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist);
    CREATE INDEX IF NOT EXISTS idx_tracks_relative_path ON tracks(relative_path);
    CREATE INDEX IF NOT EXISTS idx_tracks_library_order
      ON tracks(artist, album, disc_number, track_number, title, id);
    CREATE INDEX IF NOT EXISTS idx_tracks_artist_albums
      ON tracks(artist, album_artist, album);

    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album_artist TEXT NOT NULL,
      date TEXT,
      year TEXT,
      collection_name TEXT NOT NULL DEFAULT '',
      cover_track_id TEXT,
      track_ids_json TEXT NOT NULL,
      audio_quality_json TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_albums_artist ON albums(artist);
    CREATE INDEX IF NOT EXISTS idx_albums_title ON albums(title);
    CREATE INDEX IF NOT EXISTS idx_albums_library_order
      ON albums(artist, title, id);
    CREATE INDEX IF NOT EXISTS idx_albums_collection_order
      ON albums(collection_name COLLATE NOCASE, artist, title, id);

    CREATE TABLE IF NOT EXISTS album_tracks (
      album_id TEXT NOT NULL,
      track_id TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (album_id, track_id)
    );

    CREATE INDEX IF NOT EXISTS idx_album_tracks_track ON album_tracks(track_id);
    CREATE INDEX IF NOT EXISTS idx_album_tracks_album ON album_tracks(album_id, position);

    CREATE TABLE IF NOT EXISTS folders (
      path TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_path TEXT NOT NULL,
      depth INTEGER NOT NULL DEFAULT 0,
      direct_track_count INTEGER NOT NULL DEFAULT 0,
      total_track_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_folders_parent_path ON folders(parent_path, name);

    CREATE TABLE IF NOT EXISTS album_overrides (
      album_id TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS artist_overrides (
      artist_name TEXT PRIMARY KEY,
      normalized_name TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_artist_overrides_normalized_name ON artist_overrides(normalized_name);

    CREATE TABLE IF NOT EXISTS collection_overrides (
      collection_name TEXT PRIMARY KEY,
      normalized_name TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_collection_overrides_normalized_name ON collection_overrides(normalized_name);

    CREATE TABLE IF NOT EXISTS lyrics_overrides (
      track_id TEXT PRIMARY KEY,
      title TEXT,
      artist TEXT,
      album TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_lyrics_overrides_lookup ON lyrics_overrides(title, artist, album);

    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      owner_key TEXT NOT NULL,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (owner_key, normalized_name)
    );

    CREATE INDEX IF NOT EXISTS idx_playlists_owner_updated
      ON playlists(owner_key, updated_at DESC);

    CREATE TABLE IF NOT EXISTS playlist_tracks (
      playlist_id TEXT NOT NULL,
      track_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      added_at TEXT NOT NULL,
      PRIMARY KEY (playlist_id, track_id),
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position
      ON playlist_tracks(playlist_id, position);
  `);
    ensureColumn(db, 'tracks', 'normalized_relative_path', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(db, 'tracks', 'folder_path', "TEXT NOT NULL DEFAULT ''");
    ensureColumn(db, 'albums', 'collection_name', "TEXT NOT NULL DEFAULT ''");
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tracks_folder_path ON tracks(folder_path);
      CREATE INDEX IF NOT EXISTS idx_tracks_normalized_relative_path ON tracks(normalized_relative_path);
      CREATE INDEX IF NOT EXISTS idx_albums_collection_name ON albums(collection_name);
    `);
    migrateFolderIndex(db);
    migrateAlbumIndex(db);
    migrateAlbumCollectionNames(db);
    initializeSearchIndexes(db);
    db.exec(`PRAGMA user_version = ${DATABASE_SCHEMA_VERSION}`);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

function ensureColumn(db, tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  if (columns.some((column) => column.name === columnName)) return;
  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

function initializeSearchIndexes(db) {
  try {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS albums_fts USING fts5(
        id UNINDEXED,
        title,
        artist,
        album_artist,
        collection_name,
        year,
        tokenize = 'trigram'
      );

      CREATE VIRTUAL TABLE IF NOT EXISTS tracks_fts USING fts5(
        id UNINDEXED,
        title,
        artist,
        album_artist,
        album,
        normalized_relative_path,
        tokenize = 'trigram'
      );
    `);
  } catch (error) {
    if (!/no such module:\s*fts5/iu.test(String(error?.message || ''))) throw error;
    setMetadata(db, 'searchIndexVersion', 'unavailable');
    SEARCH_INDEX_AVAILABILITY.set(db, false);
    return;
  }

  db.exec(`
    DROP TRIGGER IF EXISTS albums_fts_insert;
    DROP TRIGGER IF EXISTS albums_fts_delete;
    DROP TRIGGER IF EXISTS albums_fts_update;
    DROP TRIGGER IF EXISTS tracks_fts_insert;
    DROP TRIGGER IF EXISTS tracks_fts_delete;
    DROP TRIGGER IF EXISTS tracks_fts_update;

    CREATE TRIGGER IF NOT EXISTS albums_fts_insert AFTER INSERT ON albums BEGIN
      INSERT INTO albums_fts(rowid, id, title, artist, album_artist, collection_name, year)
      VALUES (
        new.rowid,
        new.id,
        normalize_search_text(new.title),
        normalize_search_text(new.artist),
        normalize_search_text(new.album_artist),
        normalize_search_text(new.collection_name),
        normalize_search_text(new.year)
      );
    END;

    CREATE TRIGGER IF NOT EXISTS albums_fts_delete AFTER DELETE ON albums BEGIN
      DELETE FROM albums_fts WHERE rowid = old.rowid;
    END;

    CREATE TRIGGER IF NOT EXISTS albums_fts_update
    AFTER UPDATE OF title, artist, album_artist, collection_name, year ON albums BEGIN
      DELETE FROM albums_fts WHERE rowid = old.rowid;
      INSERT INTO albums_fts(rowid, id, title, artist, album_artist, collection_name, year)
      VALUES (
        new.rowid,
        new.id,
        normalize_search_text(new.title),
        normalize_search_text(new.artist),
        normalize_search_text(new.album_artist),
        normalize_search_text(new.collection_name),
        normalize_search_text(new.year)
      );
    END;

    CREATE TRIGGER IF NOT EXISTS tracks_fts_insert AFTER INSERT ON tracks BEGIN
      INSERT INTO tracks_fts(rowid, id, title, artist, album_artist, album, normalized_relative_path)
      VALUES (
        new.rowid,
        new.id,
        normalize_search_text(new.title),
        normalize_search_text(new.artist),
        normalize_search_text(new.album_artist),
        normalize_search_text(new.album),
        normalize_search_text(new.normalized_relative_path)
      );
    END;

    CREATE TRIGGER IF NOT EXISTS tracks_fts_delete AFTER DELETE ON tracks BEGIN
      DELETE FROM tracks_fts WHERE rowid = old.rowid;
    END;

    CREATE TRIGGER IF NOT EXISTS tracks_fts_update
    AFTER UPDATE OF title, artist, album_artist, album, normalized_relative_path ON tracks BEGIN
      DELETE FROM tracks_fts WHERE rowid = old.rowid;
      INSERT INTO tracks_fts(rowid, id, title, artist, album_artist, album, normalized_relative_path)
      VALUES (
        new.rowid,
        new.id,
        normalize_search_text(new.title),
        normalize_search_text(new.artist),
        normalize_search_text(new.album_artist),
        normalize_search_text(new.album),
        normalize_search_text(new.normalized_relative_path)
      );
    END;
  `);

  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec(`
      DELETE FROM albums_fts;
      INSERT INTO albums_fts(rowid, id, title, artist, album_artist, collection_name, year)
      SELECT
        rowid,
        id,
        normalize_search_text(title),
        normalize_search_text(artist),
        normalize_search_text(album_artist),
        normalize_search_text(collection_name),
        normalize_search_text(year)
      FROM albums;

      DELETE FROM tracks_fts;
      INSERT INTO tracks_fts(rowid, id, title, artist, album_artist, album, normalized_relative_path)
      SELECT
        rowid,
        id,
        normalize_search_text(title),
        normalize_search_text(artist),
        normalize_search_text(album_artist),
        normalize_search_text(album),
        normalize_search_text(normalized_relative_path)
      FROM tracks;
    `);
    setMetadata(db, 'searchIndexVersion', SEARCH_INDEX_VERSION);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  SEARCH_INDEX_AVAILABILITY.set(db, true);
}

function migrateFolderIndex(db) {
  const trackCount = db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0;
  if (trackCount === 0) {
    setMetadata(db, 'schemaVersion', String(FOLDER_INDEX_VERSION));
    return;
  }

  const schemaVersion = Number.parseInt(getMetadata(db, 'schemaVersion') || '0', 10) || 0;
  const missingFolderPathCount = db.prepare(`
    SELECT COUNT(*) AS count
    FROM tracks
    WHERE normalized_relative_path = ''
      OR (folder_path = '' AND REPLACE(relative_path, '\\', '/') LIKE '%/%')
  `).get().count || 0;
  const folderCount = db.prepare('SELECT COUNT(*) AS count FROM folders').get().count || 0;
  const shouldRebuildFolders = schemaVersion < FOLDER_INDEX_VERSION || missingFolderPathCount > 0 || folderCount === 0;

  if (missingFolderPathCount > 0) {
    backfillTrackFolderColumns(db);
  }
  if (shouldRebuildFolders) {
    rebuildFolderIndex(db);
  }
  setMetadata(db, 'schemaVersion', String(FOLDER_INDEX_VERSION));
}

function backfillTrackFolderColumns(db) {
  const updateTrack = db.prepare(`
    UPDATE tracks
    SET normalized_relative_path = ?, folder_path = ?
    WHERE id = ?
  `);
  const rows = db.prepare(`
    SELECT id, relative_path
    FROM tracks
    WHERE normalized_relative_path = ''
      OR (folder_path = '' AND REPLACE(relative_path, '\\', '/') LIKE '%/%')
  `);
  for (const row of rows.iterate()) {
    const normalizedRelativePath = normalizeFolderPath(row.relative_path || '');
    updateTrack.run(normalizedRelativePath, getParentFolderPath(normalizedRelativePath), row.id);
  }
}

function rebuildFolderIndex(db) {
  db.prepare('DELETE FROM folders').run();

  const folderMap = new Map();
  for (const row of db.prepare("SELECT folder_path FROM tracks WHERE folder_path != ''").iterate()) {
    for (const ancestor of getFolderAncestors(row.folder_path)) {
      if (!folderMap.has(ancestor)) {
        folderMap.set(ancestor, {
          path: ancestor,
          name: getFolderName(ancestor),
          parentPath: getFolderParentPath(ancestor),
          depth: getFolderDepth(ancestor),
          directTrackCount: 0,
          totalTrackCount: 0,
        });
      }
      folderMap.get(ancestor).totalTrackCount += 1;
    }
    if (folderMap.has(row.folder_path)) {
      folderMap.get(row.folder_path).directTrackCount += 1;
    }
  }

  const insertFolder = db.prepare(`
    INSERT INTO folders (
      path, name, parent_path, depth, direct_track_count, total_track_count
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const folder of [...folderMap.values()].sort((left, right) => left.path.localeCompare(right.path))) {
    insertFolder.run(
      folder.path,
      folder.name,
      folder.parentPath,
      folder.depth,
      folder.directTrackCount,
      folder.totalTrackCount,
    );
  }
}

function migrateAlbumIndex(db) {
  const trackCount = db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0;
  if (trackCount === 0) return;
  if (getMetadata(db, 'albumIndexRepairAttempted') === '1') return;

  const albumCount = db.prepare('SELECT COUNT(*) AS count FROM albums').get().count || 0;
  const distinctAlbumCount = db.prepare(`
    SELECT COUNT(*) AS count
    FROM (
      SELECT COALESCE(NULLIF(album_artist, ''), artist) AS album_key_artist, album
      FROM tracks
      WHERE album != ''
      GROUP BY album_key_artist, album
    )
  `).get().count || 0;

  // Only rebuild when the album index is genuinely inconsistent with tracks.
  // Collection-name backfills must not trigger this on every DB open for large libraries.
  if (albumCount !== distinctAlbumCount) {
    rebuildAlbumIndex(db);
  }
  setMetadata(db, 'albumIndexRepairAttempted', '1');
}

function migrateAlbumCollectionNames(db) {
  if (getMetadata(db, 'collectionInferenceVersion') === COLLECTION_INFERENCE_VERSION) return;

  const rows = db.prepare(`
    SELECT albums.id, albums.title, albums.collection_name, GROUP_CONCAT(tracks.folder_path, char(31)) AS folder_paths
    FROM albums
    LEFT JOIN album_tracks ON album_tracks.album_id = albums.id
    LEFT JOIN tracks ON tracks.id = album_tracks.track_id
    GROUP BY albums.id
  `).all();
  const update = db.prepare('UPDATE albums SET collection_name = ? WHERE id = ?');
  const inferredByAlbumId = inferCollectionNamesForAlbumRows(rows);
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const row of rows) {
      const inferred = inferredByAlbumId.get(row.id) || '';
      if (inferred !== (row.collection_name || '')) {
        update.run(inferred, row.id);
      }
    }
    setMetadata(db, 'collectionInferenceVersion', COLLECTION_INFERENCE_VERSION);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function rebuildAlbumIndex(db) {
  db.prepare('DELETE FROM album_tracks').run();
  db.prepare('DELETE FROM albums').run();

  const albumMap = new Map();
  const tracks = db.prepare(`
    SELECT *
    FROM tracks
    ORDER BY album_artist, artist, album, disc_number, track_number, title
  `).all();

  for (const row of tracks) {
    const albumArtist = row.album_artist || row.artist || 'Unknown Artist';
    const albumTitle = row.album || 'Singles';
    const albumKey = `${albumArtist}::${albumTitle}`;
    const albumId = createStableId(albumKey);
    if (!albumMap.has(albumId)) {
      albumMap.set(albumId, {
        id: albumId,
        title: albumTitle,
        artist: albumArtist,
        albumArtist,
        date: row.date || '',
        year: row.year || null,
        collectionName: '',
        coverTrackId: row.cover_art_path || row.has_embedded_cover ? row.id : '',
        trackIds: [],
        folderPaths: new Set(),
        qualities: [],
      });
    }

    const album = albumMap.get(albumId);
    album.trackIds.push(row.id);
    if (row.folder_path) album.folderPaths.add(row.folder_path);
    if (!album.date && row.date) album.date = row.date;
    if (!album.year && row.year) album.year = row.year;
    if (!album.coverTrackId && (row.cover_art_path || row.has_embedded_cover)) {
      album.coverTrackId = row.id;
    }
    const quality = parseJson(row.audio_quality_json, null);
    if (quality) album.qualities.push(quality);
  }

  assignInferredCollectionNamesToAlbumRows([...albumMap.values()]);

  const insertAlbum = db.prepare(`
    INSERT INTO albums (
      id, title, artist, album_artist, date, year, collection_name, cover_track_id, track_ids_json, audio_quality_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertAlbumTrack = db.prepare('INSERT INTO album_tracks (album_id, track_id, position) VALUES (?, ?, ?)');

  for (const album of albumMap.values()) {
    insertAlbum.run(
      album.id,
      album.title,
      album.artist,
      album.albumArtist,
      album.date,
      album.year == null ? null : String(album.year),
      album.collectionName || '',
      album.coverTrackId || '',
      JSON.stringify(album.trackIds),
      JSON.stringify(getBestAudioQualityFromRows(album.qualities)),
    );
    for (const [index, trackId] of album.trackIds.entries()) {
      insertAlbumTrack.run(album.id, trackId, index);
    }
  }
}

function createStableId(value) {
  return createHash('sha1').update(String(value || '')).digest('hex').slice(0, 16);
}

function inferCollectionNameFromFolderPath(folderPath, albumTitle = '') {
  return inferCollectionCandidateFromFolderPath(folderPath, albumTitle)?.name || '';
}

function inferCollectionNamesForAlbumRows(rows) {
  const albums = rows.map((row) => ({
    id: row.id,
    title: row.title || '',
    collectionName: '',
    folderPaths: new Set(String(row.folder_paths || '').split('\u001f').filter(Boolean)),
  }));
  assignInferredCollectionNamesToAlbumRows(albums);
  return new Map(albums.map((album) => [album.id, album.collectionName || '']));
}

function assignInferredCollectionNamesToAlbumRows(albums) {
  const candidatesByAlbumId = new Map();
  const groupsByPath = new Map();

  for (const album of albums) {
    const candidates = [];
    for (const folderPath of album.folderPaths || []) {
      const candidate = inferCollectionCandidateFromFolderPath(folderPath, album.title);
      if (!candidate) continue;
      candidates.push(candidate);
      if (!groupsByPath.has(candidate.path)) {
        groupsByPath.set(candidate.path, {
          name: candidate.name,
          albumIds: new Set(),
        });
      }
      groupsByPath.get(candidate.path).albumIds.add(album.id);
    }
    candidatesByAlbumId.set(album.id, candidates);
  }

  for (const album of albums) {
    const selected = (candidatesByAlbumId.get(album.id) || [])
      .find((candidate) => (groupsByPath.get(candidate.path)?.albumIds.size || 0) > 1);
    album.collectionName = selected?.name || '';
  }
}

function inferCollectionCandidateFromFolderPath(folderPath, albumTitle = '') {
  const segments = String(folderPath || '').split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const ancestorSegments = segments.slice(0, -1);
  for (let index = ancestorSegments.length - 1; index >= 0; index -= 1) {
    const segment = ancestorSegments[index];
    if (!/\bcollections?\b/iu.test(normalizeCollectionText(segment))) continue;
    return {
      name: humanizeFolderName(segment),
      path: segments.slice(0, index + 1).join('/'),
    };
  }

  const normalizedAlbumTitle = normalizeCollectionText(albumTitle);
  for (let index = ancestorSegments.length - 1; index >= 0; index -= 1) {
    const segment = ancestorSegments[index];
    const normalizedSegment = normalizeCollectionText(segment);
    const hasCollectionWord = /\bcollections?\b/iu.test(normalizedSegment);
    const hasAlbumWord = /\balbums?\b/iu.test(normalizedSegment);
    const containsAlbumTitle = normalizedAlbumTitle
      && normalizedSegment.includes(normalizedAlbumTitle)
      && normalizedAlbumTitle.length >= 3;
    if (hasCollectionWord && (hasAlbumWord || containsAlbumTitle)) {
      return {
        name: humanizeFolderName(segment),
        path: segments.slice(0, index + 1).join('/'),
      };
    }
  }

  const joinedPath = normalizeCollectionText(segments.join(' '));
  if (/\bcollections?\b/iu.test(joinedPath) && /\balbums?\b/iu.test(joinedPath)) {
    const index = ancestorSegments.findIndex((segment) => /\bcollections?\b/iu.test(normalizeCollectionText(segment)));
    if (index >= 0) {
      const segment = ancestorSegments[index];
      return {
        name: humanizeFolderName(segment),
        path: segments.slice(0, index + 1).join('/'),
      };
    }
  }

  return null;
}

function inferCollectionNameFromFolderPaths(folderPaths, albumTitle = '') {
  for (const folderPath of folderPaths || []) {
    const collectionName = inferCollectionNameFromFolderPath(folderPath, albumTitle);
    if (collectionName) return collectionName;
  }
  return '';
}

function normalizeCollectionText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[_()[\]{}.,-]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function humanizeFolderName(value) {
  return String(value || '')
    .replace(/[_]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function compareAlbumsNaturally(left, right) {
  return naturalCompare(left.artist, right.artist)
    || naturalCompare(left.title, right.title)
    || naturalCompare(left.id, right.id);
}

function naturalCompare(left, right) {
  return NATURAL_SORTER.compare(String(left || ''), String(right || ''));
}

function getBestAudioQualityFromRows(qualities) {
  if (!qualities.length) return null;
  return [...qualities].sort((left, right) => getAudioQualityRank(right) - getAudioQualityRank(left))[0];
}

function getAudioQualityRank(quality) {
  const bitDepth = quality?.bitDepth || 0;
  const sampleRate = quality?.sampleRate || 0;
  const bitrate = quality?.bitrate || 0;

  if (bitDepth >= 24 && sampleRate > 96000) return 5000 + sampleRate;
  if (bitDepth >= 24 && sampleRate > 44100) return 4000 + sampleRate;
  if (bitDepth === 16 && sampleRate === 44100) return 3000;
  if (bitrate >= 300000) return 2000 + bitrate;
  return bitDepth * 10 + sampleRate / 1000 + bitrate / 1000000;
}

function rowToTrack(row) {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    albumArtist: row.album_artist,
    album: row.album,
    trackNumber: row.track_number,
    discNumber: row.disc_number,
    date: row.date || '',
    year: row.year || null,
    relativePath: row.relative_path,
    path: row.absolute_path,
    fileSize: row.file_size,
    mtimeMs: row.mtime_ms,
    scanMetadata: Boolean(row.scan_metadata),
    scanDurations: Boolean(row.scan_durations),
    coverArtPath: row.cover_art_path || null,
    cachedCoverPath: row.cached_cover_path || null,
    cachedCoverFormat: row.cached_cover_format || '',
    hasEmbeddedCover: Boolean(row.has_embedded_cover),
    duration: row.duration,
    audioQuality: parseJson(row.audio_quality_json, null),
  };
}

function rowToPlaylistSummary(row) {
  return {
    id: row.id,
    name: row.name,
    trackCount: Number(row.track_count) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function readPlaylistFromConnection(db, ownerKey, playlistId) {
  const row = db.prepare(`
    SELECT
      playlists.id,
      playlists.name,
      playlists.created_at,
      playlists.updated_at,
      COUNT(tracks.id) AS track_count
    FROM playlists
    LEFT JOIN playlist_tracks ON playlist_tracks.playlist_id = playlists.id
    LEFT JOIN tracks ON tracks.id = playlist_tracks.track_id
    WHERE playlists.id = ? AND playlists.owner_key = ?
    GROUP BY playlists.id
  `).get(playlistId, ownerKey);
  if (!row) return null;

  const tracks = db.prepare(`
    SELECT tracks.*
    FROM playlist_tracks
    INNER JOIN tracks ON tracks.id = playlist_tracks.track_id
    WHERE playlist_tracks.playlist_id = ?
    ORDER BY playlist_tracks.position, playlist_tracks.added_at
  `).all(playlistId).map(rowToTrack);
  return { ...rowToPlaylistSummary(row), tracks };
}

function assertOwnedPlaylist(db, ownerKey, playlistId) {
  if (!db.prepare('SELECT 1 FROM playlists WHERE id = ? AND owner_key = ?').get(playlistId, ownerKey)) {
    throw createPlaylistDatabaseError('PLAYLIST_NOT_FOUND', 'Playlist not found.');
  }
}

function normalizePlaylistName(value) {
  return String(value || '').trim().replace(/\s+/gu, ' ');
}

function createPlaylistDatabaseError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function rowToAlbum(row) {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    albumArtist: row.album_artist,
    date: row.date || '',
    year: row.year || null,
    collectionName: row.collection_name || '',
    coverTrackId: row.cover_track_id || null,
    trackIds: parseJson(row.track_ids_json, []),
    audioQuality: parseJson(row.audio_quality_json, null),
  };
}

function rowToExcelAlbumExport(row) {
  const override = parseJson(row.override_json, {}) || {};
  const title = cleanOverrideText(override.albumTitle || override.title || row.title);
  const albumArtist = cleanOverrideText(override.albumArtist || row.album_artist || row.artist);
  const artist = cleanOverrideText(override.artist || row.artist);
  const mediaTypes = normalizeExportMediaTypes(override.mediaTypes || override.mediaType);
  const status = normalizeExportStatus(override.status);
  const folderPaths = splitFolderPaths(row.folder_paths);

  return {
    id: row.id,
    title,
    artist,
    albumArtist,
    year: cleanOverrideText(override.year || row.year),
    date: cleanOverrideText(override.date || row.date),
    genre: cleanOverrideText(override.genre),
    status,
    mediaTypes,
    collectionName: cleanOverrideText(override.collectionName || row.collection_name),
    trackCount: Number(row.track_count) || parseJson(row.track_ids_json, []).length || 0,
    folderPath: folderPaths[0] || '',
    folderPaths: folderPaths.join('; '),
    audioQuality: formatAudioQualityForExport(parseJson(row.audio_quality_json, null)),
    source: 'Scanned',
  };
}

function rowToManualExcelAlbumExport(row) {
  const override = parseJson(row.payload_json, {}) || {};
  if (!override.manual) return null;
  const tracks = Array.isArray(override.tracks) ? override.tracks : [];
  return {
    id: row.album_id,
    title: cleanOverrideText(override.albumTitle || override.title || row.album_id),
    artist: cleanOverrideText(override.artist || override.albumArtist),
    albumArtist: cleanOverrideText(override.albumArtist || override.artist),
    year: cleanOverrideText(override.year),
    date: cleanOverrideText(override.date),
    genre: cleanOverrideText(override.genre),
    status: normalizeExportStatus(override.status),
    mediaTypes: normalizeExportMediaTypes(override.mediaTypes || override.mediaType, []),
    collectionName: cleanOverrideText(override.collectionName),
    trackCount: tracks.length,
    folderPath: '',
    folderPaths: '',
    audioQuality: '',
    source: 'Manual',
  };
}

function normalizeExportStatus(value) {
  const status = cleanOverrideText(value);
  if (/^wanted$/iu.test(status)) return 'Wishlist';
  if (/^wishlist$/iu.test(status)) return 'Wishlist';
  if (/^collection$/iu.test(status)) return 'Collection';
  return 'Collection';
}

function normalizeExportMediaTypes(value, fallback = ['Digital Media']) {
  const values = Array.isArray(value) ? value : [value];
  const allowed = new Set(['CD', 'Digital Media', 'Vinyl', 'Cassette Tape']);
  const mediaTypes = values
    .map(normalizeExportMediaTypeName)
    .filter((mediaType) => allowed.has(mediaType));
  return mediaTypes.length > 0 ? [...new Set(mediaTypes)] : [...fallback];
}

function normalizeExportMediaTypeName(value) {
  const mediaType = cleanOverrideText(value);
  if (/^(digital|digital media|file|file audio|file-audio)$/iu.test(mediaType)) return 'Digital Media';
  if (/^cassette[-\s]?tape$/iu.test(mediaType)) return 'Cassette Tape';
  if (/^cd$/iu.test(mediaType)) return 'CD';
  if (/^vinyl$/iu.test(mediaType)) return 'Vinyl';
  return mediaType;
}

function matchesExcelExportOptions(row, options = {}) {
  if (options.wishlistOnly && row.status !== 'Wishlist') return false;
  const mediaTypes = normalizeExportMediaTypes(options.mediaTypes, []);
  if (mediaTypes.length > 0 && !row.mediaTypes.some((mediaType) => mediaTypes.includes(mediaType))) return false;
  return true;
}

function splitFolderPaths(value) {
  return [...new Set(String(value || '')
    .split(',')
    .map((folderPath) => folderPath.trim())
    .filter(Boolean))];
}

function formatAudioQualityForExport(audioQuality) {
  if (!audioQuality || typeof audioQuality !== 'object') return '';
  if (audioQuality.label) return cleanOverrideText(audioQuality.label);
  if (audioQuality.kind === 'mp3') return audioQuality.bitrate ? `MP3 ${audioQuality.bitrate} kbps` : 'MP3';
  const bitDepth = audioQuality.bitDepth ? `${audioQuality.bitDepth}-Bit` : '';
  const sampleRate = audioQuality.sampleRate ? `${Number(audioQuality.sampleRate / 1000).toFixed(audioQuality.sampleRate % 1000 === 0 ? 0 : 1)} KHz` : '';
  return [bitDepth, sampleRate].filter(Boolean).join(' / ');
}

function compareExcelAlbumExports(left, right) {
  const artistCompare = NATURAL_SORTER.compare(left.albumArtist || left.artist || '', right.albumArtist || right.artist || '');
  if (artistCompare !== 0) return artistCompare;
  return NATURAL_SORTER.compare(left.title || '', right.title || '');
}

function getMetadata(db, key) {
  return db.prepare('SELECT value FROM metadata WHERE key = ?').get(key)?.value || null;
}

function setMetadata(db, key, value) {
  db.prepare(`
    INSERT INTO metadata (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function cleanOverrideText(value) {
  return String(value || '').trim();
}

function normalizeOverrideKey(value) {
  return cleanOverrideText(value).toLowerCase().replace(/\s+/gu, ' ');
}

function escapeSqlString(value) {
  return String(value || '').replace(/'/gu, "''");
}

function numberOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function clampLimit(value) {
  const parsed = Number.parseInt(value || 50, 10);
  if ([25, 50, 100, 200, 500].includes(parsed)) return parsed;
  return 50;
}

function createPageInfo(options, total) {
  const limit = clampLimit(options.limit);
  const offset = Math.max(0, Number.parseInt(options.offset || 0, 10) || 0);
  return {
    limit,
    offset,
    total,
    hasNext: offset + limit < total,
    hasPrevious: offset > 0,
  };
}

function normalizeLetterFilter(letter) {
  const normalized = String(letter || 'all').trim().toUpperCase();
  if (normalized === '#' || /^[A-Z]$/u.test(normalized)) return normalized;
  return 'all';
}

function cleanSearchValue(value) {
  return String(value || '').trim();
}

function normalizeSearchIndexText(value) {
  return cleanSearchValue(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replace(/['’`]/gu, '')
    .replace(/&/gu, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}

function normalizeSearchTokens(value) {
  return normalizeSearchIndexText(value).split(' ').filter(Boolean).slice(0, 12);
}

function addIndexedSearchFilter(db, where, params, sourceTable, columns, search, prefix = 'search') {
  const tokens = normalizeSearchTokens(search);
  if (tokens.length === 0) return;

  const searchTable = sourceTable === 'albums'
    ? 'albums_fts'
    : sourceTable === 'tracks' ? 'tracks_fts' : '';
  const supportsTrigramSearch = tokens.every((token) => [...token].length >= 3);
  if (!searchTable || !supportsTrigramSearch || !isSearchIndexAvailable(db)) {
    addTokenSearchFilter(where, params, columns, search, prefix);
    return;
  }

  const key = `$${prefix}Fts`;
  const columnScope = columns.length === 1 ? columns[0] : `{${columns.join(' ')}}`;
  params[key] = tokens.map((token) => `${columnScope} : "${token}"`).join(' AND ');
  where.push(`${sourceTable}.rowid IN (
    SELECT rowid FROM ${searchTable} WHERE ${searchTable} MATCH ${key}
  )`);
}

function isSearchIndexAvailable(db) {
  if (SEARCH_INDEX_AVAILABILITY.has(db)) return SEARCH_INDEX_AVAILABILITY.get(db);
  const tableCount = db.prepare(`
    SELECT COUNT(*) AS count
    FROM sqlite_master
    WHERE type = 'table' AND name IN ('albums_fts', 'tracks_fts')
  `).get().count || 0;
  const available = getMetadata(db, 'searchIndexVersion') === SEARCH_INDEX_VERSION && tableCount === 2;
  SEARCH_INDEX_AVAILABILITY.set(db, available);
  return available;
}

function addTokenSearchFilter(where, params, columns, search, prefix = 'search') {
  const tokens = normalizeSearchTokens(search);
  if (tokens.length === 0) return;

  tokens.forEach((token, index) => {
    const key = `$${prefix}${index}`;
    params[key] = `%${token}%`;
    where.push(`(${columns.map((column) => `${sqlSearchExpression(column)} LIKE ${key}`).join(' OR ')})`);
  });
}

function sqlSearchExpression(column) {
  return `LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(${column}, '''', ''), '’', ''), '\`', ''), '&', ' and '), '-', ' '))`;
}

function addLetterFilter(where, params, column, letter) {
  if (!letter || letter === 'all') return;
  if (letter === '#') {
    where.push(`UPPER(SUBSTR(${column}, 1, 1)) NOT BETWEEN 'A' AND 'Z'`);
    return;
  }
  where.push(`UPPER(SUBSTR(${column}, 1, 1)) = $letter`);
  params.$letter = letter;
}

function normalizeFolderFilters(folders) {
  const values = Array.isArray(folders) ? folders : [folders];
  return [...new Set(values
    .map((folderPath) => normalizeFolderPath(folderPath))
    .filter(Boolean))];
}

function addAlbumFolderFilter(where, params, folders, prefix = 'folder') {
  const normalizedFolders = normalizeFolderFilters(folders);
  if (normalizedFolders.length === 0) return;
  const clauses = normalizedFolders.map((folderPath, index) => {
    const exactKey = `$${prefix}Folder${index}`;
    const prefixKey = `$${prefix}FolderPrefix${index}`;
    params[exactKey] = folderPath;
    params[prefixKey] = buildLikePrefix(folderPath, '/');
    return `(tracks.folder_path = ${exactKey} OR tracks.folder_path LIKE ${prefixKey} ESCAPE '\\')`;
  });
  where.push(`EXISTS (
    SELECT 1
    FROM album_tracks
    INNER JOIN tracks ON tracks.id = album_tracks.track_id
    WHERE album_tracks.album_id = albums.id
      AND (${clauses.join(' OR ')})
  )`);
}

function addTrackFolderFilter(where, params, folders, prefix = 'trackFolder') {
  const normalizedFolders = normalizeFolderFilters(folders);
  if (normalizedFolders.length === 0) return;
  const clauses = normalizedFolders.map((folderPath, index) => {
    const exactKey = `$${prefix}${index}`;
    const prefixKey = `$${prefix}Prefix${index}`;
    params[exactKey] = folderPath;
    params[prefixKey] = buildLikePrefix(folderPath, '/');
    return `(folder_path = ${exactKey} OR folder_path LIKE ${prefixKey} ESCAPE '\\')`;
  });
  where.push(`(${clauses.join(' OR ')})`);
}

function applyLetterToFolders(folders, letter) {
  if (!letter || letter === 'all') return folders;
  return folders.filter((folder) => firstLetterMatches(folder.name, letter));
}

function applyLetterToTracks(tracks, letter) {
  if (!letter || letter === 'all') return tracks;
  return tracks.filter((track) => firstLetterMatches(track.title, letter));
}

function firstLetterMatches(value, letter) {
  const first = String(value || '').trim().charAt(0).toUpperCase();
  if (letter === '#') return !/^[A-Z]$/u.test(first);
  return first === letter;
}

function createEmptyLibrary() {
  return {
    generatedAt: null,
    trackCount: 0,
    albumCount: 0,
    tracks: [],
    albums: [],
  };
}

function createEmptyLibrarySummary() {
  return {
    generatedAt: null,
    trackCount: 0,
    albumCount: 0,
  };
}
