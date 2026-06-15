import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import ReactDatatable from "@ashvin27/react-datatable";
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { v4 as uuidv4 } from "uuid";
import { loadItemFromLocalStorage, loadItemFromSessionStorage, today } from "../../Utils/utils";
import { MAX_SUBJECT_DURATION } from "../../Utils/globals";
import { connect } from "react-redux";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/NotificationsApi";
import { PictureAsPdf, GridOn } from "@mui/icons-material";
import { handlePrint } from "../../Utils/tables";
import { table2XLSX } from "../../Utils/tabletoexcel";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { emailsChanged, emailsLibelleChanged, etat2Changed, etat3Changed, etatChanged, idChanged, items2Changed, itemsChanged, notificationErrors, roleChanged, roleLibelleChanged } from "../../redux/actions/Configurations/NotificationsActions";
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { KTApp } from "../../Utils/blockui";
import { Tooltip, IconButton, Box, Typography, Chip, Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ConfigKPIBar from "../../components/shared/ConfigKPIBar";
import ConfigTable from "../../components/shared/ConfigTable";
import ConfigCardView from "../../components/shared/ConfigCardView";
import AddDuplicateFormModal from "../../components/shared/AddDuplicateFormModal";
import AssignmentIcon from "@mui/icons-material/Assignment";

import ViewModeToggle from "../../components/shared/ViewModeToggle";
import AddIcon from "@mui/icons-material/Add";

const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" };

const styles = {
    control: (base, state) => ({
        ...base,
        minHeight: 40,
        borderRadius: 9,
        borderColor: state.isFocused ? "#3b3fd8" : "#e2e8f0",
        borderWidth: 1.5,
        boxShadow: "none",
        "&:hover": { borderColor: state.isFocused ? "#3b3fd8" : "#e2e8f0" },
    }),
    valueContainer: base => ({ ...base, padding: "2px 14px" }),
    placeholder: base => ({ ...base, fontSize: 14, color: "#94a3b8" }),
    singleValue: base => ({ ...base, fontSize: 14, color: "#1e293b" }),
    input: base => ({ ...base, margin: 0, padding: 0 }),
    indicatorSeparator: () => ({ display: "none" }),
    menu: provided => ({ ...provided, zIndex: 9999 }),
};
const Notifications = (props) => {
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

    const KPI_CONFIG = [{ key: "total", label: "Destinataires notifs", icon: AssignmentIcon, iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true }];
    const ROLES_CONFIG = [
        { value: "ALL", label: "Tous", filter: () => true },
        { value: "DE",          label: "Directeur Exécutif",   filter: (i) => i.titre === "DE" || i.titre === "Directeur Exécutif" },
        { value: "PILOTE",      label: "Pilote",               filter: (i) => i.titre === "PILOTE" || i.titre === "Pilote" },
        { value: "COORDONNATEUR", label: "Coordonnateur",     filter: (i) => i.titre === "COORDONNATEUR" },
        { value: "RA",          label: "Responsable Agence",   filter: (i) => i.titre === "RA" },
        { value: "AUTRES",      label: "Autres",               filter: (i) => i.titre === "AUTRES" },
    ];
    const [removeConfirm, setRemoveConfirm] = useState({ open: false, id: null, loading: false });
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [viewMode, setViewMode] = useState("list");
    const pdfColumns = [
        { key: "firstAndLastName", text: "Nom et Prénoms", align: "left", sortable: true },
        { key: "email",            text: "Email",          align: "left", sortable: true },
        { key: "titre",            text: "Titre",          align: "left", sortable: true },
    ];
    const pdfConfig = {
        page_size: 15, filename: "Notifications",
        language: { length_menu: "Afficher _MENU_ éléments", filter: "Rechercher...", info: "...", zero_records: "Aucun élément", no_data_text: "Aucun élément", loading_text: "Chargement...",
            pagination: { first: <FirstPageIcon />, previous: <ChevronLeftIcon />, next: <ChevronRightIcon />, last: <LastPageIcon /> } }
    };
    const [activeRole, setActiveRole] = useState("ALL");
    const filteredItems = useMemo(() => {
        const r = ROLES_CONFIG.find(c => c.value === activeRole);
        return r ? props.items.filter(r.filter) : props.items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.items, activeRole]);


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
                let iconeElt = <div style={{ cursor: "pointer" }} onClick={(e) => handleModal(e, user.id)} className="card-content red-text"><PersonRemoveIcon /></div>
                return iconeElt
            },
        }


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
            { "label": "Directeur Exécutif", "value": "DE" },
            { "label": "Pilote", "value": "PILOTE" },
            { "label": "Coordonnateur", "value": "COORDONNATEUR" },
            { "label": "Responsable d'Agence", "value": "RA" },
            { "label": "Autres", "value": "AUTRES" },
        ]

    } else {
        roleOptions = ""
    }



    function clearComponentState() {
        props.idChanged("")
        props.emailsChanged("")
        props.emailsLibelleChanged("")
        props.roleChanged("")
        props.notificationErrors({})
        // props.selectedItemChanged({})

    }

    const addFields = [
        {
            key: "emails", label: "Utilisateur", required: true, fullWidth: true,
            render: (value, onChange) => (
                <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={styles}
                    placeholder="Qui sont ceux qui doivent recevoir des notifications ?"
                    options={agentMailOptions}
                    value={agentMailOptions.find(o => o.value === value) || null}
                    onChange={(opt) => onChange(opt ? opt.value : "")}
                />
            ),
        },
        {
            key: "role", label: "Rôle", required: true, fullWidth: true,
            render: (value, onChange) => (
                <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={styles}
                    placeholder="Sélectionnez le rôle"
                    options={roleOptions || []}
                    value={(roleOptions || []).find(o => o.value === value) || null}
                    onChange={(opt) => onChange(opt ? opt.value : "")}
                />
            ),
        },
    ];
    const handleModalSubmit = async (items) => {
        setAddLoading(true);
        try {
            for (const item of items) {
                props.etatChanged(true);
                await ajout({ ids: item.emails, poste: item.role }, props);
            }
        } finally {
            setAddLoading(false);
            setAddModalOpen(false);
            clearComponentState();
        }
    };

    const handleModal = (e, id) => {
        e.preventDefault()
        setRemoveConfirm({ open: true, id, loading: false });
    }

    const handleDelete = (id) => {
        setRemoveConfirm(p => ({ ...p, loading: true }));
        props.etat3Changed(true)
        suppression(props, id).then(() => {
            clearComponentState();
            setRemoveConfirm({ open: false, id: null, loading: false });
        }).finally(() => { props.etat3Changed(false); })
    }
    const rowClickedHandler = (event, data, rowIndex) => {
        // console.log(data)
        props.idChanged(data.id ? data.id : "")
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
                <AddDuplicateFormModal
                    open={addModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    title="Ajouter des destinataires de notifications"
                    fields={addFields}
                    onSubmit={handleModalSubmit}
                    loading={addLoading}
                    maxWidth="md"
                    addLabel="Ajouter un autre destinataire"
                />

                <ConfigKPIBar items={props.items} kpis={KPI_CONFIG} />
                <Box sx={{ display: "flex", gap: 1, mb: 2.5, alignItems: "center", flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", gap: 1, flex: 1, flexWrap: "wrap" }}>
                        {ROLES_CONFIG.map(r => (<Chip key={r.value} label={r.label} onClick={() => setActiveRole(r.value)} color={activeRole === r.value ? "primary" : "default"} variant={activeRole === r.value ? "filled" : "outlined"} size="small" sx={{ borderRadius: "8px", fontWeight: activeRole === r.value ? 700 : 400 }} />))}
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        <ViewModeToggle value={viewMode} onChange={setViewMode} />
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, gap: 1, flexWrap: "wrap" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Liste des utilisateurs qui peuvent recevoir des mails</Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Tooltip title="Exporter en PDF"><IconButton onClick={() => handlePrint(pdfConfig, pdfColumns, filteredItems, 0)} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#ef4444", "&:hover": { background: "#fee2e2" } }} size="small"><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Exporter en Excel"><IconButton onClick={() => table2XLSX("Notifications_" + today().replaceAll("/", ""), "app-notification")} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#16a34a", "&:hover": { background: "#dcfce7" } }} size="small"><GridOn fontSize="small" /></IconButton></Tooltip>
                        <LoadingButton onClick={() => setAddModalOpen(true)} variant="contained" startIcon={<AddIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, fontSize: "0.82rem", px: 2.5, whiteSpace: "nowrap" }}>Ajouter</LoadingButton>
                    </Box>
                </Box>
                {viewMode === "list" ? (
                    <ConfigTable items={filteredItems}
                        exportClassName="app-notification"
                        columns={[
                            { id: "firstAndLastName", label: "Nom et Prénoms", sortable: true,  minWidth: 180 },
                            { id: "email",            label: "Email",          sortable: true,  minWidth: 180 },
                            { id: "titre",            label: "Titre",          sortable: true,  minWidth: 130 },
                            { id: "actions",          label: "Action",         sortable: false, minWidth: 80,  render: (user) => (<Tooltip title="Retirer"><IconButton onClick={(e) => handleModal(e, user.id)} color="error"><PersonRemoveIcon /></IconButton></Tooltip>) },
                        ]}
                        searchFields={["firstAndLastName", "email", "titre"]} defaultSort="firstAndLastName" />
                ) : (
                    <ConfigCardView items={filteredItems} titleField="firstAndLastName" subtitleField="email" badgeField="titre"
                        searchFields={["firstAndLastName", "email", "titre"]}
                        onDelete={(user) => setRemoveConfirm({ open: true, id: user.id, loading: false })} />
                )}

            </div>

            <Dialog open={removeConfirm.open} onClose={() => { if (!removeConfirm.loading) setRemoveConfirm({ open: false, id: null, loading: false }); }} fullWidth maxWidth="xs" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                <div style={{ background: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><PersonRemoveIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Retirer le destinataire</div>
                    </div>
                    <IconButton onClick={() => setRemoveConfirm({ open: false, id: null, loading: false })} disabled={removeConfirm.loading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                </div>
                <DialogContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: 14, color: "#475569" }}>Confirmez-vous la suppression de cet élément ?</Typography>
                </DialogContent>
                <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                    <Button onClick={() => setRemoveConfirm({ open: false, id: null, loading: false })} disabled={removeConfirm.loading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button>
                    <LoadingButton onClick={() => handleDelete(removeConfirm.id)} loading={removeConfirm.loading} loadingPosition="start" startIcon={<PersonRemoveIcon style={{ fontSize: 15 }} />} variant="contained"
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #991b1b, #ef4444)", "&:hover": { background: "linear-gradient(135deg, #7f1d1d, #dc2626)" }, "&.Mui-disabled": { opacity: 0.6 } }}>
                        Retirer
                    </LoadingButton>
                </DialogActions>
            </Dialog>
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