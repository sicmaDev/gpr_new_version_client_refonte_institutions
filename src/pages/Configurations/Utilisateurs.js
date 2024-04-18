import React, {useEffect, useRef, useState} from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import Select from "react-select";
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
import { connect } from "react-redux";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/UtilisateursApi";
// import IntlTelInput from 'react-intl-tel-input';
// import 'react-intl-tel-input/dist/main.css';
import excel from '../../assets/images/excel.svg'
import pdf from '../../assets/images/pdf.svg'
import {handlePrint} from "../../Utils/tables";
import {table2XLSX} from "../../Utils/tabletoexcel";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { licenseInfo } from "../../apis/LoginApi";




const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({...provided, zIndex: 9999})
};
const Utilisateurs = (props) => {

    const handleChange = (e) => {
        props.posteChanged(e.value)
        props.posteLibelleChanged(e.label)
    }
    const handleChange1 = (obj) => {
        props.unitChanged(obj.value)
        props.unitLibelleChanged(obj.label)
    }

    let users = loadItemFromLocalStorage("app-users") !== undefined ? JSON.parse(loadItemFromLocalStorage("app-users")) : undefined;
    let nba = users !== undefined ? users.length : 0;
    useEffect(() => {
        liste(props).then((r) => {});
      
        window.$('.tooltipped').tooltip();
        //cleanup
        return clearComponentState();
    }, []);

    const [max, setMax] = useState();
  
    const licenseControl = async () => {
      try {
        let resultat = await licenseInfo();
        // console.log("resultat", resultat);
        setMax(resultat.maxPoste)
        
      } catch (error) {
        console.error("Une erreur s'est produite :", error);
      }
    };
  
    useEffect(() => {
      const fetchData = async () => {
        await licenseControl();
      };
  
      fetchData();
    }, []);

    let code;
    let columns = [
        {
            key: "code",
            text: "Code",
            className: "user-code hide",
            TrOnlyClassName: "hide",
            cell: (user, index) => {
                return user.code
            }
        },
        
        {
            key: "firstAndLastName",
            text: "Nom et Prénoms",
            className: "user-firstname hide",
            TrOnlyClassName: "hide",
            cell: (user, index) => {
                return user.firstAndLastName
            }
        },
       
        {
            key: "email",
            text: "Email",
            className: "user-email hide",
            TrOnlyClassName: "hide",
            cell: (user, index) => {
                return user.email
            }
        },
        {
            key: "posteDto.libelle",
            text: "",
            className: "user-poste hide",
            TrOnlyClassName: "hide",
            cell: (user, index) => {
                return user.posteDto.libelle
            }
        },
        {
            key: "additionalRole",
            text: "additionnalRole",
            className: "user-additionnalRole hide",
            TrOnlyClassName: "hide",
            cell: (user, index) => {
                let additionalRole =""
                if(user.additionalRole !==undefined){
                    if(user.additionalRole==="DE") additionalRole = "Directeur Exécutif";
                    if(user.additionalRole==="PILOTE") additionalRole ="Pilote";
                }
                return additionalRole
            }
        },
        {
            key: "tel",
            text: "Phone",
            className: "user-phone hide",
            TrOnlyClassName: "hide",
            cell: (user, index) => {
                return user.tel
            }
        },
        {
            key: "identity",
            text: "Identité",
            className: "identity",
            align: "left",
            sortable: true,
            cell: (user, index) => {
                return (<><span>{user.code}</span><br /><span className="truncate">{user.firstAndLastName}</span> <br /></>)
            }
        },
        {
            key: "Poste",
            text: "Poste",
            className: "poste",
            align: "left",
            sortable: true,
            cell: (user, index) => {
                let additionalRole =""
                if(user.additionalRole !==undefined){
                    if(user.additionalRole==="DE") additionalRole = "Directeur Exécutif";
                    if(user.additionalRole==="PILOTE") additionalRole ="Pilote";
                }
                return (<><span>{user.posteDto.libelle}</span><br /><span className="truncate">{user.servicePointDto.libelle}</span> <br /><span>{additionalRole}</span></>)
            }
        },
        {
            key: "contacts",
            text: "Contacts",
            className: "contacts",
            align: "left",
            sortable: true,
            cell: (user, index) => {
                return ( <><span className="truncate">{user.email}</span> <br /> <span className="truncate">{user.tel}</span></>)
            }
        },

        {
            key: "createdAt",
            text: "Ajouté le",
            className: "created_at",
            align: "left",
            sortable: true,
            cell: (user, index) => {
                let createdAt = new Intl.DateTimeFormat("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit"
                }).format(new Date(user.createdAt));
                return (createdAt);
            }
        },
    ];

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
            {"label": "Directeur Exécutif", "value": "DE" },
            {"label": "Pilote", "value": "PILOTE" },
            {"label": "Aucun", "value": "MOLDUE" },
        ]

    } else {
        roleOptions = ""
    }


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

        let data = {}
        data["firstAndLastName"] = props.name;
        data["email"] = props.email;
        data["tel"] = props.phone;
        data["posteId"] = props.poste;
        data["servicePointId"] = props.unit;
        data["additionalRole"] = props.additionalRole;
        data["password"] = props.pass;
       
       
        if(handleValidation() && handleMdp()){
            props.etatChanged(true)
            ajout(data, props).then(() => {
                handleCancel(e)
            })
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
    }
    const handleCancel = (e) => {
        e.preventDefault()
        clearComponentState()
    }
    const handleEdit = (e) => {
        e.preventDefault()
        let data = {}
        data["id"] = props.id;
        data["firstAndLastName"] = props.name;
        data["posteId"] = props.poste;
        data["servicePointId"] = props.unit;
        data["email"] = props.email;
        data["tel"] = props.phone;
        data["additionalRole"] = props.additionalRole;
        data["password"] = props.pass;

       
        if (handleValidation()) {
            props.etat2Changed(true)
            if((props.pass==="" || props.pass===undefined || props.pass===null)){
                modification (data, props).then(() => {
                    handleCancel(e)
                })
                
            }else{
                if (handleMdp()) {
                    modification (data, props).then(() => {
                        handleCancel(e)
                    })
                }
            }
        }
        else {
        }
        props.userErrors(errors)
    }
    const handleModal = (e) => {
        e.preventDefault()
        modalify("Confirmation", "Confirmez vous la suppression de cet élément?", "confirm", handleDelete)
    }
    const handleEditModal = (e) => {
        e.preventDefault()
        modalify("Confirmation", "Confirmez vous la modification de cet élément?", "confirm", handleEdit)
    }
    const handleDelete = (e) => {
        e.preventDefault()
        
        props.etat3Changed(true)
        suppression(props).then(() => {
            handleCancel(e)
        })

        props.userErrors(errors)
    }
    const rowClickedHandler = (event, data, rowIndex) => {
        props.idChanged(data.id?data.id:"")
        props.codeChanged(data.code?data.code:"")
        props.nameChanged(data.firstAndLastName?data.firstAndLastName:"")
        props.emailChanged(data.email?data.email:"")
        props.phoneChanged(data.tel?data.tel:"")
        props.unitChanged(data.servicePointDto.id?data.servicePointDto.id:"")
        props.unitLibelleChanged(data.servicePointDto.libelle?data.servicePointDto.libelle:"")
        props.posteChanged(data.posteDto.id?data.posteDto.id:"")
        props.posteLibelleChanged(data.posteDto.libelle?data.posteDto.libelle:"")
        props.additionalRoleChanged(data.additionalRole?data.additionalRole:"")
        props.selectedItemChanged(data)
       
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
        titleOptions = titles.map(title => {
            return {"label": title.libelle, "value": title.id}
        })
    } else {
        titleOptions = ""
    }
   
   
    let roleValue
    if(props.additionalRole==="PILOTE") roleValue={"label": "Pilote", "value": props.additionalRole }
    if(props.additionalRole==="MOLDUE") roleValue={"label": "Aucun", "value": "" }

    // if(props.role==="") roleValue={"label": "", "value": props.role }

  
    let titleText = props.selectedItem.id!== undefined ? "Modifier ou Supprimer" : "Ajouter";
   
    let buttons = props.selectedItem.id!== undefined ?
    (<>
        <LoadingButton
            className="btn waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
            onClick={(e) => handleModal(e)}
            loading={props.etat3}
            loadingPosition="end"
            endIcon={<DeleteIcon />}
            variant="contained"
            sx={{ textTransform:"initial" }}
        >
            <span>Supprimer</span>
        </LoadingButton>

        <LoadingButton
            className="btn waves-effect waves-light mr-1 btn-small red-text white lighten-4"
            onClick={(e) => handleCancel(e)}
            loading={props.etat2}
            loadingPosition="end"
            endIcon={<CancelIcon />}
            variant="contained"
            sx={{ textTransform:"initial" }}
        >
            <span>Annuler</span>
        </LoadingButton>

        <LoadingButton
            className="btn waves-effect waves-light mr-1 btn-small"
            onClick={(e) => handleEditModal(e)}
            loading={props.etat}
            loadingPosition="end"
            endIcon={<SaveIcon />}
            variant="contained"
            sx={{ textTransform:"initial" }}
        >
            <span>Modifier</span>
        </LoadingButton>
        
    </>)
    :
    (
        (max !== undefined && nba < max) ?
        <LoadingButton
            className="btn waves-effect waves-light mr-1 btn-small"
            onClick={(e) => handleSubmit(e)}
            loading={props.etat}
            loadingPosition="end"
            endIcon={<SaveIcon />}
            variant="contained"
            sx={{ textTransform:"initial" }}
        >
            <span>Ajouter</span>
        </LoadingButton>
        :
        <div className="card-alert card red lighten-5">
            <div className="card-content red-text">
                <ul>
                    Nombre maximum de compte utilisateur atteint. <a href="mailto:support.gpr@sicmagroup.com"> Contactez-nous</a> pour mettre à niveau le nombre de comptes utilisateurs.
                </ul>
            </div>
        </div>
       
    )

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
            {/* <div ref={ref} className="card-panel"> */}
            <div className="card-panel">

                <form id="accountForm" >
                    <div className="row">
                        <div className="col s12"><h6 className="card-title">{titleText} un utilisateur</h6></div>
                        <p>Il s'agit d'enregistrer les Utilisateurs de votre institution</p>
                    </div>
                    <div className="row">
                        <div className="col s12 m6">
                            <div className="row">
                                <div className="col s12 input-field">
                                    <input id="usfirstname" name="name" type="text"
                                           className="validate" value={props.name} placeholder="" onChange={(e) => props.nameChanged(e.target.value)}
                                           data-error=".errorTxt1"/>
                                    <label htmlFor="usfirstname" className={"active"}>Nom et Prénom(s)</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.errors.name}</div>
                                    </small>
                                </div>
                                
                                <div className="col s12 input-field">
                                    <input id="usemail" name="email" type="text" onChange={(e) => props.emailChanged(e.target.value)}
                                           className=""
                                           placeholder=""
                                           value={props.email}/>
                                    <label htmlFor="usemail" className={"active"}>Adresse électronique</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.errors.email}</div>
                                    </small>

                                </div>
                                <div className="col s12 input-field">
                                    <input type="tel" placeholder="" value={props.phone} onChange={(e) => props.phoneChanged(e.target.value)} />

                                    <label htmlFor="usphone" className={"active"}>Téléphone&nbsp;
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: 22890909090 ou +22890909090">
                                            <HelpIcon/>
                                        </a></label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.errors.phone}</div>
                                    </small>
                                </div>
                                {/* <div className="row"> */}
                                    <div className="col s12">
                                        <div className="input-field">
                                            <input id="newpswd" name="newpswd" type="password"
                                                placeholder=""
                                                data-error=".errorTxt5" value={props.pass}
                                                onChange={(e) => props.passwordChanged(e.target.value)}/> 
                                            <label htmlFor="usnewpswd" className={"active"}>Mot de passe
                                            <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Le mot de passe doit contenir au moins un chiffre et un symbol">
                                                <HelpIcon/>
                                            </a>
                                            </label>
                                            <small className="errorTxt4">
                                                <div id="cpassword-error" className="error">{props.errors.pass}</div>
                                            </small>

                                            {/* <span class="material-icons indigo-text">visibility</span> */}
                                        </div>
                                        
                                    </div>
                                    {/* <div className="col s1">
                                        <span class="material-icons indigo-text">visibility</span>
                                    </div> */}
                                {/* </div> */}
                               
                                <div className="col s12">
                                    <div className="input-field">
                                        <input id="usrepswd" type="password" name="repswd"
                                               placeholder=""
                                               data-error=".errorTxt6"
                                               value={props.pass_again}
                                               onChange={(e) => props.passwordAgainChanged(e.target.value)}/>
                                        <label htmlFor="usrepswd" className={"active"}>Mot de passe encore</label>
                                        <small className="errorTxt4">
                                            <div id="cpassword-error" className="error">{props.errors.pass_again}</div>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col s12 m6">
                            <div className="row">
                               
                                <div className="col s12 input-field">
                                    <Select
                                        id="usjobtitle"
                                        options={titleOptions}
                                        className='react-select-container mt-4'
                                        classNamePrefix="react-select"
                                        style={styles}
                                        placeholder="Sélectionner le poste"
                                        value={props.poste ? {"label": props.posteLibelle, "value": props.poste } : "Sélectionner le poste"}
                                        // onChange={(e) => props.posteChanged(e.value)}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="usjobtitle" className={"active"}>Poste</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">
                                            {props.errors.poste}
                                        </div>
                                    </small>
                                </div>
                                <div className="col s12 input-field">
                                    <Select
                                        id="usunit"
                                        options={unitOptions}
                                        className='react-select-container mt-4'
                                        classNamePrefix="react-select"
                                        style={styles}
                                        placeholder="Sélectionner l'unité organisationnelle"
                                        value={props.unit ? {"label": props.unitLibelle, "value": props.unit } : "Sélectionner l'unité organisationnelle"}
                                        // onChange={(e) => props.unitChanged(e.value)}
                                        onChange={handleChange1}
                                    />
                                    <label htmlFor="usunit" className={"active"}>Point de Service</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">
                                            {props.errors.unit}
                                        </div>
                                    </small>
                                </div>
                                <div className="col s12 input-field">

                                    <Select
                                        id={"usrole"}
                                        className='react-select-container mt-4'
                                        classNamePrefix="react-select"
                                        style={styles}
                                        placeholder="Sélectionnez le role"
                                        options={roleOptions}
                                        value={roleValue}
                                        onChange={(e) => props.additionalRoleChanged(e.value)}
                                    />
                                    <label htmlFor="usrole" className={"active"}>Role Spécifique&nbsp;
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                           data-tooltip="L'un des rôles spécifiques qui accorde certains privilèges">
                                            <HelpIcon/>
                                        </a>
                                    </label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">
                                            {props.errors.additionalRole}
                                        </div>
                                    </small>
                                </div>
                                
                            </div>
                        </div>
                        
                        <div className="col s12 display-flex justify-content-end form-action">
                            {buttons}   
                        </div>

                        
                    </div>
                </form>
                <div className="row">
                    <div className="col s12 ">
                        <div className="card">
                            <div className="card-content">
                                <div className="row">
                                    <div className="col l6 m6 s12">
                                        <h4 className="card-title">Liste des Utilisateurs&nbsp;</h4>
                                    </div>
                                    <div className="col l6 m6 s12" style={{ textAlign:"end" }}>
                                        <img src={pdf} alt="" style={{ marginRight:"15px",cursor:"pointer" }} onClick={(e) => {handlePrint(config, columns, props.items, 0)}} />
                                        <img src={excel} alt="" style={{ cursor:"pointer" }} onClick={(e) => {table2XLSX("Liste_des_utilisateurs" + today().replaceAll("/", ""),"app-users")}} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <ReactDatatable
                                            className = {"responsive-table table-xlsx app-users"}
                                            config={config}
                                            records={props.items}
                                            columns={columns}
                                            onRowClicked={rowClickedHandler}
                                            onChange = {tableChangeHandler}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

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

export default  connect(
    mapStateToProps,
    mapDispatchToProps,
)(Utilisateurs)