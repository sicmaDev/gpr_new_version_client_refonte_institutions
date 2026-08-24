import React from "react";
import { isWhatsappAudioComment, stripWhatsappCommentPrefix } from "../utils";

/**
 * Affiche le commentaire client d'une mesure de satisfaction : texte normal, texte reçu
 * par WhatsApp (préfixe "[WhatsApp] " simplement retiré), ou - s'il s'agit d'un
 * commentaire vocal WhatsApp ("[WhatsApp-Audio]") - un badge cliquable qui fait défiler
 * jusqu'à l'audio correspondant (voir useWaAudioJump / WaAudioSection).
 */
export default function WaCommentBadge({ commentaire, measureDateTime, onJumpToAudio }) {
  if (isWhatsappAudioComment(commentaire)) {
    return (
      <span
        onClick={() => onJumpToAudio(measureDateTime)}
        title="Cliquez pour écouter le commentaire vocal du client"
        style={{
          cursor: "pointer",
          fontWeight: 700,
          padding: "1px 7px",
          borderRadius: 10,
          background: "#dcfce7",
          border: "1px solid #22c55e",
          color: "#15803d",
          display: "inline-block",
          animation: "waCommentPulse 1.8s infinite",
        }}
      >
        🎙 Écouter le commentaire vocal
      </span>
    );
  }
  return <>{stripWhatsappCommentPrefix(commentaire)}</>;
}
