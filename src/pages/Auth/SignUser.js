import React, {useEffect, useRef, useState} from "react";
import { connect } from "react-redux";
import { useThemeColors, darkenColor, getPagePrimary } from "../../context/ThemeColorsContext";
import logo from "../../assets/images/logo_gpr.jpg";
import logoSicma from "../../assets/images/logo_sicma.png";
import LoadingButton from "@mui/lab/LoadingButton";
import { NavLink, useHistory } from "react-router-dom";
import { Box, Button, Modal, Typography, fabClasses, FormControl, IconButton, Input, MenuItem, Select, ListSubheader } from "@mui/material";
import ReactDatatable from "@ashvin27/react-datatable";
// import Select from "react-select";
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import {
    userErrors, additionalRoleChanged,emailChanged,
    nameChanged,codeChanged,
    idChanged, posteChanged,unitChanged,
    phoneChanged,passwordAgainChanged, passwordChanged,itemsChanged, selectedItemChanged, posteLibelleChanged, unitLibelleChanged, etat3Changed, etat2Changed, etatChanged
} from "../../redux/actions/Configurations/UtilisateursActions";

import {cleanPhoneNumber, isValidMdp, isValidPhone, loadItemFromSessionStorage, today,groupBy, loadItemFromLocalStorage} from "../../Utils/utils";

// import {useOnScreen} from "../../utils/custom_hooks";
import {modalify} from "../../Utils/modal";
import { createUserPublic } from "../../apis/SignApi";
import { Block, TaskAlt } from "@mui/icons-material";
import { notify } from "../../Utils/alert";
import BlockButton from "../../components/shared/BlockButton";

// ── SVG Icons ────────────────────────────────────────────────────────────
const SvgEmail     = ({size=20,color="#64748b"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const SvgLock      = ({size=20,color="#64748b"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const SvgEye       = ({size=18,color="#94a3b8"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const SvgEyeOff    = ({size=18,color="#94a3b8"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const SvgArrowIn   = ({size=18,color="white"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
const SvgPerson    = ({size=20,color="#64748b"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const SvgBriefcase = ({size=20,color="#64748b"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const SvgBuilding  = ({size=20,color="#64748b"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const SvgPhone     = ({size=20,color="#64748b"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.42 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.07 6.07l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const SvgCheckUser = ({size=20,color="#64748b"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>;
const SvgWarning   = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const SvgBulb      = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>;
const SvgMega      = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
const SvgChart     = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const SvgBell      = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const SvgStar      = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const SvgSendMail  = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;


const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({...provided, zIndex: 9999})
};

const GROUP_A = [
    { icon: SvgWarning, label: "Réclamations",  color: "#fb923c" },
    { icon: SvgBulb,    label: "Suggestions",   color: "#60a5fa" },
    { icon: SvgMega,    label: "Dénonciations", color: "#f87171" },
    { icon: SvgChart,   label: "Rapports",      color: "#34d399" },
];

const GROUP_B = [
    { icon: SvgBell,     label: "Alertes",            color: "#f59e0b" },
    { icon: SvgStar,     label: "IA intégrée",         color: "#a78bfa" },
    { icon: SvgSendMail, label: "Notifications auto",  color: "#38bdf8" },
    null,
];

const CARD_POSITIONS = [
    { top: '9%',    left: '5%',  transform: 'rotate(-6deg)' },
    { top: '6%',    right: '4%', transform: 'rotate(4deg)'  },
    { bottom: '26%',left: '6%',  transform: 'rotate(3deg)'  },
    { bottom: '13%',right: '5%', transform: 'rotate(-4deg)' },
];

const selectSx = {
    flex: 1,
    "& .MuiSelect-select": { padding: 0, fontSize: "0.875rem", color: "#1a2b3c", minHeight: "unset !important", display: "flex", alignItems: "center" },
    "&:before, &:after": { display: "none" },
    "&:hover:not(.Mui-disabled):before": { display: "none" },
};
const SignCompteUser = (props) => {
    const { colors } = useThemeColors();
    const primaryColor = getPagePrimary(colors);
    const primaryDark  = darkenColor(primaryColor, 0.18);

    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showGroupB, setShowGroupB] = useState(false);
    const navigate = useHistory();

    useEffect(() => {
        const interval = setInterval(() => setShowGroupB(g => !g), 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowPassword1 = () => {
        setShowPassword1(!showPassword1);
    };

    const handleChange = (e) => {
        props.posteChanged(e.target.value);
    }
    const handleChange1 = (obj) => {
        props.unitChanged(obj.target.value);
    }

    let users = loadItemFromLocalStorage("app-users") !== undefined ? JSON.parse(loadItemFromLocalStorage("app-users")) : undefined;
    useEffect(() => {
        // all(props).then((r) => {});
        
        window.$('.tooltipped').tooltip();
        //cleanup
        return clearComponentState();
    }, []);

    let code;

    let config = {
        page_size: 15,
        length_menu: [ 15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "Utilisateurs",
        button: {
            //excel: true,
            //pdf: true,
            //print: true,
        },
        language: {
            length_menu: "Afficher _MENU_ éléments",
            filter: "Rechercher...",
            info: "Affichage de l'élement _START_ à _END_ sur _TOTAL_ éléments",
            zero_records:    "Aucun élément à afficher",
            no_data_text: "Aucun élément à afficher",
            loading_text: "Chargement en cours...",
            pagination: {
                first: <FirstPageIcon/>,
                previous: <ChevronLeftIcon/>,
                next: <ChevronRightIcon/>,
                last: <LastPageIcon/>
            }
        }
    }
    let errors = {};

    let roleOptions
    if (props.additionalRole !== undefined) {
        roleOptions = [
            {"label": "Directeur", "value": "DE" },
            {"label": "Pilote", "value": "PILOTE" },
            {"label": "Aucun", "value": "MOLDUE" },
        ]

    } else {
        roleOptions = ""
    }

    const [ca, setCa] = useState(""); // valeur initiale vide

    const caOptions = [
        { label: "Non", value: false },
        { label: "Oui", value: true },
    ];

    const handleChange12 = (event) => {
        setCa(event.target.value);
    };


    const handleValidation = () =>{
        let isValid = true;

        if((props.name==="" || props.name===undefined || props.name===null)){
            isValid = false;
            errors["name"] = "Champ incorrect";
        }
        
        if((props.poste==="" || props.poste===undefined || props.poste===null)){
            isValid = false;
            errors["poste"] = "Champ incorrect";
        }
        if((props.unit==="" || props.unit===undefined || props.unit===null)){
            isValid = false;
            errors["unit"] = "Champ incorrect";
        }
        if((props.email==="" || props.email===undefined || props.email===null) || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(props.email)){
            isValid = false;
            errors["email"] = "Champ incorrect";
        }
        if((props.phone==="" || props.phone===undefined || props.phone===null) || !isValidPhone(props.phone)){
            isValid = false;
            errors["phone"] = "Champ incorrect";
        }
        
        if(props.pass!==props.pass_again){
            isValid = false;
            errors["pass"] = "Les mots de passe ne correspondent pas";
            errors["pass_again"] = "Les mots de passe ne correspondent pas";
        }
        return isValid
    }
    const handleMdp = () =>{
        let isValid2 = true;
        if((props.pass==="" || props.pass===undefined || props.pass===null)){
            isValid2 = false;
        }else if((props.pass!=="" || props.pass!==undefined || props.pass!==null)){
            if (!isValidMdp(props.pass)) {
                errors["pass"] = "Le mot de passe est faible";
                isValid2 = false;
            }
            
        }
        return isValid2;
    }
    const handleSubmit = (e) => {
        e.preventDefault()

        let dataUser = {}
        dataUser["firstAndLastName"] = props.name;
        dataUser["email"] = props.email;
        dataUser["tel"] = props.phone;
        dataUser["posteId"] = props.poste;
        dataUser["servicePointId"] = props.unit;
        dataUser["additionalRole"] = props.additionalRole;
        dataUser["password"] = props.pass;
        dataUser["ra"] = ca;
        
        if(handleValidation() && handleMdp()){
            props.etatChanged(true)
            
            createUserPublic(dataUser)
                .then(({ data }) => {
                 
                    if (data.response.status === true) {
                        localStorage.setItem("afterInscription", true);

                        notify("Bravo, vous avez été ajouté avec success", "success");
                        navigate.push("/login");
                    } else {
                        localStorage.removeItem("afterInscription");
                        clearComponentState();
                       const message =
                            data.response?.content?.message ||
                            data.response?.data?.message ||
                            "Erreur - Veuillez réessayer!";

                        notify(message, "error");
                    }
                })
                .catch((error) => {
                  
                    localStorage.removeItem("afterInscription");
                     clearComponentState();
                    const response = error.response;
                     const message =
                            response?.content?.message ||
                            response?.data?.message ||
                            "Erreur - Veuillez réessayer!";

                        notify(message, "error");
                }).finally(() => {            
                    props.etatChanged(false)
                    handleCancel(e)
                });
        }
        
        props.userErrors(errors)
    }
    function clearComponentState() {
        props.idChanged("")
        props.codeChanged("")
        props.nameChanged("")
        props.emailChanged("")
        props.phoneChanged("")
        props.posteChanged("")
        props.unitChanged("")
        props.phoneChanged("")
        props.additionalRoleChanged("")
        props.passwordChanged("")
        props.passwordAgainChanged("")
        props.selectedItemChanged({})
        setCa(false);

        props.userErrors({});
    }
    const handleCancel = (e) => {
        e.preventDefault()
        clearComponentState()
    }

    const generateCode = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const number = "0123456789"
        const speciaux = "@_%+-";
        let retVal = ""
        for (var i = 0, n = charset.length; i < 8; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        retVal = retVal.replaceAll(retVal[6], number[Math.floor(Math.random() * 8)])
        retVal = retVal.replaceAll(retVal[7], speciaux[Math.floor(Math.random() * 5)])

        props.passwordAgainChanged(retVal);
        props.passwordChanged(retVal);
        setShowPassword(true);
    }

    let titles
    let units
    try{
        titles = JSON.parse(loadItemFromLocalStorage('app-postes'));
        units = JSON.parse(loadItemFromLocalStorage('app-ps'));
    }
    catch (e) {
        titles=[];
        units=[];
    }

    let titleOptions
    let unitOptions
    let agencyOptions
    let directionOptions
    let guichetOptions
    let unitsGroupByType = (units!==undefined)? groupBy(units, "type"): undefined;
    //
    if (unitsGroupByType!== undefined && unitsGroupByType["AGENCE"] !== undefined) {
        agencyOptions = unitsGroupByType["AGENCE"].map(agency => {
            return {"label": agency.libelle, "value": agency.id}
        })
    } else {
        agencyOptions = ""
    }

    if (unitsGroupByType!== undefined && unitsGroupByType["DIRECTION"] !== undefined) {
        directionOptions = unitsGroupByType["DIRECTION"].map(direction => {
            return {"label": direction.libelle, "value": direction.id}
        })
    } else {
        directionOptions = ""
    }
    if (unitsGroupByType!== undefined && unitsGroupByType["GUICHET"] !== undefined) {
        guichetOptions = unitsGroupByType["GUICHET"].map(guichet => {
            return {"label": guichet.libelle, "value": guichet.id}
        })
    } else {
        guichetOptions = ""
    }

    unitOptions = []
    if(directionOptions!==""){unitOptions.push({"label": "Direction", "options": directionOptions})}
    if(agencyOptions!==""){unitOptions.push({"label": "Agence", "options": agencyOptions})}
    if(guichetOptions!==""){unitOptions.push({"label": "Guichet", "options": guichetOptions})}
    // //
    if (titles !== undefined) {
        titleOptions = titles.map(title => ({
            label: title.libelle,
            value: title.id
        }));
    } else {
        titleOptions = [];
    }


    let roleValue
    if(props.additionalRole==="PILOTE") roleValue={"label": "Pilote", "value": props.additionalRole }
    if(props.additionalRole==="MOLDUE") roleValue={"label": "Aucun", "value": "" }

    // if(props.role==="") roleValue={"label": "", "value": props.role }


    let titleText = "Ajouter";

    const handlePhoneChanged = (isValid, value, selectedCountryData) =>{
        // if(isValid){
        //     props.phoneChanged("00"+selectedCountryData.dialCode+value)

        // }
        // else {
        //     errors["phone"] = "Champ incorrect";
        //     props.phoneChanged("")
        // }
    }
    const tableChangeHandler =()=>{
        // console.log("Started filtering the table")
    };

    const fieldShellClass = "gpr-sign-field flex items-center gap-2.5 border-2 border-[#e2e8f0] bg-[#f8fafc] rounded-xl px-4 h-[48px] transition-all duration-200";
    const labelClass = "block text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.6px] mb-1";
    const inputClass = "validate border-0 outline-none flex-1 h-full text-sm text-[#1a2b3c] bg-transparent placeholder-[#94a3b8]";
    const iconSx = { fontSize: 20, color: "#64748b" };

    return (
        <div className="gpr-auth flex h-screen" style={{ background: "#F8FAFC", fontFamily: "'Inter', -apple-system, sans-serif" }}>
            <style>{`.gpr-sign-field:focus-within { border-color: ${primaryColor} !important; background: white !important; box-shadow: 0 0 0 4px ${primaryColor}1a !important; }`}</style>

            {/* ── Colonne gauche — hero storytelling ── */}
            <div
                className="hidden md:flex relative overflow-hidden flex-col items-center justify-center px-4 py-8 md:px-6 md:py-10 lg:px-12 lg:py-16"
                style={{ width: "50%" }}
            >
                {/* Couche 1 — fond dégradé */}
                <div className="absolute inset-0 animate-gradient-bg" style={{ background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryColor} 100%)` }} />

                {/* Couche 2 — grands cercles semi-transparents */}
                <div className="absolute rounded-full animate-blob" style={{ width: "62vh", height: "62vh", top: "-14%", right: "-24%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }} />
                <div className="absolute rounded-full animate-blob" style={{ width: "44vh", height: "44vh", bottom: "-16%", left: "-18%", background: "rgba(255,255,255,0.05)", animationDelay: "6s" }} />

                {/* Couche 3 — carrés flottants — desktop uniquement */}
                <div className="hidden lg:block absolute top-20 left-28 w-16 h-16 rounded-2xl rotate-12 animate-float" style={{ background: "rgba(255,255,255,0.1)" }} />
                <div className="hidden lg:block absolute bottom-24 right-32 w-20 h-20 rounded-2xl -rotate-12 animate-float" style={{ background: "rgba(255,255,255,0.1)", animationDelay: "1.5s" }} />
                <div className="hidden lg:block absolute top-1/2 right-12 w-10 h-10 rounded-xl rotate-45 animate-float" style={{ background: "rgba(255,255,255,0.1)", animationDelay: "3s" }} />

                {/* Couche 4 — cartes fonctionnelles avec cycle défilement — desktop uniquement */}
                {CARD_POSITIONS.map((pos, i) => {
                    const modA = GROUP_A[i];
                    const modB = GROUP_B[i];
                    const cardBase = {
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 16, padding: '10px 16px',
                        backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        cursor: 'default', userSelect: 'none', whiteSpace: 'nowrap',
                        transition: 'transform 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1.2s ease',
                    };
                    return (
                        <div key={i} className="hidden lg:grid" style={{ position: 'absolute', ...pos }}>
                            <div style={{ ...cardBase, gridArea: '1/1', transform: (!showGroupB || !modB) ? 'translateY(0)' : 'translateY(-24px)', opacity: (!showGroupB || !modB) ? 1 : 0 }}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: modA.color + "33" }}>
                                    <modA.icon size={18} color={modA.color} />
                                </div>
                                <span className="text-white text-[13px] font-semibold">{modA.label}</span>
                            </div>
                            {modB && (
                                <div style={{ ...cardBase, gridArea: '1/1', transform: showGroupB ? 'translateY(0)' : 'translateY(24px)', opacity: showGroupB ? 1 : 0 }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: modB.color + "33" }}>
                                        <modB.icon size={18} color={modB.color} />
                                    </div>
                                    <span className="text-white text-[13px] font-semibold">{modB.label}</span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Couche 5 — contenu central */}
                <div className="relative z-10 flex flex-col items-center text-center w-full px-2">
                    {/* Badge plateforme */}
                    <div className="bg-white rounded-2xl p-3 mb-5 md:mb-8 shadow-xl inline-flex items-center gap-3 animate-fade-up">
                        <div className="bg-[#f4f7fb] rounded-xl w-10 h-10 md:w-12 md:h-12 flex-shrink-0 overflow-hidden">
                            <img src={logo} alt="Logo GPR" className="h-full w-auto object-cover object-left" />
                        </div>
                        <div className="text-left">
                            <div className="text-[#1a2b3c] font-bold text-[12px] md:text-[13px] leading-tight">Gestion des plaintes</div>
                            <div className="text-[#1a2b3c] font-bold text-[12px] md:text-[13px] leading-tight">ou des réclamations</div>
                        </div>
                        <div className="w-px h-8 bg-[#e2e8f0] mx-1 flex-shrink-0" />
                        <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center">
                            <img src={logoSicma} alt="Logo Institution" className="h-full w-full object-contain" />
                        </div>
                    </div>

                    <p className="text-white text-[15px] md:text-[19px] leading-relaxed mb-2 md:mb-3 animate-fade-up font-bold" style={{ animationDelay: "0.2s" }}>
                        Chaque voix mérite une réponse.
                    </p>
                    <p className="text-white/75 text-[12.5px] md:text-[14.5px] leading-relaxed mb-5 md:mb-10 animate-fade-up" style={{ animationDelay: "0.25s" }}>
                        Transformez les plaintes, suggestions et alertes<br />en actions concrètes et mesurables.
                    </p>
                </div>

                {/* Couche 6 — CTA déjà inscrit */}
                <div className="relative z-10 mt-5 md:mt-10 text-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
                    <h6 className="text-white/70 text-[13px] mb-3">Vous avez déjà un compte ?</h6>
                    <NavLink to="/login">
                        <Button
                            variant="outlined"
                            style={{ borderColor: "rgba(255,255,255,0.5)", color: "white", borderRadius: "10px", padding: "9px 30px", fontWeight: 600, fontSize: "13px", textTransform: "none" }}
                            className="transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(255,255,255,0.35)]"
                        >
                            Se connecter
                        </Button>
                    </NavLink>
                </div>
            </div>

            {/* ── Colonne droite — formulaire ── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white flex flex-col">
              <div className="flex flex-col items-center px-6 sm:px-10 lg:px-4 pt-10 sm:pt-14 flex-1">
                <div className="w-full max-w-[680px] animate-fade-up">

                    {/* Logos header — toujours visible */}
                    <div className="mb-4">
                        <div className="flex items-center justify-center gap-4 mb-2">
                            <div className="bg-[#f4f7fb] rounded-xl w-12 h-12 flex-shrink-0 overflow-hidden">
                                <img src={logo} alt="Logo GPR" className="h-12 w-auto object-cover object-left" />
                            </div>
                            <div className="w-px h-8 bg-[#e2e8f0]" />
                            <img src={logoSicma} alt="Logo Institution" className="h-10 object-contain" />
                        </div>
                        {/* Titre visible uniquement quand le panneau gauche est masqué */}
                        <div className="md:hidden text-center">
                            <p className="text-[#1a2b3c] font-bold text-[15px]">Gestion des Plaintes &amp; Réclamations</p>
                            <p className="text-[#64748b] text-[12px] mt-0.5">Inscrivez-vous pour accéder à la plateforme</p>
                        </div>
                    </div>

                    <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#1a2b3c] mb-1">Créer un compte</h2>
                    <p className="text-[#8a9bb0] text-[13px] mb-4">
                        Renseignez vos informations pour accéder à la plateforme
                    </p>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">

                        {/* Nom et Prénom(s) */}
                        <div>
                            <label htmlFor="name" className={labelClass}>Nom et Prénom(s)</label>
                            <div className={fieldShellClass}>
                                <SvgPerson />
                                <input
                                    id="name"
                                    type="text"
                                    className={inputClass}
                                    value={props.name || ""}
                                    onChange={(e) => props.nameChanged(e.target.value)}
                                />
                            </div>
                            <small className="errorTxt4">
                                <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.name}</span>
                            </small>
                        </div>

                        {/* Poste */}
                        <div>
                            <label htmlFor="poste" className={labelClass}>Poste</label>
                            <div className={fieldShellClass}>
                                <SvgBriefcase />
                                <FormControl variant="standard" sx={{ flex: 1 }}>
                                    <Select
                                        id="poste"
                                        sx={selectSx}
                                        disableUnderline
                                        fullWidth
                                        value={props.poste || ""}
                                        onChange={handleChange}
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>
                                            Sélectionner le poste
                                        </MenuItem>
                                        {titleOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                            <small className="errorTxt4">
                                <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.poste}</span>
                            </small>
                        </div>

                        {/* Adresse électronique */}
                        <div>
                            <label htmlFor="email" className={labelClass}>Adresse électronique</label>
                            <div className={fieldShellClass}>
                                <SvgEmail />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className={inputClass}
                                    placeholder="exemple@domaine.com"
                                    value={props.email || ""}
                                    onChange={(e) => props.emailChanged(e.target.value)}
                                />
                            </div>
                            <small className="errorTxt4">
                                <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.email}</span>
                            </small>
                        </div>

                        {/* Point de service */}
                        <div>
                            <label htmlFor="unit" className={labelClass}>Point de Service</label>
                            <div className={fieldShellClass}>
                                <SvgBuilding />
                                <FormControl variant="standard" sx={{ flex: 1 }}>
                                    <Select
                                        id="unit"
                                        sx={selectSx}
                                        disableUnderline
                                        fullWidth
                                        value={props.unit || ""}
                                        onChange={handleChange1}
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>
                                            Sélectionner l'unité organisationnelle
                                        </MenuItem>
                                        {unitOptions.map((group) => [
                                            <ListSubheader key={`group-${group.label}`}>
                                                {group.label}
                                            </ListSubheader>,
                                            group.options.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))
                                        ])}
                                    </Select>
                                </FormControl>
                            </div>
                            <small className="errorTxt4">
                                <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.unit}</span>
                            </small>
                        </div>

                        {/* Téléphone */}
                        <div>
                            <label htmlFor="phone" className={labelClass}>Téléphone</label>
                            <div className={fieldShellClass}>
                                <SvgPhone />
                                <input
                                    id="phone"
                                    type="tel"
                                    className={inputClass}
                                    value={props.phone || ""}
                                    onChange={(e) => props.phoneChanged(e.target.value)}
                                />
                            </div>
                            <small className="errorTxt4">
                                <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.phone}</span>
                            </small>
                        </div>

                        {/* Gérant du point de service */}
                        <div>
                            <label htmlFor="ca" className={labelClass}>Etes-vous gérant du point de service ?</label>
                            <div className={fieldShellClass}>
                                <SvgCheckUser />
                                <FormControl variant="standard" sx={{ flex: 1 }}>
                                    <Select
                                        id="ca"
                                        sx={selectSx}
                                        disableUnderline
                                        fullWidth
                                        value={ca}
                                        onChange={handleChange12}
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>
                                            Sélectionner une réponse
                                        </MenuItem>
                                        {caOptions.map((option) => (
                                            <MenuItem key={option.label} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="pass" className={labelClass + " mb-0"}>Mot de passe</label>
                                <span
                                    className="text-[13px] font-semibold cursor-pointer hover:underline"
                                    style={{ color: primaryColor }}
                                    onClick={generateCode}
                                >
                                    Générer un mot de passe
                                </span>
                            </div>
                            <div className={fieldShellClass}>
                                <SvgLock />
                                <input
                                    id="pass"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={inputClass}
                                    value={props.pass || ""}
                                    onChange={(e) => props.passwordChanged(e.target.value)}
                                />
                                <span onClick={toggleShowPassword} className="cursor-pointer text-[#94a3b8] flex flex-shrink-0">
                                    {showPassword ? <SvgEyeOff /> : <SvgEye />}
                                </span>
                            </div>
                            <small className="errorTxt4">
                                <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.pass}</span>
                            </small>
                        </div>

                        {/* Confirmer le mot de passe */}
                        <div className="md:col-span-2">
                            <label htmlFor="confirm" className={labelClass}>Confirmer le mot de passe</label>
                            <div className={fieldShellClass}>
                                <SvgLock />
                                <input
                                    id="confirm"
                                    type={showPassword1 ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={inputClass}
                                    value={props.pass_again || ""}
                                    onChange={(e) => props.passwordAgainChanged(e.target.value)}
                                />
                                <span onClick={toggleShowPassword1} className="cursor-pointer text-[#94a3b8] flex flex-shrink-0">
                                    {showPassword1 ? <SvgEyeOff /> : <SvgEye />}
                                </span>
                            </div>
                            <small className="errorTxt4">
                                <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.pass_again}</span>
                            </small>
                        </div>

                        {/* Bouton S'inscrire */}
                        <div className="md:col-span-2">
                            <BlockButton disabled={props.etat} style={{ display: 'block' }}>
                                <LoadingButton
                                    style={{
                                        width: "100%", height: "50px", borderRadius: "12px", fontSize: "15px", fontWeight: 700,
                                        textTransform: "none", marginTop: "8px", color: "white",
                                        background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryColor} 100%)`,
                                        boxShadow: `0 10px 25px -8px ${primaryColor}80`,
                                    }}
                                    className="transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_14px_35px_-8px_rgba(21,101,192,0.65)]"
                                    loading={props.etat}
                                    disabled={props.etat}
                                    loadingPosition="end"
                                    onClick={(e) => handleSubmit(e)}
                                    endIcon={<SvgArrowIn />}
                                    variant="contained"
                                    type="submit"
                                >
                                    <span>S'inscrire</span>
                                </LoadingButton>
                            </BlockButton>
                        </div>
                    </form>

                    {/* Lien connexion — mobile uniquement */}
                    <div className="md:hidden text-center mt-6">
                        <span className="text-[#64748b] text-[13px]">Déjà un compte ?&nbsp;</span>
                        <NavLink to="/login" className="text-[13px] font-semibold hover:underline" style={{ color: primaryColor }}>
                            Se connecter
                        </NavLink>
                    </div>

                </div>
              </div>
              {/* Footer copyright */}
              <p className="text-center text-[#64748b] text-xs py-4 mt-auto border-t border-[#f1f5f9]">
                © {new Date().getFullYear()} SICMA &amp; Associés · Tous droits réservés
              </p>
            </div>

        </div>
    );
};


const mapStateToProps = (state) => {
    return {
        isLoading: state.user.isLoading,
        id: state.user.id,
        code: state.user.code,
        name: state.user.name,
        poste: state.user.poste,
        posteLibelle: state.user.posteLibelle,
        // jobtitleItems: state.jobtitle.items,
        unit: state.user.unit,
        unitLibelle: state.user.unitLibelle,
        // unitItems: state.unit.items,
        email: state.user.email,
        phone: state.user.phone,
        additionalRole: state.user.additionalRole,
        pass: state.user.pass,
        pass_again: state.user.pass_again,
        items: state.user.items,
        selectedItem: state.user.selectedItem,
        errors: state.user.user_errors,
        etat: state.user.etat,
        etat2: state.user.etat2,
        etat3: state.user.etat3,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        userErrors: (err) => {
            dispatch(userErrors(err))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        codeChanged: (code) => {
            dispatch(codeChanged(code))
        },
        nameChanged: (name) => {
            dispatch(nameChanged(name))
        },
        posteChanged: (poste) => {
            dispatch(posteChanged(poste))
        },
        posteLibelleChanged: (posteLibelle) => {
            dispatch(posteLibelleChanged(posteLibelle))
        },
        unitChanged: (unit) => {
            dispatch(unitChanged(unit))
        },
        unitLibelleChanged: (unitLibelle) => {
            dispatch(unitLibelleChanged(unitLibelle))
        },
        emailChanged: (email) => {
            dispatch(emailChanged(email))
        },
        phoneChanged: (phone) => {
            dispatch(phoneChanged(phone))
        },
        passwordChanged: (pass) => {
            dispatch(passwordChanged(pass))
        },
        passwordAgainChanged: (pass) => {
            dispatch(passwordAgainChanged(pass))
        },
        additionalRoleChanged: (additionalRole) => {
            dispatch(additionalRoleChanged(additionalRole))
        },
      
        itemsChanged: (items) => {
            dispatch(itemsChanged(items))
        },
        selectedItemChanged: (selectedItem) => {
            dispatch(selectedItemChanged(selectedItem))
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat));
        },
        etat2Changed: (etat2) => {
            dispatch(etat2Changed(etat2));
        },
        etat3Changed: (etat3) => {
            dispatch(etat3Changed(etat3));
        },
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SignCompteUser);
