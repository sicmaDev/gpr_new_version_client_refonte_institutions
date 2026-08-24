import React,{useEffect, useState} from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Items from './Items';
import Contenu from './Contenu';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import Logout from '@mui/icons-material/Logout';
import {NavLink } from "react-router-dom";
import {actifChanged, authenticate,pageChanged} from "../redux/actions/LayoutActions";
import { connect } from 'react-redux';
import { loadItemFromLocalStorage, loadItemFromSessionStorage } from '../Utils/utils';
import { useHistory } from "react-router-dom";
import WifiOffIcon from '@mui/icons-material/WifiOff';
import logo from '../assets/images/logo_gpr.jpg';
import Footer from './Footer';
import { APP_OWNER, APP_OWNER_WEBSITE } from '../Utils/globals';
import { licenseInfo } from '../apis/LoginApi';
import { useThemeColors } from '../context/ThemeColorsContext';


const drawerWidth = 250;

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      height: '100vh',
      backgroundColor: 'var(--gpr-sidebar, #005081)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

let mode =loadItemFromSessionStorage("app-mode") !== undefined ? loadItemFromSessionStorage("app-mode") : undefined;

export const titre = (titre) => {
 return 'titre';
};

let contenuMode;

  if (mode === 0) {
    contenuMode = 
    <>
      <IconButton color="inherit">
        <WifiOffIcon />
      </IconButton>
    </>
    
  }else{
    contenuMode = <></>
  }





const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  // height:"max",
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: 'var(--gpr-topbar, #005081)',
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: 'var(--gpr-topbar, #005081)'
  }),
}));


// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

const getSidebarLuminance = (hex) => {
  try {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  } catch { return 50; }
};

export const Haut = (props) => {
  // const [actif, setActif] = useState();
  const [message, setMessage] = useState();
  
  const licenseControl = async () => {
    try {
      let resultat = await licenseInfo();
      // console.log("actiffff", resultat);
      if (resultat.message !=="") {
        setMessage(resultat.message)
      }
    
    } catch (error) {
      // console.error("Une erreur s'est produite :", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await licenseControl();
    };

    fetchData();
  }, []);
  

  const { colors, logo: institutionLogo } = useThemeColors();
  const sidebarLum = getSidebarLuminance(colors.sidebarColor || '#005081');
  const isDark = sidebarLum < 128;
  const brandTextColor = isDark ? 'white' : 'rgba(0,0,0,0.87)';
  const brandSubColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)';
  const userTextColor = isDark ? 'white' : 'rgba(0,0,0,0.87)';
  const userSubColor = isDark ? 'rgba(255,255,255,0.48)' : 'rgba(0,0,0,0.55)';
  const logoutIconColor = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)';
  const logoutTextColor = isDark ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.70)';

  const topbarLum = getSidebarLuminance(colors.topbarColor || '#005081');
  const isTopbarDark = topbarLum < 128;
  const avatarTextColor = isTopbarDark ? '#fff' : 'rgba(0,0,0,0.87)';
  const avatarBorder = isTopbarDark ? 'none' : '1px solid rgba(0,0,0,0.12)';

  const institutionName = (() => {
    try {
      // loadItemFromSessionStorage/loadItemFromLocalStorage parsent déjà le JSON —
      // pas besoin (et ça plantait) de repasser le résultat dans JSON.parse().
      const raw = loadItemFromSessionStorage('app-institution') || loadItemFromLocalStorage('app-institution');
      if (raw && !(Array.isArray(raw) && raw.length === 0)) return raw?.denomination || '';
    } catch {}
    return '';
  })();

  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const opena = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const history = useHistory();
  const logOut = (e) => {
    e.preventDefault();
    sessionStorage.clear();
    props.authenticate();
    history.push("/login");
  };


  let user;
  try {
    // loadItemFromSessionStorage() parse déjà le JSON en interne.
    user = loadItemFromSessionStorage("app-user") || undefined;
  } catch { user = undefined; }
  if (!user) return null;

  // console.log(user);

  // props.pageChanged("eegegeg")

  // console.log(props)

  
  
  return (
    <>
      <div className="show-on-med-and-down hide-on-large-only"> 
        <ThemeProvider theme={defaultTheme} >
        
          <CssBaseline />
          <AppBar position="absolute" open={open} sx={{ backgroundColor: colors.topbarColor }}>
              <Toolbar
                  sx={{
                    pr: '24px', // keep right padding when drawer closed
                  }}
              >
                  <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="open drawer"
                      onClick={toggleDrawer}
                      sx={{
                          marginRight: '36px',
                          ...(open && { display: 'none' }),
                      }}
                  >
                    <MenuIcon   />
                  </IconButton>
                  <IconButton
                    onClick={toggleDrawer}
                    sx={{

                      ...(!open && { display: 'none' }),
                    }}
                  >
                    <ChevronLeftIcon style={{ color:"white" }} />
                  </IconButton>
                  <Typography
                      component="h1"
                      variant="h6"
                      color="inherit"
                      noWrap
                      sx={{ flexGrow: 1 }}
                      style={{ textAlign:"center" }}
                  >

                  </Typography>


                  <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                    <Tooltip title="Compte">
                      <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 2 }}
                        aria-controls={opena ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={opena ? 'true' : undefined}
                      >
                        <Avatar sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: 'rgba(255,255,255,0.22)',
                          color: '#fff',
                          border: '1.5px solid rgba(255,255,255,0.55)',
                          fontWeight: 700,
                        }}>
                          {user.firstAndLastName[0]}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={opena}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <NavLink to="/compte" style={{ color:"black",textDecoration:"none" }}>
                      <MenuItem onClick={handleClose}>
                        <Avatar /> Mon Compte
                      </MenuItem>
                    </NavLink>
                    

                    <Divider />
                    
                    <NavLink to="/logout" onClick={(e) => logOut(e)} style={{ color:"black",textDecoration:"none" }}>
                      
                      <MenuItem onClick={handleClose}>
                        <ListItemIcon>
                          <Logout fontSize="small" />
                        </ListItemIcon>
                        Déconnexion
                      </MenuItem>
                    </NavLink>
                  </Menu>
              </Toolbar>
          </AppBar>

          <Box sx={{ display: 'flex' }}  >
            <Drawer variant="permanent" open={open} sx={{ ...(!open && { display: 'none' }), position:"absolute", height:"100%" }}>
                <div style={{ backgroundColor: colors.sidebarColor, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* ── Header brand ── */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 16px',
                  minHeight: '64px',
                  flexShrink: 0,
                }}>
                  <div style={{
                    borderRadius: '10px',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                    background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
                  }}>
                    <img src={institutionLogo || logo} height="30px" width="30px" alt="logo" style={{ objectFit: 'contain' }} loading="lazy" />
                  </div>
                  {open && (
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                      <div style={{ color: brandTextColor, fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>GPR</div>
                      <div style={{ color: brandSubColor, fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {institutionName || APP_OWNER}
                      </div>
                    </div>
                  )}
                </div>
                <Divider style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />

                {/* ── Nav items ── */}
                <List component="nav" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 0', backgroundColor: colors.sidebarColor }} sx={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent', '&::-webkit-scrollbar': { width: '3px' }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)', borderRadius: '3px' }, '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.35)' } }}>
                    <Items/>
                </List>

                {/* ── Footer utilisateur ── */}
                <Divider style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                <div style={{ padding: open ? '10px 10px 8px' : '10px 6px', flexShrink: 0 }}>
                  {open ? (
                    <div style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', borderRadius: 12, padding: '10px 10px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                        <Avatar sx={{ width: 36, height: 36, backgroundColor: colors.sidebarColor || '#005081', color: '#fff', fontSize: '14px', fontWeight: 700, boxShadow: `0 0 0 2px rgba(255,255,255,0.15), 0 0 0 4px ${colors.sidebarColor || '#005081'}` }}>
                          {user.firstAndLastName.trim()[0]}
                        </Avatar>
                      </div>
                      <div style={{ color: userTextColor, fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.firstAndLastName}
                      </div>
                      <NavLink to="/logout" onClick={(e) => logOut(e)} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 8, marginTop: 6, padding: '5px 10px', cursor: 'pointer', background: 'transparent', transition: 'background 0.2s ease' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,80,80,0.14)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Logout style={{ color: logoutIconColor, fontSize: 14 }} />
                          <span style={{ fontSize: 12, fontWeight: 400, color: logoutTextColor }}>Déconnexion</span>
                        </div>
                      </NavLink>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Avatar sx={{ width: 30, height: 30, backgroundColor: colors.sidebarColor || '#005081', color: '#fff', fontSize: '12px', fontWeight: 700, boxShadow: `0 0 0 2px rgba(255,255,255,0.15), 0 0 0 3px ${colors.sidebarColor || '#005081'}` }}>
                        {user.firstAndLastName.trim()[0]}
                      </Avatar>
                    </div>
                  )}
                </div>
                </div>
            </Drawer>
            <Contenu/>
            <footer style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', ...(open && { marginLeft: 0 }) }}>
              <span style={{ fontSize: 11, color: '#cbd5e1' }}>
                &copy; {new Date().getFullYear()} <a href={APP_OWNER_WEBSITE} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>{APP_OWNER}</a>
              </span>
              {message !== undefined && (
                <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>{message}</span>
              )}
            </footer>
          </Box>
      
        </ThemeProvider>
      </div>
        

      <div className="hide-on-med-and-down show-on-large-only" style={{overflowY: "hidden"}}>
        <ThemeProvider theme={defaultTheme}   >
          
          <CssBaseline />
          <AppBar position="absolute" open={open} style={{ minHeight:"70px" }} sx={{ backgroundColor: colors.topbarColor }}>
              <Toolbar
                  sx={{
                  pr: '24px', // keep right padding when drawer closed
                  }}
              >
                  <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="open drawer"
                      onClick={toggleDrawer}
                      sx={{
                          marginRight: '36px',
                          ...(open && { display: 'none' }),
                      }}
                  >
                    <MenuIcon   />
                  </IconButton>
                  <IconButton
                    onClick={toggleDrawer}
                    sx={{
                      
                      ...(!open && { display: 'none' }),
                    }}
                  >
                    <ChevronLeftIcon style={{ color:"white" }} />
                  </IconButton>
                  <Typography
                      component="h1"
                      variant="h6"
                      color="inherit"
                      noWrap
                      sx={{ flexGrow: 1 }}
                      style={{ textAlign:"center" }}
                  >
                  
                  </Typography>

                  
                
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textAlign: 'center' }}>
                    {contenuMode}

                    <Tooltip title="Mon compte">
                      <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 0.5 }}
                        aria-controls={opena ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={opena ? 'true' : undefined}
                      >
                        <Avatar sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: 'rgba(255,255,255,0.22)',
                          color: '#fff',
                          border: '1.5px solid rgba(255,255,255,0.55)',
                          fontWeight: 700,
                        }}>
                          {user.firstAndLastName[0]}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={opena}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <NavLink to="/compte" style={{ color:"black",textDecoration:"none" }}>
                      <MenuItem onClick={handleClose}>
                        <Avatar /> Mon Compte
                      </MenuItem>
                    </NavLink>
                    

                    <Divider />
                    
                    <NavLink to="/logout" onClick={(e) => logOut(e)} style={{ color:"black",textDecoration:"none" }}>
                      
                      <MenuItem onClick={handleClose}>
                        <ListItemIcon>
                          <Logout fontSize="small" />
                        </ListItemIcon>
                        Déconnexion
                      </MenuItem>
                    </NavLink>
                  </Menu>
              </Toolbar>
          </AppBar>

          <Box sx={{ display: 'flex' }}  >
            <Drawer variant="permanent" open={open}>
                <div style={{ backgroundColor: colors.sidebarColor, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* ── Header brand ── */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 16px',
                  minHeight: '70px',
                  flexShrink: 0,
                }}>
                  <div style={{
                    borderRadius: '10px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                    background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)',
                  }}>
                    <img src={institutionLogo || logo} height="32px" width="32px" alt="logo" style={{ objectFit: 'contain' }} loading="lazy" />
                  </div>
                  {open && (
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                      <div style={{ color: brandTextColor, fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>GPR</div>
                      <div style={{ color: brandSubColor, fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {institutionName || APP_OWNER}
                      </div>
                    </div>
                  )}
                </div>
                <Divider style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />

                {/* ── Nav items ── */}
                <List component="nav" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 0', backgroundColor: colors.sidebarColor }} sx={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent', '&::-webkit-scrollbar': { width: '3px' }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)', borderRadius: '3px' }, '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.35)' } }}>
                    <Items/>
                </List>

                {/* ── Footer utilisateur ── */}
                <Divider style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                <div style={{ padding: open ? '16px 12px 12px' : '14px 6px', flexShrink: 0 }}>
                  {open ? (
                    <div style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', borderRadius: 12, padding: '10px 10px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                        <Avatar sx={{ width: 36, height: 36, backgroundColor: colors.sidebarColor || '#005081', color: '#fff', fontSize: '14px', fontWeight: 700, boxShadow: `0 0 0 2px rgba(255,255,255,0.15), 0 0 0 4px ${colors.sidebarColor || '#005081'}` }}>
                          {user.firstAndLastName.trim()[0]}
                        </Avatar>
                      </div>
                      <div style={{ color: userTextColor, fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.firstAndLastName}
                      </div>
                      <NavLink to="/logout" onClick={(e) => logOut(e)} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 8, marginTop: 6, padding: '5px 10px', cursor: 'pointer', background: 'transparent', transition: 'background 0.2s ease' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,80,80,0.14)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Logout style={{ color: logoutIconColor, fontSize: 14 }} />
                          <span style={{ fontSize: 12, fontWeight: 400, color: logoutTextColor }}>Déconnexion</span>
                        </div>
                      </NavLink>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Avatar sx={{ width: 30, height: 30, backgroundColor: colors.sidebarColor || '#005081', color: '#fff', fontSize: '12px', fontWeight: 700, boxShadow: `0 0 0 2px rgba(255,255,255,0.15), 0 0 0 3px ${colors.sidebarColor || '#005081'}` }}>
                        {user.firstAndLastName.trim()[0]}
                      </Avatar>
                    </div>
                  )}
                </div>
                </div>
            </Drawer>
            <Contenu/>

            <footer
              className="page-footer footer footer-static footer-light footer-bottom white navbar-border navbar-shadow">
              <div className="footer-copyright" style={{ marginLeft: open ? `${drawerWidth}px` : '72px', transition: 'margin-left 0.2s' }}>
                <div className="container"><span style={{ fontSize: 11 }}>&copy; {(new Date().getFullYear())} <a href={APP_OWNER_WEBSITE} target="_blank">{APP_OWNER}</a> Tous droits réservés.</span>
                <span className="right hide-on-small-only hide"> <a href="#"></a></span></div>
                {message !== undefined &&
                  (<div className="" style={{color:"red",textAlign:"center",fontWeight:600,fontSize:"11px"}} >
                    {message}
                  </div>)
                }
              </div>

            </footer>

            {/* <Footer/> */}
          </Box>
      
        </ThemeProvider>
        
      </div>

    </>



  );
}

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.layout.isAuthenticated,
    isLoading: state.layout.isLoading,
    page: state.layout.page,
    actif: state.layout.actif,
    // claimColor:state.hearder.claimColor,
    // denunColor:state.hearder.denunColor
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    authenticate: () => dispatch(authenticate()),
   
    pageChanged: (page) => {dispatch(pageChanged(page))},
    actifChanged: (actif) => {dispatch(actifChanged(actif))},
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Haut)