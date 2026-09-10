/* r3-cat site.js — palette, menu, cat, scene, big-o, toc, copy buttons */
(function () {
  'use strict';

  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------------------------------------------------------- 1. palette */
  (function () {
    var dots = document.querySelectorAll('.palette__dot');
    if (!dots.length) return;

    var qs = new URLSearchParams(location.search);
    var qp = qs.get('palette');
    if (qp) {
      document.documentElement.dataset.palette = qp;
      try { localStorage.setItem('palette', qp); } catch (e) {}
    }

    function sync() {
      var current = document.documentElement.dataset.palette || 'alley';
      dots.forEach(function (d) {
        d.setAttribute('aria-pressed', d.dataset.palette === current ? 'true' : 'false');
      });
    }
    sync();

    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        var name = d.dataset.palette;
        document.documentElement.dataset.palette = name;
        try { localStorage.setItem('palette', name); } catch (e) {}
        sync();
        window.dispatchEvent(new Event('palettechange'));
      });
    });
  })();

  /* ------------------------------------------------------------ 2. menu */
  (function () {
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
  })();

  /* ------------------------------------------------------------- 3. cat */
  (function () {
    var cats = Array.prototype.slice.call(document.querySelectorAll('svg.cat'));
    if (!cats.length) return;

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    cats.forEach(function (svg) {
      svg.lastSeen = 0;
      setTimeout(function () { svg.classList.add('is-stretch', 'is-awake'); }, 300);
      setTimeout(function () { svg.classList.remove('is-stretch'); }, 1200);
      setTimeout(function () {
        if (performance.now() - svg.lastSeen > 1800) svg.classList.remove('is-awake');
      }, 2600);

      if (!reduce) {
        (function scheduleFlick() {
          setTimeout(function () {
            var ears = svg.querySelectorAll('.cat__ear');
            var ear = ears[Math.random() < 0.5 ? 0 : 1];
            if (ear) {
              ear.classList.add('is-flick');
              ear.addEventListener('animationend', function handler() {
                ear.classList.remove('is-flick');
                ear.removeEventListener('animationend', handler);
              });
            }
            scheduleFlick();
          }, 6000 + Math.random() * 8000);
        })();

        (function scheduleBlink() {
          setTimeout(function () {
            if (svg.classList.contains('is-awake')) {
              var eyes = svg.querySelector('.cat__eyes');
              if (eyes) {
                eyes.classList.add('is-blink');
                eyes.addEventListener('animationend', function handler() {
                  eyes.classList.remove('is-blink');
                  eyes.removeEventListener('animationend', handler);
                });
              }
            }
            scheduleBlink();
          }, 3000 + Math.random() * 3000);
        })();
      }
    });

    /* pointer tracking, processed once per rAF */
    var pending = null;
    window.addEventListener('pointermove', function (e) {
      pending = { x: e.clientX, y: e.clientY };
    });
    function track() {
      if (pending) {
        var mx = pending.x, my = pending.y;
        cats.forEach(function (svg) {
          var r = svg.getBoundingClientRect();
          var hx = r.left + r.width * 0.33;
          var hy = r.top + r.height * 0.52;
          var dx = mx - hx, dy = my - hy;
          var d = Math.hypot(dx, dy);
          var now = performance.now();
          if (d < 260 || svg.dataset.awake === 'always') {
            svg.classList.add('is-awake');
            svg.lastSeen = now;
          } else if (now - svg.lastSeen > 1800) {
            svg.classList.remove('is-awake');
          }
          var px = clamp(dx / 40, -4, 4);
          var py = clamp(dy / 60, -1.5, 1.5);
          svg.querySelectorAll('.cat__pupil').forEach(function (p) {
            p.style.transform = 'translate(' + px + 'px,' + py + 'px)';
          });
          var fig = svg.closest('.cat-fig');
          if (fig) {
            var cap = fig.querySelector('.cat-fig__cap');
            if (cap) cap.textContent = svg.classList.contains('is-awake') ? 'disturbed.' : 'resting in peace (.rip)';
          }
        });
      }
      requestAnimationFrame(track);
    }
    requestAnimationFrame(track);

    var deerLink = document.querySelector('.side__deer');
    var sideCat = document.querySelector('.cat-fig .cat');
    var catBtn = document.querySelector('.cat-btn');

    if (deerLink && sideCat) {
      deerLink.addEventListener('mouseenter', function () {
        sideCat.classList.add('is-awake');
        sideCat.lastSeen = performance.now();
        sideCat.querySelectorAll('.cat__pupil').forEach(function (p) {
          p.style.transform = 'translate(0px,1.5px)';
        });
      });
    }
    if (catBtn && sideCat) {
      catBtn.addEventListener('focus', function () {
        sideCat.classList.add('is-awake');
        sideCat.lastSeen = performance.now();
        sideCat.querySelectorAll('.cat__pupil').forEach(function (p) {
          p.style.transform = 'translate(0px,0px)';
        });
      });
    }

    /* click / long-press / bubble / opt-in audio */
    if (catBtn && sideCat) {
      var bubble = catBtn.querySelector('.cat__bubble');
      var muteBtn = document.querySelector('.cat-mute');
      var clickCount = 0, lastClick = 0, pressTimer = null, longPressed = false, audio = null;

      if (muteBtn) {
        if (localStorage.getItem('catSeen') === '1') muteBtn.hidden = false;
        var muted0 = localStorage.getItem('catMuted') === '1';
        muteBtn.setAttribute('aria-pressed', muted0 ? 'true' : 'false');
        muteBtn.textContent = muted0 ? 'unmute' : 'mute';
      }

      function bubbleShow(text) {
        if (!bubble) return;
        bubble.textContent = text;
        bubble.classList.add('is-on');
        setTimeout(function () { bubble.classList.remove('is-on'); }, 900);
      }
      function stretchNow() {
        sideCat.classList.add('is-stretch');
        setTimeout(function () { sideCat.classList.remove('is-stretch'); }, 900);
      }
      function chill() {
        if (localStorage.getItem('catMuted') === '1') {
          bubbleShow('…');
          return;
        }
        if (!audio) audio = new Audio('../../../public/chill_guy_man.mp3');
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
          sideCat.classList.remove('is-vibe');
        } else {
          audio.play().catch(function () {});
          sideCat.classList.add('is-vibe', 'is-awake');
          sideCat.lastSeen = performance.now();
          audio.addEventListener('ended', function () { sideCat.classList.remove('is-vibe'); }, { once: true });
        }
        if (muteBtn) muteBtn.hidden = false;
        try { localStorage.setItem('catSeen', '1'); } catch (e) {}
      }

      catBtn.addEventListener('pointerdown', function () {
        longPressed = false;
        clearTimeout(pressTimer);
        pressTimer = setTimeout(function () {
          longPressed = true;
          chill();
          clickCount = 0;
        }, 600);
      });
      catBtn.addEventListener('pointerup', function () { clearTimeout(pressTimer); });
      catBtn.addEventListener('pointercancel', function () { clearTimeout(pressTimer); });

      catBtn.addEventListener('click', function (e) {
        if (longPressed) { e.preventDefault(); longPressed = false; return; }
        var now = performance.now();
        if (now - lastClick > 10000) clickCount = 0;
        lastClick = now;
        clickCount++;
        if (clickCount === 5) {
          chill();
          clickCount = 0;
          return;
        }
        if (clickCount % 2 === 1) bubbleShow('?');
        else stretchNow();
      });

      if (muteBtn) {
        muteBtn.addEventListener('click', function () {
          var muted = localStorage.getItem('catMuted') !== '1';
          try { localStorage.setItem('catMuted', muted ? '1' : '0'); } catch (e) {}
          muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
          muteBtn.textContent = muted ? 'unmute' : 'mute';
          if (muted && audio && !audio.paused) {
            audio.pause();
            sideCat.classList.remove('is-vibe');
          }
        });
      }
    }
  })();

  /* --------------------------------------------------------- 4. scene */
  (function () {
    var canvas = document.querySelector('canvas.scene');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var isArticle = document.body.classList.contains('is-article');
    var w, h, dpr;
    var yarn = [], motes = [], paws = [];
    var raf = null, last = 0;
    var colors = { accent: '#F5A742', accent2: '#8FC7B5', muted: '#9B939E' };

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
    window.addEventListener('palettechange', readColors);

    function drawYarn() {
      yarn.forEach(function (strand) {
        var p = strand.pts;
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        ctx.bezierCurveTo(p[1].x, p[1].y, p[2].x, p[2].y, p[3].x, p[3].y);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = strand.odd ? hexToRgba(colors.accent, 0.10) : hexToRgba(colors.accent2, 0.10);
        ctx.stroke();
      });
    }
    function drawMotes() {
      ctx.fillStyle = hexToRgba(colors.muted, 0.22);
      motes.forEach(function (m) {
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    function drawPaws(now) {
      paws.forEach(function (p) {
        var age = now - p.born;
        var a = 0.35 * (1 - age / 2500) * (isArticle ? 0.5 : 1);
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

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (t - last < 33) return;
      var dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      ctx.clearRect(0, 0, w, h);
      if (isArticle) ctx.globalAlpha = 0.5;
      step(dt);
      drawYarn();
      drawMotes();
      drawPaws(t);
      paws = paws.filter(function (p) { return (t - p.born) <= 2500; });
      ctx.globalAlpha = 1;
    }

    var lastPaw = null, pawSide = 1;
    function onMove(e) {
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

    readColors();
    resize();

    if (reduce) {
      ctx.clearRect(0, 0, w, h);
      drawYarn();
      drawMotes();
    } else {
      window.addEventListener('pointermove', onMove);
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    document.addEventListener('visibilitychange', function () {
      if (reduce) return;
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      } else if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    });
  })();

  /* -------------------------------------------------------- 5. big-o */
  (function () {
    var fig = document.getElementById('bigo');
    if (!fig) return;
    var svg = fig.querySelector('.bigo__svg');
    var gridG = svg && svg.querySelector('.bigo__grid');
    var axisG = svg && svg.querySelector('.bigo__axis');
    var curvesG = svg && svg.querySelector('.bigo__curves');
    var labelsG = svg && svg.querySelector('.bigo__labels');
    var range = fig.querySelector('.bigo__range');
    var out = fig.querySelector('.bigo__out');
    if (!svg || !gridG || !axisG || !curvesG || !labelsG || !range || !out) return;

    var W = 640, H = 300, padL = 40, padR = 70, padT = 16, padB = 28;
    var fns = {
      c: { f: function () { return 1; }, label: 'O(1)' },
      log: { f: function (n) { return Math.log2(n); }, label: 'O(log n)' },
      n: { f: function (n) { return n; }, label: 'O(n)' },
      nlog: { f: function (n) { return n * Math.log2(n); }, label: 'O(n log n)' },
      n2: { f: function (n) { return n * n; }, label: 'O(n²)' },
      exp: { f: function (n) { return Math.pow(2, n); }, label: 'O(2ⁿ)' }
    };
    var order = ['c', 'log', 'n', 'nlog', 'n2', 'exp'];
    var activeFn = null;

    function svgEl(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }
    function text(x, y, str, anchor) {
      var t = svgEl('text');
      t.setAttribute('x', x); t.setAttribute('y', y);
      if (anchor) t.setAttribute('text-anchor', anchor);
      t.textContent = str;
      return t;
    }

    function setActive(key) {
      fig.classList.toggle('has-active', !!key);
      svg.querySelectorAll('[data-fn]').forEach(function (el) {
        el.classList.toggle('is-active', !!key && el.getAttribute('data-fn') === key);
      });
      fig.querySelectorAll('.bigo__key').forEach(function (btn) {
        btn.classList.toggle('is-active', !!key && btn.dataset.fn === key);
      });
    }

    function render(N) {
      var yMax = N * N;
      gridG.textContent = ''; axisG.textContent = ''; curvesG.textContent = ''; labelsG.textContent = '';

      for (var i = 1; i <= 4; i++) {
        var frac = i * 0.25;
        var y = padT + (H - padT - padB) * (1 - frac);
        var line = svgEl('line');
        line.setAttribute('x1', padL); line.setAttribute('x2', W - padR);
        line.setAttribute('y1', y); line.setAttribute('y2', y);
        gridG.appendChild(line);
      }
      var axisLine = svgEl('line');
      axisLine.setAttribute('x1', padL); axisLine.setAttribute('x2', W - padR);
      axisLine.setAttribute('y1', H - padB); axisLine.setAttribute('y2', H - padB);
      axisG.appendChild(axisLine);
      axisG.appendChild(text(padL, H - padB + 18, '1'));
      axisG.appendChild(text(W - padR, H - padB + 18, String(N), 'end'));
      axisG.appendChild(text(W - padR + 18, H - padB + 4, 'n'));
      axisG.appendChild(text(padL, padT - 4, 'n²'));

      order.forEach(function (key) {
        var fn = fns[key].f;
        var d = '';
        var lastX = padL, lastY = H - padB, clippedFinal = false;
        for (var n = 1; n <= N; n += 0.25) {
          var val = fn(n);
          var x = padL + (n - 1) / (N - 1) * (W - padL - padR);
          var clipped = val > yMax;
          var yv = Math.min(val, yMax);
          var yy = (H - padB) - (yv / yMax) * (H - padT - padB);
          d += (d === '' ? 'M ' : 'L ') + x.toFixed(2) + ' ' + yy.toFixed(2) + ' ';
          lastX = x; lastY = yy; clippedFinal = clipped;
          if (clipped) break;
        }
        var hit = svgEl('path');
        hit.setAttribute('class', 'bigo__hit');
        hit.setAttribute('data-fn', key);
        hit.setAttribute('d', d);
        curvesG.appendChild(hit);
        var curve = svgEl('path');
        curve.setAttribute('class', 'bigo__curve');
        curve.setAttribute('data-fn', key);
        curve.setAttribute('d', d);
        curvesG.appendChild(curve);

        var lblY = clippedFinal ? (padT + 10) : lastY;
        var lbl = text(lastX + 6, lblY, fns[key].label);
        lbl.setAttribute('class', 'bigo__label');
        lbl.setAttribute('data-fn', key);
        labelsG.appendChild(lbl);

        hit.addEventListener('pointerenter', function () { activeFn = key; setActive(key); });
        hit.addEventListener('pointerleave', function () { activeFn = null; setActive(null); });
        hit.addEventListener('focus', function () { activeFn = key; setActive(key); });
        hit.addEventListener('blur', function () { activeFn = null; setActive(null); });
      });

      if (activeFn) setActive(activeFn);
    }

    fig.querySelectorAll('.bigo__key').forEach(function (btn) {
      var key = btn.dataset.fn;
      btn.addEventListener('pointerenter', function () { activeFn = key; setActive(key); });
      btn.addEventListener('pointerleave', function () { activeFn = null; setActive(null); });
      btn.addEventListener('focus', function () { activeFn = key; setActive(key); });
      btn.addEventListener('blur', function () { activeFn = null; setActive(null); });
    });

    range.addEventListener('input', function () {
      out.value = range.value;
      render(parseInt(range.value, 10));
    });

    render(parseInt(range.value, 10));
  })();

  /* ------------------------------------------------------------- 6. toc */
  (function () {
    var prose = document.querySelector('.prose');
    var toc = document.querySelector('.toc');
    if (!prose || !toc) return;
    var headings = prose.querySelectorAll('h2,h3,h4');
    if (!headings.length) return;
    var links = toc.querySelectorAll('a');
    if (!links.length) return;

    function setCurrent(id) {
      links.forEach(function (a) {
        a.classList.toggle('is-current', a.getAttribute('href') === '#' + id);
      });
    }
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    headings.forEach(function (h) { if (h.id) observer.observe(h); });
  })();

  /* --------------------------------------------------------- 7. copy */
  (function () {
    var buttons = document.querySelectorAll('.code__copy');
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var figure = btn.closest('.code');
        var pre = figure && figure.querySelector('pre');
        if (!pre) return;
        function done() {
          btn.textContent = 'Copied';
          btn.classList.add('is-done');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('is-done');
          }, 1200);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(pre.innerText).then(done).catch(done);
        } else {
          done();
        }
      });
    });
  })();
})();
