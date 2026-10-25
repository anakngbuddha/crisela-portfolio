/* Crisela M. Valerio - Portfolio (v2)
   main.js: theme, navigation, scroll animations, hero effects, badge, accordion, skills, contact.
   features.js (loaded after this file) adds the quick menu, planner, typing challenge and easter eggs. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  /* Shared helpers other files can use */
  var CV = window.CV = { reduce: reduce, fine: fine, $: $, $$: $$, roles: [] };

  /* ------------------------------------------------------------
     Theme (light / dark)
  ------------------------------------------------------------ */
  var themeBtn = $('#theme-toggle');
  function currentTheme() {
    return root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function applyTheme(t, save) {
    root.setAttribute('data-theme', t);
    if (save) store('cv-theme', t);
    themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#151214' : '#F4F2EF');
  }
  CV.toggleTheme = function () { applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true); };
  applyTheme(currentTheme(), false);
  themeBtn.addEventListener('click', CV.toggleTheme);

  /* ------------------------------------------------------------
     Toast
  ------------------------------------------------------------ */
  var toastEl = $('#toast'), toastTimer;
  CV.toast = function (msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3400);
  };

  /* ------------------------------------------------------------
     Confetti (paper pieces and paperclips)
  ------------------------------------------------------------ */
  var canvas = $('#confetti'), ctx = canvas.getContext('2d');
  var parts = [], raf = null, W = 0, H = 0;
  var colors = ['#7A1F2B', '#C8962E', '#EBD3D1', '#1B1A1C', '#F5EDEA', '#E27D8B'];

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function tick() {
    ctx.clearRect(0, 0, W, H);
    parts = parts.filter(function (p) { return p.life < p.max && p.y < H + 40; });
    parts.forEach(function (p) {
      p.life++; p.vy += 0.32; p.vx *= 0.992; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, (p.max - p.life) / 30);
      if (p.clip) {
        ctx.strokeStyle = p.color; ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-3, -8, 6, 16, 3); else ctx.rect(-3, -8, 6, 16);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    });
    if (parts.length) raf = requestAnimationFrame(tick);
    else { raf = null; ctx.clearRect(0, 0, W, H); }
  }
  CV.confetti = function (x, y) {
    if (reduce) return;
    sizeCanvas();
    var ox = x == null ? W / 2 : x, oy = y == null ? H * 0.62 : y;
    for (var i = 0; i < 150; i++) {
      var a = Math.random() * Math.PI * 2, s = 5 + Math.random() * 11;
      parts.push({
        x: ox, y: oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 7,
        w: 6 + Math.random() * 8, h: 4 + Math.random() * 6,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35,
        color: colors[(Math.random() * colors.length) | 0],
        clip: Math.random() < 0.2, life: 0, max: 130 + Math.random() * 90
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  };
  window.addEventListener('resize', function () { if (parts.length) sizeCanvas(); });

  /* ------------------------------------------------------------
     Clipboard
  ------------------------------------------------------------ */
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject();
      } catch (e) { reject(e); }
    });
  }
  CV.copy = function (text) {
    var p = (navigator.clipboard && navigator.clipboard.writeText)
      ? navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); })
      : legacyCopy(text);
    return p;
  };
  var emailLink = $('#contact-email');
  CV.copyEmail = function () {
    var email = emailLink ? emailLink.textContent.trim() : '';
    CV.copy(email).then(function () { CV.toast('Email address copied.'); })
      .catch(function () { CV.toast('Could not copy. Please select the email and copy it.'); });
  };
  var copyBtn = $('#copy-email');
  if (copyBtn) copyBtn.addEventListener('click', CV.copyEmail);

  /* ------------------------------------------------------------
     Photo fallback (placeholder until profile.jpg exists)
  ------------------------------------------------------------ */
  $$('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () {
      if (img.dataset.failed) return;
      img.dataset.failed = '1';
      img.src = img.dataset.fallback;
    });
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
  });

  /* ------------------------------------------------------------
     Hero name: split into letters so they can drop in
  ------------------------------------------------------------ */
  var letterIndex = 0;
  $$('[data-split]').forEach(function (el) {
    var text = el.textContent, html = '';
    text.split(' ').forEach(function (word, wi) {
      if (wi > 0) html += '<span class="sp"></span>';
      html += '<span class="w">';
      word.split('').forEach(function (ch) {
        html += '<span class="ch" style="--i:' + (letterIndex++) + '">' + ch + '</span>';
      });
      html += '</span>';
    });
    el.innerHTML = html;
  });

  /* ------------------------------------------------------------
     Typewriter role line
  ------------------------------------------------------------ */
  var roleEl = $('#role');
  CV.roles = [
    'an Office Administration student',
    'an accounting-minded organizer',
    'a clear communicator',
    'a dependable team player',
    'ready for my first OJT'
  ];
  if (roleEl && !reduce) {
    var ri = 0, ci = CV.roles[0].length, deleting = false;
    var startDelay = 3200;
    (function type() {
      var full = CV.roles[ri % CV.roles.length];
      roleEl.textContent = full.slice(0, ci);
      var wait = deleting ? 38 : 70;
      if (!deleting && ci === full.length) { deleting = true; wait = 1900; }
      else if (deleting && ci === 0) { deleting = false; ri++; wait = 350; }
      else { ci += deleting ? -1 : 1; }
      setTimeout(type, startDelay ? startDelay : wait);
      startDelay = 0;
    })();
  }

  /* ------------------------------------------------------------
     Scroll: progress bar, hidden nav, back-to-top ring
  ------------------------------------------------------------ */
  var bar = $('#progress-bar');
  var navWrap = $('.nav-wrap');
  var toTop = $('#to-top'), ring = $('#to-top-ring');
  var lastY = 0, ticking = false;
  var navLinksEl = $('#nav-links'), navToggle = $('#nav-toggle');

  function setMenu(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navLinksEl.classList.toggle('is-open', open);
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(y / max, 1) : 0;
    bar.style.transform = 'scaleX(' + p + ')';
    if (ring) ring.style.strokeDashoffset = String(138.2 * (1 - p));
    toTop.classList.toggle('is-on', y > 700);

    var menuOpen = navToggle.getAttribute('aria-expanded') === 'true';
    if (y > lastY + 6 && y > 240 && !menuOpen) navWrap.classList.add('is-hidden');
    else if (y < lastY - 6 || y < 240) navWrap.classList.remove('is-hidden');
    lastY = y;

    var tl = $('#timeline');
    if (tl) {
      var r = tl.getBoundingClientRect();
      var prog = (window.innerHeight * 0.7 - r.top) / r.height;
      tl.style.setProperty('--p', String(Math.max(0, Math.min(1, prog))));
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ------------------------------------------------------------
     Mobile menu
  ------------------------------------------------------------ */
  navToggle.addEventListener('click', function () {
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  navLinksEl.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ------------------------------------------------------------
     Nav: sliding indicator + active section
  ------------------------------------------------------------ */
  var links = $$('a', navLinksEl);
  var ind = $('#nav-ind');
  var activeLink = null;

  function moveInd(a) {
    if (!a || window.innerWidth <= 860) { ind.style.opacity = '0'; return; }
    ind.style.left = a.offsetLeft + 'px';
    ind.style.top = a.offsetTop + 'px';
    ind.style.width = a.offsetWidth + 'px';
    ind.style.height = a.offsetHeight + 'px';
    ind.style.opacity = '1';
  }
  function setActive(id) {
    activeLink = null;
    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) activeLink = a;
    });
    moveInd(activeLink);
  }
  links.forEach(function (a) {
    a.addEventListener('mouseenter', function () { moveInd(a); });
    a.addEventListener('focus', function () { moveInd(a); });
  });
  navLinksEl.addEventListener('mouseleave', function () { moveInd(activeLink); });
  window.addEventListener('resize', function () { moveInd(activeLink); });

  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'education', 'skills', 'desk', 'contact'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) secObs.observe(el);
    });
    var heroObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) setActive('');
    }, { threshold: 0.6 });
    heroObs.observe($('#hero'));
  }

  /* ------------------------------------------------------------
     Reveal on scroll
  ------------------------------------------------------------ */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { revObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ------------------------------------------------------------
     Pointer effects: cursor ring, hero spotlight, tile spotlight, magnetic buttons
  ------------------------------------------------------------ */
  if (fine && !reduce) {
    var cursor = $('#cursor');
    var cx = 0, cy = 0, tx = 0, ty = 0, cursorOn = false;
    root.classList.add('has-cursor');
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!cursorOn) { cx = tx; cy = ty; cursorOn = true; }
    }, { passive: true });
    (function follow() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(follow);
    })();
    document.addEventListener('mouseover', function (e) {
      cursor.classList.toggle('is-hover', !!e.target.closest('a, button, input, textarea, label, .sticky'));
    });

    var hero = $('#hero');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });

    $$('[data-spot]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--sx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--sy', (e.clientY - r.top) + 'px');
      });
    });

    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * 0.22) + 'px');
        el.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * 0.32) + 'px');
      });
      el.addEventListener('mouseleave', function () {
        el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px');
      });
    });
  }

  /* ------------------------------------------------------------
     ID badge: 3D tilt and flip
  ------------------------------------------------------------ */
  var badge = $('#badge'), stage = $('#badge-stage');
  CV.flipBadge = function () {
    var flipped = badge.classList.toggle('is-flipped');
    badge.setAttribute('aria-pressed', String(flipped));
  };
  badge.addEventListener('click', CV.flipBadge);

  if (fine && !reduce) {
    stage.addEventListener('mousemove', function (e) {
      var r = badge.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      dx = Math.max(-1.4, Math.min(1.4, dx)); dy = Math.max(-1.4, Math.min(1.4, dy));
      badge.style.setProperty('--ry', (dx * 14) + 'deg');
      badge.style.setProperty('--rx', (-dy * 12) + 'deg');
    });
    stage.addEventListener('mouseleave', function () {
      badge.style.setProperty('--ry', '0deg'); badge.style.setProperty('--rx', '0deg');
    });
  }

  /* ------------------------------------------------------------
     Education accordion
  ------------------------------------------------------------ */
  $$('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc-item');
      var willOpen = !item.classList.contains('is-open');
      $$('.acc-item').forEach(function (it) {
        it.classList.remove('is-open');
        $('.acc-btn', it).setAttribute('aria-expanded', 'false');
      });
      if (willOpen) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ------------------------------------------------------------
     Skills: animated rings + filter
  ------------------------------------------------------------ */
  var CIRC = 213.6;
  var cards = $$('.skill-card');

  function countTo(el, target) {
    if (reduce) { el.textContent = target; return; }
    var start = null, dur = 1300;
    el.textContent = '0';
    requestAnimationFrame(function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    });
  }
  function playCard(card, delay) {
    var level = parseInt(card.dataset.level, 10);
    var fg = $('.ring-fg', card), num = $('.ring-num', card);
    fg.style.transition = 'none';
    fg.style.strokeDashoffset = String(CIRC);
    void fg.getBoundingClientRect();
    setTimeout(function () {
      fg.style.transition = '';
      fg.style.strokeDashoffset = String(CIRC * (1 - level / 100));
      countTo(num, level);
    }, reduce ? 0 : delay);
  }
  function playVisible() {
    var i = 0;
    cards.forEach(function (c) { if (!c.hidden) playCard(c, 120 + (i++) * 90); });
  }

  var grid = $('#skill-grid');
  if (grid && 'IntersectionObserver' in window) {
    var gridObs = new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) { playVisible(); obs.disconnect(); }
    }, { threshold: 0.15 });
    gridObs.observe(grid);
  } else { playVisible(); }

  var filterBtns = $$('.filter');
  var filtering = false;
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (filtering || btn.classList.contains('is-active')) return;
      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      var cat = btn.dataset.filter;
      filtering = true;
      cards.forEach(function (c) { c.classList.add('is-out'); });
      setTimeout(function () {
        cards.forEach(function (c) { c.hidden = !(cat === 'all' || c.dataset.cat === cat); });
        void grid.offsetHeight;
        cards.forEach(function (c) { c.classList.remove('is-out'); });
        playVisible();
        filtering = false;
      }, reduce ? 0 : 260);
    });
  });

  /* ------------------------------------------------------------
     Contact form: opens the visitor's email app
  ------------------------------------------------------------ */
  var form = $('#contact-form'), statusEl = $('#form-status');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var valid = true;
      ['name', 'email', 'message'].forEach(function (key) {
        var f = form.elements[key], v = f.value.trim();
        var ok = v !== '' && (key !== 'email' || /^\S+@\S+\.\S+$/.test(v));
        f.closest('.field').classList.toggle('has-error', !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        statusEl.textContent = 'Please fill in your name, a valid email, and a message.';
        statusEl.classList.add('is-error');
        return;
      }
      var to = emailLink ? emailLink.getAttribute('href').replace('mailto:', '') : '';
      var subject = encodeURIComponent('Message from ' + name + ' (portfolio)');
      var body = encodeURIComponent(message + '\n\nFrom: ' + name + ' <' + email + '>');
      statusEl.classList.remove('is-error');
      statusEl.textContent = 'Opening your email app to send the message.';
      CV.confetti();
      window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
    });
  }

  /* ------------------------------------------------------------
     Little extras
  ------------------------------------------------------------ */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var originalTitle = document.title;
  document.addEventListener('visibilitychange', function () {
    document.title = document.hidden ? 'Come back! I saved your seat.' : originalTitle;
  });

  if (window.console && console.log) {
    console.log('%cHello, fellow detail-spotter!', 'font:700 16px sans-serif;color:#7A1F2B');
    console.log('Try the Konami code. Attention to detail is a skill here.');
  }
})();
