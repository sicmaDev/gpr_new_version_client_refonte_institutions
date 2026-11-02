import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { useChargementPage } from "../../Utils/chargementPage";

// Indicateur de chargement qui tourne (même rendu partout dans l'application).
export const ChargementRond = ({ taille = 24, couleur = "#94A3B8", hauteur }) => (
  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: hauteur || taille, verticalAlign: "middle" }}>
    <CircularProgress size={taille} thickness={5} sx={{ color: couleur }} />
  </Box>
);

// Chiffre d'une carte KPI : l'indicateur tourne pendant que la page charge ou s'actualise.
// chargement : état fourni par la page ; s'il est absent, on suit le voile de chargement de la page (KTApp.blockPage).
export const ValeurKpi = ({ valeur, chargement, couleur, taille = 24, hauteur = "1.87rem" }) => {
  const pageCharge = useChargementPage();
  const enCours = chargement ?? pageCharge;
  return enCours ? <ChargementRond taille={taille} couleur={couleur} hauteur={hauteur} /> : <>{valeur}</>;
};
