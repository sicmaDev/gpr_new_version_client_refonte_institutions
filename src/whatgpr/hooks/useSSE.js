import { useEffect, useRef } from 'react';
import { HOST } from '../../Utils/globals';
import { loadItemFromSessionStorage } from '../../Utils/utils';

// Connexion SSE via Spring Boot (/api/whatgpr/events) — évite le blocage CORS
// du navigateur qui empêchait la connexion directe à Node.js (port 3001).
// fetch() supporte les headers Authorization, contrairement à EventSource.
const SSE_URL = HOST.replace(/\/$/, '') + '/api/whatgpr/events';

// Extrait la valeur après le premier ':' (gère "field:value" et "field: value")
const parseField = (line) => {
    const idx = line.indexOf(':');
    return idx === -1 ? '' : line.slice(idx + 1).trim();
};

const useSSE = (handlers) => {
    const handlersRef = useRef(handlers);

    useEffect(() => {
        handlersRef.current = handlers;
    });

    useEffect(() => {
        let abortController;
        let retryTimeout;
        let inactivityTimer;
        let timedOut = false;

        // Node envoie un ping toutes les 25s (relayé par Spring Boot) — si rien n'arrive
        // pendant 45s (marge réseau incluse), la connexion est considérée morte même si
        // elle ne s'est jamais fermée proprement (pas de FIN/RST), et on force une reconnexion.
        const INACTIVITY_TIMEOUT_MS = 45000;

        const resetInactivityTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                timedOut = true;
                if (abortController) abortController.abort();
            }, INACTIVITY_TIMEOUT_MS);
        };

        const connect = async () => {
            timedOut = false;
            abortController = new AbortController();
            resetInactivityTimer();
            try {
                const token = loadItemFromSessionStorage('token');
                const response = await fetch(SSE_URL, {
                    signal: abortController.signal,
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                    },
                });

                if (!response.ok || !response.body) throw new Error('SSE non disponible');

                const reader  = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer       = '';
                let currentEvent = null;
                let currentData  = null;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    resetInactivityTimer(); // tout octet reçu (y compris les pings) prouve que la connexion est vivante

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // dernière ligne incomplète conservée

                    for (const line of lines) {
                        if (line === '' || line === '\r') {
                            // Ligne vide = fin d'un événement SSE
                            if (currentEvent && currentData !== null) {
                                try {
                                    const data    = JSON.parse(currentData);
                                    const handler = handlersRef.current[currentEvent];
                                    if (typeof handler === 'function') handler(data);
                                } catch (_) {}
                            }
                            currentEvent = null;
                            currentData  = null;
                        } else if (line.startsWith(':')) {
                            // Commentaire SSE (ex: ": ping") — ignoré
                        } else if (line.startsWith('event')) {
                            currentEvent = parseField(line);
                        } else if (line.startsWith('data')) {
                            currentData = parseField(line);
                        }
                    }
                }
                // Stream terminé proprement → reconnecter
                if (inactivityTimer) clearTimeout(inactivityTimer);
                retryTimeout = setTimeout(connect, 3000);
            } catch (err) {
                if (inactivityTimer) clearTimeout(inactivityTimer);
                // AbortError intentionnel (démontage du composant) → ne pas reconnecter.
                // AbortError déclenché par le watchdog d'inactivité → reconnecter comme une vraie coupure.
                if (err.name === 'AbortError' && !timedOut) return;
                retryTimeout = setTimeout(connect, 5000);
            }
        };

        connect();

        return () => {
            if (abortController) abortController.abort();
            if (retryTimeout)    clearTimeout(retryTimeout);
            if (inactivityTimer) clearTimeout(inactivityTimer);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useSSE;
