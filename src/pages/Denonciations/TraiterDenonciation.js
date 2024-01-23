import React, { useEffect, useState, useRef } from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import Select from "react-select";
import { Link, NavLink } from "react-router-dom";
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
} from "../../redux/actions/Reclamations/TraitementReclamationActions";
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
} from "../../Utils/utils";
import { connect } from "react-redux";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
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
import { Avatar, FormControl, FormControlLabel, FormLabel, LinearProgress, Radio, RadioGroup } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { affectDenunciationApi, approveDenunciationSolutionApi, getFillesApi, listeTreat, transmissionDenunciationApi, treatDenunciationApi, unapproveDenunciationSolutionApi } from "../../apis/Denonciations/DenonciationsApi";
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

  //#darrell
  const [usersCGR, setUsersCGR] = React.useState([]);

  
  //vérification if user is in guest
  let showJoinBtn = false;
  let potentialGuest = props.session?.guests?.filter((e) => e.id === user.id);
  if(potentialGuest != null && potentialGuest.length > 0 ){
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
   
    // let coco = [];
    // coco = users.filter((e) => {
    //   return (
    //     (e.additionalRole !== "MEMBRE_CGR") && (e.additionalRole !== "PR_CGR")
    //   );
    // })
    setUsersCGR(users)
    // console.log("coco",usersCGR)

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


  const handleClickOpen = () => {
    setOpen(true);
  };
  const history = useHistory();
  const handleClose = () => {
    setOpen(false);
    history.push("/denonciations/traitement/all");
  };

  const { id } = useParams();
  //console.log("params",props.match)

  useEffect(() => {
    if (props.match.params.code==="all") {
      listeTreat(props).then((r) => {});
    } else {

      async function details(){
        await axios({
          method: "get",
          url: HOST + "api/v1/denunciation/"+props.match.params.code+"/details",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
          },
        }).then(function (response) {
          listeTreat(props).then((r) => {});
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
              }else{
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
              }else{
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
              }else{
                props.authorizeChanged(false)
              }
              break;
      
            default:
              break;
          }
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

  const invitation = (event) => {
    
    let ids = (props?.session?.guests)?.map((e)=>{
      return e.id;
    })
   
    let princ = users.filter((e) => {
      return (
        (e.additionalRole !== "MEMBRE_CGR") && (e.additionalRole !== "PR_CGR") && !ids.includes(e.id)
      );
    })
   
    const { value } = event.target;
    if (value !=="") {
      let coco = []
      coco = princ.filter((e) => {
        return (
          ((e.firstAndLastName).includes(value)) 
        );
      })

      setUsersCGR((prevList) => {
        const newList = coco;
        return newList;
      });

      // setUsersCGR(coco)
      if (usersCGR.length!==0) {
        maDivRef.current.style.display = "block"
      } else{
        setUsersCGR((prevList) => {
          const newList = coco;
          return princ;
        });
        // setUsersCGR(princ)
        maDivRef.current.style.display = "none"
      }
      // console.log("cg",usersCGR)
    } else {
      maDivRef.current.style.display = "none"
    }
    
    // console.log("valeur",value)
  }

  const handleInvitation = (e,idi) => {
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

  const handleEject = (e,idi) => {
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
    let Sock = new SockJS("http://192.168.100.6:8080/ws");
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
            if(prevPublicChats=== undefined || prevPublicChats === null){
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
          if(prevGuests === undefined){
            return [chatGuest]
          }
          let prevG = prevGuests.filter((e) => {
            return e.id !== chatGuest.id
          })
          if(prevG === null || prevG === undefined){
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
        if(list === undefined){
          setGuests([]);
        } else {
          nouveaux = list.filter((e)=>{
            return e.id !== payloadData.id;
          })
          
        //  console.log("ejection",nouveaux)
          setGuests((prevGuests) => {
            if(prevGuests === undefined){
              return [nouveaux]
            }
            const newList = nouveaux;
            return newList;
          });
        }
        // console.log("condition", payloadData.id === user.id)
        // console.log("condition 2", payloadData.id == user.id)
        if(payloadData.id === user.id){
          notify("Un membre du CGR vous a éjecté", "info");
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }

      break;
      case "CONFIRME_SOLUTION":
        notify("Bravo - Réclamation traitée", "success");
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
    if(selectedOption !== ""){
      //removeVote
      let voteRequest = {
        removeVote: true,
        pour: selectedValue === "POUR",
        claimCode: props.code,
        authorId: user.id,
        messageId:  info
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
        messageId:  info
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
    if(stompClient){
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
    let isValid = true;

    if (
      props.solution === "" ||
      props.solution === undefined ||
      props.solution === null
    ) {
      isValid = false;
      errors["solution"] = "Champ incorrect";
    }
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

  const handleReValidation = () => {
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
                  <div className="card-content red-text ml-4"><MoveUpIcon/></div>
                </div>
                
              </>
                
              );
            }else{
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
        }else{
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
        }else{
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
        }else{
          props.authorizeChanged(false)
        }
        break;

      default:
        break;
    }
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
    //fetch attachments for selected claim
    getFillesApi(data.id, props);
    props.sessionChanged(data.session !== null ? data.session : "");
  };

  /*tchat */
  let tchat;
  if ( (addR === "MEMBRE_CGR" || addR === "PR_CGR" || showJoinBtn)) {
    tchat = (
      <>
        {userData.connected ? (
          <div className="containera clearfix mt-5">
          
            <div class="people-list" id="people-list">
            { !showJoinBtn ? 
              <div class="search">
                <input type="text" placeholder="search" onChange={invitation} />
              </div> : null}
              <div id="listI" ref={maDivRef} style={{display:"none" }}>
               
                <ul class="list">
                  <label className="text-xl mb-2" style={{color: "white", fontSize: "18px", fontWeight: "600"}}>A Inviter</label>
                  
                  {usersCGR.map((member) => (
                    <>
                        <li class="clearfix" key={member.id} style={{ display: "flex", verticalAlign: "center"}}>
                          <Avatar sx={{ width: 40, height: 40,backgroundColor:"#1E2188" }}>{member.firstAndLastName[0]}</Avatar>
                          
                          <div class="about" style={{ marginTop: "0px" }}>
                            <div class="name">{member.firstAndLastName}</div>
                            <div class="" style={{ fontSize:"10px" }}>
                              {member.posteDto.libelle}
                            </div>
                          </div>
                          <IconButton   onClick={(e) => handleInvitation(e,member.id)} color="primary" aria-label="Ajouter"  style={{marginLeft: "auto"}}>
                            <AddCircleOutline/>
                          </IconButton>
                        </li>
                    </>
                  
                  ))}
                  
                </ul>
              </div>
             
              <ul class="list">
                <label className="text-xl mb-4" style={{color: "white", fontSize: "18px", fontWeight: "600"}}>Membres</label>
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
                        <div className="name text-bold">
                          {member.firstAndLastName}
                        </div>
                        {/* <div className="status">
                            <i className="fa fa-circle online"></i> online
                          </div> */}
                      </div>
                    </li>
                  </>
                ))}
                <div className="d-flex">
                  <label className="text-xl" style={{color: "white", fontSize: "18px", fontWeight: "600"}}>Invité(s)</label>
                </div>

                {guests !== null && (guests)?.length > 0 && guests.at(0).firstAndLastName != null ? (
                  <>

                    {(guests)?.map((guest) => (
                      <li className="clearfix" key={guest.id} style={{ display: "flex", verticalAlign: "center" }}>
                        <Avatar sx={{width: 48, height: 48, backgroundColor: "#1E2188",}}>
                          {guest !== null && guest.firstAndLastName != null && guest?.firstAndLastName[0]}
                        </Avatar>

                        <div className="about" style={{ marginTop: "9.5px" }}>
                          <div className="name text-bold">
                          {guest?.firstAndLastName}
                          </div>
                          {/* <div className="status">
                              <i className="fa fa-circle online"></i> online
                            </div> */}
                        </div>
                        { !showJoinBtn ?
                        <IconButton   onClick={(e) => handleEject(e,guest.id)} color="primary" aria-label="Ajouter"  style={{marginLeft: "auto"}}>
                        <RemoveCircleOutlineIcon/>
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
                      { !showJoinBtn ? 
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
                                      <div className="row" style={{display: "grid", justifyContent:"end"}}>
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

                                      <FormControl component="fieldset" style={{  width: "100%"}}>
                                        <FormLabel component="legend" className="text-white text-md text" style={{ color:"white" }}>
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
                                          })[0]?.voteType+""}
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
                                            style={{  color: "white", borderColor: "white"}}
                                          />
                                          <div>
                                          <LinearProgress
                                            variant="determinate" 
                                            color="success"
                                            value={((chat?.voteDto?.userVote).filter((e) => {
                                           
                                              return e.voteType === "POUR" 
                                           }).length /((chat?.voteDto?.userVote).filter((e) => {
                                           
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
                                            }}/>}
                                            label="Contre"
                                            style={{  color: "white", borderColor: "white"}}
                                          />
                                          <div>
                                          <LinearProgress
                                            variant="determinate"  color="success"
                                            value={((chat?.voteDto?.userVote).filter((e) => {
                                           
                                              return e.voteType === "CONTRE" 
                                           }).length /((chat?.voteDto?.userVote).filter((e) => {
                                           
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
                                         <div style={{marginLeft: "auto", marginRight: "auto" , display: "grid"}}>
                                          {showConfirmChooseSolution ? 
                                          <div style={{ display: "flex", justifyContent: "space-evenly"}}>
                                            <label style={{ fontSize: "16px", fontWeight: "bold", color: "white" }}>Poursuivre ? </label>
                                            <button  onClick={handleChooseVoteConfirm} className="" style={{
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
                                            <button  onClick={(e) => handleChooseVote(chat.id)} className="" style={{
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
                                            <button  onClick={handleChooseVoteConfirm} className="" style={{
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
                                       </>  : null }
                                     
                                    
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
                                    <div className="row" style={{display: "grid", justifyContent:"end"}}>
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

                                      <FormControl component="fieldset"  style={{  width: "100%"}}>
                                        <FormLabel component="legend" className="text-white text-md text" style={{ color:"white" }}>
                                          Que votez-vous pour cette proposition
                                          ?
                                        </FormLabel>
                                        <RadioGroup
                                          aria-label="vote"
                                          name="vote-options"
                                          value={(chat?.voteDto?.userVote).filter((e) => {
                                            // console.log("filter", e.author.id === user.id  );
                                             return e.author.id === user.id 
                                          })[0]?.voteType+""}
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
                                            style={{  color: "white", borderColor: "white"}}
                                          />
                                          <div>
                                          <LinearProgress
                                            variant="determinate"   color="success"
                                            value={((chat?.voteDto?.userVote).filter((e) => {
                                           
                                              return e.voteType === "POUR" 
                                           }).length /((chat?.voteDto?.userVote).filter((e) => {
                                           
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
                                            }}/>}
                                            label="Contre"
                                            style={{  color: "white", borderColor: "white"}}
                                          />
                                          <div>
                                          <LinearProgress
                                            variant="determinate"  color="success"
                                            value={((chat?.voteDto?.userVote).filter((e) => {
                                           
                                              return e.voteType === "CONTRE" 
                                           }).length /((chat?.voteDto?.userVote).filter((e) => {
                                           
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
                                         <div style={{marginLeft: "auto", marginRight: "auto" , display: "grid"}}>
                                         {showConfirmChooseSolution ? 
                                          <div style={{ display: "flex", justifyContent: "space-evenly"}}>
                                            <label style={{ fontSize: "16px", fontWeight: "bold", color: "white" }}>Poursuivre ? </label>
                                            <button  onClick={handleChooseVoteConfirm} className="" style={{
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
                                            <button  onClick={(e) => handleChooseVote(chat.id)} className="" style={{
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
                                            <button  onClick={handleChooseVoteConfirm} className="" style={{
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
                                       </>  : null }
                                     
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
  if ((props.solution).length!==0 ) {
   
    if (props.status === "TO_APPROUVED" || props.status === "DESAPPROUVED") {
      // console.log("abcde",props.status)
      let index=0;
      let solutions = Array.from(props.solution) ;
      let couleurs =["#333300","#00cc00","#99003d","#3333ff","#666666","#253858","#00875A","#36B37E","#FFC400","#FF8B00","#FF5630","#5243AA","#0052CC","#00B8D9"]
      
      if (solutions.length !==0) {
        details=(
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
                            Bénéficiaire {degre} : mesurée par {solution.satisfactionMeasureDto.measurer.firstAndLastName} le {formatDate(solution.satisfactionMeasureDto.measureDateTime)}
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
                          <div>{solution.motifDesaprobation !== null ? solution.motifDesaprobation:""}</div>
                        </div>
                      </div>
                      <div>
                        <span className="chip2" style={{ backgroundColor:fond }}>
                          <span className="hero">
                            Désapprouvée par {solution.unApprouver !== null ? solution.unApprouver.firstAndLastName:""} le {formatDate(solution.unApprouvedAt)}
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
    
  } else if ((props.solution).length===0 ) { 
    details="Cette dénonciation est en attente de traitement";
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

    return isValid;
  };
  const handleAssign = (e) => {
    e.preventDefault();
    if (handleValidationForAssign()) {
      let claim = {};
      // console.log(props.code);

      claim["claimId"] = props.id;
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

  const handleSolve = (e) => {
    e.preventDefault();
    // if (handleValidation()) {
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
    // } else {
    // }
    props.claimHandleErrors(errors);
  };

  const handleReSolve = (e) => {
    e.preventDefault();
    if (handleReValidation()) {
      let claim = {};
      claim["claimId"] = props.id;
      claim["treatorId"] = user.id;
      claim["solution"] = props.new_solution
      claim["commentaire"] = props.new_comment
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
  let affectForm
  let treatForm
  switch (props.status) {
    case "SAVED":
      let solutions = props.selectedItem?.objet?.existingSolutions;

      let solutionsListe = solutions?.map((solution, index) => {
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

      if (hbt.includes("H6") || addR === "PILOTE") {
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
                     
                      <LoadingButton
                        onClick={(e) => {
                          e.preventDefault();
                          if (handleValidationForAssign()) {
                            //setShowSelectPrintItem(true);
                            handleAssign(e);
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
          </>
        );
      }else{
        affectForm=""
      }

      if (hbt.includes("H2","H3","H4") ) {
        treatForm = (
          <>
            
            
            {/* {solutionsListe} */}
            {props.authorize ? (
              <>
                {solutionsListe !== undefined && solutionsListe.length !==0 ? 
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
                :""}

                <form id="claimHandleForm">
                  <div className="row">
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
                  </div>
                </form>

                <div className="col s12 display-flex justify-content-end">
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
                </div>
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
      }else{
        treatForm=""
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

      if (props.handled_by === user.firstAndLastName) {
        treatForm = (
          <div className="row">
            {/* details affectation */}
            <div className="col s12 pb-2">
              Réclamation affectée à{" "}
              <span style={{ fontWeight: "bold" }}>{props.handled_by}</span> par{" "}
              {props.assigned_by} le {formatDate(props.assignedAt)}
            </div>
  
            {/* resolution */}
            {props.authorize ? (
              <form id="claimHandleAgainForm">
                <div className="row">
                  <div className="col s12">
                    <details open>
                      <summary className="text-details">
                        Traitement de la dénonciation
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
          </div>
        );
      } else {
        if (hbt.includes("H14") || addR !== "MOLDUE") {
          treatForm = (
            <div className="row">
              <div className="col s12 pb-2">
                Réclamation affectée à{" "}
                <span style={{ fontWeight: "bold" }}>{props.handled_by}</span> par{" "}
                {props.assigned_by} le {formatDate(props.assignedAt)}
              </div>
            </div>
          )
        }else{
          treatForm=""
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
                        sx={{textTransform:"initial" }}
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
                        sx={{ backgroundColor:"#1e2188",textTransform:"initial" }}
                      >
                          <span>Approuver</span>
                      </LoadingButton>
                  </>
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
                      <a href={attachment.url}>Télécharger</a>
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
      <div className="col s12 app-file-content grey lighten-4">
        <span className="app-file-label">Fichiers joints</span>
        <div className="row app-file-recent-access mb-3">
          {attachmentListChild}
        </div>
      </div>
    );
  } else {
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

  
  let transmettre="";

  if ((props.objetLevel === "MINEUR" && user.firstAndLastName === props.created_by &&
  addR === "MOLDUE") ) {
    transmettre = 
    <>
      <LoadingButton
        onClick={(e) => handleModal(e)}
        className="waves-effect waves-effect-b waves-light btn-small"
        loading={props.etat3}
        loadingPosition="end"
        endIcon={<SendIcon />}
        variant="contained"
        sx={{ backgroundColor:"#1e2188",textTransform:"initial" }}
      >
          <span>Transmettre</span>
      </LoadingButton>
    </>
  } else if (addR === "MEMBRE_CGR" || addR === "PR_CGR" || showJoinBtn) {
    if (props.session === "" && props.session.status !== "OPEN") {
      transmettre = (
        <>
          <LoadingButton
            onClick={(e) => registerUser(e)}
            className="waves-effect waves-effect-b waves-light btn-small"
            loading={props.etat4}
            loadingPosition="end"
            endIcon={<ChatIcon />}
            variant="contained"
            sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
          >
            <span>Ouvrir une session</span>
          </LoadingButton>
        </>
      );
    } else if (props.session !== "" && props.session.status === "OPEN" ) {
      transmettre = (
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
            <span>Rejoindre la session</span>
          </LoadingButton>
        </>
      );
    } else if (props.session !== "" && props.session.status === "CLOSED") {
      transmettre = (
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
      );
    } else {
      transmettre = "";
    } 
  } else {
    transmettre="";
  }

  // Sélectionnez tous les éléments avec la classe spécifiée
  const elements = document.querySelectorAll('.MuiDialog-root');

  // Parcourez la liste d'éléments
  elements.forEach(element => {
      // Vérifiez si l'élément n'a pas l'attribut aria-hidden="true"
      if (element.hasAttribute('aria-hidden') || element.getAttribute('aria-hidden') === 'true') {
          // Masquez l'élément en définissant son style sur "none"
          element.style.display = 'none';
      }
  });
  

 
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
                            Détails de la dénonciation
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
                                  Fiche de la dénonciation
                                </h5>
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
                                      <div className="df pb-2">
                                        <RecordVoiceOverIcon sx={{ mr: 2 }} />{" "}
                                        Contenu
                                      </div>
                                      <div>{props.content}</div>
                                    </div>
                                    <div className="mt-5">{attachmentList}</div>

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
                                  style={{ justifyContent: "space-between" }}
                                >
                                  Détails du traitement
                                  
                                  {transmettre}
                                </h5>
                              </div>
                            </div>
                           
                            <div className="col s12 input-field">
                              Etat: &nbsp;{statusElt}
                            </div>
                            
                            {affectForm}
                            {treatForm}
                            {tchat}
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
    authorize: state.claim_handle.authorize,
    etat: state.claim_handle.etat,
    etat2: state.claim_handle.etat2,
    etat3: state.claim_handle.etat3,
    session: state.claim_handle.session,
    solutionExistant: state.claim_handle.solutionExistant,
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
    solutionExistantChanged: (solutionExistant) => {
      dispatch(solutionExistantChanged(solutionExistant));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TraiterDenonciation);
