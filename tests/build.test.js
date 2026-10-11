import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { build } from 'vite';
import { getBuildCommit } from '../scripts/build-info.js';

test('production build emits only the commit identifier in build-info.json', async () => {
  const result = await build({ build: { write: false }, logLevel: 'silent' });
  const metadata = result.output.find((file) => file.fileName === 'build-info.json');
  assert.ok(metadata, 'build-info.json must be part of the production output');
  assert.equal(metadata.source, `${JSON.stringify({ commit: getBuildCommit() })}\n`);
});

test('production build with an exactly empty CI commit emits only actual Git HEAD', { concurrency: false }, async () => {
  const gitCommit = execFileSync('git', ['rev-parse', '--verify', 'HEAD'], { encoding: 'utf8' }).trim();
  const previousCommit = process.env.WORKERS_CI_COMMIT_SHA;
  try {
    process.env.WORKERS_CI_COMMIT_SHA = '';
    const result = await build({ build: { write: false }, logLevel: 'silent' });
    const metadata = result.output.find((file) => file.fileName === 'build-info.json');
    assert.ok(metadata, 'build-info.json must be part of the production output');
    assert.deepEqual(JSON.parse(metadata.source), { commit: gitCommit });
  } finally {
    if (previousCommit === undefined) delete process.env.WORKERS_CI_COMMIT_SHA;
    else process.env.WORKERS_CI_COMMIT_SHA = previousCommit;
  }
});
