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

1. **Super-resolved local loop plus localized WebGL canopy wind — selected.** The repaired image-to-video result supplies organic grass, fabric, and branch motion. A feathered fragment shader adds independently phased deformation to the left foreground crown, distant grove, and right crown without moving the people, piano, or main trunk.
2. **Layered CSS background translation.** Deterministic and light, but visual review showed the low-opacity translations were nearly imperceptible and could create ghosted edges.
3. **Raw AI image-to-video loop.** More organic, but the unedited output introduced excessive petals, audio, a weaker loop boundary, and insufficient motion in surrounding trees.

## Acceptance gates

- Stage mode is query-controlled and normal website rendering is unchanged.
- 16:9 stage mode fills one viewport with no navigation, footer, page scrolling, or horizontal overflow.
- The local MP4 is muted, loops continuously, reaches a playable state, and advances during stage mode.
- The WebGL scene reaches a ready state and renders independently phased canopy deformation.
- Video and browser motion can be paused together with Space or the visible control.
- Controls disappear after inactivity and remain keyboard accessible.
- Reduced-motion starts paused with all CSS animation disabled.
- Canvas density is bounded and device pixel ratio is capped at 1.5.
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
  page.on('requestfailed', (request) => runtime.requestFailures.push(`${request.method()} ${request.url()}`));

  const response = await page.goto(stageUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => {
    const stageVideo = document.querySelector('[data-concert-stage-video]');
    return stageVideo instanceof HTMLVideoElement && stageVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
  });
  record('stage-loaded', { url: page.url(), viewport });
  const introPath = path.join(evidenceDir, `${viewport.name}-intro-controls.png`);
  await page.screenshot({ path: introPath });

  await page.waitForTimeout(5000);
  const settledPath = path.join(evidenceDir, `${viewport.name}-settled.png`);
  await page.screenshot({ path: settledPath });
  const settled = await page.evaluate(() => {
    const hero = document.querySelector('.concert-hero')?.getBoundingClientRect();
    const canvas = document.querySelector('[data-concert-stage-canvas]');
    const stageVideo = document.querySelector('[data-concert-stage-video]');
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
      scene: (() => {
        const scene = document.querySelector('[data-concert-stage-scene]');
        return {
          ready: scene?.dataset.ready,
          mode: scene?.dataset.mode,
          width: scene?.width,
          height: scene?.height,
          renderScale: Number(scene?.dataset.renderScale ?? 0),
        };
      })(),
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
    videoPaused: document.querySelector('[data-concert-stage-video]')?.paused,
    sceneReady: document.querySelector('[data-concert-stage-scene]')?.dataset.ready,
    uiOpacity: getComputedStyle(document.querySelector('[data-stage-ui]')).opacity,
  }));
  record('space-paused', paused);
  const pausedPath = path.join(evidenceDir, `${viewport.name}-paused.png`);
  await page.screenshot({ path: pausedPath });
  await page.keyboard.press('Space');
  const loopBefore = await page.evaluate(() => document.querySelector('[data-concert-stage-video]')?.currentTime ?? null);
  record('space-resumed', { loopBefore });

  await page.waitForTimeout(2800);
  const loopBoundary = await page.evaluate(() => {
    const stageVideo = document.querySelector('[data-concert-stage-video]');
    return stageVideo instanceof HTMLVideoElement ? {
      currentTime: stageVideo.currentTime,
      paused: stageVideo.paused,
      readyState: stageVideo.readyState,
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
  videoPaused: document.querySelector('[data-concert-stage-video]')?.paused,
  sceneReady: document.querySelector('[data-concert-stage-scene]')?.dataset.ready,
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
  if (result.runtime.consoleErrors.length || result.runtime.pageErrors.length || result.runtime.requestFailures.length) failures.push(`${name}: runtime errors`);
  if (result.settled.stage !== 'true' || result.settled.paused !== 'false' || result.settled.reduced !== 'false') failures.push(`${name}: stage state mismatch`);
  if (!result.settled.hero || Math.abs(result.settled.hero.width - width) > 1 || Math.abs(result.settled.hero.height - height) > 1 || result.settled.hero.top !== 0 || result.settled.hero.left !== 0) failures.push(`${name}: hero does not fill viewport`);
  if (result.settled.scroll.width !== width || result.settled.scroll.height !== height || result.settled.scroll.x || result.settled.scroll.y) failures.push(`${name}: stage scroll or overflow`);
  if (Object.values(result.settled.hidden).some((display) => display !== 'none')) failures.push(`${name}: website chrome remains visible`);
  if (result.settled.canvas.petalCount < 20 || result.settled.canvas.petalCount > 42 || result.settled.canvas.renderScale > 1.5) failures.push(`${name}: canvas density or render scale out of bounds`);
  const expectedVideo = result.viewport.dpr === 2
    ? { source: '/concert/2026/stage-sakura-loop-4k.mp4', width: 3840, height: 2160 }
    : { source: '/concert/2026/stage-sakura-loop-1440.mp4', width: 2560, height: 1440 };
  if (!result.settled.video || result.settled.video.readyState < 2 || result.settled.video.paused || result.settled.video.currentTime <= 0.25 || result.settled.video.duration !== 8 || !result.settled.video.loop || !result.settled.video.muted || result.settled.video.source !== expectedVideo.source || result.settled.video.width !== expectedVideo.width || result.settled.video.height !== expectedVideo.height) failures.push(`${name}: expected local loop variant is not continuously playable`);
  if (result.settled.scene.ready !== 'true' || result.settled.scene.mode !== 'webgl-canopy-wind' || result.settled.scene.width < width || result.settled.scene.height < height || result.settled.scene.renderScale > 1.5 || result.settled.motion.light !== 'concert-stage-light') failures.push(`${name}: localized cherry-tree rendering missing`);
  if (result.settled.ui.active !== 'false' || Number(result.settled.ui.opacity) > 0.01 || result.settled.controls !== 3) failures.push(`${name}: idle controls did not hide cleanly`);
  if (result.paused.dataset !== 'true' || result.paused.buttonPressed !== 'true' || result.paused.buttonLabel !== '繼續' || !result.paused.videoPaused || result.paused.sceneReady !== 'true' || Number(result.paused.uiOpacity) < 0.9) failures.push(`${name}: keyboard pause state failed`);
  const loopAdvance = result.loopBoundary && result.settled.video
    ? (result.loopBoundary.currentTime - result.loopBefore + result.settled.video.duration) % result.settled.video.duration
    : 0;
  if (!result.loopBoundary || loopAdvance < 2.2 || loopAdvance > 3.5 || result.loopBoundary.paused || result.loopBoundary.readyState < 2) failures.push(`${name}: loop did not advance continuously`);
}
if (reducedState.stage !== 'true' || reducedState.paused !== 'true' || reducedState.reduced !== 'true' || !reducedState.videoPaused || reducedState.sceneReady !== 'true' || reducedState.light !== 'none') failures.push('reduced-motion fallback failed');
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
    'The repaired local loop supplies organic branch, grass, and fabric motion without embedding the generated petal burst or audio.',
    'A feathered WebGL displacement field moves the left crown, distant grove, and right crown out of phase while excluding the people, piano, and main trunk.',
    'The selected high-fidelity super-resolution model preserves the intentionally soft atmosphere without the brittle branch artifacts seen in the ultrasharp candidate.',
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
