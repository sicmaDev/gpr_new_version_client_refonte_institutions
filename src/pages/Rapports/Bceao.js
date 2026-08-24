import React from 'react'
import { connect } from "react-redux";
import { INSTITUTION_ADDRESS, INSTITUTION_AGREMENT, INSTITUTION_EMAIL, INSTITUTION_LOGO, INSTITUTION_NAME, INSTITUTION_PAYS, INSTITUTION_TEL } from '../../Utils/globals';
import { handlePrintAvance } from '../../Utils/tables';
import { cleanDate, loadItemFromLocalStorage, loadItemFromSessionStorage, today } from '../../Utils/utils';
import { table2XLSX } from '../../Utils/tabletoexcel';
import { useState, useRef } from 'react';
import { useEffect } from 'react';
import DatePicker from "react-datepicker";
import { mdColors } from '../../Utils/colors';
import { reportBceaoApi } from '../../apis/Rapports/BceaoApi';
import { Dialog, DialogTitle, DialogContent, DialogContentText } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import { globalChanged, openChanged } from '../../redux/actions/Rapports/BceaoActions';
import moment from 'moment';
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
  const [exportLoading, setExportLoading] = useState(null);
  const [highlightExport, setHighlightExport] = useState(false);
  const pageTopRef = useRef(null);

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

  let userAuth = loadItemFromSessionStorage("app-user") !== undefined ? loadItemFromSessionStorage("app-user") : undefined;
  let users = loadItemFromSessionStorage("app-users") !== undefined ? loadItemFromSessionStorage("app-users") : undefined;
  let appInstitution = loadItemFromLocalStorage("app-institution") !== undefined && (loadItemFromLocalStorage("app-institution").length !==0)  ? loadItemFromLocalStorage("app-institution") : undefined;

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
    setExportLoading("PDF");
    try {
      const childWindow = window.open("", "modal");
      if (!childWindow) {
        alert("Veuillez autoriser les popups pour l'impression.");
        return;
      }
      const dom = await prepareToPrint(childWindow);
      handlePrintAvance(childWindow, dom);
    } finally {
      setExportLoading(null);
    }
  };

  const prepareReportTablesToXLSX = () => {
    setExportLoading("Excel");
    try {
      let filename = "Statistiques_BCEAO_GPR_" + today().replaceAll("/", "");
      table2XLSX(filename, "", 2);
    } finally {
      setExportLoading(null);
    }
  };

  const printToWord = async () => {
    setExportLoading("Word");
    try {
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
    } finally {
      setExportLoading(null);
    }
  };
  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .bceao-table-wrap table.table-xlsx { width: 100%; border-collapse: collapse; font-size: 13px; }
        .bceao-table-wrap table.table-xlsx td, .bceao-table-wrap table.table-xlsx th { border: 1px solid #E2E8F0; padding: 8px 12px; }
        .bceao-table-wrap table.table-xlsx thead td { background: #0F4C81; color: #fff; font-weight: 700; }
        .bceao-table-wrap table.table-xlsx tbody tr:nth-child(odd) { background: #F8FAFC; }
      `}</style>
      <div id="trSimple" ></div>
      <div id="main" style={{ marginBottom: "80px" }}>
        {showSearch && (
          <Dialog
            open={props.open}
            onClose={(e) => { e.preventDefault(); handleClose() }}
            fullWidth
            maxWidth="sm"
            PaperProps={{ style: { borderRadius: 16, overflow: "visible" } }}
          >
            <DialogTitle style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 12px", borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" fill="none" stroke="#0F4C81" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Définir une période</span>
              </div>
              <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 22, lineHeight: 1, padding: 4, borderRadius: 6 }}>✕</button>
            </DialogTitle>

            <DialogContent style={{ padding: "20px 24px", overflowY: "auto", overflowX: "hidden" }}>

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
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "9px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0",
                      background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", textDecoration: "none",
                    }}
                  >
                    <span className="text-nowrap">Effacer Tout</span>
                  </a>
                </div>
                <div className="col l6 m6 s12 mt-4">
                  <a
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "9px 16px", borderRadius: 10, border: "1.5px solid #0F4C81",
                      background: "#0F4C81", color: "#fff", fontSize: 13, fontWeight: 700,
                      cursor: "pointer", textDecoration: "none",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      rapportSubmit();
                    }}
                  >
                    <CheckIcon style={{ fontSize: 18 }} />
                    <span className="text-nowrap">
                      Générer
                    </span>
                  </a>
                </div>
              </div>

            </DialogContent>

          </Dialog>

        )}

        {/* ── PAGE HEADER / ACTION BAR ── */}
        <div ref={pageTopRef} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", padding: "20px 24px", marginBottom: 16 }}>
          <div
            id="export-bar"
            style={{
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              borderRadius: 12, padding: "6px 8px", margin: "-6px -8px",
              transition: "box-shadow 0.3s ease, background 0.3s ease",
              ...(highlightExport ? {
                background: "rgba(59,130,246,0.07)",
                boxShadow: "0 0 0 3px rgba(59,130,246,0.35)",
              } : {}),
            }}
          >
            <button
              onClick={() => { setshowSearch(true); props.openChanged(true); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
              Filtres
            </button>
            {[
              { label: "PDF",   color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5", action: printToPDF,
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14a2 2 0 0 0 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg> },
              { label: "Excel", color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC", action: prepareReportTablesToXLSX,
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M7 13.06L8.18 15.28H9.97L8 12.06L9.93 8.89H8.22L7.13 10.9 7.09 10.96 7.06 11.03Q6.8 10.5 6.5 9.96L5.45 8.89H3.78L5.73 12.06 3.67 15.28H5.42M13.88 19.5V17H8.25V19.5M13.88 15.75V12.63H8.25V15.75M13.88 11.38V8.25H8.25V11.38M20.75 19.5V17H15.13V19.5M20.75 15.75V12.63H15.13V15.75M20.75 11.38V8.25H15.13V11.38Z"/></svg> },
              { label: "Word",  color: "#1D4ED8", bg: "#EFF6FF", border: "#93C5FD", action: printToWord,
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M7 15.25H8.5L9.88 10.58 11.25 15.25H12.75L14.82 8.75H13.31L12 13.41 10.63 8.75H9.12L7.82 13.41 6.5 8.75H5L7 15.25M20.75 19.5V17H15.13V19.5M20.75 15.75V12.63H15.13V15.75M20.75 11.38V8.25H15.13V11.38M13.88 19.5V17H8.25V19.5M13.88 15.75V12.63H8.25V15.75M13.88 11.38V8.25H8.25V11.38Z"/></svg> },
            ].map(({ label, color, bg, border, action, icon }) => {
              const isLoading = exportLoading === label;
              return (
              <button
                key={label}
                onClick={action}
                disabled={exportLoading !== null}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 10,
                  border: `1.5px solid ${border}`,
                  background: bg,
                  color: exportLoading !== null ? "#94A3B8" : color,
                  fontSize: 12.5, fontWeight: 700,
                  cursor: exportLoading !== null ? "not-allowed" : "pointer",
                  opacity: exportLoading !== null && !isLoading ? 0.5 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {isLoading ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                ) : icon}
                {isLoading ? "En cours..." : label}
              </button>
            );
            })}
          </div>
        </div>

        {/* ── REPORT CONTENT ── */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", padding: "24px" }} id="rapportBceao">
          <div id="enteteRapport" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingBottom: 16, borderBottom: "2px solid #0F4C81", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {logoInstitution && <img src={logoInstitution} alt="logo" style={{ height: 64, objectFit: "contain" }} className="report-logo" />}
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>{institution}</div>
                  {agrement && <div style={{ fontSize: 12, color: "#64748b" }}><span style={{ fontWeight: 600, color: "#374151" }}>Agrément :</span> {agrement}</div>}
                  {adresse  && <div style={{ fontSize: 12, color: "#64748b" }}><span style={{ fontWeight: 600, color: "#374151" }}>Adresse :</span> {adresse}</div>}
                  {tel      && <div style={{ fontSize: 12, color: "#64748b" }}><span style={{ fontWeight: 600, color: "#374151" }}>Téléphone :</span> {tel}</div>}
                  {email    && <div style={{ fontSize: 12, color: "#64748b" }}><span style={{ fontWeight: 600, color: "#374151" }}>Email :</span> {email}</div>}
                </div>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Généré le</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                  {new Date().toLocaleDateString("fr-FR", { day: "numeric", year: "numeric", month: "long" })}
                </div>
              </div>
            </div>
          </div>

          <div id="titleRapport" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ height: 3, flex: 1, background: "linear-gradient(to right, #0F4C81, transparent)" }} />
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0F4C81", textTransform: "uppercase", letterSpacing: "0.8px", textAlign: "center" }}>
              Rapport sous le format de la Commission Bancaire
            </span>
            <div style={{ height: 3, flex: 1, background: "linear-gradient(to left, #0F4C81, transparent)" }} />
          </div>

          <div id="critereRapport" style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#0F4C81", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 20, padding: "3px 12px" }}>
              Période Concernée : {props.global?.periode}
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#6B7280", background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 20, padding: "3px 12px" }}>
              Généré par {userAuth.firstAndLastName}
            </span>
          </div>

          <div id="dashRapport">
            <div style={{ marginBottom: 32 }} id="toeClaim">
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 12 }} id="titleObjetsEtats">
                <div style={{ width: 4, height: 16, borderRadius: 2, background: "#0F4C81" }} />
                Statistiques
              </div>
              <div className="bceao-table-wrap">
                {claimTableHead()}
              </div>
            </div>

            <div id="toeClaim">
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 12 }} id="titleObjetsEtats">
                <div style={{ width: 4, height: 16, borderRadius: 2, background: "#0F4C81" }} />
                Details des réclamations ou dénonciations
              </div>
              <div className="bceao-table-wrap">
                {claimTableBody()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB Exporter */}
      <button
        onClick={() => {
          if (pageTopRef.current) {
            pageTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          setHighlightExport(true);
          setTimeout(() => setHighlightExport(false), 2000);
        }}
        style={{
          position: "fixed", bottom: 72, right: 32, zIndex: 999,
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 16px", borderRadius: 50, border: "none",
          background: "linear-gradient(135deg, #0F4C81 0%, #1E88E5 100%)",
          color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(15,76,129,0.4)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(15,76,129,0.55)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(15,76,129,0.4)"; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
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