import React, { useMemo } from "react";
import { Box, ButtonBase, Typography, Badge } from "@mui/material";
import { STATUS_CONFIG } from "./ClaimStatusBadge";

/**
 * Barre de filtres rapides par statut (chips cliquables avec comptage)
 */

const FILTER_BUTTONS = [
  { value: "ALL", label: "Tous" },
  { value: "SAVED", label: "Enregistrée" },
  { value: "AFFECTED", label: "Affectée" },
  { value: "TO_APPROUVED", label: "À approuver" },
  { value: "DESAPPROUVED", label: "Désapprouvée" },
  { value: "TREAT", label: "Traitée" },
  { value: "SATISFIED", label: "Satisfait" },
  { value: "UNSATISFIED", label: "Non satisfait" },
  { value: "LITIGATION", label: "Contentieux" },
  { value: "CLASSED", label: "Classée" },
];

const ClaimsFilterBar = ({ items = [], activeFilter, onFilterChange }) => {
  const counts = useMemo(() => {
    const result = { ALL: items.length };
    items.forEach((item) => {
      result[item.status] = (result[item.status] || 0) + 1;
    });
    return result;
  }, [items]);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        mb: 2,
        pb: 2,
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      {FILTER_BUTTONS.map((btn) => {
        const isActive = activeFilter === btn.value;
        const count = counts[btn.value] || 0;
        const statusCfg = STATUS_CONFIG[btn.value];
        const activeBg = statusCfg ? statusCfg.bg : "#EFF6FF";
        const activeColor = statusCfg ? statusCfg.color : "#1D4ED8";
        const activeBorder = statusCfg ? statusCfg.border : "#93C5FD";

        // Skip statuts sans données sauf "Tous"
        if (btn.value !== "ALL" && count === 0) return null;

        return (
          <ButtonBase
            key={btn.value}
            onClick={() => onFilterChange(btn.value)}
            sx={{
              borderRadius: "20px",
              px: 1.5,
              py: 0.5,
              border: isActive
                ? `1.5px solid ${activeBorder}`
                : "1.5px solid #E2E8F0",
              backgroundColor: isActive ? activeBg : "#FAFAFA",
              color: isActive ? activeColor : "#64748B",
              fontWeight: isActive ? 700 : 500,
              fontSize: "0.78rem",
              transition: "all 0.18s ease",
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              "&:hover": {
                backgroundColor: activeBg,
                color: activeColor,
                borderColor: activeBorder,
              },
            }}
          >
            <Typography
              component="span"
              sx={{ fontSize: "inherit", fontWeight: "inherit", lineHeight: 1.4 }}
            >
              {btn.label}
            </Typography>
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                borderRadius: "10px",
                backgroundColor: isActive ? activeColor : "#E2E8F0",
                color: isActive ? "#fff" : "#64748B",
                fontSize: "0.65rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 0.6,
              }}
            >
              {count}
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
};

export default ClaimsFilterBar;
