/* r3-fieldnotes — site.js. Vanilla JS, no deps. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- palette: query param override (preview convenience) ---------- */
  (function () {
    var qp = new URLSearchParams(location.search).get('palette');
    if (qp) {
      root.dataset.palette = qp;
      try { localStorage.setItem('palette', qp); } catch (e) {}
    }
  })();

  /* ---------- palette switcher ---------- */
  var sceneApi = null;
  function initPalette() {
    var sel = document.getElementById('palette');
    if (!sel) return;
    sel.value = root.dataset.palette || 'fieldnotes';
    sel.addEventListener('change', function () {
      root.dataset.palette = sel.value;
      try { localStorage.setItem('palette', sel.value); } catch (e) {}
      window.dispatchEvent(new CustomEvent('palettechange', { detail: sel.value }));
      if (sceneApi) sceneApi.repaint();
    });
  }

  /* ---------- mobile nav toggle ---------- */
  function initNav() {
    var btn = document.querySelector('.nav-toggle');
    var band = document.querySelector('.band');
    if (!btn || !band) return;
    btn.addEventListener('click', function () {
      var open = band.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- section markers + tally: draw in on scroll ---------- */
  function initInView() {
    var targets = document.querySelectorAll('h2.sec, .tally');
    if (!targets.length || !('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---------- tally marks: render strokes from data-n ---------- */
  function initTally() {
    document.querySelectorAll('.tally-marks').forEach(function (svg) {
      var n = parseInt(svg.dataset.n, 10) || 0;
      var groups = Math.max(Math.ceil(n / 5), 1);
      var w = groups * 44;
      svg.setAttribute('viewBox', '0 0 ' + w + ' 22');
      var frag = '';
      for (var i = 0; i < n; i++) {
        var g = Math.floor(i / 5);
        var pos = i % 5;
        var d;
        if (pos < 4) {
          var x = g * 44 + 6 + pos * 8;
          d = 'M' + x + ' 3V19';
        } else {
          d = 'M' + (g * 44 + 2) + ' 16L' + (g * 44 + 34) + ' 6';
        }
        frag += '<path style="--i:' + i + '" d="' + d + '"/>';
      }
      svg.innerHTML = frag;
    });
  }

  /* ---------- cat easter egg ---------- */
  function initCat() {
    var cat = document.querySelector('.doodle-cat');
    if (!cat) return;
    var audio = document.getElementById('chill');
    cat.addEventListener('click', function () {
      var awake = cat.classList.toggle('is-awake');
      if (!audio) return;
      if (awake) audio.play().catch(function () {});
      else audio.pause();
    });
  }

  /* ---------- copy buttons ---------- */
  function initCopy() {
    document.querySelectorAll('.code-copy').forEach(function (btn) {
      var original = btn.textContent;
      btn.addEventListener('click', function () {
        var pre = btn.closest('.code').querySelector('pre');
        var text = pre ? pre.innerText : '';
        var done = function () {
          btn.textContent = 'copied';
          btn.classList.add('is-done');
          setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove('is-done');
          }, 1200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {});
        }
      });
    });
  }

  /* ---------- table of contents: active heading tracking ---------- */
  function initToc() {
    var toc = document.querySelector('.toc');
    if (!toc) return;
    var links = Array.prototype.slice.call(toc.querySelectorAll('a'));
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
      links.forEach(function (l) { l.classList.remove('is-active'); });
      if (active) active.classList.add('is-active');
    }, { rootMargin: '-20% 0px -70% 0px' });
    heads.forEach(function (o) { io.observe(o.h); });
  }

  /* ---------- Big O figure ---------- */
  function initBigO() {
    var svg = document.getElementById('bigo');
    if (!svg) return;
    var fig = svg.closest('.fig');
    var input = fig.querySelector('#bigo-n');
    var output = fig.querySelector('output');
    var legend = Array.prototype.slice.call(fig.querySelectorAll('.bigo-legend button'));

    var X0 = 48, X1 = 540, Y0 = 16, Y1 = 268;
    var funcs = {
      c1: function () { return 1; },
      log: function (n) { return Math.log2(n); },
      n: function (n) { return n; },
      nlog: function (n) { return n * Math.log2(n); },
      n2: function (n) { return n * n; },
      exp: function (n) { return Math.pow(2, n); }
    };
    var keys = ['c1', 'log', 'n', 'nlog', 'n2', 'exp'];
    var labels = { c1: 'O(1)', log: 'O(log n)', n: 'O(n)', nlog: 'O(n log n)', n2: 'O(n²)', exp: 'O(2ⁿ)' };

    function mk(tag) { return document.createElementNS(NS, tag); }

    var axis = mk('path');
    axis.setAttribute('class', 'axis');
    axis.setAttribute('d', 'M' + X0 + ' ' + Y0 + 'V' + Y1 + 'H' + X1);
    svg.appendChild(axis);

    var lblN = mk('text');
    lblN.setAttribute('class', 'axis-label');
    lblN.setAttribute('x', X1);
    lblN.setAttribute('y', 286);
    lblN.setAttribute('text-anchor', 'end');
    lblN.textContent = 'n';
    svg.appendChild(lblN);

    var lblOps = mk('text');
    lblOps.setAttribute('class', 'axis-label');
    lblOps.setAttribute('x', 14);
    lblOps.setAttribute('y', 16);
    lblOps.textContent = 'ops';
    svg.appendChild(lblOps);

    var curveEls = {}, hitEls = {}, labelEls = {};
    keys.forEach(function (k) {
      var curve = mk('path');
      curve.setAttribute('class', 'curve');
      curve.dataset.k = k;
      var hit = mk('path');
      hit.setAttribute('class', 'hit');
      hit.dataset.k = k;
      var label = mk('text');
      label.setAttribute('class', 'label');
      label.dataset.k = k;
      label.textContent = labels[k];
      svg.appendChild(curve);
      svg.appendChild(hit);
      svg.appendChild(label);
      curveEls[k] = curve; hitEls[k] = hit; labelEls[k] = label;
    });

    function build(N) {
      var yMax = N * N;
      keys.forEach(function (k) {
        var f = funcs[k];
        var d = '';
        var lastX = X0, lastY = Y1;
        for (var n = 1; n <= N; n += 0.25) {
          var val = f(n);
          if (val > yMax) break;
          var x = X0 + (n / N) * (X1 - X0);
          var y = Y1 - (val / yMax) * (Y1 - Y0);
          d += (d ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
          lastX = x; lastY = y;
        }
        curveEls[k].setAttribute('d', d);
        hitEls[k].setAttribute('d', d);
        labelEls[k].setAttribute('x', (lastX + 6).toFixed(1));
        labelEls[k].setAttribute('y', lastY.toFixed(1));
      });
    }

    build(parseInt(input.value, 10));
    input.addEventListener('input', function () {
      output.textContent = input.value;
      build(parseInt(input.value, 10));
    });

    function setHot(k) {
      svg.classList.toggle('is-hot', !!k);
      keys.forEach(function (kk) {
        curveEls[kk].classList.toggle('is-hot', kk === k);
        labelEls[kk].classList.toggle('is-hot', kk === k);
      });
      legend.forEach(function (btn) { btn.classList.toggle('is-hot', btn.dataset.k === k); });
    }
    keys.forEach(function (k) {
      hitEls[k].addEventListener('mouseenter', function () { setHot(k); });
      hitEls[k].addEventListener('mouseleave', function () { setHot(null); });
    });
    legend.forEach(function (btn) {
      btn.addEventListener('mouseenter', function () { setHot(btn.dataset.k); });
      btn.addEventListener('mouseleave', function () { setHot(null); });
      btn.addEventListener('focus', function () { setHot(btn.dataset.k); });
      btn.addEventListener('blur', function () { setHot(null); });
    });
  }

  /* ---------- pen-drawn band scene ---------- */
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
  var BLOCK_M = { d: 'M139.14 164.22l-56.95 -77.86v56.67h22.65v56H0v-56H21.25V55.96H0v-56h82.39l56.75 78.43 56.76 -78.43H278.25v56H256.92v87.07H278.25v56H173.52v-56h22.57V86.36Z', x: 4, y: 50, s: .5, c: 'accent' };

  var SCENES = {
    home: [BLOCK_M].concat(CAT),
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

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  function initScene() {
    var canvas = document.querySelector('.band-scene');
    if (!canvas) return null;
    var band = canvas.closest('.band');
    var row = band.querySelector('.band-row');
    var ctx = canvas.getContext('2d');

    var offSvg = document.createElementNS(NS, 'svg');
    offSvg.setAttribute('width', '0');
    offSvg.setAttribute('height', '0');
    offSvg.style.position = 'absolute';
    offSvg.style.left = '-9999px';
    offSvg.setAttribute('aria-hidden', 'true');
    document.body.appendChild(offSvg);

    var key = canvas.dataset.scene;
    var raw = SCENES[key] || SCENES.home;
    var strokes = raw.map(function (s) {
      return { d: s.d, x: s.x || 0, y: s.y || 0, s: s.s || 1, c: s.c || 'ink' };
    });
    strokes.forEach(function (st) {
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', st.d);
      offSvg.appendChild(p);
      st.el = p;
      st.len = p.getTotalLength() || 0.001;
      st.path2d = new Path2D(st.d);
    });
    var cum = 0;
    strokes.forEach(function (st) { st.start = cum; cum += st.len; });
    var total = cum;

    var box = { B: 0, bx: 0, by: 0, k: 0 };
    function computeBox() {
      var rect = canvas.getBoundingClientRect();
      var cw = rect.width || 1, ch = rect.height || 1;
      var rowH = row ? row.getBoundingClientRect().height : 0;
      var B = Math.min(ch - 40, 220);
      if (window.innerWidth < 760) B = 88;
      B = Math.max(B, 40);
      var bx = cw - ((cw - Math.min(cw, 1120)) / 2 + 24) - B;
      var by = rowH + (ch - rowH - B) / 2;
      box = { B: B, bx: bx, by: by, k: B / 200 };
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    }

    function render(p) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      var inkColor = getComputedStyle(root).getPropertyValue('--ink').trim();
      var accentColor = getComputedStyle(root).getPropertyValue('--accent').trim();
      var drawn = p * total;
      var tip = null;
      strokes.forEach(function (st) {
        if (drawn <= st.start) return;
        ctx.save();
        ctx.translate(box.bx + st.x * box.k, box.by + st.y * box.k);
        ctx.scale(box.k * st.s, box.k * st.s);
        ctx.lineWidth = 3 / st.s;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = st.c === 'accent' ? accentColor : inkColor;
        var local = drawn - st.start;
        if (local >= st.len) {
          ctx.setLineDash([]);
        } else {
          ctx.setLineDash([st.len, st.len]);
          ctx.lineDashOffset = st.len - local;
          tip = { st: st, local: local };
        }
        ctx.stroke(st.path2d);
        ctx.restore();
      });
      if (p < 1 && tip) {
        var lp = tip.st.el.getPointAtLength(clamp(tip.local, 0, tip.st.len));
        var X = box.bx + (tip.st.x + lp.x * tip.st.s) * box.k;
        var Y = box.by + (tip.st.y + lp.y * tip.st.s) * box.k;
        ctx.beginPath();
        ctx.fillStyle = accentColor;
        ctx.arc(X, Y, 3 * box.k, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    var duration = clamp(total / 220, 1.2, 3.0) * 1000;
    var progress = reduced ? 1 : 0;
    var tracing = false;
    var rafId = null;
    var startTs = 0;
    var lastFrameTs = 0;

    function loop(ts) {
      if (ts - lastFrameTs < 33) { rafId = requestAnimationFrame(loop); return; }
      lastFrameTs = ts;
      progress = clamp((ts - startTs) / duration, 0, 1);
      render(progress);
      if (progress >= 1) { tracing = false; rafId = null; return; }
      rafId = requestAnimationFrame(loop);
    }

    function startTrace() {
      if (reduced || tracing) return;
      tracing = true;
      progress = 0;
      lastFrameTs = 0;
      rafId = requestAnimationFrame(function (ts) { startTs = ts; loop(ts); });
    }

    function pauseTrace() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    function resumeTrace() {
      if (!tracing) return;
      rafId = requestAnimationFrame(function (ts) {
        startTs = ts - progress * duration;
        lastFrameTs = 0;
        rafId = requestAnimationFrame(loop);
      });
    }

    computeBox();
    render(progress);

    if (!reduced) {
      setTimeout(startTrace, 600);
      band.addEventListener('mouseenter', function () {
        if (!tracing) startTrace();
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) pauseTrace();
        else resumeTrace();
      });
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        computeBox();
        render(progress);
      }, 150);
    });
    window.addEventListener('load', function () {
      computeBox();
      render(progress);
    });

    return {
      repaint: function () {
        pauseTrace();
        tracing = false;
        progress = 1;
        render(1);
      }
    };
  }

  /* ---------- boot ---------- */
  sceneApi = initScene();
  initPalette();
  initNav();
  initInView();
  initTally();
  initCat();
  initCopy();
  initToc();
  initBigO();
})();
