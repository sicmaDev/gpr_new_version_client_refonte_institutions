import React, { useCallback, useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { CircularProgress } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import ReplayIcon from "@mui/icons-material/Replay";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import DescriptionIcon from "@mui/icons-material/Description";
import ViewModeToggle from "../../components/shared/ViewModeToggle";
import {
  getQueueEntriesForDisplay,
  getLastSyncAt,
  requeueAllFailed,
} from "../../offline/syncQueue";
import { runSync, retrySyncEntry } from "../../offline/syncManager";
import { formatDate } from "../../Utils/utils";
import { notify } from "../../Utils/alert";

// Page dédiée à la synchronisation des réclamations/dénonciations/suggestions
// capturées offline (cf. audit "Offline — GPR" du 22/09/2026, section 9 —
// adapté en page complète avec bascule tableau/cartes, cf. retour
// utilisateur, plutôt qu'en simple liste compacte).
const VIEW_KEY = "gpr_sync_view_mode";

const TYPE_META = {
  claim: { label: "Réclamation", icon: DescriptionIcon, color: "#0369a1" },
  denunciation: { label: "Dénonciation", icon: ReportProblemIcon, color: "#be123c" },
  suggestion: { label: "Suggestion", icon: TipsAndUpdatesIcon, color: "#7c3aed" },
};

const STATUS_META = {
  PENDING: { color: "#6b7280", bg: "#f1f5f9", label: "En attente" },
  SYNCING: { color: "#1d4ed8", bg: "#e0f2fe", label: "Synchronisation..." },
  SUCCESS: { color: "#16a34a", bg: "#dcfce7", label: "Synchronisé" },
  FAILED: { color: "#dc2626", bg: "#fee2e2", label: "Échec" },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: meta.bg, color: meta.color }}
    >
      {status === "SYNCING" ? <CircularProgress size={11} thickness={6} style={{ color: meta.color }} /> : null}
      {meta.label}
    </span>
  );
};

const Synchronisation = () => {
  const [entries, setEntries] = useState([]);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [retryingId, setRetryingId] = useState(null);
  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || "list");

  const switchView = (v) => {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  };

  const refresh = useCallback(async () => {
    const [list, last] = await Promise.all([getQueueEntriesForDisplay(), getLastSyncAt()]);
    setEntries(list);
    setLastSyncAt(last);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pending = entries.filter((e) => e.status === "PENDING" || e.status === "SYNCING");
  const failed = entries.filter((e) => e.status === "FAILED");
  // Une fois synchronisé avec succès, un élément n'a plus rien à faire sur
  // cette page — il ne doit plus y rester affiché (cf. retour utilisateur).
  const ordered = [...pending, ...failed];

  const handleSyncNow = useCallback(async (silent = false) => {
    setIsSyncing(true);
    try {
      const result = await runSync(() => refresh());
      if (!result.ran) {
        if (!silent) {
          notify(
            result.reason === "SESSION_EXPIRED"
              ? "Votre session a expiré, reconnectez-vous pour synchroniser."
              : "Serveur inaccessible — réessayez une fois en ligne.",
            "error"
          );
        }
      } else if (result.total === 0) {
        if (!silent) notify("Rien à synchroniser.", "info");
      }
    } finally {
      // Toujours exécuté, même en cas d'erreur inattendue — le bouton ne
      // doit jamais rester bloqué en chargement.
      setIsSyncing(false);
      refresh();
    }
  }, [refresh]);

  // Déclenchement automatique dès l'arrivée sur la page (notamment juste
  // après un login en ligne, cf. LoginApi.js qui redirige ici) — "silent"
  // pour ne pas afficher "Rien à synchroniser" à chaque visite quand il n'y
  // a effectivement rien en attente.
  useEffect(() => {
    handleSyncNow(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = async (queueId) => {
    setRetryingId(queueId);
    await refresh();
    const result = await retrySyncEntry(queueId);
    setRetryingId(null);
    notify(result.success ? "Synchronisé avec succès." : "Toujours en échec — voir le motif.", result.success ? "success" : "error");
    refresh();
  };

  const handleRetryAll = async () => {
    await requeueAllFailed();
    await refresh();
    handleSyncNow();
  };

  const TypeIcon = ({ type }) => {
    const meta = TYPE_META[type] || { icon: DescriptionIcon, color: "#64748b" };
    const Icon = meta.icon;
    return (
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{ width: 34, height: 34, borderRadius: 10, background: meta.color + "1a" }}
      >
        <Icon style={{ fontSize: 17, color: meta.color }} />
      </div>
    );
  };

  const RetryButton = ({ entry }) => (
    <LoadingButton
      size="small"
      variant="outlined"
      color="error"
      loading={retryingId === entry.queueId}
      startIcon={<ReplayIcon />}
      onClick={() => handleRetry(entry.queueId)}
      style={{ textTransform: "none" }}
    >
      Réessayer
    </LoadingButton>
  );

  return (
    <div style={{ background: "white", minHeight: "calc(100vh - 64px)", margin: "-32px -16px", padding: "32px 16px" }}>
    <div className="p-6 max-w-[960px] mx-auto">
      <h1 className="text-[22px] font-extrabold text-[#1a2b3c] mb-1.5">Synchronisation</h1>
      <p className="text-[#8a9bb0] text-[13.5px] mb-6">
        Réclamations, dénonciations et suggestions capturées hors-ligne, en attente d'envoi au serveur.
      </p>

      {/* Bandeau d'état global */}
      <div className="rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3" style={{ background: "white", border: "1px solid #e2e8f0" }}>
        <div>
          {pending.length === 0 && failed.length === 0 ? (
            <div className="flex items-center gap-2 text-[#16a34a] font-bold text-[14px]">
              <CheckCircleIcon fontSize="small" /> Synchronisé
            </div>
          ) : failed.length > 0 ? (
            <div className="flex items-center gap-2 text-[#dc2626] font-bold text-[14px]">
              <ErrorOutlineIcon fontSize="small" /> {failed.length} élément(s) en erreur
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#d97706] font-bold text-[14px]">
              <HourglassEmptyIcon fontSize="small" /> {pending.length} modification(s) en attente
            </div>
          )}
          <div className="text-[12px] text-[#8a9bb0] mt-1">
            Dernière synchronisation : {lastSyncAt ? formatDate(lastSyncAt) : "jamais"}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {failed.length > 1 && (
            <LoadingButton variant="outlined" color="error" onClick={handleRetryAll} startIcon={<ReplayIcon />} style={{ textTransform: "none" }}>
              Réessayer tout
            </LoadingButton>
          )}
          <LoadingButton
            variant="contained"
            startIcon={<SyncIcon className={isSyncing ? "animate-spin" : ""} />}
            onClick={() => { if (!isSyncing) handleSyncNow(false); }}
            style={{
              background: "var(--gpr-primary, #005081)",
              textTransform: "none",
              cursor: isSyncing ? "default" : "pointer",
            }}
          >
            Synchroniser maintenant
          </LoadingButton>
          <ViewModeToggle value={view} onChange={switchView} />
        </div>
      </div>

      {ordered.length === 0 ? (
        <div className="text-center text-[#8a9bb0] text-[13.5px] py-14 rounded-xl" style={{ background: "white", border: "1px solid #e5e7eb" }}>
          Aucune modification en attente.
        </div>
      ) : view === "list" ? (
        <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid #e5e7eb" }}>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                <th className="text-left text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide px-4 py-3">Type</th>
                <th className="text-left text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide px-4 py-3">Référence</th>
                <th className="text-left text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide px-4 py-3">Statut</th>
                <th className="text-left text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide px-4 py-3">Motif</th>
                <th className="text-right text-[11px] font-bold text-[#94a3b8] uppercase tracking-wide px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map((entry) => (
                <tr key={entry.queueId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <TypeIcon type={entry.type} />
                      <span className="text-[13px] font-semibold text-[#374151]">{TYPE_META[entry.type]?.label || "Élément"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-mono text-[#1a2b3c]">{entry.label}</td>
                  <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                  <td className="px-4 py-3 text-[12.5px] text-[#dc2626] max-w-[260px] truncate" title={entry.lastError || ""}>
                    {entry.status === "FAILED" ? entry.lastError : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {entry.status === "FAILED" && <RetryButton entry={entry} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {ordered.map((entry) => (
            <div
              key={entry.queueId}
              className="rounded-2xl p-4"
              style={{ background: "white", border: "1.5px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <TypeIcon type={entry.type} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[#1a2b3c] truncate">{TYPE_META[entry.type]?.label || "Élément"}</div>
                  <div className="text-[12px] font-mono text-[#8a9bb0] truncate">{entry.label}</div>
                </div>
              </div>
              <div className="mb-2"><StatusBadge status={entry.status} /></div>
              {entry.status === "FAILED" && (
                <>
                  <div className="text-[12px] text-[#dc2626] mb-3">{entry.lastError}</div>
                  <RetryButton entry={entry} />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default Synchronisation;
