/* Articles index: "by date" / "by class" switch.
   Ported from docs/redesign-previews/r4/pages.js (the whole file is initArticles).
   The rows are rendered once, in #flat; this moves them into the per-course lists in
   #groups. Three deliberate changes from r4:
   - no FLIP: the courses are collapsible now, so most rows have no start rect and the
     rest slid in from the indented course column, which read as a jump. The incoming
     view just fades up in place instead;
   - the buttons are role="radio" in a radiogroup, so the state attribute is aria-checked
     (r4 used aria-pressed on a plain group) and arrow keys move between them;
   - the hash jump accepts any id inside #groups instead of r4's /^(umich|off-syllabus|eecs\d{3})$/,
     so header and course slugs work without editing this file. */

import { prefersReducedMotion } from './util';

export function initArticles(): void {
  const flat = document.getElementById('flat');
  const groups = document.getElementById('groups');
  if (!flat || !groups) return;

  const btns = Array.from(document.querySelectorAll<HTMLButtonElement>('.view__btn'));
  const reduce = prefersReducedMotion();

  const key = (row: Element) => row.querySelector('time')?.getAttribute('datetime') ?? '';

  function setView(view: string, animate: boolean): void {
    const rows = Array.from(document.querySelectorAll<HTMLLIElement>('.post-row'));

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
    document.documentElement.dataset.articlesView = view;   // keeps the pre-paint CSS in step

    if (!animate || reduce) return;
    (view === 'class' ? groups! : flat!).animate(
      [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
      { duration: 180, easing: 'ease-out' },
    );
  }

  let saved: string | null = null;
  try { saved = localStorage.getItem('articlesView'); } catch { /* storage blocked: saved stays null */ }

  // A hash pointing at a group or a course forces the grouped view for this load only.
  const hash = location.hash.slice(1);
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
  if (jump) {
    const course = target!.closest<HTMLDetailsElement>('details.course');
    if (course) course.open = true;
    target!.scrollIntoView();
  }

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
