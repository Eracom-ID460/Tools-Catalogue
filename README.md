# Tools Catalogue

Galerie d'outils numériques — <https://eracom-id460.github.io/Tools-Catalogue/>

`index.html` n'est **jamais** édité à la main : il est assemblé automatiquement
à partir d'une fiche par outil. Chaque personne ne touche que son propre
dossier, donc **aucun conflit Git possible**.

---

## Ajouter un outil

1. Créer un dossier `tools/nom-de-loutil/`
   (minuscules, sans espaces ni accents — p.ex. `tools/paint.stx.studio/`)

2. Y déposer la capture d'écran, nommée
   `ID460_PrenomNom_TestPage_nom-de-loutil.png`

3. Y copier `MODELE.snippet.html` en le renommant
   `tools/nom-de-loutil/nom-de-loutil.snippet.html`, puis remplir les champs :

   ```html
   <figure class="specimen">
       <img src="ID460_PrenomNom_TestPage_nom-de-loutil.png" alt="…">
       <figcaption>
           <p class="title">Nom de l'outil</p>
           <p class="link"><a href="https://exemple.com">exemple.com</a></p>
           <p class="creator">Prénom Nom</p>
       </figcaption>
   </figure>
   ```

   Le chemin de l'image est relatif à la fiche : juste le nom du fichier.
   Double-cliquer la fiche l'ouvre dans le navigateur, déjà mise en forme.

4. Commit + push sur `main`. Une minute plus tard la galerie est en ligne.

> Une fiche = un outil. Pour un deuxième outil, un deuxième dossier.

---

## Règles pour ne pas se marcher dessus

- **Ne pas modifier `index.html`, `style.css` ni `build.mjs`** (ils appartiennent à tout le monde).
- Rester dans son dossier `tools/…/`.
- Avant de pousser, toujours :

  ```sh
  git pull --rebase
  git push
  ```

  Configuration à faire une seule fois, pour que ce soit automatique :

  ```sh
  git config --global pull.rebase true
  ```

Comme personne ne modifie les mêmes fichiers, `git pull --rebase` passe
toujours sans conflit.

---

## Prévisualiser en local

```sh
node build.mjs      # écrit _site/
open _site/index.html
```

`node build.mjs --check` valide les fiches sans rien écrire — c'est ce qui
tourne sur chaque pull request.

---

## Comment ça marche

| Fichier | Rôle |
|---|---|
| `tools/*/*.snippet.html` | une fiche par outil (la seule chose que les élèves éditent) |
| `index.html` | gabarit ; le contenu entre `<!-- BUILD:GALLERY -->` et `<!-- /BUILD:GALLERY -->` est remplacé |
| `build.mjs` | collecte les fiches, réécrit les chemins d'images, assemble `_site/` |
| `.github/workflows/deploy.yml` | rejoue le build à chaque push sur `main` et publie sur GitHub Pages |

Le build extrait le contenu du `<body>` de chaque fiche et préfixe les chemins
relatifs par le dossier de la fiche (`mon-image.png` → `tools/mon-outil/mon-image.png`).
L'ordre d'affichage est mélangé aléatoirement à chaque chargement de page.

---

## Réglage GitHub (une fois)

**Settings → Pages → Build and deployment → Source : GitHub Actions.**
