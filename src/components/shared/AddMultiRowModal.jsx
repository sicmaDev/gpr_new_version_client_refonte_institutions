import React, { useState, useCallback } from "react";
import {
  Dialog, DialogContent, DialogActions,
  Button, IconButton, Tooltip, CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

/**
 * AddMultiRowModal — Option A : lignes empilées
 * Pour les pages simples avec 2-3 champs (Langues, Catégories, Objets, Solutions…)
 *
 * Props :
 *   open          : bool
 *   onClose       : () => void
 *   title         : string
 *   fields        : [{ key, label, placeholder?, required?, type?, width? }]
 *   onSubmit      : async (rows: object[]) => void   — appelé avec les lignes valides uniquement
 *   loading       : bool
 *   maxWidth      : "xs"|"sm"|"md"|"lg"|"xl"  (défaut "md")
 */

const EMPTY_ROW = (fields) =>
  Object.fromEntries(fields.map((f) => [f.key, ""]));

const AddMultiRowModal = ({
  open,
  onClose,
  title = "Ajouter des éléments",
  fields = [],
  onSubmit,
  loading = false,
  maxWidth = "md",
}) => {
  const [rows, setRows] = useState([EMPTY_ROW(fields)]);
  const [errors, setErrors] = useState([{}]);

  const resetState = useCallback(() => {
    setRows([EMPTY_ROW(fields)]);
    setErrors([{}]);
  }, [fields]);

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose();
  };

  const addRow = () => {
    setRows((prev) => [...prev, EMPTY_ROW(fields)]);
    setErrors((prev) => [...prev, {}]);
  };

  const removeRow = (idx) => {
    if (rows.length === 1) { resetState(); return; }
    setRows((prev) => prev.filter((_, i) => i !== idx));
    setErrors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (idx, key, value) => {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r));
    setErrors((prev) => prev.map((e, i) => i === idx ? { ...e, [key]: "" } : e));
  };

  const validateRow = (row) => {
    const errs = {};
    for (const f of fields) {
      if (f.required && !String(row[f.key] ?? "").trim()) {
        errs[f.key] = "Champ requis";
      }
    }
    return errs;
  };

  const validRows = rows.filter((r) => {
    const firstRequired = fields.find((f) => f.required);
    return firstRequired ? String(r[firstRequired.key] ?? "").trim() !== "" : true;
  });

  const handleSubmit = async () => {
    const newErrors = rows.map(validateRow);
    const hasError = newErrors.some((e) => Object.keys(e).length > 0);
    if (hasError) { setErrors(newErrors); return; }
    if (validRows.length === 0) return;
    await onSubmit(validRows);
    resetState();
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
        background: "var(--gpr-primary, #005081)",
        padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AddIcon style={{ color: "#fff", fontSize: 20 }} />
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{title}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 2 }}>
              Remplissez chaque ligne — seules les lignes avec un {fields.find(f => f.required)?.label?.toLowerCase() || "nom"} seront enregistrées
            </div>
          </div>
        </div>
        <IconButton onClick={handleClose} disabled={loading} size="small"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
          <CloseIcon style={{ fontSize: 16 }} />
        </IconButton>
      </div>

      <DialogContent sx={{ p: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ width: 36, padding: "10px 8px 10px 16px", color: "#94a3b8", fontSize: 11, fontWeight: 700, textAlign: "center" }}>#</th>
                {fields.map((f) => (
                  <th key={f.key} style={{
                    padding: "10px 8px", textAlign: "left",
                    fontSize: 11, fontWeight: 700, color: "#64748b",
                    textTransform: "uppercase", letterSpacing: "0.5px",
                    minWidth: f.width || 140,
                  }}>
                    {f.label}{f.required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
                  </th>
                ))}
                <th style={{ width: 44, padding: "10px 16px 10px 8px" }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} style={{
                  borderBottom: "1px solid #f1f5f9",
                  background: idx % 2 === 0 ? "#fff" : "#fafafa",
                }}>
                  <td style={{ padding: "8px 8px 8px 16px", textAlign: "center", color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>
                    {idx + 1}
                  </td>
                  {fields.map((f) => (
                    <td key={f.key} style={{ padding: "8px" }}>
                      <input
                        type={f.type || "text"}
                        value={row[f.key]}
                        onChange={(e) => handleChange(idx, f.key, e.target.value)}
                        placeholder={f.placeholder || f.label}
                        style={{
                          width: "100%", boxSizing: "border-box",
                          border: errors[idx]?.[f.key] ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                          borderRadius: 8, padding: "7px 10px",
                          fontSize: 13, outline: "none",
                          background: "#fff", color: "#1e293b",
                          transition: "border-color 0.15s",
                        }}
                        onFocus={(e) => { if (!errors[idx]?.[f.key]) e.target.style.borderColor = "var(--gpr-primary, #005081)"; }}
                        onBlur={(e) => { if (!errors[idx]?.[f.key]) e.target.style.borderColor = "#e2e8f0"; }}
                      />
                      {errors[idx]?.[f.key] && (
                        <div style={{ fontSize: 10.5, color: "#ef4444", marginTop: 2 }}>
                          {errors[idx][f.key]}
                        </div>
                      )}
                    </td>
                  ))}
                  <td style={{ padding: "8px 16px 8px 8px", textAlign: "center" }}>
                    <Tooltip title="Supprimer cette ligne">
                      <IconButton onClick={() => removeRow(idx)} size="small"
                        style={{ color: "#ef4444", opacity: 0.6 }}
                        sx={{ "&:hover": { opacity: 1, background: "#fee2e2" } }}>
                        <DeleteOutlineIcon style={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ajouter une ligne */}
        <div style={{ padding: "12px 16px" }}>
          <button
            onClick={addRow}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "1.5px dashed #c7d2fe",
              borderRadius: 8, padding: "7px 14px",
              color: "var(--gpr-primary, #005081)", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.borderColor = "var(--gpr-primary, #005081)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
          >
            <AddIcon style={{ fontSize: 15 }} /> Ajouter une ligne
          </button>
        </div>
      </DialogContent>

      <DialogActions style={{
        padding: "12px 20px 16px",
        borderTop: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 12.5, color: "#64748b", fontWeight: 600 }}>
          {validRows.length} ligne{validRows.length !== 1 ? "s" : ""} valide{validRows.length !== 1 ? "s" : ""}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={handleClose} disabled={loading}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || validRows.length === 0}
            variant="contained"
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{
              textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3,
              background: "var(--gpr-primary, #005081)",
              "&:hover": { background: "var(--gpr-primary-dark, #003d63)" },
              "&.Mui-disabled": { opacity: 0.6 },
            }}>
            {loading ? "Enregistrement..." : `Enregistrer (${validRows.length})`}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default AddMultiRowModal;
