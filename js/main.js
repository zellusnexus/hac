(function () {
  var header = document.querySelector('.site-header');
  var announce = document.querySelector('.announce');
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  // Header sits transparently over the hero. As soon as the page scrolls it turns solid,
  // and it pins to the top the moment it reaches the top of the viewport (after the announcement bar).
  function onScroll() {
    var y = window.scrollY;
    var pinAt = announce ? announce.offsetHeight : 0;
    header.classList.toggle('is-stuck', y > 0);
    header.classList.toggle('is-pinned', y >= pinAt);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    if (open) mobileNav.querySelectorAll('.m-group.open .m-sub').forEach(function (sub) {
      sub.style.maxHeight = sub.scrollHeight + 'px';
    });
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  // Expand/collapse a burger-menu section to its exact height so the motion is smooth
  function setGroup(g, open) {
    var sub = g.querySelector('.m-sub');
    g.classList.toggle('open', open);
    g.querySelector('.m-toggle').setAttribute('aria-expanded', String(open));
    sub.style.maxHeight = open ? sub.scrollHeight + 'px' : '0px';
  }
  mobileNav.querySelectorAll('.m-group.open .m-sub').forEach(function (sub) {
    sub.style.maxHeight = sub.scrollHeight + 'px';
  });
  mobileNav.addEventListener('click', function (e) {
    var t = e.target.closest('.m-toggle');
    if (t) {
      var group = t.closest('.m-group');
      var open = !group.classList.contains('open');
      // Only one section open at a time: close the others first
      mobileNav.querySelectorAll('.m-group.open').forEach(function (g) {
        if (g !== group) setGroup(g, false);
      });
      setGroup(group, open);
      return;
    }
    if (e.target.closest('a')) setMenu(false);
  });

  // Desktop dropdowns open on hover, or on keyboard focus (CSS :focus-visible).
  // Each top-level label is also a link to that section's main page.
  // Hovering another top-level item or leaving a menu drops any lingering focus
  // so a menu never stays stuck open.
  function closeMenu(o) {
    o.classList.remove('open');
    if (o.contains(document.activeElement)) document.activeElement.blur();
  }
  document.querySelectorAll('.main-nav > ul > li').forEach(function (li) {
    li.addEventListener('mouseenter', function () {
      document.querySelectorAll('.has-menu').forEach(function (o) {
        if (o !== li && (o.classList.contains('open') || o.contains(document.activeElement))) closeMenu(o);
      });
    });
  });
  document.querySelectorAll('.has-menu').forEach(function (li) {
    li.addEventListener('mouseleave', function () { closeMenu(li); });
  });

  // Gallery rooms show a preview; "Show all" reveals the rest. A link to #room expands that room.
  function setFold(room, open) {
    var btn = room.querySelector('.fold-toggle');
    room.classList.toggle('expanded', open);
    if (btn) { btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? btn.dataset.less : btn.dataset.more; }
  }
  document.querySelectorAll('.fold-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var room = btn.closest('.gallery-fold'), open = !room.classList.contains('expanded');
      setFold(room, open);
      if (!open) room.scrollIntoView({ block: 'start' });
    });
  });
  function openFold() {
    var id = decodeURIComponent(location.hash.slice(1));
    var el = id && document.getElementById(id);
    if (el && el.classList.contains('gallery-fold')) setFold(el, true);
  }
  // Only offer "Show all" when the preview is actually hiding photos at this screen size
  function syncFoldButtons() {
    document.querySelectorAll('.gallery-fold').forEach(function (room) {
      var btn = room.querySelector('.fold-toggle');
      if (!btn || room.classList.contains('expanded')) return;
      btn.hidden = !Array.prototype.some.call(room.querySelectorAll('.photo'), function (a) { return a.offsetParent === null; });
    });
  }
  if (document.querySelector('.gallery-fold')) {
    syncFoldButtons();
    window.addEventListener('resize', syncFoldButtons);
    openFold();
    window.addEventListener('hashchange', openFold);
  }

  // Portfolio lightbox: click a photo to view it full size, arrows/swipe browse that room's photos.
  var photos = Array.prototype.slice.call(document.querySelectorAll('.photo'));
  if (photos.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML = '<img alt=""><button class="lb-close" aria-label="Close">&times;</button>' +
      '<button class="lb-prev" aria-label="Previous photo">&lsaquo;</button>' +
      '<button class="lb-next" aria-label="Next photo">&rsaquo;</button><p class="lb-count"></p>';
    document.body.appendChild(box);
    var img = box.querySelector('img');
    var count = box.querySelector('.lb-count');
    var current = 0, opener = null, set = photos;

    function show(i) {
      current = (i + set.length) % set.length;
      var a = set[current];
      img.src = a.href;
      img.alt = a.querySelector('img').alt;
      count.textContent = (current + 1) + ' / ' + set.length;
    }
    function close() {
      box.classList.remove('open');
      document.body.style.overflow = '';
      img.removeAttribute('src');
      if (opener) opener.focus();
    }
    photos.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        opener = a;
        var room = a.closest('.gallery-group');
        set = room ? Array.prototype.slice.call(room.querySelectorAll('.photo')) : photos;
        show(set.indexOf(a));
        box.classList.add('open');
        document.body.style.overflow = 'hidden';
        box.querySelector('.lb-close').focus();
      });
    });
    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'Tab') {
        var btns = box.querySelectorAll('button');
        var first = btns[0], last = btns[btns.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var startX = null;
    box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  // Reveal marked groups (e.g. Featured Projects) as they scroll into view.
  var revealEls = document.querySelectorAll('[data-reveal]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (revealEls.length && 'IntersectionObserver' in window && !reduce) {
    document.documentElement.classList.add('reveal-on');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.2 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // Our Process: steps float at slightly different speeds with the scroll, eased each frame
  // so the motion stays smooth. Scroll-driven only (nothing reacts to hover).
  var driftList = document.querySelector('[data-drift]');
  if (driftList && !reduce) {
    var driftItems = Array.prototype.slice.call(driftList.children);
    var RANGE = 26;   // px each step moves at most, scaled up per step
    var driftCur = driftItems.map(function () { return 0; });
    var driftTarget = function (i) {
      var vh = window.innerHeight, r = driftList.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));  // 0 entering, 1 leaving
      return (0.5 - p) * 2 * RANGE * (0.4 + i * 0.4);
    };
    var driftRunning = false;
    var driftStep = function () {
      var moving = false;
      driftItems.forEach(function (li, i) {
        var t = driftTarget(i), d = t - driftCur[i];
        if (Math.abs(d) > 0.05) { driftCur[i] += d * 0.06; moving = true; } else { driftCur[i] = t; }
        li.style.setProperty('--drift', driftCur[i].toFixed(2) + 'px');
      });
      if (moving) requestAnimationFrame(driftStep); else driftRunning = false;
    };
    var driftKick = function () { if (!driftRunning) { driftRunning = true; requestAnimationFrame(driftStep); } };
    driftItems.forEach(function (li, i) { driftCur[i] = driftTarget(i); li.style.setProperty('--drift', driftCur[i].toFixed(2) + 'px'); });
    window.addEventListener('scroll', driftKick, { passive: true });
    window.addEventListener('resize', driftKick);
  }

  // Pan photos marked data-pan as their section scrolls through the viewport.
  // The photo glides toward its scroll-based target a little each frame (smooth, lagging
  // follow) instead of jumping with every scroll tick.
  var panEls = Array.prototype.slice.call(document.querySelectorAll('[data-pan]'));
  if (panEls.length && !reduce) {
    var EASE = 0.035; // share of the remaining distance covered per frame: lower = slower, smoother
    var targetOf = function (el) {
      var vh = window.innerHeight, r = el.getBoundingClientRect();
      return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    };
    var state = panEls.map(function (el) { var t = targetOf(el); el.style.setProperty('--pan', t.toFixed(4)); return { el: el, cur: t }; });
    var running = false;
    var step = function () {
      var moving = false;
      state.forEach(function (s) {
        var t = targetOf(s.el), d = t - s.cur;
        if (Math.abs(d) > 0.0005) { s.cur += d * EASE; moving = true; } else { s.cur = t; }
        s.el.style.setProperty('--pan', s.cur.toFixed(4));
      });
      if (moving) requestAnimationFrame(step); else running = false;
    };
    var kick = function () { if (!running) { running = true; requestAnimationFrame(step); } };
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
