// Raisonnement de l'IA en 3 étapes (repris de AiReasoningTrace de l'ancienne version) :
// ouvert et animé pendant la réponse, refermé quand elle est terminée ; chaque étape se déplie.
// Tout le contenu vient de l'API : tables (retrievedTables), réflexion (sqlGenerationReasoning), requête (sql).
import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { P, SqlColore } from "./graphiques";

/** Découpe la réflexion de l'IA en étapes « titre – détail » (comme l'ancienne version). */
export const etapesReflexion = (texte) => String(texte || "").replace(/\\n/g, "\n").split(/\n+/).map((l) => l.trim()).filter(Boolean)
  .map((l, i) => {
    const m = l.replace(/^[-*•]\s*/, "").match(/^(\d+[.)]\s*)?\*\*(.*?)\*\*\s*[–\-—:]\s*(.*)$/);
    return m ? { titre: m[2].trim(), detail: m[3].trim() } : { titre: `Étape ${i + 1}`, detail: l.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, "") };
  });

// Noms de tables et de colonnes mis en évidence dans la réflexion.
const avecBadges = (texte) => String(texte).split(/((?:table|colonne|column)\s*:\s*[a-zA-Z0-9_."]+|`[^`]+`)/gi).map((p, i) =>
  /^(table|colonne|column)\s*:|^`/i.test(p)
    ? <code key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, padding: "0 5px", fontSize: 12, margin: "0 2px" }}>{p.replace(/`/g, "")}</code>
    : <span key={i}>{p.replace(/\*\*/g, "")}</span>);

const Icone = ({ etat }) => {
  if (etat === "encours") return <CircularProgress size={14} style={{ color: P }} />;
  if (etat === "attente") return <RadioButtonUncheckedIcon style={{ fontSize: 16, color: "#cbd5e1" }} />;
  return <CheckCircleOutlineIcon style={{ fontSize: 16, color: "#16a34a" }} />;
};

const Etape = ({ etat, titre, ouvert, onBasculer, children }) => (
  <div style={{ position: "relative", paddingBottom: 12, opacity: etat === "attente" ? 0.6 : 1 }}>
    <button type="button" onClick={onBasculer}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
      <Icone etat={etat} /> {titre}
      <ChevronRightIcon style={{ fontSize: 18, color: "#64748b", transform: ouvert ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
    </button>
    {ouvert && <div style={{ paddingLeft: 24, paddingTop: 6 }}>{children}</div>}
  </div>
);

const TraceRaisonnement = ({ enCours, duree, tables = [], reflexion, sql }) => {
  const [ouvert, setOuvert] = useState(!!enCours);
  const [etapes, setEtapes] = useState({ 1: true, 2: true, 3: true });
  const [secondes, setSecondes] = useState(0);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    if (!enCours) { setOuvert(false); return undefined; }
    setOuvert(true);
    setSecondes(0);
    const debut = Date.now();
    const t = setInterval(() => setSecondes(Math.round((Date.now() - debut) / 100) / 10), 100);
    return () => clearInterval(t);
  }, [enCours]);

  const pensees = etapesReflexion(reflexion);
  const aTables = tables.length > 0;
  const aReflexion = pensees.length > 0;
  const aSql = !!(sql && String(sql).trim());
  const etat1 = enCours && !aTables ? "encours" : "fait";
  const etat2 = enCours ? (!aTables ? "attente" : !aReflexion ? "encours" : "fait") : "fait";
  const etat3 = enCours ? (!aReflexion ? "attente" : !aSql ? "encours" : "fait") : "fait";
  const basculer = (n) => setEtapes((e) => ({ ...e, [n]: !e[n] }));
  const copier = () => { navigator.clipboard?.writeText(sql || ""); setCopie(true); setTimeout(() => setCopie(false), 2000); };
  const s = enCours ? secondes : (typeof duree === "number" ? Math.round(duree * 10) / 10 : duree);

  return (
    <div style={{ margin: "6px 0 10px" }}>
      <button type="button" onClick={() => setOuvert(!ouvert)}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
        {enCours ? <CircularProgress size={14} style={{ color: P }} /> : <CheckCircleOutlineIcon style={{ fontSize: 16, color: "#94a3b8" }} />}
        {enCours ? `Raisonnement en cours (${s}s)...` : `Raisonné en 3 étapes (${s}s)`}
        <ChevronRightIcon style={{ fontSize: 18, color: "#64748b", transform: ouvert ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
      </button>
      {ouvert && (
        <div style={{ marginTop: 10, marginLeft: 7, paddingLeft: 18, borderLeft: "1px solid #e2e8f0" }}>
          <Etape etat={etat1} ouvert={etapes[1]} onBasculer={() => basculer(1)}
            titre={etat1 === "encours" ? "Recherche des modèles candidats..." : `Récupération des ${tables.length} modèles candidats`}>
            {aTables && (
              <>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>{tables.length} modèles candidats identifiés :</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tables.map((t) => <code key={t} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 8px", fontSize: 12, color: "#334155" }}>{t}</code>)}
                </div>
              </>
            )}
          </Etape>
          <Etape etat={etat2} ouvert={etapes[2]} onBasculer={() => basculer(2)}
            titre={etat2 === "encours" ? "Organisation de la réflexion..." : "Organisation de la réflexion"}>
            {pensees.map((p, i) => (
              <div key={i} style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, marginBottom: 4 }}>
                <b>{i + 1}. {p.titre}</b> – {avecBadges(p.detail)}
              </div>
            ))}
          </Etape>
          <Etape etat={etat3} ouvert={etapes[3]} onBasculer={() => basculer(3)}
            titre={etat3 === "encours" ? "Génération de la requête SQL..." : "Génération de la requête SQL"}>
            {aSql && (
              <>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>Requête SQL générée avec succès :</div>
                <div style={{ position: "relative", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 40px 12px 14px" }}>
                  <SqlColore sql={sql} />
                  <button type="button" onClick={copier} title={copie ? "Copié !" : "Copier le SQL"}
                    style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "inline-flex" }}>
                    {copie ? <CheckIcon style={{ fontSize: 16, color: "#16a34a" }} /> : <ContentCopyIcon style={{ fontSize: 16 }} />}
                  </button>
                </div>
              </>
            )}
          </Etape>
        </div>
      )}
    </div>
  );
};

export default TraceRaisonnement;
