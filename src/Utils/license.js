import { licenseInfo } from "../apis/LoginApi";
import { loadItemFromSessionStorage } from "./utils";

export const isLicenseExpired = () => {
    let appLicenseData = loadItemFromSessionStorage("app-license") !== undefined ? loadItemFromSessionStorage("app-license"): undefined
    // console.log("isLicenseExpired");
    // console.log(typeof(appLicenseData));
    // console.log((appLicenseData));
    if(appLicenseData !==undefined && appLicenseData != "failed"){
        //  console.log("isLicenseExpired");
        return Math.floor((Date.now() - new Date(appLicenseData.createdAt)) / (1000 * 60 * 60 * 24)) >= parseInt(appLicenseData.activationRequest.split(",")[1].split(":")[0])
    }
    return false;
}

export const licenseControl = async () => {
    try {
        const resultat = await licenseInfo();
        console.log("actiffff",resultat)
        
        return resultat.actif;
    } catch (error) {
        console.error("Une erreur s'est produite :", error);
    }
    // let resultat = await licenseInfo();
    // console.log("actiffff",resultat)
   
}

export const isLicenseDays = () => {
    // console.log('run0')
    // console.log(licenseInfo());
    let appLicenseData =  loadItemFromSessionStorage("app-license")
    
    if( appLicenseData !== undefined && appLicenseData !== "failed"){
        // console.log('run1',appLicenseData)
        let activation = appLicenseData.activationRequest;
        // console.log(typeof(appLicenseData))
        // console.log(activation)
        let retenue = activation.split(',');
        let retenue1 = retenue[1].split(':');
        let durate = retenue1[0];

        let jours_restants = (durate)-Math.floor((Date.now() - new Date(appLicenseData.createdAt)) / (1000 * 60 * 60 * 24));
        
        let jours_de_decompte = durate-Math.ceil((durate*75)/100);
        // console.log('jr',jours_restants)
        // console.log('jd',jours_de_decompte)
        if (jours_restants <= jours_de_decompte) {
            // console.log('run2')
            jours_restants = jours_restants;
        }else{
            // console.log('run3')
            jours_restants = "nothing";
        }
      
        return jours_restants;
    } else {
        return "nothing"
    }
}