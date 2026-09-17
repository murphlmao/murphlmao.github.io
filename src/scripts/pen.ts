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
   way to preview the mode.

   v2.1: drawSpeed/glowStrength/glowBreathe (site.config Tweaks, mirrored onto <html> as
   --draw-speed/--glow-strength/data-glow-breathe by tweaks.ts). Speed and strength are
   read fresh at the start of each trace (and cached for the settle/breathing that
   follows it); changing them mid-trace never re-traces, only the *next* trace picks up
   the new value. Laser mode breathes once the settle finishes: a slow, randomly-timed
   glow pulse over the finished ink, run on a cheap setTimeout between pulses and a
   capped rAF loop only while a pulse is actually animating. */

import { capDPR, prefersReducedMotion } from './util';

const reduce = prefersReducedMotion();

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
const CAT_OFFSET = CAT.map(function (s): any { return { d: s.d, x: -70 }; });
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

/* Pen scene timing. Trace: ~40% of the old clamp(total/220, 1.2, 3) s; unaffected by
   drawSpeed's base (pen keeps its current feel, just scaled by speed at runtime).

   Laser mode: constant speed per unit length, head-lift pause between paths, then a
   completion glow (FLASH in, HOLD, FADE back to plain ink) once the trace finishes.
   Laser's *base* trace (and its pause) run BASE_SLOW times the pen base, so the M takes
   roughly 3-4s at speed 1x instead of ~1s; the whole thing (trace, pause, glow) is then
   divided by --draw-speed at the start of each trace. Glow amplitude multiplies by
   --glow-strength. */
const PAUSE = 40, FLASH = 400, HOLD = 600, FADE = 2400;
const BASE_SLOW = 3.2;                 /* laser base trace/pause vs. pen's base */
const TAU = Math.PI * 2, EMPTY: number[] = [];

/* Laser breathing (mode==='laser', data-glow-breathe=on, not reduced-motion): once the
   settle finishes, every BREATH_MIN..BREATH_MAX ms (re-rolled each cycle) the glow rises
   to 0.55 * glowStrength and falls back, occasionally as a double pulse. */
const BREATH_MIN = 7000, BREATH_MAX = 14000, BREATH_PEAK = .55;

function easeInOut(t: number) { return t < .5 ? 2 * t * t : 1 - (2 - 2 * t) * (2 - 2 * t) / 2; }
function glowAt(x: number, flash: number, hold: number, fade: number) { /* x = ms past trace end -> 0..1 */
  if (x <= 0) return 0;
  if (x < flash) { const u = x / flash; return 1 - (1 - u) * (1 - u); }
  if (x < flash + hold) return 1;
  const g = flash + hold + fade;
  if (x < g) { const v = (x - flash - hold) / fade; return 1 - v * v * (3 - 2 * v); }
  return 0;
}

/* Single vs. double breath, as fractions of BREATH_PEAK (0..1); double pulse 1 in 4. */
function breathShape(): { from: number; to: number; dur: number }[] {
  if (Math.random() < .25) {
    return [
      { from: 0, to: 1, dur: 1600 }, { from: 1, to: .5, dur: 1000 },
      { from: .5, to: 1, dur: 1000 }, { from: 1, to: 0, dur: 2600 },
    ];
  }
  return [{ from: 0, to: 1, dur: 1600 }, { from: 1, to: 1, dur: 300 }, { from: 1, to: 0, dur: 2600 }];
}
function shapeDur(shape: { dur: number }[]) { return shape.reduce(function (a, s) { return a + s.dur; }, 0); }
function shapeAt(shape: { from: number; to: number; dur: number }[], ms: number) {
  let t = ms;
  for (let i = 0; i < shape.length; i++) {
    const s = shape[i];
    if (t <= s.dur) { const u = easeInOut(clampN(t / s.dur, 0, 1)); return s.from + (s.to - s.from) * u; }
    t -= s.dur;
  }
  return 0;
}

/* One scene bound to `canvas` (reads data-scene). `manual` skips the auto-trace and
   hover/visibility wiring (debug harness). Returns { renderAt(mode, ms), dur, glow, pulse }. */
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
    st.i = i;
    st.dash = [st.len, st.len];          /* partial-trace dash, reused every frame */
    st.seg = [0, st.len];                /* laser trail segment, [0] set per frame */
  });
  const total = cum;
  const baseDur = clampN(total / 550, 0.5, 1.2) * 1000; /* pen's base trace, unaffected by BASE_SLOW */
  const trail = total * 0.14;

  const colors = { ink: '', accent: '', mich: '' };
  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    colors.ink = cs.getPropertyValue('--text').trim();
    colors.accent = cs.getPropertyValue('--accent').trim();
    colors.mich = cs.getPropertyValue('--mich').trim();
  }

  /* --draw-speed (0.25..3, default 1), --glow-strength (0..1, default .6) and
     data-glow-breathe, read fresh at the start of each trace/reset. */
  function readSpeed() {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--draw-speed'));
    return clampN(v || 1, 0.25, 3);
  }
  function readStrength() {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--glow-strength'));
    return clampN(isNaN(v) ? 0.6 : v, 0, 1);
  }
  function readBreathe() { return document.documentElement.dataset.glowBreathe !== 'off'; }

  let speed = readSpeed(), strength = readStrength(), breathe = readBreathe();
  let ratePen = 0, rateLaser = 0, pauseEff = 0, flashEff = FLASH, holdEff = HOLD, fadeEff = FADE, glowEff = FLASH + HOLD + FADE;
  let durLaserEff = 0;
  const durObj = { pen: 0, laser: 0 };

  /* Recompute effective (speed-scaled) durations and each stroke's start offset for
     both modes. Called once at setup and again at the start of every trace, so a speed
     change never re-traces, it only changes the NEXT trace. */
  function recompute() {
    const penDurEff = baseDur / speed;
    const laserTraceEff = (baseDur * BASE_SLOW) / speed;
    pauseEff = (PAUSE * BASE_SLOW) / speed;
    flashEff = FLASH / speed; holdEff = HOLD / speed; fadeEff = FADE / speed;
    glowEff = flashEff + holdEff + fadeEff;
    ratePen = penDurEff / total;
    rateLaser = laserTraceEff / total;
    strokes.forEach(function (st) {
      st.t0Pen = st.start * ratePen;
      st.t0Laser = st.start * rateLaser;
      st.lift = st.i * pauseEff;
    });
    durLaserEff = laserTraceEff + pauseEff * (strokes.length - 1);
    durObj.pen = penDurEff; durObj.laser = durLaserEff;
  }
  recompute();

  let box = { bx: 0, by: 0, k: 0 };
  function computeBox() {
    const cw = canvas.clientWidth || 1, ch = canvas.clientHeight || 1;
    const k = cw / 220;
    box = { bx: 4 * k, by: -30 * k, k: k };
    const dpr = capDPR();
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
  }

  function dot(x: number, y: number, r: number, a: number) { ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }

  /* e: trace-time ms (pen: eased, laser: linear). g: laser completion/breath glow, 0..1
     and already strength-scaled by the caller. */
  function render(laser: boolean, e: number, g: number) {
    const dpr = capDPR();
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    let tipSt: any = null, tipLocal = 0, i: number, st: any, local: number, a: number;
    for (i = 0; i < strokes.length; i++) {
      st = strokes[i];
      local = (e - (laser ? st.t0Laser : st.t0Pen) - (laser ? st.lift : 0)) / (laser ? rateLaser : ratePen);
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
        } else {                           /* completion/breath glow: wide soft + thin hot */
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
    if (laser) render(true, ms, ms > durLaserEff ? glowAt(ms - durLaserEff, flashEff, holdEff, fadeEff) * strength : 0);
    else render(false, easeInOut(clampN(ms / durObj.pen, 0, 1)) * durObj.pen, 0);
    return ms >= (laser ? durLaserEff + glowEff : durObj.pen);
  }
  function still() { render(false, 1e9, 0); }

  let mode = 'pen', tracing = false, settled = false, rafId: number | null = null, startTs = 0, elapsed = 0, lastFrameTs = 0;
  /* Breathing: a setTimeout schedules the next pulse; the rAF loop only runs while a
     pulse is actually animating (30fps cap, same as the trace loop). */
  let pulseTimer: ReturnType<typeof setTimeout> | null = null, pulseRafId: number | null = null;

  function clearBreath() {
    if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
    if (pulseRafId) { cancelAnimationFrame(pulseRafId); pulseRafId = null; }
  }
  function scheduleBreath() {
    clearBreath();
    if (reduce || mode !== 'laser' || !breathe || document.hidden) return;
    pulseTimer = setTimeout(runPulse, BREATH_MIN + Math.random() * (BREATH_MAX - BREATH_MIN));
  }
  function runPulse() {
    if (reduce || mode !== 'laser') return;
    clearBreath();
    const shape = breathShape(), dur = shapeDur(shape);
    let pStart = 0, pLast = 0;
    pulseRafId = requestAnimationFrame(function tick(ts) {
      if (!pStart) pStart = ts;
      if (ts - pLast < 33) { pulseRafId = requestAnimationFrame(tick); return; }
      pLast = ts;
      const e = ts - pStart;
      if (e >= dur) { render(true, durLaserEff, 0); pulseRafId = null; scheduleBreath(); return; }
      render(true, durLaserEff, shapeAt(shape, e) * BREATH_PEAK * strength);
      pulseRafId = requestAnimationFrame(tick);
    });
  }
  /** Trigger a breath immediately (debug harness / manual testing). */
  function pulse() { if (!reduce && mode === 'laser') runPulse(); }

  function loop(ts: number) {
    if (ts - lastFrameTs < 33) { rafId = requestAnimationFrame(loop); return; }
    lastFrameTs = ts;
    elapsed = ts - startTs;
    if (frame(mode, elapsed)) {
      tracing = false; rafId = null; settled = true;
      if (mode === 'laser') scheduleBreath();
      return;
    }
    rafId = requestAnimationFrame(loop);
  }
  function startTrace() {
    clearBreath();
    mode = document.documentElement.dataset.draw === 'laser' ? 'laser' : 'pen';
    speed = readSpeed(); strength = readStrength(); breathe = readBreathe();
    recompute();
    settled = false;
    if (reduce) { still(); settled = true; return; }
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
      if (document.hidden) { pauseTrace(); clearBreath(); }
      else {
        resumeTrace();
        if (!tracing) { still(); if (settled) scheduleBreath(); }
      }
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
      if (k === 'reset') {
        speed = readSpeed(); strength = readStrength(); breathe = readBreathe();
        clearBreath();
        if (settled && mode === 'laser') scheduleBreath();
      }
    } else if (k === 'draw') {
      pauseTrace(); tracing = false; clearBreath(); if (!manual) startTrace();
    } else if (k === 'glowStrength') {
      strength = readStrength();
      if (!tracing && !pulseRafId) still();
    } else if (k === 'glowBreathe') {
      breathe = readBreathe();
      if (breathe) { if (settled && mode === 'laser') scheduleBreath(); }
      else { clearBreath(); still(); }
    }
    /* drawSpeed: nothing to do here, --draw-speed is already live on <html> and
       startTrace() reads it fresh at the start of the next trace. */
  });

  return { canvas: canvas, renderAt: frame, dur: durObj, glow: { flash: FLASH, hold: HOLD, fade: FADE }, pulse: pulse };
}

export function initPen(): void {
  const debug = new URLSearchParams(location.search).get('debug') === '1';
  document.querySelectorAll<HTMLCanvasElement>('canvas.pen[data-scene]').forEach(function (canvas) {
    if (!SCENE_KEYS[canvas.dataset.scene || '']) return;   /* "none" / unknown: no scene */
    const pen = makePen(canvas);
    if (debug && !(window as any).__pen) (window as any).__pen = pen;
  });
}
