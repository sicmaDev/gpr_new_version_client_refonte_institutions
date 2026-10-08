import React from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, FormControl, IconButton,
  InputAdornment, MenuItem, Select, TextField, Tooltip, Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfigKPIBar from "../../components/shared/ConfigKPIBar";

// Éléments communs du suivi des délais. Ils reprennent les composants et le style des autres modules de
// configuration de la refonte (barre d'indicateurs, tableaux MUI, boutons, fenêtres à bandeau coloré).

// ── Indicateurs (même composant que les autres modules) ─────────────────────────────────────────

export const TONES = {
  red:     { iconBg: "#FEE2E2", iconColor: "#B91C1C", borderColor: "#EF4444" },
  amber:   { iconBg: "#FEF3C7", iconColor: "#92400E", borderColor: "#F59E0B" },
  green:   { iconBg: "#DCFCE7", iconColor: "#166534", borderColor: "#10B981" },
  blue:    { iconBg: "#EFF6FF", iconColor: "#1D4ED8", borderColor: "#3B82F6" },
  slate:   { iconBg: "#F1F5F9", iconColor: "#475569", borderColor: "#94A3B8" },
  purple:  { iconBg: "#F5F3FF", iconColor: "#6D28D9", borderColor: "#8B5CF6" },
  darkred: { iconBg: "#FEE2E2", iconColor: "#7F1D1D", borderColor: "#991B1B" },
};

/** Définition d'un indicateur pour ConfigKPIBar (value : nombre ou texte déjà prêt ; vide = « - »). */
export const kpi = (key, label, Icon, tone, value) => ({
  key, label, icon: Icon, ...TONES[tone], value: value === null || value === undefined ? "-" : value,
});

export const SlaKpiBar = ({ kpis }) => <ConfigKPIBar items={[]} kpis={kpis} />;

// ── Titres et zones vides ───────────────────────────────────────────────────────────────────────

export const SectionHeader = ({ title, subtitle, right }) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, gap: 1.5, flexWrap: "wrap" }}>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>{title}</Typography>
      {subtitle && <Typography sx={{ fontSize: "0.78rem", color: "#64748B", mt: 0.3, maxWidth: 820, lineHeight: 1.5 }}>{subtitle}</Typography>}
    </Box>
    {right && <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>{right}</Box>}
  </Box>
);

/** Bloc blanc de la refonte (card-panel) avec titre optionnel. */
export const Panel = ({ title, subtitle, right, children, style }) => (
  <div className="card-panel" style={{ marginTop: 0, marginBottom: 20, ...style }}>
    {(title || right) && <SectionHeader title={title} subtitle={subtitle} right={right} />}
    {children}
  </div>
);

export const ErrorNote = ({ children }) => (
  <div style={{ padding: 10, background: "#FEF2F2", color: "#B91C1C", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{children}</div>
);

export const Empty =({ children }) => (
  <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>{children}</div>
);

export const Pill = ({ label, color, bg }) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: "2px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>
    {label}
  </span>
);

// Barre horizontale proportionnelle (indicateurs).
export const Bar = ({ pct, color = "var(--gpr-primary)" }) => (
  <div style={{ width: "100%", height: 6, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
    <div style={{ width: `${Math.max(0, Math.min(100, pct || 0))}%`, height: "100%", background: color, borderRadius: 99 }} />
  </div>
);

// ── Champs ──────────────────────────────────────────────────────────────────────────────────────

const selectSx = {
  height: 38, fontSize: "0.85rem", borderRadius: "10px", backgroundColor: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--gpr-primary)", borderWidth: 1.5 },
  "& .MuiSelect-select": { py: "7px" },
};

export const SearchField = ({ value, onChange, placeholder = "Rechercher..." }) => (
  <TextField
    size="small" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} /></InputAdornment> }}
    sx={{
      flex: 1, minWidth: 220,
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px", fontSize: "0.85rem", backgroundColor: "#fff",
        "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#CBD5E1" },
        "&.Mui-focused fieldset": { borderColor: "var(--gpr-primary)", borderWidth: 1.5 },
      },
      "& input": { borderBottom: "none !important", boxShadow: "none !important", outline: "none !important", background: "transparent !important" },
    }}
  />
);

/** Liste déroulante au style des tableaux de la refonte. options : [[valeur, libellé], ...] */
export const SelectField = ({ value, onChange, options, minWidth = 160 }) => (
  <FormControl size="small" sx={{ minWidth }}>
    <Select value={value} onChange={(e) => onChange(e.target.value)} displayEmpty sx={selectSx}>
      {options.map(([v, l]) => <MenuItem key={v} value={v} sx={{ fontSize: "0.84rem" }}>{l}</MenuItem>)}
    </Select>
  </FormControl>
);

/** Champ de formulaire (fenêtres) : libellé en capitales, champ MUI arrondi. */
export const FieldLabel = ({ children, required }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>
    {children}{required && <span style={{ color: "#ef4444" }}> *</span>}
  </label>
);

// Les styles globaux (Materialize) imposent une hauteur et une marge aux champs : on les neutralise ici.
export const fieldProps = {
  size: "small", fullWidth: true,
  sx: {
    "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 14, background: "#fff" },
    "& input": {
      height: "40px !important", boxSizing: "border-box !important", padding: "0 14px !important", margin: "0 !important",
      boxShadow: "none !important", borderBottom: "none !important", background: "transparent !important",
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--gpr-primary)", borderWidth: 1.5 },
  },
};

/** Interrupteur aux couleurs du thème (indépendant des styles globaux des cases à cocher). */
export const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button" role="switch" aria-checked={!!checked} disabled={disabled} onClick={() => onChange(!checked)}
    style={{
      width: 42, height: 24, borderRadius: 99, border: "none", padding: 2, cursor: disabled ? "not-allowed" : "pointer",
      background: checked ? "var(--gpr-primary)" : "#CBD5E1", transition: "background .2s", display: "flex",
      justifyContent: checked ? "flex-end" : "flex-start", alignItems: "center", opacity: disabled ? 0.5 : 1,
    }}
  >
    <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
  </button>
);

// ── Boutons ─────────────────────────────────────────────────────────────────────────────────────

export const primarySx = {
  textTransform: "none", borderRadius: 2, fontWeight: 700, px: 2.5, fontSize: "0.82rem", whiteSpace: "nowrap",
  background: "var(--gpr-primary, #005081)", "&:hover": { background: "var(--gpr-primary-dark, #003d63)" },
  "&.Mui-disabled": { opacity: 0.6 },
};
export const outlineSx = { textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 };

export const PrimaryButton = (props) => <Button variant="contained" sx={primarySx} {...props} />;
export const OutlineButton = (props) => <Button variant="outlined" sx={outlineSx} {...props} />;

/** Icônes Modifier / Supprimer, comme dans les tableaux des autres modules. */
export const RowActions = ({ onEdit, onDelete, deleteTitle = "Supprimer" }) => (
  <div style={{ display: "flex", gap: 5 }}>
    {onEdit && <Tooltip title="Modifier"><IconButton onClick={onEdit} color="primary"><EditIcon /></IconButton></Tooltip>}
    {onDelete && <Tooltip title={deleteTitle}><IconButton onClick={onDelete} color="error"><DeleteIcon /></IconButton></Tooltip>}
  </div>
);

// ── Fenêtre à bandeau coloré (comme « Modifier l'objet ») ───────────────────────────────────────────

export const SlaDialog = ({
  open, onClose, title, subtitle, icon: Icon, children, onSubmit, submitLabel = "Enregistrer",
  loading = false, danger = false, maxWidth = "sm", hideSubmit = false,
}) => (
  <Dialog open={open} onClose={() => { if (!loading) onClose(); }} fullWidth maxWidth={maxWidth} PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
    <div style={{
      background: danger ? "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)" : "linear-gradient(135deg, var(--gpr-primary-dark) 0%, var(--gpr-primary) 100%)",
      padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {Icon && <Icon style={{ color: "#fff", fontSize: 20 }} />}
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{title}</div>
          {subtitle && <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      <IconButton onClick={onClose} disabled={loading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
        <CloseIcon style={{ fontSize: 16 }} />
      </IconButton>
    </div>
    <DialogContent sx={{ p: 3 }}>{children}</DialogContent>
    <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
      <OutlineButton onClick={onClose} disabled={loading}>Annuler</OutlineButton>
      {!hideSubmit && (
        <LoadingButton
          onClick={onSubmit} loading={loading} loadingPosition="start" startIcon={<SaveIcon style={{ fontSize: 15 }} />} variant="contained"
          sx={danger
            ? { ...primarySx, background: "linear-gradient(135deg, #991b1b, #ef4444)", "&:hover": { background: "linear-gradient(135deg, #7f1d1d, #dc2626)" } }
            : primarySx}
        >
          {submitLabel}
        </LoadingButton>
      )}
    </DialogActions>
  </Dialog>
);

// ── Tableaux : styles repris des tableaux de la refonte ─────────────────────────────────────────────

export const tableContainerSx = { border: "1px solid #F1F5F9", borderRadius: "14px", overflowX: "auto", overflowY: "hidden" };
export const headCellSx = (minWidth) => ({
  minWidth, backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0", py: 1.5, px: 2,
  fontSize: "0.70rem", fontWeight: 700, color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase",
});
export const bodyRowSx = {
  transition: "background 0.15s", "&:hover": { backgroundColor: "#dfeffd !important" },
  "& td": { borderBottom: "1px solid #F1F5F9", py: 1.4, px: 2, fontSize: "0.83rem", color: "#334155" },
};
export const paginationSx = {
  ".MuiTablePagination-toolbar": { fontSize: "0.8rem", color: "#64748B" },
  ".MuiTablePagination-select": { fontSize: "0.8rem" },
  ".MuiTablePagination-displayedRows": { fontSize: "0.8rem" },
};

// ── Droits et export ────────────────────────────────────────────────────────────────────────────────

// Habilitations de l'utilisateur connecté (même source que le menu).
export const currentRights = (user) => {
  const hbt = (user?.posteDto?.habilitations || "").split(",").map((s) => s.trim());
  const role = user?.additionalRole;
  return {
    isAdmin: hbt.includes("H12"),
    canStats: hbt.includes("H11") || role === "PILOTE" || role === "DE",
    isPilote: role === "PILOTE",
    hbt,
    role,
  };
};

// Export CSV d'un tableau d'objets (s'ouvre dans Excel ; sans dépendance).
export const downloadCsv = (filename, rows) => {
  if (!rows || rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(";"), ...rows.map((r) => cols.map((c) => esc(r[c])).join(";"))].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
