import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
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
import RecorderControls from "../../components/recorder-controls";
import useRecorder from "../../hooks/useRecorder";
import { HOST } from "../../Utils/globals";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { notify } from "../../Utils/alert";

const WA = { accent: "#25d366", bg: "#dcf8c6" };

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
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 10, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </span>
        {blob && (
          <IconButton
            size="small"
            onClick={() => {
              setBlob(null);
              recorder.cancelRecording();
            }}
          >
            <DeleteIcon fontSize="small" />
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
        <Button size="small" variant="outlined" onClick={() => setActiveSlot(slotKey)}>
          🎙 Enregistrer
        </Button>
      )}
    </div>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <WhatsAppIcon style={{ color: WA.accent }} />
        Envoyer la solution par WhatsApp
      </DialogTitle>
      <DialogContent>
        <p style={{ fontSize: 13, color: "#555" }}>
          Client : <b>{phone || "numéro non renseigné"}</b>
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Button
            size="small"
            variant={waMode === "text" ? "contained" : "outlined"}
            onClick={() => setWaMode("text")}
          >
            Solution texte
          </Button>
          <Button
            size="small"
            variant={waMode === "audio" ? "contained" : "outlined"}
            onClick={() => setWaMode("audio")}
          >
            Notes vocales
          </Button>
        </div>

        {renderSlot("Note vocale présentant le sondage (facultatif)", "survey", surveyBlob, setSurveyBlob, surveyRecorder)}

        {waMode === "text" ? (
          <div
            style={{
              background: WA.bg,
              borderRadius: 8,
              padding: 12,
              fontSize: 13,
              whiteSpace: "pre-wrap",
              marginBottom: 12,
            }}
          >
            {solutionMessage}
          </div>
        ) : (
          <>
            {renderSlot("Audio 1 - Solution", "solution", solutionBlob, setSolutionBlob, solutionRecorder, true)}
            {renderSlot("Audio 2 - Demande de commentaire (si insatisfait)", "comment", commentBlob, setCommentBlob, commentRecorder)}
            {renderSlot("Audio 3 - Remerciement (si satisfait)", "thanks", thanksBlob, setThanksBlob, thanksRecorder)}
            {renderSlot("Audio 4 - Réponse après commentaire", "reply", replyBlob, setReplyBlob, replyRecorder)}
          </>
        )}

        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>
            Sondage de satisfaction envoyé avec le message :
          </p>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#555" }}>
            <span><SentimentSatisfiedAltIcon fontSize="small" sx={{ verticalAlign: "middle" }} /> Satisfait</span>
            <span><SentimentNeutralIcon fontSize="small" sx={{ verticalAlign: "middle" }} /> Partiellement satisfait</span>
            <span><SentimentVeryDissatisfiedIcon fontSize="small" sx={{ verticalAlign: "middle" }} /> Non satisfait</span>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={sending}>
          Annuler
        </Button>
        <LoadingButton
          variant="contained"
          style={{ backgroundColor: WA.accent }}
          onClick={handleSend}
          loading={sending}
          disabled={waMode === "audio" && !solutionBlob}
        >
          Envoyer
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
