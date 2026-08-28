import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://ms.linho.me',
    integrations: [
        react(),
        tailwind(),
        sitemap({
            filter: (page) => !page.includes('/tools/audio-separation-review/')
                && !page.includes('/concert/2026/guide/'),
        }),
    ],
    output: 'static',
    redirects: {
        '/2026-concert': '/concert/2026/',
    },
});
