import { loadItemFromLocalStorage } from "./utils";

let appInstitution = loadItemFromLocalStorage("app-institution") !== undefined && (loadItemFromLocalStorage("app-institution").length !==0)  ? loadItemFromLocalStorage("app-institution") : undefined;

// L'institution peut avoir été enregistrée sérialisée deux fois : on obtient alors une chaîne JSON, pas un objet.
// Sans ce décodage, tous les champs (nom, pays, adresse…) valent undefined.
if (typeof appInstitution === "string") {
  try { appInstitution = JSON.parse(appInstitution) } catch (e) { appInstitution = undefined }
}

// Champ de l'institution, "" (ou valeur par défaut) si absent ou nul : évite d'imprimer "undefined" dans les entêtes.
const institutionField = (field, fallback = "") =>
  appInstitution !== undefined && appInstitution[field] != null ? appInstitution[field] : fallback

export const MAX_SUBJECT_DURATION = 30
export const INSTITUTION_LOGO = institutionField("logo")
export const INSTITUTION_NAME = institutionField("denomination")
export const INSTITUTION_ADDRESS = institutionField("adresse")
export const INSTITUTION_TEL = institutionField("tel")
export const INSTITUTION_AGREMENT = institutionField("numAgrement")
export const INSTITUTION_EMAIL = institutionField("email")
export const INSTITUTION_PAYS = institutionField("pays")
export const INSTITUTION_PAYS_CODE = institutionField("paysCode", "BJ")
export const LOGO_SUPPORTED_SIZE = "167x62, 272x204, 256x256"
export const HOST = hostEval()
export const REPORT_HOST = reportHost()
export const APP_OWNER = "SICMA ET ASSOCIES"
export const APP_OWNER_WEBSITE = "https://sicmagroup.com"
export const PROD_SERVER = "https://test-gpr-sicma.sicmagroup.com"  //"http://127.0.0.1:3000"    
function hostEval(){ 
    return   "http://localhost:8080/" //"https://api.gprsicma.gprserver.com/"   //"https://gprserver.com:9195/"  //"https://gprserver.com:9195/"  // "https://89.117.37.251:9195/"//  "http://192.168.100.6:8080/"  //  //"https://gprserver.com:9195/"
  
}
function reportHost(){
    // return "http://127.0.0.1:5000/"
    // return "https://api.rapport.gprserver.com:8081/"
    return "https://api.rapport.gprserver.com/"
}

// Le navigateur ne parle plus jamais directement au microservice Node.js WhatsApp :
// tous les appels (QR, statut, envoi, médias, SSE) passent par le proxy authentifié
// Spring Boot /api/whatgpr/** (voir src/whatgpr/api.js). Node n'est joignable que
// depuis le serveur Spring Boot lui-même (whatgpr.node.url dans application.properties).

export const LOCKSCREEN_TIMEOUT = 300000; //5min



