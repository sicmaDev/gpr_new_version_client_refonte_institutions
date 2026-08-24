import React from "react";
import { loadItemFromLocalStorage, loadItemFromSessionStorage } from "./utils";
import { v4 as uuidv4 } from "uuid";
import { INSTITUTION_ADDRESS, INSTITUTION_AGREMENT, INSTITUTION_EMAIL, INSTITUTION_LOGO, INSTITUTION_NAME, INSTITUTION_TEL } from "./globals";
let mode = loadItemFromLocalStorage("app-mode") !== undefined ? (loadItemFromLocalStorage("app-mode")) : undefined;

export const getExportHtml = (columns, records, without = []) => {
  try {
    // console.log(columns);
    // console.log(records);
    let tableHtml = "<table>";
    tableHtml += "<thead>";
    tableHtml += "<tr style='font-weight: bold'>";
    columns.map((column) => {
      // console.log('column.text', column.text)
      // console.log('without', without)
      if (without.includes(column.text)) {
        return (tableHtml += "");
      }
      return (tableHtml += "<td>" + column.text + "</td>");
    });
    tableHtml += "</tr>";
    tableHtml += "</thead>";
    tableHtml += "<tbody>";

    records.map((record) => {
      console.log("receiptDateTime:", record.receiptDateTime, "createdAt:", record.createdAt);
      tableHtml += "<tr>";
      columns.map((column, index) => {
        //Formatting custom columns cells
        if (columns[index].key === "status") {
          let mode = parseInt(1
            //loadItemFromSessionStorage("app-mode").value
          );
          if (mode === 0) {
            if (record.status === 1) {
              return (tableHtml +=
                "<td> <span><span >A Traiter</span></span></td>");
            }
            if (record.status === 2) {
              return (tableHtml +=
                "<td><span><span >Traitée</span></span></td>");
            }
            if (record.status === 6) {
              return (tableHtml +=
                "<td>" +
                (record.appraisal
                  ? "<span ><span>Satisfait</span></span>"
                  : "<span ><span>Non satisfait</span></span>") +
                "</td>");
            }
            if (record.status === 7) {
              return (tableHtml +=
                "<td><span><span>Contentieux</span></span></td>");
            }
          }
          if (mode === 1) {
            if (record.status === 1) {
              return (tableHtml +=
                "<td><span ><span>Enregistrée</span></span></td>");
            }
            if (record.status === 2) {
              return (tableHtml +=
                "<td><span ><span>Affectée</span></span></td>");
            }
            if (record.status === 3) {
              return (tableHtml +=
                "<td><span ><span>A approuver</span></span></td>");
            }
            if (record.status === 4) {
              return (tableHtml +=
                "<td><span ><span>Désapprouvée</span></span></td>");
            }
            if (record.status === 5) {
              return (tableHtml +=
                "<td><span><span>Résolue</span></span></td>");
            }
            if (record.status === 6) {
              return (tableHtml +=
                "<td>" +
                (record.appraisal
                  ? "<span><span>Satisfait</span></span>"
                  : "<span><span>Non satisfait</span></span>") +
                "</td>");
            }
            if (record.status === 7) {
              return (tableHtml +=
                "<td><span><span>Contentieux</span></span></td>");
            }
          }
        }
        if (columns[index].key === "createdAt") {
          let createdAt = new Intl.DateTimeFormat("fr-FR", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          }).format(new Date(record.createdAt));
          return (tableHtml += "<td>" + createdAt + "</td>");
        }
        if (columns[index].key === "client") {
          return (tableHtml +=
            "<td>" + record.firstname + " " + record.lastname + "</td>");
        }
        if (columns[index].key === "base") {
          let baseValue =
            record.base === 1 || record.base === "1" ? "Oui" : "Non";
          return (tableHtml += "<td>" + baseValue + "</td>");
        }
        if (without.includes(column.text)) {
          return (tableHtml += "")
        }
        return (tableHtml += "<td>" + record[columns[index].key] + "</td>");
      });
      tableHtml += "</tr>";
      return tableHtml;
    });

    tableHtml += "</tbody>";
    tableHtml += "<tfoot>";
    tableHtml += "<tr style='font-weight: bold'>";
    columns.map((column) => {
      if (without.includes(column.text)) {
        return (tableHtml += "")
      }
      return (tableHtml += "<td>" + column.text + "</td>");
    });
    tableHtml += "</tr>";
    tableHtml += "</tfoot>";
    tableHtml += "</table>";

    return tableHtml;
  } catch (e) { }
};
const resetColumns = (columns, hook) => {
  console.debug(columns);
  if (hook === 1) {
    columns.splice(1, 1);
  }
  console.debug(columns);
};

export const handlePrint = (config, exportColumns, records, hook, without = []) => {
  //Supprimer la colonne actions uniquement pour l'impression
  let columns = exportColumns.filter(
    col => col.key !== "action"
  );
  if (hook === 1) {
    columns.splice(1, 0, {
      key: "subject",
      text: "Objet",
      className: "subject",
      align: "left",
      sortable: true,
    });
  }
  const prepareRecordsForPrint = (records, columns, without = []) => {
    return records.map(record => {
      const newRecord = { ...record };

      columns.forEach(col => {
        if (without.includes(col.key)) return;

        let value = record[col.key];

        // Si la valeur est un objet
        if (typeof value === "object" && value !== null) {
          newRecord[col.key] = value.libelle ?? value.name ?? "-";
        }
        // Si la valeur est une string avec des sauts de ligne
        else if (typeof value === "string") {
          newRecord[col.key] = value.replace(/\n/g, "<br />");
        }
        // Sinon on garde la valeur telle quelle
      });

      return newRecord;
    });
  };

  const printableRecords = prepareRecordsForPrint(records, columns, []);




  try {
  } catch (e) { }
  const childWindow = window.open("", "modal");
  let style = "<style>";
  style = style + "table {width: 100%;font: 17px Calibri;}";
  style =
    style + "table, th, td {border: solid 1px #DDD; border-collapse: collapse;";
  style = style + "padding: 2px 3px;text-align:left;}";
  style = style + "</style>";
  let tableHTML = getExportHtml(columns, printableRecords, without);
  childWindow.document.write(style);
  childWindow.document.write(
    '<h2 style="display:inline-block">' +
    config.filename +
    ' &nbsp;<h6 style="display:none"><a href="javascript:void" onclick="javascript:print();if(hook===1){\n' +
    '        columns.splice(1,1);}window.close()">Imprimer</a></h6></h2>'
  );
  childWindow.document.write(
    tableHTML +
    // "<br/>Imprimé avec GPR" +
    // "<br/>Outil développé par SICMa & Associés" +
    // '<br/>Email: info@sicmagroup.com'+
    '<script type="text/javascript">setTimeout(function() { window.print();window.close(); },500)</script>'
  );
  resetColumns(columns, hook);
};
export const getExportHtmlStatsTable = (columns, records) => {

  try {

    let tableHtml = "<table>";
    tableHtml += "<thead>";
    tableHtml += "<tr style='font-weight: bold'>";
    tableHtml += "<th>Libellé</th>";
    columns.map((column) => {
      return (tableHtml += "<th>" + column.text + "</th>");
    });
    tableHtml += "<th>Total</th>";
    tableHtml += "</tr>";

    tableHtml += "</thead>";
    tableHtml += "<tbody>";
    // console.log("-----Table before records------");

    //body here
    if (records !== undefined) {
      records.map((record) => {
        let item = "<tr>";
        item += "<td>" + record[0] + "</td>";
        item += record[1].map((month) => {
          return "<td>" + month + "</td>";
        });
        item += "<td>" + record[2] + "</td>";
        item += "</tr>";
        return (tableHtml += item);
      });
    }
    // console.log(tableHtml);
    // console.log("-----------------------");

    tableHtml += "</tbody>";
    tableHtml += "<tfoot>";
    tableHtml += "<tr style='font-weight: bold'>";
    columns.map((column) => {
      return (tableHtml += "<td>" + column.text + "</td>");
    });
    tableHtml += "</tr>";
    tableHtml += "</tfoot>";
    tableHtml += "</table>";

    return tableHtml;
  } catch (e) { }
};
export const getExportHtmlUser = (columns, records) => {
  try {
    let tableHtml = "<table>";
    tableHtml += "<thead>";
    tableHtml += "<tr style='font-weight: bold'>";
    columns.map((column) => {
      return (tableHtml += "<td>" + column.text + "</td>");
    });
    tableHtml += "</tr>";
    tableHtml += "</thead>";
    tableHtml += "<tbody>";

    records.map((record) => {
      tableHtml += "<tr>";
      columns.map((column, index) => {
        if (index === 0) {
          let role = "";
          if (record.roles !== undefined) {
            if (record.roles[0].role === "ADMIN") role = "Administrateur";
            if (record.roles[0].role === "PILOTE_PRINCIPAL")
              role = "Pilote principal";
            if (record.roles[0].role === "PILOTE_LOCAL") role = "Pilote local";
            if (record.roles[0].role === "HANDLER") role = "Traiteur";
            if (record.roles[0].role === "OPERATOR") role = "Operateur";
          }
          return (tableHtml +=
            "<td><span>" +
            record.firstname +
            " " +
            record.lastname +
            "</span> <br /><span>" +
            role +
            "</span>");
        }
        if (index === 1) {
          return (tableHtml +=
            "<td><span>" +
            record.email +
            "</span> <br /> <span>" +
            record.phone +
            "</span>");
        }
        if (columns[index].key === "createdAt") {
          let createdAt = new Intl.DateTimeFormat("fr-FR", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          }).format(new Date(record.createdAt));
          return (tableHtml += "<td>" + createdAt + "</td>");
        }
        return (tableHtml += "<td>" + record[columns[index].key] + "</td>");
      });
      tableHtml += "</tr>";
      return tableHtml;
    });

    tableHtml += "</tbody>";
    tableHtml += "<tfoot>";
    tableHtml += "<tr style='font-weight: bold'>";
    columns.map((column) => {
      return (tableHtml += "<td>" + column.text + "</td>");
    });
    tableHtml += "</tr>";
    tableHtml += "</tfoot>";
    tableHtml += "</table>";

    return tableHtml;
  } catch (e) { }
};
export const handlePrintUser = (config, columns, records) => {
  try {
    const childWindow = window.open("", "modal");
    let style = "<style>";
    style = style + "table {width: 100%;font: 17px Calibri;}";
    style =
      style +
      "table, th, td {border: solid 1px #DDD; border-collapse: collapse;";
    style = style + "padding: 2px 3px;text-align:left;}";
    style = style + "</style>";
    let tableHTML = getExportHtmlUser(columns, records);
    childWindow.document.write(style);
    childWindow.document.write(
      '<h2 style="display:inline-block">' +
      config.filename +
      ' &nbsp;<h6 style="display:none"><a href="javascript:void" onclick="javascript:print();window.close()">Imprimer</a></h6></h2>'
    );
    childWindow.document.write(
      tableHTML +
      // "<br/>Imprimé avec GPR" +
      // "<br/>Outil développé par SICMa & Associés" +
      // '<br/>Email: info@sicmagroup.com'+
      '<script type="text/javascript">setTimeout(function() { window.print();window.close(); },500)</script>'
    );
    // childWindow.document.write('<br/>Imprimé avec GPR')
    // childWindow.document.write('<br/>Outil développé par SICMa & Associés')
    // childWindow.document.write('<br/>Email: info@sicmagroup.com<script type="text/javascript">setTimeout(function() { window.print();window.close(); },500)</script>')
    // childWindow.document.write('<script type="text/javascript">\n' +
    //     '      setTimeout(function() { window.print();window.close(); },500)\n' +
    //     ' </script>')
  } catch (e) { }
};

function ready(callback) {
  // in case the document is already rendered
  if (document.readyState != "loading") callback();
  // modern browsers
  else if (document.addEventListener)
    document.addEventListener("DOMContentLoaded", callback);
  // IE <= 8
  else
    document.attachEvent("onreadystatechange", function () {
      if (document.readyState == "complete") callback();
    });
}

export const handlePrint2 = (config, exportColumns, records, hook) => {
  let columns = exportColumns.filter(
    col => col.key !== "action"
  );
  if (hook === 1) {
    columns.splice(1, 0, {
      key: "subject",
      text: "Objet",
      className: "subject",
      align: "left",
      sortable: true,
    });
  }

  let image = '<img src="' + INSTITUTION_LOGO + '" alt="logo" style=" width: "200px",height: "90px" " className=" report-logo"/>';
  let entete = '<div className="row" id="enteteRapport" style="margin-bottom:50px!important">';
  entete += '<div className="col l2 s3 m3" style="margin-bottom:20px!important">' + image + '</div>';
  entete += '<div className="col l8 s7 m7"><b>' + INSTITUTION_NAME + '</b><br /><i><span>Numéro Agrément: </span>' + INSTITUTION_AGREMENT + '</i><br /><i><span>Addrese: </span>' + INSTITUTION_ADDRESS + '</i><br /><i><span>Tel: </span>' + INSTITUTION_TEL + '</i><br /><i><span>Email: </span>' + INSTITUTION_EMAIL + '</i></div></div>';


  const childWindow = window.open("", "modal");
  let style = "<style>";
  style = style + "table {width: 100%;font: 17px Calibri;}";
  style =
    style + "table, th, td {border: solid 1px #DDD; border-collapse: collapse;";
  style = style + "padding: 2px 3px;text-align:left;}";
  style = style + "</style>";
  let tableHTML = getExportHtml2(columns, records, hook);
  childWindow.document.write(style);
  childWindow.document.write(entete +
    '<h2 style="display:inline-block">' +
    config.filename +
    ' &nbsp;<h6 style="display:none"><a href="javascript:void" onclick="javascript:print();if(hook===1){\n' +
    '        columns.splice(1,1);}window.close()">Imprimer</a></h6></h2>'
  );


  childWindow.document.write(
    tableHTML
    +
    // "<br/>Imprimé avec GPR" +
    // "<br/>Outil développé par SICMa & Associés" +
    // '<br/>Email: info@sicmagroup.com
    '<script type="text/javascript">setTimeout(function() { window.print();window.close(); },500)</script>'
  );
  resetColumns(columns, hook);
};

const parseDate = (dateString) => {
  if (!dateString) return null;
  const [datePart] = dateString.split(" ");
  const [day, month, year] = datePart.split("-");
  return `${year}-${month}-${day}`;
};
const formatDate = (dateString) => {

  return dateString.split('T')[0];
};


const resetTime = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const handlePrint22 = (config, columns, records, startDate, endDate, hook) => {

  const filteredRecords = records.filter(record => {
    const recordDate = resetTime(new Date(parseDate(record.receiptDateTime)));
    return recordDate >= resetTime(new Date(startDate)) && recordDate <= resetTime(new Date(endDate));
  });
  if (filteredRecords.length === 0) {
    alert("Aucune donnée trouvée pour la période spécifiée.");
    return;
  }


  if (hook === 1) {
    columns.splice(1, 0, {
      key: "subject",
      text: "Objet",
      className: "subject",
      align: "left",
      sortable: true,
    });
  }

  let image = `<img src="${INSTITUTION_LOGO}" alt="logo" style="width:200px;height:90px;" class="report-logo"/>`;
  let entete = `<div class="row" id="enteteRapport" style="margin-bottom:50px!important;">
                  <div class="col l2 s3 m3" style="margin-bottom:20px!important;">${image}</div>
                  <div class="col l8 s7 m7">
                    <b>${INSTITUTION_NAME}</b><br />
                    <i><span>Numéro Agrément: </span>${INSTITUTION_AGREMENT}</i><br />
                    <i><span>Adresse: </span>${INSTITUTION_ADDRESS}</i><br />
                    <i><span>Tel: </span>${INSTITUTION_TEL}</i><br />
                    <i><span>Email: </span>${INSTITUTION_EMAIL}</i>
                  </div>
                </div>`;


  const childWindow = window.open("", "modal");

  let style = `<style>
                  table { width: 100%; font: 17px Calibri; }
                  table, th, td { border: solid 1px #DDD; border-collapse: collapse; padding: 2px 3px; text-align: left; }
               </style>`;

  let tableHTML = getExportHtml2(columns, filteredRecords, hook);

  childWindow.document.write(style);
  childWindow.document.write(entete + `
    <h2 style="display:inline-block;">
      ${config.filename} (Période : ${startDate} à ${endDate})
      <h6 style="display:none;">
        <a href="javascript:void(0)" onclick="print(); if(${hook} === 1){ columns.splice(1,1); } window.close();">Imprimer</a>
      </h6>
    </h2>
  `);

  childWindow.document.write(
    tableHTML +
    "<br/>Imprimé avec GPR" +
    "<br/>Outil développé par SICMa & Associés" +
    "<br/>Email: info@sicmagroup.com" +
    `<script type="text/javascript">
       setTimeout(function() { window.print(); window.close(); }, 1000);
     </script>`
  );
  resetColumns(columns, hook);
};


export const getExportHtml2 = (columns, records, id = "") => {
  try {
    let tableHtml = "<table class='" + id + "'>";
    tableHtml += "<thead>";
    tableHtml += "<tr style='font-weight: bold'>";
    columns.map((column) => {
      return (tableHtml += "<td>" + column + "</td>");
    });
    tableHtml += "</tr>";
    tableHtml += "</thead>";
    tableHtml += "<tbody>";

    records.map((record) => {
      tableHtml += "<tr>";
      columns.map((column, index) => {
        //Formatting custom columns cells
        if (column === "Status") {
          let statusElt;
          switch (record.status) {
            case "SAVED":
              statusElt = "Enregistrée"
              break;
            case "TEMP_SAVED":
              statusElt = "Sauvegardée"
              break;
            case "AFFECTED":
              statusElt = "Affectée"
              break;
            case "TO_APPROUVED":
              statusElt = "A approuver"
              break;
            case "DESAPPROUVED":
              statusElt = "Désapprouvée"
              break;
            case "TREAT":
              statusElt = "Traitée"
              break;
            case "SATISFIED":
              statusElt = "Satisfait"
              break;
            case "UNSATISFIED":
              statusElt = "Non satisfait"
              break;
            case "PARTIAL_SATISFIED":
              statusElt = "Partiellement satisfait"
              break;
            case "LITIGATION":
              statusElt = "Contentieux"
              break;
            case "CLASSED":
              statusElt = "Classée"
              break;

            default:
              statusElt = ""
              break;
          }
          return (tableHtml += "<td>" + statusElt + "</td>");
        }
        if (column === "Enregistrer le") {
          let createdAt = new Intl.DateTimeFormat("fr-FR", {
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "numeric",
            minute: "numeric"
          }).format(new Date(record.createdAt));
          return (tableHtml += "<td>" + createdAt + "</td>");
        }
        if (column === "Client") {
          return (tableHtml +=
            "<td>" + record.clientFirstAndLastName + "</td>");
        }
        if (column === "Telephone") {
          let telephone = record.id ? record.tel === null ? "-" : record.tel : record.phone;
          return (tableHtml += "<td>" + telephone + "</td>");
        }
        if (column === "Code Client") {
          let codeClient = record.id ? record.codeClient === null ? "-" : record.codeClient : record.codeClient;
          return (tableHtml += "<td>" + codeClient + "</td>");
        }

        if (column === "Code") {
          return (tableHtml += "<td>" + record.code + "</td>");
        }
        if (column === "Traiter par") {
          let name = (record.id && record.collectionChannel) ?
            record.treatBy === null
              ? "-"
              : record.treatBy.firstAndLastName : "-";
          return (tableHtml += "<td>" + name + "</td>");
        }
        if (column == "Solution") {
          let solution = (record.id && record.collectionChannel) ? (record.solutionDtos).length === 0 ? "-" : (record.solutionDtos)[0].content : "-";
          return (tableHtml += "<td>" + solution + "</td>");
        }
        if (column == "Moyens de collecte") {
          let description1 = record.collectionChannelId ? (loadItemFromSessionStorage('app-supports')).filter((e) => { return e.id === record.collectionChannelId }) : ""
          let scTemp = mode === 1 ? record.collectionChannel.libelle : (record.id && record.collectionChannel) ? record.collectionChannel.libelle : description1[0].libelle;

          return (tableHtml += "<td>" + scTemp + "</td>");
        }
        if (column == "Point de service") {
          let description4 = record.servicePointId ? (loadItemFromSessionStorage('app-ps')).filter((e) => { return e.id === record.servicePointId }) : ""
          let psTemp = mode === 1 ? record.servicePoint.libelle : (record.id && record.collectionChannel) ? record.servicePoint.libelle : description4[0].libelle;

          return (tableHtml += "<td>" + psTemp + "</td>");
        }
        if (column == "Produit") {
          let description3 = record.productId ? (loadItemFromSessionStorage('app-produits')).filter((e) => { return e.id === record.productId }) : ""
          let produitTemp = mode === 1 ? record.product.libelle : (record.id && record.collectionChannel) ? record.product.libelle : description3[0].libelle;

          return (tableHtml += "<td>" + produitTemp + "</td>");
        }
        if (column == "Objet") {
          let description2 = record.objetId ? (loadItemFromSessionStorage('app-objets')).filter((e) => { return e.id === record.objetId }) : ""
          let objetTemp = mode === 1 ? record.objet.libelle : (record.id && record.collectionChannel) ? record.objet.libelle : description2[0].libelle;
          return (tableHtml += "<td>" + objetTemp + "</td>");
        }
        if (column == "Enregistrer par") {
          let description5 = record.collectorId ? (loadItemFromSessionStorage('app-users')).filter((e) => { return e.id === record.collectorId }) : ""
          let addByTemp = mode === 1 ? record.collector.firstAndLastName : (record.id && record.collectionChannel) ? record.collector.firstAndLastName : description5[0].firstAndLastName;
          return (tableHtml +=
            "<td>" +
            addByTemp +
            "</td>");
        }
      });
      tableHtml += "</tr>";
      return tableHtml;
    });

    tableHtml += "</tbody>";
    tableHtml += "<tfoot>";
    tableHtml += "<tr style='font-weight: bold'>";
    columns.map((column) => {
      return (tableHtml += "<td>" + column + "</td>");
    });
    tableHtml += "</tr>";
    tableHtml += "</tfoot>";
    tableHtml += "</table>";

    return tableHtml;
  } catch (e) { }
};

// export const handlePrintAvance = (childWindow, dom) => {
//   if (!childWindow || childWindow.closed) {
//     console.error("Fenêtre d'impression indisponible");
//     return;
//   }

//   const doc = childWindow.document;
//   doc.open();
//   doc.write(`
//     <html>
//       <head>
//         <title>Impression</title>
//       </head>
//       <body>
//         ${dom}
//         <script>
//           setTimeout(function () {
//             window.print();
//             window.close();
//           }, 500);
//         </script>
//       </body>
//     </html>
//   `);
//   doc.close();
// };

export const handlePrintAvance = (childWindow, dom) => {
  if (!childWindow || childWindow.closed) {
    console.error("Fenêtre d'impression indisponible");
    return;
  }

  const doc = childWindow.document;
  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Impression</title>
        <style>
          @page { margin: 15mm 10mm; }
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1E293B; margin: 0; padding: 20px; }
          img {
            max-width: 100% !important;
            height: auto !important;
            display: block;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          div {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th, td { border: 1px solid #E2E8F0; padding: 6px 10px; font-size: 11px; }
          th { background: #F8FAFC; font-weight: 700; }
          tr:nth-child(even) { background: #F8FAFC; }
        </style>
      </head>
      <body>
        ${dom}
        <script>
          window.onload = function () {
            setTimeout(function () {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  doc.close();
};


export const handlePrint3 = (config, columns, records) => {

  let image = '<img src="' + INSTITUTION_LOGO + '" alt="logo" style=" width: "200px",height: "90px" " className=" report-logo"/>';
  let entete = '<div className="row" id="enteteRapport" style="margin-bottom:50px!important">';
  entete += '<div className="col l2 s3 m3" style="margin-bottom:20px!important">' + image + '</div>';
  entete += '<div className="col l8 s7 m7"><b>' + INSTITUTION_NAME + '</b><br /><i><span>Numéro Agrément: </span>' + INSTITUTION_AGREMENT + '</i><br /><i><span>Addrese: </span>' + INSTITUTION_ADDRESS + '</i><br /><i><span>Tel: </span>' + INSTITUTION_TEL + '</i><br /><i><span>Email: </span>' + INSTITUTION_EMAIL + '</i></div></div>';


  const childWindow = window.open("", "modal");
  let style = "<style>";
  style = style + "table {width: 100%;font: 17px Calibri;}";
  style =
    style + "table, th, td {border: solid 1px #DDD; border-collapse: collapse;";
  style = style + "padding: 2px 3px;text-align:left;}";
  style = style + "</style>";
  let tableHTML = getExportHtml3(columns, records);
  childWindow.document.write(style);
  childWindow.document.write(entete +
    '<h2 style="display:inline-block">' +
    config.filename +
    ' &nbsp;<h6 style="display:none"><a href="javascript:void" onclick="javascript:print();if(hook===1){\n' +
    '        columns.splice(1,1);}window.close()">Imprimer</a></h6></h2>'
  );
  childWindow.document.write(
    tableHTML
    +
    // "<br/>Imprimé avec GPR" +
    // "<br/>Outil développé par SICMa & Associés" +
    // '<br/>Email: info@sicmagroup.com
    '<script type="text/javascript">setTimeout(function() { window.print();window.close(); },500)</script>'
  );
  resetColumns(columns);
};

export const handlePrint33 = (config, columns, records, startDate, endDate, hook) => {

  let image = '<img src="' + INSTITUTION_LOGO + '" alt="logo" style=" width: "200px",height: "90px" " className=" report-logo"/>';
  let entete = '<div className="row" id="enteteRapport" style="margin-bottom:50px!important">';
  entete += '<div className="col l2 s3 m3" style="margin-bottom:20px!important">' + image + '</div>';
  entete += '<div className="col l8 s7 m7"><b>' + INSTITUTION_NAME + '</b><br /><i><span>Numéro Agrément: </span>' + INSTITUTION_AGREMENT + '</i><br /><i><span>Addrese: </span>' + INSTITUTION_ADDRESS + '</i><br /><i><span>Tel: </span>' + INSTITUTION_TEL + '</i><br /><i><span>Email: </span>' + INSTITUTION_EMAIL + '</i></div></div>';

  const filteredRecords = records.filter(record => {
    const [datePart, timePart] = record.receiptDateTime.split(" ");
    const [day, month, year] = datePart.split("-");
    const recordDate = resetTime(new Date(`${year}-${month}-${day}T${timePart}`));

    return recordDate >= resetTime(new Date(startDate)) && recordDate <= resetTime(new Date(endDate));
  });
  // console.log("filteredRecords", records)
  if (filteredRecords.length === 0) {
    alert("Aucune donnée trouvée pour la période spécifiée.");
    return;
  }

  const childWindow = window.open("", "modal");
  let style = "<style>";
  style = style + "table {width: 100%;font: 17px Calibri;}";
  style =
    style + "table, th, td {border: solid 1px #DDD; border-collapse: collapse;";
  style = style + "padding: 2px 3px;text-align:left;}";
  style = style + "</style>";
  let tableHTML = getExportHtml3(columns, filteredRecords);
  childWindow.document.write(style);
  childWindow.document.write(entete + `
    <h2 style="display:inline-block;">
      ${config.filename} (Période : ${startDate} à ${endDate})
      <h6 style="display:none;">
        <a href="javascript:void(0)" onclick="print(); if(${hook} === 1){ columns.splice(1,1); } window.close();">Imprimer</a>
      </h6>
    </h2>
  `);

  childWindow.document.write(
    tableHTML
    +
    // "<br/>Imprimé avec GPR" +
    // "<br/>Outil développé par SICMa & Associés" +
    // '<br/>Email: info@sicmagroup.com
    '<script type="text/javascript">setTimeout(function() { window.print();window.close(); },500)</script>'
  );
  resetColumns(columns);
};
export const getExportHtml3 = (columns, records, id = "") => {
  try {
    // console.log(columns);
    // console.log("recorsd",records);
    let tableHtml = "<table class='" + id + "'>";
    tableHtml += "<thead>";
    tableHtml += "<tr style='font-weight: bold'>";
    columns.map((column) => {
      return (tableHtml += "<td>" + column + "</td>");
    });
    tableHtml += "</tr>";
    tableHtml += "</thead>";
    tableHtml += "<tbody>";

    records.map((record) => {
      tableHtml += "<tr>";
      columns.map((column, index) => {
        //Formatting custom columns cells
        if (column === "Status") {
          let statusElt;
          switch (record.status) {
            case "SAVED":
              statusElt = "Enregistrée";
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
          return (tableHtml += "<td>" + statusElt + "</td>");
        }
        if (column === "Enregistrer le") {
          let createdAt = new Intl.DateTimeFormat("fr-FR", {
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "numeric",
            minute: "numeric"
          }).format(new Date(record.createdAt));
          return (tableHtml += "<td>" + createdAt + "</td>");
        }
        if (column === "Client") {
          let nom = record.clientFirstAndLastName !== "" ? record.clientFirstAndLastName : "<i>Anonyme</i>"
          return (tableHtml +=
            "<td>" + nom + "</td>");
        }
        if (column === "Telephone") {
          let telephone = record.id ? record.tel === null ? "-" : record.tel : record.phone;
          return (tableHtml += "<td>" + telephone + "</td>");
        }

        if (column === "Code Client") {
          let codeClient = record.id ? record.codeClient === null ? "-" : record.codeClient : record.codeClient;
          return (tableHtml += "<td>" + codeClient + "</td>");
        }

        if (column === "Code") {
          let code = record.code === "" ? "<i>-</i>" : record.code;
          return (tableHtml += "<td>" + code + "</td>");
        }
        if (column === "Traiter par") {
          let name;

          if (record.status === "TREAT") {
            name = (record.id && record.canal) ? record.traiteur === null ? "-" : record.traiteur.firstAndLastName : "-";
          } else {
            name = "-"
          }

          return (tableHtml += "<td>" + name + "</td>");
        }
        if (column == "Decision") {
          let decision;
          if (record.status === "TREAT") {
            // console.log("azert",record)
            decision = record.accepted === true ? "Pris en compte" : "Non pris en compte";
          } else {
            decision = "-"
          }

          return (tableHtml += "<td>" + decision + "</td>");
        }
        if (column == "Moyens de collecte") {
          let description1 = record.collectionChannelId ? (loadItemFromSessionStorage('app-supports')).filter((e) => { return e.id === record.collectionChannelId }) : ""
          let canal = mode === 1 ? (record.canal === null ? "<i>-</i>" : record.canal.libelle) : (record.id && record.canal) ? (record.canal === null ? "<i>-</i>" : record.canal.libelle) : description1[0].libelle;

          return (tableHtml += "<td>" + canal + "</td>");
        }
        if (column == "Point de service") {
          let description4 = record.servicePointId ? (loadItemFromSessionStorage('app-ps')).filter((e) => { return e.id === record.servicePointId }) : ""

          let ps = mode === 1 ? (record.serviceIndexe === null ? "<i>-</i>" : record.serviceIndexe.libelle) : (record.id && record.canal) ? (record.serviceIndexe === null ? "<i>-</i>" : record.serviceIndexe.libelle) : (description4 !== "") ? description4[0].libelle : "";

          return (tableHtml += "<td>" + ps + "</td>");
        }
        if (column == "Produit") {
          let description3 = record.productId ? (loadItemFromSessionStorage('app-produits')).filter((e) => { return e.id === record.productId }) : ""

          let produit = mode === 1 ? (record.produit === null ? "<i>-</i>" : record.produit.libelle) : (record.id && record.canal) ? (record.produit === null ? "<i>-</i>" : record.produit.libelle) : (description3 !== "") ? description3[0].libelle : "";

          return (tableHtml += "<td>" + produit + "</td>");
        }
        if (column == "Enregistrer par") {
          let description5 = record.collectorId ? (loadItemFromSessionStorage('app-users')).filter((e) => { return e.id === record.collectorId }) : ""
          let addByTemp = mode === 1 ? record.collecteur.firstAndLastName : (record.id && record.canal) ? record.collecteur.firstAndLastName : description5[0].firstAndLastName;
          return (tableHtml +=
            "<td>" +
            addByTemp +
            "</td>");
        }
      });
      tableHtml += "</tr>";
      return tableHtml;
    });

    tableHtml += "</tbody>";
    tableHtml += "<tfoot>";
    tableHtml += "<tr style='font-weight: bold'>";
    columns.map((column) => {
      return (tableHtml += "<td>" + column + "</td>");
    });
    tableHtml += "</tr>";
    tableHtml += "</tfoot>";
    tableHtml += "</table>";

    return tableHtml;
  } catch (e) { }
};