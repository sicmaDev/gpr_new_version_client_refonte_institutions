import { TableExport } from "tableexport";
import { getExportHtml2, getExportHtml3 } from "./tables";

export const table2XLSX = (filename, style = "", avance = 0) => {
  let options = {
    headers: true, // (Boolean), display table headers (th or td elements) in the <thead>, (default: true)
    footers: true, // (Boolean), display table footers (th or td elements) in the <tfoot>, (default: false)
    formats: ["xlsx"], // (String[]), filetype(s) for the export, (default: ['xlsx', 'csv', 'txt'])
    filename: filename, // (id, String), filename for the downloaded file, (default: 'id')
    bootstrap: false, // (Boolean), style buttons using bootstrap, (default: true)
    exportButtons: false, // (Boolean), automatically generate the built-in export buttons for each of the specified formats (default: true)
    position: "bottom", // (top, bottom), position of the caption element relative to table, (default: 'bottom')
    ignoreRows: null, // (Number, Number[]), row indices to exclude from the exported file(s) (default: null)
    ignoreCols: null, // (Number, Number[]), column indices to exclude from the exported file(s) (default: null)
    trimWhitespace: true, // (Boolean), remove all leading/trailing newlines, spaces, and tabs from cell text in the exported file(s) (default: false)
    RTL: false, // (Boolean), set direction of the worksheet to right-to-left (default: false)
    sheetname: "Sheet 1", // (id, String), sheet name for the exported spreadsheet, (default: 'id')
  };
  let tableToExport = new TableExport(
    document.getElementsByClassName(style === "" ? "table-xlsx" : style),
    options
  );
  /* convert export data to a file for download */
  let exportData = tableToExport.getExportData();
  // console.log("exportData","ok");
  // console.log("exportData",exportData);

  let mimeType, merges, xlsxData, extension, rtl, sheetname, xlsxDenunciation, xlsxSuggestion, xlsxClaim, xlsxDenunciationData, xlsxSuggestionData, xlsxClaimData
  if (avance === 0) {
    let separator = [[{ v: '', t: '' }, { v: ' ', t: '' }],]

    xlsxClaim = exportData.stats_claim !== undefined ? exportData.stats_claim.xlsx : []; // Replace with the kind of file you want from the exportData
    xlsxDenunciation = exportData.stats_denunciation !== undefined ? exportData.stats_denunciation.xlsx : []; // Replace with the kind of file you want from the exportData
    xlsxSuggestion = exportData.stats_suggestion !== undefined ? exportData.stats_suggestion.xlsx : []; // Replace with the kind of file you want from the exportData

    xlsxClaimData = [[{ v: ' Réclamations ', t: '' }, { v: ' ', t: '' }],].concat(xlsxClaim.length !== 0 ? xlsxClaim.data : "")
    xlsxDenunciationData = [[{ v: ' Dénonciations ', t: '' }, { v: ' ', t: '' }],].concat(xlsxDenunciation.length !== 0 ? xlsxDenunciation.data : "")
    xlsxSuggestionData = [[{ v: ' Suggestions ', t: '' }, { v: ' ', t: '' }],].concat(xlsxSuggestion.length !== 0 ? xlsxSuggestion.data : "")


    let xlsxListData =
      exportData["as-react-datatable"] !== undefined
        ? exportData["as-react-datatable"].xlsx
        : []; // Replace with the kind of file you want from the exportData

    xlsxData =
      exportData["as-react-datatable"] === undefined
        ? xlsxClaimData.concat(separator).concat(xlsxDenunciationData).concat(separator).concat(xlsxSuggestionData)
        : xlsxListData.data;
    //for(let table in exportData ){
    //   tableToExport.createSheet(table)
    //} 
    mimeType =
      exportData["as-react-datatable"] === undefined
        ? xlsxClaim.mimeType
        : xlsxListData.mimeType;
    merges =
      exportData["as-react-datatable"] === undefined
        ? xlsxClaim.merges
        : xlsxListData.merges;
    extension =
      exportData["as-react-datatable"] === undefined
        ? xlsxClaim.fileExtension
        : xlsxListData.fileExtension;

    rtl =
      exportData["as-react-datatable"] === undefined
        ? xlsxClaim.RTL
        : xlsxListData.RTL;
    sheetname =
      exportData["as-react-datatable"] === undefined
        ? xlsxClaim.sheetname
        : xlsxListData.sheetname;
  } else if (avance === 1) {
    let separator = [[{ v: '', t: '' }, { v: ' ', t: '' }],]

    //Dénonciation
    // console.log("Avance Export to word");
    // console.log('exportData.todDenEx', exportData.todDenEx)

    let xlsxTodDenEx = exportData.todDenEx !== undefined ? exportData.todDenEx.xlsx.data : []
    let xlsxTopDenEx = exportData.topDenEx !== undefined ? exportData.topDenEx.xlsx.data : []
    let xlsxTpdDenEx = exportData.tpdDenEx !== undefined ? exportData.tpdDenEx.xlsx.data : []
    let xlsxTpeDenEx = exportData.tpeDenEx !== undefined ? exportData.tpeDenEx.xlsx.data : []
    let xlsxToeDenEx = exportData.toeDenEx !== undefined ? exportData.toeDenEx.xlsx.data : []
    xlsxDenunciationData = [[{ v: ' Dénonciations ', t: '' }, { v: ' ', t: '' }],].concat(xlsxTodDenEx).concat(separator).concat(xlsxTopDenEx).concat(separator).concat(xlsxTpdDenEx).concat(separator).concat(xlsxTpeDenEx).concat(separator).concat(xlsxToeDenEx).concat(separator).concat(separator)


    //Fin denonciation

    //Suggestion

    let xlsxTpdSuggEx = exportData.tpdSuggEx !== undefined ? exportData.tpdSuggEx.xlsx.data : []
    let xlsxTpeSuggEx = exportData.tpeSuggEx !== undefined ? exportData.tpeSuggEx.xlsx.data : []
    xlsxSuggestionData = [[{ v: 'Suggestions', t: '' }, { v: ' ', t: '' }],].concat(xlsxTpdSuggEx).concat(separator).concat(xlsxTpeSuggEx).concat(separator)

    //Fin suggestion

    //Réclamation
    let xlsxTpdClaimEx = exportData.tpdClaimEx !== undefined ? exportData.tpdClaimEx.xlsx.data : []
    let xlsxTpeClaimEx = exportData.tpeClaimEx !== undefined ? exportData.tpeClaimEx.xlsx.data : []
    let xlsxToeClaimEx = exportData.toeClaimEx !== undefined ? exportData.toeClaimEx.xlsx.data : []
    let xlsxTodClaimEx = exportData.todClaimEx !== undefined ? exportData.todClaimEx.xlsx.data : []
    let xlsxTopClaimEx = exportData.topClaimEx !== undefined ? exportData.topClaimEx.xlsx.data : []
    xlsxClaimData = [[{ v: 'Réclamations', t: '' }, { v: ' ', t: '' }],].concat(xlsxTpeClaimEx).concat(separator).concat(xlsxTpdClaimEx).concat(separator).concat(xlsxToeClaimEx).concat(separator).concat(xlsxTodClaimEx).concat(separator).concat(xlsxTopClaimEx).concat(separator).concat(separator)

    //Fin réclamation

    xlsxData = [].concat(xlsxClaimData).concat(xlsxDenunciationData).concat(xlsxSuggestionData)
    mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    merges = []
    extension = ".xlsx";

    rtl = options.RTL;
    sheetname = options.sheetname;
  } else if (avance === 2) {
    let separator = [[{ v: '', t: '' }, { v: ' ', t: '' }],]

    //Réclamation
    let xlsxHeadClaimEx = exportData.headClaimEx !== undefined ? exportData.headClaimEx.xlsx.data : []
    let xlsxBodyClaimEx = exportData.bodyClaimEx !== undefined ? exportData.bodyClaimEx.xlsx.data : []

    xlsxClaimData = [[{ v: 'Réclamations', t: '' }, { v: ' ', t: '' }],].concat(xlsxHeadClaimEx).concat(separator).concat(xlsxBodyClaimEx)
    //Fin réclamation

    xlsxData = [].concat(xlsxClaimData)
    mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    merges = []
    extension = ".xlsx";

    rtl = options.RTL;
    sheetname = options.sheetname;
  }

  //tableToExport.export2file(xlsxData, mimeType, filename, extension)
  tableToExport.export2file(
    xlsxData,
    mimeType,
    filename,
    extension,
    merges,
    rtl,
    sheetname
  );
  //tableToExport.exportmultisheet(xlsxData, mimeType, xlsxClaimData.filename, ["Reclamations", "Denonciations", "Suggestions"], xlsxClaimData.fileExtension, {}, [])
};
export const table2XLS2X = (filename, style = "", columns, records) => {
  let options = {
    headers: true, // (Boolean), display table headers (th or td elements) in the <thead>, (default: true)
    footers: true, // (Boolean), display table footers (th or td elements) in the <tfoot>, (default: false)
    formats: ["xlsx"], // (String[]), filetype(s) for the export, (default: ['xlsx', 'csv', 'txt'])
    filename: filename, // (id, String), filename for the downloaded file, (default: 'id')
    bootstrap: false, // (Boolean), style buttons using bootstrap, (default: true)
    exportButtons: false, // (Boolean), automatically generate the built-in export buttons for each of the specified formats (default: true)
    position: "bottom", // (top, bottom), position of the caption element relative to table, (default: 'bottom')
    ignoreRows: null, // (Number, Number[]), row indices to exclude from the exported file(s) (default: null)
    ignoreCols: null, // (Number, Number[]), column indices to exclude from the exported file(s) (default: null)
    trimWhitespace: true, // (Boolean), remove all leading/trailing newlines, spaces, and tabs from cell text in the exported file(s) (default: false)
    RTL: false, // (Boolean), set direction of the worksheet to right-to-left (default: false)
    sheetname: "Sheet 1", // (id, String), sheet name for the exported spreadsheet, (default: 'id')
  };
  document.getElementById("tab_exl").innerHTML = getExportHtml2(
    columns,
    records,
    "brke"
  );
  // console.log(document.getElementsByClassName(style));
  let tableToExport = new TableExport(
    document.getElementsByClassName(style),
    options
  );
  /* convert export data to a file for download */
  let exportData = tableToExport.getExportData();
  // console.log(exportData);

  let xlsxListData = exportData[Object.keys(exportData)[0]].xlsx;

  //tableToExport.export2file(xlsxData, mimeType, filename, extension)
  tableToExport.export2file(
    xlsxListData.data,
    xlsxListData.mimeType,
    filename,
    xlsxListData.fileExtension,
    [],
    xlsxListData.RTL,
    xlsxListData.sheetname
  );
  //tableToExport.exportmultisheet(xlsxData, mimeType, xlsxClaimData.filename, ["Reclamations", "Denonciations", "Suggestions"], xlsxClaimData.fileExtension, {}, [])
};

const parseDate = (dateString) => {
  if (!dateString) return null;

  // Séparer la date et l'heure
  const [datePart] = dateString.split(" ");

  // Séparer le jour, le mois et l'année
  const [day, month, year] = datePart.split("-");

  // Reformer la date au format YYYY-MM-DD
  return `${year}-${month}-${day}`;
};

const resetTime = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // Réinitialiser l'heure à 00:00:00
  return d;
};

const formatDate = (dateString) => {
  // Séparer la date et l'heure
  return dateString.split('T')[0]; // Garde seulement 'YYYY-MM-DD'
};


export const table2XLS2XF = (filename, style = "", columns, records, startDate, endDate) => {
  let options = {
    headers: true, // (Boolean), display table headers (th or td elements) in the <thead>, (default: true)
    footers: true, // (Boolean), display table footers (th or td elements) in the <tfoot>, (default: false)
    formats: ["xlsx"], // (String[]), filetype(s) for the export, (default: ['xlsx', 'csv', 'txt'])
    filename: filename, // (id, String), filename for the downloaded file, (default: 'id')
    bootstrap: false, // (Boolean), style buttons using bootstrap, (default: true)
    exportButtons: false, // (Boolean), automatically generate the built-in export buttons for each of the specified formats (default: true)
    position: "bottom", // (top, bottom), position of the caption element relative to table, (default: 'bottom')
    ignoreRows: null, // (Number, Number[]), row indices to exclude from the exported file(s) (default: null)
    ignoreCols: null, // (Number, Number[]), column indices to exclude from the exported file(s) (default: null)
    trimWhitespace: true, // (Boolean), remove all leading/trailing newlines, spaces, and tabs from cell text in the exported file(s) (default: false)
    RTL: false, // (Boolean), set direction of the worksheet to right-to-left (default: false)
    sheetname: "Sheet 1", // (id, String), sheet name for the exported spreadsheet, (default: 'id')
  };

  const filteredRecords = records.filter(record => {
    const recordDate = resetTime(new Date(parseDate(record.receiptDateTime)));
    return recordDate >= resetTime(new Date(startDate)) && recordDate <= resetTime(new Date(endDate));
  });
  // console.log("filteredRecords", filteredRecords)
  if (filteredRecords.length === 0) {
    alert("Aucune donnée trouvée pour la période spécifiée.");
    return;
  }

  document.getElementById("tab_exl").innerHTML = getExportHtml2(
    columns,
    filteredRecords,
    "brke"
  );
  // console.log(document.getElementsByClassName(style));
  let tableToExport = new TableExport(
    document.getElementsByClassName(style),
    options
  );
  /* convert export data to a file for download */
  let exportData = tableToExport.getExportData();
  // console.log(exportData);

  let xlsxListData = exportData[Object.keys(exportData)[0]].xlsx;

  //tableToExport.export2file(xlsxData, mimeType, filename, extension)
  tableToExport.export2file(
    xlsxListData.data,
    xlsxListData.mimeType,
    filename,
    xlsxListData.fileExtension,
    [],
    xlsxListData.RTL,
    xlsxListData.sheetname
  );
  //tableToExport.exportmultisheet(xlsxData, mimeType, xlsxClaimData.filename, ["Reclamations", "Denonciations", "Suggestions"], xlsxClaimData.fileExtension, {}, [])
};

export const table3XLS2X = (filename, style = "", columns, records) => {
  let options = {
    headers: true, // (Boolean), display table headers (th or td elements) in the <thead>, (default: true)
    footers: true, // (Boolean), display table footers (th or td elements) in the <tfoot>, (default: false)
    formats: ["xlsx"], // (String[]), filetype(s) for the export, (default: ['xlsx', 'csv', 'txt'])
    filename: filename, // (id, String), filename for the downloaded file, (default: 'id')
    bootstrap: false, // (Boolean), style buttons using bootstrap, (default: true)
    exportButtons: false, // (Boolean), automatically generate the built-in export buttons for each of the specified formats (default: true)
    position: "bottom", // (top, bottom), position of the caption element relative to table, (default: 'bottom')
    ignoreRows: null, // (Number, Number[]), row indices to exclude from the exported file(s) (default: null)
    ignoreCols: null, // (Number, Number[]), column indices to exclude from the exported file(s) (default: null)
    trimWhitespace: true, // (Boolean), remove all leading/trailing newlines, spaces, and tabs from cell text in the exported file(s) (default: false)
    RTL: false, // (Boolean), set direction of the worksheet to right-to-left (default: false)
    sheetname: "Sheet 1", // (id, String), sheet name for the exported spreadsheet, (default: 'id')
  };
  document.getElementById("tab_exl").innerHTML = getExportHtml3(
    columns,
    records,
    "brke"
  );
  // console.log(document.getElementsByClassName(style));
  let tableToExport = new TableExport(
    document.getElementsByClassName(style),
    options
  );
  /* convert export data to a file for download */
  let exportData = tableToExport.getExportData();
  // console.log(exportData);

  let xlsxListData = exportData[Object.keys(exportData)[0]].xlsx;

  //tableToExport.export2file(xlsxData, mimeType, filename, extension)
  tableToExport.export2file(
    xlsxListData.data,
    xlsxListData.mimeType,
    filename,
    xlsxListData.fileExtension,
    [],
    xlsxListData.RTL,
    xlsxListData.sheetname
  );
  //tableToExport.exportmultisheet(xlsxData, mimeType, xlsxClaimData.filename, ["Reclamations", "Denonciations", "Suggestions"], xlsxClaimData.fileExtension, {}, [])
};

export const table3XLS2XF = (filename, style = "", columns, records, startDate, endDate) => {
  let options = {
    headers: true, // (Boolean), display table headers (th or td elements) in the <thead>, (default: true)
    footers: true, // (Boolean), display table footers (th or td elements) in the <tfoot>, (default: false)
    formats: ["xlsx"], // (String[]), filetype(s) for the export, (default: ['xlsx', 'csv', 'txt'])
    filename: filename, // (id, String), filename for the downloaded file, (default: 'id')
    bootstrap: false, // (Boolean), style buttons using bootstrap, (default: true)
    exportButtons: false, // (Boolean), automatically generate the built-in export buttons for each of the specified formats (default: true)
    position: "bottom", // (top, bottom), position of the caption element relative to table, (default: 'bottom')
    ignoreRows: null, // (Number, Number[]), row indices to exclude from the exported file(s) (default: null)
    ignoreCols: null, // (Number, Number[]), column indices to exclude from the exported file(s) (default: null)
    trimWhitespace: true, // (Boolean), remove all leading/trailing newlines, spaces, and tabs from cell text in the exported file(s) (default: false)
    RTL: false, // (Boolean), set direction of the worksheet to right-to-left (default: false)
    sheetname: "Sheet 1", // (id, String), sheet name for the exported spreadsheet, (default: 'id')
  };

  const filteredRecords = records.filter(record => {
    const recordDate = resetTime(new Date(formatDate(record.receiptDateTime)));
    return recordDate >= resetTime(new Date(startDate)) && recordDate <= resetTime(new Date(endDate));
  });
  // console.log("filteredRecords", filteredRecords)
  if (filteredRecords.length === 0) {
    alert("Aucune donnée trouvée pour la période spécifiée.");
    return;
  }
  document.getElementById("tab_exl").innerHTML = getExportHtml3(
    columns,
    filteredRecords,
    "brke"
  );
  // console.log(document.getElementsByClassName(style));
  let tableToExport = new TableExport(
    document.getElementsByClassName(style),
    options
  );
  /* convert export data to a file for download */
  let exportData = tableToExport.getExportData();
  // console.log(exportData);

  let xlsxListData = exportData[Object.keys(exportData)[0]].xlsx;

  //tableToExport.export2file(xlsxData, mimeType, filename, extension)
  tableToExport.export2file(
    xlsxListData.data,
    xlsxListData.mimeType,
    filename,
    xlsxListData.fileExtension,
    [],
    xlsxListData.RTL,
    xlsxListData.sheetname
  );
  //tableToExport.exportmultisheet(xlsxData, mimeType, xlsxClaimData.filename, ["Reclamations", "Denonciations", "Suggestions"], xlsxClaimData.fileExtension, {}, [])
};
