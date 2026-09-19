/* Animated orb mark + favicon. Ported from docs/redesign-previews/r4/site.js
   (initOrb, lines 128-240). Reads its colors from the palette CSS variables,
   re-reads them on `tweakchange`, allocates nothing per frame, pauses when the
   tab is hidden, and draws a single static frame under reduced motion.
   Also drives any `canvas.orb-preview` (the live orb tile in Settings.astro's
   mark picker): same draw routine scaled to its size, gated only on the orb
   spin switch (not on which mark is currently active, since it's a preview). */
import { capDPR, prefersReducedMotion } from './util';

const reduce = prefersReducedMotion();

interface Entry {
  ctx: CanvasRenderingContext2D;
  size: number;
  kind: 'main' | 'preview';
}

export function initOrb(): void {
  const main = document.querySelector<HTMLCanvasElement>('canvas.orb');
  const previews = document.querySelectorAll<HTMLCanvasElement>('canvas.orb-preview');
  if (!main && !previews.length) return;
  const dpr = capDPR();

  const entries: Entry[] = [];
  function attach(canvas: HTMLCanvasElement, kind: Entry['kind']): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width || 40;
    canvas.width = size * dpr; canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    entries.push({ ctx, size, kind });
  }
  if (main) attach(main, 'main');
  previews.forEach((c) => attach(c, 'preview'));

  let T = ['#F5A742', '#C4561E', '#FFD489'], G = '#1A171F';
  function hexA(hex: string, a: number): string {
    let h = (hex || '#888888').replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const r = parseInt(h.substring(0, 2), 16) || 0, g = parseInt(h.substring(2, 4), 16) || 0, b = parseInt(h.substring(4, 6), 16) || 0;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }
  function readColors(): void {
    const cs = getComputedStyle(document.documentElement);
    T = [
      cs.getPropertyValue('--orb-1').trim() || T[0],
      cs.getPropertyValue('--orb-2').trim() || T[1],
      cs.getPropertyValue('--orb-3').trim() || T[2],
    ];
    G = cs.getPropertyValue('--bg-2').trim() || G;
  }
  readColors();

  /* draw() is the original 40px routine, scaled by s = size/40 so the same
     wobble/gradient math works at any canvas size (24px preview tile included). */
  function draw(ctx: CanvasRenderingContext2D, size: number, t: number): void {
    const s = size / 40;
    const mid = size / 2;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath(); ctx.arc(mid, mid, 19 * s, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = T[1];
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 3; i++) {
      const a = t * (0.35 + 0.15 * i) + i * 2.1;
      const wob = 1 + 0.18 * Math.sin(t * 0.9 + i * 1.7) * Math.cos(t * 0.53 + i);
      const cx = mid + Math.cos(a) * 7 * s * wob, cy = mid + Math.sin(a) * 7 * s * wob;
      const r = (13 + 3 * Math.sin(t * 0.7 + i * 2.3)) * s;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, hexA(T[i], 0.95));
      grad.addColorStop(0.6, hexA(T[i], 0.35));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(mid, mid, 19 * s, 0, Math.PI * 2); ctx.fill();
    }
    const vg = ctx.createRadialGradient(mid, mid, 12 * s, mid, mid, 19.5 * s);
    vg.addColorStop(0, 'transparent'); vg.addColorStop(1, hexA(G, 0.85));
    ctx.fillStyle = vg;
    ctx.beginPath(); ctx.arc(mid, mid, 19 * s, 0, Math.PI * 2); ctx.fill();
    const hg = ctx.createRadialGradient(14 * s, 13 * s, 0, 14 * s, 13 * s, 7 * s);
    hg.addColorStop(0, 'rgba(255,255,255,.22)'); hg.addColorStop(1, 'transparent');
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(14 * s, 13 * s, 7 * s, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function shouldRun(kind: Entry['kind']): boolean {
    const d = document.documentElement.dataset;
    if (kind === 'main' && d.logo !== 'orb') return false;
    return d.orb === 'on' && !document.hidden && !reduce;
  }

  /* Favicon: a 32px canvas of its own, so painting it never touches the visible orb.
     While the main orb spins, frame() repaints it every FAV_MS at the orb's own t, so
     the tab icon turns in step; otherwise it holds the t=0 still. Chrome and Firefox
     repaint the tab on every href change; Safari keeps the first icon it fetched. */
  const FAV_MS = 100;
  const favLink = document.getElementById('favicon') as HTMLLinkElement | null;
  const fav = document.createElement('canvas');
  fav.width = 32; fav.height = 32;
  const favCtx = fav.getContext('2d');
  let favLast = 0;
  function paintFavicon(t: number): void {
    if (!favLink || !favCtx) return;
    draw(favCtx, 32, t);
    if (favLink.type !== 'image/png') favLink.type = 'image/png';
    favLink.href = fav.toDataURL('image/png');
  }

  let raf: number | null = null, last = 0;
  function frame(t: number): void {
    raf = requestAnimationFrame(frame);
    if (t - last < 33) return;
    last = t;
    const tt = t / 1000;
    for (const e of entries) if (shouldRun(e.kind)) draw(e.ctx, e.size, tt);
    if (t - favLast >= FAV_MS && shouldRun('main')) { favLast = t; paintFavicon(tt); }
  }
  function evaluate(): void {
    const active = entries.some((e) => shouldRun(e.kind));
    if (active) {
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    } else {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      for (const e of entries) draw(e.ctx, e.size, 0);
    }
  }
  evaluate();
  document.addEventListener('visibilitychange', evaluate);

  /* The resting favicon: the orb's t=0 still, or the active static mark in the palette's
     accent. A spinning orb paints over it from frame() within FAV_MS. */
  function setFavicon(): void {
    if (!favLink) return;
    const logo = document.documentElement.dataset.logo;
    if (logo === 'orb') {
      paintFavicon(0);
    } else {
      const markSvg = document.querySelector('.side__mark .' + logo);
      if (!markSvg) return;
      const cs = getComputedStyle(document.documentElement);
      const accentText = cs.getPropertyValue('--accent-text').trim();
      const svgStr = markSvg.outerHTML.replace(/currentColor/g, accentText).replace(/ class="[^"]*"/, '');
      favLink.type = 'image/svg+xml';
      favLink.href = 'data:image/svg+xml,' + encodeURIComponent(svgStr);
    }
  }

  document.addEventListener('tweakchange', (e) => {
    const k = (e as CustomEvent).detail.key;
    if (k === 'palette' || k === 'reset') readColors();
    /* r4 omits 'logo' here, which leaves the orb frozen after switching back
       to it from a static mark; one extra key, same behaviour otherwise. */
    if (k === 'orb' || k === 'palette' || k === 'logo' || k === 'reset') evaluate();
    /* 'orb': spin switched off, so drop back from the last animated frame to the still */
    if (k === 'orb' || k === 'palette' || k === 'logo' || k === 'reset') setFavicon();
  });

  setFavicon();
}
