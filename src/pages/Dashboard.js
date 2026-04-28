import React, { useEffect, useRef } from 'react';
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
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SummarizeIcon from '@mui/icons-material/Summarize';
import RedoIcon from '@mui/icons-material/Redo';
import MenuIcon from '@mui/icons-material/Menu';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

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

const gravityFromDays = (days) => {
  if (days > 5) return { label: 'Critique', color: '#dc2626', bg: '#fee2e2' };
  if (days > 3) return { label: 'Haute',    color: '#ea580c', bg: '#fff7ed' };
  if (days > 1) return { label: 'Moyenne',  color: '#d97706', bg: '#fffbeb' };
  return             { label: 'Faible',   color: '#059669', bg: '#ecfdf5' };
};

// ─────────────────────────────────────────────────────────────────────────────
// VISUAL SUB-COMPONENTS  (zero business logic)
// ─────────────────────────────────────────────────────────────────────────────

// KPI Card
const StatCard = ({ value, label, sub, IconComp, iconColor, iconBg, loading }) => (
  <div className="bg-white rounded-xl p-5 border border-slate-100 flex-1 flex flex-col justify-between gap-3"
    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)' }}>
    <div className="flex items-start justify-between">
      <div className="text-[11px] font-bold text-slate-400 tracking-[0.8px] uppercase">{label}</div>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <IconComp style={{ color: iconColor, fontSize: 18 }} />
      </div>
    </div>
    <div>
      <div className="text-[34px] font-bold text-slate-900 leading-none">
        {loading ? <CircularProgress size={24} style={{ color: iconColor }} /> : (value ?? '—')}
      </div>
      {sub && <div className="text-xs text-slate-400 mt-1.5">{sub}</div>}
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

const CardHeader = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <span className="text-sm font-bold text-slate-900">{title}</span>
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

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 14, height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={segments.filter(s => s.value > 0)}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            stroke="none"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {segments.filter(s => s.value > 0).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(value, name, props) => [value, props.payload.label]} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
      }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{total}</div>
          <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>total</div>
      </div>
    </div>
  );
};

const ChartLegend = ({ segments }) => (
  <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 justify-center">
    {segments.filter(s => s.value > 0).map((s, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: s.color }} />
        <span className="text-[11px] text-slate-500">{s.label}</span>
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
          <div className="w-14 text-xs text-gray-700 text-right flex-shrink-0 font-medium">{item.label}</div>
          <div className="flex-1 h-[18px] rounded bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded transition-[width] duration-700 ease-in-out"
              style={{ background: item.color, width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <div className="w-6 text-xs text-gray-500 text-right font-semibold">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

// Claim list row (récents + en retard)
const ClaimRow = ({ item, showGravity }) => {
  const prefix = item.type === 'CLAIM' ? 'REC' : 'DEN';
  const code   = `${prefix}-${item.claimCode}`;
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

  // ── User / habilitations (preserved exactly) ───────────────────────────
  const user = loadItemFromSessionStorage('app-user') !== undefined
    ? JSON.parse(loadItemFromSessionStorage('app-user')) : undefined;
  const hbt  = (user.posteDto.habilitations).split(',');
  const addR = user.additionalRole;

  // ── Config localStorage data (preserved exactly) ───────────────────────
  let ps, postes, langues, objets, recours, utilisateurs, supports, produits;
  try {
    postes       = JSON.parse(loadItemFromLocalStorage('app-postes'));
    ps           = JSON.parse(loadItemFromLocalStorage('app-ps'));
    langues      = JSON.parse(loadItemFromLocalStorage('app-langues'));
    objets       = JSON.parse(loadItemFromLocalStorage('app-objets'));
    recours      = JSON.parse(loadItemFromLocalStorage('app-recours'));
    utilisateurs = JSON.parse(loadItemFromLocalStorage('app-users'));
    supports     = JSON.parse(loadItemFromLocalStorage('app-supports'));
    produits     = JSON.parse(loadItemFromLocalStorage('app-produits'));
  } catch {
    postes = []; ps = []; langues = []; objets = [];
    recours = []; utilisateurs = []; supports = []; produits = [];
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
  const treated     = props.dashboard?.claimsTreat           ?? 0;
  const affected    = props.dashboard?.claimsAffected        ?? 0;
  const overdue     = props.dashboard?.TotalclaimDenunRetard ?? 0;
  const claimsCount = props.dashboard?.claims                ?? 0;
  const denUnsCount = props.dashboard?.denuns                ?? 0;
  const suggestCount= props.dashboard?.suggest               ?? 0;
  const satisfPct   = (props.dashboard?.tauxSatisfaction ?? 0) / 100;

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
  const gMineur = content.filter(i => i.gravity === 'Mineur' || i.gravity === 'low' || (!i.gravity && (i.retardDay || 0) <= 2)).length;
  const gMoyen  = content.filter(i => i.gravity === 'Moyen' || i.gravity === 'medium' || (!i.gravity && (i.retardDay || 0) > 2 && (i.retardDay || 0) <= 5)).length;
  const gGrave  = content.filter(i => i.gravity === 'Grave' || i.gravity === 'high' || i.gravity === 'critical' || (!i.gravity && (i.retardDay || 0) > 5)).length;

  // Recent items — claimDenunRetard sorted by receiptDateTime desc, first 6
  const recentItems  = [...content].sort((a, b) => new Date(b.receiptDateTime) - new Date(a.receiptDateTime)).slice(0, 6);
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

  const page = { padding: '24px 24px 48px', background: '#f8fafc', minHeight: '100vh' };
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

  // ══════════════════════════════════════════════════════════════════════════
  return hbt.includes('H12') ? (

    /* ════════════════════════════ VUE ADMINISTRATION ════════════════════ */
    <div style={page}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h4 style={{ margin: '0 0 4px', fontWeight: 700, color: '#0f172a', fontSize: 22 }}>Administration</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: 13.5 }}>Gestion et suivi des configurations système</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
        <StatCard value={`${compte} / 7`}                 label="Modules configurés"    sub="modules requis"    IconComp={SettingsIcon}             iconColor="#005081"  iconBg="#e0f0ff" loading={false} />
        <StatCard value={utilisateurs.length}              label="Utilisateurs"          sub="comptes déclarés"  IconComp={PersonOutlineOutlinedIcon} iconColor="#0891b2"  iconBg="#ecfeff" loading={false} />
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
      </div>

      {/* Charts */}
      <div className="row" style={{ marginBottom: 4 }}>

        {/* Donut état configuration */}
        <div className="col l4 m12 s12" style={{ marginBottom: 16 }}>
          <Card>
            <CardHeader title="État de configuration" />
            <DonutChart segments={[
              { label: 'Configuré',  value: compte,     color: '#10b981' },
              { label: 'Manquant',   value: 7 - compte, color: '#ef4444' },
            ]} loading={false} />
            <ChartLegend segments={[
              { label: 'Configuré',  value: compte,     color: '#10b981' },
              { label: 'Manquant',   value: 7 - compte, color: '#ef4444' },
            ]} />
          </Card>
        </div>

        {/* Barres verticales — Ressources système */}
        <div className="col l4 m12 s12" style={{ marginBottom: 16 }}>
          <Card>
            <CardHeader title="Ressources système" />
            <VerticalBars loading={false} data={[
              { label: 'Postes',    value: postes.length,    color: '#3b82f6' },
              { label: 'Langues',   value: langues.length,   color: '#8b5cf6' },
              { label: 'Supports',  value: supports.length,  color: '#10b981' },
              { label: 'Produits',  value: produits.length,  color: '#f59e0b' },
            ]} />
          </Card>
        </div>

        {/* Barres horizontales — Paramètres métier */}
        <div className="col l4 m12 s12" style={{ marginBottom: 16 }}>
          <Card>
            <CardHeader title="Paramètres métier" />
            <HorizontalBars loading={false} data={[
              { label: 'Utilisateurs', value: utilisateurs.length, color: '#3b82f6' },
              { label: 'Points srv.',  value: ps.length,           color: '#8b5cf6' },
              { label: 'Objets',       value: objets.length,       color: '#f59e0b' },
              { label: 'Recours',      value: recours.length,      color: '#ef4444' },
            ]} />
          </Card>
        </div>

      </div>

      {/* Tableau configurations manquantes */}
      <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>

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

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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

    </div>

  ) : (

    /* ════════════════════════════ TABLEAU DE BORD ═══════════════════════ */
    <div style={page}>

      {/* ── Section 1 : Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h4 style={{ margin: '0 0 4px', fontWeight: 700, color: '#0f172a', fontSize: 22 }}>Tableau de bord</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: 13.5 }}>Vue d'ensemble des dossiers et indicateurs clés</p>
        </div>
        {hbt.includes('H1') && (
          <NavLink to="/reclamations/enregistrement" style={{ textDecoration: 'none' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#0f172a', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <AddCircleOutlineIcon style={{ fontSize: 17 }} />
              Nouveau dossier
            </div>
          </NavLink>
        )}
      </div>

      {/* ── Section 2 : 8 KPI cards (données exactes du dashboard) ── */}
      <div className="row" style={{ marginBottom: 4 }}>

        <div className="col l3 m6 s12" style={{ marginBottom: 14 }}>
          <StatCard value={total}       label="Réclamations, Dénonciations et Suggestions" sub="total dossiers"      IconComp={SummarizeIcon}             iconColor="#059db1" iconBg="#e0f8fa" loading={loading} />
        </div>
        <div className="col l3 m6 s12" style={{ marginBottom: 14 }}>
          <StatCard value={claimsCount} label="Réclamations"                               IconComp={ReceiptLongIcon}            iconColor="#f96f00" iconBg="#fff3e8" loading={loading} />
        </div>
        <div className="col l3 m6 s12" style={{ marginBottom: 14 }}>
          <StatCard value={treated}     label="Réclamations Traitées"                      IconComp={RecyclingIcon}              iconColor="#f96f00" iconBg="#fff3e8" loading={loading} />
        </div>
        <div className="col l3 m6 s12" style={{ marginBottom: 14 }}>
          <StatCard value={affected}    label="Réclamations affectées"                     IconComp={RedoIcon}                  iconColor="#059db1" iconBg="#e0f8fa" loading={loading} />
        </div>

        <div className="col l3 m6 s12" style={{ marginBottom: 14 }}>
          <StatCard value={denUnsCount} label="Dénonciations"                              IconComp={ReceiptLongIcon}            iconColor="#f9005e" iconBg="#ffe8f0" loading={loading} />
        </div>
        <div className="col l3 m6 s12" style={{ marginBottom: 14 }}>
          <StatCard value={suggestCount}label="Suggestions"                               IconComp={InboxOutlinedIcon}          iconColor="#1e2188" iconBg="#eaebff" loading={loading} />
        </div>
        <div className="col l3 m6 s12" style={{ marginBottom: 14 }}>
          <StatCard value={overdue}     label="En retard de traitement"                    IconComp={AssignmentLateIcon}         iconColor="#f9005e" iconBg="#ffe8f0" loading={loading} />
        </div>
        <div className="col l3 m6 s12" style={{ marginBottom: 14 }}>
          <StatCard
            value={props.dashboard?.tauxSatisfaction != null ? props.dashboard.tauxSatisfaction + ' %' : undefined}
            label="Satisfaction cliente"
            IconComp={SentimentSatisfiedAltIcon}
            iconColor="#1e2188" iconBg="#eaebff"
            loading={loading}
          />
        </div>

      </div>

      {/* ── Section 3 : Charts (dérivés des 8 KPI) ── */}
      <div className="row" style={{ marginBottom: 4 }}>

        <div className="col l4 m12 s12" style={{ marginBottom: 16 }}>
          <Card>
            <CardHeader title="Par statut" />
            <DonutChart segments={donutSegments} loading={loading} />
            <ChartLegend segments={donutSegments} />
          </Card>
        </div>

        <div className="col l4 m12 s12" style={{ marginBottom: 16 }}>
          <Card>
            <CardHeader title="Par catégorie" />
            <VerticalBars loading={loading} data={[
              { label: 'Réclamations',  value: claimsCount,  color: '#f96f00' },
              { label: 'Dénonciations', value: denUnsCount,  color: '#f9005e' },
              { label: 'Suggestions',   value: suggestCount, color: '#1e2188' },
            ]} />
          </Card>
        </div>

        <div className="col l4 m12 s12" style={{ marginBottom: 16 }}>
          <Card>
            <CardHeader title="Par gravité (retards)" />
            <HorizontalBars loading={loading} data={[
              { label: 'Mineur', value: gMineur, color: '#10b981' },
              { label: 'Moyen',  value: gMoyen,  color: '#f59e0b' },
              { label: 'Grave',  value: gGrave,  color: '#dc2626' },
            ]} />
          </Card>
        </div>

      </div>

      {/* ── Section 4 : Listes dossiers ── */}
      <div className="row">

        {/* ── Dossiers récents ── */}
        <div className="col l6 m12 s12" style={{ marginBottom: 16 }}>
          <Card>
            <CardHeader
              title="Dossiers récents"
              action={
                <NavLink to="/reclamations/liste" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#005081', fontWeight: 600 }}>
                  Voir tout <ArrowForwardIcon style={{ fontSize: 14 }} />
                </NavLink>
              }
            />
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                <CircularProgress size={24} />
              </div>
            ) : recentItems.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                Aucun dossier récent
              </div>
            ) : (
              recentItems.map((item, i) => {
                const isRec = item.type === 'CLAIM';
                const url   = isRec
                  ? (item.status === 'TREAT' ? `/reclamations/mesure/${item.claimCode}` : `/reclamations/traitement/${item.claimCode}`)
                  : `/denonciations/traitement/${item.claimCode}`;
                const dateStr = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(item.receiptDateTime));
                return (
                  <NavLink key={i} to={url} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div
                      style={{ padding: '11px 0', borderBottom: i < recentItems.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.15s', borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700, flexShrink: 0,
                            background: isRec ? '#fff3e8' : '#ffe8f0',
                            color:      isRec ? '#f96f00' : '#f9005e',
                          }}>
                            {isRec ? 'Réclamation' : 'Dénonciation'}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#005081', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.claimCodeClient}
                            </span>
                            <span style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                              {item.objet?.libelle || item.objet || item.subject || item.content || "Non fourni par l'API"}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{dateStr}</span>
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

        {/* ── Dossiers en retard ── */}
        <div className="col l6 m12 s12" style={{ marginBottom: 16 }}>
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
                const isRec = item.type === 'CLAIM';
                const url   = isRec
                  ? (item.status === 'TREAT' ? `/reclamations/mesure/${item.claimCode}` : `/reclamations/traitement/${item.claimCode}`)
                  : `/denonciations/traitement/${item.claimCode}`;
                const reçuStr = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(item.receiptDateTime));
                return (
                  <NavLink key={i} to={url} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div
                      style={{ padding: '11px 0', borderBottom: i < overdueItems.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.15s', borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700, flexShrink: 0,
                            background: isRec ? '#fff3e8' : '#ffe8f0',
                            color:      isRec ? '#f96f00' : '#f9005e',
                          }}>
                            {isRec ? 'Réclamation' : 'Dénonciation'}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#005081', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.claimCodeClient}
                            </span>
                            <span style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                              {item.objet?.libelle || item.objet || item.subject || item.content || "Non fourni par l'API"}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#f9005e', background: '#ffe8f0', padding: '2px 8px', borderRadius: 20 }}>
                            {item.retardDay}
                          </span>
                          <span style={{ fontSize: 10, color: '#94a3b8' }}>{reçuStr}</span>
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
