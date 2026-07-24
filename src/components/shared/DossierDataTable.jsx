import React, { useState } from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import { Tooltip } from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  SAVED:             { label: "A traiter",       bg: "#e0f2fe", color: "#0369a1" },
  TEMP_SAVED:        { label: "Sauvegardée",     bg: "#f1f5f9", color: "#64748b" },
  AFFECTED:          { label: "Affectée",        bg: "#fef9c3", color: "#854d0e" },
  TO_APPROUVED:      { label: "A approuver",     bg: "#fef3c7", color: "#92400e" },
  DESAPPROUVED:      { label: "Désapprouvée",    bg: "#fee2e2", color: "#991b1b" },
  TREAT:             { label: "En traitement",   bg: "#dcfce7", color: "#166534" },
  CLASSED:           { label: "Classée",         bg: "#f3e8ff", color: "#6b21a8" },
  UNSATISFIED:       { label: "Non satisfait",   bg: "#fee2e2", color: "#991b1b" },
  PARTIAL_SATISFIED: { label: "Part. satisfait", bg: "#fef3c7", color: "#92400e" },
  SATISFIED:         { label: "Satisfait",       bg: "#dcfce7", color: "#166534" },
  LITIGATION:        { label: "Contentieux",     bg: "#ffe4e6", color: "#be123c" },
};

const GRAVITY_CONFIG = {
  MINEUR: { label: "Mineur", bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
  MOYEN:  { label: "Moyen",  bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
  GRAVE:  { label: "Grave",  bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

const AVATAR_COLORS = ["var(--gpr-primary, #005081)","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];
const avatarColor = (str = "") => AVATAR_COLORS[(str.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

const initials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 600, background: cfg.bg, color: cfg.color, whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
};

const GravityDot = ({ level }) => {
  const cfg = GRAVITY_CONFIG[level];
  if (!cfg) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: cfg.color, background: cfg.bg, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

// ── Summary bar (stats by status) ─────────────────────────────────────────

const SummaryBar = ({ records }) => {
  const counts = records.reduce((acc, r) => {
    const s = r.status || "SAVED";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const items = Object.entries(counts).slice(0, 4).map(([status, count]) => {
    const cfg = STATUS_CONFIG[status] || { label: status, bg: "#f1f5f9", color: "#64748b" };
    return { status, count, ...cfg };
  });

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
      {items.map(item => (
        <div key={item.status} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "white", border: `1.5px solid ${item.bg}`,
          borderRadius: 12, padding: "8px 14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.count}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Card view ──────────────────────────────────────────────────────────────

const DossierCard = ({ record, onRowClick }) => {
  const rawName = record.clientFirstAndLastName;
  const name = rawName || "Anonyme";
  const code = record.codeClient || record.code || "—";
  const objet = record.objet?.libelle || record.subject || "—";
  const isLate = record.retardDay > 0;

  return (
    <div
      onClick={() => onRowClick?.({}, record, 0)}
      style={{
        background: "white", borderRadius: 14, cursor: "pointer",
        border: "1.5px solid #f1f5f9",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; }}
    >
      {/* Top strip — colored by gravity */}
      <div style={{
        height: 4,
        background: record.objet?.risqueLevel === "GRAVE" ? "#ef4444"
          : record.objet?.risqueLevel === "MOYEN" ? "#f59e0b"
          : "#22c55e",
      }} />

      <div style={{ padding: "14px 16px" }}>
        {/* Header: avatar + code + status */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: avatarColor(name),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "white",
          }}>
            {initials(name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", fontFamily: "monospace", marginBottom: 3 }}>
              {code}
            </div>
            <StatusBadge status={record.status} />
          </div>
          {isLate && (
            <Tooltip title={`Retard de ${record.retardDay} jour(s)`}>
              <WarningAmberIcon style={{ fontSize: 18, color: "#ef4444", flexShrink: 0 }} />
            </Tooltip>
          )}
        </div>

        {/* Client */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <PersonOutlineIcon style={{ fontSize: 14, color: "#94a3b8", flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {rawName ? name : <em>Anonyme</em>}
          </span>
        </div>

        {/* Objet */}
        <div style={{
          fontSize: 12, color: "#64748b", background: "#f8fafc",
          borderRadius: 8, padding: "6px 10px", marginBottom: 10,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          borderLeft: "3px solid #e2e8f0",
        }}>
          {objet}
        </div>

        {/* Footer: gravity + date */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
          <GravityDot level={record.objet?.risqueLevel} />
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8" }}>
            <CalendarTodayIcon style={{ fontSize: 12 }} />
            {record.createdAtFormated || record.receiptDateTime?.slice(0, 10) || "—"}
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div style={{ padding: "8px 16px", borderTop: "1px solid #f8fafc", background: "#fafbff", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gpr-primary, #005081)", display: "flex", alignItems: "center", gap: 4 }}>
          Ouvrir →
        </span>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────

const VIEW_KEY = "gpr_datatable_view";

const DossierDataTable = ({
  title,
  records = [],
  columns,
  config,
  onRowClick,
  isLoading = false,
}) => {
  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || "table");

  const switchView = (v) => {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  };

  const tableConfig = {
    ...config,
    page_size: config?.page_size ?? 15,
    length_menu: config?.length_menu ?? [15, 25, 50],
    show_filter: config?.show_filter ?? true,
    show_pagination: config?.show_pagination ?? true,
    button: { excel: false, print: false, extra: false },
    dynamic_class_name: "highlight display dataTable dtr-inline",
  };

  return (
    <div style={{ padding: 16 }}>

      {/* ── Header bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12, marginBottom: 16,
        background: "white", borderRadius: 14, padding: "14px 18px",
        border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {records.length} dossier{records.length > 1 ? "s" : ""}
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
          <Tooltip title="Vue tableau">
            <button
              onClick={() => switchView("table")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 34, height: 34, border: "none", borderRadius: 8, cursor: "pointer",
                background: view === "table" ? "white" : "transparent",
                color: view === "table" ? "var(--gpr-primary, #005081)" : "#94a3b8",
                boxShadow: view === "table" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s",
              }}
            >
              <TableRowsIcon style={{ fontSize: 18 }} />
            </button>
          </Tooltip>
          <Tooltip title="Vue cards">
            <button
              onClick={() => switchView("cards")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 34, height: 34, border: "none", borderRadius: 8, cursor: "pointer",
                background: view === "cards" ? "white" : "transparent",
                color: view === "cards" ? "var(--gpr-primary, #005081)" : "#94a3b8",
                boxShadow: view === "cards" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s",
              }}
            >
              <ViewModuleIcon style={{ fontSize: 18 }} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ── Summary bar ── */}
      {records.length > 0 && <SummaryBar records={records} />}

      {/* ── Loading ── */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>
          Chargement...
        </div>
      )}

      {/* ── Cards view ── */}
      {!isLoading && view === "cards" && (
        <>
          {records.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", background: "white", borderRadius: 14, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Aucun dossier</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Les dossiers apparaîtront ici</div>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}>
              {records.map((record, i) => (
                <DossierCard key={record.id || record.code || i} record={record} onRowClick={onRowClick} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Table view ── */}
      {!isLoading && view === "table" && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <ReactDatatable
            className="responsive-table"
            config={tableConfig}
            records={records}
            columns={columns}
            onRowClicked={onRowClick}
          />
        </div>
      )}
    </div>
  );
};

export default DossierDataTable;
