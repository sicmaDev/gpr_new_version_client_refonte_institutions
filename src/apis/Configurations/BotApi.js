import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// ADD
const ADD_SETTING_API = HOST + "api/v1/config/setting/others/bot/create"
const API_BOT_URL = "http://localhost:21465/api/session/start-session"
const API_BOT_TOKEN_URL = "http://localhost:21465/api/TESTBOT/MYSECRETKEY/generate-token"

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
    console.log("response token api")
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
            console.log("response token",response)
            generer(response.data.token,response.data.session,props);
            // notify("Bravo - Code généré", "success");

        })
        .catch(function (error) {
            props.etat1Changed(false)
            console.log("response token error",error)
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
            console.log("code genere",response.data.urlcode);
            props.qrcodeChanged(response.data.qrcode);
            // liste(props)
            notify("Bravo - Code généré", "success");

        })
        .catch(function (error) {
            props.etat1Changed(false)
            console.log("code genere error",error)
            notify("Erreur - Veuillez réessayer!", "error");
        });

}

