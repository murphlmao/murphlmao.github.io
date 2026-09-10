# r4 build spec — the composite

Builder: no design decisions are open. `style.css`, `logo-a.svg`, `logo-b.svg`, `logo-c.svg` are final; do not edit. You write seven pages and `site.js`. Copy from `../_brief/content.md` verbatim. Asset root `../../../public/`. Source paths below are relative to `docs/redesign-previews/`. "Lift X" means copy that code and apply only the listed changes.

## 0. Head (every page)

```html
<!doctype html><html lang="en" data-palette="alley" data-logo="orb" data-orb="on" data-bg="on" data-strands="on" data-motes="on" data-paws="on" data-walker="on" data-deer="on" data-raccoon="on">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PAGE · murph.rip</title>
<script>(function(){var d={palette:'alley',logo:'orb',orb:1,bg:1,bgOpacity:55,strands:1,motes:1,bgDim:50,paws:1,walker:1,deer:1,raccoon:1};try{var s=JSON.parse(localStorage.getItem('tweaks')||'{}');for(var k in s)if(k in d)d[k]=s[k]}catch(e){}var h=document.documentElement;h.dataset.palette=d.palette;h.dataset.logo=d.logo;['orb','bg','strands','motes','paws','walker','deer','raccoon'].forEach(function(k){h.dataset[k]=d[k]?'on':'off'});h.style.setProperty('--bg-opacity',d.bgOpacity/100);h.style.setProperty('--bg-dim',d.bgDim/100);window.TWEAKS=d})()</script>
<link rel="icon" id="favicon" href="data:image/svg+xml,LOGO_A_ENCODED">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css"></head>
```

`LOGO_A_ENCODED` = `logo-a.svg` with `currentColor` replaced by `#F5A742`, URL-encoded. JS replaces it on load (§5). Body class per page: `is-home is-articles is-course is-article is-projects is-snippets is-resources`.

Type: IBM Plex Sans body 17/1.65; Plex Mono for meta, dates, labels, code, nav counts, tweak panel. Scale (px, all in CSS): 11 tweak/TOC labels · 12 kicker, tags, code head · 12.5 dates, TOC, footer · 13 meta lines, `.sec`, page-sub · 13.5 code · 14.5 descriptions · 15.5 nav, stats · 17 body · 19 h3 · 20 group name · 24 h2 · 30 h1 · 44 home h1.

## 1. Shell (every page, this order)

```html
<body class="is-home">
<a class="skip" href="#main">Skip to content</a>
<canvas class="scene" aria-hidden="true"></canvas>
<aside class="side">
  <a class="side__brand" href="index.html">
    <span class="side__mark">
      <canvas class="orb" width="40" height="40" aria-hidden="true"></canvas>
      [logo-a.svg inline, add class="mark mark-a"] [logo-b.svg, class="mark mark-b"] [logo-c.svg, class="mark mark-c"]  (all aria-hidden="true")
    </span><span class="side__domain">murph.rip</span></a>
  <div class="side__rule">[cat svg, §4]</div>
  <button class="side__menu" type="button" aria-expanded="false" aria-controls="sidepanel">Menu <svg viewBox="0 0 16 16"><path d="M2 4h12M2 8h12M2 12h12"/></svg></button>
  <div class="side__panel" id="sidepanel">
    <p class="side__intro"><span class="side__name">Murphy Malcolm</span><span class="side__line">Software &amp; platform engineer. CS student at the University of Michigan. Arch btw.</span></p>
    <nav class="side__nav" aria-label="Site"><ul><li><a href="index.html" aria-current="page">Home</a></li><li><a href="articles.html">Articles</a></li><li><a href="snippets.html">Snippets</a></li><li><a href="resources.html">Resources</a></li><li><a href="projects.html">Projects</a></li></ul></nav>
    <!-- article.html only: nav.toc here (§9) -->
    <div class="side__spacer"></div>
    <ul class="side__socials"> 4 × <li><a href="…" aria-label="GitHub" target="_blank" rel="noopener"><svg viewBox="0 0 24 24">…</svg></a></li> GitHub, Spotify, LinkedIn, Instagram; copy the four icon paths from r3-night/index.html .socials__link </ul>
    <details class="tweak">
      <summary>tweaks<span class="tweak__swatch" aria-hidden="true"></span></summary>
      <form class="tweak__form"> §3 </form>
    </details>
    <a class="side__deer" href="#" title="Tragedy &amp; Pain.">Tragedy &amp; Pain.<span class="side__deer-count">7 deer · 2 raccoons · 3 cars</span></a>
  </div>
</aside>
<div class="content">            <!-- article.html: class="content content--read" -->
  <main class="page" id="main">…</main>
  <footer class="foot">
    <div class="foot__walk"><canvas class="critters" aria-hidden="true"></canvas>[walker svg, §10]</div>
    <div class="foot__row"><ul class="foot__nav"><li><a href="articles.html">Articles</a></li><li><a href="snippets.html">Snippets</a></li><li><a href="resources.html">Resources</a></li><li><a href="projects.html">Projects</a></li></ul><p class="foot__copy">© 2026 Murphy Malcolm. All rights reserved.</p></div>
  </footer>
</div>
<audio id="chill" preload="none" src="../../../public/chill_guy_man.mp3"></audio>
<script src="site.js"></script></body>
```

`aria-current="page"` on Articles for articles, eecs280 and article pages. Mobile (<900px, CSS): `.side` is a 56px sticky bar (mark, domain, small cat, `.side__menu`); `.side__panel` is a sheet. JS: lift r3-cat/site.js section "2. menu" unchanged (`.side__menu` toggles `is-open` on `.side`, `aria-expanded`, `is-locked` on body; Escape or a panel link click closes).

## 2. Palettes and variables

`<html data-palette>` selects a set; bare `:root` = alley. `--accent` for fills/strokes/large text, `--accent-text` for small colored text (≥4.5:1 everywhere), `--accent-2` for dates, code types, second strand tone.

| | bg | bg-2 | line | text | muted | accent | accent-text | accent-2 | cat | orb-1 / orb-2 / orb-3 |
|---|---|---|---|---|---|---|---|---|---|---|
| alley | #121016 | #1A171F | #2B2634 | #EDE7DF | #9B939E | #F5A742 | #F5A742 | #8FC7B5 | #3A3344 | #F5A742 / #C4561E / #FFD489 |
| ember | #121016 | #1A171F | #2B2634 | #EDE7DF | #9B939E | #D7263D | #E8546A | #D9A441 | #3A3344 | #D7263D / #7A1220 / #FF7A88 |
| space | #000000 | #0B0B0E | #22242B | #F4F4F8 | #8E93A3 | #FF3B3B | #FF3B3B | #C5CCD8 | #26262F | #FF3B3B / #8A0F1A / #FF9A9A |

Other variables: `--hl`, `--hover`, `--sans`, `--mono`, `--side-w` 272px, `--gutter`, `--w-index` 1040px, `--w-prose` 70ch, `--w-rail` 200px, `--radius`, `--bg-opacity`, `--bg-dim`. JS reads colors with `getComputedStyle(document.documentElement).getPropertyValue(name).trim()`; never hardcode.

## 3. Tweak panel

Inside `form.tweak__form`, in this order. Each row is `<label class="tweak__row"><span>LABEL</span>CONTROL</label>`; ranges wrap control+output in `<span class="tweak__ctl">`. Sub-rows add class `tweak__row--sub`.

| # | label | control (`name`) | writes to `<html>` | default |
|---|---|---|---|---|
| 1 | palette | `select` alley/ember/space (`palette`) | `data-palette` | alley |
| 2 | logo | `select` orb/mark-a/mark-b/mark-c (`logo`) | `data-logo` | orb |
| 3 | orb spin | checkbox (`orb`) | `data-orb` on/off | on |
| 4 | background | checkbox (`bg`) | `data-bg` | on |
| 4a | opacity (sub) | range 0–100 + `<output>` (`bgOpacity`) | `style --bg-opacity` = v/100 | 55 |
| 4b | strands (sub) | checkbox (`strands`) | `data-strands` | on |
| 4c | particles (sub) | checkbox (`motes`) | `data-motes` | on |
| 4d | dim on articles (sub) | range 0–100 + output (`bgDim`) | `style --bg-dim` = v/100 | 50 |
| 5 | paw trail | checkbox (`paws`) | `data-paws` | on |
| 6 | footer cat | checkbox (`walker`) | `data-walker` | on |
| 7 | deer | checkbox (`deer`) | `data-deer` | on |
| 8 | raccoon | checkbox (`raccoon`) | `data-raccoon` | on |
| 9 | `<button type="button" class="tweak__reset">reset</button>` | | | |

JS `initTweaks()`:
- `state = window.TWEAKS` (set by the boot script). `sync()` sets every control from `state` (checkbox `.checked = !!v`, range/select `.value`, output text).
- On `input` (ranges) and `change` (all): `v` = checkbox → 1/0, range → `Number`, select → string. `apply(name, v)`: `state[name]=v`; write the html attribute or style property exactly as the boot script does; `localStorage.setItem('tweaks', JSON.stringify(state))`; `document.dispatchEvent(new CustomEvent('tweakchange', {detail: {key: name, value: v, state: state}}))`.
- Reset: `localStorage.removeItem('tweaks')`; state = the defaults object; write all attributes; `sync()`; dispatch `tweakchange` with `key: 'reset'`.
- Palette or logo change → `setFavicon()` (§5).

Contract for canvas code: listen on `document` for `tweakchange`; read `e.detail.state` (all keys) or `document.documentElement.dataset`. Palette recolor: re-read CSS variables on `key === 'palette' || key === 'reset'`.

## 4. Sidebar cat (night silhouette, cat eyes)

```html
<svg class="cat" viewBox="0 0 48 24" role="button" tabindex="0" aria-pressed="false" aria-label="Cat. Click for a chill guy.">
  <path class="cat__tail" d="M9 16C3 16 2 8 8 9"/>
  <ellipse class="cat__body" cx="24" cy="16" rx="16" ry="7"/>
  <circle class="cat__head" cx="38" cy="11" r="6"/>
  <path class="cat__ears" d="M33 8l2-6 3 5zM39 7l3-6 2 6z"/>
  <g class="cat__eyes">
    <g class="cat__eye" transform="translate(35.8 11.3)"><ellipse class="cat__iris" rx="1.5" ry="1.8"/><ellipse class="cat__pupil" rx=".55" ry="1.3"/></g>
    <g class="cat__eye" transform="translate(40.4 11.3)"><ellipse class="cat__iris" rx="1.5" ry="1.8"/><ellipse class="cat__pupil" rx=".55" ry="1.3"/></g>
  </g>
</svg>
```

Groups: `.cat__tail` (hover flick, CSS), `.cat__ears` (hover twitch, CSS), `.cat__eyes` (CSS scaleY 0→1 on `.cat.is-awake`; `is-blink` class), `.cat__pupil` (JS inline transform). JS: lift r3-cat/site.js section "3. cat" tracking loop (`pending` pointermove processed once per rAF) with these changes:
- Head centre `hx = r.left + r.width*0.79`, `hy = r.top + r.height*0.46`.
- Awake if `d < 220` or `svg.dataset.awake === 'always'`; asleep after 1800 ms unseen.
- Pupils: `px = clamp(dx/120, -0.9, 0.9)`, `py = clamp(dy/160, -0.5, 0.5)`; `pupil.style.transform = 'translate(' + px + 'px,' + py + 'px)'`.
- Load moment: at 300 ms add `is-awake`; at 2600 ms remove unless `lastSeen` within 1800 ms. Blink: every 3–6 s while awake add `is-blink` to `.cat__eyes`, remove on `animationend`. Skip blink under reduced motion.
- Drop stretch, ear-flick timers, bubble, caption, mute button, click counting.
- `.side__deer` `mouseenter` → `is-awake`, pupils `translate(0px,.6px)`, `lastSeen = now`.
- Click, Enter or Space on `.cat`: toggle `#chill` play/pause. Playing → `aria-pressed="true"`, `svg.dataset.awake='always'`; on `pause`/`ended` → `"false"`, delete `dataset.awake`. Never autoplay.

## 5. Logo: orb and marks

`.side__mark` holds the orb canvas and three inline marks; CSS shows the one matching `data-logo`. `initOrb()`:
- `canvas.orb`, `dpr = min(devicePixelRatio, 2)`; backing `40*dpr`, `ctx.setTransform(dpr,0,0,dpr,0,0)`. Tones `T = [--orb-1, --orb-2, --orb-3]` and `G = --bg-2`, read on init and on `tweakchange` palette/reset.
- `draw(t)` (t seconds): `clearRect`; `save`; clip circle (20,20,r 19); fill circle with `T[1]`. For `i` in 0..2: `a = t*(0.35+0.15*i) + i*2.1`; `wob = 1 + 0.18*sin(t*0.9+i*1.7)*cos(t*0.53+i)`; `cx = 20+cos(a)*7*wob`, `cy = 20+sin(a)*7*wob`; `r = 13+3*sin(t*0.7+i*2.3)`; radial gradient (cx,cy,0)→(cx,cy,r) stops `0: T[i] α.95`, `.6: T[i] α.35`, `1: transparent`; fill the clip circle. Then vignette: radial (20,20) r 12→19.5, `transparent`→`G α.85`, fill. Then highlight: radial (14,13) r 7, `#fff α.22`→`transparent`, fill. `restore`.
- Loop: rAF, skip if `now - last < 33`; run only while `data-logo === 'orb'` and `data-orb === 'on'` and not `document.hidden` and not reduced motion; otherwise cancel and `draw(0)` once (static frame). Re-evaluate on `tweakchange` and `visibilitychange`.
- `orbDataURL()`: draw `draw(0)` into an offscreen 32×32 canvas via `drawImage(canvas,0,0,32,32)`; `toDataURL('image/png')`; cache per palette.
- `setFavicon()`: `logo === 'orb'` → `#favicon.href = orbDataURL()`; else `'data:image/svg+xml,' + encodeURIComponent(markSvg.outerHTML.replace(/currentColor/g, accentTextHex).replace(/ class="[^"]*"/, ''))` where `markSvg` is the matching inline `.mark`. Call on load and on palette/logo/reset.

## 6. Background scene (`canvas.scene`)

Lift r3-cat/site.js section "4. scene" whole. Changes:
- Variable name `--accent-2` (already). `isArticle = body.is-article` keeps counts (3 strands / 20 motes); remove `ctx.globalAlpha = 0.5` — CSS opacity `--bg-opacity × --bg-dim` handles it.
- Alphas: strands `.22`, motes `.40`, paws `0.6*(1-age/2500)`.
- Flags from `html.dataset`: `bg`, `strands`, `motes`, `paws`. `drawYarn` only if `bg && strands`; `drawMotes` only if `bg && motes`; `onMove` ignored unless `paws`. Loop runs if any of (bg&&strands, bg&&motes, paws) is on; else cancel rAF and `clearRect`.
- `document.addEventListener('tweakchange', …)`: re-read flags, `readColors()`, start/stop the loop, clear `paws` array if paws turned off.
- Keep: 30 fps cap, `dpr ≤ 1.5`, resize debounce, pause on hidden, reduced motion = one static frame and no paw listener.

## 7. Pen-drawn scene (`canvas.pen`)

Copy from r3-fieldnotes/site.js the objects `CAT`, `CAT_SMALL_HEAD`, `CAT_SMALL_EYES`, `CAT_SMALL_NOSE`, `CAT_OFFSET`, `BLOCK_M`, `SCENES` (lines 252–304) verbatim, and `initScene` (line 306 on). Changes to `initScene`:
- Selector `canvas.pen`; `data-scene` per page: home `home`, articles+eecs280 `book`, article `bigo`, projects `prompt`, snippets `catslash`, resources `compass`.
- `computeBox`: `cw = canvas.clientWidth`, `ch = canvas.clientHeight`, `k = cw/220`, `bx = 4*k`, `by = -30*k` (scene units 0–216 × 40–170 fill the canvas). Backing store `cw*dpr × ch*dpr`, `dpr ≤ 2`.
- Colors `--text` (ink) and `--accent`. Retrace on `mouseenter` of `.page-head`. Repaint (`render(1)`) on `tweakchange` palette/reset.
- Keep: 600 ms start delay, duration `clamp(total/220, 1.2, 3)` s, 30 fps cap, stop when done, pen tip dot, pause on hidden, reduced motion = `render(1)` once.

## 8. Pages

Page head on every page: `header.page-head > div.page-head__text (…) + canvas.pen[data-scene]`.

**index.html** (`is-home`): page-head text = `p.kicker` "Prism Controls · University of Michigan · Arch btw" · `h1.hero-title` `Murphy <span class="hl">Malcolm</span>` (the `.hl` is the highlighter swipe, CSS). Then `section.bio`: `figure.bio__photo` (img profile.jpeg, alt "Murphy asleep with a cat", figcaption "me, asleep, with a cat.") + `div.bio__text` two `<p>` verbatim. `h2.sec` "work" → `ul.work` > 2 × `li.work-item` (`img.work-logo`, `div` > `span.work-co` + `span.work-role`, `span.work-dates` "June 2022 — Present" / "March 2015 — July 2023") → `a.btn` "Download CV" (URL-encoded PDF). `h2.sec` "latest" → `ol.post-list` with the 5 newest posts (post row below, with `.post-tags` course tag) → `p.more > a[href=articles.html]` "all 16 articles →".

Post row (everywhere): `<li class="post-row"><time class="post-date" datetime="2026-01-13">2026-01-13</time><a class="post-title" href="#">Binary &amp; Hex</a><p class="post-desc">…</p><div class="post-tags"><span class="tag">eecs370</span></div></li>`. Only Complexity Analysis links to `article.html`. Omit `.post-tags` inside a course.

**articles.html** (`is-articles`, scene `book`): head text = `h1` "Articles" + `p.stats` (stats line verbatim). `section.group#umich`: `div.group-head` (`img.group-icon` umich-m.svg alt "", `div` > `h2.group-name` "University of Michigan - CompSci" + `p.group-desc` verbatim) → `div.group-body` > 4 × `div.course#eecs280…` in course order: `div.course-head` (`img.course-icon`, `p.course-code > a[href=eecs280.html]` "EECS 280" (others `href="#"`), `p.course-name`, `p.course-count` "13 articles") + `ol.post-list` newest first; EECS 298 gets `p.empty` "No posts in this category yet." instead. Then `section.group.is-empty#off-syllabus`: `div.group-head` (no icon; `h2.group-name` "Not for school", `p.group-desc` "Articles that aren't tied to a class.") → `div.group-body > p.empty` "Nothing filed here yet."

**eecs280.html** (`is-course`, scene `book`): head text = `a.crumb[href=articles.html]` "← all articles" · `h1` "EECS 280" · `p.page-sub` "eecs280/ · Programming and Intro Data Structures · 13 articles, oldest first". `ol.post-list.is-ordered` 13 rows oldest first, each with `<span class="post-n">01</span>` before the date.

**article.html** (`is-article`, `content--read`, scene `bigo`): §9.

**projects.html** (`is-projects`, scene `prompt`): head = `h1` "Tech Stack, Skills, &amp; Projects" + `p.page-sub` intro verbatim (`<em>my</em>`). `h2.sec` "projects" → `ul.proj-list` > `li.proj` (`a.proj-name[target=_blank rel=noopener]`, `span.proj-status` > `span.dot` + "live", `p.proj-desc`, `ul.proj-stack` > `li.tag`). `h2.sec` "Technical Skills &amp; Specialties" → `dl.stack` six `dt`/`dd` (comma lists).

**snippets.html** (`is-snippets`, scene `catslash`): head = `h1` "Code snippets for developers" + `p.page-sub` intro. `ol.post-list` two rows, `.post-tags` = language tag + kind tag, dates `2025-12-01`, `2025-12-22`.

**resources.html** (`is-resources`, scene `compass`): head = `h1` "Resources". Three × `h2.sec` (development / design / learning) + `ol.post-list.is-plain` > `li.post-row`: `a.post-title[target=_blank rel=noopener]`, `p.post-desc`, `span.post-host`. No date cell; `.is-plain` makes the row a single column.

## 9. Article page

Sidebar gains, after `.side__nav`:
```html
<nav class="toc" aria-label="On this page"><p class="toc__title">On this page</p><ul class="toc__list">
<li><a class="toc__link" href="#why-should-we-give-a-shit">Why Should We Give A Shit?</a></li>
<li class="toc__sub"><a class="toc__link" href="#time-vs-space">Time vs. Space: The Eternal Tradeoff</a></li>
<li><a class="toc__link" href="#what-is-an-algorithm">What Is An Algorithm?</a></li>
<li><a class="toc__link" href="#what-the-fuck-is-complexity-analysis">What. The Fuck. Is. Complexity Analysis?</a></li>
<li class="toc__sub"><a class="toc__link" href="#but-what-does-this-mean">But what does this mean?</a></li></ul></nav>
```
Scroll-spy: lift r3-fieldnotes/site.js `initToc` (state Map, last intersecting heading wins, `rootMargin '-20% 0px -70% 0px'`) but set/remove `aria-current="true"` on `.toc__link` instead of `is-active`; observe `.prose h2, h3, h4` with ids.

Content:
```html
<article class="article">
  <header class="page-head"><div class="page-head__text">
    <p class="article-meta"><a href="articles.html#eecs281">eecs281/</a> · <time datetime="2026-01-10">2026-01-10</time> · 2.5k words · about 14 min read</p>
    <h1>Complexity Analysis &amp; Big(O)</h1></div>
    <canvas class="pen" data-scene="bigo" aria-hidden="true"></canvas></header>
  <div class="prose">…</div>
  <nav class="article-nav"><a class="back" href="articles.html#eecs281">← Back to EECS 281</a></nav>
</article>
```
Prose: `##`→`h2`, `###`→`h3`, `####`→`h4` (CSS adds the `##` prefixes). Ids: `why-should-we-give-a-shit`, `time-vs-space`, `what-is-an-algorithm`, `what-the-fuck-is-complexity-analysis`, `but-what-does-this-mean`. Inline code → `<code>`, `*x*` → `<em>`, `**x**` → `<strong>`. Copy the prose, code blocks and figure markup from r3-terminal/article.html lines 46–106 and change only: meta link href, `figure.code` for the ASCII block gets class `code is-ascii`, the Big O figure keeps its markup exactly.

Code block (terminal): `<figure class="code"><figcaption class="code-head"><span class="code-lang">cpp</span><button class="code-copy" type="button">copy</button></figcaption><pre><code>…</code></pre></figure>`. Tokens: `.t-kw` (bool for if return true false), `.t-type` (int, std::vector, std::unordered_set), `.t-fn` (names at definition and call), `.t-num`, `.t-cm` (`// …`), `.t-op` (`< > == ++ ::`). Copy JS: lift r3-terminal/site.js "copy buttons" block (line 112): `writeText(pre.textContent)`, add `.is-copied` to the figure, label `copied` for 1200 ms.

Big O: markup from r3-terminal/article.html lines 92–101; JS: lift r3-terminal/site.js "Big O figure" block (lines 155–213) unchanged (`curves` c1/logn/n/nlogn/n2/exp, `recompute(N)`, `highlight`/`unhighlight`, slider `input`).

## 10. Footer: critter strip

`.foot__walk` (56px tall, hairline at its bottom) holds `canvas.critters` (absolute, full strip) and the CSS walker cat from r3-cat spec §4b, pasted verbatim (`svg.walker` with `.walker__tail .walker__legs .walker__leg .walker__body .walker__head .walker__ear .walker__eye`). The cat stays CSS-only; `html[data-walker="off"]` hides it. The canvas draws the deer and the raccoon.

`initCritters()`:
- Size: `W = strip.clientWidth`, `H = 56`, `dpr ≤ 1.5`, `setTransform`; resize debounce 150 ms. Canvas has `pointer-events` by default; listen `pointermove` on it and store `mouse = {x: offsetX, y: offsetY}`, `pointerleave` → `mouse = null`.
- Colors: `muted`, `accent`, `text`, `bg` via `readColors()`; re-read on `tweakchange` palette/reset. `colorAlpha(hex, a)`: lift from r3-night/site.js line 87.
- Deer: copy `P_BODY P_NECK P_TAIL P_HEAD_SIDE P_ANTLERS P_LOOK_EARS P_LEGS_A P_LEGS_B P_LEGS_STAND` (r3-night/site.js lines 68–76) and `drawDeer` (lines 281–351). Change: `region.bottom` → `H`, `region.left - 80` → spawn x below, hover box uses `mouse` in canvas coords, `nextLook` interval `rand(8, 20)` s, exit at `x > W + 80` or `x < -80`. Direction: for `dir === -1` wrap the sprite fill in `ctx.translate(x + 64, H - 48); ctx.scale(-1, 1)` instead of `translate(x, H - 48)`.
- Common critter object: `{state: 'gone'|'walk'|'stop', x, dir, nextEnter, legFrame, legTimer, stopUntil, nextStop, stopStart}`. Spawn rule (both): initial `nextEnter = now + rand(4, 10)` s for the deer, `rand(12, 25)` s for the raccoon; afterwards `rand(20, 60)` s. On spawn flip `dir` (alternate sides): `dir === 1` → `x = -80`, else `x = W + 80`. At most one of each. `data-deer="off"` / `data-raccoon="off"` → state `gone`, `nextEnter = Infinity`, not drawn; on turning on → `nextEnter = now + rand(2, 6)` s.
- Deer look trigger: `.side__deer` `mouseenter` → `forceLookUntil = Infinity`, and if the deer is `gone` set `nextEnter = now`; `mouseleave` → `forceLookUntil = now + 1000` (night's behavior).
- Raccoon (box 68×32, feet at y 32, facing right, `translate(x, H - 32)`; `dir === -1` → `translate(x + 68, H - 32); scale(-1, 1)`): speed 7 px/s; `legFrame` toggles every 260 ms; body drawn 1 px higher on frame B (waddle). Every `nextStop = rand(6, 14)` s enter `stop` for 2.2 s: `e = (now - stopStart)/1000`, `headDy = 5 * |sin(π·e/1.1)|` (two dips), legs `STAND`. Then walk, new `nextStop`. Paths, all filled `muted α.75` unless noted:
  - `R_BODY = 'M10 24C8 14 16 6 30 6C42 6 50 9 54 17L54 24C54 26.5 51.5 27 48 27L16 27C12.5 27 10 26 10 24Z'`
  - Tail (stroke, before the body): path `'M12 25C3 21 1 12 8 6'`, `lineWidth 7`, `lineCap round`, stroke `muted α.75`; then the same path with `setLineDash([4.5, 4.5])`, `lineDashOffset 2`, `lineWidth 7.5`, stroke `bg α.7` (stripes); `setLineDash([])`.
  - Head group (translate `(2, headDy)` while stopped): circle `(56, 16) r 7`; ears `R_EARS = 'M50 12l1.5-6 4.5 3.5zM57 9.5l3.5-4.5 2 5.5z'`; snout `R_SNOUT = 'M62 17l6 1.5-5 2.5z'`; mask `R_MASK = 'M50.5 14h11.5a2 2 0 0 1 0 4H50.5a2 2 0 0 1 0-4z'` filled `bg α.7`; eyes `arc(54, 16.2, 1)` and `arc(59.5, 16.2, 1)` filled `text α.9`.
  - `R_LEGS_A = 'M16 26h5l1 6h-5zM24 26h5l-1 6h-5zM38 26h5l1 6h-5zM46 26h5l-1 6h-5z'`, `R_LEGS_B = 'M16 26h5l-1 6h-5zM24 26h5l1 6h-5zM38 26h5l-1 6h-5zM46 26h5l1 6h-5z'`, `R_LEGS_STAND = 'M16 26h5v6h-5zM24 26h5v6h-5zM38 26h5v6h-5zM46 26h5v6h-5z'`. Draw order: tail, legs, body, head group.
- Frame: rAF, 30 fps cap, `dt ≤ 0.1`; `clearRect`; raccoon then deer. Pause on `document.hidden` (cancel rAF, resume with `last = 0`). Reduced motion: draw once — deer at `x = W*0.62` in LOOK pose (night's `forcedX` branch), raccoon at `x = W*0.3` standing, no loop, no listeners.

## 11. site.js order and guards

`initTweaks` → `initMenu` → `initCat` → `initOrb` → `initScene` (background) → `initPen` → `initCritters` → `initCopy` → `initToc` → `initBigO`. Each returns early if its element is missing. No libraries. One `reduce` flag from `matchMedia('(prefers-reduced-motion: reduce)')`.

## 12. Checks

500 px: no horizontal scroll except inside `pre`. Keyboard: nav, cat, tweak controls, copy, legend keys, range all focusable. Reduced motion: static orb, scenes and critters, walker parked, no swipe. Article: sidebar TOC follows scroll; scene dimmed by `--bg-dim`.
