import React, { useEffect, useState, useMemo } from "react";
import { connect } from "react-redux";
import { Tooltip, IconButton, Box, Typography, Dialog, DialogContent, DialogActions, Button, Chip } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { KTApp } from "../../Utils/blockui";
import ConfigKPIBar from "../../components/shared/ConfigKPIBar";
import ConfigTable from "../../components/shared/ConfigTable";
import ConfigCardView from "../../components/shared/ConfigCardView";
import AddDuplicateFormModal from "../../components/shared/AddDuplicateFormModal";

import ViewModeToggle from "../../components/shared/ViewModeToggle";
import QuizIcon from "@mui/icons-material/Quiz";
import { contenuChanged, etat2Changed, etat3Changed, etatChanged, faqErrors, idChanged, itemsChanged, libelleChanged, selectedItemChanged } from "../../redux/actions/Configurations/FaqActions";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/FaqApi";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" };
const textareaStyle = (hasError) => ({ width: "100%", boxSizing: "border-box", border: hasError ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "10px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", minHeight: 90, resize: "vertical", fontFamily: "inherit" });

const Faq = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        KTApp.blockPage({ overlayColor: "#000000", type: "v2", state: "danger", message: "En cours de chargement..." });
        setIsLoading(true);
        liste(props).then(() => {}).finally(() => { setIsLoading(false); KTApp.unblockPage(); });
        return clearComponentState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [addModalOpen, setAddModalOpen]   = useState(false);
    const [addLoading, setAddLoading]       = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLoading, setEditLoading]     = useState(false);
    const [editForm, setEditForm]           = useState({ libelle: "", contenu: "" });
    const [editErrors, setEditErrors]       = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null, loading: false });
    const [viewMode, setViewMode]           = useState("list");
    const [activeChip, setActiveChip]       = useState("ALL");

    const KPI_CONFIG   = [{ key: "total", label: "Total FAQ", icon: QuizIcon, iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true }];
    const CHIPS_CONFIG = [{ value: "ALL", label: "Tous", filter: () => true }];
    const filteredItems = useMemo(() => {
        const chip = CHIPS_CONFIG.find(c => c.value === activeChip);
        return chip ? props.items.filter(chip.filter) : props.items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.items, activeChip]);

    function clearComponentState() {
        props.idChanged("");
        props.libelleChanged("");
        props.contenuChanged("");
        props.selectedItemChanged({});
    }

    const addFields = [
        { key: "libelle", label: "Intitulé", required: true, fullWidth: true, placeholder: "Ex: Comment suivre ma réclamation ?" },
        {
            key: "contenu", label: "Contenu", required: true, fullWidth: true,
            render: (value, onChange) => (
                <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Ex: Vous pouvez suivre l'état de votre réclamation depuis votre espace personnel..."
                    style={textareaStyle(false)} onFocus={(e) => { e.target.style.borderColor = "#3b3fd8"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
            ),
        },
    ];
    const handleModalSubmit = async (items) => {
        setAddLoading(true);
        try { for (const item of items) { await ajout({ libelle: item.libelle, contenu: item.contenu }, props); } }
        finally { setAddLoading(false); setAddModalOpen(false); clearComponentState(); }
    };

    const handleEditClick = (sp) => {
        props.idChanged(sp.id); props.selectedItemChanged(sp);
        setEditForm({ libelle: sp.libelle || "", contenu: sp.answer || "" });
        setEditErrors({}); setEditModalOpen(true);
    };
    const handleEditSubmit = () => {
        const errs = {};
        if (!editForm.libelle.trim()) errs.libelle = "Champ requis";
        if (!editForm.contenu.trim()) errs.contenu = "Champ requis";
        if (Object.keys(errs).length) { setEditErrors(errs); return; }
        setEditLoading(true); props.etat2Changed(true);
        modification({ id: props.id, libelle: editForm.libelle, contenu: editForm.contenu }, props)
            .then(() => { setEditModalOpen(false); clearComponentState(); })
            .finally(() => { setEditLoading(false); props.etat2Changed(false); });
    };
    const handleDelete = () => {
        const sp = deleteConfirm.item; if (!sp) return;
        setDeleteConfirm(p => ({ ...p, loading: true })); props.etat3Changed(true);
        suppression(props, sp)
            .then(() => { clearComponentState(); setDeleteConfirm({ open: false, item: null, loading: false }); })
            .finally(() => { props.etat3Changed(false); });
    };

    return (
        <>
            <div className="card-panel">
                <AddDuplicateFormModal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Ajouter des questions" fields={addFields} onSubmit={handleModalSubmit} loading={addLoading} maxWidth="md" addLabel="Ajouter une autre question" />

                <Dialog open={editModalOpen} onClose={() => { if (!editLoading) { setEditModalOpen(false); clearComponentState(); } }} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: "linear-gradient(135deg, #1e2188 0%, #3b3fd8 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><EditIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                            <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Modifier la question</div><div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 2 }}>{editForm.libelle || "—"}</div></div>
                        </div>
                        <IconButton onClick={() => { if (!editLoading) { setEditModalOpen(false); clearComponentState(); } }} disabled={editLoading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                    </div>
                    <DialogContent sx={{ p: 3 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Intitulé <span style={{ color: "#ef4444" }}>*</span></label>
                                <input value={editForm.libelle} onChange={(e) => { setEditForm(p => ({ ...p, libelle: e.target.value })); setEditErrors(p => ({ ...p, libelle: "" })); }} placeholder="Ex: Comment suivre ma réclamation ?"
                                    style={{ width: "100%", boxSizing: "border-box", border: editErrors.libelle ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "10.5px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", height: 40 }}
                                    onFocus={(e) => { if (!editErrors.libelle) e.target.style.borderColor = "#3b3fd8"; }} onBlur={(e) => { if (!editErrors.libelle) e.target.style.borderColor = "#e2e8f0"; }} />
                                {editErrors.libelle && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.libelle}</div>}
                            </div>
                            <div>
                                <label style={labelStyle}>Contenu <span style={{ color: "#ef4444" }}>*</span></label>
                                <textarea value={editForm.contenu} onChange={(e) => { setEditForm(p => ({ ...p, contenu: e.target.value })); setEditErrors(p => ({ ...p, contenu: "" })); }} placeholder="Ex: Vous pouvez suivre l'état de votre réclamation depuis votre espace personnel..."
                                    style={textareaStyle(editErrors.contenu)} onFocus={(e) => { if (!editErrors.contenu) e.target.style.borderColor = "#3b3fd8"; }} onBlur={(e) => { if (!editErrors.contenu) e.target.style.borderColor = "#e2e8f0"; }} />
                                {editErrors.contenu && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.contenu}</div>}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                        <Button onClick={() => { setEditModalOpen(false); clearComponentState(); }} disabled={editLoading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button>
                        <LoadingButton onClick={handleEditSubmit} loading={editLoading} loadingPosition="start" startIcon={<SaveIcon style={{ fontSize: 15 }} />} variant="contained" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, "&.Mui-disabled": { opacity: 0.6 } }}>Modifier</LoadingButton>
                    </DialogActions>
                </Dialog>

                <Dialog open={deleteConfirm.open} onClose={() => { if (!deleteConfirm.loading) setDeleteConfirm({ open: false, item: null, loading: false }); }} fullWidth maxWidth="xs" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><DeleteIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                            <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Supprimer la question</div><div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>{deleteConfirm.item?.libelle || "—"}</div></div>
                        </div>
                        <IconButton onClick={() => setDeleteConfirm({ open: false, item: null, loading: false })} disabled={deleteConfirm.loading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                    </div>
                    <DialogContent sx={{ p: 3 }}>
                        <Typography sx={{ fontSize: 14, color: "#475569" }}>Confirmez-vous la suppression de cet élément ? Cette action est irréversible.</Typography>
                    </DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                        <Button onClick={() => setDeleteConfirm({ open: false, item: null, loading: false })} disabled={deleteConfirm.loading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button>
                        <LoadingButton onClick={handleDelete} loading={deleteConfirm.loading} loadingPosition="start" startIcon={<DeleteIcon style={{ fontSize: 15 }} />} variant="contained"
                            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #991b1b, #ef4444)", "&:hover": { background: "linear-gradient(135deg, #7f1d1d, #dc2626)" }, "&.Mui-disabled": { opacity: 0.6 } }}>
                            Supprimer
                        </LoadingButton>
                    </DialogActions>
                </Dialog>

                <ConfigKPIBar items={props.items} kpis={KPI_CONFIG} />
                <Box sx={{ display: "flex", gap: 1, mb: 2.5, alignItems: "center", flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", gap: 1, flex: 1 }}>{CHIPS_CONFIG.map(chip => (<Chip key={chip.value} label={chip.label} onClick={() => setActiveChip(chip.value)} color={activeChip === chip.value ? "primary" : "default"} variant={activeChip === chip.value ? "filled" : "outlined"} size="small" sx={{ borderRadius: "8px", fontWeight: activeChip === chip.value ? 700 : 400 }} />))}</Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        <ViewModeToggle value={viewMode} onChange={setViewMode} />
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "nowrap", gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A", flexShrink: 0 }}>Liste de la FAQ</Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                        <LoadingButton onClick={() => setAddModalOpen(true)} variant="contained" startIcon={<AddIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, fontSize: "0.82rem", px: 2.5, whiteSpace: "nowrap" }}>Ajouter</LoadingButton>
                    </Box>
                </Box>
                {viewMode === "list" ? (
                    <ConfigTable items={filteredItems}
                        exportClassName="app-faq"
                        columns={[
                            { id: "libelle", label: "Intitulé",  sortable: true,  minWidth: 200 },
                            { id: "answer",  label: "Réponse",   sortable: true,  minWidth: 250 },
                            { id: "actions", label: "Actions",   sortable: false, minWidth: 110, render: (sp) => (
                                <div style={{ display: "flex", gap: "5px" }}>
                                    <Tooltip title="Modifier"><IconButton onClick={() => handleEditClick(sp)} color="primary"><EditIcon /></IconButton></Tooltip>
                                    <Tooltip title="Supprimer"><IconButton onClick={() => setDeleteConfirm({ open: true, item: sp, loading: false })} color="error"><DeleteIcon /></IconButton></Tooltip>
                                </div>
                            )},
                        ]}
                        searchFields={["libelle", "answer"]} defaultSort="libelle" />
                ) : (
                    <ConfigCardView items={filteredItems} titleField="libelle" subtitleField="answer" searchFields={["libelle", "answer"]}
                        onEdit={(sp) => handleEditClick(sp)}
                        onDelete={(sp) => setDeleteConfirm({ open: true, item: sp, loading: false })} />
                )}

            </div>
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        isLoading: state.faq.isLoading,
        id: state.faq.id,
        libelle: state.faq.libelle,
        contenu: state.faq.contenu,
        items: state.faq.items,
        selectedItem: state.faq.selectedItem,
        errors: state.faq.faqErrors,
        etat: state.faq.etat,
        etat2: state.faq.etat2,
        etat3: state.faq.etat3,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        faqErrors: (err) => { dispatch(faqErrors(err)) },
        idChanged: (id) => { dispatch(idChanged(id)) },
        libelleChanged: (libelle) => { dispatch(libelleChanged(libelle)) },
        contenuChanged: (contenu) => { dispatch(contenuChanged(contenu)) },
        itemsChanged: (items) => { dispatch(itemsChanged(items)) },
        selectedItemChanged: (selectedItem) => { dispatch(selectedItemChanged(selectedItem)) },
        etatChanged: (etat) => { dispatch(etatChanged(etat)); },
        etat2Changed: (etat2) => { dispatch(etat2Changed(etat2)); },
        etat3Changed: (etat3) => { dispatch(etat3Changed(etat3)); },
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Faq)
