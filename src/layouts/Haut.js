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



const drawerWidth = 250;

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      // position: 'absolute',
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      backgroundColor:"#ffffff",
      color:"white",
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
    history.push("/");
  };


  let user = loadItemFromSessionStorage("app-user") !== undefined ? (JSON.parse(loadItemFromSessionStorage("app-user"))): undefined;

  //let user = JSON.parse(loadItemFromLocalStorage("app-user"));

  // console.log(user);

  // props.pageChanged("eegegeg")

  // console.log(props)

  
  
  return (
    <>
      <div className="show-on-med-and-down hide-on-large-only"> 
        <ThemeProvider theme={defaultTheme} >
        
          <CssBaseline />
          <AppBar position="absolute" open={open} >
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
            <Drawer variant="permanent" open={open} sx={{ ...(!open && { display: 'none' }),position:"absolute",height:"100%" }} >
                <Toolbar
                    sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                    height:"60px"
                    }}
                    style={{ padding:"0px" }}
                >
                  <img
                    src={logo}
                    height="100%" width="100%"
                    alt="logo"
                    loading="lazy"
                  />
                    
                </Toolbar>
                <Divider />
                <List component="nav" style={{ height:"100%" }}  >
                    <Items/>
                </List>
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
          </Box>
      
        </ThemeProvider>
      </div>
        

      <div className="hide-on-med-and-down show-on-large-only" style={{overflowY: "hidden"}}>
        <ThemeProvider theme={defaultTheme}   >
          
          <CssBaseline />
          <AppBar position="absolute" open={open} style={{ minHeight:"70px" }} >
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
                    {contenuMode} 

                   
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
            <Drawer variant="permanent" open={open} >
                <Toolbar
                    sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                    height:"70px"
                    }}
                    style={{ padding:"0px" }}
                >
                  <img
                    src={logo}
                    height="100%" width="100%"
                    alt="logo"
                    loading="lazy"
                  />
                    
                </Toolbar>
                <Divider />
                <List component="nav" style={{height: "100vh", overflowY:"auto", paddingBottom: "20%"}} >
                    <Items/>
                </List>
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