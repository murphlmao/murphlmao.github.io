// murph.rip v3 — mobile menu, copy buttons, Big O figure, ambient pause

// pause the ambient patina when the tab is hidden
document.addEventListener('visibilitychange', function () {
  document.documentElement.classList.toggle('hidden', document.hidden);
});

// mobile menu
var mb = document.querySelector('.menu-btn');
if (mb) mb.addEventListener('click', function () {
  var open = document.querySelector('.nav').classList.toggle('open');
  mb.setAttribute('aria-expanded', open);
});

// copy buttons
document.querySelectorAll('.code').forEach(function (block) {
  var btn = block.querySelector('button');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var text = block.querySelector('pre').textContent;
    var done = function () {
      btn.textContent = 'Copied';
      btn.classList.add('done');
      setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1400);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
    else done();
  });
});

// Big O growth figure
document.querySelectorAll('.figure[data-bigo]').forEach(function (fig) {
  var svg = fig.querySelector('svg');
  var slider = fig.querySelector('input[type=range]');
  var out = fig.querySelector('output');
  var keys = fig.querySelectorAll('.keys button');
  var W = 600, H = 300, P = { l: 40, r: 16, t: 16, b: 30 };
  var fns = [
    function () { return 1; },
    function (n) { return Math.log2(n); },
    function (n) { return n; },
    function (n) { return n * Math.log2(n); },
    function (n) { return n * n; },
    function (n) { return Math.pow(2, n); }
  ];
  var paths = fns.map(function (_, i) {
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('class', 'ln');
    p.setAttribute('clip-path', 'url(#bigo-clip)');
    p.dataset.i = i;
    svg.appendChild(p);
    return p;
  });

  function draw() {
    var N = +slider.value;
    out.textContent = N;
    var ymax = Math.max(N * N, 4) * 1.15;
    var x = function (n) { return P.l + (n - 1) / (N - 1) * (W - P.l - P.r); };
    var y = function (v) { return H - P.b - v / ymax * (H - P.t - P.b); };
    fns.forEach(function (f, i) {
      var d = '';
      for (var n = 1; n <= N + 1e-9; n += (N - 1) / 60) {
        d += (d ? 'L' : 'M') + x(n).toFixed(1) + ',' + y(f(n)).toFixed(1);
      }
      paths[i].setAttribute('d', d);
    });
    svg.querySelector('#bigo-nmax').textContent = N;
    svg.querySelector('#bigo-ymax').textContent = Math.round(ymax);
  }

  function highlight(i) {
    paths.forEach(function (p, j) { p.classList.toggle('on', j === i); });
    keys.forEach(function (k, j) { k.classList.toggle('on', j === i); });
    svg.classList.toggle('has-on', i >= 0);
  }

  paths.forEach(function (p, i) {
    p.addEventListener('mouseenter', function () { highlight(i); });
    p.addEventListener('mouseleave', function () { highlight(-1); });
  });
  keys.forEach(function (k, i) {
    k.addEventListener('mouseenter', function () { highlight(i); });
    k.addEventListener('mouseleave', function () { highlight(-1); });
    k.addEventListener('click', function () { highlight(k.classList.contains('on') ? -1 : i); });
  });
  slider.addEventListener('input', draw);
  draw();
});
