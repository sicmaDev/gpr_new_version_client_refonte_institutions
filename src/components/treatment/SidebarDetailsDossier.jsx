import React from "react";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import TagIcon from "@mui/icons-material/Tag";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WifiIcon from "@mui/icons-material/Wifi";
import LabelIcon from "@mui/icons-material/Label";
import SubjectIcon from "@mui/icons-material/Subject";
import InventoryIcon from "@mui/icons-material/Inventory";
import StoreIcon from "@mui/icons-material/Store";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const Row = ({ color, bg, icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0' }}>
    <div style={{
      width: 28, height: 28, borderRadius: 7, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
    }}>
      {React.cloneElement(icon, { style: { fontSize: 14, color } })}
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500, lineHeight: 1.4, wordBreak: 'break-word' }}>{value}</div>
    </div>
  </div>
);

const SidebarDetailsDossier = ({
  isOpen, onToggle,
  codeClient, recorded_at, collect, underSubject, subject,
  product, unit, created_by, creationDate,
  formatDate3,
}) => {

  const rows = [
    { color: '#2563eb', bg: '#dbeafe', icon: <TagIcon />,           label: 'Code client',      value: codeClient },
    { color: '#0891b2', bg: '#cffafe', icon: <CalendarMonthIcon />, label: 'Reçue le',         value: formatDate3(recorded_at) },
    { color: '#7c3aed', bg: '#ede9fe', icon: <WifiIcon />,          label: 'Canal',            value: collect },
    { color: '#059669', bg: '#d1fae5', icon: <SubjectIcon />,       label: 'Objet',            value: subject },
    { color: '#d97706', bg: '#fef3c7', icon: <LabelIcon />,         label: 'Catégorie',        value: underSubject },
    { color: '#db2777', bg: '#fce7f3', icon: <InventoryIcon />,     label: 'Produit',          value: product },
    { color: '#0369a1', bg: '#e0f2fe', icon: <StoreIcon />,         label: 'Point de service', value: unit },
    { color: '#475569', bg: '#f1f5f9', icon: <BadgeIcon />,         label: 'Enregistré par',   value: created_by },
    { color: '#475569', bg: '#f1f5f9', icon: <CalendarTodayIcon />, label: 'Créé le',          value: creationDate },
  ].filter(r => r.value);

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 16 }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 9, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FolderSharedIcon style={{ fontSize: 17, color: '#64748b' }} />
        </div>
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: '#1e293b' }}>Détails du dossier</span>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={{ padding: '4px 14px 16px', borderTop: '1px solid #f1f5f9' }}>
          {rows.map((row, i) => (
            <div key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <Row {...row} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarDetailsDossier;
