import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const controllerUrl = new URL('../src/controller/appController.js', import.meta.url);

test('library tab navigation restores each tab page offset', async () => {
  const source = await readFile(controllerUrl, 'utf8');

  assert.match(source, /const pageOffset = getLibraryTabPageOffset\(tab\);/u);
  assert.match(source, /loadArtistPage\(pageOffset\)/u);
  assert.match(source, /loadCollectionFolders\(pageOffset\)/u);
  assert.match(source, /loadLibraryPage\(pageOffset\)/u);
  assert.match(source, /libraryOffset: getLibraryTabPageOffset\(state\.libraryTab\)/u);
  assert.match(source, /queueLibraryPageFetch\(safeLibraryOffset\)/u);
  assert.doesNotMatch(source, /loadArtistPage\(0\)[\s\S]{0,500}render\(\);\s*refreshUnsearchedRouteData/u);
});

test('paginated library panels render controls above and below results', async () => {
  const componentUrls = [
    new URL('../src/components/albums/AlbumCollection.jsx', import.meta.url),
    new URL('../src/components/library/LibraryPanels.jsx', import.meta.url),
    new URL('../src/components/collections/CollectionBrowser.jsx', import.meta.url),
  ];
  const sources = await Promise.all(componentUrls.map((url) => readFile(url, 'utf8')));

  for (const source of sources) {
    assert.match(source, /position="top"/u);
    assert.match(source, /position="bottom"/u);
  }
});
