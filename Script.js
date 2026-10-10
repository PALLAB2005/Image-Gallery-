
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---------- Procedural artwork (seeded, so every load looks the same) ---------- */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function q(n) { return +n.toFixed(2); }
  function grad(id, stops) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') +
      '</linearGradient>';
  }
  function wrap(w, h, defs, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"><defs>' + defs + '</defs>' + body + '</svg>';
  }
  function sun(x, y, r, color) {
    return '<circle cx="' + q(x) + '" cy="' + q(y) + '" r="' + q(r * 2.8) + '" fill="' + color + '" opacity=".14"/>' +
      '<circle cx="' + q(x) + '" cy="' + q(y) + '" r="' + q(r * 1.7) + '" fill="' + color + '" opacity=".22"/>' +
      '<circle cx="' + q(x) + '" cy="' + q(y) + '" r="' + q(r) + '" fill="' + color + '"/>';
  }

  function mountains(w, h, seed, p) {
    var r = rng(seed);
    var defs = grad('sky', [[0, p.sky[0]], [1, p.sky[1]]]) +
      '<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.sky[1] + '" stop-opacity="0"/><stop offset="1" stop-color="' + p.sky[1] + '" stop-opacity="1"/></linearGradient>';
    var body = '<rect width="' + w + '" height="' + h + '" fill="url(#sky)"/>';
    body += sun(w * (.22 + r() * .56), h * (.26 + r() * .14), h * .09, p.sun);
    var n = p.layers.length;
    p.layers.forEach(function (c, i) {
      var base = h * (.5 + i * (.42 / n));
      var amp = h * (.34 - i * .045);
      var f1 = (2.2 + r() * 1.6) * (1 + i * .35) * Math.PI / w;
      var f2 = (5 + r() * 3) * (1 + i * .3) * Math.PI / w;
      var p1 = r() * 6.28, p2 = r() * 6.28;
      var d = 'M0 ' + h + ' ';
      for (var x = 0; x <= w + 1; x += w / 60) {
        var a = 1 - Math.abs(Math.sin(x * f1 + p1));
        var b = 1 - Math.abs(Math.sin(x * f2 + p2));
        d += 'L' + q(x) + ' ' + q(base - amp * (a * .65 + b * .35) + (r() - .5) * h * .012) + ' ';
      }
      d += 'L' + w + ' ' + h + 'Z';
      body += '<path d="' + d + '" fill="' + c + '"/>';
      if (i < n - 1) body += '<rect y="' + q(base - h * .08) + '" width="' + w + '" height="' + q(h * .4) + '" fill="url(#haze)" opacity=".32"/>';
    });
    return wrap(w, h, defs, body);
  }

  function coast(w, h, seed, p) {
    var r = rng(seed);
    var hz = h * (.52 + r() * .06);
    var defs = grad('sky', [[0, p.sky[0]], [1, p.sky[1]]]) + grad('sea', [[0, p.sea[0]], [1, p.sea[1]]]);
    var sx = w * (.3 + r() * .4), sr = h * .09, sy = hz - h * (.03 + r() * .1);
    var body = '<rect width="' + w + '" height="' + h + '" fill="url(#sky)"/>' + sun(sx, sy, sr, p.sun);
    body += '<rect y="' + q(hz) + '" width="' + w + '" height="' + q(h - hz) + '" fill="url(#sea)"/>';
    var i, y, bw;
    for (i = 0; i < 14; i++) {
      y = hz + (i + .5) * ((h - hz) * .8 / 14);
      bw = sr * 2.4 * (1 - i / 17) * (.6 + r() * .6);
      body += '<rect x="' + q(sx - bw / 2) + '" y="' + q(y) + '" width="' + q(bw) + '" height="' + q(1.5 + i * .5) + '" rx="1" fill="' + p.sun + '" opacity="' + q(.7 - i * .04) + '"/>';
    }
    for (i = 0; i < 28; i++) {
      y = hz + 6 + r() * (h - hz - 10);
      var len = 20 + r() * 70 * (.5 + (y - hz) / (h - hz));
      body += '<rect x="' + q(r() * w) + '" y="' + q(y) + '" width="' + q(len) + '" height="1.4" fill="#fff" opacity="' + q(.08 + r() * .14) + '"/>';
    }
    var nb = 1 + Math.floor(r() * 2);
    for (i = 0; i < nb; i++) {
      var bx = w * (.15 + r() * .7), by = hz + (h - hz) * (.2 + r() * .5);
      var s = h * (.04 + ((by - hz) / (h - hz)) * .07);
      body += '<path d="M' + q(bx - s * .9) + ' ' + q(by) + 'L' + q(bx + s * .9) + ' ' + q(by) + 'L' + q(bx + s * .55) + ' ' + q(by + s * .24) + 'L' + q(bx - s * .55) + ' ' + q(by + s * .24) + 'Z" fill="' + p.sea[1] + '"/>';
      body += '<path d="M' + q(bx) + ' ' + q(by - s * 1.9) + 'L' + q(bx) + ' ' + q(by - s * .15) + 'L' + q(bx + s * .8) + ' ' + q(by - s * .15) + 'Z" fill="#fff" opacity=".92"/>';
      body += '<path d="M' + q(bx - s * .12) + ' ' + q(by - s * 1.45) + 'L' + q(bx - s * .12) + ' ' + q(by - s * .15) + 'L' + q(bx - s * .75) + ' ' + q(by - s * .15) + 'Z" fill="#fff" opacity=".75"/>';
    }
    return wrap(w, h, defs, body);
  }

  function city(w, h, seed, p) {
    var r = rng(seed);
    var defs = grad('sky', [[0, p.sky[0]], [1, p.sky[1]]]);
    var body = '<rect width="' + w + '" height="' + h + '" fill="url(#sky)"/>';
    var i;
    if (p.stars) {
      for (i = 0; i < 46; i++) body += '<circle cx="' + q(r() * w) + '" cy="' + q(r() * h * .5) + '" r="' + q(.5 + r()) + '" fill="#fff" opacity="' + q(.3 + r() * .6) + '"/>';
    }
    body += sun(w * (.2 + r() * .6), h * (.17 + r() * .15), h * .05, p.moon);
    var n = p.layers.length;
    p.layers.forEach(function (c, li) {
      var near = li / (n - 1);
      var x = -8;
      while (x < w) {
        var bw = w * (.055 + r() * .075) * (1 + near * .25);
        var bh = h * (.16 + r() * .3) * (.75 + near * .45);
        var y = h - bh;
        body += '<rect x="' + q(x) + '" y="' + q(y) + '" width="' + q(bw) + '" height="' + q(bh) + '" fill="' + c + '"/>';
        if (li > 0) {
          for (var wx = x + 6; wx + 4 < x + bw - 4; wx += 9) {
            for (var wy = y + 10; wy + 6 < h - 6; wy += 14) {
              if (r() < .3) body += '<rect x="' + q(wx) + '" y="' + q(wy) + '" width="4" height="6" fill="' + p.window + '" opacity="' + q(.45 + r() * .55) + '"/>';
            }
          }
        }
        if (r() < .22) body += '<rect x="' + q(x + bw / 2 - 1) + '" y="' + q(y - h * .05) + '" width="2" height="' + q(h * .05) + '" fill="' + c + '"/>';
        x += bw + r() * 5;
      }
    });
    return wrap(w, h, defs, body);
  }

  function abstract(cols, rows, s, seed, p) {
    var w = cols * s, h = rows * s, r = rng(seed);
    var body = '<rect width="' + w + '" height="' + h + '" fill="' + p.bg + '"/>';
    function pick() { return p.colors[Math.floor(r() * p.colors.length)]; }
    for (var ry = 0; ry < rows; ry++) {
      for (var cx = 0; cx < cols; cx++) {
        var x = cx * s, y = ry * s, mx = x + s / 2, my = y + s / 2;
        var kind = Math.floor(r() * 7), col = pick(), rot = 'rotate(' + (90 * Math.floor(r() * 4)) + ' ' + mx + ' ' + my + ')';
        if (kind === 0) body += '<circle cx="' + mx + '" cy="' + my + '" r="' + q(s * .42) + '" fill="' + col + '"/>';
        else if (kind === 1) body += '<path d="M' + x + ' ' + y + 'L' + (x + s) + ' ' + y + 'A' + s + ' ' + s + ' 0 0 1 ' + x + ' ' + (y + s) + 'Z" fill="' + col + '" transform="' + rot + '"/>';
        else if (kind === 2) body += '<path d="M' + x + ' ' + (y + s) + 'A' + s / 2 + ' ' + s / 2 + ' 0 0 1 ' + (x + s) + ' ' + (y + s) + 'Z" fill="' + col + '" transform="' + rot + '"/>';
        else if (kind === 3) { for (var k = 0; k < 3; k++) body += '<rect x="' + x + '" y="' + q(y + k * s / 3 + s / 18) + '" width="' + s + '" height="' + q(s / 6) + '" fill="' + col + '" transform="' + rot + '"/>'; }
        else if (kind === 4) body += '<rect x="' + q(x + s * .2) + '" y="' + q(y + s * .2) + '" width="' + q(s * .6) + '" height="' + q(s * .6) + '" fill="' + col + '"/>';
        else if (kind === 5) body += '<circle cx="' + mx + '" cy="' + my + '" r="' + q(s * .42) + '" fill="' + col + '"/><circle cx="' + mx + '" cy="' + my + '" r="' + q(s * .2) + '" fill="' + pick() + '"/>';
      }
    }
    return wrap(w, h, '', body);
  }

  /* ---------- Palettes ---------- */
  var PAL = {
    dawn:   { sky: ['#fbe3c7', '#f1a7a0'], sun: '#fff4dc', layers: ['#d99aa8', '#b07a9c', '#7f5f8f', '#52487a', '#2f3563'] },
    blue:   { sky: ['#0f1b4d', '#6c7bd1'], sun: '#e8ecff', layers: ['#5a68b5', '#44519c', '#2f3b80', '#1f2965', '#121a47'] },
    ember:  { sky: ['#2a0f1c', '#e0623a'], sun: '#ffd08a', layers: ['#b34a3f', '#8d3a3f', '#662f3a', '#44232f', '#26161f'] },
    tide:   { sky: ['#cde9f0', '#fbe9d0'], sea: ['#9ccbd1', '#3f8c99'], sun: '#fff8e6' },
    sail:   { sky: ['#a8c8ff', '#ffe3c2'], sea: ['#4f86d6', '#1d3f8f'], sun: '#ffffff' },
    swell:  { sky: ['#2b2a5e', '#f08a6a'], sea: ['#e0795f', '#2a2551'], sun: '#ffd9a8' },
    night:  { sky: ['#070b24', '#33327a'], layers: ['#161a45', '#0f1235', '#080a22'], window: '#ffd37a', moon: '#f4f1ff', stars: true },
    six:    { sky: ['#ffcf9e', '#c9b6f2'], layers: ['#8e7fc4', '#5d5399', '#2f2a63'], window: '#fff1c9', moon: '#fffaf0', stars: false },
    harbour:{ sky: ['#04202e', '#0f6b7a'], layers: ['#0b3e50', '#082d3c', '#041b27'], window: '#9ff3e0', moon: '#e8fffb', stars: true },
    arc:    { bg: '#eaf0ff', colors: ['#2a3cff', '#ff5b3a', '#14182b', '#ffc83d'] },
    overlap:{ bg: '#14182b', colors: ['#7d8bff', '#ff7a59', '#f4f1ff', '#3fd0b0'] },
    quiet:  { bg: '#dfe7e1', colors: ['#2f5d50', '#e9b44c', '#1c2b2a', '#c8553d'] }
  };

  /* ---------- Plates ----------
     To use real photos, add  file: 'images/photo-01.jpg'  to a plate and keep w/h as its pixel size. */
  var CATS = [
    { id: 'all', label: 'All' },
    { id: 'mountains', label: 'Mountains' },
    { id: 'coast', label: 'Coast' },
    { id: 'city', label: 'City' },
    { id: 'abstract', label: 'Abstract' }
  ];
  var TONES = [
    { id: 'original', label: 'Original', css: 'none' },
    { id: 'mono', label: 'Mono', css: 'grayscale(1) contrast(1.08)' },
    { id: 'warm', label: 'Warm', css: 'sepia(.4) saturate(1.25) hue-rotate(-8deg)' },
    { id: 'cool', label: 'Cool', css: 'saturate(.95) hue-rotate(18deg) brightness(1.03)' },
    { id: 'faded', label: 'Faded', css: 'saturate(.55) contrast(.92) brightness(1.08)' }
  ];
  var PLATES = [
    { title: 'Ridge Line at Dawn', cat: 'mountains', w: 600, h: 400, alt: 'Five violet mountain ridges under a pale peach sky with a low sun', svg: function () { return mountains(600, 400, 11, PAL.dawn); } },
    { title: 'Low Tide', cat: 'coast', w: 640, h: 360, alt: 'A calm teal sea with a pale sun reflecting in bands toward the viewer', svg: function () { return coast(640, 360, 23, PAL.tide); } },
    { title: 'Night Shift', cat: 'city', w: 400, h: 600, alt: 'Dark towers with lit yellow windows against a starry indigo sky', svg: function () { return city(400, 600, 31, PAL.night); } },
    { title: 'Arc Study I', cat: 'abstract', w: 480, h: 480, alt: 'A square grid of blue, red, black and yellow circles, arcs and bars', svg: function () { return abstract(4, 4, 120, 5, PAL.arc); } },
    { title: 'Blue Hour Range', cat: 'mountains', w: 480, h: 600, alt: 'Deep blue mountain layers fading into a pale indigo sky', svg: function () { return mountains(480, 600, 47, PAL.blue); } },
    { title: 'Sailing Home', cat: 'coast', w: 600, h: 400, alt: 'White sailboats on a bright blue sea under a warm sky', svg: function () { return coast(600, 400, 59, PAL.sail); } },
    { title: 'Rooftops at Six', cat: 'city', w: 600, h: 400, alt: 'A layered purple skyline at dusk with a soft glowing sun', svg: function () { return city(600, 400, 71, PAL.six); } },
    { title: 'Overlap', cat: 'abstract', w: 720, h: 480, alt: 'A dark wide grid of lilac, coral, white and mint geometric shapes', svg: function () { return abstract(6, 4, 120, 88, PAL.overlap); } },
    { title: 'Ember Peaks', cat: 'mountains', w: 640, h: 360, alt: 'Dark red mountain ridges beneath an orange glowing sky', svg: function () { return mountains(640, 360, 97, PAL.ember); } },
    { title: 'Evening Swell', cat: 'coast', w: 480, h: 600, alt: 'A coral sea turning to deep indigo under a sunset sky', svg: function () { return coast(480, 600, 103, PAL.swell); } },
    { title: 'Harbour Lights', cat: 'city', w: 500, h: 500, alt: 'Teal harbour towers with mint windows under a starry sky', svg: function () { return city(500, 500, 113, PAL.harbour); } },
    { title: 'Quiet Grid', cat: 'abstract', w: 480, h: 720, alt: 'A tall grid in sage green, ochre, forest green and rust shapes', svg: function () { return abstract(4, 6, 120, 131, PAL.quiet); } }
  ];

  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function uri(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
  PLATES.forEach(function (p, i) {
    p.src = p.file || uri(p.svg());
    var g = gcd(p.w, p.h);
    p.ratio = (p.w / g) + ':' + (p.h / g);
    p.num = String(i + 1).padStart(2, '0');
    p.catLabel = CATS.filter(function (c) { return c.id === p.cat; })[0].label;
  });

  /* ---------- Grid ---------- */
  var grid = document.getElementById('grid');
  var statusEl = document.getElementById('status');
  grid.innerHTML = PLATES.map(function (p, i) {
    return '<li class="item" data-cat="' + p.cat + '">' +
      '<button class="plate" type="button" data-i="' + i + '" aria-label="Open plate ' + p.num + ', ' + p.title + '">' +
      '<span class="frame"><img src="' + p.src + '" alt="' + p.alt + '" width="' + p.w + '" height="' + p.h + '" decoding="async"><span class="open-pill" aria-hidden="true">Open</span></span>' +
      '<span class="cap"><span class="num">' + p.num + '</span><span class="ttl">' + p.title + '</span><span class="ratio">' + p.ratio + '</span></span>' +
      '</button></li>';
  }).join('');
  var items = Array.prototype.slice.call(grid.children);

  /* ---------- Filters ---------- */
  function chip(cls, id, label, extra) {
    return '<button type="button" class="chip ' + cls + '" data-id="' + id + '" aria-pressed="false">' + label + (extra || '') + '</button>';
  }
  var catsEl = document.getElementById('cats');
  catsEl.innerHTML = CATS.map(function (c) {
    var n = c.id === 'all' ? PLATES.length : PLATES.filter(function (p) { return p.cat === c.id; }).length;
    return chip('cat-btn', c.id, c.label, '<span class="count">' + n + '</span>');
  }).join('');
  var tonesEl = document.getElementById('tones');
  var lbTonesEl = document.getElementById('lbTones');
  [tonesEl, lbTonesEl].forEach(function (el) {
    el.innerHTML = TONES.map(function (t) { return chip('tone-btn', t.id, t.label); }).join('');
    el.addEventListener('click', function (e) {
      var b = e.target.closest('.tone-btn');
      if (b) setTone(b.dataset.id);
    });
  });

  var state = { cat: 'all', tone: 'original' };

  function setTone(id) {
    var t = TONES.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    state.tone = id;
    root.style.setProperty('--tone', t.css);
    Array.prototype.forEach.call(document.querySelectorAll('.tone-btn'), function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.id === id));
    });
  }

  function visibleCount() { return items.filter(function (li) { return !li.hidden; }).length; }
  function updateStatus() {
    var c = CATS.filter(function (x) { return x.id === state.cat; })[0];
    statusEl.textContent = 'Showing ' + visibleCount() + ' of ' + PLATES.length + ' plates' + (state.cat === 'all' ? '' : ' / ' + c.label);
  }
  function applyCat() {
    items.forEach(function (li, k) { li.hidden = !(state.cat === 'all' || PLATES[k].cat === state.cat); });
    updateStatus();
  }
  function markCat() {
    Array.prototype.forEach.call(catsEl.querySelectorAll('.cat-btn'), function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.id === state.cat));
    });
  }

  var swapTimer;
  function setCat(id) {
    if (id === state.cat) return;
    state.cat = id;
    markCat();
    clearTimeout(swapTimer);
    function run() {
      applyCat();
      items.forEach(function (li) { li.classList.remove('rise'); });
      void grid.offsetWidth;
      var d = 0;
      items.forEach(function (li) {
        if (!li.hidden) { li.style.setProperty('--d', (d * 45) + 'ms'); li.classList.add('rise'); d++; }
      });
      grid.classList.remove('swap');
    }
    if (reduced) { run(); return; }
    grid.classList.add('swap');
    swapTimer = setTimeout(run, 190);
  }
  catsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.cat-btn');
    if (b) setCat(b.dataset.id);
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbStage = document.getElementById('lbStage');
  var lbCount = document.getElementById('lbCount');
  var lbTitle = document.getElementById('lbTitle');
  var lbSub = document.getElementById('lbSub');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbClose = document.getElementById('lbClose');
  var view = [], pos = 0, lastFocus = null, closeTimer, token = 0;

  function paint() {
    var p = PLATES[view[pos]];
    lbImg.src = p.src;
    lbImg.alt = p.alt;
    lbImg.style.setProperty('--ar', String(p.w / p.h));
    lbTitle.textContent = p.title;
    lbSub.textContent = p.catLabel + '  /  ' + p.ratio + '  /  ' + p.w + ' x ' + p.h;
    lbCount.textContent = 'Plate ' + p.num + '  /  ' + (pos + 1) + ' of ' + view.length;
  }

  function open(index, trigger) {
    lastFocus = trigger || null;
    view = PLATES.map(function (p, k) { return k; }).filter(function (k) { return !items[k].hidden; });
    pos = Math.max(0, view.indexOf(index));
    lbPrev.hidden = lbNext.hidden = view.length < 2;
    paint();
    clearTimeout(closeTimer);
    lb.hidden = false;
    root.style.overflow = 'hidden';
    void lb.offsetWidth;
    lb.classList.add('open');
    lbClose.focus();
  }

  function close() {
    lb.classList.remove('open');
    root.style.overflow = '';
    closeTimer = setTimeout(function () { lb.hidden = true; }, reduced ? 0 : 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function go(step) {
    if (view.length < 2) return;
    pos = (pos + step + view.length) % view.length;
    if (reduced || !lbImg.animate) { paint(); return; }
    var tk = ++token;
    var out = lbImg.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-step * 28) + 'px)' }],
      { duration: 140, easing: 'ease-in', fill: 'forwards' }
    );
    out.finished.then(function () {
      out.cancel();
      if (tk !== token) return;
      paint();
      lbImg.animate(
        [{ opacity: 0, transform: 'translateX(' + (step * 28) + 'px)' }, { opacity: 1, transform: 'none' }],
        { duration: 240, easing: 'ease-out' }
      );
    }).catch(function () {});
  }

  grid.addEventListener('click', function (e) {
    var b = e.target.closest('.plate');
    if (b) open(+b.dataset.i, b);
  });
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', function () { go(-1); });
  lbNext.addEventListener('click', function () { go(1); });
  lbStage.addEventListener('click', function (e) { if (e.target === lbStage) close(); });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'Tab') {
      var f = Array.prototype.filter.call(lb.querySelectorAll('button'), function (b) { return !b.hidden; });
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  var startX = null;
  lbStage.addEventListener('pointerdown', function (e) { startX = e.clientX; });
  lbStage.addEventListener('pointerup', function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  });
  lbStage.addEventListener('pointercancel', function () { startX = null; });

  /* ---------- Start ---------- */
  markCat();
  setTone('original');
  applyCat();
})();
