import React from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BlockIcon from "@mui/icons-material/Block";

// Message affiché à la place du formulaire de traitement quand la personne n'a pas la main sur le dossier.
// tone « warn » : information (ambre) ; tone « danger » : interdiction (rouge). Style des bannières de la refonte.
const TONES = {
  warn:   { bg: "#FFFBEB", border: "#FDE68A", accent: "#F59E0B", color: "#92400E", Icon: InfoOutlinedIcon },
  danger: { bg: "#FEF2F2", border: "#FECACA", accent: "#EF4444", color: "#991B1B", Icon: BlockIcon },
};

const TreatNotice = ({ tone = "warn", children }) => {
  const { bg, border, accent, color, Icon } = TONES[tone] || TONES.warn;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, background: bg, border: `1px solid ${border}`,
      borderLeft: `4px solid ${accent}`, borderRadius: 10, padding: "12px 14px", margin: "4px 0 12px",
    }}>
      <Icon style={{ fontSize: 20, color: accent, flexShrink: 0 }} />
      <span style={{ fontSize: "0.85rem", fontWeight: 600, color, lineHeight: 1.45 }}>{children}</span>
    </div>
  );
};

export default TreatNotice;
