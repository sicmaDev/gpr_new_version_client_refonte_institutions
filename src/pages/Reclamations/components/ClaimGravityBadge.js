import React from "react";
import { Box, Chip, Tooltip } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MoveUpIcon from "@mui/icons-material/MoveUp";

const GRAVITY_CONFIG = {
  MINEUR: {
    label: "Mineur",
    bg: "#DCFCE7",
    color: "#15803D",
    border: "#86EFAC",
    Icon: CheckCircleOutlineIcon,
  },
  MOYEN: {
    label: "Moyen",
    bg: "#FEF9C3",
    color: "#A16207",
    border: "#FDE047",
    Icon: ReportProblemOutlinedIcon,
  },
  GRAVE: {
    label: "Grave",
    bg: "#FEE2E2",
    color: "#B91C1C",
    border: "#FCA5A5",
    Icon: ErrorOutlineIcon,
    pulse: true,
  },
};

const ClaimGravityBadge = ({ gravity, transmitted = false, size = "small" }) => {
  const cfg = GRAVITY_CONFIG[gravity] || {
    label: gravity || "-",
    bg: "#F3F4F6",
    color: "#374151",
    border: "#D1D5DB",
    Icon: null,
  };

  const { Icon, pulse } = cfg;

  const chip = (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      <Chip
        icon={
          Icon ? (
            <Icon
              sx={{
                fontSize: "13px !important",
                color: `${cfg.color} !important`,
                ...(pulse && {
                  animation: "gravityPulse 1.6s ease-in-out infinite",
                }),
              }}
            />
          ) : undefined
        }
        label={cfg.label}
        size={size}
        sx={{
          backgroundColor: cfg.bg,
          color: cfg.color,
          border: `1px solid ${cfg.border}`,
          fontWeight: 700,
          fontSize: "0.72rem",
          height: "22px",
          "& .MuiChip-label": { px: 1 },
          "& .MuiChip-icon": { ml: 0.5 },
          "@keyframes gravityPulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.4 },
          },
        }}
      />
      {transmitted && (
        <Tooltip title="Transmise à une autorité supérieure">
          <MoveUpIcon sx={{ fontSize: 16, color: "#DC2626", cursor: "help" }} />
        </Tooltip>
      )}
    </Box>
  );

  return chip;
};

export default ClaimGravityBadge;
export { GRAVITY_CONFIG };
