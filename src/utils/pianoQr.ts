import qrcode from 'qrcode-generator';

export interface PianoQrModel {
  finderOrigins: Array<{ x: number; y: number }>;
  mark: { column: number; row: number; width: number; height: number; x: number; y: number };
  moduleCount: number;
  modules: Array<{ x: number; y: number }>;
  quietZone: number;
  viewBoxSize: number;
}

export type PianoQrSurface = 'website' | 'light-panel' | 'transparent';

export interface PianoQrRenderOptions {
  surface?: PianoQrSurface;
}

export interface PianoQrSvgOptions extends PianoQrRenderOptions {
  label?: string;
  padding?: number;
  quietZone?: number;
}

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const createPianoQrModel = (value: string): PianoQrModel => {
  const qr = qrcode(0, 'H');
  qr.addData(value);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const quietZone = 4;
  const markWidth = 9;
  const markHeight = 7;
  const markColumn = Math.floor((moduleCount - markWidth) / 2);
  const markRow = Math.floor((moduleCount - markHeight) / 2);
  const mark = {
    column: markColumn,
    row: markRow,
    width: markWidth,
    height: markHeight,
    x: quietZone + markColumn,
    y: quietZone + markRow,
  };

  const isFinderCell = (row: number, column: number) => (
    (row < 7 && column < 7)
    || (row < 7 && column >= moduleCount - 7)
    || (row >= moduleCount - 7 && column < 7)
  );
  const isPianoMarkCell = (row: number, column: number) => (
    row >= mark.row
    && row < mark.row + mark.height
    && column >= mark.column
    && column < mark.column + mark.width
  );

  const modules: Array<{ x: number; y: number }> = [];
  for (let row = 0; row < moduleCount; row += 1) {
    for (let column = 0; column < moduleCount; column += 1) {
      if (!qr.isDark(row, column) || isFinderCell(row, column) || isPianoMarkCell(row, column)) continue;
      modules.push({ x: column + quietZone, y: row + quietZone });
    }
  }

  return {
    finderOrigins: [
      { x: quietZone, y: quietZone },
      { x: quietZone + moduleCount - 7, y: quietZone },
      { x: quietZone, y: quietZone + moduleCount - 7 },
    ],
    mark,
    moduleCount,
    modules,
    quietZone,
    viewBoxSize: moduleCount + quietZone * 2,
  };
};

export const renderPianoQrContent = (
  model: PianoQrModel,
  label: string,
  value: string,
  options: PianoQrRenderOptions = {},
) => {
  const { finderOrigins, mark, moduleCount, modules, quietZone, viewBoxSize } = model;
  const surface = options.surface ?? 'website';
  const safeLabel = escapeXml(label);
  const safeValue = escapeXml(value);
  const depths = modules.map(({ x, y }) => `<rect x="${x + 0.21}" y="${y + 0.2}" width="0.68" height="0.78" rx="0.2" />`).join('');
  const keys = modules.map(({ x, y }) => `<rect x="${x + 0.13}" y="${y + 0.08}" width="0.74" height="0.82" rx="0.22" />`).join('');
  const finders = finderOrigins.map(({ x, y }) => `
    <g class="styled-qr-code__finder" transform="translate(${x} ${y})">
      <rect width="7" height="7" rx="1.35" fill="url(#links-qr-ink)" />
      <rect x="1" y="1" width="5" height="5" rx="0.9" fill="#fffdf8" />
      <rect x="2" y="2" width="3" height="3" rx="0.72" fill="#6f4d31" />
    </g>`).join('');

  return `
    <title id="links-qr-title">${safeLabel}</title>
    <desc id="links-qr-description">使用手機相機掃描，開啟 ${safeValue}</desc>
    <defs>
      <linearGradient id="links-qr-ink" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2d201d" />
        <stop offset="0.58" stop-color="#3f2d27" />
        <stop offset="1" stop-color="#5b402e" />
      </linearGradient>
      <linearGradient id="links-qr-key-depth" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#c89f69" />
        <stop offset="1" stop-color="#765136" />
      </linearGradient>
      <pattern id="links-qr-ivory-keys" width="2.35" height="8" patternUnits="userSpaceOnUse">
        <path d="M2.35 0V8" stroke="#b9905a" stroke-width="0.08" opacity="0.5" />
        <path d="M0 7.72H2.35" stroke="#8c633a" stroke-width="0.07" opacity="0.28" />
      </pattern>
    </defs>
    ${surface === 'transparent' ? '' : `<rect class="styled-qr-code__backing" width="${viewBoxSize}" height="${viewBoxSize}" rx="2.2" fill="#fffdf8" />`}
    ${surface === 'transparent' ? '' : `<rect class="styled-qr-code__ivory-field" x="${quietZone}" y="${quietZone}" width="${moduleCount}" height="${moduleCount}" rx="0.7" fill="url(#links-qr-ivory-keys)" />`}
    <g class="styled-qr-code__key-depths" fill="url(#links-qr-key-depth)">${depths}</g>
    <g class="styled-qr-code__dots styled-qr-code__piano-keys" fill="url(#links-qr-ink)">${keys}</g>
    <g class="styled-qr-code__finders">${finders}</g>
    <g class="styled-qr-code__piano-mark" aria-hidden="true">
      <rect x="${mark.x - 0.35}" y="${mark.y - 0.35}" width="${mark.width + 0.7}" height="${mark.height + 0.7}" rx="1.25" fill="#fffdf8" stroke="#c7a06e" stroke-width="0.16" />
      <rect x="${mark.x + 0.8}" y="${mark.y + 0.75}" width="7.4" height="4.8" rx="0.7" fill="url(#links-qr-ink)" />
      <path d="M${mark.x + 1.1} ${mark.y + 1.45} C${mark.x + 3.1} ${mark.y + 0.72}, ${mark.x + 5.9} ${mark.y + 0.82}, ${mark.x + 7.9} ${mark.y + 1.5}" fill="none" stroke="#c7a06e" stroke-width="0.24" stroke-linecap="round" />
      <rect x="${mark.x + 1.15}" y="${mark.y + 2.48}" width="6.7" height="1.72" rx="0.18" fill="#fffdf8" />
      <path d="M${mark.x + 2.1} ${mark.y + 2.5}v1.68 M${mark.x + 3.05} ${mark.y + 2.5}v1.68 M${mark.x + 4} ${mark.y + 2.5}v1.68 M${mark.x + 4.95} ${mark.y + 2.5}v1.68 M${mark.x + 5.9} ${mark.y + 2.5}v1.68 M${mark.x + 6.85} ${mark.y + 2.5}v1.68" stroke="#83634f" stroke-width="0.11" />
      <g fill="#3a2924">
        <rect x="${mark.x + 1.78}" y="${mark.y + 2.48}" width="0.42" height="0.95" rx="0.1" />
        <rect x="${mark.x + 2.73}" y="${mark.y + 2.48}" width="0.42" height="0.95" rx="0.1" />
        <rect x="${mark.x + 4.63}" y="${mark.y + 2.48}" width="0.42" height="0.95" rx="0.1" />
        <rect x="${mark.x + 5.58}" y="${mark.y + 2.48}" width="0.42" height="0.95" rx="0.1" />
        <rect x="${mark.x + 6.53}" y="${mark.y + 2.48}" width="0.42" height="0.95" rx="0.1" />
      </g>
      <path d="M${mark.x + 1.55} ${mark.y + 5.45}v0.72 M${mark.x + 7.45} ${mark.y + 5.45}v0.72 M${mark.x + 4.2} ${mark.y + 5.48}l0.3 0.48 0.3-0.48" fill="none" stroke="#6f4d31" stroke-width="0.32" stroke-linecap="round" stroke-linejoin="round" />
    </g>`;
};

export const renderPianoQrSvg = (value: string, options: PianoQrSvgOptions = {}) => {
  const model = createPianoQrModel(value);
  const surface = options.surface ?? 'transparent';
  const padding = Math.max(0, options.padding ?? 0);
  const quietZone = Math.min(12, Math.max(0, options.quietZone ?? model.quietZone));
  const origin = model.quietZone - quietZone - padding;
  const size = model.moduleCount + quietZone * 2 + padding * 2;
  const label = options.label ?? 'Piano QR Code';
  const content = renderPianoQrContent(model, label, value, { surface });
  const extendedBacking = surface === 'transparent'
    ? ''
    : `<rect class="styled-qr-code__extended-backing" x="${origin}" y="${origin}" width="${size}" height="${size}" rx="2.2" fill="#fffdf8" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${origin} ${origin} ${size} ${size}" role="img" aria-labelledby="links-qr-title links-qr-description">${extendedBacking}${content}</svg>`;
};

export const getRuntimePageUrl = (href: string) => {
  const url = new URL(href);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  url.hash = '';
  url.search = '';
  return url.href;
};

export const getDisplayUrl = (value: string) => {
  const url = new URL(value);
  return `${url.host}${url.pathname === '/' ? '' : url.pathname}`;
};
