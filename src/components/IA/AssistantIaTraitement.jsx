// Aide de l'IA au traitement d'un dossier : urgence, sentiment, résumé automatique, solutions proposées
// (à appliquer au formulaire officiel), régénération et cas similaires.
// Bloc « Solutions recommandées par l'IA (RAG) » et fenêtre « Plaintes historiques utilisées par l'IA » :
// repris à l'identique de l'ancienne version (AiAssistantWidget).
import React, { useEffect, useMemo, useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { iaDisponible, nouveauNumeroAnalyse, proposerSolutions } from "../../apis/IA/IaApi";
import { downloadAudioApi, downloadFillesApi } from "../../apis/Reclamations/ReclamationsApi";
import { loadItemFromLocalStorage, loadItemFromSessionStorage } from "../../Utils/utils";
import { niveauUrgence, useAnalyseIa } from "./AnalyseIaSaisie";
import { noterPropositionsIa, noterSolutionAppliqueeIa } from "./memoireIaTraitement";

const NATURE_LIEN = { RECLAMATION: "reclamations", DENUNCIATION: "denonciations" };

const versOptions = (fin) => {
  if (!fin || typeof fin !== "object" || !Array.isArray(fin.options)) return [];
  return fin.options.map((o) => ({
    solution: o.titre && o.description ? `${o.titre} : ${o.description}` : (o.solution || o.description || o.titre || ""),
    commentaire: o.commentaire || o.justification || o.comment || "",
  })).filter((o) => o.solution);
};

// Format de secours « 1. Solution | Commentaire » (texte libre), comme l'ancienne version.
const depuisTexte = (texte) => String(texte || "").split(/(?=\d\.)/)
  .filter((s) => /^\d\./.test(s.trim()))
  .map((s) => {
    const [solution, commentaire] = s.replace(/^\d\.\s*/, "").split("|");
    return { solution: (solution || "").trim(), commentaire: (commentaire || "").trim() };
  }).filter((o) => o.solution).slice(0, 3);

// Listes de la configuration (modalités de dépôt, points de service) pour les filtres de la fenêtre.
const liste = (cle) => {
  try {
    let l = loadItemFromSessionStorage(cle) || loadItemFromLocalStorage(cle) || [];
    if (typeof l === "string") l = JSON.parse(l);
    return Array.isArray(l) ? l : [];
  } catch (e) {
    return [];
  }
};

/**
 * Après « Appliquer » (comme l'ancienne version) : défilement doux (800 ms) jusqu'au champ Solution
 * du formulaire officiel, puis le curseur est placé dedans.
 */
const allerAuFormulaire = () => {
  setTimeout(() => {
    const champ = [...document.querySelectorAll("#solution, #newSolution, #new_solution")].find((c) => c.offsetParent !== null);
    if (!champ) return;
    let conteneur = champ.parentElement;
    while (conteneur && conteneur !== document.body) {
      const s = window.getComputedStyle(conteneur);
      if (/(auto|scroll)/.test(s.overflowY) && conteneur.scrollHeight > conteneur.clientHeight) break;
      conteneur = conteneur.parentElement;
    }
    if (!conteneur || conteneur === document.body) conteneur = document.scrollingElement || document.documentElement;
    const haut = conteneur === document.scrollingElement || conteneur === document.documentElement ? 0 : conteneur.getBoundingClientRect().top;
    const depart = conteneur.scrollTop;
    const distance = champ.getBoundingClientRect().top - haut - 80;
    let debut = null;
    const animer = (t) => {
      if (debut === null) debut = t;
      const avance = Math.min((t - debut) / 800, 1);
      conteneur.scrollTop = depart + distance * (1 - Math.pow(1 - avance, 4));
      if (avance < 1) requestAnimationFrame(animer);
      else champ.focus();
    };
    requestAnimationFrame(animer);
  }, 50);
};

const Badge = ({ titre, valeur, couleur, fond }) => (
  <div style={{ padding: "6px 14px", borderRadius: 999, background: fond, border: `1px solid ${couleur}33`, minWidth: 130 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: couleur }}>{titre} :</div>
    <div style={{ fontSize: 13, fontWeight: 800, color: couleur }}>● #{String(valeur).toUpperCase()}</div>
  </div>
);

const CasSimilaires = ({ ouvert, onFermer, cas, nature }) => {
  const [filtreModalite, setFiltreModalite] = useState("Tous");
  const [filtreDate, setFiltreDate] = useState("");
  const [filtrePoint, setFiltrePoint] = useState("Tous");
  const [audios, setAudios] = useState({});
  const modalites = useMemo(() => liste("app-supports"), []);
  const points = useMemo(() => liste("app-ps"), []);

  // Audios des plaintes historiques : téléchargés pour pouvoir les écouter.
  useEffect(() => {
    if (!ouvert) return;
    cas.forEach((c) => (c.audios || []).forEach((audio) => {
      setAudios((avant) => {
        if (avant[audio.id]) return avant;
        downloadAudioApi(audio.id, audio.name).then((donnees) => {
          const url = window.URL.createObjectURL(new Blob([donnees], { type: "audio/ogg; codecs=opus" }));
          setAudios((courant) => ({ ...courant, [audio.id]: url }));
        }).catch(() => null);
        return { ...avant, [audio.id]: "chargement" };
      });
    }));
  }, [ouvert, cas]);

  const filtres = cas.filter((c) => {
    if (filtreModalite !== "Tous" && c.modalite_depot !== filtreModalite) return false;
    if (filtreDate && c.date_creation && new Date(c.date_creation) < new Date(filtreDate)) return false;
    if (filtrePoint !== "Tous" && c.point_service_indexe !== filtrePoint) return false;
    return true;
  });

  return (
    <Dialog open={ouvert} onClose={(e, raison) => { if (raison !== "backdropClick") onFermer(); }} maxWidth="md" fullWidth
      disableEnforceFocus disableScrollLock PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
      {/* En-tête au style des fenêtres de la refonte (dégradé du thème, icône dans un carré arrondi). */}
      <DialogTitle style={{ background: "linear-gradient(135deg, var(--gpr-primary-dark, #003d62) 0%, var(--gpr-primary, #005081) 100%)",
        color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HistoryIcon style={{ color: "#fff", fontSize: 20 }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Plaintes historiques utilisées par l'IA</span>
        </div>
        <IconButton size="small" onClick={onFermer} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
          <CloseIcon style={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>

      {cas.length > 0 && (
        <div style={{ width: "100%", backgroundColor: "white", padding: "12px 24px", borderBottom: "1px solid #e0e0e0", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Typography variant="subtitle2" style={{ color: "var(--gpr-primary, #005081)", display: "flex", alignItems: "center", fontSize: 12 }}>
              <FilterListIcon style={{ marginRight: 6, fontSize: 16 }} />
              Filtrer les historiques
            </Typography>
            {(filtreModalite !== "Tous" || filtreDate !== "" || filtrePoint !== "Tous") && (
              <Button size="small" onClick={() => { setFiltreModalite("Tous"); setFiltreDate(""); setFiltrePoint("Tous"); }}
                style={{ textTransform: "none", color: "#d32f2f", fontSize: 11, padding: "0 4px" }}>
                Réinitialiser
              </Button>
            )}
          </div>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="ia-lbl-modalite" style={{ fontSize: 13 }}>Modalité de dépôt</InputLabel>
                <Select native labelId="ia-lbl-modalite" label="Modalité de dépôt" value={filtreModalite}
                  onChange={(e) => setFiltreModalite(e.target.value)} style={{ fontSize: 13 }}>
                  <option value="Tous">Tous</option>
                  {modalites.map((m) => <option key={m.id} value={m.libelle}>{m.libelle}</option>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <div style={{ position: "relative", width: "100%" }}>
                <label style={{ position: "absolute", top: -7, left: 8, backgroundColor: "white", padding: "0 4px", fontSize: 11,
                  color: "rgba(0, 0, 0, 0.6)", zIndex: 1 }}>
                  Depuis le
                </label>
                <input type="date" value={filtreDate} onChange={(e) => setFiltreDate(e.target.value)} className="browser-default"
                  style={{ width: "100%", height: 38, padding: "0px 10px", fontSize: 13, border: "1px solid rgb(196, 196, 196)", borderRadius: 4,
                    boxSizing: "border-box", color: "rgb(33, 33, 33)", fontFamily: "inherit", outline: "none", margin: 0 }} />
              </div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="ia-lbl-point" style={{ fontSize: 13 }}>Point de service indexé</InputLabel>
                <Select native labelId="ia-lbl-point" label="Point de service indexé" value={filtrePoint}
                  onChange={(e) => setFiltrePoint(e.target.value)} style={{ fontSize: 13 }}>
                  <option value="Tous">Tous</option>
                  {points.map((p) => <option key={p.id} value={p.libelle}>{p.libelle}</option>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </div>
      )}

      <DialogContent sx={{ backgroundColor: "#f8fafc", padding: "20px", overflowY: "auto", scrollbarColor: "#999 transparent", scrollbarWidth: "thin" }}>
        {cas.length === 0 ? (
          <Typography variant="body1" color="textSecondary" style={{ textAlign: "center", padding: 30 }}>
            Aucun précédent historique trouvé pour cette catégorie de dossier.
          </Typography>
        ) : filtres.length === 0 ? (
          <Typography variant="body2" color="textSecondary" style={{ textAlign: "center", padding: 20 }}>
            Aucun cas ne correspond à vos filtres.
          </Typography>
        ) : filtres.map((c, index) => {
          const codeClient = c.code_client || c.client_code;
          const reference = c.code || c.reference_code || c.id_historique;
          const empreinte = typeof reference === "string" && /^[a-f0-9]{64}$/i.test(reference);
          const referenceAffichee = reference && !empreinte ? reference : null;
          return (
            <div key={index} style={{ backgroundColor: "white", padding: 16, borderRadius: 12, marginBottom: 15, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Typography variant="subtitle2" style={{ color: "var(--gpr-primary, #005081)", fontWeight: "bold" }}>
                    Plainte similaire #{index + 1} {codeClient ? `(Client : ${codeClient})` : ""}
                  </Typography>
                  <span style={{ fontSize: 12, color: "#757575" }}>
                    {c.date_creation ? new Date(c.date_creation).toLocaleDateString("fr-FR") : (c.date || "")}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {c.score_similarite !== undefined && (
                    <span style={{ fontSize: 11, backgroundColor: "#e8f4fc", color: "var(--gpr-primary-dark, #003d62)", padding: "2px 8px", borderRadius: 12, fontWeight: 500 }}>
                      {/* Valeur telle que renvoyée par l'API (l'ancienne version affichait 1 - score, ce qui
                          classe aujourd'hui le cas le plus proche comme le moins pertinent). */}
                      Score : {Number(c.score_similarite).toFixed(2)}
                    </span>
                  )}
                  {c.statut && (
                    <span style={{ fontSize: 11, backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "2px 8px", borderRadius: 12, fontWeight: "bold" }}>
                      {c.statut === "SATISFIED" ? "RÉSOLU (SATISFAIT)" : c.statut}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 15, marginBottom: 12, padding: "8px 12px", backgroundColor: "#f8f9fa", borderRadius: 4, fontSize: 12, color: "#424242" }}>
                <span><strong>Client :</strong> {codeClient || "Non renseigné"}</span>
                {referenceAffichee && <span><strong>Réf. Dossier :</strong> {referenceAffichee}</span>}
                <span><strong>Produit :</strong> {c.produit_service || c.categorie || "Non renseigné"}</span>
                <span><strong>Canal :</strong> {c.modalite_depot || "Non renseigné"}</span>
                <span><strong>Point de service :</strong> {c.point_service_indexe || "Non renseigné"}</span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <Typography variant="caption" style={{ color: "#757575", fontWeight: "bold", textTransform: "uppercase" }}>Objet du litige :</Typography>
                <Typography variant="body2" style={{ color: "#424242", marginTop: 4, fontStyle: "italic", backgroundColor: "#fafafa", padding: "8px 12px", borderRadius: 4, borderLeft: "3px solid #bdbdbd" }}>
                  "{c.texte_original || c.texte || "Texte indisponible"}"
                </Typography>
              </div>

              <div style={{ marginBottom: 15 }}>
                <Typography variant="caption" style={{ color: "#757575", fontWeight: "bold", textTransform: "uppercase" }}>Pièces jointes &amp; Audios :</Typography>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                  {(c.audios || []).map((audio, i) => (
                    <div key={`audio-${i}`} style={{ display: "flex", alignItems: "center", gap: 15, backgroundColor: "#f8f9fa", padding: 10, borderRadius: 6, border: "1px solid #e0e0e0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 150 }}>
                        <AudiotrackIcon style={{ color: "#d32f2f" }} />
                        <span style={{ fontSize: 12, fontWeight: "bold", color: "#424242", wordBreak: "break-all" }}>{audio.name || `audio_${audio.id}`}</span>
                      </div>
                      <audio controls style={{ height: 35, width: "100%", outline: "none" }}
                        src={audios[audio.id] && audios[audio.id] !== "chargement" ? audios[audio.id] : undefined} />
                    </div>
                  ))}
                  {(c.medias || []).map((media, i) => (
                    <div key={`media-${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "10px 15px", borderRadius: 6, border: "1px solid #e0e0e0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ backgroundColor: "#e8f4fc", padding: 8, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <InsertDriveFileIcon style={{ color: "var(--gpr-primary, #005081)", fontSize: 24 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: "bold", color: "#424242" }}>{media.name || `document_${media.id}`}</div>
                          <div style={{ fontSize: 11, color: "#757575" }}>Document Joint</div>
                        </div>
                      </div>
                      <Button size="small" variant="text" startIcon={<FileDownloadIcon style={{ fontSize: 18 }} />}
                        onClick={() => downloadFillesApi(media.id, media.name)} style={{ textTransform: "none", fontWeight: 600, color: "var(--gpr-primary, #005081)" }}>
                        Télécharger
                      </Button>
                    </div>
                  ))}
                  {(!c.medias || c.medias.length === 0) && (!c.audios || c.audios.length === 0) && (
                    <Typography variant="body2" color="textSecondary" style={{ fontStyle: "italic", fontSize: 12 }}>Aucun fichier joint pour cette réclamation.</Typography>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <Typography variant="caption" style={{ color: "#2e7d32", fontWeight: "bold", textTransform: "uppercase" }}>Solution authentique appliquée ayant satisfait le client :</Typography>
                <Typography variant="body2" style={{ color: "#1b5e20", marginTop: 4, padding: "10px 12px", backgroundColor: "#f1f8e9", borderRadius: 4, borderLeft: "3px solid #81c784", fontWeight: 500 }}>
                  {c.solution_appliquee || c.solution_suggeree || "Non renseignée"}
                </Typography>
              </div>

              {referenceAffichee && typeof reference === "string" && reference.trim() && (
                <div style={{ marginTop: 12, textAlign: "right" }}>
                  <Button size="small" variant="outlined" color="primary" style={{ textTransform: "none", fontWeight: 600, borderRadius: 8, borderColor: "var(--gpr-primary, #005081)", color: "var(--gpr-primary, #005081)" }}
                    onClick={() => window.open(`#/${NATURE_LIEN[nature] || "reclamations"}/liste/${encodeURIComponent(reference)}`, "_blank")}>
                    Voir la plainte complète
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </DialogContent>
      <DialogActions style={{ padding: "12px 20px", backgroundColor: "white", borderTop: "1px solid #e0e0e0" }}>
        <Button onClick={onFermer} variant="contained" style={{ backgroundColor: "var(--gpr-primary, #005081)", color: "white", textTransform: "none", fontWeight: 600, borderRadius: 8, boxShadow: "none" }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * claimId, texte (contenu du dossier), nature (RECLAMATION / DENUNCIATION), categorie et motif choisis,
 * analyse : résultat de l'IA enregistré avec le dossier ({ resume, sentiment, urgence, correlationId }),
 * peutTraiter : l'agent peut traiter (sinon solutions non générées), onAppliquer(solution, commentaire).
 */
const AssistantIaTraitement = ({ claimId, texte, nature = "RECLAMATION", categorie, motif, analyse, peutTraiter, onAppliquer }) => {
  const [disponible, setDisponible] = useState(false);
  const enregistree = !!(analyse && (analyse.resume || analyse.urgence));
  const analyseDirecte = useAnalyseIa({ texte, nature, actif: !enregistree });
  const a = enregistree ? analyse : {
    resume: analyseDirecte.resume, sentiment: analyseDirecte.sentiment, urgence: analyseDirecte.urgence,
    correlationId: analyseDirecte.correlationId, secondes: analyseDirecte.termine ? analyseDirecte.secondes : null,
    chargement: analyseDirecte.chargement,
  };

  const [options, setOptions] = useState([]);
  const [cas, setCas] = useState([]);
  // Raisonnement de l'IA : gardé avec la solution appliquée (pas affiché, comme sur les captures).
  const [, setRaisonnement] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [casOuvert, setCasOuvert] = useState(false);
  const annulation = useRef(null);
  const lance = useRef(false);

  useEffect(() => {
    let actif = true;
    iaDisponible().then((ok) => actif && setDisponible(ok));
    return () => { actif = false; annulation.current?.abort(); };
  }, []);

  const generer = () => {
    if (!texte || texte.trim().length < 5) return;
    annulation.current?.abort();
    const controle = new AbortController();
    annulation.current = controle;
    setEnCours(true); setErreur(null); setOptions([]); setRaisonnement("");
    let texteBrut = "";
    const terminer = () => setEnCours(false);
    proposerSolutions({
      correlation_id: a.correlationId || nouveauNumeroAnalyse(),
      texte,
      nature_dossier: nature,
      categorie: categorie || null,
      motif: motif || null,
      gravite: a.urgence || "MOYEN",
      urgence: a.urgence || "MOYEN",
      sentiment: a.sentiment || "neutre",
      top_k: 3,
      mode_controle_habilitation: "DESACTIVE",
    }, {
      surSources: (l) => setCas(Array.isArray(l) ? l : []),
      surRaisonnement: (m) => setRaisonnement((r) => r + m),
      surMorceau: (m) => { texteBrut += m; const o = depuisTexte(texteBrut); if (o.length) setOptions(o); },
      surFin: (fin) => {
        terminer();
        if (!fin) {
          setErreur("Le service d'assistance IA est temporairement inaccessible. Veuillez réessayer.");
          return;
        }
        if (typeof fin === "string") { setOptions(depuisTexte(fin)); return; }
        if (fin.raisonnement) setRaisonnement(fin.raisonnement);
        if (Array.isArray(fin.similar_claims) && fin.similar_claims.length) setCas(fin.similar_claims);
        const o = versOptions(fin);
        const l = o.length ? o : depuisTexte(fin.message || fin.solution);
        setOptions(l);
        noterPropositionsIa(claimId, { options: l, raisonnement: fin.raisonnement, categorie, motif, urgence: a.urgence });
      },
      surErreur: () => { terminer(); setErreur("Le service d'assistance IA est temporairement inaccessible. Veuillez réessayer."); },
    }, controle.signal);
  };

  // Solutions générées une fois, automatiquement, quand l'agent peut traiter le dossier.
  useEffect(() => {
    if (disponible && peutTraiter && !lance.current && texte && texte.trim().length >= 5) {
      lance.current = true;
      generer();
    }
  }, [disponible, peutTraiter, texte]); // eslint-disable-line react-hooks/exhaustive-deps

  const modifierCommentaire = (i, valeur) => setOptions((l) => l.map((o, j) => (j === i ? { ...o, commentaire: valeur } : o)));

  const appliquer = (o) => {
    noterSolutionAppliqueeIa(claimId, o);
    onAppliquer?.(o.solution, o.commentaire);
    allerAuFormulaire();
  };

  const n = niveauUrgence(a.urgence);
  const sentimentCouleur = useMemo(() => {
    const s = String(a.sentiment || "").toLowerCase();
    if (s.includes("neg")) return { c: "#b91c1c", f: "#fef2f2" };
    if (s.includes("pos")) return { c: "#15803d", f: "#f0fdf4" };
    return { c: "#334155", f: "#f1f5f9" };
  }, [a.sentiment]);

  if (!disponible) return null;

  return (
    <div className="bg-white rounded-xl" style={{ border: "1px solid #e5e7eb", padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AutoAwesomeIcon style={{ color: "var(--gpr-primary, #005081)", fontSize: 20 }} />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b" }}>Analyse de sentiment et solutions proposées</div>
          <div style={{ fontSize: 12.5, color: "#64748b" }}>Proposées par l'IA à partir des dossiers déjà traités de l'institution</div>
        </div>
        {a.urgence && <Badge titre="Urgence" valeur={a.urgence} couleur={n?.couleur || "#334155"} fond={n?.fond || "#f1f5f9"} />}
        {a.sentiment && <Badge titre="Sentiment" valeur={a.sentiment} couleur={sentimentCouleur.c} fond={sentimentCouleur.f} />}
        {a.chargement && <span style={{ fontSize: 12.5, color: "#64748b" }}><CircularProgress size={11} /> Analyse…</span>}
        {a.secondes != null && !a.chargement && <span style={{ fontSize: 12.5, color: "#64748b" }}>• Analysé en {a.secondes}s</span>}
      </div>

      {a.resume && (
        <div style={{ margin: "14px 0", padding: "10px 16px", borderLeft: "4px solid #0284c7", background: "#f8fafc", borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#0369a1", letterSpacing: 0.4, marginBottom: 4 }}>RÉSUMÉ AUTOMATIQUE</div>
          <div style={{ fontStyle: "italic", fontSize: 14, color: "#334155" }}>« {a.resume} »</div>
        </div>
      )}

      {/* Solutions RAG recommandées (rendu de l'ancienne version) */}
      <div style={{ marginTop: 15 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 15, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontWeight: "bold", fontSize: 14, color: "var(--gpr-primary, #005081)", display: "flex", alignItems: "center" }}>
            <LightbulbIcon style={{ marginRight: 8, fontSize: 18 }} />
            Solutions recommandées par l'IA (RAG)
          </div>
          {cas.length > 0 && (
            <Button variant="outlined" size="small" startIcon={<HistoryIcon style={{ fontSize: 16 }} />}
              onClick={(e) => { e.preventDefault(); setCasOuvert(true); }}
              style={{ textTransform: "none", borderRadius: 8, borderColor: "var(--gpr-primary, #005081)", color: "var(--gpr-primary, #005081)", fontWeight: 600 }}>
              Voir les cas similaires ({cas.length})
            </Button>
          )}
        </div>

        {options.length > 0 && cas.length === 0 && !enCours && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 4, backgroundColor: "#f5f5f5",
            border: "1px solid #e0e0e0", color: "#616161", fontSize: 12, marginBottom: 15 }}>
            <InfoIcon style={{ fontSize: 16, color: "#757575" }} />
            <span>Aucun précédent historique direct trouvé dans la base pour ce litige. Solutions issues de l'assistance décisionnelle générale de l'IA.</span>
          </div>
        )}

        {erreur && !enCours && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 4, backgroundColor: "#ffebee",
            border: "1px solid #ef5350", color: "#c62828", fontSize: 12, marginBottom: 12 }}>
            <ErrorOutlineIcon style={{ fontSize: 16, color: "#c62828" }} />
            <span>{erreur}</span>
          </div>
        )}

        {!peutTraiter && options.length === 0 && !enCours ? (
          <div style={{ fontSize: 13, color: "#757575" }}>Les solutions sont proposées à l'agent qui traite le dossier.</div>
        ) : enCours && options.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", color: "#757575", fontSize: 13, padding: 15 }}>
            <CircularProgress size={16} style={{ marginRight: 10, color: "var(--gpr-primary, #005081)" }} />
            <span>Recherche sémantique et génération des solutions en cours...</span>
          </div>
        ) : options.length === 0 ? (
          <button type="button" onClick={generer}
            style={{ textTransform: "none", backgroundColor: "var(--gpr-primary, #005081)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600,
              fontSize: 13, padding: "7px 16px", cursor: "pointer" }}>
            {erreur ? "Réessayer la génération" : "Générer les solutions"}
          </button>
        ) : null}

        {options.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 15 }}>
            {options.map((o, i) => (
              <div key={i} style={{ padding: 15, borderRadius: 12, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontWeight: "bold", color: "var(--gpr-primary, #005081)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
                    Option {i + 1}
                  </div>
                </div>

                <div style={{ fontSize: 13, color: "#212121", marginBottom: 12, lineHeight: 1.5 }}>
                  <strong style={{ color: "#424242" }}>Solution :</strong> {o.solution}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#757575", display: "block", marginBottom: 4 }}>
                    Commentaires / Observations de clôture
                  </label>
                  <textarea className="browser-default" value={o.commentaire} onChange={(e) => modifierCommentaire(i, e.target.value)}
                    style={{ width: "100%", minHeight: 50, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", fontSize: 13,
                      fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", background: "#fff" }} />
                </div>

                {peutTraiter && (
                  <div style={{ color: "var(--gpr-primary-dark, #003d62)", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#e8f4fc",
                    padding: "8px 12px", borderRadius: 10, border: "1px solid #99cde8", boxSizing: "border-box", marginTop: 10 }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <CheckCircleOutlineIcon style={{ fontSize: 16, marginRight: 8 }} />
                      <span style={{ fontWeight: 500 }}>Appliquer cette solution au formulaire officiel</span>
                    </div>
                    <button type="button" disabled={!o.commentaire.trim()} onClick={() => appliquer(o)}
                      style={{ textTransform: "none", backgroundColor: o.commentaire.trim() ? "var(--gpr-primary, #005081)" : "#94a3b8", color: "#fff", border: "none",
                        borderRadius: 8, fontSize: 11.5, fontWeight: 600, padding: "0 14px", height: 28, lineHeight: "28px", display: "flex",
                        alignItems: "center", cursor: o.commentaire.trim() ? "pointer" : "not-allowed", boxShadow: "0 2px 2px rgba(0,0,0,0.14)" }}>
                      Appliquer
                    </button>
                  </div>
                )}
              </div>
            ))}

            {peutTraiter && !enCours && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 5 }}>
                <button type="button" onClick={generer}
                  style={{ textTransform: "none", fontSize: 12, color: "var(--gpr-primary, #005081)", padding: 0, fontWeight: 600, display: "inline-flex",
                    alignItems: "center", cursor: "pointer", background: "none", border: "none" }}>
                  <AutorenewIcon style={{ fontSize: 16, marginRight: 5 }} />
                  Régénérer d'autres solutions
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <CasSimilaires ouvert={casOuvert} onFermer={() => setCasOuvert(false)} cas={cas} nature={nature} />
    </div>
  );
};

export default AssistantIaTraitement;
