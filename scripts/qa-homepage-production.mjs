import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.MS_QA_NODE_MODULES
    ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtimeModules, 'playwright'));

const root = process.cwd();
const origin = process.env.MS_QA_URL ?? 'http://127.0.0.1:4321';
const evidenceDir = path.join(root, 'qa', 'homepage-production-2026-08-28');
const videoDir = path.join(evidenceDir, 'video');
fs.mkdirSync(videoDir, { recursive: true });

const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const viewports = [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'narrow', width: 320, height: 800 },
];

const results = [];
for (const viewport of viewports) {
    const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: 'reduce',
        permissions: ['clipboard-read', 'clipboard-write'],
        ...(viewport.name === 'desktop' ? { recordVideo: { dir: videoDir, size: { width: 1280, height: 889 } } } : {}),
    });
    const page = await context.newPage();
    const video = page.video();
    const runtime = { consoleErrors: [], pageErrors: [], requestFailures: [], badResponses: [] };
    page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
    page.on('requestfailed', (request) => runtime.requestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`));
    page.on('response', (response) => { if (response.status() >= 400) runtime.badResponses.push(`${response.status()} ${response.url()}`); });

    const response = await page.goto(`${origin}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let scrollY = 0; scrollY < pageHeight; scrollY += Math.max(520, Math.floor(viewport.height * 0.7))) {
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await page.waitForTimeout(50);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(180);

    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-full.png`), fullPage: true });
    for (const [name, selector] of [['hero', '.home-hero'], ['about', '.home-about'], ['practice', '.home-practice__columns'], ['field', '.home-field'], ['journey', '.home-journey']]) {
        await page.locator(selector).screenshot({ path: path.join(evidenceDir, `${viewport.name}-${name}.png`) });
    }

    const initial = await page.evaluate(() => {
        const visible = (element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
        };
        const fontSize = (selector) => Number.parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
        const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
        return {
            title: document.title,
            overflow: document.documentElement.scrollWidth - innerWidth,
            bodyFontPx: fontSize('body'),
            courseFontPx: fontSize('.home-course p'),
            roleMetaFontPx: fontSize('.home-role span'),
            themeFontPx: fontSize('.home-theme-card p'),
            milestoneFontPx: fontSize('.home-milestone p'),
            faqFontPx: fontSize('.home-faq details p'),
            duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
            missingAlt: [...document.images].filter((image) => !image.hasAttribute('alt')).length,
            visibleBrokenImages: [...document.images].filter((image) => visible(image) && image.complete && image.naturalWidth === 0).map((image) => image.src),
            unnamedButtons: [...document.querySelectorAll('button')].filter((button) => !button.textContent?.trim() && !button.getAttribute('aria-label')).length,
            concertQuoteLeak: document.body.innerText.includes('願意『再試一次』的堅韌與勇氣'),
            philosophyPresent: document.body.innerText.includes('它讓心更細膩，也讓每一步成長都有了聲音'),
            xinyiChoirPresent: document.body.innerText.includes('興毅信三區合唱團'),
            medicalProfessionLanguage: (document.body.innerText.match(/醫療場域|醫事|醫護專業|治療師/g) ?? []).length,
            groupPhoto: document.querySelector('.home-theme-card img')?.getAttribute('src'),
            tabCount: document.querySelectorAll('[data-gallery-tab]').length,
            selectedTab: document.querySelector('[data-gallery-tab][aria-selected="true"]')?.getAttribute('data-gallery-tab'),
            themeCount: document.querySelectorAll('.home-theme-card').length,
            performance: {
                resourceCount: performance.getEntriesByType('resource').length,
                scriptTransferBytes: performance.getEntriesByType('resource').filter((entry) => entry.initiatorType === 'script').reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
            },
        };
    });

    const tabs = page.getByRole('tab');
    await tabs.first().focus();
    await tabs.first().press('ArrowRight');
    const keyboardTab = await page.locator('[data-gallery-tab][aria-selected="true"]').getAttribute('data-gallery-tab');
    await page.getByRole('tab', { name: /^合唱團/ }).click();
    const visibleBeforeMore = await page.locator('#home-gallery-panel-choir .home-photo:visible').count();
    await page.locator('#home-gallery-panel-choir .home-gallery-more').click();
    const visibleAfterMore = await page.locator('#home-gallery-panel-choir .home-photo:visible').count();
    await page.locator('#home-gallery-panel-choir .home-photo:visible').first().click();
    const lightboxOpen = await page.locator('.home-lightbox').evaluate((dialog) => dialog.open);
    await page.keyboard.press('Escape');
    const lightboxClosed = await page.locator('.home-lightbox').evaluate((dialog) => !dialog.open);
    await page.getByRole('tab', { name: /^全部/ }).click();

    if (viewport.name !== 'desktop') {
        await page.getByRole('button', { name: '開啟選單' }).click();
        await page.getByRole('link', { name: '教學與服務' }).click();
        await page.waitForTimeout(120);
    }

    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('.home-contact__form input[name="name"]').fill('驗收測試');
    await page.locator('.home-contact__form textarea[name="message"]').fill('想了解初學課程');
    await page.locator('[data-contact-copy]').click();
    await page.waitForFunction(() => document.querySelector('.home-contact__status')?.textContent?.trim().length);
    const contactStatus = await page.locator('.home-contact__status').innerText();

    const videoPath = viewport.name === 'desktop' ? path.join(evidenceDir, 'desktop-operation.webm') : null;
    await context.close();
    if (videoPath && video) await video.saveAs(videoPath);

    results.push({
        viewport,
        status: response?.status() ?? null,
        runtime,
        initial,
        interactions: { keyboardTab, visibleBeforeMore, visibleAfterMore, lightboxOpen, lightboxClosed, contactStatus },
        videoPath,
    });
}

await browser.close();

const failures = [];
for (const result of results) {
    const label = result.viewport.name;
    if (result.status !== 200) failures.push(`${label}: HTTP ${result.status}`);
    if (result.runtime.consoleErrors.length || result.runtime.pageErrors.length || result.runtime.requestFailures.length || result.runtime.badResponses.length) failures.push(`${label}: runtime errors`);
    if (result.initial.overflow > 0) failures.push(`${label}: horizontal overflow ${result.initial.overflow}px`);
    if (result.initial.visibleBrokenImages.length || result.initial.missingAlt || result.initial.unnamedButtons || result.initial.duplicateIds.length) failures.push(`${label}: image or accessibility markup failure`);
    if (result.initial.bodyFontPx < 17 || result.initial.courseFontPx < 16 || result.initial.roleMetaFontPx < 15 || result.initial.themeFontPx < 16 || result.initial.milestoneFontPx < 17 || result.initial.faqFontPx < 16) failures.push(`${label}: typography floor regression`);
    if (result.initial.concertQuoteLeak || !result.initial.philosophyPresent || !result.initial.xinyiChoirPresent || result.initial.medicalProfessionLanguage) failures.push(`${label}: content guardrail failure`);
    if (result.initial.groupPhoto !== '/gallery/concert/concert-12.webp' || result.initial.tabCount !== 6 || result.initial.selectedTab !== 'all' || result.initial.themeCount !== 5) failures.push(`${label}: approved overview mismatch`);
    if (result.interactions.keyboardTab !== 'concert' || result.interactions.visibleBeforeMore !== 6 || result.interactions.visibleAfterMore !== 13 || !result.interactions.lightboxOpen || !result.interactions.lightboxClosed || result.interactions.contactStatus !== '洽詢內容已複製。') failures.push(`${label}: interaction failure`);
}

const output = {
    capturedAt: new Date().toISOString(),
    origin,
    results,
    verdicts: {
        machine: failures.length ? 'fail' : 'pass',
        primaryVisualReview: 'pending screenshot inspection',
        independentReview: 'approved proposal had an earlier independent review; production port not re-reviewed independently',
    },
    failures,
    verdict: failures.length ? 'FAIL' : 'PASS',
};
const resultPath = path.join(evidenceDir, 'machine-results.json');
fs.writeFileSync(resultPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(resultPath);
console.log(output.verdict);
if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
}
