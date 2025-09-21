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
  console.log("props in email dialog", props);
  const defaultMessage =
    "Le traitement d'une nouvelle réclamation vous a été affecté(e). Cette réclamation nécessite votre attention et votre expertise pour garantir une résolution rapide et satisfaisante." +
    "\n\n" +
    "Détails de la réclamation : \n\n" +
    "* Code de réclamation : " +
    props.code +
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
      onClose={() => {
        props.handledShowModalChanged(false);
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Envoyer un email </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <label htmlFor="te" className={"active"}>
            Délai
            <span>
              (<span className="red-text darken-2 ">*</span>)
            </span>
          </label>
          <input
            type="number"
            value={props.handled_delai}
            onChange={(e) => props.handledDelaiChanged(e.target.value)}
            id="te"
            name="te"
            max={props.maxDelai}
            min={1}
            sx={{ mb: 3, width: "100%" }}
            placeholder=""
          />
          <small className="errorTxt4">
            <div id="cpassword-error" className="error">
              {errors.maxDelai
                ? "Le délai doit etre compris entre 1 à " +
                  props.maxDelai +
                  " jour(s)"
                : ""}
            </div>
          </small>
          {props.handled_custom_message && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Contenu de l'email:
              </Typography>
              <TextField
                multiline
                fullWidth
                rows={10}
                value={props.handled_message}
                onChange={(e) => props.handledMessageChanged(e.target.value)}
                placeholder="Écrivez votre message ici..."
              />
            </>
          )}

          <FormControlLabel
            control={
              <input
                type="checkbox"
                checked={props.handled_custom_message}
                onChange={(e) =>
                  props.handledCustomMessageChanged(e.target.checked)
                }
              />
            }
            label="Personnaliser le message par défaut"
            sx={{ mb: 2, ml: 1, mt: 2, width: "100%" }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />
        <LoadingButton
          // loading={props.isLoading}
          loadingPosition="end"
          endIcon={<Cancel />}
          onClick={() => {
            props.handledShowModalChanged(false);
          }}
          color="secondary"
          variant="contained"
        >
          Annuler
        </LoadingButton>
        <LoadingButton  loading={props.isLoading}
          loadingPosition="end"
          endIcon={<Save />}
            onClick={handleSend} color="primary" variant="contained">
          Envoyer
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state) => {
  return {
    code: state.claim_handle.code,
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
