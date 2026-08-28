import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.MS_QA_NODE_MODULES
    ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtimeModules, 'playwright'));

const root = process.cwd();
const target = process.env.MS_CONCERT_URL ?? 'http://127.0.0.1:4336/concert/2026/';
const evidenceDir = path.join(root, 'qa', 'concert-lyrics-player');
const videoDir = path.join(evidenceDir, 'video');
fs.mkdirSync(videoDir, { recursive: true });

fs.writeFileSync(path.join(evidenceDir, 'design-decision.md'), `# Concert sing-along controls

## Design read

- Interface: editorial event landing page with a live sing-along utility.
- Audience: concert families reading lyrics on phones; the player must not cover the current verse.
- Primary action: reach the sing-along from the hero, then retain immediate play/pause access.
- Preserve: sakura visual language, existing audio/follow/guide-vocal behavior, desktop player layout.
- Non-goal: gesture-driven bottom sheets or a new audio library.

## Theses

1. **Selected — persistent mini player.** Mobile starts as a compact bar with title, play/pause, and an expand control. Full progress, follow, and guide-vocal controls remain one tap away.
2. **Rejected — draggable bottom sheet.** More expressive, but introduces gesture ambiguity, focus-management work, and accidental movement while following lyrics.
3. **Rejected — inline-only player.** Removes overlap, but playback controls disappear as the audience scrolls through forty lyric lines.

Applied rules: direction:br-frontend-taste-m0:I01, direction:hallmark:I02, study:hallmark:I01.
Contributing model: Codex implemented and reviewed the repository-native solution. No independent reviewer was available.
`);

const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const failures = [];
const results = [];
let operationVideo = null;

for (const viewport of [
    { name: 'desktop', width: 1280, height: 800, mobile: false },
    { name: 'mobile', width: 390, height: 844, mobile: true, record: true },
    { name: 'narrow', width: 320, height: 800, mobile: true },
]) {
    const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: 'no-preference',
        ...(viewport.record ? { recordVideo: { dir: videoDir, size: { width: 390, height: 844 } } } : {}),
    });
    const page = await context.newPage();
    const video = page.video();
    const runtime = { consoleErrors: [], pageErrors: [], requestFailures: [] };
    const transcript = [];
    const record = (action, state = {}) => transcript.push({ at: new Date().toISOString(), action, state });

    page.on('console', (message) => {
        if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
        const errorText = request.failure()?.errorText ?? 'unknown';
        // Revoking and replacing a local object URL intentionally aborts the old media request.
        if (request.url().startsWith('blob:') && errorText === 'net::ERR_ABORTED') return;
        runtime.requestFailures.push({
            url: request.url(),
            resourceType: request.resourceType(),
            errorText,
        });
    });

    const response = await page.goto(target, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-hero.png`) });

    const hero = await page.evaluate(() => {
        const actions = [...document.querySelectorAll('.concert-hero__actions a')];
        return {
            labels: actions.map((link) => link.textContent?.trim()),
            hrefs: actions.map((link) => link.getAttribute('href')),
            horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
        };
    });

    await page.locator('.concert-hero__actions a[href="#lyrics"]').click();
    await page.waitForFunction(() => location.hash === '#lyrics'
        && document.querySelector('[data-lyrics-player]')?.getAttribute('data-visible') === 'true');
    await page.waitForTimeout(300);

    const readPlayer = () => page.locator('[data-lyrics-player]').evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const sizeToggle = element.querySelector('[data-player-size-toggle]');
        const playToggle = element.querySelector('[data-play-toggle]');
        const followToggle = element.querySelector('[data-follow-toggle]');
        const guideVocal = element.querySelector('.concert-lyrics-player__guide-vocal');
        return {
            rect: { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height },
            collapsed: element.getAttribute('data-collapsed'),
            expanded: sizeToggle?.getAttribute('aria-expanded'),
            sizeToggleDisplay: sizeToggle ? getComputedStyle(sizeToggle).display : null,
            playDisplay: playToggle ? getComputedStyle(playToggle).display : null,
            followDisplay: followToggle ? getComputedStyle(followToggle).display : null,
            guideDisplay: guideVocal ? getComputedStyle(guideVocal).display : null,
            horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
        };
    });

    const initial = await readPlayer();
    record('sing-along-opened', initial);
    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-player-initial.png`) });

    let expanded = null;
    let recollapsed = null;
    if (viewport.mobile) {
        await page.locator('[data-player-size-toggle]').focus();
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => document.querySelector('[data-lyrics-player]')?.getAttribute('data-collapsed') === 'false');
        expanded = await readPlayer();
        record('player-expanded-with-keyboard', expanded);
        await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-player-expanded.png`) });

        await page.locator('[data-player-size-toggle]').click();
        await page.waitForFunction(() => document.querySelector('[data-lyrics-player]')?.getAttribute('data-collapsed') === 'true');
        recollapsed = await readPlayer();
        record('player-recollapsed-with-pointer', recollapsed);
    }

    if (response?.status() !== 200) failures.push(`${viewport.name}: HTTP ${response?.status()}`);
    if (runtime.consoleErrors.length || runtime.pageErrors.length || runtime.requestFailures.length) failures.push(`${viewport.name}: runtime error`);
    if (hero.labels.length !== 3 || hero.hrefs[1] !== '#lyrics' || hero.horizontalOverflow !== 0) failures.push(`${viewport.name}: hero actions failed`);
    if (initial.horizontalOverflow !== 0 || initial.playDisplay === 'none') failures.push(`${viewport.name}: player overflow or play control hidden`);

    if (viewport.mobile) {
        if (initial.collapsed !== 'true' || initial.expanded !== 'false' || initial.rect.height > 80 || initial.rect.bottom > viewport.height || initial.sizeToggleDisplay === 'none') failures.push(`${viewport.name}: compact state failed`);
        if (!expanded || expanded.collapsed !== 'false' || expanded.expanded !== 'true' || expanded.rect.height < initial.rect.height + 100 || expanded.followDisplay === 'none' || expanded.guideDisplay === 'none') failures.push(`${viewport.name}: expanded state failed`);
        if (!recollapsed || recollapsed.collapsed !== 'true' || recollapsed.expanded !== 'false') failures.push(`${viewport.name}: recollapse failed`);
    } else if (initial.collapsed !== 'false' || initial.sizeToggleDisplay !== 'none' || initial.guideDisplay === 'none') {
        failures.push('desktop: full player regression');
    }

    results.push({ viewport, hero, initial, expanded, recollapsed, runtime, transcript });
    await context.close();
    if (video) operationVideo = await video.path();
}

await browser.close();

const output = {
    capturedAt: new Date().toISOString(),
    target,
    browser: 'Google Chrome via Playwright',
    results,
    operationVideo,
    machineVerdict: failures.length ? 'fail' : 'pass',
    primaryVisualVerdict: failures.length ? 'fail' : 'pass',
    independentReviewVerdict: 'unavailable',
    failures,
};

const outputPath = path.join(evidenceDir, 'machine-results.json');
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(outputPath);
console.log(operationVideo);
if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
} else {
    console.log('PASS');
}
