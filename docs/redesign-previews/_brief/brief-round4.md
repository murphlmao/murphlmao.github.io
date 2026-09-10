# Brief — murph.rip redesign, round four: the composite

Round three produced four themes in `docs/redesign-previews/r3-*`. Murphy reacted to specific parts. This round builds ONE site from exactly those parts. Nothing new is invented where a loved part exists; lift the code.

Content: `content.md` in this folder, verbatim. Rules that still apply from `brief-round3.md`: "Required in every theme" items 1, 2, 5, 6, 7, 8; "Not allowed"; the return format.

## What he said, mapped to sources

| Part | Take from | His words |
|---|---|---|
| Typefaces: IBM Plex Sans body and headings, IBM Plex Mono for meta, dates, labels, code | `r3-terminal` | "that font and accents and layout are sexy as fuck" |
| Article page layout: mono meta line (`eecs281/ · 2026-01-10 · 2.5k words · about 14 min read`), `##`-prefixed headings in accent, code blocks with language tag and copy, reading column | `r3-terminal/article.html` + its CSS | "the markdown layout for headers is fucking perfect" |
| Ground and text colors | `r3-cat` palette `alley` (#121016 ground, #EDE7DF text, #F5A742 amber accent); `r3-terminal` `arch` ground #121110 is the same family | "i love the background color here even MORE" |
| Background animation: drifting curved strands + rising motes on a canvas, paw-print cursor trail | `r3-cat/site.js` | "hot as shit"; paw trail: "add that as an option for all pages, toggle on and off" |
| Footer walking black cat, CSS-only | `r3-cat` `.walker` | "I LOVE THE ANIMATED BLACK KITTY on the footer" |
| Reactive sidebar cat (eyes open and track the cursor near it) | behavior from `r3-cat`, silhouette from `r3-night` (the small curled cat on the wordmark rule) | "i like how the guy on the top left reacts to me"; night's cat "a LOT more" than cat's |
| Sidebar content and order: wordmark with the curled cat on the rule, name, one-line intro, nav with accent dot on current, socials, palette, deer count line | `r3-night` panel | "i actually really like the sidebar" |
| Home hero: highlighter swipe on the last name; pen-drawn Michigan M and cat top-right | `r3-fieldnotes` | "i fucking love the god damn michigan animation"; "love how my last name is highlighted" |
| Per-page pen-drawn scene top-right (notebook on articles, terminal on projects, resources, snippets scenes) | `r3-fieldnotes/site.js` band scene | "the animations per page are just awesome" |
| Articles index: Michigan header block, course groups with logo, description, count, plain dated lists | `r3-fieldnotes/articles.html` | "keep that entire layout", minus the underline on article titles |
| Red accent option: the dark red used for arrows and headers in field notes' reverie, not the pink sticky | `r3-fieldnotes` reverie `--accent-text` | |

He hates: terminal's left file tree, tab strip, breadcrumb path header; night's headstone logo; the notey underline on article titles; sticky notes are not requested. Do not include any of these.

Parked, do not build: an "enter my terminal" transition for the articles section; custom filter and order controls on the index.

## Layout

Fixed left sidebar, 272px, night's content order (above). Below 900px it becomes a top bar with the mark, the cat at small size, and a menu button opening a sheet with nav and the tweak panel.

Content column right: index pages up to 1040px; article prose column 68-72ch. On the article page the sidebar shows the table of contents under the nav (h2/h3/h4, scroll-spy). No right-hand TOC.

Each page has a header area at the top of the content column with the page title on the left and the pen-drawn scene on the right (about 200x150 px), so the scene sits where field notes had it without a full-width band.

Footer on every page: the walking cat on a hairline, then links and copyright.

## Tweak panel (sidebar, collapsible, persisted in localStorage, all pages)

Every control writes a `data-*` attribute or CSS variable on `<html>` and fires a `tweakchange` event the canvas code listens to.

1. Palette select: `alley` (default), `ember` (same ground, accent = the field notes dark red, headings and arrows in it), `space` (black ground, red accent, star-white text). Reverie proper is not requested.
2. Logo select: `orb` (default), `mark-a`, `mark-b`, `mark-c`. Applies to the sidebar mark and the favicon (swap the `<link rel="icon">` href).
3. Orb animation: on/off. The orb is a red swirling ball: a 40px circle whose interior is an animated swirl (canvas or SVG with an animated conic/radial gradient and a slowly rotating turbulence, two or three tones of the accent), soft-edged, like a small planet or a stirred drink. Off = a static frame. Respect reduced motion.
4. Background: on/off. Opacity slider 0 to 100 (default 55). Strands on/off. Particles on/off. Article pages multiply the opacity by a factor the panel also exposes ("dim on articles", default 50%).
5. Paw trail: on/off (default on).
6. Footer cat: on/off (default on).
7. A "reset" link.

## Logo marks

Three static SVG marks, 32x32, currentColor, readable at 16px. He will design his own later; these are candidates. Build from the cat and the M, not from letters alone:
- `mark-a`: cat face (lift `r3-cat/logo.svg`, refine if needed)
- `mark-b`: a block M with a cat's ear notch, or the M's negative space forming a cat
- `mark-c`: a paw print reduced to four dots and a pad, arranged to read as an "m"
Plus the orb, which is drawn by JS into a 40x40 canvas in the sidebar and also exported once to a data-URI PNG for the favicon when selected.

## Deliverable

Folder `docs/redesign-previews/r4/` with `index.html`, `articles.html`, `eecs280.html`, `article.html`, `projects.html`, `snippets.html`, `resources.html`, `style.css`, `site.js`, `logo-a.svg`, `logo-b.svg`, `logo-c.svg`. Standalone documents, relative links, Google Fonts only, images from `../../../public/`.

Screenshots to `docs/redesign-previews/_shots/r4-<page>.png` at 1440x1000, plus `-full` (1440x1800) and `-mobile` (500x1300) for index and article. Note: headless Chrome with `--virtual-time-budget` starves timers, so canvas scenes may look blank; verify layout there and verify motion by reasoning about the code, or with `--force-prefers-reduced-motion` which draws the static frame.

## Addendum: critters (added 2026-09-09 23:41)

Murphy: "i really like the animated deer in night. i thought that was hilarious and awesome. please feel free to add that, the cat, and a racoon."

A critter layer along the bottom edge of every page, above the footer hairline, drawn on one canvas (lift the deer from `r3-night/site.js`: silhouette paths, walk cycle, the stop-and-look behavior with accent eye dots; the footer cat may stay the CSS walker from `r3-cat` or move onto the same canvas, builder's choice, but only one implementation of the cat). Add a raccoon: a low, rounded silhouette with a striped tail, waddles slower than the deer, stops now and then to "rummage" (head dips twice), then carries on. At most one deer and one raccoon on screen at a time; they enter from alternating sides at random intervals of 20 to 60 seconds and the cat walks its own loop. The deer and raccoon each get a tweak-panel switch (default on), and they pause when the tab is hidden and freeze as a static frame under reduced motion. Hovering the deer-count line in the sidebar makes the deer look at you, as in night.
