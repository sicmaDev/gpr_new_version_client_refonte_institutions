// Page « Reporting IA » (Rapports), sur l'architecture de l'ancienne version (AiReporting) :
// 1) Tableau de bord : graphiques épinglés (déplaçables, actualisables, plein écran, « Vider »), ou les 6 questions types ;
// 2) Copilote en pleine page : conversation avec l'IA (Wren), raisonnement en direct, carte graphique, règles, historique.
// Toutes les réponses viennent de l'API (aucune réponse d'exemple) ; style de la refonte.
import React, { useCallback, useEffect, useRef, useState } from "react";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import PushPinIcon from "@mui/icons-material/PushPin";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { iaDisponible, poserQuestionIa, rapportsIa, texteTranscription, transcrireAudio } from "../../apis/IA/IaApi";
import { notify } from "../../Utils/alert";
import { OutlineButton, PrimaryButton } from "../Sla/slaUi";
import Copilote from "./ia/Copilote";
import TableauDeBord, { QuestionsTypes } from "./ia/TableauDeBord";
import PleinEcran from "./ia/PleinEcran";
import { EnseignerRegle, VoletHistorique, VoletRegles, chargerRegles } from "./ia/Tiroirs";
import { DEGRADE, P } from "./ia/graphiques";

const nouvelId = () => (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
const VUE_MEMO = "gpr_reporting_ia_vue";

/** Résultat d'une requête SQL (actualisation d'un graphique épinglé) vers un tableau. */
const tableauDepuisSql = (r) => {
  const enregistrements = r?.records || r?.data || [];
  if (!Array.isArray(enregistrements) || !enregistrements.length) return null;
  const colonnes = (r.columns || []).map((c) => (typeof c === "string" ? c : c.name)).filter(Boolean);
  const cles = colonnes.length ? colonnes : Object.keys(enregistrements[0]);
  return { colonnes: cles, lignes: enregistrements.map((e) => cles.map((k) => (Array.isArray(e) ? e[cles.indexOf(k)] : e[k]) ?? "").map(String)) };
};

const premiereLigne = (texte) => (texte || "").replace(/\\n/g, "\n").split("\n").map((l) => l.trim())
  .find((l) => l && !l.startsWith("|") && !l.startsWith("#"));

const ReportingIA = () => {
  const [disponible, setDisponible] = useState(null);
  const [vue, setVueEtat] = useState(() => {
    try { return localStorage.getItem(VUE_MEMO) === "copilote" ? "copilote" : "tableau"; } catch (e) { return "tableau"; }
  });
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState({ id: null, threadId: null });
  const [epingles, setEpingles] = useState([]);
  const [nbRegles, setNbRegles] = useState(0);
  const [regles, setRegles] = useState(false);
  const [historique, setHistorique] = useState(false);
  const [aEnseigner, setAEnseigner] = useState(null);
  const [pleinEcran, setPleinEcran] = useState(null);
  const [viderOuvert, setViderOuvert] = useState(false);
  const [ecoute, setEcoute] = useState(false);
  const [transcription, setTranscription] = useState(false);
  const [perimetre, setPerimetre] = useState(null);
  const champ = useRef(null);
  const reconnaissance = useRef(null);
  const enCours = messages.some((m) => m.enCours);

  const setVue = (v) => {
    setVueEtat(v);
    try { localStorage.setItem(VUE_MEMO, v); } catch (e) { /* mémoire du navigateur indisponible */ }
  };
  const compterRegles = useCallback(() => chargerRegles().then((r) => setNbRegles(r.perso.length + r.globales.length)), []);

  useEffect(() => {
    iaDisponible().then(setDisponible);
    rapportsIa.epingles().then((l) => setEpingles(Array.isArray(l) ? l : [])).catch(() => setEpingles([]));
    compterRegles();
    rapportsIa.perimetre().then(setPerimetre).catch(() => setPerimetre(null));
  }, [compterRegles]);

  const ouvrirCopilote = () => { setVue("copilote"); setTimeout(() => champ.current?.focus(), 60); };

  const sauverConversation = (liste, conv) => {
    const premiere = liste.find((m) => m.role === "user");
    rapportsIa.enregistrerConversation({
      conversationId: conv.id, threadId: conv.threadId,
      title: (premiere?.question || "Conversation").slice(0, 200),
      messages: liste.filter((m) => !m.enCours),
    }).catch(() => null);
  };

  const majMessage = (id, champs, sauver) => setMessages((l) => {
    const liste = l.map((m) => (m.id === id ? { ...m, ...champs } : m));
    if (sauver) sauverConversation(liste, conversation);
    return liste;
  });

  const poser = async (q) => {
    const texte = (q ?? question).trim();
    if (!texte || enCours) return;
    setQuestion("");
    setVue("copilote");
    const conv = conversation.id ? conversation : { id: nouvelId(), threadId: null };
    const idReponse = nouvelId();
    setMessages((l) => [...l, { id: nouvelId(), role: "user", question: texte },
      { id: idReponse, role: "assistant", question: texte, enCours: true, texte: "", tables: [], reflexion: "", sql: null }]);
    const maj = (champs) => setMessages((l) => l.map((m) => (m.id === idReponse ? { ...m, ...champs } : m)));
    // Raisonnement affiché en direct, au fil de ce que l'IA renvoie.
    const r = await poserQuestionIa(texte, conv.threadId, {
      surEtape: (e) => maj({ etape: e }),
      surTables: (t) => maj({ tables: t }),
      surReflexion: (x) => maj({ reflexion: x }),
      surSql: (s) => maj({ sql: s }),
      surTexte: (t) => maj({ texte: t }),
    });
    const fin = { enCours: false, texte: r.texte, tables: r.tables, reflexion: r.reflexion, sql: r.sql, duree: r.duree, idRequete: r.traceId, erreur: r.ok ? null : r.erreur };
    if (r.ok && !r.texte) fin.erreur = "L'IA n'a pas pu répondre à cette question. Essayez de la reformuler.";
    const nouvelleConv = { id: conv.id, threadId: r.threadId || conv.threadId };
    setConversation(nouvelleConv);
    setMessages((l) => {
      const liste = l.map((m) => (m.id === idReponse ? { ...m, ...fin } : m));
      if (r.ok) sauverConversation(liste, nouvelleConv);
      return liste;
    });
  };

  const estEpingle = (m) => !!m.epingle || epingles.some((w) => w.title === m.question.slice(0, 250));

  const epingler = async (m, { serie, tableau, type }) => {
    const resume = premiereLigne(m.texte);
    try {
      const w = await rapportsIa.epingler({
        title: m.question.slice(0, 250),
        description: m.question,
        chartType: serie.length >= 2 ? type : "table",
        sqlQuery: m.sql || null,
        data: { serie, tableau },
        summary: resume ? resume.replace(/\*\*/g, "").slice(0, 500) : null,
        displayOrder: epingles.length,
      });
      setEpingles((l) => [...l, w]);
      majMessage(m.id, { epingle: true }, true);
      notify("Graphique épinglé à votre tableau de bord", "success");
    } catch (e) {
      notify("Le graphique n'a pas pu être épinglé", "error");
    }
  };

  const retirer = async (w) => {
    await rapportsIa.desepingler(w.id).catch(() => null);
    setEpingles((l) => l.filter((x) => x.id !== w.id));
  };

  const vider = async () => {
    const liste = epingles;
    setViderOuvert(false);
    await Promise.all(liste.map((w) => rapportsIa.desepingler(w.id).catch(() => null)));
    setEpingles([]);
    notify("Tableau de bord vidé", "success");
  };

  const mettreAJour = async (w, champs) => {
    const nouveau = { ...w, ...champs };
    setEpingles((l) => l.map((x) => (x.id === w.id ? nouveau : x)));
    try {
      const enregistre = await rapportsIa.epingler(nouveau);
      setEpingles((l) => l.map((x) => (x.id === w.id ? enregistre : x)));
    } catch (e) {
      notify("La modification n'a pas pu être enregistrée", "error");
    }
  };

  const reordonner = (liste) => {
    setEpingles(liste);
    rapportsIa.ordre(liste.map((w) => w.id)).catch(() => notify("Le nouvel ordre n'a pas pu être enregistré", "error"));
  };

  const actualiser = async (w) => {
    try {
      const r = await rapportsIa.actualiser(w.id);
      const tableau = tableauDepuisSql(r);
      if (!tableau) { notify("Aucune donnée renvoyée", "warning"); return; }
      const iValeur = tableau.colonnes.findIndex((_, i) => i > 0 && tableau.lignes.every((l) => !Number.isNaN(parseFloat(l[i]))));
      const serie = iValeur > 0 ? tableau.lignes.map((l) => ({ libelle: l[0], valeur: parseFloat(l[iValeur]) })) : [];
      const majW = await rapportsIa.epingler({ ...w, data: { ...(w.data || {}), serie, tableau, actualiseLe: new Date().toISOString() } });
      setEpingles((l) => l.map((x) => (x.id === w.id ? majW : x)));
    } catch (e) {
      notify(e.response?.data?.content?.message || "Actualisation impossible", "error");
    }
  };

  const ouvrirConversation = async (c) => {
    setHistorique(false);
    const complete = await rapportsIa.conversation(c.conversationId).catch(() => c);
    setConversation({ id: c.conversationId, threadId: complete?.threadId || null });
    setMessages(Array.isArray(complete?.messages) ? complete.messages : []);
    setVue("copilote");
  };

  const nouvelle = () => { setMessages([]); setConversation({ id: null, threadId: null }); setQuestion(""); setTimeout(() => champ.current?.focus(), 50); };

  // Dictée (comme l'ancienne version) : l'audio est transcrit par l'IA (vocabulaire bancaire) ;
  // si le micro ou l'IA ne sont pas disponibles, la reconnaissance vocale du navigateur prend le relais.
  const enregistreur = useRef(null);
  const dicteeNavigateur = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { notify("La dictée n'est pas disponible dans ce navigateur", "warning"); return; }
    const r = new SR();
    r.lang = "fr-FR";
    r.interimResults = false;
    r.onresult = (e) => setQuestion((q) => `${q} ${e.results[0][0].transcript}`.trim());
    r.onend = () => setEcoute(false);
    reconnaissance.current = r;
    setEcoute(true);
    r.start();
  };
  const dicter = async () => {
    if (ecoute) {
      if (enregistreur.current && enregistreur.current.state !== "inactive") enregistreur.current.stop();
      else reconnaissance.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === "undefined") { dicteeNavigateur(); return; }
    let flux;
    try {
      flux = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      notify("Micro inaccessible : autorisez le micro dans le navigateur", "warning");
      return;
    }
    const morceaux = [];
    const rec = new window.MediaRecorder(flux);
    enregistreur.current = rec;
    rec.ondataavailable = (e) => { if (e.data && e.data.size) morceaux.push(e.data); };
    rec.onstop = async () => {
      flux.getTracks().forEach((piste) => piste.stop());
      setEcoute(false);
      const blob = new Blob(morceaux, { type: rec.mimeType || "audio/webm" });
      if (!blob.size) return;
      setTranscription(true);
      try {
        const extension = (rec.mimeType || "").includes("ogg") ? "ogg" : "webm";
        const texte = texteTranscription(await transcrireAudio(blob, `dictee.${extension}`)).trim();
        if (texte) setQuestion((q) => `${q} ${texte}`.trim());
        else notify("Aucune parole reconnue", "warning");
      } catch (e) {
        notify("La transcription par l'IA n'a pas abouti : dictée du navigateur", "warning");
        dicteeNavigateur();
      } finally {
        setTranscription(false);
        setTimeout(() => champ.current?.focus(), 30);
      }
    };
    rec.start();
    setEcoute(true);
  };

  if (disponible === false) {
    return (
      <div style={{ padding: "28px clamp(16px, 4vw, 48px)", maxWidth: 1300, margin: "0 auto" }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Reporting Décisionnel IA</Typography>
        <div style={{ marginTop: 12, padding: 16, background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 10, color: "#9a3412" }}>
          L'IA n'est pas configurée sur ce serveur. Contactez l'administrateur.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: vue === "tableau" ? "28px clamp(16px, 4vw, 48px)" : "16px clamp(12px, 2vw, 28px)", maxWidth: vue === "tableau" ? 1300 : 1400, margin: "0 auto" }}>
      {/* VUE 1 : TABLEAU DE BORD */}
      {vue === "tableau" && (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap", paddingBottom: 16, marginBottom: 20, borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>Reporting Décisionnel IA</Typography>
                <span style={{ background: "#e8f4fc", color: P, border: "1px solid #99cde8", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>GPR GenBI v2</span>
              </div>
              <Typography sx={{ fontSize: 13, color: "#94a3b8", mt: 0.3 }}>Tableau de bord dynamique - Épinglez des graphiques depuis le copilote conversationnel.</Typography>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 14px", fontSize: 13.5, fontWeight: 600, color: "#334155", background: "#fff" }}>
              <PushPinIcon style={{ fontSize: 17, color: P }} /> {epingles.length} indicateur(s) épinglé(s)
            </span>
            {epingles.length > 0 && (
              <OutlineButton startIcon={<DeleteSweepOutlinedIcon />} onClick={() => setViderOuvert(true)} sx={{ textTransform: "none", borderRadius: 2, color: "#b91c1c", borderColor: "#fecaca", fontWeight: 600, px: 2 }}>
                Vider
              </OutlineButton>
            )}
            <PrimaryButton startIcon={<AutoAwesomeIcon />} onClick={ouvrirCopilote}>Poser une question</PrimaryButton>
          </div>

          <TableauDeBord epingles={epingles} onRetirer={retirer} onActualiser={actualiser} onPleinEcran={setPleinEcran}
            onReordonner={reordonner} onMettreAJour={mettreAJour} onChoisirQuestion={poser} enCours={enCours} />

          {/* Bouton flottant : ouvre le copilote */}
          <button type="button" aria-label="Demander à l'IA" title="Demander à l'IA" onClick={ouvrirCopilote}
            style={{ position: "fixed", bottom: 90, right: 40, width: 52, height: 52, borderRadius: "50%", border: "none", background: DEGRADE, color: "#fff",
              cursor: "pointer", boxShadow: "0 6px 16px rgba(0,80,129,.35)", zIndex: 40, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <AutoAwesomeIcon />
          </button>
        </>
      )}

      {/* VUE 2 : COPILOTE EN PLEINE PAGE */}
      {vue === "copilote" && (
        <Copilote
          messages={messages} enCours={enCours} question={question} setQuestion={setQuestion} champ={champ}
          ecoute={ecoute} transcription={transcription} perimetre={perimetre} onDicter={dicter} onPoser={poser} onNouvelle={nouvelle} onRetour={() => setVue("tableau")}
          nbEpingles={epingles.length} nbRegles={nbRegles} onRegles={() => setRegles(true)} onHistorique={() => setHistorique(true)}
          estEpingle={estEpingle} onEpingler={epingler}
          onType={(m, t) => majMessage(m.id, { typeGraphique: t })}
          onAvis={(m, avis) => majMessage(m.id, { avis }, true)}
          onEnseigner={(q) => setAEnseigner(q)} onPleinEcran={setPleinEcran}
          accueil={<QuestionsTypes onChoisir={poser} desactive={enCours} />}
        />
      )}

      <PleinEcran g={pleinEcran} onFermer={() => setPleinEcran(null)} />
      <VoletRegles ouvert={regles} onFermer={() => setRegles(false)} onChange={setNbRegles} />
      <VoletHistorique ouvert={historique} onFermer={() => setHistorique(false)} onOuvrir={ouvrirConversation} conversationActive={conversation.id}
        onToutEfface={() => { setMessages([]); setConversation({ id: null, threadId: null }); }} />
      <EnseignerRegle question={aEnseigner} onFermer={() => setAEnseigner(null)} onEnregistree={compterRegles} />

      {/* Confirmation avant de vider le tableau de bord */}
      <Dialog open={viderOuvert} onClose={() => setViderOuvert(false)} maxWidth="xs" fullWidth PaperProps={{ style: { borderRadius: 16 } }}>
        <div style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: "#FEE2E2", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <WarningAmberIcon style={{ color: "#B91C1C", fontSize: 20 }} />
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Vider le tableau de bord ?</span>
          </div>
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
            Cette action détachera l'ensemble de vos {epingles.length} indicateurs épinglés. Vous pourrez à tout moment ré-interroger l'IA pour composer un nouveau tableau de bord.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <OutlineButton onClick={() => setViderOuvert(false)}>Annuler</OutlineButton>
            <PrimaryButton onClick={vider} startIcon={<DeleteSweepOutlinedIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, px: 3, background: "#dc2626", "&:hover": { background: "#b91c1c" } }}>
              Confirmer et vider
            </PrimaryButton>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ReportingIA;
