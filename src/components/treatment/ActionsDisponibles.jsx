import React from "react";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";

const ACTION_DEFS = [
  { key: 'convertir',   label: 'Convertir',   desc: 'Changer le type du dossier',     accent: '#ea580c', bg: '#fff7ed', dot: '#f97316' },
  { key: 'affecter',    label: 'Affecter',     desc: 'Assigner ce dossier à un agent', accent: '#1e2188', bg: '#eff6ff', dot: '#3b82f6' },
  { key: 'reaffecter',  label: 'Réaffecter',   desc: "Changer l'agent assigné",        accent: '#6d28d9', bg: '#f5f3ff', dot: '#8b5cf6' },
  { key: 'transmettre', label: 'Transmettre',  desc: 'Transmettre au pilote',          accent: '#0f172a', bg: '#f0f9ff', dot: '#0ea5e9' },
  { key: 'approuver',   label: 'Approuver',    desc: 'Valider ou rejeter la solution', accent: '#065f46', bg: '#f0fdf4', dot: '#22c55e' },
];

const ActionsDisponibles = ({ isOpen, onToggle, visibleActions, onAction }) => {
  const actions = ACTION_DEFS.filter(a => visibleActions.includes(a.key));

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 bg-transparent border-0 cursor-pointer text-left"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100">
          <RecordVoiceOverIcon style={{ fontSize: 17, color: '#64748b' }} />
        </div>
        <span className="flex-1 text-[13.5px] font-semibold text-slate-800">Actions disponibles</span>
        <span className="text-slate-400 text-[11px]">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {actions.length > 0 ? actions.map(action => (
            <button
              key={action.key}
              onClick={() => onAction(action.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px',
                background: action.bg,
                border: `1.5px solid ${action.dot}30`,
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'transform 0.12s, box-shadow 0.12s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: action.dot, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: action.accent }}>{action.label}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{action.desc}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
                <path d="M9 18l6-6-6-6" stroke={action.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )) : (
            <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 12.5, color: '#94a3b8' }}>Aucune action disponible</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionsDisponibles;
