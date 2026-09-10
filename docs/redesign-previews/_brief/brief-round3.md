# Brief — murph.rip redesign, round three: a theme that is his

Two rounds failed. Round one: four genre pieces (terminal cosplay, brutalist poster, serif book, SaaS page). Round two: three tasteful reskins of his current Tailwind Spotlight template. His verdict on round two: "you just reskinned what I already had. It doesn't speak to anything cool. You didn't add animation JS or cool background visuals. There's nothing in there that's unique or speaks about me as a person."

This round builds a theme. Personality is the requirement, not an easter egg. Motion is a feature, not a whisper. And it still has to be clean: "minimalism first" for him means uncluttered, not featureless.

## Who he is (use this, it's the whole point)

Murphy Malcolm. Software and platform engineer at Prism Controls, CS student at the University of Michigan. Arch Linux user (he says "Arch btw" in his bio). Writes profane, funny course notes on C++ and data structures (EECS 280/281/370), and wants to write articles that aren't about school too. Has hit seven deer and two raccoons with three cars and keeps a log ("Tragedy & Pain."). Likes cats: his profile photo is him asleep with a cat, his articles have an ASCII cat mascot, one snippet is a C++ `Cat` class you can divide with the `/` operator. Does videography and color grading on the side, so he has an eye. Domain is murph.rip. There is a meme audio file `../../../public/chill_guy_man.mp3` in the repo; an opt-in click easter egg is allowed, autoplay is not.

He needs a new logo and favicon. Each theme proposes one mark.

What he reacted to: Josh Comeau's site is "going in the right direction" (illustrated, browse articles by category, playful) but he is "not a fan of a lot of what's there." Tania Rascia's site "has some personality" (left sidebar, mascot illustration, timeline, tags). Those two screenshots are in `../_inspo/joshwcomeau.png` and `../_inspo/taniarascia.png`; look at them once. He does not want to see other references. He loves "red / black / space" as a palette idea and is unsure about "ghostly."

Content is in `content.md` next to this file. Use it verbatim. Your task assigns the theme, the layout, and the folder.

## Deliverable: a multi-page site with shared assets

Inside your folder:
- `index.html` (home), `articles.html` (index with categories), `eecs280.html` (category page), `article.html` (the Complexity Analysis article), `projects.html`, `snippets.html`, `resources.html`
- `style.css` shared, `site.js` shared, `logo.svg` (also inlined as the favicon via a data URI `<link rel="icon">`)
- Every file a complete standalone document. Relative links between pages. Opens from `file://`. Google Fonts only for external resources; images from `../../../public/` as listed in content.md. No CDN scripts. Any canvas or SVG scene is hand-written in `site.js`.

Spend effort in this order: home, articles index, article page, then the category page and the three list pages, which should reuse the shell and be simple but on-theme.

## Required in every theme

1. **A living background or scene.** Canvas or SVG, written in `site.js`, visibly animated, specific to the theme. It must stay cheap: requestAnimationFrame capped at 30fps where possible, low object counts, no layout thrash, paused on `document.hidden`, reduced to a static frame under `prefers-reduced-motion`. It must never sit over text at a contrast that hurts reading. On the article page it dims or simplifies.
2. **Interaction with personality.** At least two: a page-load moment, a hover reaction from the mascot or mark, a click easter egg, a nav transition. Motion that answers the reader's action is preferred over ambient flourishes.
3. **A logo mark.** One SVG, works at 16px as a favicon and at nav size. Say what it is and why it's his. Put it in the nav, the favicon, and the footer.
4. **A palette switcher.** `<html data-palette="...">` drives CSS custom properties defined in `style.css`. Presets: your theme's default (designed by you for the theme), `reverie` (#050407 #2D3D59 #8C8A90 #C98590 #E6E2E4 #D7263D), `space` (black ground, red accent, cool grey secondary, star-white text; your exact hexes), and one more of your choice. A small control in the nav or sidebar switches it; persist in `localStorage`; the canvas scene reads its colors from the CSS variables so it recolors too. State all hexes.
5. **Personal content, not decoration.** The deer count somewhere it makes sense. The cat. Michigan. Arch. murph.rip as a name with meaning. His bio verbatim. His article descriptions verbatim, profanity included.
6. **Articles by category, visibly.** The index must make the course groups obvious at a glance, work for a future non-course group, and not be a grid of identical cards. Tags or course marks are welcome if they carry information.
7. **Article page.** Clean reading by default: a 65-72ch prose column, quiet type, the theme at the edges (header, sidebar, figure frames, footer). Include the ASCII `pre`, two hand-tokenized C++ code blocks with language label and hover copy button, the interactive Big O SVG figure in a themed frame, a table of contents on wide screens, prev/next or back-to-course at the bottom. If your task says "personality throughout," add margin asides from the mascot, illustrated section markers, and animated callouts, while keeping the prose itself readable.
8. **Quality floor.** Works at 500px wide (Chrome headless minimum; treat it as mobile), 16px gutters, no horizontal scroll except inside `pre`. Semantic HTML, visible focus, 4.5:1 body contrast in every palette. Body text 16-17px.

## Not allowed

- The current site's structure: centered pill nav, bio-with-photo-on-the-right, "Latest Posts" beside a "Work" card. Your task assigns a different skeleton.
- Genre cosplay with no content: no terminal that is only a prompt, no poster that is only a wordmark.
- A grid of identical rounded cards. Gradient text. Glowing pill buttons. "01 / 02 / 03" markers on non-sequences. Fade-in-on-scroll for every section.
- Inventing articles, jobs, projects, quotes, or facts about him.

## Process

1. Read content.md, then the two inspo screenshots, then your task's theme section.
2. Write a design plan in your reply before code: the theme in two sentences; the logo mark; the default palette (5-6 hexes with roles) and the other presets; typefaces and roles; the layout skeleton as an ASCII wireframe for home and for the article page; the scene and how it stays cheap; the two or more interactions; where the personal content lands. Check it against "is any of this generic dark-dev default?" and fix that part.
3. Build. Shared `style.css` and `site.js`; pages are markup.
4. Screenshot every page with headless Chrome at 1440x1000 (viewport, to see the scene) and 1440x1600 (full), plus home and article at 500x1300. Save to `../_shots/<folder>-<page>.png` and `<folder>-<page>-mobile.png`. Read them. Fix. At least one revision pass. Chrome shape:
   ```
   google-chrome-stable --headless=new --disable-gpu --hide-scrollbars --no-sandbox \
     --user-data-dir=/tmp/chrome-$$-$RANDOM --window-size=1440,1000 --virtual-time-budget=8000 \
     --screenshot=/home/murphy/vcs/murphlmao.github.io/docs/redesign-previews/_shots/<folder>-<page>.png \
     "file:///home/murphy/vcs/murphlmao.github.io/docs/redesign-previews/<folder>/<page>.html"
   ```
   No MCP browser tools; other agents share them.
5. Remove one thing from every page that doesn't earn its place. Stop.

## Return

Reply with, in this order, nothing else:
1. Folder path and screenshot paths.
2. The theme in two sentences. The logo mark and why. Palette presets with hexes. Typefaces.
3. The scene and its cost. The interactions. Where each personal element landed.
4. What you removed in the final pass.
5. What you could not satisfy.
