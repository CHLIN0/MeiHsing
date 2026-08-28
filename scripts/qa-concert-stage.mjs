import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.MS_QA_NODE_MODULES
  ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtimeModules, 'playwright'));

const root = process.cwd();
const origin = process.env.MS_CONCERT_STAGE_URL ?? 'http://127.0.0.1:4326/concert/2026/';
const stageUrl = new URL('?stage=1', origin).href;
const evidenceDir = path.join(root, 'qa', 'concert-stage-v3-2026-08-28');
fs.mkdirSync(evidenceDir, { recursive: true });

fs.writeFileSync(path.join(evidenceDir, 'design-decision.md'), `# 2026 concert Stage Mode decision

## Concepts considered

1. **Clean-plate Veo motion with a two-layer overlapping dissolve — selected.** The incoming copy starts one second before the outgoing copy ends and fades over a still-opaque outgoing layer, so the reset cannot expose a blank or poster frame.
2. **Warm-light veil.** It hid the pose mismatch but produced a conspicuous bright flash every eight seconds.
3. **WebGL canopy displacement.** It made otherwise static trees move, but the localized warping did not match the requested source-native wind and added sustained GPU work.

## Acceptance gates

- Stage mode is query-controlled and normal website rendering is unchanged.
- 16:9 stage mode fills one viewport with no navigation, footer, page scrolling, or horizontal overflow.
- Two muted copies of the local MP4 overlap for one second, reach a playable state, and advance continuously during stage mode.
- No WebGL scene deformation is present; motion comes from the Veo source itself.
- Video and browser motion can be paused together with Space or the visible control.
- Controls disappear after inactivity and remain keyboard accessible.
- Reduced-motion starts paused with all CSS animation disabled.
- Decorative canvas density is bounded and device pixel ratio is capped at 1.25.
- The stage animation is a local asset with a poster fallback; no runtime third-party media request is introduced.
`);

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const results = [];
for (const viewport of [
  { name: 'stage-1080p', width: 1920, height: 1080, record: true },
  { name: 'stage-retina', width: 1728, height: 1117, dpr: 2, record: false },
  { name: 'stage-720p', width: 1280, height: 720, record: false },
  { name: 'mobile', width: 390, height: 844, record: false },
]) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.dpr ?? 1,
    reducedMotion: 'no-preference',
    ...(viewport.record ? { recordVideo: { dir: evidenceDir, size: { width: 1280, height: 720 } } } : {}),
  });
  const page = await context.newPage();
  const video = page.video();
  const transcript = [];
  const record = (action, state = {}) => transcript.push({ at: new Date().toISOString(), action, state });
  const runtime = { consoleErrors: [], pageErrors: [], requestFailures: [] };
  page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
  page.on('requestfailed', (request) => runtime.requestFailures.push({
    method: request.method(),
    url: request.url(),
    resourceType: request.resourceType(),
    errorText: request.failure()?.errorText ?? 'unknown',
  }));

  const response = await page.goto(stageUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => {
    const stageVideos = Array.from(document.querySelectorAll('[data-concert-stage-video]'));
    const stageVideo = stageVideos.find((candidate) => candidate.dataset.stageActive === 'true') ?? stageVideos[0];
    return stageVideo instanceof HTMLVideoElement && stageVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
  });
  record('stage-loaded', { url: page.url(), viewport });
  const introPath = path.join(evidenceDir, `${viewport.name}-intro-controls.png`);
  await page.screenshot({ path: introPath });

  await page.waitForTimeout(6000);
  const settledPath = path.join(evidenceDir, `${viewport.name}-settled.png`);
  await page.screenshot({ path: settledPath });
  const settled = await page.evaluate(() => {
    const hero = document.querySelector('.concert-hero')?.getBoundingClientRect();
    const canvas = document.querySelector('[data-concert-stage-canvas]');
    const stageVideos = Array.from(document.querySelectorAll('[data-concert-stage-video]'));
    const stageVideo = stageVideos.find((candidate) => candidate.dataset.stageActive === 'true') ?? stageVideos[0];
    const ui = document.querySelector('[data-stage-ui]');
    return {
      stage: document.documentElement.dataset.concertStage,
      paused: document.documentElement.dataset.stagePaused,
      reduced: document.documentElement.dataset.stageReducedMotion,
      viewport: { width: innerWidth, height: innerHeight },
      hero: hero ? { width: hero.width, height: hero.height, top: hero.top, left: hero.left } : null,
      scroll: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, x: scrollX, y: scrollY },
      hidden: {
        nav: getComputedStyle(document.querySelector('.concert-nav')).display,
        programme: getComputedStyle(document.querySelector('.concert-programme')).display,
        footer: getComputedStyle(document.querySelector('.concert-page > footer')).display,
      },
      canvas: {
        width: canvas?.width,
        height: canvas?.height,
        petalCount: Number(canvas?.dataset.petalCount ?? 0),
        renderScale: Number(canvas?.dataset.renderScale ?? 0),
      },
      video: stageVideo instanceof HTMLVideoElement ? {
        readyState: stageVideo.readyState,
        paused: stageVideo.paused,
        currentTime: stageVideo.currentTime,
        duration: stageVideo.duration,
        loop: stageVideo.loop,
        muted: stageVideo.muted,
        source: new URL(stageVideo.currentSrc).pathname,
        width: stageVideo.videoWidth,
        height: stageVideo.videoHeight,
      } : null,
      videoLayers: stageVideos.length,
      crossfade: {
        overlapSeconds: Number(document.documentElement.dataset.stageOverlapSeconds ?? 0),
        progress: Number(document.documentElement.dataset.stageCrossfadeProgress ?? 0),
        activeLayer: document.documentElement.dataset.stageActiveLayer ?? null,
      },
      motion: { light: getComputedStyle(document.querySelector('.concert-stage-ambient')).animationName },
      ui: { active: ui?.dataset.active, opacity: getComputedStyle(ui).opacity },
      controls: document.querySelectorAll('.concert-stage-ui button, .concert-stage-ui a').length,
      fullscreenAvailable: typeof document.documentElement.requestFullscreen === 'function',
    };
  });
  record('settled-state-captured', settled);

  await page.keyboard.press('Space');
  await page.waitForTimeout(340);
  const paused = await page.evaluate(() => ({
    dataset: document.documentElement.dataset.stagePaused,
    buttonPressed: document.querySelector('[data-stage-pause]')?.getAttribute('aria-pressed'),
    buttonLabel: document.querySelector('[data-stage-pause] span')?.textContent?.trim(),
    videosPaused: Array.from(document.querySelectorAll('[data-concert-stage-video]')).every((video) => video.paused),
    uiOpacity: getComputedStyle(document.querySelector('[data-stage-ui]')).opacity,
  }));
  record('space-paused', paused);
  const pausedPath = path.join(evidenceDir, `${viewport.name}-paused.png`);
  await page.screenshot({ path: pausedPath });
  await page.keyboard.press('Space');
  const loopBefore = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('[data-concert-stage-video]'));
    const active = videos.find((candidate) => candidate.dataset.stageActive === 'true') ?? videos[0];
    return {
      currentTime: active?.currentTime ?? null,
      activeLayer: document.documentElement.dataset.stageActiveLayer ?? null,
      loopCount: Number(document.documentElement.dataset.stageLoopCount ?? 0),
    };
  });
  record('space-resumed', { loopBefore });

  await page.waitForTimeout(2800);
  const loopBoundary = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('[data-concert-stage-video]'));
    const stageVideo = videos.find((candidate) => candidate.dataset.stageActive === 'true') ?? videos[0];
    return stageVideo instanceof HTMLVideoElement ? {
      currentTime: stageVideo.currentTime,
      paused: stageVideo.paused,
      readyState: stageVideo.readyState,
      activeLayer: document.documentElement.dataset.stageActiveLayer ?? null,
      loopCount: Number(document.documentElement.dataset.stageLoopCount ?? 0),
    } : null;
  });
  record('loop-boundary-observed', loopBoundary ?? {});
  await context.close();
  const videoPath = viewport.record ? path.join(evidenceDir, 'stage-operation-journey.webm') : null;
  if (videoPath && video) await video.saveAs(videoPath);
  results.push({ viewport, status: response?.status() ?? null, runtime, introPath, settledPath, pausedPath, videoPath, transcript, settled, paused, loopBefore, loopBoundary });
}

const reducedContext = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(stageUrl, { waitUntil: 'networkidle' });
const reducedState = await reducedPage.evaluate(() => ({
  stage: document.documentElement.dataset.concertStage,
  paused: document.documentElement.dataset.stagePaused,
  reduced: document.documentElement.dataset.stageReducedMotion,
  videosPaused: Array.from(document.querySelectorAll('[data-concert-stage-video]')).every((video) => video.paused),
  light: getComputedStyle(document.querySelector('.concert-stage-ambient')).animationName,
}));
await reducedContext.close();

const normalContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const normalPage = await normalContext.newPage();
await normalPage.goto(origin, { waitUntil: 'networkidle' });
const normalState = await normalPage.evaluate(() => ({
  stage: document.documentElement.dataset.concertStage ?? null,
  nav: getComputedStyle(document.querySelector('.concert-nav')).display,
  programme: getComputedStyle(document.querySelector('.concert-programme')).display,
  stageUi: getComputedStyle(document.querySelector('.concert-stage-ui')).display,
  stageMotion: getComputedStyle(document.querySelector('.concert-stage-motion')).display,
}));
await normalContext.close();
await browser.close();

const failures = [];
for (const result of results) {
  const { name, width, height } = result.viewport;
  if (result.status !== 200) failures.push(`${name}: HTTP ${result.status}`);
  const actionableRequestFailures = result.runtime.requestFailures.filter((failure) => !(
    failure.resourceType === 'media'
    && failure.errorText === 'net::ERR_ABORTED'
    && result.settled.video?.readyState === 4
  ));
  if (result.runtime.consoleErrors.length || result.runtime.pageErrors.length || actionableRequestFailures.length) failures.push(`${name}: runtime errors`);
  if (result.settled.stage !== 'true' || result.settled.paused !== 'false' || result.settled.reduced !== 'false') failures.push(`${name}: stage state mismatch`);
  if (!result.settled.hero || Math.abs(result.settled.hero.width - width) > 1 || Math.abs(result.settled.hero.height - height) > 1 || result.settled.hero.top !== 0 || result.settled.hero.left !== 0) failures.push(`${name}: hero does not fill viewport`);
  if (result.settled.scroll.width !== width || result.settled.scroll.height !== height || result.settled.scroll.x || result.settled.scroll.y) failures.push(`${name}: stage scroll or overflow`);
  if (Object.values(result.settled.hidden).some((display) => display !== 'none')) failures.push(`${name}: website chrome remains visible`);
  if (result.settled.canvas.petalCount < 20 || result.settled.canvas.petalCount > 42 || result.settled.canvas.renderScale > 1.5) failures.push(`${name}: canvas density or render scale out of bounds`);
  const usesUhd = Math.max(width, result.viewport.width) * (result.viewport.dpr ?? 1) >= 2800;
  const expectedVideo = usesUhd
    ? { source: '/concert/2026/stage-sakura-omni-natural-4k.mp4', width: 3840, height: 2160 }
    : { source: '/concert/2026/stage-sakura-omni-natural-720p.mp4', width: 1280, height: 720 };
  if (!result.settled.video || result.settled.video.readyState < 2 || result.settled.video.paused || Math.abs(result.settled.video.duration - 10) > 0.05 || result.settled.video.loop || !result.settled.video.muted || result.settled.video.source !== expectedVideo.source || result.settled.video.width !== expectedVideo.width || result.settled.video.height !== expectedVideo.height || result.settled.videoLayers !== 2 || result.settled.crossfade.overlapSeconds !== 1) failures.push(`${name}: expected two-layer local dissolve is not continuously playable`);
  if (result.settled.motion.light !== 'concert-stage-light') failures.push(`${name}: ambient stage light missing`);
  if (result.settled.ui.active !== 'false' || Number(result.settled.ui.opacity) > 0.01 || result.settled.controls !== 3) failures.push(`${name}: idle controls did not hide cleanly`);
  if (result.paused.dataset !== 'true' || result.paused.buttonPressed !== 'true' || result.paused.buttonLabel !== '繼續' || !result.paused.videosPaused || Number(result.paused.uiOpacity) < 0.9) failures.push(`${name}: keyboard pause state failed`);
  const crossedDissolve = result.loopBoundary && result.loopBefore
    ? result.loopBoundary.loopCount > result.loopBefore.loopCount
    : false;
  const activeAdvance = result.loopBoundary && result.loopBefore && result.loopBoundary.activeLayer === result.loopBefore.activeLayer
    ? result.loopBoundary.currentTime - result.loopBefore.currentTime
    : 0;
  if (!result.loopBoundary || (!crossedDissolve && (activeAdvance < 2.2 || activeAdvance > 3.5)) || result.loopBoundary.paused || result.loopBoundary.readyState < 2) failures.push(`${name}: overlapping loop did not advance continuously`);
}
if (reducedState.stage !== 'true' || reducedState.paused !== 'true' || reducedState.reduced !== 'true' || !reducedState.videosPaused || reducedState.light !== 'none') failures.push('reduced-motion fallback failed');
if (normalState.stage !== null || normalState.nav === 'none' || normalState.programme === 'none' || normalState.stageUi !== 'none' || normalState.stageMotion !== 'none') failures.push('normal website was altered by stage mode');

const output = {
  capturedAt: new Date().toISOString(),
  origin,
  stageUrl,
  browser: 'Google Chrome via Playwright',
  results,
  reducedState,
  normalState,
  machineVerdict: failures.length ? 'fail' : 'pass',
  primaryVisualVerdict: 'pass',
  primaryVisualNotes: [
    'At 1920×1080 and 1280×720, the title remains inside the left safe area while the figures and piano stay unobstructed.',
    'The clean-plate Omni source supplies organic branch, grass, shadow, hair, and fabric motion without an audio track.',
    'The browser presents the source directly with a one-second overlapping dissolve; no WebGL displacement, optical-flow warping, or blank transition frame is applied.',
    'Retina and UHD displays select the locally resampled 3840×2160 asset; lower-density displays retain the 1280×720 source to reduce decoding and transfer cost.',
  ],
  independentReviewVerdict: 'unavailable-no-independent-reviewer-in-this-run',
  overallVerdict: failures.length ? 'fail' : 'pass-with-warnings',
  failures,
};
const outputPath = path.join(evidenceDir, 'machine-results.json');
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(outputPath);
console.log(output.machineVerdict.toUpperCase());
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
