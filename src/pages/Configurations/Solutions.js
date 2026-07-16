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
    etat2Changed, etat3Changed, etatChanged, idChanged,
    itemsChanged, solutionErrors, selectedItemChanged,
    objetLibelleChanged, objetChanged, solutionChanged
} from "../../redux/actions/Configurations/SolutionsActions";
import { loadItemFromLocalStorage, today } from "../../Utils/utils";
import { connect } from "react-redux";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/SolutionsApi";
import { handlePrint } from "../../Utils/tables";
import { table2XLSX } from "../../Utils/tabletoexcel";
import { pageChanged } from "../../redux/actions/LayoutActions";
import { LoadingButton } from "@mui/lab";
import BlockButton from "../../components/shared/BlockButton";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { KTApp } from "../../Utils/blockui";
import ConfigKPIBar from "../../components/shared/ConfigKPIBar";
import ConfigTable from "../../components/shared/ConfigTable";
import ConfigCardView from "../../components/shared/ConfigCardView";
import AddDuplicateFormModal from "../../components/shared/AddDuplicateFormModal";

import ViewModeToggle from "../../components/shared/ViewModeToggle";
import AssignmentIcon from "@mui/icons-material/Assignment";

const Solutions = (props) => {
    let objets = [];
    try { objets = JSON.parse(loadItemFromLocalStorage("app-objets")) || []; } catch (e) { objets = []; }
    const objetsOptions = objets.map(o => ({ label: o.libelle, value: o.id }));

    const [isLoading, setIsLoading]         = useState(false);
    const [addModalOpen, setAddModalOpen]   = useState(false);
    const [addLoading, setAddLoading]       = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLoading, setEditLoading]     = useState(false);
    const [editForm, setEditForm]           = useState({ objet: "", objetLibelle: "", content: "" });
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

    const KPI_CONFIG   = [{ key: "total", label: "Total solutions", icon: AssignmentIcon, iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true }];
    const CHIPS_CONFIG = [{ value: "ALL", label: "Tous", filter: () => true }];
    const filteredItems = useMemo(() => {
        const chip = CHIPS_CONFIG.find(c => c.value === activeChip);
        const base = chip ? props.items.filter(chip.filter) : props.items;
        const sorted = [...base].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return sorted.map(it => ({ ...it, objetLibelle: it.objetDto?.libelle ?? "-" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.items, activeChip]);

    const pdfColumns = [
        { key: "objetLibelle", text: "Objet", align: "left", sortable: true },
        { key: "content", text: "Solution", align: "left", sortable: true },
    ];
    const pdfConfig = {
        page_size: 15, filename: "Solutions",
        language: { length_menu: "Afficher _MENU_ éléments", filter: "Rechercher...", info: "...", zero_records: "Aucun élément", no_data_text: "Aucun élément", loading_text: "Chargement...",
            pagination: { first: <FirstPageIcon />, previous: <ChevronLeftIcon />, next: <ChevronRightIcon />, last: <LastPageIcon /> } }
    };

    function clearComponentState() {
        props.idChanged(""); props.objetChanged(""); props.objetLibelleChanged("");
        props.solutionChanged(""); props.selectedItemChanged({});
    }

    const addFields = [
        {
            key: "objet", label: "Objet de réclamation", required: true, fullWidth: false,
            render: (value, onChange) => (
                <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                    <MuiSelect value={value || ""} onChange={(e) => { const opt = objetsOptions.find(o => o.value === e.target.value); onChange(e.target.value, opt?.label); }} displayEmpty sx={{ borderRadius: 2, fontSize: 14 }}>
                        <MenuItem value=""><em style={{ color: "#94a3b8" }}>Sélectionner l'objet</em></MenuItem>
                        {objetsOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </MuiSelect>
                </FormControl>
            ),
        },
        {
            key: "content", label: "Solution proposée", required: true, fullWidth: true,
            render: (value, onChange) => (
                <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Ex: La meilleure des solutions dans ce cas est de mener une enquête..."
                    style={{ width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "10px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", minHeight: 80, resize: "vertical", fontFamily: "inherit" }}
                    onFocus={(e) => { e.target.style.borderColor = "#3b3fd8"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
            ),
        },
    ];
    const handleModalSubmit = async (items) => {
        setAddLoading(true);
        try { for (const item of items) { await ajout({ objet: item.objet, content: item.content }, props); } }
        finally { setAddLoading(false); setAddModalOpen(false); }
    };

    const handleEditClick = (sp) => {
        props.idChanged(sp.id); props.selectedItemChanged(sp);
        setEditForm({ objet: sp.objetDto?.id || "", objetLibelle: sp.objetDto?.libelle || "", content: sp.content || "" });
        setEditErrors({}); setEditModalOpen(true);
    };
    const handleEditFormSubmit = () => {
        const errs = {};
        if (!editForm.objet) errs.objet = "Champ requis";
        if (!editForm.content.trim()) errs.content = "Champ requis";
        if (Object.keys(errs).length) { setEditErrors(errs); return; }
        setEditLoading(true); props.etat2Changed(true);
        modification({ id: props.id, objet: editForm.objet, content: editForm.content }, props)
            .then(() => { setEditModalOpen(false); clearComponentState(); })
            .finally(() => { setEditLoading(false); props.etat2Changed(false); });
    };
    const handleDelete = () => {
        const sp = deleteConfirm.item; if (!sp) return;
        setDeleteConfirm(p => ({ ...p, loading: true })); props.etat3Changed(true);
        suppression(props, sp).then(() => { clearComponentState(); setDeleteConfirm({ open: false, item: null, loading: false }); }).finally(() => { props.etat3Changed(false); });
    };

    return (
        <>
            <div className="card-panel">
                <AddDuplicateFormModal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Ajouter des solutions" fields={addFields} onSubmit={handleModalSubmit} loading={addLoading} maxWidth="md" addLabel="Ajouter une autre solution" />

                <Dialog open={editModalOpen} onClose={() => { if (!editLoading) { setEditModalOpen(false); clearComponentState(); } }} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: "linear-gradient(135deg, #1e2188 0%, #3b3fd8 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><EditIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                            <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Modifier la solution</div><div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 2 }}>{editForm.objetLibelle}</div></div>
                        </div>
                        <IconButton onClick={() => { if (!editLoading) { setEditModalOpen(false); clearComponentState(); } }} disabled={editLoading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                    </div>
                    <DialogContent sx={{ p: 3 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Objet de réclamation <span style={{ color: "#ef4444" }}>*</span></label>
                                <FormControl fullWidth size="small" error={!!editErrors.objet}>
                                    <MuiSelect value={editForm.objet || ""} onChange={(e) => { const opt = objetsOptions.find(o => o.value === e.target.value); setEditForm(p => ({ ...p, objet: e.target.value, objetLibelle: opt?.label || "" })); setEditErrors(p => ({ ...p, objet: "" })); }} displayEmpty sx={{ borderRadius: 2, fontSize: 14 }}>
                                        <MenuItem value=""><em style={{ color: "#94a3b8" }}>Sélectionner l'objet</em></MenuItem>
                                        {objetsOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                    </MuiSelect>
                                </FormControl>
                                {editErrors.objet && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.objet}</div>}
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Solution proposée <span style={{ color: "#ef4444" }}>*</span></label>
                                <textarea value={editForm.content} onChange={(e) => { setEditForm(p => ({ ...p, content: e.target.value })); setEditErrors(p => ({ ...p, content: "" })); }} placeholder="Ex: La meilleure des solutions..."
                                    style={{ width: "100%", boxSizing: "border-box", border: editErrors.content ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "10px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", minHeight: 80, resize: "vertical", fontFamily: "inherit" }}
                                    onFocus={(e) => { if (!editErrors.content) e.target.style.borderColor = "#3b3fd8"; }} onBlur={(e) => { if (!editErrors.content) e.target.style.borderColor = "#e2e8f0"; }} />
                                {editErrors.content && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.content}</div>}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                        <BlockButton disabled={editLoading}><Button onClick={() => { setEditModalOpen(false); clearComponentState(); }} disabled={editLoading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button></BlockButton>
                        <BlockButton disabled={editLoading}><LoadingButton onClick={handleEditFormSubmit} loading={editLoading} loadingPosition="start" startIcon={<SaveIcon style={{ fontSize: 15 }} />} variant="contained" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, "&.Mui-disabled": { opacity: 0.6 } }}>Modifier</LoadingButton></BlockButton>
                    </DialogActions>
                </Dialog>

                <Dialog open={deleteConfirm.open} onClose={() => { if (!deleteConfirm.loading) setDeleteConfirm({ open: false, item: null, loading: false }); }} maxWidth="xs" fullWidth PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><DeleteIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                            <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Supprimer la solution</div><div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>{deleteConfirm.item?.objetDto?.libelle}</div></div>
                        </div>
                        <IconButton onClick={() => setDeleteConfirm({ open: false, item: null, loading: false })} disabled={deleteConfirm.loading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                    </div>
                    <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}><p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>Confirmez-vous la suppression de cette solution ? Cette action est irréversible.</p></DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", gap: 10 }}>
                        <BlockButton disabled={deleteConfirm.loading}><Button onClick={() => setDeleteConfirm({ open: false, item: null, loading: false })} disabled={deleteConfirm.loading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button></BlockButton>
                        <BlockButton disabled={deleteConfirm.loading}><LoadingButton onClick={handleDelete} loading={deleteConfirm.loading} loadingPosition="start" startIcon={<DeleteIcon style={{ fontSize: 15 }} />} variant="contained" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #991b1b, #ef4444)", "&:hover": { background: "linear-gradient(135deg, #7f1d1d, #dc2626)" }, "&.Mui-disabled": { opacity: 0.6 } }}>Supprimer</LoadingButton></BlockButton>
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
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A", flexShrink: 0 }}>Liste des solutions</Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                        <Tooltip title="Exporter en PDF"><IconButton onClick={() => handlePrint(pdfConfig, pdfColumns, filteredItems, 0)} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#ef4444", "&:hover": { background: "#fee2e2" } }} size="small"><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Exporter en Excel"><IconButton onClick={() => table2XLSX("Liste_des_solutions" + today().replaceAll("/", ""), "app-solutions")} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#16a34a", "&:hover": { background: "#dcfce7" } }} size="small"><GridOn fontSize="small" /></IconButton></Tooltip>
                        <LoadingButton onClick={() => setAddModalOpen(true)} variant="contained" startIcon={<AddIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, fontSize: "0.82rem", px: 2.5, whiteSpace: "nowrap" }}>Ajouter</LoadingButton>
                    </Box>
                </Box>
                {viewMode === "list" ? (
                    <ConfigTable items={filteredItems} exportClassName="app-solutions" columns={[
                        { id: "objet",   label: "Objet",    sortable: true,  minWidth: 180, render: (sp) => sp.objetDto?.libelle ?? "-" },
                        { id: "content", label: "Solution", sortable: true,  minWidth: 220 },
                        { id: "actions", label: "Actions",  sortable: false, minWidth: 110, render: (sp) => (
                            <div style={{ display: "flex", gap: "5px" }}>
                                <Tooltip title="Modifier"><IconButton onClick={() => handleEditClick(sp)} color="primary"><EditIcon /></IconButton></Tooltip>
                                <Tooltip title="Supprimer"><IconButton onClick={() => setDeleteConfirm({ open: true, item: sp, loading: false })} color="error"><DeleteIcon /></IconButton></Tooltip>
                            </div>
                        )},
                    ]} searchFields={["content", "objetLibelle"]} defaultSort="content" />
                ) : (
                    <ConfigCardView items={filteredItems}
                        titleField="objetLibelle"
                        subtitleField="content"
                        searchFields={["content", "objetLibelle"]}
                        onEdit={(sp) => handleEditClick(sp)}
                        onDelete={(sp) => setDeleteConfirm({ open: true, item: sp, loading: false })}
                    />
                )}
            </div>
        </>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.solution.isLoading, id: state.solution.id, objet: state.solution.objet,
    objetLibelle: state.solution.objetLibelle, solution: state.solution.solution,
    items: state.solution.items, selectedItem: state.solution.selectedItem,
    errors: state.solution.solution_errors, page: state.layout.page,
    etat: state.solution.etat, etat2: state.solution.etat2, etat3: state.solution.etat3,
});
const mapDispatchToProps = (dispatch) => ({
    solutionErrors: (err) => dispatch(solutionErrors(err)),
    idChanged: (id) => dispatch(idChanged(id)),
    objetChanged: (o) => dispatch(objetChanged(o)),
    objetLibelleChanged: (o) => dispatch(objetLibelleChanged(o)),
    solutionChanged: (s) => dispatch(solutionChanged(s)),
    itemsChanged: (i) => dispatch(itemsChanged(i)),
    selectedItemChanged: (s) => dispatch(selectedItemChanged(s)),
    pageChanged: (p) => dispatch(pageChanged(p)),
    etatChanged: (e) => dispatch(etatChanged(e)),
    etat2Changed: (e) => dispatch(etat2Changed(e)),
    etat3Changed: (e) => dispatch(etat3Changed(e)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Solutions);
