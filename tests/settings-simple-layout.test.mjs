import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('settings use compact separated rows without changing their controls', async () => {
  const source = await readFile(new URL('../src/styles/tailwind.css', import.meta.url), 'utf8');

  assert.match(source, /body\[data-view='settings'\] \.settings-shell-flat\s*\{[\s\S]*?background:\s*var\(--glass-heavy\);[\s\S]*?backdrop-filter:\s*blur\(22px\);/u);
  assert.match(source, /body\[data-view='settings'\] \.settings-tabs\s*\{[\s\S]*?flex-wrap:\s*nowrap;[\s\S]*?overflow-x:\s*auto;/u);
  assert.match(source, /body\[data-view='settings'\] \.settings-group\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?border-bottom:\s*1px solid var\(--line\);/u);
  assert.match(source, /body\[data-view='settings'\] :is\(\.setting-row, \.settings-field\)\s*\{[\s\S]*?border-radius:\s*0;[\s\S]*?background:\s*transparent;/u);
  assert.match(source, /body\[data-view='settings'\] \.setting-row input\[type='checkbox'\][\s\S]*?width:\s*40px;[\s\S]*?height:\s*22px;/u);
  assert.match(source, /@media \(max-width:\s*720px\)[\s\S]*?body\[data-view='settings'\] \.settings-field\s*\{[\s\S]*?grid-template-columns:\s*1fr;/u);
});
