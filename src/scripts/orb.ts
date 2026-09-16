/* Animated orb mark + favicon. Ported from docs/redesign-previews/r4/site.js
   (initOrb, lines 128-240). Reads its colors from the palette CSS variables,
   re-reads them on `tweakchange`, allocates nothing per frame, pauses when the
   tab is hidden, and draws a single static frame under reduced motion. */
import { capDPR, prefersReducedMotion } from './util';

const reduce = prefersReducedMotion();

export function initOrb(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas.orb');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = capDPR();
  canvas.width = 40 * dpr; canvas.height = 40 * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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

  function draw(t: number): void {
    const c = ctx as CanvasRenderingContext2D;
    c.clearRect(0, 0, 40, 40);
    c.save();
    c.beginPath(); c.arc(20, 20, 19, 0, Math.PI * 2); c.clip();
    c.fillStyle = T[1];
    c.fillRect(0, 0, 40, 40);
    for (let i = 0; i < 3; i++) {
      const a = t * (0.35 + 0.15 * i) + i * 2.1;
      const wob = 1 + 0.18 * Math.sin(t * 0.9 + i * 1.7) * Math.cos(t * 0.53 + i);
      const cx = 20 + Math.cos(a) * 7 * wob, cy = 20 + Math.sin(a) * 7 * wob;
      const r = 13 + 3 * Math.sin(t * 0.7 + i * 2.3);
      const grad = c.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, hexA(T[i], 0.95));
      grad.addColorStop(0.6, hexA(T[i], 0.35));
      grad.addColorStop(1, 'transparent');
      c.fillStyle = grad;
      c.beginPath(); c.arc(20, 20, 19, 0, Math.PI * 2); c.fill();
    }
    const vg = c.createRadialGradient(20, 20, 12, 20, 20, 19.5);
    vg.addColorStop(0, 'transparent'); vg.addColorStop(1, hexA(G, 0.85));
    c.fillStyle = vg;
    c.beginPath(); c.arc(20, 20, 19, 0, Math.PI * 2); c.fill();
    const hg = c.createRadialGradient(14, 13, 0, 14, 13, 7);
    hg.addColorStop(0, 'rgba(255,255,255,.22)'); hg.addColorStop(1, 'transparent');
    c.fillStyle = hg;
    c.beginPath(); c.arc(14, 13, 7, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  let raf: number | null = null, last = 0;
  function frame(t: number): void {
    raf = requestAnimationFrame(frame);
    if (t - last < 33) return;
    last = t;
    draw(t / 1000);
  }
  function shouldRun(): boolean {
    const d = document.documentElement.dataset;
    return d.logo === 'orb' && d.orb === 'on' && !document.hidden && !reduce;
  }
  function evaluate(): void {
    if (shouldRun()) {
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    } else {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      draw(0);
    }
  }
  evaluate();
  document.addEventListener('visibilitychange', evaluate);

  let faviconCache: Record<string, string> = {};
  function orbDataURL(): string {
    const pal = document.documentElement.dataset.palette || '';
    if (faviconCache[pal]) return faviconCache[pal];
    draw(0);
    const off = document.createElement('canvas');
    off.width = 32; off.height = 32;
    off.getContext('2d')?.drawImage(canvas!, 0, 0, 32, 32);
    const url = off.toDataURL('image/png');
    faviconCache[pal] = url;
    return url;
  }

  function setFavicon(): void {
    const link = document.getElementById('favicon') as HTMLLinkElement | null;
    if (!link) return;
    const logo = document.documentElement.dataset.logo;
    if (logo === 'orb') {
      link.type = 'image/png';
      link.href = orbDataURL();
    } else {
      const markSvg = document.querySelector('.side__mark .' + logo);
      if (!markSvg) return;
      const cs = getComputedStyle(document.documentElement);
      const accentText = cs.getPropertyValue('--accent-text').trim();
      const svgStr = markSvg.outerHTML.replace(/currentColor/g, accentText).replace(/ class="[^"]*"/, '');
      link.type = 'image/svg+xml';
      link.href = 'data:image/svg+xml,' + encodeURIComponent(svgStr);
    }
  }

  document.addEventListener('tweakchange', (e) => {
    const k = (e as CustomEvent).detail.key;
    if (k === 'palette' || k === 'reset') { readColors(); faviconCache = {}; }
    /* r4 omits 'logo' here, which leaves the orb frozen after switching back
       to it from a static mark; one extra key, same behaviour otherwise. */
    if (k === 'orb' || k === 'palette' || k === 'logo' || k === 'reset') evaluate();
    if (k === 'palette' || k === 'logo' || k === 'reset') setFavicon();
  });

  setFavicon();
}
