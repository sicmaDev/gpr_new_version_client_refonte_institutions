import React, { useEffect, useState } from "react";
import {
  Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import EventIcon from "@mui/icons-material/Event";
import { LoadingButton } from "@mui/lab";
import { slaCalendar, slaSaveCalendar, slaHolidays, slaAddHoliday, slaUpdateHoliday, slaDeleteHoliday } from "../../apis/Sla/SlaApi";
import {
  Panel, Empty, ErrorNote, Toggle, PrimaryButton, RowActions, SlaDialog, FieldLabel, fieldProps, primarySx,
  tableContainerSx, headCellSx, bodyRowSx,
} from "./slaUi";
import { notify } from "../../Utils/alert";

const DAYS = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// L'heure arrive du serveur sous la forme « 08:00:00 » ; le champ time attend « 08:00 ».
const hm = (t) => (t ? String(t).slice(0, 5) : "");

const EMPTY_HOLIDAY = { date: "", label: "", recurring: true };

// Calendrier ouvré (jours travaillés et horaires) et jours fériés (administrateur).
const SlaCalendrierTab = () => {
  const [days, setDays] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [dialog, setDialog] = useState(null); // { id?, date, label, recurring }
  const [saving, setSaving] = useState(false);
  const [savingHoliday, setSavingHoliday] = useState(false);
  const [error, setError] = useState("");

  const loadHolidays = () => slaHolidays().then(setHolidays).catch((e) => setError(e.message));

  useEffect(() => {
    slaCalendar().then((list) => setDays(list.map((d) => ({ ...d, startTime: hm(d.startTime), endTime: hm(d.endTime) })))).catch((e) => setError(e.message));
    loadHolidays();
  }, []);

  const change = (i, field, value) => setDays((ds) => ds.map((d, k) => (k === i ? { ...d, [field]: value } : d)));

  const saveCalendar = async () => {
    setSaving(true);
    try {
      await slaSaveCalendar(days.map((d) => ({ ...d, startTime: d.startTime || "08:00", endTime: d.endTime || "17:00" })));
      notify("Calendrier enregistré", "success");
      setError("");
    } catch (e) {
      setError(e.message);
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const saveHoliday = async () => {
    if (!dialog.date) { notify("Choisissez la date du jour férié", "error"); return; }
    setSavingHoliday(true);
    try {
      const body = { date: dialog.date, label: dialog.label, recurring: dialog.recurring };
      if (dialog.id) {
        await slaUpdateHoliday(dialog.id, body);
        notify("Jour férié modifié", "success");
      } else {
        await slaAddHoliday(body);
      }
      setDialog(null);
      loadHolidays();
    } catch (e) { notify(e.message, "error"); }
    finally { setSavingHoliday(false); }
  };

  const removeHoliday = async (id) => {
    try { await slaDeleteHoliday(id); loadHolidays(); } catch (e) { notify(e.message, "error"); }
  };

  if (error && !days) return <Empty>{error}</Empty>;
  if (!days) return <Empty>Chargement...</Empty>;

  return (
    <div>
      <Panel
        title="Jours et horaires de travail"
        subtitle="Les délais « en temps ouvré » ne comptent que ces plages horaires, hors jours fériés. Par défaut : lundi à vendredi, de 8 h à 17 h."
        right={
          <LoadingButton
            variant="contained" sx={primarySx} loading={saving} loadingPosition="start"
            startIcon={<SaveIcon />} onClick={saveCalendar}
          >
            Enregistrer
          </LoadingButton>
        }
      >
        {error && <ErrorNote>{error}</ErrorNote>}
        <TableContainer sx={tableContainerSx}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx(120)}>Jour</TableCell>
                <TableCell sx={headCellSx(120)}>Travaillé</TableCell>
                <TableCell sx={headCellSx(140)}>De</TableCell>
                <TableCell sx={headCellSx(140)}>À</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {days.map((d, i) => (
                <TableRow key={d.dayOfWeek} sx={bodyRowSx}>
                  <TableCell sx={{ fontWeight: 600 }}>{DAYS[d.dayOfWeek]}</TableCell>
                  <TableCell>
                    <Toggle checked={!!d.working} onChange={(v) => change(i, "working", v)} />
                  </TableCell>
                  <TableCell>
                    <TextField {...fieldProps} fullWidth={false} type="time" disabled={!d.working} value={d.startTime}
                      onChange={(e) => change(i, "startTime", e.target.value)} sx={{ ...fieldProps.sx, width: 140 }} />
                  </TableCell>
                  <TableCell>
                    <TextField {...fieldProps} fullWidth={false} type="time" disabled={!d.working} value={d.endTime}
                      onChange={(e) => change(i, "endTime", e.target.value)} sx={{ ...fieldProps.sx, width: 140 }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Panel>

      <Panel
        title="Jours fériés"
        subtitle="Ces jours ne comptent pas dans les délais en temps ouvré."
        right={<PrimaryButton startIcon={<AddIcon />} onClick={() => setDialog({ ...EMPTY_HOLIDAY })}>Ajouter</PrimaryButton>}
      >
        {holidays.length === 0 ? <Empty>Aucun jour férié enregistré</Empty> : (
          <TableContainer sx={tableContainerSx}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headCellSx(120)}>Date</TableCell>
                  <TableCell sx={headCellSx(200)}>Libellé</TableCell>
                  <TableCell sx={headCellSx(120)}>Récurrent</TableCell>
                  <TableCell sx={headCellSx(110)}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holidays.map((h) => (
                  <TableRow key={h.id} sx={bodyRowSx}>
                    <TableCell>{h.date}</TableCell>
                    <TableCell>{h.label || "-"}</TableCell>
                    <TableCell>
                      <Chip size="small" label={h.recurring ? "Chaque année" : "Une fois"}
                        sx={{ fontWeight: 600, fontSize: "0.72rem", background: h.recurring ? "#EFF6FF" : "#F1F5F9", color: h.recurring ? "#1D4ED8" : "#475569" }} />
                    </TableCell>
                    <TableCell>
                      <RowActions
                        onEdit={() => setDialog({ id: h.id, date: h.date, label: h.label || "", recurring: !!h.recurring })}
                        onDelete={() => removeHoliday(h.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Panel>

      <SlaDialog
        open={!!dialog} onClose={() => setDialog(null)} icon={EventIcon} loading={savingHoliday} onSubmit={saveHoliday}
        title={dialog?.id ? "Modifier le jour férié" : "Nouveau jour férié"} subtitle="Calendrier du suivi des délais"
      >
        {dialog && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <FieldLabel required>Date</FieldLabel>
              <TextField {...fieldProps} type="date" value={dialog.date} onChange={(e) => setDialog({ ...dialog, date: e.target.value })} />
            </div>
            <div>
              <FieldLabel>Libellé</FieldLabel>
              <TextField {...fieldProps} value={dialog.label} placeholder="Ex. Fête nationale"
                onChange={(e) => setDialog({ ...dialog, label: e.target.value })} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
              <Toggle checked={dialog.recurring} onChange={(v) => setDialog({ ...dialog, recurring: v })} /> Chaque année
            </div>
          </div>
        )}
      </SlaDialog>
    </div>
  );
};

export default SlaCalendrierTab;
