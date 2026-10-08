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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await slaStatus();
        if (!status?.enabled) return;
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
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!data) return null;

  const kpis = [
    kpi("risk", "À risque", WarningAmberIcon, "amber", data.A_RISQUE),
    kpi("rate", "Respect des délais (mois)", TrendingUpIcon, "green", data.rate != null ? `${data.rate} %` : "-"),
    kpi("near", "Limite réglementaire proche", ScheduleIcon, "amber", data.PROCHES_REGLEMENTAIRE),
    kpi("unm", "Traitées non mesurées", AssignmentTurnedInIcon, "purple", data.TRAITEES_NON_MESUREES),
  ];

  return (
    <Box onClick={() => history.push("/sla")} sx={{ cursor: "pointer" }}>
      <SlaKpiBar kpis={kpis} />
    </Box>
  );
};

export default SlaDashboardCards;
