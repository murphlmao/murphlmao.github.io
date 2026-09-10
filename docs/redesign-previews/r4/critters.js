/* r4 — critters.js
   Footer critter strip: a deer and a raccoon on the canvas.

   Drawing: flat paper-cut-out silhouettes. Every animal is a handful of filled
   shapes in one colour (`--cat`, `--muted` fallback); legs are one tapered
   polygon each with a single gentle bend, all four the same colour, no
   outlines, no far-side dimming. `--bg` is used only for cut-ins (the raccoon's
   mask and tail rings). `--accent` for eye dots, and only while the animal is
   looking at the reader (the raccoon's bandit eyes are always on).

   Motion: time-based; every parameter eases toward its target so poses blend.
   Feet are planted (stance moves back at body speed, swing arcs forward).

   Contract:
     window.Critters = { init, setEnabled(kind, on), positions(), renderAt }
     - gated by html[data-deer] / html[data-raccoon] + the `tweakchange` event
     - pauses on document.hidden; prefers-reduced-motion draws one static frame
     - hovering `.side__deer` makes the deer look at you (and summons it)
     - strip re-measured by ResizeObserver + load/resize
     - positions() returns a preallocated array for walker.js to glance at
     - renderAt(g, kind, state, t, x, groundY, dir) is a deterministic pose
       renderer used only by _animals-debug.html */
(function () {
  'use strict';

  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------------- math ---------------- */
  var PI = Math.PI, TAU = PI * 2;
  var sin = Math.sin, cos = Math.cos, sqrt = Math.sqrt, abs = Math.abs;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  /* frame-rate independent exponential ease toward a target */
  function toward(cur, tgt, rate, dt) { return tgt + (cur - tgt) * Math.exp(-rate * dt); }
  /* tiny spring on a Float32Array [value, velocity] pair: follow-through for tails/ears */
  function spring(s, i, target, k, damp, dt) {
    var v = s[i + 1] + ((target - s[i]) * k - s[i + 1] * damp) * dt;
    if (v > 300) v = 300; else if (v < -300) v = -300;
    s[i] += v * dt; s[i + 1] = v;
  }

  /* ---------------- colour ---------------- */
  var COL = { body: '#3A3344', bg: '#121016', accent: '#F5A742' };
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    COL.body = cs.getPropertyValue('--cat').trim() || cs.getPropertyValue('--muted').trim() || '#3A3344';
    COL.bg = cs.getPropertyValue('--bg').trim() || '#121016';
    COL.accent = cs.getPropertyValue('--accent').trim() || '#F5A742';
  }

  /* ---------------- shape primitives ---------------- */

  /* One leg = one filled polygon: anchor (inside the body) -> knee -> foot,
     tapered w0 -> w1, with a single bend of side `bend` (+1 knee forward,
     -1 hock backward). Length L caps the reach. */
  function leg(g, ax, ay, fx, fy, L, bend, w0, w1) {
    var dx = fx - ax, dy = fy - ay, d = sqrt(dx * dx + dy * dy) || 1e-3;
    if (d > L - 0.4) { var s = (L - 0.4) / d; dx *= s; dy *= s; d = L - 0.4; fx = ax + dx; fy = ay + dy; }
    var h = Math.min(L * 0.17, sqrt(Math.max(0, L * L * 0.25 - d * d * 0.25)));
    var ux = dx / d, uy = dy / d;
    var kx = ax + dx * 0.5 + uy * h * bend, ky = ay + dy * 0.5 - ux * h * bend;
    /* segment normals (forward-pointing for a downward leg) */
    var d1x = kx - ax, d1y = ky - ay, l1 = sqrt(d1x * d1x + d1y * d1y) || 1e-3;
    var d2x = fx - kx, d2y = fy - ky, l2 = sqrt(d2x * d2x + d2y * d2y) || 1e-3;
    var n1x = d1y / l1, n1y = -d1x / l1, n2x = d2y / l2, n2y = -d2x / l2;
    var mx = n1x + n2x, my = n1y + n2y, ml = sqrt(mx * mx + my * my) || 1e-3;
    var wk = (w0 + w1) * 0.5 * 0.5, wa = w0 * 0.5, wf = w1 * 0.5;
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

  /* leaf-shaped ear, base at (x,y) pointing along ang */
  function ear(g, x, y, ang, len, wid) {
    var cx = cos(ang), cy = sin(ang), px = -cy, py = cx;
    var mx = x + cx * len * 0.5, my = y + cy * len * 0.5;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(mx + px * wid, my + py * wid, x + cx * len, y + cy * len);
    g.quadraticCurveTo(mx - px * wid * 0.75, my - py * wid * 0.75, x, y);
    g.fill();
  }
  function dot(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  function blob(g, x, y, rx, ry, rot) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fill(); }

  /* Foot trajectory. p = phase, duty = stance fraction, ex = ground excursion,
     lift = swing height. Stance moves back at body speed -> no sliding. */
  var _fx = 0, _fy = 0;
  function footPos(p, duty, ex, lift) {
    p = p - Math.floor(p);
    if (p < duty) { _fx = ex * 0.5 - ex * (p / duty); _fy = 0; }
    else {
      var s = (p - duty) / (1 - duty);
      _fx = -ex * 0.5 + ex * smooth(s);
      _fy = -lift * sin(PI * s);
    }
  }

  /* ---------------- actors ---------------- */
  var S_TAIL = 0, S_EARA = 2, S_EARB = 4;
  function makeActor(kind) {
    return {
      kind: kind, state: 'gone', last: '',
      x: 0, dir: 1, face: 1, faceT: 1, speed: 0, vTarget: 0, cruise: 14,
      cycle: 0, gait: 0, neck: 0, yaw: 0, nod: 0, bob: 0, tail: 0, earA: 0, earB: 0,
      sit: 0, paw: 0, pawPh: 0, carry: 0, eyes: 0, roll: 0,
      s: new Float32Array(6),
      until: 0, nextEnter: 0, flickAt: 0, holdUntil: 0, stepAt: 0
    };
  }

  /* ================= DEER ================= */
  /* Designed at ~56px tall, drawn at DEER_SCALE. Facing +x, hooves at y = 0. */
  var DEER_SCALE = 0.84;
  var D_PH = [0, 0.25, 0.5, 0.75];         /* hindA, foreA, hindB, foreB */
  var D_STAND = [-3.5, -1.5, 2.5, 3.0];
  var D_HIP_X = -12, D_HIP_Y = -27, D_SH_X = 10, D_SH_Y = -28;

  function drawDeer(g, a) {
    var bob = a.bob, gait = a.gait;
    var duty = 0.62, stride = 20, ex = duty * stride, lift = 5;
    g.fillStyle = COL.body;

    /* legs first; the body covers the tops */
    var i, ax, ay, fx, fy, hind;
    for (i = 0; i < 4; i++) {
      hind = (i & 1) === 0;
      ax = hind ? D_HIP_X : D_SH_X; ay = (hind ? D_HIP_Y : D_SH_Y) + bob;
      footPos(a.cycle + D_PH[i], duty, ex, lift);
      fx = ax + lerp(D_STAND[i], _fx, gait);
      fy = lerp(0, _fy, gait);
      if (hind) leg(g, ax, ay, fx, fy, 29, -1, 7, 3.1);
      else leg(g, ax, ay, fx, fy, 29.5, 1, 6, 3.0);
    }

    /* tail: a short nub off the rump */
    ear(g, -18, -30 + bob, 2.55 + a.tail, 7, 2.6);

    /* body */
    g.beginPath();
    g.moveTo(12, -34.5 + bob);
    g.quadraticCurveTo(0, -36 + bob, -13, -33 + bob);
    g.quadraticCurveTo(-20, -31 + bob, -18.5, -25 + bob);
    g.quadraticCurveTo(-17, -20 + bob, -9, -21 + bob);
    g.quadraticCurveTo(0, -22.5 + bob, 10, -22 + bob);
    g.quadraticCurveTo(17.5, -23 + bob, 15.5, -30 + bob);
    g.closePath();
    g.fill();

    /* neck: poll position blends neutral / alert / grazing */
    var up = smooth(clamp(a.neck, 0, 1)), dn = smooth(clamp(-a.neck, 0, 1));
    var px = 21 + (17 - 21) * up + (30 - 21) * dn;
    var py = -47 + (-52 + 47) * up + (-14 + 47) * dn + bob + a.nod;
    var pitch = 0.18 + (-0.25 - 0.18) * up + (1.25 - 0.18) * dn;
    var bx = 8.5, by = -32 + bob;
    var ux = px - bx, uy = py - by, ul = sqrt(ux * ux + uy * uy) || 1;
    ux /= ul; uy /= ul;
    var nx = -uy, ny = ux;                     /* forward normal for an upward neck */
    var nw = 2.8;
    g.beginPath();
    g.moveTo(2, -35 + bob);
    g.quadraticCurveTo(bx + ux * ul * 0.55 - nx * 5.5, by + uy * ul * 0.55 - ny * 5.5, px - nx * nw, py - ny * nw);
    g.lineTo(px + nx * nw, py + ny * nw);
    g.quadraticCurveTo(bx + ux * ul * 0.5 + nx * 4, by + uy * ul * 0.5 + ny * 4, 15, -29 + bob);
    g.closePath();
    g.fill();

    /* head, in head space (poll at origin, +x nose) */
    var yaw = smooth(a.yaw);
    g.save();
    g.translate(px, py);
    g.rotate(pitch * (1 - yaw));

    /* ears: profile = both up-back, one behind the other; front = splayed */
    var eW = lerp(2.4, 2.8, yaw), eK = -pitch * 0.7 * (1 - yaw);   /* ears stay up while the head pitches */
    ear(g, lerp(0, -3.2, yaw), lerp(-1.8, -2.2, yaw), lerp(-2.0, -2.4, yaw) + a.earA + eK, 7, eW);
    ear(g, lerp(2.6, 3.2, yaw), lerp(-2.2, -2.2, yaw), lerp(-1.62, -0.75, yaw) + a.earB + eK, 7, eW);

    /* skull: compact wedge in profile -> round face front-on; the muzzle shrinks away */
    blob(g, lerp(5.0, 0, yaw), lerp(1.2, 1.5, yaw), lerp(6.0, 5.2, yaw), lerp(3.5, 5.2, yaw), lerp(0.28, 0, yaw));
    if (yaw < 0.98) {
      var m = 1 - yaw;
      g.beginPath();
      g.moveTo(6.5, -0.6 * m);
      g.quadraticCurveTo(10.5 * m + 6.5 * yaw, 1, 12 * m + 6.5 * yaw, 4.2 * m + 2);
      g.quadraticCurveTo(10 * m + 6.5 * yaw, 6 * m + 3, 6, 4.6 * m + 2);
      g.closePath();
      g.fill();
    }

    /* antlers: two beams; profile = nearly overlapping, front = spread */
    g.strokeStyle = COL.body; g.lineWidth = 1.9; g.lineCap = 'round';
    var spread = lerp(1.0, 4.0, yaw);
    antler(g, 2.2 - spread, -3.5, -1, yaw);
    antler(g, 2.2 + spread, -3.5 + lerp(0.8, 0, yaw), lerp(-1, 1, yaw), yaw);

    /* eyes only when it is looking at you */
    if (a.eyes > 0.02) {
      g.globalAlpha = clamp(a.eyes, 0, 1);
      g.fillStyle = COL.accent;
      dot(g, -2.3, 0.6, 1.15); dot(g, 2.3, 0.6, 1.15);
      g.globalAlpha = 1;
    }
    g.restore();
  }

  /* one antler: beam up and toward sx, one tine */
  function antler(g, bx, by, sx, yaw) {
    var h = lerp(10, 11, yaw);
    g.beginPath();
    g.moveTo(bx, by);
    g.quadraticCurveTo(bx + sx * 0.5, by - h * 0.6, bx + sx * 3.8, by - h);
    g.moveTo(bx + sx * 0.6, by - h * 0.45); g.lineTo(bx + sx * 4.2, by - h * 0.55);
    g.stroke();
  }

  /* ================= RACCOON ================= */
  /* Low and chunky. Facing +x, paws at y = 0. */
  var RACC_SCALE = 0.95;
  var R_PH = [0, 0.25, 0.5, 0.75];
  var R_STAND = [-2.5, -1.5, 2.0, 2.5];
  var R_HIP_X = -10, R_HIP_Y = -13, R_SH_X = 9, R_SH_Y = -13;
  var R_RINGS = [0.01, 11, 2.6, 4.2, 2.6, 4.2, 2.6, 60];
  var NO_DASH = [];

  function drawRaccoon(g, a) {
    var bob = a.bob, gait = a.gait, sit = smooth(a.sit);
    var duty = 0.64, stride = 9, ex = duty * stride, lift = 2.6;
    g.fillStyle = COL.body;

    /* the whole animal pivots about the hip when it sits up */
    var rot = -sit * 0.95 + a.roll, drop = sit * 7;
    var cr = cos(rot), sr = sin(rot);

    /* hind legs: stubs; when sitting they fold forward as haunches */
    var i, fx, fy;
    for (i = 0; i < 4; i += 2) {
      footPos(a.cycle + R_PH[i], duty, ex, lift);
      fx = R_HIP_X + lerp(R_STAND[i], _fx, gait) + sit * 7;
      fy = lerp(0, _fy, gait);
      leg(g, R_HIP_X, R_HIP_Y + bob + drop, fx, fy, 15, -1, 7.5, 4.2);
    }

    /* tail: thick curve with bg rings clipped by dashing */
    var t0x = -16 + sit * 3, t0y = -12 + bob + drop;
    var c1x = lerp(-28, -22, sit), c1y = lerp(-8, 0, sit) + bob;
    var t1x = lerp(-33, -35, sit), t1y = lerp(-26, -3, sit) + bob;
    g.strokeStyle = COL.body; g.lineWidth = 7.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(t0x, t0y); g.quadraticCurveTo(c1x, c1y, t1x, t1y); g.stroke();
    g.strokeStyle = COL.bg; g.lineWidth = 9; g.lineCap = 'butt';
    g.setLineDash(R_RINGS);
    g.beginPath(); g.moveTo(t0x, t0y); g.quadraticCurveTo(c1x, c1y, t1x, t1y); g.stroke();
    g.setLineDash(NO_DASH);

    g.save();
    g.translate(R_HIP_X, R_HIP_Y + bob + drop);
    g.rotate(rot);
    g.translate(-R_HIP_X, -R_HIP_Y);

    /* body: hunched arch */
    g.beginPath();
    g.moveTo(14, -14);
    g.quadraticCurveTo(13, -23.5, 0, -25);
    g.quadraticCurveTo(-13, -26, -17, -17);
    g.quadraticCurveTo(-19.5, -9, -10, -6.5);
    g.quadraticCurveTo(0, -5, 12, -6.5);
    g.quadraticCurveTo(18, -8, 14, -14);
    g.closePath();
    g.fill();

    /* fore legs: walk stubs, or held-up paws when sitting / rummaging */
    var hold = Math.max(sit, a.paw);
    for (i = 1; i < 4; i += 2) {
      footPos(a.cycle + R_PH[i], duty, ex, lift);
      fx = R_SH_X + lerp(R_STAND[i], _fx, gait);
      fy = lerp(0, _fy, gait);
      var ph = a.pawPh + (i === 1 ? 0 : PI);
      var hx = R_SH_X + 6 + (i === 1 ? -1.5 : 1.5) + cos(ph) * a.paw * 2.5;
      var hy = R_SH_Y + 6 - abs(sin(ph)) * a.paw * 3 + sit * 1;
      /* sitting: paws in front of the chest (in the rotated frame they hang forward) */
      fx = lerp(fx, hx, hold); fy = lerp(fy, hy, hold);
      leg(g, R_SH_X, R_SH_Y, fx, fy, 14, 1, 6.5, 4.0);
    }

    /* head: round, low, with a pointed snout */
    var nb = clamp(a.neck, -1, 1);
    var hAng = (nb < 0 ? -nb * 0.9 : -nb * 0.35) - rot * 0.85;
    var yaw = smooth(a.yaw);
    var hcx = 19.5 + (nb < 0 ? 2.5 * -nb : 0), hcy = -16 + (nb < 0 ? 5.5 * -nb : -2.5 * nb) + a.nod;
    g.save();
    g.translate(hcx, hcy);
    g.rotate(hAng);
    /* small rounded ears */
    dot(g, lerp(-3.8, -5.4, yaw), -6.0, 2.7);
    dot(g, lerp(2.8, 5.4, yaw), -6.3, 2.7);
    /* skull */
    blob(g, 0, 0, lerp(7.2, 7.4, yaw), 6.5, 0);
    /* snout: pointed wedge, foreshortens away when facing the reader */
    var sl = 1 - yaw;
    g.beginPath();
    g.moveTo(3, -3.5 * sl - 1 * yaw);
    g.quadraticCurveTo(8 * sl + 2, -1, 11.5 * sl + 2, 2.2);
    g.quadraticCurveTo(8 * sl + 2, 4, 3, 4.5 * sl + 1 * yaw);
    g.closePath();
    g.fill();
    /* bandit mask: one --bg band */
    g.fillStyle = COL.bg;
    blob(g, lerp(1.0, 0, yaw), -1.5, lerp(7.0, 7.8, yaw), 2.2, lerp(0.10, 0, yaw));
    /* eyes: always on; they are the raccoon */
    if (a.eyes > 0.02) {
      g.globalAlpha = clamp(a.eyes, 0, 1);
      g.fillStyle = COL.accent;
      dot(g, lerp(-1.4, -2.8, yaw), -1.4, 1.05);
      dot(g, lerp(3.4, 2.8, yaw), -1.4, 1.05);
      g.globalAlpha = 1;
    }
    /* nose tip */
    g.fillStyle = COL.bg;
    if (sl > 0.3) dot(g, 11.5 * sl + 2 - 0.4, 2.2, 0.9 * sl);
    g.restore();

    /* carried thing: a small disc with a bg rim, in the paws or the mouth */
    if (a.carry > 0.02) {
      g.globalAlpha = clamp(a.carry, 0, 1);
      var ox = sit > 0.5 ? R_SH_X + 9.5 : hcx + 12, oy = sit > 0.5 ? R_SH_Y + 3.5 : hcy + 3.5;
      g.fillStyle = COL.bg; dot(g, ox, oy, 4.0);
      g.fillStyle = COL.body; dot(g, ox, oy, 2.9);
      g.globalAlpha = 1;
    }
    g.restore();
  }

  /* ================= deterministic poses (debug harness) ================= */
  function poseDeer(a, state, t) {
    a.gait = 0; a.neck = 0; a.yaw = 0; a.nod = 0; a.bob = 0; a.tail = 0; a.earA = 0; a.earB = 0;
    a.cycle = t; a.face = 1; a.eyes = 0;
    switch (state) {
      case 'walk':
        a.gait = 1; a.bob = sin(t * TAU * 2) * 0.8; a.nod = sin(t * TAU * 2 - 0.9) * 0.5;
        a.neck = -0.05; a.tail = sin(t * TAU) * 0.15;
        break;
      case 'graze':
        a.neck = -smooth(Math.min(1, t * 2));
        a.nod = t > 0.5 ? (sin((t - 0.5) * TAU * 3) * 0.6 - 0.6) : 0;
        a.earA = -0.2; a.earB = 0.15; a.tail = sin(t * TAU * 2) * 0.3;
        break;
      case 'look':
        a.neck = smooth(Math.min(1, t * 2)); a.yaw = smooth(clamp((t - 0.15) * 1.8, 0, 1));
        a.eyes = smooth(clamp((t - 0.45) * 3, 0, 1)); a.tail = 0.1;
        break;
      case 'stare':
        a.neck = 1; a.yaw = 1; a.eyes = 1;
        break;
      case 'pause':
        a.neck = 0.15 + sin(t * TAU) * 0.05; a.earA = sin(t * TAU * 3) * 0.3; a.earB = -sin(t * TAU * 2) * 0.25;
        break;
      case 'turn':
        a.neck = 0.6; a.yaw = 1; a.eyes = 1; a.face = cos(t * PI);
        break;
    }
    return a;
  }

  function poseRaccoon(a, state, t) {
    a.gait = 0; a.sit = 0; a.neck = 0; a.yaw = 0; a.nod = 0; a.bob = 0; a.paw = 0; a.pawPh = 0; a.carry = 0;
    a.cycle = t; a.face = 1; a.eyes = 1; a.roll = 0;
    switch (state) {
      case 'walk':
        a.gait = 1; a.bob = sin(t * TAU * 2) * 0.7; a.neck = -0.2; a.nod = sin(t * TAU * 2 - 1) * 0.4; a.roll = sin(t * TAU) * 0.05;
        break;
      case 'rummage':
        a.neck = -1; a.paw = 1; a.pawPh = t * TAU * 2; a.nod = sin(t * TAU * 2) * 0.8; a.eyes = 0.3;
        break;
      case 'sit':
        a.sit = smooth(Math.min(1, t * 1.6)); a.neck = 0.6 * a.sit;
        a.yaw = smooth(clamp((t - 0.3) * 2, 0, 1));
        break;
      case 'situp':
        a.sit = 1; a.neck = 0.6; a.yaw = 1;
        break;
      case 'carry':
        a.gait = 1; a.bob = sin(t * TAU * 2) * 0.6; a.neck = 0.1; a.carry = 1;
        break;
      case 'hold':
        a.sit = 1; a.neck = 0.4; a.yaw = 0.6; a.carry = 1;
        break;
    }
    return a;
  }

  var _scratch = { deer: makeActor('deer'), raccoon: makeActor('raccoon') };

  function paintActor(g, kind, a, x, groundY, dir) {
    var f = a.face;
    if (abs(f) < 0.03) return;
    var sc = kind === 'raccoon' ? RACC_SCALE : DEER_SCALE;
    g.save();
    g.translate(x, groundY);
    g.scale(dir * sc * f, sc);
    if (kind === 'raccoon') drawRaccoon(g, a); else drawDeer(g, a);
    g.restore();
  }

  function renderAt(g, kind, state, t, x, groundY, dir) {
    var a = _scratch[kind === 'raccoon' ? 'raccoon' : 'deer'];
    if (kind === 'raccoon') poseRaccoon(a, state, t); else poseDeer(a, state, t);
    paintActor(g, kind, a, x, groundY, dir === -1 ? -1 : 1);
  }

  /* ================= live simulation ================= */
  var POS = [{ kind: 'deer', x: -1e4, dir: 1, visible: false }, { kind: 'raccoon', x: -1e4, dir: 1, visible: false }];

  function initCritters() {
    var canvas = document.querySelector('canvas.critters');
    if (!canvas) return;
    var strip = canvas.closest('.foot__walk') || canvas.parentElement;
    var ctx = canvas.getContext('2d');
    var W = 0, H = 56, GY = 52, dpr = 1;
    var rectL = 0, rectT = 0, rectB = 0, rectAt = 0;
    var ptrX = -1e4, ptrY = -1e4, ptrT = 0;
    var forceLookUntil = 0, startleAt = 0;
    var deer = makeActor('deer'), racc = makeActor('raccoon');
    var nextSide = 1;

    function flagOn(name) { return document.documentElement.dataset[name] === 'on'; }
    function measure() {
      var r = strip.getBoundingClientRect();
      rectL = r.left; rectT = r.top; rectB = r.bottom;
      return r;
    }
    function resize() {
      var r = measure();
      W = r.width; H = r.height || 56; GY = H - 4;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) still();
    }
    var resizeTimer = null;
    function queueResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); }
    window.addEventListener('resize', queueResize);
    window.addEventListener('load', resize);
    if (window.ResizeObserver) new ResizeObserver(queueResize).observe(strip);

    /* pointer: proximity for the deer's stare, and a fast sweep near the strip
       is a car coming -> the deer freezes, then bolts */
    var lastPX = 0, lastPY = 0, lastPT = 0;
    window.addEventListener('pointermove', function (e) {
      var t = e.timeStamp || performance.now();
      ptrX = e.clientX; ptrY = e.clientY; ptrT = t;
      var dt = t - lastPT;
      if (dt > 8 && dt < 220 && lastPT) {
        var v = Math.hypot(e.clientX - lastPX, e.clientY - lastPY) / (dt / 1000);
        if (v > 1500 && e.clientY > rectT - 200 && e.clientY < rectB + 80) startleAt = t;
      }
      lastPX = e.clientX; lastPY = e.clientY; lastPT = t;
    }, { passive: true });

    /* the cat's position, from walker.js if it is there */
    function catX() {
      var w = window.Walker;
      if (!w || !w.position) return -1e4;
      var p = w.position();
      return p && p.visible ? p.x : -1e4;
    }

    function setState(a, st, dur, now) { a.state = st; a.until = now + dur; }
    function nextAct(a, opts) {
      var c = opts[(Math.random() * opts.length) | 0];
      if (c === a.last) c = opts[(Math.random() * opts.length) | 0];
      a.last = c; return c;
    }
    function offscreen(a) { return a.x > W + 80 || a.x < -80; }
    function despawn(a, now) {
      a.state = 'gone'; a.nextEnter = now + rand(20, 60) * 1000;
      a.speed = 0; a.vTarget = 0; a.carry = 0; a.sit = 0; a.gait = 0;
    }
    function spawn(a, now, cruise) {
      a.dir = nextSide; nextSide = -nextSide;
      a.x = a.dir === 1 ? -60 : W + 60;
      a.face = 1; a.faceT = 1; a.cruise = cruise; a.vTarget = cruise; a.speed = cruise * 0.5;
      a.gait = 1; a.neck = 0; a.yaw = 0; a.sit = 0; a.eyes = 0; a.last = '';
      setState(a, 'walk', rand(1.8, 3.6) * 1000, now);
    }

    /* ---------- deer ---------- */
    function updateDeer(now, dt) {
      var a = deer;
      if (a.state === 'gone') {
        if (flagOn('deer') && now >= a.nextEnter) spawn(a, now, rand(12, 16));
        return false;
      }
      if (!flagOn('deer')) { a.state = 'gone'; a.nextEnter = Infinity; return false; }

      var near = now - ptrT < 6000 && ptrY > rectT - 30 && ptrY < rectB + 10 && abs(ptrX - rectL - a.x) < 48;
      var forced = now < forceLookUntil || near;
      var st = a.state;

      if (startleAt > a.holdUntil && now - startleAt < 260 && st !== 'freeze' && st !== 'bolt' && a.x > -20 && a.x < W + 20) {
        a.holdUntil = startleAt; st = 'freeze'; setState(a, st, rand(700, 1400), now);
      }

      if (st === 'freeze') {
        a.vTarget = 0;
        if (now >= a.until) { setState(a, 'bolt', 8000, now); a.dir = a.x < W * 0.5 ? -1 : 1; }
      } else if (st === 'bolt') {
        a.vTarget = 70;
        if (offscreen(a)) { despawn(a, now); return false; }
      } else if (st === 'walk') {
        a.vTarget = a.cruise;
        if (forced) setState(a, 'look', 2600, now);
        else if (now >= a.until) {
          var n = nextAct(a, ['graze', 'pause', 'look', 'walk', 'graze', 'walk', 'turn']);
          if (n === 'turn' && (a.x < 50 || a.x > W - 50)) n = 'walk';
          if (n === 'walk') setState(a, 'walk', rand(2.5, 6) * 1000, now);
          else if (n === 'graze') { setState(a, 'graze', rand(3.5, 7) * 1000, now); a.stepAt = now + rand(1500, 3000); }
          else if (n === 'pause') setState(a, 'pause', rand(1.5, 3) * 1000, now);
          else if (n === 'turn') setState(a, 'turn', 1500, now);
          else setState(a, 'look', rand(2, 3.6) * 1000, now);
        }
      } else if (st === 'graze') {
        /* a small shuffle step now and then, head still down */
        a.vTarget = now > a.stepAt && now < a.stepAt + 500 ? 5 : 0;
        if (now > a.stepAt + 500) a.stepAt = now + rand(1500, 3200);
        if (forced) setState(a, 'look', 2600, now);
        else if (now >= a.until) setState(a, 'walk', rand(2.5, 6) * 1000, now);
      } else if (st === 'pause') {
        a.vTarget = 0;
        if (forced) setState(a, 'look', 2600, now);
        else if (now >= a.until) setState(a, 'walk', rand(2.5, 6) * 1000, now);
      } else if (st === 'look') {
        a.vTarget = 0;
        if (!forced && now >= a.until) setState(a, 'walk', rand(2.5, 6) * 1000, now);
      } else if (st === 'turn') {
        /* head comes round to face you first; the body flips behind a symmetric face */
        a.vTarget = 0;
        var k = 1 - (a.until - now) / 1500;
        if (k > 0.5 && k < 0.68) a.face = cos((k - 0.5) / 0.18 * PI);
        else a.face = 1;
        if (k >= 0.68 && a.faceT === 1) { a.dir = -a.dir; a.faceT = -1; }
        if (now >= a.until) { a.faceT = 1; setState(a, 'walk', rand(2.5, 6) * 1000, now); }
      }
      if (st !== 'bolt' && st !== 'freeze' && offscreen(a)) { despawn(a, now); return false; }

      /* ---- easing ---- */
      var bolt = st === 'bolt';
      a.speed = toward(a.speed, a.vTarget, bolt ? 3.5 : 2.8, dt);
      if (st !== 'turn') a.x += a.speed * a.dir * dt;
      a.cycle += (a.speed * dt) / (20 * DEER_SCALE * (bolt ? 1.4 : 1));
      if (a.cycle > 1e6) a.cycle -= 1e6;
      a.gait = toward(a.gait, a.speed > 1.5 ? 1 : 0, 5, dt);

      var neckT = st === 'graze' ? -1 : (st === 'look' || st === 'freeze' || st === 'turn') ? 1 : bolt ? 0.4 : -0.05;
      a.neck = toward(a.neck, neckT, st === 'freeze' ? 18 : 5, dt);
      var yawT = (st === 'look' || st === 'freeze' || st === 'turn') ? 1 : 0;
      a.yaw = toward(a.yaw, yawT, st === 'freeze' ? 16 : 5.5, dt);
      a.eyes = toward(a.eyes, a.yaw > 0.7 ? 1 : 0, 8, dt);

      /* ear flicks and tail flicks, randomly */
      if (now > a.flickAt) {
        a.flickAt = now + rand(900, 4000);
        var r = Math.random();
        if (r < 0.4) a.s[S_EARA + 1] += -6; else if (r < 0.8) a.s[S_EARB + 1] += 6; else a.s[S_TAIL + 1] += rand(-8, 8);
      }
      spring(a.s, S_EARA, st === 'graze' ? -0.2 : 0, 120, 13, dt);
      spring(a.s, S_EARB, st === 'graze' ? 0.15 : 0, 120, 13, dt);
      spring(a.s, S_TAIL, bolt ? -1.6 : st === 'freeze' ? -0.8 : 0, 60, 9, dt);
      a.earA = a.s[S_EARA]; a.earB = a.s[S_EARB]; a.tail = a.s[S_TAIL];

      /* gait bob; head lags a little; chewing while grazing */
      var amp = (bolt ? 1.6 : 0.8) * a.gait;
      a.bob = sin(a.cycle * TAU * 2) * amp;
      var nodT = st === 'graze' && a.neck < -0.7 ? sin(now / 140) * 0.6 - 0.6 : sin(a.cycle * TAU * 2 - 0.9) * 0.5 * a.gait;
      a.nod = toward(a.nod, nodT, 14, dt);
      return true;
    }

    /* ---------- raccoon ---------- */
    function updateRaccoon(now, dt) {
      var a = racc;
      if (a.state === 'gone') {
        if (flagOn('raccoon') && now >= a.nextEnter) { spawn(a, now, rand(8, 11)); a.carry = Math.random() < 0.35 ? 1 : 0; }
        return false;
      }
      if (!flagOn('raccoon')) { a.state = 'gone'; a.nextEnter = Infinity; return false; }
      var st = a.state;

      /* the cat is coming: stop, sit up, let it pass */
      var cx = catX();
      var catNear = cx > -9e3 && abs(cx - a.x) < 100;
      if (catNear && st !== 'yield' && st !== 'startle') { st = 'yield'; setState(a, st, 9000, now); }

      if (startleAt > a.holdUntil && now - startleAt < 260 && st !== 'startle' && a.x > -20 && a.x < W + 20) {
        a.holdUntil = startleAt; st = 'startle'; setState(a, st, rand(600, 1100), now); a.cruise = 24;
      }

      if (st === 'yield') {
        a.vTarget = 0;
        if ((cx < -9e3 || abs(cx - a.x) > 115) || now >= a.until) setState(a, 'walk', rand(1.5, 3) * 1000, now);
      } else if (st === 'startle') {
        a.vTarget = 0;
        if (now >= a.until) setState(a, 'walk', 5000, now);
      } else if (st === 'walk') {
        a.vTarget = a.cruise;
        if (now >= a.until) {
          var n = nextAct(a, ['rummage', 'sit', 'walk', 'rummage', 'pause', 'walk']);
          if (n === 'walk') setState(a, 'walk', rand(2.5, 5) * 1000, now);
          else if (n === 'rummage') setState(a, 'rummage', rand(3, 6) * 1000, now);
          else if (n === 'pause') setState(a, 'pause', rand(1.4, 2.6) * 1000, now);
          else setState(a, 'sit', rand(2.6, 5) * 1000, now);
        }
      } else if (st === 'rummage') {
        a.vTarget = 0;
        if (now >= a.until) {
          if (!a.carry && Math.random() < 0.45) { a.carry = 1; setState(a, 'sit', 2400, now); }
          else setState(a, 'walk', rand(2, 4.5) * 1000, now);
        }
      } else {  /* sit, pause */
        a.vTarget = 0;
        if (now >= a.until) setState(a, 'walk', rand(2, 4.5) * 1000, now);
      }
      if (offscreen(a)) { despawn(a, now); return false; }

      a.speed = toward(a.speed, a.vTarget, 3, dt);
      a.x += a.speed * a.dir * dt;
      a.cycle += (a.speed * dt) / (9 * RACC_SCALE);
      if (a.cycle > 1e6) a.cycle -= 1e6;
      a.gait = toward(a.gait, a.speed > 1 ? 1 : 0, 5, dt);

      var sitT = (st === 'sit' || st === 'yield' || st === 'startle') ? 1 : 0;
      a.sit = toward(a.sit, sitT, st === 'startle' ? 12 : 4, dt);
      a.neck = toward(a.neck, st === 'rummage' ? -1 : sitT ? 0.6 : -0.2, 5, dt);
      a.yaw = toward(a.yaw, sitT ? 1 : 0, st === 'startle' ? 12 : 4.5, dt);
      a.eyes = toward(a.eyes, st === 'rummage' ? 0 : 1, 6, dt);

      var pawT = st === 'rummage' ? 1 : 0;
      a.paw = toward(a.paw, pawT, 5, dt);
      a.pawPh += dt * (st === 'rummage' ? 10 : 3);
      if (a.pawPh > 1e5) a.pawPh -= 1e5;

      a.bob = sin(a.cycle * TAU * 2) * 0.7 * a.gait;
      a.roll = sin(a.cycle * TAU) * 0.05 * a.gait;
      var nodT = st === 'rummage' ? sin(now / 130) * 0.9 : sin(a.cycle * TAU * 2 - 1) * 0.4 * a.gait + (sitT ? sin(now / 700) * 0.4 : 0);
      a.nod = toward(a.nod, nodT, 14, dt);
      return true;
    }

    var raf = null, last = 0;
    function frame(t) {
      raf = requestAnimationFrame(frame);
      var d = t - last;
      if (d < 15) return;                    /* 60fps cap */
      var dt = last ? Math.min(d / 1000, 0.05) : 0.016;
      last = t;
      if (t > rectAt) { rectAt = t + 250; measure(); }
      ctx.clearRect(0, 0, W, H);
      var rOn = updateRaccoon(t, dt), dOn = updateDeer(t, dt);
      if (rOn) paintActor(ctx, 'raccoon', racc, racc.x, GY, racc.dir);
      if (dOn) paintActor(ctx, 'deer', deer, deer.x, GY, deer.dir);
      POS[0].x = deer.x; POS[0].dir = deer.dir; POS[0].visible = dOn && deer.x > -40 && deer.x < W + 40;
      POS[1].x = racc.x; POS[1].dir = racc.dir; POS[1].visible = rOn && racc.x > -40 && racc.x < W + 40;
    }

    function still() {
      ctx.clearRect(0, 0, W, H);
      if (flagOn('raccoon')) renderAt(ctx, 'raccoon', 'situp', 1, Math.round(W * 0.30), GY, 1);
      if (flagOn('deer')) renderAt(ctx, 'deer', 'stare', 1, Math.round(W * 0.62), GY, -1);
    }

    /* ---------- wiring ---------- */
    var deerLink = document.querySelector('.side__deer');
    if (deerLink) {
      deerLink.addEventListener('mouseenter', function () {
        forceLookUntil = Infinity;
        if (deer.state === 'gone') deer.nextEnter = performance.now();
      });
      deerLink.addEventListener('mouseleave', function () { forceLookUntil = performance.now() + 1400; });
    }
    document.addEventListener('tweakchange', function (e) {
      var k = e.detail && e.detail.key;
      if (k === 'palette' || k === 'reset') readColors();
      var now = performance.now();
      if (k === 'deer' || k === 'reset') {
        if (flagOn('deer')) { if (deer.state === 'gone') deer.nextEnter = now + rand(2, 6) * 1000; }
        else { deer.state = 'gone'; deer.nextEnter = Infinity; }
      }
      if (k === 'raccoon' || k === 'reset') {
        if (flagOn('raccoon')) { if (racc.state === 'gone') racc.nextEnter = now + rand(2, 6) * 1000; }
        else { racc.state = 'gone'; racc.nextEnter = Infinity; }
      }
      if (reduce) still();
    });
    document.addEventListener('visibilitychange', function () {
      if (reduce) return;
      if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
      else if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    });

    readColors();
    resize();
    if (!reduce) {
      var now0 = performance.now();
      deer.nextEnter = flagOn('deer') ? now0 + rand(4, 10) * 1000 : Infinity;
      racc.nextEnter = flagOn('raccoon') ? now0 + rand(12, 25) * 1000 : Infinity;
      raf = requestAnimationFrame(frame);
    }
  }

  window.Critters = {
    init: initCritters,
    positions: function () { return POS; },
    renderAt: function (g, kind, state, t, x, groundY, dir) { readColors(); renderAt(g, kind, state, t, x, groundY, dir); },
    setEnabled: function (kind, on) {
      document.documentElement.dataset[kind] = on ? 'on' : 'off';
      document.dispatchEvent(new CustomEvent('tweakchange', { detail: { key: kind, value: on ? 1 : 0 } }));
    }
  };

  initCritters();
})();
