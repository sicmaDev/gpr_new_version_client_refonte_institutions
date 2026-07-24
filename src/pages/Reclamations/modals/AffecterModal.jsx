import React from "react";
import { Dialog, DialogContent, FormControlLabel, Checkbox } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import CloseIcon from "@mui/icons-material/Close";
import Select from "react-select";

const formatAgentOption = (option) => (
  <div style={{ padding: "2px 0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <PersonOutlineIcon style={{ fontSize: 15, color: "#6b7280" }} />
      <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1f2937" }}>{option.label.split(" < ")[0]}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}>
      <MailOutlineIcon style={{ fontSize: 13, color: "#9ca3af" }} />
      <span style={{ fontSize: 12, color: "#9ca3af" }}>{option.email || option.label.match(/<(.+)>/)?.[1]}</span>
    </div>
  </div>
);

const AffecterModal = ({
  open, onClose, isReaffect,
  agentsOptions, onAgentChange,
  anonymat, onAnonymatChange,
  onConfirm, loading, errors,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ style: { borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" } }}
    >
      {/* Header coloré */}
      <div style={{ background: "linear-gradient(135deg, var(--gpr-primary-dark) 0%, var(--gpr-primary) 100%)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PersonAddIcon style={{ color: "white", fontSize: 20 }} />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>
              {isReaffect ? "Réaffecter le dossier" : "Affecter le dossier"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>
              {isReaffect ? "Changer l'agent assigné" : "Assigner ce dossier à un agent"}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CloseIcon style={{ color: "white", fontSize: 18 }} />
        </button>
      </div>

      <DialogContent style={{ padding: "24px", background: "#fafafa" }}>
        {/* Sélection agent */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Agent assigné <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <Select
            options={agentsOptions}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Rechercher un agent..."
            onChange={onAgentChange}
            formatOptionLabel={formatAgentOption}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              control: (base) => ({ ...base, borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "none", minHeight: 44, background: "white" }),
              option: (base, state) => ({ ...base, background: state.isSelected ? "#eff6ff" : state.isFocused ? "#f8fafc" : "white", cursor: "pointer", padding: "10px 14px" }),
              menu: (base) => ({ ...base, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 9999 }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              singleValue: (base) => ({ ...base, fontSize: 13.5 }),
            }}
          />
          {errors?.handled_by && (
            <span style={{ fontSize: 11, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.handled_by}</span>
          )}
        </div>

        {/* Anonymat */}
        <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: "12px 16px" }}>
          <FormControlLabel
            control={<Checkbox checked={!!anonymat} onChange={onAnonymatChange} size="small" sx={{ color: "var(--gpr-primary, #005081)", "&.Mui-checked": { color: "var(--gpr-primary, #005081)" } }} />}
            label={<span style={{ fontSize: 13.5, color: "#374151" }}>Cacher l'identité du plaignant</span>}
            style={{ margin: 0 }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", fontSize: 13.5, fontWeight: 600, color: "#6b7280", cursor: "pointer" }}>
            Annuler
          </button>
          <LoadingButton
            onClick={onConfirm}
            loading={loading}
            loadingPosition="end"
            variant="contained"
            style={{ flex: 2, borderRadius: 10, textTransform: "none", fontWeight: 700, fontSize: 13.5, background: "linear-gradient(135deg, var(--gpr-primary-dark) 0%, var(--gpr-primary) 100%)", boxShadow: "0 4px 12px rgba(30,33,136,0.3)" }}
          >
            <span>{isReaffect ? "Confirmer la réaffectation" : "Confirmer l'affectation"}</span>
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AffecterModal;
