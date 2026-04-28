import React from "react";

const FichiersTab = ({
  selectedItemFiles, selectedItemAudio,
  attachmentList, audioList,
  inputRef, onFilesChange,
  onAddAudio,
}) => (
  <div className="p-3 flex flex-col gap-3.5">

    {/* Fichiers */}
    <div className="bg-white rounded-xl border border-gray-200 p-4 px-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13.5px] font-semibold text-slate-900">
          Fichiers ({selectedItemFiles?.length || 0})
        </span>
        <label htmlFor="ile" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#005081] text-white rounded-lg text-[12.5px] font-medium cursor-pointer">
          + Ajouter
          <input
            type="file" ref={inputRef} id="ile" multiple
            onChange={onFilesChange}
            className="hidden"
            accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, audio/*, video/*"
          />
        </label>
      </div>
      {selectedItemFiles?.length > 0 ? attachmentList : (
        <div className="py-8 text-center">
          <div className="text-[36px] mb-3">📎</div>
          <div className="text-[13.5px] font-medium text-gray-700 mb-1">Aucun fichier joint</div>
          <div className="text-xs text-slate-400">Ajoutez des pièces jointes à ce dossier</div>
        </div>
      )}
    </div>

    {/* Audio */}
    <div className="bg-white rounded-xl border border-gray-200 p-4 px-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13.5px] font-semibold text-slate-900">
          Enregistrements audio ({selectedItemAudio?.length || 0})
        </span>
        <button
          onClick={onAddAudio}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#005081] text-white rounded-lg text-[12.5px] font-medium cursor-pointer border-0"
        >
          + Ajouter
        </button>
      </div>
      {selectedItemAudio?.length > 0 ? audioList : (
        <div className="py-6 text-center">
          <div className="text-[28px] mb-2">🎙</div>
          <div className="text-[13px] text-slate-400">Aucun enregistrement audio</div>
        </div>
      )}
    </div>

  </div>
);

export default FichiersTab;
