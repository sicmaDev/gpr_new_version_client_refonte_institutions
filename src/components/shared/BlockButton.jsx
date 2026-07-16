import React, { useState } from "react";
import BlockIcon from "@mui/icons-material/Block";

/**
 * Wrapper autour d'un bouton désactivé.
 * Quand l'utilisateur clique sur un bouton disabled, affiche brièvement
 * une icône d'interdiction en overlay.
 */
const BlockButton = ({ children, disabled, style }) => {
  const [blocked, setBlocked] = useState(false);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        cursor: disabled ? "not-allowed" : "default",
        ...style,
      }}
      onClick={() => {
        if (disabled) {
          setBlocked(true);
          setTimeout(() => setBlocked(false), 900);
        }
      }}
    >
      {children}
      {blocked && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(239,68,68,0.13)",
            borderRadius: 8,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <BlockIcon style={{ color: "#ef4444", fontSize: 20 }} />
        </span>
      )}
    </span>
  );
};

export default BlockButton;
