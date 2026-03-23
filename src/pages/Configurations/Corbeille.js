import { itemsChanged, loading } from "../../redux/actions/Alertes/AlertesActions";
import React, { useEffect, useState } from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import { loadItemFromSessionStorage, today } from "../../Utils/utils";
import { connect } from "react-redux";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { IconButton, Tooltip } from "@mui/material";
import { modalify } from "../../Utils/modal";
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { deleteClaimApi, listeRSDDelete, restoreClaimApi } from "../../apis/Reclamations/ReclamationsApi";
import { deleteDenunApi, restoreDenunApi } from "../../apis/Denonciations/DenonciationsApi";
import { deleteSuggestApi, restoreSuggestApi } from "../../apis/Suggestions/SuggestionsApi";
import { KTApp } from "../../Utils/blockui";
import { LoadingButton } from "@mui/lab";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteModal from "./DeleteModal";
const Corbeille = (props) => {

    const clearComponentState = () => {
        props.itemsChanged([])
    }
    const [isLoading, setIsLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    useEffect(() => {
        KTApp.blockPage({
            overlayColor: '#000000',
            type: 'v2',
            state: 'danger',
            message: 'En cours de chargement...'
        })
        setIsLoading(true);
        props.itemsChanged([])
        listeRSDDelete(props).then((r) => { }).finally(() => {
            setIsLoading(false);
            KTApp.unblockPage();
        });

        window.$('.buttons-excel').html('<span><i class="fa fa-file-excel"></i></span>')
        window.$('ul.pagination').parent().parent().css({ marginTop: "1%", boxShadow: "none" })
        window.$('ul.pagination').parent().css({ boxShadow: "none" })
        window.$('ul.pagination').parent().addClass('white')
        window.$('ul.pagination').addClass('right-align')
        window.$('a.page-link input').addClass('indigo-text bold-text')
        window.$('.pagination li.disabled a').addClass('black-text')
        window.$('#as-react-datatable').removeClass('table-bordered table-striped')
        window.$('#as-react-datatable').addClass('highlight display dataTable dtr-inline')
        window.$('#as-react-datatable tr').addClass('cursor-pointer')

        //cleanup
        return clearComponentState();
    }, []);

    let user = loadItemFromSessionStorage("app-user") !== undefined ? (JSON.parse(loadItemFromSessionStorage("app-user"))) : undefined;
    let hbt = (user.posteDto.habilitations).split(',');
    let addR = (user.additionalRole);

    let columns = [
        {
            key: "codeClient",
            text: "Code Client",
            className: "codeClient",
            align: "left",
            sortable: true,
        },
        {
            key: "clientFirstAndLastName",
            text: "Bénéficiaire",
            className: "client",
            align: "left",
            sortable: true,
            cell: (claim) => claim.clientFirstAndLastName && (claim.clientFirstAndLastName.trim() !== "" || claim.clientFirstAndLastName.trim() !== null) ? claim.clientFirstAndLastName : "Anonyme"
        },

        {
            key: "type",
            text: "Type",
            className: "type",
            align: "left",
            sortable: true,
            cell: (claim) => {
                let typeFormat;
                switch (claim.type) {
                    case "CLAIM":
                        typeFormat = "Réclamation";
                        break;
                    case "DENUNCIACION":
                        typeFormat = "Dénonciation";
                        break;
                    case "SUGGESTION":
                        typeFormat = "Suggestion";
                        break;
                    default:
                        typeFormat = "Anonyme"; // ou "" si tu veux rien afficher
                }
                return typeFormat;
            }
        },

        {
            key: "delete_reason",
            text: "Motif de suppression",
            className: "reason",
            align: "left",
            sortable: true,
        },


        {
            key: "deletedAtFormated",
            text: "Supprimée le",
            className: "deletedAt",
            align: "left",
            sortable: true,
            cell: (claim, index) => {
                if (claim.deletedAt) {
                    const date = new Date(claim.deletedAt);
                    if (!isNaN(date)) {
                        return new Intl.DateTimeFormat("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "2-digit",
                            hour: "numeric",
                            minute: "numeric",
                        }).format(date);
                    } else {
                        return "Date invalide";
                    }
                } else {
                    return "Non défini";
                }

            },
        },


        {
            key: "action",
            text: "Actions",
            className: "action",
            align: "left",
            sortable: true,
            cell: (claim) => {
                return (
                    <>
                        <div style={{ display: "flex", gap: "5px" }}>

                            <Tooltip title="Restaurer">
                                <IconButton onClick={(e) => handleModal(e, claim)} color="error"><SettingsBackupRestoreIcon /></IconButton>
                            </Tooltip>
                        </div>
                    </>
                )
            }
        },


    ];

    const handleModal = (e, claim) => {
        e.preventDefault()
        modalify("Confirmation", "Confirmez vous la restauration de cet élément ?", "confirm", (e) => handleRestoreClaim(e, claim))
    }

    const handleRestoreClaim = (e, claim) => {
        // console.log("claim :", claim)
        e.preventDefault();
        let data = {};
        data["claimId"] = claim.id;

        switch (claim.type) {
            case "CLAIM":
                restoreClaimApi(data)
                    .then((res) => {
                        listeRSDDelete(props).then((r) => { });
                        // console.log("res >> ", res);
                    })
                    .catch((err) => {
                        // console.log("err add extra >> ", err);

                    })
                    .then(() => {
                        // console.log("res2 >> ");
                    });
                break;
            case "DENUNCIACION":
                restoreDenunApi(data)
                    .then((res) => {
                        listeRSDDelete(props).then((r) => { });
                        // console.log("res >> ", res);
                    })
                    .catch((err) => {
                        // console.log("err add extra >> ", err);

                    })
                    .then(() => {
                        //  console.log("res2 >> ");
                    });
                break;
            case "SUGGESTION":
                restoreSuggestApi(data)
                    .then((res) => {
                        listeRSDDelete(props).then((r) => { });
                        // console.log("res >> ", res);
                    })
                    .catch((err) => {
                        // console.log("err add extra >> ", err);

                    })
                    .then(() => {
                        // console.log("res2 >> ");
                    });
                break;

            default:
                break;
        }


    }

    let config = {
        page_size: 15,
        length_menu: [15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "Liste des RSD supprimées",
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
                last: <LastPageIcon />,
            }
        }
    }

    let content = [];
    content = props.items;

    content.forEach(element => {
        if (element.deletedAt) {
            const date = new Date(element.deletedAt);
            if (!isNaN(date)) {
                element.deletedAtFormated = new Intl.DateTimeFormat("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "numeric",
                    minute: "numeric",
                }).format(date);
            } else {
                element.deletedAtFormated = "Date invalide";
            }
        } else {
            element.deletedAtFormated = "Non défini";
        }
    });


    const rowClickedHandler = (event, data, rowIndex) => {
        props.idChanged(data.id)
        props.libelleChanged(data.libelle)
        props.descriptionChanged(data.description)
        props.selectedItemChanged(data)
    }
    const tableChangeHandler = data => {
    }
    const prepareBeforeDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setShowDeleteModal(true);
    };
    let btnDelete;
    if (hbt.includes("H12")) {
        btnDelete = (
            <>
                <div className="col l6 m6 s12 justify-content-end">
                    <LoadingButton
                        onClick={(e) => {
                            e.preventDefault();
                            prepareBeforeDelete(e);
                        }}
                        className="waves-effect waves-effect-b waves-light btn-small"
                        // loading={props.etat3}
                        loadingPosition="end"
                        endIcon={<DeleteIcon />}
                        variant="contained"
                        sx={{
                            backgroundColor: "#ef6c00",
                            textTransform: "initial",
                            transition: "background-color 0.3s ease",
                            '&:hover': {
                                backgroundColor: '#fda321',
                            },
                        }}
                    >
                        <span>Supprimer</span>
                    </LoadingButton>
                </div>
            </>
        );
    }

    const handleDeleteSubmit = ({ code, reason }) => {
        setDeleteLoading(true);

        const prefix = code.substring(0, 3).toLowerCase();

        const apiMap = {
            rec: deleteClaimApi,
            den: deleteDenunApi,
            sug: deleteSuggestApi,
        };

        const apiCall = apiMap[prefix];

        if (!apiCall) {
            console.error("Type de code inconnu :", code);
            setDeleteLoading(false);
            return;
        }

        let data = {};
        data["claimCode"] = code;
        data["reason"] = reason;

        apiCall(data)
            .then((res) => {
                // console.log("Suppression réussie :", res);

                setShowDeleteModal(false);
                setDeleteReason("");
                listeRSDDelete(props).then((r) => { }).finally(() => {
                    setIsLoading(false);
                    KTApp.unblockPage();
                });
            })
            .catch((err) => {
                // console.error("Erreur de suppression :", err);
                // notify("Une erreur s'est produite", "error");
            })
            .finally(() => {
                setDeleteLoading(false);
            });
    };

    return (
        <div id="main">
            {showDeleteModal && (
                <DeleteModal
                    open={showDeleteModal}
                    // code={props.code}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteSubmit}
                />
            )}
            <div className="row">

                <div className="col l12 m12 s12">
                    <div className="container">


                        <section className="tabs-vertical mt-1 section">

                            <div className="row">
                                <div className="col s12">
                                    <div className="card">
                                        <div className="card-content">
                                            <div className="row">
                                                <div className="col l6 m6 s12">
                                                    <h4 className="card-title">Liste des RSD supprimées&nbsp;</h4>
                                                </div>
                                                {btnDelete}

                                            </div>
                                            <div className="row">
                                                <div className="col s12">
                                                    <ReactDatatable
                                                        className={"responsive-table table-xlsx app-langues no-hover"}
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
                        </section>
                    </div>
                    <div className="content-overlay"></div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        isLoading: state.alert.isLoading,
        items: state.alert.items,
    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        loading: (err) => {
            dispatch(loading(err))
        },
        itemsChanged: (items) => {
            dispatch(itemsChanged(items))
        },
    }
};


export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Corbeille);