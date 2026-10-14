import React from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import RecorderControls from "../recorder-controls";

// Fenêtre d'enregistrement vocal commune à l'enregistrement des réclamations, dénonciations et suggestions.
// Même style que les autres fenêtres de la refonte : bandeau aux couleurs du thème, contenu sobre.
const VoiceRecorderDialog = ({ open, onClose, title, recorderState, handlers }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
    <div style={{
      background: "linear-gradient(135deg, var(--gpr-primary-dark) 0%, var(--gpr-primary) 100%)",
      padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MicIcon style={{ color: "#fff", fontSize: 20 }} />
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{title}</div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>Enregistrement vocal</div>
        </div>
      </div>
      <IconButton onClick={onClose} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
        <CloseIcon style={{ fontSize: 16 }} />
      </IconButton>
    </div>
    <DialogContent sx={{ p: 3, textAlign: "center" }}>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 8 }}>
        Cliquez sur le micro et parlez, ou branchez un casque ou des écouteurs.
      </div>
      <section className="voice-recorder">
        <div className="recorder-container">
          <RecorderControls recorderState={recorderState} handlers={handlers} closeAction={onClose} />
        </div>
      </section>
    </DialogContent>
  </Dialog>
);

export default VoiceRecorderDialog;
