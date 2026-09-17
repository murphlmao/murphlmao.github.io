/* Article-page behaviour. Ported from docs/redesign-previews/r4/site.js
   (initCopy lines 691-713, initToc lines 714-736). r4 ships the copy button in
   its static markup; ours is injected here because the code-block markup comes
   from the rehype wrapper, which only emits the frame and the language label. */

export function initCopy(): void {
  document.querySelectorAll<HTMLElement>('.code-block-wrapper').forEach((wrap) => {
    const pre = wrap.querySelector('pre');
    if (!pre) return;
    const btn = document.createElement('button');
    btn.className = 'code-copy';
    btn.type = 'button';
    btn.textContent = 'copy';
    let timer = 0;
    btn.addEventListener('click', () => {
      navigator.clipboard?.writeText(pre.textContent ?? '').catch(() => {});
      wrap.classList.add('is-copied');
      btn.textContent = 'copied';
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        wrap.classList.remove('is-copied');
        btn.textContent = 'copy';
      }, 1200);
    });
    wrap.appendChild(btn);
  });
}

export function initToc(): void {
  const toc = document.querySelector('.toc');
  if (!toc) return;
  const links = Array.from(toc.querySelectorAll<HTMLAnchorElement>('.toc__link'));
  const heads: { h: HTMLElement; a: HTMLAnchorElement }[] = [];
  for (const a of links) {
    const h = document.getElementById((a.getAttribute('href') || '').slice(1));
    if (h) heads.push({ h, a });
  }
  if (!heads.length) return;
  /* The active entry is the last heading at or above the reading line (a quarter down
     the viewport, capped), so a long section stays highlighted all the way through and
     there is always exactly one entry lit once the first heading has scrolled past.
     Pinned to the bottom of the page the last heading wins even if it never reaches
     the line. Rects are read per scroll frame; a few dozen headings is nothing. */
  let current: HTMLAnchorElement | null = null, raf = 0;
  function update() {
    raf = 0;
    const line = Math.min(160, innerHeight * 0.25);
    let active: HTMLAnchorElement | null = null;
    for (const o of heads) {
      if (o.h.getBoundingClientRect().top > line) break;
      active = o.a;
    }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) active = heads[heads.length - 1].a;
    if (active === current) return;
    current?.removeAttribute('aria-current');
    active?.setAttribute('aria-current', 'true');
    current = active;
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  update();
}

/* Hover "copy link" button on article headings (h2-h4, which Astro already gives ids):
   click copies the section URL, sets the hash, and flashes "copied". */
export function initHeadingLinks(): void {
  const prose = document.querySelector('.prose');
  if (!prose) return;
  prose.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]').forEach((h) => {
    const btn = document.createElement('button');
    btn.className = 'heading-link';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Copy link to this section');
    btn.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6.5 9.5a3 3 0 0 0 4.2 0l2.1-2.1a3 3 0 0 0-4.2-4.2L7.5 4.3"/><path d="M9.5 6.5a3 3 0 0 0-4.2 0L3.2 8.6a3 3 0 0 0 4.2 4.2l1.1-1.1"/></svg>';
    let timer = 0;
    btn.addEventListener('click', () => {
      history.replaceState(null, '', '#' + h.id);
      navigator.clipboard?.writeText(location.origin + location.pathname + '#' + h.id).catch(() => {});
      btn.classList.add('is-copied');
      clearTimeout(timer);
      timer = window.setTimeout(() => btn.classList.remove('is-copied'), 1200);
    });
    h.appendChild(btn);
  });
}
