import test from 'node:test';
import assert from 'node:assert/strict';
import {
  drawVisualizerFrame,
  shouldRunVisualizer,
  stopVisualizer,
  updateVisualizerState,
} from '../src/controller/visualizerController.js';

function createButton() {
  const classes = new Set();
  return {
    classList: {
      toggle(name, active) {
        if (active) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      },
    },
  };
}

test('shouldRunVisualizer only runs while fullscreen, active, and playing', () => {
  assert.equal(shouldRunVisualizer({ visualizerActive: true, view: 'fullscreen', paused: false }), true);
  assert.equal(shouldRunVisualizer({ visualizerActive: false, view: 'fullscreen', paused: false }), false);
  assert.equal(shouldRunVisualizer({ visualizerActive: true, view: 'album', paused: false }), false);
  assert.equal(shouldRunVisualizer({ visualizerActive: true, view: 'fullscreen', paused: true }), false);
});

test('updateVisualizerState toggles button and canvas visibility', () => {
  const button = createButton();
  const canvas = { hidden: false, getContext: () => ({}) };
  const state = {
    visualizerActive: false,
    visualizerFrameId: 123,
    route: { view: 'fullscreen' },
  };
  let cancelled = null;

  updateVisualizerState({
    state,
    audioPlayer: { paused: true },
    canvas,
    button,
    windowRef: {
      cancelAnimationFrame: (id) => { cancelled = id; },
    },
  });

  assert.equal(button.classList.contains('active'), false);
  assert.equal(canvas.hidden, true);
  assert.equal(cancelled, 123);
  assert.equal(state.visualizerFrameId, 0);
});

test('drawVisualizerFrame sizes canvas and draws frequency bars', () => {
  const fills = [];
  const context = {
    setTransformArgs: null,
    cleared: false,
    fillStyle: '',
    setTransform(...args) {
      this.setTransformArgs = args;
    },
    clearRect() {
      this.cleared = true;
    },
    fillRect(...args) {
      fills.push(args);
    },
  };
  const state = {
    analyserData: new Uint8Array([0, 128, 255]),
    analyser: {
      getByteFrequencyData(target) {
        target.set([0, 128, 255]);
      },
    },
  };
  const canvas = {
    clientWidth: 90,
    clientHeight: 30,
    width: 0,
    height: 0,
  };

  drawVisualizerFrame({
    state,
    canvas,
    context,
    windowRef: { devicePixelRatio: 2 },
  });

  assert.equal(canvas.width, 180);
  assert.equal(canvas.height, 60);
  assert.deepEqual(context.setTransformArgs, [2, 0, 0, 2, 0, 0]);
  assert.equal(context.cleared, true);
  assert.equal(fills.length, 3);
});

test('stopVisualizer cancels the active frame', () => {
  const state = { visualizerFrameId: 77 };
  let cancelled = null;

  stopVisualizer({
    state,
    windowRef: {
      cancelAnimationFrame: (id) => { cancelled = id; },
    },
  });

  assert.equal(cancelled, 77);
  assert.equal(state.visualizerFrameId, 0);
});
