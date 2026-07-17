import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sourcesPromise = Promise.all([
  readFile(new URL('../src/components/navigation/Topbar.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/controller/appState.js', import.meta.url), 'utf8'),
  readFile(new URL('../public/css/02-browse-cards-tracks.css', import.meta.url), 'utf8'),
  readFile(new URL('../public/css/09-responsive.css', import.meta.url), 'utf8'),
]);

test('topbar submits search with its action button and Enter key', async () => {
  const [topbarSource] = await sourcesPromise;

  assert.match(topbarSource, /searchAction = 'hidden'/u);
  assert.match(topbarSource, /event\.key !== 'Enter'/u);
  assert.match(topbarSource, /event\.preventDefault\(\)/u);
  assert.match(topbarSource, /onSubmitSearch\?\.\(\)/u);
  assert.match(topbarSource, /aria-label=\{showSearchAction \? 'Search' : 'Clear search'\}/u);
  assert.match(topbarSource, /showSearchAction \? 'fa-magnifying-glass' : 'fa-xmark'/u);
});

test('typing only updates the search draft while submit commits immediately', async () => {
  const [, controllerSource, stateSource] = await sourcesPromise;
  const updateStart = controllerSource.indexOf('function updateSearchValue');
  const updateEnd = controllerSource.indexOf('function submitSearchValue', updateStart);
  const updateBlock = controllerSource.slice(updateStart, updateEnd);
  const submitStart = updateEnd;
  const submitEnd = controllerSource.indexOf('async function loadLibraryPage', submitStart);
  const submitBlock = controllerSource.slice(submitStart, submitEnd);

  assert.match(updateBlock, /state\.searchInputValue = value/u);
  assert.match(updateBlock, /renderTopbar\(\)/u);
  assert.doesNotMatch(updateBlock, /setTimeout|commitSearchValue/u);
  assert.match(submitBlock, /commitSearchValue\(state\.searchInputValue, \{ refresh: true, immediate: true \}\)/u);
  assert.doesNotMatch(controllerSource, /searchDebounceId|clearPendingSearchUpdate/u);
  assert.doesNotMatch(stateSource, /searchDebounceId/u);
});

test('submitted searches bypass delayed queues and do not prefetch adjacent result pages', async () => {
  const [, controllerSource] = await sourcesPromise;

  assert.match(controllerSource, /queueVisiblePageFetch\(0, \{ immediate \}\)/u);
  assert.match(controllerSource, /queueLibraryPageFetch\(0, \{ immediate \}\)/u);
  assert.match(controllerSource, /if \(!state\.searchTerm\) prefetchAdjacentLibraryPages/u);
  assert.match(controllerSource, /if \(!state\.searchTerm\) prefetchAdjacentWishlistPages/u);
  assert.match(controllerSource, /if \(!state\.searchTerm\) prefetchAdjacentArtistPages/u);
  assert.match(controllerSource, /if \(!state\.searchTerm\) prefetchAdjacentCollectionPages/u);
  assert.doesNotMatch(controllerSource, /prefetchAdjacentTrackPages/u);
});

test('search action remains available at mobile breakpoints', async () => {
  const [, , , browseCss, responsiveCss] = await sourcesPromise;

  assert.match(browseCss, /#search-action-button \{/u);
  assert.match(browseCss, /#search-action-button:hover \{/u);
  assert.doesNotMatch(browseCss, /#clear-search-button/u);
  assert.doesNotMatch(responsiveCss, /#search-action-button\s*\{[^}]*display:\s*none/isu);
  assert.doesNotMatch(responsiveCss, /#clear-search-button/u);
});
