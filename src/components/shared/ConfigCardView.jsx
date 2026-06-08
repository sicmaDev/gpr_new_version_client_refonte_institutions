import React, { useState, useMemo } from "react";
import {
  Box, Grid, Card, CardContent, Typography,
  InputAdornment, TextField, TablePagination, Tooltip,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * ConfigCardView — Vue cartes MUI générique pour les modules de configuration
 *
 * Props :
 *   items          : array  — données à afficher
 *   titleField     : string — champ principal affiché en titre
 *   subtitleField  : string — champ secondaire (description)
 *   badgeField     : string — champ pour un badge optionnel (ex: type, statut)
 *   badgeColorMap  : object — { [valeur]: couleur } pour colorier le badge
 *   extraFields    : array  — champs supplémentaires à afficher :
 *     { label, render: (row) => ReactNode }
 *   searchFields   : array  — champs sur lesquels porter la recherche
 *   onEdit         : fn(row) — callback bouton Modifier (null = pas de bouton)
 *   onDelete       : fn(row) — callback bouton Supprimer (null = pas de bouton)
 *   avatarField    : string — champ utilisé pour l'avatar (initiales), défaut = titleField
 *   rowsPerPageOptions : array
 */

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
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ConfigCardView = ({
  items = [],
  titleField = "libelle",
  subtitleField = "description",
  badgeField = null,
  badgeColorMap = {},
  extraFields = [],
  searchFields = [],
  onEdit = null,
  onDelete = null,
  avatarField = null,
  rowsPerPageOptions = [12, 24, 48],
}) => {
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0] ?? 12);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;
    return items.filter((row) =>
      searchFields.some((field) => String(row[field] ?? "").toLowerCase().includes(q))
    );
  }, [items, search, searchFields]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Barre de recherche */}
      {searchFields.length > 0 && (
        <Box sx={{ mb: 2.5 }}>
          <TextField
            size="small"
            fullWidth
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
              maxWidth: 400,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px", fontSize: "0.85rem", backgroundColor: "#fff",
                "& fieldset": { borderColor: "#E2E8F0" },
                "&:hover fieldset": { borderColor: "#CBD5E1" },
                "&.Mui-focused fieldset": { borderColor: "#005081", borderWidth: 1.5 },
              },
              "& input": { borderBottom: "none !important", boxShadow: "none !important" },
            }}
          />
        </Box>
      )}

      {/* Grille de cartes */}
      {filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, color: "#94A3B8", fontSize: "0.9rem" }}>
          Aucun élément trouvé
        </Box>
      ) : (
        <Grid container spacing={2}>
          {paginated.map((row, idx) => {
            const avatarName = String(row[avatarField ?? titleField] ?? "");
            const [avatarBg, avatarColor] = getAvatarColors(avatarName);
            const initials = getInitials(avatarName);
            const title = String(row[titleField] ?? "—");
            const subtitle = subtitleField ? String(row[subtitleField] ?? "") : "";
            const badge = badgeField ? row[badgeField] : null;
            const badgeColor = badge ? (badgeColorMap[badge] ?? "#64748B") : null;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={row.id ?? idx}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid #F0F4F8",
                    borderTop: "3px solid #005081",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.2s",
                    "&:hover": { boxShadow: "0 6px 18px rgba(0,0,0,0.10)" },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2 }, flex: 1 }}>
                    {/* Ligne 1 : avatar + titre */}
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: "12px", flexShrink: 0,
                        backgroundColor: avatarBg, color: avatarColor,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.82rem", fontWeight: 800,
                      }}>
                        {initials}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{
                          fontSize: "0.88rem", fontWeight: 700, color: "#0F172A",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {title}
                        </Typography>
                        {badge && (
                          <Box sx={{
                            display: "inline-block", mt: 0.3,
                            px: 1, py: 0.2, borderRadius: "20px",
                            backgroundColor: `${badgeColor}18`,
                            border: `1px solid ${badgeColor}44`,
                            color: badgeColor,
                            fontSize: "0.68rem", fontWeight: 700,
                          }}>
                            {badge}
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Sous-titre */}
                    {subtitle && (
                      <Typography sx={{
                        fontSize: "0.80rem", color: "#64748B", lineHeight: 1.4,
                        mb: 1.2, display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 36,
                      }}>
                        {subtitle}
                      </Typography>
                    )}

                    {/* Champs extra */}
                    {extraFields.map((ef, i) => (
                      <Box key={i} sx={{ mb: 0.8 }}>
                        <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 600, mb: 0.2 }}>
                          {ef.label}
                        </Typography>
                        <Box sx={{ fontSize: "0.80rem", color: "#334155" }}>
                          {ef.render(row)}
                        </Box>
                      </Box>
                    ))}

                    {/* Séparateur + boutons actions */}
                    {(onEdit || onDelete) && (
                      <>
                        <Box sx={{ borderTop: "1px solid #F1F5F9", mt: 1.5, pt: 1,
                          display: "flex", justifyContent: "flex-end", gap: 0.5 }} >
                          {onEdit && (
                            <Tooltip title="Modifier">
                              <IconButton size="small" color="primary" onClick={() => onEdit(row)}>
                                <EditIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Supprimer">
                              <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                                <DeleteIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </>
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
        rowsPerPageOptions={rowsPerPageOptions}
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

export default ConfigCardView;
