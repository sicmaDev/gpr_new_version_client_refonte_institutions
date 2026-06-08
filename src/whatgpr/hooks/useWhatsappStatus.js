import { useState, useEffect, useCallback } from 'react';
import { getStatus } from '../api';

export const useWhatsappStatus = () => {
  const [status, setStatus] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getStatus();
      const s = data?.status || data?.state || 'disconnected';
      setStatus(s);
      if (s !== 'connected') setQrOpen(true);
      else setQrOpen(false);
    } catch {
      setStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(() => {
      if (status !== 'connected') refresh();
    }, 5000);
    return () => clearInterval(id);
  }, [refresh, status]);

  return { status, loading, qrOpen, setQrOpen, refresh };
};
