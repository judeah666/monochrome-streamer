import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

test('browser title follows playback, track changes, and app title without stale song names', () => {
  const source = readFileSync(new URL('../src/controller/appController.js', import.meta.url), 'utf8');
  const context = vm.createContext({
    state: { currentTrackId: 'one', trackMap: new Map([
      ['one', { title: 'Why (Radio Mix)', artist: 'Jackie Moore' }],
      ['two', { title: 'Next Song', artist: 'Next Artist' }],
      ['missing', {}],
    ]) },
    audioPlayer: { paused: true, ended: false },
    document: { title: '' }, getDisplayTitle: () => 'JeStreamer',
  });
  vm.runInContext(source.match(/function updateBrowserTitle\(\) \{[\s\S]*?\n\}/u)[0], context);
  const check = expected => { context.updateBrowserTitle(); assert.equal(context.document.title, expected); };
  check('JeStreamer | Local Streamer');
  context.audioPlayer.paused = false;
  check('Why (Radio Mix) - Jackie Moore');
  context.state.currentTrackId = 'two';
  check('Next Song - Next Artist');
  context.audioPlayer.ended = true;
  check('JeStreamer | Local Streamer');
  context.audioPlayer.ended = false;
  context.state.currentTrackId = 'missing';
  check('Unknown Title - Unknown Artist');
  context.state.currentTrackId = null;
  check('JeStreamer | Local Streamer');
});
