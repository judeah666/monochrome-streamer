import { existsSync, promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const SCHEMA_VERSION = 4;
const COLLECTION_INFERENCE_VERSION = '2';
const NATURAL_SORTER = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

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

export async function readLibraryAlbumPage(databasePath, options = {}) {
  if (!databasePath || !existsSync(databasePath)) {
    return {
      ...createEmptyLibrary(),
      page: createPageInfo(options, 0),
    };
  }

  const db = await openDatabase(databasePath);
  try {
    const limit = clampLimit(options.limit);
    const offset = Math.max(0, Number.parseInt(options.offset || 0, 10) || 0);
    const search = String(options.search || '').trim().toLowerCase();
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
        page: createPageInfo(options, 0),
      };
    }

    if (search) {
      where.push('(LOWER(title) LIKE $search OR LOWER(artist) LIKE $search OR LOWER(album_artist) LIKE $search)');
      params.$search = `%${search}%`;
    }
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

    const albums = rows.map(rowToAlbum);
    const trackIds = albums.flatMap((album) => album.trackIds || []);
    const tracks = readTracksByIds(db, trackIds);

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
      albumCount: totalAlbums,
      tracks,
      albums,
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
      page: createPageInfo(options, 0),
    };
  }

  const db = await openDatabase(databasePath);
  try {
    const limit = clampLimit(options.limit);
    const offset = Math.max(0, Number.parseInt(options.offset || 0, 10) || 0);
    const search = String(options.search || '').trim().toLowerCase();
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
        page: createPageInfo(options, 0),
      };
    }

    if (search) {
      where.push('(LOWER(title) LIKE $search OR LOWER(artist) LIKE $search OR LOWER(album_artist) LIKE $search)');
      params.$search = `%${search}%`;
    }
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

    const albums = rows.map(rowToAlbum);
    const trackIds = albums.flatMap((album) => album.trackIds || []);
    const tracks = readTracksByIds(db, trackIds);

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
      albumCount: totalAlbums,
      tracks,
      albums,
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
    const search = String(options.search || '').trim().toLowerCase();
    const params = {};
    const where = ["collection_name != ''"];
    if (search) {
      where.push('LOWER(collection_name) LIKE $search');
      params.$search = `%${search}%`;
    }

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

export async function readCollectionFolderAlbumPage(databasePath, folderPath, options = {}) {
  if (!databasePath || !existsSync(databasePath) || !folderPath) {
    return {
      ...createEmptyLibrary(),
      page: createPageInfo(options, 0),
    };
  }

  const db = await openDatabase(databasePath);
  try {
    const collectionName = String(folderPath || '').trim();
    const limit = clampLimit(options.limit);
    const offset = Math.max(0, Number.parseInt(options.offset || 0, 10) || 0);
    const search = String(options.search || '').trim().toLowerCase();
    const letter = normalizeLetterFilter(options.letter);
    const restrictAlbumIds = Array.isArray(options.albumIds);
    const albumIds = restrictAlbumIds ? options.albumIds.filter(Boolean) : [];
    const includeAlbumIds = Array.isArray(options.includeAlbumIds) ? options.includeAlbumIds.filter(Boolean) : [];
    const excludeAlbumIds = new Set(Array.isArray(options.excludeAlbumIds) ? options.excludeAlbumIds.filter(Boolean) : []);
    const where = ['LOWER(collection_name) = $collectionName'];
    const params = {
      $collectionName: collectionName.toLowerCase(),
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
    if (search) {
      where.push('(LOWER(title) LIKE $search OR LOWER(artist) LIKE $search OR LOWER(album_artist) LIKE $search)');
      params.$search = `%${search}%`;
    }
    addLetterFilter(where, params, 'title', letter);

    const whereSql = `WHERE ${where.join(' AND ')}`;
    const rows = db.prepare(`
      SELECT * FROM albums
      ${whereSql}
      ORDER BY artist, title
    `).all(params);
    const allAlbums = rows.map(rowToAlbum).sort(compareAlbumsNaturally);
    const totalAlbums = allAlbums.length;
    const pageAlbums = allAlbums.slice(offset, offset + limit);
    const pageTrackIds = new Set(pageAlbums.flatMap((album) => album.trackIds || []));
    const pageTracks = readTracksByIds(db, [...pageTrackIds]);

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
      albumCount: totalAlbums,
      tracks: pageTracks,
      albums: pageAlbums,
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
    const rows = db.prepare(`
      SELECT * FROM albums
      ORDER BY RANDOM()
      LIMIT $limit
    `).all({ $limit: limit });
    const albums = rows.map(rowToAlbum);
    const trackIds = albums.flatMap((album) => album.trackIds || []);
    const tracks = readTracksByIds(db, trackIds);

    return {
      generatedAt: getMetadata(db, 'generatedAt'),
      trackCount: db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0,
      albumCount: db.prepare('SELECT COUNT(*) AS count FROM albums').get().count || 0,
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
    const search = String(options.search || '').trim().toLowerCase();
    const letter = normalizeLetterFilter(options.letter);
    const trackIds = Array.isArray(options.trackIds) ? options.trackIds.filter(Boolean) : [];
    const limit = trackIds.length > 0
      ? Math.max(trackIds.length, 1)
      : clampLimit(options.limit);
    const where = [];
    const params = {};

    if (search) {
      where.push('LOWER(title) LIKE $search');
      params.$search = `%${search}%`;
    }
    addLetterFilter(where, params, 'title', letter);

    if (trackIds.length > 0) {
      where.push(`id IN (${trackIds.map((_, index) => `$trackId${index}`).join(', ')})`);
      trackIds.forEach((trackId, index) => {
        params[`$trackId${index}`] = trackId;
      });
    }

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
    const search = String(options.search || '').trim().toLowerCase();
    const letter = normalizeLetterFilter(options.letter);
    const whereSql = search ? 'WHERE LOWER(artist) LIKE $search' : '';
    const params = search ? { $search: `%${search}%` } : {};
    const artistWhere = [];
    if (search) {
      artistWhere.push('LOWER(artist) LIKE $search');
    }
    addLetterFilter(artistWhere, params, 'artist', letter);
    const artistWhereSql = artistWhere.length > 0 ? `WHERE ${artistWhere.join(' AND ')}` : '';
    const total = db.prepare(`SELECT COUNT(*) AS count FROM (SELECT artist FROM tracks ${artistWhereSql} GROUP BY artist)`).get(params).count || 0;
    const artists = db.prepare(`
      SELECT
        tracks.artist AS name,
        COUNT(tracks.id) AS trackCount,
        COUNT(DISTINCT tracks.album_artist || '::' || tracks.album) AS albumCount
      FROM tracks
      LEFT JOIN album_tracks ON album_tracks.track_id = tracks.id
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

export async function readArtistLibrary(databasePath, artistName) {
  if (!databasePath || !existsSync(databasePath) || !artistName) return createEmptyLibrary();

  const db = await openDatabase(databasePath);
  try {
    const tracks = db.prepare(`
      SELECT * FROM tracks
      WHERE artist = $artist
      ORDER BY album, disc_number, track_number, title
    `).all({ $artist: artistName }).map(rowToTrack);
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
    const search = String(options.search || '').trim().toLowerCase();
    const folderWhere = ['parent_path = $parentPath'];
    const trackWhere = ['folder_path = $folderPath'];
    const folderParams = {
      $parentPath: normalizedPath,
    };
    const trackParams = {
      $folderPath: normalizedPath,
    };

    if (search) {
      folderWhere.push('LOWER(name) LIKE $search');
      trackWhere.push('(LOWER(title) LIKE $search OR LOWER(artist) LIKE $search OR LOWER(album) LIKE $search OR LOWER(normalized_relative_path) LIKE $search)');
      folderParams.$search = `%${search}%`;
      trackParams.$search = `%${search}%`;
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
    const total = db.prepare(`
      SELECT COALESCE(total_track_count, 0) AS count
      FROM folders
      WHERE path = $folderPath
    `).get({ $folderPath: normalizedPath })?.count ?? (normalizedPath ? 0 : db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0);

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
    const search = String(options.search || '').trim().toLowerCase();
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
    insertMetadata.run('schemaVersion', String(SCHEMA_VERSION));
    insertMetadata.run('generatedAt', library.generatedAt || new Date().toISOString());
    insertMetadata.run('collectionInferenceVersion', COLLECTION_INFERENCE_VERSION);

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

  if (search) {
    where.push('(LOWER(title) LIKE $search OR LOWER(artist) LIKE $search OR LOWER(album) LIKE $search OR LOWER(normalized_relative_path) LIKE $search)');
    params.$search = `%${search}%`;
  }

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
    CREATE INDEX IF NOT EXISTS idx_albums_collection_name ON albums(collection_name);

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

    CREATE TABLE IF NOT EXISTS lyrics_overrides (
      track_id TEXT PRIMARY KEY,
      title TEXT,
      artist TEXT,
      album TEXT,
      payload_json TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_lyrics_overrides_lookup ON lyrics_overrides(title, artist, album);
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
  return db;
}

function ensureColumn(db, tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  if (columns.some((column) => column.name === columnName)) return;
  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}

function migrateFolderIndex(db) {
  const trackCount = db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count || 0;
  if (trackCount === 0) {
    setMetadata(db, 'schemaVersion', String(SCHEMA_VERSION));
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
  const shouldRebuildFolders = schemaVersion < SCHEMA_VERSION || missingFolderPathCount > 0 || folderCount === 0;

  if (missingFolderPathCount > 0) {
    backfillTrackFolderColumns(db);
  }
  if (shouldRebuildFolders) {
    rebuildFolderIndex(db);
  }
  setMetadata(db, 'schemaVersion', String(SCHEMA_VERSION));
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
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const row of rows) {
      const inferred = inferCollectionNameFromFolderPaths(
        String(row.folder_paths || '').split('\u001f').filter(Boolean),
        row.title || '',
      );
      if (inferred && inferred !== row.collection_name) {
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
  const existingCollections = new Map();
  for (const row of db.prepare("SELECT id, collection_name FROM albums WHERE collection_name != ''").iterate()) {
    existingCollections.set(row.id, row.collection_name);
  }

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
        collectionName: existingCollections.get(albumId) || inferCollectionNameFromFolderPath(row.folder_path, albumTitle),
        coverTrackId: row.cover_art_path || row.has_embedded_cover ? row.id : '',
        trackIds: [],
        qualities: [],
      });
    }

    const album = albumMap.get(albumId);
    album.trackIds.push(row.id);
    if (!album.date && row.date) album.date = row.date;
    if (!album.year && row.year) album.year = row.year;
    if (!album.collectionName) {
      album.collectionName = existingCollections.get(albumId) || inferCollectionNameFromFolderPath(row.folder_path, albumTitle);
    }
    if (!album.coverTrackId && (row.cover_art_path || row.has_embedded_cover)) {
      album.coverTrackId = row.id;
    }
    const quality = parseJson(row.audio_quality_json, null);
    if (quality) album.qualities.push(quality);
  }

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
  const segments = String(folderPath || '').split('/').filter(Boolean);
  if (segments.length === 0) return '';

  const ancestorSegments = segments.slice(0, -1);
  const parentCollectionSegment = ancestorSegments.find((segment) => {
    return /\bcollections?\b/iu.test(normalizeCollectionText(segment));
  });
  if (parentCollectionSegment) {
    return humanizeFolderName(parentCollectionSegment);
  }

  const normalizedAlbumTitle = normalizeCollectionText(albumTitle);
  for (const segment of segments.slice(0, -1).reverse()) {
    const normalizedSegment = normalizeCollectionText(segment);
    const hasCollectionWord = /\bcollections?\b/iu.test(normalizedSegment);
    const hasAlbumWord = /\balbums?\b/iu.test(normalizedSegment);
    const containsAlbumTitle = normalizedAlbumTitle
      && normalizedSegment.includes(normalizedAlbumTitle)
      && normalizedAlbumTitle.length >= 3;
    if (hasCollectionWord && (hasAlbumWord || containsAlbumTitle)) {
      return humanizeFolderName(segment);
    }
  }

  const joinedPath = normalizeCollectionText(segments.join(' '));
  if (/\bcollections?\b/iu.test(joinedPath) && /\balbums?\b/iu.test(joinedPath)) {
    const collectionSegment = segments.find((segment) => /\bcollections?\b/iu.test(normalizeCollectionText(segment)));
    return collectionSegment ? humanizeFolderName(collectionSegment) : '';
  }

  return '';
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

function addLetterFilter(where, params, column, letter) {
  if (!letter || letter === 'all') return;
  if (letter === '#') {
    where.push(`UPPER(SUBSTR(${column}, 1, 1)) NOT BETWEEN 'A' AND 'Z'`);
    return;
  }
  where.push(`UPPER(SUBSTR(${column}, 1, 1)) = $letter`);
  params.$letter = letter;
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
