import React from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SpeedIcon from "@mui/icons-material/Speed";
import { slaStatus, slaItems, OWNER_LEVELS, formatDateTime } from "../../apis/Sla/SlaApi";
import SlaBadge from "../../components/shared/SlaBadge";

// Quand le suivi des délais (SLA) est actif, les pages Alertes lisent les mêmes données que l'écran « Suivi » :
// plaintes en retard et à risque, avec échéance, responsable et niveau de remontée, calculés par le serveur.
// Sans SLA, les pages gardent leur fonctionnement d'avant (ces fonctions ne sont pas utilisées).

// Renvoie null si le SLA n'est pas actif (la page garde alors son ancien chargement).
export const loadSlaAlertRows = async (type) => {
  const status = await slaStatus().catch(() => null);
  if (!status?.enabled) return null;
  const [late, risk] = await Promise.all([
    slaItems({ type, state: "DEPASSE", page: 0, size: 200 }),
    slaItems({ type, state: "A_RISQUE", page: 0, size: 200 }),
  ]);
  const toRow = (item) => ({
    claimId: item.claimId,
    claimCode: item.code,
    claimCodeClient: item.codeClient || item.code,
    claimClient: null, // le suivi n'expose jamais l'identité du client
    objetLibelle: item.objetLibelle,
    servicePointLibelle: item.servicePointLibelle,
    status: item.status,
    receiptDateTime: item.receiptDateTime,
    declenchedDate: item.sla?.dueAt,
    sla: item.sla,
    slaState: item.sla?.state,
  });
  return [...(late?.items || []), ...(risk?.items || [])].map(toRow);
};

export const SLA_ALERT_KPI = (withMeasure) => [
  { key: "total", label: "En retard ou à risque", icon: SpeedIcon, iconBg: "#FEE2E2", iconColor: "#B91C1C", borderColor: "#EF4444", filter: () => true },
  { key: "late", label: "En retard", icon: WarningAmberIcon, iconBg: "#FEE2E2", iconColor: "#B91C1C", borderColor: "#EF4444", filter: (c) => c.slaState === "DEPASSE" },
  { key: "risk", label: "À risque", icon: AssignmentIcon, iconBg: "#FEF3C7", iconColor: "#92400E", borderColor: "#F59E0B", filter: (c) => c.slaState === "A_RISQUE" },
  ...(withMeasure
    ? [{ key: "toMeasure", label: "En attente mesure satisfaction", icon: HourglassEmptyIcon, iconBg: "#EFF6FF", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: (c) => c.status === "TREAT" }]
    : []),
];

export const SLA_ALERT_CHIPS = (withMeasure) => [
  { value: "ALL", label: "Tous", filter: () => true },
  { value: "LATE", label: "En retard", filter: (c) => c.slaState === "DEPASSE" },
  { value: "RISK", label: "À risque", filter: (c) => c.slaState === "A_RISQUE" },
  ...(withMeasure ? [{ value: "TO_MEASURE", label: "En attente de mesure", filter: (c) => c.status === "TREAT" }] : []),
];

// Colonnes du tableau en mode SLA : échéance, état, responsable, niveau d'escalade.
export const slaTableColumns = (openUrl, actionLabel) => [
  {
    id: "claimCodeClient", label: "Code", sortable: true, minWidth: 110,
    render: (item) => <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#005081", fontFamily: "monospace" }}>{item.claimCodeClient || "-"}</span>,
  },
  {
    id: "objetLibelle", label: "Objet", sortable: true, minWidth: 150,
    render: (item) => <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{item.objetLibelle || "-"}</span>,
    sortValue: (item) => item.objetLibelle || "",
  },
  {
    id: "receiptDateTime", label: "Reçu le", sortable: true, minWidth: 130,
    render: (item) => <span style={{ fontSize: "0.80rem", color: "#475569", whiteSpace: "nowrap" }}>{formatDateTime(item.receiptDateTime)}</span>,
    sortValue: (item) => item.receiptDateTime || "",
  },
  {
    id: "declenchedDate", label: "Échéance", sortable: true, minWidth: 130,
    render: (item) => <span style={{ fontSize: "0.80rem", color: item.slaState === "DEPASSE" ? "#DC2626" : "#475569", fontWeight: item.slaState === "DEPASSE" ? 700 : 400, whiteSpace: "nowrap" }}>{formatDateTime(item.declenchedDate)}</span>,
    sortValue: (item) => item.declenchedDate || "",
  },
  {
    id: "sla", label: "Délai", sortable: false, minWidth: 190,
    render: (item) => <SlaBadge sla={item.sla} bar />,
  },
  {
    id: "owner", label: "Responsable", sortable: true, minWidth: 140,
    render: (item) => <span style={{ fontSize: "0.80rem" }}>{item.sla?.ownerName || <em style={{ color: "#94A3B8" }}>Non affectée</em>}</span>,
    sortValue: (item) => item.sla?.ownerName || "",
  },
  {
    id: "level", label: "Niveau d'escalade", sortable: false, minWidth: 140,
    render: (item) => (
      <span style={{ fontSize: "0.80rem", whiteSpace: "nowrap" }}>
        {OWNER_LEVELS[item.sla?.ownerLevel] || "-"}
        {item.sla?.autoEscalated && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: "#7C3AED", background: "#F5F3FF", padding: "1px 7px", borderRadius: 10 }}>Remontée</span>}
      </span>
    ),
  },
  {
    id: "action", label: "Action", sortable: false, minWidth: 90,
    render: (item) => (
      <span onClick={(e) => { e.stopPropagation(); openUrl(item); }}
        style={{ fontSize: "0.80rem", color: "#005081", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
        {actionLabel(item)}
      </span>
    ),
  },
];
