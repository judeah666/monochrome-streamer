import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const controllerSource = fs.readFileSync(path.join(rootDir, 'src/controller/appController.js'), 'utf8');
const sidebarSource = fs.readFileSync(path.join(rootDir, 'src/components/navigation/Sidebar.jsx'), 'utf8');

test('Collections is a first-class sidebar destination', () => {
  assert.match(sidebarSource, /id: 'collections', label: 'Collections'/u);
  assert.match(controllerSource, /route\.view === 'collections'/u);
  assert.match(controllerSource, /state\.libraryTab = 'collections'/u);
});

test('Library tabs no longer duplicate the Collections destination', () => {
  assert.match(
    controllerSource,
    /LIBRARY_TAB_REGISTRY\.filter\(\(\[id\]\) => id !== 'collections'\)/u,
  );
  assert.match(controllerSource, /libraryTabsRoot\.hidden = state\.route\.view === 'collections'/u);
});

test('standalone Collections keeps existing collection loading and detail return flow', () => {
  assert.match(controllerSource, /function isCollectionBrowserRoute\(\)/u);
  assert.match(controllerSource, /state\.browseView = 'collections'/u);
  assert.match(controllerSource, /#collections/u);
});

test('Collections omits library filters and exposes an admin add action', () => {
  assert.match(controllerSource, /if \(viewContext\.isCollectionsView\) return false/u);
  assert.match(controllerSource, /filterProps: null/u);
  assert.match(controllerSource, /actionLabel: state\.route\.view === 'collections'.*'Add collection'/u);
  assert.doesNotMatch(
    controllerSource.match(/function buildCollectionPageParams[\s\S]*?\n\}/u)?.[0] || '',
    /appendFolderFilterParams|alphabetFilter/u,
  );
});

test('adding a collection reuses the album editor with collection membership required', () => {
  assert.match(controllerSource, /openAddAlbumEditor\(\{ target: 'collection' \}\)/u);
  assert.match(controllerSource, /title: 'Add Collection'/u);
  assert.match(controllerSource, /throw new Error\('Collection name is required\.'\)/u);
  assert.match(controllerSource, /status: 'Collection'/u);
});
