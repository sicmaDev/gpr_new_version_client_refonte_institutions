import React, { useEffect, useState, useRef, useMemo } from "react";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { Tooltip, IconButton, Box, Typography, Dialog, DialogContent, DialogActions, Button, Chip } from "@mui/material";
import { PictureAsPdf, GridOn } from "@mui/icons-material";
import {
    descriptionChanged, etat2Changed, etat3Changed, etatChanged, idChanged,
    itemsChanged, langueErrors, libelleChanged, selectedItemChanged
} from "../../redux/actions/Configurations/LanguesActions";
import { today } from "../../Utils/utils";
import { connect } from "react-redux";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/LanguesApi";
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

const Langues = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [addModalOpen, setAddModalOpen]   = useState(false);
    const [addLoading, setAddLoading]       = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLoading, setEditLoading]     = useState(false);
    const [editForm, setEditForm]           = useState({ libelle: "", description: "" });
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

    const KPI_CONFIG   = [{ key: "total", label: "Total langues", icon: AssignmentIcon, iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true }];
    const CHIPS_CONFIG = [{ value: "ALL", label: "Tous", filter: () => true }];

    const filteredItems = useMemo(() => {
        const chip = CHIPS_CONFIG.find(c => c.value === activeChip);
        const base = chip ? props.items.filter(chip.filter) : props.items;
        return [...base].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.items, activeChip]);

    // Config pour export PDF (colonnes legacy)
    const pdfColumns = [
        { key: "libelle",     text: "Intitulé",    className: "name",        align: "left", sortable: true },
        { key: "description", text: "Description", className: "description", align: "left", sortable: true },
    ];
    const pdfConfig = {
        page_size: 15, length_menu: [15, 25, 50], show_filter: true, show_pagination: true,
        filename: "Langues",
        language: {
            length_menu: "Afficher _MENU_ éléments", filter: "Rechercher...",
            info: "Affichage de l'élement _START_ à _END_ sur _TOTAL_ éléments",
            zero_records: "Aucun élément", no_data_text: "Aucun élément", loading_text: "Chargement...",
            pagination: { first: <FirstPageIcon />, previous: <ChevronLeftIcon />, next: <ChevronRightIcon />, last: <LastPageIcon /> }
        }
    };

    function clearComponentState() {
        props.idChanged(""); props.libelleChanged(""); props.descriptionChanged(""); props.selectedItemChanged({});
    }

    // ── Ajout multiple ────────────────────────────────────────────────────
    const addFields = [
        { key: "libelle",     label: "Intitulé",    required: true, fullWidth: false, placeholder: "Ex: Français, Fon, Goun..." },
        { key: "description", label: "Description", type: "textarea", fullWidth: true, placeholder: "Description de la langue" },
    ];
    const handleModalSubmit = async (items) => {
        setAddLoading(true);
        try {
            for (const item of items) {
                await ajout({ libelle: item.libelle, description: item.description }, props);
            }
        } finally { setAddLoading(false); setAddModalOpen(false); }
    };

    // ── Édition ───────────────────────────────────────────────────────────
    const handleEditClick = (sp) => {
        props.idChanged(sp.id);
        props.selectedItemChanged(sp);
        setEditForm({ libelle: sp.libelle || "", description: sp.description || "" });
        setEditErrors({});
        setEditModalOpen(true);
    };
    const handleEditFormSubmit = () => {
        if (!editForm.libelle.trim()) { setEditErrors({ libelle: "Champ requis" }); return; }
        setEditLoading(true);
        props.etat2Changed(true);
        modification({ id: props.id, libelle: editForm.libelle, description: editForm.description }, props)
            .then(() => { setEditModalOpen(false); clearComponentState(); })
            .finally(() => { setEditLoading(false); props.etat2Changed(false); });
    };

    // ── Suppression ───────────────────────────────────────────────────────
    const handleDelete = () => {
        const sp = deleteConfirm.item;
        if (!sp) return;
        setDeleteConfirm(p => ({ ...p, loading: true }));
        props.etat3Changed(true);
        suppression(props, sp)
            .then(() => { clearComponentState(); setDeleteConfirm({ open: false, item: null, loading: false }); })
            .finally(() => { props.etat3Changed(false); });
    };

    return (
        <>
            <div className="card-panel">

                {/* ── Modal ajout ── */}
                <AddDuplicateFormModal
                    open={addModalOpen} onClose={() => setAddModalOpen(false)}
                    title="Ajouter des langues" fields={addFields}
                    onSubmit={handleModalSubmit} loading={addLoading}
                    maxWidth="md" addLabel="Ajouter une autre langue"
                />

                {/* ── Modal édition ── */}
                <Dialog open={editModalOpen} onClose={() => { if (!editLoading) { setEditModalOpen(false); clearComponentState(); } }} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: "linear-gradient(135deg, var(--gpr-primary-dark) 0%, var(--gpr-primary) 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <EditIcon style={{ color: "#fff", fontSize: 20 }} />
                            </div>
                            <div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Modifier la langue</div>
                                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 2 }}>{editForm.libelle}</div>
                            </div>
                        </div>
                        <IconButton onClick={() => { if (!editLoading) { setEditModalOpen(false); clearComponentState(); } }} disabled={editLoading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
                            <CloseIcon style={{ fontSize: 16 }} />
                        </IconButton>
                    </div>
                    <DialogContent sx={{ p: 3 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Intitulé <span style={{ color: "#ef4444" }}>*</span></label>
                                <input value={editForm.libelle} onChange={(e) => { setEditForm(p => ({ ...p, libelle: e.target.value })); setEditErrors(p => ({ ...p, libelle: "" })); }} placeholder="Ex: Français" style={{ width: "100%", boxSizing: "border-box", border: editErrors.libelle ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "10.5px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", height: 40 }} onFocus={(e) => { if (!editErrors.libelle) e.target.style.borderColor = "var(--gpr-primary)"; }} onBlur={(e) => { if (!editErrors.libelle) e.target.style.borderColor = "#e2e8f0"; }} />
                                {editErrors.libelle && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.libelle}</div>}
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Description</label>
                                <textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder="Description de la langue" rows={3} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "9px 12px", fontSize: 13, outline: "none", background: "#fff", color: "#1e293b", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit" }} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary)"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                        <BlockButton disabled={editLoading}><Button onClick={() => { setEditModalOpen(false); clearComponentState(); }} disabled={editLoading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button></BlockButton>
                        <BlockButton disabled={editLoading}><LoadingButton onClick={handleEditFormSubmit} loading={editLoading} loadingPosition="start" startIcon={<SaveIcon style={{ fontSize: 15 }} />} variant="contained" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, "&.Mui-disabled": { opacity: 0.6 } }}>Modifier</LoadingButton></BlockButton>
                    </DialogActions>
                </Dialog>

                {/* ── Modal suppression ── */}
                <Dialog open={deleteConfirm.open} onClose={() => { if (!deleteConfirm.loading) setDeleteConfirm({ open: false, item: null, loading: false }); }} maxWidth="xs" fullWidth PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <DeleteIcon style={{ color: "#fff", fontSize: 20 }} />
                            </div>
                            <div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Supprimer la langue</div>
                                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>{deleteConfirm.item?.libelle}</div>
                            </div>
                        </div>
                        <IconButton onClick={() => setDeleteConfirm({ open: false, item: null, loading: false })} disabled={deleteConfirm.loading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
                            <CloseIcon style={{ fontSize: 16 }} />
                        </IconButton>
                    </div>
                    <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                            Confirmez-vous la suppression de <strong style={{ color: "#0f172a" }}>{deleteConfirm.item?.libelle}</strong> ? Cette action est irréversible.
                        </p>
                    </DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", gap: 10 }}>
                        <BlockButton disabled={deleteConfirm.loading}><Button onClick={() => setDeleteConfirm({ open: false, item: null, loading: false })} disabled={deleteConfirm.loading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button></BlockButton>
                        <BlockButton disabled={deleteConfirm.loading}><LoadingButton onClick={handleDelete} loading={deleteConfirm.loading} loadingPosition="start" startIcon={<DeleteIcon style={{ fontSize: 15 }} />} variant="contained" color="error" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #991b1b, #ef4444)", "&:hover": { background: "linear-gradient(135deg, #7f1d1d, #dc2626)" }, "&.Mui-disabled": { opacity: 0.6 } }}>Supprimer</LoadingButton></BlockButton>
                    </DialogActions>
                </Dialog>

                {/* ── KPI Bar ── */}
                <ConfigKPIBar items={props.items} kpis={KPI_CONFIG} />

                {/* ── Chips + Switch vue ── */}
                <Box sx={{ display: "flex", gap: 1, mb: 2.5, alignItems: "center", flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
                        {CHIPS_CONFIG.map(chip => (
                            <Chip key={chip.value} label={chip.label} onClick={() => setActiveChip(chip.value)} color={activeChip === chip.value ? "primary" : "default"} variant={activeChip === chip.value ? "filled" : "outlined"} size="small" sx={{ borderRadius: "8px", fontWeight: activeChip === chip.value ? 700 : 400, fontSize: "0.78rem" }} />
                        ))}
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        <ViewModeToggle value={viewMode} onChange={setViewMode} />
                    </Box>
                </Box>

                {/* ── En-tête ── */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "nowrap", gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A", flexShrink: 0 }}>Liste des langues</Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                        <Tooltip title="Exporter en PDF">
                            <IconButton onClick={() => handlePrint(pdfConfig, pdfColumns, props.items, 0)} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#ef4444", "&:hover": { background: "#fee2e2", borderColor: "#fca5a5" } }} size="small"><PictureAsPdf fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Exporter en Excel">
                            <IconButton onClick={() => table2XLSX("Liste_des_langues" + today().replaceAll("/", ""), "app-langues")} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#16a34a", "&:hover": { background: "#dcfce7", borderColor: "#86efac" } }} size="small"><GridOn fontSize="small" /></IconButton>
                        </Tooltip>
                        <LoadingButton onClick={() => setAddModalOpen(true)} variant="contained" startIcon={<AddIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, fontSize: "0.82rem", px: 2.5, whiteSpace: "nowrap" }}>
                            Ajouter
                        </LoadingButton>
                    </Box>
                </Box>

                {/* ── Vue tableau / cartes ── */}
                {viewMode === "list" ? (
                    <ConfigTable items={filteredItems}
                        exportClassName="app-langues"
                        columns={[
                            { id: "libelle",     label: "Intitulé",    sortable: true,  minWidth: 180 },
                            { id: "description", label: "Description", sortable: true,  minWidth: 220 },
                            { id: "actions", label: "Actions", sortable: false, minWidth: 110, render: (sp) => (
                                <div style={{ display: "flex", gap: "5px" }}>
                                    <Tooltip title="Modifier"><IconButton onClick={() => handleEditClick(sp)} color="primary"><EditIcon /></IconButton></Tooltip>
                                    <Tooltip title="Supprimer"><IconButton onClick={() => setDeleteConfirm({ open: true, item: sp, loading: false })} color="error"><DeleteIcon /></IconButton></Tooltip>
                                </div>
                            )},
                        ]}
                        searchFields={["libelle", "description"]} defaultSort="libelle"
                    />
                ) : (
                    <ConfigCardView items={filteredItems} titleField="libelle" subtitleField="description" searchFields={["libelle", "description"]}
                        onEdit={(sp) => handleEditClick(sp)}
                        onDelete={(sp) => setDeleteConfirm({ open: true, item: sp, loading: false })}
                    />
                )}
            </div>
        </>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.langue.isLoading,
    id: state.langue.id,
    libelle: state.langue.libelle,
    description: state.langue.description,
    items: state.langue.items,
    selectedItem: state.langue.selectedItem,
    errors: state.langue.langue_errors,
    page: state.layout.page,
    etat: state.langue.etat,
    etat2: state.langue.etat2,
    etat3: state.langue.etat3,
});

const mapDispatchToProps = (dispatch) => ({
    langueErrors: (err)           => dispatch(langueErrors(err)),
    idChanged: (id)               => dispatch(idChanged(id)),
    libelleChanged: (libelle)     => dispatch(libelleChanged(libelle)),
    descriptionChanged: (desc)    => dispatch(descriptionChanged(desc)),
    itemsChanged: (items)         => dispatch(itemsChanged(items)),
    selectedItemChanged: (item)   => dispatch(selectedItemChanged(item)),
    pageChanged: (page)           => dispatch(pageChanged(page)),
    etatChanged: (etat)           => dispatch(etatChanged(etat)),
    etat2Changed: (etat2)         => dispatch(etat2Changed(etat2)),
    etat3Changed: (etat3)         => dispatch(etat3Changed(etat3)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Langues);
