import React, { useEffect, useRef, useState } from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { connect } from "react-redux";
import { v4 as uuidv4 } from 'uuid';
import { Tooltip, IconButton } from "@mui/material";
import {
    documentsErrors,
    etat2Changed,
    etat3Changed,
    etatChanged,
    idChanged,
    itemsChanged,
    libelleChanged, selectedFilesChanged, selectedFilesReset, selectedItemChanged, selectedItemFilesChanged
} from "../../redux/actions/Configurations/DocumentsActions";
import { loadItemFromSessionStorage, today } from "../../Utils/utils";
import { modalify } from "../../Utils/modal";
import ee from "event-emitter";
import excel from '../../assets/images/excel.svg'
import pdf from '../../assets/images/pdf.svg'
import { handlePrint } from "../../Utils/tables";
import { table2XLSX } from "../../Utils/tabletoexcel";
import { KTApp } from "../../Utils/blockui";
import { ajout, downloadFillesApi, liste, suppression } from "../../apis/Configurations/DocumentsApi";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAutoScroll } from "../../hooks/useAutoScroll";
const Documents = (props) => {
    const [files, setFiles] = React.useState([]);
    const [isLoading, setIsLoading] = useState(false);
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
            key: "Actions",
            text: "Actions",
            className: "actions",
            align: "left",
            sortable: true,
            cell: (attachment) => {
                return (
                    <>
                        <div style={{ display: "flex", gap: "5px" }}>
                            <Tooltip title="Visualiser">
                                <IconButton onClick={() => downloadFillesApi(attachment.id, attachment.name)}>
                                    <RemoveRedEyeIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Supprimer">
                                <IconButton onClick={(e) => handleModal(e, attachment)} color="error"><DeleteIcon /></IconButton>
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
        filename: "Documents",
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


    let errors = {};
    const handleCancel = (e) => {
        e.preventDefault()
        clearComponentState()
    }
    const fileToDataURL = (file) => {
        let reader = new FileReader()
        return new Promise(function (resolve, reject) {
            reader.onload = function (event) {
                resolve(event.target.result)
            }

            reader.readAsDataURL(file)
            reader.onload = (e) => {
                props.selectedFilesChanged(e.target.result)
            }
            KTApp.unblockPage()
        })
    }

    const handleFile = (e) => {
        setFiles(e.target.files)
        let filesArray = Array.prototype.slice.call(e.target.files)
        return Promise.all(filesArray.map(fileToDataURL))
    }
    const handleValidation = () => {
        let isValid = true;

        if ((props.libelle === "" || props.libelle === undefined || props.libelle === null)) {
            isValid = false;
            errors["libelle"] = "Champ incorrect";
        }
        // console.log("testy",props.selectedFiles)
        if ((props.selectedFiles === "" || props.selectedFiles === undefined || props.selectedFiles === null || (props.selectedFiles).length === 0)) {
            isValid = false;
            errors["selectedFiles"] = "Champ incorrect";
        }

        return isValid
    }

    const clearComponentState = () => {
        props.idChanged("")
        props.libelleChanged("")
        props.selectedFilesChanged([])
        props.selectedItemChanged({})
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        if (handleValidation()) {
            const formData = new FormData();
            let item = props.libelle


            formData.append("libelles", item);
            for (let index = 0; index < files.length; index++) {
                formData.append("files", files[index]);
            }

            // console.log("data",formData)
            props.etatChanged(true)
            ajout(formData, props).then(() => {
                handleCancel(e)
            })

        } else {
        }
        props.documentsErrors(errors)
    }

    const handleModal = (e, attachment) => {
        e.preventDefault()
        modalify("Confirmation", "Confirmez vous la suppression de cet élément?", "confirm", (e) => handleDelete(e, attachment))
    }

    const handleDelete = (e, attachment) => {
        e.preventDefault()

        props.etat3Changed(true)
        suppression(props, attachment).then(() => {
            handleCancel(e)
        })


        props.documentsErrors(errors)
    }
    const rowClickedHandler = (event, data, rowIndex) => {
        props.idChanged(data.id ? data.id : "")
        props.libelleChanged(data.libelle ? data.libelle : "")
        // props.selectedFilesChanged(data.doc?data.doc:"")
        props.selectedItemChanged(data ? data : {})
    }
    const tableChangeHandler = data => {
    }

    let titleText = props.selectedItem.id !== undefined ? "Supprimer" : "Ajouter";

    let buttons = props.selectedItem.id === undefined ? (
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
    ) : null;

    return (
        <>
            <div className="card-panel">
                <form className="paaswordvalidate" onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col s12"><h6 className="card-title">{titleText} Un Document</h6>
                            <p>Il s'agit d'enregistrer les différents documents utiles aux utilisateurs de la plateforme</p>
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
                                    <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: Tribunal, etc.. ">
                                        <HelpIcon />
                                    </a>
                                </label>
                                <small className="errorTxt4">
                                    <div id="cpassword-error" className="error">{props.errors.libelle}</div>
                                </small>
                            </div>
                        </div>
                        <div className="col l12 m12 s12 file-field input-field">
                            <div className="btn btn-small file-small brand-blue">
                                <span>Fichier</span>
                                <input type="file"
                                    onChange={(e) => handleFile(e)}
                                    accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, audio/*, video/*"
                                />
                            </div>
                            <div className="file-path-wrapper">
                                <input className="file-path validate" type="text"
                                    value={props.selectedFiles} />
                            </div>
                            <small className="errorTxt4">
                                <div id="cpassword-error"
                                    className="error">{props.errors.selectedFiles}</div>
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
                                        <h4 className="card-title">Liste des documents&nbsp;</h4>
                                    </div>
                                    {/* <div className="col l6 m6 s12" style={{ textAlign:"end" }}>
                                        <img src={pdf} alt="" style={{ marginRight:"15px",cursor:"pointer" }} onClick={(e) => {handlePrint(config, columns, props.items, 0)}} />
                                        <img src={excel} alt="" style={{ cursor:"pointer" }} onClick={(e) => {table2XLSX("Liste_des_recours_externes" + today().replaceAll("/", ""),"app-recours")}} />
                                    </div> */}
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <ReactDatatable
                                            className={"responsive-table table-xlsx app-recours no-hover"}
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
        isLoading: state.document.isLoading,
        id: state.document.id,
        libelle: state.document.libelle,
        selectedFiles: state.document.selectedFiles,
        selectedItemFiles: state.document.selectedItemFiles,
        items: state.document.items,
        selectedItem: state.document.selectedItem,
        errors: state.document.documentsErrors,
        etat: state.document.etat,
        etat2: state.document.etat2,
        etat3: state.document.etat3,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        documentsErrors: (err) => {
            dispatch(documentsErrors(err))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        libelleChanged: (libelle) => {
            dispatch(libelleChanged(libelle))
        },
        selectedFilesChanged: (selectedFiles) => {
            dispatch(selectedFilesChanged(selectedFiles))
        },
        selectedFilesReset: (selectedFiles) => {
            dispatch(selectedFilesReset(selectedFiles))
        },
        selectedItemFilesChanged: (selectedItemFiles) => {
            dispatch(selectedItemFilesChanged(selectedItemFiles))
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
)(Documents)