// Rendu des graphiques du rapport Global (proposition 1 validée).
// Chaque fonction reçoit les données TELLES QUE la page les prépare aujourd'hui et ne change que leur présentation :
// tri d'affichage, lignes à 0 masquées, couleurs pleines, étiquettes dessinées dans le canvas (donc visibles
// dans les exports PDF / Word). Aucun chiffre n'est recalculé.
import { Chart } from "chart.js";
import { AUTRES, TEXTE } from "./couleursRapport";

const POLICE = "'Segoe UI', system-ui, -apple-system, sans-serif";
const nombre = (v) => { const n = typeof v === "number" ? v : parseFloat(v); return Number.isFinite(n) ? n : 0; };
export const fmt = (v, pct) => (pct ? nombre(v).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " %" : nombre(v).toLocaleString("fr-FR"));

// Couleurs du serveur affichées pleines : même teinte, opacité 100 % (rgba(r,g,b,0.5) → rgb(r,g,b)).
export const pleine = (c) => {
  if (typeof c !== "string") return c;
  const m = c.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  return m ? `rgb(${m[1]},${m[2]},${m[3]})` : c;
};
const couleurA = (bg, i) => pleine(Array.isArray(bg) ? bg[i] : bg);
const estAutres = (l) => typeof l === "string" && l.trim().toLowerCase() === "autres";

// Texte lisible sur une couleur : gris foncé sur les teintes claires, blanc sinon.
const versRgb = (c) => {
  if (typeof c !== "string") return [0, 0, 0];
  if (c[0] === "#") return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const m = (c.match(/[0-9.]+/g) || []).map(Number), a = m[3] == null ? 1 : m[3];
  return m.slice(0, 3).map((v) => v * a + 255 * (1 - a));
};
export const texteSur = (c) => {
  const [r, g, b] = versRgb(c).map((v) => { v /= 255; return v <= 0.04 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#1F2937" : "#FFFFFF";
};
export const alpha = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, "0");

// Mois abrégés avec majuscule (Nov, Déc, Jan…), sans toucher aux libellés envoyés.
const MOIS = { janvier: "Jan", janv: "Jan", fevrier: "Fév", fevr: "Fév", mars: "Mars", avril: "Avr", mai: "Mai", juin: "Juin", juillet: "Juil", aout: "Août", septembre: "Sept", octobre: "Oct", novembre: "Nov", decembre: "Déc" };
export const moisCourt = (l) => {
  if (typeof l !== "string") return l;
  const mots = l.trim().split(/\s+/), cle = mots[0].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  return MOIS[cle] ? [MOIS[cle], ...mots.slice(1)].join(" ") : l;
};

/* ── Modules Chart.js internes (actifs seulement quand leurs options sont fournies) ── */
const valeursRapport = {
  id: "valeursRapport",
  afterDatasetsDraw(chart, _a, o) {
    if (!o || !o.mode) return;
    const { ctx } = chart; ctx.save(); ctx.font = `600 10.5px ${POLICE}`;
    chart.data.datasets.forEach((ds, di) => {
      if (ds.rail) return; const meta = chart.getDatasetMeta(di); if (meta.hidden) return;
      meta.data.forEach((el, i) => {
        const v = nombre(ds.data[i]); if (!v) return;
        if (o.mode === "rail") { // barre de progression : valeur à droite du rail
          ctx.fillStyle = TEXTE.corps; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(fmt(v, o.pct), chart.chartArea.right + 8, el.y);
        } else if (o.mode === "dessus") { // colonne : valeur au-dessus
          ctx.fillStyle = TEXTE.corps; ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(fmt(v, o.pct), el.x, el.y - 4);
        } else if (o.mode === "dedans" && v >= 8 && Math.abs(el.x - el.base) > 26) { // segment empilé assez large
          const bg = Array.isArray(ds.backgroundColor) ? ds.backgroundColor[i] : ds.backgroundColor;
          ctx.fillStyle = texteSur(bg); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(Math.round(v) + " %", (el.x + el.base) / 2, el.y);
        }
      });
    });
    ctx.restore();
  },
};
const centreRapport = {
  id: "centreRapport",
  afterDraw(chart, _a, o) {
    if (!o || !o.texte) return; const m = chart.getDatasetMeta(0).data[0]; if (!m) return;
    const { ctx } = chart; ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = "#0F172A"; ctx.font = `800 ${o.taille || 22}px ${POLICE}`;
    const y = o.jauge ? m.y + 34 : m.y - 4; ctx.fillText(o.texte, m.x, y);
    if (o.sous) { ctx.font = `600 10.5px ${POLICE}`; ctx.fillStyle = "#6B7280"; ctx.fillText(o.sous, m.x, y + 18); }
    ctx.restore();
  },
};
const pointsRapport = { // courbe à une série : valeur au-dessus de chaque point + moyenne en pointillés
  id: "pointsRapport",
  afterDatasetsDraw(chart, _a, o) {
    if (!o || o.moyenne == null) return; const { ctx, chartArea: a } = chart, y = chart.scales.y.getPixelForValue(o.moyenne);
    ctx.save(); ctx.strokeStyle = o.couleur; ctx.globalAlpha = 0.55; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(a.left, y); ctx.lineTo(a.right, y); ctx.stroke(); ctx.globalAlpha = 1; ctx.setLineDash([]);
    ctx.font = `600 10.5px ${POLICE}`; ctx.fillStyle = o.couleur; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText("Moy.", a.right + 8, y - 7); ctx.fillText(fmt(+o.moyenne.toFixed(1), o.pct), a.right + 8, y + 7);
    ctx.fillStyle = TEXTE.corps; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    chart.getDatasetMeta(0).data.forEach((p, i) => ctx.fillText(fmt(chart.data.datasets[0].data[i], o.pct), p.x, p.y - 9));
    ctx.restore();
  },
};
Chart.register(valeursRapport, centreRapport, pointsRapport);

/* ── Options communes ── */
const sansEtiquettesParDefaut = { datalabels: { display: false } }; // chartjs-plugin-datalabels est actif globalement
const infobulle = { backgroundColor: "#1E293B", padding: 10, cornerRadius: 6, titleFont: { size: 12, weight: "bold" }, bodyFont: { size: 11 } };
const legende = (position) => ({ position, align: position === "top" ? "start" : "center", labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 8, padding: 14, color: "#6B7280", font: { size: 11, family: POLICE } } });
const axeCategories = { grid: { display: false, drawBorder: false }, ticks: { color: TEXTE.corps, font: { size: 11 }, autoSkip: false } };
const axePct = { min: 0, max: 100, grid: { color: TEXTE.grille, drawBorder: false }, ticks: { color: TEXTE.axe, font: { size: 10 }, callback: (v) => v + " %" } };
const base = (extra) => ({ responsive: true, maintainAspectRatio: false, animation: { duration: 600, easing: "easeOutQuart" }, ...extra });

// Lignes d'un graphique à une série (camembert, barres par agence…), sans les valeurs nulles.
function lignes(data) {
  const ds = (data && data.datasets && data.datasets[0]) || {};
  return (data?.labels || []).map((l, i) => ({ l, v: nombre(ds.data?.[i]), c: couleurA(ds.backgroundColor, i) })).filter((r) => r.v > 0);
}
const trier = (rows) => rows.slice().sort((a, b) => (estAutres(a.l) - estAutres(b.l)) || b.v - a.v); // « Autres » toujours en dernier

// Barres de progression : rail gris jusqu'à la fin d'axe, lignes compactes, couleur du serveur (ou couleur fixe).
export function progression(data, { pct = true, couleur = null } = {}) {
  const rows = trier(lignes(data)), haut = rows.length ? Math.max(...rows.map((r) => r.v)) : 0;
  const pas = pct || haut <= 200 ? 10 : 50;
  const max = pct ? Math.min(100, (Math.floor(haut / 10) + 1) * 10) : (Math.floor(haut / pas) + 1) * pas;
  const opt = { borderRadius: 4, borderSkipped: false, barThickness: 12, grouped: false };
  const label = data?.datasets?.[0]?.label;
  return {
    type: "bar",
    hauteur: 52 + rows.length * 26,
    data: { labels: rows.map((r) => r.l), datasets: [
      { ...opt, label, data: rows.map((r) => r.v), backgroundColor: rows.map((r) => (estAutres(r.l) ? AUTRES : couleur || r.c)), order: 1 },
      { ...opt, data: rows.map(() => max), backgroundColor: TEXTE.rail, order: 2, rail: true },
    ] },
    options: base({
      indexAxis: "y", layout: { padding: { right: pct ? 58 : 46 } },
      plugins: { ...sansEtiquettesParDefaut, legend: { display: false }, valeursRapport: { mode: "rail", pct },
        tooltip: { ...infobulle, filter: (c) => !c.dataset.rail, callbacks: { label: (c) => ` ${c.dataset.label ? c.dataset.label + " : " : ""}${fmt(c.raw, pct)}` } } },
      scales: { x: { min: 0, max, grid: { color: TEXTE.grille, drawBorder: false }, ticks: { stepSize: pas, color: TEXTE.axe, font: { size: 10 }, callback: (v) => (pct ? v + " %" : v.toLocaleString("fr-FR")) } }, y: axeCategories },
    }),
  };
}

// Anneau : légende à droite, au centre la plus grande part (pourcentages) ; couleurs du serveur ou couleurs de sens.
export function anneau(data, { couleurs = null, pct = true } = {}) {
  const rows = lignes(data), bg = rows.map((r) => (estAutres(r.l) ? AUTRES : (couleurs && couleurs(r.l)) || r.c));
  const max = rows.length ? rows.reduce((m, r) => (r.v > m.v ? r : m), rows[0]) : null;
  const total = rows.reduce((s, r) => s + r.v, 0);
  return {
    type: "doughnut",
    hauteur: 360,
    data: { labels: rows.map((r) => r.l), datasets: [{ data: rows.map((r) => r.v), backgroundColor: bg, borderColor: "#fff", borderWidth: 3, hoverOffset: 6 }] },
    options: base({
      cutout: "64%",
      plugins: { ...sansEtiquettesParDefaut, legend: legende("right"), tooltip: { ...infobulle, callbacks: { label: (c) => ` ${c.label} : ${fmt(c.raw, pct)}` } },
        centreRapport: max ? (pct ? { texte: fmt(max.v, true), sous: max.l } : { texte: total.toLocaleString("fr-FR"), sous: "au total" }) : {} },
    }),
  };
}

// Barres empilées 100 % par agence : séries et agences vides masquées, couleurs du serveur pleines, « Autres » en gris.
export function empile100(data) {
  const series = (data?.datasets || []).filter((s) => (s.data || []).some((v) => nombre(v) > 0));
  const garder = (data?.labels || []).map((_, a) => series.some((s) => nombre(s.data[a]) > 0));
  const filtre = (arr) => (arr || []).filter((_, a) => garder[a]);
  return {
    type: "bar",
    hauteur: 90 + garder.filter(Boolean).length * 30,
    data: { labels: filtre(data?.labels), datasets: series.map((s) => ({ label: s.label, data: filtre(s.data).map(nombre),
      backgroundColor: estAutres(s.label) ? AUTRES : pleine(Array.isArray(s.backgroundColor) ? s.backgroundColor[0] : s.backgroundColor),
      borderColor: "#fff", borderWidth: { right: 1 }, barThickness: 16, maxBarThickness: 16, borderSkipped: false, stack: "Stack 0" })) },
    options: base({
      indexAxis: "y",
      plugins: { ...sansEtiquettesParDefaut, legend: legende("top"), valeursRapport: { mode: "dedans" },
        tooltip: { ...infobulle, mode: "index", intersect: false, callbacks: { label: (c) => ` ${c.dataset.label} : ${fmt(c.raw, true)}` } } },
      scales: { x: { ...axePct, stacked: true }, y: { ...axeCategories, stacked: true } },
    }),
  };
}

// Courbes lissées sans dépassement (monotone), mois abrégés, légende en bas.
// Une seule série (taux mensuel) : points et valeurs visibles, moyenne en pointillés, fond blanc.
export function courbes(data, { pct = false, couleurs = null } = {}) {
  const series = data?.datasets || [], seule = series.length === 1;
  const couleurDe = (s, i) => (couleurs && couleurs(s.label, i)) || pleine(Array.isArray(s.backgroundColor) ? s.backgroundColor[0] : s.backgroundColor || s.borderColor) || "#64748B";
  const vals = seule ? (series[0].data || []).map(nombre) : [];
  const moyenne = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  return {
    type: "line",
    hauteur: 380,
    data: { labels: data?.labels || [], datasets: series.map((s, i) => { const c = couleurDe(s, i); return {
      label: s.label, data: (s.data || []).map(nombre), borderColor: c, backgroundColor: c, fill: false, cubicInterpolationMode: "monotone", borderWidth: 2.5,
      pointStyle: "circle", pointRadius: seule ? 4 : 0, pointHoverRadius: 6, pointBackgroundColor: seule ? "#FFFFFF" : c, pointBorderColor: c, pointBorderWidth: 2 }; }) },
    options: base({
      interaction: { mode: "index", intersect: false }, layout: { padding: { top: seule ? 22 : 6, right: seule ? 52 : 8 } },
      plugins: { ...sansEtiquettesParDefaut,
        legend: { ...legende("bottom"), display: !seule, labels: { ...legende("bottom").labels, generateLabels: (chart) => Chart.defaults.plugins.legend.labels.generateLabels(chart).map((l) => ({ ...l, fillStyle: l.strokeStyle, lineWidth: 0, pointStyle: "circle" })) } },
        tooltip: { ...infobulle, callbacks: { title: (items) => items[0]?.label, label: (c) => ` ${c.dataset.label} : ${fmt(c.raw, pct)}` } },
        pointsRapport: seule && moyenne != null ? { moyenne, pct, couleur: couleurDe(series[0], 0) } : {} },
      scales: {
        x: { offset: true, grid: { display: false, drawBorder: false }, ticks: { color: TEXTE.axe, maxRotation: 0, minRotation: 0, autoSkip: false, callback: function (v) { return moisCourt(this.getLabelForValue(v)); } } },
        y: pct ? { ...axePct, ticks: { ...axePct.ticks, stepSize: 25 } } : { beginAtZero: true, grid: { color: TEXTE.grille, drawBorder: false }, ticks: { color: TEXTE.axe } },
      },
    }),
  };
}

// Colonnes côte à côte par année, une couleur par type, valeur au-dessus (glissement annuel).
export function colonnesGroupees(data, { couleurs = null } = {}) {
  const series = data?.datasets || [];
  const couleurDe = (s, i) => (couleurs && couleurs(s.label, i)) || pleine(Array.isArray(s.backgroundColor) ? s.backgroundColor[0] : s.backgroundColor || s.borderColor) || "#64748B";
  return {
    type: "bar",
    hauteur: 380,
    data: { labels: data?.labels || [], datasets: series.map((s, i) => ({
      label: s.label, data: (s.data || []).map(nombre), backgroundColor: couleurDe(s, i), borderRadius: 4, borderSkipped: false, maxBarThickness: 48,
    })) },
    options: base({
      layout: { padding: { top: 18 } },
      plugins: { ...sansEtiquettesParDefaut, legend: legende("bottom"), valeursRapport: { mode: "dessus" },
        tooltip: { ...infobulle, mode: "index", intersect: false } },
      scales: {
        x: { grid: { display: false, drawBorder: false }, ticks: { color: TEXTE.axe } },
        y: { beginAtZero: true, grid: { color: TEXTE.grille, drawBorder: false }, ticks: { color: TEXTE.axe } },
      },
    }),
  };
}

// Colonnes 0–100 % sur rail gris (respect du délai par mois), valeur au-dessus, couleur de section.
export function colonnes(data, { couleur }) {
  const ds = data?.datasets?.[0] || {}, vals = (ds.data || []).map(nombre), labels = data?.labels || [];
  const opt = { borderRadius: 4, borderSkipped: false, maxBarThickness: 34, grouped: false };
  return {
    type: "bar",
    hauteur: 340,
    data: { labels, datasets: [
      { ...opt, label: ds.label, data: vals, backgroundColor: couleur, order: 1 },
      { ...opt, data: labels.map(() => 100), backgroundColor: TEXTE.rail, order: 2, rail: true },
    ] },
    options: base({
      layout: { padding: { top: 18 } },
      plugins: { ...sansEtiquettesParDefaut, legend: { display: false }, valeursRapport: { mode: "dessus", pct: true },
        tooltip: { ...infobulle, filter: (c) => !c.dataset.rail, callbacks: { label: (c) => ` ${fmt(c.raw, true)}` } } },
      scales: { x: { grid: { display: false, drawBorder: false }, ticks: { color: TEXTE.axe, maxRotation: 0, autoSkip: false, callback: function (v) { return moisCourt(this.getLabelForValue(v)); } } }, y: axePct },
    }),
  };
}
