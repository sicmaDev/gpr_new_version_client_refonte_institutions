import { useState, useEffect, useRef, useCallback } from 'react';
import { getStatus } from '../api';

// Passe toujours par le proxy Spring Boot authentifié (jamais d'appel direct au
// microservice Node depuis le navigateur).
const useWhatsappStatus = () => {
    const [status, setStatus]         = useState('disconnected');
    const [showQRModal, setShowQRModal] = useState(false);
    const intervalRef = useRef(null);

    const clearPoll = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const checkStatus = useCallback(async () => {
        try {
            const d = await getStatus();
            setStatus(d.status ?? 'disconnected');
        } catch (err) {
            // Backend ou Node.js inaccessible → déconnecté
            console.error('[WhatGPR] Erreur récupération statut:', err);
            setStatus('disconnected');
        }
    }, []);

    // Vérification initiale
    useEffect(() => { checkStatus(); }, [checkStatus]);

    // Polling : toutes les 5s si non connecté, toutes les 30s si connecté
    useEffect(() => {
        const interval = status === 'connected' ? 30_000 : 5_000;

        if (status === 'connected') setShowQRModal(false);

        clearPoll();
        intervalRef.current = setInterval(checkStatus, interval);
        return clearPoll;
    }, [status, checkStatus]);

    return { status, showQRModal, setShowQRModal, checkStatus, setStatus };
};

export default useWhatsappStatus;
