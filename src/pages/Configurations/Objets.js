import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import ReactDatatable from "@ashvin27/react-datatable";
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditIcon from "@mui/icons-material/Edit";
import { Tooltip, IconButton } from "@mui/material";
import {
    descriptionChanged,
    itemsChanged, risqueLevelChanged,
    libelleChanged, selectedItemChanged,
    objetErrors, idChanged, processingTimeChanged, etat3Changed, etat2Changed, etatChanged, categorieChanged, categorieLibelleChanged
} from "../../redux/actions/Configurations/ObjetsActions";
import { v4 as uuidv4 } from "uuid";
import { loadItemFromLocalStorage, loadItemFromSessionStorage, today } from "../../Utils/utils";
import { modalify } from "../../Utils/modal";
import { MAX_SUBJECT_DURATION } from "../../Utils/globals";
import { connect } from "react-redux";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/ObjetsApi";
import excel from '../../assets/images/excel.svg'
import pdf from '../../assets/images/pdf.svg'
import { handlePrint } from "../../Utils/tables";
import { table2XLSX } from "../../Utils/tabletoexcel";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { KTApp } from "../../Utils/blockui";


const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({ ...provided, zIndex: 9999 })
};
const Objets = (props) => {
    let categories;
    const [isLoading, setIsLoading] = useState(false);
    try {
        categories = JSON.parse(loadItemFromLocalStorage('app-categories'));
    }
    catch (e) {
        categories = [];
    }

    useEffect(() => {
        KTApp.blockPage({
            overlayColor: "#000000",
            type: "v2",
            state: "danger",
            message: "En cours de chargement...",
        });
        setIsLoading(true);
        liste(props).then((r) => { }).finally(() => {
            setIsLoading(false);
            KTApp.unblockPage();
        });
        window.$('.tooltipped').tooltip();
        //cleanup
        return clearComponentState();
    }, []);


    const topRef = useRef(null);
    useAutoScroll(topRef, [props.selectedItem.id], "top");

    let columns = [
        {
            key: "uuid",
            text: "Uuid",
            className: "name",
            align: "left",
            sortable: true
        },
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
            key: "categorie",
            text: "Catégorie",
            className: "level",
            align: "left",
            sortable: true,
            cell: (row) => (
                row?.categorie?.libelle ?? "-"
            )
        },
        {
            key: "risqueLevel",
            text: "Niveau de gravité",
            className: "level",
            align: "left",
            sortable: true
        },
        {
            key: "processingTime",
            text: "Délai",
            className: "level",
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
        length_menu: [15, 25, 50, 100],
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
                first: <FirstPageIcon />,
                previous: <ChevronLeftIcon />,
                next: <ChevronRightIcon />,
                last: <LastPageIcon />
            }
        }
    }

    const handleChange = (e) => {
        props.categorieChanged(e.value)
        props.categorieLibelleChanged(e.label)
    }

    let levelOptions
    if (props.risqueLevel !== undefined) {
        levelOptions = [
            { "label": "Mineur", "value": "MINEUR" },
            { "label": "Moyen", "value": "MOYEN" },
            { "label": "Grave", "value": "GRAVE" },
        ]

    } else {
        levelOptions = ""
    }

    let categorieOptions
    if (categories !== undefined) {
        categorieOptions = categories.map(categorie => {
            return { "label": categorie.libelle, "value": categorie.id }
        })
    } else {
        categorieOptions = ""
    }




    let errors = {};
    const handleValidation = () => {
        let isValid = true;

        if ((props.libelle === "" || props.libelle === undefined || props.libelle === null)) {
            isValid = false;
            errors["libelle"] = "Champ incorrect";
        }
        if ((props.risqueLevel === "" || props.risqueLevel === undefined || props.risqueLevel === null)) {
            isValid = false;
            errors["risqueLevel"] = "Champ incorrect";
        }
        if ((props.categorie === "" || props.categorie === undefined || props.categorie === null)) {
            isValid = false;
            errors["categorie"] = "Champ incorrect";
        }
        if ((props.processingTime === "" || props.processingTime === undefined || props.processingTime === null || props.processingTime > MAX_SUBJECT_DURATION)) {
            isValid = false;
            errors["processingTime"] = "Champ incorrect";
        }
        return isValid
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        // console.log(props.agency_traite);
        if (handleValidation()) {

            let item = {}
            item["libelle"] = props.libelle;
            item["description"] = props.description;
            item["processingTime"] = props.processingTime;
            item["risqueLevel"] = props.risqueLevel;
            item["categorie"] = props.categorie;

            props.etatChanged(true)
            ajout(item, props).then(() => {
                handleCancel(e)
            })
        } else {
            // console.log("houn","zbefhvvvvvvvvvvvvvv")
        }
        props.objetErrors(errors)
    }

    function clearComponentState() {
        props.idChanged("")
        props.libelleChanged("")
        props.risqueLevelChanged("")
        props.categorieChanged("")
        props.categorieLibelleChanged("")
        props.descriptionChanged("")
        props.processingTimeChanged("")
        props.objetErrors({})
        props.selectedItemChanged({})

    }

    // let buttonText = props.selectedItem!==null ? "Modifier" : "Ajouter";
    const handleCancel = (e) => {
        e.preventDefault()
        clearComponentState()
    }
    const handleEdit = (e) => {
        e.preventDefault()
        if (handleValidation()) {

            //Create updated version of selected item
            let item = {}

            item["id"] = props.id;
            item["libelle"] = props.libelle;
            item["description"] = props.description;
            item["processingTime"] = props.processingTime;
            item["risqueLevel"] = props.risqueLevel;
            item["categorie"] = props.categorie;

            props.etat2Changed(true)
            modification(item, props).then(() => {
                handleCancel(e)
            })
            clearComponentState()
        } else {
        }
        props.objetErrors(errors)
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

        props.objetErrors(errors)
    }

    const handleEditClick = (sp) => (e) => {
        rowClickedHandler(e, sp, null)
    }

    const rowClickedHandler = (event, data, rowIndex) => {
        // console.log(data)
        props.idChanged(data.id ? data.id : "")
        props.libelleChanged(data.libelle ? data.libelle : "")
        props.categorieChanged(data?.categorie?.id ? data.categorie.id : "")
        props.categorieLibelleChanged(data?.categorie?.libelle ? data.categorie.libelle : "")
        props.risqueLevelChanged(data.risqueLevel ? data.risqueLevel : "")
        props.descriptionChanged(data.description ? data.description : "")
        props.processingTimeChanged(data.processingTime ? data.processingTime : "")
        props.selectedItemChanged(data ? data : "")



    }
    const tableChangeHandler = data => {
    }

    let titleText = props.selectedItem.id !== undefined ? "Modifier ou Supprimer" : "Ajouter";


    let buttons = props.selectedItem.id !== undefined ?
        (<>
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
            <div className="card-panel" ref={topRef}>
                <form className="paaswordvalidate" >
                    <div className="row">
                        <div className="col s12"><h6 className="card-title">{titleText} un objet</h6>
                            <p>Il s'agit d'enregistrer les Objets de réclamations, dénonciations et suggestions de votre institution</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col s12">
                            <div className="input-field">
                                <input id="sname" name="libelle" type="text" placeholder=""
                                    data-error=".errorTxt4" value={props.libelle}
                                    onChange={(e) => props.libelleChanged(e.target.value)} />
                                <label htmlFor="sname" className={"active"}>Intitulé de l'objet&nbsp;
                                    <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: Rançonnement, Discrimination, Intérêts Mal Calculés, etc.. ">
                                        <HelpIcon />
                                    </a></label>
                                <small className="errorTxt4">
                                    <div id="cpassword-error" className="error">{props.errors.libelle}</div>
                                </small>
                            </div>
                        </div>

                        <div className="col s12 input-field">
                            <textarea id="sdescription" name="description" type="text" placeholder=""
                                className="validate materialize-textarea" value={props.description}
                                onChange={(e) => props.descriptionChanged(e.target.value)}
                                data-error=".errorTxt2" />
                            <label htmlFor="sdescription" className={"active"}>Description&nbsp;
                                <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: Le Rançonnement est...">
                                    <HelpIcon />
                                </a></label>
                            {/* <small className="errorTxt4">
                                <div id="cpassword-error" className="error">{props.errors.description}</div>
                            </small> */}
                        </div>
                        <div className="col s12">
                            <div className="input-field">
                                <Select

                                    id="slevel"
                                    value={{ "label": props.risqueLevel, "value": props.risqueLevel }}
                                    className='react-select-container mt-2'
                                    classNamePrefix="react-select"
                                    style={styles}
                                    placeholder="Sélectionner le niveau de gravité"
                                    options={levelOptions}
                                    onChange={(e) => props.risqueLevelChanged(e.value)}
                                />
                                <label htmlFor="slevel" className={"active"} style={{ top: '-14%' }}>Niveau de gravité</label>
                                <small className="errorTxt4">
                                    <div id="cpassword-error" className="error">{props.errors.risqueLevel}</div>
                                </small>
                            </div>
                        </div>

                        <div className="col s12">
                            <div className="input-field">
                                <Select

                                    id="slevel"
                                    className='react-select-container mt-2'
                                    classNamePrefix="react-select"
                                    style={styles}
                                    placeholder="Sélectionner la catégorie"
                                    options={categorieOptions}
                                    value={props.categorie ? { "label": props.categorieLibelle, "value": props.categorie } : "Sélectionner la categorie"}
                                    onChange={handleChange}
                                />
                                <label htmlFor="slevel" className={"active"} style={{ top: '-14%' }}>Catégorie</label>
                                <small className="errorTxt4">
                                    <div id="cpassword-error" className="error">{props.errors.categorie}</div>
                                </small>
                            </div>
                        </div>


                        <div className="col s12 mt-2">
                            <div className="input-field">
                                <input id="sduration" name="processingTime" type="number" min={0} max={MAX_SUBJECT_DURATION}
                                    placeholder=""
                                    data-error=".errorTxt4" value={props.processingTime}
                                    onChange={(e) => props.processingTimeChanged(e.target.value)} />
                                {/* <input id="sduration" name="duration" type="number" min={0} max={MAX_SUBJECT_DURATION}
                                       placeholder=""
                                       data-error=".errorTxt4" value={props.duration}
                                       onChange={(e) => props.durationChanged(e.target.value)}/> */}
                                <label htmlFor="sduration" className={"active"}>Délai (Jour)&nbsp;
                                    <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Il s'agit du nombre de jour accordée pour le traitement.<br>Exemple: 5 ou 10 ou 30  etc...">
                                        <HelpIcon />
                                    </a></label>
                                <small className="errorTxt4">
                                    <div id="cpassword-error" className="error">{props.errors.processingTime}</div>
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
                                        <h4 className="card-title">Liste des Objets&nbsp;</h4>
                                    </div>
                                    <div className="col l6 m6 s12" style={{ textAlign: "end" }}>
                                        <img src={pdf} alt="" style={{ marginRight: "15px", cursor: "pointer" }} onClick={(e) => { handlePrint(config, columns, props.items, 0) }} />
                                        <img src={excel} alt="" style={{ cursor: "pointer" }} onClick={(e) => { table2XLSX("Liste_des_objets" + today().replaceAll("/", ""), "app-objets") }} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <ReactDatatable
                                            className={"responsive-table table-xlsx app-objets no-hover"}
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
        isLoading: state.objet.isLoading,
        id: state.objet.id,
        libelle: state.objet.libelle,
        description: state.objet.description,
        processingTime: state.objet.processingTime,
        risqueLevel: state.objet.risqueLevel,
        categorie: state.objet.categorie,
        categorieLibelle: state.objet.categorieLibelle,
        items: state.objet.items,
        selectedItem: state.objet.selectedItem,
        errors: state.objet.objet_errors,
        etat: state.objet.etat,
        etat2: state.objet.etat2,
        etat3: state.objet.etat3,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        objetErrors: (err) => {
            dispatch(objetErrors(err))
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
        risqueLevelChanged: (risqueLevel) => {
            dispatch(risqueLevelChanged(risqueLevel))
        },
        categorieChanged: (categorie) => {
            dispatch(categorieChanged(categorie))
        },
        categorieLibelleChanged: (categorieLibelle) => {
            dispatch(categorieLibelleChanged(categorieLibelle))
        },
        processingTimeChanged: (processingTime) => {
            dispatch(processingTimeChanged(processingTime))
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
)(Objets)