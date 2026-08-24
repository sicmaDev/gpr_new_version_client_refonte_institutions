import { useState } from "react";
import { findClosestWaAudio } from "../utils";
import { notify } from "../../Utils/alert";

/**
 * Fournit l'état + le handler nécessaires au clic sur un badge "🎙 Écouter le
 * commentaire vocal" (voir WaCommentBadge) : retrouve l'audio WhatsApp le plus proche
 * dans le temps de la mesure de satisfaction concernée, le met en surbrillance, et
 * scrolle jusqu'à la section "Retour du client par WhatsApp" (voir WaAudioSection).
 */
export default function useWaAudioJump(waAudios) {
  const [highlightedAudioId, setHighlightedAudioId] = useState(null);

  const handleJumpToWhatsappAudioComment = (measureDateTime) => {
    if (!waAudios || waAudios.length === 0) {
      notify("Audio introuvable dans la liste des audios", "error");
      return;
    }
    const match = findClosestWaAudio(waAudios, measureDateTime);
    setHighlightedAudioId(match.id);
    const section = document.getElementById("whatsapp-audios-section");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return { highlightedAudioId, handleJumpToWhatsappAudioComment };
}
