import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Chip, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import GavelIcon from "@mui/icons-material/Gavel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { slaItems, slaSummary, OWNER_LEVELS, formatDateTime } from "../../apis/Sla/SlaApi";
import { claimTarget, NOT_CONCERNED } from "./slaRoute";
import SlaBadge from "../../components/shared/SlaBadge";
import {
  SlaKpiBar, kpi, Panel, Empty, ErrorNote, SearchField, SelectField,
  tableContainerSx, headCellSx, bodyRowSx, paginationSx,
} from "./slaUi";

const TYPE_MAP = {
  CLAIM:        { label: "Réclamation",  color: "#B91C1C", bg: "#FEE2E2" },
  DENUNCIACION: { label: "Dénonciation", color: "#92400E", bg: "#FEF3C7" },
};

const STATUS_LABEL = {
  SAVED: "À traiter", AFFECTED: "Affectée", TO_APPROUVED: "À approuver", DESAPPROUVED: "Désapprouvée",
  TRANSMITTED: "Transmise", TREAT: "Traitée", SATISFIED: "Satisfait", PARTIAL_SATISFIED: "Part. satisfait",
  UNSATISFIED: "Non satisfait", LITIGATION: "Contentieux", CLASSED: "Classée", WAITING_CUSTOMER: "En attente du client",
};

const TYPE_OPTIONS = [["ALL", "Tous les types"], ["CLAIM", "Réclamations"], ["DENUNCIACION", "Dénonciations"]];
const STATE_OPTIONS = [
  ["ALL", "Tous les états"], ["DEPASSE", "En retard"], ["A_RISQUE", "À risque"], ["EN_COURS", "Dans les délais"],
  ["SUSPENDU", "En pause"], ["RESPECTE", "Respectées"], ["HORS_DELAI", "Hors délai réglementaire"],
];

const chipSx = (color, bg) => ({ fontWeight: 700, fontSize: "0.72rem", color, background: bg, height: 24 });

// Suivi des délais : liste paginée par le serveur, dans le périmètre de l'utilisateur. Aucun calcul de date ici.
const SlaSuiviTab = () => {
  const history = useHistory();
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState({ items: [], total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [state, setState] = useState("ALL");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  // la recherche n'interroge le serveur qu'après une courte pause de frappe
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    Promise.all([slaSummary(type === "ALL" ? undefined : type), slaItems({ type: type === "ALL" ? undefined : type, state, q: query, page, size })])
      .then(([sum, items]) => {
        setSummary(sum);
        setData(items);
        setError("");
        // met à jour le badge du menu
        const overdue = sum?.DEPASSE ?? 0;
        sessionStorage.setItem("sla-overdue", overdue);
        window.dispatchEvent(new CustomEvent("sla-update", { detail: { overdue } }));
      })
      .catch((e) => setError(e.message))
      .finally(() => { if (!silent) setLoading(false); });
  }, [type, state, query, page, size]);

  useEffect(() => { load(false); }, [load]);
  useEffect(() => {
    const id = setInterval(() => load(true), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  const kpis = [
    kpi("late", "En retard", ErrorOutlineIcon, "red", summary?.DEPASSE),
    kpi("risk", "À risque (75 % du délai écoulé)", WarningAmberIcon, "amber", summary?.A_RISQUE),
    kpi("ok", "Dans les délais", CheckCircleOutlineIcon, "green", summary?.EN_COURS),
    kpi("pause", "En pause", PauseCircleOutlineIcon, "slate", summary?.SUSPENDU),
    kpi("reg", "Hors délai réglementaire", GavelIcon, "darkred", summary?.HORS_DELAI),
    kpi("rate", "Taux de respect", TrendingUpIcon, "blue", summary?.tauxRespect != null ? `${summary.tauxRespect} %` : "-"),
    kpi("near", "Limite réglementaire proche", ScheduleIcon, "amber", summary?.PROCHES_REGLEMENTAIRE),
    kpi("unm", "Traitées non mesurées", AssignmentTurnedInIcon, "purple", summary?.TRAITEES_NON_MESUREES),
  ];

  const head = [["Code", 110], ["Type", 110], ["Statut", 120], ["Objet", 140], ["Agence", 120], ["Reçu le", 130],
    ["Échéance", 130], ["Délai", 170], ["Responsable", 130], ["Niveau", 150], ["", 60]];

  return (
    <div>
      <SlaKpiBar kpis={kpis} />

      <Panel>
        {/* Filtres */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
          <SearchField value={search} onChange={setSearch} placeholder="Rechercher par code de plainte..." />
          <SelectField value={type} onChange={(v) => { setType(v); setPage(0); }} options={TYPE_OPTIONS} />
          <SelectField value={state} onChange={(v) => { setState(v); setPage(0); }} options={STATE_OPTIONS} minWidth={200} />
        </div>

        {error && <ErrorNote>{error}</ErrorNote>}

        {loading ? (
          <Empty>Chargement des dossiers...</Empty>
        ) : data.items.length === 0 ? (
          <Empty>Aucun dossier ne correspond aux critères</Empty>
        ) : (
          <>
            <TableContainer sx={tableContainerSx}>
              <Table size="small" sx={{ minWidth: 1150 }}>
                <TableHead>
                  <TableRow>{head.map(([h, w]) => <TableCell key={h || "act"} sx={headCellSx(w)}>{h}</TableCell>)}</TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((item) => {
                    const s = item.sla || {};
                    const t = TYPE_MAP[item.type] || {};
                    const late = s.state === "DEPASSE";
                    const target = claimTarget(item);
                    return (
                      <TableRow key={item.type + item.claimId} sx={bodyRowSx}>
                        <TableCell sx={{ fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap" }}>{item.codeClient || item.code}</TableCell>
                        <TableCell><Chip size="small" label={t.label || item.type} sx={chipSx(t.color, t.bg)} /></TableCell>
                        <TableCell><Chip size="small" label={STATUS_LABEL[item.status] || item.status} sx={chipSx("#475569", "#F1F5F9")} /></TableCell>
                        <TableCell sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.objetLibelle || "-"}</TableCell>
                        <TableCell sx={{ maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.servicePointLibelle || "-"}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", color: "#64748B" }}>{formatDateTime(item.receiptDateTime)}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", color: late ? "#DC2626" : "#64748B", fontWeight: late ? 700 : 400 }}>{formatDateTime(s.dueAt)}</TableCell>
                        <TableCell sx={{ minWidth: 170 }}><SlaBadge sla={s} bar /></TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{s.ownerName || <span style={{ color: "#CBD5E1" }}>Non affectée</span>}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {OWNER_LEVELS[s.ownerLevel] || "-"}
                          {(s.ownerLevel === "RA" || s.ownerLevel === "AGENT") && item.servicePointLibelle && (
                            <div style={{ fontSize: 11.5, color: "#64748B" }}>{item.servicePointLibelle}</div>
                          )}
                          {s.autoEscalated && <Chip size="small" label="Remontée" title="Remontée automatiquement" sx={{ ...chipSx("#6D28D9", "#F5F3FF"), ml: 0.8 }} />}
                        </TableCell>
                        <TableCell>
                          <Tooltip title={target.allowed ? "Ouvrir le dossier" : NOT_CONCERNED}>
                            <span>
                              <IconButton color="primary" disabled={!target.allowed} onClick={() => history.push(target.url)}><OpenInNewIcon /></IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination (côté serveur) */}
            <TablePagination
              component="div" count={data.total} page={page} rowsPerPage={size} rowsPerPageOptions={[10, 20, 50, 100]}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
              labelRowsPerPage="Lignes par page :"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
              sx={paginationSx}
            />
          </>
        )}
      </Panel>
    </div>
  );
};

export default SlaSuiviTab;
