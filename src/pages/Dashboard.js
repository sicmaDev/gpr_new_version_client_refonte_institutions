import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import ReactDatatable from '@ashvin27/react-datatable';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import RecyclingIcon from '@mui/icons-material/Recycling';
import LanguageIcon from '@mui/icons-material/Language';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import WorkIcon from '@mui/icons-material/Work';
import CategoryIcon from '@mui/icons-material/Category';
import DataObjectIcon from '@mui/icons-material/DataObject';
import GavelIcon from '@mui/icons-material/Gavel';
import { loadItemFromLocalStorage, loadItemFromSessionStorage } from '../Utils/utils';
import CircleIcon from '@mui/icons-material/Circle';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import { dashboardChanged, etat1Changed } from '../redux/actions/DashboardActions';
import { connect } from 'react-redux';
import { DashboardApi } from '../apis/DahboardApi';
import GaugeChart from 'react-gauge-chart';
import SummarizeIcon from '@mui/icons-material/Summarize';
import RedoIcon from '@mui/icons-material/Redo';
import MenuIcon from '@mui/icons-material/Menu';
import CircularProgress from '@mui/material/CircularProgress';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RefreshIcon from '@mui/icons-material/Refresh';
import DnsIcon from '@mui/icons-material/Dns';
import MemoryIcon from '@mui/icons-material/Memory';
import SdStorageIcon from '@mui/icons-material/SdStorage';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { logs, exportLogs } from '../apis/Configurations/LogApi';
import { systemPerformance } from '../apis/Configurations/ReportApi';

// ─────────────────────────────────────────────────────────────────────────────
// VISUAL CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_MAP = {
  SAVED:             { label: 'Enregistrée',   color: '#7c3aed', bg: '#f5f3ff' },
  AFFECTED:          { label: 'Affectée',      color: '#2563eb', bg: '#eff6ff' },
  TREAT:             { label: 'En traitement', color: '#0891b2', bg: '#ecfeff' },
  CLASSED:           { label: 'Classée',       color: '#d97706', bg: '#fffbeb' },
  PARTIAL_SATISFIED: { label: 'Partielle',     color: '#059669', bg: '#ecfdf5' },
  SATISFIED:         { label: 'Satisfait',     color: '#059669', bg: '#ecfdf5' },
  UNSATISFIED:       { label: 'Insatisfait',   color: '#dc2626', bg: '#fef2f2' },
  DESAPPROUVED:      { label: 'Désapprouvée',  color: '#dc2626', bg: '#fef2f2' },
};

const TYPE_BADGE_MAP = {
  CLAIM:      { label: 'Réclamation',  color: '#f97316', bg: '#fff3e8' },
  SUGGESTION: { label: 'Suggestion',   color: '#3b82f6', bg: '#eaebff' },
};
const typeBadge = (type) => TYPE_BADGE_MAP[type] || { label: 'Dénonciation', color: '#ef4444', bg: '#ffe8f0' };

const gravityFromDays = (days) => {
  if (days > 5) return { label: 'Critique', color: '#dc2626', bg: '#fee2e2' };
  if (days > 3) return { label: 'Haute',    color: '#ea580c', bg: '#fff7ed' };
  if (days > 1) return { label: 'Moyenne',  color: '#d97706', bg: '#fffbeb' };
  return             { label: 'Faible',   color: '#059669', bg: '#ecfdf5' };
};

// ── Performance du système — données simulées en attendant une API serveur ──

// Anneau de progression circulaire (style "VUE D'ENSEMBLE")
const RingGauge = ({ value, color, size = 110, thickness = 5 }) => (
  <div style={{ position: 'relative', width: size, height: size }}>
    <CircularProgress variant="determinate" value={100} size={size} thickness={thickness} style={{ color: '#f1f5f9', position: 'absolute', top: 0, left: 0 }} />
    <CircularProgress variant="determinate" value={value} size={size} thickness={thickness} style={{ color, position: 'absolute', top: 0, left: 0 }} />
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: size >= 150 ? 30 : 22, fontWeight: 800, color: '#0f172a' }}>{value}%</span>
    </div>
  </div>
);

// Statut (badge) déduit du taux d'utilisation
const perfStatus = (pct) => (
  pct >= 90 ? { label: 'Critique', color: '#dc2626', bg: '#fee2e2' } :
  pct >= 70 ? { label: 'Élevé',    color: '#d97706', bg: '#fffbeb' } :
              { label: 'Normal',   color: '#059669', bg: '#ecfdf5' }
);

const SystemPerformanceCard = () => {
  const [perf, setPerf] = useState({
    cpu: 0,
    ramUsedGo: 0,
    ramTotalGo: 0,
    diskUsedGo: 0,
    diskTotalGo: 0,
  });

  const refresh = () => {
    systemPerformance()
      .then((response) => setPerf(response.data))
      .catch(() => {});
  };

  useEffect(() => {
    refresh();
  }, []);

  const ramPct = perf.ramTotalGo ? Math.round((perf.ramUsedGo / perf.ramTotalGo) * 100) : 0;
  const diskPct = perf.diskTotalGo ? Math.round((perf.diskUsedGo / perf.diskTotalGo) * 100) : 0;

  const metrics = [
    { key: 'cpu',  label: 'Utilisation CPU', pct: perf.cpu,  sub: `${perf.cpu} % / 100 %`,                              color: '#06b6d4', Icon: SettingsIcon },
    { key: 'ram',  label: 'Mémoire (RAM)',   pct: ramPct,    sub: `${perf.ramUsedGo} Go / ${perf.ramTotalGo} Go`,        color: '#8b5cf6', Icon: MemoryIcon },
    { key: 'disk', label: 'Espace disque',   pct: diskPct,   sub: `${perf.diskUsedGo} Go / ${perf.diskTotalGo} Go`,      color: '#f59e0b', Icon: SdStorageIcon },
  ];

  return (
    <div style={{ marginBottom: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MonitorHeartIcon style={{ color: '#10b981', fontSize: 20 }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Performance du système</div>
            <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>Suivi des ressources serveur en temps réel</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '6px 14px', borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} /> En direct
          </span>
          <button
            onClick={refresh}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#334155', background: '#fff', border: '1px solid #e2e8f0', padding: '7px 14px', borderRadius: 10, cursor: 'pointer' }}
          >
            <RefreshIcon style={{ fontSize: 16 }} /> Actualiser
          </button>
        </div>
      </div>

      {/* Vue d'ensemble — anneaux */}
      <Card style={{ padding: '28px 32px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 32 }}>
          <DnsIcon style={{ fontSize: 16 }} /> Vue d'ensemble
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 48 }}>
          {metrics.map((m) => (
            <div key={m.key} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <RingGauge value={m.pct} color={m.color} size={160} thickness={6} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                <m.Icon style={{ fontSize: 18, color: m.color }} /> {m.label}
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Détails des ressources */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', flex: 1 }}>
        <div style={{ flex: '1 1 420px', display: 'flex' }}>
          <Card style={{ padding: 24, flex: 1 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 20 }}>
              Détails des ressources
            </div>
            {metrics.map((m, i) => {
              const status = perfStatus(m.pct);
              return (
                <div key={m.key} style={{ marginBottom: i < metrics.length - 1 ? 22 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${m.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <m.Icon style={{ fontSize: 16, color: m.color }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{m.label}</div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{m.sub}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: status.color, background: status.bg, padding: '3px 10px', borderRadius: 20 }}>{status.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', minWidth: 36, textAlign: 'right' }}>{m.pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 6, background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 6, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
};

const LOG_TYPE_STYLE = {
  ERROR:   { color: '#dc2626', bg: '#fee2e2', icon: ErrorOutlineIcon },
  WARNING: { color: '#d97706', bg: '#fffbeb', icon: WarningAmberIcon },
  INFO:    { color: '#0891b2', bg: '#ecfeff', icon: InfoOutlinedIcon },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '-';
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMin < 1)  return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `il y a ${diffH} h`;
  const diffJ = Math.floor(diffH / 24);
  return `il y a ${diffJ} j`;
};

// ─────────────────────────────────────────────────────────────────────────────
// VISUAL SUB-COMPONENTS  (zero business logic)
// ─────────────────────────────────────────────────────────────────────────────

// KPI Card
const StatCard = ({ value, label, sub, inlineSub, IconComp, iconColor, iconBg, loading, progress }) => (
  <div className="bg-white rounded-xl p-5 border border-slate-100 flex-1 flex flex-col justify-between gap-3"
    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)' }}>
    <div className="flex items-start justify-between">
      <div className="text-[11px] font-bold text-slate-400 tracking-[0.8px] uppercase">{label}</div>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: iconBg || iconColor }}>
        <IconComp style={{ color: iconBg ? iconColor : '#fff', fontSize: 18 }} />
      </div>
    </div>
    <div>
      <div className="text-[34px] font-bold text-slate-900 leading-none">
        {loading ? <CircularProgress size={24} style={{ color: iconColor }} /> : (value ?? '—')}
        {!loading && inlineSub && <span className="text-sm font-semibold text-slate-400 ml-1.5">{inlineSub}</span>}
      </div>
      {sub && <div className="text-xs text-slate-400 mt-1.5">{sub}</div>}
      {progress != null && !loading && (
        <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2.5 overflow-hidden">
          <div className="h-full rounded-full transition-[width] duration-700 ease-in-out" style={{ width: `${Math.min(100, Math.max(0, progress))}%`, background: iconColor }} />
        </div>
      )}
    </div>
  </div>
);

// Config stat card for H12
const ConfigCard = ({ count, label, IconComp, color }) => (
  <div
    className="bg-white rounded-xl px-[18px] py-4 border border-slate-100 flex items-center justify-between h-full"
    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)', borderLeft: `4px solid ${color}` }}
  >
    <div>
      <div className="text-[22px] font-bold text-slate-900">{count}</div>
      <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
    </div>
    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: color + '18' }}>
      <IconComp style={{ color, fontSize: 22 }} />
    </div>
  </div>
);

// Section card wrapper
const Card = ({ children, style }) => (
  <div
    className="bg-white rounded-xl p-5 border border-slate-100 h-full"
    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)', ...style }}
  >
    {children}
  </div>
);

const CardHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <div className="text-sm font-bold text-slate-900">{title}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
    </div>
    {action}
  </div>
);

// Recharts PieChart pour afficher le donut avec pourcentages
const DonutChart = ({ segments, loading }) => {
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150 }}><CircularProgress size={28} /></div>;
  const total = segments.reduce((s, i) => s + (i.value || 0), 0);
  if (total === 0) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150, color: '#94a3b8', fontSize: 13 }}>Aucune donnée</div>;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    if (percent < 0.05) return null; // Ne pas afficher le label si trop petit
    return (
      <text x={x} y={y} fill="white" fontSize="11px" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const SIZE = 180;

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
      <PieChart width={SIZE} height={SIZE}>
        <Pie
          data={segments.filter(s => s.value > 0)}
          cx={SIZE / 2}
          cy={SIZE / 2}
          innerRadius={52}
          outerRadius={82}
          dataKey="value"
          stroke="none"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {segments.filter(s => s.value > 0).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip
          formatter={(value, name, props) => [value, props.payload.label]}
          wrapperStyle={{ zIndex: 10 }}
        />
      </PieChart>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 3 }}>total</div>
      </div>
    </div>
  );
};

// Légende latérale avec pourcentages ou effectifs (style "Traffic Sources")
const SideLegend = ({ segments, total, showCount }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minWidth: 0 }}>
    {segments.map((s, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
          {showCount ? s.value : `${total > 0 ? Math.round((s.value / total) * 100) : 0}%`}
        </span>
      </div>
    ))}
  </div>
);

// Vertical bar chart
const VerticalBars = ({ data, loading }) => {
  if (loading) return <div className="flex justify-center items-center h-[120px]"><CircularProgress size={24} /></div>;
  const max = Math.max(...data.map(d => d.value || 0), 1);
  return (
    <div className="flex items-end gap-2.5 h-[110px] pt-4">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[11px] font-semibold text-gray-700">{item.value}</span>
          <div
            className="w-3/5 rounded-t transition-[height] duration-700 ease-in-out"
            style={{ background: item.color, height: `${(item.value / max) * 86}px`, minHeight: item.value > 0 ? 4 : 0 }}
          />
          <div className="text-[10px] text-slate-500 text-center leading-tight mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

// Horizontal bar chart
const HorizontalBars = ({ data, loading }) => {
  if (loading) return <div className="flex justify-center items-center h-[100px]"><CircularProgress size={24} /></div>;
  const max = Math.max(...data.map(d => d.value || 0), 1);
  return (
    <div className="flex flex-col gap-3 pt-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 text-center"
            style={{ background: item.color + '1A', color: item.color }}
          >
            {item.label}
          </span>
          <div className="flex-1 h-[8px] rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-in-out"
              style={{ background: item.color, width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <div className="w-6 text-xs text-gray-700 text-right font-bold">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

// Claim list row (récents + en retard)
const ClaimRow = ({ item, showGravity }) => {
  const prefix = item.type === 'CLAIM' ? 'REC' : 'DEN';
  const code   = item.claimCodeClient || `${prefix}-${item.claimCode}`;
  const st     = STATUS_MAP[item.status] || { label: item.status || '—', color: '#64748b', bg: '#f8fafc' };
  const grav   = gravityFromDays(item.retardDay || 0);
  const date   = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(item.receiptDateTime));
  const desc   = item.content || item.objet || item.subject || item.claimCodeClient || code;
  const url    = item.type === 'CLAIM'
    ? (item.status === 'TREAT' ? `/reclamations/mesure/${item.claimCode}` : `/reclamations/traitement/${item.claimCode}`)
    : `/denonciations/traitement/${item.claimCode}`;

  return (
    <NavLink to={url} className="no-underline text-inherit block">
      <div className="py-[11px] border-b border-slate-50 hover:bg-slate-50 transition-colors">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#005081]">{code}</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: showGravity ? grav.bg : st.bg, color: showGravity ? grav.color : st.color }}
            >
              {showGravity ? grav.label : st.label}
            </span>
          </div>
          {showGravity ? (
            <span className="text-[11px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
              +{item.retardDay}j
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">{date}</span>
          )}
        </div>
        <div className="text-[12.5px] text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
          {desc}
        </div>
      </div>
    </NavLink>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const Dashboard = (props) => {

  // ── Data fetch (preserved exactly) ─────────────────────────────────────
  useEffect(() => {
    props.etat1Changed(false);
    DashboardApi(props).then(() => {});
  }, []);

  // ── Datatable config (preserved exactly) ───────────────────────────────
  const tableConfig = {
    page_size: 15, length_menu: [15, 25, 50, 100],
    show_filter: true, show_pagination: true,
    filename: 'Liste des dénonciations', button: {},
    language: {
      length_menu: 'Afficher _MENU_ éléments', filter: 'Rechercher...',
      info: "Affichage de l'élement _START_ à _END_ sur _TOTAL_ éléments",
      zero_records: 'Aucun élément à afficher', no_data_text: 'Aucun élément à afficher',
      loading_text: 'Chargement en cours...',
      pagination: { first: <FirstPageIcon />, previous: <ChevronLeftIcon />, next: <ChevronRightIcon />, last: <LastPageIcon /> },
    },
  };

  // ── User / habilitations ───────────────────────────────────────────────
  const user = loadItemFromSessionStorage('app-user') !== undefined
    ? JSON.parse(loadItemFromSessionStorage('app-user')) : undefined;
  const hbt     = (user.posteDto.habilitations).split(',');
  const addR    = user.additionalRole;
  const isRA    = user.ra === true;
  const isPilote = addR === 'PILOTE';
  const agenceName = user.servicePointDto?.libelle || 'Mon agence';

  // ── Activité récente (logs système) — vue admin H12 ────────────────────
  const [recentLogs, setRecentLogs] = useState([]);
  const [exportHistory, setExportHistory] = useState([]);
  useEffect(() => {
    if (hbt.includes('H12')) {
      logs().then(({ data }) => setRecentLogs((data.content || []).slice(0, 6)))
        .catch(() => setRecentLogs([]));
      exportLogs().then(({ data }) => setExportHistory((data.content || []).slice(0, 6)))
        .catch(() => setExportHistory([]));
    }
  }, []);

  // ── Config localStorage data (preserved exactly) ───────────────────────
  let ps, postes, langues, objets, utilisateurs, supports, produits;
  try {
    postes       = JSON.parse(loadItemFromLocalStorage('app-postes'));
    ps           = JSON.parse(loadItemFromLocalStorage('app-ps'));
    langues      = JSON.parse(loadItemFromLocalStorage('app-langues'));
    objets       = JSON.parse(loadItemFromLocalStorage('app-objets'));
    utilisateurs = JSON.parse(loadItemFromLocalStorage('app-users'));
    supports     = JSON.parse(loadItemFromLocalStorage('app-supports'));
    produits     = JSON.parse(loadItemFromLocalStorage('app-produits'));
  } catch {
    postes = []; ps = []; langues = []; objets = [];
    utilisateurs = []; supports = []; produits = [];
  }

  // ── Gauge computation (preserved exactly) ──────────────────────────────
  let compte = 0;
  compte = postes.length       !== 0 ? compte + 1 : compte;
  compte = ps.length           !== 0 ? compte + 1 : compte;
  compte = langues.length      !== 0 ? compte + 1 : compte;
  compte = objets.length       !== 0 ? compte + 1 : compte;
  compte = produits.length     !== 0 ? compte + 1 : compte;
  compte = utilisateurs.length !== 0 ? compte + 1 : compte;
  compte = supports.length     !== 0 ? compte + 1 : compte;
  const className = compte < 7 ? 'col l8 m8 s12' : 'col l12 m12 s12';

  // ── Datatable columns (preserved exactly) ──────────────────────────────
  const columns = [
    { key: 'type', text: 'Type', className: 'type', align: 'left', sortable: true,
      cell: (c) => c.type === 'CLAIM' ? 'Réclamation' : 'Dénonciation' },
    { key: 'claimCodeClient', text: 'Code Client', className: 'retard', align: 'left', sortable: true },
    { key: 'receiptDateTimeFormated', text: 'Reçu le', className: 'receiptDateTime', align: 'left', sortable: true,
      cell: (c) => new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric' }).format(new Date(c.receiptDateTime)) },
    { key: 'declenchedAtFormated', text: 'Déclenchée le', className: 'declenchedDate', align: 'left', sortable: true,
      cell: (c) => new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric' }).format(new Date(c.declenchedDate)) },
    { key: 'retardDay', text: 'En retard de', className: 'retard', align: 'left', sortable: true },
    { key: 'action', text: 'Action', className: '', align: 'left', sortable: false,
      cell: (claim) => {
        let url = claim.type === 'CLAIM'
          ? (claim.status === 'TREAT' ? '/reclamations/mesure/' + claim.claimCode : '/reclamations/traitement/' + claim.claimCode)
          : '/denonciations/traitement/' + claim.claimCode;
        return <NavLink to={url}><div className="card-content red-text"><MenuIcon /></div></NavLink>;
      }},
  ];

  // ── Table data (preserved exactly) ─────────────────────────────────────
  let content = props.dashboard?.claimDenunRetard ?? [];
  content.forEach(el => {
    el.declenchedAtFormated    = new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric' }).format(new Date(el.declenchedDate));
    el.receiptDateTimeFormated = new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric' }).format(new Date(el.receiptDateTime));
  });

  // ── Derived display values (from props.dashboard.* only — no invention) ─
  const loading     = props.etat1 === false;
  const total       = props.dashboard?.plainteSuggest        ?? 0;
  const treated     = props.dashboard?.totalTreat            ?? 0;
  const affected    = props.dashboard?.totalAffected         ?? 0;
  const overdue     = props.dashboard?.TotalclaimDenunRetard ?? 0;
  const awaitingMeasure = props.dashboard?.claimsAwaitingMeasure ?? 0;
  const claimsCount = props.dashboard?.claims                ?? 0;
  const denUnsCount = props.dashboard?.denuns                ?? 0;
  const suggestCount= props.dashboard?.suggest               ?? 0;
  const satisfPct   = (props.dashboard?.tauxSatisfaction ?? 0) / 100;

  // Portée (scope) renvoyée par le backend — uniquement pour RA et User simple
  const scopeType        = props.dashboard?.scopeType;
  const scopeLabel       = props.dashboard?.scopeLabel;
  const subAgencesCount  = props.dashboard?.subAgencesCount ?? 0;

  // "En traitement" = all active (non-closed) = total - classified
  const inProgress  = Math.max(0, total - treated);

  // Donut segments — dérivés des KPI avec nouveaux statuts demandés
  const valTraite = props.dashboard?.claimsTreat ?? 0;
  const valAffecte = props.dashboard?.claimsAffected ?? 0;
  const valSatisfait = props.dashboard?.claimsSatisfied ?? 0;
  const valClasse = props.dashboard?.claimsClassed ?? props.dashboard?.claimsClosed ?? 0;
  const valEnregistre = Math.max(0, total - valTraite - valAffecte - valSatisfait - valClasse);

  const donutSegments = [
    { label: 'Traité',     value: valTraite,     color: '#3b82f6' },
    { label: 'Enregistré', value: valEnregistre, color: '#8b5cf6' },
    { label: 'Affecté',    value: valAffecte,    color: '#ef4444' },
    { label: 'Satisfait',  value: valSatisfait,  color: '#10b981' },
    { label: 'Classé',     value: valClasse,     color: '#f59e0b' },
  ];

  // Gravity distribution — mapping Mineur, Moyen, Grave (en retard)
  const gMineur = content.filter(i => i.gravity === 'MINEUR').length;
  const gMoyen  = content.filter(i => i.gravity === 'MOYEN').length;
  const gGrave  = content.filter(i => i.gravity === 'GRAVE').length;

  // Overdue items — sorted by retardDay desc, first 5
  const overdueItems = [...content].sort((a, b) => (b.retardDay || 0) - (a.retardDay || 0)).slice(0, 5);

  // ── Gauge section (config preserved exactly, wrapper improved) ─────────
  const settingTauxRef = useRef(null);
  const missingLink    = { color: '#005081', textDecoration: 'none', fontWeight: 500, fontSize: 13 };
  const missingRow     = { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid #f8fafc' };

  const configChart = (
    <Card>
      <CardHeader title="Taux de configuration système" />
      <div className="row" style={{ margin: 0 }}>
        <div className={className}>
          <GaugeChart
            id="gauge-chart5"
            ref={settingTauxRef}
            nrOfLevels={420}
            arcsLength={[0.3, 0.5, 0.2]}
            arcWidth="0.2"
            colors={['#EA4228', '#F5CD19', '#5BE12C']}
            textColor="#000000"
            percent={compte / 7}
            arcPadding={0.02}
          />
        </div>
        <div className="col l4 m4 s12">
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
            Configurations manquantes
          </div>
          {langues.length      !== 0 ? '' : <div style={missingRow}><CircleIcon style={{ color: '#FFC400', fontSize: 10 }} /><NavLink to="/configurations/langues"          style={missingLink}>Langues</NavLink></div>}
          {ps.length           !== 0 ? '' : <div style={missingRow}><CircleIcon style={{ color: '#5243AA', fontSize: 10 }} /><NavLink to="/configurations/pointsServices"    style={missingLink}>Points de services</NavLink></div>}
          {postes.length       !== 0 ? '' : <div style={missingRow}><CircleIcon style={{ color: '#666666', fontSize: 10 }} /><NavLink to="/configurations/postes"            style={missingLink}>Postes</NavLink></div>}
          {utilisateurs.length !== 0 ? '' : <div style={missingRow}><CircleIcon style={{ color: '#253858', fontSize: 10 }} /><NavLink to="/configurations/utilisateurs"      style={missingLink}>Utilisateurs</NavLink></div>}
          {supports.length     !== 0 ? '' : <div style={missingRow}><CircleIcon style={{ color: '#FFC400', fontSize: 10 }} /><NavLink to="/configurations/supportsCollectes" style={missingLink}>Supports de collectes</NavLink></div>}
          {objets.length       !== 0 ? '' : <div style={missingRow}><CircleIcon style={{ color: '#0052CC', fontSize: 10 }} /><NavLink to="/configurations/objets"            style={missingLink}>Objets de réclamations</NavLink></div>}
          {produits.length     !== 0 ? '' : <div style={missingRow}><CircleIcon style={{ color: '#00B8D9', fontSize: 10 }} /><NavLink to="/configurations/produits"          style={missingLink}>Produits / Services</NavLink></div>}
        </div>
      </div>
    </Card>
  );

  const page = { background: '#f8fafc', minHeight: '100vh' };
  const pageClass = 'px-3 pt-3 pb-8 sm:px-6 sm:pt-6 sm:pb-12';
  const seeAll = (to, label = 'Voir tout') => (
    <NavLink to={to} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#005081', fontWeight: 600 }}>
      {label} <ArrowForwardIcon style={{ fontSize: 14 }} />
    </NavLink>
  );

  // ── Config items (preserved logic) — pour la vue H12 ──────────────────
  const allConfigItems = [
    { label: 'Langues',               route: '/configurations/langues',          data: langues,       IconComp: LanguageIcon,              color: '#FFC400' },
    { label: 'Points de services',    route: '/configurations/pointsServices',    data: ps,            IconComp: AddBusinessIcon,           color: '#5243AA' },
    { label: 'Postes',                route: '/configurations/postes',            data: postes,        IconComp: WorkIcon,                  color: '#666666' },
    { label: 'Utilisateurs',          route: '/configurations/utilisateurs',      data: utilisateurs,  IconComp: PersonOutlineOutlinedIcon, color: '#253858' },
    { label: 'Supports de collectes', route: '/configurations/supportsCollectes', data: supports,      IconComp: RecyclingIcon,             color: '#059db1' },
    { label: 'Objets de réclamations',route: '/configurations/objets',            data: objets,        IconComp: DataObjectIcon,            color: '#0052CC' },
    { label: 'Produits / Services',   route: '/configurations/produits',          data: produits,      IconComp: CategoryIcon,              color: '#00B8D9' },
  ];
  const pendingConfigs = allConfigItems.filter(c => c.data.length === 0);

  // ── Vue opérationnelle partagée (données déjà filtrées côté backend) ──────
  const vueOperationnelle = (
    /* ════════════════════════════ TABLEAU DE BORD ═══════════════════════ */
    <div className={pageClass} style={page}>

      {/* ── Section 1 : Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '0 0 4px', fontWeight: 700, color: '#0f172a', fontSize: 22 }}>Tableau de bord</h4>
        <p style={{ margin: 0, color: '#64748b', fontSize: 13.5 }}>Vue d'ensemble des dossiers et indicateurs clés</p>
      </div>

      {/* ── Bannière direction (RA uniquement, quand le point de service est une DIRECTION) ── */}
      {isRA && scopeType === 'DIRECTION' && !loading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 18px', marginBottom: 20,
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe', borderRadius: 12,
          borderLeft: '4px solid #3b82f6',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <InfoOutlinedIcon style={{ color: '#3b82f6', fontSize: 20 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1d4ed8' }}>
              Vue Direction — {scopeLabel}
            </div>
            <div style={{ fontSize: 12.5, color: '#2563eb', marginTop: 2 }}>
              Vous consultez les données de votre direction et des {subAgencesCount} agence{subAgencesCount !== 1 ? 's' : ''} rattachée{subAgencesCount !== 1 ? 's' : ''}.
            </div>
          </div>
          <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {subAgencesCount + 1} point{subAgencesCount + 1 !== 1 ? 's' : ''} de service
          </span>
        </div>
      )}

      {/* ── Section 2 : KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>

        <StatCard value={total}          label="RSD enregistrées" sub={`${claimsCount} réc. · ${denUnsCount} dén. · ${suggestCount} sug.`} IconComp={SummarizeIcon} iconColor="#6366f1" loading={loading} />
        <StatCard value={affected}        label="Affectés"                                   IconComp={RedoIcon}                  iconColor="#8b5cf6" loading={loading} />
        <StatCard value={overdue}         label="En retard de traitement"                    IconComp={AssignmentLateIcon}        iconColor="#f43f5e" loading={loading} />
        <StatCard value={treated}         label="Traités"                                    IconComp={RecyclingIcon}             iconColor="#10b981" loading={loading} />
        <StatCard value={awaitingMeasure} label="En attente de mesure"                       IconComp={AccessTimeIcon}            iconColor="#f59e0b" loading={loading} />
        <StatCard
          value={(() => { const v = Number(props.dashboard?.tauxSatisfaction); return (!isNaN(v) && v > 0) ? v.toFixed(1) + ' %' : '0.0 %'; })()}
          inlineSub={(() => { const v = Number(props.dashboard?.tauxSatisfaction); return (!isNaN(v) && v > 0) ? `(${(v / 100 * 5).toFixed(1)}/5)` : '(0.0/5)'; })()}
          progress={(() => { const v = Number(props.dashboard?.tauxSatisfaction); return !isNaN(v) ? v : 0; })()}
          label="Satisfaction réclamations"
          IconComp={SentimentSatisfiedAltIcon}
          iconColor="#0ea5e9"
          loading={loading}
        />

      </div>

      {/* ── Section 3 : Charts ── */}
      <div className="row" style={{ marginBottom: 4 }}>

        <div className="col l4 m12 s12" style={{ marginBottom: 16 }}>
          <Card>
            <CardHeader title="Par statut" subtitle="Répartition des dossiers" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: '0 0 45%', minWidth: 0 }}>
                <DonutChart segments={donutSegments} loading={loading} />
              </div>
              <SideLegend segments={donutSegments} total={donutSegments.reduce((s, i) => s + (i.value || 0), 0)} showCount />
            </div>
          </Card>
        </div>

        <div className="col l4 m12 s12" style={{ marginBottom: 16 }}>
          <Card>
            <CardHeader title="Par catégorie" subtitle="Types de dossiers" />
            <VerticalBars loading={loading} data={[
              { label: 'Réclamations',  value: claimsCount,  color: '#f97316' },
              { label: 'Dénonciations', value: denUnsCount,  color: '#ef4444' },
              { label: 'Suggestions',   value: suggestCount, color: '#3b82f6' },
            ]} />
          </Card>
        </div>

        <div className="col l4 m12 s12" style={{ marginBottom: 16 }}>
          <Card>
            <CardHeader title="Par gravité" subtitle="Niveaux de criticité" />
            <HorizontalBars loading={loading} data={[
              { label: 'Grave',  value: gGrave,  color: '#dc2626' },
              { label: 'Moyen',  value: gMoyen,  color: '#f59e0b' },
              { label: 'Mineur', value: gMineur, color: '#10b981' },
            ]} />
          </Card>
        </div>

      </div>

      {/* ── Section 4 : Dossiers en retard ── */}
      <div className="row">
        <div className="col l12 m12 s12" style={{ marginBottom: 16 }}>
          <Card>
            <CardHeader
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <AssignmentLateIcon style={{ fontSize: 16, color: '#f9005e' }} />
                  Dossiers en retard
                </span>
              }
              action={
                <NavLink to="/alertes/reclamations" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#005081', fontWeight: 600 }}>
                  Voir tout <ArrowForwardIcon style={{ fontSize: 14 }} />
                </NavLink>
              }
            />
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                <CircularProgress size={24} />
              </div>
            ) : overdueItems.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                Aucun dossier en retard
              </div>
            ) : (
              overdueItems.map((item, i) => {
                const badge = typeBadge(item.type);
                const url   = item.type === 'CLAIM'
                  ? (item.status === 'TREAT' ? `/reclamations/mesure/${item.claimCode}` : `/reclamations/traitement/${item.claimCode}`)
                  : `/denonciations/traitement/${item.claimCode}`;
                return (
                  <NavLink key={i} to={url} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div
                      style={{ padding: '11px 0', borderBottom: i < overdueItems.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.15s', borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700, flexShrink: 0, background: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#005081', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.claimCodeClient}
                            </span>
                            <span style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                              {item.objetLibelle || item.objet?.libelle || item.content || '—'}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: '#f9005e', background: '#ffe8f0', padding: '2px 8px', borderRadius: 20 }}>
                            <AccessTimeIcon style={{ fontSize: 12 }} />
                            {item.retardDay} retard
                          </span>
                          <ArrowForwardIcon style={{ fontSize: 14, color: '#005081' }} />
                        </div>
                      </div>
                    </div>
                  </NavLink>
                );
              })
            )}
          </Card>
        </div>
      </div>

      <div className="content-overlay" />
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  return hbt.includes('H12') ? (

    /* ════════════════════════════ VUE ADMINISTRATION ════════════════════ */
    <div className={pageClass} style={page}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h4 style={{ margin: '0 0 4px', fontWeight: 700, color: '#0f172a', fontSize: 22 }}>Administration</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: 13.5 }}>Gestion et suivi des configurations système</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard value={`${compte} / 7`}                 label="Modules configurés"    sub="modules requis"    IconComp={SettingsIcon}             iconColor="#005081"  iconBg="#e0f0ff" loading={false} />
        <StatCard value={Math.round((compte / 7) * 100) + '%'} label="Taux de config"  sub="progression totale" IconComp={TrendingUpIcon}           iconColor="#059669"  iconBg="#d1fae5" loading={false} />
        <StatCard
          value={pendingConfigs.length}
          label="Manquants"
          sub={pendingConfigs.length === 0 ? 'Tout est configuré ✓' : 'à compléter'}
          IconComp={ReportProblemOutlinedIcon}
          iconColor={pendingConfigs.length > 0 ? '#dc2626' : '#059669'}
          iconBg={pendingConfigs.length > 0 ? '#fee2e2' : '#d1fae5'}
          loading={false}
        />
        <StatCard value={utilisateurs.length}              label="Utilisateurs"          sub="comptes créés"  IconComp={PersonOutlineOutlinedIcon} iconColor="#0891b2"  iconBg="#ecfeff" loading={false} />
      </div>

      {/* Section : Configuration / Paramètres métier & Performance du système */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>

        {/* Configuration & Paramètres métier */}
        <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Donut état configuration */}
          <Card style={{ padding: 28 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>État de configuration</div>
              <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 3 }}>Répartition des modules configurés</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: '0 0 50%', minWidth: 0 }}>
                <DonutChart segments={[
                  { label: 'Configuré',  value: compte,     color: '#10b981' },
                  { label: 'Manquant',   value: 7 - compte, color: '#ef4444' },
                ]} loading={false} />
              </div>
              <SideLegend segments={[
                { label: 'Configuré',  value: compte,     color: '#10b981' },
                { label: 'Manquant',   value: 7 - compte, color: '#ef4444' },
              ]} total={7} />
            </div>
          </Card>

          {/* Tableau configurations manquantes */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <SettingsIcon style={{ color: '#005081', fontSize: 18 }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>Configurations à compléter</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
                  {pendingConfigs.length === 0
                    ? 'Toutes les configurations sont complètes ✓'
                    : `${pendingConfigs.length} module${pendingConfigs.length > 1 ? 's' : ''} en attente de configuration`}
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  {['Module', 'Éléments', 'Statut', 'Action'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allConfigItems.map((item, i) => {
                  const done = item.data.length > 0;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc', background: done ? 'transparent' : '#fffbf0' }}>
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: item.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <item.IconComp style={{ color: item.color, fontSize: 15 }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{item.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 12px', fontSize: 13, color: '#64748b' }}>
                        {item.data.length} élément{item.data.length !== 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '11px 12px' }}>
                        <span style={{
                          fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 600,
                          background: done ? '#d1fae5' : '#fee2e2',
                          color:      done ? '#065f46' : '#dc2626',
                        }}>
                          {done ? '✓ Configuré' : '⚠ Manquant'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 12px' }}>
                        {!done && (
                          <NavLink to={item.route} style={{ textDecoration: 'none' }}>
                            <span style={{
                              fontSize: 12, padding: '5px 12px', borderRadius: 7, fontWeight: 600,
                              background: '#005081', color: 'white', cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}>
                              Configurer <ArrowForwardIcon style={{ fontSize: 13 }} />
                            </span>
                          </NavLink>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </Card>

        </div>

        {/* Performance du système (données simulées en attendant l'API serveur) */}
        <div style={{ flex: '2 1 600px' }}>
          <SystemPerformanceCard />
        </div>

      </div>

      {/* Activité récente & Alertes */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>

        {/* Activité récente — derniers logs système */}
        <div style={{ flex: '1 1 480px', display: 'flex' }}>
          <Card style={{ flex: 1 }}>
            <CardHeader title="Activité récente" action={seeAll('/configurations/logs')} />
            {recentLogs.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                Aucune activité récente
              </div>
            ) : (
              recentLogs.map((log, i) => {
                const style = LOG_TYPE_STYLE[(log.type || '').toUpperCase()] || LOG_TYPE_STYLE.INFO;
                const Icon  = style.icon;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0',
                    borderBottom: i < recentLogs.length - 1 ? '1px solid #f8fafc' : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: style.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon style={{ color: style.color, fontSize: 15 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.libelle || log.content || '—'}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {timeAgo(log.createdAt)}
                    </div>
                  </div>
                );
              })
            )}
          </Card>
        </div>

        {/* Historique des exportations */}
        <div style={{ flex: '2 1 600px', display: 'flex' }}>
          <Card style={{ flex: 1 }}>
            <CardHeader title="Historique des exportations" action={seeAll('/configurations/exportation')} />
            {exportHistory.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                Aucun export effectué
              </div>
            ) : (
              exportHistory.map((exp, i) => {
                const TYPE_COLORS = { claims: '#3B82F6', denunciations: '#F59E0B', suggestions: '#10B981', configs: '#8B5CF6' };
                const TYPE_LABELS = { claims: 'Réclamations', denunciations: 'Dénonciations', suggestions: 'Suggestions', configs: 'Configurations' };
                const bg    = TYPE_COLORS[exp.content] || '#64748B';
                const label = TYPE_LABELS[exp.content] || exp.content || '—';
                const date  = exp.createdAt
                  ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(exp.createdAt))
                  : '—';
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                    borderBottom: i < exportHistory.length - 1 ? '1px solid #f8fafc' : 'none',
                  }}>
                    <span style={{ background: bg, color: '#fff', fontWeight: 700, fontSize: 11, borderRadius: 6, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                    <div style={{ flex: 1, fontSize: 12.5, color: '#334155', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {exp.userIpAddress || '—'}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {date}
                    </div>
                  </div>
                );
              })
            )}
          </Card>
        </div>

      </div>

    </div>

  ) : isPilote ? (

    /* ════════════════ VUE PILOTE ════════════════ */
    vueOperationnelle

  ) : isRA ? (

    /* ════════════════ VUE RA ════════════════ */
    vueOperationnelle

  ) : (

    /* ════════════════ VUE USER SIMPLE ════════════════ */
    vueOperationnelle

  );
};


// ── Redux (preserved exactly) ─────────────────────────────────────────────────

const mapStateToProps = (state) => ({
  dashboard: state.dashboard.dashboard,
  etat1:     state.dashboard.etat1,
});

const mapDispatchToProps = (dispatch) => ({
  dashboardChanged: (d) => dispatch(dashboardChanged(d)),
  etat1Changed:     (e) => dispatch(etat1Changed(e)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
