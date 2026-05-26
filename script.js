// LOADER — corrige le bug de boucle : un seul declencheur
function hideLdr() {
  const l = document.getElementById('ldr');
  if (!l) return;
  l.style.opacity = '0';
  l.style.pointerEvents = 'none';
  setTimeout(() => { if (l.parentNode) l.parentNode.removeChild(l); }, 500);
}

// On n'utilise qu'un seul declencheur pour eviter les appels multiples
if (document.readyState === 'complete') {
  setTimeout(hideLdr, 300);
} else {
  window.addEventListener('load', () => setTimeout(hideLdr, 400));
}

// CURSOR
const cur = document.getElementById('cur'), ct = document.getElementById('curt');
let mx = 0, my = 0, tx = 0, ty = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px'; cur.style.top = my + 'px';
});
(function loop() {
  tx += (mx - tx) * .1;
  ty += (my - ty) * .1;
  ct.style.left = tx + 'px';
  ct.style.top = ty + 'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,.pjc,.skc').forEach(el => {
  el.addEventListener('mouseenter', () => { cur.style.transform = 'translate(-50%,-50%) scale(2)'; cur.style.opacity = '.55'; });
  el.addEventListener('mouseleave', () => { cur.style.transform = 'translate(-50%,-50%) scale(1)'; cur.style.opacity = '1'; });
});

// NAV
window.addEventListener('scroll', () => document.getElementById('nav').classList.toggle('s', scrollY > 50));

// MOBILE
function openMob() { document.getElementById('mob').classList.add('show'); }
function closeMob() { document.getElementById('mob').classList.remove('show'); }

// REVEAL + BARS
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('up');
      e.target.querySelectorAll('.sk-bf').forEach(f => f.style.width = f.dataset.w + '%');
    }
  });
}, { threshold: .1 });
document.querySelectorAll('.rv').forEach(el => ro.observe(el));

// FILMSTRIP
const fst = document.getElementById('fst');
const ffs = fst.querySelectorAll('.ff');
const fw = 220 + 16;
let fi = 0;
['ht', 'hb'].forEach(id => {
  const c = document.getElementById(id);
  if (!c) return;
  for (let i = 0; i < 14; i++) {
    const h = document.createElement('div');
    h.className = 'hole';
    c.appendChild(h);
  }
});
function upFilm() {
  const vis = Math.floor(fst.parentElement.offsetWidth / fw);
  const max = Math.max(0, ffs.length - vis);
  fi = Math.min(fi, max);
  fst.style.transform = `translateX(-${fi * fw}px)`;
  ffs.forEach((f, i) => f.classList.toggle('act', i === fi));
}
function fn() { fi = Math.min(fi + 1, ffs.length - 1); upFilm(); }
function fp() { fi = Math.max(fi - 1, 0); upFilm(); }
let tsx = 0;
fst.addEventListener('touchstart', e => { tsx = e.touches[0].clientX; }, { passive: true });
fst.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tsx; if (dx < -40) fn(); else if (dx > 40) fp(); });
ffs.forEach((f, i) => f.addEventListener('click', () => { fi = i; upFilm(); }));
window.addEventListener('resize', upFilm);
upFilm();

// ACCORDION
function tacc(btn) {
  const b = btn.nextElementSibling;
  const was = b.classList.contains('open');
  document.querySelectorAll('.pj-acc.open').forEach(x => x.classList.remove('open'));
  document.querySelectorAll('.pj-ab.open').forEach(x => x.classList.remove('open'));
  if (!was) {
    b.classList.add('open');
    btn.classList.add('open');
    setTimeout(() => b.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 40);
  }
}

// FILTER
document.querySelectorAll('.pfb').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pfb').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    const f = btn.dataset.f;
    document.querySelectorAll('.pjc').forEach(c => {
      const show = f === 'all' || c.dataset.cat === f;
      c.style.opacity = show ? '1' : '0';
      c.style.pointerEvents = show ? '' : 'none';
      c.style.transform = show ? '' : 'scale(.96)';
    });
  });
});

// FORM
function send(btn) {
  btn.textContent = 'Message envoye !';
  btn.style.background = 'var(--sage-deep)';
  setTimeout(() => {
    btn.textContent = 'Envoyer le message';
    btn.style.background = 'var(--ink)';
  }, 3000);
}

// PARALLAX POLAROIDS (code tronque dans l'original — reconstitue)
document.addEventListener('mousemove', e => {
  const cx = innerWidth / 2, cy = innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  const pols = document.querySelectorAll('.pol');
  pols.forEach((p, i) => {
    const factor = (i % 2 === 0 ? 8 : 12);
    p.style.transform = p.className.includes('p-main')
      ? `rotate(-2deg) translate(${dx * 6}px, ${dy * 6}px)`
      : `rotate(${i % 2 === 0 ? -9 : 7}deg) translate(${dx * factor}px, ${dy * factor}px)`;
  });
});

// ====== GALLERY CAROUSEL ======
(function() {
  const track = document.getElementById('galTrack');
  if (!track) return;
  const slides = track.querySelectorAll('.gal-slide');
  const dotsContainer = document.getElementById('galDots');
  const total = slides.length;
  let current = 0;
  let autoplayTimer = null;
  let isHovered = false;

  // Build dots
  const dots = [];
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'gal-dot' + (i === 0 ? ' on' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.addEventListener('click', () => { goTo(i); resetTimer(); });
    dotsContainer.appendChild(d);
    dots.push(d);
  });

  function goTo(idx) {
    current = (idx + total) % total;
    // CSS transition on track
    track.style.transition = 'transform 1s cubic-bezier(0.76, 0, 0.24, 1)';
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach((d, i) => d.classList.toggle('on', i === current));
  }

  function next() { goTo(current + 1); }

  function resetTimer() {
    clearInterval(autoplayTimer);
    if (!isHovered) startTimer();
  }

  function startTimer() {
    autoplayTimer = setInterval(() => { if (!isHovered) next(); }, 3500);
  }

  // Pause on hover
  const wrap = track.parentElement;
  wrap.addEventListener('mouseenter', () => { isHovered = true; clearInterval(autoplayTimer); });
  wrap.addEventListener('mouseleave', () => { isHovered = false; startTimer(); });

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); resetTimer(); }
  });

  startTimer();
})();
