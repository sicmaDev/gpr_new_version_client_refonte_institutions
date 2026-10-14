import React, { useEffect, useRef, useState } from "react";
import ee from "event-emitter";
import { Dialog, DialogActions, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const emitter = new ee();

// Fenêtre de confirmation de l'application (suppression d'un fichier, d'un audio ou d'un contenu, transmission...).
// L'appel reste le même : modalify(titre, message, "confirm", fonctionSiOui).
export const modalify = (title, msg, type, handleCallback) => {
    emitter.emit("modal", title, msg, type, handleCallback);
};

const outlineButton = { padding: "9px 22px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 13.5, cursor: "pointer" };

const Modal = () => {
    const [state, setState] = useState({ show: false, title: "", msg: "" });
    const callbackRef = useRef(() => {});

    useEffect(() => {
        const onModal = (title, msg, type, handleCallback) => {
            callbackRef.current = handleCallback || (() => {});
            setState({ show: true, title: title || "Confirmation", msg: msg || "" });
        };
        emitter.on("modal", onModal);
        return () => emitter.off("modal", onModal);
    }, []);

    const close = () => setState((s) => ({ ...s, show: false }));
    const confirm = (e) => { close(); callbackRef.current(e); };

    // une suppression est présentée en rouge, les autres confirmations aux couleurs du thème
    const danger = /suppr|supprim|delete/i.test(state.msg);
    const Icon = danger ? DeleteIcon : HelpOutlineIcon;
    const header = danger
        ? "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)"
        : "linear-gradient(135deg, var(--gpr-primary-dark) 0%, var(--gpr-primary) 100%)";
    const action = danger
        ? { background: "linear-gradient(135deg, #991b1b, #ef4444)" }
        : { background: "var(--gpr-primary, #005081)" };

    return (
        <Dialog open={state.show} onClose={close} fullWidth maxWidth="xs" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
            <div style={{ background: header, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon style={{ color: "#fff", fontSize: 20 }} />
                    </div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{state.title}</div>
                </div>
                <IconButton onClick={close} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
                    <CloseIcon style={{ fontSize: 16 }} />
                </IconButton>
            </div>
            <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{state.msg}</p>
            </DialogContent>
            <DialogActions style={{ padding: "12px 20px 16px", gap: 10 }}>
                <button type="button" onClick={close} style={outlineButton}>Non</button>
                <button type="button" onClick={confirm} style={{ ...action, padding: "9px 26px", borderRadius: 8, border: "none", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
                    Oui
                </button>
            </DialogActions>
        </Dialog>
    );
};

export default Modal;
