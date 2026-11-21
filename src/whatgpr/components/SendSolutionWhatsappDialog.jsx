import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,

  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DeleteIcon from "@mui/icons-material/Delete";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import CloseIcon from "@mui/icons-material/Close";
import MicIcon from "@mui/icons-material/Mic";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import RecorderControls from "../../components/recorder-controls";
import useRecorder from "../../hooks/useRecorder";
import { HOST } from "../../Utils/globals";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { notify } from "../../Utils/alert";

// Couleurs de la refonte (apparence de l'institution), comme les autres fenêtres de GPR.
const P = "var(--gpr-primary, #005081)";
const PD = "var(--gpr-primary-dark, #003d62)";
const PL = "var(--gpr-primary-light, #e8f4fc)";
const btnPrincipal = { textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: `linear-gradient(135deg, ${PD}, ${P})`, "&:hover": { background: PD } };

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

// Nettoie un numéro de téléphone pour en faire un JID WhatsApp (indicatif + numéro,
// sans le préfixe international "00" éventuel).
const toWhatsappJid = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "").replace(/^00/, "");
  if (digits.length < 7) return null;
  return digits + "@c.us";
};

/**
 * Boîte de dialogue partagée "Envoyer la solution par WhatsApp", utilisée à la fois au
 * moment du traitement d'une réclamation (TraiterReclamation.js) et au moment de sa
 * mesure de satisfaction (MesurerReclamation.js) - un seul composant pour éviter de
 * dupliquer cette logique entre les deux pages.
 *
 * Props :
 *  - open (bool), onClose (fn)
 *  - phone (string) : numéro de téléphone du client
 *  - claimId, solutionId (number)
 *  - solutionText (string) : texte de la solution, utilisé pour l'aperçu / le message texte
 *  - onSent (fn) : appelé une fois l'envoi tenté (avec {success:boolean})
 */
export default function SendSolutionWhatsappDialog({
  open,
  onClose,
  phone,
  claimId,
  solutionId,
  solutionText,
  onSent,
}) {
  const [waMode, setWaMode] = useState("text"); // 'text' | 'audio'
  const [sending, setSending] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null); // 'solution' | 'comment' | 'thanks' | 'reply' | 'survey' | null

  // Un enregistreur dédié par piste audio possible : la solution elle-même (obligatoire
  // en mode audio), une demande de commentaire (si insatisfait), un remerciement (si
  // satisfait), une réponse après commentaire, et une note vocale présentant le sondage.
  const solutionRecorder = useRecorder();
  const commentRecorder = useRecorder();
  const thanksRecorder = useRecorder();
  const replyRecorder = useRecorder();
  const surveyRecorder = useRecorder();

  const [solutionBlob, setSolutionBlob] = useState(null);
  const [commentBlob, setCommentBlob] = useState(null);
  const [thanksBlob, setThanksBlob] = useState(null);
  const [replyBlob, setReplyBlob] = useState(null);
  const [surveyBlob, setSurveyBlob] = useState(null);

  useEffect(() => { if (solutionRecorder.recorderState.audio) { setSolutionBlob(solutionRecorder.recorderState.audio); setActiveSlot(null); } }, [solutionRecorder.recorderState.audio]);
  useEffect(() => { if (commentRecorder.recorderState.audio) { setCommentBlob(commentRecorder.recorderState.audio); setActiveSlot(null); } }, [commentRecorder.recorderState.audio]);
  useEffect(() => { if (thanksRecorder.recorderState.audio) { setThanksBlob(thanksRecorder.recorderState.audio); setActiveSlot(null); } }, [thanksRecorder.recorderState.audio]);
  useEffect(() => { if (replyRecorder.recorderState.audio) { setReplyBlob(replyRecorder.recorderState.audio); setActiveSlot(null); } }, [replyRecorder.recorderState.audio]);
  useEffect(() => { if (surveyRecorder.recorderState.audio) { setSurveyBlob(surveyRecorder.recorderState.audio); setActiveSlot(null); } }, [surveyRecorder.recorderState.audio]);

  const resetState = () => {
    setWaMode("text");
    setActiveSlot(null);
    setSolutionBlob(null);
    setCommentBlob(null);
    setThanksBlob(null);
    setReplyBlob(null);
    setSurveyBlob(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const solutionMessage = `✅ Votre réclamation a été traitée.\n\n📋 Solution apportée :\n${solutionText || ""}`;

  const handleSend = async () => {
    const to = toWhatsappJid(phone);
    if (!to) {
      notify("Numéro de téléphone du client invalide, envoi impossible.", "error");
      return;
    }
    if (waMode === "audio" && !solutionBlob) {
      notify("Merci d'enregistrer au moins la note vocale de la solution.", "error");
      return;
    }

    setSending(true);
    try {
      const user = loadItemFromSessionStorage("app-user");
      const measurerId = user?.id;
      const surveyAudioBase64 = surveyBlob ? await blobToBase64(surveyBlob) : null;
      const headers = {
        Authorization: "Bearer " + loadItemFromSessionStorage("token"),
        "Content-Type": "application/json",
      };

      if (waMode === "text") {
        await axios.post(
          HOST + "api/whatgpr/send-with-survey",
          {
            to,
            message: solutionMessage,
            claimId,
            solutionId,
            measurerId,
            ...(surveyAudioBase64 && {
              surveyAudioBase64,
              surveyAudioMimeType: "audio/ogg; codecs=opus",
            }),
          },
          { headers }
        );
      } else {
        const audioBase64 = await blobToBase64(solutionBlob);
        const audioBase642 = commentBlob ? await blobToBase64(commentBlob) : null;
        const audioBase643 = thanksBlob ? await blobToBase64(thanksBlob) : null;
        const audioBase644 = replyBlob ? await blobToBase64(replyBlob) : null;
        await axios.post(
          HOST + "api/whatgpr/send-with-survey-audio",
          {
            to,
            audioBase64,
            mimeType: "audio/ogg; codecs=opus",
            audioBase642,
            audioBase643,
            audioBase644,
            ...(surveyAudioBase64 && { surveyAudioBase64 }),
            claimId,
            solutionId,
            measurerId,
          },
          { headers }
        );
      }
      notify("Solution envoyée par WhatsApp avec le sondage de satisfaction.", "success");
      onSent && onSent({ success: true });
      handleClose();
    } catch (err) {
      notify(
        "Erreur - L'envoi par WhatsApp a échoué (le traitement de la réclamation, lui, a bien été enregistré).",
        "error"
      );
      onSent && onSent({ success: false, error: err });
    } finally {
      setSending(false);
    }
  };

  const renderSlot = (label, slotKey, blob, setBlob, recorder, required = false) => (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px", marginBottom: 10, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <GraphicEqIcon style={{ fontSize: 16, color: P }} />
          {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
        </span>
        {blob && (
          <IconButton size="small" aria-label="Supprimer l'enregistrement"
            onClick={() => { setBlob(null); recorder.cancelRecording(); }}>
            <DeleteIcon fontSize="small" style={{ color: "#94a3b8" }} />
          </IconButton>
        )}
      </div>
      {blob ? (
        <audio controls src={URL.createObjectURL(blob)} style={{ width: "100%" }} />
      ) : activeSlot === slotKey ? (
        <RecorderControls
          recorderState={recorder.recorderState}
          handlers={{
            startRecording: recorder.startRecording,
            saveRecording: recorder.saveRecording,
            cancelRecording: recorder.cancelRecording,
          }}
          closeAction={() => setActiveSlot(null)}
        />
      ) : (
        <Button size="small" variant="outlined" startIcon={<MicIcon />} onClick={() => setActiveSlot(slotKey)}
          sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, color: P, borderColor: P, "&:hover": { borderColor: PD, background: PL } }}>
          Enregistrer
        </Button>
      )}
    </div>
  );

  const Mode = ({ valeur, Icone, children }) => {
    const actif = waMode === valeur;
    return (
      <button type="button" onClick={() => setWaMode(valeur)}
        style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", margin: 0,
          borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
          background: actif ? "#fff" : "transparent", color: actif ? P : "#64748b",
          boxShadow: actif ? "0 1px 3px rgba(15,23,42,.12)" : "none" }}>
        <Icone style={{ fontSize: 17 }} /> {children}
      </button>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
      <div style={{ background: `linear-gradient(135deg, ${PD} 0%, ${P} 100%)`, padding: "18px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <WhatsAppIcon style={{ color: "#fff", fontSize: 20 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Envoyer la solution par WhatsApp</div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>Le client reçoit la solution et un sondage de satisfaction</div>
        </div>
        <IconButton onClick={handleClose} disabled={sending} size="small" aria-label="Fermer"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
          <CloseIcon style={{ fontSize: 16 }} />
        </IconButton>
      </div>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", marginBottom: 14 }}>
          <PhoneOutlinedIcon style={{ fontSize: 17, color: P }} />
          Client : <b style={{ color: "#0f172a" }}>{phone || "numéro non renseigné"}</b>
        </div>

        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 10, padding: 4, marginBottom: 16 }}>
          <Mode valeur="text" Icone={ChatOutlinedIcon}>Solution texte</Mode>
          <Mode valeur="audio" Icone={MicIcon}>Notes vocales</Mode>
        </div>

        {renderSlot("Note vocale présentant le sondage (facultatif)", "survey", surveyBlob, setSurveyBlob, surveyRecorder)}

        {waMode === "text" ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Aperçu du message envoyé au client
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: `3px solid ${P}`, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#0f172a" }}>
                <CheckCircleOutlineIcon style={{ fontSize: 17, color: P }} /> Votre réclamation a été traitée.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#334155", marginTop: 10 }}>
                <AssignmentOutlinedIcon style={{ fontSize: 16, color: "#64748b" }} /> Solution apportée :
              </div>
              <div style={{ whiteSpace: "pre-wrap", marginTop: 4, maxHeight: 160, overflowY: "auto" }}>{solutionText || ""}</div>
            </div>
          </div>
        ) : (
          <>
            {renderSlot("Audio 1 - Solution", "solution", solutionBlob, setSolutionBlob, solutionRecorder, true)}
            {renderSlot("Audio 2 - Demande de commentaire (si insatisfait)", "comment", commentBlob, setCommentBlob, commentRecorder)}
            {renderSlot("Audio 3 - Remerciement (si satisfait)", "thanks", thanksBlob, setThanksBlob, thanksRecorder)}
            {renderSlot("Audio 4 - Réponse après commentaire", "reply", replyBlob, setReplyBlob, replyRecorder)}
          </>
        )}

        <div style={{ marginTop: 6, padding: "10px 12px", background: PL, borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Sondage de satisfaction envoyé avec le message</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: "#475569" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><SentimentSatisfiedAltIcon style={{ fontSize: 17, color: "#16a34a" }} /> Satisfait</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><SentimentNeutralIcon style={{ fontSize: 17, color: "#d97706" }} /> Partiellement satisfait</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><SentimentVeryDissatisfiedIcon style={{ fontSize: 17, color: "#dc2626" }} /> Non satisfait</span>
          </div>
        </div>
      </DialogContent>
      <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
        <Button onClick={handleClose} disabled={sending} variant="outlined"
          sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, px: 3, color: P, borderColor: P }}>
          Annuler
        </Button>
        <LoadingButton variant="contained" onClick={handleSend} loading={sending} loadingPosition="start"
          startIcon={<WhatsAppIcon />} disabled={waMode === "audio" && !solutionBlob} sx={btnPrincipal}>
          Envoyer
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
