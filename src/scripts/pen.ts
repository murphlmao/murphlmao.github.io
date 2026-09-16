/* Pen-drawn header scenes. Ported function-for-function from
   docs/redesign-previews/r4/site.js (the pen section, lines 439-690): the CAT/M path
   data, the SCENES table, clampN/easeInOut/glowAt, makePen (readColors, computeBox,
   render, frame, still, loop, tweakchange, reduced motion, visibilitychange) and initPen.

   Only deviation from r4: r4 traced the single `canvas.pen` on the page and read the
   scene straight out of `data-scene`. Here every `canvas.pen[data-scene]` is traced and
   `data-scene` carries our page name (home/articles/article/...), which SCENE_KEYS maps
   onto r4's scene keys (home/book/bigo/prompt/catslash/compass). Unknown names and
   "none" draw nothing.

   v2 deviation from r4: the scene traces once on load and never re-traces on hover.
   `tweakchange` for palette/mich/reset just repaints the finished frame with the new
   colors (`still()`); only `draw` (pen/laser mode) re-traces, since that is the only
   way to preview the mode. */

const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

const CAT: any[] = [
  { d: 'M158 100L154 82L165 90Q170 88 175 90L186 82L182 100Q188 110 178 117Q170 120 162 117Q152 110 158 100Z' },
  { d: 'M164 117Q150 130 152 150L188 150Q190 130 176 117' },
  { d: 'M188 146C199 152 204 140 197 130' },
  { d: 'M164 103q2 -2 4 0M172 103q2 -2 4 0' },
  { d: 'M168 108l2 2l2 -2' },
  { d: 'M161 108l-8 -1M161 111l-8 1M179 108l8 -1M179 111l8 1' },
];
const CAT_SMALL_HEAD = { d: CAT[0].d, x: 100, y: 20, s: .6 };
const CAT_SMALL_EYES = { d: CAT[3].d, x: 100, y: 20, s: .6 };
const CAT_SMALL_NOSE = { d: CAT[4].d, x: 100, y: 20, s: .6 };
const CAT_OFFSET = CAT.map(function (s) { return { d: s.d, x: -70 }; });
const BLOCK_M = { d: 'M139.14 164.22l-56.95 -77.86v56.67h22.65v56H0v-56H21.25V55.96H0v-56h82.39l56.75 78.43 56.76 -78.43H278.25v56H256.92v87.07H278.25v56H173.52v-56h22.57V86.36Z', x: 4, y: 50, s: .5, c: 'mich' };

const SCENES: Record<string, any[]> = {
  home: [BLOCK_M],
  book: [
    { d: 'M100 70C85 60 60 58 30 64L30 140C60 134 85 136 100 146' },
    { d: 'M100 70C115 60 140 58 170 64L170 140C140 134 115 136 100 146' },
    { d: 'M100 70L100 146' },
    { d: 'M30 140L24 146L100 154L176 146L170 140' },
    { d: 'M42 84C60 80 78 80 90 84M42 98C60 94 78 94 90 98M42 112C60 108 78 108 90 112' },
    { d: 'M110 84C122 80 140 80 158 84M110 98C122 94 140 94 158 98M110 112C122 108 140 108 158 112' },
    { d: 'M150 60L150 90L156 84L162 90L162 62', c: 'accent' },
  ],
  bigo: [
    { d: 'M40 40L40 160L170 160' },
    { d: 'M34 48L40 40L46 48M162 154L170 160L162 166' },
    { d: 'M42 158C60 130 110 122 168 118' },
    { d: 'M42 158L160 90' },
    { d: 'M42 158C90 156 130 120 150 50', c: 'accent' },
    { d: 'M60 60a10 10 0 1 0 .1 0', c: 'accent' },
    { d: 'M76 52q-5 8 0 16M84 52q5 8 0 16' },
  ],
  prompt: [
    { d: 'M32 60C70 58 130 58 168 60L170 140C130 142 70 142 30 140Z' },
    { d: 'M30 74L170 74' },
    { d: 'M40 67a2 2 0 1 0 .1 0M50 67a2 2 0 1 0 .1 0M60 67a2 2 0 1 0 .1 0' },
    { d: 'M46 92L60 102L46 112', c: 'accent' },
    { d: 'M68 112L84 112' },
  ],
  catslash: CAT_OFFSET.concat([
    { d: 'M130 140L160 60', c: 'accent' },
    CAT_SMALL_HEAD, CAT_SMALL_EYES, CAT_SMALL_NOSE,
  ]),
  compass: [
    { d: 'M100 40C135 40 160 65 160 100C160 135 135 160 100 160C65 160 40 135 40 100C40 65 65 40 100 40C104 40 106 40 108 40.5' },
    { d: 'M118 62L108 100L82 138L92 100Z', c: 'accent' },
    { d: 'M100 40v8M100 152v8M40 100h8M152 100h8' },
  ],
};

/* our page scene names -> r4 scene keys (R24) */
const SCENE_KEYS: Record<string, string> = {
  home: 'home', articles: 'book', article: 'bigo', resume: 'prompt',
  resources: 'compass', snippets: 'catslash', deer: 'compass',
};

function clampN(v: number, a: number, b: number) { return Math.min(b, Math.max(a, v)); }

/* Pen scene timing. Trace: ~40% of the old clamp(total/220, 1.2, 3) s.
   Laser mode: constant speed per unit length, PAUSE ms head-lift between paths,
   then a completion glow: FLASH in, HOLD, FADE back to plain ink. */
const PAUSE = 40, FLASH = 120, HOLD = 300, FADE = 500, GLOW = FLASH + HOLD + FADE;
const TAU = Math.PI * 2, EMPTY: number[] = [];

function easeInOut(t: number) { return t < .5 ? 2 * t * t : 1 - (2 - 2 * t) * (2 - 2 * t) / 2; }
function glowAt(x: number) { /* x = ms past trace end -> 0..1 */
  if (x <= 0) return 0;
  if (x < FLASH) { const u = x / FLASH; return 1 - (1 - u) * (1 - u); }
  if (x < FLASH + HOLD) return 1;
  if (x < GLOW) { const v = (x - FLASH - HOLD) / FADE; return 1 - v * v * (3 - 2 * v); }
  return 0;
}

/* One scene bound to `canvas` (reads data-scene). `manual` skips the auto-trace and
   hover/visibility wiring (debug harness). Returns { renderAt(mode, ms), dur, glow }. */
export function makePen(canvas: HTMLCanvasElement, manual?: boolean): any {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const key = SCENE_KEYS[canvas.dataset.scene || ''] || 'home';
  const raw = SCENES[key] || SCENES.home;
  const strokes: any[] = raw.map(function (s: any) { return { d: s.d, x: s.x || 0, y: s.y || 0, s: s.s || 1, c: s.c || 'ink' }; });

  const NS = 'http://www.w3.org/2000/svg';
  const offSvg = document.createElementNS(NS, 'svg');
  offSvg.setAttribute('width', '0'); offSvg.setAttribute('height', '0');
  offSvg.style.position = 'absolute'; offSvg.style.left = '-9999px';
  offSvg.setAttribute('aria-hidden', 'true');
  document.body.appendChild(offSvg);
  let cum = 0;
  strokes.forEach(function (st, i) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', st.d);
    offSvg.appendChild(p);
    st.el = p;
    st.len = p.getTotalLength() || 0.001;
    st.path2d = new Path2D(st.d);
    st.start = cum; cum += st.len;
    st.lift = i * PAUSE;                 /* laser: head-lift pauses before this path */
    st.dash = [st.len, st.len];          /* partial-trace dash, reused every frame */
    st.seg = [0, st.len];                /* laser trail segment, [0] set per frame */
  });
  const total = cum;
  const dur = clampN(total / 550, 0.5, 1.2) * 1000;
  const rate = dur / total;              /* ms per path unit, both modes */
  const durLaser = dur + PAUSE * (strokes.length - 1);
  const trail = total * 0.14;
  strokes.forEach(function (st) { st.t0 = st.start * rate; });

  const colors = { ink: '', accent: '', mich: '' };
  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    colors.ink = cs.getPropertyValue('--text').trim();
    colors.accent = cs.getPropertyValue('--accent').trim();
    colors.mich = cs.getPropertyValue('--mich').trim();
  }

  let box = { bx: 0, by: 0, k: 0 };
  function computeBox() {
    const cw = canvas.clientWidth || 1, ch = canvas.clientHeight || 1;
    const k = cw / 220;
    box = { bx: 4 * k, by: -30 * k, k: k };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
  }

  function dot(x: number, y: number, r: number, a: number) { ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }

  /* e: trace-time ms (pen: eased, laser: linear). g: laser completion glow 0..1. */
  function render(laser: boolean, e: number, g: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    let tipSt: any = null, tipLocal = 0, i: number, st: any, local: number, a: number;
    for (i = 0; i < strokes.length; i++) {
      st = strokes[i];
      local = (e - st.t0 - (laser ? st.lift : 0)) / rate;
      if (local <= 0) continue;
      if (local > st.len) local = st.len;
      ctx.save();
      ctx.translate(box.bx + st.x * box.k, box.by + st.y * box.k);
      ctx.scale(box.k * st.s, box.k * st.s);
      ctx.lineWidth = 3 / st.s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = st.c === 'accent' ? colors.accent : st.c === 'mich' ? colors.mich : colors.ink;
      if (local >= st.len) {
        ctx.setLineDash(EMPTY);
      } else {
        ctx.setLineDash(st.dash);
        ctx.lineDashOffset = st.len - local;
        tipSt = st; tipLocal = local;
      }
      ctx.stroke(st.path2d);
      if (laser && (g > 0 || local < st.len)) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = colors.accent;
        if (local < st.len) {              /* beam trail: last `trail` units of this path */
          a = local - trail; if (a < 0) a = 0;
          st.seg[0] = local - a;
          ctx.setLineDash(st.seg);
          ctx.lineDashOffset = -a;
          ctx.lineWidth = 10 / st.s; ctx.globalAlpha = .3; ctx.stroke(st.path2d);
          ctx.lineWidth = 1.5 / st.s; ctx.globalAlpha = 1; ctx.stroke(st.path2d);
        } else {                           /* completion glow: wide soft + thin hot */
          ctx.lineWidth = 9 / st.s; ctx.globalAlpha = .35 * g; ctx.stroke(st.path2d);
          ctx.lineWidth = 1.5 / st.s; ctx.globalAlpha = g; ctx.stroke(st.path2d);
        }
      }
      ctx.restore();
    }
    if (tipSt) {
      const lp = tipSt.el.getPointAtLength(tipLocal);
      const X = box.bx + (tipSt.x + lp.x * tipSt.s) * box.k;
      const Y = box.by + (tipSt.y + lp.y * tipSt.s) * box.k;
      ctx.fillStyle = colors.accent;
      if (laser) {
        ctx.globalCompositeOperation = 'lighter';
        dot(X, Y, 7 * box.k, .3);
        dot(X, Y, 2.6 * box.k, 1);
        ctx.fillStyle = '#fff';
        dot(X, Y, 1.2 * box.k, .9);
      } else {
        dot(X, Y, 3 * box.k, 1);
      }
    }
    ctx.restore();
  }

  /* Deterministic frame at `ms` since trace start. Returns true once nothing is left to animate. */
  function frame(mode: string, ms: number) {
    const laser = mode === 'laser';
    if (laser) render(true, ms, ms > durLaser ? glowAt(ms - durLaser) : 0);
    else render(false, easeInOut(clampN(ms / dur, 0, 1)) * dur, 0);
    return ms >= (laser ? durLaser + GLOW : dur);
  }
  function still() { render(false, 1e9, 0); }

  let mode = 'pen', tracing = false, rafId: number | null = null, startTs = 0, elapsed = 0, lastFrameTs = 0;
  function loop(ts: number) {
    if (ts - lastFrameTs < 33) { rafId = requestAnimationFrame(loop); return; }
    lastFrameTs = ts;
    elapsed = ts - startTs;
    if (frame(mode, elapsed)) { tracing = false; rafId = null; return; }
    rafId = requestAnimationFrame(loop);
  }
  function startTrace() {
    mode = document.documentElement.dataset.draw === 'laser' ? 'laser' : 'pen';
    if (reduce) { still(); return; }
    if (rafId) cancelAnimationFrame(rafId);
    tracing = true; elapsed = 0; lastFrameTs = 0;
    rafId = requestAnimationFrame(function (ts) { startTs = ts; loop(ts); });
  }
  function pauseTrace() { if (rafId) cancelAnimationFrame(rafId); rafId = null; }
  function resumeTrace() {
    if (!tracing || rafId) return;
    rafId = requestAnimationFrame(function (ts) { startTs = ts - elapsed; lastFrameTs = 0; loop(ts); });
  }

  readColors();
  computeBox();
  still();

  if (!reduce && !manual) {
    setTimeout(startTrace, 600);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pauseTrace(); else resumeTrace();
    });
  }

  let resizeTimer: any = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { computeBox(); if (!tracing) still(); }, 150);
  });

  document.addEventListener('tweakchange', function (e: any) {
    const k = e.detail.key;
    /* palette/mich/reset: repaint the finished frame instantly, no re-trace.
       draw (pen/laser) is the one case that re-traces, to preview the mode. */
    if (k === 'palette' || k === 'mich' || k === 'reset') {
      readColors(); pauseTrace(); tracing = false; still();
    } else if (k === 'draw') {
      pauseTrace(); tracing = false; if (!manual) startTrace();
    }
  });

  return { canvas: canvas, renderAt: frame, dur: { pen: dur, laser: durLaser }, glow: { flash: FLASH, hold: HOLD, fade: FADE } };
}

export function initPen(): void {
  document.querySelectorAll<HTMLCanvasElement>('canvas.pen[data-scene]').forEach(function (canvas) {
    if (!SCENE_KEYS[canvas.dataset.scene || '']) return;   /* "none" / unknown: no scene */
    makePen(canvas);
  });
}
