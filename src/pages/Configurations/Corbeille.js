import { itemsChanged, loading } from "../../redux/actions/Alertes/AlertesActions";
import React, { useEffect, useState, useMemo } from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import { loadItemFromSessionStorage, today } from "../../Utils/utils";
import { connect } from "react-redux";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { IconButton, Tooltip, Box, Typography, Chip, Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { deleteClaimApi, listeRSDDelete, restoreClaimApi } from "../../apis/Reclamations/ReclamationsApi";
import { deleteDenunApi, restoreDenunApi } from "../../apis/Denonciations/DenonciationsApi";
import { deleteSuggestApi, restoreSuggestApi } from "../../apis/Suggestions/SuggestionsApi";
import { KTApp } from "../../Utils/blockui";
import { LoadingButton } from "@mui/lab";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteModal from "./DeleteModal";
import ConfigKPIBar from "../../components/shared/ConfigKPIBar";
import ConfigTable from "../../components/shared/ConfigTable";
import ConfigCardView from "../../components/shared/ConfigCardView";

import ViewModeToggle from "../../components/shared/ViewModeToggle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GavelIcon from "@mui/icons-material/Gavel";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
const Corbeille = (props) => {

    const clearComponentState = () => {
        props.itemsChanged([])
    }
    const [isLoading, setIsLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [restoreConfirm, setRestoreConfirm] = useState({ open: false, claim: null, loading: false });
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

    const KPI_CONFIG = [
        { key: "total",   label: "Total supprim\u00e9s",   icon: AssignmentIcon,   iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true },
        { key: "claim",   label: "R\u00e9clamations",      icon: GavelIcon,        iconBg: "#FEE2E2", iconColor: "#B91C1C", borderColor: "#EF4444", filter: (i) => i.type === "CLAIM" },
        { key: "denun",   label: "D\u00e9nonciations",     icon: AnnouncementIcon, iconBg: "#FEF3C7", iconColor: "#B45309", borderColor: "#F59E0B", filter: (i) => i.type === "DENUNCIACION" },
        { key: "suggest", label: "Suggestions",           icon: LightbulbIcon,    iconBg: "#D1FAE5", iconColor: "#065F46", borderColor: "#10B981", filter: (i) => i.type === "SUGGESTION" },
    ];
    const CHIPS_CONFIG = [
        { value: "ALL",          label: "Tous",         filter: () => true },
        { value: "CLAIM",        label: "R\u00e9clamations",  filter: (i) => i.type === "CLAIM" },
        { value: "DENUNCIACION", label: "D\u00e9nonciations", filter: (i) => i.type === "DENUNCIACION" },
        { value: "SUGGESTION",   label: "Suggestions",  filter: (i) => i.type === "SUGGESTION" },
    ];
    const [activeChip, setActiveChip] = useState("ALL");
    const [viewMode, setViewMode] = useState("list");
    const TYPE_LABELS = { CLAIM: "Réclamation", DENUNCIACION: "Dénonciation", SUGGESTION: "Suggestion" };
    const filteredItems = useMemo(() => {
        const c = CHIPS_CONFIG.find(x => x.value === activeChip);
        const items = c ? props.items.filter(c.filter) : props.items;
        return items.map(it => ({ ...it, typeLabel: TYPE_LABELS[it.type] || it.type }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.items, activeChip]);

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
        setRestoreConfirm({ open: true, claim, loading: false });
    }

    const handleConfirmRestore = (e) => {
        const { claim } = restoreConfirm;
        if (!claim) return;
        setRestoreConfirm(p => ({ ...p, loading: true }));
        handleRestoreClaim(e, claim);
        setRestoreConfirm({ open: false, claim: null, loading: false });
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
            <LoadingButton
                onClick={(e) => {
                    e.preventDefault();
                    prepareBeforeDelete(e);
                }}
                loadingPosition="start"
                startIcon={<DeleteIcon style={{ fontSize: 15 }} />}
                variant="contained"
                sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 700,
                    px: 2.5,
                    background: "linear-gradient(135deg, #991b1b, #ef4444)",
                    "&:hover": { background: "linear-gradient(135deg, #7f1d1d, #dc2626)" },
                    "&.Mui-disabled": { opacity: 0.6 },
                }}
            >
                Supprimer
            </LoadingButton>
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

            <Dialog open={restoreConfirm.open} onClose={() => { if (!restoreConfirm.loading) setRestoreConfirm({ open: false, claim: null, loading: false }); }} fullWidth maxWidth="xs" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                <div style={{ background: "linear-gradient(135deg, #065f46, #10b981)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><SettingsBackupRestoreIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Restaurer l'élément</div>
                    </div>
                    <IconButton onClick={() => setRestoreConfirm({ open: false, claim: null, loading: false })} disabled={restoreConfirm.loading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                </div>
                <DialogContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: 14, color: "#475569" }}>Confirmez-vous la restauration de cet élément ?</Typography>
                </DialogContent>
                <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                    <Button onClick={() => setRestoreConfirm({ open: false, claim: null, loading: false })} disabled={restoreConfirm.loading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button>
                    <LoadingButton onClick={handleConfirmRestore} loading={restoreConfirm.loading} loadingPosition="start" startIcon={<SettingsBackupRestoreIcon style={{ fontSize: 15 }} />} variant="contained"
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #065f46, #10b981)", "&:hover": { background: "linear-gradient(135deg, #064e3b, #059669)" }, "&.Mui-disabled": { opacity: 0.6 } }}>
                        Restaurer
                    </LoadingButton>
                </DialogActions>
            </Dialog>
            <div className="row">

                <div className="col l12 m12 s12">
                    <div className="container">


                        <section className="tabs-vertical mt-1 section">
                            <div className="card-panel pb-5">
                                <ConfigKPIBar items={props.items} kpis={KPI_CONFIG} />
                                <Box sx={{ display: "flex", gap: 1, mb: 2.5, alignItems: "center", flexWrap: "wrap" }}>
                                    <Box sx={{ flex: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                        {CHIPS_CONFIG.map(chip => (<Chip key={chip.value} label={chip.label} onClick={() => setActiveChip(chip.value)} color={activeChip === chip.value ? "primary" : "default"} variant={activeChip === chip.value ? "filled" : "outlined"} size="small" sx={{ borderRadius: "8px", fontWeight: activeChip === chip.value ? 700 : 400 }} />))}
                                    </Box>
                                    {btnDelete}
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Liste des RSD supprimées</Typography>
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                        <ViewModeToggle value={viewMode} onChange={setViewMode} />
                                    </Box>
                                </Box>
                                {viewMode === "list" ? (
                                    <ConfigTable
                                        items={filteredItems}
                                        columns={[
                                            { id: "codeClient",            label: "Code Client",         sortable: true,  minWidth: 120 },
                                            { id: "clientFirstAndLastName", label: "Bénéficiaire",        sortable: true,  minWidth: 170, render: (c) => c.clientFirstAndLastName?.trim() || "Anonyme" },
                                            { id: "type",                  label: "Type",                sortable: true,  minWidth: 130, render: (c) => {
                                                const map = { CLAIM: { label: "Réclamation", color: "#EF4444" }, DENUNCIACION: { label: "Dénonciation", color: "#F59E0B" }, SUGGESTION: { label: "Suggestion", color: "#10B981" } };
                                                const t = map[c.type] || { label: c.type, color: "#64748B" };
                                                return <Chip label={t.label} size="small" sx={{ backgroundColor: t.color, color: "#fff", fontWeight: 700, fontSize: "0.72rem" }} />;
                                            }},
                                            { id: "delete_reason",         label: "Motif",               sortable: true,  minWidth: 180 },
                                            { id: "deletedAtFormated",     label: "Supprimé le",         sortable: true,  minWidth: 180 },
                                            { id: "actions",               label: "Actions",             sortable: false, minWidth: 90,  render: (claim) => (
                                                <Tooltip title="Restaurer"><IconButton onClick={(e) => handleModal(e, claim)} color="error"><SettingsBackupRestoreIcon /></IconButton></Tooltip>
                                            )},
                                        ]}
                                        searchFields={["codeClient", "clientFirstAndLastName", "delete_reason", "typeLabel"]}
                                        defaultSort="deletedAtFormated"
                                    />
                                ) : (
                                    <ConfigCardView items={filteredItems} titleField="codeClient" subtitleField="clientFirstAndLastName" badgeField="typeLabel"
                                        badgeColorMap={{ "Réclamation": "#EF4444", "Dénonciation": "#F59E0B", "Suggestion": "#10B981" }}
                                        searchFields={["codeClient", "clientFirstAndLastName", "delete_reason", "typeLabel"]}
                                        extraFields={[
                                            { label: "Motif", render: (c) => c.delete_reason || "-" },
                                            { label: "Supprimé le", render: (c) => c.deletedAtFormated },
                                            { label: "Restaurer", render: (c) => (<Tooltip title="Restaurer"><IconButton size="small" onClick={(e) => handleModal(e, c)} color="error"><SettingsBackupRestoreIcon fontSize="small" /></IconButton></Tooltip>) },
                                        ]} />
                                )}
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