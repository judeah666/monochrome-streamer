import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('album artist and collection detail heroes use the shared flat surface', async () => {
  const [albumDetail, artistDetail, collectionDetail] = await Promise.all([
    readFile(new URL('../src/components/albums/AlbumDetail.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/artists/ArtistDetail.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/collections/CollectionDetail.jsx', import.meta.url), 'utf8'),
  ]);

  assert.match(albumDetail, /album-hero detail-hero-flat/u);
  assert.match(artistDetail, /artist-hero detail-hero-flat/u);
  assert.match(collectionDetail, /collection-detail-hero detail-hero-flat/u);
  assert.match(albumDetail, /album-main detail-track-list/u);
});

test('detail and standard track rows are flat until hover or active state', async () => {
  const styles = await readFile(new URL('../src/styles/tailwind.css', import.meta.url), 'utf8');

  assert.match(styles, /:is\(\.album-hero, \.artist-hero, \.collection-detail-hero\)\.detail-hero-flat\s*\{[\s\S]*?border-color:\s*transparent;[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/u);
  assert.match(styles, /\.album-main\.detail-track-list\s*\{[\s\S]*?background:\s*transparent;/u);
  assert.match(styles, /\.track-list-shell \.track-row-shell,[\s\S]*?\.detail-track-list \.album-track-row-shell[\s\S]*?background:\s*transparent;/u);
  assert.match(styles, /\.track-list-shell \.track-row-shell:hover,[\s\S]*?background:\s*color-mix\(in srgb, var\(--accent\) 12%, var\(--surface-2\)\);/u);
});

test('library and related album sections use flat surfaces and one general heading', async () => {
  const [appShell, albumDetail, styles] = await Promise.all([
    readFile(new URL('../src/layouts/AppShell.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/albums/AlbumDetail.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles/tailwind.css', import.meta.url), 'utf8'),
  ]);

  assert.match(appShell, /content-section library-browser library-browser-flat/u);
  assert.match(albumDetail, /content-section album-related-flat/u);
  assert.match(albumDetail, /const moreAlbums = \[\.\.\.relatedAlbums, \.\.\.epAlbums\];/u);
  assert.match(albumDetail, /title=\{`More albums from \$\{album\.artist\}`\}/u);
  assert.doesNotMatch(albumDetail, /EPs and Singles from/u);
  assert.match(styles, /\.library-browser\.library-browser-flat\s*\{[\s\S]*?background:\s*transparent;/u);
  assert.match(styles, /\.album-sidebar \.content-section\.album-related-flat\s*\{[\s\S]*?background:\s*transparent;/u);
});

test('playlist settings and admin outer shells are flat without flattening their content', async () => {
  const [appShell, styles] = await Promise.all([
    readFile(new URL('../src/layouts/AppShell.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles/tailwind.css', import.meta.url), 'utf8'),
  ]);

  assert.match(appShell, /id="playlists-view"[\s\S]*?content-section library-browser library-browser-flat/u);
  assert.match(appShell, /id="settings-view"[\s\S]*?content-section settings-shell settings-shell-flat/u);
  assert.match(appShell, /id="admin-view"[\s\S]*?content-section settings-shell settings-shell-flat admin-main-shell/u);
  assert.match(styles, /\.settings-shell\.settings-shell-flat\s*\{[\s\S]*?border-color:\s*transparent;[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/u);
  assert.doesNotMatch(styles, /\.settings-group\.settings-shell-flat/u);
  assert.doesNotMatch(styles, /\.admin-table-wrap\.settings-shell-flat/u);
});
