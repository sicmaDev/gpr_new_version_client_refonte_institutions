import React from "react";
import { Tooltip } from "@mui/material";
import PinIcon from "@mui/icons-material/Pin";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RecyclingIcon from "@mui/icons-material/Recycling";
import CategoryIcon from "@mui/icons-material/Category";
import DataObjectIcon from "@mui/icons-material/DataObject";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FolderSharedIcon from "@mui/icons-material/FolderShared";

const SidebarDetailsDossier = ({
  isOpen, onToggle,
  codeClient, recorded_at, collect, underSubject, subject,
  product, unit, created_by, creationDate,
  content, extras,
  onAddContent,
  formatDate, formatDate3, getStatusLabel,
}) => {
  const rows = [
    { icon: <PinIcon style={{ fontSize: 13, color: '#94a3b8' }} />,          label: 'Code client',      value: codeClient              },
    { icon: <CalendarMonthIcon style={{ fontSize: 13, color: '#94a3b8' }} />, label: 'Reçue le',         value: formatDate3(recorded_at) },
    { icon: <RecyclingIcon style={{ fontSize: 13, color: '#94a3b8' }} />,     label: 'Canal',            value: collect                 },
    { icon: <CategoryIcon style={{ fontSize: 13, color: '#94a3b8' }} />,      label: 'Catégorie',        value: underSubject             },
    { icon: <DataObjectIcon style={{ fontSize: 13, color: '#94a3b8' }} />,    label: 'Objet',            value: subject                 },
    { icon: <CategoryIcon style={{ fontSize: 13, color: '#94a3b8' }} />,      label: 'Produit',          value: product                 },
    { icon: <AddBusinessIcon style={{ fontSize: 13, color: '#94a3b8' }} />,   label: 'Point de service', value: unit                    },
    { icon: <SupportAgentIcon style={{ fontSize: 13, color: '#94a3b8' }} />,  label: 'Enregistré par',   value: created_by              },
    { icon: <CalendarTodayIcon style={{ fontSize: 13, color: '#94a3b8' }} />, label: 'Créé le',          value: creationDate            },
  ].filter(r => r.value);

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 bg-transparent border-0 cursor-pointer text-left"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100">
          <FolderSharedIcon style={{ fontSize: 17, color: '#64748b' }} />
        </div>
        <span className="flex-1 text-[13.5px] font-semibold text-slate-800">Détails du dossier</span>
        <span className="text-slate-400 text-[11px]">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-100">
          {rows.map((row, i) => (
            <div key={i} className="flex items-start gap-2.5 py-2 border-b border-slate-50 last:border-0">
              <div className="flex-shrink-0 mt-2.5">{row.icon}</div>
              <div className="min-w-0 pt-1.5">
                <div className="text-[10px] text-slate-400 uppercase tracking-[0.5px] font-semibold mb-0.5">{row.label}</div>
                <div className="text-[13px] text-slate-700 font-medium leading-snug">{row.value}</div>
              </div>
            </div>
          ))}

          {content && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.5px] mb-1">Contenu</div>
              <div className="text-[12.5px] text-slate-700 leading-relaxed">{content}</div>
            </div>
          )}

          {extras?.filter(e => e.contenu).map((extra, i) => (
            <Tooltip key={i} title={`Ajouté par ${extra.user?.firstAndLastName} le ${formatDate(extra.createdAt)}. État: ${getStatusLabel(extra.status)}`}>
              <div className="mt-2 p-2.5 bg-slate-50 rounded-xl cursor-help">
                <div className="text-[12.5px] text-slate-700 leading-snug">{extra.contenu}</div>
                <div className="text-[10.5px] text-slate-400 mt-0.5">{extra.user?.firstAndLastName} — {formatDate(extra.createdAt)}</div>
              </div>
            </Tooltip>
          ))}

          <button
            onClick={onAddContent}
            className="mt-2 text-[12px] text-[#005081] bg-transparent border-0 cursor-pointer p-0 font-medium"
          >
            + Ajouter du contenu
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarDetailsDossier;
