import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const runtimeModules = process.env.MS_QA_NODE_MODULES
  ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtimeModules, 'playwright'));
const sharp = require('sharp');

const root = process.cwd();
const origin = process.env.MS_QR_STUDIO_URL ?? 'http://127.0.0.1:4324';
const evidenceDir = path.join(root, 'qa', 'piano-qr-studio-v1-2026-08-28');
const expectedUrl = 'https://ms.linho.me/links/';
fs.mkdirSync(evidenceDir, { recursive: true });

fs.writeFileSync(path.join(evidenceDir, 'design-decision.md'), `# Piano QR Studio design decision

## Three theses considered

1. **Single-purpose workbench — selected.** One continuous surface keeps URL, export mode, background proofing, and downloads visible together. It is fastest for repeat internal use and makes transparency visually verifiable.
2. **Side-by-side specimen board.** Simultaneous light and dark previews improve comparison, but make the actual QR too small on laptops and mobile.
3. **Step-by-step wizard.** URL → appearance → export is approachable for a first use, but adds unnecessary navigation to a tool with only four decisions.

## Hard gates

- The default export is truly transparent and exposes alpha pixels.
- Transparent output decodes after placement on a light background.
- Stable-panel output retains an opaque four-module quiet zone.
- Preview, payload label, PNG, and SVG all update from the entered URL.
- Dark-background preview warns about transparent-mode contrast risk.
- Desktop and mobile layouts have no horizontal overflow or clipped controls.
- The Studio is a local Vite entry and is absent from the public Astro route tree.
`);

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const results = [];
for (const viewport of [
  { name: 'desktop', width: 1440, height: 1100 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    acceptDownloads: true,
    ...(viewport.name === 'desktop' ? { recordVideo: { dir: evidenceDir, size: { width: 1280, height: 978 } } } : {}),
  });
  const page = await context.newPage();
  const operationVideo = page.video();
  const transcript = [];
  const record = (action, state = {}) => transcript.push({ at: new Date().toISOString(), action, state });
  const runtime = { consoleErrors: [], pageErrors: [], requestFailures: [] };
  page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
  page.on('requestfailed', (request) => runtime.requestFailures.push(`${request.method()} ${request.url()}`));

  const response = await page.goto(origin, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  record('studio-loaded', { url: page.url(), viewport });
  const screenshot = path.join(evidenceDir, `${viewport.name}-default.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  const state = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    url: (document.querySelector('#qr-url'))?.value,
    previewSurface: document.querySelector('.studio-preview')?.getAttribute('data-preview-surface'),
    hasBacking: Boolean(document.querySelector('[data-qr-preview] .styled-qr-code__backing')),
    hasIvoryField: Boolean(document.querySelector('[data-qr-preview] .styled-qr-code__ivory-field')),
    finderCount: document.querySelectorAll('[data-qr-preview] .styled-qr-code__finder').length,
    title: document.querySelector('[data-qr-preview] title')?.textContent,
    warningHidden: document.querySelector('[data-contrast-warning]')?.hidden,
    controls: [...document.querySelectorAll('button, input:not([type="radio"]):not([type="range"]), select, .studio-segments label span, .studio-range output')].map((element) => {
      const rect = element.getBoundingClientRect();
      return { name: element.textContent?.trim() || element.getAttribute('name') || element.id, width: rect.width, height: rect.height };
    }),
  }));

  await page.getByText('深色', { exact: true }).click();
  const warningVisible = await page.locator('[data-contrast-warning]').isVisible();
  record('preview-background-dark', { warningVisible });
  await page.getByText('棋盤格', { exact: true }).click();

  await page.locator('#qr-url').fill('https://example.com/program/?edition=2026#evening');
  await page.locator('[data-apply-url]').click();
  const customUrlState = await page.evaluate(() => ({
    value: document.querySelector('#qr-url')?.value,
    title: document.querySelector('[data-qr-preview] title')?.textContent,
    display: document.querySelector('[data-preview-domain]')?.textContent,
  }));
  record('custom-url-applied', customUrlState);
  await page.locator('button[data-url="https://ms.linho.me/links/"]').click();

  await page.getByText('穩定底板', { exact: true }).click();
  const lightPanelState = await page.evaluate(() => ({
    hasBacking: Boolean(document.querySelector('[data-qr-preview] .styled-qr-code__backing')),
    hasIvoryField: Boolean(document.querySelector('[data-qr-preview] .styled-qr-code__ivory-field')),
    viewBox: document.querySelector('[data-qr-preview] svg')?.getAttribute('viewBox'),
  }));
  record('stable-panel-previewed', lightPanelState);
  await page.getByText('完全透明', { exact: true }).click();

  await page.locator('#quiet-zone').evaluate((element) => {
    const input = element;
    input.value = '0';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const croppedState = await page.evaluate(() => ({
    value: document.querySelector('[data-quiet-zone-value]')?.textContent,
    note: document.querySelector('[data-quiet-zone-note]')?.textContent,
    caution: document.querySelector('[data-quiet-zone-note]')?.getAttribute('data-caution'),
    viewBox: document.querySelector('[data-qr-preview] svg')?.getAttribute('viewBox'),
  }));
  record('quiet-zone-set-to-zero', croppedState);
  const croppedScreenshot = path.join(evidenceDir, `${viewport.name}-zero-quiet-zone.png`);
  await page.screenshot({ path: croppedScreenshot, fullPage: true });

  if (viewport.name === 'desktop') {
    const pngDownloadPromise = page.waitForEvent('download');
    await page.locator('[data-export-png]').click();
    const pngDownload = await pngDownloadPromise;
    await pngDownload.saveAs(path.join(evidenceDir, pngDownload.suggestedFilename()));
    record('transparent-png-exported', { filename: pngDownload.suggestedFilename() });

    const svgDownloadPromise = page.waitForEvent('download');
    await page.locator('[data-export-svg]').click();
    const svgDownload = await svgDownloadPromise;
    await svgDownload.saveAs(path.join(evidenceDir, svgDownload.suggestedFilename()));
    record('transparent-svg-exported', { filename: svgDownload.suggestedFilename() });
  }

  await context.close();
  const videoPath = viewport.name === 'desktop' ? path.join(evidenceDir, 'desktop-operation-journey.webm') : null;
  if (videoPath && operationVideo) await operationVideo.saveAs(videoPath);
  results.push({ viewport, status: response?.status() ?? null, runtime, screenshot, croppedScreenshot, videoPath, transcript, state, warningVisible, customUrlState, lightPanelState, croppedState });
}
await browser.close();

const pngPath = path.join(evidenceDir, 'ms.linho.me-links-piano-qr-qz0-transparent.png');
const svgPath = path.join(evidenceDir, 'ms.linho.me-links-piano-qr-qz0-transparent.svg');
const flattenedPath = path.join(evidenceDir, 'transparent-on-white-decode-proof.png');
const metadata = await sharp(pngPath).metadata();
const stats = await sharp(pngPath).stats();
const { data: rawPng, info: rawInfo } = await sharp(pngPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const alphaBounds = { minX: rawInfo.width, minY: rawInfo.height, maxX: -1, maxY: -1 };
for (let y = 0; y < rawInfo.height; y += 1) {
  for (let x = 0; x < rawInfo.width; x += 1) {
    if (rawPng[(y * rawInfo.width + x) * rawInfo.channels + 3] === 0) continue;
    alphaBounds.minX = Math.min(alphaBounds.minX, x);
    alphaBounds.minY = Math.min(alphaBounds.minY, y);
    alphaBounds.maxX = Math.max(alphaBounds.maxX, x);
    alphaBounds.maxY = Math.max(alphaBounds.maxY, y);
  }
}
await sharp(pngPath).flatten({ background: '#ffffff' }).png().toFile(flattenedPath);
const svg = fs.readFileSync(svgPath, 'utf8');
const decodeProcess = spawnSync('swift', [path.join(root, 'scripts', 'decode-qr.swift'), flattenedPath], {
  encoding: 'utf8',
  timeout: 30000,
});
let decodes = [];
try { decodes = JSON.parse(decodeProcess.stdout || '[]'); } catch { decodes = []; }

const failures = [];
for (const result of results) {
  if (result.status !== 200) failures.push(`${result.viewport.name}: HTTP ${result.status}`);
  if (result.runtime.consoleErrors.length || result.runtime.pageErrors.length || result.runtime.requestFailures.length) failures.push(`${result.viewport.name}: runtime error`);
  if (result.state.overflow > 0) failures.push(`${result.viewport.name}: horizontal overflow`);
  if (result.state.url !== expectedUrl || result.state.previewSurface !== 'transparent') failures.push(`${result.viewport.name}: initial state mismatch`);
  if (result.state.hasBacking || result.state.hasIvoryField || result.state.finderCount !== 3) failures.push(`${result.viewport.name}: transparent SVG structure mismatch`);
  if (!result.state.title?.includes(expectedUrl)) failures.push(`${result.viewport.name}: payload title mismatch`);
  if (!result.warningVisible) failures.push(`${result.viewport.name}: dark-background warning missing`);
  if (result.customUrlState.value !== 'https://example.com/program/?edition=2026' || !result.customUrlState.title?.includes('https://example.com/program/?edition=2026') || result.customUrlState.display !== 'example.com/program/') failures.push(`${result.viewport.name}: custom URL did not update the preview consistently`);
  if (!result.lightPanelState.hasBacking || !result.lightPanelState.hasIvoryField || result.lightPanelState.viewBox?.startsWith('-')) failures.push(`${result.viewport.name}: stable-panel structure mismatch`);
  if (result.croppedState.value !== '0 modules' || result.croppedState.caution !== 'true' || !result.croppedState.note?.includes('Canva') || !result.croppedState.viewBox?.startsWith('4 4 ')) failures.push(`${result.viewport.name}: zero-margin crop did not update preview and guidance`);
  if (result.state.controls.some((control) => control.width < 36 || control.height < 36)) failures.push(`${result.viewport.name}: undersized interactive target`);
}
if (!metadata.hasAlpha || stats.channels.length < 4 || stats.channels[3].min !== 0 || stats.channels[3].max !== 255) failures.push('PNG does not contain both transparent and opaque pixels');
if (alphaBounds.minX > 2 || alphaBounds.minY > 2 || alphaBounds.maxX < metadata.width - 3 || alphaBounds.maxY < metadata.height - 3) failures.push('zero-margin PNG still contains a fixed transparent outer ring');
if (svg.includes('styled-qr-code__backing') || svg.includes('styled-qr-code__ivory-field')) failures.push('transparent SVG contains a background field');
if (decodeProcess.status !== 0 || decodes.length !== 1 || !decodes[0]?.payloads?.includes(expectedUrl)) failures.push('transparent PNG did not decode after placement on white');

const output = {
  capturedAt: new Date().toISOString(),
  origin,
  results,
  exportProof: { pngPath, svgPath, metadata, alpha: stats.channels[3], alphaBounds, flattenedPath, decodes },
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
