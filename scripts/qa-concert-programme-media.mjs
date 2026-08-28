import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.MS_QA_NODE_MODULES
  ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtimeModules, 'playwright'));

const target = process.env.MS_CONCERT_URL ?? 'http://127.0.0.1:4334/concert/2026/';
const evidenceDir = process.env.MS_PROGRAMME_MEDIA_QA_DIR ?? '/tmp/ms-concert-programme-media-qa';
fs.mkdirSync(evidenceDir, { recursive: true });

const mediaPattern = /programme-(11|17|20)-.+\.(?:mp4|m4a)/;
const expectedCacheName = 'concert-2026-programme-media-v2';
const failures = [];
const consoleErrors = [];
const networkMediaResponses = [];
const progressSamples = [];

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
});

const attachDiagnostics = (page) => {
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', (response) => {
    if (mediaPattern.test(response.url())) {
      networkMediaResponses.push({ url: response.url(), status: response.status() });
    }
  });
};

const readButtons = (page) => page.locator('[data-programme-media-button]').evaluateAll((buttons) => buttons.map((button) => ({
  number: button.dataset.mediaNumber,
  state: button.dataset.state,
  progress: Number(button.style.getPropertyValue('--programme-media-progress')),
  label: button.getAttribute('aria-label'),
  disabled: button.disabled,
})));

const coldPage = await context.newPage();
attachDiagnostics(coldPage);
const coldCdp = await context.newCDPSession(coldPage);
await coldCdp.send('Network.enable');
await coldCdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 80,
  downloadThroughput: 2 * 1024 * 1024,
  uploadThroughput: 512 * 1024,
  connectionType: 'wifi',
});
await coldPage.goto(target, { waitUntil: 'domcontentloaded' });

const sampler = setInterval(async () => {
  try {
    progressSamples.push({ at: Date.now(), buttons: await readButtons(coldPage) });
  } catch {
    // Sampling is best-effort while the page changes state.
  }
}, 180);

await coldPage.waitForFunction(() => [...document.querySelectorAll('[data-programme-media-button]')]
  .every((button) => button.dataset.state === 'ready'), null, { timeout: 60000 });
clearInterval(sampler);
await coldPage.screenshot({ path: path.join(evidenceDir, 'mobile-ready.png'), fullPage: true });

const coldState = await coldPage.evaluate(async (cacheName) => {
  const cacheNames = 'caches' in window ? await caches.keys() : [];
  const cache = cacheNames.includes(cacheName) ? await caches.open(cacheName) : null;
  const cacheKeys = cache ? (await cache.keys()).map((request) => request.url) : [];
  const buttons = [...document.querySelectorAll('[data-programme-media-button]')];
  return {
    cacheNames,
    cacheKeys,
    horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
    buttons: buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return {
        number: button.dataset.mediaNumber,
        state: button.dataset.state,
        disabled: button.disabled,
        width: rect.width,
        height: rect.height,
      };
    }),
  };
}, expectedCacheName);

if (!coldState.cacheNames.includes(expectedCacheName) || coldState.cacheKeys.length !== 3) {
  failures.push(`cold cache: expected 3 entries, got ${coldState.cacheKeys.length}`);
}
if (coldState.horizontalOverflow !== 0) failures.push(`mobile overflow: ${coldState.horizontalOverflow}px`);
if (coldState.buttons.some((button) => button.state !== 'ready' || button.disabled || button.width < 44 || button.height < 44)) {
  failures.push('mobile buttons: not all controls are ready and at least 44×44 CSS pixels');
}
if (!progressSamples.some((sample) => sample.buttons.some((button) => button.progress > 0 && button.progress < 100))) {
  failures.push('cold progress: no intermediate percentage was observed');
}

await coldPage.locator('[data-programme-tab][href="#second-half"]').click();
await coldPage.locator('[data-programme-media-button][data-media-number="17"]').click();
await coldPage.waitForFunction(() => {
  const player = document.querySelector('[data-programme-media-player][data-active="true"]');
  return document.querySelector('[data-programme-media-dialog]')?.open && player?.currentSrc.startsWith('blob:') && !player.paused;
});
await coldPage.waitForTimeout(260);
await coldPage.screenshot({ path: path.join(evidenceDir, 'mobile-audio-modal.png') });

const modalState = await coldPage.evaluate(() => {
  const dialog = document.querySelector('[data-programme-media-dialog]');
  const sheet = dialog.querySelector('.concert-programme-media__sheet');
  const sheetRect = sheet.getBoundingClientRect();
  return {
    title: dialog.querySelector('[data-programme-media-title]')?.textContent?.trim(),
    audioTitle: dialog.querySelector('[data-programme-media-audio-title]')?.textContent?.trim(),
    audioPerformer: dialog.querySelector('[data-programme-media-audio-performer]')?.textContent?.trim(),
    audioVisible: !dialog.querySelector('[data-programme-media-audio-card]')?.hidden,
    videoHidden: dialog.querySelector('[data-programme-media-player="video"]')?.hidden,
    status: dialog.querySelector('[data-programme-media-status]')?.textContent?.trim(),
    sheet: { top: sheetRect.top, left: sheetRect.left, right: sheetRect.right, bottom: sheetRect.bottom },
    source: dialog.querySelector('[data-programme-media-player][data-active="true"]')?.currentSrc,
  };
});
if (modalState.sheet.left < 0 || modalState.sheet.top < 0 || modalState.sheet.right > 390 || modalState.sheet.bottom > 844) {
  failures.push(`mobile modal exceeds viewport: ${JSON.stringify(modalState.sheet)}`);
}
if (!modalState.audioVisible || !modalState.videoHidden || modalState.audioTitle !== 'Opalite｜Taylor Swift TikTok Dance' || !modalState.audioPerformer) {
  failures.push(`audio modal identity failed: ${JSON.stringify(modalState)}`);
}

await coldPage.locator('[data-programme-media-player][data-active="true"]').evaluate((player) => {
  player.currentTime = Math.max(0, player.duration - 0.12);
  void player.play();
});
await coldPage.waitForFunction(() => /第 2 次/.test(document.querySelector('[data-programme-media-status]')?.textContent ?? ''), null, { timeout: 5000 });
await coldPage.locator('[data-programme-media-player][data-active="true"]').evaluate((player) => {
  player.currentTime = Math.max(0, player.duration - 0.12);
  void player.play();
});
await coldPage.waitForFunction(() => /已完成 2 次播放/.test(document.querySelector('[data-programme-media-status]')?.textContent ?? ''), null, { timeout: 5000 });
await coldPage.locator('[data-programme-media-close]').click();

const mediaResponsesAfterCold = networkMediaResponses.length;
const warmPage = await context.newPage();
attachDiagnostics(warmPage);
await warmPage.addInitScript(() => {
  window.__programmeMediaNetworkAttempts = [];
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (/\/concert\/2026\/media\/programme-(11|17|20)-.+\.(?:mp4|m4a)/.test(url)) {
      window.__programmeMediaNetworkAttempts.push(url);
      return Promise.reject(new TypeError('Programme media network fetch blocked by QA'));
    }
    return originalFetch(input, init);
  };
});
const warmStartedAt = Date.now();
await warmPage.goto(target, { waitUntil: 'domcontentloaded' });
await warmPage.waitForFunction(() => [...document.querySelectorAll('[data-programme-media-button]')]
  .every((button) => button.dataset.state === 'ready'), null, { timeout: 8000 });
const warmReadyMs = Date.now() - warmStartedAt;
const warmButtons = await readButtons(warmPage);
const warmNetworkAttempts = await warmPage.evaluate(() => window.__programmeMediaNetworkAttempts);

await warmPage.locator('[data-programme-tab][href="#second-half"]').click();
await warmPage.locator('[data-programme-media-button][data-media-number="20"]').click();
await warmPage.waitForFunction(() => {
  const player = document.querySelector('[data-programme-media-player][data-active="true"]');
  return player?.currentSrc.startsWith('blob:') && !player.paused;
});
const warmStart = await warmPage.locator('[data-programme-media-player][data-active="true"]').evaluate((player) => player.currentTime);
await warmPage.waitForTimeout(800);
const warmEnd = await warmPage.locator('[data-programme-media-player][data-active="true"]').evaluate((player) => player.currentTime);
await warmPage.screenshot({ path: path.join(evidenceDir, 'warm-cache-playback.png') });

if (warmButtons.some((button) => button.state !== 'ready' || button.disabled)) failures.push('warm cache: controls did not become ready');
if (networkMediaResponses.length !== mediaResponsesAfterCold || warmNetworkAttempts.length) failures.push('warm cache: a programme media request reached the network');
if (warmEnd <= warmStart) failures.push('warm cache: Blob-backed video did not advance');

await browser.close();

const result = {
  capturedAt: new Date().toISOString(),
  target,
  coldState,
  progressSampleCount: progressSamples.length,
  capturedIntermediateProgress: progressSamples.some((sample) => sample.buttons.some((button) => button.progress > 0 && button.progress < 100)),
  networkMediaResponses,
  modalState,
  warmReadyMs,
  warmButtons,
  warmNetworkAttempts,
  warmPlaybackAdvancedBy: warmEnd - warmStart,
  consoleErrors,
  failures,
  verdict: failures.length ? 'fail' : 'pass',
};
fs.writeFileSync(path.join(evidenceDir, 'results.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
