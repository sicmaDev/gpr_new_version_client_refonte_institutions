import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
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
  newSolutionChanged,
  newCommentChanged,
  claimAssuranceErrors,
  authorizeChanged,
  createdByChanged,
  etat2Changed,
  underSubjectChanged,
} from "../../redux/actions/Reclamations/AssuranceReclamationActions";
import ReactDatatable from "@ashvin27/react-datatable";
import Select from "react-select";
import {
  formatDate,
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
import { Avatar } from "@mui/material";
import ee from "event-emitter";
import { modalify } from "../../Utils/modal";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
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

const ListeReclamationsClassees = (props) => {
  let user =
    loadItemFromSessionStorage("app-user") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-user"))
      : undefined;
  let hbt = user.posteDto.habilitations.split(",");

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  let dimf, crew;

  useEffect(() => {
    listeByStatut(props,"CLASSED").then((r) => {});
    
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

  useEffect(() => {}, [showAudioPlayer, currentAudio])

  let content = [];
  content = props.items;

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
    switch (element.objet.risqueLevel) {
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
      key: "statusStr",
      text: "Status",
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
    handleClickOpen();

    switch (data.objet.risqueLevel) {
      case "MINEUR":
        if (hbt.includes("H2")) {
          props.authorizeChanged(true)
        }else{
          props.authorizeChanged(false)
        }
        break;
      case "MOYEN":
        if (hbt.includes("H3")) {
          props.authorizeChanged(true)
        }else{
          props.authorizeChanged(false)
        }
        break;
      case "GRAVE":
        if (hbt.includes("H4")) {
          props.authorizeChanged(true)
        }else{
          props.authorizeChanged(false)
        }
        break;

      default:
        break;
    }
    props.idChanged(data.id ? data.id : "");
    props.lastnameChanged(data.clientFirstAndLastName ? data.clientFirstAndLastName : "");
    props.addressChanged(data.address ? data.address : "");
    props.phoneChanged(data.tel ? data.tel : "");
    props.genderChanged(data.gender ? data.gender : "");
    props.languageChanged(data.language.libelle ? data.language.libelle : "");
    props.dossierimfChanged(data.folderCode ? data.folderCode : "");
    props.codeChanged(data.code ? data.code : "");
    props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
    props.collectChanged(data.collectionChannel.libelle ? data.collectionChannel.libelle : "");
    props.subjectChanged(data.objet.libelle ? data.objet.libelle : "");
    props.underSubjectChanged(data.objet.categorie.libelle ? data.objet.categorie.libelle : "");
    props.productChanged(data.product.libelle ? data.product.libelle : "");
    props.unitChanged(data.servicePoint.libelle ? data.servicePoint.libelle : "");
    props.contentChanged(data.content ? data.content : "");
    props.solutionChanged(data.solutionDtos ? data.solutionDtos : "");
    // props.newSolutionChanged(data.assuranceSolution ? data.assuranceSolution : "");
    // props.newCommentChanged(data.assuranceComment ? data.assuranceComment : "");
    props.createdByChanged(data.collector.firstAndLastName ? data.collector.firstAndLastName : "");
    // props.motifChanged(data.motif)
    props.statusChanged(data.status ? data.status : "");
    props.selectedItemChanged(data);

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
    props.codeChanged("");
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
                      <a
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          downloadFillesApi(attachment.id, attachment.name);
                        }}
                      >
                        Télécharger
                      </a>
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
      <div className="col s12 app-file-content grey lighten-4 mt-4">
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
                    <div className="app-file-last-access" id={"audio-"+attachment.id}>
                      <a
                         style={{ cursor: "pointer" }}
                         onClick={(e) => {
                          downloadAudioApi(attachment.id, attachment.name).then(
                            (data) => {
                              // console.log(data);
                              
                              let blobAudio = new Blob([data], { type: "audio/ogg; codecs=opus" });
                              let aud = new Audio(window.URL.createObjectURL(blobAudio));
                              setCurrentAudio(window.URL.createObjectURL(blobAudio))
                              setAudioPlayer("audio-"+attachment.id)
                            }
                          )
                         }}
                      >{showAudioPlayer === "audio-"+attachment.id && ("")} {showAudioPlayer !=="audio-"+attachment.id && ("Afficher")}</a>
                       
                      {showAudioPlayer === "audio-"+attachment.id  && (<audio controls autoPlay onEnded={(e) => {setAudioPlayer("")}}>
                        <source src= {currentAudio} type="audio/ogg"  />
                        Votre navigateur ne prend pas en charge l'élément audio.
                      </audio>) }
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
      props.etat2Changed(true)
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
    
    let couleurs = ["#333300","#00cc00","#99003d","#3333ff","#666666","#253858","#00875A","#36B37","#FFC400","#FF8B00","#FF5630","#5243AA","#0052CC","#00B8D9",];

    if (solutions.length !== 0) {
      details = (
        <>
          <div className="col s12">
            
            {/* let solutions =  */}
            {Array.from(solutions).map((solution) => {
              let fond = couleurs[getRandomInt(couleurs.length)];
            
              let mesure = "";
              if (solution.status === "APPROVED" && solution.satisfactionMeasureDto !== null) {
                let degre = solution.satisfactionMeasureDto.status === "SATISFIED" ? "Satisfait" : solution.satisfactionMeasureDto.status === "UNSATISFIED" ? "Non satisfait" : solution.satisfactionMeasureDto.status === "PARTIAL" ? "Partiellement satisfait":"";
                mesure = 
                <>
                  <Typography component="div" >
                    <div>
                      <span className="chip2" style={{ backgroundColor:fond }}>
                        <span className="hero">
                          Client {degre} : mesurée par {solution.satisfactionMeasureDto.measurer.firstAndLastName} le {formatDate(solution.satisfactionMeasureDto.measureDateTime)}
                        </span>
                      </span>
                    </div>
                  </Typography>
                </>
              }else if(solution.status === "APPROVED" && solution.satisfactionMeasureDto === null){
                mesure =
                <>
                  <span className="chip2" style={{ backgroundColor:fond }}>
                    <span className="hero">
                      En attente de mesure de satisfaction
                    </span>
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
                        <div>{solution.motifDesaprobation !== null ? solution.motifDesaprobation:""}</div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="chip2" style={{ backgroundColor:fond }}>
                        <span className="hero">
                          Désapprouvée par {solution.unApprouver.firstAndLastName} le {formatDate(solution.unApprouvedAt)}
                        </span>
                      </span>
                    </div>
                  </Typography>
                </>
              }else if(solution.status === "UNAPPROVED" && solution.motifDesaprobation === null){
                approbation =
                <>
                  <span className="chip2" style={{ backgroundColor:fond }}>
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
                      sx={{ m: 'auto 0',flex:"0" }}
                      variant="body2"
                      color="text.secondary"
                    >
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineConnector />
                      <TimelineDot style={{ fontSize:"25px" }}>
                        <Avatar sx={{ width: 32, height: 32,backgroundColor:fond }}>{ index=index+1}</Avatar>
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
    
                      <Typography variant="h6" component="span">
                        {solution.author.firstAndLastName} - <span style={{ fontSize:"12px" }}>{formatDate(solution.createdAt)}</span> 
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

                          {
                            solution.satisfactionMeasureDto ? 
                              solution.satisfactionMeasureDto.commentaire !== null ? 

                              <div
                                className="col l12 s12 pb-2"
                                id="content"
                              >
                                <div className="df pb-2">
                                  <FormatQuoteIcon sx={{ mr: 2 }} />{" "}
                                  Commentaire du client
                                </div>
                                <div>{solution.satisfactionMeasureDto.commentaire}</div>
                              </div> : ""

                            : ""
                          }
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
      details = "Aucune donnée";
    }
  } else if (props.solution.length === 0) {
    let affectation = "";
    if (props.status === "AFFECTED") {
      affectation = (
        <>
          <Typography component="div">
            <div>
              Réclamation affectée à {props.handled_by} par {props.assigned_by}{" "}
              le {formatDate(props.assigned_at)}
            </div>
          </Typography>
        </>
      );
      details = <>{affectation}</>;
    } else {
      details = "Cette réclamation est en attente de traitement";
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

  let creationDate = props.created_at ? formatDate(props.created_at) : "";

  return (
    <div id="main">
      <div className="row">
        <div className="col s12">
          <div className="container">
            <section className="tabs-vertical mt-1 section">
              <div className="row">
                <div className="col l12 s12 pb-5">
                  <div className="card-panel pb-5">
                    <div className="row">
                      <div className="col s12">
                        <h6 className="card-title">
                          Réclamations Classées
                        </h6>
                      </div>
                      <div className="col s12">
                        <ReactDatatable
                          className={"responsive-table"}
                          config={config}
                          records={content}
                          columns={columns}
                          onRowClicked={rowClickedHandler}
                        />
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
                                      Informations du Réclamant
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
                                    {
                                      (crew =
                                        props.crew !== "" ? (
                                          <>
                                            <div
                                              className="col l6 s12 df pb-2"
                                              id="dossierimf"
                                            >
                                              {" "}
                                              <Diversity3Icon
                                                sx={{ mr: 2 }}
                                              />{" "}
                                              {props.crew}
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
                                      <PinIcon sx={{ mr: 2 }} /> {props.code}
                                    </div>

                                    <div
                                      className="col l6 s12 df pb-2"
                                      id="recorded_at"
                                    >
                                      <CalendarMonthIcon sx={{ mr: 2 }} /> Date
                                      de réception : {props.recorded_at}
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
                                      <div className="df pb-2">
                                        <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                                        Contenu
                                      </div>
                                      <div>{props.content}</div>
                                      <div>{audioList}</div>
                                      <div>{attachmentList}</div>
                                    </div>

                                    {/* {dimf = props.dossierimf !=="" ? <><div className="col s6 df pb-2" id="dossierimf"> <FolderSharedIcon sx={{ mr: 2}}/> {props.dossierimf}</div></>:""}
                                  {crew = props.crew !=="" ? <><div className="col s6 df pb-2" id="dossierimf"> <Diversity3Icon sx={{ mr: 2}}/> {props.crew}</div></>:""} */}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* second part */}

                        <div className="col l6 s12 pb-5" id="ficheReclamation">
                          <div className="card-panel pb-5">
                            <div className="row" id="ententeFiche">
                              <div className="col s12">
                                <h5
                                  className="card-title df "
                                 
                                >
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
    code: state.claim_assurance.code,
    recorded_at: state.claim_assurance.recorded_at,
    collect: state.claim_assurance.collect,
    subject: state.claim_assurance.subject,
    underSubject: state.claim_assurance.underSubject,
    product: state.claim_assurance.product,
    unit: state.claim_assurance.unit,
    content: state.claim_assurance.content,
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
      dispatch(selectedItemAudioChanged(selectedItemAudio))
    },
    authorizeChanged: (item) => {
      dispatch(authorizeChanged(item));
    },
    etat2Changed: (etat2) => {
      dispatch(etat2Changed(etat2));
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListeReclamationsClassees);
