import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { rehypeCodeWrapper, shikiMeta } from './src/lib/rehype-code-wrapper';

export default defineConfig({
  site: 'https://murph.rip',
  output: 'static',
  server: { port: 3000 },
  integrations: [
    react(),
    sitemap(),
    mdx(),
  ],
  markdown: {
    shikiConfig: {
      // css-variables lets the palette (tokens.css --astro-code-*) drive the colors.
      theme: 'css-variables',
      wrap: true,
      transformers: [shikiMeta],
    },
    // $...$ inline and $$...$$ display math, typeset by KaTeX at build time (no client JS).
    // .md and .mdx both get these: mdx() inherits this block.
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeCodeWrapper],
  },
  redirects: {
    '/projects': '/resume',
    '/blog': '/articles',
    '/blog/[slug]': '/articles/[slug]',
    '/snippets': '/resources',
    '/snippets/[slug]': '/resources/[slug]',
  },
});
