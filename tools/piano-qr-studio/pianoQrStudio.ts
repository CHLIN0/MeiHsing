import { renderPianoQrSvg, type PianoQrSurface } from '../../src/utils/pianoQr';

interface PianoQrStudioOptions {
  initialUrl: string;
}

type PreviewSurface = 'paper' | 'transparent' | 'dark';

const surfaces: Array<{ value: PianoQrSurface; label: string; note: string }> = [
  {
    value: 'transparent',
    label: '完全透明',
    note: '只有圖形本身；適合放在白色或很淺的純色背景。',
  },
  {
    value: 'light-panel',
    label: '穩定底板',
    note: '保留完整淺色留白區，跨平台與印刷時最穩定。',
  },
  {
    value: 'website',
    label: '網站原版',
    note: '與目前 Links 頁面使用相同的視覺版本。',
  },
];

const previewSurfaces: Array<{ value: PreviewSurface; label: string }> = [
  { value: 'paper', label: '淺色' },
  { value: 'transparent', label: '棋盤格' },
  { value: 'dark', label: '深色' },
];

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const normalizeUrl = (rawValue: string) => {
  const url = new URL(rawValue.trim());
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('只支援 http 或 https 網址。');
  url.hash = '';
  return url.href;
};

const filenameFor = (value: string, surface: PianoQrSurface, quietZone: number, extension: 'png' | 'svg') => {
  const url = new URL(value);
  const path = url.pathname === '/' ? '' : url.pathname.replace(/^\/+|\/+$/g, '').replaceAll('/', '-');
  const subject = [url.hostname, path].filter(Boolean).join('-');
  return `${subject}-piano-qr-qz${quietZone}-${surface}.${extension}`;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
};

const exportPng = async (svgMarkup: string, size: number, filename: string) => {
  const source = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const sourceUrl = URL.createObjectURL(source);
  const image = new Image();
  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('無法建立 PNG。'));
  });
  image.src = sourceUrl;
  await loaded;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('瀏覽器不支援 Canvas 匯出。');
  context.clearRect(0, 0, size, size);
  context.drawImage(image, 0, 0, size, size);
  URL.revokeObjectURL(sourceUrl);

  const png = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG 轉換失敗。')), 'image/png');
  });
  downloadBlob(png, filename);
};

export const mountPianoQrStudio = (root: HTMLElement, options: PianoQrStudioOptions) => {
  root.innerHTML = `
    <main class="studio-shell">
      <header class="studio-header">
        <a class="studio-brand" href="https://ms.linho.me/" target="_blank" rel="noreferrer">
          <span class="studio-brand__mark">M</span>
          <span><strong>MEI-HSING LIN</strong><small>Internal design utility</small></span>
        </a>
        <div class="studio-header__meta"><span aria-hidden="true"></span> 僅在本機執行</div>
      </header>

      <section class="studio-intro">
        <p>PIANO QR STUDIO · 01</p>
        <h1>讓網址，成為一枚<br><em>可以帶走的琴聲。</em></h1>
        <div class="studio-intro__note">輸入目的地、確認實際背景，再匯出適合網站或印刷的版本。所有處理都留在瀏覽器裡。</div>
      </section>

      <section class="studio-workbench" aria-label="QR Code 編輯工作台">
        <form class="studio-controls" novalidate>
          <div class="studio-control studio-control--url">
            <label for="qr-url"><span>01</span> 目的網址</label>
            <div class="studio-url-field">
              <input id="qr-url" name="url" type="url" spellcheck="false" autocomplete="url" value="${escapeHtml(options.initialUrl)}" />
              <button type="button" data-apply-url>套用</button>
            </div>
            <div class="studio-presets" aria-label="常用網址">
              <button type="button" data-url="https://ms.linho.me/links/">所有連結</button>
              <button type="button" data-url="https://ms.linho.me/concert/2026/">2026 音樂會</button>
            </div>
            <p class="studio-error" data-url-error role="alert"></p>
          </div>

          <fieldset class="studio-control">
            <legend><span>02</span> 匯出樣式</legend>
            <div class="studio-segments studio-segments--surface">
              ${surfaces.map(({ value, label }) => `<label><input type="radio" name="surface" value="${value}" ${value === 'transparent' ? 'checked' : ''}><span>${label}</span></label>`).join('')}
            </div>
            <p class="studio-hint" data-surface-note>${surfaces[0].note}</p>
          </fieldset>

          <fieldset class="studio-control">
            <legend><span>03</span> 預覽底色</legend>
            <div class="studio-segments">
              ${previewSurfaces.map(({ value, label }) => `<label><input type="radio" name="preview" value="${value}" ${value === 'transparent' ? 'checked' : ''}><span>${label}</span></label>`).join('')}
            </div>
            <p class="studio-warning" data-contrast-warning hidden><span>!</span> 完全透明版本在深色或花紋背景上可能無法掃描。</p>
          </fieldset>

          <fieldset class="studio-control studio-control--quiet-zone">
            <legend><span>04</span> 外圍留白</legend>
            <div class="studio-range">
              <input id="quiet-zone" name="quietZone" type="range" min="0" max="8" step="1" value="4" aria-describedby="quiet-zone-note">
              <output for="quiet-zone" data-quiet-zone-value>4 modules</output>
            </div>
            <div class="studio-range__labels" aria-hidden="true"><span>貼齊 0</span><span>標準 4</span><span>寬鬆 8</span></div>
            <p class="studio-hint" id="quiet-zone-note" data-quiet-zone-note>標準掃碼留白；可直接使用，不必另外補邊界。</p>
          </fieldset>

          <div class="studio-control studio-control--export">
            <label for="png-size"><span>05</span> 匯出尺寸</label>
            <select id="png-size" name="size">
              <option value="1024">1024 × 1024 px</option>
              <option value="2048" selected>2048 × 2048 px</option>
              <option value="4096">4096 × 4096 px</option>
            </select>
            <div class="studio-actions">
              <button class="studio-action studio-action--primary" type="button" data-export-png>匯出 PNG</button>
              <button class="studio-action" type="button" data-export-svg>匯出 SVG</button>
            </div>
            <p class="studio-status" data-export-status aria-live="polite"></p>
          </div>
        </form>

        <div class="studio-preview" data-preview-surface="transparent">
          <div class="studio-preview__topline"><span>LIVE PREVIEW</span><span data-payload-label></span></div>
          <div class="studio-preview__stage">
            <span class="studio-preview__canvas-label">虛線框內為匯出範圍</span>
            <div class="studio-preview__qr" data-qr-preview></div>
          </div>
          <div class="studio-preview__caption">
            <span>PIANO EDITION</span>
            <strong data-preview-domain></strong>
            <small>把相機對準圖形，即可開啟網址</small>
          </div>
        </div>
      </section>

      <footer><span>Designed for 林美杏音樂教室</span><span>SVG · PNG · LOCAL ONLY</span></footer>
    </main>`;

  const form = root.querySelector<HTMLFormElement>('form');
  const urlInput = root.querySelector<HTMLInputElement>('#qr-url');
  const preview = root.querySelector<HTMLElement>('[data-qr-preview]');
  const previewPanel = root.querySelector<HTMLElement>('.studio-preview');
  const surfaceNote = root.querySelector<HTMLElement>('[data-surface-note]');
  const contrastWarning = root.querySelector<HTMLElement>('[data-contrast-warning]');
  const payloadLabel = root.querySelector<HTMLElement>('[data-payload-label]');
  const domainLabel = root.querySelector<HTMLElement>('[data-preview-domain]');
  const error = root.querySelector<HTMLElement>('[data-url-error]');
  const status = root.querySelector<HTMLElement>('[data-export-status]');
  const quietZoneInput = root.querySelector<HTMLInputElement>('#quiet-zone');
  const quietZoneValue = root.querySelector<HTMLOutputElement>('[data-quiet-zone-value]');
  const quietZoneNote = root.querySelector<HTMLElement>('[data-quiet-zone-note]');
  let activeUrl = normalizeUrl(options.initialUrl);

  const selectedSurface = () => form?.elements.namedItem('surface') instanceof RadioNodeList
    ? form.elements.namedItem('surface').value as PianoQrSurface
    : 'transparent';
  const selectedPreview = () => form?.elements.namedItem('preview') instanceof RadioNodeList
    ? form.elements.namedItem('preview').value as PreviewSurface
    : 'transparent';
  const selectedQuietZone = () => Math.min(8, Math.max(0, Number(quietZoneInput?.value ?? 4)));
  const svgMarkup = () => renderPianoQrSvg(activeUrl, {
    surface: selectedSurface(),
    quietZone: selectedQuietZone(),
    label: `QR Code：${activeUrl}`,
  });

  const render = () => {
    const surface = selectedSurface();
    const background = selectedPreview();
    if (preview) preview.innerHTML = svgMarkup();
    if (previewPanel) previewPanel.dataset.previewSurface = background;
    if (surfaceNote) surfaceNote.textContent = surfaces.find((item) => item.value === surface)?.note ?? '';
    if (contrastWarning) contrastWarning.hidden = !(surface === 'transparent' && background === 'dark');
    const quietZone = selectedQuietZone();
    if (quietZoneValue) quietZoneValue.textContent = `${quietZone} module${quietZone === 1 ? '' : 's'}`;
    if (quietZoneNote) {
      quietZoneNote.textContent = quietZone === 0
        ? '貼齊圖形裁切；放進 Canva 後，請自行在四周保留淺色空間。'
        : quietZone < 4
          ? '精簡留白；適合版面配置，但掃描穩定度取決於周圍背景。'
          : quietZone === 4
            ? '標準掃碼留白；可直接使用，不必另外補邊界。'
            : '比標準更寬鬆，適合複雜版面或較遠距離掃描。';
      quietZoneNote.dataset.caution = quietZone < 4 ? 'true' : 'false';
    }
    const parsed = new URL(activeUrl);
    if (payloadLabel) payloadLabel.textContent = `${activeUrl.length} CHAR`;
    if (domainLabel) domainLabel.textContent = `${parsed.host}${parsed.pathname === '/' ? '' : parsed.pathname}`;
    if (status) status.textContent = '';
  };

  const applyUrl = (value = urlInput?.value ?? '') => {
    try {
      activeUrl = normalizeUrl(value);
      if (urlInput) urlInput.value = activeUrl;
      if (error) error.textContent = '';
      render();
    } catch {
      if (error) error.textContent = '請輸入完整網址，例如 https://ms.linho.me/links/';
    }
  };

  root.querySelector('[data-apply-url]')?.addEventListener('click', () => applyUrl());
  urlInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyUrl();
    }
  });
  root.querySelectorAll<HTMLButtonElement>('[data-url]').forEach((button) => button.addEventListener('click', () => {
    if (urlInput) urlInput.value = button.dataset.url ?? '';
    applyUrl();
  }));
  form?.addEventListener('change', render);
  quietZoneInput?.addEventListener('input', render);

  root.querySelector('[data-export-svg]')?.addEventListener('click', () => {
    downloadBlob(new Blob([svgMarkup()], { type: 'image/svg+xml;charset=utf-8' }), filenameFor(activeUrl, selectedSurface(), selectedQuietZone(), 'svg'));
    if (status) status.textContent = 'SVG 已匯出';
  });
  root.querySelector('[data-export-png]')?.addEventListener('click', async () => {
    const size = Number((form?.elements.namedItem('size') as HTMLSelectElement | null)?.value ?? 2048);
    try {
      await exportPng(svgMarkup(), size, filenameFor(activeUrl, selectedSurface(), selectedQuietZone(), 'png'));
      if (status) status.textContent = `PNG 已匯出 · ${size} px`;
    } catch (exportError) {
      if (status) status.textContent = exportError instanceof Error ? exportError.message : 'PNG 匯出失敗。';
    }
  });

  render();
};
