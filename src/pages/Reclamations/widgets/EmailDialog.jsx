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
  InputAdornment,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  handledMessageChanged,
  handledShowModalChanged,
  handledDelaiChanged,
  handledCustomMessageChanged,
} from "../../../redux/actions/Reclamations/TraitementReclamationActions";
import { connect } from "react-redux";
import { Cancel, CheckBox, Save } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

const EmailDialog = (props) => {
  const defaultMessage =
    "Le traitement d'une nouvelle réclamation vous a été affecté(e). Cette réclamation nécessite votre attention et votre expertise pour garantir une résolution rapide et satisfaisante." +
    "\n\n" +
    "Détails de la réclamation : \n\n" +
    "* Code de réclamation : " +
    props.codeClient +
    "\n" +
    "* Délai de traitement : " +
    props.handled_delai +
    " jours \n" +
    "Veuillez prendre les mesures nécessaires pour examiner et traiter cette réclamation dans les plus brefs délais";

  const [errors, setErrors] = useState({ maxDelai: false });
  useEffect(() => {
    if (props.handled_custom_message) {
      handleSetDefault();
    } else {
      props.handledMessageChanged("");
    }
  }, [props.handled_custom_message]);

  const handleSetDefault = () => {
    props.handledMessageChanged(defaultMessage);
  };

  const handleSend = (e) => {
    if (props.maxDelai >= props.handled_delai) {
      setErrors({ maxDelai: false });
      props.handleSubmit(e);
    } else {
      setErrors({ maxDelai: true });
    }
  };

  return (
    <Dialog
      open={props.handled_show_modal}
      onClose={() => props.handledShowModalChanged(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{ style: { borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' } }}
    >
      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #1e2188 0%, #3b3fd8 100%)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Envoyer un email</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5, marginTop: 2 }}>Notification par email — {props.codeClient}</div>
          </div>
        </div>
        <button onClick={() => props.handledShowModalChanged(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
          <Cancel style={{ fontSize: 18 }} />
        </button>
      </div>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        {/* Délai */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Délai de traitement <span style={{ color: '#ef4444' }}>*</span>
          </div>
          <input
            type="number"
            value={props.handled_delai}
            onChange={(e) => props.handledDelaiChanged(e.target.value)}
            id="te" name="te"
            max={props.maxDelai} min={1}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: errors.maxDelai ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
            placeholder="Nombre de jours"
          />
          {errors.maxDelai && (
            <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>
              Le délai doit être entre 1 et {props.maxDelai} jour(s)
            </div>
          )}
        </div>

        {/* Message personnalisé */}
        {props.handled_custom_message && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Contenu de l'email</div>
            <TextField
              multiline fullWidth rows={8}
              value={props.handled_message}
              onChange={(e) => props.handledMessageChanged(e.target.value)}
              placeholder="Écrivez votre message ici..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            />
          </div>
        )}

        {/* Checkbox personnalisation */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 4 }}>
          <input
            type="checkbox"
            checked={props.handled_custom_message}
            onChange={(e) => props.handledCustomMessageChanged(e.target.checked)}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 13.5, color: '#475569', fontWeight: 500 }}>Personnaliser le message par défaut</span>
        </label>
      </DialogContent>

      <DialogActions style={{ padding: '12px 24px 20px', gap: 10 }}>
        <LoadingButton
          onClick={() => props.handledShowModalChanged(false)}
          variant="outlined"
          sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#e2e8f0', color: '#64748b', fontWeight: 600, '&:hover': { borderColor: '#94a3b8' } }}
        >
          Annuler
        </LoadingButton>
        <LoadingButton
          loading={props.isLoading}
          loadingPosition="end"
          endIcon={<Save />}
          onClick={handleSend}
          variant="contained"
          sx={{
            textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 3,
            background: 'linear-gradient(135deg, #1e2188, #3b3fd8)',
            color: '#fff',
            '&:hover': { background: 'linear-gradient(135deg, #1a1c6e, #1e2188)' },
            '&.MuiLoadingButton-loading': {
              background: 'linear-gradient(135deg, #1e2188, #3b3fd8)',
              color: '#fff',
            },
            '& .MuiLoadingButton-loadingIndicator': { color: '#fff' },
          }}
        >
          <span>Envoyer</span>
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state) => {
  return {
    code: state.claim_handle.code,
    codeClient: state.claim_handle.codeClient,
    isLoading: state.claim_handle.etat,
    handled_at: state.claim_handle.handled_at,
    handled_by: state.claim_handle.handled_by,
    handled_message: state.claim_handle.handled_message,
    handled_delai: state.claim_handle.handled_delai,
    handled_custom_message: state.claim_handle.handled_custom_message,
    handled_show_modal: state.claim_handle.handled_show_modal,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handledShowModalChanged: (isShow) => {
      dispatch(handledShowModalChanged(isShow));
    },
    handledCustomMessageChanged: (isCustom) => {
      dispatch(handledCustomMessageChanged(isCustom));
    },
    handledMessageChanged: (message) => {
      dispatch(handledMessageChanged(message));
    },
    handledDelaiChanged: (delai) => {
      dispatch(handledDelaiChanged(delai));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailDialog);
