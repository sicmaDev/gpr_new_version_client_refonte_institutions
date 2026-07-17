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
import Popover from '@mui/material/Popover';
import { useThemeColors, getPagePrimary } from '../context/ThemeColorsContext';
import { updateTheme } from '../apis/ThemeApi';

const MoonIcon = ({ size = 20, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);



const drawerWidth = 250;

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      height: '100vh',
      backgroundColor: '#005081',
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

let mode =loadItemFromSessionStorage("app-mode") !== undefined ? JSON.parse(loadItemFromSessionStorage("app-mode")) : undefined;

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
  backgroundColor:"#005081",
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor:"#005081"
  }),
}));


// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

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
  

  const { colors, setColors } = useThemeColors();
  const [themeAnchor, setThemeAnchor] = useState(null);
  const [tempColors, setTempColors] = useState({ sidebarColor: '#005081', topbarColor: '#005081' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const handleOpenTheme = (e) => {
    setTempColors({ ...colors });
    setSaveError(false);
    setThemeAnchor(e.currentTarget);
  };

  const handleSaveTheme = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      await updateTheme({ id: user.id, sidebarColor: tempColors.sidebarColor, topbarColor: tempColors.topbarColor });
      setColors(tempColors);
      setThemeAnchor(null);
    } catch {
      setSaveError(true);
    }
    setSaving(false);
  };

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
    const _raw = loadItemFromSessionStorage("app-user");
    user = _raw ? JSON.parse(_raw) : undefined;
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
                    <Tooltip title="Personnaliser les couleurs">
                      <IconButton size="small" onClick={handleOpenTheme} sx={{ mr: 0.5 }}>
                        <MoonIcon size={20} color="white" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Compte">
                      <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 2 }}
                        aria-controls={opena ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={opena ? 'true' : undefined}
                      >
                        <Avatar sx={{ width: 32, height: 32,backgroundColor:"#1E2188" }}>{user.firstAndLastName[0]}</Avatar>
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
                  gap: '12px',
                  padding: '14px 16px',
                  minHeight: '64px',
                  flexShrink: 0,
                }}>
                  <div style={{
                    background: colors.sidebarColor,
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    <img src={logo} height="30px" width="30px" alt="logo" style={{ objectFit: 'contain' }} loading="lazy" />
                  </div>
                  {open && (
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>GPR</div>
                      <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{APP_OWNER}</div>
                    </div>
                  )}
                </div>
                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* ── Nav items ── */}
                <List component="nav" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 0', backgroundColor: colors.sidebarColor }} sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }, '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.35)' } }}>
                    <Items/>
                </List>

                {/* ── Footer utilisateur ── */}
                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <div style={{ padding: '12px 14px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar sx={{ width: 36, height: 36, backgroundColor: '#fff', color: '#1E2188', fontSize: '15px', fontWeight: 700, flexShrink: 0 }}>
                      {user.firstAndLastName.trim().split(' ')[0][0]}
                    </Avatar>
                    {open && (
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div style={{ color: 'white', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.firstAndLastName}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.posteDto?.libelle || ''}
                        </div>
                      </div>
                    )}
                  </div>
                  {open && (
                    <NavLink to="/logout" onClick={(e) => logOut(e)} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        borderRadius: 12, margin: '4px 0 0', padding: '8px 12px',
                        minHeight: 38, cursor: 'pointer',
                        background: 'transparent', transition: 'background 0.2s ease',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,80,80,0.14)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ minWidth: 34, display: 'flex', alignItems: 'center' }}>
                          <Logout style={{ color: 'rgba(255,255,255,0.65)', fontSize: 18 }} />
                        </div>
                        <span style={{ fontSize: 14.5, fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>Déconnexion</span>
                      </div>
                    </NavLink>
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

                    <Tooltip title="Personnaliser les couleurs">
                      <IconButton size="small" onClick={handleOpenTheme}>
                        <MoonIcon size={20} color="white" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Mon compte">
                      <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 0.5 }}
                        aria-controls={opena ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={opena ? 'true' : undefined}
                      >
                        <Avatar sx={{ width: 32, height: 32,backgroundColor:"#1E2188" }}>{user.firstAndLastName[0]}</Avatar>
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
                  gap: '12px',
                  padding: '14px 16px',
                  minHeight: '70px',
                  flexShrink: 0,
                }}>
                  <div style={{
                    background: colors.sidebarColor,
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    <img src={logo} height="32px" width="32px" alt="logo" style={{ objectFit: 'contain' }} loading="lazy" />
                  </div>
                  {open && (
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>GPR</div>
                      <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{APP_OWNER}</div>
                    </div>
                  )}
                </div>
                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* ── Nav items ── */}
                <List component="nav" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 0', backgroundColor: colors.sidebarColor }} sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }, '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.35)' } }}>
                    <Items/>
                </List>

                {/* ── Footer utilisateur ── */}
                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <div style={{ padding: '12px 14px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar sx={{ width: 36, height: 36, backgroundColor: '#fff', color: '#1E2188', fontSize: '15px', fontWeight: 700, flexShrink: 0 }}>
                      {user.firstAndLastName.trim().split(' ')[0][0]}
                    </Avatar>
                    {open && (
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div style={{ color: 'white', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.firstAndLastName}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.posteDto?.libelle || ''}
                        </div>
                      </div>
                    )}
                  </div>
                  {open && (
                    <NavLink to="/logout" onClick={(e) => logOut(e)} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        borderRadius: 12, margin: '4px 0 0', padding: '8px 12px',
                        minHeight: 38, cursor: 'pointer',
                        background: 'transparent', transition: 'background 0.2s ease',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,80,80,0.14)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ minWidth: 34, display: 'flex', alignItems: 'center' }}>
                          <Logout style={{ color: 'rgba(255,255,255,0.65)', fontSize: 18 }} />
                        </div>
                        <span style={{ fontSize: 14.5, fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>Déconnexion</span>
                      </div>
                    </NavLink>
                  )}
                </div>
                </div>
            </Drawer>
            <Contenu/>

            <footer
              className="page-footer footer footer-static footer-light footer-bottom white navbar-border navbar-shadow">
              <div className="footer-copyright" style={{ ...(open && { marginLeft: "12%" }) }}>
                <div className="container"><span>&copy; {(new Date().getFullYear())} <a href={APP_OWNER_WEBSITE} target="_blank">{APP_OWNER}</a> Tous droits réservés.</span>
                <span className="right hide-on-small-only hide"> <a href="#"></a></span></div>
                {message !== undefined && 
                  (<div className="" style={{color:"red",width:"500px",fontSize:"18px",textAlign:"center",fontStyle:"bold",fontWeight:"700"}} >
                    {message}
                  </div>)
                } 
              </div>
           
            </footer>
            
            {/* <Footer/> */}
          </Box>
      
        </ThemeProvider>
        
      </div>

      <Popover
        open={Boolean(themeAnchor)}
        anchorEl={themeAnchor}
        onClose={() => setThemeAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ elevation: 3, sx: { borderRadius: 2, minWidth: 270 } }}
      >
        <div style={{ padding: '18px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#1e293b' }}>
            Personnaliser les couleurs
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#374151' }}>Barre latérale</span>
              <input
                type="color"
                value={tempColors.sidebarColor}
                onChange={e => setTempColors(c => ({ ...c, sidebarColor: e.target.value }))}
                style={{ width: 44, height: 32, border: '1px solid #e2e8f0', cursor: 'pointer', borderRadius: 6, padding: 2 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#374151' }}>Barre supérieure</span>
              <input
                type="color"
                value={tempColors.topbarColor}
                onChange={e => setTempColors(c => ({ ...c, topbarColor: e.target.value }))}
                style={{ width: 44, height: 32, border: '1px solid #e2e8f0', cursor: 'pointer', borderRadius: 6, padding: 2 }}
              />
            </div>
          </div>
          {tempColors.sidebarColor.toLowerCase() !== tempColors.topbarColor.toLowerCase() && (
            <div style={{ marginTop: 14, padding: '8px 12px', borderRadius: 8, background: '#F8FAFC', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: getPagePrimary(tempColors), flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#64748b' }}>Couleur résultante pour les autres pages</span>
            </div>
          )}
          {saveError && (
            <div style={{ marginTop: 12, fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '6px 10px' }}>
              Erreur lors de l'enregistrement. Réessayez.
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => setThemeAnchor(null)}
              style={{ flex: 1, padding: '7px 0', fontSize: 13, borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer', background: 'white', color: '#374151' }}
            >
              Annuler
            </button>
            <button
              onClick={handleSaveTheme}
              disabled={saving}
              style={{ flex: 1, padding: '7px 0', fontSize: 13, borderRadius: 6, border: 'none', cursor: saving ? 'wait' : 'pointer', background: getPagePrimary(tempColors), color: 'white', fontWeight: 600 }}
            >
              {saving ? '...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Popover>
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