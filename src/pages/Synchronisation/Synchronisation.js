import React, { useCallback, useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { CircularProgress, Dialog, DialogContent, DialogActions, Button, IconButton, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import BlockIcon from "@mui/icons-material/Block";
import SyncIcon from "@mui/icons-material/Sync";
import ReplayIcon from "@mui/icons-material/Replay";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import DescriptionIcon from "@mui/icons-material/Description";
import ViewModeToggle from "../../components/shared/ViewModeToggle";
import DossierFilterChips from "../../components/shared/DossierFilterChips";
import {
  getQueueEntriesForDisplay,
  getLastSyncAt,
  requeueAllFailed,
  accepterDoublon,
  ecarterDoublon,
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
  SYNCING: { color: "var(--gpr-primary, #005081)", bg: "var(--gpr-primary-light, #e0f2fe)", label: "Envoi en cours..." },
  SUCCESS: { color: "#16a34a", bg: "#dcfce7", label: "Synchronisé" },
  FAILED: { color: "#dc2626", bg: "#fee2e2", label: "Échec" },
  DOUBLON: { color: "var(--gpr-primary, #005081)", bg: "var(--gpr-primary-light, #e6f0f6)", label: "Doublon possible" },
  ECARTE: { color: "#64748b", bg: "#f1f5f9", label: "Non envoyée" },
};

const P = "var(--gpr-primary, #005081)";

// Filtres rapides de la liste (mêmes pastilles que les autres listes de la refonte)
const FILTRES = [
  { value: "ALL", label: "Tous" },
  { value: "DOUBLON", label: "À vérifier" },
  { value: "PENDING", label: "En attente" },
  { value: "FAILED", label: "En échec" },
  { value: "ECARTE", label: "Non envoyées" },
];
const CHIPS_CONFIG = {
  DOUBLON: { bg: "var(--gpr-primary-light, #e6f0f6)", color: "var(--gpr-primary, #005081)", border: "var(--gpr-primary, #005081)" },
  PENDING: { bg: "#F1F5F9", color: "#334155", border: "#94A3B8" },
  FAILED: { bg: "#FEF2F2", color: "#B91C1C", border: "#FCA5A5" },
  ECARTE: { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" },
};
const PD = "var(--gpr-primary-dark, #003d62)";

// Réclamations existantes pour le même téléphone : l'utilisateur décide d'envoyer quand même ou non.
const DoublonDialog = ({ entry, onClose, onEnvoyer, onEcarter, enCours }) => (
  <Dialog open={!!entry} onClose={() => !enCours && onClose()} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
    <div style={{ background: `linear-gradient(135deg, ${PD} 0%, ${P} 100%)`, padding: "18px 24px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ContentCopyIcon style={{ color: "#fff", fontSize: 19 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Doublon possible</div>
        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>{entry?.label}</div>
      </div>
      <IconButton onClick={onClose} disabled={enCours} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
        <CloseIcon style={{ fontSize: 16 }} />
      </IconButton>
    </div>
    <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
      <p style={{ margin: "0 0 12px", fontSize: 13.5, color: "#334155", lineHeight: 1.6 }}>
        Cette réclamation a été saisie hors ligne
        {entry?.client ? <> pour <strong>{entry.client}</strong></> : null}
        {entry?.telephone ? <> ({entry.telephone})</> : null}.
        Ce téléphone a déjà {entry?.doublons?.length > 1 ? "des réclamations" : "une réclamation"} sur le serveur :
      </p>
      {entry?.contenu && (
        <div style={{ fontSize: 12.5, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: `3px solid ${P}`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, maxHeight: 90, overflowY: "auto" }}>
          <strong>Saisie hors ligne :</strong> {entry.contenu}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
        {(entry?.doublons || []).map((d) => (
          <div key={d.codeClient} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <strong style={{ fontFamily: "monospace", color: P }}>{d.codeClient}</strong>
              {d.statut && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#f1f5f9", color: "#475569" }}>{d.statut}</span>}
              {d.autreAgence && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--gpr-primary-light, #e6f0f6)", color: "var(--gpr-primary, #005081)" }}>Autre agence</span>}
            </div>
            <div style={{ fontSize: 12.5, color: "#475569", marginTop: 4 }}>
              {[d.client, d.objet, d.agence, d.date ? formatDate(d.date) : null].filter(Boolean).join(" · ")}
            </div>
          </div>
        ))}
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 12.5, color: "#64748b" }}>
        « Ne pas envoyer » garde la réclamation sur cet appareil, dans la liste des non envoyées : vous pourrez encore l'envoyer plus tard.
      </p>
    </DialogContent>
    <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
      <Button onClick={onEcarter} disabled={enCours} variant="outlined" startIcon={<BlockIcon />}
        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, color: P, borderColor: P }}>
        Ne pas envoyer
      </Button>
      <LoadingButton onClick={onEnvoyer} loading={enCours} loadingPosition="start" startIcon={<SendIcon />} variant="contained"
        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: `linear-gradient(135deg, ${PD}, ${P})`, "&:hover": { background: PD } }}>
        Envoyer quand même
      </LoadingButton>
    </DialogActions>
  </Dialog>
);

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
  const [doublonOuvert, setDoublonOuvert] = useState(null);
  const [decisionEnCours, setDecisionEnCours] = useState(false);
  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || "list");
  const [filtre, setFiltre] = useState("ALL");
  const [recherche, setRecherche] = useState("");
  const [enLigne, setEnLigne] = useState(() => navigator.onLine);

  useEffect(() => {
    const maj = () => setEnLigne(navigator.onLine);
    window.addEventListener("online", maj);
    window.addEventListener("offline", maj);
    return () => {
      window.removeEventListener("online", maj);
      window.removeEventListener("offline", maj);
    };
  }, []);

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
  const doublons = entries.filter((e) => e.status === "DOUBLON");
  const ecartees = entries.filter((e) => e.status === "ECARTE");
  // Une fois synchronisé avec succès, un élément n'a plus rien à faire sur
  // cette page — il ne doit plus y rester affiché (cf. retour utilisateur).
  const ordered = [...doublons, ...pending, ...failed, ...ecartees];

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

  // Doublon possible : « Envoyer quand même » (envoi tout de suite, sans nouvelle vérification) ou « Ne pas envoyer ».
  const envoyerQuandMeme = async (entry) => {
    setDecisionEnCours(true);
    try {
      await accepterDoublon(entry.queueId);
      const result = await retrySyncEntry(entry.queueId);
      notify(result.success ? "Réclamation envoyée." : "Envoi en échec — voir le motif.", result.success ? "success" : "error");
    } finally {
      setDecisionEnCours(false);
      setDoublonOuvert(null);
      refresh();
    }
  };
  const nePasEnvoyer = async (entry) => {
    await ecarterDoublon(entry.queueId);
    setDoublonOuvert(null);
    notify("Réclamation non envoyée : elle reste sur cet appareil.", "info");
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
      loading={retryingId === entry.queueId}
      startIcon={<ReplayIcon />}
      onClick={() => handleRetry(entry.queueId)}
      sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, color: P, borderColor: P }}
    >
      Réessayer
    </LoadingButton>
  );

  // Action d'une ligne selon son état
  const ActionLigne = ({ entry }) => {
    if (entry.status === "FAILED") return <RetryButton entry={entry} />;
    if (entry.status === "DOUBLON") {
      return (
        <Button size="small" variant="contained" startIcon={<ContentCopyIcon />} onClick={() => setDoublonOuvert(entry)}
          sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, background: P, "&:hover": { background: PD } }}>
          Vérifier
        </Button>
      );
    }
    if (entry.status === "ECARTE") {
      return (
        <Button size="small" variant="outlined" startIcon={<SendIcon />} onClick={() => setDoublonOuvert(entry)}
          sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, color: "#334155", borderColor: "#cbd5e1" }}>
          Revoir
        </Button>
      );
    }
    return <span style={{ color: "#cbd5e1" }}>—</span>;
  };
  const avecMotif = (s) => s === "FAILED" || s === "DOUBLON" || s === "ECARTE";
  const couleurMotif = (s) => (s === "FAILED" ? "#dc2626" : "#64748b");

  // Filtre par état + recherche (client, téléphone, référence, contenu)
  const groupe = (e) => (e.status === "SYNCING" ? "PENDING" : e.status);
  const termes = recherche.trim().toLowerCase();
  const visibles = ordered.filter((e) =>
    (filtre === "ALL" || groupe(e) === filtre) &&
    (!termes || [e.client, e.telephone, e.label, e.contenu].filter(Boolean).join(" ").toLowerCase().includes(termes))
  );

  const KPI = [
    { key: "DOUBLON", label: "À vérifier · doublon possible", count: doublons.length, icon: ContentCopyIcon, iconBg: "var(--gpr-primary-light, #DBEAFE)", iconColor: P, border: P },
    { key: "PENDING", label: "En attente d'envoi", count: pending.length, icon: HourglassEmptyIcon, iconBg: "#F1F5F9", iconColor: "#475569", border: "#64748B" },
    { key: "FAILED", label: "En échec", count: failed.length, icon: ErrorOutlineIcon, iconBg: "#FEE2E2", iconColor: "#B91C1C", border: "#EF4444" },
    { key: "ECARTE", label: "Non envoyées", count: ecartees.length, icon: BlockIcon, iconBg: "#F1F5F9", iconColor: "#64748B", border: "#94A3B8" },
  ];

  const CelluleClient = ({ entry }) => (
    <div className="min-w-0">
      <div className="text-[13px] font-semibold text-[#0f172a] truncate">{entry.client || "—"}</div>
      {entry.telephone && <div className="text-[12px] text-[#94a3b8]">{entry.telephone}</div>}
    </div>
  );

  return (
    <div style={{ background: "white", minHeight: "calc(100vh - 64px)", margin: "-32px -16px", padding: "32px 16px" }}>
      <DoublonDialog entry={doublonOuvert} enCours={decisionEnCours} onClose={() => setDoublonOuvert(null)}
        onEnvoyer={() => envoyerQuandMeme(doublonOuvert)} onEcarter={() => nePasEnvoyer(doublonOuvert)} />
    <div className="p-6">
      {/* En-tête : titre, état de la connexion, bouton principal */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="text-[22px] font-bold text-[#0f172a] m-0">Synchronisation</h1>
          <p className="text-[#94a3b8] text-[13px] mt-1 mb-0">
            Réclamations, dénonciations et suggestions saisies hors ligne, en attente d'envoi au serveur
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold"
            style={{ height: 34, padding: "0 12px", borderRadius: 999, background: enLigne ? "#ecfdf5" : "#fef2f2", color: enLigne ? "#047857" : "#b91c1c" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: enLigne ? "#10b981" : "#ef4444" }} />
            {enLigne ? "En ligne" : "Hors ligne"} · dernier envoi {lastSyncAt ? formatDate(lastSyncAt) : "jamais"}
          </span>
          {failed.length > 1 && (
            <LoadingButton variant="outlined" onClick={handleRetryAll} startIcon={<ReplayIcon />}
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, color: P, borderColor: P, height: 40 }}>
              Réessayer tout
            </LoadingButton>
          )}
          <LoadingButton
            variant="contained"
            startIcon={<SyncIcon className={isSyncing ? "animate-spin" : ""} />}
            onClick={() => { if (!isSyncing) handleSyncNow(false); }}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, height: 40, px: 2.5, background: P, cursor: isSyncing ? "default" : "pointer", "&:hover": { background: PD } }}
          >
            Synchroniser maintenant
          </LoadingButton>
        </div>
      </div>

      {/* Rappel des doublons à vérifier (une seule ligne) */}
      {doublons.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap mb-5"
          style={{ border: "1px solid #e2e8f0", borderLeft: `4px solid ${P}`, background: "var(--gpr-primary-light, #e6f0f6)", borderRadius: 12, padding: "10px 14px" }}>
          <ContentCopyIcon style={{ color: P, fontSize: 19 }} />
          <div className="flex-1 min-w-[200px] text-[13.5px]" style={{ color: "#334155" }}>
            <strong>{doublons.length} réclamation{doublons.length > 1 ? "s" : ""} à vérifier avant l'envoi</strong>
            <span style={{ color: "#64748b" }}> : le téléphone existe déjà sur le serveur. Les autres éléments partent normalement.</span>
          </div>
          <Button size="small" variant="outlined" onClick={() => setFiltre("DOUBLON")}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, color: P, borderColor: P, background: "#fff", "&:hover": { borderColor: PD, background: "#fff" } }}>
            Voir
          </Button>
        </div>
      )}

      {/* Cartes chiffrées (un clic filtre la liste) */}
      <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
        {KPI.map((k) => {
          const Icon = k.icon;
          const actif = filtre === k.key;
          return (
            <button key={k.key} type="button" onClick={() => setFiltre(actif ? "ALL" : k.key)}
              className="flex items-center gap-4 text-left transition-all hover:-translate-y-0.5"
              style={{
                background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", borderLeft: `4px solid ${k.border}`,
                padding: "16px 20px", cursor: "pointer", font: "inherit",
                boxShadow: actif ? "0 4px 16px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
                outline: actif ? `2px solid ${k.border}` : "none", outlineOffset: -1,
              }}>
              <span className="flex items-center justify-center flex-shrink-0" style={{ width: 44, height: 44, borderRadius: 12, background: k.iconBg }}>
                <Icon style={{ fontSize: 22, color: k.iconColor }} />
              </span>
              <span>
                <span className="block" style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.1, color: "#0f172a" }}>{k.count}</span>
                <span className="block" style={{ fontSize: "0.73rem", color: "#64748b", fontWeight: 500 }}>{k.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtres, recherche, bascule tableau / cartes */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <DossierFilterChips items={ordered.map((e) => ({ status: groupe(e) }))} activeFilter={filtre} onFilterChange={setFiltre}
          filterButtons={FILTRES} statusConfig={CHIPS_CONFIG} />
        <div className="flex items-center gap-2.5 mb-4">
          <TextField size="small" placeholder="Rechercher un client, un téléphone…" value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" style={{ color: "#94a3b8" }} /></InputAdornment> }}
            sx={{ width: 280, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 }, "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: P } }} />
          <ViewModeToggle value={view} onChange={switchView} />
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="text-center text-[#94a3b8] text-[13.5px] py-14 rounded-xl" style={{ background: "white", border: "1px solid #f1f5f9" }}>
          {ordered.length === 0 ? (
            <span className="inline-flex items-center gap-2" style={{ color: "#16a34a", fontWeight: 600 }}>
              <CheckCircleIcon fontSize="small" /> Tout est synchronisé : rien en attente sur cet appareil.
            </span>
          ) : "Aucun élément ne correspond à ce filtre."}
        </div>
      ) : view === "list" ? (
        <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid #f1f5f9" }}>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                {["Type", "Client", "Référence", "État", "Motif"].map((t) => (
                  <th key={t} className="text-left text-[11px] font-bold uppercase px-4 py-3" style={{ color: "#64748b", letterSpacing: ".8px" }}>{t}</th>
                ))}
                <th className="text-right text-[11px] font-bold uppercase px-4 py-3" style={{ color: "#64748b", letterSpacing: ".8px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((entry) => (
                <tr key={entry.queueId} style={{ borderBottom: "1px solid #f1f5f9", background: entry.status === "DOUBLON" ? "var(--gpr-primary-light, #e6f0f6)" : entry.status === "ECARTE" ? "#f8fafc" : "white" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <TypeIcon type={entry.type} />
                      <span className="text-[13px] font-semibold text-[#374151]">{TYPE_META[entry.type]?.label || "Élément"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]"><CelluleClient entry={entry} /></td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-[#475569]">{entry.label}</td>
                  <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                  <td className="px-4 py-3 text-[12.5px] max-w-[260px] truncate" title={entry.lastError || ""} style={{ color: couleurMotif(entry.status) }}>
                    {avecMotif(entry.status) ? entry.lastError : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ActionLigne entry={entry} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {visibles.map((entry) => (
            <div
              key={entry.queueId}
              className="rounded-2xl p-4 flex flex-col"
              style={{
                background: entry.status === "DOUBLON" ? "var(--gpr-primary-light, #e6f0f6)" : "white",
                border: `1.5px solid ${entry.status === "DOUBLON" ? P : "#f1f5f9"}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <TypeIcon type={entry.type} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[#0f172a] truncate">{TYPE_META[entry.type]?.label || "Élément"}</div>
                  <div className="text-[12px] font-mono text-[#94a3b8] truncate">{entry.label}</div>
                </div>
                <StatusBadge status={entry.status} />
              </div>
              {(entry.client || entry.telephone) && <div className="mb-2"><CelluleClient entry={entry} /></div>}
              {avecMotif(entry.status) && (
                <div className="text-[12px] mb-3" style={{ color: couleurMotif(entry.status) }}>{entry.lastError}</div>
              )}
              <div className="mt-auto flex justify-end"><ActionLigne entry={entry} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default Synchronisation;
