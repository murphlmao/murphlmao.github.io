import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
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
  markdown: {
    shikiConfig: {
      // css-variables lets the palette (tokens.css --astro-code-*) drive the colors.
      theme: 'css-variables',
      wrap: true,
    },
    rehypePlugins: [rehypeCodeWrapper],
  },
  redirects: {
    '/projects': '/resume',
    '/blog': '/articles',
    '/blog/[slug]': '/articles/[slug]',
  },
});
