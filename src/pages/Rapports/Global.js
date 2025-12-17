import React, { useEffect, useImperativeHandle, useState } from "react";
import Select, { useStateManager } from "react-select";
import DatePicker from "react-datepicker";
import PDF_IMG from "../../assets/images/reports/pdf.svg";
import EXCEL_IMG from "../../assets/images/reports/excel.svg";
import WORD_IMG from "../../assets/images/reports/word.svg";
import FILTER_IMG from "../../assets/images/reports/filter2.svg";

import "react-datepicker/dist/react-datepicker.css";
import { mdColors } from "../../Utils/colors";
import { Link, NavLink } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import {
  cleanDate,
  generateString,
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
import { table2XLSX } from "../../Utils/tabletoexcel";
import { useRef } from "react";
import { handlePrintAvance } from "../../Utils/tables";

import { Chart, ArcElement, Legend } from "chart.js";
import { Bar, Doughnut, Line, Pie, Radar } from "react-chartjs-2";
import "chartjs-plugin-datalabels";
import {
  reportApi,
  reportApiFiltres,
  reportNewVersionExport,
  reportTemplateApi,
} from "../../apis/Rapports/GlobalsApi";
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
import tmpActions from "../../redux/actions/Rapports/TemplateActions";
import { connect } from "react-redux";
import CheckIcon from "@mui/icons-material/Check";
// import PrintIcon from "@mui/icons-material/Print";
// import FileDownloadIcon from "@mui/icons-material/FileDownload";
// import { BarController, DoughnutController } from "chart.js";
// import { PieController } from "chart.js";
// import {
//   LineController,
//   LineElement,
//   PointElement,
//   LinearScale,
//   Title,
//   CategoryScale,
// } from "chart.js";
import { registerables } from "chart.js";
import GaugeChart from "react-gauge-chart";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  Tooltip,
} from "@mui/material";
import { Chat, NoBackpack } from "@mui/icons-material";
import ChartDataLabels from "chartjs-plugin-datalabels";
// import ChartDataLabels from "chartjs-plugin-labels";
import html2canvas from "html2canvas";
import { MyGaugeChart } from "../../Utils/MyGaugeChart";
import { XAxis } from "recharts";
import { notify } from "../../Utils/alert";
import ReportTemplate from "./ReportTemplate";
import LazyChart from "./LazyChart";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import LazyChartSkeleton from "./LazyChartSkeleton";
import { LazyChartWrapper } from "./LazyChartWrapper";
import { data } from "jquery";
Chart.register(ChartDataLabels);
Chart.register(...registerables);

Chart.defaults.set("plugins.datalabels", {
  color: "#FFFFFF",
  font: {
    weight: "bold",
  },
});


const styles = {
  control: (base) => ({
    ...base,
    height: 35,
    minHeight: 35,
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
};

const Global = (props) => {

  const [open, setOpen] = React.useState(false);
  const [showSearch, setshowSearch] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
  const [globalShow, setGlobalShow] = useState(true);

  const [institution, setInstitution] = useState("");
  const [agrement, setAgrement] = useState("");
  const [adresse, setAdresse] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [logoInstitution, setLogoInstitution] = useState("");
  // const [filtres, setFiltres] = useState({});

  useEffect(() => {
    if (localStorage.getItem("app-institution")) {

      const instu = JSON.parse(
        typeof JSON.parse(localStorage.getItem("app-institution")) == "object" ? localStorage.getItem("app-institution") : JSON.parse(localStorage.getItem("app-institution"))
      );
      setLogoInstitution(instu.logo);
      setInstitution(instu.denomination ?? "");
      setAgrement(instu.numAgrement ?? "");
      setAdresse(instu.adresse ?? "");
      setTel(instu.tel ?? "");
      setEmail(instu.email ?? "");
    }
  }, ["alberic"]);

  // useEffect(() => {
  //   reportApiFiltres(props, filtres, setDataRaport);
  // }, [filtres]);


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

  const ps =
    loadItemFromSessionStorage("app-ps") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-ps"))
      : undefined;
  // console.log("ps",ps.length)
  if (products !== undefined) {
    products.map((product) => {
      return optionsProducts.push({
        label: product.libelle,
        value: product.id,
      });
    });
  }
  const userAuth = JSON.parse(loadItemFromSessionStorage("app-user"));

  const reportRef = useRef(null);
  const globalPieChartRef = useRef(null);
  const globalLineChartRef = useRef(null);
  const globalByCanalPieChartRef = useRef(null);
  const globalByCanalBarChartRef = useRef(null);
  const globalByObjetPieChartRef = useRef(null);
  const globalByObjetBarChartRef = useRef(null);
  const resolutionPieChartRef = useRef(null);
  const tauxMensuelClaimByMonthBarChartRef = useRef(null);
  const tauxMensuelClaimByMonthByAgenceBarChartRef = useRef(null);
  const resolutionClaimDelaiByMonthBarChartRef = useRef(null);
  const resolutionDenunDelaiByMonthBarChartRef = useRef(null);
  const resolutionDenunDelaiByMonthByAgenceBarChartRef = useRef(null);
  const resolutionClaimDelaiByMonthByAgenceBarChartRef = useRef(null);
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

  const [reload, setReload] = useState(true);
  const [dataRaport, setDataRaport] = useState(null);

  const [dataExcel, setDataExcel] = useState(null);
  useEffect(() => {
    if (reload) {
      setReload(false);
      reportApi(props, setDataRaport).then((r) => { });
    }
  }, [reload]);


  //Global state

  const [rdsPieGlobal, setRdsPieGlobal] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsBarGlobal, setRdsBarGlobal] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsPieModaliteGlobal, setRdsPieModaliteGlobal] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsBarModaliteGlobal, setRdsBarModaliteGlobal] = useState({
    labels: [],
    datasets: [],
  });


  const [rdsPieObjetGlobal, setRdsPieObjetGlobal] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsBarObjetGlobal, setRdsBarObjetGlobal] = useState({
    labels: [],
    datasets: [],
  });
  //the Gaugeh is taked from props directly

  const [rdsBarDelaiGlobal, setRdsBarDelaiGlobal] = useState({
    labels: [],
    datasets: [],
  });

  const [denunBarDelaiByMonth, setDenunBarDelaiByMonth] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsBarDelaiClaimByMonthByAgence, setRdsBarDelaiClaimByMonthByAgence] = useState({
    labels: [],
    datasets: [],
  });

  const [denunBarDelaiByMonthByAgence, setDenunBarDelaiByMonthByAgence] = useState({
    labels: [],
    datasets: [],
  });

  const [tauxMensuelClaimByMonth, setTauxMensuelClaimByMonth] = useState({
    labels: [],
    datasets: [],
  });

  const [tauxMensuelClaimByMonthByAgence, setTauxMensuelClaimByMonthByAgence] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsBarAgenceGlobal, setRdsBarAgenceGlobal] = useState({
    labels: [],
    datasets: [],
  });

  //Claim State
  const [rdsPieAgenceClaim, setRdsPieAgenceClaim] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsBarAgenceClaim, setRdsBarAgenceClaim] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsPieModaliteClaim, setRdsPieModaliteClaim] = useState({
    labels: [],
    datasets: [],
  });
  const [rdsBarModaliteClaim, setRdsBarModaliteClaim] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsPieObjetClaim, setRdsPieObjetClaim] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsBarObjetClaim, setRdsBarObjetClaim] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsPieGenreClaim, setRdsPieGenreClaim] = useState({
    labels: [],
    datasets: [],
  });
  const [rdsBarGenreClaim, setRdsBarGenreClaim] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsPieGravityClaim, setRdsPieGravityClaim] = useState({
    labels: [],
    datasets: [],
  });
  const [rdsBarGravityClaim, setRdsBarGravityClaim] = useState({
    labels: [],
    datasets: [],
  });
  const [rdsPieStatisClaim, setRdsPieStatisClaim] = useState({
    labels: [],
    datasets: [],
  });
  const [rdsChartStatisClaim, setRdsChartStatisClaim] = useState({
    labels: [],
    data: [],
  });
  const [rdsBarStatisClaim, setRdsBarStatisClaim] = useState({
    labels: [],
    data: [],
  });

  // Denun State
  const [rdsBarModaliteDenun, setRdsBarModaliteDenun] = useState({
    labels: [],
    datasets: [],
  });
  const [rdsBarObjetDenun, setRdsBarObjetDenun] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsBarGravityDenun, setRdsBarGravityDenun] = useState({
    labels: [],
    datasets: [],
  });
  const [rdsPieGravityDenun, setRdsPieGravityDenun] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsPieObjetDenun, setRdsPieObjetDenun] = useState({
    labels: [],
    datasets: [],
  });
  const [rdsPieAgenceDenun, setRdsPieAgenceDenun] = useState({
    labels: [],
    datasets: [],
  });
  const [rdsPieModaliteDenun, setRdsPieModaliteDenun] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsBarAgenceDenun, setRdsBarAgenceDenun] = useState({
    labels: [],
    datasets: [],
  });

  //Sugge

  const [rdsPieAgenceSugge, setRdsPieAgenceSugge] = useState({
    labels: [],
    datasets: [],
  });
  const [rdsBarAgenceSugge, setRdsBarAgenceSugge] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsPieModaliteSugge, setRdsPieModaliteSugge] = useState({
    labels: [],
    datasets: [],
  });
  const [rdsBarModaliteSugge, setRdsBarModaliteSugge] = useState({
    labels: [],
    datasets: [],
  });

  const [rdsBarGenreSugge, setRdsBarGenreSugge] = useState({
    labels: [],
    datasets: [],
  });
  const [rdsPieGenreSugge, setRdsPieGenreSugge] = useState({
    labels: [],
    datasets: [],
  });

  const [isPrinting, setIsPrinting] = useState(false);

  // console.log("taille ps:",rdsBarModaliteGlobal?.datasets[0]?.data?.length)
  // const nba = unit.length === 0 ? ((ps.length)*100)+"px" : ((unit.length)*100)+"px" ;
  let nba = ((rdsBarModaliteGlobal?.datasets[0]?.data?.length) * 100);
  nba = (parseInt(nba) < 600) ? 600 + "px" : parseInt(nba) + "px";
  // console.log("nba : ",nba)

  const delaiFunction = (data) => {
    const result = {
      labels: data.labels,
      datasets: [
        {
          label: "Délai respecté",
          backgroundColor: "#25AFBE",
          data: [],
        },
        // {
        //   backgroundColor: "#FF9933",
        //   label: "Délai non respecté",
        //   data: [],
        // },
      ],
    };
    if (data.labels) {
      const datasets = data.datasets;

      data.labels.forEach((lab, i) => {
        // let dataDelai = parseInt(datasets.data[i] ?? 0);
        // let dataNotDelai = parseInt(datasets.data[i] ?? 0);
        // let total = dataDelai + dataNotDelai;
        // let total = dataDelai;

        // result.datasets.data.push(
        //   Math.round((dataDelai * 100) / total).toLocaleString("en-US", {
        //     maximumFractionDigits: 2,
        //     minimumFractionDigits: 0,
        //   })
        // );
        // result.datasets[1].data.push(
        //   Math.round((dataNotDelai * 100) / total).toLocaleString("en-US", {
        //     maximumFractionDigits: 2,
        //     minimumFractionDigits: 0,
        //   })
        // );
      });
    }
    return result;
  };

  useEffect(() => {
    // console.log("dataReport",dataRaport);
    if (dataRaport) {
      const newreport = dataRaport.newVersionStat;
      const oldreport = dataRaport;
      if (newreport) {
        //Global
        setRdsBarModaliteGlobal(
          newReportGlobalTreatment(
            newreport["GeneralPerAgence"]["RSDModalite"] ?? []
          )
        );
        setRdsBarObjetGlobal(
          newReportGlobalTreatment(
            newreport["GeneralPerAgence"]["RSDObjet"] ?? []
          )
        );
        // console.log("objets", newreport["GeneralPerAgence"]["RSDObjet"]);
        //Claims
        setRdsBarGravityClaim(
          newReportGlobalTreatment(
            newreport["AgencePerGravity"]["claims"] ?? []
          )
        );
        setRdsBarGenreClaim(
          newReportGlobalTreatment(newreport["AgencePerGenre"]["claims"] ?? [])
        );
        setRdsBarObjetClaim(
          newReportGlobalTreatment(newreport["AgencePerObjet"]["claims"] ?? [])
        );
        setRdsBarModaliteClaim(
          newReportGlobalTreatment(
            newreport["AgencePerModalite"]["claims"] ?? []
          )
        );
        setRdsBarStatisClaim(
          newReportGlobalTreatment(
            newreport["AgencePerMesure"]["claims"] ?? []
          )
        );

        //Denonciations
        setRdsBarGravityDenun(
          newReportGlobalTreatment(
            newreport["AgencePerGravity"]["denonciations"] ?? []
          )
        );
        setRdsBarModaliteDenun(
          newReportGlobalTreatment(
            newreport["AgencePerModalite"]["denonciations"] ?? []
          )
        );
        setRdsBarObjetDenun(
          newReportGlobalTreatment(
            newreport["AgencePerObjet"]["denonciations"] ?? []
          )
        );

        //Suggestions
        setRdsBarModaliteSugge(
          newReportGlobalTreatment(
            newreport["AgencePerModalite"]["suggestions"] ?? []
          )
        );
        setRdsBarGenreSugge(
          newReportGlobalTreatment(
            newreport["AgencePerGenre"]["suggestions"] ?? []
          )
        );
      }
      if (oldreport !==undefined) {
        setRdsPieGlobal({
          labels:
            oldreport?.global["repartitionClaimDenunSuggest"]["labels"] ?? [],
          datasets: [
            {
              data:
                oldreport?.global["repartitionClaimDenunSuggest"]["datas"] ?? [],
              backgroundColor:
                oldreport.global["repartitionClaimDenunSuggest"][
                "backgroundColors"
                ] ?? [],
            },
          ],
        });

        setRdsBarGlobal({
          labels:
            oldreport?.global["evolutionClaimDenunSuggestByYear"]["labels"] ??
            [],

          datasets:
            oldreport?.global["evolutionClaimDenunSuggestByYear"]["data"],
        });
        // console.log("oldreport.global = ", oldreport.global["evolutionObjByYearAndAgence"])
        // setRdsBarAgenceGlobal(oldreport.global["evolutionObjByYearAndAgence"]);

        // Imaginons que `evolutionObjByYearAndAgence` a une structure similaire
        let evolutionData = oldreport?.global["evolutionObjByYearAndAgence"];

        // Créer un tableau de paires [label, data] pour les trier
        let combined = evolutionData.labels.map((label, index) => {
          return { label: label, data: evolutionData.datasets[0].data[index] };
        });

        // Trier les paires par ordre décroissant des valeurs de `data`
        combined.sort((a, b) => b.data - a.data);

        // Réorganiser les labels et les datasets en fonction du tri
        let sortedLabels = combined.map(item => item.label);
        let sortedData = combined.map(item => item.data);

        // Mettre à jour l'état avec les données triées
        setRdsBarAgenceGlobal({
          labels: sortedLabels,
          datasets: [
            {
              label: evolutionData.datasets[0].label, // Garder l'ancien label
              data: sortedData, // Utiliser les données triées
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });


        setRdsPieModaliteGlobal(
          oldReportTreatment(
            oldreport?.global["repartitionClaimDenuSuggestPerCanal"]
          )
        );
        setRdsPieObjetGlobal(
          oldReportTreatment(oldreport?.global["repartitionObjectByObj"])
        );

        // console.log("nbreClaimTreatInDelaiOrNotByMonth = ",oldreport.claimReport)
        setRdsBarDelaiGlobal(
          // delaiFunction(
          oldreport?.claimReport["nbreClaimTreatInDelaiOrNotByMonth"] ?? []
          // )
        );

        setDenunBarDelaiByMonth(
          // delaiFunction(
          oldreport?.claimReport["nbreDenunTreatInDelaiOrNotByMonth"] ?? []
          // )
        );

        setRdsBarDelaiClaimByMonthByAgence(
          // delaiFunction(
          oldreport?.claimReport["nbreClaimTreatInDelaiOrNotByMonthByAgence"] ?? []
          // )
        );

        setDenunBarDelaiByMonthByAgence(
          // delaiFunction(
          oldreport?.claimReport["nbreDenunTreatInDelaiOrNotByMonthByAgence"] ?? []
          // )
        );

        setTauxMensuelClaimByMonth(
          // delaiFunction(
          oldreport?.claimReport["tauxClaimSatisfactionByMonth"] ?? []
          // )
        );

        setTauxMensuelClaimByMonthByAgence(
          // delaiFunction(
          oldreport?.claimReport["tauxClaimSatisfactionByMonthByAgence"] ?? []
          // )
        );

        //Claim

        setRdsPieAgenceClaim(
          oldReportTreatment(oldreport?.claimReport["repartitionClaimPerAgence"])
        );
        // reclamations par agences
        setRdsBarAgenceClaim({
          labels: oldreport?.claimReport["nbreClaimPerAgence"]["labels"] ?? [],
          datasets: [
            {
              label: "Réclamations",
              data: oldreport?.claimReport["nbreClaimPerAgence"]["datas"] ?? [],
              backgroundColor:
                oldreport?.claimReport["nbreClaimPerAgence"][
                "backgroundColors"
                ] ?? [],
            },
          ],
        });
        setRdsPieObjetClaim(
          oldReportTreatment(oldreport?.claimReport["repartitionClaimPerObjet"])
        );
        setRdsPieModaliteClaim(
          oldReportTreatment(oldreport?.claimReport["repartitionClaimPerCanal"])
        );
        setRdsPieGenreClaim({
          labels:
            oldreport?.claimReport["repartitionClaimPerGender"]["labels"] ?? [],
          datasets: [
            {
              data:
                oldreport?.claimReport["repartitionClaimPerGender"]["datas"] ??
                [],
              backgroundColor:
                oldreport?.claimReport["repartitionClaimPerGender"][
                "backgroundColors"
                ] ?? [],
              hoverOffset: 4,
            },
          ],
        });

        setRdsPieGravityClaim({
          labels:
            oldreport?.claimReport["repartitionClaimPerObjRisque"]["labels"] ??
            [],
          datasets: [
            {
              data:
                oldreport?.claimReport["repartitionClaimPerObjRisque"][
                "datas"
                ] ?? [],
              backgroundColor:
                oldreport?.claimReport["repartitionClaimPerObjRisque"][
                "backgroundColors"
                ] ?? [],
              hoverOffset: 4,
            },
          ],
        });
        setRdsPieStatisClaim({
          labels:
            oldreport?.claimReport["repartitionClaimBySatisfaction"]["labels"] ??
            [],
          datasets: [
            {
              data:
                oldreport?.claimReport["repartitionClaimBySatisfaction"][
                "datas"
                ] ?? [],
              backgroundColor:
                oldreport?.claimReport["repartitionClaimBySatisfaction"][
                "backgroundColors"
                ] ?? [],
              hoverOffset: 4,
            },
          ],
        });
        setRdsChartStatisClaim(
          oldreport?.claimReport["evolutionSatisfactionByThisYear"]
        );


        //Suggestion
        setRdsPieAgenceSugge(
          oldReportTreatment(
            oldreport?.suggestionReport["repartitionSuggestPerAgence"]
          )
        );
        setRdsBarAgenceSugge({
          labels:
            oldreport?.suggestionReport["nbreSuggestPerAgence"]["labels"] ?? [],
          datasets: [
            {
              label: "Suggestions",
              data:
                oldreport?.suggestionReport["nbreSuggestPerAgence"]["datas"] ??
                [],
              backgroundColor:
                oldreport?.suggestionReport["nbreSuggestPerAgence"][
                "backgroundColors"
                ] ?? [],
            },
          ],
        });
        setRdsPieModaliteSugge(
          oldReportTreatment(
            oldreport?.suggestionReport["repartitionSuggestPerCanal"]
          )
        );
        setRdsPieGenreSugge({
          labels:
            oldreport?.suggestionReport["repartitionSuggestPerGender"][
            "labels"
            ] ?? [],
          datasets: [
            {
              data:
                oldreport?.suggestionReport["repartitionSuggestPerGender"][
                "datas"
                ] ?? [],
              backgroundColor:
                oldreport?.suggestionReport["repartitionSuggestPerGender"][
                "backgroundColors"
                ] ?? [],
              hoverOffset: 4,
            },
          ],
        });

        //Denonciation
        setRdsPieAgenceDenun(
          oldReportTreatment(oldreport?.denunReport["repartitionDenunPerAgence"])
        );
        setRdsPieModaliteDenun(
          oldReportTreatment(oldreport?.denunReport["repartitionDenunPerCanal"])
        );
        setRdsPieObjetDenun(
          oldReportTreatment(oldreport?.denunReport["repartitionDenunPerObjet"])
        );
        setRdsBarAgenceDenun({
          labels: oldreport?.denunReport["nbreDenunPerAgence"]["labels"] ?? [],
          datasets: [
            {
              label: "Dénonciations",
              data: oldreport?.denunReport["nbreDenunPerAgence"]["datas"] ?? [],
              backgroundColor:
                oldreport?.denunReport["nbreDenunPerAgence"][
                "backgroundColors"
                ] ?? [],
            },
          ],
        });
        setRdsPieGravityDenun({
          labels:
            oldreport?.denunReport["repartitionDenunPerObjRisque"]["labels"] ??
            [],
          datasets: [
            {
              data:
                oldreport?.denunReport["repartitionDenunPerObjRisque"][
                "datas"
                ] ?? [],
              backgroundColor:
                oldreport?.denunReport["repartitionDenunPerObjRisque"][
                "backgroundColors"
                ] ?? [],
            },
          ],
        });
      }
    }
  }, [dataRaport]);



  // const newReportGlobalTreatment = (data) => {
  //   let result = {
  //     labels: [],
  //     datasets: [],
  //   };
  //   console.log("data new version : ",data);
  //   if (data) {
  //     const datasetsKey = [];
  //     result.labels = Object.keys(data);
  //     result.labels.forEach((lb) => {
  //       let dataAgences = data[lb]["data"] ?? [];
  //       let totalAgences = data[lb]["totals"] == "0" ? 1 : data[lb]["totals"];
  //       // console.log("totalAgences",totalAgences);

  //       let purcentageCal = 100 / parseInt(totalAgences);

  //       dataAgences.forEach((agence) => {
  //         let totalClaimsAgence = dataAgences.reduce((acc, ag) => acc + parseFloat(ag.nbre), 0);
  //         let dataPerc = ((parseFloat(agence.nbre) / totalClaimsAgence) * 100).toFixed(2);

  //         // let dataPerc = (
  //         //   parseFloat(agence.nbre) * purcentageCal
  //         // ).toLocaleString("en-US", {
  //         //   maximumFractionDigits: 2,
  //         //   minimumFractionDigits: 0,
  //         // });
  //         // let dataPerc = Math.round(parseInt(agence.nbre) * purcentageCal);
  //         // let dataPerc =agence.nbre * purcentageCal

  //         // let dataPerc = (parseFloat(agence.nbre) * purcentageCal).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
  //         if (datasetsKey.includes(agence.name)) {
  //           const resultdata = [];
  //           result.datasets.forEach((d) => {
  //             if (d.label === agence.name) {
  //               resultdata.push({
  //                 label: d.label,
  //                 data: [...d.data, dataPerc],
  //                 stack: "Stack 0",
  //                 backgroundColor: d.backgroundColor,
  //               });
  //             } else {
  //               resultdata.push(d);
  //             }
  //           });
  //           result.datasets = resultdata;
  //         } else {
  //           datasetsKey.push(agence.name);
  //           result.datasets.push({
  //             label: agence.name,
  //             data: [dataPerc],
  //             backgroundColor: agence.color,
  //             stack: "Stack 0",
  //             totalWt: totalAgences,
  //           });
  //         }
  //       });
  //     });

  //     let newDatasets = result.datasets.sort((a, b) => b.totalWt - a.totalWt);
  //     // console.log ("newDatasets",newDatasets);
  //     const otherPush = {
  //       label: "Autres",
  //       data: [],
  //       backgroundColor: "rgb(10,114,153)",
  //       stack: "Stack 0",
  //       isInit: false,
  //     };
  //     let resultDatasets = [];

  //     newDatasets.forEach((dd, i) => {
  //       //console.log(" boucle",dd +"  --  i :",i);
  //       if (i > 9) {
  //         otherPush.isInit = true;
  //         if (otherPush?.data?.length > 0) {
  //           otherPush.data.forEach((ot, j) => {
  //             otherPush.data[j] =
  //               parseFloat(
  //                 ot?.toLocaleString("en-US", {
  //                   maximumFractionDigits: 2,
  //                   minimumFractionDigits: 0,
  //                 })
  //               ) +
  //               parseFloat(
  //                 dd?.data[j]?.toLocaleString("en-US", {
  //                   maximumFractionDigits: 2,
  //                   minimumFractionDigits: 0,
  //                 })
  //               );
  //           });
  //         } else {
  //           otherPush.data = dd.data;
  //         }
  //       } else {
  //         resultDatasets.push(dd);
  //       }
  //     });

  //     if (otherPush.isInit) {
  //       resultDatasets.push(otherPush);
  //     }
  //     result.datasets = resultDatasets;
  //   }

  //   // Créer un tableau de paires [label, data] pour les trier
  //   let combined = result.labels.map((label, index) => {
  //     return { label: label, data: result?.datasets[0]?.data[index] };
  //   });

  //   // Trier les paires par ordre décroissant des valeurs de `data`
  //   combined.sort((a, b) => b.data - a.data);

  //   // Réorganiser les labels et les data en fonction du tri
  //   // Vérification avant d'affecter les données triées
  //   if (result.datasets && result.datasets.length > 0) {
  //     result.datasets[0].data = combined.map(item => item.data);
  //   } else {
  //     result.datasets = [{ data: new Array(result.labels.length).fill(0) }]; // Par exemple, un tableau de zéros
  //     console.error("Error: datasets is undefined or empty");
  //   }

  //   console.log("result result = ",result);
  //   return result;


  // };

  const newReportGlobalTreatment = (data) => {
    let result = {
      labels: [],
      datasets: [],
    };

    // console.log("data new version : ", data);

    if (data) {
      const datasetsKey = [];
      result.labels = Object.keys(data);
      result.labels.forEach((lb) => {
        let dataAgences = data[lb]["data"] ?? [];
        let totalAgences = data[lb]["totals"] == "0" ? 1 : data[lb]["totals"];

        let purcentageCal = 100 / parseInt(totalAgences);

        dataAgences.forEach((agence) => {
          let dataPerc = ((parseFloat(agence.nbre) / totalAgences) * 100).toFixed(2);
          // console.log("totalClaimsAgence - " + lb, dataPerc);

          if (datasetsKey.includes(agence.name)) {
            const resultdata = [];
            result.datasets.forEach((d) => {
              if (d.label === agence.name) {
                resultdata.push({
                  label: d.label,
                  data: [...d.data, dataPerc],
                  stack: "Stack 0",
                  backgroundColor: d.backgroundColor,
                });
              } else {
                resultdata.push(d);
              }
            });
            result.datasets = resultdata;
          } else {
            datasetsKey.push(agence.name);
            result.datasets.push({
              label: agence.name,
              data: [dataPerc],
              backgroundColor: agence.color,
              stack: "Stack 0",
              totalWt: totalAgences,
            });
          }
        });
      });

      let newDatasets = result.datasets;

      const otherPush = {
        label: "Autres",
        data: [],
        backgroundColor: "rgb(10,114,153)",
        stack: "Stack 0",
        isInit: false,
      };

      let resultDatasets = [];

      newDatasets.forEach((dd, i) => {
        if (i > 9) {
          otherPush.isInit = true;
          if (otherPush?.data?.length > 0) {
            otherPush.data.forEach((ot, j) => {
              otherPush.data[j] =
                parseFloat(
                  ot?.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 0,
                  })
                ) +
                parseFloat(
                  dd?.data[j]?.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 0,
                  })
                );
            });
          } else {
            otherPush.data = dd.data;
          }
        } else {
          resultDatasets.push(dd);
        }
      });

      if (otherPush.isInit) {
        resultDatasets.push(otherPush);
      }
      result.datasets = resultDatasets;
    }

    // console.log("result result = ", result);
    return result;
  };


  const oldReportTreatment = (info, limit = 10) => {
    let result = {
      data: [],
      backgroundColor: [],
      hoverColor: [],
      hoverOffset: 4,
    };
    let labels = [];
    if (info) {
      const filterList = [];
      info.datas.forEach((data, i) => {
        filterList.push({
          label: info.labels[i],
          backgroundColor: info.backgroundColors[i],
          data,
        });
      });

      const resultSort = filterList.sort((a, b) => b.data - a.data);

      var otherCount = 0;

      resultSort.forEach((dt, j) => {
        if (j < limit) {
          labels.push(dt.label);
          result.data.push(dt.data);
          result.backgroundColor.push(dt.backgroundColor);
        } else {
          otherCount = otherCount + dt.data;
        }
      });

      if (parseInt(otherCount) > 0) {
        labels.push("Autres");
        result.data.push(
          parseFloat(otherCount.toLocaleString("en-US", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
          }))
        );
        result.backgroundColor.push("rgb(10,114,153)");
      }
    }

    return {
      labels,
      datasets: [result],
    };
  };

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
          : setClaimShow(false); setGlobalShow(false);
        plainteType.includes("denunciation")
          ? setDenunciationShow(true)
          : setDenunciationShow(false); setGlobalShow(false);
        plainteType.includes("suggestion")
          ? setSuggestionShow(true)
          : setSuggestionShow(false); setGlobalShow(false);
      });
    } else {
      setDenunciationShow(true);
      setClaimShow(true);
      setSuggestionShow(true);
      setGlobalShow(true);
    }

    // setFiltres({
    //   year: props.year,
    //   objets: objet,
    //   etats: etatState,
    //   products: product,
    //   saved_by: recoredBy,
    //   receiveStart: cleanDate(startDate),
    //   receiveEnd: cleanDate(endDate),
    //   servicePoints: unit,
    //   canals: [] // Si tu as besoin de cette propriété vide
    // });

    let filtres = {}
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
    // console.log("filtres",filtres);
    handleClose(e);
    // setDataRaport(null);
    reportApiFiltres(props, filtres, setDataRaport).then((r) => { });
    // console.log('Data after API call:', dataRaport);
  };

  const claimDashboard = () => {
    let dableReturn = (
      <div className="col l12 s12 m12 mb-2">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "18px", color: "#015182" }}>
            <b>{props.claimReport?.basicStats?.total}</b> Réclamation(s)
          </span>

          <table
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
                      {props.claimReport?.basicStats?.statusAndValue?.AFFECTED}
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
                      {props.claimReport?.basicStats?.statusAndValue?.SATISFIED}
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
    );

    return dableReturn;
  };
  const suggestionDashboard = () => {
    let dableReturn = (
      <div className="col l12 s12 m12 mt-2 mb-2">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "18px", color: "#015182" }}>
            <b>{props.sugReport?.basicStats?.total} </b>
            Suggestions(s)
          </span>

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
                      {props.sugReport?.basicStats?.statusAndValue?.UNACCEPTED}
                    </span>
                  </td>
                </>
              }
            </tr>
          </table>
        </div>
      </div>
    );
    return dableReturn;
  };
  
  const restoreSection = (sectionKey) => {
    props.setTemplateData({
      ...props.templateData, [sectionKey]: Object.fromEntries(
        Object.keys(props.templateData[sectionKey]).map(key => [key, true])
      )
    })
  };

  const hasFalseInSection = (sectionKey) => {

    return Object.values(props.templateData?.[sectionKey] ?? {}).includes(false);
  }

  const denunciationDashboard = () => {
    let dableReturn = (
      <div className="col l12 s12 m12 mt-2 mb-2">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "18px", color: "#015182" }}>
            <b>{props.denunReport?.basicStats?.total} </b>
            Dénonciation(s)
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
                      {props.denunReport?.basicStats?.statusAndValue?.AFFECTED}
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
    );
    return dableReturn;
  };
  // Fin dashboard Affichage

  //Graphiques
  const reportGlobalChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.global.globalPieChartRef ? <div className="col s12 m12 l6 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >              
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, globalPieChartRef: false } }) }} /> : <></>}</div>
              <div style={{ flex: "1 auto" }}>              
                <LazyChart height={600} forceRender={isPrinting}>
                  {rdsPieGlobal ? (
                    <LazyChartWrapper
                      type="pie"
                      data={rdsPieGlobal}
                      visible={rdsPieGlobal == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des réclamations, dénonciations et suggestions (%)",
                          },
                          legend: { position: "bottom" },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                      chartRef={globalPieChartRef}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
          {props.templateData?.global.globalLineChartRef ? <div className="col s12 m12 l6 animate fadeRight center-align">        
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, globalLineChartRef: false } }) }} /> : <></>}</div>
              <div
                className="total-transaction-container "
                style={{ flex: "1 auto" }}
              >
                <LazyChart height={600} forceRender={isPrinting}>
                  {rdsBarGlobal ? (
                    <LazyChartWrapper
                      type="bar"
                      data={rdsBarGlobal}
                      visible={rdsBarGlobal == null}
                      options={{
                        plugins: {
                          title: { display: true, text: "Glissement annuel des RSD", position: "top" },
                          legend: { position: "bottom" },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                      chartRef={globalLineChartRef}
                    />
                  ) : (
                    <LazyChartSkeleton type="bar" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
        </div>
      </div>
    </>
  );

  const reportGlobalByCanalChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.global.globalByCanalPieChartRef ? <div className="col s12 m12 l12 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, globalByCanalPieChartRef: false } }) }} /> : <></>}</div>
              <div
                className="total-transaction-container"
                style={{ flex: "1 auto" }}
              >
                <LazyChart height={600} forceRender={isPrinting}>
                 {rdsPieModaliteGlobal ? (
                    <LazyChartWrapper
                      type="pie"
                      chartRef={globalByCanalPieChartRef}
                      data={rdsPieModaliteGlobal}
                      visible={rdsPieModaliteGlobal == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des réclamations, dénonciations, suggestions par modalité de dépôt (%)",
                            position: "top",
                          },
                          legend: { position: "bottom" },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
          {props.templateData?.global.globalByCanalBarChartRef ? <div className="col s12 m12 l12 animate fadeRight center-align">
            <div
              className="card"
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, globalByCanalBarChartRef: false } }) }} /> : <></>}</div>              
              <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                {rdsBarModaliteGlobal ? (
                  <LazyChartWrapper
                    type="bar"
                    chartRef={globalByCanalBarChartRef}
                    data={rdsBarModaliteGlobal}
                    visible={rdsBarModaliteGlobal == null}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des RSD par modalité de dépôt et par agence (%)",
                          position: "top",
                        },
                        legend: { position: "bottom" },
                      },
                      indexAxis: "y",
                      responsive: true,
                      scales: {
                        x: {
                          stacked: true,
                          ticks: {
                            callback: (value) => `${value}%`,
                          },
                          min: 0,
                          max: 100,
                          offset: false,
                        },
                      },
                      maintainAspectRatio: false,
                    }}
                  />
                ) : (
                  <LazyChartSkeleton type="bar" height={1200} />
                )}
              </LazyChart>
            </div>
          </div> : <></>}
        </div>
      </div>

      <div className="divider mt-2 mb-2"></div>
    </>
  );

  const reportGlobalByObjetChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.global.globalByObjetPieChartRef ? <div className="col s12 m12 l12 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "500px",
                maxHeight: "500px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >

              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, globalByObjetPieChartRef: false } }) }} /> : <></>}</div>
              <div
                className="total-transaction-container"
                style={{ flex: "1 auto" }}
              >
                <LazyChart height={500} forceRender={isPrinting}>
                  {rdsPieObjetGlobal ? (
                    <LazyChartWrapper
                      type="pie"
                      data={rdsPieObjetGlobal}
                      visible={rdsPieObjetGlobal == null}
                      options={{
                        plugins: {
                          title: { display: true, text: "Répartition des réclamations, dénonciations par objets (%)", position: "top" },
                          legend: { position: "bottom", maxWidth: 30 },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                      chartRef={globalByObjetPieChartRef}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={500} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
          {props.templateData?.global.globalByObjetBarChartRef ? <div className="col s12 m12 l12 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, globalByObjetBarChartRef: false } }) }} /> : <></>}</div>
              <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                {rdsBarObjetGlobal ? (
                  <LazyChartWrapper
                    type="bar"
                    data={rdsBarObjetGlobal}
                    visible={rdsBarObjetGlobal == null}
                    options={{
                      plugins: {
                        title: { display: true, text: "Répartition des Réclamations et Dénonciations par objets et par agence(%)", position: "top" },
                        legend: { position: "bottom" },
                      },
                      responsive: true,
                      indexAxis: "y",
                      scales: {
                        x: { stacked: true, ticks: { callback: (value) => `${value}%` }, max: 100, offset: false },
                      },
                      maintainAspectRatio: false,
                    }}
                    chartRef={globalByObjetBarChartRef}
                  />
                ) : (
                  <LazyChartSkeleton type="bar" height={600} />
                )}
              </LazyChart>
            </div>
          </div> : <></>}
        </div>
      </div>

      <div className="divider mt-2 mb-2"></div>
    </>
  );

  const reportMixteChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.global.resolutionPieChartRef ?
            <div className="col s12 m4 l3 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, resolutionPieChartRef: false } }) }} /> : <></>}</div>
                <h8 className="mb-4">Taux de résolution des plaintes</h8>
                <div
                  className="total-transaction-container"
                  style={{ flex: "1 auto" }}
                >
                  <MyGaugeChart
                    global_trend={parseFloat(props.global_trend?.tauxResolution)}
                    colors={["#EA4228", "#F5CD19", "#5BE12C"]}
                    ref={resolutionPieChartRef}
                  />
                </div>
              </div>
            </div> : <></>
          }

          {props.templateData?.global.evolutionByAgenceByAnneeBarChartRef ?
            <div className="col s12 m12 l12">
              <div
                className="card"
                style={{
                  height: "500px",
                  maxHeight: "500x",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, evolutionByAgenceByAnneeBarChartRef: false } }) }} /> : <></>}</div>
                <LazyChart overflow={"x"} height={nba} forceRender={isPrinting}>
                  {rdsBarAgenceGlobal ? (
                    <LazyChartWrapper
                      type="bar"
                      data={rdsBarAgenceGlobal}
                      visible={rdsBarAgenceGlobal == null}
                      options={{
                        plugins: {
                          title: {
                            text: "Evolution annuelle des réclamations, dénonciations, suggestions par agence",
                            position: "top",
                            display: true,
                          },
                          legend: { position: "bottom" },
                        },
                        scales: {
                          x: {
                            ticks: {
                              callback: function (value) {
                                let text = this.getLabelForValue(value);
                                return text.length > 6 ? text.substring(0, 5) + "..." : text;
                              },
                            },
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                      chartRef={evolutionByAgenceByAnneeBarChartRef}
                    />
                  ) : (
                    <LazyChartSkeleton type="bar" height={600} />
                  )}
                </LazyChart>
              </div>
            </div> : <></>
          }
        </div>
      </div>

      <div className="divider mt-2 mb-2"></div>
    </>
  ); 

  const claimByAgenceChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.claim.claimByAgencePieChartRef ? <div className="col s12 m12 l6 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByAgencePieChartRef: false } }) }} /> : <></>}</div>
              <div
                className="total-transaction-container"
                style={{ flex: "1 auto" }}
              >
                <LazyChart height={600} forceRender={isPrinting}>
                  {rdsPieAgenceClaim ? (
                    <LazyChartWrapper
                      type="pie"
                      chartRef={claimByAgencePieChartRef}
                      data={rdsPieAgenceClaim}
                      visible={rdsPieAgenceClaim == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des réclamations par agence (%)",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
          {props.templateData?.claim.claimByAgenceBarChartRef ? <div className="col s12 m12 l6 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByAgenceBarChartRef: false } }) }} /> : <></>}</div>
              <LazyChart overflow={"x"} height={nba} forceRender={isPrinting}>
                {rdsBarAgenceClaim ? (
                  <LazyChartWrapper
                    type="bar"
                    chartRef={claimByAgenceBarChartRef}
                    data={rdsBarAgenceClaim}
                    visible={rdsBarAgenceClaim == null}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de réclamations par Agence",
                          position: "top"
                        },
                        labels: {
                          render: "value",
                          position: "outside",
                          fontColor: function (data) {
                            return "black";
                          },
                        },
                        legend: {
                          position: "bottom",
                        },
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                ) : (
                  <LazyChartSkeleton type="pie" height={600} />
                )}
              </LazyChart>
            </div>
          </div> : <></>}
        </div>
      </div>
    </>
  );
  const denunByAgenceChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.denun.denunByAgencePieChartRef ? <div className="col s12 m12 l6 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByAgencePieChartRef: false } }) }} /> : <></>}</div>
              <div
                className="total-transaction-container"
                style={{ flex: "1 auto" }}
              >
                <LazyChart height={600} forceRender={isPrinting}>
                  {rdsPieAgenceDenun ? (
                    <LazyChartWrapper
                      type="pie"
                      chartRef={denunByAgencePieChartRef}
                      // options={claimByAgencePieChartRef}
                      data={rdsPieAgenceDenun}
                      visible={rdsPieAgenceDenun == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des dénonciations par agence (%)",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
          {props.templateData?.denun.denunByAgenceBarChartRef ? <div className="col s12 m12 l6 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByAgenceBarChartRef: false } }) }} /> : <></>}</div>
              <LazyChart overflow={"x"} height={nba} forceRender={isPrinting}>
                {rdsBarAgenceDenun ? (
                  <LazyChartWrapper
                    type="bar"
                    chartRef={denunByAgenceBarChartRef}
                    data={rdsBarAgenceDenun}
                    visible={rdsBarAgenceDenun == null}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Nombre de dénonciations par Agence",
                          position: "top",
                        },
                        labels: {
                          render: "value",
                          position: "outside",
                          fontColor: function (data) {
                            return "black";
                          },
                        },
                        legend: {
                          position: "bottom",
                        },
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                ) : (
                  <LazyChartSkeleton type="pie" height={600} />
                )}
              </LazyChart>
            </div>
          </div> : <></>}
        </div>
      </div>
    </>
  );
  const sugByAgenceChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.suggest.sugByAgencePieChartRef ? <div className="col s12 m12 l6 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, suggest: { ...props.templateData?.suggest, sugByAgencePieChartRef: false } }) }} /> : <></>}</div>
              <div
                className="total-transaction-container"
                style={{ flex: "1 auto" }}
              >
                <LazyChart height={600} forceRender={isPrinting}>
                  {rdsPieAgenceSugge ? (
                    <LazyChartWrapper
                      type="pie"
                      chartRef={sugByAgencePieChartRef}
                      // redraw={true}
                      // options={claimByAgencePieChartRef}
                      data={rdsPieAgenceSugge}
                      visible={rdsPieAgenceSugge == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des suggestions par agence (%)",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
          {props.templateData?.suggest.sugByAgenceBarChartRef ?
            <div>
            <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, suggest: { ...props.templateData?.suggest, sugByAgenceBarChartRef: false } }) }} /> : <></>}</div>
                <LazyChart overflow={"x"} height={nba} forceRender={isPrinting}>
                  {rdsBarAgenceSugge ? (
                    <LazyChartWrapper
                      type="bar"
                      chartRef={sugByAgenceBarChartRef}
                      // redraw={true}
                      data={rdsBarAgenceSugge}
                      visible={rdsBarAgenceSugge == null}
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
                          legend: {
                            position: "bottom",
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
        </div>
      </div>

      <div className="divider mt-3 mb-3"></div>
    </>
  );

  const claimByCanalChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.claim.claimByCanalPieChartRef ? <div className="col s12 m12 l6 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByCanalPieChartRef: false } }) }} /> : <></>}</div>
              <div
                className="total-transaction-container "
                style={{ flex: "1 auto" }}
              >
                <LazyChart height={600} forceRender={isPrinting}>
                  {rdsPieModaliteClaim ? (
                    <LazyChartWrapper
                      type="pie"
                      chartRef={claimByCanalPieChartRef}
                      // redraw={true}
                      // options={claimByAgencePieChartRef}
                      data={rdsPieModaliteClaim}
                      visible={rdsPieModaliteClaim == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des réclamations par modalité de dépôt (%)",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
          {props.templateData?.claim.claimByCanalBarChartRef ? <div className="col s12 m12 l6 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByCanalBarChartRef: false } }) }} /> : <></>}</div>
              <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                {rdsBarModaliteClaim ? (
                  <LazyChartWrapper
                    type="bar"
                    chartRef={claimByCanalBarChartRef}
                    // redraw={true}
                    data={rdsBarModaliteClaim}
                    visible={rdsBarModaliteClaim == null}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des réclamations par modalité de dépôt et par agence (%)",
                          position: "top",
                        },
                        legend: {
                          position: "bottom",
                        },
                      },
                      responsive: true,
                      indexAxis: "y",
                      scales: {
                        x: {
                          stacked: true,
                          ticks: {
                            callback: function (value) {
                              return value + "%";
                            },
                          },
                          max: 100,
                          offset: false,
                        },
                        y: {
                          stacked: true,
                        },
                      },
                      maintainAspectRatio: false,
                    }}
                  />
                ) : (
                  <LazyChartSkeleton type="pie" height={600} />
                )}
              </LazyChart>
            </div>
          </div> : <></>}
        </div>
      </div>
    </>
  );
  const denunByCanalChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.denun.denunByCanalPieChartRef ? <div className="col s12 m12 l6 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByCanalPieChartRef: false } }) }} /> : <></>}</div>
              <div
                className="total-transaction-container"
                style={{ flex: "1 auto" }}
              >
                <LazyChart height={600} forceRender={isPrinting}>
                  {rdsPieModaliteDenun ? (
                    <LazyChartWrapper
                      type="pie"
                      chartRef={denunByCanalPieChartRef}
                      // redraw={true}
                      data={rdsPieModaliteDenun}
                      visible={rdsPieModaliteDenun == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des modalités de dépôt des dénonciations (%)",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
          {props.templateData?.denun.denunByCanalBarChartRef ? <div className="col s12 m12 l6 animate fadeRight center-align">
            <div
              className="card"
              style={{
                height: "600px",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByCanalBarChartRef: false } }) }} /> : <></>}</div>
              <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                {rdsBarModaliteDenun ? (
                  <LazyChartWrapper
                    type="bar"
                    chartRef={denunByCanalBarChartRef}
                    // redraw={true}
                    data={rdsBarModaliteDenun}
                    visible={rdsBarModaliteDenun == null}
                    options={{
                      plugins: {
                        title: {
                          display: true,
                          text: "Répartition des dénonciations par modalité de dépôt et par agence (%)",
                          position: "top",
                        },
                        legend: {
                          position: "bottom",
                        },
                      },
                      responsive: true,
                      indexAxis: "y",
                      scales: {
                        x: {
                          stacked: true,
                          ticks: {
                            callback: function (value) {
                              return value + "%";
                            },
                          },
                          max: 100,
                          offset: false,
                          beginAtZero: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },

                      maintainAspectRatio: false,
                    }}
                  />
                ) : (
                  <LazyChartSkeleton type="pie" height={600} />
                )}
              </LazyChart>
            </div>
          </div> : <></>}
        </div>
      </div>
    </>
  );
  const sugByCanalChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.suggest.sugByCanalPieChartRef ? <div>
            <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, suggest: { ...props.templateData?.suggest, sugByCanalPieChartRef: false } }) }} /> : <></>}</div>
                <div
                  className="total-transaction-container"
                  style={{ flex: "1 auto" }}
                >
                  <LazyChart height={600} forceRender={isPrinting}>
                    {rdsPieModaliteSugge ? (
                      <LazyChartWrapper
                        type="pie"
                        chartRef={sugByCanalPieChartRef}
                        // redraw={true}
                        // options={claimByAgencePieChartRef}
                        data={rdsPieModaliteSugge}
                        visible={rdsPieModaliteSugge == null}
                        options={{
                          plugins: {
                            title: {
                              display: true,
                              text: " Répartition des modalités de dépôt des suggestions (%)",
                            },
                            legend: {
                              position: "bottom",
                            },
                          },
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <LazyChartSkeleton type="pie" height={600} />
                    )}
                  </LazyChart>
                </div>
              </div>
            </div>
          </div> : <></>}          
          {props.templateData?.suggest.sugByCanalBarChartRef ? <div>
            <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, suggest: { ...props.templateData?.suggest, sugByCanalBarChartRef: false } }) }} /> : <></>}</div>
                <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                  {rdsBarModaliteSugge ? (
                    <LazyChartWrapper
                      type="bar"
                      chartRef={sugByCanalBarChartRef}
                      // redraw={true}
                      data={rdsBarModaliteSugge}
                      visible={rdsBarModaliteSugge == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des suggestions par modalité de dépôt et par agence (%)",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        responsive: true,
                        indexAxis: "y",
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            stacked: true,
                            ticks: {
                              callback: function (value) {
                                return value + "%";
                              },
                              max: 100,
                              offset: false,
                            },
                            max: 100,
                            offset: false,
                            beginAtZero: true,
                          },
                          y: {
                            stacked: true,
                          },
                        },
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
        </div>
      </div>

      <div className="divider mt-1 mb-1"></div>
    </>
  );

  const claimByObjetChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          
          {props.templateData?.claim.claimByObjetPieChartRef ? <div>
            <div className="col s12 m12 l12 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByObjetPieChartRef: false } }) }} /> : <></>}</div>
                <div
                  className="total-transaction-container "
                  style={{ flex: "1 auto" }}
                >
                  <LazyChart height={600} forceRender={isPrinting}>
                    {rdsPieObjetClaim ? (
                      <LazyChartWrapper
                        type="pie"
                        chartRef={claimByObjetPieChartRef}
                        // redraw={true}
                        // options={claimByAgencePieChartRef}
                        data={rdsPieObjetClaim}
                        visible={rdsPieObjetClaim == null}
                        options={{
                          plugins: {
                            title: {
                              display: true,
                              text: "Répartition des objets des réclamations (%)",
                            },
                            legend: {
                              position: "bottom",
                            },
                          },
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <LazyChartSkeleton type="pie" height={600} />
                    )}
                  </LazyChart>
                </div>
              </div>
            </div>
          </div> : <></>}
          
          {props.templateData?.claim.claimByObjetBarChartRef ? <div>
            <div className="col s12 m12 l12 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "500px",
                  maxHeight: "500px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByObjetBarChartRef: false } }) }} /> : <></>}</div>
                <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                  {rdsBarObjetClaim ? (
                    <LazyChartWrapper
                      type="bar"
                      chartRef={claimByObjetBarChartRef}
                      // redraw={true}
                      data={rdsBarObjetClaim}
                      visible={rdsBarObjetClaim == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des réclamations par objet par agence (%)",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        indexAxis: "y",
                        responsive: true,
                        scales: {
                          x: {
                            stacked: true,
                            ticks: {
                              callback: function (value) {
                                return value + "%";
                              },
                            },
                            max: 100,
                            offset: false,
                            min: 0,
                            beginAtZero: true,
                          },
                          y: {
                            stacked: true,
                          },
                        },
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
        </div>
      </div>

    </>
  );
  const denunByObjetChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.denun.denunByObjetPieChartRef ? <div>
            <div className="col s12 m12 l12 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByObjetPieChartRef: false } }) }} /> : <></>}</div>
                <div
                  className="total-transaction-container"
                  style={{ flex: "1 auto" }}
                >
                  <LazyChart height={600} forceRender={isPrinting}>
                    {rdsPieObjetDenun ? (
                      <LazyChartWrapper
                        type="pie"
                        chartRef={denunByObjetPieChartRef}
                        // redraw={true}
                        // options={claimByAgencePieChartRef}
                        data={rdsPieObjetDenun}
                        visible={rdsPieObjetDenun == null}
                        options={{
                          plugins: {
                            title: {
                              display: true,
                              text: " Répartition des objets des dénonciations (%)",
                            },
                            legend: {
                              position: "bottom",
                            },
                          },
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <LazyChartSkeleton type="pie" height={600} />
                    )}
                  </LazyChart>
                </div>
              </div>
            </div>
          </div> : <></>}
          {props.templateData?.denun.denunByObjetBarChartRef ? <div>
            <div className="col s12 m12 l12 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "500px",
                  maxHeight: "500px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByObjetBarChartRef: false } }) }} /> : <></>}</div>
                <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                  {rdsBarObjetDenun ? (
                    <LazyChartWrapper
                      // redraw={true}                      
                      type="bar"
                      chartRef={denunByObjetBarChartRef}
                      data={rdsBarObjetDenun}
                      visible={rdsBarObjetDenun == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des dénonciations par objet par agence (%)",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        responsive: true,
                        indexAxis: "y",
                        scales: {
                          x: {
                            stacked: true,
                            ticks: {
                              callback: function (value) {
                                return value + "%";
                              },
                            },
                            max: 100,
                            offset: false,
                          },
                          y: {
                            stacked: true,
                          },
                        },
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="bar" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
        </div>
      </div>
    </>
  );

  const claimByGenreChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.claim.claimByGenderPieChartRef ? <div>
            <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByGenderPieChartRef: false } }) }} /> : <></>}</div>
                <div
                  className="total-transaction-container"
                  style={{ flex: "1 auto" }}
                >
                  <LazyChart height={600} forceRender={isPrinting}>
                    {rdsPieGenreClaim ? (
                      <LazyChartWrapper
                        type="pie"
                        chartRef={claimByGenderPieChartRef}
                        // redraw={true}
                        // options={claimByAgencePieChartRef}
                        data={rdsPieGenreClaim}
                        visible={rdsPieGenreClaim == null}
                        options={{
                          plugins: {
                            title: {
                              display: true,
                              text: "Répartition des réclamations par genre (%)",
                            },
                            legend: {
                              position: "bottom",
                            },
                          },
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <LazyChartSkeleton type="pie" height={600} />
                    )}
                  </LazyChart>
                </div>
              </div>
            </div>
          </div> : <></>}    
          {props.templateData?.claim.claimByGenderBarChartRef ? <div>
            <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByGenderBarChartRef: false } }) }} /> : <></>}</div>
                <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                  {rdsBarGenreClaim ? (
                    <LazyChartWrapper
                      type="bar"
                      chartRef={claimByGenderBarChartRef}
                      // redraw={true}
                      data={rdsBarGenreClaim}
                      visible={rdsBarGenreClaim == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des réclamations par genre par agence (%)",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        indexAxis: "y",
                        responsive: true,
                        scales: {
                          x: {
                            stacked: true,
                            ticks: {
                              callback: function (value) {
                                return value + "%";
                              },
                            },
                            max: 100,
                            offset: false,
                          },
                          y: {
                            stacked: true,
                          },
                        },

                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}                          
        </div>
      </div>
    </>
  );

  const sugByGenderChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">
          {props.templateData?.suggest.sugByGenderPieChartRef ? <div>
            <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, suggest: { ...props.templateData?.suggest, sugByGenderPieChartRef: false } }) }} /> : <></>}</div>
                <div
                  className="total-transaction-container"
                  style={{ flex: "1 auto" }}
                >
                  <LazyChart height={600} forceRender={isPrinting}>
                    {rdsPieGenreSugge ? (
                      <LazyChartWrapper
                        type="pie"
                        chartRef={sugByGenderPieChartRef}
                        // redraw={true}
                        data={rdsPieGenreSugge}
                        visible={rdsPieGenreSugge == null}
                        options={{
                          plugins: {
                            title: {
                              display: true,
                              text: "Répartition des suggestions par genre (%)",
                              position: "top",
                            },
                            legend: {
                              position: "bottom",
                            },
                          },
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <LazyChartSkeleton type="pie" height={600} />
                    )}
                  </LazyChart>
                </div>
              </div>
            </div>
          </div> : <></>}     
          {props.templateData?.suggest.sugByGenderBarChartRef ? <div>
            <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, suggest: { ...props.templateData?.suggest, sugByGenderBarChartRef: false } }) }} /> : <></>}</div>
                <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                  {rdsBarGenreSugge ? (
                    <LazyChartWrapper
                      type="bar"
                      chartRef={sugByGenderBarChartRef}
                      // redraw={true}
                      data={rdsBarGenreSugge}
                      visible={rdsBarGenreSugge == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des suggestions par genre par agence (%)",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        responsive: true,
                        indexAxis: "y",
                        scales: {
                          x: {
                            stacked: true,
                            ticks: {
                              callback: function (value) {
                                return value + "%";
                              },
                            },
                            max: 100,
                            offset: false,
                          },
                          y: {
                            stacked: true,
                          },
                        },
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}    
        </div>
      </div>

      <div className="divider mt-3 mb-3"></div>
    </>
  );

  const claimByGraviteChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">     
          {props.templateData?.claim.claimByGravitePieChartRef ? <div>
            <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByGravitePieChartRef: false } }) }} /> : <></>}</div>
                <div
                  className="total-transaction-container"
                  style={{ flex: "1 auto" }}
                >
                  <LazyChart height={600} forceRender={isPrinting}>
                    {rdsPieGravityClaim ? (
                      <LazyChartWrapper
                        type="pie"
                        chartRef={claimByGravitePieChartRef}
                        // redraw={true}
                        data={rdsPieGravityClaim}
                        visible={rdsPieGravityClaim == null}
                        options={{
                          plugins: {
                            title: {
                              display: true,
                              text: "Répartition des réclamations par niveau de gravité (%)",
                              position: "top",
                            },
                            legend: {
                              position: "bottom",
                            },
                          },
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <LazyChartSkeleton type="pie" height={600} />
                    )}
                  </LazyChart>
                </div>
              </div>
            </div>
          </div> : <></>}      
          {props.templateData?.claim.claimByGraviteBarChartRef ? <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByGraviteBarChartRef: false } }) }} /> : <></>}</div>
                <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                  {rdsBarGravityClaim ? (
                    <LazyChartWrapper
                      type="bar"
                      chartRef={claimByGraviteBarChartRef}
                      // redraw={true}
                      data={rdsBarGravityClaim}
                      visible={rdsBarGravityClaim == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des réclamations par gravité de dépôt par agence (%)",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        responsive: true,
                        indexAxis: "y",
                        scales: {
                          x: {
                            stacked: true,
                            ticks: {
                              callback: function (value) {
                                return value + "%";
                              },
                            },
                            max: 100,
                            offset: false,
                          },
                          y: {
                            stacked: true,
                          },
                        },
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
          </div> : <></>} 
        </div>
      </div>
    </>
  );
  const denunByGraviteChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">     
          {props.templateData?.denun.denunByGravitePieChartRef ? <div>
            <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByGravitePieChartRef: false } }) }} /> : <></>}</div>
                <div className="total-transaction-container" style={{ flex: 1 }}>
                  <LazyChart height={600} forceRender={isPrinting}>
                    {rdsPieGravityDenun ? (
                      <LazyChartWrapper
                        type="pie"
                        chartRef={denunByGravitePieChartRef}
                        // redraw={true}
                        // options={claimByAgencePieChartRef}
                        data={rdsPieGravityDenun}
                        visible={rdsPieGravityDenun == null}
                        options={{
                          plugins: {
                            title: {
                              display: true,
                              text: "Répartition des dénonciations par niveau de gravité (%)",
                              position: "top",
                            },
                            legend: {
                              position: "top",
                            },
                            legend: {
                              position: "bottom",
                            },
                          },
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <LazyChartSkeleton type="pie" height={600} />
                    )}
                  </LazyChart>
                </div>
              </div>
            </div>
          </div> : <></>}      
          {props.templateData?.denun.denunByGraviteBarChartRef ? <div>
            <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByGraviteBarChartRef: false } }) }} /> : <></>}</div>
                <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                  {rdsBarGravityDenun ? (
                    <LazyChartWrapper
                      type="bar"
                      chartRef={denunByGraviteBarChartRef}
                      // redraw={true}
                      data={rdsBarGravityDenun}
                      visible={rdsBarGravityDenun == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition des dénonciations par gravité de dépôt par agence (%)",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        indexAxis: "y",
                        responsive: true,
                        scales: {
                          x: {
                            stacked: true,
                            ticks: {
                              callback: function (value) {
                                return value + "%";
                              },
                            },
                            max: 100,
                            offset: false,
                          },
                          y: {
                            stacked: true,
                          },
                        },
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
        </div>
      </div>
    </>
  );

  const claimBySatisfactionChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">     
          {props.templateData?.claim.claimBySatisfactionPieChartRef ? <div>
            <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimBySatisfactionPieChartRef: false } }) }} /> : <></>}</div>
                <div
                  className="total-transaction-container"
                  style={{ flex: "1 auto" }}
                >
                  <LazyChart height={600} forceRender={isPrinting}>
                    {rdsPieStatisClaim ? (
                    <LazyChartWrapper
                      type="pie"
                      chartRef={claimBySatisfactionPieChartRef}
                      // redraw={true}
                      // options={claimByAgencePieChartRef}
                      data={rdsPieStatisClaim}
                      visible={rdsPieStatisClaim == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Répartition de la satisfaction des réclamants (%)",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                    ) : (
                      <LazyChartSkeleton type="pie" height={600} />
                    )}
                  </LazyChart>
                </div>
              </div>
            </div>
          </div> : <></>}     
          {props.templateData?.claim.tauxMensuelClaimByMonthByAgenceBarChartRef ? <div>
            <div className="col s12 m12 l6 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, tauxMensuelClaimByMonthByAgenceBarChartRef: false } }) }} /> : <></>}</div>
                <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                  {tauxMensuelClaimByMonthByAgence ? (
                    <LazyChartWrapper
                      type="bar"
                      chartRef={tauxMensuelClaimByMonthByAgenceBarChartRef}
                      // redraw={true}
                      data={tauxMensuelClaimByMonthByAgence}
                      visible={tauxMensuelClaimByMonthByAgence == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Taux de satisfaction des Réclamations par agence (%))",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        indexAxis: "y",
                        scales: {
                          x: {
                            stacked: true,
                            ticks: {
                              callback: function (value) {
                                return value + "%";
                              },
                            },
                            max: 100,
                            offset: false,
                          },
                          y: {
                            stacked: true,
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}     
          {props.templateData?.claim.tauxMensuelClaimByMonthBarChartRef ? <div>
            <div className="col s12 m12 l12 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, tauxMensuelClaimByMonthBarChartRef: false } }) }} /> : <></>}</div>
                <div
                  className="total-transaction-container"
                  style={{ flex: "1 auto" }}
                >
                  <LazyChart height={600} forceRender={isPrinting}>
                    {tauxMensuelClaimByMonth ? (
                      <LazyChartWrapper
                        type="bar"
                        chartRef={tauxMensuelClaimByMonthBarChartRef}
                        // redraw={true}
                        data={tauxMensuelClaimByMonth}
                        visible={tauxMensuelClaimByMonth == null}
                        options={{
                          plugins: {
                            title: {
                              display: true,
                              text: "Taux de satisfaction mensuel des Réclamations (%))",
                              position: "top",
                            },
                            legend: {
                              position: "bottom",
                            },
                          },
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <LazyChartSkeleton type="pie" height={600} />
                    )}
                  </LazyChart>
                </div>
              </div>
            </div>
          </div> : <></>}
        </div>
      </div>

      {/* <div className="divider mt-3 mb-3"></div> */}
    </>
  );

  const claimDelaiResolutionChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">     
          {props.templateData?.claim.resolutionClaimDelaiByMonthBarChartRef ? <div>
            <div className="col s12 m12 l12 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, resolutionClaimDelaiByMonthBarChartRef: false } }) }} /> : <></>}</div>
                <div
                  className="total-transaction-container"
                  style={{ flex: "1 auto" }}
                >
                  <LazyChart height={600} forceRender={isPrinting}>
                    {rdsBarDelaiGlobal ? (
                      <LazyChartWrapper
                        type="bar"
                        chartRef={resolutionClaimDelaiByMonthBarChartRef}
                        // redraw={true}
                        data={rdsBarDelaiGlobal}
                        visible={rdsBarDelaiGlobal == null}
                        options={{
                          plugins: {
                            title: {
                              display: true,
                              text: "Respect du délai de résolution des Réclamations par mois (%))",
                              position: "top",
                            },
                            legend: {
                              position: "bottom",
                            },
                          },
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <LazyChartSkeleton type="pie" height={600} />
                    )}
                  </LazyChart>
                </div>
              </div>
            </div>
          </div> : <></>}     
          {props.templateData?.claim.resolutionClaimDelaiByMonthByAgenceBarChartRef ? <div>
            <div className="col s12 m12 l12 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, resolutionClaimDelaiByMonthByAgenceBarChartRef: false } }) }} /> : <></>}</div>
                <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                  {rdsBarDelaiClaimByMonthByAgence ? (
                    <LazyChartWrapper
                      type="bar"
                      chartRef={resolutionClaimDelaiByMonthByAgenceBarChartRef}
                      // redraw={true}
                      data={rdsBarDelaiClaimByMonthByAgence}
                      visible={rdsBarDelaiClaimByMonthByAgence == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Respect du délai de résolution des Réclamations par agence (%))",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        indexAxis: "y",
                        scales: {
                          x: {
                            stacked: true,
                            ticks: {
                              callback: function (value) {
                                return value + "%";
                              },
                            },
                            max: 100,
                            offset: false,
                          },
                          y: {
                            stacked: true,
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
        </div>
      </div>
    </>
  );

  const denunDelaiResolutionChart = (
    <>
      <div className="invoice-product-details">
        <div className="row vertical-modern-dashboard">     
          {props.templateData?.denun.resolutionDenunDelaiByMonthBarChartRef ? <div>
            <div className="col s12 m12 l12 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, resolutionDenunDelaiByMonthBarChartRef: false } }) }} /> : <></>}</div>
                <div
                  className="total-transaction-container"
                  style={{ flex: "1 auto" }}
                >
                  <LazyChart height={600} forceRender={isPrinting}>
                    {denunBarDelaiByMonth ? (
                      <LazyChartWrapper
                        type="bar"
                        chartRef={resolutionDenunDelaiByMonthBarChartRef}
                        // redraw={true}
                        data={denunBarDelaiByMonth}
                        visible={denunBarDelaiByMonth == null}
                        options={{
                          plugins: {
                            title: {
                              display: true,
                              text: "Respect du délai de résolution des Dénonciations par mois (%))",
                              position: "top",
                            },
                            legend: {
                              position: "bottom",
                            },
                          },
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <LazyChartSkeleton type="bar" height={600} />
                    )}
                  </LazyChart>
                </div>
              </div>
            </div>
          </div> : <></>}     
          {props.templateData?.denun.resolutionDenunDelaiByMonthByAgenceBarChartRef ? <div>
            <div className="col s12 m12 l12 animate fadeRight center-align">
              <div
                className="card"
                style={{
                  height: "600px",
                  maxHeight: "600px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{props.tmpState.showForm ? <CloseIcon style={{ cursor: "pointer" }} onClick={(e) => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, resolutionDenunDelaiByMonthByAgenceBarChartRef: false } }) }} /> : <></>}</div>
                <LazyChart overflow={"y"} height={nba} forceRender={isPrinting}>
                  {denunBarDelaiByMonthByAgence ? (
                    <LazyChartWrapper
                      type="bar"
                      chartRef={resolutionDenunDelaiByMonthByAgenceBarChartRef}
                      // redraw={true}
                      data={denunBarDelaiByMonthByAgence}
                      visible={denunBarDelaiByMonthByAgence == null}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Respect du délai de résolution des Dénonciations par agence (%))",
                            position: "top",
                          },
                          legend: {
                            position: "bottom",
                          },
                        },
                        indexAxis: "y",
                        scales: {
                          x: {
                            stacked: true,
                            ticks: {
                              callback: function (value) {
                                return value + "%";
                              },
                            },
                            max: 100,
                            offset: false,
                          },
                          y: {
                            stacked: true,
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <LazyChartSkeleton type="pie" height={600} />
                  )}
                </LazyChart>
              </div>
            </div>
          </div> : <></>}
        </div>
      </div>
    </>
  );




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
              let tableContent = objEntries.map((info) => {
                return (
                  <>
                    <tr key={info[0]}>
                      <td>{info[0]}</td>
                      <td>{info[1]}</td>
                    </tr>
                  </>
                );
              });

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
              let tableContent = objEntries.map((info) => {
                return (
                  <>
                    <tr key={info[0]}>
                      <td>{info[0]}</td>
                      <td>{info[1]}</td>
                    </tr>
                  </>
                );
              });

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
            }
          })}
        </tbody>
      </table>
    );
    return tableClaim;
  };

  const prepareToPrint = async (type = "pdf") => {
    setIsPrinting(true);

    // attendre que React monte les charts
    await new Promise(resolve => setTimeout(resolve, 300));

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
    // console.log(resolutionPieChartRef?.current);
    if (resolutionPieChartRef !== null) {
      var imgSource = resolutionPieChartRef?.current.captureAsImage();

      if (resolutionPieChartRef?.current) {
        // console.error("suc0:", "broo");
        // console.error("suc1:", resolutionPieChartRef?.current.captureAsImage());
        src = await resolutionPieChartRef?.current.captureAsImage();
      }
    }

    const globalPieChartRefData = props.templateData?.global.globalPieChartRef ?
      "<div class=' col s12 m12 l6 center-align' style='width:100%'><img src='" +
      globalPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important'  /></div>" : "";
    const globalLineChartRefData = props.templateData?.global.globalLineChartRef ?
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      globalLineChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important'  /></div>" : "";
    const globalByCanalPieChartRefData = props.templateData?.global.globalByCanalPieChartRef ?
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      globalByCanalPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' /></div>" : "";
    const globalByCanalBarChartRefData = props.templateData?.global.globalByCanalBarChartRef ?
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      globalByCanalBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' /></div>" : "";
    const globalByObjetPieChartRefData = props.templateData?.global.globalByObjetPieChartRef ?
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      globalByObjetPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' /></div>" : "";
    const globalByObjetBarChartRefData = props.templateData?.global.globalByObjetBarChartRef ?
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      globalByObjetBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' /></div>" : "";
    const resolutionPieChartRefData = props.templateData?.global.resolutionPieChartRef ?
      "<div class=' col s12 m12 l12 ' style='width:100%'><center style='margin-bottom:60px!important'>Taux de résolution des plaintes</center> <img src='" +
      src +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' /></div>" : "";
    const resolutionClaimDelaiByMonthBarChartRefData = props.templateData?.claim.resolutionClaimDelaiByMonthBarChartRef ?
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      resolutionClaimDelaiByMonthBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' /></div>" : "";

    const resolutionClaimDelaiByMonthByAgenceBarChartRefData =
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      resolutionClaimDelaiByMonthByAgenceBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' /></div>";


    const evolutionByAgenceByAnneeBarChartRefData =
      "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
      evolutionByAgenceByAnneeBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' /></div>";

    const claimByAgencePieChartRefData = props.templateData?.claim.claimByAgencePieChartRef ?
      "<img src='" +
      claimByAgencePieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const claimByAgenceBarChartRefData = props.templateData?.claim.claimByAgenceBarChartRef ?
      "<img src='" +
      claimByAgenceBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";
    const claimByGenderPieChartRefData = props.templateData?.claim.claimByGenderPieChartRef ?
      "<img src='" +
      claimByGenderPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const claimByGenderBarChartRefData = props.templateData?.claim.claimByGenderBarChartRef ?
      "<img src='" +
      claimByGenderBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";
    const claimByCanalPieChartRefData = props.templateData?.claim.claimByCanalPieChartRef ?
      "<img src='" +
      claimByCanalPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const claimByCanalBarChartRefData = props.templateData?.claim.claimByCanalBarChartRef ?
      "<img src='" +
      claimByCanalBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";
    const claimByObjetPieChartRefData = props.templateData?.claim.claimByObjetPieChartRef ?
      "<img src='" +
      claimByObjetPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const claimByObjetBarChartRefData = props.templateData?.claim.claimByObjetBarChartRef ?
      "<img src='" +
      claimByObjetBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";
    const claimByGravitePieChartRefData = props.templateData?.claim.claimByGravitePieChartRef ?
      "<img src='" +
      claimByGravitePieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const claimByGraviteBarChartRefData = props.templateData?.claim.claimByGraviteBarChartRef ?
      "<img src='" +
      claimByGraviteBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";
    const claimBySatisfactionPieChartRefData = props.templateData?.claim.claimBySatisfactionPieChartRef ?
      "<img src='" +
      claimBySatisfactionPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const tauxMensuelClaimByMonthByAgenceBarChartRefData =
      "<img src='" +
      tauxMensuelClaimByMonthByAgenceBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />";

    const tauxMensuelClaimByMonthBarChartRefData = props.templateData?.claim.tauxMensuelClaimByMonthBarChartRef ?
      "<img src='" +
      tauxMensuelClaimByMonthBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";

    const denunByAgencePieChartRefData = props.templateData?.denun.denunByAgencePieChartRef ?
      "<img src='" +
      denunByAgencePieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const denunByAgenceBarChartRefData = props.templateData?.denun.denunByAgenceBarChartRef ?
      "<img src='" +
      denunByAgenceBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";
    const denunByCanalPieChartRefData = props.templateData?.denun.denunByCanalPieChartRef ?
      "<img src='" +
      denunByCanalPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const denunByCanalBarChartRefData = props.templateData?.denun.denunByCanalBarChartRef ?
      "<img src='" +
      denunByCanalBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";
    const denunByObjetPieChartRefData = props.templateData?.denun.denunByObjetPieChartRef ?
      "<img src='" +
      denunByObjetPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const denunByObjetBarChartRefData = props.templateData?.denun.denunByObjetBarChartRef ?
      "<img src='" +
      denunByObjetBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";


    const resolutionDenunDelaiByMonthBarChartRefData = props.templateData?.denun.resolutionDenunDelaiByMonthBarChartRef ?
      "<img src='" +
      resolutionDenunDelaiByMonthBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";

    const resolutionDenunDelaiByMonthByAgenceBarChartRefData = props.templateData?.denun.resolutionDenunDelaiByMonthByAgenceBarChartRef ?
      "<img src='" +
      resolutionDenunDelaiByMonthByAgenceBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";


    const denunByGravitePieChartRefData = props.templateData?.denun.denunByGravitePieChartRef ?
      "<img src='" +
      denunByGravitePieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const denunByGraviteBarChartRefData = props.templateData?.denun.denunByGraviteBarChartRef ?
      "<img src='" +
      denunByGraviteBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";

    const sugByAgencePieChartRefData = props.templateData?.suggest.sugByAgencePieChartRef ?
      "<img src='" +
      sugByAgencePieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const sugByAgenceBarChartRefData = props.templateData?.suggest.sugByAgenceBarChartRef ?
      "<img src='" +
      sugByAgenceBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";
    const sugByGenderPieChartRefData = props.templateData?.suggest.sugByGenderPieChartRef ?
      "<img src='" +
      sugByGenderPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const sugByGenderBarChartRefData = props.templateData?.suggest.sugByGenderBarChartRef ?
      "<img src='" +
      sugByGenderBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";
    const sugByCanalPieChartRefData = props.templateData?.suggest.sugByCanalPieChartRef ?
      "<img src='" +
      sugByCanalPieChartRef.current.toBase64Image() +
      "' style='width:65% !important;margin-bottom:75px!important;margin-left:100px!important;margin-right:100px!important' />" : "";
    const sugByCanalBarChartRefData = props.templateData?.suggest.sugByCanalBarChartRef ?
      "<img src='" +
      sugByCanalBarChartRef.current.toBase64Image() +
      "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />" : "";

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
          tauxMensuelClaimByMonthByAgenceBarChartRefData +
          tauxMensuelClaimByMonthBarChartRefData +
          resolutionClaimDelaiByMonthBarChartRefData +
          resolutionClaimDelaiByMonthByAgenceBarChartRefData +
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
          resolutionDenunDelaiByMonthBarChartRefData +
          resolutionDenunDelaiByMonthByAgenceBarChartRefData +
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
    // 🔥 ouvrir la fenêtre IMMEDIATEMENT
    const childWindow = window.open("", "modal");

    if (!childWindow) {
      alert("Veuillez autoriser les popups pour l'impression.");
      return;
    }

    const dom = await prepareToPrint(childWindow);

    handlePrintAvance(childWindow, dom);
  };


  // const printToPDF = async () => {
  //   const toStri = await prepareToPrint();
  //   handlePrintAvance(toStri);
  // };

  const [nameReport, setNameReport] = useState("")
  const prepareReportTablesToXLSX = () => {
    let name = today().replaceAll("/", "")
    let filename = `Statistiques_GPR_${name}.xlsx`;

    // table2XLSX(filename, "", 0);
    const dataPrepare = [];

    //PrepareExcel Report Data

    //Institution
    dataPrepare.push({
      sheetName: "Info général",
      sheetColor: "yellow",
      logo: logoInstitution,
      name: institution,
      adresse,
      agrement,
      copyright: "Copyright SICMA et ASSOCIES",
      rows: [
        {
          name: "Rapport Général (RDS)",
          values: [
            { value: "Repartition RDS", sheetLink: "'Repartiton RDS'" },
            { value: "Evolution annuel des RDS", sheetLink: "'Evolution annuel des RDS'" },
            { value: "Modalité dépôt", sheetLink: "'Modalité de dépôt'" },
            { value: "Repartition RDS par objet", sheetLink: "'Repartition RDS par objet'" },
            { value: "Respect délai", sheetLink: "'Respect délai'" },
            // { value: "Respect du délai par agence", sheetLink: "'Info général'" },
            // { value: "Taux de satistaction", sheetLink: "'Info général'" },
            // { value: "Taux de satistaction par agence", sheetLink: "'Info général'" },
          ],
          color: "#002060"
        },
        {
          name: "Rapports Réclamations",
          values: [
            { value: "Statut des réclamations", sheetLink: "'Statut des réclamations'" },
            { value: "Evolution annuelle", sheetLink: "'Evolution Annuelle Satisfaction'" },
            { value: "Modalité dépôt", sheetLink: "'Répart.Réclamation par modalité'" },
            { value: "Repartition par objet", sheetLink: "'Répart.Réclamation par objet'" },
            { value: "Repartition par genre", sheetLink: "'Réclamation par genre'" },
            { value: "Repartition par gravite", sheetLink: "'Répart.Réclamation par gravité'" },
            // { value: "Respect délai", sheetLink: "''" },
            // { value: "Niveaux de satisfaction", sheetLink: "" },
          ],
          color: "#c00000"
        },
        {
          name: "Rapports Dénonciations",
          values: [
            { value: "Statut des dénonciations", sheetLink: "'Status des Dénonciations'" },
            // { value: "Evolution annuelle", sheetLink: "" },
            { value: "Modalité dépôt", sheetLink: "'Répart.Dénonciation_Modalité'" },
            { value: "Repartition par objet", sheetLink: "'Répart.Dénonciation_Objet'" },
            // { value: "Repartition par genre", sheetLink: "''" },
            { value: "Repartition par gravite", sheetLink: "'Répart.Dénonciation par gravité'" },
            // { value: "Respect délai", sheetLink: "" },
            // { value: "Niveaux de satisfaction", sheetLink: "" },
          ],
          color: "#e97132"
        },
        {
          name: "Rapports Suggestions",
          values: [
            { value: "Statut des suggestions", sheetLink: "'Status des Suggestions'" },
            { value: "Modalité dépôt", sheetLink: "'Répart.Suggestions par modalité'" },
            // { value: "Repartition par objet", sheetLink: "" },
            { value: "Repartition par genre", sheetLink: "'Suggestions par genre'" }
          ],
          color: "#4ea72e"
        },
      ],
    });

    //Global
    //1er Sheet 
    dataPrepare.push({
      sheetName: "Repartiton RDS",
      sheetColor: "#002060",
      doubleCharts: false,
      chartInfo: [{ type: "Pie", title: "Répartition des réclamations, dénonciations, suggestions", tablePosition: 0 }],
      tables: [{ title: "", data: rdsPieGlobal }],
    })

    //2em Sheet
    dataPrepare.push({
      sheetName: "Evolution annuel des RDS",
      sheetColor: "#002060",
      doubleCharts: false,
      chartInfo: [{ type: "Bar", title: "Glissement annuel", tablePosition: 0 }],
      tables: [{ title: "", data: rdsBarGlobal }],
    })


    //3em Sheet
    dataPrepare.push({
      sheetName: "Modalité de dépôt",
      sheetColor: "#002060",
      doubleCharts: true,
      chartInfo: [{ type: "Pie", title: "Répartition des réclamations, dénonciations, suggestions par modalité de dépôt (%)", tablePosition: 0 }, { type: "Chart", title: "Répartition des RSD par modalité de dépôt et par  agences en %", tablePosition: 2 }],
      tables: [{ title: "", data: rdsPieModaliteGlobal }, { title: "Nombre de RDS par agence", data: dataRaport.newVersionStat["GeneralPerAgence"]["RSDModalite"] ?? [] }, { title: "Répartition des RSD par modalité de dépôt par agence", data: rdsBarModaliteGlobal }],
    })

    //4em Sheet
    dataPrepare.push({
      sheetName: "Repartition RDS par objet",
      sheetColor: "#002060",
      doubleCharts: true,
      chartInfo: [{ type: "Pie", title: "Répartition des réclamations, dénonciations, suggestions par objet (10 plus importants, le reste dans autres)", tablePosition: 0 }, { type: "Chart", title: "Répartition des Réclamations et Dénonciations par objets par agence", tablePosition: 2 }],
      tables: [{ title: "", data: rdsPieObjetGlobal }, { title: "Nombre de RDS par agence", data: dataRaport.newVersionStat["GeneralPerAgence"]["RSDObjet"] ?? [] }, { title: "Répartition des RSD par objet par agence", data: rdsBarObjetGlobal }],
    })

    //5em Sheet
    dataPrepare.push({
      sheetName: "Respect délai",
      sheetColor: "#002060",
      doubleCharts: true,
      chartInfo: [{ type: "Bar", title: "Délai de résolution des RDS par mois (en %)", tablePosition: 1 }],
      tables: [{ title: "", data: rdsBarDelaiGlobal }],
    })
    //End Global

    // Claims

    //6e Sheet
    dataPrepare.push({
      sheetName: "Status des réclamations",
      sheetColor: "#c00000",
      doubleCharts: true,
      chartInfo: [{ type: "Bar", title: "Réclamations classées par statuts de traitement", tablePosition: 1 }],
      tables: [{ title: "", data: dataRaport.claimReport["basicStats"] }],
    })

    //7em Sheet
    dataPrepare.push({
      sheetName: "Répart.Réclamation par modalité",
      sheetColor: "#c00000",
      doubleCharts: true,
      chartInfo: [{ type: "Pie", title: "Répartition des réclamations par modalité de dépôt (%)", tablePosition: 0 }, { type: "Chart", title: "Répartition des Réclamations par modalité de dépôt et par  agences en % ", tablePosition: 2 }],
      tables: [{ title: "", data: rdsPieModaliteClaim }, { title: "Nombre de Réclamations par agence", data: dataRaport.newVersionStat["AgencePerModalite"]["claims"] ?? [] }, { title: "Répartition des Réclamations par modalité de dépôt par agence", data: rdsBarModaliteClaim }],
    })
    //8em Sheet
    dataPrepare.push({
      sheetName: "Répart.Réclamation par objet",
      sheetColor: "#c00000",
      doubleCharts: true,
      chartInfo: [{ type: "Pie", title: "Répartition des réclamations par objet", tablePosition: 0 }, { type: "Chart", title: "Répartition des Réclamations par objet et par  agences en % ", tablePosition: 2 }],
      tables: [{ title: "", data: rdsPieObjetClaim }, { title: "Nombre de Réclamations par agence", data: dataRaport.newVersionStat["AgencePerObjet"]["claims"] ?? [] }, { title: "Répartition des Réclamations par objet par agence", data: rdsBarObjetClaim }],
    })

    //9em Sheet
    dataPrepare.push({
      sheetName: "Réclamation par genre",
      sheetColor: "#c00000",
      doubleCharts: true,
      chartInfo: [{ type: "Pie", title: "Répartition des réclamations par genre (%)", tablePosition: 0 }, { type: "Chart", title: "Répartition des Réclamations par genre et par agences en %  ", tablePosition: 2 }],
      tables: [{ title: "", data: rdsPieGenreClaim }, { title: "Nombre de Réclamations par agence", data: dataRaport.newVersionStat["AgencePerGenre"]["claims"] ?? [] }, { title: "Répartition des Réclamations par genre par agence", data: rdsBarGenreClaim }],
    })

    //10em Sheet
    dataPrepare.push({
      sheetName: "Répart.Réclamation par gravité",
      sheetColor: "#c00000",
      doubleCharts: true,
      chartInfo: [{ type: "Pie", title: "Répartition des réclamations par gravité de dépôt (%)", tablePosition: 0 }, { type: "Chart", title: "Répartition des Réclamations par gravité et par agences en %", tablePosition: 2 }],
      tables: [{ title: "", data: rdsPieGravityClaim }, { title: "Nombre de Réclamations par agence", data: dataRaport.newVersionStat["AgencePerGravity"]["claims"] ?? [] }, { title: "Répartition des Réclamations par gravité par agence", data: rdsBarGravityClaim }],
    })

    //11em Sheet
    dataPrepare.push({
      sheetName: "Répart.Satisfaction_Réclamants",
      sheetColor: "#c00000",
      doubleCharts: true,
      chartInfo: [{ type: "Pie", title: "Répartition des niveaux de satisfactions par traitement de réclamations (%)", tablePosition: 0 }, { type: "Chart", title: "Répartition des niveaux de satisfactions du traitement des réclamations et par agences en %", tablePosition: 2 }],
      tables: [{ title: "", data: rdsPieStatisClaim }, { title: "Nombre du niveau de satisfaction obtenus par traitement et par agence", data: dataRaport.newVersionStat["AgencePerMesure"]["claims"] ?? [] }, { title: "Répartition des niveaux de satisfaction des réclamants par agence", data: rdsBarStatisClaim }],
    })
    //12em Sheet
    dataPrepare.push({
      sheetName: "Evolution Annuelle Satisfaction",
      sheetColor: "#c00000",
      doubleCharts: true,
      chartInfo: [{ type: "Bar", title: "Evolution annuelle de la satisfaction des réclamants", tablePosition: 0 },],
      tables: [{ title: "", data: rdsChartStatisClaim }],
    })

    //End Claims

    //Denonciations

    //13e Sheet
    dataPrepare.push({
      sheetName: "Status des Dénonciations",
      sheetColor: "#c00000",
      doubleCharts: true,
      chartInfo: [{ type: "Bar", title: "Dénonciations classées par statuts de traitement", tablePosition: 1 }],
      tables: [{ title: "", data: dataRaport.denunReport["basicStats"] }],
    })

    //14em Sheet
    dataPrepare.push({
      sheetName: "Répart.Dénonciation_Modalité",
      sheetColor: "#c00000",
      doubleCharts: true,
      chartInfo: [{ type: "Pie", title: "Répartition des dénonciations par modalité de dépôt (%)", tablePosition: 0 }, { type: "Chart", title: "Répartition des Dénonciations par modalité de dépôt et par agences en % ", tablePosition: 2 }],
      tables: [{ title: "", data: rdsPieModaliteDenun }, { title: "Nombre de Dénonciation par agence", data: dataRaport.newVersionStat["AgencePerModalite"]["denonciations"] ?? [] }, { title: "Répartition des Dénonciations par modalité de dépôt par agence", data: rdsBarModaliteDenun }],
    })

    //15em Sheet
    dataPrepare.push({
      sheetName: "Répart.Dénonciation_Objet",
      sheetColor: "#c00000",
      doubleCharts: true,
      chartInfo: [{ type: "Pie", title: "Répartition des dénonciations par objet", tablePosition: 0 }, { type: "Chart", title: "Répartition des Dénonciations par objet et par agences en %", tablePosition: 2 }],
      tables: [{ title: "", data: rdsPieObjetDenun }, { title: "Nombre de Dénonciations par agence", data: dataRaport.newVersionStat["AgencePerObjet"]["denonciations"] ?? [] }, { title: "Répartition des Dénonciations par objet par agence", data: rdsBarObjetDenun }],
    })


    //16em Sheet
    dataPrepare.push({
      sheetName: "Répart.Dénonciation par gravité",
      sheetColor: "#c00000",
      doubleCharts: true,
      chartInfo: [{ type: "Pie", title: "Répartition des dénonciations par gravité de dépôt (%)", tablePosition: 0 }, { type: "Chart", title: "Répartition des Dénonciations par gravité et par agences en %", tablePosition: 2 }],
      tables: [{ title: "", data: rdsPieGravityDenun }, { title: "Nombre de Dénonciations par agence", data: dataRaport.newVersionStat["AgencePerGravity"]["denonciations"] ?? [] }, { title: "Répartition des Dénonciation par gravité par agence", data: rdsBarGravityDenun }],
    })

    //End Denonciations

    //Suuggestion

    //17e Sheets
    dataPrepare.push({
      sheetName: "Status des Suggestions",
      sheetColor: "#4ea72e",
      doubleCharts: true,
      chartInfo: [{ type: "Bar", title: "Suggestions classées par statuts de traitement", tablePosition: 1 }],
      tables: [{ title: "", data: dataRaport.suggestionReport["basicStats"] }],
    })

    //18em Sheet
    dataPrepare.push({
      sheetName: "Répart.Suggestions par modalité",
      sheetColor: "#4ea72e",
      doubleCharts: true,
      chartInfo: [{ type: "Pie", title: "Répartition des suggestions par modalité de dépôt (%)", tablePosition: 0 }, { type: "Chart", title: "Répartition des suggestions par modalité de dépôt et par agences en % ", tablePosition: 2 }],
      tables: [{ title: "", data: rdsPieModaliteSugge }, { title: "Nombre de Suggestion par agence", data: dataRaport.newVersionStat["AgencePerModalite"]["suggestions"] ?? [] }, { title: "Répartition des suggestions par modalité de dépôt par agence", data: rdsBarModaliteSugge }],
    })

    //19em Sheet
    //  dataPrepare.push({
    //   sheetName:"Répart.Suggestions par objet",
    //   sheetColor:"#c00000",
    //   doubleCharts:true,
    //   chartInfo:[{type:"Pie",title:"Répartition des suggestions par objet",tablePosition:0},{type:"Chart",title:"Répartition des Suggestions par objet et par agences en %",tablePosition:2}],
    //   tables:[{title:"",data:rdsPieObjetDenun},{title:"Nombre de Dénonciations par agence",data:dataRaport.newVersionStat["AgencePerObjet"]["denonciations"] ?? []},{title:"Répartition des Suggestions par objet par agence",data:rdsBarObjet}],
    // })

    //19em Sheet
    dataPrepare.push({
      sheetName: "Suggestions par genre",
      sheetColor: "#4ea72e",
      doubleCharts: true,
      chartInfo: [{ type: "Pie", title: "Répartition des suggestions par genre (%)", tablePosition: 0 }, { type: "Chart", title: "Répartition des Suggestions par genre et par agences en %  ", tablePosition: 2 }],
      tables: [{ title: "", data: rdsPieGenreSugge }, { title: "Nombre de Suggestions par agence", data: dataRaport.newVersionStat["AgencePerGenre"]["suggestions"] ?? [] }, { title: "Répartition des Suggestions par genre par agence", data: rdsBarGenreSugge }],
    })

    const generateName = generateString(10)

    dataPrepare.push(generateName)



    if (dataPrepare.length) {
      reportNewVersionExport(filename, generateName, dataPrepare);
    } else {
      notify("Imspossible d'exporter,Ressayez", "error");
    }
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
                    Type de Plainte
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
              right: 50,
              zIndex: 526,
              display: "block",
              width: "fit-content",
            }}
          >
            <div
              onClick={() => {
                setshowSearch(true);
                setOpen(true);
              }}
              style={{
                padding: "10px",
                borderRadius: "80px",
                backgroundColor: "#ff0000",
                width: "fit-content",
                cursor: "pointer",
                margin: "10px 0px",
              }}
            >
              <Tooltip title="Appliquer des filtres" placement="left-start">
                <img
                  src={FILTER_IMG}
                  alt="Generer"
                  style={{ width: "30px", height: "24px" }}
                />
              </Tooltip>
            </div>
            <div
              onClick={() => {
                printToPDF();
              }}
              style={{
                padding: "14px 16px",
                borderRadius: "80px",
                backgroundColor: "#ffebee",
                width: "fit-content",
                cursor: "pointer",
                margin: "10px 0px",
              }}
            >
              <Tooltip title="Exporter en PDF" placement="left-start">
                <img
                  src={PDF_IMG}
                  alt="Generer"
                  style={{ width: "20px", height: "20px" }}
                />
              </Tooltip>
            </div>
            <div
              onClick={() => {
                prepareReportTablesToXLSX();
              }}
              style={{
                padding: "14px 16px",
                borderRadius: "80px",
                backgroundColor: "#e8f5e9",
                width: "fit-content",
                cursor: "pointer",
                margin: "10px 0px",
              }}
            >
              <Tooltip title="Exporter en Excel" placement="left-start">
                <img
                  src={EXCEL_IMG}
                  alt="Generer"
                  style={{ width: "20px", height: "20px" }}
                />
              </Tooltip>
            </div>
            <div
              onClick={() => {
                printToWord();
              }}
              style={{
                padding: "14px 16px",
                borderRadius: "80px",
                backgroundColor: "#e8eaf6",
                width: "fit-content",
                cursor: "pointer",
                margin: "10px 0px",
              }}
            >
              <Tooltip title="Exporter en Word" placement="left-start">
                <img
                  src={WORD_IMG}
                  alt="Generer"
                  style={{ width: "20px", height: "20px" }}
                />
              </Tooltip>
            </div>
          </div>
          <ReportTemplate />

          <div className="col l12 s12 m12">
            <div className="container">
              <section
                className="tabs-vertical mt1 section card-panel pt-2 pl-1"
                id="rapportAvance"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    margin: "5px",
                  }}
                  id="enteteRapport"
                >
                  <div style={{ display: "flex" }}>
                    <img
                      src={logoInstitution}
                      alt="logo"
                      style={{
                        // width: "90px",
                        height: "90px",
                      }}
                      className={" report-logo"}
                    />

                    <div className="col ">
                      <b>{institution}</b>
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
                        <span>Emai: </span>
                        {email}
                      </i>
                    </div>
                  </div>
                  <i style={{ marginRight: "10px" }}>
                    Générer le {" "}
                    {new Date().toLocaleDateString("fr-FR", {
                      day: "numeric",
                      year: "numeric",
                      month: "long",
                    })}
                  </i>
                </div>
                <div
                  className="row"
                  style={{ marginTop: "20px" }}
                  id="titleRapport"
                >
                  <div className="col s12 l12 m12 center">
                    <span style={{ color: "#015182", fontSize: "25px" }}>
                      Rapport de la gestion des plaintes ou réclamations
                    </span>
                  </div>
                </div>
                <div
                  className="row"
                  style={{ marginTop: "20px" }}
                  id="critereRapport"
                >
                  <div className="col l12">

                    <ul style={{ paddingLeft: "15px" }}>

                      <li>
                        <b>
                          Générer par: {userAuth.firstAndLastName}
                        </b>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* { <div
                  className="row"
                  style={{ marginTop: "20px" }}
                  id="critereRapport"
                >
                  <div className="col l12">
                    <ul>
                      <li>
                        <b style={{ fontSize: "15px" }}>Critères:</b>
                      </li>
                    </ul>
                    <ul style={{ paddingLeft: "15px" }}>
                      <li>
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
                                    ? " Satisfaire,"
                                    : etat == "nonsatisfaire"
                                    ? " Non satisfaire,"
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
                      </li>
                     
                    </ul>
                  </div>
                </div> } */}

                {globalShow && (
                  <>                
                    <div className="row">
                      <div className="col l12">
                        {(hasFalseInSection("global") && props.tmpState.showForm) ? <div style={{ color: "darkred" }} onClick={(e) => { restoreSection("global") }} >Restaurer les stats globales</div> : <></>}
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
                  </>
                )}

                {claimShow && (
                  <>
                    <div className="row">
                      <div className="col l12">
                        {(hasFalseInSection("claim") && props.tmpState.showForm) ? <div style={{ color: "darkred" }} onClick={(e) => { restoreSection("claim") }} >Restaurer les stats des réclamations</div> : <></>}

                      </div>
                    </div>
                    <div className="row mt-2" id="titleClaim">
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
                      className="row mt-4 pl-2 mb-2 center"
                      id="dashClaimRapport"
                    >
                      {claimShow ? claimDashboard() : ""}
                    </div>

                    {props.claimReport && props.claimReport.length !== 0 ? (
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
                                className="col l12 s12 m12"
                                id="titleObjetsEtats"
                              >
                                <span
                                  style={{
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Statistiques du délai de résolution des réclamations
                                </span>
                                <br />
                              </div>

                              <div className="col l12 s12 m12">
                                {claimDelaiResolutionChart}
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
                    <div className="row">
                      <div className="col l12">
                        {(hasFalseInSection("denun") && props.tmpState.showForm) ? <div style={{ color: "darkred" }} onClick={(e) => { restoreSection("denun") }} >Restaurer les stats des dénonciations</div> : <></>}

                      </div>
                    </div>
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
                    {props.denunReport && props.denunReport.length != 0 ? (
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
                              Statistiques du délai de résolution des dénonciations
                            </span>
                            <br />
                            <div className="col l12 s12 m12">
                              {denunDelaiResolutionChart}
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
                    <div className="row">
                      <div className="col l12">
                        {(hasFalseInSection("suggest") && props.tmpState.showForm) ? <div style={{ color: "darkred" }} onClick={(e) => { restoreSection("suggest") }} >Restaurer les stats des suggestions</div> : <></>}

                      </div>
                    </div>
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
                    {props.sugReport && props.sugReport.length !== 0 ? (
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
    tmpState: state.templates,
    templateData: state.templates.current_valeurs,
    // basicStat: state.report.basicStat,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setTmpState: (data) => {
      dispatch(tmpActions.stateChanged(data));
    },
    setTemplateData: (data) => {
      dispatch(tmpActions.currentChanged(data));
    },
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

    denunReportChanged: (denunReport) => {
      dispatch(denunReportChanged(denunReport));
    },
    sugReportChanged: (sugReport) => {
      dispatch(sugReportChanged(sugReport));
    },
    statChanged: (stat) => {
      dispatch(statChanged(stat));
    },


    // basicStatChanged: (basicStat) => {
    //   dispatch(basicStatChanged(basicStat));
    // },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Global);
