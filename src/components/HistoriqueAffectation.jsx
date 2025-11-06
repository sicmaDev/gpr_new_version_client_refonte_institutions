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

const HistoriqueAffectation = (props) => {
  const codeClient = props.codeClient || "N/A";

  useEffect(() => {
    console.log("props.claimId", props.claimId); 
    console.log("props.codeClient", props.codeClient);
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
    if (item.dateFinAffectation) return "success";
    if (item.estActif) return "primary";
    return "default";
  };

  const getStatusIcon = (item) => {
    if (item.estEnRetard) return <Warning />;
    if (item.dateFinAffectation) return <CheckCircle />;
    if (item.estActif) return <Assignment />;
    return <Schedule />;
  };

  const getStatusLabel = (item) => {
    if (item.estEnRetard) return "En retard";
    if (item.dateFinAffectation) return "Terminée";
    if (item.estActif) return "Active";
    return "Inactive";
  };
// console.log("props.items lola", props.items);
  return (
    <Dialog
      open={props.showModal}
      fullWidth={true}
      maxWidth="lg"
      onClose={(e) => {
        props.showModalChanged(false);
      }}
    >
      <DialogContent id="dialog-history">
        <DialogContentText>
          <div className="col l12 s12 pb-1" id="content">
            <div className="df sb pb-1">
              <Typography variant="h5" component="h2" gutterBottom>
                <strong>Historique des affectations</strong>
              </Typography>
              <Close
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  props.showModalChanged(false);
                }}
              />
            </div>
          </div>
        </DialogContentText>

        <Box sx={{ mt: 2, maxHeight: "70vh", overflowY: "auto", scrollbarColor: "#999 transparent", scrollbarWidth: "thin", }} className="custom-scroll">
           
          {props.isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Chargement de l'historique...
              </Typography>
            </Box>
          ) : !props.isSuccess && props.message ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {props.message}
            </Alert>
          ) : !props.items || props.items.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Aucun historique d'affectation disponible pour cette réclamation.
            </Alert>
          ) : (
            <Box>
              {props.items.map((item, index) => (
                <Paper key={index} elevation={3} sx={{ p: 2, mb: 2 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="h6" component="h3">
                          Affectation #{props.items.length -index}
                        </Typography>
                        <Chip
                          label={getStatusLabel(item)}
                          color={getStatusColor(item)}
                          size="small"
                        />
                      </Box>

                      <Box mb={2}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          <strong>Code client :</strong> {codeClient}
                        </Typography>
                        
                      </Box>

                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            mr: 1,
                            bgcolor: "primary.main",
                          }}
                        >
                          <Person fontSize="small" />
                        </Avatar>
                        <Typography variant="body2">
                          <strong>Agent :</strong> {item.nomAgent ?? "UNDEFINED"} ({item.emailAgent})
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={1}>
                        <Schedule
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          <strong>Délai accordée :</strong> {item.delaiJours} jour(s)
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="body2">
                          <strong>Date limite :</strong>{" "}
                          {formatDate(item.dateLimite)}
                        </Typography>
                      </Box>

                      {item.dateFinAffectation && (
                        <Box display="flex" alignItems="center" mb={1}>
                          <CheckCircle
                            fontSize="small"
                            sx={{ mr: 1, color: "success.main" }}
                          />
                          <Typography variant="body2">
                            <strong>Terminée le :</strong>{" "}
                            {formatDate(item.dateFinAffectation)}
                          </Typography>
                        </Box>
                      )}

                      

                      {item.joursRetard > 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>Retard :</strong> {item.joursRetard} jour(s)
                            de retard
                          </Typography>
                        </Alert>
                      )}

                      {item.joursRestants > 0 && item.estActif && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>Temps restant :</strong> {item.joursRestants}{" "}
                            jour(s)
                          </Typography>
                        </Alert>
                      )}

                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1, color: "text.secondary" }}
                      >
                        Affectée par : {item.nomAgent ?? "UNDEFINED"} ({item.emailAffecteur}) le{" "}
                        {formatDate(item.createdAt)}
                      </Typography>
                    </Paper>
              ))}
            </Box>
          )}
        </Box>
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
