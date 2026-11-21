// Lecture de la réponse texte de Wren : tableaux et listes chiffrées, pour les afficher en tableau ou en graphique.

const nombre = (s) => {
  const t = String(s ?? "").replace(/\s/g, "").replace("%", "").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return parseFloat(t);
};

const nettoyer = (s) => String(s || "").replace(/\*\*/g, "").replace(/`/g, "").trim();

/** Premier tableau Markdown du texte : { colonnes, lignes } ou null. */
export const lireTableau = (texte) => {
  const lignes = String(texte || "").replace(/\\n/g, "\n").split("\n").map((l) => l.trim());
  let debut = -1;
  for (let i = 0; i < lignes.length - 1; i++) {
    if (lignes[i].startsWith("|") && /^\|?\s*:?-{2,}/.test(lignes[i + 1])) { debut = i; break; }
  }
  if (debut < 0) return null;
  const cellules = (l) => l.replace(/^\|/, "").replace(/\|$/, "").split("|").map(nettoyer);
  const colonnes = cellules(lignes[debut]);
  const corps = [];
  for (let i = debut + 2; i < lignes.length && lignes[i].startsWith("|"); i++) {
    const c = cellules(lignes[i]);
    if (c.some(Boolean)) corps.push(c);
  }
  return corps.length ? { colonnes, lignes: corps } : null;
};

/** Couples libellé / valeur pour un graphique (tableau à 2 colonnes, ou liste « - **X** : 12 »). */
export const lireSerie = (texte, tableau = lireTableau(texte)) => {
  if (tableau) {
    const iValeur = tableau.colonnes.findIndex((_, i) => i > 0 && tableau.lignes.every((l) => nombre(l[i]) !== null));
    if (iValeur > 0) return tableau.lignes.map((l) => ({ libelle: l[0], valeur: nombre(l[iValeur]) }));
    return [];
  }
  const serie = [];
  String(texte || "").replace(/\\n/g, "\n").split("\n").forEach((l) => {
    const m = l.match(/^\s*[-*•]\s*\*{0,2}([^*:–—]+?)\*{0,2}\s*[:–—-]\s*\*{0,2}(-?\d+(?:[.,]\d+)?)\s*%?/);
    if (m) serie.push({ libelle: nettoyer(m[1]), valeur: nombre(m[2]) });
  });
  return serie.length >= 2 ? serie : [];
};

/** Texte sans le tableau (déjà affiché à part). */
export const texteSansTableau = (texte) =>
  String(texte || "").replace(/\\n/g, "\n").split("\n").filter((l) => !l.trim().startsWith("|")).join("\n").trim();

/** Petites règles d'affichage du texte : paragraphes, listes, gras. Renvoie des blocs { type, texte }. */
export const blocsTexte = (texte) => {
  const blocs = [];
  texteSansTableau(texte).split("\n").forEach((l) => {
    const t = l.trim();
    if (!t) return;
    if (/^#{1,4}\s/.test(t)) blocs.push({ type: "titre", texte: t.replace(/^#+\s*/, "") });
    else if (/^[-*•]\s/.test(t)) blocs.push({ type: "puce", texte: t.replace(/^[-*•]\s*/, "") });
    else blocs.push({ type: "para", texte: t });
  });
  return blocs;
};

/** Morceaux d'une ligne avec le gras (**x**). */
export const morceauxGras = (t) => String(t).split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  .map((m) => (m.startsWith("**") ? { gras: true, texte: m.slice(2, -2) } : { gras: false, texte: m }));

/**
 * Série pour les graphiques, y compris une valeur unique (chiffre clé) :
 * liste chiffrée ou tableau à plusieurs lignes ; sinon une seule ligne chiffrée du tableau ;
 * sinon un nombre mis en gras dans le texte (« le total est **390** »), comme l'ancienne version.
 */
export const lireSerieComplete = (texte, tableau = lireTableau(texte)) => {
  const serie = lireSerie(texte, tableau);
  if (serie.length >= 2) return serie;
  if (tableau && tableau.lignes.length === 1) {
    const l = tableau.lignes[0];
    const i = l.findIndex((c, j) => j > 0 && nombre(c) !== null);
    if (i > 0) return [{ libelle: nettoyer(tableau.colonnes[i] || l[0]), valeur: nombre(l[i]) }];
  }
  if (!tableau) {
    const m = String(texte || "").replace(/\n/g, "\n").match(/\*\*\s*(-?\d[\d\s]*(?:[.,]\d+)?)\s*\*\*/);
    if (m && nombre(m[1]) !== null) return [{ libelle: "Total", valeur: nombre(m[1]) }];
  }
  return [];
};
