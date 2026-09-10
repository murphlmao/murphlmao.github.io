# r3-fieldnotes — build spec

Murphy's course notebook on dark paper. Copy comes from `content.md`, verbatim. All class names below exist in `style.css`; invent none. Asset root: `../../../public/`.

## 0. Files

`index.html articles.html eecs280.html article.html projects.html snippets.html resources.html style.css site.js logo.svg`. Every page: `<!doctype html>`, `lang="en"`, `<meta name="viewport" content="width=device-width,initial-scale=1">`, `<title>`, Google Fonts link, `style.css`, favicon data URI of `logo.svg`, then this boot script BEFORE the stylesheet so palette applies without flash:

```html
<script>document.documentElement.dataset.palette=localStorage.getItem('palette')||'fieldnotes'</script>
```

Fonts: `https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Caveat:wght@500;600&family=JetBrains+Mono:wght@400;500&display=swap`

Roles: body Atkinson Hyperlegible 17px/1.6; headings/nav/entry titles Bricolage Grotesque 700-800; meta/dates/code JetBrains Mono; Caveat ONLY in `.sticky .hand .margin-note .tally-label .course-count .empty .proj-status .fig-cap .more .photo figcaption`, never body. Scale (tokens in CSS): xs 13 / sm 15 / body 17 / lg 20 / hand 20 / h3 23 / h2 29 / h1 clamp(34-44) / display clamp(41-61).

`<body data-page="home|articles|category|article|projects|snippets|resources">`. `site.js` at end of body.

## 1. Palettes

`<html data-palette="...">` selects a `:root[data-palette]` variable set; bare `:root` = `fieldnotes`. Variables: `--bg --bg-2 --ink --ink-2 --line --dot --accent --accent-text --sticky --sticky-ink` (+ derived `--hl`).

| preset | bg | bg-2 | ink | ink-2 | line/dot | accent | accent-text | sticky / sticky-ink |
|---|---|---|---|---|---|---|---|---|
| fieldnotes | #1C1A17 | #262320 | #EDE6D6 | #A39B8E | #3A352E / #3D372F | #F2C94C | #F2C94C | #F2C94C / #1C1A17 |
| reverie | #050407 | #131824 | #E6E2E4 | #8C8A90 | #2D3D59 | #D7263D | #E8546A | #C98590 / #050407 |
| space | #000000 | #121216 | #F4F4F8 | #8B93A1 | #26262B / #2A2A30 | #FF3B3B | #FF3B3B | #FF3B3B / #000000 |
| arch | #0F1216 | #171C22 | #E3E8EE | #8A96A3 | #262D36 / #2A323C | #1793D1 | #1793D1 | #1793D1 / #0F1216 |

Rule: colored TEXT always uses `--accent-text` (all ≥4.5:1 on bg). `--accent` is for strokes, underlines, fills. Link text stays `--ink` with an accent highlighter underline.

## 2. Shell (every page, this order)

```html
<a class="skip" href="#main">Skip to content</a>
<header class="band">
  <canvas class="band-scene" data-scene="SCENE" aria-hidden="true"></canvas>
  <div class="band-inner">
    <div class="band-row">
      <a class="mark" href="index.html" aria-label="murph.rip home">[inline logo.svg]<span>murph.rip</span></a>
      <button class="tool nav-toggle" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu">[icon: M4 7h16M4 12h16M4 17h16]</button>
      <ul class="nav" id="nav"> Home · Articles · Snippets · Resources · Projects (li>a; current page gets aria-current="page") </ul>
      <div class="band-tools">
        <label class="pal"><span class="pal-swatch" aria-hidden="true"></span><span class="visually-hidden">Palette</span>
          <select id="palette"><option value="fieldnotes">field notes</option><option value="reverie">reverie</option><option value="space">space</option><option value="arch">arch</option></select></label>
        <a class="tool deer" href="#" title="Tragedy &amp; Pain.">[deer icon svg.icon, path: M12 21V13 M8 13h8 M8 13C6 9 4 8 3 4 M16 13C18 9 20 8 21 4 M6 6h3 M15 6h3]</a>
        <button class="tool" type="button" aria-label="Theme (dark only)">[icon path: M12 3a9 9 0 1 0 9 9a7 7 0 0 1-9-9]</button>
      </div>
    </div>
    <div class="band-title"> <h1>…</h1> <p class="band-sub">…</p> </div>
  </div>
</header>
<main class="page" id="main">…</main>
<footer class="foot"><div class="foot-inner">
  <a class="foot-mark" href="index.html">[logo svg]</a>
  <ul class="foot-nav">Articles · Snippets · Resources · Projects</ul>
  <span class="foot-cat">=^.^= murph.rip</span>
  <p class="foot-copy">© 2026 Murphy Malcolm. All rights reserved.</p>
</div></footer>
<script src="site.js"></script>
```

Nav toggle (JS): click toggles `.band.is-open` and `aria-expanded`. Palette (JS): on `change` set `document.documentElement.dataset.palette`, `localStorage.palette`, then call `scene.repaint()`; on load set select value from `dataset.palette`.

Section headings everywhere: `<h2 class="sec"><span class="marker" aria-hidden="true"><svg viewBox="0 0 40 24"><path class="marker-stroke" d="M3 13C12 9 22 9 32 12M26 6L33 12L26 18"/></svg></span>TEXT</h2>`. JS: IntersectionObserver (threshold .4, once) adds `.is-in` to each `h2.sec` and `.tally`.

## 3. Scene (site.js, canvas)

Data. Each stroke = `{d, x, y, s, c}`: SVG path string, translate, uniform scale, color key `ink|accent`. Scene box is 200×200 units. `CAT` = 6 strokes (reused):

```
head    M158 100L154 82L165 90Q170 88 175 90L186 82L182 100Q188 110 178 117Q170 120 162 117Q152 110 158 100Z
body    M164 117Q150 130 152 150L188 150Q190 130 176 117
tail    M188 146C199 152 204 140 197 130
eyes    M164 103q2 -2 4 0M172 103q2 -2 4 0
nose    M168 108l2 2l2 -2
whisk   M161 108l-8 -1M161 111l-8 1M179 108l8 -1M179 111l8 1
```
`BLOCK_M` (accent) = `M139.14 164.22l-56.95 -77.86v56.67h22.65v56H0v-56H21.25V55.96H0v-56h82.39l56.75 78.43 56.76 -78.43H278.25v56H256.92v87.07H278.25v56H173.52v-56h22.57V86.36Z` at `x:4 y:50 s:.5`.

Scenes (`data-scene` → strokes, default `x:0 y:0 s:1 c:ink`):
- `home`: BLOCK_M, then CAT.
- `book` (articles, category): `M100 70C85 60 60 58 30 64L30 140C60 134 85 136 100 146` · `M100 70C115 60 140 58 170 64L170 140C140 134 115 136 100 146` · `M100 70L100 146` · `M30 140L24 146L100 154L176 146L170 140` · `M42 84C60 80 78 80 90 84M42 98C60 94 78 94 90 98M42 112C60 108 78 108 90 112` · same three lines mirrored `M110 84C122 80 140 80 158 84M110 98…M110 112…` · bookmark accent `M150 60L150 90L156 84L162 90L162 62`.
- `bigo` (article): axes `M40 40L40 160L170 160` · heads `M34 48L40 40L46 48M162 154L170 160L162 166` · log `M42 158C60 130 110 122 168 118` · n `M42 158L160 90` · n² accent `M42 158C90 156 130 120 150 50` · O accent `M60 60a10 10 0 1 0 .1 0` · parens `M76 52q-5 8 0 16M84 52q5 8 0 16`.
- `prompt` (projects): `M32 60C70 58 130 58 168 60L170 140C130 142 70 142 30 140Z` · `M30 74L170 74` · `M40 67a2 2 0 1 0 .1 0M50 67a2 2 0 1 0 .1 0M60 67a2 2 0 1 0 .1 0` · chevron accent `M46 92L60 102L46 112` · `M68 112L84 112`.
- `catslash` (snippets): CAT at `x:-70`, slash accent `M130 140L160 60`, CAT head+eyes+nose at `x:100 y:20 s:.6` (i.e. a smaller cat head to the right: "cat / 2").
- `compass` (resources): circle `M100 40C135 40 160 65 160 100C160 135 135 160 100 160C65 160 40 135 40 100C40 65 65 40 100 40C104 40 106 40 108 40.5` · needle accent `M118 62L108 100L82 138L92 100Z` · ticks `M100 40v8M100 152v8M40 100h8M152 100h8`.

Algorithm:
1. On load: for each stroke create a hidden `<path>` (`document.createElementNS`) inside one offscreen `<svg>`, set `d`, store `len = getTotalLength()` and the path element (for `getPointAtLength`). `total = Σ len`. Build `Path2D(d)` per stroke.
2. Size: canvas CSS size = band size; backing store × `min(devicePixelRatio, 2)`. Box side `B = min(bandH − 40, 220)` (if width < 760: `B = 88`). Box top-left: `bx = canvasW − ((canvasW − min(canvasW, 1120)) / 2 + 24) − B`; `by = rowH + (bandH − rowH − B) / 2` where `rowH = .band-row` height. Scale factor `k = B / 200`.
3. Draw(progress p ∈ [0,1]): clear; `drawn = p * total`; for each stroke in order with cumulative start `c0`: skip if `drawn ≤ c0`; `ctx.save(); translate(bx + x·k, by + y·k); scale(k·s)`; `lineWidth = 3 / s`, round cap/join, `strokeStyle` = computed `--ink` or `--accent`; if `drawn ≥ c0 + len` → `setLineDash([])`, else `setLineDash([len, len]); lineDashOffset = len − (drawn − c0)`; `stroke(path2d)`; restore. If tracing (p < 1) draw the pen tip: `pt = pathEl.getPointAtLength(drawn − c0)` of the current stroke, filled circle r = 3·k in `--accent`.
4. Timing: start 600 ms after load; `duration = clamp(total / 220, 1.2, 3.0)` s, linear. rAF loop skips frames < 33 ms apart (30 fps). When p reaches 1 draw once and STOP the loop (no idle animation).
5. Colors: read `getComputedStyle(document.documentElement).getPropertyValue('--ink'|'--accent')` at each trace start and in `repaint()` (draw p=1). Palette change calls `repaint()`.
6. Re-trace: `mouseenter` on `.band` restarts from p=0 if not currently tracing.
7. `visibilitychange`: hidden → cancel rAF, remember p; visible → resume. `resize` (debounced 150 ms) → recompute box, redraw at current p.
8. `prefers-reduced-motion: reduce` → draw p=1 once; no rAF, no re-trace.

Cost: loop runs ~2-3 s at load and on hover only; ≤ 13 strokes; one canvas.

## 4. Interactions

1. **Load**: scene traces in (above). Home h1 word "Malcolm" wrapped in `<span class="hl">` gets the highlighter swipe (CSS). Tally marks on home draw in when scrolled into view (`.tally.is-in`; each `<path>` has inline `style="--i:N"`, N = its index).
2. **Mark hover**: `.mark:hover svg` wiggles (CSS). `.band` hover re-traces the scene (JS).
3. **Cat click (easter egg)**: home `.doodle-cat` is a `<button>`; click toggles `.is-awake` (eyes swap from shut arcs to open dots, `.cat-say` appears: "meow") and toggles play/pause of `<audio id="chill" preload="none" src="../../../public/chill_guy_man.mp3">`. Never autoplay.
4. **Section markers** draw on scroll-in. **Copy button** (§7). **Big O hover** (§7).
5. Deer doodle hover startles (CSS).

## 5. Pages

Wide column: `main.page` (max 1120) → `div.page-grid` = `aside.margin` (200px, doodles/asides) + `div.main` (72ch). Pages using per-row left columns (articles, projects, resources) skip `.page-grid` and put content directly in `.page`.

### index.html (`data-page="home"`, scene `home`)
band-title: `<h1>Murphy <span class="hl">Malcolm</span></h1><p class="band-sub">Field notes from a software &amp; platform engineer. Arch btw.</p>`
`.page-grid`:
- `aside.margin`: `figure.photo` (img profile.jpeg alt "Murphy asleep with a cat", figcaption "me, asleep, with a cat") · `button.doodle-cat` (svg.doodle viewBox 140 75 70 80 containing CAT strokes as `<path>`s; eyes path gets class `eye-shut`, plus `<path class="eye-open" d="M166 103a1.5 1.5 0 1 0 .1 0M174 103a1.5 1.5 0 1 0 .1 0"/>`; then `<span class="cat-say hand">meow</span>`) · `svg.doodle.doodle-deer` (viewBox 0 0 48 48, scaled deer icon path ×2) · `div.sticky.tilt-r`: "Arch btw."
- `div.main`: `p.eyebrow` "Hi, I'm Murphy" → bio, two `<p>` verbatim → `ul.socials` (4 `a` with inline 20px svg icons, `aria-label` GitHub/Spotify/LinkedIn/Instagram, in that order) → `h2.sec` "Tragedy &amp; Pain." → `p.meta` "murph.rip — the log." → `div.tally` with three `.tally-row`s: label "deer" n=7, "raccoons" n=2, "cars" n=3 (see tally below) → `p.tally-total.hand` "seven deer, two raccoons, three cars. rest in peace." → `h2.sec` "Latest notes" → `ul.entries` with the 5 newest articles (`li.entry` = `span.entry-date` ISO date · `span.entry-course` course · `h3.entry-title>a` (href article.html for Big O, `#` others) · `p.entry-desc` verbatim) → `a.more` "all 16 notes →" (articles.html) → `h2.sec` "Work" → `ul.work-list` (`li.work` = `img.work-logo` · `div` with `.work-org` + `.work-role` · `span.work-dates`) → `p.work-cta><a class="btn" href="../../../public/Murphy%20Malcolm%20-%20Resume%20(Public).pdf">Download CV</a>`.

Tally: `<div class="tally-row"><span class="tally-label">deer</span><svg class="tally-marks" viewBox="0 0 W 22" data-n="7">`. JS renders: for group g (5 per group), stroke i<4: `M(x) 3V19` at `x = g*44 + 6 + i*8`; 5th stroke diagonal `M(g*44+2) 16L(g*44+34) 6`; width `W = groups*44`. Each `<path>` gets `style="--i:idx"`.

### articles.html (`articles`, scene `book`)
band-title: h1 "Articles", band-sub "Course notes, and soon, things that aren't."
`.page`: `div.sticky` with the stats line verbatim → `section.group` (head: `div.group-head` = `img.group-icon` umich-m.svg · div(`h2.group-name` "University of Michigan - CompSci", `p.group-desc` verbatim); body: `div.group-body` with one `div.course` per course in course order: `div.course-head` (`img.course-icon`, `p.course-code><a href=eecs280.html>EECS 280</a>` (others `#`), `p.course-name`, `p.course-count` "13 notes") + `ul.entries` of that course's articles NEWEST first (no `.entry-course`); EECS 298 gets `p.empty` "No posts in this category yet." instead of the list) → `section.group.is-empty` (head: `h2.group-name` "Not for school", `p.group-desc` "Articles that aren't tied to a class."; body: `p.empty` "Nothing filed here yet.").

### eecs280.html (`category`, scene `book`)
band-title: `p.eyebrow` "EECS 280", h1 "Programming and Intro Data Structures", band-sub "13 notes, in course order."
`.page-grid`: margin = `img.course-icon` eecs280logo.png + `div.sticky` "Start at the stack. It only gets worse." (UI copy) ; main = `ul.entries` all 13 OLDEST first, then `p.more > a` "← all articles".

### article.html (`article`, scene `bigo`) — see §7.

### projects.html (`projects`, scene `prompt`)
band-title: h1 "Tech Stack, Skills, &amp; Projects", band-sub = intro verbatim.
`.page`: `h2.sec` "Projects" → `ul.proj-list` (`li.proj` = `div.proj-side`(`span.proj-status` "live", `p.proj-tags` of `span.tag`) + div(`h3.proj-title>a` href github, `p.proj-desc`)) → `h2.sec` "Technical Skills &amp; Specialties" → `ul.skills` (`li.skill-row` = `span.skill-cat` + `p.skill-items` comma-joined).

### snippets.html (`snippets`, scene `catslash`)
band-title: h1 "Code snippets for developers", band-sub intro verbatim. `.page-grid`: margin = `div.sticky` "one of these is a cat you can divide."; main = `ul.entries` (2 items: date, `h3.entry-title>a href="#"`, `p.entry-desc`, `p.entry-kind` with `span.tag` C++ and `span.tag` markdown|interactive).

### resources.html (`resources`, scene `compass`)
band-title: h1 "Resources", band-sub "Things I send people." `.page`: per group `section.res-group` (`h2.sec` name, `ul.res-list` of `li.res` = `span.res-host` + div(`h3.res-title>a` href, `p.res-desc`)).

## 6. Mobile (≤760px)
Band row = mark + `.nav-toggle`; nav and tools open below via `.is-open`. Scene box 88px, right of the title. `.page-grid` stacks; `.margin` becomes a wrapping row (photo, cat, sticky), deer doodle hidden. Entry rows stack date above title. Margin notes render inline as bordered asides (≤999px). TOC hidden < 1200px.

## 7. Article page

`data-page="article"`, band shrinks to 150px, scene at .7 opacity, no band-title.
```
main.page#main
  div.article-layout
    header.article-head-wrap > div.article-head
      p.eyebrow: <a href="articles.html">EECS 281</a> · January 10, 2026 · about 14 min read
      h1: Complexity Analysis &amp; Big(O)
      div.sticky: description verbatim
    article.prose  (h2/h3/h4 get id attributes for TOC)
    nav.toc aria-label="On this page": p.toc-title "On this page" + ol > li[.depth-3 for h3] > a[href=#id]
```
Prose order: `h2.sec#why` → 2 ¶ → ASCII block → "As code…" ¶ → C++ block 1 → `aside.margin-note.from-cat` ("meow: 0.510s → 0.0006s. she's fast.") → ¶ (O(n²)) → ¶ (Grandma) → C++ block 2 → `div.callout` (balance) → `h2.sec#algorithm` → ¶ → `h2.sec#what` → ¶ ("If you've ever…") → `aside.margin-note.from-cat` ("meow: this is where I lost it") → Big O figure → ¶ → `h3#code` → ¶ → `nav.article-nav`.

Margin note markup: `<aside class="margin-note from-cat"><svg class="doodle" viewBox="148 78 44 44">[CAT head, eyes, nose, whiskers]</svg><p>meow: …</p></aside>`. Place it immediately BEFORE the paragraph it comments on.

ASCII block: `<figure class="code ascii"><figcaption class="code-bar"><span class="code-lang">text</span><button class="code-copy" type="button">copy</button></figcaption><pre><code>…</code></pre></figure>`.

C++ block: same with `code-lang` "C++" and `<code class="lang-cpp">`, hand-tokenized spans: `tk-kw` (bool for int if return true false), `tk-ty` (std::vector std::unordered_set), `tk-fn` (duplicate_nested size count insert …), `tk-num`, `tk-cm` (trailing `// time:` comment), `tk-pn` (`{ } ( ) ; < >`). Copy (JS): click → `navigator.clipboard.writeText(pre.innerText)` → button text "copied", add `.is-done`, revert after 1200 ms.

Callout:
```html
<div class="callout">
  <svg class="callout-balance" viewBox="0 0 80 80" aria-hidden="true">
    <path d="M40 70V22M24 70H56"/><circle class="pivot" cx="40" cy="22" r="3"/>
    <g class="beam"><path d="M10 22H70M10 22L4 40M10 22L16 40M2 40H18M70 22L64 40M70 22L76 40M62 40H78"/>
      <text x="10" y="54">time</text><text x="70" y="54">space</text></g>
  </svg>
  <h4 id="tradeoff">Time vs. Space: The Eternal Tradeoff</h4><p>…verbatim, with <strong> on the O() terms…</p>
</div>
```

Big O figure:
```html
<figure class="fig"><div class="fig-frame">
  <svg class="bigo" id="bigo" viewBox="0 0 560 300" role="img" aria-label="Growth of six complexity classes"></svg>
  <div class="fig-controls"><label for="bigo-n">max n</label><input id="bigo-n" type="range" min="2" max="20" value="10"><output for="bigo-n">10</output></div>
  <ul class="bigo-legend"> six <li><button type="button" data-k="c1|log|n|nlog|n2|exp">O(1)|O(log n)|O(n)|O(n log n)|O(n²)|O(2ⁿ)</button></li> </ul>
</div><figcaption class="fig-cap">some dumbass graph like this</figcaption></figure>
```
JS: plot area x 48..540, y 16..268. `N` from slider; sample n = 1..N step 0.25; `f`: c1=1, log=log2(n), n, nlog=n·log2(n), n2=n², exp=2ⁿ. `yMax = N²`; y clipped (stop the polyline when f > yMax). For each key append `<path class="curve" data-k>` + `<path class="hit" data-k>` (same d) + `<text class="label" data-k>` at the last drawn point (x+6). Axes `path.axis` (`M48 16V268H540`) + `text.axis-label` "n" at (540,286) and "ops" at (14,16). Rebuild `d` on `input`; set `output`. Hover/focus on `.hit` or legend button with key k: add `.is-hot` to `svg.bigo` and to the matching `.curve`, `.label`, legend button; `mouseleave`/blur clears. Stroke colors come from CSS (`var(--accent)`), no JS color reads.

TOC (JS): IntersectionObserver on headings with ids (rootMargin `-20% 0px -70% 0px`); the last intersecting heading's link gets `.is-active`.

Article nav: `<nav class="article-nav"><a class="back" href="articles.html#eecs281">Back to EECS 281</a></nav>`. (`.prev`/`.next` classes exist for other articles.)

## 8. Checks before done
No horizontal scroll at 500px except inside `pre`. Every palette: body text on bg ≥ 4.5:1 (tokens above are verified). Focus rings visible on nav, buttons, select, range, legend. `prefers-reduced-motion`: no dot drift, markers/tally pre-drawn, balance static, scene static.
