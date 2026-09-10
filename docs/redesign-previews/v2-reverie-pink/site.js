// mobile menu
const nav = document.querySelector('.nav');
const menuBtn = document.querySelector('.menu-btn');
if (menuBtn) menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});

// pause ambient drift when tab is hidden
document.addEventListener('visibilitychange', () => {
  document.documentElement.classList.toggle('is-hidden', document.hidden);
});

// articles index: filter in place from the sidebar
const list = document.getElementById('list');
if (list) {
  const links = [...document.querySelectorAll('[data-filter]')];
  const apply = (key) => {
    const link = links.find((a) => a.dataset.filter === key) || links[0];
    key = link.dataset.filter;
    links.forEach((a) => {
      a.classList.toggle('is-active', a === link);
      if (a === link) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    list.querySelectorAll('.row').forEach((r) => {
      r.hidden = key !== 'all' && r.dataset.course !== key;
    });
  };
  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    apply(a.dataset.filter);
    history.replaceState(null, '', a.dataset.filter === 'all' ? location.pathname : '#' + a.dataset.filter);
  }));
  apply(location.hash.slice(1) || 'all');
}

// copy button on code blocks
document.querySelectorAll('.code .copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(btn.parentElement.querySelector('pre').textContent);
    btn.textContent = 'Copied';
    setTimeout(() => (btn.textContent = 'Copy'), 1500);
  });
});

// Big O figure
const svg = document.getElementById('bigo');
if (svg) {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 640, H = 300, L = 40, R = 96, T = 16, B = 32;
  const fns = [
    ['O(1)', () => 1],
    ['O(log n)', (n) => Math.log2(n)],
    ['O(n)', (n) => n],
    ['O(n log n)', (n) => n * Math.log2(n)],
    ['O(n²)', (n) => n * n],
    ['O(2ⁿ)', (n) => 2 ** n],
  ];
  const slider = document.getElementById('bigo-n');
  const out = document.getElementById('bigo-out');
  const el = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  const draw = () => {
    const N = +slider.value;
    out.textContent = N;
    const yMax = N * N; // O(n²) reaches the top-right corner; 2ⁿ leaves the frame
    const x = (n) => L + ((n - 1) / (N - 1)) * (W - L - R);
    const y = (v) => T + (1 - v / yMax) * (H - T - B);
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.append(el('line', { class: 'axis', x1: L, y1: T, x2: L, y2: H - B }));
    svg.append(el('line', { class: 'axis', x1: L, y1: H - B, x2: W - R, y2: H - B }));
    const t1 = el('text', { x: L, y: H - 10 }); t1.textContent = 'n = 1';
    const t2 = el('text', { x: W - R, y: H - 10, 'text-anchor': 'end' }); t2.textContent = `n = ${N}`;
    const t3 = el('text', { x: 8, y: T + 10 }); t3.textContent = 'ops';
    svg.append(t1, t2, t3);
    const tags = [];
    fns.forEach(([name, f]) => {
      const pts = [];
      let last = null;
      for (let n = 1; n <= N + 1e-9; n += 0.25) {
        const v = f(n);
        if (v > yMax * 1.02) break;
        pts.push(`${x(n).toFixed(1)},${y(v).toFixed(1)}`);
        last = [x(n), y(v)];
      }
      const curve = el('polyline', { class: 'curve', points: pts.join(' ') });
      const hit = el('polyline', { class: 'hit', points: pts.join(' ') });
      const tag = el('text', { class: 'tag', x: last[0] + 6 });
      tag.textContent = name;
      tags.push([tag, Math.max(last[1] + 4, T + 10)]);
      const hot = (on) => { curve.classList.toggle('is-hot', on); tag.classList.toggle('is-hot', on); };
      hit.addEventListener('mouseenter', () => hot(true));
      hit.addEventListener('mouseleave', () => hot(false));
      svg.append(curve, tag, hit);
    });
    // stack labels upward so none overlap
    tags.sort((a, b) => b[1] - a[1]);
    tags.forEach(([tag, y], i) => {
      if (i && tags[i - 1][1] - y < 13) tags[i][1] = tags[i - 1][1] - 13;
      tag.setAttribute('y', tags[i][1]);
    });
  };
  slider.addEventListener('input', draw);
  draw();
}
