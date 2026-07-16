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
  DialogTitle,
  DialogActions,
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

/* ── Power BI global chart defaults ── */
Chart.defaults.font.family = "'Segoe UI', system-ui, -apple-system, sans-serif";
Chart.defaults.font.size   = 11;
Chart.defaults.color       = "#6B7280";

Chart.defaults.plugins.legend.labels.boxWidth     = 12;
Chart.defaults.plugins.legend.labels.padding       = 16;
Chart.defaults.plugins.legend.labels.usePointStyle = true;

Chart.defaults.plugins.tooltip.backgroundColor = "#1E293B";
Chart.defaults.plugins.tooltip.titleFont        = { size: 12, weight: "bold" };
Chart.defaults.plugins.tooltip.bodyFont         = { size: 11 };
Chart.defaults.plugins.tooltip.padding          = 10;
Chart.defaults.plugins.tooltip.cornerRadius     = 6;

Chart.defaults.scale.grid.color       = "#F1F5F9";
Chart.defaults.scale.grid.drawBorder  = false;
Chart.defaults.scale.ticks.color      = "#9CA3AF";
Chart.defaults.scale.ticks.font       = { size: 10 };


const styles = {
  control: (base) => ({
    ...base,
    height: 35,
    minHeight: 35,
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
};

const filterSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: 10,
    borderColor: state.isFocused ? "#0F4C81" : "#CBD5E1",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(15,76,129,0.08)" : "none",
    fontSize: 13,
    minHeight: 38,
    cursor: "pointer",
    "&:hover": { borderColor: "#94A3B8" },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
    border: "1px solid #F1F5F9",
  }),
  menuList: (base) => ({ ...base, borderRadius: 10, padding: 4 }),
  option: (base, state) => ({
    ...base,
    fontSize: 13,
    borderRadius: 8,
    backgroundColor: state.isSelected ? "#0F4C81" : state.isFocused ? "#EFF6FF" : "white",
    color: state.isSelected ? "white" : "#374151",
    fontWeight: state.isSelected ? 600 : 400,
    cursor: "pointer",
  }),
  placeholder: (base) => ({ ...base, color: "#94A3B8", fontSize: 13 }),
  singleValue: (base) => ({ ...base, fontSize: 13, color: "#0F172A" }),
  multiValue: (base) => ({ ...base, backgroundColor: "#EFF6FF", borderRadius: 6 }),
  multiValueLabel: (base) => ({ ...base, color: "#1D4ED8", fontSize: 12, fontWeight: 600 }),
  multiValueRemove: (base) => ({
    ...base, color: "#1D4ED8", borderRadius: "0 6px 6px 0",
    "&:hover": { backgroundColor: "#BFDBFE", color: "#1E40AF" },
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 10px" }),
};

const filterLabelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#64748B",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 6,
};

const DateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <input
    ref={ref}
    value={value}
    onClick={onClick}
    readOnly
    placeholder={placeholder || "jj/mm/aaaa"}
    style={{
      width: "100%", padding: "9px 12px", borderRadius: 10,
      border: "1.5px solid #CBD5E1", fontSize: 13, color: "#0F172A",
      background: "#fff", cursor: "pointer", outline: "none",
      boxSizing: "border-box",
    }}
  />
));

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
  const [highlightExport, setHighlightExport] = useState(false);
  const [exportLoading, setExportLoading] = useState(null); // "PDF" | "Word" | "Excel" | null
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

  const pageTopRef = useRef(null);
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
  const [activeTab, setActiveTab] = useState(0);

  // console.log("taille ps:",rdsBarModaliteGlobal?.datasets[0]?.data?.length)
  // const nba = unit.length === 0 ? ((ps.length)*100)+"px" : ((unit.length)*100)+"px" ;
  let nba = ((rdsBarModaliteGlobal?.datasets[0]?.data?.length) * 100);
  nba = (parseInt(nba) < 600) ? 600 + "px" : parseInt(nba) + "px";

  // Hauteur dynamique basée sur le nombre de labels d'un dataset donné
  const chartHeight = (data) => {
    const count = data?.labels?.length ?? data?.datasets?.[0]?.data?.length ?? 6;
    const h = count * 70;
    return (h < 600 ? 600 : h) + "px";
  };
  // console.log("nba : ",nba)

  const delaiFunction = (data) => {
    const result = {
      labels: data.labels,
      datasets: [
        {
          label: "Délai respecté",
          backgroundColor: "#01B8AA",
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

        let evolutionData = oldreport?.global["evolutionObjByYearAndAgence"];

        if (evolutionData?.datasets?.length > 0 && evolutionData?.labels?.length > 0) {
          let combined = evolutionData.labels.map((label, index) => {
            return { label: label, data: evolutionData.datasets[0].data[index] };
          });
          combined.sort((a, b) => b.data - a.data);
          let sortedLabels = combined.map(item => item.label);
          let sortedData = combined.map(item => item.data);
          setRdsBarAgenceGlobal({
            labels: sortedLabels,
            datasets: [
              {
                label: evolutionData.datasets[0].label,
                data: sortedData,
                backgroundColor: "#118DFF",
                borderColor: "#0A6EDD",
                borderWidth: 1,
              },
            ],
          });
        } else {
          setRdsBarAgenceGlobal({ labels: [], datasets: [] });
        }


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
        backgroundColor: "#8A9EBB",
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
      const hasClaim = plainteType.includes("claim");
      const hasDenun = plainteType.includes("denunciation");
      const hasSug   = plainteType.includes("suggestion");
      setClaimShow(hasClaim);
      setDenunciationShow(hasDenun);
      setSuggestionShow(hasSug);
      setGlobalShow(false);

      // Activer l'onglet correspondant si un seul type est sélectionné
      if (hasClaim && !hasDenun && !hasSug)       setActiveTab(1);
      else if (!hasClaim && hasDenun && !hasSug)  setActiveTab(2);
      else if (!hasClaim && !hasDenun && hasSug)  setActiveTab(3);
      else                                         setActiveTab(0);
    } else {
      setDenunciationShow(true);
      setClaimShow(true);
      setSuggestionShow(true);
      setGlobalShow(true);
      setActiveTab(0);
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
    filtres["savedBy"] = recoredBy;
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
    const s = props.claimReport?.basicStats?.statusAndValue ?? {};
    const total = props.claimReport?.basicStats?.total ?? 0;
    const statuses = [
      { label: "À traiter",              value: s.SAVED,             color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
      { label: "Affectée",               value: s.AFFECTED,          color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
      { label: "Désapprouvée",           value: s.DESAPPROUVED,      color: "#F97316", bg: "#FFF7ED", border: "#FED7AA" },
      { label: "Traitée",                value: s.TREAT,             color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
      { label: "Satisfait",              value: s.SATISFIED,         color: "#059669", bg: "#F0FDF4", border: "#86EFAC" },
      { label: "Partiellement satisfait",value: s.PARTIAL_SATISFIED, color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
      { label: "Non satisfait",          value: s.UNSATISFIED,       color: "#EF4444", bg: "#FEF2F2", border: "#FECACA" },
      { label: "Contentieux",            value: s.LITIGATION,        color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
      { label: "Classée",                value: s.CLASSED,           color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
    ];
    return (
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#3B82F6" }}>{total}</span>
          <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>réclamation{total > 1 ? "s" : ""} au total</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {statuses.map(({ label, value, color, bg, border }) => (
            <div key={label} style={{ flex: "1 1 130px", minWidth: 110, background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color }}>{value ?? 0}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color, opacity: 0.8, lineHeight: 1.3 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const suggestionDashboard = () => {
    const s = props.sugReport?.basicStats?.statusAndValue ?? {};
    const total = props.sugReport?.basicStats?.total ?? 0;
    const statuses = [
      { label: "À traiter",        value: s.SAVED,       color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
      { label: "Pris en compte",   value: s.ACCEPTED,    color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
      { label: "Non pris en compte", value: s.UNACCEPTED, color: "#EF4444", bg: "#FEF2F2", border: "#FECACA" },
    ];
    return (
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#10B981" }}>{total}</span>
          <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>suggestion{total > 1 ? "s" : ""} au total</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {statuses.map(({ label, value, color, bg, border }) => (
            <div key={label} style={{ flex: "1 1 150px", minWidth: 130, background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color }}>{value ?? 0}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color, opacity: 0.8, lineHeight: 1.3 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
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
    const s = props.denunReport?.basicStats?.statusAndValue ?? {};
    const total = props.denunReport?.basicStats?.total ?? 0;
    const statuses = [
      { label: "À traiter", value: s.SAVED,    color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
      { label: "Affectée",  value: s.AFFECTED, color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
      { label: "Traitée",   value: s.TREAT,    color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
    ];
    return (
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B" }}>{total}</span>
          <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>dénonciation{total > 1 ? "s" : ""} au total</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {statuses.map(({ label, value, color, bg, border }) => (
            <div key={label} style={{ flex: "1 1 150px", minWidth: 130, background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color }}>{value ?? 0}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color, opacity: 0.8, lineHeight: 1.3 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  // Fin dashboard Affichage

  /* ── Power BI Chart Card ── */
  const PBICard = ({ title, children, accent = "#118DFF", half = false, onClose }) => (
    <div style={{
      background: "#fff",
      borderRadius: 8,
      border: "1px solid #E9ECF1",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      marginBottom: 16,
      ...(half ? { width: "calc(50% - 8px)", minWidth: 280 } : { width: "100%" }),
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `3px solid ${accent}`, background: "#FAFBFC" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", letterSpacing: "0.2px", textTransform: "uppercase" }}>{title}</span>
        {onClose && <span onClick={onClose} style={{ cursor: "pointer", fontSize: 14, color: "#9CA3AF", lineHeight: 1 }}>✕</span>}
      </div>
      <div style={{ padding: "16px 18px 12px", flex: 1 }}>{children}</div>
    </div>
  );

  /* ── Power BI base chart options ── */
  const pbiOptions = (title, extra = {}) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: false },
      legend: {
        position: "bottom",
        labels: {
          font: { size: 11, family: "'Segoe UI', system-ui, sans-serif" },
          color: "#6B7280",
          padding: 16,
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "#1E293B",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(0,0,0,0)", drawBorder: false },
        ticks: { font: { size: 10, family: "'Segoe UI', system-ui, sans-serif" }, color: "#9CA3AF" },
      },
      y: {
        grid: { color: "#F3F4F6", drawBorder: false },
        ticks: { font: { size: 10, family: "'Segoe UI', system-ui, sans-serif" }, color: "#9CA3AF" },
      },
    },
    ...extra,
  });

  const pbiPieOptions = (extra = {}) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: false },
      legend: {
        position: "bottom",
        labels: {
          font: { size: 11, family: "'Segoe UI', system-ui, sans-serif" },
          color: "#6B7280",
          padding: 14,
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "#1E293B",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 6,
      },
    },
    ...extra,
  });

  //Graphiques
  const reportGlobalChart = (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {props.templateData?.global.globalPieChartRef ? (
          <PBICard title="Répartition des réclamations, dénonciations et suggestions (%)" accent="#118DFF" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, globalPieChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsPieGlobal ? (
                <LazyChartWrapper
                  type="pie"
                  data={rdsPieGlobal}
                  visible={rdsPieGlobal == null}
                  options={pbiPieOptions()}
                  chartRef={globalPieChartRef}
                />
              ) : (
                <LazyChartSkeleton type="pie" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
        {props.templateData?.global.globalLineChartRef ? (
          <PBICard title="Glissement annuel des RSD" accent="#118DFF" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, globalLineChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsBarGlobal ? (
                <LazyChartWrapper
                  type="bar"
                  data={rdsBarGlobal}
                  visible={rdsBarGlobal == null}
                  options={pbiOptions("")}
                  chartRef={globalLineChartRef}
                />
              ) : (
                <LazyChartSkeleton type="bar" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
      </div>
    </>
  );

  const reportGlobalByCanalChart = (
    <>
      {props.templateData?.global.globalByCanalPieChartRef ? (
        <PBICard title="Répartition des réclamations, dénonciations, suggestions par modalité de dépôt (%)" accent="#118DFF" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, globalByCanalPieChartRef: false } }) } : undefined}>
          <LazyChart height={520} forceRender={isPrinting}>
            {rdsPieModaliteGlobal ? (
              <LazyChartWrapper
                type="pie"
                chartRef={globalByCanalPieChartRef}
                data={rdsPieModaliteGlobal}
                visible={rdsPieModaliteGlobal == null}
                options={pbiPieOptions()}
              />
            ) : (
              <LazyChartSkeleton type="pie" height={520} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
      {props.templateData?.global.globalByCanalBarChartRef ? (
        <PBICard title="Répartition des RSD par modalité de dépôt et par agence (%)" accent="#118DFF" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, globalByCanalBarChartRef: false } }) } : undefined}>
          <LazyChart overflow={"y"} height={chartHeight(rdsBarModaliteGlobal)} forceRender={isPrinting}>
            {rdsBarModaliteGlobal ? (
              <LazyChartWrapper
                type="bar"
                chartRef={globalByCanalBarChartRef}
                data={rdsBarModaliteGlobal}
                visible={rdsBarModaliteGlobal == null}
                options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, min: 0, max: 100, offset: false } } })}
              />
            ) : (
              <LazyChartSkeleton type="bar" height={1200} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
    </>
  );

  const reportGlobalByObjetChart = (
    <>
      {props.templateData?.global.globalByObjetPieChartRef ? (
        <PBICard title="Répartition des réclamations, dénonciations par objets (%)" accent="#118DFF" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, globalByObjetPieChartRef: false } }) } : undefined}>
          <LazyChart height={520} forceRender={isPrinting}>
            {rdsPieObjetGlobal ? (
              <LazyChartWrapper
                type="pie"
                data={rdsPieObjetGlobal}
                visible={rdsPieObjetGlobal == null}
                options={pbiPieOptions()}
                chartRef={globalByObjetPieChartRef}
              />
            ) : (
              <LazyChartSkeleton type="pie" height={520} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
      {props.templateData?.global.globalByObjetBarChartRef ? (
        <PBICard title="Répartition des Réclamations et Dénonciations par objets et par agence (%)" accent="#118DFF" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, globalByObjetBarChartRef: false } }) } : undefined}>
          <LazyChart overflow={"y"} height={chartHeight(rdsBarObjetGlobal)} forceRender={isPrinting}>
            {rdsBarObjetGlobal ? (
              <LazyChartWrapper
                type="bar"
                data={rdsBarObjetGlobal}
                visible={rdsBarObjetGlobal == null}
                options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false } } })}
                chartRef={globalByObjetBarChartRef}
              />
            ) : (
              <LazyChartSkeleton type="bar" height={1200} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
    </>
  );

  const reportMixteChart = (
    <>
      {props.templateData?.global.resolutionPieChartRef ? (
        <PBICard title="Taux de résolution des plaintes" accent="#118DFF" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, resolutionPieChartRef: false } }) } : undefined}>
          <MyGaugeChart
            global_trend={parseFloat(props.global_trend?.tauxResolution)}
            colors={["#EA4228", "#F5CD19", "#5BE12C"]}
            ref={resolutionPieChartRef}
          />
        </PBICard>
      ) : <></>}

      {props.templateData?.global.evolutionByAgenceByAnneeBarChartRef ? (
        <PBICard title="Evolution annuelle des réclamations, dénonciations, suggestions par agence" accent="#118DFF" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, global: { ...props.templateData?.global, evolutionByAgenceByAnneeBarChartRef: false } }) } : undefined}>
          <LazyChart overflow={"x"} height={chartHeight(rdsBarAgenceGlobal)} forceRender={isPrinting}>
            {rdsBarAgenceGlobal ? (
              <LazyChartWrapper
                type="bar"
                data={rdsBarAgenceGlobal}
                visible={rdsBarAgenceGlobal == null}
                options={pbiOptions("", { scales: { x: { grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: function (value) { let text = this.getLabelForValue(value); return text.length > 6 ? text.substring(0, 5) + "..." : text; } } }, y: { grid: { color: "#F3F4F6" } } } })}
                chartRef={evolutionByAgenceByAnneeBarChartRef}
              />
            ) : (
              <LazyChartSkeleton type="bar" height={600} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
    </>
  ); 

  const claimByAgenceChart = (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {props.templateData?.claim.claimByAgencePieChartRef ? (
          <PBICard title="Répartition des réclamations par agence (%)" accent="#3B82F6" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByAgencePieChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsPieAgenceClaim ? (
                <LazyChartWrapper
                  type="pie"
                  chartRef={claimByAgencePieChartRef}
                  data={rdsPieAgenceClaim}
                  visible={rdsPieAgenceClaim == null}
                  options={pbiPieOptions()}
                />
              ) : (
                <LazyChartSkeleton type="pie" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
        {props.templateData?.claim.claimByAgenceBarChartRef ? (
          <PBICard title="Nombre de réclamations par Agence" accent="#3B82F6" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByAgenceBarChartRef: false } }) } : undefined}>
            <LazyChart overflow={"x"} height={chartHeight(rdsBarAgenceClaim)} forceRender={isPrinting}>
              {rdsBarAgenceClaim ? (
                <LazyChartWrapper
                  type="bar"
                  chartRef={claimByAgenceBarChartRef}
                  data={rdsBarAgenceClaim}
                  visible={rdsBarAgenceClaim == null}
                  options={pbiOptions("")}
                />
              ) : (
                <LazyChartSkeleton type="bar" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
      </div>
    </>
  );
  const denunByAgenceChart = (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {props.templateData?.denun.denunByAgencePieChartRef ? (
          <PBICard title="Répartition des dénonciations par agence (%)" accent="#F59E0B" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByAgencePieChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsPieAgenceDenun ? (
                <LazyChartWrapper
                  type="pie"
                  chartRef={denunByAgencePieChartRef}
                  data={rdsPieAgenceDenun}
                  visible={rdsPieAgenceDenun == null}
                  options={pbiPieOptions()}
                />
              ) : (
                <LazyChartSkeleton type="pie" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
        {props.templateData?.denun.denunByAgenceBarChartRef ? (
          <PBICard title="Nombre de dénonciations par Agence" accent="#F59E0B" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByAgenceBarChartRef: false } }) } : undefined}>
            <LazyChart overflow={"x"} height={chartHeight(rdsBarAgenceDenun)} forceRender={isPrinting}>
              {rdsBarAgenceDenun ? (
                <LazyChartWrapper
                  type="bar"
                  chartRef={denunByAgenceBarChartRef}
                  data={rdsBarAgenceDenun}
                  visible={rdsBarAgenceDenun == null}
                  options={pbiOptions("")}
                />
              ) : (
                <LazyChartSkeleton type="bar" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
      </div>
    </>
  );
  const sugByAgenceChart = (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {props.templateData?.suggest.sugByAgencePieChartRef ? (
          <PBICard title="Répartition des suggestions par agence (%)" accent="#10B981" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, suggest: { ...props.templateData?.suggest, sugByAgencePieChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsPieAgenceSugge ? (
                <LazyChartWrapper
                  type="pie"
                  chartRef={sugByAgencePieChartRef}
                  data={rdsPieAgenceSugge}
                  visible={rdsPieAgenceSugge == null}
                  options={pbiPieOptions()}
                />
              ) : (
                <LazyChartSkeleton type="pie" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
        {props.templateData?.suggest.sugByAgenceBarChartRef ? (
          <PBICard title="Nombre de suggestions par Agence" accent="#10B981" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, suggest: { ...props.templateData?.suggest, sugByAgenceBarChartRef: false } }) } : undefined}>
            <LazyChart overflow={"x"} height={chartHeight(rdsBarAgenceSugge)} forceRender={isPrinting}>
              {rdsBarAgenceSugge ? (
                <LazyChartWrapper
                  type="bar"
                  chartRef={sugByAgenceBarChartRef}
                  data={rdsBarAgenceSugge}
                  visible={rdsBarAgenceSugge == null}
                  options={pbiOptions("")}
                />
              ) : (
                <LazyChartSkeleton type="bar" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
      </div>
    </>
  );

  const claimByCanalChart = (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {props.templateData?.claim.claimByCanalPieChartRef ? (
          <PBICard title="Répartition des réclamations par modalité de dépôt (%)" accent="#3B82F6" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByCanalPieChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsPieModaliteClaim ? (
                <LazyChartWrapper
                  type="pie"
                  chartRef={claimByCanalPieChartRef}
                  data={rdsPieModaliteClaim}
                  visible={rdsPieModaliteClaim == null}
                  options={pbiPieOptions()}
                />
              ) : (
                <LazyChartSkeleton type="pie" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
        {props.templateData?.claim.claimByCanalBarChartRef ? (
          <PBICard title="Répartition des réclamations par modalité de dépôt et par agence (%)" accent="#3B82F6" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByCanalBarChartRef: false } }) } : undefined}>
            <LazyChart overflow={"y"} height={chartHeight(rdsBarModaliteClaim)} forceRender={isPrinting}>
              {rdsBarModaliteClaim ? (
                <LazyChartWrapper
                  type="bar"
                  chartRef={claimByCanalBarChartRef}
                  data={rdsBarModaliteClaim}
                  visible={rdsBarModaliteClaim == null}
                  options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false }, y: { stacked: true } } })}
                />
              ) : (
                <LazyChartSkeleton type="bar" height={1200} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
      </div>
    </>
  );
  const denunByCanalChart = (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {props.templateData?.denun.denunByCanalPieChartRef ? (
          <PBICard title="Répartition des modalités de dépôt des dénonciations (%)" accent="#F59E0B" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByCanalPieChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsPieModaliteDenun ? (
                <LazyChartWrapper
                  type="pie"
                  chartRef={denunByCanalPieChartRef}
                  data={rdsPieModaliteDenun}
                  visible={rdsPieModaliteDenun == null}
                  options={pbiPieOptions()}
                />
              ) : (
                <LazyChartSkeleton type="pie" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
        {props.templateData?.denun.denunByCanalBarChartRef ? (
          <PBICard title="Répartition des dénonciations par modalité de dépôt et par agence (%)" accent="#F59E0B" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByCanalBarChartRef: false } }) } : undefined}>
            <LazyChart overflow={"y"} height={chartHeight(rdsBarModaliteDenun)} forceRender={isPrinting}>
              {rdsBarModaliteDenun ? (
                <LazyChartWrapper
                  type="bar"
                  chartRef={denunByCanalBarChartRef}
                  data={rdsBarModaliteDenun}
                  visible={rdsBarModaliteDenun == null}
                  options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false }, y: { stacked: true } } })}
                />
              ) : (
                <LazyChartSkeleton type="bar" height={1200} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
      </div>
    </>
  );
  const sugByCanalChart = (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {props.templateData?.suggest.sugByCanalPieChartRef ? (
          <PBICard title="Répartition des modalités de dépôt des suggestions (%)" accent="#10B981" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, suggest: { ...props.templateData?.suggest, sugByCanalPieChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsPieModaliteSugge ? (
                <LazyChartWrapper
                  type="pie"
                  chartRef={sugByCanalPieChartRef}
                  data={rdsPieModaliteSugge}
                  visible={rdsPieModaliteSugge == null}
                  options={pbiPieOptions()}
                />
              ) : (
                <LazyChartSkeleton type="pie" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
        {props.templateData?.suggest.sugByCanalBarChartRef ? (
          <PBICard title="Répartition des suggestions par modalité de dépôt et par agence (%)" accent="#10B981" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, suggest: { ...props.templateData?.suggest, sugByCanalBarChartRef: false } }) } : undefined}>
            <LazyChart overflow={"y"} height={chartHeight(rdsBarModaliteSugge)} forceRender={isPrinting}>
              {rdsBarModaliteSugge ? (
                <LazyChartWrapper
                  type="bar"
                  chartRef={sugByCanalBarChartRef}
                  data={rdsBarModaliteSugge}
                  visible={rdsBarModaliteSugge == null}
                  options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false }, y: { stacked: true } } })}
                />
              ) : (
                <LazyChartSkeleton type="bar" height={1200} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
      </div>
    </>
  );

  const claimByObjetChart = (
    <>
      {props.templateData?.claim.claimByObjetPieChartRef ? (
        <PBICard title="Répartition des objets des réclamations (%)" accent="#3B82F6" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByObjetPieChartRef: false } }) } : undefined}>
          <LazyChart height={520} forceRender={isPrinting}>
            {rdsPieObjetClaim ? (
              <LazyChartWrapper
                type="pie"
                chartRef={claimByObjetPieChartRef}
                data={rdsPieObjetClaim}
                visible={rdsPieObjetClaim == null}
                options={pbiPieOptions()}
              />
            ) : (
              <LazyChartSkeleton type="pie" height={520} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
      {props.templateData?.claim.claimByObjetBarChartRef ? (
        <PBICard title="Répartition des réclamations par objet par agence (%)" accent="#3B82F6" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByObjetBarChartRef: false } }) } : undefined}>
          <LazyChart overflow={"y"} height={chartHeight(rdsBarObjetClaim)} forceRender={isPrinting}>
            {rdsBarObjetClaim ? (
              <LazyChartWrapper
                type="bar"
                chartRef={claimByObjetBarChartRef}
                data={rdsBarObjetClaim}
                visible={rdsBarObjetClaim == null}
                options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false, min: 0 }, y: { stacked: true } } })}
              />
            ) : (
              <LazyChartSkeleton type="bar" height={1200} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
    </>
  );
  const denunByObjetChart = (
    <>
      {props.templateData?.denun.denunByObjetPieChartRef ? (
        <PBICard title="Répartition des objets des dénonciations (%)" accent="#F59E0B" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByObjetPieChartRef: false } }) } : undefined}>
          <LazyChart height={520} forceRender={isPrinting}>
            {rdsPieObjetDenun ? (
              <LazyChartWrapper
                type="pie"
                chartRef={denunByObjetPieChartRef}
                data={rdsPieObjetDenun}
                visible={rdsPieObjetDenun == null}
                options={pbiPieOptions()}
              />
            ) : (
              <LazyChartSkeleton type="pie" height={520} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
      {props.templateData?.denun.denunByObjetBarChartRef ? (
        <PBICard title="Répartition des dénonciations par objet par agence (%)" accent="#F59E0B" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByObjetBarChartRef: false } }) } : undefined}>
          <LazyChart overflow={"y"} height={chartHeight(rdsBarObjetDenun)} forceRender={isPrinting}>
            {rdsBarObjetDenun ? (
              <LazyChartWrapper
                type="bar"
                chartRef={denunByObjetBarChartRef}
                data={rdsBarObjetDenun}
                visible={rdsBarObjetDenun == null}
                options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false }, y: { stacked: true } } })}
              />
            ) : (
              <LazyChartSkeleton type="bar" height={1200} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
    </>
  );

  const claimByGenreChart = (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {props.templateData?.claim.claimByGenderPieChartRef ? (
          <PBICard title="Répartition des réclamations par genre (%)" accent="#3B82F6" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByGenderPieChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsPieGenreClaim ? (
                <LazyChartWrapper
                  type="pie"
                  chartRef={claimByGenderPieChartRef}
                  data={rdsPieGenreClaim}
                  visible={rdsPieGenreClaim == null}
                  options={pbiPieOptions()}
                />
              ) : (
                <LazyChartSkeleton type="pie" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
        {props.templateData?.claim.claimByGenderBarChartRef ? (
          <PBICard title="Répartition des réclamations par genre par agence (%)" accent="#3B82F6" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByGenderBarChartRef: false } }) } : undefined}>
            <LazyChart overflow={"y"} height={chartHeight(rdsBarGenreClaim)} forceRender={isPrinting}>
              {rdsBarGenreClaim ? (
                <LazyChartWrapper
                  type="bar"
                  chartRef={claimByGenderBarChartRef}
                  data={rdsBarGenreClaim}
                  visible={rdsBarGenreClaim == null}
                  options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false }, y: { stacked: true } } })}
                />
              ) : (
                <LazyChartSkeleton type="bar" height={1200} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
      </div>
    </>
  );

  const sugByGenderChart = (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {props.templateData?.suggest.sugByGenderPieChartRef ? (
          <PBICard title="Répartition des suggestions par genre (%)" accent="#10B981" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, suggest: { ...props.templateData?.suggest, sugByGenderPieChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsPieGenreSugge ? (
                <LazyChartWrapper
                  type="pie"
                  chartRef={sugByGenderPieChartRef}
                  data={rdsPieGenreSugge}
                  visible={rdsPieGenreSugge == null}
                  options={pbiPieOptions()}
                />
              ) : (
                <LazyChartSkeleton type="pie" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
        {props.templateData?.suggest.sugByGenderBarChartRef ? (
          <PBICard title="Répartition des suggestions par genre par agence (%)" accent="#10B981" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, suggest: { ...props.templateData?.suggest, sugByGenderBarChartRef: false } }) } : undefined}>
            <LazyChart overflow={"y"} height={chartHeight(rdsBarGenreSugge)} forceRender={isPrinting}>
              {rdsBarGenreSugge ? (
                <LazyChartWrapper
                  type="bar"
                  chartRef={sugByGenderBarChartRef}
                  data={rdsBarGenreSugge}
                  visible={rdsBarGenreSugge == null}
                  options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false }, y: { stacked: true } } })}
                />
              ) : (
                <LazyChartSkeleton type="bar" height={1200} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
      </div>
    </>
  );

  const claimByGraviteChart = (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {props.templateData?.claim.claimByGravitePieChartRef ? (
          <PBICard title="Répartition des réclamations par niveau de gravité (%)" accent="#3B82F6" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByGravitePieChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsPieGravityClaim ? (
                <LazyChartWrapper
                  type="pie"
                  chartRef={claimByGravitePieChartRef}
                  data={rdsPieGravityClaim}
                  visible={rdsPieGravityClaim == null}
                  options={pbiPieOptions()}
                />
              ) : (
                <LazyChartSkeleton type="pie" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
        {props.templateData?.claim.claimByGraviteBarChartRef ? (
          <PBICard title="Répartition des réclamations par gravité de dépôt par agence (%)" accent="#3B82F6" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimByGraviteBarChartRef: false } }) } : undefined}>
            <LazyChart overflow={"y"} height={chartHeight(rdsBarGravityClaim)} forceRender={isPrinting}>
              {rdsBarGravityClaim ? (
                <LazyChartWrapper
                  type="bar"
                  chartRef={claimByGraviteBarChartRef}
                  data={rdsBarGravityClaim}
                  visible={rdsBarGravityClaim == null}
                  options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false }, y: { stacked: true } } })}
                />
              ) : (
                <LazyChartSkeleton type="bar" height={1200} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
      </div>
    </>
  );
  const denunByGraviteChart = (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {props.templateData?.denun.denunByGravitePieChartRef ? (
          <PBICard title="Répartition des dénonciations par niveau de gravité (%)" accent="#F59E0B" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByGravitePieChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsPieGravityDenun ? (
                <LazyChartWrapper
                  type="pie"
                  chartRef={denunByGravitePieChartRef}
                  data={rdsPieGravityDenun}
                  visible={rdsPieGravityDenun == null}
                  options={pbiPieOptions()}
                />
              ) : (
                <LazyChartSkeleton type="pie" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
        {props.templateData?.denun.denunByGraviteBarChartRef ? (
          <PBICard title="Répartition des dénonciations par gravité de dépôt par agence (%)" accent="#F59E0B" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, denunByGraviteBarChartRef: false } }) } : undefined}>
            <LazyChart overflow={"y"} height={chartHeight(rdsBarGravityDenun)} forceRender={isPrinting}>
              {rdsBarGravityDenun ? (
                <LazyChartWrapper
                  type="bar"
                  chartRef={denunByGraviteBarChartRef}
                  data={rdsBarGravityDenun}
                  visible={rdsBarGravityDenun == null}
                  options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false }, y: { stacked: true } } })}
                />
              ) : (
                <LazyChartSkeleton type="bar" height={1200} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
      </div>
    </>
  );

  const claimBySatisfactionChart = (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {props.templateData?.claim.claimBySatisfactionPieChartRef ? (
          <PBICard title="Répartition de la satisfaction des réclamants (%)" accent="#8B5CF6" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, claimBySatisfactionPieChartRef: false } }) } : undefined}>
            <LazyChart height={520} forceRender={isPrinting}>
              {rdsPieStatisClaim ? (
                <LazyChartWrapper
                  type="pie"
                  chartRef={claimBySatisfactionPieChartRef}
                  data={rdsPieStatisClaim}
                  visible={rdsPieStatisClaim == null}
                  options={pbiPieOptions()}
                />
              ) : (
                <LazyChartSkeleton type="pie" height={520} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
        {props.templateData?.claim.tauxMensuelClaimByMonthByAgenceBarChartRef ? (
          <PBICard title="Taux de satisfaction des Réclamations par agence (%)" accent="#8B5CF6" half={true} onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, tauxMensuelClaimByMonthByAgenceBarChartRef: false } }) } : undefined}>
            <LazyChart overflow={"y"} height={chartHeight(tauxMensuelClaimByMonthByAgence)} forceRender={isPrinting}>
              {tauxMensuelClaimByMonthByAgence ? (
                <LazyChartWrapper
                  type="bar"
                  chartRef={tauxMensuelClaimByMonthByAgenceBarChartRef}
                  data={tauxMensuelClaimByMonthByAgence}
                  visible={tauxMensuelClaimByMonthByAgence == null}
                  options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false }, y: { stacked: true } } })}
                />
              ) : (
                <LazyChartSkeleton type="bar" height={1200} />
              )}
            </LazyChart>
          </PBICard>
        ) : <></>}
      </div>
      {props.templateData?.claim.tauxMensuelClaimByMonthBarChartRef ? (
        <PBICard title="Taux de satisfaction mensuel des Réclamations (%)" accent="#8B5CF6" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, tauxMensuelClaimByMonthBarChartRef: false } }) } : undefined}>
          <LazyChart height={520} forceRender={isPrinting}>
            {tauxMensuelClaimByMonth ? (
              <LazyChartWrapper
                type="bar"
                chartRef={tauxMensuelClaimByMonthBarChartRef}
                data={tauxMensuelClaimByMonth}
                visible={tauxMensuelClaimByMonth == null}
                options={pbiOptions("")}
              />
            ) : (
              <LazyChartSkeleton type="bar" height={520} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
    </>
  );

  const claimDelaiResolutionChart = (
    <>
      {props.templateData?.claim.resolutionClaimDelaiByMonthBarChartRef ? (
        <PBICard title="Respect du délai de résolution des Réclamations par mois (%)" accent="#01B8AA" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, resolutionClaimDelaiByMonthBarChartRef: false } }) } : undefined}>
          <LazyChart height={520} forceRender={isPrinting}>
            {rdsBarDelaiGlobal ? (
              <LazyChartWrapper
                type="bar"
                chartRef={resolutionClaimDelaiByMonthBarChartRef}
                data={rdsBarDelaiGlobal}
                visible={rdsBarDelaiGlobal == null}
                options={pbiOptions("")}
              />
            ) : (
              <LazyChartSkeleton type="bar" height={520} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
      {props.templateData?.claim.resolutionClaimDelaiByMonthByAgenceBarChartRef ? (
        <PBICard title="Respect du délai de résolution des Réclamations par agence (%)" accent="#01B8AA" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, claim: { ...props.templateData?.claim, resolutionClaimDelaiByMonthByAgenceBarChartRef: false } }) } : undefined}>
          <LazyChart overflow={"y"} height={chartHeight(rdsBarDelaiClaimByMonthByAgence)} forceRender={isPrinting}>
            {rdsBarDelaiClaimByMonthByAgence ? (
              <LazyChartWrapper
                type="bar"
                chartRef={resolutionClaimDelaiByMonthByAgenceBarChartRef}
                data={rdsBarDelaiClaimByMonthByAgence}
                visible={rdsBarDelaiClaimByMonthByAgence == null}
                options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false }, y: { stacked: true } } })}
              />
            ) : (
              <LazyChartSkeleton type="bar" height={1200} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
    </>
  );

  const denunDelaiResolutionChart = (
    <>
      {props.templateData?.denun.resolutionDenunDelaiByMonthBarChartRef ? (
        <PBICard title="Respect du délai de résolution des Dénonciations par mois (%)" accent="#01B8AA" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, resolutionDenunDelaiByMonthBarChartRef: false } }) } : undefined}>
          <LazyChart height={520} forceRender={isPrinting}>
            {denunBarDelaiByMonth ? (
              <LazyChartWrapper
                type="bar"
                chartRef={resolutionDenunDelaiByMonthBarChartRef}
                data={denunBarDelaiByMonth}
                visible={denunBarDelaiByMonth == null}
                options={pbiOptions("")}
              />
            ) : (
              <LazyChartSkeleton type="bar" height={520} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
      {props.templateData?.denun.resolutionDenunDelaiByMonthByAgenceBarChartRef ? (
        <PBICard title="Respect du délai de résolution des Dénonciations par agence (%)" accent="#01B8AA" onClose={props.tmpState.showForm ? () => { props.setTemplateData({ ...props.templateData, denun: { ...props.templateData?.denun, resolutionDenunDelaiByMonthByAgenceBarChartRef: false } }) } : undefined}>
          <LazyChart overflow={"y"} height={chartHeight(denunBarDelaiByMonthByAgence)} forceRender={isPrinting}>
            {denunBarDelaiByMonthByAgence ? (
              <LazyChartWrapper
                type="bar"
                chartRef={resolutionDenunDelaiByMonthByAgenceBarChartRef}
                data={denunBarDelaiByMonthByAgence}
                visible={denunBarDelaiByMonthByAgence == null}
                options={pbiOptions("", { indexAxis: "y", scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,0)" }, ticks: { callback: (v) => `${v}%` }, max: 100, offset: false }, y: { stacked: true } } })}
              />
            ) : (
              <LazyChartSkeleton type="bar" height={1200} />
            )}
          </LazyChart>
        </PBICard>
      ) : <></>}
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

  const prepareToPrint = async (type = "pdf", options = {}) => {
    setIsPrinting(true);

    // Laisser React re-rendre et Chart.js dessiner les canvas
    await new Promise(resolve => setTimeout(resolve, 500));

    let entete   = document.querySelector("#enteteRapport")?.innerHTML ?? "";
    let title    = document.querySelector("#titleRapport")?.innerHTML ?? "";
    let critere  = document.querySelector("#critereRapport")?.innerHTML ?? "";
    // skipDashboards : exclut les KPI cards (À traiter, Affectée...) du document Word
    let dashClaim   = options.skipDashboards ? "" : document.querySelector("#dashClaimRapport")?.innerHTML ?? "";
    let dashDenun   = options.skipDashboards ? "" : document.querySelector("#dashDenunRapport")?.innerHTML ?? "";
    let dashSuggest = options.skipDashboards ? "" : document.querySelector("#dashSuggestRapport")?.innerHTML ?? "";
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
      resolutionClaimDelaiByMonthByAgenceBarChartRef.current
        ? "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
          resolutionClaimDelaiByMonthByAgenceBarChartRef.current.toBase64Image() +
          "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' /></div>"
        : "";

    const evolutionByAgenceByAnneeBarChartRefData =
      evolutionByAgenceByAnneeBarChartRef.current
        ? "<div class=' col s12 m12 l12 ' style='width:100%'><img src='" +
          evolutionByAgenceByAnneeBarChartRef.current.toBase64Image() +
          "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' /></div>"
        : "";

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
      tauxMensuelClaimByMonthByAgenceBarChartRef.current
        ? "<img src='" +
          tauxMensuelClaimByMonthByAgenceBarChartRef.current.toBase64Image() +
          "' style='width:90% !important;margin-bottom:75px!important;margin-left:55px!important;margin-right:55px!important' />"
        : "";

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
      const statClaimTable = document.querySelector("#statClaimTable")?.innerHTML ?? "";
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

    if (denunciationShow) {
      const statDenunTable = document.querySelector("#statDenunTable")?.innerHTML ?? "";
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

    if (suggestionShow) {
      const statSugTable = document.querySelector("#statSugTable")?.innerHTML ?? "";
      dataSugg =
        sugByAgencePieChartRefData +
        sugByAgenceBarChartRefData +
        sugByGenderPieChartRefData +
        sugByGenderBarChartRefData +
        sugByCanalPieChartRefData +
        sugByCanalBarChartRefData +
        statSugTable;
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

  // Convertit une URL image en base64 (pour exports Word/PDF)
  const toBase64 = (url) => new Promise((resolve) => {
    if (!url || url.startsWith("data:")) { resolve(url); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });

  const printToPDF = async () => {
    setExportLoading("PDF");
    try {
      const childWindow = window.open("", "modal");
      if (!childWindow) {
        alert("Veuillez autoriser les popups pour l'impression.");
        return;
      }
      const logoBase64 = await toBase64(logoInstitution);
      let dom = await prepareToPrint(childWindow);
      if (logoBase64 && logoInstitution) {
        dom = dom.replace(
          new RegExp(logoInstitution.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          logoBase64
        );
      }
      handlePrintAvance(childWindow, dom);
    } finally {
      setExportLoading(null);
      setIsPrinting(false);
    }
  };


  // const printToPDF = async () => {
  //   const toStri = await prepareToPrint();
  //   handlePrintAvance(toStri);
  // };

  const [nameReport, setNameReport] = useState("")
  const prepareReportTablesToXLSX = async () => {
    setExportLoading("Excel");
    try {
    if (!dataRaport || !dataRaport.newVersionStat) {
      notify("Les données ne sont pas encore chargées, veuillez patienter", "warning");
      return;
    }
    let name = today().replaceAll("/", "")
    let filename = `Statistiques_GPR_${name}.xlsx`;

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
      notify("Impossible d'exporter, réessayez", "error");
    }
    } catch (e) {
      notify("Erreur lors de l'export Excel", "error");
    } finally {
      setExportLoading(null);
    }
  };

  const printToWord = async () => {
    setExportLoading("Word");
    const logoBase64 = await toBase64(logoInstitution);
    // skipDashboards: retire les KPI cards de statut (À traiter, Affectée, etc.)
    let reportData = await prepareToPrint("word", { skipDashboards: true });

    // Remplace le src du logo par sa version base64
    if (logoBase64 && logoInstitution) {
      reportData = reportData.replace(
        new RegExp(logoInstitution.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        logoBase64
      );
    }

    const css =
      "<style>" +
      "@page WholeDocument { size: 841.95pt 595.35pt; mso-page-orientation: landscape; margin: 2cm 1.5cm; }" +
      "div.WholeDocument { page: WholeDocument; }" +
      "body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1E293B; line-height: 1.4; }" +
      "h1, h2, h3 { color: #0F4C81; margin-top: 14pt; margin-bottom: 6pt; }" +
      "table { border-collapse: collapse; width: 100%; margin-bottom: 14pt; page-break-inside: avoid; }" +
      "td, th { border: 1px solid #CBD5E1; padding: 5pt 8pt; font-size: 10pt; }" +
      "th { background: #EFF6FF; color: #0F4C81; font-weight: bold; text-transform: uppercase; font-size: 9pt; }" +
      "tr:nth-child(even) td { background: #F8FAFC; }" +
      "img.report-logo { width: 70pt; height: auto; }" +
      "img { max-width: 480pt; width: 480pt; height: auto; display: block; margin: 10pt auto; page-break-inside: avoid; }" +
      "hr { border: none; border-top: 2px solid #0F4C81; margin: 10pt 0; }" +
      "</style>";

    const preHtml =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'>" +
      "<title>Rapport GPR</title>" +
      css +
      "</head><body><div class='WholeDocument'>";
    const postHtml = "</div></body></html>";
    const html = preHtml + reportData + postHtml;

    const filename = "Rapport_GPR_" + today().replaceAll("/", "") + ".doc";
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    setExportLoading(null);
    setIsPrinting(false);
  };
  const TABS = [
    { label: "Vue d'ensemble", color: "#8B5CF6", bg: "#F5F3FF", enabled: globalShow },
    { label: "Réclamations",   color: "#3B82F6", bg: "#EFF6FF", enabled: claimShow },
    { label: "Dénonciations",  color: "#F59E0B", bg: "#FFFBEB", enabled: denunciationShow },
    { label: "Suggestions",    color: "#10B981", bg: "#ECFDF5", enabled: suggestionShow },
  ];

  const SectionSubtitle = ({ children, id, accent = "#0F4C81" }) => (
    <div id={id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 700, color: "#374151", padding: "20px 0 8px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
      <div style={{ width: 4, height: 18, background: accent, borderRadius: 2, flexShrink: 0 }} />
      {children}
      <div style={{ flex: 1, height: 1, background: "#F1F5F9", marginLeft: 4 }} />
    </div>
  );

  const kpiData = [
    { label: "Réclamations",   value: props.claimReport?.basicStats?.total ?? "—",  color: "#3B82F6", bg: "#EFF6FF" },
    { label: "Dénonciations",  value: props.denunReport?.basicStats?.total ?? "—",  color: "#F59E0B", bg: "#FFFBEB" },
    { label: "Suggestions",    value: props.sugReport?.basicStats?.total ?? "—",    color: "#10B981", bg: "#ECFDF5" },
    { label: "Taux résolution",value: props.global_trend?.tauxResolution != null ? `${(parseFloat(props.global_trend.tauxResolution) * 100).toFixed(1)} %` : "—", color: "#8B5CF6", bg: "#F5F3FF" },
  ];

  return (
    <>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div ref={pageTopRef} />
      <div id="trSimple" style={{}}></div>
      <div id="main" style={{ marginBottom: "80px" }}>
        {/* ── PAGE HEADER ── */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", padding: "20px 24px", marginBottom: 16 }}>
          {/* KPI badges */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            {kpiData.map(({ label, value, color, bg }) => (
              <div key={label} style={{ flex: "1 1 0", background: bg, borderRadius: 12, padding: "10px 18px", display: "flex", flexDirection: "column", gap: 2, minWidth: 120 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color }}>{value}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color, opacity: 0.75 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Action bar */}
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
              onClick={() => { setshowSearch(true); setOpen(true); }}
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
                  background: isLoading ? bg : bg,
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

        {/* ── FILTER MODAL ── */}
        <Dialog
          open={showSearch}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{ style: { borderRadius: 16, overflow: "visible" } }}
        >
          <DialogTitle style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 12px", borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" fill="none" stroke="#0F4C81" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Filtrer le rapport</span>
            </div>
            <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 22, lineHeight: 1, padding: 4, borderRadius: 6 }}>✕</button>
          </DialogTitle>

          <DialogContent style={{ padding: "20px 24px", overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Année */}
              <div>
                <label style={filterLabelStyle}>Année</label>
                <Select
                  styles={filterSelectStyles}
                  placeholder="Sélectionner l'année"
                  options={yearOptions}
                  isDisabled={yearOptions.length <= 0}
                  onChange={(e) => props.yearChanged(e.value)}
                />
              </div>

              {/* Type de plainte */}
              <div>
                <label style={filterLabelStyle}>Type de plainte</label>
                <Select
                  isMulti
                  styles={filterSelectStyles}
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
                            { label: "Partiellement satisfait", value: "PARTIAL_SATISFIED" },
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

              {/* Objets */}
              {!closeObjet && (
                <div>
                  <label style={filterLabelStyle}>Objets</label>
                  <Select
                    isMulti
                    styles={filterSelectStyles}
                    placeholder="Tous"
                    options={optionsObjet}
                    onChange={(e) => {
                      let objets = [];
                      for (let i = 0; i < e.length; i++) objets.push(e[i].value);
                      setObjet(objets);
                    }}
                  />
                </div>
              )}

              {/* État de la plainte */}
              <div>
                <label style={filterLabelStyle}>État de la plainte</label>
                <Select
                  isMulti
                  styles={filterSelectStyles}
                  placeholder="Tous"
                  options={optionsState}
                  onChange={(e) => {
                    let arrau = [];
                    for (let i = 0; i < e.length; i++) arrau.push(e[i].value);
                    setEtatState(arrau);
                  }}
                />
              </div>

              {/* Toggle options avancées */}
              <button
                onClick={() => setOther(!other)}
                style={{
                  background: "none", border: "1.5px dashed #CBD5E1",
                  borderRadius: 10, padding: "8px 0",
                  color: other ? "#EF4444" : "#3B82F6",
                  fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                }}
              >
                {other ? "− Moins d'options" : "+ Plus d'options"}
              </button>

              {/* Options avancées */}
              {other && (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 14,
                  background: "#F8FAFC", borderRadius: 12,
                  border: "1px solid #F1F5F9", padding: 16,
                }}>

                  {/* Produits */}
                  <div>
                    <label style={filterLabelStyle}>Produits</label>
                    <Select
                      isMulti
                      styles={filterSelectStyles}
                      placeholder="Tous"
                      options={optionsProducts}
                      onChange={(e) => {
                        let arrau = [];
                        for (let i = 0; i < e.length; i++) arrau.push(e[i].value);
                        setProduct(arrau);
                      }}
                    />
                  </div>

                  {/* Enregistré par */}
                  <div>
                    <label style={filterLabelStyle}>Enregistré par</label>
                    <Select
                      isMulti
                      styles={filterSelectStyles}
                      placeholder="Tous"
                      options={optionsUsers}
                      onChange={(e) => {
                        let arrau = [];
                        for (let i = 0; i < e.length; i++) arrau.push(e[i].value);
                        setRecoredBy(arrau);
                      }}
                    />
                  </div>

                  {/* Période */}
                  <div>
                    <label style={filterLabelStyle}>Reçu entre</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <DatePicker
                          id="idStartDate"
                          name="startDate"
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          dateFormat="dd/MM/yyyy"
                          locale="fr"
                          placeholderText="Date de début"
                          customInput={<DateInput />}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <DatePicker
                          id="idEndDate"
                          name="endDate"
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          dateFormat="dd/MM/yyyy"
                          locale="fr"
                          placeholderText="Date de fin"
                          customInput={<DateInput />}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Points de service */}
                  <div>
                    <label style={filterLabelStyle}>Points de service</label>
                    <Select
                      isMulti
                      styles={filterSelectStyles}
                      placeholder="Tous"
                      options={optionsUnits}
                      onChange={(e) => {
                        let arrau = [];
                        for (let i = 0; i < e.length; i++) arrau.push(e[i].value);
                        setUnit(arrau);
                      }}
                    />
                  </div>

                </div>
              )}

            </div>
          </DialogContent>

          <DialogActions style={{ padding: "12px 24px 20px", borderTop: "1px solid #F1F5F9", gap: 8 }}>
            <button
              onClick={cleanForm}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Effacer tout
            </button>
            <button
              onClick={(e) => { genereReport(e); handleClose(e); }}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #0F4C81 0%, #1E88E5 100%)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <CheckIcon style={{ fontSize: 16 }} />
              Générer
            </button>
          </DialogActions>
        </Dialog>

        <ReportTemplate />

        {/* ── TABS ── */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", padding: 6, marginBottom: 16, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {TABS.map(({ label, color, bg, enabled }, i) => (
            <button
              key={i}
              onClick={() => enabled && setActiveTab(i)}
              style={{
                flex: "1 1 140px",
                padding: "10px 16px",
                borderRadius: 12,
                border: activeTab === i ? `1.5px solid ${color}33` : "1.5px solid transparent",
                background: activeTab === i ? bg : "transparent",
                color: activeTab === i ? color : enabled ? "#64748b" : "#CBD5E1",
                fontSize: 13.5,
                fontWeight: activeTab === i ? 700 : 500,
                cursor: enabled ? "pointer" : "not-allowed",
                opacity: enabled ? 1 : 0.45,
                transition: "all 0.2s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── REPORT CONTENT ── */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", padding: "24px" }} id="rapportAvance">
          {/* Institution header – preserved for print/PDF/Word */}
          <div id="enteteRapport" style={{ marginBottom: 24 }}>
            {/* Logo + infos institution */}
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
              {/* Métadonnées à droite */}
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Rapport généré le</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
            </div>

            {/* Titre du rapport */}
            <div id="titleRapport" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ height: 3, flex: 1, background: "linear-gradient(to right, #0F4C81, transparent)" }} />
              <span style={{ fontSize: 16, fontWeight: 800, color: "#0F4C81", textTransform: "uppercase", letterSpacing: "0.8px", whiteSpace: "nowrap" }}>
                Rapport de gestion des plaintes &amp; réclamations
              </span>
              <div style={{ height: 3, flex: 1, background: "linear-gradient(to left, #0F4C81, transparent)" }} />
            </div>

            {/* Ligne de critères */}
            <div id="critereRapport" style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {props.year && (
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "#0F4C81", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 20, padding: "3px 12px" }}>
                  Année : {props.year}
                </span>
              )}
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#6B7280", background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 20, padding: "3px 12px" }}>
                Généré par {userAuth?.firstAndLastName}
              </span>
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

                {(activeTab === 0 || isPrinting) && globalShow && (
                  <>
                    {(hasFalseInSection("global") && props.tmpState.showForm) && (
                      <div style={{ color: "darkred", cursor: "pointer", marginBottom: 8 }} onClick={(e) => restoreSection("global")}>Restaurer les stats globales</div>
                    )}
                    {reportGlobalChart}
                    {reportGlobalByCanalChart}
                    {reportGlobalByObjetChart}
                    {reportMixteChart}
                    <canvas id="myChart2"></canvas>
                  </>
                )}

                {(activeTab === 1 || isPrinting) && claimShow && (
                  <>
                    {(hasFalseInSection("claim") && props.tmpState.showForm) && (
                      <div style={{ color: "darkred", cursor: "pointer", marginBottom: 8 }} onClick={(e) => restoreSection("claim")}>Restaurer les stats des réclamations</div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0 16px", borderBottom: "1.5px solid #F1F5F9", marginBottom: 20 }} id="titleClaim">
                      <div style={{ width: 5, height: 28, background: "#3B82F6", borderRadius: 3 }} />
                      <span style={{ color: "#0F172A", fontSize: 22, fontWeight: 800 }}>Réclamations</span>
                    </div>
                    <div style={{ marginBottom: 24 }} id="dashClaimRapport">
                      {claimShow ? claimDashboard() : ""}
                    </div>

                    {props.claimReport && props.claimReport.length !== 0 ? (
                      <>
                        <SectionSubtitle id="toeClaim" accent="#3B82F6">Par agence</SectionSubtitle>
                        {claimByAgenceChart}
                        <SectionSubtitle accent="#3B82F6">Par modalité de dépôt</SectionSubtitle>
                        {claimByCanalChart}
                        <SectionSubtitle accent="#3B82F6">Par objet</SectionSubtitle>
                        {claimByObjetChart}
                        <SectionSubtitle accent="#3B82F6">Par genre</SectionSubtitle>
                        {claimByGenreChart}
                        <SectionSubtitle accent="#3B82F6">Par niveau de gravité</SectionSubtitle>
                        {claimByGraviteChart}
                        <SectionSubtitle accent="#3B82F6">Satisfaction des réclamants</SectionSubtitle>
                        {claimBySatisfactionChart}
                        <SectionSubtitle accent="#3B82F6">Délai de résolution</SectionSubtitle>
                        {claimDelaiResolutionChart}
                        <div id="statClaimTable">
                          <SectionSubtitle accent="#3B82F6">Tableau récapitulatif</SectionSubtitle>
                          {claimTableStat()}
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 15 }}>
                        Aucune réclamation ne correspond aux critères de tri
                      </div>
                    )}
                  </>
                )}

                {(activeTab === 2 || isPrinting) && denunciationShow && (
                  <>
                    {(hasFalseInSection("denun") && props.tmpState.showForm) && (
                      <div style={{ color: "darkred", cursor: "pointer", marginBottom: 8 }} onClick={() => restoreSection("denun")}>Restaurer les stats des dénonciations</div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0 16px", borderBottom: "1.5px solid #F1F5F9", marginBottom: 20 }}>
                      <div style={{ width: 5, height: 28, background: "#F59E0B", borderRadius: 3 }} />
                      <span style={{ color: "#0F172A", fontSize: 22, fontWeight: 800 }}>Dénonciations</span>
                    </div>
                    <div id="dashDenunRapport" style={{ marginBottom: 20 }}>
                      {denunciationDashboard()}
                    </div>
                    {props.denunReport && props.denunReport.length != 0 ? (
                      <>
                        <SectionSubtitle id="toeDenun" accent="#F59E0B">Par agence</SectionSubtitle>
                        {denunByAgenceChart}
                        <SectionSubtitle accent="#F59E0B">Par modalité de dépôt</SectionSubtitle>
                        {denunByCanalChart}
                        <SectionSubtitle accent="#F59E0B">Par objet</SectionSubtitle>
                        {denunByObjetChart}
                        <SectionSubtitle accent="#F59E0B">Délai de résolution</SectionSubtitle>
                        {denunDelaiResolutionChart}
                        <SectionSubtitle accent="#F59E0B">Par niveau de gravité</SectionSubtitle>
                        {denunByGraviteChart}
                        <div id="statDenunTable">
                          <SectionSubtitle accent="#F59E0B">Tableau récapitulatif</SectionSubtitle>
                          {denunTableStat()}
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 15 }}>
                        Aucune dénonciation ne correspond aux critères de tri
                      </div>
                    )}
                  </>
                )}

                {(activeTab === 3 || isPrinting) && suggestionShow && (
                  <>
                    {(hasFalseInSection("suggest") && props.tmpState.showForm) && (
                      <div style={{ color: "darkred", cursor: "pointer", marginBottom: 8 }} onClick={() => restoreSection("suggest")}>Restaurer les stats des suggestions</div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0 16px", borderBottom: "1.5px solid #F1F5F9", marginBottom: 20 }}>
                      <div style={{ width: 5, height: 28, background: "#10B981", borderRadius: 3 }} />
                      <span style={{ color: "#0F172A", fontSize: 22, fontWeight: 800 }}>Suggestions</span>
                    </div>
                    <div id="dashSuggestRapport" style={{ marginBottom: 20 }}>
                      {suggestionDashboard()}
                    </div>
                    {props.sugReport && props.sugReport.length !== 0 ? (
                      <>
                        <SectionSubtitle id="tpeSugg" accent="#10B981">Par agence</SectionSubtitle>
                        {sugByAgenceChart}
                        <SectionSubtitle accent="#10B981">Par modalité de dépôt</SectionSubtitle>
                        {sugByCanalChart}
                        <SectionSubtitle accent="#10B981">Par genre</SectionSubtitle>
                        {sugByGenderChart}
                        <div id="statSugTable">
                          <SectionSubtitle accent="#10B981">Tableau récapitulatif</SectionSubtitle>
                          {sugTableStat()}
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 15 }}>
                        Aucune suggestion ne correspond aux critères de tri
                      </div>
                    )}
                  </>
                )}
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
