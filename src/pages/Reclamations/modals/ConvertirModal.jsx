import React from "react";
import { Dialog, DialogContent, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";

const ALL_TYPES = [
  { type: "dénonciation", label: "Dénonciation", desc: "Signalement d'un abus ou d'une infraction", icon: <AnnouncementIcon style={{ fontSize: 22, color: "#dc2626" }} />, bg: "#fef2f2", border: "#fecaca" },
  { type: "suggestion",   label: "Suggestion",   desc: "Proposition d'amélioration d'un service",  icon: <LightbulbIcon   style={{ fontSize: 22, color: "#d97706" }} />, bg: "#fffbeb", border: "#fde68a" },
];

const ConvertirModal = ({
  open, onClose,
  onSelectType,
  confirmOpen, convertionType,
  onConfirmClose, onSubmitConfirmation,
  loading,
  types,        // ex: ["suggestion"] pour n'afficher que Suggestion
  dossierLabel, // ex: "dénonciation" pour adapter le texte
}) => {
  const visibleTypes = types ? ALL_TYPES.filter(o => types.includes(o.type)) : ALL_TYPES;
  return (
    <>
      {/* Étape 1 : choix du type */}
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
        PaperProps={{ style: { borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" } }}
      >
        <div style={{ background: "var(--gpr-primary, #005081)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AutorenewIcon style={{ color: "white", fontSize: 20 }} />
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>Convertir le dossier</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>Choisissez le nouveau type</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CloseIcon style={{ color: "white", fontSize: 18 }} />
          </button>
        </div>

        <DialogContent style={{ padding: "24px", background: "#fafafa" }}>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20, marginTop: 0 }}>
            Ce{dossierLabel ? "tte " + dossierLabel : "tte réclamation"} sera convertie et transférée vers la section correspondante.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visibleTypes.map(opt => (
              <button
                key={opt.type}
                onClick={() => onSelectType(opt.type)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: opt.bg, border: `1.5px solid ${opt.border}`, borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "transform 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ width: 42, height: 42, background: "white", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                  {opt.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Étape 2 : confirmation */}
      <Dialog open={confirmOpen} onClose={onConfirmClose} maxWidth="xs" fullWidth
        PaperProps={{ style: { borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" } }}
        sx={{ "& .MuiBackdrop-root": { background: "rgba(0,0,0,0.5) !important" } }}
      >
        <div style={{ background: "#fff7ed", padding: "20px 24px", borderBottom: "1px solid #fed7aa", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "#ffedd5", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <WarningAmberIcon style={{ color: "#ea580c", fontSize: 22 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#9a3412" }}>Action irréversible</div>
            <div style={{ fontSize: 12, color: "#c2410c", marginTop: 2 }}>Cette action ne peut pas être annulée</div>
          </div>
        </div>

        <DialogContent style={{ padding: "24px" }}>
          <Typography style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6 }}>
            Une fois convertie en <strong style={{ color: "#ea580c" }}>{convertionType}</strong>, cette réclamation
            ne pourra plus être modifiée ou restaurée. Souhaitez-vous vraiment continuer ?
          </Typography>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button
              disabled={loading}
              onClick={onConfirmClose}
              style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", fontSize: 13.5, fontWeight: 600, color: "#6b7280", cursor: "pointer" }}
            >
              Annuler
            </button>
            <LoadingButton
              onClick={onSubmitConfirmation}
              loading={loading}
              loadingPosition="end"
              variant="contained"
              color="error"
              style={{ flex: 2, borderRadius: 10, textTransform: "none", fontWeight: 700, fontSize: 13.5 }}
            >
              <span>Oui, convertir</span>
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConvertirModal;
