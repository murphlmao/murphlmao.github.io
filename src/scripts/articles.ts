/* Articles index: "by date" / "by class" switch with a FLIP transition.
   Ported from docs/redesign-previews/r4/pages.js (the whole file is initArticles).
   The rows are rendered once, in #flat; this moves them into the per-course lists in
   #groups and animates the difference. Two deliberate changes from r4:
   - the buttons are role="radio" in a radiogroup, so the state attribute is aria-checked
     (r4 used aria-pressed on a plain group) and arrow keys move between them;
   - the hash jump accepts any id inside #groups instead of r4's /^(umich|off-syllabus|eecs\d{3})$/,
     so header and course slugs work without editing this file. */

export function initArticles(): void {
  const flat = document.getElementById('flat');
  const groups = document.getElementById('groups');
  if (!flat || !groups) return;

  const btns = Array.from(document.querySelectorAll<HTMLButtonElement>('.view__btn'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const key = (row: Element) => row.querySelector('time')?.getAttribute('datetime') ?? '';

  function setView(view: string, animate: boolean): void {
    const rows = Array.from(document.querySelectorAll<HTMLLIElement>('.post-row'));
    // FIRST: one rect per row, measured before any mutation.
    const first = animate ? new Map(rows.map((r) => [r, r.getBoundingClientRect()])) : null;

    // MOVE
    if (view === 'class') {
      groups!.querySelectorAll<HTMLOListElement>('ol[data-course]').forEach((ol) => {
        ol.append(...rows.filter((r) => r.dataset.course === ol.dataset.course));
      });
      flat!.hidden = true;
      groups!.hidden = false;
    } else {
      rows.sort((a, b) => key(b).localeCompare(key(a))); // stable: same-day rows keep course order
      flat!.append(...rows);
      groups!.hidden = true;
      flat!.hidden = false;
    }

    btns.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.view === view)));

    if (!first || reduce) return;

    // LAST + INVERT + PLAY. Element.animate applies the first keyframe before the next
    // paint, so no double rAF is needed.
    for (const row of rows) {
      const last = row.getBoundingClientRect();
      const f = first.get(row)!;
      const dx = f.left - last.left;
      const dy = f.top - last.top;
      if (Math.abs(dx) + Math.abs(dy) >= 0.5) {
        row.animate(
          [{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }],
          { duration: 220, easing: 'ease-out' },
        );
      }
    }

    if (view === 'class') {
      groups!.querySelectorAll('.group-head, .course-head, .empty').forEach((el) => {
        el.animate(
          [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
          { duration: 220, easing: 'ease-out' },
        );
      });
    }
  }

  let saved: string | null = null;
  try { saved = localStorage.getItem('articlesView'); } catch { saved = null; }

  // A hash pointing at a group or a course forces the grouped view for this load only.
  const hash = decodeURIComponent(location.hash.slice(1));
  const target = hash ? document.getElementById(hash) : null;
  const jump = !!target && groups.contains(target);
  // ?view=class|date previews a view without a hash jump or a localStorage write.
  const queryView = new URLSearchParams(location.search).get('view');
  const boot = jump
    ? 'class'
    : queryView === 'class' || queryView === 'date'
      ? queryView
      : saved === 'class' ? 'class' : 'date';

  setView(boot, false);
  if (jump) target!.scrollIntoView();

  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.view;
      if (!v || btn.getAttribute('aria-checked') === 'true') return;
      setView(v, true);
      try { localStorage.setItem('articlesView', v); } catch { /* private mode */ }
    });
    // Radiogroup keys: arrows move to the other option and select it. Enter and Space are
    // the button's native click.
    btn.addEventListener('keydown', (e) => {
      const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
      if (!back && e.key !== 'ArrowRight' && e.key !== 'ArrowDown') return;
      e.preventDefault();
      const next = btns[(i + (back ? btns.length - 1 : 1)) % btns.length];
      next.focus();
      next.click();
    });
  });
}
