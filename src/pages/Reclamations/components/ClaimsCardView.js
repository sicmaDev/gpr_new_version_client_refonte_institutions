import React, { useState, useMemo } from "react";
import {
  Box, Grid, Card, CardContent,
  Typography, InputAdornment, TextField, TablePagination,
  Select, MenuItem, FormControl, Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ForumIcon from "@mui/icons-material/Forum";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import { STATUS_CONFIG } from "./ClaimStatusBadge";
import ClaimGravityBadge from "./ClaimGravityBadge";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const getGravity = (claim, mode, objets) => {
  try {
    if (mode === 1) return claim.objet?.risqueLevel;
    if (claim.id && claim.collectionChannel) return claim.objet?.risqueLevel;
    const found = objets?.find((e) => e.id === claim.objetId);
    return found?.risqueLevel;
  } catch (_) { return null; }
};

const getObjet = (claim, mode, objets) => {
  try {
    if (mode === 1) return { libelle: claim.objet?.libelle, categorie: claim.objet?.categorie?.libelle };
    if (claim.id && claim.collectionChannel) return { libelle: claim.objet?.libelle, categorie: claim.objet?.categorie?.libelle };
    const found = objets?.find((e) => e.id === claim.objetId);
    return { libelle: found?.libelle, categorie: found?.categorie?.libelle };
  } catch (_) { return { libelle: "-", categorie: "" }; }
};

const AVATAR_COLORS = [
  ["#EFF6FF", "#1D4ED8"], ["#FEF3C7", "#92400E"], ["#D1FAE5", "#065F46"],
  ["#F3E8FF", "#6B21A8"], ["#FEE2E2", "#991B1B"], ["#FFF7ED", "#9A3412"],
  ["#ECFDF5", "#047857"], ["#F5F3FF", "#4C1D95"], ["#DBEAFE", "#1E40AF"],
];

const getAvatarColors = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const fmtDate = (iso) => {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch { return "-"; }
};

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "SAVED",             label: "Enregistrée" },
  { value: "AFFECTED",          label: "Affectée" },
  { value: "TO_APPROUVED",      label: "À approuver" },
  { value: "DESAPPROUVED",      label: "Désapprouvée" },
  { value: "TREAT",             label: "Traitée" },
  { value: "SATISFIED",         label: "Satisfait" },
  { value: "UNSATISFIED",       label: "Non satisfait" },
  { value: "PARTIAL_SATISFIED", label: "Part. satisfait" },
  { value: "LITIGATION",        label: "Contentieux" },
  { value: "CLASSED",           label: "Classée" },
];

const GRAVITY_OPTIONS = [
  { value: "", label: "Toutes gravités" },
  { value: "GRAVE",  label: "Grave" },
  { value: "MOYEN",  label: "Moyen" },
  { value: "MINEUR", label: "Mineur" },
];

const selectSx = {
  height: 38,
  fontSize: "0.85rem",
  borderRadius: "10px",
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#005081", borderWidth: 1.5 },
  "& .MuiSelect-select": { py: "7px" },
};

/* ─── Main component ─────────────────────────────────────────────────────── */
const ClaimsCardView = ({ items = [], mode, objets, onCardClick, currentUser, showTransmitted = true, showStatusIcons = true }) => {
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState("");
  const [filterGravity, setFilterGravity] = useState("");
  const [page, setPage]                   = useState(0);
  const [rowsPerPage, setRowsPerPage]     = useState(12);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((c) => {
      if (q && !(
        c.code?.toLowerCase().includes(q) ||
        c.clientFirstAndLastName?.toLowerCase().includes(q) ||
        c.codeClient?.toLowerCase().includes(q) ||
        c.objet?.libelle?.toLowerCase().includes(q)
      )) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterGravity) {
        const grav = getGravity(c, mode, objets);
        if (grav !== filterGravity) return false;
      }
      return true;
    });
  }, [items, search, filterStatus, filterGravity, mode, objets]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Barre de filtres */}
      <Box sx={{ mb: 2.5, display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Rechercher par référence, sujet, client..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1, minWidth: 220,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px", fontSize: "0.85rem", backgroundColor: "#fff",
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: "#005081", borderWidth: 1.5 },
            },
            "& input": { borderBottom: "none !important", boxShadow: "none !important" },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            displayEmpty
            startAdornment={<FilterListIcon sx={{ fontSize: 16, color: "#94A3B8", mr: 0.5 }} />}
            sx={selectSx}
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.84rem" }}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={filterGravity}
            onChange={(e) => { setFilterGravity(e.target.value); setPage(0); }}
            displayEmpty
            sx={selectSx}
          >
            {GRAVITY_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.84rem" }}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* État vide */}
      {filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, color: "#94A3B8", fontSize: "0.9rem" }}>
          Aucune réclamation trouvée
        </Box>
      ) : (
        <Grid container spacing={2}>
          {paginated.map((claim, idx) => {
            const gravity = getGravity(claim, mode, objets);
            const objet   = getObjet(claim, mode, objets);
            const statusCfg = STATUS_CONFIG[claim.status] || { color: "#64748B", border: "#E2E8F0" };
            const [avatarBg, avatarColor] = getAvatarColors(claim.clientFirstAndLastName);
            const initials = getInitials(claim.clientFirstAndLastName);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={claim.id || idx}>
                <Card
                  elevation={0}
                  onClick={() => onCardClick && onCardClick(claim)}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid #F0F4F8",
                    borderTop: `3px solid ${statusCfg.border}`,
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s, background-color 0.2s",
                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
                      backgroundColor: "#F0F7FF",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2 } }}>

                    {/* Ligne 1 : avatar + ref + statut */}
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.6 }}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: "12px", flexShrink: 0,
                        backgroundColor: avatarBg, color: avatarColor,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.82rem", fontWeight: 800, letterSpacing: "0.03em",
                      }}>
                        {initials}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                          <Typography sx={{
                            fontSize: "0.72rem", fontWeight: 700, color: "#005081",
                            fontFamily: "monospace", letterSpacing: "0.04em", lineHeight: 1.3,
                          }}>
                            {claim.codeClient || "-"}
                          </Typography>
                          {showStatusIcons && claim.status === "AFFECTED" &&
                           claim.treatmentAffectedTo?.firstAndLastName === currentUser?.firstAndLastName && (
                            <Tooltip title="Affecté à vous">
                              <AlternateEmailIcon sx={{ fontSize: 14, color: "#DC2626" }} />
                            </Tooltip>
                          )}
                          {showStatusIcons && claim.session && claim.session !== "" && !["TREAT","SATISFIED","UNSATISFIED","PARTIAL_SATISFIED","LITIGATION","CLASSED"].includes(claim.status) && (
                            <Tooltip title="Session ouverte">
                              <ForumIcon sx={{ fontSize: 14, color: "#DC2626" }} />
                            </Tooltip>
                          )}
                        </Box>
                        <Box sx={{
                          display: "inline-flex", alignItems: "center", mt: 0.4,
                          px: 1, py: 0.2, borderRadius: "20px",
                          backgroundColor: statusCfg.bg || "#F3F4F6",
                          border: `1px solid ${statusCfg.border}`,
                          color: statusCfg.color,
                          fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap",
                        }}>
                          {statusCfg.label || claim.status}
                        </Box>
                      </Box>
                    </Box>

                    {/* Ligne 2 : client */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
                      <PersonOutlineIcon sx={{ fontSize: 14, color: "#9CA3AF", flexShrink: 0 }} />
                      <Typography sx={{
                        fontSize: "0.82rem", fontWeight: 700, color: "#1E293B",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {claim.clientFirstAndLastName || <em>Anonyme</em>}
                      </Typography>
                    </Box>

                    {/* Ligne 3 : objet */}
                    <Typography sx={{
                      fontSize: "0.82rem", color: "#475569", lineHeight: 1.4,
                      mb: 1.2, display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 38,
                    }}>
                      {objet.libelle || "-"}
                    </Typography>

                    {/* Séparateur */}
                    <Box sx={{ borderTop: "1px solid #F1F5F9", mb: 1.2 }} />

                    {/* Ligne 4 : gravité + date */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.2 }}>
                      <ClaimGravityBadge gravity={gravity} transmitted={showTransmitted && (claim.transmitted === "true" || claim.transmitted === true)} />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 12, color: "#9CA3AF" }} />
                        <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", whiteSpace: "nowrap" }}>
                          {fmtDate(claim.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Alerte retard */}
                    {claim.retardDay !== undefined && claim.retardDay <= 0 &&
                     !["SATISFIED","UNSATISFIED","PARTIAL_SATISFIED","CLASSED"].includes(claim.status) && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1, pt: 0.8, borderTop: "1px solid #FEE2E2" }}>
                        <WarningAmberIcon sx={{ fontSize: 13, color: "#EF4444" }} />
                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#EF4444" }}>
                          {Math.abs(claim.retardDay)} j de retard
                        </Typography>
                      </Box>
                    )}

                    {/* Ligne 5 : lien Ouvrir */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Typography sx={{
                        fontSize: "0.78rem", fontWeight: 700, color: "#005081",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 0.3,
                        "&:hover": { color: "#0369A1" },
                      }}>
                        Ouvrir →
                      </Typography>
                    </Box>

                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[12, 24, 48]}
        labelRowsPerPage="Cartes par page :"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
        sx={{
          mt: 2,
          ".MuiTablePagination-toolbar": { fontSize: "0.8rem", color: "#64748B" },
          ".MuiTablePagination-select": { fontSize: "0.8rem" },
          ".MuiTablePagination-displayedRows": { fontSize: "0.8rem" },
        }}
      />
    </Box>
  );
};

export default ClaimsCardView;
