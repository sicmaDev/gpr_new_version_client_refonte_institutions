import React, {useEffect, useRef} from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { connect } from "react-redux";
import { v4 as uuidv4 } from 'uuid';
import EditIcon from "@mui/icons-material/Edit";
import { Tooltip, IconButton } from "@mui/material";
import {
    descriptionChanged,
    idChanged,
    itemsChanged,
    recoursExternesErrors,
    libelleChanged, selectedItemChanged, etat3Changed, etat2Changed, etatChanged
} from "../../redux/actions/Configurations/RecoursExternesActions";
import {loadItemFromSessionStorage, today} from "../../Utils/utils";
import {modalify} from "../../Utils/modal";
import ee from "event-emitter";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/RecoursExternesApi";
import excel from '../../assets/images/excel.svg'
import pdf from '../../assets/images/pdf.svg'
import {handlePrint} from "../../Utils/tables";
import {table2XLSX} from "../../Utils/tabletoexcel";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAutoScroll } from "../../hooks/useAutoScroll";



const emitter = new ee();
const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({...provided, zIndex: 9999})
};
const RecoursExternes = (props) => {
   
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
            key: "description",
            text: "Description",
            className: "description",
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
        filename: "Recours Externes",
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
        
        return isValid
    }

    const  clearComponentState = ()=> {
        props.idChanged("")
        props.libelleChanged("")
        props.descriptionChanged("")
        props.selectedItemChanged({})
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        if (handleValidation()) {

            let item = {}
            item["libelle"] = props.libelle;
            item["description"] = props.description;
           
            props.etatChanged(true)
            ajout(item, props).then(() => {
                handleCancel(e)
            })

        } else {
        }
        props.recoursExternesErrors(errors)
    }

    const handleEdit = (e) => {
        e.preventDefault()
        if (handleValidation()) {

            //Create updated version of selected item
            let item = {}
            item["id"] = props.id;
            item["libelle"] = props.libelle;
            item["description"] = props.description;
           
            props.etat2Changed(true)
            modification (item, props).then(() => {
                handleCancel(e)
            })

            clearComponentState()
        } else {
        }
        props.recoursExternesErrors(errors)
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
        
        props.etat3Changed(true)
        suppression(props, sp).then(() => {
            handleCancel(e)
        })
       
        props.recoursExternesErrors(errors)
    }    
    const handleEditClick = (sp) => (e) => {
        rowClickedHandler(e, sp, null)
    }

    const rowClickedHandler = (event, data, rowIndex) => {
        props.idChanged(data.id?data.id:"")
        props.libelleChanged(data.libelle?data.libelle:"")
        props.descriptionChanged(data.description?data.description:"")
        props.selectedItemChanged(data?data:{})
    }
    const  tableChangeHandler = data => {
    }
    
    let titleText = props.selectedItem.id!== undefined ? "Modifier ou Supprimer" : "Ajouter";
   
    let buttons = props.selectedItem.id!== undefined ?
    (<>
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
                <form className="paaswordvalidate">
                    <div className="row">
                        <div className="col s12"><h6 className="card-title">{titleText} Un recours externes</h6>
                            <p>Il s'agit d'enregistrer les différentes organisations pouvant être saisi par le client en cas d'insatisfaction</p>
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
                                    <textarea id="udescription" name="description" type="text"
                                              className="validate materialize-textarea"
                                              placeholder=""
                                              value={props.description}
                                              onChange={(e) => props.descriptionChanged(e.target.value)}
                                              data-error=".errorTxt2"/>
                            <label htmlFor="udescription" className="active">Description&nbsp;
                                <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: Le Tribunal de ... situé à... qui tranche les affaires de...">
                                    <HelpIcon/>
                                </a>
                            </label>
                            <small className="errorTxt4">
                                <div id="cpassword-error" className="error">{props.errors.description}</div>
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
                                        <h4 className="card-title">Liste des recours externes&nbsp;</h4>
                                    </div>
                                    <div className="col l6 m6 s12" style={{ textAlign:"end" }}>
                                        <img src={pdf} alt="" style={{ marginRight:"15px",cursor:"pointer" }} onClick={(e) => {handlePrint(config, columns, props.items, 0)}} />
                                        <img src={excel} alt="" style={{ cursor:"pointer" }} onClick={(e) => {table2XLSX("Liste_des_recours_externes" + today().replaceAll("/", ""),"app-recours")}} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <ReactDatatable
                                            className = {"responsive-table table-xlsx app-recours no-hover"}
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
        isLoading: state.recoursExternes.isLoading,
        id: state.recoursExternes.id,
        libelle: state.recoursExternes.libelle,
        description: state.recoursExternes.description,
        items: state.recoursExternes.items,
        selectedItem: state.recoursExternes.selectedItem,
        errors: state.recoursExternes.recoursExternesErrors,
        etat: state.recoursExternes.etat,
        etat2: state.recoursExternes.etat2,
        etat3: state.recoursExternes.etat3,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        recoursExternesErrors: (err) => {
            dispatch(recoursExternesErrors(err))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        libelleChanged: (libelle) => {
            dispatch(libelleChanged(libelle))
        },
        descriptionChanged: (description) => {
            dispatch(descriptionChanged(description))
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
)(RecoursExternes)