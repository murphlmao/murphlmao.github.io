# r4 spec v2 — home rail, articles views, resume, resources

Builder: `spec.md` still governs everything not named here (head, shell, tweaks, palettes, article page, snippets, eecs280). `pages.css` is final; link it on **every** page after `style.css` and `walker.css`. Copy all text from `../_brief/content.md` verbatim; nothing else may be invented except the small UI labels quoted below. The critter refactor (critters.js, walker.js, sidecat.js) and the four small fixes are someone else's; leave their markup alone. Palettes unchanged (alley, ember, space).

## 0. Nav: Projects → Resume, everywhere

On index, articles, eecs280, article, snippets, resources and the new resume page:

- `.side__nav` last item: `<li><a href="resume.html">Resume</a></li>` (`aria-current="page"` only on resume.html).
- `.foot__nav` last item: `<li><a href="resume.html">Resume</a></li>`.
- Delete `projects.html`.

## 1. Home (index.html)

**Delete** from `main.page`: `h2.sec` "work", the whole `ul.work`, and `a.btn` Download CV. The work rows live on the resume now; the rail below keeps the two names, roles and dates so the home still says where he works.

**Keep** `header.page-head` exactly as is (kicker, hero title, pen). It stays full-width above the two-column area, so the Michigan drawing sits above the rail like a masthead.

**Wrap** everything after the page-head:

```html
<div class="home">
  <div class="home__main">
    <section class="bio">…unchanged…</section>
    <h2 class="sec">latest</h2>
    <ol class="post-list">…5 rows unchanged…</ol>
    <p class="more"><a href="articles.html">all 16 articles &rarr;</a></p>
  </div>
  <aside class="rail" aria-label="At a glance">
    <section class="rail__block">
      <h2 class="rail__label">work</h2>
      <p class="rail__job"><span class="rail__co">Prism Controls</span><span class="rail__role">Software &amp; Platform Engineer</span><span class="rail__dates">June 2022 &mdash; Present</span></p>
      <p class="rail__job"><span class="rail__co">Self Employed</span><span class="rail__role">IT &amp; Software Engineer / Consultant</span><span class="rail__dates">March 2015 &mdash; July 2023</span></p>
      <p class="more"><a href="resume.html">resume &rarr;</a></p>
    </section>
    <section class="rail__block">
      <h2 class="rail__label">courses</h2>
      <ul class="rail__list">
        <li><a href="eecs280.html">EECS 280</a><span class="rail__count">13</span></li>
        <li><a href="articles.html#eecs281">EECS 281</a><span class="rail__count">1</span></li>
        <li><a href="articles.html#eecs298">EECS 298</a><span class="rail__count">0</span></li>
        <li><a href="articles.html#eecs370">EECS 370</a><span class="rail__count">2</span></li>
      </ul>
    </section>
    <section class="rail__block">
      <h2 class="rail__label">writing</h2>
      <p class="rail__stat"><strong class="rail__num">16</strong>articles</p>
      <p class="rail__stat"><strong class="rail__num">31,701</strong>words</p>
      <p class="rail__stat"><strong class="rail__num">2025</strong>since</p>
    </section>
  </aside>
</div>
```

What was left out and why: socials and the deer log are already in the sidebar; role and school are already in the kicker, the sidebar line and the bio; a "listening" link has no real data behind it (content.md has only the Spotify profile URL, already a sidebar icon).

Behaviour (all CSS, in `pages.css`): at ≥1280px `.home` is a grid `minmax(0,1fr) var(--w-rail)` with a 48px gap, and `body.is-home .content` grows by rail + gap so the main column keeps its current width where the viewport allows. Rail blocks stack with hairlines between them. Below 1280px the rail folds under `.more` as one row of three blocks (one column under 560px). Nothing in the rail is hidden at any width: none of it duplicates the sidebar.

## 2. Articles (articles.html)

Head unchanged (h1, `.stats`, pen `book`). After the page-head:

```html
<div class="articles">
  <div class="view-bar">
    <div class="view" role="group" aria-label="Sort articles">
      <button class="view__btn" type="button" data-view="date" aria-pressed="true">by date</button>
      <button class="view__btn" type="button" data-view="class" aria-pressed="false">by class</button>
    </div>
    <span class="view__hint">16 articles</span>
  </div>
  <ol class="post-list is-flat" id="flat">…16 rows, newest first (content.md order)…</ol>
  <div class="groups" id="groups" hidden>
    <section class="group" id="umich">…group-head unchanged…
      <div class="group-body">
        <div class="course" id="eecs280">…course-head unchanged…<ol class="post-list" data-course="eecs280"></ol></div>
        <div class="course" id="eecs281">…<ol class="post-list" data-course="eecs281"></ol></div>
        <div class="course" id="eecs298">…<p class="empty">No posts in this category yet.</p></div>
        <div class="course" id="eecs370">…<ol class="post-list" data-course="eecs370"></ol></div>
      </div>
    </section>
    <section class="group is-empty" id="off-syllabus">…unchanged…</section>
  </div>
</div>
```

The course `<ol>`s ship **empty**; the 16 rows exist once, in `#flat`, and JS moves them. Row markup (no `.post-tags` anywhere on this page):

```html
<li class="post-row" data-course="eecs370">
  <span class="post-course"><img src="../../../public/icons/eecs370logo.jpg" alt="" width="16" height="16">eecs370</span>
  <time class="post-date" datetime="2026-01-13">2026-01-13</time>
  <a class="post-title" href="#">Binary &amp; Hex</a>
  <p class="post-desc">…</p>
</li>
```

`.post-course` uses the course's icon path from content.md and the lowercase code. In the flat list it occupies a margin column exactly as wide as the course rail in grouped view, so date, title and description sit at the same x and width in both views: the FLIP is a pure translate, no text reflow. In grouped view `.groups .post-course` is `display:none`.

**Order.** by date: all 16 newest first. by class: courses in course order, rows newest first within a course (content.md: index newest first; only the category page is oldest first). eecs280.html is unchanged.

**pages.js** (new file, `<script src="pages.js" defer>` after sidecat.js on articles.html only; no libraries):

```
initArticles():
  root = .articles; if none return
  flat = #flat, groups = #groups, btns = .view__btn[], reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  key(row) = row.querySelector('time').getAttribute('datetime')

  setView(view, animate):
    rows = [...root.querySelectorAll('.post-row')]
    1 FIRST  if animate: first = new Map(rows.map(r => [r, r.getBoundingClientRect()]))
    2 MOVE   if view === 'class':
               for each ol[data-course] in groups: ol.append(...rows.filter(r => r.dataset.course === ol.dataset.course))
                 (rows are taken in document order; the flat list is newest first, so each course stays newest first)
               flat.hidden = true; groups.hidden = false
             else:
               rows.sort((a, b) => key(b).localeCompare(key(a)))   // stable: same-day rows keep their course order
               flat.append(...rows); groups.hidden = true; flat.hidden = false
             btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)))
    3 LAST   if !animate || reduce: return
             for each row: last = row.getBoundingClientRect(); dx = first.left - last.left; dy = first.top - last.top
    4 INVERT+PLAY  if |dx| + |dy| >= .5:
               row.animate([{transform: `translate(${dx}px,${dy}px)`}, {transform: 'none'}], {duration: 220, easing: 'ease-out'})
             if view === 'class': for each .group-head, .course-head, .empty inside groups:
               el.animate([{opacity: 0, transform: 'translateY(-6px)'}, {opacity: 1, transform: 'none'}], {duration: 220, easing: 'ease-out'})
             (to date: headers simply vanish with the container; the rows' motion covers it)

  boot:
    saved = localStorage.getItem('articlesView')  (try/catch)
    hash = location.hash.slice(1); jump = /^(umich|off-syllabus|eecs\d{3})$/.test(hash)
    setView(jump ? 'class' : (saved === 'class' ? 'class' : 'date'), false)
    if jump: document.getElementById(hash)?.scrollIntoView()
  click on .view__btn: v = btn.dataset.view; if already pressed return; setView(v, true); localStorage.setItem('articlesView', v)
```

Notes for the builder: `Element.animate` applies the first keyframe before the next paint, so no double-rAF is needed. Measure `first` before any mutation and `last` after all of it, once. Hash jumps force the grouped view for that load without writing localStorage (links from article.html `articles.html#eecs281` and the home rail depend on this). Reduced motion: the swap is instant (step 3 returns).

## 3. Resume (resume.html, replaces projects.html)

`<title>Resume · murph.rip</title>`, `body.is-resume`, pen scene `prompt`. May be wider than the index column (`pages.css` sets 1240px).

```html
<header class="page-head"><div class="page-head__text">
  <h1>Resume</h1>
  <p class="page-sub">I've worked on dozens of projects over the years, so here is a collection of where <em>my</em> specific skill-set lies. Many of them are open-source, so feel free to check them out.</p>
  <a class="btn" href="../../../public/Murphy%20Malcolm%20-%20Resume%20(Public).pdf">Download CV</a></div>
  <canvas class="pen" data-scene="prompt" aria-hidden="true"></canvas></header>
<div class="cv">
  <div class="cv__main">
    <h2 class="sec">experience</h2>
    <ol class="cv-list">
      <li class="cv-item is-now"><span class="cv-org">Prism Controls</span><span class="cv-dates">June 2022 &mdash; Present</span><p class="cv-role">Software &amp; Platform Engineer</p></li>
      <li class="cv-item"><span class="cv-org">Self Employed</span><span class="cv-dates">March 2015 &mdash; July 2023</span><p class="cv-role">IT &amp; Software Engineer / Consultant</p></li>
    </ol>
    <h2 class="sec">education</h2>
    <ol class="cv-list">
      <li class="cv-item is-now"><span class="cv-org">University of Michigan</span><p class="cv-role">Computer Science</p>
        <ul class="cv-courses">
          <li><a href="eecs280.html">EECS 280 <b>13</b></a></li>
          <li><a href="articles.html#eecs281">EECS 281 <b>1</b></a></li>
          <li><a href="articles.html#eecs298">EECS 298 <b>0</b></a></li>
          <li><a href="articles.html#eecs370">EECS 370 <b>2</b></a></li>
        </ul></li>
    </ol>
    <h2 class="sec">skills</h2>
    <dl class="stack">…six dt/dd pairs verbatim from content.md…</dl>
    <p class="cv-hint">Dotted skills link to a project on this page.</p>
  </div>
  <aside class="cv__side">
    <h2 class="sec">projects</h2>
    <ul class="proj-list">
      <li class="proj" id="vs-file-split">
        <a class="proj-name" href="https://github.com/murphlmao/vs-file-split" target="_blank" rel="noopener">VS File Split</a>
        <span class="proj-status"><span class="dot"></span>live</span>
        <p class="proj-desc">…</p>
        <ul class="proj-stack"><li class="tag">Go</li><li class="tag">GitHub Actions</li></ul>
        <span class="proj-host">github.com/murphlmao/vs-file-split</span>
      </li>
      <li class="proj" id="wrike-email-link-translator">…</li>
      <li class="proj" id="create-py-app">…</li>
    </ul>
  </aside>
</div>
```

Rules:

- No logos in the timeline; no dates on education (content.md has none); no bullet points anywhere. A `.cv-item` shows only what exists.
- Timeline dots: `.is-now` = accent (Prism Controls, Michigan); past = muted.
- Skills: inside each `dd`, wrap a skill in `<a class="skill-link" href="#id">` **only** when that exact name appears in a project's tech list. That is four skills: Python → `#create-py-app`, Rust → `#create-py-app`, Go → `#vs-file-split`, GCP → `#wrike-email-link-translator`. Everything else stays plain text (GitHub Actions, Askama, JavaScript, Google Apps Script are not in the skill groups; CI/CD is not GitHub Actions). Hover/focus on a skill link tints that project's name in the rail (CSS `:has`, no JS); click scrolls to it and `:target` keeps the tint. `<details>` per skill group was considered and dropped: four of six groups would open to nothing.
- `.cv__side` is sticky at ≥1100px; below, it stacks under skills.
- Reuses from style.css: `.page-sub`, `.btn`, `.sec`, `.stack`, `.proj-list`, `.proj`, `.proj-name`, `.proj-status`, `.dot`, `.proj-desc`, `.proj-stack`, `.tag`.

## 4. Resources (resources.html)

Head unchanged. Replace each `ol.post-list.is-plain` with:

```html
<h2 class="sec">development</h2>
<ol class="res-list">
  <li class="res" style="--h:150">
    <span class="res__tile" aria-hidden="true">C</span>
    <a class="res__title" href="https://www.conventionalcommits.org/en/v1.0.0/#summary" target="_blank" rel="noopener">Conventional Commits</a>
    <span class="res__host">conventionalcommits.org</span>
    <p class="res__desc">Conventional [Git] commits gives you a framework to make your commit messages useful.</p>
  </li>
  …
</ol>
```

Tile letter = first letter of the title, uppercase. Hue = deterministic from the hostname: `h=0; for each char: h=(h*31+code)>>>0; hue=h%360`. Precomputed, write them inline:

| host | `--h` |
|---|---|
| conventionalcommits.org | 150 |
| thepunctuationguide.com | 334 |
| excalidraw.com | 101 |
| mantine.dev | 77 |
| ui.shadcn.com | 352 |
| youtube.com | 350 |

The three YouTube rows share a hue on purpose (same source), with letters C, T, T. No "why I keep this" notes: content.md has none. Group headers stay `h2.sec`. Snippets untouched.

## 5. Checks

- Every page links `pages.css`; no page links `projects.html`; `resume.html` exists.
- Home at 1440px: rail beside the column, hairlines between the three blocks, bio still 62ch; at 1200px the rail is one row under "all 16 articles →"; at 500px one column.
- Articles: load = by date, flat, margin chips visible. Click by class: rows slide (220ms), Michigan block and course heads fade in, no text reflow, no jump. Click by date: rows slide back. Reload keeps the choice. Open `articles.html#eecs281`: grouped view, scrolled to EECS 281, localStorage untouched. Reduced motion: instant swap.
- Resume: 1440px two columns, projects sticky; hover Python tints Create-Py-App; 500px stacked, dates under names.
- Resources: nine tiles, three identical red tiles under learning, host right of the title (under the description below 560px).
- Keyboard: view buttons, skill links, all titles reachable; `aria-pressed` reflects the view.
