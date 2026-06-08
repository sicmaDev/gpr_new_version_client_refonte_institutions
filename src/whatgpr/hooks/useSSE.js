import { useEffect, useRef } from 'react';

const BASE = '/api/whatgpr';

export const useSSE = (handlers = {}) => {
  const esRef = useRef(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const token = sessionStorage.getItem('token') || '';
    const es = new EventSource(`${BASE}/events?token=${encodeURIComponent(token)}`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const type = data.type || data.event;
        if (type && handlersRef.current[type]) handlersRef.current[type](data);
        if (handlersRef.current['*']) handlersRef.current['*'](data);
      } catch {}
    };

    es.onerror = () => { /* silently reconnect */ };

    return () => { es.close(); };
  }, []);
};
