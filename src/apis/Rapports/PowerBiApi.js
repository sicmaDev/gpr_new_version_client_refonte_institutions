import axios from "axios";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// Export Power BI du rapport Global : le serveur recalcule les chiffres (même rapport, même périmètre) et renvoie
// un fichier .pbit autonome. La page n'envoie que ce qui décide de l'affichage (filtre, onglets, modèle, couleurs).
const REPORT_POWERBI_API = HOST + "api/v1/report/powerbi";

export const exportPowerBiApi = (demande) =>
  axios({
    method: "post",
    url: REPORT_POWERBI_API,
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + loadItemFromSessionStorage("token") },
    data: demande,
    responseType: "blob",
  }).then((r) => r.data);
