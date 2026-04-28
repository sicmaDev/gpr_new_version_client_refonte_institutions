import React, { useState } from "react";

const PreEnregistreesTab = ({ solutions = [], onUseAndTreat, onModifyBeforeSend }) => {
  const [selected, setSelected] = useState(null);

  const toggle = (sol) => setSelected(prev => prev?.id === sol.id ? null : sol);

  if (solutions.length === 0) return (
    <div className="bg-white rounded-xl py-12 px-5 text-center" style={{ border: '1px solid #e5e7eb' }}>
      <div className="text-[32px] mb-2.5">📋</div>
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
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onModifyBeforeSend(selected.content)}
            className="flex-1 py-2.5 rounded-lg text-[12.5px] font-medium cursor-pointer transition-colors"
            style={{ background: '#f0faf5', color: '#0d6e3f', border: '1px solid #c6ead8' }}
          >
            Modifier avant envoi
          </button>
          <button
            onClick={() => onUseAndTreat(selected.content)}
            className="flex-1 py-2.5 rounded-lg text-[12.5px] font-semibold cursor-pointer transition-colors text-white border-0"
            style={{ background: '#2db673' }}
          >
            Utiliser et traiter
          </button>
        </div>
      )}
    </div>
  );
};

export default PreEnregistreesTab;
