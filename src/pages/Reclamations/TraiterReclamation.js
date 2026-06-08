import React, { useEffect, useRef, useState, useMemo } from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import DossierDataTable from "../../components/shared/DossierDataTable";
import ClaimsKPIBar from "./components/ClaimsKPIBar";
import { ButtonBase } from "@mui/material";
import ClaimsTable from "./components/ClaimsTable";
import ClaimsCardView from "./components/ClaimsCardView";
import excel from "../../assets/images/excel.svg";
import pdf from "../../assets/images/pdf.svg";
import Select from "react-select";
import { Link, NavLink } from "react-router-dom";
import { KTApp } from "../../Utils/blockui";
import {
  addressChanged,
  agentsChanged,
  claimHandleErrors,
  codeChanged,
  commentChanged,
  contentChanged,
  firstnameChanged,
  genderChanged,
  handledByChanged,
  assignedAtChanged,
  assignedByChanged,
  idChanged,
  itemsChanged,
  languageChanged,
  lastnameChanged,
  loading,
  motifChanged,
  phoneChanged,
  productChanged,
  recordedAtChanged,
  selectedFilesReset,
  selectedItemChanged,
  selectedItemFilesChanged,
  solutionChanged,
  statusChanged,
  subjectChanged,
  collectChanged,
  dossierimfChanged,
  unitChanged,
  authorizeChanged,
  crewChanged,
  objetLevelChanged,
  solutionIdChanged,
  createdAtChanged,
  createdByChanged,
  newSolutionChanged,
  newCommentChanged,
  etat2Changed,
  etatChanged,
  extrasChanged,
  anonymatChanged,
  transmittedChanged,
  selectedItemAudioChanged,
  solutionExistantChanged,
  handledCustomMessageChanged,
  handledShowModalChanged,
  handledMessageChanged,
  handledDelaiChanged,
  etat3Changed,
  etat4Changed,
  sessionChanged,
  underSubjectChanged,
  transmittedToChanged,
  setReaffect,
  codeClientChanged,
  emailChanged,
  transmittedByChanged,
} from "../../redux/actions/Reclamations/TraitementReclamationActions";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import EmailIcon from '@mui/icons-material/Email';
import SaveIcon from "@mui/icons-material/Save";
import { useParams } from "react-router-dom";
import {
  formatDate,
  formatDate3,
  formatDate4,
  guessExtension,
  isEmpty,
  loadItemFromLocalStorage,
  loadItemFromSessionStorage,
  cleanPhoneNumber3,
  cleanPhoneNumber,
  cleanPhoneNumber2,
  groupBy,
  handleDatePicker,
  isSettingComplete,
  isValidDate,
  isValidPhone,
  today,
} from "../../Utils/utils";
import { connect } from "react-redux";
import { v4 as uuid } from "uuid";
import {
  addExtraClaimApi,
  detailsTreat,
  downloadAudioApi,
  downloadFillesApi,
  downloadFillesApi2,
  getClaimAudioApi,
  getFillesApi,
  listeByStatut,
  listeTreat,
  startSession,
  deleteClaimApi,
  convertClaimApi,
} from "../../apis/Reclamations/ReclamationsApi";
import {
  addSuggestionApi,
  addSuggestionApiOffline,
} from "../../apis/Suggestions/SuggestionsApi";
import {
  addDenunciationApi,
  addDenunciationApiOffline,
} from "../../apis/Denonciations/DenonciationsApi";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import PersonIcon from "@mui/icons-material/Person";
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
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import {
  Avatar,
  Card,
  CardHeader,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Icon,
  LinearProgress,
  Radio,
  RadioGroup,
  DialogContent,
  Box,
  CardContent,
  Grid,
  Tooltip,
  DialogContentText,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import {
  FileDownload,
  History,
  Info,
  Pause,
  PlayArrow,
  Star,
  VolumeUp,
} from "@mui/icons-material";
import RecorderControls from "../../components/recorder-controls";
import useRecorder from "../../hooks/useRecorder";
import { LoadingButton } from "@mui/lab";
import { HOST } from "../../Utils/globals";
import axios from "axios";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import { styled } from "@mui/material/styles";
import CardList from "../../layouts/CardList";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import { modalify } from "../../Utils/modal";
import useWebSocketSession from "../../hooks/useWebSocketSession";
import useTreatmentHandlers from "../../hooks/useTreatmentHandlers";
import {
  AddCircleOutline,
  ChatBubble,
  ChatBubbleOutlineRounded,
  ChatTwoTone,
} from "@mui/icons-material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { notify } from "../../Utils/alert";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import ForumIcon from "@mui/icons-material/Forum";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { licenseInfo } from "../../apis/LoginApi";
import WarningIcon from "@mui/icons-material/Warning";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SidebarInfosClient from "../../components/treatment/SidebarInfosClient";
import SidebarDetailsDossier from "../../components/treatment/SidebarDetailsDossier";
import ActionsDisponibles from "../../components/treatment/ActionsDisponibles";
import FichiersTab from "../../components/treatment/FichiersTab";
import HistoriqueTimeline from "../../components/treatment/HistoriqueTimeline";
import PreEnregistreesTab from "../../components/treatment/PreEnregistreesTab";
import SessionChat from "../../components/treatment/SessionChat";
import TraitementShell from "../../components/treatment/TraitementShell";
import EmailDialog from "./widgets/EmailDialog";
import { data } from "jquery";
import { usePermissions } from "./widgets/usePermissions";
import AffecterModal from "./modals/AffecterModal";
import ConvertirModal from "./modals/ConvertirModal";
import TransmettreModal from "./modals/TransmettreModal";
import ApprouverModal from "./modals/ApprouverModal";

const styles = {
  control: (base) => ({
    ...base,
    height: 35,
    minHeight: 35,
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const TREAT_STATUS_OPTIONS = [
  { value: "",                  label: "Tous les statuts" },
  { value: "SAVED",             label: "Enregistrée" },
  { value: "AFFECTED",          label: "Affectée" },
  { value: "DESAPPROUVED",      label: "Désapprouvée" },
  { value: "SATISFIED",         label: "Satisfait" },
  { value: "UNSATISFIED",       label: "Non satisfait" },
  { value: "PARTIAL_SATISFIED", label: "Part. satisfait" },
  { value: "LITIGATION",        label: "Contentieux" },
  { value: "CLASSED",           label: "Classée" },
];

const TREAT_CHIPS = [
  { value: "ALL",               label: "Tous",                    filter: () => true },
  { value: "TO_TREAT",          label: "À traiter",               filter: (c) => ["SAVED","TEMP_SAVED","TO_APPROUVED","DESAPPROUVED"].includes(c.status) },
  { value: "AFFECTED",          label: "Affectée",                filter: (c) => c.status === "AFFECTED" },
  { value: "PARTIAL_SATISFIED", label: "Partiellement satisfait", filter: (c) => c.status === "PARTIAL_SATISFIED" },
  { value: "UNSATISFIED",       label: "Non satisfait",           filter: (c) => c.status === "UNSATISFIED" },
  { value: "CLASSED",           label: "Classée",                 filter: (c) => c.status === "CLASSED" },
  { value: "OVERDUE",           label: "En retard",               filter: (c) => c.retardDay !== undefined && c.retardDay <= 0 && !["SATISFIED","UNSATISFIED","PARTIAL_SATISFIED","LITIGATION"].includes(c.status) },
];

const TraiterReclamation = (props) => {
  const [expanded, setExpanded] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const [usersCGR, setUsersCGR] = React.useState([]);
  const [conversionBoxOpen, setConversionBoxOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [convertionType, setConvertionType] = useState(null);
  const [confirmationMaessage, setconfirmationMaessage] = useState("");

  const [openParent, setOpenParent] = useState(false);
  const [openChild, setOpenChild] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const handleOpenParent = () => setOpenParent(true);
  const handleCloseParent = () => setOpenParent(false);
  const handleOpenChild = () => setOpenChild(true);
  const handleCloseChild = () => setOpenChild(false);

  // activeTab, openAccordion, treatSubTab, openModal → gérés par TraitementShell

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleCheck = () => {
    setChecked(!checked);
  };
  let dimf, crew, emailDisplay;
  let user =
    loadItemFromSessionStorage("app-user") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-user"))
      : undefined;
  let users =
    loadItemFromLocalStorage("app-users") !== undefined
      ? JSON.parse(loadItemFromLocalStorage("app-users"))
      : undefined;
  let hbt = user.posteDto.habilitations.split(",");
  let addR = user.additionalRole;

  //vérification if user is in guest
  let showJoinBtn = false;
  let potentialGuest = props.session?.guests?.filter((e) => e.id === user.id);
  let potentialMember = props.session?.members?.filter((e) => e.id === user.id);
  if (
    (potentialGuest != null && potentialGuest.length > 0) ||
    (potentialMember != null && potentialMember.length > 0)
  ) {
    showJoinBtn = true;
  }
  // Permissions
  const {
    isAuthorWithAuthorization,
    isTransmittedToUser,
    isAuthor,
    isTransmitter,
    isAffecter,
    isAffectedUser,
    isUserOpenSession,
    isRa,
    raCanOpenSession,
  } = usePermissions(user, props);

  let handlingForms;
  const [agentsMailOptions, setAgentsMailOptions] = useState([]);

  const [messageSend, setMessageSend] = useState("");
  const [delai_at, setDelai_at] = useState(1);
  const [maxDelai, setMaxDelai] = useState(1);
  const [open, setOpen] = React.useState(false);
  const [interne, setInterne] = React.useState(true);
  const [anonymat, setAnonymat] = useState(false);
  const [reafect, setReacfect] = useState(false);
  const [showAudioPlayer, setAudioPlayer] = useState("");
  const [currentAudio, setCurrentAudio] = useState("");

  const [currentData, setCurrentData] = useState(null);
  const [dataRow, setDataRow] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [fileBlobs, setFileBlobs] = useState([]);
  const [audioListForm, setAudioListForm] = useState([]);
  const [audioListUrlForm, setAudioListUrlForm] = useState([]);
  const [loadingConversion, setLoadingConversion] = useState(false);
  let mode =
    loadItemFromLocalStorage("app-mode") !== undefined
      ? JSON.parse(loadItemFromLocalStorage("app-mode"))
      : undefined;

  let compteur = 0;
  const handleClickOpen = () => {
    compteur++;
    setOpen(!open);
    KTApp.unblockPage();
  };
  const [currentAudioId, setCurrentAudioId] = useState("");
  const audioRef = useRef(null);
  const [filesForm, setFiles] = useState([]);
  const inputRef = useRef(null);
  const [showExtraContent, setShowExtraContent] = useState(false);
  const [extraContent, setExtraContent] = useState("");
  const [extraFileLoading, setExtraFileLoading] = useState(false);
  const [claim_id, setClaimId] = useState(null);

  const clearFiles = () => {
    if (inputRef.current) {
      inputRef.current.value = null;
    }
    setFiles([]);
  };

  // console.log("param 3", compteur);
  const history = useHistory();
  const handleClose = () => {
    if (conversionBoxOpen) return;

    setOpen(false);
    setConversionBoxOpen(false);
    history.push("/reclamations/traitement/all");
  };
  const handleConversionBoxClose = () => {
    if (confirmationOpen) return;

    setConversionBoxOpen(false);
  };

  const handleOpenDialog = (type) => {
    setConvertionType(type);
    setConfirmationOpen(true);
  };
  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
  };

  const handleSubmitConfirmation = (e) => {
    e.preventDefault();
    setLoadingConversion(true);

    // console.log("props", props); 
    // console.log("dataRow", dataRow); 
    const formData = new FormData();
    let claim = {};

    if (convertionType === "suggestion") {
      claim["clientFirstAndLastName"] = dataRow.clientFirstAndLastName;
      claim["gender"] = dataRow.gender;
      claim["address"] = dataRow.address;
      claim["phone"] = dataRow.tel;
      claim["collectionChannelId"] = dataRow.collectionChannel.id;
      claim["servicePointId"] = dataRow.servicePoint.id;
      claim["fromWhatsapp"] = false;
      claim["filesWhatsapp"] = [];
      claim["inboxWhatsapp"] = null;
      claim["productId"] = dataRow.product.id;
      claim["languageId"] = dataRow.language.id;
      claim["folderCode"] = dataRow.folderCode;
      claim["receiptDateTime"] = dataRow.receiptDateTime;
      claim["collectorId"] = dataRow.collector.id;
      claim["content"] = dataRow.content;
      claim["code"] = "";
      claim["id"] = "";
      formData.append("suggestion", JSON.stringify(claim));

      if (mode === 1) {
        addSuggestionApi(formData, props).then((response) => {
          const suggestionCode = response.data.content.code;
          const data = {
            code: suggestionCode,
            claimId: dataRow.id,
          };

          convertClaimApi(data, props)
            .then(() => {
              setLoadingConversion(false);
              sessionStorage.setItem('pendingSuggestionConversion', JSON.stringify({ code: suggestionCode, convertedByName: user?.firstAndLastName || "", convertedAtTime: new Date().toISOString() }));
              history.push("/suggestions/traitement/all", { justConverted: true, convertedCode: suggestionCode });
            })
            .finally(() => {
              setLoadingConversion(false);
            });
        });
      } else {
        // Offline mode
      }
    } else {

      if (mode === 1) {
        const data = {
          code: dataRow.code,
          claimId: dataRow.id,
        };

        convertClaimApi(data, props)
          .then(() => {
            setLoadingConversion(false);
            history.push("/denonciations/traitement/all", { justConverted: true });
          })
          .finally(() => {
            setLoadingConversion(false);
          });
      } else {
        // Offline mode
      }
    }
  };

  const handleAnonymat = () => {
    setAnonymat(!anonymat);
  };

  // ── Hooks Phase 2 ─────────────────────────────────────────────────────────
  const {
    userData, setUserData,
    publicChats, setPublicChats,
    guests, setGuests,
    propositionSolution, setPropositionSolution,
    propositionCommentaire, setPropositionCommentaire,
    propositionSolutionError,
    propositionCommentaireError,
    showVoteField, setShowVoteField,
    selectedOption, setSelectedOption,
    connect, disconnect,
    handleMessage,
    sendValue, sendVote,
    handleVote, handleChooseVote,
    ejectGuest, inviteGuest,
  } = useWebSocketSession({ code: props.code, claimId: props.id, session: props.session, user });

  const {
    prepareBeforeAssign,
    handleAssign,
    handleReAssign,
    handleAssignOrReassign,
    handleSolve,
    handleReSolve,
    handleSolveImmediate,
    handleApprove,
    handleDisapprove,
    handleTransmission,
  } = useTreatmentHandlers({
    props,
    user,
    anonymat,
    maxDelai,
    onSuccess: (e) => { handleCancel(e); handleClose(); },
  });

  const [privateChats, setPrivateChats] = useState(new Map());
  const [tab, setTab] = useState("CHATROOM");
  //#darrell use for autoscroll
  const bottomRef = useRef(null);
  const [messageError, setMessageError] = useState("");
  const [votesForPour, setVotesForPour] = useState(0);
  const [votesForContre, setVotesForContre] = useState(0);
  const [showConfirmChooseSolution, setShowConfirmChooseSolution] =
    useState(false);

  const [confirmChoosedSolution, setConfirmChoosedSolution] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // console.log(userData);
  }, [userData]);

  useEffect(() => {
    setUsersCGR(users);
    // console.log("coco",usersCGR)
  }, []);

  useEffect(() => {
    // console.log(publicChats);
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [publicChats]);

  useEffect(() => {
    // setGuests(props?.session?.guests)
  }, [props?.session?.guests]);

  const { recorderState, ...handlers } = useRecorder();
  let { audio } = recorderState;

  const [open2, setOpen2] = useState(false);
  const [showAudioBox, setAudioBox] = useState(false);

  useEffect(() => {
    if (audio) {
      setAudioListForm([...audioListForm, audio]);
      setAudioListUrlForm([...audioListUrlForm, URL.createObjectURL(audio)]);
    }
  }, [audio]);

  let alreadyCall = false;
  useEffect(() => {
    //  console.log("params",props.match.params)
    //  console.log("params 2",props.id)
    if (props.match.params.code !== "all" && alreadyCall === false) {
      alreadyCall = true;
      async function details() {
        let cc = await axios({
          method: "get",
          url: HOST + "api/v1/claim/" + props.match.params.code + "/details",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + loadItemFromSessionStorage("token"),
          },
        });
        if (cc.status >= 200 && cc.status <= 299) {
          // await listeTreat(props);
          let data = cc.data.content;

          clearComponentState();
          setDataRow(data);

          //console.log("level",data.objet.risqueLevel)
          let agentMailOptions = [];
          let userConnected = user;
          switch (data.objet.risqueLevel) {
            case "MINEUR":
              users.map((user) => {
                if (userConnected.ra === true) {
                  if (userConnected.servicePointDto.libelle === user.servicePointDto.libelle && user.deleted === false) {
                    let hab = user.posteDto.habilitations.split(",");
                    if (hab.includes("H1", "H2", "H3")) {
                      agentMailOptions.push({
                        label: user.firstAndLastName + " < " + user.email + " >",
                        value: user.id,
                        email: user.email,
                      });
                    }
                  }
                } else if (user.deleted === false) {
                  let hab = user.posteDto.habilitations.split(",");
                  if (hab.includes("H1", "H2", "H3")) {
                    agentMailOptions.push({
                      label: user.firstAndLastName + " < " + user.email + " >",
                      value: user.id,
                      email: user.email,
                    });
                  }
                }
              });
              setAgentsMailOptions(agentMailOptions);
              if (hbt.includes("H2")) {
                props.authorizeChanged(true);
              } else {
                props.authorizeChanged(false);
              }
              break;
            case "MOYEN":
              users.map((user) => {
                if (userConnected.ra === true) {
                  if (userConnected.servicePointDto.libelle === user.servicePointDto.libelle && user.deleted === false) {
                    let hab = user.posteDto.habilitations.split(",");
                    if (hab.includes("H3")) {
                      agentMailOptions.push({
                        label: user.firstAndLastName + " < " + user.email + " >",
                        value: user.id,
                        email: user.email,
                      });
                    }
                  }
                } else if (user.deleted === false) {
                  let hab = user.posteDto.habilitations.split(",");
                  if (hab.includes("H3")) {
                    agentMailOptions.push({
                      label: user.firstAndLastName + " < " + user.email + " >",
                      value: user.id,
                      email: user.email,
                    });
                  }
                }
              });
              setAgentsMailOptions(agentMailOptions);
              if (hbt.includes("H3")) {
                props.authorizeChanged(true);
              } else {
                props.authorizeChanged(false);
              }
              break;
            case "GRAVE":
              users.map((user) => {
                if (userConnected.ra === true) {
                  if (userConnected.servicePointDto.libelle === user.servicePointDto.libelle && user.deleted === false) {
                    let hab = user.posteDto.habilitations.split(",");
                    if (hab.includes("H4")) {
                      agentMailOptions.push({
                        label:
                          user.firstAndLastName + "         < " + user.email + " >",
                        value: user.id,
                        email: user.email,
                      });
                    }
                  }
                } else if (user.deleted === false) {
                  let hab = user.posteDto.habilitations.split(",");
                  if (hab.includes("H4")) {
                    agentMailOptions.push({
                      label:
                        user.firstAndLastName + "         < " + user.email + " >",
                      value: user.id,
                      email: user.email,
                    });
                  }
                }
              });
              setAgentsMailOptions(agentMailOptions);
              if (hbt.includes("H4")) {
                props.authorizeChanged(true);
              } else {
                props.authorizeChanged(false);
              }
              break;

            default:
              break;
          }
          setMaxDelai(
            data.objet?.processingTime ? data.objet.processingTime : 45
          );
          props.idChanged(data.id ? data.id : "");
          props.lastnameChanged(
            data.clientFirstAndLastName ? data.clientFirstAndLastName : ""
          );
          props.firstnameChanged(
            data.clientFirstAndLastName ? data.clientFirstAndLastName : ""
          );
          props.addressChanged(data.address ? data.address : "");
          props.phoneChanged(data.tel ? data.tel : "");
          props.genderChanged(data.gender ? data.gender : "");
          props.languageChanged(
            data.language.libelle ? data.language.libelle : ""
          );
          props.dossierimfChanged(data.folderCode ? data.folderCode : "");
          props.emailChanged(data.email ? data.email : "");
          props.codeChanged(data.code ? data.code : "");
          props.codeClientChanged(data.codeClient ? data.codeClient : "");
          props.recordedAtChanged(
            data.receiptDateTime ? data.receiptDateTime : ""
          );
          props.collectChanged(
            data.collectionChannel.libelle ? data.collectionChannel.libelle : ""
          );
          props.subjectChanged(data.objet.libelle ? data.objet.libelle : "");
          props.underSubjectChanged(
            data.objet.categorie.libelle ? data.objet.categorie.libelle : ""
          );
          props.objetLevelChanged(
            data.objet.risqueLevel ? data.objet.risqueLevel : ""
          );
          props.productChanged(
            data.product.libelle ? data.product.libelle : ""
          );
          props.unitChanged(
            data.servicePoint.libelle ? data.servicePoint.libelle : ""
          );
          props.contentChanged(data.content ? data.content : "");
          props.solutionChanged(Array.isArray(data.solutionDtos) ? data.solutionDtos : []);
          props.statusChanged(data.status ? data.status : "");
          props.createdAtChanged(data.createdAt ? data.createdAt : "");
          props.createdByChanged(
            data.collector.firstAndLastName
              ? data.collector.firstAndLastName
              : ""
          );
          props.assignedAtChanged(data.affectedAt ? data.affectedAt : "");
          props.assignedByChanged(
            data.treatmentAffectedBy
              ? data.treatmentAffectedBy.firstAndLastName
              : ""
          );
          props.anonymatChanged(
            data.affectedAnonymous !== null
              ? "" + data.affectedAnonymous + ""
              : ""
          );
          props.sessionChanged(data.session !== null ? data.session : "");
          props.handledByChanged(
            data.treatmentAffectedTo
              ? data.treatmentAffectedTo.firstAndLastName
              : ""
          );

          props.selectedItemChanged(data);
          setCurrentData(data);

          getFillesApi(data.id, props);
          getClaimAudioApi(data.id, props);
          // if (props.id) {

          // }
          // setOpen((prev) => {
          //   return false;
          // });
        }
      }

      details();
    }
  }, []);

  useEffect(() => {
    KTApp.blockPage({
      overlayColor: "#000000",
      type: "v2",
      state: "danger",
      message: "En cours de chargement...",
    });
    setIsLoading(true);

    // console.log("params",props.match.params); 
    if (props.match.params.code === "all") {
      props.itemsChanged([]);
      listeTreat(props)
        .then((r) => { })
        .finally(() => {
          setIsLoading(false);
          KTApp.unblockPage();
        });
    } else {
      setIsLoading(false);
      KTApp.unblockPage();
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
  }, [props.match.params.code]);

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

  useEffect(() => {
    const fetchData = async () => {
      await licenseControl();
    };

    fetchData();
  }, []);

  const maDivRef = useRef(null);

  const invitation = (event) => {
    const { value } = event.target;
    const ids = props?.session?.guests?.map((e) => e.id) ?? [];
    const princ = users.filter((e) => !ids.includes(e.id));
    if (value !== "") {
      setUsersCGR(princ.filter((e) =>
        e.firstAndLastName.toLowerCase().includes(value.toLowerCase())
      ));
    } else {
      setUsersCGR(princ);
    }

    // console.log("valeur",value)
  };

  const memberIds = props?.session?.members?.map((m) => m.id) || [];
  const guestIds = guests?.map((g) => g.id) || [];
  const availableToInvite = usersCGR.filter(
    (user) => !memberIds.includes(user.id) && !guestIds.includes(user.id)
  );

  // console.log("availableToInvite", availableToInvite);
  // console.log("usersCGR", usersCGR);

  const handleInvitation = (e, idi) => inviteGuest(idi);
  const handleEject = (e, idi) => ejectGuest(idi);


  const handlePropositionSolution = (event) => {
    setPropositionSolution(event.target.value);
  };
  const handlePropositionCommentaire = (event) => {
    setPropositionCommentaire(event.target.value);
  };

  const registerUser = (e) => {
    let info = { claimId: props.id, creatorId: user.id };
    props.etat4Changed(true);
    startSession(info, props).then(() => { connect(); });
  };

  const handleShowVoteField = () => {
    setShowVoteField(!showVoteField);
  };

  const handleChooseVoteConfirm = () => {
    setShowConfirmChooseSolution(!showConfirmChooseSolution);
  };

  const clearComponentState = () => {
    props.lastnameChanged("");
    props.firstnameChanged("");
    props.addressChanged("");
    props.phoneChanged("");
    props.genderChanged("");
    props.languageChanged("");
    props.dossierimfChanged("");
    props.emailChanged("");
    props.collectChanged("");
    props.subjectChanged("");
    props.underSubjectChanged("");
    props.codeChanged("");
    props.crewChanged("");
    props.recordedAtChanged("");
    props.productChanged("");
    props.unitChanged("");
    props.contentChanged("");
    props.handledByChanged("");
    props.solutionChanged("");
    props.solutionIdChanged("");
    props.solutionExistantChanged("");
    props.commentChanged("");
    props.newSolutionChanged("");
    props.newCommentChanged("");
    props.motifChanged("");
    props.claimHandleErrors("");
    props.selectedItemChanged({});
    props.selectedFilesReset([]);
    props.selectedItemFilesChanged([]);
    props.selectedItemAudioChanged([]);
    props.handledMessageChanged("");
    props.handledDelaiChanged(1);
    props.handledCustomMessageChanged(false);
    props.handledShowModalChanged(false);
    props.sessionChanged("");
    props.setReaffect(null);
    setShowSelectPrintItem(false);
    setCurrentAudio("");
    setAudioPlayer("");
    disconnect();
  };

  const handleCancel = (e) => {
    e.preventDefault();
    clearComponentState();
  };

  //Handling the List
  let columns = [
    {
      key: "codeClient",
      text: "Code client",
      className: "code",
      align: "left",
      sortable: true,
      cell: (claim, index) => {
        let codi;
        const _isFinal = ["TREAT","SATISFIED","UNSATISFIED","PARTIAL_SATISFIED","LITIGATION","CLASSED"].includes(claim.status);
        if (claim.session !== null && claim.session !== "" && !_isFinal) {
          if (
            claim.status === "AFFECTED" &&
            claim.treatmentAffectedTo !== null &&
            claim.treatmentAffectedTo.firstAndLastName === user.firstAndLastName
          ) {
            codi = (
              <>
                <div className="df">
                  <span className="mr-1">{claim.codeClient}</span>
                  <div className="card-content red-text ml-4">
                    <AlternateEmailIcon />
                  </div>
                  <div className="card-content red-text ml-4">
                    <ForumIcon />
                  </div>
                </div>
              </>
            );
          } else {
            codi = (
              <>
                <div className="df">
                  <span className="mr-1">{claim.codeClient}</span>
                  <div className="card-content red-text ml-4">
                    <ForumIcon />
                  </div>
                </div>
              </>
            );
          }
        } else {
          if (
            claim.status === "AFFECTED" &&
            claim.treatmentAffectedTo !== null &&
            claim.treatmentAffectedTo.firstAndLastName === user.firstAndLastName
          ) {
            codi = (
              <>
                <div className="df">
                  <span className="mr-1">{claim.codeClient}</span>
                  <div className="card-content red-text ml-4">
                    <AlternateEmailIcon />
                  </div>
                </div>
              </>
            );
          } else {
            codi = <span className="">{claim.codeClient}</span>;
          }
        }

        return codi;
      },
    },
    {
      key: "clientFirstAndLastName",
      text: "Client",
      className: "client",
      align: "left",
      sortable: true,
    },
    {
      key: "statusStr",
      text: "Statut",
      className: "status",
      align: "left",
      sortable: true,
      cell: (claim, index) => {
        let statusElt;
        switch (claim.status) {
          case "SAVED":
            statusElt = (
              <span className="toTreatBgColor chip  lighten-5">
                <span className="">A traiter</span>
              </span>
            );
            break;
          case "AFFECTED":
            statusElt = (
              <span className="affectedBgColor chip  lighten-5">
                <span className="">Affectée</span>
              </span>
            );
            break;
          case "TO_APPROUVED":
            statusElt = (
              <span className="toApprouvedBgColor chip  lighten-5">
                <span className="">A approuvée</span>
              </span>
            );
            break;
          case "DESAPPROUVED":
            statusElt = (
              <span className="unApprouvedBgColor chip  lighten-5">
                <span className="">Désapprouvée</span>
              </span>
            );
            break;
          case "UNSATISFIED":
            statusElt = (
              <span className="chip unSatisfiedBgColor lighten-5">
                <span className="">Non Satisfait</span>
              </span>
            );
            break;
          case "PARTIAL_SATISFIED":
            statusElt = (
              <span className="chip partialBgColor lighten-5">
                <span className="">Partiellement Satisfait</span>
              </span>
            );
            break;
          case "CLASSED":
            statusElt = (
              <span className="chip classedBgColor lighten-5">
                <span className="">Classée</span>
              </span>
            );
            break;

          default:
            statusElt = (
              <span className="chip indigo lighten-5">
                <span className="indigo-text">Nan</span>
              </span>
            );
            break;
        }
        return statusElt;
      },
    },
    {
      key: "risqueLevel",
      text: "Gravité",
      className: "gravite",
      align: "left",
      sortable: true,
      cell: (claim, index) => {
        let graviteElt;
        switch (claim?.objet?.risqueLevel) {
          case "MINEUR":
            if (claim.transmitted) {
              graviteElt = (
                <>
                  <div className="df">
                    <span className="green-text text-bold mr-2">Mineur</span>
                    <div className="card-content red-text ml-4">
                      <MoveUpIcon />
                    </div>
                  </div>
                </>
              );
            } else {
              graviteElt = <span className="green-text text-bold">Mineur</span>;
            }
            break;
          case "MOYEN":
            if (claim.transmitted) {
              graviteElt = (
                <>
                  <div className="df">
                    <span className="orange-text text-bold mr-2">Moyen</span>
                    <div className="card-content red-text ml-4">
                      <MoveUpIcon />
                    </div>
                  </div>
                </>
              );
            } else {
              graviteElt = <span className="orange-text text-bold">Moyen</span>;
            }

            break;
          case "GRAVE":
            if (claim.transmitted) {
              graviteElt = (
                <>
                  <div className="df">
                    <span className="materialize-red-text text-bold mr-2">Grave</span>
                    <div className="card-content red-text ml-4">
                      <MoveUpIcon />
                    </div>
                  </div>
                </>
              );
            } else {
              graviteElt = <span className="materialize-red-text text-bold">Grave</span>;
            }
            break;
          default:
            graviteElt = (
              <span className="chip indigo lighten-5">
                <span className="indigo-text">Nan</span>
              </span>
            );
            break;
        }
        return graviteElt;
      },
    },
    {
      key: "createdAtFormated",
      text: "Enregistrée le",
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
      key: "alertFormated",
      text: "Alerte dans",
      className: "created_at",
      align: "left",
      sortable: true,
      cell: (claim, index) => {
        let temps;
        if (claim.retardDay > 0) {
          temps = claim.declenchedDate;
        } else {
          temps = (
            <div className="card-content red-text">
              <WarningIcon />
            </div>
          );
        }
        return temps;
      },
    },
  ];

  let config = {
    page_size: 15,
    length_menu: [15, 25, 50, 100],
    show_filter: true,
    show_pagination: true,
    filename: "Liste des réclamations à traiter",
    // button: {
    //     excel: true,
    //     pdf: true,
    //     print: true,
    // },
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

    setDataRow(data);
    console.log(data)
    history.push('/reclamations/traitement/' + data.code, { from: 'traitement' });
    clearComponentState();
    // console.log("donnees",data)
    //console.log("level",data.objet.risqueLevel)
    let agentMailOptions = [];

    let userConnected = user;
    switch (data.objet.risqueLevel) {
      case "MINEUR":
        users.map((user) => {
          if (userConnected.ra === true) {
            if (userConnected.servicePointDto.libelle === user.servicePointDto.libelle && user.deleted === false) {
              let hab = user.posteDto.habilitations.split(",");
              if (hab.includes("H1", "H2", "H3")) {
                agentMailOptions.push({
                  label: user.firstAndLastName + " < " + user.email + " >",
                  value: user.id,
                  email: user.email,
                });
              }
            }
          } else if (user.deleted === false) {
            let hab = user.posteDto.habilitations.split(",");
            if (hab.includes("H1", "H2", "H3")) {
              agentMailOptions.push({
                label: user.firstAndLastName + " < " + user.email + " >",
                value: user.id,
                email: user.email,
              });
            }
          }
        });
        setAgentsMailOptions(agentMailOptions);
        if (hbt.includes("H2")) {
          props.authorizeChanged(true);
        } else {
          props.authorizeChanged(false);
        }
        break;
      case "MOYEN":
        users.map((user) => {
          if (userConnected.ra === true) {
            if (userConnected.servicePointDto.libelle === user.servicePointDto.libelle && user.deleted === false) {
              let hab = user.posteDto.habilitations.split(",");
              if (hab.includes("H3")) {
                agentMailOptions.push({
                  label: user.firstAndLastName + " < " + user.email + " >",
                  value: user.id,
                  email: user.email,
                });
              }
            }
          } else if (user.deleted === false) {
            let hab = user.posteDto.habilitations.split(",");
            if (hab.includes("H3")) {
              agentMailOptions.push({
                label: user.firstAndLastName + " < " + user.email + " >",
                value: user.id,
                email: user.email,
              });
            }
          }
        });
        setAgentsMailOptions(agentMailOptions);
        if (hbt.includes("H3")) {
          props.authorizeChanged(true);
        } else {
          props.authorizeChanged(false);
        }
        break;
      case "GRAVE":
        users.map((user) => {
          if (userConnected.ra === true) {
            if (userConnected.servicePointDto.libelle === user.servicePointDto.libelle && user.deleted === false) {
              let hab = user.posteDto.habilitations.split(",");
              if (hab.includes("H4")) {
                agentMailOptions.push({
                  label: user.firstAndLastName + "         < " + user.email + " >",
                  value: user.id,
                  email: user.email,
                });
              }
            }
          } else if (user.deleted === false) {
            let hab = user.posteDto.habilitations.split(",");
            if (hab.includes("H4")) {
              agentMailOptions.push({
                label: user.firstAndLastName + "         < " + user.email + " >",
                value: user.id,
                email: user.email,
              });
            }
          }
        });
        setAgentsMailOptions(agentMailOptions);
        if (hbt.includes("H4")) {
          props.authorizeChanged(true);
        } else {
          props.authorizeChanged(false);
        }
        break;

      default:
        break;
    }
    setMaxDelai(data.objet.processingTime ? data.objet.processingTime : 45);
    props.idChanged(data.id ? data.id : "");
    props.lastnameChanged(
      data.clientFirstAndLastName ? data.clientFirstAndLastName : ""
    );
    props.firstnameChanged(
      data.clientFirstAndLastName ? data.clientFirstAndLastName : ""
    );
    props.addressChanged(data.address ? data.address : "");
    props.phoneChanged(data.tel ? data.tel : "");
    props.genderChanged(data.gender ? data.gender : "");
    props.languageChanged(data?.language?.libelle ? data.language.libelle : "");
    props.dossierimfChanged(data.folderCode ? data.folderCode : "");
    props.emailChanged(data.email ? data.email : "");
    props.codeChanged(data.code ? data.code : "");
    props.codeClientChanged(data.codeClient ? data.codeClient : "");
    props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
    props.collectChanged(
      data.collectionChannel.libelle ? data.collectionChannel.libelle : ""
    );
    props.subjectChanged(data.objet.libelle ? data.objet.libelle : "");
    props.underSubjectChanged(
      data.objet.categorie.libelle ? data.objet.categorie.libelle : ""
    );
    props.objetLevelChanged(
      data.objet.risqueLevel ? data.objet.risqueLevel : ""
    );
    props.extrasChanged(data.extras ?? []);

    props.productChanged(data.product.libelle ? data.product.libelle : "");
    props.unitChanged(
      data.servicePoint.libelle ? data.servicePoint.libelle : ""
    );
    props.contentChanged(data.content ? data.content : "");
    props.solutionChanged(Array.isArray(data.solutionDtos) ? data.solutionDtos : []);
    props.statusChanged(data.status ? data.status : "");
    props.createdAtChanged(data.createdAt ? data.createdAt : "");
    props.createdByChanged(
      data.collector.firstAndLastName ? data.collector.firstAndLastName : ""
    );
    props.assignedAtChanged(data.affectedAt ? data.affectedAt : "");
    props.assignedByChanged(
      data.treatmentAffectedBy ? data.treatmentAffectedBy.firstAndLastName : ""
    );
    props.anonymatChanged(
      data.affectedAnonymous !== null ? "" + data.affectedAnonymous + "" : ""
    );
    props.transmittedChanged(
      data.transmitted !== null ? "" + data.transmitted + "" : ""
    );
    props.transmittedToChanged(
      data.transmittedTo !== null
        ? "" + data.transmittedTo.firstAndLastName + ""
        : ""
    );
    props.transmittedByChanged(
      data.transmittedBy !== null
        ? "" + data.transmittedBy.firstAndLastName + ""
        : ""
    );
    // console.log("tr",data)
    props.sessionChanged(data.session !== null ? data.session : "");
    props.handledByChanged(
      data.treatmentAffectedTo ? data.treatmentAffectedTo.firstAndLastName : ""
    );

    props.selectedItemChanged(data);
    setCurrentData(data);

    getFillesApi(data.id, props);
    getClaimAudioApi(data.id, props);
    // console.log("create",props.created_by);
  };

  const tchat = showJoinBtn ? (
    <SessionChat
      session={props.session}
      user={user}
      userData={userData}
      publicChats={publicChats}
      guests={guests}
      codeClient={props.codeClient}
      isCreator={props.session?.createdBy?.id === user.id}
      isUserOpenSession={isUserOpenSession}
      availableToInvite={availableToInvite}
      showVoteField={showVoteField}
      showConfirmChooseSolution={showConfirmChooseSolution}
      propositionSolution={propositionSolution}
      propositionCommentaire={propositionCommentaire}
      propositionSolutionError={propositionSolutionError}
      propositionCommentaireError={propositionCommentaireError}
      maDivRef={maDivRef}
      bottomRef={bottomRef}
      onSearchInvite={invitation}
      onInvite={handleInvitation}
      onEject={handleEject}
      onMessage={handleMessage}
      onSend={sendValue}
      onToggleVoteField={handleShowVoteField}
      onPropositionSolution={handlePropositionSolution}
      onPropositionCommentaire={handlePropositionCommentaire}
      onSendVote={sendVote}
      onVote={handleVote}
      onChooseVote={handleChooseVote}
      onChooseVoteConfirm={handleChooseVoteConfirm}
    />
  ) : null;

  let details;

  if (props.solution?.length !== 0) {
    // console.log("tu es la", "oh oh")
    let type;
    let index = 0;
    let solutions =
      interne === false
        ? Array.from(
          props.solution.filter((e) => {
            return (
              e.status === "APPROVED" && e.satisfactionMeasureDto !== null
            );
          })
        )
        : Array.from(props.solution);

    let couleurs = [
      "#333300",
      "#00cc00",
      "#99003d",
      "#3333ff",
      "#666666",
      "#253858",
      "#00875A",
      "#36B37",
      "#FFC400",
      "#FF8B00",
      "#FF5630",
      "#5243AA",
      "#0052CC",
      "#00B8D9",
    ];

    if (solutions.length !== 0) {
      details = (
        <>
          <div className="col s12">
            {/* let solutions =  */}
            {Array.from(solutions).map((solution) => {
              // let fond = couleurs[getRandomInt(couleurs.length)];
              let fond = couleurs[index % couleurs.length];

              let mesure = "";
              if (
                solution.status === "APPROVED" &&
                solution.satisfactionMeasureDto !== null
              ) {
                let degre =
                  solution.satisfactionMeasureDto.status === "SATISFIED"
                    ? "Satisfait"
                    : solution.satisfactionMeasureDto.status === "UNSATISFIED"
                      ? "Non satisfait"
                      : solution.satisfactionMeasureDto.status === "PARTIAL"
                        ? "Partiellement satisfait"
                        : "";
                mesure = (
                  <>
                    <Typography component="div">
                      <div>
                        <span
                          className="chip2"
                          style={{ backgroundColor: fond }}
                        >
                          <span className="hero">
                            Client {degre} : mesurée
                            {solution.satisfactionMeasureDto.measurer
                              ? ` par ${solution.satisfactionMeasureDto.measurer.firstAndLastName}`
                              : " depuis le site web "}
                            le{" "}
                            {formatDate(
                              solution.satisfactionMeasureDto.measureDateTime
                            )}
                          </span>
                        </span>
                      </div>
                    </Typography>
                  </>
                );
              } else if (
                solution.status === "APPROVED" &&
                solution.satisfactionMeasureDto === null
              ) {
                mesure = (
                  <>
                    <span className="chip2" style={{ backgroundColor: fond }}>
                      <span className="hero">
                        En attente de mesure de satisfaction
                      </span>
                    </span>
                  </>
                );
              }

              let approbation = "";
              if (
                solution.status === "UNAPPROVED" &&
                solution.motifDesaprobation !== null
              ) {
                approbation = (
                  <>
                    <Typography component="div">
                      <div className="row">
                        <div className="col l12 s12 pb-2" id="content">
                          <div className="df pb-2">
                            <RecordVoiceOverIcon sx={{ mr: 2 }} /> Motif de
                            désapprobation
                          </div>
                          <div>
                            {solution.motifDesaprobation !== null
                              ? solution.motifDesaprobation
                              : ""}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span
                          className="chip2"
                          style={{ backgroundColor: fond }}
                        >
                          <span className="hero">
                            Désapprouvée par{" "}
                            {solution.unApprouver.firstAndLastName} le{" "}
                            {formatDate(solution.unApprouvedAt)}
                          </span>
                        </span>
                      </div>
                    </Typography>
                  </>
                );
              } else if (
                solution?.status === "UNAPPROVED" &&
                solution?.motifDesaprobation === null
              ) {
                approbation = (
                  <>
                    <span className="chip2" style={{ backgroundColor: fond }}>
                      <span className="hero">En attente d'approbation</span>
                    </span>
                  </>
                );
              }

              let enregistrement = (
                <>
                  <Timeline>
                    <TimelineItem>
                      <TimelineOppositeContent
                        sx={{ m: "auto 0", flex: "0" }}
                        variant="body2"
                        color="text.secondary"
                      ></TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineConnector />
                        <TimelineDot style={{ fontSize: "25px" }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: fond,
                            }}
                          >
                            {(index = index + 1)}
                          </Avatar>
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent sx={{ py: "12px", px: 2 }}>
                        <Typography variant="h6" component="span">
                          {solution?.author?.firstAndLastName} -{" "}
                          <span style={{ fontSize: "12px" }}>
                            {solution !== null &&
                              solution?.createdAt !== null &&
                              solution?.createdAt !== undefined
                              ? formatDate(solution?.createdAt)
                              : ""}
                          </span>
                        </Typography>

                        <Typography className="pb-2" component="div">
                          <div className="row">
                            <div className="col l12 s12 pb-2" id="content">
                              <div className="df pb-2">
                                <RecordVoiceOverIcon sx={{ mr: 2 }} /> Solution
                              </div>
                              <div>{solution?.content}</div>
                            </div>

                            <div className="col l12 s12 pb-2" id="content">
                              <div className="df pb-2">
                                <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                                Commentaire
                              </div>
                              <div>{solution?.commentaire}</div>
                            </div>

                            {solution.satisfactionMeasureDto ? (
                              solution.satisfactionMeasureDto.commentaire !==
                                null ? (
                                <div className="col l12 s12 pb-2" id="content">
                                  <div className="df pb-2">
                                    <FormatQuoteIcon sx={{ mr: 2 }} />{" "}
                                    Commentaire du client
                                  </div>
                                  <div>
                                    {
                                      solution.satisfactionMeasureDto
                                        .commentaire
                                    }
                                  </div>
                                </div>
                              ) : (
                                ""
                              )
                            ) : (
                              ""
                            )}
                          </div>
                        </Typography>
                        {approbation}
                        {mesure}
                      </TimelineContent>
                    </TimelineItem>
                  </Timeline>
                </>
              );

              return <>{enregistrement}</>;
            })}
          </div>
        </>
      );
    } else {
      details = (
        <>
          <div className="row pb-4">
            <div
              className="col s12 mb-2"
              style={{
                background: "#f5f9ff",
                borderLeft: "4px solid #1976d2",
                padding: "10px 5px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
              }}
            >
              Aucune donnée
            </div>
          </div>
        </>
      );
    }
  } else if (props.solution?.length === 0) {
    details = (
      <>
        <div className="row pb-4">
          <div
            className="col s12 mb-2"
            style={{
              background: "#f5f9ff",
              borderLeft: "4px solid #1976d2",
              padding: "10px 5px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
            }}
          >
            Cette réclamation est en attente de traitement
          </div>
        </div>
      </>
    );
  }

  const historique = (
    <>
      <div className="row">
        <div className="col s12">
          <details>
            <summary className="text-details">
              Historique de la réclamation
            </summary>
            <div className="row">
              <div className="col s12 df pb-2">
                <span
                  className="chip indigo lighten-5"
                  style={{ cursor: "pointer" }}
                >
                  <span className="indigo-text">
                    Interactions avec le client
                  </span>
                </span>
              </div>
            </div>
            <div className="row">
              <div className="col s12 m12">
                <div className="row">{details}</div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </>
  );

  let formButtons;
  if (isEmpty(props.selectedItem)) {
    formButtons = (
      <>
        <button
          type="submit"
          className="waves-effect waves-effect-b waves-light btn-small"
        >
          Enregistrer
        </button>
      </>
    );
  } else {
    formButtons = (
      <>
        <button
          type="button"
          onClick={(e) => handleCancel(e)}
          className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text white lighten-4"
        >
          Annuler
        </button>

        <button
          type="button"
          onClick={handleSolve}
          className="waves-effect waves-effect-b waves-light btn-small"
        >
          Enregistrer
        </button>
      </>
    );
  }

  const handleModal = (e) => {
    e.preventDefault();
    handleClose();
    modalify(
      "Confirmation",
      "Confirmez vous la transmission de cette réclamation au pilote ? Vous perdrez tout droit de traitement.",
      "confirm",
      handleTransmission
    );
  };

  let statusElt;
  let affectForm = "";
  let treatForm;
  let solutionsListe = [];
  switch (props.status) {
    case "SAVED":
      let solutions = props.selectedItem?.objet?.existingSolutions;

      solutionsListe = solutions?.map((solution, index) => {
        let words = String(solution.content).split(" ");
        let thirtyWords = "";
        let taille = words.length;
        if (taille < 30) {
          thirtyWords = solution.content;
        } else {
          for (let i = 0; i < 50; i++) {
            const o = words[i];
            thirtyWords = thirtyWords + o + " ";
          }
          thirtyWords =
            thirtyWords + "......... (Déroulez pour voir la solution complète)";
        }

        return {
          props: props,
          index: index,
          id: solution.id,
          taille: taille,
          title: thirtyWords,
          content: solution.content,
          compteur: solution.compteur,
        };
      });

      let personTransmit = (props.transmitted === "true" && props.transmittedTo === user.firstAndLastName) ? (
        <>
          {/* details tranmission */}
          <div className="row pb-4">
            <div
              className="col s12 mb-2"
              style={{
                background: "#f5f9ff",
                borderLeft: "4px solid #1976d2",
                padding: "10px 5px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span>
                Cette réclamation vous a été transmise par
                <strong style={{ color: "#1976d2", marginLeft: "0.25em" }}>
                  {props.transmittedBy ? props.transmittedBy : "—"}
                </strong>.
              </span>

            </div>
          </div>

        </>
      ) : "";

      if (
        (props.transmitted === "true" && user.firstAndLastName === props.transmittedBy)
      ) {
        affectForm = (
          <>
            <div className="row pb-4">
              <div
                className="col s12 mb-2"
                style={{
                  background: "#f5f9ff",
                  borderLeft: "4px solid #1976d2",
                  padding: "10px 5px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Vous avez transmis cette réclamation à <strong style={{ color: "#1976d2", marginLeft: "0.25em" }}>{props.transmittedTo ? props.transmittedTo : "—"}</strong>{" "}. Vous n'avez plus la main sur elle.
              </div>
            </div>
          </>
        );
      } else if (hbt.includes("H6") || addR === "PILOTE" || (user.ra === true)) {
        affectForm = (
          <>
            {personTransmit}
            <form id="claimAssignForm">
              <div className="row">
                <div className="col s12">
                  <details>
                    <summary className="text-details">
                      Affectation de la réclamation
                    </summary>

                    <div className="col s12 input-field">
                      <Select
                        options={agentsMailOptions}
                        className="react-select-container mt-4"
                        classNamePrefix="react-select"
                        style={styles}
                        placeholder="Sélectionner l'agent"
                        onChange={(e) => {
                          props.handledByChanged(e.value);
                          setAffectEmail(e.email);
                        }}
                      />
                      <label htmlFor="gender" className={"active"}>
                        Affectée à
                        <span>
                          (<span className="red-text darken-2 ">*</span>)
                        </span>
                      </label>
                      <small className="errorTxt4">
                        <div id="cpassword-error" className="error">
                          {props.errors !== undefined
                            ? props.errors.handled_by
                            : ""}
                        </div>
                      </small>
                    </div>
                    <div className="col s12 input-field mb-2">
                      <FormControlLabel
                        control={
                          <Checkbox
                            onChange={(e) => {
                              handleAnonymat();
                            }}
                          />
                        }
                        label="Cacher l'identité du plaignant ? "
                      />
                    </div>
                    <div className="col s12 display-flex justify-content-end mt-3">
                      {
                        //  (actif !== undefined && actif)  ?
                        <LoadingButton
                          onClick={(e) => { prepareBeforeAssign(e); }}
                          className="waves-effect waves-effect-b waves-light btn-small"
                          loading={props.etat}
                          loadingPosition="end"
                          endIcon={<SaveIcon />}
                          variant="contained"
                          sx={{
                            backgroundColor: "#1e2188",
                            textTransform: "initial",
                          }}
                        >
                          <span>Affecter</span>
                        </LoadingButton>
                        // :
                        // <div className="card-alert card red lighten-5">
                        //   <div className="card-content red-text">
                        //       <ul>
                        //           Veuillez activer une licence.
                        //       </ul>
                        //   </div>
                        // </div>
                      }
                    </div>
                  </details>
                </div>
              </div>
            </form>
          </>
        );
      }

      if (
        hbt.includes("H2", "H3", "H4") &&
        ((props.created_by === user.firstAndLastName &&
          props.transmitted === "false") ||
          (props.transmittedTo === user.firstAndLastName &&
            props.transmitted === "true" &&
            addR === "MOLDUE"))
      ) {
        treatForm = (
          <>
            {/* {solutionsListe} */}
            {props.authorize ? (
              <>
                {solutionsListe !== undefined && solutionsListe.length !== 0 ? (
                  <div className="row">
                    <div className="col l12">
                      <details>
                        <summary className="text-details">
                          Solutions potentielles
                        </summary>
                        <CardList cards={solutionsListe} />
                      </details>
                    </div>
                  </div>
                ) : (
                  ""
                )}

                <form id="claimHandleForm">
                  <div className="row mb-2">
                    <div className="col s12">
                      <details open>
                        <summary className="text-details">
                          Résolution de la réclamation
                        </summary>
                        <div className="col s12 input-field">
                          <textarea
                            id="solution"
                            name="solution"
                            placeholder=""
                            className="materialize-textarea textarea-size"
                            value={props.new_solution}
                            onChange={(e) =>
                              props.newSolutionChanged(e.target.value)
                            }
                          ></textarea>
                          <label htmlFor="content" className={"active"}>
                            Solution
                            <span>
                              (<span className="red-text darken-2 ">*</span>)
                            </span>
                          </label>
                          <small className="errorTxt4">
                            <div id="cpassword-error" className="error">
                              {props.errors !== undefined
                                ? props.errors.new_solution
                                : ""}
                            </div>
                          </small>
                        </div>
                        <div className="col s12 input-field">
                          <textarea
                            id="comment"
                            name="comment"
                            placeholder=""
                            className="materialize-textarea textarea-size"
                            value={props.new_comment}
                            onChange={(e) =>
                              props.newCommentChanged(e.target.value)
                            }
                          ></textarea>
                          <label htmlFor="content" className={"active"}>
                            Commentaires/Observations
                            <span>
                              (<span className="red-text darken-2 ">*</span>)
                            </span>
                          </label>
                          <small className="errorTxt4">
                            <div id="cpassword-error" className="error">
                              {props.errors !== undefined
                                ? props.errors.new_comment
                                : ""}
                            </div>
                          </small>
                        </div>
                      </details>
                    </div>
                    <div className="col s12 display-flex justify-content-end mt-3 ">
                      {
                        //  (actif !== undefined && actif)  ?
                        <LoadingButton
                          onClick={handleReSolve}
                          className="waves-effect waves-effect-b waves-light btn-small"
                          loading={props.etat2}
                          loadingPosition="end"
                          endIcon={<SaveIcon />}
                          variant="contained"
                          sx={{
                            backgroundColor: "#1e2188",
                            textTransform: "initial",
                          }}
                        >
                          <span>Résoudre</span>
                        </LoadingButton>
                        // :
                        // <div className="card-alert card red lighten-5">
                        //   <div className="card-content red-text">
                        //       <ul>
                        //           Veuillez activer une licence.
                        //       </ul>
                        //   </div>
                        // </div>
                      }
                    </div>
                  </div>
                </form>
              </>
            ) : (
              <div className="row">
                <div className="col s12">
                  <details open>
                    <summary className="text-details">
                      Resolution de la réclamation
                    </summary>
                    <div className="card-alert card red lighten-5">
                      <div
                        className="card-content red-text"
                        style={{ textAlign: "center" }}
                      >
                        <ul>Vous ne pouvez pas traiter cette réclamation</ul>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            )}
          </>
        );
      } else if (props.created_by !== user.firstAndLastName) {
        treatForm = (
          <div className="card-alert card orange lighten-5">
            <div className="card-content orange-text" style={{ textAlign: "center" }}>
              <ul>Seul l'agent qui a enregistré cette réclamation peut la traiter. Vous pouvez l'affecter à un agent.</ul>
            </div>
          </div>
        );
      } else {
        treatForm = "";
      }

      statusElt = (
        <span className="toTreatBgColor chip  z-depth-1">
          <span className="">A traiter</span>
        </span>
      );

      break;
    case "AFFECTED":
      statusElt = (
        <span className="affectedBgColor chip z-depth-1">
          <span className="">Affectée</span>
        </span>
      );
      let tmp;
      let afForm;
      let personAffect = (
        <>
          {/* details affectation */}
          <div className="row pb-4">
            <div
              className="col s12 mb-2"
              style={{
                background: "#EFF6FF",
                borderLeft: "4px solid #1976d2",
                padding: "10px 5px",
                borderRadius: "4px",
              }}
            >
              Réclamation affectée à{" "}
              <strong style={{ color: "#1976d2" }}>{props.handled_by}</strong>{" "}
              par <em>{props.assigned_by}</em> le{" "}
              <span style={{ color: "#555" }}>
                {formatDate(props.assignedAt)}
              </span>
            </div>
          </div>
        </>
      );

      let solutions1 = props.selectedItem?.objet?.existingSolutions;

      solutionsListe = solutions1?.map((solution, index) => {
        let words = String(solution.content).split(" ");
        let thirtyWords = "";
        let taille = words.length;
        if (taille < 30) {
          thirtyWords = solution.content;
        } else {
          for (let i = 0; i < 50; i++) {
            const o = words[i];
            thirtyWords = thirtyWords + o + " ";
          }
          thirtyWords =
            thirtyWords + "......... (Déroulez pour voir la solution complète)";
        }

        return {
          props: props,
          index: index,
          id: solution.id,
          taille: taille,
          title: thirtyWords,
          content: solution.content,
          compteur: solution.compteur,
        };
      });

      //ils peuvent reaffecter les réclamations en cas d'erreur ou d'indisponibilité

      afForm = (
        <>
          <div className="row mb-4">
            <form id="claimAssignForm">
              <div className="row">
                <div className="col s12">
                  <details>
                    <summary className="text-details">
                      Réaffectation de la réclamation
                    </summary>

                    <div className="col s12 input-field">
                      <Select
                        options={agentsMailOptions}
                        className="react-select-container mt-4"
                        classNamePrefix="react-select"
                        style={styles}
                        placeholder="Sélectionner l'agent"
                        onChange={(e) => {
                          props.setReaffect(e.value);
                          setAffectEmail(e.email);
                        }}
                      />
                      <label htmlFor="gender" className={"active"}>
                        Affectée à
                        <span>
                          (<span className="red-text darken-2 ">*</span>)
                        </span>
                      </label>
                      <small className="errorTxt4">
                        <div id="cpassword-error" className="error">
                          {props.errors !== undefined
                            ? props.errors.handled_by
                            : ""}
                        </div>
                      </small>
                    </div>
                    <div className="col s12 input-field mb-2">
                      <FormControlLabel
                        control={
                          <Checkbox
                            onChange={(e) => {
                              handleAnonymat();
                            }}
                          />
                        }
                        label="Cacher l'identité du plaignant ? "
                      />
                    </div>
                    <div className="col s12 display-flex justify-content-end mt-3">
                      <LoadingButton
                        onClick={(e) => { prepareBeforeAssign(e); }}
                        className="waves-effect waves-effect-b waves-light btn-small"
                        loading={props.etat}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{
                          backgroundColor: "#1e2188",
                          textTransform: "initial",
                        }}
                      >
                        <span>Affecter</span>
                      </LoadingButton>
                    </div>
                  </details>
                </div>
              </div>
            </form>
          </div>
        </>
      );

      if (props.solution?.length === 0) {
        if (props.handled_by === user.firstAndLastName) {
          tmp = (
            <div className="row">
              {/* resolution */}
              {props.authorize ? (
                <>
                  {solutionsListe !== undefined &&
                    solutionsListe.length !== 0 ? (
                    <div className="row">
                      <div className="col l12">
                        <details>
                          <summary className="text-details">
                            Solutions potentielles
                          </summary>
                          <CardList cards={solutionsListe} />
                        </details>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <form id="claimHandleAgainForm">
                    <div className="row">
                      <div className="col s12">
                        <details open>
                          <summary className="text-details">
                            Traitement de la réclamation
                          </summary>
                          <div className="col s12 input-field">
                            <textarea
                              id="solution"
                              name="solution"
                              placeholder=""
                              className="materialize-textarea textarea-size"
                              value={props.new_solution}
                              onChange={(e) =>
                                props.newSolutionChanged(e.target.value)
                              }
                            ></textarea>
                            <label htmlFor="content" className={"active"}>
                              Solution
                              <span>
                                (<span className="red-text darken-2 ">*</span>)
                              </span>
                            </label>
                            <small className="errorTxt4">
                              <div id="cpassword-error" className="error">
                                {props.errors !== undefined
                                  ? props.errors.new_solution
                                  : ""}
                              </div>
                            </small>
                          </div>
                          <div className="col s12 input-field">
                            <textarea
                              id="comment"
                              name="comment"
                              placeholder=""
                              className="materialize-textarea textarea-size"
                              value={props.new_comment}
                              onChange={(e) =>
                                props.newCommentChanged(e.target.value)
                              }
                            ></textarea>
                            <label htmlFor="content" className={"active"}>
                              Commentaires/Observations
                              <span>
                                (<span className="red-text darken-2 ">*</span>)
                              </span>
                            </label>
                            <small className="errorTxt4">
                              <div id="cpassword-error" className="error">
                                {props.errors !== undefined
                                  ? props.errors.new_comment
                                  : ""}
                              </div>
                            </small>
                          </div>
                          <div className="col s12 display-flex justify-content-end mt-3">
                            {
                              //  (actif !== undefined && actif)  ?
                              <LoadingButton
                                onClick={handleReSolve}
                                className="waves-effect waves-effect-b waves-light btn-small"
                                loading={props.etat2}
                                loadingPosition="end"
                                endIcon={<SaveIcon />}
                                variant="contained"
                                sx={{
                                  backgroundColor: "#1e2188",
                                  textTransform: "initial",
                                }}
                              >
                                <span>Traiter</span>
                              </LoadingButton>
                              // :
                              // <div className="card-alert card red lighten-5">
                              //   <div className="card-content red-text">
                              //       <ul>
                              //           Veuillez activer une licence.
                              //       </ul>
                              //   </div>
                              // </div>
                            }
                          </div>
                        </details>
                      </div>
                    </div>
                  </form>
                </>
              ) : (
                <div className="row">
                  <div className="col s12">
                    <details open>
                      <summary className="text-details">
                        Resolution de la réclamation
                      </summary>
                      <div className="card-alert card red lighten-5">
                        <div
                          className="card-content red-text"
                          style={{ textAlign: "center" }}
                        >
                          <ul>Vous ne pouvez pas traiter cette réclamation</ul>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              )}
            </div>
          );

          treatForm = (
            <>
              {personAffect}
              {tmp}
            </>
          );
        } else {
          if (hbt.includes("H14") || addR !== "MOLDUE" || (user.ra === true && props.transmitted === "false")) {
            tmp = (
              <div className="row pb-4">
                <div
                  className="col s12 mb-2"
                  style={{
                    background: "#EFF6FF",
                    borderLeft: "4px solid #1976d2",
                    padding: "10px 5px",
                    borderRadius: "4px",
                  }}
                >
                  Réclamation affectée à{" "}
                  <strong style={{ color: "#1976d2" }}>
                    {props.handled_by}
                  </strong>{" "}
                  par <em>{props.assigned_by}</em> le{" "}
                  <span style={{ color: "#555" }}>
                    {formatDate(props.assignedAt)}
                  </span>
                </div>
              </div>
            );
          } else {
            tmp = "";
          }

          treatForm = <>{tmp}</>;
        }
      } else {
        // console.log("props.handle_by",props.handled_by)
        if (props.handled_by === user.firstAndLastName) {
          treatForm = (
            <>
              {/* details affectation */}
              <div className="row pb-4">
                <div
                  className="col s12 mb-2"
                  style={{
                    background: "#EFF6FF",
                    borderLeft: "4px solid #1976d2",
                    padding: "10px 5px",
                    borderRadius: "4px",
                  }}
                >
                  Réclamation affectée à{" "}
                  <strong style={{ color: "#1976d2" }}>
                    {props.handled_by}
                  </strong>{" "}
                  par <em>{props.assigned_by}</em> le{" "}
                  <span style={{ color: "#555" }}>
                    {formatDate(props.assignedAt)}
                  </span>
                </div>
              </div>
              {/* historique */}
              <div className="row">
                <div className="col s12">
                  <details>
                    <summary className="text-details">
                      Historique de la réclamation
                    </summary>
                    <div className="row">
                      <div className="col s12 df pb-2">
                        <span
                          className="chip indigo lighten-5"
                          style={{ cursor: "pointer", height: "auto" }}
                        >
                          <span className="indigo-text">
                            Traitement en interne
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col s12 m12">
                        <div className="row">{details}</div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              {/* retraitement */}
              {props.authorize ? (
                <form id="claimHandleAgainForm">
                  <div className="row">
                    <div className="col s12">
                      <details open>
                        <summary className="text-details">
                          Retraitement de la réclamation
                        </summary>

                        <div className="col s12 input-field">
                          <textarea
                            id="solution"
                            name="solution"
                            placeholder=""
                            className="materialize-textarea textarea-size"
                            value={props.new_solution}
                            onChange={(e) =>
                              props.newSolutionChanged(e.target.value)
                            }
                          ></textarea>
                          <label htmlFor="content" className={"active"}>
                            Solution
                            <span>
                              (<span className="red-text darken-2 ">*</span>)
                            </span>
                          </label>
                          <small className="errorTxt4">
                            <div id="cpassword-error" className="error">
                              {props.errors !== undefined
                                ? props.errors.new_solution
                                : ""}
                            </div>
                          </small>
                        </div>
                        <div className="col s12 input-field">
                          <textarea
                            id="comment"
                            name="comment"
                            placeholder=""
                            className="materialize-textarea textarea-size"
                            value={props.new_comment}
                            onChange={(e) =>
                              props.newCommentChanged(e.target.value)
                            }
                          ></textarea>
                          <label htmlFor="content" className={"active"}>
                            Commentaires/Observations
                            <span>
                              (<span className="red-text darken-2 ">*</span>)
                            </span>
                          </label>
                          <small className="errorTxt4">
                            <div id="cpassword-error" className="error">
                              {props.errors !== undefined
                                ? props.errors.new_comment
                                : ""}
                            </div>
                          </small>
                        </div>

                        <div className="col s12 display-flex justify-content-end mt-3">
                          {
                            // (actif !== undefined && actif)  ?
                            <LoadingButton
                              onClick={handleReSolve}
                              className="waves-effect waves-effect-b waves-light btn-small"
                              loading={props.etat2}
                              loadingPosition="end"
                              endIcon={<SaveIcon />}
                              variant="contained"
                              sx={{
                                backgroundColor: "#1e2188",
                                textTransform: "initial",
                              }}
                            >
                              <span>Retraiter</span>
                            </LoadingButton>
                            // :

                            // <div className="card-alert card red lighten-5">
                            //   <div className="card-content red-text">
                            //       <ul>
                            //           Veuillez activer une licence.
                            //       </ul>
                            //   </div>
                            // </div>
                          }
                        </div>
                      </details>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="row">
                  <div className="col s12">
                    <details open>
                      <summary className="text-details">
                        Retraitement de la réclamation
                      </summary>
                      <div className="card-alert card red lighten-5">
                        <div
                          className="card-content red-text"
                          style={{ textAlign: "center" }}
                        >
                          <ul>Vous ne pouvez pas traiter cette réclamation</ul>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              )}
            </>
          );
        } else {
          if (hbt.includes("H6") || addR === "PILOTE") {
            treatForm = (
              <>
                {personAffect}
                {/* historique */}
                <div className="row">
                  <div className="col s12">
                    <details>
                      <summary className="text-details">
                        Historique de la réclamation
                      </summary>
                      <div className="row">
                        <div className="col s12 df pb-2">
                          <span
                            className="chip indigo lighten-5"
                            style={{ cursor: "pointer", height: "auto" }}
                          >
                            <span className="indigo-text">
                              Traitement en interne
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col s12 m12">
                          <div className="row">{details}</div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </>
            );
          }
        }
      }

      break;
    case "TO_APPROUVED":
      statusElt = (
        <span className="chip toApprouvedBgColor  z-depth-1">
          <span className="orange-text">A approuver</span>
        </span>
      );
      let tab = props.solution;
      // console.log("tabbbbb")

      {
        /* historique */
      }
      let historique = (
        <>
          <div className="row">
            <div className="col s12">
              <details>
                <summary className="text-details">
                  Historique de la réclamation
                </summary>
                <div className="row">
                  <div className="col s12 df pb-2">
                    <span
                      className="chip indigo lighten-5"
                      style={{ cursor: "pointer", height: "auto" }}
                    >
                      <span className="indigo-text">Traitement en interne</span>
                    </span>
                  </div>
                </div>
                <div className="row">
                  <div className="col s12 m12">
                    <div className="row">{details}</div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </>
      );

      let approuveForm = (
        <form id="claimApproveForm">
          <div className="row">
            <div className="col s12">
              <details open>
                <summary className="text-details pb-5">
                  Approbation de la réclamation
                </summary>

                {props.solutionIdChanged(tab[0] !== undefined ? tab[0].id : "")}

                <div className="row pb-5">
                  <div className="col l12 s12 pb-3" id="content">
                    <div className="df pb-2">
                      <RecordVoiceOverIcon sx={{ mr: 2 }} /> Solution
                    </div>
                    <div>
                      {props.solution[0] !== undefined
                        ? props.solution[0].content
                        : ""}
                    </div>
                  </div>

                  <div className="col l12 s12 pb-2" id="content">
                    <div className="df pb-2">
                      <RecordVoiceOverIcon sx={{ mr: 2 }} /> Commentaire
                    </div>
                    <div>
                      {props.solution[0] !== undefined
                        ? props.solution[0].commentaire
                        : ""}
                    </div>
                  </div>
                </div>

                <div className="col s12 input-field">
                  <textarea
                    id="motif"
                    name="motif"
                    placeholder=""
                    className="materialize-textarea textarea-size"
                    value={props.motif}
                    onChange={(e) => props.motifChanged(e.target.value)}
                  ></textarea>
                  <label htmlFor="content" className={"active"}>
                    Motif de désapprobation
                  </label>
                  <small className="errorTxt4">
                    <div id="cpassword-error" className="error">
                      {props.errors !== undefined ? props.errors.motif : ""}
                    </div>
                  </small>
                </div>
                <div className="col s12 display-flex justify-content-end mt-3">
                  {
                    //  (actif !== undefined && actif)  ?
                    <>
                      <LoadingButton
                        onClick={handleDisapprove}
                        className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
                        loading={props.etat}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{ textTransform: "initial" }}
                      >
                        <span>Désapprouver</span>
                      </LoadingButton>

                      <LoadingButton
                        onClick={handleApprove}
                        className="waves-effect waves-effect-b waves-light btn-small"
                        loading={props.etat2}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{
                          backgroundColor: "#1e2188",
                          textTransform: "initial",
                        }}
                      >
                        <span>Approuver</span>
                      </LoadingButton>
                    </>
                    // :
                    // <div className="card-alert card red lighten-5">
                    //   <div className="card-content red-text">
                    //       <ul>
                    //           Veuillez activer une licence.
                    //       </ul>
                    //   </div>
                    // </div>
                  }
                </div>
              </details>
            </div>
          </div>
        </form>
      );

      if (hbt.includes("H6") || addR === "PILOTE") {
        treatForm = (
          <>
            {historique}
            {approuveForm}
          </>
        );
      } else {
        treatForm = <>{historique}</>;
      }

      break;
    case "DESAPPROUVED":
      statusElt = (
        <span className="chip unApprouvedBgColor z-depth-1">
          <span className="">Désapprouvée</span>
        </span>
      );
      // console.log("props.handle_by",props.handled_by)
      if (props.handled_by === user.firstAndLastName) {
        treatForm = (
          <>
            {/* historique */}
            <div className="row">
              <div className="col s12">
                <details>
                  <summary className="text-details">
                    Historique de la réclamation
                  </summary>
                  <div className="row">
                    <div className="col s12 df pb-2">
                      <span
                        className="chip indigo lighten-5"
                        style={{ cursor: "pointer", height: "auto" }}
                      >
                        <span className="indigo-text">
                          Traitement en interne
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col s12 m12">
                      <div className="row">{details}</div>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* retraitement */}
            {props.authorize ? (
              <form id="claimHandleAgainForm">
                <div className="row">
                  <div className="col s12">
                    <details open>
                      <summary className="text-details">
                        Retraitement de la réclamation
                      </summary>

                      <div className="col s12 input-field">
                        <textarea
                          id="solution"
                          name="solution"
                          placeholder=""
                          className="materialize-textarea textarea-size"
                          value={props.new_solution}
                          onChange={(e) =>
                            props.newSolutionChanged(e.target.value)
                          }
                        ></textarea>
                        <label htmlFor="content" className={"active"}>
                          Solution
                          <span>
                            (<span className="red-text darken-2 ">*</span>)
                          </span>
                        </label>
                        <small className="errorTxt4">
                          <div id="cpassword-error" className="error">
                            {props.errors !== undefined
                              ? props.errors.new_solution
                              : ""}
                          </div>
                        </small>
                      </div>
                      <div className="col s12 input-field">
                        <textarea
                          id="comment"
                          name="comment"
                          placeholder=""
                          className="materialize-textarea textarea-size"
                          value={props.new_comment}
                          onChange={(e) =>
                            props.newCommentChanged(e.target.value)
                          }
                        ></textarea>
                        <label htmlFor="content" className={"active"}>
                          Commentaires/Observations
                          <span>
                            (<span className="red-text darken-2 ">*</span>)
                          </span>
                        </label>
                        <small className="errorTxt4">
                          <div id="cpassword-error" className="error">
                            {props.errors !== undefined
                              ? props.errors.new_comment
                              : ""}
                          </div>
                        </small>
                      </div>

                      <div className="col s12 display-flex justify-content-end mt-3">
                        {
                          //  (actif !== undefined && actif)  ?
                          <LoadingButton
                            onClick={handleReSolve}
                            className="waves-effect waves-effect-b waves-light btn-small"
                            loading={props.etat2}
                            loadingPosition="end"
                            endIcon={<SaveIcon />}
                            variant="contained"
                            sx={{
                              backgroundColor: "#1e2188",
                              textTransform: "initial",
                            }}
                          >
                            <span>Retraiter</span>
                          </LoadingButton>
                          // :

                          // <div className="card-alert card red lighten-5">
                          //   <div className="card-content red-text">
                          //       <ul>
                          //           Veuillez activer une licence.
                          //       </ul>
                          //   </div>
                          // </div>
                        }
                      </div>
                    </details>
                  </div>
                </div>
              </form>
            ) : (
              <div className="row">
                <div className="col s12">
                  <details open>
                    <summary className="text-details">
                      Retraitement de la réclamation
                    </summary>
                    <div className="card-alert card red lighten-5">
                      <div
                        className="card-content red-text"
                        style={{ textAlign: "center" }}
                      >
                        <ul>Vous ne pouvez pas traiter cette réclamation</ul>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            )}
          </>
        );
      } else {
        if (addR !== "MOLDUE") {
          treatForm = (
            <>
              {/* historique */}
              <div className="row">
                <div className="col s12">
                  <details>
                    <summary className="text-details">
                      Historique de la réclamation
                    </summary>
                    <div className="row">
                      <div className="col s12 df pb-2">
                        <span
                          className="chip indigo lighten-5"
                          style={{ cursor: "pointer", height: "auto" }}
                        >
                          <span className="indigo-text">
                            Traitement en interne
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col s12 m12">
                        <div className="row">{details}</div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </>
          );
        } else {
          treatForm = "";
        }
      }

      break;
    case "UNSATISFIED":
      //ils peuvent affecter les réclamations non satisfaites
      if (hbt.includes("H6") || addR === "PILOTE" || (user.ra === true && props.transmitted === "false")) {
        affectForm = (
          <>
            <form id="claimAssignForm">
              <div className="row">
                <div className="col s12">
                  <details>
                    <summary className="text-details">
                      Affectation de la réclamation
                    </summary>

                    <div className="col s12 input-field">
                      <Select
                        options={agentsMailOptions}
                        className="react-select-container mt-4"
                        classNamePrefix="react-select"
                        style={styles}
                        placeholder="Sélectionner l'agent"
                        onChange={(e) => {
                          props.handledByChanged(e.value);
                          setAffectEmail(e.email);
                        }}
                      />
                      <label htmlFor="gender" className={"active"}>
                        Affectée à
                        <span>
                          (<span className="red-text darken-2 ">*</span>)
                        </span>
                      </label>
                      <small className="errorTxt4">
                        <div id="cpassword-error" className="error">
                          {props.errors !== undefined
                            ? props.errors.handled_by
                            : ""}
                        </div>
                      </small>
                    </div>
                    <div className="col s12 input-field mb-2">
                      <FormControlLabel
                        control={
                          <Checkbox
                            onChange={(e) => {
                              handleAnonymat();
                            }}
                          />
                        }
                        label="Cacher l'identité du plaignant ? "
                      />
                    </div>
                    <div className="col s12 display-flex justify-content-end mt-3">
                      {
                        // (actif !== undefined && actif)  ?
                        <LoadingButton
                          onClick={(e) => { prepareBeforeAssign(e); }}
                          className="waves-effect waves-effect-b waves-light btn-small"
                          loading={props.etat}
                          loadingPosition="end"
                          endIcon={<SaveIcon />}
                          variant="contained"
                          sx={{
                            backgroundColor: "#1e2188",
                            textTransform: "initial",
                          }}
                        >
                          <span>Affecter</span>
                        </LoadingButton>
                        // :
                        // <div className="card-alert card red lighten-5">
                        //   <div className="card-content red-text">
                        //       <ul>
                        //           Veuillez activer une licence.
                        //       </ul>
                        //   </div>
                        // </div>
                      }
                    </div>
                  </details>
                </div>
              </div>
            </form>
          </>
        );
      } else {
        affectForm = "";
      }

      statusElt = (
        <span className="chip unSatisfiedBgColor lighten-5 mb-4">
          <span className="">Non Satisfait</span>
        </span>
      );
      break;
    case "PARTIAL_SATISFIED":
      //ils peuvent affecter les réclamations non satisfaites
      if (hbt.includes("H6") || addR === "PILOTE" || (user.ra === true && props.transmitted === "false")) {
        affectForm = (
          <>
            <form id="claimAssignForm">
              <div className="row">
                <div className="col s12">
                  <details>
                    <summary className="text-details">
                      Affectation de la réclamation
                    </summary>

                    <div className="col s12 input-field">
                      <Select
                        options={agentsMailOptions}
                        className="react-select-container mt-4"
                        classNamePrefix="react-select"
                        style={styles}
                        placeholder="Sélectionner l'agent"
                        onChange={(e) => {
                          props.handledByChanged(e.value);
                          setAffectEmail(e.email);
                        }}
                      />
                      <label htmlFor="gender" className={"active"}>
                        Affectée à
                        <span>
                          (<span className="red-text darken-2 ">*</span>)
                        </span>
                      </label>
                      <small className="errorTxt4">
                        <div id="cpassword-error" className="error">
                          {props.errors !== undefined
                            ? props.errors.handled_by
                            : ""}
                        </div>
                      </small>
                    </div>
                    <div className="col s12 input-field mb-2">
                      <FormControlLabel
                        control={
                          <Checkbox
                            onChange={(e) => {
                              handleAnonymat();
                            }}
                          />
                        }
                        label="Cacher l'identité du plaignant ? "
                      />
                    </div>
                    <div className="col s12 display-flex justify-content-end mt-3">
                      {
                        //  (actif !== undefined && actif)  ?
                        <LoadingButton
                          onClick={(e) => { prepareBeforeAssign(e); }}
                          className="waves-effect waves-effect-b waves-light btn-small"
                          loading={props.etat}
                          loadingPosition="end"
                          endIcon={<SaveIcon />}
                          variant="contained"
                          sx={{
                            backgroundColor: "#1e2188",
                            textTransform: "initial",
                          }}
                        >
                          <span>Affecter</span>
                        </LoadingButton>
                        //  :
                        //  <div className="card-alert card red lighten-5">
                        //    <div className="card-content red-text">
                        //        <ul>
                        //            Veuillez activer une licence.
                        //        </ul>
                        //    </div>
                        //  </div>
                      }
                    </div>
                  </details>
                </div>
              </div>
            </form>
          </>
        );
      } else {
        affectForm = "";
      }

      statusElt = (
        <span className="chip partialBgColor lighten-5 mb-4">
          <span className="">Partiellement Satisfait</span>
        </span>
      );
      break;
    case "CLASSED":
      //ils peuvent affecter les réclamations non satisfaites
      if (hbt.includes("H6") || addR === "PILOTE" || (user.ra === true && props.transmitted === "false")) {
        affectForm = (
          <>
            <form id="claimAssignForm">
              <div className="row">
                <div className="col s12">
                  <details>
                    <summary className="text-details">
                      Affectation de la réclamation
                    </summary>

                    <div className="col s12 input-field">
                      <Select
                        options={agentsMailOptions}
                        className="react-select-container mt-4"
                        classNamePrefix="react-select"
                        style={styles}
                        placeholder="Sélectionner l'agent"
                        onChange={(e) => {
                          props.handledByChanged(e.value);
                          setAffectEmail(e.email);
                        }}
                      />
                      <label htmlFor="gender" className={"active"}>
                        Affectée à
                        <span>
                          (<span className="red-text darken-2 ">*</span>)
                        </span>
                      </label>
                      <small className="errorTxt4">
                        <div id="cpassword-error" className="error">
                          {props.errors !== undefined
                            ? props.errors.handled_by
                            : ""}
                        </div>
                      </small>
                    </div>
                    <div className="col s12 input-field mb-2">
                      <FormControlLabel
                        control={
                          <Checkbox
                            onChange={(e) => {
                              handleAnonymat();
                            }}
                          />
                        }
                        label="Cacher l'identité du plaignant ? "
                      />
                    </div>
                    <div className="col s12 display-flex justify-content-end mt-3">
                      {
                        // (actif !== undefined && actif)  ?
                        <LoadingButton
                          onClick={(e) => { prepareBeforeAssign(e); }}
                          className="waves-effect waves-effect-b waves-light btn-small"
                          loading={props.etat}
                          loadingPosition="end"
                          endIcon={<SaveIcon />}
                          variant="contained"
                          sx={{
                            backgroundColor: "#1e2188",
                            textTransform: "initial",
                          }}
                        >
                          <span>Affecter</span>
                        </LoadingButton>
                        // :
                        // <div className="card-alert card red lighten-5">
                        //   <div className="card-content red-text">
                        //       <ul>
                        //           Veuillez activer une licence.
                        //       </ul>
                        //   </div>
                        // </div>
                      }
                    </div>
                  </details>
                </div>
              </div>
            </form>
          </>
        );
      } else {
        affectForm = "";
      }

      statusElt = (
        <span className="chip classedBgColor lighten-5">
          <span className="">Classée</span>
        </span>
      );
      break;
    default:
      statusElt = "";
      break;
  }

  let attachmentList;
  if (props.selectedItemFiles.length > 0) {
    let attachmentListChild = props.selectedItemFiles.map((attachment) => {
      let icon = guessExtension(attachment);
      return (
        <Grid item xs={12} sm={6} key={attachment.id}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              borderRadius: 2,
              p: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-3px)",
              },
              height: "100%",
            }}
          >
            <Box
              sx={{
                backgroundColor: "grey.100",
                borderRadius: "6px",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
                minWidth: "56px",
              }}
            >
              <img
                src={icon}
                height="28"
                width="22"
                alt=""
                style={{ objectFit: "contain" }}
              />
            </Box>

            <CardContent sx={{ flex: 1, minWidth: 0, py: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontWeight: "bold",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    width: "100%",
                    mb: 0.5,
                  }}
                >
                  {attachment.name}
                </Typography>
                {attachment._extra && (
                  <Tooltip
                    title={`Ajouté par ${attachment.extra?.user?.firstAndLastName ?? ""} le ${attachment.extra?.createdAt && isFinite(new Date(attachment.extra.createdAt)) ? formatDate(attachment.extra.createdAt) : "date invalide"}`}
                  >
                    <Info fontSize="small" sx={{ ml: 1 }} />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {Math.round((attachment.size / 1024) * 100) / 100} {"Ko"}
              </Typography>
            </CardContent>

            <FileDownload
              sx={{
                fontSize: "18px",
                color: "primary.main",
                ml: 1,
                "&:hover": {
                  color: "primary.dark",
                  cursor: "pointer",
                },
              }}
              onClick={() => downloadFillesApi(attachment.id, attachment.name)}
            />
          </Card>
        </Grid>
      );
    });

    attachmentList = (
      <Grid container spacing={2} size={12}>
        {attachmentListChild}
      </Grid>
    );
  } else {
    attachmentList = (
      <Grid container spacing={2} size={12}>
        <Grid item>Ce dossier ne contient pas de fichiers joints</Grid>
      </Grid>
    );
  }

  const handlePlay = (audioId, audioName) => {
    if (currentAudioId === audioId) {
      audioRef.current.pause();
      setCurrentAudioId(null);
    } else {
      setCurrentAudioId(audioId);
      downloadAudioApi(audioId, audioName).then((data) => {
        let blobAudio = new Blob([data], {
          type: "audio/ogg; codecs=opus",
        });

        setCurrentAudio(window.URL.createObjectURL(blobAudio));
        setTimeout(() => audioRef.current.play(), 2000);
        // setAudioPlayer("audio-" + attachment.id);
      });
    }
  };

  let audioList;
  if (props.selectedItemAudio != null && props.selectedItemAudio.length > 0) {
    // console.log("props.selectedItemAudio", props.selectedItemAudio);
    let audioListChild = props.selectedItemAudio.map((audioItem) => {
      return (
        <Grid item xs={12} sm={6} key={audioItem.id}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              borderRadius: 2,
              p: 1.5,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.light",
                borderRadius: "6px",
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
                minWidth: "48px",
                height: "48px",
              }}
            >
              <VolumeUp
                sx={{ color: "primary.contrastText", fontSize: "28px" }}
              />
            </Box>

            <CardContent sx={{ flex: 1, minWidth: 0, p: "8px !important" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    mb: 0.5,
                  }}
                >
                  {audioItem.name}
                </Typography>
                {audioItem._extra && (
                  <Tooltip
                    title={`Ajouté par ${audioItem.extra?.user?.firstAndLastName ?? ""} le ${audioItem.extra?.createdAt && isFinite(new Date(audioItem.extra.createdAt)) ? formatDate(audioItem.extra.createdAt) : "date invalide"}`}
                  >
                    <Info fontSize="small" sx={{ ml: 1 }} />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {Math.round((audioItem.size / 1024 + Number.EPSILON) * 100) /
                  100}{" "}
                {"Ko"} • {audioItem.duration}
              </Typography>
            </CardContent>

            <Box sx={{ display: "flex" }}>
              <IconButton
                onClick={() => handlePlay(audioItem.id, audioItem.name)}
                sx={{
                  color:
                    currentAudioId === audioItem.id
                      ? "primary.main"
                      : "text.secondary",
                }}
              >
                {currentAudioId === audioItem.id ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Box>
          </Card>
        </Grid>
      );
    });
    audioList = (
      <Grid container spacing={2} size={12}>
        {audioListChild}
      </Grid>
    );
  } else {
    audioList = (
      <Grid container spacing={2} size={12}>
        <Grid item>Ce dossier ne contient pas de fichiers audio</Grid>
      </Grid>
    );
  }

  const [showSelectPrintItem, setShowSelectPrintItem] = useState(false);
  const [emailSender, setEmailSender] = useState([]);
  const [affectEmail, setAffectEmail] = useState("");

  const getStatusLabel = (status) => {
    var statusElt = status;
    switch (status) {
      case "SAVED":
        statusElt = "Enregistrée";
        break;
      case "TEMP_SAVED":
        statusElt = "Sauvegardée";
        break;
      case "AFFECTED":
        statusElt = "Affectée";
        break;
      case "TO_APPROUVED":
        statusElt = "A approuver";
        break;
      case "DESAPPROUVED":
        statusElt = "Désapprouvée";
        break;
      case "TREAT":
        statusElt = "Traitée";
        break;
      case "SATISFIED":
        statusElt = "Satisfait";
        break;
      case "UNSATISFIED":
        statusElt = "Non satisfait";
        break;
      case "PARTIAL_SATISFIED":
        statusElt = "Partiellement satisfait";
        break;
      case "LITIGATION":
        statusElt = "Contentieux";
        break;
      case "CLASSED":
        statusElt = "Classée";
        break;

      default:
        statusElt = "";
        break;
    }

    return statusElt;
  };

  let content = props.items;
  const filteredContent = useMemo(() => {
    const chip = TREAT_CHIPS.find((c) => c.value === activeFilter);
    return chip ? content.filter(chip.filter) : content;
  }, [content, activeFilter]);
  let creationDate = props.created_at ? formatDate(props.created_at) : null;

  //Ajout de l'attribut "client" afin de permettre le filtrage dans le datatable
  content.forEach((element) => {
    //status
    let statusElt;

    switch (element.status) {
      case "SAVED":
        statusElt = "A traiter";
        break;
      case "AFFECTED":
        statusElt = "Affectée";
        break;
      case "TO_APPROUVED":
        statusElt = "A approuvée";

        break;
      case "DESAPPROUVED":
        statusElt = "Désapprouvée";
        break;
      case "CLASSED":
        statusElt = "Classée";
        break;
      case "UNSATISFIED":
        statusElt = "Non Satisfait";
        break;
      case "PARTIAL_SATISFIED":
        statusElt = "Partiellement Satisfait";
        break;
      default:
        statusElt = "";
        break;
    }

    element.statusStr = statusElt;

    let graviteElt;
    switch (element?.objet?.risqueLevel) {
      case "MINEUR":
        graviteElt = "Mineur";
        break;
      case "MOYEN":
        graviteElt = "Moyen";
        break;
      case "GRAVE":
        graviteElt = "Grave";
        break;
      default:
        graviteElt = "";
        break;
    }

    element.risqueLevel = graviteElt;

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

  let infosRec;
  let btnConversion;
  // console.log("a qui",props.handled_by)
  if (
    (props.handled_by === user.firstAndLastName && props.anonymat !== "true") ||
    props.handled_by !== user.firstAndLastName
  ) {
    // console.log("anonymedata",props.anonymat)
    infosRec = (
      <>
        <div className="row">
          <div className="col s12 m12">
            <div className="row" id="informationReclamant">
              <div className="col s12 pb-2">
                <h6 className="card-title">Informations du réclamant</h6>
              </div>
              <div className="row">
                <div className="col l6 s12 df pb-2" id="firstname">
                  <PersonIcon sx={{ mr: 2 }} /> {props.lastname}
                </div>

                <div className="col l6 s12 df pb-2" id="address">
                  <LocationOnIcon sx={{ mr: 2 }} /> {props.address}
                </div>

                <div className="col l6 s12 df pb-2" id="phone">
                  <CallIcon sx={{ mr: 2 }} /> {props.phone}
                </div>

                <div className="col l6 s12 df pb-2" id="gender">
                  <WcIcon sx={{ mr: 2 }} /> {props.gender}
                </div>
                {
                  (emailDisplay =
                    props.email !== "" ? (
                      <>
                        <div className="col l6 s12 df pb-2" id="email">
                          <EmailIcon sx={{ mr: 2 }} /> {props.email}
                        </div>
                      </>
                    ) : (
                      ""
                    ))
                }

                <div className="col l6 s12 df pb-2" id="language">
                  <LanguageIcon sx={{ mr: 2 }} /> {props.language}
                </div>
                {
                  (dimf =
                    props.dossierimf !== "" ? (
                      <>
                        <div className="col l6 s12 df pb-2" id="dossierimf">
                          {" "}
                          <FolderSharedIcon sx={{ mr: 2 }} /> {props.dossierimf}
                        </div>
                      </>
                    ) : (
                      ""
                    ))
                }
              </div>
            </div>
          </div>
          <br />
        </div>
      </>
    );
  } else {
    // console.log("anonymedata",props.anonymat)
    infosRec = "";
  }

  if (addR === "PILOTE" && props.status === "SAVED") {
    btnConversion = (
      <>
        <LoadingButton
          onClick={() => setConversionBoxOpen(true)}
          className="waves-effect waves-effect-b waves-light btn-small"
          // loading={props.etat3}
          loadingPosition="end"
          endIcon={<AutorenewIcon />}
          variant="contained"
          sx={{
            backgroundColor: "#ef6c00",
            textTransform: "initial",
            transition: "background-color 0.3s ease",
            "&:hover": {
              backgroundColor: "#fda321",
            },
          }}
        >
          <span>Convertir</span>
        </LoadingButton>
      </>
    );
  }

  let transmettre = "";
  let btnS = "";

  if (
    (addR !== "PILOTE" && !hbt.includes("H6")) &&
    ((user.firstAndLastName === props.created_by && props.transmitted === "false") ||
      (user.firstAndLastName === props.transmittedTo && props.transmitted === "true" && addR === "MOLDUE") ||
      (user.ra === true && props.transmitted === "false" && props.authorize)) &&
    props.status === "SAVED"
  ) {
    transmettre = (
      <>
        <LoadingButton
          onClick={(e) => handleModal(e)}
          className="waves-effect waves-effect-b waves-light btn-small ml-2 mb-1 mt-1"
          loading={props.etat3}
          loadingPosition="end"
          endIcon={<SendIcon />}
          variant="contained"
          sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
        >
          <span>Transmettre</span>
        </LoadingButton>
      </>
    );
  } else {
    transmettre = "";
  }

  // Vérifier si l'utilisateur est invité ou membre de la session

  // Peut ouvrir la session si auteur avec autorisation ou affecté
  const canOpenSession = isAuthorWithAuthorization || isAffectedUser || raCanOpenSession;

  // Détermination du bouton
  if (canOpenSession && (!props.session || props.session.status !== "OPEN")) {
    // Bouton "Ouvrir la session"
    btnS = (
      <LoadingButton
        onClick={registerUser}
        className="waves-effect waves-effect-b waves-light btn-small ml-2 mb-1 mt-1"
        loading={props.etat4}
        loadingPosition="end"
        endIcon={<ChatIcon />}
        variant="contained"
        sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
      >
        <span>Ouvrir une session</span>
      </LoadingButton>
    );

  } else if (props.session?.status === "OPEN" && showJoinBtn) {
    // Bouton "Rejoindre la session" si l'utilisateur est invité/membre
    btnS = (
      <LoadingButton
        onClick={connect}
        className="waves-effect waves-effect-b waves-light btn-small ml-2 mb-1 mt-1"
        loading={props.etat4}
        loadingPosition="end"
        endIcon={<ChatIcon />}
        variant="contained"
        sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
      >
        <span>Rejoindre la session</span>
      </LoadingButton>
    );

  } else if (props.session?.status === "CLOSED") {
    // Bouton "Voir la discussion"
    btnS = (
      <LoadingButton
        onClick={connect}
        className="waves-effect waves-effect-b waves-light btn-small"
        loading={props.etat4}
        loadingPosition="end"
        endIcon={<ChatIcon />}
        variant="contained"
        sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
      >
        <span>Voir la discussion</span>
      </LoadingButton>
    );

  } else {
    btnS = null;
  }


  const enfant = document.querySelector("#dialog-enfant");
  const confirmation = document.querySelector("#dialog-confirmation");
  const addFile = document.querySelector("#dialog-addFile");
  const noAccess = document.querySelector("#dialog-noAccess");
  const audioExtrat = document.querySelector("#dialog-audio");
  const contenuExtrat = document.querySelector("#dialog-contenu");
  const sendMailAffectation = document.querySelector("#dialog-email");

  const enfantOuvert = enfant && enfant.getAttribute("aria-hidden") !== "true";
  const confirmationOuvert =
    confirmation && confirmation.getAttribute("aria-hidden") !== "true";
  const addFileOuvert =
    addFile && addFile.getAttribute("aria-hidden") !== "true";
  const noAccessOuvert =
    noAccess && noAccess.getAttribute("aria-hidden") !== "true";
  const audioExtratOuvert =
    audioExtrat && audioExtrat.getAttribute("aria-hidden") !== "true";
  const contenuExtratOuvert =
    contenuExtrat && contenuExtrat.getAttribute("aria-hidden") !== "true";
  const sendMailAffectationOuvert =
    sendMailAffectation && sendMailAffectation.getAttribute("aria-hidden") !== "true";

  // Sélectionnez tous les éléments avec la classe spécifiée
  const elements = document.querySelectorAll(".MuiDialog-root");

  // Parcourez la liste d'éléments
  elements.forEach((element) => {
    if (
      [
        "dialog-enfant",
        "dialog-confirmation",
        "dialog-addFile",
        "dialog-noAccess",
        "dialog-audio",
        "dialog-contenu",
        "dialog-email",
      ].includes(element.id)
    ) {
      return;
    }

    if (
      element.hasAttribute("aria-hidden") &&
      element.getAttribute("aria-hidden") === "true" &&
      !enfantOuvert &&
      !confirmationOuvert &&
      !addFileOuvert &&
      !noAccessOuvert &&
      !audioExtratOuvert &&
      !contenuExtratOuvert &&
      !sendMailAffectationOuvert
    ) {
      element.style.display = "none";
    } else {
      element.style.display = "";
    }
  });

  useEffect(() => {

    if (inputRef.current) {
      inputRef.current.value = null;

    }
    // clearFiles();
  }, [filesForm.length]);

  const handleFileSubmit = (e, isFile = true) => {
    e.preventDefault();
    setExtraFileLoading(true);

    const formData = new FormData();
    formData.append("claim_id", props.id);

    if (isFile) {
      for (let index = 0; index < filesForm.length; index++) {
        formData.append("files", filesForm[index]);
      }
    } else if (audioListForm.length) {
      for (let index = 0; index < audioListForm.length; index++) {
        // Génère un timestamp unique
        const now = new Date();
        const date = now.toLocaleDateString("fr-FR").replaceAll("/", "");
        const time = now
          .toLocaleTimeString("fr-FR", { hour12: false })
          .replaceAll(":", "");

        // Crée un nom unique
        const fileName = `claim_extra_record_${date}_${time}_${index}.ogg`;

        const audioFile = new File(
          [audioListForm[index]],
          fileName,
          { type: "audio/ogg; codecs=opus" }
        );

        formData.append("audios", audioFile);
      }
    }


    addExtraClaimApi(formData)
      .then((res) => {

        if (isFile) {
          getFillesApi(currentData?.id, props);
          clearFiles();
          notify("Piece jointe ajoutée  ", "success");
        } else {
          getClaimAudioApi(currentData?.id, props);
          setOpen2(false);
          setAudioBox(false);
          setAudioListForm([]);
          setAudioListUrlForm([]);
          notify("Audio ajouté ", "success");
        }
      })
      .catch((err) => {

        notify("Une erreur s'est produite ", "error");
      })
      .then(() => {
        setExtraFileLoading(false);
      });
  };

  const handleContentSubmit = (e) => {
    e.preventDefault();
    setExtraFileLoading(true);
    const formData = new FormData();
    formData.append("claim_id", props.id);
    formData.append("contenu", extraContent);

    addExtraClaimApi(formData)
      .then((res) => {

        props.extrasChanged(res.data.content.extras ?? []);
        notify("Contenue joint ajoutée  ", "success");
        setShowExtraContent(false);
        setExtraContent("");
      })
      .catch((err) => {

        notify("Une erreur s'est produite ", "error");
      })
      .then(() => {
        setExtraFileLoading(false);
      });
  };

  return (
    <>
      <div id="main">
        {showExtraContent && (
          <div>
            {/* ── Modal Contenu ── */}
            <Dialog open={showExtraContent} fullWidth maxWidth="sm"
              onClose={() => setShowExtraContent(false)} id="dialog-contenu"
              PaperProps={{ style: { borderRadius: 16, padding: 8 } }}>
              <DialogContent>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingTop: 8 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Ajouter un contenu</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Ce contenu sera attaché au dossier</div>
                  </div>
                </div>
                <TextField fullWidth multiline minRows={5} value={extraContent}
                  onChange={(e) => { e.stopPropagation(); e.preventDefault(); setExtraContent(e.target.value); }}
                  placeholder="Saisissez le contenu..."
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </DialogContent>
              <DialogActions style={{ padding: "8px 20px 20px", gap: 8 }}>
                <LoadingButton fullWidth onClick={() => { setExtraContent(""); setShowExtraContent(false); }} variant="outlined"
                  sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b" }}>
                  Annuler
                </LoadingButton>
                <LoadingButton fullWidth onClick={handleContentSubmit} loading={extraFileLoading}
                  disabled={!extraContent?.trim()} loadingPosition="end" endIcon={<SaveIcon />} variant="contained"
                  sx={{ textTransform: "none", borderRadius: 2, background: "#7c3aed", "&:hover": { background: "#6d28d9" } }}>
                  <span>Enregistrer</span>
                </LoadingButton>
              </DialogActions>
            </Dialog>
          </div>
        )}

        {/* ── Modal Fichier ── */}
        {filesForm.length > 0 && (
          <Dialog open fullWidth maxWidth="sm" onClose={() => setFiles([])} id="dialog-addFile"
            PaperProps={{ style: { borderRadius: 16, padding: 8 } }}>
            <DialogContent>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingTop: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Ajouter des fichiers</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{filesForm.length} fichier{filesForm.length > 1 ? "s" : ""} sélectionné{filesForm.length > 1 ? "s" : ""}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filesForm.map((file, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                      <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{Math.round((file.size / 1024) * 100) / 100} Ko</div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
            <DialogActions style={{ padding: "8px 20px 20px", gap: 8 }}>
              <LoadingButton fullWidth onClick={() => setFiles([])} variant="outlined"
                sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b" }}>
                Annuler
              </LoadingButton>
              <LoadingButton fullWidth onClick={handleFileSubmit} loading={extraFileLoading}
                loadingPosition="end" endIcon={<SaveIcon />} variant="contained"
                sx={{ textTransform: "none", borderRadius: 2, background: "#15803d", "&:hover": { background: "#166534" } }}>
                <span>Enregistrer</span>
              </LoadingButton>
            </DialogActions>
          </Dialog>
        )}

        {/* ── Modal Audio ── */}
        {showAudioBox && (
          <Dialog open={open2} onClose={() => setOpen2(false)} id="dialog-audio" fullWidth maxWidth="sm"
            PaperProps={{ style: { borderRadius: 16, padding: 8 } }}>
            <DialogContent>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingTop: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Enregistrement audio</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Cliquez sur le micro et parlez</div>
                </div>
              </div>
              <section className="voice-recorder">
                <div className="recorder-container">
                  {audioListUrlForm.map((url, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <audio src={url} controls style={{ flex: 1, height: 36 }} />
                      <CloseIcon style={{ cursor: "pointer", color: "#94a3b8", fontSize: 18 }}
                        onClick={() => { setAudioListForm(audioListForm.filter((_, ind) => ind !== i)); setAudioListUrlForm(audioListUrlForm.filter((_, ind) => ind !== i)); }} />
                    </div>
                  ))}
                  <RecorderControls recorderState={recorderState} handlers={handlers} closeAction={() => {}} />
                </div>
              </section>
            </DialogContent>
            {audioListUrlForm.length > 0 && (
              <DialogActions style={{ padding: "8px 20px 20px", gap: 8 }}>
                <LoadingButton fullWidth onClick={() => { setAudioListForm([]); setAudioListUrlForm([]); setAudioBox(false); setOpen2(false); }} variant="outlined"
                  sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b" }}>
                  Annuler
                </LoadingButton>
                <LoadingButton fullWidth onClick={(e) => handleFileSubmit(e, false)} loading={extraFileLoading}
                  loadingPosition="end" endIcon={<SaveIcon />} variant="contained"
                  sx={{ textTransform: "none", borderRadius: 2, background: "#1d4ed8", "&:hover": { background: "#1e40af" } }}>
                  <span>Enregistrer</span>
                </LoadingButton>
              </DialogActions>
            )}
          </Dialog>
        )}
        <audio ref={audioRef} src={currentAudio} hidden />

        {props.match.params.code === "all" ? (
          <div className="row">
            <div className="col s12">
              <div className="container">
                <section className="tabs-vertical mt-1 section">
                  <div className="row">
                    <div className="col l12 s12 pb-5">
                      <div className="card-panel pb-5">
                        <ClaimsKPIBar items={content} />
                        {/* ── Chips de filtre ── */}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2, pb: 2, borderBottom: "1px solid #F1F5F9" }}>
                          {TREAT_CHIPS.map((chip) => {
                            const count = content.filter(chip.filter).length;
                            const isActive = activeFilter === chip.value;
                            if (chip.value !== "ALL" && count === 0) return null;
                            return (
                              <ButtonBase key={chip.value} onClick={() => setActiveFilter(chip.value)} sx={{ borderRadius: "20px", px: 1.5, py: 0.5, border: isActive ? "1.5px solid #93C5FD" : "1.5px solid #E2E8F0", backgroundColor: isActive ? "#EFF6FF" : "#FAFAFA", color: isActive ? "#1D4ED8" : "#64748B", fontWeight: isActive ? 700 : 500, fontSize: "0.78rem", transition: "all 0.18s", display: "flex", alignItems: "center", gap: 0.8, "&:hover": { backgroundColor: "#EFF6FF", color: "#1D4ED8", borderColor: "#93C5FD" } }}>
                                <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit", lineHeight: 1.4 }}>{chip.label}</Typography>
                                <Box sx={{ minWidth: 20, height: 20, borderRadius: "10px", backgroundColor: isActive ? "#1D4ED8" : "#E2E8F0", color: isActive ? "#fff" : "#64748B", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", px: 0.6 }}>{count}</Box>
                              </ButtonBase>
                            );
                          })}
                        </Box>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                          <h5 className="card-title" style={{ fontWeight: 700, color: "#0F172A", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                            Réclamations à traiter
                            <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "#64748B", background: "#F1F5F9", borderRadius: 8, padding: "2px 10px" }}>
                              {filteredContent.length} résultat{filteredContent.length !== 1 ? "s" : ""}
                            </span>
                          </h5>
                          <Box sx={{ display: "inline-flex", borderRadius: "10px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                            <Tooltip title="Vue liste">
                              <Box onClick={() => setViewMode("list")} sx={{ px: 1.4, py: 0.8, cursor: "pointer", backgroundColor: viewMode === "list" ? "#6366F1" : "#F8FAFC", color: viewMode === "list" ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.18s" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                              </Box>
                            </Tooltip>
                            <Tooltip title="Vue cartes">
                              <Box onClick={() => setViewMode("card")} sx={{ px: 1.4, py: 0.8, cursor: "pointer", backgroundColor: viewMode === "card" ? "#6366F1" : "#F8FAFC", color: viewMode === "card" ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.18s" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                              </Box>
                            </Tooltip>
                          </Box>
                        </div>
                        <div>
                          {viewMode === "list" ? (
                            <ClaimsTable
                              items={filteredContent}
                              mode={1}
                              objets={[]}
                              onRowClick={(data) => rowClickedHandler(null, data, 0)}
                              statusOptions={TREAT_STATUS_OPTIONS}
                              currentUser={user}
                            />
                          ) : (
                            <ClaimsCardView
                              items={filteredContent}
                              mode={1}
                              objets={[]}
                              onCardClick={(data) => rowClickedHandler(null, data, 0)}
                              currentUser={user}
                            />
                          )}
                          <div id="tab_exl" style={{ display: "none" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div className="content-overlay"></div>
            </div>
          </div>
        ) : (
          /* ── TREATMENT PAGE — TraitementShell ── */
          <TraitementShell
            onBack={() => history.push('/reclamations/traitement/all')}
            codeClient={props.codeClient || props.code}
            status={props.status}
            risqueLevel={dataRow?.objet?.risqueLevel}

            lastname={props.lastname}
            phone={props.phone}
            email={props.email}
            address={props.address}
            language={props.language}
            gender={props.gender}
            dossierimf={props.dossierimf}

            recorded_at={props.recorded_at}
            collect={props.collect}
            subject={props.subject}
            underSubject={props.underSubject}
            product={props.product}
            unit={props.unit}
            created_by={props.created_by}
            creationDate={creationDate}
            content={props.content}
            extras={props.extras}
            onAddContent={() => { setShowExtraContent(true); setExtraContent(''); }}

            visibleActions={[
              addR === "PILOTE" && props.status === "SAVED" && 'convertir',
              (hbt.includes("H6") || addR === "PILOTE" || user.ra === true) && props.status === "SAVED" && props.transmitted !== "true" && 'affecter',
              (hbt.includes("H6") || addR === "PILOTE" || user.ra === true) && ["AFFECTED","UNSATISFIED","PARTIAL_SATISFIED","CLASSED"].includes(props.status) && 'reaffecter',
              (addR !== "PILOTE" && !hbt.includes("H6")) && props.status === "SAVED" && props.transmitted === "false" && (user.firstAndLastName === props.created_by || user.ra === true) && 'transmettre',
              (hbt.includes("H6") || addR === "PILOTE") && props.status === "TO_APPROUVED" && 'approuver',
            ].filter(Boolean)}

            selectedItemFiles={props.selectedItemFiles}
            selectedItemAudio={props.selectedItemAudio}
            attachmentList={attachmentList}
            audioList={audioList}
            inputRef={inputRef}
            onFilesChange={(e) => setFiles([...e.target.files])}
            onAddAudio={() => { setAudioBox(true); setOpen2(true); }}

            transmitted={props.transmitted}
            transmittedBy={props.transmittedBy}
            transmittedTo={props.transmittedTo}
            handled_by={props.handled_by}
            assigned_by={props.assigned_by}
            assignedAt={props.assignedAt}
            solution={props.solution}

            treatForm={treatForm}
            onTreat={handleReSolve}
            loadingTreat={props.etat2}
            canTreat={
              (props.handled_by === user.firstAndLastName && Boolean(props.authorize)) ||
              (props.created_by === user.firstAndLastName && props.unit && user?.servicePointDto?.libelle && props.unit === user.servicePointDto.libelle)
            }
            existingSolutions={props.selectedItem?.objet?.existingSolutions || []}
            onModifyBeforeSend={(content) => {
              props.solutionChanged(content);
              props.newSolutionChanged(content);
              // Pré-remplir aussi le commentaire pour que la validation passe
              if (!props.comment) props.commentChanged("Solution pré-enregistrée");
              if (!props.new_comment) props.newCommentChanged("Solution pré-enregistrée");
            }}
            onUseAndTreat={(content, id) => handleSolveImmediate(content, id)}
            btnS={btnS}
            transmettre={transmettre}
            session={props.session}

            tchat={tchat}

            agentsOptions={agentsMailOptions}
            onAgentChange={(e) => { props.handledByChanged(e.value); setAffectEmail(e.email); }}
            anonymat={anonymat}
            onAnonymatChange={handleAnonymat}
            onConfirmAffecter={prepareBeforeAssign}
            confirmOpen={confirmationOpen}
            convertionType={convertionType}
            onSelectType={(type) => { setConvertionType(type); setConfirmationOpen(true); }}
            onConfirmClose={handleConfirmationClose}
            onSubmitConfirmation={(e) => { e.preventDefault(); handleSubmitConfirmation(e); }}
            loadingConversion={loadingConversion}
            onConfirmTransmettre={handleTransmission}
            loadingTransmettre={props.etat3}
            motif={props.motif}
            onMotifChange={(val) => props.motifChanged(val)}
            onApprove={handleApprove}
            onDisapprove={handleDisapprove}
            loadingApprove={props.etat2}
            loadingDisapprove={props.etat}
            modalErrors={props.errors}
            emailDialogSlot={<EmailDialog handleSubmit={handleAssignOrReassign} maxDelai={maxDelai} />}
          />
        )}
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    isLoading: state.claim_handle.isLoading,
    id: state.claim_handle.id,
    firstname: state.claim_handle.firstname,
    lastname: state.claim_handle.lastname,
    address: state.claim_handle.address,
    phone: state.claim_handle.phone,
    gender: state.claim_handle.gender,
    language: state.claim_handle.language,
    dossierimf: state.claim_handle.dossierimf,
    code: state.claim_handle.code,
    codeClient: state.claim_handle.codeClient,
    recorded_at: state.claim_handle.recorded_at,
    collect: state.claim_handle.collect,
    subject: state.claim_handle.subject,
    underSubject: state.claim_handle.underSubject,
    product: state.claim_handle.product,
    unit: state.claim_handle.unit,
    content: state.claim_handle.content,
    extras: state.claim_handle.extras,
    status: state.claim_handle.status,
    motif: state.claim_handle.motif,
    crew: state.claim_handle.crew,
    solution: state.claim_handle.solution,
    solutionId: state.claim_handle.solutionId,
    objetLevel: state.claim_handle.objetLevel,
    comment: state.claim_handle.comment,
    new_solution: state.claim_handle.new_solution,
    new_comment: state.claim_handle.new_comment,
    created_by: state.claim_handle.created_by,
    created_at: state.claim_handle.created_at,
    assigned_by: state.claim_handle.assigned_by,
    handled_at: state.claim_handle.handled_at,
    handled_by: state.claim_handle.handled_by,
    assignedAt: state.claim_handle.assignedAt,
    resolved_at: state.claim_handle.resolved_at,
    resolved_by: state.claim_handle.resolved_by,
    errors: state.claim_handle.claim_handle_errors,
    items: state.claim_handle.items,
    agents: state.claim_handle.agents,
    selectedItem: state.claim_handle.selectedItem,
    selectedFiles: state.claim_handle.selectedFiles,
    selectedItemFiles: state.claim_handle.selectedItemFiles,
    selectedItemAudio: state.claim_handle.selectedItemAudio,
    authorize: state.claim_handle.authorize,
    etat: state.claim_handle.etat,
    etat2: state.claim_handle.etat2,
    etat3: state.claim_handle.etat3,
    etat4: state.claim_handle.etat4,
    anonymat: state.claim_handle.anonymat,
    transmitted: state.claim_handle.transmitted,
    transmittedTo: state.claim_handle.transmittedTo,
    transmittedBy: state.claim_handle.transmittedBy,
    session: state.claim_handle.session,
    solutionExistant: state.claim_handle.solutionExistant,
    reaffect: state.claim_handle.reaffect,
    handled_message: state.claim_handle.handled_message,
    handled_delai: state.claim_handle.handled_delai,
    email: state.claim_handle.email,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loading: (err) => {
      dispatch(loading(err));
    },
    claimHandleErrors: (err) => {
      dispatch(claimHandleErrors(err));
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
    dossierimfChanged: (dossierimf) => {
      dispatch(dossierimfChanged(dossierimf));
    },
    emailChanged: (email) => {
      dispatch(emailChanged(email));
    },
    codeChanged: (code) => {
      dispatch(codeChanged(code));
    },
    recordedAtChanged: (recordedAt) => {
      dispatch(recordedAtChanged(recordedAt));
    },
    collectChanged: (collect) => {
      dispatch(collectChanged(collect));
    },
    extrasChanged: (extra) => {
      dispatch(extrasChanged(extra));
    },
    subjectChanged: (subject) => {
      dispatch(subjectChanged(subject));
    },
    underSubjectChanged: (underSubject) => {
      dispatch(underSubjectChanged(underSubject));
    },
    objetLevelChanged: (objetLevel) => {
      dispatch(objetLevelChanged(objetLevel));
    },
    productChanged: (product) => {
      dispatch(productChanged(product));
    },
    unitChanged: (unit) => {
      dispatch(unitChanged(unit));
    },
    contentChanged: (content) => {
      dispatch(contentChanged(content));
    },
    statusChanged: (status) => {
      dispatch(statusChanged(status));
    },
    motifChanged: (motif) => {
      dispatch(motifChanged(motif));
    },
    solutionChanged: (solution) => {
      dispatch(solutionChanged(solution));
    },
    solutionIdChanged: (solutionId) => {
      dispatch(solutionIdChanged(solutionId));
    },
    handledShowModalChanged: (isShow) => {
      dispatch(handledShowModalChanged(isShow));
    },
    handledMessageChanged: (message) => {
      dispatch(handledMessageChanged(message));
    },
    handledDelaiChanged: (delai) => {
      dispatch(handledDelaiChanged(delai));
    },
    handledCustomMessageChanged: (close) => {
      dispatch(handledCustomMessageChanged(close));
    },

    commentChanged: (comment) => {
      dispatch(commentChanged(comment));
    },
    handledByChanged: (handledBy) => {
      dispatch(handledByChanged(handledBy));
    },
    createdAtChanged: (createdAt) => {
      dispatch(createdAtChanged(createdAt));
    },
    createdByChanged: (createdBy) => {
      dispatch(createdByChanged(createdBy));
    },
    assignedByChanged: (assignedBy) => {
      dispatch(assignedByChanged(assignedBy));
    },
    assignedAtChanged: (assignedAt) => {
      dispatch(assignedAtChanged(assignedAt));
    },
    itemsChanged: (items) => {
      dispatch(itemsChanged(items));
    },
    agentsChanged: (agents) => {
      dispatch(agentsChanged(agents));
    },
    selectedItemChanged: (selectedItem) => {
      dispatch(selectedItemChanged(selectedItem));
    },
    selectedFilesReset: (selectedFiles) => {
      dispatch(selectedFilesReset(selectedFiles));
    },
    selectedItemFilesChanged: (selectedItemFiles) => {
      dispatch(selectedItemFilesChanged(selectedItemFiles));
    },
    selectedItemAudioChanged: (selectedItemAudio) => {
      dispatch(selectedItemAudioChanged(selectedItemAudio));
    },
    authorizeChanged: (item) => {
      dispatch(authorizeChanged(item));
    },
    crewChanged: (crew) => {
      dispatch(crewChanged(crew));
    },
    newSolutionChanged: (solution) => {
      dispatch(newSolutionChanged(solution));
    },
    newCommentChanged: (comment) => {
      dispatch(newCommentChanged(comment));
    },
    etatChanged: (etat) => {
      dispatch(etatChanged(etat));
    },
    etat2Changed: (etat2) => {
      dispatch(etat2Changed(etat2));
    },
    etat3Changed: (etat3) => {
      dispatch(etat3Changed(etat3));
    },
    etat4Changed: (etat4) => {
      dispatch(etat4Changed(etat4));
    },
    anonymatChanged: (anonymat) => {
      dispatch(anonymatChanged(anonymat));
    },
    transmittedChanged: (transmitted) => {
      dispatch(transmittedChanged(transmitted));
    },
    transmittedToChanged: (transmittedTo) => {
      dispatch(transmittedToChanged(transmittedTo));
    },
    transmittedByChanged: (transmittedBy) => {
      dispatch(transmittedByChanged(transmittedBy));
    },
    sessionChanged: (session) => {
      dispatch(sessionChanged(session));
    },
    solutionExistantChanged: (solutionExistant) => {
      dispatch(solutionExistantChanged(solutionExistant));
    },
    codeClientChanged: (codeClient) => {
      dispatch(codeClientChanged(codeClient));
    },

    setReaffect: (reaffect) => {
      dispatch(setReaffect(reaffect));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TraiterReclamation);
