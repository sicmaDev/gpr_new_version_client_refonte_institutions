import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";

import DatePicker, { registerLocale } from "react-datepicker";
import fr from 'date-fns/locale/fr';
import "react-datepicker/dist/react-datepicker.css";
import HelpIcon from '@mui/icons-material/Help';
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { connect } from "react-redux";
import { v4 as uuid } from "uuid";
import { cleanPhoneNumber, cleanPhoneNumber2, cleanPhoneNumber3, groupBy, guessExtension, handleDatePicker, isEmpty, isSettingComplete, isValidDate, isValidPhone, loadItemFromLocalStorage, loadItemFromSessionStorage, sleep } from "../../Utils/utils";
import http from "../../apis/http-common";
import { KTApp } from "../../Utils/blockui";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import { notify } from "../../Utils/alert";
import axios from "axios";
import { addressChanged, codeChanged, collectChanged, collectLibelleChanged, contentChanged, createdAtChanged, createdByChanged, dossierimfChanged, etat2Changed, etatChanged, firstnameChanged, genderChanged, handledAtChanged, handledByChanged, idChanged, itemsChanged, languageChanged, languageLibelleChanged, lastnameChanged, loading, phoneChanged, productChanged, productLibelleChanged, recordedAtChanged, recordedAtDPChanged, resolvedAtChanged, resolvedByChanged, selectedFilesChanged, selectedFilesReset, selectedItemChanged, selectedItemFilesChanged, showSelectPrintItemChanged, solutionChanged, statusChanged, suggestionRecordErrors, unitChanged, unitLibelleChanged, selectedItemAudioChanged, emailChanged } from "../../redux/actions/Suggestions/EnregistrementSuggestionActions";
import { addSuggestionApi, addSuggestionApiOffline, addTempSuggestionApi, addTempSuggestionApiOffline, downloadFillesApi, getFillesApi, getSuggeAudioApi, listeByStatut, deleteSuggestionApi, listeByStatutOffline } from "../../apis/Suggestions/SuggestionsApi";
import PhoneInput from "react-phone-number-input";
import { licenseInfo } from "../../apis/LoginApi";
import { INSTITUTION_PAYS_CODE } from "../../Utils/globals";
import useRecorder from "../../hooks/useRecorder";
import RecorderControls from "../../components/recorder-controls";
import { Mic } from "@mui/icons-material";
import { downloadAudioApi } from "../../apis/Reclamations/ReclamationsApi";
import moment from "moment";
import { downloadFilesApi } from "../../apis/WhatsappApi";
import { reset } from "../../redux/actions/WhatsappActions";
import { CancelOutlined } from "@mui/icons-material";
import { modalify } from "../../Utils/modal";
import { Tooltip, IconButton, CircularProgress } from "@mui/material";
import { send } from "../../apis/Configurations/SmsApi";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { sendEmail } from "../../apis/Configurations/MailApi";
import "moment/locale/fr";
import WizardLayout from "../../components/shared/WizardLayout";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningIcon from '@mui/icons-material/Warning';
import MicIcon from "@mui/icons-material/Mic";
moment.locale("fr");
registerLocale('fr', fr);

const styles = {
    control: (base) => ({ ...base, minHeight: 38, borderRadius: 4 }),
    menu: (provided) => ({ ...provided, zIndex: 9999 }),
    placeholder: (base) => ({ ...base, fontSize: 13, color: "#9e9e9e" }),
    singleValue: (base) => ({ ...base, fontSize: 13 }),
};

const EnregistrerSuggestion = (props) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [activeTab, setActiveTab] = useState("new");
    const [isDragging, setIsDragging] = useState(false);
    const [audioRecordings, setAudioRecordings] = useState([]);
    const prevAudioRef = useRef(null);

    const [open, setOpen] = React.useState(false);
    const [files, setFiles] = React.useState([]);
    const [open2, setOpen2] = React.useState(false);
    const [showAudioBox, setAudioBox] = useState(false);
    const { recorderState, ...handlers } = useRecorder();
    let { audio } = recorderState;

    const [isLoading, setIsLoading] = useState(false);
    const [showSmsBox, setShowSmsBox] = useState(false);
    const smsDefault = "Cher(e) beneficiaire, votre suggestion a bien ete prise en compte. Notre equipe dediee s'en occupe et vous contactera prochainement. Merci de contribuer a l'amelioration de nos services.";
    const [smsToSend, setSmsToSend] = useState(smsDefault);

    let settingComplete = isSettingComplete();
    let mode = loadItemFromLocalStorage("app-mode") !== undefined ? (JSON.parse(loadItemFromLocalStorage("app-mode"))) : undefined;
    let user = loadItemFromSessionStorage("app-user") !== undefined ? (JSON.parse(loadItemFromSessionStorage("app-user"))) : undefined;
    let appInstitution = loadItemFromLocalStorage("app-institution") !== undefined && (loadItemFromLocalStorage("app-institution").length !== 0) ? JSON.parse(loadItemFromLocalStorage("app-institution")) : undefined;

    useEffect(() => {
        if (audio != null && audio !== prevAudioRef.current) {
            prevAudioRef.current = audio;
            setAudioRecordings(prev => [...prev, audio]);
        }
    }, [audio]);

    const handleClose = () => { setOpen(false); };
    const handleClose2 = () => { setOpen2(false); };

    useEffect(() => {
        KTApp.blockPage({ overlayColor: '#000000', type: 'v2', state: 'danger', message: 'En cours de chargement...' });
        setIsLoading(true);
        if (mode === 1) {
            props.itemsChanged([]);
            listeByStatut(props, "TEMP_SAVED").then(() => { }).finally(() => { setIsLoading(false); KTApp.unblockPage(); });
        } else {
            props.itemsChanged([]);
            listeByStatutOffline(props, "TEMP_SAVED").then(() => { }).finally(() => { setIsLoading(false); KTApp.unblockPage(); });
        }
        window.$('#as-react-datatable').removeClass('table-bordered table-striped');
        window.$('#as-react-datatable').addClass('highlight display dataTable dtr-inline');
        clearComponentState();
    }, []);

    const [actif, setActif] = useState();
    const licenseControl = async () => {
        try { let r = await licenseInfo(); setActif(r.actif); } catch (e) { }
    };

    const languageRef = useRef(null);
    const recordedAtRef = useRef(null);
    const collectRef = useRef(null);
    const contentRef = useRef(null);
    const lastnameRef = useRef(null);
    const addressRef = useRef(null);
    const phoneRef = useRef(null);
    const genderRef = useRef(null);
    const productRef = useRef(null);
    const unitRef = useRef(null);

    useEffect(() => { licenseControl(); }, []);

    const handleChange = (e) => { props.unitChanged(e.value); props.unitLibelleChanged(e.label); };
    const handleChange1 = (e) => { props.productChanged(e.value); props.productLibelleChanged(e.label); };
    const handleChange3 = (e) => { props.collectChanged(e.value); props.collectLibelleChanged(e.label); };
    const handleChange4 = (e) => { props.languageChanged(e.value); props.languageLibelleChanged(e.label); };

    let languages, collects, products, units;
    try {
        languages = JSON.parse(loadItemFromLocalStorage('app-langues'));
        collects = JSON.parse(loadItemFromLocalStorage('app-supports'));
        products = JSON.parse(loadItemFromLocalStorage('app-produits'));
        units = JSON.parse(loadItemFromLocalStorage('app-ps'));
    } catch (e) {
        languages = []; collects = []; products = []; units = [];
    }

    const genderOptions = [
        { value: 'HOMME', label: 'Homme' },
        { value: 'FEMME', label: 'Femme' },
    ];
    const languageOptions = languages !== undefined ? languages.map(l => ({ label: l.libelle, value: l.id })) : [];
    const collectOptions = collects !== undefined ? collects.map(c => ({ label: c.libelle, value: c.id })) : [];
    const productOptions = products !== undefined ? products.map(p => ({ label: p.libelle, value: p.id })) : [];

    units = units.filter((un) => !un.deleted);
    const unitsGroupByType = units !== undefined ? groupBy(units, "type") : undefined;
    const agencyOptions = unitsGroupByType?.["AGENCE"]?.map(a => ({ label: a.libelle, value: a.id })) ?? "";
    const directionOptions = unitsGroupByType?.["DIRECTION"]?.map(d => ({ label: d.libelle, value: d.id })) ?? "";
    const guichetOptions = unitsGroupByType?.["GUICHET"]?.map(g => ({ label: g.libelle, value: g.id })) ?? "";
    let unitOptions = [];
    if (directionOptions !== "") unitOptions.push({ label: "Direction", options: directionOptions });
    if (agencyOptions !== "") unitOptions.push({ label: "Agence", options: agencyOptions });
    if (guichetOptions !== "") unitOptions.push({ label: "Guichet", options: guichetOptions });

    const [showAudioPlayer, setAudioPlayer] = useState("");
    const [currentAudio, setCurrentAudio] = useState("");
    const [clearAudio, setClearAudio] = useState(0);

    let errors = {};

    const clearComponentState = () => {
        props.idChanged("");
        props.lastnameChanged("");
        props.addressChanged("");
        props.phoneChanged("");
        props.genderChanged("");
        props.languageChanged("");
        props.languageLibelleChanged("");
        props.emailChanged("");
        props.dossierimfChanged("");
        props.collectChanged("");
        props.collectLibelleChanged("");
        props.codeChanged("");
        props.recordedAtChanged("");
        props.recordedAtDPChanged("");
        props.productChanged("");
        props.productLibelleChanged("");
        props.unitChanged("");
        props.unitLibelleChanged("");
        props.contentChanged("");
        props.suggestionsRecordErrors("");
        props.selectedFilesReset([]);
        props.selectedItemChanged({});
        props.selectedItemFilesChanged([]);
        props.selectedItemAudioChanged([]);
        setClearAudio(prev => prev + 1);
        handlers.cancelRecording();
        setFiles([]);
        setAudioRecordings([]);
        prevAudioRef.current = null;
        setCurrentStep(0);
        setActiveTab("new");
    };

    const handleCancel = (e) => { e.preventDefault(); clearComponentState(); };

    const handleValidation = () => {
        let isValid = true;
        if (!props.language) { isValid = false; errors["language"] = "Champ incorrect"; }
        if (!props.recorded_at || !isValidDate(props.recorded_at)) { isValid = false; errors["recorded_at"] = "Champ incorrect"; }
        if (!props.collect) { isValid = false; errors["collect"] = "Champ incorrect"; }
        if (
            (!props.content || props.content === "") &&
            audioRecordings.length === 0 &&
            (!props.selectedItemAudio || props.selectedItemAudio.length === 0)
        ) {
            isValid = false;
            errors["content"] = "Champ incorrect";
        }
        return isValid;
    };

    const handleStepValidation = (step) => {
        let isValid = true;
        let errs = {};
        if (step === 0) {
            if (!props.language) { isValid = false; errs["language"] = "Champ requis"; }
        } else if (step === 1) {
            if (!props.recorded_at || !isValidDate(props.recorded_at)) { isValid = false; errs["recorded_at"] = "Champ requis"; }
            if (!props.collect) { isValid = false; errs["collect"] = "Champ requis"; }
            if (
                (!props.content || props.content === "") &&
                audioRecordings.length === 0 &&
                (!props.selectedItemAudio || props.selectedItemAudio.length === 0)
            ) {
                isValid = false;
                errs["content"] = "Champ requis";
            }
        }
        props.suggestionsRecordErrors(errs);
        return isValid;
    };

    const handleNext = () => {
        if (handleStepValidation(currentStep)) setCurrentStep(s => s + 1);
    };

    useEffect(() => {
        if (props.whatsappCurrentInbox && props.whatsappSelectMessage?.length > 0) {
            clearComponentState();
            props.contentChanged(transformConversation(props.whatsappSelectMessage));
            props.phoneChanged(props.whatsappCurrentInbox.phone);
        }
    }, [""]);

    const transformConversation = (conversations = []) => {
        let result = "";
        const convert = conversations.sort((a, b) => parseInt(a.date) - parseInt(b.date));
        convert.forEach((msg) => {
            if (msg.type === "chat") {
                result += ` [${moment(parseInt(msg.date)).format("DD/MM/Y H:mm:ss")}]` + (msg.message_id.startsWith("false") ? " Plaignant: " : " GPR WHATSAPP: ") + " " + msg.content + " \n";
            }
        });
        return result;
    };

    let whatsappAttachmentList;
    if (props.whatsappSelectMessage.length > 0) {
        const preuves = props.whatsappSelectMessage?.filter(({ type }) => type !== "chat") ?? [];
        const whatsappAttachmentListChild = preuves.map((msg) => {
            let icon = guessExtension({ name: msg.type });
            return (
                <div className="col xl12 l12 m12 s12" key={msg.id}>
                    <div className="card box-shadow-none mb-1 app-file-info">
                        <div className="card-content">
                            <div className="row">
                                <div className="col xl1 l1 s1 m1">
                                    <img className="recent-file" src={icon} height="38" width="30" alt="" />
                                </div>
                                <div className="col xl11 l11 s11 m11">
                                    <div className="app-file-recent-details">
                                        <div className="app-file-name font-weight-700 truncate">{msg.content}</div>
                                        <div className="app-file-last-access">
                                            <span onClick={(e) => { e.preventDefault(); downloadFilesApi(msg.content); }} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#005081", cursor: "pointer", fontWeight: 600 }}><FileDownloadIcon style={{ fontSize: 14 }} /> Télécharger</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
        whatsappAttachmentList = preuves.length ? (
            <div className="col s12 app-file-content grey lighten-4">
                <span className="app-file-label">Pieces joints (Whatsapp)</span>
                <div className="row app-file-recent-access mb-3">{whatsappAttachmentListChild}</div>
            </div>
        ) : <></>;
    }

    const handleSubmit = (e, onSuccess = null) => {
        e.preventDefault();
        setShowSmsBox(false);
        setOpen(false);
        if (handleValidation()) {
            const formData = new FormData();
            let claim = {
                clientFirstAndLastName: props.lastname,
                gender: props.gender,
                address: props.address,
                phone: cleanPhoneNumber(props.phone),
                collectionChannelId: props.collect,
                servicePointId: props.unit,
                fromWhatsapp: (props.whatsappCurrentInbox && props.whatsappSelectMessage?.length > 0) ?? false,
                filesWhatsapp: props.whatsappSelectMessage?.filter(({ type }) => type !== "chat"),
                inboxWhatsapp: props.whatsappCurrentInbox ?? null,
                productId: props.product,
                languageId: props.language,
                folderCode: props.dossierimf,
                email: props.email,
                receiptDateTime: props.recorded_at,
                collectorId: user.id,
                content: props.content,
                code: props.code,
                id: props.id,
            };
            formData.append("suggestion", JSON.stringify(claim));
            for (let i = 0; i < files.length; i++) formData.append("files", files[i]);
            audioRecordings.forEach((audioBlob) => {
                formData.append("audios", new File([audioBlob], "suggestion_record_" + uuid() + ".ogg", { type: "audio/ogg; codecs=opus" }));
            });
            props.etat2Changed(true);
            if (mode === 1) {
                addSuggestionApi(formData, props).then((savedSuggestion) => {
                    clearComponentState();
                    props.resetWhatsapp();
                    if (onSuccess && savedSuggestion) onSuccess(savedSuggestion);
                });
            } else {
                addSuggestionApiOffline(claim, props).then(() => { clearComponentState(); props.resetWhatsapp(); });
            }
        }
        props.suggestionsRecordErrors(errors);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData();
        let claim = {
            clientFirstAndLastName: props.lastname,
            gender: props.gender,
            address: props.address,
            phone: cleanPhoneNumber(props.phone),
            fromWhatsapp: (props.whatsappCurrentInbox && props.whatsappSelectMessage?.length > 0) ?? false,
            filesWhatsapp: props.whatsappSelectMessage?.filter(({ type }) => type !== "chat"),
            inboxWhatsapp: props.whatsappCurrentInbox ?? null,
            collectionChannelId: props.collect,
            servicePointId: props.unit,
            productId: props.product,
            languageId: props.language,
            folderCode: props.dossierimf,
            email: props.email,
            receiptDateTime: props.recorded_at,
            collectorId: user.id,
            content: props.content,
            code: props.code,
            id: props.id,
        };
        formData.append("suggestion", JSON.stringify(claim));
        for (let i = 0; i < files.length; i++) formData.append("files", files[i]);
        audioRecordings.forEach((audioBlob) => {
            formData.append("audios", new File([audioBlob], "suggestion_record_" + uuid() + ".ogg", { type: "audio/ogg; codecs=opus" }));
        });
        props.etatChanged(true);
        if (mode === 1) {
            addTempSuggestionApi(formData, props).then(() => { clearComponentState(); });
        } else {
            addTempSuggestionApiOffline(claim, props).then(() => { clearComponentState(); });
        }
        props.suggestionsRecordErrors(errors);
    };

    const handleFinalSubmit = () => {
        if (mode === 1) {
            setShowSmsBox(true);
            setOpen(true);
        } else {
            handleSubmit({ preventDefault: () => { } });
        }
    };

    const handleDropzoneFiles = (newFiles) => {
        setFiles(prev => [...Array.from(prev), ...Array.from(newFiles)]);
    };

    const removeFile = (index) => {
        setFiles(prev => {
            const arr = Array.from(prev);
            arr.splice(index, 1);
            return arr;
        });
    };

    const removeAudio = (index) => {
        setAudioRecordings(prev => prev.filter((_, i) => i !== index));
    };

    const sendSms = (e) => {
        e.preventDefault();
        if (props.phone !== "" && props.phone) {
            KTApp.blockPage({ overlayColor: "#000000", type: "v2", state: "danger", message: "Enregistrement en cours..." });
            handleSubmit(e, async (savedSuggestion) => {
                const suggestionId = savedSuggestion?.id ?? null;
                const suggestionCode = savedSuggestion?.code ?? null;
                try {
                    await send({
                        phone: cleanPhoneNumber3(props.phone),
                        message: smsToSend,
                        claimId: suggestionId,
                        claimCode: suggestionCode,
                        claimType: "SUGGESTION",
                        senderName: user?.firstAndLastName || null,
                        senderEmail: user?.email || null,
                        clientName: props.lastname || null,
                    });
                    if (props.email && props.email !== "") {
                        await sendEmail({
                            email: props.email,
                            subject: "Accusé de réception - Votre suggestion a bien été enregistrée",
                            message: smsToSend,
                            claimId: suggestionId,
                            claimCode: suggestionCode,
                            claimType: "SUGGESTION",
                            senderName: user?.firstAndLastName || null,
                            senderEmail: user?.email || null,
                            clientName: props.lastname || null,
                        });
                        notify("Super - SMS et Email envoyé au client avec succès", "success");
                    } else {
                        notify("Super - SMS envoyé", "success");
                    }
                } catch (err) {
                    notify("Oups - SMS non envoyé", "error");
                } finally {
                    KTApp.unblockPage();
                }
            });
        } else {
            notify("Numéro de téléphone incorrect", "error");
        }
    };

    const [loadingId, setLoadingId] = useState(null);
    const handleEditClick = (claim) => (e) => { rowClickedHandler(e, claim, null); };
    const handleModal = (e, claim) => {
        e.preventDefault();
        modalify("Confirmation", "Confirmez vous la suppression de cet element ?", "confirm", (ev) => handleDelete(ev, claim));
    };
    const handleDelete = (e, claim = null) => {
        e.preventDefault();
        setLoadingId(claim.id);
        deleteSuggestionApi(claim.id, props).then(() => {
            listeByStatut(props, "TEMP_SAVED").then(() => { });
            handleCancel(e);
            notify("Suppression effectuee avec succes", "success");
            setTimeout(() => setLoadingId(null), 500);
        });
    };

    const fileToDataURL = (file) => {
        let reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.readAsDataURL(file);
            reader.onload = (e) => { props.selectedFilesChanged(e.target.result); resolve(e.target.result); };
            KTApp.unblockPage();
        });
    };



    const rowClickedHandler = (event, data, rowIndex) => {
        clearComponentState();
        props.resetWhatsapp();
        if (mode === 1) {
            props.idChanged(data.id ?? "");
            props.lastnameChanged(data.clientFirstAndLastName ?? "");
            props.addressChanged(data.address ?? "");
            props.phoneChanged(data.tel ? cleanPhoneNumber2(data.tel) : "");
            props.genderChanged(data.gender ?? "");
            props.languageChanged(data.langue?.id ?? "");
            props.languageLibelleChanged(data.langue?.libelle ?? "");
            props.dossierimfChanged(data.folderCode ?? "");
            props.emailChanged(data.email ?? "");
            props.codeChanged(data.code ?? "");
            props.recordedAtChanged(data.receiptDateTime ?? "");
            props.collectChanged(data.canal?.id ?? "");
            props.collectLibelleChanged(data.canal?.libelle ?? "");
            props.productChanged(data.produit?.id ?? "");
            props.productLibelleChanged(data.produit?.libelle ?? "");
            props.unitChanged(data.serviceIndexe?.id ?? "");
            props.unitLibelleChanged(data.serviceIndexe?.libelle ?? "");
            props.contentChanged(data.content ?? "");
            props.selectedItemChanged(data ?? "");
            getFillesApi(data.id, props);
            getSuggeAudioApi(data.id, props);
        } else {
            if (data.id) {
                props.idChanged(data.id ?? "");
                props.lastnameChanged(data.clientFirstAndLastName ?? "");
                props.addressChanged(data.address ?? "");
                props.phoneChanged(data.tel ? cleanPhoneNumber2(data.tel) : "");
                props.genderChanged(data.gender ?? "");
                props.languageChanged(data.langue?.id ?? "");
                props.languageLibelleChanged(data.langue?.libelle ?? "");
                props.dossierimfChanged(data.folderCode ?? "");
                props.emailChanged(data.email ?? "");
                props.codeChanged(data.code ?? "");
                props.recordedAtChanged(data.receiptDateTime ?? "");
                props.collectChanged(data.canal?.id ?? "");
                props.collectLibelleChanged(data.canal?.libelle ?? "");
                props.productChanged(data.produit?.id ?? "");
                props.productLibelleChanged(data.produit?.libelle ?? "");
                props.unitChanged(data.serviceIndexe?.id ?? "");
                props.unitLibelleChanged(data.serviceIndexe?.libelle ?? "");
                props.contentChanged(data.content ?? "");
                props.selectedItemChanged(data ?? "");
                getFillesApi(data.id, props);
                getSuggeAudioApi(data.id, props);
            } else {
                props.lastnameChanged(data.clientFirstAndLastName ?? "");
                props.addressChanged(data.address ?? "");
                props.phoneChanged(data.tel ? cleanPhoneNumber2(data.tel) : "");
                props.genderChanged(data.gender ?? "");
                props.dossierimfChanged(data.folderCode ?? "");
                props.emailChanged(data.email ?? "");
                props.codeChanged(data.code ?? "");
                props.recordedAtChanged(data.receiptDateTime ?? "");
                props.contentChanged(data.content ?? "");
                const description = data.languageId ? JSON.parse(loadItemFromSessionStorage('app-langues')).filter(e => e.id === data.languageId) : [];
                const description1 = data.collectionChannelId ? JSON.parse(loadItemFromSessionStorage('app-supports')).filter(e => e.id === data.collectionChannelId) : [];
                const description3 = data.productId ? JSON.parse(loadItemFromSessionStorage('app-produits')).filter(e => e.id === data.productId) : [];
                const description4 = data.servicePointId ? JSON.parse(loadItemFromSessionStorage('app-ps')).filter(e => e.id === data.servicePointId) : [];
                if (description.length) { props.languageChanged(description[0].id); props.languageLibelleChanged(description[0].libelle); }
                if (description1.length) { props.collectChanged(description1[0].id); props.collectLibelleChanged(description1[0].libelle); }
                if (description3.length) { props.productChanged(description3[0].id); props.productLibelleChanged(description3[0].libelle); }
                if (description4.length) { props.unitChanged(description4[0].id); props.unitLibelleChanged(description4[0].libelle); }
                props.selectedItemChanged(data ?? "");
                getSuggeAudioApi(data.id, props);
            }
        }
        setActiveTab("new");
    };

    let content = props.items;
    content.forEach(element => {
        element.createdAtFormated = new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "2-digit", hour: "numeric", minute: "numeric" }).format(new Date(element.createdAt));
    });

    const steps = [
        { label: "Client", icon: <PersonIcon /> },
        { label: "Informations", icon: <AssignmentOutlinedIcon /> },
        { label: "Pieces jointes", icon: <AttachFileIcon /> },
        { label: "Recapitulatif", icon: <TaskAltIcon /> },
    ];

    const apercu = {
        nom: props.lastname || null,
        telephone: props.phone || null,
        langue: props.languageLibelle || null,
        modalite: props.collectLibelle || null,
        produit: props.productLibelle || null,
        pointService: props.unitLibelle || null,
        dateReception: props.recorded_at ? moment(props.recorded_at, 'DD-MM-YYYY HH:mm').format('DD MMM YYYY') : null,
    };

    const tabs = [
        { id: "new", label: "Nouveau dossier" },
        { id: "pre", label: "Brouillons", count: props.items?.length || 0 },
    ];

    return (
        <>
            {/* Modal notification SMS - Modern UI */}
            {showSmsBox && (
                <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{
                    style: { borderRadius: 20, overflow: "hidden", margin: "16px" }
                }}>
                    <DialogContent style={{ padding: 0 }}>
                        {/* Header gradient */}
                        <div style={{
                            background: "linear-gradient(135deg, #005081, #005081)",
                            padding: "32px 28px 24px", textAlign: "center",
                        }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: "50%",
                                background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 12px",
                            }}>
                                <CheckCircleOutlineIcon style={{ fontSize: 32, color: "white" }} />
                            </div>
                            <div style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 4 }}>
                                Dossier prêt à soumettre
                            </div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
                                Souhaitez-vous notifier le client par SMS ?
                            </div>
                        </div>

                        {/* SMS section */}
                        <div style={{ padding: "20px 28px 0" }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 10,
                                background: "#f8fafc", borderRadius: 10, padding: "10px 14px", marginBottom: 12,
                            }}>
                                <SmsOutlinedIcon style={{ fontSize: 18, color: "#005081", flexShrink: 0 }} />
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{props.lastname}</div>
                                    <div style={{ fontSize: 11, color: "#64748b" }}>{cleanPhoneNumber(props.phone)}</div>
                                </div>
                            </div>
                            <textarea
                                value={smsToSend}
                                onChange={(e) => setSmsToSend(e.target.value)}
                                style={{
                                    width: "100%", boxSizing: "border-box",
                                    minHeight: 90, resize: "vertical",
                                    border: "1.5px solid #e2e8f0", borderRadius: 10,
                                    padding: "10px 14px", fontSize: 13, fontWeight: 500,
                                    color: "#374151", fontFamily: "inherit",
                                    background: "white", outline: "none", lineHeight: 1.6,
                                }}
                            />
                        </div>
                    </DialogContent>

                    {/* Modern action buttons */}
                    <div style={{ padding: "16px 28px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                        <button
                            onClick={(e) => { e.preventDefault(); setShowSmsBox(false); sendSms(e); }}
                            style={{
                                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                                background: "linear-gradient(135deg, #005081, #005081)",
                                color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                boxShadow: "0 4px 14px rgba(0,80,129,0.35)",
                            }}
                        >
                            <SmsOutlinedIcon style={{ fontSize: 18 }} />
                            Enregistrer et notifier
                        </button>
                        <form onSubmit={handleSubmit} style={{ margin: 0 }}>
                            <button
                                type="submit"
                                style={{
                                    width: "100%", padding: "11px", borderRadius: 12,
                                    border: "1.5px solid #e2e8f0", background: "white",
                                    color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer",
                                }}
                            >
                                Enregistrer sans notifier
                            </button>
                        </form>
                    </div>
                </Dialog>
            )}

            {/* Modal enregistreur vocal */}
            {showAudioBox && (
                <Dialog open={open2} onClose={handleClose2} fullWidth maxWidth="sm"
                    PaperProps={{ style: { borderRadius: 16, padding: 8, overflow: 'hidden' } }}>
                    <DialogContent>
                        <div style={{ textAlign: 'center', padding: '16px 8px 8px' }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                            </div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>+ Audio</div>
                            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Enregistrez votre message vocal</div>
                        </div>
                        <section className="voice-recorder">
                            <div className="recorder-container">
                                <RecorderControls recorderState={recorderState} handlers={handlers} closeAction={handleClose2} />
                            </div>
                        </section>
                    </DialogContent>
                </Dialog>
            )}

            <WizardLayout
                title="Enregistrer une suggestion"
                subtitle="Formulaire d'enregistrement"
                steps={steps}
                currentStep={currentStep}
                activeTab={activeTab}
                onTabChange={(tab) => { setActiveTab(tab); }}
                hasDraft={props.items.length > 0}
                draftCount={props.items.length}
                apercu={apercu}
                completionPercent={
                    currentStep === 0 ? (props.language ? 15 : 0) :
                        currentStep === 1 ? (props.collect && props.recorded_at && (props.content || audioRecordings.length > 0) ? 65 : 30) :
                            currentStep === 2 ? 80 : 95
                }
                onNext={handleNext}
                onPrev={() => setCurrentStep(s => s - 1)}
                isLastStep={currentStep === 3}
                onSubmit={handleFinalSubmit}
                loadingSave={props.etat}
                loadingSubmit={props.etat2}
                onSaveDraft={handleSave}
                draftsContent={
                    <div>
                        {content.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 24px", color: "#94a3b8" }}>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>Aucun brouillon enregistré</div>
                                <div style={{ fontSize: 12, marginTop: 4 }}>Utilisez "Sauvegarder brouillon" pour retrouver un dossier ici</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {content.map((draft) => (
                                    <div
                                        key={draft.id || draft.code}
                                        onClick={(e) => { rowClickedHandler(e, draft, null); setCurrentStep(0); setActiveTab("new"); }}
                                        style={{
                                            background: "white", borderRadius: 14, border: "1.5px solid #e5e7eb",
                                            padding: "14px 18px", cursor: "pointer",
                                            display: "flex", alignItems: "center", gap: 14,
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                                            transition: "box-shadow 0.15s, border-color 0.15s",
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#99cde8"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,80,129,0.1)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
                                    >
                                        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: "#e8f4fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <AssignmentOutlinedIcon style={{ fontSize: 20, color: "#005081" }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{draft.code || "Brouillon sans code"}</div>
                                            <div style={{ fontSize: 11, color: "#64748b" }}>{draft.createdAtFormated || "—"}</div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={e => e.stopPropagation()}>
                                            <Tooltip title="Modifier">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); rowClickedHandler(e, draft, null); setCurrentStep(0); setActiveTab("new"); }}
                                                    sx={{ color: "#005081", "&:hover": { background: "#e8f4fc" } }}
                                                >
                                                    <EditIcon style={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                            {mode === 1 && (
                                                <Tooltip title="Supprimer">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); handleModal(e, draft); }}
                                                        sx={{ color: "#ef4444", "&:hover": { background: "#fee2e2" } }}
                                                        disabled={loadingId === draft.id}
                                                    >
                                                        {loadingId === draft.id ? <CircularProgress size={14} /> : <DeleteIcon style={{ fontSize: 18 }} />}
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                }
            >

                {/* ── Etape 0 – Client ─────────────────────────── */}
                {currentStep === 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <input type="hidden" value={JSON.stringify(props.selectedItem)} />

                        {/* Nom et Prenoms — pleine largeur */}
                        <div className="input-field" style={{ margin: 0 }}>
                            <input id="sg_lastname" type="text" className="validate" value={props.lastname}
                                onChange={(e) => props.lastnameChanged(e.target.value)} />
                            <label htmlFor="sg_lastname" className="active">Nom et Prenoms</label>
                        </div>

                        {/* Adresse + Telephone — 2 colonnes */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="input-field" style={{ margin: 0 }}>
                                <input id="sg_address" type="text" className="validate" value={props.address}
                                    onChange={(e) => props.addressChanged(e.target.value)} />
                                <label htmlFor="sg_address" className="active">Adresse Physique</label>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: "#757575", fontWeight: 600, display: "block", marginBottom: 4 }}>Telephone</label>
                                <PhoneInput
                                    international
                                    countryCallingCodeEditable={false}
                                    defaultCountry={appInstitution?.paysCode ?? "BJ"}
                                    value={props.phone}
                                    onChange={(e) => props.phoneChanged(e)}
                                />
                            </div>
                        </div>

                        {/* Email — pleine largeur */}
                        <div className="input-field" style={{ margin: 0 }}>
                            <input id="sg_email" type="email" className="validate" value={props.email}
                                onChange={(e) => props.emailChanged(e.target.value)} />
                            <label htmlFor="sg_email" className="active">Email (facultatif)</label>
                        </div>

                        {/* Genre + Langue + Dossier IMF — pattern identique à EnregistrerReclamation */}
                        <div className="row" style={{ margin: 0 }}>
                            <div className="col l6 m12 s12 input-field" ref={genderRef}>
                                <Select
                                    value={(props.gender && props.gender !== "NON_DEFINI") ? { label: props.gender === "HOMME" ? "Homme" : "Femme", value: props.gender } : null}
                                    options={genderOptions}
                                    className="react-select-container mt-4"
                                    classNamePrefix="react-select"
                                    style={styles}
                                    placeholder="Sélectionner le genre"
                                    onChange={(e) => props.genderChanged(e.value)}
                                />
                                <label className="active">
                                    Genre
                                </label>
                                {props.errors?.gender && <small style={{ color: "#e53935", fontSize: 11 }}>{props.errors.gender}</small>}
                            </div>

                            <div className="col l6 m12 s12 input-field" ref={languageRef}>
                                <Select
                                    value={props.language ? { label: props.languageLibelle, value: props.language } : null}
                                    options={languageOptions}
                                    className="react-select-container mt-4"
                                    classNamePrefix="react-select"
                                    style={styles}
                                    placeholder="Sélectionner la langue"
                                    onChange={handleChange4}
                                />
                                <label className="active">
                                    Langue parlée <span>(<span className="red-text darken-2">*</span>)</span>
                                </label>
                                {props.errors?.language && <small style={{ color: "#e53935", fontSize: 11 }}>{props.errors.language}</small>}
                            </div>

                            <div className="col l6 m12 s12 input-field">
                                <input id="sg_dossier" type="text" className="validate" value={props.dossierimf}
                                    onChange={(e) => props.dossierimfChanged(e.target.value)} />
                                <label htmlFor="sg_dossier" className="active">Dossier Client</label>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Etape 1 – Informations ───────────────────── */}
                {currentStep === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                        <div className="input-field" style={{ margin: 0 }} ref={recordedAtRef}>
                            <DatePicker
                                withPortal closeOnScroll isClearable showTimeInput showMonthDropdown
                                value={props.recorded_at}
                                timeInputLabel="Heure :"
                                todayButton="Aujourd'hui"
                                selected={props.recorded_at_dp}
                                onChange={(date) => handleDatePicker(date, props)}
                                dateFormat="dd-MM-yyyy HH:mm"
                                locale="fr"
                            />
                            <label className="active">Date de reception <span style={{ color: "#e53935" }}>*</span></label>
                            {props.errors?.recorded_at && <small style={{ color: "#e53935", fontSize: 11 }}>{props.errors.recorded_at}</small>}
                        </div>

                        <div className="col l6 m12 s12 input-field" ref={collectRef}>
                            <Select
                                value={props.collect ? { label: props.collectLibelle, value: props.collect } : "Sélectionner la modalité de dépôt"}
                                options={collectOptions}
                                className="react-select-container mt-4"
                                classNamePrefix="react-select"
                                style={styles}
                                placeholder="Sélectionner la modalité de dépôt"
                                onChange={handleChange3}
                            />
                            <label className="active">
                                Modalité de dépôt <span>(<span className="red-text darken-2">*</span>)</span>
                            </label>
                            <small className="errorTxt4"><div className="error">{props.errors?.collect}</div></small>
                        </div>

                        <div className="col l6 m12 s12 input-field" ref={productRef}>
                            <Select
                                value={props.product ? { label: props.productLibelle, value: props.product } : "Sélectionner le produit"}
                                options={productOptions}
                                className="react-select-container mt-4"
                                classNamePrefix="react-select"
                                style={styles}
                                placeholder="Sélectionner le produit"
                                onChange={handleChange1}
                            />
                            <label className="active">
                                Produit ou service concerné <span>(<span className="red-text darken-2">*</span>)</span>
                            </label>
                            <small className="errorTxt4"><div className="error">{props.errors?.product}</div></small>
                        </div>

                        <div className="col l6 m12 s12 input-field" ref={unitRef}>
                            <Select
                                value={props.unit ? { label: props.unitLibelle, value: props.unit } : "Sélectionner le point de service"}
                                options={unitOptions}
                                className="react-select-container mt-4"
                                classNamePrefix="react-select"
                                style={styles}
                                placeholder="Sélectionner le point de service"
                                onChange={handleChange}
                            />
                            <label className="active">
                                Point de service indexé (<span className="red-text darken-2">*</span>)
                            </label>
                            <small className="errorTxt4"><div className="error">{props.errors?.unit}</div></small>
                        </div>


                        <div className="input-field" style={{ margin: 0, position: "relative" }} ref={contentRef}>
                            <textarea id="sg_content" className="materialize-textarea" rows={3}
                                value={props.content}
                                onChange={(e) => props.contentChanged(e.target.value)}
                                style={{ paddingRight: 48 }}
                            />
                            <label htmlFor="sg_content" className="active">Contenu <span style={{ color: "#e53935" }}>*</span></label>
                            {props.errors?.content && <small style={{ color: "#e53935", fontSize: 11 }}>{props.errors.content}</small>}
                            {mode === 1 && (
                                <div style={{ position: "absolute", right: 0, top: -16 }}>
                                    <Fab color="primary" size="small"
                                        style={{ backgroundColor: "#005081" }}
                                        onClick={(e) => { e.preventDefault(); setAudioBox(true); setOpen2(true); }}
                                    >
                                        <Mic />
                                    </Fab>
                                </div>
                            )}
                        </div>

                        {(audioRecordings.length > 0 || props.selectedItemAudio?.length > 0) && (
                            <div className="col l12 m12 s12" style={{ marginTop: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                    <Mic style={{ fontSize: 15, color: "#005081" }} /> Audio enregistré
                                </div>
                                {audioRecordings.map((audioBlob, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#e8f4fc", borderRadius: 10, border: "1px solid #99cde8", marginBottom: 6 }}>
                                        <Mic style={{ fontSize: 16, color: "#005081", flexShrink: 0 }} />
                                        <audio controls style={{ flex: 1, height: 30 }}>
                                            <source src={URL.createObjectURL(audioBlob)} type="audio/ogg" />
                                        </audio>
                                        <button onClick={() => removeAudio(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 20, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>×</button>
                                    </div>
                                ))}
                                {props.selectedItemAudio?.map((audioItem, i) => (
                                    <div key={"sa" + i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#e8f4fc", borderRadius: 10, border: "1px solid #99cde8", marginBottom: 6 }}>
                                        <Mic style={{ fontSize: 16, color: "#005081", flexShrink: 0 }} />
                                        <audio controls style={{ flex: 1, height: 30 }}>
                                            <source src={URL.createObjectURL(new Blob([audioItem], { type: "audio/ogg" }))} type="audio/ogg" />
                                        </audio>
                                        <button onClick={() => props.selectedItemAudioChanged(props.selectedItemAudio.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 20, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Etape 2 – Pieces jointes ─────────────────── */}
                {currentStep === 2 && (
                    <div>
                        {mode === 1 && (
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleDropzoneFiles(e.dataTransfer.files); }}
                                style={{
                                    border: isDragging ? "2px dashed #005081" : "2px dashed #b0bec5",
                                    borderRadius: 12, padding: "28px 16px", textAlign: "center",
                                    background: isDragging ? "#e8f4fc" : "#fafafa", cursor: "pointer", marginBottom: 16,
                                    transition: "all 0.2s"
                                }}
                                onClick={() => document.getElementById("sg_file_input").click()}
                            >
                                <CloudUploadOutlinedIcon style={{ fontSize: 36, color: isDragging ? "#005081" : "#90a4ae", marginBottom: 6 }} />
                                <div style={{ fontSize: 13, color: "#546e7a", fontWeight: 600 }}>
                                    Glissez vos fichiers ici ou cliquez pour selectionner
                                </div>
                                <div style={{ fontSize: 11, color: "#90a4ae", marginTop: 4 }}>
                                    PDF, Excel, Word, images, audio, video
                                </div>
                                <input id="sg_file_input" type="file" multiple style={{ display: "none" }}
                                    accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, audio/*, video/*"
                                    onChange={(e) => { handleDropzoneFiles(e.target.files); e.target.value = null; }}
                                />
                            </div>
                        )}

                        {files && Array.from(files).length > 0 ? (
                            <div>
                                <div style={{ fontSize: 12, color: "#757575", fontWeight: 600, marginBottom: 8 }}>
                                    Fichiers selectionnes ({Array.from(files).length})
                                </div>
                                {Array.from(files).map((file, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 6, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                                        <InsertDriveFileOutlinedIcon style={{ fontSize: 16, color: "#64748b", flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, color: "#374151", fontWeight: 600, flex: 1 }}>{file.name}</span>
                                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{(file.size / 1024).toFixed(0)} Ko</span>
                                        <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 16, lineHeight: 1, padding: 2 }}>x</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 12, color: "#bdbdbd", fontStyle: "italic" }}>Aucun fichier selectionne</div>
                        )}

                        {props.selectedItemFiles && props.selectedItemFiles.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ fontSize: 12, color: "#757575", fontWeight: 600, marginBottom: 8 }}>
                                    Fichiers existants ({props.selectedItemFiles.length})
                                </div>
                                {props.selectedItemFiles.map((file, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 6, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                                        <InsertDriveFileOutlinedIcon style={{ fontSize: 16, color: "#64748b", flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, color: "#374151", fontWeight: 600, flex: 1 }}>{file.name}</span>
                                        <a onClick={(e) => { e.preventDefault(); downloadFillesApi(file.id, file.name); }} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#005081", cursor: "pointer", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}><FileDownloadIcon style={{ fontSize: 14 }} /> Télécharger</a>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Enregistrement audio ── */}
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                                <MicIcon style={{ fontSize: 17, color: "#005081" }} />
                                Enregistrement vocal
                            </div>

                            {audioRecordings.length === 0 && !props.selectedItemAudio?.length ? (
                                <div style={{ background: "#f8fafc", borderRadius: 12, border: "1.5px dashed #e2e8f0", padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                                    <MicIcon style={{ fontSize: 28, opacity: 0.3, display: "block", margin: "0 auto 6px" }} />
                                    Aucun audio enregistré
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {audioRecordings.map((audioBlob, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "white", borderRadius: 10, border: "1.5px solid #99cde8" }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#e8f4fc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <MicIcon style={{ fontSize: 16, color: "#005081" }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Enregistrement {i + 1}</div>
                                                <audio controls style={{ width: "100%", height: 30 }}>
                                                    <source src={URL.createObjectURL(audioBlob)} type="audio/ogg" />
                                                </audio>
                                            </div>
                                            <button onClick={() => setAudioRecordings(prev => prev.filter((_, j) => j !== i))}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 20, lineHeight: 1, flexShrink: 0 }}>×</button>
                                        </div>
                                    ))}
                                    {props.selectedItemAudio?.map((audioItem, i) => (
                                        <div key={"s" + i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "white", borderRadius: 10, border: "1.5px solid #e2e8f0" }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <MicIcon style={{ fontSize: 16, color: "#005081" }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Sauvegardé {i + 1}</div>
                                                <audio controls style={{ width: "100%", height: 30 }}>
                                                    <source src={URL.createObjectURL(new Blob([audioItem], { type: "audio/ogg" }))} type="audio/ogg" />
                                                </audio>
                                            </div>
                                            <button onClick={() => props.selectedItemAudioChanged(props.selectedItemAudio.filter((_, j) => j !== i))}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 20, lineHeight: 1, flexShrink: 0 }}>×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {whatsappAttachmentList && <div style={{ marginTop: 12 }}>{whatsappAttachmentList}</div>}
                    </div>
                )}

                {/* ── Etape 3 – Recapitulatif ──────────────────── */}
                {currentStep === 3 && (
                    <div style={{ border: "1px solid #e0e0e0", borderRadius: 8 }}>
                        <div style={{ backgroundColor: "#f5f5f5", padding: "8px 14px", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: 8 }}>
                            <SupportAgentIcon style={{ fontSize: 18, color: "#616161" }} />
                            <span style={{ color: "#424242", fontWeight: 600, fontSize: 14 }}>Resume de la suggestion</span>
                        </div>
                        <div style={{ padding: "4px 14px" }}>
                            {props.lastname && (
                                <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                                    <span style={{ color: "#757575", width: 160, fontSize: 13, flexShrink: 0 }}>Client</span>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{props.lastname}</span>
                                </div>
                            )}
                            {props.phone && (
                                <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                                    <span style={{ color: "#757575", width: 160, fontSize: 13, flexShrink: 0 }}>Telephone</span>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{cleanPhoneNumber(props.phone)}</span>
                                </div>
                            )}
                            {props.email && (
                                <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                                    <span style={{ color: "#757575", width: 160, fontSize: 13, flexShrink: 0 }}>Email</span>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{props.email}</span>
                                </div>
                            )}
                            <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                                <span style={{ color: "#757575", width: 160, fontSize: 13, flexShrink: 0 }}>Langue</span>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{props.languageLibelle || "—"}</span>
                            </div>
                            <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                                <span style={{ color: "#757575", width: 160, fontSize: 13, flexShrink: 0 }}>Modalite de depot</span>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{props.collectLibelle || "—"}</span>
                            </div>
                            {props.productLibelle && (
                                <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                                    <span style={{ color: "#757575", width: 160, fontSize: 13, flexShrink: 0 }}>Produit</span>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{props.productLibelle}</span>
                                </div>
                            )}
                            {props.unitLibelle && (
                                <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                                    <span style={{ color: "#757575", width: 160, fontSize: 13, flexShrink: 0 }}>Point de service</span>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{props.unitLibelle}</span>
                                </div>
                            )}
                            <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                                <span style={{ color: "#757575", width: 160, fontSize: 13, flexShrink: 0 }}>Date de reception</span>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>
                                    {props.recorded_at ? moment(props.recorded_at, "DD-MM-YYYY HH:mm").format("DD MMMM YYYY [a] HH:mm") : "—"}
                                </span>
                            </div>
                            <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                                <span style={{ color: "#757575", width: 160, fontSize: 13, flexShrink: 0 }}>Contenu</span>
                                <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>
                                    {props.content && props.content !== "#ReclamationAudio" ? props.content : (!props.content && audioRecordings.length === 0 && !props.selectedItemAudio?.length ? "—" : null)}
                                </span>
                            </div>

                            {(audioRecordings.length > 0 || props.selectedItemAudio?.length > 0) && (
                                <div style={{ padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                                    <span style={{ color: "#757575", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 8 }}>
                                        Audios ({audioRecordings.length + (props.selectedItemAudio?.length ?? 0)})
                                    </span>
                                    {audioRecordings.map((audioBlob, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#e8f4fc", borderRadius: 8, marginBottom: 6, border: "1px solid #99cde8" }}>
                                            <Mic style={{ fontSize: 16, color: "#005081", flexShrink: 0 }} />
                                            <audio controls style={{ flex: 1, height: 30 }}>
                                                <source src={URL.createObjectURL(audioBlob)} type="audio/ogg" />
                                            </audio>
                                        </div>
                                    ))}
                                    {props.selectedItemAudio?.map((audioItem, i) => (
                                        <div key={"sr" + i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, marginBottom: 6, border: "1px solid #e2e8f0" }}>
                                            <Mic style={{ fontSize: 16, color: "#005081", flexShrink: 0 }} />
                                            <audio controls style={{ flex: 1, height: 30 }}>
                                                <source src={URL.createObjectURL(new Blob([audioItem], { type: "audio/ogg" }))} type="audio/ogg" />
                                            </audio>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {((files && Array.from(files).length > 0) || props.selectedItemFiles?.length > 0) && (
                                <div style={{ padding: "10px 0" }}>
                                    <span style={{ color: "#757575", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 8 }}>
                                        Fichiers joints ({Array.from(files || []).length + (props.selectedItemFiles?.length ?? 0)})
                                    </span>
                                    {props.selectedItemFiles?.map((file, i) => (
                                        <div key={"saved-" + i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 4, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                                            <InsertDriveFileOutlinedIcon style={{ fontSize: 15, color: "#16a34a", flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, color: "#374151", fontWeight: 600, flex: 1 }}>{file.name}</span>
                                            <a onClick={(e) => { e.preventDefault(); e.stopPropagation(); downloadFillesApi(file.id, file.name); }} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#005081", cursor: "pointer", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}><FileDownloadIcon style={{ fontSize: 14 }} /> Télécharger</a>
                                        </div>
                                    ))}
                                    {Array.from(files || []).map((file, i) => (
                                        <div key={"new-" + i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 4, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                                            <InsertDriveFileOutlinedIcon style={{ fontSize: 15, color: "#64748b", flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, color: "#374151", fontWeight: 600, flex: 1 }}>{file.name}</span>
                                            <a href={URL.createObjectURL(file)} download={file.name} onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#005081", cursor: "pointer", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}><FileDownloadIcon style={{ fontSize: 14 }} /> Télécharger</a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </WizardLayout>
        </>
    );
};


const mapStateToProps = (state) => ({
    whatsappInboxs: state.whatsapp.inboxs,
    whatsappMessages: state.whatsapp.messages,
    whatsappCurrentInbox: state.whatsapp.currentInbox,
    whatsappSelectMessage: state.whatsapp.selectMessage,
    isLoading: state.suggestion_record.isLoading,
    id: state.suggestion_record.id,
    firstname: state.suggestion_record.firstname,
    lastname: state.suggestion_record.lastname,
    address: state.suggestion_record.address,
    phone: state.suggestion_record.phone,
    gender: state.suggestion_record.gender,
    language: state.suggestion_record.language,
    languageLibelle: state.suggestion_record.languageLibelle,
    dossierimf: state.suggestion_record.dossierimf,
    email: state.suggestion_record.email,
    code: state.suggestion_record.code,
    recorded_at: state.suggestion_record.recorded_at,
    recorded_at_dp: state.suggestion_record.recorded_at_dp,
    collect: state.suggestion_record.collect,
    collectLibelle: state.suggestion_record.collectLibelle,
    product: state.suggestion_record.product,
    productLibelle: state.suggestion_record.productLibelle,
    unit: state.suggestion_record.unit,
    unitLibelle: state.suggestion_record.unitLibelle,
    content: state.suggestion_record.content,
    status: state.suggestion_record.status,
    solution: state.suggestion_record.solution,
    comment: state.suggestion_record.comment,
    created_by: state.suggestion_record.created_by,
    created_at: state.suggestion_record.created_at,
    handled_at: state.suggestion_record.handled_at,
    handled_by: state.suggestion_record.handled_by,
    approved_at: state.suggestion_record.approved_at,
    approved_by: state.suggestion_record.approved_by,
    resolved_at: state.suggestion_record.resolved_at,
    resolved_by: state.suggestion_record.resolved_by,
    errors: state.suggestion_record.suggestions_record_errors,
    items: state.suggestion_record.items,
    selectedItem: state.suggestion_record.selectedItem,
    selectedFiles: state.suggestion_record.selectedFiles,
    selectedItemFiles: state.suggestion_record.selectedItemFiles,
    selectedItemAudio: state.suggestion_record.selectedItemAudio,
    showSelectPrintItem: state.suggestion_record.showSelectPrintItem,
    etat: state.suggestion_record.etat,
    etat2: state.suggestion_record.etat2,
});

const mapDispatchToProps = (dispatch) => ({
    loading: (err) => dispatch(loading(err)),
    suggestionsRecordErrors: (err) => dispatch(suggestionRecordErrors(err)),
    idChanged: (id) => dispatch(idChanged(id)),
    firstnameChanged: (firstname) => dispatch(firstnameChanged(firstname)),
    lastnameChanged: (lastname) => dispatch(lastnameChanged(lastname)),
    addressChanged: (address) => dispatch(addressChanged(address)),
    phoneChanged: (phone) => dispatch(phoneChanged(phone)),
    genderChanged: (gender) => dispatch(genderChanged(gender)),
    languageChanged: (language) => dispatch(languageChanged(language)),
    languageLibelleChanged: (languageLibelle) => dispatch(languageLibelleChanged(languageLibelle)),
    dossierimfChanged: (dossierimf) => dispatch(dossierimfChanged(dossierimf)),
    emailChanged: (email) => dispatch(emailChanged(email)),
    codeChanged: (code) => dispatch(codeChanged(code)),
    recordedAtChanged: (recordedAt) => dispatch(recordedAtChanged(recordedAt)),
    recordedAtDPChanged: (recordedAt) => dispatch(recordedAtDPChanged(recordedAt)),
    collectChanged: (collect) => dispatch(collectChanged(collect)),
    collectLibelleChanged: (collectLibelle) => dispatch(collectLibelleChanged(collectLibelle)),
    productChanged: (product) => dispatch(productChanged(product)),
    productLibelleChanged: (productLibelle) => dispatch(productLibelleChanged(productLibelle)),
    unitChanged: (unit) => dispatch(unitChanged(unit)),
    unitLibelleChanged: (unitLibelle) => dispatch(unitLibelleChanged(unitLibelle)),
    contentChanged: (content) => dispatch(contentChanged(content)),
    statusChanged: (status) => dispatch(statusChanged(status)),
    solutionChanged: (solution) => dispatch(solutionChanged(solution)),
    createdAtChanged: (createdAt) => dispatch(createdAtChanged(createdAt)),
    createdByChanged: (createdBy) => dispatch(createdByChanged(createdBy)),
    handledAtChanged: (handledAt) => dispatch(handledAtChanged(handledAt)),
    handledByChanged: (handledBy) => dispatch(handledByChanged(handledBy)),
    resolvedAtChanged: (resolvedAt) => dispatch(resolvedAtChanged(resolvedAt)),
    resolvedByChanged: (resolvedBy) => dispatch(resolvedByChanged(resolvedBy)),
    itemsChanged: (items) => dispatch(itemsChanged(items)),
    selectedItemChanged: (selectedItem) => dispatch(selectedItemChanged(selectedItem)),
    selectedFilesReset: (selectedFiles) => dispatch(selectedFilesReset(selectedFiles)),
    selectedItemFilesChanged: (selectedItemFiles) => dispatch(selectedItemFilesChanged(selectedItemFiles)),
    selectedItemAudioChanged: (selectedItemAudio) => dispatch(selectedItemAudioChanged(selectedItemAudio)),
    showSelectPrintItemChanged: (show) => dispatch(showSelectPrintItemChanged(show)),
    etatChanged: (etat) => dispatch(etatChanged(etat)),
    etat2Changed: (etat2) => dispatch(etat2Changed(etat2)),
    selectedFilesChanged: (selectedFiles) => dispatch(selectedFilesChanged(selectedFiles)),
    resetWhatsapp: () => dispatch(reset()),
});

export default connect(mapStateToProps, mapDispatchToProps)(EnregistrerSuggestion);
