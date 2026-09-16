/* Small helpers shared verbatim across the canvas scripts in this directory
   (background, critters, orb, pen, sidecat, walker): each used to redefine these
   identically, so they live here once instead. */

/** devicePixelRatio, capped so retina screens don't blow up canvas backing-store size. */
export function capDPR(max = 2): number {
  return Math.min(window.devicePixelRatio || 1, max);
}

/** prefers-reduced-motion, as a plain boolean. */
export function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
