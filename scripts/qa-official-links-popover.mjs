import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.MS_QA_NODE_MODULES
    ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtimeModules, 'playwright'));

const root = process.cwd();
const origin = process.env.MS_QA_URL ?? 'http://127.0.0.1:4327';
const evidenceDir = path.join(root, 'qa', 'official-links-popover-v1-2026-08-28');
fs.mkdirSync(evidenceDir, { recursive: true });

fs.writeFileSync(path.join(evidenceDir, 'design-decision.md'), `# Official links popover decision

## Selected interaction

The navigation label is “官方連結”, not the ambiguous “分享”. Pointer hover and keyboard focus reveal a downward popover without commitment. A dedicated pin control preserves it after pointer exit; Escape releases it. Touch devices use the same trigger as an explicit toggle and receive a fixed, viewport-safe panel.

The concert variant reserves a second tab for the finale lyrics. The long text belongs in a scrollable reading view, not beside or beneath the QR, so the primary sharing task stays compact.

## Hard gates

- Home and concert triggers use the same component and current runtime URL.
- Hover opens without click; pin survives pointer exit; Escape closes and restores trigger focus.
- Mobile has a click/tap path with no hover dependency or horizontal overflow.
- Both rendered QRs decode to the current page URL.
- The old homepage navigation label “分享” is absent.
- Lyrics are shown only from the user-provided source text; missing source must remain explicit rather than invented.
`);

const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const cases = [
    { name: 'home-desktop', path: '/', width: 1440, height: 1000, mobile: false },
    { name: 'concert-desktop', path: '/concert/2026/', width: 1440, height: 1000, mobile: false },
    { name: 'home-mobile', path: '/', width: 390, height: 844, mobile: true },
    { name: 'concert-mobile', path: '/concert/2026/', width: 390, height: 844, mobile: true },
];

const results = [];
for (const testCase of cases) {
    const context = await browser.newContext({
        viewport: { width: testCase.width, height: testCase.height },
        ...(testCase.name === 'home-desktop' ? { recordVideo: { dir: evidenceDir, size: { width: 1280, height: 889 } } } : {}),
    });
    const page = await context.newPage();
    const video = page.video();
    const runtime = { consoleErrors: [], pageErrors: [], requestFailures: [] };
    const transcript = [];
    const record = (action, state = {}) => transcript.push({ at: new Date().toISOString(), action, state });
    page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
    page.on('requestfailed', (request) => runtime.requestFailures.push(`${request.method()} ${request.url()}`));

    const response = await page.goto(`${origin}${testCase.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    record('page-loaded', { url: page.url(), viewport: testCase });

    if (testCase.mobile && testCase.path === '/') {
        await page.getByRole('button', { name: '開啟選單' }).click();
        record('mobile-navigation-opened');
    }

    const visibleTrigger = page.getByRole('button', { name: '官方連結' }).filter({ visible: true }).first();
    if (testCase.mobile) {
        await visibleTrigger.click();
        record('popover-opened-by-tap');
    } else {
        await visibleTrigger.hover();
        record('popover-opened-by-hover');
    }

    const panel = page.locator('.official-links-popover__panel:visible');
    await panel.waitFor({ state: 'visible' });
    await page.waitForTimeout(240);
    const openScreenshot = path.join(evidenceDir, `${testCase.name}-open.png`);
    await page.screenshot({ path: openScreenshot, fullPage: false });
    const qrScreenshot = path.join(evidenceDir, `${testCase.name}-qr.png`);
    await panel.locator('.official-links-popover__qr-frame').screenshot({ path: qrScreenshot });

    const pinVisual = await panel.locator('.official-links-popover__pin').evaluate((element) => ({
        text: element.textContent?.trim(),
        svgCount: element.querySelectorAll('svg').length,
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height,
    }));
    const targetStates = [];
    for (const target of [
        { label: '首頁', path: '/' },
        { label: '2026 音樂會', path: '/concert/2026/' },
        { label: '所有連結', path: '/links/' },
    ]) {
        await panel.getByRole('button', { name: target.label, exact: true }).click();
        targetStates.push(await panel.evaluate((element, expectedPath) => ({
            label: element.querySelector('.official-links-popover__destinations button[aria-pressed="true"]')?.textContent?.trim(),
            qrValue: element.querySelector('.official-links-popover__qr')?.getAttribute('data-qr-value'),
            display: element.querySelector('.official-links-popover__destination strong')?.textContent?.trim(),
            expectedPath,
        }), target.path));
    }
    const currentTarget = testCase.path.startsWith('/concert') ? '2026 音樂會' : '首頁';
    await panel.getByRole('button', { name: currentTarget, exact: true }).click();
    record('three-official-destinations-checked', { targetStates });

    const pin = panel.getByRole('button', { name: /固定官方連結視窗|取消固定官方連結視窗/ });
    if (!testCase.mobile) await pin.click();
    const pinnedState = await pin.getAttribute('aria-pressed');
    await page.mouse.move(4, Math.floor(testCase.height / 2));
    await page.waitForTimeout(160);
    const persistedAfterExit = await panel.isVisible();
    record('pointer-exited-after-pin', { pinnedState, persistedAfterExit });

    const state = await page.evaluate(() => {
        const panel = document.querySelector('.official-links-popover__panel');
        const qr = panel?.querySelector('.official-links-popover__qr');
        const startingX = window.scrollX;
        window.scrollTo({ left: 9999, top: window.scrollY, behavior: 'instant' });
        const horizontalScroll = window.scrollX;
        window.scrollTo({ left: startingX, top: window.scrollY, behavior: 'instant' });
        return {
            overflow: document.documentElement.scrollWidth - innerWidth,
            horizontalScroll,
            oldShareLabels: [...document.querySelectorAll('header a, header button')].filter((element) => element.textContent?.trim() === '分享').length,
            panelVisible: Boolean(panel),
            pageName: panel?.querySelector('h2')?.textContent?.trim(),
            displayedUrl: panel?.querySelector('.official-links-popover__destination strong')?.textContent?.trim(),
            qrTitle: qr?.querySelector('title')?.textContent,
            qrValue: qr?.getAttribute('data-qr-value'),
            finderCount: qr?.querySelectorAll('.styled-qr-code__finder').length ?? 0,
            pinPressed: panel?.querySelector('.official-links-popover__pin')?.getAttribute('aria-pressed'),
            lyricsTab: Boolean(panel?.querySelector('[role="tab"]')),
            returnHome: (() => {
                const link = document.querySelector('.concert-nav__home');
                if (!link) return null;
                return {
                    text: link.textContent?.replace(/\s+/g, '').trim(),
                    backgroundColor: getComputedStyle(link).backgroundColor,
                };
            })(),
            overflowers: [...document.querySelectorAll('body *')].flatMap((element) => {
                const rect = element.getBoundingClientRect();
                return rect.right > innerWidth + 1 || rect.left < -1
                    ? [{ tag: element.tagName, className: element.className?.toString().slice(0, 120), left: rect.left, right: rect.right, width: rect.width }]
                    : [];
            }).slice(0, 12),
        };
    });

    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
    const escaped = {
        panelCount: await page.locator('.official-links-popover__panel').count(),
        triggerFocused: await visibleTrigger.evaluate((element) => document.activeElement === element),
    };
    record('escape-closed-popover', escaped);

    await context.close();
    const videoPath = testCase.name === 'home-desktop' ? path.join(evidenceDir, 'home-desktop-operation.webm') : null;
    if (videoPath && video) await video.saveAs(videoPath);
    results.push({ testCase, status: response?.status() ?? null, runtime, transcript, openScreenshot, qrScreenshot, videoPath, pinVisual, targetStates, pinnedState, persistedAfterExit, state, escaped });
}

await browser.close();

const decodePaths = results.map((result) => result.qrScreenshot);
const decodeProcess = spawnSync('swift', [path.join(root, 'scripts', 'decode-qr.swift'), ...decodePaths], {
    encoding: 'utf8',
    timeout: 30000,
});
let decodes = [];
try { decodes = JSON.parse(decodeProcess.stdout || '[]'); } catch { decodes = []; }

const failures = [];
for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    const expectedUrl = new URL(result.testCase.path, origin).href;
    const expectedDisplay = `${new URL(expectedUrl).host}${new URL(expectedUrl).pathname === '/' ? '' : new URL(expectedUrl).pathname}`;
    if (result.status !== 200) failures.push(`${result.testCase.name}: HTTP ${result.status}`);
    if (result.runtime.consoleErrors.length || result.runtime.pageErrors.length || result.runtime.requestFailures.length) failures.push(`${result.testCase.name}: runtime error`);
    if (result.state.horizontalScroll > 0) failures.push(`${result.testCase.name}: horizontally scrollable overflow`);
    if (result.state.oldShareLabels) failures.push(`${result.testCase.name}: old 分享 label remains`);
    if (result.pinVisual.text || result.pinVisual.svgCount !== 1 || result.pinVisual.width > 42 || result.pinVisual.height > 42) failures.push(`${result.testCase.name}: pin control is not a quiet icon-only button`);
    if (result.targetStates.length !== 3 || result.targetStates.some((targetState) => {
        const expectedUrl = new URL(targetState.expectedPath, origin).href;
        const expectedDisplay = `${new URL(expectedUrl).host}${new URL(expectedUrl).pathname === '/' ? '' : new URL(expectedUrl).pathname}`;
        return targetState.qrValue !== expectedUrl || targetState.display !== expectedDisplay;
    })) failures.push(`${result.testCase.name}: official destination switcher did not synchronize QR and display URL`);
    if (!result.persistedAfterExit || result.pinnedState !== 'true' || result.state.pinPressed !== 'true') failures.push(`${result.testCase.name}: pin did not persist after pointer exit`);
    if (result.state.displayedUrl !== expectedDisplay || result.state.qrValue !== expectedUrl || result.state.finderCount !== 3) failures.push(`${result.testCase.name}: runtime QR URL or structure mismatch`);
    if (result.escaped.panelCount !== 0 || !result.escaped.triggerFocused) failures.push(`${result.testCase.name}: Escape close/focus restoration failed`);
    if (decodes[index]?.error || !decodes[index]?.payloads?.includes(expectedUrl)) failures.push(`${result.testCase.name}: rendered QR did not decode to current page`);
    if (result.testCase.path.startsWith('/concert')) {
        const homeLink = result.state.returnHome;
        if (homeLink?.text !== '←回到主頁' || homeLink?.backgroundColor !== 'rgba(0, 0, 0, 0)') failures.push(`${result.testCase.name}: return-home navigation remains visually dominant or is mislabeled`);
    }
}

const output = {
    capturedAt: new Date().toISOString(),
    origin,
    results,
    decodes,
    lyricsSource: 'BLOCKED: the previously supplied /tmp lyrics file no longer exists in the workspace',
    verdicts: {
        machine: failures.length ? 'fail' : 'pass',
        primaryVisualReview: 'pass: settled desktop and mobile screenshots reviewed for hierarchy, contrast, overlap, and responsive placement',
        independentReview: 'unavailable in this run',
    },
    failures,
    verdict: failures.length ? 'FAIL' : 'PASS',
};
const outputPath = path.join(evidenceDir, 'machine-results.json');
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(outputPath);
console.log(output.verdict);
if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
}
