import React, { useMemo } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { STATUS_CONFIG } from "../../pages/Reclamations/components/ClaimStatusBadge";

/**
 * DossierFilterChips — chips de filtre rapide par statut
 *
 * Props:
 *   items          — tableau de données
 *   activeFilter   — valeur active ("ALL" ou un statut)
 *   onFilterChange — callback(value)
 *   filterButtons  — [{ value, label }]  (value="ALL" pour "Tous")
 */
const DossierFilterChips = ({ items = [], activeFilter, onFilterChange, filterButtons = [] }) => {
  const counts = useMemo(() => {
    const result = { ALL: items.length };
    items.forEach((item) => {
      result[item.status] = (result[item.status] || 0) + 1;
    });
    return result;
  }, [items]);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2, pb: 2, borderBottom: "1px solid #F1F5F9" }}>
      {filterButtons.map((btn) => {
        const isActive = activeFilter === btn.value;
        const count = counts[btn.value] || 0;
        const statusCfg = STATUS_CONFIG[btn.value];
        const activeBg     = statusCfg ? statusCfg.bg     : "#EFF6FF";
        const activeColor  = statusCfg ? statusCfg.color  : "#1D4ED8";
        const activeBorder = statusCfg ? statusCfg.border : "#93C5FD";

        if (btn.value !== "ALL" && count === 0) return null;

        return (
          <ButtonBase
            key={btn.value}
            onClick={() => onFilterChange(btn.value)}
            sx={{
              borderRadius: "20px", px: 1.5, py: 0.5,
              border: isActive ? `1.5px solid ${activeBorder}` : "1.5px solid #E2E8F0",
              backgroundColor: isActive ? activeBg : "#FAFAFA",
              color: isActive ? activeColor : "#64748B",
              fontWeight: isActive ? 700 : 500,
              fontSize: "0.78rem",
              transition: "all 0.18s ease",
              display: "flex", alignItems: "center", gap: 0.8,
              "&:hover": { backgroundColor: activeBg, color: activeColor, borderColor: activeBorder },
            }}
          >
            <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit", lineHeight: 1.4 }}>
              {btn.label}
            </Typography>
            <Box sx={{ minWidth: 20, height: 20, borderRadius: "10px", backgroundColor: isActive ? activeColor : "#E2E8F0", color: isActive ? "#fff" : "#64748B", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", px: 0.6 }}>
              {count}
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
};

export default DossierFilterChips;
