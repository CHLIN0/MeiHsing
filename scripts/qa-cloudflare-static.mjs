import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const headersPath = path.join(dist, '_headers');
const metadataPath = path.join(dist, 'deploy-meta.json');
const failures = [];
const warnings = [];

const fail = (message) => failures.push(message);

if (!fs.existsSync(headersPath)) fail('dist/_headers is missing.');
if (!fs.existsSync(metadataPath)) fail('dist/deploy-meta.json is missing.');

const parseHeaders = (source) => {
  const rules = [];
  let current = null;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trimStart().startsWith('#')) continue;

    if (!/^\s/.test(rawLine)) {
      current = { pattern: line.trim(), headers: new Map() };
      rules.push(current);
      continue;
    }

    if (!current) {
      fail(`Header appears before a route pattern: ${line.trim()}`);
      continue;
    }

    const separator = line.indexOf(':');
    if (separator < 1) {
      fail(`Invalid header declaration under ${current.pattern}: ${line.trim()}`);
      continue;
    }

    const name = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    current.headers.set(name, value);
  }

  return rules;
};

const headerSource = fs.existsSync(headersPath) ? fs.readFileSync(headersPath, 'utf8') : '';
const rules = parseHeaders(headerSource);
const ruleFor = (pattern) => rules.find((rule) => rule.pattern === pattern);
const cacheControlFor = (pattern) => ruleFor(pattern)?.headers.get('cache-control') ?? '';

const immutableRules = rules.filter((rule) => /\bimmutable\b/i.test(rule.headers.get('cache-control') ?? ''));
const concertAudioPatterns = [
  '/audio/concert-2026/mingtian-hui-geng-hao-instrumental-v3.mp4',
  '/audio/concert-2026/mingtian-hui-geng-hao-guide-vocal-v3.mp4',
];
const concertProgrammeMediaPatterns = [
  '/concert/2026/media/programme-11-sasameyuki-v1.mp4',
  '/concert/2026/media/programme-17-opalite-audio-v1.m4a',
  '/concert/2026/media/programme-20-yours-always-karaoke-v2.mp4',
  '/concert/2026/media/programme-guest-lovelorn-innocent-v1.mp4',
];
const allowedImmutablePatterns = new Set(['/_astro/*', ...concertAudioPatterns, ...concertProgrammeMediaPatterns]);
for (const rule of immutableRules) {
  if (!allowedImmutablePatterns.has(rule.pattern)) {
    fail(`Only fingerprinted build assets and versioned concert audio may be immutable; found ${rule.pattern}.`);
  }
}

const astroCache = cacheControlFor('/_astro/*');
if (!/\bpublic\b/i.test(astroCache) || !/\bmax-age=31556952\b/i.test(astroCache) || !/\bimmutable\b/i.test(astroCache)) {
  fail('/_astro/* must use public, max-age=31556952, immutable.');
}

for (const pattern of concertAudioPatterns) {
  const concertAudioCache = cacheControlFor(pattern);
  if (!/\bpublic\b/i.test(concertAudioCache) || !/\bmax-age=31556952\b/i.test(concertAudioCache) || !/\bimmutable\b/i.test(concertAudioCache)) {
    fail(`${pattern} must use public, max-age=31556952, immutable.`);
  }
}

for (const pattern of concertProgrammeMediaPatterns) {
  const concertMediaCache = cacheControlFor(pattern);
  if (!/\bpublic\b/i.test(concertMediaCache) || !/\bmax-age=31556952\b/i.test(concertMediaCache) || !/\bimmutable\b/i.test(concertMediaCache)) {
    fail(`${pattern} must use public, max-age=31556952, immutable.`);
  }
}

for (const pattern of ['/*.html', '/']) {
  const cacheControl = cacheControlFor(pattern);
  if (!/\bmax-age=0\b/i.test(cacheControl) || !/\bmust-revalidate\b/i.test(cacheControl)) {
    fail(`${pattern} must use max-age=0, must-revalidate.`);
  }
}

if (!/\bno-store\b/i.test(cacheControlFor('/deploy-meta.json'))) {
  fail('/deploy-meta.json must use Cache-Control: no-store.');
}

const securityRule = ruleFor('/*');
for (const name of ['x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy']) {
  if (!securityRule?.headers.has(name)) fail(`The /* security rule is missing ${name}.`);
}

let metadata = null;
if (fs.existsSync(metadataPath)) {
  try {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  } catch (error) {
    fail(`deploy-meta.json is not valid JSON: ${error.message}`);
  }
}

if (metadata) {
  if (metadata.schemaVersion !== 1) fail('deploy-meta.json schemaVersion must be 1.');
  if (!/^[0-9a-f]{40}$/.test(metadata.commit ?? '')) fail('deploy-meta.json commit must be a 40-character Git SHA.');
  if (!Number.isFinite(Date.parse(metadata.builtAt ?? ''))) fail('deploy-meta.json builtAt must be an ISO timestamp.');
  if (!['local', 'cloudflare-workers-builds'].includes(metadata.buildProvider)) fail('deploy-meta.json buildProvider is invalid.');
}

const requiredPages = [
  'index.html',
  path.join('concert', '2026', 'index.html'),
];
for (const page of requiredPages) {
  if (!fs.existsSync(path.join(dist, page))) fail(`Required generated page is missing: dist/${page}`);
}

const concertPagePath = path.join(dist, 'concert', '2026', 'index.html');
if (fs.existsSync(concertPagePath)) {
  const concertPage = fs.readFileSync(concertPagePath, 'utf8');
  if (/(?:^|\s)poster="\/concert\/2026\/stage-sakura-poster-4k\.webp(?:\?[^\"]*)?"/.test(concertPage)) {
    fail('The stage-only video poster must not load during a normal concert page visit.');
  }
  if (!/\bdata-poster="\/concert\/2026\/stage-sakura-poster-4k\.webp\?v=20260828[a-z0-9-]*"/.test(concertPage)) {
    fail('The deferred stage video poster data attribute is missing.');
  }
  if (!/\bdata-src="\/concert\/2026\/stage-sakura-omni-natural-720p\.mp4\?v=20260828[a-z0-9-]*"/.test(concertPage)) {
    fail('The deferred 720p stage video source is missing.');
  }
  if (!/\bdata-src-uhd="\/concert\/2026\/stage-sakura-omni-natural-4k\.mp4\?v=20260828[a-z0-9-]*"/.test(concertPage)) {
    fail('The deferred UHD stage video source is missing.');
  }
  if (!/\/concert\/2026\/hands-melody\.webp\?v=20260828/.test(concertPage)) {
    fail('The legacy immutable hands-melody asset is missing its one-time cache-busting version.');
  }
}

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const absolutePath = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
});

const files = fs.existsSync(dist) ? walk(dist) : [];
const oversized = files
  .map((file) => ({ file, size: fs.statSync(file).size }))
  .filter(({ size }) => size > 15 * 1024 * 1024)
  .sort((a, b) => b.size - a.size);
for (const asset of oversized) {
  warnings.push(`${path.relative(dist, asset.file)} is ${(asset.size / 1024 / 1024).toFixed(1)} MiB; verify that it is intentional.`);
}

const cloudflareAssetLimit = 25 * 1024 * 1024;
for (const asset of files.map((file) => ({ file, size: fs.statSync(file).size })).filter(({ size }) => size > cloudflareAssetLimit)) {
  fail(`${path.relative(dist, asset.file)} exceeds Cloudflare's 25 MiB individual static asset limit.`);
}

if (failures.length) {
  console.error('Cloudflare static asset QA failed:');
  for (const message of failures) console.error(`- ${message}`);
  process.exitCode = 1;
} else {
  const htmlCount = files.filter((file) => file.endsWith('.html')).length;
  console.log('Cloudflare static asset QA passed.');
  console.log(`- ${htmlCount} generated HTML pages`);
  console.log(`- ${files.length} total deployment files`);
  console.log('- immutable caching is limited to fingerprinted assets and versioned concert audio/video');
  console.log(`- deployment metadata commit: ${metadata.commit.slice(0, 12)}`);
}

if (warnings.length) {
  console.warn('Asset size warnings:');
  for (const message of warnings) console.warn(`- ${message}`);
}
