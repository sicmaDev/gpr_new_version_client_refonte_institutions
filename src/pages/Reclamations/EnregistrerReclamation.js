import React, { useEffect, useRef, useState, Component } from "react";
import { fetchPendingWAFiles, isAudioFile } from "../../whatgpr/pendingWAFiles";
import Select from "react-select";
import ReactDatatable from "@ashvin27/react-datatable";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import HelpIcon from "@mui/icons-material/Help";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import Fab from "@mui/material/Fab";
import MicIcon from "@mui/icons-material/Mic";
import { modalify } from "../../Utils/modal";
import {
  addressChanged,
  claimRecordErrors,
  codeChanged,
  collectChanged,
  collectLibelleChanged,
  contentChanged,
  dossierimfChanged,
  emailChanged,
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
  phoneChanged,
  productChanged,
  productLibelleChanged,
  recordedAtChanged,
  recordedAtDPChanged,
  selectedFilesChanged,
  selectedFilesReset,
  selectedItemAudioChanged,
  selectedItemChanged,
  selectedItemFilesChanged,
  subjectChanged,
  subjectLibelleChanged,
  underSubjectChanged,
  underSubjectLibelleChanged,
  unitChanged,
  unitLibelleChanged,
  setExistingClaims,
  setModalVisible,
} from "../../redux/actions/Reclamations/EnregistrementReclamationActions";
import {
  cleanPhoneNumber,
  cleanPhoneNumber2,
  cleanPhoneNumber3,
  groupBy,
  guessExtension,
  handleDatePicker,
  isEmpty,
  isSettingComplete,
  isValidDate,
  isValidPhone,
  loadItemFromLocalStorage,
  loadItemFromSessionStorage,
  sleep,
  filesToBase64Dtos,
} from "../../Utils/utils";
import {
  addClaimApi,
  addClaimApiOffline,
  addTempClaimApi,
  addTempClaimApiOffline,
  downloadFillesApi,
  getFillesApi,
  getClaimAudioApi,
  listeByStatut,
  listeByStatutOffline,
  downloadAudioApi,
  deleteClaimApi,
  deleteOnlyClaimApi,
  checkPhoneApi,
  checkPhoneCrossAgencyApi,
} from "../../apis/Reclamations/ReclamationsApi";
import http from "../../apis/http-common";
import { KTApp } from "../../Utils/blockui";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemText,
  MenuItem,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import SaveIcon from "@mui/icons-material/Save";
import { notify } from "../../Utils/alert";
import axios from "axios";
import RecorderControls from "../../components/recorder-controls";
import RecordingsList from "../../components/recordings-list";
import useRecorder from "../../hooks/useRecorder";
// import DateInput from "../ui/DateInput";
//import IntlTelInput from 'react-intl-tel-input';
//import 'react-intl-tel-input/dist/main.css';
import { v4 as uuid } from "uuid";
import PhoneInput from "react-phone-number-input";
import { licenseInfo } from "../../apis/LoginApi";
import { INSTITUTION_PAYS_CODE } from "../../Utils/globals";
import moment from "moment";
import { reset } from "../../redux/actions/WhatsappActions";
import { CancelOutlined } from "@mui/icons-material";
import { Tooltip, IconButton, CircularProgress } from "@mui/material";
import { send } from "../../apis/Configurations/SmsApi";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import CallIcon from "@mui/icons-material/Call";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WcIcon from "@mui/icons-material/Wc";
import LanguageIcon from "@mui/icons-material/Language";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import RecyclingIcon from "@mui/icons-material/Recycling";
import CategoryIcon from "@mui/icons-material/Category";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import DataObjectIcon from "@mui/icons-material/DataObject";
import PinIcon from "@mui/icons-material/Pin";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from "@mui/icons-material/Person";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { sendEmail } from "../../apis/Configurations/MailApi";
import "moment/locale/fr";
import WizardLayout from "../../components/shared/WizardLayout";
moment.locale("fr");
registerLocale("fr", fr);

const styles = {
  control: (base) => ({
    ...base,
    height: 35,
    minHeight: 35,
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
};

// Limites d'ajout de pièces jointes à l'enregistrement d'une réclamation
// (revérifiées côté serveur dans ClaimController.validateAttachments - ces
// contrôles côté client ne servent qu'à donner un retour immédiat à l'agent).
const MAX_FILES_COUNT = 5;
const MAX_AUDIOS_COUNT = 3;
const MAX_DOC_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo (documents/images)
const MAX_AV_FILE_SIZE = 20 * 1024 * 1024; // 20 Mo (audio/vidéo)
const MAX_TOTAL_ATTACHMENTS_SIZE = 100 * 1024 * 1024; // 100 Mo cumulés

const isAudioOrVideoFile = (file) => !!file.type && (file.type.startsWith("audio/") || file.type.startsWith("video/"));
const sumFilesSize = (arr) => Array.from(arr || []).reduce((s, f) => s + (f.size || 0), 0);
const toMB = (bytes) => Math.round(bytes / (1024 * 1024));

// Valide la liste finale des fichiers (après ajout) + les audios déjà enregistrés.
// Retourne true si OK, sinon affiche un message et retourne false.
const checkFilesConstraints = (finalFilesArr, audioRecordingsArr) => {
  if (finalFilesArr.length > MAX_FILES_COUNT) {
    window.alert(`Vous ne pouvez pas joindre plus de ${MAX_FILES_COUNT} fichiers.`);
    return false;
  }
  for (const file of finalFilesArr) {
    const maxSize = isAudioOrVideoFile(file) ? MAX_AV_FILE_SIZE : MAX_DOC_FILE_SIZE;
    if (file.size > maxSize) {
      window.alert(`Le fichier "${file.name}" dépasse la taille maximale autorisée (${toMB(maxSize)} Mo).`);
      return false;
    }
  }
  const totalSize = sumFilesSize(finalFilesArr) + sumFilesSize(audioRecordingsArr);
  if (totalSize > MAX_TOTAL_ATTACHMENTS_SIZE) {
    window.alert(`La taille totale des pièces jointes dépasse la limite autorisée (${toMB(MAX_TOTAL_ATTACHMENTS_SIZE)} Mo).`);
    return false;
  }
  return true;
};

// Valide un nouvel enregistrement audio par rapport à ceux déjà présents + aux fichiers.
const checkNewAudioConstraints = (existingAudioRecordings, newAudioBlob, filesArr) => {
  if (existingAudioRecordings.length >= MAX_AUDIOS_COUNT) {
    window.alert(`Vous ne pouvez pas joindre plus de ${MAX_AUDIOS_COUNT} enregistrements audio.`);
    return false;
  }
  if (newAudioBlob.size > MAX_AV_FILE_SIZE) {
    window.alert(`L'enregistrement audio dépasse la taille maximale autorisée (${toMB(MAX_AV_FILE_SIZE)} Mo).`);
    return false;
  }
  const totalSize = sumFilesSize(filesArr) + sumFilesSize(existingAudioRecordings) + newAudioBlob.size;
  if (totalSize > MAX_TOTAL_ATTACHMENTS_SIZE) {
    window.alert(`La taille totale des pièces jointes dépasse la limite autorisée (${toMB(MAX_TOTAL_ATTACHMENTS_SIZE)} Mo).`);
    return false;
  }
  return true;
};
const EnregistrerReclamation = (props) => {
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("new");
  const [isDragging, setIsDragging] = useState(false);
  const history = useHistory();
  const [files, setFiles] = React.useState([]);
  const { recorderState, ...handlers } = useRecorder();
  let { audio } = recorderState;

  const [isLoading, setIsLoading] = useState(false)
  let settingComplete = isSettingComplete();
  let user =
    loadItemFromSessionStorage("app-user") !== undefined
      ? loadItemFromSessionStorage("app-user")
      : undefined;
  let mode =
    loadItemFromLocalStorage("app-mode") !== undefined
      ? loadItemFromLocalStorage("app-mode")
      : undefined;

  let appInstitution =
    loadItemFromLocalStorage("app-institution") !== undefined &&
      loadItemFromLocalStorage("app-institution").length !== 0
      ? loadItemFromLocalStorage("app-institution")
      : undefined;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleClose2 = () => {
    setOpen2(false);
  };

  useEffect(() => {
    KTApp.blockPage({
      overlayColor: '#000000',
      type: 'v2',
      state: 'danger',
      message: 'En cours de chargement...'
    })
    setIsLoading(true);

    if (mode === 1) {
      props.itemsChanged([]);
      listeByStatut(props, "TEMP_SAVED").then((r) => { }).finally(() => {
        setIsLoading(false)
        KTApp.unblockPage()
      });
    } else {
      props.itemsChanged([]);
      listeByStatutOffline(props, "TEMP_SAVED").then((r) => { }).finally(() => {
        setIsLoading(false)
        KTApp.unblockPage()
      });
    }

    window
      .$(".buttons-excel")
      .html('<span><i class="fa fa-file-excel"></i></span>');
    window
      .$("ul.pagination")
      .parent()
      .parent()
      .css({ marginTop: "1%", boxShadow: "none" });
    window.$("ul.pagination").parent().css({ boxShadow: "none" });
    window.$("ul.pagination").parent().addClass("white");
    window.$("ul.pagination").addClass("right-align");
    window.$("a.page-link input").addClass("indigo-text bold-text");
    window.$(".pagination li.disabled a").addClass("black-text");
    window.$("#as-react-datatable").removeClass("table-bordered table-striped");
    window
      .$("#as-react-datatable")
      .addClass("highlight display dataTable dtr-inline");
    window.$("#as-react-datatable tr").addClass("cursor-pointer");
    window.$(".tooltipped").tooltip();
    clearComponentState();
  }, []);

  const [actif, setActif] = useState();

  const licenseControl = async () => {
    try {
      let resultat = await licenseInfo();
      // console.log("resultat", resultat);

      setActif(resultat.actif);
    } catch (error) {
      // console.error("Une erreur s'est produite :", error);
    }
  };
  const nextInFlightRef = useRef(false);
  const lastnameRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const genderRef = useRef(null);
  const languageRef = useRef(null);
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

  //Handling the form
  let languages;
  let collects;
  let subjects;
  let underSubjects;
  let products;
  let units;
  try {
    languages = loadItemFromLocalStorage("app-langues");
    collects = loadItemFromLocalStorage("app-supports");
    subjects = loadItemFromLocalStorage("app-categories");
    underSubjects = loadItemFromLocalStorage("app-objets");
    products = loadItemFromLocalStorage("app-produits");
    units = loadItemFromLocalStorage("app-ps");
  } catch (e) {
    languages = [];
    collects = [];
    subjects = [];
    underSubjects = [];
    products = [];
    units = [];
  }

  let formButtons;
  let code;
  let genderOptions;
  let languageOptions;
  let collectOptions;
  let subjectOptions;
  // let underSubjectOptions;
  let productOptions;

  // whatsapp

  useEffect(() => {
    if (props.whatsappCurrentInbox && props.whatsappSelectMessage?.length > 0) {
      clearComponentState();
      props.contentChanged(transformConversation(props.whatsappSelectMessage));
      props.phoneChanged(props.whatsappCurrentInbox.phone);

      // Récupérer les fichiers médias WhatsApp et les injecter dans le formData.
      // Les audios rejoignent directement "Enregistrement vocal" (lecteur intégré, lisible),
      // au lieu d'atterrir dans "Documents joints" comme un fichier générique téléchargeable.
      fetchPendingWAFiles().then(fileObjects => {
        if (fileObjects.length > 0) {
          const audios = fileObjects.filter(isAudioFile);
          const others = fileObjects.filter(f => !isAudioFile(f));
          if (others.length > 0) setFiles(others);
          if (audios.length > 0) setAudioRecordings(prev => [...prev, ...audios]);
        }
      });
    }
  }, [""]);

  const transformConversation = (conversations = []) => {
    var result = "";
    const convert = conversations.sort((a, b) => {
      return parseInt(a.date) - parseInt(b.date);
    });

    convert.forEach((msg) => {
      if (msg.type === "chat") {
        result +=
          ` [${moment(parseInt(msg.date)).format("DD/MM/Y H:mm:ss")}]` +
          (msg.message_id.startsWith("false")
            ? " Plaignant: "
            : " GPR WHATSAPP: ") +
          " " +
          msg.content +
          " \n";
      }
    });
    return result;
  };

  // Note : la liste "Pieces joints(Whatsapp)" a été retirée — elle dupliquait les mêmes
  // pièces jointes déjà présentes dans "Documents joints"/"Enregistrement vocal" (voir
  // le useEffect fetchPendingWAFiles plus haut, qui les injecte directement là-bas).

  // //variable to show box of sms
  const [showSmsBox, setShowSmsBox] = useState(false);
  const [crossAgencyClaims, setCrossAgencyClaims] = useState([]);
  const [showAudioBox, setAudioBox] = useState(false);
  const [showAudioPlayer, setAudioPlayer] = useState("");
  const [currentAudio, setCurrentAudio] = useState("");
  const [underSubjectOptions, setUnderSubjectOptions] = useState([]);
  const [clearAudio, setClearAudio] = useState(0);
  const [audioRecordings, setAudioRecordings] = useState([]);
  const prevAudioRef = useRef(null);
  useEffect(() => { }, [showAudioPlayer, currentAudio]);

  // Accumulate each completed recording - audio changes each time the user stops recording
  useEffect(() => {
    if (audio != null && audio !== prevAudioRef.current) {
      prevAudioRef.current = audio;
      setAudioRecordings(prev => {
        if (!checkNewAudioConstraints(prev, audio, files)) {
          return prev;
        }
        return [...prev, audio];
      });
    }
  }, [audio]);

  const [loadingDelete, setLoadingDelete] = useState(false);

  const smsDefault =
    "Cher(e) bénéficiaire, votre réclamation a bien été prise en compte. Notre équipe dédiée s’en occupe et vous contactera prochainement. Merci de contribuer à l’amélioration de nos services.";
  const [smsToSend, setSmsToSend] = useState(smsDefault);

  genderOptions = [
    { value: "HOMME", label: "Homme" },
    { value: "FEMME", label: "Femme" },
  ];
  if (languages !== undefined) {
    languageOptions = languages.map((language) => {
      return { label: language.libelle, value: language.id };
    });
  } else {
    languageOptions = [];
  }
  if (collects !== undefined) {
    collectOptions = collects.map((collect) => {
      return { label: collect.libelle, value: collect.id };
    });
  } else {
    collectOptions = [];
  }

  if (subjects !== undefined) {
    subjectOptions = subjects.map((subject) => {
      return { label: subject.libelle, value: subject.id };
    });
  } else {
    subjectOptions = [];
  }

  if (products !== undefined) {
    productOptions = products.map((product) => {
      return { label: product.libelle, value: product.id };
    });
  } else {
    productOptions = [];
  }

  let unitOptions;
  let agencyOptions;
  let directionOptions;
  let guichetOptions;
  units = units.filter((un) => !un.deleted);
  let unitsGroupByType =
    units !== undefined ? groupBy(units, "type") : undefined;
  //
  if (
    unitsGroupByType !== undefined &&
    unitsGroupByType["AGENCE"] !== undefined
  ) {
    agencyOptions = unitsGroupByType["AGENCE"].map((agency) => {
      return { label: agency.libelle, value: agency.id };
    });
  } else {
    agencyOptions = "";
  }

  if (
    unitsGroupByType !== undefined &&
    unitsGroupByType["DIRECTION"] !== undefined
  ) {
    directionOptions = unitsGroupByType["DIRECTION"].map((direction) => {
      return { label: direction.libelle, value: direction.id };
    });
  } else {
    directionOptions = "";
  }
  if (
    unitsGroupByType !== undefined &&
    unitsGroupByType["GUICHET"] !== undefined
  ) {
    guichetOptions = unitsGroupByType["GUICHET"].map((guichet) => {
      return { label: guichet.libelle, value: guichet.id };
    });
  } else {
    guichetOptions = "";
  }

  unitOptions = [];
  if (directionOptions !== "") {
    unitOptions.push({ label: "Direction", options: directionOptions });
  }
  if (agencyOptions !== "") {
    unitOptions.push({ label: "Agence", options: agencyOptions });
  }
  if (guichetOptions !== "") {
    unitOptions.push({ label: "Guichet", options: guichetOptions });
  }

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
    deleteOnlyClaimApi(claim.id, props).then(() => {
      notify("Brouillon supprimé avec succès", "success");
      listeByStatut(props, "TEMP_SAVED").then(() => { });
      handleCancel(e);
      setTimeout(() => setLoadingId(null), 500);
    });
  };

  const handleChange = (e) => {
    props.unitChanged(e.value);
    props.unitLibelleChanged(e.label);
  };
  const handleChange1 = (e) => {
    props.productChanged(e.value);
    props.productLibelleChanged(e.label);
  };
  let tmps = [];
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
      setUnderSubjectOptions(tmps);
      // console.log("tmps",tmps)
    } else {
      underSubjectOptions = [];
    }
  };

  const handleChange3 = (e) => {
    props.collectChanged(e.value);
    props.collectLibelleChanged(e.label);
  };
  const handleChange4 = (e) => {
    props.languageChanged(e.value);
    props.languageLibelleChanged(e.label);
  };
  const handleChange5 = (e) => {
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
    props.idChanged("");
    props.lastnameChanged("");
    props.addressChanged("");
    props.phoneChanged("");
    props.genderChanged("");
    props.languageChanged("");
    props.dossierimfChanged("");
    props.emailChanged("");
    props.subjectChanged("");
    props.subjectLibelleChanged("");
    props.underSubjectChanged("");
    props.underSubjectLibelleChanged("");
    props.collectChanged("");
    props.collectLibelleChanged("");
    props.codeChanged("");
    props.recordedAtChanged("");
    props.recordedAtDPChanged("");
    props.productChanged("");
    props.productLibelleChanged("");
    props.unitChanged("");
    props.unitLibelleChanged("");
    props.languageLibelleChanged("");
    props.contentChanged("");
    props.claimRecordErrors("");
    props.selectedFilesReset([]);
    props.selectedItemChanged({});
    props.selectedItemFilesChanged([]);
    props.selectedItemAudioChanged([]);
    setClearAudio(clearAudio + 1);
    handlers.cancelRecording();
    setAudioRecordings([]);
    prevAudioRef.current = null;
    setFiles([]);
    setCrossAgencyClaims([]);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    clearComponentState();
  };

  const handleValidation = () => {
    let isValid = true;
    let firstErrorFieldRef = null;

    if (
      props.lastname === "" ||
      props.lastname === undefined ||
      props.lastname === null
    ) {
      isValid = false;
      errors["lastname"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = lastnameRef;
    }

    if (
      props.address === "" ||
      props.address === undefined ||
      props.address === null
    ) {
      isValid = false;
      errors["address"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = addressRef;
    }
    if (
      props.phone === "" ||
      props.phone === undefined ||
      props.phone === null ||
      !isValidPhone(props.phone)
    ) {
      isValid = false;
      errors["phone"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = phoneRef;
    }
    if (
      props.gender === "" ||
      props.gender === undefined ||
      props.gender === null
    ) {
      isValid = false;
      errors["gender"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = genderRef;
    }
    if (
      props.language === "" ||
      props.language === undefined ||
      props.language === null
    ) {
      isValid = false;
      errors["language"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = languageRef;
    }
    // if ((props.code === "" || props.code === undefined || props.code === null)) {
    //     isValid = false;
    //     errors["code"] = "Champ incorrect";
    // }
    if (
      props.recorded_at === "" ||
      props.recorded_at === undefined ||
      props.recorded_at === null ||
      !isValidDate(props.recorded_at)
    ) {
      isValid = false;
      errors["recorded_at"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = recordedAtRef;
    }
    if (
      props.collect === "" ||
      props.collect === undefined ||
      props.collect === null
    ) {
      isValid = false;
      errors["collect"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = collectRef;
    }
    if (
      props.subject === "" ||
      props.subject === undefined ||
      props.subject === null
    ) {
      isValid = false;
      errors["subject"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = subjectRef;
    }
    if (
      props.underSubject === "" ||
      props.underSubject === undefined ||
      props.underSubject === null
    ) {
      isValid = false;
      errors["underSubject"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = underSubjectRef;
    }
    if (
      (props.content === "" ||
        props.content === undefined ||
        props.content === null) &&
      audio === null &&
      (props.selectedItemAudio === null ||
        (props.selectedItemAudio !== null &&
          props.selectedItemAudio.length === 0))
    ) {
      isValid = false;
      errors["content"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = contentRef;
    }
    if (
      props.product === "" ||
      props.product === undefined ||
      props.product === null
    ) {
      isValid = false;
      errors["product"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = productRef;
    }
    if (props.unit === "" || props.unit === undefined || props.unit === null) {
      isValid = false;
      errors["unit"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = unitRef;
    }

    if (!isValid) {
      scrollToFirstError(firstErrorFieldRef);
    }
    return isValid;
  };

  const [phoneError, setPhoneError] = useState("");

  const handlePhoneChange = (value) => {
    props.phoneChanged(value);
    setPhoneError("");
  };

  // Vérification de doublon, déclenchée au blur du champ téléphone (voir
  // onBlur plus bas) et réutilisée par handleNext comme filet de sécurité
  // avant de changer d'étape.
  const handleBlur = async () => {
    if (props.phone) {
      const phone = cleanPhoneNumber(props.phone);
      await Promise.all([
        checkPhoneApi(phone, props),
        checkPhoneCrossAgencyApi(phone, { setCrossAgencyClaims }),
      ]);
    }
  };


  const handleSubmit = async (e, onSuccess = null) => {
    e.preventDefault();
    setShowSmsBox(false);
    setOpen(false);
    if (handleValidation()) {
      const formData = new FormData();

      let claim = {};
      claim["clientFirstAndLastName"] = props.lastname;
      claim["gender"] = props.gender;
      claim["address"] = props.address;
      claim["fromWhatsapp"] =
        (props.whatsappCurrentInbox &&
          props.whatsappSelectMessage?.length > 0) ??
        false;
      claim["filesWhatsapp"] = props.whatsappSelectMessage?.filter(
        ({ type }) => type !== "chat"
      );
      // Envoyer null si inbox sans id (WhatGPR) → évite TransientObjectException Hibernate
      claim["inboxWhatsapp"] = props.whatsappCurrentInbox?.id ? props.whatsappCurrentInbox : null;
      claim["phone"] = cleanPhoneNumber(props.phone);
      claim["collectionChannelId"] = props.collect;
      claim["servicePointId"] = props.unit;
      claim["productId"] = props.product;
      claim["objetId"] = props.underSubject;
      claim["languageId"] = props.language;
      claim["folderCode"] = props.dossierimf;
      claim["email"] = props.email;
      claim["receiptDateTime"] = props.recorded_at;
      claim["collectorId"] = user.id;
      if (
        (props.content === "" ||
          props.content === undefined ||
          props.content === null) &&
        (audio != null || props.selectedItemAudio != null)
      ) {
        claim["content"] = "#ReclamationAudio";
      } else {
        claim["content"] = props.content;
      }

      claim["code"] = props.code;
      claim["id"] = props.id;

      formData.append("claim", JSON.stringify(claim));

      for (let index = 0; index < files.length; index++) {
        formData.append("files", files[index]);
      }

      audioRecordings.forEach(audioBlob => {
        const audioFile = new File([audioBlob], "claim_record_" + uuid() + ".ogg", {
          type: "audio/ogg; codecs=opus",
        });
        formData.append("audios", audioFile);
      });

      props.etat2Changed(true);
      if (mode === 1) {
        addClaimApi(formData, props).then((savedClaim) => {
          handleCancel(e);
          props.resetWhatsapp();
          setCurrentStep(0);
          setActiveTab("new");
          if (onSuccess && savedClaim) onSuccess(savedClaim);
        });
      } else {
        // Hors-ligne : File/Blob ne survivent pas à un JSON.stringify en localStorage —
        // on les convertit donc en base64, décodé côté backend à la synchronisation.
        claim["files"] = await filesToBase64Dtos(files);
        claim["audios"] = await filesToBase64Dtos(
          audioRecordings.map(blob => new File([blob], "claim_record_" + uuid() + ".ogg", {
            type: "audio/ogg; codecs=opus",
          }))
        );
        addClaimApiOffline(claim, props).then(() => {
          handleCancel(e);
          props.resetWhatsapp();
          setCurrentStep(0);
          setActiveTab("new");
        });
      }
    } else {
    }
    props.claimRecordErrors(errors);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    let claim = {};
    claim["clientFirstAndLastName"] = props.lastname;
    claim["gender"] = props.gender;
    claim["address"] = props.address;
    claim["phone"] = cleanPhoneNumber(props.phone);
    claim["collectionChannelId"] = props.collect;
    claim["fromWhatsapp"] =
      (props.whatsappCurrentInbox && props.whatsappSelectMessage?.length > 0) ??
      false;
    claim["filesWhatsapp"] = props.whatsappSelectMessage?.filter(
      ({ type }) => type !== "chat"
    );
    // Envoyer null si inbox sans id (WhatGPR) → évite TransientObjectException Hibernate
    claim["inboxWhatsapp"] = props.whatsappCurrentInbox?.id ? props.whatsappCurrentInbox : null;
    claim["servicePointId"] = props.unit;
    claim["productId"] = props.product;
    claim["objetId"] = props.underSubject;
    claim["languageId"] = props.language;
    claim["folderCode"] = props.dossierimf;
    claim["email"] = props.email;
    claim["receiptDateTime"] = props.recorded_at;
    claim["collectorId"] = user.id;
    claim["content"] = props.content;
    claim["code"] = props.code;
    claim["id"] = props.id;

    formData.append("claim", JSON.stringify(claim));
    for (let index = 0; index < files.length; index++) {
      formData.append("files", files[index]);
    }

    // console.log(formData);
    //HERE
    // console.log(audio);
    audioRecordings.forEach(audioBlob => {
      const audioFile = new File([audioBlob], "claim_record_" + uuid() + ".ogg", {
        type: "audio/ogg; codecs=opus",
      });
      formData.append("audios", audioFile);
    });
    props.etatChanged(true);
    if (mode === 1) {
      addTempClaimApi(formData, props).then(() => {
        handleCancel(e);
        setCurrentStep(0);
        setActiveTab("new");
      });
    } else {
      // Hors-ligne : File/Blob ne survivent pas à un JSON.stringify en localStorage —
      // on les convertit donc en base64, décodé côté backend à la synchronisation.
      claim["files"] = await filesToBase64Dtos(files);
      claim["audios"] = await filesToBase64Dtos(
        audioRecordings.map(blob => new File([blob], "claim_record_" + uuid() + ".ogg", {
          type: "audio/ogg; codecs=opus",
        }))
      );
      addTempClaimApiOffline(claim, props).then(() => {
        handleCancel(e);
        setCurrentStep(0);
        setActiveTab("new");
      });
    }

    props.claimRecordErrors(errors);
  };

  if (!settingComplete.length) {
    if (isEmpty(props.selectedItem)) {
      formButtons = (
        // (actif !== undefined && actif)  ?
        <>
          {props.whatsappSelectMessage.length === 0 ? (
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
            </LoadingButton>
          ) : (
            <LoadingButton
              className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
              onClick={() => {
                props.resetWhatsapp();
                clearComponentState();
              }}
              loading={props.etat}
              loadingPosition="end"
              endIcon={<CancelOutlined />}
              variant="contained"
              sx={{ textTransform: "initial" }}
            >
              <span>Annuler</span>
            </LoadingButton>
          )}
          <LoadingButton
            onClick={(e) => {
              e.preventDefault();
              if (handleValidation()) {
                if (mode === 1) {
                  setShowSmsBox(true);
                  setOpen(true);
                } else {
                  handleSubmit(e);
                }
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
      );
      // :
      // <div className="card-alert card red lighten-5">
      //   <div className="card-content red-text">
      //       <ul>
      //           Veuillez activer une licence.
      //       </ul>
      //   </div>
      // </div>
    } else {
      formButtons = (
        // (actif !== undefined && actif)  ?
        <>
          <button
            type="button"
            onClick={(e) => handleCancel(e)}
            className="waves-effect waves-effect-b waves-light red-text white lighten-4 btn-small mr-1"
          >
            Annuler
          </button>
          {props.whatsappSelectMessage.length === 0 ? (
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
            </LoadingButton>
          ) : (
            ""
          )}

          <LoadingButton
            onClick={(e) => {
              e.preventDefault();
              if (handleValidation()) {
                // console.log("mode",mode)
                if (mode === 1) {
                  setShowSmsBox(true);
                  setOpen(true);
                } else {
                  handleSubmit();
                }
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
      );
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
    let output = settingComplete.map((message) => {
      return <li>{message}</li>;
    });
    formButtons = (
      <div className="card-alert card red lighten-5">
        <div className="card-content red-text">
          <ul>{output}</ul>
        </div>
      </div>
    );
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
      key: "clientFirstAndLastName",
      text: "Client",
      className: "client",
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
          minute: "numeric",
        }).format(new Date(claim.createdAt));
        return createdAt;
      },
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
    filename: "Liste des réclamations incomplètes",
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
        last: <LastPageIcon />,
      },
    },
  };

  const rowClickedHandler = (event, data, rowIndex) => {
    clearComponentState();
    props.resetWhatsapp();

    if (mode === 1) {
      props.idChanged(data.id ? data.id : "");
      props.lastnameChanged(
        data.clientFirstAndLastName ? data.clientFirstAndLastName : ""
      );
      props.addressChanged(data.address ? data.address : "");
      props.phoneChanged(data.tel ? cleanPhoneNumber2(data.tel) : "");
      props.genderChanged(data.gender ? data.gender : "");
      props.languageChanged(data.language ? data.language.id : "");
      props.languageLibelleChanged(data.language ? data.language.libelle : "");
      props.dossierimfChanged(data.folderCode ? data.folderCode : "");
      props.emailChanged(data.email ? data.email : "");
      props.codeChanged(data.code ? data.code : "");
      props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
      props.collectChanged(
        data.collectionChannel ? data.collectionChannel.id : ""
      );
      props.collectLibelleChanged(
        data.collectionChannel ? data.collectionChannel.libelle : ""
      );
      props.subjectChanged(
        data?.objet?.categorie ? data.objet.categorie.id : ""
      );
      props.subjectLibelleChanged(
        data?.objet?.categorie ? data.objet.categorie.libelle : ""
      );
      props.underSubjectChanged(data?.objet ? data.objet.id : "");
      props.underSubjectLibelleChanged(data?.objet ? data.objet.libelle : "");
      props.productChanged(data.product ? data.product.id : "");
      props.productLibelleChanged(data.product ? data.product.libelle : "");
      props.unitChanged(data.servicePoint ? data.servicePoint.id : "");
      props.unitLibelleChanged(
        data.servicePoint ? data.servicePoint.libelle : ""
      );
      props.contentChanged(data.content ? data.content : "");
      props.selectedItemChanged(data ? data : "");
      //fetch attachments for selected claim
      getFillesApi(data.id, props);
      getClaimAudioApi(data.id, props);
    } else {
      if (data.id) {
        props.idChanged(data.id ? data.id : "");
        props.lastnameChanged(
          data.clientFirstAndLastName ? data.clientFirstAndLastName : ""
        );
        props.addressChanged(data.address ? data.address : "");
        props.phoneChanged(data.tel ? cleanPhoneNumber2(data.tel) : "");
        props.genderChanged(data.gender ? data.gender : "");
        props.languageChanged(data.language ? data.language.id : "");
        props.languageLibelleChanged(
          data.language ? data.language.libelle : ""
        );
        props.dossierimfChanged(data.folderCode ? data.folderCode : "");
        props.emailChanged(data.email ? data.email : "");
        props.codeChanged(data.code ? data.code : "");
        props.recordedAtChanged(
          data.receiptDateTime ? data.receiptDateTime : ""
        );
        props.collectChanged(
          data.collectionChannel ? data.collectionChannel.id : ""
        );
        props.collectLibelleChanged(
          data.collectionChannel ? data.collectionChannel.libelle : ""
        );
        props.subjectChanged(data.objet ? data.objet.id : "");
        props.subjectLibelleChanged(data?.objet ? data.objet.libelle : "");
        props.underSubjectChanged(
          data?.objet?.categorie ? data.objet.categorie.id : ""
        );
        props.underSubjectLibelleChanged(
          data?.objet?.categorie ? data.objet.categorie.libelle : ""
        );
        props.productChanged(data.product ? data.product.id : "");
        props.productLibelleChanged(data.product ? data.product.libelle : "");
        props.unitChanged(data.servicePoint ? data.servicePoint.id : "");
        props.unitLibelleChanged(
          data.servicePoint ? data.servicePoint.libelle : ""
        );
        props.contentChanged(data.content ? data.content : "");
        props.selectedItemChanged(data ? data : "");
        //fetch attachments for selected claim
        getFillesApi(data.id, props);
        getClaimAudioApi(data.id, props);
      } else {
        // props.idChanged(data.id ? data.id : "")
        props.lastnameChanged(
          data.clientFirstAndLastName ? data.clientFirstAndLastName : ""
        );
        props.addressChanged(data.address ? data.address : "");
        props.phoneChanged(data.tel ? cleanPhoneNumber2(data.tel) : "");
        props.genderChanged(data.gender ? data.gender : "");
        props.dossierimfChanged(data.folderCode ? data.folderCode : "");
        props.emailChanged(data.email ? data.email : "");
        props.codeChanged(data.code ? data.code : "");
        props.recordedAtChanged(
          data.receiptDateTime ? data.receiptDateTime : ""
        );
        props.contentChanged(data.content ? data.content : "");

        let description = data.languageId
          ? loadItemFromSessionStorage("app-langues").filter(
            (e) => {
              return e.id === data.languageId;
            }
          )
          : "";
        let description1 = data.collectionChannelId
          ? loadItemFromSessionStorage("app-supports").filter(
            (e) => {
              return e.id === data.collectionChannelId;
            }
          )
          : "";
        // console.log("description2",loadItemFromSessionStorage("app-objets"))
        let description2 = data.objetId
          ? loadItemFromSessionStorage("app-objets").filter((e) => {
            // console.log("description2",e.categorie.id === data.objetId)
            return e.id === data.objetId;
          })
          : "";

        let description5 = data.objetId
          ? loadItemFromSessionStorage("app-objets").filter((e) => {
            return e.id === data.objetId;
          })
          : "";
        let description3 = data.productId
          ? loadItemFromSessionStorage("app-produits").filter(
            (e) => {
              return e.id === data.productId;
            }
          )
          : "";
        let description4 = data.servicePointId
          ? loadItemFromSessionStorage("app-ps").filter((e) => {
            return e.id === data.servicePointId;
          })
          : "";

        props.languageChanged(data.languageId ? description[0].id : "");
        props.languageLibelleChanged(
          data.languageId ? description[0].libelle : ""
        );
        props.collectChanged(
          data.collectionChannelId ? description1[0].id : ""
        );
        props.collectLibelleChanged(
          data.collectionChannelId ? description1[0].libelle : ""
        );
        props.subjectChanged(data.objetId ? description2[0].categorie.id : "");
        props.subjectLibelleChanged(
          data.objetId ? description2[0].categorie.libelle : ""
        );
        props.underSubjectChanged(data.objetId ? description5[0].id : "");
        props.underSubjectLibelleChanged(
          data.objetId ? description5[0].libelle : ""
        );
        props.productChanged(data.productId ? description3[0].id : "");
        props.productLibelleChanged(
          data.productId ? description3[0].libelle : ""
        );
        props.unitChanged(data.servicePointId ? description4[0].id : "");
        props.unitLibelleChanged(
          data.servicePointId ? description4[0].libelle : ""
        );

        props.selectedItemChanged(data ? data : "");
        getFillesApi(data.id, props);
      }
    }
  };
  const fileToDataURL = (file) => {
    let reader = new FileReader();
    return new Promise(function (resolve, reject) {
      reader.onload = function (event) {
        resolve(event.target.result);
      };

      reader.readAsDataURL(file);
      reader.onload = (e) => {
        props.selectedFilesChanged(e.target.result);
      };
      KTApp.unblockPage();
    });
  };

  const handleFile = (e) => {
    const newArr = Array.from(e.target.files);
    if (!checkFilesConstraints(newArr, audioRecordings)) {
      e.target.value = "";
      return Promise.resolve([]);
    }
    setFiles(e.target.files);
    return Promise.all(newArr.map(fileToDataURL));
  };

  // Accumulates files instead of replacing (used by the dropzone)
  const handleDropzoneFiles = (newFilesInput) => {
    const newArr = Array.from(newFilesInput);
    const prevArr = files ? Array.from(files) : [];
    const combined = [...prevArr, ...newArr];
    if (!checkFilesConstraints(combined, audioRecordings)) {
      return Promise.resolve([]);
    }
    setFiles(combined);
    return Promise.all(newArr.map(fileToDataURL));
  };

  const removeFile = (indexToRemove) => {
    setFiles(prev => Array.from(prev).filter((_, i) => i !== indexToRemove));
  };

  let jfichiers;
  if (mode === 1) {
    jfichiers = (
      <>
        <div className="col l12 m12 s12 file-field input-field">
          <div className="btn btn-small file-small brand-blue">
            <span>Joindre des fichiers</span>
            <input
              type="file"
              multiple
              onChange={(e) => handleFile(e)}
              accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, audio/*, video/*"
            />
          </div>

          <div className="file-path-wrapper">
            <input
              className="file-path validate"
              type="text"
              value={props.selectedFiles}
            />
          </div>
          <small className="errorTxt4">
            <div id="cpassword-error" className="error">
              {props.errors.selectedFiles}
            </div>
          </small>
        </div>
      </>
    );
  } else {
    jfichiers = "";
  }

  let attachmentList;
  // console.log("props.selectedItemFiles", props.selectedItemFiles);
  if (/**/ props.selectedItemFiles.length > 0) {
    let attachmentListChild = props.selectedItemFiles.map((attachment) => {
      let icon = guessExtension(attachment);
      return (
        <div className="col xl12 l12 m12 s12" key={attachment.id}>
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
                      {attachment.name}
                    </div>
                    <div className="app-file-size">
                      {Math.round(
                        (attachment.size / 1024 + Number.EPSILON) * 100
                      ) / 100}{" "}
                      Ko
                    </div>
                    <div className="app-file-last-access">
                      <a onClick={(e) => { downloadFillesApi(attachment.id, attachment.name); }} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#005081", cursor: "pointer", fontWeight: 600, textDecoration: "none" }}><FileDownloadIcon style={{ fontSize: 14 }} /> Télécharger</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
    attachmentList = (
      <div className="col s12 app-file-content grey lighten-4">
        <span className="app-file-label">Fichiers joints</span>
        <div className="row app-file-recent-access mb-3">
          {attachmentListChild}
        </div>
      </div>
    );
  } else {
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
                    <div
                      className="app-file-last-access"
                      id={"audio-" + attachment.id}
                    >
                      <a
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          downloadAudioApi(attachment.id, attachment.name).then(
                            (data) => {
                              // console.log(data);

                              let blobAudio = new Blob([data], {
                                type: "audio/ogg; codecs=opus",
                              });
                              let aud = new Audio(
                                window.URL.createObjectURL(blobAudio)
                              );
                              setCurrentAudio(
                                window.URL.createObjectURL(blobAudio)
                              );
                              setAudioPlayer("audio-" + attachment.id);
                            }
                          );
                        }}
                      >
                        {showAudioPlayer === "audio-" + attachment.id && ""}{" "}
                        {showAudioPlayer !== "audio-" + attachment.id &&
                          "Afficher"}
                      </a>

                      {showAudioPlayer === "audio-" + attachment.id && (
                        <audio
                          controls
                          autoPlay
                          onEnded={(e) => {
                            setAudioPlayer("");
                          }}
                        >
                          <source src={currentAudio} type="audio/ogg" />
                          Votre navigateur ne prend pas en charge l'élément
                          audio.
                        </audio>
                      )}
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
  // let appSpecificationData = loadItemFromSessionStorage("app-specification") !== undefined ? JSON.parse(loadItemFromSessionStorage("app-specification").value).filter(n=>n!==null) : undefined

  let content = [];
  content = props.items;
  //darrell : add custome attribut for search
  content.forEach((element) => {
    //date createdAt
    let createdAt = new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(element.createdAt));
    element.createdAtFormated = createdAt;
  });

  const sendSms = (e) => {
    e.preventDefault();
    if (props.phone !== "" && props.phone) {
      KTApp.blockPage({ overlayColor: "#000000", type: "v2", state: "danger", message: "Enregistrement en cours..." });
      // Sauvegarder d'abord, puis envoyer SMS/mail avec le vrai claimId
      handleSubmit(e, async (savedClaim) => {
        const claimId = savedClaim?.id ?? null;
        const claimCode = savedClaim?.code ?? null;
        try {
          await send({
            phone: cleanPhoneNumber3(props.phone),
            message: smsToSend,
            claimId,
            claimCode,
            claimType: "CLAIM",
            senderName: user?.firstAndLastName || null,
            senderEmail: user?.email || null,
            clientName: props.lastname || null,
          });
          if (props.email && props.email !== "") {
            await sendEmail({
              email: props.email,
              subject: "Accusé de réception - Votre réclamation a bien été enregistrée",
              message: smsToSend,
              claimId,
              claimCode,
              claimType: "CLAIM",
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
      notify("numéros de téléphone incorrecte", "error");
    }
  };
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
            <MicIcon />
          </Fab>
        </div>
      </>
    );
  } else {
    formAudio = "";
  }

  // ── Wizard config ──────────────────────────────────────────────────────────
  // Steps: Client first, then Informations
  const STEPS = [
    { key: "client", label: "Client", sublabel: "Coordonnées du réclamant", icon: <PersonIcon /> },
    { key: "infos", label: "Informations", sublabel: "Objet, canal, contenu", icon: <AssignmentOutlinedIcon /> },
    { key: "fichiers", label: "Pièces jointes", sublabel: "Documents et audio", icon: <AttachFileIcon /> },
    { key: "recap", label: "Récapitulatif", sublabel: "Vérification avant envoi", icon: <TaskAltIcon /> },
  ];

  const apercu = {
    "Client": props.lastname,
    "Tél": props.phone ? cleanPhoneNumber(props.phone) : "",
    "Motif": props.underSubjectLibelle,
    "Canal": props.collectLibelle,
    "Produit": props.productLibelle,
  };

  // Completion: count filled required fields out of 12
  const filledCount = [
    props.lastname, props.address, (props.phone && isValidPhone(props.phone)) ? props.phone : "",
    props.gender, props.language,
    isValidDate(props.recorded_at) ? props.recorded_at : "", props.collect,
    props.subject, props.underSubject, props.product, props.unit,
    props.content || (audio !== null),
  ].filter(Boolean).length;
  const completionPercent = Math.round((filledCount / 12) * 100);

  // Step 0 = Client validation
  const validateStep0 = () => {
    let isValid = true;
    let firstErrorFieldRef = null;
    errors = {};
    if (!props.lastname) {
      isValid = false; errors["lastname"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = lastnameRef;
    }
    if (!props.address) {
      isValid = false; errors["address"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = addressRef;
    }
    if (!props.phone || !isValidPhone(props.phone)) {
      isValid = false; errors["phone"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = phoneRef;
    }
    if (!props.gender) {
      isValid = false; errors["gender"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = genderRef;
    }
    if (!props.language) {
      isValid = false; errors["language"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = languageRef;
    }
    props.claimRecordErrors(errors);
    if (!isValid) scrollToFirstError(firstErrorFieldRef);
    return isValid;
  };

  // Step 1 = Informations validation
  const validateStep1 = () => {
    let isValid = true;
    let firstErrorFieldRef = null;
    errors = {};
    if (!props.recorded_at || !isValidDate(props.recorded_at)) {
      isValid = false; errors["recorded_at"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = recordedAtRef;
    }
    if (!props.collect) {
      isValid = false; errors["collect"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = collectRef;
    }
    if (!props.subject) {
      isValid = false; errors["subject"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = subjectRef;
    }
    if (!props.underSubject) {
      isValid = false; errors["underSubject"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = underSubjectRef;
    }
    if (!props.content && audio === null && (!props.selectedItemAudio || props.selectedItemAudio.length === 0)) {
      isValid = false; errors["content"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = contentRef;
    }
    if (!props.product) {
      isValid = false; errors["product"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = productRef;
    }
    if (!props.unit) {
      isValid = false; errors["unit"] = "Champ incorrect";
      if (!firstErrorFieldRef) firstErrorFieldRef = unitRef;
    }
    props.claimRecordErrors(errors);
    if (!isValid) scrollToFirstError(firstErrorFieldRef);
    return isValid;
  };

  const handleNext = async () => {
    // Empêche les clics rapprochés sur "Suivant" de déclencher plusieurs
    // vérifications de doublon en parallèle (et donc plusieurs incréments
    // d'étape en cascade une fois les appels résolus).
    if (nextInFlightRef.current) return;
    nextInFlightRef.current = true;
    try {
      if (currentStep === 0) {
        if (!validateStep0()) return;
        // Attend la vérification de doublon (normalement lancée au blur du champ
        // téléphone) avant de passer à l'étape suivante — sinon, sur une requête
        // lente, la modale de doublon apparaît en retard alors que l'agent est
        // déjà en train de remplir l'étape 2.
        await handleBlur();
      }
      if (currentStep === 1 && !validateStep1()) return;
      setCurrentStep(s => s + 1);
    } finally {
      nextInFlightRef.current = false;
    }
  };

  const handleFinalSubmit = () => {
    if (mode === 1) {
      setShowSmsBox(true);
      setOpen(true);
    } else {
      handleSubmit({ preventDefault: () => { } });
    }
  };

  const handleSaveDraft = () => {
    handleSave({ preventDefault: () => { } });
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "SAVED":
        return (
          <span className="toTreatBgColor chip lighten-5">
            <span>A traiter</span>
          </span>
        );

      case "AFFECTED":
        return (
          <span className="affectedBgColor chip lighten-5">
            <span>Affectée</span>
          </span>
        );

      case "TO_APPROUVED":
        return (
          <span className="toApprouvedBgColor chip lighten-5">
            <span>A approuvée</span>
          </span>
        );

      case "DESAPPROUVED":
        return (
          <span className="unApprouvedBgColor chip lighten-5">
            <span>Désapprouvée</span>
          </span>
        );

      case "TREAT":
        return (
          <span className="chip treatBgColor">
            <span className="">Traitée</span>
          </span>
        );
        break;

      case "UNSATISFIED":
        return (
          <span className="chip unSatisfiedBgColor lighten-5">
            <span>Non Satisfait</span>
          </span>
        );

      case "PARTIAL_SATISFIED":
        return (
          <span className="chip partialBgColor lighten-5">
            <span>Partiellement Satisfait</span>
          </span>
        );

      case "CLASSED":
        return (
          <span className="chip classedBgColor lighten-5">
            <span>Classée</span>
          </span>
        );

      case "LITIGATION":
        return (
          <span className="chip litigationBgColor">
            <span className="">Contentieux</span>
          </span>
        );

      default:
        return (
          <span className="chip indigo lighten-5">
            <span className="indigo-text">N/A</span>
          </span>
        );
    }
  };

  return (
    <>
      {showSmsBox && (
        <div>
          <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{
            style: { borderRadius: 20, overflow: "hidden", margin: "16px" }
          }}>

            <DialogContent style={{ padding: 0 }}>

              {/* Header gradient */}
              <div style={{
                background: "var(--gpr-primary, #005081)",
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
                  background: "var(--gpr-primary, #005081)",
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

        </div>
      )}
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
              Enregistreur vocal Réclamations
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

      {props.modalVisible && props.existingClaims.length > 0 && (
        <Dialog
          open={props.modalVisible}
          fullWidth
          maxWidth="sm"
          disableEscapeKeyDown
          onClose={(event, reason) => { if (reason === "backdropClick") return; }}
          PaperProps={{ style: { borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}
        >
          {/* Header */}
          <div style={{ background: 'var(--gpr-primary, #005081)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <WarningIcon style={{ color: '#fff', fontSize: 22 }} />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Doublon détecté</div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12.5, marginTop: 2 }}>
                  {props.existingClaims.length === 1
                    ? 'Ce numéro est déjà associé à 1 réclamation en cours'
                    : `Ce numéro est déjà associé à ${props.existingClaims.length} réclamations en cours`}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <DialogContent sx={{ p: 2.5, maxHeight: 420, overflowY: 'auto' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
              Vérifiez les réclamations existantes ci-dessous avant de continuer.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {props.existingClaims.map((claim, index) => {
                const STATUS_CFG = {
                  SAVED: { bg: '#dbeafe', color: '#1d4ed8', label: 'À traiter' },
                  AFFECTED: { bg: '#fef9c3', color: '#854d0e', label: 'Affectée' },
                  TO_APPROUVED: { bg: '#fef3c7', color: '#92400e', label: 'À approuver' },
                  DESAPPROUVED: { bg: '#fee2e2', color: '#991b1b', label: 'Désapprouvée' },
                  TREAT: { bg: '#dcfce7', color: '#166534', label: 'Traitée' },
                  SATISFIED: { bg: '#dcfce7', color: '#166534', label: 'Satisfait' },
                  UNSATISFIED: { bg: '#fee2e2', color: '#991b1b', label: 'Non satisfait' },
                  CLASSED: { bg: '#f3e8ff', color: '#6b21a8', label: 'Classée' },
                };
                const sc = STATUS_CFG[claim.status] || { bg: '#f1f5f9', color: '#475569', label: claim.status };
                return (
                  <div key={index} style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    {/* Card header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{claim.codeClient}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </div>
                    {/* Card body - grid 2 col */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 14px' }}>
                      {[
                        { label: 'Client', value: claim.clientFirstAndLastName },
                        { label: 'Téléphone', value: claim.tel },
                        { label: 'Objet', value: claim.objet?.libelle },
                        { label: 'Produit', value: claim.product?.libelle },
                        { label: 'Point de service', value: claim.servicePoint?.libelle },
                        { label: 'Date réception', value: claim.receiptDateTime },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>{value || '-'}</div>
                        </div>
                      ))}
                    </div>
                    {/* Contenu */}
                    {claim.content && (
                      <div style={{ margin: '0 14px 12px', background: '#f8fafc', borderRadius: 8, padding: '8px 10px', borderLeft: '3px solid #f59e0b' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Contenu</div>
                        <div style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.5 }}>{claim.content}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </DialogContent>

          {/* Actions */}
          <DialogActions style={{ padding: '12px 20px 20px', gap: 10, borderTop: '1px solid #f1f5f9' }}>
            <Button
              onClick={() => { props.setModalVisible(false); clearComponentState(); setCurrentStep(0); }}
              variant="outlined"
              sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#e2e8f0', color: '#64748b', fontWeight: 600, px: 3 }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => { props.setModalVisible(false); }}
              variant="contained"
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 3, background: 'var(--gpr-primary, #005081)', color: '#fff', '&:hover': { background: 'var(--gpr-primary-dark, #003d63)' } }}
            >
              Enregistrer quand même
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <WizardLayout
        title="Enregistrer une réclamation"
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
        isLastStep={currentStep === 3}
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
                        {draft.clientFirstAndLastName || <em>Anonyme</em>}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        {draft.createdAtFormated || "-"}
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
                          >
                            <DeleteIcon style={{ fontSize: 18 }} />
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
        {/* ── Step 1 – Informations ───────────────────────────── */}
        {currentStep === 1 && (
          <div className="row">
            <div className="col l12 m12 s12 input-field" ref={recordedAtRef}>
              <DatePicker
                withPortal
                closeOnScroll={true}
                isClearable
                showTimeInput
                showMonthDropdown
                value={props.recorded_at}
                timeInputLabel="Heure :"
                todayButton="Aujourd'hui"
                selected={props.recorded_at_dp}
                onChange={(date) => handleDatePicker(date, props)}
                dateFormat="dd-MM-yyyy HH:mm"
                locale="fr"
              />
              <label htmlFor="recorded_at" className="active">
                Date de réception <span>(<span className="red-text darken-2">*</span>)</span>
              </label>
              <small className="errorTxt4"><div className="error">{props.errors?.recorded_at}</div></small>
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

            <div className="col l6 m12 s12 input-field" ref={subjectRef}>
              <Select
                value={props.subject ? { label: props.subjectLibelle, value: props.subject } : "Sélectionner la catégorie de l'objet"}
                options={subjectOptions}
                className="react-select-container mt-4"
                classNamePrefix="react-select"
                style={styles}
                placeholder="Sélectionner la catégorie de l'objet"
                onChange={handleChange2}
              />
              <label className="active">
                Catégorie d'objet <span>(<span className="red-text darken-2">*</span>)</span>
              </label>
              <small className="errorTxt4"><div className="error">{props.errors?.subject}</div></small>
            </div>

            <div className="col l12 m12 s12 input-field" ref={underSubjectRef}>
              <Select
                value={props.underSubject ? { label: props.underSubjectLibelle, value: props.underSubject } : "Sélectionner le motif de réclamation"}
                options={underSubjectOptions}
                className="react-select-container mt-4"
                classNamePrefix="react-select"
                style={styles}
                placeholder="Sélectionner le motif de réclamation"
                onChange={handleChange5}
              />
              <label className="active">
                Motif de réclamation <span>(<span className="red-text darken-2">*</span>)</span>
              </label>
              <small className="errorTxt4"><div className="error">{props.errors?.underSubject}</div></small>
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
                Point de service (<span className="red-text darken-2">*</span>)
              </label>
              <small className="errorTxt4"><div className="error">{props.errors?.unit}</div></small>
            </div>

            <div className="col l12 m12 s12 input-field" ref={contentRef} style={{ position: "relative" }}>
              {formAudio}
              <textarea
                id="content"
                name="content"
                placeholder=""
                rows="3"
                className="materialize-textarea"
                value={props.content}
                onChange={(e) => props.contentChanged(e.target.value)}
              />
              <label htmlFor="content" className="active">
                Contenu <span>(<span className="red-text darken-2">*</span>)</span>
              </label>
              <small className="errorTxt4"><div className="error">{props.errors?.content}</div></small>
            </div>

            {/* Audio feedback - visible immédiatement après l'enregistrement */}
            {(audioRecordings.length > 0 || props.selectedItemAudio?.length > 0) && (
              <div className="col l12 m12 s12" style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <MicIcon style={{ fontSize: 15, color: "#005081" }} />
                  Audio enregistré ({audioRecordings.length + (props.selectedItemAudio?.length ?? 0)})
                </div>

                {audioRecordings.map((audioBlob, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#e8f4fc", borderRadius: 10, border: "1px solid #99cde8", marginBottom: 6 }}>
                    <MicIcon style={{ fontSize: 16, color: "#005081", flexShrink: 0 }} />
                    <audio controls style={{ flex: 1, height: 30 }}>
                      <source src={URL.createObjectURL(audioBlob)} type="audio/ogg" />
                    </audio>
                    <button onClick={() => setAudioRecordings(prev => prev.filter((_, j) => j !== i))}
                      title="Supprimer" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 20, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>×</button>
                  </div>
                ))}

                {props.selectedItemAudio?.map((audioItem, i) => (
                  <div key={"saved-" + i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#e8f4fc", borderRadius: 10, border: "1px solid #99cde8", marginBottom: 6 }}>
                    <MicIcon style={{ fontSize: 16, color: "#005081", flexShrink: 0 }} />
                    <audio controls style={{ flex: 1, height: 30 }}>
                      <source src={URL.createObjectURL(new Blob([audioItem], { type: "audio/ogg" }))} type="audio/ogg" />
                    </audio>
                    <button onClick={() => props.selectedItemAudioChanged(props.selectedItemAudio.filter((_, j) => j !== i))}
                      title="Supprimer" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 20, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>×</button>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ── Step 0 – Client ─────────────────────────────────── */}
        {currentStep === 0 && (
          <div className="row">
            <div className="col l12 m12 s12 input-field" ref={lastnameRef}>
              <input
                id="lastname"
                name="lastname"
                type="text"
                className="validate"
                value={props.lastname}
                onChange={(e) => props.lastnameChanged(e.target.value)}
              />
              <label htmlFor="lastname" className="active">
                Nom et Prénoms <span>(<span className="red-text darken-2">*</span>)</span>
              </label>
              <small className="errorTxt4"><div className="error">{props.errors?.lastname}</div></small>
            </div>

            <div className="col l6 m12 s12 input-field" ref={addressRef}>
              <input
                id="address"
                name="address"
                type="text"
                className="validate"
                value={props.address}
                onChange={(e) => props.addressChanged(e.target.value)}
              />
              <label htmlFor="address" className="active">
                Adresse Physique <span>(<span className="red-text darken-2">*</span>)</span>
              </label>
              <small className="errorTxt4"><div className="error">{props.errors?.address}</div></small>
            </div>

            <div className="col l6 m12 s12 input-field" ref={phoneRef}>
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry={navigator.language.split('-')[1] || undefined}
                value={props.phone}
                onChange={handlePhoneChange}
              />
              <label htmlFor="phone" className="active">
                Téléphone <span>(<span className="red-text darken-2">*</span>)</span>
              </label>
              <small className="errorTxt4"><div className="error">{props.errors?.phone}</div></small>
            </div>

            {crossAgencyClaims.length > 0 && (
              <div className="col s12" style={{ marginBottom: 12 }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderLeft: '4px solid #f97316',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>
                      ⚠ Doublon inter-agences détecté
                    </span>
                    <button
                      type="button"
                      onClick={() => setCrossAgencyClaims([])}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9a3412', fontSize: 18, lineHeight: 1 }}
                    >×</button>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#7c2d12' }}>
                    Ce numéro est associé à {crossAgencyClaims.length === 1 ? 'une réclamation' : `${crossAgencyClaims.length} réclamations`} en cours dans une autre agence. Vous pouvez continuer l'enregistrement.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {crossAgencyClaims.map((c, i) => (
                      <div key={i} style={{
                        background: '#fff',
                        borderRadius: 8,
                        padding: '8px 12px',
                        border: '1px solid #fed7aa',
                        fontSize: 12,
                        color: '#7c2d12',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}>
                        <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{c.codeClient}</span>
                        <span style={{ color: '#fdba74' }}>|</span>
                        <span>{c.servicePoint?.libelle || '-'}</span>
                        <span style={{ color: '#fdba74' }}>|</span>
                        <span>{c.objet?.libelle || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="col l12 m12 s12 input-field">
              <input
                id="email"
                name="email"
                type="email"
                className="validate"
                value={props.email}
                onChange={(e) => props.emailChanged(e.target.value)}
              />
              <label htmlFor="email" className="active">Email</label>
              <small className="errorTxt4"><div className="error">{props.errors?.email}</div></small>
            </div>

            <div className="col l6 m12 s12 input-field" ref={genderRef}>
              <Select
                value={props.gender ? { label: props.gender === "HOMME" ? "Homme" : "Femme", value: props.gender } : null}
                options={genderOptions}
                className="react-select-container mt-4"
                classNamePrefix="react-select"
                style={styles}
                placeholder="Sélectionner le genre"
                onChange={(e) => props.genderChanged(e.value)}
              />
              <label className="active">
                Genre <span>(<span className="red-text darken-2">*</span>)</span>
              </label>
              <small className="errorTxt4"><div className="error">{props.errors?.gender}</div></small>
            </div>

            <div className="col l6 m12 s12 input-field" ref={languageRef}>
              <Select
                value={props.language ? { label: props.languageLibelle, value: props.language } : "Sélectionner la langue"}
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
              <small className="errorTxt4"><div className="error">{props.errors?.language}</div></small>
            </div>

            <div className="col l6 m12 s12 input-field">
              <input
                id="dossierimf"
                name="dossierimf"
                type="text"
                className="validate"
                value={props.dossierimf}
                onChange={(e) => props.dossierimfChanged(e.target.value)}
              />
              <label htmlFor="dossierimf" className="active">Dossier Client</label>
            </div>
          </div>
        )}

        {/* ── Step 2 – Pièces jointes ─────────────────────────── */}
        {currentStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* ── Dropzone fichiers ── */}
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
                  onClick={() => document.getElementById("wz-file-input").click()}
                  style={{
                    border: `2px dashed ${isDragging ? "#005081" : "#cbd5e1"}`,
                    borderRadius: 14, padding: "32px 20px", textAlign: "center",
                    background: isDragging ? "#e8f4fc" : "#f8fafc",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <CloudUploadOutlinedIcon style={{ fontSize: 44, color: isDragging ? "#005081" : "#94a3b8", marginBottom: 10 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>
                    Glissez vos fichiers ici
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                    ou <span style={{ color: "#005081", fontWeight: 700 }}>parcourez</span> depuis votre appareil
                  </div>
                  <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 8 }}>
                    PDF · Word · Excel · Images · Audio · Vidéo
                  </div>
                  <input
                    id="wz-file-input" type="file" multiple style={{ display: "none" }}
                    onChange={(e) => handleDropzoneFiles(e.target.files)}
                    accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, audio/*, video/*"
                  />
                </div>

                {/* Files list */}
                {files && Array.from(files).length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    {Array.from(files).map((file, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px", background: "white", borderRadius: 10,
                        border: "1.5px solid #e2e8f0",
                      }}>
                        <InsertDriveFileOutlinedIcon style={{ fontSize: 18, color: "#005081", flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, marginRight: 8 }}>{(file.size / 1024).toFixed(0)} Ko</div>
                        <button
                          onClick={() => removeFile(i)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}
                          title="Retirer"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Already saved files */}
                {props.selectedItemFiles?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>Fichiers déjà enregistrés</div>
                    {props.selectedItemFiles.map((file, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 4 }}>
                        <InsertDriveFileOutlinedIcon style={{ fontSize: 16, color: "#64748b", flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#64748b" }}>{file.name}</div>
                        <a onClick={(e) => { e.preventDefault(); downloadFillesApi(file.id, file.name); }} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#005081", cursor: "pointer", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}><FileDownloadIcon style={{ fontSize: 14 }} /> Télécharger</a>
                      </div>
                    ))}
                  </div>
                )}
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
          </div>
        )}

        {/* ── Step 3 – Récapitulatif ──────────────────────────── */}
        {currentStep === 3 && (
          <div style={{ border: "1px solid #e0e0e0", borderRadius: "6px" }}>
            <div style={{ backgroundColor: "#f5f5f5", padding: "8px 14px", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: "8px" }}>
              <SupportAgentIcon style={{ fontSize: "18px", color: "#616161" }} />
              <span style={{ color: "#424242", fontWeight: "600", fontSize: "14px" }}>Résumé de la réclamation</span>
            </div>
            <div style={{ padding: "4px 14px" }}>
              <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ color: "#757575", width: "160px", fontSize: "13px", flexShrink: 0 }}>Client</span>
                <span style={{ fontWeight: "500", fontSize: "13px" }}>{props.lastname}</span>
              </div>
              <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ color: "#757575", width: "160px", fontSize: "13px", flexShrink: 0 }}>Téléphone</span>
                <span style={{ fontWeight: "500", fontSize: "13px" }}>{cleanPhoneNumber(props.phone)}</span>
              </div>
              <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ color: "#757575", width: "160px", fontSize: "13px", flexShrink: 0 }}>Genre</span>
                <span style={{ fontWeight: "500", fontSize: "13px" }}>{props.gender}</span>
              </div>
              {props.email && (
                <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <span style={{ color: "#757575", width: "160px", fontSize: "13px", flexShrink: 0 }}>Email</span>
                  <span style={{ fontWeight: "500", fontSize: "13px" }}>{props.email}</span>
                </div>
              )}
              <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ color: "#757575", width: "160px", fontSize: "13px", flexShrink: 0 }}>Produit</span>
                <span style={{ fontWeight: "500", fontSize: "13px" }}>{props.productLibelle}</span>
              </div>
              <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ color: "#757575", width: "160px", fontSize: "13px", flexShrink: 0 }}>Catégorie</span>
                <span style={{ fontWeight: "500", fontSize: "13px" }}>{props.subjectLibelle}</span>
              </div>
              <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ color: "#757575", width: "160px", fontSize: "13px", flexShrink: 0 }}>Motif</span>
                <span style={{ fontWeight: "500", fontSize: "13px" }}>{props.underSubjectLibelle}</span>
              </div>
              <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ color: "#757575", width: "160px", fontSize: "13px", flexShrink: 0 }}>Point de service</span>
                <span style={{ fontWeight: "500", fontSize: "13px" }}>{props.unitLibelle}</span>
              </div>
              <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ color: "#757575", width: "160px", fontSize: "13px", flexShrink: 0 }}>Date de réception</span>
                <span style={{ fontWeight: "500", fontSize: "13px" }}>
                  {props.recorded_at ? moment(props.recorded_at, "DD-MM-YYYY HH:mm").format("DD MMMM YYYY [à] HH:mm") : "-"}
                </span>
              </div>
              <div style={{ display: "flex", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span style={{ color: "#757575", width: "160px", fontSize: "13px", flexShrink: 0 }}>Contenu</span>
                <span style={{ fontWeight: "500", fontSize: "13px", flex: 1 }}>
                  {props.content && props.content !== "#ReclamationAudio" && <span>{props.content}</span>}
                  {!props.content && audio == null && (!props.selectedItemAudio || props.selectedItemAudio.length === 0) && (
                    <span style={{ color: "#bdbdbd" }}>-</span>
                  )}
                </span>
              </div>

              {/* All audios */}
              {(audioRecordings.length > 0 || props.selectedItemAudio?.length > 0) && (
                <div style={{ padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <span style={{ color: "#757575", fontSize: "12px", fontWeight: 600, display: "block", marginBottom: 8 }}>
                    Audios ({audioRecordings.length + (props.selectedItemAudio?.length ?? 0)})
                  </span>
                  {audioRecordings.map((audioBlob, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#e8f4fc", borderRadius: 8, marginBottom: 6, border: "1px solid #99cde8" }}>
                      <MicIcon style={{ fontSize: 16, color: "#005081", flexShrink: 0 }} />
                      <audio controls style={{ flex: 1, height: 30 }}>
                        <source src={URL.createObjectURL(audioBlob)} type="audio/ogg" />
                      </audio>
                    </div>
                  ))}
                  {props.selectedItemAudio?.map((audioItem, i) => (
                    <div key={"s" + i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, marginBottom: 6, border: "1px solid #e2e8f0" }}>
                      <MicIcon style={{ fontSize: 16, color: "#005081", flexShrink: 0 }} />
                      <audio controls style={{ flex: 1, height: 30 }}>
                        <source src={URL.createObjectURL(new Blob([audioItem], { type: "audio/ogg" }))} type="audio/ogg" />
                      </audio>
                    </div>
                  ))}
                </div>
              )}

              {/* Files */}
              {((files && Array.from(files).length > 0) || props.selectedItemFiles?.length > 0) && (
                <div style={{ padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <span style={{ color: "#757575", fontSize: "12px", fontWeight: 600, display: "block", marginBottom: 8 }}>
                    Fichiers joints ({Array.from(files || []).length + (props.selectedItemFiles?.length ?? 0)})
                  </span>
                  {props.selectedItemFiles?.map((file, i) => (
                    <div key={"saved-" + i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 4, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                      <InsertDriveFileOutlinedIcon style={{ fontSize: 15, color: "#16a34a", flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "#374151", fontWeight: 600, flex: 1 }}>{file.name}</span>
                      <a onClick={(e) => { e.preventDefault(); e.stopPropagation(); downloadFillesApi(file.id, file.name); }} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#005081", cursor: "pointer", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}><FileDownloadIcon style={{ fontSize: 14 }} /> Télécharger</a>
                    </div>
                  ))}
                  {Array.from(files || []).map((file, index) => (
                    <div key={"new-" + index} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 4, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <InsertDriveFileOutlinedIcon style={{ fontSize: 15, color: "#64748b", flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "#374151", fontWeight: 600, flex: 1 }}>{file.name}</span>
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

const mapStateToProps = (state) => {
  return {
    whatsappInboxs: state.whatsapp.inboxs,
    whatsappMessages: state.whatsapp.messages,
    whatsappCurrentInbox: state.whatsapp.currentInbox,
    whatsappSelectMessage: state.whatsapp.selectMessage,

    isLoading: state.claim_record.isLoading,
    id: state.claim_record.id,
    firstname: state.claim_record.firstname,
    lastname: state.claim_record.lastname,
    address: state.claim_record.address,
    phone: state.claim_record.phone,
    email: state.claim_record.email,
    gender: state.claim_record.gender,
    language: state.claim_record.language,
    languageLibelle: state.claim_record.languageLibelle,
    code: state.claim_record.code,
    recorded_at: state.claim_record.recorded_at,
    recorded_at_dp: state.claim_record.recorded_at_dp,
    dossierimf: state.claim_record.dossierimf,
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
    existingClaims: state.claim_record.existingClaims,
    modalVisible: state.claim_record.modalVisible,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loading: (err) => {
      dispatch(loading(err));
    },
    claimRecordErrors: (err) => {
      dispatch(claimRecordErrors(err));
    },
    idChanged: (id) => {
      dispatch(idChanged(id));
    },
    firstnameChanged: (firstname) => {
      dispatch(firstnameChanged(firstname));
    },
    lastnameChanged: (lastname) => {
      dispatch(lastnameChanged(lastname));
    },
    addressChanged: (address) => {
      dispatch(addressChanged(address));
    },
    phoneChanged: (phone) => {
      dispatch(phoneChanged(phone));
    },
    genderChanged: (gender) => {
      dispatch(genderChanged(gender));
    },
    languageChanged: (language) => {
      dispatch(languageChanged(language));
    },
    languageLibelleChanged: (languageLibelle) => {
      dispatch(languageLibelleChanged(languageLibelle));
    },
    dossierimfChanged: (dossierimf) => {
      dispatch(dossierimfChanged(dossierimf));
    },
    codeChanged: (code) => {
      dispatch(codeChanged(code));
    },
    recordedAtChanged: (recordedAt) => {
      dispatch(recordedAtChanged(recordedAt));
    },
    recordedAtDPChanged: (recordedAt) => {
      dispatch(recordedAtDPChanged(recordedAt));
    },
    collectChanged: (collect) => {
      dispatch(collectChanged(collect));
    },
    collectLibelleChanged: (collectLibelle) => {
      dispatch(collectLibelleChanged(collectLibelle));
    },
    subjectChanged: (subject) => {
      dispatch(subjectChanged(subject));
    },
    subjectLibelleChanged: (subjectLibelle) => {
      dispatch(subjectLibelleChanged(subjectLibelle));
    },
    underSubjectChanged: (underSubject) => {
      dispatch(underSubjectChanged(underSubject));
    },
    underSubjectLibelleChanged: (underSubjectLibelle) => {
      dispatch(underSubjectLibelleChanged(underSubjectLibelle));
    },
    productChanged: (product) => {
      dispatch(productChanged(product));
    },
    emailChanged: (email) => {
      dispatch(emailChanged(email));
    },
    productLibelleChanged: (productLibelle) => {
      dispatch(productLibelleChanged(productLibelle));
    },
    unitLibelleChanged: (unitLibelle) => {
      dispatch(unitLibelleChanged(unitLibelle));
    },
    unitChanged: (unit) => {
      dispatch(unitChanged(unit));
    },
    contentChanged: (content) => {
      dispatch(contentChanged(content));
    },
    itemsChanged: (items) => {
      dispatch(itemsChanged(items));
    },
    selectedFilesChanged: (selectedFiles) => {
      dispatch(selectedFilesChanged(selectedFiles));
    },
    selectedFilesReset: (selectedFiles) => {
      dispatch(selectedFilesReset(selectedFiles));
    },
    selectedItemChanged: (selectedItem) => {
      dispatch(selectedItemChanged(selectedItem));
    },
    selectedItemFilesChanged: (selectedItemFiles) => {
      dispatch(selectedItemFilesChanged(selectedItemFiles));
    },
    selectedItemAudioChanged: (selectedItemAudio) => {
      dispatch(selectedItemAudioChanged(selectedItemAudio));
    },
    etatChanged: (etat) => {
      dispatch(etatChanged(etat));
    },
    etat2Changed: (etat2) => {
      dispatch(etat2Changed(etat2));
    },
    resetWhatsapp: () => {
      dispatch(reset());
    },
    setExistingClaims: (existingClaims) => {
      dispatch(setExistingClaims(existingClaims));
    },
    setModalVisible: (modalVisible) => {
      dispatch(setModalVisible(modalVisible));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EnregistrerReclamation);
