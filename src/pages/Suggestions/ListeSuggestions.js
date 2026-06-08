import React, { useEffect, useRef, useState } from "react";
import FileTypeIcon from "../../components/shared/FileTypeIcon";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import TraitementShell from "../../components/treatment/TraitementShell";
import axios from "axios";
import { HOST } from "../../Utils/globals";
import ReactDatatable from "@ashvin27/react-datatable";
import Select from "react-select";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DatePicker from "react-datepicker";
import { KTApp } from "../../Utils/blockui";
import {
  addressChanged,
  codeChanged,
  codeClientChanged,
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
  phoneChanged,
  productChanged,
  recordedAtChanged,
  resolvedAtChanged,
  resolvedByChanged,
  selectedItemChanged,
  solutionChanged,
  statusChanged,
  collectChanged,
  dossierimfChanged,
  emailChanged,
  unitChanged,
  createdByChanged,
  selectedFilesReset,
  selectedItemFilesChanged,
  showSelectPrintItemChanged,
  crewChanged,
  suggestionListErrors,
  commentChanged,
  selectedItemAudioChanged,
  convertedAtChanged,
  convertedByChanged,
  extrasChanged,
} from "../../redux/actions/Suggestions/ListeSuggestionsActions";
import http from "../../apis/http-common";
import PrintIcon from "@mui/icons-material/Print";
import { connect } from "react-redux";
import {
  handlePrint,
  handlePrint2,
  handlePrint3,
  handlePrint33,
  handlePrintAvance,
} from "../../Utils/tables";

import { table2XLSX, table2XLS2X, table3XLS2X, table3XLS2XF } from "../../Utils/tabletoexcel";
// import { useLocation } from "react-router-dom";
import {
  Card,
  Box,
  CardContent,
  Grid,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { FileDownload, History, Info, Pause, PlayArrow, Star, VolumeUp } from "@mui/icons-material";
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
import excel from "../../assets/images/excel.svg";
import pdf from "../../assets/images/pdf.svg";
import { formatDate, formatDate2, formatDate4, guessExtension, loadItemFromLocalStorage, loadItemFromSessionStorage, today } from "../../Utils/utils";
import { Avatar, DialogContent, DialogContentText } from "@mui/material";
import { downloadFillesApi, getFillesApi, getSuggeAudioApi, listeTousStatuts, listeTousStatutsOffline } from "../../apis/Suggestions/SuggestionsApi";
import GavelIcon from "@mui/icons-material/Gavel";
import { INSTITUTION_ADDRESS, INSTITUTION_AGREMENT, INSTITUTION_EMAIL, INSTITUTION_LOGO, INSTITUTION_NAME, INSTITUTION_TEL } from "../../Utils/globals";
import { downloadAudioApi } from "../../apis/Denonciations/DenonciationsApi";
import { WarningAmber } from '@mui/icons-material';
import Tooltip from "@mui/material/Tooltip";
import WarningIcon from '@mui/icons-material/Warning';
import EmailIcon from '@mui/icons-material/Email';
import DossierCardView from "../../components/shared/DossierCardView";
import DossierTable from "../../components/shared/DossierTable";
import DossierKPIBar from "../../components/shared/DossierKPIBar";
import DossierFilterChips from "../../components/shared/DossierFilterChips";
import ClaimStatusBadge from "../Reclamations/components/ClaimStatusBadge";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import { downloadAudioApi, getDenunAudioApi } from "../../apis/Denonciations/DenonciationsApi";


const SG_KPI_CARDS = [
  { key: "total",   label: "Total suggestions",     icon: AssignmentIcon,     iconBg: "#EFF6FF", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true },
  { key: "pending", label: "En attente",             icon: HourglassEmptyIcon, iconBg: "#FFF7ED", iconColor: "#C2410C", borderColor: "#FB923C", filter: (item) => ["SAVED","TEMP_SAVED"].includes(item.status) },
  { key: "treated", label: "Traitées",               icon: CheckCircleIcon,    iconBg: "#F0FDF4", iconColor: "#15803D", borderColor: "#4ADE80", filter: (item) => item.status === "TREAT" },
];

const SG_FILTER_BUTTONS = [
  { value: "ALL",          label: "Tous" },
  { value: "SAVED",        label: "Enregistrée" },
  { value: "TEMP_SAVED",   label: "Sauvegardée" },
  { value: "AFFECTED",     label: "Affectée" },
  { value: "TO_APPROUVED", label: "À approuver" },
  { value: "TREAT",        label: "Traitée" },
  { value: "SATISFIED",    label: "Satisfait" },
  { value: "CLASSED",      label: "Classée" },
];

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

const ListeSuggestions = (props) => {
  let dimf, crew, emailDisplay;
  const [open, setOpen] = React.useState(false);
  const [interne, setInterne] = React.useState(false);
  const [changeButtonPrint, setChangeButtonPrint] = useState(false);
  const [impression, setImpression] = React.useState(false);
  let mode = loadItemFromLocalStorage("app-mode") !== undefined ? (JSON.parse(loadItemFromLocalStorage("app-mode"))) : undefined;

  let user = loadItemFromSessionStorage("app-user") !== undefined ? (JSON.parse(loadItemFromSessionStorage("app-user"))) : undefined;
  let hbt = (user.posteDto.habilitations).split(',');
  let addR = (user.additionalRole);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [activeFilter, setActiveFilter] = useState("ALL");


  const handleClickOpen = () => { setOpen(true); };
  const history = useHistory();

  // Chargement depuis l'URL quand on arrive directement sur /suggestions/liste/:code
  useEffect(() => {
    const code = props.match?.params?.code;
    if (code && code !== "all") {
      axios({
        method: "get",
        url: HOST + "api/v1/suggestion/" + code + "/details",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + loadItemFromSessionStorage("token") },
      }).then((cc) => {
        if (cc.status >= 200 && cc.status <= 299) {
          const data = cc.data.content;
          clearComponentState();
          props.lastnameChanged(data.clientFirstAndLastName ?? "");
          props.addressChanged(data.address ?? "");
          props.phoneChanged(data.tel ?? "");
          props.genderChanged(data.gender ?? "");
          props.languageChanged(data.langue?.libelle ?? "");
          props.dossierimfChanged(data.folderCode ?? "");
          props.emailChanged(data.email ?? "");
          props.codeChanged(data.code ?? "");
          props.codeClientChanged(data.codeClient ?? "");
          props.recordedAtChanged(data.receiptDateTime ?? "");
          props.collectChanged(data.canal?.libelle ?? "");
          props.productChanged(data.produit?.libelle ?? "");
          props.unitChanged(data.serviceIndexe?.libelle ?? "");
          props.contentChanged(data.content ?? "");
          props.solutionChanged(data.accepted ?? false);
          props.commentChanged(data.commentaire ?? "");
          props.statusChanged(data.status ?? "");
          props.createdByChanged(data.collecteur?.firstAndLastName ?? "");
          props.createdAtChanged(data.createdAt ?? "");
          props.handledByChanged(data.traiteur?.firstAndLastName ?? "");
          props.handledAtChanged(data.treatAt ?? "");
          props.selectedItemChanged(data);
          props.extrasChanged(data.extras ?? []);
          props.convertedByChanged(data.convertedBy ? data.convertedBy.firstAndLastName : "");
          props.convertedAtChanged(data.convertedAt ? data.convertedAt : "");
          getFillesApi(data.id, props);
          getSuggeAudioApi(data.id, props);
        }
      }).catch(() => {});
    }
  }, []);

  const [currentAudioId, setCurrentAudioId] = useState("");
  const audioRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setInterne(false);
    clearComponentState();
  };

  const handleImpression = () => {
    setImpression(!impression);
    setStartDate(null);
    setEndDate(null);
  };
  const [showAudioPlayer, setAudioPlayer] = useState("");
  const [currentAudio, setCurrentAudio] = useState("");


  const getStatusLabel = (status) => {
    var statusElt = status
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

    return statusElt
  }

  const warningConvert = props.convertedBy && props.convertedBy !== "" &&
    props.convertedAt && props.convertedAt !== "" && (
    <span className="mb-1" style={{ width: "100%", display: "flex", alignItems: "center", fontWeight: '', fontStyle: 'italic', color: '' }}>
      <WarningIcon fontSize="medium" sx={{ mr: 1, color: 'orange' }} />
      {`Converti en Suggestion par ${props.convertedBy} le ${formatDate4(props.convertedAt)}`}
    </span>
  );


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
      listeTousStatuts(props).then((r) => { }).finally(() => {
        setIsLoading(false);
        KTApp.unblockPage();
      });
    } else {
      props.itemsChanged([])
      listeTousStatutsOffline(props).then((r) => { }).finally(() => {
        setIsLoading(false);
        KTApp.unblockPage();
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
      cell: (claim, index) => {
        let nom = (claim.clientFirstAndLastName && claim.clientFirstAndLastName.trim() !== "") ? claim.clientFirstAndLastName : <em>Anonyme</em>;
        return nom;
      },
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
                <span className="">Enregistrée</span>
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
          case "TREAT":
            statusElt = (
              <span className="chip treatBgColor">
                <span className="">Traitée</span>
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
    filename: "Liste des suggestions",
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
    props.codeChanged("");
    props.codeClientChanged("");
    props.recordedAtChanged("");
    props.collectChanged("");
    props.crewChanged("");
    props.productChanged("");
    props.unitChanged("");
    props.contentChanged("");
    props.solutionChanged("");
    props.statusChanged("");
    props.createdByChanged("");
    props.createdAtChanged("");
    props.handledAtChanged("");
    props.handledByChanged("");
    props.selectedItemChanged({});
    props.selectedFilesReset([]);
    props.selectedItemFilesChanged([]);
    props.selectedItemAudioChanged([]);

    setCurrentAudio("");
    setAudioPlayer("");
  };

  const rowClickedHandler = (event, data, rowIndex) => {
    clearComponentState();
    history.push("/suggestions/liste/" + data.code);

    if (mode === 1) {
      props.lastnameChanged(data.clientFirstAndLastName ? data.clientFirstAndLastName : "");
      props.addressChanged(data.address ? data.address : "");
      props.phoneChanged(data.tel ? data.tel : "");
      props.genderChanged(data.gender ? data.gender : "");
      props.languageChanged(data.langue.libelle ? data.langue.libelle : "");
      props.dossierimfChanged(data.folderCode ? data.folderCode : "");
      props.emailChanged(data.email ? data.email : "");
      props.crewChanged(data.crew ? data.crew : "");
      props.codeChanged(data.code ? data.code : "");
      props.codeClientChanged(data.codeClient ? data.codeClient : "");
      props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
      props.collectChanged(data.canal.libelle ? data.canal.libelle : "");
      props.productChanged(data.produit ? data.produit.libelle : "");
      props.unitChanged(data.serviceIndexe ? data.serviceIndexe.libelle : "");
      props.contentChanged(data.content ? data.content : "");
      props.statusChanged(data.status ? data.status : "");
      props.createdByChanged(data.collecteur.firstAndLastName ? data.collecteur.firstAndLastName : "");
      props.createdAtChanged(data.createdAt ? data.createdAt : "");
      props.handledByChanged(data.traiteur ? data.traiteur.firstAndLastName : "");
      props.handledAtChanged(data.treatAt ? data.treatAt : "");
      props.solutionChanged(data.accepted ? data.accepted : "");
      props.commentChanged(data.commentaire ? data.commentaire : "");
      props.selectedItemChanged(data);
      getFillesApi(data.id, props);
      getSuggeAudioApi(data.id, props);
      props.convertedByChanged(data.convertedBy ? data.convertedBy.firstAndLastName : "");
      props.convertedAtChanged(data.convertedAt ? data.convertedAt : "");
      props.extrasChanged(data.extras ?? []);
    } else {
      if ((data.id && data.canal)) {
        props.lastnameChanged(data.clientFirstAndLastName ? data.clientFirstAndLastName : "");
        props.addressChanged(data.address ? data.address : "");
        props.phoneChanged(data.tel ? data.tel : "");
        props.genderChanged(data.gender ? data.gender : "");
        props.languageChanged(data.langue.libelle ? data.langue.libelle : "");
        props.dossierimfChanged(data.folderCode ? data.folderCode : "");
        props.emailChanged(data.email ? data.email : "");
        props.crewChanged(data.crew ? data.crew : "");
        props.codeChanged(data.code ? data.code : "");
        props.codeClientChanged(data.codeClient ? data.codeClient : "");
        props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
        props.collectChanged(data.canal.libelle ? data.canal.libelle : "");
        props.productChanged(data.produit ? data.produit.libelle : "");
        props.unitChanged(data.serviceIndexe ? data.serviceIndexe.libelle : "");
        props.contentChanged(data.content ? data.content : "");
        props.statusChanged(data.status ? data.status : "");
        props.createdByChanged(data.collecteur.firstAndLastName ? data.collecteur.firstAndLastName : "");
        props.createdAtChanged(data.createdAt ? data.createdAt : "");
        props.handledByChanged(data.traiteur ? data.traiteur.firstAndLastName : "");
        props.handledAtChanged(data.treatAt ? data.treatAt : "");
        props.solutionChanged(data.accepted ? data.accepted : "");
        props.commentChanged(data.commentaire ? data.commentaire : "");
        props.selectedItemChanged(data);
        getSuggeAudioApi(data.id, props);
        getFillesApi(data.id, props);

        props.convertedByChanged(data.convertedBy ? data.convertedBy.firstAndLastName : "");
        props.convertedAtChanged(data.convertedAt ? data.convertedAt : "");
        props.extrasChanged(data.extras ?? []);
      } else {
        // props.idChanged(data.id ? data.id : "")
        props.lastnameChanged(data.clientFirstAndLastName ? data.clientFirstAndLastName : "");
        props.addressChanged(data.address ? data.address : "");
        props.phoneChanged(data.phone ? data.phone : "");
        props.genderChanged(data.gender ? data.gender : "");
        props.crewChanged(data.crew ? data.crew : "");
        props.dossierimfChanged(data.folderCode ? data.folderCode : "");
        props.emailChanged(data.email ? data.email : "");
        props.codeChanged(data.code ? data.code : "");
        props.codeClientChanged(data.codeClient ? data.codeClient : "");
        props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
        props.contentChanged(data.content ? data.content : "");
        props.statusChanged(data.status ? data.status : "");
        let description = data.languageId ? (JSON.parse(loadItemFromSessionStorage('app-langues'))).filter((e) => { return e.id === data.languageId }) : ""
        let description1 = data.collectionChannelId ? (JSON.parse(loadItemFromSessionStorage('app-supports'))).filter((e) => { return e.id === data.collectionChannelId }) : ""
        let description3 = data.productId ? (JSON.parse(loadItemFromSessionStorage('app-produits'))).filter((e) => { return e.id === data.productId }) : ""
        let description4 = data.servicePointId ? (JSON.parse(loadItemFromSessionStorage('app-ps'))).filter((e) => { return e.id === data.servicePointId }) : ""
        let description5 = data.collectorId ? (JSON.parse(loadItemFromSessionStorage('app-users'))).filter((e) => { return e.id === data.collectorId }) : ""

        props.languageChanged(data.languageId ? description[0].libelle : "");
        props.collectChanged(data.collectionChannelId ? description1[0].libelle : "");
        props.productChanged(data.productId ? description3[0].libelle : "");
        props.unitChanged(data.servicePointId ? description4[0].libelle : "");
        props.createdByChanged(data.collectorId ? description5[0].firstAndLastName : "");
        props.createdAtChanged(data.createdAt ? data.createdAt : "");

        props.selectedItemChanged(data ? data : "");
        props.convertedByChanged(data.convertedBy ? data.convertedBy.firstAndLastName : "");
        props.convertedAtChanged(data.convertedAt ? data.convertedAt : "");
        props.extrasChanged(data.extras ?? []);
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
              <span className="">Enregistrée</span>
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
            <span className="chip treatBgColor">
              <span className="">Traitée</span>
            </span>
          </h5>
        </>
      );
      break;

    default:
      statusElt = "";
      break;
  }

  let creationDate = props.created_at ? formatDate(props.created_at) : "";
  let colourOptions = [
    { value: "Code", label: "Code" },
    { value: "CodeClient", label: "CodeClient" },
    { value: "Client", label: "Client" },
    { value: "Status", label: "Status" },
    { value: "Enregistrer le", label: "Enregistrer le" },
    { value: "Telephone", label: "Téléphone" },
    { value: "Enregistrer par", label: "Enregistrer par" },
    { value: "Produit", label: "Produit" },
    { value: "Moyens de collecte", label: "Moyen de collecte" },
    { value: "Point de service", label: "Point de service" },
    { value: "Decision", label: "Décision" },
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

  if (props.status === "TREAT") {
    let decision = props.solution === true ? "Pris en compte" : "Non pris en compte";
    details =
      <>
        <div className="row mt-5">

          <div
            className="col l12 s12 df pb-2"
            id="firstname"
          >
            <GavelIcon sx={{ mr: 2 }} />{" "}
            Décision : {decision}
          </div>

          <div
            className="col l12 s12 df pb-2"
            id="firstname"
          >
            <PersonIcon sx={{ mr: 2 }} />{" "}
            Par : {props.handled_by}
          </div>

          <div
            className="col l12 s12 df pb-2"
            id=""
          >
            <CalendarMonthIcon sx={{ mr: 2 }} />{" "}
            Le : {formatDate(props.handled_at)}
          </div>

          <div
            className="col l12 s12 pb-2"
            id="content"
          >
            <div className="df pb-2">
              <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
              Commentaire(s)
            </div>
            <div>{props.comment}</div>

          </div>
        </div>

      </>
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
            Cette suggestion est en attente de traitement
          </div>
        </div>
      </>
    );
  }


  let attachmentList;
  if (props.selectedItemFiles.length > 0) {

    let attachmentListChild = props.selectedItemFiles.map((attachment) => {
      return (
        <Grid item xs={12} sm={6} key={attachment.id}>
          <Card sx={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2,
            p: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-3px)'
            },
            height: '100%'
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <FileTypeIcon attachment={attachment} />
            </Box>

            <CardContent sx={{ flex: 1, minWidth: 0, py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontWeight: 'bold',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    mb: 0.5
                  }}
                >
                  {attachment.name}
                </Typography>
                {attachment._extra && (
                  <Tooltip title={`Ajouté par ${attachment.extra?.user?.firstAndLastName} le ${formatDate(attachment.extra?.createdAt)}`}>
                    <Info fontSize="small" sx={{ ml: 1 }} />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {Math.round((attachment.size / 1024) * 100) / 100} {"Ko"}
              </Typography>
            </CardContent >

            <FileDownload
              sx={{
                fontSize: '18px',
                color: 'primary.main',
                ml: 1,
                '&:hover': {
                  color: 'primary.dark',
                  cursor: 'pointer'
                }
              }}
              onClick={() => downloadFillesApi(attachment.id, attachment.name)}
            />
          </Card >
        </Grid >
      );
    });

    attachmentList = (
      <Grid container spacing={2} size={12}>
        {attachmentListChild}
      </Grid>

    );
  } else {
    attachmentList = (<Grid container spacing={2} size={12}>
      <Grid item>

        Ce dossier ne contient pas de fichiers joints

      </Grid>
    </Grid>)
  }


  const handlePlay = (audioId, audioName) => {
    if (currentAudioId === audioId) {
      audioRef.current.pause();
      setCurrentAudioId(null);
    } else {
      setCurrentAudioId(audioId);
      downloadAudioApi(audioId, audioName).then(
        (data) => {

          let blobAudio = new Blob([data], {
            type: "audio/ogg; codecs=opus",
          });

          setCurrentAudio(
            window.URL.createObjectURL(blobAudio)
          );
          setTimeout(() => audioRef.current.play(), 2000);
          // setAudioPlayer("audio-" + attachment.id);
        }
      );
    }
  };

  let audioList;
  if (props.selectedItemAudio != null && props.selectedItemAudio.length > 0) {

    let audioListChild = props.selectedItemAudio.map((audioItem) => {
      return (

        <Grid item xs={12} sm={6} key={audioItem.id}>
          <Card sx={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2,
            p: 1.5,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            height: '100%'
          }}>
            <Box sx={{
              bgcolor: 'primary.light',
              borderRadius: '6px',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              minWidth: '48px',
              height: '48px'
            }}>
              <VolumeUp sx={{ color: 'primary.contrastText', fontSize: '28px' }} />
            </Box>

            <CardContent sx={{ flex: 1, minWidth: 0, p: '8px !important' }}>
              <Box sx={{

                display: 'flex',
                alignItems: 'center'
              }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    mb: 0.5
                  }}
                >
                  {audioItem.name}
                </Typography>
                {audioItem._extra && (
                  <Tooltip title={`Ajouté par ${audioItem.extra?.user?.firstAndLastName} le ${formatDate(audioItem.extra?.createdAt)}`}>
                    <Info fontSize="small" sx={{ ml: 1 }} />
                  </Tooltip>
                )}

              </Box>
              <Typography variant="body2" color="text.secondary">
                {Math.round(
                  (audioItem.size / 1024 + Number.EPSILON) * 100
                ) / 100}{" "}
                {"Ko"} • {audioItem.duration}
              </Typography>
            </CardContent>

            <Box sx={{ display: 'flex' }}>
              <IconButton
                onClick={() => handlePlay(audioItem.id, audioItem.name)}
                sx={{ color: currentAudioId === audioItem.id ? 'primary.main' : 'text.secondary' }}
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
    audioList = (<Grid container spacing={2} size={12}>
      <Grid item>
        Ce dossier ne contient pas de fichiers audio
      </Grid>
    </Grid>)
  }

  const safeFormatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d.getTime()) ? "" : formatDate(value);
  };


  const printRecu = (e) => {
    e.preventDefault();

    let image = '<img src="' + INSTITUTION_LOGO + '" alt="logo" style=" width: "200px",height: "90px" " className=" report-logo"/>';
    let entete = '<div className="row" id="enteteRapport" style="margin-bottom:50px!important">';
    entete += '<div className="col l2 s3 m3" style="margin-bottom:20px!important">' + image + '</div>';
    entete += '<div className="col l8 s7 m7"><b>' + INSTITUTION_NAME + '</b><br /><i><span>Numéro Agrément: </span>' + INSTITUTION_AGREMENT + '</i><br /><i><span>Addrese: </span>' + INSTITUTION_ADDRESS + '</i><br /><i><span>Tel: </span>' + INSTITUTION_TEL + '</i><br /><i><span>Email: </span>' + INSTITUTION_EMAIL + '</i></div></div>';


    let description3 = props.selectedItem.productId
      ? JSON.parse(loadItemFromSessionStorage('app-produits')).filter((e) => e.id === props.selectedItem.productId)
      : "";
    let description5 = props.selectedItem.collectorId
      ? JSON.parse(loadItemFromSessionStorage('app-users')).filter((e) => e.id === props.selectedItem.collectorId)
      : "";

    let statusElt;
    let decision = "";
    let traiteur = "";
    let dtraitement = "";
    let solution = "";

    switch (props.selectedItem.status) {
      case "SAVED":
        statusElt = "Enregistrée";
        break;
      case "TEMP_SAVED":
        statusElt = "Sauvegardée";
        break;
      case "TREAT":
        statusElt = "Traitée";
        break;
      default:
        statusElt = "";
        break;
    }

    // let datee = props.selectedItem.createdAt ? formatDate(props.selectedItem.createdAt) : "";
    let datee = safeFormatDate(props.selectedItem?.createdAt);


    let dater = safeFormatDate(props.selectedItem?.receiptDateTime);

    let telTemp = mode === 1
      ? (props.selectedItem.tel || "<i>Non défini</i>")
      : (props.selectedItem.id && props.selectedItem.canal
        ? (props.selectedItem.tel || "<i>Non défini</i>")
        : props.selectedItem.phone);

    let addByTemp = mode === 1
      ? props.selectedItem.collecteur.firstAndLastName
      : (props.selectedItem.id && props.selectedItem.canal
        ? props.selectedItem.collecteur.firstAndLastName
        : description5[0]?.firstAndLastName || "<i>Non défini</i>");

    let produitTemp = mode === 1
      ? (props.selectedItem.produit ? props.selectedItem.produit.libelle : "<i>Non défini</i>")
      : (props.selectedItem.id && props.selectedItem.canal
        ? (props.selectedItem.produit ? props.selectedItem.produit.libelle : "<i>Non défini</i>")
        : (description3.length > 0 ? description3[0].libelle : "<i>Non défini</i>"));

    let nomtemp = props.selectedItem.clientFirstAndLastName || "<i>Anonyme</i>";
    let addtemp = props.selectedItem.address || "<i>Non défini</i>";

    if (props.selectedItem.status === "TREAT") {
      decision = props.selectedItem.accepted ? "Pris en compte" : "Non pris en compte";
      let dTemp = formatDate(props.selectedItem.treatAt);

      solution = `
        <div class="row" style="margin-bottom: 15px;">
          <div class="col l3"><b style="font-size: 18px;">Décision:</b></div>
          <div class="col l9" style="font-size: 18px;">${decision}</div>
        </div>
      `;
      traiteur = `
        <div class="row" style="margin-bottom: 15px;">
          <div class="col l3"><b style="font-size: 18px;">Traiteur:</b></div>
          <div class="col l9" style="font-size: 18px;">${props.selectedItem.traiteur.firstAndLastName}</div>
        </div>
      `;
      dtraitement = `
        <div class="row" style="margin-bottom: 15px;">
          <div class="col l3"><b style="font-size: 18px;">Date de traitement:</b></div>
          <div class="col l9" style="font-size: 18px;">${dTemp}</div>
        </div>
      `;
    }

    const name = `
      <div class="row" style="margin-bottom: 15px;">
        <div class="col l3"><b style="font-size: 18px;">Nom du client:</b></div>
        <div class="col l9" style="font-size: 18px;">${nomtemp}</div>
      </div>
    `;
    const telephone = `
      <div class="row" style="margin-bottom: 15px;">
        <div class="col l3"><b style="font-size: 18px;">Téléphone:</b></div>
        <div class="col l9" style="font-size: 18px;">${telTemp}</div>
      </div>
    `;
    const address = `
      <div class="row" style="margin-bottom: 15px;">
        <div class="col l3"><b style="font-size: 18px;">Adresse:</b></div>
        <div class="col l9" style="font-size: 18px;">${addtemp}</div>
      </div>
    `;
    const enregistrerle = `
      <div class="row" style="margin-bottom: 15px;">
        <div class="col l3"><b style="font-size: 18px;">Enregistré le:</b></div>
        <div class="col l9" style="font-size: 18px;">${datee}</div>
      </div>
    `;
    const enregistrerpar = `
      <div class="row" style="margin-bottom: 15px;">
        <div class="col l3"><b style="font-size: 18px;">Enregistré par:</b></div>
        <div class="col l9" style="font-size: 18px;">${addByTemp}</div>
      </div>
    `;
    const code = `
      <div class="row" style="margin-bottom: 15px;">
        <div class="col l12"><span style="font-size: 18px;"><b>Code Client:</b> ${props.selectedItem.codeClient}</span></div>
      </div>
    `;
    const datereception = `
      <div class="row" style="margin-bottom: 15px;">
        <div class="col l4"><b style="font-size: 18px;">Date de réception de la suggestion:</b></div>
        <div class="col l8" style="font-size: 18px;">${dater}</div>
      </div>
    `;
    const product = `
      <div class="row" style="margin-bottom: 15px;">
        <div class="col l3"><b style="font-size: 18px;">Produit concerné:</b></div>
        <div class="col l9" style="font-size: 18px;">${produitTemp}</div>
      </div>
    `;
    const statut = `
      <div class="row" style="margin-bottom: 15px;">
        <div class="col l3"><b style="font-size: 18px;">Statut:</b></div>
        <div class="col l9" style="font-size: 18px;">${statusElt}</div>
      </div>
    `;

    const toStri = `
      ${entete}
      ${code}
      ${name}
      ${telephone}
      ${address}
      ${product}
      ${datereception}
      ${enregistrerpar}
      ${enregistrerle}
      ${statut}
      ${solution}
      ${traiteur}
      ${dtraitement}
    `;

    // handlePrintAvance(toStri);
    const childWindow = window.open("", "modal");

    if (!childWindow) {
      alert("Veuillez autoriser les popups.");
      return;
    }

    handlePrintAvance(childWindow, toStri);
  }

  const getCardData = (item) => ({
    code: item.codeClient,
    client: item.clientFirstAndLastName || "Anonyme",
    title: item.content || "—",
    subtitle: item.langue?.libelle || null,
    status: item.status,
    gravity: null,
    date: item.createdAt,
    slaWarning: item.retardDay !== undefined && item.retardDay <= 0 &&
      !["SATISFIED","UNSATISFIED","PARTIAL_SATISFIED","CLASSED"].includes(item.status),
    retardDay: item.retardDay,
  });

  const tableColumns = [
    {
      id: "codeClient", label: "Code client", sortable: true, minWidth: 100,
      render: (item) => (
        <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#005081", fontFamily: "monospace" }}>
          {item.codeClient || "—"}
        </span>
      ),
    },
    {
      id: "client", label: "Client", sortable: true, minWidth: 140,
      render: (item) => (
        <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>
          {item.clientFirstAndLastName || <em>Anonyme</em>}
        </span>
      ),
      sortValue: (item) => item.clientFirstAndLastName || "",
    },
    {
      id: "content", label: "Contenu", sortable: false, minWidth: 200,
      render: (item) => (
        <span style={{ fontSize: "0.82rem", color: "#334155", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", maxWidth: 280 }}>
          {item.content || "—"}
        </span>
      ),
    },
    {
      id: "langue", label: "Langue", sortable: true, minWidth: 100,
      render: (item) => (
        <span style={{ fontSize: "0.80rem", color: "#475569" }}>
          {item.langue?.libelle || "—"}
        </span>
      ),
      sortValue: (item) => item.langue?.libelle || "",
    },
    {
      id: "status", label: "Statut", sortable: true, minWidth: 120,
      render: (item) => <ClaimStatusBadge status={item.status} />,
      sortValue: (item) => item.status || "",
    },
    {
      id: "date", label: "Enregistrée le", sortable: true, minWidth: 130,
      render: (item) => (
        <span style={{ fontSize: "0.80rem", color: "#475569", whiteSpace: "nowrap" }}>
          {item.createdAt ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(item.createdAt)) : "—"}
        </span>
      ),
      sortValue: (item) => item.createdAt || "",
    },
  ];

  const tableFilterFn = (item, { q, filterStatus }) => {
    if (activeFilter !== "ALL" && item.status !== activeFilter) return false;
    if (q && !(
      item.codeClient?.toLowerCase().includes(q) ||
      item.clientFirstAndLastName?.toLowerCase().includes(q) ||
      item.content?.toLowerCase().includes(q)
    )) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    return true;
  };

  let content = [];
  content = props.items;
  //darrell : add custome attribut for search
  content.forEach((element) => {
    //status
    let statusElt;
    switch (element.status) {
      case "SAVED":
        statusElt = "Enregistrée";
        break;
      case "TEMP_SAVED":
        statusElt = "Sauvegardée";
        break;
      case "TREAT":
        statusElt = "Traitée";
        break;
      default:
        statusElt = "";
        break;
    }

    element.statusStr = statusElt;
    // date createdAt
    // console.log("daterecligne",element.createdAt)
    let createdAt = new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(element.createdAt));
    element.createdAtFormated = createdAt;
  });




  if (props.match?.params?.code && props.match.params.code !== "all") {
    const filesCount = props.selectedItemFiles?.length ?? 0;
    const audiosCount = props.selectedItemAudio?.length ?? 0;
    const extrasCount = props.extras?.filter(e => e.contenu)?.length ?? 0;
    const contentsCount = (props.content ? 1 : 0) + extrasCount;
    const decision = props.solution === true ? "Pris en compte" : props.solution === false && props.status === "TREAT" ? "Non pris en compte" : null;

    const AccSection = ({ color, dotColor, icon, title, badge, actionBtn, children }) => {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 12 }}>
          <button onClick={() => setIsOpen(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>{title}</span>
            {badge !== undefined && <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", background: dotColor, borderRadius: 20, padding: "2px 9px", marginRight: 8 }}>{badge}</span>}
            {actionBtn && <div onClick={e => e.stopPropagation()} style={{ marginRight: 8 }}>{actionBtn}</div>}
            <span style={{ fontSize: 10, color: "#94a3b8" }}>{isOpen ? "▲" : "▼"}</span>
          </button>
          {isOpen && <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 18px" }}>{children}</div>}
        </div>
      );
    };

    return (
      <>
        <audio ref={audioRef} src={currentAudio} hidden />
        <TraitementShell
          onBack={() => history.push("/suggestions/liste/all")}
          codeClient={props.codeClient || props.code}
          status={props.status}
          conversionWarning={warningConvert || null}
          headerActions={
            <button onClick={(e) => printRecu(e)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#475569" }}>
              <PrintIcon style={{ fontSize: 15 }} /> Imprimer
            </button>
          }
          lastname={props.lastname}
          phone={props.phone}
          email={props.email}
          address={props.address}
          language={props.language}
          gender={props.gender}
          dossierimf={props.dossierimf}
          recorded_at={props.recorded_at}
          collect={props.collect}
          product={props.product}
          unit={props.unit}
          created_by={props.created_by}
          creationDate={creationDate}
          content={props.content}
          visibleActions={[]}
          selectedItemFiles={props.selectedItemFiles}
          selectedItemAudio={props.selectedItemAudio}
          customTabs={[
            {
              key: "traitement",
              label: "Détails du traitement",
              content: (() => {
                const SG_STEPS = [
                  { label: "Enregistrée" },
                  { label: "Traitée" },
                ];
                const sgAllDone = ["TREAT","SATISFIED","CLASSED"].includes(props.status);
                const currentStep = sgAllDone ? SG_STEPS.length : 0;

                const SG_HERO = {
                  SAVED:      { title: "En attente de décision", sub: "Cette suggestion n'a pas encore été traitée", iconColor: "#1d4ed8", iconBg: "#dbeafe", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                  TEMP_SAVED: { title: "Sauvegardée temporairement", sub: "En attente de complétion", iconColor: "#7c3aed", iconBg: "#ede9fe", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> },
                };
                const hero = SG_HERO[props.status];

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                    {/* ── Stepper ── */}
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {SG_STEPS.map((step, i) => {
                          const done = i < currentStep;
                          const active = i === currentStep;
                          const dotC = done ? "#10b981" : active ? "#3b82f6" : "#e2e8f0";
                          const textC = done ? "#10b981" : active ? "#1d4ed8" : "#94a3b8";
                          return (
                            <React.Fragment key={i}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, flex: "0 0 auto" }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? "#dcfce7" : active ? "#dbeafe" : "#f1f5f9", border: `2px solid ${dotC}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotC }} />}
                                </div>
                                <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, color: textC, marginTop: 5, whiteSpace: "nowrap" }}>{step.label}</span>
                              </div>
                              {i < SG_STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < currentStep ? "#10b981" : "#e2e8f0", margin: "0 4px", marginBottom: 16, borderRadius: 2 }} />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Hero card (pas encore traitée) ── */}
                    {hero && (
                      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 60, height: 60, borderRadius: 16, background: hero.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: hero.iconColor }}>{hero.icon}</div>
                          <div>
                            <div style={{ fontSize: 17, fontWeight: 800, color: "#1e293b" }}>{hero.title}</div>
                            {hero.sub && <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{hero.sub}</div>}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Informations du dossier</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            {[
                              { label: "Enregistrée le", value: creationDate },
                              { label: "Canal", value: props.collect },
                              { label: "Produit", value: props.product },
                              { label: "Point de service", value: props.unit },
                              { label: "Enregistrée par", value: props.created_by },
                              { label: "Code client", value: props.codeClient },
                            ].filter(f => f.value).map(({ label, value }) => (
                              <div key={label} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{label}</div>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Résultat décision (TREAT) ── */}
                    {props.status === "TREAT" && (
                      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                          <GavelIcon style={{ fontSize: 17, color: "#6366f1" }} /> Résultat du traitement
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: props.solution === true ? "#f0fdf4" : "#fef2f2", borderRadius: 10, border: `1px solid ${props.solution === true ? "#bbf7d0" : "#fecaca"}` }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: props.solution === true ? "#dcfce7" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {props.solution === true ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: props.solution === true ? "#166534" : "#991b1b" }}>Décision : {decision}</div>
                          </div>
                          {props.handled_by && <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#475569" }}><PersonIcon style={{ fontSize: 16, color: "#94a3b8" }} /><span><span style={{ fontWeight: 600, color: "#1e293b" }}>Par : </span>{props.handled_by}</span></div>}
                          {props.handled_at && <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#475569" }}><CalendarMonthIcon style={{ fontSize: 16, color: "#94a3b8" }} /><span><span style={{ fontWeight: 600, color: "#1e293b" }}>Le : </span>{formatDate(props.handled_at)}</span></div>}
                          {props.comment && <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "12px 16px" }}><div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Commentaire</div><div style={{ fontSize: 13.5, color: "#1e293b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{props.comment}</div></div>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })(),
            },
            {
              key: "medias",
              label: "Contenu & Médias",
              content: (
                <div>
                  <AccSection color="#ede9fe" dotColor="#8b5cf6" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} title="Contenus" badge={contentsCount}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {props.content && <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "12px 16px" }}><div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Contenu initial</div><div style={{ fontSize: 13.5, color: "#1e293b", whiteSpace: "pre-wrap" }}>{props.content}</div><div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 8 }}>{props.created_by} · {creationDate}</div></div>}
                      {props.extras?.filter(e => e.contenu).map((extra, i) => <div key={i} style={{ background: "#faf5ff", borderRadius: 10, border: "1px solid #ede9fe", padding: "12px 16px" }}><div style={{ fontSize: 13.5, color: "#1e293b", marginBottom: 6 }}>{extra.contenu}</div><div style={{ fontSize: 11.5, color: "#7c3aed" }}>{extra.user?.firstAndLastName} · {formatDate(extra.createdAt)}</div></div>)}
                      {contentsCount === 0 && <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Aucun contenu</div>}
                    </div>
                  </AccSection>
                  <AccSection color="#dbeafe" dotColor="#3b82f6" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>} title="Fichiers joints" badge={filesCount}>
                    {filesCount > 0 ? attachmentList : <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Aucun fichier joint</div>}
                  </AccSection>
                  <AccSection color="#dcfce7" dotColor="#22c55e" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>} title="Audios" badge={audiosCount}>
                    {audiosCount > 0 ? audioList : <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Aucun audio</div>}
                  </AccSection>
                </div>
              ),
            },
            {
              key: "historique",
              label: "Historique",
              content: (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>Flux du dossier</span>
                    </div>
                    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </div>
                        <div style={{ fontSize: 13, color: "#475569" }}><span style={{ fontWeight: 600, color: "#1e293b" }}>Enregistrée par : </span>{props.created_by || "—"}<span style={{ color: "#94a3b8" }}> · {creationDate}</span></div>
                      </div>
                      {props.status === "TREAT" && props.handled_by && (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <div style={{ fontSize: 13, color: "#475569" }}><span style={{ fontWeight: 600, color: "#1e293b" }}>Traitée par : </span>{props.handled_by}<span style={{ color: "#94a3b8" }}>{props.handled_at ? " · " + formatDate(props.handled_at) : ""}</span></div>
                        </div>
                      )}
                    </div>
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
    // "Liste Suggestions"
    <div id="main">
      {/* {props.showSelectPrintItem && ( */}
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
                  <div className="col l12 s12 m12 text-center">
                    Reçu entre:
                  </div>
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
                        // onClick={(e) => {
                        //   // console.log("props.items", props.items);
                        //   handlePrint3(config, selectOption, props.items);
                        // }}
                        onClick={(e) => {
                          if (startDate && endDate) {
                            handlePrint33(config, selectOption, props.items, formatDate2(startDate), formatDate2(endDate));
                          } else {
                            // Sinon, utiliser handlePrint2 sans filtre
                            handlePrint3(config, selectOption, props.items);
                          }
                        }}
                        className="btn indigo lighten-5 indigo-text waves-effect waves-effect-b waves-light"
                      >
                        <span className="text-nowrap">Imprimer</span>
                      </a>
                    ) : (
                      <a
                        // onClick={(e) => {
                        //   table3XLS2X(
                        //     "Liste_des_suggestions" +
                        //     today().replaceAll("/", ""),
                        //     "brke",
                        //     selectOption,
                        //     props.items
                        //   );
                        // }}
                        onClick={(e) => {
                          if (startDate && endDate) {
                            table3XLS2XF(
                              "Liste_des_suggestions" +
                              today().replaceAll("/", ""),
                              "brke",
                              selectOption,
                              props.items,
                              startDate,
                              endDate
                            );

                          } else {
                            table3XLS2X(
                              "Liste_des_suggestions" +
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
                    <DossierKPIBar items={content} kpiCards={SG_KPI_CARDS} />
                    <DossierFilterChips
                      items={content}
                      activeFilter={activeFilter}
                      onFilterChange={setActiveFilter}
                      filterButtons={SG_FILTER_BUTTONS}
                    />
                    <div className="row">
                      <div className="row">
                        <div className="col l6 m6 s12" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <h5 className="card-title" style={{ margin: 0 }}>
                            Liste des suggestions
                          </h5>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 24, borderRadius: 12, backgroundColor: "#005081", color: "#fff", fontSize: "0.75rem", fontWeight: 700, padding: "0 8px" }}>
                            {activeFilter === "ALL" ? content.length : content.filter((i) => i.status === activeFilter).length}
                          </span>
                        </div>
                        <div
                          className="col l6 m6 s12"
                          style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}
                        >
                          <Box sx={{ display: "inline-flex", borderRadius: "10px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                            <Tooltip title="Vue liste"><Box onClick={() => setViewMode("list")} sx={{ px: 1.4, py: 0.8, cursor: "pointer", backgroundColor: viewMode === "list" ? "#6366F1" : "#F8FAFC", color: viewMode === "list" ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.18s" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></Box></Tooltip>
                            <Tooltip title="Vue cartes"><Box onClick={() => setViewMode("card")} sx={{ px: 1.4, py: 0.8, cursor: "pointer", backgroundColor: viewMode === "card" ? "#6366F1" : "#F8FAFC", color: viewMode === "card" ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.18s" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></Box></Tooltip>
                          </Box>
                          {hbt.includes("H7") ? (
                            <img
                              src={pdf}
                              alt=""
                              style={{ marginRight: "4px", cursor: "pointer" }}
                              onClick={(e) => {
                                if (hbt.includes("H8")) {
                                  handleImpression();
                                  setChangeButtonPrint(true);
                                } else {
                                  handlePrint3(config, selectOption, props.items);
                                }
                              }}
                            />
                          ) : ""}
                          {hbt.includes("H9") ? (
                            <img
                              src={excel}
                              alt=""
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                if (hbt.includes("H10")) {
                                  handleImpression();
                                  setChangeButtonPrint(false);
                                } else {
                                  table3XLS2X(
                                    "Liste_des_suggestions" + today().replaceAll("/", ""),
                                    "brke",
                                    selectOption,
                                    props.items
                                  );
                                }
                              }}
                            />
                          ) : ""}
                        </div>
                      </div>
                      <div className="col s12">
                        {viewMode === "card" ? (
                          <DossierCardView
                            items={content}
                            getCardData={getCardData}
                            onCardClick={(item) => rowClickedHandler(null, item, null)}
                            filterFn={tableFilterFn}
                            showStatusFilter={true}
                            showGravityFilter={false}
                            searchPlaceholder="Rechercher une suggestion…"
                            emptyText="Aucune suggestion trouvée"
                          />
                        ) : (
                          <DossierTable
                            items={content}
                            columns={tableColumns}
                            onRowClick={(item) => rowClickedHandler(null, item, null)}
                            filterFn={tableFilterFn}
                            showStatusFilter={true}
                            showGravityFilter={false}
                            searchPlaceholder="Rechercher par code, contenu, client..."
                            emptyText="Aucune suggestion trouvée"
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
                      sx={{ position: "relative", backgroundColor: "#1e2188" }}
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
                          Détails de la suggestion
                        </Typography>
                      </Toolbar>
                    </AppBar>

                    <div className="row">
                      {/* first part */}
                      <div className="col l6 s12 pb-5" id="ficheReclamation">
                        <div className="card-panel pb-5">
                          <div className="row" id="ententeFiche">
                            <div className="col l6 s12" style={{ display: "flex", alignItems: "center" }}>
                              <h5 className="card-title">
                                Fiche de la suggestion
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
                                    Informations du suggéreur
                                  </h6>
                                </div>
                                <div className="row">
                                  <div
                                    className="col l12 s12 df pb-2"
                                    id="code"
                                  >
                                    {warningConvert}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="firstname"
                                  >
                                    <PersonIcon sx={{ mr: 2 }} />{" "}
                                    {props.lastname !== "" ? props.lastname : <i>Anonyme</i>}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="address"
                                  >
                                    <LocationOnIcon sx={{ mr: 2 }} />{" "}
                                    {props.address !== "" ? props.address : <i>Non défini</i>}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="phone"
                                  >
                                    <CallIcon sx={{ mr: 2 }} /> {props.phone !== "" ? props.phone : <i>Non défini</i>}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="gender"
                                  >
                                    <WcIcon sx={{ mr: 2 }} /> {props.gender !== "" ? props.gender : <i>Non défini</i>}
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
                                    Détails de la suggestion
                                  </h6>
                                </div>

                                <div className="row">
                                  <div className="col l6 s12 df pb-2" id="code">
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
                                    id="product"
                                  >
                                    <CategoryIcon sx={{ mr: 2 }} />{" "}
                                    {props.product !== "" ? props.product : <i>Non défini</i>}
                                  </div>

                                  <div className="col l6 s12 df pb-2" id="unit">
                                    <AddBusinessIcon sx={{ mr: 2 }} />{" "}
                                    {props.unit !== "" ? props.unit : <i>Non défini</i>}
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
                                      <ListItemButton divider >
                                        <ListItemText
                                          primary={props.content}
                                          secondary={props.created_by + ' le ' + creationDate}
                                        />
                                      </ListItemButton>


                                      {props.extras?.map((extra) => {
                                        return extra.contenu ?
                                          <ListItemButton key={extra.id} divider >
                                            <ListItemText primary={extra.contenu} secondary={extra.user?.firstAndLastName + ' le ' + formatDate(extra.createdAt)} />

                                            <Tooltip title={'Ce contenu a été ajouté ultérieurement par ' + extra.user?.firstAndLastName + ' le ' + formatDate(extra.createdAt) + '. la plainte etait en etat: ' + getStatusLabel(extra.status)}>
                                              <Info />
                                            </Tooltip>
                                          </ListItemButton>
                                          : <></>
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
                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography
                                    gutterBottom
                                    variant="body1"
                                    component="div"
                                    sx={{
                                      fontWeight: 'bold',
                                      mb: 1,
                                      mr: 1
                                    }}
                                  >  Contenu & Médias

                                  </Typography>
                                </Box>
                              </div>
                              <div className="col s12">
                                {attachmentList}
                              </div>
                            </div></div>
                        </div>

                        {/* Audio part */}
                        <div className="">
                          <div className="card-panel pb-5">
                            <div className="row" id="">
                              <div className="col s12 pb-3">
                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography
                                    gutterBottom
                                    variant="body1"
                                    component="div"
                                    sx={{
                                      fontWeight: 'bold',
                                      mb: 1,
                                      mr: 1
                                    }}
                                  >  Audios

                                  </Typography>
                                </Box>
                              </div>
                              <div className="col s12">
                                {audioList}
                              </div>
                            </div></div>
                        </div>
                      </div>

                      {/* second part */}
                      <div className="col l6 s12 pb-5" id="ficheReclamation">
                        <div className="card-panel pb-5">
                          <div className="row" id="">
                            <div className="col s12">
                              <h5 className="card-title">
                                Détails du traitement
                              </h5>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col s12 m12">
                              <div className="row">{details}</div>
                            </div>
                          </div>
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
    isLoading: state.suggestion_list.isLoading,
    id: state.suggestion_list.id,
    firstname: state.suggestion_list.firstname,
    lastname: state.suggestion_list.lastname,
    address: state.suggestion_list.address,
    phone: state.suggestion_list.phone,
    gender: state.suggestion_list.gender,
    language: state.suggestion_list.language,
    dossierimf: state.suggestion_list.dossierimf,
    email: state.suggestion_list.email,
    code: state.suggestion_list.code,
    codeClient: state.suggestion_list.codeClient,
    recorded_at: state.suggestion_list.recorded_at,
    collect: state.suggestion_list.collect,
    product: state.suggestion_list.product,
    unit: state.suggestion_list.unit,
    content: state.suggestion_list.content,
    extras: state.suggestion_list.extras,
    status: state.suggestion_list.status,
    solution: state.suggestion_list.solution,
    comment: state.suggestion_list.comment,
    crew: state.suggestion_list.crew,
    created_by: state.suggestion_list.created_by,
    created_at: state.suggestion_list.created_at,
    handled_at: state.suggestion_list.handled_at,
    handled_by: state.suggestion_list.handled_by,
    approved_at: state.suggestion_list.approved_at,
    approved_by: state.suggestion_list.approved_by,
    resolved_at: state.suggestion_list.resolved_at,
    resolved_by: state.suggestion_list.resolved_by,
    errors: state.suggestion_list.suggestion_list_errors,
    items: state.suggestion_list.items,
    selectedItem: state.suggestion_list.selectedItem,
    selectedItemAudio: state.suggestion_list.selectedItemAudio,
    selectedFiles: state.suggestion_list.selectedFiles,
    selectedItemFiles: state.suggestion_list.selectedItemFiles,
    showSelectPrintItem: state.suggestion_list.showSelectPrintItem,
    convertedBy: state.suggestion_list.converted_by,
    convertedAt: state.suggestion_list.converted_at,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loading: (err) => {
      dispatch(loading(err));
    },
    errors: (err) => {
      dispatch(suggestionListErrors(err));
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
    solutionChanged: (solution) => {
      dispatch(solutionChanged(solution));
    },
    createdAtChanged: (createdAt) => {
      dispatch(createdAtChanged(createdAt));
    },
    createdByChanged: (createdBy) => {
      dispatch(createdByChanged(createdBy));
    },
    handledAtChanged: (handledAt) => {
      dispatch(handledAtChanged(handledAt));
    },
    handledByChanged: (handledBy) => {
      dispatch(handledByChanged(handledBy));
    },
    resolvedAtChanged: (resolvedAt) => {
      dispatch(resolvedAtChanged(resolvedAt));
    },
    resolvedByChanged: (resolvedBy) => {
      dispatch(resolvedByChanged(resolvedBy));
    },
    itemsChanged: (items) => {
      dispatch(itemsChanged(items));
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
      dispatch(selectedItemAudioChanged(selectedItemAudio))
    },
    showSelectPrintItemChanged: (show) => {
      dispatch(showSelectPrintItemChanged(show));
    },
    crewChanged: (crew) => {
      dispatch(crewChanged(crew));
    },
    commentChanged: (comment) => {
      dispatch(commentChanged(comment));
    },
    convertedByChanged: (convertedBy) => {
      dispatch(convertedByChanged(convertedBy));
    },
    convertedAtChanged: (convertedAt) => {
      dispatch(convertedAtChanged(convertedAt));
    },
    extrasChanged: (extra) => {
      dispatch(extrasChanged(extra));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListeSuggestions);
