import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.MS_QA_NODE_MODULES
  ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtimeModules, 'playwright'));

const root = process.cwd();
const evidenceDir = path.join(root, 'qa', 'piano-qr-copy-button-v11-2026-08-28');
const origin = process.env.MS_QA_URL ?? 'http://127.0.0.1:4322';
const expectedRuntimeUrl = new URL('/links', origin).href;
const expectedDisplayUrl = `${new URL(expectedRuntimeUrl).host}/links`;
fs.mkdirSync(evidenceDir, { recursive: true });

fs.writeFileSync(path.join(evidenceDir, 'design-decision.md'), `# Outsider-review QR decision receipt

## Review finding

The integrated piano mark is successful, but the surrounding card still treats operating instructions as headline content. On a page that already lists every destination, "scan and take all links" repeats the page's purpose, competes with the identity hierarchy, and adds no destination confidence.

## Selected concept

The visual QR language remains unchanged. The static HTML keeps https://ms.linho.me/links as a no-JavaScript fallback, then the browser regenerates the same piano-styled QR from the actual current page URL. The QR itself is the only copy button; the redundant directory footer is removed. Mobile uses a compact horizontal identity card rather than an oversized detached QR panel.

## Hard gates

- Default render decodes without interaction at 1440px, 390px, and 320px.
- The complete branded QR card, not only an isolated crop, decodes at all three sizes.
- H error correction, three finder patterns, four-module quiet zone, dark module centers, and a light field are preserved.
- No redundant "scan", "take away", or camera-instruction copy in the visible card.
- No external piano scene, QR toggle, perspective state, or Astro island.
- The runtime QR payload, readable URL, and copy source all match the current page origin and pathname.
- The QR button is keyboard reachable, has a visible focus state, and exposes copy success through an aria-live label.
`);

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
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  const runtime = { consoleErrors: [], pageErrors: [], requestFailures: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
  page.on('requestfailed', (request) => runtime.requestFailures.push(`${request.method()} ${request.url()}`));

  const response = await page.goto(`${origin}/links`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const card = page.locator('.links-scan-card');
  await card.scrollIntoViewIfNeeded();

  const fullPath = path.join(evidenceDir, `${viewport.name}-links-full.png`);
  const cardPath = path.join(evidenceDir, `${viewport.name}-piano-mark-card.png`);
  const qrPath = path.join(evidenceDir, `${viewport.name}-piano-mark-qr.png`);
  await page.screenshot({ path: fullPath, fullPage: true });
  await card.screenshot({ path: cardPath });
  await page.locator('.styled-qr-code').screenshot({ path: qrPath });

  const state = await page.evaluate(() => {
    const qr = document.querySelector('.styled-qr-code');
    const qrRect = qr?.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      toggleCount: document.querySelectorAll('[data-piano-qr-toggle]').length,
      scanCardButtonCount: document.querySelectorAll('.links-scan-card button').length,
      directoryCopyCount: document.querySelectorAll('.links-directory [data-copy-link]').length,
      qrCopyButton: Boolean(document.querySelector('.links-scan-card__code[data-copy-link]')),
      visibleCopy: document.querySelector('.links-scan-card__copy')?.textContent?.replace(/\s+/g, ' ').trim(),
      displayedUrls: [...document.querySelectorAll('[data-current-links-url]')].map((element) => element.textContent?.trim()),
      shareUrl: document.querySelector('[data-links-page]')?.getAttribute('data-share-url'),
      visual: {
        pianoMark: Boolean(qr?.querySelector('.styled-qr-code__piano-mark')),
        externalPianoSceneCount: document.querySelectorAll('[class*="piano-score-qr"]').length,
      },
      qr: {
        value: qr?.getAttribute('data-qr-value'),
        role: qr?.getAttribute('role'),
        title: qr?.querySelector('title')?.textContent,
        width: qrRect?.width ?? 0,
        height: qrRect?.height ?? 0,
        moduleCount: qr?.querySelectorAll('.styled-qr-code__piano-keys rect').length ?? 0,
        depthCount: qr?.querySelectorAll('.styled-qr-code__key-depths rect').length ?? 0,
        finderCount: qr?.querySelectorAll('.styled-qr-code__finder').length ?? 0,
        hasIvoryField: Boolean(qr?.querySelector('.styled-qr-code__ivory-field')),
      },
    };
  });

  const copyButton = page.locator('.links-scan-card__code[data-copy-link]');
  await copyButton.focus();
  const focusPath = path.join(evidenceDir, `${viewport.name}-qr-focus.png`);
  await card.screenshot({ path: focusPath });
  await copyButton.press('Enter');
  await page.waitForTimeout(180);
  const copiedPath = path.join(evidenceDir, `${viewport.name}-qr-copied.png`);
  await card.screenshot({ path: copiedPath });
  const interaction = await page.evaluate(() => ({
    copied: document.querySelector('.links-scan-card__code')?.getAttribute('data-copied'),
    label: document.querySelector('[data-copy-label]')?.textContent?.trim(),
    focused: document.activeElement?.classList.contains('links-scan-card__code') ?? false,
  }));

  results.push({ viewport, status: response?.status() ?? null, runtime, state, interaction, fullPath, cardPath, qrPath, focusPath, copiedPath });
  await context.close();
}

await browser.close();

const decodePaths = results.flatMap((result) => [result.cardPath, result.qrPath]);
const decodeProcess = spawnSync('swift', [path.join(root, 'scripts', 'decode-qr.swift'), ...decodePaths], {
  encoding: 'utf8',
  timeout: 30000,
});
let decodes = [];
try {
  decodes = JSON.parse(decodeProcess.stdout || '[]');
} catch {
  decodes = [];
}

const staticHtml = fs.readFileSync(path.join(root, 'dist', 'links', 'index.html'), 'utf8');
const staticChecks = {
  serverRenderedQr: staticHtml.includes('class="styled-qr-code"'),
  integratedPianoMark: staticHtml.includes('class="styled-qr-code__piano-mark"'),
  noExternalPianoScene: !staticHtml.includes('piano-score-qr'),
  noQrToggle: !staticHtml.includes('data-piano-qr-toggle'),
  noAstroIsland: !staticHtml.includes('<astro-island'),
  fallbackPayload: staticHtml.includes('data-qr-value="https://ms.linho.me/links"'),
};

const failures = [];
for (const result of results) {
  const prefix = result.viewport.name;
  if (result.status !== 200) failures.push(`${prefix}: HTTP ${result.status}`);
  if (result.runtime.consoleErrors.length || result.runtime.pageErrors.length || result.runtime.requestFailures.length) failures.push(`${prefix}: runtime errors`);
  if (result.state.overflow > 0) failures.push(`${prefix}: horizontal overflow`);
  if (result.state.toggleCount || result.state.scanCardButtonCount !== 1 || result.state.directoryCopyCount || !result.state.qrCopyButton) failures.push(`${prefix}: QR copy interaction is duplicated or attached to the wrong element`);
  if (!result.state.visibleCopy?.includes('Mei-Hsing Lin') || !result.state.visibleCopy?.includes('官方連結') || !result.state.visibleCopy?.includes(expectedDisplayUrl) || /掃碼|帶走|開啟手機相機|網站・社群・音樂會/.test(result.state.visibleCopy)) failures.push(`${prefix}: QR copy hierarchy is redundant or destination is unclear`);
  if (result.state.displayedUrls.some((value) => value !== expectedDisplayUrl) || result.state.shareUrl !== expectedRuntimeUrl) failures.push(`${prefix}: readable or copied URL did not follow the current page`);
  if (result.interaction.copied !== 'true' || result.interaction.label !== '網址已複製' || !result.interaction.focused) failures.push(`${prefix}: keyboard copy feedback failed`);
  if (!result.state.visual.pianoMark || result.state.visual.externalPianoSceneCount) failures.push(`${prefix}: piano feature is not integrated cleanly into the QR`);
  if (result.state.qr.value !== expectedRuntimeUrl || result.state.qr.role !== 'img' || !result.state.qr.title) failures.push(`${prefix}: QR semantics or runtime payload failed`);
  if (result.state.qr.moduleCount < 100 || result.state.qr.depthCount !== result.state.qr.moduleCount || result.state.qr.finderCount !== 3 || !result.state.qr.hasIvoryField) failures.push(`${prefix}: piano QR structure failed`);
  const minimumQrWidth = prefix === 'desktop' ? 125 : prefix === 'mobile' ? 120 : 115;
  if (Math.abs(result.state.qr.width - result.state.qr.height) > 1 || result.state.qr.width < minimumQrWidth) failures.push(`${prefix}: QR size or aspect ratio failed`);
}
if (!staticChecks.serverRenderedQr || !staticChecks.integratedPianoMark || !staticChecks.noExternalPianoScene || !staticChecks.noQrToggle || !staticChecks.noAstroIsland || !staticChecks.fallbackPayload) failures.push('static fallback rendering contract failed');
if (decodeProcess.status !== 0 || decodes.length !== decodePaths.length || decodes.some((result) => result.error || !result.payloads.includes(expectedRuntimeUrl))) failures.push(`runtime rendered QR decode failed${decodeProcess.stderr ? `: ${decodeProcess.stderr.trim()}` : ''}`);

const output = {
  schemaVersion: 1,
  capturedAt: new Date().toISOString(),
  origin,
  expectedRuntimeUrl,
  build: 'Astro production preview',
  results,
  decodes,
  staticChecks,
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
