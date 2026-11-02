import React, { useState } from "react";

// Localisation d'un point de service pour la carte du rapport Global : ville, quartier, latitude, longitude.
// Les coordonnées se récupèrent dans Google Maps et peuvent être collées d'un bloc (« 6.3703, 2.4612 »).

const VIDE = { ville: "", quartier: "", latitude: "", longitude: "" };
export const localisationVide = () => ({ ...VIDE });

export const localisationDepuis = (l) => ({
  ville: l?.ville || "",
  quartier: l?.quartier || "",
  latitude: l?.latitude ?? "",
  longitude: l?.longitude ?? "",
});

const nombre = (v) => (v === "" || v == null ? null : Number(String(v).replace(",", ".")));

// Mêmes règles que le serveur : latitude et longitude ensemble, dans leurs plages ; textes de 120 caractères au plus.
export function verifierLocalisation(l) {
  const lat = nombre(l.latitude), lon = nombre(l.longitude);
  if ((lat == null) !== (lon == null)) return "Renseignez la latitude et la longitude ensemble, ou laissez les deux vides.";
  if (lat != null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) return "La latitude doit être un nombre compris entre -90 et 90.";
  if (lon != null && (!Number.isFinite(lon) || lon < -180 || lon > 180)) return "La longitude doit être un nombre compris entre -180 et 180.";
  if (l.ville.trim().length > 120 || l.quartier.trim().length > 120) return "La ville et le quartier ne doivent pas dépasser 120 caractères.";
  return null;
}

export const localisationPourServeur = (l) => ({
  ville: l.ville.trim() || null,
  quartier: l.quartier.trim() || null,
  latitude: nombre(l.latitude),
  longitude: nombre(l.longitude),
});

const libelle = { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" };
const champ = (erreur) => ({ width: "100%", boxSizing: "border-box", border: erreur ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "10.5px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", height: 40 });

export default function LocalisationPointService({ valeur, onChange, erreur }) {
  const [aide, setAide] = useState(false);
  const maj = (cle) => (e) => onChange({ ...valeur, [cle]: e.target.value });
  // Coller « latitude, longitude » copié depuis Google Maps remplit les deux champs d'un coup.
  const coller = (e) => {
    const texte = (e.clipboardData || window.clipboardData).getData("text");
    const m = texte.match(/(-?\d+(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d+(?:[.,]\d+)?)/);
    if (m) { e.preventDefault(); onChange({ ...valeur, latitude: m[1].replace(",", "."), longitude: m[2].replace(",", ".") }); }
  };
  const lat = nombre(valeur.latitude), lon = nombre(valeur.longitude);
  const verifiable = Number.isFinite(lat) && Number.isFinite(lon) && lat != null && lon != null;

  return (
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>Localisation (carte du rapport Global)</div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Facultatif. Sans coordonnées, le point de service apparaît dans la liste « non localisée » de la carte.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        <div><label style={libelle}>Ville</label><input value={valeur.ville} onChange={maj("ville")} placeholder="Ex : Cotonou" maxLength={120} style={champ(false)} /></div>
        <div><label style={libelle}>Quartier</label><input value={valeur.quartier} onChange={maj("quartier")} placeholder="Ex : Akpakpa" maxLength={120} style={champ(false)} /></div>
        <div><label style={libelle}>Latitude</label><input value={valeur.latitude} onChange={maj("latitude")} onPaste={coller} placeholder="Ex : 6.3703" inputMode="decimal" style={champ(!!erreur)} /></div>
        <div><label style={libelle}>Longitude</label><input value={valeur.longitude} onChange={maj("longitude")} onPaste={coller} placeholder="Ex : 2.4612" inputMode="decimal" style={champ(!!erreur)} /></div>
      </div>
      {erreur && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 6 }}>{erreur}</div>}
      <div style={{ marginTop: 10, fontSize: 12, color: "#475569" }}>
        <button type="button" onClick={() => setAide((a) => !a)} style={{ background: "none", border: "none", padding: 0, color: "var(--gpr-primary, #005081)", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>
          {aide ? "Masquer l'aide" : "Comment trouver les coordonnées ?"}
        </button>
        {verifiable && (
          <a href={`https://www.google.com/maps?q=${lat},${lon}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 16, color: "var(--gpr-primary, #005081)", fontWeight: 600 }}>
            Vérifier sur Google Maps
          </a>
        )}
        {aide && (
          <ol style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.7, color: "#475569" }}>
            <li>Ouvrez <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a> et recherchez l'agence (ou son adresse).</li>
            <li>Faites un clic droit exactement sur l'emplacement de l'agence.</li>
            <li>La première ligne du menu affiche deux nombres, par exemple <b>6.3703, 2.4612</b> : cliquez dessus pour les copier.</li>
            <li>Collez-les dans le champ Latitude : la latitude (premier nombre) et la longitude (second nombre) se remplissent d'un coup.</li>
          </ol>
        )}
      </div>
    </div>
  );
}
