import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { rehypeCodeWrapper } from './src/lib/rehype-code-wrapper';

export default defineConfig({
  site: 'https://murph.rip',
  output: 'static',
  server: { port: 3000 },
  integrations: [
    react(),
    sitemap(),
    mdx({
      rehypePlugins: [rehypeCodeWrapper],
    }),
  ],
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
