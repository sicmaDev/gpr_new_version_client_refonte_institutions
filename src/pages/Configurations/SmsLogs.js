import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Typography } from "@mui/material";
import SmsIcon from "@mui/icons-material/Sms";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ConfigKPIBar from "../../components/shared/ConfigKPIBar";
import ConfigTable from "../../components/shared/ConfigTable";
import { listSmsLogs } from "../../apis/SmsLogApi";
import { notify } from "../../Utils/alert";

const formatDate = (value) =>
    value
        ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
        : "-";

const STATUS = {
    ENVOYE: { label: "Envoyé", bg: "#DCFCE7", color: "#166534" },
    ECHEC: { label: "Échec", bg: "#FEE2E2", color: "#B91C1C" },
};

// Canal d'envoi : les anciennes lignes n'ont pas de canal, ce sont des SMS.
const CHANNELS = {
    SMS: { label: "SMS", bg: "#EFF6FF", color: "#1D4ED8" },
    MAIL: { label: "Mail", bg: "#F5F3FF", color: "#6D28D9" },
    WHATSAPP: { label: "WhatsApp", bg: "#DCFCE7", color: "#166534" },
};

const CHANNEL_CHIPS = [
    { value: "ALL", label: "Tous les canaux" },
    { value: "SMS", label: "SMS" },
    { value: "MAIL", label: "Mail" },
    { value: "WHATSAPP", label: "WhatsApp" },
];

const KPI_CONFIG = [
    { key: "total", label: "Messages archivés", icon: SmsIcon, iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true },
    { key: "sent", label: "Envoyés", icon: CheckCircleOutlineIcon, iconBg: "#D1FAE5", iconColor: "#065F46", borderColor: "#10B981", filter: (i) => i.status === "ENVOYE" },
    { key: "failed", label: "Échecs", icon: ErrorOutlineIcon, iconBg: "#FEE2E2", iconColor: "#B91C1C", borderColor: "#EF4444", filter: (i) => i.status === "ECHEC" },
];

const CHIPS_CONFIG = [
    { value: "ALL", label: "Tous" },
    { value: "ENVOYE", label: "Envoyés" },
    { value: "ECHEC", label: "Échecs" },
];

const escapeCsv = (value) => `"${String(value === null || value === undefined ? "" : value).replace(/"/g, '""')}"`;

// Archive des SMS envoyés aux clients (administration).
const SmsLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChip, setActiveChip] = useState("ALL");
    const [channelChip, setChannelChip] = useState("ALL");

    useEffect(() => {
        listSmsLogs()
            .then((response) => setLogs((response.data.content || []).map((log) => ({ ...log, channel: log.channel || "SMS", channelLabel: (CHANNELS[log.channel || "SMS"] || {}).label || log.channel, refCode: log.claimCode || log.suggestCode || "-" }))))
            .catch(() => notify("Erreur - Impossible de charger le journal des envois", "error"))
            .finally(() => setLoading(false));
    }, []);

    const items = useMemo(
        () => logs.filter((l) => (channelChip === "ALL" || l.channel === channelChip) && (activeChip === "ALL" || l.status === activeChip)),
        [logs, activeChip, channelChip]
    );

    const exportCsv = () => {
        const headers = ["Canal", "REC/SUG", "Statut", "Type", "Destinataire", "Message", "Créé le", "Envoyé le"];
        const rows = items.map((l) => [l.channelLabel, l.refCode, l.status, l.type, l.numeroDestinataire, l.content, formatDate(l.createdAt), formatDate(l.sendAt)]);
        const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(";")).join("\r\n");
        const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "archive-des-envois.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="card-panel pb-5">
            <ConfigKPIBar items={logs} kpis={KPI_CONFIG} />

            <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                {CHANNEL_CHIPS.map((chip) => (
                    <Chip
                        key={chip.value}
                        label={chip.label}
                        onClick={() => setChannelChip(chip.value)}
                        color={channelChip === chip.value ? "primary" : "default"}
                        variant={channelChip === chip.value ? "filled" : "outlined"}
                        size="small"
                        sx={{ borderRadius: "8px", fontWeight: channelChip === chip.value ? 700 : 400 }}
                    />
                ))}
            </Box>

            <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
                {CHIPS_CONFIG.map((chip) => (
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
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Archive des envois</Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: "#64748B" }}>Historique des messages envoyés : SMS, e-mails et WhatsApp, aux clients et aux agents</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    onClick={exportCsv}
                    disabled={loading || items.length === 0}
                    sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, background: "var(--gpr-primary, #005081)", "&:hover": { background: "var(--gpr-primary-dark, #003d63)" } }}
                >
                    Exporter CSV
                </Button>
            </Box>

            <ConfigTable
                items={items}
                loading={loading}
                exportClassName="app-sms-logs"
                columns={[
                    {
                        id: "channelLabel", label: "Canal", sortable: true, minWidth: 100,
                        render: (l) => {
                            const c = CHANNELS[l.channel] || { label: l.channel, bg: "#F1F5F9", color: "#475569" };
                            return <Chip label={c.label} size="small" sx={{ fontWeight: 700, fontSize: "0.72rem", background: c.bg, color: c.color }} />;
                        },
                    },
                    { id: "refCode", label: "REC / SUG", sortable: true, minWidth: 120, render: (l) => <strong>{l.refCode}</strong> },
                    {
                        id: "status", label: "Statut", sortable: true, minWidth: 100,
                        render: (l) => {
                            const s = STATUS[l.status] || { label: l.status || "-", bg: "#F1F5F9", color: "#475569" };
                            return <Chip label={s.label} size="small" sx={{ fontWeight: 700, fontSize: "0.72rem", background: s.bg, color: s.color }} />;
                        },
                    },
                    { id: "type", label: "Type", sortable: true, minWidth: 100 },
                    { id: "numeroDestinataire", label: "Destinataire", sortable: true, minWidth: 140 },
                    {
                        id: "content", label: "Message", sortable: true, minWidth: 240,
                        render: (l) => <span title={l.content}>{l.content && l.content.length > 80 ? `${l.content.substring(0, 80)}...` : l.content}</span>,
                    },
                    { id: "createdAt", label: "Créé le", sortable: true, minWidth: 170, render: (l) => formatDate(l.createdAt) },
                    { id: "sendAt", label: "Envoyé le", sortable: true, minWidth: 170, render: (l) => formatDate(l.sendAt) },
                ]}
                searchFields={["channelLabel", "refCode", "numeroDestinataire", "content", "type"]}
                defaultSort="createdAt"
                defaultSortDir="desc"
            />
        </div>
    );
};

export default SmsLogs;
