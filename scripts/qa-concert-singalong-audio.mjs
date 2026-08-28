import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.MS_QA_NODE_MODULES
  ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtimeModules, 'playwright'));

const target = process.env.MS_SINGALONG_URL ?? 'http://127.0.0.1:4334/concert/2026/singalong/';
const evidenceDir = process.env.MS_SINGALONG_QA_DIR ?? '/tmp/ms-concert-singalong-audio-qa';
const videoDir = path.join(evidenceDir, 'video');
fs.mkdirSync(videoDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const context = await browser.newContext({
  viewport: { width: 1366, height: 768 },
  recordVideo: { dir: videoDir, size: { width: 1366, height: 768 } },
});

await context.addInitScript(() => {
  window.__concertScheduledStarts = [];
  const originalStart = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function patchedStart(when = 0, offset = 0, duration) {
    window.__concertScheduledStarts.push({ when, offset, duration: duration ?? null });
    return duration === undefined
      ? originalStart.call(this, when, offset)
      : originalStart.call(this, when, offset, duration);
  };
});

const failures = [];
const consoleErrors = [];
let intentionallyOffline = false;
const progressHistory = [];
const attachDiagnostics = (page) => {
  page.on('console', (message) => {
    if (message.type() === 'error' && !(intentionallyOffline && message.text().includes('ERR_INTERNET_DISCONNECTED'))) {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
};
const setNetwork = (cdp, options) => cdp.send('Network.emulateNetworkConditions', {
  offline: options.offline ?? false,
  latency: options.latency ?? 0,
  downloadThroughput: options.downloadThroughput ?? -1,
  uploadThroughput: options.uploadThroughput ?? -1,
  connectionType: options.connectionType ?? 'none',
});

const coldPage = await context.newPage();
attachDiagnostics(coldPage);
const coldVideo = coldPage.video();
const coldCdp = await context.newCDPSession(coldPage);
await coldCdp.send('Network.enable');
await setNetwork(coldCdp, {
  latency: 120,
  downloadThroughput: 512 * 1024,
  uploadThroughput: 128 * 1024,
  connectionType: 'cellular4g',
});

const coldStartedAt = Date.now();
await coldPage.goto(target, { waitUntil: 'domcontentloaded' });
await coldPage.waitForFunction(() => document.querySelector('[data-audio-asset-status]')?.dataset.state === 'preparing');

let capturedMidProgress = false;
let capturedPerTrackProgress = false;
const sampler = setInterval(async () => {
  try {
    const state = await coldPage.evaluate(() => ({
      total: Number(document.querySelector('[data-singalong]')?.dataset.audioLoadPercent || 0),
      tracks: Array.from(document.querySelectorAll('[data-audio-asset-status]')).map((row) => ({
        key: row.dataset.audioAssetStatus,
        state: row.dataset.state,
        percent: row.querySelector('[data-audio-asset-percent]')?.textContent?.trim(),
      })),
    }));
    progressHistory.push({ atMs: Date.now() - coldStartedAt, ...state });
    capturedPerTrackProgress ||= state.tracks.some((track) => {
      const percent = Number.parseInt(track.percent, 10);
      return track.state === 'preparing' && percent > 0 && percent < 100;
    });
    if (!capturedMidProgress && state.total >= 15 && state.total <= 90) {
      capturedMidProgress = true;
      await coldPage.screenshot({ path: path.join(evidenceDir, 'desktop-cold-progress.png') });
    }
  } catch {
    // The sampler is best-effort while the page transitions.
  }
}, 180);

await coldPage.waitForFunction(() => document.querySelector('[data-singalong]')?.dataset.audioReady === 'true', null, { timeout: 40000 });
clearInterval(sampler);
const coldReadyMs = Date.now() - coldStartedAt;
await coldPage.screenshot({ path: path.join(evidenceDir, 'desktop-ready-checks.png') });

const readyState = await coldPage.evaluate(async () => {
  const root = document.querySelector('[data-singalong]');
  const cache = 'caches' in window ? await window.caches.open('concert-2026-audio-v3') : null;
  const cacheKeys = cache ? (await cache.keys()).map((request) => request.url) : [];
  return {
    ready: root?.dataset.audioReady,
    playDisabled: document.querySelector('[data-play-toggle]')?.disabled,
    blockingOverlayCount: document.querySelectorAll('.singalong-audio-preflight').length,
    tracks: Array.from(document.querySelectorAll('[data-audio-asset-status]')).map((row) => ({
      key: row.dataset.audioAssetStatus,
      state: row.dataset.state,
      percent: row.querySelector('[data-audio-asset-percent]')?.textContent?.trim(),
      ariaValue: row.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow'),
    })),
    cacheKeys,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  };
});

await coldPage.screenshot({ path: path.join(evidenceDir, 'desktop-stage-with-status-dock.png') });
intentionallyOffline = true;
await setNetwork(coldCdp, { offline: true });
await coldPage.locator('[data-play-toggle]').click();
await coldPage.waitForFunction(() => Number(document.querySelector('[data-singalong]')?.dataset.playbackTime) > 1, null, { timeout: 10000 });
const offlineStartTime = Number(await coldPage.locator('[data-singalong]').getAttribute('data-playback-time'));
await coldPage.waitForTimeout(2200);
const offlinePlayback = await coldPage.evaluate(() => {
  const starts = window.__concertScheduledStarts.slice(-2);
  return {
    playing: document.querySelector('[data-singalong]')?.dataset.playing,
    playbackTime: Number(document.querySelector('[data-singalong]')?.dataset.playbackTime),
    scheduledStarts: starts,
    scheduleDelta: starts.length === 2 ? Math.abs(starts[0].when - starts[1].when) : null,
    offsetDelta: starts.length === 2 ? Math.abs(starts[0].offset - starts[1].offset) : null,
  };
});
await coldPage.screenshot({ path: path.join(evidenceDir, 'desktop-offline-playing.png') });
await coldPage.locator('[data-play-toggle]').click();
await setNetwork(coldCdp, { offline: false });
intentionallyOffline = false;

const warmPage = await context.newPage();
attachDiagnostics(warmPage);
await warmPage.setViewportSize({ width: 390, height: 844 });
let warmNetworkAudioRequests = 0;
await warmPage.route(/mingtian-hui-geng-hao.*\.mp4/, async (route) => {
  warmNetworkAudioRequests += 1;
  await route.abort('failed');
});
const warmStartedAt = Date.now();
await warmPage.goto(target, { waitUntil: 'domcontentloaded' });
await warmPage.waitForFunction(() => document.querySelector('[data-singalong]')?.dataset.audioReady === 'true', null, { timeout: 10000 });
const warmReadyMs = Date.now() - warmStartedAt;
await warmPage.screenshot({ path: path.join(evidenceDir, 'mobile-ready-checks.png') });
await warmPage.screenshot({ path: path.join(evidenceDir, 'mobile-stage.png') });
const mobileState = await warmPage.evaluate(() => ({
  overflow: document.documentElement.scrollWidth - window.innerWidth,
  playBox: document.querySelector('[data-play-toggle]')?.getBoundingClientRect().toJSON(),
  controlsBox: document.querySelector('[data-singalong-chrome].singalong__controls')?.getBoundingClientRect().toJSON(),
}));

if (!capturedMidProgress) failures.push('cold loading never exposed a mid-progress state');
if (!capturedPerTrackProgress) failures.push('per-track loading progress was not observable');
if (readyState.ready !== 'true' || readyState.playDisabled) failures.push('playback was not enabled after preflight');
if (readyState.tracks.some((track) => track.state !== 'ready' || track.percent !== '100%' || track.ariaValue !== '100')) {
  failures.push('both circular indicators did not finish at 100%');
}
if (readyState.blockingOverlayCount !== 0) failures.push('projection mode still renders a blocking audio preflight overlay');
if (readyState.cacheKeys.filter((url) => /mingtian-hui-geng-hao.*\.mp4/.test(url)).length !== 2) {
  failures.push('Cache Storage does not contain both audio tracks');
}
if (offlinePlayback.playing !== 'true' || offlinePlayback.playbackTime <= offlineStartTime + 1.5) {
  failures.push('offline projection playback did not remain smooth');
}
if (offlinePlayback.scheduledStarts.length !== 2 || offlinePlayback.scheduleDelta !== 0 || offlinePlayback.offsetDelta !== 0) {
  failures.push('instrumental and guide vocal were not scheduled on the same clock');
}
if (warmNetworkAudioRequests !== 0) failures.push('warm load attempted a network audio request instead of Cache Storage');
if (readyState.overflow > 0 || mobileState.overflow > 0) failures.push('projection layout has horizontal overflow');
if ((mobileState.playBox?.width ?? 0) < 44 || (mobileState.playBox?.height ?? 0) < 44) failures.push('mobile play target is smaller than 44px');
if (consoleErrors.length) failures.push(`console errors: ${consoleErrors.join(' | ')}`);

await warmPage.close();
await coldPage.close();
const videoPath = await coldVideo?.path();
await context.close();
await browser.close();

const result = {
  verdict: failures.length ? 'fail' : 'pass',
  target,
  coldReadyMs,
  warmReadyMs,
  capturedMidProgress,
  capturedPerTrackProgress,
  readyState,
  offlineStartTime,
  offlinePlayback,
  warmNetworkAudioRequests,
  mobileState,
  progressSamples: progressHistory.length,
  consoleErrors,
  failures,
  evidenceDir,
  videoPath,
};
fs.writeFileSync(path.join(evidenceDir, 'result.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
