import React from "react";
import { Grid, Card, CardContent, Box, Typography, IconButton, Tooltip } from "@mui/material";
import VolumeUp from "@mui/icons-material/VolumeUp";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Pause from "@mui/icons-material/Pause";
import Info from "@mui/icons-material/Info";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { waAudioDisplayName } from "../utils";

/**
 * Grille d'audios (fichiers audio d'une réclamation), avec mise en avant visuelle des
 * audios reçus du client par WhatsApp (nom préfixé "[WhatsApp] ") - style, badge, et
 * surbrillance ponctuelle après un clic sur "🎙 Écouter le commentaire vocal".
 *
 * Composant partagé par ListeReclamations.js, AssuranceReclamation.js,
 * ListeReclamationsClassees.js et TraiterReclamation.js, pour ne pas dupliquer cette
 * logique quatre fois.
 */
export default function AudioGrid({ audios, currentAudioId, onPlay, highlightedAudioId, formatDate, onDelete, currentUser }) {
  if (!audios || audios.length === 0) return null;

  return (
    <Grid spacing={2} container size={12}>
      {audios.map((audioItem) => {
        const isWhatsapp = audioItem.name?.startsWith("[WhatsApp]");
        const isHighlighted = highlightedAudioId === audioItem.id;
        return (
          <Grid item xs={12} sm={6} key={audioItem.id}>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: 2,
                p: 1.5,
                boxShadow: isWhatsapp ? "0 2px 8px rgba(37,211,102,0.25)" : "0 2px 4px rgba(0,0,0,0.05)",
                border: isWhatsapp ? "1px solid #25d366" : "1px solid transparent",
                background: isWhatsapp ? "#f6fffa" : undefined,
                height: "100%",
                ...(isHighlighted && { animation: "waAudioHighlight 1.6s ease-in-out infinite" }),
              }}
            >
              <Box
                sx={{
                  bgcolor: isWhatsapp ? "#dcfce7" : "primary.light",
                  borderRadius: "6px",
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                  minWidth: "48px",
                  height: "48px",
                }}
              >
                {isWhatsapp ? (
                  <span style={{ fontSize: 22 }}>🎙</span>
                ) : (
                  <VolumeUp sx={{ color: "primary.contrastText", fontSize: "28px" }} />
                )}
              </Box>

              <CardContent sx={{ flex: 1, minWidth: 0, p: "8px !important" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      mb: 0.5,
                    }}
                  >
                    {waAudioDisplayName(audioItem)}
                  </Typography>
                  {audioItem._extra && (
                    <Tooltip
                      title={`Ajouté par ${audioItem.extra?.user?.firstAndLastName ?? ""} le ${audioItem.extra?.createdAt && isFinite(new Date(audioItem.extra.createdAt)) ? formatDate(audioItem.extra.createdAt) : "date invalide"}`}
                    >
                      <Info fontSize="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  )}
                </Box>
                {isWhatsapp && (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: "#dcfce7",
                      color: "#15803d",
                      borderRadius: 1,
                      px: 0.8,
                      py: 0.1,
                      mb: 0.5,
                    }}
                  >
                    🎙 Commentaire WhatsApp
                  </Box>
                )}
                <Typography variant="body2" color="text.secondary">
                  {Math.round((audioItem.size / 1024 + Number.EPSILON) * 100) / 100} Ko
                  {audioItem.duration ? ` • ${audioItem.duration}` : ""}
                </Typography>
              </CardContent>

              <Box sx={{ display: "flex" }}>
                <IconButton
                  onClick={() => onPlay(audioItem.id, audioItem.name)}
                  sx={{ color: currentAudioId === audioItem.id ? "primary.main" : "text.secondary" }}
                >
                  {currentAudioId === audioItem.id ? <Pause /> : <PlayArrow />}
                </IconButton>
                {onDelete && audioItem._extra &&
                  audioItem.extra?.user?.firstAndLastName === currentUser?.firstAndLastName && (
                    <IconButton onClick={() => onDelete(audioItem.id)} sx={{ color: "error.main" }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
              </Box>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
