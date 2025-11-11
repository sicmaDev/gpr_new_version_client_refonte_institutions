import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// GET
const GET_SETTING_ALL = HOST + "api/v1/config/service_point/list"

const GET_SETTING_DISABLED_API = HOST + "api/v1/config/service_point/disabled"
// GET
const GET_SETTING_API = HOST + "api/v1/config/service_point/list/false"
// ADD
const ADD_SETTING_API = HOST + "api/v1/config/service_point/add"
// PUT
const UPDATE_SETTING_API = HOST + "api/v1/config/service_point/id/update"
// DELETE
const DELETE_SETTING_API = HOST + "api/v1/config/service_point/id/delete"

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
              
                saveItemToSessionStorage(JSON.stringify(response.data.content), "app-ps")
                saveItemToLocalStorage(JSON.stringify(response.data.content), "app-ps")
                props.itemsChanged(response.data.content);
            }

        })
        .catch(function (error) {
           
        });
}
export let all = async (props) => {

    const config = {
        method: 'GET',
        url: GET_SETTING_ALL,
        headers: {
            
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
            //console.log("reponse", response.data)
            if (response.data !== "" || response.data !== undefined || response.data.length > 0) {
              
                saveItemToSessionStorage(JSON.stringify(response.data.content), "app-ps")
                saveItemToLocalStorage(JSON.stringify(response.data.content), "app-ps")
                props.itemsChanged(response.data.content);
            }

        })
        .catch(function (error) {
           
        });
}

export let disabled = async (props,id,isDisabled) => {

    const config = {
        method: 'DELETE',
        url: `${GET_SETTING_DISABLED_API}/${id}/${isDisabled}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    return axios(config)
        
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
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-ps")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-ps")

            props.etatChanged(false)
            notify("Bravo - Point de service ajouté", "success");
           
           all(props)

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
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-ps")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-ps")

            props.etat2Changed(false)
            notify("Bravo - Point de service modifié", "success");
           
            all(props)

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
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-ps")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-ps")

            props.etat3Changed(false)
           
            notify("Bravo - Point de service supprimé", "success");
           
           all(props)

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
