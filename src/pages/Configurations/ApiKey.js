import React, { useEffect, useState } from "react";
import { cleanPhoneNumber, isValidPhone, loadItemFromLocalStorage, loadItemFromSessionStorage, today } from "../../Utils/utils";
import { connect } from "react-redux";

import ReactDatatable from '@ashvin27/react-datatable';
import { Dialog, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';
import { ajout, apiKeyTokenDelete, apiKeyTokenGenerator, apiKeyTokenReGenerator, apiKeyTokens, genererToken } from "../../apis/Configurations/BotApi";
import {
    apiKeyChanged, apiSecretChanged, gprbotErrors, etatChanged, etat1Changed, qrcodeChanged
} from "../../redux/actions/Configurations/BotActions";
import { LoadingButton } from "@mui/lab";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { notify } from "../../Utils/alert";
import axios from "axios";
import { licenseInfo } from "../../apis/LoginApi";
import { QRCode } from 'react-qrcode-logo';
import logo from '../../assets/images/GPR_192.png';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button, Chip, Box, Typography, Tooltip } from "@mui/material";
import ConfigKPIBar from "../../components/shared/ConfigKPIBar";
import ConfigTable from "../../components/shared/ConfigTable";
import ConfigCardView from "../../components/shared/ConfigCardView";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import AddIcon from "@mui/icons-material/Add";

import ViewModeToggle from "../../components/shared/ViewModeToggle";

const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" };
const inputStyle = (hasError) => ({ width: "100%", boxSizing: "border-box", border: hasError ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "10.5px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", height: 40 });
const textareaStyle = (hasError) => ({ width: "100%", boxSizing: "border-box", resize: "vertical", border: hasError ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "9px 12px", fontSize: 13, outline: "none", background: "#fff", color: "#1e293b", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit" });

const ApiKey = (props) => {
    let appBot;
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    const [apiKeyList, setApiKeyList] = useState([])
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null, isDeleted: false, loading: false });
    const [viewMode, setViewMode] = useState("list");
    const [addModalOpen, setAddModalOpen] = useState(false);

    const handleDisabledModal = (e, spId, isDeleted = false) => {
        e.stopPropagation();
        setConfirmModal({ open: true, id: spId, isDeleted, loading: false });
    }

    const handleConfirmAction = () => {
        const { id, isDeleted } = confirmModal;
        setConfirmModal(p => ({ ...p, loading: true }));
        const action = isDeleted ? deleteTokenApi(id) : regenerateTokenApi(id);
        Promise.resolve(action).finally(() => setConfirmModal({ open: false, id: null, isDeleted: false, loading: false }));
    }


    useEffect(() => {


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

    let columns = [
        {
            key: "name",
            text: "Intitulé",
            className: "name",
            align: "left",
            sortable: true,
        },
        {
            key: "description",
            text: "Description",
            className: "description",
            align: "left",
            sortable: true
        },
        {
            key: "cle",
            text: "API KEY",
            className: "api_key",
            align: "left",
            sortable: false
        },
        {
            key: "action",
            text: "Actions",
            className: "action",
            align: "left",
            cell: (user) => {

                return <div style={{ display: 'flex', }}>
                    <Chip label="Régénérer" onClick={(e) => handleDisabledModal(e, user.id)} />
                    <Chip label="Supprimer" color="error" onClick={(e) => handleDisabledModal(e, user.id, true)} style={{ marginLeft: "5px" }} />
                </div>



            }
        },

    ];

    let config = {
        page_size: 15,
        length_menu: [15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        button: {
            //excel: true,
            //pdf: true,
            //print: true,
        },
        language: {
            length_menu: "Afficher _MENU_ éléments",
            filter: "Rechercher...",
            info: "Affichage de l'élement _START_ à _END_ sur _TOTAL_ éléments",
            zero_records: "Aucun élément à afficher",
            no_data_text: "Aucun élément à afficher",
            loading_text: "Chargement en cours...",
            pagination: {
                first: <FirstPageIcon />,
                previous: <ChevronLeftIcon />,
                next: <ChevronRightIcon />,
                last: <LastPageIcon />
            }
        }
    }
    const rowClickedHandler = (event, data, rowIndex) => {
        // console.log('data', data)
    }

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
        getApiKeys()
    }, []);





    const [keyField, setKeyField] = useState({
        libelle: "",
        description: "",
        secret: null,
        key: null
    });
    const getApiKeys = () => {
        apiKeyTokens().then(({ data }) => {
            // console.log('data', data.content)
            setApiKeyList(data.content);

        }).catch((err) => {
            notify("Une erreur s'est produite", "error")
        })
    }
    const createTokenApi = (e) => {
        e.preventDefault();
        apiKeyTokenGenerator(keyField).then(({ data }) => {
            notify("L'API KEY a ete généré", "success")
            setKeyField({ ...keyField, secret: data.content.api_secret, key: data.content.api_key })
            getApiKeys(data);
        }).catch((err) => {
            notify("Une erreur s'est produite", "error")
        })

    }
    const regenerateTokenApi = (id) => {
        apiKeyTokenReGenerator(id).then(({ data }) => {
            notify(`la clé a été regénéré,le API SECRET est ${data.content.api_secret}  `, "success")
            setKeyField({ ...keyField, secret: data.content.api_secret, key: data.content.api_key })
            getApiKeys()

        }).catch((err) => {
            notify("Une erreur s'est produite", "error")
        })
    }
    const deleteTokenApi = (id) => {
        apiKeyTokenDelete(id).then(({ data }) => {
            notify(`la clé a été supprimée  `, "success");
            getApiKeys()

        }).catch((err) => {
            notify("Une erreur s'est produite", "error")
        })
    }

    return (
        <>

            {/* ── Modal génération / ajout ── */}
            <Dialog
                open={addModalOpen}
                onClose={() => { if (!props.etat) { setAddModalOpen(false); setKeyField({ libelle: "", description: "", secret: null, key: null }); } }}
                fullWidth
                maxWidth="sm"
                PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}
            >
                {/* Header */}
                <div style={{
                    background: "linear-gradient(135deg, var(--gpr-primary-dark) 0%, var(--gpr-primary) 100%)",
                    padding: "18px 24px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 9,
                            background: "rgba(255,255,255,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <VpnKeyIcon style={{ color: "#fff", fontSize: 20 }} />
                        </div>
                        <div>
                            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Générer une clé API</div>
                            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, marginTop: 2 }}>
                                Utilisée par GPR BOT pour l'authentification
                            </div>
                        </div>
                    </div>
                    <IconButton
                        onClick={() => { if (!props.etat) { setAddModalOpen(false); setKeyField({ libelle: "", description: "", secret: null, key: null }); } }}
                        disabled={props.etat} size="small"
                        style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}
                    >
                        <CloseIcon style={{ fontSize: 16 }} />
                    </IconButton>
                </div>

                {/* Contenu */}
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                        <Box>
                            <label style={labelStyle}>Libellé <span style={{ color: "#ef4444" }}>*</span></label>
                            <input value={keyField.libelle} onChange={(e) => setKeyField({ ...keyField, libelle: e.target.value })} maxLength={36} placeholder="Ex: Clé du module BOT"
                                style={inputStyle(props.gprbotErrors.apiKey)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                            {props.gprbotErrors.apiKey && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{props.gprbotErrors.apiKey}</div>}
                        </Box>
                        <Box sx={{ gridColumn: "1 / -1" }}>
                            <label style={labelStyle}>Description</label>
                            <textarea value={keyField.description} onChange={(e) => setKeyField({ ...keyField, description: e.target.value })} rows={3} placeholder="Ex: Clé pour les notifications BOT"
                                style={textareaStyle(false)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
                        </Box>
                        <Box>
                            <label style={labelStyle}>API Secret</label>
                            <Box sx={{ position: "relative" }}>
                                <input value={keyField.secret || ""} type={showPassword ? "text" : "password"} readOnly disabled style={{ ...inputStyle(false), background: "#f8fafc", color: "#94a3b8", paddingRight: 40 }} />
                                <IconButton onClick={toggleShowPassword} size="small" sx={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)" }}>
                                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                </IconButton>
                            </Box>
                        </Box>
                        <Box>
                            <label style={labelStyle}>API Key</label>
                            <input value={keyField.key || ""} readOnly disabled style={{ ...inputStyle(false), background: "#f8fafc", color: "#94a3b8" }} />
                        </Box>
                    </Box>
                </DialogContent>

                {/* Footer */}
                <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                    <Button
                        onClick={() => { setAddModalOpen(false); setKeyField({ libelle: "", description: "", secret: null, key: null }); }}
                        disabled={props.etat}
                        variant="outlined"
                        sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}
                    >
                        Fermer
                    </Button>
                    <LoadingButton onClick={(e) => createTokenApi(e)} loading={props.etat} loadingPosition="start" startIcon={<VpnKeyIcon style={{ fontSize: 16 }} />} variant="contained"
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "var(--gpr-primary, #005081)", "&:hover": { background: "var(--gpr-primary-dark, #003d63)" }, "&.Mui-disabled": { opacity: 0.6 } }}>
                        Générer
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            <div className="card-panel pb-5">
                <ConfigKPIBar items={apiKeyList} kpis={[{ key: "total", label: "Total API Keys", icon: VpnKeyIcon, iconBg: "#EDE9FE", iconColor: "#6D28D9", borderColor: "#8B5CF6", filter: () => true }]} />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Liste des API KEY</Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <ViewModeToggle value={viewMode} onChange={setViewMode} />
                        <LoadingButton
                            onClick={() => setAddModalOpen(true)}
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                textTransform: "none", borderRadius: 2, fontWeight: 700,
                                background: "var(--gpr-primary, #005081)",
                                "&:hover": { background: "var(--gpr-primary-dark, #003d63)" },
                                fontSize: "0.82rem", px: 2.5, whiteSpace: "nowrap",
                            }}
                        >
                            Ajouter
                        </LoadingButton>
                    </Box>
                </Box>
                {viewMode === "list" ? (
                    <ConfigTable
                        items={apiKeyList}
                        columns={[
                            { id: "name",        label: "Intitul\u00e9",    sortable: true,  minWidth: 180 },
                            { id: "description", label: "Description",  sortable: true,  minWidth: 200 },
                            { id: "cle",         label: "API KEY",      sortable: false, minWidth: 220 },
                            { id: "actions",     label: "Actions",     sortable: false, minWidth: 200, render: (user) => (
                                <div style={{ display: "flex", gap: "6px" }}>
                                    <Chip label="Régénérer" size="small" onClick={(e) => handleDisabledModal(e, user.id)} />
                                    <Chip label="Supprimer" size="small" color="error" onClick={(e) => handleDisabledModal(e, user.id, true)} />
                                </div>
                            )},
                        ]}
                        searchFields={["name", "description", "cle"]}
                        defaultSort="name"
                    />
                ) : (
                    <ConfigCardView items={apiKeyList} titleField="name" subtitleField="description" searchFields={["name", "description", "cle"]}
                        extraFields={[{ label: "API Key", render: (k) => k.cle || "-" }]}
                        onDelete={(user) => handleDisabledModal({ stopPropagation: () => {} }, user.id, true)} />
                )}
            </div>

            <Dialog open={confirmModal.open} onClose={() => { if (!confirmModal.loading) setConfirmModal({ open: false, id: null, isDeleted: false, loading: false }); }} fullWidth maxWidth="xs" PaperProps={{ style: { borderRadius: 16, overflow: "hidden" } }}>
                <div style={{ background: confirmModal.isDeleted ? "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)" : "linear-gradient(135deg, var(--gpr-primary-dark) 0%, var(--gpr-primary) 100%)", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {confirmModal.isDeleted ? <DeleteIcon style={{ color: "#fff", fontSize: 20 }} /> : <AutorenewIcon style={{ color: "#fff", fontSize: 20 }} />}
                        </div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{confirmModal.isDeleted ? "Supprimer la clé API" : "Régénérer la clé API"}</div>
                    </div>
                    <IconButton onClick={() => setConfirmModal({ open: false, id: null, isDeleted: false, loading: false })} disabled={confirmModal.loading} size="small" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8 }}><CloseIcon style={{ fontSize: 16 }} /></IconButton>
                </div>
                <DialogContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: 14, color: "#475569" }}>
                        {confirmModal.isDeleted ? "Voulez-vous vraiment supprimer cette clé API ? Cette action est irréversible." : "Voulez-vous vraiment régénérer cette clé API ? La clé actuelle sera invalidée."}
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: "12px 20px 16px", borderTop: "1px solid #f1f5f9", gap: 10 }}>
                    <Button onClick={() => setConfirmModal({ open: false, id: null, isDeleted: false, loading: false })} disabled={confirmModal.loading} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b", fontWeight: 600, px: 3 }}>Annuler</Button>
                    <LoadingButton onClick={handleConfirmAction} loading={confirmModal.loading} loadingPosition="start" startIcon={confirmModal.isDeleted ? <DeleteIcon style={{ fontSize: 15 }} /> : <AutorenewIcon style={{ fontSize: 15 }} />} variant="contained" color={confirmModal.isDeleted ? "error" : "primary"}
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: confirmModal.isDeleted ? "linear-gradient(135deg, #991b1b, #ef4444)" : "linear-gradient(135deg, #b45309, #f59e0b)", "&:hover": { background: confirmModal.isDeleted ? "linear-gradient(135deg, #7f1d1d, #dc2626)" : "linear-gradient(135deg, #92400e, #d97706)" }, "&.Mui-disabled": { opacity: 0.6 } }}>
                        {confirmModal.isDeleted ? "Supprimer" : "Régénérer"}
                    </LoadingButton>
                </DialogActions>
            </Dialog>

        </>
    )
}

const mapStateToProps = (state) => {
    return {
        apiKey: state.gprbot.apiKey,
        apiSecret: state.gprbot.apiSecret,
        gprbotErrors: state.gprbot.gprbotErrors,
        etat: state.gprbot.etat,
        etat1: state.gprbot.etat1,
        qrcode: state.gprbot.qrcode
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        gprbotErrors: (err) => {
            dispatch(gprbotErrors(err))
        },
        apiKeyChanged: (apikey) => {
            dispatch(apiKeyChanged(apikey))
        },
        apiSecretChanged: (apiSecret) => {
            dispatch(apiSecretChanged(apiSecret))
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat))
        },
        etat1Changed: (etat1) => {
            dispatch(etat1Changed(etat1))
        },
        qrcodeChanged: (qrcode) => {
            dispatch(qrcodeChanged(qrcode))
        },

    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ApiKey)