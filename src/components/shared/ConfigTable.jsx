import React, { useState, useMemo } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, TablePagination,
  InputAdornment, TextField, Paper, Select, MenuItem, FormControl, Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

/**
 * ConfigTable — Tableau MUI générique pour les modules de configuration
 *
 * Props :
 *   items        : array  — données à afficher
 *   columns      : array  — définitions de colonnes :
 *     { id, label, sortable?, minWidth?, render: (row) => ReactNode }
 *   searchFields : array  — champs sur lesquels porter la recherche (ex: ["libelle","description"])
 *   filters      : array  — filtres select optionnels :
 *     { id, label, options: [{value, label}], filterFn: (row, value) => bool }
 *   defaultSort  : string — id de la colonne de tri par défaut
 *   rowsPerPageOptions : array — options de pagination (défaut: [10,15,25,50])
 *   exportClassName : string — classe à poser sur le <table> pour l'export Excel (table2XLSX)
 */
// Supporte les chemins imbriqués type "posteDto.libelle"
const getFieldValue = (row, field) =>
  field.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), row);

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

const ConfigTable = ({
  items = [],
  columns = [],
  searchFields = [],
  filters = [],
  defaultSort = "",
  defaultSortDir = "asc",
  rowsPerPageOptions = [10, 15, 25, 50],
  exportClassName = "",
  loading = false,
}) => {
  const [search, setSearch]       = useState("");
  const [filterValues, setFilterValues] = useState(
    Object.fromEntries(filters.map((f) => [f.id, ""]))
  );
  const [orderBy, setOrderBy]     = useState(defaultSort || (columns[0]?.id ?? ""));
  const [order, setOrder]         = useState(defaultSortDir);
  const [page, setPage]           = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[1] ?? 15);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((row) => {
      // Recherche texte
      if (q && searchFields.length > 0) {
        const match = searchFields.some((field) =>
          String(getFieldValue(row, field) ?? "").toLowerCase().includes(q)
        );
        if (!match) return false;
      }
      // Filtres select
      for (const f of filters) {
        const val = filterValues[f.id];
        if (val && !f.filterFn(row, val)) return false;
      }
      return true;
    });
  }, [items, search, searchFields, filterValues, filters]);

  const sorted = useMemo(() => {
    const sortableCol = columns.find((c) => c.id === orderBy);
    if (!sortableCol?.sortable) return filtered;
    return [...filtered].sort((a, b) => {
      const va = String(a[orderBy] ?? "");
      const vb = String(b[orderBy] ?? "");
      return order === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [filtered, orderBy, order, columns]);

  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (colId) => {
    if (orderBy === colId) setOrder(order === "asc" ? "desc" : "asc");
    else { setOrderBy(colId); setOrder("asc"); }
  };

  const handleFilterChange = (filterId, value) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value }));
    setPage(0);
  };

  return (
    <Box>
      {/* Barre de recherche + filtres */}
      <Box sx={{ mb: 2, display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
        {searchFields.length > 0 && (
          <TextField
            size="small"
            placeholder="Rechercher..."
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
              "& input": {
                borderBottom: "none !important",
                boxShadow: "none !important",
                outline: "none !important",
                background: "transparent !important",
              },
              "& input::after, & input::before": { display: "none !important" },
            }}
          />
        )}
        {filters.map((f) => (
          <FormControl key={f.id} size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filterValues[f.id] ?? ""}
              onChange={(e) => handleFilterChange(f.id, e.target.value)}
              displayEmpty
              startAdornment={<FilterListIcon sx={{ fontSize: 16, color: "#94A3B8", mr: 0.5 }} />}
              sx={selectSx}
            >
              <MenuItem value="" sx={{ fontSize: "0.84rem" }}>{f.label}</MenuItem>
              {f.options.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.84rem" }}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>

      {/* Tableau */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid #F1F5F9", borderRadius: "14px", overflow: "hidden" }}
      >
        <Table size="small" stickyHeader {...(exportClassName ? { id: "as-react-datatable", className: exportClassName } : {})}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    minWidth: col.minWidth ?? 100,
                    backgroundColor: "#F8FAFC",
                    borderBottom: "2px solid #E2E8F0",
                    py: 1.5, px: 2,
                    fontSize: "0.70rem", fontWeight: 700,
                    color: "#64748B", letterSpacing: "0.06em",
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
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col.id} sx={{ py: 1.4, px: 2 }}>
                      <Skeleton variant="text" sx={{ fontSize: "0.83rem", borderRadius: 1 }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: "#94A3B8" }}>
                  Aucun élément trouvé
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, idx) => (
                <TableRow
                  key={row.id ?? idx}
                  sx={{
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
                      {col.render ? col.render(row) : String(row[col.id] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
        rowsPerPageOptions={rowsPerPageOptions}
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

export default ConfigTable;
