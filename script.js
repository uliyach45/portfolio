/* ═══════════════════════════════════════════════════════════════════
   Uliya Fatima — cybersecurity portfolio
   script.js

   Load order
     1. GSAP + ScrollTrigger + Lenis arrive from the CDN (see index.html)
     2. boot() runs on window load
     3. If either library is missing, boot() adds .no-anim to <html> and the
        stylesheet shows everything in its final state — the page still works.

   Nothing here touches layout values. Positions, colours and sizes all live
   in styles.css; this file only adds classes, scrubs timelines and measures.
   ═══════════════════════════════════════════════════════════════════ */

function boot() {

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    document.documentElement.classList.add('no-anim');
    initDrift();
    initSignature();
    initCredentialRows();
    alignCascade();
    initCursor();
    initNav();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.1,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -70, duration: 1.2 });
      });
    });
  }

  initDrift();

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('.hero__eyebrow', { opacity: 1, duration: .9, delay: .2 })
    .to('.cascade b', { y: 0, duration: 1.25, stagger: .13, ease: 'power4.out' }, '-=.55')
    .to('.hero__tail', { opacity: 1, duration: .9 }, '-=.6')
    .to('.ledger-strip', { opacity: 1, duration: .8 }, '-=.45')
    .to('.rail', { opacity: 1, duration: .8 }, '-=.5')
    .from('.nav', { y: -18, opacity: 0, duration: .7 }, '-=.9');

  const clock = document.getElementById('clock');
  const tick = () => {
    const t = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Karachi'
    }).format(new Date());
    clock.textContent = t + ' in Islamabad';
  };
  tick(); setInterval(tick, 20000);

  gsap.utils.toArray('.rv').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      onComplete: () => ScrollTrigger.refresh(),
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  gsap.utils.toArray('.plate, .wcase__plate').forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.25,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
  });

  const spineList = document.querySelector('.spine--work .spine__list');
  if (spineList) {
    gsap.to('#spineFill', {
      scaleY: 1, ease: 'none',
      scrollTrigger: {
        trigger: spineList,
        start: 'top 62%',
        end: 'bottom 72%',
        scrub: .6,
        invalidateOnRefresh: true
      }
    });

    gsap.utils.toArray('.spine--work .spine__row').forEach(row => {
      ScrollTrigger.create({
        trigger: row,
        start: 'top 62%',
        end: 'bottom 40%',
        onToggle: self => row.classList.toggle('is-live', self.isActive)
      });
    });
  }

  initCursor();
  initNav();
  initSignature();
  initCredentialRows();
  alignCascade();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

function initDrift() {
  const drift = document.getElementById('drift');
  if (!drift || drift.children.length) return;

  // six offence (forest) · six defence (brass)
  const MARKS = [
    { t:'Nm', s:30, o:0.22, cls:'' },
    { t:'Bp', s:22, o:0.19, cls:'' },
    { t:'Ws', s:26, o:0.22, cls:'' },
    { t:'Ms', s:20, o:0.17, cls:'' },
    { t:'Hc', s:23, o:0.19, cls:'' },
    { t:'Gh', s:19, o:0.17, cls:'' },
    { t:'Sp', s:24, o:0.33, cls:'def' },
    { t:'Sn', s:19, o:0.27, cls:'def' },
    { t:'Sc', s:22, o:0.29, cls:'def' },
    { t:'Ov', s:18, o:0.26, cls:'def' },
    { t:'Bh', s:25, o:0.32, cls:'def' },
    { t:'Vl', s:20, o:0.27, cls:'def' }
  ];

  // mixed headings: some run across, some down, some diagonally
  const PATHS = ['across','down','across','diag','down','diag',
                 'across','diag','down','across','diag','down'];

  const cols = 4, rows = 3, cells = [];
  const PAD = 4, SPAN = 100 - PAD * 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cw = SPAN / cols, ch = SPAN / rows;
      cells.push({ x: PAD + c * cw + Math.random() * cw * .9,
                   y: PAD + r * ch + Math.random() * ch * .9 });
    }
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const rand = (a, b) => a + Math.random() * (b - a);

  MARKS.forEach((m, i) => {
    const el = document.createElement('span');
    el.textContent = m.t;
    if (m.cls) el.className = m.cls;

    const cell = cells[i];
    const kind = PATHS[i];

    // direction is free — magnitude is clamped to whatever room that mark has
    const roomR = 96 - cell.x, roomL = cell.x - 2;
    const roomD = 94 - cell.y, roomU = cell.y - 2;
    const sx = Math.random() < .5 ? 1 : -1;
    const sy = Math.random() < .5 ? 1 : -1;
    const capX = sx > 0 ? roomR : roomL;
    const capY = sy > 0 ? roomD : roomU;

    let dx, dy;
    if (kind === 'across')    { dx = rand(20, 34); dy = rand(4, 10); }
    else if (kind === 'down') { dx = rand(4, 10);  dy = rand(18, 30); }
    else                      { dx = rand(14, 24); dy = rand(12, 22); }

    dx = Math.min(dx, Math.max(capX, 6));
    dy = Math.min(dy, Math.max(capY, 6));

    const dur = rand(30, 54);

    el.style.cssText =
      `left:${cell.x}vw;top:${cell.y}vh;font-size:${m.s}px;--o:${m.o};` +
      `--dx:${sx * dx}vw;--dy:${sy * dy}vh;--rot:${rand(-5, 5).toFixed(1)}deg;` +
      `animation:wander ${dur}s ease-in-out infinite;animation-delay:${-Math.random() * dur}s`;

    drift.appendChild(el);
    setTimeout(() => el.classList.add('ready'), 200 + i * 80);
  });
}

function alignCascade() {
  const lines = document.querySelectorAll('.cascade span');
  if (lines.length < 2) return;
  const w1 = lines[0].querySelector('b');
  const w2 = lines[1].querySelector('b');
  if (!w1 || !w2) return;

  const run = () => {
    if (innerWidth < 760) { lines[1].style.paddingLeft = ''; return; }
    lines[1].style.paddingLeft = '0px';
    const size = parseFloat(getComputedStyle(w2).fontSize) || 100;
    const shift = w1.getBoundingClientRect().width - w2.getBoundingClientRect().width - size * 0.09;
    lines[1].style.paddingLeft = Math.max(0, shift) + 'px';
  };

  run();
  addEventListener('resize', run);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
}

function initCredentialRows() {
  document.querySelectorAll('.crow').forEach(row => {
    const link = row.querySelector('.cmeta a');
    if (!link) return;
    row.classList.add('crow--link');
    row.addEventListener('click', e => {
      if (e.target.closest('a')) return;      // let the real link handle itself
      if (getSelection().toString()) return;  // don't hijack text selection
      window.open(link.href, '_blank', 'noopener');
    });
  });
}

function initSignature() {
  const sigfoot = document.getElementById('sigfoot');
  if (!sigfoot) return;

  let done = false;
  const scribe = () => {
    if (done) return;
    done = true;
    sigfoot.classList.add('scribed');
    removeEventListener('scroll', atBottom);
  };

  // fires once the signature is a third of the way into view
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { scribe(); io.disconnect(); }
    }, { threshold: 0.34 });
    io.observe(sigfoot);
  }

  // belt and braces: if the page is scrolled to its end, draw regardless
  function atBottom() {
    const doc = document.documentElement;
    if (scrollY + innerHeight >= doc.scrollHeight - 80) scribe();
  }
  addEventListener('scroll', atBottom, { passive: true });
  atBottom();

  // and if neither path is available, show it rather than hide it
  if (!('IntersectionObserver' in window)) scribe();
}

function initCursor() {
  const fine = matchMedia('(pointer: fine)').matches;
  if (fine) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    document.body.classList.add('has-cursor');

    const m = { x: innerWidth / 2, y: innerHeight / 2 };
    const r = { x: m.x, y: m.y };
    let shown = false;

    addEventListener('mousemove', e => {
      m.x = e.clientX; m.y = e.clientY;
      if (!shown) { shown = true; dot.style.opacity = ring.style.opacity = 1; }
    }, { passive: true });

    (function loop() {
      r.x += (m.x - r.x) * 0.16;
      r.y += (m.y - r.y) * 0.16;
      dot.style.transform = `translate(${m.x}px, ${m.y}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${r.x}px, ${r.y}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();

    const on = () => { dot.classList.add('is-on'); ring.classList.add('is-on'); };
    const off = () => { dot.classList.remove('is-on'); ring.classList.remove('is-on'); };
    document.querySelectorAll('a, button, .crow, .mrow:not(.mrow--head), .index__row').forEach(el => {
      el.addEventListener('mouseenter', on);
      el.addEventListener('mouseleave', off);
    });

    addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = 0; shown = false; });
  }
}

function initNav() {

  document.querySelectorAll('.ch__copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try { await navigator.clipboard.writeText(text); }
      catch {
        const t = document.createElement('textarea');
        t.value = text; document.body.appendChild(t); t.select();
        document.execCommand('copy'); t.remove();
      }
      btn.setAttribute('data-done', ''); btn.textContent = 'Copied';
      setTimeout(() => { btn.removeAttribute('data-done'); btn.textContent = 'Copy'; }, 2000);
    });
  });

  const hours = document.getElementById('hours');
  const readHours = () => {
    if (!hours) return;
    const parts = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false,
      weekday: 'short', timeZone: 'Asia/Karachi'
    }).formatToParts(new Date());
    const get = t => parts.find(p => p.type === t).value;
    const hh = +get('hour'), day = get('weekday');
    const clock = get('hour') + ':' + get('minute');
    const weekend = day === 'Sat' || day === 'Sun';
    const working = !weekend && hh >= 9 && hh < 18;
    hours.classList.toggle('is-late', !working);
    hours.lastElementChild.innerHTML = working
      ? 'It is <b>' + clock + '</b> in Islamabad — the phone is the fastest route right now.'
      : 'It is <b>' + clock + '</b> in Islamabad — email will reach me sooner than the phone.';
  };
  readHours(); setInterval(readHours, 30000);

  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nav__link, .rail__item');
  const sections = [...document.querySelectorAll('main section[id]')];

  const syncActive = () => {
    const line = innerHeight * 0.42;
    let current = null;
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= line) current = sec;
    }
    const id = current ? '#' + current.id : null;
    links.forEach(l => l.toggleAttribute('data-active', l.getAttribute('href') === id));
  };

  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', scrollY > 60);
    syncActive();
  };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', syncActive);
  onScroll();
}

if (document.readyState === 'complete') boot();
else addEventListener('load', boot);
