import React, { useEffect, useRef, useState } from "react";
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
import Select from "react-select";
// import partiel_icon from "../../assets/images/mesure/partial.svg"
// import satisfaire_icon from "../../assets/images/mesure/satisfied3.svg"
// import unsatisfaire_icon from "../../assets/images/mesure/unsatisfied2.svg"
import partiel_icon from "../../assets/images/mesure/emo2.svg";
import satisfaire_icon from "../../assets/images/mesure/emo3.svg";
import unsatisfaire_icon from "../../assets/images/mesure/emo1.svg";
import TextField from "@mui/material/TextField";
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
} from "../../apis/Reclamations/ReclamationsApi";
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
import WarningIcon from "@mui/icons-material/Warning";

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
  let dimf, crew;

  const [open, setOpen] = React.useState(false);
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

  const clearFiles = () => {
    if (inputRef.current) {
      inputRef.current.value = null;
    }
    setFiles([]);
  };

  const handleClose = () => {
    setOpen(false);
    clearComponentState();
  };

  let user =
    loadItemFromSessionStorage("app-user") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-user"))
      : undefined;
  let hbt = user.posteDto.habilitations.split(",");
  let addR = user.additionalRole;

  const { recorderState, ...handlers } = useRecorder();
  let { audio } = recorderState;

  const [open2, setOpen2] = useState(false);
  const [showAudioBox, setAudioBox] = useState(false);

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
    //  console.log("params",props.match.params)
    //  console.log("params 2",props.id)
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
          props.languageChanged(
            data.language.libelle ? data.language.libelle : ""
          );
          props.dossierimfChanged(data.folderCode ? data.folderCode : "");
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

          handleClickOpen();
        }
      }

      details();
    }
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
      ? JSON.parse(loadItemFromLocalStorage("app-sms"))
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
      claim["solutionId"] = props.solutionId;
      claim["satisfactionStatus"] = props.appraisal;
      claim["commentaire"] = props.commenta;
      claim["measurerId"] = user.id;
      // console.log("claimmesure", claim);
      props.etatChanged(true);
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
      props.etat2Changed(true);
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
                    title={`Ajouté par ${attachment.extra?.user?.firstAndLastName
                      } le ${formatDate(attachment.extra?.createdAt)}`}
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
                    title={`Ajouté par ${audioItem.extra?.user?.firstAndLastName
                      } le ${formatDate(audioItem.extra?.createdAt)}`}
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
      <Grid spacing={2} container size={12}>
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
                        console.log("typing", e.target.value);
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
                      backgroundColor: "#1e2188",
                      textTransform: "initial",
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
  // console.log("props created at", props.created_at);
  let creationDate = props.created_at ? formatDate(props.created_at) : "";

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
                  sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
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
                      backgroundColor: "#1e2188",
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
              color={"#1E2188"}
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
                      backgroundColor: "#1e2188",
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
                                            color: "#1e2188",
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
                              <div className="col l6 m6 s12 df justify-content-end">
                                <LoadingButton
                                  // style={{ marginLeft: '400px', marginTop: '-40px' }}
                                  className="btn waves-light btn-small flex-shrink-0"
                                  onClick={handleShowModalSms}
                                  loading={loading}
                                  loadingPosition="end"
                                  variant="outlined"
                                >
                                  <span>Envoyer SMS</span>
                                </LoadingButton>
                              </div>
                            </div>
                            <Dialog
                              open={showUploadModal}
                              onClose={() => setShowUploadModal(false)}
                              id="dialog-sms"
                            >
                              <DialogTitle>
                                Envoyer la solution au Client
                              </DialogTitle>
                              <DialogContent>
                                <div style={{ marginBottom: "15px" }}>
                                  <h6 style={{ fontWeight: "1000" }}>
                                    Prévisualisation SMS
                                  </h6>
                                  <p>
                                    Le message sera envoyé en{" "}
                                    <strong>{smsSegments.length}</strong> SMS en
                                    raison de la limite de caractères imposée
                                    par le fournisseur.
                                  </p>

                                  <div
                                    style={{
                                      maxHeight: "200px",
                                      overflowY: "auto",
                                      marginTop: "10px",
                                      scrollbarWidth: "thin", // Firefox
                                      scrollbarColor: "#999 transparent", // Firefox
                                    }}
                                    className="custom-scroll"
                                  >
                                    {smsSegments.map((seg, index) => (
                                      <div
                                        key={index}
                                        style={{
                                          border: "1px solid #ccc",
                                          padding: "8px",
                                          marginBottom: "5px",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        <strong>SMS {index + 1} :</strong> {seg}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <br />
                                <DialogContentText>
                                  La solution ci-dessus sera envoyée au client
                                  par SMS.
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <span style={{ whiteSpace: "pre-wrap" }}>
                                      {"Nom client : " + props.lastname || ""}
                                    </span>
                                    <span style={{ whiteSpace: "pre-wrap" }}>
                                      {"Téléphone : " + props.phone || ""}
                                    </span>
                                  </div>
                                </DialogContentText>
                                <br />
                                <div className="row">
                                  {/* Champ Commentaire */}
                                  <div className="col s12 input-field">
                                    <input
                                      type="text"
                                      className="trait-style"
                                      value={
                                        props.solution[0]?.commentaire || ""
                                      }
                                      disabled
                                    />
                                    <label className="active">
                                      Commentaire
                                    </label>
                                  </div>
                                </div>
                              </DialogContent>

                              <DialogActions>
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={() => setShowUploadModal(false)}
                                >
                                  Fermer
                                </Button>
                                <Button variant="contained" onClick={handleSms}>
                                  Envoyer par SMS
                                </Button>
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
