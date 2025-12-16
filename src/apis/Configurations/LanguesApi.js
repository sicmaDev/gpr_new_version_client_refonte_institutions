import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// GET
const GET_SETTING_API = HOST + "api/v1/config/language/list/false"
// ADD
const ADD_SETTING_API = HOST + "api/v1/config/language/add"
// PUT
const UPDATE_SETTING_API = HOST + "api/v1/config/language/id/update"
// DELETE
const DELETE_SETTING_API = HOST + "api/v1/config/language/id/delete"

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
            //console.log("reponseLangues", response.data)
            if (response.data !== "" || response.data !== undefined || response.data.length > 0) {
                saveItemToSessionStorage(JSON.stringify(response.data.content),"app-langues")
                saveItemToLocalStorage(JSON.stringify(response.data.content), "app-langues")
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
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-langues")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-langues")

            props.etatChanged(false)
           
            liste(props)
            notify("Bravo - Langue ajouté", "success");

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
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-langues")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-langues")

            props.etat2Changed(false)
           
            notify("Bravo - Langue modifié", "success");
           
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
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-langues")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-langues")

            props.etat3Changed(false)
           
            notify("Bravo - Langue supprimé", "success");
           
           liste(props)

        })
        .catch(function (error) {
            props.etat3Changed(false)
            if (error.response.data.content !=="") {
                notify(error.response.data.content.message, "error");
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }
            // console.log("erreurdeletelangue",error.response.data.content)
            
        });

}
