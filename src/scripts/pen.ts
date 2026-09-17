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

   v2.1: penSpeed/laserSpeed/glowStrength/glowBreathe (site.config Tweaks, mirrored onto
   <html> as --pen-speed/--laser-speed/--glow-strength/data-glow-breathe by tweaks.ts).
   All apply at once: a speed change or a reset re-traces (debounced, so a slider drag
   ends in one trace) and a glowStrength change repaints the resting glow. Laser mode breathes once the finish
   settles: a slow, randomly-timed glow pulse over the lit ink, run on a cheap
   setTimeout between pulses and a capped rAF loop only while a pulse is animating. */

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
   the speed sliders' base (pen keeps its current feel, just scaled by --pen-speed at runtime).

   Laser mode: constant speed per unit length, head-lift pause between paths, beam and
   ink both in the stroke's own colour (the M traces maize when maize is picked). Once
   the trace finishes the circuit "turns on": the beam tip parks on the end point and
   soaks into the outline (ABSORB: a glow pulse passes over the ink and dissipates),
   the outline rests unlit (REST), then strikes like a tube (1-3 random bursts, ~1s,
   see makeFlicker: the glow stutters and the ink dips by up to FLICK_DIP), ignites
   at the peak glow and settles (SETTLE) to a steady glow at glowStrength that stays
   on, which is what breathing then pulses on top of (up to the same peak). Laser's
   *base* trace (and its pause) run BASE_SLOW times the pen base, so the M takes
   roughly 3-4s at speed 1x instead of ~1s; the whole thing (trace, pause, finish) is
   then divided by --laser-speed (pen: --pen-speed) at the start of each trace. */
const PAUSE = 40, ABSORB = 600, REST = 500, SETTLE = 1800;
const FLICK_DIP = .35;                 /* laser: how far the ink dims on a flicker's off-beat */
const PEAK_OVER = .35;                 /* laser: ignition/breath peak sits this much above glowStrength (capped at 1) */
const BASE_SLOW = 3.2;                 /* laser base trace/pause vs. pen's base */
const TAU = Math.PI * 2, EMPTY: number[] = [];

/* Laser breathing (mode==='laser', data-glow-breathe=on, not reduced-motion): once the
   finish settles, every BREATH_MIN..BREATH_MAX ms (re-rolled each cycle) the glow rises
   from its steady level (glowStrength) to the ignition peak and falls back, occasionally
   as a double pulse. */
const BREATH_MIN = 7000, BREATH_MAX = 14000;

function easeInOut(t: number) { return t < .5 ? 2 * t * t : 1 - (2 - 2 * t) * (2 - 2 * t) / 2; }
function easeOut(t: number) { return 1 - (1 - t) * (1 - t); }
function rand(a: number, b: number) { return a + Math.random() * (b - a); }

/* Tube-strike flicker as [ms, lit] keyframes: 1-3 short on/off bursts with uneven gaps,
   then a final ramp to 1. Re-rolled every trace so no two ignitions match. */
function makeFlicker(): number[][] {
  const k: number[][] = [[0, 0]];
  let t = 0;
  const n = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    t += rand(40, 90); k.push([t, rand(.4, .9)]);
    t += rand(30, 80); k.push([t, rand(0, .15)]);
    t += rand(60, 260); k.push([t, k[k.length - 1][1]]);
  }
  t += 200; k.push([t, 1]);
  return k;
}
function flickerAt(k: number[][], ms: number): number {
  if (ms <= 0) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (ms <= k[i][0]) { const a = k[i - 1], b = k[i]; return a[1] + (b[1] - a[1]) * (ms - a[0]) / (b[0] - a[0]); }
  }
  return 1;
}

/* Single vs. double breath, 0..1 above the steady level; double pulse 1 in 4. */
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
  const lastSt = strokes[strokes.length - 1];
  const endPt = lastSt.el.getPointAtLength(lastSt.len); /* where the beam parks before soaking in */

  const colors = { ink: '', accent: '', mich: '' };
  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    colors.ink = cs.getPropertyValue('--text').trim();
    colors.accent = cs.getPropertyValue('--accent').trim();
    colors.mich = cs.getPropertyValue('--mich').trim();
  }

  /* --pen-speed / --laser-speed (0.25..3, defaults .85 / 1.35), --glow-strength (0..1,
     default .3) and data-glow-breathe, read fresh at the start of each trace/reset. */
  function readSpeed(name: string, dflt: number) {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return clampN(v || dflt, 0.25, 3);
  }
  function readSpeeds() { penSpeed = readSpeed('--pen-speed', .85); laserSpeed = readSpeed('--laser-speed', 1.35); }
  function readStrength() {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--glow-strength'));
    return clampN(isNaN(v) ? 0.3 : v, 0, 1);
  }
  function readBreathe() { return document.documentElement.dataset.glowBreathe !== 'off'; }

  let penSpeed = .85, laserSpeed = 1.35, strength = readStrength(), breathe = readBreathe();
  readSpeeds();
  let flick = makeFlicker();
  let ratePen = 0, rateLaser = 0, pauseEff = 0;
  let absorbEff = ABSORB, restEff = REST, flickEff = 0, settleEff = SETTLE, finishEff = 0;
  let durLaserEff = 0;
  const durObj = { pen: 0, laser: 0, finish: 0 };

  /* Recompute effective (speed-scaled) durations and each stroke's start offset for
     both modes. Called once at setup and again at the start of every trace. */
  function recompute() {
    const penDurEff = baseDur / penSpeed;
    const laserTraceEff = (baseDur * BASE_SLOW) / laserSpeed;
    pauseEff = (PAUSE * BASE_SLOW) / laserSpeed;
    absorbEff = ABSORB / laserSpeed; restEff = REST / laserSpeed; settleEff = SETTLE / laserSpeed;
    flickEff = flick[flick.length - 1][0] / laserSpeed;
    finishEff = absorbEff + restEff + flickEff + settleEff;
    ratePen = penDurEff / total;
    rateLaser = laserTraceEff / total;
    strokes.forEach(function (st) {
      st.t0Pen = st.start * ratePen;
      st.t0Laser = st.start * rateLaser;
      st.lift = st.i * pauseEff;
    });
    durLaserEff = laserTraceEff + pauseEff * (strokes.length - 1);
    durObj.pen = penDurEff; durObj.laser = durLaserEff; durObj.finish = finishEff;
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

  /* Per-frame laser effect state, written by frame()/still()/runPulse(), read by render().
     g: glow 0..1 (already strength-scaled). lit: ink alpha 0..1 (only dips during the
     flicker). tip: parked beam dot at the end of the last stroke, 0..1. Pen mode ignores
     all three. */
  const fx = { g: 0, lit: 1, tip: 0 };
  function setFx(g: number, lit: number, tip: number) { fx.g = g; fx.lit = lit; fx.tip = tip; }
  function steady() { return strength; }
  function peak() { return strength > 0 ? Math.min(1, strength + PEAK_OVER) : 0; }

  /* e: trace-time ms (pen: eased, laser: linear). */
  function render(laser: boolean, e: number) {
    const dpr = capDPR();
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    let tipSt: any = null, tipLocal = 0, tipCol = '', i: number, st: any, local: number, a: number, col: string;
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
      col = st.c === 'accent' ? colors.accent : st.c === 'mich' ? colors.mich : colors.ink;
      ctx.strokeStyle = col;
      ctx.globalAlpha = laser ? fx.lit : 1;
      if (local >= st.len) {
        ctx.setLineDash(EMPTY);
      } else {
        ctx.setLineDash(st.dash);
        ctx.lineDashOffset = st.len - local;
        tipSt = st; tipLocal = local; tipCol = col;
      }
      ctx.stroke(st.path2d);
      if (laser) {
        ctx.globalCompositeOperation = 'lighter';
        if (local < st.len) {              /* beam trail: last `trail` units of this path */
          a = local - trail; if (a < 0) a = 0;
          st.seg[0] = local - a;
          ctx.setLineDash(st.seg);
          ctx.lineDashOffset = -a;
          ctx.lineWidth = 10 / st.s; ctx.globalAlpha = .3; ctx.stroke(st.path2d);
          ctx.lineWidth = 1.5 / st.s; ctx.globalAlpha = 1; ctx.stroke(st.path2d);
        } else if (fx.g > 0) {             /* neon glow in the stroke's own colour: blurred body + hot core.
                                              shadowBlur ignores the CTM, so scale it by hand; sqrt keeps a
                                              low strength visibly soft instead of a hairline. */
          ctx.shadowColor = col; ctx.shadowBlur = 24 * box.k * dpr * Math.sqrt(fx.g);
          ctx.lineWidth = 3 / st.s; ctx.globalAlpha = fx.g; ctx.stroke(st.path2d);
          ctx.shadowBlur = 0;
          ctx.lineWidth = 1.2 / st.s; ctx.globalAlpha = .5 * fx.g; ctx.stroke(st.path2d);
        }
      }
      ctx.restore();
    }
    if (tipSt) {
      const lp = tipSt.el.getPointAtLength(tipLocal);
      const X = box.bx + (tipSt.x + lp.x * tipSt.s) * box.k;
      const Y = box.by + (tipSt.y + lp.y * tipSt.s) * box.k;
      ctx.fillStyle = laser ? tipCol : colors.accent;
      if (laser) {
        ctx.globalCompositeOperation = 'lighter';
        dot(X, Y, 7 * box.k, .3);
        dot(X, Y, 2.6 * box.k, 1);
        ctx.fillStyle = '#fff';
        dot(X, Y, 1.2 * box.k, .9);
      } else {
        dot(X, Y, 3 * box.k, 1);
      }
    } else if (laser && fx.tip > 0) {      /* trace done: the beam parks on the last point and soaks in */
      const X = box.bx + (lastSt.x + endPt.x * lastSt.s) * box.k;
      const Y = box.by + (lastSt.y + endPt.y * lastSt.s) * box.k;
      ctx.fillStyle = lastSt.c === 'accent' ? colors.accent : lastSt.c === 'mich' ? colors.mich : colors.ink;
      ctx.globalCompositeOperation = 'lighter';
      dot(X, Y, 7 * box.k * fx.tip, .3 * fx.tip);
      dot(X, Y, 2.6 * box.k * fx.tip, fx.tip);
      ctx.fillStyle = '#fff';
      dot(X, Y, 1.2 * box.k * fx.tip, .9 * fx.tip);
    }
    ctx.restore();
  }

  /* Deterministic frame at `ms` since trace start. Returns true once nothing is left to animate. */
  function frame(mode: string, ms: number) {
    if (mode !== 'laser') {
      setFx(0, 1, 0);
      render(false, easeInOut(clampN(ms / durObj.pen, 0, 1)) * durObj.pen);
      return ms >= durObj.pen;
    }
    const x = ms - durLaserEff;          /* ms past trace end; the finish phases run from here */
    setFx(0, 1, 0);
    if (x >= 0) {
      const t1 = absorbEff, t2 = t1 + restEff, t3 = t2 + flickEff, hi = peak(), lo = steady();
      if (x < t1) { const t = x / t1; fx.tip = 1 - t; fx.g = Math.sin(Math.PI * t) * lo; }
      else if (x < t2) { /* unlit rest */ }
      else if (x < t3) { const f = flickerAt(flick, (x - t2) * laserSpeed); fx.g = f * hi; fx.lit = 1 - FLICK_DIP * (1 - f); }
      else fx.g = hi - (hi - lo) * easeOut(clampN((x - t3) / settleEff, 0, 1));
    }
    render(true, ms);
    return ms >= durLaserEff + finishEff;
  }
  /* The finished frame: plain ink in pen mode, ink at the steady glow in laser mode. */
  function still() {
    if (mode === 'laser') { setFx(steady(), 1, 0); render(true, 1e9); }
    else { setFx(0, 1, 0); render(false, 1e9); }
  }

  let mode = document.documentElement.dataset.draw === 'laser' ? 'laser' : 'pen';
  let tracing = false, settled = false, rafId: number | null = null, startTs = 0, elapsed = 0, lastFrameTs = 0;
  /* Breathing: a setTimeout schedules the next pulse; the rAF loop only runs while a
     pulse is actually animating (30fps cap, same as the trace loop). */
  let pulseTimer: ReturnType<typeof setTimeout> | null = null, pulseRafId: number | null = null;
  let speedTimer: ReturnType<typeof setTimeout> | null = null;

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
      const e = ts - pStart, s = steady();
      if (e >= dur) { still(); pulseRafId = null; scheduleBreath(); return; }
      setFx(s + (peak() - s) * shapeAt(shape, e), 1, 0);
      render(true, 1e9);
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
      still();
      if (mode === 'laser') scheduleBreath();
      return;
    }
    rafId = requestAnimationFrame(loop);
  }
  function startTrace() {
    clearBreath();
    mode = document.documentElement.dataset.draw === 'laser' ? 'laser' : 'pen';
    readSpeeds(); strength = readStrength(); breathe = readBreathe();
    flick = makeFlicker();
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
  /* Auto-trace starts on the spot: no settled frame first, no delay, so the canvas is
     blank until the trace's first frame rather than showing the finished drawing for
     a beat and then re-drawing it. Reduced motion / manual paint the finished frame. */
  if (reduce || manual) still();

  if (!reduce && !manual) {
    startTrace();
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
    /* palette/mich: repaint the finished frame instantly, no re-trace. draw (pen/laser)
       and reset re-trace to show the mode at its speed; a speed slider re-traces too,
       debounced so a drag ends in a single trace at the final speed. */
    if (k === 'palette' || k === 'mich') {
      readColors(); pauseTrace(); tracing = false; still();
    } else if (k === 'draw' || k === 'reset') {
      if (k === 'reset') readColors();
      pauseTrace(); tracing = false; clearBreath(); if (!manual) startTrace();
    } else if (k === 'penSpeed' || k === 'laserSpeed') {
      if (speedTimer) clearTimeout(speedTimer);
      speedTimer = setTimeout(function () { speedTimer = null; if (!manual) startTrace(); }, 250);
    } else if (k === 'glowStrength') {
      strength = readStrength();
      if (!tracing && !pulseRafId) still();  /* the steady glow tracks the slider live */
    } else if (k === 'glowBreathe') {
      breathe = readBreathe();
      if (breathe) { if (settled && mode === 'laser') scheduleBreath(); }
      else { clearBreath(); still(); }
    }
  });

  return { canvas: canvas, renderAt: frame, dur: durObj, glow: { absorb: ABSORB, rest: REST, settle: SETTLE }, pulse: pulse };
}

export function initPen(): void {
  const debug = new URLSearchParams(location.search).get('debug') === '1';
  document.querySelectorAll<HTMLCanvasElement>('canvas.pen[data-scene]').forEach(function (canvas) {
    if (!SCENE_KEYS[canvas.dataset.scene || '']) return;   /* "none" / unknown: no scene */
    const pen = makePen(canvas);
    if (debug && !(window as any).__pen) (window as any).__pen = pen;
  });
}
