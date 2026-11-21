// Aide de l'IA pendant l'enregistrement d'un dossier (réclamation, dénonciation, suggestion) :
// analyse automatique du contenu, suggestion de catégorie et de motif, urgence, raisonnement.
// Rendu des captures de référence (Suggestion IA + Appliquer, « Analysé en Xs », blocs de raisonnement).
import React, { useCallback, useEffect, useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { analyserTexte, iaDisponible, nouveauNumeroAnalyse } from "../../apis/IA/IaApi";

const sansAccent = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Option d'une liste (react-select) qui correspond au libellé proposé par l'IA. */
export const optionPourSuggestion = (suggestion, options) => {
  if (!suggestion || !Array.isArray(options)) return null;
  const s = sansAccent(suggestion);
  return options.find((o) => sansAccent(o.label) === s)
    || options.find((o) => sansAccent(o.label).includes(s) || s.includes(sansAccent(o.label)))
    || null;
};

const memeLibelle = (a, b) => a && b && sansAccent(a) === sansAccent(b);

/** Niveau d'urgence lisible à partir de la valeur du Core IA. */
export const niveauUrgence = (u) => {
  const v = sansAccent(u);
  if (!v) return null;
  if (["grave", "high", "haute", "eleve", "elevee", "critique", "majeur", "urgent"].some((x) => v.includes(x)))
    return { libelle: "HAUTE", couleur: "#b91c1c", fond: "#fee2e2", bord: "#fca5a5" };
  if (["moyen", "medium", "moderee", "modere"].some((x) => v.includes(x)))
    return { libelle: "MOYENNE", couleur: "#b45309", fond: "#fef3c7", bord: "#fcd34d" };
  return { libelle: "BASSE", couleur: "#15803d", fond: "#dcfce7", bord: "#86efac" };
};

/**
 * Analyse IA du contenu saisi : relancée 1 s après la dernière frappe, dès 15 caractères (comme l'ancienne version).
 * Renvoie l'état de l'analyse et de quoi la relancer.
 */
export const useAnalyseIa = ({ texte, nature = "RECLAMATION", actif = true }) => {
  const vide = {
    chargement: false, erreur: null, correlationId: null, secondes: 0,
    urgence: null, sentiment: null, resume: null, motsCles: [],
    raisonnementUrgence: "", raisonnementClassification: "", categorie: null, motif: null,
    dureeUrgence: null, dureeClassification: null, termine: false,
  };
  const [etat, setEtat] = useState(vide);
  const [disponible, setDisponible] = useState(false);
  const dernierTexte = useRef("");
  const annulation = useRef(null);
  const debut = useRef(0);

  useEffect(() => {
    let actifLocal = true;
    iaDisponible().then((ok) => actifLocal && setDisponible(ok));
    return () => {
      actifLocal = false;
      annulation.current?.abort();
    };
  }, []);

  // Chronomètre pendant l'analyse.
  useEffect(() => {
    if (!etat.chargement) return undefined;
    const t = setInterval(() => setEtat((e) => ({ ...e, secondes: Math.round((Date.now() - debut.current) / 100) / 10 })), 300);
    return () => clearInterval(t);
  }, [etat.chargement]);

  const lancer = useCallback((contenu) => {
    annulation.current?.abort();
    const t = (contenu || "").trim();
    if (t.length < 15) {
      setEtat(vide);
      return;
    }
    const controle = new AbortController();
    annulation.current = controle;
    const correlationId = nouveauNumeroAnalyse();
    debut.current = Date.now();
    const ecoule = () => Math.round((Date.now() - debut.current) / 100) / 10;
    setEtat({ ...vide, chargement: true, correlationId });
    analyserTexte({ texte: t, nature, correlationId, signal: controle.signal }, {
      surBase: (b) => setEtat((e) => ({ ...e, sentiment: b.sentiment, motsCles: b.motsCles || [], resume: b.resume })),
      surUrgence: (u) => setEtat((e) => ({ ...e, urgence: u, dureeUrgence: e.dureeUrgence ?? ecoule() })),
      surRaisonnementUrgence: (m) => setEtat((e) => ({ ...e, raisonnementUrgence: e.raisonnementUrgence + m })),
      surRaisonnementClassification: (m) => setEtat((e) => ({ ...e, raisonnementClassification: e.raisonnementClassification + m })),
      surFin: (f) => setEtat((e) => ({
        ...e,
        chargement: false,
        termine: true,
        secondes: ecoule(),
        correlationId: f.correlationId || e.correlationId,
        categorie: f.categorie,
        motif: f.motif,
        urgence: f.urgence || e.urgence,
        sentiment: f.sentiment || e.sentiment,
        raisonnementClassification: f.raisonnement || e.raisonnementClassification,
        raisonnementUrgence: f.raisonnementUrgence || e.raisonnementUrgence,
        dureeClassification: Math.max(0, Math.round((ecoule() - (e.dureeUrgence || 0)) * 10) / 10),
      })),
      surErreur: (m) => setEtat((e) => ({ ...e, chargement: false, erreur: m })),
    });
  }, [nature]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!actif || !disponible) return undefined;
    const t = (texte || "").trim();
    if (t === dernierTexte.current) return undefined;
    const minuteur = setTimeout(() => {
      dernierTexte.current = t;
      lancer(t);
    }, 1000);
    return () => clearTimeout(minuteur);
  }, [texte, actif, disponible, lancer]);

  const relancer = () => {
    dernierTexte.current = (texte || "").trim();
    lancer(texte);
  };
  const reinitialiser = () => {
    annulation.current?.abort();
    dernierTexte.current = "";
    setEtat(vide);
  };

  return { ...etat, disponible, relancer, reinitialiser };
};

/** Encadré sous un champ : « Suggestion IA : X » (bleu) ou « L'IA suggère plutôt : X » (orange) + Appliquer. */
export const SuggestionIa = ({ suggestion, valeurActuelle, onAppliquer }) => {
  if (!suggestion || memeLibelle(suggestion, valeurActuelle)) return null;
  const divergent = !!valeurActuelle;
  const c = divergent
    ? { fond: "#fff7ed", bord: "#fdba74", texte: "#c2410c" }
    : { fond: "#e8f4fc", bord: "#99cde8", texte: "var(--gpr-primary-dark, #003d62)" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, padding: "8px 12px", background: c.fond,
      border: `1px solid ${c.bord}`, borderRadius: 8 }}>
      <span style={{ fontSize: 16 }} aria-hidden>💡</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: c.texte }}>
        {divergent ? `L'IA suggère plutôt : ${suggestion}` : `Suggestion IA : ${suggestion}`}
      </span>
      <button type="button" onClick={onAppliquer}
        style={{ background: "#fff", border: `1px solid ${divergent ? "#f97316" : "var(--gpr-primary, #005081)"}`, color: divergent ? "#c2410c" : "var(--gpr-primary, #005081)",
          borderRadius: 6, padding: "3px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
        Appliquer
      </button>
    </div>
  );
};

/** Étiquette à côté du libellé « Contenu » : URGENCE : BASSE / MOYENNE / HAUTE. */
export const BadgeUrgenceIa = ({ urgence }) => {
  const n = niveauUrgence(urgence);
  if (!n) return null;
  return (
    <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 10, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4,
      color: n.couleur, background: n.fond, border: `1px solid ${n.bord}`, verticalAlign: "middle" }}>
      GRAVITÉ : {n.libelle}
    </span>
  );
};

const Bloc = ({ titre, duree, texte, enCours, children }) => {
  const [ouvert, setOuvert] = useState(true);
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => setOuvert(!ouvert)}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gpr-primary, #005081)" }}>{titre} {ouvert ? "▾" : "▸"}</span>
        <span style={{ flex: 1 }} />
        {duree != null && <span style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b" }}>Réflexion : {duree}s</span>}
        {enCours && duree == null && <CircularProgress size={11} style={{ color: "#f59e0b" }} />}
      </div>
      {ouvert && (
        <>
          {texte && (
            <div style={{ margin: "8px 0", padding: "8px 12px", borderLeft: "3px solid var(--gpr-primary, #005081)", background: "#fff",
              fontStyle: "italic", fontSize: 12.5, color: "#334155", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {texte}
            </div>
          )}
          {children}
        </>
      )}
    </div>
  );
};

/** « ● Analysé en Xs ▶ » + raisonnement de l'urgence et de la classification + bouton pour relancer. */
export const PanneauAnalyseIa = ({ analyse }) => {
  const [ouvert, setOuvert] = useState(false);
  if (!analyse || (!analyse.chargement && !analyse.termine && !analyse.erreur)) return null;
  const n = niveauUrgence(analyse.urgence);
  // Placé au-dessus du texte du Contenu (comme les captures) : l'espace du haut laisse la place au libellé.
  return (
    <div style={{ paddingTop: 24, marginBottom: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: analyse.erreur ? "#ef4444" : analyse.chargement ? "#f59e0b" : "#22c55e", fontSize: 12 }}>●</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", cursor: analyse.erreur ? "default" : "pointer" }}
          onClick={() => !analyse.erreur && setOuvert(!ouvert)}>
          {analyse.erreur ? analyse.erreur : analyse.chargement ? `Analyse en cours… ${analyse.secondes}s` : `Analysé en ${analyse.secondes}s`}
          {!analyse.erreur && <span style={{ marginLeft: 6, fontSize: 11, color: "#475569" }}>{ouvert ? "▼" : "▶"}</span>}
        </span>
        {analyse.chargement && <CircularProgress size={12} style={{ color: "#f59e0b" }} />}
        <span style={{ flex: 1 }} />
        {!analyse.chargement && (
          <button type="button" title="Relancer l'analyse IA" onClick={analyse.relancer}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gpr-primary, #005081)", fontSize: 16, padding: 0 }}>⟳</button>
        )}
      </div>
      {ouvert && !analyse.erreur && (
        <div style={{ marginTop: 8, padding: "4px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10 }}>
          <Bloc titre="Analyse de l'urgence" duree={analyse.dureeUrgence} texte={analyse.raisonnementUrgence} enCours={analyse.chargement}>
            {analyse.urgence && (
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b" }}>
                Urgence analysée :{" "}
                <span style={{ fontFamily: "monospace", padding: "1px 6px", borderRadius: 4, color: n?.couleur, background: n?.fond }}>
                  #{String(analyse.urgence).toUpperCase()}
                </span>
              </div>
            )}
          </Bloc>
          <div style={{ borderTop: "1px dashed #cbd5e1" }} />
          <Bloc titre="Analyse de la classification" duree={analyse.dureeClassification} texte={analyse.raisonnementClassification}
            enCours={analyse.chargement}>
            {(analyse.categorie || analyse.motif) && (
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "flex", gap: 24, flexWrap: "wrap" }}>
                {analyse.categorie && <span>Catégorie suggérée : <span style={{ color: "var(--gpr-primary, #005081)" }}>#{analyse.categorie}</span></span>}
                {analyse.motif && <span>Motif suggéré : <span style={{ color: "var(--gpr-primary, #005081)" }}>#{analyse.motif}</span></span>}
              </div>
            )}
          </Bloc>
        </div>
      )}
    </div>
  );
};
