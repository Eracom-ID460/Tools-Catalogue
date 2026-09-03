# Tools Catalogue

Galerie d'outils numériques — <https://eracom-id460.github.io/Tools-Catalogue/>

`index.html` n'est **jamais** édité à la main : il est assemblé automatiquement
à partir d'une fiche par outil. Chaque personne ne touche que son propre
dossier, donc **aucun conflit Git possible**.

---

## Ajouter un spécimen

Un **dossier par outil**, partagé par toute la classe. Chaque personne y dépose
autant de spécimens qu'elle veut.

Un spécimen = **deux fichiers de même nom** dans le dossier de l'outil :

```
tools/enfont-terrible.com/
	ID460_AndriiBlyshchyk_TestPage_enfont-terrible.com.png
	ID460_AndriiBlyshchyk_TestPage_enfont-terrible.com.snippet.html
	ID460_MarieDupont_TestPage_enfont-terrible.com.png
	ID460_MarieDupont_TestPage_enfont-terrible.com.snippet.html
```

C'est le nom qui fait le lien : `.png` d'un côté, `.snippet.html` de l'autre.
**Un fichier sans son jumeau est simplement ignoré** — rien ne casse, le
spécimen n'apparaît pas.

Pour plusieurs essais avec le même outil, numéroter la paire :
`…_enfont-terrible.com_2.png` + `…_enfont-terrible.com_2.snippet.html`.

### Marche à suivre

1. Trouver — ou créer — le dossier de l'outil : `tools/nom-de-loutil/`
   (minuscules, sans espaces ni accents — p.ex. `tools/paint.stx.studio/`)

2. Y déposer la capture, nommée `ID460_PrenomNom_TestPage_nom-de-loutil.png`

3. Y copier `MODELE.snippet.html`, renommé **exactement comme l'image** :
   `ID460_PrenomNom_TestPage_nom-de-loutil.snippet.html`, puis remplir :

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

> En copiant la fiche d'un·e camarade, ne pas oublier de changer le `<img src>` :
> le build prévient si une fiche pointe sur l'image de quelqu'un d'autre.

## Règles pour ne pas se marcher dessus

- **Ne pas modifier `index.html`, `style.css` ni `build.mjs`** (ils appartiennent à tout le monde).
- Rester sur ses propres fichiers : ceux qui portent son nom.
- Ne jamais renommer ni modifier les fichiers d'un·e autre.
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
| `tools/<outil>/<nom>.png` | la capture d'écran d'un spécimen |
| `tools/<outil>/<nom>.snippet.html` | sa fiche — même nom que l'image (la seule chose que les élèves éditent) |
| `index.html` | gabarit ; le contenu entre `<!-- BUILD:GALLERY -->` et `<!-- /BUILD:GALLERY -->` est remplacé |
| `build.mjs` | collecte les fiches, réécrit les chemins d'images, assemble `_site/` |
| `.github/workflows/deploy.yml` | rejoue le build à chaque push sur `main` et publie sur GitHub Pages |

Le build apparie chaque fiche avec le média de même nom dans son dossier
(`.png`, `.jpg`, `.gif`, `.webp`, `.svg`, `.mp4`…), extrait le contenu du
`<body>` de la fiche, puis préfixe les chemins relatifs par le dossier
(`mon-image.png` → `tools/mon-outil/mon-image.png`). Les fichiers non appariés
sont listés au build et ignorés.
L'ordre d'affichage est mélangé aléatoirement à chaque chargement de page.

---

## Réglage GitHub (une fois)

**Settings → Pages → Build and deployment → Source : GitHub Actions.**
