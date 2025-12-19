import React from 'react'
import { connect } from "react-redux";
import { INSTITUTION_ADDRESS, INSTITUTION_AGREMENT, INSTITUTION_EMAIL, INSTITUTION_LOGO, INSTITUTION_NAME, INSTITUTION_PAYS, INSTITUTION_TEL } from '../../Utils/globals';
import { handlePrintAvance } from '../../Utils/tables';
import { cleanDate, loadItemFromLocalStorage, loadItemFromSessionStorage, today } from '../../Utils/utils';
import { table2XLSX } from '../../Utils/tabletoexcel';
import { useState } from 'react';
import { useEffect } from 'react';
import DatePicker from "react-datepicker";
import { mdColors } from '../../Utils/colors';
import { reportBceaoApi } from '../../apis/Rapports/BceaoApi';
import { Dialog, DialogTitle, DialogContent, DialogContentText, Tooltip } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { globalChanged, openChanged } from '../../redux/actions/Rapports/BceaoActions';
import moment from 'moment';

import PDF_IMG from "../../assets/images/reports/pdf.svg"
import EXCEL_IMG from "../../assets/images/reports/excel.svg"
import WORD_IMG from "../../assets/images/reports/word.svg"
import FILTER_IMG from "../../assets/images/reports/filter2.svg"
// import { useTranslation } from "react-i18next";

const Bceao = (props) => {
  // const { t } = useTranslation();
  const [claimShow, setClaimShow] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [periode, setPeriode] = useState("");
  const [piloteName, setPiloteName] = useState("-");
  const [piloteContact, setPiloteContact] = useState("-");
  const [showSearch, setshowSearch] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [institution, setInstitution] = useState("")
  const [agrement, setAgrement] = useState("")
  const [adresse, setAdresse] = useState("")
  const [tel, setTel] = useState("")
  const [email, setEmail] = useState("")
  const [pays, setPays] = useState("")
  const [logoInstitution, setLogoInstitution] = useState("");

  

  useEffect(() => {
    if (localStorage.getItem("app-institution")) {
      
      const instu = JSON.parse(
        typeof JSON.parse(localStorage.getItem("app-institution")) =="object" ?localStorage.getItem("app-institution") :JSON.parse(localStorage.getItem("app-institution"))
      );
      setLogoInstitution(instu.logo);
      setInstitution(instu.denomination ?? "");
      setAgrement(instu.numAgrement ?? "");
      setAdresse(instu.adresse ?? "");
      setTel(instu.tel ?? "");
      setEmail(instu.email ?? "");
      setPays(instu.pays ?? "");
    }
  }, ["alberic"]);

  const handleClose = () => {
    props.openChanged(false)
    setshowSearch(false)
    cleanForm()
  };

  let userAuth = loadItemFromSessionStorage("app-user") !== undefined ? JSON.parse(loadItemFromSessionStorage("app-user")) : undefined;
  let users = loadItemFromSessionStorage("app-users") !== undefined ? JSON.parse(loadItemFromSessionStorage("app-users")) : undefined;
  let appInstitution = loadItemFromLocalStorage("app-institution") !== undefined && (loadItemFromLocalStorage("app-institution").length !==0)  ? JSON.parse(loadItemFromLocalStorage("app-institution")) : undefined;

  //Effacer tout
  const cleanForm = () => {
    setStartDate("");
    setEndDate("");
    setErrorMsg("")
    //   document.querySelector("#searchShow").click();
  };


  const rapportSubmit = (init = false) => {

    if (startDate != "" && endDate != "" && startDate != undefined && endDate != undefined) {

      setClaimShow(true);

      //periode
      if (startDate != "" && endDate != "" && startDate != undefined && endDate != undefined) {
        let dateSt = moment(startDate).format('DD-MM-YYYY');
        let dateFi = moment(endDate).format('DD-MM-YYYY');
        setPeriode(dateSt + " au " + dateFi);
      } else {
        setPeriode("-");
      }

      //pilote principal
      let pilotes = users.filter((e) => {
        return e.additionalRole == "PILOTE";
      })
      if (pilotes.length !== 0) {
        setPiloteName(pilotes[0].firstAndLastName)
        setPiloteContact(pilotes[0].tel)
      } else {
        setPiloteName("-")
        setPiloteContact("-")
      }

      //contact api

      let filtres = {};

      filtres["startDate"] = cleanDate(startDate);
      filtres["endDate"] = cleanDate(endDate);

      // console.log("filtresbceao",filtres);

      reportBceaoApi(props, filtres).then((r) => { });
      handleClose();
    } else {
      setErrorMsg("Formulaire invalide, choisissez une date de début et une date de fin")
    }
  };

  const initReport = () => {
    const date = new Date();
    const endDateD = moment().format("DD-MM-YYYY hh:mm");
    const startDateD = `01-01-${date.getFullYear()} 00:00`;
    setPeriode(startDateD + " au " + endDateD)

    reportBceaoApi(props, { "startDate": startDateD, "endDate": endDateD }).then((r) => { });
  }

  useEffect(() => {
    initReport()
  }, [""])



  const claimTableHead = () => {
    let tableClaim = (
      <table
        width="960"
        border="1"
        className="striped responsive-table bordered table-xlsx no-hover"
        style={{ minWidth: "100% !important" }}
        id="headClaimEx">

        <tbody>
          <tr>
            <td>Pays </td>
            <td colSpan={2}>
            {pays}
            </td>
          </tr>
          <tr>
            <td>Etablissement Déclarant</td>
            <td colSpan={2}>
            {institution}
            </td>
          </tr>
          <tr>
            <td>Nom et prenoml(s) du préposé à la gestion des plaintes :  </td>
            <td colSpan={2} id="piloteName">{props.global?.piloteName}</td>
          </tr>
          <tr>
            <td>Contact du préposé à la gestion des plaintes : </td>
            <td colSpan={2} id="piloteContact">{props.global?.piloteContact} </td>
          </tr>
          <tr>
                    <td>Période concernée  </td>
                    <td colSpan={2} id="periode">{props.global?.periode}  </td>
                </tr>
                <tr>
                    <td rowSpan={10}>Statistiques de la période concernée  </td>
                    <td>Nombre de réclamations </td>
                    <td>{props.global?.totalClaim}</td>
                </tr>
                <tr>
                    <td>Nombre de dénonciations </td>
                    <td>{props.global?.totalDenun}</td>
                </tr>
                <tr>
                    <td>Nombre de suggestions </td>
                    <td>{props.global?.totalSuggest}</td>
                </tr>
                <tr>
                    <td>Nombre de réclamations traitées</td>
                    <td>{props.global?.totalClaimTreat}</td>
                </tr>
                <tr>
                    <td>Nombre de réclamations non résolues</td>
                    <td>{props.global?.totalClaimUnResolve}</td>
                </tr>
                <tr>
                    <td>% des réclamations traitées</td>
                    <td>{props.global?.tauxClaimTreat}%</td>
                </tr>
                <tr>
                    <td>% des réclamations traitées dans le délai d’un mois :</td>
                    <td>{props.global?.tauxClaimTreatRespectingTiming}%</td>
                </tr>
                <tr>
                    <td>Taux de satisfaction des clients </td>
                    <td>{props.global?.tauxSatisfaction}%</td>
                </tr>
                <tr>
                    <td>Nombre de réclamations devant les tribunaux sur la période </td>
                    <td>{props.global?.totalLigitigateClaimInPeriode}</td>
                </tr>
                <tr>
                    <td>Nombre total des réclamations devant les tribunaux</td>
                    <td>{props.global?.totalLitigateClaim}</td>
                </tr>
        </tbody>
      </table>
    );
    return tableClaim;
  };

  const claimTableBody = () => {
    let i = 1;
    let tableClaim = (
      <table
        width="960"
        border="1"
        className="striped responsive-table bordered table-xlsx no-hover"
        style={{ minWidth: "100% !important" }}
        id="bodyClaimEx">
        <thead>
          <tr>
            <td className="center">Numéro d’ordre </td>
            <td className="center">Produits ou services concernés </td>
            <td className="center">Résumé synthétique de la réclamations (30 mots au maximum) </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3} className="center" style={{ backgroundColor: "#cac7c7", fontWeight: "bold", color: "black" }}>RECLAMATIONS RECUES AU COURS DE LA PERIODE</td>
          </tr>

          {((props.global?.claimsReceivedInPeriod) ? props.global?.claimsReceivedInPeriod : []).map((claim) => {
            return (
              <>
                <tr>
                  <td className="center">
                    <b>{i++}</b>
                  </td>
                  <td>
                    <b>{claim.product}</b>
                  </td>
                  <td>
                    <b>{claim.resume}</b>
                  </td>
                </tr>

              </>
            );
          })}

          <tr>
            <td colSpan={3} className="center" style={{ backgroundColor: "#cac7c7", fontWeight: "bold", color: "black" }}>RECLAMATIONS TRAITEES AU COURS DE LA PERIODE</td>
          </tr>

          {((props.global?.claimsTreatInPeriod) ? props.global?.claimsTreatInPeriod : []).map((claim) => {
            return (
              <>
                <tr>
                  <td className="center">
                    <b>{i++}</b>
                  </td>
                  <td>
                    <b>{claim.product}</b>
                  </td>
                  <td>
                    <b>{claim.resume}</b>
                  </td>
                </tr>

              </>
            );
          })}

          <tr>
            <td colSpan={3} className="center" style={{ backgroundColor: "#cac7c7", fontWeight: "bold", color: "black" }}>RECLAMATIONS NON RESOLUES AU COURS DE LA PERIODE</td>
          </tr>
          {((props.global?.claimsUnResolveInPeriod) ? props.global?.claimsUnResolveInPeriod : []).map((claim) => {
            return (
              <>
                <tr>
                  <td className="center">
                    <b>{i++}</b>
                  </td>
                  <td>
                    <b>{claim.product}</b>
                  </td>
                  <td>
                    <b>{claim.resume}</b>
                  </td>
                </tr>

              </>
            );
          })}

          <tr>
            <td colSpan={3} className="center" style={{ backgroundColor: "#cac7c7", fontWeight: "bold", color: "black" }}>RECLAMATIONS DEVANT LES TRIBUNAUX AU COURS DE LA PERIODE</td>
          </tr>
          {((props.global?.claimsLitigateInPeriod) ? props.global?.claimsLitigateInPeriod : []).map((claim) => {
            return (
              <>
                <tr>
                  <td className="center">
                    <b>{i++}</b>
                  </td>
                  <td>
                    <b>{claim.product}</b>
                  </td>
                  <td>
                    <b>{claim.resume}</b>
                  </td>
                </tr>

              </>
            );
          })}
        </tbody>
      </table>
    );
    return tableClaim;
  };



  const prepareToPrint = async (type = "pdf") => {
    // console.log("startDate", startDate);
    let entete = document.querySelector("#enteteRapport").innerHTML;
    let title = document.querySelector("#titleRapport").innerHTML;
    let critere = document.querySelector("#critereRapport").innerHTML;
    let dash = document.querySelector("#dashRapport").innerHTML;
    let dataClaim = "";
    let dataDenun = "";
    let dataSugg = "";
    let i = 0;
    if (claimShow) {
      dataClaim =
        '<div class="row mt-1 mb-3 center"><span style="fontSize: 20px; fontWeight: bold" }}>Aucune réclamation ne correspond aux critères de tri</span></div>';
      var taille = Object.keys(props.global).length;

      if (taille > 0) {

        dataClaim =
          "<div class='row mt-4'><div class='col l12 s12 m12 center mt-3'><span style='color:#015182;font-size: 25px;font-weight: bold'>Réclamations</span><br /></div></div>";
      }
    }


    let data =
      entete +
      "<br/><br />" +
      title +
      "<br/><br />" +
      critere +
      "<br/><br />" +
      dash +
      "<br/><br />" +
      '<script type="text/javascript">setTimeout(function() { window.print();window.close(); },500)</script>';
    document.querySelector("#trSimple").innerHTML = data;

    let results = document.querySelector("#trSimple").innerHTML;
    // console.log( "periode", periode );

    document.querySelector("#trSimple").innerHTML = "";
    return results;
  };
  // const printToPDF = async () => {


  //   const toStri = await prepareToPrint();
  //   handlePrintAvance(toStri);
  // };
  const printToPDF = async () => {
    // 🔥 ouvrir la fenêtre IMMEDIATEMENT
    const childWindow = window.open("", "modal");

    if (!childWindow) {
      alert("Veuillez autoriser les popups pour l'impression.");
      return;
    }

    const dom = await prepareToPrint(childWindow);

    handlePrintAvance(childWindow, dom);
  };
  const prepareReportTablesToXLSX = () => {
    let filename = "Statistiques_BCEAO_GPR_" + today().replaceAll("/", "");
    table2XLSX(filename, "", 2);
  };

  const printToWord = async () => {

    let reportData = await prepareToPrint();
    let css =
      "<style>" +
      "@page WholeDocument{size: 841.95pt 595.35pt;mso-page-orientation: landscape;}" +
      "div.WholeDocument {page: WholeDocument;}" +
      "table{border-collapse:collapse;}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      "table.header-ref{/*border-collapse:collapse;*/}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      "table.header-title{margin-top:5rem;/*border-collapse:collapse;*/}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      "table.header-details{margin-top:5%;/*border-collapse:collapse;*/}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      "table.header-criteria{margin-top:5cm;/*border-collapse:collapse;*/}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      "table[id=stats_claim]{border:1px solide #1e2b37; border-collapse:collapse;}  table[id=stats_claim] td,th{border:0px gray solid;/*width:5em;padding:2px;*/}" +
      "table#stats_denunciation{border:1px solide #1e2b37;border-collapse:collapse;}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      "table#stats_suggestion{border:1px solide #1e2b37;border-collapse:collapse;}  td,th{/*border:0px gray solid;width:5em;padding:2px;*/}" +
      //'table{border-collapse:collapse;}  td,th{border:1px gray solid;width:5em;padding:2px;}'+
      // 'table.theader{border-collapse:collapse;} table.theader td,th{border:0px gray solid;width:5em;padding:2px;}'+
      "img{width:10cm!important;}" +
      "</style>";
    let preHtml =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Exportation du rapport en Word</title>" +
      css +
      "</head><body><div class='WholeDocument'>";
    let postHtml = "</div></body></html>";
    let html = preHtml + reportData + postHtml;

    let blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });

    // Specify link url
    let url =
      "data:application/vnd.ms-word;charset=utf-8," + encodeURIComponent(html);

    // sleep(15000)
    // Specify file name
    let filename = "Rapport_BCEAO_GPR_" + today().replaceAll("/", "") + ".doc";

    // Create download link element
    let downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      // Create a link to the file
      downloadLink.href = url;

      // Setting the file name
      downloadLink.download = filename;

      //triggering the function
      downloadLink.click();
    }
  };
  return (
    <>
      <div id="trSimple" ></div>
      <div id="main" style={{ marginBottom: "50px" }}>
        {showSearch && (
          <Dialog open={props.open} onClose={(e) => { e.preventDefault(); handleClose() }} style={{ padding: "16px" }}>
            <DialogTitle
              align="center"
              color={"#1E2188"}
              fontSize={"23px"}
              fontWeight={"bold"}
            >
              Définir une période
            </DialogTitle>

            <DialogContent style={{ overflowY: "auto", overflowX: "hidden", minHeight: "50px", }}>

              <div className="row">
                <div className="col s12 m12 l6 input-field">
                  <DatePicker
                    id="idStartDate"
                    name="startDate"

                    className=""
                    selected={startDate}
                    onChange={(date) => {
                      setStartDate(date);
                    }}
                    dateFormat="dd/MM/yyyy"
                    locale="fr"
                  />
                  <label htmlFor="idStartDate" className={"active"}>
                  Date de début
                  </label>
                </div>
                {/*Date end*/}

                <div className="col s12 m12 l6 input-field">
                  <DatePicker
                    id="idEndDate"
                    name="endDate"
                    className=""
                    selected={endDate}
                    onChange={(date) => {
                      setEndDate(date);
                    }}
                    dateFormat="dd/MM/yyyy"
                    locale="fr"
                  />
                  <label htmlFor="idEndDate" className={"active"}>
                  Date de Fin
                  </label>
                </div>
                <div className="col l12 m12 s12 mt-4">
                  <small className="errorTxt4">
                    <div id="form-error"
                      className="error" style={{ color: "red", textAlign: "center" }}>{errorMsg}</div>
                  </small>
                </div>
                <div className="col l6 m6 s12 mt-4">
                  <a
                    onClick={(e) => {
                      cleanForm(e);
                    }}
                    className="btn indigo lighten-5 indigo-text waves-effect waves-effect-b waves-light display-flex align-items-center justify-content-center mt-1"
                  >
                    <span className="text-nowrap">Effacer Tout</span>
                  </a>
                </div>
                <div className="col l6 m6 s12 mt-4">
                  <a
                    className="btn waves-effect waves-effect-b waves-light display-flex align-items-center justify-content-center mt-1"
                    onClick={(e) => {
                      e.preventDefault();
                      rapportSubmit();
                    }}
                  >
                    <CheckIcon />
                    <span className="text-nowrap" style={{ fontSize: "15px" }}>
                      Générer
                    </span>
                  </a>
                </div>
              </div>

            </DialogContent>

          </Dialog>

        )}

        <div className="row" id="s">

          {/* <div
            className=""
            style={{
              position: "fixed",
              justifyContent: "center",
              bottom: 80,
              right: 5,
            }}
          >

            <div style={{ marginTop: "10px", display: "flex", width: "200px" }}>
              <div
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#000",
                  height: "50px",
                  width: "80px",
                }}
              >
                <span
                  id="okGenerer"
                  style={{
                    marginTop: "20%",
                    display: "none",
                    fontSize: "17px",
                  }}
                >
                  Générer
                </span>
              </div>
              <div
                id="searchShow"
                style={{
                  backgroundColor: "#FF0000",
                  color: "white",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50px",
                  width: "50px",
                  textAlign: "center",
                  borderRadius: "25px",
                  paddingTop: "5%",
                  cursor: "pointer",
                }}
                onMouseOver={() => {
                  document.querySelector("#okGenerer").style.display = "block";
                }}
                onMouseOut={() => {
                  document.querySelector("#okGenerer").style.display = "none";
                }}
                onClick={() => {
                  setshowSearch(true);
                  props.openChanged(true)
                }}
              >
                <CheckIcon />
              </div>

              <br />
            </div>
            <div style={{ marginTop: "10px", display: "flex", width: "200px" }}>
              <div
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#ff0000",
                  height: "50px",
                  width: "80px",
                }}
              >
                <span
                  id="okPdf"
                  style={{
                    marginTop: "20%",
                    fontSize: "17px",
                    display: "none",
                  }}
                >
                  PDF
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "#ffebee",
                  color: "#ff0000",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50px",
                  width: "50px",
                  textAlign: "center",
                  borderRadius: "25px",
                  paddingTop: "5%",
                  cursor: "pointer",
                }}
                onMouseOver={() => {
                  document.querySelector("#okPdf").style.display = "block";
                }}
                onMouseOut={() => {
                  document.querySelector("#okPdf").style.display = "none";
                }}
                onClick={() => {
                  printToPDF();
                }}
              >
                <PrintIcon />
              </div>

              <br />
            </div>
            <div style={{ marginTop: "10px", display: "flex", width: "200px" }}>
              <div
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#3f51b5",
                  height: "50px",
                  width: "80px",
                }}
              >
                <span
                  id="okWord"
                  style={{
                    marginTop: "20%",
                    display: "none",
                    fontSize: "17px",
                  }}
                >
                  Word
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "#e8eaf6",
                  color: "#3f51b5",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50px",
                  width: "50px",
                  textAlign: "center",
                  borderRadius: "25px",
                  paddingTop: "5%",
                  cursor: "pointer",
                }}
                onMouseOver={() => {
                  document.querySelector("#okWord").style.display = "block";
                }}
                onMouseOut={() => {
                  document.querySelector("#okWord").style.display = "none";
                }}
                onClick={() => {
                  printToWord();
                }}
              >
                <FileDownloadIcon />
              </div>

              <br />
            </div>
            <div style={{ marginTop: "10px", display: "flex", width: "200px" }}>
              <div
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#4caf50",
                  height: "50px",
                  width: "80px",
                }}
              >
                <span
                  id="okExcel"
                  style={{
                    marginTop: "20%",
                    display: "none",
                    fontSize: "17px",
                  }}
                >
                  Excel
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "#e8f5e9",
                  color: "#4caf50",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50px",
                  width: "50px",
                  textAlign: "center",
                  borderRadius: "25px",
                  paddingTop: "5%",
                  cursor: "pointer",
                }}
                onMouseOver={() => {
                  document.querySelector("#okExcel").style.display = "block";
                }}
                onMouseOut={() => {
                  document.querySelector("#okExcel").style.display = "none";
                }}
                onClick={() => {
                  prepareReportTablesToXLSX();
                }}
              >
                <FileDownloadIcon />
              </div>
            </div>
          </div> */}

          <div
            className=""
            style={{
              position: "fixed",
              justifyContent: "center",
              bottom: 80,
              right: 50,
              zIndex: 526,
              display: "block",
              width: "fit-content"
            }}
          >
            <div onClick={() => {
              setshowSearch(true);
              props.openChanged(true);
            }} style={{ padding: "10px", borderRadius: "80px", backgroundColor: "#ff0000", width: "fit-content", cursor: "pointer", margin: "10px 0px" }}>
              <Tooltip title="Appliquer des filtres" placement="left-start">
                <img src={FILTER_IMG} alt="Generer" style={{ width: "30px", height: "24px" }} />
              </Tooltip>
            </div>
            <div onClick={() => {
              printToPDF();
            }} style={{ padding: "14px 16px", borderRadius: "80px", backgroundColor: "#ffebee", width: "fit-content", cursor: "pointer", margin: "10px 0px" }}>
              <Tooltip title="Exporter en PDF" placement="left-start">
                <img src={PDF_IMG} alt="Generer" style={{ width: "20px", height: "20px" }} />
              </Tooltip>
            </div>
            <div onClick={() => {
              prepareReportTablesToXLSX();
            }} style={{ padding: "14px 16px", borderRadius: "80px", backgroundColor: "#e8f5e9", width: "fit-content", cursor: "pointer", margin: "10px 0px" }}>
              <Tooltip title="Exporter en Excel" placement="left-start">
                <img src={EXCEL_IMG} alt="Generer" style={{ width: "20px", height: "20px" }} />
              </Tooltip>
            </div>
            <div onClick={() => {
              printToWord();
            }} style={{ padding: "14px 16px", borderRadius: "80px", backgroundColor: "#e8eaf6", width: "fit-content", cursor: "pointer", margin: "10px 0px" }}>
              <Tooltip title="Exporter en Word" placement="left-start">
                <img src={WORD_IMG} alt="Generer" style={{ width: "20px", height: "20px" }} />
              </Tooltip>
            </div>

          </div>


          <div className="col l12 s12 m12">
            <div className="container">
              <section
                className="tabs-vertical mt1 section card-panel pt-2 pl-1"
                id="rapportBceao"
              >
                <div className="row">

                  <div className="row" id="enteteRapport">
                    <div className="col l2 s3 m3">
                      <img
                        src={
                          logoInstitution
                        }
                        alt="logo"
                        style={{
                          // width: "100%",
                          height: "90px",
                        }}
                        className={" report-logo"}
                      />
                    </div>
                    <div className="col l8 s7 m7">
                      <b>
                        {institution}
                      </b>
                      <br />
                      <i>
                        <span>Agrément: </span>
                        {agrement}
                      </i>
                      <br />
                      <i>
                        <span>Adresse: </span>
                        {adresse}
                      </i>
                      <br />
                      <i>
                        <span>Téléphone: </span>
                        {tel}
                      </i>
                      <br />
                      <i>
                        <span>Email: </span>
                        {email}
                      </i>
                    </div>
                    <div className="col l2 m2 s2">
                      <i>
                        Générer le {" "}
                        {new Date().toLocaleDateString("fr-FR", {
                          day: "numeric",
                          year: "numeric",
                          month: "long",
                        })}
                      </i>
                    </div>
                  </div>

                </div>
                <div
                  className="row"
                  style={{ marginTop: "20px" }}
                  id="titleRapport"
                >
                  <div className="col s12 l12 m12 center">
                    <span style={{ color: "#015182", fontSize: "25px" }}>
                    Rapport sous le format de la Commission Bancaire
                    </span>
                  </div>
                </div>
                <div
                  className="row"
                  style={{ marginTop: "20px" }}
                  id="critereRapport"
                >
                  <div className="col l12">
                    <ul>
                      <li>
                        <b style={{ fontSize: "15px" }}>
                          Période Concernée : {props.global?.periode}
                        </b>
                      </li>
                      <li>
                        <b>
                          Générer par :{" "}
                          {userAuth.firstAndLastName}
                        </b>
                      </li>
                    </ul>

                  </div>
                </div>
                <div className="row mt-4 mb-4" id="dashRapport">

                  <>
                    <div className="col l12 s12 m12">
                      <div className="row" id="toeClaim">
                        <div
                          className="col l12 s12 m12"
                          id="titleObjetsEtats"
                        >
                          <span
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                            }}

                          >
                            Statistiques
                          </span>
                          <br />
                        </div>
                        <div className="col l12 s12 m12 mt-2 mb-4 ">
                          {claimTableHead()}
                        </div>
                      </div>
                    </div>

                    <div className="col l12 s12 m12">
                      <div className="row" id="toeClaim">
                        <div
                          className="col l12 s12 m12"
                          id="titleObjetsEtats"
                        >
                          <span
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                            }}
                          >
                            Details des réclamations ou dénonciations
                          </span>
                          <br />
                        </div>
                        <div className="col l12 s12 m12 mt-2 mb-4 ">
                          {claimTableBody()}

                        </div>
                      </div>
                    </div>
                  </>



                </div>

              </section>
            </div>
            <div className="content-overlay"></div>
          </div>
        </div>
      </div>
      <div> </div>
    </>
  );
};


const mapStateToProps = (state) => {
  return {
    global: state.bceao.global,
    open: state.bceao.open,

  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    globalChanged: (global) => {
      dispatch(globalChanged(global));
    },
    openChanged: (open) => {
      dispatch(openChanged(open));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Bceao);