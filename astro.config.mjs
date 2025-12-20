import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://murph.rip',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'dracula',
      wrap: true,
    },
  },
});
