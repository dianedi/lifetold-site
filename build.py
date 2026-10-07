"""Assemble le site d'aperçu LifeTold : chaque page de src/ reçoit l'en-tête, le pied de page et les métadonnées communs.

Une page de src/ commence par un commentaire de métadonnées :
<!-- title: Titre de la page | description: Phrase pour Google | nav: comment -->
puis le contenu de <main>. Le résultat est écrit à la racine du dossier site/ (servi tel quel par GitHub Pages).

Usage : python3 site/build.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
BRAND = "LifeTold"

LOGO = '<img src="assets/logo.svg" alt="" width="30" height="29">'
ONDE = '<span class="onde" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>'

NAV = [
    ("comment", "comment-ca-marche.html", "Comment ça marche"),
    ("livres", "index.html#livres", "Les livres"),
    ("offrir", "carte-cadeau.html", "Offrir"),
    ("faq", "faq.html", "FAQ"),
]

# Pages existantes : les liens du pied de page vers une page pas encore écrite restent du texte simple.
FOOTER = [
    ("Les livres", [("Ma vie", "ma-vie.html"), ("Mes ancêtres", "mes-ancetres.html"), ("Un temps fort", "un-temps-fort.html"),
                    ("Lignes de vie", "lignes-de-vie.html"), ("Récit : voyage, EVJF, mariage", "recit.html", "Bientôt"),
                    ("Chronique : une année en famille", "chronique.html", "Bientôt")]),
    ("Offrir", [("La carte cadeau", "carte-cadeau.html"), ("Pour Noël", None), ("Fête des grands-mères", None),
                ("Fête des mères", None), ("Fête des pères", None), ("Un anniversaire", None)]),
    (BRAND, [("Notre histoire", None), ("Comment ça marche", "comment-ca-marche.html"), ("Tarifs", "index.html#prix"),
             ("FAQ", "faq.html"), ("Télécharger l'app", "app.html"), ("Devenir ambassadeur", None), ("Contact", "contact.html")]),
    ("Légal", [("Mentions légales", "mentions-legales.html"), ("CGV", None), ("Confidentialité", "confidentialite.html"),
               ("Cookies", None), ("Supprimer mes données", "confidentialite.html#suppression")]),
]


def header(active: str) -> str:
    current = ' aria-current="page"'
    links = "".join(f'<li><a href="{href}"{current if key == active else ""}>{label}</a></li>' for key, href, label in NAV)
    mobile = "".join(f'<a href="{href}">{label}</a>' for _, href, label in NAV)
    return f"""<div class="preview"><div class="wrap"><span><b>Aperçu du site {BRAND}</b> · version de travail, non officielle</span><span>Textes, visuels et prix à valider · aucune vente possible</span></div></div>
<div class="annonce">Offrez-le <b>jusqu'au 24 décembre au soir</b> · la carte cadeau s'imprime tout de suite</div>
<header class="site">
  <div class="wrap">
    <a class="logo" href="index.html" aria-label="{BRAND}, accueil">{LOGO}{BRAND}</a>
    <nav class="main" aria-label="Navigation principale"><ul>{links}</ul></nav>
    <div class="hdr-right">
      <a class="btn btn-ink" href="memoire.html">Offrir une histoire</a>
      <span class="cart" aria-label="Panier (aperçu)"><svg viewBox="0 0 24 24"><path d="M5 8h14l-1.4 11H6.4z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg></span>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Menu"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
  <div class="wrap"><nav class="mobile-nav" id="mnav" aria-label="Navigation mobile">{mobile}<a href="memoire.html">Offrir une histoire</a></nav></div>
</header>"""


def footer() -> str:
    cols = []
    for title, items in FOOTER:
        lis = []
        for item in items:
            label, href = item[0], item[1]
            tag = f' <span class="tag">{item[2]}</span>' if len(item) > 2 else ""
            lis.append(f'<li><a href="{href}">{label}</a>{tag}</li>' if href else f'<li style="color:var(--grey)">{label}{tag}</li>')
        cols.append(f'<div><h4>{title}</h4><ul>{"".join(lis)}</ul></div>')
    return f"""<footer class="site">
  <div class="wrap">
    <div class="fcols">
      <div>
        <a class="logo" href="index.html">{LOGO}{BRAND}</a>
        <p class="story"><span class="todo">[Le sens du nom {BRAND}, à écrire par Diane]</span></p>
        <p style="color:var(--grey);margin:0">Instagram · TikTok · Facebook · Pinterest <span class="todo">[comptes à créer]</span></p>
      </div>
      {"".join(cols)}
    </div>
    <div class="fbottom"><span>© 2026 {BRAND} · Diane Decléty EI · TVA non applicable, art. 293 B du CGI</span><span class="pay"><span>Visa</span><span>Mastercard</span><span>Apple Pay</span><span>Google Pay</span><span>Shop Pay</span></span></div>
  </div>
</footer>"""


def page(meta: dict, body: str) -> str:
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
<link rel="icon" href="assets/icon.svg" type="image/svg+xml">
<link rel="icon" href="assets/favicon.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
{header(meta.get('nav', ''))}
<main id="top">
{body.strip()}
</main>
{footer()}
<script src="assets/site.js" defer></script>
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
        text = text.replace("{{ONDE}}", ONDE).replace("{{BRAND}}", BRAND)
        (ROOT / src.name).write_text(page(meta, text), encoding="utf-8")
        print("✓", src.name)


if __name__ == "__main__":
    main()
