export const displayNumber = (jid) => {
  if (!jid) return '';
  return jid
    .replace(/@c\.us$/, '')
    .replace(/@lid$/, '')
    .replace(/@s\.whatsapp\.net$/, '')
    .replace(/@g\.us$/, '');
};

export const formatMsgDate = (ts) => {
  if (!ts) return '';
  const d = new Date(typeof ts === 'string' && ts.length === 13 ? parseInt(ts) : ts);
  return d.toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
};

export const isSameDay = (ts1, ts2) => {
  const d1 = new Date(typeof ts1 === 'string' && ts1.length === 13 ? parseInt(ts1) : ts1);
  const d2 = new Date(typeof ts2 === 'string' && ts2.length === 13 ? parseInt(ts2) : ts2);
  return d1.toDateString() === d2.toDateString();
};

export const dayLabel = (ts) => {
  const d = new Date(typeof ts === 'string' && ts.length === 13 ? parseInt(ts) : ts);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });
};

export const mediaPreview = (type) => {
  if (type === 'image') return '📷';
  if (type === 'audio' || type === 'ptt') return '🎵';
  if (type === 'video') return '🎬';
  return '📎';
};
