# r3-terminal build spec

Builder: follow exactly. No design decisions are open. All copy comes from `../_brief/content.md` verbatim. Asset root `../../../public/`. Every page links `style.css`, `site.js` (defer), the Google Fonts link, and the favicon.

## 0. Head (every page)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,...">  <!-- logo.svg with fill="#1793D1" instead of currentColor, URL-encoded -->
<script>document.documentElement.dataset.palette=localStorage.getItem('palette')||'arch'</script>
```
`<html lang="en" data-palette="arch">`. `<body class="app" data-page="home|articles|course|article|projects|snippets|resources">`. Article page also gets `data-rain="dim"`.

Type: body IBM Plex Sans 17px/1.65. Mono IBM Plex Mono for labels, dates, paths, code, tree, tabs, status bar. Scale: 11 (proc/tree meta), 12 (tags, TOC, code head), 13 (status, tree, meta lines), 14.5 (descriptions), 17 (body), 20 (group name), 24 (h2), 30 (h1).

## 1. Shell (identical on all pages)

Element order inside `<body>`:

```html
<header class="status">
  <div class="status-left">
    <button class="cat" type="button" data-face="=^.^=" data-hover="=^o^=" data-play="=^ω^=" aria-label="Cat. Click to play chill_guy_man.mp3"></button>
    <a class="brand" href="index.html"><svg class="mark" viewBox="0 0 32 32">…logo path…</svg><span class="brand-name">murph.rip</span></a>
    <span class="path"><a href="index.html">~</a><span class="sep">/</span><a href="articles.html">articles</a><span class="sep">/</span><span class="cur">eecs281</span></span>
    <span class="now-playing" aria-live="polite">♪ chill_guy_man.mp3</span>
  </div>
  <div class="status-right">
    <label class="palette"><span class="sr-only">Palette</span>
      <select class="palette-select"><option value="arch">arch</option><option value="reverie">reverie</option><option value="space">space</option><option value="paper">paper</option></select></label>
    <ul class="socials">…4 li > a with inline 16px SVG icons (GitHub, Spotify, LinkedIn, Instagram, this order), aria-label each, viewBox 0 0 24 24, fill currentColor…</ul>
    <button class="menu-btn" type="button" aria-controls="side" aria-expanded="false">tree</button>
  </div>
</header>
<aside class="side" id="side">
  <div class="side-head"><span>~/murph.rip</span><button class="side-close" type="button" aria-label="Close">×</button></div>
  <nav class="tree" aria-label="Site">…§2…</nav>
  <ul class="socials">…same 4 icons…</ul>
  <div class="proc" aria-hidden="true">
    <canvas class="proc-c"></canvas>
    <span class="proc-k">cpu</span><span class="proc-v">0%</span>
    <span class="proc-k">mem</span><span class="proc-v">0%</span>
    <span class="proc-k">deer</span><span class="proc-v">0%</span>
  </div>
</aside>
<div class="scrim"></div>
<main class="pane">
  <canvas class="rain" aria-hidden="true"></canvas>
  <nav class="tabs" aria-label="Open pages"><ul>…§3…</ul><span class="cursor" aria-hidden="true"></span></nav>
  <div class="pane-scroll">
    <div class="page">…page content…</div>
    <footer class="footer"><svg class="mark" viewBox="0 0 32 32">…</svg><span>© 2026 Murphy Malcolm. All rights reserved.</span>
      <ul class="footer-links"><li><a href="articles.html">Articles</a></li><li><a href="snippets.html">Snippets</a></li><li><a href="resources.html">Resources</a></li><li><a href="projects.html">Projects</a></li></ul></footer>
  </div>
</main>
```

Path per page: home `~/about.md`; articles `~/articles`; eecs280 `~/articles/eecs280`; article `~/articles/eecs281/complexity_analysis_big_Oshit.mdx`; projects `~/projects.md`; snippets `~/snippets`; resources `~/resources.md`. Every segment that has a page is a link; the last segment is `<span class="cur">`.

Desktop (≥900px): body is a 100vh grid, status 40px top, side 280px left, pane right; only `.pane-scroll` and `.tree` scroll. Mobile (<900px): normal document flow, status sticky, `.side` is an off-canvas sheet opened by `.menu-btn` (adds `.is-open` to `.side` and `.scrim`, `aria-expanded=true`; close on `.side-close`, scrim click, Escape). Tabs hidden. Status `.socials` hidden, side `.socials` shown.

## 2. Tree

```html
<ul>
 <li style="--i:0"><div class="tree-row"><span class="tree-tw"></span><a class="tree-name" href="index.html">about.md</a></div></li>
 <li class="is-dir is-open" style="--i:1"><div class="tree-row"><button class="tree-tw" type="button" aria-expanded="true" aria-label="Toggle articles"></button><a class="tree-name" href="articles.html">articles/</a><span class="tree-meta">16</span></div>
  <ul>
   <li class="is-dir" style="--i:2"><div class="tree-row"><button class="tree-tw" …></button><a class="tree-name" href="eecs280.html">eecs280/</a><span class="tree-meta">13</span></div>
    <ul><li style="--i:3"><div class="tree-row"><span class="tree-tw"></span><a class="tree-name" href="#" title="974 words">what-is-the-stack.md</a><span class="tree-meta tree-size">974w</span></div></li> …</ul>
   </li>
   … eecs281/ (1), eecs298/ (0), eecs370/ (2)
  </ul>
 </li>
 <li class="is-dir is-open"> snippets/ (2): divisible_cat.md 507w · premature-optimization/ 922w </li>
 <li> resources.md </li>
 <li> projects.md </li>
 <li class="is-dir is-open"> misc/ → <li><div class="tree-row"><span class="tree-tw"></span><a class="tree-name" href="#" title="Tragedy &amp; Pain.">deer.log</a><span class="tree-meta">9 entries</span></div></li> </li>
</ul>
```

File names and sizes (`title="N words"`, `.tree-size` text `Nw`; ≥1000 shown as `1.9k`):

| dir | file (course order) | words |
|---|---|---|
| eecs280 | what-is-the-stack.md | 974 |
| | pointers-references.md | 1291 |
| | arrays-pointer-arithmetic.md | 1900 |
| | heap-of-faith.md | 1834 |
| | streams-io.md | 1445 |
| | constants.md | 1189 |
| | c-style-adts-and-strings.md | 1877 |
| | error-exception-handling.md | 2072 |
| | cpp-classes-overloading-templates.md | 2337 |
| | the-big-rules-of-cpp.md | 3349 |
| | containers-iterators-linked-lists.md | 4096 |
| | recursion-tail-structural.md | 2005 |
| | binary-search-trees.md | 651 |
| eecs281 | complexity_analysis_big_Oshit.mdx → article.html | 2529 |
| eecs370 | logic_gates_discrete_math_fundamentals.md | 1538 |
| | binary_hex.md | 2624 |

Article links other than the built one go to `#`. Rules:
- `articles/`, `snippets/`, `misc/` open on every page. The course dir containing the current page is open; other course dirs closed. Home: all course dirs closed.
- `li.is-active` on the current page's item. On article.html, insert directly after that item's `.tree-row`: `<ol class="toc">` with one `<li class="toc-h2|toc-h3"><a href="#id">heading</a></li>` per h2/h3 of the article.
- `--i` counts visible rows top to bottom, starting at 0 (drives stagger).
- Twisty click toggles `.is-open` on its `li` and `aria-expanded`. Hover/focus on a row reveals `.tree-size`.

## 3. Tabs

`<li class="tab tab-pin"><a class="tab-link" href="index.html">about.md</a></li>` is always first. Then per page (`is-active` last, with `aria-current="page"`; active tab has `<a class="tab-close" href="PARENT" aria-label="Close tab">×</a>` after the link):

- home: about.md active, no close.
- articles: `articles/` close→index.html
- eecs280: `articles/`, `eecs280/` close→articles.html
- article: `articles/`, `eecs281/` (href `#`), `complexity_analysis_big_Oshit.mdx` close→articles.html
- projects `projects.md`, snippets `snippets/`, resources `resources.md`: close→index.html

## 4. Palette switcher

`<select class="palette-select">` change → `document.documentElement.dataset.palette = value`; `localStorage.setItem('palette', value)`; call `readColors()`. On load set the select's value from `dataset.palette`. CSS defines each set as `:root[data-palette="name"]{--bg;--panel;--line;--text;--muted;--accent;--accent2}`; bare `:root` equals `arch`.

| name | bg | panel | line | text | muted | accent | accent2 |
|---|---|---|---|---|---|---|---|
| arch (default) | #121110 | #1A1918 | #2C2A27 | #E4DFD6 | #918B82 | #1793D1 | #D9A441 |
| reverie | #050407 | #0D0B12 | #2D3D59 | #E6E2E4 | #8C8A90 | #D7263D | #C98590 |
| space | #000000 | #0B0B0E | #22242B | #F2F2F5 | #8A93A3 | #FF2E3F | #C5CCD8 |
| paper | #F5F2EB | #ECE8DF | #D6D0C3 | #1F1D1A | #6A655C | #B8322A | #2F5E8E |

Roles: bg = content pane; panel = status/side/tabs/code; line = every border; text = body; muted = secondary text; accent = mark, active bars, cursor, links' underline, curve highlight, cpu line; accent2 = dates, dir names, dl keys, types/numbers in code.

## 5. Canvas: process strip (`.proc-c`)

1. Size canvas to its CSS box × devicePixelRatio on init and resize; three rows of 18 CSS px.
2. Three ring buffers of 48 samples, init 0. Every 500ms push: `cpu = clamp(cpu + rand(-8,8) + (rand()<0.06 ? 30 : 0), 3, 97)`; `mem = clamp(mem + rand(-1.5,1.5), 38, 71)` (init 52); `deer`: if `event>0` then `deer = event; event *= 0.6` else `deer = rand(1,8)`; with probability 1/40 set `event = 92`. Write `Math.round(v)+'%'` to the matching `.proc-v`.
3. Draw at most 30fps: `if (t - last < 33) return`. Clear. For each row `r`: `x = (i - 47) * step + scroll` where `step = width/47`, `scroll = step * (t - lastSample)/500` (smooth scrolling); `y = rowTop + 16 - v/100*14`. Stroke polyline 1px: cpu in `--accent`, mem in `--accent2`, deer in `--muted`; when `deer > 40` stroke that segment in `--accent`. Draw a 1px baseline in `--line` per row.
4. Colors via `readColors()`: `getComputedStyle(document.documentElement).getPropertyValue(name).trim()` for `--accent --accent2 --muted --line --text`. Called on init and palette change.
5. `document.hidden` → `cancelAnimationFrame`; on visible restart. `prefers-reduced-motion` → fill buffers once with random walks, draw one frame, no loop, no interval.

## 6. Canvas: margin rain (`.rain`)

1. Canvas fills `.pane` (absolute inset 0, behind tabs and scroll). Skip entirely if `canvas.clientWidth === 0` (mobile).
2. Cell 16×16 px, font `12px IBM Plex Mono`, charset `0123456789abcdef~/$`.
3. Bounds: `r = page.getBoundingClientRect()` relative to the pane; a column at x is active iff `x + 16 <= r.left - 24` or `x >= r.right + 24`. Recompute on resize. Cap active columns at 28 (drop every other column until under the cap). If no margin ≥ 48px, draw nothing.
4. Each active column: `{y: -rand(0,20), speed: rand(1.5,4) cells/s, len: rand(5,10)}`. Each frame `y += speed*dt`. Draw cells `k = 0..len-1` at row `floor(y)-k`: glyph `charset[(col*7 + row*13 + floor(t/400)) % 19]`, `globalAlpha = (0.16 - k*(0.14/len)) * mult` where `mult = 1`, or `0.5` when `body[data-rain="dim"]`. Head (k=0) in `--accent`, rest in `--text`. Reset when `y - len > rows`.
5. Cap 15fps (`t - last < 66`). Pause on hidden. Reduced motion: draw one frame at random `y`, stop.

## 7. Interactions (site.js)

1. Load: `.tree li` animate in (opacity 0, x −6px → 0, 220ms) with `animation-delay: calc(var(--i) * 28ms)`; `.tab.is-active` slides in (x −14px → 0, 260ms, delay 120ms). CSS only.
2. Cat: face is `data-face`; hover/focus shows `data-hover` (CSS `attr()`). Every 6s JS sets `data-face="=-.-="` for 150ms then restores. Click toggles an `Audio('../../../public/chill_guy_man.mp3')`: playing → `data-playing="true"` (shows `data-play` face) and `.now-playing.is-on`; ended/second click → off.
3. Tab close `×` navigates to the parent (plain link).
4. Tree twisty expand/collapse; row hover reveals word count.
5. Copy button: click → `navigator.clipboard.writeText(pre.textContent)`, add `.is-copied` and label `copied` for 1200ms, then `copy`.
6. TOC scroll-spy: IntersectionObserver on article h2/h3 (`rootMargin: "-10% 0px -80% 0px"`, root `.pane-scroll` on desktop) sets `.is-current` on the matching `.toc a`.
7. Big O hover/slider (§9).

## 8. Pages

### index.html (home)
`.page`: `h1` "Murphy Malcolm"; `p.page-sub` "software & platform engineer · umich cs · murph.rip".
`section.fm`: `img.fm-photo` (profile.jpeg, alt "Murphy asleep with a cat") then `dl.fm-kv` rows: name → Murphy Malcolm; host → murph.rip; work → Prism Controls, software & platform engineer; school → University of Michigan, CS; os → Arch Linux (btw); rip → `7 deer, 2 raccoons, 3 cars — <a href="#" title="Tragedy &amp; Pain.">misc/deer.log</a>`; cats → yes.
`div.bio`: the two bio paragraphs verbatim.
`h2.sec` "work" → `ul.work` with two `li.work-item`: `img.work-logo`, `div` (`span.work-co`, `span.work-role`), `span.work-dates`. Then `a.btn` "Download CV" (URL-encoded PDF).
`h2.sec` "latest" → `ol.post-list` with the 5 newest articles as `li.post-row` (§8 row) + `p` `a` "all 16 articles →" to articles.html.

Post row (used everywhere):
```html
<li class="post-row"><time class="post-date" datetime="2026-01-13">2026-01-13</time><a class="post-title" href="#">Binary &amp; Hex</a><p class="post-desc">…verbatim…</p><div class="post-tags"><span class="tag">eecs370</span></div></li>
```
Omit `.post-tags` when the row is already inside a course dir.

### articles.html
`h1` "Articles"; `p.stats` verbatim stats line. `section.group`: `div.group-head` (`img.group-icon` umich-m.svg, `h2.group-name` "University of Michigan - CompSci", `p.group-desc`). Then four `div.dir` in course order: `a.dir-head` (`img.dir-icon`, `span.dir-name` "eecs280/", `span.dir-title` "EECS 280 — Programming and Intro Data Structures", `span.dir-count` "13 files") href eecs280.html (others `#`); then `ol.post-list` newest first, or `p.dir-empty` "No posts in this category yet." for EECS 298. A future non-course group is another `section.group` appended after this one; nothing rendered now.

### eecs280.html
`h1` "EECS 280"; `p.page-sub` "eecs280/ · Programming and Intro Data Structures · 13 files, oldest first". `ol.post-list.is-ordered`, rows oldest first, each with `<span class="post-n">01</span>` before the date. Bottom: `p` link "← all articles".

### article.html
```
article.article
  p.article-meta: <a href="#">eecs281/</a> · <time>2026-01-10</time> · 2.5k words · about 14 min read
  h1 Complexity Analysis &amp; Big(O)
  div.prose: h2/h3 with ids, p, figure.code ×3, figure.fig
  nav.article-nav: <a class="back" href="#">← Back to EECS 281</a>
```
`##`→`h2`, `###`/`####`→`h3`. Ids: `why-should-we-give-a-shit`, `time-vs-space`, `what-is-an-algorithm`, `what-the-fuck-is-complexity-analysis`, `but-what-does-this-mean`.

Code block:
```html
<figure class="code"><figcaption class="code-head"><span class="code-lang">cpp</span><button class="code-copy" type="button">copy</button></figcaption>
<pre><code><span class="t-type">bool</span> <span class="t-fn">duplicate_nested</span>(<span class="t-type">std::vector</span>&lt;<span class="t-type">int</span>&gt; vec) {
  <span class="t-kw">for</span>(…)</code></pre></figure>
```
Tokens: `.t-kw` for if return; `.t-type` bool int std::vector std::unordered_set; `.t-fn` function names at definition and call; `.t-num` numbers; `.t-cm` `// …` comments; `.t-op` `< > == ++ ::`. The ASCII block is the same figure with lang `text`, no tokens.

Big O figure:
```html
<figure class="fig fig-bigo"><figcaption class="fig-head">fig. 1 — operations vs. n for common complexity classes</figcaption>
<div class="fig-body"><svg class="bigo" viewBox="0 0 600 300" role="img" aria-label="Growth of O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)">
  <defs><clipPath id="bigo-clip"><rect x="40" y="10" width="550" height="260"/></clipPath></defs>
  <g class="grid">4 horizontal lines</g><g class="axis">x and y axis lines</g>
  <text class="axis-label" x="590" y="292">n</text><text class="axis-label" x="12" y="18">ops</text>
  <g clip-path="url(#bigo-clip)">for each curve: <path class="curve-hit" data-curve="n2"/><path class="curve curve-n2" data-curve="n2"/></g>
</svg></div>
<div class="fig-foot"><ul class="bigo-legend">6 li > button.bigo-key[data-curve] labels O(1) O(log n) O(n) O(n log n) O(n²) O(2ⁿ)</ul>
<label class="bigo-n">n = <output>10</output><input type="range" min="2" max="20" value="10"></label></div></figure>
```
Curve keys: `c1, logn, n, nlogn, n2, exp`. Algorithm: plot area x 40..590, y 10..270. For slider `N`: `yMax = N*N*1.1`; sample `n` from 1 to N in 0.25 steps; `f`: 1, log2(n), n, n·log2(n), n², 2ⁿ; `x = 40 + (n-1)/(N-1)*550`, `y = 270 - min(f, yMax*1.2)/yMax*260`. Set the same `d` on `.curve-*` and its `.curve-hit`. Hover/focus on `.curve-hit` or `.bigo-key` → add `.has-hi` to svg, `.is-hi` to that curve and key; remove on leave. Recompute on `input`.

### projects.html
`h1` "Tech Stack, Skills, & Projects"; `p.page-sub` intro verbatim. `ul.proj-list` > `li.proj`: `a.proj-name`, `span.proj-status` (`span.dot` + "live"), `p.proj-desc`, `ul.proj-stack` of `li.tag`. `h2.sec` "Technical Skills & Specialties" → `dl.stack` (dt category, dd comma list) six rows.

### snippets.html
`h1` "Code snippets for developers"; `p.page-sub` intro. `ol.post-list` two rows; `.post-tags` has two tags: language, kind.

### resources.html
`h1` "Resources"; three `div.dir` (dir-name `development/`, `design/`, `learning/`; no icon, `.dir-count` "N links"); rows `li.post-row`: `a.post-title` (external, `target="_blank" rel="noopener"`), `p.post-desc`, `span.post-host`.

## 9. Personal placement
Cat: status-bar mascot + Divisible Cat snippet. Deer: `rip` row in frontmatter, `misc/deer.log · 9 entries` in tree, `deer` metric in the process strip. Michigan: frontmatter `school`, umich-m icon on the index group head. Arch: frontmatter `os`, default palette named `arch` with Arch blue. murph.rip: brand in status bar, tree root `~/murph.rip`, frontmatter `host` and `rip` rows (what rests in peace). Bio verbatim on home.

## 10. Checks
500px wide, no horizontal scroll except inside `pre`; every palette body contrast ≥ 4.5:1; keyboard: tree, tabs, cat, palette, copy, legend keys all focusable with visible outline; `prefers-reduced-motion` → no animation, static canvases.
