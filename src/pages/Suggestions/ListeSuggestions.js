import React, { useEffect, useRef, useState } from "react";
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
// import { downloadAudioApi, getDenunAudioApi } from "../../apis/Denonciations/DenonciationsApi";


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
  let dimf, crew;
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


  const handleClickOpen = () => {
    setOpen(true);
  };
    
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
  
  const warningConvert = (props.convertedBy !== "" && props.convertedAt !== "") && (
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
      key: "clientFirstAndLastName",
      text: "Client",
      className: "client",
      align: "left",
      sortable: true,
      cell: (claim, index) => {
        let nom = claim.clientFirstAndLastName !== "" ? claim.clientFirstAndLastName : <i>Anonyme</i>;
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
    handleClickOpen();
    //console.log("external",data.external_remedies);
    clearComponentState();
    console.log("dataRow", data)

    if (mode === 1) {
      props.lastnameChanged(data.clientFirstAndLastName ? data.clientFirstAndLastName : "");
      props.addressChanged(data.address ? data.address : "");
      props.phoneChanged(data.tel ? data.tel : "");
      props.genderChanged(data.gender ? data.gender : "");
      props.languageChanged(data.langue.libelle ? data.langue.libelle : "");
      props.dossierimfChanged(data.folderCode ? data.folderCode : "");
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

    let datee = props.selectedItem.createdAt ? formatDate(props.selectedItem.createdAt) : "";
    let dater = props.selectedItem.receiptDateTime ? formatDate(props.selectedItem.receiptDateTime) : "";

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
        <div class="col l12"><span style="font-size: 18px;"><b>CodeClient:</b> ${props.selectedItem.codeClient}</span></div>
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

    handlePrintAvance(toStri);
  }

  // const printRecu = (e)=>{
  //   e.preventDefault()

  //   let image = '<img src="'+INSTITUTION_LOGO+'" alt="logo" style=" width: "200px",height: "90px" " className=" report-logo"/>';
  //   let entete = '<div className="row" id="enteteRapport" style="margin-bottom:50px!important">';
  //   entete += '<div className="col l2 s3 m3" style="margin-bottom:20px!important">'+image+'</div>';
  //   entete += '<div className="col l8 s7 m7"><b>'+INSTITUTION_NAME+'</b><br /><i><span>Numéro Agrément: </span>'+INSTITUTION_AGREMENT+'</i><br /><i><span>Addrese: </span>'+INSTITUTION_ADDRESS+'</i><br /><i><span>Tel: </span>'+INSTITUTION_TEL+'</i><br /><i><span>Email: </span>'+INSTITUTION_EMAIL+'</i></div></div>';


  //   let description3 = (props.selectedItem.productId) ? (JSON.parse(loadItemFromSessionStorage('app-produits'))).filter((e) => {return e.id === props.selectedItem.productId}) : ""
  //   let description5 = props.selectedItem.collectorId ? (JSON.parse(loadItemFromSessionStorage('app-users'))).filter((e) => {return e.id === props.selectedItem.collectorId}) : ""
  //   // console.log("description3",description3==="")
  //   //  console.log('props', props)
  //   let statusElt;
  //   let decision;
  //   let traiteur;
  //   let dtraitement;
  //   let solution;
  //   switch (props.selectedItem.status) {

  //     case "SAVED":
  //       statusElt = "Enregistrée"
  //       break;
  //     case "TEMP_SAVED":
  //       statusElt = "Sauvegardée"
  //       break;
  //     case "TREAT":
  //       statusElt = "Traitée"
  //       break;
  //     default:
  //       statusElt = ""
  //       break;
  //   }
  //   let datee = props.selectedItem.createdAt !== null ? formatDate(props.selectedItem.createdAt):""

  //   let telTemp = mode ===1 ? (props.selectedItem.tel !== "" ? props.selectedItem.tel : "<i>Non défini</i>") : (props.selectedItem.id && props.selectedItem.canal) ? (props.selectedItem.tel !== "" ? props.selectedItem.tel : "<i>Non défini</i>") : props.selectedItem.phone;
  //   let addByTemp = mode ===1 ? props.selectedItem.collecteur.firstAndLastName : (props.selectedItem.id && props.selectedItem.canal) ? props.selectedItem.collecteur.firstAndLastName : description5[0].firstAndLastName;
  //   let produitTemp = mode ===1 ? (props.selectedItem.produit !== null ? props.selectedItem.produit.libelle : "<i>Non défini</i>") : (props.selectedItem.id && props.selectedItem.canal) ? (props.selectedItem.produit !== null ? props.selectedItem.produit.libelle : "<i>Non défini</i>") : (description3!=="") ? description3[0].libelle : "<i>Non défini</i>";


  //   let nomtemp = props.selectedItem.clientFirstAndLastName !== "" ? props.selectedItem.clientFirstAndLastName : "<i>Anonyme</i>"
  //   let addtemp = props.selectedItem.address !== "" ? props.selectedItem.address : "<i>Non défini</i>"

  //   if (props.status === "TREAT") {

  //     decision = props.selectedItem.accepted === true ? "Pris en compte" : "Non pris en compte";
  //     let dTemp = formatDate(props.selectedItem.treatAt)

  //     solution ='<div class="row"><div class="col l3"><b style="font-size:20px"> Décision  :</b></div><div class="col l9" style="font-size:20px">'+decision+'</div></div><br/><br/><br/>'
  //     traiteur = '<div class="row"><div class="col l3"><b style="font-size:20px"> Traiteur  :</b></div><div class="col l9" style="font-size:20px">'+props.selectedItem.traiteur.firstAndLastName+'</div></div><br/><br/><br/>'
  //     dtraitement = '<div class="row"><div class="col l3"><b style="font-size:20px"> Date de traitement  :</b></div><div class="col l9" style="font-size:20px">'+dTemp+'</div></div><br/><br/><br/>'

  //   } else{
  //     solution="";
  //     traiteur="";
  //     dtraitement="";
  //   }


  //   const name ='<div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px"> Nom du reclamant :</b></div><div class="col l9" style="font-size:18px">'+nomtemp+'</div></div><br/><br/><br/>'
  //   const telephone ='<div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px"> Téléphone :</b></div><div class="col l9" style="font-size:18px">'+telTemp+'</div></div><br/><br/><br/>'
  //   const address ='<div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px"> Adresse :</b></div><div class="col l9" style="font-size:18px">'+addtemp+'</div></div><br/><br/><br/>'
  //   const enregistrerle ='<div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px"> Enregistrer le  :</b></div><div class="col l9" style="font-size:18px">'+datee+'</div><br/><br/><br/>'
  //   const enregistrerpar ='<div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px"> Enregistrer par  :</b></div><div class="col l9" style="font-size:18px">'+addByTemp+'</div></div><br/><br/><br/>'
  //   const code ='<div class="row" style="margin-bottom:15px;"><div class="col l12"><span style="font-size:18px"><b>Code:</b> '+props.selectedItem.code+' </span></div></div><br/><br/><br/>'
  //   const datereception ='<div class="row" style="margin-bottom:15px;"><div class="col l4"><b style="font-size:18px"> Date de reception de la suggestion :</b></div><div class="col l8" style="font-size:18px">'+props.selectedItem.receiptDateTime+'</div></div><br/><br/><br/>'
  //   const product ='<div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px"> Produit concerné  :</b></div><div class="col l9" style="font-size:18px">'+produitTemp+'</div></div><br/><br/><br/>'
  //   const statut ='<div class="row" style="margin-bottom:15px;"><div class="col l3"><b style="font-size:18px"> Statut  :</b></div><div class="col l9" style="font-size:18px">'+statusElt+'</div></div><br/><br/><br/>'


  //   const toStri = entete+code+name+telephone+address+product+datereception+enregistrerpar+enregistrerle+statut
  //   // const toStri = code+name+telephone+address+product+datereception+enregistrerpar+enregistrerle+statut+solution+traiteur+dtraitement
  //   //  const name ='<label  className="active"> Nom & Prénoms:</label>'+props.selectedItem.recorded_by.firstname+" "+props.selectedItem.recorded_by.lastname
  //   handlePrintAvance(toStri)


  // }


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
                              formatDate2(startDate),
                              formatDate2(endDate)
                            );

                          } else {
                            // Sinon, utiliser handlePrint2 sans filtre
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
                    <div className="row">
                      <div className="row">
                        <div className="col l6 m6 s12">
                          <h5 className="card-title">
                            Liste des suggestions&nbsp;
                          </h5>
                        </div>
                        <div
                          className="col l6 m6 s12"
                          style={{ textAlign: "end" }}
                        >
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
                                    "Liste_des_suggestions" +
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
                          <div className="row pb-5" id="ententeFiche">
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
                                    <PinIcon sx={{ mr: 2 }} /> {props.code}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="recorded_at"
                                  >
                                    <CalendarMonthIcon sx={{ mr: 2 }} /> Date de
                                    réception : {props.recorded_at}
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
                                  >  Fichiers

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
