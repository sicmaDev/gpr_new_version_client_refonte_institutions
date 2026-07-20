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
    Button, Chip
} from "@mui/material";
import Stack from '@mui/material/Stack';
import { PictureAsPdf, GridOn } from "@mui/icons-material";
import {
    descriptionChanged, idChanged, itemsChanged, posteErrors,
    libelleChanged, selectedItemChanged, habilitationsChanged,
    cardChanged, etat2Changed, etatChanged, etat3Changed
} from "../../redux/actions/Configurations/PostesActions";
import { today } from "../../Utils/utils";
import { connect } from "react-redux";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/PostesApi";
import { handlePrint } from "../../Utils/tables";
import { table2XLSX } from "../../Utils/tabletoexcel";
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
import Select from "react-select";

const HAB_KEYS = ["H1","H2","H3","H4","H5","H6","H7","H8","H9","H10","H11","H12","H13","H14"];

const HAB_DESCRIPTIONS = {
    H1: "Enregistrer une réclamation, suggestion, dénonciation",
    H2: "Traitement d'une réclamation, dénonciation à risque mineur",
    H3: "Traitement d'une réclamation, dénonciation à risque moyen",
    H4: "Traitement d'une réclamation, dénonciation à risque élevé",
    H5: "Mesurer la satisfaction d'une réclamation",
    H6: "Affecter le traitement d'une réclamation à un utilisateur",
    H7: "Imprimer la liste des réclamations, suggestions, dénonciations",
    H8: "Imprimer la liste avec le choix des critères",
    H9: "Exporter la liste des réclamations, suggestions, dénonciations",
    H10: "Exporter la liste avec le choix des critères",
    H11: "Générer des rapports et statistiques",
    H12: "Configurer l'outil de gestion de plainte ou réclamation",
    H13: "Consulter les Alertes de retard de traitement",
    H14: "Consulter toutes les informations",
};

const getHabilitationColor = (hab) => {
    const map = { H1:"#00B8D9", H2:"#0052CC", H3:"#5243AA", H4:"#FF5630", H5:"#FF8B00", H6:"#FFC400", H7:"#36B37E", H8:"#00875A", H9:"#253858", H10:"#666666", H11:"#3333ff", H12:"#99003d", H13:"#00cc00", H14:"#333300" };
    return map[hab] ?? "#ff0000";
};

const toHabArray = (habs) => {
    if (!habs) return [];
    if (typeof habs === 'string') return habs.split(',').map(h => h.trim()).filter(Boolean);
    if (Array.isArray(habs)) return habs.map(h => (typeof h === 'string' ? h : h?.value)).filter(Boolean);
    return [];
};

const HAB_OPTIONS = HAB_KEYS.map(h => ({ value: h, label: h, description: HAB_DESCRIPTIONS[h], color: getHabilitationColor(h) }));

const habSelectStyles = {
    control: (base, state) => ({ ...base, minHeight: 40, borderRadius: 9, borderColor: state.isFocused ? "#3b3fd8" : "#e2e8f0", borderWidth: 1.5, boxShadow: "none", "&:hover": { borderColor: "#3b3fd8" } }),
    valueContainer: base => ({ ...base, padding: "4px 8px", gap: 4 }),
    placeholder: base => ({ ...base, fontSize: 14, color: "#94a3b8" }),
    input: base => ({ ...base, margin: 0, padding: 0 }),
    indicatorSeparator: () => ({ display: "none" }),
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    menu: base => ({ ...base, zIndex: 9999, borderRadius: 8, overflow: "hidden", boxShadow: "0 8px 24px rgba(15,23,42,0.12)" }),
    menuList: base => ({ ...base, padding: 4, maxHeight: 280 }),
};

const HabMultiValue = ({ data, removeProps }) => (
    <div style={{
        display: "flex", alignItems: "center", gap: 4, margin: 2, padding: "2px 6px 2px 8px",
        borderRadius: 6, backgroundColor: `${data.color}1a`, color: data.color, fontWeight: 700, fontSize: 12,
    }}>
        <span>{data.label}</span>
        <span {...removeProps} style={{ cursor: "pointer", fontSize: 14, lineHeight: 1, color: `${data.color}99` }}>×</span>
    </div>
);

const HabOption = ({ data, innerProps, innerRef, isSelected, isFocused }) => (
    <div ref={innerRef} {...innerProps} style={{
        display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", cursor: "pointer", borderRadius: 6,
        backgroundColor: isFocused ? "#f8fafc" : "#fff",
        borderLeft: isSelected ? `3px solid ${data.color}` : "3px solid transparent",
    }}>
        <input type="checkbox" checked={isSelected} readOnly style={{ marginTop: 3, accentColor: data.color }} />
        <div>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: data.color }}>{data.label}</div>
            <div style={{ fontSize: 11.5, color: "#64748b" }}>{data.description}</div>
        </div>
    </div>
);

const Postes = (props) => {
    const [isLoading, setIsLoading]         = useState(false);
    const [addModalOpen, setAddModalOpen]   = useState(false);
    const [addLoading, setAddLoading]       = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editLoading, setEditLoading]     = useState(false);
    const [editForm, setEditForm]           = useState({ libelle: "", description: "", habilitations: [] });
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
        { key: "total", label: "Total postes",       icon: AssignmentIcon, iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true },
    ];
    const CHIPS_CONFIG = [
        { value: "ALL", label: "Tous", filter: () => true },
        ...HAB_KEYS.map(h => ({
            value: h, label: h,
            filter: (i) => toHabArray(i.habilitations).includes(h),
        })),
    ];
    const filteredItems = useMemo(() => {
        const chip = CHIPS_CONFIG.find(c => c.value === activeChip);
        const base = chip ? props.items.filter(chip.filter) : props.items;
        return [...base].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.items, activeChip]);

    const pdfColumns = [
        { key: "libelle", text: "Intitulé", align: "left", sortable: true },
        { key: "description", text: "Description", align: "left", sortable: true },
        { key: "habilitations", text: "Habilitations", align: "left", sortable: true },
    ];
    const pdfConfig = {
        page_size: 15, filename: "Postes",
        language: { length_menu: "Afficher _MENU_ éléments", filter: "Rechercher...", info: "...", zero_records: "Aucun élément", no_data_text: "Aucun élément", loading_text: "Chargement...",
            pagination: { first: <FirstPageIcon />, previous: <ChevronLeftIcon />, next: <ChevronRightIcon />, last: <LastPageIcon /> } }
    };

    function clearComponentState() {
        props.idChanged(""); props.libelleChanged(""); props.descriptionChanged("");
        props.habilitationsChanged(""); props.selectedItemChanged({});
    }

    const renderHabSelect = (value, onChange) => {
        const selected = Array.isArray(value) ? value : [];
        const selectedOptions = HAB_OPTIONS.filter(o => selected.includes(o.value));
        return (
            <Select
                isMulti
                options={HAB_OPTIONS}
                value={selectedOptions}
                onChange={(opts) => onChange((opts || []).map(o => o.value))}
                closeMenuOnSelect={false}
                placeholder="Sélectionner les habilitations"
                noOptionsMessage={() => "Aucune habilitation"}
                components={{ Option: HabOption, MultiValue: HabMultiValue }}
                styles={habSelectStyles}
                menuPortalTarget={document.body}
            />
        );
    };

    const addFields = [
        { key: "libelle", label: "Intitulé du poste", required: true, fullWidth: false, placeholder: "Ex: Directeur Général, RA..." },
        { key: "description", label: "Description", type: "textarea", fullWidth: true, placeholder: "Description du poste" },
        { key: "habilitations", label: "Habilitations", required: true, fullWidth: true, render: renderHabSelect },
    ];
    const handleModalSubmit = async (items) => {
        setAddLoading(true);
        try {
            for (const item of items) {
                const habs = Array.isArray(item.habilitations) ? item.habilitations.join(',') : (item.habilitations || "");
                await ajout({ libelle: item.libelle, description: item.description, habilitations: habs }, props);
            }
        } finally { setAddLoading(false); setAddModalOpen(false); }
    };

    const handleEditClick = (sp) => {
        props.idChanged(sp.id); props.selectedItemChanged(sp);
        setEditForm({ libelle: sp.libelle || "", description: sp.description || "", habilitations: toHabArray(sp.habilitations) });
        setEditErrors({}); setEditModalOpen(true);
    };
    const handleEditFormSubmit = () => {
        const errs = {};
        if (!editForm.libelle.trim()) errs.libelle = "Champ requis";
        if (editForm.habilitations.length === 0) errs.habilitations = "Champ requis";
        if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
        setEditLoading(true); props.etat2Changed(true);
        modification({ id: props.id, libelle: editForm.libelle, description: editForm.description, habilitations: editForm.habilitations.join(',') }, props)
            .then(() => { setEditModalOpen(false); clearComponentState(); })
            .finally(() => { setEditLoading(false); props.etat2Changed(false); });
    };
    const handleDelete = () => {
        const sp = deleteConfirm.item; if (!sp) return;
        setDeleteConfirm(p => ({ ...p, loading: true })); props.etat3Changed(true);
        suppression(props, sp).then(() => { clearComponentState(); setDeleteConfirm({ open: false, item: null, loading: false }); }).finally(() => { props.etat3Changed(false); });
    };

    const renderHabChips = (sp) => {
        const habs = toHabArray(sp.habilitations);
        return (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {habs.map(h => <Chip key={h} label={h} size="small" sx={{ backgroundColor: getHabilitationColor(h), color: "#fff", fontWeight: 700, fontSize: "0.7rem" }} />)}
            </Box>
        );
    };

    return (
        <>
            <div className="card-panel">
                <AddDuplicateFormModal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Ajouter des postes" fields={addFields} onSubmit={handleModalSubmit} loading={addLoading} maxWidth="md" addLabel="Ajouter un autre poste" />

                <Dialog open={editModalOpen} onClose={() => { if (!editLoading) { setEditModalOpen(false); clearComponentState(); } }} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: "linear-gradient(135deg, var(--gpr-primary-dark) 0%, var(--gpr-primary) 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><EditIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                            <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Modifier le poste</div><div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 2 }}>{editForm.libelle}</div></div>
                        </div>
                        <IconButton onClick={() => { if (!editLoading) { setEditModalOpen(false); clearComponentState(); } }} disabled={editLoading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                    </div>
                    <DialogContent sx={{ p: 3 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Intitulé <span style={{ color: "#ef4444" }}>*</span></label>
                                    <input value={editForm.libelle} onChange={(e) => { setEditForm(p => ({ ...p, libelle: e.target.value })); setEditErrors(p => ({ ...p, libelle: "" })); }} placeholder="Ex: Directeur Général"
                                        style={{ width: "100%", boxSizing: "border-box", border: editErrors.libelle ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "10.5px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", height: 40 }}
                                        onFocus={(e) => { if (!editErrors.libelle) e.target.style.borderColor = "#3b3fd8"; }} onBlur={(e) => { if (!editErrors.libelle) e.target.style.borderColor = "#e2e8f0"; }} />
                                    {editErrors.libelle && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.libelle}</div>}
                                </div>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Description</label>
                                    <textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3}
                                        style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "9px 12px", fontSize: 13, outline: "none", background: "#fff", color: "#1e293b", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit" }}
                                        onFocus={(e) => { e.target.style.borderColor = "#3b3fd8"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                                </div>
                            </div>
                            <div>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                                        Habilitations
                                        <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>
                                        {editForm.habilitations.length > 0 && (
                                            <span style={{ marginLeft: 8, background: "var(--gpr-primary)", color: "#fff", borderRadius: 20, padding: "1px 8px", fontSize: 11 }}>
                                                {editForm.habilitations.length} sélectionnée{editForm.habilitations.length > 1 ? "s" : ""}
                                            </span>
                                        )}
                                    </label>
                                    {editForm.habilitations.length > 0 && (
                                        <span onClick={() => setEditForm(p => ({ ...p, habilitations: [] }))}
                                            style={{ fontSize: 11, color: "#ef4444", cursor: "pointer", fontWeight: 600 }}>
                                            Tout désélectionner
                                        </span>
                                    )}
                                </Box>
                                {renderHabSelect(editForm.habilitations, (val) => { setEditForm(p => ({ ...p, habilitations: val })); setEditErrors(p => ({ ...p, habilitations: "" })); })}
                                {editErrors.habilitations && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{editErrors.habilitations}</div>}
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
                            <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Supprimer le poste</div><div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>{deleteConfirm.item?.libelle}</div></div>
                        </div>
                        <IconButton onClick={() => setDeleteConfirm({ open: false, item: null, loading: false })} disabled={deleteConfirm.loading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                    </div>
                    <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}><p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>Confirmez-vous la suppression de <strong style={{ color: "#0f172a" }}>{deleteConfirm.item?.libelle}</strong> ? Cette action est irréversible.</p></DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", gap: 10 }}>
                        <BlockButton disabled={deleteConfirm.loading}><Button onClick={() => setDeleteConfirm({ open: false, item: null, loading: false })} disabled={deleteConfirm.loading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button></BlockButton>
                        <BlockButton disabled={deleteConfirm.loading}><LoadingButton onClick={handleDelete} loading={deleteConfirm.loading} loadingPosition="start" startIcon={<DeleteIcon style={{ fontSize: 15 }} />} variant="contained" color="error" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #991b1b, #ef4444)", "&:hover": { background: "linear-gradient(135deg, #7f1d1d, #dc2626)" }, "&.Mui-disabled": { opacity: 0.6 } }}>Supprimer</LoadingButton></BlockButton>
                    </DialogActions>
                </Dialog>

                <ConfigKPIBar items={props.items} kpis={KPI_CONFIG} />
                <Box sx={{ display: "flex", gap: 1, mb: 2.5, alignItems: "center", flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flex: 1 }}>
                        {CHIPS_CONFIG.map(chip => (
                            <Chip key={chip.value} label={chip.label} onClick={() => setActiveChip(chip.value)}
                                color={activeChip === chip.value ? "primary" : "default"}
                                variant={activeChip === chip.value ? "filled" : "outlined"} size="small"
                                sx={{ borderRadius: "8px", fontWeight: activeChip === chip.value ? 700 : 400, fontSize: "0.78rem",
                                    ...(chip.value !== "ALL" && activeChip !== chip.value ? { borderColor: getHabilitationColor(chip.value), color: getHabilitationColor(chip.value) } : {})
                                }} />
                        ))}
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        <ViewModeToggle value={viewMode} onChange={setViewMode} />
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "nowrap", gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A", flexShrink: 0 }}>Liste des postes</Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                        <Tooltip title="Exporter en PDF"><IconButton onClick={() => handlePrint(pdfConfig, pdfColumns, props.items, 0)} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#ef4444", "&:hover": { background: "#fee2e2" } }} size="small"><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Exporter en Excel"><IconButton onClick={() => table2XLSX("Liste_des_postes" + today().replaceAll("/", ""), "app-postes")} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#16a34a", "&:hover": { background: "#dcfce7" } }} size="small"><GridOn fontSize="small" /></IconButton></Tooltip>
                        <LoadingButton onClick={() => setAddModalOpen(true)} variant="contained" startIcon={<AddIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, fontSize: "0.82rem", px: 2.5, whiteSpace: "nowrap" }}>Ajouter</LoadingButton>
                    </Box>
                </Box>
                {viewMode === "list" ? (
                    <ConfigTable items={filteredItems} exportClassName="app-postes" columns={[
                        { id: "libelle",       label: "Intitulé",      sortable: true,  minWidth: 160 },
                        { id: "description",   label: "Description",    sortable: true,  minWidth: 200 },
                        { id: "habilitations", label: "Habilitations",  sortable: false, minWidth: 220, render: renderHabChips },
                        { id: "actions",       label: "Actions",        sortable: false, minWidth: 110, render: (sp) => (
                            <div style={{ display: "flex", gap: "5px" }}>
                                <Tooltip title="Modifier"><IconButton onClick={() => handleEditClick(sp)} color="primary"><EditIcon /></IconButton></Tooltip>
                                <Tooltip title="Supprimer"><IconButton onClick={() => setDeleteConfirm({ open: true, item: sp, loading: false })} color="error"><DeleteIcon /></IconButton></Tooltip>
                            </div>
                        )},
                    ]} searchFields={["libelle", "description", "habilitations"]} defaultSort="libelle" />
                ) : (
                    <ConfigCardView items={filteredItems} titleField="libelle" subtitleField="description"
                        searchFields={["libelle", "description", "habilitations"]}
                        onEdit={(sp) => handleEditClick(sp)}
                        onDelete={(sp) => setDeleteConfirm({ open: true, item: sp, loading: false })}
                        extraFields={[{ label: "Habilitations", render: (sp) => {
                            const habs = toHabArray(sp.habilitations);
                            return (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                                    {habs.map(h => <Chip key={h} label={h} size="small" sx={{ backgroundColor: getHabilitationColor(h), color: "#fff", fontWeight: 700, fontSize: "0.7rem" }} />)}
                                </Box>
                            );
                        }}]}
                    />
                )}
            </div>
        </>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.poste.isLoading, id: state.poste.id, libelle: state.poste.libelle,
    habilitations: state.poste.habilitations, description: state.poste.description,
    items: state.poste.items, selectedItem: state.poste.selectedItem,
    errors: state.poste.poste_errors, etat: state.poste.etat, etat2: state.poste.etat2, etat3: state.poste.etat3,
});
const mapDispatchToProps = (dispatch) => ({
    posteErrors: (err) => dispatch(posteErrors(err)),
    idChanged: (id) => dispatch(idChanged(id)),
    libelleChanged: (l) => dispatch(libelleChanged(l)),
    descriptionChanged: (d) => dispatch(descriptionChanged(d)),
    itemsChanged: (i) => dispatch(itemsChanged(i)),
    habilitationsChanged: (h) => dispatch(habilitationsChanged(h)),
    cardChanged: (c) => dispatch(cardChanged(c)),
    selectedItemChanged: (s) => dispatch(selectedItemChanged(s)),
    etatChanged: (e) => dispatch(etatChanged(e)),
    etat2Changed: (e) => dispatch(etat2Changed(e)),
    etat3Changed: (e) => dispatch(etat3Changed(e)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Postes);
