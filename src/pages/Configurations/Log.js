
import React, { useMemo, useState, useEffect } from "react";
import { KTApp } from "../../Utils/blockui";
import { logs } from "../../apis/Configurations/LogApi";
import { handlePrint } from "../../Utils/tables";
import { table2XLSX } from "../../Utils/tabletoexcel";
import { Chip, Box, Typography, IconButton, Tooltip } from "@mui/material";
import { PictureAsPdf, GridOn } from "@mui/icons-material";
import { today } from "../../Utils/utils";
import ConfigKPIBar from "../../components/shared/ConfigKPIBar";
import ConfigTable from "../../components/shared/ConfigTable";
import ConfigCardView from "../../components/shared/ConfigCardView";
import ViewModeToggle from "../../components/shared/ViewModeToggle";
import StorageIcon from "@mui/icons-material/Storage";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";


const Log = () => {
    useEffect(() => {
        getLogs();
    }, []);

    const [data, setData] = useState([]);

    const getLogs = async () => {
        KTApp.blockPage({ overlayColor: '#000000', type: 'v1', state: 'danger', message: 'En cours...' });
        logs().then(({ data }) => {
            setData(data.content);
        }).catch(() => {
            setData([]);
        }).finally(() => {
            KTApp.unblockPage();
        });
    };

    const [activeChip, setActiveChip] = useState("ALL");
    const [viewMode, setViewMode] = useState("list");

    const KPI_CONFIG = [
        { key: "total",   label: "Total logs",      icon: StorageIcon,      iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true },
        { key: "error",   label: "Erreurs",          icon: ErrorOutlineIcon, iconBg: "#FEE2E2", iconColor: "#B91C1C", borderColor: "#EF4444", filter: (i) => (i.type || '').toUpperCase() === "ERROR" },
        { key: "warning", label: "Avertissements",   icon: WarningAmberIcon, iconBg: "#FEF3C7", iconColor: "#B45309", borderColor: "#F59E0B", filter: (i) => (i.type || '').toUpperCase() === "WARNING" },
        { key: "info",    label: "Infos",            icon: InfoOutlinedIcon, iconBg: "#D1FAE5", iconColor: "#065F46", borderColor: "#10B981", filter: (i) => (i.type || '').toUpperCase() === "INFO" },
    ];

    const CHIPS_CONFIG = [
        { value: "ALL",     label: "Tous" },
        { value: "ERROR",   label: "Erreur" },
        { value: "WARNING", label: "Avertissement" },
        { value: "INFO",    label: "Info" },
    ];

    const filteredData = useMemo(() => {
        const items = activeChip === "ALL" ? data : data.filter(i => (i.type || '').toUpperCase() === activeChip);
        return items.map(i => ({ ...i, typeLabel: i.type }));
    }, [data, activeChip]);

    return (
        <div className="card-panel pb-5">
            <ConfigKPIBar items={data} kpis={KPI_CONFIG} />

            <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
                {CHIPS_CONFIG.map(chip => (
                    <Chip
                        key={chip.value}
                        label={chip.label}
                        onClick={() => setActiveChip(chip.value)}
                        color={activeChip === chip.value ? "primary" : "default"}
                        variant={activeChip === chip.value ? "filled" : "outlined"}
                        size="small"
                        sx={{ borderRadius: "8px", fontWeight: activeChip === chip.value ? 700 : 400 }}
                    />
                ))}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Logs du serveur</Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <ViewModeToggle value={viewMode} onChange={setViewMode} />
                    <Tooltip title="Exporter en PDF"><IconButton onClick={() => handlePrint({}, [], filteredData, 0)} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#ef4444", "&:hover": { background: "#fee2e2" } }} size="small"><PictureAsPdf fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Exporter en Excel"><IconButton onClick={() => table2XLSX("Logs_" + today().replaceAll("/", ""), "app-log")} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, color: "#16a34a", "&:hover": { background: "#dcfce7" } }} size="small"><GridOn fontSize="small" /></IconButton></Tooltip>
                </Box>
            </Box>

            {viewMode === "list" ? (
                <ConfigTable
                    items={filteredData}
                    columns={[
                        { id: "libelle",       label: "Libellé",       sortable: true,  minWidth: 200 },
                        { id: "content",       label: "Contenu",       sortable: true,  minWidth: 200 },
                        { id: "target",        label: "Target",        sortable: true,  minWidth: 140 },
                        { id: "type",          label: "Type",          sortable: true,  minWidth: 110, render: (lo) => {
                            const colorMap = { ERROR: "#EF4444", WARNING: "#F59E0B", INFO: "#10B981" };
                            const t = (lo.type || '').toUpperCase();
                            return <Chip label={lo.type} size="small" sx={{ backgroundColor: colorMap[t] || "#64748B", color: "#fff", fontWeight: 700, fontSize: "0.72rem" }} />;
                        }},
                        { id: "userIpAddress", label: "Adresse IP",    sortable: true,  minWidth: 130 },
                        { id: "createdAt",     label: "Enregistré le", sortable: true,  minWidth: 160, render: (lo) =>
                            lo.createdAt
                                ? new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "2-digit" }).format(new Date(lo.createdAt))
                                : "-"
                        },
                    ]}
                    searchFields={["libelle", "content", "target", "type"]}
                    defaultSort="createdAt"
                />
            ) : (
                <ConfigCardView
                    items={filteredData}
                    titleField="libelle"
                    subtitleField="content"
                    badgeField="typeLabel"
                    badgeColorMap={{ ERROR: "#EF4444", WARNING: "#F59E0B", INFO: "#10B981" }}
                    searchFields={["libelle", "content", "target", "type"]}
                    extraFields={[
                        { label: "Target", render: (lo) => lo.target || "-" },
                        { label: "Adresse IP", render: (lo) => lo.userIpAddress || "-" },
                        { label: "Enregistré le", render: (lo) =>
                            lo.createdAt
                                ? new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "2-digit" }).format(new Date(lo.createdAt))
                                : "-"
                        },
                    ]}
                />
            )}
        </div>
    );
}

export default Log;
