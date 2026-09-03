# CLAUDE.md

Galerie de spécimens d'outils numériques pour la classe ID460 (Eracom).
Site statique, sans dépendances, publié sur GitHub Pages.
`README.md` est la documentation destinée aux élèves — **le tenir à jour avec
le code**.

## Contrainte centrale

~14 élèves poussent sur `main` dans le même dépôt, avec un niveau Git débutant.
Toute l'architecture existe pour qu'ils **n'éditent jamais un fichier partagé** :
chacun·e n'ajoute que ses propres fichiers dans `tools/`. Avant de proposer un
changement, vérifier qu'il ne réintroduit pas de fichier édité à plusieurs.

Corollaire : **les élèves n'ont pas Node installé et n'en ont pas besoin.** La
prévisualisation se fait en ouvrant une fiche `.snippet.html` dans le
navigateur. Ne pas introduire d'étape de build côté élève.

## Modèle de données

Un dossier `tools/<outil>/` par outil, partagé par toute la classe. Un spécimen
= deux fichiers de **même nom** dans ce dossier :

```
ID460_PrenomNom_TestPage_<outil>.png
ID460_PrenomNom_TestPage_<outil>.snippet.html
```

L'appariement se fait **par nom de fichier**, pas par contenu. Un fichier sans
jumeau est listé au build puis ignoré — jamais une erreur.

Une fiche est un **document HTML complet** (`<body class="gallery">` + un lien
vers `../../style.css`) pour s'ouvrir seule dans un navigateur ; le build n'en
garde que le contenu du `<body>`. Ne pas la réduire à un fragment : la
prévisualisation autonome est la raison d'être de ce format.

## Build

`node build.mjs` (Node 20+, aucune dépendance) :

- apparie les fiches et les médias, extrait les `<body>`, préfixe les chemins
  relatifs par le dossier de la fiche ;
- **réécrit `index.html` sur place**, entre `<!-- BUILD:GALLERY -->` et
  `<!-- /BUILD:GALLERY -->`, puis copie le site dans `_site/` (gitignoré) ;
- idempotent : relancé sans changement, il n'écrit rien ;
- `--check` valide sans écrire.

Le lint est **volontairement non bloquant** : un·e élève ne doit jamais casser
la publication des autres. Seuls les marqueurs absents arrêtent le build.

`index.html` est **généré mais versionné**, pour rester une page statique
autonome (clé USB, autre serveur, ouverture depuis le disque). C'est un choix
assumé du prof, pas un oubli. Le workflow le renvoie sur `main` après chaque
push ; les élèves ne le commitent jamais.

## Publication

`.github/workflows/deploy.yml` sur push `main` : build → commit de `index.html`
sur `main` (`[skip ci]`, pas de boucle car un push via `GITHUB_TOKEN` ne
redéclenche pas les workflows) → publication de `_site/` sur Pages.
`.github/workflows/check.yml` lance `--check` sur les pull requests.

Deux réglages GitHub sont nécessaires et se règlent hors du dépôt :
Pages → Source : **GitHub Actions**, et Actions → Workflow permissions :
**Read and write** (sinon 403 au commit-back).

## Conventions

- Indentation **tabulations**, y compris en HTML/CSS.
- Documentation, commentaires et messages de commit **en français** : le
  lectorat, ce sont les élèves.
- Aucune dépendance npm, aucun `package.json`. Node de la bibliothèque
  standard uniquement.
