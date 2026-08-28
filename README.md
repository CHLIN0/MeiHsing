# 林美杏老師個人網站 (Mei-Hsing Lin Portfolio)

本專案為林美杏老師的個人形象網站，採用 Astro 作為建置框架與靜態網站生成器 (SSG)，結合 React 處理互動元件，搭配 Tailwind CSS 進行樣式設計。

## 網站架構 (Architecture)

本網站採用 **Islands Architecture (群島架構)**，將靜態內容與動態互動元件有效分離，大幅減少客戶端的 JavaScript 載入量，提升網頁載入效能與 SEO 表現。

- **框架**: [Astro](https://astro.build/) (v5) - 專為內容驅動網站設計的網頁框架
- **UI 函式庫**: [React](https://react.dev/) (v19) - 用於建構導覽列、動畫首屏等高互動元件
- **型別系統**: [TypeScript](https://www.typescriptlang.org/) - 提供嚴謹的資料定義與開發時提示
- **樣式設計**: [Tailwind CSS](https://tailwindcss.com/) (v3) - Utility-first 的 CSS 框架，客製化深色主題與品牌金色
- **動畫效果**: [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://gsap.com/) - 頁面滾動與元件進場動畫
- **圖示**: [Lucide React](https://lucide.dev/) - 輕量 SVG 圖示庫

### 目錄結構

```text
MS/
├── astro.config.mjs          # Astro 設定 (整合 React, Tailwind，設定 GitHub Pages URL)
├── tailwind.config.mjs        # Tailwind 自訂設計系統 (顏色、字型)
├── tsconfig.json              # TypeScript 嚴格模式設定
├── package.json               # 專案依賴與腳本
├── resume.md                  # 老師履歷資料 (供內容參考)
├── public/                    # 靜態資源
│   ├── gallery/               # 藝廊照片 (已分類整理)
│   │   ├── choir/             # 合唱團
│   │   ├── concert/           # 音樂會
│   │   ├── ensemble/          # 合奏
│   │   ├── music-class/       # 音樂班
│   │   └── volunteer/         # 志工
│   ├── background2.webp       # 首屏背景
│   ├── logo.webp               # 網站 Logo
│   └── head1.webp             # 個人肖像
└── src/                       # 原始碼
    ├── animations/
    │   └── variants.ts        # Framer Motion 共用動畫設定
    ├── types/
    │   └── index.ts           # TypeScript 資料介面定義
    ├── styles/
    │   └── global.css         # 全域樣式
    ├── components/            # React 元件庫
    │   ├── Nav.tsx             # 導覽列 (client:load)
    │   ├── Hero.tsx            # 首屏區塊 — 背景圖、標題、目前職位 (client:load)
    │   ├── Stats.tsx           # 數據統計區 — 教學年資、學生數等 (client:visible)
    │   ├── About.tsx           # 關於老師 (client:visible)
    │   ├── Experience.tsx      # 教學生涯 (client:visible)
    │   ├── Certifications.tsx  # 專業資格 (client:visible)
    │   ├── Gallery.tsx         # 教學花絮 — 分類相簿瀏覽 (client:visible)
    │   ├── VideoSection.tsx    # 影片展示 (client:visible)
    │   ├── Testimonials.tsx    # 家長與學生推薦 (client:visible)
    │   ├── Contact.tsx         # 聯繫方式 — 社群媒體連結 (client:visible)
    │   ├── Footer.tsx          # 頁尾 (client:visible)
    │   └── SharePage.tsx       # 多連結名片頁面 (client:load)
    ├── layouts/
    │   └── BaseLayout.astro   # Astro 共用 HTML 殼層與 SEO Meta Tags
    └── pages/                 # 路由頁面
        ├── index.astro        # 首頁 (/)
        └── links.astro        # 聯繫名片頁 (/links)
```

## 開發與運行 (Setup & Development)

### 先決條件
- [Node.js](https://nodejs.org/) 22（版本由 `.node-version` 統一）
- 建議使用 `npm` 進行套件管理

### 安裝依賴

```bash
npm install
```

### 本地端開發伺服器

執行以下指令啟動開發伺服器，預設會監聽 `http://localhost:4321/`：

```bash
# 啟動開發環境並開放區域網路存取
npm run dev -- --host
```

### 建置靜態檔案

若要測試生產環境的建立過程，請執行：

```bash
npm run build
```
建置完成的檔案會輸出至 `dist/`，並且自動：

- 產生 `deploy-meta.json`，供上線後確認實際服務中的 Git commit。
- 驗證 Cloudflare `_headers`，避免未帶內容指紋的圖片、影片或字型被誤設為長效 `immutable` cache。
- 確認主要靜態頁面與安全標頭仍存在。

## 部署說明 (Deployment)

本專案透過 **Cloudflare Workers Static Assets** 部署，並串聯 GitHub repository 自動觸發 Workers Builds。production 的 HTML 與 `public/` 同名資源會重新驗證；只有 Astro 產生、檔名含內容指紋的 `/_astro/*` 資源使用一年 `immutable` browser cache。

### Cloudflare Workers Builds 設定

1. **Git repository**: 連結此 repository，production branch 設為 `main`。
2. **Build settings**:
   - **Build command**: `npm run build`
   - **Deploy command**: 沿用現有 Worker 的 `npx wrangler deploy` 設定。
   - **Non-production branch deploy command**: `npx wrangler versions upload`
   - **Root directory**: `/`
   - **Build cache**: enabled
   - Node.js 版本由 repository 的 `.node-version` 控制，不在 Dashboard 重複指定。
3. **Preview**: 非 `main` 分支只上傳 preview version，不自動切換 production traffic。
4. **Production**: 在 GitHub 對 `main` 啟用 branch protection，要求 `production-build` 通過才能 merge；merge 後才由 Workers Builds 建置並部署 production。
5. **Custom domain**: `ms.linho.me` 直接綁定既有 Worker；不需要為每次部署修改 DNS。

> `wrangler.jsonc` 需要與 Cloudflare Dashboard 中既有 Worker 名稱完全一致。本 repo 尚未保存該名稱，因此不要以推測名稱建立設定檔；先從 Dashboard 匯出現行設定，再將它納入版本控制。

### 上線後快速驗證

```bash
curl -fsS https://ms.linho.me/deploy-meta.json
curl -sSI https://ms.linho.me/concert/2026/
curl -sSI https://ms.linho.me/concert/2026/hands-melody.webp
```

`deploy-meta.json` 的 `commit` 應等於本次 production commit。HTML 與同名 public asset 不應再出現一年 `immutable`；`/_astro/*` 則應保留長效 cache。
