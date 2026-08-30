import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  addressChanged,
  agentsChanged,
  appraisalChanged,
  claimAppraiseErrors,
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
  solutionChanged,
  statusChanged,
  subjectChanged,
  unitChanged,
  extrasChanged,
  collectChanged,
  dossierimfChanged,
  emailChanged,
  authorizeChanged,
  solutionIdChanged,
  createdByChanged,
  createdAtChanged,
  etatChanged,
  selectedItemAudioChanged,
  etat2Changed,
  underSubjectChanged,
  commentaChanged,
  codeClientChanged,
} from "../../redux/actions/Reclamations/MesureReclamationActions";
import ReactDatatable from "@ashvin27/react-datatable";
import { ButtonBase } from "@mui/material";
import DossierKPIBar from "../../components/shared/DossierKPIBar";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ClaimsTable from "./components/ClaimsTable";
import ClaimsCardView from "./components/ClaimsCardView";
import Select from "react-select";
import EmailIcon from '@mui/icons-material/Email';
// import partiel_icon from "../../assets/images/mesure/partial.svg"
// import satisfaire_icon from "../../assets/images/mesure/satisfied3.svg"
// import unsatisfaire_icon from "../../assets/images/mesure/unsatisfied2.svg"
import partiel_icon from "../../assets/images/mesure/emo2.svg";
import satisfaire_icon from "../../assets/images/mesure/emo3.svg";
import unsatisfaire_icon from "../../assets/images/mesure/emo1.svg";
import TextField from "@mui/material/TextField";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import TraitementShell from "../../components/treatment/TraitementShell";
import HistoriqueTimeline from "../../components/treatment/HistoriqueTimeline";
import {
  formatDate,
  formatDate3,
  formatDate4,
  guessExtension,
  loadItemFromSessionStorage,
  loadItemFromLocalStorage,
  sleep,
  cleanPhoneNumber3,
  today,
} from "../../Utils/utils";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PrintIcon from "@mui/icons-material/Print";
import { connect } from "react-redux";
import {
  addExtraClaimApi,
  downloadAudioApi,
  downloadFillesApi,
  getClaimAudioApi,
  getFillesApi,
  listeByStatut,
  mesurerClaimSolutionApi,
  unapproveClaimSolutionApi,
  deleteFileApi,
  deleteAudioApi,
  deleteExtraContentApi,
} from "../../apis/Reclamations/ReclamationsApi";
import { modalify } from "../../Utils/modal";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WaAudioSection from "../../whatgpr/components/WaAudioSection";
import AudioGrid from "../../whatgpr/components/AudioGrid";
import useWaAudioJump from "../../whatgpr/hooks/useWaAudioJump";
import { splitWaAudios } from "../../whatgpr/utils";
import useSSE from "../../whatgpr/hooks/useSSE";
import { getClaimsNeedingPilotComment } from "../../whatgpr/api";
import SendSolutionWhatsappDialog from "../../whatgpr/components/SendSolutionWhatsappDialog";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Input,
  Box,
  CardContent,
  Grid,
  Tooltip,
  List,
  ListItemButton,
  ListItemText,
  Card,
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
import { LoadingButton } from "@mui/lab";
import { KTApp } from "../../Utils/blockui";
import { notify } from "../../Utils/alert";
import { send } from "../../apis/Configurations/SmsApi";
import SaveIcon from "@mui/icons-material/Save";
import { licenseInfo } from "../../apis/LoginApi";
import axios from "axios";
import { HOST } from "../../Utils/globals";
import { sendEmail } from "../../apis/Configurations/MailApi";
import WarningIcon from "@mui/icons-material/Warning";
import { STATUS_CONFIG } from "./components/ClaimStatusBadge";

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

const MES_KPI_CARDS = [
  {
    key: "total",
    label: "Total",
    icon: AssignmentIcon,
    iconBg: "#DBEAFE", iconColor: "#1D4ED8", borderColor: "#3B82F6",
    filter: () => true,
  },
  {
    key: "treat",
    label: "Traitée",
    icon: AccessTimeIcon,
    iconBg: "#D1FAE5", iconColor: "#065F46", borderColor: "#10B981",
    filter: (c) => c.status === "TREAT",
  },
];

const MES_STATUS_OPTIONS = [
  { value: "",       label: "Tous les statuts" },
  { value: "TREAT",  label: "Traitée" },
];

const MES_CHIPS = [
  { value: "ALL",   label: "Tous",    filter: () => true },
  { value: "TREAT", label: "Traitée", filter: (c) => c.status === "TREAT" },
];

const MesurerReclamation = (props) => {
  let dimf, crew, emailDisplay;

  const { waAudios, regularAudios } = splitWaAudios(props.selectedItemAudio);
  const { highlightedAudioId, handleJumpToWhatsappAudioComment } = useWaAudioJump(waAudios);
  const [showSolutionWaModal, setShowSolutionWaModal] = useState(false);
  const [needingCommentIds, setNeedingCommentIds] = useState([]);
  const [needingCommentData, setNeedingCommentData] = useState([]);

  // Charge les réclamations dont le client a mesuré la satisfaction via WhatsApp sans
  // laisser de commentaire (nécessite l'action du pilote pour en ajouter un manuellement).
  const loadNeedingComment = () => {
    getClaimsNeedingPilotComment().then((rows) => {
      const list = rows || [];
      setNeedingCommentIds(list.map((r) => r.claim_id));
      setNeedingCommentData(list);
    });
  };

  useEffect(() => {
    loadNeedingComment();
  }, []);

  // Recharge les détails d'une réclamation précise (utilisé au montage ET pour rafraîchir
  // en direct la page détail quand le client répond au sondage pendant qu'elle est ouverte).
  const loadClaimDetails = async (code) => {
    let cc = await axios({
      method: "get",
      url: HOST + "api/v1/claim/" + code + "/details",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + loadItemFromSessionStorage("token"),
      },
    });
    if (cc.status >= 200 && cc.status <= 299) {
      let data = cc.data.content;

      clearComponentState();

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
      props.productChanged(
        data.product.libelle ? data.product.libelle : ""
      );
      props.unitChanged(
        data.servicePoint.libelle ? data.servicePoint.libelle : ""
      );
      props.contentChanged(data.content ? data.content : "");
      props.solutionChanged(data.solutionDtos ? data.solutionDtos : "");
      props.solutionIdChanged(
        data.solutionDtos[0] !== undefined ? data.solutionDtos[0].id : ""
      );
      props.createdByChanged(
        data.collector.firstAndLastName
          ? data.collector.firstAndLastName
          : ""
      );
      props.commentChanged(data.comment ? data.comment : "");
      props.statusChanged(data.status ? data.status : "");
      props.selectedItemChanged(data);
      setCurrentData(data);

      getFillesApi(data.id, props);
      getClaimAudioApi(data.id, props);
    }
  };

  // Rafraîchissement en direct quand un client répond au sondage de satisfaction WhatsApp
  useSSE({
    survey_response: () => {
      if (props.match.params.code === "all") {
        listeByStatut(props, "TREAT").then(() => {}).catch(() => {});
        loadNeedingComment();
      } else {
        // Le pilote est sur la page détail de CETTE réclamation : dès que le client
        // répond (mesure + commentaire), on le redirige vers la liste plutôt que de
        // recharger le détail sur place.
        loadNeedingComment();
        sessionStorage.removeItem('gpr_mes_code');
        history.push("/reclamations/mesure/all");
      }
    },
  });

  // Pré-sélectionne le niveau de satisfaction déjà donné par le client via WhatsApp,
  // pour le dossier actuellement ouvert, quand il attend encore un commentaire pilote.
  useEffect(() => {
    if (!props.id || !needingCommentData.length) return;
    const t = setTimeout(() => {
      const survey = needingCommentData.find((r) => String(r.claim_id) === String(props.id));
      if (!survey) return;
      const mapping = { SATISFIED: "SATISFIED", PARTIAL: "PARTIAL", UNSATISFIED: "UNSATISFIED" };
      const val = mapping[survey.satisfaction];
      if (val && props.appraisal !== val) props.appraisalChanged(val);
    }, 150);
    return () => clearTimeout(t);
  }, [props.id, needingCommentData, props.appraisal]);

  const [open, setOpen] = React.useState(false);
  const [openModal, setOpenModal] = useState(null);
  const [showAudioPlayer, setAudioPlayer] = useState("");
  const [currentAudio, setCurrentAudio] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [currentData, setCurrentData] = useState(null);
  const [audioListForm, setAudioListForm] = useState([]);
  const [audioListUrlForm, setAudioListUrlForm] = useState([]);

  useEffect(() => { }, [showAudioPlayer, currentAudio]);

  const [isLoading, setIsLoading] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
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
  const [showMailModal, setShowMailModal] = useState(false);
  const [loadingMail, setLoadingMail] = useState(false);
  const [mediaAccordion, setMediaAccordion] = useState({ files: true, audios: true, contents: true });
  const mesureFormRef = useRef(null);
  const clearFiles = () => {
    if (inputRef.current) {
      inputRef.current.value = null;
    }
    setFiles([]);
  };

  const history = useHistory();
  const handleClose = () => {
    setOpen(false);
    clearComponentState();
    sessionStorage.removeItem('gpr_mes_code');
    history.push("/reclamations/mesure/all");
  };

  let user =
    loadItemFromSessionStorage("app-user") !== undefined
      ? loadItemFromSessionStorage("app-user")
      : undefined;
  let hbt = user.posteDto.habilitations.split(",");
  let addR = user.additionalRole;

  const { recorderState, ...handlers } = useRecorder();
  let { audio } = recorderState;

  const [open2, setOpen2] = useState(false);
  const [showAudioBox, setAudioBox] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [activeFilter, setActiveFilter] = useState("ALL");

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

  useEffect(() => {
    if (audio) {
      setAudioListForm([...audioListForm, audio]);
      setAudioListUrlForm([...audioListUrlForm, URL.createObjectURL(audio)]);
    }
  }, [audio]);


  useEffect(() => {
    const urlCode = props.match?.params?.code;
    const code = (urlCode && urlCode !== "all") ? urlCode : sessionStorage.getItem('gpr_mes_code');
    if (code) loadClaimDetails(code);
  }, []);

  useEffect(() => {
    KTApp.blockPage({
      overlayColor: "#000000",
      type: "v2",
      state: "danger",
      message: "En cours de chargement...",
    });
    setIsLoading(true);

    if (props.match.params.code === "all") {
      props.itemsChanged([]);
      listeByStatut(props, "TREAT")
        .then((r) => { })
        .finally(() => {
          setIsLoading(false);
          KTApp.unblockPage();
        });
    } else {
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

  useEffect(() => {
    const fetchData = async () => {
      await licenseControl();
    };

    fetchData();
  }, []);

  const [loading, setLoading] = useState(false);
  const [smsSegments, setSmsSegments] = useState([]);
  let appSms =
    loadItemFromLocalStorage("app-sms") !== undefined &&
      loadItemFromLocalStorage("app-sms").length !== 0
      ? loadItemFromLocalStorage("app-sms")
      : undefined;

  const segmentMessage = (message, maxLength = 150) => {
    const segments = [];
    let start = 0;

    while (start < message.length) {
      // Si le reste du texte est plus court que maxLength → on prend tout
      if (message.length - start <= maxLength) {
        segments.push(message.slice(start).trim());
        break;
      }

      // Chercher le dernier point dans la zone autorisée
      let end = message.lastIndexOf(".", start + maxLength);
      if (end === -1 || end < start) {
        end = message.lastIndexOf(" ", start + maxLength);
      }
      if (end === -1 || end < start) {
        end = start + maxLength;
      }

      segments.push(message.slice(start, end + 1).trim());
      start = end + 1;
    }

    return segments;
  };

  const handleShowModalSms = async () => {
    if (!props.solution[0]) {
      notify("Aucune solution à envoyer", "error");
      return;
    } else {
      if (
        props.solution[0].content === "" ||
        props.solution[0].content === undefined
      ) {
        notify("Aucune solution à envoyer", "error");
        return;
      }
    }

    const message = props.solution[0].content;
    const segments = segmentMessage(message, 150);

    setSmsSegments(segments);
    setShowUploadModal(true);
  };


  const handleShowModalMail = () => {
    if (!props.solution[0] || props.solution[0].content === "") {
      notify("Aucune solution à envoyer", "error");
      return;
    }
    const message = props.solution[0].content;
    const segments = segmentMessage(message, 150);
    setSmsSegments(segments);
    setShowMailModal(true);
  };

  const handleMail = async () => {
    setShowMailModal(false);
    if (props.phone) {
      setLoadingMail(true);
      KTApp.blockPage({
        overlayColor: "#000000",
        type: "v2",
        state: "danger",
        message: "Envoi en cours...",
      });
      try {

        await sendEmail({
          email: props.email,
          subject: "Solution à votre réclamation ",
          message: props.solution[0].content,
          commentaire: props.solution[0].commentaire,
          claimId: props.id || null,
          claimCode: props.codeClient || null,
          claimType: "CLAIM",
          senderName: user?.firstAndLastName || null,
          senderEmail: user?.email || null,
        });
        notify("Mail envoyé avec succès", "success");
      } catch (err) {
        notify("Oups - Mail non envoyé", "error");
      } finally {
        setLoadingMail(false);
        KTApp.unblockPage();
      }
    } else {
      notify("Les champs sont obligatoires", "error");
    }
  };



  const handleSms = async () => {
    setShowUploadModal(false);

    if (props.phone) {
      setLoading(true);
      KTApp.blockPage({
        overlayColor: "#000000",
        type: "v2",
        state: "danger",
        message: "En cours...",
      });

      try {
        for (const segment of smsSegments) {
          await send({
            phone: cleanPhoneNumber3(props.phone),
            message: segment,
            claimId: props.id || null,
            claimCode: props.codeClient || null,
            claimType: "CLAIM",
            senderName: user?.firstAndLastName || null,
            senderEmail: user?.email || null,
          });

          await sleep(500); // petite pause entre chaque SMS si besoin
        }
        notify("Super - SMS envoyé", "success");
      } catch (err) {

        notify("Oups - SMS non envoyé", "error");
      } finally {
        setLoading(false);
        KTApp.unblockPage();
      }
    } else {
      notify("Les champs sont obligatoires", "error");
    }
  };

  let statusElt;

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
        // let statusElt;

        switch (claim.status) {
          case "TREAT":
            statusElt = (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="chip treatBgColor z-depth-1">
                  <span className="">Traitée</span>
                </span>
                {needingCommentIds.includes(claim.id) && (
                  <span
                    title="Le client a mesuré la satisfaction via WhatsApp sans laisser de commentaire. Ajoutez un commentaire."
                    style={{ fontSize: 16, cursor: "help" }}
                  >
                    ⚠️
                  </span>
                )}
              </span>
            );
            break;
          default:
            statusElt = "Nan";
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
    props.appraisalChanged("");
    sessionStorage.setItem('gpr_mes_code', data.code);
    history.push("/reclamations/mesure/" + data.code, { from: 'mesure' });
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
    props.solutionIdChanged(
      data.solutionDtos[0] !== undefined ? data.solutionDtos[0].id : ""
    );
    props.createdAtChanged(data.createdAt ? data.createdAt : "");
    props.createdByChanged(
      data.collector.firstAndLastName ? data.collector.firstAndLastName : ""
    );
    // props.commentChanged(data.comment ? data.comment : "");
    props.statusChanged(data.status ? data.status : "");
    props.handledByChanged(data.treatmentAffectedTo?.firstAndLastName ?? "");
    props.selectedItemChanged(data);
    setCurrentData(data);
    props.extrasChanged(data.extras ?? []);

    // console.log("soluion",props.solutionId)
    //fetch attachments for selected claim
    // http.get("/files/list/claim/" + data.code).then((response) => {
    //   props.selectedItemFilesChanged(response.data);
    // });

    getFillesApi(data.id, props);
    getClaimAudioApi(data.id, props);
  };

  let appraisalOptions = [
    { value: "SATISFIED", label: "Satisfait" },
    { value: "PARTIAL", label: "Partiellement satisfait" },
    { value: "UNSATISFIED", label: "Non Satisfait" },
  ];
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
    props.recordedAtChanged("");
    props.collectChanged("");
    props.productChanged("");
    props.unitChanged("");
    props.contentChanged("");
    props.solutionChanged("");
    props.commentChanged("");
    props.commentaChanged("");
    props.appraisalChanged("");
    props.statusChanged("");
    props.claimAppraiseErrors("");
    props.selectedItemChanged({});
    props.selectedFilesReset([]);
    props.selectedItemFilesChanged([]);
    props.selectedItemAudioChanged([]);
    setCurrentAudio("");
    setAudioPlayer("");

    props.motifChanged("");
  };

  const handleCancel = (e) => {
    e.preventDefault();
    clearComponentState();
  };
  const handleValidationForAppraise = () => {
    let isValid = true;

    if (
      props.appraisal === "" ||
      props.appraisal === undefined ||
      props.appraisal === null
    ) {
      isValid = false;
      errors["appraisal"] =
        "Prenez une décision en fonction de la satisfaction du client";
    }

    if (
      ((props.appraisal === "PARTIAL" || props.appraisal === "UNSATISFIED") &&
        props.commenta === "") ||
      props.commenta === undefined ||
      props.commenta === null
    ) {
      isValid = false;
      errors["commenta"] = "Champ incorrect";
    }

    return isValid;
  };
  const handleAppraise = (e) => {
    e.preventDefault();
    if (handleValidationForAppraise()) {
      let claim = {};
      claim["claimId"] = props.id;
      claim["solutionId"] = props.solutionId || null;
      claim["satisfactionStatus"] = props.appraisal;
      claim["commentaire"] = props.commenta || "";
      claim["measurerId"] = user.id;
      console.log("[handleAppraise] payload envoyé:", claim);
      props.etatChanged(true);
      mesurerClaimSolutionApi(claim, props).then(() => {
        clearComponentState();
        handleClose();
      });
    } else {
    }
    props.claimAppraiseErrors(errors);
  };

  const handleValidationForDisapproval = () => {
    let isValid = true;
    if (
      props.motif === "" ||
      props.motif === undefined ||
      props.motif === null
    ) {
      isValid = false;
      errors["motif"] = "Champ incorrect";
    }

    return isValid;
  };

  const handleDisapprove = (e) => {
    e.preventDefault();
    if (handleValidationForDisapproval()) {
      let claim = {};
      claim["solutionId"] = props.solutionId;
      claim["claimId"] = props.id;
      claim["unApprouverId"] = user.id;
      claim["motifDesaprobation"] = props.motif;
      //  console.log("desaprobation",claim)
      props.etat2Changed(true);
      unapproveClaimSolutionApi(claim, props).then(() => {
        handleCancel(e);
        handleClose();
      });
    } else {
    }
    props.claimAppraiseErrors(errors);
  };

  const handleDeleteFile = (id) => {
    modalify(
      "Confirmation",
      "Confirmez vous la suppression de ce fichier ?",
      "confirm",
      () => {
        deleteFileApi(id).then((ok) => {
          if (ok) getFillesApi(currentData?.id, props);
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
          if (ok) getClaimAudioApi(currentData?.id, props);
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

  let mesureForm = "";
  if (hbt.includes("H5") || addR === "PILOTE") {
    mesureForm = (
      <>
        <form id="claimAppraiseForm">
          <div className="row">
            <div className="col s12">
              <details open>
                <summary className="text-details">
                  Mesure de la satisfaction
                </summary>

                <div className="col s12 input-field">
                  {/* <Select
                  options={appraisalOptions}
                  className="react-select-container mt-4"
                  classNamePrefix="react-select"
                  style={styles}
                  placeholder="Sélectionner la satisfaction du client"
                  onChange={(e) =>{
                    props.appraisalChanged(e.value)
                  }
                  }
                /> */}
                  <div
                    style={{
                      display: "flex",
                      flex: "1 auto",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      onClick={(e) => {
                        props.appraisalChanged("SATISFIED");
                      }}
                      style={{
                        padding: "17px 25px",
                        margin: "4px",
                        borderRadius: "10px",
                        backgroundColor:
                          props.appraisal === "SATISFIED"
                            ? "rgb(150 253 150)"
                            : "white",
                        color:
                          props.appraisal === "SATISFIED"
                            ? "darkgreen"
                            : "#005500",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: " rgba(0, 0, 0, 0.16) 0px 1px 4px",
                      }}
                    >
                      <img
                        src={satisfaire_icon}
                        style={{ width: "35px" }}
                        alt=""
                      />
                      <h7>
                        <b>Satisfait</b>
                      </h7>
                    </div>
                    <div
                      onClick={(e) => {
                        props.appraisalChanged("PARTIAL");
                      }}
                      style={{
                        padding: "17px 5px",
                        margin: "4px",
                        borderRadius: "10px",
                        backgroundColor:
                          props.appraisal === "PARTIAL" ? "#ff8100" : "white",
                        color:
                          props.appraisal === "PARTIAL" ? "white" : "#ff8100",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: " rgba(0, 0, 0, 0.16) 0px 1px 4px",
                      }}
                    >
                      <img
                        src={partiel_icon}
                        style={{ width: "35px" }}
                        alt=""
                      />
                      <b>Partiellement</b>
                      <b> Satisfait</b>
                    </div>
                    <div
                      onClick={(e) => {
                        props.appraisalChanged("UNSATISFIED");
                      }}
                      style={{
                        padding: "17px 25px",
                        margin: "4px",
                        borderRadius: "10px",
                        backgroundColor:
                          props.appraisal === "UNSATISFIED"
                            ? "#eda6a6"
                            : "white",
                        color: "darkred",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: " rgba(0, 0, 0, 0.16) 0px 1px 4px",
                      }}
                    >
                      <img
                        src={unsatisfaire_icon}
                        style={{ width: "35px" }}
                        alt=""
                      />
                      <h7>
                        <b>Non</b>{" "}
                      </h7>
                      <h7>
                        <b>Satisfait</b>{" "}
                      </h7>
                    </div>
                  </div>
                  <label htmlFor="gender" className={"active"}>
                    Le client est il satisfait?
                    <span>
                      (<span className="red-text darken-2 ">*</span>)
                    </span>
                  </label>
                  <small className="errorTxt4">
                    <div id="cpassword-error" className="error">
                      {props.errors !== undefined ? props.errors.appraisal : ""}
                    </div>
                  </small>
                </div>

                <div className="col s12 input-field">
                  <textarea
                    id="commenta"
                    name="commenta"
                    placeholder=""
                    className="materialize-textarea textarea-size"
                    value={props.commenta}
                    onChange={(e) => {
                      // console.log("typing", e.target.value);
                      props.commentaChanged(e.target.value)
                    }
                    }
                  ></textarea>
                  <label htmlFor="content" className={"active"}>
                    Commentaire par rapport à la mesure de satisfaction
                  </label>
                  <small className="errorTxt4">
                    <div id="cpassword-error" className="error">
                      {props.errors !== undefined ? props.errors.commenta : ""}
                    </div>
                  </small>
                </div>

                <div className="col s12 display-flex justify-content-end mt-3">
                  {/* {actif !== undefined && actif ? ( */}
                  <LoadingButton
                    onClick={handleAppraise}
                    className="waves-effect waves-effect-b waves-light btn-small"
                    loading={props.etat}
                    loadingPosition="end"
                    endIcon={<SaveIcon />}
                    variant="contained"
                    sx={{
                      backgroundColor: "var(--gpr-primary, #005081)",
                      textTransform: "initial",
                      "&:hover": { backgroundColor: "var(--gpr-primary-dark, #003d63)" },
                    }}
                  >
                    <span>Mesurer</span>
                  </LoadingButton>
                  {/* // ) 
                  // : (
                  //   <div className="card-alert card red lighten-5">
                  //     <div className="card-content red-text">
                  //       <ul>Veuillez activer une licence.</ul>
                  //     </div>
                  //   </div>
                  // )
                  // } */}
                </div>
              </details>
            </div>
          </div>
        </form>
      </>
    );
  } else {
    mesureForm = "";
  }

  let deForm = "";
  if (addR === "DE") {
    deForm = (
      <>
        <div className="row">
          <div className="col s12">
            <details>
              <summary className="text-details pb-5">
                Vous n'êtes pas d'accord avec la solution proposée ?
              </summary>

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
                {actif !== undefined && actif ? (
                  <>
                    <LoadingButton
                      onClick={handleDisapprove}
                      className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
                      loading={props.etat2}
                      loadingPosition="end"
                      endIcon={<SaveIcon />}
                      variant="contained"
                      sx={{ textTransform: "initial" }}
                    >
                      <span>Désapprouver</span>
                    </LoadingButton>
                  </>
                ) : (
                  <div className="card-alert card red lighten-5">
                    <div className="card-content red-text">
                      <ul>Veuillez activer une licence.</ul>
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>
      </>
    );
  } else {
    deForm = "";
  }

  let content = [];
  content = props.items;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const filteredContent = useMemo(() => {
    const chip = MES_CHIPS.find((c) => c.value === activeFilter);
    return chip ? content.filter(chip.filter) : content;
  }, [content, activeFilter]);

  //darrell : add custome attribut for search
  content.forEach((element) => {
    //client
    element.client = element.firstname + " " + element.lastname;
    //status
    let statusElt;

    switch (element.status) {
      case "TREAT":
        statusElt = "Traitée";
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
  // console.log("props created at", props.created_at);
  let creationDate = props.created_at ? formatDate(props.created_at) : null;

  const enfant = document.querySelector("#dialog-enfant");
  const confirmation = document.querySelector("#dialog-confirmation");
  const addFile = document.querySelector("#dialog-addFile");
  const noAccess = document.querySelector("#dialog-noAccess");
  const audioExtrat = document.querySelector("#dialog-audio");
  const contenuExtrat = document.querySelector("#dialog-contenu");
  const sendSms = document.querySelector("#dialog-sms");

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
  const sendSmsOuvert =
    sendSms && sendSms.getAttribute("aria-hidden") !== "true";

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
        "dialog-sms",
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
      !sendSmsOuvert
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

  if (props.match.params.code !== "all") {
    return (
      <>
        <TraitementShell
          onBack={() => { sessionStorage.removeItem('gpr_mes_code'); history.push("/reclamations/mesure/all"); }}
          codeClient={props.codeClient || props.code}
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
          content={props.content}
          extras={props.extras}
          onAddContent={() => { setShowExtraContent(true); setExtraContent(""); }}
          visibleActions={(hbt.includes("H5") || addR === "PILOTE") ? ["mesurer"] : []}
          onActionOverride={(key) => {
            if (key === "mesurer" && mesureFormRef.current) {
              mesureFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              mesureFormRef.current.style.transition = "box-shadow 0.4s, border-color 0.4s";
              mesureFormRef.current.style.boxShadow = "0 0 0 4px rgba(14, 165, 233, 0.4), 0 8px 32px rgba(14,165,233,0.2)";
              mesureFormRef.current.style.borderColor = "#0ea5e9";
              setTimeout(() => {
                if (mesureFormRef.current) {
                  mesureFormRef.current.style.boxShadow = "";
                  mesureFormRef.current.style.borderColor = "#e5e7eb";
                }
              }, 10000);
            }
          }}
          selectedItemFiles={props.selectedItemFiles}
          selectedItemAudio={props.selectedItemAudio}
          attachmentList={attachmentList}
          audioList={audioList}
          inputRef={inputRef}
          onFilesChange={(e) => setFiles([...e.target.files])}
          onAddAudio={() => { setAudioBox(true); setOpen2(true); }}
          transmitted={props.transmitted}
          transmittedBy={props.transmittedBy}
          transmittedTo={props.selectedItem?.transmittedTo?.firstAndLastName}
          handled_by={props.handled_by}
          assigned_by={props.selectedItem?.treatmentAffectedBy?.firstAndLastName}
          assignedAt={props.selectedItem?.affectedAt}
          solution={props.solution}
          customTabs={[
            /* ── Tab 1 : Solution transmise ── */
            {
              key: "solution",
              label: "Mesure de satisfaction",
              content: (() => {
                const sol = Array.isArray(props.solution) && props.solution.length > 0 ? props.solution[0] : null;
                const statusCfg = STATUS_CONFIG[props.status] || { label: props.status || "-", bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* ── Alerte : mesure WhatsApp sans commentaire, attire l'attention du pilote ── */}
                    {(() => {
                      const survey = needingCommentData.find(
                        (r) => String(r.claim_id) === String(props.id)
                      );
                      if (!survey) return null;
                      const satisfLabel =
                        survey.satisfaction === "UNSATISFIED"
                          ? { text: "😕 Non Satisfait", color: "#C62828", bg: "#FFEBEE" }
                          : survey.satisfaction === "PARTIAL"
                          ? { text: "😐 Partiellement Satisfait", color: "#E65100", bg: "#FFF3E0" }
                          : { text: "😊 Satisfait", color: "#2E7D32", bg: "#E8F5E9" };
                      return (
                        <div
                          style={{
                            padding: "12px 16px",
                            background: "#FFF8E1",
                            border: "1.5px solid #FFB300",
                            borderRadius: 8,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <div style={{ fontWeight: 700, color: "#E65100", fontSize: 13 }}>
                            ⚠️ Le client a mesuré la satisfaction via WhatsApp mais n'a pas laissé de
                            commentaire.
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 12, color: "#555" }}>Niveau de satisfaction :</span>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: satisfLabel.color,
                                background: satisfLabel.bg,
                                borderRadius: 6,
                                padding: "2px 10px",
                              }}
                            >
                              {satisfLabel.text}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* ── Solution / Réponse ── */}
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          Solution / Réponse de traitement
                        </div>
                      </div>
                      {sol ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ padding: "14px 18px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fafafa" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Solution</div>
                            <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                              {sol.content || sol.solution || "-"}
                            </div>
                          </div>
                          {sol.commentaire && (
                            <div style={{ padding: "14px 18px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fafafa" }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Commentaire</div>
                              <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                                {sol.commentaire}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "28px 0" }}>Aucune solution transmise</div>
                      )}

                    </div>

                    {/* ── Contacter le client ── */}
                    {(props.email || props.phone) && (
                      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "18px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 14 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          Contacter le client
                        </div>
                        {/* Infos destinataire */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{props.lastname || <em style={{ fontStyle: "italic", color: "#94a3b8" }}>Anonyme</em>}</div>
                            {props.email && <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{props.email}</div>}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {props.email && sol?.content && (
                            <button onClick={handleShowModalMail} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13, color: "#374151", fontWeight: 500 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                              Envoyer par email
                            </button>
                          )}
                          {props.phone && (
                            <button onClick={handleShowModalSms} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13, color: "#374151", fontWeight: 500 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.61 4.83 2 2 0 0 1 3.6 2.63h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.62 17.5z"/></svg>
                              {props.phone}
                            </button>
                          )}
                          {props.phone && props.solutionId && (
                            <button onClick={() => setShowSolutionWaModal(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "1px solid #25d366", background: "#fff", cursor: "pointer", fontSize: 13, color: "#25d366", fontWeight: 500 }}>
                              <WhatsAppIcon style={{ fontSize: 16 }} />
                              WhatsApp
                            </button>
                          )}
                        </div>
                        <SendSolutionWhatsappDialog
                          open={showSolutionWaModal}
                          onClose={() => setShowSolutionWaModal(false)}
                          phone={props.phone}
                          claimId={props.id}
                          solutionId={props.solutionId}
                          solutionText={props.solution?.[0]?.content}
                        />
                      </div>
                    )}

                    {/* ── Formulaire mesure de satisfaction ── */}
                    {(hbt.includes("H5") || addR === "PILOTE") && (() => {
                      const OPTIONS = [
                        { val: "SATISFIED",   icon: satisfaire_icon,   label: "Satisfait",   accent: "#22c55e", color: "#166534", bg: "#f0fdf4", circleBg: "#dcfce7", dots: 5 },
                        { val: "PARTIAL",     icon: partiel_icon,      label: "Partielle",   accent: "#f59e0b", color: "#92400e", bg: "#fffbeb", circleBg: "#fef3c7", dots: 3 },
                        { val: "UNSATISFIED", icon: unsatisfaire_icon, label: "Insatisfait", accent: "#ef4444", color: "#991b1b", bg: "#fef2f2", circleBg: "#fee2e2", dots: 1 },
                      ];
                      const selected = OPTIONS.find(o => o.val === props.appraisal);
                      return (
                        <div ref={mesureFormRef} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Mesure de satisfaction
                          </div>
                          {/* Carte preview */}
                          <div style={{ borderRadius: 12, border: `2px solid ${selected ? selected.accent : "#e2e8f0"}`, background: selected ? selected.bg : "#f8fafc", padding: "16px", textAlign: "center", marginBottom: 14, transition: "all 0.2s" }}>
                            {selected ? (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                                <div style={{ width: 52, height: 52, borderRadius: "50%", background: selected.circleBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <img src={selected.icon} alt={selected.label} style={{ width: 36 }} />
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: selected.color }}>{selected.label}</div>
                              </div>
                            ) : (
                              <div style={{ fontSize: 12.5, color: "#94a3b8" }}>Sélectionnez le niveau de satisfaction</div>
                            )}
                          </div>
                          {/* Sélection */}
                          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                            {OPTIONS.map(({ val, icon, label, accent, color, bg, dots }) => {
                              const isActive = props.appraisal === val;
                              return (
                                <div key={val} onClick={() => props.appraisalChanged(val)} style={{ flex: 1, position: "relative", cursor: "pointer", borderRadius: 12, border: isActive ? `2px solid ${accent}` : "2px solid #e2e8f0", background: isActive ? bg : "#fff", padding: "12px 8px", textAlign: "center", transition: "all 0.15s" }}>
                                  {isActive && (
                                    <div style={{ position: "absolute", top: -7, right: -7, width: 18, height: 18, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>
                                  )}
                                  <img src={icon} alt={label} style={{ width: 34, marginBottom: 4 }} />
                                  <div style={{ fontSize: 11.5, fontWeight: 700, color: isActive ? color : "#374151" }}>{label}</div>
                                  <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 4 }}>
                                    {[1,2,3,4,5].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i <= dots ? accent : "#e2e8f0" }} />)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {/* Commentaire */}
                          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginTop: 2, flexShrink: 0 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            <textarea value={props.commenta || ""} onChange={(e) => props.commentaChanged(e.target.value)} placeholder="Commentaire (optionnel)..." rows={2} style={{ flex: 1, border: "none", outline: "none", resize: "none", fontSize: 13, color: "#374151", background: "transparent", fontFamily: "inherit", lineHeight: 1.5 }} />
                          </div>
                          {props.errors?.appraisal && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 8 }}>{props.errors.appraisal}</div>}
                          {props.errors?.commenta && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 8 }}>{props.errors.commenta}</div>}
                          <button onClick={handleAppraise} disabled={props.etat} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: selected ? "var(--gpr-primary, #005081)" : "#e2e8f0", color: "#fff", fontSize: 14, fontWeight: 700, cursor: props.etat ? "not-allowed" : "pointer", opacity: props.etat ? 0.7 : 1, transition: "all 0.15s" }}>
                            {props.etat ? "En cours..." : "Valider"}
                          </button>
                        </div>
                      );
                    })()}

                  </div>
                );
              })(),
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

                const AccordionSection = ({ sectionKey, color, dotColor, icon, title, count, children }) => {
                  const isOpen = mediaAccordion[sectionKey];
                  return (
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                      <button
                        onClick={() => setMediaAccordion(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 10,
                          padding: "13px 18px", background: "transparent", border: "none",
                          cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <div style={{
                          width: 30, height: 30, borderRadius: 8, background: color,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 15, flexShrink: 0,
                        }}>{icon}</div>
                        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>{title}</span>
                        <span style={{
                          fontSize: 11.5, fontWeight: 700, color: "#fff",
                          background: dotColor, borderRadius: 20,
                          padding: "2px 9px", marginRight: 8,
                        }}>{count}</span>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>{isOpen ? "▲" : "▼"}</span>
                      </button>
                      {isOpen && (
                        <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 18px" }}>
                          {children}
                        </div>
                      )}
                    </div>
                  );
                };

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Barre d'actions compacte */}
                    <div style={{
                      background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
                      padding: "14px 18px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                    }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#94a3b8", marginRight: 4 }}>Ajouter :</span>
                      <button
                        onClick={() => { setAudioBox(true); setOpen2(true); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "6px 14px", borderRadius: 20, border: "1.5px solid #bfdbfe",
                          background: "#eff6ff", color: "#1d4ed8", fontSize: 12.5, fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                        + Audio
                      </button>
                      <label htmlFor="fileInputMesure2" style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 14px", borderRadius: 20, border: "1.5px solid #bbf7d0",
                        background: "#f0fdf4", color: "#15803d", fontSize: 12.5, fontWeight: 600,
                        cursor: "pointer",
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                        </svg>
                        + Fichier
                        <input id="fileInputMesure2" type="file" multiple hidden ref={inputRef} onChange={(e) => setFiles([...e.target.files])} />
                      </label>
                      <button
                        onClick={() => { setShowExtraContent(true); setExtraContent(""); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "6px 14px", borderRadius: 20, border: "1.5px solid #ddd6fe",
                          background: "#faf5ff", color: "#7c3aed", fontSize: 12.5, fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                        </svg>
                        + Contenu
                      </button>
                    </div>

                    {/* Contenus */}
                    <AccordionSection sectionKey="contents" color="#ede9fe" dotColor="#8b5cf6"
                      icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
                      title="Contenus" count={contentsCount}>
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
                              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                                <div style={{ fontSize: 13.5, color: "#1e293b", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{extra.contenu}</div>
                                {extra.user?.firstAndLastName === user.firstAndLastName && (
                                  <DeleteOutlineIcon
                                    sx={{ fontSize: 18, color: "#dc2626", cursor: "pointer", flexShrink: 0 }}
                                    onClick={() => handleDeleteExtraContent(extra.id)}
                                  />
                                )}
                              </div>
                              <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                                {extra.user?.firstAndLastName && <span>User {extra.user.firstAndLastName}</span>}
                                {extra.createdAt && <span> le {formatDate(extra.createdAt)}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>Aucun contenu</div>
                      )}
                    </AccordionSection>

                    {/* Fichiers joints */}
                    <AccordionSection sectionKey="files" color="#dbeafe" dotColor="#3b82f6"
                      icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>}
                      title="Fichiers joints" count={filesCount}>
                      {filesCount > 0 ? attachmentList : (
                        <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>Aucun fichier joint</div>
                      )}
                    </AccordionSection>

                    {/* Audios */}
                    <AccordionSection sectionKey="audios" color="#dcfce7" dotColor="#22c55e"
                      icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>}
                      title="Audios" count={audiosCount}>
                      {audiosCount > 0 ? audioList : (
                        <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>Aucun audio enregistré</div>
                      )}
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
                <HistoriqueTimeline claimId={props.id} />
              ),
            },
          ]}
        />
        {/* Modal mesure de satisfaction */}
        {openModal === "mesurer" && (
          <Dialog open fullWidth maxWidth="sm" onClose={() => setOpenModal(null)}>
            <DialogTitle>Mesure de satisfaction</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, my: 2, padding: "16px 0" }}>
                <div onClick={() => props.appraisalChanged("SATISFIED")} style={{ cursor: "pointer", textAlign: "center", padding: 12, borderRadius: 12, border: props.appraisal === "SATISFIED" ? "2px solid #22c55e" : "2px solid #e2e8f0", background: props.appraisal === "SATISFIED" ? "#f0fdf4" : "#fff" }}>
                  <img src={satisfaire_icon} alt="satisfait" style={{ width: 56 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: "#166534" }}>Satisfait</div>
                </div>
                <div onClick={() => props.appraisalChanged("PARTIAL")} style={{ cursor: "pointer", textAlign: "center", padding: 12, borderRadius: 12, border: props.appraisal === "PARTIAL" ? "2px solid #f59e0b" : "2px solid #e2e8f0", background: props.appraisal === "PARTIAL" ? "#fffbeb" : "#fff" }}>
                  <img src={partiel_icon} alt="partiel" style={{ width: 56 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: "#92400e" }}>Partielle</div>
                </div>
                <div onClick={() => props.appraisalChanged("UNSATISFIED")} style={{ cursor: "pointer", textAlign: "center", padding: 12, borderRadius: 12, border: props.appraisal === "UNSATISFIED" ? "2px solid #ef4444" : "2px solid #e2e8f0", background: props.appraisal === "UNSATISFIED" ? "#fef2f2" : "#fff" }}>
                  <img src={unsatisfaire_icon} alt="insatisfait" style={{ width: 56 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: "#991b1b" }}>Non satisfait</div>
                </div>
              </div>
              {props.errors?.appraisal && <div style={{ color: "#ef4444", fontSize: 12, textAlign: "center", marginBottom: 8 }}>{props.errors.appraisal}</div>}
              {(props.appraisal === "PARTIAL" || props.appraisal === "UNSATISFIED") && (
                <TextField
                  fullWidth size="small" multiline rows={3}
                  label="Commentaire"
                  value={props.commenta || ""}
                  onChange={(e) => props.commentaChanged(e.target.value)}
                  sx={{ mt: 1 }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenModal(null)}>Annuler</Button>
              <Button variant="contained" onClick={handleAppraise} disabled={props.etat}>
                {props.etat ? "En cours..." : "Valider"}
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* ── Modal SMS ── */}
        <Dialog open={showUploadModal} onClose={() => setShowUploadModal(false)} fullWidth maxWidth="sm"
          PaperProps={{ style: { borderRadius: 16, padding: 8 } }}>
          <DialogContent>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingTop: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.62 4.38 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.96a16 16 0 0 0 6.07 6.07l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Envoyer par SMS</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                  {smsSegments.length > 1 ? `${smsSegments.length} SMS seront envoyés` : "1 SMS sera envoyé"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{props.lastname || "-"}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{props.phone || "-"}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Prévisualisation</div>
            <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {smsSegments.map((seg, i) => (
                <div key={i} style={{ padding: "10px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, color: "#166534", lineHeight: 1.6 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>SMS {i + 1} / {smsSegments.length}</div>
                  {seg}
                </div>
              ))}
            </div>
          </DialogContent>
          <DialogActions style={{ padding: "8px 20px 20px", gap: 8 }}>
            <LoadingButton fullWidth onClick={() => setShowUploadModal(false)} variant="outlined"
              sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b" }}>
              Annuler
            </LoadingButton>
            <LoadingButton fullWidth onClick={handleSms} loading={loading} loadingPosition="end" endIcon={<span />}
              variant="contained" sx={{ textTransform: "none", borderRadius: 2, background: "#16a34a", "&:hover": { background: "#15803d" } }}>
              <span>Envoyer par SMS</span>
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* ── Modal Mail ── */}
        <Dialog open={showMailModal} onClose={() => setShowMailModal(false)} fullWidth maxWidth="sm"
          PaperProps={{ style: { borderRadius: 16, padding: 8 } }}>
          <DialogContent>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingTop: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Envoyer par Mail</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>La solution sera envoyée en un seul mail</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{props.lastname || "-"}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{props.email || "-"}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Aperçu du contenu</div>
            <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {smsSegments.map((seg, i) => (
                <div key={i} style={{ padding: "10px 14px", borderRadius: 10, background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: 13, color: "#1e40af", lineHeight: 1.6 }}>
                  {seg}
                </div>
              ))}
            </div>
          </DialogContent>
          <DialogActions style={{ padding: "8px 20px 20px", gap: 8 }}>
            <LoadingButton fullWidth onClick={() => setShowMailModal(false)} variant="outlined"
              sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b" }}>
              Annuler
            </LoadingButton>
            <LoadingButton fullWidth onClick={handleMail} loading={loadingMail} loadingPosition="end" endIcon={<span />}
              variant="contained" sx={{ textTransform: "none", borderRadius: 2, background: "#1d4ed8", "&:hover": { background: "#1e40af" } }}>
              <span>Envoyer par Mail</span>
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* ── Modal Contenu ── */}
        {showExtraContent && (
          <Dialog open={showExtraContent} fullWidth maxWidth="sm" onClose={() => setShowExtraContent(false)} id="dialog-contenu"
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
              <TextField
                fullWidth multiline minRows={5}
                value={extraContent}
                onChange={(e) => { e.stopPropagation(); e.preventDefault(); setExtraContent(e.target.value); }}
                placeholder="Saisissez le contenu..."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
              />
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
                      <CloseIcon style={{ cursor: "pointer", color: "#94a3b8", fontSize: 18 }} onClick={() => { setAudioListForm(audioListForm.filter((_, idx) => idx !== i)); setAudioListUrlForm(audioListUrlForm.filter((_, idx) => idx !== i)); }} />
                    </div>
                  ))}
                  <RecorderControls recorderState={recorderState} handlers={handlers} closeAction={() => {}} />
                </div>
              </section>
            </DialogContent>
            <DialogActions style={{ display: audioListUrlForm.length > 0 ? "flex" : "none", padding: "8px 20px 20px", gap: 8 }}>
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
          </Dialog>
        )}
      </>
    );
  }

  return (
    <div id="main">
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
            <DialogActions sx={{ display: extraContent && extraContent?.trim() !== "" ? "flex" : "none", overflowX: "hidden" }}>
              <LoadingButton
                onClick={(e) => {
                  setExtraContent("");
                  setShowExtraContent(false);
                }}
                className="waves-effect waves-effect-b waves-light btn-small"
                loadingPosition="end"
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
                <div style={{ display: "flex", alignItems: "center" }}
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
            <DialogActions sx={{ display: audioListUrlForm.length ? "flex" : "none", justifyContent: "flex-end" }}>
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
                  endIcon={<CloseIcon />}
                  variant="contained"
                  sx={{ backgroundColor: "#000", textTransform: "initial" }}
                >
                  <span>Annuler</span>
                </LoadingButton>
              </Box>
            </DialogActions>
          </Dialog>
        </div>
      )}
      <audio ref={audioRef} src={currentAudio} hidden />

      <div className="row">
        <div className="col s12">
          <div className="container">
            <section className="tabs-vertical mt-1 section">
              <div className="row">
                <div className="col l12 s12 pb-5">
                  <div className="card-panel pb-5">
                    <DossierKPIBar items={content} kpiCards={MES_KPI_CARDS} />
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2, pb: 2, borderBottom: "1px solid #F1F5F9" }}>
                      {MES_CHIPS.map((chip) => {
                        const count = content.filter(chip.filter).length;
                        const isActive = activeFilter === chip.value;
                        if (chip.value !== "ALL" && count === 0) return null;
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
                        Réclamations en attente de mesure de satisfaction
                        <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "#64748B", background: "#F1F5F9", borderRadius: 8, padding: "2px 10px" }}>
                          {filteredContent.length} résultat{filteredContent.length !== 1 ? "s" : ""}
                        </span>
                      </h5>
                      <Box sx={{ display: "inline-flex", borderRadius: "10px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                        <Tooltip title="Vue liste">
                          <Box onClick={() => setViewMode("list")} sx={{ px: 1.4, py: 0.8, cursor: "pointer", backgroundColor: viewMode === "list" ? "var(--gpr-primary, #005081)" : "#F8FAFC", color: viewMode === "list" ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.18s" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                          </Box>
                        </Tooltip>
                        <Tooltip title="Vue cartes">
                          <Box onClick={() => setViewMode("card")} sx={{ px: 1.4, py: 0.8, cursor: "pointer", backgroundColor: viewMode === "card" ? "var(--gpr-primary, #005081)" : "#F8FAFC", color: viewMode === "card" ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.18s" }}>
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
                          statusOptions={MES_STATUS_OPTIONS}
                          showTransmitted={false}
                          showStatusIcons={false}
                        />
                      ) : (
                        <ClaimsCardView
                          items={filteredContent}
                          mode={1}
                          objets={[]}
                          onCardClick={(data) => rowClickedHandler(null, data, 0)}
                          showTransmitted={false}
                          showStatusIcons={false}
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
                          backgroundColor: "var(--gpr-primary, #005081)",
                        }}
                      >
                        <Toolbar>
                          {props?.match?.params?.code === "all" ? (
                            <IconButton
                              edge="start"
                              color="inherit"
                              onClick={handleClose}
                              aria-label="close"
                            >
                              <CloseIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              edge="start"
                              color="inherit"
                              // onClick={handleClose}
                              aria-label="close"
                            >
                              <NavLink to="/alertes/reclamations">
                                <div className="card-content text-white">
                                  <CloseIcon />
                                </div>
                              </NavLink>
                            </IconButton>
                          )}
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
                                      <PinIcon sx={{ mr: 2 }} />{" "}
                                      {props.codeClient}
                                    </div>

                                    <div
                                      className="col l6 s12 df pb-2"
                                      id="recorded_at"
                                    >
                                      <CalendarMonthIcon sx={{ mr: 2 }} />
                                      {formatDate3(props.recorded_at)}
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
                                        <span
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
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
                                              {extra.user?.firstAndLastName ===
                                                user.firstAndLastName && (
                                                <DeleteOutlineIcon
                                                  sx={{
                                                    color: "error.main",
                                                    ml: 1,
                                                    cursor: "pointer",
                                                  }}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteExtraContent(
                                                      extra.id
                                                    );
                                                  }}
                                                />
                                              )}
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
                                      Fichiers
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
                            <div
                              className="row df align-items-center"
                              id="ententeFiche"
                            >
                              <div className="col l6 s12">
                                <h5 className="card-title">
                                  Mesurer la satisfaction
                                </h5>
                              </div>
                              <div className="col l6 m6 s12 df justify-content-end" style={{ gap: "8px" }}>
                                <LoadingButton
                                  className="btn waves-light btn-small flex-shrink-0"
                                  onClick={handleShowModalSms}
                                  loading={loading}
                                  loadingPosition="end"
                                  variant="outlined"
                                >
                                  <span>Envoyer SMS</span>
                                </LoadingButton>

                                <LoadingButton
                                  className="btn waves-light btn-small flex-shrink-0"
                                  onClick={handleShowModalMail}
                                  loading={loadingMail}
                                  loadingPosition="end"
                                  variant="outlined"
                                  color="secondary"
                                >
                                  <span>Envoyer Mail</span>
                                </LoadingButton>

                                {props.phone && props.solutionId && (
                                  <Button
                                    className="btn-small flex-shrink-0"
                                    onClick={() => setShowSolutionWaModal(true)}
                                    variant="outlined"
                                    startIcon={<WhatsAppIcon />}
                                    style={{ color: "#25d366", borderColor: "#25d366" }}
                                  >
                                    <span>WhatsApp</span>
                                  </Button>
                                )}
                              </div>
                            </div>

                            {(() => {
                              const survey = needingCommentData.find(
                                (r) => String(r.claim_id) === String(props.id)
                              );
                              if (!survey) return null;
                              const satisfLabel =
                                survey.satisfaction === "UNSATISFIED"
                                  ? { text: "😕 Non Satisfait", color: "#C62828", bg: "#FFEBEE" }
                                  : survey.satisfaction === "PARTIAL"
                                  ? { text: "😐 Partiellement Satisfait", color: "#E65100", bg: "#FFF3E0" }
                                  : { text: "😊 Satisfait", color: "#2E7D32", bg: "#E8F5E9" };
                              return (
                                <div
                                  style={{
                                    marginBottom: 14,
                                    padding: "12px 16px",
                                    background: "#FFF8E1",
                                    border: "1.5px solid #FFB300",
                                    borderRadius: 8,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                  }}
                                >
                                  <div style={{ fontWeight: 700, color: "#E65100", fontSize: 13 }}>
                                    ⚠️ Le client a mesuré la satisfaction via WhatsApp mais n'a pas laissé de
                                    commentaire.
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 12, color: "#555" }}>Niveau de satisfaction :</span>
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: satisfLabel.color,
                                        background: satisfLabel.bg,
                                        borderRadius: 6,
                                        padding: "2px 10px",
                                      }}
                                    >
                                      {satisfLabel.text}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}

                            <SendSolutionWhatsappDialog
                              open={showSolutionWaModal}
                              onClose={() => setShowSolutionWaModal(false)}
                              phone={props.phone}
                              claimId={props.id}
                              solutionId={props.solutionId}
                              solutionText={props.solution?.[0]?.content}
                            />
                            <Dialog open={showUploadModal} onClose={() => setShowUploadModal(false)}
                              fullWidth maxWidth="sm" id="dialog-sms"
                              PaperProps={{ style: { borderRadius: 16, padding: 8 } }}>
                              <DialogContent>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingTop: 8 }}>
                                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.62 4.38 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.96a16 16 0 0 0 6.07 6.07l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Envoyer par SMS</div>
                                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                                      {smsSegments.length > 1 ? `${smsSegments.length} SMS seront envoyés` : "1 SMS sera envoyé"}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: 16 }}>
                                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{props.lastname || "-"}</div>
                                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{props.phone || "-"}</div>
                                  </div>
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Prévisualisation</div>
                                <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                                  {smsSegments.map((seg, index) => (
                                    <div key={index} style={{ padding: "10px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, color: "#166534", lineHeight: 1.6 }}>
                                      <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>SMS {index + 1} / {smsSegments.length}</div>
                                      {seg}
                                    </div>
                                  ))}
                                </div>
                                {props.solution[0]?.commentaire && (
                                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 13, color: "#475569" }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Commentaire</div>
                                    {props.solution[0].commentaire}
                                  </div>
                                )}
                              </DialogContent>
                              <DialogActions style={{ padding: "8px 20px 20px", gap: 8 }}>
                                <LoadingButton fullWidth onClick={() => setShowUploadModal(false)} variant="outlined"
                                  sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b" }}>
                                  Annuler
                                </LoadingButton>
                                <LoadingButton fullWidth onClick={handleSms} loading={loading} loadingPosition="end" endIcon={<span />}
                                  variant="contained" sx={{ textTransform: "none", borderRadius: 2, background: "#16a34a", "&:hover": { background: "#15803d" } }}>
                                  <span>Envoyer par SMS</span>
                                </LoadingButton>
                              </DialogActions>
                            </Dialog>

                            <div className="row pb-5">
                              <div className="col l12 s12 pb-3" id="content">
                                <div className="df pb-2">
                                  <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                                  Solution
                                </div>
                                <div>
                                  {props.solution[0] !== undefined
                                    ? props.solution[0].content
                                    : ""}
                                </div>
                              </div>

                              <div className="col l12 s12 pb-2" id="content">
                                <div className="df pb-2">
                                  <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                                  Commentaire
                                </div>
                                <div>
                                  {props.solution[0] !== undefined
                                    ? props.solution[0].commentaire
                                    : ""}
                                </div>
                              </div>
                            </div>

                            <Dialog open={showMailModal} onClose={() => setShowMailModal(false)}
                              fullWidth maxWidth="sm" id="dialog-mail"
                              PaperProps={{ style: { borderRadius: 16, padding: 8 } }}>
                              <DialogContent>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingTop: 8 }}>
                                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Envoyer par Mail</div>
                                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>La solution sera envoyée en un seul mail</div>
                                  </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: 16 }}>
                                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{props.lastname || "-"}</div>
                                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{props.email || "-"}</div>
                                  </div>
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Aperçu du contenu</div>
                                <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                                  {smsSegments.map((seg, index) => (
                                    <div key={index} style={{ padding: "10px 14px", borderRadius: 10, background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: 13, color: "#1e40af", lineHeight: 1.6 }}>
                                      {seg}
                                    </div>
                                  ))}
                                </div>
                                {props.solution[0]?.commentaire && (
                                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 13, color: "#475569" }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Commentaire</div>
                                    {props.solution[0].commentaire}
                                  </div>
                                )}
                              </DialogContent>
                              <DialogActions style={{ padding: "8px 20px 20px", gap: 8 }}>
                                <LoadingButton fullWidth onClick={() => setShowMailModal(false)} variant="outlined"
                                  sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e2e8f0", color: "#64748b" }}>
                                  Annuler
                                </LoadingButton>
                                <LoadingButton fullWidth onClick={handleMail} loading={loadingMail} loadingPosition="end" endIcon={<span />}
                                  variant="contained" sx={{ textTransform: "none", borderRadius: 2, background: "#1d4ed8", "&:hover": { background: "#1e40af" } }}>
                                  <span>Envoyer par Mail</span>
                                </LoadingButton>
                              </DialogActions>
                            </Dialog>

                            {mesureForm}
                            {deForm}
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
    isLoading: state.claim_appraise.isLoading,
    id: state.claim_appraise.id,
    firstname: state.claim_appraise.firstname,
    lastname: state.claim_appraise.lastname,
    address: state.claim_appraise.address,
    phone: state.claim_appraise.phone,
    gender: state.claim_appraise.gender,
    language: state.claim_appraise.language,
    dossierimf: state.claim_appraise.dossierimf,
    email: state.claim_appraise.email,
    code: state.claim_appraise.code,
    codeClient: state.claim_appraise.codeClient,
    recorded_at: state.claim_appraise.recorded_at,
    collect: state.claim_appraise.collect,
    subject: state.claim_appraise.subject,
    underSubject: state.claim_appraise.underSubject,
    product: state.claim_appraise.product,
    unit: state.claim_appraise.unit,
    content: state.claim_appraise.content,
    status: state.claim_appraise.status,
    motif: state.claim_appraise.motif,
    solution: state.claim_appraise.solution,
    solutionId: state.claim_appraise.solutionId,
    comment: state.claim_appraise.comment,
    commenta: state.claim_appraise.commenta,
    created_by: state.claim_appraise.created_by,
    created_at: state.claim_appraise.created_at,
    assigned_by: state.claim_appraise.assigned_by,
    handled_at: state.claim_appraise.handled_at,
    handled_by: state.claim_appraise.handled_by,
    resolved_at: state.claim_appraise.resolved_at,
    resolved_by: state.claim_appraise.resolved_by,
    appraised_at: state.claim_appraise.appraised_at,
    appraised_by: state.claim_appraise.appraised_by,
    appraisal: state.claim_appraise.appraisal,
    errors: state.claim_appraise.claim_appraise_errors,
    items: state.claim_appraise.items,
    agents: state.claim_appraise.agents,
    selectedItem: state.claim_appraise.selectedItem,
    selectedFiles: state.claim_appraise.selectedFiles,
    selectedItemFiles: state.claim_appraise.selectedItemFiles,
    selectedItemAudio: state.claim_appraise.selectedItemAudio,
    authorize: state.claim_appraise.authorize,
    etat: state.claim_appraise.etat,
    etat2: state.claim_appraise.etat2,
    extras: state.claim_appraise.extras,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loading: (err) => {
      dispatch(loading(err));
    },
    claimAppraiseErrors: (err) => {
      dispatch(claimAppraiseErrors(err));
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
    solutionIdChanged: (solutionId) => {
      dispatch(solutionIdChanged(solutionId));
    },
    commentChanged: (comment) => {
      dispatch(commentChanged(comment));
    },
    commentaChanged: (commenta) => {
      dispatch(commentaChanged(commenta));
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
    selectedFilesReset: (selectedFiles) => {
      dispatch(selectedFilesReset(selectedFiles));
    },
    selectedItemFilesChanged: (selectedItemFiles) => {
      dispatch(selectedItemFilesChanged(selectedItemFiles));
    },
    selectedItemAudioChanged: (selectedItemAudio) => {
      dispatch(selectedItemAudioChanged(selectedItemAudio));
    },
    authorizeChanged: (selectedItemFiles) => {
      dispatch(authorizeChanged(selectedItemFiles));
    },
    etatChanged: (etat) => {
      dispatch(etatChanged(etat));
    },
    etat2Changed: (etat2) => {
      dispatch(etat2Changed(etat2));
    },
    extrasChanged: (collect) => {
      dispatch(extrasChanged(collect));
    },
    codeClientChanged: (codeClient) => {
      dispatch(codeClientChanged(codeClient));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MesurerReclamation);
