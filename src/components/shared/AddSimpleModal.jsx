import React, { useState, useCallback } from "react";
import {
  Dialog, DialogContent, DialogActions,
  Button, IconButton, CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SaveIcon from "@mui/icons-material/Save";

/**
 * AddSimpleModal — Option C : Formulaire simple + "Enregistrer et ajouter un autre"
 * Pour les pages complexes avec beaucoup de champs (Utilisateurs, Postes…)
 *
 * Props :
 *   open          : bool
 *   onClose       : () => void
 *   title         : string
 *   children      : ReactNode  — le contenu du formulaire (champs, selects, etc.)
 *                               le parent gère entièrement les champs via Redux ou state local
 *   onSubmit      : async () => void        — enregistrer et fermer
 *   onSubmitAndAdd: async () => void        — enregistrer et vider le formulaire pour un autre ajout
 *   loading       : bool
 *   loadingAdd    : bool                    — loading spécifique au bouton "et ajouter"
 *   maxWidth      : "xs"|"sm"|"md"|"lg"|"xl"  (défaut "md")
 *   submitLabel   : string  (défaut "Enregistrer")
 *   disableSubmit : bool    — désactiver les boutons si formulaire invalide
 */

const AddSimpleModal = ({
  open,
  onClose,
  title = "Ajouter",
  children,
  onSubmit,
  onSubmitAndAdd,
  loading = false,
  loadingAdd = false,
  maxWidth = "md",
  submitLabel = "Enregistrer",
  disableSubmit = false,
}) => {
  const handleClose = () => {
    if (loading || loadingAdd) return;
    onClose();
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
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{title}</span>
        </div>
        <IconButton onClick={handleClose} disabled={loading || loadingAdd} size="small"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
          <CloseIcon style={{ fontSize: 16 }} />
        </IconButton>
      </div>

      {/* Contenu — géré entièrement par le parent */}
      <DialogContent sx={{ p: 3 }}>
        {children}
      </DialogContent>

      {/* Footer */}
      <DialogActions style={{
        padding: "12px 20px 16px",
        borderTop: "1px solid #f1f5f9",
        gap: 10,
      }}>
        <Button onClick={handleClose} disabled={loading || loadingAdd}
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>
          Annuler
        </Button>

        <div style={{ flex: 1 }} />

        {/* Enregistrer et ajouter un autre */}
        {onSubmitAndAdd && (
          <Button
            onClick={onSubmitAndAdd}
            disabled={loading || loadingAdd || disableSubmit}
            variant="outlined"
            startIcon={loadingAdd
              ? <CircularProgress size={14} color="inherit" />
              : <AddIcon style={{ fontSize: 15 }} />
            }
            sx={{
              textTransform: "none", borderRadius: 2, fontWeight: 600, px: 3,
              borderColor: "#c7d2fe", color: "var(--gpr-primary, #005081)",
              "&:hover": { background: "#eef2ff", borderColor: "var(--gpr-primary, #005081)" },
              "&.Mui-disabled": { opacity: 0.5 },
            }}>
            {loadingAdd ? "Enregistrement..." : "Enregistrer et ajouter un autre"}
          </Button>
        )}

        {/* Enregistrer */}
        <Button
          onClick={onSubmit}
          disabled={loading || loadingAdd || disableSubmit}
          variant="contained"
          startIcon={loading
            ? <CircularProgress size={14} color="inherit" />
            : <SaveIcon style={{ fontSize: 15 }} />
          }
          sx={{
            textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3,
            background: "var(--gpr-primary, #005081)",
            "&:hover": { background: "var(--gpr-primary-dark, #003d63)" },
            "&.Mui-disabled": { opacity: 0.6 },
          }}>
          {loading ? "Enregistrement..." : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSimpleModal;
