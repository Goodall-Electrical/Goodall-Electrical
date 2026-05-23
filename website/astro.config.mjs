import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://goodallelectrical.com.au',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
      serialize(item) {
        const path = new URL(item.url).pathname;
        const lastmod = new Date().toISOString();
        // Per-page priority + change frequency hints for crawlers.
        if (path === '/') {
          return { ...item, lastmod, priority: 1.0, changefreq: 'weekly' };
        }
        // /services/antennas/<town>/ — town landing pages
        if (/^\/services\/antennas\/[^/]+\/?$/.test(path)) {
          return { ...item, lastmod, priority: 0.8, changefreq: 'monthly' };
        }
        // /services/<x>/ — service pages (including antennas hub)
        if (/^\/services\/[^/]+\/?$/.test(path) || path === '/services/') {
          return { ...item, lastmod, priority: 0.9, changefreq: 'monthly' };
        }
        if (path.startsWith('/projects/')) {
          return { ...item, lastmod, priority: 0.7, changefreq: 'monthly' };
        }
        return { ...item, lastmod, priority: 0.6, changefreq: 'monthly' };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
