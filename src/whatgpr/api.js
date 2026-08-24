import { loadItemFromSessionStorage } from '../Utils/utils';
import { HOST } from '../Utils/globals';

const BASE = HOST.replace(/\/$/, '') + '/api/whatgpr';

const authHeader = () => ({
    'Authorization': 'Bearer ' + loadItemFromSessionStorage('token'),
    'Content-Type': 'application/json',
});

// Vérifie response.ok avant de parser le JSON - sans ça, une erreur HTTP (403 sécurité,
// 500 serveur) avec un corps JSON valide passait silencieusement comme un succès avec des
// données incohérentes. Journalise systématiquement pour rendre les échecs diagnosticables.
const handleResponse = async (response) => {
    if (!response.ok) {
        let message = `${response.status} ${response.statusText}`;
        try {
            const body = await response.json();
            message = body?.content?.message || body?.message || message;
        } catch (_) { /* corps non JSON - on garde le message par défaut */ }
        console.error(`[WhatGPR] Erreur API (${response.url}) : ${message}`);
        throw new Error(message);
    }
    return response.json();
};

// Même principe pour les appels qui n'attendent pas de corps JSON en retour.
const ensureOk = (response) => {
    if (!response.ok) {
        console.error(`[WhatGPR] Erreur API (${response.url}) : ${response.status} ${response.statusText}`);
        throw new Error(`${response.status} ${response.statusText}`);
    }
    return response;
};

// WhatsApp
export const getQR = () =>
    fetch(`${BASE}/whatsapp/qr`, { headers: authHeader() }).then(handleResponse);

export const getStatus = () =>
    fetch(`${BASE}/whatsapp/status`, { headers: authHeader() }).then(handleResponse);

export const disconnect = () =>
    fetch(`${BASE}/whatsapp/disconnect`, { method: 'POST', headers: authHeader() }).then(ensureOk);

export const forceRestart = () =>
    fetch(`${BASE}/whatsapp/force-restart`, { method: 'POST', headers: authHeader() }).then(ensureOk);

// Messages
export const getMessages = (filter = 'all') =>
    fetch(`${BASE}/messages?filter=${filter}`, { headers: authHeader() }).then(handleResponse);

export const markRead = (id) =>
    fetch(`${BASE}/messages/${id}/read`, { method: 'PATCH', headers: authHeader() }).then(ensureOk);

export const markConverted = (ids) =>
    fetch(`${BASE}/messages/mark-converted`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ ids }),
    }).then(ensureOk);

// Claims nécessitant commentaire pilote (client a voté sans commenter)
export const getClaimsNeedingPilotComment = () =>
    fetch(`${BASE}/claims/needing-pilot-comment`, { headers: authHeader() })
        .then(handleResponse).catch(() => []);
