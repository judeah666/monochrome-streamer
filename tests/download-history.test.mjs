import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  readDownloadHistory,
  recordDownloadHistory,
} from '../src/server/downloadHistory.js';

test('download history stores metadata and keeps only the latest 30 days', async () => {
  const databasePath = path.join(tmpdir(), `monochrome-download-history-${Date.now()}.sqlite`);
  const now = Date.now();
  try {
    await recordDownloadHistory(databasePath, {
      username: 'listener',
      downloadKind: 'track',
      itemLabel: 'old.flac',
      title: 'Old track',
      createdAt: now - (31 * 24 * 60 * 60 * 1000),
    });
    await recordDownloadHistory(databasePath, {
      username: 'Listener',
      downloadKind: 'bulk',
      itemLabel: 'favorites.zip',
      quality: 'mp3',
      trackCount: 12,
      createdAt: now,
    });

    const history = await readDownloadHistory(databasePath, 'listener');
    assert.equal(history.length, 1);
    assert.equal(history[0].downloadKind, 'bulk');
    assert.equal(history[0].itemLabel, 'favorites.zip');
    assert.equal(history[0].quality, 'mp3');
    assert.equal(history[0].trackCount, 12);

    await recordDownloadHistory(databasePath, {
      username: 'listener',
      downloadKind: 'track',
      itemLabel: 'compact.mp3',
      quality: 'mp3-128',
      createdAt: now + 1,
    });
    const updatedHistory = await readDownloadHistory(databasePath, 'listener');
    assert.equal(updatedHistory[0].quality, 'mp3-128');

    const db = new DatabaseSync(databasePath);
    try {
      assert.equal(db.prepare('SELECT COUNT(*) AS count FROM download_history').get().count, 2);
    } finally {
      db.close();
    }
  } finally {
    rmSync(databasePath, { force: true });
    rmSync(`${databasePath}-wal`, { force: true });
    rmSync(`${databasePath}-shm`, { force: true });
  }
});
