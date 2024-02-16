// Chat.js

import { Avatar, FormControl, FormControlLabel, FormLabel, IconButton, LinearProgress, Radio, RadioGroup } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import SockJS from "sockjs-client";
import { over } from "stompjs";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import {AddCircleOutline,
ChatBubble,
ChatBubbleOutlineRounded,
ChatTwoTone,
} from "@mui/icons-material";
import { notify } from '../../Utils/alert';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { HOST } from '../../Utils/globals';


const Chat = ({ guestsP, claimCode, oldMessages, members, users, user, showJoinBtn}) => {
  var stompClient = null;
  const [privateChats, setPrivateChats] = useState(new Map());
  const [publicChats, setPublicChats] = useState(oldMessages);
  const [guests, setGuests] = useState(guestsP);
  const [tab, setTab] = useState("CHATROOM");

  const [message, setMessage] = useState('');

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
  const [usersCGR, setUsersCGR] = React.useState([]);
  const maDivRef = useRef(null);


  const invitation = (event) => {
    
    let ids = (guests)?.map((e)=>{
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

  useEffect(() => {
    // if(isOpeningAction){
    //   registerUser();
    // } else {
      connect();
    // }
  
  }, []);

  const handleInvitation = (e,idi) => {
     var chatMessage = {
      userId: idi,
      claimCode: claimCode,
      status: "INVITATION",
    };
   
    // console.log("codeconnected42", idi);
    stompClient.send(
      "/api/v1/session/join/guest/" + claimCode + "",
      {},
      JSON.stringify(chatMessage)
    );
  }

  const handleEject = (e,idi) => {
     var chatMessage = {
      userId: idi,
      claimCode: claimCode,
      status: "EJECTION",
    };
   
    // console.log("codeconnected42", idi);
    stompClient.send(
      "/api/v1/session/eject/guest/" + claimCode + "",
      {},
      JSON.stringify(chatMessage)
    );
  }

  const connect = () => {
    let Sock = new SockJS(HOST+"/ws");
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
    // console.log("stomp", stompClient);
  };

  const onConnected = () => {
    setUserData({ ...userData, connected: true });
    // console.log("codeconnected", claimCode);
    // console.log("propsconect",props)
    stompClient.subscribe(
      "/topic/session/" + claimCode + "",
      onMessageReceived
    );
    // stompClient.subscribe('/'+claimCode+'/secured/session/', onPrivateMessage);

    userJoin();
  };

  const userJoin = () => {
    var chatMessage = {
      userId: user.id,
      claimCode: claimCode,
      status: "JOIN",
    };
    // setUserData({...userData,"username": user.id});
    // console.log("codeconnected4", claimCode);
    stompClient.send(
      "/api/v1/session/join/" + claimCode + "",
      {},
      JSON.stringify(chatMessage)
    );

    // setPublicChats(oldMessages);
    // setGuests(guests)
  };

  const onMessageReceived = (payload) => {
    var payloadData = JSON.parse(payload.body);
    // console.log("payloadDta", payloadData);
    switch (payloadData.status) {
      case "JOIN":
        // console.log("privee", "un");
        if (!privateChats.get(payloadData.firstAndLastName)) {
          privateChats.set(payloadData.firstAndLastName, []);
          setPrivateChats(new Map(privateChats));

          let list = oldMessages;
          // console.log("messageslist", list);
          // publicChats.push(list);
          setPublicChats((prevPublicChats) => {
            const newList = list;
            return newList;
          });
          // console.log("publicchatsjoin", publicChats);
          // list.push(payloadData);
          // privateChats.set(payloadData.senderName,list);
        }
        break;
      case "MESSAGE":
        // let list = props.session.messages;
        // list.push(payloadData);
        // console.log("message", list);
        // setPublicChats(list);
        if(publicChats !== null && publicChats.length > 0 ){
          setPublicChats((prevPublicChats) => {
            const newList = [...prevPublicChats, payloadData];
            return newList;
          });
        } else {
          setPublicChats( [payloadData]);
        }
      
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
      case "INVITATION":
        //objet
        var chatGuest = {
          id: payloadData.id,
          code: payloadData.code,
          firstAndLastName: payloadData.firstAndLastName,
        };
       
        setGuests((prevGuests) => {
          const newList = [...prevGuests, chatGuest];
          return newList;
        });

      break;
      case "EJECTION":
        // console.log("payloadEjection",payloadData)
        let nouveaux = [];
        let list = guests;
          nouveaux = list.filter((e)=>{
          return e.id !== payloadData.id;
        })
        
      //  console.log("ejection",nouveaux)
        setGuests((prevGuests) => {
          const newList = nouveaux;
          return newList;
        });

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
    // console.log("stomp error",err);
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
      var chatMessage = {
        senderId: user.id,
        content: userData.message,
        claimCode: claimCode,
        status: "MESSAGE",
      };
      // console.log(chatMessage);
      stompClient.send(
        "/api/v1/session/" + claimCode + "",
        {},
        JSON.stringify(chatMessage)
      );
      setUserData({ ...userData, message: "" });
      // console.log("msg", publicChats);
    } else {
      // console.log("errorr stomp1", stompClient);
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
          claimCode: claimCode,
          status: "MESSAGE",
          vote: true,
        };
        stompClient.send(
          "/api/v1/session/" + claimCode + "",
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
        // console.log("errorr stomp1", stompClient);
      }
    }
  };

  const handleVote = (e, info) => {
    const selectedValue = e.target.value;
    if(stompClient){
      if(selectedOption !== ""){
        //removeVote
        let voteRequest = {
          removeVote: true,
          pour: selectedValue === "POUR",
          claimCode: claimCode,
          authorId: user.id,
          messageId:  info
        }
        // console.log("voteRequest - remove", voteRequest);
  
        stompClient.send(
          "/api/v1/session/vote/" + claimCode + "",
          {},
          JSON.stringify(voteRequest)
        );
      } else {
        let voteRequest = {
          removeVote: false,
          pour: selectedValue === "POUR",
          claimCode: claimCode,
          authorId: user.id,
          messageId:  info
        }
        // console.log("voteRequest", voteRequest);
  
        stompClient.send(
          "/api/v1/session/vote/" + claimCode + "",
          {},
          JSON.stringify(voteRequest)
        );
      }
    } else {
      // console.log("errorr stomp3", stompClient);
    }
   
    

  };


  const handleShowVoteField = () => {
    setShowVoteField(!showVoteField);
  };

  const handleChooseVote = (msgId) => {
    //send
    let confirmSolution = {
      messageId: msgId,
      claimCode: claimCode
    };
    if (stompClient) {
      stompClient.send(
        "/api/v1/session/confirm-solution/" + claimCode + "",
        {},
        JSON.stringify(confirmSolution)
      ); 
    } else {
      // console.log("errorr stomp4", stompClient);
    }
  }

  const handleChooseVoteConfirm = () => {
    setShowConfirmChooseSolution(!showConfirmChooseSolution)
  }

  // useEffect(() => {
  //   console.log(userData);
  // }, [userData]);

  // useEffect(() => {
   
  //   // let coco = [];
  //   // coco = users.filter((e) => {
  //   //   return (
  //   //     (e.additionalRole !== "MEMBRE_CGR") && (e.additionalRole !== "PR_CGR")
  //   //   );
  //   // })
  //   setUsersCGR(users)
  //   console.log("coco",usersCGR)

  // }, []);

  // useEffect(() => {
  //    // console.log(publicChats);
  //    if (bottomRef.current) {
  //     bottomRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [publicChats]);

  // useEffect(() => {
  //   // setGuests(props?.session?.guests)
  // }, [guests]);



  // console.log("test chat", oldMessages)

  // console.log("test chat", userData.connected)

  return (
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
                {members?.map((member) => (
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
                        <IconButton   onClick={(e) => handleEject(e,guest.id)} color="primary" aria-label="Ajouter"  style={{marginLeft: "auto"}}>
                          <RemoveCircleOutlineIcon/>
                        </IconButton>
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
                        {claimCode}
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
};

export default Chat;
