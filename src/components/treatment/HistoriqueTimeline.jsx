import React, { useEffect, useRef, useState } from "react";
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
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { getClaimEvents } from "../../apis/Reclamations/ReclamationsApi";

// Types d'actions principales (ouvrent un bloc)
const MAIN_EVENTS = new Set([
  "SAVED", "AFFECTED", "SOLUTION_PROPOSED", "APPROVED", "REJECTED",
  "SATISFIED", "UNSATISFIED", "PARTIAL_SATISFIED", "CLASSED",
  "LITIGATION", "TRANSMITTED", "CONVERTED", "SESSION_STARTED",
]);

// Types de communications (se rattachent au bloc précédent)
const COMM_EVENTS = new Set([
  "MAIL_SENT_AGENT", "SMS_SENT_AGENT", "MAIL_SENT_CLIENT", "SMS_SENT_CLIENT",
]);

const ACTION_CONFIG = {
  SAVED:             { label: "Enregistrée",                    color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", Icon: ArticleOutlinedIcon },
  AFFECTED:          { label: "Affectée",                       color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", Icon: AssignmentIndIcon },
  SOLUTION_PROPOSED: { label: "Solution proposée",              color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0", Icon: RecordVoiceOverIcon },
  APPROVED:          { label: "Solution approuvée",             color: "#16a34a", bg: "#dcfce7", border: "#86efac", Icon: CheckCircleOutlineIcon },
  REJECTED:          { label: "Solution désapprouvée",          color: "#dc2626", bg: "#fef2f2", border: "#fecaca", Icon: HighlightOffIcon },
  SATISFIED:         { label: "Client satisfait",               color: "#15803d", bg: "#f0fdf4", border: "#86efac", Icon: SentimentSatisfiedAltIcon },
  UNSATISFIED:       { label: "Client non satisfait",           color: "#dc2626", bg: "#fef2f2", border: "#fecaca", Icon: SentimentDissatisfiedIcon },
  PARTIAL_SATISFIED: { label: "Client partiellement satisfait", color: "#d97706", bg: "#fffbeb", border: "#fde68a", Icon: SentimentNeutralIcon },
  CLASSED:           { label: "Classée",                        color: "#475569", bg: "#f8fafc", border: "#e2e8f0", Icon: ArchiveOutlinedIcon },
  LITIGATION:        { label: "Contentieux",                    color: "#9f1239", bg: "#fff1f2", border: "#fecdd3", Icon: GavelIcon },
  TRANSMITTED:       { label: "Transmise",                      color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", Icon: SendIcon },
  CONVERTED:         { label: "Convertie",                      color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", Icon: SwapHorizIcon },
  SESSION_STARTED:   { label: "Session collaborative",          color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", Icon: GroupsIcon },
};

const formatDate = (dt) => {
  if (!dt) return "";
  try {
    return new Date(dt).toLocaleString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return dt; }
};

// Parse "Nom|contact" (2 parties) ou "Nom|role|agence" (3 parties) ou juste "Nom"
// "contact" = email pour MAIL_SENT, téléphone pour SMS_SENT
const parseMeta = (metadata) => {
  if (!metadata) return { name: "", contact: "", role: "", agence: "" };
  const parts = metadata.split("|");
  if (parts.length >= 3) return { name: parts[0], contact: "", role: parts[1], agence: parts[2] };
  if (parts.length === 2) return { name: parts[0], contact: parts[1], role: "", agence: "" };
  return { name: metadata, contact: "", role: "", agence: "" };
};

const cleanName = (name) =>
  name?.startsWith("Pilote Principal ") ? name.replace("Pilote Principal ", "") : name;

const ROLE_LABELS = {
  RA: "Responsable d'agence",
  RR: "Responsable régional",
  DG: "Directeur général",
  PILOTE: "Pilote",
};
const cleanRole = (role) => ROLE_LABELS[role] || role;

// Détermine couleur/label selon le type d'event
const commType = (eventType, name) => {
  if (eventType === "MAIL_SENT_CLIENT" || eventType === "SMS_SENT_CLIENT")
    return { label: "client", color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" };
  if (name && name.startsWith("Pilote Principal"))
    return { label: "pilote", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" };
  return { label: "agent", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" };
};

// Regroupe les events en blocs : chaque bloc = 1 action principale + ses communications
const groupEvents = (events) => {
  const blocks = [];
  let current = null;
  for (const ev of events) {
    if (MAIN_EVENTS.has(ev.eventType)) {
      current = { action: ev, comms: [] };
      blocks.push(current);
    } else if (COMM_EVENTS.has(ev.eventType)) {
      if (current) {
        current.comms.push(ev);
      } else {
        current = { action: ev, comms: [] };
        blocks.push(current);
      }
    }
  }
  return blocks;
};

// Regroupe les comms par canal en séparant pilote / agent
const groupComms = (comms) => {
  const ORDER = [
    "MAIL_SENT_CLIENT", "SMS_SENT_CLIENT",
    "MAIL_PILOTE", "SMS_PILOTE",
    "MAIL_SENT_AGENT", "SMS_SENT_AGENT",
  ];
  const map = {};
  for (const ev of comms) {
    const isPilote = ev.metadata && ev.metadata.startsWith("Pilote Principal");
    let key = ev.eventType;
    if (isPilote && ev.eventType === "MAIL_SENT_AGENT") key = "MAIL_PILOTE";
    if (isPilote && ev.eventType === "SMS_SENT_AGENT")  key = "SMS_PILOTE";
    if (!map[key]) map[key] = [];
    map[key].push(ev);
  }
  return ORDER
    .filter(k => map[k])
    .map(k => ({
      key: k,
      eventType: k === "MAIL_PILOTE" ? "MAIL_SENT_AGENT" : k === "SMS_PILOTE" ? "SMS_SENT_AGENT" : k,
      isPilote: k === "MAIL_PILOTE" || k === "SMS_PILOTE",
      list: map[k],
    }));
};

// Ligne de groupe comm : "Mail envoyé à : Nom +N"
const CommGroupLine = ({ eventType, isPilote, list }) => {
  const [dropPos, setDropPos] = useState(null); // null = fermé
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const isMail = eventType === "MAIL_SENT_AGENT" || eventType === "MAIL_SENT_CLIENT";
  const first = parseMeta(list[0].metadata);
  const type = commType(eventType, list[0].metadata);
  const rest = list.slice(1);
  const open = dropPos !== null;

  const toggleDrop = () => {
    if (open) { setDropPos(null); return; }
    const rect = btnRef.current.getBoundingClientRect();
    const dropH = Math.min(rest.length * 52 + 12, 260);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    // Ouvre vers le haut seulement si pas assez de place en bas ET assez de place en haut
    const goUp = spaceBelow < dropH + 12 && spaceAbove >= dropH + 12;
    setDropPos({
      left: rect.left,
      ...(goUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) setDropPos(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const label = eventType === "MAIL_SENT_CLIENT" ? "Mail envoyé au client :"
    : eventType === "SMS_SENT_CLIENT"  ? "SMS envoyé au client :"
    : isPilote && isMail                ? "Mail envoyé au pilote :"
    : isPilote                          ? "SMS envoyé au pilote :"
    : isMail                            ? "Mail envoyé à :"
    : "SMS envoyé à :";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 14px",
      borderTop: "1px solid #f1f5f9",
      background: "#fafafa",
    }}>
      {/* Icône canal */}
      <div style={{
        width: 26, height: 26, borderRadius: 6, flexShrink: 0,
        background: type.bg, border: `1px solid ${type.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isMail
          ? <EmailOutlinedIcon style={{ fontSize: 13, color: type.color }} />
          : <SmsOutlinedIcon   style={{ fontSize: 13, color: type.color }} />
        }
      </div>

      {/* Label + premier nom + bouton +N */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minWidth: 0 }}>
        <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          {cleanName(first.name) || "—"}
        </span>
        {first.contact && (
          <span style={{ fontSize: 11.5, color: "#94a3b8" }}>· {first.contact}</span>
        )}

        {/* Bouton +N avec dropdown en position fixe */}
        {rest.length > 0 && (
          <>
            <button
              ref={btnRef}
              onClick={toggleDrop}
              style={{
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                padding: "2px 9px", borderRadius: 20,
                background: type.bg, color: type.color,
                border: `1px solid ${type.border}`,
                lineHeight: "18px",
              }}
            >
              +{rest.length}
            </button>

            {open && (
              <div ref={dropRef} style={{
                position: "fixed",
                top: dropPos.top ?? "auto",
                bottom: dropPos.bottom ?? "auto",
                left: dropPos.left,
                zIndex: 9999,
                background: "white", borderRadius: 10,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                minWidth: 240, maxHeight: 260, overflowY: "auto",
                padding: "6px 0",
              }}>
                {rest.map((ev, i) => {
                  const p = parseMeta(ev.metadata);
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 14px",
                      borderBottom: i < rest.length - 1 ? "1px solid #f8fafc" : "none",
                    }}>
                      <PersonOutlineIcon style={{ fontSize: 14, color: "#94a3b8", flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>
                          {cleanName(p.name) || "—"}
                        </div>
                        {p.contact && (
                          <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>
                            {p.contact}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
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
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Aucun événement tracé</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>Les actions effectuées sur ce dossier apparaîtront ici</div>
    </div>
  );

  const blocks = groupEvents(events);

  return (
    <>
      {/* Header */}
      <div style={{ background: "#fff", borderRadius: 12, marginBottom: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <CalendarMonthIcon style={{ fontSize: 17, color: "#64748b" }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Historique du dossier</span>
        <span style={{ marginLeft: 6, background: "#f1f5f9", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 600, color: "#64748b" }}>
          {blocks.length} étape{blocks.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 32 }}>
        <div style={{ position: "absolute", left: 15, top: 8, bottom: 8, width: 2, background: "#e2e8f0", borderRadius: 2 }} />

        {blocks.map((block, idx) => {
          const ev = block.action;
          const cfg = ACTION_CONFIG[ev.eventType] || { label: ev.eventType, color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", Icon: ArticleOutlinedIcon };
          const { Icon } = cfg;
          const isLast = idx === blocks.length - 1;
          const commGroups = groupComms(block.comms);

          // Compte total de destinataires pour l'affichage dans le header
          const totalDest = block.comms.length;

          return (
            <div key={ev.id ?? idx} style={{ position: "relative", marginBottom: isLast ? 0 : 14 }}>
              {/* Nœud */}
              <div style={{
                position: "absolute", left: -24, top: 14,
                width: 18, height: 18, borderRadius: "50%",
                background: cfg.color, border: "3px solid white",
                boxShadow: `0 0 0 2px ${cfg.color}`, zIndex: 1,
              }} />

              {/* Bloc */}
              <div style={{
                background: "white",
                border: isLast ? `1.5px solid ${cfg.border}` : "1px solid #e5e7eb",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: isLast ? `0 2px 12px ${cfg.color}22` : "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                {/* En-tête de l'action */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: isLast ? cfg.bg : "white" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ fontSize: 15, color: cfg.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
                    {ev.actorName && (
                      <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 1 }}>
                        Par : {ev.actorName}
                        {ev.actorEmail && <span style={{ marginLeft: 5, color: "#94a3b8" }}>· {ev.actorEmail}</span>}
                      </div>
                    )}
                    {ev.metadata && MAIN_EVENTS.has(ev.eventType) && (
                      <div style={{ fontSize: 11.5, color: "#475569", marginTop: 2 }}>
                        {ev.eventType === "AFFECTED" && <>Assignée à <strong>{ev.metadata}</strong></>}
                        {ev.eventType === "TRANSMITTED" && (() => {
                          const t = parseMeta(ev.metadata);
                          return (
                            <span>
                              Transmise à <strong>{t.name}</strong>
                              {t.role   && <span style={{ color: "#94a3b8" }}> · {cleanRole(t.role)}</span>}
                              {t.agence && <span style={{ color: "#94a3b8" }}> · {t.agence}</span>}
                            </span>
                          );
                        })()}
                        {ev.eventType === "REJECTED" && <>Motif : <em>{ev.metadata}</em></>}
                        {!["AFFECTED","TRANSMITTED","REJECTED"].includes(ev.eventType) && ev.metadata}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {ev.createdAt && (
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{formatDate(ev.createdAt)}</div>
                    )}
                    {totalDest > 0 && (
                      <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 3 }}>
                        {totalDest} notification{totalDest > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lignes de communication groupées */}
                {commGroups.map(({ key, eventType, isPilote, list }) => (
                  <CommGroupLine key={key} eventType={eventType} isPilote={isPilote} list={list} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default HistoriqueTimeline;
