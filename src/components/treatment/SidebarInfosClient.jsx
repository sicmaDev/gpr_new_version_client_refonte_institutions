import React from "react";
import PersonIcon from "@mui/icons-material/Person";
import CallIcon from "@mui/icons-material/Call";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LanguageIcon from "@mui/icons-material/Language";
import WcIcon from "@mui/icons-material/Wc";
import FolderSharedIcon from "@mui/icons-material/FolderShared";

const SidebarInfosClient = ({ isOpen, onToggle, lastname, phone, email, address, language, gender, dossierimf }) => {
  const rows = [
    { icon: <PersonIcon style={{ fontSize: 13, color: '#94a3b8' }} />,      label: 'Nom',       value: lastname    },
    { icon: <CallIcon style={{ fontSize: 13, color: '#94a3b8' }} />,         label: 'Téléphone', value: phone       },
    { icon: <EmailIcon style={{ fontSize: 13, color: '#94a3b8' }} />,        label: 'Email',     value: email       },
    { icon: <LocationOnIcon style={{ fontSize: 13, color: '#94a3b8' }} />,   label: 'Adresse',   value: address     },
    { icon: <LanguageIcon style={{ fontSize: 13, color: '#94a3b8' }} />,     label: 'Langue',    value: language    },
    { icon: <WcIcon style={{ fontSize: 13, color: '#94a3b8' }} />,           label: 'Genre',     value: gender      },
    { icon: <FolderSharedIcon style={{ fontSize: 13, color: '#94a3b8' }} />, label: 'Dossier',   value: dossierimf  },
  ].filter(r => r.value);

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 bg-transparent border-0 cursor-pointer text-left"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100">
          <PersonIcon style={{ fontSize: 17, color: '#64748b' }} />
        </div>
        <span className="flex-1 text-[13.5px] font-semibold text-slate-800">Informations client</span>
        <span className="text-slate-400 text-[11px]">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-100">
          {rows.map((row, i) => (
            <div key={i} className="flex items-start gap-2.5 py-2 border-b border-slate-50 last:border-0">
              <div className="flex-shrink-0 mt-2.5">{row.icon}</div>
              <div className="min-w-0 pt-1.5">
                <div className="text-[10px] text-slate-400 uppercase tracking-[0.5px] font-semibold mb-0.5">{row.label}</div>
                <div className="text-[13px] text-slate-700 font-medium break-words leading-snug">{row.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarInfosClient;
