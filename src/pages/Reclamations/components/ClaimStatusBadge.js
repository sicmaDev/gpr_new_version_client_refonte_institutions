import React from "react";
import { Chip } from "@mui/material";

/**
 * Badge de statut unifié pour les réclamations
 * Remplace les classes Materialize CSS par des MUI Chip cohérents
 */

const STATUS_CONFIG = {
  SAVED: {
    label: "À traiter",
    bg: "#DBEAFE",
    color: "#1D4ED8",
    border: "#93C5FD",
  },
  TEMP_SAVED: {
    label: "Sauvegardée",
    bg: "#EDE9FE",
    color: "#5B21B6",
    border: "#C4B5FD",
  },
  AFFECTED: {
    label: "Affectée",
    bg: "#FEF3C7",
    color: "#92400E",
    border: "#FCD34D",
  },
  TO_APPROUVED: {
    label: "À approuver",
    bg: "#F3E8FF",
    color: "#6B21A8",
    border: "#D8B4FE",
  },
  DESAPPROUVED: {
    label: "Désapprouvée",
    bg: "#FEE2E2",
    color: "#991B1B",
    border: "#FCA5A5",
  },
  TREAT: {
    label: "Traitée",
    bg: "#D1FAE5",
    color: "#065F46",
    border: "#6EE7B7",
  },
  SATISFIED: {
    label: "Satisfait",
    bg: "#ECFDF5",
    color: "#047857",
    border: "#A7F3D0",
  },
  UNSATISFIED: {
    label: "Non satisfait",
    bg: "#FFF1F2",
    color: "#9F1239",
    border: "#FECDD3",
  },
  PARTIAL_SATISFIED: {
    label: "Part. satisfait",
    bg: "#FFF7ED",
    color: "#9A3412",
    border: "#FDBA74",
  },
  LITIGATION: {
    label: "Contentieux",
    bg: "#F5F3FF",
    color: "#4C1D95",
    border: "#C4B5FD",
  },
  CLASSED: {
    label: "Classée",
    bg: "#F3F4F6",
    color: "#374151",
    border: "#D1D5DB",
  },
};

const ClaimStatusBadge = ({ status, size = "small" }) => {
  const cfg = STATUS_CONFIG[status] || {
    label: status || "-",
    bg: "#F3F4F6",
    color: "#374151",
    border: "#D1D5DB",
  };

  return (
    <Chip
      label={cfg.label}
      size={size}
      sx={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontWeight: 600,
        fontSize: "0.72rem",
        letterSpacing: "0.01em",
        height: "22px",
        "& .MuiChip-label": { px: 1.2 },
      }}
    />
  );
};

export default ClaimStatusBadge;
export { STATUS_CONFIG };
