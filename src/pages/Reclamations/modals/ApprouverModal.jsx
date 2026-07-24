import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import CloseIcon from "@mui/icons-material/Close";

const ApprouverModal = ({
  open, onClose,
  solution, motif, onMotifChange,
  onApprove, onDisapprove,
  loadingApprove, loadingDisapprove,
  errors,
}) => {
  const solutionItem = solution?.[0];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ style: { borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" } }}
    >
      {/* Header */}
      <div style={{ background: "var(--gpr-primary, #005081)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircleOutlineIcon style={{ color: "white", fontSize: 22 }} />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>Approbation de la solution</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>Valider ou rejeter la solution proposée</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CloseIcon style={{ color: "white", fontSize: 18 }} />
        </button>
      </div>

      <DialogContent style={{ padding: "24px", background: "#fafafa" }}>
        {/* Solution proposée */}
        {solutionItem && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <RecordVoiceOverIcon style={{ fontSize: 15, color: "#059669" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.6px" }}>Solution proposée</span>
            </div>
            <div style={{ background: "white", border: "1px solid #d1fae5", borderLeft: "3px solid #059669", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, color: "#1f2937", lineHeight: 1.6 }}>
              {solutionItem.content}
            </div>
            {solutionItem.commentaire && (
              <div style={{ marginTop: 10, background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Commentaire</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{solutionItem.commentaire}</div>
              </div>
            )}
          </div>
        )}

        {/* Motif désapprobation */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Motif de désapprobation
            <span style={{ color: "#9ca3af", fontWeight: 400, textTransform: "none", marginLeft: 6 }}>(requis si vous désapprouvez)</span>
          </label>
          <textarea
            style={{ width: "100%", minHeight: 90, padding: "10px 12px", borderRadius: 10, border: errors?.motif ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb", fontSize: 13, resize: "vertical", background: "white", outline: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5 }}
            value={motif || ""}
            onChange={(e) => onMotifChange(e.target.value)}
            placeholder="Précisez pourquoi vous désapprouvez cette solution..."
          />
          {errors?.motif && (
            <span style={{ fontSize: 11, color: "#ef4444", display: "block", marginTop: 3 }}>{errors.motif}</span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", fontSize: 13, fontWeight: 600, color: "#6b7280", cursor: "pointer" }}>
            Annuler
          </button>
          <LoadingButton
            onClick={onDisapprove}
            loading={loadingDisapprove}
            loadingPosition="start"
            startIcon={<ThumbDownIcon />}
            variant="contained"
            color="error"
            style={{ flex: 1, borderRadius: 10, textTransform: "none", fontWeight: 700, fontSize: 13 }}
          >
            <span>Désapprouver</span>
          </LoadingButton>
          <LoadingButton
            onClick={onApprove}
            loading={loadingApprove}
            loadingPosition="start"
            startIcon={<ThumbUpIcon />}
            variant="contained"
            style={{ flex: 1, borderRadius: 10, textTransform: "none", fontWeight: 700, fontSize: 13, background: "linear-gradient(135deg, #065f46 0%, #059669 100%)" }}
          >
            <span>Approuver</span>
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprouverModal;
