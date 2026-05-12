import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RecyclingIcon from '@mui/icons-material/Recycling';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import BarChartIcon from '@mui/icons-material/BarChart';
import PublicIcon from '@mui/icons-material/Public';
import StarBorder from '@mui/icons-material/StarBorder';
import PieChartIcon from '@mui/icons-material/PieChart';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import { WhatsApp } from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import WorkIcon from '@mui/icons-material/Work';
import CategoryIcon from '@mui/icons-material/Category';
import ClassIcon from '@mui/icons-material/Class';
import DataObjectIcon from '@mui/icons-material/DataObject';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { AddToDriveOutlined, KeyTwoTone } from '@mui/icons-material';
import GavelIcon from '@mui/icons-material/Gavel';
import NotificationAddIcon from '@mui/icons-material/NotificationAdd';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { RestoreFromTrash } from '@mui/icons-material';
import ArticleIcon from '@mui/icons-material/Article';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuizIcon from '@mui/icons-material/Quiz';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink, useLocation } from 'react-router-dom';
import { loadItemFromLocalStorage, loadItemFromSessionStorage } from '../Utils/utils';
import { connect } from 'react-redux';
import { authenticate } from '../redux/actions/LayoutActions';
import { useHistory } from 'react-router-dom';

// ── Purely visual sub-components ─────────────────────────────────────────────

const GroupLabel = ({ children }) => (
  <div style={{
    padding: '10px 16px 3px',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '1.4px',
    color: 'rgba(255,255,255,0.30)',
    textTransform: 'uppercase',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }}>
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 1 }} />
    {children}
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 1 }} />
  </div>
);


// Coming-soon placeholder item (visually present but inactive)
const LockedItem = ({ icon, label, pl = 2 }) => (
  <ListItemButton
    disableRipple
    sx={{
      borderRadius: '8px', mx: 0.75, my: 0.1, pl, pr: 1.5,
      cursor: 'default', pointerEvents: 'none', opacity: 0.42,
      '& .MuiListItemText-primary': { fontSize: '13px', fontWeight: 400, color: 'white' },
      '& .MuiListItemIcon-root': { minWidth: 36 },
    }}
  >
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={label} />
    <span style={{
      fontSize: 8, padding: '2px 6px', borderRadius: 10,
      background: 'rgba(255,255,255,0.11)',
      color: 'rgba(255,255,255,0.55)',
      fontWeight: 700, letterSpacing: '0.6px',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      Bientôt
    </span>
  </ListItemButton>
);

// ── Main component ────────────────────────────────────────────────────────────

export const Items = (props) => {
  const { pathname } = useLocation();

  // ── Collapse state (preserved exactly) ──────────────────────────────────
  const [open, setOpen]   = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [open4, setOpen4] = React.useState(false);
  const [open5, setOpen5] = React.useState(false);
  const [open6, setOpen6] = React.useState(false);

  const handleClick  = () => setOpen(!open);
  const handleClick1 = () => setOpen1(!open1);
  const handleClick2 = () => setOpen2(!open2);
  const handleClick3 = () => setOpen3(!open3);
  const handleClick4 = () => setOpen4(!open4);
  const handleClick5 = () => setOpen5(!open5);
  const handleClick6 = () => setOpen6(!open6);

  // ── Auth / user (preserved exactly) ─────────────────────────────────────
  const history = useHistory();
  const logOut = (e) => {
    e.preventDefault();
    sessionStorage.clear();
    props.authenticate();
    history.push('/');
  };

  let mode = loadItemFromLocalStorage('app-mode') !== undefined
    ? JSON.parse(loadItemFromLocalStorage('app-mode'))
    : undefined;
  let user = loadItemFromSessionStorage('app-user') !== undefined
    ? JSON.parse(loadItemFromSessionStorage('app-user'))
    : undefined;
  let hbt  = (user.posteDto.habilitations).split(',');
  let addR = user.additionalRole;

  // ── Styling helpers ──────────────────────────────────────────────────────
  const isActive = (path) =>
    pathname === path || pathname.startsWith(path + '/');

  const col     = (active) => ({ color: active ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: '18px', transition: 'color 0.2s' });
  const chevron = { color: 'rgba(255,255,255,0.35)', fontSize: '16px' };
  const link    = { color: 'white', textDecoration: 'none' };

  // Top-level leaf item
  const iSx = (path, pl = 2) => {
    const active = isActive(path);
    return {
      borderRadius: '8px',
      mx: 0.75,
      my: 0.1,
      pl,
      pr: 1.5,
      minHeight: 38,
      transition: 'background 0.18s',
      backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
      '&:hover': { backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)' },
      '& .MuiListItemText-primary': {
        fontSize: '13px',
        fontWeight: active ? 700 : 400,
        color: active ? '#fff' : 'rgba(255,255,255,0.78)',
      },
      '& .MuiListItemIcon-root': { minWidth: 34 },
    };
  };

  // Collapsible section header
  const hSx = (basePath, pl = 2) => {
    const active = isActive(basePath);
    return {
      borderRadius: '8px',
      mx: 0.75,
      my: 0.1,
      pl,
      pr: 1.5,
      minHeight: 38,
      transition: 'background 0.18s',
      backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
      '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
      '& .MuiListItemText-primary': {
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        color: active ? '#fff' : 'rgba(255,255,255,0.82)',
      },
      '& .MuiListItemIcon-root': { minWidth: 34 },
    };
  };

  // Sub-item leaf (dot marker, no icon)
  const sSx = (path) => {
    const active = isActive(path);
    return {
      borderRadius: '7px',
      mx: 0.75,
      my: 0.05,
      pl: 2.5,
      pr: 1.5,
      minHeight: 32,
      transition: 'background 0.18s',
      backgroundColor: active ? 'rgba(255,255,255,0.13)' : 'transparent',
      '&:hover': { backgroundColor: active ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.05)' },
      '& .MuiListItemText-primary': {
        fontSize: '12.5px',
        fontWeight: active ? 600 : 400,
        color: active ? '#fff' : 'rgba(255,255,255,0.62)',
      },
      '& .MuiListItemIcon-root': { minWidth: 22 },
    };
  };

  // Small dot for sub-items
  const SubDot = ({ active }) => (
    <div style={{
      width: active ? 6 : 4,
      height: active ? 6 : 4,
      borderRadius: '50%',
      background: active ? '#fff' : 'rgba(255,255,255,0.3)',
      transition: 'all 0.2s',
      flexShrink: 0,
    }} />
  );

  // ── Visibility flags (same conditions as original) ───────────────────────
  const showDashboard    = mode === 1;
  const showReclamations = hbt.some(i => ['H1','H2','H3','H4','H5','H6','H7','H8','H9','H10','H14'].includes(i));
  const showDenonciations= hbt.some(i => ['H1','H2','H3','H4','H5','H6','H7','H8','H9','H10','H14'].includes(i));
  const showSuggestions  = hbt.some(i => ['H1','H7','H8','H9','H10','H14'].includes(i));
  const showRapports     = hbt.includes('H11') && mode === 1;
  const showAlertes      = (hbt.includes('H13') || addR === 'PILOTE' || addR === 'DE') && mode === 1;
  const showWhatsapp     = (addR === 'PILOTE' || addR === 'DE') && mode === 1;
  const showConfigs      = hbt.includes('H12') && mode === 1;

  const hasGestion = showReclamations || showDenonciations || showSuggestions;
  const hasAnalyse = showRapports || showAlertes;
  const hasAdmin   = showWhatsapp || showConfigs;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <React.Fragment>

      {/* ── Dashboard ── */}
      {showDashboard && (
        <NavLink to="/dashboard" activeClassName="hero" style={link}>
          <ListItemButton sx={iSx('/dashboard')} className="lib">
            <ListItemIcon><DashboardIcon style={col(isActive('/dashboard'))} /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </NavLink>
      )}

      {/* ══ GESTION ══════════════════════════════════════════════════════════ */}
      {hasGestion && <GroupLabel>Gestion</GroupLabel>}

      {/* Réclamations */}
      {showReclamations && (
        <>
          <ListItemButton onClick={handleClick} sx={hSx('/reclamations')}>
            <ListItemIcon><InboxIcon style={col(isActive('/reclamations'))} /></ListItemIcon>
            <ListItemText primary="Réclamations" />
            {open ? <ExpandLess style={chevron} /> : <ExpandMore style={chevron} />}
          </ListItemButton>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>

              {hbt.includes('H1') && (
                <NavLink to="/reclamations/enregistrement" activeClassName="hero" style={link}>
                  <ListItemButton sx={sSx('/reclamations/enregistrement')} className="lib">
                    <ListItemIcon><SubDot active={isActive('/reclamations/enregistrement')} /></ListItemIcon>
                    <ListItemText primary="Enregistrement" />
                  </ListItemButton>
                </NavLink>
              )}

              {(hbt.some(i => ['H2','H3','H4','H6'].includes(i)) || addR === 'PILOTE' || addR === 'DE') && mode === 1 && (
                <NavLink to="/reclamations/traitement/all" activeClassName="hero" style={link}>
                  <ListItemButton sx={sSx('/reclamations/traitement')} className="lib">
                    <ListItemIcon><SubDot active={isActive('/reclamations/traitement')} /></ListItemIcon>
                    <ListItemText primary="Traitement" />
                  </ListItemButton>
                </NavLink>
              )}

              {(hbt.includes('H5') || addR === 'PILOTE' || addR === 'DE') && mode === 1 && (
                <NavLink to="/reclamations/mesure/all" activeClassName="hero" style={link}>
                  <ListItemButton sx={sSx('/reclamations/mesure')} className="lib">
                    <ListItemIcon><SubDot active={isActive('/reclamations/mesure')} /></ListItemIcon>
                    <ListItemText primary="Mesure de satisfaction" />
                  </ListItemButton>
                </NavLink>
              )}

              {(hbt.includes('H5') || addR === 'PILOTE' || addR === 'DE') && mode === 1 && (
                <NavLink to="/reclamations/assurance/all" activeClassName="hero" style={link}>
                  <ListItemButton sx={sSx('/reclamations/assurance')} className="lib">
                    <ListItemIcon><SubDot active={isActive('/reclamations/assurance')} /></ListItemIcon>
                    <ListItemText primary="Assurance Satisfaction" />
                  </ListItemButton>
                </NavLink>
              )}

              <NavLink to="/reclamations/liste/all" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/reclamations/liste')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/reclamations/liste')} /></ListItemIcon>
                  <ListItemText primary="Liste des réclamations" />
                </ListItemButton>
              </NavLink>

              {(hbt.includes('H5') || addR === 'PILOTE' || addR === 'DE') && mode === 1 && (
                <NavLink to="/reclamations/classees/all" activeClassName="hero" style={link}>
                  <ListItemButton sx={sSx('/reclamations/classees')} className="lib">
                    <ListItemIcon><SubDot active={isActive('/reclamations/classees')} /></ListItemIcon>
                    <ListItemText primary="Classées" />
                  </ListItemButton>
                </NavLink>
              )}

            </List>
          </Collapse>
        </>
      )}

      {/* Dénonciations */}
      {showDenonciations && (
        <>
          <ListItemButton onClick={handleClick1} sx={hSx('/denonciations')}>
            <ListItemIcon><ReportProblemIcon style={col(isActive('/denonciations'))} /></ListItemIcon>
            <ListItemText primary="Dénonciations" />
            {open1 ? <ExpandLess style={chevron} /> : <ExpandMore style={chevron} />}
          </ListItemButton>
          <Collapse in={open1} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>

              {hbt.includes('H1') && (
                <NavLink to="/denonciations/enregistrement" activeClassName="hero" style={link}>
                  <ListItemButton sx={sSx('/denonciations/enregistrement')} className="lib">
                    <ListItemIcon><SubDot active={isActive('/denonciations/enregistrement')} /></ListItemIcon>
                    <ListItemText primary="Enregistrement" />
                  </ListItemButton>
                </NavLink>
              )}

              {(hbt.some(i => ['H2','H3','H4','H6'].includes(i)) || addR === 'PILOTE' || addR === 'DE') && mode === 1 && (
                <NavLink to="/denonciations/traitement/all" activeClassName="hero" style={link}>
                  <ListItemButton sx={sSx('/denonciations/traitement')} className="lib">
                    <ListItemIcon><SubDot active={isActive('/denonciations/traitement')} /></ListItemIcon>
                    <ListItemText primary="Traitement" />
                  </ListItemButton>
                </NavLink>
              )}

              <NavLink to="/denonciations/liste/all" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/denonciations/liste')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/denonciations/liste')} /></ListItemIcon>
                  <ListItemText primary="Liste des dénonciations" />
                </ListItemButton>
              </NavLink>

            </List>
          </Collapse>
        </>
      )}

      {/* Suggestions */}
      {showSuggestions && (
        <>
          <ListItemButton onClick={handleClick2} sx={hSx('/suggestions')}>
            <ListItemIcon><TipsAndUpdatesIcon style={col(isActive('/suggestions'))} /></ListItemIcon>
            <ListItemText primary="Suggestions" />
            {open2 ? <ExpandLess style={chevron} /> : <ExpandMore style={chevron} />}
          </ListItemButton>
          <Collapse in={open2} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>

              {hbt.includes('H1') && (
                <NavLink to="/suggestions/enregistrement" activeClassName="hero" style={link}>
                  <ListItemButton sx={sSx('/suggestions/enregistrement')} className="lib">
                    <ListItemIcon><SubDot active={isActive('/suggestions/enregistrement')} /></ListItemIcon>
                    <ListItemText primary="Enregistrement" />
                  </ListItemButton>
                </NavLink>
              )}

              {(addR === 'PILOTE' || addR === 'DE') && mode === 1 && (
                <NavLink to="/suggestions/traitement/all" activeClassName="hero" style={link}>
                  <ListItemButton sx={sSx('/suggestions/traitement')} className="lib">
                    <ListItemIcon><SubDot active={isActive('/suggestions/traitement')} /></ListItemIcon>
                    <ListItemText primary="Traitement" />
                  </ListItemButton>
                </NavLink>
              )}

              <NavLink to="/suggestions/liste/all" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/suggestions/liste')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/suggestions/liste')} /></ListItemIcon>
                  <ListItemText primary="Liste des suggestions" />
                </ListItemButton>
              </NavLink>

            </List>
          </Collapse>
        </>
      )}

      {/* ══ ANALYSE ══════════════════════════════════════════════════════════ */}
      {hasAnalyse && <GroupLabel>Analyse</GroupLabel>}

      {/* Rapports */}
      {showRapports && (
        <>
          <ListItemButton onClick={handleClick3} sx={hSx('/rapports')}>
            <ListItemIcon><BarChartIcon style={col(isActive('/rapports'))} /></ListItemIcon>
            <ListItemText primary="Rapports" />
            {open3 ? <ExpandLess style={chevron} /> : <ExpandMore style={chevron} />}
          </ListItemButton>
          <Collapse in={open3} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>

              <NavLink to="/rapports/global" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/rapports/global')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/rapports/global')} /></ListItemIcon>
                  <ListItemText primary="Global" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/rapports/bceao" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/rapports/bceao')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/rapports/bceao')} /></ListItemIcon>
                  <ListItemText primary="Commission Bancaire" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/rapports/superset" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/rapports/superset')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/rapports/superset')} /></ListItemIcon>
                  <ListItemText primary="Superset" />
                </ListItemButton>
              </NavLink>

            </List>
          </Collapse>
        </>
      )}

      {/* Alertes */}
      {showAlertes && (
        <>
          <ListItemButton onClick={handleClick5} sx={hSx('/alertes')}>
            <ListItemIcon><NotificationImportantIcon style={col(isActive('/alertes'))} /></ListItemIcon>
            <ListItemText primary="Alertes" />
            {open5 ? <ExpandLess style={chevron} /> : <ExpandMore style={chevron} />}
          </ListItemButton>
          <Collapse in={open5} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>

              <NavLink to="/alertes/reclamations" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/alertes/reclamations')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/alertes/reclamations')} /></ListItemIcon>
                  <ListItemText primary="Réclamations" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/alertes/denonciations" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/alertes/denonciations')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/alertes/denonciations')} /></ListItemIcon>
                  <ListItemText primary="Dénonciations" />
                </ListItemButton>
              </NavLink>

            </List>
          </Collapse>
        </>
      )}

      {/* ══ ADMINISTRATION ═══════════════════════════════════════════════════ */}
      {hasAdmin && <GroupLabel>Administration</GroupLabel>}

      {/* WhatsApp */}
      {showWhatsapp && (
        <NavLink to="/whatsapp/liste" activeClassName="hero" style={link}>
          <ListItemButton sx={iSx('/whatsapp')} className="lib">
            <ListItemIcon><WhatsApp style={col(isActive('/whatsapp'))} /></ListItemIcon>
            <ListItemText primary="WhatsApp" />
          </ListItemButton>
        </NavLink>
      )}

      {/* Configurations */}
      {showConfigs && (
        <>
          <ListItemButton onClick={handleClick4} sx={hSx('/configurations')}>
            <ListItemIcon><SettingsIcon style={col(isActive('/configurations'))} /></ListItemIcon>
            <ListItemText primary="Configurations" />
            {open4 ? <ExpandLess style={chevron} /> : <ExpandMore style={chevron} />}
          </ListItemButton>
          <Collapse in={open4} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>

              <NavLink to="/configurations/institution" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/institution')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/institution')} /></ListItemIcon>
                  <ListItemText primary="Institution" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/pointsServices" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/pointsServices')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/pointsServices')} /></ListItemIcon>
                  <ListItemText primary="Points de services" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/postes" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/postes')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/postes')} /></ListItemIcon>
                  <ListItemText primary="Postes" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/produits" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/produits')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/produits')} /></ListItemIcon>
                  <ListItemText primary="Produits / Services" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/categories" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/categories')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/categories')} /></ListItemIcon>
                  <ListItemText primary="Catégories" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/objets" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/objets')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/objets')} /></ListItemIcon>
                  <ListItemText primary="Objets" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/solutions" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/solutions')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/solutions')} /></ListItemIcon>
                  <ListItemText primary="Solutions" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/langues" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/langues')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/langues')} /></ListItemIcon>
                  <ListItemText primary="Langues" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/supportsCollectes" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/supportsCollectes')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/supportsCollectes')} /></ListItemIcon>
                  <ListItemText primary="Modalités de dépôt" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/utilisateurs" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/utilisateurs')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/utilisateurs')} /></ListItemIcon>
                  <ListItemText primary="Compte Utilisateurs" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/email" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/email')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/email')} /></ListItemIcon>
                  <ListItemText primary="Email" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/sms" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/sms')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/sms')} /></ListItemIcon>
                  <ListItemText primary="SMS" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/logs" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/logs')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/logs')} /></ListItemIcon>
                  <ListItemText primary="Log Système" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/exportations" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/exportations')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/exportations')} /></ListItemIcon>
                  <ListItemText primary="Exportation" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/bot" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/bot')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/bot')} /></ListItemIcon>
                  <ListItemText primary="GPR BOT" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/apikey" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/apikey')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/apikey')} /></ListItemIcon>
                  <ListItemText primary="API KEY" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/recoursExternes" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/recoursExternes')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/recoursExternes')} /></ListItemIcon>
                  <ListItemText primary="Recours Externes" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/notifications" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/notifications')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/notifications')} /></ListItemIcon>
                  <ListItemText primary="Notifications" />
                </ListItemButton>
              </NavLink>

              <NavLink to="/configurations/corbeille" activeClassName="hero" style={link}>
                <ListItemButton sx={sSx('/configurations/corbeille')} className="lib">
                  <ListItemIcon><SubDot active={isActive('/configurations/corbeille')} /></ListItemIcon>
                  <ListItemText primary="RSD supprimées" />
                </ListItemButton>
              </NavLink>

              {/* Ressources (nested) */}
              <ListItemButton onClick={handleClick6} sx={hSx('/ressources', 2)}>
                <ListItemIcon><ArticleIcon style={col(isActive('/ressources'))} /></ListItemIcon>
                <ListItemText primary="Ressources" />
                {open6 ? <ExpandLess style={chevron} /> : <ExpandMore style={chevron} />}
              </ListItemButton>
              <Collapse in={open6} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <NavLink to="/ressources/documents" activeClassName="hero" style={link}>
                    <ListItemButton sx={sSx('/ressources/documents')} className="lib">
                      <ListItemIcon><SubDot active={isActive('/ressources/documents')} /></ListItemIcon>
                      <ListItemText primary="Documents" />
                    </ListItemButton>
                  </NavLink>
                  <NavLink to="/ressources/faq" activeClassName="hero" style={link}>
                    <ListItemButton sx={sSx('/ressources/faq')} className="lib">
                      <ListItemIcon><SubDot active={isActive('/ressources/faq')} /></ListItemIcon>
                      <ListItemText primary="FAQ" />
                    </ListItemButton>
                  </NavLink>
                </List>
              </Collapse>

            </List>
          </Collapse>
        </>
      )}

      {/* ══ AIDE ═════════════════════════════════════════════════════════════ */}
      <GroupLabel>Aide</GroupLabel>

      <NavLink to="/help" activeClassName="hero" style={link}>
        <ListItemButton sx={iSx('/help')} className="lib">
          <ListItemIcon><QuizIcon style={col(isActive('/help'))} /></ListItemIcon>
          <ListItemText primary="FAQ" />
        </ListItemButton>
      </NavLink>

      <NavLink to="/ressources/documents" activeClassName="hero" style={link}>
        <ListItemButton sx={iSx('/ressources/documents')} className="lib">
          <ListItemIcon><FolderSpecialIcon style={col(isActive('/ressources/documents'))} /></ListItemIcon>
          <ListItemText primary="Documents" />
        </ListItemButton>
      </NavLink>

      {/* Déconnexion */}
      <NavLink to="/logout" onClick={logOut} style={link}>
        <ListItemButton sx={{
          borderRadius: '8px', mx: 0.75, my: 0.1, pl: 2, pr: 1.5, minHeight: 38,
          transition: 'background 0.18s',
          '&:hover': { backgroundColor: 'rgba(255,80,80,0.14)' },
          '& .MuiListItemText-primary': { fontSize: '13px', fontWeight: 500, color: 'rgba(255,160,160,0.9)' },
          '& .MuiListItemIcon-root': { minWidth: 34 },
        }}>
          <ListItemIcon><LogoutIcon style={{ color: 'rgba(255,160,160,0.8)', fontSize: '18px' }} /></ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItemButton>
      </NavLink>

    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.layout.isAuthenticated,
  isLoading: state.layout.isLoading,
});

const mapDispatchToProps = (dispatch) => ({
  authenticate: () => dispatch(authenticate()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Items);
