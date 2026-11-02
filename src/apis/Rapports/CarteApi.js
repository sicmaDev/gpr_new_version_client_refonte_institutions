import axios from "axios";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// Cartographie du rapport Global : chiffres agrégés par agence, dans le périmètre de l'utilisateur.
// filtres : le même objet que pour /report/filtered, ou null quand le rapport est ouvert sans filtre.
const REPORT_CARTE_API = HOST + "api/v1/report/carte";
const LOCALISATION_API = HOST + "api/v1/config/service_point_localisation";

const entetes = () => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: "Bearer " + loadItemFromSessionStorage("token"),
});

export const carteRapportApi = (filtres) =>
  axios({ method: "post", url: REPORT_CARTE_API, headers: entetes(), data: filtres || null }).then((r) => r.data);

export const localisationsPointsServiceApi = () =>
  axios({ method: "get", url: LOCALISATION_API + "/list", headers: entetes() }).then((r) => r.data);

export const enregistrerLocalisationApi = (id, localisation) =>
  axios({ method: "put", url: LOCALISATION_API + "/" + id, headers: entetes(), data: localisation }).then((r) => r.data);
