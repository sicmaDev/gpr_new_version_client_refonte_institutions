import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// ADD
const ADD_SETTING_API = HOST + "api/v1/config/setting/others/bot/create"
const API_BOT_URL = "https://wppsicma.gprserver.com:8081/api/session/start-session"
const API_BOT_TOKEN_URL = "https://wppsicma.gprserver.com:8081/api/TESTBOT/MYSECRETKEY/generate-token"


const API_API_KEY_LIST = HOST+"api/v1/config/setting/key"
const API_API_KEY_GENERATE = HOST+"api/v1/config/setting/key/generate"
const API_API_KEY_REGENERATE = HOST+"api/v1/config/setting/key/generate/{id}"
const API_API_KEY_DELETE = HOST+"api/v1/config/setting/key/{id}/delete"
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
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-bot")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-bot")

            props.etatChanged(false)
           
            // liste(props)
            notify("Bravo - Bot Configurée", "success");

        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - Veuillez réessayer!", "error");
        });

}

export const genererToken = async (props) => {
    // console.log("response token api")
    const config = {
        method: 'post',
        url: API_BOT_TOKEN_URL,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    };

    await axios(config)
        .then(function (response) {
           
            props.etat1Changed(false)
            // console.log("response token",response)
            generer(response.data.token,response.data.session,props);
            // notify("Bravo - Code généré", "success");

        })
        .catch(function (error) {
            props.etat1Changed(false)
            // console.log("response token error",error)
            notify("Erreur - Veuillez réessayer!", "error");
        });

}

export const generer = async (token,session,props) => {

    const config = {
        method: 'post',
        url: API_BOT_URL.replace("session",session),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token
        },
        // data: data
    };

    await axios(config)
        .then(function (response) {
           
            props.etat1Changed(false)
            // console.log("code genere",response.data.urlcode);
            props.qrcodeChanged(response.data.qrcode);
            // liste(props)
            notify("Bravo - Code généré", "success");

        })
        .catch(function (error) {
            props.etat1Changed(false)
            // console.log("code genere error",error)
            notify("Erreur - Veuillez réessayer!", "error");
        });

}

export const apiKeyTokenGenerator = (data)=>{
    const config = {
        method: 'post',
        url: API_API_KEY_GENERATE,
        data,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        // data: data
    };
    return axios(config)
}
export const apiKeyTokenReGenerator = (id)=>{
    const config = {
        method: 'put',
        url: API_API_KEY_REGENERATE.replace("{id}",id),
        data:null,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        // data: data
    };
    return axios(config)
}
export const apiKeyTokenDelete = (id)=>{
    const config = {
        method: 'delete',
        url: API_API_KEY_DELETE.replace("{id}",id),
        data:null,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        // data: data
    };
    return axios(config)
}
export const apiKeyTokens = ()=>{
    const config = {
        method: 'get',
        url: API_API_KEY_LIST,
        data:null,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        // data: data
    };
    return axios(config)
}

