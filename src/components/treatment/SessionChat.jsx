import React from "react";
import { Avatar, FormControl, FormControlLabel, FormLabel,
  LinearProgress, Radio, RadioGroup } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { AddCircleOutline } from "@mui/icons-material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import { ChatBubbleOutlineRounded } from "@mui/icons-material";

/**
 * Session collaborative chat panel.
 * Rendered only when the user has already joined (showJoinBtn = true).
 *
 * Props:
 *  Data:
 *    session, user, userData, publicChats, guests
 *    codeClient, isCreator, isUserOpenSession, availableToInvite
 *    showVoteField, showConfirmChooseSolution
 *    propositionSolution, propositionCommentaire
 *    propositionSolutionError, propositionCommentaireError
 *    maDivRef, bottomRef
 *  Handlers (all from useWebSocketSession or parent):
 *    onSearchInvite, onInvite, onEject
 *    onMessage, onSend
 *    onToggleVoteField
 *    onPropositionSolution, onPropositionCommentaire, onSendVote
 *    onVote, onChooseVote, onChooseVoteConfirm
 */
const SessionChat = ({
  session, user, userData, publicChats, guests,
  codeClient, isCreator, isUserOpenSession, availableToInvite,
  showVoteField, showConfirmChooseSolution,
  propositionSolution, propositionCommentaire,
  propositionSolutionError, propositionCommentaireError,
  maDivRef, bottomRef,
  onSearchInvite, onInvite, onEject,
  onMessage, onSend,
  onToggleVoteField,
  onPropositionSolution, onPropositionCommentaire, onSendVote,
  onVote, onChooseVote, onChooseVoteConfirm,
}) => {
  if (!userData?.connected) return null;

  const voteCount = (votes, type) =>
    (votes ?? []).filter((v) => v.voteType === type).length;

  const votePercent = (votes, type) => {
    const pour = voteCount(votes, "POUR");
    const contre = voteCount(votes, "CONTRE");
    const total = pour + contre;
    if (!total) return 0;
    return (voteCount(votes, type) / total) * 100;
  };

  const VoteMessage = ({ chat }) => {
    const votes = chat?.voteDto?.userVote ?? [];
    const myVote = votes.find((v) => v.author.id === user.id)?.voteType + "";
    const pourWins = voteCount(votes, "POUR") > voteCount(votes, "CONTRE");

    return (
      <div className="message other-message float-right">
        <div className="row" style={{ display: "grid", justifyContent: "end" }}>
          <HowToVoteIcon />
        </div>
        <div>
          <blockquote>
            <p><strong>Solution :</strong> {JSON.parse(chat.content).contenu}</p>
          </blockquote>
          <blockquote>
            <p><strong>Commentaire :</strong> {JSON.parse(chat.content).commentaire}</p>
          </blockquote>
        </div>

        <FormControl component="fieldset" style={{ width: "100%" }}>
          <FormLabel component="legend" style={{ color: "white" }}>
            Que votez-vous pour cette proposition ?
          </FormLabel>
          <RadioGroup
            aria-label="vote"
            name="vote-options"
            value={myVote}
            onChange={(e) => onVote(e, chat.id)}
          >
            {["POUR", "CONTRE"].map((type) => (
              <React.Fragment key={type}>
                <FormControlLabel
                  value={type}
                  control={<Radio sx={{ "& .MuiSvgIcon-root": { display: "none" } }} />}
                  label={type === "POUR" ? "Pour" : "Contre"}
                  style={{ color: "white", borderColor: "white" }}
                />
                <div>
                  <LinearProgress
                    variant="determinate"
                    color="success"
                    value={votePercent(votes, type)}
                  />
                  <p>{voteCount(votes, type)} vote(s)</p>
                </div>
              </React.Fragment>
            ))}
          </RadioGroup>
        </FormControl>

        {pourWins && (
          <>
            <hr style={{ borderColor: "white" }} />
            <div style={{ marginLeft: "auto", marginRight: "auto", display: "grid" }}>
              {showConfirmChooseSolution && isUserOpenSession ? (
                <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                  <label style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
                    Poursuivre ?
                  </label>
                  <button onClick={onChooseVoteConfirm} style={btnStyle("black", "transparent", 6)}>
                    Non
                  </button>
                  <button onClick={() => onChooseVote(chat.id)} style={btnStyle("white", "transparent")}>
                    Oui
                  </button>
                </div>
              ) : (
                isUserOpenSession && (
                  <button onClick={onChooseVoteConfirm} style={btnStyle("white", "transparent")}>
                    Utiliser comme solution
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="row containera clearfix mt-5">
      {/* ── People list ───────────────────────────────────────────── */}
      <div className="people-list" id="people-list">
        {isCreator && (
          <div className="search">
            <input type="text" placeholder="Rechercher" onChange={onSearchInvite} />
          </div>
        )}

        {/* Available to invite */}
        <div id="listI" ref={maDivRef} style={{ display: "none" }}>
          <ul className="list">
            <label style={{ color: "white", fontSize: 18, fontWeight: 600 }}>
              A Inviter
            </label>
            {availableToInvite.map((member) => (
              <li key={member.id} className="clearfix" style={{ display: "flex", verticalAlign: "center" }}>
                <Avatar sx={{ width: 40, height: 40, backgroundColor: "#1E2188" }}>
                  {member.firstAndLastName[0]}
                </Avatar>
                <div className="about" style={{ marginTop: 0 }}>
                  <div className="name nameToInvite">
                    <span>{member.firstAndLastName}</span>
                  </div>
                  <div style={{ fontSize: 10 }}>{member.posteDto.libelle}</div>
                </div>
                <IconButton
                  onClick={(e) => onInvite(e, member.id)}
                  color="primary"
                  aria-label="Ajouter"
                  style={{ marginLeft: "auto" }}
                >
                  <AddCircleOutline />
                </IconButton>
              </li>
            ))}
          </ul>
        </div>

        {/* Members */}
        <ul className="list">
          <label style={{ color: "white", fontSize: 18, fontWeight: 600, marginBottom: 16, display: "block" }}>
            Membres
          </label>
          {session?.members?.map((member) => (
            <li key={member.id} className="clearfix" style={{ display: "flex", verticalAlign: "center" }}>
              <Avatar sx={{ width: 48, height: 48, backgroundColor: "#1E2188" }}>
                {member.firstAndLastName[0]}
              </Avatar>
              <div className="about" style={{ marginTop: 9.5 }}>
                <div className="name nameToInvite text-bold">
                  <span>{member.firstAndLastName}</span>
                </div>
              </div>
            </li>
          ))}

          <div className="d-flex">
            <label style={{ color: "white", fontSize: 18, fontWeight: 600 }}>
              Invité(s)
            </label>
          </div>

          {guests?.length > 0 && guests[0].firstAndLastName != null ? (
            guests.map((guest) => (
              <li key={guest.id} className="clearfix" style={{ display: "flex", verticalAlign: "center" }}>
                <Avatar sx={{ width: 48, height: 48, backgroundColor: "#1E2188" }}>
                  {guest?.firstAndLastName?.[0]}
                </Avatar>
                <div className="about" style={{ marginTop: 9.5 }}>
                  <div className="name nameToInvite text-bold">
                    <span>{guest?.firstAndLastName}</span>
                  </div>
                </div>
                {isUserOpenSession && (
                  <IconButton
                    onClick={(e) => onEject(e, guest.id)}
                    color="primary"
                    aria-label="Éjecter"
                    style={{ marginLeft: "auto" }}
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                )}
              </li>
            ))
          ) : null}
        </ul>
      </div>

      {/* ── Chat panel ───────────────────────────────────────────── */}
      <div>
        <div className="chat">
          {/* Header */}
          <div
            className="chat-header clearfix"
            style={{
              display: "flex", verticalAlign: "center",
              paddingLeft: 20, paddingRight: 20,
              paddingTop: 0, paddingBottom: 0,
              boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Avatar sx={{ width: 48, height: 48, backgroundColor: "#1E2188", marginTop: "auto", marginBottom: "auto" }}>
              <ChatBubbleOutlineRounded />
            </Avatar>
            <div className="chat-about mt-0">
              <div className="chat-with text-uppercase">Session</div>
              <label className="text-md text-secondary">{codeClient}</label>
              <div className="chat-num-messages text-sm">
                {publicChats?.length ?? "Aucun"} message(s)
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              {isCreator && (
                <IconButton onClick={onToggleVoteField}>
                  <HowToVoteIcon />
                </IconButton>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="chat-history">
            <ul>
              {publicChats?.map((chat) => (
                <React.Fragment key={chat.id}>
                  {chat.sender.id === user.id ? (
                    chat.vote ? (
                      <li className="clearfix">
                        <div className="message-data align-right">
                          <span className="message-data-time">{chat.createdAt}</span>
                          &nbsp;&nbsp;
                          <span className="message-data-name">{chat.sender.firstAndLastName}</span>
                        </div>
                        <VoteMessage chat={chat} />
                      </li>
                    ) : (
                      <li className="clearfix">
                        <div className="message-data align-right">
                          <span className="message-data-time">{chat.createdAt}</span>
                          &nbsp;&nbsp;
                          <span className="message-data-name">{chat.sender.firstAndLastName}</span>
                        </div>
                        <div className="message other-message float-right">
                          {chat.content}
                        </div>
                      </li>
                    )
                  ) : (
                    chat.vote ? (
                      <li key={chat.id}>
                        <div className="message-data">
                          <span className="message-data-name">{chat.sender.firstAndLastName}</span>
                          <span className="message-data-time">{chat.createdAt}</span>
                        </div>
                        <VoteMessage chat={chat} />
                      </li>
                    ) : (
                      <li key={chat.id}>
                        <div className="message-data">
                          <span className="message-data-name">{chat.sender.firstAndLastName}</span>
                          <span className="message-data-time">{chat.createdAt}</span>
                        </div>
                        <div className="message my-message">{chat.content}</div>
                      </li>
                    )
                  )}
                </React.Fragment>
              ))}
            </ul>
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="chat-message clearfix">
            {showVoteField ? (
              <>
                <textarea
                  placeholder="Entrez la solution"
                  value={propositionSolution}
                  onChange={onPropositionSolution}
                  rows="3"
                  className="mb-4"
                  style={{ background: "#f0f0f0 !important", color: "black" }}
                />
                <div className="error">{propositionSolutionError}</div>
                <textarea
                  placeholder="Entrez son commentaire"
                  value={propositionCommentaire}
                  onChange={onPropositionCommentaire}
                  rows="2"
                  className="bg-secondary"
                  style={{ background: "#f0f0f0 !important", color: "black" }}
                />
                <div className="error">{propositionCommentaireError}</div>
              </>
            ) : (
              <textarea
                placeholder="Entrez votre message"
                value={userData.message}
                onChange={onMessage}
                rows="3"
              />
            )}

            <div>
              {showVoteField && (
                <button
                  onClick={onToggleVoteField}
                  className="btn btn-secondary ml-4"
                  style={btnStyle("white", "gray", 0, true)}
                >
                  Annuler
                </button>
              )}
              <button
                onClick={showVoteField ? onSendVote : onSend}
                className="btn btn-primary"
                style={btnStyle("white", "#84cd3e")}
              >
                {showVoteField ? "Soumettre pour vote" : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const btnStyle = (color, bg, marginRight = 0, float = false) => ({
  float: float ? "right" : undefined,
  color,
  fontSize: 16,
  textTransform: "uppercase",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  backgroundColor: bg,
  marginRight: marginRight || undefined,
});

export default SessionChat;
