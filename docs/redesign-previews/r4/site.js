/* r4 composite — site.js
   Lifted per spec.md: strands+motes+paws canvas from r3-cat, pen-drawn scenes
   from r3-fieldnotes, copy buttons / TOC scroll-spy / Big O figure from r3-terminal.
   The sidebar cat, footer walking cat, and critter strip animals live in their
   own modules: sidecat.js, walker.js, critters.js. They read the shared tweak
   state (dataset attrs on <html> + `tweakchange` event) set up below.
   No libraries. Order: initTweaks -> initMenu -> initOrb -> initScene ->
   initPen -> initCopy -> initToc -> initBigO. */
(function () {
  'use strict';

  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  var DEFAULTS = { palette: 'alley', logo: 'orb', mich: 'maize', draw: 'pen', orb: 1, bg: 1, bgOpacity: 55, strands: 1, motes: 1, bgDim: 50, paws: 1, walker: 1, deer: 1, raccoon: 1 };

  function $all(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }

  /* ---------------------------------------------------------- 1. tweaks */
  function initTweaks() {
    var state = window.TWEAKS || (function () {
      var d = {};
      for (var k in DEFAULTS) d[k] = DEFAULTS[k];
      return d;
    })();

    /* preview convenience: ?palette= / ?logo= / ?draw= query params override, non-persisting */
    try {
      var qs = new URLSearchParams(location.search);
      var qp = qs.get('palette'), ql = qs.get('logo'), qd = qs.get('draw');
      if (qp) state.palette = qp;
      if (ql) state.logo = ql;
      if (qd) state.draw = qd;
    } catch (e) {}

    var form = document.querySelector('.tweak__form');

    function writeAttrs() {
      var h = document.documentElement;
      h.dataset.palette = state.palette;
      h.dataset.logo = state.logo;
      h.dataset.mich = state.mich;
      h.dataset.draw = state.draw;
      ['orb', 'bg', 'strands', 'motes', 'paws', 'walker', 'deer', 'raccoon'].forEach(function (k) {
        h.dataset[k] = state[k] ? 'on' : 'off';
      });
      h.style.setProperty('--bg-opacity', state.bgOpacity / 100);
      h.style.setProperty('--bg-dim', state.bgDim / 100);
    }

    function sync() {
      if (!form) return;
      $all('[name]', form).forEach(function (el) {
        if (!(el.name in state)) return;
        if (el.type === 'checkbox') el.checked = !!state[el.name];
        else el.value = state[el.name];
        if (el.type === 'range') {
          var out = el.parentNode.querySelector('output');
          if (out) out.textContent = state[el.name];
        }
      });
    }

    writeAttrs();
    sync();
    window.TWEAKS = state;

    function handle(e) {
      var el = e.target;
      if (!el.name || !(el.name in state)) return;
      var v = el.type === 'checkbox' ? (el.checked ? 1 : 0) : (el.type === 'range' ? Number(el.value) : el.value);
      state[el.name] = v;
      writeAttrs();
      try { localStorage.setItem('tweaks', JSON.stringify(state)); } catch (e2) {}
      if (el.type === 'range') {
        var out = el.parentNode.querySelector('output');
        if (out) out.textContent = v;
      }
      document.dispatchEvent(new CustomEvent('tweakchange', { detail: { key: el.name, value: v, state: state } }));
    }

    if (form) {
      form.addEventListener('input', function (e) { if (e.target.type === 'range') handle(e); });
      form.addEventListener('change', function (e) { if (e.target.type !== 'range') handle(e); });
      var resetBtn = form.querySelector('.tweak__reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          try { localStorage.removeItem('tweaks'); } catch (e3) {}
          state = {};
          for (var k in DEFAULTS) state[k] = DEFAULTS[k];
          window.TWEAKS = state;
          writeAttrs();
          sync();
          document.dispatchEvent(new CustomEvent('tweakchange', { detail: { key: 'reset', value: null, state: state } }));
        });
      }
    }
  }

  /* ------------------------------------------------------------ 2. menu */
  function initMenu() {
    var side = document.querySelector('.side');
    var menuBtn = document.querySelector('.side__menu');
    var panel = document.getElementById('sidepanel');
    if (!side || !menuBtn || !panel) return;

    function closeMenu() {
      side.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
    }
    function openMenu() {
      side.classList.add('is-open');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-locked');
    }
    menuBtn.addEventListener('click', function () {
      if (side.classList.contains('is-open')) closeMenu(); else openMenu();
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ------------------------------------------------------ 4. orb + logo */
  function initOrb() {
    var canvas = document.querySelector('canvas.orb');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 40 * dpr; canvas.height = 40 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var T = ['#F5A742', '#C4561E', '#FFD489'], G = '#1A171F';
    function hexA(hex, a) {
      var h = (hex || '#888888').replace('#', '');
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      var r = parseInt(h.substr(0, 2), 16) || 0, g = parseInt(h.substr(2, 2), 16) || 0, b = parseInt(h.substr(4, 2), 16) || 0;
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }
    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      T = [cs.getPropertyValue('--orb-1').trim() || T[0], cs.getPropertyValue('--orb-2').trim() || T[1], cs.getPropertyValue('--orb-3').trim() || T[2]];
      G = cs.getPropertyValue('--bg-2').trim() || G;
    }
    readColors();

    function draw(t) {
      ctx.clearRect(0, 0, 40, 40);
      ctx.save();
      ctx.beginPath(); ctx.arc(20, 20, 19, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = T[1];
      ctx.fillRect(0, 0, 40, 40);
      for (var i = 0; i < 3; i++) {
        var a = t * (0.35 + 0.15 * i) + i * 2.1;
        var wob = 1 + 0.18 * Math.sin(t * 0.9 + i * 1.7) * Math.cos(t * 0.53 + i);
        var cx = 20 + Math.cos(a) * 7 * wob, cy = 20 + Math.sin(a) * 7 * wob;
        var r = 13 + 3 * Math.sin(t * 0.7 + i * 2.3);
        var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, hexA(T[i], 0.95));
        grad.addColorStop(0.6, hexA(T[i], 0.35));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(20, 20, 19, 0, Math.PI * 2); ctx.fill();
      }
      var vg = ctx.createRadialGradient(20, 20, 12, 20, 20, 19.5);
      vg.addColorStop(0, 'transparent'); vg.addColorStop(1, hexA(G, 0.85));
      ctx.fillStyle = vg;
      ctx.beginPath(); ctx.arc(20, 20, 19, 0, Math.PI * 2); ctx.fill();
      var hg = ctx.createRadialGradient(14, 13, 0, 14, 13, 7);
      hg.addColorStop(0, 'rgba(255,255,255,.22)'); hg.addColorStop(1, 'transparent');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(14, 13, 7, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    var raf = null, last = 0;
    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (t - last < 33) return;
      last = t;
      draw(t / 1000);
    }
    function shouldRun() {
      var d = document.documentElement.dataset;
      return d.logo === 'orb' && d.orb === 'on' && !document.hidden && !reduce;
    }
    function evaluate() {
      if (shouldRun()) {
        if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
      } else {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        draw(0);
      }
    }
    evaluate();
    document.addEventListener('visibilitychange', evaluate);

    var faviconCache = {};
    function orbDataURL() {
      var pal = document.documentElement.dataset.palette;
      if (faviconCache[pal]) return faviconCache[pal];
      draw(0);
      var off = document.createElement('canvas');
      off.width = 32; off.height = 32;
      off.getContext('2d').drawImage(canvas, 0, 0, 32, 32);
      var url = off.toDataURL('image/png');
      faviconCache[pal] = url;
      return url;
    }

    function setFavicon() {
      var link = document.getElementById('favicon');
      if (!link) return;
      var logo = document.documentElement.dataset.logo;
      if (logo === 'orb') {
        link.href = orbDataURL();
      } else {
        var markSvg = document.querySelector('.side__mark .' + logo);
        if (!markSvg) return;
        var cs = getComputedStyle(document.documentElement);
        var accentText = cs.getPropertyValue('--accent-text').trim();
        var svgStr = markSvg.outerHTML.replace(/currentColor/g, accentText).replace(/ class="[^"]*"/, '');
        link.href = 'data:image/svg+xml,' + encodeURIComponent(svgStr);
      }
    }

    document.addEventListener('tweakchange', function (e) {
      var k = e.detail.key;
      if (k === 'palette' || k === 'reset') { readColors(); faviconCache = {}; }
      if (k === 'orb' || k === 'palette' || k === 'reset') evaluate();
      if (k === 'palette' || k === 'logo' || k === 'reset') setFavicon();
    });

    setFavicon();
  }

  /* --------------------------------------------------- 5. background scene */
  function initScene() {
    var canvas = document.querySelector('canvas.scene');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var isArticle = document.body.classList.contains('is-article');
    var w, h, dpr;
    var yarn = [], motes = [], paws = [];
    var raf = null, last = 0;
    var colors = { accent: '#F5A742', accent2: '#8FC7B5', muted: '#9B939E' };
    var flags = { bg: true, strands: true, motes: true, paws: true };

    function rand(a, b) { return a + Math.random() * (b - a); }
    function hexToRgba(hex, a) {
      var m = ('' + hex).trim().match(/^#([0-9a-f]{6})$/i);
      if (!m) return 'rgba(155,147,158,' + a + ')';
      var n = parseInt(m[1], 16);
      return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }
    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      colors.accent = cs.getPropertyValue('--accent').trim() || colors.accent;
      colors.accent2 = cs.getPropertyValue('--accent-2').trim() || colors.accent2;
      colors.muted = cs.getPropertyValue('--muted').trim() || colors.muted;
    }
    function readFlags() {
      var d = document.documentElement.dataset;
      flags.bg = d.bg === 'on';
      flags.strands = d.strands === 'on';
      flags.motes = d.motes === 'on';
      flags.paws = d.paws === 'on';
    }

    function makeYarn() {
      var small = window.innerWidth < 900;
      var n = (isArticle || small) ? 3 : 5;
      yarn = [];
      for (var i = 0; i < n; i++) {
        var pts = [];
        for (var j = 0; j < 4; j++) {
          var speed = rand(4, 9);
          var ang = Math.random() * Math.PI * 2;
          pts.push({ x: Math.random() * w, y: Math.random() * h, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed });
        }
        yarn.push({ pts: pts, odd: i % 2 === 0 });
      }
    }
    function makeMotes() {
      var small = window.innerWidth < 900;
      var m = isArticle ? 20 : (small ? 24 : 40);
      motes = [];
      for (var i = 0; i < m; i++) {
        motes.push({ x: Math.random() * w, y: Math.random() * h, r: rand(0.8, 1.8), vx: rand(-2, 2), vy: -rand(6, 12) });
      }
    }

    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeYarn(); makeMotes();
    }
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    function drawYarn() {
      yarn.forEach(function (strand) {
        var p = strand.pts;
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
        var age = now - p.born;
        var a = 0.6 * (1 - age / 2500);
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
      var dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      ctx.clearRect(0, 0, w, h);
      step(dt);
      if (flags.bg && flags.strands) drawYarn();
      if (flags.bg && flags.motes) drawMotes();
      drawPaws(t);
      paws = paws.filter(function (p) { return (t - p.born) <= 2500; });
    }

    var lastPaw = null, pawSide = 1;
    function onMove(e) {
      if (!flags.paws) return;
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var x = e.clientX, y = e.clientY;
      if (!lastPaw || Math.hypot(x - lastPaw.x, y - lastPaw.y) >= 48) {
        var dx = x - (lastPaw ? lastPaw.x : x - 1);
        var dy = y - (lastPaw ? lastPaw.y : y);
        var angle = Math.atan2(dy, dx);
        pawSide *= -1;
        var perpX = Math.cos(angle + Math.PI / 2) * 6 * pawSide;
        var perpY = Math.sin(angle + Math.PI / 2) * 6 * pawSide;
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

  /* ------------------------------------------------------- 6. pen scene */
  var CAT = [
    { d: 'M158 100L154 82L165 90Q170 88 175 90L186 82L182 100Q188 110 178 117Q170 120 162 117Q152 110 158 100Z' },
    { d: 'M164 117Q150 130 152 150L188 150Q190 130 176 117' },
    { d: 'M188 146C199 152 204 140 197 130' },
    { d: 'M164 103q2 -2 4 0M172 103q2 -2 4 0' },
    { d: 'M168 108l2 2l2 -2' },
    { d: 'M161 108l-8 -1M161 111l-8 1M179 108l8 -1M179 111l8 1' }
  ];
  var CAT_SMALL_HEAD = { d: CAT[0].d, x: 100, y: 20, s: .6 };
  var CAT_SMALL_EYES = { d: CAT[3].d, x: 100, y: 20, s: .6 };
  var CAT_SMALL_NOSE = { d: CAT[4].d, x: 100, y: 20, s: .6 };
  var CAT_OFFSET = CAT.map(function (s) { return { d: s.d, x: -70 }; });
  var BLOCK_M = { d: 'M139.14 164.22l-56.95 -77.86v56.67h22.65v56H0v-56H21.25V55.96H0v-56h82.39l56.75 78.43 56.76 -78.43H278.25v56H256.92v87.07H278.25v56H173.52v-56h22.57V86.36Z', x: 4, y: 50, s: .5, c: 'mich' };

  var SCENES = {
    home: [BLOCK_M],
    book: [
      { d: 'M100 70C85 60 60 58 30 64L30 140C60 134 85 136 100 146' },
      { d: 'M100 70C115 60 140 58 170 64L170 140C140 134 115 136 100 146' },
      { d: 'M100 70L100 146' },
      { d: 'M30 140L24 146L100 154L176 146L170 140' },
      { d: 'M42 84C60 80 78 80 90 84M42 98C60 94 78 94 90 98M42 112C60 108 78 108 90 112' },
      { d: 'M110 84C122 80 140 80 158 84M110 98C122 94 140 94 158 98M110 112C122 108 140 108 158 112' },
      { d: 'M150 60L150 90L156 84L162 90L162 62', c: 'accent' }
    ],
    bigo: [
      { d: 'M40 40L40 160L170 160' },
      { d: 'M34 48L40 40L46 48M162 154L170 160L162 166' },
      { d: 'M42 158C60 130 110 122 168 118' },
      { d: 'M42 158L160 90' },
      { d: 'M42 158C90 156 130 120 150 50', c: 'accent' },
      { d: 'M60 60a10 10 0 1 0 .1 0', c: 'accent' },
      { d: 'M76 52q-5 8 0 16M84 52q5 8 0 16' }
    ],
    prompt: [
      { d: 'M32 60C70 58 130 58 168 60L170 140C130 142 70 142 30 140Z' },
      { d: 'M30 74L170 74' },
      { d: 'M40 67a2 2 0 1 0 .1 0M50 67a2 2 0 1 0 .1 0M60 67a2 2 0 1 0 .1 0' },
      { d: 'M46 92L60 102L46 112', c: 'accent' },
      { d: 'M68 112L84 112' }
    ],
    catslash: CAT_OFFSET.concat([
      { d: 'M130 140L160 60', c: 'accent' },
      CAT_SMALL_HEAD, CAT_SMALL_EYES, CAT_SMALL_NOSE
    ]),
    compass: [
      { d: 'M100 40C135 40 160 65 160 100C160 135 135 160 100 160C65 160 40 135 40 100C40 65 65 40 100 40C104 40 106 40 108 40.5' },
      { d: 'M118 62L108 100L82 138L92 100Z', c: 'accent' },
      { d: 'M100 40v8M100 152v8M40 100h8M152 100h8' }
    ]
  };

  function clampN(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* Pen scene timing. Trace: ~40% of the old clamp(total/220, 1.2, 3) s.
     Laser mode: constant speed per unit length, PAUSE ms head-lift between paths,
     then a completion glow: FLASH in, HOLD, FADE back to plain ink. */
  var PAUSE = 40, FLASH = 120, HOLD = 300, FADE = 500, GLOW = FLASH + HOLD + FADE;
  var TAU = Math.PI * 2, EMPTY = [];

  function easeInOut(t) { return t < .5 ? 2 * t * t : 1 - (2 - 2 * t) * (2 - 2 * t) / 2; }
  function glowAt(x) { /* x = ms past trace end -> 0..1 */
    if (x <= 0) return 0;
    if (x < FLASH) { var u = x / FLASH; return 1 - (1 - u) * (1 - u); }
    if (x < FLASH + HOLD) return 1;
    if (x < GLOW) { var v = (x - FLASH - HOLD) / FADE; return 1 - v * v * (3 - 2 * v); }
    return 0;
  }

  /* One scene bound to `canvas` (reads data-scene). `manual` skips the auto-trace and
     hover/visibility wiring (debug harness). Returns { renderAt(mode, ms), dur, glow }. */
  function makePen(canvas, manual) {
    var pageHead = canvas.closest('.page-head');
    var ctx = canvas.getContext('2d');

    var key = canvas.dataset.scene;
    var raw = SCENES[key] || SCENES.home;
    var strokes = raw.map(function (s) { return { d: s.d, x: s.x || 0, y: s.y || 0, s: s.s || 1, c: s.c || 'ink' }; });

    var NS = 'http://www.w3.org/2000/svg';
    var offSvg = document.createElementNS(NS, 'svg');
    offSvg.setAttribute('width', '0'); offSvg.setAttribute('height', '0');
    offSvg.style.position = 'absolute'; offSvg.style.left = '-9999px';
    offSvg.setAttribute('aria-hidden', 'true');
    document.body.appendChild(offSvg);
    var cum = 0;
    strokes.forEach(function (st, i) {
      var p = document.createElementNS(NS, 'path');
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
    var total = cum;
    var dur = clampN(total / 550, 0.5, 1.2) * 1000;
    var rate = dur / total;                /* ms per path unit, both modes */
    var durLaser = dur + PAUSE * (strokes.length - 1);
    var trail = total * 0.14;
    strokes.forEach(function (st) { st.t0 = st.start * rate; });

    var colors = { ink: '', accent: '', mich: '' };
    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      colors.ink = cs.getPropertyValue('--text').trim();
      colors.accent = cs.getPropertyValue('--accent').trim();
      colors.mich = cs.getPropertyValue('--mich').trim();
    }

    var box = { bx: 0, by: 0, k: 0 };
    function computeBox() {
      var cw = canvas.clientWidth || 1, ch = canvas.clientHeight || 1;
      var k = cw / 220;
      box = { bx: 4 * k, by: -30 * k, k: k };
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    }

    function dot(x, y, r, a) { ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }

    /* e: trace-time ms (pen: eased, laser: linear). g: laser completion glow 0..1. */
    function render(laser, e, g) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      var tipSt = null, tipLocal = 0, i, st, local, a;
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
        var lp = tipSt.el.getPointAtLength(tipLocal);
        var X = box.bx + (tipSt.x + lp.x * tipSt.s) * box.k;
        var Y = box.by + (tipSt.y + lp.y * tipSt.s) * box.k;
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
    function frame(mode, ms) {
      var laser = mode === 'laser';
      if (laser) render(true, ms, ms > durLaser ? glowAt(ms - durLaser) : 0);
      else render(false, easeInOut(clampN(ms / dur, 0, 1)) * dur, 0);
      return ms >= (laser ? durLaser + GLOW : dur);
    }
    function still() { render(false, 1e9, 0); }

    var mode = 'pen', tracing = false, rafId = null, startTs = 0, elapsed = 0, lastFrameTs = 0;
    function loop(ts) {
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
      if (pageHead) pageHead.addEventListener('mouseenter', function () { if (!tracing) startTrace(); });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) pauseTrace(); else resumeTrace();
      });
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { computeBox(); if (!tracing) still(); }, 150);
    });

    document.addEventListener('tweakchange', function (e) {
      var k = e.detail.key;
      if (k === 'palette' || k === 'mich' || k === 'reset') readColors();
      if (k === 'draw' || k === 'reset') { pauseTrace(); tracing = false; if (!manual) startTrace(); }
      else if ((k === 'palette' || k === 'mich') && !tracing) still();
    });

    return { canvas: canvas, renderAt: frame, dur: { pen: dur, laser: durLaser }, glow: { flash: FLASH, hold: HOLD, fade: FADE } };
  }

  function initPen() {
    var canvas = document.querySelector('canvas.pen');
    if (canvas) makePen(canvas);
  }
  window.Pen = makePen;

  /* --------------------------------------------------------- 8. copy */
  function initCopy() {
    var buttons = document.querySelectorAll('.code-copy');
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var fig = btn.closest('.code');
        var pre = fig && fig.querySelector('pre');
        if (!pre) return;
        var text = pre.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(function () {});
        }
        fig.classList.add('is-copied');
        btn.textContent = 'copied';
        setTimeout(function () {
          fig.classList.remove('is-copied');
          btn.textContent = 'copy';
        }, 1200);
      });
    });
  }

  /* ---------------------------------------------------------- 9. toc */
  function initToc() {
    var toc = document.querySelector('.toc');
    if (!toc) return;
    var links = $all('.toc__link', toc);
    if (!links.length || !('IntersectionObserver' in window)) return;
    var heads = [];
    links.forEach(function (a) {
      var h = document.getElementById(a.getAttribute('href').slice(1));
      if (h) heads.push({ h: h, a: a });
    });
    if (!heads.length) return;
    var state = new Map(heads.map(function (o) { return [o.h, false]; }));
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { state.set(e.target, e.isIntersecting); });
      var active = null;
      heads.forEach(function (o) { if (state.get(o.h)) active = o.a; });
      links.forEach(function (l) { l.removeAttribute('aria-current'); });
      if (active) active.setAttribute('aria-current', 'true');
    }, { rootMargin: '-20% 0px -70% 0px' });
    heads.forEach(function (o) { io.observe(o.h); });
  }

  /* -------------------------------------------------------- 10. big-o */
  function initBigO() {
    var fig = document.querySelector('.bigo');
    if (!fig) return;
    var wrap = fig.closest('.fig') || fig.parentElement;
    var curves = {
      c1: function () { return 1; },
      logn: function (n) { return Math.log2(n); },
      n: function (n) { return n; },
      nlogn: function (n) { return n * Math.log2(n); },
      n2: function (n) { return n * n; },
      exp: function (n) { return Math.pow(2, n); }
    };
    var input = wrap.querySelector('input[type="range"]');
    var output = wrap.querySelector('output');

    function recompute(N) {
      var yMax = N * N * 1.1;
      Object.keys(curves).forEach(function (key) {
        var f = curves[key];
        var pts = [];
        for (var n = 1; n <= N; n += 0.25) {
          var x = 40 + ((n - 1) / (N - 1)) * 550;
          var val = Math.min(f(n), yMax * 1.2);
          var y = 270 - (val / yMax) * 260;
          pts.push(x.toFixed(2) + ' ' + y.toFixed(2));
        }
        var d = 'M ' + pts.join(' L ');
        fig.querySelectorAll('[data-curve="' + key + '"]').forEach(function (el) { el.setAttribute('d', d); });
      });
    }
    recompute(parseInt((input && input.value) || '10', 10));
    if (input) {
      input.addEventListener('input', function () {
        if (output) output.textContent = input.value;
        recompute(parseInt(input.value, 10));
      });
    }

    function highlight(key) {
      fig.classList.add('has-hi');
      fig.querySelectorAll('.curve').forEach(function (c) { c.classList.toggle('is-hi', c.dataset.curve === key); });
      wrap.querySelectorAll('.bigo-key').forEach(function (k) { k.classList.toggle('is-hi', k.dataset.curve === key); });
    }
    function unhighlight() {
      fig.classList.remove('has-hi');
      fig.querySelectorAll('.curve').forEach(function (c) { c.classList.remove('is-hi'); });
      wrap.querySelectorAll('.bigo-key').forEach(function (k) { k.classList.remove('is-hi'); });
    }
    fig.querySelectorAll('.curve-hit').forEach(function (hit) {
      hit.addEventListener('mouseenter', function () { highlight(hit.dataset.curve); });
      hit.addEventListener('mouseleave', unhighlight);
      hit.addEventListener('focus', function () { highlight(hit.dataset.curve); });
      hit.addEventListener('blur', unhighlight);
    });
    wrap.querySelectorAll('.bigo-key').forEach(function (key) {
      key.addEventListener('mouseenter', function () { highlight(key.dataset.curve); });
      key.addEventListener('mouseleave', unhighlight);
      key.addEventListener('focus', function () { highlight(key.dataset.curve); });
      key.addEventListener('blur', unhighlight);
    });
  }

  /* --------------------------------------------------------- boot */
  initTweaks();
  initMenu();
  initOrb();
  initScene();
  initPen();
  initCopy();
  initToc();
  initBigO();
})();
