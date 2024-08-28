import React, { useEffect } from "react";
import Select from "react-select";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ReactDatatable from "@ashvin27/react-datatable";
import HelpIcon from '@mui/icons-material/Help';
import {
    descriptionChanged,
    idChanged,
    itemsChanged,
    psErrors,
    typeChanged,
    libelleChanged, selectedItemChanged, etatChanged, etat2Changed, etat3Changed
} from "../../redux/actions/Configurations/PointsServicesActions";
import { connect } from "react-redux";
import excel from '../../assets/images/excel.svg'
import pdf from '../../assets/images/pdf.svg'
import { loadItemFromSessionStorage, today } from "../../Utils/utils";
import { modalify } from "../../Utils/modal";
import ee from "event-emitter";
import { ajout, all, disabled, modification, suppression } from "../../apis/Configurations/PointsServicesApi";
import { handlePrint } from "../../Utils/tables";
import { table2XLSX } from "../../Utils/tabletoexcel";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { Block, BlockOutlined, PersonOff, TaskAlt } from "@mui/icons-material";
import { notify } from "../../Utils/alert";
import { Chip } from "@mui/material";

const emitter = new ee();
const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({ ...provided, zIndex: 9999 })
};
const PointsServices = (props) => {
    useEffect(() => {
        all(props).then((r) => { });

        emitter.on('confirm', (e) => {
            handleDelete(e);
        });
        window.$('.tooltipped').tooltip();
        //cleanup
        return clearComponentState();
    }, []);



    let columns = [
        {
            key: "libelle",
            text: "Intitulé",
            className: "name",
            align: "left",
            sortable: true,
            cell: (sp) => {
                let libelle = sp.libelle;
                if (sp.deleted)
                    return <div style={{ display: "flex", alignItems: "center" }}><Block color="darkred" fontSize="10px" /><i style={{ color: "lightgray" }}>{libelle}</i></div>
                return libelle;
            },

        },
        {
            key: "description",
            text: "Description",
            className: "description",
            align: "left",
            sortable: true,
            cell: (sp) => {
                let description = sp.description;
                if (sp.deleted)
                    return <i style={{ color: "lightgray" }}>{description}</i>
                return description;
            },
        },
        {
            key: "type",
            text: "Type",
            className: "type",
            align: "left",
            sortable: true,
            cell: (sp) => {
                let type = sp.type;
                if (sp.deleted)
                    return <i style={{ color: "lightgray" }}>{type}</i>
                return type;
            },
        },
        {
            key: "action",
            text: "Actions",
            className: "action",
            align: "left",
            cell: (sp) => {
                if (sp.deleted) {
                    return <Chip label="Activer ?" color="primary" onClick={(e) => handleDisable(e,sp.id,false)} icon={<TaskAlt />}  />
                }else{
                    return  <Chip label="Désactiver ?"  onClick={(e) => handleDisabledModal(e,sp.id)} icon={<Block  />} variant="outlined" />
                   
                }
             
            }
        },
    ];

    let config = {
        page_size: 15,
        length_menu: [15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "Points de Services",
        button: {
            // excel: true,
            // pdf: true,
            // print: true,
        },
        language: {
            length_menu: "Afficher _MENU_ éléments",
            filter: "Rechercher...",
            info: "Affichage de l'élement _START_ à _END_ sur _TOTAL_ éléments",
            zero_records: "Aucun élément à afficher",
            no_data_text: "Aucun élément à afficher",
            loading_text: "Chargement en cours...",
            pagination: {
                first: <FirstPageIcon />,
                previous: <ChevronLeftIcon />,
                next: <ChevronRightIcon />,
                last: <LastPageIcon />
            }
        }
    }

    let typeOptions
    if (props.type !== undefined) {
        typeOptions = [
            { "label": "Direction", "value": "DIRECTION" },
            { "label": "Agence", "value": "AGENCE" },
            { "label": "Guichet", "value": "GUICHET" },
        ]

    } else {
        typeOptions = ""
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
        if ((props.type === "" || props.type === undefined || props.type === null)) {
            isValid = false;
            errors["type"] = "Champ incorrect";
        }

        return isValid
    }
    const clearComponentState = () => {
        props.idChanged("")
        props.libelleChanged("")
        props.typeChanged("")
        props.descriptionChanged("")
        props.selectedItemChanged({})
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        if (handleValidation()) {
            let item = {}
            item["type"] = props.type;
            item["libelle"] = props.libelle;
            item["description"] = props.description;

            props.etatChanged(true)
            ajout(item, props).then(() => {
                handleCancel(e)
            })
        } else {
        }
        props.psErrors(errors)
    }

    const handleEdit = (e) => {
        e.preventDefault()
        if (handleValidation()) {

            //Create updated version of selected item
            let item = {}
            item["id"] = props.id;
            item["libelle"] = props.libelle;
            item["type"] = props.type;
            item["description"] = props.description;

            props.etat2Changed(true)
            modification(item, props).then(() => {
                handleCancel(e)
            })

            clearComponentState()
        } else {
        }
        props.psErrors(errors)
    }
    const handleDisabledModal = (e,spId) => {
        e.stopPropagation();
    

        modalify("Confirmation", "Voulez-vous vraiment désactivé ce compte ?", "confirm", (e)=>{handleDisable(e,spId)})
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

        props.psErrors(errors)
    }
    const handleDisable = (e,id,isDisabled=true) => {
        e.preventDefault();
        e.stopPropagation();

        disabled(props,id,isDisabled).then(function (response) {
            notify(`Bravo - Le point de service a été ${isDisabled ? "désactivé" :"activé"} avec succes`,"success")
            all(props).then((r) => { });
            handleCancel(e)

        })
        .catch(function (error) {
            notify("Erreur - Le compte n'a pas été désactivé","error")
        });

    }
    const rowClickedHandler = (event, data, rowIndex) => {
        props.idChanged(data.id ? data.id : "")
        props.typeChanged(data.type ? data.type : "")
        props.libelleChanged(data.libelle ? data.libelle : "")
        props.typeChanged(data.type ? data.type : "")
        props.descriptionChanged(data.description ? data.description : "")
        props.selectedItemChanged(data ? data : {})
    }
    const tableChangeHandler = data => {
    }
    let titleText = props.selectedItem.id !== undefined ? "Modifier ou Supprimer" : "Ajouter";

    let buttons = props.selectedItem.id !== undefined ?

        (<>
            <LoadingButton
                className="btn waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
                onClick={(e) => handleModal(e)}
                loading={props.etat3}
                loadingPosition="end"
                endIcon={<DeleteIcon />}
                variant="contained"
                sx={{ textTransform: "initial" }}
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
                sx={{ textTransform: "initial" }}
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
                sx={{ textTransform: "initial" }}
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
                sx={{ textTransform: "initial" }}
            >
                <span>Ajouter</span>
            </LoadingButton>

        )

    return (
        <>
            <div className="card-panel">
                <form className="paaswordvalidate" >
                    <div className="row">
                        <div className="col s12">
                            <h6 className="card-title">{titleText} un point de service</h6>
                            <p>Il s'agit d'enregistrer les agences, guichets de votre institution</p>

                        </div>
                    </div>

                    <div className="row">
                        <div className="col s12">
                            <div className="input-field">
                                <input id="uname" name="libelle" type="text"
                                    data-error=".errorTxt4"
                                    placeholder=""
                                    value={props.libelle}
                                    onChange={(e) => props.libelleChanged(e.target.value)} />

                                <label htmlFor="uname" className="active">Intitulé&nbsp;
                                    <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: Direction Générale, Agence d'Amlamè etc... ">
                                        <HelpIcon />
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
                                data-error=".errorTxt2" />
                            <label htmlFor="udescription" className="active">Description&nbsp;
                                <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: L'agence de tokoin situé à ... comprend ... et est dirigé par ...">
                                    <HelpIcon />
                                </a>
                            </label>
                            <small className="errorTxt4">
                                <div id="cpassword-error" className="error">{props.errors.description}</div>
                            </small>
                        </div>
                        <div className="col s12">
                            <div className="input-field">
                                <Select
                                    id={"ulevel"}
                                    className='react-select-container mt-4'
                                    classNamePrefix="react-select"
                                    style={styles}
                                    placeholder="Sélectionner le type"
                                    options={typeOptions}
                                    value={{ "label": props.type, "value": props.type }}
                                    onChange={(e) => props.typeChanged(e.value)}
                                />
                                <label htmlFor="ulevel" className="active mb-4" style={{ top: '-18%' }}>Type&nbsp;
                                    <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: Agence, Guichet etc.. ">
                                        <HelpIcon />
                                    </a>
                                </label>
                                <small className="errorTxt4">
                                    <div id="cpassword-error" className="error">{props.errors.type}</div>
                                </small>
                            </div>
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
                                        <h4 className="card-title">Liste des points de services&nbsp;</h4>
                                    </div>
                                    <div className="col l6 m6 s12" style={{ textAlign: "end" }}>
                                        <img src={pdf} alt="" style={{ marginRight: "15px", cursor: "pointer" }} onClick={(e) => { handlePrint(config, columns, props.items, 0) }} />
                                        <img src={excel} alt="" style={{ cursor: "pointer" }} onClick={(e) => { table2XLSX("Liste_des_unités_opérationnelles" + today().replaceAll("/", ""), "app-ps") }} />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col s12">
                                        <ReactDatatable
                                            className={"responsive-table table-xlsx app-ps"}
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
        isLoading: state.ps.isLoading,
        id: state.ps.id,
        libelle: state.ps.libelle,
        type: state.ps.type,
        description: state.ps.description,
        items: state.ps.items,
        selectedItem: state.ps.selectedItem,
        errors: state.ps.ps_errors,
        etat: state.ps.etat,
        etat2: state.ps.etat2,
        etat3: state.ps.etat3,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        psErrors: (err) => {
            dispatch(psErrors(err))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        libelleChanged: (libelle) => {
            dispatch(libelleChanged(libelle))
        },
        typeChanged: (type) => {
            dispatch(typeChanged(type))
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
// export default PointsServices;
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PointsServices)