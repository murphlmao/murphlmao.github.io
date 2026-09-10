/* r4 — walker.js
   Footer cat. The r3-cat CSS walker, grown up: same flat silhouette (capsule
   body, round head, two triangle ears, four simple legs, long upright tail),
   drawn on a canvas so it can sit, groom, stretch, lie down, turn round and
   watch the pointer. Every pose is one small parameter vector and the live
   pose eases toward its target, so nothing snaps.

   Contract:
     - injects `canvas.walker` into `.foot__walk` (walker.css places it)
     - gated by html[data-walker] + the `tweakchange` event
     - colours: --cat silhouette (--muted fallback), --accent eyes
     - pauses on document.hidden; prefers-reduced-motion = one static sit
     - window.Walker.position() -> {x, dir, visible} in strip pixels
     - window.Walker.renderAt(ctx, state, t, x, groundY, dir) is a deterministic
       pose renderer for _animals-debug.html (frame() kept as a thin alias) */
(function () {
  'use strict';

  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var PI = Math.PI, TAU = PI * 2, sin = Math.sin, cos = Math.cos, sqrt = Math.sqrt, abs = Math.abs;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function toward(cur, tgt, rate, dt) { return tgt + (cur - tgt) * Math.exp(-rate * dt); }

  var COL = { body: '#3A3344', accent: '#F5A742' };
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    COL.body = cs.getPropertyValue('--cat').trim() || cs.getPropertyValue('--muted').trim() || '#3A3344';
    COL.accent = cs.getPropertyValue('--accent').trim() || '#F5A742';
  }

  /* ---------- shape primitives (same vocabulary as critters.js) ---------- */
  function leg(g, ax, ay, fx, fy, L, bend, w0, w1) {
    var dx = fx - ax, dy = fy - ay, d = sqrt(dx * dx + dy * dy) || 1e-3;
    if (d > L - 0.4) { var s = (L - 0.4) / d; dx *= s; dy *= s; d = L - 0.4; fx = ax + dx; fy = ay + dy; }
    var h = Math.min(L * 0.17, sqrt(Math.max(0, L * L * 0.25 - d * d * 0.25)));
    var ux = dx / d, uy = dy / d;
    var kx = ax + dx * 0.5 + uy * h * bend, ky = ay + dy * 0.5 - ux * h * bend;
    var d1x = kx - ax, d1y = ky - ay, l1 = sqrt(d1x * d1x + d1y * d1y) || 1e-3;
    var d2x = fx - kx, d2y = fy - ky, l2 = sqrt(d2x * d2x + d2y * d2y) || 1e-3;
    var n1x = d1y / l1, n1y = -d1x / l1, n2x = d2y / l2, n2y = -d2x / l2;
    var mx = n1x + n2x, my = n1y + n2y, ml = sqrt(mx * mx + my * my) || 1e-3;
    var wk = (w0 + w1) * 0.25, wa = w0 * 0.5, wf = w1 * 0.5;
    var mk = wk * Math.min(1.6, 2 / ml);
    mx /= ml; my /= ml;
    g.beginPath();
    g.moveTo(ax + n1x * wa, ay + n1y * wa);
    g.lineTo(kx + mx * mk, ky + my * mk);
    g.lineTo(fx + n2x * wf, fy + n2y * wf);
    g.lineTo(fx - n2x * wf, fy - n2y * wf);
    g.lineTo(kx - mx * mk, ky - my * mk);
    g.lineTo(ax - n1x * wa, ay - n1y * wa);
    g.closePath();
    g.fill();
  }
  function dot(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }

  /* ---------- pose vector ---------- */
  /* capsule body from A (rear, radius ar) to B (front, radius br); head centre;
     look 0..1 faces the reader; four feet + per-leg reach; tail bezier
     (start derived from the body rear); squash for the turn. */
  var KEYS = ['ax', 'ay', 'ar', 'bx', 'by', 'br', 'hx', 'hy', 'look', 'earUp',
    'f0x', 'f0y', 'f1x', 'f1y', 'f2x', 'f2y', 'f3x', 'f3y', 'L0', 'L1', 'L2', 'L3',
    't1x', 't1y', 't2x', 't2y', 't3x', 't3y', 'squash'];
  /* ease rate per key: body/head brisk, tail lags */
  var RATE = [7, 7, 7, 7, 7, 7, 8, 8, 7, 9,
    9, 9, 9, 9, 9, 9, 9, 9, 8, 8, 8, 8,
    4.5, 4.5, 4, 4, 3.5, 3.5, 20];
  function pose(o) { var p = {}; for (var i = 0; i < KEYS.length; i++) p[KEYS[i]] = o[KEYS[i]] === undefined ? 0 : o[KEYS[i]]; return p; }
  function copyPose(a, out) { for (var i = 0; i < KEYS.length; i++) out[KEYS[i]] = a[KEYS[i]]; }
  function lerpPose(a, b, t, out) { for (var i = 0; i < KEYS.length; i++) { var k = KEYS[i]; out[k] = a[k] + (b[k] - a[k]) * t; } }

  var STAND = pose({ ax: -15, ay: -19, ar: 8, bx: 14, by: -20, br: 8.5, hx: 24, hy: -30, earUp: 1,
    f0x: -18, f0y: 0, f1x: -11, f1y: 0, f2x: 10, f2y: 0, f3x: 17, f3y: 0, L0: 19, L1: 19, L2: 20, L3: 20,
    t1x: -33, t1y: -18, t2x: -34, t2y: -38, t3x: -25, t3y: -46, squash: 1 });
  var SIT = pose({ ax: -6, ay: -9.5, ar: 9.5, bx: 6, by: -24, br: 7.5, hx: 12, hy: -34, look: 0.1, earUp: 1,
    f0x: -9, f0y: 0, f1x: -3, f1y: 0, f2x: 5, f2y: 0, f3x: 10, f3y: 0, L0: 10, L1: 10, L2: 23.5, L3: 23.5,
    t1x: -24, t1y: -3, t2x: -16, t2y: 4, t3x: 9, t3y: -1, squash: 1 });
  var LIE = pose({ ax: -12, ay: -7.5, ar: 7.5, bx: 11, by: -8.5, br: 8, hx: 21, hy: -15, look: 0.2, earUp: 0.9,
    f0x: -12, f0y: -4, f1x: -8, f1y: -4, f2x: 14, f2y: -1, f3x: 19, f3y: -1, L0: 6, L1: 6, L2: 9, L3: 9,
    t1x: -32, t1y: -6, t2x: -36, t2y: -16, t3x: -27, t3y: -18, squash: 1 });
  var BOW = pose({ ax: -12, ay: -25, ar: 8, bx: 13, by: -12, br: 8, hx: 25, hy: -9, look: 0, earUp: 0.8,
    f0x: -15, f0y: 0, f1x: -9, f1y: 0, f2x: 26, f2y: 0, f3x: 31, f3y: 0, L0: 25, L1: 25, L2: 20, L3: 22,
    t1x: -26, t1y: -30, t2x: -30, t2y: -46, t3x: -20, t3y: -50, squash: 1 });
  var LOOK = pose(STAND); LOOK.look = 1; LOOK.hx = 23; LOOK.hy = -31; LOOK.t3x = -22; LOOK.t3y = -48;

  /* pose target for a state at progress u */
  function poseTarget(state, u, out) {
    switch (state) {
      case 'sit': copyPose(SIT, out); break;
      case 'lie': copyPose(LIE, out); break;
      case 'look': copyPose(LOOK, out); break;
      case 'sitlook': copyPose(SIT, out); out.look = 1; out.hy = -35; break;
      case 'groom':
        copyPose(SIT, out);
        var w = smooth(Math.min(1, u * 6)) * smooth(Math.min(1, (1 - u) * 6));   /* paw up envelope */
        var ph = u * TAU * 4;                                                     /* four wipes */
        out.f3x = lerp(SIT.f3x, 15 + cos(ph) * 2.5, w);
        out.f3y = lerp(SIT.f3y, -28 - abs(sin(ph)) * 4, w);
        out.L3 = lerp(SIT.L3, 16, w);
        out.hy = lerp(SIT.hy, -31 + abs(sin(ph)) * 1.5, w);
        out.hx = lerp(SIT.hx, 10, w);
        out.look = lerp(SIT.look, 0.35, w);
        break;
      case 'stretch':
        if (u < 0.3) lerpPose(STAND, BOW, smooth(u / 0.3), out);
        else if (u < 0.7) { copyPose(BOW, out); out.hy += sin((u - 0.3) / 0.4 * PI) * 2; }
        else lerpPose(BOW, STAND, smooth((u - 0.7) / 0.3), out);
        break;
      case 'turn':
        /* head faces you first (symmetric), then the body flips behind it */
        copyPose(LOOK, out);
        out.squash = u < 0.45 ? 1 : u < 0.65 ? cos((u - 0.45) / 0.2 * PI) : -1;
        break;
      default: copyPose(STAND, out); break;   /* walk */
    }
  }
  function isPosed(s) { return s !== 'walk'; }

  /* ---------- drawing ---------- */
  var PH = [0, 0.5, 0.25, 0.75];   /* hind0, hind1, fore2, fore3 */
  var FX = ['f0x', 'f1x', 'f2x', 'f3x'], FY = ['f0y', 'f1y', 'f2y', 'f3y'], LK = ['L0', 'L1', 'L2', 'L3'];
  var DUTY = 0.62, STRIDE = 15, LIFT = 4.5;
  var _fx = 0, _fy = 0;
  function footPos(p) {
    p = p - Math.floor(p);
    var ex = DUTY * STRIDE;
    if (p < DUTY) { _fx = ex * 0.5 - ex * (p / DUTY); _fy = 0; }
    else { var s = (p - DUTY) / (1 - DUTY); _fx = -ex * 0.5 + ex * smooth(s); _fy = -LIFT * sin(PI * s); }
  }

  /* P = pose, gait = 0..1 walking amount, cycle = leg phase, bob = body y offset,
     eyes = 0..1, earTw = ear twitch angle, sway = tail sway offset */
  function drawCat(g, P, gait, cycle, bob, eyes, earTw, sway) {
    g.fillStyle = COL.body; g.strokeStyle = COL.body;
    var sq = P.squash;
    if (abs(sq) < 0.03) return;
    g.save();
    if (sq < 0.999) g.scale(sq, 1);

    var ax = P.ax, ay = P.ay + bob, bx = P.bx, by = P.by + bob;
    /* leg anchors sit inside the two body circles */
    var hax = ax + 1, hay = ay + 2, fax = bx - 1.5, fay = by + 2;
    var i, fx, fy, hind;
    for (i = 0; i < 4; i++) {
      hind = i < 2;
      footPos(cycle + PH[i]);
      fx = lerp(P[FX[i]], (hind ? STAND.f0x + (i === 1 ? 7 : 0) : STAND.f2x + (i === 3 ? 7 : 0)) + _fx, gait);
      fy = lerp(P[FY[i]], _fy, gait);
      leg(g, hind ? hax : fax, hind ? hay : fay, fx, fy, P[LK[i]] * (1 - gait) + 19.5 * gait, hind ? -1 : 1, hind ? 5.0 : 4.6, 3.6);
    }

    /* tail: from the rear of the body, lagged bezier */
    var tsx = ax - P.ar * 0.55, tsy = ay - P.ar * 0.35;
    g.lineWidth = 4.6; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(tsx, tsy);
    g.bezierCurveTo(P.t1x + sway, P.t1y + bob, P.t2x + sway * 1.6, P.t2y + bob, P.t3x + sway * 2.2, P.t3y + bob);
    g.stroke();

    /* body capsule */
    var dx = bx - ax, dy = by - ay, dl = sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / dl, ny = dx / dl, ang = Math.atan2(dy, dx);
    g.beginPath();
    g.arc(ax, ay, P.ar, ang + PI * 0.5, ang + PI * 1.5);
    g.lineTo(bx - nx * P.br, by - ny * P.br);
    g.arc(bx, by, P.br, ang - PI * 0.5, ang + PI * 0.5);
    g.closePath();
    g.fill();

    /* head + ears */
    var hx = P.hx, hy = P.hy + bob * 0.7, R = 7.6, look = smooth(P.look);
    dot(g, hx, hy, R);
    var eUp = P.earUp;
    catEar(g, hx, hy, lerp(-2.05, -2.40, look) + earTw, R, eUp);
    catEar(g, hx, hy, lerp(-1.15, -0.75, look), R, eUp);
    /* eyes only when looking at you */
    if (eyes > 0.02 && look > 0.3) {
      g.globalAlpha = clamp(eyes, 0, 1) * smooth((look - 0.3) / 0.5);
      g.fillStyle = COL.accent;
      dot(g, hx - 2.7, hy - 0.6, 1.2); dot(g, hx + 2.7, hy - 0.6, 1.2);
      g.globalAlpha = 1; g.fillStyle = COL.body;
    }
    g.restore();
  }
  function catEar(g, hx, hy, a, R, up) {
    var half = 0.42, tip = R + 6 * up;
    g.beginPath();
    g.moveTo(hx + cos(a - half) * (R - 1), hy + sin(a - half) * (R - 1));
    g.lineTo(hx + cos(a) * tip, hy + sin(a) * tip);
    g.lineTo(hx + cos(a + half) * (R - 1), hy + sin(a + half) * (R - 1));
    g.closePath();
    g.fill();
  }

  /* ---------- deterministic render (debug harness) ---------- */
  var dP = pose(STAND);
  function renderAt(g, state, t, x, groundY, dir) {
    poseTarget(state, t, dP);
    /* harness only: show the stand -> pose blend the live easing produces */
    if (state === 'sit' || state === 'lie' || state === 'sitlook') lerpPose(STAND, dP, smooth(t), dP);
    var gait = state === 'walk' ? 1 : 0;
    var bob = gait ? sin(t * TAU * 2) * 0.9 : 0;
    var eyes = state === 'look' || state === 'sitlook' || state === 'turn' ? 1 : 0;
    g.save();
    g.translate(x, groundY);
    g.scale(dir === -1 ? -1 : 1, 1);
    drawCat(g, dP, gait, t, bob, eyes, 0, gait ? sin(t * TAU) * 1.5 : 0);
    g.restore();
  }

  /* ---------- live instance ---------- */
  var POOL = ['sit', 'groom', 'stretch', 'lie', 'turn', 'sitlook'];
  var WGT = [3, 3, 3, 2, 3, 1];
  var DUR = { sit: [2.5, 5.5], groom: [3.2, 4.4], stretch: [2.8, 2.8], lie: [4, 7], turn: [1.6, 1.6], sitlook: [2, 3.5] };
  var api = { position: function () { return { x: 0, dir: 1, visible: false }; }, renderAt: null, frame: null };
  var POSN = { x: 0, dir: 1, visible: false };

  function mount() {
    var strip = document.querySelector('.foot__walk');
    if (!strip || strip.querySelector('canvas.walker')) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'walker';
    canvas.setAttribute('aria-hidden', 'true');
    strip.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var W = 0, H = 56, GY = 52, dpr = 1;
    var rectL = 0, rectT = 0, rectB = 0, rectAt = 0;

    function on() { return document.documentElement.dataset.walker !== 'off'; }
    function measure() { var r = strip.getBoundingClientRect(); rectL = r.left; rectT = r.top; rectB = r.bottom; return r; }
    function resize() {
      var r = measure();
      W = r.width; H = r.height || 56; GY = H - 4;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) still();
    }
    var rt = null;
    function queueResize() { clearTimeout(rt); rt = setTimeout(resize, 120); }
    window.addEventListener('resize', queueResize);
    window.addEventListener('load', resize);
    if (window.ResizeObserver) new ResizeObserver(queueResize).observe(strip);

    /* state */
    var P = pose(STAND), T = pose(STAND);
    var x = -50, dir = 1, v = 0, cycle = 0, gait = 0, bob = 0, eyes = 0, earTw = 0, sway = 0;
    var state = 'walk', st = 0, sdur = 4, lastAction = '';
    var offAt = 0, waiting = 0, twAt = 3, twT = 0, wgt = new Float32Array(POOL.length);
    var ptrX = -1e4, ptrY = -1e4, ptrT = -9, watch = 0;
    var glance = 0, glanceDir = 0, gAt = 0;
    var CRUISE = 22, cruise = CRUISE;

    window.addEventListener('pointermove', function (e) { ptrX = e.clientX; ptrY = e.clientY; ptrT = performance.now(); }, { passive: true });

    function setState(s, d) { state = s; st = 0; sdur = d; if (isPosed(s)) lastAction = s; }
    function pickAction() {
      var total = 0, i;
      for (i = 0; i < POOL.length; i++) { wgt[i] = POOL[i] === lastAction ? 0 : WGT[i]; total += wgt[i]; }
      var r = Math.random() * total;
      for (i = 0; i < POOL.length; i++) { r -= wgt[i]; if (r <= 0) return POOL[i]; }
      return 'sit';
    }

    function step(dt, now) {
      st += dt;
      /* --- watch the pointer when it comes near the footer --- */
      var near = 0;
      if (now - ptrT < 2500) {
        var py = ptrY - rectT, px = ptrX - rectL;
        var dy = py < 0 ? -py : (py > H ? py - H : 0);
        var dx = abs(px - (x + dir * 10));
        if (dy < 140 && px > -40 && px < W + 40) near = smooth((220 - sqrt(dx * dx + dy * dy * 0.6)) / 160);
      }
      watch = toward(watch, near, 4, dt);

      /* --- glance at a passing critter --- */
      if (now - gAt > 200) {
        gAt = now;
        var list = window.Critters && window.Critters.positions ? window.Critters.positions() : null, gT = 0;
        if (list) for (var ci = 0; ci < list.length; ci++) {
          var o = list[ci]; if (!o.visible) continue;
          var od = abs(o.x - x);
          if (od < 130) { gT = Math.max(gT, smooth((130 - od) / 80)); glanceDir = o.x > x ? 1 : -1; }
        }
        glance = gT;
      }

      /* --- state machine --- */
      if (st >= sdur) {
        if (state === 'turn') { dir = -dir; P.squash = 1; }   /* scale stays continuous: dir*-1 == -dir*1 */
        if (isPosed(state)) { setState('walk', rand(3.5, 9)); cruise = CRUISE * rand(0.85, 1.15); }
        else if (x < 30 || x > W - 30 || W < 240) sdur = st + rand(1.5, 3);
        else { var a = pickAction(); setState(a, rand(DUR[a][0], DUR[a][1])); }
      }

      var moving = state === 'walk';
      var vT = moving ? cruise * Math.max(0, 1 - 1.4 * watch) : 0;   /* stops dead to watch you */
      v = toward(v, vT, 3.4, dt);
      if (v < 0.15) v = 0;
      x += dir * v * dt;
      cycle += v * dt / STRIDE;
      if (cycle > 1e6) cycle -= 1e6;
      gait = toward(gait, v > 1 ? 1 : 0, 5, dt);

      /* off-stage recycle */
      if ((x > W + 50 && dir > 0) || (x < -50 && dir < 0)) waiting = 1;
      if (waiting) {
        if (!offAt) offAt = now + rand(1000, 4000);
        if (now >= offAt) {
          waiting = 0; offAt = 0;
          dir = Math.random() < 0.5 ? 1 : -1;
          x = dir > 0 ? -48 : W + 48;
          setState('walk', rand(3.5, 9));
        }
      }

      /* --- pose target, then the pointer / glance overrides --- */
      poseTarget(state, sdur > 0 ? Math.min(1, st / sdur) : 0, T);
      var gl = glance * (1 - watch) * (state === 'turn' ? 0 : 1);
      if (gl > 0.02) {
        var behind = glanceDir !== dir;
        T.look = lerp(T.look, behind ? 1 : 0.5, gl);
        T.hy = lerp(T.hy, T.hy - 1.5, gl);
      }
      if (watch > 0.02 && state !== 'turn') {
        T.look = lerp(T.look, 1, watch);
        T.hy = lerp(T.hy, T.hy - 1.5, watch);
        T.earUp = 1;
        if (state === 'walk') { T.t3x = lerp(T.t3x, -20, watch); T.t3y = lerp(T.t3y, -49, watch); }
      }
      for (var i = 0; i < KEYS.length; i++) { var k = KEYS[i]; P[k] = toward(P[k], T[k], RATE[i], dt); }
      if (state === 'turn') P.squash = T.squash;    /* the flip itself is not eased */

      bob = sin(cycle * TAU * 2) * 0.9 * gait;
      eyes = toward(eyes, P.look > 0.6 ? 1 : 0, 8, dt);
      sway = sin(cycle * TAU) * 1.5 * gait + sin(now / 900) * 0.8;

      /* ear twitch now and then */
      twT -= dt;
      if (twT <= 0) { twAt -= dt; if (twAt <= 0) { twT = 0.3; twAt = rand(2.5, 8); } }
      earTw = twT > 0 ? 0.35 * sin((1 - twT / 0.3) * PI * 2) * (twT / 0.3) : 0;

      POSN.x = x; POSN.dir = dir; POSN.visible = on() && !waiting && x > -40 && x < W + 40;
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(x, GY);
      ctx.scale(dir, 1);
      drawCat(ctx, P, gait, cycle, bob, eyes, earTw, sway);
      ctx.restore();
    }

    var raf = null, prev = 0;
    function loop(t) {
      raf = requestAnimationFrame(loop);
      if (t - prev < 15) return;
      var dt = prev ? Math.min((t - prev) / 1000, 0.05) : 0.016;
      prev = t;
      if (t > rectAt) { rectAt = t + 250; measure(); }
      step(dt, t);
      render();
    }
    function play() { if (raf || reduce || !on() || document.hidden) return; prev = 0; raf = requestAnimationFrame(loop); }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }
    function still() {
      ctx.clearRect(0, 0, W, H);
      if (!on()) return;
      readColors();
      renderAt(ctx, 'sitlook', 1, Math.max(60, Math.round(W * 0.76)), GY, -1);
    }

    api.position = function () { return POSN; };

    document.addEventListener('tweakchange', function (e) {
      var k = e.detail && e.detail.key;
      if (k === 'palette' || k === 'reset') readColors();
      if (k === 'walker' || k === 'palette' || k === 'reset') {
        if (!on()) { stop(); ctx.clearRect(0, 0, W, H); POSN.visible = false; }
        else if (reduce) still();
        else play();
      }
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else play(); });

    readColors();
    resize();
    if (reduce) still(); else play();
  }

  api.renderAt = function (g, state, t, x, groundY, dir) { readColors(); renderAt(g, state, t, x, groundY, dir); };
  api.frame = function (g, w, h, state, u, sc) {
    sc = sc || 1; g.save(); g.scale(sc, sc); api.renderAt(g, state, u, w * 0.42 / sc, (h - 12) / sc, 1); g.restore();
  };
  window.Walker = api;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
