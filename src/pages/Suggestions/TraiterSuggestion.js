import React, { useEffect, useRef, useState, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import TraitementShell from "../../components/treatment/TraitementShell";
import axios from "axios";
import { HOST } from "../../Utils/globals";
import ReactDatatable from "@ashvin27/react-datatable";
import Select from "react-select";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { KTApp } from "../../Utils/blockui";
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
  extrasChanged,
  codeClientChanged,
  emailChanged
} from "../../redux/actions/Suggestions/TraitementSuggestionActions";
import { connect } from "react-redux";
import {
  handlePrint,
  handlePrint2,
  handlePrintAvance,
} from "../../Utils/tables";

import {
  Card,
  Box,
  CardContent,
  Grid,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { FileDownload, History, Info, Pause, PlayArrow, Star, VolumeUp } from "@mui/icons-material";
import PrintIcon from "@mui/icons-material/Print";
import GavelIcon from "@mui/icons-material/Gavel";
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
import { formatDate, formatDate2, formatDate3, formatDate4, guessExtension, loadItemFromSessionStorage, today } from "../../Utils/utils";
import SaveIcon from '@mui/icons-material/Save';
import { downloadFillesApi, getFillesApi, getSuggeAudioApi, listeByStatut, listeTousStatuts, treatSuggestionApi } from "../../apis/Suggestions/SuggestionsApi";
import { LoadingButton } from "@mui/lab";
import { suggestionListErrors } from "../../redux/actions/Suggestions/TraitementSuggestionActions";
import { licenseInfo } from "../../apis/LoginApi";
import { downloadAudioApi } from "../../apis/Denonciations/DenonciationsApi";
import { WarningAmber } from '@mui/icons-material';
import WarningIcon from '@mui/icons-material/Warning';
import EmailIcon from '@mui/icons-material/Email';
import { ButtonBase } from "@mui/material";
import DossierKPIBar from "../../components/shared/DossierKPIBar";
import DossierTable from "../../components/shared/DossierTable";
import DossierCardView from "../../components/shared/DossierCardView";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";


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

const SG_KPI_CARDS = [
  { key: "total",   label: "Total suggestions",  icon: AssignmentIcon,     iconBg: "#EFF6FF", iconColor: "#1D4ED8", borderColor: "#3B82F6", filter: () => true },
  { key: "pending", label: "À traiter",           icon: HourglassEmptyIcon, iconBg: "#FEF3C7", iconColor: "#92400E", borderColor: "#F59E0B", filter: (c) => ["SAVED","TEMP_SAVED"].includes(c.status) },
  { key: "treated", label: "Traitées",            icon: CheckCircleIcon,    iconBg: "#D1FAE5", iconColor: "#065F46", borderColor: "#10B981", filter: (c) => c.status === "TREAT" },
];

const SG_TREAT_CHIPS = [
  { value: "ALL",     label: "Tous",     filter: () => true },
  { value: "TO_TREAT",label: "À traiter",filter: (c) => ["SAVED","TEMP_SAVED"].includes(c.status) },
  { value: "TREAT",   label: "Traitée",  filter: (c) => c.status === "TREAT" },
  { value: "SATISFIED",label: "Satisfait",filter: (c) => c.status === "SATISFIED" },
  { value: "CLASSED", label: "Classée",  filter: (c) => c.status === "CLASSED" },
];

const SG_TABLE_COLUMNS = [
  {
    id: "codeClient", label: "Code client", sortable: true, minWidth: 110,
    render: (item) => <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#005081", fontFamily: "monospace" }}>{item.codeClient || "—"}</span>,
  },
  {
    id: "clientFirstAndLastName", label: "Client", sortable: true, minWidth: 140,
    render: (item) => <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{item.clientFirstAndLastName || <em>Anonyme</em>}</span>,
    sortValue: (item) => item.clientFirstAndLastName || "",
  },
  {
    id: "status", label: "Statut", sortable: true, minWidth: 120,
    render: (item) => {
      const map = { SAVED: ["À traiter","#DBEAFE","#1D4ED8"], TEMP_SAVED: ["Sauvegardée","#EDE9FE","#5B21B6"], TREAT: ["Traitée","#D1FAE5","#065F46"], SATISFIED: ["Satisfait","#ECFDF5","#047857"], CLASSED: ["Classée","#F3F4F6","#374151"] };
      const [label, bg, color] = map[item.status] || [item.status,"#F3F4F6","#374151"];
      return <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:20, backgroundColor:bg, color, fontSize:"0.72rem", fontWeight:700 }}>{label}</span>;
    },
    sortValue: (item) => item.status || "",
  },
  {
    id: "createdAt", label: "Enregistrée le", sortable: true, minWidth: 130,
    render: (item) => <span style={{ fontSize:"0.80rem", color:"#475569", whiteSpace:"nowrap" }}>{item.createdAt ? new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(item.createdAt)) : "—"}</span>,
    sortValue: (item) => item.createdAt || "",
  },
];

const TraiterSuggestion = (props) => {
  let dimf, crew, emailDisplay;
  const [open, setOpen] = React.useState(false);
  const [interne, setInterne] = React.useState(false);
  const [impression, setImpression] = React.useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [activeFilter, setActiveFilter] = useState("ALL");
  let user = loadItemFromSessionStorage("app-user") !== undefined ? JSON.parse(loadItemFromSessionStorage("app-user")) : undefined;
  const history = useHistory();
  const location = useLocation();
  const [localConvertedBy, setLocalConvertedBy] = useState("");
  const [localConvertedAt, setLocalConvertedAt] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const [isLoading, setIsLoading] = useState(false);

  const [currentAudioId, setCurrentAudioId] = useState("");
  const audioRef = useRef(null);

  const handleClose = () => {
    if (props.match?.params?.code && props.match.params.code !== "all") {
      sessionStorage.removeItem('gpr_sug_treat_code');
      history.push("/suggestions/traitement/all");
    } else {
      setOpen(false);
    }
    setInterne(false);
    clearComponentState();
  };



  const [showAudioPlayer, setAudioPlayer] = useState("");
  const [currentAudio, setCurrentAudio] = useState("");

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

  useEffect(() => {
    KTApp.blockPage({
      overlayColor: '#000000',
      type: 'v2',
      state: 'danger',
      message: 'En cours de chargement...'
    })
    setIsLoading(true);

    props.itemsChanged([])
    listeByStatut(props, "SAVED").then((items) => {
      if (location.state?.justConverted && Array.isArray(items) && items.length > 0) {
        const convertedCode = location.state?.convertedCode;
        history.replace(location.pathname, {});

        // sessionStorage sera lu par le useEffect quand le code changera

        const target = convertedCode
          ? items.find(item => item.code === convertedCode)
          : [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
        if (target) {
          setTimeout(() => rowClickedHandler(null, target, 0), 100);
        }
      }
    }).finally(() => {
      setIsLoading(false);
      KTApp.unblockPage();
    });

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

  useEffect(() => {
    const urlCode = props.match?.params?.code;
    if (!urlCode || urlCode === "all") {
      const storedCode = sessionStorage.getItem('gpr_sug_treat_code');
      if (storedCode) {
        history.replace('/suggestions/traitement/' + storedCode);
      }
    }
  }, []);

  useEffect(() => {
    const code = props.match?.params?.code;
    if (code && code !== "all") {
      axios({
        method: "get",
        url: HOST + "api/v1/suggestion/" + code + "/details",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + loadItemFromSessionStorage("token") },
      }).then((cc) => {
        if (cc.status >= 200 && cc.status <= 299) {
          const data = cc.data.content;
          clearComponentState();
          props.lastnameChanged(data.clientFirstAndLastName ?? "");
          props.addressChanged(data.address ?? "");
          props.phoneChanged(data.tel ?? "");
          props.genderChanged(data.gender ?? "");
          props.languageChanged(data.langue?.libelle ?? "");
          props.dossierimfChanged(data.folderCode ?? "");
          props.emailChanged(data.email ?? "");
          props.idChanged(data.id ?? "");
          props.codeChanged(data.code ?? "");
          props.codeClientChanged(data.codeClient ?? "");
          props.recordedAtChanged(data.receiptDateTime ?? "");
          props.collectChanged(data.canal?.libelle ?? "");
          props.productChanged(data.produit?.libelle ?? "");
          props.unitChanged(data.serviceIndexe?.libelle ?? "");
          props.contentChanged(data.content ?? "");
          props.solutionChanged(data.accepted ?? false);
          props.commentChanged(data.commentaire ?? "");
          props.statusChanged(data.status ?? "");
          props.createdByChanged(data.collecteur?.firstAndLastName ?? "");
          props.createdAtChanged(data.createdAt ?? "");
          props.handledByChanged(data.traiteur?.firstAndLastName ?? "");
          props.handledAtChanged(data.treatAt ?? "");
          props.selectedItemChanged(data);
          props.extrasChanged(data.extras ?? []);
          getFillesApi(data.id, props);
          getSuggeAudioApi(data.id, props);
          props.convertedByChanged(data.convertedBy ? data.convertedBy.firstAndLastName : "");
          props.convertedAtChanged(data.convertedAt ? data.convertedAt : "");
        }
      }).catch(() => {});
    }
  }, [props.match?.params?.code]);

  // Bannière de conversion : lire sessionStorage après navigation vers un code spécifique
  useEffect(() => {
    const code = props.match?.params?.code;
    if (!code || code === "all") {
      setLocalConvertedBy("");
      setLocalConvertedAt("");
      return;
    }
    const pending = sessionStorage.getItem('pendingSuggestionConversion');
    if (pending) {
      try {
        const info = JSON.parse(pending);
        if (info.code === code) {
          setLocalConvertedBy(info.convertedByName || "");
          setLocalConvertedAt(info.convertedAtTime || "");
          sessionStorage.removeItem('pendingSuggestionConversion');
          return;
        }
      } catch (_) {}
    }
    setLocalConvertedBy("");
    setLocalConvertedAt("");
  }, [props.match?.params?.code]);

  //Handling the List
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
      cell: (claim, index) => {
        let nom = (claim.clientFirstAndLastName && claim.clientFirstAndLastName.trim() !== "") ? claim.clientFirstAndLastName : <em>Anonyme</em>;
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
    props.codeClientChanged("");
    props.genderChanged("");
    props.languageChanged("");
    props.dossierimfChanged("");
    props.emailChanged("");
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
    props.convertedByChanged("");
    props.convertedAtChanged("");

  };

  const rowClickedHandler = (event, data, rowIndex) => {

    clearComponentState();
    sessionStorage.setItem('gpr_sug_treat_code', data.code);
    history.push("/suggestions/traitement/" + data.code);
    props.idChanged(data.id ? data.id : "");
    props.lastnameChanged(data.clientFirstAndLastName ? data.clientFirstAndLastName : "");
    props.addressChanged(data.address ? data.address : "");
    props.phoneChanged(data.tel ? data.tel : "");
    props.genderChanged(data.gender ? data.gender : "");
    props.languageChanged(data.langue.libelle ? data.langue.libelle : "");
    props.dossierimfChanged(data.folderCode ? data.folderCode : "");
    props.emailChanged(data.email ? data.email : "");
    props.codeChanged(data.code ? data.code : "");
    props.codeClientChanged(data.codeClient ? data.codeClient : "");
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
    props.extrasChanged(data.extras ?? []);

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

  const _convertedBy = props.convertedBy || localConvertedBy;
  const _convertedAt = props.convertedAt || localConvertedAt;
  const warningConvert = _convertedBy && _convertedBy !== "" &&
    _convertedAt && _convertedAt !== "" && (
    <span className="mb-1" style={{ width: "100%", display: "flex", alignItems: "center", fontWeight: '', fontStyle: 'italic', color: '' }}>
      <WarningIcon fontSize="medium" sx={{ mr: 1, color: 'orange' }} />
      {`Converti en suggestion par ${_convertedBy} le ${formatDate4(_convertedAt)}`}
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

                        className="waves-effect waves-effect-b waves-light btn-small mr-1 red lighten-4"
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
                        sx={{ backgroundColor: "var(--gpr-primary, #005081)", textTransform: "initial" }}
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
                  <Tooltip title={`Ajouté par ${attachment.extra?.user?.firstAndLastName} le ${formatDate(attachment.extra?.createdAt)}`}>
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

        Ce dossier ne contient pas de fichiers joints

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
                  <Tooltip title={`Ajouté par ${audioItem.extra?.user?.firstAndLastName} le ${formatDate(audioItem.extra?.createdAt)}`}>
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
      <Grid container spacing={2} size={12}>

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

  let content = [];
  content = props.items;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const filteredContent = useMemo(() => {
    const chip = SG_TREAT_CHIPS.find((c) => c.value === activeFilter);
    return chip ? content.filter(chip.filter) : content;
  }, [content, activeFilter]);
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

  if (props.match?.params?.code && props.match.params.code !== "all") {
    const filesCount = props.selectedItemFiles?.length ?? 0;
    const audiosCount = props.selectedItemAudio?.length ?? 0;
    const extrasCount = props.extras?.filter(e => e.contenu)?.length ?? 0;
    const contentsCount = (props.content ? 1 : 0) + extrasCount;
    const decision = props.solution === true ? "Pris en compte" : props.solution === false && props.status === "TREAT" ? "Non pris en compte" : null;

    const AccSection = ({ color, dotColor, icon, title, badge, children }) => {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 12 }}>
          <button onClick={() => setIsOpen(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>{title}</span>
            {badge !== undefined && <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", background: dotColor, borderRadius: 20, padding: "2px 9px", marginRight: 8 }}>{badge}</span>}
            <span style={{ fontSize: 10, color: "#94a3b8" }}>{isOpen ? "▲" : "▼"}</span>
          </button>
          {isOpen && <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 18px" }}>{children}</div>}
        </div>
      );
    };

    return (
      <>
        <audio ref={audioRef} src={currentAudio} hidden />
        <TraitementShell
          onBack={() => { sessionStorage.removeItem('gpr_sug_treat_code'); history.push("/suggestions/traitement/all"); }}
          codeClient={props.codeClient || props.code}
          status={props.status}
          claimId={props.id}
          lastname={props.lastname}
          phone={props.phone}
          email={props.email}
          address={props.address}
          language={props.language}
          gender={props.gender}
          dossierimf={props.dossierimf}
          recorded_at={props.recorded_at}
          collect={props.collect}
          product={props.product}
          unit={props.unit}
          created_by={props.created_by}
          creationDate={creationDate}
          content={props.content}
          visibleActions={[]}
          conversionWarning={warningConvert || null}
          selectedItemFiles={props.selectedItemFiles}
          selectedItemAudio={props.selectedItemAudio}
          customTabs={[
            {
              key: "traitement",
              label: "Traitement",
              content: (() => {
                /* ── Stepper ── */
                const SG_STEPS = [
                  { label: "Enregistrée", statuses: ["SAVED","TEMP_SAVED"] },
                  { label: "En décision", statuses: ["SAVED"] },
                  { label: "Traitée",     statuses: ["TREAT","SATISFIED","CLASSED"] },
                ];
                const currentStep = props.status === "TREAT" || props.status === "SATISFIED" || props.status === "CLASSED" ? 2
                  : 0;

                /* ── Hero config ── */
                const HERO = {
                  SAVED:    { title: "En attente de décision", sub: "Cette suggestion n'a pas encore été traitée", iconColor: "#1d4ed8", iconBg: "#dbeafe", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                  TEMP_SAVED:{ title: "Sauvegardée temporairement", sub: "En attente de complétion", iconColor: "#7c3aed", iconBg: "#ede9fe", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> },
                  TREAT:    { title: "Suggestion traitée", sub: "Une décision a été rendue", iconColor: "#166534", iconBg: "#dcfce7", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg> },
                };
                const hero = HERO[props.status] || HERO["SAVED"];
                const showHero = props.status !== "TREAT";

                return (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>



                  {props.status === "SAVED" ? (
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 18 }}>Prise en compte de la suggestion</div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                          Commentaire <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Saisissez votre commentaire..."
                          value={props.comment}
                          onChange={(e) => props.commentChanged(e.target.value)}
                          style={{ width: "100%", borderRadius: 10, border: "1.5px solid #e2e8f0", padding: "10px 14px", fontSize: 13.5, color: "#1e293b", resize: "vertical", outline: "none", fontFamily: "inherit" }}
                        />
                        {props.errors?.comment && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{props.errors.comment}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <LoadingButton
                          onClick={(e) => handleTreatment(e, false)}
                          loading={props.etat}
                          variant="contained"
                          sx={{ textTransform: "none", borderRadius: 2, background: "#fef2f2", color: "#fff", border: "1px solid #fecaca", boxShadow: "none", fontWeight: 600, "&:hover": { background: "#fee2e2" } }}
                        >
                          <span>Ne pas prendre en compte</span>
                        </LoadingButton>
                        <LoadingButton
                          onClick={(e) => handleTreatment(e, true)}
                          loading={props.etat2}
                          variant="contained"
                          sx={{ textTransform: "none", borderRadius: 2, background: "var(--gpr-primary, #005081)", fontWeight: 600, "&:hover": { background: "#15187a" } }}
                        >
                          <span>Prendre en compte</span>
                        </LoadingButton>
                      </div>
                    </div>
                  ) : props.status === "TREAT" ? (
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                        <GavelIcon style={{ fontSize: 17, color: "var(--gpr-primary, #005081)" }} /> Résultat du traitement
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: props.solution === true ? "#f0fdf4" : "#fef2f2", borderRadius: 10, border: `1px solid ${props.solution === true ? "#bbf7d0" : "#fecaca"}` }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: props.solution === true ? "#dcfce7" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {props.solution === true
                              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: props.solution === true ? "#166534" : "#991b1b" }}>Décision : {decision}</div>
                        </div>
                        {props.handled_by && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#475569" }}>
                            <PersonIcon style={{ fontSize: 16, color: "#94a3b8" }} />
                            <span><span style={{ fontWeight: 600, color: "#1e293b" }}>Par : </span>{props.handled_by}</span>
                          </div>
                        )}
                        {props.handled_at && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#475569" }}>
                            <CalendarMonthIcon style={{ fontSize: 16, color: "#94a3b8" }} />
                            <span><span style={{ fontWeight: 600, color: "#1e293b" }}>Le : </span>{formatDate(props.handled_at)}</span>
                          </div>
                        )}
                        {props.comment && (
                          <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "12px 16px" }}>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Commentaire</div>
                            <div style={{ fontSize: 13.5, color: "#1e293b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{props.comment}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
                );
              })(),
            },
            {
              key: "medias",
              label: "Contenu & Médias",
              content: (
                <div>
                  <AccSection color="#ede9fe" dotColor="#8b5cf6" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} title="Contenus" badge={contentsCount}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {props.content && <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "12px 16px" }}><div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Contenu initial</div><div style={{ fontSize: 13.5, color: "#1e293b", whiteSpace: "pre-wrap" }}>{props.content}</div><div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 8 }}>{props.created_by} · {creationDate}</div></div>}
                      {props.extras?.filter(e => e.contenu).map((extra, i) => <div key={i} style={{ background: "#faf5ff", borderRadius: 10, border: "1px solid #ede9fe", padding: "12px 16px" }}><div style={{ fontSize: 13.5, color: "#1e293b", marginBottom: 6 }}>{extra.contenu}</div><div style={{ fontSize: 11.5, color: "#7c3aed" }}>{extra.user?.firstAndLastName} · {formatDate(extra.createdAt)}</div></div>)}
                      {contentsCount === 0 && <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Aucun contenu</div>}
                    </div>
                  </AccSection>
                  <AccSection color="#dbeafe" dotColor="#3b82f6" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>} title="Fichiers joints" badge={filesCount}>
                    {filesCount > 0 ? attachmentList : <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Aucun fichier joint</div>}
                  </AccSection>
                  <AccSection color="#dcfce7" dotColor="#22c55e" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>} title="Audios" badge={audiosCount}>
                    {audiosCount > 0 ? audioList : <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Aucun audio</div>}
                  </AccSection>
                </div>
              ),
            },
            {
              key: "historique",
              label: "Historique",
              content: (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>Flux du dossier</span>
                    </div>
                    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </div>
                        <div style={{ fontSize: 13, color: "#475569" }}><span style={{ fontWeight: 600, color: "#1e293b" }}>Enregistrée par : </span>{props.created_by || "—"}<span style={{ color: "#94a3b8" }}> · {creationDate}</span></div>
                      </div>
                      {props.status === "TREAT" && props.handled_by && (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <div style={{ fontSize: 13, color: "#475569" }}><span style={{ fontWeight: 600, color: "#1e293b" }}>Traitée par : </span>{props.handled_by}<span style={{ color: "#94a3b8" }}>{props.handled_at ? " · " + formatDate(props.handled_at) : ""}</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </>
    );
  }

  return (
    // "Liste Suggestions"
    <div id="main">
      <audio ref={audioRef} src={currentAudio} hidden />
      <div className="row">
        <div className="col s12">
          <div className="container">
            <section className="tabs-vertical mt-1 section">
              <div className="row">
                <div className="col l12 s12 pb-5">
                  <div className="card-panel pb-5">
                    <DossierKPIBar items={content} kpiCards={SG_KPI_CARDS} />
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2, pb: 2, borderBottom: "1px solid #F1F5F9" }}>
                      {SG_TREAT_CHIPS.map((chip) => {
                        const count = content.filter(chip.filter).length;
                        const isActive = activeFilter === chip.value;
                        if (chip.value !== "ALL" && count === 0) return null;
                        return (
                          <ButtonBase key={chip.value} onClick={() => setActiveFilter(chip.value)} sx={{ borderRadius: "20px", px: 1.5, py: 0.5, border: isActive ? "1.5px solid #93C5FD" : "1.5px solid #E2E8F0", backgroundColor: isActive ? "#EFF6FF" : "#FAFAFA", color: isActive ? "#1D4ED8" : "#64748B", fontWeight: isActive ? 700 : 500, fontSize: "0.78rem", transition: "all 0.18s", display: "flex", alignItems: "center", gap: 0.8, "&:hover": { backgroundColor: "#EFF6FF", color: "#1D4ED8", borderColor: "#93C5FD" } }}>
                            <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit", lineHeight: 1.4 }}>{chip.label}</Typography>
                            <Box sx={{ minWidth: 20, height: 20, borderRadius: "10px", backgroundColor: isActive ? "#1D4ED8" : "#E2E8F0", color: isActive ? "#fff" : "#64748B", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", px: 0.6 }}>{count}</Box>
                          </ButtonBase>
                        );
                      })}
                    </Box>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <h5 className="card-title" style={{ fontWeight: 700, color: "#0F172A", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                        Suggestions à traiter
                        <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "#64748B", background: "#F1F5F9", borderRadius: 8, padding: "2px 10px" }}>
                          {filteredContent.length} résultat{filteredContent.length !== 1 ? "s" : ""}
                        </span>
                      </h5>
                      <Box sx={{ display: "inline-flex", borderRadius: "10px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                        <Tooltip title="Vue liste">
                          <Box onClick={() => setViewMode("list")} sx={{ px: 1.4, py: 0.8, cursor: "pointer", backgroundColor: viewMode === "list" ? "var(--gpr-primary, #005081)" : "#F8FAFC", color: viewMode === "list" ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.18s" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                          </Box>
                        </Tooltip>
                        <Tooltip title="Vue cartes">
                          <Box onClick={() => setViewMode("card")} sx={{ px: 1.4, py: 0.8, cursor: "pointer", backgroundColor: viewMode === "card" ? "var(--gpr-primary, #005081)" : "#F8FAFC", color: viewMode === "card" ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", transition: "all 0.18s" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                          </Box>
                        </Tooltip>
                      </Box>
                    </div>
                    <div>
                      {viewMode === "list" ? (
                        <DossierTable
                          items={filteredContent}
                          columns={SG_TABLE_COLUMNS}
                          filterFn={(item, { q }) => !q || item.codeClient?.toLowerCase().includes(q) || item.clientFirstAndLastName?.toLowerCase().includes(q) || item.objet?.libelle?.toLowerCase().includes(q)}
                          showStatusFilter={false}
                          showGravityFilter={false}
                          searchPlaceholder="Rechercher par code client, objet..."
                          emptyText="Aucune suggestion trouvée"
                          onRowClick={(data) => rowClickedHandler(null, data, 0)}
                        />
                      ) : (
                        <DossierCardView
                          items={filteredContent}
                          getCardData={(item) => ({ code: item.codeClient, client: item.clientFirstAndLastName || "Anonyme", title: item.subject || "—", subtitle: null, status: item.status, gravity: null, date: item.createdAt })}
                          onCardClick={(data) => rowClickedHandler(null, data, 0)}
                          filterFn={(item, { q }) => !q || item.codeClient?.toLowerCase().includes(q) || item.clientFirstAndLastName?.toLowerCase().includes(q)}
                          showStatusFilter={false}
                          showGravityFilter={false}
                          searchPlaceholder="Rechercher une suggestion…"
                          emptyText="Aucune suggestion trouvée"
                        />
                      )}
                      <div id="tab_exl" style={{ display: "none" }}></div>
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
                      sx={{ position: "relative", backgroundColor: "var(--gpr-primary, #005081)" }}
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
                          <div className="row" id="ententeFiche">
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
                                    Informations du suggéreur
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
                                    <WcIcon sx={{ mr: 2 }} /> {(props.gender !== "" && props.gender !== "NON_DEFINI") ? props.gender : <i>Non défini</i>}
                                  </div>
                                  {
                                    (emailDisplay =
                                      props.email !== "" ? (
                                        <>
                                          <div className="col l6 s12 df pb-2" id="email">
                                            <EmailIcon sx={{ mr: 2 }} /> {props.email}
                                          </div>
                                        </>
                                      ) : (
                                        ""
                                      ))
                                  }


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
                                    <PinIcon sx={{ mr: 2 }} /> {props.codeClient}
                                  </div>

                                  <div
                                    className="col l6 s12 df pb-2"
                                    id="recorded_at"
                                  >
                                    <CalendarMonthIcon sx={{ mr: 2 }} />
                                    {formatDate4(props.recorded_at)}
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
                                </Box>
                              </div>
                              <div className="col s12">
                                {attachmentList}
                              </div>
                            </div></div>
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
                                </Box>
                              </div>
                              <div className="col s12">
                                {audioList}
                              </div>
                            </div></div>
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
    email: state.suggestion_handle.email,
    code: state.suggestion_handle.code,
    codeClient: state.suggestion_handle.codeClient,
    recorded_at: state.suggestion_handle.recorded_at,
    collect: state.suggestion_handle.collect,
    product: state.suggestion_handle.product,
    unit: state.suggestion_handle.unit,
    content: state.suggestion_handle.content,
    extras: state.suggestion_handle.extras,
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
    emailChanged: (email) => {
      dispatch(emailChanged(email));
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
    extrasChanged: (extra) => {
      dispatch(extrasChanged(extra));
    },
    codeClientChanged: (codeClient) => {
      dispatch(codeClientChanged(codeClient));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TraiterSuggestion);
