/* r4 · pages.js — articles view switcher (by date / by class), FLIP transition, hash + localStorage.
   articles.html only. No libraries. */
(function () {
  'use strict';

  function initArticles() {
    var root = document.querySelector('.articles');
    if (!root) return;

    var flat = document.getElementById('flat');
    var groups = document.getElementById('groups');
    var btns = Array.prototype.slice.call(root.querySelectorAll('.view__btn'));
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function key(row) {
      return row.querySelector('time').getAttribute('datetime');
    }

    function setView(view, animate) {
      var rows = Array.prototype.slice.call(root.querySelectorAll('.post-row'));
      var first = null;
      if (animate) {
        first = new Map(rows.map(function (r) { return [r, r.getBoundingClientRect()]; }));
      }

      if (view === 'class') {
        Array.prototype.slice.call(groups.querySelectorAll('ol[data-course]')).forEach(function (ol) {
          var course = ol.dataset.course;
          ol.append.apply(ol, rows.filter(function (r) { return r.dataset.course === course; }));
        });
        flat.hidden = true;
        groups.hidden = false;
      } else {
        rows.sort(function (a, b) { return key(b).localeCompare(key(a)); });
        flat.append.apply(flat, rows);
        groups.hidden = true;
        flat.hidden = false;
      }

      btns.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.view === view));
      });

      if (!animate || reduce) return;

      rows.forEach(function (row) {
        var last = row.getBoundingClientRect();
        var f = first.get(row);
        var dx = f.left - last.left;
        var dy = f.top - last.top;
        if (Math.abs(dx) + Math.abs(dy) >= 0.5) {
          row.animate(
            [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }],
            { duration: 220, easing: 'ease-out' }
          );
        }
      });

      if (view === 'class') {
        Array.prototype.slice.call(groups.querySelectorAll('.group-head, .course-head, .empty')).forEach(function (el) {
          el.animate(
            [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
            { duration: 220, easing: 'ease-out' }
          );
        });
      }
    }

    var saved;
    try { saved = localStorage.getItem('articlesView'); } catch (e) { saved = null; }
    var hash = location.hash.slice(1);
    var jump = /^(umich|off-syllabus|eecs\d{3})$/.test(hash);
    // ?view=class|date query override, for previewing a view without a hash jump or localStorage write.
    var queryView = new URLSearchParams(location.search).get('view');
    var boot = jump ? 'class' : (queryView === 'class' || queryView === 'date' ? queryView : (saved === 'class' ? 'class' : 'date'));

    setView(boot, false);
    if (jump) {
      var target = document.getElementById(hash);
      if (target) target.scrollIntoView();
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var v = btn.dataset.view;
        if (btn.getAttribute('aria-pressed') === 'true') return;
        setView(v, true);
        try { localStorage.setItem('articlesView', v); } catch (e) {}
      });
    });
  }

  initArticles();
})();
