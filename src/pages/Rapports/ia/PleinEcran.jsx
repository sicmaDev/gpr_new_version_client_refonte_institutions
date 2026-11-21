// Mode plein écran d'un graphique (repris de WidgetFullscreenModal de l'ancienne version) :
// onglets Visualisation / Tableau de données / SQL, choix du type, total et légende détaillée.
import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import BarChartIcon from "@mui/icons-material/BarChart";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import CodeIcon from "@mui/icons-material/Code";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { ChoixType, DEGRADE, GraphiqueIa, P, SqlColore, TableauDonnees, couleur } from "./graphiques";

const Onglet = ({ actif, onClick, Icone, children }) => (
  <button type="button" onClick={onClick}
    style={{ border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
      background: actif ? P : "transparent", color: actif ? "#fff" : "#64748b" }}>
    <Icone style={{ fontSize: 16 }} /> {children}
  </button>
);

/** g : { titre, question, serie, tableau, sql, type } */
const PleinEcran = ({ g, onFermer }) => {
  const [onglet, setOnglet] = useState("graphique");
  const [type, setType] = useState(g?.type || "barh");
  const [copie, setCopie] = useState(false);
  useEffect(() => { setOnglet("graphique"); setType(g?.type || "barh"); }, [g]);
  if (!g) return null;
  const serie = g.serie || [];
  const total = serie.reduce((s, x) => s + (Number(x.valeur) || 0), 0);
  const copier = () => { navigator.clipboard?.writeText(g.sql || ""); setCopie(true); setTimeout(() => setCopie(false), 2000); };

  return (
    <Dialog open={!!g} onClose={onFermer} maxWidth="lg" fullWidth PaperProps={{ style: { borderRadius: 16, overflow: "hidden", height: "88vh" } }}>
      <div style={{ background: DEGRADE, padding: "16px 22px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BarChartIcon style={{ color: "#fff", fontSize: 20 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.titre}</div>
          {g.question && g.question !== g.titre && <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontStyle: "italic" }}>« {g.question} »</div>}
        </div>
        <IconButton onClick={onFermer} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
          <CloseIcon style={{ fontSize: 16 }} />
        </IconButton>
      </div>

      <div style={{ padding: "8px 22px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: "#f8fafc" }}>
        <Onglet actif={onglet === "graphique"} onClick={() => setOnglet("graphique")} Icone={BarChartIcon}>Visualisation</Onglet>
        <Onglet actif={onglet === "tableau"} onClick={() => setOnglet("tableau")} Icone={TableChartOutlinedIcon}>Tableau de données</Onglet>
        {g.sql && <Onglet actif={onglet === "sql"} onClick={() => setOnglet("sql")} Icone={CodeIcon}>SQL</Onglet>}
        <span style={{ flex: 1 }} />
        {onglet === "graphique" && serie.length > 0 && <ChoixType type={type} onChange={(t) => (t === "table" ? setOnglet("tableau") : setType(t))} avecTableau />}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
        {onglet === "graphique" && (serie.length === 0
          ? <div style={{ fontSize: 13, color: "#94a3b8" }}>Pas de valeurs chiffrées à représenter dans cette réponse.</div>
          : (
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "stretch" }}>
              <div style={{ flex: "1 1 520px", minWidth: 0, border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
                <GraphiqueIa serie={serie} type={type} hauteur={Math.max(420, type === "barh" ? serie.length * 40 + 40 : 0)} />
              </div>
              <div style={{ flex: "0 0 280px", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, background: "#f8fafc", maxHeight: 480, overflowY: "auto" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 0.5 }}>TOTAL</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>{total.toLocaleString("fr-FR")}</div>
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
                  <span>Légende détaillée</span><span style={{ color: "#94a3b8", fontWeight: 400 }}>{serie.length} catégories</span>
                </div>
                {serie.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#334155", padding: "4px 0" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: couleur(i), flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{s.libelle}</span>
                    <b>{Number(s.valeur).toLocaleString("fr-FR")}</b>
                  </div>
                ))}
              </div>
            </div>
          ))}
        {onglet === "tableau" && <TableauDonnees tableau={g.tableau} serie={serie} />}
        {onglet === "sql" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "#64748b" }}>Requête SQL générée par l'IA</span>
              <button type="button" onClick={copier}
                style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, color: "#334155" }}>
                {copie ? <><CheckIcon style={{ fontSize: 14, color: "#16a34a" }} /> Copié</> : <><ContentCopyIcon style={{ fontSize: 14 }} /> Copier SQL</>}
              </button>
            </div>
            <div style={{ background: "#0f172a", borderRadius: 12, padding: 20, overflowX: "auto" }}><SqlColore sql={g.sql} sombre /></div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default PleinEcran;
