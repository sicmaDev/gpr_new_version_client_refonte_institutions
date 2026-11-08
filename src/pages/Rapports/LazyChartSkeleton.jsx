import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

/**
 * LazyChartSkeleton
 *
 * Affiche un squelette animé (pie, line, bar) pendant le chargement des graphiques.
 * type: "pie" | "line" | "bar"
 * height: hauteur réservée du graphique
 * width: largeur réservée (100% par défaut)
 */
const LazyChartSkeleton = ({ type = "bar", height = 400, width = "100%" }) => {
  const effectiveHeight = Math.max(160, Math.min(height, 520));

  switch (type) {
    case "pie": {
      const circleSize = Math.min(effectiveHeight - 60, 240);
      return (
        <div style={{ height: effectiveHeight, width, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <Skeleton
            circle
            height={circleSize}
            width={circleSize}
            baseColor="#E2E8F0"
            highlightColor="#F8FAFC"
          />
          <div style={{ display: "flex", gap: 14 }}>
            <Skeleton height={12} width={65} borderRadius={4} baseColor="#E2E8F0" highlightColor="#F8FAFC" />
            <Skeleton height={12} width={65} borderRadius={4} baseColor="#E2E8F0" highlightColor="#F8FAFC" />
            <Skeleton height={12} width={65} borderRadius={4} baseColor="#E2E8F0" highlightColor="#F8FAFC" />
          </div>
        </div>
      );
    }

    case "line": {
      const heightsLine = [35, 55, 45, 75, 60, 85, 70, 95, 65, 80, 90, 70];
      return (
        <div style={{ height: effectiveHeight, width, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "16px 20px 8px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: effectiveHeight - 48, gap: 8 }}>
            {heightsLine.map((pct, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
                <Skeleton
                  height={Math.max(20, ((effectiveHeight - 70) * pct) / 100)}
                  width="100%"
                  borderRadius={3}
                  baseColor="#E2E8F0"
                  highlightColor="#F8FAFC"
                />
                <Skeleton height={10} width="85%" borderRadius={2} baseColor="#E2E8F0" highlightColor="#F8FAFC" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "bar":
    default: {
      const heightsBar = [60, 85, 45, 95, 70, 40, 80];
      return (
        <div style={{ height: effectiveHeight, width, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "16px 20px 8px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: effectiveHeight - 48, gap: 14 }}>
            {heightsBar.map((pct, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 }}>
                <Skeleton
                  height={Math.max(20, ((effectiveHeight - 70) * pct) / 100)}
                  width="100%"
                  borderRadius={4}
                  baseColor="#E2E8F0"
                  highlightColor="#F8FAFC"
                />
                <Skeleton height={11} width="75%" borderRadius={2} baseColor="#E2E8F0" highlightColor="#F8FAFC" />
              </div>
            ))}
          </div>
        </div>
      );
    }
  }
};

export default LazyChartSkeleton;
