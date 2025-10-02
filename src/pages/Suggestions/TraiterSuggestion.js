import React, { useEffect, useState } from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import Select from "react-select";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {
  addressChanged,
  codeChanged,
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
  suggestionHandleErrors,
  etatChanged,
  etat2Changed,
  commentChanged,
  selectedItemAudioChanged,
  convertedAtChanged,
  convertedByChanged,
} from "../../redux/actions/Suggestions/TraitementSuggestionActions";
import { connect } from "react-redux";
import {
  handlePrint,
  handlePrint2,
  handlePrintAvance,
} from "../../Utils/tables";

import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import Tooltip from "@mui/material/Tooltip";
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
import { formatDate, formatDate3, guessExtension, loadItemFromSessionStorage, today } from "../../Utils/utils";
import SaveIcon from '@mui/icons-material/Save';
import { downloadFillesApi, getFillesApi, getSuggeAudioApi, listeByStatut, listeTousStatuts, treatSuggestionApi } from "../../apis/Suggestions/SuggestionsApi";
import { LoadingButton } from "@mui/lab";
import { suggestionListErrors } from "../../redux/actions/Suggestions/TraitementSuggestionActions";
import { licenseInfo } from "../../apis/LoginApi";
import { downloadAudioApi } from "../../apis/Denonciations/DenonciationsApi";
import { WarningAmber } from '@mui/icons-material';
import WarningIcon from '@mui/icons-material/Warning';


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

const TraiterSuggestion = (props) => {
  let dimf, crew;
  const [open, setOpen] = React.useState(false);
  const [interne, setInterne] = React.useState(false);
  const [impression, setImpression] = React.useState(false);
  let user = loadItemFromSessionStorage("app-user") !== undefined ? JSON.parse(loadItemFromSessionStorage("app-user")) : undefined;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setInterne(false);
    clearComponentState();
  };



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
                      <a href=" "
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.preventDefault()
                          downloadAudioApi(attachment.id, attachment.name).then(
                            (data) => {
                              // console.log(data);
                              // console.log('data', data)

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
  useEffect(() => {
    props.itemsChanged([])
    listeByStatut(props, "SAVED").then((r) => { });

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
      setActif(resultat.actif)

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
                <span className="">A traiter</span>
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
    filename: "Suggestions à traiter",
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
  let errors = {};
  const clearComponentState = () => {
    props.lastnameChanged("");
    props.idChanged("");
    props.firstnameChanged("");
    props.addressChanged("");
    props.phoneChanged("");
    props.genderChanged("");
    props.languageChanged("");
    props.dossierimfChanged("");
    props.codeChanged("");
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
    props.suggestionHandleErrors("");
    props.selectedItemChanged({});
    props.selectedFilesReset([]);
    props.selectedItemFilesChanged([]);
    props.selectedItemAudioChanged([]);

    props.commentChanged("");

  };

  const rowClickedHandler = (event, data, rowIndex) => {
    console.log("dataRow",data)
    handleClickOpen();

    clearComponentState();
    props.idChanged(data.id ? data.id : "");
    props.lastnameChanged(data.clientFirstAndLastName ? data.clientFirstAndLastName : "");
    props.addressChanged(data.address ? data.address : "");
    props.phoneChanged(data.tel ? data.tel : "");
    props.genderChanged(data.gender ? data.gender : "");
    props.languageChanged(data.langue.libelle ? data.langue.libelle : "");
    props.dossierimfChanged(data.folderCode ? data.folderCode : "");
    props.codeChanged(data.code ? data.code : "");
    props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
    props.collectChanged(data.canal.libelle ? data.canal.libelle : "");
    props.productChanged(data.produit ? data.produit.libelle : "");
    props.unitChanged(data.serviceIndexe ? data.serviceIndexe.libelle : "");
    props.contentChanged(data.content ? data.content : "");
    props.statusChanged(data.status ? data.status : "");
    props.createdByChanged(data.collecteur.firstAndLastName ? data.collecteur.firstAndLastName : "");
    props.createdAtChanged(data.createdAt ? data.createdAt : "");
    props.handledByChanged(data.treatmentAffectedTo ? data.treatmentAffectedTo.firstAndLastName : "");
    props.selectedItemChanged(data);
    getFillesApi(data.id, props);
    getSuggeAudioApi(data.id, props);
    props.convertedByChanged(data.convertedBy ? data.convertedBy.firstAndLastName : "");
    props.convertedAtChanged(data.convertedAt ? data.convertedAt : "");

  };

  const handleCancel = (e) => {
    e.preventDefault();
    clearComponentState();
  };

  const handleValidation = () => {
    let isValid = true;
    if (
      props.comment === "" ||
      props.comment === undefined ||
      props.comment === null
    ) {
      isValid = false;
      errors["comment"] = "Champ incorrect";
    }

    return isValid;
  };
  const handleTreatment = (e, pec) => {
    e.preventDefault();
    if (handleValidation()) {
      let claim = {};
      claim["accepted"] = pec;
      claim["id"] = props.id;
      claim["treatorId"] = user.id;
      claim["commentaire"] = props.comment;
      // console.log("desaprobation",claim)
      // console.log("etat",pec === false)
      // console.log("etatff",props)

      if (pec === false) {
        props.etatChanged(true)
      } else {
        props.etat2Changed(true)
      }


      treatSuggestionApi(claim, props).then(() => {
        handleCancel(e);
        handleClose();
      });
    } else {
    }
    props.suggestionHandleErrors(errors);
  };

  const warningConvert = (props.convertedBy !== "" && props.convertedAt !== "") && (
      <span className="mb-1" style={{ width: "100%", display: "flex", alignItems: "center", fontWeight: '', fontStyle: 'italic', color: '' }}>
        <WarningIcon fontSize="medium" sx={{ mr: 1, color: 'orange' }} />
        {`Converti en suggestion par ${props.convertedBy} le ${formatDate3(props.convertedAt)}`}
      </span>
  );

  let creationDate = props.created_at ? formatDate(props.created_at) : "";

  let details;

  if (props.status === "SAVED") {
    details =
      <>
        <form id="claimApproveForm">
          <div className="row">
            <div className="col s12">
              <details open>
                <summary className="text-details pb-5">
                  Pris en compte de la suggestion
                </summary>

                <div className="col s12 input-field">
                  <textarea
                    id="comment"
                    name="comment"
                    placeholder=""
                    className="materialize-textarea textarea-size"
                    value={props.comment}
                    onChange={(e) => props.commentChanged(e.target.value)}
                  ></textarea>
                  <label htmlFor="content" className={"active"}>
                    Commentaire(s)(<span className="red-text darken-2 ">*</span>)
                  </label>
                  <small className="errorTxt4">
                    <div id="cpassword-error" className="error">
                      {props.errors !== undefined ? props.errors.comment : ""}
                    </div>
                  </small>
                </div>
                <div className="col s12 display-flex justify-content-end mt-3">

                  {
                    // (actif !== undefined && actif)  ?
                      <>
                        <LoadingButton
                          onClick={(e) => {
                            handleTreatment(e, false)
                          }}

                          className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
                          loading={props.etat}
                          loadingPosition="end"
                          endIcon={<SaveIcon />}
                          variant="contained"
                          sx={{ textTransform: "initial" }}
                        >
                          <span>Ne pas prendre en compte</span>
                        </LoadingButton>

                        <LoadingButton
                          onClick={(e) => {
                            handleTreatment(e, true)
                          }}
                          className="waves-effect waves-effect-b waves-light btn-small"
                          loading={props.etat2}
                          loadingPosition="end"
                          endIcon={<SaveIcon />}
                          variant="contained"
                          sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
                        >
                          <span>Prendre en compte</span>
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
      </>
  } else {
    details = ""

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
      <div className="col s12 app-file-content grey lighten-4 mt-5">
        <span className="app-file-label">Fichiers joints</span>
        <div className="row app-file-recent-access mb-3">
          {attachmentListChild}
        </div>
      </div>
    );
  } else {
  }

  let content = [];
  content = props.items;
  //darrell : add custome attribut for search
  content.forEach((element) => {
    //status
    let statusElt;
    switch (element.status) {
      case "SAVED":
        statusElt = "A traiter";
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

  return (
    // "Liste Suggestions"
    <div id="main">
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
                            Suggestions à traiter&nbsp;
                          </h5>
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

                          </div>
                          <div className="row">
                            <div className="col s12 m12">
                              <div className="row" id="informationReclamant">
                                <div className="col s12 pb-2">
                                  <h6 className="card-title">
                                    Informations du Suggéreur
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
                                    {props.language !== "" ? props.language : <i>Non défini</i>}
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
                                    <div className="df pb-2">
                                      <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                                      Contenu
                                    </div>
                                    <div>{props.content}</div>

                                    <div className="col l12 s12 pb-2" id="">
                                      {audioList}
                                    </div>
                                    <div>{attachmentList}</div>
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
    isLoading: state.suggestion_handle.isLoading,
    id: state.suggestion_handle.id,
    firstname: state.suggestion_handle.firstname,
    lastname: state.suggestion_handle.lastname,
    address: state.suggestion_handle.address,
    phone: state.suggestion_handle.phone,
    gender: state.suggestion_handle.gender,
    language: state.suggestion_handle.language,
    dossierimf: state.suggestion_handle.dossierimf,
    code: state.suggestion_handle.code,
    recorded_at: state.suggestion_handle.recorded_at,
    collect: state.suggestion_handle.collect,
    product: state.suggestion_handle.product,
    unit: state.suggestion_handle.unit,
    content: state.suggestion_handle.content,
    status: state.suggestion_handle.status,
    solution: state.suggestion_handle.solution,
    comment: state.suggestion_handle.comment,
    crew: state.suggestion_handle.crew,
    created_by: state.suggestion_handle.created_by,
    created_at: state.suggestion_handle.created_at,
    handled_at: state.suggestion_handle.handled_at,
    handled_by: state.suggestion_handle.handled_by,
    approved_at: state.suggestion_handle.approved_at,
    approved_by: state.suggestion_handle.approved_by,
    resolved_at: state.suggestion_handle.resolved_at,
    resolved_by: state.suggestion_handle.resolved_by,
    errors: state.suggestion_handle.suggestions_handle_errors,
    items: state.suggestion_handle.items,
    selectedItem: state.suggestion_handle.selectedItem,
    selectedFiles: state.suggestion_handle.selectedFiles,
    selectedItemFiles: state.suggestion_handle.selectedItemFiles,
    selectedItemAudio: state.suggestion_handle.selectedItemAudio,
    showSelectPrintItem: state.suggestion_handle.showSelectPrintItem,
    etat: state.suggestion_handle.etat,
    etat2: state.suggestion_handle.etat2,
    convertedBy: state.suggestion_handle.converted_by,
    convertedAt: state.suggestion_handle.converted_at,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loading: (err) => {
      dispatch(loading(err));
    },
    suggestionHandleErrors: (err) => {
      dispatch(suggestionHandleErrors(err));
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
    showSelectPrintItemChanged: (show) => {
      dispatch(showSelectPrintItemChanged(show));
    },
    selectedItemAudioChanged: (selectedItemAudio) => {
      dispatch(selectedItemAudioChanged(selectedItemAudio))
    },
    commentChanged: (comment) => {
      dispatch(commentChanged(comment));
    },
    crewChanged: (crew) => {
      dispatch(crewChanged(crew));
    },
    etatChanged: (etat) => {
      dispatch(etatChanged(etat));
    },
    etat2Changed: (etat2) => {
      dispatch(etat2Changed(etat2));
    },
    convertedByChanged: (convertedBy) => {
      dispatch(convertedByChanged(convertedBy));
    },
    convertedAtChanged: (convertedAt) => {
      dispatch(convertedAtChanged(convertedAt));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TraiterSuggestion);
