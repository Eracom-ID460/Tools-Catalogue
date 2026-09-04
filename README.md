# Tools Catalogue — ID460

Galerie de spécimens d'outils numériques.
En ligne : <https://eracom-id460.github.io/Tools-Catalogue/>

Toute la classe travaille dans le même dépôt, mais **personne n'édite le même
fichier** : chacun·e ajoute ses propres fichiers, le site est réassemblé
automatiquement. Pas de conflits de fusion.

---

## Ajouter un spécimen

Un **dossier par outil**, partagé par toute la classe. Chacun·e y dépose autant
de spécimens qu'iel veut.

Un spécimen = **deux fichiers de même nom** dans le dossier de l'outil :

```
tools/enfont-terrible.com/
	ID460_AndriiBlyshchyk_TestPage_enfont-terrible.com.png
	ID460_AndriiBlyshchyk_TestPage_enfont-terrible.com.snippet.html
	ID460_MarieDupont_TestPage_enfont-terrible.com.png
	ID460_MarieDupont_TestPage_enfont-terrible.com.snippet.html
```

C'est le **nom** qui fait le lien : même nom des deux côtés, `.png` d'un côté,
`.snippet.html` de l'autre. **Un fichier sans son jumeau est simplement
ignoré** — rien ne casse, le spécimen n'apparaît pas dans la galerie.

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

   Le chemin de l'image est **relatif à la fiche** : juste le nom du fichier,
   sans `tools/…` devant. Le build ajoute le dossier tout seul.

4. **Vérifier** : double-cliquer sa fiche `.snippet.html` — elle s'ouvre dans le
   navigateur, déjà mise en forme.

5. Commit + push sur `main`. Une minute plus tard, la galerie est en ligne.

> En partant de la fiche d'un·e camarade, ne pas oublier de changer le
> `<img src>` : le build prévient quand une fiche pointe sur l'image
> de quelqu'un d'autre.

### Formats acceptés

`.png` `.jpg` `.jpeg` `.gif` `.webp` `.avif` `.svg` `.mp4` `.webm`

Pour une vidéo, remplacer l'`<img>` par une `<video src="…" autoplay loop muted>`.

---

## Règles pour ne pas se marcher dessus

- **Ne jamais modifier ni commiter `index.html`** : il est regénéré à chaque
  push, toute modification manuelle est écrasée.
- **Ne pas toucher à `style.css`, `build.mjs`, `MODELE.snippet.html`** : ils
  appartiennent à tout le monde.
- Rester sur ses propres fichiers, ceux qui portent son nom. Ne jamais renommer
  ni supprimer ceux d'un·e autre.
- Avant chaque push :

  ```sh
  git pull --rebase
  git push
  ```

  À configurer **une seule fois**, pour que ce soit automatique :

  ```sh
  git config --global pull.rebase true
  ```

- **macOS : ne jamais commiter de `.DS_Store`.** Ce fichier caché est créé par
  le Finder dans chaque dossier ; il n'a rien à faire dans le dépôt. Il est déjà
  dans le `.gitignore` d'ici, mais autant le bloquer partout, une fois pour
  toutes :

  ```sh
  git config --global core.excludesfile ~/.gitignore_global
  echo .DS_Store >> ~/.gitignore_global
  ```

Comme personne ne modifie les mêmes fichiers, `git pull --rebase` passe
toujours sans conflit.

---

## Prévisualiser

**Aucune installation nécessaire** : double-cliquer sa propre fiche
`.snippet.html` l'ouvre dans le navigateur, déjà mise en forme par `style.css`.
C'est la façon normale de vérifier son travail avant de pousser.

Pour reconstruire la galerie entière en local — optionnel, demande
[Node.js](https://nodejs.org) 20+ :

```sh
node build.mjs          # réécrit index.html + une copie dans _site/
node build.mjs --check   # valide les fiches, n'écrit rien
```

> ⚠︎ `node build.mjs` **modifie `index.html`**. Ne pas commiter ce fichier :
> c'est le robot qui s'en charge sur `main`. En cas de conflit dessus :
>
> ```sh
> git checkout --theirs index.html && git add index.html
> ```
>
> Le fichier étant généré, n'importe quelle version fait l'affaire : le
> prochain build la corrige.

---

## Comment ça marche

| Fichier | Rôle |
|---|---|
| `tools/<outil>/<nom>.png` | le média d'un spécimen |
| `tools/<outil>/<nom>.snippet.html` | sa fiche, **même nom** que le média — la seule chose que les élèves éditent |
| `MODELE.snippet.html` | le modèle à copier (hors de `tools/`, donc jamais publié) |
| `index.html` | la galerie, **fichier généré** mais versionné |
| `style.css` | la mise en forme, partagée par la galerie et les fiches |
| `build.mjs` | le build |
| `.github/workflows/deploy.yml` | build + publication à chaque push sur `main` |
| `.github/workflows/check.yml` | vérification des fiches sur les pull requests |

### Le build, étape par étape

1. Parcourt `tools/` et **apparie** chaque `.snippet.html` avec le média de même
   nom dans le même dossier. Les fichiers non appariés sont listés puis ignorés.
2. Pour chaque fiche, garde uniquement le contenu de son `<body>` — le reste du
   document HTML n'existe que pour la prévisualisation.
3. **Préfixe les chemins relatifs** (`src`, `href`, `poster`) par le dossier de
   la fiche : `mon-image.png` → `tools/mon-outil/mon-image.png`. Les URL
   absolues (`https://…`, `/…`, `#…`) sont laissées telles quelles.
4. Signale les erreurs courantes (voir plus bas), sans jamais bloquer.
5. Remplace le contenu entre `<!-- BUILD:GALLERY -->` et `<!-- /BUILD:GALLERY -->`
   dans `index.html` — **sur place**, puis en écrit une copie dans `_site/`.

`index.html` reste donc une page statique complète et autonome : elle s'ouvre
depuis le disque, se copie sur une clé USB ou sur n'importe quel serveur, sans
rien exécuter. Les fiches sont triées par chemin ; l'ordre d'affichage est
mélangé aléatoirement à chaque chargement de la page, par le script en tête de
`index.html`.

### Avertissements du build

Purement informatifs — **ils ne bloquent jamais** ni le build ni la
publication :

- une fiche qui pointe sur le média d'un·e autre (copier-coller) ;
- pas de `<figure>`, pas de `class="specimen"`, pas d'`<img>` ni de `<video>` ;
- une `<img>` sans attribut `alt` ;
- plusieurs `<figure>` dans une même fiche (1 fiche = 1 spécimen) ;
- un champ `.title`, `.link` ou `.creator` manquant ou vide.

Le build ne s'arrête qu'à une seule condition : les marqueurs `BUILD:GALLERY`
absents de `index.html`.

### Publication

À chaque push sur `main`, `deploy.yml` :

1. lance `node build.mjs` ;
2. **renvoie `index.html` sur `main`** s'il a changé (commit `github-actions[bot]`,
   marqué `[skip ci]` ; un push fait avec `GITHUB_TOKEN` ne redéclenche pas le
   workflow, donc pas de boucle infinie) ;
3. publie `_site/` sur GitHub Pages — `_site/` ne contient que `index.html`,
   `style.css` et `tools/`, sans `.git`, `.github`, `README.md` ni fichiers cachés.

Les runs sont sérialisés (`concurrency: pages`, sans annulation) : si plusieurs
personnes poussent en même temps, chaque build passe à son tour.

---

## Réglages GitHub (une seule fois, par le prof)

Les deux sont **nécessaires** :

1. **Settings → Pages → Build and deployment → Source : GitHub Actions**
   (ignorer les modèles proposés « Jekyll » et « Static HTML »).
2. **Settings → Actions → General → Workflow permissions :
   Read and write permissions** — sans ça, l'étape qui renvoie `index.html`
   sur `main` échoue avec une erreur 403 au `git push`.
