// Memoreees — comportements du site d'aperçu : menu mobile, fil animé de l'accueil, formulaires factices, fiche produit.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var menuBtn = document.querySelector('.menu-btn');
  var mnav = document.getElementById('mnav');
  if (menuBtn && mnav) {
    menuBtn.addEventListener('click', function () {
      var open = mnav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Le fil se déroule au défilement et devient l'onde de « Comment ça marche ».
  var p = document.getElementById('tp');
  var hero = document.getElementById('hero');
  var how = document.getElementById('comment');
  var thread = document.querySelector('.thread');
  if (p && hero && how && thread) {
    var len = p.getTotalLength();
    p.style.strokeDasharray = len;
    var size = function () { thread.style.height = (how.querySelector('.onde').offsetTop + 28) / 0.95 + 'px'; };
    var update = function () {
      var r = hero.getBoundingClientRect(), vh = window.innerHeight || 800;
      var prog = reduce ? 1 : Math.min(1, Math.max(0.18, (-r.top + vh * 0.6) / (how.offsetTop + 60)));
      p.style.strokeDashoffset = len * (1 - prog);
      how.classList.toggle('on', prog >= 0.98);
    };
    size(); update();
    window.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', function () { size(); update(); });
  }

  // Formulaires d'inscription : rien n'est envoyé dans l'aperçu.
  document.querySelectorAll('form[data-preview]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = f.parentNode.querySelector('.ok');
      if (ok) ok.hidden = false;
    });
  });

  // En-tête : transparent sur la photo d'accueil, barre blanche dès qu'on fait défiler.
  var hdr = document.querySelector('header.site');
  if (hdr && document.body.classList.contains('has-hero')) {
    var onScroll = function () { hdr.classList.toggle('scrolled', window.scrollY > 30 || (mnav && mnav.classList.contains('open'))); };
    window.addEventListener('scroll', onScroll, { passive: true });
    if (menuBtn) menuBtn.addEventListener('click', onScroll);
    onScroll();
  }

  // Le logo alterne entre ses deux versions toutes les 3 secondes.
  if (!reduce) setInterval(function () { document.querySelectorAll('.brand').forEach(function (b) { b.classList.toggle('alt'); }); }, 3000);

  // « 3 étapes » : chaque panneau recule légèrement quand le suivant vient se poser dessus.
  var cards = [].slice.call(document.querySelectorAll('.stack-card'));
  if (cards.length && !reduce) {
    var stackUpdate = function () {
      cards.forEach(function (c, i) {
        var next = cards[i + 1];
        if (!next) return;
        var a = c.getBoundingClientRect(), b = next.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, 1 - (b.top - a.top) / a.height));
        c.style.transform = 'scale(' + (1 - p * 0.06) + ')';
        c.style.filter = 'brightness(' + (1 - p * 0.08) + ')';
      });
    };
    window.addEventListener('scroll', function () { requestAnimationFrame(stackUpdate); }, { passive: true });
    stackUpdate();
  }

  // Étape 2 : la démonstration se joue une fois, quand le panneau arrive à l'écran.
  var demo = document.getElementById('swipe-demo');
  if (demo) {
    // Extrait réel du chapitre test, reproduit avec l'accord de sa conteuse.
    var words = "Mon tout premier souvenir, je vais peut-être me tromper. Je me souviens des soirs qui ont précédé la naissance de Betty. On dormait toutes les nuits sur la paillote, dehors…".split(' ');
    var out = demo.querySelector('.transcript'), clock = demo.querySelector('.rec-time');
    var play = function () {
      if (reduce) { demo.className = 'swipe-demo p2 p4'; out.textContent = words.join(' '); return; }
      demo.classList.add('p1');
      setTimeout(function () { demo.classList.add('p2'); }, 1300);
      setTimeout(function () { demo.classList.add('p3'); }, 2600);
      setTimeout(function () {
        demo.classList.add('p4');
        var i = 0, sec = 12;
        var timer = setInterval(function () {
          out.textContent = words.slice(0, ++i).join(' ');
          if (i % 3 === 0) clock.textContent = "En train d'écouter · 00:" + String(++sec).padStart(2, '0');
          if (i >= words.length) clearInterval(timer);
        }, 170);
      }, 3700);
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { io.disconnect(); setTimeout(play, 400); }
      }, { threshold: 0.75 });
      io.observe(demo);
    } else play();
  }

  // Bandeau : sur mobile, un message à la fois, en fondu (pas de défilement).
  var ann = document.querySelectorAll('.annonce li');
  if (ann.length > 1) {
    var ai = 0;
    setInterval(function () { if (window.innerWidth > 1180) return; ann[ai].classList.remove('on'); ai = (ai + 1) % ann.length; ann[ai].classList.add('on'); }, 3500);
  }

  // FAQ : onglets par thème (data-t sur chaque question) et ouverture au survol sur ordinateur.
  var FAQ_T = { app: 'L\'app', offrir: 'Avant d\'offrir', raconter: 'Raconter', livre: 'Le livre', voix: 'Les voix et les données', fetes: 'Les dates' };
  document.querySelectorAll('.faq').forEach(function (faq) {
    var items = [].slice.call(faq.querySelectorAll('details'));
    var themes = [];
    items.forEach(function (d) { var t = d.dataset.t; if (t && FAQ_T[t] && themes.indexOf(t) < 0) themes.push(t); });
    if (themes.length > 1) {
      var bar = document.createElement('div'); bar.className = 'faq-tabs'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Thèmes');
      ['all'].concat(themes).forEach(function (t) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = t === 'all' ? 'Toutes' : FAQ_T[t]; b.setAttribute('aria-pressed', t === 'all');
        b.addEventListener('click', function () {
          [].forEach.call(bar.children, function (x) { x.setAttribute('aria-pressed', x === b); });
          items.forEach(function (d) { d.hidden = t !== 'all' && d.dataset.t !== t; });
        });
        bar.appendChild(b);
      });
      items[0].parentNode.insertBefore(bar, items[0]);
    }
  });
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.faq details, .faq-group details').forEach(function (d) {
      var t;
      d.addEventListener('mouseenter', function () { t = setTimeout(function () { d.open = true; }, 160); });
      d.addEventListener('mouseleave', function () { clearTimeout(t); if (!d.dataset.pinned) d.open = false; });
      d.querySelector('summary').addEventListener('click', function (e) { e.preventDefault(); d.dataset.pinned = d.dataset.pinned ? '' : '1'; d.open = !!d.dataset.pinned || !d.open; });
    });
  }

  // Tarifs sur mobile : la ligne défile, on la centre sur Mémoire au chargement.
  var tiers = document.querySelector('.tiers'), feat = tiers && tiers.querySelector('.featured');
  if (tiers && feat && tiers.scrollWidth > tiers.clientWidth) tiers.scrollLeft = feat.offsetLeft - (tiers.clientWidth - feat.offsetWidth) / 2;

  // ---- Panier latéral (aperçu : rien n'est vendu, le panier reste dans ce navigateur) ----
  // Chaque histoire (produit à voix) une seule fois ; ses compléments (exemplaires en plus, voix en plus,
  // Lignes de vie) s'affichent rattachés à elle, en plus petit. Pas de remise automatique (décision du 09/10).
  var PH = 'assets/photos/';
  var PRODUCTS = {
    mavie: { name: 'Mémoire · Ma vie', note: 'Une voix, 12 mois pour raconter', price: 99, img: 'hero-1.jpg', copy: 39 },
    ancetres: { name: 'Mémoire · Mes ancêtres', note: 'Une voix, 12 mois pour raconter', price: 99, img: 'anciennes-photos.jpg', copy: 39 },
    tempsfort: { name: 'Mémoire · Un temps fort', note: 'Une voix, 12 mois pour raconter', price: 99, img: 'commerce-ancien.jpg', copy: 39 },
    recit: { name: 'Récit', note: 'Jusqu\'à 10 voix, jusqu\'à 80 pages', price: 59, img: 'plage-feu.jpg', copy: 29 },
    chronique: { name: 'Chronique', note: 'Jusqu\'à 6 voix, jusqu\'à 100 pages', price: 149, img: 'famille-allee.jpg', copy: 39 },
    anniversaire: { name: 'Un anniversaire', note: 'Jusqu\'à 30 voix, une page par voix', price: 49, img: 'anniversaire-gateau.jpg', copy: 29 },
    voyageSolo: { name: 'Voyage solo', note: 'Le carnet de bord, jusqu\'à 80 pages', price: 49, img: 'hero-3.jpg', copy: 29 },
    voix10: { name: '10 voix de plus', note: 'Jusqu\'à 60 voix au total', price: 9, parent: 'anniversaire', max: 3 },
    lignes: { name: 'Lignes de vie', note: 'Le livre-journal à remplir à la main', price: 39 }
  };
  var STORIES = ['mavie', 'ancetres', 'tempsfort', 'recit', 'chronique', 'anniversaire', 'voyageSolo'];
  STORIES.forEach(function (k) {
    PRODUCTS['copie_' + k] = { name: 'Exemplaire en plus', note: 'Imprimé en même temps, livré ensemble', price: PRODUCTS[k].copy, parent: k };
    PRODUCTS['carte_' + k] = { name: 'La carte cadeau', note: 'À personnaliser juste après le paiement, à imprimer ou à envoyer', price: 0, parent: k, max: 1, card: true };
  });
  // Un livre mis en avant au-dessus du code : ceux qui ne sont pas déjà dans le panier, à tour de rôle.
  var PITCH = {
    mavie: 'Toute une vie racontée de sa voix.', ancetres: 'Les origines de la famille, avant qu\'elles se perdent.', tempsfort: 'Une époque vécue de l\'intérieur.',
    recit: 'Le voyage, l\'EVJF ou le mariage, raconté par tous.', chronique: 'Une année en famille, racontée par chacun.',
    anniversaire: 'Les vœux de 30 proches pour ses prochains 60 ans.', voyageSolo: 'Le carnet de bord de celui qui part seul.'
  };
  var recoTimer = null;
  var MEMOIRE = { 'ma-vie': 'mavie', 'ancetres': 'ancetres', 'temps-fort': 'tempsfort' };
  var isStory = function (k) { return STORIES.indexOf(k) >= 0; };
  var firstMemoire = function () { return ['mavie', 'ancetres', 'tempsfort'].filter(function (k) { return cart[k]; })[0]; };
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem('lt-cart') || '{}') || {}; } catch (e) { cart = {}; }
  if (cart.memoire) { cart.mavie = 1; delete cart.memoire; }
  ['copie', 'copieRecit', 'copieChronique'].forEach(function (k) { delete cart[k]; });
  Object.keys(cart).forEach(function (k) { if (!PRODUCTS[k] || !(cart[k] > 0)) delete cart[k]; else if (isStory(k)) cart[k] = 1; });
  var save = function () { try { localStorage.setItem('lt-cart', JSON.stringify(cart)); } catch (e) {} };
  var drawer = document.getElementById('cart');
  var veil = document.querySelector('.drawer-veil');
  var euro = function (n) { return (Math.round(n * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: n % 1 ? 2 : 0 }) + ' €'; };
  var count = function () { return Object.keys(cart).reduce(function (a, k) { return a + cart[k]; }, 0); };
  var lastFocus = null;
  var parentOf = function (k) { return k === 'lignes' ? firstMemoire() : PRODUCTS[k] && PRODUCTS[k].parent; };
  // Une image propre à chaque complément : la carte, le livre en deux exemplaires, la bulle « +10 », le carnet à lignes.
  var ACC = {
    card: '<svg viewBox="0 0 40 48"><rect x="6" y="4" width="28" height="40" rx="3" fill="url(#gcg)"/><defs><linearGradient id="gcg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde7f1"/><stop offset="1" stop-color="#ffe0cc"/></linearGradient></defs><g fill="#fa8216"><rect x="13" y="22" width="2.4" height="5" rx="1.2"/><rect x="16.6" y="19" width="2.4" height="11" rx="1.2"/><rect x="20.2" y="17.5" width="2.4" height="14" rx="1.2"/><rect x="23.8" y="21" width="2.4" height="7" rx="1.2"/><rect x="27.4" y="19.5" width="2.4" height="10" rx="1.2"/></g><path d="M6 36h28" stroke="#fff" stroke-dasharray="2 2"/></svg>',
    copy: '<svg viewBox="0 0 40 48"><rect x="12" y="8" width="24" height="24" rx="2" fill="#e8ddd2"/><rect x="5" y="15" width="24" height="24" rx="2" fill="#f4ede6" stroke="#d6cabe"/><rect x="5" y="15" width="3" height="24" fill="#d6cabe"/><text x="17" y="31" font-size="9" font-family="Manrope,sans-serif" font-weight="800" fill="#5a2471" text-anchor="middle">×2</text></svg>',
    voix: '<svg viewBox="0 0 40 48"><path d="M6 12h28a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H17l-7 6v-6H6a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z" fill="#fde7f1"/><text x="20" y="27" font-size="11" font-family="Manrope,sans-serif" font-weight="800" fill="#5a2471" text-anchor="middle">+10</text></svg>',
    lignes: '<svg viewBox="0 0 40 48"><rect x="8" y="5" width="26" height="38" rx="2" fill="#fff" stroke="#d6cabe"/><path d="M13 14h16M13 19h16M13 24h16M13 29h16M13 34h11" stroke="#e2d6dd" stroke-width="1.4"/><path d="M8 5v38" stroke="#ff2e7e" stroke-width="2"/></svg>'
  };
  var accKind = function (k) { return PRODUCTS[k].card ? 'card' : k.indexOf('copie_') === 0 ? 'copy' : k === 'voix10' ? 'voix' : k === 'lignes' ? 'lignes' : ''; };
  var thumb = function (k, small) {
    var kind = accKind(k);
    if (kind) return '<div class="thumb small acc-ico">' + ACC[kind] + '</div>';
    var img = PRODUCTS[k].img || (PRODUCTS[parentOf(k)] || {}).img;
    return '<div class="thumb' + (small ? ' small' : '') + '">' + (img ? '<img class="bg" src="' + PH + img + '" alt="">' : '') + '<img class="logo" src="assets/favicon-192.png" alt=""></div>';
  };
  var qty = function (k) { return '<div class="mini-qty"><button type="button" data-dec="' + k + '" aria-label="Un de moins">−</button><span>' + cart[k] + '</span><button type="button" data-inc="' + k + '" aria-label="Un de plus">+</button></div>'; };

  function renderCart() {
    var body = document.getElementById('cart-body'), foot = document.getElementById('cart-foot');
    if (!body) return;
    // Un complément sans son histoire n'a pas de sens : il part avec elle.
    Object.keys(cart).forEach(function (k) { if (!isStory(k) && !parentOf(k)) delete cart[k]; });
    var badge = document.querySelector('.cart-count');
    if (badge) { badge.hidden = count() === 0; badge.textContent = count(); }
    var stories = STORIES.filter(function (k) { return cart[k]; });
    if (!stories.length) {
      body.innerHTML = '<p class="empty">Votre panier est vide.</p>';
      foot.innerHTML = '<a class="btn btn-ink" href="index.html#prix">Choisir un livre</a>';
      return;
    }
    var html = '', sub = 0;
    stories.forEach(function (k) {
      var p = PRODUCTS[k]; sub += p.price;
      html += '<div class="group"><div class="line">' + thumb(k) + '<div><b>' + p.name + '</b><small>' + p.note + '</small><button type="button" class="remove" data-dec="' + k + '">Retirer</button></div><span class="price">' + euro(p.price) + '</span></div>';
      var kids = ['carte_' + k, 'copie_' + k].concat(k === 'anniversaire' ? ['voix10'] : []).concat(k === firstMemoire() ? ['lignes'] : []);
      kids.forEach(function (c) {
        if (!cart[c]) return;
        var q = PRODUCTS[c]; sub += q.price * cart[c];
        var ctl = q.max === 1 ? '<button type="button" class="remove" data-dec="' + c + '">Retirer</button>' : qty(c);
        html += '<div class="line sub">' + thumb(c, true) + '<div><b>' + q.name + '</b><small>' + q.note + '</small>' + ctl + '</div><span class="price' + (q.price ? '' : ' free') + '">' + (q.price ? euro(q.price * cart[c]) : 'Offerte') + '</span></div>';
      });
      // Les options pas encore choisies : une ligne claire, avec un vrai bouton « Ajouter ».
      var opt = function (c, title, sub, price) {
        return '<div class="opt">' + thumb(c, true) + '<div><b>' + title + '</b><small>' + sub + '</small></div><button type="button" class="opt-add" data-inc="' + c + '"><span>' + price + '</span>Ajouter</button></div>';
      };
      var offers = [];
      if (!cart['carte_' + k]) offers.push(opt('carte_' + k, 'La carte cadeau', 'À imprimer ou à envoyer le jour même. Ajoutez-la pour la recevoir.', 'Offerte'));
      if (!cart['copie_' + k]) offers.push(opt('copie_' + k, 'Un exemplaire en plus', 'Le même livre, pour un autre membre de la famille.', euro(p.copy)));
      if (k === 'anniversaire' && (cart.voix10 || 0) < 3) offers.push(opt('voix10', '10 voix de plus', 'Pour inviter jusqu\'à 40, 50 ou 60 proches.', '9 €'));
      if (k === firstMemoire() && !cart.lignes) offers.push(opt('lignes', 'Lignes de vie', 'Le livre-journal à remplir à la main.', '39 €'));
      if (offers.length) html += '<div class="opts"><p class="opts-k">À ajouter si vous le souhaitez</p>' + offers.join('') + '</div>';
      html += '</div>';
    });
    body.innerHTML = html;
    var reco = STORIES.filter(function (k) { return !cart[k]; });
    var recoHtml = reco.length ? '<div class="cart-reco" aria-label="À offrir aussi"><p class="reco-k">Et pour quelqu\'un d\'autre ?</p><div class="reco-track">' + reco.map(function (k, i) {
      var p = PRODUCTS[k];
      return '<div class="reco' + (i ? '' : ' on') + '"><img src="' + PH + p.img + '" alt=""><div><b>' + p.name.replace('Mémoire · ', '') + '</b><small>' + PITCH[k] + '</small></div><button type="button" data-inc="' + k + '">' + euro(p.price) + ' · Ajouter</button></div>';
    }).join('') + '</div></div>' : '';
    foot.innerHTML = recoHtml + '<details class="promo-toggle"><summary>Vous avez un code ?</summary><form class="promo" onsubmit="event.preventDefault();this.querySelector(\'button\').textContent=\'Aperçu\'"><label for="promo" style="position:absolute;left:-9999px">Code</label><input id="promo" placeholder="Votre code" autocomplete="off"><button type="submit">Appliquer</button></form></details>' +
      '<div class="sum"><span>Livraison</span><span>Offerte en Europe</span></div>' +
      '<div class="sum total"><span>Total</span><span>' + euro(sub) + '</span></div>' +
      '<button class="btn btn-ink" type="button" onclick="this.textContent=\'Aperçu : aucune vente possible\'">Finaliser la commande</button>';
    clearInterval(recoTimer);
    var slides = foot.querySelectorAll('.reco');
    if (slides.length > 1 && !reduce) {
      var ri = 0;
      recoTimer = setInterval(function () { slides[ri].classList.remove('on'); ri = (ri + 1) % slides.length; slides[ri].classList.add('on'); }, 4000);
    }
  }
  function openCart() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    renderCart(); veil.hidden = false; drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); drawer.focus();
  }
  function closeCart() {
    if (!drawer) return;
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); veil.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  var addItem = function (k, n) {
    if (!PRODUCTS[k]) return;
    var max = isStory(k) ? 1 : PRODUCTS[k].max || 99;
    cart[k] = Math.min(max, isStory(k) ? 1 : (cart[k] || 0) + (n || 1));
  };
  window.ltAddToCart = function (k, n) { addItem(k, n); save(); openCart(); };
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open-cart],[data-close-cart],[data-inc],[data-dec]');
    if (!t) return;
    if (t.hasAttribute('data-open-cart')) openCart();
    else if (t.hasAttribute('data-close-cart')) closeCart();
    else if (t.dataset.inc) { addItem(t.dataset.inc); save(); renderCart(); }
    else if (t.dataset.dec) { var k = t.dataset.dec; cart[k] = Math.max(0, (cart[k] || 0) - 1); if (!cart[k]) delete cart[k]; save(); renderCart(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) closeCart(); });
  renderCart();
  if (location.hash === '#panier') openCart();

  // Fiche produit Mémoire : une histoire par panier.
  var add = document.getElementById('add-to-cart');
  if (add) {
    var pre = new URLSearchParams(location.search).get('livre');
    var radio = pre && document.querySelector('input[name="livre"][value="' + pre + '"]');
    if (radio) radio.checked = true;
    add.addEventListener('click', function () {
      var r = document.querySelector('input[name="livre"]:checked');
      window.ltAddToCart(MEMOIRE[r ? r.value : 'ma-vie'] || 'mavie');
    });
  }

  // ---- Assistant de la page Aide (aperçu : réponses tirées de la FAQ, rien n'est envoyé) ----
  var chat = document.getElementById('assistant');
  if (chat) {
    var log = chat.querySelector('.log'), input = chat.querySelector('input');
    var faq = [].map.call(document.querySelectorAll('.faq-group details'), function (d) {
      return { q: d.querySelector('summary').textContent, a: d.querySelector('p').innerHTML };
    });
    var norm = function (t) { return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' '); };
    var STOP = 'le la les un une des de du et a au aux en est il elle je tu vous on que qui quoi pour par sur ce ces mon ma mes son sa ses pas ne se plus comment est-ce'.split(' ');
    var words = function (t) { return norm(t).split(/\s+/).filter(function (w) { return w.length > 2 && STOP.indexOf(w) < 0; }); };
    var say = function (html, who) { var m = document.createElement('div'); m.className = 'msg ' + who; m.innerHTML = html; log.appendChild(m); log.scrollTop = log.scrollHeight; };
    var ask = function (text) {
      if (!text.trim()) return;
      say(text.replace(/</g, '&lt;'), 'me');
      var w = words(text), best = null, score = 0;
      faq.forEach(function (f) {
        var fw = words(f.q + ' ' + f.a.replace(/<[^>]+>/g, ' '));
        var s = w.filter(function (x) { return fw.some(function (y) { return y.indexOf(x) === 0 || x.indexOf(y) === 0; }); }).length;
        if (s > score) { score = s; best = f; }
      });
      setTimeout(function () {
        if (best && score >= 1) say('<b>' + best.q + '</b><br>' + best.a + '<br><small style="color:var(--grey)">Cela répond-il à votre question ? Sinon, je transmets votre message à l\'équipe.</small>', 'bot');
        else say('Je n\'ai pas encore la réponse à cette question. Laissez votre email : je transmets votre message à l\'équipe, qui vous répond par email. <small style="color:var(--grey)">(Aperçu : rien n\'est envoyé.)</small>', 'bot');
      }, 350);
    };
    chat.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); input.value = ''; });
    chat.querySelectorAll('.suggest button').forEach(function (b) { b.addEventListener('click', function () { ask(b.textContent); }); });
  }
})();
