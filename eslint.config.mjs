import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      // page check output (scripts/check-pages.mjs, ad-hoc `astro build --outDir .check/...`)
      '.check/**',
      '.astro/**',
      'docs/**',
      '.superpowers/**',
      '.remember/**',
      'node_modules/**',
      // emscripten output, checked in as a build artifact
      'public/snippets/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    // Canvas modules ported function-for-function from docs/redesign-previews/r4/site.js.
    // Their `var`/`any`/unused-local style is r4's; keeping the ports diffable against
    // the reference beats restyling them.
    files: ['src/scripts/{pen,background,sidecat,critters,walker}.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'prefer-const': 'off',
      'no-var': 'off',
    },
  },
];
