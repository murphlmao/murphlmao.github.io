# r4 spec — resume page (replaces spec-v2 §3)

Builder: resume.html only. Keep the r4 shell untouched (`<head>`, `body.is-resume`, sidebar, `.scene`, footer, tweaks, scripts) and add `<link rel="stylesheet" href="resume.css">` after pages.css. Replace everything inside `main.page` with what is below. Every word of copy comes from `_brief/resume.md` verbatim; the only invented strings are the small UI labels quoted here. No JS: `<details>` does the expanding. The `.cv*`, `.skill-link` and `.stack` rules in pages.css are not used on this page.

Why this shape: a recruiter scans the left mono column (dates, places, group names) and the bold numbers in 30 seconds; an engineer reads the right column top to bottom and opens skills. It is one column with a meta margin, the way a well-set paper CV is, not a card grid and not a rail. Width is the index width (1040): a single-column document gains nothing from 1240, and the sticky rail was what he rejected.

## 1. Page structure

```html
<main class="page" id="main">
<header class="page-head"><div class="page-head__text">
  <p class="kicker">resume</p>
  <h1>Murphy Malcolm</h1>
  <p class="rs-contact"><a href="mailto:murphyjmalcolm@gmail.com">murphyjmalcolm@gmail.com</a> &middot; Ann Arbor, MI &middot; <a href="https://www.murph.rip">murph.rip</a></p>
  <p class="rs-summary">Software Engineer with expertise in … from concept to deployment.</p>
  <a class="btn" href="../../../public/Murphy%20Malcolm%20-%20Resume%20(Public).pdf">Download PDF</a></div>
  <canvas class="pen" data-scene="prompt" aria-hidden="true"></canvas></header>
<div class="rs">
  <h2 class="sec" id="experience">experience</h2>
  <article class="rs-entry" id="rs-prism">…</article>
  <article class="rs-entry" id="rs-kctc-work">…</article>
  <article class="rs-entry" id="rs-consulting">…</article>
  <h2 class="sec" id="education">education</h2>
  <article class="rs-entry" id="rs-umich">…</article>
  <article class="rs-entry" id="rs-grcc">…</article>
  <article class="rs-entry" id="rs-kctc">…</article>
  <p class="rs-certs" id="rs-certs"><span class="rs-certs__label">certifications</span><span class="rs-certs__list">ITF+ &middot; Network+ &middot; Python Specialist</span></p>
  <h2 class="sec" id="skills">skills</h2>
  <div class="rs-skills">…§2…</div>
  <h2 class="sec" id="projects">projects</h2>
  <article class="rs-proj" id="rs-p-vs-file-split">…</article>
  <article class="rs-proj" id="rs-p-wrike">…</article>
  <article class="rs-proj" id="rs-p-create-py-app">…</article>
</div>
</main>
```

### Entry (experience and education share it)

```html
<article class="rs-entry" id="rs-grcc">
  <div class="rs-entry__meta">
    <span class="rs-entry__dates">January 2022 &ndash; April 2025</span>
    <span class="rs-entry__loc">Grand Rapids, MI</span>
    <span class="rs-entry__gpa">GPA 3.90 / 4.00</span>            <!-- only where resume.md gives one -->
  </div>
  <div class="rs-entry__body">
    <h3 class="rs-entry__org">Grand Rapids Community College</h3>
    <p class="rs-entry__role">Computer Support Specialist, A.A.A.S.</p>
    <ul class="rs-entry__bullets"><li>…</li></ul>
  </div>
</article>
```

- Order: Prism, KCTC HelpDesk, Consulting; UMich, GRCC, KCTC. Every bullet verbatim, in file order. Dates joined by an en dash; "Current" stays "Current".
- `<b>` (weight only) around the numbers he wrote: Prism b1 `2`, b4 `5+` and `100+`, b5 `5`; UMich b2 `5+`. Nothing else is bolded.
- `.rs-entry__role` is the title for work and the degree for school. KCTC education: org "Kent Career Technical Center", role "Career &amp; Technical Education (CTE) &mdash; Advanced IT, Networking, &amp; Cybersecurity".
- UMich only, after the bullets: `<ul class="rs-entry__courses"><li class="rs-entry__courses-label">notes on this site</li><li><a href="eecs280.html">EECS 280 <b>13</b></a></li><li><a href="articles.html#eecs281">EECS 281 <b>1</b></a></li><li><a href="articles.html#eecs298">EECS 298 <b>0</b></a></li><li><a href="articles.html#eecs370">EECS 370 <b>2</b></a></li></ul>`.
- `.rs-certs` uses the same two columns as an entry (label in the meta column).

### Project

```html
<article class="rs-proj" id="rs-p-create-py-app">
  <div class="rs-proj__meta">
    <span class="rs-proj__status"><span class="rs-proj__dot"></span>live</span>
    <ul class="rs-proj__stack"><li class="tag">Rust</li><li class="tag">Askama</li><li class="tag">Python</li><li class="tag">GitHub Actions</li></ul>
  </div>
  <div class="rs-proj__body">
    <h3 class="rs-proj__name"><a href="https://github.com/murphlmao/create-py-app" target="_blank" rel="noopener">Create-Py-App</a></h3>
    <p class="rs-proj__desc">CLI Tool to create a standard Python repository structure</p>
    <span class="rs-proj__host">github.com/murphlmao/create-py-app</span>
  </div>
</article>
```

## 2. Skills

Same two columns: group name left, one row per skill right, in the PDF's order. A header row (`work · school · projects`) sits once above the first group. Each row is `name | ● ● ● | count | ▸`. The three dots are the Work / School / Projects matrix the brief asked about, folded into the rows: a separate table would repeat all 24 names to say the same thing, so there is none. Filled dot = at least one evidence line from that bucket; hollow = none. Skills with evidence are `<details>`; skills without are plain `<div>`s with hollow dots, no count, no chevron.

```html
<div class="rs-skills">
  <div class="rs-skills__head" aria-hidden="true"><span>work</span><span>school</span><span>projects</span></div>

  <h3 class="rs-group__name">Programming Languages</h3>
  <div class="rs-group__rows">
    <details class="rs-skill" id="sk-python">
      <summary class="rs-skill__row">
        <span class="rs-skill__name">Python</span>
        <span class="rs-skill__dot is-on" title="work"></span><span class="rs-skill__dot is-on" title="school"></span><span class="rs-skill__dot is-on" title="projects"></span>
        <span class="rs-skill__n">5<span class="sr-only"> places used</span></span>
      </summary>
      <ul class="rs-ev">
        <li><span class="rs-ev__where">work</span><span class="rs-ev__text">Developed CLI utilities, web scrapers, full-stack project templates, and stress testing utilities. <a class="rs-ev__src" href="#rs-consulting">Consulting</a></span></li>
        …
      </ul>
    </details>
    <div class="rs-skill rs-skill--plain"><div class="rs-skill__row"><span class="rs-skill__name">C#</span><span class="rs-skill__dot"></span><span class="rs-skill__dot"></span><span class="rs-skill__dot"></span></div></div>
  </div>
  <h3 class="rs-group__name">Infrastructure</h3>
  <div class="rs-group__rows">…</div>
  …
</div>
```

Mechanics: native `<details>`, so Enter/Space on the focused summary toggles it, Tab reaches the source links once open, any number may be open, nothing to script. Chevron is `summary::after`, rotated by `[open]`. Hover tints the name accent like every other link on the site; no backgrounds. Source links are in-page jumps; the target entry's name tints accent through `:target` and `scroll-margin-top` keeps it clear of the top. Evidence lines are ordered work, school, project, the same order as the dots. `.rs-ev__where` is the bucket word; `.rs-ev__text` is the bullet verbatim (numbers keep their `<b>`); `.rs-ev__src` is the short source name after the text, and CSS prefixes it with an arrow. Row ids are `sk-` plus the slug so a skill can be linked from elsewhere later.

### Data

Source label → link: Prism Controls → `#rs-prism`; KCTC HelpDesk → `#rs-kctc-work`; Consulting → `#rs-consulting`; UMich → `#rs-umich`; GRCC → `#rs-grcc`; KCTC → `#rs-kctc`; project name → `#rs-p-vs-file-split`, `#rs-p-wrike`, `#rs-p-create-py-app`. `bN` = the Nth bullet of that entry in resume.md, verbatim; a project line's text is the project's description sentence. Each row: name · count · dots (work school projects) — lines in display order. Skill names are the PDF's, first letter capitalized. Linux stays plain: "Arch btw" is a sidebar line, not a resume line.

**Programming Languages**
- **Python** · 5 · ●●● — work Consulting b2 → #rs-consulting; school UMich b1 → #rs-umich; school GRCC b1 → #rs-grcc; school KCTC b2 → #rs-kctc; project Create-Py-App → #rs-p-create-py-app
- **Rust** · 1 · ○○● — project Create-Py-App → #rs-p-create-py-app
- **Go** · 1 · ○○● — project VS File Split → #rs-p-vs-file-split
- **JavaScript/TypeScript (React, Next.js)** · 3 · ●○● — work Prism b1 → #rs-prism; work Consulting b1 → #rs-consulting; project Wrike Email Link Translator → #rs-p-wrike
- **C** · 1 · ○●○ — school, text exactly "UMich coursework (EECS 280, 281, 370 notes)" → #rs-umich
- **C++** · 1 · ○●○ — same single line as C
- C# — plain

**Infrastructure**
- **Networking** · 4 · ●●○ — work KCTC HelpDesk b2 → #rs-kctc-work; work Consulting b3 → #rs-consulting; school KCTC b1 → #rs-kctc; school KCTC b2 → #rs-kctc
- **Cybersecurity** · 3 · ●●○ — work Consulting b3 → #rs-consulting; school UMich b2 → #rs-umich; school KCTC b1 → #rs-kctc (the program is "Advanced IT, Networking, & Cybersecurity")
- Azure — plain
- **Git (VCS)** · 2 · ●●○ — work Prism b3 → #rs-prism; school UMich b1 → #rs-umich
- Linux — plain
- **CI/CD** · 3 · ●○● — work Prism b3 → #rs-prism; project VS File Split → #rs-p-vs-file-split; project Create-Py-App → #rs-p-create-py-app
- Ansible — plain
- Terraform — plain

**Principles** — all plain: Object-oriented programming & design (OOP/OOD), RESTful APIs, SOLID, KISS.

**Other**
- Research — plain
- Data analysis — plain
- **Configuration management** · 1 · ●○○ — work Prism b4 → #rs-prism
- **System administration** · 3 · ●●○ — work KCTC HelpDesk b1 → #rs-kctc-work; school GRCC b1 → #rs-grcc; school KCTC b1 → #rs-kctc
- Technical documentation — plain

Totals: 12 expandable, 28 evidence lines, 12 plain.

## 3. Projects placement

A section after skills, not a rail.

- The employer order is experience, education, skills, projects; the PDF has no projects section at all, so they are supporting evidence and belong last.
- Twelve skill rows link into the projects. With a rail, the target is beside or above the trigger and the jump is a no-op; below, the jump is short and visible.
- A sticky rail beside experience competes with the strongest section on the page and reads as a dashboard. It was the rejected look.
- One column prints as one document with no reflow.

## 4. Print (`@media print` in resume.css)

- Hidden: `.side`, `.scene`, `.foot`, `.pen`, `.skip`, `.btn`, `.kicker`, every `canvas`. `.content` loses its margin, padding and max-width; page margin 14mm 16mm.
- Palette variables are overridden at `:root, :root[data-palette]` (later file, equal specificity, so it wins): white background, black text, `#444` muted, `#bbb` hairlines, accents black. Everything that used a variable turns black on white in one rule; dots are black filled or grey rings.
- Sizes drop to document scale: body 10.5pt, name 20pt, `##` heads 9pt, bullets 10pt, meta 8.5pt; meta column 40mm. Entries, skill rows and projects are `break-inside: avoid`; heads `break-after: avoid`.
- Links are plain black text. Every external link already shows its URL or host as text next to it (email, murph.rip, `.rs-proj__host`), so no generated `(url)` suffix is needed.
- `<details>` print in whatever state the reader left them; collapsed, the page is two sheets (name, three roles, three schools, 24 skill rows with dots and counts, three projects). Chevrons are removed in print.

## 5. Responsive

- ≥ 900px: two columns, meta 176px, gap 40px; bodies capped at 660px, skill rows at 620px so the dots sit near the names.
- 641–899px (sidebar becomes the top bar): meta 136px, gap 24px; long dates wrap inside the meta column.
- ≤ 640px: one column. Meta becomes a wrapped inline row above the name (`June 2022 – Current · Lowell, MI`); project status and tags form one row above the project name. Skills header spans the column; dot cells shrink to 50px, labels to 10px. At 500px a row is name ≈ 250px, three 50px cells, count, chevron; the two long names (JavaScript/TypeScript, OOP/OOD) wrap to two lines and the dots stay centered on the row.
- Reduced motion: the chevron transition is already disabled by style.css.

## 6. Checks

- 1440px: contact line under the name, summary at 66ch, PDF button; every section is meta left, text right; the five bold numbers are the only emphasis in the bullets.
- Skills: the header labels sit over the dot columns for every group; 12 rows have a count and chevron, 12 do not; clicking Python opens five lines whose arrows jump to Consulting, UMich, GRCC, KCTC and Create-Py-App, and the target name turns accent.
- Keyboard: Tab lands on each summary in order; Enter opens; Tab then reaches the source links.
- Print preview: black on white, no sidebar or animals, two pages with everything collapsed.
- 500px: one column, meta rows above names, rows readable, nothing overflows.
