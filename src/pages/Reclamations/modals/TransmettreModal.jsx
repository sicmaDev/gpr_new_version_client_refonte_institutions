import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SendIcon from "@mui/icons-material/Send";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";

const TransmettreModal = ({ open, onClose, onConfirm, loading }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ style: { borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" } }}
    >
      {/* Header */}
      <div style={{ background: "var(--gpr-primary, #005081)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SendIcon style={{ color: "white", fontSize: 19 }} />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>Transmettre le dossier</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 }}>Transmission au pilote</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CloseIcon style={{ color: "white", fontSize: 18 }} />
        </button>
      </div>

      <DialogContent style={{ padding: "24px", background: "#fafafa" }}>
        {/* Bloc alerte */}
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, marginBottom: 24 }}>
          <InfoOutlinedIcon style={{ color: "#3b82f6", fontSize: 20, flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 13.5, color: "#1e40af", lineHeight: 1.6 }}>
            En transmettant ce dossier, vous <strong>perdrez tout droit de traitement</strong> sur cette réclamation.
            Cette action ne peut pas être annulée.
          </p>
        </div>

        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20, marginTop: 0 }}>
          Confirmez-vous la transmission de cette réclamation au pilote ?
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", fontSize: 13.5, fontWeight: 600, color: "#6b7280", cursor: "pointer" }}>
            Annuler
          </button>
          <LoadingButton
            onClick={onConfirm}
            loading={loading}
            loadingPosition="end"
            endIcon={<SendIcon />}
            variant="contained"
            style={{ flex: 2, borderRadius: 10, textTransform: "none", fontWeight: 700, fontSize: 13.5, background: "var(--gpr-primary, #005081)" }}
          >
            <span>Confirmer la transmission</span>
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransmettreModal;
