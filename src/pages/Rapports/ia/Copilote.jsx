// Copilote décisionnel en pleine page (architecture de AiCopilotCanvasView de l'ancienne version) :
// barre du haut avec les boutons Tableau de bord / Règles métier / Historique / Nouvelle session,
// fil de la conversation qui défile, zone de question fixée en bas avec les raccourcis.
// Tout ce qui est affiché dans les réponses vient de l'API (texte, tables, réflexion, SQL, identifiant, durée).
import React, { useEffect, useMemo, useRef, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import CircularProgress from "@mui/material/CircularProgress";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import HistoryIcon from "@mui/icons-material/History";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import MicIcon from "@mui/icons-material/Mic";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import TraceRaisonnement from "./TraceRaisonnement";
import { ChoixType, DEGRADE, GraphiqueIa, Legende, P, PiedCarte, TableauDonnees, typeParDefaut } from "./graphiques";
import { blocsTexte, lireSerieComplete, lireTableau, morceauxGras } from "./reponseIa";
import PublicIcon from "@mui/icons-material/Public";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

// Raccourcis au-dessus de la zone de question (libellés, questions et icônes de l'ancienne version).
export const RACCOURCIS = [
  { libelle: "Évolution mensuelle", question: "Évolution mensuelle des réclamations", Icone: TrendingUpIcon },
  { libelle: "Répartition par motif", question: "Répartition des réclamations par motif", Icone: BarChartIcon },
  { libelle: "Délais moyens par agence", question: "Délais moyens de traitement par agence", Icone: ScheduleIcon },
];

const TexteRiche = ({ texte }) => (
  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.65 }}>
    {blocsTexte(texte).map((b, i) => {
      const contenu = morceauxGras(b.texte).map((m, j) => (m.gras ? <b key={j} style={{ color: "#0F172A" }}>{m.texte}</b> : <span key={j}>{m.texte}</span>));
      if (b.type === "titre") return <div key={i} style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "10px 0 4px" }}>{contenu}</div>;
      if (b.type === "puce") return <div key={i} style={{ paddingLeft: 16, position: "relative" }}><span style={{ position: "absolute", left: 2 }}>•</span>{contenu}</div>;
      return <p key={i} style={{ margin: "4px 0" }}>{contenu}</p>;
    })}
  </div>
);

const Action = ({ titre, onClick, actif, couleurActive, children }) => (
  <Tooltip title={titre} arrow>
    <button type="button" onClick={onClick} aria-label={titre}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 5, borderRadius: 6, display: "inline-flex", color: actif ? couleurActive || P : "#94a3b8" }}>
      {children}
    </button>
  </Tooltip>
);

const BoutonHaut = ({ titre, onClick, nombre, couleurBadge = P, children }) => (
  <Tooltip title={titre} arrow>
    <button type="button" onClick={onClick} aria-label={titre}
      style={{ width: 36, height: 36, border: "1px solid #e5e7eb", background: "#fff", borderRadius: 10, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#334155" }}>
      <Badge badgeContent={nombre || 0} invisible={!nombre} sx={{ "& .MuiBadge-badge": { background: couleurBadge, color: "#fff", fontSize: 10, minWidth: 16, height: 16 } }}>
        {children}
      </Badge>
    </button>
  </Tooltip>
);

const useCopie = () => {
  const [copie, setCopie] = useState(null);
  return [copie, (texte, id) => { navigator.clipboard?.writeText(texte || ""); setCopie(id); setTimeout(() => setCopie(null), 2000); }];
};

/** Réponse de l'IA : raisonnement, texte, carte graphique (choix du type, épingler, plein écran), actions. */
const Reponse = ({ m, epingle, onEpingler, onType, onAvis, onRelancer, onEnseigner, onPleinEcran, copie, copier }) => {
  const tableau = useMemo(() => lireTableau(m.texte), [m.texte]);
  const serie = useMemo(() => lireSerieComplete(m.texte, tableau), [m.texte, tableau]);
  const type = m.typeGraphique || (serie.length === 1 ? "kpi" : serie.length >= 2 ? typeParDefaut(m.question) : "table");
  const aDonnees = serie.length >= 1 || !!tableau;
  const graphique = { titre: m.question, question: m.question, serie, tableau, sql: m.sql, type };
  return (
    <div style={{ maxWidth: "100%" }}>
      <TraceRaisonnement enCours={m.enCours} duree={m.duree} tables={m.tables || []} reflexion={m.reflexion} sql={m.sql} />
      {m.enCours && !m.texte && <div style={{ fontSize: 13, color: "#64748b", margin: "6px 0" }}>{m.etape || "Analyse de la question…"}</div>}
      {m.erreur && <div style={{ margin: "10px 0", padding: "10px 14px", background: "#FEF2F2", color: "#B91C1C", borderRadius: 8, fontSize: 13 }}>{m.erreur}</div>}
      {m.texte && <TexteRiche texte={m.texte} />}

      {!m.enCours && aDonnees && (
        <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", overflow: "hidden", boxShadow: "0 1px 2px rgba(15,23,42,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{m.question}</div>
            {serie.length >= 1 && <ChoixType type={type} onChange={(t) => onType(m, t)} avecTableau />}
            <Tooltip title={epingle ? "Déjà épinglé au tableau de bord" : "Épingler à mon tableau de bord"} arrow>
              <button type="button" onClick={() => !epingle && onEpingler(m, { serie, tableau, type })}
                style={{ border: "1px solid #e5e7eb", background: epingle ? "#e8f4fc" : "#fff", borderRadius: 8, padding: "5px 7px", cursor: epingle ? "default" : "pointer", display: "inline-flex", color: P }}>
                {epingle ? <PushPinIcon style={{ fontSize: 17 }} /> : <PushPinOutlinedIcon style={{ fontSize: 17 }} />}
              </button>
            </Tooltip>
            <Tooltip title="Plein écran" arrow>
              <button type="button" onClick={() => onPleinEcran(graphique)}
                style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, padding: "5px 7px", cursor: "pointer", display: "inline-flex", color: "#64748b" }}>
                <OpenInFullIcon style={{ fontSize: 16 }} />
              </button>
            </Tooltip>
          </div>
          <div style={{ padding: 14 }}>
            {type === "table" || serie.length === 0
              ? <TableauDonnees tableau={tableau} serie={serie} titre={m.question} />
              : (
                <>
                  <GraphiqueIa serie={serie} type={type} sousTitre={m.question} />
                  {type !== "kpi" && <Legende serie={serie} />}
                  <PiedCarte serie={serie} type={type} />
                </>
              )}
          </div>
        </div>
      )}

      {/* Tableau détaillé renvoyé par l'IA (quand sa réponse contient un tableau de plusieurs colonnes) */}
      {!m.enCours && tableau && tableau.colonnes.length > 2 && type !== "table" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6, letterSpacing: 0.3 }}>
            <TableChartOutlinedIcon style={{ fontSize: 16 }} /> TABLEAU DÉTAILLÉ
          </div>
          <TableauDonnees tableau={tableau} titre={m.question} />
        </div>
      )}

      {!m.enCours && !m.erreur && (
        <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 12, paddingTop: 8, borderTop: "1px solid #f1f5f9", flexWrap: "wrap" }}>
          <Action titre={copie === m.id ? "Copié !" : "Copier la réponse"} onClick={() => copier(m.texte, m.id)}>
            {copie === m.id ? <CheckIcon style={{ fontSize: 17, color: "#16a34a" }} /> : <ContentCopyIcon style={{ fontSize: 17 }} />}
          </Action>
          <Action titre="J'aime" onClick={() => onAvis(m, m.avis === "bon" ? null : "bon")} actif={m.avis === "bon"}><ThumbUpAltOutlinedIcon style={{ fontSize: 17 }} /></Action>
          <Action titre="Je n'aime pas" onClick={() => onAvis(m, m.avis === "mauvais" ? null : "mauvais")} actif={m.avis === "mauvais"} couleurActive="#dc2626"><ThumbDownAltOutlinedIcon style={{ fontSize: 17 }} /></Action>
          <Action titre="Relancer" onClick={() => onRelancer(m.question)}><RefreshIcon style={{ fontSize: 18 }} /></Action>
          <Action titre="Enseigner une règle métier" onClick={() => onEnseigner(m.question)}><LightbulbOutlinedIcon style={{ fontSize: 18, color: "#d97706" }} /></Action>
          {aDonnees && <Action titre="Plein écran" onClick={() => onPleinEcran(graphique)}><OpenInFullIcon style={{ fontSize: 16 }} /></Action>}
          <span style={{ flex: 1 }} />
          {m.idRequete && <code style={{ fontSize: 11.5, color: "#94a3b8" }}>Query ID: {m.idRequete}</code>}
        </div>
      )}
    </div>
  );
};

const Copilote = ({
  messages, enCours, question, setQuestion, champ, ecoute, transcription, onDicter, onPoser, onNouvelle, onRetour, perimetre,
  nbEpingles, nbRegles, onRegles, onHistorique, estEpingle, onEpingler, onType, onAvis, onEnseigner, onPleinEcran, accueil,
}) => {
  const bas = useRef(null);
  const [copie, copier] = useCopie();
  const derniere = [...messages].reverse().find((x) => x.role === "user")?.question;
  const dernierTexte = messages.length ? messages[messages.length - 1].texte : "";
  useEffect(() => { bas.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages.length, dernierTexte]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: 520, marginBottom: 24, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>
      {/* Barre du haut du copilote */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderBottom: "1px solid #e5e7eb", background: "#fff" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: DEGRADE, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><AutoAwesomeIcon style={{ fontSize: 18 }} /></div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Copilote Décisionnel</span>
          <span style={{ color: "#cbd5e1", margin: "0 8px" }}>·</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Analyse IA</span>
        </div>
        <BoutonHaut titre={`Voir mon tableau de bord (${nbEpingles})`} onClick={onRetour} nombre={nbEpingles}><DashboardOutlinedIcon style={{ fontSize: 19 }} /></BoutonHaut>
        <BoutonHaut titre={`Règles métier (${nbRegles})`} onClick={onRegles} nombre={nbRegles} couleurBadge="#f59e0b"><LightbulbOutlinedIcon style={{ fontSize: 19, color: "#d97706" }} /></BoutonHaut>
        <BoutonHaut titre="Historique des conversations" onClick={onHistorique}><HistoryIcon style={{ fontSize: 19 }} /></BoutonHaut>
        <BoutonHaut titre="Nouvelle session" onClick={onNouvelle}><EditNoteIcon style={{ fontSize: 20 }} /></BoutonHaut>
      </div>

      {/* Fil de la conversation (seule partie qui défile) */}
      <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 22 }}>
          {messages.length === 0 && accueil}
          {messages.map((m) => (m.role === "user" ? (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ maxWidth: "75%", background: DEGRADE, color: "#fff", borderRadius: "16px 4px 16px 16px", padding: "12px 18px", fontSize: 14.5, fontWeight: 600, lineHeight: 1.5 }}>{m.question}</div>
              <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                <Action titre={copie === m.id ? "Copié !" : "Copier"} onClick={() => copier(m.question, m.id)}>
                  {copie === m.id ? <CheckIcon style={{ fontSize: 15, color: "#16a34a" }} /> : <ContentCopyIcon style={{ fontSize: 15 }} />}
                </Action>
                <Action titre="Modifier" onClick={() => { setQuestion(m.question); setTimeout(() => champ.current?.focus(), 30); }}><EditOutlinedIcon style={{ fontSize: 15 }} /></Action>
              </div>
            </div>
          ) : (
            <Reponse key={m.id} m={m} epingle={estEpingle(m)} onEpingler={onEpingler} onType={onType} onAvis={onAvis}
              onRelancer={onPoser} onEnseigner={onEnseigner} onPleinEcran={onPleinEcran} copie={copie} copier={copier} />
          )))}
          <div ref={bas} />
        </div>
      </div>

      {/* Zone de question fixée en bas, avec les raccourcis */}
      <div style={{ borderTop: "1px solid #e5e7eb", background: "#f8fafc", padding: "12px 20px 18px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
            {RACCOURCIS.map((rc) => {
              const actif = derniere === rc.question;
              return (
                <button type="button" key={rc.libelle} onClick={() => onPoser(rc.question)} disabled={enCours}
                  style={{ background: actif ? "#e8f4fc" : "#fff", border: `1px solid ${actif ? "#99cde8" : "#e5e7eb"}`, borderRadius: 999, padding: "5px 14px",
                    fontSize: 13, fontWeight: actif ? 600 : 500, color: actif ? P : "#475569", cursor: enCours ? "default" : "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <rc.Icone style={{ fontSize: 15 }} />{rc.libelle}
                </button>
              );
            })}
            <span style={{ flex: 1 }} />
            {/* Périmètre réellement appliqué par le serveur aux questions (badge RLS de l'ancienne version) */}
            {perimetre && (perimetre.global ? (
              <Tooltip title="Vos questions portent sur les données de toute l'institution" arrow>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0" }}>
                  <PublicIcon style={{ fontSize: 14, color: "#059669" }} /> Périmètre : toute l'institution
                </span>
              </Tooltip>
            ) : (
              <Tooltip title="Les réponses sont limitées à votre périmètre : les chiffres des autres agences ne sont jamais donnés" arrow>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: "#e8f4fc", color: P, border: "1px solid #99cde8", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <VerifiedUserOutlinedIcon style={{ fontSize: 14 }} /> Périmètre : {perimetre.agences?.length ? perimetre.agences.join(", ") : "aucune agence"}
                </span>
              </Tooltip>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #cbd5e1", borderRadius: 14, padding: "6px 8px 6px 16px", background: "#fff" }}>
            <textarea ref={champ} value={question} onChange={(e) => setQuestion(e.target.value)} rows={1} maxLength={2000}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onPoser(); } }}
              placeholder="Posez une question décisionnelle sur vos réclamations (ex: évolution, motifs, délais, agences)..."
              className="browser-default"
              style={{ flex: 1, border: "none", outline: "none", resize: "none", fontSize: 14, fontFamily: "inherit", color: "#0F172A", padding: "8px 0", minHeight: 24 }} />
            {transcription && <span style={{ fontSize: 12, color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4 }}><CircularProgress size={12} /> Transcription…</span>}
            <Tooltip title={ecoute ? "Arrêter et transcrire" : "Dicter la question"} arrow>
              <button type="button" onClick={onDicter} disabled={transcription}
                style={{ background: ecoute ? "#fee2e2" : "none", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: ecoute ? "#dc2626" : "#64748b" }}><MicIcon /></button>
            </Tooltip>
            <button type="button" onClick={() => onPoser()} disabled={enCours || !question.trim()} aria-label="Envoyer"
              style={{ width: 38, height: 38, borderRadius: 10, border: "none", background: enCours || !question.trim() ? "#94a3b8" : P, color: "#fff",
                cursor: enCours ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {enCours ? <CircularProgress size={18} style={{ color: "#fff" }} /> : <ArrowUpwardIcon style={{ fontSize: 20 }} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Copilote;
