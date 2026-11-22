import React, { useEffect, useState } from "react";
import { Autocomplete, Box, CircularProgress, TextField, Typography } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import { LoadingButton } from "@mui/lab";
import { listScheduledReports, testScheduledReport, updateScheduledReport, updateScheduledReportsTimezone } from "../../apis/ScheduledReportsApi";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { slaStatus } from "../../apis/Sla/SlaApi";
import { SelectField, FieldLabel, fieldProps, Toggle, OutlineButton, SlaDialog, primarySx } from "../Sla/slaUi";

const DEFAULT_TIMEZONE = "Africa/Porto-Novo";
const P = "var(--gpr-primary, #005081)";
const PD = "var(--gpr-primary-dark, #003d62)";
const PL = "var(--gpr-primary-light, #e6f0f6)";

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
    AGENTS: { label: "Rapport des agents", description: "Alertes adressées aux agents responsables des dossiers affectés.", court: "Dossiers affectés à chaque agent", Icon: PeopleAltIcon },
    PILOTE: { label: "Rapport du pilote", description: "Synthèse adressée au pilote et aux utilisateurs ayant une visibilité globale.", court: "Synthèse globale", Icon: PersonIcon },
};

const normalizeTime = (value) => (value ? value.substring(0, 5) : "08:00");
const selectedDays = (value) => (value ? value.split(",").filter(Boolean).map(Number) : []);
const formatExecution = (value, enabled, emptyLabel) => {
    if (!enabled) return "Désactivée";
    if (!value) return emptyLabel;
    return new Date(value).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
};
// Date courte pour le tableau : « lun. 23 nov. · 08:00 »
const dateCourte = (value, enabled, emptyLabel) => {
    if (!enabled) return "—";
    if (!value) return emptyLabel;
    const d = new Date(value);
    return `${d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} · ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
};

// Le réglage écrit en clair : « Chaque lundi, mercredi et vendredi à 08:00 »
const nomJour = (n) => ((WEEK_DAYS.find(([v]) => v === Number(n)) || [1, "Lundi"])[1]).toLowerCase();
const enListe = (mots) => (mots.length <= 1 ? mots.join("") : `${mots.slice(0, -1).join(", ")} et ${mots[mots.length - 1]}`);
const quantieme = (n) => (Number(n || 1) === 1 ? "1er" : String(n));
const quand = (r) => {
    const h = normalizeTime(r.sendTime);
    switch (r.frequency) {
        case "DAILY": return `Tous les jours à ${h}`;
        case "WEEKLY": return `Chaque ${nomJour(r.dayOfWeek || 1)} à ${h}`;
        case "MULTIPLE_WEEKLY": {
            const jours = selectedDays(r.daysOfWeek).map(nomJour);
            return jours.length ? `Chaque ${enListe(jours)} à ${h}` : "Aucun jour choisi";
        }
        case "MONTHLY_DATE": return `Le ${quantieme(r.dayOfMonth)} de chaque mois à ${h}`;
        case "MONTHLY_WEEK": {
            const semaine = ((WEEKS.find(([v]) => v === Number(r.weekOfMonth || 1)) || [1, "1re semaine"])[1]).toLowerCase();
            return `Le ${nomJour(r.dayOfWeek || 1)} de la ${semaine} de chaque mois à ${h}`;
        }
        case "QUARTERLY": {
            const mois = (MONTHS_OF_QUARTER.find(([v]) => v === Number(r.monthOfQuarter || 1)) || [1, "1er mois"])[1];
            return `Le ${quantieme(r.dayOfMonth)} du ${mois} de chaque trimestre à ${h}`;
        }
        default: return `À ${h}`;
    }
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

const th = { padding: "11px 16px", fontSize: 11, letterSpacing: ".8px", color: "#64748b", fontWeight: 700, textAlign: "left", textTransform: "uppercase" };
const td = { padding: "14px 16px", fontSize: 13, color: "#1e293b", verticalAlign: "middle" };

const EtatPastille = ({ actif }) => (
    <span style={{ padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: 11.5, background: actif ? "#dcfce7" : "#f1f5f9", color: actif ? "#15803d" : "#64748b" }}>
        {actif ? "Activé" : "Désactivé"}
    </span>
);

const LigneInfo = ({ libelle, valeur, fort }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid #eef2f6", fontSize: 13 }}>
        <span style={{ color: "#64748b" }}>{libelle}</span>
        <span style={{ color: "#0f172a", fontWeight: fort ? 700 : 500, textAlign: "right" }}>{valeur}</span>
    </div>
);

// Planification des relances de retard par e-mail (administration) : fréquence, jour, heure et fuseau horaire.
// Présentation : tableau des rapports en haut, réglage du rapport choisi en dessous.
const ScheduledReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [testReport, setTestReport] = useState(null);
    const [testEmail, setTestEmail] = useState("");
    const [testing, setTesting] = useState(false);
    const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
    const [savingTimezone, setSavingTimezone] = useState(false);
    const [fuseauOuvert, setFuseauOuvert] = useState(false);
    const [slaOn, setSlaOn] = useState(false);
    const [choisiId, setChoisiId] = useState(null);

    useEffect(() => {
        slaStatus().then((s) => setSlaOn(!!s?.enabled)).catch(() => {});
        listScheduledReports()
            .then((response) => {
                const data = response.data || [];
                setReports(data);
                setTimezone((data[0] && data[0].timezone) || DEFAULT_TIMEZONE);
                if (data[0]) setChoisiId(data[0].id);
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
            .then((response) => { setReports(response.data || []); notify("Fuseau horaire enregistré", "success"); setFuseauOuvert(false); })
            .catch((error) => notify(error.response?.data || "Erreur - Enregistrement du fuseau impossible", "error"))
            .finally(() => setSavingTimezone(false));
    };

    const sendTest = () => {
        if (!testEmail) { notify("Erreur - L'adresse email est obligatoire", "error"); return; }
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(testEmail)) { notify("Erreur - L'adresse email est invalide", "error"); return; }
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

    const report = reports.find((r) => r.id === choisiId) || reports[0];
    const fuseauActuel = (reports[0] && reports[0].timezone) || DEFAULT_TIMEZONE;

    return (
        <div className="card-panel" style={{ borderRadius: 16, padding: "24px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
            {/* En-tête */}
            <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Fréquences des alertes</h1>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                    Fuseau horaire : <strong style={{ color: "#334155" }}>{fuseauActuel}</strong>{" · "}
                    <button type="button" onClick={() => { setTimezone(fuseauActuel); setFuseauOuvert(true); }}
                        style={{ border: "none", background: "none", padding: 0, color: P, fontWeight: 600, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                        modifier
                    </button>
                </p>
            </div>

            {slaOn && (
                <Box sx={{ p: 2, borderRadius: 2, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>Le suivi des délais est actif</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#64748B", mt: 0.4 }}>
                        Ses rappels et alertes remplacent ces relances : la planification ci-dessous est conservée, mais aucun mail n'en part tant que le suivi des délais est actif.
                    </Typography>
                </Box>
            )}

            {/* Tableau des rapports : un clic choisit le rapport à régler */}
            <div style={{ border: "1px solid #f1f5f9", borderRadius: 12, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                    <thead>
                        <tr style={{ background: "#f8fafc" }}>
                            <th style={th}>Rapport</th><th style={th}>Quand</th><th style={th}>Prochain envoi</th><th style={th}>Dernier envoi</th><th style={th}>État</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((r) => {
                            const meta = RECIPIENTS[r.recipientType] || RECIPIENTS.AGENTS;
                            const actif = r.id === report?.id;
                            return (
                                <tr key={r.id} onClick={() => setChoisiId(r.id)} aria-selected={actif}
                                    style={{ borderTop: "1px solid #f1f5f9", cursor: "pointer", background: actif ? PL : "white", boxShadow: actif ? `inset 4px 0 0 ${P}` : "none" }}>
                                    <td style={td}>
                                        <button type="button" onClick={() => setChoisiId(r.id)} style={{ border: "none", background: "none", padding: 0, textAlign: "left", cursor: "pointer", font: "inherit" }}>
                                            <div style={{ fontWeight: 700, color: "#0f172a" }}>{meta.label}</div>
                                            <div style={{ fontSize: 12, color: "#64748b" }}>{meta.court}</div>
                                        </button>
                                    </td>
                                    <td style={td}>{quand(r)}</td>
                                    <td style={{ ...td, fontWeight: 600 }}>{dateCourte(r.nextExecutionAt, r.enabled, "Non planifié")}</td>
                                    <td style={{ ...td, color: "#64748b" }}>{dateCourte(r.lastSentAt, r.enabled, "Jamais")}</td>
                                    <td style={td}><EtatPastille actif={!!r.enabled} /></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Réglage du rapport choisi */}
            {report && (() => {
                const { label, description, Icon } = RECIPIENTS[report.recipientType] || RECIPIENTS.AGENTS;
                return (
                    <section style={{ border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
                        <div style={{ background: `linear-gradient(135deg, ${PD} 0%, ${P} 100%)`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Icon style={{ color: "#fff", fontSize: 19 }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{label}</div>
                                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, marginTop: 2 }}>{description}</div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, padding: 20 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                    <Toggle checked={!!report.enabled} onChange={(v) => update(report.id, "enabled", v)} />
                                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "#334155" }}>
                                        {report.enabled ? "Envoi activé" : "Envoi désactivé"}
                                    </Typography>
                                </Box>

                                <Field label="Fréquence" width={260}>
                                    <SelectField value={report.frequency} onChange={(v) => update(report.id, "frequency", v)} options={FREQUENCIES} minWidth={260} />
                                </Field>

                                {report.frequency === "WEEKLY" && (
                                    <Field label="Jour"><SelectField value={report.dayOfWeek || 1} onChange={(v) => update(report.id, "dayOfWeek", v)} options={WEEK_DAYS} minWidth={200} /></Field>
                                )}
                                {report.frequency === "MULTIPLE_WEEKLY" && (
                                    <Field label="Jours" width={300}>
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            {WEEK_DAYS.map(([value, name]) => {
                                                const actif = selectedDays(report.daysOfWeek).includes(value);
                                                return (
                                                    <button key={value} type="button" aria-pressed={actif} onClick={() => toggleDay(report, value)}
                                                        style={{ height: 36, padding: "0 14px", borderRadius: 18, cursor: "pointer", fontFamily: "inherit", fontWeight: actif ? 600 : 500, fontSize: 13,
                                                            border: actif ? "none" : "1px solid #cbd5e1", background: actif ? P : "#fff", color: actif ? "#fff" : "#334155" }}>
                                                        {name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </Field>
                                )}
                                {report.frequency === "MONTHLY_DATE" && <Field label="Jour du mois" width={140}>{number(report, "dayOfMonth")}</Field>}
                                {report.frequency === "MONTHLY_WEEK" && (
                                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                        <Field label="Occurrence"><SelectField value={report.weekOfMonth || 1} onChange={(v) => update(report.id, "weekOfMonth", v)} options={WEEKS} minWidth={180} /></Field>
                                        <Field label="Jour"><SelectField value={report.dayOfWeek || 1} onChange={(v) => update(report.id, "dayOfWeek", v)} options={WEEK_DAYS} minWidth={180} /></Field>
                                    </Box>
                                )}
                                {report.frequency === "QUARTERLY" && (
                                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                        <Field label="Mois du trimestre"><SelectField value={report.monthOfQuarter || 1} onChange={(v) => update(report.id, "monthOfQuarter", v)} options={MONTHS_OF_QUARTER} minWidth={180} /></Field>
                                        <Field label="Jour du mois" width={140}>{number(report, "dayOfMonth")}</Field>
                                    </Box>
                                )}

                                <Field label="Heure d'envoi" width={150}>
                                    <TextField {...fieldProps} fullWidth={false} type="time" value={normalizeTime(report.sendTime)}
                                        onChange={(e) => update(report.id, "sendTime", e.target.value)} sx={{ ...fieldProps.sx, width: 150 }} />
                                </Field>
                            </div>

                            {/* Résumé : le réglage en clair et les dates données par le serveur */}
                            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px 18px", alignSelf: "start" }}>
                                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                                    <EventIcon style={{ color: P, fontSize: 20, marginTop: 1 }} />
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: ".5px", textTransform: "uppercase" }}>Envoi prévu</div>
                                        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{report.enabled ? quand(report) : "Envoi désactivé"}</div>
                                    </div>
                                </div>
                                <LigneInfo libelle="Prochaine relance" valeur={formatExecution(report.nextExecutionAt, report.enabled, "Non planifiée")} fort />
                                <LigneInfo libelle="Dernière relance envoyée" valeur={formatExecution(report.lastSentAt, report.enabled, "Jamais")} />
                                <LigneInfo libelle="Dernier contrôle" valeur={formatExecution(report.lastExecutionAt, report.enabled, "Jamais")} />
                                <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 9, fontSize: 12, color: "#64748b" }}>
                                    <AccessTimeIcon style={{ fontSize: 15 }} /> Fuseau horaire : {report.timezone || DEFAULT_TIMEZONE}
                                </div>
                                <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 6 }}>Les dates se mettent à jour après l'enregistrement.</div>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 20px", borderTop: "1px solid #f1f5f9", flexWrap: "wrap" }}>
                            <OutlineButton startIcon={<SendIcon />} onClick={() => { setTestEmail(currentUserEmail()); setTestReport(report); }}>Tester l'envoi</OutlineButton>
                            <LoadingButton variant="contained" sx={primarySx} loading={savingId === report.id} loadingPosition="start" startIcon={<SaveIcon />} onClick={() => saveReport(report)}>
                                Enregistrer
                            </LoadingButton>
                        </div>
                    </section>
                );
            })()}

            {/* Fuseau horaire (commun aux deux rapports) */}
            <SlaDialog
                open={fuseauOuvert} onClose={() => setFuseauOuvert(false)} icon={PublicIcon} loading={savingTimezone} onSubmit={saveTimezone}
                title="Fuseau horaire de la planification" subtitle="S'applique à l'heure d'envoi et aux jours planifiés des deux rapports"
            >
                <FieldLabel>Fuseau horaire</FieldLabel>
                <Autocomplete
                    size="small" options={TIMEZONES} value={timezone} disableClearable
                    onChange={(_, value) => setTimezone(value || DEFAULT_TIMEZONE)}
                    renderInput={(params) => <TextField {...params} {...fieldProps} fullWidth InputProps={{ ...params.InputProps, startAdornment: <PublicIcon sx={{ fontSize: 18, color: "#94A3B8", mr: 0.5 }} /> }} />}
                />
            </SlaDialog>

            <SlaDialog
                open={Boolean(testReport)} onClose={() => setTestReport(null)} icon={SendIcon} loading={testing} onSubmit={sendTest}
                title="Tester l'envoi" subtitle={testReport ? (RECIPIENTS[testReport.recipientType] || {}).label : ""} submitLabel="Envoyer" submitIcon={SendIcon}
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
