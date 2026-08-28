import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  createAlbumSharePage,
  createAlbumShareUnavailablePage,
  getAlbumSharePath,
} from '../src/shared/albumShare.js';

test('album share paths encode opaque tokens for preview crawlers', () => {
  assert.equal(getAlbumSharePath('token_A-B'), '/share/album/token_A-B');
});

test('album share page exposes album metadata and boots the isolated share player', () => {
  const html = createAlbumSharePage({
    siteTitle: 'Jestre Streamer',
    album: { title: 'Album <One>', albumArtist: 'Artist & Co', year: '2026' },
    canonicalUrl: 'https://music.example/share/album/album-1',
    imageUrl: 'https://music.example/api/albums/album-1/cover?size=1000',
    sharePayload: { album: { id: 'album-1' }, tracks: [{ id: 'track-1' }], expiresAt: '2026-09-04T10:00:00.000Z' },
  });

  assert.match(html, /property="og:type" content="music\.album"/u);
  assert.match(html, /property="og:title" content="Album &lt;One&gt; by Artist &amp; Co \| Jestre Streamer"/u);
  assert.match(html, /property="og:image" content="https:\/\/music\.example\/api\/albums\/album-1\/cover\?size=1000"/u);
  assert.match(html, /property="og:url" content="https:\/\/music\.example\/share\/album\/album-1"/u);
  assert.match(html, /window\.__MONOCHROME_ALBUM_SHARE__=/u);
  assert.match(html, /"tracks":\[\{"id":"track-1"\}\]/u);
  assert.match(html, /"expiresAt":"2026-09-04T10:00:00.000Z"/u);
  assert.match(html, /src="\/react\/share\.js"/u);
  assert.doesNotMatch(html, /window\.location\.replace/u);
});

test('expired album share page is branded without leaking album metadata', () => {
  const html = createAlbumShareUnavailablePage({
    siteTitle: 'Jestre Streamer',
    title: 'Album link expired',
    message: 'This album link has expired.',
  });
  assert.match(html, /Album link expired/u);
  assert.match(html, /This album link has expired\./u);
  assert.match(html, /noindex, nofollow/u);
  assert.doesNotMatch(html, /window\.__MONOCHROME_ALBUM_SHARE__/u);
});

test('server handles isolated album shares before authentication and scopes public streams', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const authGateIndex = source.indexOf('if (!authUser) {');
  const shareRouteIndex = source.indexOf('const albumShareMatch =');
  const authenticatedRouterIndex = source.indexOf('const authUser = await getAuthenticatedUser(request);');
  const shareCreateRouteIndex = source.indexOf('const albumShareCreateMatch =');
  const loginHandlerIndex = source.indexOf('async function handleLogin');

  assert.ok(shareRouteIndex >= 0 && authGateIndex > shareRouteIndex);
  assert.ok(
    shareCreateRouteIndex > authenticatedRouterIndex && shareCreateRouteIndex < loginHandlerIndex,
    'Expected album share creation inside the main authenticated router',
  );
  assert.match(source, /const albumShareMatch = \/\^\\\/share\\\/album/u);
  assert.match(source, /resolveStoredAlbumShare\(token\)/u);
  assert.match(source, /resolution\.status === 'expired'[\s\S]*respondHtml\(response, 410/u);
  assert.match(source, /albumShareCreateMatch[\s\S]*isAdminUser\(authUser\)[\s\S]*assertPrivilegedMutation\(request, authUser, \{ requireAdmin: true \}\)/u);
  assert.match(source, /randomBytes\(32\)\.toString\('base64url'\)/u);
  assert.match(source, /tokenHash: hashAlbumShareToken\(token\)/u);
  assert.match(source, /albumIds: \[albumId\]/u);
  assert.match(source, /readSharedAlbumLibrary\(albumId, \{ includeTracks: true \}\)/u);
  assert.match(source, /includeCoverTracks: true/u);
  assert.match(source, /createAlbumSharePage/u);
  assert.match(source, /streamSharedAlbumTrack[\s\S]*trackBelongsToAlbum[\s\S]*streamTrack\(response, trackId, rangeHeader, 'original'\)/u);
  assert.match(source, /sharedTracks[\s\S]*Number\(left\.discNumber\)[\s\S]*Number\(left\.trackNumber\)/u);
  assert.match(source, /downloadsEnabled: false/u);
  assert.match(source, /expiresAt: new Date\(expiresAt\)\.toISOString\(\)/u);
});

test('isolated share UI exposes playback without download or app navigation controls', async () => {
  const shareSource = await readFile(new URL('../src/react/share.jsx', import.meta.url), 'utf8');

  assert.match(shareSource, /Guest listening · Downloads off/u);
  assert.match(shareSource, /Expires \{expiresAtLabel\}/u);
  assert.match(shareSource, /controlsList="nodownload noplaybackrate"/u);
  assert.match(shareSource, /prepareNextTrack[\s\S]*warmDecoder[\s\S]*promotePreparedTrack/u);
  assert.match(shareSource, /className="share-player"/u);
  assert.match(shareSource, /className="share-player-track"[\s\S]*className="share-player-controls"[\s\S]*className="share-progress"[\s\S]*className="share-transport"[\s\S]*className="share-player-actions"/u);
  assert.match(shareSource, /type="button" disabled aria-label="Downloads disabled"/u);
  assert.match(shareSource, /aria-pressed=\{shuffle\}[\s\S]*cycleRepeatMode/u);
  assert.doesNotMatch(shareSource, /<a\b|download=/u);
});

test('admin album share dialog accepts custom hours and preserves manual-copy fallback', async () => {
  const [dialogSource, controllerSource] = await Promise.all([
    readFile(new URL('../src/components/albums/AlbumShareDialog.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8'),
  ]);

  assert.match(dialogSource, /useState\('24'\)/u);
  assert.match(dialogSource, /type="number"/u);
  assert.match(dialogSource, /min="1"/u);
  assert.match(dialogSource, /max="720"/u);
  assert.match(dialogSource, /Enter any whole number from 1 to 720 hours\./u);
  assert.match(dialogSource, /onChange=\{\(event\) => setHoursInput\(event\.target\.value\)\}/u);
  assert.match(dialogSource, /Copy it manually below/u);
  assert.match(dialogSource, /readOnly value=\{shareLink\}/u);
  assert.match(controllerSource, /onShareAlbum: isCurrentUserAdmin\(\) \? openAlbumShareDialog : null/u);
  assert.match(controllerSource, /\/api\/albums\/\$\{encodeURIComponent\(albumId\)\}\/share/u);
  assert.match(controllerSource, /JSON\.stringify\(\{ expiresInHours \}\)/u);
});
