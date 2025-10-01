import React, { useEffect, useState, useRef } from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import Select from "react-select";
import { Link, NavLink } from "react-router-dom";
import TextField from "@mui/material/TextField";
import {
  addressChanged,
  agentsChanged,
  claimHandleErrors,
  codeChanged,
  commentChanged,
  contentChanged,
  firstnameChanged,
  genderChanged,
  handledByChanged,
  assignedAtChanged,
  assignedByChanged,
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
  collectChanged,
  dossierimfChanged,
  unitChanged,
  authorizeChanged,
  crewChanged,
  objetLevelChanged,
  solutionIdChanged,
  createdAtChanged,
  createdByChanged,
  newSolutionChanged,
  newCommentChanged,
  etat2Changed,
  etatChanged,
  etat3Changed,
  underSubjectChanged,
  etat4Changed,
  sessionChanged,
  solutionExistantChanged,
  transmittedChanged,
  selectedItemAudioChanged,
  transmittedToChanged,
  handledCustomMessageChanged,
  handledShowModalChanged,
  handledMessageChanged,
  handledDelaiChanged,
  setReaffect,
  extrasChanged,
  convertedAtChanged,
  convertedByChanged,
} from "../../redux/actions/Reclamations/TraitementReclamationActions";
import { v4 as uuid } from "uuid";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import http from "../../apis/http-common";
import { KTApp } from "../../Utils/blockui";
import { notify } from "../../Utils/alert";
import SaveIcon from '@mui/icons-material/Save';
import { useParams } from "react-router-dom";
import { HOST } from "../../Utils/globals";
import axios from "axios";
import {
  formatDate,
  guessExtension,
  isEmpty,
  loadItemFromLocalStorage,
  loadItemFromSessionStorage,
  today,
} from "../../Utils/utils";
import { connect } from "react-redux";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
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
import { Avatar, FormControl, FormControlLabel, FormLabel, LinearProgress, Radio, RadioGroup, DialogContent, DialogContentText, Text, Box, CardContent, Grid, Tooltip, List, ListItemButton, ListItemText, Card, DialogActions, DialogTitle } from "@mui/material";
import { FileDownload, History, Info, Pause, PlayArrow, Star, VolumeUp } from "@mui/icons-material";
import RecorderControls from "../../components/recorder-controls";
import useRecorder from "../../hooks/useRecorder";
import { LoadingButton } from "@mui/lab";
import { addExtraClaimApi } from "../../apis/Reclamations/ReclamationsApi";
import { getClaimAudioApi } from "../../apis/Reclamations/ReclamationsApi";
import { affectDenunciationApi, approveDenunciationSolutionApi, downloadAudioApi, getDenunAudioApi, getFillesApi, listeTreat, transmissionDenunciationApi, treatDenunciationApi, unapproveDenunciationSolutionApi, deleteDenunciationApi, downloadFillesApi, downloadFillesApi2 } from "../../apis/Denonciations/DenonciationsApi";
import { addSuggestionApi, addSuggestionApiOffline} from "../../apis/Suggestions/SuggestionsApi";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import { modalify } from "../../Utils/modal";
import SendIcon from '@mui/icons-material/Send';
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { startSession } from "../../apis/Reclamations/ReclamationsApi";
import { AddCircleOutline, ChatBubbleOutlineRounded } from "@mui/icons-material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ChatIcon from "@mui/icons-material/Chat";
import CardList from "../../layouts/CardList";
import MoveUpIcon from '@mui/icons-material/MoveUp';
import ForumIcon from '@mui/icons-material/Forum';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { licenseInfo } from "../../apis/LoginApi";
import { Redirect } from 'react-router-dom';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import WarningIcon from '@mui/icons-material/Warning';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EmailDialog from "./widgets/EmailDialog";
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
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
var stompClient = null;

const TraiterDenonciation = (props) => {
  let dimf, crew;
  let user =
    loadItemFromSessionStorage("app-user") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-user"))
      : undefined;
  let users =
    loadItemFromLocalStorage("app-users") !== undefined
      ? JSON.parse(loadItemFromLocalStorage("app-users"))
      : undefined;
  let hbt = user.posteDto.habilitations.split(",");
  let addR = (user.additionalRole);

  let handlingForms;
  const [agentsMailOptions, setAgentsMailOptions] = useState([]);

  //  const sendMail = (e) => {
  //     e.preventDefault()
  //         const user = JSON.parse(loadItemFromSessionStorage("user"));
  //             const templateParams = {
  //               type:"reclamation",
  //               to:affectEmail,
  //               bcc:emailSender,
  //               comment:messageSend,
  //               delai:delai_at,
  //               sendBy:user.firstname + " " + user.lastname + " ",
  //               code:props.code,
  //               client:props.firstname + "  " + props.lastname,
  //               enregistrerle:props.recorded_at,

  //             };

  //             let messageF = "Madame,Monsieur\n\n"+
  //             "Par la présente, je viens vous affecter le traitement d'une dénonciation ​:\n" +
  //             "Code : "+props.code+"\n"+
  //             "Client: "+props.firstname + "  " + props.lastname+"\n"+
  //             "Enregistré le : "+props.recorded_at+"\n\n"+
  //             messageSend+"\n\n"+
  //             "Je reste à votre entière disposition pour tout complément d'information relatif à cette affectation.\n"+
  //             "En conséquence,je vous prie de bien vouloir procéder au traitement de cette dénonciation dans un delai de "+delai_at+" jours a compte de la réception ce mail.\n"+
  //             "Cordialement\n"+user.firstname + " " + user.lastname + " \n";

  //           let r = {
  //               "to": affectEmail,
  //               "cc": emailSender.join(","),
  //               "from": user.email,
  //               "message": messageF,
  //               "subject": "Affectation de traitement d'une dénonciation"
  //           };
  //           sendEmailApi(r).then(function(response) {
  //             handleAssign(e)
  //               notify("Mail envoyé avec succes", "success");
  //         }, function(error) {
  //           handleAssign(e)
  //               notify("Envoie de mail echoué, Verifier votre connexion", "error");
  //         });

  //       // emailjs.send('service_iqzwl8e', 'template_uf6f28c', templateParams,"r3_6O5iyn0CtoI5dt")
  //       //     .then(function(response) {
  //       //         handleAssign(e)
  //       //           notify("Mail envoyé avec succes", "success");
  //       //     }, function(error) {
  //       //       handleAssign(e)
  //       //           notify("Envoie de mail echoué, Verifier votre connexion", "error");
  //       //     });

  //   };
  const [messageSend, setMessageSend] = useState("");
  const [delai_at, setDelai_at] = useState(1);
  const [maxDelai, setMaxDelai] = useState(1);
  const [open, setOpen] = React.useState(false);
  const [interne, setInterne] = React.useState(true);
  const [conversionBoxOpen, setConversionBoxOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [convertionType, setConvertionType] = useState(null);

  const [dataRow, setDataRow] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [fileBlobs, setFileBlobs] = useState([]);
  const [loadingConversion, setLoadingConversion] = useState(false);
  let mode = loadItemFromLocalStorage("app-mode") !== undefined ? (JSON.parse(loadItemFromLocalStorage("app-mode"))) : undefined;

  //#darrell
  const [usersCGR, setUsersCGR] = React.useState([]);
  const [reafect, setReacfect] = useState(false);

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

  //vérification if user is in guest
  let showJoinBtn = false;
  let potentialGuest = props.session?.guests?.filter((e) => e.id === user.id);
  let potentialMember = props.session?.members?.filter((e) => e.id === user.id);
  if ((potentialGuest != null && potentialGuest.length > 0) || (potentialMember != null && potentialMember.length > 0)) {
    showJoinBtn = true;
  }


  const [privateChats, setPrivateChats] = useState(new Map());
  const [publicChats, setPublicChats] = useState([]);
  const [guests, setGuests] = useState([]);
  const [tab, setTab] = useState("CHATROOM");
  const [userData, setUserData] = useState({
    username: "",
    receivername: "",
    connected: false,
    message: "",
  });
  //#darrell use for autoscroll
  const bottomRef = useRef(null);
  const [showVoteField, setShowVoteField] = useState(false);
  const [propositionSolution, setPropositionSolution] = useState("");
  const [propositionCommentaire, setPropositionCommentaire] = useState("");
  const [propositionSolutionError, setPropositionSolutionError] = useState("");
  const [propositionCommentaireError, setPropositionCommentaireError] =
    useState("");

  const [selectedOption, setSelectedOption] = useState("");
  const [votesForPour, setVotesForPour] = useState(0);
  const [votesForContre, setVotesForContre] = useState(0);
  const [showConfirmChooseSolution, setShowConfirmChooseSolution] = useState(false);

  const [confirmChoosedSolution, setConfirmChoosedSolution] = useState(false);
  const maDivRef = useRef(null);
  useEffect(() => {
    // console.log(userData);
  }, [userData]);

  useEffect(() => {

    setUsersCGR(users)

  }, []);

  useEffect(() => {
    // console.log(publicChats);
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [publicChats]);

  useEffect(() => {
    // setGuests(props?.session?.guests)
  }, [props?.session?.guests]);

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

  const history = useHistory();
  const handleClose = () => {
    setOpen(false);
    setConversionBoxOpen(false);
    history.push("/denonciations/traitement/all");
  };
  const handleConversionBoxClose = () => {
    if (confirmationOpen) return;

    setConversionBoxOpen(false);
  };

  const handleOpenDialog = (type) => {
    setConvertionType(type);
    setConfirmationOpen(true);
  };
  const handleConfirmationClose = () => {

    setConfirmationOpen(false);
  };

  const handleSubmitConfirmation = (e) => {
    e.preventDefault()
    setLoadingConversion(true);
    
    console.log("dataRow", dataRow);
    const formData = new FormData();
    let claim = {}

    claim["clientFirstAndLastName"] = dataRow.clientFirstAndLastName ?? null;
    claim["gender"] = dataRow.gender ?? null;
    claim["address"] = dataRow.address ?? null;
    claim["phone"] = dataRow.tel ?? null;
    claim["collectionChannelId"] = dataRow.collectionChannel.id ?? null;
    claim["servicePointId"] = dataRow.servicePoint.id ?? null;
    claim["fromWhatsapp"] = false;
    claim["filesWhatsapp"] = []
    claim["inboxWhatsapp"] = null
    claim["productId"] = dataRow.product.id;
    // claim["languageId"] = null;
    claim["languageId"] = 1; // Default to Langue National
    claim["folderCode"] = dataRow.folderCode;
    claim["receiptDateTime"] = dataRow.receiptDateTime;
    claim["collectorId"] = dataRow.collector.id;
    claim["content"] = dataRow.content;
    claim["code"] = "";
    claim["id"] = "";

    console.log("claim", claim);
    console.log("audioFiles", audioFiles);
    console.log("fileBlobs", fileBlobs);

    formData.append("suggestion", JSON.stringify(claim));
    if (fileBlobs != null) {
      fileBlobs.forEach(fileItem => {
        const file = new File([fileItem.blob], fileItem.name, {type: fileItem.blob.type || 'application/octet-stream'});
        formData.append('files', file);
      });
    }

    if (audioFiles != null) {
      audioFiles.forEach(audio => {
        const file = new File([audio.blob], "sugggestion_record_" + uuid() + ".ogg", {
          type: "audio/ogg; codecs=opus" });
        formData.append("audios", file);    
      });
    }

    props.etat2Changed(true)
    if (mode === 1) {
      addSuggestionApi(formData, props).then(() => {
        deleteDenunciationApi(dataRow.id, props).then(() => {});
        history.push("/suggestions/traitement");
      })
      .finally(() => {
        setLoadingConversion(false);
      });
    } else {
      addSuggestionApiOffline(claim, props).then(() => {
        deleteDenunciationApi(dataRow.id, props).then(() => {});
        history.push("/suggestions/traitement");
      })
      .finally(() => {
        setLoadingConversion(false);
      });
    }
  }
  
  const handleFerme = () => {
    // console.log("je suis dans ferme")
    return <Redirect to="/alertes/denonciations" />
  };


  const { id } = useParams();
  //console.log("params",props.match)

  useEffect(() => {
    if (props.match.params.code === "all") {
      props.itemsChanged([])
      listeTreat(props).then((r) => { });
    } else {

      async function details() {
        await axios({
          method: "get",
          url: HOST + "api/v1/denunciation/" + props.match.params.code + "/details",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
          },
        }).then(function (response) {
          listeTreat(props).then((r) => { });
          let data = response.data.content;
          // console.log("tmp",data)
          handleClickOpen();
          clearComponentState();

          let agentMailOptions = [];

          switch (data.objet.risqueLevel) {
            case "MINEUR":
              users.map((user) => {
                let hab = user.posteDto.habilitations.split(",");
                if (hab.includes("H1", "H2", "H3")) {
                  agentMailOptions.push({
                    label: user.firstAndLastName + " < " + user.email + " >",
                    value: user.id,
                    email: user.email,
                  });
                }
              });
              setAgentsMailOptions(agentMailOptions);
              if (hbt.includes("H2")) {
                props.authorizeChanged(true)
              } else {
                props.authorizeChanged(false)
              }
              break;
            case "MOYEN":
              users.map((user) => {
                let hab = user.posteDto.habilitations.split(",");
                if (hab.includes("H3")) {
                  agentMailOptions.push({
                    label: user.firstAndLastName + " < " + user.email + " >",
                    value: user.id,
                    email: user.email,
                  });
                }
              });
              setAgentsMailOptions(agentMailOptions);
              if (hbt.includes("H3")) {
                props.authorizeChanged(true)
              } else {
                props.authorizeChanged(false)
              }
              break;
            case "GRAVE":
              users.map((user) => {
                let hab = user.posteDto.habilitations.split(",");
                if (hab.includes("H4")) {
                  agentMailOptions.push({
                    label: user.firstAndLastName + "         < " + user.email + " >",
                    value: user.id,
                    email: user.email,
                  });
                }
              });
              setAgentsMailOptions(agentMailOptions);
              if (hbt.includes("H4")) {
                props.authorizeChanged(true)
              } else {
                props.authorizeChanged(false)
              }
              break;

            default:
              break;
          }
          setMaxDelai(data.objet.processingTime ? data.objet.processingTime : 45)
          props.idChanged(data.id ? data.id : "");
          props.codeChanged(data.code ? data.code : "");
          props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
          props.collectChanged(data.collectionChannel.libelle ? data.collectionChannel.libelle : "");
          props.subjectChanged(data.objet.libelle ? data.objet.libelle : "");
          props.objetLevelChanged(data.objet.risqueLevel ? data.objet.risqueLevel : "");
          props.productChanged(data.product.libelle ? data.product.libelle : "");
          props.unitChanged(data.servicePoint.libelle ? data.servicePoint.libelle : "");
          props.contentChanged(data.content ? data.content : "");
          props.solutionChanged(data.solutionDtos ? data.solutionDtos : "");
          props.statusChanged(data.status ? data.status : "");
          props.createdAtChanged(data.createdAt ? data.createdAt : "");
          props.createdByChanged(data.collector.firstAndLastName ? data.collector.firstAndLastName : "");
          props.assignedAtChanged(data.affectedAt ? data.affectedAt : "");
          props.assignedByChanged(data.treatmentAffectedBy ? data.treatmentAffectedBy.firstAndLastName : "");
          props.handledByChanged(data.treatmentAffectedTo ? data.treatmentAffectedTo.firstAndLastName : "");
          props.selectedItemChanged(data);
          // setCurrentData(data);
          //fetch attachments for selected claim
          getFillesApi(data.id, props);

        });
      }

      details()

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
  }, [props.match.params.code]);

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
  
  useEffect(() => {
    if (props.selectedItemAudio && props.selectedItemAudio.length > 0) {      
      Promise.all(
        props.selectedItemAudio.map(async (attachment) => {
          const data = await downloadAudioApi(attachment.id, attachment.name);
          const blob = new Blob([data], { type: "audio/ogg; codecs=opus" });
          const url = URL.createObjectURL(blob);
          
          return {
            id: attachment.id,
            name: attachment.name,
            blob,
            url,
          };
        })
      ).then(setAudioFiles);
    }
  }, [props.selectedItemAudio]);
  
  useEffect(() => {
    if (props.selectedItemFiles && props.selectedItemFiles.length > 0) {
      Promise.all(
        props.selectedItemFiles.map(async (attachment) => {
          try {
            const data = await downloadFillesApi2(attachment.id, attachment.name);
            if (!data) {
              console.warn("Blob null pour le fichier", attachment.name);
              return null;
            }

            const url = URL.createObjectURL(data);

            return {
              id: attachment.id,
              name: attachment.name,
              blob: data,
              url,
            };
          } catch (e) {
            console.error("Erreur téléchargement", e);
            return null;
          }
        })
      ).then((results) => {
        setFileBlobs(results.filter(Boolean));
      });
    }
  }, [props.selectedItemFiles]);

  const invitation = (event) => {

    let ids = (props?.session?.guests)?.map((e) => {
      return e.id;
    })

    let princ = users.filter((e) => {
      return (
        (e.additionalRole !== "MEMBRE_CGR") && (e.additionalRole !== "PR_CGR") && !ids.includes(e.id)
      );
    })

    const { value } = event.target;
    if (value !== "") {
      let coco = []
      coco = princ.filter((e) => {
        return (
          (e.firstAndLastName.toLowerCase().includes(value.toLowerCase()))
        );
      })

      setUsersCGR((prevList) => {
        const newList = coco;
        return newList;
      });

      // setUsersCGR(coco)
      if (usersCGR.length !== 0) {
        maDivRef.current.style.display = "block"
      } else {
        setUsersCGR((prevList) => {
          const newList = coco;
          return princ;
        });

        maDivRef.current.style.display = "none"
      }
      // console.log("cg",usersCGR)
    } else {
      maDivRef.current.style.display = "none"
    }

    // console.log("valeur",value)
  }

  const memberIds = props?.session?.members?.map(m => m.id) || [];
  const guestIds = guests?.map(g => g.id) || [];
  const availableToInvite = usersCGR.filter(
    (user) => !memberIds.includes(user.id) && !guestIds.includes(user.id)
  );

  const handleInvitation = (e, idi) => {
    var chatMessage = {
      userId: idi,
      claimCode: props.code,
      status: "INVITATION",
    };

    // console.log("codeconnected42", idi);
    stompClient.send(
      "/api/v1/session/join/guest/" + props.code + "",
      {},
      JSON.stringify(chatMessage)
    );
  }

  const handleEject = (e, idi) => {
    var chatMessage = {
      userId: idi,
      claimCode: props.code,
      status: "EJECTION",
    };

    // console.log("codeconnected42", idi);
    stompClient.send(
      "/api/v1/session/eject/guest/" + props.code + "",
      {},
      JSON.stringify(chatMessage)
    );
  }

  const connect = () => {
    let Sock = new SockJS(HOST + "ws");
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    setUserData({ ...userData, connected: true });
    // console.log("codeconnected", props.code);
    // console.log("propsconect",props)
    stompClient.subscribe(
      "/topic/session/" + props.code + "",
      onMessageReceived
    );
    // stompClient.subscribe('/'+props.code+'/secured/session/', onPrivateMessage);

    userJoin();
  };

  const userJoin = () => {
    var chatMessage = {
      userId: user.id,
      claimCode: props.code,
      status: "JOIN",
    };
    // setUserData({...userData,"username": user.id});
    // console.log("codeconnected4", props.code);
    stompClient.send(
      "/api/v1/session/join/" + props.code + "",
      {},
      JSON.stringify(chatMessage)
    );

    setPublicChats(props.session.messages);
    setGuests(props.session.guests)
  };

  const onMessageReceived = (payload) => {
    var payloadData = JSON.parse(payload.body);
    // console.log("payloadDta", payloadData);
    switch (payloadData.status) {
      case "JOIN":
        // console.log("privee", "un");
        // if (!privateChats.get(payloadData.firstAndLastName)) {
        //   privateChats.set(payloadData.firstAndLastName, []);
        //   setPrivateChats(new Map(privateChats));

        //   let list = props.session.messages;
        //   console.log("messageslist", list);
        //   // publicChats.push(list);
        //   setPublicChats((prevPublicChats) => {
        //     const newList = list;
        //     return newList;
        //   });
        //   console.log("publicchatsjoin", publicChats);
        //   // list.push(payloadData);
        //   // privateChats.set(payloadData.senderName,list);
        // }
        break;
      case "MESSAGE":
        // let list = props.session.messages;
        // list.push(payloadData);
        // console.log("message", list);
        // setPublicChats(list);
        // if(publicChats !== null && publicChats.length > 0 ){
        setPublicChats((prevPublicChats) => {
          if (prevPublicChats === undefined || prevPublicChats === null) {
            return [payloadData];
          }
          const newList = [...prevPublicChats, payloadData];
          return newList;
        });
        // } else {
        //   setPublicChats( [payloadData]);
        // }

        // props.sessionChanged(list);
        // console.log("message",publicChats)
        // publicChats.set(payloadData,publicChats);
        // publicChats.push(payloadData);
        // setPublicChats([...publicChats]);
        // console.log("message2", publicChats);
        break;
      case "VOTE":
        setPublicChats((prevPublicChats) => {
          const newList = payloadData.messages;
          return newList;
        });
        break;
      case "INVITATION":
        //objet
        var chatGuest = {
          id: payloadData.id,
          code: payloadData.code,
          firstAndLastName: payloadData.firstAndLastName,
        };

        setGuests((prevGuests) => {
          if (prevGuests === undefined) {
            return [chatGuest]
          }
          let prevG = prevGuests.filter((e) => {
            return e.id !== chatGuest.id
          })
          if (prevG === null || prevG === undefined) {
            return [chatGuest]
          }
          const newList = [...prevG, chatGuest];
          return newList;
        });

        break;
      case "EJECTION":
        // console.log("payloadEjection",payloadData)
        let nouveaux = [];
        let list = props.session.guests;
        if (list === undefined) {
          setGuests([]);
        } else {
          nouveaux = list.filter((e) => {
            return e.id !== payloadData.id;
          })

          //  console.log("ejection",nouveaux)
          setGuests((prevGuests) => {
            if (prevGuests === undefined) {
              return [nouveaux]
            }
            const newList = nouveaux;
            return newList;
          });
        }
        // console.log("condition", payloadData.id === user.id)
        // console.log("condition 2", payloadData.id == user.id)
        if (payloadData.id === user.id) {
          notify("Un membre du CGR vous a éjecté", "info");
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }

        break;
      case "CONFIRME_SOLUTION":
        notify("Bravo - Dénonciation traitée", "success");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        break;
    }
  };


  const onError = (err) => {
    // console.log(err);
  };

  const handleMessage = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, message: value });
  };
  const handlePropositionSolution = (event) => {
    const { value } = event.target;
    setPropositionSolution(value);
  };
  const handlePropositionCommentaire = (event) => {
    const { value } = event.target;
    setPropositionCommentaire(value);
  };
  const sendValue = () => {
    if (stompClient) {
      if (userData.message !== "") {
        var chatMessage = {
          senderId: user.id,
          content: userData.message,
          claimCode: props.code,
          status: "MESSAGE",
        };
        // console.log(chatMessage);
        stompClient.send(
          "/api/v1/session/" + props.code + "",
          {},
          JSON.stringify(chatMessage)
        );
        setUserData({ ...userData, message: "" });
      } else {

      }

      // console.log("msg", publicChats);
    } else {
      // console.log("errorr", "nop");
    }
  };

  const [showAudioPlayer, setAudioPlayer] = useState("");
  const [currentAudio, setCurrentAudio] = useState("");

  const sendVote = () => {
    if (propositionCommentaire === "" || propositionSolution === "") {
      if (propositionCommentaire === "") {
        setPropositionCommentaireError(
          "Veuillez renseigner la proposition de commentaire"
        );
      }
      if (propositionSolution === "") {
        setPropositionSolutionError(
          "Veuillez renseigner la proposition de solution"
        );
      }
    } else {
      //save vote
      if (stompClient) {
        let objContent = {
          contenu: propositionSolution,
          commentaire: propositionCommentaire,
        };
        let content = JSON.stringify(objContent);
        var chatMessage = {
          senderId: user.id,
          content: content,
          claimCode: props.code,
          status: "MESSAGE",
          vote: true,
        };
        stompClient.send(
          "/api/v1/session/" + props.code + "",
          {},
          JSON.stringify(chatMessage)
        );

        setPropositionCommentaire("");
        setPropositionSolution("");
        setPropositionCommentaireError("");
        setPropositionSolutionError("");
        setShowVoteField(false);
        setUserData({ ...userData, message: "" });
      } else {
        // console.log("errorr", "nop");
      }
    }
  };

  const handleVote = (e, info) => {
    const selectedValue = e.target.value;
    if (selectedOption !== "") {
      //removeVote
      let voteRequest = {
        removeVote: true,
        pour: selectedValue === "POUR",
        claimCode: props.code,
        authorId: user.id,
        messageId: info
      }
      // console.log("voteRequest - remove", voteRequest);

      stompClient.send(
        "/api/v1/session/vote/" + props.code + "",
        {},
        JSON.stringify(voteRequest)
      );
    } else {
      let voteRequest = {
        removeVote: false,
        pour: selectedValue === "POUR",
        claimCode: props.code,
        authorId: user.id,
        messageId: info
      }
      // console.log("voteRequest", voteRequest);

      stompClient.send(
        "/api/v1/session/vote/" + props.code + "",
        {},
        JSON.stringify(voteRequest)
      );
    }


    // Mettez à jour le nombre de votes en fonction de l'option sélectionnée
    // if (selectedValue === "for") {
    //   setVotesForOption1(votesForOption1 + 1);
    // } else if (selectedValue === "against") {
    //   setVotesForOption2(votesForOption2 + 1);
    // }

    // Mettez à jour l'option sélectionnée
    // setSelectedOption(selectedValue);
  };

  const registerUser = (e) => {
    let info = {};
    info["claimId"] = props.id;
    info["creatorId"] = user.id;
    // console.log("session", info);
    props.etat4Changed(true);
    startSession(info, props).then(() => {
      connect();
      // handleCancel(e);
    });
  };

  const handleShowVoteField = () => {
    setShowVoteField(!showVoteField);
  };

  const handleChooseVote = (msgId) => {
    //send
    let confirmSolution = {
      messageId: msgId,
      claimCode: props.code
    };
    if (stompClient) {
      stompClient.send(
        "/api/v1/session/confirm-solution/" + props.code + "",
        {},
        JSON.stringify(confirmSolution)
      );
    }
  }

  const handleChooseVoteConfirm = () => {
    setShowConfirmChooseSolution(!showConfirmChooseSolution)
  }
  let errors = {};
  const clearComponentState = () => {
    props.collectChanged("");
    props.subjectChanged("");
    props.codeChanged("");
    props.recordedAtChanged("");
    props.productChanged("");
    props.unitChanged("");
    props.contentChanged("");
    props.handledByChanged("");
    props.solutionChanged("");
    props.solutionIdChanged("");
    props.solutionExistantChanged("");
    props.commentChanged("");
    props.newSolutionChanged("");
    props.newCommentChanged("");
    props.motifChanged("");
    props.claimHandleErrors("");
    props.selectedItemChanged({});
    props.selectedFilesReset([]);
    props.selectedItemFilesChanged([]);
    props.sessionChanged("");
    setShowSelectPrintItem(false);
    props.handledMessageChanged("")
    props.handledDelaiChanged(1)
    props.handledCustomMessageChanged(false)
    props.handledShowModalChanged(false);
    props.setReaffect(null);
    if (stompClient) {
      stompClient.disconnect();
      setUserData({ ...userData, connected: false });
      setPublicChats([]);
      setGuests([])
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    clearComponentState();
  };
  const handleValidation = () => {
    // console.log("props.solution",props.solution)
    // console.log("props.solution2",props.solutionExistant)
    let isValid = true;

    if (
      (props.solutionExistant === "") && (
        props.solution === "" ||
        props.solution === undefined ||
        props.solution === null || props.solution.length === 0)

    ) {
      isValid = false;
      errors["solution"] = "Champ incorrect";
    }
    if (
      (props.solutionExistant === "") && (props.comment === "" ||
        props.comment === undefined ||
        props.comment === null)
    ) {
      isValid = false;
      errors["comment"] = "Champ incorrect";
    }

    return isValid;
  };

  const handleReValidation = () => {
    let isValid = true;

    if (
      (props.solutionExistant === "") && (
        props.new_solution === "" ||
        props.new_solution === undefined ||
        props.new_solution === null || props.new_solution.length === 0)
    ) {
      isValid = false;
      errors["new_solution"] = "Champ incorrect";
    }
    if (
      (props.solutionExistant === "") && (
        props.new_comment === "" ||
        props.new_comment === undefined ||
        props.new_comment === null)
    ) {
      isValid = false;
      errors["new_comment"] = "Champ incorrect";
    }

    return isValid;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleValidation()) {
      let claim = {};
      claim["code"] = props.code;
      claim["solution"] = props.solution;
      claim["comment"] = props.comment;
      claim["handled_by"] = JSON.parse(loadItemFromSessionStorage("user"));
      claim["status"] = 5;
      //   handleClaimApi(claim, props).then(() => {
      //     handleCancel(e);
      //   });
      // console.log(claim);
    } else {
    }
    props.claimHandleErrors(errors);
  };

  //Handling the List
  let columns = [
    {
      key: "code",
      text: "Code",
      className: "code",
      align: "left",
      sortable: true,
      cell: (claim, index) => {


        let codi;
        if (claim.session !== null && claim.session !== "") {
          if (claim.status === "AFFECTED" && claim.treatmentAffectedTo !== null && claim.treatmentAffectedTo.firstAndLastName === user.firstAndLastName) {
            codi = (
              <>
                <div className="df">
                  <span className="mr-1">{claim.code}</span>
                  <div className="card-content red-text ml-4"><AlternateEmailIcon /></div>
                  <div className="card-content red-text ml-4"><ForumIcon /></div>
                </div>

              </>
            );
          } else {
            codi = (
              <>
                <div className="df">
                  <span className="mr-1">{claim.code}</span>
                  <div className="card-content red-text ml-4"><ForumIcon /></div>
                </div>

              </>

            );
          }


        } else {
          if (claim.status === "AFFECTED" && claim.treatmentAffectedTo !== null && claim.treatmentAffectedTo.firstAndLastName === user.firstAndLastName) {
            codi = (
              <>
                <div className="df">
                  <span className="mr-1">{claim.code}</span>
                  <div className="card-content red-text ml-4"><AlternateEmailIcon /></div>
                </div>

              </>
            );
          } else {
            codi = (
              <span className="">{claim.code}</span>
            );
          }

        }

        return codi;
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
              <span className="toTreatBgColor chip  lighten-5">
                <span className="">A traiter</span>
              </span>
            );
            break;
          case "AFFECTED":
            statusElt = (
              <span className="affectedBgColor chip  lighten-5">
                <span className="">Affectée</span>
              </span>
            );
            break;
          case "TO_APPROUVED":
            statusElt = (
              <span className="toApprouvedBgColor chip  lighten-5">
                <span className="">A approuvée</span>
              </span>
            );
            break;
          case "DESAPPROUVED":
            statusElt = (
              <span className="unApprouvedBgColor chip  lighten-5">
                <span className="">Désapprouvée</span>
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
        switch (claim.objet?.risqueLevel) {
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
        if (claim.retardDay > 0 ) {
          temps = claim.declenchedDate
        } else {
          temps =<div className="card-content red-text"><WarningIcon/></div>
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
    filename: "Liste des dénonciations à traiter",
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
    setDataRow(data);
    setClaimId(data.id)
    console.log("dataRow", data)
    console.log("dataRow_", props)

    handleClickOpen();
    clearComponentState();

    //console.log("level",data.objet.risqueLevel)
    let agentMailOptions = [];

    switch (data.objet.risqueLevel) {
      case "MINEUR":
        users.map((user) => {
          let hab = user.posteDto.habilitations.split(",");
          if (hab.includes("H1", "H2", "H3")) {
            agentMailOptions.push({
              label: user.firstAndLastName + " < " + user.email + " >",
              value: user.id,
              email: user.email,
            });
          }
        });
        setAgentsMailOptions(agentMailOptions);
        if (hbt.includes("H2")) {
          props.authorizeChanged(true)
        } else {
          props.authorizeChanged(false)
        }
        break;
      case "MOYEN":
        users.map((user) => {
          let hab = user.posteDto.habilitations.split(",");
          if (hab.includes("H3")) {
            agentMailOptions.push({
              label: user.firstAndLastName + " < " + user.email + " >",
              value: user.id,
              email: user.email,
            });
          }
        });
        setAgentsMailOptions(agentMailOptions);
        if (hbt.includes("H3")) {
          props.authorizeChanged(true)
        } else {
          props.authorizeChanged(false)
        }
        break;
      case "GRAVE":
        users.map((user) => {
          let hab = user.posteDto.habilitations.split(",");
          if (hab.includes("H4")) {
            agentMailOptions.push({
              label: user.firstAndLastName + "         < " + user.email + " >",
              value: user.id,
              email: user.email,
            });
          }
        });
        setAgentsMailOptions(agentMailOptions);
        if (hbt.includes("H4")) {
          props.authorizeChanged(true)
        } else {
          props.authorizeChanged(false)
        }
        break;

      default:
        break;
    }
    setMaxDelai(data.objet.processingTime ? data.objet.processingTime : 45)
    props.idChanged(data.id ? data.id : "");
    props.codeChanged(data.code ? data.code : "");
    props.recordedAtChanged(data.receiptDateTime ? data.receiptDateTime : "");
    props.collectChanged(data.collectionChannel.libelle ? data.collectionChannel.libelle : "");
    props.subjectChanged(data.objet.libelle ? data.objet.libelle : "");
    props.underSubjectChanged(data.objet.categorie.libelle ? data.objet.categorie.libelle : "");
    props.objetLevelChanged(data.objet.risqueLevel ? data.objet.risqueLevel : "");
    props.productChanged(data.product.libelle ? data.product.libelle : "");
    props.unitChanged(data.servicePoint.libelle ? data.servicePoint.libelle : "");
    props.contentChanged(data.content ? data.content : "");
    props.solutionChanged(data.solutionDtos ? data.solutionDtos : "");
    props.statusChanged(data.status ? data.status : "");
    props.createdAtChanged(data.createdAt ? data.createdAt : "");
    props.createdByChanged(data.collector.firstAndLastName ? data.collector.firstAndLastName : "");
    props.assignedAtChanged(data.affectedAt ? data.affectedAt : "");
    props.assignedByChanged(data.treatmentAffectedBy ? data.treatmentAffectedBy.firstAndLastName : "");
    props.handledByChanged(data.treatmentAffectedTo ? data.treatmentAffectedTo.firstAndLastName : "");
    props.selectedItemChanged(data);
      setCurrentData(data);
    props.transmittedChanged(
      data.transmitted !== null ? "" + data.transmitted + "" : ""
    );
    //fetch attachments for selected claim
    getFillesApi(data.id, props);
    getDenunAudioApi(data.id, props);
    props.extrasChanged(data.extras ?? []);
    props.convertedByChanged(data.convertedBy ? data.convertedBy.firstAndLastName : "");
    props.convertedAtChanged(data.convertedAt ? data.convertedAt : "");

    props.sessionChanged(data.session !== null ? data.session : "");
  };

  /*tchat */
  let tchat;
  if ((showJoinBtn)) {
    tchat = (
      <>
        {userData.connected ? (
          <div className="row containera clearfix mt-5">

            <div class="people-list" id="people-list">
              {props.session.createdBy.id === user.id ?
                <div class="search">
                  <input type="text" placeholder="search" onChange={invitation} />
                </div> : null}
              <div id="listI" ref={maDivRef} style={{ display: "none" }}>

                <ul class="list">
                  <label className="text-xl mb-2" style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>A Inviter</label>

                  {availableToInvite.map((member) => (
                    <>
                      <li class="clearfix" key={member.id} style={{ display: "flex", verticalAlign: "center" }}>
                        <Avatar sx={{ width: 40, height: 40, backgroundColor: "#1E2188" }}>{member.firstAndLastName[0]}</Avatar>

                        <div class="about" style={{ marginTop: "0px" }}>
                          <div class="name nameToInvite">
                            <span>{member.firstAndLastName}</span>
                          </div>
                          <div class="" style={{ fontSize: "10px" }}>
                            {member.posteDto.libelle}
                          </div>
                        </div>
                        <IconButton onClick={(e) => handleInvitation(e, member.id)} color="primary" aria-label="Ajouter" style={{ marginLeft: "auto" }}>
                          <AddCircleOutline />
                        </IconButton>
                      </li>
                    </>

                  ))}

                </ul>
              </div>

              <ul class="list">
                <label className="text-xl mb-4" style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>Membres</label>
                {props?.session?.members?.map((member) => (
                  <>
                    <li
                      className="clearfix"
                      key={member.id}
                      style={{ display: "flex", verticalAlign: "center" }}
                    >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: "#1E2188",
                        }}
                      >
                        {member.firstAndLastName[0]}
                      </Avatar>

                      <div className="about" style={{ marginTop: "9.5px" }}>
                        <div className="name nameToInvite text-bold">
                          <span>{member.firstAndLastName}</span>
                        </div>
                        {/* <div className="status">
                            <i className="fa fa-circle online"></i> online
                          </div> */}
                      </div>
                    </li>
                  </>
                ))}
                <div className="d-flex">
                  <label className="text-xl" style={{ color: "white", fontSize: "18px", fontWeight: "600" }}>Invité(s)</label>
                </div>

                {guests !== null && (guests)?.length > 0 && guests.at(0).firstAndLastName != null ? (
                  <>

                    {(guests)?.map((guest) => (
                      <li className="clearfix" key={guest.id} style={{ display: "flex", verticalAlign: "center" }}>
                        <Avatar sx={{ width: 48, height: 48, backgroundColor: "#1E2188", }}>
                          {guest !== null && guest.firstAndLastName != null && guest?.firstAndLastName[0]}
                        </Avatar>

                        <div className="about" style={{ marginTop: "9.5px" }}>
                          <div className="name nameToInvite text-bold">
                            <span>{guest?.firstAndLastName}</span>
                          </div>
                          {/* <div className="status">
                              <i className="fa fa-circle online"></i> online
                            </div> */}
                        </div>
                        {!showJoinBtn ?
                          <IconButton onClick={(e) => handleEject(e, guest.id)} color="primary" aria-label="Ajouter" style={{ marginLeft: "auto" }}>
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                          : null}
                      </li>

                    ))}
                  </>
                ) : (
                  <></>
                )}
              </ul>
            </div>

            {tab === "CHATROOM" && (
              <div className="">
                <div className="chat">
                  <div
                    className="chat-header clearfix"
                    style={{
                      display: "flex",
                      verticalAlign: "center",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      paddingTop: "0px",
                      paddingBottom: "0px",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    {/* <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg" alt="avatar" /> */}
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: "#1E2188",
                        marginTop: "auto",
                        marginBottom: "auto",
                      }}
                    >
                      <ChatBubbleOutlineRounded />
                    </Avatar>
                    <div className="chat-about mt-0">
                      <div className="chat-with text-uppercase ">Session</div>
                      <label className="text-md text-secondary">
                        {props.code}
                      </label>
                      <div className="chat-num-messages text-sm">
                        {publicChats != null ? publicChats.length : "Aucun"}{" "}
                        message(s)
                      </div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      {props.session.createdBy.id === user.id ?
                        <>
                          <IconButton onClick={handleShowVoteField}>
                            <HowToVoteIcon />
                          </IconButton>
                        </> :
                        null
                      }

                    </div>
                  </div>
                  <div className="chat-history">
                    <ul>
                      {publicChats?.map((chat, index) => (
                        <>
                          {chat.sender.id === user.id ? (
                            <>
                              {chat.vote ? (
                                <>
                                  <li className="clearfix" key={chat.id}>
                                    <div className="message-data align-right">
                                      <span className="message-data-time">
                                        {chat.createdAt}
                                      </span>{" "}
                                      &nbsp; &nbsp;
                                      <span className="message-data-name">
                                        {chat.sender.firstAndLastName}
                                      </span>
                                    </div>
                                    <div className="message other-message float-right">
                                      <div className="row" style={{ display: "grid", justifyContent: "end" }}>
                                        <HowToVoteIcon />
                                      </div>
                                      <div>
                                        <blockquote>
                                          <p>
                                            <strong>Solution :</strong>{" "}
                                            {JSON.parse(chat.content).contenu}
                                          </p>
                                        </blockquote>
                                        <blockquote>
                                          <p>
                                            <strong>Commentaire :</strong>{" "}
                                            {
                                              JSON.parse(chat.content)
                                                .commentaire
                                            }
                                          </p>
                                        </blockquote>
                                      </div>

                                      <FormControl component="fieldset" style={{ width: "100%" }}>
                                        <FormLabel component="legend" className="text-white text-md text" style={{ color: "white" }}>
                                          Que votez-vous pour cette proposition
                                          ?
                                        </FormLabel>
                                        <RadioGroup
                                          aria-label="vote"
                                          name="vote-options"
                                          value={(chat?.voteDto?.userVote).filter((e) => {
                                            // console.log("filter", e.author.id === user.id  );
                                            // console.log("filter", e.author.id === user.id ? e.voteType : "fuck" );
                                            return e.author.id === user.id
                                          })[0]?.voteType + ""}
                                          onChange={(e) => handleVote(e, chat.id)}
                                        >

                                          <FormControlLabel
                                            value="POUR"
                                            control={
                                              <Radio
                                                color="error"
                                                sx={{
                                                  "& .MuiSvgIcon-root": {
                                                    display: "none",
                                                    color: "white"
                                                  },

                                                }}
                                              />
                                            }
                                            label="Pour"
                                            style={{ color: "white", borderColor: "white" }}
                                          />
                                          <div>
                                            <LinearProgress
                                              variant="determinate"
                                              color="success"
                                              value={((chat?.voteDto?.userVote).filter((e) => {

                                                return e.voteType === "POUR"
                                              }).length / ((chat?.voteDto?.userVote).filter((e) => {

                                                return e.voteType === "POUR"
                                              }).length + (chat?.voteDto?.userVote).filter((e) => {

                                                return e.voteType === "CONTRE"
                                              }).length)) * 100}
                                            />
                                            <p>{(chat?.voteDto?.userVote).filter((e) => {

                                              return e.voteType === "POUR"
                                            }).length} vote(s)</p>
                                          </div>

                                          <FormControlLabel
                                            value="CONTRE"
                                            control={<Radio sx={{
                                              "& .MuiSvgIcon-root": {
                                                display: "none",
                                                color: "white"
                                              },
                                              " .MuiFormControlLabel-label": {
                                                color: "white",
                                                fontWeight: "bold"
                                              }
                                            }} />}
                                            label="Contre"
                                            style={{ color: "white", borderColor: "white" }}
                                          />
                                          <div>
                                            <LinearProgress
                                              variant="determinate" color="success"
                                              value={((chat?.voteDto?.userVote).filter((e) => {

                                                return e.voteType === "CONTRE"
                                              }).length / ((chat?.voteDto?.userVote).filter((e) => {

                                                return e.voteType === "POUR"
                                              }).length + (chat?.voteDto?.userVote).filter((e) => {

                                                return e.voteType === "CONTRE"
                                              }).length)) * 100}
                                            />
                                            <p>{(chat?.voteDto?.userVote).filter((e) => {
                                              // console.log("filter", e.author.id === user.id  );
                                              // console.log("filter", e.author.id === user.id ? e.voteType : "fuck" );
                                              return e.voteType === "CONTRE"
                                            }).length} vote(s)</p>
                                          </div>
                                        </RadioGroup>


                                      </FormControl>

                                      {(chat?.voteDto?.userVote).filter((e) => {

                                        return e.voteType === "POUR"
                                      }).length > (chat?.voteDto?.userVote).filter((e) => {

                                        return e.voteType === "CONTRE"
                                      }).length ? <>
                                        <hr style={{ borderColor: "white" }} />
                                        <div style={{ marginLeft: "auto", marginRight: "auto", display: "grid" }}>
                                          {showConfirmChooseSolution ?
                                            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                                              <label style={{ fontSize: "16px", fontWeight: "bold", color: "white" }}>Poursuivre ? </label>
                                              <button onClick={handleChooseVoteConfirm} className="" style={{
                                                color: "black",
                                                fontSize: "16px",
                                                border: "none",
                                                cursor: "pointer",
                                                fontWeight: 'bold',
                                                backgroundColor: "transparent",
                                                marginRight: "6px"
                                              }}  >
                                                Non
                                              </button>
                                              <button onClick={(e) => handleChooseVote(chat.id)} className="" style={{
                                                color: "white",
                                                fontSize: "16px",
                                                border: "none",
                                                cursor: "pointer",
                                                fontWeight: 'bold',
                                                backgroundColor: "transparent"

                                              }}  >
                                                Oui
                                              </button>
                                            </div> :
                                            <>
                                              <button onClick={handleChooseVoteConfirm} className="" style={{
                                                color: "white",
                                                fontSize: "16px",
                                                border: "none",
                                                cursor: "pointer",
                                                fontWeight: 'bold',
                                                backgroundColor: "transparent"

                                              }}  >
                                                Utiliser comme solution
                                              </button>
                                            </>}

                                        </div>
                                      </> : null}


                                    </div>

                                  </li>
                                </>
                              ) : (
                                <li className="clearfix" key={chat.id}>
                                  <div className="message-data align-right">
                                    <span className="message-data-time">
                                      {chat.createdAt}
                                    </span>{" "}
                                    &nbsp; &nbsp;
                                    <span className="message-data-name">
                                      {chat.sender.firstAndLastName}
                                    </span>
                                  </div>
                                  <div className="message other-message float-right">
                                    {chat.content}
                                  </div>
                                </li>
                              )}
                            </>
                          ) : (
                            <>
                              {chat.vote ? (
                                <>
                                  <li key={chat.id}>
                                    <div className="message-data">
                                      <span className="message-data-name">
                                        {chat.sender.firstAndLastName}
                                      </span>
                                      <span className="message-data-time">
                                        {chat.createdAt}
                                      </span>
                                    </div>
                                    <div className="message my-message">
                                      <div className="row" style={{ display: "grid", justifyContent: "end" }}>
                                        <HowToVoteIcon />
                                      </div>
                                      <div>
                                        <blockquote>
                                          <p>
                                            <strong>Solution :</strong>{" "}
                                            {JSON.parse(chat.content).contenu}
                                          </p>
                                        </blockquote>
                                        <blockquote>
                                          <p>
                                            <strong>Commentaire :</strong>{" "}
                                            {
                                              JSON.parse(chat.content)
                                                .commentaire
                                            }
                                          </p>
                                        </blockquote>
                                      </div>

                                      <FormControl component="fieldset" style={{ width: "100%" }}>
                                        <FormLabel component="legend" className="text-white text-md text" style={{ color: "white" }}>
                                          Que votez-vous pour cette proposition
                                          ?
                                        </FormLabel>
                                        <RadioGroup
                                          aria-label="vote"
                                          name="vote-options"
                                          value={(chat?.voteDto?.userVote).filter((e) => {
                                            // console.log("filter", e.author.id === user.id  );
                                            return e.author.id === user.id
                                          })[0]?.voteType + ""}
                                          onChange={(e) => handleVote(e, chat.id)}
                                        >

                                          <FormControlLabel
                                            value="POUR"
                                            control={
                                              <Radio
                                                sx={{
                                                  "& .MuiSvgIcon-root": {
                                                    display: "none",
                                                  },
                                                  "& .MuiTypography-root": {
                                                    color: "white",
                                                    fontWeight: "bold"
                                                  }
                                                }}
                                              />
                                            }
                                            label="Pour"
                                            style={{ color: "white", borderColor: "white" }}
                                          />
                                          <div>
                                            <LinearProgress
                                              variant="determinate" color="success"
                                              value={((chat?.voteDto?.userVote).filter((e) => {

                                                return e.voteType === "POUR"
                                              }).length / ((chat?.voteDto?.userVote).filter((e) => {

                                                return e.voteType === "POUR"
                                              }).length + (chat?.voteDto?.userVote).filter((e) => {

                                                return e.voteType === "CONTRE"
                                              }).length)) * 100}
                                            />
                                            <p>{(chat?.voteDto?.userVote).filter((e) => {
                                              // console.log("filter", e.author.id === user.id  );
                                              return e.voteType === "POUR"
                                            }).length} vote(s)</p>
                                          </div>

                                          <FormControlLabel
                                            value="CONTRE"
                                            control={<Radio sx={{
                                              "& .MuiSvgIcon-root": {
                                                display: "none",
                                              },
                                              "& .MuiTypography-root": {
                                                color: "white",
                                                fontWeight: "bold"
                                              }
                                            }} />}
                                            label="Contre"
                                            style={{ color: "white", borderColor: "white" }}
                                          />
                                          <div>
                                            <LinearProgress
                                              variant="determinate" color="success"
                                              value={((chat?.voteDto?.userVote).filter((e) => {

                                                return e.voteType === "CONTRE"
                                              }).length / ((chat?.voteDto?.userVote).filter((e) => {

                                                return e.voteType === "CONTRE"
                                              }).length + (chat?.voteDto?.userVote).filter((e) => {

                                                return e.voteType === "POUR"
                                              }).length)) * 100}
                                            />
                                            <p>{(chat?.voteDto?.userVote).filter((e) => {
                                              // console.log("filter", e.author.id === user.id  );
                                              // console.log("filter", e.author.id === user.id ? e.voteType : "fuck" );
                                              return e.voteType === "CONTRE"
                                            }).length} vote(s)</p>
                                          </div>
                                        </RadioGroup>


                                      </FormControl>

                                      {(chat?.voteDto?.userVote).filter((e) => {

                                        return e.voteType === "POUR"
                                      }).length > (chat?.voteDto?.userVote).filter((e) => {

                                        return e.voteType === "CONTRE"
                                      }).length ? <>
                                        <hr style={{ borderColor: "white" }} />
                                        <div style={{ marginLeft: "auto", marginRight: "auto", display: "grid" }}>
                                          {showConfirmChooseSolution ?
                                            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                                              <label style={{ fontSize: "16px", fontWeight: "bold", color: "white" }}>Poursuivre ? </label>
                                              <button onClick={handleChooseVoteConfirm} className="" style={{
                                                color: "black",
                                                fontSize: "16px",
                                                border: "none",
                                                cursor: "pointer",
                                                fontWeight: 'bold',
                                                backgroundColor: "transparent",
                                                marginRight: "6px"
                                              }}  >
                                                Non
                                              </button>
                                              <button onClick={(e) => handleChooseVote(chat.id)} className="" style={{
                                                color: "white",
                                                fontSize: "16px",
                                                border: "none",
                                                cursor: "pointer",
                                                fontWeight: 'bold',
                                                backgroundColor: "transparent"

                                              }}  >
                                                Oui
                                              </button>
                                            </div> :
                                            <>
                                              <button onClick={handleChooseVoteConfirm} className="" style={{
                                                color: "white",
                                                fontSize: "16px",
                                                border: "none",
                                                cursor: "pointer",
                                                fontWeight: 'bold',
                                                backgroundColor: "transparent"

                                              }}  >
                                                Utiliser comme solution
                                              </button>
                                            </>}
                                        </div>
                                      </> : null}

                                    </div>

                                  </li>
                                </>
                              ) : (
                                <>
                                  <li key={chat.id}>
                                    <div className="message-data">
                                      <span className="message-data-name">
                                        {chat.sender.firstAndLastName}
                                      </span>
                                      <span className="message-data-time">
                                        {chat.createdAt}
                                      </span>
                                    </div>
                                    <div className="message my-message">
                                      {chat.content}
                                    </div>
                                  </li>
                                </>
                              )}
                            </>

                          )}
                        </>
                      ))}
                    </ul>
                    <div ref={bottomRef} />
                  </div>
                  <div className="chat-message clearfix">
                    {showVoteField ? (
                      <>
                        <textarea
                          name="message-to-send"
                          id="message-to-send"
                          placeholder="Entrez la solution"
                          value={propositionSolution}
                          onChange={handlePropositionSolution}
                          rows="3"
                          className="mb-4"
                          style={{
                            background: "#f0f0f0 !important",
                            color: "black",
                          }}
                        ></textarea>
                        <div id="solution-error" className="error">
                          {propositionSolutionError}
                        </div>
                        <textarea
                          name="message-to-send"
                          id="message-to-send"
                          placeholder="Entrez son commentaire"
                          value={propositionCommentaire}
                          onChange={handlePropositionCommentaire}
                          rows="2"
                          className="bg-secondary"
                          style={{
                            background: "#f0f0f0 !important",
                            color: "black",
                          }}
                        ></textarea>
                        <div id="solution-error" className="error">
                          {propositionCommentaireError}
                        </div>
                      </>
                    ) : (
                      <textarea
                        name="message-to-send"
                        id="message-to-send"
                        placeholder="Entrez votre message"
                        value={userData.message}
                        onChange={handleMessage}
                        rows="3"
                      ></textarea>
                    )}
                    <div className="">
                      {showVoteField ?
                        <button onClick={handleShowVoteField} className="btn btn-secondary ml-4" style={{
                          float: "right",
                          color: "white",
                          fontSize: "16px",
                          textTransform: "uppercase",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 'bold',
                          backgroundColor: "gray"

                        }}  >
                          Annuler
                        </button>
                        : null
                      }
                      <button onClick={showVoteField ? sendVote : sendValue} className="btn btn-primary" style={{
                        float: "right",
                        color: "white",
                        fontSize: "16px",
                        textTransform: "uppercase",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 'bold',
                        backgroundColor: "#84cd3e"
                      }} >
                        {showVoteField ? "Soumettre pour vote" : "Envoyer"}
                      </button>

                    </div>

                  </div>
                </div>

                {/* <div className="send-message">
                    <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} /> 
                    <button type="button" className="send-button" onClick={sendValue}>Envoyez</button>
                </div> */}
              </div>
            )}
          </div>
        ) : (
          ""
        )}
      </>
    );
  } else {
    tchat = "";
  }


  /*Hisotrique*/


  let details;
  if ((props.solution).length !== 0) {

    if (props.status === "TO_APPROUVED" || props.status === "DESAPPROUVED") {
      // console.log("abcde",props.status)
      let index = 0;
      let solutions = Array.from(props.solution);
      let couleurs = ["#333300", "#00cc00", "#99003d", "#3333ff", "#666666", "#253858", "#00875A", "#36B37E", "#FFC400", "#FF8B00", "#FF5630", "#5243AA", "#0052CC", "#00B8D9"]

      if (solutions.length !== 0) {
        details = (
          <>
            <div className="col s12">
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
        details = "Aucune donnée"
      }
    }

  } else if ((props.solution).length === 0) {
    details = "Cette dénonciation est en attente de traitement";
  }

  let formButtons;
  if (isEmpty(props.selectedItem)) {
    formButtons = (
      <>
        <button
          type="submit"
          className="waves-effect waves-effect-b waves-light btn-small"
        >
          Enregistrer
        </button>
      </>
    );
  } else {
    formButtons = (
      <>
        <button
          type="button"
          onClick={(e) => handleCancel(e)}
          className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text white lighten-4"
        >
          Annuler
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="waves-effect waves-effect-b waves-light btn-small"
        >
          Enregistrer
        </button>
      </>
    );
  }

  const handleValidationForAssign = () => {
    let isValid = true;

    if (
      props.handled_by === "" ||
      props.handled_by === undefined ||
      props.handled_by === null
    ) {
      isValid = false;
      errors["handled_by"] = "Champ incorrect";
    }
    if (
      props.handled_delai <= 0 || props.handled_delai > maxDelai
    ) {
      isValid = false;
      errors["handled_delai"] = `Le delai doit etre compris entre ${1} à ${maxDelai}`;
    }

    return isValid;
  };
  const handleValidationForReAssign = () => {
    let isValid = true;

    if (
      props.reaffect === "" ||
      props.reaffect === undefined ||
      props.reaffect === null
    ) {
      isValid = false;
      errors["handled_by"] = "Champ incorrect";
    }
    if (
      props.handled_delai <= 0 || props.handled_delai > maxDelai
    ) {
      isValid = false;
      errors["handled_delai"] = `Le delai doit etre compris entre ${1} à ${maxDelai}`;
    }

    return isValid;
  };
  const handleAssign = (e) => {
    e.preventDefault();
    if (handleValidationForAssign()) {
      let claim = {};
      // console.log(props.code);

      claim["claimId"] = props.id;
      claim["delai"] = props.handled_delai > maxDelai ? maxDelai : props.handled_delai;
      claim["message"] = props.handled_message;
      claim["isCustomMessage"] = props.handled_custom_message
      claim["affectToId"] = props.handled_by;
      claim["affectorId"] = user.id;

      //console.log("props.handled_by",claim);
      props.etatChanged(true)
      affectDenunciationApi(claim, props).then(() => {
        handleCancel(e);
        handleClose();
      });
    } else {
    }
    props.claimHandleErrors(errors);
  };
  
  const prepareBeforeAssign = (e) => {
    e.preventDefault()
    e.stopPropagation()

    props.handledShowModalChanged(true)
  };

  const handleAssignOrReassign = (e)=>{
    console.log("reaffect", props);

    if(props.reaffect){
      handleReAssign(e)
    }else{
      handleAssign(e)
    }
  }

  const handleReAssign = (e) => {
    e.preventDefault();
    if (handleValidationForReAssign()) {
      let claim = {};
      // console.log(props.code);

      claim["claimId"] = props.id;
      claim["affectToId"] = props.reaffect;
      claim["affectorId"] = user.id;
      claim["message"] = props.handled_message;
      claim["delai"] = props.handled_delai;

      // console.log("anonymaty", anonymat);

      //console.log("props.handled_by",claim);
      props.etatChanged(true);
      affectDenunciationApi(claim, props).then(() => {
        handleCancel(e);
        handleClose();
      });
    } else {
    }
    props.claimHandleErrors(errors);
  };

  const handleSolve = (e) => {
    e.preventDefault();
    if (handleValidation()) {
      let claim = {};
      claim["claimId"] = props.id;
      claim["treatorId"] = user.id;
      claim["solution"] = props.solution.length !== 0 ? props.solution : "";
      claim["commentaire"] = props.comment;
      claim["existingId"] = props.solutionExistant;
      claim["isExisting"] = props.solutionExistant !== "" ? true : false;

      // console.log("traitementclaim", claim);
      props.etat2Changed(true)
      treatDenunciationApi(claim, props).then(() => {
        handleCancel(e);
        handleClose();
      });
    } else {
    }
    props.claimHandleErrors(errors);
  };

  const handleReSolve = (e) => {
    e.preventDefault();
    if (handleReValidation()) {
      let claim = {};
      claim["claimId"] = props.id;
      claim["treatorId"] = user.id;
      claim["solution"] = props.new_solution;
      claim["commentaire"] = props.new_comment;
      claim["existingId"] = props.solutionExistant;
      claim["isExisting"] = props.solutionExistant !== "" ? true : false;
      // console.log("traitementclaim", claim);
      props.etat2Changed(true)
      treatDenunciationApi(claim, props).then(() => {
        handleCancel(e);
        handleClose();
      });
    } else {
    }
    props.claimHandleErrors(errors);
  };

  const handleApprove = (e) => {
    e.preventDefault();

    let claim = {};
    claim["solutionId"] = props.solutionId;
    claim["claimId"] = props.id;
    claim["approuverId"] = user.id;
    //console.log("aprobation",claim)
    props.etat2Changed(true)
    approveDenunciationSolutionApi(claim, props).then(() => {
      handleCancel(e);
      handleClose();
    });

    props.claimHandleErrors(errors);
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
      props.etatChanged(true)
      unapproveDenunciationSolutionApi(claim, props).then(() => {
        handleCancel(e);
        handleClose();
      });
    } else {
    }
    props.claimHandleErrors(errors);
  };

  const handleTransmission = (e) => {
    e.preventDefault();
    let info = {
      "claimId": props.id,
    };
    props.etat3Changed(true)
    transmissionDenunciationApi(info, props).then(() => {
      handleCancel(e);
      handleClose();
    });

  };

  const handleModal = (e) => {
    e.preventDefault();
    handleClose();
    modalify(
      "Confirmation",
      "Confirmez vous la transmission de cette dénonciation au pilote ? Vous perdrez tout droit de traitement.",
      "confirm",
      handleTransmission
    );
  };

  let statusElt;
  let affectForm;
  let treatForm;
  let solutionsListe = [];
  switch (props.status) {
    case "SAVED":
      let solutions = props.selectedItem?.objet?.existingSolutions;

      solutionsListe = solutions?.map((solution, index) => {
        let words = String(solution.content).split(" ");
        let thirtyWords = "";
        let taille = words.length;
        if (taille < 30) {
          thirtyWords = solution.content;
        } else {
          for (let i = 0; i < 50; i++) {
            const o = words[i];
            thirtyWords = thirtyWords + o + " ";
          }
          thirtyWords =
            thirtyWords + "......... (Déroulez pour voir la solution complète)";
        }

        return {
          props: props,
          index: index,
          id: solution.id,
          taille: taille,
          title: thirtyWords,
          content: solution.content,
          compteur: solution.compteur,
        };
      });
      // console.log("solutionsLISTE", solutionsListe);
      if ((props.objetLevel === "MINEUR" || props.objetLevel === "MOYEN") &&
        user.firstAndLastName === props.created_by &&
        props.transmitted === "true") {
        affectForm = "Vous avez transmis cette réclamation. Vous n'avez plus la main sur elle "
      }

      if (hbt.includes("H6") || addR === "PILOTE") {
        // if ((props.objetLevel === "MINEUR" || props.objetLevel === "MOYEN") &&
        //   user.firstAndLastName === props.created_by &&
        //   props.transmitted === "true") {
        //  affectForm="Vous avez transmis cette réclamation. Vous n'avez plus la main sur elle "
        // } else {
        affectForm = (
          <>
            <form id="claimAssignForm">
              <div className="row">
                <div className="col s12">
                  <details>
                    <summary className="text-details">
                      Affectation de la dénonciation
                    </summary>

                    <div className="col s12 input-field">
                      <Select
                        options={agentsMailOptions}
                        className="react-select-container mt-4"
                        classNamePrefix="react-select"
                        style={styles}
                        placeholder="Sélectionner l'agent"
                        onChange={(e) => {
                          props.handledByChanged(e.value);
                          setAffectEmail(e.email);
                        }}
                      />
                      <label htmlFor="gender" className={"active"}>
                        Affectée à
                        <span>
                          (<span className="red-text darken-2 ">*</span>)
                        </span>
                      </label>
                      <small className="errorTxt4">
                        <div id="cpassword-error" className="error">
                          {props.errors !== undefined
                            ? props.errors.handled_by
                            : ""}
                        </div>
                      </small>
                    </div>


                    <div className="col s12 display-flex justify-content-end mt-3">
                      {
                        // (actif !== undefined && actif)  ?
                        <LoadingButton
                          onClick={(e) => {
                            e.preventDefault();
                            if (handleValidationForAssign()) {
                              //setShowSelectPrintItem(true);
                              prepareBeforeAssign(e);
                              //handleAssign(e);
                            }
                            props.claimHandleErrors(errors);
                          }}
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
                          <span>Affecter</span>
                        </LoadingButton>
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
        );
        // }
      } else {
        affectForm = ""
      }

      if (hbt.includes("H2", "H3", "H4") && ((props.created_by === user.firstAndLastName && props.transmitted === "false") || (props.transmittedTo === user.firstAndLastName && props.transmitted === "true" && addR === "MOLDUE"))) {
        treatForm = (
          <>


            {/* {solutionsListe} */}
            {props.authorize ? (
              <>
                {solutionsListe !== undefined && solutionsListe.length !== 0 ?
                  <div className="row">
                    <div className="col l12">
                      <details>
                        <summary className="text-details">
                          Solutions potentielles
                        </summary>
                        <CardList cards={solutionsListe} />
                      </details>
                    </div>
                  </div>
                  : ""}

                <form id="claimHandleForm">
                  <div className="row mb-2">
                    <div className="col s12">
                      <details open>
                        <summary className="text-details">
                          Résolution de la dénonciation
                        </summary>
                        <div className="col s12 input-field">
                          <textarea
                            id="solution"
                            name="solution"
                            placeholder=""
                            className="materialize-textarea textarea-size"
                            value={props.solution}
                            onChange={(e) => props.solutionChanged(e.target.value)}
                          ></textarea>
                          <label htmlFor="content" className={"active"}>
                            Solution
                            <span>
                              (<span className="red-text darken-2 ">*</span>)
                            </span>
                          </label>
                          <small className="errorTxt4">
                            <div id="cpassword-error" className="error">
                              {props.errors !== undefined
                                ? props.errors.solution
                                : ""}
                            </div>
                          </small>
                        </div>
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
                            Commentaires/Observations
                            <span>
                              (<span className="red-text darken-2 ">*</span>)
                            </span>
                          </label>
                          <small className="errorTxt4">
                            <div id="cpassword-error" className="error">
                              {props.errors !== undefined
                                ? props.errors.comment
                                : ""}
                            </div>
                          </small>
                        </div>

                      </details>
                    </div>
                    <div className="col s12 display-flex justify-content-end">
                      {
                        // (actif !== undefined && actif)  ?
                        <LoadingButton
                          onClick={handleSolve}
                          className="waves-effect waves-effect-b waves-light btn-small"
                          loading={props.etat2}
                          loadingPosition="end"
                          endIcon={<SaveIcon />}
                          variant="contained"
                          sx={{
                            backgroundColor: "#1e2188",
                            textTransform: "initial",
                          }}
                        >
                          <span>Résoudre</span>
                        </LoadingButton>
                        //  :
                        //   <div className="card-alert card red lighten-5">
                        //       <div className="card-content red-text">
                        //         <ul>
                        //           Veuillez activer une licence.
                        //         </ul>
                        //       </div>
                        //   </div>

                      }

                    </div>
                  </div>
                </form>


              </>
            ) : (
              <div className="row">
                <div className="col s12">
                  <details open>
                    <summary className="text-details">
                      Resolution de la dénonciation
                    </summary>
                    <div className="card-alert card red lighten-5">
                      <div
                        className="card-content red-text"
                        style={{ textAlign: "center" }}
                      >
                        <ul>Vous ne pouvez pas traiter cette dénonciation</ul>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            )}
          </>
        );
      } else {
        treatForm = ""
      }


      statusElt = (
        <span className="toTreatBgColor chip  z-depth-1">
          <span className="">A traiter</span>
        </span>
      );

      break;
    case "AFFECTED":

      statusElt = (
        <span className="affectedBgColor chip z-depth-1">
          <span className="">Affectée</span>
        </span>
      );

      let tmp;
      let afForm;
      let personAffect =
        <>
          {/* details affectation */}
          <div className="row">
            <div className="col s12 pb-2">
              Dénonciation affectée à{" "}
              <span style={{ fontWeight: "bold" }}>{props.handled_by}</span> par{" "}
              {props.assigned_by} le {formatDate(props.assignedAt)}
            </div>
          </div>
        </>

      let solutions1 = props.selectedItem?.objet?.existingSolutions;

      solutionsListe = solutions1?.map((solution, index) => {
        let words = String(solution.content).split(" ");
        let thirtyWords = "";
        let taille = words.length;
        if (taille < 30) {
          thirtyWords = solution.content;
        } else {
          for (let i = 0; i < 50; i++) {
            const o = words[i];
            thirtyWords = thirtyWords + o + " ";
          }
          thirtyWords =
            thirtyWords + "......... (Déroulez pour voir la solution complète)";
        }

        return {
          props: props,
          index: index,
          id: solution.id,
          taille: taille,
          title: thirtyWords,
          content: solution.content,
          compteur: solution.compteur,
        };
      });

      //ils peuvent reaffecter les Dénonciations en cas d'erreur ou d'indisponibilité

      afForm = (
        <>
          <div className="row mb-4">
            <form id="claimAssignForm">
              <div className="row">
                <div className="col s12">
                  <details>
                    <summary className="text-details">
                      Réaffectation de la Dénonciation
                    </summary>

                    <div className="col s12 input-field">
                      <Select
                        options={agentsMailOptions}
                        className="react-select-container mt-4"
                        classNamePrefix="react-select"
                        style={styles}
                        placeholder="Sélectionner l'agent"
                        onChange={(e) => {                          
                          props.setReaffect(e.value);
                          setAffectEmail(e.email);
                        }}
                      />
                      <label htmlFor="gender" className={"active"}>
                        Affectée à
                        <span>
                          (<span className="red-text darken-2 ">*</span>)
                        </span>
                      </label>
                      <small className="errorTxt4">
                        <div id="cpassword-error" className="error">
                          {props.errors !== undefined
                            ? props.errors.handled_by
                            : ""}
                        </div>
                      </small>
                    </div>

                    <div className="col s12 display-flex justify-content-end mt-3">


                      <LoadingButton
                        onClick={(e) => {
                          e.preventDefault();
                          if (handleValidationForReAssign()) {
                            //setShowSelectPrintItem(true);
                            prepareBeforeAssign(e)
                            // handleReAssign(e);
                          }
                          props.claimHandleErrors(errors);
                        }}
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
                        <span>Affecter</span>
                      </LoadingButton>




                    </div>
                  </details>
                </div>
              </div>
            </form>
          </div>
        </>
      );
      // console.log("props.solution",props.solution);
      // console.log("props.code",props.code);
      if (props.handled_by === user.firstAndLastName) {
        tmp = (
          <div className="row">
            {/* resolution */}
            {props.authorize ? (
              <>
                {solutionsListe !== undefined && solutionsListe.length !== 0 ?
                  <div className="row">
                    <div className="col l12">
                      <details>
                        <summary className="text-details">
                          Solutions potentielles
                        </summary>
                        <CardList cards={solutionsListe} />
                      </details>
                    </div>
                  </div>
                  : ""}
                <form id="claimHandleAgainForm">
                  <div className="row">
                    <div className="col s12">
                      <details open>
                        <summary className="text-details">
                          Traitement de la Dénonciation
                        </summary>
                        <div className="col s12 input-field">
                          <textarea
                            id="solution"
                            name="solution"
                            placeholder=""
                            className="materialize-textarea textarea-size"
                            value={props.solution}
                            onChange={(e) => props.solutionChanged(e.target.value)}
                          ></textarea>
                          <label htmlFor="content" className={"active"}>
                            Solution
                            <span>
                              (<span className="red-text darken-2 ">*</span>)
                            </span>
                          </label>
                          <small className="errorTxt4">
                            <div id="cpassword-error" className="error">
                              {props.errors !== undefined
                                ? props.errors.solution
                                : ""}
                            </div>
                          </small>
                        </div>
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
                            Commentaires/Observations
                            <span>
                              (<span className="red-text darken-2 ">*</span>)
                            </span>
                          </label>
                          <small className="errorTxt4">
                            <div id="cpassword-error" className="error">
                              {props.errors !== undefined
                                ? props.errors.comment
                                : ""}
                            </div>
                          </small>
                        </div>
                        <div className="col s12 display-flex justify-content-end mt-3">
                          {
                            //  (actif !== undefined && actif)  ?
                            <LoadingButton
                              onClick={handleSolve}
                              className="waves-effect waves-effect-b waves-light btn-small"
                              loading={props.etat2}
                              loadingPosition="end"
                              endIcon={<SaveIcon />}
                              variant="contained"
                              sx={{
                                backgroundColor: "#1e2188",
                                textTransform: "initial",
                              }}
                            >
                              <span>Traiter</span>
                            </LoadingButton>
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
            ) : (
              <div className="row">
                <div className="col s12">
                  <details open>
                    <summary className="text-details">
                      Resolution de la Dénonciation
                    </summary>
                    <div className="card-alert card red lighten-5">
                      <div
                        className="card-content red-text"
                        style={{ textAlign: "center" }}
                      >
                        <ul>Vous ne pouvez pas traiter cette Dénonciation</ul>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            )}
          </div>
        );

        if (hbt.includes("H6") || addR === "PILOTE") {
          treatForm = (
            <>
              {personAffect}
              {afForm}
              {tmp}

            </>
          );
        } else {
          treatForm = (
            <>
              {personAffect}
              {tmp}

            </>
          );
        }

      } else {
        if (hbt.includes("H14") || addR !== "MOLDUE") {
          tmp = (
            <div className="row">
              <div className="col s12 pb-2">
                Dénonciation affectée à{" "}
                <span style={{ fontWeight: "bold" }}>{props.handled_by}</span> par{" "}
                {props.assigned_by} le {formatDate(props.assignedAt)}
              </div>
            </div>
          )

        } else {
          tmp = ""
        }

        if (hbt.includes("H6") || addR === "PILOTE") {
          treatForm = (
            <>
              {afForm}
              {tmp}

            </>
          );
        } else {
          treatForm = <>{tmp}</>;
        }


      }


      break;
    case "TO_APPROUVED":
      statusElt = (
        <span className="chip toApprouvedBgColor  z-depth-1">
          <span className="orange-text">A approuver</span>
        </span>
      );
      let tab = props.solution;
      // console.log("tabbbbb")

      {
        /* historique */
      }
      let historique = (
        <>
          <div className="row">
            <div className="col s12">
              <details>
                <summary className="text-details">
                  Historique de la dénonciation
                </summary>
                <div className="row">
                  <div className="col s12 df pb-2">
                    <span
                      className="chip indigo lighten-5"
                      style={{ cursor: "pointer", height: "auto" }}
                    >
                      <span className="indigo-text">Traitement en interne</span>
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

      let approuveForm = (
        <form id="claimApproveForm">
          <div className="row">
            <div className="col s12">
              <details open>
                <summary className="text-details pb-5">
                  Approbation de la dénonciation
                </summary>

                {props.solutionIdChanged(tab[0] !== undefined ? tab[0].id : "")}

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
                    //  (actif !== undefined && actif)  ?
                    <>
                      <LoadingButton
                        onClick={
                          handleDisapprove
                        }
                        className="waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
                        loading={props.etat}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{ textTransform: "initial" }}
                      >
                        <span>Désapprouver</span>
                      </LoadingButton>

                      <LoadingButton
                        onClick={
                          handleApprove
                        }
                        className="waves-effect waves-effect-b waves-light btn-small"
                        loading={props.etat2}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
                      >
                        <span>Approuver</span>
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
      );

      if (hbt.includes("H6") || addR === "PILOTE") {
        treatForm = (
          <>
            {historique}
            {approuveForm}
          </>
        );
      } else {
        treatForm = <>{historique}</>;
      }


      break;
    case "DESAPPROUVED":
      statusElt = (
        <span className="chip unApprouvedBgColor z-depth-1">
          <span className="">Désapprouvée</span>
        </span>
      );
      if (props.handled_by === user.firstAndLastName) {
        treatForm = (
          <>
            {/* historique */}
            <div className="row">
              <div className="col s12">
                <details>
                  <summary className="text-details">
                    Historique de la dénonciation
                  </summary>
                  <div className="row">
                    <div className="col s12 df pb-2">
                      <span
                        className="chip indigo lighten-5"
                        style={{ cursor: "pointer", height: "auto" }}
                      >
                        <span className="indigo-text">Traitement en interne</span>
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

            {/* retraitement */}
            {props.authorize ? (
              <form id="claimHandleAgainForm">
                <div className="row">
                  <div className="col s12">
                    <details open>
                      <summary className="text-details">
                        Retraitement de la dénonciation
                      </summary>

                      <div className="col s12 input-field">
                        <textarea
                          id="solution"
                          name="solution"
                          placeholder=""
                          className="materialize-textarea textarea-size"
                          value={props.new_solution}
                          onChange={(e) =>
                            props.newSolutionChanged(e.target.value)
                          }
                        ></textarea>
                        <label htmlFor="content" className={"active"}>
                          Solution
                          <span>
                            (<span className="red-text darken-2 ">*</span>)
                          </span>
                        </label>
                        <small className="errorTxt4">
                          <div id="cpassword-error" className="error">
                            {props.errors !== undefined
                              ? props.errors.new_solution
                              : ""}
                          </div>
                        </small>
                      </div>
                      <div className="col s12 input-field">
                        <textarea
                          id="comment"
                          name="comment"
                          placeholder=""
                          className="materialize-textarea textarea-size"
                          value={props.new_comment}
                          onChange={(e) =>
                            props.newCommentChanged(e.target.value)
                          }
                        ></textarea>
                        <label htmlFor="content" className={"active"}>
                          Commentaires/Observations
                          <span>
                            (<span className="red-text darken-2 ">*</span>)
                          </span>
                        </label>
                        <small className="errorTxt4">
                          <div id="cpassword-error" className="error">
                            {props.errors !== undefined
                              ? props.errors.new_comment
                              : ""}
                          </div>
                        </small>
                      </div>

                      <div className="col s12 display-flex justify-content-end mt-3">
                        {
                          //  (actif !== undefined && actif)  ?
                          <LoadingButton
                            onClick={handleReSolve}
                            className="waves-effect waves-effect-b waves-light btn-small"
                            loading={props.etat2}
                            loadingPosition="end"
                            endIcon={<SaveIcon />}
                            variant="contained"
                            sx={{
                              backgroundColor: "#1e2188",
                              textTransform: "initial",
                            }}
                          >
                            <span>Retraiter</span>
                          </LoadingButton>
                          // :
                          // <div className="card-alert card red lighten-5">
                          //   <div className="card-content red-text">
                          //      <ul>
                          //          Veuillez activer une licence.
                          //      </ul>
                          //   </div>
                          // </div>
                        }

                      </div>
                    </details>
                  </div>
                </div>
              </form>
            ) : (
              <div className="row">
                <div className="col s12">
                  <details open>
                    <summary className="text-details">
                      Retraitement de la dénonciation
                    </summary>
                    <div className="card-alert card red lighten-5">
                      <div
                        className="card-content red-text"
                        style={{ textAlign: "center" }}
                      >
                        <ul>Vous ne pouvez pas traiter cette dénonciation</ul>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            )}
          </>
        );
      } else {

      }
      break;
    default:
      statusElt = "";
      break;
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
  
  const [showSelectPrintItem, setShowSelectPrintItem] = useState(false);
  const [emailSender, setEmailSender] = useState([]);
  const [affectEmail, setAffectEmail] = useState("");

  let content = props.items;
  let creationDate = props.created_at ? formatDate(props.created_at) : "";

  //Ajout de l'attribut "client" afin de permettre le filtrage dans le datatable
  content.forEach((element) => {
    //status
    let statusElt;

    switch (element.status) {
      case "SAVED":
        statusElt = "A traiter";
        break;
      case "AFFECTED":
        statusElt = "Affectée";
        break;
      case "TO_APPROUVED":
        statusElt = "A approuvée";

        break;
      case "DESAPPROUVED":
        statusElt = "Désapprouvée";
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

  let btnConversion;
  if (addR === "PILOTE" && props.status === "SAVED") {
    btnConversion = (
      <>
        <LoadingButton
          onClick={() => setConfirmationOpen(true)}
          className="waves-effect waves-effect-b waves-light btn-small"
          // loading={props.etat3}
          loadingPosition="end"
          endIcon={<AutorenewIcon />}
          variant="contained"
          sx={{
            backgroundColor: "#ef6c00",
            textTransform: "initial",
            transition: "background-color 0.3s ease",
            '&:hover': {
              backgroundColor: '#fda321',
            },
          }}
        >
          <span>Convertir</span>
        </LoadingButton>
      </>
    );
  }

  let transmettre = "";
  let btnS = "";

  if (
    (props.objetLevel === "MINEUR" || props.objetLevel === "MOYEN") &&
    ((user.firstAndLastName === props.created_by &&
      props.transmitted === "false") ||
      (user.firstAndLastName === props.transmittedTo &&
        props.transmitted === "true" && addR === "MOLDUE")) &&
    props.status === "SAVED"
  ) {
    transmettre = (
      <>
        <LoadingButton
          onClick={(e) => handleModal(e)}
          className="waves-effect waves-effect-b waves-light btn-small ml-2 mb-1 mt-1"
          loading={props.etat3}
          loadingPosition="end"
          endIcon={<SendIcon />}
          variant="contained"
          sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
        >
          <span>Transmettre</span>
        </LoadingButton>
      </>
    );
  } else {
    transmettre = "";
  }

  if ((user.firstAndLastName === props.created_by && props.transmitted === "false" && props.status === "SAVED") || showJoinBtn || ((props.status === "AFFECTED" || props.status === "DESAPPROUVED") && user.firstAndLastName === props.handled_by) || (props.transmitted !== "false" && user.firstAndLastName === props.transmittedTo && props.status === "SAVED" && addR === "MOLDUE")) {

    if (props.session === "" && props.session.status !== "OPEN") {
      btnS =
        //  (actif !== undefined && actif)  ?
        <>
          <LoadingButton
            onClick={(e) => registerUser(e)}
            className="waves-effect waves-effect-b waves-light btn-small ml-2 mb-1 mt-1"
            loading={props.etat4}
            loadingPosition="end"
            endIcon={<ChatIcon />}
            variant="contained"
            sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
          >
            <span>Ouvrir une session</span>
          </LoadingButton>
        </>
      // :
      //   <div className="card-alert card red lighten-5">
      //     <div className="card-content red-text">
      //         <ul>
      //           Veuillez activer une licence.
      //         </ul>
      //     </div>
      //   </div>

    } else if (props.session !== "" && props.session.status === "OPEN") {
      btnS =
        //  (actif !== undefined && actif)  ?
        <>
          <LoadingButton
            onClick={(e) => connect()}
            className="waves-effect waves-effect-b waves-light btn-small ml-2 mb-1 mt-1"
            loading={props.etat4}
            loadingPosition="end"
            endIcon={<ChatIcon />}
            variant="contained"
            sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
          >
            <span>Rejoindre la session</span>
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

    } else if (props.session !== "" && props.session.status === "CLOSED") {
      btnS =
        //  (actif !== undefined && actif)  ?
        <>
          <LoadingButton
            onClick={(e) => connect()}
            className="waves-effect waves-effect-b waves-light btn-small"
            loading={props.etat4}
            loadingPosition="end"
            endIcon={<ChatIcon />}
            variant="contained"
            sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
          >
            <span>Voir la discussion</span>
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

    } else {
      btnS = "";
    }
  }

  // Vérifie si le dialog enfant est ouvert (présent et aria-hidden = false)
  const enfant = document.querySelector('#dialog-enfant');
  const confirmation = document.querySelector('#dialog-confirmation');
  const enfantOuvert = enfant && enfant.getAttribute('aria-hidden') !== 'true';
  const confirmationOuvert = confirmation && confirmation.getAttribute('aria-hidden') !== 'true';

  // Sélectionne tous les dialogs MUI
  const elements = document.querySelectorAll('.MuiDialog-root');

  elements.forEach(element => {
    // Ne jamais modifier l'affichage du dialog enfant lui-même
    if (['dialog-enfant', 'dialog-confirmation'].includes(element.id)) {
      return;
    }

    // Si le dialog est caché par MUI (aria-hidden="true")
    // ET que l'enfant n'est PAS ouvert → on le masque
    if (
      element.hasAttribute('aria-hidden') &&
      element.getAttribute('aria-hidden') === 'true' &&
      !enfantOuvert && !confirmationOuvert
    ) {
      element.style.display = 'none';
    } else {
      // Sinon on le laisse visible (au cas où il a été masqué avant)
      element.style.display = '';
    }
  });


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
    <div id="main">           
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

      <div className="row">
        <div className="col s12">
          <div className="container">
            <section className="tabs-vertical mt-1 section">
              <div className="row">
                <div className="col l12 s12 pb-5">
                  <div className="card-panel pb-5">
                    <div className="row">
                      <div className="col s12">
                        <h5 className="card-title">Dénonciations à traiter</h5>
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
                      // onClose={ handleClose}
                      onClose={() => {
                        // console.log("paramsdanslui", props?.match?.params?.code)
                        if (props?.match?.params?.code === "all") {
                          handleClose();
                        } else {
                          handleFerme()
                        }

                      }}
                      TransitionComponent={Transition}
                    >
                      <AppBar
                        sx={{
                          position: "relative",
                          backgroundColor: "#1e2188",
                        }}
                      >
                        <Toolbar>
                          {props?.match?.params?.code === "all" ?
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
                              <NavLink to="/alertes/denonciations"><div className="card-content"><CloseIcon /></div></NavLink>
                            </IconButton>
                          }
                          <Typography
                            sx={{ ml: 2, flex: 1 }}
                            variant="h6"
                            component="div"
                          >
                            Détails de la dénonciation
                          </Typography>
                        </Toolbar>
                      </AppBar>

                      <div className="row">
                        {/* first part */}
                        <div className="col l6 s12 pb-5" id="ficheReclamation">
                          <div className="card-panel pb-5">
                            <div className="row df align-items-center" id="ententeFiche">
                              <div className="col l6 s12" style={{ display: "flex", alignItems: "center" }}>
                                <h5 className="card-title" style={{ margin: 0 }}>
                                  Fiche de la dénonciation
                                </h5>

                                <Tooltip
                                  title={`Converti en dénonciation par ${props.convertedBy} le ${props.convertedAt}`}
                                  arrow
                                >
                                  <WarningAmber fontSize="medium" sx={{ ml: 1, color: 'orange' }} />
                                </Tooltip>
                              </div>
                              <div className="col l6 m6 s12 df justify-content-end">
                                {btnConversion}
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
                            <div className="row" id="ententeFiche">
                              <div className="row df align-items-center">
                                <h5 className="col l6 m6 s12 m-0 card-title">
                                  Détails du traitement
                                </h5>

                                {
                                  transmettre === "" || btnS === "" ?
                                    <div className="col l6 m6 s12 m-0 row">
                                      {transmettre}
                                      {btnS}
                                    </div>
                                    :
                                    <div className="col l6 m6 s12 m-0 row">
                                      {transmettre}
                                      {btnS}
                                    </div>
                                }
                              </div>
                              <div className="col s12 input-field">
                                Etat: &nbsp;{statusElt}
                              </div>
                            </div>



                            {affectForm}
                            {treatForm}
                            {tchat}
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

                    <Dialog
                      open={confirmationOpen}
                      onClose={(_, reason) => {
                        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                          handleConfirmationClose();
                        }
                      }}
                      id="dialog-confirmation"
                      disableEscapeKeyDown
                      disableBackdropClick
                      sx={{
                        '& .MuiBackdrop-root': {
                          background: 'transparent !important',
                        },
                      }}
                    >
                      <DialogTitle className="modal-title red-text text-darken-2">Confirmer la conversion de la dénoncation</DialogTitle>
                      <DialogContent>
                        <Typography gutterBottom>
                          Une fois convertie en <strong>{"suggestion"}</strong>, cette dénonciation ne pourra plus être modifiée ou restaurée.
                          Souhaitez-vous vraiment continuer ?
                        </Typography>
                                                                  
                        <div className="mt-5">
                          <div className="df justify-content-between">
                            <Button disabled={loadingConversion} onClick={() => setConfirmationOpen(false)} className="col s6" color="inherit">
                              Annuler
                            </Button>
                            <LoadingButton 
                              onClick={(e) => {
                                e.preventDefault();
                                handleSubmitConfirmation(e)
                              }}
                              className="col s6" 
                              variant="contained" 
                              color="error"
                              loading={loadingConversion}
                              loadingPosition="end"
                            >
                              <span>Confirmer</span>
                            </LoadingButton>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <EmailDialog handleSubmit={handleAssignOrReassign} maxDelai={maxDelai} />

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
    isLoading: state.claim_handle.isLoading,
    id: state.claim_handle.id,
    code: state.claim_handle.code,
    recorded_at: state.claim_handle.recorded_at,
    collect: state.claim_handle.collect,
    subject: state.claim_handle.subject,
    underSubject: state.claim_handle.underSubject,
    product: state.claim_handle.product,
    unit: state.claim_handle.unit,
    content: state.claim_handle.content,
    status: state.claim_handle.status,
    motif: state.claim_handle.motif,
    solution: state.claim_handle.solution,
    solutionId: state.claim_handle.solutionId,
    objetLevel: state.claim_handle.objetLevel,
    comment: state.claim_handle.comment,
    new_solution: state.claim_handle.new_solution,
    new_comment: state.claim_handle.new_comment,
    created_by: state.claim_handle.created_by,
    created_at: state.claim_handle.created_at,
    assigned_by: state.claim_handle.assigned_by,
    handled_at: state.claim_handle.handled_at,
    handled_by: state.claim_handle.handled_by,
    assignedAt: state.claim_handle.assignedAt,
    resolved_at: state.claim_handle.resolved_at,
    resolved_by: state.claim_handle.resolved_by,
    errors: state.claim_handle.claim_handle_errors,
    items: state.claim_handle.items,
    agents: state.claim_handle.agents,
    selectedItem: state.claim_handle.selectedItem,
    selectedFiles: state.claim_handle.selectedFiles,
    selectedItemFiles: state.claim_handle.selectedItemFiles,
    selectedItemAudio: state.claim_handle.selectedItemAudio,
    authorize: state.claim_handle.authorize,
    etat: state.claim_handle.etat,
    etat2: state.claim_handle.etat2,
    etat3: state.claim_handle.etat3,
    session: state.claim_handle.session,
    transmitted: state.claim_handle.transmitted,
    solutionExistant: state.claim_handle.solutionExistant,
    reaffect:state.claim_handle.reaffect,
    handled_message:state.claim_handle.handled_message,
    handled_delai:state.claim_handle.handled_delai,
    extras: state.claim_handle.extras,
    convertedBy: state.claim_handle.converted_by,
    convertedAt: state.claim_handle.converted_at,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loading: (err) => {
      dispatch(loading(err));
    },
    claimHandleErrors: (err) => {
      dispatch(claimHandleErrors(err));
    },
    idChanged: (id) => {
      dispatch(idChanged(id));
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
    objetLevelChanged: (objetLevel) => {
      dispatch(objetLevelChanged(objetLevel));
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
    handledByChanged: (handledBy) => {
      dispatch(handledByChanged(handledBy));
    },
    createdAtChanged: (createdAt) => {
      dispatch(createdAtChanged(createdAt));
    },
    createdByChanged: (createdBy) => {
      dispatch(createdByChanged(createdBy));
    },
    assignedByChanged: (assignedBy) => {
      dispatch(assignedByChanged(assignedBy));
    },
    assignedAtChanged: (assignedAt) => {
      dispatch(assignedAtChanged(assignedAt));
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
    authorizeChanged: (item) => {
      dispatch(authorizeChanged(item));
    },
    newSolutionChanged: (solution) => {
      dispatch(newSolutionChanged(solution));
    },
    newCommentChanged: (comment) => {
      dispatch(newCommentChanged(comment));
    },
    etatChanged: (etat) => {
      dispatch(etatChanged(etat));
    },
    selectedItemAudioChanged: (selectedItemAudio) => {
      dispatch(selectedItemAudioChanged(selectedItemAudio))
    },
    etat2Changed: (etat2) => {
      dispatch(etat2Changed(etat2));
    },
    etat3Changed: (etat3) => {
      dispatch(etat3Changed(etat3));
    },
    etat4Changed: (etat4) => {
      dispatch(etat4Changed(etat4));
    },
    sessionChanged: (session) => {
      dispatch(sessionChanged(session));
    },
    transmittedChanged: (transmitted) => {
      dispatch(transmittedChanged(transmitted));
    },
    transmittedToChanged: (transmittedTo) => {
      dispatch(transmittedToChanged(transmittedTo));
    },
    solutionExistantChanged: (solutionExistant) => {
      dispatch(solutionExistantChanged(solutionExistant));
    },
     handledShowModalChanged: (isShow) => {
      dispatch(handledShowModalChanged(isShow));
    },
     handledMessageChanged: (message) => {
      dispatch(handledMessageChanged(message));
    },
     handledDelaiChanged: (delai) => {
      dispatch(handledDelaiChanged(delai));
    },
    handledCustomMessageChanged:(close)=>{
      dispatch(handledCustomMessageChanged(close))
    },
    extrasChanged: (extra) => {
      dispatch(extrasChanged(extra));
    },
    convertedByChanged: (convertedBy) => {
      dispatch(convertedByChanged(convertedBy));
    },
    convertedAtChanged: (convertedAt) => {
      dispatch(convertedAtChanged(convertedAt));
    },
        
    setReaffect: (reaffect) => {
      dispatch(setReaffect(reaffect));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TraiterDenonciation);
