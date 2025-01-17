import React, { useEffect, useImperativeHandle, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { mdColors } from "../../Utils/colors";
import { Link, NavLink } from "react-router-dom";
import {
  cleanDate,
  hexToRgb,
  loadItemFromLocalStorage,
  loadItemFromSessionStorage,
  normalizeStats,
  resizeImage,
  selectableYears,
  today,
} from "../../Utils/utils";
import {
  HOST,
  INSTITUTION_ADDRESS,
  INSTITUTION_AGREMENT,
  INSTITUTION_EMAIL,
  INSTITUTION_LOGO,
  INSTITUTION_NAME,
  INSTITUTION_TEL,
} from "../../Utils/globals";
import axios from "axios";
import { table2XLSX } from "../../Utils/tabletoexcel";
import { useRef } from "react";
import { handlePrintAvance } from "../../Utils/tables";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Doughnut, Line, Pie, Radar } from "react-chartjs-2";
import "chartjs-plugin-datalabels";
import { reportApi, reportApiFiltres } from "../../apis/Rapports/GlobalsApi";
import {
  basicStatChanged,
  claimReportChanged,
  claimTrendChanged,
  claimsChanged,
  denunReportChanged,
  denunciationsChanged,
  directorChanged,
  endChanged,
  endDPChanged,
  genreTrendChanged,
  globalTrendChanged,
  monthsYearsChanged,
  piloteChanged,
  posChanged,
  recByAgenceChanged,
  reportErrorsChanged,
  responseRateChanged,
  satisfactionRateChanged,
  startChanged,
  startDPChanged,
  statChanged,
  sugReportChanged,
  suggestionsChanged,
  unitChanged,
  yearChanged,
} from "../../redux/actions/Rapports/GlobalActions";
import { connect } from "react-redux";
import CheckIcon from "@mui/icons-material/Check";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { BarController, DoughnutController } from "chart.js";
import { PieController } from "chart.js";
import {
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
} from "chart.js";
import { registerables } from "chart.js";
import GaugeChart from "react-gauge-chart";
import { Dialog, DialogContent, DialogContentText } from "@mui/material";
import { Chat } from "@mui/icons-material";
import ChartDataLabels from "chartjs-plugin-datalabels";
// import ChartDataLabels from "chartjs-plugin-labels";
import html2canvas from "html2canvas";
import { MyGaugeChart } from "../../Utils/MyGaugeChart";



Chart.register(ChartDataLabels);
Chart.register(...registerables);

Chart.defaults.set("plugins.datalabels", {
  color: "#FFFFFF",
  font: {
    weight: "bold",
  },
  // render: "percentage",

  // labels: {
  //   render: "percentage",
  //   fontColor: function (data) {
  //     let rgb = hexToRgb(data.dataset.backgroundColor[data.index]);
  //     let threshold = 140;
  //     let luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  //     return luminance > threshold ? "black" : "white";
  //   },
  // },
});
// Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale,GaugeController);

// Chart.register(ArcElement, Tooltip, Legend);
// Chart.register(BarController, DoughnutController, LineController, PieController);
const styles = {
  control: (base) => ({
    ...base,
    height: 35,
    minHeight: 35,
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
};
var data = [40, 70, 100];
var value = 76;

const Global = (props) => {
  const [open, setOpen] = React.useState(false);
  const [showSearch, setshowSearch] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userAll, setUserAll] = useState([]);
  const [plainteType, setPlainteType] = useState([]);
  const [objet, setObjet] = useState([]);
  const [recoredBy, setRecoredBy] = useState([]);
  const [unit, setUnit] = useState([]);
  const [etatState, setEtatState] = useState([]);
  const [product, setProduct] = useState([]);
  const [other, setOther] = useState(false);
  const [optionsState, setOptionsState] = useState([]);
  const [closeObjet, setCloseObjet] = useState(false);
  const [claimShow, setClaimShow] = useState(true);
  const [suggestionShow, setSuggestionShow] = useState(true);
  const [denunciationShow, setDenunciationShow] = useState(true);
  const [claimAll, setClaimAll] = useState([]);
  const [chartList, setChartList] = useState([]);
  const [claimChartList, setClaimChartList] = useState([]);
  const [denunChartList, setDenunChartList] = useState([]);
  const [sugChartList, setSugChartList] = useState([]);
  const [suggestionAll, setSuggestionAll] = useState([]);
  const [denonciationAll, setDenonciationAll] = useState([]);
  const [page, setPage] = useState(true);

  const handleClose = (e) => {
    setOpen(false);
    setshowSearch(false);
    cleanForm(e);
  };
  let yearOptions = [];
  yearOptions = selectableYears().map((year) => {
    return { label: year, value: year };
  });
  yearOptions.push({ label: "Toutes ", value: 0 });
  //Users option
  let users =
    loadItemFromSessionStorage("app-users") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-users"))
      : undefined;
  let optionsUsers = [];
  users.map((one) => {
    return optionsUsers.push({
      label: one.firstAndLastName,
      value: one.id,
    });
  });
  //Plainte type
  let optionsPlainteType = [
    { label: "Réclamations", value: "claim" },
    { label: "Dénonciations", value: "denunciation" },
    { label: "Suggestions", value: "suggestion" },
  ];

  let subjects =
    loadItemFromSessionStorage("app-objets") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-objets"))
      : undefined;
  let optionsObjet = [];
  if (subjects !== undefined) {
    subjects.map((subject) => {
      return optionsObjet.push({
        label: subject.libelle,
        value: subject.id,
      });
    });
  }

  //Unites
  let units =
    loadItemFromSessionStorage("app-ps") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-ps"))
      : undefined;
  let optionsUnits = [];
  if (units !== undefined) {
    units.map((unit) => {
      return optionsUnits.push({
        label: unit.libelle,
        value: unit.id,
      });
    });
  }

  //Produit
  let optionsProducts = [];
  const products =
    loadItemFromSessionStorage("app-produits") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-produits"))
      : undefined;
  if (products !== undefined) {
    products.map((product) => {
      return optionsProducts.push({
        label: product.libelle,
        value: product.id,
      });
    });
  }
  const userAuth = JSON.parse(loadItemFromSessionStorage("app-user"));
       
  const globalPieChartRef = useRef(null);
  const globalLineChartRef = useRef(null);
  const globalByCanalPieChartRef = useRef(null);
  const globalByCanalBarChartRef = useRef(null);
  const globalByObjetPieChartRef = useRef(null);
  const globalByObjetBarChartRef = useRef(null);
  const resolutionPieChartRef = useRef(null);
  const resolutionDelaiBarChartRef = useRef(null);
  const evolutionByAgenceByAnneeBarChartRef = useRef(null);
  const evolutionTauxDeResolutionByAnneeBarChartRef = useRef(null);
  const claimByAgencePieChartRef = useRef(null);
  const claimByAgenceBarChartRef = useRef(null);
  const claimByGenderPieChartRef = useRef(null);
  const claimByGenderBarChartRef = useRef(null);
  const denunByAgencePieChartRef = useRef(null);
  const denunByAgenceBarChartRef = useRef(null);
  const sugByAgencePieChartRef = useRef(null);
  const sugByAgenceBarChartRef = useRef(null);
  const sugByGenderPieChartRef = useRef(null);
  const sugByGenderBarChartRef = useRef(null);
  const claimByCanalPieChartRef = useRef(null);
  const claimByCanalBarChartRef = useRef(null);
  const denunByCanalPieChartRef = useRef(null);
  const denunByCanalBarChartRef = useRef(null);
  const sugByCanalPieChartRef = useRef(null);
  const sugByCanalBarChartRef = useRef(null);
  const claimByObjetPieChartRef = useRef(null);
  const claimByObjetBarChartRef = useRef(null);
  const denunByObjetPieChartRef = useRef(null);
  const denunByObjetBarChartRef = useRef(null);
  const claimByGravitePieChartRef = useRef(null);
  const claimByGraviteBarChartRef = useRef(null);
  const denunByGravitePieChartRef = useRef(null);
  const denunByGraviteBarChartRef = useRef(null);
  const claimBySatisfactionPieChartRef = useRef(null);
  const claimBySatisfactionLineChartRef = useRef(null);

  useEffect(() => {
    // setChartList([])
    reportApi(props).then((r) => {});
    //  var ctx = document.getElementById("myChart2").getContext("2d");
    //   const myGauge = new Chart(ctx, config);
    //   myGauge.update();
  }, []);

  //Effacer tout
  const cleanForm = (e) => {
    e.preventDefault();
    props.yearChanged("");
    setPlainteType([]);
    setObjet([]);
    setEtatState([]);
    setProduct([]);
    setRecoredBy([]);
    setStartDate("");
    setEndDate("");
    setUnit([]);

    setOther(false);
    // document.querySelector("#searchShow").click();
  };
  const cleanForm2 = (e) => {
    e.preventDefault();
    props.genreTrendChanged([]);
    props.claimReportChanged([]);
    props.denunReportChanged([]);
    props.sugReportChanged([]);
  };

  const genereReport = (e) => {
    e.preventDefault();
    cleanForm2(e);

    if (plainteType.length !== 0) {
      plainteType.forEach((type) => {
        plainteType.includes("claim")
          ? setClaimShow(true)
          : setClaimShow(false);
        plainteType.includes("denunciation")
          ? setDenunciationShow(true)
          : setDenunciationShow(false);
        plainteType.includes("suggestion")
          ? setSuggestionShow(true)
          : setSuggestionShow(false);

        // if (type === "suggestion") {setSuggestionShow(true);}else{setSuggestionShow(false);}

        // if (type === "claim") {setClaimShow(true);}else{setClaimShow(false);}

        // if (type === "denunciation") {setDenunciationShow(true);}else{setDenunciationShow(false);}
      });
    } else {
      setDenunciationShow(true);
      setClaimShow(true);
      setSuggestionShow(true);
    }

    let filtres = {};

    filtres["year"] = props.year;
    // filtres["types_plainte"] = plainteType ;
    filtres["objets"] = objet;
    filtres["etats"] = etatState;
    filtres["products"] = product;
    filtres["saved_by"] = recoredBy;
    filtres["receiveStart"] = cleanDate(startDate);
    filtres["receiveEnd"] = cleanDate(endDate);
    filtres["servicePoints"] = unit;
    filtres["canals"] = [];

    handleClose(e);
    // console.log("filtresreport", filtres);
    reportApiFiltres(props, filtres).then((r) => {});
  };

  // const rapportSubmit = (e) => {
  //   e.preventDefault();
  //   let claimShow,
  //     suggestionShow,
  //     denunciationShow = false;
  //   setshowSearch(false);
  //   setDenunciationShow(false);
  //   setClaimShow(false);
  //   setSuggestionShow(false);
  //   if (plainteType.length != 0) {
  //     plainteType.forEach((type) => {
  //       if (type == "suggestion") {
  //         suggestionShow = true;
  //         setSuggestionShow(true);
  //       }
  //       if (type == "claim") {
  //         claimShow = true;
  //         setClaimShow(true);
  //       }
  //       if (type == "denunciation") {
  //         denunciationShow = true;
  //         setDenunciationShow(true);
  //       }

  //       return 0;
  //     });
  //   } else {
  //     suggestionShow = true;
  //     claimShow = true;
  //     denunciationShow = true;
  //     setDenunciationShow(true);
  //     setClaimShow(true);
  //     setSuggestionShow(true);
  //   }
  //   if (suggestionShow) {
  //     let traite = false;
  //     if (suggestionAll.length != 0) {
  //       let resultState = [];
  //       if (etatState.length != 0) {
  //         etatState.forEach((etat) => {
  //           if (etat == "nontraite") {
  //             let okay = suggestionAll.filter((e) => e.status == 1);

  //             if (okay.length >= 1) {
  //               okay.forEach((ok) => {
  //                 resultState.push(ok);
  //                 return resultState;
  //               });
  //             }
  //           }
  //           if (etat == "traite") {
  //             traite = true;
  //             let okay = suggestionAll.filter((e) => e.status == 2);

  //             if (okay.length >= 1) {
  //               okay.forEach((ok) => {
  //                 resultState.push(ok);
  //                 return resultState;
  //               });
  //             }
  //           }
  //           return resultState;
  //         });
  //       } else {
  //         resultState = suggestionAll;
  //         traite = true;
  //       }

  //       //Product
  //       let resultProduct = [];
  //       if (product.length != 0) {
  //         product.forEach((prod) => {
  //           let okay = resultState.filter((e) => e.product == prod);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultProduct.push(ok);
  //               return resultProduct;
  //             });
  //           }
  //           return resultProduct;
  //         });
  //       } else {
  //         resultProduct = resultState;
  //       }

  //       //Unite operationelle
  //       let resultUnit = [];
  //       if (unit.length != 0) {
  //         unit.forEach((un) => {
  //           let okay = resultProduct.filter((e) => e.unit == un);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultUnit.push(ok);
  //               return resultUnit;
  //             });
  //           }
  //           return resultUnit;
  //         });
  //       } else {
  //         resultUnit = resultProduct;
  //       }

  //       //Base de provenance
  //       let resultSource = [];
  //       if (agency.length != 0) {
  //         agency.forEach((ag) => {
  //           let okay = resultUnit.filter((e) => e.source == ag);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultSource.push(ok);
  //               return resultSource;
  //             });
  //           }
  //           return resultSource;
  //         });
  //       } else {
  //         resultSource = resultUnit;
  //       }

  //       //Enregistrer par
  //       let resultRecordBy = [];
  //       if (recoredBy.length != 0) {
  //         recoredBy.forEach((rec) => {
  //           let okay = resultSource.filter((e) => e.recorded_by.id == rec);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultRecordBy.push(ok);
  //               return resultRecordBy;
  //             });
  //           }
  //           return resultRecordBy;
  //         });
  //       } else {
  //         resultRecordBy = resultSource;
  //       }

  //       //Traiter par
  //       let resultHandleBy = [];
  //       if (handleBy.length != 0) {
  //         handleBy.forEach((rec) => {
  //           let okay = resultRecordBy
  //             .filter((e) => e.handled_by != null)
  //             .filter((e) => e.handled_by.id == rec);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultHandleBy.push(ok);
  //               return resultHandleBy;
  //             });
  //           }
  //           return resultHandleBy;
  //         });
  //       } else {
  //         resultHandleBy = resultRecordBy;
  //       }

  //       //Enregistrer le

  //       let resultRecordDate = [];
  //       if (startDate != "" && endDate != "") {
  //         resultRecordDate = resultHandleBy.filter((e) => {
  //           let t = e.createdAt.split("T");
  //           let endDateTommorow = new Date(endDate);
  //           endDateTommorow.setDate(endDateTommorow.getDate() + 1);

  //           return (
  //             new Date(t[0]) >= startDate && new Date(t[0]) <= endDateTommorow
  //           );
  //         });
  //       } else if (startDate == "" && endDate != "") {
  //         resultRecordDate = resultHandleBy.filter((e) => {
  //           let t = e.createdAt.split("T");
  //           let endDateTommorow = new Date(endDate);
  //           endDateTommorow.setDate(endDateTommorow.getDate() + 1);

  //           return (
  //             new Date(t[0]) >= new Date("1999-01-01") &&
  //             new Date(t[0]) <= endDateTommorow
  //           );
  //         });
  //       } else if (startDate != "" && endDate == "") {
  //         resultRecordDate = resultHandleBy.filter((e) => {
  //           let t = e.createdAt.split("T");

  //           let endDateTommorow = new Date();
  //           endDateTommorow.setDate(endDateTommorow.getDate() + 1);
  //           return (
  //             new Date(t[0]) >= startDate && new Date(t[0]) <= endDateTommorow
  //           );
  //         });
  //       } else {
  //         resultRecordDate = resultHandleBy;
  //       }

  //       //Traiter le

  //       let resultHandleDate = [];
  //       if (traite) {
  //         if (startHandleDate != "" && endHandleDate != "") {
  //           resultHandleDate = resultRecordDate.filter((e) => {
  //             let t = e.handledAt.split("T");
  //             let endDateTommorow = new Date(endHandleDate);
  //             endDateTommorow.setDate(endDateTommorow.getDate() + 1);

  //             return (
  //               new Date(t[0]) >= startHandleDate &&
  //               new Date(t[0]) <= endDateTommorow
  //             );
  //           });
  //         } else if (startHandleDate == "" && endHandleDate != "") {
  //           resultHandleDate = resultRecordDate.filter((e) => {
  //             let t = e.handledAt.split("T");
  //             let endDateTommorow = new Date(endHandleDate);
  //             endDateTommorow.setDate(endDateTommorow.getDate() + 1);

  //             return (
  //               new Date(t[0]) >= new Date("1999-01-01") &&
  //               new Date(t[0]) <= endDateTommorow
  //             );
  //           });
  //         } else if (startHandleDate != "" && endHandleDate == "") {
  //           resultHandleDate = resultRecordDate.filter((e) => {
  //             let t = e.handledAt.split("T");

  //             let endDateTommorow = new Date();
  //             endDateTommorow.setDate(endDateTommorow.getDate() + 1);
  //             return (
  //               new Date(t[0]) >= startHandleDate &&
  //               new Date(t[0]) <= endDateTommorow
  //             );
  //           });
  //         } else {
  //           resultHandleDate = resultRecordDate;
  //         }
  //       } else {
  //         resultHandleDate = resultRecordDate;
  //       }

  //       setResultGeneralSuggestion(resultHandleDate);
  //     } else {
  //       setResultGeneralSuggestion([]);
  //     }
  //   } else {
  //     setResultGeneralSuggestion([]);
  //   }

  //   if (claimShow) {
  //     let traite = false;
  //     if (claimAll.length != 0) {
  //       //Etat
  //       let resultState = [];

  //       if (etatState.length != 0) {
  //         etatState.forEach((etat) => {
  //           if (etat == "nontraite") {
  //             let okay = claimAll.filter((e) => e.status == 1);

  //             if (okay.length >= 1) {
  //               okay.forEach((ok) => {
  //                 resultState.push(ok);
  //                 return resultState;
  //               });
  //             }
  //           }
  //           if (etat == "traite") {
  //             traite = true;
  //             let okay = claimAll.filter((e) => e.status == 5);

  //             if (okay.length >= 1) {
  //               okay.forEach((ok) => {
  //                 resultState.push(ok);
  //                 return resultState;
  //               });
  //             }
  //           }
  //           if (etat == "affecte") {
  //             let okay = claimAll.filter((e) => e.status == 2);

  //             if (okay.length >= 1) {
  //               okay.forEach((ok) => {
  //                 resultState.push(ok);
  //                 return resultState;
  //               });
  //             }
  //           }
  //           if (etat == "satisfait") {
  //             let okay = claimAll.filter(
  //               (e) => e.status == 6 && e.appraisal == 1
  //             );

  //             if (okay.length >= 1) {
  //               okay.forEach((ok) => {
  //                 resultState.push(ok);
  //                 return resultState;
  //               });
  //             }
  //           }
  //           if (etat == "nonsatisfaire") {
  //             let okay = claimAll.filter(
  //               (e) => e.status == 6 && e.appraisal == 0
  //             );

  //             if (okay.length >= 1) {
  //               okay.forEach((ok) => {
  //                 resultState.push(ok);
  //                 return resultState;
  //               });
  //             }
  //           }
  //           if (etat == "approuver") {
  //             let okay = claimAll.filter((e) => e.status == 3);

  //             if (okay.length >= 1) {
  //               okay.forEach((ok) => {
  //                 resultState.push(ok);
  //                 return resultState;
  //               });
  //             }
  //           }
  //           if (etat == "desapprouver") {
  //             let okay = claimAll.filter((e) => e.status == 4);

  //             if (okay.length >= 1) {
  //               okay.forEach((ok) => {
  //                 resultState.push(ok);
  //                 return resultState;
  //               });
  //             }
  //           }

  //           return resultState;
  //         });
  //       } else {
  //         resultState = claimAll;
  //         traite = true;
  //       }

  //       //Objet
  //       let resultObjet = [];

  //       if (objet.length != 0) {
  //         let tabSearch = objet;
  //         if (toutsauf == "oui") {
  //           tabSearch = [];
  //           subjects.map((sub) => {
  //             return tabSearch.push(sub.name);
  //           });
  //           objet.map((ob) => {
  //             if (tabSearch.includes(ob)) {
  //               tabSearch.splice(tabSearch.indexOf(ob), 1);
  //             }
  //           });
  //         }
  //         tabSearch.forEach((ob) => {
  //           let okay = resultState.filter((sub) => {
  //             return sub.subject == ob;
  //           });
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultObjet.push(ok);
  //             });
  //           }
  //         });
  //       } else {
  //         resultObjet = resultState;
  //       }

  //       //Product
  //       let resultProduct = [];
  //       if (product.length != 0) {
  //         product.forEach((prod) => {
  //           let okay = resultObjet.filter((e) => e.product == prod);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultProduct.push(ok);
  //               return resultProduct;
  //             });
  //           }
  //           return resultProduct;
  //         });
  //       } else {
  //         resultProduct = resultObjet;
  //       }

  //       //Unite operationelle
  //       let resultUnit = [];
  //       if (unit.length != 0) {
  //         unit.forEach((un) => {
  //           let okay = resultProduct.filter((e) => e.unit == un);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultUnit.push(ok);
  //               return resultUnit;
  //             });
  //           }
  //           return resultUnit;
  //         });
  //       } else {
  //         resultUnit = resultProduct;
  //       }

  //       //Base de provenance
  //       let resultSource = [];
  //       if (agency.length != 0) {
  //         agency.forEach((ag) => {
  //           let okay = resultUnit.filter((e) => e.source == ag);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultSource.push(ok);
  //               return resultSource;
  //             });
  //           }
  //           return resultSource;
  //         });
  //       } else {
  //         resultSource = resultUnit;
  //       }

  //       //Enregistrer par
  //       let resultRecordBy = [];
  //       if (recoredBy.length != 0) {
  //         recoredBy.forEach((rec) => {
  //           let okay = resultSource.filter((e) => e.recorded_by.id == rec);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultRecordBy.push(ok);
  //               return resultRecordBy;
  //             });
  //           }
  //           return resultRecordBy;
  //         });
  //       } else {
  //         resultRecordBy = resultSource;
  //       }

  //       //Traiter par
  //       let resultHandleBy = [];
  //       if (handleBy.length != 0) {
  //         handleBy.forEach((rec) => {
  //           let okay = resultRecordBy
  //             .filter((e) => e.handled_by != null)
  //             .filter((e) => e.handled_by.id == rec);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultHandleBy.push(ok);
  //               return resultHandleBy;
  //             });
  //           }
  //           return resultHandleBy;
  //         });
  //       } else {
  //         resultHandleBy = resultRecordBy;
  //       }

  //       //Enregistrer le

  //       let resultRecordDate = [];
  //       if (startDate != "" && endDate != "") {
  //         resultRecordDate = resultHandleBy.filter((e) => {
  //           let t = e.createdAt.split("T");
  //           let endDateTommorow = new Date(endDate);
  //           endDateTommorow.setDate(endDateTommorow.getDate() + 1);

  //           return (
  //             new Date(t[0]) >= startDate && new Date(t[0]) <= endDateTommorow
  //           );
  //         });
  //       } else if (startDate == "" && endDate != "") {
  //         resultRecordDate = resultHandleBy.filter((e) => {
  //           let t = e.createdAt.split("T");
  //           let endDateTommorow = new Date(endDate);
  //           endDateTommorow.setDate(endDateTommorow.getDate() + 1);

  //           return (
  //             new Date(t[0]) >= new Date("1999-01-01") &&
  //             new Date(t[0]) <= endDateTommorow
  //           );
  //         });
  //       } else if (startDate != "" && endDate == "") {
  //         resultRecordDate = resultHandleBy.filter((e) => {
  //           let t = e.createdAt.split("T");

  //           let endDateTommorow = new Date();
  //           endDateTommorow.setDate(endDateTommorow.getDate() + 1);
  //           return (
  //             new Date(t[0]) >= startDate && new Date(t[0]) <= endDateTommorow
  //           );
  //         });
  //       } else {
  //         resultRecordDate = resultHandleBy;
  //       }

  //       //Traiter le

  //       let resultHandleDate = [];
  //       if (traite) {
  //         if (startHandleDate != "" && endHandleDate != "") {
  //           resultHandleDate = resultRecordDate.filter((e) => {
  //             let t = e.handledAt.split("T");
  //             let endDateTommorow = new Date(endHandleDate);
  //             endDateTommorow.setDate(endDateTommorow.getDate() + 1);

  //             return (
  //               new Date(t[0]) >= startHandleDate &&
  //               new Date(t[0]) <= endDateTommorow
  //             );
  //           });
  //         } else if (startHandleDate == "" && endHandleDate != "") {
  //           resultHandleDate = resultRecordDate.filter((e) => {
  //             let t = e.handledAt.split("T");
  //             let endDateTommorow = new Date(endHandleDate);
  //             endDateTommorow.setDate(endDateTommorow.getDate() + 1);

  //             return (
  //               new Date(t[0]) >= new Date("1999-01-01") &&
  //               new Date(t[0]) <= endDateTommorow
  //             );
  //           });
  //         } else if (startHandleDate != "" && endHandleDate == "") {
  //           resultHandleDate = resultRecordDate.filter((e) => {
  //             let t = e.handledAt.split("T");

  //             let endDateTommorow = new Date();
  //             endDateTommorow.setDate(endDateTommorow.getDate() + 1);
  //             return (
  //               new Date(t[0]) >= startHandleDate &&
  //               new Date(t[0]) <= endDateTommorow
  //             );
  //           });
  //         } else {
  //           resultHandleDate = resultRecordDate;
  //         }
  //       } else {
  //         resultHandleDate = resultRecordDate;
  //       }

  //       claimDashboard(resultHandleDate);

  //       setResultGeneralClaim(resultHandleDate);

  //     } else {
  //       setResultGeneralClaim([]);
  //     }
  //   } else {
  //     setResultGeneralClaim([]);
  //   }

  //   if (denunciationShow) {
  //     let traite = false;
  //     if (denonciationAll.length != 0) {
  //       //Etat
  //       let resultState = [];

  //       if (etatState.length != 0) {
  //         etatState.forEach((etat) => {
  //           if (etat == "nontraite") {
  //             let okay = denonciationAll.filter((e) => e.status == 1);

  //             if (okay.length >= 1) {
  //               okay.forEach((ok) => {
  //                 resultState.push(ok);
  //                 return resultState;
  //               });
  //             }
  //           }
  //           if (etat == "traite") {
  //             traite = true;
  //             let okay = denonciationAll.filter((e) => e.status == 2);

  //             if (okay.length >= 1) {
  //               okay.forEach((ok) => {
  //                 resultState.push(ok);
  //                 return resultState;
  //               });
  //             }
  //           }

  //           return resultState;
  //         });
  //       } else {
  //         resultState = denonciationAll;
  //         traite = true;
  //       }

  //       //Objet
  //       let resultObjet = [];

  //       if (objet.length != 0) {
  //         let tabSearch = objet;
  //         if (toutsauf == "oui") {
  //           tabSearch = [];
  //           subjects.map((sub) => {
  //             return tabSearch.push(sub.name);
  //           });
  //           objet.map((ob) => {
  //             if (tabSearch.includes(ob)) {
  //               tabSearch.splice(tabSearch.indexOf(ob), 1);
  //             }
  //           });
  //         }
  //         tabSearch.forEach((ob) => {
  //           let okay = resultState.filter((sub) => {
  //             return sub.subject == ob;
  //           });
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultObjet.push(ok);
  //             });
  //           }
  //         });
  //       } else {
  //         resultObjet = resultState;
  //       }

  //       //Product
  //       let resultProduct = [];
  //       if (product.length != 0) {
  //         product.forEach((prod) => {
  //           let okay = resultObjet.filter((e) => e.product == prod);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultProduct.push(ok);
  //               return resultProduct;
  //             });
  //           }
  //           return resultProduct;
  //         });
  //       } else {
  //         resultProduct = resultObjet;
  //       }

  //       //Unite operationelle
  //       let resultUnit = [];
  //       if (unit.length != 0) {
  //         unit.forEach((un) => {
  //           let okay = resultProduct.filter((e) => e.unit == un);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultUnit.push(ok);
  //               return resultUnit;
  //             });
  //           }
  //           return resultUnit;
  //         });
  //       } else {
  //         resultUnit = resultProduct;
  //       }

  //       //Base de provenance
  //       let resultSource = [];
  //       if (agency.length != 0) {
  //         agency.forEach((ag) => {
  //           let okay = resultUnit.filter((e) => e.source == ag);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultSource.push(ok);
  //               return resultSource;
  //             });
  //           }
  //           return resultSource;
  //         });
  //       } else {
  //         resultSource = resultUnit;
  //       }

  //       //Enregistrer par
  //       let resultRecordBy = [];
  //       if (recoredBy.length != 0) {
  //         recoredBy.forEach((rec) => {
  //           let okay = resultSource.filter((e) => e.recorded_by.id == rec);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultRecordBy.push(ok);
  //               return resultRecordBy;
  //             });
  //           }
  //           return resultRecordBy;
  //         });
  //       } else {
  //         resultRecordBy = resultSource;
  //       }

  //       //Traiter par
  //       let resultHandleBy = [];
  //       if (handleBy.length != 0) {
  //         handleBy.forEach((rec) => {
  //           let okay = resultRecordBy
  //             .filter((e) => e.handled_by != null)
  //             .filter((e) => e.handled_by.id == rec);
  //           if (okay.length >= 1) {
  //             okay.forEach((ok) => {
  //               resultHandleBy.push(ok);
  //               return resultHandleBy;
  //             });
  //           }
  //           return resultHandleBy;
  //         });
  //       } else {
  //         resultHandleBy = resultRecordBy;
  //       }

  //       //Enregistrer le

  //       let resultRecordDate = [];
  //       if (startDate != "" && endDate != "") {
  //         resultRecordDate = resultHandleBy.filter((e) => {
  //           let t = e.createdAt.split("T");
  //           let endDateTommorow = new Date(endDate);
  //           endDateTommorow.setDate(endDateTommorow.getDate() + 1);

  //           return (
  //             new Date(t[0]) >= startDate && new Date(t[0]) <= endDateTommorow
  //           );
  //         });
  //       } else if (startDate == "" && endDate != "") {
  //         resultRecordDate = resultHandleBy.filter((e) => {
  //           let t = e.createdAt.split("T");
  //           let endDateTommorow = new Date(endDate);
  //           endDateTommorow.setDate(endDateTommorow.getDate() + 1);

  //           return (
  //             new Date(t[0]) >= new Date("1999-01-01") &&
  //             new Date(t[0]) <= endDateTommorow
  //           );
  //         });
  //       } else if (startDate != "" && endDate == "") {
  //         resultRecordDate = resultHandleBy.filter((e) => {
  //           let t = e.createdAt.split("T");

  //           let endDateTommorow = new Date();
  //           endDateTommorow.setDate(endDateTommorow.getDate() + 1);
  //           return (
  //             new Date(t[0]) >= startDate && new Date(t[0]) <= endDateTommorow
  //           );
  //         });
  //       } else {
  //         resultRecordDate = resultHandleBy;
  //       }

  //       //Traiter le

  //       let resultHandleDate = [];
  //       if (traite) {
  //         if (startHandleDate != "" && endHandleDate != "") {
  //           resultHandleDate = resultRecordDate.filter((e) => {
  //             let t = e.handledAt.split("T");
  //             let endDateTommorow = new Date(endHandleDate);
  //             endDateTommorow.setDate(endDateTommorow.getDate() + 1);

  //             return (
  //               new Date(t[0]) >= startHandleDate &&
  //               new Date(t[0]) <= endDateTommorow
  //             );
  //           });
  //         } else if (startHandleDate == "" && endHandleDate != "") {
  //           resultHandleDate = resultRecordDate.filter((e) => {
  //             let t = e.handledAt.split("T");
  //             let endDateTommorow = new Date(endHandleDate);
  //             endDateTommorow.setDate(endDateTommorow.getDate() + 1);

  //             return (
  //               new Date(t[0]) >= new Date("1999-01-01") &&
  //               new Date(t[0]) <= endDateTommorow
  //             );
  //           });
  //         } else if (startHandleDate != "" && endHandleDate == "") {
  //           resultHandleDate = resultRecordDate.filter((e) => {
  //             let t = e.handledAt.split("T");

  //             let endDateTommorow = new Date();
  //             endDateTommorow.setDate(endDateTommorow.getDate() + 1);
  //             return (
  //               new Date(t[0]) >= startHandleDate &&
  //               new Date(t[0]) <= endDateTommorow
  //             );
  //           });
  //         } else {
  //           resultHandleDate = resultRecordDate;
  //         }
  //       } else {
  //         resultHandleDate = resultRecordDate;
  //       }

  //       setResultGeneralDenonciation(resultHandleDate);
  //     } else {
  //       setResultGeneralDenonciation([]);
  //     }
  //   } else {
  //     setResultGeneralDenonciation([]);
  //   }
  // };

  // //Dashboard Affichage
  const claimDashboard = () => {
    let dableReturn = (
      <div className="col l12 s12 m12 mt-2 mb-2">
        <div className="row center">
          <div
            className="col l10 s12 m12 mt-1 center pt-1"
            style={{
              backgroundColor: "#fefefe",
              borderRadius: "5px",
            }}
          >
            <span style={{ fontSize: "18px", color: "#015182" }}>
              <b>{props.claimReport?.basicStats?.total}</b> Réclamation(s)
            </span>

            <br />
            <table
              width="960"
              border="1"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tr>
                {
                  <>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        A traiter
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Affectée
                      </span>
                    </td>
                   
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Désapprouvée
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Traitée
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Satisfait
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Partiellement satisfait
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Non satisfait
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Contentieux
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Classée
                      </span>
                    </td>
                  </>
                }
              </tr>

              <tr>
                {
                  <>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {props.claimReport?.basicStats?.statusAndValue?.SAVED}
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {
                          props.claimReport?.basicStats?.statusAndValue
                            ?.AFFECTED
                        }
                      </span>
                    </td>
                    
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {
                          props.claimReport?.basicStats?.statusAndValue
                            ?.DESAPPROUVED
                        }
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {props.claimReport?.basicStats?.statusAndValue?.TREAT}
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {
                          props.claimReport?.basicStats?.statusAndValue
                            ?.SATISFIED
                        }
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {
                          props.claimReport?.basicStats?.statusAndValue
                            ?.PARTIAL_SATISFIED
                        }
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {
                          props.claimReport?.basicStats?.statusAndValue
                            ?.UNSATISFIED
                        }
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {
                          props.claimReport?.basicStats?.statusAndValue
                            ?.LITIGATION
                        }
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {props.claimReport?.basicStats?.statusAndValue?.CLASSED}
                      </span>
                    </td>
                  </>
                }
              </tr>
            </table>
          </div>
        </div>
      </div>
    );

    return dableReturn;
  };
  const suggestionDashboard = () => {
    let dableReturn = (
      <div className="col l12 s12 m12 mt-2 mb-2">
        <div className="row center">
          <div
            className="col l10 s12 m12 mt-1 center pt-1"
            style={{
              backgroundColor: "#fefefe",
              borderRadius: "5px",
            }}
          >
            <span style={{ fontSize: "18px", color: "#015182" }}>
              <b>{props.sugReport?.basicStats?.total}</b> Suggestion(s)
            </span>

            <br />
            <table
              border="1"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tr>
                {
                  <>
                    <td className="center">
                      <span style={{ fontWeight: "bold" }}> A traiter</span>
                    </td>

                    <td className="center">
                      <span style={{ fontWeight: "bold" }}>Pris en Compte</span>
                    </td>
                    <td className="center">
                      <span style={{ fontWeight: "bold" }}>
                        Non Pris en Compte
                      </span>
                    </td>
                  </>
                }
              </tr>

              <tr>
                {
                  <>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {props.sugReport?.basicStats?.statusAndValue?.SAVED}
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {props.sugReport?.basicStats?.statusAndValue?.ACCEPTED}
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {
                          props.sugReport?.basicStats?.statusAndValue
                            ?.UNACCEPTED
                        }
                      </span>
                    </td>
                  </>
                }
              </tr>
            </table>
          </div>
        </div>
      </div>
    );
    return dableReturn;
  };
  const denunciationDashboard = () => {
    let dableReturn = (
      <div className="col l12 s12 m12 mt-2 mb-2">
        <div className="row center">
          <div
            className="col l10 s12 m12 mt-1 center pt-1"
            style={{
              backgroundColor: "#fefefe",
              borderRadius: "5px",
            }}
          >
            <span style={{ fontSize: "18px", color: "#015182" }}>
              <b>{props.denunReport?.basicStats?.total}</b> Dénonciation(s)
            </span>

            <br />
            <table
              width="960"
              border="1"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tr>
                {
                  <>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        A traiter
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Affectée
                      </span>
                    </td>
                  
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Désapprouvée
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Traitée
                      </span>
                    </td>
                  </>
                }
              </tr>

              <tr>
                {
                  <>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {props.denunReport?.basicStats?.statusAndValue?.SAVED}
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {
                          props.denunReport?.basicStats?.statusAndValue
                            ?.AFFECTED
                        }
                      </span>
                    </td>
                   
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {
                          props.denunReport?.basicStats?.statusAndValue
                            ?.DESAPPROUVED
                        }
                      </span>
                    </td>
                    <td className="center">
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {props.denunReport?.basicStats?.statusAndValue?.TREAT}
                      </span>
                    </td>
                  </>
                }
              </tr>
            </table>
          </div>
        </div>
      </div>
    );
    return dableReturn;
  };
  // Fin dashboard Affichage

  //Graphiques
  // let chartList = [];
  let chartListForWord = [];

  const reportGlobalChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des réclamations, dénonciations, suggestions
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={globalPieChartRef}
                    data={{
                      labels:
                        props.global_trend?.repartitionClaimDenunSuggest
                          ?.labels,
                      datasets: [
                        {
                          label: "All",
                          data: props.global_trend?.repartitionClaimDenunSuggest
                            ?.datas,
                          backgroundColor:
                            props.global_trend?.repartitionClaimDenunSuggest
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des réclamations, dénonciations et suggestions",
                        },
                      },

                      responsive: true,
                      animation: {
                        onComplete: function () {
                          // this.toBase64Image('image/jpeg', 1)
                          // cc = this.toFile('/tmp/mychart.png')
                          // ajouterDonnee(this.toBase64Image())
                          // cc = this.toBase64Image('image/jpeg', 1)
                          // chartList.push("az1");
                          // chartList.push(this.toBase64Image('image/jpeg', 1))
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">Evolution annuelle des RSD</h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Line
                    redraw={true}
                    ref={globalLineChartRef}
                    data={{
                      labels:
                        props.global_trend?.evolutionClaimDenunSuggestByYear
                          ?.labels,
                      datasets: (
                        props.global_trend?.evolutionClaimDenunSuggestByYear
                          ?.data || []
                      ).map((e) => ({
                        fill: false,
                        tension: 0.1,
                        label: e.label,
                        data: e.data,
                        borderColor: e.borderColor,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Evolution annuelle des RSD",
                        },
                        // labels: { render: () => {} },
                      },
                      responsive: true,
                      animation: {
                        onComplete: function () {
                          // console.log("2",this.toBase64Image())
                          // chartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>

      {/* <div className="divider mt-3 mb-3"></div> */}
    </>
  );

  const reportGlobalByCanalChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des réclamations, dénonciations, suggestions par
                  modalité de dépôt
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={globalByCanalPieChartRef}
                    data={{
                      labels:
                        props.global_trend?.repartitionClaimDenuSuggestPerCanal
                          ?.labels,
                      datasets: [
                        {
                          label: "My First Dataset",
                          data: props.global_trend
                            ?.repartitionClaimDenuSuggestPerCanal?.datas,
                          backgroundColor:
                            props.global_trend
                              ?.repartitionClaimDenuSuggestPerCanal
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des réclamations, dénonciations, suggestions par modalité de dépôt",
                        },
                      },
                      responsive: true,
                      animation: {
                        onComplete: function () {
                          // console.log("3",this.toBase64Image())
                          // chartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h6 className="card-title mb-4">
                  Nombre de RSD par modalité de dépôt par agence
                </h6>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={globalByCanalBarChartRef}
                    data={{
                      labels:
                        props.global_trend?.nbreObjectPerCanalAndAgence?.labels,

                      datasets: (
                        props.global_trend?.nbreObjectPerCanalAndAgence
                          ?.datasets || []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de RSD par modalité de dépôt par agence",
                        },
                      },
                      responsive: true,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },

                      animation: {
                        onComplete: function () {
                          // chartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>

      <div className="divider mt-3 mb-3"></div>
    </>
  );

  const reportGlobalByObjetChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des réclamations, dénonciations par objets
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={globalByObjetPieChartRef}
                    // options={globalPieChartOptions}
                    data={{
                      labels:
                        props.global_trend?.repartitionObjectByObj?.labels,
                      datasets: [
                        {
                          label: "My First Dataset",
                          data: props.global_trend?.repartitionObjectByObj
                            ?.datas,
                          backgroundColor:
                            props.global_trend?.repartitionObjectByObj
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des réclamations, dénonciations par objets",
                        },
                      },
                      responsive: true,
                      animation: {
                        onComplete: function () {
                          // chartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h6 className="card-title mb-4">
                  Nombre de Réclamations et Dénonciations par objets par agence
                </h6>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={globalByObjetBarChartRef}
                    data={{
                      labels:
                        props.global_trend?.nbreObjetPerObjetAndAgence?.labels,

                      datasets: (
                        props.global_trend?.nbreObjetPerObjetAndAgence
                          ?.datasets || []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de Réclamations et Dénonciations par objets par agence",
                        },
                      },
                      responsive: true,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },

                      animation: {
                        onComplete: function () {
                          // chartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
         
        </div>
      </div>

      <div className="divider mt-3 mb-3"></div>
    </>
  );

  const reportMixteChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Taux de résolution des plaintes
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <MyGaugeChart
                    global_trend={parseFloat(
                      props.global_trend?.tauxResolution
                    )}
                    ref={resolutionPieChartRef}
                  />

                </div>
              </div>
            </div>
          </div>

          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Respect du délai de résolution
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={resolutionDelaiBarChartRef}
                    data={{
                      labels:
                        props.claimReport?.nbreClaimTreatInDelaiOrNot?.labels,
                      datasets: (
                        props.claimReport?.nbreClaimTreatInDelaiOrNot
                          ?.datasets || []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: "right",
                        },
                        title: {
                          display: true,
                          text: "Respect du délai de résolution",
                        },
                      },
                      responsive: true,
                      indexAxis: "y",
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },
                      elements: {
                        bar: {
                          borderWidth: 1,
                        },
                      },

                      animation: {
                        onComplete: function () {
                          // chartList.push(this.toBase64Image());
                        },
                      },
                    }}
                    // options={{
                    //   indexAxis: 'x',
                    //   // Elements options apply to all of the options unless overridden in a dataset
                    //   // In this case, we are setting the border of each horizontal bar to be 2px wide
                    //   elements: {
                    //     bar: {
                    //       borderWidth: 1,
                    //     }
                    //   },
                    //   responsive: true,
                    //   plugins: {
                    //     legend: {
                    //       position: 'right',
                    //     },
                    //     title: {
                    //       display: true,
                    //       text: 'Chart.js Horizontal Bar Chart'
                    //     }
                    //   }
                    // }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Evolution des plaintes par agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={evolutionByAgenceByAnneeBarChartRef}
                    data={{
                      labels:
                        props.global_trend?.evolutionObjByYearAndAgence?.labels,
                      datasets: (
                        props.global_trend?.evolutionObjByYearAndAgence
                          ?.datasets || []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      legend: {
                        position: "bottom",
                      },
                      title: {
                        display: true,
                        text: "Evolution des plaintes par agence ",
                      },

                      animation: {
                        onComplete: function () {
                          // chartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Evolutions Taux de Résolution des Plaintes
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={evolutionTauxDeResolutionByAnneeBarChartRef}
                    data={
                      {
                        labels: props.global_trend?.evolutionObjByYearAndAgence?.labels,
                        datasets: (props.global_trend?.evolutionObjByYearAndAgence?.datasets || []).map((e) => ({
                          label: e.label,
                          data: e.data,
                          backgroundColor: e.backgroundColor,
                        })),
                      }
                    }
                    options={{
                      legend: {
                        position: 'bottom',
                      },
                      title: {
                        display: true,
                        text: 'Evolutions Taux de Résolution des Plaintes '
                      },
                      
                      animation: {
                        onComplete: function () {
                          // chartList.push(this.toBase64Image());
                         
                        },
                      },
                    }}
                    
                  />
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <div className="divider mt-3 mb-3"></div>
    </>
  );

  const claimByAgenceChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des réclamations par agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={claimByAgencePieChartRef}
                    data={{
                      labels:
                        props.claimReport?.repartitionClaimPerAgence?.labels,
                      datasets: [
                        {
                          label: "Réclamations",
                          data: props.claimReport?.repartitionClaimPerAgence
                            ?.datas,
                          backgroundColor:
                            props.claimReport?.repartitionClaimPerAgence
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des réclamations par agence",
                        },
                      },
                      responsive: true,
                      animation: {
                        onComplete: function () {
                          claimChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Nombre de réclamations par Agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={claimByAgenceBarChartRef}
                    data={{
                      labels: props.claimReport?.nbreClaimPerAgence?.labels,
                      datasets: [
                        {
                          label: "Réclamations",
                          data: props.claimReport?.nbreClaimPerAgence?.datas,
                          backgroundColor:
                            props.claimReport?.nbreClaimPerAgence
                              ?.backgroundColors,
                          borderColor:
                            props.claimReport?.nbreClaimPerAgence?.borderColors,
                          borderWidth:
                            props.claimReport?.nbreClaimPerAgence?.borderWidth,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de réclamations par Agence",
                        },
                        labels: {
                          render: "value",
                          position: "outside",
                          fontColor: function (data) {
                            return "black";
                          },
                        },
                      },
                      animation: {
                        onComplete: function () {
                          claimChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>

      {/* <div className="divider mt-3 mb-3"></div> */}
    </>
  );
  const denunByAgenceChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des dénonciations par agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={denunByAgencePieChartRef}
                    // options={claimByAgencePieChartRef}
                    data={{
                      labels:
                        props.denunReport?.repartitionDenunPerAgence?.labels,
                      datasets: [
                        {
                          label: "Dénonciations",
                          data: props.denunReport?.repartitionDenunPerAgence
                            ?.datas,
                          backgroundColor:
                            props.denunReport?.repartitionDenunPerAgence
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des dénonciations par agence",
                        },
                      },
                      responsive: true,
                      animation: {
                        onComplete: function () {
                          denunChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Nombre de dénonciations par Agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={denunByAgenceBarChartRef}
                    data={{
                      labels: props.denunReport?.nbreDenunPerAgence?.labels,
                      datasets: [
                        {
                          label: "Dénonciations",
                          data: props.denunReport?.nbreDenunPerAgence?.datas,
                          backgroundColor:
                            props.denunReport?.nbreClaimPerAgence
                              ?.backgroundColors,
                          borderColor:
                            props.denunReport?.nbreDenunPerAgence?.borderColors,
                          borderWidth:
                            props.denunReport?.nbreDenunPerAgence?.borderWidth,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de dénonciations par Agence",
                        },
                        labels: {
                          render: "value",
                          position: "outside",
                          fontColor: function (data) {
                            return "black";
                          },
                        },
                      },
                      responsive: true,
                      animation: {
                        onComplete: function () {
                          denunChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>
    </>
  );
  const sugByAgenceChart = (
    <>
      <div className="invoice-product-details">
        {/* <h6 className="indigo-text">
          Réclamations, Dénonciations, Suggestions
        </h6> */}
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des suggestions par agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={sugByAgencePieChartRef}
                    // options={claimByAgencePieChartRef}
                    data={{
                      labels:
                        props.sugReport?.repartitionSuggestPerAgence?.labels,
                      datasets: [
                        {
                          label: "Suggestions",
                          data: props.sugReport?.repartitionSuggestPerAgence
                            ?.datas,
                          backgroundColor:
                            props.sugReport?.repartitionSuggestPerAgence
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des suggestions par agence",
                        },
                      },
                      responsive: true,
                      animation: {
                        onComplete: function () {
                          sugChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Nombre de suggestions par Agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={sugByAgenceBarChartRef}
                    data={{
                      labels: props.sugReport?.nbreSuggestPerAgence?.labels,
                      datasets: [
                        {
                          label: "Suggestions",
                          data: props.sugReport?.nbreSuggestPerAgence?.datas,
                          backgroundColor:
                            props.sugReport?.nbreSuggestPerAgence
                              ?.backgroundColors,
                          borderColor:
                            props.sugReport?.nbreSuggestPerAgence?.borderColors,
                          borderWidth:
                            props.sugReport?.nbreSuggestPerAgence?.borderWidth,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de suggestions par Agence",
                        },
                        labels: {
                          render: "value",
                          position: "outside",
                          fontColor: function (data) {
                            return "black";
                          },
                        },
                      },
                      responsive: true,
                      animation: {
                        onComplete: function () {
                          sugChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>

      <div className="divider mt-3 mb-3"></div>
    </>
  );

  const claimByCanalChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des modalités de dépôts des réclamations
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={claimByCanalPieChartRef}
                    // options={claimByAgencePieChartRef}
                    data={{
                      labels:
                        props.claimReport?.repartitionClaimPerCanal?.labels,
                      datasets: [
                        {
                          label: "Réclamations",
                          data: props.claimReport?.repartitionClaimPerCanal
                            ?.datas,
                          backgroundColor:
                            props.claimReport?.repartitionClaimPerCanal
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des modalités de dépôts des réclamations",
                        },
                      },
                      responsive: true,
                      animation: {
                        onComplete: function () {
                          claimChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Nombre de réclamations par modalité de dépôt par Agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={claimByCanalBarChartRef}
                    data={{
                      labels:
                        props.claimReport?.nbreClaimPerCanalPerAgence?.labels,

                      datasets: (
                        props.claimReport?.nbreClaimPerCanalPerAgence
                          ?.datasets || []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: 'Nombre de réclamations par modalité de dépôt par Agence'
                        },
                      },
                      responsive: true,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },

                      animation: {
                        onComplete: function () {
                          claimChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>

      {/* <div className="divider mt-3 mb-3"></div> */}
    </>
  );
  const denunByCanalChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des modalités de dépôt des dénonciations
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={denunByCanalPieChartRef}
                    // options={claimByAgencePieChartRef}
                    data={{
                      labels:
                        props.denunReport?.repartitionDenunPerCanal?.labels,
                      datasets: [
                        {
                          label: "Dénonciations",
                          data: props.denunReport?.repartitionDenunPerCanal
                            ?.datas,
                          backgroundColor:
                            props.denunReport?.repartitionDenunPerCanal
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des modalités de dépôt des dénonciations",
                        },
                      },
                      responsive: true,
                      animation: {
                        onComplete: function () {
                          denunChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Nombre de dénonciations par modalité de dépôt par Agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={denunByCanalBarChartRef}
                    data={{
                      labels:
                        props.denunReport?.nbreDenunPerCanalPerAgence?.labels,

                      datasets: (
                        props.denunReport?.nbreDenunPerCanalPerAgence
                          ?.datasets || []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: ' Nombre de dénonciations par canal par Agence'
                        },
                      },
                      responsive: true,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },

                      animation: {
                        onComplete: function () {
                          denunChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>
    </>
  );
  const sugByCanalChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des modalités de dépôt des suggestions
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={sugByCanalPieChartRef}
                    // options={claimByAgencePieChartRef}
                    data={{
                      labels:
                        props.sugReport?.repartitionSuggestPerCanal?.labels,
                      datasets: [
                        {
                          label: "Suggestions",
                          data: props.sugReport?.repartitionSuggestPerCanal
                            ?.datas,
                          backgroundColor:
                            props.sugReport?.repartitionSuggestPerCanal
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: " Répartition des modalités de dépôt des suggestions ",
                        },
                      },
                      responsive: true,

                      animation: {
                        onComplete: function () {
                          sugChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Nombre de suggestions par modalité de dépôt par Agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={sugByCanalBarChartRef}
                    data={{
                      labels:
                        props.sugReport?.nbreSuggestPerCanalPerAgence?.labels,

                      datasets: (
                        props.sugReport?.nbreSuggestPerCanalPerAgence
                          ?.datasets || []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: 'Nombre de suggestions par canal par Agence'
                        },
                      },
                      responsive: true,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },

                      animation: {
                        onComplete: function () {
                          sugChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>

      <div className="divider mt-3 mb-3"></div>
    </>
  );

  const claimByObjetChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des objets des réclamations
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={claimByObjetPieChartRef}
                    // options={claimByAgencePieChartRef}
                    data={{
                      labels:
                        props.claimReport?.repartitionClaimPerObjet?.labels,
                      datasets: [
                        {
                          label: "Réclamations",
                          data: props.claimReport?.repartitionClaimPerObjet
                            ?.datas,
                          backgroundColor:
                            props.claimReport?.repartitionClaimPerObjet
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des objets des réclamations",
                        },
                      },
                      responsive: true,

                      animation: {
                        onComplete: function () {
                          claimChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Nombre de réclamations par objets par Agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={claimByObjetBarChartRef}
                    data={{
                      labels:
                        props.claimReport?.nbreClaimPerObjPerAgence?.labels,
                      datasets: (
                        props.claimReport?.nbreClaimPerObjPerAgence?.datasets ||
                        []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de réclamations par objets par Agence",
                        },
                      },
                      responsive: true,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },

                      animation: {
                        onComplete: function () {
                          claimChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>

      {/* <div className="divider mt-3 mb-3"></div> */}
    </>
  );
  const denunByObjetChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des objets des dénonciations
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={denunByObjetPieChartRef}
                    // options={claimByAgencePieChartRef}
                    data={{
                      labels:
                        props.denunReport?.repartitionDenunPerObjet?.labels,
                      datasets: [
                        {
                          label: "Dénonciations",
                          data: props.denunReport?.repartitionDenunPerObjet
                            ?.datas,
                          backgroundColor:
                            props.denunReport?.repartitionDenunPerObjet
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: " Répartition des objets des dénonciations",
                        },
                      },
                      responsive: true,

                      animation: {
                        onComplete: function () {
                          denunChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Nombre de dénonciations par objets par Agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={denunByObjetBarChartRef}
                    data={{
                      labels:
                        props.denunReport?.nbreDenunPerObjPerAgence?.labels,

                      datasets: (
                        props.denunReport?.nbreDenunPerObjPerAgence?.datasets ||
                        []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de dénonciations par objets par Agence",
                        },
                      },
                      responsive: true,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },

                      animation: {
                        onComplete: function () {
                          denunChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>
    </>
  );

  const claimByGenreChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des réclamations par genre
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={claimByGenderPieChartRef}
                    // options={claimByAgencePieChartRef}
                    data={{
                      labels:
                        props.claimReport?.repartitionClaimPerGender?.labels,
                      datasets: [
                        {
                          label: "Réclamations",
                          data: props.claimReport?.repartitionClaimPerGender
                            ?.datas,
                          backgroundColor:
                            props.claimReport?.repartitionClaimPerGender
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des réclamations par genre",
                        },
                      },
                      responsive: true,

                      animation: {
                        onComplete: function () {
                          claimChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Nombre de réclamations par genre par Agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={claimByGenderBarChartRef}
                    data={{
                      labels:
                        props.claimReport?.nbreClaimPerGenderPerAgence?.labels,

                      datasets: (
                        props.claimReport?.nbreClaimPerGenderPerAgence
                          ?.datasets || []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de réclamations par genre par Agence",
                        },
                      },
                      responsive: true,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },

                      animation: {
                        onComplete: function () {
                          claimChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>

      {/* <div className="divider mt-3 mb-3"></div> */}
    </>
  );

  const sugByGenderChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des suggestions par genre
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={sugByGenderPieChartRef}
                    // options={claimByAgencePieChartRef}
                    data={{
                      labels:
                        props.sugReport?.repartitionSuggestPerGender?.labels,
                      datasets: [
                        {
                          label: "Suggestions",
                          data: props.sugReport?.repartitionSuggestPerGender
                            ?.datas,
                          backgroundColor:
                            props.sugReport?.repartitionSuggestPerGender
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des suggestions par genre",
                        },
                      },
                      responsive: true,

                      animation: {
                        onComplete: function () {
                          sugChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Nombre de suggestions par genre par Agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={sugByGenderBarChartRef}
                    data={{
                      labels:
                        props.sugReport?.nbreSuggestPerGenderPerAgence?.labels,

                      datasets: (
                        props.sugReport?.nbreSuggestPerGenderPerAgence
                          ?.datasets || []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de suggestions par genre par Agence",
                        },
                      },
                      responsive: true,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },

                      animation: {
                        onComplete: function () {
                          sugChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>

      <div className="divider mt-3 mb-3"></div>
    </>
  );

  const claimByGraviteChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des réclamations par niveau de gravité
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={claimByGravitePieChartRef}
                    data={{
                      labels:
                        props.claimReport?.repartitionClaimPerObjRisque?.labels,
                      datasets: [
                        {
                          label: "Réclamations",
                          data: props.claimReport?.repartitionClaimPerObjRisque
                            ?.datas,
                          backgroundColor:
                            props.claimReport?.repartitionClaimPerObjRisque
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des réclamations par niveau de gravité",
                        },
                      },
                      responsive: true,

                      animation: {
                        onComplete: function () {
                          // claimChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Nombre de réclamations par niveau de gravité par Agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={claimByGraviteBarChartRef}
                    data={{
                      labels:
                        props.claimReport?.nbreClaimPerObjLevelAndAgence
                          ?.labels,
                      datasets: (
                        props.claimReport?.nbreClaimPerObjLevelAndAgence
                          ?.datasets || []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de réclamations par niveau de gravité par Agence",
                        },
                      },
                      responsive: true,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },

                      animation: {
                        onComplete: function () {
                          // claimChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>

      {/* <div className="divider mt-3 mb-3"></div> */}
    </>
  );
  const denunByGraviteChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition des dénonciations par niveau de gravité
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={denunByGravitePieChartRef}
                    // options={claimByAgencePieChartRef}
                    data={{
                      labels:
                        props.denunReport?.repartitionDenunPerObjRisque?.labels,
                      datasets: [
                        {
                          label: "Dénonciations",
                          data: props.denunReport?.repartitionDenunPerObjRisque
                            ?.datas,
                          backgroundColor:
                            props.denunReport?.repartitionDenunPerObjRisque
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des dénonciations par niveau de gravité",
                        },
                      },
                      responsive: true,

                      animation: {
                        onComplete: function () {
                          // denunChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Nombre de dénonciations par niveau de gravité par agence
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Bar
                    redraw={true}
                    ref={denunByGraviteBarChartRef}
                    data={{
                      labels:
                        props.denunReport?.nbreDenunPerObjLevelAndAgence
                          ?.labels,
                      datasets: (
                        props.denunReport?.nbreDenunPerObjLevelAndAgence
                          ?.datasets || []
                      ).map((e) => ({
                        label: e.label,
                        data: e.data,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de dénonciations par niveau de gravité par agence",
                        },
                      },
                      responsive: true,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },

                      animation: {
                        onComplete: function () {
                          // denunChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>
    </>
  );

  const claimBySatisfactionChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Répartition de la satisfaction des réclamants
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom">
                  <Pie
                    redraw={true}
                    ref={claimBySatisfactionPieChartRef}
                    // options={claimByAgencePieChartRef}
                    data={{
                      labels:
                        props.claimReport?.repartitionClaimBySatisfaction
                          ?.labels,
                      datasets: [
                        {
                          label: "Réclamations",
                          data: props.claimReport
                            ?.repartitionClaimBySatisfaction?.datas,
                          backgroundColor:
                            props.claimReport?.repartitionClaimBySatisfaction
                              ?.backgroundColors,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition de la satisfaction des réclamants",
                        },
                      },
                      responsive: true,

                      animation: {
                        onComplete: function () {
                          // claimChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col s12 m12 l6 animate fadeRight center-align">
            <div className="card">
              <div className="card-content">
                <h4 className="card-title mb-4">
                  Evolution annuelle de la satisfaction des réclamants
                </h4>
                <p className="medium-small"></p>
                <div className="total-transaction-container canvas-custom2">
                  <Line
                    redraw={true}
                    ref={claimBySatisfactionLineChartRef}
                    data={{
                      labels:
                        props.claimReport?.evolutionSatisfactionByThisYear
                          ?.labels,
                      datasets: (
                        props.claimReport?.evolutionSatisfactionByThisYear
                          ?.data || []
                      ).map((e) => ({
                        fill: false,
                        tension: 0.1,
                        label: e.label,
                        data: e.data,
                        borderColor: e.borderColor,
                        backgroundColor: e.backgroundColor,
                      })),
                    }}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Evolution annuelle de la satisfaction des réclamants",
                        },
                      },
                      responsive: true,
                      animation: {
                        onComplete: function () {
                          claimChartList.push(this.toBase64Image());
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col s12 m12 l12 input-field" id="page4">
            <textarea
              data-limit-rows="true"
              id="comment1"
              name="comment1"
              placeholder=""
              rows={"13"}
              className="materialize-textarea materialize-textarea-b"
              onChange={(e) => {}}
            ></textarea>
            <label htmlFor="content" className={"active"}>
              Commentaires:
            </label>
            <small className="errorTxt4">
              <div id="cpassword-error" className="error">
                {props.errors !== undefined ? props.errors.content : ""}
              </div>
            </small>
          </div> */}
        </div>
      </div>

      {/* <div className="divider mt-3 mb-3"></div> */}
    </>
  );

  // console.log("statistics",tmp? tmp[0] : 0)

  const claimTableStat = () => {
    let statsClaim = props.stat?.claimStatsAndValue;
    let tableClaim = (
      <table
        width="960"
        border="1"
        className="striped responsive-table bordered table-xlsx mt-2"
        style={{ minWidth: "100% !important" }}
        id="stats_claim"
      >
        <thead></thead>
        <tbody>
          {(statsClaim ? statsClaim : []).map((element) => {
            var objEntries = Object.entries(element);
            for (const objet of objEntries) {
              // console.log("element");
              // console.log(objEntries);
              // console.log(objEntries.length);
              let tableContent = objEntries.map((info) => {
                return (
                  <>
                    <tr key={info[0]}>
                      <td>{info[0]}</td>
                      <td>{info[1]}</td>
                    </tr>
                  </>
                );
              })
             
              return tableContent;
              
            }
          })}

          {/* {(props.stat.claimStatsAndValue).map((etat) => {
            return (
              <>
                <tr>
              
                  <td>Total</td>
                  
                </tr>
              </>
            )
          })} */}
        </tbody>
      </table>
    );
    return tableClaim;
  };

  const denunTableStat = () => {
    let statsClaim = props.stat?.denunStatsAndValue;
    let tableClaim = (
      <table
        width="960"
        border="1"
        className="striped responsive-table bordered table-xlsx mt-2"
        style={{ minWidth: "100% !important" }}
        id="stats_denunciation"
      >
        <thead></thead>
        <tbody>
          {(statsClaim ? statsClaim : []).map((element) => {
             var objEntries = Object.entries(element);
             for (const objet of objEntries) {
               // console.log("element");
               // console.log(objEntries);
               // console.log(objEntries.length);
               let tableContent = objEntries.map((info) => {
                 return (
                   <>
                     <tr key={info[0]}>
                       <td>{info[0]}</td>
                       <td>{info[1]}</td>
                     </tr>
                   </>
                 );
               })
              
               return tableContent;
               
             }
            // for (var cle in element) {
            //   if (element.hasOwnProperty(cle)) {
            //     var valeur = element[cle];
            //     return (
            //       <>
            //         <tr key={cle}>
            //           <td>{cle}</td>
            //           <td>{valeur}</td>
            //         </tr>
            //       </>
            //     );
            //   }
            //   // console.log("index0","cle : "+cle + "valeur : "+valeur)
            // }
          })}

          {/* {(props.stat.claimStatsAndValue).map((etat) => {
            return (
              <>
                <tr>
              
                  <td>Total</td>
                  
                </tr>
              </>
            )
          })} */}
        </tbody>
      </table>
    );
    return tableClaim;
  };

  const sugTableStat = () => {
    let statsClaim = props.stat?.suggestStatsAndValue;

    let tableClaim = (
      <table
        width="960"
        border="1"
        className="striped responsive-table bordered table-xlsx mt-2"
        style={{ minWidth: "100% !important" }}
        id="stats_suggestion"
      >
        <thead></thead>
        <tbody>
          {(statsClaim ? statsClaim : []).map((element) => {
            for (var cle in element) {
              if (element.hasOwnProperty(cle)) {
                var valeur = element[cle];
                return (
                  <>
                    <tr key={cle}>
                      <td>{cle}</td>
                      <td>{valeur}</td>
                    </tr>
                  </>
                );
              }
              // console.log("index0","cle : "+cle + "valeur : "+valeur)
            }
          })}
        </tbody>
      </table>
    );
    return tableClaim;
  };

  const prepareToPrint = async (type = "pdf") => {
    // console.log("list vdes graphes", chartList);
    // console.log("references", globalPieChartRef);
    // console.log("liste des graphes2",claimChartList)
    let entete = document.querySelector("#enteteRapport").innerHTML;
    let title = document.querySelector("#titleRapport").innerHTML;
    let critere = document.querySelector("#critereRapport").innerHTML;
    let dashClaim = document.querySelector("#dashClaimRapport").innerHTML;
    let dashDenun = document.querySelector("#dashDenunRapport").innerHTML;
    let dashSuggest = document.querySelector("#dashSuggestRapport").innerHTML;
    let dataClaim = "";
    let dataDenun = "";
    let dataSugg = "";
    let globalChart = "";

    var s = new XMLSerializer().serializeToString(
      document.getElementById("gauge-chart5")
    );
    let src;
    if (resolutionPieChartRef !== null) {
      var imgSource = resolutionPieChartRef?.current.captureAsImage();

      if (resolutionPieChartRef?.current) {
        console.error("suc0:", "broo");
        console.error("suc1:", resolutionPieChartRef?.current.captureAsImage());
        src = await resolutionPieChartRef?.current.captureAsImage();
      }
    }

    const globalPieChartRefData =
      "<div class=' col s12 m12 l6 center-align' style='width:100%'><img src='" +
      globalPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important'  /></div>";
    const globalLineChartRefData =
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      globalLineChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important'  /></div>";
    const globalByCanalPieChartRefData =
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      globalByCanalPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' /></div>";
    const globalByCanalBarChartRefData =
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      globalByCanalBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' /></div>";
    const globalByObjetPieChartRefData =
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      globalByObjetPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' /></div>";
    const globalByObjetBarChartRefData =
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      globalByObjetBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' /></div>";
    const resolutionPieChartRefData =
      "<div class=' col s12 m12 l12 ' style='width:100%'><center style='margin-bottom:60px!important'>Taux de résolution des plaintes</center> <img src='" +
      src +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' /></div>";
    const resolutionDelaiBarChartRefData =
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      resolutionDelaiBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' /></div>";
    const evolutionByAgenceByAnneeBarChartRefData =
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      evolutionByAgenceByAnneeBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' /></div>";

    const claimByAgencePieChartRefData =
      "<img src='" +
      claimByAgencePieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const claimByAgenceBarChartRefData =
      "<img src='" +
      claimByAgenceBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";
    const claimByGenderPieChartRefData =
      "<img src='" +
      claimByGenderPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const claimByGenderBarChartRefData =
      "<img src='" +
      claimByGenderBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";
    const claimByCanalPieChartRefData =
      "<img src='" +
      claimByCanalPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const claimByCanalBarChartRefData =
      "<img src='" +
      claimByCanalBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";
    const claimByObjetPieChartRefData =
      "<img src='" +
      claimByObjetPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const claimByObjetBarChartRefData =
      "<img src='" +
      claimByObjetBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";
    const claimByGravitePieChartRefData =
      "<img src='" +
      claimByGravitePieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const claimByGraviteBarChartRefData =
      "<img src='" +
      claimByGraviteBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";
    const claimBySatisfactionPieChartRefData =
      "<img src='" +
      claimBySatisfactionPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const claimBySatisfactionLineChartRefData =
      "<img src='" +
      claimBySatisfactionLineChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";

    const denunByAgencePieChartRefData =
      "<img src='" +
      denunByAgencePieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const denunByAgenceBarChartRefData =
      "<img src='" +
      denunByAgenceBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";
    const denunByCanalPieChartRefData =
      "<img src='" +
      denunByCanalPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const denunByCanalBarChartRefData =
      "<img src='" +
      denunByCanalBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";
    const denunByObjetPieChartRefData =
      "<img src='" +
      denunByObjetPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const denunByObjetBarChartRefData =
      "<img src='" +
      denunByObjetBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";
    const denunByGravitePieChartRefData =
      "<img src='" +
      denunByGravitePieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const denunByGraviteBarChartRefData =
      "<img src='" +
      denunByGraviteBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";

    const sugByAgencePieChartRefData =
      "<img src='" +
      sugByAgencePieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const sugByAgenceBarChartRefData =
      "<img src='" +
      sugByAgenceBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";
    const sugByGenderPieChartRefData =
      "<img src='" +
      sugByGenderPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const sugByGenderBarChartRefData =
      "<img src='" +
      sugByGenderBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";
    const sugByCanalPieChartRefData =
      "<img src='" +
      sugByCanalPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />";
    const sugByCanalBarChartRefData =
      "<img src='" +
      sugByCanalBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";

    //tableaux
    let statClaimTable = document.querySelector("#statClaimTable").innerHTML;
    let statDenunTable = document.querySelector("#statDenunTable").innerHTML;
    let statSugTable = document.querySelector("#statSugTable").innerHTML;

    //global data
    globalChart =
      globalPieChartRefData +
      globalLineChartRefData +
      globalByCanalPieChartRefData +
      globalByCanalBarChartRefData +
      globalByObjetPieChartRefData +
      globalByObjetBarChartRefData +
      resolutionPieChartRefData +
      resolutionDelaiBarChartRefData +
      evolutionByAgenceByAnneeBarChartRefData;

    if (claimShow) {
      dataClaim =
        '<div class="row mt-1 mb-3 center"><span style="fontSize: 20px; fontWeight: bold" }}>Aucune réclamation ne correspond aux critères de tri</span></div>';

      // if (claimReport.length > 0) {
      if (claimShow) {
        // let toeClaim = document.querySelector("#toeClaim").innerHTML;

        dataClaim =
          claimByAgencePieChartRefData +
          claimByAgenceBarChartRefData +
          claimByGenderPieChartRefData +
          claimByGenderBarChartRefData +
          claimByCanalPieChartRefData +
          claimByCanalBarChartRefData +
          claimByObjetPieChartRefData +
          claimByObjetBarChartRefData +
          claimByGravitePieChartRefData +
          claimByGraviteBarChartRefData +
          claimBySatisfactionPieChartRefData +
          claimBySatisfactionLineChartRefData +
          statClaimTable;
      }
    }
    if (denunciationShow) {
      dataDenun =
        '<div class="row mt-1 mb-3 center"><span style="fontSize: 20px; fontWeight: bold" >Aucune dénonciation ne correspond aux critères de tri</span></div>';
      // if (resultGeneralDenonciation.length > 0) {
      if (denunciationShow) {
        // let toeDenun = document.querySelector("#toeDenun").innerHTML;

        dataDenun =
          denunByAgencePieChartRefData +
          denunByAgenceBarChartRefData +
          denunByCanalPieChartRefData +
          denunByCanalBarChartRefData +
          denunByObjetPieChartRefData +
          denunByObjetBarChartRefData +
          denunByGravitePieChartRefData +
          denunByGraviteBarChartRefData +
          statDenunTable;
      }
    }
    if (suggestionShow) {
      dataSugg =
        '<div class="row mt-1 mb-3 center"><span style="fontSize: 20px; fontWeight: bold">Aucune suggestion ne correspond aux critères de tri</span></div>';
      // if (resultGeneralSuggestion.length > 0) {
      if (suggestionShow) {
        // let tpeSugg = document.querySelector("#tpeSugg").innerHTML;
        // let tpdSugg = document.querySelector("#tpdSugg").innerHTML;

        dataSugg =
          sugByAgencePieChartRefData +
          sugByAgenceBarChartRefData +
          sugByGenderPieChartRefData +
          sugByGenderBarChartRefData +
          sugByCanalPieChartRefData +
          sugByCanalBarChartRefData +
          statSugTable;
      }
    }

    let data =
      entete +
      "<br/><br />" +
      title +
      "<br/><br />" +
      critere +
      "<br/><br />" +
      globalChart +
      "<br/><br />" +
      dashClaim +
      "<br/><br />" +
      dataClaim +
      "<br/><br />" +
      dashDenun +
      "<br/><br />" +
      dataDenun +
      "<br/><br />" +
      dashSuggest +
      "<br/><br />" +
      dataSugg +
      "<br/><br />" +
      '<script type="text/javascript">setTimeout(function() { window.print();window.close(); },500)</script>';
    document.querySelector("#trSimple").innerHTML = data;

    let results = document.querySelector("#trSimple").innerHTML;
    // let results = data;

    document.querySelector("#trSimple").innerHTML = "";
    return results;
  };
  const printToPDF = async () => {
    const toStri = await prepareToPrint();
    handlePrintAvance(toStri);
  };
  const prepareReportTablesToXLSX = () => {
    let filename = "Statistiques_GPR_" + today().replaceAll("/", "");
    table2XLSX(filename, "", 0);
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
    let filename = "Rapport_GPR_" + today().replaceAll("/", "") + ".doc";

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
      <div id="trSimple" style={{}}></div>
      <div id="main" style={{ marginBottom: "250px" }}>
        {showSearch && (
          <Dialog open={open} onClose={handleClose}>
            <div className="row mt-2">
              <DialogContentText>Filtres</DialogContentText>
            </div>

            <DialogContent
              style={{
                overflowY: "auto",
                overflowX: "hidden",
                maxHeight: "600px",
              }}
            >
              <div className="row">
                <div className="col s12 m12 l12  input-field">
                  <Select
                    className="react-select-container mt-4"
                    classNamePrefix="react-select"
                    style={styles}
                    placeholder="Sélectionner l'Année"
                    options={yearOptions}
                    isDisabled={yearOptions.length <= 0}
                    onChange={(e) => props.yearChanged(e.value)}
                  />
                  <label htmlFor="agency" className={"active"}>
                    Année:
                  </label>
                </div>
                {/* Select Type de plainte */}
                <div className="col s12 l12 m12 input-field">
                  <label htmlFor="typePlainte" className={"active"}>
                    Type de plainte
                  </label>
                  <Select
                    isMulti
                    className="react-select-container mt-4"
                    classNamePrefix="react-select"
                    style={styles}
                    id="typePlainte"
                    placeholder="Tous"
                    options={optionsPlainteType}
                    onChange={(e) => {
                      let arrau = [];
                      let isSee = false;
                      for (let i = 0; i < e.length; i++) {
                        if (e.length == 1 && e[i].value == "suggestion") {
                          setCloseObjet(true);
                        } else {
                          setCloseObjet(false);
                        }
                        if (!isSee) {
                          if (e[i].value == "suggestion") {
                            setOptionsState([
                              { label: "A traiter", value: "SAVED" },
                              { label: "Traitée", value: "TREAT" },
                            ]);
                          } else if (e[i].value == "denunciation") {
                            setOptionsState([
                              { label: "A traiter", value: "SAVED" },
                              { label: "Affectée", value: "AFFECTED" },
                              { label: "Désapprouvée", value: "DESAPPROUVED" },
                              { label: "Traitée", value: "TREAT" },
                            ]);
                          } else {
                            isSee = true;

                            setOptionsState([
                              { label: "A traiter", value: "SAVED" },
                              { label: "Affectée", value: "AFFECTED" },
                              { label: "Désapprouvée", value: "DESAPPROUVED" },
                              { label: "Traitée", value: "TREAT" },
                              { label: "Non satisfait", value: "UNSATISFIED" },
                              {
                                label: "Partiellement satisfait",
                                value: "PARTIAL_SATISFIED",
                              },
                              { label: "Satisfait", value: "SATISFIED" },
                              { label: "Contentieux", value: "LITIGATION" },
                              { label: "Classée", value: "CLASSED" },
                            ]);
                          }
                        }
                        arrau.push(e[i].value);
                      }

                      setPlainteType(arrau);
                    }}
                  />
                </div>
                {/* Select Objet */}
                {!closeObjet && (
                  <>
                    <div className="col s12 l12 m12  input-field">
                      <Select
                        isMulti
                        className="react-select-container mt-4"
                        classNamePrefix="react-select"
                        style={styles}
                        id="idObjet"
                        placeholder="Tous"
                        options={optionsObjet}
                        onChange={(e) => {
                          let objets = [];

                          for (let i = 0; i < e.length; i++) {
                            objets.push(e[i].value);
                          }
                          setObjet(objets);
                        }}
                      />
                      <label htmlFor="idObjet" className={"active"}>
                        Objets
                      </label>
                    </div>
                  </>
                )}
                <div className="col s12 m12 l12 input-field">
                  <Select
                    isMulti
                    className="react-select-container mt-4"
                    classNamePrefix="react-select"
                    style={styles}
                    id="idEtatPlainte"
                    placeholder="Tous"
                    options={optionsState}
                    onChange={(e) => {
                      let arrau = [];
                      let am = false;
                      for (let i = 0; i < e.length; i++) {
                        arrau.push(e[i].value);
                      }
                      setEtatState(arrau);
                    }}
                  />
                  <label htmlFor="idRecoredBy" className={"active"}>
                    Etat de la plainte
                  </label>
                </div>
                {/*Autres options */}
                {/*Etat Plainte */}
                <span
                  onClick={(e) => setOther(!other)}
                  className="col l12 m12 s12"
                  style={{
                    cursor: "pointer",
                    color: other ? "red" : "blue",
                    textAlign: "center",
                  }}
                >
                  {!other ? " + Plus" : " - Moins"} d'options
                </span>

                {other && (
                  <>
                    <div className="col s12 m12 l12 input-field">
                      <Select
                        isMulti
                        className="react-select-container mt-4"
                        classNamePrefix="react-select"
                        style={styles}
                        id="idProduct"
                        placeholder="Tous"
                        options={optionsProducts}
                        onChange={(e) => {
                          let arrau = [];

                          for (let i = 0; i < e.length; i++) {
                            arrau.push(e[i].value);
                          }
                          setProduct(arrau);
                        }}
                      />
                      <label htmlFor="idProduct" className={"active"}>
                        Produits
                      </label>
                    </div>
                    {/* Enregistrer par */}
                    <div className="col s12 m12 l12 input-field">
                      <Select
                        isMulti
                        className="react-select-container mt-4"
                        classNamePrefix="react-select"
                        style={styles}
                        id="idRecoredBy"
                        placeholder="Tous"
                        options={optionsUsers}
                        onChange={(e) => {
                          let arrau = [];

                          for (let i = 0; i < e.length; i++) {
                            arrau.push(e[i].value);
                          }
                          setRecoredBy(arrau);
                        }}
                      />
                      <label htmlFor="idEtatPlainte" className={"active"}>
                        Enregistrer par
                      </label>
                    </div>
                    {/*Dates row*/}
                    <div className="row">
                      <div className="col l12 s12 m12 text-center">
                        Reçu entre:
                      </div>
                      {/*Date start*/}
                      <div className="col s12 m12 l6 input-field">
                        <DatePicker
                          id="idStartDate"
                          name="startDate"
                          className="mt-4"
                          selected={startDate}
                          onChange={(date) => {
                            setStartDate(date);
                          }}
                          dateFormat="dd/MM/yyyy"
                          locale="fr"
                        />
                        <label htmlFor="idStartDate" className={"active"}>
                          Date de debut
                        </label>
                      </div>
                      {/*Date end*/}

                      <div className="col s12 m12 l6 input-field">
                        <DatePicker
                          id="idEndDate"
                          name="endDate"
                          className="mt-4"
                          selected={endDate}
                          onChange={(date) => {
                            setEndDate(date);
                          }}
                          dateFormat="dd/MM/yyyy"
                          locale="fr"
                        />
                        <label htmlFor="idEndDate" className={"active"}>
                          Date de fin
                        </label>
                      </div>
                    </div>

                    {/* Unité operationelle */}
                    <div className="col s12 m12 l12 input-field">
                      <Select
                        isMulti
                        className="react-select-container mt-4"
                        classNamePrefix="react-select"
                        style={""}
                        placeholder="Tous"
                        options={optionsUnits}
                        isDisabled={""}
                        onChange={(e) => {
                          let arrau = [];

                          for (let i = 0; i < e.length; i++) {
                            arrau.push(e[i].value);
                          }
                          setUnit(arrau);
                        }}
                      />
                      <label htmlFor="agency" className={"active"}>
                        Points de service:
                      </label>
                    </div>
                  </>
                )}
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
                      genereReport(e);
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
          <div
            className=""
            style={{
              position: "fixed",
              justifyContent: "center",
              bottom: 80,
              right: 5,
              zIndex: 526,
              display: "block",
            }}
          >
            <>
              <div
                style={{ marginTop: "10px", display: "flex", width: "200px" }}
              >
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
                    document.querySelector("#okGenerer").style.display =
                      "block";
                    // console.log(
                    //   "abacadabra",
                    //   document.querySelector("#okGenerer")
                    // );
                  }}
                  onMouseOut={() => {
                    document.querySelector("#okGenerer").style.display = "none";
                    // console.log(
                    //   "abacadabra",
                    //   document.querySelector("#okGenerer")
                    // );
                  }}
                  onClick={() => {
                    setshowSearch(true);
                    setOpen(true);
                  }}
                >
                  <CheckIcon />
                </div>

                <br />
              </div>
              <div
                style={{ marginTop: "10px", display: "flex", width: "200px" }}
              >
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
              <div
                style={{ marginTop: "10px", display: "flex", width: "200px" }}
              >
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
              <div
                style={{ marginTop: "10px", display: "flex", width: "200px" }}
              >
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
            </>
          </div>

          <div className="col l12 s12 m12">
            <div className="container">
              <section
                className="tabs-vertical mt1 section card-panel pt-2 pl-1"
                id="rapportAvance"
              >
                <div className="row" id="enteteRapport">
                  <div className="col l2 s12 m6">
                    <img
                      src={INSTITUTION_LOGO}
                      alt="logo"
                      style={{
                        width: "100%",
                                // height: "90px",
                      }}
                      className={" report-logo"}
                    />
                  </div>
                  <div className="col l8 s12 m6">
                    <b>{INSTITUTION_NAME}</b>
                    <br />
                    <i>
                      <span>Numéro Agrément: </span>
                      {INSTITUTION_AGREMENT}
                    </i>
                    <br />
                    <i>
                      <span>Addrese: </span>
                      {INSTITUTION_ADDRESS}
                    </i>
                    <br />
                    <i>
                      <span>Tel: </span>
                      {INSTITUTION_TEL}
                    </i>
                    <br />
                    <i>
                      <span>Email: </span>
                      {INSTITUTION_EMAIL}
                    </i>
                  </div>
                  <div className="col l2 m12 s12">
                    <i>
                      Généré le{" "}
                      {new Date().toLocaleDateString("fr-FR", {
                        day: "numeric",
                        year: "numeric",
                        month: "long",
                      })}
                    </i>
                  </div>
                </div>
                <div
                  className="row"
                  style={{ marginTop: "20px" }}
                  id="titleRapport"
                >
                  <div className="col s12 l12 m12 center">
                    <span style={{ color: "#015182", fontSize: "25px" }}>
                      Rapport de la gestion des plaintes et suggestions
                    </span>
                  </div>
                </div>
                <div
                  className="row"
                  style={{ marginTop: "20px" }}
                  id="critereRapport"
                >
                  <div className="col l12">
                    {/* <ul>
                      <li>
                        <b style={{ fontSize: "15px" }}>Critères:</b>
                      </li>
                    </ul> */}
                    <ul style={{ paddingLeft: "15px" }}>
                      {/* <li>
                        <>Type de plainte:</>
                        {plainteType.length == 0
                          ? "Tous"
                          : plainteType.map((plainte) => {
                              return (
                                <>
                                  {plainte == "claim"
                                    ? " Réclamations,"
                                    : plainte == "suggestion"
                                    ? " Suggestion,"
                                    : plainte == "denunciation"
                                    ? " Dénonciation,"
                                    : ""}
                                </>
                              );
                            })}
                        <br />
                      </li>
                      <li>
                        <>Etat de plainte:</>{" "}
                        {etatState.length == 0
                          ? " Tous"
                          : etatState.map((etat) => {
                              return (
                                <>
                                  {etat == "traite"
                                    ? " Résolue,"
                                    : etat == "nontraite"
                                    ? " A traiter,"
                                    : etat == "approuver"
                                    ? " Approuver,"
                                    : etat == "desapprouver"
                                    ? " Desapprouver,"
                                    : etat == "satisfait"
                                    ? " Satisfait,"
                                    : etat == "nonsatisfaire"
                                    ? " Non satisfait,"
                                    : etat == "affecte"
                                    ? " Affecter,"    
                                    : ""}
                                </>
                              );
                            })}
                        <br />
                      </li>
                      
                      <li>
                        Unité operationelle:
                        {unit.length == 0
                          ? "Tous"
                          : unit.map((u) => {
                              return <> {u},</>;
                            })}{" "}
                        <br />
                        <br />
                      </li> */}
                      <li>
                        <b>Générer par: {userAuth.firstAndLastName}</b>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="row">
                  <div className="col l12">{reportGlobalChart}</div>
                </div>

                <div className="row">
                  <div className="col l12">{reportGlobalByCanalChart}</div>
                </div>

                <div className="row">
                  <div className="col l12">{reportGlobalByObjetChart}</div>
                </div>
                <div className="row">
                  <div className="col l12">
                    {reportMixteChart}
                    <canvas id="myChart2"></canvas>
                  </div>
                </div>

                {claimShow && (
                  <>
                    <div className="row mt-4" id="titleClaim">
                      <div className="col l12 center">
                        <span
                          style={{
                            color: "#015182",
                            fontSize: "25px",
                            fontWeight: "bold",
                          }}
                        >
                          Réclamations
                        </span>
                        <br />
                      </div>
                    </div>
                    <div
                      className="row mt-4 pl-2 mb-4 center"
                      id="dashClaimRapport"
                    >
                      {claimShow ? claimDashboard() : ""}
                    </div>

                    {props.claimReport.length != 0 ? (
                      <>
                        <div className="row mt-4">
                          <div className="col l12 s12 m12 mb-4">
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
                                  Statistiques des réclamations par agences
                                </span>
                                <br />
                              </div>

                              <div className="col l12 s12 m12 ">
                                {claimByAgenceChart}
                              </div>
                            </div>
                          </div>
                          <div className="col l12 s12 m12 mb-4">
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
                                  Statistiques des modalités de dépôt
                                  réclamations
                                </span>
                                <br />
                              </div>

                              <div className="col l12 s12 m12">
                                {claimByCanalChart}
                              </div>
                            </div>
                          </div>
                          <div className="col l12 s12 m12 mb-4">
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
                                  Statistiques des objets des réclamations
                                </span>
                                <br />
                              </div>

                              <div className="col l12 s12 m12">
                                {claimByObjetChart}
                              </div>
                            </div>
                          </div>
                          <div className="col l12 s12 m12 mb-4">
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
                                  Statistiques des réclamations par genre
                                </span>
                                <br />
                              </div>

                              <div className="col l12 s12 m12">
                                {claimByGenreChart}
                              </div>
                            </div>
                          </div>
                          <div className="col l12 s12 m12 mb-4">
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
                                  Statistiques des réclamations par niveaux de
                                  gravité
                                </span>
                                <br />
                              </div>

                              <div className="col l12 s12 m12">
                                {claimByGraviteChart}
                              </div>
                            </div>
                          </div>
                          <div className="col l12 s12 m12 mb-4">
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
                                  Statistiques de la satisfaction des réclamants
                                </span>
                                <br />
                              </div>

                              <div className="col l12 s12 m12">
                                {claimBySatisfactionChart}
                              </div>

                              <div
                                className="col l12 s12 m12 mt-4"
                                id="statClaimTable"
                              >
                                <span
                                  style={{
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Statistiques des réclamations
                                </span>
                                <br />
                                {claimTableStat()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="row mt-1 mb-3 center">
                        <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                          Aucune réclamation ne correspond aux critères de tri
                        </span>
                      </div>
                    )}
                  </>
                )}

                {denunciationShow && (
                  <>
                    <div className="row mt-4">
                      <div className="col l12 center">
                        <span
                          style={{
                            color: "#015182",
                            fontSize: "25px",
                            fontWeight: "bold",
                          }}
                        >
                          Dénonciations
                        </span>
                        <br />
                      </div>
                    </div>
                    <div
                      className="row mt-4 pl-2 mb-4 center"
                      id="dashDenunRapport"
                    >
                      {denunciationShow ? denunciationDashboard() : ""}
                    </div>
                    {props.denunReport.length != 0 ? (
                      <>
                        <div className="row">
                          <div className="col l12 mb-4" id="toeDenun">
                            <span
                              className="mt-2"
                              style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                              }}
                            >
                              Statistiques des dénonciations par agences
                            </span>
                            <br />
                            {denunByAgenceChart}
                          </div>
                          <div className="col l12 mb-4" id="toeDenun">
                            <span
                              className="mt-2"
                              style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                              }}
                            >
                              Statistiques des modalités de dépôt des
                              dénonciations
                            </span>
                            <br />
                            <div className="col l12 s12 m12">
                              {denunByCanalChart}
                            </div>
                          </div>
                          <div className="col l12 mb-4" id="toeDenun">
                            <span
                              className="mt-2"
                              style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                              }}
                            >
                              Statistiques des objets des dénonciations
                            </span>
                            <br />
                            <div className="col l12 s12 m12">
                              {denunByObjetChart}
                            </div>
                          </div>
                          <div className="col l12 mb-4" id="toeDenun">
                            <span
                              className="mt-2"
                              style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                              }}
                            >
                              Statistiques des dénonciations par niveau de
                              gravité
                            </span>
                            <br />
                            <div className="col l12 s12 m12">
                              {denunByGraviteChart}
                            </div>
                            <div
                              className="col l12 s12 m12 mt-4"
                              id="statDenunTable"
                            >
                              <span
                                style={{
                                  fontSize: "20px",
                                  fontWeight: "bold",
                                }}
                              >
                                Statistiques des dénonciations
                              </span>
                              <br />
                              {denunTableStat()}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="row mt-1 mb-3 center">
                        <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                          Aucune denonciation ne correspond aux critères de tri
                        </span>
                      </div>
                    )}
                  </>
                )}

                {suggestionShow && (
                  <>
                    <div className="row mt-4">
                      <div className="col l12 center">
                        <span
                          style={{
                            color: "#015182",
                            fontSize: "25px",
                            fontWeight: "bold",
                          }}
                        >
                          Suggestions
                        </span>
                        <br />
                      </div>
                    </div>
                    <div
                      className="row mt-4 pl-2 mb-4 center"
                      id="dashSuggestRapport"
                    >
                      {suggestionShow ? suggestionDashboard() : ""}
                    </div>
                    {props.sugReport.length != 0 ? (
                      <div className="row mt-2 ">
                        <div className="col l12 mb-4">
                          <div className="row" id="tpeSugg">
                            <div className="col l12 s12 m12">
                              <span
                                style={{
                                  fontSize: "20px",
                                  fontWeight: "bold",
                                }}
                              >
                                Statistiques des suggestions par agences
                              </span>
                              <br />
                            </div>
                            <div className="col l12 s12 m12">
                              {sugByAgenceChart}
                            </div>
                          </div>
                        </div>
                        <div className="col l12 mb-4">
                          <div className="row" id="tpeSugg">
                            <div className="col l12 s12 m12">
                              <span
                                style={{
                                  fontSize: "20px",
                                  fontWeight: "bold",
                                }}
                              >
                                Statistiques des modalités de dépôt suggestions
                              </span>
                              <br />
                            </div>
                            <div className="col l12 s12 m12">
                              {sugByCanalChart}
                            </div>
                          </div>
                        </div>
                        <div className="col l12 mb-4">
                          <div className="row" id="tpeSugg">
                            <div className="col l12 s12 m12">
                              <span
                                style={{
                                  fontSize: "20px",
                                  fontWeight: "bold",
                                }}
                              >
                                Statistiques des suggestions par genre
                              </span>
                              <br />
                            </div>
                            <div className="col l12 s12 m12">
                              {sugByGenderChart}
                            </div>
                            <div
                              className="col l12 s12 m12 mt-4"
                              id="statSugTable"
                            >
                              <span
                                style={{
                                  fontSize: "20px",
                                  fontWeight: "bold",
                                }}
                              >
                                Statistiques des suggestions
                              </span>
                              <br />
                              {sugTableStat()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="row mt-1 mb-3 center">
                        <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                          Aucune suggestion ne correspond aux critères de tri
                        </span>
                      </div>
                    )}
                  </>
                )}
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
    isLoading: state.report.isLoading,
    errors: state.report.report_errors,
    year: state.report.year,
    start: state.report.start,
    end: state.report.end,
    start_dp: state.report.start_dp,
    end_dp: state.report.end_dp,
    pos: state.report.pos,
    unit: state.report.unit,
    pilote: state.report.pilote,
    director: state.report.director,
    claims: state.report.claims,
    monthsYears: state.report.monthsYears,
    denunciations: state.report.denunciations,
    suggestions: state.report.suggestions,
    claim_trend: state.report.claim_trend,
    global_trend: state.report.global_trend,
    genre_trend: state.report.genre_trend,
    response_rate: state.report.response_rate,
    satisfaction_rate: state.report.satisfaction_rate,
    claimReport: state.report.claimReport,
    denunReport: state.report.denunReport,
    sugReport: state.report.sugReport,
    stat: state.report.stat,
    // basicStat: state.report.basicStat,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    reportErrorsChanged: (errors) => {
      dispatch(reportErrorsChanged(errors));
    },
    yearChanged: (year) => {
      dispatch(yearChanged(year));
    },
    startChanged: (start) => {
      dispatch(startChanged(start));
    },
    endChanged: (end) => {
      dispatch(endChanged(end));
    },
    startDPChanged: (start) => {
      dispatch(startDPChanged(start));
    },
    endDPChanged: (end) => {
      dispatch(endDPChanged(end));
    },
    unitChanged: (unit) => {
      dispatch(unitChanged(unit));
    },
    posChanged: (pos) => {
      dispatch(posChanged(pos));
    },
    directorChanged: (director) => {
      dispatch(directorChanged(director));
    },
    piloteChanged: (pilote) => {
      dispatch(piloteChanged(pilote));
    },
    claimsChanged: (claims) => {
      dispatch(claimsChanged(claims));
    },
    monthsYearsChanged: (monthsYears) => {
      dispatch(monthsYearsChanged(monthsYears));
    },
    denunciationsChanged: (denunciations) => {
      dispatch(denunciationsChanged(denunciations));
    },
    suggestionsChanged: (suggestions) => {
      dispatch(suggestionsChanged(suggestions));
    },
    claimTrendChanged: (claimTrend) => {
      dispatch(claimTrendChanged(claimTrend));
    },
    globalTrendChanged: (globalTrend) => {
      dispatch(globalTrendChanged(globalTrend));
    },
    genreTrendChanged: (genreTrend) => {
      dispatch(genreTrendChanged(genreTrend));
    },
    responseRateChanged: (responseRate) => {
      dispatch(responseRateChanged(responseRate));
    },
    satisfactionRateChanged: (satisfactionRate) => {
      dispatch(satisfactionRateChanged(satisfactionRate));
    },
    claimReportChanged: (claimReport) => {
      dispatch(claimReportChanged(claimReport));
    },
    claimReportChanged: (claimReport) => {
      dispatch(claimReportChanged(claimReport));
    },
    denunReportChanged: (denunReport) => {
      dispatch(denunReportChanged(denunReport));
    },
    sugReportChanged: (sugReport) => {
      dispatch(sugReportChanged(sugReport));
    },
    statChanged: (stat) => {
      dispatch(statChanged(stat));
    },
    yearChanged: (year) => {
      dispatch(yearChanged(year));
    },
    startChanged: (start) => {
      dispatch(startChanged(start));
    },
    endChanged: (end) => {
      dispatch(endChanged(end));
    },
    startDPChanged: (start) => {
      dispatch(startDPChanged(start));
    },
    endDPChanged: (end) => {
      dispatch(endDPChanged(end));
    },
    unitChanged: (unit) => {
      dispatch(unitChanged(unit));
    },
    // basicStatChanged: (basicStat) => {
    //   dispatch(basicStatChanged(basicStat));
    // },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Global);
