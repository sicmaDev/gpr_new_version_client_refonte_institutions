import React from "react";
import { SLA_STATES, formatMinutes } from "../../apis/Sla/SlaApi";

// Pastille SLA réutilisable (listes, en-tête de traitement, alertes). Elle n'affiche que ce que le serveur
// renvoie dans le bloc « sla » : aucun calcul de date ici. Rien n'est affiché si le SLA n'est pas actif
// (bloc absent), pour que l'interface reste identique à celle d'avant.
//
// Props :
//   sla      : bloc « sla » d'une plainte
//   showTime : affiche le temps restant ou le retard à côté de l'état (défaut : oui)
//   bar      : affiche une barre de progression sous la pastille
const SlaBadge = ({ sla, showTime = true, bar = false, style }) => {
    if (!sla || !sla.state) return null;
    // dossier terminé mais après l'échéance : rien à faire, c'est seulement l'historique
    const finishedLate = sla.state === "DEPASSE" && sla.phase === "DONE";
    const info = finishedLate
        ? { label: "Terminé hors délai", color: "#92400E", bg: "#FEF3C7" }
        : SLA_STATES[sla.state] || SLA_STATES.EN_COURS;
    const perDay = sla.minutesPerDay || 1440;

    let timeText = null;
    if (showTime && sla.remainingMinutes !== null && sla.remainingMinutes !== undefined) {
        timeText = sla.remainingMinutes < 0
            ? `${formatMinutes(sla.remainingMinutes, perDay)} de retard`
            : `${formatMinutes(sla.remainingMinutes, perDay)} restant`;
    }

    return (
        <div style={{ display: "inline-flex", flexDirection: "column", gap: 3, minWidth: 0, ...style }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span
                    title={sla.paused ? "Délai interne en pause : en attente du client" : undefined}
                    style={{
                        fontSize: 11, fontWeight: 700, color: info.color, background: info.bg,
                        padding: "2px 9px", borderRadius: 20, whiteSpace: "nowrap",
                    }}
                >
                    {info.label}
                </span>
                {timeText && <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>{timeText}</span>}
            </div>
            {bar && sla.consumedPct !== null && sla.consumedPct !== undefined && (
                <div style={{ width: "100%", height: 5, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, sla.consumedPct)}%`, height: "100%", background: info.color, borderRadius: 99 }} />
                </div>
            )}
        </div>
    );
};

export default SlaBadge;
