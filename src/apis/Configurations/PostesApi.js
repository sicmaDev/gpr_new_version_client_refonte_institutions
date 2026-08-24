import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// GET
const GET_SETTING_API = HOST + "api/v1/config/poste/list/false"
// ADD
const ADD_SETTING_API = HOST + "api/v1/config/poste/add"
// PUT
const UPDATE_SETTING_API = HOST + "api/v1/config/poste/id/update"
// DELETE
const DELETE_SETTING_API = HOST + "api/v1/config/poste/id/delete"

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
                saveItemToSessionStorage(response.data.content,"app-postes")
                saveItemToLocalStorage(response.data.content, "app-postes")
                props.itemsChanged(response.data.content);
               // console.log(props.items)
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
            saveItemToSessionStorage(response.data.content, "app-postes")
            saveItemToLocalStorage(response.data.content, "app-postes")

            props.etatChanged(false)
           
            notify("Bravo - Poste ajouté", "success");
           
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
            saveItemToSessionStorage(response.data.content, "app-postes")
            saveItemToLocalStorage(response.data.content, "app-postes")

            props.etat2Changed(false)
           
            notify("Bravo - Poste modifié", "success");
           
           liste(props)

        })
        .catch(function (error) {
            props.etat2Changed(false)
            if (error.response.data.content !=="") {
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
            saveItemToSessionStorage(response.data.content, "app-postes")
            saveItemToLocalStorage(response.data.content, "app-postes")

            props.etat3Changed(false)
            notify("Bravo - Poste supprimé", "success");
           
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
