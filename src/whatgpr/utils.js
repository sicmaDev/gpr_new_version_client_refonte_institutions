import { HOST } from '../Utils/globals';

export const displayNumber = (jid) => {
    if (!jid) return '';
    return jid
        .replace(/@c\.us$/, '')
        .replace(/@lid$/, '')
        .replace(/@s\.whatsapp\.net$/, '')
        .replace(/@g\.us$/, '');
};

// Passe par le proxy Spring Boot (jamais d'appel direct au microservice Node depuis le navigateur)
export const mediaUrl = (path) => path ? `${HOST.replace(/\/$/, '')}/api/whatgpr/uploads/${path}` : '';

// Détecte si un message a été envoyé par l'agent GPR (par opposition à reçu du client).
// Source unique — évite de recalculer cette logique différemment à plusieurs endroits.
export const isSentMessage = (msg) => msg.message_id?.startsWith('true') || msg.sent === true;

export const formatMessagePreview = (msg) => {
    if (!msg) return '-';
    if (msg.type === 'chat') return msg.content || '';
    const icons = { image: '📷', video: '🎬', audio: '🎵', ptt: '🎵', document: '📎', sticker: '🏷️' };
    return icons[msg.type] || '📎';
};

export const isSameDay = (ts1, ts2) => {
    const d1 = new Date(ts1);
    const d2 = new Date(ts2);
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

export const formatDayLabel = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(timestamp, today.getTime())) return "Aujourd'hui";
    if (isSameDay(timestamp, yesterday.getTime())) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const fileNameFromPath = (path) => {
    if (!path) return '';
    const parts = path.replace(/\\/g, '/').split('/');
    let name = parts[parts.length - 1];
    // strip timestamp prefix like 1234567890_filename.pdf → filename.pdf
    name = name.replace(/^\d+_/, '');
    return name;
};
