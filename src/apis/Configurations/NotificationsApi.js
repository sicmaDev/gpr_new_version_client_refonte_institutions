import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// GET
const GET_SETTING_API = HOST + "api/v1/config/user/email_receiver/list"
// GET user list
const GET_SETTING_API_USER = HOST + "api/v1/config/user/list/false"
// ADD
const ADD_SETTING_API = HOST + "api/v1/config/user/email_receiver/change"
// DELETE
const DELETE_SETTING_API = HOST + "api/v1/config/user/email_receiver/id/delete"

export let liste = async (props) => {

    const config = {
        method: 'GET',
        url: GET_SETTING_API,
        headers: {
            
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
            // console.log("reponse", response.data.content)
            if (response.data !== "" || response.data !== undefined || response.data.length > 0) {
                props.itemsChanged(response.data.content);
            }
            listeU(props)
        })
        .catch(function (error) {
           
        });
}

export let listeU = async (props) => {

    const config = {
        method: 'GET',
        url: GET_SETTING_API_USER,
        headers: {
            
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
            //console.log("reponse", response.data)
            if (response.data !== "" || response.data !== undefined || response.data.length > 0) {
                saveItemToSessionStorage(response.data.content,"app-users")
                saveItemToLocalStorage(response.data.content, "app-users")
                props.items2Changed(response.data.content);
                // console.log("reponseuser2", response.data.content)
            }

        })
        .catch(function (error) {
           
        });
}

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
        .then(async function (response) {
            // saveItemToSessionStorage(response.data.content, "app-recours")
            // saveItemToLocalStorage(response.data.content, "app-recours")

            props.etatChanged(false)

            notify("Bravo - Configuration des notifications", "success");

           await liste(props)
           await listeU(props)

        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - "+error.response.data.content.message+"!", "error");
            // console.log("notiferror",error.response.data.content.message)
        });

}

export const suppression = async (props,id) => {

    const config = {
        method: 'delete',
        url: DELETE_SETTING_API.replace("id",id),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
      
    };

    await axios(config)
        .then(async function (response) {
            // saveItemToSessionStorage(response.data.content, "app-recours")
            // saveItemToLocalStorage(response.data.content, "app-recours")

            props.etat3Changed(false)
            notify("Suppression effectuée avec succès !", "success");

           await liste(props)
           await listeU(props)

        })
        .catch(function (error) {
            props.etat3Changed(false)
            if (error.response.data.content !=="") {
                notify(error.response.data.content.message, "error");
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }
        });

}
