// Tableau de bord du Reporting IA (architecture de PinnedGrid / PinnedCard de l'ancienne version) :
// graphiques épinglés à déplacer à la souris, actualiser, plein écran, retirer ; sinon les 6 questions types.
import React, { useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import { ChoixType, GraphiqueIa, Legende, P, PiedCarte, TableauDonnees } from "./graphiques";

// Les 6 questions types des captures de référence (texte identique).
export const QUESTIONS = [
  { theme: "QUESTIONS COMPARATIVES", bord: "#0369a1", couleur: "#0369a1", fond: "#e0f2fe", texte: "Quelle est l'évolution mensuelle des réclamations et des résolutions sur l'année en cours ?" },
  { theme: "QUESTIONS DE SEGMENTATION", bord: "#0ea5e9", couleur: "#0369a1", fond: "#e0f2fe", texte: "Comment se répartissent les réclamations selon les 8 grandes catégories de motifs bancaires ?" },
  { theme: "QUESTIONS DE PILOTAGE SLA", bord: "#10b981", couleur: "#15803d", fond: "#dcfce7", texte: "Quel est le délai moyen de traitement par agence et quelles agences dépassent l'engagement de 5 jours ?" },
  { theme: "QUESTIONS QUALITÉ", bord: "#8b5cf6", couleur: "#7e22ce", fond: "#f3e8ff", texte: "Quel est le taux de satisfaction client après résolution définitive des litiges au T3 ?" },
  { theme: "QUESTIONS DE RISQUE", bord: "#ef4444", couleur: "#b91c1c", fond: "#fee2e2", texte: "Quels sont les motifs de contentieux classés 'LITIGATION' nécessitant une provision de risque ?" },
  { theme: "QUESTIONS D'EFFICIENCE", bord: "#f59e0b", couleur: "#b45309", fond: "#fef3c7", texte: "Comment évolue la proportion des dossiers résolus au premier contact (FCR) ?" },
];

export const QuestionsTypes = ({ onChoisir, desactive }) => (
  <div>
    <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "16px 20px" }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <LightbulbOutlinedIcon style={{ color: P, fontSize: 20 }} />
      </span>
      <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 600 }}>Explorez vos données bancaires. Cliquez sur une question suggérée pour l'analyser dans le Copilote :</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18, marginTop: 20 }}>
      {QUESTIONS.map((q) => (
        <button type="button" key={q.theme} onClick={() => onChoisir(q.texte)} disabled={desactive}
          style={{ textAlign: "left", background: "#fff", border: "1px solid #e5e7eb", borderLeft: `4px solid ${q.bord}`, borderRadius: 14, padding: "18px 20px",
            cursor: desactive ? "default" : "pointer", minHeight: 130, boxShadow: "0 1px 2px rgba(15,23,42,.04)" }}>
          <span style={{ display: "inline-block", background: q.fond, color: q.couleur, fontWeight: 700, fontSize: 11, borderRadius: 20, padding: "3px 10px", marginBottom: 10, letterSpacing: 0.3 }}>{q.theme}</span>
          <div style={{ fontSize: 14, color: "#0F172A", lineHeight: 1.55 }}>{q.texte}</div>
        </button>
      ))}
    </div>
  </div>
);

const BoutonCarte = ({ titre, onClick, couleur, children }) => (
  <Tooltip title={titre} arrow>
    <button type="button" onClick={onClick} aria-label={titre}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "inline-flex", color: couleur || "#64748b" }}>{children}</button>
  </Tooltip>
);

// Nombre de colonnes de la grille selon la largeur de l'écran (1, 2 ou 3, comme l'ancienne version).
const useColonnes = () => {
  const calcul = () => (window.innerWidth < 900 ? 1 : window.innerWidth < 1350 ? 2 : 3);
  const [n, setN] = useState(calcul);
  useEffect(() => {
    const maj = () => setN(calcul());
    window.addEventListener("resize", maj);
    return () => window.removeEventListener("resize", maj);
  }, []);
  return n;
};

const CarteEpinglee = ({ w, onRetirer, onActualiser, onPleinEcran, onMettreAJour, glisser }) => {
  const [chargement, setChargement] = useState(false);
  const d = w.data || {};
  const serie = Array.isArray(d.serie) ? d.serie : [];
  const type = w.chartType || (serie.length === 1 ? "kpi" : "barh");
  const largeur = d.colSpan || 1;
  const actualiser = async () => { setChargement(true); await onActualiser(w); setChargement(false); };
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, height: "100%", boxSizing: "border-box",
      boxShadow: "0 1px 2px rgba(15,23,42,.04)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
        <Tooltip title="Glisser pour réorganiser" arrow>
          <span draggable onDragStart={glisser.onDragStart} onDragEnd={glisser.onDragEnd} style={{ cursor: "grab", color: "#cbd5e1", display: "inline-flex", paddingTop: 2 }}>
            <DragIndicatorIcon style={{ fontSize: 18 }} />
          </span>
        </Tooltip>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#0F172A", lineHeight: 1.4 }} title={w.title}>{w.title}</div>
        <BoutonCarte titre={`Largeur : ${largeur} colonne(s). Cliquer pour modifier.`}
          onClick={() => onMettreAJour(w, { data: { ...d, colSpan: largeur === 1 ? 2 : largeur === 2 ? 3 : 1 } })}>
          <ViewColumnOutlinedIcon style={{ fontSize: 17 }} />
        </BoutonCarte>
        {w.sqlQuery && <BoutonCarte titre="Rafraîchir les données" onClick={actualiser}>{chargement ? <CircularProgress size={14} /> : <RefreshIcon style={{ fontSize: 18 }} />}</BoutonCarte>}
        <BoutonCarte titre="Mode plein écran" onClick={() => onPleinEcran({ titre: w.title, question: w.description, serie, tableau: d.tableau, sql: w.sqlQuery, type })}>
          <OpenInFullIcon style={{ fontSize: 16 }} />
        </BoutonCarte>
        <BoutonCarte titre="Détacher du tableau de bord" onClick={() => onRetirer(w)} couleur="#b91c1c"><CloseIcon style={{ fontSize: 18 }} /></BoutonCarte>
      </div>
      {serie.length >= 1 && (
        <div><ChoixType type={type} onChange={(nouveau) => onMettreAJour(w, { chartType: nouveau })} avecTableau /></div>
      )}
      {w.summary && <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.5 }}>{w.summary}</div>}
      <div style={{ flex: 1 }}>
        {serie.length >= 1 && type !== "table" ? (
          <>
            <GraphiqueIa serie={serie} type={type} sousTitre={w.description !== w.title ? w.description : null}
              hauteur={type === "barh" ? Math.max(170, serie.length * 32 + 30) : 240} />
            {type !== "kpi" && <Legende serie={serie} />}
          </>
        ) : <TableauDonnees tableau={d.tableau} serie={serie} titre={w.title} parPage={6} />}
      </div>
      <PiedCarte serie={serie} type={type} actualiseLe={d.actualiseLe} epingleLe={w.createdAt} />
    </div>
  );
};

const TableauDeBord = ({ epingles, onRetirer, onActualiser, onPleinEcran, onReordonner, onMettreAJour, onChoisirQuestion, enCours }) => {
  const [deplace, setDeplace] = useState(null);
  const [survol, setSurvol] = useState(null);
  const colonnes = useColonnes();

  if (!epingles.length) return <QuestionsTypes onChoisir={onChoisirQuestion} desactive={enCours} />;

  const deposer = (cible) => {
    if (!deplace || deplace === cible) return;
    const liste = [...epingles];
    const de = liste.findIndex((w) => w.id === deplace);
    const vers = liste.findIndex((w) => w.id === cible);
    const [w] = liste.splice(de, 1);
    liste.splice(vers, 0, w);
    onReordonner(liste);
  };

  return (
    <div>
      <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 10 }}>
        Faites glisser une carte par sa poignée pour changer l'ordre ; le bouton colonnes change sa largeur.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${colonnes}, minmax(0, 1fr))`, gap: 16, gridAutoRows: "minmax(0, auto)" }}>
        {epingles.map((w) => (
          <div key={w.id}
            onDragOver={(e) => { e.preventDefault(); setSurvol(w.id); }}
            onDragLeave={() => setSurvol(null)}
            onDrop={(e) => { e.preventDefault(); deposer(w.id); setDeplace(null); setSurvol(null); }}
            style={{ gridColumn: `span ${Math.min((w.data && w.data.colSpan) || 1, colonnes)}`, opacity: deplace === w.id ? 0.4 : 1, borderRadius: 16,
              outline: survol === w.id && deplace !== w.id ? `2px dashed ${P}` : "none", outlineOffset: 2, transition: "opacity .2s" }}>
            <CarteEpinglee w={w} onRetirer={onRetirer} onActualiser={onActualiser} onPleinEcran={onPleinEcran} onMettreAJour={onMettreAJour}
              glisser={{
                onDragStart: (e) => { setDeplace(w.id); e.dataTransfer.effectAllowed = "move"; },
                onDragEnd: () => { setDeplace(null); setSurvol(null); },
              }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableauDeBord;
