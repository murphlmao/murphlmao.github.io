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
  if (!toc || !('IntersectionObserver' in window)) return;
  const links = Array.from(toc.querySelectorAll<HTMLAnchorElement>('.toc__link'));
  const heads: { h: HTMLElement; a: HTMLAnchorElement }[] = [];
  for (const a of links) {
    const h = document.getElementById((a.getAttribute('href') || '').slice(1));
    if (h) heads.push({ h, a });
  }
  if (!heads.length) return;
  // Everything below is allocated once; the observer callback only mutates it.
  const state = new Map<Element, boolean>(heads.map((o) => [o.h, false]));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) state.set(e.target, e.isIntersecting);
      let active: HTMLAnchorElement | null = null;
      for (const o of heads) if (state.get(o.h)) active = o.a;
      for (const l of links) l.removeAttribute('aria-current');
      if (active) active.setAttribute('aria-current', 'true');
    },
    { rootMargin: '-20% 0px -70% 0px' }
  );
  for (const o of heads) io.observe(o.h);
}
