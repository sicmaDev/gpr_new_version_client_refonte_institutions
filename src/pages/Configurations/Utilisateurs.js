import React, { useEffect, useState, useMemo } from "react";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
    Tooltip, IconButton, Box, Typography, Dialog, DialogContent, DialogActions,
    Button, Chip, FormControl, Select as MuiSelect, MenuItem, ListSubheader, InputAdornment, OutlinedInput
} from "@mui/material";
import { PictureAsPdf, GridOn, Block, TaskAlt } from "@mui/icons-material";
import {
    userErrors, additionalRoleChanged, emailChanged, nameChanged, codeChanged,
    idChanged, posteChanged, unitChanged, phoneChanged, passwordAgainChanged,
    passwordChanged, itemsChanged, selectedItemChanged, posteLibelleChanged,
    unitLibelleChanged, etat3Changed, etat2Changed, etatChanged
} from "../../redux/actions/Configurations/UtilisateursActions";
import { isValidMdp, isValidPhone, today, groupBy, loadItemFromLocalStorage } from "../../Utils/utils";
import { connect } from "react-redux";
import { ajout, all, disabled, modification, suppression } from "../../apis/Configurations/UtilisateursApi";
import { handlePrint } from "../../Utils/tables";
import { table2XLSX } from "../../Utils/tabletoexcel";
import { licenseInfo } from "../../apis/LoginApi";
import { notify } from "../../Utils/alert";
import { LoadingButton } from "@mui/lab";
import BlockButton from "../../components/shared/BlockButton";
import AddDuplicateFormModal from "../../components/shared/AddDuplicateFormModal";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { KTApp } from "../../Utils/blockui";
import ConfigKPIBar from "../../components/shared/ConfigKPIBar";
import ConfigTable from "../../components/shared/ConfigTable";
import ConfigCardView from "../../components/shared/ConfigCardView";

import ViewModeToggle from "../../components/shared/ViewModeToggle";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

const ROLE_OPTIONS = [
    { label: "Directeur / Directrice (Exécutif, Général)", value: "DE" },
    { label: "Pilote", value: "PILOTE" },
    { label: "Aucun", value: "MOLDUE" },
];

// Badges de rôle mis en évidence dans la liste des utilisateurs
const getRoleBadges = (u) => {
    const badges = [];
    if (u.additionalRole === "DE") badges.push({ label: "Directeur", bg: "#EDE9FE", color: "#6D28D9" });
    else if (u.additionalRole === "PILOTE") badges.push({ label: "Pilote", bg: "#DBEAFE", color: "#1D4ED8" });
    if (u.ra) badges.push({ label: "Resp. d'agence", bg: "#FEF3C7", color: "#B45309" });
    if (badges.length === 0) badges.push({ label: "Utilisateur", bg: "#F1F5F9", color: "#64748B" });
    return badges;
};
const CA_OPTIONS = [
    { label: "Sélectionnez votre réponse", value: "" },
    { label: "Non", value: false },
    { label: "Oui", value: true },
];

const EMPTY_FORM = { name: "", email: "", phone: "", pass: "", pass_again: "", poste: "", posteLibelle: "", unit: "", unitLibelle: "", additionalRole: "", ca: "" };

const passInputStyle = { width: "100%", boxSizing: "border-box", border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "10.5px 14px", paddingRight: 40, fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", height: 40 };

const PasswordPairInput = ({ value, onChange }) => {
    const pass = value?.pass || "";
    const passAgain = value?.passAgain || "";
    const [showPass, setShowPass] = useState(false);
    const [showPassAgain, setShowPassAgain] = useState(false);

    const generate = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const number = "0123456789";
        const speciaux = "@_%+-";
        let retVal = "";
        for (let i = 0; i < 8; ++i) retVal += charset.charAt(Math.floor(Math.random() * charset.length));
        retVal = retVal.slice(0, 6) + number[Math.floor(Math.random() * 8)] + speciaux[Math.floor(Math.random() * 5)];
        onChange({ pass: retVal, passAgain: retVal });
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={pass} onChange={(e) => onChange({ pass: e.target.value, passAgain })} placeholder="Mot de passe" style={passInputStyle} />
                <span onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 12, top: 12, cursor: "pointer", color: "#94a3b8" }}>
                    {showPass ? <VisibilityOffIcon style={{ fontSize: 18 }} /> : <VisibilityIcon style={{ fontSize: 18 }} />}
                </span>
                <span onClick={generate} style={{ display: "block", marginTop: 4, fontSize: 12, color: "var(--gpr-primary, #005081)", cursor: "pointer", fontWeight: 600 }}>Générer un mot de passe</span>
            </div>
            <div style={{ position: "relative" }}>
                <input type={showPassAgain ? "text" : "password"} value={passAgain} onChange={(e) => onChange({ pass, passAgain: e.target.value })} placeholder="Confirmer le mot de passe" style={passInputStyle} />
                <span onClick={() => setShowPassAgain(v => !v)} style={{ position: "absolute", right: 12, top: 12, cursor: "pointer", color: "#94a3b8" }}>
                    {showPassAgain ? <VisibilityOffIcon style={{ fontSize: 18 }} /> : <VisibilityIcon style={{ fontSize: 18 }} />}
                </span>
            </div>
        </div>
    );
};

const Utilisateurs = (props) => {
    const [isLoading, setIsLoading]             = useState(false);
    const [max, setMax]                         = useState(undefined);
    const [addModalOpen, setAddModalOpen]       = useState(false);
    const [addLoading, setAddLoading]           = useState(false);
    const [editModalOpen, setEditModalOpen]     = useState(false);
    const [editLoading, setEditLoading]         = useState(false);
    const [editForm, setEditForm]               = useState(EMPTY_FORM);
    const [editErrors, setEditErrors]           = useState({});
    const [showEditPass, setShowEditPass]       = useState(false);
    const [showEditPass1, setShowEditPass1]     = useState(false);
    const [deleteConfirm, setDeleteConfirm]     = useState({ open: false, item: null, loading: false });
    const [disableConfirm, setDisableConfirm]   = useState({ open: false, item: null, action: null, loading: false });
    const [viewMode, setViewMode]               = useState("list");
    const [activeChip, setActiveChip]           = useState("ALL");

    let titles = [], units = [];
    try { titles = JSON.parse(loadItemFromLocalStorage('app-postes')) || []; } catch (e) { titles = []; }
    try { units = JSON.parse(loadItemFromLocalStorage('app-ps')) || []; } catch (e) { units = []; }

    const titleOptions  = titles.map(t => ({ label: t.libelle, value: t.id }));
    const unitsGrouped  = groupBy(units, "type");
    const unitOptionsGrouped = [
        ...(unitsGrouped["DIRECTION"] ? [{ groupLabel: "Direction", options: (unitsGrouped["DIRECTION"] || []).map(u => ({ label: u.libelle, value: u.id })) }] : []),
        ...(unitsGrouped["AGENCE"]    ? [{ groupLabel: "Agence",    options: (unitsGrouped["AGENCE"]    || []).map(u => ({ label: u.libelle, value: u.id })) }] : []),
        ...(unitsGrouped["GUICHET"]   ? [{ groupLabel: "Guichet",   options: (unitsGrouped["GUICHET"]   || []).map(u => ({ label: u.libelle, value: u.id })) }] : []),
    ];
    const allUnitOptions = unitOptionsGrouped.flatMap(g => g.options);

    const users = (() => { try { return JSON.parse(loadItemFromLocalStorage("app-users")) || []; } catch (e) { return []; } })();
    const nba = users.length;

    useEffect(() => {
        KTApp.blockPage({ overlayColor: "#000000", type: "v2", state: "danger", message: "En cours de chargement..." });
        setIsLoading(true);
        all(props).then(() => {}).finally(() => { setIsLoading(false); KTApp.unblockPage(); });
        window.$('.tooltipped').tooltip();
        licenseInfo().then(r => setMax(r.maxPoste)).catch(() => {});
        return clearComponentState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const KPI_CONFIG = [
        { key: "total",  label: "Total utilisateurs", icon: PeopleAltIcon,      iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true },
        { key: "actif",  label: "Actifs",              icon: PeopleAltIcon,      iconBg: "#D1FAE5", iconColor: "#065F46", borderColor: "#10B981", filter: (u) => !u.deleted },
        { key: "desact", label: "Désactivés",          icon: PersonOffIcon,      iconBg: "#FEE2E2", iconColor: "#B91C1C", borderColor: "#EF4444", filter: (u) => u.deleted && !u.rattached },
        { key: "attente",label: "En attente",          icon: HourglassEmptyIcon, iconBg: "#FEF3C7", iconColor: "#B45309", borderColor: "#F59E0B", filter: (u) => u.deleted && u.rattached },
        ...(max !== undefined ? [{
            key: "quota", label: "Comptes créés / autorisés", icon: WorkspacePremiumIcon,
            iconBg: nba >= max ? "#FEE2E2" : "#EDE9FE", iconColor: nba >= max ? "#B91C1C" : "#6D28D9",
            borderColor: nba >= max ? "#EF4444" : "#8B5CF6",
            value: `${nba} / ${max}`, filter: () => true,
        }] : []),
    ];
    const CHIPS_CONFIG = [
        { value: "ALL",     label: "Tous",        filter: () => true },
        { value: "ACTIF",   label: "Actifs",      filter: (u) => !u.deleted },
        { value: "DESACT",  label: "Désactivés",  filter: (u) => u.deleted && !u.rattached },
        { value: "ATTENTE", label: "En attente",  filter: (u) => u.deleted && u.rattached },
    ];
    const filteredUsers = useMemo(() => {
        const c = CHIPS_CONFIG.find(x => x.value === activeChip);
        const base = c ? props.items.filter(c.filter) : props.items;
        return [...base].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.items, activeChip]);

    const pdfConfig = {
        page_size: 15, filename: "Utilisateurs",
        language: { length_menu: "Afficher _MENU_ éléments", filter: "Rechercher...", info: "...", zero_records: "Aucun élément", no_data_text: "Aucun élément", loading_text: "Chargement...",
            pagination: { first: <FirstPageIcon />, previous: <ChevronLeftIcon />, next: <ChevronRightIcon />, last: <LastPageIcon /> } }
    };
    const pdfColumns = [{ key: "Identité", text: "Identité" }, { key: "Poste", text: "Poste" }, { key: "Contacts", text: "Contacts" }, { key: "Ajouté le", text: "Ajouté le" }];

    function clearComponentState() {
        props.idChanged(""); props.codeChanged(""); props.nameChanged(""); props.emailChanged(""); props.phoneChanged("");
        props.posteChanged(""); props.unitChanged(""); props.additionalRoleChanged(""); props.passwordChanged(""); props.passwordAgainChanged("");
        props.selectedItemChanged({});
    }

    const generateCode = (setter) => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const number = "0123456789";
        const speciaux = "@_%+-";
        let retVal = "";
        for (let i = 0; i < 8; ++i) retVal += charset.charAt(Math.floor(Math.random() * charset.length));
        retVal = retVal.slice(0, 6) + number[Math.floor(Math.random() * 8)] + speciaux[Math.floor(Math.random() * 5)];
        setter(p => ({ ...p, pass: retVal, pass_again: retVal }));
    };

    const validateForm = (form, isEdit = false) => {
        const errs = {};
        if (!form.name.trim()) errs.name = "Champ requis";
        if (!form.poste) errs.poste = "Champ requis";
        if (!form.unit) errs.unit = "Champ requis";
        if (!form.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(form.email)) errs.email = "Email invalide";
        if (!form.phone || !isValidPhone(form.phone)) errs.phone = "Téléphone invalide";
        if (!isEdit || form.pass) {
            if (!isEdit && !form.pass) errs.pass = "Champ requis";
            if (form.pass && !isValidMdp(form.pass)) errs.pass = "Mot de passe faible (chiffre + symbole requis)";
            if (form.pass !== form.pass_again) { errs.pass = "Les mots de passe ne correspondent pas"; errs.pass_again = "Les mots de passe ne correspondent pas"; }
        }
        return errs;
    };

    const addFields = [
        { key: "name", label: "Nom et prénom", required: true, fullWidth: true, placeholder: "Ex: Jean Dupont" },
        { key: "email", label: "Email", required: true, placeholder: "exemple@sicmagroup.com" },
        { key: "phone", label: "Téléphone", required: true, placeholder: "Ex: +228 90 00 00 00" },
        {
            key: "poste", label: "Poste", required: true,
            render: (value, onChange) => (
                <MuiSelect value={value || ""} onChange={(e) => onChange(e.target.value)} displayEmpty fullWidth sx={{ borderRadius: 2, fontSize: 14 }}>
                    <MenuItem value="" disabled>Sélectionner le poste</MenuItem>
                    {titleOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </MuiSelect>
            ),
        },
        {
            key: "unit", label: "Unité organisationnelle", required: true,
            render: (value, onChange) => (
                <MuiSelect value={value || ""} onChange={(e) => onChange(e.target.value)} displayEmpty fullWidth sx={{ borderRadius: 2, fontSize: 14 }}>
                    <MenuItem value="" disabled>Sélectionner l'unité organisationnelle</MenuItem>
                    {unitOptionsGrouped.map(group => [
                        <ListSubheader key={`hdr-${group.label}`}>{group.label}</ListSubheader>,
                        ...group.options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>),
                    ])}
                </MuiSelect>
            ),
        },
        {
            key: "ca", label: "Gérant", required: false,
            render: (value, onChange) => (
                <MuiSelect value={value === "" || value === undefined ? "" : value} onChange={(e) => onChange(e.target.value)} displayEmpty fullWidth sx={{ borderRadius: 2, fontSize: 14 }}>
                    <MenuItem value="">Aucun</MenuItem>
                    {CA_OPTIONS.map(o => <MenuItem key={String(o.value)} value={o.value}>{o.label}</MenuItem>)}
                </MuiSelect>
            ),
        },
        {
            key: "additionalRole", label: "Privilège", required: false,
            render: (value, onChange) => (
                <MuiSelect value={value || ""} onChange={(e) => onChange(e.target.value)} displayEmpty fullWidth sx={{ borderRadius: 2, fontSize: 14 }}>
                    <MenuItem value="">Sélectionnez votre réponse</MenuItem>
                    {ROLE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </MuiSelect>
            ),
        },
        {
            key: "pass", label: "Mot de passe", required: true, fullWidth: true,
            render: (value, onChange) => <PasswordPairInput value={value} onChange={onChange} />,
        },
    ];

    const handleModalSubmit = (items) => {
        for (const it of items) {
            const pass = it.pass?.pass || "";
            const passAgain = it.pass?.passAgain || "";
            if (!isValidPhone(it.phone)) { notify(`Erreur - Téléphone invalide pour ${it.name}`, "error"); return; }
            if (!pass || !isValidMdp(pass)) { notify(`Erreur - Mot de passe faible pour ${it.name} (chiffre + symbole requis)`, "error"); return; }
            if (pass !== passAgain) { notify(`Erreur - Les mots de passe ne correspondent pas pour ${it.name}`, "error"); return; }
        }
        setAddLoading(true); props.etatChanged(true);
        const chain = items.reduce((p, it) => p.then(() =>
            ajout({ firstAndLastName: it.name, email: it.email, tel: it.phone, posteId: it.poste, servicePointId: it.unit, additionalRole: it.additionalRole, password: it.pass.pass, ra: it.ca }, props)
        ), Promise.resolve());
        chain
            .then(() => { setAddModalOpen(false); clearComponentState(); })
            .finally(() => { setAddLoading(false); props.etatChanged(false); });
    };

    const handleEditClick = (sp) => {
        props.idChanged(sp.id); props.selectedItemChanged(sp);
        setEditForm({ name: sp.firstAndLastName || "", email: sp.email || "", phone: sp.tel || "", pass: "", pass_again: "", poste: sp.posteDto?.id || "", posteLibelle: sp.posteDto?.libelle || "", unit: sp.servicePointDto?.id || "", unitLibelle: sp.servicePointDto?.libelle || "", additionalRole: sp.additionalRole || "", ca: sp.ra === true ? true : sp.ra === false ? false : "" });
        setEditErrors({}); setShowEditPass(false); setShowEditPass1(false); setEditModalOpen(true);
    };
    const handleEditSubmit = () => {
        const errs = validateForm(editForm, true);
        if (Object.keys(errs).length) { setEditErrors(errs); return; }
        setEditLoading(true); props.etat2Changed(true);
        const payload = { id: props.id, firstAndLastName: editForm.name, email: editForm.email, tel: editForm.phone, posteId: editForm.poste, servicePointId: editForm.unit, additionalRole: editForm.additionalRole, ra: editForm.ca };
        if (editForm.pass) payload.password = editForm.pass;
        modification(payload, props)
            .then(() => { setEditModalOpen(false); setEditForm(EMPTY_FORM); setEditErrors({}); clearComponentState(); })
            .finally(() => { setEditLoading(false); props.etat2Changed(false); });
    };

    const handleDisable = () => {
        const { item, action } = disableConfirm;
        if (!item) return;
        setDisableConfirm(p => ({ ...p, loading: true }));
        if (action === "delete") {
            props.etat3Changed(true);
            suppression({ id: item.id, firstAndLastName: item.firstAndLastName, posteId: item.posteDto.id, servicePointId: item.servicePointDto.id, email: item.email, tel: item.tel, additionalRole: item.additionalRole }, props)
                .then(() => { all(props); clearComponentState(); setDisableConfirm({ open: false, item: null, action: null, loading: false }); })
                .finally(() => { props.etat3Changed(false); });
        } else {
            const isDisabling = action === "disable";
            disabled(props, item.id, isDisabling)
                .then(() => { notify(`Bravo - Compte ${isDisabling ? "désactivé" : "activé"} avec succès`, "success"); all(props); setDisableConfirm({ open: false, item: null, action: null, loading: false }); clearComponentState(); })
                .catch(() => { notify(`Erreur - Opération échouée`, "error"); setDisableConfirm(p => ({ ...p, loading: false })); });
        }
    };

    const handleDirectActivate = (e, user) => {
        e.preventDefault(); e.stopPropagation();
        disabled(props, user.id, false)
            .then(() => { notify("Bravo - Compte activé avec succès", "success"); all(props); clearComponentState(); })
            .catch(() => notify("Erreur - Activation échouée", "error"));
    };

    const handleDelete = () => {
        const sp = deleteConfirm.item; if (!sp) return;
        setDeleteConfirm(p => ({ ...p, loading: true })); props.etat3Changed(true);
        suppression({ id: sp.id, firstAndLastName: sp.firstAndLastName, posteId: sp.posteDto.id, servicePointId: sp.servicePointDto.id, email: sp.email, tel: sp.tel, additionalRole: sp.additionalRole }, props)
            .then(() => { all(props); clearComponentState(); setDeleteConfirm({ open: false, item: null, loading: false }); })
            .finally(() => { props.etat3Changed(false); });
    };

    const disableModalGradient = disableConfirm.action === "disable"
        ? "linear-gradient(135deg, #b45309, #f59e0b)"
        : disableConfirm.action === "activate" || disableConfirm.action === "approve"
            ? "linear-gradient(135deg, #065f46, #10b981)"
            : "linear-gradient(135deg, #991b1b, #ef4444)";
    const disableModalIcon = disableConfirm.action === "disable" ? <Block style={{ color: "#fff", fontSize: 20 }} />
        : disableConfirm.action === "activate" || disableConfirm.action === "approve" ? <TaskAlt style={{ color: "#fff", fontSize: 20 }} />
        : <DeleteIcon style={{ color: "#fff", fontSize: 20 }} />;
    const disableModalTitle = disableConfirm.action === "disable" ? "Désactiver l'utilisateur"
        : disableConfirm.action === "activate" ? "Activer l'utilisateur"
        : disableConfirm.action === "approve" ? "Approuver l'utilisateur"
        : "Rejeter / Supprimer le compte";
    const disableModalText = disableConfirm.action === "disable" ? "Voulez-vous vraiment désactiver ce compte ?"
        : disableConfirm.action === "activate" ? "Voulez-vous vraiment activer ce compte ?"
        : disableConfirm.action === "approve" ? "Voulez-vous vraiment approuver ce compte ?"
        : "Voulez-vous vraiment rejeter et supprimer ce compte ? Cette action est irréversible.";
    const disableModalConfirmLabel = disableConfirm.action === "disable" ? "Désactiver"
        : disableConfirm.action === "activate" ? "Activer"
        : disableConfirm.action === "approve" ? "Approuver"
        : "Rejeter";

    const inputStyle = (hasErr) => ({ width: "100%", boxSizing: "border-box", border: hasErr ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "10.5px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", height: 40, fontFamily: "inherit" });
    const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" };

    const renderUnitSelect = (form, setter, errors, setErrors) => (
        <FormControl fullWidth size="small" error={!!errors.unit}>
            <MuiSelect value={form.unit || ""} onChange={(e) => { const opt = allUnitOptions.find(o => o.value === e.target.value); setter(p => ({ ...p, unit: e.target.value, unitLibelle: opt?.label || "" })); setErrors(p => ({ ...p, unit: "" })); }} displayEmpty sx={{ borderRadius: 2, fontSize: 14 }}>
                <MenuItem value=""><em style={{ color: "#94a3b8" }}>Sélectionner l'unité organisationnelle</em></MenuItem>
                {unitOptionsGrouped.map(group => [
                    <ListSubheader key={group.groupLabel} sx={{ fontSize: 11, fontWeight: 800, color: "#64748b", lineHeight: "28px", background: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.5px" }}>{group.groupLabel}</ListSubheader>,
                    ...group.options.map(o => <MenuItem key={o.value} value={o.value} sx={{ pl: 3, fontSize: 14 }}>{o.label}</MenuItem>)
                ])}
            </MuiSelect>
        </FormControl>
    );

    const renderUserForm = (form, setter, errors, setErrors, isEdit = false, showPass, setShowPass, showPass1, setShowPass1) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                <div>
                    <label style={labelStyle}>Nom et Prénom(s) <span style={{ color: "#ef4444" }}>*</span></label>
                    <input value={form.name} onChange={(e) => { setter(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: "" })); }} placeholder="Ex: Jean Dupont" style={inputStyle(errors.name)} onFocus={(e) => { if (!errors.name) e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { if (!errors.name) e.target.style.borderColor = "#e2e8f0"; }} />
                    {errors.name && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.name}</div>}
                </div>
                <div>
                    <label style={labelStyle}>Adresse électronique <span style={{ color: "#ef4444" }}>*</span></label>
                    <input type="email" value={form.email} onChange={(e) => { setter(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: "" })); }} placeholder="Ex: jean@exemple.com" style={inputStyle(errors.email)} onFocus={(e) => { if (!errors.email) e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { if (!errors.email) e.target.style.borderColor = "#e2e8f0"; }} />
                    {errors.email && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.email}</div>}
                </div>
                <div>
                    <label style={labelStyle}>Téléphone <span style={{ color: "#ef4444" }}>*</span></label>
                    <input type="tel" value={form.phone} onChange={(e) => { setter(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: "" })); }} placeholder="Ex: 22890909090" style={inputStyle(errors.phone)} onFocus={(e) => { if (!errors.phone) e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { if (!errors.phone) e.target.style.borderColor = "#e2e8f0"; }} />
                    {errors.phone && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.phone}</div>}
                </div>
                <div>
                    <label style={labelStyle}>Poste <span style={{ color: "#ef4444" }}>*</span></label>
                    <FormControl fullWidth size="small" error={!!errors.poste}>
                        <MuiSelect value={form.poste || ""} onChange={(e) => { const opt = titleOptions.find(o => o.value === e.target.value); setter(p => ({ ...p, poste: e.target.value, posteLibelle: opt?.label || "" })); setErrors(p => ({ ...p, poste: "" })); }} displayEmpty sx={{ borderRadius: 2, fontSize: 14 }}>
                            <MenuItem value=""><em style={{ color: "#94a3b8" }}>Sélectionner le poste</em></MenuItem>
                            {titleOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                        </MuiSelect>
                    </FormControl>
                    {errors.poste && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.poste}</div>}
                </div>
                <div>
                    <label style={labelStyle}>Point de Service <span style={{ color: "#ef4444" }}>*</span></label>
                    {renderUnitSelect(form, setter, errors, setErrors)}
                    {errors.unit && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.unit}</div>}
                </div>
                <div>
                    <label style={labelStyle}>Est-il le gérant du point de service ?</label>
                    <FormControl fullWidth size="small">
                        <MuiSelect value={form.ca === "" ? "" : String(form.ca)} onChange={(e) => { const v = e.target.value === "true" ? true : e.target.value === "false" ? false : ""; setter(p => ({ ...p, ca: v })); }} displayEmpty sx={{ borderRadius: 2, fontSize: 14 }}>
                            <MenuItem value=""><em style={{ color: "#94a3b8" }}>Sélectionnez votre réponse</em></MenuItem>
                            <MenuItem value="false">Non</MenuItem>
                            <MenuItem value="true">Oui</MenuItem>
                        </MuiSelect>
                    </FormControl>
                </div>
                <div>
                    <label style={labelStyle}>Privilège Spécifique</label>
                    <FormControl fullWidth size="small">
                        <MuiSelect value={form.additionalRole || ""} onChange={(e) => setter(p => ({ ...p, additionalRole: e.target.value }))} displayEmpty sx={{ borderRadius: 2, fontSize: 14 }}>
                            <MenuItem value=""><em style={{ color: "#94a3b8" }}>Aucun</em></MenuItem>
                            {ROLE_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                        </MuiSelect>
                    </FormControl>
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                <div>
                    <label style={labelStyle}>
                        Mot de passe {!isEdit && <span style={{ color: "#ef4444" }}>*</span>}
                        {isEdit && <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 11, marginLeft: 4 }}>(laisser vide pour ne pas modifier)</span>}
                        <span style={{ color: "var(--gpr-primary, #005081)", cursor: "pointer", fontWeight: 500, fontSize: 11, marginLeft: 8, textTransform: "none" }} onClick={() => generateCode(setter)}>Générer</span>
                    </label>
                    <div style={{ position: "relative" }}>
                        <input type={showPass ? "text" : "password"} value={form.pass} onChange={(e) => { setter(p => ({ ...p, pass: e.target.value })); setErrors(p => ({ ...p, pass: "" })); }} placeholder={isEdit ? "Nouveau mot de passe (optionnel)" : "Mot de passe"} style={{ ...inputStyle(errors.pass), paddingRight: 40 }} onFocus={(e) => { if (!errors.pass) e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { if (!errors.pass) e.target.style.borderColor = "#e2e8f0"; }} />
                        <span onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#94a3b8" }}>{showPass ? <VisibilityOffIcon style={{ fontSize: 18 }} /> : <VisibilityIcon style={{ fontSize: 18 }} />}</span>
                    </div>
                    {errors.pass && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.pass}</div>}
                </div>
                <div>
                    <label style={labelStyle}>Confirmer le mot de passe</label>
                    <div style={{ position: "relative" }}>
                        <input type={showPass1 ? "text" : "password"} value={form.pass_again} onChange={(e) => { setter(p => ({ ...p, pass_again: e.target.value })); setErrors(p => ({ ...p, pass_again: "" })); }} placeholder="Répéter le mot de passe" style={{ ...inputStyle(errors.pass_again), paddingRight: 40 }} onFocus={(e) => { if (!errors.pass_again) e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { if (!errors.pass_again) e.target.style.borderColor = "#e2e8f0"; }} />
                        <span onClick={() => setShowPass1(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#94a3b8" }}>{showPass1 ? <VisibilityOffIcon style={{ fontSize: 18 }} /> : <VisibilityIcon style={{ fontSize: 18 }} />}</span>
                    </div>
                    {errors.pass_again && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.pass_again}</div>}
                </div>
            </div>
        </div>
    );

    const isAtLimit = max !== undefined && nba >= max;

    return (
        <>
            <div className="card-panel">

                {/* ADD MODAL */}
                <AddDuplicateFormModal
                    open={addModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    title="Ajouter des utilisateurs"
                    fields={addFields}
                    onSubmit={handleModalSubmit}
                    loading={addLoading}
                    maxWidth="md"
                    addLabel="Ajouter un autre utilisateur"
                />

                {/* EDIT MODAL */}
                <Dialog open={editModalOpen} onClose={() => { if (!editLoading) { setEditModalOpen(false); setEditForm(EMPTY_FORM); setEditErrors({}); clearComponentState(); } }} fullWidth maxWidth="md" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: "linear-gradient(135deg, var(--gpr-primary-dark) 0%, var(--gpr-primary) 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><EditIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                            <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Modifier l'utilisateur</div><div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 2 }}>{editForm.name}</div></div>
                        </div>
                        <IconButton onClick={() => { setEditModalOpen(false); setEditForm(EMPTY_FORM); setEditErrors({}); clearComponentState(); }} disabled={editLoading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                    </div>
                    <DialogContent sx={{ p: 3 }}>
                        {renderUserForm(editForm, setEditForm, editErrors, setEditErrors, true, showEditPass, setShowEditPass, showEditPass1, setShowEditPass1)}
                    </DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                        <BlockButton disabled={editLoading}><Button onClick={() => { setEditModalOpen(false); setEditForm(EMPTY_FORM); setEditErrors({}); clearComponentState(); }} disabled={editLoading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button></BlockButton>
                        <BlockButton disabled={editLoading}><LoadingButton onClick={handleEditSubmit} loading={editLoading} loadingPosition="start" startIcon={<SaveIcon style={{ fontSize: 15 }} />} variant="contained" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "var(--gpr-primary, #005081)", "&:hover": { background: "var(--gpr-primary-dark, #003d63)" }, "&.Mui-disabled": { opacity: 0.6 } }}>Modifier</LoadingButton></BlockButton>
                    </DialogActions>
                </Dialog>

                {/* DISABLE / ACTIVATE MODAL */}
                <Dialog open={disableConfirm.open} onClose={() => { if (!disableConfirm.loading) setDisableConfirm({ open: false, item: null, action: null, loading: false }); }} maxWidth="xs" fullWidth PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: disableModalGradient, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>{disableModalIcon}</div>
                            <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{disableModalTitle}</div><div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>{disableConfirm.item?.firstAndLastName}</div></div>
                        </div>
                        <IconButton onClick={() => setDisableConfirm({ open: false, item: null, action: null, loading: false })} disabled={disableConfirm.loading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                    </div>
                    <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}><p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{disableModalText}</p></DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", gap: 10 }}>
                        <Button onClick={() => setDisableConfirm({ open: false, item: null, action: null, loading: false })} disabled={disableConfirm.loading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button>
                        <LoadingButton onClick={handleDisable} loading={disableConfirm.loading} loadingPosition="start" startIcon={disableModalIcon} variant="contained" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: disableModalGradient, "&.Mui-disabled": { opacity: 0.6 } }}>{disableModalConfirmLabel}</LoadingButton>
                    </DialogActions>
                </Dialog>

                {/* DELETE MODAL */}
                <Dialog open={deleteConfirm.open} onClose={() => { if (!deleteConfirm.loading) setDeleteConfirm({ open: false, item: null, loading: false }); }} maxWidth="xs" fullWidth PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                    <div style={{ background: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><DeleteIcon style={{ color: "#fff", fontSize: 20 }} /></div>
                            <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Supprimer l'utilisateur</div><div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>{deleteConfirm.item?.firstAndLastName}</div></div>
                        </div>
                        <IconButton onClick={() => setDeleteConfirm({ open: false, item: null, loading: false })} disabled={deleteConfirm.loading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                    </div>
                    <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}><p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>Confirmez-vous la suppression de <strong style={{ color: "#0f172a" }}>{deleteConfirm.item?.firstAndLastName}</strong> ? Cette action est irréversible.</p></DialogContent>
                    <DialogActions style={{ padding: "12px 20px 16px", gap: 10 }}>
                        <Button onClick={() => setDeleteConfirm({ open: false, item: null, loading: false })} disabled={deleteConfirm.loading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button>
                        <LoadingButton onClick={handleDelete} loading={deleteConfirm.loading} loadingPosition="start" startIcon={<DeleteIcon style={{ fontSize: 15 }} />} variant="contained" color="error" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #991b1b, #ef4444)", "&:hover": { background: "linear-gradient(135deg, #7f1d1d, #dc2626)" }, "&.Mui-disabled": { opacity: 0.6 } }}>Supprimer</LoadingButton>
                    </DialogActions>
                </Dialog>

                <ConfigKPIBar items={props.items} kpis={KPI_CONFIG} />
                <Box sx={{ display: "flex", gap: 1, mb: 2.5, alignItems: "center", flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flex: 1 }}>
                        {CHIPS_CONFIG.map(chip => (<Chip key={chip.value} label={chip.label} onClick={() => setActiveChip(chip.value)} color={activeChip === chip.value ? "primary" : "default"} variant={activeChip === chip.value ? "filled" : "outlined"} size="small" sx={{ borderRadius: "8px", fontWeight: activeChip === chip.value ? 700 : 400, fontSize: "0.78rem" }} />))}
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        <ViewModeToggle value={viewMode} onChange={setViewMode} />
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "nowrap", gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A", flexShrink: 0 }}>Liste des utilisateurs</Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                        <Tooltip title="Exporter en PDF"><IconButton onClick={() => { const pi = props.items.map(u => { let role = ""; if (u.additionalRole === "DE") role = "Directeur"; else if (u.additionalRole === "PILOTE") role = "Pilote"; const ra = u.ra ? "Responsable d'Agence" : ""; const d = u.createdAt ? new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "2-digit" }).format(new Date(u.createdAt)) : ""; return { "Identité": `${u.code||""} ${u.firstAndLastName||""}`, "Poste": [u.posteDto?.libelle||"-", u.servicePointDto?.libelle||"-", role, ra].filter(Boolean).join(" / "), "Contacts": `${u.email||""} / ${u.tel||""}`, "Ajouté le": d }; }); handlePrint(pdfConfig, pdfColumns, pi, 0); }} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#ef4444", "&:hover": { background: "#fee2e2" } }} size="small"><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Exporter en Excel"><IconButton onClick={() => table2XLSX("Liste_des_utilisateurs" + today().replaceAll("/", ""), "app-users")} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#16a34a", "&:hover": { background: "#dcfce7" } }} size="small"><GridOn fontSize="small" /></IconButton></Tooltip>
                        {isAtLimit ? (
                            <Tooltip title="Nombre maximum de comptes atteint. Contactez support.gpr@sicmagroup.com pour mettre à niveau.">
                                <span><LoadingButton disabled variant="contained" startIcon={<AddIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, fontSize: "0.82rem", px: 2.5, whiteSpace: "nowrap" }}>Ajouter</LoadingButton></span>
                            </Tooltip>
                        ) : (
                            <LoadingButton onClick={() => setAddModalOpen(true)} variant="contained" startIcon={<AddIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, background: "var(--gpr-primary, #005081)", "&:hover": { background: "var(--gpr-primary-dark, #003d63)" }, fontSize: "0.82rem", px: 2.5, whiteSpace: "nowrap" }}>Ajouter</LoadingButton>
                        )}
                    </Box>
                </Box>
                {viewMode === "list" ? (
                    <ConfigTable items={filteredUsers} exportClassName="app-users" columns={[
                        { id: "identity",  label: "Identité",   sortable: true,  minWidth: 200, render: (u) => (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {u.deleted && <Block color="error" style={{ fontSize: 14 }} />}
                                <div>
                                    <div style={{ fontWeight: 700, color: u.deleted ? "#bbb" : "#0F172A", fontStyle: u.deleted ? "italic" : undefined, lineHeight: 1.5 }}>{u.firstAndLastName}</div>
                                    <div style={{ color: u.deleted ? "#bbb" : "#64748b", fontStyle: u.deleted ? "italic" : undefined, fontSize: 12, marginTop: 2 }}>{u.code}</div>
                                </div>
                            </div>
                        )},
                        { id: "poste",     label: "Poste",      sortable: true,  minWidth: 190, render: (u) => {
                            const s = u.deleted ? { color: "#bbb", fontStyle: "italic" } : {};
                            return <div style={s}><div>{u.posteDto?.libelle}</div><div>{u.servicePointDto?.libelle}</div></div>;
                        }},
                        { id: "role",      label: "Rôle",       sortable: false, minWidth: 160, render: (u) => (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, opacity: u.deleted ? 0.5 : 1 }}>
                                {getRoleBadges(u).map((b, i) => (
                                    <Chip key={i} label={b.label} size="small" sx={{ backgroundColor: b.bg, color: b.color, fontWeight: 700, fontSize: "0.72rem", height: 22 }} />
                                ))}
                            </div>
                        )},
                        { id: "contacts",  label: "Contacts",   sortable: true,  minWidth: 200, render: (u) => { const s = u.deleted ? { color: "#bbb", fontStyle: "italic" } : {}; return <div style={s}><div>{u.email}</div><div>{u.tel}</div></div>; }},
                        { id: "createdAt", label: "Ajouté le",  sortable: true,  minWidth: 140, render: (u) => { const d = u.createdAt ? new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "2-digit" }).format(new Date(u.createdAt)) : "-"; return <span style={u.deleted ? { color: "#bbb", fontStyle: "italic" } : {}}>{d}</span>; }},
                        { id: "actions",   label: "Actions",    sortable: false, minWidth: 150, render: (u) => (
                            u.deleted ? (
                                u.rattached ? (
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        <Tooltip title="Approuver"><IconButton onClick={(e) => { e.stopPropagation(); setDisableConfirm({ open: true, item: u, action: "approve", loading: false }); }} color="default"><CheckCircleIcon sx={{ color: '#66bb6a' }} /></IconButton></Tooltip>
                                        <Tooltip title="Rejeter"><IconButton onClick={(e) => { e.stopPropagation(); setDisableConfirm({ open: true, item: u, action: "delete", loading: false }); }} color="error"><DeleteIcon /></IconButton></Tooltip>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        <Tooltip title="Activer"><IconButton onClick={(e) => { e.stopPropagation(); setDisableConfirm({ open: true, item: u, action: "activate", loading: false }); }} color="default"><TaskAlt sx={{ color: 'black' }} /></IconButton></Tooltip>
                                        <Tooltip title="Modifier"><IconButton onClick={() => handleEditClick(u)} color="primary"><EditIcon /></IconButton></Tooltip>
                                        <Tooltip title="Supprimer"><IconButton onClick={() => setDeleteConfirm({ open: true, item: u, loading: false })} color="error"><DeleteIcon /></IconButton></Tooltip>
                                    </div>
                                )
                            ) : (
                                <div style={{ display: "flex", gap: "5px" }}>
                                    <Tooltip title="Désactiver"><IconButton onClick={(e) => { e.stopPropagation(); setDisableConfirm({ open: true, item: u, action: "disable", loading: false }); }} color="default"><Block /></IconButton></Tooltip>
                                    <Tooltip title="Modifier"><IconButton onClick={() => handleEditClick(u)} color="primary"><EditIcon /></IconButton></Tooltip>
                                    <Tooltip title="Supprimer"><IconButton onClick={() => setDeleteConfirm({ open: true, item: u, loading: false })} color="error"><DeleteIcon /></IconButton></Tooltip>
                                </div>
                            )
                        )},
                    ]} searchFields={["firstAndLastName", "email", "code", "tel", "posteDto.libelle", "servicePointDto.libelle"]} defaultSort="firstAndLastName" />
                ) : (
                    <ConfigCardView items={filteredUsers} titleField="firstAndLastName" subtitleField="email"
                        searchFields={["firstAndLastName", "email", "code", "tel", "posteDto.libelle", "servicePointDto.libelle"]}
                        onEdit={(u) => handleEditClick(u)}
                        onDelete={(u) => setDeleteConfirm({ open: true, item: u, loading: false })}
                        extraFields={[
                            { label: "Code",   render: (u) => <span>{u.code}</span> },
                            { label: "Poste",  render: (u) => <span>{u.posteDto?.libelle}</span> },
                            { label: "Rôle",   render: (u) => (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                    {getRoleBadges(u).map((b, i) => (
                                        <Chip key={i} label={b.label} size="small" sx={{ backgroundColor: b.bg, color: b.color, fontWeight: 700, fontSize: "0.72rem", height: 22 }} />
                                    ))}
                                </div>
                            )},
                            { label: "Statut", render: (u) => <Chip label={u.deleted ? (u.rattached ? "En attente" : "Désactivé") : "Actif"} size="small" color={u.deleted ? (u.rattached ? "warning" : "error") : "success"} /> },
                        ]}
                    />
                )}
            </div>
        </>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.user.isLoading, id: state.user.id, code: state.user.code, name: state.user.name,
    poste: state.user.poste, posteLibelle: state.user.posteLibelle, unit: state.user.unit,
    unitLibelle: state.user.unitLibelle, email: state.user.email, phone: state.user.phone,
    additionalRole: state.user.additionalRole, pass: state.user.pass, pass_again: state.user.pass_again,
    items: state.user.items, selectedItem: state.user.selectedItem, errors: state.user.user_errors,
    etat: state.user.etat, etat2: state.user.etat2, etat3: state.user.etat3,
});
const mapDispatchToProps = (dispatch) => ({
    userErrors: (err) => dispatch(userErrors(err)),
    idChanged: (id) => dispatch(idChanged(id)),
    codeChanged: (c) => dispatch(codeChanged(c)),
    nameChanged: (n) => dispatch(nameChanged(n)),
    posteChanged: (p) => dispatch(posteChanged(p)),
    posteLibelleChanged: (p) => dispatch(posteLibelleChanged(p)),
    unitChanged: (u) => dispatch(unitChanged(u)),
    unitLibelleChanged: (u) => dispatch(unitLibelleChanged(u)),
    emailChanged: (e) => dispatch(emailChanged(e)),
    phoneChanged: (p) => dispatch(phoneChanged(p)),
    passwordChanged: (p) => dispatch(passwordChanged(p)),
    passwordAgainChanged: (p) => dispatch(passwordAgainChanged(p)),
    additionalRoleChanged: (r) => dispatch(additionalRoleChanged(r)),
    itemsChanged: (i) => dispatch(itemsChanged(i)),
    selectedItemChanged: (s) => dispatch(selectedItemChanged(s)),
    etatChanged: (e) => dispatch(etatChanged(e)),
    etat2Changed: (e) => dispatch(etat2Changed(e)),
    etat3Changed: (e) => dispatch(etat3Changed(e)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Utilisateurs);
