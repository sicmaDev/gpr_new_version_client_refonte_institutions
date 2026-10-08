import axios from "axios";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// API du suivi des délais (SLA). Le serveur est la seule source de vérité : le navigateur n'effectue
// aucun calcul de date, il affiche ce que renvoie le bloc « sla ».

const BASE = HOST + "api/v1/sla";

const headers = () => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + loadItemFromSessionStorage("token"),
});

// Renvoie le contenu de la réponse, ou lève une erreur avec un message lisible.
const call = async (method, path, { params, data } = {}) => {
    try {
        const response = await axios({ method, url: BASE + path, headers: headers(), params, data });
        return response.data?.content;
    } catch (error) {
        const content = error?.response?.data?.content;
        const message = content?.message || error?.response?.data?.message || "Erreur lors de l'appel au serveur";
        const err = new Error(message);
        err.status = error?.response?.status;
        throw err;
    }
};

// ── Lecture ──────────────────────────────────────────────────────────────────

export const slaStatus = () => call("get", "/status");
export const slaSummary = (type) => call("get", "/summary", { params: { type } });
export const slaItems = ({ type, state, q, page = 0, size = 20 } = {}) =>
    call("get", "/items", { params: { type, state, q, page, size } });
export const slaCount = (state = "DEPASSE", type) => call("get", "/count", { params: { state, type } });
export const slaForClaim = (type, id) => call("get", `/claim/${type}/${id}`);
export const slaStats = ({ type, from, to } = {}) => call("get", "/stats", { params: { type, from, to } });

// ── Actions sur une plainte ──────────────────────────────────────────────────

export const slaWaitCustomer = (type, id, reason) =>
    call("post", `/claim/${type}/${id}/wait-customer`, { data: { reason } });
export const slaResume = (type, id) => call("post", `/claim/${type}/${id}/resume`);
export const slaJustify = (type, id, reasonId, comment) =>
    call("post", `/claim/${type}/${id}/justification`, { data: { reasonId, comment } });
export const slaAddContactAttempt = (id, channel, reached, comment) =>
    call("post", `/claim/CLAIM/${id}/contact-attempts`, { data: { channel, reached, comment } });
export const slaContactAttempts = (id) => call("get", `/claim/CLAIM/${id}/contact-attempts`);
export const slaWaitingMessage = (id) => call("post", `/claim/CLAIM/${id}/waiting-message`);
export const slaCloseUnreachable = (id, reasonId) =>
    call("post", `/claim/CLAIM/${id}/close-unreachable`, { data: { reasonId } });

// ── Configuration (administrateur) ───────────────────────────────────────────

export const slaPolicies = () => call("get", "/policies");
export const slaSavePolicies = (policies) => call("put", "/policies", { data: policies });
export const slaCalendar = () => call("get", "/calendar");
export const slaSaveCalendar = (days) => call("put", "/calendar", { data: days });
export const slaHolidays = () => call("get", "/holidays");
export const slaAddHoliday = (holiday) => call("post", "/holidays", { data: holiday });
export const slaUpdateHoliday = (id, holiday) => call("put", `/holidays/${id}`, { data: holiday });
export const slaDeleteHoliday = (id) => call("delete", `/holidays/${id}`);
export const slaReasons = (kind) => call("get", "/breach-reasons", { params: { kind } });
export const slaAddReason = (reason) => call("post", "/breach-reasons", { data: reason });
export const slaUpdateReason = (id, reason) => call("put", `/breach-reasons/${id}`, { data: reason });
export const slaDeleteReason = (id) => call("delete", `/breach-reasons/${id}`);
export const slaSettings = () => call("get", "/settings");
export const slaSaveSettings = (values) => call("put", "/settings", { data: values });

// ── Aides d'affichage (aucun calcul de date) ─────────────────────────────────

// Libellés et couleurs des états renvoyés par le serveur.
export const SLA_STATES = {
    EN_COURS:   { label: "Dans les délais",          color: "#059669", bg: "#ECFDF5" },
    A_RISQUE:   { label: "À risque",                 color: "#D97706", bg: "#FFFBEB" },
    DEPASSE:    { label: "En retard",                color: "#DC2626", bg: "#FEF2F2" },
    SUSPENDU:   { label: "En pause",                 color: "#64748B", bg: "#F1F5F9" },
    RESPECTE:   { label: "Respecté",                 color: "#047857", bg: "#D1FAE5" },
    HORS_DELAI: { label: "Hors délai réglementaire", color: "#7F1D1D", bg: "#FEE2E2" },
    ANNULE:     { label: "Annulé",                   color: "#94A3B8", bg: "#F8FAFC" },
};

export const OWNER_LEVELS = {
    AGENT: "Agent",
    RA: "Chef d'agence",
    DIRECTION: "Direction",
    PILOTE: "Pilote",
    DE: "Directeur exécutif",
};

// Met en forme des minutes restantes (ou de retard) : « 2 j 3 h », « 45 min ».
// minutesPerDay vient du serveur (jour ouvré ou jour calendaire).
export const formatMinutes = (minutes, minutesPerDay = 1440) => {
    if (minutes === null || minutes === undefined) return "-";
    const abs = Math.abs(minutes);
    const days = Math.floor(abs / minutesPerDay);
    const hours = Math.floor((abs % minutesPerDay) / 60);
    const mins = abs % 60;
    if (days > 0) return hours > 0 ? `${days} j ${hours} h` : `${days} j`;
    if (hours > 0) return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
    return `${mins} min`;
};

// Délai maximum (en jours) qu'on peut accorder à un agent lors d'une affectation : le délai de résolution restant
// de la plainte quand le suivi des délais est actif, sinon l'ancien calcul (délai de l'objet, ou 45 jours).
export const affectationMaxDays = (claim) => {
    const s = claim?.sla;
    if (s && s.remainingMinutes > 0) {
        return Math.max(1, Math.ceil(s.remainingMinutes / (s.minutesPerDay || 1440)));
    }
    return claim?.objet?.processingTime ? claim.objet.processingTime : 45;
};

// Date lisible depuis le texte ISO envoyé par le serveur (affichage seulement).
export const formatDateTime = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
