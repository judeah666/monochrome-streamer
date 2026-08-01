import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('admin settings share the compact separated settings layout', async () => {
  const source = await readFile(new URL('../src/styles/tailwind.css', import.meta.url), 'utf8');

  assert.match(source, /body\[data-view='admin'\] :is\(\.admin-main-shell, \.admin-page-shell\)\s*\{[\s\S]*?background:\s*var\(--glass-heavy\);[\s\S]*?backdrop-filter:\s*blur\(22px\);/u);
  assert.match(source, /body\[data-view='admin'\] \.admin-settings-subtabs\s*\{[\s\S]*?flex-wrap:\s*nowrap;[\s\S]*?overflow-x:\s*auto;/u);
  assert.match(source, /body\[data-view='admin'\] \.admin-settings-group\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?border-bottom:\s*1px solid var\(--line\);/u);
  assert.match(source, /body\[data-view='admin'\] \.admin-settings-group :is\(\.setting-row, \.settings-field\)\s*\{[\s\S]*?border-radius:\s*0;[\s\S]*?background:\s*transparent;/u);
  assert.match(source, /body\[data-view='admin'\] \.admin-table-wrap\s*\{[\s\S]*?border-radius:\s*0;[\s\S]*?background:\s*transparent;/u);
  assert.match(source, /@media \(max-width:\s*720px\)[\s\S]*?body\[data-view='admin'\] \.admin-settings-group \.settings-field\s*\{[\s\S]*?grid-template-columns:\s*1fr;/u);
});
