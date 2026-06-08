import React, { useState, useCallback } from "react";
import {
  Dialog, DialogContent, DialogActions,
  Button, IconButton, Tooltip, CircularProgress,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

/**
 * AddFormPreviewModal — Option B : Formulaire + liste de preview
 * Pour les pages avec 4-6 champs (PointsServices, Postes…)
 *
 * Props :
 *   open          : bool
 *   onClose       : () => void
 *   title         : string
 *   fields        : [{ key, label, placeholder?, required?, type?, fullWidth?,
 *                      render?: (value, onChange) => ReactNode }]
 *                     render = pour les champs Select/custom (react-select, etc.)
 *   onSubmit      : async (items: object[]) => void
 *   loading       : bool
 *   maxWidth      : "xs"|"sm"|"md"|"lg"|"xl"  (défaut "sm")
 *   previewLabel  : (item) => string   — texte affiché dans la preview
 */

const EMPTY_FORM = (fields) =>
  Object.fromEntries(fields.map((f) => [f.key, ""]));

const AddFormPreviewModal = ({
  open,
  onClose,
  title = "Ajouter",
  fields = [],
  onSubmit,
  loading = false,
  maxWidth = "sm",
  previewLabel = (item) => item[Object.keys(item)[0]] || "—",
}) => {
  const [form, setForm] = useState(EMPTY_FORM(fields));
  const [formErrors, setFormErrors] = useState({});
  const [queue, setQueue] = useState([]);

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM(fields));
    setFormErrors({});
  }, [fields]);

  const handleClose = () => {
    if (loading) return;
    resetForm();
    setQueue([]);
    onClose();
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const errs = {};
    for (const f of fields) {
      if (f.required && !String(form[f.key] ?? "").trim()) {
        errs[f.key] = "Champ requis";
      }
    }
    return errs;
  };

  const handleAddToQueue = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setQueue((prev) => [...prev, { ...form }]);
    resetForm();
  };

  const removeFromQueue = (idx) => {
    setQueue((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (queue.length === 0) return;
    await onSubmit(queue);
    resetForm();
    setQueue([]);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}
    >
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e2188 0%, #3b3fd8 100%)",
        padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <PlaylistAddIcon style={{ color: "#fff", fontSize: 20 }} />
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{title}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 2 }}>
              Ajoutez des éléments à la liste avant d'enregistrer
            </div>
          </div>
        </div>
        <IconButton onClick={handleClose} disabled={loading} size="small"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
          <CloseIcon style={{ fontSize: 16 }} />
        </IconButton>
      </div>

      <DialogContent sx={{ p: 3 }}>
        {/* Formulaire */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}>
          {fields.map((f) => (
            <div key={f.key} style={{ gridColumn: f.fullWidth ? "1 / -1" : undefined }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 700,
                color: "#475569", marginBottom: 5,
                textTransform: "uppercase", letterSpacing: "0.4px",
              }}>
                {f.label}{f.required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
              </label>
              {f.render ? (
                f.render(form[f.key], (val) => handleChange(f.key, val))
              ) : (
                <input
                  type={f.type || "text"}
                  value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder || f.label}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    border: formErrors[f.key] ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                    borderRadius: 9, padding: "9px 12px",
                    fontSize: 13, outline: "none",
                    background: "#fff", color: "#1e293b",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => { if (!formErrors[f.key]) e.target.style.borderColor = "#3b3fd8"; }}
                  onBlur={(e) => { if (!formErrors[f.key]) e.target.style.borderColor = "#e2e8f0"; }}
                />
              )}
              {formErrors[f.key] && (
                <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>
                  {formErrors[f.key]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bouton ajouter à la liste */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button
            onClick={handleAddToQueue}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#eef2ff", border: "1.5px solid #c7d2fe",
              borderRadius: 9, padding: "8px 18px",
              color: "#3b3fd8", fontSize: 13, fontWeight: 700,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#e0e7ff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#eef2ff"; }}
          >
            <AddIcon style={{ fontSize: 15 }} /> Ajouter à la liste
          </button>
        </div>

        {/* Preview liste */}
        {queue.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              À enregistrer ({queue.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {queue.map((item, idx) => (
                <div key={idx} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  borderRadius: 9, padding: "9px 12px",
                }}>
                  <CheckCircleOutlineIcon style={{ fontSize: 16, color: "#16a34a", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                    {previewLabel(item)}
                  </span>
                  <Tooltip title="Retirer">
                    <IconButton onClick={() => removeFromQueue(idx)} size="small"
                      style={{ color: "#ef4444", opacity: 0.6 }}
                      sx={{ "&:hover": { opacity: 1, background: "#fee2e2" } }}>
                      <DeleteOutlineIcon style={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>

      <DialogActions style={{
        padding: "12px 20px 16px",
        borderTop: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 12.5, color: "#64748b", fontWeight: 600 }}>
          {queue.length > 0
            ? `${queue.length} élément${queue.length > 1 ? "s" : ""} prêt${queue.length > 1 ? "s" : ""}`
            : "Aucun élément ajouté"}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={handleClose} disabled={loading}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || queue.length === 0}
            variant="contained"
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{
              textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3,
              background: "linear-gradient(135deg, #1e2188, #3b3fd8)",
              "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" },
              "&.Mui-disabled": { opacity: 0.6 },
            }}>
            {loading ? "Enregistrement..." : `Enregistrer (${queue.length})`}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default AddFormPreviewModal;
