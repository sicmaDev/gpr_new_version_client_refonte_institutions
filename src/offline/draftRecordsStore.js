import { v4 as uuidv4 } from "uuid";
import db from "./db";
import { loadItemFromSessionStorage } from "../Utils/utils";
import { enqueue } from "./syncQueue";

// Remplace le mécanisme localStorage "recs-TS"/"dens-TS"/"sugs-TS" (cf. audit
// "Offline — GPR" du 22/09/2026, section 6/14) : une réclamation/dénonciation/
// suggestion capturée offline est identifiée par son `code`, généré côté
// client (inchangé par rapport à l'ancien code) — c'est aussi la clé
// primaire utilisée dans IndexedDB, ce qui reproduit fidèlement le
// comportement "recs.filter(e => e.code !== data.code)" de remplacement
// d'un brouillon déjà existant.

const pad2 = (n) => (n < 10 ? "0" + n : "" + n);

// Même format que l'ancien code (YYYY-MM-DDTHH:mm:ss), pas un toISOString().
export const offlineTimestamp = () => {
  const d = new Date();
  return (
    d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) +
    "T" + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds())
  );
};

export const generateOfflineCode = (prefix) => {
  const user = loadItemFromSessionStorage("app-user");
  return prefix + uuidv4().substring(0, 5) + "-" + user.servicePointDto.uuid + "-" + user.code;
};

export const getDraftRecord = async (code) => {
  if (!code) return undefined;
  return db.draft_records.get(code);
};

// Marque un brouillon comme synchronisé : lui attribue le serverId renvoyé
// par le backend. À partir de là, listUnsyncedDraftRecords ne le remontera
// plus (il n'apparaîtra plus que via le serveur, sans doublon) — cf. Sync
// Manager, Phase 5.
export const markDraftRecordSynced = async (code, serverId) => {
  await db.draft_records.update(code, { serverId: serverId ?? true });
};

// Écrit (création ou reprise d'un brouillon existant) l'enregistrement dans
// draft_records, et l'ajoute à sync_queue s'il n'y est pas déjà en attente
// — une seule entrée PENDING par brouillon, pas d'empilement si l'utilisateur
// ressauvegarde plusieurs fois avant la prochaine synchro (scope V1 :
// CREATE uniquement, cf. audit section 7).
export const saveDraftRecord = async (type, data) => {
  const code = data.code;
  await db.draft_records.put({
    localId: code,
    type,
    status: data.status,
    code,
    serverId: null,
    payload: data,
    createdAt: data.createdAt,
  });

  await enqueue(code, "CREATE");
  return code;
};

export const listDraftRecordsByStatus = async (type, status) => {
  const rows = await db.draft_records.where("type").equals(type).toArray();
  return rows.filter((r) => r.status === status && r.payload).map((r) => r.payload);
};

// Brouillons capturés localement (online ou offline, peu importe le mode de
// connexion au moment de la saisie) qui n'ont pas encore de serverId, donc
// pas encore remontés par le serveur — à fusionner avec la liste serveur
// pour que l'utilisateur les voie tout de suite, sans attendre la synchro.
// Une fois synchronisé (Phase 5), un enregistrement reçoit un serverId et
// disparaît naturellement de cette liste (il n'apparaît alors plus que via
// le serveur, sans doublon).
export const listUnsyncedDraftRecords = async (type, excludedStatus) => {
  const rows = await db.draft_records.where("type").equals(type).toArray();
  return rows
    .filter((r) => r.status !== excludedStatus && r.serverId == null && r.payload)
    .map((r) => r.payload);
};

// Retire toute entrée corrompue/incomplète (ex: sans `payload`) qui aurait pu
// être écrite par erreur — protège l'affichage des listes contre un crash
// "element is undefined" si jamais une telle entrée existe déjà en base.
export const purgeInvalidDraftRecords = async () => {
  const rows = await db.draft_records.toArray();
  const invalidIds = rows.filter((r) => !r.payload).map((r) => r.localId);
  if (invalidIds.length > 0) {
    await db.draft_records.bulkDelete(invalidIds);
    await db.sync_queue.where("localId").anyOf(invalidIds).delete();
  }
  return invalidIds.length;
};
