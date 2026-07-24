import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import ReactDatatable from "@ashvin27/react-datatable";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import fr from 'date-fns/locale/fr';
import RecordingsList from "../../components/recordings-list";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import "react-datepicker/dist/react-datepicker.css";
import HelpIcon from '@mui/icons-material/Help';
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { v4 as uuid } from "uuid";
import { modalify } from "../../Utils/modal";
import moment from "moment";
import "moment/locale/fr";
import WizardLayout from "../../components/shared/WizardLayout";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import {
    addressChanged,
    claimRecordErrors,
    codeChanged,
    collectChanged,
    collectLibelleChanged,
    contentChanged,
    crewChanged,
    dossierimfChanged,
    etat2Changed,
    etatChanged,
    firstnameChanged,
    genderChanged,
    idChanged,
    itemsChanged,
    languageChanged,
    languageLibelleChanged,
    lastnameChanged,
    loading,
    productChanged,
    productLibelleChanged,
    recordedAtChanged, recordedAtDPChanged,
    selectedFilesChanged,
    selectedFilesReset,
    selectedItemChanged,
    selectedItemFilesChanged,
    selectedItemAudioChanged,
    subjectChanged,
    subjectLibelleChanged,
    underSubjectChanged,
    underSubjectLibelleChanged,
    unitChanged,
    unitLibelleChanged
} from "../../redux/actions/Reclamations/EnregistrementReclamationActions";
import { cleanPhoneNumber, groupBy, guessExtension, handleDatePicker, isEmpty, isSettingComplete, isValidDate, isValidPhone, loadItemFromLocalStorage, loadItemFromSessionStorage } from "../../Utils/utils";
import http from "../../apis/http-common";
import { KTApp } from "../../Utils/blockui";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import { notify } from "../../Utils/alert";
import axios from "axios";
import { addDenunciationApi, addDenunciationApiOffline, addTempDenunciationApi, addTempDenunciationApiOffline, downloadAudioApi, downloadFillesApi, getDenunAudioApi, getFillesApi, listeByStatut, deleteDenunciationApi, listeByStatutOffline } from "../../apis/Denonciations/DenonciationsApi";
import { licenseInfo } from "../../apis/LoginApi";
import useRecorder from "../../hooks/useRecorder";
import RecorderControls from "../../components/recorder-controls";
import { CancelOutlined, Mic } from "@mui/icons-material";
import { downloadFilesApi } from "../../apis/WhatsappApi";
import { Tooltip, IconButton, CircularProgress } from "@mui/material";
// import { licenseControl } from "../../Utils/license";
// import DateInput from "../ui/DateInput";
//import IntlTelInput from 'react-intl-tel-input';
//import 'react-intl-tel-input/dist/main.css';

import { reset } from "../../redux/actions/WhatsappActions";
moment.locale("fr");

registerLocale('fr', fr)

const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({ ...provided, zIndex: 9999 })
};


const EnregistrerDenonciation = (props) => {
    const [files, setFiles] = React.useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [activeTab, setActiveTab] = useState("new");
    const [isDragging, setIsDragging] = useState(false);
    const history = useHistory();
    const [underSubjectOptions, setUnderSubjectOptions] = useState([]);

    const [isLoading, setIsLoading] = useState(false)
    const { recorderState, ...handlers } = useRecorder();
    let { audio } = recorderState;

    let settingComplete = isSettingComplete()
    let mode = loadItemFromLocalStorage("app-mode") !== undefined ? (JSON.parse(loadItemFromLocalStorage("app-mode"))) : undefined;
    let user = loadItemFromSessionStorage("app-user") !== undefined ? (JSON.parse(loadItemFromSessionStorage("app-user"))) : undefined;


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

    const recordedAtRef = useRef(null);
    const collectRef = useRef(null);
    const subjectRef = useRef(null);
    const underSubjectRef = useRef(null);
    const productRef = useRef(null);
    const unitRef = useRef(null);
    const contentRef = useRef(null);
    const firstErrorRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            await licenseControl();
        };

        fetchData();
    }, []);


    useEffect(() => {
        KTApp.blockPage({
            overlayColor: '#000000',
            type: 'v2',
            state: 'danger',
            message: 'En cours de chargement...'
        })
        setIsLoading(true);

        if (mode === 1) {
            props.itemsChanged([])
            listeByStatut(props, "TEMP_SAVED").then((r) => { }).finally(() => {
                setIsLoading(false);
                KTApp.unblockPage();
            });
        } else {
            props.itemsChanged([])
            listeByStatutOffline(props, "TEMP_SAVED").then((r) => { }).finally(() => {
                setIsLoading(false);
                KTApp.unblockPage();
            });
        }

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

        clearComponentState();
    }, []);

    const [open2, setOpen2] = React.useState(false);
    const [showAudioBox, setAudioBox] = useState(false);
    const [showAudioPlayer, setAudioPlayer] = useState("");
    const [currentAudio, setCurrentAudio] = useState("");
    const [clearAudio, setClearAudio] = useState(0)
    const [audioRecordings, setAudioRecordings] = useState([]);
    const prevAudioRef = useRef(null);
    // whatsapp

    // Accumulate each completed audio recording
    useEffect(() => {
        if (audio != null && audio !== prevAudioRef.current) {
            prevAudioRef.current = audio;
            setAudioRecordings(prev => [...prev, audio]);
        }
    }, [audio]);

    useEffect(() => {

        if (props.whatsappCurrentInbox && props.whatsappSelectMessage?.length > 0) {
            clearComponentState();
            props.contentChanged(transformConversation(props.whatsappSelectMessage))
        }
    }, [""])

    const transformConversation = (conversations = []) => {
        var result = ""
        const convert = conversations.sort((a, b) => {
            return parseInt(a.date) - parseInt(b.date)
        })

        convert.forEach((msg) => {
            if (msg.type === "chat") {

                result += ` [${moment(parseInt(msg.date)).format("DD/MM/Y H:mm:ss")}]` + (msg.message_id.startsWith("false") ? " Plaignant: " : " GPR WHATSAPP: ") + " " + msg.content + " \n";
            }
        })
        return result;
    }

    let whatsappAttachmentList;
    // console.log("props.selectedItemFiles", props.selectedItemFiles);
    if (props.whatsappSelectMessage.length > 0) {
        const preuves = props.whatsappSelectMessage?.filter(({ type }) => (type !== "chat")) ?? []
        let whatsappAttachmentListChild = preuves.map((msg) => {
            let icon = guessExtension({ name: msg.type });
            return (
                <div className="col xl12 l12 m12 s12" key={msg.id}>
                    <div className="card box-shadow-none mb-1 app-file-info">
                        <div className="card-content">
                            <div className="row">
                                <div className="col xl1 l1 s1 m1">
                                    <div className="app-file-content-logo">
                                        <div className="fonticon hide">
                                            <i className="material-icons ">more_vert</i>
                                        </div>
                                        <img
                                            className="recent-file"
                                            src={icon}
                                            height="38"
                                            width="30"
                                            alt=""
                                        />
                                    </div>
                                </div>
                                <div className="col xl11 l11 s11 m11">
                                    <div className="app-file-recent-details">
                                        <div className="app-file-name font-weight-700 truncate">
                                            {msg.content}
                                        </div>
                                        <div className="app-file-size">

                                        </div>
                                        <div className="app-file-last-access">
                                            <span
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    // downloadFillesApi(attachment.id, attachment.name);
                                                    downloadFilesApi(msg.content)
                                                }}
                                            >
                                                <FileDownloadIcon style={{ fontSize: 14 }} /> Télécharger
                                            </span>
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
                <span className="app-file-label">Pieces joints(Whatsapp) </span>
                <div className="row app-file-recent-access mb-3">
                    {whatsappAttachmentListChild}
                </div>
            </div>
        ) : <></>;
    } else {
    }


    //Handling the form
    let collects
    let subjects
    let underSubjects
    let products
    let units

    try {
        collects = JSON.parse(loadItemFromLocalStorage('app-supports'));
        subjects = JSON.parse(loadItemFromLocalStorage('app-objets'));
        subjects = JSON.parse(loadItemFromLocalStorage("app-categories"));
        underSubjects = JSON.parse(loadItemFromLocalStorage("app-objets"));
        products = JSON.parse(loadItemFromLocalStorage('app-produits'));
        units = JSON.parse(loadItemFromLocalStorage('app-ps'));
    } catch (e) {
        collects = []
        subjects = [];
        underSubjects = [];
        products = []
        units = []
    }

    let formButtons;
    let collectOptions
    let subjectOptions
    let productOptions

    if (collects !== undefined) {
        collectOptions = collects.map(collect => {
            return { "label": collect.libelle, "value": collect.id }
        })
    } else {
        collectOptions = []
    }

    if (subjects !== undefined) {
        subjectOptions = subjects.map(subject => {
            return { "label": subject.libelle, "value": subject.id }
        })
    } else {
        subjectOptions = []
    }
    if (products !== undefined) {
        productOptions = products.map(product => {
            return { "label": product.libelle, "value": product.id }
        })
    } else {
        productOptions = []
    }

    let unitOptions
    let agencyOptions
    let directionOptions
    let guichetOptions
    units = units.filter((un) => !un.deleted)
    let unitsGroupByType = (units !== undefined) ? groupBy(units, "type") : undefined;
    //
    if (unitsGroupByType !== undefined && unitsGroupByType["AGENCE"] !== undefined) {
        agencyOptions = unitsGroupByType["AGENCE"].map(agency => {
            return { "label": agency.libelle, "value": agency.id }
        })
    } else {
        agencyOptions = ""
    }

    if (unitsGroupByType !== undefined && unitsGroupByType["DIRECTION"] !== undefined) {
        directionOptions = unitsGroupByType["DIRECTION"].map(direction => {
            return { "label": direction.libelle, "value": direction.id }
        })
    } else {
        directionOptions = ""
    }
    if (unitsGroupByType !== undefined && unitsGroupByType["GUICHET"] !== undefined) {
        guichetOptions = unitsGroupByType["GUICHET"].map(guichet => {
            return { "label": guichet.libelle, "value": guichet.id }
        })
    } else {
        guichetOptions = ""
    }

    unitOptions = []
    if (directionOptions !== "") { unitOptions.push({ "label": "Direction", "options": directionOptions }) }
    if (agencyOptions !== "") { unitOptions.push({ "label": "Agence", "options": agencyOptions }) }
    if (guichetOptions !== "") { unitOptions.push({ "label": "Guichet", "options": guichetOptions }) }

    const [loadingId, setLoadingId] = useState(null);
    const handleEditClick = (claim) => (e) => {
        rowClickedHandler(e, claim, null);
    };
    const handleModal = (e, claim) => {
        e.preventDefault();
        modalify(
            "Confirmation",
            "Confirmez vous la suppression de cet élément ?",
            "confirm",
            (e) => handleDelete(e, claim)
        );
    };
    const handleDelete = (e, claim = null) => {
        e.preventDefault();


        setLoadingId(claim.id);
        deleteDenunciationApi(claim.id, props).then(() => {
            listeByStatut(props, "TEMP_SAVED").then(() => { });

            handleCancel(e);
            notify("Suppression effectuée avec succès", "success");
            setTimeout(() => setLoadingId(null), 500);
        });
    };


    const handleChange = (e) => {
        props.unitChanged(e.value)
        props.unitLibelleChanged(e.label)
    }
    const handleChange1 = (e) => {
        props.productChanged(e.value)
        props.productLibelleChanged(e.label)
    }
    let tmps = []
    const handleChange2 = (e) => {
        props.subjectChanged(e.value);
        props.subjectLibelleChanged(e.label);

        //filtre
        if (underSubjects !== undefined) {
            underSubjects.filter((underSubject) => {
                // console.log("underSubject.categorie.id",underSubject.categorie.id)
                if (e.value === underSubject.categorie.id) {
                    tmps.push({ label: underSubject.libelle, value: underSubject.id });
                }
            });
            setUnderSubjectOptions(tmps)
            // console.log("tmps",tmps)
        } else {
            underSubjectOptions = [];
        }

    };
    const handleChange3 = (e) => {
        props.collectChanged(e.value)
        props.collectLibelleChanged(e.label)
    }

    const handleChange5 = (e) => {
        // console.log("e",e)
        props.underSubjectChanged(e.value);
        props.underSubjectLibelleChanged(e.label);
    };

    let errors = {};
    const scrollToFirstError = (firstErrorFieldRef) => {
        if (firstErrorFieldRef && firstErrorFieldRef.current) {
            setTimeout(() => {
                firstErrorFieldRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 100);
        }
    };
    const clearComponentState = () => {
        props.idChanged("")
        props.subjectChanged("")
        props.underSubjectChanged("")
        props.subjectLibelleChanged("")
        props.underSubjectLibelleChanged("")
        props.collectChanged("")
        props.collectLibelleChanged("")
        props.codeChanged("")
        props.recordedAtChanged("")
        props.recordedAtDPChanged("")
        props.productChanged("")
        props.productLibelleChanged("")
        props.unitChanged("")
        props.unitLibelleChanged("")
        props.contentChanged("")
        props.claimRecordErrors("")
        props.selectedFilesReset([])
        props.selectedItemChanged({})
        props.selectedItemAudioChanged([]);
        props.selectedItemFilesChanged([])
        setClearAudio(clearAudio + 1);
        handlers.cancelRecording();
        setAudioRecordings([]);
        prevAudioRef.current = null;
        setFiles([]);
    }

    const handleCancel = (e) => {
        e.preventDefault()
        clearComponentState()

    }

    const handleValidation = () => {
        let isValid = true;
        let firstErrorFieldRef = null;
        if ((props.recorded_at === "" || props.recorded_at === undefined || props.recorded_at === null || !isValidDate(props.recorded_at))) {
            isValid = false;
            errors["recorded_at"] = "Champ incorrect";
            if (!firstErrorFieldRef) firstErrorFieldRef = recordedAtRef;
        }
        if ((props.collect === "" || props.collect === undefined || props.collect === null)) {
            isValid = false;
            errors["collect"] = "Champ incorrect";
            if (!firstErrorFieldRef) firstErrorFieldRef = collectRef;
        }
        if ((props.subject === "" || props.subject === undefined || props.subject === null)) {
            isValid = false;
            errors["subject"] = "Champ incorrect";
            if (!firstErrorFieldRef) firstErrorFieldRef = subjectRef;
        }
        if ((props.underSubject === "" || props.underSubject === undefined || props.underSubject === null)) {
            isValid = false;
            errors["underSubject"] = "Champ incorrect";
            if (!firstErrorFieldRef) firstErrorFieldRef = underSubjectRef;
        }
        if (
            (props.content === "" ||
                props.content === undefined ||
                props.content === null) &&
            audio === null &&
            (props.selectedItemAudio === null || (props.selectedItemAudio !== null && props.selectedItemAudio.length == 0))
        ) {
            isValid = false;
            errors["content"] = "Champ incorrect";
            if (!firstErrorFieldRef) firstErrorFieldRef = contentRef;
        }
        if ((props.product === "" || props.product === undefined || props.product === null)) {
            isValid = false;
            errors["product"] = "Champ incorrect";
            if (!firstErrorFieldRef) firstErrorFieldRef = productRef;
        }
        if ((props.unit === "" || props.unit === undefined || props.unit === null)) {
            isValid = false;
            errors["unit"] = "Champ incorrect";
            if (!firstErrorFieldRef) firstErrorFieldRef = unitRef;
        }
        if (!isValid) {
            scrollToFirstError(firstErrorFieldRef);
        }
        return isValid
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (handleValidation()) {
            const formData = new FormData();

            let claim = {}
            claim["collectionChannelId"] = props.collect;
            claim["servicePointId"] = props.unit;
            claim["productId"] = props.product;
            claim["fromWhatsapp"] = (props.whatsappCurrentInbox && props.whatsappSelectMessage?.length > 0) ?? false;
            claim["filesWhatsapp"] = props.whatsappSelectMessage?.filter(({ type }) => (type !== "chat"))
            claim["inboxWhatsapp"] = props.whatsappCurrentInbox ?? null
            claim["objetId"] = props.underSubject;
            claim["receiptDateTime"] = props.recorded_at;
            claim["collectorId"] = user.id;
            claim["content"] = props.content;
            claim["code"] = props.code;
            claim["id"] = props.id;

            formData.append("denun", JSON.stringify(claim));
            for (let index = 0; index < files.length; index++) {
                formData.append("files", files[index]);
            }

            //console.log("claimenregistrer",formData);
            //HERE
            // console.log("etattttttttttttt",props.etat2)
            audioRecordings.forEach(audioBlob => {
                const audioFile = new File([audioBlob], "denonciation_record_" + uuid() + ".ogg", {
                    type: "audio/ogg; codecs=opus",
                });
                formData.append("audios", audioFile);
            });
            props.etat2Changed(true)
            if (mode === 1) {
                addDenunciationApi(formData, props).then(() => {
                    handleCancel(e)
                    props.resetWhatsapp()
                    setCurrentStep(0)
                    setActiveTab("new")
                })
            } else {
                addDenunciationApiOffline(claim, props).then(() => {
                    handleCancel(e)
                    props.resetWhatsapp()
                    setCurrentStep(0)
                    setActiveTab("new")
                })
            }

        } else {
        }
        props.claimRecordErrors(errors)
    }
    const handleSave = (e) => {
        e.preventDefault()
        const formData = new FormData();
        let claim = {}

        claim["collectionChannelId"] = props.collect;
        claim["servicePointId"] = props.unit;
        claim["productId"] = props.product;
        claim["objetId"] = props.underSubject;
        claim["fromWhatsapp"] = (props.whatsappCurrentInbox && props.whatsappSelectMessage?.length > 0) ?? false;
        claim["filesWhatsapp"] = props.whatsappSelectMessage?.filter(({ type }) => (type !== "chat"))
        claim["inboxWhatsapp"] = props.whatsappCurrentInbox ?? null
        claim["receiptDateTime"] = props.recorded_at;
        claim["collectorId"] = user.id;
        claim["content"] = props.content;
        claim["code"] = props.code;
        claim["id"] = props.id;

        formData.append("denun", JSON.stringify(claim));
        for (let index = 0; index < files.length; index++) {
            formData.append("files", files[index]);
        }
        audioRecordings.forEach(audioBlob => {
            const audioFile = new File([audioBlob], "denonciation_record_" + uuid() + ".ogg", {
                type: "audio/ogg; codecs=opus",
            });
            formData.append("audios", audioFile);
        });

        // console.log(formData);
        //HERE
        props.etatChanged(true)
        if (mode === 1) {
            addTempDenunciationApi(formData, props).then(() => {
                handleCancel(e)
                props.resetWhatsapp()
                setCurrentStep(0)
                setActiveTab("new")
            })
        } else {
            addTempDenunciationApiOffline(claim, props).then(() => {
                handleCancel(e)
                props.resetWhatsapp()
                setCurrentStep(0)
                setActiveTab("new")
            })
        }



        props.claimRecordErrors(errors)
    }


    if (!settingComplete.length) {
        if (isEmpty(props.selectedItem)) {

            formButtons =
                // (actif !== undefined && actif) ?

                <>
                    {props.whatsappSelectMessage.length === 0 ? <LoadingButton
                        className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
                        onClick={handleSave}
                        loading={props.etat}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{ textTransform: "initial" }}
                    >
                        <span>Sauvegarder</span>
                    </LoadingButton>
                        : <LoadingButton
                            className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
                            onClick={() => { props.resetWhatsapp(); clearComponentState(); }}
                            loading={props.etat}
                            loadingPosition="end"
                            endIcon={<CancelOutlined />}
                            variant="contained"
                            sx={{ textTransform: "initial" }}
                        >
                            <span>Annuler</span>
                        </LoadingButton>}

                    <LoadingButton
                        onClick={(e) => {
                            e.preventDefault();
                            if (handleValidation()) {
                                handleSubmit(e);
                            }
                            props.claimRecordErrors(errors);
                        }}
                        className="waves-effect waves-effect-b waves-light btn-small"
                        loading={props.etat2}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{ backgroundColor: "var(--gpr-primary, #005081)", textTransform: "initial" }}
                    >
                        <span>Enregistrer</span>
                    </LoadingButton>

                </>

            // :
            // <div className="card-alert card red lighten-5">
            //     <div className="card-content red-text">
            //         <ul>
            //             Veuillez activer une licence.
            //         </ul>
            //     </div>
            // </div>
        } else {

            formButtons =
                // (actif !== undefined && actif) ?
                <>
                    <button type="button" onClick={(e) => handleCancel(e)}
                        className="waves-effect waves-effect-b waves-light red-text white lighten-4 btn-small mr-1">
                        Annuler
                    </button>
                    {props.whatsappSelectMessage.length === 0 ?
                        <LoadingButton
                            className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
                            onClick={handleSave}
                            loading={props.etat}
                            loadingPosition="end"
                            endIcon={<SaveIcon />}
                            variant="contained"
                            sx={{ textTransform: "initial" }}
                        >
                            <span>Sauvegarder</span>
                        </LoadingButton> : ""}

                    <LoadingButton
                        // onClick={(e) => {
                        //     e.preventDefault();
                        //     if (handleValidation()) {
                        //         handleSubmit(e)
                        //     }
                        //     props.claimRecordErrors(errors);
                        // }}

                        onClick={(e) => {
                            e.preventDefault();
                            if (handleValidation()) {
                                handleSubmit(e);
                            }
                            props.claimRecordErrors(errors);
                        }}
                        className="waves-effect waves-effect-b waves-light btn-small"
                        loading={props.etat2}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{ backgroundColor: "var(--gpr-primary, #005081)", textTransform: "initial" }}
                    >
                        <span>Enregistrer</span>
                    </LoadingButton>

                </>
            // :
            // <div className="card-alert card red lighten-5">
            //     <div className="card-content red-text">
            //         <ul>
            //             Veuillez activer une licence.
            //         </ul>
            //     </div>
            // </div>
        }
    } else {
        let output = settingComplete.map(message => {
            return <li>{message}</li>
        })
        formButtons = (
            <div className="card-alert card red lighten-5">
                <div className="card-content red-text">
                    <ul>
                        {output}
                    </ul>
                </div>
            </div>
        )
    }

    //Handling the List
    let columns = [
        {
            key: "code",
            text: "Code",
            className: "code",
            align: "left",
            sortable: true,
        },
        {
            key: "createdAtFormated",
            text: "Sauvegardé le",
            className: "created_at",
            align: "left",
            sortable: true,
            cell: (claim, index) => {
                let createdAt = new Intl.DateTimeFormat("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "numeric",
                    minute: "numeric"
                }).format(new Date(claim.createdAt));
                return (createdAt);
            }
        },
        {
            key: "action",
            text: "Actions",
            className: "action",
            align: "left",
            sortable: true,
            cell: (claim, index) => {
                const isLoading = loadingId === claim.id;
                return (
                    <div style={{ display: "flex", gap: "5px" }}>
                        <Tooltip title="Modifier">
                            <IconButton onClick={handleEditClick(claim)} color="primary">
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        {mode === 1 && (
                            <Tooltip title="Supprimer">
                                <IconButton
                                    onClick={(e) => handleModal(e, claim)}
                                    color="error"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                );
            },
        },
    ];

    let config = {
        page_size: 15,
        length_menu: [15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "Liste des dénonciations incomplètes",
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
        clearComponentState();
        props.resetWhatsapp();
        if (mode === 1) {
            props.idChanged(data.id ? data.id : "")
            props.codeChanged(data.code ? data.code : "");
            props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
            props.collectChanged(data.collectionChannel ? data.collectionChannel.id : "");
            props.collectLibelleChanged(data.collectionChannel ? data.collectionChannel.libelle : "");
            props.subjectChanged(data?.objet?.categorie ? data.objet.categorie.id : "");
            props.subjectLibelleChanged(data?.objet?.categorie ? data.objet.categorie.libelle : "");
            props.underSubjectChanged(data?.objet ? data.objet.id : "");
            props.underSubjectLibelleChanged(data?.objet ? data.objet.libelle : "");
            props.productChanged(data.product ? data.product.id : "");
            props.productLibelleChanged(data.product ? data.product.libelle : "");
            props.unitChanged(data.servicePoint ? data.servicePoint.id : "");
            props.unitLibelleChanged(data.servicePoint ? data.servicePoint.libelle : "");
            props.contentChanged(data.content ? data.content : "");
            props.selectedItemChanged(data ? data : "");
            //fetch attachments for selected claim

            getFillesApi(data.id, props);
            getDenunAudioApi(data.id, props);


        } else {
            if (data.id) {
                // console.log("datarowsig2",data)
                props.idChanged(data.id ? data.id : "")
                props.codeChanged(data.code ? data.code : "");
                props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
                props.collectChanged(data.collectionChannel ? data.collectionChannel.id : "");
                props.collectLibelleChanged(data.collectionChannel ? data.collectionChannel.libelle : "");
                props.subjectChanged(data?.objet ? data.objet.id : "");
                props.subjectLibelleChanged(data?.objet ? data.objet.libelle : "");
                props.underSubjectChanged(data?.objet?.categorie ? data.objet.categorie.id : "");
                props.underSubjectLibelleChanged(data?.objet?.categorie ? data.objet.categorie.libelle : "");
                props.productChanged(data.product ? data.product.id : "");
                props.productLibelleChanged(data.product ? data.product.libelle : "");
                props.unitChanged(data.servicePoint ? data.servicePoint.id : "");
                props.unitLibelleChanged(data.servicePoint ? data.servicePoint.libelle : "");
                props.contentChanged(data.content ? data.content : "");
                props.selectedItemChanged(data ? data : "");
                //fetch attachments for selected claim
                getFillesApi(data.id, props);
            } else {
                // console.log("datarowsig",data)
                // props.idChanged(data.id ? data.id : "")
                props.codeChanged(data.code ? data.code : "");
                props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
                props.contentChanged(data.content ? data.content : "");

                let description1 = data.collectionChannelId ? (JSON.parse(loadItemFromSessionStorage('app-supports'))).filter((e) => { return e.id === data.collectionChannelId }) : ""
                let description2 = data.objetId ? (JSON.parse(loadItemFromSessionStorage('app-objets'))).filter((e) => { return e.id === data.objetId }) : ""
                let description3 = data.productId ? (JSON.parse(loadItemFromSessionStorage('app-produits'))).filter((e) => { return e.id === data.productId }) : ""
                let description4 = data.servicePointId ? (JSON.parse(loadItemFromSessionStorage('app-ps'))).filter((e) => { return e.id === data.servicePointId }) : ""
                let description5 = data.objetId ? JSON.parse(loadItemFromSessionStorage("app-objets")).filter((e) => { return e.id === data.objetId; }) : "";

                props.collectChanged(data.collectionChannelId ? description1[0].id : "");
                props.collectLibelleChanged(data.collectionChannelId ? description1[0].libelle : "");
                props.subjectChanged(data.objetId ? description2[0].categorie.id : "");
                props.subjectLibelleChanged(
                    data.objetId ? description2[0].categorie.libelle : ""
                );
                props.underSubjectChanged(data.objetId ? description5[0].id : "");
                props.underSubjectLibelleChanged(
                    data.objetId ? description5[0].libelle : ""
                );
                props.productChanged(data.productId ? description3[0].id : "");
                props.productLibelleChanged(data.productId ? description3[0].libelle : "");
                props.unitChanged(data.servicePointId ? description4[0].id : "");
                props.unitLibelleChanged(data.servicePointId ? description4[0].libelle : "");
                props.selectedItemChanged(data ? data : "");
                //fetch attachments for selected claim
                getFillesApi(data.id, props);

            }
        }



    }
    const fileToDataURL = (file) => {
        let reader = new FileReader()
        return new Promise(function (resolve, reject) {
            reader.onload = function (event) {
                resolve(event.target.result)
            }

            reader.readAsDataURL(file)
            reader.onload = (e) => {
                props.selectedFilesChanged(e.target.result)
            }
            KTApp.unblockPage()
        })
    }

    const handleFile = (e) => {
        setFiles(e.target.files)
        let filesArray = Array.prototype.slice.call(e.target.files)
        return Promise.all(filesArray.map(fileToDataURL))
    }

    const handleDropzoneFiles = (newFilesInput) => {
        const newArr = Array.from(newFilesInput);
        setFiles(prev => {
            const prevArr = prev ? Array.from(prev) : [];
            return [...prevArr, ...newArr];
        });
        return Promise.all(newArr.map(fileToDataURL));
    };

    const removeFile = (indexToRemove) => {
        setFiles(prev => Array.from(prev).filter((_, i) => i !== indexToRemove));
    };
    const handleClose2 = () => {
        setOpen2(false);
    };

    let jfichiers;
    if (mode === 1) {
        jfichiers =
            <>
                <div className="col l12 m12 s12 file-field input-field">
                    <div className="btn btn-small file-small brand-blue">
                        <span>Joindre des fichiers</span>
                        <input type="file" multiple
                            onChange={(e) => handleFile(e)}
                            accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, audio/*, video/*"
                        />
                    </div>

                    <div className="file-path-wrapper">
                        <input className="file-path validate" type="text"
                            value={props.selectedFiles} />
                    </div>
                    <small className="errorTxt4">
                        <div id="cpassword-error"
                            className="error">{props.errors.selectedFiles}</div>
                    </small>
                </div>

            </>
    } else {
        jfichiers = ""
    }

    let attachmentList
    // console.log("props.selectedItemFiles", props.selectedItemFiles);
    if (/**/props.selectedItemFiles.length > 0) {

        let attachmentListChild = props.selectedItemFiles.map(attachment => {
            let icon = guessExtension(attachment);
            return (
                <div className="col xl12 l12 m12 s12" key={attachment.id}>
                    <div
                        className="card box-shadow-none mb-1 app-file-info">
                        <div className="card-content">
                            <div className="row" >
                                <div className="col xl1 l1 s1 m1">
                                    <div className="app-file-content-logo">
                                        <div className="fonticon hide">
                                            <i className="material-icons ">more_vert</i>
                                        </div>
                                        <img className="recent-file"
                                            src={icon}
                                            height="38" width="30"
                                            alt="" />
                                    </div>
                                </div>
                                <div className="col xl11 l11 s11 m11">
                                    <div className="app-file-recent-details">
                                        <div
                                            className="app-file-name font-weight-700 truncate">{attachment.name}
                                        </div>
                                        <div
                                            className="app-file-size">{Math.round(((attachment.size / 1024) + Number.EPSILON) * 100) / 100} Ko
                                        </div>
                                        <div className="app-file-last-access"><span onClick={(e) => { downloadFillesApi(attachment.id, attachment.name); }} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#005081", cursor: "pointer", fontWeight: 600 }}><FileDownloadIcon style={{ fontSize: 14 }} /> Télécharger</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        })
        attachmentList = (
            <div className="col s12 app-file-content grey lighten-4">
                <span className="app-file-label">Fichiers joints</span>
                <div className="row app-file-recent-access mb-3">
                    {attachmentListChild}
                </div>
            </div>

        )
    }
    else {

    }
    let audioList;
    if (props.selectedItemAudio != null && props.selectedItemAudio.length > 0) {
        let audioListChild = props.selectedItemAudio.map((attachment) => {

            return (
                <div className="col xl12 l12 m12 s12" key={attachment.id}>

                    <div className="card box-shadow-none mb-1 ">
                        <div className="card-content">
                            <div className="row">
                                <div className="col xl11 l11 s11 m11">
                                    <div className="app-file-recent-details">
                                        <div className="app-file-name font-weight-700 truncate">
                                            {attachment.name}
                                        </div>
                                        <div className="app-file-size">
                                            {Math.round(
                                                (attachment.size / 1024 + Number.EPSILON) * 100
                                            ) / 100}{" "}
                                            Ko
                                        </div>
                                        <div className="app-file-last-access" id={"audio-" + attachment.id}>
                                            <span
                                                style={{ cursor: "pointer" }}
                                                onClick={(e) => {
                                                    downloadAudioApi(attachment.id, attachment.name).then(
                                                        (data) => {
                                                            // console.log(data);

                                                            let blobAudio = new Blob([data], { type: "audio/ogg; codecs=opus" });
                                                            let aud = new Audio(window.URL.createObjectURL(blobAudio));
                                                            setCurrentAudio(window.URL.createObjectURL(blobAudio))
                                                            setAudioPlayer("audio-" + attachment.id)
                                                        }
                                                    )
                                                }}
                                            >{showAudioPlayer === "audio-" + attachment.id && ("")} {showAudioPlayer !== "audio-" + attachment.id && ("Afficher")}</span>

                                            {showAudioPlayer === "audio-" + attachment.id && (<audio controls autoPlay onEnded={(e) => { setAudioPlayer("") }}>
                                                <source src={currentAudio} type="audio/ogg" />
                                                Votre navigateur ne prend pas en charge l'élément audio.
                                            </audio>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
        audioList = (
            <div className="col s12 app-file-content">
                <div className="row app-file-recent-access mb-3">{audioListChild}</div>
            </div>
        );
    }

    let content = [];
    content = props.items;
    //darrell : add custome attribut for search 
    content.forEach(element => {
        //date createdAt
        let createdAt = new Intl.DateTimeFormat("fr-FR", {
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "numeric",
            minute: "numeric"
        }).format(new Date(element.createdAt));
        element.createdAtFormated = createdAt;
    });

    let formAudio;
    if (mode === 1) {
        formAudio = (
            <>
                <div
                    style={{
                        position: "absolute",
                        right: "0px",
                        top: "-16px",
                    }}
                >
                    <Fab
                        color="primary"
                        aria-label="audio"
                        size="small"
                        onClick={(e) => {
                            e.preventDefault();
                            setAudioBox(true);
                            setOpen2(true);
                        }}
                    >
                        <Mic />
                    </Fab>
                </div>
            </>
        )
    } else {
        formAudio = ""
    }

    // ── Wizard config ────────────────────────────────────────────────────────
    const STEPS = [
        { key: "infos", label: "Informations", sublabel: "Objet, canal, contenu", icon: <AssignmentOutlinedIcon /> },
        { key: "fichiers", label: "Pièces jointes", sublabel: "Documents et audio", icon: <AttachFileIcon /> },
        { key: "recap", label: "Récapitulatif", sublabel: "Vérification avant envoi", icon: <TaskAltIcon /> },
    ];

    const apercu = {
        "Motif": props.underSubjectLibelle,
        "Canal": props.collectLibelle,
        "Produit": props.productLibelle,
    };

    // Completion: count filled required fields out of 7
    const filledCount = [
        isValidDate(props.recorded_at) ? props.recorded_at : "",
        props.collect, props.subject, props.underSubject, props.product, props.unit,
        props.content || (audio !== null),
    ].filter(Boolean).length;
    const completionPercent = Math.round((filledCount / 7) * 100);

    const validateStep0 = () => {
        let isValid = true;
        errors = {};
        if (!props.recorded_at || !isValidDate(props.recorded_at)) {
            isValid = false; errors["recorded_at"] = "Champ incorrect";
        }
        if (!props.collect) {
            isValid = false; errors["collect"] = "Champ incorrect";
        }
        if (!props.subject) {
            isValid = false; errors["subject"] = "Champ incorrect";
        }
        if (!props.underSubject) {
            isValid = false; errors["underSubject"] = "Champ incorrect";
        }
        if (!props.content && audio === null && (!props.selectedItemAudio || props.selectedItemAudio.length === 0)) {
            isValid = false; errors["content"] = "Champ incorrect";
        }
        if (!props.product) {
            isValid = false; errors["product"] = "Champ incorrect";
        }
        if (!props.unit) {
            isValid = false; errors["unit"] = "Champ incorrect";
        }
        props.claimRecordErrors(errors);
        return isValid;
    };

    const handleNext = () => {
        if (currentStep === 0 && !validateStep0()) return;
        setCurrentStep(s => s + 1);
    };

    const handleFinalSubmit = () => {
        handleSubmit({ preventDefault: () => { } });
    };

    const handleSaveDraft = () => {
        handleSave({ preventDefault: () => { } });
    };

    return (
        <>




            {showAudioBox && (
                <div>
                    <Dialog
                        open={open2}
                        onClose={handleClose2}
                        style={{ padding: "16px" }}
                    >
                        <DialogTitle
                            align="center"
                            color={"var(--gpr-primary, #005081)"}
                            fontSize={"23px"}
                            fontWeight={"bold"}
                        >
                            Enregistreur vocal dénonciations
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText
                                align="center"
                                fontSize={"14px"}
                                textAlign={"center"}
                            >
                                Cliquez sur le bouton ci-dessous et parler dans le micro de
                                votre téléphone, ou branchez un casque ou des écouteurs
                            </DialogContentText>

                            <section className="voice-recorder">
                                <div className="recorder-container">
                                    <RecorderControls
                                        recorderState={recorderState}
                                        handlers={handlers}
                                        closeAction={handleClose2}
                                    />
                                    {/* <RecordingsList audio={audio} /> */}
                                </div>
                            </section>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            <WizardLayout
                title="Enregistrer une dénonciation"
                subtitle="Formulaire d'enregistrement"
                onBack={() => history.goBack()}
                hasDraft={props.items.length > 0}
                draftCount={props.items.length}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                steps={STEPS}
                currentStep={currentStep}
                completionPercent={completionPercent}
                apercu={apercu}
                onSaveDraft={handleSaveDraft}
                onNext={handleNext}
                onPrev={() => setCurrentStep(s => s - 1)}
                isLastStep={currentStep === 2}
                onSubmit={handleFinalSubmit}
                loadingSave={props.etat}
                loadingSubmit={props.etat2}
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
                                        onClick={(e) => {
                                            rowClickedHandler(e, draft, null);
                                            setCurrentStep(0);
                                            setActiveTab("new");
                                        }}
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
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                            background: "#e8f4fc", display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <AssignmentOutlinedIcon style={{ fontSize: 20, color: "#005081" }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>
                                                {draft.code || "Brouillon sans code"}
                                            </div>
                                            <div style={{ fontSize: 11, color: "#64748b" }}>
                                                {draft.createdAtFormated || "—"}
                                            </div>
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
                {/* ?? Step 0 — Informations ??????????????????????????? */}
                {currentStep === 0 && (
                    <div className="row">
                        <div className="col l12 m12 s12 input-field" ref={recordedAtRef}>
                            <DatePicker
                                withPortal closeOnScroll={true} isClearable showTimeInput showMonthDropdown
                                value={props.recorded_at}
                                timeInputLabel="Heure :" todayButton="Aujourd'hui"
                                selected={props.recorded_at_dp}
                                onChange={(date) => handleDatePicker(date, props)}
                                dateFormat="dd-MM-yyyy HH:mm" locale="fr"
                            />
                            <label htmlFor="recorded_at" className="active">
                                Date de réception <span>(<span className="red-text darken-2">*</span>)</span>
                            </label>
                            <small className="errorTxt4"><div className="error">{props.errors?.recorded_at}</div></small>
                        </div>

                        <div className="col l6 m12 s12 input-field" ref={collectRef}>
                            <Select
                                value={props.collect ? { label: props.collectLibelle, value: props.collect } : "Sélectionner la modalité de dépôt"}
                                options={collectOptions} className="react-select-container mt-4" classNamePrefix="react-select"
                                style={styles} placeholder="Sélectionner la modalité de dépôt" onChange={handleChange3}
                            />
                            <label className="active">Modalité de dépôt <span>(<span className="red-text darken-2">*</span>)</span></label>
                            <small className="errorTxt4"><div className="error">{props.errors?.collect}</div></small>
                        </div>

                        <div className="col l6 m12 s12 input-field" ref={subjectRef}>
                            <Select
                                value={props.subject ? { label: props.subjectLibelle, value: props.subject } : "Sélectionner la catégorie de l'objet"}
                                options={subjectOptions} className="react-select-container mt-4" classNamePrefix="react-select"
                                style={styles} placeholder="Sélectionner la catégorie de l'objet" onChange={handleChange2}
                            />
                            <label className="active">Catégorie d'objet <span>(<span className="red-text darken-2">*</span>)</span></label>
                            <small className="errorTxt4"><div className="error">{props.errors?.subject}</div></small>
                        </div>

                        <div className="col l12 m12 s12 input-field" ref={underSubjectRef}>
                            <Select
                                value={props.underSubject ? { label: props.underSubjectLibelle, value: props.underSubject } : "Sélectionner le motif de dénonciation"}
                                options={underSubjectOptions} className="react-select-container mt-4" classNamePrefix="react-select"
                                style={styles} placeholder="Sélectionner le motif de dénonciation" onChange={handleChange5}
                            />
                            <label className="active">Motif de dénonciation <span>(<span className="red-text darken-2">*</span>)</span></label>
                            <small className="errorTxt4"><div className="error">{props.errors?.underSubject}</div></small>
                        </div>

                        <div className="col l6 m12 s12 input-field" ref={productRef}>
                            <Select
                                value={props.product ? { label: props.productLibelle, value: props.product } : "Sélectionner le produit"}
                                options={productOptions} className="react-select-container mt-4" classNamePrefix="react-select"
                                style={styles} placeholder="Sélectionner le produit" onChange={handleChange1}
                            />
                            <label className="active">Produit ou service <span>(<span className="red-text darken-2">*</span>)</span></label>
                            <small className="errorTxt4"><div className="error">{props.errors?.product}</div></small>
                        </div>

                        <div className="col l6 m12 s12 input-field" ref={unitRef}>
                            <Select
                                value={props.unit ? { label: props.unitLibelle, value: props.unit } : "Sélectionner le point de service"}
                                options={unitOptions} className="react-select-container mt-4" classNamePrefix="react-select"
                                style={styles} placeholder="Sélectionner le point de service" onChange={handleChange}
                            />
                            <label className="active">Point de service indexé (<span className="red-text darken-2">*</span>)</label>
                            <small className="errorTxt4"><div className="error">{props.errors?.unit}</div></small>
                        </div>

                        <div className="col l12 m12 s12 input-field" ref={contentRef} style={{ position: "relative" }}>
                            {formAudio}
                            <textarea id="content" name="content" placeholder="" rows="3"
                                className="materialize-textarea" value={props.content}
                                onChange={(e) => props.contentChanged(e.target.value)}
                            />
                            <label htmlFor="content" className="active">
                                Contenu <span>(<span className="red-text darken-2">*</span>)</span>
                            </label>
                            <small className="errorTxt4"><div className="error">{props.errors?.content}</div></small>
                        </div>

                        {/* Audio feedback — visible immédiatement après l'enregistrement */}
                        {(audioRecordings.length > 0 || props.selectedItemAudio?.length > 0) && (
                            <div className="col l12 m12 s12" style={{ marginTop: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                    <Mic style={{ fontSize: 15, color: "#005081" }} />
                                    Audio enregistré
                                </div>

                                {audioRecordings.map((audioBlob, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#e8f4fc", borderRadius: 10, border: "1px solid #99cde8", marginBottom: 6 }}>
                                        <Mic style={{ fontSize: 16, color: "#005081", flexShrink: 0 }} />
                                        <audio controls style={{ flex: 1, height: 30 }}>
                                            <source src={URL.createObjectURL(audioBlob)} type="audio/ogg" />
                                        </audio>
                                        <button onClick={() => setAudioRecordings(prev => prev.filter((_, j) => j !== i))}
                                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 20, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>×</button>
                                    </div>
                                ))}
                                {props.selectedItemAudio?.map((audioItem, i) => (
                                    <div key={"s" + i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#e8f4fc", borderRadius: 10, border: "1px solid #99cde8", marginBottom: 6 }}>
                                        <Mic style={{ fontSize: 16, color: "#005081", flexShrink: 0 }} />
                                        <audio controls style={{ flex: 1, height: 30 }}>
                                            <source src={URL.createObjectURL(new Blob([audioItem], { type: "audio/ogg" }))} type="audio/ogg" />
                                        </audio>
                                        <button onClick={() => props.selectedItemAudioChanged(props.selectedItemAudio.filter((_, j) => j !== i))}
                                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 20, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                )}

                {/* ── Step 1 – Pièces jointes ─────────────────────────── */}
                {currentStep === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {mode === 1 && (
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                                    <InsertDriveFileOutlinedIcon style={{ fontSize: 17, color: "#005081" }} />
                                    Documents joints
                                </div>
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleDropzoneFiles(e.dataTransfer.files); }}
                                    onClick={() => document.getElementById("wz-den-file-input").click()}
                                    style={{
                                        border: `2px dashed ${isDragging ? "#005081" : "#cbd5e1"}`,
                                        borderRadius: 14, padding: "32px 20px", textAlign: "center",
                                        background: isDragging ? "#e8f4fc" : "#f8fafc",
                                        cursor: "pointer", transition: "all 0.2s",
                                    }}
                                >
                                    <CloudUploadOutlinedIcon style={{ fontSize: 44, color: isDragging ? "#005081" : "#94a3b8", marginBottom: 10 }} />
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>Glissez vos fichiers ici</div>
                                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                                        ou <span style={{ color: "#005081", fontWeight: 700 }}>parcourez</span> depuis votre appareil
                                    </div>
                                    <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 8 }}>PDF · Word · Excel · Images · Audio · Vidéo</div>
                                    <input id="wz-den-file-input" type="file" multiple style={{ display: "none" }}
                                        onChange={(e) => handleDropzoneFiles(e.target.files)}
                                        accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, audio/*, video/*"
                                    />
                                </div>
                                {files && Array.from(files).length > 0 && (
                                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                                        {Array.from(files).map((file, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "white", borderRadius: 10, border: "1.5px solid #e2e8f0" }}>
                                                <InsertDriveFileOutlinedIcon style={{ fontSize: 18, color: "#005081", flexShrink: 0 }} />
                                                <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                                                <div style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, marginRight: 6 }}>{(file.size / 1024).toFixed(0)} Ko</div>
                                                <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18, lineHeight: 1, padding: "0 2px", flexShrink: 0 }} title="Retirer">×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {props.selectedItemFiles?.length > 0 && (
                                    <div style={{ marginTop: 10 }}>
                                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>Fichiers déjà enregistrés</div>
                                        {props.selectedItemFiles.map((file, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 4 }}>
                                                <InsertDriveFileOutlinedIcon style={{ fontSize: 15, color: "#64748b", flexShrink: 0 }} />
                                                <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#64748b" }}>{file.name}</div>
                                                <a onClick={(e) => { e.preventDefault(); downloadFillesApi(file.id, file.name); }} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#005081", cursor: "pointer", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}><FileDownloadIcon style={{ fontSize: 14 }} /> Télécharger</a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                                <Mic style={{ fontSize: 17, color: "#005081" }} />
                                Enregistrement vocal
                            </div>
                            {audioRecordings.length === 0 && !props.selectedItemAudio?.length ? (
                                <div style={{ background: "#f8fafc", borderRadius: 12, border: "1.5px dashed #e2e8f0", padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                                    <Mic style={{ fontSize: 28, opacity: 0.3, display: "block", margin: "0 auto 6px" }} />
                                    Aucun audio enregistré
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {audioRecordings.map((audioBlob, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "white", borderRadius: 10, border: "1.5px solid #99cde8" }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#e8f4fc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <Mic style={{ fontSize: 16, color: "#005081" }} />
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
                                                <Mic style={{ fontSize: 16, color: "#005081" }} />
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
                        {whatsappAttachmentList && <div>{whatsappAttachmentList}</div>}
                    </div>
                )}

                {/* ── Step 2 – Récapitulatif ─────────────────────────── */}
                {currentStep === 2 && (
                    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                        <div style={{ backgroundColor: '#f5f5f5', padding: '8px 14px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <SupportAgentIcon style={{ fontSize: '18px', color: '#616161' }} />
                            <span style={{ color: '#424242', fontWeight: '600', fontSize: '14px' }}>Résumé de la dénonciation</span>
                        </div>
                        <div style={{ padding: '4px 14px' }}>
                            <div style={{ display: 'flex', padding: '7px 0', borderBottom: '1px solid #f5f5f5' }}>
                                <span style={{ color: '#757575', width: '160px', fontSize: '13px', flexShrink: 0 }}>Produit</span>
                                <span style={{ fontWeight: '600', fontSize: '13px' }}>{props.productLibelle}</span>
                            </div>
                            <div style={{ display: 'flex', padding: '7px 0', borderBottom: '1px solid #f5f5f5' }}>
                                <span style={{ color: '#757575', width: '160px', fontSize: '13px', flexShrink: 0 }}>Catégorie</span>
                                <span style={{ fontWeight: '600', fontSize: '13px' }}>{props.subjectLibelle}</span>
                            </div>
                            <div style={{ display: 'flex', padding: '7px 0', borderBottom: '1px solid #f5f5f5' }}>
                                <span style={{ color: '#757575', width: '160px', fontSize: '13px', flexShrink: 0 }}>Motif</span>
                                <span style={{ fontWeight: '600', fontSize: '13px' }}>{props.underSubjectLibelle}</span>
                            </div>
                            <div style={{ display: 'flex', padding: '7px 0', borderBottom: '1px solid #f5f5f5' }}>
                                <span style={{ color: '#757575', width: '160px', fontSize: '13px', flexShrink: 0 }}>Point de service</span>
                                <span style={{ fontWeight: '600', fontSize: '13px' }}>{props.unitLibelle}</span>
                            </div>
                            <div style={{ display: 'flex', padding: '7px 0', borderBottom: '1px solid #f5f5f5' }}>
                                <span style={{ color: '#757575', width: '160px', fontSize: '13px', flexShrink: 0 }}>Date de réception</span>
                                <span style={{ fontWeight: '600', fontSize: '13px' }}>
                                    {props.recorded_at ? moment(props.recorded_at, 'DD-MM-YYYY HH:mm').format('DD MMMM YYYY [à] HH:mm') : '—'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', padding: '7px 0', borderBottom: '1px solid #f5f5f5' }}>
                                <span style={{ color: '#757575', width: '160px', fontSize: '13px', flexShrink: 0 }}>Contenu</span>
                                <span style={{ fontWeight: '600', fontSize: '13px', flex: 1 }}>
                                    {props.content && props.content !== '#ReclamationAudio' ? props.content : (!props.content && audioRecordings.length === 0 && !props.selectedItemAudio?.length ? '—' : null)}
                                </span>
                            </div>

                            {/* Audios */}
                            {(audioRecordings.length > 0 || props.selectedItemAudio?.length > 0) && (
                                <div style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                                    <span style={{ color: '#757575', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                                        Audios ({audioRecordings.length + (props.selectedItemAudio?.length ?? 0)})
                                    </span>
                                    {audioRecordings.map((audioBlob, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#e8f4fc', borderRadius: 8, marginBottom: 6, border: '1px solid #99cde8' }}>
                                            <Mic style={{ fontSize: 16, color: '#005081', flexShrink: 0 }} />
                                            <audio controls style={{ flex: 1, height: 30 }}>
                                                <source src={URL.createObjectURL(audioBlob)} type="audio/ogg" />
                                            </audio>
                                        </div>
                                    ))}
                                    {props.selectedItemAudio?.map((audioItem, i) => (
                                        <div key={'s' + i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 6, border: '1px solid #e2e8f0' }}>
                                            <Mic style={{ fontSize: 16, color: '#005081', flexShrink: 0 }} />
                                            <audio controls style={{ flex: 1, height: 30 }}>
                                                <source src={URL.createObjectURL(new Blob([audioItem], { type: 'audio/ogg' }))} type="audio/ogg" />
                                            </audio>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Fichiers */}
                            {((files && Array.from(files).length > 0) || props.selectedItemFiles?.length > 0) && (
                                <div style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                                    <span style={{ color: '#757575', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                                        Fichiers joints ({Array.from(files || []).length + (props.selectedItemFiles?.length ?? 0)})
                                    </span>
                                    {props.selectedItemFiles?.map((file, i) => (
                                        <div key={'saved-' + i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', marginBottom: 4, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                                            <InsertDriveFileOutlinedIcon style={{ fontSize: 15, color: '#16a34a', flexShrink: 0 }} />
                                            <span style={{ fontSize: '12px', color: '#374151', fontWeight: 600, flex: 1 }}>{file.name}</span>
                                            <a onClick={(e) => { e.preventDefault(); e.stopPropagation(); downloadFillesApi(file.id, file.name); }} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#005081', cursor: 'pointer', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}><FileDownloadIcon style={{ fontSize: 14 }} /> Télécharger</a>
                                        </div>
                                    ))}
                                    {Array.from(files || []).map((file, i) => (
                                        <div key={'new-' + i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', marginBottom: 4, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                            <InsertDriveFileOutlinedIcon style={{ fontSize: 15, color: '#64748b', flexShrink: 0 }} />
                                            <span style={{ fontSize: '12px', color: '#374151', fontWeight: 600, flex: 1 }}>{file.name}</span>
                                            <a href={URL.createObjectURL(file)} download={file.name} onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#005081', cursor: 'pointer', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}><FileDownloadIcon style={{ fontSize: 14 }} /> Télécharger</a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </WizardLayout>
        </>
    )
};


const mapStateToProps = (state) => {
    return {
        whatsappInboxs: state.whatsapp.inboxs,
        whatsappMessages: state.whatsapp.messages,
        whatsappCurrentInbox: state.whatsapp.currentInbox,
        whatsappSelectMessage: state.whatsapp.selectMessage,

        isLoading: state.claim_record.isLoading,
        id: state.claim_record.id,
        code: state.claim_record.code,
        recorded_at: state.claim_record.recorded_at,
        recorded_at_dp: state.claim_record.recorded_at_dp,
        subject: state.claim_record.subject,
        subjectLibelle: state.claim_record.subjectLibelle,
        underSubject: state.claim_record.underSubject,
        underSubjectLibelle: state.claim_record.underSubjectLibelle,
        collect: state.claim_record.collect,
        collectLibelle: state.claim_record.collectLibelle,
        product: state.claim_record.product,
        productLibelle: state.claim_record.productLibelle,
        unit: state.claim_record.unit,
        unitLibelle: state.claim_record.unitLibelle,
        content: state.claim_record.content,
        errors: state.claim_record.claim_record_errors,
        items: state.claim_record.items,
        selectedFiles: state.claim_record.selectedFiles,
        selectedItem: state.claim_record.selectedItem,
        selectedItemFiles: state.claim_record.selectedItemFiles,
        selectedItemAudio: state.claim_record.selectedItemAudio,
        etat: state.claim_record.etat,
        etat2: state.claim_record.etat2,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        loading: (err) => {
            dispatch(loading(err))
        },
        claimRecordErrors: (err) => {
            dispatch(claimRecordErrors(err))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        codeChanged: (code) => {
            dispatch(codeChanged(code))
        },
        recordedAtChanged: (recordedAt) => {
            dispatch(recordedAtChanged(recordedAt))
        },
        recordedAtDPChanged: (recordedAt) => {
            dispatch(recordedAtDPChanged(recordedAt))
        },
        collectChanged: (collect) => {
            dispatch(collectChanged(collect))
        },
        collectLibelleChanged: (collectLibelle) => {
            dispatch(collectLibelleChanged(collectLibelle))
        },
        subjectChanged: (subject) => {
            dispatch(subjectChanged(subject))
        },
        subjectLibelleChanged: (subjectLibelle) => {
            dispatch(subjectLibelleChanged(subjectLibelle))
        },
        underSubjectChanged: (underSubject) => {
            dispatch(underSubjectChanged(underSubject));
        },
        underSubjectLibelleChanged: (underSubjectLibelle) => {
            dispatch(underSubjectLibelleChanged(underSubjectLibelle));
        },
        productChanged: (product) => {
            dispatch(productChanged(product))
        },
        productLibelleChanged: (productLibelle) => {
            dispatch(productLibelleChanged(productLibelle))
        },
        unitLibelleChanged: (unitLibelle) => {
            dispatch(unitLibelleChanged(unitLibelle))
        },
        unitChanged: (unit) => {
            dispatch(unitChanged(unit))
        },
        contentChanged: (content) => {
            dispatch(contentChanged(content))
        },
        itemsChanged: (items) => {
            dispatch(itemsChanged(items))
        },
        selectedFilesChanged: (selectedFiles) => {
            dispatch(selectedFilesChanged(selectedFiles))
        },
        selectedFilesReset: (selectedFiles) => {
            dispatch(selectedFilesReset(selectedFiles))
        },
        selectedItemChanged: (selectedItem) => {
            dispatch(selectedItemChanged(selectedItem))
        },
        selectedItemFilesChanged: (selectedItemFiles) => {
            dispatch(selectedItemFilesChanged(selectedItemFiles))
        },
        selectedItemAudioChanged: (selectedItemAudio) => {
            dispatch(selectedItemAudioChanged(selectedItemAudio));
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat))
        },
        etat2Changed: (etat2) => {
            dispatch(etat2Changed(etat2))
        },
        resetWhatsapp: () => {
            dispatch(reset())
        },

    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(EnregistrerDenonciation);
