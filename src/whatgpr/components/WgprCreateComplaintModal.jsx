import React, { useState, useRef } from 'react';
import { createComplaint } from '../api';
import { displayNumber } from '../utils';
import toast from 'react-hot-toast';
import { useHistory } from 'react-router-dom';

const BASE_MEDIA = '/api/whatgpr/uploads/';

const WgprCreateComplaintModal = ({ open, onClose, selectedMessages, fromNumber }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const history = useHistory();

  if (!open) return null;

  const attachments = selectedMessages.filter(m => m.type !== 'chat');
  const chatMessages = selectedMessages.filter(m => m.type === 'chat');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Le titre est requis'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('fromNumber', fromNumber);
      fd.append('messageIds', JSON.stringify(selectedMessages.map(m => m.id)));
      for (const f of files) fd.append('files', f);
      const r = await createComplaint(fd);
      if (!r.ok) throw new Error('Erreur serveur');
      toast.success('Plainte créée avec succès');
      onClose();
      history.push('/whatgpr/complaints');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg">Créer une plainte</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Messages sélectionnés */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Messages sélectionnés ({selectedMessages.length})</p>
            <div className="bg-gray-50 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1.5">
              {chatMessages.map((m, i) => (
                <div key={i} className="text-sm text-gray-700 bg-white rounded-lg px-3 py-1.5 shadow-sm">{m.content}</div>
              ))}
            </div>
          </div>

          {/* Pièces jointes auto */}
          {attachments.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-700 mb-2">📎 Pièces jointes incluses automatiquement ({attachments.length})</p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((a, i) => (
                  a.type === 'image'
                    ? <img key={i} src={`${BASE_MEDIA}${a.content}`} alt="" className="w-12 h-12 object-cover rounded-lg border border-blue-200" />
                    : <span key={i} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                        {a.type === 'audio' || a.type === 'ptt' ? '🎵' : a.type === 'video' ? '🎬' : '📎'} {a.type}
                      </span>
                ))}
              </div>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Titre <span className="text-red-500">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Titre de la plainte" />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Description / Résumé</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" placeholder="Résumé de la plainte..." />
          </div>

          {/* Numéro plaignant */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Numéro WhatsApp</label>
            <input readOnly value={displayNumber(fromNumber)} className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>

          {/* Upload PJ supplémentaires */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Pièces jointes supplémentaires</label>
            <input ref={fileRef} type="file" multiple onChange={e => setFiles(Array.from(e.target.files))} className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {files.length > 0 && <p className="text-xs text-gray-400 mt-1">{files.length} fichier(s) sélectionné(s)</p>}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50">Annuler</button>
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Enregistrement...' : 'Enregistrer la plainte'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WgprCreateComplaintModal;
