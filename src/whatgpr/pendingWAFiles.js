// Stockage temporaire des URLs de médias WhatsApp en attente d'injection dans le formulaire.
// Persiste dans sessionStorage pour survivre à un refresh de page.

const SESSION_KEY = 'wgpr_pendingMediaInfos';

const _load = () => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]'); }
    catch { return []; }
};

export const setPendingWAMediaInfos  = (infos) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(infos));
};
export const getPendingWAMediaInfos  = () => _load();
export const clearPendingWAMediaInfos = () => {
    sessionStorage.removeItem(SESSION_KEY);
};

/**
 * Télécharge une URL comme objet File JavaScript.
 */
export const fetchAsFile = async (url, filename) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
};

/**
 * Récupère les médias en attente comme vrais File objects.
 * À appeler depuis le formulaire après que les URLs ont été stockées.
 */
export const fetchPendingWAFiles = async () => {
    const infos = _load();
    if (infos.length === 0) return [];
    const results = await Promise.allSettled(
        infos.map(({ url, filename }) => fetchAsFile(url, filename))
    );
    clearPendingWAMediaInfos();
    return results
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);
};
