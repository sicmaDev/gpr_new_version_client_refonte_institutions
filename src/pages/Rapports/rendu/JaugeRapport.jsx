import React, { useImperativeHandle, useMemo, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { SENS } from "./couleursRapport";
import { fmt } from "./graphiquesRapport";

// Jauge du taux de résolution : demi-anneau rouge (faible) à gauche, vert (élevé) à droite, mêmes proportions
// que la jauge actuelle (30 / 50 / 20). Même interface que MyGaugeChart pour l'export : captureAsImage().
const aiguille = (valeur) => ({
  id: "aiguilleRapport",
  afterDatasetsDraw(chart) {
    const m = chart.getDatasetMeta(0).data[0]; if (!m) return;
    const { ctx } = chart, r = m.innerRadius - 8;
    ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(Math.PI + Math.PI * Math.min(1, Math.max(0, valeur)));
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(r, 0); ctx.lineTo(0, 4); ctx.fillStyle = "#374151"; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
  },
});

export const JaugeRapport = React.forwardRef(({ global_trend }, ref) => {
  const chartRef = useRef(null);
  const valeur = Number.isFinite(global_trend) ? global_trend : 0;
  useImperativeHandle(ref, () => ({
    captureAsImage: () => Promise.resolve(chartRef.current ? chartRef.current.toBase64Image() : ""),
  }));
  const plugins = useMemo(() => [aiguille(valeur)], [valeur]);
  return (
    <div id="gauge-chart5" style={{ height: 300, maxWidth: 520, margin: "0 auto" }}>
      <Doughnut
        ref={chartRef}
        plugins={plugins}
        data={{ labels: ["Faible", "Moyen", "Élevé"], datasets: [{ data: [30, 50, 20], backgroundColor: [SENS.rouge, SENS.orange, SENS.vert], borderColor: "#fff", borderWidth: 3 }] }}
        options={{
          responsive: true, maintainAspectRatio: false, rotation: -90, circumference: 180, cutout: "74%", layout: { padding: { bottom: 58 } },
          plugins: { datalabels: { display: false }, legend: { display: false }, tooltip: { enabled: false },
            centreRapport: { texte: fmt(valeur * 100, true), sous: "taux de résolution", jauge: true, taille: 26 } },
        }}
      />
    </div>
  );
});
