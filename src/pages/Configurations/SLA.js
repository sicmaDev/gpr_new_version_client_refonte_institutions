import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { slaStatus } from "../../apis/Sla/SlaApi";
import { Tabs, Tab, Typography } from "@mui/material";
import { currentRights, Empty, PrimaryButton } from "../Sla/slaUi";
import SlaSuiviTab from "../Sla/SlaSuiviTab";
import SlaIndicateursTab from "../Sla/SlaIndicateursTab";
import SlaCalendrierTab from "../Sla/SlaCalendrierTab";
import SlaMotifsTab from "../Sla/SlaMotifsTab";
import SlaParametresTab from "../Sla/SlaParametresTab";
import { ChargementRond } from "../../components/shared/ChargementRond";

// Suivi des délais (SLA). Le serveur calcule tout : cette page affiche seulement ce qu'il renvoie, dans le
// périmètre de la personne connectée. Onglets selon les droits :
//   menu « Suivi des délais » : Suivi (tous), Indicateurs (rapports, Pilote, DE) ;
//   menu « Délais (SLA) » : Calendrier et fériés, Motifs, Paramètres (administrateur).
const SLA = () => {
  const user = loadItemFromSessionStorage("app-user");
  const { isAdmin, canStats } = currentRights(user);
  const history = useHistory();
  const estConfiguration = useLocation().pathname.startsWith("/configurations/sla");
  const [enabled, setEnabled] = useState(null); // null = en cours de lecture
  const [tab, setTab] = useState("suivi");

  useEffect(() => {
    const read = () => slaStatus().then((s) => setEnabled(!!s?.enabled)).catch(() => setEnabled(false));
    read();
    window.addEventListener("sla-status-changed", read);
    return () => window.removeEventListener("sla-status-changed", read);
  }, []);

  const tabs = (estConfiguration
    ? [
      isAdmin && { key: "calendrier", label: "Calendrier et fériés" },
      isAdmin && { key: "motifs", label: "Motifs" },
      isAdmin && { key: "parametres", label: "Paramètres" },
    ]
    : [
      enabled && { key: "suivi", label: "Suivi" },
      enabled && canStats && { key: "indicateurs", label: "Indicateurs" },
    ]).filter(Boolean);

  // si l'onglet courant n'existe pas (SLA désactivé, droits), on tombe sur le premier disponible
  const active = tabs.find((t) => t.key === tab) ? tab : tabs[0]?.key;

  return (
    <div style={{ padding: "28px clamp(16px, 4vw, 48px)", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>
          {estConfiguration ? "Configuration des délais (SLA)" : "Suivi des délais (SLA)"}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#94a3b8", mt: 0.3 }}>
          {estConfiguration
            ? "La durée de résolution se règle sur chaque objet ; ici, le calendrier, les motifs et les autres durées"
            : "Échéances, alertes et remontées calculées par le serveur, dans votre périmètre"}
        </Typography>
      </div>

      {enabled === null && <Empty><ChargementRond taille={28} /></Empty>}

      {enabled === false && (
        <div style={{
          display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
          background: "#fff", borderRadius: 16, padding: "22px 26px", marginBottom: 24,
          boxShadow: "0 2px 14px rgba(15,23,42,0.07)", border: "1px solid #fff",
        }}>
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>Le suivi des délais est désactivé</div>
            <div style={{ fontSize: 13.5, color: "#64748B", marginTop: 4, lineHeight: 1.55 }}>
              {isAdmin
                ? "Réglez d'abord les délais (sur chaque objet), puis activez le suivi dans l'onglet Paramètres de la configuration. Tant qu'il est désactivé, GPR fonctionne comme avant."
                : "Votre administrateur ne l'a pas encore activé. Vous n'avez rien à faire pour l'instant."}
            </div>
          </div>
          {isAdmin && (
            <PrimaryButton onClick={() => { setTab("parametres"); history.push("/configurations/sla"); }}>Aller aux paramètres</PrimaryButton>
          )}
        </div>
      )}

      {estConfiguration && !isAdmin && <Empty>Cette page est réservée à l'administrateur.</Empty>}

      {tabs.length > 0 && (
        <>
          <Tabs
            value={active} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{
              mb: 2.5, borderBottom: "1px solid #E2E8F0",
              "& .MuiTabs-indicator": { backgroundColor: "var(--gpr-primary-dark)", height: 3 },
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.88rem", color: "#64748B", background: "transparent", borderRadius: "10px 10px 0 0" },
              "& .Mui-selected": { color: "#fff !important", fontWeight: 700, background: "var(--gpr-primary) !important" },
            }}
          >
            {tabs.map((t) => <Tab key={t.key} value={t.key} label={t.label} />)}
          </Tabs>

          {active === "suivi" && <SlaSuiviTab />}
          {active === "indicateurs" && <SlaIndicateursTab />}
          {active === "calendrier" && <SlaCalendrierTab />}
          {active === "motifs" && <SlaMotifsTab />}
          {active === "parametres" && <SlaParametresTab />}
        </>
      )}
    </div>
  );
};

export default SLA;
