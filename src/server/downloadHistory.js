import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { normalizeDownloadQuality } from '../shared/downloadQuality.js';

export const DOWNLOAD_HISTORY_DAYS = 30;

export async function recordDownloadHistory(databasePath, entry = {}) {
  if (!databasePath || !entry.username) return null;

  const db = await openActivityDatabase(databasePath);
  try {
    const createdAt = Number(entry.createdAt) || Date.now();
    const cutoff = createdAt - (DOWNLOAD_HISTORY_DAYS * 24 * 60 * 60 * 1000);
    db.prepare('DELETE FROM download_history WHERE created_at < ?').run(cutoff);
    const result = db.prepare(`
      INSERT INTO download_history (
        username, download_kind, item_label, track_id, title, artist,
        album, quality, track_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      cleanHistoryText(entry.username, 120),
      entry.downloadKind === 'bulk' ? 'bulk' : 'track',
      cleanHistoryText(entry.itemLabel, 300),
      cleanHistoryText(entry.trackId, 160),
      cleanHistoryText(entry.title, 300),
      cleanHistoryText(entry.artist, 300),
      cleanHistoryText(entry.album, 300),
      normalizeDownloadQuality(entry.quality),
      Math.max(1, Number.parseInt(entry.trackCount, 10) || 1),
      createdAt,
    );
    return Number(result.lastInsertRowid) || null;
  } finally {
    db.close();
  }
}

export async function readDownloadHistory(databasePath, username, { days = DOWNLOAD_HISTORY_DAYS } = {}) {
  if (!databasePath || !username) return [];

  const db = await openActivityDatabase(databasePath);
  try {
    const safeDays = Math.max(1, Math.min(DOWNLOAD_HISTORY_DAYS, Number.parseInt(days, 10) || DOWNLOAD_HISTORY_DAYS));
    const cutoff = Date.now() - (safeDays * 24 * 60 * 60 * 1000);
    return db.prepare(`
      SELECT id, username, download_kind, item_label, track_id, title,
             artist, album, quality, track_count, created_at
      FROM download_history
      WHERE username = ? COLLATE NOCASE AND created_at >= ?
      ORDER BY created_at DESC, id DESC
    `).all(String(username), cutoff).map(rowToDownloadHistory);
  } finally {
    db.close();
  }
}

async function openActivityDatabase(databasePath) {
  await fs.mkdir(path.dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  try {
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA synchronous = NORMAL');
    db.exec('PRAGMA busy_timeout = 5000');
    db.exec(`
      CREATE TABLE IF NOT EXISTS download_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        download_kind TEXT NOT NULL,
        item_label TEXT NOT NULL DEFAULT '',
        track_id TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL DEFAULT '',
        artist TEXT NOT NULL DEFAULT '',
        album TEXT NOT NULL DEFAULT '',
        quality TEXT NOT NULL DEFAULT 'original',
        track_count INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_download_history_user_date
        ON download_history(username COLLATE NOCASE, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_download_history_date
        ON download_history(created_at);
    `);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

function cleanHistoryText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function rowToDownloadHistory(row) {
  return {
    id: Number(row.id) || 0,
    username: row.username || '',
    downloadKind: row.download_kind === 'bulk' ? 'bulk' : 'track',
    itemLabel: row.item_label || '',
    trackId: row.track_id || '',
    title: row.title || '',
    artist: row.artist || '',
    album: row.album || '',
    quality: normalizeDownloadQuality(row.quality),
    trackCount: Number(row.track_count) || 1,
    createdAt: new Date(Number(row.created_at) || 0).toISOString(),
  };
}
