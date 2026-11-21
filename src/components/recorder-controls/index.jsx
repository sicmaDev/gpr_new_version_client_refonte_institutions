import React, { useEffect, useState } from 'react';
import { formatMinutes, formatSeconds } from "../../Utils/format-time";
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import MicIcon from '@mui/icons-material/Mic';
import "./styles.css";
import { Fab } from '@mui/material';

/**
 * Écoute en direct pendant l'enregistrement (comme l'ancienne version) : la reconnaissance vocale du navigateur
 * affiche la voix au fur et à mesure. Ce n'est qu'un aperçu : la vraie transcription est faite après, par l'IA.
 */
const useEcouteDirecte = (actif) => {
  const [texte, setTexte] = useState("");
  useEffect(() => {
    setTexte("");
    if (!actif) return undefined;
    const Reconnaissance = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!Reconnaissance) return undefined;
    let reconnaissance = null;
    try {
      reconnaissance = new Reconnaissance();
      reconnaissance.continuous = true;
      reconnaissance.interimResults = true;
      reconnaissance.lang = "fr-FR";
      reconnaissance.onresult = (event) => {
        let courant = "";
        for (let i = 0; i < event.results.length; i++) courant += event.results[i][0].transcript + " ";
        const t = courant.trim();
        if (t) setTexte(t);
      };
      // Une erreur de reconnaissance ne doit jamais bloquer l'enregistrement de l'audio.
      reconnaissance.onerror = () => {};
      reconnaissance.start();
    } catch (e) {
      // navigateur sans reconnaissance vocale : l'enregistrement continue normalement
    }
    return () => {
      try { reconnaissance && reconnaissance.stop(); } catch (e) { /* déjà arrêtée */ }
    };
  }, [actif]);
  return texte;
};

export default function RecorderControls({ recorderState, handlers, closeAction, ecouteDirecte = false }) {
  const { recordingMinutes, recordingSeconds, initRecording } = recorderState;
  const { startRecording, saveRecording, cancelRecording } = handlers;
  const texteDirect = useEcouteDirecte(ecouteDirecte && initRecording);

    // Utilisez closeAction comme une fonction
    const handleSaveClick = () => {
      saveRecording();
      if (typeof closeAction === "function") closeAction();
    };

  return (
    <div className="controls-container">
      <div className="recorder-display">
        <div className="recording-time" >
          {initRecording && <div className="recording-indicator"></div>}
          <span>{formatMinutes(recordingMinutes)}</span>
          <span>:</span>
          <span>{formatSeconds(recordingSeconds)}</span>
        </div>

      </div>
      {ecouteDirecte && initRecording && (
        <div style={{ width: "100%", margin: "12px 0 6px 0", padding: "8px 12px", backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0", borderRadius: 8, textAlign: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#0f766e", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Écoute en direct (Streaming)
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: texteDirect ? "#1e293b" : "#64748b", fontStyle: texteDirect ? "normal" : "italic",
            lineHeight: 1.4, maxHeight: 65, overflowY: "auto" }}>
            {texteDirect ? `"${texteDirect}"` : "Parlez dans votre micro, votre voix apparaît ici en continu..."}
          </p>
        </div>
      )}
      <div className="start-button-container">
        {initRecording && (
          <div className="cancel-button-container">
            <Fab style={{ backgroundColor: "#fd1c03", color: "white", marginRight: "24px" }} onClick={cancelRecording}><CloseIcon /></Fab>
          </div>
        )}
        {initRecording ? (

          <Fab style={{ backgroundColor: "var(--gpr-primary, #005081)", color: "white" }} disabled={recordingSeconds === 0 && recordingMinutes === 0}
            onClick={handleSaveClick}><SaveIcon  />

            </Fab>

        ) : (
          <Fab style={{ backgroundColor: "var(--gpr-primary, #005081)", color: "white" }} onClick={startRecording}><MicIcon /></Fab>

        )}
      </div>
    </div>
  );
}
