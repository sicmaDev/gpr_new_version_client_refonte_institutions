import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
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
            // let infosLicense = {};
            // infosLicense["denomination"] =data.denonmination ;
            // infosLicense["email"] = data.email ;
            // infosLicense["phone"] = data.phone ;

            // createLicense(infosLicense,props);
           
            // liste(props)
            notify("Bravo - Institution Configurée", "success");

        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - Veuillez réessayer!", "error");
        });

}

export const createLicense = async (data, props) => {

    const config = {
        method: 'post',
        url: CREATE_LICENSE_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };

    await axios(config)
        .then(function (response) {
            console.log("responsegpradmin",response.data);
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

