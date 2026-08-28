import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputDirectory = path.join(root, 'dist');

if (!fs.existsSync(outputDirectory)) {
  throw new Error('dist/ does not exist. Run this script after astro build.');
}

const readGit = (args) => {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
};

const commit = process.env.WORKERS_CI_COMMIT_SHA?.trim()
  || process.env.GITHUB_SHA?.trim()
  || readGit(['rev-parse', 'HEAD']);
const branch = process.env.WORKERS_CI_BRANCH?.trim()
  || process.env.GITHUB_REF_NAME?.trim()
  || readGit(['branch', '--show-current'])
  || 'unknown';

if (!/^[0-9a-f]{40}$/i.test(commit)) {
  throw new Error(`Unable to resolve a valid Git commit SHA (received: ${commit || 'empty'}).`);
}

const metadata = {
  schemaVersion: 1,
  site: 'https://ms.linho.me',
  commit: commit.toLowerCase(),
  branch,
  builtAt: new Date().toISOString(),
  buildProvider: process.env.WORKERS_CI === '1' ? 'cloudflare-workers-builds' : 'local',
  buildId: process.env.WORKERS_CI_BUILD_UUID?.trim() || null,
};

const outputPath = path.join(outputDirectory, 'deploy-meta.json');
fs.writeFileSync(outputPath, `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, outputPath)} for ${metadata.commit.slice(0, 12)}.`);
