import React from 'react';

const STATUS_CONFIG = {
  connected:    { dot: 'bg-green-500',  pulse: '',             label: 'Connecté',        text: 'text-green-700' },
  qr_pending:   { dot: 'bg-yellow-400', pulse: 'animate-ping', label: 'En attente QR',   text: 'text-yellow-700' },
  connecting:   { dot: 'bg-yellow-400', pulse: 'animate-ping', label: 'Connexion...',    text: 'text-yellow-700' },
  disconnected: { dot: 'bg-red-500',    pulse: '',             label: 'Déconnecté',      text: 'text-red-700' },
};

const WgprStatusIndicator = ({ status, className = '' }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.disconnected;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        {cfg.pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`} />}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.dot}`} />
      </span>
      <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
    </span>
  );
};

export default WgprStatusIndicator;
