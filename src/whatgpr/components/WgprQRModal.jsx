import React, { useState, useEffect } from 'react';
import { getQR } from '../api';

const WgprQRModal = ({ open, onClose }) => {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const poll = async () => {
      try {
        setLoading(true);
        const data = await getQR();
        if (!cancelled) setQr(data?.qr || data?.qrCode || null);
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => { cancelled = true; clearInterval(id); };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 max-w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 text-lg">Scanner le QR Code</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Ouvrez WhatsApp → Appareils connectés → Scanner</p>
        <div className="flex items-center justify-center bg-gray-50 rounded-xl p-4 min-h-[200px]">
          {loading && !qr && <div className="text-gray-400 text-sm">Chargement du QR...</div>}
          {qr && <img src={`data:image/png;base64,${qr}`} alt="QR Code" className="max-w-[200px] max-h-[200px]" />}
          {!loading && !qr && <div className="text-gray-400 text-sm">QR non disponible</div>}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">Le QR se rafraîchit automatiquement</p>
      </div>
    </div>
  );
};

export default WgprQRModal;
