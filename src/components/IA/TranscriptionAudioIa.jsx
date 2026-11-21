// Transcription IA d'un audio (voix du client), affichée sous l'audio comme dans l'ancienne version :
// volet « ● Transcription ▲ » + bouton relancer, moteur utilisé, texte entre guillemets, « Ajouter au contenu ».
import React, { useEffect, useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { enregistrerTranscription, iaDisponible, texteTranscription, transcrireAudio } from "../../apis/IA/IaApi";
import { downloadAudioApi } from "../../apis/Reclamations/ReclamationsApi";
import { notify } from "../../Utils/alert";

// Nom de fichier stable pour chaque enregistrement fait dans la page (sert à retrouver l'audio après l'envoi).
const noms = new WeakMap();
export const nomAudio = (blob, prefixe = "claim_record_") => {
  if (blob instanceof File && blob.name) return blob.name;
  if (!noms.has(blob)) {
    const id = (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    noms.set(blob, `${prefixe}${id}.ogg`);
  }
  return noms.get(blob);
};

/**
 * Nettoyage du texte transcrit avant de l'ajouter au contenu (repris de l'ancienne version) :
 * balises, bruitages [..] / (..), caractères spéciaux, espaces, et phrases parasites sur un audio silencieux.
 */
export const nettoyerTranscription = (texte) => {
  if (!texte) return "";
  let t = texte;
  t = t.replace(/<[^>]*>/g, "");
  t = t.replace(/\[[^\]]*\]/g, "");
  t = t.replace(/\([^)]*\)/g, "");
  t = t.replace(/[/\\]/g, " ");
  t = t.replace(/[*_~`#@^|+=<>{}[\]]/g, "");
  t = t.replace(/\s+/g, " ").trim();
  const parasites = [
    /sous-titrage\s+soci[eé]t[eé]\s+radio-canada/i,
    /sous-titres\s+r[eé]alis[eé]s\s+par/i,
    /merci\s+d'avoir\s+regard[eé]/i,
    /abonnez-vous/i,
    /transcrit\s+par\s+la\s+communaut[eé]/i,
    /amara\.org/i,
  ];
  if (parasites.some((p) => p.test(t)) && t.length < 80) return "";
  return t;
};

/**
 * Après l'enregistrement d'un dossier : recopie sur chaque audio enregistré la transcription faite pendant la saisie.
 * transcriptions : { [nomFichier]: { reponse, ajoute } } ; audiosEnregistres : liste {id, name} renvoyée par le serveur.
 */
export const enregistrerTranscriptionsApresEnvoi = async (transcriptions, audiosEnregistres) => {
  if (!transcriptions || !Array.isArray(audiosEnregistres)) return;
  await Promise.all(audiosEnregistres.map((a) => {
    const t = transcriptions[a.name];
    return t ? enregistrerTranscription(a.id, t.reponse, t.ajoute).catch(() => null) : null;
  }));
};

/** Moteur utilisé, tel que renvoyé par l'API (provider.fallback_triggered, provider.latency_ms). */
const moteur = (r) => {
  const p = r && typeof r === "object" ? r.provider : null;
  if (!p) return null;
  const duree = p.latency_ms ? `${Math.round(p.latency_ms)} ms` : "";
  return p.fallback_triggered
    ? { libelle: `Secours Groq Whisper (${duree})`, couleur: "#b45309", point: "#f59e0b" }
    : { libelle: `Google Gemini Nominal (${duree})`, couleur: "#15803d", point: "#22c55e" };
};

/**
 * audio : Blob/File (nouvel enregistrement) ; ou audioId + nom (audio déjà enregistré dans GPR).
 * existante : { texte, ajoute } si une transcription est déjà enregistrée.
 * auto : transcrire tout de suite (nouvel enregistrement).
 * onResultat(reponse) : transcription obtenue ; onAjouter(texteNettoye, reponse) : bouton « Ajouter au contenu ».
 */
const TranscriptionAudioIa = ({ audio, audioId, nom, existante, auto = false, persister = false, onResultat, onAjouter, dejaAjoute }) => {
  const [etat, setEtat] = useState(existante?.texte ? "ok" : "attente");
  const [reponse, setReponse] = useState(existante?.texte ? existante.texte : null);
  const [erreur, setErreur] = useState(null);
  const [ajoute, setAjoute] = useState(!!(existante?.ajoute || dejaAjoute));
  const [ouvert, setOuvert] = useState(true);
  const [disponible, setDisponible] = useState(false);
  const lance = useRef(false);

  useEffect(() => {
    let actif = true;
    iaDisponible().then((ok) => actif && setDisponible(ok));
    return () => { actif = false; };
  }, []);

  const transcrire = async () => {
    setEtat("encours");
    setErreur(null);
    setOuvert(true);
    try {
      let fichier = audio;
      if (!fichier && audioId) {
        const donnees = await downloadAudioApi(audioId, nom);
        fichier = new File([donnees], nom || "audio.ogg", { type: "audio/ogg" });
      }
      const r = await transcrireAudio(fichier, nom || (fichier && nomAudio(fichier)));
      setReponse(r);
      setEtat("ok");
      onResultat?.(r);
      if (persister && audioId) enregistrerTranscription(audioId, r).catch(() => null);
    } catch (e) {
      setErreur(e.message);
      setEtat("erreur");
    }
  };

  useEffect(() => {
    if (auto && disponible && !lance.current && !existante?.texte) {
      lance.current = true;
      transcrire();
    }
  }, [auto, disponible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!disponible && etat !== "ok") return null;

  const texte = texteTranscription(reponse);
  const m = moteur(reponse);
  const enCours = etat === "encours";

  const ajouter = () => {
    if (ajoute) {
      notify("L'audio est déjà ajouté au contenu.", "warning");
      return;
    }
    const propre = nettoyerTranscription(texte);
    if (!propre) return;
    setAjoute(true);
    onAjouter?.(propre, reponse);
    if (audioId) enregistrerTranscription(audioId, reponse, true).catch(() => null);
  };

  return (
    <div style={{ marginTop: 10, borderTop: "1px dashed #99cde8", paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        onClick={() => setOuvert(!ouvert)}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 12, fontWeight: "bold" }}>
          <span style={{ color: enCours ? "#ff9800" : etat === "erreur" ? "#ef4444" : texte ? "#4caf50" : "#9e9e9e", marginRight: 6 }}>●</span>
          <span style={{ color: "#555" }}>{enCours ? "Transcription en cours..." : "Transcription"}</span>
          {ouvert ? <ExpandLessIcon style={{ fontSize: 16, marginLeft: 4, color: "#555" }} /> : <ExpandMoreIcon style={{ fontSize: 16, marginLeft: 4, color: "#555" }} />}
        </div>
        {!enCours && (
          <button type="button" title="Lancer la transcription"
            onClick={(e) => { e.stopPropagation(); transcrire(); }}
            style={{ background: "none", border: "none", color: "var(--gpr-primary, #005081)", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}>
            <RefreshIcon style={{ fontSize: 18 }} />
          </button>
        )}
      </div>

      {ouvert && (
        <div style={{ marginTop: 8, padding: 10, backgroundColor: "#fff", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          {enCours ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff9800", fontSize: 12 }}>
              <CircularProgress size={14} style={{ color: "#ff9800" }} />
              <span style={{ fontWeight: 600 }}>Chargement de la transcription...</span>
            </div>
          ) : etat === "erreur" ? (
            <span style={{ fontSize: 12, color: "#b91c1c" }}>{erreur}</span>
          ) : texte ? (
            <div>
              {m && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 11, color: m.couleur }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", backgroundColor: m.point }} />
                  <span>{m.libelle}</span>
                </div>
              )}
              <p style={{ margin: "0 0 8px 0", fontSize: 13, fontStyle: "italic", color: "#37474f", lineHeight: 1.4 }}>
                "{texte}"
              </p>
              {onAjouter && (
                <button type="button" onClick={ajouter}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4, textTransform: "none", borderRadius: 8, height: 26,
                    fontSize: 11, padding: "0 8px", fontWeight: 500,
                    backgroundColor: ajoute ? "#e8f4fc" : "var(--gpr-primary, #005081)", color: ajoute ? "var(--gpr-primary-dark, #003d62)" : "#fff",
                    border: ajoute ? "1px solid #99cde8" : "1px solid var(--gpr-primary, #005081)",
                    cursor: ajoute ? "not-allowed" : "pointer",
                  }}>
                  <PlaylistAddIcon style={{ fontSize: 14 }} />
                  {ajoute ? "Déjà ajouté au contenu" : "Ajouter au contenu"}
                </button>
              )}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: "#777", fontStyle: "italic" }}>
              {etat === "ok"
                ? "Aucune parole reconnue dans cet audio."
                : "Aucune transcription. Cliquez sur l'icône de rafraîchissement pour la générer."}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TranscriptionAudioIa;
