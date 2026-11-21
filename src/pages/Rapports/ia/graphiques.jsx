// Graphiques du Reporting IA (repris de l'ancienne version : choix du type, tableau de données) au style de la refonte.
// Les valeurs viennent toujours de la réponse de l'IA (liste chiffrée ou tableau de son texte).
import React, { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import BarChartIcon from "@mui/icons-material/BarChart";
import AlignHorizontalLeftIcon from "@mui/icons-material/AlignHorizontalLeft";
import PieChartOutlineIcon from "@mui/icons-material/PieChartOutline";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import LooksOneOutlinedIcon from "@mui/icons-material/LooksOneOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export const P = "var(--gpr-primary, #005081)";
export const PD = "var(--gpr-primary-dark, #003d62)";
export const DEGRADE = "linear-gradient(135deg, var(--gpr-primary-dark, #003d62) 0%, var(--gpr-primary, #005081) 100%)";
export const COULEURS = ["#1d4ed8", "#0284c7", "#0ea5e9", "#0d9488", "#d97706", "#7c3aed", "#dc2626", "#64748b", "#16a34a", "#db2777"];
export const couleur = (i) => COULEURS[i % COULEURS.length];

export const TYPES = [
  { id: "barh", libelle: "Barres horizontales", Icone: AlignHorizontalLeftIcon },
  { id: "bar", libelle: "Barres", Icone: BarChartIcon },
  { id: "line", libelle: "Courbe", Icone: ShowChartIcon },
  { id: "area", libelle: "Aire", Icone: StackedLineChartIcon },
  { id: "pie", libelle: "Secteurs", Icone: PieChartOutlineIcon },
  { id: "doughnut", libelle: "Anneau", Icone: DonutLargeIcon },
  { id: "kpi", libelle: "Chiffre clé (KPI)", Icone: LooksOneOutlinedIcon },
];

/** Type proposé au départ (comme l'ancienne version) : une évolution dans le temps en courbe, sinon des barres. */
export const typeParDefaut = (question) => {
  const q = String(question || "").toLowerCase();
  if (/(évolution|evolution|mensuel|par mois|tendance|trimestr|hebdo|par jour|par semaine)/.test(q)) return "line";
  return "barh";
};

/** Choix du type de graphique (barre d'outils de la carte et du plein écran). */
export const ChoixType = ({ type, onChange, avecTableau = false }) => (
  <div style={{ display: "inline-flex", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
    {[...TYPES, ...(avecTableau ? [{ id: "table", libelle: "Tableau", Icone: TableChartOutlinedIcon }] : [])].map(({ id, libelle, Icone }) => (
      <button key={id} type="button" title={libelle} onClick={() => onChange(id)}
        style={{ border: "none", borderRight: "1px solid #f1f5f9", padding: "5px 7px", cursor: "pointer", display: "inline-flex",
          background: type === id ? "#e8f4fc" : "#fff", color: type === id ? P : "#64748b" }}>
        <Icone style={{ fontSize: 17 }} />
      </button>
    ))}
  </div>
);

const axe = { fontSize: 12, fill: "#64748b" };

/** Graphique d'une série { libelle, valeur }. */
/** Chiffre clé (KpiCard de l'ancienne version), sans statut « Optimal / Vigilance » : l'IA ne donne pas d'objectif. */
export const CarteKpi = ({ serie, sousTitre }) => {
  const total = serie.length === 1 ? Number(serie[0].valeur) : serie.reduce((s, x) => s + (Number(x.valeur) || 0), 0);
  return (
    <div style={{ textAlign: "center", padding: "26px 16px", border: "1px solid #e5e7eb", borderRadius: 14, background: "#f8fafc" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", letterSpacing: 0.5 }}>{serie.length === 1 ? String(serie[0].libelle).toUpperCase() : "TOTAL"}</div>
      <div style={{ fontSize: 44, fontWeight: 800, color: "#0F172A", lineHeight: 1.2, margin: "6px 0" }}>{total.toLocaleString("fr-FR")}</div>
      {sousTitre && <div style={{ fontSize: 12.5, color: "#64748b" }}>{sousTitre}</div>}
    </div>
  );
};

export const GraphiqueIa = ({ serie, type = "barh", hauteur, sousTitre }) => {
  if (!Array.isArray(serie) || serie.length === 0) return null;
  if (type === "kpi") return <CarteKpi serie={serie} sousTitre={sousTitre} />;
  const h = hauteur || (type === "barh" ? Math.max(200, serie.length * 40 + 40) : 300);
  return (
    <ResponsiveContainer width="100%" height={h}>
      {type === "pie" || type === "doughnut" ? (
        <PieChart>
          <Tooltip />
          <Pie data={serie} dataKey="valeur" nameKey="libelle" outerRadius="75%" innerRadius={type === "doughnut" ? "45%" : 0}
            paddingAngle={type === "doughnut" ? 2 : 0} label={({ libelle, percent }) => `${libelle} (${(percent * 100).toFixed(0)}%)`}>
            {serie.map((_, i) => <Cell key={i} fill={couleur(i)} />)}
          </Pie>
        </PieChart>
      ) : type === "line" ? (
        <LineChart data={serie} margin={{ left: 0, right: 20, top: 16, bottom: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="libelle" tick={axe} tickLine={false} />
          <YAxis tick={axe} tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="valeur" stroke={couleur(0)} strokeWidth={3} dot={{ r: 4, fill: couleur(0) }} activeDot={{ r: 7 }} />
        </LineChart>
      ) : type === "area" ? (
        <AreaChart data={serie} margin={{ left: 0, right: 20, top: 16, bottom: 8 }}>
          <defs>
            <linearGradient id="iaAire" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={couleur(0)} stopOpacity={0.7} />
              <stop offset="95%" stopColor={couleur(0)} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="libelle" tick={axe} tickLine={false} />
          <YAxis tick={axe} tickLine={false} axisLine={false} />
          <Tooltip />
          <Area type="monotone" dataKey="valeur" stroke={couleur(0)} strokeWidth={3} fill="url(#iaAire)" />
        </AreaChart>
      ) : type === "bar" ? (
        <BarChart data={serie} margin={{ left: 0, right: 20, top: 22, bottom: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="libelle" tick={axe} tickLine={false} interval={0} />
          <YAxis tick={axe} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="valeur" radius={[6, 6, 0, 0]}>
            {serie.map((_, i) => <Cell key={i} fill={couleur(i)} />)}
            <LabelList dataKey="valeur" position="top" style={{ fontSize: 12, fontWeight: 700, fill: "#1e293b" }} />
          </Bar>
        </BarChart>
      ) : (
        <BarChart data={serie} layout="vertical" margin={{ left: 10, right: 44, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" tick={axe} />
          <YAxis type="category" dataKey="libelle" width={180} tick={{ fontSize: 13, fill: "#334155" }} />
          <Tooltip />
          <Bar dataKey="valeur" radius={[0, 4, 4, 0]} barSize={24}>
            {serie.map((_, i) => <Cell key={i} fill={couleur(i)} />)}
            <LabelList dataKey="valeur" position="right" style={{ fontSize: 13, fontWeight: 700, fill: "#1e293b" }} />
          </Bar>
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};

/** Export CSV compatible Excel (séparateur « ; », UTF-8 avec BOM), comme l'ancienne version. */
export const exporterCsv = (colonnes, lignes, nom = "donnees_ia") => {
  const cellule = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const contenu = "﻿" + [colonnes.map(cellule).join(";"), ...lignes.map((l) => l.map(cellule).join(";"))].join("\r\n");
  const url = URL.createObjectURL(new Blob([contenu], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${String(nom || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 60) || "donnees_ia"}_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const enNombre = (v) => {
  const n = parseFloat(String(v ?? "").replace(/\s/g, "").replace("%", "").replace(",", "."));
  return Number.isNaN(n) ? null : n;
};

/**
 * Tableau tel que renvoyé par l'IA ({ colonnes, lignes }), ou construit depuis la série.
 * Filtre, tri par colonne, pages et export CSV (PinnedDataTable de l'ancienne version).
 */
export const TableauDonnees = ({ tableau, serie, titre, parPage = 8 }) => {
  const t = useMemo(() => tableau || (Array.isArray(serie) && serie.length
    ? { colonnes: ["Libellé", "Valeur"], lignes: serie.map((s) => [s.libelle, String(s.valeur)]) } : null), [tableau, serie]);
  const [filtre, setFiltre] = useState("");
  const [tri, setTri] = useState({ col: null, sens: 1 });
  const [page, setPage] = useState(1);
  const lignes = useMemo(() => {
    if (!t) return [];
    const f = filtre.trim().toLowerCase();
    const l = f ? t.lignes.filter((x) => x.some((c) => String(c).toLowerCase().includes(f))) : [...t.lignes];
    if (tri.col !== null) {
      l.sort((a, b) => {
        const na = enNombre(a[tri.col]);
        const nb = enNombre(b[tri.col]);
        const c = na !== null && nb !== null ? na - nb : String(a[tri.col]).localeCompare(String(b[tri.col]), "fr");
        return c * tri.sens;
      });
    }
    return l;
  }, [t, filtre, tri]);
  if (!t) return <div style={{ fontSize: 13, color: "#94a3b8" }}>Aucune donnée chiffrée dans la réponse.</div>;
  const pages = Math.max(1, Math.ceil(lignes.length / parPage));
  const p = Math.min(page, pages);
  const visibles = lignes.slice((p - 1) * parPage, p * parPage);
  const trier = (i) => { setTri((x) => ({ col: i, sens: x.col === i ? -x.sens : 1 })); setPage(1); };
  const btn = { border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, padding: "3px 6px", cursor: "pointer", display: "inline-flex", alignItems: "center", color: "#475569" };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <SearchIcon style={{ position: "absolute", left: 8, top: 7, fontSize: 17, color: "#94a3b8" }} />
          <input value={filtre} onChange={(e) => { setFiltre(e.target.value); setPage(1); }} placeholder="Filtrer les données..." className="browser-default"
            style={{ width: "100%", height: 32, padding: "0 10px 0 30px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12.5, boxSizing: "border-box" }} />
        </div>
        <button type="button" onClick={() => exporterCsv(t.colonnes, lignes, titre)} title="Exporter le tableau au format CSV (Excel)"
          style={{ ...btn, padding: "5px 10px", fontSize: 12.5, fontWeight: 600, gap: 4 }}>
          <FileDownloadOutlinedIcon style={{ fontSize: 16 }} /> Exporter CSV
        </button>
      </div>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "auto", background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {t.colonnes.map((c, i) => (
                <th key={i} onClick={() => trier(i)} title="Trier"
                  style={{ textAlign: "left", padding: "10px 14px", color: "#334155", fontWeight: 700, borderBottom: "1px solid #e5e7eb", cursor: "pointer", whiteSpace: "nowrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {c}
                    {tri.col === i && (tri.sens > 0 ? <ArrowUpwardIcon style={{ fontSize: 14 }} /> : <ArrowDownwardIcon style={{ fontSize: 14 }} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 && (
              <tr><td colSpan={t.colonnes.length} style={{ padding: 14, textAlign: "center", color: "#94a3b8" }}>Aucune ligne ne correspond au filtre.</td></tr>
            )}
            {visibles.map((l, i) => (
              <tr key={i} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                {l.map((c, j) => <td key={j} style={{ padding: "9px 14px", borderBottom: "1px solid #f1f5f9", color: "#0F172A", fontWeight: j === 0 ? 600 : 400 }}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#64748b" }}>
        <span>{lignes.length} ligne(s)</span>
        {pages > 1 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <button type="button" style={btn} disabled={p <= 1} onClick={() => setPage(p - 1)}><ChevronLeftIcon style={{ fontSize: 16 }} /></button>
            Page {p} / {pages}
            <button type="button" style={btn} disabled={p >= pages} onClick={() => setPage(p + 1)}><ChevronRightIcon style={{ fontSize: 16 }} /></button>
          </span>
        )}
      </div>
    </div>
  );
};

/** Légende détaillée sous un graphique : puce de couleur, libellé, valeur et part du total (ChartLegendCustom). */
export const Legende = ({ serie, max = 6 }) => {
  const [tout, setTout] = useState(false);
  if (!Array.isArray(serie) || serie.length < 2) return null;
  const total = serie.reduce((s, x) => s + (Number(x.valeur) || 0), 0);
  const visibles = tout ? serie : serie.slice(0, max);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "4px 16px", marginTop: 10 }}>
      {visibles.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155" }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: couleur(i), flexShrink: 0 }} />
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.libelle}>{s.libelle}</span>
          <b style={{ color: "#0F172A" }}>{Number(s.valeur).toLocaleString("fr-FR")}</b>
          {total > 0 && <span style={{ color: "#94a3b8", width: 44, textAlign: "right" }}>{((Number(s.valeur) / total) * 100).toFixed(1)}%</span>}
        </div>
      ))}
      {serie.length > max && (
        <button type="button" onClick={() => setTout(!tout)} style={{ background: "none", border: "none", color: P, fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left", padding: 0 }}>
          {tout ? "Voir moins" : `+ ${serie.length - max} autre(s)`}
        </button>
      )}
    </div>
  );
};

/** Pied de carte : total et horodatage réel (CardFooter de l'ancienne version). */
export const PiedCarte = ({ serie, type, actualiseLe, epingleLe }) => {
  const total = Array.isArray(serie) ? serie.reduce((s, x) => s + (Number(x.valeur) || 0), 0) : 0;
  const date = actualiseLe || epingleLe;
  const d = date ? new Date(date) : null;
  const dateOk = d && !Number.isNaN(d.getTime());
  const afficherTotal = total > 0 && type !== "kpi";
  if (!afficherTotal && !dateOk) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingTop: 8, marginTop: 8, borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#64748b" }}>
      {afficherTotal ? <span style={{ fontFamily: "monospace" }}>Total : <b style={{ color: "#0F172A" }}>{total.toLocaleString("fr-FR")}</b></span> : <span />}
      {dateOk && (
        <span style={{ fontSize: 11.5 }}>
          {actualiseLe ? `Actualisé à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : `Épinglé le ${d.toLocaleDateString("fr-FR")}`}
        </span>
      )}
    </div>
  );
};

/** Requête SQL avec les mots-clés en couleur. */
const MOTS_SQL = /\b(SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|AS|AND|OR|NOT|IN|IS|NULL|CASE|WHEN|THEN|ELSE|END|JOIN|LEFT|RIGHT|INNER|OUTER|ON|LIMIT|OFFSET|DISTINCT|COUNT|SUM|AVG|MIN|MAX|ROUND|ASC|DESC|WITH|UNION|ALL|BETWEEN|LIKE|CAST|COALESCE|EXTRACT|DATE_TRUNC|YEAR|MONTH)\b/gi;
export const SqlColore = ({ sql, sombre = false }) => {
  const s = String(sql || "");
  const morceaux = [];
  let dernier = 0;
  s.replace(MOTS_SQL, (mot, _g, pos) => {
    if (pos > dernier) morceaux.push(s.slice(dernier, pos));
    morceaux.push(<span key={pos} style={{ color: sombre ? "#7dd3fc" : P, fontWeight: 700 }}>{mot}</span>);
    dernier = pos + mot.length;
    return mot;
  });
  morceaux.push(s.slice(dernier));
  return <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 13, color: sombre ? "#e2e8f0" : "#1e293b", fontFamily: "Consolas, 'Courier New', monospace", lineHeight: 1.7 }}>{morceaux}</pre>;
};
