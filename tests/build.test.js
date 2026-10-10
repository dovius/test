import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'vite';
import { getBuildCommit } from '../scripts/build-info.js';

test('production build emits only the commit identifier in build-info.json', async () => {
  const result = await build({ build: { write: false }, logLevel: 'silent' });
  const metadata = result.output.find((file) => file.fileName === 'build-info.json');
  assert.ok(metadata, 'build-info.json must be part of the production output');
  assert.equal(metadata.source, `${JSON.stringify({ commit: getBuildCommit() })}\n`);
});
