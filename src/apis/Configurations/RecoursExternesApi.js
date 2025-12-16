import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// GET
const GET_SETTING_API = HOST + "api/v1/config/external_recourse/list/false"
// ADD
const ADD_SETTING_API = HOST + "api/v1/config/external_recourse/add"
// PUT
const UPDATE_SETTING_API = HOST + "api/v1/config/external_recourse/id/update"
// DELETE
const DELETE_SETTING_API = HOST + "api/v1/config/external_recourse/id/delete"

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
                saveItemToSessionStorage(JSON.stringify(response.data.content),"app-recours")
                saveItemToLocalStorage(JSON.stringify(response.data.content), "app-recours")
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
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-recours")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-recours")

            props.etatChanged(false)
            notify("Bravo - Recours Externe ajouté", "success");
           
           liste(props)

        })
        .catch(function (error) {
            props.etatChanged(false)
            if (error.response.data.content !== "") {
                notify(error.response.data.content.message, "error");
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }
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
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-recours")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-recours")

            props.etat2Changed(false)
            notify("Bravo - Recours Externe modifié", "success");
           
           liste(props)

        })
        .catch(function (error) {
            props.etat2Changed(false)
            if (error.response.data.content !== "") {
                notify(error.response.data.content.message, "error");
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }
        });

}

export const suppression = async (props, data) => {

    const config = {
        method: 'delete',
        url: DELETE_SETTING_API.replace("id",data.id),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
      
    };

    await axios(config)
        .then(function (response) {
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-recours")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-recours")

            props.etat3Changed(false)
            notify("Bravo - Recours Externe supprimé", "success");
           
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
