// @ts-nocheck
/* Full-page background scene: drifting yarn strands, floating motes and a paw
   trail behind the cursor. Ported function-for-function from
   docs/redesign-previews/r4/site.js (initScene, lines 241-436).

   Only deviation from r4: r4 traced `canvas.scene`; our mount is `#bg`
   (Base.astro). The `.bg` CSS carries r4's `.scene` rules, so the opacity —
   `var(--bg-opacity)`, times `var(--bg-dim)` on `body.is-article` — stays in
   CSS exactly as r4 had it.

   Reads its colors from the palette CSS variables, re-reads them on
   `tweakchange`, allocates nothing per frame, pauses when the tab is hidden,
   and draws a single static frame under reduced motion. */
import { capDPR, prefersReducedMotion } from './util';

const reduce = prefersReducedMotion();

export function initScene(): void {
  const canvas = document.querySelector('#bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const isArticle = document.body.classList.contains('is-article');
  let w, h, dpr;
  let yarn = [], motes = [], paws = [];
  let raf = null, last = 0;
  const colors = { accent: '#F5A742', accent2: '#8FC7B5', muted: '#9B939E' };
  const flags = { bg: true, strands: true, motes: true, paws: true };

  function rand(a, b) { return a + Math.random() * (b - a); }
  function hexToRgba(hex, a) {
    const m = ('' + hex).trim().match(/^#([0-9a-f]{6})$/i);
    if (!m) return 'rgba(155,147,158,' + a + ')';
    const n = parseInt(m[1], 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    colors.accent = cs.getPropertyValue('--accent').trim() || colors.accent;
    colors.accent2 = cs.getPropertyValue('--accent-2').trim() || colors.accent2;
    colors.muted = cs.getPropertyValue('--muted').trim() || colors.muted;
  }
  function readFlags() {
    const d = document.documentElement.dataset;
    flags.bg = d.bg === 'on';
    flags.strands = d.strands === 'on';
    flags.motes = d.motes === 'on';
    flags.paws = d.paws === 'on';
  }

  function makeYarn() {
    const small = window.innerWidth < 900;
    const n = (isArticle || small) ? 3 : 5;
    yarn = [];
    for (let i = 0; i < n; i++) {
      const pts = [];
      for (let j = 0; j < 4; j++) {
        const speed = rand(4, 9);
        const ang = Math.random() * Math.PI * 2;
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed });
      }
      yarn.push({ pts: pts, odd: i % 2 === 0 });
    }
  }
  function makeMotes() {
    const small = window.innerWidth < 900;
    const m = isArticle ? 20 : (small ? 24 : 40);
    motes = [];
    for (let i = 0; i < m; i++) {
      motes.push({ x: Math.random() * w, y: Math.random() * h, r: rand(0.8, 1.8), vx: rand(-2, 2), vy: -rand(6, 12) });
    }
  }

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    dpr = capDPR(1.5);
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeYarn(); makeMotes();
  }
  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  function drawYarn() {
    yarn.forEach(function (strand) {
      const p = strand.pts;
      ctx.beginPath();
      ctx.moveTo(p[0].x, p[0].y);
      ctx.bezierCurveTo(p[1].x, p[1].y, p[2].x, p[2].y, p[3].x, p[3].y);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = strand.odd ? hexToRgba(colors.accent, 0.22) : hexToRgba(colors.accent2, 0.22);
      ctx.stroke();
    });
  }
  function drawMotes() {
    ctx.fillStyle = hexToRgba(colors.muted, 0.40);
    motes.forEach(function (m) {
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  function drawPaws(now) {
    paws.forEach(function (p) {
      const age = now - p.born;
      let a = 0.6 * (1 - age / 2500);
      if (a < 0) a = 0;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle + Math.PI / 2);
      ctx.fillStyle = hexToRgba(colors.accent, a);
      ctx.beginPath(); ctx.ellipse(0, 0, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
      [[-4.5, -5], [0, -6.5], [4.5, -5]].forEach(function (t) {
        ctx.beginPath(); ctx.ellipse(t[0], t[1], 1.6, 1.6, 0, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    });
  }

  function step(dt) {
    yarn.forEach(function (strand) {
      strand.pts.forEach(function (p) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
      });
    });
    motes.forEach(function (m) {
      m.x += m.vx * dt; m.y += m.vy * dt;
      if (m.y < -4) { m.y = h + 4; m.x = Math.random() * w; }
    });
  }

  function active() {
    return (flags.bg && flags.strands) || (flags.bg && flags.motes) || flags.paws;
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (t - last < 33) return;
    const dt = Math.min((t - last) / 1000, 0.1);
    last = t;
    ctx.clearRect(0, 0, w, h);
    step(dt);
    if (flags.bg && flags.strands) drawYarn();
    if (flags.bg && flags.motes) drawMotes();
    drawPaws(t);
    paws = paws.filter(function (p) { return (t - p.born) <= 2500; });
  }

  let lastPaw = null, pawSide = 1;
  function onMove(e) {
    if (!flags.paws) return;
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const x = e.clientX, y = e.clientY;
    if (!lastPaw || Math.hypot(x - lastPaw.x, y - lastPaw.y) >= 48) {
      const dx = x - (lastPaw ? lastPaw.x : x - 1);
      const dy = y - (lastPaw ? lastPaw.y : y);
      const angle = Math.atan2(dy, dx);
      pawSide *= -1;
      const perpX = Math.cos(angle + Math.PI / 2) * 6 * pawSide;
      const perpY = Math.sin(angle + Math.PI / 2) * 6 * pawSide;
      paws.push({ x: x + perpX, y: y + perpY, angle: angle, born: performance.now() });
      if (paws.length > 12) paws.shift();
      lastPaw = { x: x, y: y };
    }
  }

  function startIfNeeded() {
    if (!raf && active() && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); }
  }
  function stopIfIdle() {
    if (raf && !active()) { cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, w, h); }
  }

  readColors();
  readFlags();
  resize();

  if (reduce) {
    ctx.clearRect(0, 0, w, h);
    if (flags.bg && flags.strands) drawYarn();
    if (flags.bg && flags.motes) drawMotes();
  } else {
    window.addEventListener('pointermove', onMove);
    last = 0;
    if (active()) raf = requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', function () {
    if (reduce) return;
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    } else {
      startIfNeeded();
    }
  });

  document.addEventListener('tweakchange', function (e) {
    if (reduce) return;
    if (e.detail.key === 'palette' || e.detail.key === 'reset') readColors();
    readFlags();
    if (e.detail.key === 'paws' && !flags.paws) paws = [];
    startIfNeeded();
    stopIfIdle();
  });
}
