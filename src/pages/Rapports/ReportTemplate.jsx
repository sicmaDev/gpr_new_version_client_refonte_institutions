import React, { useEffect, useState } from "react";
import { Checkbox, FormControlLabel, MenuItem, Select } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { connect } from "react-redux";
import TemplateActions from "../../redux/actions/Rapports/TemplateActions";
import {
  createOrUpdateTemplateApi,
  deleteTemplateApi,
  reportTemplateApi,
} from "../../apis/Rapports/GlobalsApi";
import { notify } from "../../Utils/alert";

const ReportTemplate = (props) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const closeForm = () => {
    setConfirmDelete(false);
    props.setTmpState({
      showForm: false,
      form: { id: null, valeurs: {}, title: null, default: false },
    });
  };

  const getTemplates = () => {
    closeForm();
    reportTemplateApi()
      .then(({ data }) => {
        const current =
          data.content.find((re) => re.default === true) ??
          props.tmpState.tmpInit;
        props.setTmpState({
          isLoading: false,
          isSuccess: true,
          items: [...data.content, props.tmpState.tmpInit],
          current,
          current_valeurs: current.valeurs,
          current_id: current.id,
        });
      })
      .catch((err) => {
        props.setTmpState({
          isLoading: false,
          isSuccess: false,
          items: [props.tmpState.tmpInit],
          current: props.tmpState.tmpInit,
          current_id: 0,
        });
      });
  };

  useEffect(() => {
    getTemplates();
  }, []);

  const handleSubmit = (isCreate = false) => {
    if (!props.tmpState.form.title || props.tmpState.form.title === "") {
      notify("Le nom du template est obligatoire", "error");
      return;
    }
    createOrUpdateTemplateApi({
      ...props.tmpState.form,
      id: isCreate ? null : props.tmpState.current_id,
      valeurs: props.tmpState.current_valeurs,
    })
      .then(() => getTemplates())
      .catch(() => {});
  };

  const deleteSubmit = () => {
    setConfirmDelete(false);
    deleteTemplateApi(props.tmpState.current_id)
      .then(() => {
        notify("Template supprimé avec succès", "success");
        getTemplates();
      })
      .catch(() => notify("Erreur lors de la suppression du template", "error"));
  };

  const setNewTemplate = (e) => {
    const current =
      props.tmpState.items.find(({ id }) => id === e.target.value) ??
      props.tmpState.tmpInit;
    props.setTmpState({
      current,
      current_id: current.id,
      current_valeurs: current.valeurs,
    });
  };

  const isEditable = props.tmpState.current_id !== 0;
  const isCreate = props.tmpState.showCreateForm;
  const showForm = props.tmpState.showForm;

  /* ── Mode édition ── */
  if (showForm) {
    return (
      <div style={{ marginBottom: 16 }}>
        {/* Bannière instruction */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#EFF6FF", border: "1.5px solid #BFDBFE",
          borderRadius: 12, padding: "10px 16px", marginBottom: 10,
        }}>
          <InfoOutlinedIcon style={{ fontSize: 18, color: "#1D4ED8", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#1D4ED8", fontWeight: 500 }}>
            Cliquez sur le <strong>✕</strong> d'un graphique ci-dessous pour l'exclure du template.
            Les graphiques restants seront sauvegardés.
          </span>
        </div>

        {/* Barre formulaire inline */}
        <div style={{
          background: "#fff", borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
          padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>
            {isCreate ? "Nouveau template" : "Modifier le template"}
          </span>

          <input
            type="text"
            placeholder="Nom du template"
            value={props.tmpState.form.title ?? ""}
            onChange={(e) =>
              props.setTmpState({ form: { ...props.tmpState.form, title: e.target.value } })
            }
            style={{
              flex: "1 1 200px", minWidth: 160,
              padding: "8px 14px", borderRadius: 10,
              border: "1.5px solid #CBD5E1", outline: "none",
              fontSize: 13, color: "#0F172A", background: "#fff",
              boxSizing: "border-box",
            }}
            onFocus={e => { e.target.style.borderColor = "#0F4C81"; e.target.style.boxShadow = "0 0 0 3px rgba(15,76,129,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#CBD5E1"; e.target.style.boxShadow = "none"; }}
          />

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={!!props.tmpState.form.default}
                onChange={(e) =>
                  props.setTmpState({ form: { ...props.tmpState.form, default: e.target.checked } })
                }
              />
            }
            label={<span style={{ fontSize: 12.5, color: "#475569" }}>Par défaut</span>}
            sx={{ margin: 0 }}
          />

          <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
            {!isCreate && !confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 14px", borderRadius: 10,
                  border: "1.5px solid #FECACA", background: "#FEF2F2",
                  color: "#DC2626", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                }}
              >
                <DeleteOutlineIcon style={{ fontSize: 15 }} />
                Supprimer
              </button>
            )}
            {!isCreate && confirmDelete && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#FFF7ED", border: "1.5px solid #FED7AA",
                borderRadius: 10, padding: "7px 14px",
              }}>
                <span style={{ fontSize: 12.5, color: "#92400E", fontWeight: 600, whiteSpace: "nowrap" }}>
                  Confirmer la suppression ?
                </span>
                <button
                  onClick={deleteSubmit}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "5px 12px", borderRadius: 8,
                    border: "none", background: "#DC2626",
                    color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  <DeleteOutlineIcon style={{ fontSize: 14 }} />
                  Oui, supprimer
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    padding: "5px 12px", borderRadius: 8,
                    border: "1.5px solid #CBD5E1", background: "#fff",
                    color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
              </div>
            )}
            <button
              onClick={closeForm}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: 10,
                border: "1.5px solid #E2E8F0", background: "#F8FAFC",
                color: "#475569", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              }}
            >
              <CloseIcon style={{ fontSize: 15 }} />
              Annuler
            </button>
            <button
              onClick={() => handleSubmit(isCreate)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 18px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #0F4C81 0%, #1E88E5 100%)",
                color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              }}
            >
              <SaveIcon style={{ fontSize: 15 }} />
              {isCreate ? "Créer" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Mode normal ── */
  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
      padding: "12px 20px", marginBottom: 16,
      display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>
        Template :
      </span>

      <div style={{ flex: "1 1 200px", minWidth: 160 }}>
        <Select
          fullWidth
          size="small"
          value={props.tmpState.current_id}
          onChange={setNewTemplate}
          variant="outlined"
          sx={{
            fontSize: 13, borderRadius: "10px",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
          }}
        >
          {props.tmpState.items.map((item, i) => (
            <MenuItem key={i} value={item.id} sx={{ fontSize: 13 }}>
              {item.title}
            </MenuItem>
          ))}
        </Select>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() =>
            props.setTmpState({
              showForm: true,
              showCreateForm: true,
              form: { id: null, title: null, default: false },
            })
          }
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 14px", borderRadius: 10,
            border: "1.5px solid #BFDBFE", background: "#EFF6FF",
            color: "#1D4ED8", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          }}
        >
          <AddIcon style={{ fontSize: 15 }} />
          Nouveau
        </button>

        {isEditable && (
          <button
            onClick={() =>
              props.setTmpState({
                showForm: true,
                showCreateForm: false,
                form: {
                  id: props.tmpState.current.id,
                  title: props.tmpState.current.title,
                  default: props.tmpState.current.default,
                },
              })
            }
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "7px 14px", borderRadius: 10,
              border: "1.5px solid #E2E8F0", background: "#F8FAFC",
              color: "#475569", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            }}
          >
            <EditIcon style={{ fontSize: 15 }} />
            Modifier
          </button>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({ tmpState: state.templates });
const mapDispatchToProps = (dispatch) => ({
  setTmpState: (data) => dispatch(TemplateActions.stateChanged(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReportTemplate);
