import React, { useEffect, useState } from "react";
import { MenuItem, Select, TextField } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { LoadingButton } from "@mui/lab";
import { slaSettings, slaSaveSettings } from "../../apis/Sla/SlaApi";
import { Panel, Empty, ErrorNote, Toggle, fieldProps, primarySx } from "./slaUi";
import { notify } from "../../Utils/alert";

const Field = ({ label, help, children }) => (
  <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "14px 0", borderBottom: "1px solid #F1F5F9", flexWrap: "wrap" }}>
    <div style={{ flex: "1 1 320px" }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>{label}</div>
      {help && <div style={{ fontSize: 12, color: "#64748B", marginTop: 2, lineHeight: 1.5 }}>{help}</div>}
    </div>
    <div style={{ flex: "0 0 240px" }}>{children}</div>
  </div>
);

// Paramètres généraux du suivi des délais (administrateur).
const SlaParametresTab = () => {
  const [values, setValues] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { slaSettings().then(setValues).catch((e) => setError(e.message)); }, []);

  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  const bool = (key) => String(values[key]) === "true";

  const save = async () => {
    setSaving(true);
    try {
      const saved = await slaSaveSettings(values);
      setValues(saved);
      setError("");
      notify("Paramètres enregistrés", "success");
      // le menu et les écrans testent si le SLA est actif
      sessionStorage.removeItem("sla-enabled");
      window.dispatchEvent(new CustomEvent("sla-status-changed"));
    } catch (e) {
      setError(e.message);
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (error && !values) return <Empty>{error}</Empty>;
  if (!values) return <Empty>Chargement...</Empty>;

  const toggle = (key) => (
    <Toggle checked={bool(key)} onChange={(v) => set(key, v ? "true" : "false")} />
  );
  const number = (key, min = 0) => (
    <TextField {...fieldProps} type="number" inputProps={{ min }} value={values[key]} onChange={(e) => set(key, e.target.value)} />
  );

  return (
    <Panel
      title="Paramètres du suivi des délais"
      right={
        <LoadingButton variant="contained" sx={primarySx} loading={saving} loadingPosition="start" startIcon={<SaveIcon />} onClick={save}>
          Enregistrer
        </LoadingButton>
      }
    >
      {error && <ErrorNote>{error}</ErrorNote>}

      <Field label="Activer le suivi des délais (SLA)"
        help="Désactivé, GPR se comporte exactement comme avant. À l'activation, les plaintes déjà ouvertes sont reprises sans aucune alerte rétroactive (aucun rappel, retard ni remontée pour ce qui est déjà dépassé).">
        {toggle("sla.enabled")}
      </Field>
      <Field label="Remontée automatique" help="Un dossier en retard, sans action humaine pendant le délai de grâce, est transmis au niveau supérieur (agent, chef d'agence, direction, Pilote, DE).">
        {toggle("sla.auto_escalation")}
      </Field>
      <Field label="Récapitulatif quotidien des rappels" help="Les rappels (50 % et 75 %) sont regroupés dans un seul message par personne. Les retards, remontées et alertes réglementaires partent immédiatement.">
        {toggle("sla.daily_digest")}
      </Field>
      <Field label="Heure du récapitulatif">
        <TextField {...fieldProps} type="time" value={values["sla.digest_time"]} onChange={(e) => set("sla.digest_time", e.target.value)} />
      </Field>
      <Field label="Contrôle des délais (minutes)" help="Fréquence à laquelle le serveur vérifie les échéances.">{number("sla.scan_minutes", 1)}</Field>
      <Field label="Échéance réglementaire (jours calendaires)" help="Circulaire n° 002-2020/CB/C de la Commission bancaire de l'UMOA : 30 jours. Jamais mise en pause.">{number("sla.regulatory_days", 1)}</Field>
      <Field label="Alerte avant la limite réglementaire (jours)">{number("sla.regulatory_warning_days", 0)}</Field>
      <Field label="Client injoignable : tentatives" help="Nombre de tentatives de contact sans succès avant que le Pilote puisse clôturer sans mesure.">{number("sla.unreachable_attempts", 1)}</Field>
      <Field label="Client injoignable : période (jours)">{number("sla.unreachable_days", 1)}</Field>
      <Field label="Message d'attente au client en cas de retard"
        help="Réclamations seulement (jamais pour une dénonciation : l'identité du dénonciateur est masquée). Aucun message par défaut.">
        <Select
          size="small" fullWidth value={values["sla.customer_waiting_message"]}
          onChange={(e) => set("sla.customer_waiting_message", e.target.value)}
          sx={{ borderRadius: "9px", fontSize: 14 }}
        >
          <MenuItem value="NONE">Aucun</MenuItem>
          <MenuItem value="MANUAL">Proposé, envoyé par un humain</MenuItem>
          <MenuItem value="AUTO">Envoyé automatiquement</MenuItem>
        </Select>
      </Field>
      <Field label="Fuseau horaire" help="Information : les dates du serveur suivent l'horloge du serveur, qui doit être réglée sur ce fuseau.">
        <TextField {...fieldProps} value={values["sla.timezone"]} onChange={(e) => set("sla.timezone", e.target.value)} />
      </Field>
    </Panel>
  );
};

export default SlaParametresTab;
