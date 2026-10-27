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

  // Hide the hero video element if no clip has been added yet so the fallback background shows.
  var video = document.querySelector('.hero-media');
  if (video) {
    var source = video.querySelector('source');
    (source || video).addEventListener('error', function () { video.style.display = 'none'; });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
