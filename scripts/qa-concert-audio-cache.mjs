import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.MS_QA_NODE_MODULES
  ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtimeModules, 'playwright'));

const target = process.env.MS_CONCERT_URL ?? 'http://127.0.0.1:4335/concert/2026/';
const evidenceDir = process.env.MS_AUDIO_QA_DIR ?? '/tmp/ms-concert-audio-cache-qa';
const videoDir = path.join(evidenceDir, 'video');
fs.mkdirSync(videoDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
  recordVideo: { dir: videoDir, size: { width: 390, height: 844 } },
});

const failures = [];
const consoleErrors = [];
const audioResponses = [];
const progressHistory = [];

const attachDiagnostics = (page) => {
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', (response) => {
    if (/mingtian-hui-geng-hao.*\.mp4/.test(response.url())) {
      audioResponses.push({ url: response.url(), status: response.status(), fromServiceWorker: response.fromServiceWorker() });
    }
  });
};

const tap = async (page, selector) => {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`Missing tap target: ${selector}`);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
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
const video = coldPage.video();
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
await coldPage.waitForFunction(() => document.querySelector('[data-lyrics-player]')?.dataset.preparing === 'true');

let capturedMidProgress = false;
let capturedPerTrackProgress = false;
const progressSampler = setInterval(async () => {
  try {
    const state = await coldPage.locator('[data-lyrics-player]').evaluate((player) => ({
      preparing: player.dataset.preparing,
      ready: player.dataset.audioReady,
      label: player.querySelector('[data-audio-load-label]')?.textContent?.trim(),
      progress: player.style.getPropertyValue('--audio-load-progress'),
      preflightState: document.querySelector('[data-audio-preflight]')?.dataset.state,
      preflightLabel: document.querySelector('[data-audio-preflight-label]')?.textContent?.trim(),
      trackProgress: Array.from(document.querySelectorAll('[data-audio-asset-status]')).map((row) => ({
        key: row.dataset.audioAssetStatus,
        state: row.dataset.state,
        percent: row.querySelector('[data-audio-asset-percent]')?.textContent?.trim(),
      })),
    }));
    progressHistory.push({ atMs: Date.now() - coldStartedAt, ...state });
    const percent = Number.parseInt(state.progress, 10);
    if (state.trackProgress.length === 2 && state.trackProgress.some((track) => {
      const trackPercent = Number.parseInt(track.percent, 10);
      return track.state === 'preparing' && trackPercent > 0 && trackPercent < 100;
    })) capturedPerTrackProgress = true;
    if (!capturedMidProgress && percent >= 20 && percent <= 90) {
      capturedMidProgress = true;
      await coldPage.screenshot({ path: path.join(evidenceDir, 'cold-mid-progress.png') });
    }
  } catch {
    // The sampler is best-effort while the page transitions and closes.
  }
}, 200);

await coldPage.waitForFunction(() => document.querySelector('[data-lyrics-player]')?.dataset.audioReady === 'true', null, { timeout: 30000 });
clearInterval(progressSampler);
const coldReadyMs = Date.now() - coldStartedAt;
await coldPage.screenshot({ path: path.join(evidenceDir, 'cold-ready.png') });

const coldReadyState = await coldPage.evaluate(async () => {
  const player = document.querySelector('[data-lyrics-player]');
  const instrumental = document.querySelector('[data-lyrics-audio]');
  const guide = document.querySelector('[data-guide-vocal-audio]');
  const cacheNames = 'caches' in window ? await window.caches.keys() : [];
  const cache = cacheNames.includes('concert-2026-audio-v3')
    ? await window.caches.open('concert-2026-audio-v3')
    : null;
  const cacheKeys = cache ? (await cache.keys()).map((request) => request.url) : [];
  return {
    ready: player.dataset.audioReady,
    preparing: player.dataset.preparing,
    label: player.querySelector('[data-audio-load-label]')?.textContent?.trim(),
    instrumentalSource: instrumental.currentSrc,
    guideSource: guide.currentSrc,
    instrumentalReadyState: instrumental.readyState,
    guideReadyState: guide.readyState,
    cacheNames,
    cacheKeys,
    preflight: {
      state: document.querySelector('[data-audio-preflight]')?.dataset.state,
      label: document.querySelector('[data-audio-preflight-label]')?.textContent?.trim(),
      percent: document.querySelector('[data-audio-preflight-percent]')?.textContent?.trim(),
      visible: getComputedStyle(document.querySelector('[data-audio-preflight]')).display !== 'none',
    },
    trackProgress: Array.from(document.querySelectorAll('[data-audio-asset-status]')).map((row) => ({
      key: row.dataset.audioAssetStatus,
      state: row.dataset.state,
      percent: row.querySelector('[data-audio-asset-percent]')?.textContent?.trim(),
      ariaValue: row.getAttribute('aria-valuenow'),
    })),
  };
});

await tap(coldPage, '[data-audio-status-toggle]');
await coldPage.waitForFunction(() => document.querySelector('[data-lyrics-player]')?.dataset.resourceOnly === 'true');
await coldPage.waitForTimeout(250);
const compactStatusState = await coldPage.evaluate(() => ({
  resourceOnly: document.querySelector('[data-lyrics-player]')?.dataset.resourceOnly,
  expanded: document.querySelector('[data-audio-status-toggle]')?.getAttribute('aria-expanded'),
  label: document.querySelector('[data-audio-status-toggle]')?.getAttribute('aria-label'),
  panelVisible: getComputedStyle(document.querySelector('[data-audio-status-panel]')).visibility,
}));
await coldPage.screenshot({ path: path.join(evidenceDir, 'mobile-ready-compact-icon.png') });
await tap(coldPage, '[data-audio-status-toggle]');
await coldPage.waitForFunction(() => document.querySelector('[data-lyrics-player]')?.dataset.resourceStatusOpen === 'true');
await coldPage.waitForTimeout(250);
const reopenedStatusState = await coldPage.evaluate(() => ({
  resourceOnly: document.querySelector('[data-lyrics-player]')?.dataset.resourceOnly,
  expanded: document.querySelector('[data-audio-status-toggle]')?.getAttribute('aria-expanded'),
  panelVisible: getComputedStyle(document.querySelector('[data-audio-status-panel]')).visibility,
}));
await coldPage.screenshot({ path: path.join(evidenceDir, 'mobile-ready-status-open.png') });

await tap(coldPage, '.concert-hero__actions a[href="#lyrics"]');
await coldPage.evaluate(() => document.querySelector('#lyrics')?.scrollIntoView({ behavior: 'instant', block: 'start' }));
await coldPage.waitForFunction(() => {
  const player = document.querySelector('[data-lyrics-player]');
  return player?.dataset.visible === 'true' && player?.dataset.resourceOnly === 'false';
});
await coldPage.waitForTimeout(250);
await setNetwork(coldCdp, { offline: true });
const pausedBeforeOfflinePlayback = await coldPage.locator('[data-lyrics-audio]').evaluate((audio) => audio.paused);
if (pausedBeforeOfflinePlayback) await coldPage.locator('[data-play-toggle]').tap();
try {
  await coldPage.waitForFunction(() => document.querySelector('[data-lyrics-audio]')?.currentTime > 1, null, { timeout: 10000 });
} catch (error) {
  const playbackStartState = await coldPage.evaluate(() => {
    const instrumental = document.querySelector('[data-lyrics-audio]');
    const guide = document.querySelector('[data-guide-vocal-audio]');
    const player = document.querySelector('[data-lyrics-player]');
    return {
      instrumental: {
        paused: instrumental?.paused,
        currentTime: instrumental?.currentTime,
        readyState: instrumental?.readyState,
        networkState: instrumental?.networkState,
        error: instrumental?.error?.message,
        currentSrc: instrumental?.currentSrc,
      },
      guide: {
        paused: guide?.paused,
        currentTime: guide?.currentTime,
        readyState: guide?.readyState,
        networkState: guide?.networkState,
        error: guide?.error?.message,
      },
      player: { ...player?.dataset },
      playDisabled: document.querySelector('[data-play-toggle]')?.disabled,
      currentLyric: document.querySelector('[data-current-lyric]')?.textContent?.trim(),
      preflightVisibility: getComputedStyle(document.querySelector('[data-audio-status-panel]')).visibility,
    };
  });
  throw new Error(`Offline playback did not start: ${JSON.stringify(playbackStartState)}`, { cause: error });
}
const offlineStartTime = await coldPage.locator('[data-lyrics-audio]').evaluate((audio) => audio.currentTime);
await coldPage.waitForTimeout(1800);
const offlinePlayback = await coldPage.evaluate(() => {
  const instrumental = document.querySelector('[data-lyrics-audio]');
  const guide = document.querySelector('[data-guide-vocal-audio]');
  return {
    instrumentalTime: instrumental.currentTime,
    guideTime: guide.currentTime,
    drift: Math.abs(instrumental.currentTime - guide.currentTime),
    paused: instrumental.paused,
  };
});

await coldPage.evaluate(() => {
  const instrumental = document.querySelector('[data-lyrics-audio]');
  window.__concertAudioWaitingCount = 0;
  window.__concertAudioWaitingStartedAt = 0;
  window.__concertAudioMaxWaitingMs = 0;
  instrumental.addEventListener('waiting', () => {
    window.__concertAudioWaitingCount += 1;
    window.__concertAudioWaitingStartedAt = performance.now();
  });
  const finishWaiting = () => {
    if (!window.__concertAudioWaitingStartedAt) return;
    window.__concertAudioMaxWaitingMs = Math.max(
      window.__concertAudioMaxWaitingMs,
      performance.now() - window.__concertAudioWaitingStartedAt,
    );
    window.__concertAudioWaitingStartedAt = 0;
  };
  instrumental.addEventListener('playing', finishWaiting);
  instrumental.addEventListener('ended', finishWaiting);
  instrumental.currentTime = 145;
  document.querySelector('[data-guide-vocal-audio]').currentTime = 145;
});
await coldPage.waitForFunction(() => document.querySelector('[data-lyrics-audio]')?.ended === true, null, { timeout: 20000 });
const offlineTailPlayback = await coldPage.evaluate(() => ({
  ended: document.querySelector('[data-lyrics-audio]')?.ended,
  currentTime: document.querySelector('[data-lyrics-audio]')?.currentTime,
  guideTime: document.querySelector('[data-guide-vocal-audio]')?.currentTime,
  waitingCount: window.__concertAudioWaitingCount,
  maxWaitingMs: window.__concertAudioMaxWaitingMs,
}));

await setNetwork(coldCdp, { offline: false });
const warmPage = await context.newPage();
attachDiagnostics(warmPage);
const warmCdp = await context.newCDPSession(warmPage);
await warmCdp.send('Network.enable');
const warmStartedAt = Date.now();
await warmPage.goto(target, { waitUntil: 'domcontentloaded' });
await warmPage.waitForFunction(() => document.querySelector('[data-lyrics-player]')?.dataset.audioReady === 'true', null, { timeout: 10000 });
const warmReadyMs = Date.now() - warmStartedAt;
await setNetwork(warmCdp, { offline: true });
const warmState = await warmPage.evaluate(() => ({
  label: document.querySelector('[data-audio-load-label]')?.textContent?.trim(),
  instrumentalSource: document.querySelector('[data-lyrics-audio]')?.currentSrc,
  guideSource: document.querySelector('[data-guide-vocal-audio]')?.currentSrc,
}));
await warmPage.screenshot({ path: path.join(evidenceDir, 'warm-offline-ready.png') });

const retryContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
});
let guideRequestAttempts = 0;
await retryContext.route('**/mingtian-hui-geng-hao-guide-vocal-v3.mp4', async (route) => {
  guideRequestAttempts += 1;
  if (guideRequestAttempts === 1) {
    await route.abort('failed');
    return;
  }
  await route.continue();
});
const retryPage = await retryContext.newPage();
await retryPage.goto(target, { waitUntil: 'domcontentloaded' });
await retryPage.waitForFunction(() => document.querySelector('[data-lyrics-player]')?.dataset.audioReady === 'true', null, { timeout: 20000 });
const retryState = await retryPage.evaluate(() => ({
  ready: document.querySelector('[data-lyrics-player]')?.dataset.audioReady,
  label: document.querySelector('[data-audio-load-label]')?.textContent?.trim(),
  instrumentalSource: document.querySelector('[data-lyrics-audio]')?.currentSrc,
  guideSource: document.querySelector('[data-guide-vocal-audio]')?.currentSrc,
}));

const resyncRequests = [];
retryPage.on('request', (request) => {
  if (/mingtian-hui-geng-hao.*\.mp4/.test(request.url())) resyncRequests.push(request.url());
});
await retryPage.locator('[data-audio-resync]').click();
await retryPage.waitForFunction((previousSources) => {
  const player = document.querySelector('[data-lyrics-player]');
  const instrumentalSource = document.querySelector('[data-lyrics-audio]')?.currentSrc;
  const guideSource = document.querySelector('[data-guide-vocal-audio]')?.currentSrc;
  return player?.dataset.audioReady === 'true'
    && player?.dataset.resyncing === 'false'
    && instrumentalSource?.startsWith('blob:')
    && guideSource?.startsWith('blob:')
    && instrumentalSource !== previousSources.instrumentalSource
    && guideSource !== previousSources.guideSource;
}, retryState, { timeout: 20000 });
const resyncState = await retryPage.evaluate(async () => {
  const cache = await window.caches.open('concert-2026-audio-v3');
  return {
    ready: document.querySelector('[data-lyrics-player]')?.dataset.audioReady,
    resyncing: document.querySelector('[data-lyrics-player]')?.dataset.resyncing,
    instrumentalSource: document.querySelector('[data-lyrics-audio]')?.currentSrc,
    guideSource: document.querySelector('[data-guide-vocal-audio]')?.currentSrc,
    status: document.querySelector('[data-audio-preflight-status]')?.textContent?.trim(),
    buttonDisabled: document.querySelector('[data-audio-resync]')?.disabled,
    buttonLabel: document.querySelector('[data-audio-resync-label]')?.textContent?.trim(),
    cacheKeys: (await cache.keys()).map((request) => request.url),
    trackProgress: Array.from(document.querySelectorAll('[data-audio-asset-status]')).map((row) => ({
      key: row.dataset.audioAssetStatus,
      state: row.dataset.state,
      ariaValue: row.getAttribute('aria-valuenow'),
    })),
  };
});
await retryPage.screenshot({ path: path.join(evidenceDir, 'mobile-resync-ready.png') });

if (coldReadyState.ready !== 'true' || !coldReadyState.instrumentalSource.startsWith('blob:') || !coldReadyState.guideSource.startsWith('blob:')) {
  failures.push('Cold preparation did not replace both network sources with complete Blob URLs.');
}
if (coldReadyState.cacheKeys.length !== 2) failures.push(`Expected 2 Cache Storage entries, received ${coldReadyState.cacheKeys.length}.`);
if (offlinePlayback.paused || offlinePlayback.instrumentalTime <= offlineStartTime + 1) failures.push('Offline playback did not continue after the network was disabled.');
if (offlinePlayback.drift > 0.4) failures.push(`Guide vocal drift is too high: ${offlinePlayback.drift.toFixed(3)}s.`);
if (!offlineTailPlayback.ended || offlineTailPlayback.maxWaitingMs > 500) {
  failures.push(`Offline tail playback did not finish cleanly: ${JSON.stringify(offlineTailPlayback)}.`);
}
if (warmReadyMs > 2000 || !warmState.instrumentalSource.startsWith('blob:') || !warmState.guideSource.startsWith('blob:')) {
  failures.push(`Warm offline preparation failed or was too slow: ${warmReadyMs}ms.`);
}
if (!capturedMidProgress || progressHistory.length < 3) failures.push('Determinate cold-download progress was not observable.');
if (!capturedPerTrackProgress) failures.push('Per-track circular download progress was not observable.');
if (coldReadyState.preflight.state !== 'ready' || !coldReadyState.preflight.visible || coldReadyState.preflight.percent !== '100%') {
  failures.push(`Global audio preflight did not remain visibly ready: ${JSON.stringify(coldReadyState.preflight)}.`);
}
if (coldReadyState.trackProgress.length !== 2 || coldReadyState.trackProgress.some((track) => track.state !== 'ready' || track.percent !== '100%' || track.ariaValue !== '100')) {
  failures.push(`Instrumental and guide-vocal status rings did not both finish: ${JSON.stringify(coldReadyState.trackProgress)}.`);
}
if (compactStatusState.resourceOnly !== 'true' || compactStatusState.expanded !== 'false' || compactStatusState.panelVisible !== 'hidden') {
  failures.push(`Ready status did not collapse to a checkable icon: ${JSON.stringify(compactStatusState)}.`);
}
if (reopenedStatusState.resourceOnly !== 'false' || reopenedStatusState.expanded !== 'true' || reopenedStatusState.panelVisible !== 'visible') {
  failures.push(`Touch did not reopen the resource explanation: ${JSON.stringify(reopenedStatusState)}.`);
}
if (guideRequestAttempts < 2 || retryState.ready !== 'true' || !retryState.guideSource.startsWith('blob:')) {
  failures.push(`Interrupted guide-vocal request did not recover: attempts=${guideRequestAttempts}, ready=${retryState.ready}.`);
}
if (
  new Set(resyncRequests).size !== 2
  || resyncState.ready !== 'true'
  || resyncState.resyncing !== 'false'
  || resyncState.instrumentalSource === retryState.instrumentalSource
  || resyncState.guideSource === retryState.guideSource
  || resyncState.cacheKeys.length !== 2
  || resyncState.buttonDisabled
  || resyncState.trackProgress.some((track) => track.state !== 'ready' || track.ariaValue !== '100')
) {
  failures.push(`Cache clear and resync did not replace both complete audio assets: requests=${resyncRequests.length}, state=${JSON.stringify(resyncState)}.`);
}
const expectedOfflineConsoleErrors = consoleErrors.filter((message) => message.includes('net::ERR_INTERNET_DISCONNECTED'));
const unexpectedConsoleErrors = consoleErrors.filter((message) => !message.includes('net::ERR_INTERNET_DISCONNECTED'));
if (unexpectedConsoleErrors.length) failures.push(`Console errors: ${unexpectedConsoleErrors.join(' | ')}`);

await warmPage.close();
await coldPage.close();
await context.close();
await retryPage.close();
await retryContext.close();
const operationVideo = video ? await video.path() : null;
await browser.close();

const result = {
  capturedAt: new Date().toISOString(),
  target,
  benchmark: {
    viewport: '390x844 touch',
    coldNetwork: '512 KiB/s down, 120ms latency',
    coldReadyMs,
    warmOfflineReadyMs: warmReadyMs,
  },
  coldReadyState,
  compactStatusState,
  reopenedStatusState,
  offlinePlayback,
  offlineTailPlayback,
  warmState,
  retry: {
    guideRequestAttempts,
    state: retryState,
  },
  resync: {
    requests: resyncRequests,
    state: resyncState,
  },
  audioResponses,
  progressHistory,
  capturedPerTrackProgress,
  consoleErrors,
  expectedOfflineConsoleErrors,
  unexpectedConsoleErrors,
  operationVideo,
  verdict: failures.length ? 'fail' : 'pass',
  failures,
};

const resultPath = path.join(evidenceDir, 'machine-results.json');
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(resultPath);
console.log(operationVideo);
console.log(JSON.stringify({
  verdict: result.verdict,
  coldReadyMs,
  warmOfflineReadyMs: warmReadyMs,
  cacheEntries: coldReadyState.cacheKeys.length,
  offlinePlayback,
  progressSamples: progressHistory.length,
  retryGuideRequestAttempts: guideRequestAttempts,
  resyncRequestCount: resyncRequests.length,
  failures,
}, null, 2));
if (failures.length) process.exitCode = 1;
