import React, { useEffect, useState } from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import Select from "react-select";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
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
} from "../../redux/actions/Reclamations/ListeReclamationsActions";
import http from "../../apis/http-common";
import PrintIcon from '@mui/icons-material/Print';
import { connect } from "react-redux";

// import { loadItemFromSessionStorage, today } from "../../utils/utils";
// import { v4 as uuidv4 } from "uuid";
// import { formatDate, guessExtension } from "../../utils";
import { handlePrint, handlePrint2, handlePrintAvance } from "../../Utils/tables";

import { table2XLSX, table2XLS2X } from "../../Utils/tabletoexcel";

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
import { formatDate, guessExtension, loadItemFromLocalStorage, loadItemFromSessionStorage, today } from "../../Utils/utils";
import { Avatar, DialogContent, DialogContentText } from "@mui/material";
import GavelIcon from '@mui/icons-material/Gavel';
import StopIcon from '@mui/icons-material/Stop';
import { downloadAudioApi, downloadFillesApi, getDenunAudioApi, getFillesApi, listeTousStatuts, listeTousStatutsOffline } from "../../apis/Denonciations/DenonciationsApi";
import { INSTITUTION_ADDRESS, INSTITUTION_AGREMENT, INSTITUTION_EMAIL, INSTITUTION_LOGO, INSTITUTION_NAME, INSTITUTION_TEL } from "../../Utils/globals";
import MoveUpIcon from '@mui/icons-material/MoveUp';
import SaveIcon from "@mui/icons-material/Save";
import { LoadingButton } from "@mui/lab";
import { notify } from "../../Utils/alert";

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
                      <a
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
                      >{showAudioPlayer === "audio-" + attachment.id && ("")} {showAudioPlayer !== "audio-" + attachment.id && ("Afficher")}</a>

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



  let mode = loadItemFromLocalStorage("app-mode") !== undefined ? (JSON.parse(loadItemFromLocalStorage("app-mode"))) : undefined;
  let objets =
    loadItemFromLocalStorage("app-objets") !== undefined
      ? JSON.parse(loadItemFromLocalStorage("app-objets"))
      : undefined;

  const handleClickOpen = () => {
    setOpen(true);
  };

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
    //console.log("external",data.external_remedies);
    clearComponentState();

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
      props.sessionChanged(data.session !== null ? data.session : "");
      //fetch attachments for selected claim
      getFillesApi(data.id, props);
      getDenunAudioApi(data.id, props);
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
        //fetch attachments for selected claim
        getFillesApi(data.id, props);
        getDenunAudioApi(data.id, props);

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
            <span className="chip affectedBgColor">
              <span className="">Affectée</span>
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
            <span className="chip toApprouvedBgColor">
              <span className="">A approuver</span>
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
            <span className="chip unApprouvedBgColor">
              <span className="">Désapprouvée</span>
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
                let fond = couleurs[getRandomInt(couleurs.length)];

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
                    <div
                      className="app-file-last-access"><a style={{ cursor: "pointer" }} onClick={(e) => {
                        downloadFillesApi(attachment.id, attachment.name)
                      }}>Télécharger</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    })
    attachmentList = (
      <div className="col s12 app-file-content grey lighten-4 mt-5">
        <span className="app-file-label">Fichiers joints</span>
        <div className="row app-file-recent-access mb-3">
          {attachmentListChild}
        </div>
      </div>

    )
  }
  else {

  }

  //   let attachmentList;
  //   if (props.selectedItemFiles.length > 0) {
  //     let attachmentListChild = props.selectedItemFiles.map((attachment) => {
  //       let icon = guessExtension(attachment);
  //       return (
  //         <div className="col xl12 l12 m12 s12" key={attachment.id}>
  //           <div className="card box-shadow-none mb-1 app-file-info">
  //             <div className="card-content">
  //               <div className="row">
  //                 <div className="col xl1 l1 s1 m1">
  //                   <div className="app-file-content-logo">
  //                     <div className="fonticon hide">
  //                       <i className="material-icons ">more_vert</i>
  //                     </div>
  //                     <img
  //                       className="recent-file"
  //                       src={icon}
  //                       height="38"
  //                       width="30"
  //                       alt=""
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="col xl11 l11 s11 m11">
  //                   <div className="app-file-recent-details">
  //                     <div className="app-file-name font-weight-700 truncate">
  //                       {attachment.name}
  //                     </div>
  //                     <div className="app-file-size">
  //                       {Math.round(
  //                         (attachment.size / 1024 + Number.EPSILON) * 100
  //                       ) / 100}{" "}
  //                       Ko
  //                     </div>
  //                     <div className="app-file-last-access">
  //                       <a href={attachment.url}>Télécharger</a>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       );
  //     });
  //     attachmentList = (
  //       <div className="col s12 app-file-content grey lighten-4">
  //         <span className="app-file-label">Fichiers joints</span>
  //         <div className="row app-file-recent-access mb-3">
  //           {attachmentListChild}
  //         </div>
  //       </div>
  //     );
  //   } else {
  //   }

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
            <span style="font-size: 18px;"><b>CodeClient:</b> ${props.selectedItem.codeClient}</span>
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

  return (
    // "Liste Dénonciations"
    <div id="main">
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
                          // console.log("props.items",props.items)
                          handlePrint2(config, selectOption, props.items);
                        }}
                        className="btn indigo lighten-5 indigo-text waves-effect waves-effect-b waves-light"
                      >
                        <span className="text-nowrap">Imprimer</span>
                      </a>
                    ) : (
                      <a
                        onClick={(e) => {
                          table2XLS2X(
                            "Liste_des_dénonciations" + today().replaceAll("/", ""),
                            "brke",
                            selectOption,
                            props.items
                          );
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
                            <div className="col l6 s12">
                              <h5 className="card-title">
                                Fiche de la dénonciation
                              </h5>
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

                                  <div className="col l12 s12 pb-2" id="content">
                                    <div className="df pb-2">
                                      <RecordVoiceOverIcon sx={{ mr: 2 }} /> Contenu
                                    </div>
                                    <div>
                                      {props.content}
                                    </div>
                                  </div>

                                  <div className="col l12 s12 pb-2" id="">
                                    {audioList}

                                  </div>

                                  <div className="col l12 s12 pb-2" id="fichiers">
                                    {attachmentList}
                                  </div>

                                </div>

                              </div>
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
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListeDenonciations);
