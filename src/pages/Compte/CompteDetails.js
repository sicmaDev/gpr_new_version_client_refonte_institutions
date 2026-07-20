import React, { useEffect } from "react";
import {
  compteDetailsErrors, emailChanged, etatChanged,
  firstnameChanged, idChanged, phoneChanged, posteChanged,
} from "../../redux/actions/Compte/CompteDetailsActions";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { connect } from "react-redux";
import SaveIcon from "@mui/icons-material/Save";
import { LoadingButton } from "@mui/lab";
import { modalify } from "../../Utils/modal";
import { CompteInfosApi } from "../../apis/Compte/CompteApi";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useThemeColors, getPagePrimary, darkenColor } from "../../context/ThemeColorsContext";

const Field = ({ label, value, onChange, type = "text", readOnly = false, error }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{label}</label>
      {readOnly && (
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", background: "#F1F5F9", padding: "1px 7px", borderRadius: 20 }}>
          lecture seule
        </span>
      )}
    </div>
    <input
      type={type}
      defaultValue={value}
      readOnly={readOnly}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      style={{
        border: error
          ? "1.5px solid #EF4444"
          : readOnly
            ? "1.5px dashed #E2E8F0"
            : "1.5px solid #CBD5E1",
        borderRadius: 10, padding: "10px 14px",
        fontSize: 13.5,
        color: readOnly ? "#94a3b8" : "#0F172A",
        background: readOnly ? "#F8FAFC" : "#fff",
        outline: "none", width: "100%", boxSizing: "border-box",
        transition: "border-color 0.2s, box-shadow 0.2s",
        cursor: readOnly ? "not-allowed" : undefined,
      }}
      onFocus={e => { if (!readOnly) { e.target.style.borderColor = "var(--gpr-primary)"; e.target.style.boxShadow = "0 0 0 3px var(--gpr-primary-light)"; } }}
      onBlur={e => { e.target.style.borderColor = error ? "#EF4444" : readOnly ? "#E2E8F0" : "#CBD5E1"; e.target.style.boxShadow = "none"; }}
    />
    {error && <span style={{ fontSize: 11.5, color: "#EF4444" }}>{error}</span>}
  </div>
);

const CompteDetails = (props) => {
  const { colors } = useThemeColors();
  const primary = getPagePrimary(colors);
  const primaryDark = darkenColor(primary, 0.18);

  const mode = loadItemFromSessionStorage("app-mode") !== undefined
    ? JSON.parse(loadItemFromSessionStorage("app-mode"))
    : undefined;

  const sessionUser = JSON.parse(loadItemFromSessionStorage("app-user")) || {};
  const addR = sessionUser.additionalRole;
  const isRa = sessionUser.isRa || sessionUser.ra;
  const roleLabels = [
    addR === "PILOTE" ? "Pilote Principal" : null,
    addR === "DE"     ? "Directeur / Directrice" : null,
    isRa              ? "Responsable d'Agence" : null,
  ].filter(Boolean);
  const roleLabel = roleLabels.length > 0 ? roleLabels.join(" · ") : "Aucun";

  useEffect(() => {
    props.posteChanged(sessionUser.posteDto.libelle);
    props.idChanged(sessionUser.id);
    props.emailChanged(sessionUser.email);
    props.phoneChanged(sessionUser.tel);
    props.firstnameChanged(sessionUser.firstAndLastName);
  }, []);

  const handleModal = (e) => {
    e.preventDefault();
    modalify(
      "Confirmation",
      "Confirmez vous le changement de ses informations ? Vous devrez vous reconnectez après cela !",
      "confirm",
      handleSubmit
    );
  };

  let errors = {};
  const handleValidation = () => {
    let isValid = true;
    if (!props.firstname) { isValid = false; errors["firstname"] = "Champ requis"; }
    if (!props.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(props.email)) {
      isValid = false; errors["email"] = "Email invalide";
    }
    if (!props.phone || props.phone.length < 8) { isValid = false; errors["phone"] = "Numéro invalide"; }
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { id: props.id, firstname: props.firstname, email: props.email, phone: props.phone };
    if (handleValidation()) {
      props.etatChanged(true);
      CompteInfosApi(data, props, e);
    }
    props.compteDetailsErrors(errors);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,.08)", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PersonOutlineIcon style={{ fontSize: 18, color: primary }} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>Informations personnelles</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Modifiez vos informations de compte</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Poste" value={props.poste} readOnly />
        <Field
          label="Nom(s) et Prénom(s)"
          value={props.firstname}
          onChange={props.firstnameChanged}
          error={props.errors?.firstname}
        />
        <Field
          label="Adresse électronique"
          type="email"
          value={props.email}
          onChange={props.emailChanged}
          error={props.errors?.email}
        />
        <Field
          label="Téléphone"
          type="tel"
          value={props.phone}
          onChange={props.phoneChanged}
          error={props.errors?.phone}
        />
        <Field label="Privilèges spécifiques" value={roleLabel} readOnly />
      </div>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        {mode === 1 ? (
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
            Enregistrer
          </LoadingButton>
        ) : (
          <div style={{ fontSize: 12.5, color: "#EF4444", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 16px" }}>
            Modification impossible en mode hors-ligne
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  poste: state.compte_details.poste,
  id: state.compte_details.id,
  firstname: state.compte_details.firstname,
  email: state.compte_details.email,
  phone: state.compte_details.phone,
  etat: state.compte_details.etat,
  errors: state.compte_details.compte_details_errors,
});

const mapDispatchToProps = (dispatch) => ({
  compteDetailsErrors: (err) => dispatch(compteDetailsErrors(err)),
  posteChanged: (v) => dispatch(posteChanged(v)),
  idChanged: (v) => dispatch(idChanged(v)),
  firstnameChanged: (v) => dispatch(firstnameChanged(v)),
  emailChanged: (v) => dispatch(emailChanged(v)),
  phoneChanged: (v) => dispatch(phoneChanged(v)),
  etatChanged: (v) => dispatch(etatChanged(v)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CompteDetails);
