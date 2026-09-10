# r3-night build spec — "murph.rip at night"

Build seven pages from this spec using `style.css` (final, do not edit) and `logo.svg`. Write `site.js` from section 8-10. Content comes verbatim from `../_brief/content.md`; never invent copy beyond labels quoted here. Asset root is `../../../public/`.

## 1. Head (every page)

```html
<!doctype html><html lang="en" data-palette="night"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PAGE TITLE — murph.rip</title>
<script>try{var p=localStorage.getItem('palette');if(p)document.documentElement.dataset.palette=p}catch(e){}</script>
<link rel="icon" href="data:image/svg+xml,…logo.svg URL-encoded…">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css"></head>
```

Type: Fraunces = wordmark, h1-h4, post titles. Source Sans 3 = body 17px/1.6. JetBrains Mono = dates, labels, code, TOC title. Scale is in `style.css` `--fs-0..6` (13/15/17/20/24/30/40).

## 2. Shell (every page, this exact order)

```html
<body>
<canvas class="scene" aria-hidden="true"></canvas>
<div class="shell">            <!-- article.html: class="shell shell--article" -->
  <aside class="panel">
    <div class="panel__inner">
      <div class="panel__band">
        <a class="brand" href="index.html"><svg class="brand__mark" viewBox="0 0 32 32">…logo.svg paths…</svg>
          <span class="brand__name"><span style="--i:0">m</span>…one span per letter of murph.rip, --i 0..8…</span></a>
        <div class="brand__rule">
          <svg class="cat" viewBox="0 0 48 24" role="button" tabindex="0" aria-pressed="false" aria-label="Cat. Click for a chill guy.">
            <path class="cat__tail" d="M9 16C3 16 2 8 8 9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            <ellipse cx="24" cy="16" rx="16" ry="7" fill="currentColor"/><circle cx="38" cy="11" r="6" fill="currentColor"/>
            <path class="cat__ears" d="M33 8l2-6 3 5zM39 7l3-6 2 6z" fill="currentColor"/></svg>
        </div>
        <p class="intro"><span class="intro__name">Murphy Malcolm</span>
          <span class="intro__line">Software &amp; platform engineer. CS student at the University of Michigan. Arch btw.</span></p>
        <a class="deer-log" href="#" title="Tragedy &amp; Pain.">Tragedy &amp; Pain.<span class="deer-log__count">7 deer · 2 raccoons · 3 cars</span></a>
      </div>
      <nav class="nav" aria-label="Primary"><ul class="nav__list">
        <li><a class="nav__link" href="index.html">Home</a></li>   <!-- aria-current="page" on the current page -->
        <li><a class="nav__link" href="articles.html">Articles</a></li>
        <li><a class="nav__link" href="snippets.html">Snippets</a></li>
        <li><a class="nav__link" href="resources.html">Resources</a></li>
        <li><a class="nav__link" href="projects.html">Projects</a></li></ul></nav>
      <!-- article.html only: <nav class="toc"> here, see 6 -->
      <div class="panel__spacer"></div>
      <div class="panel__util">
        <ul class="socials"> 4 × <li><a class="socials__link" href="…" aria-label="GitHub"><svg>…simple-icons style path, 24 viewBox…</svg></a></li> order: GitHub, Spotify, LinkedIn, Instagram </ul>
        <div class="tools">
          <fieldset class="palette"><legend class="palette__legend">Palette</legend>
            <button type="button" class="palette__swatch" data-set="night" aria-label="Night palette" aria-pressed="true"></button>
            … data-set="space" "Space palette", "reverie" "Reverie palette", "aurora" "Aurora palette" …</fieldset>
          <button type="button" class="mode-toggle" title="Dark only, for now" aria-label="Light mode (dark only for now)"><svg viewBox="0 0 24 24">…moon path…</svg></button>
        </div></div>
    </div></aside>
  <main class="main"><div class="page"> …page content… 
    <footer class="foot"><svg class="foot__mark" viewBox="0 0 32 32">…logo…</svg>
      <ul class="foot__links"> Articles · Snippets · Resources · Projects (same hrefs) </ul>
      <p class="foot__copy">© 2026 Murphy Malcolm. All rights reserved.</p></footer>
  </div></main></div>
<div class="toast" hidden role="status"></div>
<audio id="chill" preload="none" src="../../../public/chill_guy_man.mp3"></audio>
<script src="site.js"></script></body></html>
```

`articles.html` nav "Articles" is current on articles, eecs280 and article pages.

## 3. Palettes → `data-palette`

`<html data-palette>` selects one `:root[data-palette=…]` block; bare `:root` = night. Variables: `--bg --surface --line --text --muted --accent --link`.

| set | bg | surface | line | text | muted | accent | link |
|---|---|---|---|---|---|---|---|
| night (default) | #0B0E17 | #121728 | #232B44 | #E8E6DF | #8E93A6 | #F2B143 | #F2B143 |
| space | #000000 | #0B0B0E | #1E1E24 | #F4F6FA | #8A94A6 | #FF3B4A | #FF3B4A |
| reverie | #050407 | #0F1119 | #2D3D59 | #E6E2E4 | #8C8A90 | #D7263D | #C98590 |
| aurora | #060B0A | #0D1614 | #1F302B | #E3EDE8 | #86A097 | #5CE0A8 | #5CE0A8 |

Switcher JS: on `.palette__swatch` click → `html.dataset.palette = btn.dataset.set`; `localStorage.setItem('palette', set)`; set `aria-pressed="true"` on it, `"false"` on siblings; `document.dispatchEvent(new CustomEvent('palettechange'))`. On load, sync `aria-pressed` to the current `data-palette`. `.mode-toggle` does nothing.

## 4. Pages

**index.html** (`.page` content):
1. `<p class="kicker">Here lies</p>` `<h1 class="title">Murphy Malcolm</h1>`
2. `<section class="bio">` → `<figure class="bio__photo"><img src="../../../public/profile.jpeg" alt="Murphy asleep with a cat"><figcaption>me, with cat.</figcaption></figure>` + `<div class="bio__text">` two `<p>` bio verbatim.
3. `<section class="section">` → `<p class="kicker">Work</p>` `<ul class="work">` 2 × `<li class="work__item"><img class="work__logo" src=…><div><span class="work__org">Prism Controls</span><span class="work__role">Software &amp; Platform Engineer</span></div><span class="work__dates">June 2022 – Present</span></li>` then `<a class="btn" href="../../../public/Murphy%20Malcolm%20-%20Resume%20(Public).pdf">Download CV</a>`.
4. `<section class="section">` → `<p class="kicker">Latest notes</p>` `<ul class="post-list">` 5 newest posts (Binary & Hex → Recursion), each `<li class="post"><span class="post__date">2026-01-13</span><h3 class="post__title"><a href="article.html">…</a></h3><span class="post__course">EECS 370</span><p class="post__desc">…</p></li>`; only Complexity Analysis links to `article.html`, others `#`. Then `<a class="more" href="articles.html">All 16 articles →</a>`.
5. footer.

**articles.html**: `<h1 class="title">Articles</h1>` `<p class="stats">` stats line verbatim. Then one `<section class="group" id="umich">`:
- `<header class="group__head"><img class="group__icon" src="../../../public/icons/umich-m.svg" alt=""><div><h2 class="group__title">University of Michigan - CompSci</h2><p class="group__desc">Course notes and study resources for UMich computer science classes</p></div></header>`
- 4 × `<section class="course" id="eecs-280">` (ids eecs-280/281/298/370, course order): `<div class="course__mark"><img class="course__icon" src=…><p class="course__code"><a href="eecs280.html">EECS 280</a></p><p class="course__name">Programming and Intro Data Structures</p><p class="course__count">13 notes</p></div><ul class="post-list course__posts">` posts of that course **newest first**, same `.post` markup minus `.post__course`. EECS 298: `<p class="empty">No posts in this category yet.</p>` instead of the list. Only EECS 280 links to `eecs280.html`; others `href="#"`.
Grouping design: the sticky course mark (icon, code, count) rides beside its posts; a future non-course group is simply a second `.group` after this one (rule + 64px gap, styled already). Do not render an empty second group.

**eecs280.html**: `<p class="crumb"><a href="articles.html">Articles</a> / EECS 280</p>` → `<header class="course-hero"><img src="../../../public/icons/eecs280logo.png" alt=""><div><h1 class="title">EECS 280</h1><p>Programming and Intro Data Structures · 13 notes, in course order</p></div></header>` → `<ol class="post-list post-list--numbered">` 13 posts **oldest first**, each `<li class="post"><span class="post__num">01</span><span class="post__date">…</span><h3 class="post__title">…</h3><p class="post__desc">…</p></li>`.

**projects.html**: `.title` "Tech Stack, Skills, & Projects", `.lede` intro verbatim. `<p class="kicker">Projects</p><ul class="proj-list">` 3 × `<li class="proj"><h2 class="proj__title"><a href=URL>Name</a><span class="proj__status">Live</span></h2><p class="proj__desc">…</p><p class="proj__stack"><span class="tag">Go</span><span class="tag">GitHub Actions</span></p></li>`. Then `<p class="kicker">Technical Skills &amp; Specialties</p><dl class="skills">` 6 × `<div class="skills__row"><dt class="skills__label">Languages</dt><dd class="skills__items">Python, Rust, …</dd></div>`.

**snippets.html**: `.title` "Code snippets for developers", `.lede` verbatim, `<ul class="snip-list">` 2 × `<li class="snip"><h2 class="snip__title"><a href="#">Divisible Cat</a></h2><p class="snip__desc">…</p><p class="snip__meta">December 1, 2025 · C++ · markdown</p></li>`.

**resources.html**: `.title` "Resources". Three `<section class="res-group"><h2>Development</h2><ul class="res-list">` items `<li class="res"><h3 class="res__title"><a href=URL>Conventional Commits</a></h3><p class="res__desc">…</p><span class="res__host">conventionalcommits.org</span></li>`.

## 5. article.html

`.shell--article`; panel gains the TOC (section 7) after `.nav`. Content:

```html
<article class="article">
 <header class="article__head">
  <p class="crumb"><a href="articles.html">Articles</a> / <a href="articles.html#eecs-281">EECS 281</a></p>
  <h1 class="article__title">Complexity Analysis &amp; Big(O)</h1>
  <p class="article__meta">January 10, 2026 · <a href="articles.html#eecs-281">EECS 281</a> · about 14 min read</p>
 </header>
 <pre class="ascii" aria-label="ASCII cat"> _._     _,-'""`-._
(-.,`._,'(       |\`-/|
    `-.-' \ )-`( , o o)
          `-    \`_`"'-</pre>
 <div class="prose"> …body… </div>
 <nav class="pager"><a class="pager__back" href="articles.html#eecs-281">← Back to EECS 281</a></nav>
</article>
```
Body: h2/h3/h4 with ids (`why-should-we-give-a-shit`, `time-vs-space`, `what-is-an-algorithm`, `what-the-fuck-is-complexity-analysis`, `what-does-this-mean`). Inline code → `<code>`; italics `<em>`, bold `<strong>`. Prev/next unused here; `.pager__prev/.pager__next` exist in CSS.

**Code block** (three: text diagram, two cpp):
```html
<figure class="code"><figcaption class="code__bar"><span class="code__lang">cpp</span>
<button type="button" class="code__copy">Copy</button></figcaption>
<pre><code class="lang-cpp"><span class="tk-kw">bool</span> <span class="tk-fn">duplicate_nested</span>(<span class="tk-type">std::vector</span>&lt;<span class="tk-kw">int</span>&gt; vec) {
  <span class="tk-kw">for</span>(<span class="tk-kw">int</span> cursor1 = <span class="tk-num">0</span>; …
<span class="tk-cm">// time: ~0.510 seconds for 10,000 items</span></code></pre></figure>
```
Token classes: `tk-kw` (bool int for if return true false), `tk-type` (`std::vector`, `std::unordered_set`), `tk-fn` (function names and `.size .count .insert`), `tk-num`, `tk-str`, `tk-cm`. The text diagram uses lang "text", no tokens. Copy: click → `navigator.clipboard.writeText(figure.querySelector('pre').innerText)` → button text "Copied", `data-state="done"`, restore "Copy" and remove attr after 1500 ms; on rejection text "Copy failed".

**Big O figure** (replaces the `[INTERACTIVE…]` line):
```html
<figure class="fig" id="bigo"><div class="fig__frame">
 <svg class="bigo" viewBox="0 0 640 300" role="img" aria-label="Growth of common complexity classes">
  <path class="bigo__axis" d="M40 270H620M40 270V20"/>
  <text class="bigo__tick" x="40" y="288">1</text><text class="bigo__tick" data-tick="mid" x="330" y="288" text-anchor="middle">n/2</text><text class="bigo__tick" data-tick="max" x="620" y="288" text-anchor="end">n</text>
  <g clip-path="url(#bigo-clip)"><clipPath id="bigo-clip"><rect x="40" y="20" width="580" height="250"/></clipPath>
   6 × <path class="bigo__hit" data-key="n2"/><path class="bigo__curve" data-key="n2"/></g>
  6 × <text class="bigo__label" data-key="n2" text-anchor="end"/>
 </svg>
 <ul class="bigo__legend"> 6 × <li><button type="button" class="bigo__key" data-key="n2" aria-pressed="false">O(n²)</button></li></ul>
 <div class="bigo__ctl"><label for="bigo-n">max n</label><input class="bigo__range" id="bigo-n" type="range" min="2" max="20" value="10"><output for="bigo-n">10</output></div>
</div><figcaption class="fig__cap">Operations vs. input size. Hover a curve.</figcaption></figure>
```
Keys/functions/labels: `c` f=1 "O(1)"; `log` log₂n "O(log n)"; `n` n "O(n)"; `nlog` n·log₂n "O(n log n)"; `n2` n² "O(n²)"; `exp` 2ⁿ "O(2ⁿ)". Render(N): plot area x 40..620, y 270..20; yCap = 1.25·N²; sample n from 1 to N step 0.25; x = 40 + (n−1)/(N−1)·580; y = 270 − min(f(n), yCap·2)/yCap·250. Same `d` on hit and curve. Label at the last sample with y ≥ 20 (x = that x − 4, y − 6); 2ⁿ label sits where it exits the top. Set `[data-tick="mid"]` text to `Math.round(N/2)` and `[data-tick="max"]` to N. Hover: `mouseenter` on `.bigo__hit` or `.bigo__key` → `svg.dataset.active = key`, `aria-pressed` true on that key; `mouseleave` → remove both. `input` on range → `output` value, re-render. All color comes from CSS (`var(--accent)`), no JS color.

## 6. TOC (article page only, in panel after `.nav`)

`<nav class="toc" aria-label="On this page"><p class="toc__title">On this page</p><ul class="toc__list">` one `<li>` per h2 (`<a class="toc__link" href="#id">`), h3/h4 as `<li class="toc__sub">`. JS: IntersectionObserver on `.prose h2,h3,h4` with `rootMargin: "0px 0px -70% 0px"`; the last heading to intersect gets `aria-current="true"` on its link, others removed. Hidden under 900px by CSS.

## 7. Interactions

1. **Load: engraving.** Wordmark letters fade/settle in with a 45 ms stagger (`--i`, CSS only). Scene: `globalAlpha` for stars ramps 0→1 over the first 1.2 s.
2. **Deer looks at you.** Every 25-50 s the deer stops for 2-4 s in the LOOK pose with two accent-colored eye dots. Hovering the deer (mouse within its 64×48 box) or hovering `.deer-log` forces LOOK until 1 s after the pointer leaves.
3. **Cat.** Hover: tail flick + ear twitch (CSS). Click/Enter/Space: toggle `#chill` play/pause; while playing `aria-pressed="true"` (cat turns accent), toast "just a chill guy." for 2 s; on `ended` reset. Never autoplay.
4. **Palette change fires a shooting star** immediately (`scene.shoot()` on `palettechange`), so recoloring is visibly acknowledged.
5. **Nav bullet**: accent dot scales in on hover/current (CSS).

## 8. Scene algorithm (`site.js`)

Setup:
1. `canvas = .scene`, `ctx = getContext('2d')`. `dpr = min(devicePixelRatio, 1.5)`. On resize (debounced 150 ms): size canvas to its CSS box × dpr, `ctx.setTransform(dpr,0,0,dpr,0,0)`, recompute `region` and rebuild stars + fog.
2. `region`: if `getComputedStyle(canvas).position === 'fixed'` (desktop) → `.panel.getBoundingClientRect()`; else (mobile, canvas is a 200 px absolute band) → the whole canvas. Full scene draws inside `region`; only stars draw outside it.
3. Colors: `readColors()` = `getComputedStyle(document.documentElement)` → `--text`, `--accent`, `--muted` (trimmed). Cache; call on init and on `palettechange`. No per-frame style reads.
4. Objects. Stars: `count = min(220, floor(W·H/9000))`, each `{x,y}` as fractions of full canvas, `r` 0.4-1.4, `depth` ∈ {0.3,0.6,1}, `twinkle` = true for 30 %, `phase` random. Fireflies: 7, positions inside region's lower 70 %, each `{x,y,phase,speed 0.4-0.9}`. Fog: offscreen canvas `2·region.w × 0.3·region.h`, painted once with 5 radial gradients (`--muted` alpha .10 → 0, radii .5-.9 of height) at random x, mirrored copy on the right half so it wraps. Deer: `{x: -80, state: 'walk'|'look'|'gone', legFrame, timers}`. Shooting star: `null` or `{x,y,vx,vy,life}`.

Frame (`requestAnimationFrame`, skip if `now − last < 33` ms → 30 fps cap):
5. `clearRect`. Parallax target = `(mouse − center) / center × 6 px`; `par += (target − par) × 0.05`.
6. Stars: for each, `alpha = twinkle ? 0.45 + 0.45·sin(t·0.8 + phase) : 0.7`; ×0.25 if outside region; ×load ramp. `fillStyle = text`; `r < 0.8` → `fillRect` else `arc`. Offset by `par·depth`.
7. Fog: `drawImage(fog, −((t·6) mod region.w), region.bottom − fog.h)`; second copy shifted by `region.w`.
8. Fireflies: `x += cos(t·speed + phase)·0.35; y += sin(t·speed·0.7 + phase)·0.25`; clamp to region; `glow = max(0, sin(t·1.3·speed + phase))³`; draw `arc r=5` at `accent` alpha `0.35·glow`, then `arc r=1.5` alpha `glow`.
9. Deer: walks right at 12 px/s along `y = region.bottom − 16` (silhouette 64×48, feet at bottom); `legFrame` toggles A/B every 350 ms. Enter `look` at `nextLook` (25-50 s) or when hovered: 2-4 s, LEGS_STAND + HEAD_LOOK + two `accent` eye dots. Past `region.right + 80` → `gone` for 8-15 s, then re-enter at `−80`. Fill `muted` at alpha .75, `HEAD_ANTLERS` as a 1.2 px stroke. Draw order: fog, deer, fireflies (fireflies drift over the deer).
10. Shooting star: spawn at `nextShoot` (20-40 s) or on `shoot()`: start random x in region's top 40 %, `vx=900,vy=450 px/s`, life 0.6 s; draw a 120 px line from (x,y) back along −v with a linear gradient `accent`→transparent, alpha `1 − life/0.6`.

Lifecycle:
11. `visibilitychange`: hidden → `cancelAnimationFrame`, visible → resume (reset `last`).
12. `prefers-reduced-motion: reduce`: draw one frame with the deer at `region.left + 0.62·region.w` in LOOK pose, twinkle off, no parallax, no loop; `shoot()` no-op.
13. `mousemove` on `window` updates `mouse` only (no drawing outside the frame). Deer hover test uses the same mouse against the deer box.

Deer paths (64×48 box, facing right; translate to `(deer.x, y − 48)` before `fill(new Path2D(...))`):
- BODY `M13 24L14 20L46 18L50 22L48 30L18 31Z` · NECK `M44 20L47 10L54 12L50 22Z` · TAIL `M13 22L9 19L12 26Z`
- HEAD_SIDE `M47 10L55 7L61 12L61 15L56 15L52 13Z` · HEAD_ANTLERS (stroke) `M51 8L49 2M51 8L54 3M49 5L46 3M53 5L57 3`
- HEAD_LOOK: `arc(51,9.5,4.5)` + ears `M47 7L45 2L49 6ZM53 6L56 2L55 7Z`; eyes `arc(49.3,9.3,0.9)` and `arc(52.7,9.3,0.9)` in `accent`.
- LEGS_A `M42 29L45 29L47 46L44 46ZM37 29L40 29L36 46L33 46ZM20 29L23 29L27 46L24 46ZM15 29L18 29L14 46L11 46Z`
- LEGS_B `M42 29L45 29L41 46L38 46ZM37 29L40 29L44 46L41 46ZM20 29L23 29L17 46L14 46ZM15 29L18 29L22 46L19 46Z`
- LEGS_STAND `M42 29L45 29L45 46L42 46ZM37 29L40 29L40 46L37 46ZM20 29L23 29L23 46L20 46ZM15 29L18 29L18 46L15 46Z`

Cost target: ≤ 230 fill calls per frame, one canvas, no DOM reads in the loop.

## 9. Other JS

Palette switcher (section 3); copy buttons; Big O; TOC scroll-spy; cat audio + toast (`toast.textContent = msg; hidden=false; setTimeout hide 2000`). Wrap everything in `DOMContentLoaded`; guard each feature with `if (element)` so list pages run without article code.

## 10. Personal content map

- **murph.rip / headstone**: logo (rounded headstone, M cut out), engraved wordmark, "Here lies" kicker over the home h1.
- **Deer**: canvas silhouette + `.deer-log` caption "7 deer · 2 raccoons · 3 cars" in every panel; hover makes it look at you.
- **Cat**: silhouette curled on the wordmark rule (every page), ASCII cat atop the article, Divisible Cat snippet, photo caption "me, with cat."
- **Michigan**: umich-m icon on the articles group, panel intro line, bio verbatim.
- **Arch**: bio verbatim "(Arch btw)", panel intro "Arch btw."
- **Meme audio**: cat click, opt-in only.
- **Profanity**: article descriptions and body verbatim.
