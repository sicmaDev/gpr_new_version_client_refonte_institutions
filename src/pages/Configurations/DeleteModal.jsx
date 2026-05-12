import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Delete, Cancel, WarningAmber } from "@mui/icons-material";

const CODE_REGEX = /^(REC|DEN|SUG).+$/;

const DeleteModal = ({ open, loading = false, onClose, onConfirm }) => {
  const [localCode, setLocalCode] = useState("");
  const [reason, setReason] = useState("");
  const [confirmStep, setConfirmStep] = useState(false);
  const [errors, setErrors] = useState({ code: "", reason: "" });

  useEffect(() => {
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
      newErrors.code = "Format invalide. Ex: REC-001, DEN-123, SUG-45";
    }
    if (!reason.trim()) {
      newErrors.reason = "La raison de la suppression est obligatoire";
    }
    setErrors(newErrors);
    return !newErrors.code && !newErrors.reason;
  };

  const handleDeleteClick = () => {
    if (!confirmStep) {
      if (!validate()) return;
      setConfirmStep(true);
      return;
    }
    onConfirm({ code: localCode.trim(), reason: reason.trim() });
  };

  const isFormValid = CODE_REGEX.test(localCode.trim()) && reason.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ style: { borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' } }}
    >
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Delete style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Supprimer un element</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12.5, marginTop: 2 }}>
              {confirmStep ? 'Etape 2 - Confirmation finale' : 'Etape 1 - Identification'}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
          <Cancel style={{ fontSize: 18 }} />
        </button>
      </div>

      <DialogContent sx={{ pt: 3 }}>
        {!confirmStep && (
          <div style={{ fontSize: 13.5, color: '#64748b', marginBottom: 20, padding: '10px 14px', background: '#fff7ed', borderRadius: 10, border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningAmber style={{ color: '#f59e0b', fontSize: 18, flexShrink: 0 }} />
            Cette action est irreversible. Veuillez renseigner les informations ci-dessous.
          </div>
        )}
        {confirmStep && (
          <div style={{ fontSize: 13.5, color: '#991b1b', marginBottom: 20, padding: '12px 16px', background: '#fee2e2', borderRadius: 10, border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningAmber style={{ color: '#dc2626', fontSize: 18, flexShrink: 0 }} />
            <span>Vous etes sur le point de supprimer cet element. Cliquez sur <strong>Confirmer</strong> pour continuer.</span>
          </div>
        )}
        <TextField
          fullWidth
          label="Code (REC, DEN ou SUG)"
          placeholder="Ex: REC-xxxx, DEN-xxxx, SUG-xxxx"
          value={localCode}
          onChange={(e) => setLocalCode(e.target.value)}
          error={Boolean(errors.code)}
          helperText={errors.code}
          sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
        />
        <TextField
          fullWidth multiline rows={4}
          label="Raison de la suppression"
          placeholder="Expliquez brievement la raison..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={Boolean(errors.reason)}
          helperText={errors.reason}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
        />
      </DialogContent>

      <DialogActions style={{ padding: '12px 24px 20px', gap: 10 }}>
        <LoadingButton
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#e2e8f0', color: '#64748b', fontWeight: 600 }}
        >
          Annuler
        </LoadingButton>
        <LoadingButton
          loading={loading}
          disabled={!isFormValid}
          variant="contained"
          startIcon={<Delete />}
          onClick={handleDeleteClick}
          sx={{ textTransform: 'none', borderRadius: 2, background: confirmStep ? '#b91c1c' : '#dc2626', fontWeight: 700, '&:hover': { background: '#991b1b' } }}
        >
          <span>{confirmStep ? 'Confirmer la suppression' : 'Supprimer'}</span>
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteModal;
