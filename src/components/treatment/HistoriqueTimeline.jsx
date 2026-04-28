import React from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import SendIcon from "@mui/icons-material/Send";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";

const HistoriqueTimeline = ({
  recorded_at, created_by,
  transmitted, transmittedBy, transmittedTo,
  handled_by, assigned_by, assignedAt,
  solution = [],
  formatDate, formatDate3,
}) => {
  // ── Construire les événements ──────────────────────────────────
  const events = [];

  if (recorded_at)
    events.push({
      key: 'enregistree', label: 'Enregistrée',
      agent: created_by, date: recorded_at,
      color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe',
      icon: <ArticleOutlinedIcon style={{ fontSize: 16, color: '#3b82f6' }} />,
    });

  if (transmitted === 'true' && transmittedBy)
    events.push({
      key: 'transmise', label: 'Transmise',
      agent: transmittedBy, date: null,
      sub: `Transmise à ${transmittedTo}`,
      color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe',
      icon: <SendIcon style={{ fontSize: 15, color: '#8b5cf6' }} />,
    });

  if (handled_by && assignedAt)
    events.push({
      key: 'affectee', label: 'Affectée',
      agent: assigned_by, date: assignedAt,
      sub: `Assignée à ${handled_by}`,
      color: '#f59e0b', bg: '#fffbeb', border: '#fde68a',
      icon: <AssignmentIndIcon style={{ fontSize: 16, color: '#f59e0b' }} />,
    });

  solution.forEach((sol, i) => {
    const satDto = sol.satisfactionMeasureDto;
    const satLabel = satDto?.status === 'SATISFIED' ? 'Satisfait'
      : satDto?.status === 'UNSATISFIED' ? 'Non satisfait'
      : satDto?.status === 'PARTIAL' ? 'Partiellement satisfait' : null;

    events.push({
      key: `sol-${i}`, label: 'Solution proposée',
      agent: sol.author?.firstAndLastName, date: sol.createdAt,
      solution: sol.content,
      commentaire: sol.commentaire,
      color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0',
      icon: <RecordVoiceOverIcon style={{ fontSize: 15, color: '#10b981' }} />,
      approbation: sol.status === 'UNAPPROVED'
        ? { approved: false, motif: sol.motifDesaprobation, by: sol.unApprouver?.firstAndLastName, date: sol.unApprouvedAt }
        : sol.status === 'APPROVED' ? { approved: true } : null,
      satisfaction: satDto ? {
        label: satLabel, pending: !satLabel,
        commentaire: satDto.commentaire,
        measurer: satDto.measurer?.firstAndLastName || 'site web',
        date: satDto.measureDateTime,
      } : null,
    });
  });

  if (events.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
      <div className="text-[36px] mb-3">🕓</div>
      <div className="text-[13.5px] font-medium text-gray-700 mb-1">Aucun historique</div>
      <div className="text-xs text-slate-400">Les événements apparaîtront ici</div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-2xl mb-3 px-4 py-3 flex items-center gap-2"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <CalendarMonthIcon style={{ fontSize: 17, color: '#64748b' }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Historique du dossier</span>
        <span style={{ marginLeft: 6, background: '#f1f5f9', borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>
          {events.length} événement{events.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: 32 }}>
        <div style={{ position: 'absolute', left: 15, top: 8, bottom: 8, width: 2, background: '#e2e8f0', borderRadius: 2 }} />

        {events.map((ev, idx) => {
          const isLast = idx === events.length - 1;
          return (
            <div key={ev.key} style={{ position: 'relative', marginBottom: isLast ? 0 : 16 }}>
              {/* Nœud */}
              <div style={{
                position: 'absolute', left: -24, top: 14,
                width: 18, height: 18, borderRadius: '50%',
                background: ev.color, border: '3px solid white',
                boxShadow: `0 0 0 2px ${ev.color}`, zIndex: 1,
              }} />

              {/* Card */}
              <div style={{
                background: 'white',
                border: isLast ? `1.5px solid ${ev.border}` : '1px solid #e5e7eb',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: isLast ? `0 2px 12px ${ev.color}22` : '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                {/* Header événement */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: isLast ? ev.bg : 'white', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: ev.bg, border: `1px solid ${ev.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {ev.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ev.color }}>{ev.label}</div>
                    {ev.sub && <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>{ev.sub}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {ev.agent && <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{ev.agent}</div>}
                    {ev.date && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{formatDate3(ev.date)}</div>}
                  </div>
                </div>

                {/* Solution + commentaire */}
                {(ev.solution || ev.commentaire) && (
                  <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ev.solution && (
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Solution</div>
                        <div style={{ fontSize: 13, color: '#374151', background: '#f8fafc', borderRadius: 8, padding: '8px 10px', lineHeight: 1.5, borderLeft: `3px solid ${ev.color}` }}>{ev.solution}</div>
                      </div>
                    )}
                    {ev.commentaire && (
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Commentaire interne</div>
                        <div style={{ fontSize: 12.5, color: '#64748b', fontStyle: 'italic' }}>{ev.commentaire}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Approbation */}
                {ev.approbation && (
                  <div style={{ margin: '0 14px 10px', borderRadius: 8, padding: '8px 12px', background: ev.approbation.approved ? '#f0fdf4' : '#fef2f2', border: `1px solid ${ev.approbation.approved ? '#bbf7d0' : '#fecaca'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {ev.approbation.approved
                        ? <CheckCircleOutlineIcon style={{ fontSize: 16, color: '#15803d' }} />
                        : <HighlightOffIcon style={{ fontSize: 16, color: '#dc2626' }} />}
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: ev.approbation.approved ? '#15803d' : '#dc2626' }}>
                        {ev.approbation.approved ? 'Approuvée' : `Désapprouvée${ev.approbation.by ? ` par ${ev.approbation.by}` : ''}`}
                      </span>
                      {ev.approbation.date && <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>{formatDate3(ev.approbation.date)}</span>}
                    </div>
                    {ev.approbation.motif && (
                      <div style={{ fontSize: 12, color: '#dc2626', marginTop: 5, paddingTop: 5, borderTop: '1px solid #fecaca' }}>
                        Motif : {ev.approbation.motif}
                      </div>
                    )}
                  </div>
                )}

                {/* Satisfaction */}
                {ev.satisfaction && (
                  <div style={{ margin: '0 14px 10px', borderRadius: 8, padding: '8px 12px', background: '#fefce8', border: '1px solid #fef08a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {ev.satisfaction.pending
                        ? <HourglassEmptyIcon style={{ fontSize: 15, color: '#92400e' }} />
                        : ev.satisfaction.label === 'Satisfait'
                          ? <SentimentSatisfiedAltIcon style={{ fontSize: 16, color: '#15803d' }} />
                          : ev.satisfaction.label === 'Non satisfait'
                            ? <SentimentDissatisfiedIcon style={{ fontSize: 16, color: '#dc2626' }} />
                            : <SentimentNeutralIcon style={{ fontSize: 16, color: '#d97706' }} />
                      }
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#854d0e' }}>
                        {ev.satisfaction.pending ? 'En attente de mesure de satisfaction' : `Client ${ev.satisfaction.label}`}
                      </span>
                      {ev.satisfaction.date && <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>{formatDate3(ev.satisfaction.date)}</span>}
                    </div>
                    {ev.satisfaction.commentaire && (
                      <div style={{ fontSize: 12, color: '#92400e', marginTop: 5, paddingTop: 5, borderTop: '1px solid #fef08a', fontStyle: 'italic' }}>
                        "{ev.satisfaction.commentaire}"
                      </div>
                    )}
                    {!ev.satisfaction.pending && (
                      <div style={{ fontSize: 11, color: '#a16207', marginTop: 3 }}>Mesuré via {ev.satisfaction.measurer}</div>
                    )}
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
