import assert from 'node:assert/strict';
import test from 'node:test';
import { getBuildCommit } from '../scripts/build-info.js';

const ciCommit = '0123456789abcdef0123456789abcdef01234567';
const gitCommit = 'fedcba9876543210fedcba9876543210fedcba98';

test('uses Git HEAD when Workers Builds has not supplied a commit', () => {
  // Stub only the external command: repository commits belong to the deployer.
  assert.equal(
    getBuildCommit({ env: {}, readGitCommit: () => `${gitCommit}\n` }),
    gitCommit,
  );
});

test('uses Git HEAD when Workers Builds supplies an exactly empty commit', () => {
  assert.equal(
    getBuildCommit({ env: { WORKERS_CI_COMMIT_SHA: '' }, readGitCommit: () => `${gitCommit}\n` }),
    gitCommit,
  );
});

test('uses the full commit SHA supplied by Workers Builds', () => {
  assert.equal(
    getBuildCommit({
      env: { WORKERS_CI_COMMIT_SHA: ciCommit },
      readGitCommit: () => { throw new Error('Git must not run when CI supplies a SHA'); },
    }),
    ciCommit,
  );
});

test('uses local before a Git commit is available', () => {
  assert.equal(getBuildCommit({
    env: {},
    readGitCommit: () => { throw new Error('No Git HEAD'); },
  }), 'local');
});

test('never publishes malformed Git command output', () => {
  assert.equal(getBuildCommit({ env: {}, readGitCommit: () => 'not-a-commit' }), 'local');
});

test('rejects malformed CI metadata instead of publishing arbitrary values', () => {
  for (const value of [
    ' ', '\t', '\n', 'not-a-commit', `${ciCommit}\n`, ciCommit.toUpperCase(),
    'a'.repeat(39), 'a'.repeat(41), 'a'.repeat(64), null, false, 0, {}, [],
  ]) {
    assert.throws(
      () => getBuildCommit({ env: { WORKERS_CI_COMMIT_SHA: value } }),
      { message: 'WORKERS_CI_COMMIT_SHA must be a full 40-character Git SHA.' },
    );
  }
});
