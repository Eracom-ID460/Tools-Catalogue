#!/usr/bin/env node
/**
 * build.mjs — assemble index.html depuis les fiches tools/**\/*.snippet.html
 *
 * Un dossier tools/<outil>/ par outil, partagé par toute la classe.
 * Un spécimen = deux fichiers de MÊME NOM dans ce dossier :
 *     ID460_PrenomNom_TestPage_<outil>.png
 *     ID460_PrenomNom_TestPage_<outil>.snippet.html
 * Une fiche sans image du même nom (ou l'inverse) est ignorée.
 *
 * Ce script collecte les spécimens et les injecte entre les marqueurs
 * BUILD:GALLERY de index.html, puis écrit le site dans _site/.
 *
 * Usage:  node build.mjs            (écrit _site/)
 *         node build.mjs --check    (ne fait que valider, sortie non nulle si erreur)
 */

import { readdir, readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, '_site');
const CHECK_ONLY = process.argv.includes('--check');

const START = '<!-- BUILD:GALLERY -->';
const END = '<!-- /BUILD:GALLERY -->';

/* ------------------------------------------------------------------ */
/* 1. trouver toutes les fiches                                        */

const MEDIA = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.mp4', '.webm'];
const SUFFIX = '.snippet.html';

/**
 * Renvoie { pairs, orphans } :
 *  - pairs   : fiches ayant un média du même nom dans le même dossier
 *  - orphans : fiches sans média, et médias sans fiche (ignorés)
 */
async function findSpecimens(dir) {
	const pairs = [];
	const orphans = [];

	const entries = await readdir(dir, { withFileTypes: true });
	const files = entries.filter((e) => e.isFile() && !e.name.startsWith('.'));

	// index des médias du dossier, par nom sans extension
	const media = new Map();
	for (const f of files) {
		const ext = path.extname(f.name).toLowerCase();
		if (MEDIA.includes(ext)) media.set(f.name.slice(0, -ext.length), f.name);
	}

	for (const f of files) {
		if (!f.name.endsWith(SUFFIX)) continue;
		const stem = f.name.slice(0, -SUFFIX.length);
		const image = media.get(stem);
		if (image) { pairs.push({ file: path.join(dir, f.name), stem, image }); media.delete(stem); }
		else orphans.push(`${path.join(dir, f.name)} : aucun média nommé ${stem}.<ext> — fiche ignorée`);
	}

	// médias restants = pas de fiche
	for (const [stem, name] of media) {
		orphans.push(`${path.join(dir, name)} : aucune fiche ${stem}${SUFFIX} — image ignorée`);
	}

	for (const e of entries) {
		if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
			const sub = await findSpecimens(path.join(dir, e.name));
			pairs.push(...sub.pairs);
			orphans.push(...sub.orphans);
		}
	}
	return { pairs, orphans };
}

/* ------------------------------------------------------------------ */
/* 2. extraire le fragment utile d'une fiche                           */

function extractFragment(html) {
	// La fiche est un document HTML complet (pour pouvoir l'ouvrir seule
	// dans un navigateur) : on ne garde que le contenu du <body>.
	const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
	if (body) return body[1].trim();

	// Tolérance : la fiche est déjà un simple fragment.
	return html
		.replace(/<!DOCTYPE[^>]*>/gi, '')
		.replace(/<\/?(?:html|head|body)[^>]*>/gi, '')
		.replace(/<(?:title|meta|link|script)[^>]*>[\s\S]*?(?:<\/(?:title|script)>|$)/gi, '')
		.trim();
}

/* ------------------------------------------------------------------ */
/* 3. réécrire les chemins relatifs (foo.png -> tools/test/foo.png)    */

const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i;

function rewritePaths(html, dirFromRoot) {
	return html.replace(
		/\b(src|href|poster)\s*=\s*(["'])([^"']*)\2/gi,
		(match, attr, quote, url) => {
			if (!url || ABSOLUTE.test(url)) return match;
			const resolved = path.posix.normalize(path.posix.join(dirFromRoot, url));
			return `${attr}=${quote}${resolved}${quote}`;
		}
	);
}

/* ------------------------------------------------------------------ */
/* 4. petites vérifications, pour aider les élèves                     */

function lint(fragment, relPath, image, problems) {
	const say = (msg) => problems.push(`${relPath}: ${msg}`);

	// garde-fou copier-coller : la fiche doit pointer sur SON média
	const src = fragment.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']*)["']/i);
	if (src && path.posix.basename(src[1]) !== image) {
		say(`pointe sur ${src[1]} au lieu de ${image} (copier-coller ?)`);
	}

	if (!/<figure\b/i.test(fragment)) say('aucun <figure> trouvé');
	if (!/class\s*=\s*["'][^"']*\bspecimen\b/i.test(fragment)) say('le <figure> devrait avoir class="specimen"');
	if (!/<img\b/i.test(fragment)) say('aucune <img> trouvée');
	if (/<img\b[^>]*\balt\s*=/i.test(fragment) === false) say('l\'<img> n\'a pas d\'attribut alt');

	const figures = (fragment.match(/<figure\b/gi) || []).length;
	if (figures > 1) say(`${figures} <figure> dans une seule fiche (1 fiche = 1 outil)`);

	for (const field of ['title', 'link', 'creator']) {
		const re = new RegExp(`class\\s*=\\s*["'][^"']*\\b${field}\\b[^"']*["'][^>]*>\\s*([\\s\\S]*?)</p>`, 'i');
		const m = fragment.match(re);
		if (!m) say(`champ .${field} manquant`);
		else if (!m[1].replace(/<[^>]*>/g, '').trim()) say(`champ .${field} vide`);
	}
}

/* ------------------------------------------------------------------ */

/* supprime les fichiers cachés (.DS_Store & co) du site publié */
async function pruneDotfiles(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.name.startsWith('.')) await rm(full, { recursive: true, force: true });
		else if (entry.isDirectory()) await pruneDotfiles(full);
	}
}

const { pairs, orphans } = await findSpecimens(path.join(ROOT, 'tools'));
pairs.sort((a, b) => a.file.localeCompare(b.file));

const problems = [];
const cards = [];

for (const { file, image } of pairs) {
	const relFile = path.relative(ROOT, file).split(path.sep).join('/');
	const relDir = path.posix.dirname(relFile);
	const fragment = extractFragment(await readFile(file, 'utf8'));

	if (!fragment) { problems.push(`${relFile}: fiche vide`); continue; }
	lint(fragment, relFile, image, problems);

	cards.push(`\n<!-- ${relFile} -->\n${rewritePaths(fragment, relDir)}\n`);
}

const template = await readFile(path.join(ROOT, 'index.html'), 'utf8');
const a = template.indexOf(START);
const b = template.indexOf(END);
if (a === -1 || b === -1 || b < a) {
	console.error(`index.html doit contenir les marqueurs ${START} et ${END}`);
	process.exit(1);
}

const output =
	template.slice(0, a + START.length) +
	'\n' + cards.join('\n') + '\n' +
	template.slice(b);

for (const o of orphans) console.log(`  ·   ${path.relative(ROOT, o)}`);
for (const p of problems) console.log(`  ⚠︎  ${p}`);
console.log(
	`\n${cards.length} spécimen(s) intégré(s), ` +
	`${orphans.length} fichier(s) ignoré(s), ${problems.length} avertissement(s).`
);

if (CHECK_ONLY) process.exit(0);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, 'index.html'), output);
await cp(path.join(ROOT, 'style.css'), path.join(OUT, 'style.css'));
await cp(path.join(ROOT, 'tools'), path.join(OUT, 'tools'), { recursive: true });
await pruneDotfiles(path.join(OUT, 'tools'));

console.log(`Site écrit dans _site/`);
