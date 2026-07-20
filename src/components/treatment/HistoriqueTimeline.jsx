import React, { useEffect, useState } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SendIcon from "@mui/icons-material/Send";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import GroupsIcon from "@mui/icons-material/Groups";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import { getClaimEvents } from "../../apis/Reclamations/ReclamationsApi";

const EVENT_CONFIG = {
  SAVED:              { label: "Enregistrée",                    color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", Icon: ArticleOutlinedIcon },
  AFFECTED:           { label: "Affectée",                       color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", Icon: AssignmentIndIcon },
  SOLUTION_PROPOSED:  { label: "Solution proposée",              color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0", Icon: RecordVoiceOverIcon },
  APPROVED:           { label: "Solution approuvée",             color: "#16a34a", bg: "#dcfce7", border: "#86efac", Icon: CheckCircleOutlineIcon },
  REJECTED:           { label: "Solution désapprouvée",          color: "#dc2626", bg: "#fef2f2", border: "#fecaca", Icon: HighlightOffIcon },
  SATISFIED:          { label: "Client satisfait",               color: "#15803d", bg: "#f0fdf4", border: "#86efac", Icon: SentimentSatisfiedAltIcon },
  UNSATISFIED:        { label: "Client non satisfait",           color: "#dc2626", bg: "#fef2f2", border: "#fecaca", Icon: SentimentDissatisfiedIcon },
  PARTIAL_SATISFIED:  { label: "Client partiellement satisfait", color: "#d97706", bg: "#fffbeb", border: "#fde68a", Icon: SentimentNeutralIcon },
  CLASSED:            { label: "Classée",                        color: "#475569", bg: "#f8fafc", border: "#e2e8f0", Icon: ArchiveOutlinedIcon },
  LITIGATION:         { label: "Contentieux",                    color: "#9f1239", bg: "#fff1f2", border: "#fecdd3", Icon: GavelIcon },
  TRANSMITTED:        { label: "Transmise",                      color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", Icon: SendIcon },
  CONVERTED:          { label: "Convertie",                      color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", Icon: SwapHorizIcon },
  MAIL_SENT_AGENT:    { label: "Mail envoyé (agent)",            color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", Icon: EmailOutlinedIcon },
  SMS_SENT_AGENT:     { label: "SMS envoyé (agent)",             color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", Icon: SmsOutlinedIcon },
  MAIL_SENT_CLIENT:   { label: "Mail envoyé (client)",           color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd", Icon: EmailOutlinedIcon },
  SMS_SENT_CLIENT:    { label: "SMS envoyé (client)",            color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd", Icon: SmsOutlinedIcon },
  SESSION_STARTED:    { label: "Session collaborative",          color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", Icon: GroupsIcon },
};

const formatDate = (dt) => {
  if (!dt) return "";
  try {
    return new Date(dt).toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return dt; }
};

const HistoriqueTimeline = ({ claimId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!claimId) return;
    setLoading(true);
    getClaimEvents(claimId)
      .then(({ data }) => {
        const items = Array.isArray(data?.content) ? data.content : [];
        setEvents(items);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [claimId]);

  if (loading) return (
    <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
      Chargement du flux…
    </div>
  );

  if (events.length === 0) return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>🕓</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Aucun événement tracé</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>Les actions effectuées sur ce dossier apparaîtront ici</div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div style={{ background: "#fff", borderRadius: 12, marginBottom: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <CalendarMonthIcon style={{ fontSize: 17, color: "#64748b" }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Historique du dossier</span>
        <span style={{ marginLeft: 6, background: "#f1f5f9", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 600, color: "#64748b" }}>
          {events.length} événement{events.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 32 }}>
        <div style={{ position: "absolute", left: 15, top: 8, bottom: 8, width: 2, background: "#e2e8f0", borderRadius: 2 }} />

        {events.map((ev, idx) => {
          const cfg = EVENT_CONFIG[ev.eventType] || { label: ev.eventType, color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", Icon: ArticleOutlinedIcon };
          const { Icon } = cfg;
          const isLast = idx === events.length - 1;
          const isPilote = (ev.eventType === "MAIL_SENT_AGENT" || ev.eventType === "SMS_SENT_AGENT") && ev.metadata?.startsWith("Pilote Principal");
          const isClientEvent = ev.eventType === "MAIL_SENT_CLIENT" || ev.eventType === "SMS_SENT_CLIENT";
          const isAgentEvent = ev.eventType === "MAIL_SENT_AGENT" || ev.eventType === "SMS_SENT_AGENT";
          let displayLabel = cfg.label;
          if (isPilote) displayLabel = ev.eventType === "MAIL_SENT_AGENT" ? "Mail envoyé (pilote principal)" : "SMS envoyé (pilote principal)";

          return (
            <div key={ev.id} style={{ position: "relative", marginBottom: isLast ? 0 : 14 }}>
              {/* Nœud */}
              <div style={{
                position: "absolute", left: -24, top: 14,
                width: 18, height: 18, borderRadius: "50%",
                background: cfg.color, border: "3px solid white",
                boxShadow: `0 0 0 2px ${cfg.color}`, zIndex: 1,
              }} />

              {/* Card */}
              <div style={{
                background: "white",
                border: isLast ? `1.5px solid ${cfg.border}` : "1px solid #e5e7eb",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: isLast ? `0 2px 12px ${cfg.color}22` : "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: isLast ? cfg.bg : "white", borderBottom: ev.metadata ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ fontSize: 15, color: cfg.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{displayLabel}</div>
                    {ev.actorName && (
                      <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 1 }}>
                        {isClientEvent ? `Par : ${ev.actorName}` : ev.actorName}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {ev.createdAt && (
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{formatDate(ev.createdAt)}</div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                {ev.metadata && (
                  <div style={{ padding: "8px 14px", fontSize: 12.5, color: "#475569", background: "#fafafa", borderTop: "1px solid #f1f5f9" }}>
                    {ev.eventType === "AFFECTED" && <span>Assignée à <strong>{ev.metadata}</strong></span>}
                    {ev.eventType === "TRANSMITTED" && <span>Transmise à <strong>{ev.metadata}</strong></span>}
                    {ev.eventType === "REJECTED" && <span>Motif : <em>{ev.metadata}</em></span>}
                    {ev.eventType === "MAIL_SENT_CLIENT" && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <EmailOutlinedIcon style={{ fontSize: 13, color: "#0284c7" }} />
                        Destinataire (client) : <strong style={{ marginLeft: 4 }}>{ev.metadata}</strong>
                      </span>
                    )}
                    {ev.eventType === "SMS_SENT_CLIENT" && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <SmsOutlinedIcon style={{ fontSize: 13, color: "#0284c7" }} />
                        Destinataire (client) : <strong style={{ marginLeft: 4 }}>{ev.metadata}</strong>
                      </span>
                    )}
                    {ev.eventType === "MAIL_SENT_AGENT" && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <EmailOutlinedIcon style={{ fontSize: 13, color: "#0891b2" }} />
                        {isPilote
                          ? <><strong>{ev.metadata}</strong></>
                          : <>Destinataire (agent) : <strong style={{ marginLeft: 4 }}>{ev.metadata}</strong></>
                        }
                      </span>
                    )}
                    {ev.eventType === "SMS_SENT_AGENT" && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <SmsOutlinedIcon style={{ fontSize: 13, color: "#0891b2" }} />
                        {isPilote
                          ? <><strong>{ev.metadata}</strong></>
                          : <>Destinataire (agent) : <strong style={{ marginLeft: 4 }}>{ev.metadata}</strong></>
                        }
                      </span>
                    )}
                    {!["AFFECTED", "TRANSMITTED", "REJECTED", "MAIL_SENT_AGENT", "MAIL_SENT_CLIENT", "SMS_SENT_AGENT", "SMS_SENT_CLIENT"].includes(ev.eventType) && ev.metadata}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default HistoriqueTimeline;
