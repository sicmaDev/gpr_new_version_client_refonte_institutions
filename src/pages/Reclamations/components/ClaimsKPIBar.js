import React, { useMemo } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PersonPinIcon from "@mui/icons-material/PersonPin";

/**
 * Barre de 4 KPIs calculés dynamiquement depuis la liste des réclamations
 */

const KPI_CARDS = [
  {
    key: "total",
    label: "Total réclamations",
    icon: AssignmentIcon,
    iconBg: "#DBEAFE",
    iconColor: "#1D4ED8",
    borderColor: "#3B82F6",
    filter: () => true,
  },
  {
    key: "pending",
    label: "En cours de traitement",
    icon: HourglassEmptyIcon,
    iconBg: "#FEF3C7",
    iconColor: "#92400E",
    borderColor: "#F59E0B",
    filter: (c) =>
      ["SAVED", "TEMP_SAVED", "AFFECTED", "TO_APPROUVED", "DESAPPROUVED"].includes(c.status),
  },
  {
    key: "affected",
    label: "Affectées",
    icon: PersonPinIcon,
    iconBg: "#EDE9FE",
    iconColor: "#6D28D9",
    borderColor: "#8B5CF6",
    filter: (c) => c.status === "AFFECTED",
  },
  {
    key: "treated",
    label: "Traitées",
    icon: CheckCircleIcon,
    iconBg: "#D1FAE5",
    iconColor: "#065F46",
    borderColor: "#10B981",
    filter: (c) =>
      ["TREAT", "SATISFIED", "UNSATISFIED", "PARTIAL_SATISFIED", "CLASSED"].includes(c.status),
  },
  {
    key: "overdue",
    label: "En retard / Alerte",
    icon: WarningAmberIcon,
    iconBg: "#FEE2E2",
    iconColor: "#B91C1C",
    borderColor: "#EF4444",
    filter: (c) =>
      c.retardDay !== undefined && c.retardDay <= 0 &&
      !["SATISFIED", "UNSATISFIED", "PARTIAL_SATISFIED", "LITIGATION"].includes(c.status),
  },
];

const ClaimsKPIBar = ({ items = [] }) => {
  const counts = useMemo(() => {
    const result = {};
    KPI_CARDS.forEach((card) => {
      result[card.key] = items.filter(card.filter).length;
    });
    return result;
  }, [items]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 2,
        mb: 3,
        "@media (max-width: 1100px)": {
          gridTemplateColumns: "repeat(3, 1fr)",
        },
        "@media (max-width: 700px)": {
          gridTemplateColumns: "repeat(2, 1fr)",
        },
        "@media (max-width: 480px)": {
          gridTemplateColumns: "1fr",
        },
      }}
    >
      {KPI_CARDS.map((card) => {
        const Icon = card.icon;
        const count = counts[card.key] ?? 0;

        return (
          <Tooltip key={card.key} title={card.label} arrow placement="top">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #F1F5F9",
                borderLeft: `4px solid ${card.borderColor}`,
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
                  backgroundColor: card.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 22, color: card.iconColor }} />
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

export default ClaimsKPIBar;
