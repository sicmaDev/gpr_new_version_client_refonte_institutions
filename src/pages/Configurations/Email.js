import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import { cleanPhoneNumber, isValidPhone, loadItemFromLocalStorage, loadItemFromSessionStorage, sleep, today } from "../../Utils/utils";
import { connect } from "react-redux";
import { ajout, test } from "../../apis/Configurations/MailApi";

import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import DnsIcon from '@mui/icons-material/Dns';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { LOGO_SUPPORTED_SIZE } from "../../Utils/globals";
import {
    portChanged, hostChanged, passwordChanged, userChanged, loadingChanged, etatChanged
} from "../../redux/actions/Configurations/EmailActions";
import { licenseInfo } from "../../apis/LoginApi";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { KTApp } from "../../Utils/blockui";
import { notify } from "../../Utils/alert";
import { Button, Box, Typography, IconButton, Dialog, DialogActions, DialogContent } from "@mui/material";
import { ForwardToInboxOutlined } from "@mui/icons-material";

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

const Email = (props) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    const [showTestModal, setShowTestModal] = useState(false);
    const [to, setTo] = useState(null)
    const [subject, setSubject] = useState(null)
    const [message, setMessage] = useState(null)

    const handleTest = async () => {
        if (to !== "" && to && subject !== "" && subject && message !== "" && message) {
            setShowTestModal(false);
            KTApp.blockPage({
                overlayColor: '#000000',
                type: 'v2',
                state: 'danger',
                message: 'En cours...'
            });
            await sleep(3000);
            test({ to, subject, message }).then(({ data }) => {
                notify("Super - Mail envoyé", "success");
                resetTestForm();
            }).catch((err) => {
                notify("Oups - Mail non envoyé; Vérifier la configuration de votre serveur", "error");
            }).finally(() => {
                KTApp.unblockPage();
            })
        } else {
            notify("Les champs sont obligatoires", "error")
        }


    }

    useEffect(() => {

        try {
            let appMail = loadItemFromLocalStorage("app-mail") !== undefined ? loadItemFromLocalStorage("app-mail") : undefined;

            if (appMail !== undefined || appMail !== "") {
                props.userChanged(appMail.user)
                props.hostChanged(appMail.host)
                props.portChanged(appMail.port)
                props.passwordChanged(appMail.pwd)

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
    const resetTestForm = () => {
        setTo("");
        setSubject("");
        setMessage("");
    };

    const handleValidation = () => {
        let isValid = true;

        if ((props.user === "" || props.user === undefined || props.user === null)) {
            isValid = false;
            errors["user"] = "Champ incorrect";
        }
        if ((props.host === "" || props.host === undefined || props.host === null)) {
            isValid = false;
            errors["host"] = "Champ incorrect";
        }
        if ((props.port === "" || props.port === undefined || props.port === null)) {
            isValid = false;
            errors["port"] = "Champ incorrect";
        }
        if ((props.password === "" || props.password === undefined || props.password === null)) {
            isValid = false;
            errors["password"] = "Champ incorrect";
        }

        return isValid
    }




    const handleSubmit = (e) => {
        e.preventDefault()
        if (handleValidation) {
            let item = {}
            item["host"] = props.host;
            item["port"] = props.port;
            item["user"] = props.user;
            item["pwd"] = props.password;

            props.etatChanged(true)
            ajout(item, props).then(() => {
                // handleCancel(e)
            })

        }

    }

    const validHost = !!props.host;
    const validUser = !!props.user && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(props.user);
    const validPort = !!props.port;
    const validPassword = !!props.password;

    return (
        <div className="card-panel pb-5">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: 2, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MailOutlineIcon sx={{ color: "var(--gpr-primary, #005081)", fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Serveur mail</Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.3 }}>Il s'agit d'enregistrer les accès à votre serveur mail pour pouvoir envoyer des mails</Typography>
                </Box>
            </Box>

            <Box component="form" id="accountForm" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <SectionTitle icon={DnsIcon} title="Serveur" subtitle="host, port" />
                        <Box>
                            <label style={labelStyle}>Serveur (Host) <FieldCheck valid={validHost} /></label>
                            <input value={props.host || ""} onChange={(e) => props.hostChanged(e.target.value)} placeholder="Ex: smtp.gmail.com"
                                style={inputStyle(false)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                        </Box>
                        <Box>
                            <label style={labelStyle}>Port <FieldCheck valid={validPort} /></label>
                            <input value={props.port || ""} onChange={(e) => props.portChanged(e.target.value)} placeholder="Ex: 465"
                                style={inputStyle(false)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <SectionTitle icon={LockOutlinedIcon} title="Authentification" subtitle="utilisateur, mot de passe" />
                        <Box>
                            <label style={labelStyle}>Utilisateur mail (User) <FieldCheck valid={validUser} /></label>
                            <input value={props.user || ""} onChange={(e) => props.userChanged(e.target.value)} placeholder="Ex: contact@domaine.com"
                                style={inputStyle(false)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                        </Box>
                        <Box>
                            <label style={labelStyle}>Mot de Passe (Password) <FieldCheck valid={validPassword} /></label>
                            <Box sx={{ position: "relative" }}>
                                <input type={showPassword ? "text" : "password"} value={props.password || ""} onChange={(e) => props.passwordChanged(e.target.value)} placeholder="••••••••"
                                    style={{ ...inputStyle(false), paddingRight: 40 }} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                                <IconButton onClick={toggleShowPassword} size="small" sx={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)" }}>
                                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                </IconButton>
                            </Box>
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
                            <label style={labelStyle}>Email</label>
                            <input type="email" defaultValue={to} onChange={(e) => setTo(e.target.value)} placeholder="destinataire@domaine.com"
                                style={inputStyle(false)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                        </Box>
                        <Box>
                            <label style={labelStyle}>Objet</label>
                            <input defaultValue={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Objet du message"
                                style={inputStyle(false)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                        </Box>
                        <Box>
                            <label style={labelStyle}>Message</label>
                            <textarea defaultValue={message} onChange={(e) => setMessage(e.target.value)} placeholder="Contenu du message"
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
        loading: state.mail.loading,
        port: state.mail.port,
        password: state.mail.password,
        user: state.mail.user,
        host: state.mail.host,
        etat: state.mail.etat,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        portChanged: (port) => {
            dispatch(portChanged(port))
        },
        hostChanged: (host) => {
            dispatch(hostChanged(host))
        },
        userChanged: (user) => {
            dispatch(userChanged(user))
        },
        passwordChanged: (password) => {
            dispatch(passwordChanged(password))
        },
        loadingChanged: (loading) => {
            dispatch(loadingChanged(loading))
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat));
        },
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Email)