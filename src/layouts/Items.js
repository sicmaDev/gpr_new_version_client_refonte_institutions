import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import QuizIcon from '@mui/icons-material/Quiz';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RecyclingIcon from '@mui/icons-material/Recycling';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import PublicIcon from '@mui/icons-material/Public';
import SettingsIcon from '@mui/icons-material/Settings';
import LanguageIcon from '@mui/icons-material/Language';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import CategoryIcon from '@mui/icons-material/Category';
import DataObjectIcon from '@mui/icons-material/DataObject';
import GavelIcon from '@mui/icons-material/Gavel';
import { NavLink } from "react-router-dom";
import { loadItemFromLocalStorage, loadItemFromSessionStorage } from '../Utils/utils';
import { connect } from 'react-redux';
import { authenticate } from '../redux/actions/LayoutActions';
import { useHistory } from "react-router-dom";
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import ArticleIcon from '@mui/icons-material/Article';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import NotificationAddIcon from '@mui/icons-material/NotificationAdd';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ClassIcon from '@mui/icons-material/Class';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SmsIcon from '@mui/icons-material/Sms';
import EmailIcon from '@mui/icons-material/Email';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { AddToDriveOutlined, KeyOffTwoTone, KeyTwoTone, WhatsApp } from '@mui/icons-material';

export const Items = (props) => {

    const [open, setOpen] = React.useState(false);
    const [open1, setOpen1] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [open3, setOpen3] = React.useState(false);
    const [open4, setOpen4] = React.useState(false);
    const [open5, setOpen5] = React.useState(false);
    const [open6, setOpen6] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };
    const handleClick1 = () => {
        setOpen1(!open1);
    };
    const handleClick2 = () => {
        setOpen2(!open2);
    };
    const handleClick3 = () => {
        setOpen3(!open3);
    };
    const handleClick4 = () => {
        setOpen4(!open4);
    };
    const handleClick5 = () => {
        setOpen5(!open5);
    };
    const handleClick6 = () => {
        setOpen6(!open6);
    };

    const history = useHistory();
    const logOut = (e) => {
        e.preventDefault();
        sessionStorage.clear();
        props.authenticate();
        history.push("/");
    };
    let mode = loadItemFromLocalStorage("app-mode") !== undefined ? (JSON.parse(loadItemFromLocalStorage("app-mode"))) : undefined;
    let user = loadItemFromSessionStorage("app-user") !== undefined ? (JSON.parse(loadItemFromSessionStorage("app-user"))) : undefined;
    let hbt = (user.posteDto.habilitations).split(',');
    let addR = (user.additionalRole);


    //fonctions
    let dashboard = mode === 1 ?
        <NavLink to="/dashboard"
            activeClassName="hero"
            style={{ color: "white", textDecoration: "none" }}
        >
            <ListItemButton className='lib'  >
                <ListItemIcon>
                    <DashboardIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
            </ListItemButton>
        </NavLink> : ""

    //reclamations

    let REntete = hbt.some(item => ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "H14"].includes(item)) ?
        <ListItemButton onClick={handleClick} >
            <ListItemIcon>
                <InboxIcon style={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Réclamations" />
            {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton> : "";

    let REnregistrement = hbt.includes("H1") ?
        <NavLink to="/reclamations/enregistrement" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton sx={{ pl: 4 }} className='lib'>
                <ListItemIcon>
                    <AddCircleIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Enregistrement" />
            </ListItemButton>
        </NavLink> : "";

    let RTraitement = (hbt.some(item => ["H2", "H3", "H4", "H6"].includes(item)) || addR === "PILOTE" || addR === "DE") && mode === 1 ?
        <NavLink to="/reclamations/traitement/all" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton sx={{ pl: 4 }} className='lib'>
                <ListItemIcon>
                    <RecyclingIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Traitement" />
            </ListItemButton>
        </NavLink> : "";

    let RMesure = (hbt.includes("H5") || addR === "PILOTE" || addR === "DE") && mode === 1 ?
        <NavLink to="/reclamations/mesure/all" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton sx={{ pl: 4 }} className='lib'>
                <ListItemIcon>
                    <DeviceThermostatIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Mesure de satisfaction" />
            </ListItemButton>
        </NavLink> : "";

    let RAssurance = (hbt.includes("H5") || addR === "PILOTE" || addR === "DE") && mode === 1 ?
        <NavLink to="/reclamations/assurance" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton sx={{ pl: 4 }} className='lib'>
                <ListItemIcon>
                    <SentimentSatisfiedAltIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Assurance Satisfaction" />
            </ListItemButton>
        </NavLink> : "";

    let RListe =
        <NavLink to="/reclamations/liste" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton sx={{ pl: 4 }} className='lib'>
                <ListItemIcon>
                    <ReceiptLongIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Liste des réclamations" />
            </ListItemButton>
        </NavLink>

    let RClassees = (hbt.includes("H5") || addR === "PILOTE" || addR === "DE") && mode === 1 ?
        <NavLink to="/reclamations/classees" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton sx={{ pl: 4 }} className='lib'>
                <ListItemIcon>
                    <FolderSpecialIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Classées" />
            </ListItemButton>
        </NavLink> : "";

    //denonciations

    let DEntete = hbt.some(item => ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "H14"].includes(item)) ?
        <ListItemButton onClick={handleClick1}>
            <ListItemIcon>
                <InboxIcon style={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Dénonciations" />
            {open1 ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton> : "";

    let DEnregistrement = hbt.includes("H1") ?
        <NavLink to="/denonciations/enregistrement" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton sx={{ pl: 4 }} className='lib'>
                <ListItemIcon>
                    <AddCircleIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Enregistrement" />
            </ListItemButton>
        </NavLink> : "";

    let DTraitement = (hbt.some(item => ["H2", "H3", "H4", "H6"].includes(item)) || addR === "PILOTE" || addR === "DE") && mode === 1 ?
        <NavLink to="/denonciations/traitement/all" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton sx={{ pl: 4 }} className='lib'>
                <ListItemIcon>
                    <RecyclingIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Traitement" />
            </ListItemButton>
        </NavLink> : "";

    let DListe =
        <NavLink to="/denonciations/liste" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton sx={{ pl: 4 }} className='lib'>
                <ListItemIcon>
                    <ReceiptLongIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Liste des dénonciations" />
            </ListItemButton>
        </NavLink>

    //suggestions

    let SEntete = hbt.some(item => ["H1", "H7", "H8", "H9", "H10", "H14"].includes(item)) ?
        <ListItemButton onClick={handleClick2}>
            <ListItemIcon>
                <InboxIcon style={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Suggestions" />
            {open2 ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton> : "";

    let SEnregistrement = hbt.includes("H1") ?
        <NavLink to="/suggestions/enregistrement" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton sx={{ pl: 4 }} className='lib'>
                <ListItemIcon>
                    <AddCircleIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Enregistrement" />
            </ListItemButton>
        </NavLink> : "";


    let STraitement = (addR === "PILOTE" || addR === "DE") && mode === 1 ?
        <NavLink to="/suggestions/traitement" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton sx={{ pl: 4 }} className='lib'>
                <ListItemIcon>
                    <RecyclingIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Traitement" />
            </ListItemButton>
        </NavLink> : "";

    let SListe =
        <NavLink to="/suggestions/liste" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton sx={{ pl: 4 }} className='lib'>
                <ListItemIcon>
                    <ReceiptLongIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Liste des suggestions" />
            </ListItemButton>
        </NavLink>

    let Rapports = hbt.includes("H11") && mode === 1 ?
        <>
            <ListItemButton onClick={handleClick3}>
                <ListItemIcon>
                    <BarChartIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Rapports" />
                {open3 ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open3} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <NavLink to="/rapports/global" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <PublicIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Global" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/rapports/bceao" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <StarBorder style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Commission Bancaire" />
                        </ListItemButton>
                    </NavLink>
                </List>
            </Collapse>
        </> : "";

    let Alertes = (hbt.includes("H13") || addR === "PILOTE" || addR === "DE") && mode === 1 ?
        <>
            <ListItemButton onClick={handleClick5}>
                <ListItemIcon>
                    <NotificationImportantIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Alertes" />
                {open5 ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open5} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <NavLink to="/alertes/reclamations" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <ReceiptLongIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Réclamations" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/alertes/denonciations" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <ReceiptLongIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Dénonciations" />
                        </ListItemButton>
                    </NavLink>
                </List>
            </Collapse>
        </> : "";
    let Whatsapp = (addR === "PILOTE" || addR === "DE") && mode === 1 ?
        <NavLink to="/whatsapp/liste" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
            <ListItemButton >
                <ListItemIcon>
                    <WhatsApp style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Whatsapp" />
            </ListItemButton>

        </NavLink> : "";

    let Configs = hbt.includes("H12") && mode === 1 ?
        <>
            <ListItemButton onClick={handleClick4}>
                <ListItemIcon>
                    <SettingsIcon style={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary="Configurations" />
                {open4 ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open4} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <NavLink to="/configurations/institution"
                        style={{ color: "white", textDecoration: "none" }}
                        activeClassName="hero"

                    >
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <HomeWorkIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Institution" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/pointsServices"
                        style={{ color: "white", textDecoration: "none" }}
                        activeClassName="hero"

                    >
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <AddBusinessIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Points de services" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/postes" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <WorkIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Postes" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/produits" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <CategoryIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Produits / Services" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/categories" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <ClassIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Categories" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/objets" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <DataObjectIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Objets" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/solutions" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <TipsAndUpdatesIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Solutions" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/langues" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <LanguageIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Langues" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/supportsCollectes" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <RecyclingIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Supports de collecte" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/utilisateurs" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <PersonIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Compte Utilisateurs" />
                        </ListItemButton>
                    </NavLink>


                    <NavLink to="/configurations/email" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <EmailIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Email" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/sms" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <SmsIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="SMS" />
                        </ListItemButton>
                    </NavLink>
                    <NavLink to="/configurations/logs" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <AddToDriveOutlined style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Log Systeme" />
                        </ListItemButton>
                    </NavLink>
                    <NavLink to="/configurations/exportations" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <AddToDriveOutlined style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Exportation" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/bot" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <SmartToyIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="GPR BOT" />
                        </ListItemButton>
                    </NavLink>
                    <NavLink to="/configurations/apikey" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <KeyTwoTone style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="API KEY" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/recoursExternes" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <GavelIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Recours Externes" />
                        </ListItemButton>
                    </NavLink>

                    <NavLink to="/configurations/notifications" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                        <ListItemButton sx={{ pl: 4 }} className='lib'>
                            <ListItemIcon>
                                <NotificationAddIcon style={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemText primary="Notifications" />
                        </ListItemButton>
                    </NavLink>

                    <ListItemButton onClick={handleClick6}>
                        <ListItemIcon>
                            <ArticleIcon style={{ color: "white" }} />
                        </ListItemIcon>
                        <ListItemText primary="Ressources" />
                        {open6 ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={open6} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <NavLink to="/ressources/documents" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                                <ListItemButton sx={{ pl: 4 }} className='lib'>
                                    <ListItemIcon>
                                        <MenuBookIcon style={{ color: "white" }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Documents" />
                                </ListItemButton>
                            </NavLink>

                            <NavLink to="/ressources/faq" style={{ color: "white", textDecoration: "none" }} activeClassName="hero">
                                <ListItemButton sx={{ pl: 4 }} className='lib'>
                                    <ListItemIcon>
                                        <QuizIcon style={{ color: "white" }} />
                                    </ListItemIcon>
                                    <ListItemText primary="FAQ" />
                                </ListItemButton>
                            </NavLink>
                        </List>
                    </Collapse>

                </List>
            </Collapse>
        </> : "";


    return (
        <React.Fragment >

            {dashboard}

            {REntete}
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding  >
                    {REnregistrement}

                    {RTraitement}

                    {RMesure}

                    {RAssurance}

                    {RListe}

                    {RClassees}

                </List>
            </Collapse>

            {DEntete}
            <Collapse in={open1} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {DEnregistrement}

                    {DTraitement}

                    {/* {DMesure}

            {DAssurance} */}

                    {DListe}

                    {/* {DClassees} */}

                </List>
            </Collapse>


            {SEntete}
            <Collapse in={open2} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {SEnregistrement}

                    {STraitement}

                    {SListe}
                </List>
            </Collapse>
            {Whatsapp}

            {Alertes}

            {Rapports}

            {Configs}

            <NavLink to="/help"
                activeClassName="hero"
                style={{ color: "white", textDecoration: "none" }}
            >
                <ListItemButton className='lib'>
                    <ListItemIcon >
                        <QuizIcon style={{ color: "white" }} />
                    </ListItemIcon>
                    <ListItemText primary="Aide" />
                </ListItemButton>
            </NavLink>

            <NavLink to="/logout"
                onClick={(e) => logOut(e)} style={{ color: "white", textDecoration: "none" }}>
                <ListItemButton >
                    <ListItemIcon>
                        <LogoutIcon style={{ color: "white" }} />
                    </ListItemIcon>
                    <ListItemText primary="Déconnexion" />
                </ListItemButton>
            </NavLink>

        </React.Fragment>
    );

}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.layout.isAuthenticated,
        isLoading: state.layout.isLoading,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        authenticate: () => dispatch(authenticate()),
    };
};


export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Items)


