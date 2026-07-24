import React from "react";
import { Box, Tooltip, IconButton } from "@mui/material";
import TableRowsIcon from "@mui/icons-material/TableRows";
import GridViewIcon from "@mui/icons-material/GridView";

/**
 * ViewModeToggle — Sélecteur de vue (tableau / cartes) en forme de pilule
 *
 * Props :
 *   value    : "list" | "card"
 *   onChange : (mode: "list" | "card") => void
 */
const ViewModeToggle = ({ value, onChange }) => {
  const baseBtnSx = {
    borderRadius: "8px",
    width: 34,
    height: 34,
    transition: "all 0.15s ease",
  };

  const activeSx = {
    background: "var(--gpr-primary, #005081)",
    color: "#fff",
    "&:hover": { background: "var(--gpr-primary, #005081)" },
  };

  const inactiveSx = {
    color: "#94a3b8",
    "&:hover": { background: "transparent", color: "#64748b" },
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        p: 0.5,
        background: "#f1f5f9",
        borderRadius: "10px",
      }}
    >
      <Tooltip title="Vue tableau">
        <IconButton
          size="small"
          onClick={() => onChange("list")}
          sx={{ ...baseBtnSx, ...(value === "list" ? activeSx : inactiveSx) }}
        >
          <TableRowsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Vue cartes">
        <IconButton
          size="small"
          onClick={() => onChange("card")}
          sx={{ ...baseBtnSx, ...(value === "card" ? activeSx : inactiveSx) }}
        >
          <GridViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ViewModeToggle;
