// Volets latéraux du copilote, repris de l'ancienne version (InstructionDrawer, InstructionModal, InstructionDeleteDialog) :
// « Règles Métier » (onglets Toutes / Globales / Perso, cartes modifiables), fenêtre de création / modification d'une règle,
// confirmation de suppression, et historique des conversations. Style de la refonte.
import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PublicIcon from "@mui/icons-material/Public";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import GppMaybeOutlinedIcon from "@mui/icons-material/GppMaybeOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CheckIcon from "@mui/icons-material/Check";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { rapportsIa } from "../../../apis/IA/IaApi";
import { loadItemFromSessionStorage } from "../../../Utils/utils";
import { notify } from "../../../Utils/alert";
import { OutlineButton, PrimaryButton } from "../../Sla/slaUi";
import { DEGRADE, P } from "./graphiques";

export const MAX_REGLES_PERSO = 10;
export const MAX_CARACTERES_REGLE = 200;
const AMBRE = "#d97706";
const INDIGO = "#4f46e5";

export const estAdmin = () => {
  try {
    return String(loadItemFromSessionStorage("app-user")?.posteDto?.habilitations || "").split(",").map((h) => h.trim()).includes("H12");
  } catch (e) {
    return false;
  }
};

const QUERY_REGLES = "query GetInstructions { instructions { id instruction questions isDefault createdAt updatedAt } }";
const listeQuestions = (q) => {
  if (Array.isArray(q)) return q;
  if (!q) return [];
  try { const l = JSON.parse(q); return Array.isArray(l) ? l : []; } catch (e) { return []; }
};

/** Règles personnelles (base GPR) et règles de l'institution (IA). */
export const chargerRegles = async () => {
  const [perso, globales] = await Promise.all([
    rapportsIa.regles().then((l) => (Array.isArray(l) ? l : [])).catch(() => []),
    rapportsIa.reglesGlobales(QUERY_REGLES).then((r) => r?.data?.instructions || []).catch(() => []),
  ]);
  return { perso, globales };
};

/** Crée ou met à jour une règle (personnelle, ou pour toute l'institution si H12). */
const enregistrerRegle = async ({ id, texte, questions = [], globale }) => {
  if (globale) {
    const r = id
      ? await rapportsIa.reglesGlobales(
        "mutation UpdateInstruction($where: InstructionWhereInput!, $data: UpdateInstructionInput!) { updateInstruction(where: $where, data: $data) { id } }",
        { where: { id: parseInt(id, 10) }, data: { instruction: texte, questions, isDefault: questions.length === 0 } })
      : await rapportsIa.reglesGlobales(
        "mutation CreateInstruction($data: CreateInstructionInput!) { createInstruction(data: $data) { id } }",
        { data: { instruction: texte, questions, isDefault: questions.length === 0 } });
    if (r?.errors?.length) throw new Error(r.errors[0].message);
  } else {
    await rapportsIa.enregistrerRegle({ ...(id ? { id } : {}), instruction: texte, questions, isActive: true });
  }
};

const supprimerRegle = async (regle) => {
  if (regle.perso) {
    await rapportsIa.supprimerRegle(regle.id);
  } else {
    const r = await rapportsIa.reglesGlobales("mutation DeleteInstruction($where: InstructionWhereInput!) { deleteInstruction(where: $where) }",
      { where: { id: parseInt(regle.id, 10) } });
    if (r?.errors?.length) throw new Error(r.errors[0].message);
  }
};

const dateCourte = (d) => {
  if (!d) return "Date inconnue";
  const x = /^\d+$/.test(String(d)) ? new Date(Number(d)) : new Date(d);
  return Number.isNaN(x.getTime()) ? String(d) : x.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

const message = (e, defaut) => e?.response?.data?.content?.message || e?.response?.data?.message || e?.message || defaut;

// ── Règles Métier ────────────────────────────────────────────────────────────────────────────────

const Onglet = ({ actif, couleur, onClick, children }) => (
  <button type="button" onClick={onClick}
    style={{ border: "none", borderRadius: 8, padding: "5px 11px", margin: 0, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "inherit",
      background: actif ? couleur : "transparent", color: actif ? "#fff" : "#475569" }}>
    {children}
  </button>
);

const Pastille = ({ globale }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: globale ? P : "#e8f4fc", color: globale ? "#fff" : P, border: `1px solid ${globale ? P : "#99cde8"}` }}>
    {globale ? <PublicIcon style={{ fontSize: 13 }} /> : <PersonOutlineIcon style={{ fontSize: 13 }} />}
    {globale ? "Globale (Banque)" : "Individuelle"}
  </span>
);

const BoutonCarte = ({ titre, onClick, danger, children }) => (
  <Tooltip title={titre} arrow>
    <button type="button" onClick={onClick} aria-label={titre}
      style={{ width: 28, height: 28, padding: 0, margin: 0, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: danger ? "#b91c1c" : P }}>
      {children}
    </button>
  </Tooltip>
);

export const VoletRegles = ({ ouvert, onFermer, onChange }) => {
  const [regles, setRegles] = useState({ perso: [], globales: [] });
  const [chargement, setChargement] = useState(false);
  const [filtre, setFiltre] = useState("toutes");
  const [edition, setEdition] = useState(null); // {} = nouvelle règle, sinon la règle à modifier
  const [aSupprimer, setASupprimer] = useState(null);
  const admin = estAdmin();

  const charger = () => {
    setChargement(true);
    return chargerRegles().then((r) => { setRegles(r); onChange?.(r.perso.length + r.globales.length); }).finally(() => setChargement(false));
  };
  useEffect(() => { if (ouvert) charger(); }, [ouvert]); // eslint-disable-line react-hooks/exhaustive-deps

  const nbPerso = regles.perso.length;
  const nbGlobales = regles.globales.length;
  const quotaAtteint = nbPerso >= MAX_REGLES_PERSO;
  const peutAjouter = admin || !quotaAtteint;
  const toutes = [
    ...regles.perso.map((r) => ({ ...r, perso: true, questions: listeQuestions(r.questions) })),
    ...regles.globales.map((r) => ({ ...r, perso: false, questions: listeQuestions(r.questions) })),
  ];
  const affichees = toutes.filter((r) => (filtre === "globales" ? !r.perso : filtre === "perso" ? r.perso : true));

  return (
    <>
      <Drawer anchor="right" open={ouvert} onClose={onFermer} sx={{ zIndex: 2000 }} PaperProps={{ style: { width: 448, maxWidth: "100vw", display: "flex", flexDirection: "column" } }}>
        {/* En-tête */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", background: DEGRADE }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
            <LightbulbOutlinedIcon style={{ color: "#fff", fontSize: 20 }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Règles Métier</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{nbPerso + nbGlobales} règle(s) active(s)</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)" }}>Interprétation sémantique de l'IA</div>
          </div>
          <Tooltip title={peutAjouter ? "Ajouter une nouvelle consigne" : `Limite de ${MAX_REGLES_PERSO} règles personnelles atteinte.`} arrow>
            <span>
              <button type="button" disabled={!peutAjouter} onClick={() => setEdition({})}
                style={{ border: "none", borderRadius: 8, padding: "6px 12px", margin: 0, fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "inherit",
                  background: peutAjouter ? "#fff" : "rgba(255,255,255,0.25)", color: peutAjouter ? P : "rgba(255,255,255,0.7)", cursor: peutAjouter ? "pointer" : "not-allowed" }}>
                <AddIcon style={{ fontSize: 16 }} /> Règle
              </button>
            </span>
          </Tooltip>
          <IconButton size="small" onClick={onFermer} aria-label="Fermer" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
        </div>

        {/* Onglets et habilitation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, padding: "10px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <div style={{ display: "inline-flex", gap: 2, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 3 }}>
            <Onglet actif={filtre === "toutes"} couleur={P} onClick={() => setFiltre("toutes")}>Toutes ({nbPerso + nbGlobales})</Onglet>
            <Onglet actif={filtre === "globales"} couleur={P} onClick={() => setFiltre("globales")}><PublicIcon style={{ fontSize: 13 }} /> Globales ({nbGlobales})</Onglet>
            <Onglet actif={filtre === "perso"} couleur={P} onClick={() => setFiltre("perso")}><PersonOutlineIcon style={{ fontSize: 13 }} /> Perso ({nbPerso}/{MAX_REGLES_PERSO})</Onglet>
          </div>
          {admin ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#047857", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 6, padding: "2px 8px" }}>
              <VerifiedUserOutlinedIcon style={{ fontSize: 13 }} /> Habilité H12 (Admin Règles)
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b", background: "#f1f5f9", borderRadius: 6, padding: "2px 8px" }}>
              <GppMaybeOutlinedIcon style={{ fontSize: 13 }} /> Consultation globale (H11)
            </span>
          )}
        </div>

        {/* Garantie sur les règles personnelles */}
        <div style={{ margin: "12px 20px 0", padding: "9px 12px", borderRadius: 10, background: "#e8f4fc", border: "1px solid #bfdcef", fontSize: 11.5, color: "var(--gpr-primary-dark, #003d62)", display: "flex", alignItems: "center", gap: 8 }}>
          <VerifiedUserOutlinedIcon style={{ fontSize: 16, color: P }} />
          <span style={{ flex: 1 }}><b>Garantie IA :</b> Vos règles personnelles ({nbPerso}/{MAX_REGLES_PERSO}) sont injectées sans impacter les autres utilisateurs.</span>
          {quotaAtteint && <span style={{ fontSize: 10, fontWeight: 700, color: "#b45309", background: "#fef3c7", borderRadius: 20, padding: "2px 8px" }}>Plein ({MAX_REGLES_PERSO}/{MAX_REGLES_PERSO})</span>}
        </div>

        {/* Cartes des règles */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          {chargement ? (
            <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8", fontSize: 12.5 }}>
              <CircularProgress size={24} style={{ color: P }} /><div style={{ marginTop: 10 }}>Chargement des consignes métier...</div>
            </div>
          ) : affichees.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <LightbulbOutlinedIcon style={{ fontSize: 32, color: "#cbd5e1" }} />
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", marginTop: 6 }}>
                {filtre === "perso" ? "Aucune règle individuelle enregistrée." : filtre === "globales" ? "Aucune règle globale trouvée." : "Aucune règle métier trouvée."}
              </div>
              <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>Cliquez sur « + Règle » pour enseigner une consigne au copilote.</div>
            </div>
          ) : affichees.map((r) => {
            const modifiable = r.perso || admin;
            return (
              <div key={`${r.perso ? "perso" : "globale"}_${r.id}`} style={{ border: "1px solid #e5e7eb", borderLeft: `3px solid ${r.perso ? "#99cde8" : P}`, borderRadius: 12, padding: 14, marginBottom: 12, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Pastille globale={!r.perso} />
                  <span style={{ fontSize: 11, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <ScheduleIcon style={{ fontSize: 12 }} /> {dateCourte(r.updatedAt || r.createdAt)}
                  </span>
                  <span style={{ flex: 1 }} />
                  {modifiable ? (
                    <>
                      <BoutonCarte titre="Modifier la consigne" onClick={() => setEdition(r)}><EditOutlinedIcon style={{ fontSize: 15 }} /></BoutonCarte>
                      <BoutonCarte titre="Supprimer la consigne" onClick={() => setASupprimer(r)} danger><DeleteOutlineIcon style={{ fontSize: 16 }} /></BoutonCarte>
                    </>
                  ) : (
                    <Tooltip title="Seuls les profils H12 peuvent modifier cette règle globale" arrow>
                      <span style={{ fontSize: 10.5, color: "#94a3b8", fontStyle: "italic", background: "#f8fafc", borderRadius: 4, padding: "2px 8px" }}>Lecture seule</span>
                    </Tooltip>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: "#1e293b", whiteSpace: "pre-wrap", lineHeight: 1.6, background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 10, padding: "10px 12px" }}>
                  {r.instruction}
                </div>
                {r.questions.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: 0.5, marginBottom: 4 }}>QUESTIONS ASSOCIÉES :</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {r.questions.map((q, i) => <span key={i} style={{ fontSize: 11, color: P, background: "#f0f7fc", border: "1px solid #cfe5f3", borderRadius: 8, padding: "2px 8px" }}>« {q} »</span>)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pied */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", borderTop: "1px solid #e5e7eb", background: "#f8fafc", fontSize: 12, color: "#64748b" }}>
          <AutoAwesomeIcon style={{ fontSize: 15, color: P }} />
          <span style={{ flex: 1 }}>Moteur sémantique vectoriel</span>
          <OutlineButton onClick={onFermer}>Fermer</OutlineButton>
        </div>
      </Drawer>

      <FenetreRegle ouvert={edition !== null} regle={edition && edition.id ? edition : null} nbPerso={nbPerso}
        onFermer={() => setEdition(null)} onEnregistree={charger} />
      <ConfirmerSuppression regle={aSupprimer} onFermer={() => setASupprimer(null)} onSupprimee={charger} />
    </>
  );
};

// ── Fenêtre de création / modification d'une règle (InstructionModal) ─────────────────────────────

/**
 * question : question de la conversation à laquelle la règle est liée (bouton « Enseigner une règle »), sinon vide.
 * regle : règle à modifier, sinon création.
 */
export const FenetreRegle = ({ ouvert, onFermer, onEnregistree, question = "", regle = null, nbPerso }) => {
  const admin = estAdmin();
  const modification = !!regle?.id;
  const [texte, setTexte] = useState("");
  const [portee, setPortee] = useState("perso");
  const [envoi, setEnvoi] = useState(false);
  const [reussi, setReussi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [compte, setCompte] = useState(nbPerso ?? 0);

  useEffect(() => {
    if (!ouvert) return;
    setTexte(regle?.instruction || "");
    setPortee(regle ? (regle.perso ? "perso" : "globale") : (admin ? "globale" : "perso"));
    setErreur(""); setReussi(false); setEnvoi(false);
    if (nbPerso == null) rapportsIa.regles().then((l) => setCompte(Array.isArray(l) ? l.length : 0)).catch(() => setCompte(0));
    else setCompte(nbPerso);
  }, [ouvert]); // eslint-disable-line react-hooks/exhaustive-deps

  const quotaAtteint = !modification && portee === "perso" && compte >= MAX_REGLES_PERSO;

  const enregistrer = async () => {
    if (!texte.trim()) { setErreur("Veuillez saisir une consigne métier."); return; }
    setErreur(""); setEnvoi(true);
    try {
      await enregistrerRegle({
        id: regle?.id, texte: texte.trim(), globale: portee === "globale",
        questions: question ? [question] : (regle?.questions || []),
      });
      setReussi(true);
      onEnregistree?.();
      setTimeout(() => { setReussi(false); onFermer(); }, 1200);
    } catch (e) {
      setErreur(message(e, "Échec de l'enregistrement de la consigne métier."));
    } finally {
      setEnvoi(false);
    }
  };

  // Option dessinée (pas de bouton radio natif : les styles généraux du site le déforment).
  // Rendu identique à InstructionModal de l'ancienne version (fenêtre compacte, cartes sans rond, bouton ambre).
  const Option = ({ valeur, Icone, couleur, fond, titre, aide, desactive }) => {
    const choisi = portee === valeur;
    return (
      <div role="radio" aria-checked={choisi} aria-disabled={desactive} tabIndex={desactive ? -1 : 0}
        onClick={() => !desactive && setPortee(valeur)}
        onKeyDown={(e) => { if (!desactive && (e.key === " " || e.key === "Enter")) { e.preventDefault(); setPortee(valeur); } }}
        style={{ display: "flex", alignItems: "flex-start", padding: 10, borderRadius: 12, minWidth: 0, boxSizing: "border-box", transition: "all .15s",
          cursor: desactive ? "not-allowed" : "pointer", opacity: desactive ? 0.6 : 1,
          border: `1px solid ${desactive ? "#f1f5f9" : choisi ? couleur : "#e2e8f0"}`,
          background: desactive ? "#f8fafc" : choisi ? fond : "#fff",
          boxShadow: choisi && !desactive ? "0 1px 2px rgba(15,23,42,.05)" : "none" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
            <Icone style={{ fontSize: 14, color: couleur }} /> <span>{titre}</span>
          </div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, lineHeight: 1.4 }}>{aide}</div>
        </div>
      </div>
    );
  };

  const btn = { borderRadius: 12, fontSize: 12, padding: "6px 14px", margin: 0, cursor: "pointer", fontFamily: "inherit", lineHeight: 1.5 };
  const desactiveBouton = envoi || reussi || !texte.trim() || quotaAtteint;

  return (
    <Dialog open={ouvert} onClose={() => !envoi && onFermer()} fullWidth maxWidth={false} sx={{ zIndex: 2100 }}
      slotProps={{ backdrop: { style: { background: "rgba(0,0,0,.4)", backdropFilter: "blur(2px)" } } }}
      PaperProps={{ style: { width: "100%", maxWidth: 512, margin: 16, borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)" } }}>
      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(90deg, rgba(255,251,235,.6) 0%, #fff 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 12, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.2)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            {modification ? <EditOutlinedIcon style={{ color: AMBRE, fontSize: 16 }} /> : <LightbulbOutlinedIcon style={{ color: "#f59e0b", fontSize: 16 }} />}
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{modification ? "Modifier la règle métier" : "Enseigner une règle métier (No-SQL)"}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{modification ? "Mise à jour des consignes d'interprétation Text-to-SQL" : "Alimente la mémoire décisionnelle vectorisée de l'IA"}</div>
          </div>
        </div>
        <button type="button" onClick={onFermer} disabled={envoi} title="Fermer" aria-label="Fermer la modale"
          style={{ padding: 4, margin: 0, borderRadius: 8, border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "inline-flex" }}>
          <CloseIcon style={{ fontSize: 16 }} />
        </button>
      </div>

      {/* Contenu */}
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Portée d'application de la règle :</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            <Option valeur="perso" Icone={PersonOutlineIcon} couleur={INDIGO} fond="rgba(238,242,255,.5)" titre="Individuelle" desactive={quotaAtteint}
              aide={quotaAtteint ? `Quota atteint (${compte}/${MAX_REGLES_PERSO} max).` : "Active pour vos analyses uniquement."} />
            <Option valeur="globale" Icone={PublicIcon} couleur="#2563eb" fond="rgba(239,246,255,.5)" titre="Globale" desactive={!admin}
              aide={admin ? "Active pour toute la banque (Wren AI)." : "Requiert l'habilitation H12 (Config)."} />
          </div>
          {!admin && portee === "perso" && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#b45309", marginTop: 4 }}>
              <GppMaybeOutlinedIcon style={{ fontSize: 12, color: AMBRE }} /> <span>Seuls les configurateurs (H12 / Pilotes) peuvent publier des règles globales.</span>
            </div>
          )}
        </div>

        {question && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: 10, borderRadius: 8, background: "#f8fafc", border: "1px solid #f1f5f9", fontSize: 12, color: "#475569" }}>
            <MenuBookOutlinedIcon style={{ fontSize: 14, color: "#94a3b8", marginTop: 2, flex: "0 0 auto" }} />
            <div><span style={{ fontWeight: 600, color: "#334155" }}>Contexte :</span> « <i>{question}</i> »</div>
          </div>
        )}

        <div>
          <label htmlFor="instructionInput" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Formuler votre règle en langage naturel (français) :</label>
          <textarea id="instructionInput" rows={4} maxLength={MAX_CARACTERES_REGLE} value={texte}
            onChange={(e) => { setTexte(e.target.value); if (erreur) setErreur(""); }}
            disabled={envoi || reussi} autoFocus className="browser-default"
            placeholder="Ex: Les réclamations de type CARTE avec contestation de montant supérieur à 100 000 FCFA doivent être considérées comme prioritaires..."
            style={{ display: "block", width: "100%", height: 92, minHeight: 92, margin: 0, fontSize: 12, padding: 12, borderRadius: 12, border: "1px solid #e2e8f0",
              outline: "none", color: "#1e293b", resize: "none", lineHeight: 1.625, fontFamily: "inherit", boxSizing: "border-box", background: "#fff" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#94a3b8", marginTop: 4, padding: "0 4px" }}>
            <span>{texte.length} / {MAX_CARACTERES_REGLE} caractères</span>
            {texte.length >= MAX_CARACTERES_REGLE && <span style={{ color: AMBRE, fontWeight: 600 }}>Taille maximale atteinte (200 car.)</span>}
          </div>
        </div>

        {erreur && <div style={{ padding: 10, borderRadius: 8, background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", fontSize: 12 }}>{erreur}</div>}
        {reussi && (
          <div style={{ padding: 10, borderRadius: 8, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckIcon style={{ fontSize: 16, color: "#059669" }} /> <span>{modification ? "Règle métier mise à jour avec succès !" : "Règle métier mémorisée avec succès !"}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
          <button type="button" onClick={onFermer} disabled={envoi}
            style={{ ...btn, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a" }}>Annuler</button>
          <button type="button" onClick={enregistrer} disabled={desactiveBouton}
            style={{ ...btn, border: "none", background: AMBRE, color: "#fff", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px",
              boxShadow: "0 1px 2px rgba(0,0,0,.05)", opacity: desactiveBouton ? 0.5 : 1, cursor: desactiveBouton ? "default" : "pointer" }}>
            {envoi ? <span>Enregistrement en cours...</span>
              : reussi ? <><CheckIcon style={{ fontSize: 14 }} /><span>Enregistré</span></>
              : <><LightbulbOutlinedIcon style={{ fontSize: 14 }} /><span>{modification ? "Mettre à jour la règle" : "Enregistrer la consigne"}</span></>}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

/** Bouton « Enseigner une règle métier » sous une réponse : la règle est liée à la question posée. */
export const EnseignerRegle = ({ question, onFermer, onEnregistree }) => (
  <FenetreRegle ouvert={question != null} question={question || ""} onFermer={onFermer} onEnregistree={onEnregistree} />
);

// ── Confirmation de suppression (InstructionDeleteDialog) ──────────────────────────────────────────

const ConfirmerSuppression = ({ regle, onFermer, onSupprimee }) => {
  const [envoi, setEnvoi] = useState(false);
  const supprimer = async () => {
    setEnvoi(true);
    try {
      await supprimerRegle(regle);
      notify("Règle supprimée", "success");
      onSupprimee?.();
      onFermer();
    } catch (e) {
      notify(message(e, "La règle n'a pas pu être supprimée"), "error");
    } finally {
      setEnvoi(false);
    }
  };
  return (
    <Dialog open={!!regle} onClose={() => !envoi && onFermer()} maxWidth="xs" fullWidth sx={{ zIndex: 2100 }} PaperProps={{ style: { borderRadius: 16 } }}>
      <div style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "#FEE2E2", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <WarningAmberIcon style={{ color: "#B91C1C", fontSize: 20 }} />
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Supprimer cette règle métier ?</span>
        </div>
        {regle && (
          <div style={{ fontSize: 12.5, color: "#475569", background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 8, padding: "8px 10px", margin: "8px 0" }}>
            {regle.instruction}
          </div>
        )}
        <div style={{ fontSize: 12.5, color: "#64748b" }}>
          {regle && !regle.perso ? "Cette règle s'applique à toute la banque : elle ne sera plus prise en compte par l'IA pour personne." : "L'IA ne tiendra plus compte de cette consigne dans vos analyses."}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <OutlineButton onClick={onFermer} disabled={envoi}>Annuler</OutlineButton>
          <PrimaryButton onClick={supprimer} disabled={envoi} startIcon={<DeleteOutlineIcon />}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, px: 3, background: "#dc2626", "&:hover": { background: "#b91c1c" } }}>
            {envoi ? "Suppression..." : "Supprimer"}
          </PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
};

// ── Historique des conversations ───────────────────────────────────────────────────────────────

const EnTete = ({ Icone, titre, sousTitre, onFermer }) => (
  <div style={{ background: DEGRADE, padding: "18px 22px", display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icone style={{ color: "#fff", fontSize: 20 }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{titre}</div>
      {sousTitre && <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>{sousTitre}</div>}
    </div>
    <IconButton onClick={onFermer} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
      <CloseIcon style={{ fontSize: 16 }} />
    </IconButton>
  </div>
);

// Date lisible : « 14/11/2026 · 15:56 » à partir de « 2026-11-14 15:56:32 ».
const dateConversation = (v) => {
  if (!v) return "";
  const d = new Date(String(v).replace(" ", "T"));
  if (isNaN(d)) return String(v);
  return `${d.toLocaleDateString("fr-FR")} · ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
};

const LigneConversation = ({ c, active, onOuvrir, onSupprimer }) => {
  const [survol, setSurvol] = useState(false);
  const [confirmer, setConfirmer] = useState(false);
  const [suppression, setSuppression] = useState(false);
  const echanges = Array.isArray(c.messages) ? Math.ceil(c.messages.length / 2) : null;
  if (confirmer) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, border: "1px solid #fecaca", background: "#fef2f2" }}>
        <DeleteOutlineIcon style={{ fontSize: 18, color: "#dc2626", flex: "0 0 auto" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#B91C1C" }}>Supprimer cette conversation ?</div>
          <div title={c.title} style={{ fontSize: 11.5, color: "#7f1d1d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title || "Conversation sans titre"}</div>
        </div>
        <button type="button" disabled={suppression} onClick={() => setConfirmer(false)}
          style={{ padding: "5px 10px", margin: 0, borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
        <button type="button" disabled={suppression}
          onClick={async () => { setSuppression(true); try { await onSupprimer(c); } finally { setSuppression(false); setConfirmer(false); } }}
          style={{ padding: "5px 10px", margin: 0, borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontSize: 12, fontWeight: 600, cursor: suppression ? "default" : "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
          {suppression && <CircularProgress size={11} style={{ color: "#fff" }} />} Supprimer
        </button>
      </div>
    );
  }
  return (
    <div role="button" tabIndex={0} onClick={() => onOuvrir(c)} onKeyDown={(e) => { if (e.key === "Enter") onOuvrir(c); }}
      onMouseEnter={() => setSurvol(true)} onMouseLeave={() => setSurvol(false)}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 12, cursor: "pointer", transition: "all .15s",
        border: `1px solid ${active ? P : survol ? "#bfd3e3" : "#e5e7eb"}`, background: active ? "#eff6ff" : survol ? "#f8fafc" : "#fff" }}>
      <span style={{ flex: "0 0 auto", width: 30, height: 30, borderRadius: 8, background: active ? "#dbeafe" : "#f1f5f9", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <ChatBubbleOutlineIcon style={{ fontSize: 15, color: active || survol ? P : "#64748b" }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div title={c.title} style={{ fontSize: 13, fontWeight: 600, color: survol || active ? P : "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {c.title || "Conversation sans titre"}
        </div>
        <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
          {echanges != null && `${echanges} échange(s) · `}{dateConversation(c.updatedAt || c.createdAt)}
        </div>
      </div>
      <Tooltip title="Supprimer la conversation" arrow>
        <button type="button" aria-label="Supprimer la conversation" onClick={(e) => { e.stopPropagation(); setConfirmer(true); }}
          style={{ flex: "0 0 auto", width: 28, height: 28, padding: 0, margin: 0, borderRadius: 7, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: survol ? "#fef2f2" : "transparent", color: survol ? "#dc2626" : "#94a3b8" }}>
          <DeleteOutlineIcon style={{ fontSize: 17 }} />
        </button>
      </Tooltip>
    </div>
  );
};

export const VoletHistorique = ({ ouvert, onFermer, onOuvrir, onToutEfface, conversationActive }) => {
  const [liste, setListe] = useState([]);
  const [filtre, setFiltre] = useState("");
  const [confirmer, setConfirmer] = useState(false);
  const charger = () => rapportsIa.conversations().then((l) => setListe(Array.isArray(l) ? l : [])).catch(() => setListe([]));
  useEffect(() => { if (ouvert) { charger(); setConfirmer(false); } }, [ouvert]);
  const visibles = liste.filter((c) => !filtre || String(c.title || "").toLowerCase().includes(filtre.toLowerCase()));
  const toutEffacer = async () => {
    try {
      await rapportsIa.viderConversations();
      setListe([]);
      setConfirmer(false);
      notify("Historique des conversations effacé", "success");
      onToutEfface?.();
    } catch (e) {
      notify(message(e, "L'historique n'a pas pu être effacé"), "error");
    }
  };
  return (
    <Drawer anchor="right" open={ouvert} onClose={onFermer} sx={{ zIndex: 2000 }}
      PaperProps={{ style: { width: 420, maxWidth: "100vw", display: "flex", flexDirection: "column", background: "#fff" } }}>
      <EnTete Icone={HistoryIcon} titre="Historique des conversations" sousTitre="Vos sessions d'analyses décisionnelles" onFermer={onFermer} />
      <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #cbd5e1", borderRadius: 10, padding: "0 10px", background: "#fff" }}>
          <SearchIcon style={{ fontSize: 18, color: "#94a3b8" }} />
          <input value={filtre} onChange={(e) => setFiltre(e.target.value)} placeholder="Rechercher une conversation…" className="browser-default"
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", padding: "9px 0", margin: 0, height: "auto", fontSize: 13, fontFamily: "inherit", background: "transparent", boxShadow: "none" }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px" }}>
        {liste.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: 0.4, margin: "2px 2px 10px" }}>
            <ChatBubbleOutlineIcon style={{ fontSize: 14, color: P }} /> Conversations récentes ({visibles.length})
          </div>
        )}
        {visibles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 12px", fontSize: 12.5, color: "#64748b", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
            {liste.length ? "Aucune conversation ne correspond à la recherche." : "Aucune conversation enregistrée pour le moment."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {visibles.map((c) => (
              <LigneConversation key={c.conversationId} c={c} active={c.conversationId === conversationActive}
                onOuvrir={onOuvrir} onSupprimer={(x) => rapportsIa.supprimerConversation(x.conversationId)
                  .then(() => { notify("Conversation supprimée", "success"); return charger(); })
                  .catch((e) => notify(message(e, "La conversation n'a pas pu être supprimée"), "error"))} />
            ))}
          </div>
        )}
      </div>
      {/* Pied : effacer tout l'historique (avec confirmation) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderTop: "1px solid #e5e7eb", background: "#f8fafc" }}>
        {confirmer ? (
          <>
            <span style={{ flex: 1, fontSize: 12.5, color: "#B91C1C", fontWeight: 600 }}>Effacer les {liste.length} conversation(s) ?</span>
            <OutlineButton onClick={() => setConfirmer(false)}>Annuler</OutlineButton>
            <PrimaryButton onClick={toutEffacer} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, px: 2, background: "#dc2626", "&:hover": { background: "#b91c1c" } }}>Effacer</PrimaryButton>
          </>
        ) : (
          <>
            {liste.length > 0 && (
              <button type="button" onClick={() => setConfirmer(true)}
                style={{ background: "none", border: "none", padding: 0, margin: 0, color: "#dc2626", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <DeleteOutlineIcon style={{ fontSize: 17 }} /> Vider l'historique
              </button>
            )}
            <span style={{ flex: 1 }} />
            <OutlineButton onClick={onFermer}>Fermer</OutlineButton>
          </>
        )}
      </div>
    </Drawer>
  );
};
