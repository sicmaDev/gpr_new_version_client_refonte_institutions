import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

/**
 * LazyChartSkeleton
 *
 * Squelette animé affiché pendant le chargement d'un graphique : il reprend la forme du graphique attendu.
 *   rendu : le rendu du graphique du rapport Global (voir rendu/GraphiqueRapport.jsx)
 *           "anneau" | "progression" | "empile" | "courbes" | "colonnes" | "colonnesGroupees" | "chaleur"
 *   type  : ancienne valeur, gardée pour les pages qui l'utilisent encore : "pie" | "line" | "bar"
 *   height : hauteur réservée du graphique ; width : largeur (100 % par défaut)
 */
const BASE = "#E2E8F0";
const ECLAT = "#F8FAFC";
const S = (props) => <Skeleton baseColor={BASE} highlightColor={ECLAT} {...props} />;

// Correspondance des anciennes valeurs
const DEPUIS_TYPE = { pie: "anneau", line: "courbes", bar: "colonnes" };

// Largeurs (en %) qui donnent l'allure d'un vrai graphique, sans hasard (même dessin à chaque affichage)
const LONGUEURS = [92, 74, 63, 55, 47, 38, 30, 24, 19, 14];
const COLONNES = [60, 85, 45, 95, 70, 40, 80];
const SEGMENTS = [[38, 27, 20, 15], [52, 18, 18, 12], [30, 35, 22, 13], [45, 25, 15, 15], [28, 30, 30, 12], [60, 15, 15, 10]];

const Legende = ({ n = 3 }) => (
  <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <S circle height={10} width={10} />
        <S height={10} width={56} borderRadius={4} />
      </div>
    ))}
  </div>
);

// Courbe : deux tracés qui se dessinent en boucle, sur une grille, avec les mois en bas
const Courbes = ({ h }) => {
  const zone = h - 56;
  const points = (serie) => serie.map((v, i) => `${(i * 100) / (serie.length - 1)},${100 - v}`).join(" ");
  return (
    <div style={{ height: h, display: "flex", flexDirection: "column", padding: "16px 20px 8px", boxSizing: "border-box", gap: 10 }}>
      <style>{`
        @keyframes gprTraceCourbe { 0% { stroke-dashoffset: 260; } 60% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; } }
        @keyframes gprPulseCourbe { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
      `}</style>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: zone, animation: "gprPulseCourbe 1.6s ease-in-out infinite" }}>
        {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke={BASE} strokeWidth=".6" vectorEffect="non-scaling-stroke" />)}
        {[[30, 45, 38, 60, 52, 70, 58, 78, 66, 72, 84, 76], [18, 25, 22, 35, 30, 42, 36, 48, 40, 46, 55, 50]].map((serie, k) => (
          <polyline key={k} points={points(serie)} fill="none" stroke={k === 0 ? "#CBD5E1" : BASE} strokeWidth="3"
            vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="260"
            style={{ animation: `gprTraceCourbe 2.2s ease-in-out ${k * 0.25}s infinite` }} />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
        {Array.from({ length: 12 }, (_, i) => <S key={i} height={9} width={22} borderRadius={2} />)}
      </div>
    </div>
  );
};

const LazyChartSkeleton = ({ rendu, type = "bar", height = 400, width = "100%" }) => {
  const forme = rendu || DEPUIS_TYPE[type] || "colonnes";
  const h = Math.max(160, Math.min(height, 520));
  const lignes = (pas) => Math.max(3, Math.min(LONGUEURS.length, Math.floor((h - 40) / pas)));

  switch (forme) {
    case "anneau": {
      const taille = Math.min(h - 60, 240);
      return (
        <div style={{ height: h, width, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <S circle height={taille} width={taille} />
          <Legende n={3} />
        </div>
      );
    }

    // Jauge (taux de résolution) : un demi-anneau et la valeur au centre
    case "jauge": {
      const l = Math.min(280, (h - 60) * 2);
      return (
        <div style={{ height: h, width, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ width: l, height: l / 2, overflow: "hidden", position: "relative" }}>
            <S circle height={l} width={l} />
            <div style={{ position: "absolute", left: l * 0.18, top: l * 0.18, width: l * 0.64, height: l * 0.64, borderRadius: "50%", background: "#fff" }} />
          </div>
          <S height={18} width={70} borderRadius={4} />
        </div>
      );
    }

    // Barres horizontales de progression : un libellé, une barre de longueur décroissante, une valeur
    case "progression":
      return (
        <div style={{ height: h, width, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, padding: "12px 20px", boxSizing: "border-box" }}>
          {LONGUEURS.slice(0, lignes(34)).map((pct, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: "26%", flexShrink: 0 }}><S height={11} width={`${60 + ((i * 13) % 35)}%`} borderRadius={3} /></div>
              <div style={{ flex: 1, background: "#F1F5F9", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${pct}%` }}><S height={14} borderRadius={6} /></div>
              </div>
              <div style={{ width: 38, flexShrink: 0 }}><S height={11} borderRadius={3} /></div>
            </div>
          ))}
        </div>
      );

    // Barres empilées à 100 % (une par agence) : chaque barre découpée en segments
    case "empile":
      return (
        <div style={{ height: h, width, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, padding: "12px 20px", boxSizing: "border-box" }}>
          <Legende n={4} />
          {Array.from({ length: lignes(36) - 1 }, (_, i) => SEGMENTS[i % SEGMENTS.length]).map((segments, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: "22%", flexShrink: 0 }}><S height={11} width={`${55 + ((i * 17) % 40)}%`} borderRadius={3} /></div>
              <div style={{ flex: 1, display: "flex", gap: 2 }}>
                {segments.map((pct, k) => (
                  <div key={k} style={{ width: `${pct}%`, opacity: 1 - k * 0.18 }}><S height={16} borderRadius={k === 0 ? "6px 0 0 6px" : k === segments.length - 1 ? "0 6px 6px 0" : 0} /></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case "courbes":
      return <div style={{ width }}><Courbes h={h} /></div>;

    // Colonnes groupées : trois colonnes côte à côte par groupe
    case "colonnesGroupees":
      return (
        <div style={{ height: h, width, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 10, padding: "16px 20px 8px", boxSizing: "border-box" }}>
          <Legende n={3} />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: h - 80, gap: 18 }}>
            {[[55, 70, 40], [80, 60, 50], [45, 85, 35], [70, 50, 65], [90, 75, 55], [60, 40, 45]].map((groupe, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, width: "100%", height: "100%" }}>
                  {groupe.map((pct, k) => (
                    <div key={k} style={{ flex: 1, opacity: 1 - k * 0.2 }}><S height={Math.max(16, ((h - 110) * pct) / 100)} borderRadius="4px 4px 0 0" /></div>
                  ))}
                </div>
                <S height={10} width={36} borderRadius={2} />
              </div>
            ))}
          </div>
        </div>
      );

    // Carte de chaleur : une grille de cases (agences × colonnes)
    case "chaleur": {
      const rangees = lignes(32);
      return (
        <div style={{ height: h, width, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, padding: "12px 20px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", gap: 6, paddingLeft: "24%" }}>
            {Array.from({ length: 6 }, (_, i) => <div key={i} style={{ flex: 1 }}><S height={10} borderRadius={2} /></div>)}
          </div>
          {Array.from({ length: rangees }, (_, r) => (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: "22%", flexShrink: 0 }}><S height={11} width={`${55 + ((r * 19) % 40)}%`} borderRadius={3} /></div>
              {Array.from({ length: 6 }, (_, c) => (
                <div key={c} style={{ flex: 1, opacity: 0.45 + (((r + 2) * (c + 3)) % 5) * 0.13 }}><S height={22} borderRadius={4} /></div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    // Colonnes simples
    case "colonnes":
    default:
      return (
        <div style={{ height: h, width, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "16px 20px 8px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: h - 48, gap: 14 }}>
            {COLONNES.map((pct, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
                <S height={Math.max(20, ((h - 70) * pct) / 100)} width="100%" borderRadius="4px 4px 0 0" />
                <S height={11} width="75%" borderRadius={2} />
              </div>
            ))}
          </div>
        </div>
      );
  }
};

export default LazyChartSkeleton;
