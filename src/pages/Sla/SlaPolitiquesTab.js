import React, { useEffect, useState } from "react";
import { Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { LoadingButton } from "@mui/lab";
import { slaPolicies, slaSavePolicies } from "../../apis/Sla/SlaApi";
import { Panel, Empty, ErrorNote, Toggle, fieldProps, primarySx, tableContainerSx, headCellSx, bodyRowSx } from "./slaUi";
import { notify } from "../../Utils/alert";

const TYPES = { CLAIM: "Réclamations", DENUNCIACION: "Dénonciations", SUGGESTION: "Suggestions" };
const RISKS = { GRAVE: "Grave", MOYEN: "Moyen", MINEUR: "Mineur" };
const RISK_ORDER = { GRAVE: 0, MOYEN: 1, MINEUR: 2 };
const RISK_COLORS = {
  GRAVE: { bg: "#FEE2E2", color: "#B91C1C" },
  MOYEN: { bg: "#FEF3C7", color: "#92400E" },
  MINEUR: { bg: "#DCFCE7", color: "#166534" },
};

// Les durées sont saisies en heures (le serveur les stocke en minutes). Un jour ouvré = 9 h par défaut.
const toHours = (minutes) => Math.round((minutes / 60) * 100) / 100;
const toMinutes = (hours) => Math.round(Number(hours) * 60);

// Politique de délais par type de plainte et niveau de risque (administrateur).
const SlaPolitiquesTab = () => {
  const [rows, setRows] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    slaPolicies()
      .then((list) => setRows(list.map((p) => ({
        ...p,
        takeoverH: toHours(p.takeoverMinutes), resolutionH: toHours(p.resolutionMinutes),
        closureH: toHours(p.closureMinutes), reopenH: toHours(p.reopenMinutes), graceH: toHours(p.graceMinutes),
      })).sort((a, b) => (a.claimType === b.claimType ? RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel] : a.claimType.localeCompare(b.claimType)))))
      .catch((e) => setError(e.message));
  }, []);

  const change = (i, field, value) => setRows((rs) => rs.map((r, k) => (k === i ? { ...r, [field]: value } : r)));

  const save = async () => {
    setSaving(true);
    try {
      const payload = rows.map((r) => ({
        id: r.id, claimType: r.claimType, riskLevel: r.riskLevel, businessTime: r.businessTime, active: r.active,
        takeoverMinutes: toMinutes(r.takeoverH), resolutionMinutes: toMinutes(r.resolutionH),
        closureMinutes: r.claimType === "CLAIM" ? toMinutes(r.closureH) : 0,
        reopenMinutes: r.claimType === "CLAIM" ? toMinutes(r.reopenH) : 0,
        reminder1Pct: Number(r.reminder1Pct), reminder2Pct: Number(r.reminder2Pct),
        graceMinutes: toMinutes(r.graceH), complianceTarget: Number(r.complianceTarget),
      }));
      await slaSavePolicies(payload);
      notify("Politiques enregistrées. Elles s'appliquent aux nouvelles plaintes ; les échéances des plaintes en cours ne changent pas.", "success");
      setError("");
    } catch (e) {
      setError(e.message);
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (error && !rows) return <Empty>{error}</Empty>;
  if (!rows) return <Empty>Chargement...</Empty>;

  const num = (r, i, field, width = 84) => (
    <TextField
      {...fieldProps} fullWidth={false} type="number" inputProps={{ min: 0, step: "any" }} value={r[field]}
      onChange={(e) => change(i, field, e.target.value)} sx={{ ...fieldProps.sx, width }}
    />
  );
  const dash = <span style={{ color: "#CBD5E1" }}>-</span>;

  return (
    <Panel
      title="Politiques de délais"
      subtitle="Une politique par type de plainte et niveau de risque. Les durées sont en heures ; en temps ouvré, une journée de travail correspond à la durée du calendrier (9 h par défaut : 3 jours ouvrés = 27 h). Le délai de l'objet, s'il est renseigné, prime sur la résolution. Les échéances sont figées à l'ouverture de la plainte : modifier une politique ne change pas les plaintes en cours. Les dénonciations n'ont pas de délai de clôture (pas de mesure de satisfaction)."
      right={
        <LoadingButton variant="contained" sx={primarySx} loading={saving} loadingPosition="start" startIcon={<SaveIcon />} onClick={save}>
          Enregistrer
        </LoadingButton>
      }
    >
      {error && <ErrorNote>{error}</ErrorNote>}
      <TableContainer sx={tableContainerSx}>
        <Table size="small" sx={{ minWidth: 1100 }}>
          <TableHead>
            <TableRow>
              {[["Type", 120], ["Risque", 90], ["Temps ouvré", 90], ["Prise en charge (h)", 110], ["Résolution (h)", 110], ["Clôture (h)", 100],
                ["Nouveau cycle (h)", 110], ["Rappel 1 (%)", 100], ["Rappel 2 (%)", 100], ["Grâce (h)", 100], ["Objectif (%)", 100], ["Actif", 70]]
                .map(([h, w]) => <TableCell key={h} sx={headCellSx(w)}>{h}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => {
              const claim = r.claimType === "CLAIM";
              const rc = RISK_COLORS[r.riskLevel];
              return (
                <TableRow key={r.id ?? i} sx={bodyRowSx}>
                  <TableCell sx={{ fontWeight: 600 }}>{TYPES[r.claimType] || r.claimType}</TableCell>
                  <TableCell>
                    {r.claimType === "SUGGESTION" || !rc ? "Unique" : (
                      <Chip size="small" label={RISKS[r.riskLevel]} sx={{ fontWeight: 700, fontSize: "0.72rem", background: rc.bg, color: rc.color }} />
                    )}
                  </TableCell>
                  <TableCell><Toggle checked={!!r.businessTime} onChange={(v) => change(i, "businessTime", v)} /></TableCell>
                  <TableCell>{r.claimType === "SUGGESTION" ? dash : num(r, i, "takeoverH")}</TableCell>
                  <TableCell>{num(r, i, "resolutionH")}</TableCell>
                  <TableCell>{claim ? num(r, i, "closureH") : dash}</TableCell>
                  <TableCell>{claim ? num(r, i, "reopenH") : dash}</TableCell>
                  <TableCell>{num(r, i, "reminder1Pct", 76)}</TableCell>
                  <TableCell>{num(r, i, "reminder2Pct", 76)}</TableCell>
                  <TableCell>{num(r, i, "graceH")}</TableCell>
                  <TableCell>{num(r, i, "complianceTarget", 76)}</TableCell>
                  <TableCell><Toggle checked={!!r.active} onChange={(v) => change(i, "active", v)} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Panel>
  );
};

export default SlaPolitiquesTab;
