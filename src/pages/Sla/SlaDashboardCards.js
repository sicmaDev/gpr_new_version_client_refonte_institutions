import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Box } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { slaStatus, slaSummary, slaStats } from "../../apis/Sla/SlaApi";
import { SlaKpiBar, kpi, currentRights } from "./slaUi";

// Cartes du tableau de bord pour le suivi des délais : À risque, Taux de respect du mois, Limite réglementaire
// proche, Traitées non mesurées. Affichées seulement quand le SLA est actif ; chaque personne voit son périmètre.
const SlaDashboardCards = () => {
  const history = useHistory();
  const [data, setData] = useState(null);
  // null : en cours ; false : SLA inactif ou indisponible (rien n'est affiché)
  const [actif, setActif] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await slaStatus();
        if (!status?.enabled) { if (!cancelled) setActif(false); return; }
        if (!cancelled) setActif(true);
        const summary = await slaSummary();
        let rate = summary?.tauxRespect ?? null;
        // le taux du mois vient des indicateurs (Pilote, DE, rapports) ; sinon taux global du périmètre
        const { canStats } = currentRights(loadItemFromSessionStorage("app-user"));
        if (canStats) {
          const now = new Date();
          const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
          const to = now.toISOString().slice(0, 10);
          const stats = await slaStats({ from, to }).catch(() => null);
          if (stats?.global) rate = stats.global.tauxRespectResolution ?? rate;
        }
        if (!cancelled) setData({ ...summary, rate });
      } catch (e) {
        // un tableau de bord ne doit jamais casser pour une carte secondaire
        if (!cancelled) setActif(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (actif !== true) return null; // SLA inactif, ou pas encore su : rien n'apparaît puis disparaît
  const d = data || {}; // indicateurs en cours de calcul : les cartes tournent

  const kpis = [
    kpi("risk", "À risque", WarningAmberIcon, "amber", d.A_RISQUE),
    kpi("rate", "Respect des délais (mois)", TrendingUpIcon, "green", d.rate != null ? `${d.rate} %` : "-"),
    kpi("near", "Limite réglementaire proche", ScheduleIcon, "amber", d.PROCHES_REGLEMENTAIRE),
    kpi("unm", "Traitées non mesurées", AssignmentTurnedInIcon, "purple", d.TRAITEES_NON_MESUREES),
  ];

  return (
    <Box onClick={() => history.push("/sla")} sx={{ cursor: "pointer" }}>
      <SlaKpiBar kpis={kpis} chargement={data === null} />
    </Box>
  );
};

export default SlaDashboardCards;
