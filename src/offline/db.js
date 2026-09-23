import Dexie from "dexie";

// Base IndexedDB remplaçant le stockage offline localStorage
// ("recs-TS"/"dens-TS"/"sugs-TS", cf. audit "Offline — GPR" du 22/09/2026, section 6).
//
// draft_records : une réclamation/dénonciation/suggestion capturée offline
//   (remplace les tableaux recs-TS/dens-TS/sugs-TS ; fichiers/audios en Blob natif,
//   plus de base64).
// sync_queue    : une entrée par opération à synchroniser (aujourd'hui uniquement
//   CREATE, cf. décision de périmètre V1) — permet de suivre l'ordre, le statut
//   individuel et le retry par item.
// sync_meta     : métadonnées globales de synchro (dernière synchro, etc.).
export const db = new Dexie("gpr-offline");

db.version(1).stores({
  draft_records: "localId, type, status, code, serverId",
  sync_queue: "++queueId, localId, status, createdAt",
  sync_meta: "key",
});

export default db;
