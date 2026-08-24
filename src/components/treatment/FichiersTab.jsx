import React, { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { formatDate } from "../../Utils/utils";

const AccordionSection = ({ sectionKey, color, dotColor, icon, title, count, openMap, onToggle, children }) => {
  const isOpen = openMap[sectionKey];
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <button
        onClick={() => onToggle(sectionKey)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "13px 18px", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, flexShrink: 0,
        }}>{icon}</div>
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>{title}</span>
        <span style={{
          fontSize: 11.5, fontWeight: 700, color: "#fff",
          background: dotColor, borderRadius: 20,
          padding: "2px 9px", marginRight: 8,
        }}>{count}</span>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 18px" }}>
          {children}
        </div>
      )}
    </div>
  );
};

const FichiersTab = ({
  selectedItemFiles, selectedItemAudio,
  attachmentList, audioList,
  inputRef, onFilesChange, onAddAudio,
  content, extras, onAddContent,
  onDeleteExtra, currentUser,
}) => {
  const [accordion, setAccordion] = useState({ contents: true, files: true, audios: true });
  const toggle = (key) => setAccordion(prev => ({ ...prev, [key]: !prev[key] }));

  const filesCount    = selectedItemFiles?.length ?? 0;
  const audiosCount   = selectedItemAudio?.length ?? 0;
  const extrasCount   = extras?.filter(e => e.contenu)?.length ?? 0;
  const contentsCount = (content ? 1 : 0) + extrasCount;

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ── Barre d'actions ── */}
      <div style={{
        background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
        padding: "14px 18px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#94a3b8", marginRight: 4 }}>Ajouter :</span>

        <button
          onClick={onAddAudio}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 20, border: "1.5px solid #bfdbfe",
            background: "#eff6ff", color: "#1d4ed8", fontSize: 12.5, fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          + Audio
        </button>

        <label htmlFor="fileInputFichiersTab" style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 20, border: "1.5px solid #bbf7d0",
          background: "#f0fdf4", color: "#15803d", fontSize: 12.5, fontWeight: 600,
          cursor: "pointer",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          + Fichier
          <input id="fileInputFichiersTab" type="file" multiple hidden ref={inputRef} onChange={onFilesChange} />
        </label>

        {onAddContent && (
          <button
            onClick={onAddContent}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 20, border: "1.5px solid #ddd6fe",
              background: "#faf5ff", color: "#7c3aed", fontSize: 12.5, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            + Contenu
          </button>
        )}
      </div>

      {/* ── Contenus ── */}
      <AccordionSection
        sectionKey="contents" openMap={accordion} onToggle={toggle}
        color="#ede9fe" dotColor="#8b5cf6"
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
        title="Contenus" count={contentsCount}
      >
        {contentsCount > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {content && (
              <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Contenu initial</div>
                <div style={{ fontSize: 13.5, color: "#1e293b", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{content}</div>
              </div>
            )}
            {extras?.filter(e => e.contenu).map((extra, idx) => (
              <div key={extra.id ?? idx} style={{ background: "#faf5ff", borderRadius: 10, border: "1px solid #ede9fe", padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 13.5, color: "#1e293b", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{extra.contenu}</div>
                  {onDeleteExtra && extra.user?.firstAndLastName === currentUser?.firstAndLastName && (
                    <DeleteOutlineIcon
                      sx={{ fontSize: 18, color: "#dc2626", cursor: "pointer", flexShrink: 0 }}
                      onClick={() => onDeleteExtra(extra.id)}
                    />
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                  {extra.user?.firstAndLastName && <span>User {extra.user.firstAndLastName}</span>}
                  {extra.createdAt && <span> le {formatDate(extra.createdAt)}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>Aucun contenu</div>
        )}
      </AccordionSection>

      {/* ── Fichiers joints ── */}
      <AccordionSection
        sectionKey="files" openMap={accordion} onToggle={toggle}
        color="#dbeafe" dotColor="#3b82f6"
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>}
        title="Fichiers joints" count={filesCount}
      >
        {filesCount > 0 ? attachmentList : (
          <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>Aucun fichier joint</div>
        )}
      </AccordionSection>

      {/* ── Audios ── */}
      <AccordionSection
        sectionKey="audios" openMap={accordion} onToggle={toggle}
        color="#dcfce7" dotColor="#22c55e"
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>}
        title="Audios" count={audiosCount}
      >
        {audiosCount > 0 ? audioList : (
          <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>Aucun audio enregistré</div>
        )}
      </AccordionSection>

    </div>
  );
};

export default FichiersTab;
