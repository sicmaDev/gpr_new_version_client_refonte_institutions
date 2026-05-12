import React, { useState, useMemo } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, TablePagination,
  InputAdornment, TextField, Paper, Tooltip,
  Select, MenuItem, FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ForumIcon from "@mui/icons-material/Forum";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ClaimStatusBadge from "./ClaimStatusBadge";
import ClaimGravityBadge from "./ClaimGravityBadge";
import { formatDate } from "../../../Utils/utils";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "SAVED",             label: "Enregistrée" },
  { value: "AFFECTED",          label: "Affectée" },
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

const COLUMNS = [
  { id: "code", label: "Code client", sortable: true, minWidth: 120 },
  { id: "objet", label: "Objet / Catégorie", sortable: false, minWidth: 160 },
  { id: "client", label: "Client", sortable: true, minWidth: 150 },
  { id: "status", label: "Statut", sortable: true, minWidth: 120 },
  { id: "gravity", label: "Gravité", sortable: true, minWidth: 100 },
  { id: "date", label: "Enregistrée le", sortable: true, minWidth: 130 },
  { id: "alert", label: "Délai", sortable: false, minWidth: 90 },
];

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
  } catch (_) { return { libelle: "—", categorie: "" }; }
};

const ClaimsTable = ({ items = [], mode, objets, onRowClick, statusOptions, currentUser }) => {
  const resolvedStatusOptions = statusOptions || STATUS_OPTIONS;
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGravity, setFilterGravity] = useState("");
  const [orderBy, setOrderBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

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

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va, vb;
      switch (orderBy) {
        case "code": va = a.code || ""; vb = b.code || ""; break;
        case "client": va = a.clientFirstAndLastName || ""; vb = b.clientFirstAndLastName || ""; break;
        case "status": va = a.status || ""; vb = b.status || ""; break;
        case "gravity":
          va = getGravity(a, mode, objets) || "";
          vb = getGravity(b, mode, objets) || "";
          break;
        case "date":
        default:
          va = a.createdAt || "";
          vb = b.createdAt || "";
      }
      return order === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }, [filtered, orderBy, order, mode, objets]);

  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (col) => {
    if (orderBy === col) setOrder(order === "asc" ? "desc" : "asc");
    else { setOrderBy(col); setOrder("asc"); }
  };

  return (
    <Box>
      {/* Barre de filtres */}
      <Box sx={{ mb: 2, display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
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
              borderRadius: "10px",
              fontSize: "0.85rem",
              backgroundColor: "#fff",
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
            {resolvedStatusOptions.map((o) => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.84rem" }}>
                {o.label}
              </MenuItem>
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
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.84rem" }}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid #F1F5F9",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    minWidth: col.minWidth,
                    backgroundColor: "#F8FAFC",
                    borderBottom: "2px solid #E2E8F0",
                    py: 1.5,
                    px: 2,
                    fontSize: "0.70rem",
                    fontWeight: 700,
                    color: "#64748B",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                  sortDirection={orderBy === col.id ? order : false}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleSort(col.id)}
                      sx={{
                        "&.Mui-active": { color: "#6366F1" },
                        "& .MuiTableSortLabel-icon": { fontSize: 14 },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6, color: "#94A3B8" }}>
                  Aucune réclamation trouvée
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((claim, idx) => {
                const gravity = getGravity(claim, mode, objets);
                const objet = getObjet(claim, mode, objets);
                const isOverdue = claim.retardDay <= 0 &&
                  !["SATISFIED", "UNSATISFIED", "PARTIAL_SATISFIED", "LITIGATION"].includes(claim.status);
                const isClosed = ["SATISFIED", "UNSATISFIED", "PARTIAL_SATISFIED", "CLASSED"].includes(claim.status);

                return (
                  <TableRow
                    key={claim.id || idx}
                    hover
                    onClick={() => onRowClick && onRowClick(claim)}
                    sx={{
                      cursor: "pointer",
                      transition: "background 0.15s",
                      "&:hover": {
                        backgroundColor: "#dfeffd !important",
                      },
                      "& td": {
                        borderBottom: "1px solid #F1F5F9",
                        py: 1.4,
                        px: 2,
                        fontSize: "0.83rem",
                        color: "#334155",
                        transition: "color 0.15s",
                      },
                    }}
                  >
                    {/* Code client */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#005081", fontFamily: "monospace" }}>
                          {claim.codeClient || "—"}
                        </span>
                        {claim.status === "AFFECTED" &&
                         claim.treatmentAffectedTo?.firstAndLastName === currentUser?.firstAndLastName && (
                          <Tooltip title="Affecté à vous">
                            <AlternateEmailIcon sx={{ fontSize: 15, color: "#DC2626" }} />
                          </Tooltip>
                        )}
                        {claim.session && claim.session !== "" && !["TREAT","SATISFIED","UNSATISFIED","PARTIAL_SATISFIED","LITIGATION","CLASSED"].includes(claim.status) && (
                          <Tooltip title="Session ouverte">
                            <ForumIcon sx={{ fontSize: 15, color: "#DC2626" }} />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    {/* Objet */}
                    <TableCell>
                      <Box>
                        <span style={{
                          display: "block", fontWeight: 600, fontSize: "0.82rem",
                          color: "#0F172A", maxWidth: 180, overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap"
                        }}>
                          {objet.libelle || "—"}
                        </span>
                        {objet.categorie && (
                          <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                            {objet.categorie}
                          </span>
                        )}
                      </Box>
                    </TableCell>

                    {/* Client */}
                    <TableCell>
                      <Box>
                        <span style={{ fontWeight: 600, display: "block", fontSize: "0.82rem" }}>
                          {claim.clientFirstAndLastName || <em>Anonyme</em>}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                          {claim.codeClient}
                        </span>
                      </Box>
                    </TableCell>

                    {/* Statut */}
                    <TableCell><ClaimStatusBadge status={claim.status} /></TableCell>

                    {/* Gravité */}
                    <TableCell>
                      <ClaimGravityBadge gravity={gravity} transmitted={claim.transmitted} />
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <span style={{ fontSize: "0.80rem", color: "#475569", whiteSpace: "nowrap" }}>
                        {claim.createdAt
                          ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(claim.createdAt))
                          : "—"}
                      </span>
                    </TableCell>

                    {/* Délai */}
                    <TableCell>
                      {isClosed ? (
                        <span style={{ color: "#CBD5E1", fontSize: "0.78rem" }}>—</span>
                      ) : isOverdue ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                          <WarningAmberIcon sx={{ fontSize: 14, color: "#EF4444" }} />
                          <span style={{ fontSize: "0.75rem", color: "#EF4444", fontWeight: 700 }}>Retard</span>
                        </Box>
                      ) : (
                        <span style={{ fontSize: "0.78rem", color: "#475569" }}>
                          {claim.declenchedDate || "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 15, 25, 50]}
        labelRowsPerPage="Lignes par page :"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
        sx={{
          ".MuiTablePagination-toolbar": { fontSize: "0.8rem", color: "#64748B" },
          ".MuiTablePagination-select": { fontSize: "0.8rem" },
          ".MuiTablePagination-displayedRows": { fontSize: "0.8rem" },
        }}
      />
    </Box>
  );
};

export default ClaimsTable;
