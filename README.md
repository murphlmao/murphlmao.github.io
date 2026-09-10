# murph.rip

The personal site: [Astro](https://astro.build) static build, no framework CSS, deployed to
GitHub Pages from `main` by `.github/workflows/`. React is only used for the one Recharts
island (`src/components/blog/.../BigOGraph.tsx`); everything else is Astro plus plain
TypeScript modules in `src/scripts/`.

## Dev

Uses **pnpm 10** (CI installs it with `pnpm/action-setup`).

```bash
pnpm install
pnpm dev        # dev server on http://localhost:3000
pnpm build      # static build into dist/
pnpm preview    # serve dist/ on http://localhost:3000
pnpm check      # build, then assert built pages contain expected markers
pnpm lint       # eslint (flat config: js + typescript-eslint + astro)
```

`pnpm check` is the one to run before pushing: it is `astro build && node
scripts/check-pages.mjs`, and that script asserts real strings appear in the built HTML.
When you add a page worth guarding, append a row to the `checks` table in
`scripts/check-pages.mjs`.

## Where content lives

Everything under `src/content/`. Frontmatter is validated by the collection schemas in
`src/content.config.ts` — a bad or missing field fails the build rather than shipping.

### Articles — `src/content/blog/<header>/<course>/<slug>.md`

Two directory levels, both described by their own metadata file:

```
src/content/blog/
  umich-cs/                 <- header
    _header.md              <- name, description, order, icon
    eecs280/                <- category ("course")
      _category.md          <- name, description, order, icon, showIconInHeader
      what-is-the-stack.md  <- an article
```

`src/lib/content.ts` reads `_header.md` / `_category.md` off disk to build that tree;
`src/lib/site.ts` joins it with the Astro content collection to produce posts. Files
starting with `_` are never articles, and a directory without its `_header.md` /
`_category.md` is skipped entirely.

Article frontmatter: `title`, `date` (required), plus optional `description`, `tags`,
`order`, `lastModified`, `image`. `order` sets the position inside a course (oldest-first
reading order); `date` orders the flat article list. `.mdx` works too — use it when the
article needs a component (see `complexity_analysis_big_Oshit.mdx`).

Articles are served at `/articles/<slug>` and courses at `/articles/<course>`, so slugs
must be unique across all courses. Old `/blog/...` URLs are handled by the `redirects` map
in `astro.config.mjs`.

**Adding a header that is not a course:** make `src/content/blog/<name>/` with a
`_header.md`, then at least one subdirectory with a `_category.md`. Nothing else needs
editing — the nav, the articles page groups, and the home page counts all derive from the
tree. Give it an `order` higher than `umich-cs` to sort it below.

### Other content

| Path | What |
| --- | --- |
| `src/content/snippets/` | Snippets. Either a flat `<slug>.md`, or `<slug>/index.md` plus assets for an interactive one (`type: interactive`, `assetPath` pointing into `public/`). |
| `src/content/deer/` | The deer/raccoon incident log (`animal`, `car`, `count`, `damage`, `images`). |
| `src/content/resume.ts` | Resume data — summary, contact, experience, education, certifications, and skill groups with evidence links. `experience` also feeds the home page rail. |
| `src/content/projects/data.ts` | Projects. `id` becomes the resume anchor `rs-p-<id>`. |
| `src/content/resources/data.ts` | The `/resources` links, grouped by section heading. |

## Configuration

`src/site.config.ts` holds the site identity (name, domain, intro, socials, nav, resume
PDF path) and the tweak system:

- `tweakDefaults` — what a first-time visitor sees: palette `ember`, logo `orb`, pen
  drawing, background and critters on. Visitors override these through the gear popover
  and the result is persisted in `localStorage` under `tweaks`; the inline boot script in
  `src/layouts/Base.astro` applies them before first paint so there is no flash.
- `showTweaks` — set to `false` to drop the gear button and the settings popover from
  every page.

`?palette=`, `?logo=` and `?draw=` query params override a tweak for one page load without
persisting, which is handy for screenshots.

There is no light mode and no `prefers-color-scheme` handling; the palettes are the only
theming axis.

## Design reference

`docs/redesign-previews/r4/` is the design reference for the current look — static HTML/CSS/JS
that the Astro components were ported from. When changing visual behavior, check it against
r4 first; the canvas modules in `src/scripts/` (`pen`, `background`, `sidecat`, `critters`,
`walker`) are deliberate function-for-function ports and are exempted from some lint rules
in `eslint.config.mjs` so they stay diffable against it.

# TODO:
## Code
- Refactor to typescript / tsx

## Formatting
- Fix mobile view for hamburger menu & deer redirect / dark mode toggle

## Blogs / Articles / Posts:
### eecs281
- time complexity: BIG O (shit)

### Topics Covered/Done
- stack
- pointers & references
- heap
- arrays & pointer arithmetic
- streams and I/O
- const
- structs and c-style strings & ADTs
- error & exception handling & exit codes
- classes, operator overloading, & templates
  - what are operators
- the rules of 3, 5, and 0
  - lvalues & rvalues
  - RAII // Destructors
  - Copy constructor, copy assignment operator
  - Move constructor, move assignment operator
  - Smart pointers (unique_ptr, shared_ptr, weak_ptr)
- containers & iterators
 - maps, vectors, sets, linked lists