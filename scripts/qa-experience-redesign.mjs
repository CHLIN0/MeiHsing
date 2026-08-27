import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.MS_QA_NODE_MODULES
    ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtimeModules, 'playwright'));

const root = process.cwd();
const evidenceDir = path.join(root, 'qa', 'experience-redesign-final-v11-2026-08-28');
const videoDir = path.join(evidenceDir, 'video');
const origin = process.env.MS_QA_URL ?? 'http://127.0.0.1:4322';
const expectedRuntimeUrl = new URL('/links', origin).href;
const expectedDisplayUrl = `${new URL(expectedRuntimeUrl).host}/links`;
fs.mkdirSync(videoDir, { recursive: true });

const decisionReceipt = `# 2026 concert + links redesign decision receipt

## Design read

- The concert hero already carries the strongest visual identity, but its ivory diagonal wedge breaks before the blush programme background.
- The programme control looked interactive but only jumped to two vertically stacked halves, leaving the page unnecessarily long.
- The original links page gave every destination and its QR equal weight. The first redesign clarified the destination hierarchy, but it incorrectly removed the QR despite an important cross-device presentation use case.

## Theses considered

1. **Classic link-in-bio card** — compact, but keeps every destination at the same priority and feels generic.
2. **Editorial portal (selected)** — identity panel, one time-sensitive featured concert, then a scannable official-channel directory.
3. **Bento mosaic** — visually energetic, but makes platform importance depend on arbitrary tile sizes and adds complexity.

## Selected interaction

- Keep all 30 programme entries server-rendered.
- Enhance the two half controls into an accessible tab pattern.
- Exchange panels with directional vertical displacement; queue rapid input; switch instantly for reduced motion.
- Close the long-reading loop with an in-paper “continue to 16–30” action after intermission; it shares the same state machine and deep link.
- Blend hero and programme through a shared sakura-blush wash instead of a geometric wedge.
- Preserve https://ms.linho.me/links as the static fallback, then regenerate the SVG QR from the current page URL at runtime. Integrate the piano feature into the code itself: dark modules resemble compact black keys and a protected central plaque contains one minimal upright-piano keyboard mark.
- Keep the QR card subordinate to the profile: the QR itself is the sole copy button, its hierarchy reads "MEI-HSING LIN / 官方連結 / URL", and the redundant directory copy footer is removed.
- On mobile, keep the QR card horizontal and continuous with the ivory directory surface so it does not become a detached oversized panel.
- Preserve H error correction, finder patterns, a four-module quiet zone, and dark module centers; desktop uses the profile column's intentional negative space, while tablet/mobile place it after the destination directory.
- Keep the portrait as one intentional dimensional frame, and separate the staff/note artwork from the contact divider so decorative lines never read as layout errors.

## Rejected patterns

- No carousel library, autoplay, or swipe-only navigation.
- No client-only React shell for /links.
- No external piano scene, transparent, interactive, or perspective-switched QR; the default branded card is decode-verified at every viewport without interaction.
`;
fs.writeFileSync(path.join(evidenceDir, 'design-decision.md'), decisionReceipt);

const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const viewports = [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'narrow', width: 320, height: 800 },
];

const runtimeLog = (page) => {
    const consoleErrors = [];
    const pageErrors = [];
    const requestFailures = [];
    page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => requestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`));
    return { consoleErrors, pageErrors, requestFailures };
};

const results = [];

for (const viewport of viewports) {
    const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    const logs = runtimeLog(page);

    const concertResponse = await page.goto(`${origin}/concert/2026/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-concert-full.png`), fullPage: true });
    await page.locator('.concert-hero').screenshot({ path: path.join(evidenceDir, `${viewport.name}-concert-hero.png`) });
    await page.locator('#programme').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-programme-first.png`) });

    const concertInitial = await page.evaluate(() => ({
        allEntries: document.querySelectorAll('.concert-programme__entry').length,
        visibleEntries: [...document.querySelectorAll('.concert-programme__entry')]
            .filter((entry) => getComputedStyle(entry.closest('[data-programme-panel]')).visibility === 'visible').length,
        selectedTabs: [...document.querySelectorAll('[data-programme-tab]')].map((tab) => tab.getAttribute('aria-selected')),
        visiblePanels: [...document.querySelectorAll('[data-programme-panel]')]
            .filter((panel) => getComputedStyle(panel).visibility === 'visible').map((panel) => panel.id),
        enhanced: document.querySelector('[data-programme-switcher]')?.getAttribute('data-enhanced'),
        overflow: document.documentElement.scrollWidth - innerWidth,
        workFontPx: Number.parseFloat(getComputedStyle(document.querySelector('.concert-programme__title-line h4')).fontSize),
        tabHeights: [...document.querySelectorAll('[data-programme-tab]')].map((tab) => tab.getBoundingClientRect().height),
        heroBridge: getComputedStyle(document.querySelector('.concert-hero'), '::after').backgroundImage,
        programmeBackground: getComputedStyle(document.querySelector('.concert-programme')).backgroundImage,
    }));

    await page.getByRole('tab', { name: /下半場/ }).click();
    await page.waitForTimeout(90);
    const concertDuringMotion = await page.evaluate(() => ({
        transitioning: document.querySelector('[data-programme-switcher]')?.hasAttribute('data-transitioning'),
        visiblePanels: [...document.querySelectorAll('[data-programme-panel]')]
            .filter((panel) => getComputedStyle(panel).visibility === 'visible').map((panel) => panel.id),
        transforms: [...document.querySelectorAll('[data-programme-panel]')].map((panel) => getComputedStyle(panel).transform),
    }));
    await page.waitForTimeout(430);
    const concertSecond = await page.evaluate(() => ({
        hash: location.hash,
        selectedTabs: [...document.querySelectorAll('[data-programme-tab]')].map((tab) => tab.getAttribute('aria-selected')),
        visiblePanels: [...document.querySelectorAll('[data-programme-panel]')]
            .filter((panel) => getComputedStyle(panel).visibility === 'visible').map((panel) => panel.id),
        ariaHidden: [...document.querySelectorAll('[data-programme-panel]')].map((panel) => panel.getAttribute('aria-hidden')),
    }));
    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-programme-second.png`) });

    await page.getByRole('tab', { name: /下半場/ }).press('ArrowLeft');
    await page.waitForTimeout(460);
    const concertKeyboard = await page.evaluate(() => ({
        focused: document.activeElement?.textContent?.replace(/\s+/g, ' ').trim(),
        selectedTabs: [...document.querySelectorAll('[data-programme-tab]')].map((tab) => tab.getAttribute('aria-selected')),
    }));

    const firstTab = page.getByRole('tab', { name: /上半場/ });
    const secondTab = page.getByRole('tab', { name: /下半場/ });
    await secondTab.click();
    await firstTab.click();
    await secondTab.click();
    await page.waitForTimeout(1420);
    const concertRapid = await page.evaluate(() => ({
        transitioning: document.querySelector('[data-programme-switcher]')?.hasAttribute('data-transitioning'),
        selectedTabs: [...document.querySelectorAll('[data-programme-tab]')].map((tab) => tab.getAttribute('aria-selected')),
        visiblePanels: [...document.querySelectorAll('[data-programme-panel]')]
            .filter((panel) => getComputedStyle(panel).visibility === 'visible').map((panel) => panel.id),
    }));

    await firstTab.click();
    await page.waitForTimeout(460);
    const continueLink = page.locator('[data-programme-next]');
    await continueLink.scrollIntoViewIfNeeded();
    const concertContinueInitial = await page.evaluate(() => {
        const link = document.querySelector('[data-programme-next]');
        const tabs = document.querySelector('[data-programme-tabs]');
        return {
            href: link?.getAttribute('href'),
            height: link?.getBoundingClientRect().height ?? 0,
            tabsAboveViewportPx: tabs ? Math.max(0, -tabs.getBoundingClientRect().bottom) : 0,
        };
    });
    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-programme-continue.png`) });
    await continueLink.click();
    await page.waitForTimeout(1150);
    const concertContinue = await page.evaluate(() => ({
        hash: location.hash,
        visiblePanels: [...document.querySelectorAll('[data-programme-panel]')]
            .filter((panel) => getComputedStyle(panel).visibility === 'visible').map((panel) => panel.id),
        focusedId: document.activeElement?.id,
        headingTop: document.querySelector('#second-half-heading')?.getBoundingClientRect().top ?? null,
        viewportHeight: innerHeight,
    }));
    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-programme-continued.png`) });

    const linksResponse = await page.goto(`${origin}/links`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-links-full.png`), fullPage: true });
    await page.locator('.links-scan-card').screenshot({ path: path.join(evidenceDir, `${viewport.name}-links-qr-card.png`) });
    await page.locator('.links-scan-card').screenshot({ path: path.join(evidenceDir, `${viewport.name}-links-qr.png`) });

    const linksInitial = await page.evaluate(() => {
        const qr = document.querySelector('.styled-qr-code');
        const qrRect = qr?.getBoundingClientRect();
        const scanRect = document.querySelector('.links-scan-card')?.getBoundingClientRect();
        const profileRect = document.querySelector('.links-profile')?.getBoundingClientRect();
        const directoryRect = document.querySelector('.links-directory')?.getBoundingClientRect();
        const desktopPlacement = Boolean(scanRect && profileRect
            && scanRect.left >= profileRect.left
            && scanRect.right <= profileRect.right
            && scanRect.top >= profileRect.top
            && scanRect.bottom <= profileRect.bottom);
        const stackedPlacement = Boolean(scanRect && directoryRect && scanRect.top >= directoryRect.bottom - 1);

        return {
            main: Boolean(document.querySelector('#main-content')),
            h1: document.querySelector('h1')?.textContent?.replace(/\s+/g, ''),
            featureHref: document.querySelector('.links-feature')?.getAttribute('href'),
            destinationCount: document.querySelectorAll('.links-destination').length,
            externalTargets: document.querySelectorAll('.links-destination[target="_blank"]').length,
            overflow: document.documentElement.scrollWidth - innerWidth,
            targetHeights: [...document.querySelectorAll('.links-feature, .links-destination, [data-copy-link]')]
                .map((element) => element.getBoundingClientRect().height),
            labelFontPx: Number.parseFloat(getComputedStyle(document.querySelector('.links-destination__copy strong')).fontSize),
            descriptionFontPx: Number.parseFloat(getComputedStyle(document.querySelector('.links-destination__copy > span')).fontSize),
            missingImageAlt: document.querySelectorAll('img:not([alt])').length,
            emptyLinks: [...document.querySelectorAll('a')].filter((link) => !link.getAttribute('href')).length,
            qr: {
                value: qr?.getAttribute('data-qr-value'),
                role: qr?.getAttribute('role'),
                title: qr?.querySelector('title')?.textContent,
                width: qrRect?.width ?? 0,
                height: qrRect?.height ?? 0,
                dotCount: qr?.querySelectorAll('.styled-qr-code__piano-keys rect').length ?? 0,
                finderCount: qr?.querySelectorAll('.styled-qr-code__finder').length ?? 0,
                desktopPlacement,
                stackedPlacement,
            },
            displayedUrls: [...document.querySelectorAll('[data-current-links-url]')].map((element) => element.textContent?.trim()),
            shareUrl: document.querySelector('[data-links-page]')?.getAttribute('data-share-url'),
            directoryCopyCount: document.querySelectorAll('.links-directory [data-copy-link]').length,
            qrCopyButton: Boolean(document.querySelector('.links-scan-card__code[data-copy-link]')),
            portraitFrame: {
                pseudoContent: getComputedStyle(document.querySelector('.links-profile__portrait'), '::before').content,
                boxShadow: getComputedStyle(document.querySelector('.links-profile__portrait')).boxShadow,
            },
            musicalBackdrop: {
                contactBorderTopWidth: getComputedStyle(document.querySelector('.links-profile__contact')).borderTopWidth,
                shortDividerWidth: Number.parseFloat(getComputedStyle(document.querySelector('.links-profile__contact'), '::before').width),
            },
        };
    });

    await page.getByRole('button', { name: '複製林美杏老師官方連結網址' }).click();
    await page.waitForTimeout(650);
    const copyLabel = await page.locator('[data-copy-label]').innerText();

    results.push({
        viewport,
        concertStatus: concertResponse?.status() ?? null,
        linksStatus: linksResponse?.status() ?? null,
        logs,
        concertInitial,
        concertDuringMotion,
        concertSecond,
        concertKeyboard,
        concertRapid,
        concertContinueInitial,
        concertContinue,
        linksInitial,
        copyLabel,
    });

    await context.close();
}

const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(`${origin}/concert/2026/`, { waitUntil: 'networkidle' });
await reducedPage.getByRole('tab', { name: /下半場/ }).click();
await reducedPage.waitForTimeout(120);
const reducedTabSwitch = await reducedPage.evaluate(() => ({
    prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    transitioning: document.querySelector('[data-programme-switcher]')?.hasAttribute('data-transitioning'),
    selectedTabs: [...document.querySelectorAll('[data-programme-tab]')].map((tab) => tab.getAttribute('aria-selected')),
    visiblePanels: [...document.querySelectorAll('[data-programme-panel]')]
        .filter((panel) => getComputedStyle(panel).visibility === 'visible').map((panel) => panel.id),
}));
await reducedPage.getByRole('tab', { name: /上半場/ }).click();
await reducedPage.waitForTimeout(120);
const reducedContinueLink = reducedPage.locator('[data-programme-next]');
await reducedContinueLink.scrollIntoViewIfNeeded();
await reducedPage.screenshot({ path: path.join(evidenceDir, 'reduced-motion-programme-continue.png') });
await reducedContinueLink.focus();
await reducedContinueLink.press('Enter');
await reducedPage.waitForTimeout(500);
const reducedContinue = await reducedPage.evaluate(() => ({
    hash: location.hash,
    transitioning: document.querySelector('[data-programme-switcher]')?.hasAttribute('data-transitioning'),
    visiblePanels: [...document.querySelectorAll('[data-programme-panel]')]
        .filter((panel) => getComputedStyle(panel).visibility === 'visible').map((panel) => panel.id),
    focusedId: document.activeElement?.id,
    headingTop: document.querySelector('#second-half-heading')?.getBoundingClientRect().top ?? null,
    viewportHeight: innerHeight,
}));
await reducedPage.screenshot({ path: path.join(evidenceDir, 'reduced-motion-programme-continued.png') });
const reducedMotion = { tabSwitch: reducedTabSwitch, continue: reducedContinue };
await reducedContext.close();

const deepLinkContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const deepLinkPage = await deepLinkContext.newPage();
await deepLinkPage.goto(`${origin}/concert/2026/#second-half`, { waitUntil: 'networkidle' });
const deepLink = await deepLinkPage.evaluate(() => ({
    hash: location.hash,
    selectedTabs: [...document.querySelectorAll('[data-programme-tab]')].map((tab) => tab.getAttribute('aria-selected')),
    visiblePanels: [...document.querySelectorAll('[data-programme-panel]')]
        .filter((panel) => getComputedStyle(panel).visibility === 'visible').map((panel) => panel.id),
}));
await deepLinkContext.close();

const noJsContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
const noJsPage = await noJsContext.newPage();
await noJsPage.goto(`${origin}/concert/2026/`, { waitUntil: 'networkidle' });
const noJs = await noJsPage.evaluate(() => ({
    enhanced: document.querySelector('[data-programme-switcher]')?.getAttribute('data-enhanced'),
    visibleEntries: [...document.querySelectorAll('.concert-programme__entry')]
        .filter((entry) => getComputedStyle(entry.closest('[data-programme-panel]')).visibility === 'visible').length,
    secondPanelAriaHidden: document.querySelector('#second-half')?.getAttribute('aria-hidden'),
    secondTabRole: document.querySelector('[href="#second-half"]')?.getAttribute('role'),
    secondTabIndex: document.querySelector('[href="#second-half"]')?.getAttribute('tabindex'),
    continueHref: document.querySelector('[data-programme-next]')?.getAttribute('href'),
}));
await noJsPage.locator('[data-programme-next]').click();
await noJsPage.waitForTimeout(100);
noJs.hashAfterContinue = await noJsPage.evaluate(() => location.hash);
await noJsContext.close();

const videoContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: videoDir, size: { width: 1280, height: 800 } },
});
const videoPage = await videoContext.newPage();
await videoPage.goto(`${origin}/concert/2026/`, { waitUntil: 'networkidle' });
await videoPage.locator('#programme').scrollIntoViewIfNeeded();
await videoPage.waitForTimeout(500);
await videoPage.getByRole('tab', { name: /下半場/ }).click();
await videoPage.waitForTimeout(850);
await videoPage.getByRole('tab', { name: /上半場/ }).click();
await videoPage.waitForTimeout(850);
await videoPage.locator('[data-programme-next]').scrollIntoViewIfNeeded();
await videoPage.waitForTimeout(500);
await videoPage.locator('[data-programme-next]').click();
await videoPage.waitForTimeout(1250);
const recordedVideo = videoPage.video();
await videoContext.close();
const videoPath = await recordedVideo?.path();

await browser.close();

const qrScreenshotPaths = viewports.map((viewport) => path.join(evidenceDir, `${viewport.name}-links-qr.png`));
const qrDecodeProcess = spawnSync('swift', [path.join(root, 'scripts', 'decode-qr.swift'), ...qrScreenshotPaths], {
    encoding: 'utf8',
    timeout: 30000,
});
let qrDecodes = [];
try {
    qrDecodes = JSON.parse(qrDecodeProcess.stdout || '[]');
} catch {
    qrDecodes = [];
}

const linksHtml = fs.readFileSync(path.join(root, 'dist', 'links', 'index.html'), 'utf8');
const concertHtml = fs.readFileSync(path.join(root, 'dist', 'concert', '2026', 'index.html'), 'utf8');
const staticLinks = {
    containsPortalMarkup: linksHtml.includes('class="links-portal"'),
    containsConcertLink: linksHtml.includes('href="/concert/2026/"'),
    containsQrSvg: linksHtml.includes('class="styled-qr-code"'),
    containsQrValue: linksHtml.includes('data-qr-value="https://ms.linho.me/links"'),
    containsAstroIsland: linksHtml.includes('<astro-island'),
};
const staticConcert = {
    containsContinueLink: concertHtml.includes('data-programme-next'),
    shipsTabRoleBeforeEnhancement: /data-programme-tab[^>]*role="tab"/.test(concertHtml),
    shipsHiddenSecondPanelBeforeEnhancement: /id="second-half"[^>]*aria-hidden="true"/.test(concertHtml),
};

const failures = [];
for (const result of results) {
    const prefix = result.viewport.name;
    if (result.concertStatus !== 200) failures.push(`${prefix}: concert HTTP ${result.concertStatus}`);
    if (result.linksStatus !== 200) failures.push(`${prefix}: links HTTP ${result.linksStatus}`);
    if (result.logs.consoleErrors.length || result.logs.pageErrors.length || result.logs.requestFailures.length) failures.push(`${prefix}: runtime errors present`);
    if (result.concertInitial.allEntries !== 30 || result.concertInitial.visibleEntries !== 15) failures.push(`${prefix}: programme is not 30 total / 15 visible`);
    if (result.concertInitial.overflow > 0 || result.linksInitial.overflow > 0) failures.push(`${prefix}: horizontal overflow`);
    if (result.concertInitial.enhanced !== 'true') failures.push(`${prefix}: programme enhancement missing`);
    if (!result.concertDuringMotion.transitioning || result.concertDuringMotion.visiblePanels.length !== 2) failures.push(`${prefix}: exchange animation not observable`);
    if (result.concertSecond.hash !== '#second-half' || result.concertSecond.visiblePanels.join() !== 'second-half') failures.push(`${prefix}: second-half state failed`);
    if (!result.concertKeyboard.focused?.includes('上半場') || result.concertKeyboard.selectedTabs.join() !== 'true,false') failures.push(`${prefix}: keyboard tab state failed`);
    if (result.concertRapid.transitioning || result.concertRapid.visiblePanels.join() !== 'second-half') failures.push(`${prefix}: rapid switching did not settle on last input`);
    if (Math.min(...result.concertInitial.tabHeights) < 44) failures.push(`${prefix}: programme tab target below 44px`);
    if (result.concertContinueInitial.href !== '#second-half' || result.concertContinueInitial.height < 44) failures.push(`${prefix}: in-paper continue action missing or too small`);
    if (result.concertContinue.hash !== '#second-half' || result.concertContinue.visiblePanels.join() !== 'second-half') failures.push(`${prefix}: in-paper continue action did not switch halves`);
    if (result.concertContinue.focusedId !== 'second-half-heading' || result.concertContinue.headingTop === null || result.concertContinue.headingTop < 0 || result.concertContinue.headingTop > result.concertContinue.viewportHeight * 0.45) failures.push(`${prefix}: continue action did not restore reading position and focus`);
    if (result.linksInitial.featureHref !== '/concert/2026/' || result.linksInitial.destinationCount !== 4 || result.linksInitial.externalTargets !== 3) failures.push(`${prefix}: links hierarchy or targets wrong`);
    if (Math.min(...result.linksInitial.targetHeights) < 44) failures.push(`${prefix}: links target below 44px`);
    if (!result.linksInitial.main || result.linksInitial.missingImageAlt || result.linksInitial.emptyLinks) failures.push(`${prefix}: links semantics failed`);
    if (result.linksInitial.qr.value !== expectedRuntimeUrl || result.linksInitial.qr.role !== 'img' || !result.linksInitial.qr.title || result.linksInitial.qr.dotCount < 100 || result.linksInitial.qr.finderCount !== 3) failures.push(`${prefix}: styled QR semantics, runtime payload, dots, or finder eyes failed`);
    if (result.linksInitial.displayedUrls.some((value) => value !== expectedDisplayUrl) || result.linksInitial.shareUrl !== expectedRuntimeUrl) failures.push(`${prefix}: displayed or copied URL did not follow the current page`);
    if (result.linksInitial.directoryCopyCount || !result.linksInitial.qrCopyButton) failures.push(`${prefix}: copy interaction is duplicated or not attached to the QR`);
    const minimumQrWidth = prefix === 'desktop' ? 120 : prefix === 'mobile' ? 120 : 115;
    if (result.linksInitial.qr.width < minimumQrWidth || Math.abs(result.linksInitial.qr.width - result.linksInitial.qr.height) > 1) failures.push(`${prefix}: QR render size is too small or not square`);
    if (prefix === 'desktop' ? !result.linksInitial.qr.desktopPlacement : !result.linksInitial.qr.stackedPlacement) failures.push(`${prefix}: QR responsive placement failed`);
    if (result.linksInitial.portraitFrame.pseudoContent !== 'none' || result.linksInitial.portraitFrame.boxShadow === 'none') failures.push(`${prefix}: portrait still has an accidental duplicate ring or lacks dimensional treatment`);
    if (result.linksInitial.musicalBackdrop.contactBorderTopWidth !== '0px' || result.linksInitial.musicalBackdrop.shortDividerWidth < 30 || result.linksInitial.musicalBackdrop.shortDividerWidth > 60) failures.push(`${prefix}: musical backdrop still collides with a full-width contact divider`);
    if (result.copyLabel !== '網址已複製') failures.push(`${prefix}: QR copy action failed`);
}
if (!reducedMotion.tabSwitch.prefersReducedMotion || reducedMotion.tabSwitch.transitioning || reducedMotion.tabSwitch.visiblePanels.join() !== 'second-half') failures.push('reduced-motion tab switch failed');
if (reducedMotion.continue.transitioning || reducedMotion.continue.hash !== '#second-half' || reducedMotion.continue.visiblePanels.join() !== 'second-half' || reducedMotion.continue.focusedId !== 'second-half-heading' || reducedMotion.continue.headingTop === null || reducedMotion.continue.headingTop < 0 || reducedMotion.continue.headingTop > reducedMotion.continue.viewportHeight * 0.45) failures.push('reduced-motion keyboard continue handoff failed');
if (deepLink.hash !== '#second-half' || deepLink.visiblePanels.join() !== 'second-half') failures.push('deep link did not select second half');
if (noJs.enhanced !== null || noJs.visibleEntries !== 30 || noJs.secondPanelAriaHidden !== null || noJs.secondTabRole !== null || noJs.secondTabIndex !== null || noJs.continueHref !== '#second-half' || noJs.hashAfterContinue !== '#second-half') failures.push('no-JavaScript programme fallback is not fully readable or navigable');
if (!staticLinks.containsPortalMarkup || !staticLinks.containsConcertLink || !staticLinks.containsQrSvg || !staticLinks.containsQrValue || staticLinks.containsAstroIsland) failures.push('links page or QR is not fully server-rendered');
if (!staticConcert.containsContinueLink || staticConcert.shipsTabRoleBeforeEnhancement || staticConcert.shipsHiddenSecondPanelBeforeEnhancement) failures.push('concert SSR markup is not progressive-enhancement safe');
if (qrDecodeProcess.status !== 0 || qrDecodes.length !== viewports.length || qrDecodes.some((result) => result.error || !result.payloads.includes(expectedRuntimeUrl))) failures.push(`runtime rendered QR decode failed${qrDecodeProcess.stderr ? `: ${qrDecodeProcess.stderr.trim()}` : ''}`);

const output = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    origin,
    expectedRuntimeUrl,
    build: 'Astro production preview',
    results,
    reducedMotion,
    deepLink,
    noJs,
    staticLinks,
    staticConcert,
    qrDecodes,
    videoPath,
    failures,
    verdict: failures.length === 0 ? 'PASS' : 'FAIL',
};

const outputPath = path.join(evidenceDir, 'machine-results.json');
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(outputPath);
console.log(videoPath);
console.log(output.verdict);
if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
}
