import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createAlbumSharePage, getAlbumSharePath } from '../src/shared/albumShare.js';

test('album share paths keep album ids server-visible for preview crawlers', () => {
  assert.equal(getAlbumSharePath('A/B & C'), '/share/album/A%2FB%20%26%20C');
});

test('album share page exposes album Open Graph metadata and opens the hash route', () => {
  const html = createAlbumSharePage({
    siteTitle: 'Jestre Streamer',
    album: { title: 'Album <One>', albumArtist: 'Artist & Co', year: '2026' },
    canonicalUrl: 'https://music.example/share/album/album-1',
    appUrl: 'https://music.example/#album/album-1',
    imageUrl: 'https://music.example/api/albums/album-1/cover?size=1000',
  });

  assert.match(html, /property="og:type" content="music\.album"/u);
  assert.match(html, /property="og:title" content="Album &lt;One&gt; by Artist &amp; Co \| Jestre Streamer"/u);
  assert.match(html, /property="og:image" content="https:\/\/music\.example\/api\/albums\/album-1\/cover\?size=1000"/u);
  assert.match(html, /property="og:url" content="https:\/\/music\.example\/share\/album\/album-1"/u);
  assert.match(html, /window\.location\.replace\("https:\/\/music\.example\/#album\/album-1"\)/u);
});

test('server handles album share previews with one album query after authentication policy', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const authGateIndex = source.indexOf('if (!authUser && !isPublicLoginShellRequest)');
  const shareRouteIndex = source.indexOf('const albumShareMatch =');

  assert.ok(authGateIndex >= 0 && shareRouteIndex > authGateIndex);
  assert.match(source, /const albumShareMatch = \/\^\\\/share\\\/album/u);
  assert.match(source, /albumIds: \[albumId\]/u);
  assert.match(source, /includeTracks: false/u);
  assert.match(source, /includeCoverTracks: true/u);
  assert.match(source, /createAlbumSharePage/u);
});
