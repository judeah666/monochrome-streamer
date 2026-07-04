import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const editorModulePromise = loadEditorModule();

async function loadEditorModule() {
  const entry = new URL('../src/components/editors/EditorModals.jsx', import.meta.url);
  const result = await build({
    entryPoints: [fileURLToPath(entry)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    external: ['react'],
    loader: { '.svg': 'dataurl' },
    write: false,
  });
  const output = result.outputFiles[0];
  assert.ok(output, 'Expected bundled editor modal output');
  const bundleDir = fileURLToPath(new URL('../node_modules/.cache/monochrome-streamer-tests', import.meta.url));
  await mkdir(bundleDir, { recursive: true });
  const bundlePath = path.join(bundleDir, `editor-modals-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`);
  await writeFile(bundlePath, output.text, 'utf8');
  return import(pathToFileURL(bundlePath).href);
}

test('cover upload dropzone renders browse and drop affordances', async () => {
  const { CoverUploadDropzone } = await editorModulePromise;
  const html = renderToStaticMarkup(React.createElement(CoverUploadDropzone, {
    id: 'cover-test',
    filename: 'front.jpg',
  }));

  assert.match(html, /cover-upload-dropzone/u);
  assert.match(html, /type="file"/u);
  assert.match(html, /accept="image\/\*"/u);
  assert.match(html, /Cover image selected/u);
  assert.match(html, /front\.jpg/u);
});

test('cover upload helpers accept images and reject invalid files', async () => {
  const {
    coverUploadLimitBytes,
    getCoverUploadFileError,
    getFirstCoverUploadFile,
  } = await editorModulePromise;
  const image = { type: 'image/jpeg', size: 1024, name: 'front.jpg' };
  const text = { type: 'text/plain', size: 1024, name: 'notes.txt' };
  const large = { type: 'image/png', size: coverUploadLimitBytes + 1, name: 'huge.png' };

  assert.equal(getFirstCoverUploadFile([image, text]), image);
  assert.equal(getCoverUploadFileError(image), '');
  assert.equal(getCoverUploadFileError(text), 'Choose an image file for the cover.');
  assert.equal(getCoverUploadFileError(large), 'Cover image is too large. Choose an image under 16 MB.');
});

test('collection cover editor modal renders drag drop upload, url, and reset controls', async () => {
  const { CollectionCoverEditorModal } = await editorModulePromise;
  const html = renderToStaticMarkup(React.createElement(CollectionCoverEditorModal, {
    collectionName: 'Road Trip',
    currentCoverUrl: '/covers/current.jpg',
    coverUrl: 'https://example.test/cover.jpg',
    onClose: () => {},
    onSave: () => {},
  }));

  assert.match(html, /Edit Road Trip Cover/u);
  assert.match(html, /Use first album cover/u);
  assert.match(html, /Upload collection cover/u);
  assert.match(html, /cover-upload-dropzone/u);
  assert.match(html, /value="https:\/\/example.test\/cover.jpg"/u);
});

test('collection cover controller uses modal flow instead of prompt and confirm dialogs', async () => {
  const source = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');
  const start = source.indexOf('async function changeCollectionCover');
  const end = source.indexOf('function openFullscreenPlayer', start);
  const collectionCoverSource = source.slice(start, end);

  assert.match(collectionCoverSource, /renderCollectionCoverEditorModal/u);
  assert.match(collectionCoverSource, /async function saveCollectionCover/u);
  assert.doesNotMatch(collectionCoverSource, /window\.confirm/u);
  assert.doesNotMatch(collectionCoverSource, /window\.prompt/u);
});

test('collection cover save patches grid cards and bypasses stale folder cache', async () => {
  const source = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');
  const start = source.indexOf('async function saveCollectionCover');
  const end = source.indexOf('function openFullscreenPlayer', start);
  const collectionCoverSource = source.slice(start, end);

  assert.match(collectionCoverSource, /const result = await fetchJson\('\/api\/collections\/cover'/u);
  assert.match(collectionCoverSource, /applySavedCollectionCover\(currentName, result\)/u);
  assert.match(collectionCoverSource, /invalidateCollectionState\(\)/u);
  assert.match(collectionCoverSource, /await loadCollectionFolders\(0, \{ preferCache: false \}\)/u);
  assert.match(collectionCoverSource, /function applySavedCollectionCover/u);
  assert.match(collectionCoverSource, /normalizeCollectionFolderKey\(folder\.path \|\| folder\.name\)/u);
  assert.match(collectionCoverSource, /coverOverrideUrl:\s*savedCoverUrl/u);
  assert.match(collectionCoverSource, /coverUrl:\s*savedCoverUrl/u);
});

test('album tag and cover saves refresh collection folders without stale browse cache', async () => {
  const source = await readFile(new URL('../src/controller/appController.js', import.meta.url), 'utf8');
  const saveStart = source.indexOf('async function saveTagEditor');
  const resetStart = source.indexOf('async function resetTagEditor', saveStart);
  const deleteStart = source.indexOf('async function deleteTagEditorAlbum', resetStart);
  const saveSource = source.slice(saveStart, resetStart);
  const resetSource = source.slice(resetStart, deleteStart);
  const deleteSource = source.slice(deleteStart, source.indexOf('async function loadTrackLyrics', deleteStart));

  for (const section of [saveSource, resetSource, deleteSource]) {
    assert.match(section, /invalidateCollectionState\(\)/u);
    assert.match(section, /loadCollectionFolders\(0, \{ preferCache: false \}\)/u);
  }
});

test('collection folder cards render the folder cover url supplied by the browser payload', async () => {
  const source = await readFile(new URL('../src/components/collections/CollectionBrowser.jsx', import.meta.url), 'utf8');

  assert.match(source, /<CoverImage[\s\S]*src=\{folder\.coverUrl\}/u);
});

test('collection folder payloads prefer saved collection cover overrides', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const foldersStart = source.indexOf('async function createCollectionFoldersPayload');
  const foldersEnd = source.indexOf('async function createCollectionOptionsPayload', foldersStart);
  const foldersSource = source.slice(foldersStart, foldersEnd);
  const coverStart = source.indexOf('async function getCollectionFolderCoverUrl');
  const coverEnd = source.indexOf('function getCollectionCoverOverrideUrl', coverStart);
  const coverSource = source.slice(coverStart, coverEnd);

  assert.match(foldersSource, /const coverOverrideUrl = getCollectionCoverOverrideUrl\(folder\.name \|\| folder\.path, collectionOverrides\)/u);
  assert.match(foldersSource, /coverOverrideUrl,\s*coverUrl: await getCollectionFolderCoverUrl\(folder, overrides, collectionOverrides\)/u);
  assert.match(coverSource, /const overrideCoverUrl = getCollectionCoverOverrideUrl\(collectionName, collectionOverrides\)/u);
  assert.match(coverSource, /if \(overrideCoverUrl\) return overrideCoverUrl/u);
});

test('collection folder covers prefer the first sorted album before later album overrides', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  const coverStart = source.indexOf('async function getCollectionFolderCoverUrl');
  const coverEnd = source.indexOf('function getCollectionCoverOverrideUrl', coverStart);
  const coverSource = source.slice(coverStart, coverEnd);
  const firstAlbumIndex = coverSource.indexOf('const firstAlbumId = cleanText(folder.firstAlbumId)');
  const laterOverrideIndex = coverSource.indexOf('const albumOverrideCoverUrl = albumIds');

  assert.notEqual(firstAlbumIndex, -1);
  assert.notEqual(laterOverrideIndex, -1);
  assert.ok(firstAlbumIndex < laterOverrideIndex);
  assert.match(coverSource, /overrides\.albums\?\.\[firstAlbumId\]/u);
  assert.match(coverSource, /\/api\/albums\/\$\{encodeURIComponent\(firstAlbumId\)\}\/cover/u);
});

test('server imports createHash for uploaded cover filenames', async () => {
  const source = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');

  assert.match(source, /import \{[^}]*createHash[^}]*\} from 'node:crypto'/u);
  assert.match(source, /createHash\('sha1'\)\.update\(imageBuffer\)/u);
});
