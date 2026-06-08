import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getComplaint, updateComplaintStatus, replyToComplaint, sendSurvey } from '../api';
import { useSSE } from '../hooks/useSSE';
import { displayNumber, formatMsgDate } from '../utils';
import toast, { Toaster } from 'react-hot-toast';

const BASE_MEDIA = '/api/whatgpr/uploads/';
const BADGE = { open: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700', closed: 'bg-gray-100 text-gray-600' };
const BADGE_LABEL = { open: 'Ouvert', in_progress: 'En cours', closed: 'Clôturé' };

const MediaBubble = ({ msg }) => {
  const path = msg.content || msg.mediaPath || msg.media_path || '';
  const url = path.startsWith('http') ? path : `${BASE_MEDIA}${path}`;
  const fname = path.split(/[/\\]/).pop().replace(/^\d+[-_]/, '');
  switch (msg.type) {
    case 'image':
      return <a href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt="" className="max-w-[260px] max-h-[200px] rounded-xl object-cover" /></a>;
    case 'video':
      return <video src={url} controls className="max-w-[260px] rounded-xl" />;
    case 'audio':
    case 'ptt':
      return <audio src={url} controls className="h-9 max-w-[260px]" />;
    default:
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline text-sm">
          <span>📎</span><span>{fname}</span>
        </a>
      );
  }
};

const WgprComplaintDetail = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [surveySending, setSurveySending] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getComplaint(id);
      setComplaint(data?.content || data);
    } catch {
      toast.error('Erreur chargement plainte');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useSSE({
    survey_response: (d) => {
      if (String(d.complaintId) === String(id)) {
        toast(`Réponse sondage reçue pour ${d.complaintNumber || id}`);
        load();
      }
    },
  });

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateComplaintStatus(id, newStatus);
      setComplaint(prev => ({ ...prev, status: newStatus }));
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Erreur mise à jour statut');
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const withSurvey = !complaint?.surveySent && !complaint?.survey_sent;
      if (withSurvey) {
        await replyToComplaint(id, reply);
        await sendSurvey(id);
        toast.success('Réponse envoyée + sondage envoyé');
      } else {
        await replyToComplaint(id, reply);
        toast.success('Réponse envoyée');
      }
      setReply('');
      load();
    } catch {
      toast.error('Erreur envoi réponse');
    } finally {
      setSending(false);
    }
  };

  const handleSendSurveyAlone = async () => {
    setSurveySending(true);
    try {
      await sendSurvey(id);
      toast.success('Sondage envoyé');
      load();
    } catch {
      toast.error('Erreur envoi sondage');
    } finally {
      setSurveySending(false);
    }
  };

  const handleCloseComplaint = () => handleStatusChange({ target: { value: 'closed' } });
  const handleReopenComplaint = () => handleStatusChange({ target: { value: 'open' } });

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Chargement...</div>;
  if (!complaint) return <div className="flex items-center justify-center h-screen text-gray-400">Plainte introuvable</div>;

  const surveySent = complaint.surveySent || complaint.survey_sent;
  const surveyResp = complaint.surveyResponse || complaint.survey_response;
  const surveyScore = surveyResp?.score;
  const messages = complaint.messages || [];
  const replies = complaint.replies || [];
  const attachments = complaint.attachments || [];
  const images = attachments.filter(a => a.type === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(a.path || a.name || ''));
  const otherAttachments = attachments.filter(a => !images.includes(a));

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/whatgpr/complaints" className="hover:text-indigo-600 font-medium">Plaintes</Link>
          <span>›</span>
          <span className="font-bold text-gray-800">{complaint.complaintNumber || `#${complaint.id}`}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900">{complaint.complaintNumber || `#${complaint.id}`}</h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE[complaint.status] || BADGE.open}`}>
            {BADGE_LABEL[complaint.status] || complaint.status}
          </span>
          {surveySent && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">Sondage envoyé</span>}
        </div>

        {/* Layout 2/3 + 1/3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Colonne principale 2/3 */}
          <div className="lg:col-span-2 space-y-5">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-2">Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{complaint.description || complaint.title || '—'}</p>
            </div>

            {/* Messages liés */}
            {messages.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4">Messages liés ({messages.length})</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {messages.map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="max-w-[80%] bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                        {m.type === 'chat' ? <p className="text-sm text-gray-800">{m.content}</p> : <MediaBubble msg={m} />}
                        <span className="text-[10px] text-gray-400 mt-1 block">{formatMsgDate(m.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historique des réponses */}
            {replies.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4">Historique des réponses</h2>
                <div className="space-y-3">
                  {replies.map((r, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">A</div>
                      <div className="flex-1 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                        <p className="text-sm text-gray-800">{r.body || r.message || r.content}</p>
                        <span className="text-xs text-gray-400 mt-1 block">{formatMsgDate(r.createdAt || r.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formulaire réponse */}
            {complaint.status !== 'closed' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-3">Envoyer une réponse</h2>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={4}
                  placeholder="Votre réponse au plaignant..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none mb-3"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReply}
                    disabled={sending || !reply.trim()}
                    className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Envoi...' : (!surveySent ? 'Envoyer la solution + sondage' : 'Envoyer par WhatsApp')}
                  </button>
                  {!surveySent && <p className="text-xs text-gray-400">Le sondage de satisfaction sera envoyé automatiquement</p>}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar 1/3 */}
          <div className="space-y-5">
            {/* Infos */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Informations</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Numéro WA</p>
                  <p className="text-sm font-semibold text-gray-800 font-mono">{displayNumber(complaint.fromNumber || complaint.from_number)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Créé le</p>
                  <p className="text-sm text-gray-700">{formatMsgDate(complaint.createdAt || complaint.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Mis à jour</p>
                  <p className="text-sm text-gray-700">{formatMsgDate(complaint.updatedAt || complaint.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Statut */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Statut</h3>
              <select
                value={complaint.status}
                onChange={handleStatusChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="open">Ouvert</option>
                <option value="in_progress">En cours</option>
                <option value="closed">Clôturé</option>
              </select>
            </div>

            {/* Pièces jointes */}
            {attachments.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Pièces jointes</h3>
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {images.map((a, i) => {
                      const url = `${BASE_MEDIA}${a.path || a.name}`;
                      return (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt="" className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                        </a>
                      );
                    })}
                  </div>
                )}
                <div className="space-y-1">
                  {otherAttachments.map((a, i) => {
                    const url = `${BASE_MEDIA}${a.path || a.name}`;
                    const fname = (a.path || a.name || '').split(/[/\\]/).pop();
                    return (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-indigo-600 hover:underline">
                        <span>📎</span><span className="truncate">{fname}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sondage de satisfaction */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Sondage de satisfaction</h3>
              {!surveySent && (
                <button
                  onClick={handleSendSurveyAlone}
                  disabled={surveySending}
                  className="w-full px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-60"
                >
                  {surveySending ? 'Envoi...' : 'Envoyer le sondage seul'}
                </button>
              )}
              {surveySent && !surveyResp && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">En attente de réponse...</p>
                  <div className="space-y-1 text-xs text-yellow-600">
                    <p>Option 1 : Satisfait</p>
                    <p>Option 2 : Insatisfait</p>
                    <p>Option 3 : Partiellement satisfait</p>
                  </div>
                </div>
              )}
              {surveyResp && (
                <div>
                  <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Score reçu</p>
                    <p className="font-bold text-lg text-gray-800">
                      {surveyScore === 1 ? 'Satisfait' : surveyScore === 2 ? 'Insatisfait' : 'Partiellement satisfait'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatMsgDate(surveyResp.respondedAt || surveyResp.responded_at)}</p>
                  </div>
                  {surveyScore === 1 && complaint.status !== 'closed' && (
                    <button onClick={handleCloseComplaint} className="w-full px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 mb-2">
                      Clôturer la plainte
                    </button>
                  )}
                  {surveyScore === 2 && complaint.status === 'closed' && (
                    <button onClick={handleReopenComplaint} className="w-full px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 mb-2">
                      Réouvrir la plainte
                    </button>
                  )}
                  {surveyScore === 2 && complaint.status !== 'closed' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-orange-700">Pensez à recontacter le plaignant</p>
                    </div>
                  )}
                  {complaint.status === 'closed' && surveyScore !== 2 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-2 text-center">
                      <span className="text-xs font-semibold text-green-700">Plainte clôturée</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WgprComplaintDetail;
