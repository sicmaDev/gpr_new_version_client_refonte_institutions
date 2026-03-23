import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Delete, Cancel, WarningAmber } from "@mui/icons-material";

const CODE_REGEX = /^(REC|DEN|SUG).+$/;

const DeleteModal = ({ open, loading = false, onClose, onConfirm }) => {
  const [localCode, setLocalCode] = useState("");
  const [reason, setReason] = useState("");
  const [confirmStep, setConfirmStep] = useState(false);

  const [errors, setErrors] = useState({
    code: "",
    reason: "",
  });

  useEffect(() => {
    // reset total à chaque ouverture
    setLocalCode("");
    setReason("");
    setConfirmStep(false);
    setErrors({ code: "", reason: "" });
  }, [open]);

  const validate = () => {
    const newErrors = { code: "", reason: "" };

    if (!localCode.trim()) {
      newErrors.code = "Le code est obligatoire";
    } else if (!CODE_REGEX.test(localCode.trim())) {
      newErrors.code = "Format invalide. Ex: rec-001, den-123, sug-45";
    }

    if (!reason.trim()) {
      newErrors.reason = "La raison de la suppression est obligatoire";
    }

    setErrors(newErrors);
    return !newErrors.code && !newErrors.reason;
  };

  const handleDeleteClick = () => {
    // Étape 1 : validation + passage en confirmation
    if (!confirmStep) {
      if (!validate()) return;
      setConfirmStep(true);
      return;
    }

    // Étape 2 : suppression réelle
    onConfirm({
      code: localCode.trim(),
      reason: reason.trim(),
    });
  };

  const isFormValid =
    CODE_REGEX.test(localCode.trim()) && reason.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: "error.main" }}>
        Supprimer un élément
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Cette action est irréversible. Veuillez renseigner les informations
            ci-dessous.
          </Typography>

          {/* Message d’alerte de confirmation */}
          {confirmStep && (
            <Alert severity="warning" icon={<WarningAmber />} sx={{ mb: 3 }}>
              Vous êtes sur le point de supprimer cet élément. Cliquez sur{" "}
              <strong>« Confirmer la suppression »</strong> pour continuer.
            </Alert>
          )}

          {/* Code */}
          <TextField
            fullWidth
            label="Code Client (REC,DEN ou SUG)"
            placeholder="Ex: REC-xxxx, DEN-xxxx, SUG-xxxx"
            value={localCode}
            type="text"
            onChange={(e) => setLocalCode(e.target.value)}
            error={Boolean(errors.code)}
            helperText={errors.code}
            InputProps={{
              sx: {
                "& input": {
                  margin: "0 !important",
                  borderBottom: "none !important",
                  boxShadow: "none !important",
                },
              },
            }}
            sx={{ mb: 3 }}
          />

          {/* Raison */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Raison de la suppression"
            placeholder="Expliquez brièvement la raison..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={Boolean(errors.reason)}
            helperText={errors.reason}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button startIcon={<Cancel />} onClick={onClose} disabled={loading}>
          Annuler
        </Button>

        <LoadingButton
          loading={loading}
          disabled={!isFormValid}
          color="error"
          variant={confirmStep ? "outlined" : "contained"}
          startIcon={<Delete />}
          onClick={handleDeleteClick}
        >
          {confirmStep ? "Confirmer la suppression" : "Supprimer"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteModal;
