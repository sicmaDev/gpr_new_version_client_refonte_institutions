import { useRef, useState } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { HOST } from "../Utils/globals";
import { notify } from "../Utils/alert";

/**
 * Manages a STOMP/SockJS WebSocket session for collaborative claim treatment.
 *
 * @param {{ code: string, claimId: number, session: object, user: object }} params
 */
const useWebSocketSession = ({ code, claimId, session, user }) => {
  const stompClientRef = useRef(null);

  const [userData, setUserData] = useState({
    username: "",
    receivername: "",
    connected: false,
    message: "",
  });
  const [publicChats, setPublicChats] = useState([]);
  const [guests, setGuests] = useState([]);

  const [propositionSolution, setPropositionSolution] = useState("");
  const [propositionCommentaire, setPropositionCommentaire] = useState("");
  const [propositionSolutionError, setPropositionSolutionError] = useState("");
  const [propositionCommentaireError, setPropositionCommentaireError] = useState("");
  const [showVoteField, setShowVoteField] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  // ── Internal helpers ──────────────────────────────────────────────────────

  const safeSend = (destination, headers, body) => {
    const client = stompClientRef.current;
    if (client && client.connected) {
      try {
        client.send(destination, headers, body);
      } catch (e) {
        console.error("STOMP send error:", e);
      }
    }
  };

  const onMessageReceived = (payload) => {
    const payloadData = JSON.parse(payload.body);
    switch (payloadData.status) {
      case "JOIN":
        break;
      case "MESSAGE":
        setPublicChats((prev) => {
          if (!prev) return [payloadData];
          return [...prev, payloadData];
        });
        break;
      case "VOTE":
        setPublicChats(() => payloadData.messages);
        break;
      case "INVITATION": {
        const chatGuest = {
          id: payloadData.id,
          code: payloadData.code,
          firstAndLastName: payloadData.firstAndLastName,
        };
        setGuests((prev) => {
          if (!prev) return [chatGuest];
          const filtered = prev.filter((g) => g.id !== chatGuest.id);
          return [...filtered, chatGuest];
        });
        break;
      }
      case "EJECTION": {
        const list = session?.guests;
        if (!list) {
          setGuests([]);
        } else {
          const filtered = list.filter((g) => g.id !== payloadData.id);
          setGuests(() => filtered);
        }
        if (payloadData.id === user.id) {
          notify("Un membre du CGR vous a éjecté", "info");
          setTimeout(() => window.location.reload(), 3000);
        }
        break;
      }
      case "CONFIRME_SOLUTION":
        notify("Bravo - Réclamation traitée", "success");
        setTimeout(() => window.location.reload(), 3000);
        break;
      default:
        break;
    }
  };

  const userJoin = () => {
    const chatMessage = {
      userId: user.id,
      claimCode: code,
      status: "JOIN",
    };
    safeSend("/api/v1/session/join/" + code, {}, JSON.stringify(chatMessage));
    setPublicChats(session?.messages || []);
    setGuests(session?.guests || []);
  };

  const onConnected = () => {
    const client = stompClientRef.current;
    setUserData((prev) => ({ ...prev, connected: true }));
    try {
      client.subscribe("/topic/session/" + code, onMessageReceived);
    } catch (e) {
      console.error("STOMP subscribe error:", e);
      return;
    }
    userJoin();
  };

  const onError = (err) => {
    console.error("STOMP error:", err);
  };

  // ── Public API ────────────────────────────────────────────────────────────

  const connect = () => {
    if (userData.connected || stompClientRef.current?.connected) return;
    const Sock = new SockJS(HOST + "ws");
    const localClient = over(Sock);
    stompClientRef.current = localClient;
    localClient.connect(
      {},
      () => {
        if (stompClientRef.current !== localClient) return;
        onConnected();
      },
      onError
    );
  };

  const disconnect = () => {
    const client = stompClientRef.current;
    if (client) {
      try { client.disconnect(); } catch (_) {}
      stompClientRef.current = null;
    }
    setUserData((prev) => ({ ...prev, connected: false }));
    setPublicChats([]);
    setGuests([]);
  };

  const handleMessage = (event) => {
    setUserData((prev) => ({ ...prev, message: event.target.value }));
  };

  const sendValue = () => {
    if (!userData.message) return;
    const chatMessage = {
      senderId: user.id,
      content: userData.message,
      claimCode: code,
      status: "MESSAGE",
    };
    safeSend("/api/v1/session/" + code, {}, JSON.stringify(chatMessage));
    setUserData((prev) => ({ ...prev, message: "" }));
  };

  const sendVote = () => {
    if (!propositionCommentaire || !propositionSolution) {
      if (!propositionCommentaire)
        setPropositionCommentaireError("Veuillez renseigner la proposition de commentaire");
      if (!propositionSolution)
        setPropositionSolutionError("Veuillez renseigner la proposition de solution");
      return;
    }
    const content = JSON.stringify({ contenu: propositionSolution, commentaire: propositionCommentaire });
    const chatMessage = { senderId: user.id, content, claimCode: code, status: "MESSAGE", vote: true };
    safeSend("/api/v1/session/" + code, {}, JSON.stringify(chatMessage));
    setPropositionCommentaire("");
    setPropositionSolution("");
    setPropositionCommentaireError("");
    setPropositionSolutionError("");
    setShowVoteField(false);
    setUserData((prev) => ({ ...prev, message: "" }));
  };

  const handleVote = (e, messageId) => {
    const selectedValue = e.target.value;
    const voteRequest = {
      removeVote: selectedOption !== "",
      pour: selectedValue === "POUR",
      claimCode: code,
      authorId: user.id,
      messageId,
    };
    safeSend("/api/v1/session/vote/" + code, {}, JSON.stringify(voteRequest));
  };

  const handleChooseVote = (msgId) => {
    const confirmSolution = { messageId: msgId, claimCode: code };
    safeSend("/api/v1/session/confirm-solution/" + code, {}, JSON.stringify(confirmSolution));
  };

  const ejectGuest = (guestId) => {
    const chatMessage = { userId: guestId, claimCode: code, status: "EJECTION" };
    safeSend("/api/v1/session/eject/guest/" + code, {}, JSON.stringify(chatMessage));
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  const inviteGuest = (userId) => {
    const chatMessage = { userId, claimCode: code, status: "INVITATION" };
    safeSend("/api/v1/session/join/guest/" + code, {}, JSON.stringify(chatMessage));
  };

  return {
    // state
    userData, setUserData,
    publicChats, setPublicChats,
    guests, setGuests,
    propositionSolution, setPropositionSolution,
    propositionCommentaire, setPropositionCommentaire,
    propositionSolutionError,
    propositionCommentaireError,
    showVoteField, setShowVoteField,
    selectedOption, setSelectedOption,
    // actions
    connect,
    disconnect,
    handleMessage,
    sendValue,
    sendVote,
    handleVote,
    handleChooseVote,
    ejectGuest,
    inviteGuest,
  };
};

export default useWebSocketSession;
