import React, { useMemo } from "react";
import { Box, Typography, Tooltip } from "@mui/material";

/**
 * ConfigKPIBar - Barre de métriques générique pour les modules de configuration
 *
 * Props :
 *   items  : array  - données du module
 *   kpis   : array  - définitions des KPIs :
 *     { key, label, icon: Component, iconBg, iconColor, borderColor, filter: fn,
 *       value?: any | (items) => any  - surcharge l'affichage (au lieu du compte filtré) }
 */
const ConfigKPIBar = ({ items = [], kpis = [] }) => {
  const counts = useMemo(() => {
    const result = {};
    kpis.forEach((k) => {
      result[k.key] = k.value !== undefined
        ? (typeof k.value === "function" ? k.value(items) : k.value)
        : items.filter(k.filter).length;
    });
    return result;
  }, [items, kpis]);

  if (kpis.length === 0) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(kpis.length, 5)}, 1fr)`,
        gap: 2,
        mb: 3,
        "@media (max-width: 1100px)": { gridTemplateColumns: "repeat(3, 1fr)" },
        "@media (max-width: 700px)":  { gridTemplateColumns: "repeat(2, 1fr)" },
        "@media (max-width: 480px)":  { gridTemplateColumns: "1fr" },
      }}
    >
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const count = counts[kpi.key] ?? 0;
        return (
          <Tooltip key={kpi.key} title={kpi.label} arrow placement="top">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #F1F5F9",
                borderLeft: `4px solid ${kpi.borderColor}`,
                px: 2.5,
                py: 2,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                transition: "box-shadow 0.2s, transform 0.2s",
                cursor: "default",
                "&:hover": {
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  backgroundColor: kpi.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 22, color: kpi.iconColor }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.7rem",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    color: "#0F172A",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {count}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.73rem",
                    color: "#64748B",
                    fontWeight: 500,
                    mt: 0.2,
                    lineHeight: 1.3,
                  }}
                >
                  {kpi.label}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default ConfigKPIBar;
