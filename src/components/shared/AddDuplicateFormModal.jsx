import React, { useState, useCallback } from "react";
import {
  Dialog, DialogContent, DialogActions,
  Button, IconButton, Tooltip, CircularProgress, Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import BlockButton from "./BlockButton";

/**
 * AddDuplicateFormModal
 * Chaque clic "Ajouter" duplique le formulaire en dessous (vide).
 * Chaque instance est indépendante.
 *
 * Props :
 *   open          : bool
 *   onClose       : () => void
 *   title         : string
 *   fields        : [{ key, label, placeholder?, required?, type?, fullWidth?,
 *                      render?: (value, onChange, formIndex) => ReactNode }]
 *   onSubmit      : async (forms: object[]) => void  — toutes les formes valides
 *   loading       : bool
 *   maxWidth      : "xs"|"sm"|"md"|"lg"|"xl"  (défaut "md")
 *   addLabel      : string  (défaut "Ajouter un autre")
 */

const EMPTY_FORM = (fields) =>
  Object.fromEntries(fields.map((f) => [f.key, ""]));

const EMPTY_ERRORS = (fields) =>
  Object.fromEntries(fields.map((f) => [f.key, ""]));

const AddDuplicateFormModal = ({
  open,
  onClose,
  title = "Ajouter",
  fields = [],
  onSubmit,
  loading = false,
  maxWidth = "md",
  addLabel = "Ajouter un autre",
}) => {
  const [forms, setForms] = useState([EMPTY_FORM(fields)]);
  const [errors, setErrors] = useState([EMPTY_ERRORS(fields)]);

  const reset = useCallback(() => {
    setForms([EMPTY_FORM(fields)]);
    setErrors([EMPTY_ERRORS(fields)]);
  }, [fields]);

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  // Dupliquer le formulaire (vide)
  const addForm = () => {
    setForms((prev) => [...prev, EMPTY_FORM(fields)]);
    setErrors((prev) => [...prev, EMPTY_ERRORS(fields)]);
  };

  // Supprimer une instance
  const removeForm = (idx) => {
    if (forms.length === 1) { reset(); return; }
    setForms((prev) => prev.filter((_, i) => i !== idx));
    setErrors((prev) => prev.filter((_, i) => i !== idx));
  };

  // Modifier un champ d'une instance
  const handleChange = (formIdx, key, value) => {
    setForms((prev) =>
      prev.map((f, i) => i === formIdx ? { ...f, [key]: value } : f)
    );
    setErrors((prev) =>
      prev.map((e, i) => i === formIdx ? { ...e, [key]: "" } : e)
    );
  };

  // Valider une instance
  const validateForm = (form) => {
    const errs = {};
    for (const f of fields) {
      if (f.required && !String(form[f.key] ?? "").trim()) {
        errs[f.key] = "Champ requis";
      }
    }
    return errs;
  };

  // Formulaires valides (au moins le champ requis rempli)
  const getValidForms = () =>
    forms.filter((form) => {
      const requiredField = fields.find((f) => f.required);
      return requiredField
        ? String(form[requiredField.key] ?? "").trim() !== ""
        : true;
    });

  const handleSubmit = async () => {
    // Valider toutes les instances non vides
    const newErrors = forms.map(validateForm);
    const hasError = newErrors.some((e) => Object.values(e).some(Boolean));
    if (hasError) { setErrors(newErrors); return; }

    const valid = getValidForms();
    if (valid.length === 0) return;

    await onSubmit(valid);
    reset();
  };

  const validCount = getValidForms().length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}
    >
      {/* ── Header ── */}
      <div style={{
        background: "var(--gpr-primary, #005081)",
        padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
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
              {forms.length} formulaire{forms.length > 1 ? "s" : ""},
              cliquez sur <strong style={{ color: "#fff" }}>"{addLabel}"</strong> pour en ajouter un autre
            </div>
          </div>
        </div>
        <IconButton
          onClick={handleClose} disabled={loading} size="small"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}
        >
          <CloseIcon style={{ fontSize: 16 }} />
        </IconButton>
      </div>

      {/* ── Contenu scrollable ── */}
      <DialogContent sx={{ p: 0, overflowY: "auto", maxHeight: "65vh" }}>
        {forms.map((form, formIdx) => (
          <React.Fragment key={formIdx}>
            {/* Séparateur entre instances */}
            {formIdx > 0 && (
              <Divider sx={{ mx: 3 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#94a3b8",
                  background: "#f8fafc", padding: "2px 10px", borderRadius: 20,
                }}>
                  Formulaire {formIdx + 1}
                </span>
              </Divider>
            )}

            {/* Instance de formulaire */}
            <div style={{
              padding: "20px 24px",
              background: formIdx % 2 === 0 ? "#fff" : "#fafbff",
              position: "relative",
            }}>
              {/* Numéro + bouton supprimer */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 16,
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: "var(--gpr-primary, #005081)",
                  background: "#eef2ff", borderRadius: 20,
                  padding: "3px 12px",
                }}>
                  {formIdx === 0 ? "Premier élément" : `Élément ${formIdx + 1}`}
                </span>
                {forms.length > 1 && (
                  <Tooltip title="Supprimer ce formulaire">
                    <IconButton
                      onClick={() => removeForm(formIdx)}
                      size="small"
                      style={{ color: "#ef4444" }}
                      sx={{ "&:hover": { background: "#fee2e2" } }}
                    >
                      <DeleteOutlineIcon style={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </div>

              {/* Grille des champs */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 14,
              }}>
                {fields.map((f) => (
                  <div
                    key={f.key}
                    style={{ gridColumn: f.fullWidth ? "1 / -1" : undefined }}
                  >
                    <label style={{
                      display: "block", fontSize: 12, fontWeight: 700,
                      color: "#475569", marginBottom: 5,
                      textTransform: "uppercase", letterSpacing: "0.4px",
                    }}>
                      {f.label}
                      {f.required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
                    </label>

                    {f.render ? (
                      f.render(form[f.key], (val) => handleChange(formIdx, f.key, val), formIdx)
                    ) : f.type === "textarea" ? (
                      <textarea
                        value={form[f.key]}
                        onChange={(e) => handleChange(formIdx, f.key, e.target.value)}
                        placeholder={f.placeholder || f.label}
                        rows={3}
                        style={{
                          width: "100%", boxSizing: "border-box", resize: "vertical",
                          border: errors[formIdx]?.[f.key]
                            ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                          borderRadius: 9, padding: "9px 12px",
                          fontSize: 13, outline: "none",
                          background: "#fff", color: "#1e293b",
                          whiteSpace: "pre-wrap", wordBreak: "break-word",
                          fontFamily: "inherit",
                        }}
                        onFocus={(e) => { if (!errors[formIdx]?.[f.key]) e.target.style.borderColor = "var(--gpr-primary, #005081)"; }}
                        onBlur={(e) => { if (!errors[formIdx]?.[f.key]) e.target.style.borderColor = "#e2e8f0"; }}
                      />
                    ) : (
                      <input
                        type={f.type || "text"}
                        value={form[f.key]}
                        onChange={(e) => handleChange(formIdx, f.key, e.target.value)}
                        placeholder={f.placeholder || f.label}
                        style={{
                          width: "100%", boxSizing: "border-box",
                          border: errors[formIdx]?.[f.key]
                            ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                          borderRadius: 9, padding: "10.5px 14px",
                          fontSize: 14, outline: "none",
                          background: "#fff", color: "#1e293b",
                          transition: "border-color 0.15s",
                          height: 40,
                        }}
                        onFocus={(e) => { if (!errors[formIdx]?.[f.key]) e.target.style.borderColor = "var(--gpr-primary, #005081)"; }}
                        onBlur={(e) => { if (!errors[formIdx]?.[f.key]) e.target.style.borderColor = "#e2e8f0"; }}
                      />
                    )}

                    {errors[formIdx]?.[f.key] && (
                      <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>
                        {errors[formIdx][f.key]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </React.Fragment>
        ))}

        {/* ── Bouton dupliquer ── */}
        <div style={{ padding: "12px 24px 16px" }}>
          <button
            onClick={addForm}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              width: "100%", justifyContent: "center",
              background: "none", border: "1.5px dashed #c7d2fe",
              borderRadius: 10, padding: "10px",
              color: "var(--gpr-primary, #005081)", fontSize: 13, fontWeight: 700,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#eef2ff";
              e.currentTarget.style.borderColor = "var(--gpr-primary, #005081)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.borderColor = "#c7d2fe";
            }}
          >
            <AddIcon style={{ fontSize: 16 }} />
            {addLabel}
          </button>
        </div>
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions style={{
        padding: "12px 20px 16px",
        borderTop: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 12.5, color: "#64748b", fontWeight: 600 }}>
          {validCount > 0
            ? `${validCount} élément${validCount > 1 ? "s" : ""} prêt${validCount > 1 ? "s" : ""} à enregistrer`
            : "Remplissez au moins un formulaire"}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <BlockButton disabled={loading}>
            <Button
              onClick={handleClose} disabled={loading}
              variant="outlined"
              sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}
            >
              Annuler
            </Button>
          </BlockButton>
          <BlockButton disabled={loading || validCount === 0}>
            <Button
              onClick={handleSubmit}
              disabled={loading || validCount === 0}
              variant="contained"
              startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SaveIcon style={{ fontSize: 15 }} />}
              sx={{
                textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3,
                background: "var(--gpr-primary, #005081)",
                "&:hover": { background: "var(--gpr-primary-dark, #003d63)" },
                "&.Mui-disabled": { opacity: 0.6 },
              }}
            >
              {loading ? "Enregistrement..." : `Enregistrer (${validCount})`}
            </Button>
          </BlockButton>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default AddDuplicateFormModal;
