import React, { useEffect, useState } from "react";
import { MenuItem, Select, TextField } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import GavelIcon from "@mui/icons-material/Gavel";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { LoadingButton } from "@mui/lab";
import { slaSettings, slaSaveSettings } from "../../apis/Sla/SlaApi";
import { Panel, Empty, ErrorNote, Toggle, fieldProps, primarySx } from "./slaUi";
import { notify } from "../../Utils/alert";
import { ChargementRond } from "../../components/shared/ChargementRond";

const P = "var(--gpr-primary, #005081)";
const PL = "var(--gpr-primary-light, #e6f0f6)";

// Une carte = une rubrique de réglages (présentation « sections en cartes »)
const Carte = ({ titre, icone: Icone, note, children }) => (
  <section style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, background: "#fff" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: PL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icone style={{ fontSize: 19, color: P }} />
      </div>
      <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>{titre}</h3>
    </div>
    {children}
    {note && <p style={{ margin: "auto 0 0", paddingTop: 4, fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{note}</p>}
  </section>
);

// Une ligne de réglage : libellé (et explication courte) à gauche, champ à droite
const Ligne = ({ label, help, children, colonne }) => (
  <div style={{ display: "flex", flexDirection: colonne ? "column" : "row", alignItems: colonne ? "stretch" : "center", justifyContent: "space-between", gap: colonne ? 6 : 12 }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>{label}</div>
      {help && <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2, lineHeight: 1.45 }}>{help}</div>}
    </div>
    <div style={{ flexShrink: 0 }}>{children}</div>
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
  if (!values) return <Empty><ChargementRond taille={28} /></Empty>;

  const toggle = (key) => (
    <Toggle checked={bool(key)} onChange={(v) => set(key, v ? "true" : "false")} />
  );
  // Nombre + unité (« heures ouvrées », « % du délai »…)
  const number = (key, unite, min = 0) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <TextField {...fieldProps} fullWidth={false} type="number" inputProps={{ min, style: { textAlign: "center" } }} value={values[key]}
        onChange={(e) => set(key, e.target.value)} sx={{ ...fieldProps.sx, width: 84 }} />
      <span style={{ width: 96, fontSize: 12, color: "#64748b", lineHeight: 1.3 }}>{unite}</span>
    </div>
  );
  const actif = bool("sla.enabled");

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

      {/* Activation : seule en haut, bien visible */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderRadius: 12, background: actif ? PL : "#f8fafc", border: actif ? "none" : "1px solid #e2e8f0", marginBottom: 16 }}>
        {toggle("sla.enabled")}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
            {actif ? "Le suivi des délais (SLA) est activé" : "Le suivi des délais (SLA) est désactivé"}
          </div>
          <div style={{ fontSize: 12.5, color: "#475569", marginTop: 2, lineHeight: 1.5 }}>
            Désactivé, GPR se comporte exactement comme avant. À l'activation, les plaintes déjà ouvertes sont reprises sans aucune alerte rétroactive (aucun rappel, retard ni remontée pour ce qui est déjà dépassé).
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <Carte titre="Délais par défaut" icone={AccessTimeIcon}>
          <Ligne label="Prise en charge" help="Quand l'objet n'a pas son propre délai.">{number("sla.takeover_hours", "heures ouvrées", 1)}</Ligne>
          <Ligne label="Clôture" help="De la solution approuvée à la mesure de satisfaction (réclamations).">{number("sla.closure_days", "jours ouvrés", 1)}</Ligne>
          <Ligne label="Nouveau cycle" help="Après une mesure « non satisfait » ou « partiellement satisfait ».">{number("sla.reopen_days", "jours ouvrés", 1)}</Ligne>
          <Ligne label="Traitement d'une suggestion" help="Une suggestion n'a pas d'objet : ce délai s'applique à toutes.">{number("sla.suggestion_days", "jours ouvrés", 1)}</Ligne>
        </Carte>

        <Carte titre="Rappels et remontée" icone={NotificationsNoneIcon}
          note="Un dossier en retard, sans action humaine pendant le délai avant remontée, est transmis au niveau supérieur : agent, chef d'agence, direction, Pilote, DE.">
          <Ligne label="Premier rappel">{number("sla.reminder1_pct", "% du délai", 1)}</Ligne>
          <Ligne label="Second rappel">{number("sla.reminder2_pct", "% du délai", 1)}</Ligne>
          <Ligne label="Délai avant remontée" help="Temps laissé après le dépassement.">{number("sla.grace_hours", "heures ouvrées", 1)}</Ligne>
          <Ligne label="Remontée automatique">{toggle("sla.auto_escalation")}</Ligne>
        </Carte>

        <Carte titre="Échéance réglementaire" icone={GavelIcon}
          note="Circulaire n° 002-2020/CB/C de la Commission bancaire de l'UMOA : 30 jours. Jamais mise en pause.">
          <Ligne label="Échéance réglementaire">{number("sla.regulatory_days", "jours calendaires", 1)}</Ligne>
          <Ligne label="Alerte avant la limite">{number("sla.regulatory_warning_days", "jours", 0)}</Ligne>
        </Carte>

        <Carte titre="Client injoignable" icone={PhoneDisabledIcon}
          note="Nombre de tentatives de contact sans succès avant que le Pilote puisse clôturer sans mesure.">
          <Ligne label="Tentatives">{number("sla.unreachable_attempts", "tentatives", 1)}</Ligne>
          <Ligne label="Période">{number("sla.unreachable_days", "jours", 1)}</Ligne>
        </Carte>

        <Carte titre="Messages" icone={ChatBubbleOutlineIcon}
          note="Les rappels (50 % et 75 %) sont regroupés dans un seul message par personne. Les retards, remontées et alertes réglementaires partent immédiatement.">
          <Ligne label="Récapitulatif quotidien des rappels">{toggle("sla.daily_digest")}</Ligne>
          <Ligne label="Heure du récapitulatif">
            <TextField {...fieldProps} fullWidth={false} type="time" value={values["sla.digest_time"]} onChange={(e) => set("sla.digest_time", e.target.value)} sx={{ ...fieldProps.sx, width: 130 }} />
          </Ligne>
          <Ligne colonne label="Message d'attente au client en cas de retard"
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
          </Ligne>
        </Carte>

        <Carte titre="Fonctionnement" icone={SettingsOutlinedIcon}
          note="Les dates du serveur suivent l'horloge du serveur, qui doit être réglée sur ce fuseau.">
          <Ligne label="Contrôle des délais" help="Fréquence à laquelle le serveur vérifie les échéances.">{number("sla.scan_minutes", "minutes", 1)}</Ligne>
          <Ligne colonne label="Fuseau horaire">
            <TextField {...fieldProps} value={values["sla.timezone"]} onChange={(e) => set("sla.timezone", e.target.value)} />
          </Ligne>
        </Carte>
      </div>
    </Panel>
  );
};

export default SlaParametresTab;
