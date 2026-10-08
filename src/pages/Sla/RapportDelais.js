import React from "react";
import { Typography } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import SlaIndicateursTab from "./SlaIndicateursTab";
import { OutlineButton } from "./slaUi";

// Rapport « Respect des délais » : indicateurs de l'utilisateur (son périmètre), par risque, mois, agence, agent,
// catégorie et objet. Export des tableaux en CSV (s'ouvre dans Excel) et impression / PDF par le navigateur.
const RapportDelais = () => (
  <div style={{ padding: "28px clamp(16px, 4vw, 48px)", maxWidth: 1300, margin: "0 auto" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
      <div>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Respect des délais</Typography>
        <Typography sx={{ fontSize: 13, color: "#94a3b8", mt: 0.3 }}>
          Délais de prise en charge, de résolution et de clôture, conformité réglementaire, remontées et motifs de retard
        </Typography>
      </div>
      <OutlineButton startIcon={<PrintIcon />} onClick={() => window.print()}>Imprimer / PDF</OutlineButton>
    </div>
    <SlaIndicateursTab />
  </div>
);

export default RapportDelais;
