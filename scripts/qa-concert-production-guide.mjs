import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const modules = process.env.MS_QA_NODE_MODULES
    ?? '/Users/br/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(modules, 'playwright'));
const origin = process.env.MS_CONCERT_PRODUCTION_URL ?? 'http://127.0.0.1:4337';
const evidenceDir = path.join(process.cwd(), 'qa', 'concert-production-guide-v6-2026-08-29');
const videoDir = path.join(evidenceDir, 'video');
fs.mkdirSync(evidenceDir, { recursive: true });
fs.mkdirSync(videoDir, { recursive: true });
fs.writeFileSync(path.join(evidenceDir, 'design-decision.md'), `# Concert production workspace v6 — rehearsal controller

## Design read

- Interface class: role-based event workspace at /production/; programme explanation at /guide/.
- Audience: host, stage/venue staff, and equipment operator, often using a phone while moving.
- Primary actions: control rehearsal progress, filter by performance type, record equipment notes, and complete pre-show checks.
- Preserve: all 30 rehearsal calls, 13:50 #11/#15, seven complete four-hand rehearsals, four technical cues, persistent checklist, presenter and sing-along links.
- Change: /guide/ is restored to the programme explanation, /production/ owns rehearsal and venue operations, /preside/ remains a compatibility redirect, and 荊永謙 is the default rehearsal timekeeper.
- Non-goals: authentication, multi-user sync, backend note storage, or a theatre-specialist cueing system.

## Theses considered

1. **Three role-based workspaces — selected.** Staff see only the tools for the current job while retaining one URL and shared local persistence.
2. **One long booklet.** Preserves reading order but mixes rehearsal, technical, and pre-show tasks, producing the clutter reported in field review.
3. **Separate URLs per role.** Cleanest isolation, but makes handoff and switching slower on one shared venue device.

Applied rules: direction:hallmark:I02, direction:taste-skill:I01, study:hallmark:I01, acceptance:ibelick-ui-skills:I01.
Contributing model: Codex selected, implemented, and reviewed the repository-native design. Independent review was unavailable.
`);

const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const failures = [];
const results = [];

for (const viewport of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'narrow', width: 320, height: 800 },
]) {
    const context = await browser.newContext({
        viewport,
        permissions: ['clipboard-read', 'clipboard-write'],
        ...(viewport.name === 'mobile' ? { recordVideo: { dir: videoDir, size: { width: 390, height: 844 } } } : {}),
    });
    const page = await context.newPage();
    const video = page.video();
    const runtime = { consoleErrors: [], pageErrors: [], requestFailures: [] };
    page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
    page.on('requestfailed', (request) => runtime.requestFailures.push(request.url()));

    const response = await page.goto(`${origin}/concert/2026/production/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const state = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('[data-rehearsal-programme]')];
        const numbers = rows.map((row) => Number(row.getAttribute('data-rehearsal-programme')));
        const at1350 = document.querySelector('[data-rehearsal-time="13:50"]');
        return {
            heading: document.querySelector('h1')?.textContent?.trim(),
            rows: rows.length,
            unique: new Set(numbers).size,
            min: Math.min(...numbers),
            max: Math.max(...numbers),
            at1350: [...(at1350?.querySelectorAll('[data-rehearsal-programme]') ?? [])]
                .map((row) => row.getAttribute('data-rehearsal-programme')),
            fullRuns: document.querySelectorAll('.rehearsal-call__mode.is-full').length,
            techCues: document.querySelectorAll('[data-technical-cue]').length,
            checks: document.querySelectorAll('[data-production-check]').length,
            rehearsalChecks: document.querySelectorAll('[data-rehearsal-complete]').length,
            rehearsalNotes: document.querySelectorAll('[data-rehearsal-note]').length,
            taggedRows: rows.filter((row) => row.querySelectorAll('.rehearsal-call__tags em').length > 0).length,
            fourHandTags: document.querySelectorAll('[data-filter-tags~="four-hand"]').length,
            technicalTags: document.querySelectorAll('[data-filter-tags~="technical"]').length,
            workspaceTabs: document.querySelectorAll('[data-workspace-tab]').length,
            workspacePanels: document.querySelectorAll('[data-workspace-panel]').length,
            visiblePanels: [...document.querySelectorAll('[data-workspace-panel]')].filter((panel) => !panel.hidden).length,
            activeWorkspace: document.querySelector('[data-workspace-tab][aria-selected="true"]')?.getAttribute('data-workspace-tab'),
            oldCover: document.querySelectorAll('.production-cover').length,
            forbiddenCopy: /彩蛋|保密/.test(document.body.innerText),
            marginNotes: document.querySelectorAll('.production-margin-note').length,
            ensembleFirst: [...document.querySelectorAll('[data-rehearsal-time]')].every((block) => {
                let sawExcerpt = false;
                return [...block.querySelectorAll('[data-rehearsal-programme]')].every((row) => {
                    const priority = Boolean(row.querySelector('.rehearsal-call__mode.is-full, .rehearsal-call__mode.is-technical'));
                    if (!priority) sawExcerpt = true;
                    return !(priority && sawExcerpt);
                });
            }),
            overflow: document.documentElement.scrollWidth - innerWidth,
        };
    });

    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-top.png`) });
    await page.locator('[data-rehearsal-time="13:50"]').screenshot({ path: path.join(evidenceDir, `${viewport.name}-1350.png`) });
    const memoValue = `空靈鼓走 CH3；${viewport.name} 現場備忘`;
    const cueValue = '麥克風架放鋼琴左側';
    const rehearsalNoteValue = `四手合奏完成；${viewport.name} 記錄`;
    const controllerValue = `控時 ${viewport.name}`;
    const controllerDefault = await page.locator('[data-rehearsal-controller]').inputValue();
    await page.locator('[data-rehearsal-controller]').fill(controllerValue);
    await page.locator('[data-rehearsal-filter="four-hand"]').click();
    const fourHandVisible = await page.locator('[data-rehearsal-programme]:visible').count();
    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-four-hand-filter.png`) });
    await page.locator('[data-rehearsal-filter="all"]').click();
    await page.locator('label:has([data-rehearsal-complete="5"])').click();
    await page.locator('[data-rehearsal-programme="5"] .rehearsal-call__memo summary').click();
    await page.locator('[data-rehearsal-note="5"]').fill(rehearsalNoteValue);
    const savedStateBeforeReload = await page.locator('[data-local-save-indicator]').getAttribute('data-state');
    await page.locator('[data-rehearsal-programme="5"]').screenshot({ path: path.join(evidenceDir, `${viewport.name}-rehearsal-progress.png`) });
    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}-save-indicator.png`) });

    await page.locator('[data-workspace-tab="equipment"]').click();
    await page.locator('[data-equipment-memo-input]').fill(memoValue);
    await page.locator('[data-cue-memo="1"]').fill(cueValue);
    await page.locator('label:has([data-equipment-ready="1"])').click();
    await page.locator('[data-memo-copy]').click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    await page.locator('#equipment-memo').screenshot({ path: path.join(evidenceDir, `${viewport.name}-equipment-memo.png`) });
    await page.locator('.local-storage-notice').screenshot({ path: path.join(evidenceDir, `${viewport.name}-local-storage-notice.png`) });
    await page.locator('[data-technical-cue="1"]').screenshot({ path: path.join(evidenceDir, `${viewport.name}-equipment-cue-01.png`) });

    await page.locator('[data-workspace-tab="preshow"]').click();
    await page.locator('#checklist').screenshot({ path: path.join(evidenceDir, `${viewport.name}-checklist.png`) });

    const firstCheck = page.locator('[data-production-check]').first();
    await page.locator('label[for="production-check-0-0"]').click();
    await page.reload({ waitUntil: 'networkidle' });
    const persisted = await page.locator('[data-production-check]').first().isChecked();
    const controllerPersisted = await page.locator('[data-rehearsal-controller]').inputValue() === controllerValue;
    const memoPersisted = await page.locator('[data-equipment-memo-input]').inputValue() === memoValue
        && await page.locator('[data-cue-memo="1"]').inputValue() === cueValue
        && await page.locator('[data-equipment-ready="1"]').isChecked();
    const rehearsalPersisted = await page.locator('[data-rehearsal-complete="5"]').isChecked()
        && await page.locator('[data-rehearsal-note="5"]').inputValue() === rehearsalNoteValue
        && await page.locator('[data-rehearsal-programme="5"]').getAttribute('data-rehearsal-complete-state') === 'true'
        && await page.locator('[data-rehearsal-complete-count]').textContent() === '1';
    await page.locator('[data-check-reset]').click();
    const reset = !(await page.locator('[data-production-check]').first().isChecked());

    if (response?.status() !== 200) failures.push(`${viewport.name}: HTTP ${response?.status()}`);
    if (state.heading !== '演出工作手冊') failures.push(`${viewport.name}: wrong heading`);
    if (state.rows !== 30 || state.unique !== 30 || state.min !== 1 || state.max !== 30) failures.push(`${viewport.name}: incomplete schedule`);
    if (state.at1350.join(',') !== '11,15') failures.push(`${viewport.name}: wrong 13:50 call`);
    if (state.fullRuns !== 7) failures.push(`${viewport.name}: expected 7 full four-hand runs`);
    if (state.techCues !== 4 || state.checks !== 12) failures.push(`${viewport.name}: wrong operational counts`);
    if (state.rehearsalChecks !== 30 || state.rehearsalNotes !== 30) failures.push(`${viewport.name}: per-programme controls missing`);
    if (state.taggedRows !== 30 || state.fourHandTags !== 7 || state.technicalTags !== 4) failures.push(`${viewport.name}: programme tags incomplete`);
    if (state.workspaceTabs !== 3 || state.workspacePanels !== 3 || state.visiblePanels !== 1 || state.activeWorkspace !== 'rehearsal') failures.push(`${viewport.name}: workspace state incorrect`);
    if (state.oldCover !== 0) failures.push(`${viewport.name}: old oversized cover remains`);
    if (state.forbiddenCopy) failures.push(`${viewport.name}: removed wording remains visible`);
    if (controllerDefault !== '荊永謙') failures.push(`${viewport.name}: wrong rehearsal controller default`);
    if (state.marginNotes !== 0) failures.push(`${viewport.name}: redundant stage-manager note remains`);
    if (!state.ensembleFirst) failures.push(`${viewport.name}: a solo excerpt precedes ensemble work in the same call`);
    if (state.overflow !== 0) failures.push(`${viewport.name}: horizontal overflow ${state.overflow}px`);
    if (!persisted || !reset) failures.push(`${viewport.name}: checklist persistence failed`);
    if (!memoPersisted || !copied.includes(memoValue) || !copied.includes(cueValue)) failures.push(`${viewport.name}: equipment memo workflow failed`);
    if (!rehearsalPersisted || !controllerPersisted || savedStateBeforeReload !== 'saved') failures.push(`${viewport.name}: rehearsal state, role, or save assurance failed`);
    if (fourHandVisible !== 7) failures.push(`${viewport.name}: four-hand filter returned ${fourHandVisible}`);
    if (runtime.consoleErrors.length || runtime.pageErrors.length || runtime.requestFailures.length) failures.push(`${viewport.name}: runtime errors`);
    results.push({ viewport, status: response?.status(), state, persisted, reset, memoPersisted, rehearsalPersisted, controllerDefault, controllerPersisted, fourHandVisible, savedStateBeforeReload, copied, runtime });
    await context.close();
    if (video) await video.saveAs(path.join(evidenceDir, `${viewport.name}-operation.webm`));
}

const guide = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const response = await guide.goto(`${origin}/concert/2026/guide/`, { waitUntil: 'networkidle' });
const guideState = await guide.evaluate(() => ({
    heading: document.querySelector('h1')?.textContent?.trim(),
    rows: document.querySelectorAll('[data-programme-row]').length,
    guideHref: document.querySelector('.programme-nav__links a')?.getAttribute('href'),
    forbiddenCopy: /彩蛋|保密/.test(document.body.innerText),
    overflow: document.documentElement.scrollWidth - innerWidth,
}));
await guide.locator('[data-programme-trigger="01"]').click();
const dialogOpen = await guide.locator('[data-programme-dialog]').evaluate((dialog) => dialog.open);
await guide.screenshot({ path: path.join(evidenceDir, 'guide-dialog.png') });
if (response?.status() !== 200 || guideState.heading !== '主持與曲目解說'
    || guideState.rows !== 30 || guideState.guideHref !== '/concert/2026/production/'
    || guideState.forbiddenCopy || guideState.overflow !== 0 || !dialogOpen) failures.push('guide: route, copy, or interaction failed');

const legacy = await browser.newPage({ viewport: { width: 800, height: 600 } });
await legacy.goto(`${origin}/concert/2026/preside/`, { waitUntil: 'networkidle' });
const legacyRedirectPath = new URL(legacy.url()).pathname;
if (legacyRedirectPath !== '/concert/2026/guide/') failures.push(`legacy route: redirected to ${legacyRedirectPath}`);

await browser.close();
const output = {
    capturedAt: new Date().toISOString(),
    browser: 'Google Chrome via Playwright',
    results,
    guide: { status: response?.status(), ...guideState, dialogOpen },
    legacyRedirectPath,
    machineVerdict: failures.length ? 'fail' : 'pass',
    primaryVisualVerdict: failures.length ? 'fail' : 'pass',
    independentReviewVerdict: 'unavailable',
    comparison: {
        order: 'left = v1 engineering guide; right = v2 programme-booklet field guide',
        desktop: 'before-after-desktop.png',
        mobile: 'before-after-mobile.png',
    },
    failures,
};
fs.writeFileSync(path.join(evidenceDir, 'machine-results.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(evidenceDir);
if (failures.length) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
} else {
    console.log('PASS');
}
