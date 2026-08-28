import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createAlbumSharePage, getAlbumSharePath } from '../src/shared/albumShare.js';

test('album share paths keep album ids server-visible for preview crawlers', () => {
  assert.equal(getAlbumSharePath('A/B & C'), '/share/album/A%2FB%20%26%20C');
});

test('album share page exposes album metadata and boots the isolated share player', () => {
  const html = createAlbumSharePage({
    siteTitle: 'Jestre Streamer',
    album: { title: 'Album <One>', albumArtist: 'Artist & Co', year: '2026' },
    canonicalUrl: 'https://music.example/share/album/album-1',
    imageUrl: 'https://music.example/api/albums/album-1/cover?size=1000',
    sharePayload: { album: { id: 'album-1' }, tracks: [{ id: 'track-1' }] },
  });

  assert.match(html, /property="og:type" content="music\.album"/u);
  assert.match(html, /property="og:title" content="Album &lt;One&gt; by Artist &amp; Co \| Jestre Streamer"/u);
  assert.match(html, /property="og:image" content="https:\/\/music\.example\/api\/albums\/album-1\/cover\?size=1000"/u);
  assert.match(html, /property="og:url" content="https:\/\/music\.example\/share\/album\/album-1"/u);
  assert.match(html, /window\.__MONOCHROME_ALBUM_SHARE__=/u);
  assert.match(html, /"tracks":\[\{"id":"track-1"\}\]/u);
  assert.match(html, /src="\/react\/share\.js"/u);
  assert.doesNotMatch(html, /window\.location\.replace/u);
});

test('server handles isolated album shares before authentication and scopes public streams', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const authGateIndex = source.indexOf('if (!authUser) {');
  const shareRouteIndex = source.indexOf('const albumShareMatch =');

  assert.ok(shareRouteIndex >= 0 && authGateIndex > shareRouteIndex);
  assert.match(source, /const albumShareMatch = \/\^\\\/share\\\/album/u);
  assert.match(source, /albumIds: \[albumId\]/u);
  assert.match(source, /readSharedAlbumLibrary\(albumId, \{ includeTracks: true \}\)/u);
  assert.match(source, /includeCoverTracks: true/u);
  assert.match(source, /createAlbumSharePage/u);
  assert.match(source, /streamSharedAlbumTrack[\s\S]*trackBelongsToAlbum[\s\S]*streamTrack\(response, trackId, rangeHeader, 'original'\)/u);
  assert.match(source, /sharedTracks[\s\S]*Number\(left\.discNumber\)[\s\S]*Number\(left\.trackNumber\)/u);
  assert.match(source, /downloadsEnabled: false/u);
});

test('isolated share UI exposes playback without download or app navigation controls', async () => {
  const shareSource = await readFile(new URL('../src/react/share.jsx', import.meta.url), 'utf8');

  assert.match(shareSource, /Guest listening · Downloads off/u);
  assert.match(shareSource, /controlsList="nodownload noplaybackrate"/u);
  assert.match(shareSource, /prepareNextTrack[\s\S]*warmDecoder[\s\S]*promotePreparedTrack/u);
  assert.match(shareSource, /className="share-player"/u);
  assert.match(shareSource, /className="share-player-track"[\s\S]*className="share-player-controls"[\s\S]*className="share-progress"[\s\S]*className="share-transport"[\s\S]*className="share-player-actions"/u);
  assert.match(shareSource, /type="button" disabled aria-label="Downloads disabled"/u);
  assert.match(shareSource, /aria-pressed=\{shuffle\}[\s\S]*cycleRepeatMode/u);
  assert.doesNotMatch(shareSource, /<a\b|download=/u);
});
