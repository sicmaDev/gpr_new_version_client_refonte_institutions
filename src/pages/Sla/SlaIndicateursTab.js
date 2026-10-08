import React, { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import InboxIcon from "@mui/icons-material/Inbox";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import SpeedIcon from "@mui/icons-material/Speed";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import GavelIcon from "@mui/icons-material/Gavel";
import PolicyIcon from "@mui/icons-material/Policy";
import TimerIcon from "@mui/icons-material/Timer";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import ReplayIcon from "@mui/icons-material/Replay";
import RuleIcon from "@mui/icons-material/Rule";
import { slaStats } from "../../apis/Sla/SlaApi";
import {
  SlaKpiBar, kpi, Panel, Empty, ErrorNote, Bar, SelectField, OutlineButton, downloadCsv,
  fieldProps, tableContainerSx, headCellSx, bodyRowSx,
} from "./slaUi";

const pct = (v) => (v === null || v === undefined ? "-" : `${v} %`);
const num = (v, unit = "") => (v === null || v === undefined ? "-" : `${v}${unit}`);
const isoDate = (d) => d.toISOString().slice(0, 10);

const presets = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const back = (days) => new Date(now.getTime() - days * 86400000);
  return {
    month: { label: "Ce mois", from: isoDate(first), to: isoDate(now) },
    d30: { label: "30 derniers jours", from: isoDate(back(30)), to: isoDate(now) },
    d90: { label: "3 derniers mois", from: isoDate(back(90)), to: isoDate(now) },
    year: { label: "Cette année", from: `${now.getFullYear()}-01-01`, to: isoDate(now) },
  };
};

const GROUP_HEAD = [["", 160], ["Reçues", 90], ["Résolues", 90], ["Dans les délais", 120], ["Taux de respect", 150], ["Délai moyen (h ouvrées)", 150], ["En retard", 90]];

// Tableau de ventilation (risque, catégorie, objet, agence, agent, mois).
const GroupTable = ({ title, rows, file }) => (
  <Panel
    title={title}
    right={rows?.length ? (
      <OutlineButton startIcon={<DownloadIcon />} onClick={() => downloadCsv(file, rows.map((r) => ({
        Libellé: r.libelle, Reçues: r.recues, Résolues: r.resolues, "Dans les délais": r.dansLesDelais,
        "Taux de respect (%)": r.tauxRespect ?? "", "Délai moyen (h ouvrées)": r.delaiMoyenHeuresOuvrees ?? "", "En retard": r.enRetard,
      })))}>Exporter (CSV)</OutlineButton>) : null}
  >
    {!rows || rows.length === 0 ? <Empty>Aucune donnée sur la période</Empty> : (
      <TableContainer sx={tableContainerSx}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>{GROUP_HEAD.map(([h, w], i) => <TableCell key={i} sx={headCellSx(w)}>{h}</TableCell>)}</TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.libelle} sx={bodyRowSx}>
                <TableCell sx={{ fontWeight: 600 }}>{r.libelle}</TableCell>
                <TableCell>{r.recues}</TableCell>
                <TableCell>{r.resolues}</TableCell>
                <TableCell>{r.dansLesDelais}</TableCell>
                <TableCell>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{pct(r.tauxRespect)}</div>
                  <Bar pct={r.tauxRespect} color={r.tauxRespect >= 90 ? "#10B981" : r.tauxRespect >= 70 ? "#F59E0B" : "#EF4444"} />
                </TableCell>
                <TableCell>{num(r.delaiMoyenHeuresOuvrees, " h")}</TableCell>
                <TableCell sx={{ color: r.enRetard > 0 ? "#DC2626" : "#334155", fontWeight: r.enRetard > 0 ? 700 : 400 }}>{r.enRetard}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </Panel>
);

// Petite liste libellé / nombre.
const CountList = ({ title, rows, labelKey, valueKey = "nombre" }) => (
  <Panel title={title} style={{ flex: "1 1 280px", minWidth: 260 }}>
    {!rows || rows.length === 0 ? <Empty>Aucune donnée</Empty> : rows.map((r) => (
      <div key={r[labelKey]} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F1F5F9", fontSize: 13 }}>
        <span style={{ color: "#334155" }}>{r[labelKey]}</span>
        <strong>{r[valueKey]}{r.delaiMoyenHeures !== undefined ? ` (${r.delaiMoyenHeures} h)` : ""}</strong>
      </div>
    ))}
  </Panel>
);

const TYPE_OPTIONS = [["ALL", "Réclamations et dénonciations"], ["CLAIM", "Réclamations"], ["DENUNCIACION", "Dénonciations"]];

// Respect des délais : indicateurs de l'utilisateur (son périmètre). Pilote, DE et utilisateurs « rapports ».
const SlaIndicateursTab = () => {
  const P = presets();
  const [preset, setPreset] = useState("month");
  const [from, setFrom] = useState(P.month.from);
  const [to, setTo] = useState(P.month.to);
  const [type, setType] = useState("ALL");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    slaStats({ type: type === "ALL" ? undefined : type, from, to })
      .then((s) => { setStats(s); setError(""); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [type, from, to]);

  useEffect(() => { load(); }, [load]);

  const choose = (key) => { setPreset(key); if (key !== "custom") { setFrom(P[key].from); setTo(P[key].to); } };
  const g = stats?.global || {};
  const c = stats?.cloture || {};

  const dateField = (value, onChange) => (
    <TextField {...fieldProps} fullWidth={false} type="date" value={value} onChange={onChange}
      sx={{ ...fieldProps.sx, width: 160, "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "0.85rem", height: 38, background: "#fff" } }} />
  );

  const row1 = [
    kpi("recues", "Reçues", InboxIcon, "blue", g.recues),
    kpi("resolues", "Résolues", TaskAltIcon, "green", g.resolues),
    kpi("resol", "Respect de la résolution (solutions approuvées dans le délai)", SpeedIcon, "green", pct(g.tauxRespectResolution)),
    kpi("prise", "Respect de la prise en charge", HowToRegIcon, "blue", pct(g.tauxRespectPriseEnCharge)),
    kpi("conf", "Conformité réglementaire (réponses sous 30 jours, circulaire UMOA)", PolicyIcon, "purple", pct(g.conformiteReglementaire)),
  ];
  const row2 = [
    kpi("hors", "Hors délai réglementaire", GavelIcon, "darkred", g.horsDelaiReglementaire),
    kpi("moy", `Délai moyen${g.delaiMoyenJoursCalendaires != null ? ` (${g.delaiMoyenJoursCalendaires} jours calendaires)` : ""}`, TimerIcon, "slate", g.delaiMoyenHeuresOuvrees != null ? `${g.delaiMoyenHeuresOuvrees} h` : "-"),
    kpi("med", `Délai médian${g.delaiMedianJoursCalendaires != null ? ` (${g.delaiMedianJoursCalendaires} jours calendaires)` : ""}`, HourglassBottomIcon, "slate", g.delaiMedianHeuresOuvrees != null ? `${g.delaiMedianHeuresOuvrees} h` : "-"),
    kpi("clot", "Taux de clôture (satisfaction mesurée)", DoneAllIcon, "blue", pct(c.tauxCloture)),
    kpi("inj", "Client injoignable", PhoneDisabledIcon, "slate", c.clientInjoignable),
  ];
  const row3 = [
    kpi("reo", "Taux de réouverture", ReplayIcon, "amber", pct(g.tauxReouverture)),
    kpi("just", "Retards justifiés", RuleIcon, "purple", g.retardsJustifies),
  ];

  return (
    <div>
      <Panel style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <SelectField value={preset} onChange={choose} minWidth={190}
            options={[...Object.entries(P).map(([k, v]) => [k, v.label]), ["custom", "Période personnalisée"]]} />
          {dateField(from, (e) => { setFrom(e.target.value); setPreset("custom"); })}
          <span style={{ color: "#94a3b8", fontSize: 13 }}>au</span>
          {dateField(to, (e) => { setTo(e.target.value); setPreset("custom"); })}
          <SelectField value={type} onChange={setType} options={TYPE_OPTIONS} minWidth={240} />
        </div>
      </Panel>

      {error && <ErrorNote>{error}</ErrorNote>}
      {loading ? <Empty>Calcul des indicateurs...</Empty> : !stats ? null : (
        <>
          <SlaKpiBar kpis={row1} />
          <SlaKpiBar kpis={row2} />
          <SlaKpiBar kpis={row3} />

          <GroupTable title="Par niveau de risque" rows={stats.parRisque} file="sla_par_risque.csv" />
          <GroupTable title="Par mois" rows={stats.parMois} file="sla_par_mois.csv" />
          <GroupTable title="Par agence" rows={stats.parAgence} file="sla_par_agence.csv" />
          <GroupTable title="Par agent" rows={stats.parAgent} file="sla_par_agent.csv" />
          <GroupTable title="Par catégorie" rows={stats.parCategorie} file="sla_par_categorie.csv" />
          <GroupTable title="Par objet" rows={stats.parObjet} file="sla_par_objet.csv" />

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <CountList title="Plaintes ouvertes en retard (par ancienneté du retard)" rows={stats.retardsParTranche} labelKey="tranche" />
            <CountList title="Remontées automatiques (niveau atteint)" rows={stats.remonteesParNiveau} labelKey="niveau" />
            <CountList title="Motifs de retard" rows={stats.motifsDeRetard} labelKey="motif" />
            <CountList title="Délai d'enregistrement par canal" rows={stats.delaiEnregistrementParCanal} labelKey="canal" />
          </div>
          <Panel title="Réclamations traitées">
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13, color: "#334155" }}>
              <span>Traitées : <strong>{c.traitees}</strong></span>
              <span>Mesurées : <strong>{c.mesurees}</strong></span>
              <span>En attente de mesure : <strong>{c.enAttenteDeMesure}</strong></span>
              <span>Âge moyen en attente : <strong>{num(c.ageMoyenEnAttenteJours, " j")}</strong></span>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
};

export default SlaIndicateursTab;
