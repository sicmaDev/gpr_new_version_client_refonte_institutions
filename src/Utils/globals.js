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
export const REPORT_HOST = reportHost()
export const APP_OWNER = "SICMA ET ASSOCIES"
export const APP_OWNER_WEBSITE = "https://sicmagroup.com"
export const PROD_SERVER = "https://test-gpr-sicma.sicmagroup.com"  //"http://127.0.0.1:3000"    
function hostEval(){ 
    return   "http://localhost:8080/" //"https://api.gprsicma.gprserver.com/"   //"https://gprserver.com:9195/"  //"https://gprserver.com:9195/"  // "https://89.117.37.251:9195/"//  "http://192.168.100.6:8080/"  //  //"https://gprserver.com:9195/"
  
}
function reportHost(){
    // return "http://127.0.0.1:5000/"
    // return "https://gpr-rapport-excel-python-script.onrender.com/"
    // return "https://api.rapport.gprserver.com:8081/"
    return "https://api.rapport.gprserver.com/"
}

export const LOCKSCREEN_TIMEOUT = 300000; //5min
export const WPP_CONNECT_IS_DEV = true;
export const  WPP_CONNECT_TOKEN = "THISISMYSECURETOKEN"
export const  WPP_CONNECT_OPTIONS = {waitQrCode:true,webhook:HOST+"api/v1/webhook/save"}
// export const WPP_CONNECT_LINK =!WPP_CONNECT_IS_DEV?"https://gpr-rapport-excel-python-script.onrender.com/api" :"https://wppsicma.gprserver.com:8081/api"
export const WPP_CONNECT_LINK =!WPP_CONNECT_IS_DEV?"https://gpr-rapport-excel-python-script.onrender.com/api" :"http://185.170.58.144:21465/api"



