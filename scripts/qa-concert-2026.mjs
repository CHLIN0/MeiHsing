import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const localRequire = createRequire(import.meta.url);
let chromium;

try {
    ({ chromium } = localRequire('playwright'));
} catch {
    const bundledNodeModules = process.env.CONCERT_QA_NODE_MODULES;
    if (!bundledNodeModules) {
        throw new Error('Playwright is unavailable. Set CONCERT_QA_NODE_MODULES to the bundled Node packages directory.');
    }
    const bundledRequire = createRequire(path.join(bundledNodeModules, 'playwright', 'package.json'));
    ({ chromium } = bundledRequire('playwright'));
}

const root = process.cwd();
const evidenceDir = path.join(root, 'qa', 'concert-2026');
const videoDir = path.join(evidenceDir, 'video');
const target = process.env.CONCERT_QA_URL ?? 'http://127.0.0.1:4321/concert/2026/';
const buildTarget = process.env.CONCERT_QA_BUILD_TARGET ?? 'Astro 5.18.0 local server';

fs.mkdirSync(videoDir, { recursive: true });

const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const viewportResults = [];

for (const viewport of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'narrow', width: 320, height: 800 },
]) {
    const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    const consoleMessages = [];
    const pageErrors = [];

    page.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning') {
            consoleMessages.push({ type: message.type(), text: message.text() });
        }
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const response = await page.goto(target, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
    });

    await page.screenshot({
        path: path.join(evidenceDir, `${viewport.name}-full.png`),
        fullPage: true,
    });

    for (const [label, selector] of [
        ['hero', '.concert-hero'],
        ['programme', '.concert-programme__paper'],
        ['gratitude', '.concert-gratitude'],
        ['registry', '.concert-gratitude__registry'],
    ]) {
        if (viewport.name === 'narrow' && label !== 'hero' && label !== 'programme') continue;
        await page.locator(selector).screenshot({
            path: path.join(evidenceDir, `${viewport.name}-${label}.png`),
        });
    }

    if (viewport.name !== 'narrow') {
        for (const [label, selector, block] of [
            ['programme-viewport', '#programme', 'start'],
            ['gratitude-viewport', '#gratitude', 'start'],
            ['registry-viewport', '.concert-gratitude__registry', 'center'],
        ]) {
            await page.locator(selector).evaluate(
                (element, scrollBlock) => element.scrollIntoView({ block: scrollBlock, behavior: 'auto' }),
                block,
            );
            await page.waitForTimeout(80);
            await page.screenshot({
                path: path.join(evidenceDir, `${viewport.name}-${label}.png`),
                fullPage: false,
            });
        }
    }

    const machineState = await page.evaluate(() => {
        const bodyText = document.body.textContent ?? '';
        const programmeEntries = [...document.querySelectorAll('.concert-programme__entry')];
        const maskedEntry = programmeEntries[14];
        const headings = [...document.querySelectorAll('h1')].map((heading) => heading.textContent?.trim());
        const resources = performance.getEntriesByType('resource');
        const fontSize = (selector) => {
            const element = document.querySelector(selector);
            return element ? Number.parseFloat(getComputedStyle(element).fontSize) : null;
        };

        return {
            title: document.title,
            canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
            h1: headings,
            programmeCount: programmeEntries.length,
            firstHalfEntries: document.querySelectorAll('.concert-programme__half:first-child .concert-programme__entry').length,
            secondHalfEntries: document.querySelectorAll('.concert-programme__half:last-child .concert-programme__entry').length,
            maskedVisibleText: maskedEntry?.querySelector('.concert-programme__masked-title')?.textContent?.trim() ?? null,
            requiredTerms: {
                jingYongHeng: bodyText.includes('荊永蘅'),
                jingYongQian: bodyText.includes('荊永謙'),
                caiYiCheng: bodyText.includes('蔡宜澄'),
                wengRuiRong: bodyText.includes('翁瑞榮'),
                worldPromise: bodyText.includes('世界的約定'),
                newSponsors: ['張馨云', '蔡志昌', '呂蕙茹'].every((name) => bodyText.includes(name)),
                photography: bodyText.includes('攝影') && bodyText.includes('李宥佳'),
                updatedChoirMember: bodyText.includes('劉麗娟'),
            },
            staleTerms: ['荊泳蘅', '荊泳謙', '蔡怡成', '曾文惠', '曾文慧', '霍爾的移動城堡', '鍵盤｜王宏恩', '劉秀妹', '蕭紫安', '黃美琴']
                .filter((term) => bodyText.includes(term)),
            removedStorySections: document.querySelectorAll('.concert-story, #about-concert').length,
            gratitudeSections: document.querySelectorAll('#gratitude').length,
            gratitudePrimaryHeadings: document.querySelectorAll('#gratitude h2').length,
            sponsorCount: document.querySelectorAll('.concert-sponsors li').length,
            choirMemberCounts: [...document.querySelectorAll('.concert-choirs details')]
                .map((details) => details.querySelectorAll('li').length),
            readabilityPx: {
                programmeHeading: fontSize('.concert-programme__masthead h2'),
                halfHeading: fontSize('.concert-programme__half-heading h3'),
                work: fontSize('.concert-programme__title-line h4'),
                performer: fontSize('.concert-programme__performer'),
                details: fontSize('.concert-programme__details p'),
                sponsor: fontSize('.concert-sponsors li'),
                choirSummary: fontSize('.concert-choirs summary'),
            },
            horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
            missingImageAlt: document.querySelectorAll('img:not([alt])').length,
            emptyLinks: [...document.querySelectorAll('a')].filter((link) => !link.getAttribute('href')).length,
            emptyButtons: [...document.querySelectorAll('button')].filter((button) => !button.textContent?.trim() && !button.getAttribute('aria-label')).length,
            detailsCount: document.querySelectorAll('details').length,
            programmeJumpLinks: document.querySelectorAll('.concert-programme__jump a').length,
            musicEventSchemas: [...document.querySelectorAll('script[type="application/ld+json"]')]
                .map((script) => script.textContent ?? '')
                .filter((text) => text.includes('MusicEvent')).length,
            transferBytes: resources.reduce((total, resource) => total + ('transferSize' in resource ? resource.transferSize : 0), 0),
            resourceCount: resources.length,
        };
    });

    await page.locator('.concert-hero__actions a[href="#programme"]').focus();
    const focusedText = await page.evaluate(() => document.activeElement?.textContent?.trim());
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
    const hashAfterProgrammeAction = new URL(page.url()).hash;
    const programmeAnchorClear = await page.evaluate(() => {
        const programme = document.querySelector('#programme');
        const navigation = document.querySelector('.concert-nav');
        if (!programme || !navigation) return null;

        return programme.getBoundingClientRect().top >= navigation.getBoundingClientRect().bottom - 2;
    });

    await page.locator('.concert-programme__jump a[href="#second-half"]').click();
    await page.waitForTimeout(120);
    const hashAfterSecondHalfAction = new URL(page.url()).hash;
    const secondHalfAnchorClear = await page.evaluate(() => {
        const secondHalf = document.querySelector('#second-half');
        const navigation = document.querySelector('.concert-nav');
        if (!secondHalf || !navigation) return null;

        return secondHalf.getBoundingClientRect().top >= navigation.getBoundingClientRect().bottom - 2;
    });

    const firstChoir = page.locator('.concert-choirs details').first();
    await firstChoir.scrollIntoViewIfNeeded();
    await firstChoir.locator('summary').click();
    const choirExpanded = await firstChoir.evaluate((element) => element.hasAttribute('open'));

    viewportResults.push({
        viewport,
        httpStatus: response?.status() ?? null,
        consoleMessages,
        pageErrors,
        focusedText,
        hashAfterProgrammeAction,
        programmeAnchorClear,
        hashAfterSecondHalfAction,
        secondHalfAnchorClear,
        choirExpanded,
        ...machineState,
    });

    await context.close();
}

const reducedContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
});
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(target, { waitUntil: 'networkidle' });
const reducedMotionState = await reducedPage.evaluate(() => ({
    heroAnimation: getComputedStyle(document.querySelector('.concert-hero__art img')).animationName,
    scrollAnimation: getComputedStyle(document.querySelector('.concert-hero__scroll-line')).animationName,
    prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
}));
await reducedContext.close();

const videoContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
});
const videoPage = await videoContext.newPage();
await videoPage.goto(target, { waitUntil: 'networkidle' });
await videoPage.waitForTimeout(600);
await videoPage.locator('.concert-hero__actions a[href="#programme"]').click();
await videoPage.waitForTimeout(700);
await videoPage.locator('#gratitude').scrollIntoViewIfNeeded();
await videoPage.waitForTimeout(700);
await videoPage.locator('.concert-choirs details').first().scrollIntoViewIfNeeded();
await videoPage.locator('.concert-choirs details').first().locator('summary').click();
await videoPage.waitForTimeout(700);
const recordedVideo = videoPage.video();
await videoContext.close();
const videoPath = await recordedVideo?.path();

await browser.close();

const result = {
    capturedAt: new Date().toISOString(),
    target,
    buildTarget,
    browser: 'Google Chrome (Playwright)',
    viewportResults,
    reducedMotionState,
    interactionTranscript: [
        'Loaded the concert landing page and waited for network + fonts.',
        'Focused the hero programme CTA and activated it with Enter.',
        'Jumped directly to the second half from the programme masthead.',
        'Scrolled to the merged teacher note and credits section.',
        'Opened the first choir roster disclosure.',
    ],
    videoPath,
};

const resultPath = path.join(evidenceDir, 'machine-results.json');
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(resultPath);
console.log(videoPath);
