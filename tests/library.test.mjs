import test from 'node:test';
import assert from 'node:assert/strict';
import { buildByteRange, createTrackId, inferTrackMetadata } from '../lib/library.mjs';

test('inferTrackMetadata uses folder structure and track number', () => {
  const metadata = inferTrackMetadata('Massive Attack\\Mezzanine\\03 - Teardrop.flac');

  assert.equal(metadata.artist, 'Massive Attack');
  assert.equal(metadata.album, 'Mezzanine');
  assert.equal(metadata.title, 'Teardrop');
  assert.equal(metadata.trackNumber, 3);
});

test('createTrackId is deterministic', () => {
  const left = createTrackId('Artist/Album/01 - Song.mp3');
  const right = createTrackId('Artist/Album/01 - Song.mp3');

  assert.equal(left, right);
  assert.match(left, /^[a-f0-9]{16}$/u);
});

test('buildByteRange handles regular partial requests', () => {
  const range = buildByteRange('bytes=100-199', 1000);

  assert.deepEqual(range, {
    start: 100,
    end: 199,
    statusCode: 206,
    contentLength: 100,
    contentRange: 'bytes 100-199/1000',
  });
});

test('buildByteRange handles suffix requests', () => {
  const range = buildByteRange('bytes=-128', 1000);

  assert.equal(range.start, 872);
  assert.equal(range.end, 999);
  assert.equal(range.statusCode, 206);
});
