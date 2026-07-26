import React, { useState } from "react";

const PreEnregistreesTab = ({ solutions = [], onUseAndTreat, onModifyBeforeSend, disabled = false }) => {
  const [selected, setSelected] = useState(null);

  const toggle = (sol) => setSelected(prev => prev?.id === sol.id ? null : sol);

  if (solutions.length === 0) return (
    <div className="bg-white rounded-xl py-12 px-5 text-center" style={{ border: '1px solid #e5e7eb' }}>
      <div className="mb-3 flex justify-center">
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
            <line x1="9" y1="16" x2="13" y2="16"/>
          </svg>
        </div>
      </div>
      <div className="text-[13.5px] font-semibold text-slate-800 mb-1">Aucune solution pré-enregistrée</div>
      <div className="text-[12.5px] text-slate-400">Ce type de dossier ne dispose pas encore de solutions configurées</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Header banner */}
      <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: '#f0faf5', border: '1px solid #c6ead8' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 16 }}>💡</span>
          <span className="text-[14px] font-bold" style={{ color: '#0d6e3f' }}>Solutions pré-enregistrées</span>
        </div>
        <span className="text-[12px] font-medium" style={{ color: '#0d6e3f' }}>
          {solutions.length} disponible{solutions.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Liste radio */}
      <div className="flex flex-col gap-2.5">
        {solutions.map((sol, i) => {
          const isSelected = selected?.id === sol.id;
          const title = sol.libelle || sol.title || sol.name || `Solution ${i + 1}`;
          const desc  = sol.content || sol.description || '';
          return (
            <div
              key={i}
              onClick={() => toggle(sol)}
              className="cursor-pointer rounded-xl px-4 py-3.5 flex items-start gap-3 transition-all bg-white"
              style={{
                border: isSelected ? '1.5px solid #2db673' : '1.5px solid #e5e7eb',
                boxShadow: isSelected ? '0 0 0 3px rgba(45,182,115,0.08)' : 'none',
              }}
            >
              <div
                className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center"
                style={{ border: isSelected ? '5px solid #2db673' : '2px solid #d1d5db', background: 'white' }}
              />
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-slate-900 mb-0.5">{title}</div>
                {desc && <div className="text-[12.5px] text-slate-500 leading-relaxed">{desc}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Boutons d'action */}
      {selected && (
        <>
          {disabled && (
            <div className="rounded-lg px-3 py-2 text-[12px] font-medium text-center"
              style={{ background: '#fef9c3', border: '1px solid #fde047', color: '#92400e' }}>
              Vous n'avez pas les droits pour traiter ce dossier
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => !disabled && onModifyBeforeSend(selected.content)}
              disabled={disabled}
              className="flex-1 py-2.5 rounded-lg text-[12.5px] font-medium transition-colors"
              style={{
                background: disabled ? '#f1f5f9' : '#f0faf5',
                color: disabled ? '#94a3b8' : '#0d6e3f',
                border: `1px solid ${disabled ? '#e2e8f0' : '#c6ead8'}`,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.7 : 1,
              }}
            >
              Modifier avant envoi
            </button>
            <button
              onClick={() => !disabled && onUseAndTreat(selected.content, selected.id)}
              disabled={disabled}
              className="flex-1 py-2.5 rounded-lg text-[12.5px] font-semibold transition-colors border-0"
              style={{
                background: disabled ? '#cbd5e1' : '#2db673',
                color: '#fff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.7 : 1,
              }}
            >
              Utiliser et traiter
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PreEnregistreesTab;
