# Brief — murph.rip redesign preview, round two

Round one was rejected. Murphy's words: "holy shit those are all actually terrible. what happened to the minimalism and the colors i gave you earlier? the primary first page needs to be similar-ish to what i have now. all of the article views are impressively shit." And: "i'm open to other colors entirely, and i would encourage you to be explorative and creative with it, but i want minimalism first."

Round one failed because each designer built a genre piece (a terminal, a brutalist poster, a serif book, a SaaS page) and threw away the current site. Do not do that. This round is an evolution of the site Murphy already has.

## Start here

Look at the current site before anything else. Screenshots are in `../_ref/`:
- `current-home.png`, `current-articles.png`, `current-category.png`, `current-article.png`

What is there now: a centered pill nav, name + bio + social icons with a photo on the right, "Latest Posts" beside a "Work" panel with a Download CV button. Articles index has a stats intro, a paginated post list, and a course sidebar. Article page is a centered column, back button, date and course line, title, prose, code blocks with a language label. It is built on the Tailwind "Spotlight" template with zinc greys and a sky-blue accent, Inter throughout.

Murphy likes: the home structure; being able to see at a glance which course an article belongs to; the course sidebar idea. He does not like: the cards on the articles index, and "literally everything else about that page." He wants to also write articles not tied to a course, so the index must have an obvious home for a non-university group without inventing one.

Content is in `content.md` next to this file. Use it verbatim.

## Minimalism first

This is the ruling constraint. Concretely:
- One accent color. It appears on links, the active nav item, focus rings, and the highlighted chart line. Nowhere else.
- No cards. A hairline panel is allowed only where a boundary carries meaning (the Work panel on home may keep a hairline; article lists get none).
- No gradients, glows, or drop shadows. Hairlines at 8-14% of the text color.
- Whitespace groups things. Type size and weight rank them.
- One sans family plus one monospace for code, dates and small labels if your version calls for it. Body 16-17px, line-height 1.6. At most five type sizes on any page.
- Icons only where the current site has them: socials, deer, theme toggle, work logos, course logos.
- Ambient motion is welcome and must be nearly invisible in a screenshot: a slow grain, a very faint drifting gradient, or nothing. CSS `transform`/`opacity` or a low-resolution canvas. Paused when hidden, off under `prefers-reduced-motion`. Never on top of text.
- No entrance animations, no hover lifts, no scroll-triggered fades.
- Before you ship, remove one thing from every page.

## Deliverable: a multi-page site

Your task names a version folder under `docs/redesign-previews/`. Inside it, these files, each a complete standalone HTML document with `<!doctype html>`, `<head>`, and `<body>`:

- `index.html` — home
- `articles.html` — articles index
- `eecs280.html` — category page for EECS 280
- `article.html` — the Complexity Analysis article
- `projects.html`, `snippets.html`, `resources.html`
- `style.css` — shared stylesheet, linked from every page
- `site.js` — only if needed (mobile menu, chart, copy button)

All links between pages are relative (`articles.html`, `index.html`). The deer icon links to `#`. The theme toggle is a no-op. Every page opens correctly from disk via `file://`.

External resources allowed: Google Fonts only. Images come from `../../../public/` as listed in content.md. No CDN scripts.

Dark only. Paint `body` background explicitly.

## Pages

**Home.** Same structure as today. Name, bio, socials, photo on the right (drop or simplify the decorative crossing lines; keep a photo). Latest posts on the left (three or five, your call) with date, title, description, and a read link that is not a "→" or chevron. Work panel with the two roles and Download CV. Footer. You may add one small thing if it earns its place (for example, a short row of the courses Murphy writes about, linking to category pages). Not more than one.

**Articles index.** Rethink this page. Requirements: the reader sees the course groups at a glance; every article shows date, title, one-line description; no cards; the stats intro stays in some form; a sidebar or equivalent lets a reader jump to a course and shows counts; the layout has an obvious place for a second, non-university group later. Newest first within whatever grouping you choose, or grouped by course with the newest course first; state your choice. Pagination is not needed for 16 items.

**Category page (EECS 280).** Course logo, name, description. Articles oldest first, so it reads in course order. Same sidebar as the index. A way back to all articles.

**Article page.** This is judged hardest. Keep the centered reading column (65-72ch). Include: a way back to the course and to all articles; date, course, reading time; title; headings; prose with inline code, emphasis, bold; the ASCII `pre` block; two C++ code blocks with hand-tokenized syntax color (keyword, type, function, comment, number, string), a language label, and a copy button that appears on hover; the interactive Big O figure in a reusable figure frame; a quiet table of contents on the right on wide screens only, from the article's h2/h3/h4, hidden below 1100px; prev/next within the course at the bottom (see content.md for how to handle this article having none). Code blocks are the one place a second background color appears; keep them close to the page color, not a different theme.

**Projects.** Title, intro, the three projects as plain rows (name as link, description, tech list, status), then the tech stack as grouped inline lists. No badges, no chips; tags are comma-separated text or a plain list.

**Snippets.** Title, intro, two rows: title, description, date, language, and whether it is interactive.

**Resources.** Title, three groups, each item as a row: title as link, description, hostname.

## Nav

Pill nav centered with Home · Articles · Snippets · Resources · Projects, active item in the accent. Deer icon and theme toggle on the right. Below 640px the pill collapses to a menu button that opens a simple list; a few lines of JS in `site.js`. Highlight the current page's item on each page.

## Process

1. Look at the four `_ref` screenshots.
2. Write a short design plan in your reply before code: 5 named hex colors and what each is for, the typeface(s) and roles, a type scale, and the articles index layout as an ASCII wireframe. Then ask yourself whether any part is what you would produce for any dark dev site; change that part and say what changed.
3. Build the files. Share everything through `style.css`; page files hold markup only.
4. Screenshot with headless Chrome and look at every page. Command shape:
   ```
   google-chrome-stable --headless=new --disable-gpu --hide-scrollbars --no-sandbox \
     --user-data-dir=/tmp/chrome-$$-$RANDOM --window-size=1440,1400 --virtual-time-budget=6000 \
     --screenshot=/home/murphy/vcs/murphlmao.github.io/docs/redesign-previews/_shots/<version>-<page>.png \
     "file:///home/murphy/vcs/murphlmao.github.io/docs/redesign-previews/<version>/<page>.html"
   ```
   Chrome's minimum window width is 500, so for the phone check shoot at 500x1300 and treat it as the mobile view. Read the PNGs. Fix what is wrong. At least one revision pass. Do not use MCP browser tools; other agents share them.
5. Remove one thing from every page. Then stop.

## Return

Reply with, in this order, nothing else:
1. Folder path and the list of screenshot paths.
2. Palette (hex and role), typefaces and roles, what you did with the articles index and why, the ambient motion if any.
3. What you removed in the final pass.
4. Anything in the brief you could not satisfy.
