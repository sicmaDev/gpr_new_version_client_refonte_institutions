import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// GET
const GET_SETTING_API = HOST + "api/v1/config/collection_channel/list/false"
// ADD
const ADD_SETTING_API = HOST + "api/v1/config/collection_channel/add"
// PUT
const UPDATE_SETTING_API = HOST + "api/v1/config/collection_channel/id/update"
// DELETE
const DELETE_SETTING_API = HOST + "api/v1/config/collection_channel/id/delete"

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
            //console.log("reponse", response.data)
            if (response.data !== "" || response.data !== undefined || response.data.length > 0) {
                saveItemToSessionStorage(JSON.stringify(response.data.content),"app-supports")
                saveItemToLocalStorage(JSON.stringify(response.data.content), "app-supports")
                props.itemsChanged(response.data.content);
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
        .then(function (response) {
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-supports")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-supports")

            props.etatChanged(false)
           
            notify("Bravo - Support de Collecte ajouté", "success");
           
           liste(props)

        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - Veuillez réessayer!", "error");
        });

}

export const modification = async (data, props) => {

    const config = {
        method: 'put',
        url: UPDATE_SETTING_API.replace("id",props.id),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };

    await axios(config)
        .then(function (response) {
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-supports")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-supports")

            props.etat2Changed(false)
           
            notify("Bravo - Support de Collecte modifié", "success");
           
           liste(props)

        })
        .catch(function (error) {
            props.etat2Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
        });

}

export const suppression = async (props) => {

    const config = {
        method: 'delete',
        url: DELETE_SETTING_API.replace("id",props.id),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
      
    };

    await axios(config)
        .then(function (response) {
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-supports")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-supports")

            props.etat3Changed(false)
           
            notify("Bravo - Support de Collecte supprimé", "success");
           
           liste(props)

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
