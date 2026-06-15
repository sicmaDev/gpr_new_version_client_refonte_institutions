import React, { useEffect, useState, useMemo } from "react";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import {
    Tooltip, IconButton, Box, Typography, Dialog, DialogContent, DialogActions,
    Button, Chip, FormControl, Select as MuiSelect, MenuItem
} from "@mui/material";
import { PictureAsPdf, GridOn } from "@mui/icons-material";
import {
    descriptionChanged, itemsChanged, risqueLevelChanged,
    libelleChanged, selectedItemChanged, objetErrors, idChanged,
    processingTimeChanged, etat3Changed, etat2Changed, etatChanged,
    categorieChanged, categorieLibelleChanged
} from "../../redux/actions/Configurations/ObjetsActions";
import { loadItemFromLocalStorage, today } from "../../Utils/utils";
import { MAX_SUBJECT_DURATION } from "../../Utils/globals";
import { connect } from "react-redux";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/ObjetsApi";
import { handlePrint } from "../../Utils/tables";
import { table2XLSX } from "../../Utils/tabletoexcel";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { KTApp } from "../../Utils/blockui";
import ConfigKPIBar from "../../components/shared/ConfigKPIBar";
import ConfigTable from "../../components/shared/ConfigTable";
import ConfigCardView from "../../components/shared/ConfigCardView";
import AddDuplicateFormModal from "../../components/shared/AddDuplicateFormModal";

import ViewModeToggle from "../../components/shared/ViewModeToggle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const LEVEL_OPTIONS = [
    { label: "Mineur", value: "MINEUR" },
    { label: "Moyen",  value: "MOYEN"  },
    { label: "Grave",  value: "GRAVE"  },
];

const Objets = (props) => {
    let categories;
    try { categories = JSON.parse(loadItemFromLocalStorage('app-categories')); }
    catch (e) { categories = []; }
    const categorieOptions = (categories || []).map(c => ({ label: c.libelle, value: c.id }));

    const [isLoading, setIsLoading]         = useState(false);
    const [addModalOpen, setAddModalOpen]   = useState(false);
    const [addLoading, setAddLoading]       = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLoading, setEditLoading]     = useState(false);
    const [editForm, setEditForm]           = useState({ libelle: "", description: "", risqueLevel: "", categorie: "", categorieLibelle: "", processingTime: "" });
    const [editErrors, setEditErrors]       = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null, loading: false });
    const [viewMode, setViewMode]           = useState("list");
    const [activeChip, setActiveChip]       = useState("ALL");

    useEffect(() => {
        KTApp.blockPage({ overlayColor: "#000000", type: "v2", state: "danger", message: "En cours de chargement..." });
        setIsLoading(true);
        liste(props).then(() => {}).finally(() => { setIsLoading(false); KTApp.unblockPage(); });
        window.$('.tooltipped').tooltip();
        return clearComponentState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const KPI_CONFIG = [
        { key: "total",  label: "Total objets",  icon: AssignmentIcon,   iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true },
        { key: "grave",  label: "Risque Grave",  icon: ErrorOutlineIcon, iconBg: "#FEE2E2", iconColor: "#B91C1C", borderColor: "#EF4444", filter: (i) => i.risqueLevel === "GRAVE" },
        { key: "moyen",  label: "Risque Moyen",  icon: WarningAmberIcon, iconBg: "#FEF3C7", iconColor: "#B45309", borderColor: "#F59E0B", filter: (i) => i.risqueLevel === "MOYEN" },
        { key: "mineur", label: "Risque Mineur", icon: InfoOutlinedIcon, iconBg: "#D1FAE5", iconColor: "#065F46", borderColor: "#10B981", filter: (i) => i.risqueLevel === "MINEUR" },
    ];
    const CHIPS_CONFIG = [
        { value: "ALL",    label: "Tous",   filter: () => true },
        { value: "GRAVE",  label: "Grave",  filter: (i) => i.risqueLevel === "GRAVE" },
        { value: "MOYEN",  label: "Moyen",  filter: (i) => i.risqueLevel === "MOYEN" },
        { value: "MINEUR", label: "Mineur", filter: (i) => i.risqueLevel === "MINEUR" },
    ];
    const filteredItems = useMemo(() => {
        const chip = CHIPS_CONFIG.find(c => c.value === activeChip);
        return chip ? props.items.filter(chip.filter) : props.items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.items, activeChip]);

    const pdfColumns = [
        { key: "libelle", text: "Intitulé", align: "left", sortable: true },
        { key: "description", text: "Description", align: "left", sortable: true },
        { key: "categorie", text: "Catégorie", align: "left", sortable: true },
        { key: "risqueLevel", text: "Niveau", align: "left", sortable: true },
        { key: "processingTime", text: "Délai", align: "left", sortable: true },
    ];
    const pdfConfig = {
        page_size: 15, filename: "Objets",
        language: { length_menu: "Afficher _MENU_ éléments", filter: "Rechercher...", info: "...", zero_records: "Aucun élément", no_data_text: "Aucun élément", loading_text: "Chargement...",
            pagination: { first: <FirstPageIcon />, previous: <ChevronLeftIcon />, next: <ChevronRightIcon />, last: <LastPageIcon /> } }
    };

    function clearComponentState() {
        props.idChanged(""); props.libelleChanged(""); props.risqueLevelChanged(""); props.categorieChanged("");
        props.categorieLibelleChanged(""); props.descriptionChanged(""); props.processingTimeChanged("");
        props.objetErrors({}); props.selectedItemChanged({});
    }

    const addFields = [
        { key: "libelle", label: "Intitulé de l'objet", required: true, fullWidth: false, placeholder: "Ex: Rançonnement, Discrimination..." },
        { key: "description", label: "Description", type: "textarea", fullWidth: true, placeholder: "Description de l'objet" },
        {
            key: "risqueLevel", label: "Niveau de gravité", required: true, fullWidth: false,
            render: (value, onChange) => (
                <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                    <MuiSelect value={value || ""} onChange={(e) => onChange(e.target.value)} displayEmpty sx={{ borderRadius: 2, fontSize: 14 }}>
                        <MenuItem value=""><em style={{ color: "#94a3b8" }}>Sélectionner le niveau</em></MenuItem>
                        {LEVEL_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </MuiSelect>
                </FormControl>
            ),
        },
        {
            key: "categorie", label: "Catégorie", required: true, fullWidth: false,
            render: (value, onChange) => (
                <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                    <MuiSelect value={value || ""} onChange={(e) => { const opt = categorieOptions.find(c => c.value === e.target.value); onChange(e.target.value, opt?.label); }} displayEmpty sx={{ borderRadius: 2, fontSize: 14 }}>
                        <MenuItem value=""><em style={{ color: "#94a3b8" }}>Sélectionner la catégorie</em></MenuItem>
                        {categorieOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </MuiSelect>
                </FormControl>
            ),
        },
        {
            key: "processingTime", label: `Délai (jours, max ${MAX_SUBJECT_DURATION})`, required: true, fullWidth: false,
            render: (value, onChange) => (
                <input type="number" min={0} max={MAX_SUBJECT_DURATION} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Ex: 10"
                    style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "10.5px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", height: 40 }}
                    onFocus={(e) => { e.target.style.borderColor = "#3b3fd8"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
            ),
        },
    ];
    const handleModalSubmit = async (items) => {
        setAddLoading(true);
        try {
            for (const item of items) {
                await ajout({ libelle: item.libelle, description: item.description, risqueLevel: item.risqueLevel, categorie: item.categorie, processingTime: item.processingTime }, props);
            }
        } finally { setAddLoading(false); setAddModalOpen(false); }
    };

    const handleEditClick = (sp) => {
        props.idChanged(sp.id); props.selectedItemChanged(sp);
        setEditForm({
            libelle: sp.libelle || "", description: sp.description || "",
            risqueLevel: sp.risqueLevel || "", categorie: sp.categorie?.id || "",
            categorieLibelle: sp.categorie?.libelle || "", processingTime: sp.processingTime || "",
        });
        setEditErrors({}); setEditModalOpen(true);
    };
    const handleEditFormSubmit = () => {
        const errs = {};
        if (!editForm.libelle.trim()) errs.libelle = "Champ requis";
        if (!editForm.risqueLevel) errs.risqueLevel = "Champ requis";
        if (!editForm.categorie) errs.categorie = "Champ requis";
        if (!editForm.processingTime || Number(editForm.processingTime) > MAX_SUBJECT_DURATION) errs.processingTime = `Requis (max ${MAX_SUBJECT_DURATION})`;
        if (Object.keys(errs).length) { setEditErrors(errs); return; }
        setEditLoading(true); props.etat2Changed(true);
        modification({ id: props.id, libelle: editForm.libelle, description: editForm.description, risqueLevel: editForm.risqueLevel, categorie: editForm.categorie, processingTime: editForm.processingTime }, props)
            .then(() => { setEditModalOpen(false); clearComponentState(); })
            .finally(() => { setEditLoading(false); props.etat2Changed(false); });
    };
    const handleDelete = () => {
        const sp = deleteConfirm.item; if (!sp) return;
        setDeleteConfirm(p => ({ ...p, loading: true })); props.etat3Changed(true);
        suppression(props, sp).then(() => { clearComponentState(); setDeleteConfirm({ open: false, item: null, loading: false }); }).finally(() => { props.etat3Changed(false); });
    };

    const selectStyle = (hasErr) => ({ width: "100%", boxSizing: "border-box", border: hasErr ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "0 14px", fontSize: 14, background: "#fff", color: "#1e293b", height: 40 });

    return (
        <>
            <div className="card-panel">
                <AddDuplicateFormModal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Ajouter des objets de réclamation" fields={addFields} onSubmit={handleModalSubmit} loading={addLoading} maxWidth="md" addLabel="Ajouter un autre objet" />

                <Dialog open={editModalOpen} onClose={() => { if (!editLoading) { setEditModalOpen(false); clearComponentState(); } }} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: "linear-gradient(135deg, #1e2188 0%, #3b3fd8 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><EditIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                            <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Modifier l'objet</div><div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 2 }}>{editForm.libelle || "—"}</div></div>
                        </div>
                        <IconButton onClick={() => { if (!editLoading) { setEditModalOpen(false); clearComponentState(); } }} disabled={editLoading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                    </div>
                    <DialogContent sx={{ p: 3 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Intitulé <span style={{ color: "#ef4444" }}>*</span></label>
                                <input value={editForm.libelle} onChange={(e) => { setEditForm(p => ({ ...p, libelle: e.target.value })); setEditErrors(p => ({ ...p, libelle: "" })); }} placeholder="Ex: Rançonnement"
                                    style={{ ...selectStyle(editErrors.libelle) }} onFocus={(e) => { if (!editErrors.libelle) e.target.style.borderColor = "#3b3fd8"; }} onBlur={(e) => { if (!editErrors.libelle) e.target.style.borderColor = "#e2e8f0"; }} />
                                {editErrors.libelle && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.libelle}</div>}
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Description</label>
                                <textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3}
                                    style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "9px 12px", fontSize: 13, outline: "none", background: "#fff", color: "#1e293b", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit" }} onFocus={(e) => { e.target.style.borderColor = "#3b3fd8"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Niveau de gravité <span style={{ color: "#ef4444" }}>*</span></label>
                                <FormControl fullWidth size="small" error={!!editErrors.risqueLevel}>
                                    <MuiSelect value={editForm.risqueLevel || ""} onChange={(e) => { setEditForm(p => ({ ...p, risqueLevel: e.target.value })); setEditErrors(p => ({ ...p, risqueLevel: "" })); }} displayEmpty sx={{ borderRadius: 2, fontSize: 14, border: editErrors.risqueLevel ? "1.5px solid #ef4444" : undefined }}>
                                        <MenuItem value=""><em style={{ color: "#94a3b8" }}>Sélectionner...</em></MenuItem>
                                        {LEVEL_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                    </MuiSelect>
                                </FormControl>
                                {editErrors.risqueLevel && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.risqueLevel}</div>}
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Catégorie <span style={{ color: "#ef4444" }}>*</span></label>
                                <FormControl fullWidth size="small" error={!!editErrors.categorie}>
                                    <MuiSelect value={editForm.categorie || ""} onChange={(e) => { const opt = categorieOptions.find(c => c.value === e.target.value); setEditForm(p => ({ ...p, categorie: e.target.value, categorieLibelle: opt?.label || "" })); setEditErrors(p => ({ ...p, categorie: "" })); }} displayEmpty sx={{ borderRadius: 2, fontSize: 14, border: editErrors.categorie ? "1.5px solid #ef4444" : undefined }}>
                                        <MenuItem value=""><em style={{ color: "#94a3b8" }}>Sélectionner...</em></MenuItem>
                                        {categorieOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                    </MuiSelect>
                                </FormControl>
                                {editErrors.categorie && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.categorie}</div>}
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Délai (jours) <span style={{ color: "#ef4444" }}>*</span></label>
                                <input type="number" min={0} max={MAX_SUBJECT_DURATION} value={editForm.processingTime} onChange={(e) => { setEditForm(p => ({ ...p, processingTime: e.target.value })); setEditErrors(p => ({ ...p, processingTime: "" })); }} placeholder={`Max ${MAX_SUBJECT_DURATION}`}
                                    style={{ ...selectStyle(editErrors.processingTime) }} onFocus={(e) => { if (!editErrors.processingTime) e.target.style.borderColor = "#3b3fd8"; }} onBlur={(e) => { if (!editErrors.processingTime) e.target.style.borderColor = "#e2e8f0"; }} />
                                {editErrors.processingTime && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.processingTime}</div>}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                        <Button onClick={() => { setEditModalOpen(false); clearComponentState(); }} disabled={editLoading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button>
                        <LoadingButton onClick={handleEditFormSubmit} loading={editLoading} loadingPosition="start" startIcon={<SaveIcon style={{ fontSize: 15 }} />} variant="contained" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, "&.Mui-disabled": { opacity: 0.6 } }}>Modifier</LoadingButton>
                    </DialogActions>
                </Dialog>

                <Dialog open={deleteConfirm.open} onClose={() => { if (!deleteConfirm.loading) setDeleteConfirm({ open: false, item: null, loading: false }); }} maxWidth="xs" fullWidth PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><DeleteIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                            <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Supprimer l'objet</div><div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>{deleteConfirm.item?.libelle || "—"}</div></div>
                        </div>
                        <IconButton onClick={() => setDeleteConfirm({ open: false, item: null, loading: false })} disabled={deleteConfirm.loading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                    </div>
                    <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}><p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>Confirmez-vous la suppression de <strong style={{ color: "#0f172a" }}>{deleteConfirm.item?.libelle}</strong> ? Cette action est irréversible.</p></DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", gap: 10 }}>
                        <Button onClick={() => setDeleteConfirm({ open: false, item: null, loading: false })} disabled={deleteConfirm.loading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button>
                        <LoadingButton onClick={handleDelete} loading={deleteConfirm.loading} loadingPosition="start" startIcon={<DeleteIcon style={{ fontSize: 15 }} />} variant="contained" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #991b1b, #ef4444)", "&:hover": { background: "linear-gradient(135deg, #7f1d1d, #dc2626)" }, "&.Mui-disabled": { opacity: 0.6 } }}>Supprimer</LoadingButton>
                    </DialogActions>
                </Dialog>

                <ConfigKPIBar items={props.items} kpis={KPI_CONFIG} />
                <Box sx={{ display: "flex", gap: 1, mb: 2.5, alignItems: "center", flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", gap: 1, flex: 1 }}>{CHIPS_CONFIG.map(chip => (<Chip key={chip.value} label={chip.label} onClick={() => setActiveChip(chip.value)} color={activeChip === chip.value ? "primary" : "default"} variant={activeChip === chip.value ? "filled" : "outlined"} size="small" sx={{ borderRadius: "8px", fontWeight: activeChip === chip.value ? 700 : 400, fontSize: "0.78rem" }} />))}</Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        <ViewModeToggle value={viewMode} onChange={setViewMode} />
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "nowrap", gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A", flexShrink: 0 }}>Liste des objets de réclamation</Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                        <Tooltip title="Exporter en PDF"><IconButton onClick={() => { const pi = props.items.map(i => ({ ...i, categorie: i?.categorie?.libelle ?? "-" })); handlePrint(pdfConfig, pdfColumns, pi, 0); }} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#ef4444", "&:hover": { background: "#fee2e2" } }} size="small"><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Exporter en Excel"><IconButton onClick={() => table2XLSX("Liste_des_objets" + today().replaceAll("/", ""), "app-objets")} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#16a34a", "&:hover": { background: "#dcfce7" } }} size="small"><GridOn fontSize="small" /></IconButton></Tooltip>
                        <LoadingButton onClick={() => setAddModalOpen(true)} variant="contained" startIcon={<AddIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, fontSize: "0.82rem", px: 2.5, whiteSpace: "nowrap" }}>Ajouter</LoadingButton>
                    </Box>
                </Box>
                {viewMode === "list" ? (
                    <ConfigTable items={filteredItems} exportClassName="app-objets" columns={[
                        { id: "libelle",        label: "Intitulé",           sortable: true,  minWidth: 160 },
                        { id: "description",    label: "Description",         sortable: true,  minWidth: 180 },
                        { id: "categorie",      label: "Catégorie",           sortable: false, minWidth: 130, render: (sp) => sp?.categorie?.libelle ?? "-" },
                        { id: "risqueLevel",    label: "Niveau de gravité",   sortable: true,  minWidth: 130, render: (sp) => {
                            const colors = { GRAVE: "#EF4444", MOYEN: "#F59E0B", MINEUR: "#10B981" };
                            return <span style={{ color: colors[sp.risqueLevel] ?? "#64748B", fontWeight: 600 }}>{sp.risqueLevel}</span>;
                        }},
                        { id: "processingTime", label: "Délai (j)",           sortable: true,  minWidth: 90 },
                        { id: "actions",        label: "Actions",             sortable: false, minWidth: 110, render: (sp) => (
                            <div style={{ display: "flex", gap: "5px" }}>
                                <Tooltip title="Modifier"><IconButton onClick={() => handleEditClick(sp)} color="primary"><EditIcon /></IconButton></Tooltip>
                                <Tooltip title="Supprimer"><IconButton onClick={() => setDeleteConfirm({ open: true, item: sp, loading: false })} color="error"><DeleteIcon /></IconButton></Tooltip>
                            </div>
                        )},
                    ]} searchFields={["libelle", "description", "categorie.libelle", "risqueLevel"]}
                    filters={[{ id: "risqueLevel", label: "Tous les niveaux", options: [{ value: "GRAVE", label: "Grave" }, { value: "MOYEN", label: "Moyen" }, { value: "MINEUR", label: "Mineur" }], filterFn: (row, val) => row.risqueLevel === val }]}
                    defaultSort="libelle" />
                ) : (
                    <ConfigCardView items={filteredItems} titleField="libelle" subtitleField="description"
                        badgeField="risqueLevel" badgeColorMap={{ GRAVE: "#EF4444", MOYEN: "#F59E0B", MINEUR: "#10B981" }}
                        extraFields={[
                            { label: "Catégorie", render: (sp) => sp?.categorie?.libelle ?? "-" },
                            { label: "Délai",     render: (sp) => sp.processingTime ? `${sp.processingTime} jour(s)` : "-" },
                        ]}
                        searchFields={["libelle", "description", "categorie.libelle", "risqueLevel"]}
                        onEdit={(sp) => handleEditClick(sp)}
                        onDelete={(sp) => setDeleteConfirm({ open: true, item: sp, loading: false })}
                    />
                )}
            </div>
        </>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.objet.isLoading, id: state.objet.id, libelle: state.objet.libelle,
    description: state.objet.description, processingTime: state.objet.processingTime,
    risqueLevel: state.objet.risqueLevel, categorie: state.objet.categorie,
    categorieLibelle: state.objet.categorieLibelle, items: state.objet.items,
    selectedItem: state.objet.selectedItem, errors: state.objet.objet_errors,
    etat: state.objet.etat, etat2: state.objet.etat2, etat3: state.objet.etat3,
});
const mapDispatchToProps = (dispatch) => ({
    objetErrors: (err) => dispatch(objetErrors(err)),
    idChanged: (id) => dispatch(idChanged(id)),
    libelleChanged: (l) => dispatch(libelleChanged(l)),
    descriptionChanged: (d) => dispatch(descriptionChanged(d)),
    risqueLevelChanged: (r) => dispatch(risqueLevelChanged(r)),
    categorieChanged: (c) => dispatch(categorieChanged(c)),
    categorieLibelleChanged: (c) => dispatch(categorieLibelleChanged(c)),
    processingTimeChanged: (p) => dispatch(processingTimeChanged(p)),
    itemsChanged: (i) => dispatch(itemsChanged(i)),
    selectedItemChanged: (s) => dispatch(selectedItemChanged(s)),
    etatChanged: (e) => dispatch(etatChanged(e)),
    etat2Changed: (e) => dispatch(etat2Changed(e)),
    etat3Changed: (e) => dispatch(etat3Changed(e)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Objets);
