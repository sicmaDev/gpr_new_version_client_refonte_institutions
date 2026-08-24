import { itemsChanged, loading } from "../../redux/actions/Alertes/AlertesActions";
import React, { useEffect, useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { KTApp } from "../../Utils/blockui";
import { connect } from "react-redux";
import { alertReclamationApi } from "../../apis/Alertes/AlertesApi";
import { Box, Tooltip, ButtonBase, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import DossierCardView from "../../components/shared/DossierCardView";
import DossierTable from "../../components/shared/DossierTable";
import DossierKPIBar from "../../components/shared/DossierKPIBar";

/* ── KPI cards (module-level) ─────────────────────────────────────────── */
const REC_ALERT_KPI = [
    {
        key: "total",
        label: "Total en retard",
        icon: WarningAmberIcon,
        iconBg: "#FEE2E2", iconColor: "#B91C1C", borderColor: "#EF4444",
        filter: () => true,
    },
    {
        key: "toTreat",
        label: "À traiter",
        icon: AssignmentIcon,
        iconBg: "#FEF3C7", iconColor: "#92400E", borderColor: "#F59E0B",
        filter: (c) => c.status !== "TREAT",
    },
    {
        key: "toMeasure",
        label: "En attente mesure satisfaction",
        icon: HourglassEmptyIcon,
        iconBg: "#EFF6FF", iconColor: "#1D4ED8", borderColor: "#3B82F6",
        filter: (c) => c.status === "TREAT",
    },
];

const REC_ALERT_CHIPS = [
    { value: "ALL",        label: "Tous",                     filter: () => true },
    { value: "TO_TREAT",   label: "À traiter",                filter: (c) => c.status !== "TREAT" },
    { value: "TO_MEASURE", label: "En attente de mesure",     filter: (c) => c.status === "TREAT" },
];

const ReclamationsAlertes = (props) => {
    const history = useHistory();
    const [viewMode, setViewMode] = useState("list");
    const [activeChip, setActiveChip] = useState("ALL");

    const getUrl = (item) => {
        if (item.status === "TREAT") return "/reclamations/mesure/" + item.claimCode;
        return "/reclamations/traitement/" + item.claimCode;
    };

    const fmtDt = (iso) => {
        try {
            return new Intl.DateTimeFormat("fr-FR", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            }).format(new Date(iso));
        } catch (_) { return "-"; }
    };

    const tableColumns = [
        {
            id: "claimCodeClient", label: "Code client", sortable: true, minWidth: 110,
            render: (item) => (
                <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#005081", fontFamily: "monospace" }}>
                    {item.claimCodeClient || "-"}
                </span>
            ),
        },
        {
            id: "claimClient", label: "Client", sortable: true, minWidth: 140,
            render: (item) => <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{item.claimClient || <em>Anonyme</em>}</span>,
            sortValue: (item) => item.claimClient || "",
        },
        {
            id: "receiptDateTime", label: "Reçu le", sortable: true, minWidth: 130,
            render: (item) => <span style={{ fontSize: "0.80rem", color: "#475569", whiteSpace: "nowrap" }}>{fmtDt(item.receiptDateTime)}</span>,
            sortValue: (item) => item.receiptDateTime || "",
        },
        {
            id: "declenchedDate", label: "Déclenché le", sortable: true, minWidth: 130,
            render: (item) => <span style={{ fontSize: "0.80rem", color: "#475569", whiteSpace: "nowrap" }}>{fmtDt(item.declenchedDate)}</span>,
            sortValue: (item) => item.declenchedDate || "",
        },
        {
            id: "retardDay", label: "En retard de", sortable: true, minWidth: 110,
            render: (item) => (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <WarningAmberIcon style={{ fontSize: 14, color: "#EF4444" }} />
                    <span style={{ fontSize: "0.80rem", color: "#EF4444", fontWeight: 700 }}>{item.retardDay} j</span>
                </div>
            ),
            sortValue: (item) => String(item.retardDay ?? ""),
        },
        {
            id: "action", label: "Action", sortable: false, minWidth: 90,
            render: (item) => (
                <span
                    onClick={(e) => { e.stopPropagation(); history.push(getUrl(item)); }}
                    style={{ fontSize: "0.80rem", color: "#005081", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                >
                    {item.status === "TREAT" ? "Mesurer" : "Traiter"}
                </span>
            ),
        },
    ];

    const tableFilterFn = (item, { q }) => {
        if (!q) return true;
        return (
            item.claimCodeClient?.toLowerCase().includes(q) ||
            item.claimClient?.toLowerCase().includes(q)
        );
    };

    const getCardData = (item) => ({
        code: item.claimCodeClient,
        client: item.claimClient || "Anonyme",
        title: item.claimSubject || item.claimObjet || item.claimObject || item.objetLibelle || item.objet?.libelle || (typeof item.objet === "string" ? item.objet : null) || "-",
        subtitle: null,
        status: item.status,
        gravity: null,
        date: item.receiptDateTime,
        retardDay: item.retardDay,
        slaWarning: false,
    });

    const clearComponentState = () => { props.itemsChanged([]); };

    useEffect(() => {
        KTApp.blockPage({ overlayColor: "#000000", type: "v2", state: "danger", message: "En cours de chargement..." });
        props.itemsChanged([]);
        alertReclamationApi(props).then(() => {}).finally(() => { KTApp.unblockPage(); });
        return clearComponentState;
    }, []);

    const content = props.items;

    const displayedContent = useMemo(() => {
        const chip = REC_ALERT_CHIPS.find((c) => c.value === activeChip);
        return chip ? content.filter(chip.filter) : content;
    }, [content, activeChip]);

    return (
        <div id="main">
            <div className="row">
                <div className="col l12 m12 s12">
                    <div className="container">
                        <section className="tabs-vertical mt-1 section">
                            <div className="row">
                                <div className="col l12 s12 pb-5">
                                    <div className="card-panel pb-5">
                                        <DossierKPIBar items={content} kpiCards={REC_ALERT_KPI} />
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2, pb: 2, borderBottom: "1px solid #F1F5F9" }}>
                                            {REC_ALERT_CHIPS.map((chip) => {
                                                const count = chip.value === "ALL" ? content.length : content.filter(chip.filter).length;
                                                const isActive = activeChip === chip.value;
                                                if (chip.value !== "ALL" && count === 0) return null;
                                                return (
                                                    <ButtonBase key={chip.value} onClick={() => setActiveChip(chip.value)} sx={{ borderRadius: "20px", px: 1.5, py: 0.5, border: isActive ? "1.5px solid #93C5FD" : "1.5px solid #E2E8F0", backgroundColor: isActive ? "#EFF6FF" : "#FAFAFA", color: isActive ? "#1D4ED8" : "#64748B", fontWeight: isActive ? 700 : 500, fontSize: "0.78rem", transition: "all 0.18s", display: "flex", alignItems: "center", gap: 0.8, "&:hover": { backgroundColor: "#EFF6FF", color: "#1D4ED8", borderColor: "#93C5FD" } }}>
                                                        <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit", lineHeight: 1.4 }}>{chip.label}</Typography>
                                                        <Box sx={{ minWidth: 20, height: 20, borderRadius: "10px", backgroundColor: isActive ? "#1D4ED8" : "#E2E8F0", color: isActive ? "#fff" : "#64748B", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", px: 0.6 }}>{count}</Box>
                                                    </ButtonBase>
                                                );
                                            })}
                                        </Box>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                            <h5 className="card-title" style={{ fontWeight: 700, color: "#0F172A", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                                                Réclamations en retard
                                                <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "#64748B", background: "#F1F5F9", borderRadius: 8, padding: "2px 10px" }}>
                                                    {displayedContent.length} résultat{displayedContent.length !== 1 ? "s" : ""}
                                                </span>
                                            </h5>
                                            <Box sx={{ display: "inline-flex", borderRadius: "10px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                                                <Tooltip title="Vue liste">
                                                    <Box onClick={() => setViewMode("list")} sx={{ px: 1.4, py: 0.8, cursor: "pointer", backgroundColor: viewMode === "list" ? "var(--gpr-primary, #005081)" : "#F8FAFC", color: viewMode === "list" ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.18s" }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                                                    </Box>
                                                </Tooltip>
                                                <Tooltip title="Vue cartes">
                                                    <Box onClick={() => setViewMode("card")} sx={{ px: 1.4, py: 0.8, cursor: "pointer", backgroundColor: viewMode === "card" ? "var(--gpr-primary, #005081)" : "#F8FAFC", color: viewMode === "card" ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.18s" }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                                    </Box>
                                                </Tooltip>
                                            </Box>
                                        </div>
                                        <div>
                                            {viewMode === "card" ? (
                                                <DossierCardView
                                                    items={displayedContent}
                                                    getCardData={getCardData}
                                                    onCardClick={(item) => history.push(getUrl(item))}
                                                    filterFn={tableFilterFn}
                                                    showStatusFilter={false}
                                                    showGravityFilter={false}
                                                    searchPlaceholder="Rechercher une réclamation…"
                                                    emptyText="Aucune réclamation en retard trouvée"
                                                />
                                            ) : (
                                                <DossierTable
                                                    items={displayedContent}
                                                    columns={tableColumns}
                                                    filterFn={tableFilterFn}
                                                    showStatusFilter={false}
                                                    showGravityFilter={false}
                                                    searchPlaceholder="Rechercher par code client..."
                                                    emptyText="Aucune réclamation en retard trouvée"
                                                />
                                            )}
                                            <div id="tab_exl" style={{ display: "none" }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="content-overlay"></div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    isLoading: state.alert.isLoading,
    items: state.alert.items,
});
const mapDispatchToProps = (dispatch) => ({
    loading: (err) => dispatch(loading(err)),
    itemsChanged: (items) => dispatch(itemsChanged(items)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReclamationsAlertes);
