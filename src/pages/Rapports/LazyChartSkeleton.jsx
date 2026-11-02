import React from "react";
import { ChargementRond } from "../../components/shared/ChargementRond";

/**
 * LazyChartSkeleton
 *
 * Affiche un indicateur de chargement qui tourne pendant que les données du graphique ne sont pas encore arrivées.
 * type : "pie" | "line" | "bar" (gardé pour les appels existants)
 * height : hauteur réservée (plafonnée pour ne pas laisser une grande zone vide)
 */
const LazyChartSkeleton = ({ height = 400, width = "100%" }) => (
  <div style={{ height: Math.min(height, 320), width, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <ChargementRond taille={36} couleur="#94A3B8" />
  </div>
);

export default LazyChartSkeleton;
