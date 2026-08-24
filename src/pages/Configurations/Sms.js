import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import { cleanPhoneNumber, cleanPhoneNumber3, isValidPhone, loadItemFromLocalStorage, loadItemFromSessionStorage, sleep, today } from "../../Utils/utils";
import { connect } from "react-redux";
import { ajout, test } from "../../apis/Configurations/SmsApi";

import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import LinkIcon from '@mui/icons-material/Link';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    urlChange, smsErrors, libelleIdChanged, libelleMessageChanged, valuePwdChanged, libellePwdChanged, libelleReceiverChanged, libelleSenderChanged, valueIdChanged, valueSenderChanged, etatChanged
} from "../../redux/actions/Configurations/SmsActions";
import { licenseInfo } from "../../apis/LoginApi";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ForwardToInboxOutlined } from "@mui/icons-material";
import { Button, Box, Typography, Tooltip, IconButton, Dialog, DialogActions, DialogContent } from "@mui/material";
import { KTApp } from "../../Utils/blockui";
import { notify } from "../../Utils/alert";

const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" };
const inputStyle = (hasError) => ({ width: "100%", boxSizing: "border-box", border: hasError ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "10.5px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", height: 40 });
const textareaStyle = (hasError) => ({ width: "100%", boxSizing: "border-box", border: hasError ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "10.5px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", minHeight: 80, fontFamily: "inherit", resize: "vertical" });

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Icon sx={{ fontSize: 16, color: "var(--gpr-primary, #005081)" }} />
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: "var(--gpr-primary, #005081)", textTransform: "uppercase", letterSpacing: "0.6px" }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>{subtitle}</Typography>}
    </Box>
);

const FieldCheck = ({ valid }) => valid
    ? <CheckCircleIcon sx={{ fontSize: 14, color: "#16a34a", verticalAlign: "middle", ml: 0.6 }} />
    : null;

const FieldWithHelp = ({ label, tooltip, value, onChange, error, valid, type = "text", showToggle, show, onToggle }) => (
    <Box>
        <label style={labelStyle}>
            {label}
            <FieldCheck valid={valid} />{" "}
            {tooltip && <Tooltip title={tooltip}><HelpOutlineIcon sx={{ fontSize: 14, color: "#94a3b8", verticalAlign: "middle" }} /></Tooltip>}
        </label>
        <Box sx={{ position: "relative" }}>
            <input type={showToggle ? (show ? "text" : "password") : type} value={value || ""} onChange={onChange}
                style={{ ...inputStyle(error), paddingRight: showToggle ? 40 : 14 }}
                onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = error ? "#ef4444" : "#e2e8f0"; }} />
            {showToggle && (
                <IconButton onClick={onToggle} size="small" sx={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)" }}>
                    {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
            )}
        </Box>
        {error && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{error}</div>}
    </Box>
);


const Sms = (props) => {

    const [showPassword, setShowPassword] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowPassword1 = () => {
        setShowPassword1(!showPassword1);
    };

    const handleChange = (e) => {
        props.posteChanged(e.value)
        props.posteLibelleChanged(e.label)
    }

    useEffect(() => {
        try {
            let appSms = loadItemFromLocalStorage("app-sms") !== undefined && (loadItemFromLocalStorage("app-sms").length !== 0) ? loadItemFromLocalStorage("app-sms") : undefined;
            if (appSms !== undefined || appSms !== "") {
                props.urlChange(appSms.url)
                props.libelleIdChanged(appSms.libId);
                props.valueIdChanged(appSms.valId);
                props.libellePwdChanged(appSms.libMdp);
                props.valuePwdChanged(appSms.valMdp);
                props.libelleSenderChanged(appSms.libEmetteur);
                props.valueSenderChanged(appSms.valEmetteur);
                props.libelleReceiverChanged(appSms.libDestinataire);
                props.libelleMessageChanged(appSms.libMessage);

            } else {
            }
        } catch (e) {
        }


        //UI Fixes

        window.$('.dropdown-trigger').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrainWidth: false, // Does not change width of dropdown to that of the activator
            click: true, // Activate on hover
            gutter: 0, // Spacing from edge
            coverTrigger: false, // Displays dropdown below the button
            alignment: 'left', // Displays dropdown with edge aligned to the left of button
            stopPropagation: false // Stops event propagation
        }
        );

        window.$('.buttons-excel').html('<span><i class="fa fa-file-excel"></i></span>')
        window.$('ul.pagination').parent().parent().css({ marginTop: "1%", boxShadow: "none" })
        window.$('ul.pagination').parent().css({ boxShadow: "none" })
        window.$('ul.pagination').parent().addClass('white')
        window.$('ul.pagination').addClass('right-align')
        window.$('a.page-link input').addClass('indigo-text bold-text')
        window.$('.pagination li.disabled a').addClass('black-text')
        window.$('#as-react-datatable').removeClass('table-bordered table-striped')
        window.$('#as-react-datatable').addClass('highlight display dataTable dtr-inline')
        window.$('#as-react-datatable tr').addClass('cursor-pointer')
        window.$('.tooltipped').tooltip();
        //cleanup

    }, []);

    const [actif, setActif] = useState();

    const licenseControl = async () => {
        try {
            let resultat = await licenseInfo();
            // console.log("resultat", resultat);
            setActif(resultat.actif)

        } catch (error) {
            // console.error("Une erreur s'est produite :", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await licenseControl();
        };

        fetchData();
    }, []);

    let errors = {};

    const handleValidation = () => {
        let isValid = true;
        // console.log((props.url).indexOf("https"));


        // if (((props.url).indexOf("https://")=== 0)) {
        //     isValid = false;
        //     errors["url"] = "Entrez une url valide";
        // }
        if ((props.url === "" || props.url === undefined || props.url === null)) {
            isValid = false;
            errors["url"] = "Champ incorrect";
            // console.log("url");
        }
        if (props.libelleId === "" || props.libelleId === undefined || props.libelleId === null) {
            isValid = false;
            errors["libelle_id"] = "Champ incorrect";
            // console.log("libelle_id");
        }
        if (props.valueId === "" || props.valueId === undefined || props.valueId === null) {
            isValid = false;
            errors["value_id"] = "Champ incorrect";
            // console.log("value_id");
        }
        if (props.libellePwd === "" || props.libellePwd === undefined || props.libellePwd === null) {
            isValid = false;
            errors["libelle_pwd"] = "Champ incorrect";
            // console.log("libelle_pwd");
        }
        if (props.valuePwd === "" || props.valuePwd === undefined || props.valuePwd === null) {
            isValid = false;
            errors["value_pwd"] = "Champ incorrect";
            //console.log("value_pwd");
        }
        if (props.libelleSender === "" || props.libelleSender === undefined || props.libelleSender === null) {
            isValid = false;
            errors["libelle_sender"] = "Champ incorrect";
            //console.log("libelle_sender");
        }
        if (props.valueSender === "" || props.valueSender === undefined || props.valueSender === null) {
            isValid = false;
            errors["value_sender"] = "Champ incorrect";
            //console.log("value_sender");
        }
        if (props.libelleReceiver === "" || props.libelleReceiver === undefined || props.libelleReceiver === null) {
            isValid = false;
            errors["libelle_receiver"] = "Champ incorrect";
            // console.log("libelle_receiver");
        }
        if (props.libelleMessage === "" || props.libelleMessage === undefined || props.libelleMessage === null) {
            isValid = false;
            errors["libelle_message"] = "Champ incorrect";
            // console.log("libelle_message");
        }
        return isValid
    }
    const [showTestModal, setShowTestModal] = useState(false);
    const [messageTest, setMessageTest] = useState(null);
    const [phoneTest, setPhoneTest] = useState(null);

    const resetTestForm = () => {
        setMessageTest("");
        setPhoneTest("");
    };
    const handleSubmit = (e) => {
        e.preventDefault()

        if (handleValidation) {
            let item = {}
            item["url"] = props.url;
            item["libId"] = props.libelleId;
            item["valId"] = props.valueId;
            item["libMdp"] = props.libellePwd;
            item["valMdp"] = props.valuePwd;
            item["libEmetteur"] = props.libelleSender;
            item["valEmetteur"] = props.valueSender;
            item["libDestinataire"] = props.libelleReceiver;
            item["libMessage"] = props.libelleMessage;

            props.etatChanged(true)
            ajout(item, props).then(() => {
                // handleCancel(e)
            })

        }

        props.smsErrors(errors)
        //console.log(errors.contenu);
    }


    const handleTest = async () => {
        if (phoneTest !== "" && phoneTest && messageTest !== "" && messageTest) {

            setShowTestModal(false);
            KTApp.blockPage({
                overlayColor: '#000000',
                type: 'v2',
                state: 'danger',
                message: 'En cours...'
            });
            await sleep(3000);
            test({ phone: cleanPhoneNumber3(phoneTest), message: messageTest }).then(({ data }) => {
                // console.log("first : ",phoneTest);
                // console.log("second : ",cleanPhoneNumber3(phoneTest));
                notify("Super - SMS envoyé", "success");
                resetTestForm();
            }).catch((err) => {
                notify("Oups - SMS non envoyé; Vérifier la configuration de votre serveur", "error");
            }).finally(() => {
                KTApp.unblockPage();
            })
        } else {
            notify("Les champs sont obligatoires", "error")
        }

    }

    const validUrl = !!props.url;
    const validLibelleId = !!props.libelleId;
    const validValueId = !!props.valueId;
    const validLibellePwd = !!props.libellePwd;
    const validValuePwd = !!props.valuePwd;
    const validLibelleSender = !!props.libelleSender;
    const validValueSender = !!props.valueSender;
    const validLibelleReceiver = !!props.libelleReceiver;
    const validLibelleMessage = !!props.libelleMessage;

    return (
        <div className="card-panel pb-5">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: 2, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SmsOutlinedIcon sx={{ color: "var(--gpr-primary, #005081)", fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Configuration SMS</Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.3 }}>Il s'agit de configurer GPR pour utiliser l'API de votre fournisseur de SMS Banking</Typography>
                </Box>
            </Box>

            <Box component="form" id="accountForm" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>

                    {/* Colonne gauche */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <SectionTitle icon={LinkIcon} title="Information Générale" />
                        <Box>
                            <label style={labelStyle}>API URL (url) <FieldCheck valid={validUrl} /></label>
                            <input type="url" value={props.url || ""} onChange={(e) => props.urlChange(e.target.value)} placeholder="https://api.fournisseur.com/sms"
                                style={inputStyle(props.smsErrors.url)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = props.smsErrors.url ? "#ef4444" : "#e2e8f0"; }} />
                            {props.smsErrors.url && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{props.smsErrors.url}</div>}
                        </Box>

                        <SectionTitle icon={VpnKeyIcon} title="Informations d'identification de votre compte SMS Banking" />
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                            <FieldWithHelp label="Libellé paramètre id" tooltip="Nom du paramètre représentant l'identifiant de votre compte SMS Banking."
                                value={props.libelleId} onChange={(e) => props.libelleIdChanged(e.target.value)} error={props.smsErrors.libelle_id} valid={validLibelleId} />
                            <FieldWithHelp label="Valeur id" tooltip="Valeur de l'identifiant de votre compte SMS Banking."
                                value={props.valueId} onChange={(e) => props.valueIdChanged(e.target.value)} error={props.smsErrors.value_id} valid={validValueId} />
                        </Box>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                            <FieldWithHelp label="Libellé paramètre mot de passe" tooltip="(Nom du paramètre représentant le mot de passe de votre compte SMS Banking.)"
                                value={props.libellePwd} onChange={(e) => props.libellePwdChanged(e.target.value)} error={props.smsErrors.libelle_pwd} valid={validLibellePwd}
                                showToggle show={showPassword1} onToggle={toggleShowPassword1} />
                            <FieldWithHelp label="Valeur mot de passe" tooltip="(Valeur du mot de passe de votre compte SMS Banking.)"
                                value={props.valuePwd} onChange={(e) => props.valuePwdChanged(e.target.value)} error={props.smsErrors.value_pwd} valid={validValuePwd}
                                showToggle show={showPassword} onToggle={toggleShowPassword} />
                        </Box>
                    </Box>

                    {/* Colonne droite */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <SectionTitle icon={SendIcon} title="Informations sur l'émetteur SMS Banking" />
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                            <FieldWithHelp label="Libellé paramètre émetteur" tooltip="Nom du paramètre représentant le sender de votre compte SMS Banking."
                                value={props.libelleSender} onChange={(e) => props.libelleSenderChanged(e.target.value)} error={props.smsErrors.libelle_sender} valid={validLibelleSender} />
                            <FieldWithHelp label="Valeur émetteur" tooltip="Valeur du sender configuré auprès de votre fournisseur SMS Banking."
                                value={props.valueSender} onChange={(e) => props.valueSenderChanged(e.target.value)} error={props.smsErrors.value_sender} valid={validValueSender} />
                        </Box>

                        <SectionTitle icon={ChatBubbleOutlineIcon} title="Informations sur le récepteur" />
                        <Box>
                            <FieldWithHelp label="Libellé paramètre destinataire" tooltip="Nom du paramètre représentant le destinataire du message."
                                value={props.libelleReceiver} onChange={(e) => props.libelleReceiverChanged(e.target.value)} error={props.smsErrors.libelle_receiver} valid={validLibelleReceiver} />
                        </Box>

                        <SectionTitle icon={ChatBubbleOutlineIcon} title="Informations sur le message" />
                        <Box>
                            <FieldWithHelp label="Libellé paramètre message" tooltip="Nom du paramètre représentant le message à envoyer au client."
                                value={props.libelleMessage} onChange={(e) => props.libelleMessageChanged(e.target.value)} error={props.smsErrors.libelle_message} valid={validLibelleMessage} />
                        </Box>
                    </Box>
                </Box>

                <Box sx={{
                    position: "sticky", bottom: 0, zIndex: 5, mt: 3, pt: 2, pb: 1,
                    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2,
                    background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", borderTop: "1px solid #e2e8f0",
                }}>
                    <Typography sx={{ fontSize: 12, color: "#94a3b8", mr: "auto" }}>
                        Les champs marqués d'un <CheckCircleIcon sx={{ fontSize: 12, color: "#16a34a", verticalAlign: "middle" }} /> sont valides
                    </Typography>
                    <LoadingButton
                        onClick={() => setShowTestModal(true)}
                        variant="outlined"
                        startIcon={<ForwardToInboxOutlined style={{ fontSize: 16 }} />}
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, borderColor: "#e2e8f0", color: "var(--gpr-primary, #005081)", "&:hover": { borderColor: "var(--gpr-primary, #005081)", background: "#eef2ff" } }}
                    >
                        Tester
                    </LoadingButton>
                    <LoadingButton
                        onClick={(e) => handleSubmit(e)}
                        loading={props.etat}
                        loadingPosition="start"
                        startIcon={<SaveIcon style={{ fontSize: 16 }} />}
                        variant="contained"
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "var(--gpr-primary, #005081)", "&:hover": { background: "var(--gpr-primary-dark, #003d63)" }, "&.Mui-disabled": { opacity: 0.6 } }}
                    >
                        Enregistrer
                    </LoadingButton>
                </Box>
            </Box>

            {/* ── Modal test ── */}
            <Dialog open={showTestModal} onClose={() => setShowTestModal(false)} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                <div style={{ background: "linear-gradient(135deg, var(--gpr-primary-dark) 0%, var(--gpr-primary) 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ForwardToInboxOutlined style={{ color: "#fff", fontSize: 20 }} />
                        </div>
                        <div>
                            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Vérification de la configuration</div>
                            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 2 }}>Renseigner les informations nécessaires pour le test</div>
                        </div>
                    </div>
                    <IconButton onClick={() => setShowTestModal(false)} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}>
                        <CloseIcon style={{ fontSize: 16 }} />
                    </IconButton>
                </div>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box>
                            <label style={labelStyle}>Téléphone</label>
                            <input type="tel" value={phoneTest || ""} onChange={(e) => setPhoneTest(e.target.value)} placeholder="Ex: +225 07 00 00 00 00"
                                style={inputStyle(false)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                        </Box>
                        <Box>
                            <label style={labelStyle}>Message</label>
                            <textarea defaultValue={messageTest} onChange={(e) => setMessageTest(e.target.value)} placeholder="Contenu du message"
                                style={textareaStyle(false)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                    <Button onClick={() => setShowTestModal(false)} variant="outlined"
                        sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>
                        Fermer
                    </Button>
                    <LoadingButton onClick={handleTest} variant="contained" startIcon={<ForwardToInboxOutlined style={{ fontSize: 16 }} />}
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "var(--gpr-primary, #005081)", "&:hover": { background: "var(--gpr-primary-dark, #003d63)" } }}>
                        Envoyer
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </div>
    )
}
const mapStateToProps = (state) => {
    return {
        loading: state.sms.loading,
        url: state.sms.url,
        libelleId: state.sms.libelleId,
        valueId: state.sms.valueId,
        libellePwd: state.sms.libellePwd,
        valuePwd: state.sms.valuePwd,
        libelleSender: state.sms.libelleSender,
        valueSender: state.sms.valueSender,
        libelleReceiver: state.sms.libelleReceiver,
        libelleMessage: state.sms.libelleMessage,
        etat: state.sms.etat
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        smsErrors: (err) => {
            dispatch(smsErrors(err))
        },
        urlChange: (url) => {
            dispatch(urlChange(url))
        },
        libelleIdChanged: (libelleId) => {
            dispatch(libelleIdChanged(libelleId))
        },
        valueIdChanged: (valueId) => {
            dispatch(valueIdChanged(valueId))
        },
        libellePwdChanged: (libellePwd) => {
            dispatch(libellePwdChanged(libellePwd))
        },
        valuePwdChanged: (valuePwd) => {
            dispatch(valuePwdChanged(valuePwd))
        },
        libelleSenderChanged: (libelleSender) => {
            dispatch(libelleSenderChanged(libelleSender))
        },
        valueSenderChanged: (valueSender) => {
            dispatch(valueSenderChanged(valueSender))
        },
        libelleReceiverChanged: (libelleReceiver) => {
            dispatch(libelleReceiverChanged(libelleReceiver))
        },
        libelleMessageChanged: (libelleMessage) => {
            dispatch(libelleMessageChanged(libelleMessage))
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat))
        },

    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Sms)