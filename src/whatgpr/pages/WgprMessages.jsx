import React, { useState, useEffect, useCallback } from 'react';
import { getMessages, markReadBatch } from '../api';
import WgprCreateComplaintModal from '../components/WgprCreateComplaintModal';
import { useSSE } from '../hooks/useSSE';
import { displayNumber, formatMsgDate, isSameDay, dayLabel, mediaPreview } from '../utils';
import toast, { Toaster } from 'react-hot-toast';

const BASE_MEDIA = '/api/whatgpr/uploads/';
const FILTERS = [{ key: 'all', label: 'Tous' }, { key: 'unread', label: 'Non lus' }, { key: 'archived', label: 'Archivés' }];

const MediaBubble = ({ msg }) => {
  const path = msg.content || msg.mediaPath || msg.media_path || '';
  const url = path.startsWith('http') ? path : `${BASE_MEDIA}${path}`;
  const fname = path.split(/[/\\]/).pop().replace(/^\d+[-_]/, '');
  switch (msg.type) {
    case 'image':
      return <a href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt="" className="max-w-[260px] max-h-[256px] rounded-xl object-cover" /></a>;
    case 'video':
      return <video src={url} controls className="max-w-[260px] rounded-xl" />;
    case 'audio':
    case 'ptt':
      return <audio src={url} controls className="h-9 max-w-[260px]" />;
    default:
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline text-sm">
          <span>📎</span><span className="truncate max-w-[200px]">{fname}</span>
        </a>
      );
  }
};

const WgprMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMessages(filter);
      setMessages(Array.isArray(data) ? data : data?.content || []);
    } catch {
      toast.error('Erreur chargement messages');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  useSSE({
    new_message: (d) => {
      toast(`Nouveau message de ${displayNumber(d.from)}`, { duration: 4000 });
      load();
    },
  });

  // Grouper par contact
  const contacts = React.useMemo(() => {
    const map = new Map();
    for (const m of messages) {
      const num = m.fromNumber || m.from_number || m.from || '';
      if (!map.has(num)) map.set(num, []);
      map.get(num).push(m);
    }
    return Array.from(map.entries())
      .map(([num, msgs]) => ({
        num,
        msgs: msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)),
        last: msgs.reduce((l, m) => (!l || (m.timestamp || 0) > (l.timestamp || 0)) ? m : l, null),
        unread: msgs.filter(m => !m.read && !m.isRead).length,
      }))
      .sort((a, b) => (b.last?.timestamp || 0) - (a.last?.timestamp || 0));
  }, [messages]);

  const contactMessages = selectedContact
    ? (contacts.find(c => c.num === selectedContact)?.msgs || [])
    : [];

  const handleContactClick = async (num) => {
    setSelectedContact(num);
    setSelected(new Set());
    const unreadIds = contacts.find(c => c.num === num)?.msgs.filter(m => !m.read && !m.isRead).map(m => m.id) || [];
    if (unreadIds.length > 0) {
      try { await markReadBatch(unreadIds); } catch {}
      setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, read: true, isRead: true } : m));
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectedMsgs = contactMessages.filter(m => selected.has(m.id));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />
      <WgprCreateComplaintModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(new Set()); }}
        selectedMessages={selectedMsgs}
        fromNumber={selectedContact || ''}
      />

      {/* Colonne gauche */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 mb-2">Messages</h2>
          <div className="flex gap-1">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${filter === f.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <div className="text-center text-sm text-gray-400 py-8">Chargement...</div>}
          {!loading && contacts.length === 0 && <div className="text-center text-sm text-gray-400 py-8">Aucun message</div>}
          {contacts.map(c => (
            <button
              key={c.num}
              onClick={() => handleContactClick(c.num)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedContact === c.num ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold flex-shrink-0">
                  {displayNumber(c.num).charAt(0) || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 truncate">{displayNumber(c.num)}</span>
                    {c.unread > 0 && (
                      <span className="ml-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {c.last?.type === 'chat' ? c.last.content : mediaPreview(c.last?.type)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Colonne droite */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedContact ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm">Sélectionnez un contact</p>
            </div>
          </div>
        ) : (
          <>
            {/* Barre contextuelle sélection */}
            {selected.size > 0 && (
              <div className="sticky top-0 z-10 bg-indigo-600 text-white px-4 py-2.5 flex items-center gap-3 shadow-md">
                <span className="text-sm font-semibold">{selected.size} message(s)</span>
                <button onClick={() => setSelected(new Set())} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg">Annuler</button>
                <button onClick={() => setSelected(new Set(contactMessages.map(m => m.id)))} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg">Tout sélectionner</button>
                <div className="flex-1" />
                <button onClick={() => setModalOpen(true)} className="text-xs bg-white text-indigo-700 font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-50">Créer une plainte</button>
              </div>
            )}

            {/* Header contact */}
            <div className="px-5 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold">
                {displayNumber(selectedContact).charAt(0)}
              </div>
              <span className="font-bold text-gray-800">{displayNumber(selectedContact)}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
              {contactMessages.map((m, i) => {
                const showSep = i === 0 || !isSameDay(contactMessages[i - 1].timestamp, m.timestamp);
                return (
                  <React.Fragment key={m.id || i}>
                    {showSep && (
                      <div className="flex items-center gap-2 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium px-2">{dayLabel(m.timestamp)}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}
                    <div
                      className="flex items-start gap-2 group cursor-pointer"
                      onClick={() => toggleSelect(m.id)}
                    >
                      <div className={`flex-shrink-0 w-4 h-4 mt-1 rounded border transition-all ${selected.has(m.id) ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 bg-white opacity-0 group-hover:opacity-100'} ${selected.size > 0 ? 'opacity-100' : ''}`}>
                        {selected.has(m.id) && (
                          <svg className="w-3 h-3 text-white m-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="max-w-[70%] bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm border border-gray-100">
                        {m.type === 'chat' ? (
                          <p className="text-sm text-gray-800 leading-relaxed">{m.content}</p>
                        ) : (
                          <MediaBubble msg={m} />
                        )}
                        <span className="text-[10px] text-gray-400 mt-1 block text-right">{formatMsgDate(m.timestamp)}</span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WgprMessages;
