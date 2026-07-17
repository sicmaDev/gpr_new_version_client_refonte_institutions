import React, { useEffect, useState } from "react";
import {
  changePasswordErrors, currentPasswordChanged,
  etatChanged, newPasswordAgainChanged, newPasswordChanged,
} from "../../redux/actions/Compte/ChangePasswordActions";
import { idChanged } from "../../redux/actions/Compte/CompteDetailsActions";
import { isValidMdp, loadItemFromLocalStorage, loadItemFromSessionStorage } from "../../Utils/utils";
import { connect } from "react-redux";
import SaveIcon from "@mui/icons-material/Save";
import { LoadingButton } from "@mui/lab";
import { modalify } from "../../Utils/modal";
import { ChangerMdpApi } from "../../apis/Compte/CompteApi";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useThemeColors, getPagePrimary, darkenColor } from "../../context/ThemeColorsContext";

const PasswordField = ({ label, onChange, error, show, onToggle }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{label}</label>
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        defaultValue=""
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: error ? "1.5px solid #EF4444" : "1.5px solid #E2E8F0",
          borderRadius: 10, padding: "10px 40px 10px 14px",
          fontSize: 13.5, color: "#0F172A",
          background: "#fff", outline: "none",
          width: "100%", boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={e => { e.target.style.borderColor = "var(--gpr-primary)"; }}
        onBlur={e => { e.target.style.borderColor = error ? "#EF4444" : "#E2E8F0"; }}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}
      >
        {show ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
      </button>
    </div>
    {error && <span style={{ fontSize: 11.5, color: "#EF4444" }}>{error}</span>}
  </div>
);

const ChangePassword = (props) => {
  const { colors } = useThemeColors();
  const primary = getPagePrimary(colors);
  const primaryDark = darkenColor(primary, 0.18);

  const mode = loadItemFromSessionStorage("app-mode") !== undefined
    ? JSON.parse(loadItemFromSessionStorage("app-mode"))
    : undefined;

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);

  useEffect(() => {
    const sessionUser = JSON.parse(loadItemFromLocalStorage("app-user"));
    props.idChanged(sessionUser.id);
  }, []);

  const handleModal = (e) => {
    e.preventDefault();
    modalify(
      "Confirmation",
      "Confirmez vous le changement du mot de passe ? Vous devrez vous reconnectez après cela !",
      "confirm",
      handleSubmit
    );
  };

  let errors = {};
  const handleValidation = () => {
    let isValid = true;
    if (!props.current_pass) { isValid = false; errors["current_pass"] = "Champ requis"; }
    if (!props.new_pass) { isValid = false; errors["new_pass"] = "Champ requis"; }
    if (!props.new_pass_again) { isValid = false; errors["new_pass_again"] = "Champ requis"; }
    if (props.new_pass !== props.new_pass_again) {
      isValid = false;
      errors["new_pass"] = "Les mots de passe ne correspondent pas";
      errors["new_pass_again"] = "Les mots de passe ne correspondent pas";
    }
    if (!isValidMdp(props.new_pass)) {
      isValid = false;
      errors["new_pass"] = "Mot de passe trop faible (chiffre + symbole requis)";
    }
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { id: props.id, oldPassword: props.current_pass, newPassword: props.new_pass };
    if (handleValidation()) {
      props.etatChanged(true);
      ChangerMdpApi(data, props, e);
    }
    props.changePasswordErrors(errors);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,.08)", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LockOutlinedIcon style={{ fontSize: 18, color: "#D97706" }} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>Sécurité</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Modifiez votre mot de passe</div>
        </div>
      </div>

      {mode === 1 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <PasswordField
              label="Mot de passe actuel"
              onChange={props.currentPasswordChanged}
              error={props.errors?.current_pass}
              show={showCurrent}
              onToggle={() => setShowCurrent(v => !v)}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <PasswordField
                label="Nouveau mot de passe"
                onChange={props.newPasswordChanged}
                error={props.errors?.new_pass}
                show={showNew}
                onToggle={() => setShowNew(v => !v)}
              />
              <PasswordField
                label="Confirmer le nouveau"
                onChange={props.newPasswordAgainChanged}
                error={props.errors?.new_pass_again}
                show={showRepeat}
                onToggle={() => setShowRepeat(v => !v)}
              />
            </div>
          </div>

          <div style={{ marginTop: 8, fontSize: 11.5, color: "#94a3b8", background: "#F8FAFC", borderRadius: 8, padding: "8px 12px" }}>
            Le mot de passe doit contenir au moins un chiffre et un symbole
          </div>

          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <LoadingButton
              onClick={handleModal}
              loading={props.etat}
              loadingPosition="end"
              endIcon={<SaveIcon />}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${primaryDark} 0%, ${primary} 100%)`,
                borderRadius: "10px", textTransform: "none",
                fontWeight: 700, fontSize: 13.5, padding: "8px 22px",
                boxShadow: "none",
                "&:hover": { background: `linear-gradient(135deg, ${darkenColor(primary, 0.28)} 0%, ${primaryDark} 100%)`, boxShadow: "none" },
              }}
            >
              Changer
            </LoadingButton>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12.5, color: "#EF4444", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 16px" }}>
          Modification impossible en mode hors-ligne
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  id: state.change_password.id,
  current_pass: state.change_password.current_pass,
  new_pass: state.change_password.new_pass,
  new_pass_again: state.change_password.new_pass_again,
  etat: state.change_password.etat,
  errors: state.change_password.change_password_errors,
});

const mapDispatchToProps = (dispatch) => ({
  changePasswordErrors: (err) => dispatch(changePasswordErrors(err)),
  idChanged: (v) => dispatch(idChanged(v)),
  currentPasswordChanged: (v) => dispatch(currentPasswordChanged(v)),
  newPasswordChanged: (v) => dispatch(newPasswordChanged(v)),
  newPasswordAgainChanged: (v) => dispatch(newPasswordAgainChanged(v)),
  etatChanged: (v) => dispatch(etatChanged(v)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
