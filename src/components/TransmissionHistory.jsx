import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Alert, CircularProgress, Avatar } from "@mui/material";
import { Person, Schedule } from "@mui/icons-material";
import { getTransmissionHistoryApi } from "../apis/Reclamations/ReclamationsApi";

const formatDate = (dateString) => {
  if (!dateString) return "Non définie";
  return new Date(dateString).toLocaleString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Historique des commentaires de transmission d'une réclamation (ou d'une
// dénonciation, qui partage la même table/le même endpoint côté backend).
const TransmissionHistory = ({ claimId }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!claimId) return;
    setIsLoading(true);
    getTransmissionHistoryApi(claimId).then((data) => {
      setItems(data ?? []);
      setIsLoading(false);
    });
  }, [claimId]);

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" gap={1} sx={{ py: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Chargement de l'historique des transmissions...</Typography>
      </Box>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 1 }}>
        Aucune transmission enregistrée pour cette plainte.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      {items.map((item, index) => (
        <Paper key={item.id ?? index} elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>À :</strong> {item.transmisANom ?? "—"}
          </Typography>

          <Box display="flex" alignItems="center" mb={1}>
            <Schedule fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(item.dateTransmission)}
            </Typography>
          </Box>

          {item.commentaire && (
            <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
              « {item.commentaire} »
            </Typography>
          )}

          <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
            <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: "primary.main" }}>
              <Person fontSize="small" />
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              Transmis par : <strong>{item.transmisParNom ?? "—"}</strong>
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default TransmissionHistory;
