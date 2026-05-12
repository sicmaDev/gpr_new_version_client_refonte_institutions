import React, { useState, useMemo } from "react";
import {
  Box, Grid, Card, CardContent,
  Typography, InputAdornment, TextField, TablePagination,
  Select, MenuItem, FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { STATUS_CONFIG } from "../../pages/Reclamations/components/ClaimStatusBadge";
import ClaimGravityBadge from "../../pages/Reclamations/components/ClaimGravityBadge";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "SAVED",             label: "Enregistrée" },
  { value: "TEMP_SAVED",        label: "Sauvegardée" },
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
  fontSize: "0.83rem",
  borderRadius: "10px",
  backgroundColor: "#fff",
  minWidth: 155,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#005081", borderWidth: 1.5 },
};

/* ── Status pill ─────────────────────────────────────────────────────────── */
const STATUS_ICON = {
  SAVED:             <HourglassEmptyIcon sx={{ fontSize: 13 }} />,
  TEMP_SAVED:        <HourglassEmptyIcon sx={{ fontSize: 13 }} />,
  AFFECTED:          <AccessTimeIcon sx={{ fontSize: 13 }} />,
  TO_APPROUVED:      <AccessTimeIcon sx={{ fontSize: 13 }} />,
  DESAPPROUVED:      <CancelOutlinedIcon sx={{ fontSize: 13 }} />,
  TREAT:             <AccessTimeIcon sx={{ fontSize: 13 }} />,
  SATISFIED:         <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />,
  UNSATISFIED:       <CancelOutlinedIcon sx={{ fontSize: 13 }} />,
  PARTIAL_SATISFIED: <PauseCircleOutlineIcon sx={{ fontSize: 13 }} />,
  LITIGATION:        <GavelIcon sx={{ fontSize: 13 }} />,
  CLASSED:           <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />,
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status || "—", bg: "#F3F4F6", color: "#374151", border: "#D1D5DB" };
  const icon = STATUS_ICON[status] || <AccessTimeIcon sx={{ fontSize: 13 }} />;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: 1.2, py: 0.35, borderRadius: "20px",
      backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, fontSize: "0.70rem", fontWeight: 600,
      whiteSpace: "nowrap", lineHeight: 1.4,
    }}>
      {React.cloneElement(icon, { style: { color: cfg.color } })}
      {cfg.label}
    </Box>
  );
};

/* ── Date formatter ──────────────────────────────────────────────────────── */
const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" })
      .format(new Date(iso)).replace(".", "");
  } catch { return "—"; }
};

/**
 * DossierCardView — vue cartes générique
 *
 * Props :
 *   items             — tableau de dossiers
 *   getCardData(item)  — (item) => { code, client, title, subtitle, status, gravity, date, slaWarning }
 *   onCardClick(item)  — handler au clic sur une carte
 *   filterFn(item, {q, filterStatus, filterGravity}) — filtre externe (activeFilter du parent)
 *   showStatusFilter   — afficher le dropdown statut (défaut: true)
 *   showGravityFilter  — afficher le dropdown gravité (défaut: false)
 *   searchPlaceholder  — texte du champ recherche
 *   emptyText          — texte quand liste vide
 */
const DossierCardView = ({
  items = [],
  getCardData,
  onCardClick,
  filterFn,
  showStatusFilter = true,
  showGravityFilter = false,
  searchPlaceholder = "Rechercher…",
  emptyText = "Aucun dossier trouvé",
}) => {
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState("");
  const [filterGravity, setFilterGravity] = useState("");
  const [page, setPage]                   = useState(0);
  const [rowsPerPage, setRowsPerPage]     = useState(12);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => {
      if (filterFn && !filterFn(item, { q, filterStatus, filterGravity })) return false;
      if (!filterFn) {
        const d = getCardData(item);
        if (q && !(
          d.code?.toLowerCase().includes(q) ||
          d.client?.toLowerCase().includes(q) ||
          d.title?.toLowerCase().includes(q) ||
          d.subtitle?.toLowerCase().includes(q)
        )) return false;
        if (filterStatus && item.status !== filterStatus) return false;
        if (filterGravity && item.gravity !== filterGravity) return false;
      }
      return true;
    });
  }, [items, search, filterStatus, filterGravity, filterFn, getCardData]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const resetPage = () => setPage(0);

  return (
    <Box>
      {/* Barre de recherche + filtres */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1, minWidth: 200,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px", fontSize: "0.85rem",
              backgroundColor: "#fff",
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: "#005081", borderWidth: 1.5 },
            },
            "& input": { borderBottom: "none !important", boxShadow: "none !important" },
          }}
        />
        {showStatusFilter && (
          <FormControl size="small">
            <Select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}
              displayEmpty
              startAdornment={<FilterListIcon sx={{ fontSize: 16, color: "#94A3B8", mr: 0.5 }} />}
              sx={selectSx}
            >
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.82rem" }}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {showGravityFilter && (
          <FormControl size="small">
            <Select
              value={filterGravity}
              onChange={(e) => { setFilterGravity(e.target.value); resetPage(); }}
              displayEmpty
              sx={selectSx}
            >
              {GRAVITY_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.82rem" }}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* État vide */}
      {filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, color: "#94A3B8", fontSize: "0.9rem" }}>
          {emptyText}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {paginated.map((item, idx) => {
            const d = getCardData(item);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || idx}>
                <Card
                  elevation={0}
                  onClick={() => onCardClick && onCardClick(item)}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid #F0F0F0",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s, background-color 0.2s",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      backgroundColor: "#dfeffd",
                    },
                  }}
                >
                    <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>

                      {/* Ligne 1 : code + statut */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Typography sx={{
                          fontSize: "0.72rem", fontWeight: 700, color: "#005081",
                          fontFamily: "monospace", letterSpacing: "0.03em",
                        }}>
                          {d.code || "—"}
                        </Typography>
                        <StatusPill status={d.status} />
                      </Box>

                      {/* Ligne 2 : titre */}
                      <Typography sx={{
                        fontSize: "0.90rem", fontWeight: 700, color: "#111827",
                        lineHeight: 1.35, mb: 1.2,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 40,
                      }}>
                        {d.title || "—"}
                      </Typography>

                      {/* Ligne 3 : client */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.6 }}>
                        <PersonOutlineIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                        <Typography sx={{ fontSize: "0.79rem", color: "#6B7280" }}>
                          {d.client && d.client !== "Anonyme" ? d.client : <em>Anonyme</em>}
                        </Typography>
                      </Box>

                      {/* Ligne 4 : sous-titre (catégorie / langue…) */}
                      {d.subtitle && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <LocalOfferOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                          <Typography sx={{ fontSize: "0.77rem", color: "#6B7280" }}>
                            {d.subtitle}
                          </Typography>
                        </Box>
                      )}

                      {/* Séparateur */}
                      <Box sx={{ borderTop: "1px solid #F3F4F6", my: 1 }} />

                      {/* Ligne 5 : gravité + date */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          {d.gravity && <ClaimGravityBadge gravity={d.gravity} />}
                        </Box>
                        <Typography sx={{ fontSize: "0.77rem", color: "#9CA3AF" }}>
                          {fmtDate(d.date)}
                        </Typography>
                      </Box>

                      {/* Ligne 6 : retard (alertes) */}
                      {d.slaWarning && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1, pt: 0.8, borderTop: "1px solid #FEE2E2" }}>
                          <WarningAmberIcon sx={{ fontSize: 13, color: "#EF4444" }} />
                          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#EF4444" }}>
                            {d.retardDay !== undefined && d.retardDay !== null
                              ? `${Math.abs(d.retardDay)} j de retard`
                              : "En retard"}
                          </Typography>
                        </Box>
                      )}

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

export default DossierCardView;
