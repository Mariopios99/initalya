// ?goto=<id> salta a una sezione al caricamento (utile per test/anteprime)
const gotoId = new URLSearchParams(location.search).get('goto');
if (gotoId) {
  const i = document.getElementById('intro');
  if (i) { i.remove(); document.documentElement.classList.remove('intro-hold'); }
  window.addEventListener('load', () => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    document.getElementById(gotoId)?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
}

// Intro: sipario che si apre dopo l'animazione del logo (una volta per sessione)
const intro = document.getElementById('intro');
if (intro) {
  setTimeout(() => {
    intro.classList.add('intro-out');
    document.documentElement.classList.remove('intro-hold');
    try { sessionStorage.setItem('initalya_intro', '1'); } catch (e) {}
    setTimeout(() => intro.remove(), 900);
  }, 1750);
}

// Header: sfondo al scroll + auto-nascondi scendendo, riappari salendo
const header = document.getElementById('header');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastY = window.scrollY;
const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);
  if (y > 320 && y > lastY + 4) header.classList.add('hidden');
  else if (y < lastY - 4 || y <= 320) header.classList.remove('hidden');
  lastY = y;
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Parallasse leggera su telefono e copy dell'hero (solo desktop)
const heroPhone = document.querySelector('.hero-phone');
const heroCopy = document.querySelector('.hero-copy');
if (heroPhone) {
  heroPhone.addEventListener('animationend', () => {
    heroPhone.style.animation = 'none';
    heroPhone.style.opacity = 1;
  });
}
if (!reducedMotion && heroPhone) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking || !window.matchMedia('(min-width: 981px)').matches) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroPhone.style.transform = 'translateY(' + y * 0.14 + 'px)';
        heroCopy.style.transform = 'translateY(' + y * 0.06 + 'px)';
        heroCopy.style.opacity = Math.max(0, 1 - y / 620);
      }
      ticking = false;
    });
  }, { passive: true });
}

// Menu mobile
const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');
toggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  toggle.classList.toggle('open');
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.classList.remove('open');
}));

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Canale social: il telefono passa dal profilo al player del video completo
const playBtn = document.getElementById('playSocial');
const socialProfile = document.getElementById('socialProfile');
const socialPlayer = document.getElementById('socialPlayer');
if (playBtn && socialProfile && socialPlayer) {
  const fullVideo = socialPlayer.querySelector('video');
  playBtn.addEventListener('click', () => {
    socialProfile.hidden = true;
    socialPlayer.hidden = false;
    socialPlayer.closest('.phone-social').scrollIntoView({ behavior: 'smooth', block: 'center' });
    fullVideo.play().catch(() => {});
  });
  document.getElementById('socialBack').addEventListener('click', () => {
    fullVideo.pause();
    socialPlayer.hidden = true;
    socialProfile.hidden = false;
  });
}

// Reel del profilo: partono solo quando visibili
const reels = document.querySelectorAll('.reel video');
if (reels.length) {
  const rio = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting && !reducedMotion) e.target.play().catch(() => {});
    else e.target.pause();
  }), { threshold: 0.25 });
  reels.forEach(v => rio.observe(v));
}

// Manifesto: le parole si accendono con lo scroll
const mani = document.getElementById('maniText');
if (mani) {
  const wrapWords = node => {
    [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else {
            const sp = document.createElement('span');
            sp.className = 'w';
            sp.textContent = part;
            frag.appendChild(sp);
          }
        });
        node.replaceChild(frag, ch);
      } else if (ch.nodeType === 1) wrapWords(ch);
    });
  };
  wrapWords(mani);
  const words = [...mani.querySelectorAll('.w')];
  if (reducedMotion) {
    words.forEach(w => w.classList.add('on'));
  } else {
    let maniTick = false;
    const updMani = () => {
      if (maniTick) return;
      maniTick = true;
      requestAnimationFrame(() => {
        const r = mani.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
        const n = Math.round(p * words.length);
        words.forEach((w, i) => w.classList.toggle('on', i < n));
        maniTick = false;
      });
    };
    updMani();
    window.addEventListener('scroll', updMani, { passive: true });
  }
}

// Drag-to-scroll orizzontale (galleria schermate + carosello passi)
function makeDraggable(el) {
  let down = false, moved = false, startX = 0, startScroll = 0;
  el.addEventListener('pointerdown', e => {
    down = true; moved = false;
    startX = e.clientX;
    startScroll = el.scrollLeft;
  });
  window.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4 && !moved) { moved = true; el.classList.add('dragging'); }
    if (moved) el.scrollLeft = startScroll - dx;
  });
  window.addEventListener('pointerup', () => {
    down = false;
    el.classList.remove('dragging');
  });
}
const gallery = document.getElementById('gallery');
if (gallery) makeDraggable(gallery);

// Progress bar della galleria
const galleryBar = document.getElementById('galleryBar');
if (gallery && galleryBar) {
  const updBar = () => {
    const max = gallery.scrollWidth - gallery.clientWidth;
    galleryBar.style.width = (max > 0 ? 16 + (gallery.scrollLeft / max) * 84 : 100) + '%';
  };
  updBar();
  gallery.addEventListener('scroll', updBar, { passive: true });
  window.addEventListener('resize', updBar, { passive: true });
}

// Chat demo dell'assistente: conversazione che si scrive da sola, in loop
const chatBody = document.getElementById('chatBody');
if (chatBody) {
  const inputTxt = document.getElementById('chatInputText');
  const PLACEHOLDER = 'Scrivi qui…';
  const USER_TEXT = 'Un weekend in coppia, senza fretta. Budget 450 €.';
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const add = (cls, html) => {
    const d = document.createElement('div');
    d.className = cls;
    d.innerHTML = html;
    chatBody.appendChild(d);
    setTimeout(() => d.classList.add('in'), 30);
    return d;
  };
  const aiMsg = txt => add('msg msg-ai', '<small>Initalya</small>' + txt);
  const chipsHtml = '<span>Esperienze autentiche</span><span>Sapori locali</span><span>Natura</span><span>Arte e storia</span>';
  const cardHtml =
    '<div class="mc-head"><strong>Città Sant’Angelo autentica</strong><span>2 giorni · 2 persone</span></div>' +
    '<div class="mc-stats"><span><strong>18 km</strong>percorso</span><i></i><span><strong>€ 268</strong>totale</span><i></i><span><strong>6</strong>esperienze</span></div>' +
    '<div class="mc-btn">Apri l’itinerario →</div>';

  if (reducedMotion) {
    aiMsg('Ciao! Cosa vuoi vivere a Città Sant’Angelo? Scrivimi nella tua lingua.');
    add('msg msg-user', '<small>Tu</small>' + USER_TEXT);
    aiMsg('Ho creato una proposta tra esperienze autentiche, gusto e paesaggi. Possiamo modificarla insieme.');
    add('msg-card', cardHtml);
    chatBody.querySelectorAll('.msg, .msg-card').forEach(m => m.classList.add('in'));
  } else {
    let visible = false;
    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; }), { threshold: 0.2 })
      .observe(chatBody);
    const waitVisible = async () => { while (!visible) await sleep(400); };

    (async () => {
      for (;;) {
        await waitVisible();
        chatBody.innerHTML = '';
        await sleep(700);
        aiMsg('Ciao! Cosa vuoi vivere a Città Sant’Angelo? Scrivimi nella tua lingua.');
        await sleep(1300);
        add('msg-chips', chipsHtml);
        await sleep(1400);
        await waitVisible();
        inputTxt.classList.add('typing-caret');
        inputTxt.textContent = '';
        for (const ch of USER_TEXT) {
          inputTxt.textContent += ch;
          await sleep(32);
        }
        await sleep(500);
        inputTxt.classList.remove('typing-caret');
        inputTxt.textContent = PLACEHOLDER;
        add('msg msg-user', '<small>Tu</small>' + USER_TEXT);
        await sleep(1000);
        const dots = add('msg msg-ai typing-msg', '<span class="dot"></span><span class="dot"></span><span class="dot"></span>');
        await sleep(1700);
        dots.remove();
        aiMsg('Ho creato una proposta tra esperienze autentiche, gusto e paesaggi. Possiamo modificarla insieme.');
        await sleep(1400);
        add('msg-card', cardHtml);
        await sleep(4800);
        [...chatBody.children].forEach(c => c.classList.add('out'));
        await sleep(550);
      }
    })();
  }
}

// FAQ: una sola aperta alla volta
document.querySelectorAll('.faq').forEach(d => {
  d.addEventListener('toggle', () => {
    if (d.open) document.querySelectorAll('.faq[open]').forEach(o => { if (o !== d) o.open = false; });
  });
});

// Contatori animati
const stats = document.getElementById('stats');
if (stats) {
  const fmt = n => n.toLocaleString('it-IT');
  const animateCount = el => {
    const target = +el.dataset.count;
    if (reducedMotion) { el.textContent = fmt(target); return; }
    const dur = 1500;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const so = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        stats.querySelectorAll('[data-count]').forEach(animateCount);
        so.disconnect();
      }
    });
  }, { threshold: 0.35 });
  so.observe(stats);
}

// Carosello "Quattro passi": dots, frecce, snap
const scroller = document.getElementById('passiScroller');
if (scroller) {
  makeDraggable(scroller);
  const cards = [...scroller.querySelectorAll('.passo')];
  const dotsBox = document.getElementById('passiDots');

  cards.forEach((card, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Vai al passo ' + (i + 1));
    dot.addEventListener('click', () => {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
    dotsBox.appendChild(dot);
  });
  const dots = [...dotsBox.children];

  const current = () => {
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0, bestDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  };
  const updateDots = () => {
    const i = current();
    dots.forEach((d, j) => d.classList.toggle('active', j === i));
  };
  updateDots();
  scroller.addEventListener('scroll', updateDots, { passive: true });

  const go = dir => {
    const i = Math.min(cards.length - 1, Math.max(0, current() + dir));
    cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };
  document.getElementById('passiPrev').addEventListener('click', () => go(-1));
  document.getElementById('passiNext').addEventListener('click', () => go(1));
}
