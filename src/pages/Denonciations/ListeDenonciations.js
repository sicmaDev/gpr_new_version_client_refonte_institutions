import React, { useEffect, useRef, useState } from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import Select from "react-select";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import WarningIcon from '@mui/icons-material/Warning';
import DatePicker from "react-datepicker";
import TextField from "@mui/material/TextField";
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
  showSelectPrintItemChanged,
  crewChanged,
  underSubjectChanged,
  sessionChanged,
  selectedItemAudioChanged,
  extrasChanged,
  convertedAtChanged,
  convertedByChanged,
} from "../../redux/actions/Reclamations/ListeReclamationsActions";
import http from "../../apis/http-common";
import PrintIcon from '@mui/icons-material/Print';
import { connect } from "react-redux";

// import { loadItemFromSessionStorage, today } from "../../utils/utils";
// import { v4 as uuidv4 } from "uuid";
// import { formatDate, guessExtension } from "../../utils";
import { handlePrint, handlePrint2, handlePrint22, handlePrintAvance } from "../../Utils/tables";

import { table2XLSX, table2XLS2X, table2XLS2XF } from "../../Utils/tabletoexcel";

import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import PersonIcon from '@mui/icons-material/Person';
import CallIcon from '@mui/icons-material/Call';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WcIcon from '@mui/icons-material/Wc';
import LanguageIcon from '@mui/icons-material/Language';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import RecyclingIcon from '@mui/icons-material/Recycling';
import CategoryIcon from '@mui/icons-material/Category';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import DataObjectIcon from '@mui/icons-material/DataObject';
import PinIcon from '@mui/icons-material/Pin';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import excel from '../../assets/images/excel.svg'
import pdf from '../../assets/images/pdf.svg'
import timelineOppositeContentClasses from '@mui/lab/TimelineOppositeContent';
import { formatDate, formatDate2, guessExtension, loadItemFromLocalStorage, loadItemFromSessionStorage, today } from "../../Utils/utils";
import { Avatar, DialogContent, DialogContentText, Text, Box, CardContent, Grid, Tooltip, List, ListItemButton, ListItemText, Card, DialogActions, DialogTitle } from "@mui/material";
import { FileDownload, History, Info, Pause, PlayArrow, Star, VolumeUp } from "@mui/icons-material";
import RecorderControls from "../../components/recorder-controls";
import useRecorder from "../../hooks/useRecorder";
import GavelIcon from '@mui/icons-material/Gavel';
import StopIcon from '@mui/icons-material/Stop';
import { addExtraClaimApi, startSession } from "../../apis/Reclamations/ReclamationsApi";
import { getClaimAudioApi } from "../../apis/Reclamations/ReclamationsApi";
import { downloadAudioApi, downloadFillesApi, getDenunAudioApi, getFillesApi, listeTousStatuts, listeTousStatutsOffline } from "../../apis/Denonciations/DenonciationsApi";
import { INSTITUTION_ADDRESS, INSTITUTION_AGREMENT, INSTITUTION_EMAIL, INSTITUTION_LOGO, INSTITUTION_NAME, INSTITUTION_TEL } from "../../Utils/globals";
import MoveUpIcon from '@mui/icons-material/MoveUp';
import SaveIcon from "@mui/icons-material/Save";
import { LoadingButton } from "@mui/lab";
import { notify } from "../../Utils/alert";
import { showModalChanged } from "../../redux/actions/Reclamations/HistoriqueReclamationActions";
import HistoriqueAffectation from "../../components/HistoriqueAffectation";
import { WarningAmber } from '@mui/icons-material';

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

const ListeDenonciations = (props) => {
  let dimf, crew;
  const [open, setOpen] = React.useState(false);
  const [interne, setInterne] = React.useState(true);
  const [changeButtonPrint, setChangeButtonPrint] = useState(false);
  const [impression, setImpression] = React.useState(false)

  let user = loadItemFromSessionStorage("app-user") !== undefined ? (JSON.parse(loadItemFromSessionStorage("app-user"))) : undefined;
  let hbt = (user.posteDto.habilitations).split(',');
  let addR = (user.additionalRole);

  const [showAudioPlayer, setAudioPlayer] = useState("");
  const [currentAudio, setCurrentAudio] = useState("");


  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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



  let mode = loadItemFromLocalStorage("app-mode") !== undefined ? (JSON.parse(loadItemFromLocalStorage("app-mode"))) : undefined;
  let objets =
    loadItemFromLocalStorage("app-objets") !== undefined
      ? JSON.parse(loadItemFromLocalStorage("app-objets"))
      : undefined;

  const [currentData, setCurrentData] = useState(null);
  const [audioListForm, setAudioListForm] = useState([])
  const [audioListUrlForm, setAudioListUrlForm] = useState([])

  const handleClickOpen = () => {
    setOpen(true);
  };
  const [currentAudioId, setCurrentAudioId] = useState("");
  const audioRef = useRef(null);
  const [filesForm, setFiles] = useState([])
  const [showExtraContent, setShowExtraContent] = useState(false)
  const [extraContent, setExtraContent] = useState("")
  const [extraFileLoading, setExtraFileLoading] = useState(false)
  const [claim_id, setClaimId] = useState(null)

  
  const warningConvert = (props.convertedBy !== "" && props.convertedAt !== "") && (
    <Tooltip
      title={`Converti en dénonciation par ${props.convertedBy} le ${props.convertedAt}`}
      arrow
    >
      <WarningAmber fontSize="medium" sx={{ ml: 1, color: 'orange' }}  style={{ marginTop: 3 }} />
    </Tooltip>
  );

  const handleClose = () => {
    setOpen(false);
    setInterne(false)
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
  };

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }


  useEffect(() => {
    if (mode === 1) {
      props.itemsChanged([])
      listeTousStatuts(props).then((r) => { });
    } else {
      props.itemsChanged([])
      listeTousStatutsOffline(props).then((r) => { });
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

  const { recorderState, ...handlers } = useRecorder();
  let { audio } = recorderState;

  const [open2, setOpen2] = useState(false);
  const [showAudioBox, setAudioBox] = useState(false);
  
  useEffect(() => {
    if (audio) {
      setAudioListForm([...audioListForm, audio])
      setAudioListUrlForm([...audioListUrlForm, URL.createObjectURL(audio)])

    }
  }, [audio]);

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
      key: "codeClient",
      text: "Code client",
      className: "codeClient",
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
          cmp = claim.objet.risqueLevel
        } else {
          if (claim.id !== "") {
            cmp = claim.objet.risqueLevel
          } else {
            let idO = objets.filter((e) => {
              return (
                e.id === claim.objetId
              );
            })
            cmp = (idO[0]).risqueLevel
          }

        }
        switch (claim.objet.risqueLevel) {
          case "MINEUR":
            if (claim.transmitted) {
              graviteElt = (
                <>
                  <div className="df">
                    <span className="green-text text-bold mr-2">Mineur</span>
                    <div className="card-content red-text ml-4"><MoveUpIcon /></div>
                  </div>

                </>

              );
            } else {
              graviteElt = (
                <span className="green-text text-bold">Mineur</span>
              );
            }
            break;
          case "MOYEN":
            graviteElt = (
              <span className="orange-text text-bold">Moyen</span>

            );
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
        let temps
        if (claim.status !== "TREAT") {
          if (claim.retardDay > 0) {
            temps = claim.declenchedDate
          } else {
            temps = <div className="card-content red-text"><WarningIcon /></div>
          }
        } else {
          temps = "-"
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
    filename: "Liste des dénonciations",
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
      },
    },
  };
  const clearComponentState = () => {
    props.subjectChanged("");
    props.codeChanged("");
    props.codeClientChanged("");
    props.recordedAtChanged("");
    props.collectChanged("");
    props.productChanged("");
    props.unitChanged("");
    props.contentChanged("");
    props.solutionChanged("");
    props.commentChanged("");
    props.motifChanged("");
    props.statusChanged("");
    props.createdByChanged("");
    props.createdAtChanged("");
    props.assignedAtChanged("");
    props.assignedByChanged("");
    props.handledAtChanged("");
    props.handledByChanged("");
    props.approvedAtChanged("");
    props.approvedByChanged("");
    props.claimListErrors("");
    props.selectedItemChanged({});
    props.selectedFilesReset([]);
    props.selectedItemFilesChanged([]);
    setCurrentAudio("");
    setAudioPlayer("");
  };

  const rowClickedHandler = (event, data, rowIndex) => {
    handleClickOpen()
    console.log("dataRow", data)
    //console.log("external",data.external_remedies);
    clearComponentState();
    setClaimId(data.id)
    // setAudios([])
    // setFiles([])
    // setContent(null) 

    if (mode === 1) {
      props.codeChanged(data.code ? data.code : "");
      props.codeClientChanged(data.codeClient ? data.codeClient : "");
      props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
      props.collectChanged(data.collectionChannel.libelle ? data.collectionChannel.libelle : "");
      props.subjectChanged(data.objet.libelle ? data.objet.libelle : "");
      props.underSubjectChanged(data.objet.categorie.libelle ? data.objet.categorie.libelle : "");
      props.productChanged(data.product.libelle ? data.product.libelle : "");
      props.unitChanged(data.servicePoint.libelle ? data.servicePoint.libelle : "");
      props.contentChanged(data.content ? data.content : "");
      props.solutionChanged(data.solutionDtos ? data.solutionDtos : "");
      // props.commentChanged(data.comment ? data.comment : "");
      // props.motifChanged(data.motif ? data.motif : "");
      props.externalRemediesChanged(data.externalRecourses !== null ? data.externalRecourses : null)
      props.statusChanged(data.status ? data.status : "");
      props.createdByChanged(data.collector.firstAndLastName ? data.collector.firstAndLastName : "");
      props.createdAtChanged(data.createdAt ? data.createdAt : "");
      props.assignedAtChanged(data.affectedAt ? data.affectedAt : "");
      props.assignedByChanged(data.treatmentAffectedBy ? data.treatmentAffectedBy.firstAndLastName : "");
      props.handledByChanged(data.treatmentAffectedTo ? data.treatmentAffectedTo.firstAndLastName : "");
      props.selectedItemChanged(data);
      setCurrentData(data);
      props.sessionChanged(data.session !== null ? data.session : "");
      //fetch attachments for selected claim
      getFillesApi(data.id, props);
      getDenunAudioApi(data.id, props);
      props.extrasChanged(data.extras ?? []);
      props.convertedByChanged(data.convertedBy ? data.convertedBy.firstAndLastName : "");
      props.convertedAtChanged(data.convertedAt ? data.convertedAt : "");
    } else {
      if ((data.id && data.collectionChannel)) {
        // console.log("dataofflineDen2",data)

        props.codeChanged(data.code ? data.code : "");
        props.codeClientChanged(data.codeClient ? data.codeClient : "");
        props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
        props.collectChanged(data.collectionChannel.libelle ? data.collectionChannel.libelle : "");
        props.subjectChanged(data.objet.libelle ? data.objet.libelle : "");
        props.underSubjectChanged(data.objet.categorie.libelle ? data.objet.categorie.libelle : "");
        props.productChanged(data.product.libelle ? data.product.libelle : "");
        props.unitChanged(data.servicePoint.libelle ? data.servicePoint.libelle : "");
        props.contentChanged(data.content ? data.content : "");
        props.solutionChanged(data.solutionDtos ? data.solutionDtos : "");
        // props.commentChanged(data.comment ? data.comment : "");
        // props.motifChanged(data.motif ? data.motif : "");
        props.externalRemediesChanged(data.externalRecourses !== null ? data.externalRecourses : null)
        props.statusChanged(data.status ? data.status : "");
        props.createdByChanged(data.collector.firstAndLastName ? data.collector.firstAndLastName : "");
        props.createdAtChanged(data.createdAt ? data.createdAt : "");
        props.assignedAtChanged(data.affectedAt ? data.affectedAt : "");
        props.assignedByChanged(data.treatmentAffectedBy ? data.treatmentAffectedBy.firstAndLastName : "");
        props.handledByChanged(data.treatmentAffectedTo ? data.treatmentAffectedTo.firstAndLastName : "");
        props.sessionChanged(data.session !== null ? data.session : "");
        props.selectedItemChanged(data);
        setCurrentData(data);
        //fetch attachments for selected claim
        getFillesApi(data.id, props);
        getDenunAudioApi(data.id, props);
        props.extrasChanged(data.extras ?? []);
        props.convertedByChanged(data.convertedBy ? data.convertedBy.firstAndLastName : "");
        props.convertedAtChanged(data.convertedAt ? data.convertedAt : "");
      } else {
        // console.log("dataofflineDen",data)
        // props.idChanged(data.id ? data.id : "")
        props.codeChanged(data.code ? data.code : "");
        props.codeClientChanged(data.codeClient ? data.codeClient : "");
        props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
        props.contentChanged(data.content ? data.content : "");
        props.statusChanged(data.status ? data.status : "");

        let description1 = data.collectionChannelId ? (JSON.parse(loadItemFromSessionStorage('app-supports'))).filter((e) => { return e.id === data.collectionChannelId }) : ""
        let description2 = data.objetId ? (JSON.parse(loadItemFromSessionStorage('app-objets'))).filter((e) => { return e.id === data.objetId }) : ""
        let description3 = data.productId ? (JSON.parse(loadItemFromSessionStorage('app-produits'))).filter((e) => { return e.id === data.productId }) : ""
        let description4 = data.servicePointId ? (JSON.parse(loadItemFromSessionStorage('app-ps'))).filter((e) => { return e.id === data.servicePointId }) : ""
        let description5 = data.collectorId ? (JSON.parse(loadItemFromSessionStorage('app-users'))).filter((e) => { return e.id === data.collectorId }) : ""


        props.collectChanged(data.collectionChannelId ? description1[0].libelle : "");
        props.subjectChanged(data.objetId ? description2[0].categorie.libelle : "");
        props.underSubjectChanged(data.objetId ? description2[0].libelle : "");
        props.productChanged(data.productId ? description3[0].libelle : "");
        props.unitChanged(data.servicePointId ? description4[0].libelle : "");
        props.createdByChanged(data.collectorId ? description5[0].firstAndLastName : "");
        props.createdAtChanged(data.createdAt ? data.createdAt : "");
        props.sessionChanged(data.session !== null ? data.session : "");
        props.selectedItemChanged(data ? data : "");
        //fetch attachments for selected claim
        // getFillesApi(data.id, props);
        getDenunAudioApi(data.id, props);

      }
    }    
  };

  let statusElt;

  switch (props.status) {
    case "SAVED":
      statusElt = (
        <>
          <h5>
            <PrintIcon sx={{ mr: 2, verticalAlign: "middle" }} onClick={(e) => { printRecu(e) }} style={{ cursor: "pointer" }} />
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
            <PrintIcon sx={{ mr: 2, verticalAlign: "middle" }} onClick={(e) => { printRecu(e) }} style={{ cursor: "pointer" }} />
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
            <PrintIcon sx={{ mr: 2, verticalAlign: "middle" }} onClick={(e) => { printRecu(e) }} style={{ cursor: "pointer" }} />
            <History
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                props.showModalHistoriqueChanged(true)
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip affectedBgColor">
              <span className="">{("Affectée")}</span>
            </span>
          </h5>
        </>

      );
      break;
    case "TO_APPROUVED":
      statusElt = (
        <>
          <h5>
            <PrintIcon sx={{ mr: 2, verticalAlign: "middle" }} onClick={(e) => { printRecu(e) }} style={{ cursor: "pointer" }} />
            <History
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                props.showModalHistoriqueChanged(true)
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip toApprouvedBgColor">
              <span className="">{("A appouver")}</span>
            </span>
          </h5>
        </>

      );
      break;
    case "DESAPPROUVED":
      statusElt = (
        <>
          <h5>
            <PrintIcon sx={{ mr: 2, verticalAlign: "middle" }} onClick={(e) => { printRecu(e) }} style={{ cursor: "pointer" }} />
            <History
              sx={{ mr: 2, verticalAlign: "middle" }}
              onClick={(e) => {
                props.showModalHistoriqueChanged(true)
              }}
              style={{ cursor: "pointer" }}
            />
            <span className="chip treatBgColor">
              <span className="">{("Traitée")}</span>
            </span>
          </h5>
        </>

      );
      break;
    case "TREAT":
      statusElt = (
        <>
          <h5>
            <PrintIcon sx={{ mr: 2, verticalAlign: "middle" }} onClick={(e) => { printRecu(e) }} style={{ cursor: "pointer" }} />
            <span className="chip treatBgColor">
              <span className="">Traitée</span>
            </span>
          </h5>
        </>

      );
      break;

    default:
      statusElt = ""
      break;
  }

  let creationDate = props.created_at ? formatDate(props.created_at) : "";
  let colourOptions = [
    { value: "Code", label: "Code" },
    { value: "Code Client", label: "Code Client" },
    { value: "Status", label: "Status" },
    { value: "Enregistrer le", label: "Enregistrer le" },
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
    "Status",
    "Enregistrer le",
    "Enregistrer par",
  ]);


  let details;
  if (hbt.includes("H14") || addR === "PILOTE" || addR === "DE") {
    if ((props.solution).length !== 0) {
      let type;
      let index = 0;
      let solutions = interne === false ? Array.from(props.solution.filter((e) => { return e.status === "APPROVED" && e.satisfactionMeasureDto !== null })) : Array.from(props.solution);
      if ((props.solution).length !== 0) { type = interne === false ? " Détails du traitement - Interactions avec le client" : " Détails du traitement - En interne" }
      let couleurs = ["#333300", "#00cc00", "#99003d", "#3333ff", "#666666", "#253858", "#00875A", "#36B37E", "#FFC400", "#FF8B00", "#FF5630", "#5243AA", "#0052CC", "#00B8D9"]

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
                  <span className="indigo-text">
                    Traitement en interne
                  </span>
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
              <h6 className="card-title">
                {type}
              </h6>


              {/* let solutions =  */}
              {Array.from(solutions).map((solution) => {
                // let fond = couleurs[getRandomInt(couleurs.length)];
                let fond = couleurs[index % couleurs.length];

                let mesure = "";
                if (solution.status === "APPROVED" && solution.satisfactionMeasureDto !== null) {
                  let degre = solution.satisfactionMeasureDto.status === "SATISFIED" ? "Satisfait" : solution.satisfactionMeasureDto.status === "UNSATISFIED" ? "Non satisfait" : solution.satisfactionMeasureDto.status === "PARTIAL" ? "Partiellement satisfait" : "";
                  mesure =
                    <>
                      <Typography component="div" >
                        <div>
                          <span className="chip2" style={{ backgroundColor: fond }}>
                            <span className="hero">
                              Client {degre} : mesurée
                              {solution.satisfactionMeasureDto.measurer
                                ? ` par ${solution.satisfactionMeasureDto.measurer.firstAndLastName}`
                                : " depuis le site web "}
                              le {formatDate(solution.satisfactionMeasureDto.measureDateTime)}
                            </span>
                          </span>
                        </div>
                      </Typography>
                    </>
                } else if (solution.status === "APPROVED" && solution.satisfactionMeasureDto === null) {
                  mesure =
                    <>
                      <span className="chip2" style={{ backgroundColor: fond }}>
                        <span className="hero">
                          Traitée
                        </span>
                        {/* <span className="hero">
                          En attente de mesure de satisfaction
                        </span> */}
                      </span>
                    </>
                }

                let approbation = "";
                if (solution.status === "UNAPPROVED" && solution.motifDesaprobation !== null) {

                  approbation =
                    <>
                      <Typography component="div" >
                        <div className="row">
                          <div
                            className="col l12 s12 pb-2"
                            id="content"
                          >
                            <div className="df pb-2">
                              <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                              Motif de désapprobation
                            </div>
                            <div>{solution.motifDesaprobation !== null ? solution.motifDesaprobation : ""}</div>
                          </div>
                        </div>

                        <div>
                          <span className="chip2" style={{ backgroundColor: fond }}>
                            <span className="hero">
                              Désapprouvée par {solution.unApprouver !== null ? solution.unApprouver.firstAndLastName : ""} le {formatDate(solution.unApprouvedAt)}
                            </span>
                          </span>
                        </div>
                      </Typography>
                    </>
                } else if (solution.status === "UNAPPROVED" && solution.motifDesaprobation === null) {
                  approbation =
                    <>
                      <span className="chip2" style={{ backgroundColor: fond }}>
                        <span className="hero">
                          En attente d'approbation
                        </span>
                      </span>
                    </>
                }

                let enregistrement =
                  <>

                    <Timeline

                    >
                      <TimelineItem >
                        <TimelineOppositeContent
                          sx={{ m: 'auto 0', flex: "0" }}
                          variant="body2"
                          color="text.secondary"
                        >
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineConnector />
                          <TimelineDot style={{ fontSize: "25px" }}>
                            <Avatar sx={{ width: 32, height: 32, backgroundColor: fond }}>{index = index + 1}</Avatar>
                          </TimelineDot>
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent sx={{ py: '12px', px: 2 }}>

                          <Typography variant="h6" component="span">
                            {solution.author.firstAndLastName} - <span style={{ fontSize: "12px" }}>{formatDate(solution.createdAt)}</span>
                          </Typography>

                          <Typography className="pb-2" component="div">
                            <div className="row">
                              <div
                                className="col l12 s12 pb-2"
                                id="content"
                              >
                                <div className="df pb-2">
                                  <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                                  Solution
                                </div>
                                <div>{solution.content}</div>
                              </div>

                              <div
                                className="col l12 s12 pb-2"
                                id="content"
                              >
                                <div className="df pb-2">
                                  <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                                  Commentaire
                                </div>
                                <div>{solution.commentaire}</div>
                              </div>
                            </div>

                          </Typography>
                          {approbation}
                          {mesure}

                        </TimelineContent>
                      </TimelineItem>

                    </Timeline>

                  </>

                return (
                  <>

                    {enregistrement}

                  </>
                );

              })}
            </div>
          </>);
      } else {
        details =
          <>
            <div className="row">
              <div className="col s12 df pb-2">
                <span
                  className="chip indigo lighten-5"
                  style={{ cursor: "pointer" }}
                  onClick={handleInterne}
                >
                  <span className="indigo-text">
                    Traitement en interne
                  </span>
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
              Aucune donnée
            </div>
          </>
      }
    } else if ((props.solution).length === 0) {
      let affectation = "";
      if (props.status === "AFFECTED") {
        affectation =
          <>
            <Typography component="div" >
              <div>

                Réclamation affectée à  <span style={{ fontWeight: "bold" }}>{props.handled_by}</span> par {props.assigned_by} le {formatDate(props.assigned_at)}

              </div>
            </Typography>
          </>
        details = (
          <>
            {affectation}
          </>);
      } else {
        details = "Cette dénonciation est en attente de traitement";
      }


    }
  } else {
    // console.log(props.solution.length)
    //il n'a pas H14
    if (props.solution.length !== 0) {
      //LA RECLAMATION A AU MOINS UNE SOLUTION
      details =
        <>
          <div className="row pb-5 mt-4">
            <div
              className="col l12 s12 pb-3"
              id="content"
            >
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

            <div
              className="col l12 s12 pb-2"
              id="content"
            >
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
        </>
    } else if (props.solution.length === 0) {
      //LA RECLAMATION N'A PAS DE SOLUTION
      let affectation = "";
      if (props.status === "AFFECTED") {
        //MAIS EST AFFECTEE
        affectation = (
          <>
            <Typography component="div">
              <div>
                Réclamation affectée le {formatDate(props.assigned_at)}
              </div>
            </Typography>
          </>
        );
        details = <>{affectation}</>;
      } else {
        //AUCUN TRAITEMENT SUR CETTE REC
        details = "Cette dénonciation est en attente de traitement";
      }
    }
  }

    let attachmentList;
  if (props.selectedItemFiles.length > 0) {

    let attachmentListChild = props.selectedItemFiles.map((attachment) => {
      let icon = guessExtension(attachment);
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
              backgroundColor: 'grey.100',
              borderRadius: '6px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              minWidth: '56px'
            }}>
              <img
                src={icon}
                height="28"
                width="22"
                alt=""
                style={{ objectFit: 'contain' }}
              />
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
                  <Tooltip title={`Ajouté par ${attachment.extra?.user?.firstAndLastName} le ${attachment.extra?.createdAt}`}>
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
        Ce dossier ne contient pas de fichiers jointe
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
    console.log("props.selectedItemAudio", props.selectedItemAudio);
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
                  <Tooltip title={`Ajouté par ${audioItem.extra?.user?.firstAndLastName} le ${audioItem.extra?.createdAt}`}>
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
      <Grid spacing={2} container size={12}>

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

  const printRecu = (e) => {
    e.preventDefault();

    // Entête de la page
    let image = '<img src="' + INSTITUTION_LOGO + '" alt="logo" style=" width: "200px",height: "90px" " className=" report-logo"/>';
    let entete = '<div className="row" id="enteteRapport" style="margin-bottom:50px!important">';
    entete += '<div className="col l2 s3 m3" style="margin-bottom:20px!important">' + image + '</div>';
    entete += '<div className="col l8 s7 m7"><b>' + INSTITUTION_NAME + '</b><br /><i><span>Numéro Agrément: </span>' + INSTITUTION_AGREMENT + '</i><br /><i><span>Addrese: </span>' + INSTITUTION_ADDRESS + '</i><br /><i><span>Tel: </span>' + INSTITUTION_TEL + '</i><br /><i><span>Email: </span>' + INSTITUTION_EMAIL + '</i></div></div>';



    // Données de l'élément sélectionné
    let description2 = props.selectedItem.objetId
      ? JSON.parse(loadItemFromSessionStorage('app-objets')).filter(e => e.id === props.selectedItem.objetId)
      : "";
    let description3 = props.selectedItem.productId
      ? JSON.parse(loadItemFromSessionStorage('app-produits')).filter(e => e.id === props.selectedItem.productId)
      : "";
    let description5 = props.selectedItem.collectorId
      ? JSON.parse(loadItemFromSessionStorage('app-users')).filter(e => e.id === props.selectedItem.collectorId)
      : "";

    // Détermination du statut
    let statusElt = {
      "SAVED": "Enregistrée",
      "TEMP_SAVED": "Sauvegardée",
      "AFFECTED": "Affectée",
      "TO_APPROUVED": "À approuver",
      "DESAPPROUVED": "Désapprouvée",
      "TREAT": "Traitée"
    }[props.selectedItem.status] || "";

    let datee = props.selectedItem.createdAt ? formatDate(props.selectedItem.createdAt) : "";

    let addByTemp = mode === 1
      ? props.selectedItem.collector.firstAndLastName
      : (props.selectedItem.id && props.selectedItem.collectionChannel
        ? props.selectedItem.collector.firstAndLastName
        : description5[0]?.firstAndLastName || "<i>Non défini</i>");

    let objetTemp = mode === 1
      ? props.selectedItem.objet.libelle
      : (props.selectedItem.id && props.selectedItem.collectionChannel
        ? props.selectedItem.objet.libelle
        : description2[0]?.libelle || "<i>Non défini</i>");

    let produitTemp = mode === 1
      ? props.selectedItem.product.libelle
      : (props.selectedItem.id && props.selectedItem.collectionChannel
        ? props.selectedItem.product.libelle
        : description3[0]?.libelle || "<i>Non défini</i>");

    // Création des sections du document
    const sections = {
      enregistrerle: `
        <div class="row" style="margin-bottom: 20px;">
          <div class="col l3"><b style="font-size: 20px;">Enregistré le:</b></div>
          <div class="col l9" style="font-size: 20px;">${datee}</div>
        </div>
      `,
      enregistrerpar: `
        <div class="row" style="margin-bottom: 20px;">
          <div class="col l3"><b style="font-size: 20px;">Enregistré par:</b></div>
          <div class="col l9" style="font-size: 20px;">${addByTemp}</div>
        </div>
      `,
      codeClient: `
        <div class="row" style="margin-bottom: 20px;">
          <div class="col l12">
            <span style="font-size: 18px;"><b>Code:</b> ${props.selectedItem.codeClient}</span>
          </div>
        </div>
      `,
      datereception: `
        <div class="row" style="margin-bottom: 20px;">
          <div class="col l4"><b style="font-size: 20px;">Date de réception de la dénonciation:</b></div>
          <div class="col l8" style="font-size: 20px;">${props.selectedItem.receiptDateTime}</div>
        </div>
      `,
      objet: `
        <div class="row" style="margin-bottom: 20px;">
          <div class="col l3"><b style="font-size: 20px;">Objet de plainte:</b></div>
          <div class="col l9" style="font-size: 20px;">${objetTemp}</div>
        </div>
      `,
      product: `
        <div class="row" style="margin-bottom: 20px;">
          <div class="col l3"><b style="font-size: 20px;">Produit concerné:</b></div>
          <div class="col l9" style="font-size: 20px;">${produitTemp}</div>
        </div>
      `,
      statut: `
        <div class="row" style="margin-bottom: 20px;">
          <div class="col l3"><b style="font-size: 20px;">Statut:</b></div>
          <div class="col l9" style="font-size: 20px;">${statusElt}</div>
        </div>
      `
    };

    // Assemblage du contenu
    const toStri = `
      ${entete}
      ${sections.codeClient}
      ${sections.objet}
      ${sections.product}
      ${sections.datereception}
      ${sections.enregistrerpar}
      ${sections.enregistrerle}
      ${sections.statut}
    `;

    handlePrintAvance(toStri);
  }



  let content = [];
  content = props.items;
  //darrell : add custome attribut for search 
  content.forEach(element => {
    //status
    let statusElt;
    switch (element.status) {

      case "SAVED":
        statusElt = "Enregistrée"
        break;
      case "TEMP_SAVED":
        statusElt = "Sauvegardée"
        break;
      case "AFFECTED":
        statusElt = "Affectée"
        break;
      case "TO_APPROUVED":
        statusElt = "A approuver"
        break;
      case "DESAPPROUVED":
        statusElt = "Désapprouvée"
        break;
      case "TREAT":
        statusElt = "Traitée"
        break;

      default:
        statusElt = ""
        break;
    }

    element.statusStr = statusElt;

    let graviteElt;
    let cmp;
    if (mode === 1) {
      cmp = element.objet.risqueLevel
    } else {
      if (element.id !== "") {
        cmp = element.objet.risqueLevel
      } else {
        let idO = objets.filter((e) => {
          return (
            e.id === element.objetId
          );
        })
        cmp = (idO[0]).risqueLevel
      }

    }
    switch (cmp) {
      case "MINEUR":
        graviteElt = (
          <span className="green-text text-bold">Mineur</span>
        );
        break;
      case "MOYEN":
        graviteElt = (
          <span className="orange-text text-bold">Moyen</span>

        );
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
    let entete = "<h1>PV de Session</h1>"
    let codeRec = "Réclamation : " + props.code;
    let participantsTab
    let guestsTab
    let votesTab
    let messagesTab
    let participants
    let votes
    let messages

    //tableaux
    participantsTab = (props?.session?.members).length !== 0 ? (props?.session?.members).map((e) => { return e.firstAndLastName }) : []
    guestsTab = (props?.session?.guests).length !== 0 ? (props?.session?.guests).map((e) => { return e.firstAndLastName }) : []
    votesTab = (props?.session?.messages).length !== 0 ? (props?.session?.messages).filter((e) => { if (e.vote === true) { return e } }) : []
    messagesTab = (props?.session?.messages).length !== 0 ? (props?.session?.messages).filter((e) => { if (e.vote === false) { return e } }) : []

    // console.log("votesTab",votesTab)
    //participants et invités
    participants = "<div style='margin-top:75px!important'><h2>Participants</h2></div>";
    participants += "<ul>";
    participantsTab.map((e) => { participants += "<li>" + e + "</li>" })
    guestsTab.map((e) => { participants += "<li>" + e + "  (invité)  </li>" })
    participants += "</ul>";

    //votes

    votes = "<div style='margin-bottom:50px!important;'><h2>Votes</h2></div>"

    votesTab.map((e) => {
      votes += "<table width='960' border='1'>"
      votes += "<tr style='padding:80px!important;'><td style='margin:80px!important;'>Contenu</td><td>" + e.voteDto?.contenu + "</td></tr> "
      votes += "<tr style='padding:80px!important;'><td style='padding:80px!important;'>Commentaire</td><td>" + e.voteDto?.commentaire + "</td></tr>"
      votes += "<tr style='padding:80px!important;'><td style='padding:80px!important;'>Initié par</td><td>" + e.voteDto?.author?.firstAndLastName + "</td></tr>"

      votes += "<tr style='padding:80px!important;'><td style='padding:80px!important;'>Pour</td><td><ul>"
      let votesPour = (e.voteDto?.userVote).length !== 0 ? (e.voteDto?.userVote).filter((vote) => { if (vote.voteType === "POUR") { return vote } }) : []
      votesPour.map((k) => { votes += "<li>" + k?.author?.firstAndLastName + "</li>" })
      votes += "</ul></td></tr>"

      votes += "<tr style='padding:80px!important;'><td>Contre</td><td><ul>"
      let votesContre = (e.voteDto?.userVote).length !== 0 ? (e.voteDto?.userVote).filter((vote) => { if (vote.voteType === "CONTRE") { return vote } }) : []
      votesContre.map((l) => { votes += "<li>" + l?.author?.firstAndLastName + "</li>" })
      votes += "</ul></td></tr>"

      let decision = (e.voteDto?.choosed) === false ? "Solution non retenu" : "Solution retenu"

      votes += "<tr style='padding:80px!important;'><td style='padding:80px!important;'>Décision</td><td style='padding:80px!important;'>" + decision + "</td></tr>"
      votes += "</table><br/><br /><br/><br /><br/><br />"
    })


    //messages
    messages = "<div style='margin-bottom:50px!important;'><h2>Messages</h2></div>"
    messagesTab.map((e) => { messages += "<div>" + e.content + " | " + e.createdAt + " | " + e.sender?.firstAndLastName + "</div><br/>" })



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
    let filename = "PV_" + props.code + "_" + today().replaceAll("/", "") + ".doc";

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

  const handleFileSubmit = (e, isFile = true) => {    
    e.preventDefault();
    setExtraFileLoading(true)
    
    const formData = new FormData();
    formData.append("claim_id", claim_id);
    
    if (isFile) {
      console.log("filesForm", filesForm);
      for (let index = 0; index < filesForm.length; index++) {
        formData.append("files", filesForm[index]);
      }
    } else if (audioListForm.length) {
      for (let index = 0; index < audioListForm.length; index++) {
        const audioFile = new File([audioListForm[index]], "claim_extra_record_" + today().replaceAll("/", "") + ".ogg", {
          type: "audio/ogg; codecs=opus",
        });
        formData.append("audios", audioFile);
      }
    }




    console.log("formData", formData);
    addExtraClaimApi(formData).then((res) => {
      console.log('res >> ', res)
      if (isFile) {
        getFillesApi(currentData?.id, props);
        setFiles([])
        notify("Piece jointe ajoutée  ", "success")
      } else {
        getClaimAudioApi(currentData?.id, props)
        setOpen2(false)
        setAudioBox(false)
        setAudioListForm([])
        setAudioListUrlForm([])
        notify("Audio ajoutée ", "success")
      }

    }).catch((err) => {
      console.log('err add extra >> ', err)
      notify("Une erreur s'est produite ", "error")
    }).then(() => {
      setExtraFileLoading(false)

    })



  };
  const handleContentSubmit = (e) => {
    e.preventDefault();
    setExtraFileLoading(true)
    const formData = new FormData();
    formData.append("claim_id", claim_id);
    formData.append("contenu", extraContent);

    addExtraClaimApi(formData).then((res) => {
      console.log('res >> ', res)

      notify("Contenue jointe ajoutée  ", "success")
      setShowExtraContent(false)
      setExtraContent('')

    }).catch((err) => {
      console.log('err add extra >> ', err)
      notify("Une erreur s'est produite ", "error")
    }).then(() => {
      setExtraFileLoading(false)

    })



  };

  return (
    // "Liste Dénonciations"
    <div id="main">   
      <HistoriqueAffectation claimId={claim_id} />

      {showExtraContent && (
        <div>

          <Dialog open={showExtraContent} fullWidth={true}
            maxWidth='md' onClose={(e) => { setShowExtraContent(false) }}>
            <DialogTitle>Ajouter un contenu</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                multiline
                minRows={4}
                value={extraContent}
                onChange={(e) =>{e.stopPropagation();e.preventDefault(); setExtraContent(e.target.value)}}
                placeholder="Saisissez le contenu..."
              />
            </DialogContent>
            {(extraContent && extraContent?.trim() !== "") ? <DialogActions>
              <LoadingButton onClick={(e) => {
                setExtraContent("")
                setShowExtraContent(false)
              }}

                className="waves-effect waves-effect-b waves-light btn-small"

                loadingPosition="end"
                loading={extraFileLoading}
                endIcon={<CloseIcon />}
                variant="contained"
                sx={{ backgroundColor: "#000", textTransform: "initial" }} color="secondary" >Annuler</LoadingButton>
              <LoadingButton onClick={(e) => {
                handleContentSubmit(e)
              }}

                className="waves-effect waves-effect-b waves-light btn-small mr-2"
                loading={extraFileLoading}
                loadingPosition="end"
                endIcon={<SaveIcon />}
                variant="contained"
                sx={{ backgroundColor: "#1e2188", textTransform: "initial" }} color="primary">Enregistrer</LoadingButton>

            </DialogActions> : <></>}
          </Dialog>

        </div>
      )}
      {filesForm.length ? (
        <div>
          <Dialog open={filesForm.length ? true : false} fullWidth={true}
            maxWidth='sm' onClose={(e) => { setFiles([]) }}>
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
                      <ListItemButton key={i} divider >
                        <ListItemText primary={file.name} secondary={(Math.round((file.size / 1024) * 100) / 100) + ' ' + ("Ko")} />
                      </ListItemButton>
                    )
                  })}
                </List>
                <div style={{ display: 'flex', alignItems: 'center', }} htmlFor="ile" onClick={(e) => setFiles([])} >
                  <LoadingButton
                    onClick={(e) => {
                      handleFileSubmit(e)
                    }}

                    className="waves-effect waves-effect-b waves-light btn-small mr-2"
                    loading={extraFileLoading}
                    loadingPosition="end"
                    endIcon={<SaveIcon />}
                    variant="contained"
                    sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
                  >
                    <span>Enregistrer</span>
                  </LoadingButton>

                  <LoadingButton
                    onClick={(e) => {
                      setFiles([])
                    }}

                    className="waves-effect waves-effect-b waves-light btn-small"
                    loading={extraFileLoading}
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
      ) : <></>}
      {showAudioBox && (
        <div>
          <Dialog
            open={open2}
            onClose={() => { setOpen2(false) }}
            style={{ padding: "16px" }}
          >
            <DialogTitle
              align="center"
              color={"#1E2188"}
              fontSize={"23px"}
              fontWeight={"bold"}
            >
              {("Enregistreur vocal Réclamations")}
            </DialogTitle>
            <DialogContent>

              <DialogContentText
                align="center"
                fontSize={"14px"}
                textAlign={"center"}
              >
                {("Cliquez sur le bouton ci-dessous et parler dans le micro de votre téléphone, ou branchez un casque ou des écouteurs")}
              </DialogContentText>

              <section className="voice-recorder">
                <div className="recorder-container">
                  {audioListUrlForm.map((url, i) => {

                    return <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, pt: 2 }}>
                      <audio src={url} controls sx={{ flex: '1', mr: 2, width: "100%" }} />
                      <CloseIcon color="red" onClick={() => {
                        setAudioListForm(() => { return audioListForm.filter((va, ind) => ind !== i) })
                        setAudioListUrlForm(() => { return audioListUrlForm.filter((va, inde) => inde !== i) })
                      }} />

                    </Box>
                  })}
                  <RecorderControls
                    recorderState={recorderState}
                    handlers={handlers}
                    closeAction={() => { }}
                  />
                </div>
              </section>
            </DialogContent>
            {audioListUrlForm.length ? <DialogActions>
              <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                <LoadingButton
                  onClick={(e) => {
                    handleFileSubmit(e, false)
                  }}

                  className="waves-effect waves-effect-b waves-light btn-small mr-2"
                  loading={extraFileLoading}
                  loadingPosition="end"
                  endIcon={<SaveIcon />}
                  variant="contained"
                  sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
                >
                  <span>Enregistrer</span>
                </LoadingButton>

                <LoadingButton
                  onClick={(e) => {
                    setAudioListForm([])
                    setAudioListUrlForm([])
                    setAudioBox(false)
                    setOpen2(false)
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
            </DialogActions> : <></>}
          </Dialog>
        </div>
      )}
      <audio ref={audioRef} src={currentAudio} hidden />

      {/* {props.showSelectPrintItem && ( */}
      {handleImpression && (
        <>
          <div >
            <Dialog open={impression} onClose={handleImpression}>
              <DialogContent >
                <DialogContentText>
                  <div className="col l12 s12 pb-2" id="content">
                    <div className="df sb pb-2">
                      <b>Ajouter d'autres champs à imprimer</b>
                      <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => {
                        e.stopPropagation();
                        handleImpression()
                      }} />
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

                <div className="row mt-5" >

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
                        <table
                          className="pt-5 pb-5"
                        >
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
                            handlePrint22(config, selectOption, props.items, formatDate2(startDate), formatDate2(endDate));
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
                        onClick={(e) => {
                          if (startDate && endDate) {
                            table2XLS2XF(
                              "Liste_des_dénonciations" +
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
                              "Liste_des_dénonciations" +
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
                    <div className="row">
                      <div className="row">
                        <div className="col l6 m6 s12">
                          <h5 className="card-title">Liste des dénonciations&nbsp;</h5>
                        </div>
                        <div className="col l6 m6 s12" style={{ textAlign: "end" }}>
                          {hbt.includes("H7") ? (
                            <img
                              src={pdf}
                              alt=""
                              style={{ marginRight: "15px", cursor: "pointer" }}
                              onClick={(e) => {
                                // Vérifie si hbt inclut "H8" avant d'exécuter handleImpression
                                if (hbt.includes("H8")) {
                                  handleImpression();
                                  setChangeButtonPrint(true);
                                } else {
                                  handlePrint2(config, selectOption, props.items);
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
                                  table2XLS2X(
                                    "Liste_des_denonciations" +
                                    today().replaceAll("/", ""),
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
                        <ReactDatatable
                          className={"responsive-table table-xlsx"}
                          config={config}
                          records={content}
                          columns={columns}
                          onRowClicked={rowClickedHandler}
                        />
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
                    <AppBar sx={{ position: 'relative', backgroundColor: "#1e2188" }}>
                      <Toolbar>
                        <IconButton
                          edge="start"
                          color="inherit"
                          onClick={handleClose}
                          aria-label="close"
                        >
                          <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                          Détails de la dénonciation
                        </Typography>

                      </Toolbar>
                    </AppBar>

                    <div className="row">
                      {/* first part */}
                      <div className="col l6 s12 pb-5" id="ficheReclamation">
                        <div className="card-panel pb-5">
                          <div className="row pb-5" id="ententeFiche">
                            <div className="col l6 s12" style={{ display: "flex", alignItems: "center" }}>
                              <h5 className="card-title">
                                Fiche de la dénonciation
                              </h5>

                              {warningConvert}                              
                            </div>
                            <div className="col l6 s12" style={{}}>
                              {statusElt}
                            </div>
                          </div>
                          <div className="row">

                            <div className="col s12 m12">
                              <div className="row">
                                <div className="col s12 pb-2">
                                  <h6 className="card-title">
                                    Détails de la dénonciation
                                  </h6>
                                </div>

                                <div className="row">
                                  <div className="col l6 s12 df pb-2" id="code">
                                    <PinIcon sx={{ mr: 2 }} /> {props.code}
                                  </div>

                                  <div className="col l6 s12 df pb-2" id="recorded_at">
                                    <CalendarMonthIcon sx={{ mr: 2 }} /> Date de réception : {props.recorded_at}
                                  </div>

                                  <div className="col l6 s12 df pb-2" id="collect">
                                    <RecyclingIcon sx={{ mr: 2 }} /> {props.collect}
                                  </div>

                                  <div className="col l6 s12 df pb-2" id="underSubject">
                                    <DataObjectIcon sx={{ mr: 2 }} />{" "} {props.underSubject}
                                  </div>

                                  <div className="col l12 s12 df pb-2" id="subject">
                                    <DataObjectIcon sx={{ mr: 2 }} />{" "}
                                    {props.subject}
                                  </div>

                                  <div className="col l6 s12 df pb-2" id="product">
                                    <CategoryIcon sx={{ mr: 2 }} /> {props.product}
                                  </div>

                                  <div className="col l6 s12 df pb-2" id="unit">
                                    <AddBusinessIcon sx={{ mr: 2 }} /> {props.unit}
                                  </div>

                                  <div className="col l6 s12 df pb-2" id="content">
                                    <SupportAgentIcon sx={{ mr: 2 }} /> {props.created_by}
                                  </div>

                                  <div className="col l6 s12 df pb-2" id="content">
                                    <CalendarTodayIcon sx={{ mr: 2 }} /> {creationDate}
                                  </div>

                                  <div
                                    className="col l12 s12 pb-2"
                                    id="content"
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <div className="df pb-2">

                                        <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                                        {("Contenu")}
                                      </div>
                                      <span onClick={(e) => {
                                        e.preventDefault()
                                        setShowExtraContent(true)
                                        setExtraContent("")
                                      }} className="pb-2 ml-3 " style={{ cursor: 'pointer', color: '#1e2188' }}>+ Ajouter du contenu</span>
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
                                      })}</List>

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
                                  >  Fichiers

                                  </Typography>
                                  <label htmlFor="ile" className="btn btn-primary" >
                                    Ajouter un fichier
                                    <input type="file" id="ile" multiple sx={{ display: 'none' }}
                                      onChange={(e) => { setFiles([...e.target.files]) }}
                                      style={{ display: 'none' }}
                                      accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword, image/jpeg, image/png, audio/*, video/*"
                                    /></label>
                                </Box>
                              </div>
                              <div className="col s12">
                                {attachmentList}
                              </div>
                            </div></div>
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

                                {
                                  (props.session !== "") && (addR === "PILOTE" || addR === "DE") ?

                                    <LoadingButton
                                      onClick={(e) => {
                                        if (mode === 1) {
                                          printToWord()
                                        } else {
                                          notify("Passez en mode Online pour télécharger le PV de la session ", "info")
                                        }

                                      }}
                                      className="waves-effect waves-effect-b waves-light btn-small"
                                      loading={props.etat3}
                                      loadingPosition="end"
                                      endIcon={<SaveIcon />}
                                      variant="contained"
                                      sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
                                    >
                                      <span>Générer le PV de la session</span>
                                    </LoadingButton>
                                    : ""
                                }


                              </h5>
                            </div>
                          </div>



                          <div className="row">
                            <div className="col s12 m12">
                              <div className="row">

                                {details}

                              </div>
                            </div>
                          </div>

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
                                  <label htmlFor="audio" onClick={() => {
                                    setAudioBox(true)
                                    setOpen2(true)
                                  }} className="btn btn-primary" >
                                    Ajouter un audio
                                  </label>
                                </Box>
                              </div>
                              <div className="col s12">
                                {audioList}
                              </div>
                            </div></div>
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
    created_by: state.claim_list.created_by,
    created_at: state.claim_list.created_at,
    assigned_at: state.claim_list.assigned_at,
    assigned_by: state.claim_list.assigned_by,
    handled_at: state.claim_list.handled_at,
    handled_by: state.claim_list.handled_by,
    approved_at: state.claim_list.approved_at,
    approved_by: state.claim_list.approved_by,
    resolved_at: state.claim_list.resolved_at,
    resolved_by: state.claim_list.resolved_by,
    appraised_at: state.claim_list.appraised_at,
    appraised_by: state.claim_list.appraised_by,
    appraisal: state.claim_list.appraisal,
    errors: state.claim_list.claim_appraise_errors,
    items: state.claim_list.items,
    agents: state.claim_list.agents,
    external_remedies: state.claim_list.external_remedies,
    selectedItem: state.claim_list.selectedItem,
    selectedFiles: state.claim_list.selectedFiles,
    selectedItemFiles: state.claim_list.selectedItemFiles,
    session: state.claim_list.session,
    selectedItemAudio: state.claim_list.selectedItemAudio,
    showSelectPrintItem: state.claim_list.showSelectPrintItem,
    extras: state.claim_list.extras,
    convertedBy: state.claim_handle.converted_by,
    convertedAt: state.claim_handle.converted_at,
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
      dispatch(selectedItemAudioChanged(selectedItemAudio))
    },
    showSelectPrintItemChanged: (show) => {
      dispatch(showSelectPrintItemChanged(show));
    },
    sessionChanged: (session) => {
      dispatch(sessionChanged(session));
    },
    showModalHistoriqueChanged: (showModal) => {
      dispatch(showModalChanged(showModal))
    },
    convertedByChanged: (convertedBy) => {
      dispatch(convertedByChanged(convertedBy));
    },
    convertedAtChanged: (convertedAt) => {
      dispatch(convertedAtChanged(convertedAt));
    },
    extrasChanged: (collect) => {
      dispatch(extrasChanged(collect));
    },
};
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListeDenonciations);
