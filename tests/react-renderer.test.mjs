import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasReactRenderer,
  renderReact,
  unmountReact,
} from '../src/controller/reactRenderer.js';

test('react renderer adapter delegates to the installed bridge', () => {
  const previousWindow = globalThis.window;
  const calls = [];
  globalThis.window = {
    MonochromeReact: {
      renderThing(container, props) {
        calls.push({ container, props });
      },
      unmount(container) {
        calls.push({ unmount: container });
      },
    },
  };

  try {
    const container = { id: 'target' };

    assert.equal(hasReactRenderer('renderThing'), true);
    assert.equal(hasReactRenderer('missing'), false);
    assert.equal(renderReact('renderThing', container, { value: 1 }), true);
    assert.equal(renderReact('missing', container, { value: 2 }), false);
    unmountReact(container);

    assert.deepEqual(calls, [
      { container, props: { value: 1 } },
      { unmount: container },
    ]);
  } finally {
    globalThis.window = previousWindow;
  }
});
