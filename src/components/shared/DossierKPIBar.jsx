import React, { useMemo } from "react";
import { Box, Typography, Tooltip } from "@mui/material";

/**
 * DossierKPIBar — barre de KPI générique
 *
 * Props:
 *   items    — tableau de données
 *   kpiCards — [{ key, label, icon: Component, iconBg, iconColor, borderColor, filter(item) }]
 */
const DossierKPIBar = ({ items = [], kpiCards = [] }) => {
  const counts = useMemo(() => {
    const result = {};
    kpiCards.forEach((card) => {
      result[card.key] = items.filter(card.filter).length;
    });
    return result;
  }, [items, kpiCards]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${kpiCards.length}, 1fr)`,
        gap: 2,
        mb: 3,
        "@media (max-width: 900px)": { gridTemplateColumns: "repeat(2, 1fr)" },
        "@media (max-width: 480px)": { gridTemplateColumns: "1fr" },
      }}
    >
      {kpiCards.map((card) => {
        const Icon = card.icon;
        const count = counts[card.key] ?? 0;
        return (
          <Tooltip key={card.key} title={card.label} arrow placement="top">
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 2,
                background: "#fff", borderRadius: "14px",
                border: "1px solid #F1F5F9",
                borderLeft: `4px solid ${card.borderColor}`,
                px: 2.5, py: 2,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                transition: "box-shadow 0.2s, transform 0.2s",
                cursor: "default",
                "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.10)", transform: "translateY(-2px)" },
              }}
            >
              <Box sx={{ width: 44, height: 44, borderRadius: "12px", backgroundColor: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon sx={{ fontSize: 22, color: card.iconColor }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.1, color: "#0F172A", letterSpacing: "-0.5px" }}>
                  {count}
                </Typography>
                <Typography sx={{ fontSize: "0.73rem", color: "#64748B", fontWeight: 500, mt: 0.2, lineHeight: 1.3 }}>
                  {card.label}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default DossierKPIBar;
