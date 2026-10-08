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
  var FAQ_T = { offrir: 'Avant d\'offrir', raconter: 'Raconter', livre: 'Le livre', voix: 'Les voix et les données', fetes: 'Les dates' };
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

  // ---- Panier latéral (aperçu : rien n'est vendu, le panier reste dans ce navigateur) ----
  var PRODUCTS = {
    mavie: { name: 'Mémoire · Ma vie', note: 'Une voix, 12 mois pour raconter', price: 99 },
    ancetres: { name: 'Mémoire · Mes ancêtres', note: 'Une voix, 12 mois pour raconter', price: 99 },
    tempsfort: { name: 'Mémoire · Un temps fort', note: 'Une voix, 12 mois pour raconter', price: 99 },
    lignes: { name: 'Lignes de vie', note: 'Le livre-journal à remplir à la main', price: 39 },
    copie: { name: 'Exemplaire supplémentaire', note: 'Du livre Mémoire, imprimé en même temps', price: 39 },
    copieChronique: { name: 'Exemplaire supplémentaire', note: 'De la Chronique, imprimé en même temps', price: 39 },
    copieRecit: { name: 'Exemplaire supplémentaire', note: 'Du Récit, imprimé en même temps', price: 29 },
    recit: { name: 'Récit · un moment à plusieurs voix', note: 'Jusqu\'à 10 voix, jusqu\'à 80 pages', price: 59 },
    chronique: { name: 'Chronique · une année en famille', note: 'Jusqu\'à 6 voix, jusqu\'à 100 pages', price: 149 },
    anniversaire: { name: 'Un anniversaire', note: 'Jusqu\'à 30 voix, une page par voix', price: 49 },
    voyageSolo: { name: 'Voyage solo · le carnet de bord', note: 'Jour après jour, jusqu\'à 80 pages', price: 49 },
    voix10: { name: '10 voix de plus', note: 'Pour le livre d\'anniversaire', price: 9 }
  };
  // Les histoires (produits à voix) ne s'achètent qu'une fois par panier : pas de quantité.
  // Seuls les compléments (exemplaire en plus, voix en plus, Lignes de vie) ont un compteur.
  // Les trois livres Mémoire sont trois histoires distinctes : Ma vie pour l'une, Mes ancêtres pour l'autre, c'est possible.
  var STORIES = ['mavie', 'ancetres', 'tempsfort', 'recit', 'chronique', 'anniversaire', 'voyageSolo'];
  var MEMOIRE = { 'ma-vie': 'mavie', 'ancetres': 'ancetres', 'temps-fort': 'tempsfort' };
  var hasMemoire = function () { return !!(cart.mavie || cart.ancetres || cart.tempsfort); };
  var isStory = function (k) { return STORIES.indexOf(k) >= 0; };
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem('lt-cart') || '{}') || {}; } catch (e) { cart = {}; }
  if (cart.memoire) { cart.mavie = 1; delete cart.memoire; }
  STORIES.forEach(function (k) { if (cart[k] > 1) cart[k] = 1; });
  var save = function () { try { localStorage.setItem('lt-cart', JSON.stringify(cart)); } catch (e) {} };
  var drawer = document.getElementById('cart');
  var veil = document.querySelector('.drawer-veil');
  var euro = function (n) { return (Math.round(n * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: n % 1 ? 2 : 0 }) + ' €'; };
  var count = function () { return Object.keys(cart).reduce(function (a, k) { return a + cart[k]; }, 0); };
  var lastFocus = null;

  function renderCart() {
    var body = document.getElementById('cart-body'), foot = document.getElementById('cart-foot');
    if (!body) return;
    var badge = document.querySelector('.cart-count');
    if (badge) { badge.hidden = count() === 0; badge.textContent = count(); }
    var keys = Object.keys(cart).filter(function (k) { return cart[k] > 0 && PRODUCTS[k]; });
    if (!keys.length) {
      body.innerHTML = '<p class="empty">Votre panier est vide.</p>';
      foot.innerHTML = '<a class="btn btn-ink" href="memoire.html">Commencer une histoire · 99 €</a>';
      return;
    }
    var html = '', sub = 0;
    keys.forEach(function (k) {
      var p = PRODUCTS[k]; sub += p.price * cart[k];
      html += '<div class="line"><div class="thumb"><img src="assets/favicon-192.png" alt=""></div><div><b>' + p.name + '</b><small>' + p.note + '</small>' + (isStory(k) ? '<button type="button" class="remove" data-dec="' + k + '">Retirer</button>' : '<div class="mini-qty"><button type="button" data-dec="' + k + '" aria-label="Retirer un">−</button><span>' + cart[k] + '</span><button type="button" data-inc="' + k + '" aria-label="Ajouter un">+</button></div>') + '</div><span>' + euro(p.price * cart[k]) + '</span></div>';
    });
    // -10 % dès 2 histoires, tous formats confondus (Mémoire, Récit, Chronique, Anniversaire).
    var nStories = STORIES.reduce(function (a, k) { return a + (cart[k] || 0); }, 0);
    var multi = nStories >= 2 ? Math.round(STORIES.reduce(function (a, k) { return a + PRODUCTS[k].price * (cart[k] || 0); }, 0) * 0.1 * 100) / 100 : 0;
    if (cart.anniversaire && (cart.voix10 || 0) < 3 * cart.anniversaire) html += '<div class="upsell"><span><b>10 voix de plus</b> · 9 €<br><small style="color:var(--grey)">Pour inviter jusqu\'à 40, 50 ou 60 proches</small></span><button type="button" data-inc="voix10">Ajouter</button></div>';
    if (hasMemoire() && !cart.copie) html += '<div class="upsell"><span><b>Exemplaire supplémentaire</b> · 39 €<br><small style="color:var(--grey)">Un deuxième livre, pour toute la famille</small></span><button type="button" data-inc="copie">Ajouter</button></div>';
    if (cart.chronique && !cart.copieChronique) html += '<div class="upsell"><span><b>Exemplaire supplémentaire</b> · 39 €<br><small style="color:var(--grey)">Un livre par foyer</small></span><button type="button" data-inc="copieChronique">Ajouter</button></div>';
    if (cart.recit && !cart.copieRecit) html += '<div class="upsell"><span><b>Exemplaire supplémentaire</b> · 29 €<br><small style="color:var(--grey)">Un livre pour chacun de ceux qui étaient là</small></span><button type="button" data-inc="copieRecit">Ajouter</button></div>';
    // Lignes de vie : seulement en complément discret d'un livre Mémoire.
    if (hasMemoire() && !cart.lignes) html += '<p class="addon">En plus, pour écrire à la main : <b>Lignes de vie</b>, le livre-journal · 39 € <button type="button" data-inc="lignes">Ajouter</button></p>';
    if (nStories === 1) html += '<p style="margin:0;font-size:13px;color:var(--prune)">Ajoutez une 2<sup>e</sup> histoire différente : -10 % sur les histoires.</p>';
    body.innerHTML = html;
    foot.innerHTML = '<form class="promo" onsubmit="event.preventDefault();this.querySelector(\'button\').textContent=\'Aperçu\'"><label for="promo" style="position:absolute;left:-9999px">Code promo</label><input id="promo" placeholder="Code promo" autocomplete="off"><button type="submit">Appliquer</button></form>' +
      '<div class="sum"><span>Sous-total</span><span>' + euro(sub) + '</span></div>' +
      (multi ? '<div class="sum"><span>-10 % dès 2 histoires</span><span>−' + euro(multi) + '</span></div>' : '') +
      '<div class="sum"><span>Livraison</span><span>Offerte en Europe</span></div>' +
      '<div class="sum total"><span>Total</span><span>' + euro(sub - multi) + '</span></div>' +
      '<div class="express" aria-label="Paiement express (aperçu)"><span>Apple Pay</span><span>Google Pay</span><span>Shop Pay</span></div>' +
      '<button class="btn btn-ink" type="button" onclick="this.textContent=\'Aperçu : aucune vente possible\'">Commander</button>';
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
  window.ltAddToCart = function (k, n) { cart[k] = isStory(k) ? 1 : (cart[k] || 0) + (n || 1); save(); openCart(); };
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open-cart],[data-close-cart],[data-inc],[data-dec]');
    if (!t) return;
    if (t.hasAttribute('data-open-cart')) openCart();
    else if (t.hasAttribute('data-close-cart')) closeCart();
    else if (t.dataset.inc) { cart[t.dataset.inc] = isStory(t.dataset.inc) ? 1 : (cart[t.dataset.inc] || 0) + 1; save(); renderCart(); }
    else if (t.dataset.dec) { cart[t.dataset.dec] = Math.max(0, (cart[t.dataset.dec] || 0) - 1); if (!cart[t.dataset.dec]) delete cart[t.dataset.dec]; save(); renderCart(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) closeCart(); });
  renderCart();

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
