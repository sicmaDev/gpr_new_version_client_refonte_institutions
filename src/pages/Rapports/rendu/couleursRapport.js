// Couleurs de l'identité GPR du rapport Global — source unique pour la page et pour le thème Power BI.
// Les séries des graphiques gardent les couleurs aléatoires envoyées par le serveur : elles ne sont pas ici.
import { darkenColor, getPagePrimary } from "../../../context/ThemeColorsContext";

export const DEFAUT_APPLICATION = "#005081"; // DEFAULT_COLOR de ThemeColorsContext

// Couleurs de section fixes. La couleur principale (vue d'ensemble, réclamations) suit l'institution.
export const SECTIONS = {
  denonciations: "#B45309",
  suggestions: "#0F766E",
  taux: "#5B4B8A", // taux de résolution et satisfaction
  delais: "#2C7A9B",
};

// Couleurs de sens, adoucies : satisfaction, jauge, % hors délai de la carte.
export const SENS = { vert: "#2F855A", orange: "#C05621", rouge: "#C53030" };
export const AUTRES = "#8A9EBB";
export const TEXTE = { chiffre: "#1E293B", libelle: "#64748B", bordure: "#E2E8F0", corps: "#374151", axe: "#9CA3AF", grille: "#F3F4F6", rail: "#F1F5F9" };

const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const luminance = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrasteSurBlanc = (h) => 1.05 / (luminance(h) + 0.05);
const lab = (h) => {
  const [r, g, b] = rgb(h).map(lin), f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047), y = f(r * 0.2126 + g * 0.7152 + b * 0.0722), z = f((r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
export const ecart = (a, b) => { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };

// Couleur principale du rapport à partir de la couleur de l'institution :
//  1. elle doit être lisible sur fond blanc (contraste ≥ 4,5) et assez différente de chaque couleur de section (ΔE ≥ 25) ;
//  2. sinon on l'assombrit par paliers de 5 % avec darkenColor, jusqu'à respecter les deux conditions ;
//  3. si rien ne convient (jusqu'à 60 %), on prend la couleur par défaut de l'application.
// La couleur par défaut (#005081, validée) est toujours gardée : le seuil l'assombrirait presque en noir.
const CONTRASTE_MIN = 4.5, ECART_MIN = 25;
export function couleurPrincipale(institution) {
  const base = /^#[0-9a-f]{6}$/i.test(institution || "") ? institution : DEFAUT_APPLICATION;
  if (base.toLowerCase() === DEFAUT_APPLICATION.toLowerCase()) return DEFAUT_APPLICATION;
  const ok = (c) => contrasteSurBlanc(c) >= CONTRASTE_MIN && Object.values(SECTIONS).every((s) => ecart(c, s) >= ECART_MIN);
  for (let pas = 0; pas <= 12; pas++) {
    const c = pas ? darkenColor(base, pas * 0.05) : base;
    if (ok(c)) return c;
  }
  return DEFAUT_APPLICATION;
}

// Toutes les couleurs du rapport pour les couleurs d'institution reçues de ThemeColorsContext.
export function couleursDuRapport(colors) {
  const principale = couleurPrincipale(getPagePrimary(colors || {}));
  return { principale, reclamations: principale, ...SECTIONS, sens: SENS, autres: AUTRES };
}
