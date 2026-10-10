import { execFileSync } from 'node:child_process';

export function getBuildCommit({
  env = process.env,
  readGitCommit = () => execFileSync('git', ['rev-parse', '--verify', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }),
} = {}) {
  const ciCommit = env.WORKERS_CI_COMMIT_SHA;
  if (ciCommit !== undefined) {
    if (typeof ciCommit !== 'string' || ciCommit.length !== 40 || !/^[0-9a-f]{40}$/.test(ciCommit)) {
      throw new Error('WORKERS_CI_COMMIT_SHA must be a full 40-character Git SHA.');
    }
    return ciCommit;
  }
  try {
    const gitCommit = readGitCommit().trim();
    return gitCommit.length === 40 && /^[0-9a-f]{40}$/.test(gitCommit) ? gitCommit : 'local';
  } catch {
    // Source archives and a new repository have no committed Git HEAD yet.
    return 'local';
  }
}
