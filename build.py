"""Assemble le site d'aperçu Memoreees : chaque page de src/ reçoit l'en-tête, le pied de page et les métadonnées communs.

Une page de src/ commence par un commentaire de métadonnées :
<!-- title: Titre de la page | description: Phrase pour Google | nav: comment -->
puis le contenu de <main>. Le résultat est écrit à la racine du dossier site/ (servi tel quel par GitHub Pages).

Usage : python3 site/build.py
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
BRAND = "Memoreees"

# Logo : deux versions qui alternent toutes les 3 secondes (le mot seul, puis le mot avec l'onde).
LOGO = ('<span class="brand" role="img" aria-label="Memoreees">'
        '<img class="va dark" src="assets/logo-a.png" alt="" width="929" height="105"><img class="vb dark" src="assets/logo-b.png" alt="" width="1269" height="250">'
        '<img class="va light" src="assets/logo-a-white.png" alt="" width="929" height="105"><img class="vb light" src="assets/logo-b-white.png" alt="" width="1269" height="250"></span>')
ONDE = '<span class="onde" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>'

NAV = [
    ("comment", "comment-ca-marche.html", "Comment ça marche"),
    ("app", "application.html", "L'app"),
    ("livres", "index.html#livres", "Les livres"),
    ("offrir", "carte-cadeau.html", "Offrir"),
]

# Messages du bandeau défilant (validés le 08/10). Alma : à installer sur la boutique avant la mise en ligne.
BANNER = [
    "<b>Black Friday</b> · Lignes de vie offert pour l'achat d'un livre Mémoire",
    "Livraison offerte en Europe",
    "Satisfait ou remboursé",
    "Paiement en 3x avec Alma",
]

# Pages existantes : les liens du pied de page vers une page pas encore écrite restent du texte simple.
FOOTER = [
    ("Les livres", [("Ma vie", "ma-vie.html"), ("Mes ancêtres", "mes-ancetres.html"), ("Un temps fort", "un-temps-fort.html"),
                    ("Lignes de vie", "lignes-de-vie.html"), ("Un anniversaire : jusqu'à 30 voix", "anniversaire.html"),
                    ("Récit : voyage, EVJF, mariage", "recit.html"),
                    ("Chronique : une année en famille", "chronique.html")]),
    ("Offrir", [("La carte cadeau", "carte-cadeau.html"), ("Pour Noël", None), ("Fête des grands-mères", None),
                ("Fête des mères", None), ("Fête des pères", None), ("Un anniversaire", None)]),
    (BRAND, [("L'app", "application.html"), ("Comment ça marche", "comment-ca-marche.html"), ("Tarifs", "index.html#prix"),
             ("Aide et questions", "aide.html"), ("Mon compte", "compte.html"), ("Télécharger l'app", "app.html"),
             ("Notre histoire", None), ("Devenir ambassadeur", None)]),
]

LEGAL = [("Vos données, protégées", "donnees.html"), ("Mentions légales", "mentions-legales.html"), ("CGV", None),
         ("Confidentialité", "confidentialite.html"), ("Cookies", None), ("Supprimer mes données", "donnees.html#supprimer")]

LAUREL = '<svg class="laurel" viewBox="0 0 24 48" aria-hidden="true"><path d="M20 46C8 40 4 28 6 4"/><path d="M6 12c-3-1-4-4-3-6 3 0 4 3 3 6zM5.5 20c-3-.5-4.5-3.5-4-6 3 .5 4.5 3.5 4 6zM6.5 28c-3 0-5-2.5-5-5 3 0 5 2.5 5 5zM9 35.5c-3 .5-5.5-1.5-6-4 3-.5 5.5 1.5 6 4zM13 41.5c-2.5 1-5.5-.5-6.5-3 2.5-1 5.5.5 6.5 3z"/></svg>'

# Réassurance discrète, en bas de page. La note Trustpilot et la presse sont des emplacements : rien n'est affiché en ligne tant qu'ils ne sont pas réels.
REASSURE = f"""<div class="trust">
      <ul class="trust-list">
        <li>Satisfait ou remboursé 30 jours</li>
        <li>Livraison offerte en Europe</li>
        <li>Leur voix, pour toujours</li>
      </ul>
      <div class="trust-proof">
        <div class="award">{LAUREL}<div><span class="stars" aria-hidden="true">★★★★★</span><small>Trustpilot <span class="todo">[note réelle à venir]</span></small></div>{LAUREL.replace('class="laurel"', 'class="laurel r"')}</div>
        <div class="award">{LAUREL}<div><b class="press">LE FIGARO</b><small>Vu dans la presse <span class="todo">[exemple, en attente d'un vrai article]</span></small></div>{LAUREL.replace('class="laurel"', 'class="laurel r"')}</div>
      </div>
    </div>"""

ICON_HELP = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7"/><path d="M12 17.2h.01"/></svg>'
ICON_USER = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/></svg>'
ICON_BAG = '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.4 11H6.4z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>'


def banner() -> str:
    items = "".join(f"<span>{m}</span><i aria-hidden=\"true\">·</i>" for m in BANNER)
    return f"""<div class="annonce" role="region" aria-label="Offres en cours"><div class="marquee"><div class="track">{items}</div><div class="track" aria-hidden="true">{items}</div></div></div>"""


def lang_switch(cls: str = "") -> str:
    return f'<div class="lang {cls}" aria-label="Langue"><a href="index.html" aria-current="true" lang="fr">FR</a><a href="es/index.html" lang="es" hreflang="es">ES</a></div>'


def header(active: str) -> str:
    current = ' aria-current="page"'
    links = "".join(f'<li><a href="{href}"{current if key == active else ""}>{label}</a></li>' for key, href, label in NAV)
    mobile = "".join(f'<a href="{href}">{label}</a>' for _, href, label in NAV)
    return f"""<div class="preview"><div class="wrap"><span><b>Aperçu du site {BRAND}</b> · version de travail, non officielle</span><span>Textes, visuels et prix à valider · aucune vente possible</span></div></div>
{banner()}
<header class="site">
  <div class="bar">
    <a class="logo" href="index.html" aria-label="{BRAND}, accueil">{LOGO}</a>
    <nav class="main" aria-label="Navigation principale"><ul>{links}</ul></nav>
    <div class="hdr-right">
      <a class="icon-btn hide-sm" href="aide.html" aria-label="Aide et questions"{current if active == "aide" else ""}>{ICON_HELP}</a>
      <a class="icon-btn hide-sm" href="compte.html" aria-label="Mon compte">{ICON_USER}</a>
      <button class="icon-btn cart-btn" type="button" aria-label="Ouvrir le panier" data-open-cart>{ICON_BAG}<span class="cart-count" hidden>0</span></button>
      <a class="btn btn-cta hdr-cta" href="memoire.html">Commencer une histoire</a>
      <button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Menu"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
  <div class="mnav-wrap"><nav class="mobile-nav" id="mnav" aria-label="Navigation mobile">{mobile}<a href="aide.html">Aide et questions</a><a href="compte.html">Mon compte</a><a href="memoire.html">Commencer une histoire</a></nav></div>
</header>
<div class="drawer-veil" data-close-cart hidden></div>
<aside class="drawer" id="cart" aria-label="Panier" aria-hidden="true" tabindex="-1">
  <div class="drawer-head"><h2>Votre panier</h2><button class="icon-btn" type="button" data-close-cart aria-label="Fermer le panier"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
  <div class="drawer-body" id="cart-body"></div>
  <div class="drawer-foot" id="cart-foot"></div>
</aside>"""


def footer() -> str:
    cols = []
    for title, items in FOOTER:
        lis = []
        for item in items:
            label, href = item[0], item[1]
            tag = f' <span class="tag">{item[2]}</span>' if len(item) > 2 else ""
            lis.append(f'<li><a href="{href}">{label}</a>{tag}</li>' if href else f'<li style="color:var(--grey)">{label}{tag}</li>')
        cols.append(f'<div><h4>{title}</h4><ul>{"".join(lis)}</ul></div>')
    legal = "".join(f'<a href="{h}">{l}</a>' if h else f'<span>{l}</span>' for l, h in LEGAL)
    return f"""<footer class="site">
  <div class="wrap">
    <div class="fcols">
      <div>
        <a class="logo" href="index.html" aria-label="{BRAND}, accueil">{LOGO}</a>
        <p class="story">Vos histoires, de vive voix.</p>
        <div class="social" aria-label="Réseaux sociaux">
          <a href="#" aria-label="Instagram (compte à créer)"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" class="dot"/></svg></a>
          <a href="#" aria-label="TikTok (compte à créer)"><svg viewBox="0 0 24 24"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.6 2.2 4.4 5 4.6"/></svg></a>
          <a href="#" aria-label="Facebook (compte à créer)"><svg viewBox="0 0 24 24"><path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H9v3h2.5V21"/></svg></a>
        </div>
      </div>
      {"".join(cols)}
    </div>
    <div class="fbottom"><span>© 2026 {BRAND}. Tous droits réservés.</span>{lang_switch()}<nav class="legal" aria-label="Informations légales">{legal}</nav></div>
  </div>
</footer>"""


def version(name: str) -> str:
    """Empreinte du fichier : le navigateur recharge la feuille de style dès qu'elle change."""
    return hashlib.md5((ROOT / "assets" / name).read_bytes()).hexdigest()[:8]


def page(meta: dict, body: str) -> str:
    body_class = ' class="has-hero"' if meta.get("hero") else ""
    title = meta.get("title", BRAND)
    full_title = title if BRAND in title else f"{title} · {BRAND}"
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{full_title}</title>
<meta name="description" content="{meta.get('description', '')}">
<link rel="icon" href="assets/favicon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="assets/favicon-64.png" type="image/png" sizes="64x64">
<link rel="icon" href="assets/favicon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="assets/site.css?v={version('site.css')}">
</head>
<body{body_class}>
{header(meta.get('nav', ''))}
<main id="top">
{body.strip()}
</main>
{footer()}
<script src="assets/site.js?v={version('site.js')}" defer></script>
</body>
</html>
"""


def main():
    for src in sorted(SRC.glob("*.html")):
        text = src.read_text(encoding="utf-8")
        m = re.match(r"\s*<!--(.*?)-->", text, re.S)
        meta = {}
        if m:
            for part in m.group(1).split("|"):
                if ":" in part:
                    k, v = part.split(":", 1)
                    meta[k.strip()] = v.strip()
            text = text[m.end():]
        text = text.replace("{{ONDE}}", ONDE).replace("{{BRAND}}", BRAND).replace("{{REASSURE}}", REASSURE)
        (ROOT / src.name).write_text(page(meta, text), encoding="utf-8")
        print("✓", src.name)


if __name__ == "__main__":
    main()
