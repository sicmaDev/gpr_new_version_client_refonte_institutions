import { loadItemFromLocalStorage } from "./utils";

let appInstitution = loadItemFromLocalStorage("app-institution") !== undefined && (loadItemFromLocalStorage("app-institution").length !==0)  ? JSON.parse(loadItemFromLocalStorage("app-institution")) : undefined;
           
export const MAX_SUBJECT_DURATION = 30
export const INSTITUTION_LOGO = appInstitution !== undefined ? appInstitution.logo : ""
export const INSTITUTION_NAME = appInstitution !== undefined ? appInstitution.denomination : ""
export const INSTITUTION_ADDRESS = appInstitution !== undefined ? appInstitution.adresse : ""
export const INSTITUTION_TEL = appInstitution !== undefined ? appInstitution.tel : ""
export const INSTITUTION_AGREMENT = appInstitution !== undefined ? appInstitution.numAgrement : ""
export const INSTITUTION_EMAIL = appInstitution !== undefined ? appInstitution.email : ""
export const INSTITUTION_PAYS = appInstitution !== undefined ? appInstitution.pays : ""
export const INSTITUTION_PAYS_CODE = appInstitution !== undefined ? appInstitution.paysCode : "BJ"
export const LOGO_SUPPORTED_SIZE = "167x62, 272x204, 256x256"
export const HOST = hostEval()
export const APP_OWNER = "SICMA ET ASSOCIES"
export const APP_OWNER_WEBSITE = "https://sicmagroup.com"
export const PROD_SERVER = "https://test-gpr-sicma.sicmagroup.com"  //"http://127.0.0.1:3000"    
function hostEval(){ 
    return "http://localhost:8080/"  //"https://gprserver.com:9195/"  //"https://gprserver.com:9195/"  // "https://89.117.37.251:9195/"//  "http://192.168.100.6:8080/"  //  //"https://gprserver.com:9195/"
  
}