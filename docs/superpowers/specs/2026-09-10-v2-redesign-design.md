# murph.rip v2 — design spec

Date: 2026-09-10. Branch: `v2`. Reference build: `docs/redesign-previews/r4/` (static HTML, the approved look and behavior). This document says how that preview becomes the real Astro site.

## 1. Goals

- Rebuild the site so it looks and behaves like the r4 preview: sidebar layout, IBM Plex type, alley/ember/space palettes, animated header drawings, background strands, footer animals, sidebar cat, tweak panel, resume page, articles with by-date and by-class views.
- Keep writing articles in Markdown and MDX with React islands for interactive figures, through one render pipeline.
- Keep the site static, hosted on GitHub Pages from the existing workflow.

## 2. Non-goals (parked, by Murphy)

- "Enter my terminal" transition for the articles section.
- Custom filter and ordering controls on the index beyond by-date and by-class.
- Whether Snippets should exist as a section. It stays as is, restyled.
- Light mode. Palettes are all dark. The theme toggle icon goes away.
- The final logo. Murphy makes his own; the orb and three marks stay as placeholders in the picker.

## 3. Architecture

Astro 5, static output, unchanged. React stays only for MDX islands (interactive figures like `BigOGraph`). Everything else is Astro components, plain CSS with custom properties, and vanilla JS modules.

### 3.1 Content pipeline: one path

Today `.md` renders through a hand-rolled `marked` + shiki path in `src/lib/content.ts` and `.mdx` through Astro's content collections. v2 renders both through Astro:

- `src/content.config.ts` keeps the `blog` collection (glob `**/[!_]*.{md,mdx}` under `src/content/blog`). Add collections `snippets` (glob under `src/content/snippets`, `index.md` or flat `.md`) and `deer` (glob under `src/content/deer`).
- Pages call `getCollection()` and `render(entry)`; the `<Content />` component renders both formats. `renderMarkdown`, `getMarkdownContent`, `getPostContent`, `getSnippetContent`, the shiki highlighter cache, and the `marked` renderer are deleted. `marked`, `shiki`, `gray-matter`, `react-syntax-highlighter` come out of `package.json` if nothing else imports them (verify at removal time).
- Course structure stays folder-based. `getBlogStructure()` (reads `_header.md` and `_category.md`) stays because collections cannot express it; it only reads metadata now. Posts come from the collection; the structure maps a post to its header and category by its `id` path (`umich-cs/eecs280/what-is-the-stack`).
- Code blocks: Astro's built-in shiki with `theme: 'css-variables'` so token colors come from the palette (`--astro-code-*` variables defined per palette in the global stylesheet). The existing `rehypeCodeWrapper` stays and is applied to both `markdown.rehypePlugins` and the MDX integration, so every code block gets the language label and the copy button hook.
- Non-course writing: a second header folder (for example `src/content/blog/writing/_header.md` with categories) works without code changes; the index renders every header in `order`. Nothing is created now.

### 3.2 Styling: plain CSS, Tailwind removed

The r4 preview is ~1,000 lines of hand-written CSS on custom properties. Two systems would fight. v2 uses:

- `src/styles/tokens.css`: palettes as `:root[data-palette]` sets (`alley` on bare `:root`, `ember`, `space`), type scale, spacing, `--mich`, shiki variables.
- `src/styles/base.css`: reset, fonts, body, focus, reduced motion, print.
- Component styles in each `.astro` file's `<style>` block, ported from `style.css`, `pages.css`, `resume.css`, `walker.css` of r4.
- Fonts self-hosted via `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` (add both). No Google Fonts request.
- Remove `tailwindcss`, `@tailwindcss/vite`, `tailwind.config.js`, `src/styles/globals.css`, `src/styles/markdown.css` after every page is ported. Class names in existing article `.md` files that rely on Tailwind (verify with grep) get plain CSS equivalents in the article stylesheet.

### 3.3 Client JS modules

Ported from r4 into `src/scripts/`, loaded by the layout with `<script>` tags (Astro bundles them). Same contracts as the preview:

| Module | Source in r4 | Role |
|---|---|---|
| `tweaks.ts` | `site.js` initTweaks | reads `site.config.ts` defaults, merges `localStorage.tweaks`, writes `<html data-*>` and CSS variables, fires `tweakchange`, honors `?palette=` etc. query overrides, renders the panel controls from a config array |
| `orb.ts` | `site.js` initOrb | the swirling mark canvas and favicon export |
| `pen.ts` | `site.js` makePen | header drawings, pen and laser modes; path sets keyed by page (`data-scene` on `<main>`) |
| `background.ts` | `site.js` initScene | strands and motes, paw trail |
| `sidecat.ts` | `sidecat.js` | sidebar cat, injected SVG, no eyes |
| `critters.ts` | `critters.js` | deer and raccoon strip |
| `walker.ts` | `walker.js` | footer cat |
| `articles.ts` | `pages.js` | by-date/by-class FLIP switch, persisted view |
| `article.ts` | `site.js` initCopy, initToc | copy buttons, TOC scroll-spy |

Rules kept: every loop pauses on `document.hidden`, draws a static frame under `prefers-reduced-motion`, reads colors from CSS variables, re-reads on `tweakchange`. No framework, no per-frame allocations. Modules only run when their mount element exists on the page.

### 3.4 Site config

`src/site.config.ts` exports the defaults the tweak panel starts from and the palette, logo, and scene registries:

```ts
export const tweaks = {
  palette: 'alley', logo: 'orb', orbSpin: true, draw: 'pen',
  background: true, bgOpacity: 55, strands: true, particles: true, dimOnArticles: 50,
  pawTrail: true, walker: true, deer: true, raccoon: true, mich: 'maize',
};
```

Murphy changes defaults here once he has dialed them in. The panel stays in the sidebar for visitors too (it is part of the site's character); a `showTweaks` flag can hide it.

## 4. Layout and pages

Shell (`src/layouts/Base.astro`): fixed 272px sidebar (mark + wordmark with the cat on the rule, name, one line, nav with current marker, socials, tweak panel, deer count), content column, footer with the critter strip and links. Below 900px the sidebar becomes a top bar with a menu sheet. Background canvas behind everything. Head: fonts, favicon swapped by the logo tweak, `<html data-*>` set by an inline anti-FOUC script that reads `localStorage.tweaks`.

| Route | Source | Notes |
|---|---|---|
| `/` | `pages/index.astro` | hero with highlighted last name and the M scene, bio (62ch) with photo, latest 5, right rail (work, courses with counts, writing stats) at ≥1280px |
| `/articles` | `pages/articles/index.astro` | title, stats line, view switch; by-date list with course chips (default), by-class groups (header block, course groups with logo, description, count) |
| `/articles/[slug]` | `pages/articles/[slug].astro` | unchanged routing: a category slug renders the course page (oldest first, same group layout), a post slug renders the article: mono meta line (course path, date, word count, read time), `##` headings, prose column, code blocks, figures, TOC in the sidebar, back to course |
| `/resume` | `pages/resume.astro` | from `src/content/resume.ts` (typed data transcribed from the PDF): header, summary, experience, education with course links, certifications, skills matrix with `<details>` evidence, projects; print stylesheet |
| `/resources` | `pages/resources.astro` | monogram tiles from `content/resources/data.js` (hue hashed from hostname) |
| `/snippets`, `/snippets/[slug]` | existing pages restyled | WASM optimization triangle keeps working |
| `/deer` | existing page restyled | incident log through the `deer` collection |
| `/projects` | `pages/projects.astro` | 301 to `/resume` |
| `/blog`, `/blog/[...slug]` | existing redirects | keep |
| `/404` | new | the cat, one line |

Word count and read time come from the entry body at build time (`entry.body`), replacing `getBlogStats()`'s file reads.

## 5. Data that moves into code

- `src/content/resume.ts`: the PDF content (see `docs/redesign-previews/_brief/resume.md`) as typed objects: `summary`, `experience[]`, `education[]`, `certifications[]`, `skillGroups[]` with `evidence[]` entries `{where, text, href}`.
- `src/content/projects/data.js` and `resources/data.js`: unchanged shape; converted to `.ts` with types.
- Work history for the home rail comes from `resume.ts` experience (first two entries by date).

## 6. Motion and accessibility floor

- All animation respects `prefers-reduced-motion` (static frames) and pauses when hidden.
- Every interactive element is keyboard reachable with a visible focus ring; the tweak panel is a `<details>` with native controls; the view switch is a radio group; skill rows are `<details>`.
- Contrast ≥4.5:1 for body text in every palette; the accent is never the only signal.
- Canvases are `aria-hidden`; the deer count line carries the log text.

## 7. Build, deploy, verification

- `pnpm build` must pass with zero warnings from content collections. `pnpm lint` stays.
- A `scripts/check-pages.mjs` builds, serves `dist/`, and screenshots the seven main routes with headless Chrome at 1440 and 500 wide into `.check/` (gitignored), failing on console errors. This is the smoke test; no unit test framework.
- Deploy workflow unchanged. It deploys from `main`, so `v2` merges to `main` when done; nothing deploys before that.

## 8. Migration order (high level, the plan expands this)

1. Fonts, tokens, base CSS, `site.config.ts`, the shell layout with sidebar and footer, tweak panel, background, orb. Home page. Old pages still render inside the new shell temporarily.
2. Content pipeline: collections for blog, snippets, deer; `render()` everywhere; remove `marked`/shiki code and Tailwind after the last page is ported.
3. Articles index and article page, code blocks, TOC, view switch.
4. Resume, resources, snippets, deer, 404, redirects.
5. Animals and pen scenes ported as modules; check script; cleanup of dead dependencies.

## 9. Decisions to confirm

1. Tailwind out, plain CSS in (3.2).
2. Self-hosted Plex via fontsource, no Google Fonts (3.2).
3. Tweak panel visible to visitors by default (3.4).
4. `/projects` becomes a redirect to `/resume` (4).
5. Resume content lives in a typed TS file that Murphy edits by hand, PDF stays canonical (5).
