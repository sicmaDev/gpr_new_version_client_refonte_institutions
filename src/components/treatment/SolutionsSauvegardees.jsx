import React, { useState } from "react";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

// Solutions sauvegardées (bouton « Sauvegarder ») : plusieurs versions, visibles par leur seul auteur.
// « Reprendre » remet la version dans le formulaire ; « Supprimer » demande une confirmation sur la ligne.

const dateHeure = (valeur) => {
  if (!valeur) return "";
  const d = new Date(valeur);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
};

const bouton = (principal) => ({
  display: "inline-flex", alignItems: "center", gap: 5, height: 30, padding: "0 10px", borderRadius: 8,
  cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
  border: principal ? "1px solid var(--gpr-primary, #005081)" : "1px solid #e2e8f0",
  background: "#fff", color: principal ? "var(--gpr-primary, #005081)" : "#64748b",
});

const SolutionsSauvegardees = ({ versions = [], onReprendre, onSupprimer, maximum = 10 }) => {
  const [aConfirmer, setAConfirmer] = useState(null);
  if (!versions.length) return null;

  return (
    <div style={{ margin: "0 18px", padding: "12px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <BookmarkBorderIcon style={{ fontSize: 17, color: "var(--gpr-primary, #005081)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Vos solutions sauvegardées</span>
        <span style={{ fontSize: 11.5, color: "#94a3b8" }}>{versions.length} / {maximum} · visibles par vous seul(e)</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
        {versions.map((v) => (
          <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#fff", border: "1px solid #eef2f6", borderRadius: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, color: "#64748b" }}>{dateHeure(v.createdAt)}</div>
              <div style={{ fontSize: 13, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={v.contenu}>
                {v.contenu || <em style={{ color: "#94a3b8" }}>(solution vide, commentaire seulement)</em>}
              </div>
            </div>
            {aConfirmer === v.id ? (
              <>
                <span style={{ fontSize: 12, color: "#b91c1c", fontWeight: 600 }}>Supprimer cette version ?</span>
                <button type="button" style={bouton(false)} onClick={() => setAConfirmer(null)}>Non</button>
                <button type="button" style={{ ...bouton(true), borderColor: "#b91c1c", color: "#b91c1c" }}
                  onClick={() => { setAConfirmer(null); onSupprimer?.(v); }}>Oui, supprimer</button>
              </>
            ) : (
              <>
                <button type="button" style={bouton(true)} onClick={() => onReprendre?.(v)}>
                  <RestoreIcon style={{ fontSize: 15 }} /> Reprendre
                </button>
                <button type="button" style={bouton(false)} onClick={() => setAConfirmer(v.id)} aria-label="Supprimer cette version">
                  <DeleteOutlineIcon style={{ fontSize: 15 }} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SolutionsSauvegardees;
