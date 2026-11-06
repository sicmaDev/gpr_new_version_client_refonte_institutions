import React, { useEffect, useState } from "react";
import { downloadAudioApi } from "../../apis/Reclamations/ReclamationsApi";

// Lecteur d'un audio déjà enregistré sur le serveur : le fichier est téléchargé puis lu dans le navigateur.
const AudioSauvegarde = ({ audio, style }) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let annule = false;
    let lien = null;
    downloadAudioApi(audio.id, audio.name).then((blob) => {
      if (blob && !annule) {
        lien = URL.createObjectURL(blob);
        setUrl(lien);
      }
    });
    return () => {
      annule = true;
      if (lien) URL.revokeObjectURL(lien);
    };
  }, [audio.id, audio.name]);
  return url ? <audio controls src={url} style={style} /> : <span style={{ flex: 1, fontSize: 12, color: "#94a3b8" }}>Chargement de l'audio…</span>;
};

export default AudioSauvegarde;
