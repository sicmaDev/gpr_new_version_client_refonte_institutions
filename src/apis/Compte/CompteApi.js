import axios from "axios";
import { notify } from "../../Utils/alert"
import {saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { useHistory } from "react-router-dom";

const COMPTE_INFOS_API = HOST + "api/v1/auth/update"
const CHANGER_MDP_API = HOST + "api/v1/auth/update_pwd"


export const CompteInfosApi = (data, props,e) => {
    const config = {
        method: 'put',
        url: COMPTE_INFOS_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    axios(config)
        .then(function (response) {
          
            if (response.status) {
                notify("Bravo - Informations du compte changé", "success");
                e.preventDefault();
                saveItemToSessionStorage(0, 'logged')
                sessionStorage.clear();
                window.location.href="/"
            } else {
                notify("Erreur", "error");
                
            }
            props.etatChanged(false)
        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - Une erreur est survenue", "error");
            // console.log("updatee",error)
        });
}

export const ChangerMdpApi = (data, props,e) => {
    const config = {
        method: 'put',
        url: CHANGER_MDP_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    axios(config)
        .then(function (response) {
            // console.log("responseeeeemdp",response)
            if (response.status) {
                notify("Bravo - Mot de passe changé", "success");
                e.preventDefault();
                saveItemToSessionStorage(0, 'logged')
                sessionStorage.clear();
                window.location.href="/"
            } else {
                notify("Ancien mot de passe incorrect", "error");
                
            }
           
            // console.log(JSON.parse(response.data.data));
            props.etatChanged(false)
        })
        .catch(function (error) {
            props.etatChanged(false)
            notify(error.response.data.content.message, "error");
            // console.log("responseeeeemdp",error.response.data.content.message)
        });
}


