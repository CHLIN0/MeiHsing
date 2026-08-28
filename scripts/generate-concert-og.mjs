import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Renderer } from '@takumi-rs/core';
import { fromHtml } from 'takumi-js/helpers/html';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(projectRoot, 'public/concert/2026/og-2026-concert.jpg');
const backgroundPath = path.join(projectRoot, 'public/concert/2026/stage-sakura-poster-4k.webp');
const fontRoot = path.join(projectRoot, 'node_modules/@fontsource-variable/noto-serif-tc');

const content = {
  eyebrow: '2026  TEACHER–STUDENT CONCERT',
  title: '大手牽小手',
  themeLine: '音為愛聚一堂',
  concert: '林美杏老師師生音樂會',
  details: '2026.08.29  14:30　｜　禾森音樂藝文空間',
};

const parseRange = (value) => value
  .replace(/^U\+/i, '')
  .split('-')
  .map((part) => Number.parseInt(part, 16));

const rangeContains = (rangeList, codepoint) => rangeList.split(',').some((range) => {
  const [start, end = start] = parseRange(range.trim());
  return codepoint >= start && codepoint <= end;
});

const registerConcertFont = async (renderer) => {
  const unicodeRanges = JSON.parse(await readFile(path.join(fontRoot, 'unicode.json'), 'utf8'));
  const codepoints = new Set([...Object.values(content).join('')].map((character) => character.codePointAt(0)));
  const subsets = Object.entries(unicodeRanges).filter(([, ranges]) =>
    [...codepoints].some((codepoint) => rangeContains(ranges, codepoint)),
  );

  for (const [rank, [subset, ranges]] of subsets.entries()) {
    const id = subset.startsWith('[') ? subset.slice(1, -1) : subset;
    const data = await readFile(path.join(fontRoot, `files/noto-serif-tc-${id}-wght-normal.woff2`));
    await renderer.registerFont({
      name: `Concert Serif ${id}`,
      data,
      subsetOf: 'Concert Serif',
      subsetRank: rank,
    });

    if (![...codepoints].some((codepoint) => rangeContains(ranges, codepoint))) {
      throw new Error(`Registered font subset ${subset} does not cover any concert text.`);
    }
  }
};

const html = `
  <div class="card" lang="zh-Hant">
    <img class="background" src="concert-background" />
    <div class="veil"></div>
    <div class="copy">
      <div class="eyebrow">${content.eyebrow}</div>
      <div class="rule"></div>
      <div class="concert">${content.concert}</div>
      <div class="title">${content.title}</div>
      <div class="theme-line">${content.themeLine}</div>
      <div class="details">${content.details}</div>
    </div>
    <div class="corner-mark">音</div>
  </div>
  <style>
    * { box-sizing: border-box; }
    .card {
      position: relative;
      width: 1200px;
      height: 630px;
      overflow: hidden;
      color: #43332f;
      background: #f4eadc;
      font-family: "Concert Serif";
    }
    .background {
      position: absolute;
      inset: 0;
      width: 1200px;
      height: 630px;
      object-fit: cover;
      object-position: center;
    }
    .veil {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(250, 244, 234, 0.97) 0%, rgba(250, 244, 234, 0.87) 38%, rgba(250, 244, 234, 0.20) 66%, rgba(250, 244, 234, 0) 82%);
    }
    .copy {
      position: absolute;
      left: 62px;
      top: 54px;
      width: 660px;
      height: 522px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .eyebrow {
      color: #8b5f45;
      font-size: 19px;
      font-weight: 500;
      letter-spacing: 4.4px;
      line-height: 1.2;
    }
    .rule {
      width: 76px;
      height: 2px;
      margin-top: 23px;
      margin-bottom: 27px;
      background: #b9855f;
    }
    .concert {
      font-size: 33px;
      font-weight: 600;
      letter-spacing: 4px;
      line-height: 1.25;
    }
    .title {
      margin-top: 33px;
      font-size: 88px;
      font-weight: 600;
      letter-spacing: 8px;
      line-height: 1.05;
    }
    .theme-line {
      margin-top: 4px;
      font-size: 45px;
      font-weight: 400;
      letter-spacing: 9px;
      line-height: 1.3;
    }
    .details {
      margin-top: auto;
      padding-left: 17px;
      border-left: 2px solid #b9855f;
      color: #5e4942;
      font-size: 22px;
      font-weight: 500;
      letter-spacing: 1.2px;
      line-height: 1.4;
    }
    .corner-mark {
      position: absolute;
      right: 42px;
      top: 38px;
      width: 46px;
      height: 46px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(88, 58, 45, 0.48);
      border-radius: 50%;
      color: rgba(67, 51, 47, 0.74);
      background: rgba(252, 247, 239, 0.42);
      font-size: 21px;
      font-weight: 500;
    }
  </style>
`;

const renderer = new Renderer({ cacheMaxBytes: 32 * 1024 * 1024 });
await registerConcertFont(renderer);

const [{ node, stylesheets }, background] = await Promise.all([
  Promise.resolve(fromHtml(html)),
  readFile(backgroundPath),
]);

const image = await renderer.render(node, {
  width: 1200,
  height: 630,
  format: 'jpeg',
  quality: 94,
  images: [{ src: 'concert-background', data: background }],
  stylesheets,
  fontFamilies: ['Concert Serif'],
  lang: 'zh-Hant',
});

await writeFile(outputPath, image);
process.stdout.write(`${outputPath}\n`);
