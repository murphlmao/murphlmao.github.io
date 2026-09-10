// r3-terminal — murph.rip. Shell interactions, canvases, palette, big-O figure.
(function () {
  "use strict";

  /* ---------- palette (query param honors ?palette=) ---------- */
  var qp = new URLSearchParams(location.search).get("palette");
  if (qp) document.documentElement.dataset.palette = qp;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    var g = function (n) { return cs.getPropertyValue(n).trim(); };
    return { accent: g("--accent"), accent2: g("--accent2"), muted: g("--muted"), line: g("--line"), text: g("--text") };
  }
  var colors = readColors();

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ============ palette switcher ============ */
  onReady(function () {
    var sel = document.querySelector(".palette-select");
    if (!sel) return;
    sel.value = document.documentElement.dataset.palette || "arch";
    sel.addEventListener("change", function () {
      document.documentElement.dataset.palette = sel.value;
      localStorage.setItem("palette", sel.value);
      colors = readColors();
      document.dispatchEvent(new CustomEvent("palettechange", { detail: colors }));
    });
  });

  /* ============ mobile menu sheet ============ */
  onReady(function () {
    var menuBtn = document.querySelector(".menu-btn");
    var side = document.querySelector(".side");
    var scrim = document.querySelector(".scrim");
    var closeBtn = document.querySelector(".side-close");
    if (!menuBtn || !side || !scrim) return;
    function open() {
      side.classList.add("is-open");
      scrim.classList.add("is-open");
      menuBtn.setAttribute("aria-expanded", "true");
    }
    function close() {
      side.classList.remove("is-open");
      scrim.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
    menuBtn.addEventListener("click", function () {
      side.classList.contains("is-open") ? close() : open();
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    scrim.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    if (new URLSearchParams(location.search).get("debugmenu") === "1") open();
  });

  /* ============ tree twisty ============ */
  onReady(function () {
    document.querySelectorAll(".tree-tw[aria-expanded]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var li = btn.closest("li");
        if (!li) return;
        var open = li.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  });

  /* ============ cat ============ */
  onReady(function () {
    var cat = document.querySelector(".cat");
    if (!cat) return;
    var baseFace = cat.dataset.face;
    setInterval(function () {
      if (cat.dataset.playing === "true") return;
      var cur = cat.dataset.face;
      cat.dataset.face = "=-.-=";
      setTimeout(function () { cat.dataset.face = cur; }, 150);
    }, 6000);

    var audio = null;
    var nowPlaying = document.querySelector(".now-playing");
    cat.addEventListener("click", function () {
      if (cat.dataset.playing === "true") {
        if (audio) audio.pause();
        cat.dataset.playing = "false";
        if (nowPlaying) nowPlaying.classList.remove("is-on");
        return;
      }
      if (!audio) {
        audio = new Audio("../../../public/chill_guy_man.mp3");
        audio.addEventListener("ended", function () {
          cat.dataset.playing = "false";
          if (nowPlaying) nowPlaying.classList.remove("is-on");
        });
      }
      audio.currentTime = 0;
      audio.play().catch(function () {});
      cat.dataset.playing = "true";
      if (nowPlaying) nowPlaying.classList.add("is-on");
    });
    void baseFace;
  });

  /* ============ copy buttons ============ */
  onReady(function () {
    document.querySelectorAll(".code-copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var fig = btn.closest(".code");
        var pre = fig && fig.querySelector("pre");
        if (!pre) return;
        var text = pre.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(function () {});
        }
        fig.classList.add("is-copied");
        btn.textContent = "copied";
        setTimeout(function () {
          fig.classList.remove("is-copied");
          btn.textContent = "copy";
        }, 1200);
      });
    });
  });

  /* ============ TOC scroll-spy ============ */
  onReady(function () {
    var toc = document.querySelector(".toc");
    var prose = document.querySelector(".prose");
    if (!toc || !prose) return;
    var headings = prose.querySelectorAll("h2[id], h3[id]");
    if (!headings.length) return;
    var isDesktop = window.matchMedia("(min-width: 900px)").matches;
    var root = isDesktop ? document.querySelector(".pane-scroll") : null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = toc.querySelector('a[href="#' + entry.target.id + '"]');
        if (!link) return;
        if (entry.isIntersecting) {
          toc.querySelectorAll("a.is-current").forEach(function (a) { a.classList.remove("is-current"); });
          link.classList.add("is-current");
        }
      });
    }, { root: root, rootMargin: "-10% 0px -80% 0px" });
    headings.forEach(function (h) { io.observe(h); });
  });

  /* ============ Big O figure ============ */
  onReady(function () {
    var fig = document.querySelector(".bigo");
    if (!fig) return;
    var curves = { c1: function (n) { return 1; },
      logn: function (n) { return Math.log2(n); },
      n: function (n) { return n; },
      nlogn: function (n) { return n * Math.log2(n); },
      n2: function (n) { return n * n; },
      exp: function (n) { return Math.pow(2, n); } };
    var input = fig.parentElement.querySelector('input[type="range"]');
    var output = fig.parentElement.querySelector("output");

    function recompute(N) {
      var yMax = N * N * 1.1;
      Object.keys(curves).forEach(function (key) {
        var f = curves[key];
        var pts = [];
        for (var n = 1; n <= N; n += 0.25) {
          var x = 40 + ((n - 1) / (N - 1)) * 550;
          var val = Math.min(f(n), yMax * 1.2);
          var y = 270 - (val / yMax) * 260;
          pts.push(x.toFixed(2) + " " + y.toFixed(2));
        }
        var d = "M " + pts.join(" L ");
        fig.querySelectorAll('[data-curve="' + key + '"]').forEach(function (el) { el.setAttribute("d", d); });
      });
    }
    recompute(parseInt((input && input.value) || "10", 10));
    if (input) {
      input.addEventListener("input", function () {
        if (output) output.textContent = input.value;
        recompute(parseInt(input.value, 10));
      });
    }

    function highlight(key) {
      fig.classList.add("has-hi");
      fig.querySelectorAll(".curve").forEach(function (c) { c.classList.toggle("is-hi", c.dataset.curve === key); });
      fig.parentElement.parentElement.querySelectorAll(".bigo-key").forEach(function (k) { k.classList.toggle("is-hi", k.dataset.curve === key); });
    }
    function unhighlight() {
      fig.classList.remove("has-hi");
      fig.querySelectorAll(".curve").forEach(function (c) { c.classList.remove("is-hi"); });
      fig.parentElement.parentElement.querySelectorAll(".bigo-key").forEach(function (k) { k.classList.remove("is-hi"); });
    }
    fig.querySelectorAll(".curve-hit").forEach(function (hit) {
      hit.addEventListener("mouseenter", function () { highlight(hit.dataset.curve); });
      hit.addEventListener("mouseleave", unhighlight);
      hit.addEventListener("focus", function () { highlight(hit.dataset.curve); });
      hit.addEventListener("blur", unhighlight);
    });
    document.querySelectorAll(".bigo-key").forEach(function (key) {
      key.addEventListener("mouseenter", function () { highlight(key.dataset.curve); });
      key.addEventListener("mouseleave", unhighlight);
      key.addEventListener("focus", function () { highlight(key.dataset.curve); });
      key.addEventListener("blur", unhighlight);
    });
  });

  /* ============ shared canvas helpers ============ */
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function sizeCanvas(canvas) {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var w = Math.max(1, Math.round(rect.width * dpr));
    var h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, width: rect.width, height: rect.height };
  }

  /* ============ process strip canvas ============ */
  onReady(function () {
    var canvas = document.querySelector(".proc-c");
    if (!canvas) return;
    var proc = canvas.closest(".proc");
    var vCpu = proc.querySelectorAll(".proc-v")[0];
    var vMem = proc.querySelectorAll(".proc-v")[1];
    var vDeer = proc.querySelectorAll(".proc-v")[2];

    var N = 48;
    var bufCpu = new Array(N).fill(0);
    var bufMem = new Array(N).fill(52);
    var bufDeer = new Array(N).fill(0);
    var cpu = 50, mem = 52, deer = 0, event = 0;
    var lastSample = performance.now();
    var raf = null, lastDraw = 0;

    function push(buf, v) { buf.push(v); if (buf.length > N) buf.shift(); }

    function tick() {
      cpu = clamp(cpu + rand(-8, 8) + (Math.random() < 0.06 ? 30 : 0), 3, 97);
      mem = clamp(mem + rand(-1.5, 1.5), 38, 71);
      if (event > 0) { deer = event; event *= 0.6; } else { deer = rand(1, 8); }
      if (Math.random() < 1 / 40) event = 92;
      push(bufCpu, cpu); push(bufMem, mem); push(bufDeer, deer);
      lastSample = performance.now();
      if (vCpu) vCpu.textContent = Math.round(cpu) + "%";
      if (vMem) vMem.textContent = Math.round(mem) + "%";
      if (vDeer) vDeer.textContent = Math.round(deer) + "%";
    }

    function drawRow(ctx, width, rowIndex, buf, color, scroll, step) {
      var rowTop = rowIndex * 18;
      ctx.beginPath();
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1;
      ctx.moveTo(0, rowTop + 16 + 0.5);
      ctx.lineTo(width, rowTop + 16 + 0.5);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (var i = 0; i < buf.length; i++) {
        var x = (i - (N - 1)) * step + scroll;
        var y = rowTop + 16 - (buf[i] / 100) * 14;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function drawDeerRow(ctx, width, rowIndex, buf, scroll, step) {
      var rowTop = rowIndex * 18;
      for (var i = 0; i < buf.length - 1; i++) {
        var x0 = (i - (N - 1)) * step + scroll;
        var y0 = rowTop + 16 - (buf[i] / 100) * 14;
        var x1 = (i + 1 - (N - 1)) * step + scroll;
        var y1 = rowTop + 16 - (buf[i + 1] / 100) * 14;
        ctx.beginPath();
        ctx.strokeStyle = buf[i + 1] > 40 ? colors.accent : colors.muted;
        ctx.lineWidth = 1;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    }

    function draw(t) {
      if (t - lastDraw < 33) { raf = requestAnimationFrame(draw); return; }
      lastDraw = t;
      var dims = sizeCanvas(canvas);
      var ctx = dims.ctx, width = dims.width;
      ctx.clearRect(0, 0, width, dims.height);
      var step = width / (N - 1);
      var scroll = step * ((performance.now() - lastSample) / 500);
      drawRow(ctx, width, 0, bufCpu, colors.accent, scroll, step);
      drawRow(ctx, width, 1, bufMem, colors.accent2, scroll, step);
      var rowTop = 2 * 18;
      ctx.beginPath();
      ctx.strokeStyle = colors.line;
      ctx.moveTo(0, rowTop + 16.5);
      ctx.lineTo(width, rowTop + 16.5);
      ctx.stroke();
      drawDeerRow(ctx, width, 2, bufDeer, scroll, step);
      raf = requestAnimationFrame(draw);
    }

    var sampleTimer = null;
    function start() {
      if (reduceMotion) return;
      if (!sampleTimer) sampleTimer = setInterval(tick, 500);
      if (!raf) raf = requestAnimationFrame(draw);
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    if (reduceMotion) {
      for (var i = 0; i < N; i++) {
        cpu = clamp(cpu + rand(-8, 8), 3, 97); push(bufCpu, cpu);
        mem = clamp(mem + rand(-1.5, 1.5), 38, 71); push(bufMem, mem);
        deer = rand(1, 8); push(bufDeer, deer);
      }
      var dims0 = sizeCanvas(canvas);
      var ctx0 = dims0.ctx;
      ctx0.clearRect(0, 0, dims0.width, dims0.height);
      var step0 = dims0.width / (N - 1);
      drawRow(ctx0, dims0.width, 0, bufCpu, colors.accent, 0, step0);
      drawRow(ctx0, dims0.width, 1, bufMem, colors.accent2, 0, step0);
      drawDeerRow(ctx0, dims0.width, 2, bufDeer, 0, step0);
    } else {
      start();
      window.addEventListener("resize", function () { sizeCanvas(canvas); });
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(); else start();
      });
    }
    document.addEventListener("palettechange", function (e) { colors = e.detail; });
  });

  /* ============ margin rain canvas ============ */
  onReady(function () {
    var canvas = document.querySelector(".rain");
    if (!canvas) return;
    if (canvas.clientWidth === 0) return;
    var pane = canvas.closest(".pane");
    var page = document.querySelector(".page");
    var charset = "0123456789abcdef~/$";
    var CELL = 16;
    var dim = document.body.dataset.rain === "dim";
    var mult = dim ? 0.5 : 1;
    var cols = [];
    var raf = null, lastDraw = 0;

    function computeColumns() {
      var dims = sizeCanvas(canvas);
      var width = dims.width, height = dims.height;
      var rows = Math.ceil(height / CELL);
      var pageRect = page ? page.getBoundingClientRect() : null;
      var paneRect = pane.getBoundingClientRect();
      var left = pageRect ? pageRect.left - paneRect.left : width;
      var right = pageRect ? pageRect.right - paneRect.left : 0;
      var leftMargin = left;
      var rightMargin = width - right;
      var active = [];
      if (leftMargin >= 48 || rightMargin >= 48) {
        var totalCols = Math.ceil(width / CELL);
        for (var c = 0; c < totalCols; c++) {
          var x = c * CELL;
          if (x + CELL <= left - 24 || x >= right + 24) active.push(c);
        }
      }
      while (active.length > 28) {
        active = active.filter(function (_, i) { return i % 2 === 0; });
      }
      cols = active.map(function (c) {
        return { col: c, y: rand(-20, rows), speed: rand(1.5, 4), len: Math.floor(rand(5, 10)) };
      });
      canvas._rows = rows;
      canvas._width = width;
      canvas._height = height;
    }

    function drawFrame(t, dt) {
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas._width, canvas._height);
      ctx.font = "12px 'IBM Plex Mono', monospace";
      ctx.textBaseline = "top";
      cols.forEach(function (c) {
        c.y += c.speed * dt;
        for (var k = 0; k < c.len; k++) {
          var row = Math.floor(c.y) - k;
          if (row < 0 || row > canvas._rows) continue;
          var glyph = charset[(c.col * 7 + row * 13 + Math.floor(t / 400)) % charset.length];
          var alpha = (0.16 - k * (0.14 / c.len)) * mult;
          if (alpha <= 0) continue;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = k === 0 ? colors.accent : colors.text;
          ctx.fillText(glyph, c.col * CELL, row * CELL);
        }
        if (c.y - c.len > canvas._rows) c.y = -rand(0, 20);
      });
      ctx.globalAlpha = 1;
    }

    function loop(t) {
      if (t - lastDraw < 66) { raf = requestAnimationFrame(loop); return; }
      var dt = lastDraw ? (t - lastDraw) / 1000 : 0;
      lastDraw = t;
      drawFrame(t, dt);
      raf = requestAnimationFrame(loop);
    }

    computeColumns();
    if (reduceMotion) {
      cols.forEach(function (c) { c.y = rand(0, canvas._rows); });
      drawFrame(0, 0);
    } else {
      raf = requestAnimationFrame(loop);
      window.addEventListener("resize", computeColumns);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
        else if (!raf) { lastDraw = 0; raf = requestAnimationFrame(loop); }
      });
    }
    document.addEventListener("palettechange", function (e) { colors = e.detail; });
  });
})();
