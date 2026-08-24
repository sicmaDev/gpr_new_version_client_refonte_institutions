import React, { useState, useMemo } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, TablePagination,
  InputAdornment, TextField, Paper, Select, MenuItem, FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

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
  height: 38,
  fontSize: "0.85rem",
  borderRadius: "10px",
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#005081", borderWidth: 1.5 },
  "& .MuiSelect-select": { py: "7px" },
};

/**
 * DossierTable - tableau générique configurable
 *
 * Props:
 *   items              - tableau de données
 *   columns            - [{ id, label, sortable?, minWidth?, render(item)?, sortValue?(item) }]
 *   onRowClick(item)   - clic sur une ligne
 *   filterFn(item, { q, filterStatus, filterGravity }) - prédicat de filtre (fourni par l'appelant)
 *   showStatusFilter   - afficher le filtre statut (défaut: true)
 *   showGravityFilter  - afficher le filtre gravité (défaut: false)
 *   searchPlaceholder
 *   emptyText
 */
const DossierTable = ({
  items = [],
  columns = [],
  onRowClick,
  filterFn,
  showStatusFilter = true,
  showGravityFilter = false,
  searchPlaceholder = "Rechercher...",
  emptyText = "Aucun élément trouvé",
}) => {
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState("");
  const [filterGravity, setFilterGravity] = useState("");
  const [orderBy, setOrderBy]             = useState("");
  const [order, setOrder]                 = useState("asc");
  const [page, setPage]                   = useState(0);
  const [rowsPerPage, setRowsPerPage]     = useState(15);

  const reset = () => setPage(0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q && !filterStatus && !filterGravity && !filterFn) return items;
    return items.filter((item) =>
      filterFn ? filterFn(item, { q, filterStatus, filterGravity }) : true
    );
  }, [items, search, filterStatus, filterGravity, filterFn]);

  const sorted = useMemo(() => {
    if (!orderBy) return filtered;
    const col = columns.find((c) => c.id === orderBy);
    return [...filtered].sort((a, b) => {
      const va = col?.sortValue ? col.sortValue(a) : String(a[orderBy] ?? "");
      const vb = col?.sortValue ? col.sortValue(b) : String(b[orderBy] ?? "");
      return order === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [filtered, orderBy, order, columns]);

  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (colId) => {
    if (orderBy === colId) setOrder(order === "asc" ? "desc" : "asc");
    else { setOrderBy(colId); setOrder("asc"); }
  };

  return (
    <Box>
      {/* Barre de filtres */}
      <Box sx={{ mb: 2, display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); reset(); }}
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

        {showStatusFilter && (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); reset(); }}
              displayEmpty
              startAdornment={<FilterListIcon sx={{ fontSize: 16, color: "#94A3B8", mr: 0.5 }} />}
              sx={selectSx}
            >
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.84rem" }}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {showGravityFilter && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filterGravity}
              onChange={(e) => { setFilterGravity(e.target.value); reset(); }}
              displayEmpty
              sx={selectSx}
            >
              {GRAVITY_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.84rem" }}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid #F1F5F9", borderRadius: "14px", overflow: "hidden" }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    minWidth: col.minWidth,
                    backgroundColor: "#F8FAFC",
                    borderBottom: "2px solid #E2E8F0",
                    py: 1.5, px: 2,
                    fontSize: "0.70rem", fontWeight: 700, color: "#64748B",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}
                  sortDirection={orderBy === col.id ? order : false}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleSort(col.id)}
                      sx={{ "&.Mui-active": { color: "#005081" }, "& .MuiTableSortLabel-icon": { fontSize: 14 } }}
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
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: "#94A3B8" }}>
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, idx) => (
                <TableRow
                  key={item.id || idx}
                  hover
                  onClick={() => onRowClick && onRowClick(item)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    transition: "background 0.15s",
                    "&:hover": { backgroundColor: "#dfeffd !important" },
                    "& td": {
                      borderBottom: "1px solid #F1F5F9",
                      py: 1.4, px: 2,
                      fontSize: "0.83rem", color: "#334155",
                    },
                  }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      {col.render ? col.render(item) : (item[col.id] ?? "-")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); reset(); }}
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

export default DossierTable;
