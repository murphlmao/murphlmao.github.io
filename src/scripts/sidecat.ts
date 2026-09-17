// @ts-nocheck
/* Ported verbatim from docs/redesign-previews/r4/sidecat.js; the r4 IIFE body is now the
   body of initSidecat(). r4's header comment follows. */
/* r4 — sidecat.js
   The sidebar cat: r3-night's silhouette, lying on the wordmark rule, facing
   away. Solid var(--cat), 2D, no eyes — ever, in any state. Mounts into every
   `.side-cat` (#sideCat) and owns its behaviour and styles (injected
   <style id="sidecat-style">, .sc* class names so the old .cat* rules never apply).

   Shapes: night's ellipse/circle/two triangles/curled-stroke tail, redrawn as
   keyed point arrays with matching counts (body: rest / stretch / curl; tail:
   rest / curl / lift / swing / flick) and blended per frame. Ears, the head
   turn and breathing are transforms. rAF, time-based, eased, 60fps cap,
   paused when the tab is hidden, static under prefers-reduced-motion.

   Contract: click (or Enter/Space) toggles the #chill audio — opt-in, never
   autoplay; the cat acknowledges with an ear perk and a faint accent glow
   while playing. Hovering `.side__deer` makes him listen that way. */
import { prefersReducedMotion } from './util';

export function initSidecat(): void {

  var TAU = Math.PI * 2;
  var NEAR = 200;                       // px: pointer proximity that wakes him
  var reduce = prefersReducedMotion();

  /* ---------------------------------------------------------------- styles */
  var CSS =
    '.side-cat{position:absolute;right:0;bottom:0;width:100%;height:0}' +
    '.side-cat svg.sc{position:absolute;right:0;bottom:0;width:48px;height:24px}' +
    'svg.sc{color:var(--cat,var(--muted));overflow:visible;cursor:pointer;transition:color .2s}' +
    'svg.sc:hover,svg.sc:focus-visible{color:color-mix(in srgb,var(--cat,var(--muted)) 60%,var(--muted))}' +
    'svg.sc:focus{outline:none}' +
    'svg.sc:focus-visible{outline:2px solid var(--accent);outline-offset:3px}' +
    'svg.sc .sc__ink{fill:currentColor}' +
    'svg.sc .sc__tail{fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round}' +
    '@media (max-width:899px){.side-cat{position:static;width:auto;height:auto;line-height:0}' +
    '.side-cat svg.sc{position:static;width:40px;height:20px}}';

  /* ---------------------------------------------------------------- shapes */
  /* viewBox 0 0 48 24, same as night. Floor is y=23 (the hairline).
     Body: M + 8 cubics, clockwise from the rump: rump, back to shoulder,
     shoulder down under the head, chest, tucked paw, paw underside, belly,
     rump underside. Night's ellipse was x 8..40 / y 9..23; the head circle
     (38,11) r6 is unchanged. */
  var B_REST = [8, 16.4,
    8, 12.5, 14.6, 9.3, 22, 9.2,
    25.6, 9.15, 28.5, 9.3, 31, 9.7,
    35.5, 10.4, 40.2, 12.4, 41.4, 15.4,
    42, 16.6, 42.2, 17.9, 42, 19,
    43.4, 18.8, 45.3, 19.6, 45.2, 21.5,
    45.1, 22.6, 43.4, 23, 40.5, 23,
    32, 23, 21, 23, 15, 23,
    10.6, 23, 8, 20.4, 8, 16.4];
  /* full stretch: front reaches forward, back arches, chin drops, paw slides out */
  var B_STR = [8, 16.6,
    8, 12.6, 14.8, 8.6, 23, 8.2,
    27.5, 8, 31.5, 8.4, 35, 9.4,
    39.5, 10.4, 44.6, 12.6, 46, 15.8,
    46.6, 17.4, 46.6, 18.8, 46.8, 19.4,
    48, 19.2, 50.4, 19.9, 50.6, 21.6,
    50.6, 22.6, 49.2, 23, 47, 23,
    36, 23, 22, 23, 15, 23,
    10.6, 23, 8, 20.4, 8, 16.6];
  /* re-settled: curled a touch tighter, paw drawn in */
  var B_CURL = [9.5, 16.2,
    9.5, 12.4, 16, 9.6, 22.5, 9.4,
    26, 9.35, 28.5, 9.5, 31, 9.9,
    34.8, 10.6, 39.4, 12.6, 40.5, 15.6,
    41.2, 16.8, 41.3, 18, 41.2, 19.1,
    42.5, 18.9, 44.3, 19.7, 44.2, 21.5,
    44.1, 22.6, 42.8, 23, 40, 23,
    32, 23, 21, 23, 16, 23,
    12, 23, 9.5, 20.4, 9.5, 16.2];
  var NB = B_REST.length;

  /* head centre per body key (the circle itself never changes) */
  var H_REST = [38, 11], H_STR = [43, 13], H_CURL = [37.2, 11.8];

  /* tail: one stroked cubic, M x y C x1 y1 x2 y2 x y — night's "M9 16C3 16 2 8 8 9" */
  var T_REST  = [9, 16.2, 3, 16.4, 2, 8.4, 8, 9.2];
  var T_CURL  = [10.5, 16.2, 5, 16.6, 3.6, 9.6, 9, 10.2];
  var T_LIFT  = [9, 16.2, 3.2, 14.6, 0.6, 5.4, 6.2, 5.2];   /* raised hook over the rump */
  var T_SWING = [9, 16.2, 4.4, 13.6, 3.4, 4.2, 9.6, 4.8];   /* lifted tail pushed one way */
  var T_FLICK = [9, 16.2, 3, 16.4, 1.4, 6.8, 8.6, 6.6];     /* tip only, up a touch */

  /* ears, tip up, base at y≈0; the right one carries a small notch on its outer edge */
  var EAR_L = 'M-2.6 1.4C-2.3 -1.2 -1.3 -3.8 -.4 -5.6C-.1 -6.1 .3 -6 .5 -5.6C1.3 -3.9 2.1 -1.6 2.7 1.4Z';
  var EAR_R = 'M-2.6 1.4C-2.3 -1.2 -1.3 -3.8 -.4 -5.6C-.1 -6.1 .3 -6 .5 -5.6C1 -4.5 1.4 -3.6 1.7 -2.9' +
              'L1.1 -2.3 2.1 -1.7C2.4 -.8 2.6 .3 2.7 1.4Z';

  var SVG = '<svg class="sc" viewBox="0 0 48 24" role="button" tabindex="0" aria-pressed="false"' +
    ' aria-label="Cat. Click for a chill guy."><g class="sc__all"><path class="sc__tail"/>' +
    '<g class="sc__ink"><path class="sc__body"/><g class="sc__head"><circle cx="38" cy="11" r="6"/>' +
    '<path class="sc__earL" d="' + EAR_L + '"/><path class="sc__earR" d="' + EAR_R + '"/></g></g></g></svg>';

  /* -------------------------------------------------------------- helpers */
  function f(v) { return Math.round(v * 20) / 20; }
  function f2(v) { return Math.round(v * 1000) / 1000; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function smooth(t) { return t <= 0 ? 0 : (t >= 1 ? 1 : t * t * (3 - 2 * t)); }
  function pulse(now, at, dur) { var u = (now - at) / dur; return u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0; }
  function ease(cur, target, dt, tau) { return cur + (target - cur) * (1 - Math.exp(-dt / tau)); }

  /* M x y then cubics, from a flat array */
  function pathd(a, n, close) {
    var s = 'M' + f(a[0]) + ' ' + f(a[1]);
    for (var i = 2; i < n; i += 6) {
      s += 'C' + f(a[i]) + ' ' + f(a[i + 1]) + ' ' + f(a[i + 2]) + ' ' + f(a[i + 3]) +
           ' ' + f(a[i + 4]) + ' ' + f(a[i + 5]);
    }
    return close ? s + 'Z' : s;
  }

  /* scratch arrays, reused every frame */
  var body = new Float64Array(NB), tail = new Float64Array(8);

  /* ----------------------------------------------------------------- pose */
  function newState() {
    return {
      breath: 0,    /* 0..1 */
      ears: 0,      /* 0..1 ears back toward the reader */
      turn: 0,      /* 0..1 head turned over the shoulder */
      lift: 0,      /* 0..1 tail raised */
      swing: 0,     /* -1..1 lifted tail pushed sideways (wag) */
      flick: 0,     /* 0..1 tip flick */
      twL: 0, twR: 0, /* ear twitch, degrees */
      perk: 0,      /* 0..1 click acknowledgement */
      stretch: 0,   /* 0..1 */
      curl: 0,      /* 0..1 re-settled tighter */
      shift: 0      /* y offset, weight shift while re-settling */
    };
  }

  function apply(r, st) {
    var i, s = st.stretch, c = st.curl, L = clamp(st.lift, 0, 1);

    for (i = 0; i < NB; i++) body[i] = B_REST[i] + (B_STR[i] - B_REST[i]) * s + (B_CURL[i] - B_REST[i]) * c;
    r.body.setAttribute('d', pathd(body, NB, true));

    for (i = 0; i < 8; i++) {
      tail[i] = T_REST[i] + (T_CURL[i] - T_REST[i]) * c + (T_LIFT[i] - T_REST[i]) * L +
                (T_SWING[i] - T_LIFT[i]) * st.swing * L + (T_FLICK[i] - T_REST[i]) * st.flick;
    }
    r.tail.setAttribute('d', pathd(tail, 8, false));

    /* head: follows the body key, then turns a few degrees about the neck */
    var hx = H_REST[0] + (H_STR[0] - H_REST[0]) * s + (H_CURL[0] - H_REST[0]) * c;
    var hy = H_REST[1] + (H_STR[1] - H_REST[1]) * s + (H_CURL[1] - H_REST[1]) * c;
    r.head.setAttribute('transform', 'translate(' + f(hx - 38) + ' ' + f(hy - 11) + ')' +
      ' rotate(' + f(-9 * st.turn) + ' 36 16)');

    /* ears: rest splay ±6°; back = splay + flatten; perk = up and in;
       turn = near ear foreshortens, far ear comes round toward the middle */
    var b = st.ears, p = st.perk, t = st.turn, sy = f2(1 - 0.2 * b + 0.1 * p);
    r.earL.setAttribute('transform', 'translate(' + f(35.5 + 0.4 * t) + ' 7.4) rotate(' +
      f(-6 - 24 * b + 9 * p + st.twL) + ') scale(' + f2(1 - 0.22 * t) + ' ' + sy + ')');
    r.earR.setAttribute('transform', 'translate(' + f(40.8 - 1.3 * t) + ' 7.3) rotate(' +
      f(8 + 24 * b - 9 * p + st.twR) + ') scale(1 ' + sy + ')');

    /* breathing about the base, plus the weight-shift lift */
    r.all.setAttribute('transform', 'translate(24 ' + f(23 + st.shift) + ') scale(' +
      f2(1 + 0.012 * st.breath) + ' ' + f2(1 + 0.028 * st.breath) + ') translate(-24 -23)');

    /* click acknowledgment: a faint accent glow that rides the ear-perk pulse, then fades */
    r.svg.style.filter = st.perk > 0.01 ?
      'drop-shadow(0 0 ' + f2(3 * st.perk) + 'px color-mix(in srgb, var(--accent) ' +
      f(45 * st.perk) + '%, transparent))' : '';
  }

  /* ----------------------------------------------------------------- mount */
  function build(mount) {
    if (!document.getElementById('sidecat-style')) {
      var s = document.createElement('style');
      s.id = 'sidecat-style';
      s.textContent = CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    mount.removeAttribute('aria-hidden');   /* the svg is a real button */
    mount.innerHTML = SVG;
    var svg = mount.querySelector('svg');
    return {
      svg: svg,
      all: svg.querySelector('.sc__all'),
      tail: svg.querySelector('.sc__tail'),
      body: svg.querySelector('.sc__body'),
      head: svg.querySelector('.sc__head'),
      earL: svg.querySelector('.sc__earL'),
      earR: svg.querySelector('.sc__earR')
    };
  }

  window.SIDECAT = { build: build, apply: apply, state: newState };   /* filmstrip harness hook */

  /* ------------------------------------------------------------- behaviour */
  function step(c, now, dt) {
    var st = c.st, u;

    /* engagement: pointer within NEAR px or the deer line hovered; relax ~1s after */
    var eng = c.near || now < c.forceTo;
    if (eng !== c.eng) { c.eng = eng; if (eng) c.engAt = now; else c.leftAt = now; }
    var hold = eng || now - c.leftAt < 1.0;
    var stretching = st.stretch > 0.02;

    st.ears = ease(st.ears, (hold ? 1 : 0) + 0.45 * st.stretch, dt, 0.09);
    var turnT = hold && now - c.engAt > 0.7 && !stretching ? 1 : 0;
    st.turn = ease(st.turn, turnT, dt, turnT ? 0.22 : 0.32);

    /* breathing: ~3.5s, period drifts a little so it never reads as a loop */
    c.bph += dt * TAU / (3.5 + 0.5 * Math.sin(now * 0.13));
    st.breath = 0.5 - 0.5 * Math.cos(c.bph);

    /* ear twitch: one ear, quick damped wiggle */
    if (now > c.tTw) { c.twAt = now; c.twR = Math.random() < 0.5; c.tTw = now + 3.5 + Math.random() * 7; }
    u = (now - c.twAt) / 0.45;
    var tw = u > 0 && u < 1 ? 12 * Math.sin(u * TAU * 1.1) * Math.exp(-2.5 * u) * (1 - u) : 0;
    st.twL = c.twR ? 0 : tw; st.twR = c.twR ? tw : 0;

    /* tail: lifts and wags twice, now and then; tip flicks; lifts a little when watched */
    if (now > c.tWag) {
      c.wagAt = now; c.wagAmp = 1 + Math.random() * 0.6;
      c.tWag = now + (c.on ? 3 + Math.random() * 3 : 7 + Math.random() * 9);
    }
    u = (now - c.wagAt) / 1.8;
    var env = u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0;
    st.swing = c.wagAmp * env * Math.sin(u * TAU * 2);
    if (now > c.tFlk) { c.flkAt = now; c.tFlk = now + 5 + Math.random() * 10; }
    st.flick = pulse(now, c.flkAt, 0.5);
    st.lift = ease(st.lift, 0.3 * (hold ? 1 : 0) + 0.7 * env + 0.5 * st.stretch, dt, 0.25);

    /* rare full stretch: out over 1.2s, hold, back over 1s */
    if (now > c.tStr) {
      if (hold || st.curl > 0.02) c.tStr = now + 4;
      else { c.strAt = now; c.tStr = now + 30 + Math.random() * 30; }
    }
    u = now - c.strAt;
    st.stretch = u < 1.2 ? smooth(u / 1.2) : (u < 1.5 ? 1 : 1 - smooth((u - 1.5) / 1.0));

    /* rare re-settle: shifts weight, curls tighter, loosens again later */
    if (now > c.tCurl) {
      if (stretching) c.tCurl = now + 3;
      else {
        c.curlAt = now; c.curlTo = c.curlTo ? 0 : 1;
        c.tCurl = now + (c.curlTo ? 10 + Math.random() * 15 : 40 + Math.random() * 40);
      }
    }
    u = smooth((now - c.curlAt) / 1.1);
    st.curl = c.curlTo ? u : 1 - u;
    st.shift = -0.7 * pulse(now, c.curlAt, 1.1);

    st.perk = pulse(now, c.perkAt, 0.6);

    apply(c.r, st);
  }

  /* ------------------------------------------------------------------ init */
  var mounts = [].slice.call(document.querySelectorAll('.side-cat'));
  if (!mounts.length) return;

  var t0 = performance.now();
  function clock() { return (performance.now() - t0) / 1000; }

  var cats = mounts.map(function (m) {
    var c = {
      r: build(m), st: newState(),
      eng: false, engAt: -99, leftAt: -99, near: false, forceTo: -99, on: false,
      bph: Math.random() * TAU,
      tTw: 3 + Math.random() * 5, twAt: -99, twR: false,
      tWag: 4 + Math.random() * 6, wagAt: -99, wagAmp: 0.7,
      tFlk: 6 + Math.random() * 8, flkAt: -99,
      tStr: 12 + Math.random() * 10, strAt: -99,
      tCurl: 35 + Math.random() * 30, curlAt: -99, curlTo: 0,
      perkAt: -99, rect: null, rectAt: -1e9
    };
    apply(c.r, c.st);
    return c;
  });

  /* click / keyboard easter egg — opt-in, never autoplay. A single click (or
     Enter/Space) only perks the ears; the audio itself only toggles on five
     clicks within 3s of each other (a rolling window — filtering out clicks
     older than 3s each time is the reset, no separate timer needed). */
  var audio = document.getElementById('chill');
  var clickTimes = [];
  function toggle() {
    cats.forEach(function (c) { c.perkAt = clock(); });
    if (!audio) return;
    var now = clock();
    clickTimes = clickTimes.filter(function (t) { return now - t < 3; });
    clickTimes.push(now);
    if (clickTimes.length < 5) return;
    clickTimes.length = 0;
    if (audio.paused) audio.play().catch(function () {}); else audio.pause();
  }
  cats.forEach(function (c) {
    c.r.svg.addEventListener('click', toggle);
    c.r.svg.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
  if (audio) {
    var setOn = function (on) {
      cats.forEach(function (c) {
        c.on = on;
        c.r.svg.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    };
    audio.addEventListener('play', function () { setOn(true); });
    audio.addEventListener('pause', function () { setOn(false); });
    audio.addEventListener('ended', function () { setOn(false); });
  }

  if (reduce) return;   /* static night pose, already rendered */

  /* pointer proximity */
  var pX = -1e5, pY = -1e5, moved = false;
  window.addEventListener('pointermove', function (e) { pX = e.clientX; pY = e.clientY; moved = true; }, { passive: true });
  document.addEventListener('mouseleave', function () { pX = pY = -1e5; moved = true; });

  var deer = document.querySelector('.side__deer');
  if (deer) deer.addEventListener('mouseenter', function () {
    cats.forEach(function (c) { c.forceTo = clock() + 2.2; });
  });

  var raf = 0, last = 0, prev = 0;
  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (ts - last < 15) return;           /* cap at ~60fps */
    last = ts;
    var now = (ts - t0) / 1000;
    var dt = prev ? Math.min(now - prev, 0.1) : 0.016;
    prev = now;
    for (var i = 0; i < cats.length; i++) {
      var c = cats[i];
      if (moved) {
        if (now - c.rectAt > 0.25) { c.rect = c.r.svg.getBoundingClientRect(); c.rectAt = now; }
        var dx = pX - (c.rect.left + c.rect.width * 0.79), dy = pY - (c.rect.top + c.rect.height * 0.46);
        c.near = dx * dx + dy * dy < NEAR * NEAR;
      }
      step(c, now, dt);
    }
    moved = false;
  }
  function start() { if (!raf) { prev = 0; last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  if (!document.hidden) start();
}
