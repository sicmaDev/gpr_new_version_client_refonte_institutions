import React, { useEffect } from "react";
import { connect } from "react-redux";
import { getClaimHistorique } from "../apis/Reclamations/ReclamationsApi";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  Typography,
  Paper,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import {
  Close,
  Assignment,
  Person,
  Schedule,
  CheckCircle,
  Warning,
  Email,
  Sms,
} from "@mui/icons-material";
import {
  currentItemChanged,
  isLoadingChanged,
  isSuccessChanged,
  messageChanged,
  resetAll,
  itemsChanged,
  showMessageChanged,
  showModalChanged,
} from "../redux/actions/Reclamations/HistoriqueReclamationActions"; 

const FINAL_STATUSES = ["SATISFIED", "UNSATISFIED", "PARTIAL_SATISFIED", "LITIGATION", "CLASSED", "TREAT"];

const HistoriqueAffectation = (props) => {
  const codeClient = props.codeClient || "N/A";
  const isFinalStatus = FINAL_STATUSES.includes(props.claimStatus);

  useEffect(() => {
    if (props.claimId) {
      getClaimHistorique(props, props.claimId);
    }
  }, [props.claimId]);

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusColor = (item) => {
    if (item.estEnRetard) return "error";
    if (item.dateFinAffectation || (isFinalStatus && item.estActif)) return "success";
    if (item.estActif) return "primary";
    return "default";
  };

  const getStatusIcon = (item) => {
    if (item.estEnRetard) return <Warning />;
    if (item.dateFinAffectation || (isFinalStatus && item.estActif)) return <CheckCircle />;
    if (item.estActif) return <Assignment />;
    return <Schedule />;
  };

  const getStatusLabel = (item) => {
    if (item.estEnRetard) return "En retard";
    if (item.dateFinAffectation || (isFinalStatus && item.estActif)) return "Terminée";
    if (item.estActif) return "Active";
    return "Inactive";
  };
// console.log("props.items lola", props.items);
  return (
    <Dialog
      open={props.showModal}
      fullWidth={true}
      maxWidth="lg"
      onClose={() => props.showModalChanged(false)}
      PaperProps={{ style: { borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' } }}
    >
      {/* ── Header harmonisé ── */}
      <div style={{ background: 'linear-gradient(135deg, #1e2188 0%, #3b3fd8 100%)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Assignment style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Historique des affectations</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5, marginTop: 2 }}>Suivi complet des affectations - {codeClient}</div>
          </div>
        </div>
        <button onClick={() => props.showModalChanged(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
          <Close style={{ fontSize: 18 }} />
        </button>
      </div>

      <DialogContent id="dialog-history" sx={{ p: 3 }}>
        {props.isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 200 }}>
            <CircularProgress size={24} />
            <span style={{ fontSize: 14, color: "#64748b" }}>Chargement de l'historique...</span>
          </div>
        ) : !props.isSuccess && props.message ? (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#991b1b" }}>{props.message}</div>
        ) : !props.items || props.items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", fontSize: 13.5, color: "#94a3b8" }}>
            Aucun historique d'affectation disponible
          </div>
        ) : (
          <div style={{ position: "relative", paddingLeft: 28 }}>
            <div style={{ position: "absolute", left: 11, top: 4, bottom: 4, width: 2, background: "#e2e8f0", borderRadius: 2 }} />
            {[...props.items].sort((a, b) => (b.estActif ? 1 : 0) - (a.estActif ? 1 : 0)).map((item, idx) => {
              const isActive = item.estActif && !isFinalStatus;
              const isLate = item.estEnRetard;
              const isDone = !!item.dateFinAffectation || (isFinalStatus && item.estActif);
              const dotColor = isLate ? "#ef4444" : isActive ? "#3b82f6" : "#10b981";
              const num = props.items.length - idx;
              const label = num === 1 ? "1ère affectation" : `Réaffectation #${num - 1}`;
              return (
                <div key={idx} style={{ position: "relative", marginBottom: idx === props.items.length - 1 ? 0 : 20 }}>
                  {/* Dot */}
                  <div style={{ position: "absolute", left: -22, top: 18, width: 16, height: 16, borderRadius: "50%", background: dotColor, border: "3px solid #fff", boxShadow: `0 0 0 2px ${dotColor}`, zIndex: 1 }} />
                  {/* Card */}
                  <div style={{ borderRadius: 14, border: `1.5px solid ${isActive ? dotColor + "55" : "#e5e7eb"}`, background: isActive ? "#f0f9ff" : "#fff", padding: "16px 20px", boxShadow: isActive ? "0 2px 12px rgba(59,130,246,0.08)" : "0 1px 3px rgba(0,0,0,0.04)" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: dotColor }}>{label}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: isLate ? "#fee2e2" : isActive ? "#dbeafe" : "#dcfce7", color: isLate ? "#991b1b" : isActive ? "#1d4ed8" : "#166534" }}>
                        {isLate ? "En retard" : isActive ? "Active" : "Terminée"}
                      </span>
                    </div>
                    {/* Grid infos */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                      <div style={{ background: "#f8fafc", borderRadius: 9, padding: "10px 14px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Agent</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#1d4ed8" : "#1e293b" }}>{item.nomAgent || "-"}</div>
                        {item.emailAgent && <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{item.emailAgent}</div>}
                      </div>
                      <div style={{ background: "#f8fafc", borderRadius: 9, padding: "10px 14px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Affecté par</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{item.nomAffecteur || "-"}</div>
                        {item.emailAffecteur && <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{item.emailAffecteur}</div>}
                      </div>
                      <div style={{ background: "#f8fafc", borderRadius: 9, padding: "10px 14px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Affectée le</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{formatDate(item.createdAt)}</div>
                      </div>
                      <div style={{ background: "#f8fafc", borderRadius: 9, padding: "10px 14px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Délai accordé</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{item.delaiJours} jour(s)</div>
                      </div>
                    </div>
                    {/* Infos secondaires */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {item.dateLimite && (
                        <span style={{ fontSize: 12, color: "#64748b", background: "#f1f5f9", borderRadius: 6, padding: "4px 10px" }}>
                          Date limite : <strong>{formatDate(item.dateLimite)}</strong>
                        </span>
                      )}
                      {isDone && item.dateFinAffectation && (
                        <span style={{ fontSize: 12, color: "#166534", background: "#dcfce7", borderRadius: 6, padding: "4px 10px", fontWeight: 600 }}>
                          ✓ Terminée le {formatDateShort(item.dateFinAffectation)}
                        </span>
                      )}
                      {isLate && item.joursRetard > 0 && (
                        <span style={{ fontSize: 12, color: "#991b1b", background: "#fee2e2", borderRadius: 6, padding: "4px 10px", fontWeight: 700 }}>
                          {item.joursRetard}j de retard
                        </span>
                      )}
                      {isActive && item.joursRestants > 0 && (
                        <span style={{ fontSize: 12, color: "#1d4ed8", background: "#dbeafe", borderRadius: 6, padding: "4px 10px", fontWeight: 700 }}>
                          {item.joursRestants}j restants
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const mapStateToProps = (state) => {
  return {
    isLoading: state.claim_historique.isLoading,
    isSuccess: state.claim_historique.isSuccess,
    message: state.claim_historique.message,
    items: state.claim_historique.items,
    showMessage: state.claim_historique.showMessage,
    currentItem: state.claim_historique.currentItem,
    showModal: state.claim_historique.showModal,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    isLoadingChanged: (isLoading) => {
      dispatch(isLoadingChanged(isLoading));
    },
    isSuccessChanged: (isSuccess) => {
      dispatch(isSuccessChanged(isSuccess));
    },
    showMessageChanged: (showMessage) => {
      dispatch(showMessageChanged(showMessage));
    },
    itemsChanged: (items) => {
      dispatch(itemsChanged(items));
    },
    currentItemChanged: (currentItem) => {
      dispatch(currentItemChanged(currentItem));
    },
    messageChanged: (message) => {
      dispatch(messageChanged(message));
    },
    showModalChanged: (showModal) => {
      dispatch(showModalChanged(showModal));
    },
    resetAll: () => {
      dispatch(resetAll());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HistoriqueAffectation);
