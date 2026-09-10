# r3-cat — build spec

One drawn cat lives in the sidebar. `style.css` and `logo.svg` are final; do not edit them. You write the seven pages and `site.js`. Text from `content.md` verbatim. Use only classes named here.

## 0. Shell (every page)

```html
<!doctype html><html lang="en" data-palette="alley"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PAGE · murph.rip</title>
<script>document.documentElement.dataset.palette=localStorage.getItem('palette')||'alley'</script>
<link rel="icon" href="data:image/svg+xml,ENCODED">  <!-- logo.svg, style="color:#F5A742" on <svg>, URL-encoded -->
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css"></head>
<body class="is-home">
<a class="skip" href="#main">Skip to content</a>
<canvas class="scene" aria-hidden="true"></canvas>
<aside class="side">…§1…</aside>
<div class="content content--wide"><main class="page" id="main">…</main><footer class="foot">…§2…</footer></div>
<script src="site.js"></script></body></html>
```

Body class: `is-home is-articles is-course is-article is-projects is-snippets is-resources`. `.content--wide` everywhere but article.html (`.content--read`).

## 1. Sidebar (all pages), in order

1. `a.side__brand[href=index.html]` → inline logo `class="side__mark"` → `<span><span class="side__domain">murph.rip</span><span class="side__name">Murphy Malcolm</span></span>`
2. `figure.cat-fig` → `button.cat-btn[type=button][aria-label="The cat"]` containing the cat SVG (§4a) then `<span class="cat__bubble" aria-hidden="true">?</span>` → `figcaption.cat-fig__cap` text `resting in peace (.rip)` → `button.cat-mute[type=button][hidden][aria-pressed=false]` text `mute`
3. `button.side__menu[type=button][aria-expanded=false][aria-controls=sidepanel]` → `Menu` + 16px hamburger svg (three `line`s, currentColor).
4. `div.side__panel#sidepanel` containing:
   - `nav.side__nav[aria-label=Site]` → `ul` → `li > a`: Home, Articles, Snippets, Resources, Projects (`index/articles/snippets/resources/projects.html`). Current page `aria-current="page"` (eecs280 and article mark Articles).
   - `div.side__courses` → `p.side__label` `Courses` → `ul` → `li > a`: `<span>EECS 280</span><span class="count">13</span>`; 281/1, 298/0, 370/2. 280 → `eecs280.html`; others `#`.
   - `a.side__deer[href="#"][title="Tragedy & Pain."]` → deer svg (§4c) → `<span><b>7 deer · 2 raccoons</b> across 3 cars <small>Tragedy &amp; Pain.</small></span>`
   - `div.side__socials` → four `a[aria-label][target=_blank][rel=noopener]`, 18px currentColor icons: GitHub, Spotify, LinkedIn, Instagram.
   - `div.side__palette` → `fieldset.palette[aria-label=Palette]` → four `button.palette__dot[type=button][data-palette][aria-label][aria-pressed]` (alley, reverie, space, wolverine), each `style="--dot:ACCENT;--dot-bg:BG"` from §3 → `button.side__theme[type=button][title="Dark only (for now)"][aria-label=Theme]`, moon svg, no-op.
   - `p.side__foot` text `Arch btw.`

## 2. Footer

`footer.foot` → (index.html only) walker svg §4b → inline logo `class="foot__mark"` → `ul.foot__nav` (Articles, Snippets, Resources, Projects) → `p.foot__copy` `© 2026 Murphy Malcolm. All rights reserved.`

## 3. Palettes

`html[data-palette]` picks a variable set in `style.css`; bare `:root` equals `alley`. Dot click → `document.documentElement.dataset.palette = name`; `localStorage.setItem('palette', name)`; `aria-pressed` true on it, false on the rest; `window.dispatchEvent(new Event('palettechange'))`. On load, set `aria-pressed` from storage.

| name | bg | bg-2 | line | text | muted | accent | accent-2 |
|---|---|---|---|---|---|---|---|
| alley (default) | #121016 | #1A171F | #2B2634 | #EDE7DF | #9B939E | #F5A742 | #8FC7B5 |
| reverie | #050407 | #0E0D13 | #2D3D59 | #E6E2E4 | #8C8A90 | #D7263D | #C98590 |
| space | #000000 | #0A0A0E | #22222B | #F4F4F8 | #8E93A3 | #FF3B3B | #5B6B8C |
| wolverine | #0B1426 | #111C33 | #22304F | #EEF1F7 | #93A0B8 | #FFCB05 | #7FA4E0 |

## 4. The cat

### 4a. Main cat. Paste exactly.

```html
<svg class="cat" viewBox="0 0 200 150" role="img" aria-label="A cat, asleep">
  <g class="cat__body"><ellipse cx="108" cy="96" rx="70" ry="34"/></g>
  <g class="cat__tail">
    <path class="cat__tail-outline" d="M166 98 C196 104 194 130 154 131 C124 132 100 133 80 128"/>
    <path class="cat__tail-line" d="M166 98 C196 104 194 130 154 131 C124 132 100 133 80 128"/>
    <circle class="cat__tail-tip" cx="80" cy="128" r="7"/>
  </g>
  <g class="cat__head">
    <circle class="cat__face" cx="66" cy="78" r="32"/>
    <g class="cat__ears">
      <path class="cat__ear cat__ear--l" d="M41 60 L35 26 L63 47 Z"/><path class="cat__ear-in" d="M45 56 L41 35 L59 49 Z"/>
      <path class="cat__ear cat__ear--r" d="M69 47 L97 26 L91 60 Z"/><path class="cat__ear-in" d="M73 49 L91 35 L87 56 Z"/>
    </g>
    <g class="cat__eyes">
      <g class="cat__eye" transform="translate(52 78)"><path class="cat__lid" d="M-8 1 Q0 7 8 1"/>
        <g class="cat__open"><ellipse class="cat__iris" rx="7.5" ry="6"/><ellipse class="cat__pupil" rx="2.4" ry="4.5"/></g></g>
      <g class="cat__eye" transform="translate(80 78)"><path class="cat__lid" d="M-8 1 Q0 7 8 1"/>
        <g class="cat__open"><ellipse class="cat__iris" rx="7.5" ry="6"/><ellipse class="cat__pupil" rx="2.4" ry="4.5"/></g></g>
    </g>
    <path class="cat__nose" d="M62 89 L70 89 L66 94 Z"/>
    <g class="cat__whiskers"><path d="M34 86 L54 90 M34 95 L54 94 M78 90 L98 86 M78 94 L98 95"/></g>
  </g>
</svg>
```

### 4b. Walker (index.html footer)

```html
<svg class="walker" viewBox="0 0 120 60" aria-hidden="true">
  <g class="walker__tail"><path d="M20 32 C6 30 4 14 14 8"/></g>
  <g class="walker__legs"><line class="walker__leg" x1="30" y1="40" x2="30" y2="55"/><line class="walker__leg" x1="42" y1="40" x2="42" y2="55"/><line class="walker__leg" x1="72" y1="40" x2="72" y2="55"/><line class="walker__leg" x1="84" y1="40" x2="84" y2="55"/></g>
  <g class="walker__body"><rect x="18" y="22" width="74" height="24" rx="12"/></g>
  <g class="walker__head"><circle cx="97" cy="24" r="13"/><path class="walker__ear" d="M87 15 L85 3 L95 11 Z"/><path class="walker__ear" d="M99 11 L109 3 L107 15 Z"/><ellipse class="walker__eye" cx="102" cy="24" rx="1.8" ry="2.8"/></g>
</svg>
```
CSS-animated; no JS.

### 4c. Deer (sidebar)

```html
<svg class="deer" viewBox="0 0 32 32" aria-hidden="true">
  <g fill="currentColor"><rect x="9" y="12" width="17" height="9" rx="4.5"/><path d="M12 14 L9 6 L4 5 L2 7 L3 9 L7 10 L8 15 Z"/><circle cx="26" cy="13" r="2"/></g>
  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 21v7M15 21v7M20 21v7M24 21v7"/><path d="M7 5V1M7 3L5 1M7 3l2-1"/></g>
</svg>
```

### 4d. Animations (CSS; JS toggles classes)

| group | trigger | transform | duration |
|---|---|---|---|
| `.cat__body` | always | breathe: scale(1,1)→(1.012,1.035), origin bottom | 3.4s alternate loop |
| `.cat__head` | always | translateY 0→-1.5 | 3.4s alternate loop |
| `.cat__ear--l` / `--r` | JS adds `is-flick` (random ear) every 6–14s; remove on `animationend` | rotate 0→∓16°→0, origin ear base | .35s |
| `.cat__open` | `.cat.is-awake` | scaleY 0→1 (eyes open) | .18s |
| `.cat__eyes` | JS adds `is-blink` every 3–6s while awake; remove on `animationend` | scaleY 1→.08→1 | .16s |
| `.cat__body`, `.cat__tail` | `.cat.is-stretch` for 900ms | body scale(1.07,.94) origin left-bottom; tail rotate -10° | .9s |
| `.cat__head` | `.cat.is-vibe` while audio plays | rotate ±3° | .5s alternate loop |
| `.cat__bubble` | `is-on` for 900ms | fade + rise | .2s |

Reduced motion (`matchMedia('(prefers-reduced-motion: reduce)')`): skip flick, blink, stretch timers. Tracking still runs.

### 4e. JS for every `.cat`

Load: at 300ms add `is-stretch` + `is-awake`; remove `is-stretch` at 1200ms, `is-awake` at 2600ms unless `lastSeen` is within 1800ms.

Tracking on `pointermove` (process once per rAF):
1. `r = svg.getBoundingClientRect()`; head centre `hx = r.left + r.width*0.33`, `hy = r.top + r.height*0.52`.
2. `dx = clientX - hx`, `dy = clientY - hy`, `d = Math.hypot(dx, dy)`.
3. If `d < 260` or `svg.dataset.awake === 'always'`: add `is-awake`, `lastSeen = performance.now()`.
4. Else if `now - lastSeen > 1800`: remove `is-awake`.
5. `px = clamp(dx/40, -4, 4)`, `py = clamp(dy/60, -1.5, 1.5)`; each `.cat__pupil` in this svg: `style.transform = 'translate(' + px + 'px,' + py + 'px)'`.
6. Sidebar cat: `.cat-fig__cap` text = awake ? `disturbed.` : `resting in peace (.rip)`.

`.side__deer` `mouseenter` → sidebar cat: `is-awake`, pupils `translate(0px,1.5px)` (looks down at the deer), `lastSeen = now`. `.cat-btn` `focus` → same, pupils `(0,0)`.

Click on `.cat-btn`:
- Count clicks; reset if >10s since the last.
- Odd (1,3): bubble text `?`, `is-on` 900ms. Even (2,4): `is-stretch` 900ms.
- 5th, or long press (`pointerdown`→`pointerup` ≥600ms; suppress the click): `chill()`, reset.
- `chill()`: if `localStorage.catMuted === '1'` → bubble `…` 900ms, return. Else lazily `audio = new Audio('../../../public/chill_guy_man.mp3')`. If playing → `pause()`, `currentTime = 0`, remove `is-vibe`. Else `play()`, add `is-vibe` + `is-awake`; on `ended` remove `is-vibe`. Unhide `.cat-mute`; `localStorage.catSeen = '1'` (on load, if set, unhide).
- `.cat-mute` click: toggle `localStorage.catMuted` `'1'`/`'0'`, `aria-pressed`, text `mute`/`unmute`; pause if playing.

TOC cat: the §4a svg with `data-awake="always"` and `aria-label="A cat, awake"`.

## 5. Background scene (`canvas.scene`)

- Size: `w = innerWidth, h = innerHeight, dpr = min(devicePixelRatio, 1.5)`; canvas `w*dpr × h*dpr`, `ctx.setTransform(dpr,0,0,dpr,0,0)`. Redo on `resize` (debounce 150ms).
- Colors: `getComputedStyle(document.documentElement).getPropertyValue(v).trim()` for `--accent`, `--accent-2`, `--muted`; hex→`rgba()` helper. Read at init and on `palettechange`.
- `article = body.is-article`; `small = innerWidth < 900`.
- **Yarn**: N = (article or small) ? 3 : 5 strands. Each: 4 points `{x,y,vx,vy}` random in viewport, `|v|` 4–9 px/s, random sign. Per frame `p += v*dt`; invert `v` at edges. `moveTo(p0)`, `bezierCurveTo(p1,p2,p3)`, `lineWidth 1.5`; stroke accent α.10 (odd strands), accent-2 α.10 (even).
- **Motes**: M = article ? 20 : small ? 24 : 40. Each `{x,y,r:0.8–1.8,vx:±2,vy:-(6–12)}` px/s. Drift up; at `y < -4` reset to `h+4`, new random `x`. Fill muted α.22.
- **Paw prints** (`pointermove`, mouse only): when ≥48px from the last print: `angle = atan2(dy,dx)`, alternate `side = ±1`, position = pointer + perpendicular `side*6`; push `{x,y,angle,born}`; if `length > 12` `shift()`. Per frame: `age = now - born`; drop if `> 2500`; `a = 0.35*(1 - age/2500)` (×0.5 on article). `translate(x,y) rotate(angle + π/2)`: pad ellipse rx4 ry3 at (0,0), toes r1.6 at (-4.5,-5), (0,-6.5), (4.5,-5). Fill accent α`a`.
- Loop: rAF; return unless `t - last >= 33` (30fps cap); `dt = min((t - last)/1000, 0.1)`; `clearRect`; draw yarn, motes, paws. Article: `ctx.globalAlpha = 0.5`.
- `visibilitychange`: hidden → cancel rAF; visible → reset `last`, restart.
- Reduced motion: one static frame of yarn + motes, no loop, no paw listener.

## 6. Type

`--font-head` Bricolage Grotesque 700/800 (headings); `--font-body` Instrument Sans 16.5px/1.65; `--font-mono` JetBrains Mono (dates, labels, counts, code). Scale (px): 11 labels · 12.5 meta · 13.5 small · 15 descriptions · 16.5 body · 18 lede · 22 section titles · 28 prose h2 · 44 page h1 · 60 hero h1. All from classes; no inline sizes.

## 7. Pages

### index.html (`is-home`)
```
main.page#main
  section.hero
    p.hero__kicker  "Prism Controls · University of Michigan · Arch btw"
    h1.hero__title  "Murphy Malcolm"
    div.hero__bio   two <p>, bio verbatim
    div.hero__row
      figure.hero__fig > img.hero__photo[src=../../../public/profile.jpeg alt="Murphy asleep with a cat" width=64 height=64] + figcaption "supervised."
      a.btn[href=../../../public/Murphy%20Malcolm%20-%20Resume%20(Public).pdf] "Download CV"
      a.btn.btn--ghost[href=https://github.com/murphlmao] "GitHub ↗"
  section.section#work
    div.section__head > h2.section__title "Work"
    ol.timeline > li.timeline__item ×2:
      img.timeline__logo[alt=org] · <div><span class="timeline__role">ROLE</span><br><span class="timeline__org">ORG</span></div> · span.timeline__dates ("June 2022 — Present", "March 2015 — July 2023")
  section.section#latest
    div.section__head > h2.section__title "Latest" + a.section__link[href=articles.html] "All 16 articles →"
    ol.posts > li.post ×5 (newest): span.post__mark "370" · time.post__date[datetime] "Jan 13, 2026" · div.post__body > a.post__title + p.post__desc (Big O → article.html; others "#")
```

### articles.html (`is-articles`)
```
main.page#main
  header.page__head > h1.page__title "Articles" · p.page__stats (stats line verbatim)
  section.group#umich
    div.group__head > img.group__icon[src=../../../public/icons/umich-m.svg alt=""] · h2.group__title "University of Michigan - CompSci" · p.group__desc "Course notes and study resources for UMich computer science classes"
    section.course#eecs280  (then #eecs281, #eecs298, #eecs370, course order)
      div.course__rail > img.course__icon[src alt=""] · a.course__code[href=eecs280.html] "EECS 280" · span.course__count "13 articles" · p.course__desc "Programming and Intro Data Structures" · a.course__more[href=eecs280.html] "Course page →"
      ol.course__list > li.post: time.post__date · div.post__body > a.post__title + p.post__desc (newest first)
      (281/370: course__code is a <span>, no course__more; 298: one li.post.post--empty "No posts in this category yet.")
  section.group.group--empty#off-syllabus
    div.group__head > inline logo svg.group__icon · h2.group__title "Off-syllabus" · p.group__desc "Articles that aren't tied to a course."
    section.course > div.course__rail > span.course__code "Soon" · span.course__count "0 articles" ; ol.course__list > li.post.post--empty "No posts here yet."
```

### eecs280.html (`is-course`)
```
main.page#main
  a.crumb[href=articles.html] "← All articles"
  header.page__head.course-head > img.course-head__icon[src=eecs280logo.png alt=""] · <div> h1.page__title "EECS 280" · p.page__lede "Programming and Intro Data Structures" · p.course__count "13 articles · in course order" </div>
  ol.course__list.course__list--numbered > 13 li.post oldest→newest (starts "What is the Stack?"), markup as articles.html, hrefs "#"
```

### article.html (`is-article`, `content--read`)
```
main.page#main > article.article
  header.article__head > a.crumb[href="#"] "← EECS 281" · h1.article__title "Complexity Analysis & Big(O)" · p.article__meta > time[datetime=2026-01-10] "January 10, 2026" · span.post__mark "EECS 281" · span "about 14 min read"
  div.article__grid
    div.prose  (§8)
    aside.toc[aria-label=Contents] > figure.toc__cat (cat svg, data-awake=always) · p.toc__title "Contents" · ol.toc__list:
      li a[#why] "Why Should We Give A Shit?" > ol.toc__sub > li a[#time-vs-space] "Time vs. Space"
      li a[#algorithm] "What Is An Algorithm?"
      li a[#what] "What. The Fuck. Is. Complexity Analysis?" > ol.toc__sub > li a[#meaning] "But what does this mean?"
  nav.article__nav[aria-label=Article] > a.btn.btn--ghost[href="#"] "← Back to EECS 281"
```
TOC JS: `IntersectionObserver` on `.prose h2,h3,h4`, `rootMargin:'-20% 0px -70% 0px'`; on intersect, `is-current` on the matching `.toc a`, off the others.

## 8. Article body (`.prose`), in order

1. `h2#why` · two paragraphs (`<em>` on *valid*, *worst*, *every other item*; `<code>` on `std::unordered_set`).
2. `figure.code.code--ascii` (as below, lang "text") holding the ASCII block.
3. `<p>As code, this comes out as:</p>` · C++ block 1.
4. Paragraph "While this is a…" · paragraph "So, what's a better way?…" · C++ block 2.
5. `h4#time-vs-space` "Time vs. Space: The Eternal Tradeoff" · paragraph (`<strong>`, `<em>constantly</em>`).
6. `h2#algorithm` · paragraph · `aside.cat-note` > inline logo `svg.cat-note__mark` + `<p>The cat read this section twice to be sure. It is, in fact, that short.</p>`
7. `h2#what` · paragraph (`<code>` on the Google string) · Big O figure (§9) · paragraph "If you also suck at math…" (`<code>n</code>`).
8. `h3#meaning` "But <em>what does this mean</em>? How does this correlate to code?" · paragraph.

Code block:
```html
<figure class="code">
  <figcaption class="code__bar"><span class="code__lang">C++</span><button type="button" class="code__copy" aria-label="Copy code">Copy</button></figcaption>
  <pre><code class="language-cpp">…</code></pre>
</figure>
```
Tokens: `tk-kw` (`bool for int if return true false`), `tk-ty` (`std::vector`, `std::unordered_set`), `tk-fn` identifiers directly before `(`, `tk-num`, `tk-cm` (`//` to line end). Else bare; escape `<` `>`. Example:

```html
<span class="tk-kw">bool</span> <span class="tk-fn">duplicate_nested</span>(<span class="tk-ty">std::vector</span>&lt;<span class="tk-kw">int</span>&gt; vec) {
  <span class="tk-kw">for</span>(<span class="tk-kw">int</span> cursor1 = <span class="tk-num">0</span>; cursor1 &lt; vec.<span class="tk-fn">size</span>(); cursor1++) {
```

Copy JS: `navigator.clipboard.writeText(pre.innerText)`; text `Copied` + `is-done` for 1200ms.

## 9. Big O figure

```html
<figure class="bigo" id="bigo">
  <div class="bigo__frame">
    <svg class="bigo__svg" viewBox="0 0 640 300" role="img" aria-label="Growth of six complexity classes as n increases">
      <g class="bigo__grid"></g><g class="bigo__axis"></g><g class="bigo__curves"></g><g class="bigo__labels"></g>
    </svg>
    <div class="bigo__ctl"><label for="bigo-n">max n</label><input class="bigo__range" id="bigo-n" type="range" min="2" max="20" value="10"><output class="bigo__out" for="bigo-n">10</output></div>
  </div>
  <ul class="bigo__legend"><li><button type="button" class="bigo__key" data-fn="c">O(1)</button></li> …log, n, nlog, n2, exp…</ul>
  <figcaption class="bigo__cap">Operations against input size. Drag the slider; hover or focus a curve.</figcaption>
</figure>
```
`render(N)`:
- `W=640 H=300 padL=40 padR=70 padT=16 padB=28`, `yMax = N*N`.
- fns: `c`→1, `log`→log2 n, `n`→n, `nlog`→n·log2 n, `n2`→n², `exp`→2ⁿ; labels O(1) O(log n) O(n) O(n log n) O(n²) O(2ⁿ).
- Points `n = 1 … N` step 0.25: `x = padL + (n-1)/(N-1)*(W-padL-padR)`, `y = H-padB - min(f,yMax)/yMax*(H-padT-padB)`. When `f > yMax` push the clipped point, stop. Path `M x y L …`.
- `.bigo__grid`: 4 horizontal lines at 25/50/75/100%. `.bigo__axis`: x-axis line at `H-padB`, texts `1` and `N` below it, `n` bottom-right, `n²` top-left.
- Per fn append `path.bigo__hit[data-fn]`, `path.bigo__curve[data-fn]` (same `d`), `text.bigo__label[data-fn]` at the last point (+6px x; if clipped, y = padT+10).
- `pointerenter`/`focus` on `.bigo__hit` or `.bigo__key` → figure `has-active`, every `[data-fn=X]` `is-active`. `pointerleave`/`blur` → remove all. Slider `input` → `output.value = N`, re-render, keep the active fn.
- No colors in JS; CSS uses `--muted` / `--accent`.

### projects.html (`is-projects`)
```
header.page__head > h1.page__title "Tech Stack, Skills, & Projects" · p.page__lede (intro verbatim, <em>my</em>)
section.section > div.section__head > h2.section__title "Projects" ; ul.rows > li.row ×3:
  h3.row__title > a[href=repo target=_blank rel=noopener] · p.row__desc · div.row__meta > span.chip.chip--live "Live" + ul.chips > li.chip per stack item
section.section > div.section__head > h2.section__title "Technical Skills & Specialties" ; dl.skills > dt/dd per group, dd > ul.chips > li.chip
```

### snippets.html (`is-snippets`)
`header.page__head` (h1 "Code snippets for developers", p.page__lede intro) · `ul.rows > li.row` ×2: `h3.row__title > a[href="#"]` · `p.row__desc` · `div.row__meta > time` + `ul.chips` (li.chip "C++", li.chip "markdown"|"interactive").

### resources.html (`is-resources`)
`header.page__head > h1.page__title "Resources"` · `section.res-group` ×3 (Development, Design, Learning): `h2` · `ul.rows > li.row`: `h3.row__title > a[target=_blank rel=noopener]` · `p.row__desc` · `div.row__meta > span` hostname.

## 10. Mobile (≤900px)

CSS turns `.side` into a 56px top bar and `.side__panel` into a sheet. JS: `.side__menu` click → toggle `is-open` on `.side`, `aria-expanded`, `is-locked` on body. `Escape` or a panel link click closes.

## 11. site.js

palette · menu · cat · scene · copy buttons · Big O · TOC observer. Guard each with `if (!el) return`. No libraries.
