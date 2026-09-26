import db from "./db";

// Toutes les opérations sur sync_queue (cf. audit "Offline — GPR" du
// 22/09/2026, section 7). Scope V1 : une seule opération possible,
// "CREATE" — pas d'UPDATE/DELETE offline, pas de conflit.
//
// Cycle de vie d'une entrée : PENDING -> SYNCING -> SUCCESS | FAILED
// Une entrée FAILED n'est jamais supprimée automatiquement (règle explicite
// de l'audit, section 10) — seul un succès la retire de la file.

// Ajoute une entrée en file, sauf s'il y en a déjà une PENDING pour le même
// brouillon (évite d'empiler plusieurs CREATE si l'utilisateur ressauvegarde
// avant la prochaine synchro).
export const enqueue = async (localId, operation = "CREATE") => {
  const queued = await db.sync_queue.where("localId").equals(localId).toArray();
  const hasPending = queued.some((q) => q.status === "PENDING");
  if (hasPending) return;
  await db.sync_queue.add({
    localId,
    operation,
    status: "PENDING",
    attempts: 0,
    lastError: null,
    createdAt: Date.now(),
  });
};

// Entrées à traiter, dans l'ordre d'insertion (queueId auto-incrémenté = FIFO).
export const listPendingQueueEntries = async () => {
  const rows = await db.sync_queue.toArray();
  return rows
    .filter((r) => r.status === "PENDING")
    .sort((a, b) => a.queueId - b.queueId);
};

export const listFailedQueueEntries = async () => {
  const rows = await db.sync_queue.toArray();
  return rows.filter((r) => r.status === "FAILED").sort((a, b) => a.queueId - b.queueId);
};

// Compte utilisé pour le badge du menu Synchronisation (Phase 6).
export const countPendingOrFailed = async () => {
  const rows = await db.sync_queue.toArray();
  return rows.filter((r) => r.status === "PENDING" || r.status === "FAILED").length;
};

export const markSyncing = (queueId) => db.sync_queue.update(queueId, { status: "SYNCING" });

export const markSuccess = (queueId) =>
  db.sync_queue.update(queueId, { status: "SUCCESS", lastError: null });

export const markFailed = async (queueId, errorMessage) => {
  const entry = await db.sync_queue.get(queueId);
  await db.sync_queue.update(queueId, {
    status: "FAILED",
    lastError: errorMessage,
    attempts: (entry?.attempts ?? 0) + 1,
    lastAttemptAt: Date.now(),
  });
};

// Remet une entrée FAILED en PENDING pour un nouveau passage du Sync Manager
// ("Réessayer" / "Réessayer tout", cf. audit section 10).
export const requeue = (queueId) => db.sync_queue.update(queueId, { status: "PENDING" });

export const requeueAllFailed = async () => {
  const failed = await listFailedQueueEntries();
  await Promise.all(failed.map((entry) => requeue(entry.queueId)));
  return failed.length;
};

// Reprise après fermeture du navigateur en cours de synchro : une entrée
// restée à SYNCING n'est jamais un état stable, c'est forcément une synchro
// interrompue — on la remet en PENDING au chargement de l'app (cf. audit
// section 7 : "Fermeture du navigateur pendant sync").
export const recoverStuckSyncingEntries = async () => {
  const rows = await db.sync_queue.toArray();
  const stuck = rows.filter((r) => r.status === "SYNCING");
  await Promise.all(stuck.map((entry) => requeue(entry.queueId)));
  return stuck.length;
};

const TYPE_LABELS = { claim: "Réclamation", denunciation: "Dénonciation", suggestion: "Suggestion" };

// Jointure sync_queue + draft_records pour l'affichage de la page
// Synchronisation (Phase 6) : chaque entrée porte un libellé lisible
// ("Réclamation REC-XXXX" ou, à défaut de codeClient pas encore attribué,
// son code technique).
export const getQueueEntriesForDisplay = async () => {
  const [queueEntries, records] = await Promise.all([
    db.sync_queue.toArray(),
    db.draft_records.toArray(),
  ]);
  const recordsByLocalId = Object.fromEntries(records.map((r) => [r.localId, r]));
  return queueEntries
    .sort((a, b) => a.queueId - b.queueId)
    .map((entry) => {
      const record = recordsByLocalId[entry.localId];
      const typeLabel = TYPE_LABELS[record?.type] || "Élément";
      // Le codeClient (REC-XXXX, court) n'existe qu'après synchro (attribué
      // par le serveur) — avant ça, on n'a que le code technique généré
      // côté client, long et illisible ("rec"+uuid+"-"+uuid+"-"+code) : on
      // n'en affiche que les 6 derniers caractères pour ne pas déborder.
      const code = record?.payload?.code || entry.localId;
      const ref = record?.payload?.codeClient || "#" + String(code).slice(-6);
      return { ...entry, type: record?.type, label: typeLabel + " " + ref };
    });
};

export const getLastSyncAt = async () => {
  const meta = await db.sync_meta.get("lastSyncAt");
  return meta?.value ?? null;
};
