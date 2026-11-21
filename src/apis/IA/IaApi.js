// Appels à l'IA depuis l'écran. L'écran ne parle QU'AU serveur GPR (/api/v1/ia/...) avec la connexion
// habituelle : c'est le serveur qui contacte le Core IA et Wren avec la clé, que l'écran ne connaît pas.
// Les réponses ont le même format que dans l'ancienne version de GPR (AiApi.js, useWrenStream.js).
import axios from "axios";
import { HOST } from "../../Utils/globals";
import { loadItemFromLocalStorage, loadItemFromSessionStorage } from "../../Utils/utils";

const IA = HOST + "api/v1/ia";

const entetes = (json = true) => {
  const h = { Authorization: "Bearer " + loadItemFromSessionStorage("token") };
  if (json) h["Content-Type"] = "application/json";
  return h;
};

export const nouveauNumeroAnalyse = () => `cai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Définitions données à l'IA pour chaque nature de dossier (reprises de l'ancienne version).
export const DEFINITIONS_NATURE = {
  RECLAMATION: "Une réclamation est l'expression d'une insatisfaction par un client envers la banque, demandant la correction d'un problème, un remboursement, ou une amélioration du service.",
  DENUNCIATION: "Une dénonciation est le signalement confidentiel d'une fraude, corruption, harcèlement, faille de sécurité ou toute autre infraction grave aux règles, souvent commise par un employé ou un tiers.",
  SUGGESTION: "Une suggestion est une proposition constructive, une idée d'amélioration ou un avis partagé par un utilisateur ou un client pour optimiser un service, un produit ou un processus.",
};

// Catégories et motifs de l'institution, sous la forme attendue par l'IA.
export const categoriesMotifsPourIa = () => {
  const resultat = {};
  try {
    const categories = loadItemFromLocalStorage("app-categories") || [];
    const objets = loadItemFromLocalStorage("app-objets") || [];
    categories.forEach((c) => {
      if (c && c.libelle) resultat[c.libelle] = { description: c.description || "", motifs: [] };
    });
    objets.forEach((o) => {
      if (!o || !o.libelle || o.deleted || o.isDeleted) return;
      const cat = o.categorie && o.categorie.libelle ? o.categorie.libelle : "AUTRE";
      if (!resultat[cat]) resultat[cat] = { description: "", motifs: [] };
      resultat[cat].motifs.push({ libelle: o.libelle, description: o.description || "", gravite: o.risqueLevel || "" });
    });
  } catch (e) {
    // listes absentes : l'IA proposera sans liste
  }
  return resultat;
};

let etatCache = null;
/** Vrai si l'IA est configurée sur le serveur (réponse gardée pour la session de la page). */
export const iaDisponible = async () => {
  if (etatCache !== null) return etatCache;
  try {
    const r = await axios.get(`${IA}/etat`, { headers: entetes(false) });
    etatCache = !!r.data?.content?.configuree;
  } catch (e) {
    etatCache = false;
  }
  return etatCache;
};

const messageErreur = async (reponse) => {
  try {
    const j = await reponse.json();
    if (j?.content?.message) return j.content.message;
    // Réponse d'erreur de l'IA elle-même (ex. { detail: "..." } ou { detail: [{ loc, msg }] })
    const d = j?.detail ?? j?.message ?? j?.error;
    if (Array.isArray(d)) {
      const lignes = d.map((x) => [Array.isArray(x?.loc) ? x.loc.join(".") : "", x?.msg || ""].filter(Boolean).join(" : "));
      return `Erreur ${reponse.status} de l'IA : ${lignes.join(" ; ")}`;
    }
    if (d) return `Erreur ${reponse.status} de l'IA : ${typeof d === "string" ? d : JSON.stringify(d)}`;
    return `Erreur ${reponse.status}`;
  } catch (e) {
    return `Erreur ${reponse.status}`;
  }
};

/** Lit un flux « data: {...} » (événements séparés par une ligne vide) et appelle surEvenement pour chacun. */
const lireFlux = async (reponse, surEvenement, signal) => {
  const lecteur = reponse.body.getReader();
  const decodeur = new TextDecoder();
  let tampon = "";
  const traiter = (bloc) => {
    const t = bloc.trim();
    if (!t) return;
    let evenement = null;
    const lignes = [];
    t.split(/\r?\n/).forEach((l) => {
      if (l.startsWith("event:")) evenement = l.slice(6).trim();
      else if (l.startsWith("data:")) lignes.push(l.slice(5).trim());
    });
    if (!lignes.length) return;
    const brut = lignes.join("\n");
    let donnees;
    try {
      donnees = JSON.parse(brut);
    } catch (e) {
      donnees = brut;
    }
    surEvenement(evenement || (donnees && typeof donnees === "object" ? donnees.type : null), donnees);
  };
  while (true) {
    if (signal?.aborted) break;
    const { value, done } = await lecteur.read();
    if (done) break;
    tampon += decodeur.decode(value, { stream: true });
    const blocs = tampon.split(/\r?\n\r?\n/);
    tampon = blocs.pop();
    blocs.forEach(traiter);
  }
  if (tampon) traiter(tampon);
};

/**
 * Analyse d'un texte à l'enregistrement, au fil de l'eau.
 * rappels : { surBase({sentiment, motsCles, resume}), surUrgence(urgence), surRaisonnementUrgence(morceau),
 *             surRaisonnementClassification(morceau), surFin({categorie, motif, urgence, raisonnement, ...}), surErreur(message) }
 */
export const analyserTexte = async ({ texte, nature = "RECLAMATION", correlationId, signal }, rappels = {}) => {
  try {
    const reponse = await fetch(`${IA}/analyse/flux`, {
      method: "POST",
      headers: { ...entetes(), Accept: "text/event-stream", "X-Correlation-ID": correlationId },
      body: JSON.stringify({
        texte,
        // AUTO (par défaut) : l'IA choisit elle-même entre STANDARD et APPROFONDI.
        mode_analyse: "AUTO",
        // L'IA attend « DENONCIATION » (orthographe française).
        nature_dossier: nature === "DENUNCIATION" ? "DENONCIATION" : nature,
        definition_nature: DEFINITIONS_NATURE[nature] || "",
        categories_motifs: categoriesMotifsPourIa(),
      }),
      signal,
    });
    if (!reponse.ok) {
      rappels.surErreur?.(await messageErreur(reponse));
      return;
    }
    let fin = false;
    await lireFlux(reponse, (type, d) => {
      if (!d || typeof d !== "object") return;
      if (type === "init_base") rappels.surBase?.({ sentiment: d.sentiment, motsCles: d.mots_cles_detectes || [], resume: d.resume });
      else if (type === "reasoning" || type === "raisonnement_chunk") rappels.surRaisonnementClassification?.(d.delta || d.content || "");
      else if (type === "raisonnement_urgence_chunk") rappels.surRaisonnementUrgence?.(d.delta || d.content || "");
      else if (type === "init_urgence") rappels.surUrgence?.(d.urgence);
      else if (type === "final") {
        const f = d.data && typeof d.data === "object" ? d.data : d;
        fin = true;
        if (f.urgence) rappels.surUrgence?.(f.urgence);
        rappels.surFin?.({
          correlationId: f.correlation_id || correlationId,
          categorie: f.categorie || f.categorie_suggeree || f.result?.category || null,
          motif: f.motif || f.motif_suggere || f.result?.motif || null,
          urgence: f.urgence || null,
          sentiment: f.sentiment || null,
          raisonnement: f.raisonnement || f.result?.raisonnement || null,
          raisonnementUrgence: f.raisonnement_urgence || null,
          menaces: f.menaces_detectees || null,
          orientation: f.orientation_recommandee || null,
        });
      }
    }, signal);
    if (!fin && !signal?.aborted) rappels.surErreur?.("L'analyse s'est arrêtée avant la fin.");
  } catch (e) {
    if (e.name !== "AbortError") rappels.surErreur?.("Le service d'IA ne répond pas.");
  }
};

/**
 * Solutions proposées au traitement, au fil de l'eau.
 * rappels : { surSources(liste), surRaisonnement(morceau), surMorceau(texte), surFin(donnees), surErreur(message) }
 */
export const proposerSolutions = async (demande, rappels = {}, signal) => {
  try {
    const reponse = await fetch(`${IA}/solutions/flux`, {
      method: "POST",
      headers: { ...entetes(), Accept: "text/event-stream", "X-Correlation-ID": demande.correlation_id || nouveauNumeroAnalyse() },
      body: JSON.stringify(demande),
      signal,
    });
    if (!reponse.ok) {
      rappels.surErreur?.(await messageErreur(reponse));
      return;
    }
    let fin = false;
    await lireFlux(reponse, (type, d) => {
      const objet = d && typeof d === "object";
      if (type === "sources") rappels.surSources?.(Array.isArray(d) ? d : objet ? d.similar_claims || d.sources || [] : []);
      else if (type === "reasoning") rappels.surRaisonnement?.(objet ? d.chunk || d.delta || d.content || "" : d);
      else if (type === "chunk") rappels.surMorceau?.(objet ? d.chunk || d.delta || d.content || "" : d);
      else if (type === "final") {
        fin = true;
        rappels.surFin?.(objet ? d.data || d : d);
      }
    }, signal);
    if (!fin && !signal?.aborted) rappels.surErreur?.("La proposition s'est arrêtée avant la fin.");
  } catch (e) {
    if (e.name !== "AbortError") rappels.surErreur?.("Le service d'IA ne répond pas.");
  }
};

/** Transcription d'un audio (Blob ou File). Renvoie la réponse du Core IA, ou lève une erreur lisible. */
export const transcrireAudio = async (fichier, nom = "audio.ogg") => {
  const f = fichier instanceof File ? fichier : new File([fichier], nom, { type: fichier.type || "audio/ogg" });
  const donnees = new FormData();
  donnees.append("file", f);
  try {
    const r = await axios.post(`${IA}/transcription`, donnees, { headers: entetes(false), timeout: 180000 });
    return r.data;
  } catch (e) {
    throw new Error(e.response?.data?.content?.message || "La transcription n'a pas pu être faite.");
  }
};

/** Texte lisible d'une réponse de transcription, quel que soit le nom du champ renvoyé par le Core. */
export const texteTranscription = (t) => {
  if (!t) return "";
  if (typeof t === "string") return t;
  return t.transcription_corrigee || t.texte_corrige || t.transcription_corrected || t.corrected_text
    || t.transcription || t.texte || t.text || t.transcription_raw || t.raw_text || "";
};

/** Enregistre la transcription d'un audio déjà enregistré dans GPR. */
export const enregistrerTranscription = async (audioId, t, ajoute) => {
  const brut = typeof t === "string" ? t : (t?.transcription_raw || t?.raw_text || t?.transcription || t?.texte || t?.text || "");
  const corrige = texteTranscription(t);
  const corps = {
    transcriptionRaw: brut || corrige,
    transcriptionCorrected: corrige,
    transcriptionModel: typeof t === "object" ? (t?.model || t?.modele || t?.engine || null) : null,
    transcriptionStatus: "DONE",
    transcriptionLanguage: typeof t === "object" ? (t?.language || t?.langue || null) : null,
    transcriptionDuration: typeof t === "object" ? (t?.duration ?? t?.duree ?? null) : null,
    segmentsJson: typeof t === "object" && t?.segments ? JSON.stringify(t.segments) : null,
    speakersJson: typeof t === "object" && t?.speakers ? JSON.stringify(t.speakers) : null,
  };
  if (ajoute !== undefined) corps.transcriptionAdded = !!ajoute;
  return axios.put(`${HOST}api/v1/claimaudio/${audioId}/transcription`, corps, { headers: entetes() });
};

/** Audios d'une suggestion enregistrée (identifiant et nom de fichier). */
export const audiosDeSuggestion = async (suggestionId) => {
  try {
    const r = await axios.get(`${HOST}api/v1/suggestion/getAudiosBy/${suggestionId}`, { headers: entetes(false) });
    const liste = r.data?.content || r.data || [];
    return Array.isArray(liste) ? liste.map((a) => ({ id: a.id, name: a.name })) : [];
  } catch (e) {
    return [];
  }
};

/** Retour de l'agent sur la proposition de l'IA (ce qu'il a retenu). */
export const envoyerRetourIa = (claimId, retour) =>
  axios.post(`${IA}/retour/${claimId}`, retour, { headers: entetes() }).catch(() => null);

// ---------------------------------------------------------------- Reporting IA (Wren)

const R = `${IA}/rapports`;
const contenu = (p) => p.then((r) => r.data?.content);

export const rapportsIa = {
  conversations: () => contenu(axios.get(`${R}/conversations`, { headers: entetes(false) })),
  conversation: (id) => contenu(axios.get(`${R}/conversations/${encodeURIComponent(id)}`, { headers: entetes(false) })),
  enregistrerConversation: (c) => contenu(axios.post(`${R}/conversations`, c, { headers: entetes() })),
  supprimerConversation: (id) => contenu(axios.delete(`${R}/conversations/${encodeURIComponent(id)}`, { headers: entetes(false) })),
  viderConversations: () => contenu(axios.delete(`${R}/conversations`, { headers: entetes(false) })),
  perimetre: () => contenu(axios.get(`${R}/perimetre`, { headers: entetes(false) })),
  epingles: () => contenu(axios.get(`${R}/epingles`, { headers: entetes(false) })),
  epingler: (w) => contenu(axios.post(`${R}/epingles`, w, { headers: entetes() })),
  desepingler: (id) => contenu(axios.delete(`${R}/epingles/${encodeURIComponent(id)}`, { headers: entetes(false) })),
  ordre: (ids) => contenu(axios.put(`${R}/epingles/ordre`, ids, { headers: entetes() })),
  actualiser: (id) => axios.post(`${R}/epingles/${encodeURIComponent(id)}/actualiser`, null, { headers: entetes(false) }).then((r) => r.data),
  regles: () => contenu(axios.get(`${R}/regles`, { headers: entetes(false) })),
  enregistrerRegle: (r) => contenu(axios.post(`${R}/regles`, r, { headers: entetes() })),
  supprimerRegle: (id) => contenu(axios.delete(`${R}/regles/${encodeURIComponent(id)}`, { headers: entetes(false) })),
  reglesGlobales: (query, variables) =>
    axios.post(`${R}/regles-globales`, { query, variables }, { headers: entetes() }).then((r) => r.data),
};

/**
 * Question posée à Wren, au fil de l'eau (format de l'ancienne version, useWrenStream.js).
 * rappels : { surEtape(texte), surTables(liste), surReflexion(texte), surSql(sql), surTexte(texteComplet), surFil(threadId) }
 * Renvoie { ok, erreur, tables, reflexion, sql, texte, threadId, duree }.
 */
export const poserQuestionIa = async (question, threadId, rappels = {}, signal) => {
  const debut = Date.now();
  const res = { ok: false, tables: [], reflexion: "", sql: null, texte: "", threadId: threadId || null, traceId: null, dureeIa: null };
  try {
    const reponse = await fetch(`${R}/question`, {
      method: "POST",
      headers: { ...entetes(), Accept: "text/event-stream" },
      body: JSON.stringify({ question, threadId }),
      signal,
    });
    if (!reponse.ok) {
      res.erreur = await messageErreur(reponse);
      return { ...res, duree: (Date.now() - debut) / 1000 };
    }
    await lireFlux(reponse, (type, p) => {
      if (!p || typeof p !== "object") return;
      if (p.type === "state") {
        const d = p.data || {};
        if (d.threadId) {
          res.threadId = d.threadId;
          rappels.surFil?.(d.threadId);
        }
        if (Array.isArray(d.retrievedTables) && d.retrievedTables.length) {
          res.tables = d.retrievedTables;
          rappels.surTables?.(d.retrievedTables);
        }
        if (d.sqlGenerationReasoning) {
          res.reflexion = d.sqlGenerationReasoning;
          rappels.surReflexion?.(d.sqlGenerationReasoning);
        }
        // Identifiant de la requête donné par l'IA (affiché « Query ID »).
        if (d.traceId) res.traceId = d.traceId;
        if (d.sql) {
          res.sql = d.sql;
          rappels.surSql?.(d.sql);
        }
        const etapes = {
          sql_generation_understanding: "Compréhension de la question",
          sql_generation_planning: "Recherche des tables utiles",
          sql_generation_generating: "Écriture de la requête",
          sql_generation_success: "Requête validée",
          sql_execution_start: "Calcul dans la base",
          sql_execution_end: "Résultats obtenus",
        };
        if (etapes[d.state]) rappels.surEtape?.(etapes[d.state]);
      } else if (p.type === "message_stop") {
        // Durée de traitement donnée par l'IA (en millisecondes) et fil de conversation.
        if (p.data?.duration != null) res.dureeIa = Number(p.data.duration) / 1000;
        if (p.data?.threadId) res.threadId = p.data.threadId;
      } else if (p.type === "content_block_delta") {
        const t = p.delta?.text || "";
        if (t) {
          res.texte += t;
          rappels.surTexte?.(res.texte);
        }
      }
    }, signal);
    res.ok = true;
  } catch (e) {
    res.erreur = e.name === "AbortError" ? "Question arrêtée." : "Le service de rapports IA ne répond pas.";
  }
  return { ...res, duree: res.dureeIa ?? (Date.now() - debut) / 1000 };
};
