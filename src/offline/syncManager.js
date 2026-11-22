import axios from "axios";
import {
  listPendingQueueEntries,
  markSyncing,
  markSuccess,
  markFailed,
  markDoublon,
} from "./syncQueue";
import { HOST } from "../Utils/globals";
import { getDraftRecord, markDraftRecordSynced } from "./draftRecordsStore";
import db from "./db";
import { loadItemFromSessionStorage, saveItemToLocalStorage, base64DtoToFile } from "../Utils/utils";
import { licenseInfo } from "../apis/LoginApi";
import { notify } from "../Utils/alert";
import { ADD_CLAIM_API, ADD_TEMP_CLAIM_API, refreshOfflineSnapshot as refreshClaimsSnapshot } from "../apis/Reclamations/ReclamationsApi";
import { ADD_DENUNCIATION_API, ADD_TEMP_DENUNCIATION_API, refreshOfflineSnapshot as refreshDenunciationsSnapshot } from "../apis/Denonciations/DenonciationsApi";
import { ADD_SUGGESTION_API, ADD_TEMP_SUGGESTION_API, refreshOfflineSnapshot as refreshSuggestionsSnapshot } from "../apis/Suggestions/SuggestionsApi";

// Flux complet décrit dans l'audit "Offline — GPR" du 22/09/2026, section 8.
// Traite la sync_queue un item à la fois, dans l'ordre, via les mêmes
// endpoints /add et /save_temp que le mode Online (pas via le
// SynchronerController/`/api/v1/sync/*`, laissé inutilisé — décision
// validée : ses 3 endpoints batch ont une gestion d'erreur peu fiable et un
// bug connu sur les pièces jointes, cf. audit backend).

const DOMAINS = {
  claim: { addUrl: ADD_CLAIM_API, addTempUrl: ADD_TEMP_CLAIM_API, formKey: "claim" },
  denunciation: { addUrl: ADD_DENUNCIATION_API, addTempUrl: ADD_TEMP_DENUNCIATION_API, formKey: "denun" },
  suggestion: { addUrl: ADD_SUGGESTION_API, addTempUrl: ADD_TEMP_SUGGESTION_API, formKey: "suggestion" },
};

const base64UrlDecode = (str) => {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return atob(base64);
};

// Un token illisible est traité comme expiré, par prudence.
const isJwtExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(base64UrlDecode(token.split(".")[1]));
    return !payload.exp || Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

// Vérification de connectivité réelle : navigator.onLine peut être vrai
// (wifi connecté) alors que le serveur est injoignable — un petit appel à
// un endpoint public existant tranche vraiment la question (cf. audit
// section 8 / décision validée point 7).
const isServerReachable = async () => {
  if (!navigator.onLine) return false;
  try {
    const result = await licenseInfo();
    return !!result;
  } catch {
    return false;
  }
};

// Reconstruit la requête multipart attendue par les endpoints /add et
// /save_temp classiques, à partir du payload stocké en IndexedDB (mêmes
// champs que ce que la page d'enregistrement envoie en ligne, moins nos
// 4 champs de bookkeeping locaux : status, createdAt, codeClient, files,
// audios — ces deux derniers redevenant des fichiers multipart réels).
const buildFormData = async (formKey, payload) => {
  const { status, createdAt, codeClient, files, audios, ...meta } = payload;
  const formData = new FormData();
  formData.append(formKey, JSON.stringify(meta));
  for (const dto of files || []) {
    formData.append("files", await base64DtoToFile(dto));
  }
  for (const dto of audios || []) {
    formData.append("audios", await base64DtoToFile(dto));
  }
  return formData;
};

// Doublons d'une réclamation saisie hors ligne : mêmes vérifications que l'écran d'enregistrement en ligne
// (réclamations en cours pour ce téléphone dans l'agence, puis dans les autres agences).
// Lève une erreur si le serveur ne répond pas : la réclamation n'est alors pas envoyée sans vérification.
const chercherDoublons = async (telephone) => {
  const entetes = { headers: { Accept: "application/json", Authorization: "Bearer " + loadItemFromSessionStorage("token") } };
  const tel = encodeURIComponent(telephone);
  const [agence, autres] = await Promise.all([
    axios.get(HOST + "api/v1/claim/checkPhone/" + tel, entetes),
    axios.get(HOST + "api/v1/claim/checkPhoneCrossAgency/" + tel, entetes),
  ]);
  const vus = new Set();
  const resume = (c, autreAgence) => ({
    codeClient: c.codeClient || c.code,
    client: c.clientFirstAndLastName || null,
    date: c.receiptDateTime || null,
    objet: c.objet?.libelle || null,
    agence: c.servicePoint?.libelle || null,
    statut: c.status || null,
    autreAgence,
  });
  return [
    ...(agence.data?.content?.exists ? agence.data.content.claims : []).map((c) => resume(c, false)),
    ...(autres.data?.content?.exists ? autres.data.content.claims : []).map((c) => resume(c, true)),
  ].filter((d) => (vus.has(d.codeClient) ? false : vus.add(d.codeClient)));
};

const classifyError = (error) => {
  if (!error.response) return "Erreur réseau — serveur inaccessible.";
  if (error.response.status >= 500) return "Le serveur a rencontré une erreur (" + error.response.status + ").";
  const businessMessage = error.response.data?.content?.message;
  return businessMessage || "La synchronisation a été refusée (" + error.response.status + ").";
};

// Synchronise une seule entrée de la queue. Ne lève jamais — le Sync Manager
// doit pouvoir enchaîner sur l'item suivant même si celui-ci échoue.
// onSyncingStart() est appelé juste après le passage à SYNCING, avant l'appel
// réseau — sans ça, l'UI ne rafraîchissant qu'à la fin de chaque item, l'état
// "en cours de synchronisation" ne serait jamais visible (cf. retour
// utilisateur : "on veut voir le loading tourner sur chacun").
const syncOneEntry = async (entry, onSyncingStart) => {
  await markSyncing(entry.queueId);
  if (onSyncingStart) onSyncingStart();

  const record = await getDraftRecord(entry.localId);
  if (!record || !record.payload) {
    // Brouillon disparu/corrompu entre-temps : rien à synchroniser, on ne
    // bloque pas dessus indéfiniment.
    await markFailed(entry.queueId, "Brouillon local introuvable.");
    return { success: false };
  }

  const domain = DOMAINS[record.type];
  if (!domain) {
    await markFailed(entry.queueId, "Type de brouillon inconnu : " + record.type);
    return { success: false };
  }

  const isTemp = record.payload.status === "TEMP_SAVED";
  const url = isTemp ? domain.addTempUrl : domain.addUrl;

  // Réclamation saisie hors ligne : la vérification de doublon, impossible sans le serveur, est faite ici.
  // S'il existe déjà des réclamations pour ce téléphone, rien n'est envoyé : l'utilisateur décide dans la
  // page Synchronisation (sauf s'il a déjà choisi « Envoyer quand même »).
  if (record.type === "claim" && !isTemp && !entry.forcer && record.payload.phone) {
    try {
      const doublons = await chercherDoublons(record.payload.phone);
      if (doublons.length > 0) {
        await markDoublon(entry.queueId, doublons);
        return { success: false, doublon: true };
      }
    } catch (error) {
      await markFailed(entry.queueId, "Vérification des doublons impossible : " + classifyError(error));
      return { success: false };
    }
  }

  try {
    const formData = await buildFormData(domain.formKey, record.payload);
    const response = await axios.post(url, formData, {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + loadItemFromSessionStorage("token"),
      },
    });
    if (!response.data.status) {
      throw { response: { status: 400, data: response.data } };
    }
    const serverId = response.data.content?.id ?? null;
    await markDraftRecordSynced(record.code, serverId);
    await markSuccess(entry.queueId);
    return { success: true };
  } catch (error) {
    await markFailed(entry.queueId, classifyError(error));
    return { success: false };
  }
};

// Point d'entrée : traite toute la file en attente. Retourne un résumé
// exploitable par l'UI (menu Synchronisation, Phase 6).
// onItemDone(index, total) est appelé après CHAQUE item traité (succès ou
// échec), pour permettre à l'UI d'afficher une progression réelle plutôt que
// d'attendre la fin de tout le lot (cf. retour utilisateur : "on ne voit pas
// ce qui se synchronise").
//
// La page Synchronisation lance l'envoi à son ouverture et peut s'ouvrir deux fois juste après la
// connexion : un appel fait pendant un envoi en cours rejoint cet envoi au lieu d'en lancer un second.
let envoiEnCours = null;
const suiveurs = new Set();

export const runSync = (onItemDone) => {
  if (onItemDone) suiveurs.add(onItemDone);
  if (!envoiEnCours) {
    envoiEnCours = envoyerLaFile((...etat) => suiveurs.forEach((suivre) => suivre(...etat))).finally(() => {
      envoiEnCours = null;
      suiveurs.clear();
    });
  }
  return envoiEnCours;
};

const envoyerLaFile = async (onItemDone) => {
  const reachable = await isServerReachable();
  if (!reachable) {
    return { ran: false, reason: "OFFLINE" };
  }

  const token = loadItemFromSessionStorage("token");
  if (isJwtExpired(token)) {
    return { ran: false, reason: "SESSION_EXPIRED" };
  }

  const entries = await listPendingQueueEntries();
  let success = 0;
  let failed = 0;
  let doublons = 0;
  for (let i = 0; i < entries.length; i += 1) {
    const result = await syncOneEntry(entries[i], onItemDone);
    if (result.success) success += 1;
    else if (result.doublon) doublons += 1;
    else failed += 1;
    if (onItemDone) onItemDone(i + 1, entries.length);
  }

  if (entries.length > 0) {
    await db.sync_meta.put({ key: "lastSyncAt", value: new Date().toISOString() });
    // Visible même quand c'est le déclenchement automatique (retour online,
    // ou chargement de l'app) qui a lancé la synchro — sinon elle se produit
    // en silence et l'utilisateur ne sait jamais ce qui vient d'être envoyé.
    if (failed === 0 && doublons === 0) {
      notify(success + " élément(s) synchronisé(s) avec succès.", "success");
    } else if (failed === 0) {
      notify(success + " synchronisé(s), " + doublons + " réclamation(s) à vérifier : doublon possible (page Synchronisation).", "warning");
    } else {
      notify(success + " synchronisé(s), " + failed + " en échec" + (doublons ? ", " + doublons + " doublon(s) possible(s) à vérifier" : "") + ".", "error");
    }
  }

  // Rafraîchit les 3 instantanés serveur (app-recsTS/app-densTS/app-sugsTS)
  // dès qu'on est en ligne — même sans rien à synchroniser — pour que le
  // prochain passage en mode Offline montre tout de suite les données à
  // jour (codeClient attribués, réclamations créées ailleurs, etc.) sans
  // attendre que l'utilisateur visite chaque page de liste manuellement.
  Promise.all([
    refreshClaimsSnapshot(),
    refreshDenunciationsSnapshot(),
    refreshSuggestionsSnapshot(),
  ]);

  return { ran: true, total: entries.length, success, failed, doublons };
};

// Réessaie une seule entrée en échec (bouton [Réessayer], Phase 8).
export const retrySyncEntry = async (queueId) => {
  const entry = await db.sync_queue.get(queueId);
  if (!entry) return { success: false };
  return syncOneEntry(entry);
};
