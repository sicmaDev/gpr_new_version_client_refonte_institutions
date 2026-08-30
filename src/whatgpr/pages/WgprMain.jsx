import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Checkbox,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  InputBase,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Refresh,
  SelectAll,
  Close,
  ReportProblem,
  QrCode2,
  LinkOff,
  Gavel,
  Campaign,
  Lightbulb,
  AttachFile,
  CheckCircle,
  RadioButtonUnchecked,
  Sync,
  TaskAlt,
  RestartAlt,
  Search,
  FiberManualRecord,
} from "@mui/icons-material";
import {
  getMessages,
  markRead,
  markConverted,
  disconnect as disconnectApi,
  getQR,
  forceRestart as forceRestartApi,
} from "../api";
import {
  displayNumber,
  mediaUrl,
  formatDayLabel,
  isSameDay,
  fileNameFromPath,
  isSentMessage,
} from "../utils";
import useWhatsappStatus from "../hooks/useWhatsappStatus";
import useSSE from "../hooks/useSSE";
import { notify } from "../../Utils/alert";
import {
  addSelectMessage,
  resetSelectMessage,
  setCurrentInbox,
} from "../../redux/actions/WhatsappActions";
import {
  setPendingWAMediaInfos,
  clearPendingWAMediaInfos,
} from "../pendingWAFiles";

// ─── Palette (alignée sur le thème GPR - var(--gpr-primary) + palette slate) ──
const PRIMARY = "var(--gpr-primary, #005081)";
const PRIMARY_DARK = "var(--gpr-primary-dark, #003d62)";
const PRIMARY_LIGHT = "var(--gpr-primary-light, #00508122)";

const WA = {
  sentBg: "var(--gpr-primary-light, #00508122)",
  recvBg: "#FFFFFF",
  sentText: "#1e293b",
  recvText: "#1e293b",
  sentTime: "#64748b",
  recvTime: "#64748b",
  dateBg: "rgba(30,41,59,0.55)",
  dateText: "#FFFFFF",
  convBg: "#f8fafc",
  headerBg: "#FFFFFF",
};

// Couleurs d'avatar cycliques (basées sur le numéro de téléphone) - palette
// volontairement distincte de la couleur primaire GPR pour ne jamais s'y confondre.
const AVATAR_COLORS = [
  "#1E88E5",
  "#8E24AA",
  "#D81B60",
  "#43A047",
  "#FB8C00",
  "#00ACC1",
  "#5E35B1",
  "#6D4C41",
];

const avatarColor = (phone) => {
  let hash = 0;
  for (let i = 0; i < phone.length; i++)
    hash = phone.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const avatarInitial = (nameOrPhone) => {
  if (!nameOrPhone) return "?";
  const trimmed = nameOrPhone.trim();
  return trimmed[0].toUpperCase();
};

// ─── Médias ──────────────────────────────────────────────────────────────────
const MediaContent = ({ msg, isSent }) => {
  const url = mediaUrl(msg.media_path || msg.mediaPath || msg.content);
  const textColor = isSent ? WA.sentText : WA.recvText;
  switch (msg.type) {
    case "image":
      return (
        <a href={url} target="_blank" rel="noreferrer">
          <img
            src={url}
            alt="img"
            style={{
              maxWidth: 220,
              maxHeight: 200,
              borderRadius: 8,
              display: "block",
            }}
          />
        </a>
      );
    case "video":
      return (
        <video src={url} controls style={{ maxWidth: 220, borderRadius: 8 }} />
      );
    case "audio":
    case "ptt":
      return (
        <audio
          src={url}
          controls
          style={{
            height: 36,
            width: 210,
            filter: isSent ? "invert(1)" : "none",
          }}
        />
      );
    default:
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
            color: textColor,
          }}
        >
          <AttachFile fontSize="small" />
          <Typography variant="body2">
            {fileNameFromPath(msg.content)}
          </Typography>
        </a>
      );
  }
};

// ─── Bulle WhatsApp ──────────────────────────────────────────────────────────
const Bubble = ({ msg, selectionActive, selected, onToggle }) => {
  const isSent = isSentMessage(msg);
  const converted = msg.converted === true || msg.status === "converted";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isSent ? "flex-end" : "flex-start",
        alignItems: "center",
        gap: 0.5,
        mb: 0.4,
        px: 1.5,
        opacity: converted ? 0.6 : 1,
      }}
    >
      {selectionActive && !converted && (
        <Checkbox
          size="small"
          checked={selected}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(msg.id);
          }}
          inputProps={{ "aria-label": "sélectionner message" }}
          sx={{
            p: 0.5,
            order: isSent ? 1 : -1,
            color: PRIMARY,
            "&.Mui-checked": { color: PRIMARY },
          }}
        />
      )}
      <Box
        sx={{
          maxWidth: "65%",
          px: 1.4,
          py: 0.65,
          borderRadius: isSent ? "8px 8px 2px 8px" : "8px 8px 8px 2px",
          bgcolor: converted ? "#f1f5f9" : isSent ? WA.sentBg : WA.recvBg,
          color: isSent ? WA.sentText : WA.recvText,
          boxShadow: "0 1px 3px rgba(0,0,0,0.22)",
          position: "relative",
          border: converted ? "1px solid #10b98155" : "none",
        }}
      >
        {msg.type === "chat" ? (
          <Typography
            component="span"
            sx={{
              display: "block",
              fontSize: 13.5,
              lineHeight: 1.55,
              color: isSent ? WA.sentText : WA.recvText,
              wordBreak: "break-word",
            }}
          >
            {msg.content}
          </Typography>
        ) : (
          <MediaContent msg={msg} isSent={isSent} />
        )}

        <Box
          component="span"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 0.2,
            gap: 1,
          }}
        >
          {converted && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.3,
                bgcolor: "#10b98118",
                borderRadius: 1,
                px: 0.6,
                py: 0.1,
              }}
            >
              <TaskAlt sx={{ fontSize: 10, color: "#10b981" }} />
              <Typography
                component="span"
                sx={{
                  fontSize: 9.5,
                  color: "#10b981",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                Converti
              </Typography>
            </Box>
          )}
          <Typography
            component="span"
            sx={{
              fontSize: 10.5,
              color: WA.sentTime,
              lineHeight: 1,
              ml: "auto",
            }}
          >
            {new Date(msg.timestamp).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Séparateur de date ───────────────────────────────────────────────────────
const DateSep = ({ label }) => (
  <Box sx={{ display: "flex", justifyContent: "center", my: 1.5 }}>
    <Typography
      sx={{
        bgcolor: WA.dateBg,
        color: WA.dateText,
        px: 1.75,
        py: 0.3,
        borderRadius: 10,
        fontSize: 11,
        backdropFilter: "blur(4px)",
      }}
    >
      {label}
    </Typography>
  </Box>
);

// ─── Dialog type de conversion ───────────────────────────────────────────────
const ConvertTypeDialog = ({ open, onClose, onSelect }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ pb: 1 }}>Convertir en plainte</DialogTitle>
    <DialogContent sx={{ pt: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Choisissez le type de plainte à créer depuis cette conversation.
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Gavel />}
          onClick={() => onSelect("reclamation")}
          sx={{ justifyContent: "flex-start", py: 1.25, borderRadius: 2 }}
        >
          Réclamation
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Campaign />}
          color="warning"
          onClick={() => onSelect("denonciation")}
          sx={{ justifyContent: "flex-start", py: 1.25, borderRadius: 2 }}
        >
          Dénonciation
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Lightbulb />}
          color="success"
          onClick={() => onSelect("suggestion")}
          sx={{ justifyContent: "flex-start", py: 1.25, borderRadius: 2 }}
        >
          Suggestion
        </Button>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">
        Annuler
      </Button>
    </DialogActions>
  </Dialog>
);

// ─── Panneau QR ───────────────────────────────────────────────────────────────
const POLL_INTERVAL = 5;

const QRPanel = ({ onClose, embedded = false }) => {
  const [qrSrc, setQrSrc] = React.useState(null);
  const [countdown, setCountdown] = React.useState(POLL_INTERVAL);

  const fetchQR = React.useCallback(async () => {
    try {
      const d = await getQR();
      if (d?.qr) {
        // Le backend (WgprController.getQrCode) retire volontairement le préfixe
        // "data:image/png;base64," avant de renvoyer { qr }, donc on le rajoute ici.
        // Robuste aux deux cas : si jamais un préfixe est déjà présent, on ne le double pas.
        setQrSrc(d.qr.startsWith("data:") ? d.qr : "data:image/png;base64," + d.qr);
        setCountdown(0);
      } else setCountdown(POLL_INTERVAL);
    } catch (err) {
      console.error("[WhatGPR] Erreur récupération QR:", err);
      setCountdown(POLL_INTERVAL);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    fetchQR();
    const tick = setInterval(() => {
      if (cancelled) return;
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchQR();
          return POLL_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [fetchQR]);

  // Contenu commun (utilisé en mode standalone et embedded)
  const content = (
    <Box
      sx={{
        px: embedded ? 0 : 2.5,
        pt: embedded ? 0 : 2,
        pb: embedded ? 0 : 2.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        textAlign="center"
        sx={{ lineHeight: 1.5 }}
      >
        Ouvrez WhatsApp → <b>⋮</b> → <b>Appareils connectés</b> →{" "}
        <b>Connecter un appareil</b>
      </Typography>
      <Box
        sx={{
          width: 240,
          height: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `3px solid ${PRIMARY}`,
          borderRadius: 2,
          p: 1,
          bgcolor: "#fff",
        }}
      >
        {qrSrc ? (
          <img
            src={qrSrc}
            alt="QR Code"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              borderRadius: 4,
            }}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress
                variant="determinate"
                value={(countdown / POLL_INTERVAL) * 100}
                size={80}
                thickness={3}
                sx={{ color: PRIMARY, position: "absolute" }}
              />
              <CircularProgress
                variant="determinate"
                value={100}
                size={80}
                thickness={3}
                sx={{ color: PRIMARY_LIGHT, position: "absolute" }}
              />
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: PRIMARY,
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                {countdown}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              Recherche du QR…
            </Typography>
          </Box>
        )}
      </Box>
      {qrSrc && (
        <Box
          sx={{
            bgcolor: "#f59e0b18",
            border: "1px solid #f59e0b55",
            borderRadius: 2,
            px: 2,
            py: 0.75,
            width: "100%",
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#d97706", fontWeight: 600 }}
          >
            ⏳ En attente du scan…
          </Typography>
        </Box>
      )}
      <Typography variant="caption" color="text.disabled" textAlign="center">
        Le QR se rafraîchit automatiquement toutes les 5 secondes.
      </Typography>
    </Box>
  );

  if (embedded) return content;

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f1f5f9",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          width: 300,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        <Box
          sx={{
            bgcolor: PRIMARY,
            px: 2,
            py: 1.25,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <QrCode2 sx={{ color: PRIMARY, fontSize: 20 }} />
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
              Scanner le QR Code
            </Typography>
          </Box>
          <Tooltip title="Fermer">
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: "rgba(255,255,255,0.7)",
                "&:hover": { color: "#fff" },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        {content}
      </Paper>
    </Box>
  );
};

// ─── Card progression ─────────────────────────────────────────────────────────
const ConnectionCard = ({ phase, syncState }) => {
  const steps = [
    { key: "connecting", label: "Démarrage de Chrome" },
    { key: "loading", label: "Chargement de WhatsApp Web" },
    { key: "authenticated", label: "Authentification" },
    { key: "syncing", label: "Synchronisation des messages" },
  ];
  const phaseOrder = {
    connecting: 0,
    loading: 1,
    authenticated: 2,
    syncing: 3,
    done: 4,
  };
  const current = phaseOrder[phase] ?? 0;

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f1f5f9",
      }}
    >
      <Paper
        elevation={4}
        sx={{ p: 4, borderRadius: 3, width: 340, maxWidth: "90%" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              bgcolor: PRIMARY_LIGHT,
              p: 1,
              borderRadius: 2,
              display: "flex",
            }}
          >
            <QrCode2 sx={{ color: PRIMARY, fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Connexion WhatsApp
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {phase === "syncing"
                ? `${syncState.current} / ${syncState.total} conversations`
                : "Veuillez patienter..."}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
          {steps.map((step, idx) => {
            const done = idx < current;
            const active = idx === current;
            return (
              <Box
                key={step.key}
                sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
              >
                {done ? (
                  <CheckCircle sx={{ color: PRIMARY, fontSize: 20 }} />
                ) : active ? (
                  <CircularProgress
                    size={18}
                    thickness={5}
                    sx={{ color: PRIMARY }}
                  />
                ) : (
                  <RadioButtonUnchecked sx={{ color: "#cbd5e1", fontSize: 20 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: active ? 600 : 400,
                    color: done
                      ? "text.secondary"
                      : active
                        ? "text.primary"
                        : "#94a3b8",
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
        <LinearProgress
          variant={
            phase === "syncing" && syncState.total > 0
              ? "determinate"
              : "indeterminate"
          }
          value={
            syncState.total > 0
              ? Math.round((syncState.current / syncState.total) * 100)
              : 0
          }
          sx={{
            borderRadius: 2,
            height: 5,
            bgcolor: PRIMARY_LIGHT,
            "& .MuiLinearProgress-bar": { bgcolor: PRIMARY },
          }}
        />
        {phase === "syncing" && syncState.total > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.75, display: "block", textAlign: "right" }}
          >
            {Math.round((syncState.current / syncState.total) * 100)}% -{" "}
            {syncState.messages} messages récupérés
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

const FORM_ROUTES = {
  reclamation: "/reclamations/enregistrement",
  denonciation: "/denonciations/enregistrement",
  suggestion: "/suggestions/enregistrement",
};

// ─── Page principale ──────────────────────────────────────────────────────────
const WgprMain = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const bottomRef = useRef(null);
  const msgContainerRef = useRef(null);

  const [converted, setConverted] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectionActive, setSelectionActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  // Recherche + filtre
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("tous");

  const { status, setStatus } = useWhatsappStatus();
  const [showQR, setShowQR] = useState(false);
  const [showConnectPopup, setShowConnectPopup] = useState(false);
  const [connectCountdown, setConnectCountdown] = useState(30);
  const countdownRef = useRef(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [forceRestarting, setForceRestarting] = useState(false);
  const [connectingStuckSince, setConnectingStuckSince] = useState(null);
  const isStuck =
    connectingStuckSince && Date.now() - connectingStuckSince > 2 * 60 * 1000;

  const [syncState, setSyncState] = useState({
    phase: "idle",
    current: 0,
    total: 0,
    messages: 0,
  });
  const syncDoneTimer = useRef(null);

  // ── Chargement ──
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getMessages("all");
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      setConverted(list.filter((m) => m.status === "converted").length);
    } catch (err) {
      console.error("[WhatGPR] Erreur chargement statistiques:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    setMsgLoading(true);
    try {
      const data = await getMessages("all");
      setMessages(Array.isArray(data) ? data : (data?.content ?? []));
    } catch (err) {
      console.error("[WhatGPR] Erreur chargement messages:", err);
      notify("Erreur chargement messages", "error");
    } finally {
      setMsgLoading(false);
    }
  }, []);

  const loadAll = useCallback(() => {
    loadStats();
    loadMessages();
  }, [loadStats, loadMessages]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);
  // Filet de sécurité : rafraîchissement périodique indépendant du SSE - si le flux
  // temps réel s'est arrêté silencieusement (avant sa propre reconnexion), les messages
  // finissent quand même par apparaître sans action de l'utilisateur.
  useEffect(() => {
    const interval = setInterval(loadAll, 60000);
    return () => clearInterval(interval);
  }, [loadAll]);
  // Scroll uniquement dans le container messages - ne touche pas le scroll de la page
  useEffect(() => {
    if (msgContainerRef.current)
      msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
  }, [selectedContact, messages]);

  // ── Réactions statut ──
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (prev === status) return;
    if (prev !== "connected" && status === "connected") {
      setShowQR(false);
      setConnectingStuckSince(null);
      // Ferme aussi le popup de connexion ici (pas seulement dans le handler SSE
      // wa_status) : si l'événement SSE 'connected' est manqué, ce useEffect reste
      // le seul déclencheur fiable (status est aussi mis à jour par le polling de
      // secours) - sans ça, le popup restait ouvert indéfiniment après un scan réussi.
      setShowConnectPopup(false);
      if (countdownRef.current) clearInterval(countdownRef.current);
      notify("✅ WhatsApp connecté - synchronisation en cours...", "success");
      // Fallback : si sync_progress:done est manqué, masquer la carte après 10s
      setTimeout(
        () =>
          setSyncState((s) =>
            ["connecting", "authenticated", "syncing"].includes(s.phase)
              ? { phase: "idle", current: 0, total: 0, messages: 0 }
              : s,
          ),
        10000,
      );
    }
    if (prev !== "connecting" && status === "connecting") {
      setSyncState({ phase: "connecting", current: 0, total: 0, messages: 0 });
      setConnectingStuckSince(Date.now());
    }
    if (status === "connected" || status === "disconnected")
      setConnectingStuckSince(null);
  }, [status]);

  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (!connectingStuckSince) return;
    const t = setInterval(() => forceUpdate((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, [connectingStuckSince]);

  // ── SSE ──
  useSSE({
    wa_status: (d) => {
      setStatus(d.status);
      if (d.status === "connecting")
        setSyncState({
          phase: "connecting",
          current: 0,
          total: 0,
          messages: 0,
        });
      else if (d.status === "qr_pending") {
        // QR prêt → arrêter le décompte, afficher le QR DANS le popup
        if (countdownRef.current) clearInterval(countdownRef.current);
        setConnectCountdown(0); // 0 = phase QR
        setSyncState({ phase: "idle", current: 0, total: 0, messages: 0 });
      } else if (d.status === "connected") {
        setShowConnectPopup(false);
        if (countdownRef.current) clearInterval(countdownRef.current);
        setConnectCountdown(30); // reset pour le prochain cycle
        setShowQR(false);
        loadAll();
        // Si sync_progress:done est manqué, masquer la carte après 5s
        setTimeout(
          () =>
            setSyncState((s) =>
              ["connecting", "authenticated", "syncing"].includes(s.phase)
                ? { phase: "idle", current: 0, total: 0, messages: 0 }
                : s,
            ),
          5000,
        );
      } else if (d.status === "disconnected")
        setSyncState({ phase: "idle", current: 0, total: 0, messages: 0 });
    },
    sync_progress: (d) => {
      if (d.done) {
        setSyncState({
          phase: "done",
          current: d.total,
          total: d.total,
          messages: d.messages,
        });
        loadAll();
        if (syncDoneTimer.current) clearTimeout(syncDoneTimer.current);
        syncDoneTimer.current = setTimeout(
          () =>
            setSyncState({ phase: "idle", current: 0, total: 0, messages: 0 }),
          3000,
        );
      } else {
        setSyncState({
          phase: "syncing",
          current: d.current,
          total: d.total,
          messages: d.messages,
        });
      }
    },
    new_message: (d) => {
      // Le payload contient déjà le message complet (transmis tel quel par Node) -
      // l'insérer directement dans l'état évite un aller-retour HTTP complet à chaque
      // message, et la race condition qui en découlait (deux GET /messages concurrents
      // pouvant s'écraser dans le mauvais ordre et faire disparaître un message reçu).
      if (!d || d.id == null) {
        loadAll();
        return;
      } // payload inattendu → repli sûr
      setMessages((prev) => {
        const incoming = {
          id: d.id,
          message_id: d.message_id,
          from_number: d.from_number,
          from_name: d.from_name,
          content: d.content,
          type: d.type,
          media_path: d.media_path,
          timestamp: d.timestamp,
          read: d.read ?? false,
          sent: false, // toujours false aujourd'hui : Node ne diffuse jamais de message sortant
          status: d.status,
          complaint_id: null,
          created_at: null,
        };
        const exists = prev.some((m) => m.id === incoming.id);
        return exists
          ? prev.map((m) => (m.id === incoming.id ? { ...m, ...incoming } : m))
          : [...prev, incoming];
      });
    },
    survey_response: () => {
      loadStats();
    },
  });

  const startCountdown = (seconds = 30) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setConnectCountdown(seconds);
    countdownRef.current = setInterval(() => {
      setConnectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartConnection = () => {
    setShowConnectPopup(true);
    if (status === "qr_pending") {
      // QR déjà prêt → aller directement à la phase QR (countdown = 0)
      if (countdownRef.current) clearInterval(countdownRef.current);
      setConnectCountdown(0);
    } else {
      setSyncState({ phase: "connecting", current: 0, total: 0, messages: 0 });
      startCountdown(30);
    }
  };

  const handleForceRestart = async () => {
    setForceRestarting(true);
    try {
      await forceRestartApi();
      setConnectingStuckSince(null);
      setSyncState({ phase: "connecting", current: 0, total: 0, messages: 0 });
      notify("🔄 Reconnexion forcée - veuillez patienter...", "info");
    } catch (err) {
      console.error("[WhatGPR] Erreur reconnexion forcée:", err);
      notify("Erreur lors de la reconnexion forcée", "error");
    } finally {
      setForceRestarting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectApi();
      setStatus("disconnected");
      notify("WhatsApp déconnecté avec succès", "success");
    } catch (err) {
      console.error("[WhatGPR] Erreur déconnexion:", err);
      notify("Erreur lors de la déconnexion", "error");
    } finally {
      setDisconnecting(false);
    }
  };

  // ── Contacts groupés ──
  const contacts = useMemo(() => {
    const map = {};
    messages.forEach((m) => {
      if (!map[m.from_number]) map[m.from_number] = [];
      map[m.from_number].push(m);
    });
    // Pas de filtre par "message entrant présent" : toute conversation listée ici a par
    // construction au moins un message reçu (le backend ne stocke jamais de message
    // sortant), donc un tel filtre serait soit un no-op, soit un risque de masquer
    // silencieusement une conversation si cette hypothèse change un jour côté backend.
    return Object.entries(map)
      .map(([phone, msgs]) => {
        const sorted = [...msgs].sort((a, b) => a.timestamp - b.timestamp);
        const unread = msgs.filter(
          (m) => !m.read && !m.converted && m.status !== "converted",
        ).length;
        // Utilise le nom du contact WhatsApp si disponible (pushname/nom enregistré sur le téléphone)
        const name = msgs.find((m) => m.from_name)?.from_name || null;
        return {
          phone,
          name,
          messages: sorted,
          unread,
          last: sorted[sorted.length - 1],
        };
      })
      .sort((a, b) => (b.last?.timestamp ?? 0) - (a.last?.timestamp ?? 0));
  }, [messages]);

  // ── Filtrage sidebar ──
  const nonLusCount = useMemo(
    () => contacts.filter((c) => c.unread > 0).length,
    [contacts],
  );
  const urgentsCount = useMemo(
    () => contacts.filter((c) => c.last && !c.last.sent && c.unread > 0).length,
    [contacts],
  );

  const filteredContacts = useMemo(() => {
    let list = contacts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.phone.toLowerCase().includes(q) ||
          (c.name && c.name.toLowerCase().includes(q)),
      );
    }
    if (activeFilter === "non_lus") list = list.filter((c) => c.unread > 0);
    if (activeFilter === "urgents")
      list = list.filter((c) => c.last && !c.last.sent && c.unread > 0);
    return list;
  }, [contacts, searchQuery, activeFilter]);

  const conversation = useMemo(() => {
    if (!selectedContact) return [];
    return contacts.find((c) => c.phone === selectedContact)?.messages ?? [];
  }, [contacts, selectedContact]);

  const conversationGrouped = useMemo(() => {
    const result = [];
    conversation.forEach((msg, i) => {
      const prev = conversation[i - 1];
      if (!prev || !isSameDay(prev.timestamp, msg.timestamp))
        result.push({
          type: "date",
          label: formatDayLabel(msg.timestamp),
          id: `d${msg.timestamp}`,
        });
      result.push({ type: "msg", msg });
    });
    return result;
  }, [conversation]);

  const handleSelectContact = async (phone) => {
    setSelectedContact(phone);
    setSelectionActive(false);
    setSelectedIds([]);
    const unread = messages.filter((m) => m.from_number === phone && !m.read);
    await Promise.all(unread.map((m) => markRead(m.id)));
    if (unread.length)
      setMessages((prev) =>
        prev.map((m) => (m.from_number === phone ? { ...m, read: true } : m)),
      );
  };

  const toggleMsg = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const selectAll = () => setSelectedIds(conversation.map((m) => m.id));
  const cancelSelection = () => {
    setSelectionActive(false);
    setSelectedIds([]);
  };

  const selectedMessages = useMemo(
    () => conversation.filter((m) => selectedIds.includes(m.id)),
    [conversation, selectedIds],
  );

  const handleConvert = async (type) => {
    const ids = selectedMessages.map((m) => m.id);
    dispatch(resetSelectMessage());
    const inboxData = { phone: displayNumber(selectedContact) };
    // La persistance sessionStorage est gérée par le reducer lui-même (voir
    // WhatsappReducer.js) - plus besoin de la dupliquer manuellement ici.
    dispatch(setCurrentInbox(inboxData));

    const sorted = [...selectedMessages].sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    sorted.forEach((msg) => {
      if (msg.type && msg.type !== "chat") return;
      const m = {
        message_id: msg.message_id || "",
        content: msg.content || "",
        type: "chat",
        date: String(msg.timestamp),
      };
      dispatch(addSelectMessage(m));
    });
    const mediaMessages = sorted.filter(
      (m) => m.type && m.type !== "chat" && m.media_path,
    );
    clearPendingWAMediaInfos();
    if (mediaMessages.length > 0) {
      mediaMessages.forEach((msg) => {
        const downloadUrl = mediaUrl(msg.media_path);
        const ext = msg.media_path?.split(".").pop() || "";
        const typeLabel = {
          audio: "audio",
          ptt: "vocal",
          image: "image",
          video: "video",
          document: "document",
        };
        const cleanName = msg.content
          ? msg.content
          : `${typeLabel[msg.type] || "fichier"}.${ext}`;
        const m = {
          message_id: "false_wgpr_" + (msg.id || ""),
          content: cleanName,
          url: downloadUrl,
          type: msg.type,
          date: String(msg.timestamp),
        };
        dispatch(addSelectMessage(m));
      });
      setPendingWAMediaInfos(
        mediaMessages.map((m) => ({
          url: mediaUrl(m.media_path),
          filename: m.content || m.media_path,
        })),
      );
    }
    let markedOk = true;
    try {
      await markConverted(ids);
    } catch (err) {
      markedOk = false;
      console.error("[WhatGPR] Erreur marquage converti:", err);
      notify(
        "Erreur lors du marquage des messages comme convertis - ils resteront visibles comme non traités",
        "error",
      );
    }
    setShowConvertDialog(false);
    cancelSelection();
    // N'affiche "converti" localement que si le serveur l'a réellement enregistré -
    // sinon l'agent perdrait la trace de messages non marqués côté serveur.
    if (markedOk) {
      setMessages((prev) =>
        prev.map((m) => (ids.includes(m.id) ? { ...m, converted: true } : m)),
      );
    }
    history.push(FORM_ROUTES[type]);
  };

  const selectedContactData = useMemo(
    () => contacts.find((c) => c.phone === selectedContact),
    [contacts, selectedContact],
  );
  const showProgressCard = ["connecting", "authenticated", "syncing"].includes(
    syncState.phase,
  );

  return (
    <Box
      sx={{
        px: { xs: 1, md: 2 },
        pt: 1.5,
        pb: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <ConvertTypeDialog
        open={showConvertDialog}
        onClose={() => setShowConvertDialog(false)}
        onSelect={handleConvert}
      />

      {/* ── Popup : décompte → QR ── */}
      <Dialog
        open={showConnectPopup}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: PRIMARY,
            px: 2.5,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <QrCode2 sx={{ color: PRIMARY, fontSize: 22 }} />
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
              {connectCountdown > 0
                ? "Connexion WhatsApp en cours..."
                : "Scanner le QR Code"}
            </Typography>
          </Box>
          {connectCountdown === 0 && (
            <IconButton
              size="small"
              onClick={() => setShowConnectPopup(false)}
              sx={{
                color: "rgba(255,255,255,0.7)",
                "&:hover": { color: "#fff" },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>

        <DialogContent sx={{ pt: 3, pb: 2.5 }}>
          {connectCountdown > 0 ? (
            /* ── Phase 1 : décompte ── */
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  position: "relative",
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={120}
                  thickness={4}
                  sx={{ color: PRIMARY_LIGHT, position: "absolute" }}
                />
                <CircularProgress
                  variant="determinate"
                  value={(connectCountdown / 30) * 100}
                  size={120}
                  thickness={4}
                  sx={{ color: PRIMARY, position: "absolute" }}
                />
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      fontSize: 34,
                      fontWeight: 800,
                      color: PRIMARY,
                      lineHeight: 1,
                    }}
                  >
                    {connectCountdown}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                    secondes
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: 14, color: "#64748b", mb: 1 }}>
                Démarrage de Chrome et chargement de WhatsApp Web...
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                Le QR Code apparaîtra automatiquement dès qu'il sera prêt.
              </Typography>
            </Box>
          ) : (
            /* ── Phase 2 : QR Code ── */
            <QRPanel onClose={() => setShowConnectPopup(false)} embedded />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Header ── */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 2.5,
          px: 2.5,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        {/* Titre + tabs */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 2 }}>
            <Typography
              sx={{ fontWeight: 700, fontSize: 15, color: PRIMARY }}
            >
              Plaintes WhatsApp
            </Typography>
          </Box>
          <Box
            sx={{
              width: "1px",
              height: 26,
              bgcolor: "#e2e8f0",
              mx: 1,
              flexShrink: 0,
            }}
          />
          {/* Tab "Plaintes Créées" */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, pl: 1 }}>
            <Typography sx={{ fontSize: 13.5, color: "#64748b", fontWeight: 500 }}>
              Plaintes créées
            </Typography>
            <Box
              sx={{
                bgcolor: PRIMARY,
                color: "#fff",
                borderRadius: "10px",
                px: 0.9,
                minWidth: 22,
                textAlign: "center",
                fontSize: 11.5,
                fontWeight: 700,
                lineHeight: "20px",
                height: 20,
              }}
            >
              {statsLoading ? "…" : (converted ?? 0)}
            </Box>
          </Box>
        </Box>

        {/* Statut + actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              bgcolor:
                status === "connected"
                  ? "#10b98118"
                  : status === "connecting" || status === "authenticated"
                    ? "#f59e0b18"
                    : "#ef444418",
              border: `1px solid ${status === "connected" ? "#10b98155" : status === "connecting" || status === "authenticated" ? "#f59e0b55" : "#ef444455"}`,
              borderRadius: 10,
              px: 1.25,
              py: 0.3,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor:
                  status === "connected"
                    ? "#10b981"
                    : status === "connecting" || status === "authenticated"
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color:
                  status === "connected"
                    ? "#10b981"
                    : status === "connecting" || status === "authenticated"
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            >
              {status === "connected"
                ? "Connecté"
                : status === "connecting" || status === "authenticated"
                  ? "Connexion..."
                  : "Déconnecté"}
            </Typography>
          </Box>

          {status === "connected" ? (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={
                disconnecting ? (
                  <CircularProgress size={13} />
                ) : (
                  <LinkOff sx={{ fontSize: 15 }} />
                )
              }
              onClick={handleDisconnect}
              disabled={disconnecting}
              sx={{ fontSize: 12, py: 0.4, borderRadius: 2 }}
            >
              Déconnecter
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              startIcon={<QrCode2 sx={{ fontSize: 16 }} />}
              onClick={handleStartConnection}
              sx={{
                bgcolor: PRIMARY,
                "&:hover": { bgcolor: PRIMARY_DARK },
                fontSize: 12,
                py: 0.4,
                borderRadius: 2,
              }}
            >
              Connecter WhatsApp
            </Button>
          )}

          {isStuck && (
            <Tooltip title="La connexion semble bloquée - cliquez pour forcer la reconnexion">
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={
                  forceRestarting ? (
                    <CircularProgress size={13} />
                  ) : (
                    <RestartAlt sx={{ fontSize: 15 }} />
                  )
                }
                onClick={handleForceRestart}
                disabled={forceRestarting}
                sx={{ fontSize: 12, py: 0.4, borderRadius: 2 }}
              >
                Forcer la reconnexion
              </Button>
            </Tooltip>
          )}

          <Tooltip title="Rafraîchir">
            <IconButton
              size="small"
              onClick={loadAll}
              disabled={msgLoading}
              sx={{ color: "#64748b" }}
            >
              <Refresh
                fontSize="small"
                sx={{
                  animation: msgLoading ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    from: { transform: "rotate(0deg)" },
                    to: { transform: "rotate(360deg)" },
                  },
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Bannière sync */}
      {syncState.phase === "done" && (
        <Box
          sx={{
            bgcolor: PRIMARY_LIGHT,
            border: `1px solid ${PRIMARY}`,
            borderRadius: 2,
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Sync sx={{ color: PRIMARY, fontSize: 18 }} />
          <Typography
            variant="body2"
            sx={{ color: PRIMARY, fontWeight: 600 }}
          >
            Synchronisation terminée - {syncState.messages} messages chargés
          </Typography>
        </Box>
      )}

      {/* ── Interface principale ── */}
      <Box
        sx={{
          borderRadius: 2.5,
          overflow: "hidden",
          height: "calc(100vh - 175px)",
          display: "flex",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* ── Sidebar contacts (blanc) ── */}
        <Box
          sx={{
            width: 300,
            flexShrink: 0,
            bgcolor: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          {/* Header sidebar */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #e2e8f0" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.25,
              }}
            >
              <Typography
                sx={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}
              >
                Conversations
              </Typography>
              <Box
                sx={{
                  bgcolor: PRIMARY,
                  color: "#fff",
                  borderRadius: "10px",
                  px: 0.9,
                  minWidth: 22,
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: "20px",
                  height: 20,
                }}
              >
                {contacts.length}
              </Box>
            </Box>

            {/* Barre de recherche */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "#f1f5f9",
                borderRadius: 2,
                px: 1.25,
                py: 0.5,
                border: "1px solid #e2e8f0",
              }}
            >
              <Search sx={{ fontSize: 17, color: "#94a3b8" }} />
              <InputBase
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: 13, "& input": { p: 0 } }}
              />
              {searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery("")}
                  sx={{ p: 0.25 }}
                >
                  <Close sx={{ fontSize: 15, color: "#94a3b8" }} />
                </IconButton>
              )}
            </Box>

            {/* Filtres */}
            <Box
              sx={{ display: "flex", gap: 0.75, mt: 1.25, flexWrap: "wrap" }}
            >
              {[
                { key: "tous", label: "Tous" },
                {
                  key: "non_lus",
                  label: `Non lus${nonLusCount > 0 ? ` (${nonLusCount})` : ""}`,
                },
                {
                  key: "urgents",
                  label: `Urgents${urgentsCount > 0 ? ` (${urgentsCount})` : ""}`,
                },
              ].map((f) => (
                <Box
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  sx={{
                    px: 1.25,
                    py: 0.3,
                    borderRadius: 10,
                    cursor: "pointer",
                    bgcolor: activeFilter === f.key ? PRIMARY : "#f1f5f9",
                    color: activeFilter === f.key ? "#fff" : "#64748b",
                    fontSize: 11.5,
                    fontWeight: activeFilter === f.key ? 700 : 500,
                    transition: "all 0.15s",
                    "&:hover": {
                      bgcolor: activeFilter === f.key ? PRIMARY : "#e2e8f0",
                    },
                  }}
                >
                  {f.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Liste des contacts */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#e2e8f0",
                borderRadius: 2,
              },
            }}
          >
            {msgLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress size={24} sx={{ color: PRIMARY }} />
              </Box>
            ) : filteredContacts.length === 0 ? (
              <Typography
                sx={{
                  color: "#94a3b8",
                  p: 2.5,
                  textAlign: "center",
                  fontSize: 13,
                }}
              >
                {searchQuery ? "Aucun résultat" : "Aucune conversation"}
              </Typography>
            ) : (
              filteredContacts.map((c) => {
                const isSelected = selectedContact === c.phone;
                const lastMsg = c.last;
                const lastPreview = lastMsg
                  ? lastMsg.type === "chat"
                    ? lastMsg.content
                    : "📎 Fichier"
                  : "";

                return (
                  <Box
                    key={c.phone}
                    onClick={() => handleSelectContact(c.phone)}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      px: 1.75,
                      py: 1.25,
                      cursor: "pointer",
                      gap: 1.25,
                      bgcolor: isSelected ? PRIMARY_LIGHT : "#FFFFFF",
                      borderLeft: isSelected
                        ? `3px solid ${PRIMARY}`
                        : "3px solid transparent",
                      borderBottom: "1px solid #f1f5f9",
                      "&:hover": {
                        bgcolor: isSelected ? PRIMARY_LIGHT : "#f8fafc",
                      },
                      transition: "background 0.1s",
                    }}
                  >
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        bgcolor: avatarColor(c.phone),
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {avatarInitial(c.name || c.phone)}
                    </Avatar>

                    {/* Contenu */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Ligne 1 : nom (ou numéro) + heure */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 0.2,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13.5,
                            fontWeight: c.unread ? 700 : 500,
                            color: "#1e293b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 130,
                          }}
                        >
                          {c.name || displayNumber(c.phone)}
                        </Typography>
                        {lastMsg?.timestamp && (
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: c.unread ? PRIMARY : "#94a3b8",
                              fontWeight: c.unread ? 600 : 400,
                              flexShrink: 0,
                            }}
                          >
                            {new Date(lastMsg.timestamp).toLocaleTimeString(
                              "fr-FR",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </Typography>
                        )}
                      </Box>

                      {/* Ligne 2 : aperçu message */}
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#64748b",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          mb: 0.5,
                        }}
                      >
                        {lastPreview || "-"}
                      </Typography>

                      {/* Ligne 3 : point non lu */}
                      {c.unread > 0 && (
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Box
                            sx={{
                              bgcolor: PRIMARY,
                              color: "#fff",
                              borderRadius: "50%",
                              width: 18,
                              height: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {c.unread > 99 ? "99+" : c.unread}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>

        {/* ── Zone conversation ── */}
        {showQR ? (
          <QRPanel onClose={() => setShowQR(false)} />
        ) : showProgressCard ? (
          <ConnectionCard phase={syncState.phase} syncState={syncState} />
        ) : !selectedContact ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#f8fafc",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QrCode2 sx={{ color: "#94a3b8", fontSize: 36 }} />
            </Box>
            <Typography sx={{ color: "#94a3b8", fontSize: 14 }}>
              Sélectionnez une conversation
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            {/* Header conversation */}
            <Box
              sx={{
                px: 2,
                py: 1.25,
                bgcolor: "#FFFFFF",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              {/* Avatar + nom + phone */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  minWidth: 0,
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    bgcolor: avatarColor(selectedContact),
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {avatarInitial(selectedContactData?.name || selectedContact)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 14.5,
                      color: "#1e293b",
                      lineHeight: 1.3,
                    }}
                  >
                    {selectedContactData?.name ||
                      displayNumber(selectedContact)}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.2 }}
                  >
                    {displayNumber(selectedContact)}
                  </Typography>
                </Box>
              </Box>

              {/* Boutons de statut + sélection */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {/* Bouton sélectionner / mode sélection */}
                {!selectionActive ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setSelectionActive(true)}
                    sx={{
                      fontSize: 11.5,
                      py: 0.4,
                      borderRadius: 1.5,
                      borderColor: "#e2e8f0",
                      color: "#64748b",
                      "&:hover": { borderColor: PRIMARY, color: PRIMARY },
                    }}
                  >
                    Sélectionner
                  </Button>
                ) : (
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <Typography
                      sx={{
                        bgcolor: "#f59e0b18",
                        color: "#d97706",
                        border: "1px solid #f59e0b55",
                        px: 1.25,
                        py: 0.3,
                        borderRadius: 1,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {selectedIds.length} sél. ·{" "}
                      {selectedMessages.filter((m) => m.type !== "chat").length}{" "}
                      pj
                    </Typography>
                    <Tooltip title="Tout sélectionner">
                      <IconButton
                        size="small"
                        onClick={selectAll}
                        sx={{ color: "#64748b" }}
                      >
                        <SelectAll fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {selectedIds.length > 0 && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ReportProblem sx={{ fontSize: 14 }} />}
                        onClick={() => setShowConvertDialog(true)}
                        sx={{
                          bgcolor: "#f59e0b",
                          "&:hover": { bgcolor: "#d97706" },
                          fontSize: 11.5,
                          py: 0.35,
                          borderRadius: 1.5,
                        }}
                      >
                        Convertir
                      </Button>
                    )}
                    <Tooltip title="Annuler">
                      <IconButton
                        size="small"
                        onClick={cancelSelection}
                        sx={{ color: "#64748b" }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Messages */}
            <Box
              ref={msgContainerRef}
              sx={{
                flex: 1,
                overflowY: "auto",
                py: 1.5,
                bgcolor: WA.convBg,
                "&::-webkit-scrollbar": { width: 5 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "rgba(0,0,0,0.18)",
                  borderRadius: 3,
                },
              }}
            >
              {conversationGrouped.map((item) =>
                item.type === "date" ? (
                  <DateSep key={item.id} label={item.label} />
                ) : (
                  <Bubble
                    key={item.msg.id}
                    msg={item.msg}
                    selectionActive={selectionActive}
                    selected={selectedIds.includes(item.msg.id)}
                    onToggle={toggleMsg}
                  />
                ),
              )}
              <div ref={bottomRef} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default WgprMain;
