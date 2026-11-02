// Couleurs affichées par chaque graphique au moment de l'export Power BI : libellé (catégorie ou série) → couleur.
// Elles sont relues dans le rendu réellement dessiné (construireRendu), pas recalculées.
import { construireRendu } from "./GraphiqueRapport";

export function couleursAffichees(graphiques) {
  const couleurs = {};
  graphiques.forEach(({ cle, rendu, data, reglages }) => {
    const r = data ? construireRendu(rendu, data, reglages) : null;
    if (!r) return;
    const m = {};
    const series = (r.data.datasets || []).filter((ds) => !ds.rail);
    if (rendu === "empile" || (rendu === "courbes" && series.length > 1)) {
      series.forEach((ds) => { if (ds.label != null) m[ds.label] = Array.isArray(ds.backgroundColor) ? ds.backgroundColor[0] : ds.backgroundColor || ds.borderColor; });
    } else {
      const ds = series[0] || {};
      (r.data.labels || []).forEach((l, i) => {
        const c = Array.isArray(ds.backgroundColor) ? ds.backgroundColor[i] : ds.backgroundColor || ds.borderColor;
        if (c) m[l] = c;
      });
      if (rendu === "courbes" && ds.label != null && ds.borderColor) m[ds.label] = ds.borderColor;
    }
    couleurs[cle] = m;
  });
  return couleurs;
}

// Télécharge le fichier reçu (Blob) sous le nom donné.
export function telecharger(blob, nom) {
  const url = window.URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.setAttribute("download", nom);
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.URL.revokeObjectURL(url);
}
