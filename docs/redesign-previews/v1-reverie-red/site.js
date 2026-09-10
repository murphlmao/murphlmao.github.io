// mobile menu
var mb = document.querySelector('.menu-btn');
if (mb) mb.addEventListener('click', function () {
  var open = document.querySelector('.menu').classList.toggle('open');
  mb.setAttribute('aria-expanded', open);
});

// pause grain when tab hidden
document.addEventListener('visibilitychange', function () {
  document.documentElement.classList.toggle('hidden', document.hidden);
});

// copy buttons
document.querySelectorAll('.code .copy').forEach(function (b) {
  b.addEventListener('click', function () {
    navigator.clipboard.writeText(b.closest('.code').querySelector('pre').innerText).then(function () {
      b.textContent = 'Copied';
      setTimeout(function () { b.textContent = 'Copy'; }, 1200);
    });
  });
});

// Big O figure
var fig = document.getElementById('bigo');
if (fig) {
  var svg = fig.querySelector('svg'), range = fig.querySelector('input'), out = fig.querySelector('output');
  var W = 640, H = 300, L = 8, R = 72, T = 12, B = 24;
  var fns = [
    ['O(1)', function () { return 1; }],
    ['O(log n)', function (n) { return Math.log2(n); }],
    ['O(n)', function (n) { return n; }],
    ['O(n log n)', function (n) { return n * Math.log2(n); }],
    ['O(n²)', function (n) { return n * n; }],
    ['O(2ⁿ)', function (n) { return Math.pow(2, n); }]
  ];
  var ns = 'http://www.w3.org/2000/svg';
  function el(t, a) { var e = document.createElementNS(ns, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function draw() {
    var nmax = +range.value; out.textContent = nmax;
    var ymax = Math.max(8, 2 * nmax * Math.log2(nmax));
    var x = function (n) { return L + (n - 1) / (nmax - 1) * (W - L - R); };
    var y = function (v) { return T + (H - T - B) * (1 - Math.min(v, ymax) / ymax); };
    svg.innerHTML = '';
    svg.appendChild(el('line', { x1: L, y1: H - B, x2: W - R, y2: H - B, 'class': 'axis' }));
    svg.appendChild(el('line', { x1: L, y1: T, x2: L, y2: H - B, 'class': 'axis' }));
    fns.forEach(function (f, i) {
      var d = '', lastIn = null;
      for (var s = 0; s <= 80; s++) {
        var n = 1 + (nmax - 1) * s / 80, v = f[1](n);
        if (v > ymax) break;
        d += (d ? 'L' : 'M') + x(n).toFixed(1) + ' ' + y(v).toFixed(1);
        lastIn = [x(n), y(v)];
      }
      var g = el('g', { 'data-i': i });
      g.appendChild(el('path', { d: d, 'class': 'curve' }));
      g.appendChild(el('path', { d: d, 'class': 'hit' }));
      var lab = el('text', { x: lastIn[0] + 6, y: lastIn[1] + 4, 'class': 'lab' });
      lab.textContent = f[0]; g.appendChild(lab);
      g.addEventListener('mouseenter', function () { hi(i); });
      g.addEventListener('mouseleave', function () { hi(-1); });
      svg.appendChild(g);
    });
    // push overlapping labels apart, bottom-up
    var labs = [].slice.call(svg.querySelectorAll('.lab')).sort(function (a, b) { return +b.getAttribute('y') - +a.getAttribute('y'); });
    labs.reduce(function (floor, l) {
      var y = Math.min(+l.getAttribute('y'), floor); l.setAttribute('y', y); return y - 13;
    }, Infinity);
  }
  function hi(i) {
    svg.querySelectorAll('g').forEach(function (g) {
      var on = +g.dataset.i === i, off = i >= 0 && !on;
      g.querySelectorAll('.curve,.lab').forEach(function (e) { e.classList.toggle('on', on); e.classList.toggle('off', off); });
    });
  }
  range.addEventListener('input', draw);
  draw();
}
