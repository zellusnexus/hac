(function () {
  var header = document.querySelector('.site-header');
  var announce = document.querySelector('.announce');
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  // Header sits transparently over the hero, then sticks with a solid navy background on scroll.
  function onScroll() {
    var threshold = (announce ? announce.offsetHeight : 0) + 80;
    header.classList.toggle('is-stuck', window.scrollY > threshold);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  mobileNav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });

  // Desktop dropdowns: click/keyboard support in addition to hover.
  document.querySelectorAll('.has-menu > button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var li = btn.parentElement;
      var open = !li.classList.contains('open');
      document.querySelectorAll('.has-menu.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('button').setAttribute('aria-expanded', 'false');
      });
      li.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-menu')) {
      document.querySelectorAll('.has-menu.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('button').setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Portfolio lightbox: click a photo to view it full size, arrows/swipe to browse.
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
    var current = 0, opener = null;

    function show(i) {
      current = (i + photos.length) % photos.length;
      var a = photos[current];
      img.src = a.href;
      img.alt = a.querySelector('img').alt;
      count.textContent = (current + 1) + ' / ' + photos.length;
    }
    function close() {
      box.classList.remove('open');
      document.body.style.overflow = '';
      img.removeAttribute('src');
      if (opener) opener.focus();
    }
    photos.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        opener = a;
        show(i);
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

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
