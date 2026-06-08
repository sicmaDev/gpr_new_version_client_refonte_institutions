import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getMessages, getComplaints } from '../api';
import WgprStatusIndicator from '../components/WgprStatusIndicator';
import WgprQRModal from '../components/WgprQRModal';
import { useWhatsappStatus } from '../hooks/useWhatsappStatus';
import { useSSE } from '../hooks/useSSE';
import { displayNumber, formatMsgDate } from '../utils';
import toast, { Toaster } from 'react-hot-toast';

const KpiCard = ({ label, value, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-100',
  };
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-2 ${colors[color] || colors.indigo}`}>
      <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-3xl font-bold">{value ?? '—'}</span>
    </div>
  );
};

const BADGE = { open: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700', closed: 'bg-gray-100 text-gray-600' };
const BADGE_LABEL = { open: 'Ouvert', in_progress: 'En cours', closed: 'Clôturé' };

const WgprDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { status, qrOpen, setQrOpen, refresh: refreshStatus } = useWhatsappStatus();

  useSSE({
    wa_status: (d) => {
      if (d.status === 'connected') {
        toast.success('WhatsApp connecté');
        setQrOpen(false);
        refreshStatus();
      }
    },
    new_message: (d) => toast(`Nouveau message de ${displayNumber(d.from)}`, { duration: 4000 }),
  });

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([getDashboardStats(), getMessages('all'), getComplaints()])
      .then(([s, m, c]) => {
        if (s.status === 'fulfilled') setStats(s.value);
        if (m.status === 'fulfilled') setRecentMessages((Array.isArray(m.value) ? m.value : m.value?.content || []).slice(0, 5));
        if (c.status === 'fulfilled') setRecentComplaints((Array.isArray(c.value) ? c.value : c.value?.content || []).slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const satisfaction = stats
    ? (stats.satisfiedCount && stats.totalSurveys ? Math.round((stats.satisfiedCount / stats.totalSurveys) * 100) : 0)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      <WgprQRModal open={qrOpen} onClose={() => setQrOpen(false)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatGPR</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion des plaintes WhatsApp</p>
        </div>
        <div className="flex items-center gap-3">
          <WgprStatusIndicator status={status} />
          {status !== 'connected' && (
            <button
              onClick={() => setQrOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Connecter
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => <div key={i} className="rounded-2xl border bg-gray-100 h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <KpiCard label="Messages reçus" value={stats?.totalMessages ?? recentMessages.length} color="indigo" />
          <KpiCard label="Plaintes totales" value={stats?.totalComplaints ?? recentComplaints.length} color="gray" />
          <KpiCard label="Ouvertes" value={stats?.openComplaints} color="indigo" />
          <KpiCard label="En cours" value={stats?.inProgressComplaints} color="yellow" />
          <KpiCard label="Taux satisfaction" value={satisfaction !== null ? `${satisfaction}%` : '—'} color="green" />
        </div>
      )}

      {/* 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers messages */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">Derniers messages</h2>
            <Link to="/whatgpr/messages" className="text-xs text-indigo-600 hover:underline font-semibold">Voir tout →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentMessages.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucun message</p>}
            {recentMessages.map((m, i) => (
              <Link key={i} to="/whatgpr/messages" className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold flex-shrink-0">
                  {displayNumber(m.fromNumber || m.from_number || m.from).charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{displayNumber(m.fromNumber || m.from_number || m.from)}</p>
                  <p className="text-xs text-gray-500 truncate">{m.type === 'chat' ? m.content : `[${m.type}]`}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatMsgDate(m.timestamp)}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Dernières plaintes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">Dernières plaintes</h2>
            <Link to="/whatgpr/complaints" className="text-xs text-indigo-600 hover:underline font-semibold">Voir tout →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentComplaints.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucune plainte</p>}
            {recentComplaints.map((c, i) => (
              <Link key={i} to={`/whatgpr/complaints/${c.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{c.title || c.complaintNumber || `Plainte #${c.id}`}</p>
                  <p className="text-xs text-gray-500">{displayNumber(c.fromNumber || c.from_number)}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE[c.status] || BADGE.open}`}>
                  {BADGE_LABEL[c.status] || c.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WgprDashboard;
