import React, { useEffect, useRef } from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { connect } from "react-redux";
import { v4 as uuidv4 } from 'uuid';
import { Tooltip, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useAutoScroll } from "../../hooks/useAutoScroll";

import {loadItemFromSessionStorage, today} from "../../Utils/utils";
import {modalify} from "../../Utils/modal";
import ee from "event-emitter";
import excel from '../../assets/images/excel.svg'
import pdf from '../../assets/images/pdf.svg'
import {handlePrint} from "../../Utils/tables";
import {table2XLSX} from "../../Utils/tabletoexcel";
import { contenuChanged, etat2Changed, etat3Changed, etatChanged, faqErrors, idChanged, itemsChanged, libelleChanged, selectedItemChanged } from "../../redux/actions/Configurations/FaqActions";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/FaqApi";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';



const Faq = (props) => {
   
    useEffect(() => {
        liste(props).then((r) => {});
        
        window.$('.tooltipped').tooltip();
        //cleanup
        return clearComponentState();
    }, []);

    const topRef = useRef(null);
    useAutoScroll(topRef, [props.selectedItem.id], "top");


    let code;
    let columns = [
        {
            key: "libelle",
            text: "Intitulé",
            className: "name",
            align: "left",
            sortable: true,
        },
        {
            key: "answer",
            text: "Reponse",
            className: "contenu",
            align: "left",
            sortable: true
        },
        {
            key: "action",
            text: "Actions",
            className: "action",
            align: "left",
            sortable: true,
            cell: (sp) => {
                return (
                    <>
                        <div style={{ display: "flex", gap: "5px" }}>
                            <Tooltip title="Modifier">
                                <IconButton onClick={handleEditClick(sp)} color="primary"><EditIcon /></IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                                <IconButton onClick={(e) => handleModal(e, sp)} color="error"><DeleteIcon /></IconButton>
                            </Tooltip>
                        </div>
                    </>
                )
            }
        },
    ];

    let config = {
        page_size: 15,
        length_menu: [ 15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "FAQ",
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
    const handleCancel = (e) => {
        e.preventDefault()
        clearComponentState()
    }
    const handleValidation = () => {
        let isValid = true;

        if ((props.libelle === "" || props.libelle === undefined || props.libelle === null)) {
            isValid = false;
            errors["libelle"] = "Champ incorrect";
        }
        if ((props.contenu === "" || props.contenu === undefined || props.contenu === null)) {
            isValid = false;
            errors["contenu"] = "Champ incorrect";
        }
        
        return isValid
    }

    const  clearComponentState = ()=> {
        props.idChanged("")
        props.libelleChanged("")
        props.contenuChanged("")
        props.selectedItemChanged({})
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        if (handleValidation()) {

            let item = {}
            item["libelle"] = props.libelle;
            item["contenu"] = props.contenu;
            
            props.etatChanged(true)
            ajout(item, props).then(() => {
                handleCancel(e)
            })

        } else {
        }
        props.faqErrors(errors)
    }

    const handleEdit = (e) => {
        e.preventDefault()
        if (handleValidation()) {

            //Remove selected item
           
            //Create updated version of selected item
            let item = {}
            item["id"] = props.id;
            item["libelle"] = props.libelle;
            item["contenu"] = props.contenu;
           
            props.etat2Changed(true)
            modification (item, props).then(() => {
                handleCancel(e)
            })

            clearComponentState()
        } else {
        }
        props.faqErrors(errors)
    }
    const handleModal = (e, sp) => {
        e.preventDefault()
        modalify("Confirmation", "Confirmez vous la suppression de cet élément?", "confirm", (e) => handleDelete(e, sp))
    }
    const handleEditModal = (e) => {
        e.preventDefault()
        modalify("Confirmation", "Confirmez vous la modification de cet élément?", "confirm", handleEdit)
    }
    const handleDelete = (e, sp) => {
        e.preventDefault()
        // console.log("propssss",props)
        props.etat3Changed(true)
        suppression(props, sp).then(() => {
            handleCancel(e)
        })
        props.faqErrors(errors)
    }
    const handleEditClick = (sp) => (e) => {
        rowClickedHandler(e, sp, null)
    }
    const rowClickedHandler = (event, data, rowIndex) => {
        props.idChanged(data.id?data.id:"")
        props.libelleChanged(data.libelle?data.libelle:"")
        props.contenuChanged(data.answer?data.answer:"")
        props.selectedItemChanged(data?data:{})
    }
    const  tableChangeHandler = data => {
    }
    
    let titleText = props.selectedItem.id!== undefined ? "Modifier ou Supprimer" : "Ajouter";
   
    let buttons = props.selectedItem.id!== undefined ?
    (<>
        {/* <LoadingButton
            className="btn waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
            onClick={(e) => handleModal(e)}
            loading={props.etat3}
            loadingPosition="end"
            endIcon={<DeleteIcon />}
            variant="contained"
            sx={{ textTransform:"initial" }}
        >
            <span>Supprimer</span>
        </LoadingButton> */}

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
       
    )

    return (
        <>
            <div className="card-panel" ref={topRef}>
                <form className="paaswordvalidate" onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col s12"><h6 className="card-title">{titleText} une question</h6>
                            <p>Il s'agit d'enregistrer les différentes questions afin d'aider les utilisateurs de la plateforme</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col s12">
                            <div className="input-field">
                                <input id="uname" name="libelle" type="text"
                                       data-error=".errorTxt4"
                                       placeholder=""
                                       value={props.libelle}
                                       onChange={(e) => props.libelleChanged(e.target.value)}/>
                                        <label htmlFor="uname" className="active">Intitulé&nbsp;
                                            <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: Tribunal, etc.. ">
                                                <HelpIcon/>
                                            </a>
                                        </label>
                                <small className="errorTxt4">
                                    <div id="cpassword-error" className="error">{props.errors.libelle}</div>
                                </small>
                            </div>
                        </div>
                        <div className="col s12 input-field">
                                    <textarea id="contenu" name="contenu" type="text"
                                              className="validate materialize-textarea"
                                              placeholder=""
                                              value={props.contenu}
                                              onChange={(e) => props.contenuChanged(e.target.value)}
                                              data-error=".errorTxt2"/>
                            <label htmlFor="contenu" className="active">Contenu&nbsp;
                                <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: ...">
                                    <HelpIcon/>
                                </a>
                            </label>
                            <small className="errorTxt4">
                                <div id="cpassword-error" className="error">{props.errors.contenu}</div>
                            </small>
                        </div>

                        <div className="col s12 display-flex justify-content-end form-action">
                            {buttons}   
                        </div>

                    </div>
                </form>

                <div className="row">
                    <div className="col s12">
                        <div className="card">
                            <div className="card-content">
                                <div className="row">
                                    <div className="col l6 m6 s12">
                                        <h4 className="card-title">Liste de la FAQ&nbsp;</h4>
                                    </div>
                                    <div className="col l6 m6 s12" style={{ textAlign:"end" }}>
                                        <img src={pdf} alt="" style={{ marginRight:"15px",cursor:"pointer" }} onClick={(e) => {handlePrint(config, columns, props.items, 0)}} />
                                        <img src={excel} alt="" style={{ cursor:"pointer" }} onClick={(e) => {table2XLSX("Liste_de_la_faq" + today().replaceAll("/", ""),"app-faq")}} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <ReactDatatable
                                            className = {"responsive-table table-xlsx app-faq no-hover"}
                                            config={config}
                                            records={props.items}
                                            columns={columns}
                                            // onRowClicked={rowClickedHandler}
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
        isLoading: state.faq.isLoading,
        id: state.faq.id,
        libelle: state.faq.libelle,
        contenu: state.faq.contenu,
        items: state.faq.items,
        selectedItem: state.faq.selectedItem,
        errors: state.faq.faqErrors,
        etat: state.faq.etat,
        etat2: state.faq.etat2,
        etat3: state.faq.etat3,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        faqErrors: (err) => {
            dispatch(faqErrors(err))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        libelleChanged: (libelle) => {
            dispatch(libelleChanged(libelle))
        },
        contenuChanged: (contenu) => {
            dispatch(contenuChanged(contenu))
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

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Faq)