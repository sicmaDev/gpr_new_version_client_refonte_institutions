import React from "react";
import Mic from "@mui/icons-material/Mic";
import AudioGrid from "./AudioGrid";

/**
 * Section "Commentaire du client" - regroupe visuellement les audios reçus du
 * client via WhatsApp, avec l'ancre id="whatsapp-audios-section" utilisée par
 * handleJumpToWhatsappAudioComment (défilement + surbrillance).
 */
export default function WaAudioSection({ waAudios, currentAudioId, onPlay, highlightedAudioId, formatDate }) {
  if (!waAudios || waAudios.length === 0) return null;

  return (
    <div id="whatsapp-audios-section" style={{ marginTop: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: "2px solid #25d366",
        }}
      >
        <Mic sx={{ fontSize: 18, color: "#15803d" }} />
        <span style={{ fontWeight: 700, fontSize: 13, color: "#15803d" }}>Commentaire du client</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            background: "#dcfce7",
            color: "#15803d",
            border: "1px solid #86efac",
            borderRadius: 4,
            padding: "1px 7px",
          }}
        >
          {waAudios.length} vocal{waAudios.length > 1 ? "ux" : ""}
        </span>
      </div>
      <AudioGrid
        audios={waAudios}
        currentAudioId={currentAudioId}
        onPlay={onPlay}
        highlightedAudioId={highlightedAudioId}
        formatDate={formatDate}
      />
    </div>
  );
}
