import React, { useEffect, useState } from "react";
import { Autocomplete, Box, Chip, CircularProgress, TextField, Typography } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import { LoadingButton } from "@mui/lab";
import { listScheduledReports, testScheduledReport, updateScheduledReport, updateScheduledReportsTimezone } from "../../apis/ScheduledReportsApi";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { slaStatus } from "../../apis/Sla/SlaApi";
import { Panel, SelectField, FieldLabel, fieldProps, Toggle, OutlineButton, SlaDialog, primarySx } from "../Sla/slaUi";

const DEFAULT_TIMEZONE = "Africa/Porto-Novo";

// Liste complète des fuseaux IANA fournie par le navigateur ; repli sur une courte liste si elle n'est pas disponible.
const TIMEZONES = (() => {
    try {
        if (typeof Intl.supportedValuesOf === "function") return Intl.supportedValuesOf("timeZone");
    } catch (e) {
        // on retombe sur la liste courte ci-dessous
    }
    return [DEFAULT_TIMEZONE, "UTC", "Europe/Paris", "Africa/Abidjan", "Africa/Lagos", "Africa/Kinshasa"];
})();

const FREQUENCIES = [
    ["DAILY", "Tous les jours"],
    ["WEEKLY", "Un jour par semaine"],
    ["MULTIPLE_WEEKLY", "Plusieurs jours par semaine"],
    ["MONTHLY_DATE", "Un jour précis du mois"],
    ["MONTHLY_WEEK", "Une semaine du mois"],
    ["QUARTERLY", "Tous les trimestres"],
];
const WEEKS = [[1, "1re semaine"], [2, "2e semaine"], [3, "3e semaine"], [4, "4e semaine"], [5, "5e semaine"], [-1, "Dernière semaine"]];
const WEEK_DAYS = [[1, "Lundi"], [2, "Mardi"], [3, "Mercredi"], [4, "Jeudi"], [5, "Vendredi"], [6, "Samedi"], [7, "Dimanche"]];
const MONTHS_OF_QUARTER = [[1, "1er mois"], [2, "2e mois"], [3, "3e mois"]];

const RECIPIENTS = {
    AGENTS: { label: "Rapport des agents", description: "Alertes adressées aux agents responsables des dossiers affectés.", Icon: PeopleAltIcon },
    PILOTE: { label: "Rapport du pilote", description: "Synthèse adressée au pilote et aux utilisateurs ayant une visibilité globale.", Icon: PersonIcon },
};

const normalizeTime = (value) => (value ? value.substring(0, 5) : "08:00");
const selectedDays = (value) => (value ? value.split(",").filter(Boolean).map(Number) : []);
const formatExecution = (value, enabled, emptyLabel) => {
    if (!enabled) return "Désactivée";
    if (!value) return emptyLabel;
    return new Date(value).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
};

const currentUserEmail = () => {
    try {
        const user = loadItemFromSessionStorage("app-user");
        return (user && user.email) || "";
    } catch (e) {
        return "";
    }
};

const Field = ({ label, children, width = 200 }) => (
    <Box sx={{ minWidth: width, flex: "0 1 auto" }}>
        <FieldLabel>{label}</FieldLabel>
        {children}
    </Box>
);

const Caption = ({ children, italic }) => (
    <Typography sx={{ fontSize: "0.78rem", color: "#64748B", fontStyle: italic ? "italic" : "normal" }}>{children}</Typography>
);

// Planification des relances de retard par e-mail (administration) : fréquence, jour, heure et fuseau horaire.
const ScheduledReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [testReport, setTestReport] = useState(null);
    const [testEmail, setTestEmail] = useState("");
    const [testing, setTesting] = useState(false);
    const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
    const [savingTimezone, setSavingTimezone] = useState(false);
    const [slaOn, setSlaOn] = useState(false);

    useEffect(() => {
        slaStatus().then((s) => setSlaOn(!!s?.enabled)).catch(() => {});
        listScheduledReports()
            .then((response) => {
                const data = response.data || [];
                setReports(data);
                setTimezone((data[0] && data[0].timezone) || DEFAULT_TIMEZONE);
            })
            .catch(() => notify("Erreur - Impossible de charger les fréquences", "error"))
            .finally(() => setLoading(false));
    }, []);

    const update = (id, field, value) => setReports((cur) => cur.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

    const toggleDay = (report, day) => {
        const days = selectedDays(report.daysOfWeek);
        const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort();
        update(report.id, "daysOfWeek", next.join(","));
    };

    const saveReport = (report) => {
        setSavingId(report.id);
        const payload = {
            enabled: report.enabled,
            frequency: report.frequency,
            dayOfWeek: ["WEEKLY", "MONTHLY_WEEK"].includes(report.frequency) ? report.dayOfWeek || 1 : null,
            daysOfWeek: report.frequency === "MULTIPLE_WEEKLY" ? report.daysOfWeek : null,
            dayOfMonth: ["MONTHLY_DATE", "QUARTERLY"].includes(report.frequency) ? report.dayOfMonth || 1 : null,
            weekOfMonth: report.frequency === "MONTHLY_WEEK" ? report.weekOfMonth || 1 : null,
            monthOfQuarter: report.frequency === "QUARTERLY" ? report.monthOfQuarter || 1 : null,
            sendTime: normalizeTime(report.sendTime),
        };
        updateScheduledReport(report.id, payload)
            .then((response) => {
                setReports((cur) => cur.map((r) => (r.id === report.id ? response.data : r)));
                notify("Fréquence enregistrée", "success");
            })
            .catch((error) => notify(error.response?.data || "Erreur - Enregistrement impossible", "error"))
            .finally(() => setSavingId(null));
    };

    const saveTimezone = () => {
        if (!timezone) { notify("Erreur - Le fuseau horaire est obligatoire", "error"); return; }
        setSavingTimezone(true);
        updateScheduledReportsTimezone(timezone)
            .then((response) => { setReports(response.data || []); notify("Fuseau horaire enregistré", "success"); })
            .catch((error) => notify(error.response?.data || "Erreur - Enregistrement du fuseau impossible", "error"))
            .finally(() => setSavingTimezone(false));
    };

    const sendTest = () => {
        if (!testEmail) { notify("Erreur - L'adresse email est obligatoire", "error"); return; }
        setTesting(true);
        testScheduledReport(testReport.id, testEmail)
            .then((response) => { notify(response.data?.message || "Mail de test envoyé", "success"); setTestReport(null); })
            .catch((error) => {
                const payload = error.response?.data;
                notify((payload && (payload.message || payload)) || "Erreur - Envoi du test impossible", "error");
            })
            .finally(() => setTesting(false));
    };

    if (loading) {
        return <div className="card-panel" style={{ padding: 48, textAlign: "center" }}><CircularProgress /></div>;
    }

    const number = (report, field) => (
        <TextField {...fieldProps} fullWidth={false} type="number" inputProps={{ min: 1, max: 31 }} value={report[field] || 1}
            onChange={(e) => update(report.id, field, Number(e.target.value))} sx={{ ...fieldProps.sx, width: 120 }} />
    );

    return (
        <div>
            {slaOn && (
                <Box sx={{ mb: 2.5, p: 2, borderRadius: 2, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>Le suivi des délais est actif</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#64748B", mt: 0.4 }}>
                        Ses rappels et alertes remplacent ces relances : la planification ci-dessous est conservée, mais aucun mail n'en part tant que le suivi des délais est actif.
                    </Typography>
                </Box>
            )}
            <Panel title="Fuseau horaire de la planification" subtitle="S'applique à l'heure d'envoi et aux jours planifiés des deux rapports ci-dessous.">
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end", flexWrap: "wrap" }}>
                    <Box sx={{ minWidth: 280, flex: "0 1 360px" }}>
                        <FieldLabel>Fuseau horaire</FieldLabel>
                        <Autocomplete
                            size="small" options={TIMEZONES} value={timezone} disableClearable
                            onChange={(_, value) => setTimezone(value || DEFAULT_TIMEZONE)}
                            renderInput={(params) => <TextField {...params} {...fieldProps} fullWidth InputProps={{ ...params.InputProps, startAdornment: <PublicIcon sx={{ fontSize: 18, color: "#94A3B8", mr: 0.5 }} /> }} />}
                        />
                    </Box>
                    <LoadingButton variant="contained" sx={primarySx} loading={savingTimezone} loadingPosition="start" startIcon={<SaveIcon />} onClick={saveTimezone}>
                        Enregistrer
                    </LoadingButton>
                </Box>
            </Panel>

            {reports.map((report) => {
                const { label, description, Icon } = RECIPIENTS[report.recipientType] || RECIPIENTS.AGENTS;
                return (
                    <Panel
                        key={report.id}
                        title={label}
                        subtitle={description}
                        right={<OutlineButton startIcon={<SendIcon />} onClick={() => { setTestEmail(currentUserEmail()); setTestReport(report); }}>Tester l'envoi</OutlineButton>}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2.5 }}>
                            <Icon sx={{ fontSize: 20, color: "var(--gpr-primary)" }} />
                            <Toggle checked={!!report.enabled} onChange={(v) => update(report.id, "enabled", v)} />
                            <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "#334155" }}>
                                {report.enabled ? "Envoi activé" : "Envoi désactivé"}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2.5 }}>
                            <Field label="Fréquence" width={240}>
                                <SelectField value={report.frequency} onChange={(v) => update(report.id, "frequency", v)} options={FREQUENCIES} minWidth={240} />
                            </Field>
                            {report.frequency === "WEEKLY" && (
                                <Field label="Jour"><SelectField value={report.dayOfWeek || 1} onChange={(v) => update(report.id, "dayOfWeek", v)} options={WEEK_DAYS} minWidth={180} /></Field>
                            )}
                            {report.frequency === "MULTIPLE_WEEKLY" && (
                                <Field label="Jours" width={420}>
                                    <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                                        {WEEK_DAYS.map(([value, name]) => {
                                            const active = selectedDays(report.daysOfWeek).includes(value);
                                            return (
                                                <Chip key={value} label={name} onClick={() => toggleDay(report, value)} size="small"
                                                    color={active ? "primary" : "default"} variant={active ? "filled" : "outlined"}
                                                    sx={{ borderRadius: "8px", fontWeight: active ? 700 : 400 }} />
                                            );
                                        })}
                                    </Box>
                                </Field>
                            )}
                            {report.frequency === "MONTHLY_DATE" && <Field label="Jour du mois" width={140}>{number(report, "dayOfMonth")}</Field>}
                            {report.frequency === "MONTHLY_WEEK" && (
                                <>
                                    <Field label="Occurrence"><SelectField value={report.weekOfMonth || 1} onChange={(v) => update(report.id, "weekOfMonth", v)} options={WEEKS} minWidth={180} /></Field>
                                    <Field label="Jour"><SelectField value={report.dayOfWeek || 1} onChange={(v) => update(report.id, "dayOfWeek", v)} options={WEEK_DAYS} minWidth={180} /></Field>
                                </>
                            )}
                            {report.frequency === "QUARTERLY" && (
                                <>
                                    <Field label="Mois du trimestre"><SelectField value={report.monthOfQuarter || 1} onChange={(v) => update(report.id, "monthOfQuarter", v)} options={MONTHS_OF_QUARTER} minWidth={180} /></Field>
                                    <Field label="Jour du mois" width={140}>{number(report, "dayOfMonth")}</Field>
                                </>
                            )}
                            <Field label="Heure d'envoi" width={150}>
                                <TextField {...fieldProps} fullWidth={false} type="time" value={normalizeTime(report.sendTime)}
                                    onChange={(e) => update(report.id, "sendTime", e.target.value)} sx={{ ...fieldProps.sx, width: 150 }} />
                            </Field>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 2, flexWrap: "wrap", borderTop: "1px solid #F1F5F9", pt: 2 }}>
                            <Box>
                                <Caption>Dernière relance envoyée : {formatExecution(report.lastSentAt, report.enabled, "Jamais")}</Caption>
                                <Caption italic>Dernier contrôle : {formatExecution(report.lastExecutionAt, report.enabled, "Jamais")}</Caption>
                                <Caption>Prochaine relance : {formatExecution(report.nextExecutionAt, report.enabled, "Non planifiée")}</Caption>
                                <Caption italic>Fuseau horaire : {report.timezone || DEFAULT_TIMEZONE}</Caption>
                            </Box>
                            <LoadingButton variant="contained" sx={primarySx} loading={savingId === report.id} loadingPosition="start" startIcon={<SaveIcon />} onClick={() => saveReport(report)}>
                                Enregistrer
                            </LoadingButton>
                        </Box>
                    </Panel>
                );
            })}

            <SlaDialog
                open={Boolean(testReport)} onClose={() => setTestReport(null)} icon={SendIcon} loading={testing} onSubmit={sendTest}
                title="Tester l'envoi" subtitle={testReport ? (RECIPIENTS[testReport.recipientType] || {}).label : ""} submitLabel="Envoyer"
            >
                <Typography sx={{ fontSize: 13.5, color: "#475569", mb: 2, lineHeight: 1.55 }}>
                    Envoie immédiatement un aperçu réel du rapport (données actuelles) à l'adresse ci-dessous, sans affecter la planification
                    ni contacter les agents ou le pilote.
                </Typography>
                <FieldLabel required>Adresse email de test</FieldLabel>
                <TextField {...fieldProps} type="email" value={testEmail} disabled={testing} onChange={(e) => setTestEmail(e.target.value)} />
            </SlaDialog>
        </div>
    );
};

export default ScheduledReports;
