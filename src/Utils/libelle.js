// Comparaison de libellés pour repérer les doublons :
// « Tribunal », « tribunal » et « Tribunal  » sont le même libellé (casse, accents et espaces ignorés).
export const normaliserLibelle = (texte) =>
  String(texte ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// Vrai si `libelle` existe déjà parmi `elements` (en ignorant l'élément `idIgnore`, celui qu'on modifie).
export const libelleExisteDeja = (libelle, elements = [], idIgnore = null, cle = "libelle") => {
  const k = normaliserLibelle(libelle);
  if (!k) return false;
  return (Array.isArray(elements) ? elements : []).some(
    (e) => e && String(e.id) !== String(idIgnore) && normaliserLibelle(e[cle]) === k
  );
};

// Garde un seul élément par libellé (le premier rencontré).
export const sansDoublonDeLibelle = (elements = [], cle = "libelle") => {
  const vus = new Set();
  return (Array.isArray(elements) ? elements : []).filter((e) => {
    const k = normaliserLibelle(e?.[cle]);
    if (!k || vus.has(k)) return false;
    vus.add(k);
    return true;
  });
};
