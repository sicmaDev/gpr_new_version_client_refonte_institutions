import React, { useEffect, useMemo, useRef, useState } from "react";
import FileTypeIcon from "../../components/shared/FileTypeIcon";
import ClaimStatusBadge from "./components/ClaimStatusBadge";
import ClaimGravityBadge from "./components/ClaimGravityBadge";
import ClaimsKPIBar from "./components/ClaimsKPIBar";
import ClaimsFilterBar from "./components/ClaimsFilterBar";
import ClaimsTable from "./components/ClaimsTable";
import ClaimsCardView from "./components/ClaimsCardView";
import TraitementShell from "../../components/treatment/TraitementShell";
import HistoriqueTimeline from "../../components/treatment/HistoriqueTimeline";
import FichiersTab from "../../components/treatment/FichiersTab";
import WaCommentBadge from "../../whatgpr/components/WaCommentBadge";
import WaAudioSection from "../../whatgpr/components/WaAudioSection";
import AudioGrid from "../../whatgpr/components/AudioGrid";
import useWaAudioJump from "../../whatgpr/hooks/useWaAudioJump";
import { splitWaAudios } from "../../whatgpr/utils";
import axios from "axios";
import ReactDatatable from "@ashvin27/react-datatable";
import Select from "react-select";
import DatePicker from "react-datepicker";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteIcon from "@mui/icons-material/Delete";
import TextField from "@mui/material/TextField";
import { KTApp } from "../../Utils/blockui";
import { modalify } from "../../Utils/modal";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import {
  addressChanged,
  agentsChanged,
  appraisalChanged,
  appraisedAtChanged,
  appraisedByChanged,
  approvedAtChanged,
  approvedByChanged,
  assignedAtChanged,
  assignedByChanged,
  claimListErrors,
  codeChanged,
  codeClientChanged,
  commentChanged,
  contentChanged,
  createdAtChanged,
  firstnameChanged,
  genderChanged,
  handledAtChanged,
  handledByChanged,
  idChanged,
  itemsChanged,
  languageChanged,
  lastnameChanged,
  loading,
  motifChanged,
  phoneChanged,
  productChanged,
  recordedAtChanged,
  resolvedAtChanged,
  resolvedByChanged,
  selectedItemChanged,
  solutionChanged,
  statusChanged,
  subjectChanged,
  collectChanged,
  dossierimfChanged,
  unitChanged,
  externalRemediesChanged,
  createdByChanged,
  selectedFilesReset,
  selectedItemFilesChanged,
  selectedItemAudioChanged,
  showSelectPrintItemChanged,
  crewChanged,
  createdAtOnlineChanged,
  underSubjectChanged,
  sessionChanged,
  extrasChanged,
  emailChanged
} from "../../redux/actions/Reclamations/ListeReclamationsActions";
import http from "../../apis/http-common";
import {
  addExtraClaimApi,
  downloadAudioApi,
  downloadFillesApi,
  getClaimAudioApi,
  getFillesApi,
  listeTousStatuts,
  listeTousStatutsOffline,
  deleteFileApi,
  deleteAudioApi,
  deleteExtraContentApi,
} from "../../apis/Reclamations/ReclamationsApi";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PrintIcon from "@mui/icons-material/Print";
import EmailIcon from '@mui/icons-material/Email';
import { connect } from "react-redux";

// import { loadItemFromSessionStorage, today } from "../../utils/utils";
// import { v4 as uuidv4 } from "uuid";
// import { formatDate, guessExtension } from "../../utils";
import {
  handlePrint,
  handlePrint2,
  handlePrint22,
  handlePrintAvance,
} from "../../Utils/tables";

import {
  table2XLSX,
  table2XLS2X,
  table2XLS2XF,
} from "../../Utils/tabletoexcel";
// import { useLocation } from "react-router-dom";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
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
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import excel from "../../assets/images/excel.svg";
import pdf from "../../assets/images/pdf.svg";
import timelineOppositeContentClasses from "@mui/lab/TimelineOppositeContent";
import {
  formatDate,
  formatDate2,
  formatDate3,
  formatDate4,
  guessExtension,
  loadItemFromLocalStorage,
  loadItemFromSessionStorage,
  today,
} from "../../Utils/utils";
import {
  Avatar,
  Box,
  CardContent,
  Grid,
  Tooltip,
  List,
  ListItemButton,
  ListItemText,
  Card,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import GavelIcon from "@mui/icons-material/Gavel";
import StopIcon from "@mui/icons-material/Stop";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

import {
  HOST,
  INSTITUTION_ADDRESS,
  INSTITUTION_AGREMENT,
  INSTITUTION_EMAIL,
  INSTITUTION_LOGO,
  INSTITUTION_NAME,
  INSTITUTION_TEL,
} from "../../Utils/globals";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import SaveIcon from "@mui/icons-material/Save";
import { LoadingButton } from "@mui/lab";
import { notify } from "../../Utils/alert";
import { showModalChanged } from "../../redux/actions/Reclamations/HistoriqueReclamationActions";
import HistoriqueAffectation from "../../components/HistoriqueAffectation";

const styles = {
  control: (base) => ({
    ...base,
    height: 35,
    minHeight: 35,
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ListeReclamations = (props) => {
  let dimf, crew, emailDisplay;
  const { waAudios, regularAudios } = splitWaAudios(props.selectedItemAudio);
  const { highlightedAudioId, handleJumpToWhatsappAudioComment } = useWaAudioJump(waAudios);
  const [open, setOpen] = React.useState(false);
  const [interne, setInterne] = React.useState(false);
  const [changeButtonPrint, setChangeButtonPrint] = useState(false);
  const [impression, setImpression] = React.useState(false);
  const [showAudioPlayer, setAudioPlayer] = useState("");
  const [currentAudio, setCurrentAudio] = useState("");
  const [fond_, setFond] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("list"); // "list" | "card"
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getStatusLabel = (status) => {
    var statusElt = status;
    switch (status) {
      case "SAVED":
        statusElt = "À traiter";
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

  let user =
    loadItemFromSessionStorage("app-user") !== undefined
      ? loadItemFromSessionStorage("app-user")
      : undefined;
  let hbt = user.posteDto.habilitations.split(",");
  let addR = user.additionalRole;

  useEffect(() => { }, [showAudioPlayer, currentAudio]);

  let mode =
    loadItemFromLocalStorage("app-mode") !== undefined
      ? loadItemFromLocalStorage("app-mode")
      : undefined;

  let objets =
    loadItemFromLocalStorage("app-objets") !== undefined
      ? loadItemFromLocalStorage("app-objets")
      : undefined;

  const [currentData, setCurrentData] = useState(null);
  const [audioListForm, setAudioListForm] = useState([]);
  const [audioListUrlForm, setAudioListUrlForm] = useState([]);
  const [historiqueItems, setHistoriqueItems] = useState([]);
  const [historiqueLoading, setHistoriqueLoading] = useState(false);
  const [histAccordions, setHistAccordions] = useState({ affectations: false, solutions: false, flux: true });
  const toggleHistAcc = (key) => setHistAccordions(prev => ({ affectations: false, solutions: false, flux: false, [key]: !prev[key] }));

  const loadHistorique = (claimId) => {
    if (!claimId) return;
    setHistoriqueLoading(true);
    setHistoriqueItems([]);
    axios({
      method: "get",
      url: HOST + "api/v1/historique-affectation/list/" + claimId,
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + loadItemFromSessionStorage("token") },
    }).then(({ data }) => {
      setHistoriqueItems(data.content || []);
    }).catch(() => {}).finally(() => setHistoriqueLoading(false));
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const [currentAudioId, setCurrentAudioId] = useState("");
  const audioRef = useRef(null);
  const [filesForm, setFiles] = useState([]);
  const inputRef = useRef(null);
  const [showExtraContent, setShowExtraContent] = useState(false);
  const [extraContent, setExtraContent] = useState("");
  const [extraFileLoading, setExtraFileLoading] = useState(false);
  const [claim_id, setClaimId] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const clearFiles = () => {
    if (inputRef.current) {
      inputRef.current.value = null;
    }
    setFiles([]);
  };

  const history = useHistory();

  // Chargement depuis l'URL ou sessionStorage quand on arrive directement sur /reclamations/liste/:code
  useEffect(() => {
    const urlCode = props.match?.params?.code;
    const code = (urlCode && urlCode !== "all") ? urlCode : sessionStorage.getItem('gpr_rec_code');
    if (code) {
      setDetailVisible(true);
      axios({
        method: "get",
        url: HOST + "api/v1/claim/" + code + "/details",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + loadItemFromSessionStorage("token"),
        },
      }).then((cc) => {
        if (cc.status >= 200 && cc.status <= 299) {
          const data = cc.data.content;
          props.lastnameChanged(data.clientFirstAndLastName ?? "");
          props.firstnameChanged(data.clientFirstAndLastName ?? "");
          props.addressChanged(data.address ?? "");
          props.phoneChanged(data.tel ?? "");
          props.genderChanged(data.gender ?? "");
          props.languageChanged(data.language?.libelle ?? "");
          props.dossierimfChanged(data.folderCode ?? "");
          props.emailChanged(data.email ?? "");
          props.codeChanged(data.code ?? "");
          props.codeClientChanged(data.codeClient ?? "");
          props.recordedAtChanged(data.receiptDateTime ?? "");
          props.collectChanged(data.collectionChannel?.libelle ?? "");
          props.subjectChanged(data.objet?.libelle ?? "");
          props.underSubjectChanged(data.objet?.categorie?.libelle ?? "");
          props.productChanged(data.product?.libelle ?? "");
          props.unitChanged(data.servicePoint?.libelle ?? "");
          props.contentChanged(data.content ?? "");
          props.solutionChanged(data.solutionDtos ?? []);
          props.externalRemediesChanged(data.externalRecourses ?? null);
          props.statusChanged(data.status ?? "");
          props.createdByChanged(data.collector?.firstAndLastName ?? "");
          props.createdAtChanged(data.createdAt ?? "");
          props.assignedAtChanged(data.affectedAt ?? "");
          props.assignedByChanged(data.treatmentAffectedBy?.firstAndLastName ?? "");
          props.handledByChanged(data.treatmentAffectedTo?.firstAndLastName ?? "");
          props.idChanged(data.id ?? "");
          props.sessionChanged(data.session ?? "");
          props.selectedItemChanged(data);
          setCurrentData(data);
          props.extrasChanged(data.extras ?? []);
          setClaimId(data.id);
          setDetailVisible(true);
          getFillesApi(data.id, props);
          getClaimAudioApi(data.id, props);
          loadHistorique(data.id);
        }
      }).catch(() => {});
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    setInterne(false);
    clearComponentState();
  };


  const handleInterne = () => {
    setInterne(true);
  };

  const handleExterne = () => {
    setInterne(false);
  };
  const handleImpression = () => {
    setImpression(!impression);
    setStartDate(null);
    setEndDate(null);
  };

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  const { recorderState, ...handlers } = useRecorder();
  let { audio } = recorderState;

  const [open2, setOpen2] = useState(false);
  const [showAudioBox, setAudioBox] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (audio) {
      setAudioListForm([...audioListForm, audio]);
      setAudioListUrlForm([...audioListUrlForm, URL.createObjectURL(audio)]);
    }
  }, [audio]);

  useEffect(() => {
    const hasDetailCode = (() => {
      const urlCode = props.match?.params?.code;
      return (urlCode && urlCode !== "all") || !!sessionStorage.getItem('gpr_rec_code');
    })();

    if (!hasDetailCode) {
      KTApp.blockPage({
        overlayColor: "#000000",
        type: "v2",
        state: "danger",
        message: "En cours de chargement...",
      });
    }
    setIsLoading(true);

    if (mode === 1) {
      props.itemsChanged([]);
      listeTousStatuts(props)
        .then((r) => { })
        .finally(() => {
          setIsLoading(false);
          if (!hasDetailCode) KTApp.unblockPage();
        });
    } else {
      props.itemsChanged([]);
      listeTousStatutsOffline(props)
        .then((r) => { })
        .finally(() => {
          setIsLoading(false);
          if (!hasDetailCode) KTApp.unblockPage();
        });
    }
    //couleurs
    let couleurs = [
      "#333300",
      "#00cc00",
      "#99003d",
      "#3333ff",
      "#666666",
      "#253858",
      "#00875A",
      "#36B37E",
      "#FFC400",
      "#FF8B00",
      "#FF5630",
      "#5243AA",
      "#0052CC",
      "#00B8D9",
    ];
    setFond(couleurs[getRandomInt(couleurs.length)]);
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
  }, []);
  //Handling the List
  let columns = [
    {
      key: "codeClient",
      text: "Code client",
      className: "codeClient",
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
              <span className="chip toTreatBgColor">
                <span className="">À traiter</span>
              </span>
            );
            break;
          case "TEMP_SAVED":
            statusElt = (
              <span className="chip indigo lighten-5">
                <span className="">Sauvegardée</span>
              </span>
            );
            break;
          case "AFFECTED":
            statusElt = (
              <span className="chip affectedBgColor">
                <span className="">Affectée</span>
              </span>
            );
            break;
          case "TO_APPROUVED":
            statusElt = (
              <span className="chip toApprouvedBgColor">
                <span className="">A appouver</span>
              </span>
            );
            break;
          case "DESAPPROUVED":
            statusElt = (
              <span className="chip unapprouvedBgColor">
                <span className="">Désapprouvée</span>
              </span>
            );
            break;
          case "TREAT":
            statusElt = (
              <span className="chip treatBgColor">
                <span className="">Traitée</span>
              </span>
            );
            break;
          case "SATISFIED":
            statusElt = (
              <span className="chip satisfiedBgColor">
                <span className="">Satisfait</span>
              </span>
            );
            break;
          case "UNSATISFIED":
            statusElt = (
              <span className="chip unSatisfiedBgColor">
                <span className="">Non Satisfait</span>
              </span>
            );
            break;
          case "PARTIAL_SATISFIED":
            statusElt = (
              <span className="chip partialBgColor">
                <span className="">Partiellement Satisfait</span>
              </span>
            );
            break;
          case "LITIGATION":
            statusElt = (
              <span className="chip litigationBgColor">
                <span className="">Contentieux</span>
              </span>
            );
            break;
          case "CLASSED":
            statusElt = (
              <span className="chip classedBgColor">
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
        let cmp;
        let graviteElt;
        if (mode === 1) {
          cmp = claim.objet.risqueLevel;
        } else {
          if (claim.id !== "") {
            cmp = claim.objet.risqueLevel;
          } else {
            let idO = objets.filter((e) => {
              return e.id === claim.objetId;
            });
            cmp = idO[0].risqueLevel;
          }
        }
        switch (cmp) {
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
            graviteElt = <span className="orange-text text-bold">Moyen</span>;
            break;
          case "GRAVE":
            graviteElt = (
              <span className="materialize-red-text text-bold">Grave</span>
            );
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
        if (
          claim.status !== "SATISFIED" &&
          claim.status !== "UNSATISFIED" &&
          claim.status !== "PARTIAL_SATISFIED" &&
          claim.status !== "LITIGATION"
        ) {
          if (claim.retardDay > 0) {
            temps = claim.declenchedDate;
          } else {
            temps = (
              <div className="card-content red-text">
                <WarningIcon />
              </div>
            );
          }
        } else {
          temps = "-";
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
    filename: "Liste des réclamations",
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
        last: <LastPageIcon />,
      },
    },
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
    props.subjectChanged("");
    props.codeChanged("");
    props.codeClientChanged("");
    props.recordedAtChanged("");
    props.collectChanged("");
    props.crewChanged("");
    props.productChanged("");
    props.unitChanged("");
    props.contentChanged("");
    props.solutionChanged("");
    props.commentChanged("");
    props.motifChanged("");
    props.statusChanged("");
    props.createdByChanged("");
    props.createdAtChanged("");
    props.createdAtOnlineChanged("");
    props.assignedAtChanged("");
    props.assignedByChanged("");
    props.handledAtChanged("");
    props.handledByChanged("");
    props.approvedAtChanged("");
    props.approvedByChanged("");
    props.appraisedAtChanged("");
    props.appraisedByChanged("");
    props.appraisalChanged("");
    props.claimListErrors("");
    props.selectedItemChanged({});
    props.selectedFilesReset([]);
    props.selectedItemFilesChanged([]);
    props.selectedItemAudioChanged([]);
    setCurrentAudio("");
    setAudioPlayer("");
  };

  const rowClickedHandler = (event, data, rowIndex) => {
    clearComponentState();
    sessionStorage.setItem('gpr_rec_code', data.code);
    history.push('/reclamations/liste/' + data.code);
    setDetailVisible(true);
    setClaimId(data.id);

    if (mode === 1) {
      props.lastnameChanged(
        data.clientFirstAndLastName ? data.clientFirstAndLastName : ""
      );
      props.firstnameChanged(
        data.clientFirstAndLastName ? data.clientFirstAndLastName : ""
      );
      props.addressChanged(data.address ? data.address : "");
      props.phoneChanged(data.tel ? data.tel : "");
      props.genderChanged(data.gender ? data.gender : "");
      props.languageChanged(data.language.libelle ? data.language.libelle : "");
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
      props.productChanged(data.product.libelle ? data.product.libelle : "");
      props.unitChanged(
        data.servicePoint.libelle ? data.servicePoint.libelle : ""
      );
      props.contentChanged(data.content ? data.content : "");
      props.solutionChanged(data.solutionDtos ? data.solutionDtos : "");
      props.externalRemediesChanged(
        data.externalRecourses !== null ? data.externalRecourses : null
      );
      props.statusChanged(data.status ? data.status : "");
      props.createdByChanged(
        data.collector.firstAndLastName ? data.collector.firstAndLastName : ""
      );
      props.createdAtChanged(data.createdAt ? data.createdAt : "");
      props.createdAtOnlineChanged(
        data.onlineUploadDateTime ? data.onlineUploadDateTime : ""
      );
      props.assignedAtChanged(data.affectedAt ? data.affectedAt : "");
      props.assignedByChanged(
        data.treatmentAffectedBy
          ? data.treatmentAffectedBy.firstAndLastName
          : ""
      );
      props.handledByChanged(
        data.treatmentAffectedTo
          ? data.treatmentAffectedTo.firstAndLastName
          : ""
      );
      props.sessionChanged(data.session !== null ? data.session : "");
      props.selectedItemChanged(data);
      setCurrentData(data);

      getFillesApi(data.id, props);
      getClaimAudioApi(data.id, props);
      props.extrasChanged(data.extras ?? []);
      loadHistorique(data.id);
    } else {
      if (data.id && data.collectionChannel) {
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
        props.productChanged(data.product.libelle ? data.product.libelle : "");
        props.unitChanged(
          data.servicePoint.libelle ? data.servicePoint.libelle : ""
        );
        props.contentChanged(data.content ? data.content : "");
        props.solutionChanged(data.solutionDtos ? data.solutionDtos : "");
        props.externalRemediesChanged(
          data.externalRecourses !== null ? data.externalRecourses : null
        );
        props.statusChanged(data.status ? data.status : "");
        props.createdByChanged(
          data.collector.firstAndLastName ? data.collector.firstAndLastName : ""
        );
        props.createdAtChanged(data.createdAt ? data.createdAt : "");
        props.createdAtOnlineChanged(
          data.onlineUploadDateTime ? data.onlineUploadDateTime : ""
        );
        props.assignedAtChanged(data.affectedAt ? data.affectedAt : "");
        props.assignedByChanged(
          data.treatmentAffectedBy
            ? data.treatmentAffectedBy.firstAndLastName
            : ""
        );
        props.handledByChanged(
          data.treatmentAffectedTo
            ? data.treatmentAffectedTo.firstAndLastName
            : ""
        );
        props.sessionChanged(data.session !== null ? data.session : "");
        props.selectedItemChanged(data);
        setCurrentData(data);
        getFillesApi(data.id, props);
        getClaimAudioApi(data.id, props);
        props.extrasChanged(data.extras ?? []);
        loadHistorique(data.id);
      } else {
        // props.idChanged(data.id ? data.id : "")
        props.lastnameChanged(
          data.clientFirstAndLastName ? data.clientFirstAndLastName : ""
        );
        props.addressChanged(data.address ? data.address : "");
        props.phoneChanged(data.phone ? data.phone : "");
        props.genderChanged(data.gender ? data.gender : "");
        props.crewChanged(data.crew ? data.crew : "");
        props.dossierimfChanged(data.folderCode ? data.folderCode : "");
        props.emailChanged(data.email ? data.email : "");
        props.codeClientChanged(data.codeClient ? data.codeClient : "");
        props.recordedAtChanged(
          data.receiptDateTime ? data.receiptDateTime : ""
        );
        props.contentChanged(data.content ? data.content : "");
        props.statusChanged(data.status ? data.status : "");
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
        let description2 = data.objetId
          ? loadItemFromSessionStorage("app-objets").filter((e) => {
            return e.id === data.objetId;
          })
          : "";

        let description6 = data.objetId
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
        let description5 = data.collectorId
          ? loadItemFromSessionStorage("app-users").filter((e) => {
            return e.id === data.collectorId;
          })
          : "";

        props.languageChanged(data.languageId ? description[0].libelle : "");
        props.collectChanged(
          data.collectionChannelId ? description1[0].libelle : ""
        );
        props.subjectChanged(
          data.objetId ? description2[0].categorie.libelle : ""
        );
        props.underSubjectChanged(data.objetId ? description2[0].libelle : "");
        props.productChanged(data.productId ? description3[0].libelle : "");
        props.unitChanged(data.servicePointId ? description4[0].libelle : "");
        props.createdByChanged(
          data.collectorId ? description5[0].firstAndLastName : ""
        );
        props.createdAtChanged(data.createdAt ? data.createdAt : "");
        props.sessionChanged(data.session !== null ? data.session : "");
        props.selectedItemChanged(data ? data : "");
        //fetch attachments for selected claim
        // getFillesApi(data.id, props);
      }
    }
  };
  let statusElt;

  switch (props.status) {
    case "SAVED":
      statusElt = (
        <>
          <h5>
            <PrintIcon
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                printRecu(e);
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip toTreatBgColor">
              <span className="">À traiter</span>
            </span>
          </h5>
        </>
      );
      break;
    case "TEMP_SAVED":
      statusElt = (
        <>
          <h5>
            <PrintIcon
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                printRecu(e);
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip indigo lighten-5">
              <span className="indigo-text">Sauvegardée</span>
            </span>
          </h5>
        </>
      );
      break;
    case "AFFECTED":
      statusElt = (
        <>
          <h5>
            <PrintIcon
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                printRecu(e);
              }}
              style={{ cursor: "pointer" }}
            />
            <History
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                props.showModalHistoriqueChanged(true);
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip affectedBgColor">
              <span className="">{"Affectée"}</span>
            </span>
          </h5>
        </>
      );
      break;
    case "TO_APPROUVED":
      statusElt = (
        <>
          <h5>
            <PrintIcon
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                printRecu(e);
              }}
              style={{ cursor: "pointer" }}
            />
            <History
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                props.showModalHistoriqueChanged(true);
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip toApprouvedBgColor">
              <span className="">{"A appouver"}</span>
            </span>
          </h5>
        </>
      );
      break;
    case "DESAPPROUVED":
      statusElt = (
        <>
          <h5>
            <PrintIcon
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                printRecu(e);
              }}
              style={{ cursor: "pointer" }}
            />
            <History
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                props.showModalHistoriqueChanged(true);
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip unApprouvedBgColor">
              <span className="">{"Désapprouvée"}</span>
            </span>
          </h5>
        </>
      );
      break;
    case "TREAT":
      statusElt = (
        <>
          <h5>
            <PrintIcon
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                printRecu(e);
              }}
              style={{ cursor: "pointer" }}
            />
            <History
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                props.showModalHistoriqueChanged(true);
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip treatBgColor">
              <span className="">{"Traitée"}</span>
            </span>
          </h5>
        </>
      );
      break;
    case "SATISFIED":
      statusElt = (
        <>
          <h5>
            <PrintIcon
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                printRecu(e);
              }}
              style={{ cursor: "pointer" }}
            />

            <History
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                props.showModalHistoriqueChanged(true);
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip satisfiedBgColor">
              <span className="">{"Satisfait"}</span>
            </span>
          </h5>
        </>
      );
      break;
    case "UNSATISFIED":
      statusElt = (
        <>
          <h5>
            <PrintIcon
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                printRecu(e);
              }}
              style={{ cursor: "pointer" }}
            />

            <History
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                props.showModalHistoriqueChanged(true);
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip unSatisfiedBgColor">
              <span className="">{"Non Satisfait"}</span>
            </span>
          </h5>
        </>
      );
      break;
    case "PARTIAL_SATISFIED":
      statusElt = (
        <>
          <h5>
            <PrintIcon
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                printRecu(e);
              }}
              style={{ cursor: "pointer" }}
            />

            <History
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                props.showModalHistoriqueChanged(true);
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip partialBgColor">
              <span className="">{"Partiellement Satisfait"}</span>
            </span>
          </h5>
        </>
      );
      break;
    case "LITIGATION":
      statusElt = (
        <>
          <h5>
            <PrintIcon
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                printRecu(e);
              }}
              style={{ cursor: "pointer" }}
            />

            <History
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                props.showModalHistoriqueChanged(true);
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip litigationBgColor">
              <span className="">{"Contentieux"}</span>
            </span>
          </h5>
        </>
      );
      break;
    case "CLASSED":
      statusElt = (
        <>
          <h5>
            <PrintIcon
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                printRecu(e);
              }}
              style={{ cursor: "pointer" }}
            />
            <History
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                props.showModalHistoriqueChanged(true);
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip classedBgColor">
              <span className="">{"Classée"}</span>
            </span>
          </h5>
        </>
      );
      break;

    default:
      statusElt = "";
      break;
  }

  let creationDate = props.created_at ? formatDate4(props.created_at) : "";
  let colourOptions = [
    { value: "Code", label: "Code" },
    { value: "Code Client", label: "Code Client" },
    { value: "Client", label: "Client" },
    { value: "Status", label: "Status" },
    { value: "Enregistrer le", label: "Enregistrer le" },
    { value: "Telephone", label: "Téléphone" },
    { value: "Enregistrer par", label: "Enregistrer par" },
    { value: "Produit", label: "Produit" },
    { value: "Objet", label: "Objet" },
    { value: "Moyens de collecte", label: "Moyen de collecte" },
    { value: "Point de service", label: "Point de service" },
    { value: "Solution", label: "Solution" },
    { value: "Traiter par", label: "Traiter par" },
  ];
  const [selectOption, setSelectOption] = useState([
    "Code",
    "Code Client",
    "Client",
    "Status",
    "Enregistrer le",
  ]);

  let details;

  if (hbt.includes("H14") || addR === "PILOTE" || addR === "DE") {
    if (props.solution.length !== 0) {
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
      if (props.solution.length !== 0) {
        type =
          interne === false
            ? " Détails du traitement - Interactions avec le client"
            : " Détails du traitement - En interne";
      }

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
            <div className="row">
              <div className="col s12 df pb-2">
                <span
                  className="chip indigo lighten-5"
                  style={{ cursor: "pointer" }}
                  onClick={handleInterne}
                >
                  <span className="indigo-text">Traitement en interne</span>
                </span>

                <span
                  className="chip indigo lighten-5"
                  style={{ cursor: "pointer" }}
                  onClick={handleExterne}
                >
                  <span className="indigo-text">
                    Interactions avec le client
                  </span>
                </span>
              </div>
            </div>
            <div className="col s12">
              <h6 className="card-title">{type}</h6>

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
                              Client {degre} : mesurée{" "}
                              {solution.satisfactionMeasureDto.commentaire?.startsWith("[WhatsApp]") ||
                              solution.satisfactionMeasureDto.commentaire?.startsWith("[WhatsApp-Audio]")
                                ? (solution.satisfactionMeasureDto.commentaire?.startsWith("[WhatsApp-Audio]")
                                    ? " via audio WhatsApp 🎙 "
                                    : " depuis WhatsApp ")
                                : solution.satisfactionMeasureDto.measurer
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
                              {solution.unApprouver !== null
                                ? solution.unApprouver.firstAndLastName
                                : ""}{" "}
                              le {formatDate(solution.unApprouvedAt)}
                            </span>
                          </span>
                        </div>
                      </Typography>
                    </>
                  );
                } else if (
                  solution.status === "UNAPPROVED" &&
                  solution.motifDesaprobation === null
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
                            {solution.author.firstAndLastName} -{" "}
                            <span style={{ fontSize: "12px" }}>
                              {formatDate(solution.createdAt)}
                            </span>
                          </Typography>

                          <Typography className="pb-2" component="div">
                            <div className="row">
                              <div className="col l12 s12 pb-2" id="content">
                                <div className="df pb-2">
                                  <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                                  Solution
                                </div>
                                <div>{solution.content}</div>
                              </div>

                              <div className="col l12 s12 pb-2" id="content">
                                <div className="df pb-2">
                                  <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                                  Commentaire
                                </div>
                                <div>{solution.commentaire}</div>
                              </div>
                              {solution.satisfactionMeasureDto ? (
                                solution.satisfactionMeasureDto.commentaire !==
                                  null &&
                                  solution.satisfactionMeasureDto.commentaire !==
                                  "" ? (
                                  <div
                                    className="col l12 s12 pb-2"
                                    id="content"
                                  >
                                    <div className="df pb-2">
                                      <FormatQuoteIcon sx={{ mr: 2 }} />{" "}
                                      Commentaire du client
                                    </div>
                                    <div>
                                      <WaCommentBadge
                                        commentaire={solution.satisfactionMeasureDto.commentaire}
                                        measureDateTime={solution.satisfactionMeasureDto.measureDateTime}
                                        onJumpToAudio={handleJumpToWhatsappAudioComment}
                                      />
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
            <div className="row">
              <div className="col s12 df pb-2">
                <span
                  className="chip indigo lighten-5"
                  style={{ cursor: "pointer" }}
                  onClick={handleInterne}
                >
                  <span className="indigo-text">Traitement en interne</span>
                </span>

                <span
                  className="chip indigo lighten-5"
                  style={{ cursor: "pointer" }}
                  onClick={handleExterne}
                >
                  <span className="indigo-text">
                    Interactions avec le client
                  </span>
                </span>
              </div>
            </div>
            <div className="mt-2">
              <div className="row pb-4 ml-2">
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
            </div>
          </>
        );
      }
    } else if (props.solution.length === 0) {
      let affectation = "";
      if (props.status === "AFFECTED") {
        affectation = (
          <>
            <div className="row pb-4 ml-2">
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
                  {formatDate(props.assigned_at)}
                </span>
              </div>
            </div>
          </>
        );
        details = <>{affectation}</>;
      } else {
        details = (
          <>
            <div className="row pb-4 ml-2">
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
    }
  } else {
    // console.log(props.solution.length)
    //il n'a pas H14
    if (props.solution.length !== 0) {
      //LA RECLAMATION A AU MOINS UNE SOLUTION
      details = (
        <>
          <div className="row pb-5 mt-4">
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
        </>
      );
    } else if (props.solution.length === 0) {
      //LA RECLAMATION N'A PAS DE SOLUTION
      let affectation = "";
      if (props.status === "AFFECTED") {
        //MAIS EST AFFECTEE
        affectation = (
          <>
            <div className="row pb-4 ml-2">
              <div
                className="col s12 mb-2"
                style={{
                  background: "#EFF6FF",
                  borderLeft: "4px solid #1976d2",
                  padding: "10px 5px",
                  borderRadius: "4px",
                }}
              >
                Réclamation affectée le{" "}
                <span style={{ color: "#555" }}>
                  {formatDate(props.assigned_at)}
                </span>
              </div>
            </div>
          </>
        );
        details = <>{affectation}</>;
      } else {
        //AUCUN TRAITEMENT SUR CETTE REC
        details = (
          <>
            <div className="row pb-4 ml-2">
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
    }
  }

  const handleDeleteFile = (id) => {
    modalify(
      "Confirmation",
      "Confirmez vous la suppression de ce fichier ?",
      "confirm",
      () => {
        deleteFileApi(id).then((ok) => {
          if (ok) getFillesApi(props.id, props);
        });
      }
    );
  };

  const handleDeleteAudio = (id) => {
    modalify(
      "Confirmation",
      "Confirmez vous la suppression de cet audio ?",
      "confirm",
      () => {
        deleteAudioApi(id).then((ok) => {
          if (ok) getClaimAudioApi(props.id, props);
        });
      }
    );
  };

  const handleDeleteExtraContent = (id) => {
    modalify(
      "Confirmation",
      "Confirmez vous la suppression de ce contenu ?",
      "confirm",
      () => {
        deleteExtraContentApi(id).then((ok) => {
          if (ok) {
            props.extrasChanged(props.extras.filter((e) => e.id !== id));
          }
        });
      }
    );
  };

  let attachmentList;
  if (props.selectedItemFiles.length > 0) {
    let attachmentListChild = props.selectedItemFiles.map((attachment) => {
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
              }}
            >
              <FileTypeIcon attachment={attachment} />
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
            {attachment._extra &&
              attachment.extra?.user?.firstAndLastName === user.firstAndLastName && (
                <DeleteOutlineIcon
                  sx={{
                    fontSize: "18px",
                    color: "error.main",
                    ml: 1,
                    "&:hover": {
                      color: "error.dark",
                      cursor: "pointer",
                    },
                  }}
                  onClick={() => handleDeleteFile(attachment.id)}
                />
              )}
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
    audioList = (
      <>
        <AudioGrid
          audios={regularAudios}
          currentAudioId={currentAudioId}
          onPlay={handlePlay}
          highlightedAudioId={highlightedAudioId}
          formatDate={formatDate}
          onDelete={handleDeleteAudio}
          currentUser={user}
        />
        <WaAudioSection
          waAudios={waAudios}
          currentAudioId={currentAudioId}
          onPlay={handlePlay}
          highlightedAudioId={highlightedAudioId}
          formatDate={formatDate}
        />
      </>
    );
  } else {
    audioList = (
      <Grid container spacing={2} size={12}>
        <Grid item>Ce dossier ne contient pas de fichiers audio</Grid>
      </Grid>
    );
  }

  let recoursList;
  if (props.external_remedies.length !== 0) {
    recoursList = (
      <>
        <div className="row mt-5">
          <div className="col l12 s12 pb-2" id="content">
            <div className="df pb-2">
              <GavelIcon sx={{ mr: 2 }} />
              <b>Recours Externes</b>
            </div>
            <div>
              {Array.from(props.external_remedies).map((rec) => {
                return (
                  <>
                    <div className="col l6 m6 s12">
                      <span className="df pb-2">
                        <StopIcon sx={{ mr: 2 }} />
                        <i>{rec.libelle}</i>
                      </span>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  } else {
    recoursList = "";
  }

  const printRecu = (e) => {
    // console.log(props.codeClient);
    e.preventDefault();

    let image =
      '<img src="' +
      INSTITUTION_LOGO +
      '" alt="logo" style=" width: "200px",height: "90px" " className=" report-logo"/>';
    let entete =
      '<div className="row" id="enteteRapport" style="margin-bottom:50px!important">';
    entete +=
      '<div className="col l2 s3 m3" style="margin-bottom:20px!important">' +
      image +
      "</div>";
    entete +=
      '<div className="col l8 s7 m7"><b>' +
      INSTITUTION_NAME +
      "</b><br /><i><span>Numéro Agrément: </span>" +
      INSTITUTION_AGREMENT +
      "</i><br /><i><span>Addrese: </span>" +
      INSTITUTION_ADDRESS +
      "</i><br /><i><span>Tel: </span>" +
      INSTITUTION_TEL +
      "</i><br /><i><span>Email: </span>" +
      INSTITUTION_EMAIL +
      "</i></div></div>";

    // Calcul des descriptions
    const description2 = props.selectedItem.objetId
      ? loadItemFromSessionStorage("app-objets").find(
        (e) => e.id === props.selectedItem.objetId
      )
      : {};
    const description3 = props.selectedItem.productId
      ? loadItemFromSessionStorage("app-produits").find(
        (e) => e.id === props.selectedItem.productId
      )
      : {};
    const description5 = props.selectedItem.collectorId
      ? loadItemFromSessionStorage("app-users").find(
        (e) => e.id === props.selectedItem.collectorId
      )
      : {};

    // Statut
    const statusMap = {
      SAVED: "À traiter",
      TEMP_SAVED: "Sauvegardée",
      AFFECTED: "Affectée",
      TO_APPROUVED: "À approuver",
      DESAPPROUVED: "Désapprouvée",
      TREAT: "Traitée",
      SATISFIED: "Satisfait",
      UNSATISFIED: "Non satisfait",
      PARTIAL_SATISFIED: "Partiellement satisfait",
      LITIGATION: "Contentieux",
      CLASSED: "Classée",
    };
    const statusElt = statusMap[props.selectedItem.status] || "";

    // Variables formatées
    const datee = props.selectedItem.createdAt
      ? formatDate(props.selectedItem.createdAt)
      : "";
    const telTemp =
      mode === 1
        ? props.selectedItem.tel
        : props.selectedItem.id && props.selectedItem.collectionChannel
          ? props.selectedItem.tel
          : props.selectedItem.phone;
    const addByTemp =
      mode === 1
        ? props.selectedItem.collector.firstAndLastName
        : props.selectedItem.id && props.selectedItem.collectionChannel
          ? props.selectedItem.collector.firstAndLastName
          : description5.firstAndLastName;
    const objetTemp =
      mode === 1
        ? props.selectedItem.objet.libelle
        : props.selectedItem.id && props.selectedItem.collectionChannel
          ? props.selectedItem.objet.libelle
          : description2.libelle;
    const produitTemp =
      mode === 1
        ? props.selectedItem.product.libelle
        : props.selectedItem.id && props.selectedItem.collectionChannel
          ? props.selectedItem.product.libelle
          : description3.libelle;

    // Contenu du reçu avec marges inférieures ajustées
    const content = `
      ${entete}
      <div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px;">Nom du réclamant :</b></div><div class="col l9" style="font-size:18px;">${props.selectedItem.clientFirstAndLastName}</div></div>
      <div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px;">Téléphone :</b></div><div class="col l9" style="font-size:18px;">${telTemp}</div></div>
      <div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px;">Adresse :</b></div><div class="col l9" style="font-size:18px;">${props.selectedItem.address}</div></div>
      <div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px;">Enregistré le :</b></div><div class="col l9" style="font-size:18px;">${datee}</div></div>
      <div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px;">Enregistré par :</b></div><div class="col l9" style="font-size:18px;">${addByTemp}</div></div>
      <div class="row" style="margin-bottom:15px;"><div class="col l12"><span style="font-size:18px;"><b>Code client:</b> ${props.selectedItem.codeClient}</span></div></div>
      <div class="row" style="margin-bottom:15px;"><div class="col l4"><b style="font-size:18px;">Date de réception de la réclamation :</b></div><div class="col l8" style="font-size:18px;">${props.selectedItem.receiptDateTime}</div></div>
      <div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px;">Objet de plainte :</b></div><div class="col l9" style="font-size:18px;">${objetTemp}</div></div>
      <div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px;">Produit concerné :</b></div><div class="col l9" style="font-size:18px;">${produitTemp}</div></div>
      <div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px;">Statut :</b></div><div class="col l9" style="font-size:18px;">${statusElt}</div></div>
    `;

    // handlePrintAvance(content);
    const childWindow = window.open("", "modal");

    if (!childWindow) {
      alert("Veuillez autoriser les popups.");
      return;
    }

    handlePrintAvance(childWindow, content);
  };

  let content = [];
  content = activeFilter === "ALL"
    ? props.items
    : props.items.filter((item) => item.status === activeFilter);
  //darrell : add custome attribut for search
  content.forEach((element) => {
    //status
    let statusElt;
    switch (element.status) {
      case "SAVED":
        statusElt = "À traiter";
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
    // console.log("daterecligne",element.createdAt)
    element.statusStr = statusElt;

    let graviteElt;
    let cmp;
    if (mode === 1) {
      cmp = element.objet?.risqueLevel;
    } else {
      if (element.id !== "") {
        cmp = element.objet.risqueLevel;
      } else {
        let idO = objets.filter((e) => {
          return e.id === element.objetId;
        });
        cmp = idO[0].risqueLevel;
      }
    }
    switch (cmp) {
      case "MINEUR":
        graviteElt = <span className="green-text text-bold">Mineur</span>;
        break;
      case "MOYEN":
        graviteElt = <span className="orange-text text-bold">Moyen</span>;
        break;
      case "GRAVE":
        graviteElt = (
          <span className="materialize-red-text text-bold">Grave</span>
        );
        break;
      default:
        graviteElt = (
          <span className="chip indigo lighten-5">
            <span className="indigo-text">Nan</span>
          </span>
        );
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

  //PV
  const prepareToPrint = async (type = "pdf") => {
    // console.log("mes données", props.session);
    let entete = "<h1>PV de Session</h1>";
    let codeRec = "Réclamation : " + props.codeClient;
    let participantsTab;
    let guestsTab;
    let votesTab;
    let messagesTab;
    let participants;
    let votes;
    let messages;

    //tableaux
    participantsTab =
      (props?.session?.members).length !== 0
        ? (props?.session?.members).map((e) => {
          return e.firstAndLastName;
        })
        : [];
    guestsTab =
      (props?.session?.guests).length !== 0
        ? (props?.session?.guests).map((e) => {
          return e.firstAndLastName;
        })
        : [];
    votesTab =
      (props?.session?.messages).length !== 0
        ? (props?.session?.messages).filter((e) => {
          if (e.vote === true) {
            return e;
          }
        })
        : [];
    messagesTab =
      (props?.session?.messages).length !== 0
        ? (props?.session?.messages).filter((e) => {
          if (e.vote === false) {
            return e;
          }
        })
        : [];

    // console.log("votesTab",votesTab)
    //participants et invités
    participants =
      "<div style='margin-top:75px!important'><h2>Participants</h2></div>";
    participants += "<ul>";
    participantsTab.map((e) => {
      participants += "<li>" + e + "</li>";
    });
    guestsTab.map((e) => {
      participants += "<li>" + e + "  (invité)  </li>";
    });
    participants += "</ul>";

    //votes

    votes = "<div style='margin-bottom:50px!important;'><h2>Votes</h2></div>";

    votesTab.map((e) => {
      votes += "<table width='960' border='1'>";
      votes +=
        "<tr style='padding:80px!important;'><td style='margin:80px!important;'>Contenu</td><td>" +
        e.voteDto?.contenu +
        "</td></tr> ";
      votes +=
        "<tr style='padding:80px!important;'><td style='padding:80px!important;'>Commentaire</td><td>" +
        e.voteDto?.commentaire +
        "</td></tr>";
      votes +=
        "<tr style='padding:80px!important;'><td style='padding:80px!important;'>Initié par</td><td>" +
        e.voteDto?.author?.firstAndLastName +
        "</td></tr>";

      votes +=
        "<tr style='padding:80px!important;'><td style='padding:80px!important;'>Pour</td><td><ul>";
      let votesPour =
        (e.voteDto?.userVote).length !== 0
          ? (e.voteDto?.userVote).filter((vote) => {
            if (vote.voteType === "POUR") {
              return vote;
            }
          })
          : [];
      votesPour.map((k) => {
        votes += "<li>" + k?.author?.firstAndLastName + "</li>";
      });
      votes += "</ul></td></tr>";

      votes += "<tr style='padding:80px!important;'><td>Contre</td><td><ul>";
      let votesContre =
        (e.voteDto?.userVote).length !== 0
          ? (e.voteDto?.userVote).filter((vote) => {
            if (vote.voteType === "CONTRE") {
              return vote;
            }
          })
          : [];
      votesContre.map((l) => {
        votes += "<li>" + l?.author?.firstAndLastName + "</li>";
      });
      votes += "</ul></td></tr>";

      let decision =
        e.voteDto?.choosed === false
          ? "Solution non retenu"
          : "Solution retenu";

      votes +=
        "<tr style='padding:80px!important;'><td style='padding:80px!important;'>Décision</td><td style='padding:80px!important;'>" +
        decision +
        "</td></tr>";
      votes += "</table><br/><br /><br/><br /><br/><br />";
    });

    //messages
    messages =
      "<div style='margin-bottom:50px!important;'><h2>Messages</h2></div>";
    messagesTab.map((e) => {
      messages +=
        "<div>" +
        e.content +
        " | " +
        e.createdAt +
        " | " +
        e.sender?.firstAndLastName +
        "</div><br/>";
    });

    let data =
      entete +
      "<br/><br />" +
      codeRec +
      "<br/><br />" +
      participants +
      "<br/><br />" +
      votes +
      "<br/><br />" +
      messages +
      "<br/><br />" +
      '<script type="text/javascript">setTimeout(function() { window.print();window.close(); },500)</script>';

    let results = data;

    return results;
  };

  const printToWord = async () => {
    let reportData = await prepareToPrint();
    let css =
      "<style>" +
      "@page WholeDocument{size: 841.95pt 595.35pt;mso-page-orientation: landscape;}" +
      "div.WholeDocument {page: WholeDocument;}" +
      "table{border-collapse:collapse;}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      "table.header-ref{/*border-collapse:collapse;*/}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      "table.header-title{margin-top:5rem;/*border-collapse:collapse;*/}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      "table.header-details{margin-top:5%;/*border-collapse:collapse;*/}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      "table.header-criteria{margin-top:5cm;/*border-collapse:collapse;*/}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      "table[id=stats_claim]{border:1px solide #1e2b37; border-collapse:collapse;}  table[id=stats_claim] td,th{border:0px gray solid;/*width:5em;padding:2px;*/}" +
      "table#stats_denunciation{border:1px solide #1e2b37;border-collapse:collapse;}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      "table#stats_suggestion{border:1px solide #1e2b37;border-collapse:collapse;}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      //'table{border-collapse:collapse;}  td,th{border:1px gray solid;width:5em;padding:2px;}'+
      // 'table.theader{border-collapse:collapse;} table.theader td,th{border:0px gray solid;width:5em;padding:2px;}'+
      "img{width:10cm!important;}" +
      "</style>";
    let preHtml =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Exportation du rapport en Word</title>" +
      css +
      "</head><body><div class='WholeDocument'>";
    let postHtml = "</div></body></html>";
    let html = preHtml + reportData + postHtml;

    let blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });

    // Specify link url
    let url =
      "data:application/vnd.ms-word;charset=utf-8," + encodeURIComponent(html);

    // sleep(15000)
    // Specify file name
    let filename =
      "PV_" + props.code + "_" + today().replaceAll("/", "") + ".doc";

    // Create download link element
    let downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      // Create a link to the file
      downloadLink.href = url;

      // Setting the file name
      downloadLink.download = filename;

      //triggering the function
      downloadLink.click();
    }
  };

  const enfant = document.querySelector("#dialog-enfant");
  const confirmation = document.querySelector("#dialog-confirmation");
  const addFile = document.querySelector("#dialog-addFile");
  const noAccess = document.querySelector("#dialog-noAccess");
  const audioExtrat = document.querySelector("#dialog-audio");
  const contenuExtrat = document.querySelector("#dialog-contenu");
  const historyAffectation = document.querySelector("#dialog-history");

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
  const historyAffectationOuvert =
    historyAffectation && historyAffectation.getAttribute("aria-hidden") !== "true";

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
        "dialog-history",
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
      !historyAffectationOuvert
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
    formData.append("claim_id", claim_id);

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
          notify("Piece joint ajoutée  ", "success");
        } else {
          getClaimAudioApi(currentData?.id, props);
          setOpen2(false);
          setAudioBox(false);
          setAudioListForm([]);
          setAudioListUrlForm([]);
          notify("Audio ajoutée ", "success");
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
    formData.append("claim_id", claim_id);
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

  /* ══════════════════════════════════════════════════════
     VUE DÉTAIL - quand l'URL contient un code réclamation
     Tout la logique métier existante est préservée :
     details, attachmentList, audioList, recoursList,
     printRecu, printToWord, handleInterne/Externe,
     conditions H14/PILOTE/DE, session PV, etc.
  ══════════════════════════════════════════════════════ */
  if (detailVisible) {

    /* ─ Boutons d'en-tête ─ */
    const headerActionsBtns = (
      <>
        <button
          onClick={(e) => printRecu(e)}
          title="Imprimer le reçu"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#475569" }}
        >
          <PrintIcon style={{ fontSize: 15 }} />
          Imprimer
        </button>
        {props.status !== "SAVED" && props.status !== "TEMP_SAVED" && (
          <button
            onClick={() => props.showModalHistoriqueChanged(true)}
            title="Historique des affectations"
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#475569" }}
          >
            <History style={{ fontSize: 15 }} />
            Historique
          </button>
        )}
        {props.session !== "" && (addR === "PILOTE" || addR === "DE") && (
          <LoadingButton
            onClick={() => mode === 1 ? printToWord() : notify("Passez en mode Online pour télécharger le PV", "info")}
            loading={props.etat3}
            loadingPosition="end"
            endIcon={<SaveIcon />}
            size="small"
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2, fontSize: 12, borderColor: "var(--gpr-primary, #005081)", color: "var(--gpr-primary, #005081)" }}
          >
            <span>PV de session</span>
          </LoadingButton>
        )}
      </>
    );


    return (
      <>
        <audio ref={audioRef} src={currentAudio} hidden />
        <HistoriqueAffectation claimId={claim_id} codeClient={props.codeClient} claimStatus={props.status} />

        {/* Dialog ajout contenu */}
        {showExtraContent && (
          <Dialog open={showExtraContent} fullWidth maxWidth="md" onClose={() => setShowExtraContent(false)} id="dialog-contenu">
            <DialogTitle>Ajouter un contenu</DialogTitle>
            <DialogContent sx={{ overflowX: "hidden" }}>
              <TextField fullWidth multiline minRows={4} value={extraContent}
                onChange={(e) => { e.stopPropagation(); setExtraContent(e.target.value); }}
                placeholder="Saisissez le contenu..." />
            </DialogContent>
            {extraContent?.trim() && (
              <DialogActions>
                <LoadingButton onClick={() => { setExtraContent(""); setShowExtraContent(false); }} endIcon={<CloseIcon />} variant="contained" sx={{ backgroundColor: "#000", textTransform: "initial" }} color="secondary">Annuler</LoadingButton>
                <LoadingButton onClick={(e) => handleContentSubmit(e)} loading={extraFileLoading} loadingPosition="end" endIcon={<SaveIcon />} variant="contained" sx={{ backgroundColor: "var(--gpr-primary, #005081)", textTransform: "initial" }}>Enregistrer</LoadingButton>
              </DialogActions>
            )}
          </Dialog>
        )}

        {/* Dialog upload fichiers */}
        {filesForm.length > 0 && (
          <Dialog open fullWidth maxWidth="sm" onClose={clearFiles} id="dialog-addFile">
            <DialogTitle>Ajouter des fichiers</DialogTitle>
            <DialogContent>
              {filesForm.map((f, i) => <div key={i} style={{ padding: "4px 0", fontSize: 13 }}>{f.name}</div>)}
            </DialogContent>
            <DialogActions>
              <LoadingButton onClick={clearFiles} endIcon={<CloseIcon />} variant="contained" sx={{ backgroundColor: "#000", textTransform: "initial" }} color="secondary">Annuler</LoadingButton>
              <LoadingButton onClick={(e) => handleFileSubmit(e)} loading={extraFileLoading} loadingPosition="end" endIcon={<SaveIcon />} variant="contained" sx={{ backgroundColor: "var(--gpr-primary, #005081)", textTransform: "initial" }}>Enregistrer</LoadingButton>
            </DialogActions>
          </Dialog>
        )}

        {/* Dialog enregistrement audio */}
        {open2 && (
          <Dialog open={open2} fullWidth maxWidth="sm" onClose={() => { setOpen2(false); setAudioBox(false); }} id="dialog-audio">
            <DialogTitle>Ajouter un audio</DialogTitle>
            <DialogContent>
              <section className="voice-recorder">
                <div className="recorder-container">
                  {audioListUrlForm.map((url, i) => (
                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 2, pt: 2 }}>
                      <audio src={url} controls />
                      <CloseIcon sx={{ cursor: "pointer" }} onClick={() => {
                        setAudioListForm(audioListForm.filter((_, idx) => idx !== i));
                        setAudioListUrlForm(audioListUrlForm.filter((_, idx) => idx !== i));
                      }} />
                    </Box>
                  ))}
                  <RecorderControls recorderState={recorderState} handlers={handlers} closeAction={() => {}} />
                </div>
              </section>
            </DialogContent>
            {audioListUrlForm.length > 0 && (
              <DialogActions>
                <LoadingButton onClick={() => { setAudioListForm([]); setAudioListUrlForm([]); setAudioBox(false); setOpen2(false); }} endIcon={<CloseIcon />} variant="contained" sx={{ backgroundColor: "#000", textTransform: "initial" }} color="secondary">Annuler</LoadingButton>
                <LoadingButton onClick={(e) => handleFileSubmit(e, false)} loading={extraFileLoading} loadingPosition="end" endIcon={<SaveIcon />} variant="contained" sx={{ backgroundColor: "var(--gpr-primary, #005081)", textTransform: "initial" }}>Enregistrer</LoadingButton>
              </DialogActions>
            )}
          </Dialog>
        )}

        <TraitementShell
          onBack={() => { sessionStorage.removeItem('gpr_rec_code'); setDetailVisible(false); history.push("/reclamations/liste/all"); }}
          codeClient={props.codeClient || props.code}
          status={props.status}
          risqueLevel={props.selectedItem?.objet?.risqueLevel}
          headerActions={headerActionsBtns}
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
          handled_by={props.handled_by}
          assigned_by={props.assigned_by}
          assignedAt={props.assigned_at}
          visibleActions={[]}
          selectedItemFiles={props.selectedItemFiles}
          selectedItemAudio={props.selectedItemAudio}
          attachmentList={attachmentList}
          audioList={audioList}
          inputRef={inputRef}
          onFilesChange={(e) => setFiles([...e.target.files])}
          onAddAudio={() => { setAudioBox(true); setOpen2(true); }}
          solution={props.solution}
          customTabs={[
            {
              key: "traitement",
              label: "Détails du traitement",
              content: (() => {
                const hasH14 = hbt.includes("H14") || addR === "PILOTE" || addR === "DE";
                const solutions = Array.isArray(props.solution) ? props.solution : [];
                const displayedSolutions = hasH14
                  ? (interne ? solutions : solutions.filter(s => s.status === "APPROVED" && s.satisfactionMeasureDto !== null))
                  : (solutions.length > 0 ? [solutions[0]] : []);

                /* ── Stepper config ── */
                const STEPS = [
                  { label: "Enregistrée" },
                  { label: "Affectée" },
                  { label: "Traitée" },
                  { label: "Mesure satisfaction" },
                ];
                const STATUS_STEP = {
                  SAVED: 0, TEMP_SAVED: 0,
                  AFFECTED: 1,
                  TO_APPROUVED: 2, DESAPPROUVED: 2,
                  TREAT: 3,
                };
                const allMeasured = ["SATISFIED","UNSATISFIED","PARTIAL_SATISFIED","LITIGATION","CLASSED"].includes(props.status);
                const currentStep = allMeasured ? STEPS.length : (STATUS_STEP[props.status] ?? 0);
                const isError = props.status === "DESAPPROUVED";

                /* ── Hero config par statut ── */
                const HERO_CFG = {
                  SAVED:             { bg: "#eff6ff", border: "#bfdbfe", iconBg: "#dbeafe", iconColor: "#1d4ed8", title: "En attente d'affectation", sub: "Aucun agent assigné pour le moment", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                  TEMP_SAVED:        { bg: "#f5f3ff", border: "#ddd6fe", iconBg: "#ede9fe", iconColor: "#7c3aed", title: "Sauvegardée temporairement", sub: "En attente de complétion", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> },
                  AFFECTED:          { bg: "#eff6ff", border: "#93c5fd", iconBg: "#dbeafe", iconColor: "#1d4ed8", title: "Affectée à un agent", sub: null, icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                  TO_APPROUVED:      { bg: "#fffbeb", border: "#fcd34d", iconBg: "#fef3c7", iconColor: "#92400e", title: "En attente d'approbation", sub: "La solution proposée doit être approuvée", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                  DESAPPROUVED:      { bg: "#fef2f2", border: "#fca5a5", iconBg: "#fee2e2", iconColor: "#991b1b", title: "Solution désapprouvée", sub: "Une nouvelle solution doit être proposée", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
                  TREAT:             { bg: "#f0fdf4", border: "#86efac", iconBg: "#dcfce7", iconColor: "#166534", title: "En traitement", sub: "Une solution a été proposée", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg> },
                  SATISFIED:         { bg: "#f0fdf4", border: "#86efac", iconBg: "#dcfce7", iconColor: "#166534", title: "Client satisfait", sub: "La réclamation est résolue", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
                  UNSATISFIED:       { bg: "#fef2f2", border: "#fca5a5", iconBg: "#fee2e2", iconColor: "#991b1b", title: "Client non satisfait", sub: "Le client n'est pas satisfait de la solution", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
                  PARTIAL_SATISFIED: { bg: "#fffbeb", border: "#fcd34d", iconBg: "#fef3c7", iconColor: "#92400e", title: "Partiellement satisfait", sub: "Le client est partiellement satisfait", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
                  LITIGATION:        { bg: "#fffbeb", border: "#fcd34d", iconBg: "#fef3c7", iconColor: "#b45309", title: "Contentieux", sub: "La réclamation est en recours externe", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="11" y2="17"/></svg> },
                  CLASSED:           { bg: "#f8fafc", border: "#cbd5e1", iconBg: "#f1f5f9", iconColor: "#475569", title: "Classée", sub: "Le dossier est définitivement clos", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
                };
                const hero = HERO_CFG[props.status] || HERO_CFG["SAVED"];

                /* ── Render solution ── */
                const renderSolution = (sol, idx, total) => {
                  const isLast = idx === total - 1;
                  const sat = sol.satisfactionMeasureDto?.status;
                  const dotColor = sat === "SATISFIED" ? "#10b981" : sat === "UNSATISFIED" ? "#ef4444" : sat === "PARTIAL" ? "#f59e0b" : "var(--gpr-primary, #005081)";
                  const satLabel = sat === "SATISFIED" ? "Satisfait" : sat === "UNSATISFIED" ? "Non satisfait" : sat === "PARTIAL" ? "Partiellement satisfait" : null;
                  const clientComment = sol.satisfactionMeasureDto?.commentaire;
                  const approb = sol.status === "UNAPPROVED";
                  return (
                    <div key={sol.id ?? idx} style={{ position: "relative", marginBottom: isLast ? 0 : 20 }}>
                      <div style={{ position: "absolute", left: -22, top: 14, width: 16, height: 16, borderRadius: "50%", background: dotColor, border: "3px solid #fff", boxShadow: `0 0 0 2px ${dotColor}`, zIndex: 1 }} />
                      <div style={{ background: "#fff", border: `1px solid ${isLast ? dotColor + "44" : "#e5e7eb"}`, borderRadius: 12, overflow: "hidden", boxShadow: isLast ? `0 2px 12px ${dotColor}22` : "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: dotColor }}>Solution {idx + 1}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {sol.author?.firstAndLastName && <span style={{ fontSize: 11.5, color: "#64748b" }}>{sol.author.firstAndLastName}</span>}
                            {sol.createdAt && <span style={{ fontSize: 11, color: "#94a3b8" }}>· {formatDate(sol.createdAt)}</span>}
                          </div>
                        </div>
                        <div style={{ padding: "12px 14px", borderLeft: `3px solid ${dotColor}`, margin: "0 14px 0 14px", marginTop: 12 }}>
                          <div style={{ fontSize: 13.5, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{sol.content || sol.solution || "-"}</div>
                        </div>
                        {sol.commentaire && <div style={{ padding: "0 14px 12px" }}><div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, marginTop: 10 }}>Commentaire</div><div style={{ fontSize: 12.5, color: "#64748b", fontStyle: "italic", lineHeight: 1.6 }}>{sol.commentaire}</div></div>}
                        {clientComment && clientComment.trim() !== "" && <div style={{ padding: "0 14px 12px" }}><div style={{ fontSize: 10.5, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Commentaire du client</div><div style={{ fontSize: 12.5, color: "#0369a1", lineHeight: 1.6, background: "#e0f2fe", borderRadius: 6, padding: "6px 10px" }}>{clientComment}</div></div>}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "0 14px 12px" }}>
                          {satLabel && <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 11px", borderRadius: 20, background: dotColor + "18", color: dotColor }}>{satLabel}</span>}
                          {approb && !sol.motifDesaprobation && <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 11px", borderRadius: 20, background: "#fef3c7", color: "#92400e" }}>En attente d'approbation</span>}
                          {approb && sol.motifDesaprobation && <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 11px", borderRadius: 20, background: "#fee2e2", color: "#991b1b" }}>Désapprouvée</span>}
                        </div>
                      </div>
                    </div>
                  );
                };

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                    {/* ══ STEPPER ══ */}
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                        {STEPS.map((step, i) => {
                          const done = i < currentStep;
                          const active = i === currentStep;
                          const dotC = done ? "#10b981" : active ? (isError ? "#ef4444" : "#3b82f6") : "#e2e8f0";
                          const textC = done ? "#10b981" : active ? (isError ? "#ef4444" : "#1d4ed8") : "#94a3b8";
                          return (
                            <React.Fragment key={i}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, flex: "0 0 auto" }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? "#dcfce7" : active ? (isError ? "#fee2e2" : "#dbeafe") : "#f1f5f9", border: `2px solid ${dotC}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {done
                                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                    : active && isError
                                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    : <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotC }} />}
                                </div>
                                <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, color: textC, marginTop: 5, whiteSpace: "nowrap" }}>{step.label}</span>
                              </div>
                              {i < STEPS.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: i < currentStep ? "#10b981" : "#e2e8f0", margin: "0 4px", marginBottom: 16, borderRadius: 2 }} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* ══ HERO CARD (quand aucune solution) ══ */}
                    {solutions.length === 0 && (
                      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Icône + titre */}
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 60, height: 60, borderRadius: 16, background: hero.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: hero.iconColor }}>
                            {hero.icon}
                          </div>
                          <div>
                            <div style={{ fontSize: 17, fontWeight: 800, color: "#1e293b" }}>{hero.title}</div>
                            {hero.sub && <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{hero.sub}</div>}
                          </div>
                        </div>

                        {/* Détails affectation si AFFECTED */}
                        {props.status === "AFFECTED" && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            {[
                              { label: "Affecté à", value: props.handled_by || "-", color: "#1d4ed8" },
                              { label: "Par", value: props.assigned_by || "-", color: "#1e293b" },
                              { label: "Le", value: props.assigned_at ? formatDate(props.assigned_at) : "-", color: "#1e293b" },
                              { label: "Délai", value: props.selectedItem?.retardDay != null ? `${props.selectedItem.retardDay} jour(s)` : "-", color: props.selectedItem?.retardDay < 0 ? "#ef4444" : "#1e293b" },
                            ].map(({ label, value, color }) => (
                              <div key={label} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px" }}>
                                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{label}</div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color }}>{value}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Grille infos clés du dossier */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Informations du dossier</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            {[
                              { label: "Enregistrée le", value: props.created_at ? formatDate(props.created_at) : "-" },
                              { label: "Canal", value: props.collect || "-" },
                              { label: "Objet", value: props.subject || "-" },
                              { label: "Catégorie", value: props.underSubject || "-" },
                              { label: "Produit", value: props.product || "-" },
                              { label: "Point de service", value: props.unit || "-" },
                            ].map(({ label, value }) => (
                              <div key={label} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{label}</div>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Onglets filtre (H14 uniquement) ── */}
                    {hasH14 && solutions.length > 0 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[
                          { key: false, label: "Interactions avec le client", icon: <PersonIcon style={{ fontSize: 16 }} /> },
                          { key: true,  label: "Traitement en interne",       icon: <Diversity3Icon style={{ fontSize: 16 }} /> },
                        ].map(({ key, label, icon }) => (
                          <button key={String(key)} onClick={() => setInterne(key)}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: interne === key ? 700 : 500, cursor: "pointer",
                              border: interne === key ? "1.5px solid #6366f1" : "1.5px solid #e5e7eb",
                              background: interne === key ? "#eff6ff" : "#f8fafc",
                              color: interne === key ? "#1d4ed8" : "#6b7280",
                              boxShadow: interne === key ? "0 1px 6px rgba(99,102,241,0.15)" : "none" }}
                          >
                            {icon}{label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ── Timeline solutions ── */}
                    {displayedSolutions.length > 0 ? (
                      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          Solutions proposées
                          <span style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, padding: "1px 9px", fontSize: 11.5, fontWeight: 700 }}>{displayedSolutions.length}</span>
                        </div>
                        <div style={{ position: "relative", paddingLeft: 28 }}>
                          <div style={{ position: "absolute", left: 11, top: 6, bottom: 6, width: 2, background: "#e2e8f0", borderRadius: 2 }} />
                          {displayedSolutions.map((sol, idx) => renderSolution(sol, idx, displayedSolutions.length))}
                        </div>
                      </div>
                    ) : solutions.length > 0 && hasH14 ? (
                      <div style={{ background: "#f5f9ff", borderLeft: "4px solid #1976d2", borderRadius: 8, padding: "14px 16px", fontSize: 13, color: "#64748b" }}>
                        Aucune donnée dans cette vue
                      </div>
                    ) : null}

                    {/* ── Recours externes ── */}
                    {props.external_remedies?.length > 0 && (
                      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "18px 22px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>
                          <GavelIcon style={{ fontSize: 16, color: "#f59e0b" }} />
                          Recours externes
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {props.external_remedies.map((rec, i) => (
                            <span key={i} style={{ padding: "5px 14px", borderRadius: 20, background: "#fffbeb", color: "#b45309", border: "1px solid #fed7aa", fontSize: 13, fontWeight: 600 }}>{rec.libelle}</span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })(),
            },
            {
              key: "medias",
              label: "Médias & Contenu",
              content: (
                <FichiersTab
                  selectedItemFiles={props.selectedItemFiles}
                  selectedItemAudio={props.selectedItemAudio}
                  attachmentList={attachmentList}
                  audioList={audioList}
                  inputRef={inputRef}
                  onFilesChange={(e) => setFiles([...e.target.files])}
                  onAddAudio={() => { setAudioBox(true); setOpen2(true); }}
                  content={props.content}
                  extras={props.extras}
                  onAddContent={() => { setShowExtraContent(true); setExtraContent(""); }}
                  onDeleteExtra={handleDeleteExtraContent}
                  currentUser={user}
                />
              ),
            },
            {
              key: "historique",
              label: "Historique",
              content: (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>


                  {/* ══ BLOC 2 : Solutions ══ */}
                  {(() => {
                    const allSolutions = Array.isArray(props.solution) ? props.solution : [];
                    return (
                      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                        <button onClick={() => toggleHistAcc("solutions")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </div>
                          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>Historique des solutions</span>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: allSolutions.length > 0 ? "#fff" : "#94a3b8", background: allSolutions.length > 0 ? "var(--gpr-primary, #005081)" : "#e2e8f0", borderRadius: 20, padding: "2px 9px", marginRight: 8 }}>{allSolutions.length}</span>
                          <span style={{ fontSize: 10, color: "#94a3b8" }}>{histAccordions.solutions ? "▲" : "▼"}</span>
                        </button>
                        {histAccordions.solutions && (
                          <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 18px" }}>
                            {allSolutions.length === 0 ? (
                              <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: "10px 0" }}>Aucune solution proposée</div>
                            ) : (
                              <div style={{ position: "relative", paddingLeft: 28 }}>
                                <div style={{ position: "absolute", left: 11, top: 4, bottom: 4, width: 2, background: "#e2e8f0", borderRadius: 2 }} />
                                {allSolutions.map((sol, idx) => {
                                  const isLast = idx === allSolutions.length - 1;
                                  const sat = sol.satisfactionMeasureDto?.status;
                                  const dotColor = sat === "SATISFIED" ? "#10b981" : sat === "UNSATISFIED" ? "#ef4444" : sat === "PARTIAL" ? "#f59e0b" : sol.status === "UNAPPROVED" ? "#f97316" : "var(--gpr-primary, #005081)";
                                  const satLabel = sat === "SATISFIED" ? "Satisfait" : sat === "UNSATISFIED" ? "Non satisfait" : sat === "PARTIAL" ? "Partiellement satisfait" : null;
                                  const clientComment = sol.satisfactionMeasureDto?.commentaire;
                                  return (
                                    <div key={sol.id ?? idx} style={{ position: "relative", marginBottom: isLast ? 0 : 18 }}>
                                      <div style={{ position: "absolute", left: -22, top: 12, width: 16, height: 16, borderRadius: "50%", background: dotColor, border: "3px solid #fff", boxShadow: `0 0 0 2px ${dotColor}`, zIndex: 1 }} />
                                      <div style={{ border: `1px solid ${isLast ? dotColor + "55" : "#e5e7eb"}`, borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: isLast ? `0 2px 12px ${dotColor}22` : "0 1px 3px rgba(0,0,0,0.04)" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                                          <span style={{ fontSize: 13, fontWeight: 700, color: dotColor }}>Solution {idx + 1}</span>
                                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            {sol.author?.firstAndLastName && <span style={{ fontSize: 11.5, color: "#64748b" }}>{sol.author.firstAndLastName}</span>}
                                            {sol.createdAt && <span style={{ fontSize: 11, color: "#94a3b8" }}>· {formatDate(sol.createdAt)}</span>}
                                          </div>
                                        </div>
                                        <div style={{ padding: "10px 14px 0", borderLeft: `3px solid ${dotColor}`, margin: "10px 14px 0" }}>
                                          <div style={{ fontSize: 13.5, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{sol.content || sol.solution || "-"}</div>
                                        </div>
                                        {sol.commentaire && <div style={{ padding: "8px 14px" }}><span style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Commentaire</span><div style={{ fontSize: 12.5, color: "#64748b", fontStyle: "italic", marginTop: 4 }}>{sol.commentaire}</div></div>}
                                        {clientComment && clientComment.trim() !== "" && <div style={{ margin: "0 14px 10px", background: "#e0f2fe", borderRadius: 8, padding: "8px 12px" }}><span style={{ fontSize: 10.5, fontWeight: 700, color: "#0369a1", textTransform: "uppercase" }}>Commentaire du client</span><div style={{ fontSize: 12.5, color: "#0369a1", marginTop: 4 }}>{clientComment}</div></div>}
                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 14px 12px", marginTop: 4 }}>
                                          {satLabel && <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 11px", borderRadius: 20, background: dotColor + "18", color: dotColor }}>{satLabel}</span>}
                                          {!satLabel && sol.status === "APPROVED" && <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 11px", borderRadius: 20, background: "#fef3c7", color: "#92400e" }}>En attente de mesure</span>}
                                          {sol.status === "UNAPPROVED" && sol.motifDesaprobation && <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 11px", borderRadius: 20, background: "#fee2e2", color: "#991b1b" }}>Désapprouvée - {sol.motifDesaprobation}</span>}
                                          {sol.status === "UNAPPROVED" && !sol.motifDesaprobation && <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 11px", borderRadius: 20, background: "#fef3c7", color: "#92400e" }}>En attente d'approbation</span>}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* ══ BLOC 3 : Flux du dossier ══ */}
                  <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <button onClick={() => toggleHistAcc("flux")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                      </div>
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>Flux du dossier</span>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>{histAccordions.flux ? "▲" : "▼"}</span>
                    </button>
                    {histAccordions.flux && (
                      <div style={{ borderTop: "1px solid #f1f5f9", padding: "8px 12px" }}>
                        <HistoriqueTimeline claimId={claim_id} />
                      </div>
                    )}
                  </div>

                </div>
              ),
            },
          ]}
        />
      </>
    );
  }

  return (
    // "Liste Réclamations"
    <div id="main">
      {/* {props.showSelectPrintItem && ( */}
      <HistoriqueAffectation claimId={claim_id} codeClient={props.codeClient} claimStatus={props.status} />
      {showExtraContent && (
        <div>
          <Dialog
            open={showExtraContent}
            fullWidth={true}
            maxWidth="md"
            onClose={(e) => {
              setShowExtraContent(false);
            }}
            overflowX="hidden"
            id="dialog-contenu"
          >
            <DialogTitle>Ajouter un contenu</DialogTitle>
            <DialogContent sx={{ overflowX: "hidden" }}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                value={extraContent}
                onChange={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setExtraContent(e.target.value);
                }}
                placeholder="Saisissez le contenu..."
              />
            </DialogContent>
            {extraContent && extraContent?.trim() !== "" ? (
              <DialogActions sx={{ overflowX: "hidden" }}>
                <LoadingButton
                  onClick={(e) => {
                    setExtraContent("");
                    setShowExtraContent(false);
                  }}
                  className="waves-effect waves-effect-b waves-light btn-small"
                  loadingPosition="end"
                  // loading={extraFileLoading}
                  endIcon={<CloseIcon />}
                  variant="contained"
                  sx={{ backgroundColor: "#000", textTransform: "initial" }}
                  color="secondary"
                >
                  Annuler
                </LoadingButton>
                <LoadingButton
                  onClick={(e) => {
                    handleContentSubmit(e);
                  }}
                  className="waves-effect waves-effect-b waves-light btn-small mr-2"
                  loading={extraFileLoading}
                  loadingPosition="end"
                  endIcon={<SaveIcon />}
                  variant="contained"
                  sx={{ backgroundColor: "var(--gpr-primary, #005081)", textTransform: "initial" }}
                  color="primary"
                >
                  Enregistrer
                </LoadingButton>
              </DialogActions>
            ) : (
              <></>
            )}
          </Dialog>
        </div>
      )}
      {filesForm.length ? (
        <div>
          <Dialog
            open={filesForm.length ? true : false}
            fullWidth={true}
            maxWidth="sm"
            onClose={(e) => {
              setFiles([]);
            }}
            id="dialog-addFile"
          >
            <DialogContent>
              <DialogContentText>
                <div className="col l12 s12 pb-2" id="content">
                  <div className="df sb pb-2">
                    <b>Ajout de fichier</b>
                    <CloseIcon
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </div>
                </div>
              </DialogContentText>

              <div className="col l12 m12 s12 file-field input-field">
                <List component="div" role="group">
                  {filesForm.map((file, i) => {
                    return (
                      <ListItemButton key={i} divider>
                        <ListItemText
                          primary={file.name}
                          secondary={
                            Math.round((file.size / 1024) * 100) / 100 +
                            " " +
                            "Ko"
                          }
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
                <div
                  style={{ display: "flex", alignItems: "center" }}
                  htmlFor="ile">
                  <LoadingButton
                    onClick={(e) => {
                      handleFileSubmit(e);
                    }}
                    className="waves-effect waves-effect-b waves-light btn-small mr-2"
                    loading={extraFileLoading}
                    loadingPosition="end"
                    endIcon={<SaveIcon />}
                    variant="contained"
                    sx={{
                      backgroundColor: "var(--gpr-primary, #005081)",
                      textTransform: "initial",
                    }}
                  >
                    <span>Enregistrer</span>
                  </LoadingButton>

                  <LoadingButton
                    onClick={(e) => {
                      setFiles([]);
                    }}
                    className="waves-effect waves-effect-b waves-light btn-small"
                    // loading={extraFileLoading}
                    loadingPosition="end"
                    endIcon={<CloseIcon />}
                    variant="contained"
                    sx={{ backgroundColor: "#000", textTransform: "initial" }}
                  >
                    <span>Annuler</span>
                  </LoadingButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <></>
      )}
      {showAudioBox && (
        <div>
          <Dialog
            open={open2}
            onClose={() => {
              setOpen2(false);
            }}
            style={{ padding: "16px" }}
            id="dialog-audio"
          >
            <DialogTitle
              align="center"
              color={"var(--gpr-primary, #005081)"}
              fontSize={"23px"}
              fontWeight={"bold"}
            >
              {"Enregistreur vocal Réclamations"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                align="center"
                fontSize={"14px"}
                textAlign={"center"}
              >
                {
                  "Cliquez sur le bouton ci-dessous et parler dans le micro de votre téléphone, ou branchez un casque ou des écouteurs"
                }
              </DialogContentText>

              <section className="voice-recorder">
                <div className="recorder-container">
                  {audioListUrlForm.map((url, i) => {
                    return (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 2,
                          pt: 2,
                        }}
                      >
                        <audio
                          src={url}
                          controls
                          sx={{ flex: "1", mr: 2, width: "100%" }}
                        />
                        <CloseIcon
                          color="red"
                          onClick={() => {
                            setAudioListForm(() => {
                              return audioListForm.filter(
                                (va, ind) => ind !== i
                              );
                            });
                            setAudioListUrlForm(() => {
                              return audioListUrlForm.filter(
                                (va, inde) => inde !== i
                              );
                            });
                          }}
                        />
                      </Box>
                    );
                  })}
                  <RecorderControls
                    recorderState={recorderState}
                    handlers={handlers}
                    closeAction={() => { }}
                  />
                </div>
              </section>
            </DialogContent>
            {audioListUrlForm.length ? (
              <DialogActions>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "end",
                    alignItems: "center",
                  }}
                >
                  <LoadingButton
                    onClick={(e) => {
                      handleFileSubmit(e, false);
                    }}
                    className="waves-effect waves-effect-b waves-light btn-small mr-2"
                    loading={extraFileLoading}
                    loadingPosition="end"
                    endIcon={<SaveIcon />}
                    variant="contained"
                    sx={{
                      backgroundColor: "var(--gpr-primary, #005081)",
                      textTransform: "initial",
                    }}
                  >
                    <span>Enregistrer</span>
                  </LoadingButton>

                  <LoadingButton
                    onClick={(e) => {
                      setAudioListForm([]);
                      setAudioListUrlForm([]);
                      setAudioBox(false);
                      setOpen2(false);
                    }}
                    className="waves-effect waves-effect-b waves-light btn-small"
                    loadingPosition="end"
                    // loading={extraFileLoading}
                    endIcon={<CloseIcon />}
                    variant="contained"
                    sx={{ backgroundColor: "#000", textTransform: "initial" }}
                  >
                    <span>Annuler</span>
                  </LoadingButton>
                </Box>
              </DialogActions>
            ) : (
              <></>
            )}
          </Dialog>
        </div>
      )}
      <audio ref={audioRef} src={currentAudio} hidden />

      {handleImpression && (
        <>
          <div>
            <Dialog open={impression} onClose={handleImpression}>
              <DialogContent>
                <DialogContentText>
                  <div className="col l12 s12 pb-2" id="content">
                    <div className="df sb pb-2">
                      <b>Ajouter d'autres champs à imprimer</b>
                      <CloseIcon
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImpression();
                        }}
                      />
                    </div>
                  </div>
                </DialogContentText>
                <div className="row">
                  <div className="col l12 s12 m12 text-center">Reçu entre:</div>
                  {/*Date start*/}
                  <div className="col s12 m12 l6 input-field">
                    <DatePicker
                      id="idStartDate"
                      name="startDate"
                      className="mt-4"
                      selected={startDate}
                      onChange={(date) => {
                        setStartDate(date);
                      }}
                      dateFormat="dd/MM/yyyy"
                      locale="fr"
                    />
                    <label htmlFor="idStartDate" className={"active"}>
                      Date de debut
                    </label>
                  </div>
                  {/*Date end*/}

                  <div className="col s12 m12 l6 input-field">
                    <DatePicker
                      id="idEndDate"
                      name="endDate"
                      className="mt-4"
                      selected={endDate}
                      onChange={(date) => {
                        setEndDate(date);
                      }}
                      dateFormat="dd/MM/yyyy"
                      locale="fr"
                    />
                    <label htmlFor="idEndDate" className={"active"}>
                      Date de fin
                    </label>
                  </div>
                </div>

                <div className="row mt-5">
                  <div className="row">
                    <div className="col l12 s12 pb-5">
                      <Select
                        defaultValue={[
                          colourOptions[0],
                          colourOptions[1],
                          colourOptions[2],
                          colourOptions[3],
                          colourOptions[4],
                        ]}
                        isMulti
                        name="colors"
                        options={colourOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(e) => {
                          let arrau = [];
                          for (let i = 0; i < e.length; i++) {
                            arrau.push(e[i].value);
                          }
                          setSelectOption(arrau);
                        }}
                      />
                    </div>
                    <div className="row">
                      <div className="col l12 s12 pb-5">
                        <table className="pt-5 pb-5">
                          <tbody>
                            <tr
                              style={{
                                border: "solid 1px #ddd",
                                borderCollapse: "collapse",
                                padding: "2px 3px",
                              }}
                              id="122keysaa"
                            >
                              {selectOption.map((select) => {
                                return (
                                  <th
                                    style={{
                                      padding: "10px",
                                      border: "solid 1px black",
                                    }}
                                    id={select}
                                  >
                                    {select}
                                  </th>
                                );
                              })}
                            </tr>

                            <tr
                              style={{
                                border: "solid 1px #ddd",
                                borderCollapse: "collapse",
                                padding: "2px 3px",
                              }}
                              id="122key"
                            >
                              <td
                                style={{
                                  padding: "10px",
                                  border: "solid 1px black",
                                  textAlign: "center",
                                }}
                                colSpan={selectOption.length}
                                id="122keyss"
                              >
                                <i>Vos données</i>{" "}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col l12 s12"></div>
                    {changeButtonPrint ? (
                      <a
                        onClick={(e) => {
                          if (startDate && endDate) {
                            handlePrint22(
                              config,
                              selectOption,
                              props.items,
                              formatDate2(startDate),
                              formatDate2(endDate)
                            );

                          } else {
                            // Sinon, utiliser handlePrint2 sans filtre
                            handlePrint2(config, selectOption, props.items);
                          }
                        }}
                        className="btn indigo lighten-5 indigo-text waves-effect waves-effect-b waves-light"
                      >
                        <span className="text-nowrap">Imprimer</span>
                      </a>
                    ) : (
                      <a
                        // onClick={(e) => {
                        //   table2XLS2X(
                        //     "Liste_des_réclamations" +
                        //     today().replaceAll("/", ""),
                        //     "brke",
                        //     selectOption,
                        //     props.items
                        //   );
                        // }}
                        onClick={(e) => {
                          if (startDate && endDate) {
                            table2XLS2XF(
                              "Liste_des_réclamations" +
                              today().replaceAll("/", ""),
                              "brke",
                              selectOption,
                              props.items,
                              formatDate2(startDate),
                              formatDate2(endDate)
                            );
                          } else {
                            // Sinon, utiliser handlePrint2 sans filtre
                            table2XLS2X(
                              "Liste_des_réclamations" +
                              today().replaceAll("/", ""),
                              "brke",
                              selectOption,
                              props.items
                            );
                          }
                        }}
                        className="btn green lighten-5 green-text waves-effect waves-effect-b waves-light"
                      >
                        {" "}
                        Exporter
                      </a>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}

      <div className="row">
        <div className="col s12">
          <div className="container">
            <section className="tabs-vertical mt-1 section">
              <div className="row">
                <div className="col l12 s12 pb-5">
                  <div className="card-panel pb-5">
                    <ClaimsKPIBar items={props.items} />
                    <ClaimsFilterBar
                      items={props.items}
                      activeFilter={activeFilter}
                      onFilterChange={(val) => setActiveFilter(val)}
                    />
                    <div className="row">
                      <div className="row">
                        <div className="col l6 m6 s12">
                          <h5 className="card-title" style={{ fontWeight: 700, color: "#0F172A", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 8 }}>
                            Liste des réclamations
                            <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "#64748B", background: "#F1F5F9", borderRadius: 8, padding: "2px 10px" }}>
                              {content.length} résultat{content.length !== 1 ? "s" : ""}
                            </span>
                          </h5>
                        </div>
                        <div className="col l6 m6 s12" style={{ textAlign: "end", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                          {/* Toggle Vue liste / cartes */}
                          <Box sx={{ display: "inline-flex", borderRadius: "10px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                            <Tooltip title="Vue liste"><Box onClick={() => setViewMode("list")} sx={{ px: 1.4, py: 0.8, cursor: "pointer", backgroundColor: viewMode === "list" ? "var(--gpr-primary, #005081)" : "#F8FAFC", color: viewMode === "list" ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.18s" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></Box></Tooltip>
                            <Tooltip title="Vue cartes"><Box onClick={() => setViewMode("card")} sx={{ px: 1.4, py: 0.8, cursor: "pointer", backgroundColor: viewMode === "card" ? "var(--gpr-primary, #005081)" : "#F8FAFC", color: viewMode === "card" ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.18s" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></Box></Tooltip>
                          </Box>
                          {hbt.includes("H7") ? (
                            <img src={pdf} alt="" style={{ marginRight: "15px", cursor: "pointer" }}
                              onClick={(e) => {
                                if (hbt.includes("H8")) { handleImpression(); setChangeButtonPrint(true); }
                                else { handlePrint2(config, selectOption, props.items); }
                              }}
                            />
                          ) : ""}
                          {hbt.includes("H9") ? (
                            <img src={excel} alt="" style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                if (hbt.includes("H10")) { handleImpression(); setChangeButtonPrint(false); }
                                else { table2XLS2X("Liste_des_réclamations" + today().replaceAll("/", ""), "brke", selectOption, props.items); }
                              }}
                            />
                          ) : ""}
                        </div>
                      </div>
                      <div className="col s12">
                        {viewMode === "list" ? (
                          <ClaimsTable
                            items={content}
                            mode={mode}
                            objets={objets}
                            onRowClick={(data) => rowClickedHandler(null, data, 0)}
                            showTransmitted={false}
                            showStatusIcons={false}
                          />
                        ) : (
                          <ClaimsCardView
                            items={content}
                            mode={mode}
                            objets={objets}
                            onCardClick={(data) => rowClickedHandler(null, data, 0)}
                            showTransmitted={false}
                            showStatusIcons={false}
                          />
                        )}
                        <div id="tab_exl" style={{ display: "none" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div>
                  <Dialog
                    fullScreen
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Transition}
                  >
                    <AppBar
                      sx={{ position: "relative", backgroundColor: "var(--gpr-primary, #005081)" }}
                    >
                      <Toolbar>
                        <IconButton
                          edge="start"
                          color="inherit"
                          onClick={handleClose}
                          aria-label="close"
                        >
                          <CloseIcon />
                        </IconButton>
                        <Typography
                          sx={{ ml: 2, flex: 1 }}
                          variant="h6"
                          component="div"
                        >
                          Détails de la réclamation
                        </Typography>
                      </Toolbar>
                    </AppBar>

                    <div className="row">
                      {/* first part */}

                      <div className="col l6 s12 pb-5" id="ficheReclamation">
                        <div className="card-panel pb-5">
                          <div className="row pb-5" id="ententeFiche">
                            <div className="col l6 s12">
                              <h5 className="card-title">
                                Fiche de la réclamation
                              </h5>
                            </div>
                            <div className="col l6 s12" style={{}}>
                              {statusElt}
                            </div>
                          </div>
                          <div className="row">
                            <div className="col s12 m12">
                              <div className="row" id="informationReclamant">
                                <div className="col s12 pb-2">
                                  <h6 className="card-title">
                                    Informations du réclamant
                                  </h6>
                                </div>
                                <div className="row">
                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="firstname"
                                  >
                                    <PersonIcon sx={{ mr: 2 }} />{" "}
                                    {props.lastname}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="address"
                                  >
                                    <LocationOnIcon sx={{ mr: 2 }} />{" "}
                                    {props.address}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="phone"
                                  >
                                    <CallIcon sx={{ mr: 2 }} /> {props.phone}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="gender"
                                  >
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

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="language"
                                  >
                                    <LanguageIcon sx={{ mr: 2 }} />{" "}
                                    {props.language}
                                  </div>

                                  {
                                    (dimf =
                                      props.dossierimf !== "" ? (
                                        <>
                                          <div
                                            className="col l6 s12 df pb-2"
                                            id="dossierimf"
                                          >
                                            {" "}
                                            <FolderSharedIcon
                                              sx={{ mr: 2 }}
                                            />{" "}
                                            {props.dossierimf}
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
                            <div className="col s12 m12">
                              <div className="row">
                                <div className="col s12 pb-2">
                                  <h6 className="card-title">
                                    Détails de la réclamation
                                  </h6>
                                </div>

                                <div className="row">
                                  <div className="col l6 s12 df pb-2" id="code">
                                    <PinIcon sx={{ mr: 2 }} />{" "}
                                    {props.codeClient}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="recorded_at"
                                  >
                                    <CalendarMonthIcon sx={{ mr: 2 }} />
                                    {formatDate4(props.recorded_at)}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="collect"
                                  >
                                    <RecyclingIcon sx={{ mr: 2 }} />{" "}
                                    {props.collect}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="underSubject"
                                  >
                                    <DataObjectIcon sx={{ mr: 2 }} />{" "}
                                    {props.underSubject}
                                  </div>
                                  <div
                                    className="col l12 s12 df pb-2"
                                    id="subject"
                                  >
                                    <DataObjectIcon sx={{ mr: 2 }} />{" "}
                                    {props.subject}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="product"
                                  >
                                    <CategoryIcon sx={{ mr: 2 }} />{" "}
                                    {props.product}
                                  </div>

                                  <div className="col l6 s12 df pb-2" id="unit">
                                    <AddBusinessIcon sx={{ mr: 2 }} />{" "}
                                    {props.unit}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="content"
                                  >
                                    <SupportAgentIcon sx={{ mr: 2 }} />
                                    {props.created_by}
                                  </div>

                                  {props.created_at_online !== "" ? (
                                    <>
                                      <div
                                        className="col l6 s12 df pb-2"
                                        id="content"
                                      >
                                        <CalendarTodayIcon sx={{ mr: 2 }} />{" "}
                                        Date enregistrement offline :{" "}
                                        {creationDate}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div
                                        className="col l6 s12 df pb-2"
                                        id="content"
                                      >
                                        <CalendarTodayIcon sx={{ mr: 2 }} />{" "}
                                        {creationDate}
                                      </div>
                                    </>
                                  )}

                                  {props.created_at_online !== "" ? (
                                    <>
                                      <div
                                        className="col l6 s12 df pb-2"
                                        id="dateOffline"
                                      >
                                        {" "}
                                        <CalendarTodayIcon
                                          sx={{ mr: 2 }}
                                        />{" "}
                                        Date d'enregistrement online :{" "}
                                        {props.created_at_online !== null &&
                                          props.created_at_online !== undefined &&
                                          props.created_at_online !== ""
                                          ? formatDate(props.created_at_online)
                                          : ""}
                                      </div>
                                    </>
                                  ) : (
                                    ""
                                  )}

                                  <div
                                    className="col l12 s12 pb-2"
                                    id="content"
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div className="df pb-2">
                                        <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                                        {"Contenu"}
                                      </div>
                                      <span
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setShowExtraContent(true);
                                          setExtraContent("");
                                        }}
                                        className="pb-2 ml-3 "
                                        style={{
                                          cursor: "pointer",
                                          color: "var(--gpr-primary, #005081)",
                                        }}
                                      >
                                        + Ajouter du contenu
                                      </span>
                                    </Box>

                                    <List component="div" role="group">
                                      <ListItemButton divider>
                                        <ListItemText
                                          primary={props.content}
                                          secondary={
                                            props.created_by +
                                            " le " +
                                            creationDate
                                          }
                                        />
                                      </ListItemButton>

                                      {props.extras?.map((extra) => {
                                        return extra.contenu ? (
                                          <ListItemButton
                                            key={extra.id}
                                            divider
                                          >
                                            <ListItemText
                                              primary={extra.contenu}
                                              secondary={
                                                extra.user?.firstAndLastName +
                                                " le " +
                                                formatDate(extra.createdAt)
                                              }
                                            />

                                            <Tooltip
                                              title={
                                                "Ce contenu a été ajouté ultérieurement par " +
                                                extra.user?.firstAndLastName +
                                                " le " +
                                                formatDate(extra.createdAt) +
                                                ". la plainte etait en etat: " +
                                                getStatusLabel(extra.status)
                                              }
                                            >
                                              <Info />
                                            </Tooltip>
                                          </ListItemButton>
                                        ) : (
                                          <></>
                                        );
                                      })}
                                    </List>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* file part */}
                        <div className="">
                          <div className="card-panel pb-5">
                            <div className="row" id="">
                              <div className="col s12 pb-2">
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography
                                    gutterBottom
                                    variant="body1"
                                    component="div"
                                    sx={{
                                      fontWeight: "bold",
                                      mb: 1,
                                      mr: 1,
                                    }}
                                  >
                                    {" "}
                                    Contenu & Médias
                                  </Typography>
                                  <label
                                    htmlFor="ile"
                                    className="btn btn-primary"
                                  >
                                    Ajouter un fichier
                                    <input
                                      type="file"
                                      id="ile"
                                      ref={inputRef}
                                      multiple
                                      sx={{ display: "none" }}
                                      onChange={(e) => {
                                        setFiles([...e.target.files]);
                                      }}
                                      style={{ display: "none" }}
                                      accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, audio/*, video/*"
                                    />
                                  </label>
                                </Box>
                              </div>
                              <div className="col s12">{attachmentList}</div>
                            </div>
                          </div>
                        </div>

                        {/* Audio part */}
                        <div className="">
                          <div className="card-panel pb-5">
                            <div className="row" id="">
                              <div className="col s12 pb-3">
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography
                                    gutterBottom
                                    variant="body1"
                                    component="div"
                                    sx={{
                                      fontWeight: "bold",
                                      mb: 1,
                                      mr: 1,
                                    }}
                                  >
                                    {" "}
                                    Audios
                                  </Typography>
                                  <label
                                    htmlFor="audio"
                                    onClick={() => {
                                      setAudioBox(true);
                                      setOpen2(true);
                                    }}
                                    className="btn btn-primary"
                                  >
                                    Ajouter un audio
                                  </label>
                                </Box>
                              </div>
                              <div className="col s12">{audioList}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* second part */}
                      <div className="col l6 s12 pb-5" id="ficheReclamation">
                        <div className="card-panel pb-5">
                          <div className="row" id="">
                            <div className="col s12">
                              <h5
                                className="card-title df "
                                style={{ justifyContent: "space-between" }}
                              >
                                Détails du traitement
                                {props.session !== "" &&
                                  (addR === "PILOTE" || addR === "DE") ? (
                                  <LoadingButton
                                    onClick={(e) => {
                                      if (mode === 1) {
                                        printToWord();
                                      } else {
                                        notify(
                                          "Passez en mode Online pour télécharger le PV de la session ",
                                          "info"
                                        );
                                      }
                                    }}
                                    className="waves-effect waves-effect-b waves-light btn-small"
                                    loading={props.etat3}
                                    loadingPosition="end"
                                    endIcon={<SaveIcon />}
                                    variant="contained"
                                    sx={{
                                      backgroundColor: "var(--gpr-primary, #005081)",
                                      textTransform: "initial",
                                    }}
                                  >
                                    <span>Générer le PV de la session</span>
                                  </LoadingButton>

                                ) : (
                                  ""
                                )}
                              </h5>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col s12 m12">
                              <div className="row">{details}</div>
                            </div>
                          </div>

                          {recoursList}
                        </div>
                      </div>
                    </div>
                  </Dialog>
                </div>
              </div>
            </section>
          </div>
          <div className="content-overlay"></div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    isLoading: state.claim_list.isLoading,
    id: state.claim_list.id,
    firstname: state.claim_list.firstname,
    lastname: state.claim_list.lastname,
    address: state.claim_list.address,
    phone: state.claim_list.phone,
    gender: state.claim_list.gender,
    email: state.claim_list.email,
    language: state.claim_list.language,
    dossierimf: state.claim_list.dossierimf,
    code: state.claim_list.code,
    codeClient: state.claim_list.codeClient,
    recorded_at: state.claim_list.recorded_at,
    collect: state.claim_list.collect,
    subject: state.claim_list.subject,
    underSubject: state.claim_list.underSubject,
    product: state.claim_list.product,
    unit: state.claim_list.unit,
    content: state.claim_list.content,
    status: state.claim_list.status,
    motif: state.claim_list.motif,
    solution: state.claim_list.solution,
    comment: state.claim_list.comment,
    crew: state.claim_list.crew,
    created_by: state.claim_list.created_by,
    created_at: state.claim_list.created_at,
    created_at_online: state.claim_list.created_at_online,
    assigned_at: state.claim_list.assigned_at,
    assigned_by: state.claim_list.assigned_by,
    handled_at: state.claim_list.handled_at,
    handled_by: state.claim_list.handled_by,
    approved_at: state.claim_list.approved_at,
    approved_by: state.claim_list.approved_by,
    resolved_at: state.claim_list.resolved_at,
    resolved_by: state.claim_list.resolved_by,
    appraised_at: state.claim_list.appraised_at,
    extras: state.claim_list.extras,
    appraised_by: state.claim_list.appraised_by,
    appraisal: state.claim_list.appraisal,
    errors: state.claim_list.claim_appraise_errors,
    items: state.claim_list.items,
    agents: state.claim_list.agents,
    external_remedies: state.claim_list.external_remedies,
    selectedItem: state.claim_list.selectedItem,
    selectedFiles: state.claim_list.selectedFiles,
    session: state.claim_list.session,
    selectedItemFiles: state.claim_list.selectedItemFiles,
    selectedItemAudio: state.claim_list.selectedItemAudio,
    showSelectPrintItem: state.claim_list.showSelectPrintItem,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loading: (err) => {
      dispatch(loading(err));
    },
    claimListErrors: (err) => {
      dispatch(claimListErrors(err));
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
    codeClientChanged: (codeClient) => {
      dispatch(codeClientChanged(codeClient));
    },
    recordedAtChanged: (recordedAt) => {
      dispatch(recordedAtChanged(recordedAt));
    },
    collectChanged: (collect) => {
      dispatch(collectChanged(collect));
    },
    subjectChanged: (subject) => {
      dispatch(subjectChanged(subject));
    },
    underSubjectChanged: (underSubject) => {
      dispatch(underSubjectChanged(underSubject));
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
    commentChanged: (comment) => {
      dispatch(commentChanged(comment));
    },
    createdAtChanged: (createdAt) => {
      dispatch(createdAtChanged(createdAt));
    },
    createdAtOnlineChanged: (createdAtOnline) => {
      dispatch(createdAtOnlineChanged(createdAtOnline));
    },
    createdByChanged: (createdBy) => {
      dispatch(createdByChanged(createdBy));
    },
    assignedAtChanged: (assignedAt) => {
      dispatch(assignedAtChanged(assignedAt));
    },
    assignedByChanged: (assignedBy) => {
      dispatch(assignedByChanged(assignedBy));
    },
    handledAtChanged: (handledAt) => {
      dispatch(handledAtChanged(handledAt));
    },
    handledByChanged: (handledBy) => {
      dispatch(handledByChanged(handledBy));
    },
    approvedAtChanged: (approvedAt) => {
      dispatch(approvedAtChanged(approvedAt));
    },
    approvedByChanged: (approvedBy) => {
      dispatch(approvedByChanged(approvedBy));
    },
    resolvedAtChanged: (resolvedAt) => {
      dispatch(resolvedAtChanged(resolvedAt));
    },
    resolvedByChanged: (resolvedBy) => {
      dispatch(resolvedByChanged(resolvedBy));
    },
    appraisedAtChanged: (appraisedAt) => {
      dispatch(appraisedAtChanged(appraisedAt));
    },
    appraisedByChanged: (appraisedBy) => {
      dispatch(appraisedByChanged(appraisedBy));
    },
    appraisalChanged: (appraisal) => {
      dispatch(appraisalChanged(appraisal));
    },
    itemsChanged: (items) => {
      dispatch(itemsChanged(items));
    },
    agentsChanged: (agents) => {
      dispatch(agentsChanged(agents));
    },
    externalRemediesChanged: (externalRemedies) => {
      dispatch(externalRemediesChanged(externalRemedies));
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
    showSelectPrintItemChanged: (show) => {
      dispatch(showSelectPrintItemChanged(show));
    },
    sessionChanged: (session) => {
      dispatch(sessionChanged(session));
    },
    crewChanged: (crew) => {
      dispatch(crewChanged(crew));
    },
    showModalHistoriqueChanged: (showModal) => {
      dispatch(showModalChanged(showModal));
    },
    extrasChanged: (collect) => {
      dispatch(extrasChanged(collect));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListeReclamations);
