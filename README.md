# 林美杏老師個人網站 (Mei-Hsing Lin Portfolio)

本專案為林美杏老師的個人形象網站，最初由單頁 React 應用程式 (SPA) 改版而來。目前採用 Astro 作為建置框架與靜態網站生成器 (SSG)，並結合 React 處理互動元件，搭配 Tailwind CSS 進行樣式設計。

## 網站架構 (Architecture)

本網站採用 **Islands Architecture (群島架構)**，將靜態內容與動態互動元件有效分離，大幅減少客戶端的 JavaScript 載入量，提升網頁載入效能與 SEO 表現。

- **框架**: [Astro](https://astro.build/) (v5) - 專為內容驅動網站設計的網頁框架
- **UI 函式庫**: [React](https://react.dev/) (v19) - 用於建構導覽列、動畫首屏等高互動元件
- **型別系統**: [TypeScript](https://www.typescriptlang.org/) - 提供嚴謹的資料定義與開發時提示
- **樣式設計**: [Tailwind CSS](https://tailwindcss.com/) (v3) - Utility-first 的 CSS 框架，客製化了深色主題 (Dark Theme) 與品牌金色。
- **動畫效果**: [Framer Motion](https://www.framer.com/motion/) - 處理頁面滾動與元件進場動畫

### 目錄結構

```text
MS/
├── astro.config.mjs          # Astro 設定 (整合 React, Tailwind，設定 github pages url)
├── tailwind.config.mjs        # Tailwind 自訂設計系統 (顏色、字型)
├── tsconfig.json              # TypeScript 嚴格模式設定
├── package.json               # 專案依賴與腳本
├── .github/workflows/
│   └── deploy.yml             # GitHub Actions 自動部署腳本
├── public/                    # 靜態資源 (圖片、logo)
│   ├── 合唱團/ / 合奏/ / 志工/ / 音樂會/ # 藝廊照片分區
│   ├── background.png         # 首屏背景
│   ├── logo.png               # 網站 Logo
│   └── head1.jpeg             # 個人肖像
└── src/                       # 原始碼
    ├── animations/
    │   └── variants.ts        # Framer Motion 共用動畫設定
    ├── types/
    │   └── index.ts           # TypeScript 資料介面定義 (Experience, Certification 等)
    ├── components/            # React 元件庫
    │   ├── Nav.tsx             # 導覽列 (client:load)
    │   ├── Hero.tsx            # 首部區塊 (client:load)
    │   ├── About.tsx           # 關於老師 (client:visible)
    │   ├── Certifications.tsx  # 專業資格 (client:visible)
    │   ├── Experience.tsx      # 教學生涯 (client:visible)
    │   ├── Gallery.tsx         # 音樂時光 (client:visible)
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
- [Node.js](https://nodejs.org/) (建議 v18 以上)
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
建置完成的檔案將會輸出至 `dist/` 目錄中。

## 部署說明 (Deployment)

本專案已設定好完全由 **GitHub Actions** 自動部署至 **GitHub Pages**。

1. **版本控制**: 確保程式碼推送到 GitHub 的 `meishing.github.io` repository。
2. **自動觸發**: 每當程式碼推送到 `main` 分支時，`.github/workflows/deploy.yml` 會自動執行。
3. **GitHub Pages 設定**:
   - 進入 Repository 的 **Settings** -> **Pages**。
   - 在 **Build and deployment** 區塊中，將 **Source** 設定為 `GitHub Actions`。
4. **上線**: 部署完成後，網站即會更新於 `https://meishing.github.io`。

## 從舊版 `old_sharepage.html` 遷移細節

專案內保留有 `old_sharepage.html` 供參考。舊有系統的社群連結 (Facebook, Instagram, YouTube)、QR Code (網站版已移除)、與聯絡信箱 (`ms@linho.me`) 已全面被重構為：
1. 整合入主首頁的 `Footer.tsx` 以及導覽列 `Nav.tsx`。
2. 創建了獨立的 React 元件 `SharePage.tsx`，並將其掛載至 Astro 路由 `/links` 作為專屬的社群連結名片頁。 
