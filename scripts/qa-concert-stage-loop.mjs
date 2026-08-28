import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.MS_QA_NODE_MODULES
  ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtimeModules, 'playwright'));

const root = process.cwd();
const origin = process.env.MS_CONCERT_STAGE_URL ?? 'http://127.0.0.1:4330/concert/2026/';
const durationSeconds = Number(process.env.MS_LOOP_TEST_SECONDS ?? 120);
const deviceScaleFactor = Number(process.env.MS_STAGE_DPR ?? 1);
const stageUrl = new URL('?stage=1', origin).href;
const evidenceDir = path.join(root, 'qa', `concert-stage-loop-${durationSeconds}s-${deviceScaleFactor}x-2026-08-28`);
fs.mkdirSync(evidenceDir, { recursive: true });

fs.writeFileSync(path.join(evidenceDir, 'design-decision.md'), `# Long-running concert stage loop evaluation

## Common brief

Run the real 2026 concert stage page continuously and retain enough evidence to decide whether the
clean-plate Omni source can be presented with a native HTML video loop at the venue.

## Alternatives retained

1. **Two-layer overlapping dissolve — candidate under test.** The incoming copy starts one second
   before the outgoing copy ends and rises above a still-opaque outgoing layer, so no blank, poster,
   or page background can appear between them.
2. **Warm-light veil — rejected.** It concealed the pose mismatch but produced a conspicuous bright
   flash every eight seconds.
3. **WebGL or optical-flow deformation — rejected for this brief.** It changes the source motion and
   can warp the figures, piano, or branches.

## Acceptance

- The page remains playable for ${durationSeconds} seconds without stalling or runtime errors.
- At least ${Math.max(1, Math.floor((durationSeconds - 5) / 7))} overlapping loop boundaries are observed.
- Dropped video frames stay below one percent.
- Every transition retains full visual coverage while both copies overlap.
- Layout, title, figures, and piano remain stable at a 1920×1080 stage viewport.
- A complete playable browser recording and timestamped state samples are retained.
`);

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor,
  reducedMotion: 'no-preference',
  recordVideo: { dir: evidenceDir, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
const recordedVideo = page.video();
const cdp = await context.newCDPSession(page);
await cdp.send('Performance.enable');

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
  const video = document.querySelector('[data-concert-stage-video]');
  return video instanceof HTMLVideoElement && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.paused;
});

const startedAt = Date.now();
const samples = [];
const loopEvents = [];
let previousLoopCount = 0;
let lastProgressLog = 0;

const sampleState = async () => {
  const pageState = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('[data-concert-stage-video]'))
      .filter((candidate) => candidate instanceof HTMLVideoElement);
    const video = videos.find((candidate) => candidate.dataset.stageActive === 'true') ?? videos[0];
    const qualities = videos
      .filter((candidate) => typeof candidate.getVideoPlaybackQuality === 'function')
      .map((candidate) => candidate.getVideoPlaybackQuality());
    const layerOpacities = videos.map((candidate) => Number.parseFloat(getComputedStyle(candidate).opacity));
    const visualCoverage = 1 - layerOpacities.reduce((uncovered, opacity) => uncovered * (1 - opacity), 1);
    return {
      elapsedMs: Math.round(performance.now()),
      visibility: document.visibilityState,
      currentTime: video instanceof HTMLVideoElement ? video.currentTime : null,
      duration: video instanceof HTMLVideoElement ? video.duration : null,
      readyState: video instanceof HTMLVideoElement ? video.readyState : null,
      paused: video instanceof HTMLVideoElement ? video.paused : null,
      ended: video instanceof HTMLVideoElement ? video.ended : null,
      loopCount: Number(document.documentElement.dataset.stageLoopCount ?? 0),
      stallCount: Number(document.documentElement.dataset.stageStallCount ?? 0),
      totalWaitMs: Number(document.documentElement.dataset.stageTotalWaitMs ?? 0),
      maxWaitMs: Number(document.documentElement.dataset.stageMaxWaitMs ?? 0),
      buffering: document.documentElement.dataset.stageVideoBuffering === 'true',
      activeLayer: document.documentElement.dataset.stageActiveLayer ?? null,
      crossfadeProgress: Number(document.documentElement.dataset.stageCrossfadeProgress ?? 0),
      overlapSeconds: Number(document.documentElement.dataset.stageOverlapSeconds ?? 0),
      concurrentVideos: videos.filter((candidate) => !candidate.paused).length,
      layerOpacities,
      visualCoverage,
      source: video instanceof HTMLVideoElement ? new URL(video.currentSrc).pathname : null,
      videoSize: video instanceof HTMLVideoElement ? { width: video.videoWidth, height: video.videoHeight } : null,
      quality: qualities.length ? {
        totalVideoFrames: qualities.reduce((sum, quality) => sum + quality.totalVideoFrames, 0),
        droppedVideoFrames: qualities.reduce((sum, quality) => sum + quality.droppedVideoFrames, 0),
        corruptedVideoFrames: qualities.reduce((sum, quality) => sum + quality.corruptedVideoFrames, 0),
      } : null,
      viewport: { width: innerWidth, height: innerHeight },
      scroll: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
    };
  });
  const perf = await cdp.send('Performance.getMetrics');
  const selectedMetrics = Object.fromEntries(perf.metrics
    .filter(({ name }) => ['TaskDuration', 'JSHeapUsedSize', 'Nodes', 'LayoutCount', 'RecalcStyleCount'].includes(name))
    .map(({ name, value }) => [name, value]));
  const sample = { wallElapsedMs: Date.now() - startedAt, ...pageState, performance: selectedMetrics };
  samples.push(sample);
  if (sample.loopCount > previousLoopCount) {
    loopEvents.push({ wallElapsedMs: sample.wallElapsedMs, loopCount: sample.loopCount, currentTime: sample.currentTime });
    previousLoopCount = sample.loopCount;
  }
  if (sample.wallElapsedMs - lastProgressLog >= 30000) {
    lastProgressLog = sample.wallElapsedMs;
    console.log(`progress ${Math.round(sample.wallElapsedMs / 1000)}s loops=${sample.loopCount} stalls=${sample.stallCount} dropped=${sample.quality?.droppedVideoFrames ?? 'n/a'}`);
  }
};

await page.screenshot({ path: path.join(evidenceDir, 'stage-000s.png') });
while (Date.now() - startedAt < durationSeconds * 1000) {
  await page.waitForTimeout(500);
  await sampleState();
  const elapsed = Math.round((Date.now() - startedAt) / 1000);
  if (elapsed === Math.round(durationSeconds / 2)) {
    await page.screenshot({ path: path.join(evidenceDir, `stage-${String(elapsed).padStart(3, '0')}s.png`) });
  }
}
await page.screenshot({ path: path.join(evidenceDir, `stage-${String(durationSeconds).padStart(3, '0')}s.png`) });

const final = samples.at(-1);
const failures = [];
const cycleSeconds = Math.max(1, (final?.duration ?? 8) - (final?.overlapSeconds ?? 0));
const minimumLoops = Math.max(1, Math.floor((durationSeconds - 5) / cycleSeconds));
const transitionSamples = samples.filter((sample) => sample.crossfadeProgress > 0.05 && sample.crossfadeProgress < 0.95);
if (response?.status() !== 200) failures.push(`HTTP ${response?.status() ?? 'unavailable'}`);
const actionableRequestFailures = runtime.requestFailures.filter((failure) => !(
  failure.resourceType === 'media'
  && failure.errorText === 'net::ERR_ABORTED'
  && final?.readyState === 4
));
if (runtime.consoleErrors.length || runtime.pageErrors.length || actionableRequestFailures.length) failures.push('runtime errors occurred');
if (!final || final.paused || final.ended || final.readyState < 2 || final.buffering) failures.push('video did not remain continuously playable');
if (!final || final.loopCount < minimumLoops) failures.push(`observed ${final?.loopCount ?? 0} loops; expected at least ${minimumLoops}`);
if (!transitionSamples.length) failures.push('no overlapping crossfade samples were observed');
if (samples.some((sample) => sample.visualCoverage < 0.995)) failures.push('a crossfade sample exposed the poster or page background');
if (!final || final.maxWaitMs > 250 || final.totalWaitMs > final.loopCount * 150 + 500) failures.push(`loop waits were visibly long: max ${final?.maxWaitMs ?? 0} ms, total ${final?.totalWaitMs ?? 0} ms`);
if (final?.quality?.totalVideoFrames && final.quality.droppedVideoFrames / final.quality.totalVideoFrames > 0.01) failures.push('dropped-frame ratio exceeded one percent');
if (!final || final.scroll.width !== 1920 || final.scroll.height !== 1080) failures.push('stage viewport overflowed during the run');

const result = {
  capturedAt: new Date().toISOString(),
  stageUrl,
  durationSeconds,
  browser: 'isolated Google Chrome via Playwright',
  viewport: { width: 1920, height: 1080, recording: { width: 1280, height: 720 } },
  deviceScaleFactor,
  cache: 'warm after initial navigation',
  runtime,
  loopEvents,
  transitionSamples,
  samples,
  machineVerdict: failures.length ? 'fail' : 'pass',
  primaryVisualVerdict: 'pending-video-review',
  independentReviewVerdict: 'unavailable-no-independent-reviewer-in-this-run',
  failures,
};
fs.writeFileSync(path.join(evidenceDir, 'long-run-results.json'), `${JSON.stringify(result, null, 2)}\n`);

await context.close();
if (recordedVideo) await recordedVideo.saveAs(path.join(evidenceDir, 'stage-long-run.webm'));
await browser.close();

console.log(path.join(evidenceDir, 'long-run-results.json'));
console.log(result.machineVerdict.toUpperCase());
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
