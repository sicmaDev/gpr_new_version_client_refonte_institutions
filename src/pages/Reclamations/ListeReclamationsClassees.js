import React, { useEffect, useRef, useState, useMemo } from "react";
import FileTypeIcon from "../../components/shared/FileTypeIcon";
import { Link, NavLink } from "react-router-dom";
import { KTApp } from "../../Utils/blockui";
import {
  addressChanged,
  agentsChanged,
  appraisalChanged,
  codeChanged,
  commentChanged,
  contentChanged,
  firstnameChanged,
  genderChanged,
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
  selectedFilesReset,
  selectedItemChanged,
  selectedItemFilesChanged,
  selectedItemAudioChanged,
  solutionChanged,
  statusChanged,
  subjectChanged,
  externalRemediesChanged,
  unitChanged,
  collectChanged,
  dossierimfChanged,
  emailChanged,
  newSolutionChanged,
  newCommentChanged,
  claimAssuranceErrors,
  authorizeChanged,
  createdByChanged,
  etat2Changed,
  underSubjectChanged,
  extrasChanged,
  codeClientChanged,
  createdAtChanged,
} from "../../redux/actions/Reclamations/AssuranceReclamationActions";
import ReactDatatable from "@ashvin27/react-datatable";
import { ButtonBase } from "@mui/material";
import DossierKPIBar from "../../components/shared/DossierKPIBar";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ClaimsTable from "./components/ClaimsTable";
import ClaimsCardView from "./components/ClaimsCardView";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import Select from "react-select";
import TraitementShell from "../../components/treatment/TraitementShell";
import HistoriqueTimeline from "../../components/treatment/HistoriqueTimeline";
import { STATUS_CONFIG } from "./components/ClaimStatusBadge";
import axios from "axios";
import { HOST } from "../../Utils/globals";
import {
  formatDate,
  formatDate2,
  formatDate3,
  formatDate4,
  guessExtension,
  loadItemFromSessionStorage,
} from "../../Utils/utils";
import http from "../../apis/http-common";
import { connect } from "react-redux";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {
  addRecoursClaimSolutionApi,
  classifyClaimApi,
  downloadAudioApi,
  downloadFillesApi,
  getClaimAudioApi,
  getFillesApi,
  listeAssurance,
  listeByStatut,
  treatClaimApi,
} from "../../apis/Reclamations/ReclamationsApi";

import {
  Card,
  Box,
  CardContent,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Tooltip,
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
import { TransitionProps } from "@mui/material/transitions";
import timelineOppositeContentClasses from "@mui/lab/TimelineOppositeContent";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { Avatar, Hidden } from "@mui/material";
import ee from "event-emitter";
import { modalify } from "../../Utils/modal";
import { LoadingButton } from "@mui/lab";
import SaveIcon from "@mui/icons-material/Save";
import EmailIcon from '@mui/icons-material/Email';
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
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

const CLS_KPI_CARDS = [
  {
    key: "total",
    label: "Total",
    icon: AssignmentIcon,
    iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6",
    filter: () => true,
  },
  {
    key: "classed",
    label: "Classées",
    icon: CheckCircleIcon,
    iconBg: "#F3F4F6", iconColor: "#374151", borderColor: "#D1D5DB",
    filter: (c) => c.status === "CLASSED",
  },
];

const CLS_STATUS_OPTIONS = [
  { value: "",        label: "Tous les statuts" },
  { value: "CLASSED", label: "Classée" },
];

const CLS_CHIPS = [
  { value: "ALL",     label: "Tous",    filter: () => true },
  { value: "CLASSED", label: "Classée", filter: (c) => c.status === "CLASSED" },
];

const ListeReclamationsClassees = (props) => {
  let user =
    loadItemFromSessionStorage("app-user") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-user"))
      : undefined;
  let hbt = user.posteDto.habilitations.split(",");

  const [open, setOpen] = React.useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [isLoading, setIsLoading] = useState(false);
  const handleClickOpen = () => { setOpen(true); };

  const [currentAudioId, setCurrentAudioId] = useState("");
  const audioRef = useRef(null);

  const history = useHistory();

  useEffect(() => {
    if (props.match.params.code !== "all") {
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
          let data = cc.data.content;
          props.idChanged(data.id ?? "");
          props.lastnameChanged(data.clientFirstAndLastName ?? "");
          props.addressChanged(data.address ?? "");
          props.phoneChanged(data.tel ?? "");
          props.genderChanged(data.gender ?? "");
          props.languageChanged(data.language?.libelle ?? "");
          props.dossierimfChanged(data.folderCode ?? "");
          props.emailChanged(data.email ?? "");
          props.codeChanged(data.code ?? "");
          props.codeClientChanged(data.codeClient ?? "");
          props.recordedAtChanged(data.receiptDateTime ?? "");
          props.createdAtChanged(data.createdAt ?? "");
          props.collectChanged(data.collectionChannel?.libelle ?? "");
          props.subjectChanged(data.objet?.libelle ?? "");
          props.underSubjectChanged(data.objet?.categorie?.libelle ?? "");
          props.productChanged(data.product?.libelle ?? "");
          props.unitChanged(data.servicePoint?.libelle ?? "");
          props.contentChanged(data.content ?? "");
          props.solutionChanged(data.solutionDtos ?? []);
          props.createdByChanged(data.collector?.firstAndLastName ?? "");
          props.statusChanged(data.status ?? "");
          props.selectedItemChanged(data);
          props.extrasChanged(data.extras ?? []);
          getFillesApi(data.id, props);
          getClaimAudioApi(data.id, props);
        }
      }
      details();
    }
  }, []);
  const handleClose = () => {
    setOpen(false);
  };
  let dimf, crew, emailDisplay;

  useEffect(() => {
    KTApp.blockPage({
      overlayColor: '#000000',
      type: 'v2',
      state: 'danger',
      message: 'En cours de chargement...'
    })
    setIsLoading(true);

    props.itemsChanged([]);
    listeByStatut(props, "CLASSED").then((r) => { }).finally(() => {
      setIsLoading(false);
      KTApp.unblockPage();
    });

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

  const [interne, setInterne] = React.useState(false);
  const [showAudioPlayer, setAudioPlayer] = useState("");
  const [currentAudio, setCurrentAudio] = useState("");

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

  useEffect(() => { }, [showAudioPlayer, currentAudio]);

  let content = [];
  content = props.items;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const filteredContent = useMemo(() => {
    const chip = CLS_CHIPS.find((c) => c.value === activeFilter);
    return chip ? content.filter(chip.filter) : content;
  }, [content, activeFilter]);

  //darrell : add custome attribut for search
  content.forEach((element) => {
    //status
    let statusElt;

    switch (element.status) {
      case "CLASSED":
        statusElt = "Classée";
        break;
      default:
        statusElt = "";
        break;
    }

    element.statusStr = statusElt;

    let graviteElt;
    switch (element.objet?.risqueLevel) {
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

  //Handling the List
  let columns = [
    {
      key: "codeClient",
      text: "Code client",
      className: "code",
      align: "left",
      sortable: true,
      cell: (claim, index) => {
        let codeClient = claim.codeClient !== "" ? claim.codeClient : "";
        return codeClient;
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
        switch (claim.objet.risqueLevel) {
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
  ];

  let config = {
    page_size: 15,
    length_menu: [15, 25, 50, 100],
    show_filter: true,
    show_pagination: true,
    filename: "Liste des réclamations Classées",
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
    history.push("/reclamations/classees/" + data.code);

    switch (data.objet?.risqueLevel) {
      case "MINEUR":
        if (hbt.includes("H2")) {
          props.authorizeChanged(true);
        } else {
          props.authorizeChanged(false);
        }
        break;
      case "MOYEN":
        if (hbt.includes("H3")) {
          props.authorizeChanged(true);
        } else {
          props.authorizeChanged(false);
        }
        break;
      case "GRAVE":
        if (hbt.includes("H4")) {
          props.authorizeChanged(true);
        } else {
          props.authorizeChanged(false);
        }
        break;

      default:
        break;
    }
    props.idChanged(data.id ? data.id : "");
    props.lastnameChanged(
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
    props.createdAtChanged(data.createdAt ? data.createdAt : "");
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
    // props.newSolutionChanged(data.assuranceSolution ? data.assuranceSolution : "");
    // props.newCommentChanged(data.assuranceComment ? data.assuranceComment : "");
    props.createdByChanged(
      data.collector.firstAndLastName ? data.collector.firstAndLastName : ""
    );
    // props.motifChanged(data.motif)
    props.statusChanged(data.status ? data.status : "");
    props.selectedItemChanged(data);
    props.extrasChanged(data.extras ?? []);

    //fetch attachments for selected claim
    // http.get("/files/list/claim/" + data.code).then((response) => {
    //   props.selectedItemFilesChanged(response.data);
    // });
    getFillesApi(data.id, props);
    getClaimAudioApi(data.id, props);
  };

  let statusElt;
  switch (props.status) {
    case "CLASSED":
      statusElt = (
        <span className="chip classedBgColor z-depth-1">
          <span className="">Classée</span>
        </span>
      );
      break;

    default:
      statusElt = "";
      break;
  }

  let errors = {};
  const clearComponentState = () => {
    props.lastnameChanged("");
    props.firstnameChanged("");
    props.addressChanged("");
    props.phoneChanged("");
    props.genderChanged("");
    props.languageChanged("");
    props.subjectChanged("");
    props.underSubjectChanged("");
    props.dossierimfChanged("");
    props.emailChanged("");
    props.codeChanged("");
    props.codeClientChanged("");
    props.recordedAtChanged("");
    props.collectChanged("");
    props.productChanged("");
    props.unitChanged("");
    props.contentChanged("");
    props.solutionChanged("");
    props.commentChanged("");
    props.newSolutionChanged("");
    props.newCommentChanged("");
    props.appraisalChanged("");
    props.statusChanged("");
    props.claimAssuranceErrors("");
    props.selectedItemChanged({});
    props.selectedFilesReset([]);
    props.selectedItemFilesChanged([]);
    props.selectedItemAudioChanged([]);
    setCurrentAudio("");
    setAudioPlayer("");
  };

  const handleCancel = (e) => {
    e.preventDefault();
    clearComponentState();
  };

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

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

  const handleValidation = () => {
    let isValid = true;

    if (
      props.new_solution === "" ||
      props.new_solution === undefined ||
      props.new_solution === null
    ) {
      isValid = false;
      errors["new_solution"] = "Champ incorrect";
    }
    if (
      props.new_comment === "" ||
      props.new_comment === undefined ||
      props.new_comment === null
    ) {
      isValid = false;
      errors["new_comment"] = "Champ incorrect";
    }

    return isValid;
  };
  const handleSolve = (e) => {
    e.preventDefault();
    if (handleValidation()) {
      let claim = {};
      claim["claimId"] = props.id;
      claim["treatorId"] = user.id;
      claim["solution"] = props.new_solution;
      claim["commentaire"] = props.new_comment;
      claim["type"] = "classee";

      //console.log("assuranceclaim",claim)
      props.etat2Changed(true);
      treatClaimApi(claim, props).then(() => {
        handleCancel(e);
        handleClose();
      });
    } else {
    }
    props.claimAssuranceErrors(errors);
  };
  const handleInterne = () => {
    setInterne(!interne);
  };

  {
    /* historique */
  }

  let details;

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
                                <RecordVoiceOverIcon sx={{ mr: 2 }} /> Solution
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
      details = "Aucune donnée";
    }
  } else if (props.solution.length === 0) {
    let affectation = "";
    if (props.status === "AFFECTED") {
      affectation = (
        <>
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

  let creationDate = props.created_at ? formatDate(props.created_at) : null;

  if (props.match.params.code !== "all") {
    const solutions = Array.isArray(props.solution) ? props.solution : [];
    const statusCfg = STATUS_CONFIG[props.status] || { label: props.status || "—", bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };

    return (
      <TraitementShell
        onBack={() => history.push("/reclamations/classees/all")}
        codeClient={props.codeClient || props.code}
        status={props.status}
        risqueLevel={props.selectedItem?.objet?.risqueLevel}
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
        visibleActions={[]}
        selectedItemFiles={props.selectedItemFiles}
        selectedItemAudio={props.selectedItemAudio}
        attachmentList={attachmentList}
        audioList={audioList}
        solution={props.solution}
        customTabs={[
          /* ── Tab 1 : Dossier classé ── */
          {
            key: "classe",
            label: "Dossier classé",
            content: (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Statut */}
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 14 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b21a8" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Statut du dossier
                  </div>
                  <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12.5, fontWeight: 700, background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Solutions proposées — timeline */}
                {solutions.length > 0 && (
                  <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Solutions proposées
                      <span style={{ marginLeft: 4, background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, padding: "1px 9px", fontSize: 11.5, fontWeight: 700 }}>{solutions.length}</span>
                    </div>
                    <div style={{ position: "relative", paddingLeft: 28 }}>
                      <div style={{ position: "absolute", left: 11, top: 6, bottom: 6, width: 2, background: "#e2e8f0", borderRadius: 2 }} />
                      {solutions.map((sol, idx) => {
                        const isLast = idx === solutions.length - 1;
                        const m = sol.satisfactionMeasureDto;
                        const MMAP = { SATISFIED: { label: "Satisfait", bg: "#f0fdf4", color: "#166534", dot: "#22c55e" }, PARTIAL: { label: "Partiellement satisfait", bg: "#fffbeb", color: "#92400e", dot: "#f59e0b" }, UNSATISFIED: { label: "Non satisfait", bg: "#fef2f2", color: "#991b1b", dot: "#ef4444" } };
                        const mc = m ? (MMAP[m.status] || { label: m.status, bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" }) : null;
                        const dotColor = mc ? mc.dot : "#10b981";
                        return (
                          <div key={sol.id ?? idx} style={{ position: "relative", marginBottom: isLast ? 0 : 20 }}>
                            <div style={{ position: "absolute", left: -22, top: 14, width: 16, height: 16, borderRadius: "50%", background: dotColor, border: "3px solid #fff", boxShadow: `0 0 0 2px ${dotColor}`, zIndex: 1 }} />
                            <div style={{ background: "#fff", border: isLast ? `1.5px solid ${dotColor}` : "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: isLast ? `0 2px 12px ${dotColor}22` : "0 1px 3px rgba(0,0,0,0.04)" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: isLast && mc ? mc.bg : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: dotColor }}>Solution {idx + 1}</div>
                                {sol.author?.firstAndLastName && (
                                  <div style={{ fontSize: 11.5, color: "#64748b" }}>{sol.author.firstAndLastName}</div>
                                )}
                              </div>
                              <div style={{ padding: "12px 14px" }}>
                                <div style={{ fontSize: 13.5, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap", borderLeft: `3px solid ${dotColor}`, paddingLeft: 10 }}>
                                  {sol.content || sol.solution || "—"}
                                </div>
                              </div>
                              {sol.commentaire && (
                                <div style={{ padding: "0 14px 12px" }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Commentaire</div>
                                  <div style={{ fontSize: 12.5, color: "#64748b", fontStyle: "italic", lineHeight: 1.6 }}>{sol.commentaire}</div>
                                </div>
                              )}
                              {mc && (
                                <div style={{ margin: "0 14px 12px", borderRadius: 8, padding: "8px 12px", background: mc.bg, border: `1px solid ${mc.dot}33` }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: mc.dot, flexShrink: 0 }} />
                                    <span style={{ fontSize: 12.5, fontWeight: 600, color: mc.color }}>{mc.label}</span>
                                  </div>
                                  {m.commentaire && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, paddingLeft: 14, fontStyle: "italic" }}>{m.commentaire}</div>}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ),
          },

          /* ── Tab 2 : Médias & Contenu ── */
          {
            key: "medias",
            label: "Médias & Contenu",
            content: (() => {
              const filesCount = props.selectedItemFiles?.length ?? 0;
              const audiosCount = props.selectedItemAudio?.length ?? 0;
              const extrasCount = props.extras?.filter(e => e.contenu)?.length ?? 0;
              const contentsCount = (props.content ? 1 : 0) + extrasCount;

              const AccordionSection = ({ color, dotColor, icon, title, count, children }) => {
                const [isOpen, setIsOpen] = useState(true);
                return (
                  <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <button onClick={() => setIsOpen(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>{title}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", background: dotColor, borderRadius: 20, padding: "2px 9px", marginRight: 8 }}>{count}</span>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>{isOpen ? "▲" : "▼"}</span>
                    </button>
                    {isOpen && <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 18px" }}>{children}</div>}
                  </div>
                );
              };

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <AccordionSection color="#ede9fe" dotColor="#8b5cf6" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>} title="Contenus" count={contentsCount}>
                    {contentsCount > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {props.content && (
                          <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "12px 16px" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Contenu initial</div>
                            <div style={{ fontSize: 13.5, color: "#1e293b", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{props.content}</div>
                          </div>
                        )}
                        {props.extras?.filter(e => e.contenu).map((extra, idx) => (
                          <div key={extra.id ?? idx} style={{ background: "#faf5ff", borderRadius: 10, border: "1px solid #ede9fe", padding: "12px 16px" }}>
                            <div style={{ fontSize: 13.5, color: "#1e293b", whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 6 }}>{extra.contenu}</div>
                            <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                              {extra.user?.firstAndLastName && <span>User {extra.user.firstAndLastName}</span>}
                              {extra.createdAt && <span> le {formatDate(extra.createdAt)}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>Aucun contenu</div>}
                  </AccordionSection>

                  <AccordionSection color="#dbeafe" dotColor="#3b82f6" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>} title="Fichiers joints" count={filesCount}>
                    {filesCount > 0 ? attachmentList : <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>Aucun fichier joint</div>}
                  </AccordionSection>

                  <AccordionSection color="#dcfce7" dotColor="#22c55e" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>} title="Audios" count={audiosCount}>
                    {audiosCount > 0 ? audioList : <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>Aucun audio</div>}
                  </AccordionSection>
                </div>
              );
            })(),
          },

          /* ── Tab 3 : Historique ── */
          {
            key: "historique",
            label: "Historique",
            content: (
              <HistoriqueTimeline
                recorded_at={props.recorded_at}
                created_by={props.created_by}
                transmitted={props.selectedItem?.transmitted != null ? "" + props.selectedItem.transmitted : ""}
                transmittedBy={props.selectedItem?.transmittedBy?.firstAndLastName}
                transmittedTo={props.selectedItem?.transmittedTo?.firstAndLastName}
                handled_by={props.handled_by}
                assigned_by={props.selectedItem?.treatmentAffectedBy?.firstAndLastName}
                assignedAt={props.selectedItem?.affectedAt}
                solution={Array.isArray(props.solution) ? props.solution : []}
                formatDate={formatDate}
                formatDate3={formatDate3}
              />
            ),
          },
        ]}
      />
    );
  }

  return (
    <div id="main">
      <audio ref={audioRef} src={currentAudio} hidden />
      <div className="row">
        <div className="col s12">
          <div className="container">
            <section className="tabs-vertical mt-1 section">
              <div className="row">
                <div className="col l12 s12 pb-5">
                  <div className="card-panel pb-5">
                    <DossierKPIBar items={content} kpiCards={CLS_KPI_CARDS} />
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2, pb: 2, borderBottom: "1px solid #F1F5F9" }}>
                      {CLS_CHIPS.map((chip) => {
                        const count = content.filter(chip.filter).length;
                        const isActive = activeFilter === chip.value;
                        return (
                          <ButtonBase key={chip.value} onClick={() => setActiveFilter(chip.value)} sx={{ borderRadius: "20px", px: 1.5, py: 0.5, border: isActive ? "1.5px solid #93C5FD" : "1.5px solid #E2E8F0", backgroundColor: isActive ? "#EFF6FF" : "#FAFAFA", color: isActive ? "#1D4ED8" : "#64748B", fontWeight: isActive ? 700 : 500, fontSize: "0.78rem", transition: "all 0.18s", display: "flex", alignItems: "center", gap: 0.8, "&:hover": { backgroundColor: "#EFF6FF", color: "#1D4ED8", borderColor: "#93C5FD" } }}>
                            <span style={{ fontSize: "inherit", fontWeight: "inherit", lineHeight: 1.4 }}>{chip.label}</span>
                            <Box sx={{ minWidth: 20, height: 20, borderRadius: "10px", backgroundColor: isActive ? "#1D4ED8" : "#E2E8F0", color: isActive ? "#fff" : "#64748B", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", px: 0.6 }}>{count}</Box>
                          </ButtonBase>
                        );
                      })}
                    </Box>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <h5 className="card-title" style={{ fontWeight: 700, color: "#0F172A", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                        Réclamations classées
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
                          statusOptions={CLS_STATUS_OPTIONS}
                        />
                      ) : (
                        <ClaimsCardView
                          items={filteredContent}
                          mode={1}
                          objets={[]}
                          onCardClick={(data) => rowClickedHandler(null, data, 0)}
                        />
                      )}
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
                        sx={{
                          position: "relative",
                          backgroundColor: "#1e2188",
                        }}
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
                            <div className="row" id="ententeFiche">
                              <div className="col s12">
                                <h5 className="card-title">
                                  Fiche de la réclamation
                                </h5>
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
                                    <div
                                      className="col l6 s12 df pb-2"
                                      id="code"
                                    >
                                      <PinIcon sx={{ mr: 2 }} /> {props.codeClient}
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

                                    <div
                                      className="col l6 s12 df pb-2"
                                      id="unit"
                                    >
                                      <AddBusinessIcon sx={{ mr: 2 }} />{" "}
                                      {props.unit}
                                    </div>

                                    <div
                                      className="col l6 s12 df pb-2"
                                      id="content"
                                    >
                                      <SupportAgentIcon sx={{ mr: 2 }} />{" "}
                                      {props.created_by}
                                    </div>

                                    <div
                                      className="col l6 s12 df pb-2"
                                      id="content"
                                    >
                                      <CalendarTodayIcon sx={{ mr: 2 }} />{" "}
                                      {creationDate}
                                    </div>

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

                                    {/* {dimf = props.dossierimf !=="" ? <><div className="col s6 df pb-2" id="dossierimf"> <FolderSharedIcon sx={{ mr: 2}}/> {props.dossierimf}</div></>:""}
                                    {crew = props.crew !=="" ? <><div className="col s6 df pb-2" id="dossierimf"> <Diversity3Icon sx={{ mr: 2}}/> {props.crew}</div></>:""} */}
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
                                      Fichiers
                                    </Typography>
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
                            <div className="row" id="ententeFiche">
                              <div className="col s12">
                                <h5 className="card-title df ">
                                  Détails de la réclamation
                                </h5>
                              </div>
                            </div>
                            <div className="col s12 input-field">
                              Etat: &nbsp;{statusElt}
                            </div>

                            {historique}

                            {/* {props.authorize ? (
                              <>
                                <form id="claimHandleForm">
                                  <div className="row">
                                    <div className="col s12">
                                      <details open>
                                        <summary className="text-details">
                                          Déclassifier la réclamation
                                        </summary>

                                        <div className="col s12 input-field">
                                          <textarea
                                            id="new_solution"
                                            name="new_solution"
                                            placeholder=""
                                            className="materialize-textarea textarea-size"
                                            value={props.new_solution}
                                            onChange={(e) =>
                                              props.newSolutionChanged(
                                                e.target.value
                                              )
                                            }
                                          ></textarea>
                                          <label
                                            htmlFor="new_solution"
                                            className={"active"}
                                          >
                                            Nouvelle Solution
                                            <span>
                                              (
                                              <span className="red-text darken-2 ">
                                                *
                                              </span>
                                              )
                                            </span>
                                          </label>
                                          <small className="errorTxt4">
                                            <div
                                              id="cpassword-error"
                                              className="error"
                                            >
                                              {props.errors !== undefined
                                                ? props.errors.new_solution
                                                : ""}
                                            </div>
                                          </small>
                                        </div>
                                        <div className="col s12 input-field">
                                          <textarea
                                            id="new_comment"
                                            name="new_comment"
                                            placeholder=""
                                            className="materialize-textarea textarea-size"
                                            value={props.new_comment}
                                            onChange={(e) =>
                                              props.newCommentChanged(
                                                e.target.value
                                              )
                                            }
                                          ></textarea>
                                          <label
                                            htmlFor="new_comment"
                                            className={"active"}
                                          >
                                            Nouveaux Commentaires/Observations
                                            <span>
                                              (
                                              <span className="red-text darken-2 ">
                                                *
                                              </span>
                                              )
                                            </span>
                                          </label>
                                          <small className="errorTxt4">
                                            <div
                                              id="cpassword-error"
                                              className="error"
                                            >
                                              {props.errors !== undefined
                                                ? props.errors.new_comment
                                                : ""}
                                            </div>
                                          </small>
                                        </div>
                                        <div className="col s12 display-flex justify-content-end mt-3">
                                          
                                          <LoadingButton
                                            onClick={
                                              handleSolve
                                            }
                                            className="waves-effect waves-effect-b waves-light btn-small"
                                            loading={props.etat2}
                                            loadingPosition="end"
                                            endIcon={<SaveIcon />}
                                            variant="contained"
                                            sx={{ backgroundColor:"#1e2188",textTransform:"initial" }}
                                          >
                                              <span>Résoudre</span>
                                          </LoadingButton>
                                        </div>
                                      </details>
                                    </div>
                                  </div>
                                </form>
                              </>
                            ) : (
                              <>
                              
                                <div className="row">
                                  <div className="col s12">
                                    <details open>
                                      <summary className="text-details">
                                        Resolution de la réclamation
                                      </summary>
                                      <div className="card-alert card red lighten-5" >
                                        <div className="card-content red-text" style={{ textAlign:"center" }}>
                                          <ul>
                                            Vous ne pouvez pas traiter cette
                                            reclamation
                                          </ul>
                                        </div>
                                      </div>
                                    </details>
                                  </div>
                                </div>
                              </>
                            )} */}
                          </div>
                        </div>
                      </div>
                    </Dialog>
                  </div>
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
    isLoading: state.claim_assurance.isLoading,
    id: state.claim_assurance.id,
    firstname: state.claim_assurance.firstname,
    lastname: state.claim_assurance.lastname,
    address: state.claim_assurance.address,
    phone: state.claim_assurance.phone,
    gender: state.claim_assurance.gender,
    language: state.claim_assurance.language,
    dossierimf: state.claim_assurance.dossierimf,
    email: state.claim_assurance.email,
    code: state.claim_assurance.code,
    codeClient: state.claim_assurance.codeClient,
    recorded_at: state.claim_assurance.recorded_at,
    collect: state.claim_assurance.collect,
    subject: state.claim_assurance.subject,
    underSubject: state.claim_assurance.underSubject,
    product: state.claim_assurance.product,
    unit: state.claim_assurance.unit,
    content: state.claim_assurance.content,
    extras: state.claim_assurance.extras,
    status: state.claim_assurance.status,
    motif: state.claim_assurance.motif,
    solution: state.claim_assurance.solution,
    comment: state.claim_assurance.comment,
    new_solution: state.claim_assurance.new_solution,
    new_comment: state.claim_assurance.new_comment,
    created_by: state.claim_assurance.created_by,
    created_at: state.claim_assurance.created_at,
    assigned_by: state.claim_assurance.assigned_by,
    handled_at: state.claim_assurance.handled_at,
    handled_by: state.claim_assurance.handled_by,
    resolved_at: state.claim_assurance.resolved_at,
    resolved_by: state.claim_assurance.resolved_by,
    appraised_at: state.claim_assurance.appraised_at,
    appraised_by: state.claim_assurance.appraised_by,
    appraisal: state.claim_assurance.appraisal,
    errors: state.claim_assurance.claim_assurance_errors,
    items: state.claim_assurance.items,
    agents: state.claim_assurance.agents,
    external_remedies: state.claim_assurance.external_remedies,
    selectedItem: state.claim_assurance.selectedItem,
    selectedFiles: state.claim_assurance.selectedFiles,
    selectedItemFiles: state.claim_assurance.selectedItemFiles,
    selectedItemAudio: state.claim_assurance.selectedItemAudio,
    authorize: state.claim_assurance.authorize,
    etat2: state.claim_assurance.etat2,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loading: (err) => {
      dispatch(loading(err));
    },
    claimAssuranceErrors: (err) => {
      dispatch(claimAssuranceErrors(err));
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
    newSolutionChanged: (solution) => {
      dispatch(newSolutionChanged(solution));
    },
    newCommentChanged: (comment) => {
      dispatch(newCommentChanged(comment));
    },
    handledByChanged: (handledBy) => {
      dispatch(handledByChanged(handledBy));
    },
    createdByChanged: (createdBy) => {
      dispatch(createdByChanged(createdBy));
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
    selectedItemChanged: (selectedItem) => {
      dispatch(selectedItemChanged(selectedItem));
    },
    externalRemediesChanged: (externalRemedies) => {
      dispatch(externalRemediesChanged(externalRemedies));
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
    etat2Changed: (etat2) => {
      dispatch(etat2Changed(etat2));
    },
    extrasChanged: (extra) => {
      dispatch(extrasChanged(extra));
    },
    codeClientChanged: (codeClient) => {
      dispatch(codeClientChanged(codeClient));
    },
    createdAtChanged: (createdAt) => {
      dispatch(createdAtChanged(createdAt));
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListeReclamationsClassees);
