import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.MS_QA_NODE_MODULES
    ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtimeModules, 'playwright'));

const origin = process.env.MS_QA_URL ?? 'http://127.0.0.1:4340';
const evidenceDir = path.join(process.cwd(), 'qa', 'homepage-motion-2026-08-28');
const videoDir = path.join(evidenceDir, 'video');
fs.mkdirSync(videoDir, { recursive: true });

const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
];

const percentile = (values, percentileValue) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * percentileValue) - 1)];
};

const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const motionRuns = [];
const reducedRuns = [];

for (const viewport of viewports) {
    for (let run = 1; run <= 3; run += 1) {
        const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            reducedMotion: 'no-preference',
            ...(run === 1 ? { recordVideo: { dir: videoDir, size: { width: viewport.width, height: viewport.height } } } : {}),
        });
        await context.addInitScript(() => {
            window.__homeMotionFrameDeltas = [];
            document.addEventListener('DOMContentLoaded', () => {
                const startedAt = performance.now();
                let previous;
                const sample = (now) => {
                    if (previous !== undefined) window.__homeMotionFrameDeltas.push(now - previous);
                    previous = now;
                    if (now - startedAt < 2200) requestAnimationFrame(sample);
                };
                requestAnimationFrame(sample);
            }, { once: true });
        });

        const page = await context.newPage();
        const video = page.video();
        const runtime = { consoleErrors: [], pageErrors: [], requestFailures: [], badResponses: [] };
        page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); });
        page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
        page.on('requestfailed', (request) => runtime.requestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`));
        page.on('response', (response) => { if (response.status() >= 400) runtime.badResponses.push(`${response.status()} ${response.url()}`); });

        const response = await page.goto(`${origin}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const timeline = [];
        const captureState = async (atMs) => {
            const state = await page.evaluate(() => {
                const read = (selector) => {
                    const style = getComputedStyle(document.querySelector(selector));
                    return { opacity: style.opacity, transform: style.transform, animationName: style.animationName };
                };
                return {
                    rootMotion: document.documentElement.dataset.homeMotion,
                    headline: read('.home-hero h1'),
                    portrait: read('.home-hero__portrait'),
                    cue: read('.home-scroll-cue svg'),
                };
            });
            timeline.push({ atMs, ...state });
            if (run === 1) await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-${atMs}ms.png`) });
        };

        if (run === 1) {
            await page.waitForTimeout(120);
            await captureState(120);
            await page.waitForTimeout(400);
            await captureState(520);
            await page.waitForTimeout(880);
            await captureState(1400);
        } else {
            await page.waitForTimeout(1400);
        }

        await page.waitForTimeout(900);
        const frameDeltas = await page.evaluate(() => window.__homeMotionFrameDeltas ?? []);
        const frameMetrics = {
            samples: frameDeltas.length,
            p95Ms: Number(percentile(frameDeltas, 0.95).toFixed(2)),
            maxMs: Number(Math.max(0, ...frameDeltas).toFixed(2)),
            over25ms: frameDeltas.filter((value) => value > 25).length,
            over33ms: frameDeltas.filter((value) => value > 33.4).length,
        };

        let interaction;
        if (run === 1) {
            await page.waitForTimeout(4100);
            const cueAnimationsAfterThreeCycles = await page.locator('.home-scroll-cue').evaluate((element) => element.getAnimations({ subtree: true }).length);
            await page.locator('.home-scroll-cue').click();
            await page.waitForTimeout(420);
            const aboutMid = await page.evaluate(() => ({
                reveal: document.querySelector('.home-about')?.getAttribute('data-home-reveal'),
                animations: document.querySelector('.home-about')?.getAnimations({ subtree: true }).length ?? 0,
                scrollY: window.scrollY,
            }));
            await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-about-mid.png`) });
            await page.waitForTimeout(900);
            await page.evaluate(() => document.fonts.ready);
            const aboutSettled = await page.evaluate(() => ({
                hash: window.location.hash,
                top: document.querySelector('.home-about')?.getBoundingClientRect().top,
                animations: document.querySelector('.home-about')?.getAnimations({ subtree: true }).length ?? 0,
                cueDismissed: document.querySelector('.home-scroll-cue')?.getAttribute('data-dismissed'),
            }));
            await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-about-settled.png`) });
            interaction = { cueAnimationsAfterThreeCycles, aboutMid, aboutSettled };
        }

        const videoPath = run === 1 ? path.join(evidenceDir, `${viewport.name}-motion.webm`) : null;
        await context.close();
        if (videoPath && video) await video.saveAs(videoPath);
        motionRuns.push({ viewport, run, status: response?.status() ?? null, runtime, timeline, frameMetrics, interaction, videoPath });
    }

    const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const runtime = { consoleErrors: [], pageErrors: [], requestFailures: [], badResponses: [] };
    page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
    page.on('requestfailed', (request) => runtime.requestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`));
    page.on('response', (response) => { if (response.status() >= 400) runtime.badResponses.push(`${response.status()} ${response.url()}`); });
    const response = await page.goto(`${origin}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const state = await page.evaluate(() => ({
        rootMotion: document.documentElement.dataset.homeMotion,
        heroAnimations: document.querySelector('.home-hero')?.getAnimations({ subtree: true }).length ?? 0,
        aboutReveal: document.querySelector('.home-about')?.getAttribute('data-home-reveal'),
        cueAnimation: getComputedStyle(document.querySelector('.home-scroll-cue svg')).animationName,
    }));
    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-reduced.png`) });
    await page.locator('.home-scroll-cue').click();
    await page.waitForTimeout(60);
    const interaction = await page.evaluate(() => ({
        hash: window.location.hash,
        aboutTop: document.querySelector('.home-about')?.getBoundingClientRect().top,
    }));
    await context.close();
    reducedRuns.push({ viewport, status: response?.status() ?? null, runtime, state, interaction });
}

await browser.close();

const failures = [];
const warnings = [];
for (const result of motionRuns) {
    const label = `${result.viewport.name} run ${result.run}`;
    if (result.status !== 200) failures.push(`${label}: HTTP ${result.status}`);
    if (Object.values(result.runtime).some((entries) => entries.length)) failures.push(`${label}: runtime errors`);
    if (result.frameMetrics.p95Ms > 33.4) failures.push(`${label}: frame p95 ${result.frameMetrics.p95Ms}ms`);
    else if (result.frameMetrics.p95Ms > 25) warnings.push(`${label}: frame p95 ${result.frameMetrics.p95Ms}ms`);
    if (result.run === 1) {
        if (result.timeline.some((sample) => sample.rootMotion !== 'enabled')) failures.push(`${label}: motion root was not enabled`);
        if (result.interaction.cueAnimationsAfterThreeCycles !== 0) failures.push(`${label}: cue did not stop after three cycles`);
        if (result.interaction.aboutMid.reveal !== 'visible' || result.interaction.aboutMid.animations < 1) failures.push(`${label}: about reveal did not begin`);
        if (result.interaction.aboutSettled.hash !== '#about' || Math.abs(result.interaction.aboutSettled.top - 86) > 2 || result.interaction.aboutSettled.animations !== 0 || result.interaction.aboutSettled.cueDismissed !== 'true') failures.push(`${label}: about transition did not settle`);
    }
}
for (const result of reducedRuns) {
    const label = `${result.viewport.name} reduced`;
    if (result.status !== 200) failures.push(`${label}: HTTP ${result.status}`);
    if (Object.values(result.runtime).some((entries) => entries.length)) failures.push(`${label}: runtime errors`);
    if (result.state.rootMotion !== 'reduced' || result.state.heroAnimations !== 0 || result.state.aboutReveal !== 'visible' || result.state.cueAnimation !== 'none') failures.push(`${label}: reduced-motion fallback failure`);
    if (result.interaction.hash !== '#about' || Math.abs(result.interaction.aboutTop - 86) > 2) failures.push(`${label}: reduced-motion navigation failure`);
}

const output = {
    capturedAt: new Date().toISOString(),
    origin,
    benchmark: {
        route: '/',
        build: 'Astro production preview',
        cache: 'warm localhost after production build',
        networkAndCpu: 'host defaults; no synthetic throttling',
        animationBudget: 'investigate p95 >25ms; block p95 >33.4ms',
        runsPerViewport: 3,
    },
    motionRuns,
    reducedRuns,
    failures,
    warnings,
    verdicts: {
        machine: failures.length ? 'fail' : warnings.length ? 'pass-with-warnings' : 'pass',
        primaryVisualReview: 'pending screenshot and video inspection',
        independentReview: 'not requested for this bounded phase',
    },
    verdict: failures.length ? 'FAIL' : warnings.length ? 'PASS-WITH-WARNINGS' : 'PASS',
};

const resultPath = path.join(evidenceDir, 'machine-results.json');
fs.writeFileSync(resultPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(resultPath);
console.log(output.verdict);
if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
}
