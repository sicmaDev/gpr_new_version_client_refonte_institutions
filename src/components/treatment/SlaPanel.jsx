import React, { useEffect, useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField,
} from "@mui/material";
import SlaBadge from "../shared/SlaBadge";
import {
  OWNER_LEVELS, formatDateTime, slaWaitCustomer, slaResume, slaJustify, slaReasons,
  slaAddContactAttempt, slaContactAttempts, slaCloseUnreachable, slaWaitingMessage,
} from "../../apis/Sla/SlaApi";
import { notify } from "../../Utils/alert";

const CHANNELS = [
  ["APPEL", "Appel"], ["SMS", "SMS"], ["WHATSAPP", "WhatsApp"], ["EMAIL", "E-mail"], ["VISITE", "Visite"],
];

const row = (label, value) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, padding: "3px 0" }}>
    <span style={{ color: "#94a3b8" }}>{label}</span>
    <span style={{ color: "#334155", fontWeight: 600, textAlign: "right" }}>{value}</span>
  </div>
);

const smallButton = (primary, color = "#0f4c81") => ({
  padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", width: "100%",
  border: primary ? "none" : `1.5px solid ${color}40`, background: primary ? color : "#fff", color: primary ? "#fff" : color,
});

/**
 * Suivi du délai d'une plainte : échéance, responsable, remontée automatique, et les actions qui arrêtent
 * l'escalade (mettre en attente du client, reprendre, justifier un retard). Pour une réclamation traitée,
 * tentatives de contact du client et clôture « client injoignable » (Pilote). Rien n'est affiché si le SLA
 * n'est pas actif.
 */
const SlaPanel = ({ claimType, claimId, sla, onChanged }) => {
  const user = JSON.parse(sessionStorage.getItem("app-user") || "{}");
  const isPilote = user?.additionalRole === "PILOTE";

  const [dialog, setDialog] = useState(null); // "wait" | "justify" | "contact" | null
  const [text, setText] = useState("");
  const [reasons, setReasons] = useState([]);
  const [reasonId, setReasonId] = useState("");
  const [channel, setChannel] = useState("APPEL");
  const [reached, setReached] = useState(false);
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState([]);

  const closure = sla?.delay === "CLOTURE" && claimType === "CLAIM";

  const loadAttempts = () => slaContactAttempts(claimId).then(setAttempts).catch(() => setAttempts([]));
  useEffect(() => { if (closure) loadAttempts(); }, [closure, claimId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!sla || !sla.state) return null;

  const open = sla.phase === "OPEN";
  const done = sla.phase === "DONE" || sla.phase === "CANCELLED";
  const overdue = sla.state === "DEPASSE" || sla.state === "HORS_DELAI";

  const run = async (action, success) => {
    setBusy(true);
    try {
      await action();
      if (success) notify(success, "success");
      setDialog(null);
      setText("");
      if (onChanged) await onChanged();
      if (closure) loadAttempts();
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const openJustify = () => {
    slaReasons("RETARD").then((list) => { setReasons(list || []); setReasonId(list?.[0]?.id ?? ""); });
    setDialog("justify");
  };

  const failed = attempts.filter((a) => !a.reached).length;

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)", padding: 14 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>
        Suivi du délai {closure ? "de clôture" : ""}
      </div>

      <SlaBadge sla={sla} bar style={{ width: "100%" }} />

      <div style={{ marginTop: 10 }}>
        {row("Échéance", formatDateTime(sla.dueAt))}
        {sla.regulatoryDueAt && row("Limite réglementaire", formatDateTime(sla.regulatoryDueAt))}
        {row("Responsable", sla.ownerName ? `${sla.ownerName} · ${OWNER_LEVELS[sla.ownerLevel] || ""}` : "Non affectée")}
        {sla.paused && row("État", "En attente du client")}
      </div>

      {sla.autoEscalated && (
        <div style={{ marginTop: 10, background: "#f5f3ff", border: "1px solid #ddd6fe", borderLeft: "4px solid #7c3aed", borderRadius: 10, padding: "8px 10px", fontSize: 12, color: "#5b21b6" }}>
          Remontée automatiquement{sla.escalatedFrom ? <> depuis <strong>{sla.escalatedFrom}</strong></> : ""} :
          le dossier est maintenant chez <strong>{sla.ownerName || "-"}</strong>
          {sla.ownerLevel ? ` (${OWNER_LEVELS[sla.ownerLevel]})` : ""}.
        </div>
      )}
      {sla.regulatoryBreached && (
        <div style={{ marginTop: 10, background: "#fee2e2", border: "1px solid #fecaca", borderLeft: "4px solid #7f1d1d", borderRadius: 10, padding: "8px 10px", fontSize: 12, color: "#7f1d1d" }}>
          Hors délai réglementaire : la limite de réponse est dépassée.
        </div>
      )}
      {sla.justified && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#0369a1" }}>Le retard a été justifié.</div>
      )}

      {/* Actions : elles comptent comme une action humaine et arrêtent la remontée */}
      {!done && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          {open && !closure && claimType !== "SUGGESTION" && (
            <button style={smallButton(false, "#64748b")} onClick={() => { setText(""); setDialog("wait"); }}>
              Mettre en attente du client
            </button>
          )}
          {sla.paused && (
            <button style={smallButton(true, "#059669")} disabled={busy}
              onClick={() => run(() => slaResume(claimType, claimId), "Délai relancé")}>
              Reprendre le traitement
            </button>
          )}
          {overdue && !sla.justified && (
            <button style={smallButton(false, "#0369a1")} onClick={openJustify}>Justifier le retard</button>
          )}
          {/* Message d'attente au client : réclamations seulement (jamais une dénonciation) */}
          {sla.state === "DEPASSE" && claimType === "CLAIM" && sla.customerMessage === "MANUAL" && (
            <button style={smallButton(false, "#0891b2")} disabled={busy}
              onClick={() => run(() => slaWaitingMessage(claimId), "Message d'attente envoyé au client")}>
              Envoyer un message d'attente au client
            </button>
          )}
          {sla.state === "DEPASSE" && claimType === "CLAIM" && sla.customerMessage === "AUTO" && (
            <div style={{ fontSize: 11.5, color: "#64748b" }}>Un message d'attente est envoyé automatiquement au client.</div>
          )}
        </div>
      )}

      {/* Réclamation traitée : contact du client pour mesurer sa satisfaction */}
      {closure && !done && (
        <div style={{ marginTop: 14, borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
            Contact du client ({attempts.length} tentative{attempts.length > 1 ? "s" : ""}, {failed} sans succès)
          </div>
          {attempts.slice(0, 4).map((a) => (
            <div key={a.id} style={{ fontSize: 11.5, color: "#64748b", padding: "2px 0" }}>
              {a.channel} · {a.reached ? "joint" : "non joint"} · {formatDateTime(a.createdAt)}
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            <button style={smallButton(false, "#0891b2")} onClick={() => { setText(""); setChannel("APPEL"); setReached(false); setDialog("contact"); }}>
              Enregistrer une tentative
            </button>
            {isPilote && (
              <button style={smallButton(false, "#475569")} disabled={busy}
                title="Possible après le nombre de tentatives sans succès paramétré"
                onClick={() => run(() => slaCloseUnreachable(claimId, null), "Plainte clôturée : client injoignable")}>
                Clôturer : client injoignable
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mettre en attente du client */}
      <Dialog open={dialog === "wait"} onClose={() => setDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>Mettre en attente du client</DialogTitle>
        <DialogContent>
          <div style={{ fontSize: 12.5, color: "#64748b", marginBottom: 10 }}>
            Le délai interne est mis en pause. L'échéance réglementaire de 30 jours continue, elle.
          </div>
          <TextField fullWidth multiline minRows={2} label="Motif (pièce attendue...)" value={text} onChange={(e) => setText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Annuler</Button>
          <Button variant="contained" disabled={busy}
            onClick={() => run(() => slaWaitCustomer(claimType, claimId, text), "Dossier mis en attente du client")}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Justifier le retard */}
      <Dialog open={dialog === "justify"} onClose={() => setDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>Justifier le retard</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Motif" value={reasonId} onChange={(e) => setReasonId(e.target.value)} sx={{ mt: 1, mb: 2 }}>
            {reasons.map((r) => <MenuItem key={r.id} value={r.id}>{r.libelle}</MenuItem>)}
          </TextField>
          <TextField fullWidth multiline minRows={2} label="Commentaire" value={text} onChange={(e) => setText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Annuler</Button>
          <Button variant="contained" disabled={busy || !reasonId}
            onClick={() => run(() => slaJustify(claimType, claimId, reasonId, text), "Retard justifié")}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tentative de contact */}
      <Dialog open={dialog === "contact"} onClose={() => setDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>Tentative de contact du client</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Canal" value={channel} onChange={(e) => setChannel(e.target.value)} sx={{ mt: 1, mb: 2 }}>
            {CHANNELS.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </TextField>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 12 }}>
            <input type="checkbox" checked={reached} onChange={(e) => setReached(e.target.checked)} />
            Le client a été joint
          </label>
          <TextField fullWidth multiline minRows={2} label="Commentaire" value={text} onChange={(e) => setText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Annuler</Button>
          <Button variant="contained" disabled={busy}
            onClick={() => run(() => slaAddContactAttempt(claimId, channel, reached, text), "Tentative enregistrée")}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SlaPanel;
