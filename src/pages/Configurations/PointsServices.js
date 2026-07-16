import React, { useEffect, useRef, useState, useMemo } from "react";
import Select from "react-select";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ReactDatatable from "@ashvin27/react-datatable";
import EditIcon from "@mui/icons-material/Edit";
import { Tooltip, IconButton, Box, Typography, MenuItem, FormControl, Select as MuiSelect, InputLabel, Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import {
    descriptionChanged,
    idChanged,
    itemsChanged,
    psErrors,
    typeChanged,
    libelleChanged, selectedItemChanged, etatChanged, etat2Changed, etat3Changed,
    unitLibelleChanged,
    unitChanged
} from "../../redux/actions/Configurations/PointsServicesActions";
import { connect } from "react-redux";
import excel from '../../assets/images/excel.svg'
import pdf from '../../assets/images/pdf.svg'
import { groupBy, loadItemFromLocalStorage, loadItemFromSessionStorage, today } from "../../Utils/utils";
import { ajout, all, disabled, modification, suppression } from "../../apis/Configurations/PointsServicesApi";
import { handlePrint } from "../../Utils/tables";
import { table2XLSX } from "../../Utils/tabletoexcel";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { LoadingButton } from "@mui/lab";
import BlockButton from "../../components/shared/BlockButton";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { Block, BlockOutlined, PersonOff, TaskAlt, PictureAsPdf, GridOn } from "@mui/icons-material";
import { notify } from "../../Utils/alert";
import { Chip } from "@mui/material";
import { KTApp } from "../../Utils/blockui";
import ConfigKPIBar from "../../components/shared/ConfigKPIBar";
import ConfigTable from "../../components/shared/ConfigTable";
import ConfigCardView from "../../components/shared/ConfigCardView";
import AddDuplicateFormModal from "../../components/shared/AddDuplicateFormModal";
import ViewModeToggle from "../../components/shared/ViewModeToggle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessIcon from "@mui/icons-material/Business";
import StoreIcon from "@mui/icons-material/Store";
import AddIcon from "@mui/icons-material/Add";
const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({ ...provided, zIndex: 9999 })
};
const PointsServices = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editForm, setEditForm] = useState({ libelle: "", description: "", type: "", direction_id: "" });
    const [editErrors, setEditErrors] = useState({});

    // Modals de confirmation
    const [disableConfirm, setDisableConfirm] = useState({ open: false, id: null, isDisabled: true, loading: false });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, sp: null, loading: false });

    useEffect(() => {
        KTApp.blockPage({
            overlayColor: "#000000",
            type: "v2",
            state: "danger",
            message: "En cours de chargement...",
        });
        setIsLoading(true);
        all(props).then((r) => { }).finally(() => {
            setIsLoading(false);
            KTApp.unblockPage();
        });

        window.$('.tooltipped').tooltip();
        //cleanup
        return clearComponentState();
    }, []);

    const topRef = useRef(null);

    // ── Vue mode ──────────────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState("list");
    const [activeChip, setActiveChip] = useState("ALL");

    const KPI_CONFIG = [
        { key: "total",      label: "Total",              icon: AssignmentIcon, iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true },
        { key: "directions", label: "Directions",         icon: BusinessIcon,   iconBg: "#EDE9FE", iconColor: "#6D28D9", borderColor: "#8B5CF6", filter: (i) => i.type === "DIRECTION" && !i.deleted },
        { key: "agences",    label: "Agences & Guichets", icon: StoreIcon,      iconBg: "#D1FAE5", iconColor: "#065F46", borderColor: "#10B981", filter: (i) => ["AGENCE","GUICHET"].includes(i.type) && !i.deleted },
        { key: "inactifs",   label: "Désactivés",         icon: Block,          iconBg: "#FEE2E2", iconColor: "#B91C1C", borderColor: "#EF4444", filter: (i) => i.deleted },
    ];

    const CHIPS_CONFIG = [
        { value: "ALL",       label: "Tous",       filter: () => true },
        { value: "DIRECTION", label: "Directions", filter: (i) => i.type === "DIRECTION" },
        { value: "AGENCE",    label: "Agences",    filter: (i) => i.type === "AGENCE" },
        { value: "GUICHET",   label: "Guichets",   filter: (i) => i.type === "GUICHET" },
        { value: "DISABLED",  label: "Désactivés", filter: (i) => i.deleted },
    ];

    const filteredItems = useMemo(() => {
        const chip = CHIPS_CONFIG.find(c => c.value === activeChip);
        const base = chip ? props.items.filter(chip.filter) : props.items;
        return [...base].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.items, activeChip]);

    let units = [];

    try {
        const stored = JSON.parse(loadItemFromLocalStorage('app-ps'));

        // on force un tableau
        if (Array.isArray(stored)) {
            units = stored;
        } else if (stored?.data && Array.isArray(stored.data)) {
            units = stored.data;
        } else {
            units = [];
        }
    } catch (e) {
        units = [];
    }

    const directionsMap = {};

    units.forEach(u => {
        if (u.type === "DIRECTION") {
            directionsMap[u.id] = u.libelle;
        }
    });


    let columns = [
        {
            key: "uuid",
            text: "Uuid",
            className: "description",
            align: "left",
            sortable: true,
            cell: (sp) => {
                let uuid = sp.uuid;
                if (sp.deleted)
                    return <div style={{ display: "flex", alignItems: "center" }}><Block color="darkred" fontSize="10px" /><i style={{ color: "lightgray" }}>{uuid}</i></div>
                return uuid;
            },
        },
        {
            key: "libelle",
            text: "Intitulé",
            className: "name",
            align: "left",
            sortable: true,
            cell: (sp) => {
                let libelle = sp.libelle;
                if (sp.deleted)
                    return <div style={{ display: "flex", alignItems: "center" }}><i style={{ color: "lightgray" }}>{libelle}</i></div>
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
            key: "direction_id",
            text: "Lié à",
            className: "name",
            align: "left",
            sortable: true,
            cell: (sp) => {
                const libelle = directionsMap[sp.direction_id] ?? "-";

                return sp.deleted
                    ? <i style={{ color: "lightgray" }}>{libelle}</i>
                    : libelle;
            },
        },

        {
            key: "action",
            text: "Actions",
            className: "action",
            align: "left",
            sortable: true,
            cell: (sp) => {
                if (sp.deleted) {
                    return (
                        <>
                            <div style={{ display: "flex", gap: "5px" }}>
                                <Tooltip title="Activer">
                                    <IconButton onClick={(e) => { e.stopPropagation(); handleDisabledModal(e, sp.id, false); }} color="default"><TaskAlt sx={{ color: 'black' }} /></IconButton>
                                </Tooltip>
                                <Tooltip title="Modifier">
                                    <IconButton onClick={handleEditClick(sp)} color="primary"><EditIcon /></IconButton>
                                </Tooltip>
                                <Tooltip title="Supprimer">
                                    <IconButton onClick={(e) => handleModal(e, sp)} color="error"><DeleteIcon /></IconButton>
                                </Tooltip>
                            </div>
                        </>
                    )
                } else {
                    return (
                        <>
                            <div style={{ display: "flex", gap: "5px" }}>
                                <Tooltip title="Desactiver">
                                    <IconButton onClick={(e) => handleDisabledModal(e, sp.id)} color="default"><Block /></IconButton>
                                </Tooltip>
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


    let unitOptions
    let directionOptions
    let unitsGroupByType = (units !== undefined) ? groupBy(units, "type") : undefined;
    //
    if (unitsGroupByType !== undefined && unitsGroupByType["DIRECTION"] !== undefined) {
        directionOptions = unitsGroupByType["DIRECTION"].map(direction => {
            return { "label": direction.libelle, "value": direction.id }
        })
    } else {
        directionOptions = ""
    }

    unitOptions = []
    if (directionOptions !== "") { unitOptions.push({ "label": "Direction", "options": directionOptions }) }

    // //

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

    const handleChange1 = (obj) => {
        // console.log(obj)
        props.unitChanged(obj.value)
        props.unitLibelleChanged(obj.label)

        // console.log(props.unit)
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
        props.unitChanged("")
        props.descriptionChanged("")
        props.selectedItemChanged({})
    }
    const handleDisabledModal = (e, spId, isDisabled = true) => {
        e.stopPropagation();
        setDisableConfirm({ open: true, id: spId, isDisabled, loading: false });
    }
    const handleModal = (e, sp) => {
        e.preventDefault();
        setDeleteConfirm({ open: true, sp, loading: false });
    }
    const handleDelete = () => {
        const sp = deleteConfirm.sp;
        if (!sp) return;
        setDeleteConfirm(p => ({ ...p, loading: true }));
        props.etat3Changed(true);
        suppression(props, sp).then(() => {
            clearComponentState();
            setDeleteConfirm({ open: false, sp: null, loading: false });
        }).finally(() => {
            props.etat3Changed(false);
        });
    }
    const handleDisable = (id, isDisabled = true) => {
        setDisableConfirm(p => ({ ...p, loading: true }));
        disabled(props, id, isDisabled)
            .then(() => {
                notify(`Bravo - Le point de service a été ${isDisabled ? "désactivé" : "activé"} avec succès`, "success");
                all(props).then(() => {});
                clearComponentState();
                setDisableConfirm({ open: false, id: null, isDisabled: true, loading: false });
            })
            .catch(() => {
                notify(`Erreur - Le point de service n'a pas été ${isDisabled ? "désactivé" : "activé"}`, "error");
                setDisableConfirm(p => ({ ...p, loading: false }));
            });
    }
    const handleModalSubmit = async (items) => {
        setAddLoading(true);
        try {
            for (const item of items) {
                const payload = {
                    type: item.type,
                    libelle: item.libelle,
                    description: item.description,
                    direction_id: item.direction_id || "",
                };
                await ajout(payload, props);
            }
        } finally {
            setAddLoading(false);
            setAddModalOpen(false);
        }
    };

    const handleEditClick = (sp) => (e) => {
        rowClickedHandler(e, sp, null);
        setEditForm({
            libelle: sp.libelle || "",
            description: sp.description || "",
            type: sp.type || "",
            direction_id: sp.direction_id || "",
        });
        setEditErrors({});
        setEditModalOpen(true);
    }

    const handleEditFormSubmit = () => {
        const errs = {};
        if (!editForm.libelle.trim()) errs.libelle = "Champ requis";
        if (!editForm.type.trim()) errs.type = "Champ requis";
        if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }

        const item = {
            id: props.id,
            libelle: editForm.libelle,
            type: editForm.type,
            description: editForm.description,
            direction_id: editForm.direction_id || "",
        };
        setEditLoading(true);
        props.etat2Changed(true);
        modification(item, props)
            .then(() => {
                setEditModalOpen(false);
                clearComponentState();
            })
            .finally(() => {
                setEditLoading(false);
                props.etat2Changed(false);
            });
    }

    const rowClickedHandler = (event, data, rowIndex) => {
        props.idChanged(data.id ? data.id : "")
        props.typeChanged(data.type ? data.type : "")
        props.libelleChanged(data.libelle ? data.libelle : "")
        props.typeChanged(data.type ? data.type : "")
        props.descriptionChanged(data.description ? data.description : "")
        props.selectedItemChanged(data ? data : {})
        if (data.direction_id) {
            props.unitChanged(data.direction_id);
            props.unitLibelleChanged(directionsMap[data.direction_id] ?? "");
        } else {
            props.unitChanged("");
            props.unitLibelleChanged("");
        }
    }
    const tableChangeHandler = data => {
    }

    const addFields = [
        {
            key: "libelle", label: "Intitulé", required: true, fullWidth: false,
            placeholder: "Ex: Agence de Tokoin",
        },
        {
            key: "description", label: "Description", type: "textarea", fullWidth: true,
            placeholder: "Description du point de service",
        },
        {
            key: "type", label: "Type", required: true, fullWidth: false,
            render: (value, onChange) => (
                <FormControl fullWidth size="small">
                    <MuiSelect
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        displayEmpty
                        sx={{
                            borderRadius: "9px", fontSize: 14, height: 40,
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94a3b8" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b3fd8", borderWidth: 1.5 },
                        }}
                    >
                        <MenuItem value="" disabled sx={{ fontSize: 13, color: "#94a3b8" }}>Sélectionner le type</MenuItem>
                        <MenuItem value="DIRECTION" sx={{ fontSize: 13 }}>Direction</MenuItem>
                        <MenuItem value="AGENCE"    sx={{ fontSize: 13 }}>Agence</MenuItem>
                        <MenuItem value="GUICHET"   sx={{ fontSize: 13 }}>Guichet</MenuItem>
                    </MuiSelect>
                </FormControl>
            ),
        },
        {
            key: "direction_id", label: "Lier à une direction", fullWidth: false,
            render: (value, onChange) => (
                <FormControl fullWidth size="small">
                    <MuiSelect
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        displayEmpty
                        sx={{
                            borderRadius: "9px", fontSize: 14, height: 40,
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94a3b8" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b3fd8", borderWidth: 1.5 },
                        }}
                    >
                        <MenuItem value="" sx={{ fontSize: 13, color: "#94a3b8" }}>Sélectionner une direction</MenuItem>
                        {(directionOptions || []).map((opt) => (
                            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>{opt.label}</MenuItem>
                        ))}
                    </MuiSelect>
                </FormControl>
            ),
        },
    ];

    return (
        <>
            <div className="card-panel" ref={topRef}>

                {/* ── Modal modification ── */}
                <Dialog
                    open={editModalOpen}
                    onClose={() => { if (!editLoading) { setEditModalOpen(false); clearComponentState(); } }}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}
                >
                    {/* Header */}
                    <div style={{
                        background: "linear-gradient(135deg, #1e2188 0%, #3b3fd8 100%)",
                        padding: "18px 24px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 9,
                                background: "rgba(255,255,255,0.15)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <EditIcon style={{ color: "#fff", fontSize: 20 }} />
                            </div>
                            <div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Modifier le point de service</div>
                                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 2 }}>
                                    {editForm.libelle}
                                </div>
                            </div>
                        </div>
                        <IconButton
                            onClick={() => { if (!editLoading) { setEditModalOpen(false); clearComponentState(); } }}
                            disabled={editLoading} size="small"
                            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}
                        >
                            <CloseIcon style={{ fontSize: 16 }} />
                        </IconButton>
                    </div>

                    {/* Contenu */}
                    <DialogContent sx={{ p: 3 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>

                            {/* Intitulé */}
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                                    Intitulé <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    value={editForm.libelle}
                                    onChange={(e) => { setEditForm(p => ({ ...p, libelle: e.target.value })); setEditErrors(p => ({ ...p, libelle: "" })); }}
                                    placeholder="Ex: Agence de Tokoin"
                                    style={{
                                        width: "100%", boxSizing: "border-box",
                                        border: editErrors.libelle ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                                        borderRadius: 9, padding: "10.5px 14px",
                                        fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", height: 40,
                                    }}
                                    onFocus={(e) => { if (!editErrors.libelle) e.target.style.borderColor = "#3b3fd8"; }}
                                    onBlur={(e) => { if (!editErrors.libelle) e.target.style.borderColor = "#e2e8f0"; }}
                                />
                                {editErrors.libelle && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.libelle}</div>}
                            </div>

                            {/* Description */}
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                                    Description
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Description du point de service"
                                    rows={3}
                                    style={{
                                        width: "100%", boxSizing: "border-box", resize: "vertical",
                                        border: "1.5px solid #e2e8f0",
                                        borderRadius: 9, padding: "9px 12px",
                                        fontSize: 13, outline: "none", background: "#fff", color: "#1e293b",
                                        whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit",
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = "#3b3fd8"; }}
                                    onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                                    Type <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <FormControl fullWidth size="small">
                                    <MuiSelect
                                        value={editForm.type || ""}
                                        onChange={(e) => { setEditForm(p => ({ ...p, type: e.target.value })); setEditErrors(p => ({ ...p, type: "" })); }}
                                        displayEmpty
                                        sx={{
                                            borderRadius: "9px", fontSize: 14, height: 40,
                                            "& .MuiOutlinedInput-notchedOutline": { borderColor: editErrors.type ? "#ef4444" : "#e2e8f0" },
                                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94a3b8" },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b3fd8", borderWidth: 1.5 },
                                        }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: 13, color: "#94a3b8" }}>Sélectionner le type</MenuItem>
                                        <MenuItem value="DIRECTION" sx={{ fontSize: 13 }}>Direction</MenuItem>
                                        <MenuItem value="AGENCE"    sx={{ fontSize: 13 }}>Agence</MenuItem>
                                        <MenuItem value="GUICHET"   sx={{ fontSize: 13 }}>Guichet</MenuItem>
                                    </MuiSelect>
                                </FormControl>
                                {editErrors.type && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.type}</div>}
                            </div>

                            {/* Direction */}
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                                    Lier à une direction
                                </label>
                                <FormControl fullWidth size="small">
                                    <MuiSelect
                                        value={editForm.direction_id || ""}
                                        onChange={(e) => setEditForm(p => ({ ...p, direction_id: e.target.value }))}
                                        displayEmpty
                                        sx={{
                                            borderRadius: "9px", fontSize: 14, height: 40,
                                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94a3b8" },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b3fd8", borderWidth: 1.5 },
                                        }}
                                    >
                                        <MenuItem value="" sx={{ fontSize: 13, color: "#94a3b8" }}>Sélectionner une direction</MenuItem>
                                        {(directionOptions || []).map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>{opt.label}</MenuItem>
                                        ))}
                                    </MuiSelect>
                                </FormControl>
                            </div>

                        </div>
                    </DialogContent>

                    {/* Footer */}
                    <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                        <BlockButton disabled={editLoading}><Button
                            onClick={() => { setEditModalOpen(false); clearComponentState(); }}
                            disabled={editLoading}
                            variant="outlined"
                            sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}
                        >
                            Annuler
                        </Button></BlockButton>
                        <BlockButton disabled={editLoading}><LoadingButton
                            onClick={handleEditFormSubmit}
                            loading={editLoading}
                            loadingPosition="start"
                            startIcon={<SaveIcon style={{ fontSize: 15 }} />}
                            variant="contained"
                            sx={{
                                textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3,
                                background: "linear-gradient(135deg, #1e2188, #3b3fd8)",
                                "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" },
                                "&.Mui-disabled": { opacity: 0.6 },
                            }}
                        >
                            Modifier
                        </LoadingButton></BlockButton>
                    </DialogActions>
                </Dialog>

                {/* ── Modal confirmation désactivation/activation ── */}
                <Dialog
                    open={disableConfirm.open}
                    onClose={() => { if (!disableConfirm.loading) setDisableConfirm({ open: false, id: null, isDisabled: true, loading: false }); }}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}
                >
                    <div style={{
                        background: disableConfirm.isDisabled
                            ? "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)"
                            : "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
                        padding: "18px 24px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {disableConfirm.isDisabled
                                    ? <Block style={{ color: "#fff", fontSize: 20 }} />
                                    : <TaskAlt style={{ color: "#fff", fontSize: 20 }} />}
                            </div>
                            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                                {disableConfirm.isDisabled ? "Désactiver le point de service" : "Activer le point de service"}
                            </div>
                        </div>
                        <IconButton
                            onClick={() => setDisableConfirm({ open: false, id: null, isDisabled: true, loading: false })}
                            disabled={disableConfirm.loading} size="small"
                            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}
                        >
                            <CloseIcon style={{ fontSize: 16 }} />
                        </IconButton>
                    </div>
                    <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                            {disableConfirm.isDisabled
                                ? "Voulez-vous vraiment désactiver ce point de service ? Il ne sera plus accessible dans l'application."
                                : "Voulez-vous vraiment activer ce point de service ?"}
                        </p>
                    </DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", gap: 10 }}>
                        <BlockButton disabled={disableConfirm.loading}><Button
                            onClick={() => setDisableConfirm({ open: false, id: null, isDisabled: true, loading: false })}
                            disabled={disableConfirm.loading}
                            variant="outlined"
                            sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}
                        >
                            Annuler
                        </Button></BlockButton>
                        <BlockButton disabled={disableConfirm.loading}><LoadingButton
                            onClick={() => handleDisable(disableConfirm.id, disableConfirm.isDisabled)}
                            loading={disableConfirm.loading}
                            loadingPosition="start"
                            startIcon={disableConfirm.isDisabled ? <Block style={{ fontSize: 15 }} /> : <TaskAlt style={{ fontSize: 15 }} />}
                            variant="contained"
                            sx={{
                                textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3,
                                background: disableConfirm.isDisabled
                                    ? "linear-gradient(135deg, #b45309, #f59e0b)"
                                    : "linear-gradient(135deg, #065f46, #10b981)",
                                "&:hover": { opacity: 0.9 },
                                "&.Mui-disabled": { opacity: 0.6 },
                            }}
                        >
                            {disableConfirm.isDisabled ? "Désactiver" : "Activer"}
                        </LoadingButton></BlockButton>
                    </DialogActions>
                </Dialog>

                {/* ── Modal confirmation suppression ── */}
                <Dialog
                    open={deleteConfirm.open}
                    onClose={() => { if (!deleteConfirm.loading) setDeleteConfirm({ open: false, sp: null, loading: false }); }}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}
                >
                    <div style={{
                        background: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)",
                        padding: "18px 24px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <DeleteIcon style={{ color: "#fff", fontSize: 20 }} />
                            </div>
                            <div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Supprimer le point de service</div>
                                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>
                                    {deleteConfirm.sp?.libelle}
                                </div>
                            </div>
                        </div>
                        <IconButton
                            onClick={() => setDeleteConfirm({ open: false, sp: null, loading: false })}
                            disabled={deleteConfirm.loading} size="small"
                            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}
                        >
                            <CloseIcon style={{ fontSize: 16 }} />
                        </IconButton>
                    </div>
                    <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                            Confirmez-vous la suppression de <strong style={{ color: "#0f172a" }}>{deleteConfirm.sp?.libelle}</strong> ?
                            Cette action est irréversible.
                        </p>
                    </DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", gap: 10 }}>
                        <BlockButton disabled={deleteConfirm.loading}><Button
                            onClick={() => setDeleteConfirm({ open: false, sp: null, loading: false })}
                            disabled={deleteConfirm.loading}
                            variant="outlined"
                            sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}
                        >
                            Annuler
                        </Button></BlockButton>
                        <BlockButton disabled={deleteConfirm.loading}><LoadingButton
                            onClick={handleDelete}
                            loading={deleteConfirm.loading}
                            loadingPosition="start"
                            startIcon={<DeleteIcon style={{ fontSize: 15 }} />}
                            variant="contained"
                            sx={{
                                textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3,
                                background: "linear-gradient(135deg, #991b1b, #ef4444)",
                                "&:hover": { background: "linear-gradient(135deg, #7f1d1d, #dc2626)" },
                                "&.Mui-disabled": { opacity: 0.6 },
                            }}
                        >
                            Supprimer
                        </LoadingButton></BlockButton>
                    </DialogActions>
                </Dialog>

                {/* ── Modal ajout multiple (duplication) ── */}
                <AddDuplicateFormModal
                    open={addModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    title="Ajouter des points de service"
                    fields={addFields}
                    onSubmit={handleModalSubmit}
                    loading={addLoading}
                    maxWidth="md"
                    addLabel="Ajouter un autre point de service"
                />

                {/* ── KPI Bar ── */}
                <ConfigKPIBar items={props.items} kpis={KPI_CONFIG} />

                {/* ── Chips + Switch vue ── */}
                <Box sx={{ display: "flex", gap: 1, mb: 2.5, alignItems: "center", flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flex: 1 }}>
                        {CHIPS_CONFIG.map(chip => (
                            <Chip
                                key={chip.value}
                                label={chip.label}
                                onClick={() => setActiveChip(chip.value)}
                                color={activeChip === chip.value ? "primary" : "default"}
                                variant={activeChip === chip.value ? "filled" : "outlined"}
                                size="small"
                                sx={{ borderRadius: "8px", fontWeight: activeChip === chip.value ? 700 : 400, fontSize: "0.78rem" }}
                            />
                        ))}
                    </Box>
                    <ViewModeToggle value={viewMode} onChange={setViewMode} />
                </Box>

                {/* ── En-tête ── */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "nowrap", gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A", flexShrink: 0 }}>
                        Liste des points de services
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                        <Tooltip title="Exporter en PDF">
                            <IconButton
                                onClick={(e) => {
                                    const printableItems = props.items.map(item => ({ ...item, direction_id: directionsMap[item.direction_id] ?? "-" }));
                                    handlePrint(config, columns, printableItems, 0, ["Actions"]);
                                }}
                                sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#ef4444", "&:hover": { background: "#fee2e2", borderColor: "#fca5a5" } }}
                                size="small"
                            >
                                <PictureAsPdf fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Exporter en Excel">
                            <IconButton
                                onClick={() => table2XLSX("Liste_des_unités_opérationnelles" + today().replaceAll("/", ""), "app-ps")}
                                sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#16a34a", "&:hover": { background: "#dcfce7", borderColor: "#86efac" } }}
                                size="small"
                            >
                                <GridOn fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <LoadingButton
                            onClick={() => setAddModalOpen(true)}
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                textTransform: "none", borderRadius: 2, fontWeight: 700,
                                background: "linear-gradient(135deg, #1e2188, #3b3fd8)",
                                "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" },
                                fontSize: "0.82rem", px: 2.5, whiteSpace: "nowrap",
                            }}
                        >
                            Ajouter
                        </LoadingButton>
                    </Box>
                </Box>

                {/* ── Vue tableau / cartes ── */}
                {viewMode === "list" ? (
                    <ConfigTable
                        items={filteredItems}
                        exportClassName="app-ps"
                        columns={[
                            { id: "libelle",      label: "Intitulé",    sortable: true,  minWidth: 150, render: (sp) => sp.deleted ? <i style={{ color: "lightgray" }}>{sp.libelle}</i> : sp.libelle },
                            { id: "description",  label: "Description", sortable: true,  minWidth: 180, render: (sp) => sp.deleted ? <i style={{ color: "lightgray" }}>{sp.description}</i> : sp.description },
                            { id: "type",         label: "Type",        sortable: true,  minWidth: 110, render: (sp) => sp.deleted ? <i style={{ color: "lightgray" }}>{sp.type}</i> : sp.type },
                            { id: "direction_id", label: "Lié à",       sortable: false, minWidth: 140, render: (sp) => { const lib = directionsMap[sp.direction_id] ?? "-"; return sp.deleted ? <i style={{ color: "lightgray" }}>{lib}</i> : lib; } },
                            { id: "actions",      label: "Actions",     sortable: false, minWidth: 130, render: (sp) => sp.deleted ? (
                                <div style={{ display: "flex", gap: "5px" }}>
                                    <Tooltip title="Activer"><IconButton onClick={(e) => { e.stopPropagation(); handleDisabledModal(e, sp.id, false); }} color="default"><TaskAlt sx={{ color: 'black' }} /></IconButton></Tooltip>
                                    <Tooltip title="Modifier"><IconButton onClick={handleEditClick(sp)} color="primary"><EditIcon /></IconButton></Tooltip>
                                    <Tooltip title="Supprimer"><IconButton onClick={(e) => handleModal(e, sp)} color="error"><DeleteIcon /></IconButton></Tooltip>
                                </div>
                            ) : (
                                <div style={{ display: "flex", gap: "5px" }}>
                                    <Tooltip title="Desactiver"><IconButton onClick={(e) => handleDisabledModal(e, sp.id)} color="default"><Block /></IconButton></Tooltip>
                                    <Tooltip title="Modifier"><IconButton onClick={handleEditClick(sp)} color="primary"><EditIcon /></IconButton></Tooltip>
                                    <Tooltip title="Supprimer"><IconButton onClick={(e) => handleModal(e, sp)} color="error"><DeleteIcon /></IconButton></Tooltip>
                                </div>
                            )},
                        ]}
                        searchFields={["libelle", "description", "type"]}
                        filters={[{ id: "type", label: "Tous les types", options: [{ value: "DIRECTION", label: "Direction" }, { value: "AGENCE", label: "Agence" }, { value: "GUICHET", label: "Guichet" }], filterFn: (row, val) => row.type === val }]}
                        defaultSort="libelle"
                    />
                ) : (
                    <ConfigCardView
                        items={filteredItems}
                        titleField="libelle"
                        subtitleField="description"
                        badgeField="type"
                        badgeColorMap={{ DIRECTION: "#6D28D9", AGENCE: "#065F46", GUICHET: "#B45309" }}
                        searchFields={["libelle", "description", "type"]}
                        filters={[{ id: "type", label: "Tous les types", options: [{ value: "DIRECTION", label: "Direction" }, { value: "AGENCE", label: "Agence" }, { value: "GUICHET", label: "Guichet" }], filterFn: (row, val) => row.type === val }]}
                        onEdit={(sp) => handleEditClick(sp)({ preventDefault: () => {} })}
                        onDelete={(sp) => handleModal({ preventDefault: () => {} }, sp)}
                        extraFields={[{ label: "Lié à", render: (sp) => directionsMap[sp.direction_id] ?? "-" }]}
                    />
                )}

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
        unit: state.ps.unit,
        unitLibelle: state.ps.unitLibelle,
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
        unitChanged: (unit) => {
            dispatch(unitChanged(unit))
        },
        unitLibelleChanged: (unitLibelle) => {
            dispatch(unitLibelleChanged(unitLibelle))
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