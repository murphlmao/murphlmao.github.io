/* Small helpers shared verbatim across the canvas scripts in this directory
   (background, critters, orb, pen, sidecat, walker): each used to redefine these
   identically, so they live here once instead. */

/** devicePixelRatio, capped so retina screens don't blow up canvas backing-store size. */
export function capDPR(max = 2): number {
  return Math.min(window.devicePixelRatio || 1, max);
}

/** Run `fn` once every <link rel=stylesheet> has its sheet. WebKit runs module scripts
    while stylesheets are still loading (Chrome and Firefox hold them back), so a script
    that starts early reads '' for every palette token and measures canvases at their
    unstyled 300x150. `load` is the backstop in case a link never settles. */
export function whenStylesReady(fn: () => void): void {
  const pending = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).filter((l) => !l.sheet);
  if (!pending.length) { fn(); return; }
  let left = pending.length, done = false;
  const go = () => { if (!done) { done = true; fn(); } };
  const one = () => { if (--left <= 0) go(); };
  for (const l of pending) {
    l.addEventListener('load', one, { once: true });
    l.addEventListener('error', one, { once: true });
  }
  window.addEventListener('load', go, { once: true });
}

/** prefers-reduced-motion, as a plain boolean. */
export function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
