import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = readFileSync(new URL('../src/controller/appController.js', import.meta.url), 'utf8');
const navigateSource = source.match(/function navigateFromSidebar\(view\) \{[\s\S]*?\n\}/u)[0];

test('library sidebar destinations select the requested panel, request fresh data, preserve filters, and close mobile navigation', () => {
  for (const mobile of [false, true]) {
    for (const tab of ['albums', 'artists', 'tracks']) {
      const folders = new Set(['Music']);
      const calls = [];
      const state = { libraryTab: 'collections', folderFilters: folders, unsearchedLibraryStale: false };
      const context = vm.createContext({
        state,
        navigateToView: view => calls.push([view, state.libraryTab, state.unsearchedLibraryStale]),
        isMobileSidebarLayout: () => mobile,
        setMobileSidebarOpen: open => calls.push(['mobile', open]),
        isCurrentUserAdmin: () => false,
      });
      vm.runInContext(navigateSource, context);
      context.navigateFromSidebar(tab);
      assert.deepEqual(calls, [['library', tab, true], ...(mobile ? [['mobile', false]] : [])]);
      assert.equal(state.folderFilters, folders);
      assert.deepEqual([...folders], ['Music']);
    }
  }
});
