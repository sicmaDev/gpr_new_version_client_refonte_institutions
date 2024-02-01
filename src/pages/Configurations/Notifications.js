import React, {useEffect, useState} from "react";
import Select from "react-select";
import ReactDatatable from "@ashvin27/react-datatable";
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {v4 as uuidv4} from "uuid";
import {loadItemFromLocalStorage, loadItemFromSessionStorage, today} from "../../Utils/utils";
import {modalify} from "../../Utils/modal";
import {MAX_SUBJECT_DURATION} from "../../Utils/globals";
import { connect } from "react-redux";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/NotificationsApi";
import excel from '../../assets/images/excel.svg'
import pdf from '../../assets/images/pdf.svg'
import {handlePrint} from "../../Utils/tables";
import {table2XLSX} from "../../Utils/tabletoexcel";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import {emailsChanged, emailsLibelleChanged, etat2Changed, etat3Changed, etatChanged, idChanged, items2Changed, itemsChanged, notificationErrors, roleChanged, roleLibelleChanged } from "../../redux/actions/Configurations/NotificationsActions";
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';


const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({...provided, zIndex: 9999})
};
const Notifications = (props) => {
    
    
    useEffect(() => {
        liste(props).then((r) => {});

        window.$('.tooltipped').tooltip();
        //cleanup
        return clearComponentState();
    }, []);

    const handleChange = (e) => {
        props.emailsChanged(e.value)
        props.emailsLibelleChanged(e.label)
    }
    const handleChange1 = (obj) => {
        props.roleChanged(obj.value)
        props.roleLibelleChanged(obj.label)
    }

    let columns = [
        {
            key: "firstAndLastName",
            text: "Nom et Prénoms",
            className: "user-firstname",
            cell: (user, index) => {
                return user.firstAndLastName
            }
        },
        {
            key: "email",
            text: "Email",
            className: "user-email",
            cell: (user, index) => {
                return user.email
            }
        },
        {
            key: "Titre",
            text: "Titre",
            className: "titre",
            
            cell: (user, index) => {
                return user.titre
            }
        },
        {
            key: "action",
            text: "Action",
            className: "",
            align: "left",
            sortable: false,
            cell: (user) => {
                // console.log("use",claim)
                let iconeElt =<div style={{ cursor:"pointer" }} onClick={(e) => handleModal(e,user.id)} className="card-content red-text"><PersonRemoveIcon/></div>
                return iconeElt
            },
        }
        
       
    ];

    let config = {
        page_size: 15,
        length_menu: [ 15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "Objets",
        button: {
            //excel: true,
            //pdf: true,
           //print: true,
        },
        language: {
            length_menu: "Afficher _MENU_ éléments",
            filter: "Rechercher...",
            info: "Affichage de l'élement _START_ à _END_ sur _TOTAL_ éléments",
            zero_records: "Aucun élément à afficher",
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

    let users = props.items2;
    let agentMailOptions = [];
    let usersH = users.filter((e) => {
        return (
          e.emailReceiver === false
        );
    })
    usersH.map((user) => {
        
        agentMailOptions.push({
            label: user.firstAndLastName + "         < " + user.email + " >",
            value: user.id,
        });
    });

    let roleOptions
    if (props.role !== undefined) {
        roleOptions = [
            {"label": "Directeur Exécutif", "value": "DE" },
            {"label": "Pilote", "value": "PILOTE" },
            {"label": "Coordonnateur", "value": "COORDONNATEUR" },
            {"label": "Responsable d'Agence", "value": "RA" },
            {"label": "Autres", "value": "AUTRES" },
        ]

    } else {
        roleOptions = ""
    }

    

    let errors = {};
    const handleValidation = () => {
        let isValid = true;

        if((props.emails==="" || props.emails===undefined || props.emails===null)){
            isValid = false;
            errors["emails"] = "Champ incorrect";
        }
        if((props.role==="" || props.role===undefined || props.role===null)){
            isValid = false;
            errors["role"] = "Champ incorrect";
        }
        return isValid
    }
    const handleSubmit = (e) => {
        e.preventDefault()
       
        if (handleValidation()) {
            
            let item = {}
            item["ids"] = props.emails;
            item["poste"] = props.role;
            // console.log("dataaaaa",props)
            props.etatChanged(true)
            ajout(item, props).then(() => {
                handleCancel(e)
            })
        } else {
           
        }
       
        props.notificationErrors(errors)

    }

    function clearComponentState() {
        props.idChanged("")
        props.emailsChanged("")
        props.emailsLibelleChanged("")
        props.roleChanged("")
        props.notificationErrors({})
        // props.selectedItemChanged({})
       
    }

    // let buttonText = props.selectedItem!==null ? "Modifier" : "Ajouter";
    const handleCancel = (e) => {
        e.preventDefault()
        clearComponentState()
    }
   
    const handleModal = (e,id) => {
        e.preventDefault()
        modalify("Confirmation", "Confirmez vous la suppression de cet élément?", "confirm", ()=>handleDelete(e,id))
    }
   
    const handleDelete = (e,id) => {
        e.preventDefault()
        // console.log("iddelete",id)
        props.etat3Changed(true)
        suppression(props,id).then(() => {
            handleCancel(e)
        })
        clearComponentState()
        props.notificationErrors(errors)
    }
    const rowClickedHandler = (event, data, rowIndex) => {
        // console.log(data)
        props.idChanged(data.id?data.id:"")
        // props.libelleChanged(data.libelle?data.libelle:"")
        // props.risqueLevelChanged(data.risqueLevel?data.risqueLevel:"")
        // props.descriptionChanged(data.description?data.description:"")
        // props.processingTimeChanged(data.processingTime?data.processingTime:"")
        // props.selectedItemChanged(data?data:"")
        

    }
    const tableChangeHandler = data => {
    }
     

    return (
        <>
            <div className="card-panel">
                <form className="paaswordvalidate" >
                    <div className="row">
                        <div className="col s12"><h6 className="card-title">Configurer les notifications</h6>
                            <p>Il s'agit d'enregistrer les utilisateurs de votre institution qui doivent recevoir les e-mails lors de l'enregistrement d'une réclamation</p>
                        </div>
                    </div>

                    <div className="row">
                    <div className="col l6 m12 s12 input-field">
                        <Select
                            // isMulti
                            className="react-select-container mt-4"
                            classNamePrefix="react-select"
                            style={styles}
                            placeholder="Qui sont ceux qui doivent recevoir des notifications ?"
                            options={agentMailOptions}
                            value={props.emails!=="" ? {"label": props.emailsLibelle, "value": props.emails } : "Sélectionner l'utilisateur"}
                            onChange={handleChange}
                            // onChange={(e) => props.emailsChanged(e.value)}
                        />
                        <label
                        htmlFor="idObjet"
                        className={"active"}
                        >
                        Utilisateurs
                        </label>
                        <small className="errorTxt4">
                        <div
                            id="cpassword-error"
                            className="error"
                        >
                            {props.errors !== undefined
                            ? props.errors.emails
                            : ""}
                        </div>
                        </small>
                    </div>
                    <div className="col l6 m12 s6 input-field">

                        <Select
                            id={"usrole"}
                            className='react-select-container mt-4'
                            classNamePrefix="react-select"
                            style={styles}
                            placeholder="Sélectionnez le role"
                            options={roleOptions}
                            // value={roleValue}
                            // onChange={(e) => props.roleChanged(e.value)}
                            value={props.role!=="" ? {"label": props.roleLibelle, "value": props.role } : "Sélectionner l'utilisateur"}
                            onChange={handleChange1}
                        />
                        <label htmlFor="usrole" className={"active"}>Rôle&nbsp;</label>
                        <small className="errorTxt4">
                            <div id="cpassword-error" className="error">
                            {props.errors !== undefined
                            ? props.errors.role
                            : ""}
                            </div>
                        </small>
                    </div>
                    <div className="col s12 display-flex justify-content-end form-action">
                        {/* {buttons}    */}
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
                    </div>
                        
                    </div>
                </form>

                <div className="row">
                    <div className="col s12">
                        <div className="card">
                            <div className="card-content">
                                <div className="row">
                                    <div className="col l6 m6 s12">
                                        <h4 className="card-title">Liste des utilisateurs qui peuvent recevoir des mails&nbsp;</h4>
                                    </div>
                                    <div className="col l6 m6 s12" style={{ textAlign:"end" }}>
                                        {/* <img src={pdf} alt="" style={{ marginRight:"15px",cursor:"pointer" }} onClick={(e) => {handlePrint(config, columns, props.items, 0)}} />
                                        <img src={excel} alt="" style={{ cursor:"pointer" }} onClick={(e) => {table2XLSX("Liste_des_objets" + today().replaceAll("/", ""),"app-objets")}} /> */}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <ReactDatatable
                                            className={"responsive-table table-xlsx"}
                                            config={config}
                                            records={props.items}
                                            columns={columns}
                                            onRowClicked={rowClickedHandler}
                                            onChange={tableChangeHandler}
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
        isLoading: state.notification.isLoading,
        id: state.notification.id,
        emails: state.notification.emails,
        emailsLibelle: state.notification.emailsLibelle,
        role: state.notification.role,
        roleLibelle: state.notification.roleLibelle,
        items: state.notification.items,
        items2: state.notification.items2,
        errors: state.notification.notification_errors,
        etat: state.notification.etat,
        etat2: state.notification.etat2,
        etat3: state.notification.etat3,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        notificationErrors: (err) => {
            dispatch(notificationErrors(err))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        emailsChanged: (emails) => {
            dispatch(emailsChanged(emails))
        },
        emailsLibelleChanged: (emailsLibelle) => {
            dispatch(emailsLibelleChanged(emailsLibelle))
        },
        roleChanged: (role) => {
            dispatch(roleChanged(role))
        },
        roleLibelleChanged: (roleLibelle) => {
            dispatch(roleLibelleChanged(roleLibelle))
        },
        itemsChanged: (items) => {
            dispatch(itemsChanged(items))
        },
        items2Changed: (items2) => {
            dispatch(items2Changed(items2))
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

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Notifications)