import React from "react";
import { Dialog, DialogContent, DialogActions, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import RecorderControls from "../recorder-controls";

// Fenêtres « Ajouter un contenu », « Ajouter des fichiers » et « Enregistrement audio »,
// avec la même présentation que sur la page de mesure de satisfaction (MesurerReclamation).

const papier = { style: { borderRadius: 16, padding: 8 } };
const annulerSx = { textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b" };
const enregistrerSx = (couleur, survol) => ({ textTransform: "none", borderRadius: 2, background: couleur, "&:hover": { background: survol } });

const EnTete = ({ fond, icone, titre, sousTitre }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingTop: 8 }}>
    <div style={{ width: 44, height: 44, borderRadius: "50%", background: fond, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {icone}
    </div>
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{titre}</div>
      <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{sousTitre}</div>
    </div>
  </div>
);

export const FenetreContenu = ({ open, valeur, onChange, onClose, onAnnuler, onEnregistrer, chargement }) => (
  <Dialog open={!!open} fullWidth maxWidth="sm" onClose={onClose} id="dialog-contenu" PaperProps={papier}>
    <DialogContent>
      <EnTete
        fond="#faf5ff" titre="Ajouter un contenu" sousTitre="Ce contenu sera attaché au dossier"
        icone={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
      />
      <TextField
        fullWidth multiline minRows={5}
        value={valeur}
        onChange={(e) => { e.stopPropagation(); e.preventDefault(); onChange(e.target.value); }}
        placeholder="Saisissez le contenu..."
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
      />
    </DialogContent>
    <DialogActions style={{ padding: "8px 20px 20px", gap: 8 }}>
      <LoadingButton fullWidth onClick={onAnnuler} variant="outlined" sx={annulerSx}>Annuler</LoadingButton>
      <LoadingButton fullWidth onClick={onEnregistrer} loading={chargement} disabled={!valeur?.trim()}
        loadingPosition="end" endIcon={<SaveIcon />} variant="contained" sx={enregistrerSx("#7c3aed", "#6d28d9")}>
        <span>Enregistrer</span>
      </LoadingButton>
    </DialogActions>
  </Dialog>
);

export const FenetreFichiers = ({ fichiers = [], onAnnuler, onEnregistrer, chargement }) => {
  if (!fichiers.length) return null;
  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onAnnuler} id="dialog-addFile" PaperProps={papier}>
      <DialogContent>
        <EnTete
          fond="#f0fdf4" titre="Ajouter des fichiers"
          sousTitre={`${fichiers.length} fichier${fichiers.length > 1 ? "s" : ""} sélectionné${fichiers.length > 1 ? "s" : ""}`}
          icone={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {fichiers.map((file, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{Math.round((file.size / 1024) * 100) / 100} Ko</div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
      <DialogActions style={{ padding: "8px 20px 20px", gap: 8 }}>
        <LoadingButton fullWidth onClick={onAnnuler} variant="outlined" sx={annulerSx}>Annuler</LoadingButton>
        <LoadingButton fullWidth onClick={onEnregistrer} loading={chargement}
          loadingPosition="end" endIcon={<SaveIcon />} variant="contained" sx={enregistrerSx("#15803d", "#166534")}>
          <span>Enregistrer</span>
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export const FenetreAudio = ({ open, audios = [], onRetirer, onClose, onAnnuler, onEnregistrer, chargement, recorderState, handlers }) => (
  <Dialog open={!!open} onClose={onClose} id="dialog-audio" fullWidth maxWidth="sm" PaperProps={papier}>
    <DialogContent>
      <EnTete
        fond="#eff6ff" titre="Enregistrement audio" sousTitre="Cliquez sur le micro et parlez"
        icone={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>}
      />
      <section className="voice-recorder">
        <div className="recorder-container">
          {audios.map((url, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <audio src={url} controls style={{ flex: 1, height: 36 }} />
              <CloseIcon style={{ cursor: "pointer", color: "#94a3b8", fontSize: 18 }} onClick={() => onRetirer(i)} />
            </div>
          ))}
          <RecorderControls recorderState={recorderState} handlers={handlers} closeAction={() => {}} />
        </div>
      </section>
    </DialogContent>
    <DialogActions style={{ display: audios.length > 0 ? "flex" : "none", padding: "8px 20px 20px", gap: 8 }}>
      <LoadingButton fullWidth onClick={onAnnuler} variant="outlined" sx={annulerSx}>Annuler</LoadingButton>
      <LoadingButton fullWidth onClick={onEnregistrer} loading={chargement}
        loadingPosition="end" endIcon={<SaveIcon />} variant="contained" sx={enregistrerSx("#1d4ed8", "#1e40af")}>
        <span>Enregistrer</span>
      </LoadingButton>
    </DialogActions>
  </Dialog>
);
