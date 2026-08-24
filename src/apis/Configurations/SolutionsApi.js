import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// GET
const GET_SETTING_API = HOST + "api/v1/config/existing_solution/list"
// ADD
const ADD_SETTING_API = HOST + "api/v1/config/existing_solution/add"
// PUT
const UPDATE_SETTING_API = HOST + "api/v1/config/existing_solution/id/update"
// DELETE
const DELETE_SETTING_API = HOST + "api/v1/config/existing_solution/id/delete"

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
            //console.log("reponseSolutions", response.data)
            if (response.data !== "" || response.data !== undefined || response.data.length > 0) {
                // saveItemToSessionStorage(response.data.content,"app-langues")
                // saveItemToLocalStorage(response.data.content, "app-langues")
                props.itemsChanged(response.data.content);
                // console.log("solutionscontent",response.data.content)
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
            // saveItemToSessionStorage(response.data.content, "app-langues")
            // saveItemToLocalStorage(response.data.content, "app-langues")

            props.etatChanged(false)
           
            liste(props)
            notify("Bravo - Solution ajouté", "success");

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
            // saveItemToSessionStorage(response.data.content, "app-langues")
            // saveItemToLocalStorage(response.data.content, "app-langues")

            props.etat2Changed(false)
           
            notify("Bravo - Solution modifié", "success");
           
            liste(props)

        })
        .catch(function (error) {
            props.etat2Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
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
            // saveItemToSessionStorage(response.data.content, "app-langues")
            // saveItemToLocalStorage(response.data.content, "app-langues")

            props.etat3Changed(false)
           
            notify("Bravo - Solution supprimé", "success");
           
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
