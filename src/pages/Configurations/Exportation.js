import { Save } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import Select from "react-select"
import { useState, useEffect, useMemo } from "react";
import { exportConfigs } from "../../apis/Configurations/ExportationApi";
import { exportLogs } from "../../apis/Configurations/LogApi";
import React from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import HistoryIcon from "@mui/icons-material/History";
import ConfigTable from "../../components/shared/ConfigTable";

const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" };

const selectStyles = {
    control: (base, state) => ({ ...base, minHeight: 40, borderRadius: 9, borderColor: state.isFocused ? "var(--gpr-primary, #005081)" : "#e2e8f0", borderWidth: 1.5, boxShadow: "none", "&:hover": { borderColor: "var(--gpr-primary, #005081)" } }),
    valueContainer: base => ({ ...base, padding: "2px 14px" }),
    placeholder: base => ({ ...base, fontSize: 14, color: "#94a3b8" }),
    singleValue: base => ({ ...base, fontSize: 14, color: "#1e293b" }),
    input: base => ({ ...base, margin: 0, padding: 0 }),
    indicatorSeparator: () => ({ display: "none" }),
    menu: provided => ({ ...provided, zIndex: 9999 }),
};

const TYPE_LABELS = {
    claims: "Réclamations",
    denunciations: "Dénonciations",
    suggestions: "Suggestions",
    configs: "Configurations",
};

const Exportation = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [typeExport, setTypeExport] = useState({ value: "configs", label: "Configurations" });
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const loadHistory = () => {
        setHistoryLoading(true);
        exportLogs().then(({ data }) => {
            const sorted = (data.content || []).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setHistory(sorted);
        }).catch(() => {
            setHistory([]);
        }).finally(() => {
            setHistoryLoading(false);
        });
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleSubmit = () => {
        const now = new Date();
        const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}_${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}`;
        const jsonFile = `Exportation_${typeExport.label}_${stamp}.json`;
        exportConfigs(typeExport.value, jsonFile, loadHistory);
    };

    const historyColumns = useMemo(() => [
        {
            id: "content",
            label: "Type exporté",
            sortable: true,
            minWidth: 160,
            render: (row) => {
                const label = TYPE_LABELS[row.content] || row.content || "-";
                const colorMap = { claims: "#3B82F6", denunciations: "#F59E0B", suggestions: "#10B981", configs: "#8B5CF6" };
                const bg = colorMap[row.content] || "#64748B";
                return <Chip label={label} size="small" sx={{ backgroundColor: bg, color: "#fff", fontWeight: 700, fontSize: "0.72rem" }} />;
            }
        },
        {
            id: "userIpAddress",
            label: "Exporté par",
            sortable: true,
            minWidth: 200,
            render: (row) => (
                <span style={{ paddingLeft: 8 }}>{row.userIpAddress || "-"}</span>
            )
        },
        {
            id: "createdAt",
            label: "Date",
            sortable: true,
            minWidth: 120,
            render: (row) => row.createdAt
                ? new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "2-digit" }).format(new Date(row.createdAt))
                : "-"
        },
        {
            id: "createdAtHour",
            label: "Heure",
            sortable: false,
            minWidth: 100,
            render: (row) => row.createdAt
                ? new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(row.createdAt))
                : "-"
        },
    ], []);

    return (
        <div className="card-panel pb-5">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: 2, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileDownloadOutlinedIcon sx={{ color: "var(--gpr-primary, #005081)", fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Exportation des configurations, dénonciations et plaintes</Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.3 }}>Il s'agit d'exporter en JSON/CSV vos données</Typography>
                </Box>
            </Box>

            <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
                <Box>
                    <label style={labelStyle}>Type d'exportation</label>
                    <Select
                        value={typeExport}
                        placeholder="Choix de la configuration à exporter"
                        options={[
                            { label: "Configurations", value: "configs" },
                            { label: "Réclamations", value: "claims" },
                            { label: "Dénonciations", value: "denunciations" },
                            { label: "Suggestions", value: "suggestions" }
                        ]}
                        onChange={(e) => { setTypeExport(e) }}
                        styles={selectStyles}
                    />
                </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <LoadingButton
                    onClick={handleSubmit}
                    loading={isLoading}
                    loadingPosition="start"
                    startIcon={<Save style={{ fontSize: 16 }} />}
                    variant="contained"
                    sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "var(--gpr-primary, #005081)", "&:hover": { background: "var(--gpr-primary-dark, #003d63)" }, "&.Mui-disabled": { opacity: 0.6 } }}
                >
                    Exporter
                </LoadingButton>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: 2, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HistoryIcon sx={{ color: "#16A34A", fontSize: 18 }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#0F172A" }}>Historique des exportations</Typography>
                    <Typography sx={{ fontSize: 12, color: "#64748b" }}>{history.length} téléchargement{history.length !== 1 ? "s" : ""} enregistré{history.length !== 1 ? "s" : ""}</Typography>
                </Box>
            </Box>

            <ConfigTable
                items={history}
                exportClassName="export-history"
                columns={historyColumns}
                searchFields={["content", "userIpAddress"]}
                defaultSort="createdAt"
                defaultSortDir="desc"
                loading={historyLoading}
            />
        </div>
    );
};

export default Exportation;
