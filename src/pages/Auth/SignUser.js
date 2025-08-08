import React, {useEffect, useRef, useState} from "react";
import { connect } from "react-redux";
import logo from "../../assets/images/logo_gpr.jpg";
import signUpPhoto from "../../assets/images/signup_photo.png";
import LoadingButton from "@mui/lab/LoadingButton";
import LoginIcon from "@mui/icons-material/Login";
import { NavLink, useHistory } from "react-router-dom";
import { Box, Button, Modal, Typography, fabClasses, Grid, FormControl, IconButton, Input, MenuItem, Select, ListSubheader } from "@mui/material";
import { EastOutlined, WestOutlined, ArrowBackIos, Visibility, VisibilityOff } from "@mui/icons-material";
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


const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({...provided, zIndex: 9999})
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
        console.log("dataUser", dataUser);
        
        if(handleValidation() && handleMdp()){
            props.etatChanged(true)
            
            createUserPublic(dataUser)
                .then(({ data }) => {
                    console.log("data", data);
                    if (data.response.status === true) {
                        localStorage.setItem("afterInscription", true);

                        notify("Bravo, vous avez été ajouté avec success", "success");
                        navigate.push("/login");
                    } else {
                        localStorage.removeItem("afterInscription");
                        notify("Erreur, Les identifiants sont incorrectes", "error");
                    }
                })
                .catch((error) => {
                    console.log("Erreur HTTP : ", error);
                    localStorage.removeItem("afterInscription");
                    const response = error.response;
                    if (response?.data) {
                        console.log("Erreur logique ou validation : ", response.data);
                        notify(`Erreur, ${(response.data.response.content.title === "Invalid email") ? "L'email existe déjà" : response.data.response.content.message || "Une erreur s'est produite"}`, "error");
                    } else {
                        notify("Erreur inconnue", "error");
                    }
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

    return (
        <>
            <div className="row">
                <div
                    className="col l7 m12 s12"
                    style={{ minHeight: "100vh", overflow: "hidden", maxHeight: "100vh" }}
                >
                    <div
                        className=""
                        style={{ display: "flex", flexDirection: "column", height: "99vh" }}
                    >
                        <div>
                            <div className="row">
                                <h1 className="center-align ">
                                    <img className="recent-file" src={logo} alt="Logo GPR" />
                                </h1>
                            </div>
                            <div className="plr-15">
                                <div className=" mb-1 mt-4">
                                    <span style={{ fontSize: "15px", fontWeight: 600 }}>
                                        Information sur l'utilisateur
                                    </span>
                                    <div>Renseignez les informations personnelles de connexion qui vont vous permettre plus tard de vous connectez a l'outil</div>
                                </div>
                            </div>
                        </div>
                        <div
                            id=""
                            className="row scroll-container plr-8"
                            // style={{ overflowY: "scroll", flex: 1 }}
                        >
                            <div className="row padding-5">
                                <form className="col l12 m12 s12 mt-1" >
                                    <div className="row">
                                        <div className="input-field col m6 s12 bf">
                                            <input
                                                id="name"
                                                type="text"
                                                className="validate"
                                                placeholder=""
                                                defaultValue={props.name}
                                                onChange={(e) => props.nameChanged(e.target.value)}
                                                data-error=".errorTxt1"
                                                style={{ marginTop: "5px" }}
                                            />
                                            <label htmlFor="name" className="active">
                                                Nom et Prénom(s)
                                            </label>
                                            <small className="errorTxt4">
                                                <div id="name-error" className="error">
                                                    {props.errors.name}
                                                </div>
                                            </small>
                                        </div>
                                        <div className="input-field col m6 s12 bf">
                                            <FormControl variant='standard' style={{ width: "100%", }}>
                                                <Select
                                                    id='poste'
                                                    className="validate"
                                                    style={{ width: "100%", marginTop: "20px" }}
                                                    options={titleOptions}
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
                                            <label htmlFor="poste" className="active">
                                                Poste
                                            </label>
                                            <small className="errorTxt4">
                                                <div id="cpassword-error" className="error">
                                                    {props.errors.poste}
                                                </div>
                                            </small>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="input-field col m6 s12 bf">
                                            <input
                                                id="name"
                                                name="email"
                                                type="text"
                                                className="validate"
                                                placeholder=""
                                                defaultValue={props.email}
                                                onChange={(e) => props.emailChanged(e.target.value)}
                                                data-error=".errorTxt1"
                                                style={{ marginTop: "5px" }}
                                            />
                                            <label htmlFor="name" className="active">
                                                Adresse électronique
                                            </label>
                                            <small className="errorTxt4">
                                                <div id="email-error" className="error">
                                                    {props.errors.email}
                                                </div>
                                            </small>
                                        </div>
                                        <div className="input-field col m6 s12 bf">
                                            <FormControl variant='standard' style={{ width: "100%", }}>
                                                <Select
                                                    id=''
                                                    className="validate"
                                                    style={{ width: "100%", marginTop: "20px" }}
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
                                            <label htmlFor="poste" className="active">
                                                Point de Service
                                            </label>
                                            <small className="errorTxt4">
                                                <div id="unit-error" className="error">
                                                    {props.errors.unit}
                                                </div>
                                            </small>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="input-field col m6 s12 bf">
                                            <input
                                                id="name"
                                                type="tel"
                                                className="validate"
                                                placeholder=""
                                                defaultValue={props.phone}
                                                onChange={(e) => props.phoneChanged(e.target.value)}
                                                data-error=".errorTxt1"
                                                style={{ marginTop: "5px" }}
                                            />
                                            <label htmlFor="name" className="active">
                                                Téléphone&nbsp;
                                            </label>
                                            <small className="errorTxt4">
                                                <div id="phone-error" className="error">
                                                    {props.errors.phone}
                                                </div>
                                            </small>
                                        </div>
                                        <div className="input-field col m6 s12 bf">
                                            <FormControl variant='standard' style={{ width: "100%", }}>
                                                <Select
                                                    id='poste'
                                                    className="validate"
                                                    style={{ width: "100%", marginTop: "20px" }}
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
                                            <label htmlFor="poste" className="active">
                                                Est-il le gérant du point de service ?&nbsp;
                                            </label>
                                            <small className="errorTxt4">
                                                <div id="cpassword-error" className="error">
                                                    {/* {props.errors.additionalRole} */}
                                                </div>
                                            </small>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="input-field col m12 s12 bf">
                                            <div style={{ display: "flex" }}>
                                                <input
                                                    style={{ flex: "1 auto" }}
                                                    id="pass"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder=""
                                                    className="validate"
                                                    value={props.pass}
                                                    onChange={(e) => props.passwordChanged(e.target.value)}
                                                />
                                                {showPassword ? <VisibilityOff onClick={(e) => { setShowPassword(false) }} /> : <Visibility onClick={(e) => { setShowPassword(true) }} />}
                                            </div>
                                            <label htmlFor="pass" className="active">
                                                Mot de passe
                                                <span style={{ color: "#007bff", cursor: "pointer", margin: "0px 15px" }} onClick={generateCode}>Générer un mot de passe</span>
                                            </label>
                                            <small className="errorTxt4">
                                                <div id="cpassword-error" className="error">
                                                    {props.errors.pass}
                                                </div>
                                            </small>     
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="input-field col m12 s12 bf">
                                            <div style={{ display: "flex" }}>
                                                <input
                                                    style={{ flex: "1 auto" }}
                                                    id="confirm"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder=""
                                                    className="validate"
                                                    value={props.pass_again}
                                                    onChange={(e) => props.passwordAgainChanged(e.target.value)}
                                                />
                                                {showPassword ? <VisibilityOff onClick={(e) => { setShowPassword(false) }} /> : <Visibility onClick={(e) => { setShowPassword(true) }} />}
                                            </div>

                                            <label htmlFor="confirm" className="active">
                                                Confirmer de passe
                                            </label>
                                        </div>
                                    </div>

                                    <div className='m12'>
                                        <Grid container spacing={3} direction="row"
                                            justifyContent="center"
                                            alignItems="center" >
                                            <Grid xs={11}>
                                                <LoadingButton
                                                    style={{
                                                        height: "50px",
                                                        backgroundColor: "#005081",
                                                        width: "100%",
                                                    }}
                                                    className='waves-effect waves-light btn-small mb-1'
                                                    color="secondary"
                                                    loading={props.etat}
                                                    loadingPosition="end"
                                                    onClick={(e) => handleSubmit(e)}
                                                    variant="contained"
                                                    type="submit"
                                                >
                                                    <span>S'INSCRIRE</span>
                                                </LoadingButton>
                                            </Grid>
                                        </Grid>
                                    </div>
                                </form>
                            </div >
                        </div >
                    </div>
                    <div className="content-overlay"></div>
                </div>
                
                <div
                    className="col s5 hide-on-med-and-down"
                    style={{ backgroundColor: "#005081", height: "100%" }}
                >
                    <div
                        style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        color: "white",
                        fontSize: "14px",
                        }}
                    >
                        <WestOutlined color="white" />
                        <NavLink to="/">
                        <span style={{ color: "white", cursor: "pointer" }}>
                            {"Retour sur la page d'accueil"}
                        </span>
                        </NavLink>
                    </div>
                    <div
                        className=""
                        style={{
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        alignContent: "center",
                        justifyContent: "center",
                        }}
                    >
                        <img
                        className="recent-file"
                        src={signUpPhoto}
                        height="60%"
                        width="60%"
                        alt="Sign Up"
                        />
                        <h6 style={{ color: "white" }}>{"Vous avez déjà un compte ?"}</h6>
                        <div>
                        <NavLink to="/login">
                            {" "}
                            <Button variant="contained"> {"Se connecter"}</Button>
                        </NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </>
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
