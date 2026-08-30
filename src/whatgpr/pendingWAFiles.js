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

// Le type MIME renvoyé par le blob téléchargé n'est pas fiable pour les fichiers WhatsApp
// (le serveur qui sert le média peut renvoyer un Content-Type générique) — on se base donc
// aussi sur l'extension du nom de fichier, jamais uniquement sur file.type.
const AUDIO_EXT_RE = /\.(ogg|oga|mp3|wav|m4a|opus|aac|amr)$/i;
export const isAudioFile = (file) =>
    !!file && (file.type?.startsWith("audio/") || AUDIO_EXT_RE.test(file.name || ""));

/**
 * Télécharge une URL comme objet File JavaScript.
 */
export const fetchAsFile = async (url, filename) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
};

// Déduplique les appels concurrents : en StrictMode, React monte un composant, exécute
// ses effets, le démonte, puis le remonte aussitôt — deux appels à fetchPendingWAFiles()
// se déclenchent donc quasi simultanément. Vider le sessionStorage avant le fetch (comme
// une version précédente le faisait) évite bien le doublon, mais le premier appel finit
// par mettre à jour l'instance déjà démontée (perdu), tandis que le second ne trouve plus
// rien à récupérer. En partageant la même Promise en cours entre les deux appels, les DEUX
// instances reçoivent le même résultat — celle qui reste montée peut alors l'utiliser.
let inFlightFetch = null;

/**
 * Récupère les médias en attente comme vrais File objects.
 * À appeler depuis le formulaire après que les URLs ont été stockées.
 */
export const fetchPendingWAFiles = async () => {
    if (inFlightFetch) return inFlightFetch;

    const infos = _load();
    if (infos.length === 0) return [];

    inFlightFetch = (async () => {
        try {
            const results = await Promise.allSettled(
                infos.map(({ url, filename }) => fetchAsFile(url, filename))
            );
            clearPendingWAMediaInfos();
            return results
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value);
        } finally {
            inFlightFetch = null;
        }
    })();

    return inFlightFetch;
};
