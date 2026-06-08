import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getComplaints } from '../api';
import { displayNumber, formatMsgDate } from '../utils';
import toast, { Toaster } from 'react-hot-toast';

const STATUS_TABS = [
  { key: '', label: 'Tous' },
  { key: 'open', label: 'Ouverts' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'closed', label: 'Clôturés' },
];

const BADGE = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-gray-100 text-gray-600',
};
const BADGE_LABEL = { open: 'Ouvert', in_progress: 'En cours', closed: 'Clôturé' };

const WgprComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getComplaints(statusFilter || undefined)
      .then(data => setComplaints(Array.isArray(data) ? data : data?.content || []))
      .catch(() => toast.error('Erreur chargement plaintes'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plaintes WhatsApp</h1>
            <p className="text-sm text-gray-500 mt-0.5">{complaints.length} plainte(s)</p>
          </div>
          <Link to="/whatgpr/messages" className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
            ← Messages
          </Link>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-4">
          {STATUS_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${statusFilter === t.key ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Chargement...</div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Aucune plainte</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Numéro', 'Titre', 'Numéro WA', 'Statut', 'Nb messages', 'Date création'].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {complaints.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => window.location.href = `/whatgpr/complaints/${c.id}`}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-mono font-bold text-indigo-700">{c.complaintNumber || `#${c.id}`}</td>
                    <td className="px-5 py-3 text-sm text-gray-800 font-medium max-w-[200px] truncate">{c.title}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 font-mono">{displayNumber(c.fromNumber || c.from_number)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE[c.status] || BADGE.open}`}>
                        {BADGE_LABEL[c.status] || c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{c.messagesCount ?? c.messages_count ?? '—'}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{formatMsgDate(c.createdAt || c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default WgprComplaints;
