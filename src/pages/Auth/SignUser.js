import React, {useEffect, useRef, useState} from "react";
import { connect } from "react-redux";
import logo from "../../assets/images/logo_gpr.jpg";
import logoSicma from "../../assets/images/logo_sicma.png";
import LoadingButton from "@mui/lab/LoadingButton";
import LoginIcon from "@mui/icons-material/Login";
import { NavLink, useHistory } from "react-router-dom";
import { Box, Button, Modal, Typography, fabClasses, FormControl, IconButton, Input, MenuItem, Select, ListSubheader } from "@mui/material";
import { EastOutlined, WestOutlined, ArrowBackIos, Visibility, VisibilityOff } from "@mui/icons-material";
import ReactDatatable from "@ashvin27/react-datatable";
// import Select from "react-select";
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

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


const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({...provided, zIndex: 9999})
};

const MODULES = [
    { icon: ReportProblemOutlinedIcon, label: "Réclamations", color: "#fb923c" },
    { icon: LightbulbOutlinedIcon, label: "Suggestions", color: "#60a5fa" },
    { icon: CampaignOutlinedIcon, label: "Dénonciations", color: "#f87171" },
    { icon: AssessmentOutlinedIcon, label: "Rapports", color: "#34d399" },
];

const selectSx = {
    flex: 1,
    "& .MuiSelect-select": { padding: 0, fontSize: "0.875rem", color: "#1a2b3c", minHeight: "unset !important", display: "flex", alignItems: "center" },
    "&:before, &:after": { display: "none" },
    "&:hover:not(.Mui-disabled):before": { display: "none" },
};
const SignCompteUser = (props) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const navigate = useHistory();

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

    const fieldShellClass = "flex items-center gap-2.5 border-2 border-[#e2e8f0] rounded-xl px-4 h-[52px] transition-all duration-200 focus-within:border-[#1E88E5] focus-within:shadow-[0_0_0_4px_rgba(30,136,229,0.1)]";
    const labelClass = "block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.6px] mb-1.5";
    const inputClass = "validate border-0 outline-none flex-1 h-full text-sm text-[#1a2b3c] bg-transparent";
    const iconSx = { fontSize: 20, color: "#94a3b8" };

    return (
        <div className="gpr-auth flex min-h-screen" style={{ background: "#F8FAFC", fontFamily: "'Inter', -apple-system, sans-serif" }}>

            {/* ── Colonne gauche — hero storytelling ── */}
            <div
                className="hide-on-med-and-down relative overflow-hidden flex flex-col items-center justify-center px-12 py-16"
                style={{ width: "40%" }}
            >

                {/* Couche 1 — fond dégradé */}
                <div
                    className="absolute inset-0 animate-gradient-bg"
                    style={{ background: "linear-gradient(135deg, #0B1F4D 0%, #1565C0 100%)" }}
                />

                {/* Couche 2 — grands cercles semi-transparents */}
                <div
                    className="absolute rounded-full animate-blob"
                    style={{ width: "62vh", height: "62vh", top: "-14%", right: "-24%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <div
                    className="absolute rounded-full animate-blob"
                    style={{ width: "44vh", height: "44vh", bottom: "-16%", left: "-18%", background: "rgba(255,255,255,0.05)", animationDelay: "6s" }}
                />

                {/* Couche 3 — carrés flottants (opacité 10%) */}
                <div className="absolute top-20 left-28 w-16 h-16 rounded-2xl rotate-12 animate-float" style={{ background: "rgba(255,255,255,0.1)" }} />
                <div className="absolute bottom-24 right-32 w-20 h-20 rounded-2xl -rotate-12 animate-float" style={{ background: "rgba(255,255,255,0.1)", animationDelay: "1.5s" }} />
                <div className="absolute top-1/2 right-12 w-10 h-10 rounded-xl rotate-45 animate-float" style={{ background: "rgba(255,255,255,0.1)", animationDelay: "3s" }} />

                {/* Couche 4 — cartes fonctionnelles flottantes, suspendues */}
                {MODULES.map((mod, i) => {
                    const Icon = mod.icon;
                    const positions = [
                        "top-[9%] left-[5%] -rotate-6",
                        "top-[16%] right-[4%] rotate-4",
                        "bottom-[26%] left-[6%] rotate-3",
                        "bottom-[13%] right-[5%] -rotate-4",
                    ];
                    return (
                        <div
                            key={i}
                            className={`absolute z-[5] flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 backdrop-blur-md shadow-2xl hover:-translate-y-2 hover:rotate-0 hover:bg-white/20 transition-all duration-300 cursor-default ${positions[i]}`}
                        >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: mod.color + "33" }}>
                                <Icon style={{ fontSize: 18, color: mod.color }} />
                            </div>
                            <span className="text-white text-[13px] font-semibold whitespace-nowrap">{mod.label}</span>
                        </div>
                    );
                })}

                {/* Couche 5 — contenu central */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-md">

                    {/* Badge plateforme */}
                    <div className="bg-white rounded-2xl p-3 w-full max-w-[300px] mb-7 shadow-xl flex items-center gap-3 animate-fade-up">
                        <div className="bg-[#f4f7fb] rounded-xl w-11 h-11 flex-shrink-0 overflow-hidden">
                            <img src={logo} alt="Logo GPR" className="h-11 w-auto object-cover object-left" />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-[#1a2b3c] font-bold text-[12.5px] leading-tight">Gestion des plaintes</div>
                            <div className="text-[#1a2b3c] font-bold text-[12.5px] leading-tight">ou des réclamations</div>
                        </div>
                        <div className="bg-[#f4f7fb] rounded-xl w-11 h-11 flex-shrink-0 flex items-center justify-center p-1.5">
                            <img src={logoSicma} alt="Logo Institution" className="h-full w-full object-contain" />
                        </div>
                    </div>

                    <h1 className="text-white text-[42px] leading-[1.12] font-extrabold mb-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                        Créez votre <br /> <span style={{ color: "#7dd3fc" }}>compte</span>
                    </h1>
                    <p className="text-white/70 text-[14px] leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                        Renseignez vos informations personnelles pour accéder à la
                        plateforme et suivre vos réclamations, dénonciations et
                        suggestions en toute transparence.
                    </p>

                    <div className="flex items-center gap-2 text-white/70 text-xs animate-fade-up" style={{ animationDelay: "0.3s" }}>
                        <VerifiedUserOutlinedIcon style={{ fontSize: 16 }} />
                        <span>Plateforme certifiée &amp; conforme BCEAO</span>
                    </div>
                </div>

                {/* Couche 6 — CTA déjà inscrit */}
                <div className="relative z-10 mt-10 text-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
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
            <div className="flex-1 flex justify-center bg-[#F8FAFC] px-6 py-10 relative overflow-y-auto overflow-x-hidden">

                {/* Cercles flous & effets lumineux */}
                <div className="absolute -top-28 -right-28 w-96 h-96 bg-[#1565C0]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-80px] left-[-80px] w-96 h-96 bg-[#0B1F4D]/8 rounded-full blur-3xl" />
                <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-[#FFC107]/10 rounded-full blur-3xl" />

                {/* Carte premium glassmorphism */}
                <div
                    className="w-full max-w-[680px] bg-white/70 backdrop-blur-xl border border-white/60 rounded-[24px] p-8 sm:p-10 relative z-10 animate-fade-up my-auto"
                    style={{ boxShadow: "0 30px 80px -20px rgba(11,31,77,0.25)" }}
                >

                    {/* Logos visibles sur petits écrans */}
                    <div className="hide-on-large-only flex items-center justify-center gap-4 mb-7">
                        <img src={logo} alt="Logo GPR" className="h-9 object-contain" />
                        <div className="w-px h-8 bg-[#e2e8f0]" />
                        <img src={logoSicma} alt="Logo Institution" className="h-9 object-contain" />
                    </div>

                    <h2 className="text-[24px] font-extrabold text-[#1a2b3c] mb-1.5">Informations sur l'utilisateur</h2>
                    <p className="text-[#8a9bb0] text-[13.5px] mb-7">
                        Renseignez les informations personnelles de connexion qui vous permettront plus tard de vous connecter à l'outil
                    </p>

                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">

                        {/* Nom et Prénom(s) */}
                        <div>
                            <label htmlFor="name" className={labelClass}>Nom et Prénom(s)</label>
                            <div className={fieldShellClass}>
                                <PersonOutlineOutlinedIcon style={iconSx} />
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
                                <WorkOutlineOutlinedIcon style={iconSx} />
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
                                <EmailOutlinedIcon style={iconSx} />
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
                                <ApartmentOutlinedIcon style={iconSx} />
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
                                <PhoneOutlinedIcon style={iconSx} />
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
                                <HowToRegOutlinedIcon style={iconSx} />
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
                        <div className="sm:col-span-2">
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="pass" className={labelClass + " mb-0"}>Mot de passe</label>
                                <span
                                    className="text-[#1E88E5] text-[13px] font-semibold cursor-pointer hover:underline"
                                    onClick={generateCode}
                                >
                                    Générer un mot de passe
                                </span>
                            </div>
                            <div className={fieldShellClass}>
                                <LockOutlinedIcon style={iconSx} />
                                <input
                                    id="pass"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={inputClass}
                                    value={props.pass || ""}
                                    onChange={(e) => props.passwordChanged(e.target.value)}
                                />
                                <span onClick={toggleShowPassword} className="cursor-pointer text-[#94a3b8] flex flex-shrink-0">
                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                </span>
                            </div>
                            <small className="errorTxt4">
                                <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.pass}</span>
                            </small>
                        </div>

                        {/* Confirmer le mot de passe */}
                        <div className="sm:col-span-2">
                            <label htmlFor="confirm" className={labelClass}>Confirmer le mot de passe</label>
                            <div className={fieldShellClass}>
                                <LockOutlinedIcon style={iconSx} />
                                <input
                                    id="confirm"
                                    type={showPassword1 ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={inputClass}
                                    value={props.pass_again || ""}
                                    onChange={(e) => props.passwordAgainChanged(e.target.value)}
                                />
                                <span onClick={toggleShowPassword1} className="cursor-pointer text-[#94a3b8] flex flex-shrink-0">
                                    {showPassword1 ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                </span>
                            </div>
                            <small className="errorTxt4">
                                <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.pass_again}</span>
                            </small>
                        </div>

                        {/* Bouton S'inscrire */}
                        <div className="sm:col-span-2">
                            <LoadingButton
                                style={{
                                    width: "100%", height: "52px", borderRadius: "12px", fontSize: "15px", fontWeight: 700,
                                    textTransform: "none", marginTop: "8px", color: "white",
                                    background: "linear-gradient(135deg, #0F4C81 0%, #1E88E5 100%)",
                                    boxShadow: "0 10px 25px -8px rgba(15,76,129,0.5)",
                                }}
                                className="transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_14px_35px_-8px_rgba(21,101,192,0.65)]"
                                loading={props.etat}
                                loadingPosition="end"
                                onClick={(e) => handleSubmit(e)}
                                endIcon={<LoginIcon />}
                                variant="contained"
                                type="submit"
                            >
                                <span>S'inscrire</span>
                            </LoadingButton>
                        </div>
                    </form>

                    <p className="text-center text-[#b0bec8] text-xs mt-9">
                        © {new Date().getFullYear()} SICMA &amp; Associés · Tous droits réservés
                    </p>
                </div>

                <div className="content-overlay" />
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
