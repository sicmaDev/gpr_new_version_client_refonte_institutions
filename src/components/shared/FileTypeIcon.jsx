import React from "react";
import { Box } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GridOnIcon from "@mui/icons-material/GridOn";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const guessFileType = (attachment) => {
  const ext = (attachment?.name || "").split(".")[1];
  if (ext === "pdf") return "pdf";
  if (ext === "csv" || ext === "xlsx" || ext === "xls") return "excel";
  if (ext === "docx" || ext === "doc" || ext === "rtf" || attachment?.name === "document") return "word";
  if (ext === "jpg" || ext === "png" || ext === "jpeg" || attachment?.name === "image" || attachment?.name === "sticker") return "image";
  if (ext === "mp3" || ext === "ogg" || ext === "wav" || attachment?.name === "audio" || attachment?.name === "ptt") return "audio";
  return "unknown";
};

const TYPE_CONFIG = {
  pdf: { color: "#ef4444", icon: PictureAsPdfIcon },
  excel: { color: "#16a34a", icon: GridOnIcon },
  word: { color: "#3B82F6", icon: DescriptionIcon },
  image: { color: "#F59E0B", icon: ImageIcon },
  audio: { color: "#8B5CF6", icon: AudiotrackIcon },
  unknown: { color: "#94A3B8", icon: InsertDriveFileIcon },
};

const FileTypeIcon = ({ attachment, size = 40 }) => {
  const { color, icon: Icon } = TYPE_CONFIG[guessFileType(attachment)];
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        background: "#fff",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon sx={{ color, fontSize: size * 0.5 }} />
    </Box>
  );
};

export default FileTypeIcon;
