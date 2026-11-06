import React, { useMemo } from "react";
import { LazyChartWrapper } from "../LazyChartWrapper";
import { anneau, colonnes, colonnesGroupees, courbes, empile100, progression } from "./graphiquesRapport";
import { CarteChaleur } from "./CarteChaleur";

// Un graphique du rapport Global avec le rendu validé (proposition 1). Les données reçues sont celles que la page
// préparait déjà ; seule leur présentation change. chartRef garde la même interface pour les exports PDF / Word.
//   rendu : "progression" | "anneau" | "empile" | "chaleur" | "courbes" | "colonnes"
//   reglages : { pct, couleur, couleurs }
export const construireRendu = (rendu, data, reglages = {}) => {
  switch (rendu) {
    case "progression": return progression(data, reglages);
    case "anneau": return anneau(data, reglages);
    case "empile": return empile100(data);
    case "courbes": return courbes(data, reglages);
    case "colonnes": return colonnes(data, reglages);
    case "colonnesGroupees": return colonnesGroupees(data, reglages);
    default: return null;
  }
};

export function GraphiqueRapport({ rendu, data, chartRef, reglages, visible }) {
  const r = useMemo(() => (rendu === "chaleur" ? null : construireRendu(rendu, data, reglages)), [rendu, data, reglages]);
  if (rendu === "chaleur") return <CarteChaleur data={data} couleur={reglages?.couleur} chartRef={chartRef} />;
  if (!r) return null;
  return <LazyChartWrapper type={r.type} data={r.data} options={r.options} chartRef={chartRef} visible={visible} />;
}

// Hauteur de la zone de dessin selon le rendu (lignes compactes des barres de progression, etc.).
export const hauteurGraphique = (rendu, data, reglages) => {
  if (rendu === "chaleur") {
    const agences = (data?.labels || []).filter((_, a) => (data?.datasets || []).some((s) => parseFloat(s.data?.[a]) > 0)).length;
    return Math.max(260, agences * 30 + 174);
  }
  const r = construireRendu(rendu, data, reglages);
  return Math.max(rendu === "progression" ? 120 : 200, r?.hauteur || 360);
};
