import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromLocalStorage, loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// ADD
const ADD_SETTING_API = HOST + "api/v1/config/setting/others/institution/create"
const CREATE_LICENSE_API = "https://gpradmin.sicmagroup.com/api/addLicenseWeb"

export const ajout = async (data, props) => {

    const config = {
        method: 'post',
        url: ADD_SETTING_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };

    await axios(config)
        .then(function (response) {
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-institution")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-institution")
            
            props.etatChanged(false)

            //la license
            let infosLicense = {};
            infosLicense["denomination"] =data.denomination ;
            infosLicense["email"] = data.email ;
            infosLicense["contact"] = data.tel ;

            let appInstitution =  loadItemFromLocalStorage("app-institution") !== undefined ? JSON.parse(loadItemFromLocalStorage("app-institution")) : undefined;
            if (appInstitution === undefined || appInstitution === "") {
                createLicense(infosLicense,props);
            }

           
           
            // liste(props)
            notify("Bravo - Institution Configurée", "success");

        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - Veuillez réessayer!", "error");
        });

}

export const createLicense = async (data, props) => {
    // console.log("infos",data)

    const config = {
        method: 'post',
        url: CREATE_LICENSE_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            // 'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };

    await axios(config)
        .then(function (response) {
            console.log("responsegpradmin",response.data.data);
            let reponse = response.data.data;

            let finResultat = {
                "createdAt" : resultat.createdAt,
                "serial" : resultat.serial,
                "company" : resultat.clients[0].company,
                "activationRequest" : resultat.clients[0].activationRequest,
                "id" : resultat.id,
                "fullname" : resultat.clients[0].fullname,
                "email" : resultat.clients[0].email,
                "updatedAt" : resultat.updatedAt

            }
            // saveItemToSessionStorage(JSON.stringify(response.data.content), "app-institution")
            // saveItemToLocalStorage(JSON.stringify(response.data.content), "app-institution")

            // props.etatChanged(false)
           
            // // liste(props)
            // notify("Bravo - Institution Configurée", "success");

        })
        .catch(function (error) {
            // props.etatChanged(false)
            console.log("responsegpradmineror",error);
            notify("Erreur - Veuillez réessayer!", "error");
        });

}

