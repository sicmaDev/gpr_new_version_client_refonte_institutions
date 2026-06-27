import React from 'react';
import { toast, Toaster } from 'react-hot-toast';

const config = {
  success: {
    color: "#059669",
    bg: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
    accent: "#10B981",
    iconBg: "#D1FAE5",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7L5.5 10.5L12 3.5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  error: {
    color: "#DC2626",
    bg: "linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)",
    accent: "#EF4444",
    iconBg: "#FECACA",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 3L11 11M11 3L3 11" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  warning: {
    color: "#D97706",
    bg: "linear-gradient(135deg, #FFFBEB 0%, #FFFDF0 100%)",
    accent: "#F59E0B",
    iconBg: "#FDE68A",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 2L12.5 12H1.5L7 2Z" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 6V8.5" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="7" cy="10.5" r="0.6" fill="#D97706"/>
      </svg>
    ),
  },
  info: {
    color: "#1D4ED8",
    bg: "linear-gradient(135deg, #EFF6FF 0%, #F0F7FF 100%)",
    accent: "#3B82F6",
    iconBg: "#BFDBFE",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="#1D4ED8" strokeWidth="1.8"/>
        <path d="M7 6.5V10" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="7" cy="4.5" r="0.7" fill="#1D4ED8"/>
      </svg>
    ),
  },
};

const CustomToast = ({ t, msg, type }) => {
  const c = config[type] ?? config.info;
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 10px 10px 12px",
        width: 240,
        borderLeft: `3px solid ${c.accent}`,
        opacity: t.visible ? 1 : 0,
        transform: t.visible ? "translateX(0)" : "translateX(20px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      {/* icône */}
      <div
        style={{
          width: 24, height: 24, borderRadius: "50%",
          background: c.iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {c.icon}
      </div>

      {/* message */}
      <span style={{
        flex: 1,
        fontSize: 12,
        fontWeight: 600,
        color: "#1E293B",
        lineHeight: 1.4,
      }}>
        {msg}
      </span>

      {/* fermer */}
      <button
        onClick={() => toast.dismiss(t.id)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#CBD5E1", fontSize: 16, padding: "0 2px",
          lineHeight: 1, flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#94A3B8"}
        onMouseLeave={e => e.currentTarget.style.color = "#CBD5E1"}
      >
        ×
      </button>
    </div>
  );
};

export const notify = (msg, type = "info") => {
  // même type + même message = remplace le toast existant (pas d'empilement)
  toast.custom((t) => <CustomToast t={t} msg={msg} type={type} />, {
    id: `${type}::${msg}`,
    duration: 4000,
  });
};

export default function Alert() {
  return (
    <Toaster
      position="top-right"
      containerStyle={{ top: 20, right: 20 }}
      gutter={8}
      toastOptions={{ duration: 4000 }}
    />
  );
}
