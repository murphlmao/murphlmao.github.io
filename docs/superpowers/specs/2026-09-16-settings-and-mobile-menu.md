# Settings panel and mobile menu — design spec

Date: 2026-09-16. Branch `v2`. Murphy: "make sure the settings menu is more user friendly for people who want to customize the experience both on mobile and desktop; intelligent UX; a full interface design pass on the hamburger menu on mobile, I'm not happy with it."

## What is wrong today

Settings: a 248px mono form of native selects, checkboxes, and ranges at 12px, no grouping, labels that read like a debug panel ("orb spin", "motes", "dim on articles"), no idea what a palette looks like until you pick it. On mobile it floats top-right over the menu sheet, two taps deep (Menu, then gear).

Mobile menu: a bordered "Menu ≡" pill; the sheet is the desktop sidebar dumped full-screen: name, intro, four links, icon row, then 60% empty screen. No close affordance except the same button, no backdrop, no motion.

## Intent

The human is a visitor who found the gear, or Murphy showing the site off. They want to try a look in two taps and get back to reading. Feel: the site's own world, a developer's well-made preferences drawer: mono section labels, one accent, quiet layered surfaces, switches that feel physical. Nothing that reads as a form.

## Settings panel ("Customize")

One markup, two presentations. Keep the native `popover` and the `<form id="tweaks">` with the same control `name`s (tweaks.ts binds by name; do not rename keys).

Structure (top to bottom):

```
Customize                                   ×
saved on this device · reset

LOOK
  Palette      [ember ●] [alley ●] [space ●]        three swatch chips, radio
  Mark         [◉ orb] [cat] [M] [paw]              four radio tiles, 40px, live orb in the first
  Michigan M   [maize] [accent] [muted]             three small swatch radios

MOTION
  Header drawing     pen | laser                    segmented control (radio)
  Orb spin           ◯━━                            switch
  Background         ◯━━                            switch
    Opacity          ━━━●━━━━━━  25                 range, disabled when Background is off
    Strands          ◯━━                            switch, same
    Particles        ◯━━                            switch, same
    Dim on articles  ━━━━━●━━━━  50                 range, same
  Paw trail          ◯━━                            switch

CRITTERS
  Footer cat         ◯━━
  Deer               ◯━━
  Raccoon            ◯━━
```

Controls:
- Palette chips: `<label class="chip"><input type="radio" name="palette" value="ember"><span class="chip__swatch" style="--sw-bg:#121016;--sw-accent:#D7263D"></span>ember</label>`. The swatch is a 18px circle in the palette's ground with a 7px accent dot; checked state: 1px accent border on the chip. Hexes: ember bg #121016 accent #D7263D; alley bg #121016 accent #F5A742; space bg #000000 accent #FF3B3B.
- Mark tiles: radio `name="logo"` values `orb`, `mark-a`, `mark-b`, `mark-c`; each tile 40x40, bg-2 surface, hairline, radius 6; contents: for orb a 24px `<canvas class="orb-preview">` that orb.ts also animates (export a helper or draw the same routine into any `canvas.orb-preview`), for the marks the same inline SVGs as `Orb.astro` at 22px in `--accent`. Checked: accent border.
- Michigan: radio `name="mich"` values `maize` (#FFCB05 swatch), `accent` (var(--accent)), `muted` (var(--muted)).
- Draw: two radios `name="draw"` in a segmented control (`.seg`), 28px tall, the checked side filled bg with text color.
- Switches: the existing checkboxes, restyled: `input[type=checkbox].switch` 34x20 track (bg = line color when off, accent when on), 16px thumb, `transform` transition 140ms ease-out; focus-visible ring; label on the left, switch on the right, row min-height 36px.
- Ranges: `accent-color` plus a mono value on the right (existing `<output>`), 36px row. The two ranges and the Strands/Particles switches sit in a sub-group indented 12px with a 1px left rule; when `bg` is off, the sub-group gets `opacity:.45; pointer-events:none` via `:has(input[name=bg]:not(:checked))` (CSS only).
- Header: "Customize" 15px/600 sans, a 32px × close button (`popovertarget="tweaks" popovertargetaction="hide"`), and a 12px mono muted line "saved on this device · reset" where reset is the existing `.tweak__reset` button.
- Section labels: 11px mono, letter-spacing .08em, muted, same style as the sidebar "ON THIS PAGE" label.
- Row label type: 13.5px sans, text color. No mono for labels.

Desktop presentation (≥900px): popover anchored above the gear at the sidebar's bottom-left: `position: fixed; left: 16px; bottom: 64px; width: 300px; max-height: calc(100vh - 96px); overflow: auto`, bg-2 surface, 1px line border, radius 10px, padding 16px, `box-shadow: 0 0 0 1px rgba(255,255,255,.04), 0 12px 32px rgba(0,0,0,.45)`. Enter: from `opacity 0; transform: translateY(6px) scale(.98)` to rest in 160ms `cubic-bezier(.23,1,.32,1)` with `transform-origin: bottom left` (use `@starting-style` on `:popover-open`). Light dismiss (click outside) is native. `::backdrop` transparent on desktop.

Mobile presentation (<900px): a bottom sheet. `position: fixed; inset: auto 0 0 0; width: 100%; max-height: 86vh; overflow: auto; border-radius: 16px 16px 0 0; padding: 8px 16px calc(16px + env(safe-area-inset-bottom))`, a 36x4 drag-handle bar centered at the top (decorative), header row with "Customize" and the × button; `::backdrop { background: rgba(0,0,0,.5) }`. Enter: translateY(24px)→0, 200ms ease-out. The gear on mobile lives in the top bar (see below), so settings is one tap from any page.

## Mobile top bar and menu (<900px)

Top bar, 56px, sticky, bg with hairline bottom: `[mark] murph.rip` left (unchanged), then the cat silhouette (keep, 40x20, it sits on the bar's baseline), then two 40x40 icon buttons on the right: the gear (`Settings.astro`'s button, moved here on mobile via the same markup: the button stays in the DOM once; on mobile CSS positions the `.side__actions` group in the bar) and the menu button.

Menu button: icon only, 40x40, no border, `aria-label="Menu"`, hamburger lines that morph to an × when `aria-expanded="true"` (three `<span>` bars rotated with transforms, 180ms).

Sheet: drops from under the bar (not full screen): `position: fixed; top: 56px; left: 0; right: 0; max-height: calc(100vh - 56px); overflow: auto; background: var(--bg-2); border-bottom: 1px solid var(--line); border-radius: 0 0 16px 16px; padding: 8px 16px 20px`. Below it a backdrop `rgba(0,0,0,.5)` over the page (a `.side__backdrop` element, click closes). Contents:

1. Nav rows: `Home / Articles / Resources / Resume` as 48px rows, 17px/500, current one with the accent dot and accent text (existing style), hairline between rows optional (prefer none; use the row height).
2. On article pages: a hairline, then the "ON THIS PAGE" label and the TOC links (existing `.toc` markup) as 40px rows.
3. A hairline, then one row: the four socials and the deer icon as 40px icon buttons, left-aligned; on the right of that row, the mono line `Murphy Malcolm` is NOT repeated (the bar already says murph.rip); drop the name and intro from the sheet entirely.

Motion: sheet enters with `translateY(-8px)`→0 and opacity in 180ms ease-out; backdrop fades 150ms; both instant under reduced motion. Body scroll locked while open (existing `is-locked`). Escape closes; a tap on a nav link closes (existing). Focus: on open, move focus to the first nav link; on close, return it to the menu button.

## Files

- `src/components/Settings.astro`: new markup and all panel CSS (both presentations).
- `src/components/Sidebar.astro`: bar layout, `.side__actions` group (gear + menu button), the sheet, backdrop, nav row sizes, remove name/intro from the mobile sheet (keep them on desktop).
- `src/scripts/menu.ts`: morphing button state, backdrop click, focus move and return.
- `src/scripts/tweaks.ts`: `sync()` must handle radios (`el.type === 'radio'` → `el.checked = state[k] === el.value`) and the input handler must read radios (`el.checked ? el.value : skip`). Nothing else changes.
- `src/scripts/orb.ts`: also draw into `canvas.orb-preview` if present (same frame, 24px, no favicon export), and honor the same spin toggle.
- `src/styles/base.css`: the shared `.side__icon` rule already exists; add nothing global unless both components need it.

## Acceptance

- Desktop 1440: gear opens the panel above the gear; every control changes the page live; close via ×, Escape, or outside click; reload keeps choices; reset restores defaults.
- Mobile 390x844: gear in the bar opens the bottom sheet in one tap; menu opens the drop sheet with backdrop; both close cleanly; no horizontal scroll; tap targets ≥40px; settings sheet scrolls internally with the page locked.
- `pnpm check` and `pnpm lint` pass. No new dependencies.
