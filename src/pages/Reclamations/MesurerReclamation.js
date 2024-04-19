import React, { useEffect, useState } from "react";
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
  collectChanged,
  dossierimfChanged,
  authorizeChanged,
  solutionIdChanged,
  createdByChanged,
  createdAtChanged,
  etatChanged,
  selectedItemAudioChanged,
  etat2Changed,
  underSubjectChanged,
  commentaChanged,
} from "../../redux/actions/Reclamations/MesureReclamationActions";
import ReactDatatable from "@ashvin27/react-datatable";
import Select from "react-select";
import { formatDate, guessExtension, loadItemFromSessionStorage } from "../../Utils/utils";
import http from "../../apis/http-common";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PrintIcon from "@mui/icons-material/Print";
import { connect } from "react-redux";
import {
  downloadAudioApi,
  downloadFillesApi,
  getClaimAudioApi,
  getFillesApi,
  listeByStatut,
  mesurerClaimSolutionApi,
  unapproveClaimSolutionApi,
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
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import { licenseInfo } from "../../apis/LoginApi";
import axios from "axios";
import { HOST } from "../../Utils/globals";


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



const MesurerReclamation = (props) => {
    let dimf,crew;

    const [open, setOpen] = React.useState(false);
    const [showAudioPlayer, setAudioPlayer] = useState("");
    const [currentAudio, setCurrentAudio] = useState("");
  
    useEffect(() => {}, [showAudioPlayer, currentAudio])

const handleClickOpen = () => {
  setOpen(true);
};

const handleClose = () => {
  setOpen(false);
};

  let user =
    loadItemFromSessionStorage("app-user") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-user"))
      : undefined;
    let hbt = (user.posteDto.habilitations).split(',');
    let addR = (user.additionalRole);


    let alreadyCall = false;
    useEffect(() => {
      //  console.log("params",props.match.params)
      //  console.log("params 2",props.id)
      if(props.match.params.code !== "all" && alreadyCall === false){
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
          if(cc.status >= 200 && cc.status <= 299) {
            // await listeTreat(props);
            let data = cc.data.content;
            // console.log("tmp", data);
           
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
            props.solutionIdChanged(data.solutionDtos[0] !== undefined ? data.solutionDtos[0].id : "");
            props.createdByChanged(data.collector.firstAndLastName ? data.collector.firstAndLastName : "");
            // props.commentChanged(data.comment ? data.comment : "");
            props.statusChanged(data.status ? data.status : "");
            props.selectedItemChanged(data);
            // console.log("soluion",props.solutionId)
            //fetch attachments for selected claim
            // http.get("/files/list/claim/" + data.code).then((response) => {
            //   props.selectedItemFilesChanged(response.data);
            // });
        
            getFillesApi(data.id, props);
            getClaimAudioApi(data.id, props);

            handleClickOpen();
            // if (props.id) {
             
            // } 
            // setOpen((prev) => {
            //   return false;
            // });
          };
        }
      
        details();
       
      }
    }, []);

  useEffect(() => {
    if (props.match.params.code === "all") {
      props.itemsChanged([])
      listeByStatut(props, "TREAT").then((r) => {});
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
      setActif(resultat.actif)
      
    } catch (error) {
      console.error("Une erreur s'est produite :", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await licenseControl();
    };

    fetchData();
  }, []);


  let statusElt;


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
        // let statusElt;

        switch (claim.status) {
          case "TREAT":
            statusElt = (
              <span className="chip treatBgColor z-depth-1">
                <span className="">Traitée</span>
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
    handleClickOpen();
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
    props.codeChanged(data.code ? data.code : "");
    props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
    props.collectChanged(data.collectionChannel.libelle ? data.collectionChannel.libelle : "");
    props.subjectChanged(data.objet.libelle ? data.objet.libelle : "");
    props.underSubjectChanged(data.objet.categorie.libelle ? data.objet.categorie.libelle : "");
    props.productChanged(data.product.libelle ? data.product.libelle : "");
    props.unitChanged(data.servicePoint.libelle ? data.servicePoint.libelle : "");
    props.contentChanged(data.content ? data.content : "");
    props.solutionChanged(data.solutionDtos ? data.solutionDtos : "");
    props.solutionIdChanged(data.solutionDtos[0] !== undefined ? data.solutionDtos[0].id : "");
    props.createdAtChanged(data.createdAt ? data.createdAt : "");
    props.createdByChanged(data.collector.firstAndLastName ? data.collector.firstAndLastName : "");
    // props.commentChanged(data.comment ? data.comment : "");
    props.statusChanged(data.status ? data.status : "");
    props.selectedItemChanged(data);
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
    setCurrentAudio("")
    setAudioPlayer("")

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
      errors["appraisal"] = "Champ incorrect";
    }

    if (
      (props.appraisal === "PARTIAL" ||
      props.appraisal === "UNSATISFIED") && 
      props.commenta === "" ||
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
      claim["solutionId"] = props.solutionId;
      claim["satisfactionStatus"] = props.appraisal;
      claim["commentaire"] = props.commenta;
      claim["measurerId"] = user.id;
      // console.log("claimmesure", claim);
      props.etatChanged(true)
      mesurerClaimSolutionApi(claim, props).then(() => {
        handleCancel(e);
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
      props.etat2Changed(true)
      unapproveClaimSolutionApi(claim, props).then(() => {
        handleCancel(e);
        handleClose();
      });
    } else {
    }
    props.claimAppraiseErrors(errors);
  };

  let attachmentList;
  if (props.selectedItemFiles.length > 0) {
    let attachmentListChild = props.selectedItemFiles.map((attachment) => {
      let icon = guessExtension(attachment);
      return (
        <div className="col xl12 l12 m12 s12 mt-4" key={attachment.id}>
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
      <div className="col s12 mt-4 app-file-content grey lighten-4">
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

  let mesureForm ="";
  if (hbt.includes("H5") || addR === "PILOTE") {
    mesureForm = 
    <>
      <form
        id="claimAppraiseForm"
        
      >
        <div className="row">
          <div className="col s12">
            <details open>
              <summary className="text-details">
                Mesure de la satisfaction
              </summary>

              <div className="col s12 input-field">
                <Select
                  options={appraisalOptions}
                  className="react-select-container mt-4"
                  classNamePrefix="react-select"
                  style={styles}
                  placeholder="Sélectionner la satisfaction du client"
                  onChange={(e) =>
                    props.appraisalChanged(e.value)
                  }
                />
                <label
                  htmlFor="gender"
                  className={"active"}
                >
                  Le client est il satisfait?
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
                      ? props.errors.appraisal
                      : ""}
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
                  onChange={(e) => props.commentaChanged(e.target.value)}
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
                {
                   (actif !== undefined && actif)  ?
                   <LoadingButton
                      onClick={
                        handleAppraise
                      }
                      className="waves-effect waves-effect-b waves-light btn-small"
                      loading={props.etat}
                      loadingPosition="end"
                      endIcon={<SaveIcon />}
                      variant="contained"
                      sx={{ backgroundColor:"#1e2188",textTransform:"initial" }}
                    >
                        <span>Mesurer</span>
                    </LoadingButton>
                  :
                  <div className="card-alert card red lighten-5">
                    <div className="card-content red-text">
                        <ul>
                            Veuillez activer une licence.
                        </ul>
                    </div>
                  </div>
                }
                
               
              </div>
            </details>
          </div>
        </div>
      </form>
    </>
  } else {
    mesureForm ="";
  } 

  let deForm ="";
  if (addR === "DE") {
    deForm = 
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
                {
                   (actif !== undefined && actif)  ?
                    <>
                      <LoadingButton
                        onClick={
                          handleDisapprove
                        }
                        className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
                        loading={props.etat2}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{textTransform:"initial" }}
                      >
                          <span>Désapprouver</span>
                      </LoadingButton>

                    </>
                  :
                  <div className="card-alert card red lighten-5">
                    <div className="card-content red-text">
                        <ul>
                            Veuillez activer une licence.
                        </ul>
                    </div>
                  </div>
                }
              
              </div>
            </details>
          </div>
      </div>
    </>
  } else {
    deForm ="";
  } 
  

  let content = [];
  content = props.items;

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
  console.log("props created at",props.created_at)
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
                        <h5 className="card-title">
                          Réclamations en attente de mesure de satisfaction
                        </h5>
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
                        { props?.match?.params?.code==="all" ? 
                            <IconButton
                              edge="start"
                              color="inherit"
                              onClick={handleClose}
                              aria-label="close"
                            >
                              <CloseIcon />
                            </IconButton> 
                          : 
                            <IconButton
                              edge="start"
                              color="inherit"
                              // onClick={handleClose}
                              aria-label="close"
                            >
                              <NavLink to="/alertes/reclamations"><div className="card-content text-white"><CloseIcon/></div></NavLink>
                            </IconButton> 
                        }
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
                                      <div>
                                        {props.content}
                                        {audioList}
                                        {attachmentList}
                                      </div>
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
                            <div className="row" id="ententeFiche">
                              <div className="col s12">
                                <h5 className="card-title">
                                  Mesurer la satisfaction
                                
                                </h5>
                              </div>
                            </div>

                            <div className="row pb-5">
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
    code: state.claim_appraise.code,
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
      dispatch(selectedItemAudioChanged(selectedItemAudio))
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
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MesurerReclamation);
