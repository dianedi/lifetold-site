// LifeTold — comportements du site d'aperçu : menu mobile, fil animé de l'accueil, formulaires factices, fiche produit.
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

  // Fiche produit : quantité et remise dès 2 histoires.
  var qty = document.getElementById('qty');
  if (qty) {
    var n = 1;
    var total = document.getElementById('total');
    var hint = document.getElementById('multi-hint');
    var render = function () {
      qty.value = n;
      var price = n * 99 * (n >= 2 ? 0.9 : 1);
      total.textContent = (Math.round(price * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: price % 1 ? 2 : 0 }) + ' €';
      hint.textContent = n >= 2 ? '-10 % appliqués : une histoire par conteur.' : 'Dès 2 histoires : -10 % sur le tout.';
    };
    document.getElementById('minus').addEventListener('click', function () { n = Math.max(1, n - 1); render(); });
    document.getElementById('plus').addEventListener('click', function () { n = Math.min(10, n + 1); render(); });
    render();
  }
})();
