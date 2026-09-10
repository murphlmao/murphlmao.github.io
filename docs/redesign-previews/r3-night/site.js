/* murph.rip at night — site.js
   Canvas scene, palette switcher, cat easter egg, copy buttons,
   Big O figure, TOC scroll-spy. Every feature is guarded so list
   pages (no article markup) run without errors. */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initPalette();
    initScene();
    initCat();
    initCopyButtons();
    initBigO();
    initTOC();
  });

  /* ---------- palette switcher ---------- */
  function initPalette() {
    var buttons = document.querySelectorAll('.palette__swatch');
    var root = document.documentElement;

    // ?palette= query param (for preview screenshots), does not persist
    try {
      var qp = new URLSearchParams(location.search).get('palette');
      if (qp) root.dataset.palette = qp;
    } catch (e) {}

    if (!buttons.length) return;

    function sync(set) {
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.set === set ? 'true' : 'false');
      });
    }
    sync(root.dataset.palette || 'night');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var set = btn.dataset.set;
        root.dataset.palette = set;
        try { localStorage.setItem('palette', set); } catch (e) {}
        sync(set);
        document.dispatchEvent(new CustomEvent('palettechange'));
      });
    });
  }

  /* ---------- canvas scene ---------- */
  function initScene() {
    var canvas = document.querySelector('.scene');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var colors = { text: '#E8E6DF', accent: '#F2B143', muted: '#8E93A6' };
    var region = { left: 0, top: 0, right: 0, bottom: 0, w: 0, h: 0 };
    var W = 0, H = 0;
    var stars = [], fireflies = [], fog = null;
    var deer = null, shoot = null;
    var mouse = { x: innerWidth / 2, y: innerHeight / 2 };
    var par = { x: 0, y: 0 };
    var last = 0, raf = null;
    var loadStart = performance.now();
    var nextShoot = loadStart + rand(20, 40) * 1000;
    var forceLookUntil = 0;

    var P_BODY = new Path2D('M13 24L14 20L46 18L50 22L48 30L18 31Z');
    var P_NECK = new Path2D('M44 20L47 10L54 12L50 22Z');
    var P_TAIL = new Path2D('M13 22L9 19L12 26Z');
    var P_HEAD_SIDE = new Path2D('M47 10L55 7L61 12L61 15L56 15L52 13Z');
    var P_ANTLERS = new Path2D('M51 8L49 2M51 8L54 3M49 5L46 3M53 5L57 3');
    var P_LOOK_EARS = new Path2D('M47 7L45 2L49 6ZM53 6L56 2L55 7Z');
    var P_LEGS_A = new Path2D('M42 29L45 29L47 46L44 46ZM37 29L40 29L36 46L33 46ZM20 29L23 29L27 46L24 46ZM15 29L18 29L14 46L11 46Z');
    var P_LEGS_B = new Path2D('M42 29L45 29L41 46L38 46ZM37 29L40 29L44 46L41 46ZM20 29L23 29L17 46L14 46ZM15 29L18 29L22 46L19 46Z');
    var P_LEGS_STAND = new Path2D('M42 29L45 29L45 46L42 46ZM37 29L40 29L40 46L37 46ZM20 29L23 29L23 46L20 46ZM15 29L18 29L18 46L15 46Z');

    function rand(a, b) { return a + Math.random() * (b - a); }

    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      colors.text = cs.getPropertyValue('--text').trim() || colors.text;
      colors.accent = cs.getPropertyValue('--accent').trim() || colors.accent;
      colors.muted = cs.getPropertyValue('--muted').trim() || colors.muted;
    }

    function colorAlpha(hex, a) {
      var h = (hex || '#888888').replace('#', '');
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      var r = parseInt(h.substr(0, 2), 16) || 0;
      var g = parseInt(h.substr(2, 2), 16) || 0;
      var b = parseInt(h.substr(4, 2), 16) || 0;
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }

    function computeRegion() {
      var pos = getComputedStyle(canvas).position;
      var r;
      if (pos === 'fixed') {
        var panel = document.querySelector('.panel');
        r = panel ? panel.getBoundingClientRect() : { left: 0, top: 0, right: W, bottom: H };
      } else {
        r = { left: 0, top: 0, right: W, bottom: H };
      }
      region.left = r.left; region.top = r.top; region.right = r.right; region.bottom = r.bottom;
      region.w = region.right - region.left;
      region.h = region.bottom - region.top;
    }

    function buildStars() {
      stars = [];
      var count = Math.min(220, Math.floor((W * H) / 9000));
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random(), y: Math.random(),
          r: rand(0.4, 1.4),
          depth: [0.3, 0.6, 1][Math.floor(Math.random() * 3)],
          twinkle: Math.random() < 0.3,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function buildFireflies() {
      fireflies = [];
      for (var i = 0; i < 7; i++) {
        fireflies.push({
          x: region.left + Math.random() * Math.max(1, region.w),
          y: region.top + region.h * 0.3 + Math.random() * region.h * 0.7,
          phase: Math.random() * Math.PI * 2,
          speed: rand(0.4, 0.9)
        });
      }
    }

    function buildFog() {
      var fw = Math.max(1, Math.round(region.w * 2));
      // cap the band so blob radius (tied to fh) can't outgrow the fixed-width
      // canvas on tall viewports and wash the page out; stays quiet at any height.
      var fh = Math.max(1, Math.round(Math.min(region.h * 0.3, 320)));
      fog = document.createElement('canvas');
      fog.width = fw; fog.height = fh;
      var fctx = fog.getContext('2d');
      function blob(x, y, rad) {
        var g = fctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, colorAlpha(colors.muted, 0.10));
        g.addColorStop(1, colorAlpha(colors.muted, 0));
        fctx.fillStyle = g;
        fctx.beginPath(); fctx.arc(x, y, rad, 0, Math.PI * 2); fctx.fill();
      }
      for (var i = 0; i < 5; i++) blob(Math.random() * fw, fh * rand(0.3, 0.9), fh * rand(0.5, 0.9));
      // mirrored copy on the right half so the texture wraps cleanly
      fctx.save();
      fctx.translate(fw, 0); fctx.scale(-1, 1);
      for (var j = 0; j < 5; j++) blob(Math.random() * fw, fh * rand(0.3, 0.9), fh * rand(0.5, 0.9));
      fctx.restore();
    }

    function resetDeer() {
      deer = {
        x: region.left - 80, state: 'walk',
        legFrame: 'A', legTimer: 0,
        lookUntil: 0, nextLook: performance.now() + rand(25, 50) * 1000,
        nextEnter: 0
      };
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      computeRegion();
      buildStars();
      buildFireflies();
      buildFog();
      if (!deer) resetDeer();
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY;
    });

    var deerLog = document.querySelector('.deer-log');
    if (deerLog) {
      deerLog.addEventListener('mouseenter', function () { forceLookUntil = Infinity; });
      deerLog.addEventListener('mouseleave', function () { forceLookUntil = performance.now() + 1000; });
    }

    document.addEventListener('palettechange', function () {
      readColors();
      buildFog();
      shootStar();
    });

    document.addEventListener('visibilitychange', function () {
      if (reduced) return;
      if (document.hidden) {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      } else if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    });

    function shootStar() {
      if (reduced || !region.w) return;
      shoot = {
        x: region.left + Math.random() * region.w,
        y: region.top + Math.random() * region.h * 0.4,
        vx: 900, vy: 450, life: 0.6, maxLife: 0.6
      };
    }
    function drawStars(t, loadRamp) {
      ctx.fillStyle = colors.text;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var alpha = s.twinkle ? (0.45 + 0.45 * Math.sin(t * 0.8 + s.phase)) : 0.7;
        var sx = s.x * W, sy = s.y * H;
        var inside = sx >= region.left && sx <= region.right && sy >= region.top && sy <= region.bottom;
        if (!inside) alpha *= 0.25;
        alpha *= loadRamp;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        var ox = sx + par.x * s.depth, oy = sy + par.y * s.depth;
        if (s.r < 0.8) ctx.fillRect(ox, oy, s.r * 2, s.r * 2);
        else { ctx.beginPath(); ctx.arc(ox, oy, s.r, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    }

    function drawFog(t) {
      if (!fog || !region.w) return;
      var offset = -((t * 6) % region.w);
      var y = region.bottom - fog.height;
      ctx.save();
      // keep the tiled fog band inside the panel rect only -- it must not
      // bleed into the content column on tall pages
      ctx.beginPath();
      ctx.rect(region.left, region.top, region.w, region.h);
      ctx.clip();
      ctx.drawImage(fog, region.left + offset, y);
      ctx.drawImage(fog, region.left + offset + region.w, y);
      // soft fade at the band's top edge so it doesn't cut off with a hard seam
      var fadeH = Math.min(fog.height * 0.5, 60);
      var fade = ctx.createLinearGradient(0, y, 0, y + fadeH);
      fade.addColorStop(0, 'rgba(0,0,0,1)');
      fade.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = fade;
      ctx.fillRect(region.left, y, region.w, fadeH);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }

    function drawFireflies(t, loadRamp) {
      ctx.fillStyle = colors.accent;
      for (var i = 0; i < fireflies.length; i++) {
        var f = fireflies[i];
        f.x += Math.cos(t * f.speed + f.phase) * 0.35;
        f.y += Math.sin(t * f.speed * 0.7 + f.phase) * 0.25;
        if (f.x < region.left) f.x = region.left; if (f.x > region.right) f.x = region.right;
        var lowTop = region.top + region.h * 0.3;
        if (f.y < lowTop) f.y = lowTop; if (f.y > region.bottom) f.y = region.bottom;
        var glow = Math.max(0, Math.sin(t * 1.3 * f.speed + f.phase));
        glow = glow * glow * glow;
        ctx.globalAlpha = 0.35 * glow * loadRamp;
        ctx.beginPath(); ctx.arc(f.x, f.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = glow * loadRamp;
        ctx.beginPath(); ctx.arc(f.x, f.y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawDeer(now, dt, forcedX, forcedLook) {
      if (!deer) return;
      if (forcedX != null) {
        ctx.save();
        ctx.translate(forcedX, region.bottom - 48);
        ctx.fillStyle = colorAlpha(colors.muted, 0.75);
        ctx.fill(P_BODY); ctx.fill(P_NECK); ctx.fill(P_TAIL);
        ctx.beginPath(); ctx.arc(51, 9.5, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fill(P_LOOK_EARS);
        ctx.fillStyle = colors.accent;
        ctx.beginPath(); ctx.arc(49.3, 9.3, 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(52.7, 9.3, 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = colorAlpha(colors.muted, 0.75);
        ctx.fill(P_LEGS_STAND);
        ctx.restore();
        return;
      }

      if (deer.state === 'gone') {
        if (now >= deer.nextEnter) { deer.state = 'walk'; deer.x = region.left - 80; }
        return;
      }

      var boxX = deer.x, boxY = region.bottom - 16 - 48;
      var hovering = mouse.x >= boxX && mouse.x <= boxX + 64 && mouse.y >= boxY && mouse.y <= boxY + 48;
      if (hovering) forceLookUntil = now + 1000;
      var forced = now < forceLookUntil;

      if (deer.state === 'walk') {
        deer.x += 12 * dt;
        if (now >= deer.nextLook || forced) {
          deer.state = 'look';
          deer.lookUntil = now + rand(2, 4) * 1000;
        }
      } else if (deer.state === 'look') {
        if (now >= deer.lookUntil && !forced) {
          deer.state = 'walk';
          deer.nextLook = now + rand(25, 50) * 1000;
        }
      }

      if (deer.x > region.right + 80) {
        deer.state = 'gone';
        deer.nextEnter = now + rand(8, 15) * 1000;
        return;
      }

      if (now - deer.legTimer > 350) { deer.legFrame = deer.legFrame === 'A' ? 'B' : 'A'; deer.legTimer = now; }

      ctx.save();
      ctx.translate(deer.x, region.bottom - 48);
      ctx.fillStyle = colorAlpha(colors.muted, 0.75);
      ctx.fill(P_BODY); ctx.fill(P_NECK); ctx.fill(P_TAIL);
      if (deer.state === 'look') {
        ctx.beginPath(); ctx.arc(51, 9.5, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fill(P_LOOK_EARS);
        ctx.fillStyle = colors.accent;
        ctx.beginPath(); ctx.arc(49.3, 9.3, 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(52.7, 9.3, 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = colorAlpha(colors.muted, 0.75);
        ctx.fill(P_LEGS_STAND);
      } else {
        ctx.fill(P_HEAD_SIDE);
        ctx.strokeStyle = colorAlpha(colors.muted, 0.75);
        ctx.lineWidth = 1.2;
        ctx.stroke(P_ANTLERS);
        ctx.fill(deer.legFrame === 'A' ? P_LEGS_A : P_LEGS_B);
      }
      ctx.restore();
    }

    function drawShoot(dt) {
      if (!shoot) return;
      shoot.life -= dt;
      if (shoot.life <= 0) { shoot = null; return; }
      shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt;
      var ang = Math.atan2(shoot.vy, shoot.vx);
      var tailX = shoot.x - Math.cos(ang) * 120, tailY = shoot.y - Math.sin(ang) * 120;
      var g = ctx.createLinearGradient(shoot.x, shoot.y, tailX, tailY);
      g.addColorStop(0, colors.accent);
      g.addColorStop(1, colorAlpha(colors.accent, 0));
      ctx.strokeStyle = g; ctx.lineWidth = 2;
      ctx.globalAlpha = 1 - shoot.life / shoot.maxLife;
      ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(tailX, tailY); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function frame(ts) {
      if (!last) last = ts;
      if (ts - last < 33) { raf = requestAnimationFrame(frame); return; }
      var dt = (ts - last) / 1000;
      last = ts;
      var t = ts / 1000;
      var loadRamp = Math.min(1, (ts - loadStart) / 1200);

      ctx.clearRect(0, 0, W, H);

      var targetX = W ? ((mouse.x - W / 2) / (W / 2)) * 6 : 0;
      var targetY = H ? ((mouse.y - H / 2) / (H / 2)) * 6 : 0;
      par.x += (targetX - par.x) * 0.05;
      par.y += (targetY - par.y) * 0.05;

      drawStars(t, loadRamp);
      drawFog(t);
      drawDeer(ts, dt);
      drawFireflies(t, loadRamp);
      drawShoot(dt);

      if (ts >= nextShoot) { shootStar(); nextShoot = ts + rand(20, 40) * 1000; }

      raf = requestAnimationFrame(frame);
    }

    readColors();
    resize();

    if (reduced) {
      ctx.clearRect(0, 0, W, H);
      drawStars(0, 1);
      drawFog(0);
      drawDeer(0, 0, region.left + 0.62 * region.w, true);
      drawFireflies(0, 1);
    } else {
      raf = requestAnimationFrame(frame);
    }
  }

  /* ---------- cat: click/keyboard toggles the audio easter egg ---------- */
  function initCat() {
    var cat = document.querySelector('.cat');
    var audio = document.getElementById('chill');
    var toast = document.querySelector('.toast');
    if (!cat || !audio) return;

    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.hidden = false;
      setTimeout(function () { toast.hidden = true; }, 2000);
    }

    function toggle() {
      if (audio.paused) {
        audio.play().catch(function () {});
        cat.setAttribute('aria-pressed', 'true');
        showToast('just a chill guy.');
      } else {
        audio.pause();
        cat.setAttribute('aria-pressed', 'false');
      }
    }

    cat.addEventListener('click', toggle);
    cat.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    audio.addEventListener('ended', function () { cat.setAttribute('aria-pressed', 'false'); });
  }

  /* ---------- copy buttons on code figures ---------- */
  function initCopyButtons() {
    var buttons = document.querySelectorAll('.code__copy');
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var figure = btn.closest('.code');
        var pre = figure.querySelector('pre');
        var text = pre.innerText;
        function done() {
          btn.textContent = 'Copied';
          btn.dataset.state = 'done';
          setTimeout(function () { btn.textContent = 'Copy'; btn.removeAttribute('data-state'); }, 1500);
        }
        function fail() {
          btn.textContent = 'Copy failed';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, fail);
        } else {
          fail();
        }
      });
    });
  }

  /* ---------- Big O interactive figure ---------- */
  function initBigO() {
    var fig = document.getElementById('bigo');
    if (!fig) return;
    var svg = fig.querySelector('.bigo');
    var range = fig.querySelector('.bigo__range');
    var output = fig.querySelector('output');

    var FNS = {
      c: function () { return 1; },
      log: function (n) { return Math.log2(Math.max(n, 1)); },
      n: function (n) { return n; },
      nlog: function (n) { return n * Math.log2(Math.max(n, 1)); },
      n2: function (n) { return n * n; },
      exp: function (n) { return Math.pow(2, n); }
    };
    var LABELS = { c: 'O(1)', log: 'O(log n)', n: 'O(n)', nlog: 'O(n log n)', n2: 'O(n²)', exp: 'O(2ⁿ)' };
    var KEYS = ['c', 'log', 'n', 'nlog', 'n2', 'exp'];

    function render(N) {
      var yCap = 1.25 * N * N;
      KEYS.forEach(function (key) {
        var fn = FNS[key];
        var d = '', lastPt = null;
        for (var n = 1; n <= N; n += 0.25) {
          var x = 40 + ((n - 1) / (N - 1)) * 580;
          var val = fn(n);
          var y = 270 - (Math.min(val, yCap * 2) / yCap) * 250;
          d += (d ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
          if (y >= 20) lastPt = [x, y];
        }
        svg.querySelectorAll('.bigo__hit[data-key="' + key + '"], .bigo__curve[data-key="' + key + '"]').forEach(function (el) {
          el.setAttribute('d', d);
        });
        var label = svg.querySelector('.bigo__label[data-key="' + key + '"]');
        if (label) {
          if (lastPt) {
            label.setAttribute('x', lastPt[0] - 4);
            label.setAttribute('y', lastPt[1] - 6);
            label.textContent = LABELS[key];
            label.style.display = '';
          } else {
            label.style.display = 'none';
          }
        }
      });
      var mid = svg.querySelector('[data-tick="mid"]');
      var max = svg.querySelector('[data-tick="max"]');
      if (mid) mid.textContent = Math.round(N / 2);
      if (max) max.textContent = N;
    }

    render(parseInt(range.value, 10) || 10);

    range.addEventListener('input', function () {
      if (output) output.value = range.value;
      render(parseInt(range.value, 10));
    });

    fig.querySelectorAll('.bigo__hit, .bigo__key').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        var key = el.dataset.key;
        svg.dataset.active = key;
        fig.querySelectorAll('.bigo__key').forEach(function (k) {
          k.setAttribute('aria-pressed', k.dataset.key === key ? 'true' : 'false');
        });
      });
      el.addEventListener('mouseleave', function () {
        delete svg.dataset.active;
        fig.querySelectorAll('.bigo__key').forEach(function (k) { k.setAttribute('aria-pressed', 'false'); });
      });
    });
  }

  /* ---------- table of contents scroll-spy ---------- */
  function initTOC() {
    var toc = document.querySelector('.toc');
    var prose = document.querySelector('.prose');
    if (!toc || !prose || !('IntersectionObserver' in window)) return;

    var links = {};
    toc.querySelectorAll('.toc__link').forEach(function (a) {
      links[a.getAttribute('href').slice(1)] = a;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(links).forEach(function (id) { links[id].removeAttribute('aria-current'); });
        var link = links[entry.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '0px 0px -70% 0px' });

    prose.querySelectorAll('h2, h3, h4').forEach(function (h) { observer.observe(h); });
  }
})();
