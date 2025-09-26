import axios from "axios";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { HOST } from "../../Utils/globals";

// GET
const GET_SETTING_API = HOST + "api/v1/config/user/list/false"
//All
const GET_SETTING_ALL_API = HOST + "api/v1/config/user/list"
//All
const GET_SETTING_DISABLED_API = HOST + "api/v1/config/user/disabled"
// ADD
const ADD_SETTING_API = HOST + "api/v1/config/user/register"
// PUT
const UPDATE_SETTING_API = HOST + "api/v1/config/user/id/update"
// DELETE
const DELETE_SETTING_API = HOST + "api/v1/config/user/id/delete"

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
                saveItemToSessionStorage(JSON.stringify(response.data.content),"app-users")
                saveItemToLocalStorage(JSON.stringify(response.data.content), "app-users")
                props.itemsChanged(response.data.content);
                // console.log("reponseuser", response.data.content)
            }

        })
        .catch(function (error) {
           
        });
}
export let all = async (props) => {

    const config = {
        method: 'GET',
        url: GET_SETTING_ALL_API,
        headers: {
            
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
            //console.log("reponse", response.data)
            if (response.data !== "" || response.data !== undefined || response.data.length > 0) {
                saveItemToSessionStorage(JSON.stringify(response.data.content),"app-users")
                saveItemToLocalStorage(JSON.stringify(response.data.content), "app-users")
                props.itemsChanged(response.data.content);
                // console.log("reponseuser", response.data.content)
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
            props.etatChanged(false)
            if (response.data.response.status) {
                saveItemToSessionStorage(JSON.stringify(response.data.content), "app-users")
                saveItemToLocalStorage(JSON.stringify(response.data.content), "app-users")
                
                // console.log("responseadduser",response)
            
                notify("Bravo - Utilisateur ajouté", "success");
            
                all(props)
            } else {
                notify(response.data.response.content.message, "error");
            }
            

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
            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-users")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-users")

            props.etatChanged(false)
           
            notify("Bravo - Utilisateur modifié", "success");
           
            all(props)

        })
        .catch(function (error) {
            props.etatChanged(false)
            if (error.response.data.content !=="") {
                notify(error.response.data.content.message, "error");
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }
        });

}

export const suppression = async (data, props) => {

    console.log("props", props);
    console.log("propsID", props.id);
    console.log("dataID", data.id);
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
            console.log("response1", response);

            saveItemToSessionStorage(JSON.stringify(response.data.content), "app-users")
            saveItemToLocalStorage(JSON.stringify(response.data.content), "app-users")

            props.etat3Changed(false)
            notify("Bravo - Utilisateur supprimé", "success");    
            all(props)
        })
        .catch(function (error) {
            console.log("response2", error);

            props.etat3Changed(false)
            if (error.response.data.content !=="") {
                notify(error.response.data.content.message, "error");
            } else {
                notify("Erreur - Veuillez réessayer!", "error");
            }
        });

}
