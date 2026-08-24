import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// GET
const GET_SETTING_API = HOST + "api/v1/config/faq/list"
// ADD
const ADD_SETTING_API = HOST + "api/v1/config/faq/add"
// PUT
const UPDATE_SETTING_API = HOST + "api/v1/config/faq/id/update"
// DELETE
const DELETE_SETTING_API = HOST + "api/v1/config/faq/id/delete"

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
            // saveItemToSessionStorage(response.data.content, "app-recours")
            // saveItemToLocalStorage(response.data.content, "app-recours")

            props.etatChanged(false)
           
            notify("Bravo - Question ajoutée à la FAQ", "success");
           
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
            // saveItemToSessionStorage(response.data.content, "app-recours")
            // saveItemToLocalStorage(response.data.content, "app-recours")

            props.etat2Changed(false)
           
            notify("Bravo - Question modifiée", "success");
           
           liste(props)

        })
        .catch(function (error) {
            props.etat2Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("errofaq",error)
        });

}

export const suppression = async (props, data) => {

    const config = {
        method: 'delete',
        url: DELETE_SETTING_API.replace("id", data.id),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
      
    };

    await axios(config)
        .then(function (response) {
            // saveItemToSessionStorage(response.data.content, "app-recours")
            // saveItemToLocalStorage(response.data.content, "app-recours")
           
            props.etat3Changed(false)
            notify("Bravo - Question supprimée", "success");
           
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
