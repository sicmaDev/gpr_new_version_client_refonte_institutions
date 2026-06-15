import React, { useEffect, useRef, useState, useMemo } from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { connect } from "react-redux";
import { v4 as uuidv4 } from 'uuid';
import { Tooltip, IconButton, Box, Typography, Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {
    documentsErrors,
    etat2Changed,
    etat3Changed,
    etatChanged,
    idChanged,
    itemsChanged,
    libelleChanged, selectedFilesChanged, selectedFilesReset, selectedItemChanged, selectedItemFilesChanged
} from "../../redux/actions/Configurations/DocumentsActions";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { Add as AddIcon } from "@mui/icons-material";
import { KTApp } from "../../Utils/blockui";
import { ajout, downloadFillesApi, liste, suppression } from "../../apis/Configurations/DocumentsApi";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAutoScroll } from "../../hooks/useAutoScroll";
import ConfigKPIBar from "../../components/shared/ConfigKPIBar";
import ConfigTable from "../../components/shared/ConfigTable";
import ConfigCardView from "../../components/shared/ConfigCardView";
import FolderIcon from "@mui/icons-material/Folder";

import ViewModeToggle from "../../components/shared/ViewModeToggle";

const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" };
const inputStyle = (hasError) => ({ width: "100%", boxSizing: "border-box", border: hasError ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "10.5px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", height: 40 });

const Documents = (props) => {
    const [files, setFiles] = React.useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, attachment: null, loading: false });
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState("list");
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
    const fileInputRef = useRef(null);
    const KPI_CONFIG = [{ key: "total", label: "Total documents", icon: FolderIcon, iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true }];
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
        props.selectedFilesReset("");
        setFiles([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
    const handleSubmit = (e) => {
        if (e) e.preventDefault()
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
                clearComponentState();
                setAddModalOpen(false);
            })

        }
        props.documentsErrors(errors)
    }

    const handleModal = (e, attachment) => {
        e.preventDefault()
        setDeleteConfirm({ open: true, attachment, loading: false });
    }

    const handleDelete = (attachment) => {
        setDeleteConfirm(p => ({ ...p, loading: true }));
        props.etat3Changed(true)
        suppression(props, attachment)
            .then(() => { clearComponentState(); setDeleteConfirm({ open: false, attachment: null, loading: false }); })
            .finally(() => { props.etat3Changed(false); });

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

    return (
        <>
            <div className="card-panel">
                <Dialog open={addModalOpen} onClose={() => { if (!props.etat) { setAddModalOpen(false); clearComponentState(); } }} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: "linear-gradient(135deg, #1e2188 0%, #3b3fd8 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><AddIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                            <div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Ajouter un document</div>
                                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 2 }}>Enregistrer un document utile aux utilisateurs</div>
                            </div>
                        </div>
                        <IconButton onClick={() => { if (!props.etat) { setAddModalOpen(false); clearComponentState(); } }} disabled={props.etat} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                    </div>
                    <DialogContent sx={{ p: 3 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Intitulé <span style={{ color: "#ef4444" }}>*</span></label>
                                <input value={props.libelle} onChange={(e) => props.libelleChanged(e.target.value)} placeholder="Ex: Tribunal, Statuts, etc."
                                    style={inputStyle(!!props.errors.libelle)} onFocus={(e) => { if (!props.errors.libelle) e.target.style.borderColor = "#3b3fd8"; }} onBlur={(e) => { if (!props.errors.libelle) e.target.style.borderColor = "#e2e8f0"; }} />
                                {props.errors.libelle && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{props.errors.libelle}</div>}
                            </div>
                            <div>
                                <label style={labelStyle}>Fichier <span style={{ color: "#ef4444" }}>*</span></label>
                                <input type="file" ref={fileInputRef} onChange={(e) => handleFile(e)}
                                    accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, audio/*, video/*"
                                    style={{ width: "100%", boxSizing: "border-box", border: props.errors.selectedFiles ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "9px 14px", fontSize: 13, background: "#fff" }} />
                                {props.errors.selectedFiles && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{props.errors.selectedFiles}</div>}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                        <Button onClick={() => { setAddModalOpen(false); clearComponentState(); }} disabled={props.etat} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button>
                        <LoadingButton onClick={handleSubmit} loading={props.etat} loadingPosition="start" startIcon={<SaveIcon style={{ fontSize: 15 }} />} variant="contained"
                            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, "&.Mui-disabled": { opacity: 0.6 } }}>
                            Ajouter
                        </LoadingButton>
                    </DialogActions>
                </Dialog>

                <ConfigKPIBar items={props.items} kpis={KPI_CONFIG} />
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, mb: 1.5 }}>
                    <ViewModeToggle value={viewMode} onChange={setViewMode} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, gap: 1, flexWrap: "wrap" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Liste des documents</Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <LoadingButton onClick={() => setAddModalOpen(true)} variant="contained" startIcon={<AddIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, fontSize: "0.82rem", px: 2.5, whiteSpace: "nowrap" }}>Ajouter</LoadingButton>
                    </Box>
                </Box>
                {viewMode === "list" ? (
                    <ConfigTable
                        items={props.items}
                        exportClassName="app-document"
                        columns={[
                            { id: "libelle",  label: "Intitul\u00e9", sortable: true,  minWidth: 260 },
                            { id: "actions", label: "Actions",  sortable: false, minWidth: 130, render: (att) => (
                                <div style={{ display: "flex", gap: "5px" }}>
                                    <Tooltip title="Visualiser"><IconButton onClick={() => downloadFillesApi(att.id, att.name)}><RemoveRedEyeIcon /></IconButton></Tooltip>
                                    <Tooltip title="Supprimer"><IconButton onClick={(e) => handleModal(e, att)} color="error"><DeleteIcon /></IconButton></Tooltip>
                                </div>
                            )},
                        ]}
                        searchFields={["libelle"]}
                        defaultSort="libelle"
                    />
                ) : (
                    <ConfigCardView items={props.items} titleField="libelle" searchFields={["libelle"]}
                        extraFields={[{ label: "Visualiser", render: (att) => (
                            <Tooltip title="Visualiser"><IconButton size="small" onClick={() => downloadFillesApi(att.id, att.name)}><RemoveRedEyeIcon fontSize="small" /></IconButton></Tooltip>
                        )}]}
                        onDelete={(att) => setDeleteConfirm({ open: true, attachment: att, loading: false })} />
                )}

            </div>

            <Dialog open={deleteConfirm.open} onClose={() => { if (!deleteConfirm.loading) setDeleteConfirm({ open: false, attachment: null, loading: false }); }} fullWidth maxWidth="xs" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                <div style={{ background: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><DeleteIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Supprimer le document</div>
                    </div>
                    <IconButton onClick={() => setDeleteConfirm({ open: false, attachment: null, loading: false })} disabled={deleteConfirm.loading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                </div>
                <DialogContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: 14, color: "#475569" }}>Confirmez-vous la suppression de cet élément ?</Typography>
                </DialogContent>
                <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, attachment: null, loading: false })} disabled={deleteConfirm.loading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button>
                    <LoadingButton onClick={() => handleDelete(deleteConfirm.attachment)} loading={deleteConfirm.loading} loadingPosition="start" startIcon={<DeleteIcon style={{ fontSize: 15 }} />} variant="contained"
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #991b1b, #ef4444)", "&:hover": { background: "linear-gradient(135deg, #7f1d1d, #dc2626)" }, "&.Mui-disabled": { opacity: 0.6 } }}>
                        Supprimer
                    </LoadingButton>
                </DialogActions>
            </Dialog>
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