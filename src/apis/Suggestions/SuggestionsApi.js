import axios from "axios";
import { loadItemFromLocalStorage, loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { notify } from "../../Utils/alert";
import { HOST } from "../../Utils/globals";
import {v4 as uuidv4} from "uuid";

const ADD_TEMP_SUGGESTION_API = HOST + "api/v1/suggestion/save_temp"
const ADD_SUGGESTION_API = HOST + "api/v1/suggestion/add"
const TREAT_SUGGESTION_API = HOST + "api/v1/suggestion/treatSuggestion"
const LIST_ALL_SUGGESTION_API = HOST + "api/v1/suggestion/list"
const LIST_SUGGESTION_API_BY_STATE = HOST + "api/v1/suggestion/list/state"
const FILES_SUGGESTION_API = HOST + "api/v1/suggestion/getFilesBy/%s"
const FILES_DOWNLOAD_API = HOST + "api/v1/media/download/%s"
const AUDIOS_CLAIM_API = HOST + "api/v1/suggestion/getAudiosBy/%s"


export const listeTousStatuts = async (props) => {

    const config = {
        method: 'get',
        url: LIST_ALL_SUGGESTION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
            // console.log("response.data.content",response.data.content)
            props.itemsChanged(response.data.content)
            return response.data.content
        })
        .catch(function (error) {
            // console.log('errreuapisuggesition',error)
            return error;
        });
}

export const listeByStatut = async (props,state) => {
    const config = {
        method: 'get',
        url: LIST_SUGGESTION_API_BY_STATE.replace("state",state),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
           
            // console.log("response",response.data.content)
            props.itemsChanged(response.data.content)

            return response.data.content
        })
        .catch(function (error) {
            return error;
        });
}

export const addTempSuggestionApi = async (data, props) => {
    // console.log("data",data)

    const config = {
        method: 'post',
        url: ADD_TEMP_SUGGESTION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/octet-stream',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {

            notify("Bravo - Suggestion sauvegardée", "success");
            listeByStatut(props,"TEMP_SAVED")
            props.etatChanged(false)
        })
        .catch(function (error) {
            props.etatChanged(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const addSuggestionApi = async (data, props) => {
    const config = {
        method: 'post',
        url: ADD_SUGGESTION_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };
    await axios(config)
        .then(function (response) {
            props.etat2Changed(false)
            notify("Bravo - Suggestion ajoutée", "success");
           // listeTousStatuts(props)
        })
        .catch(function (error) {
            props.etat2Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const treatSuggestionApi = async (data, props) => {

    const config = {
        method: 'put',
        url: TREAT_SUGGESTION_API,
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
            props.etat2Changed(false)
            notify("Bravo - Suggestion traitée", "success");

            listeByStatut(props,"SAVED")

        })
        .catch(function (error) {
            props.etatChanged(false)
            props.etat2Changed(false)
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const getFillesApi = async (data, props) => {

    const config = {
        method: 'get',
        url: FILES_SUGGESTION_API.replace("%s", data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {

            // notify("Bravo - Mesure de satisfaction effectuée", "success");
            // console.log("response data content",response.data.content)
            props.selectedItemFilesChanged(response.data.content)
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreurgetfichier",error)
        });
}

export const downloadFillesApi = async (data, filename) => {

    const config = {
        method: 'get',
        url: FILES_DOWNLOAD_API.replace("%s", data),
        responseType: 'blob',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token'),
            
        },
    
    };
    await axios(config)
        .then(function (response) {

            notify("Bravo - Téléchargement du fichier effectué", "success");
            // console.log("response data content",response.data)
            // Créez un objet URL à partir de la réponse
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Créez un lien invisible et déclenchez le téléchargement
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // Remplacez 'nom_du_fichier.ext' par le nom du fichier
            document.body.appendChild(link);
            link.click();

            // Libérez l'URL de l'objet lorsque le téléchargement est terminé
            window.URL.revokeObjectURL(url);
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

//offline
export const listeByStatutOffline = async (props,state) => {
    let sugs = loadItemFromLocalStorage("sugs-TS") !== undefined ? (JSON.parse(loadItemFromLocalStorage("sugs-TS"))): [];
    let sugsTemp = sugs.filter((e) => {return e.status === state})

    // console.log(sugsTemp)
    props.itemsChanged(sugsTemp)
    
    return sugsTemp
      
}

export const listeTousStatutsOffline = async (props) => {
    let sugs = loadItemFromLocalStorage("sugs-TS") !== undefined ? (JSON.parse(loadItemFromLocalStorage("sugs-TS"))): [];
    let sugsGlobal = sugs.filter((e) => {return e.status !== "TEMP_SAVED"})

    props.itemsChanged(sugsGlobal)
    
    return sugsGlobal;
   
}


export const addTempSuggestionApiOffline = async (data, props) => {
    let sugs = loadItemFromLocalStorage("sugs-TS") !== undefined ? (JSON.parse(loadItemFromLocalStorage("sugs-TS"))): [];

    //date
    let datetmp = new Date();
    let jour = (datetmp.getDate()) < 10 ? "0"+(datetmp.getDate()) : datetmp.getDate()
    let mois = (datetmp.getMonth() + 1) < 10 ? "0"+(datetmp.getMonth() + 1) : datetmp.getMonth() + 1
    let heures = (datetmp.getHours() ) < 10 ? "0"+(datetmp.getHours()) : datetmp.getHours()
    let minutes = (datetmp.getMinutes() ) < 10 ? "0"+(datetmp.getMinutes()) : datetmp.getMinutes()
    let secondes = (datetmp.getSeconds() ) < 10 ? "0"+(datetmp.getSeconds()) :datetmp.getSeconds()
    let created_at = datetmp.getFullYear()+ "-" + mois + "-" + jour + "T" + heures + ":" + minutes + ":" + secondes
    // console.log("datee",created_at)

    //données
    data["status"]="TEMP_SAVED"
    data["createdAt"]= created_at

    if (data["code"] === "") {
        //code
        let code = "sug" + uuidv4().substring(0, 5)+'-'+(JSON.parse(loadItemFromSessionStorage('app-user'))).servicePointDto.uuid +'-'+(JSON.parse(loadItemFromSessionStorage('app-user')).code)
        // console.log("codeeee",code)
        data["code"]= code

        sugs.push(data);
        saveItemToLocalStorage(JSON.stringify(sugs),"sugs-TS")
    } else {
        let sugsTemp = sugs.filter((e) => {return e.code !== data["code"] })
        let sugsF = sugs.filter((e) => {return e.code === data["code"] })
        data["id"] = sugsF[0].id
        // console.log("sugsTemp1",sugsTemp)
        // sugsTemp[0]=data
        // console.log("data",data)
        // console.log("sugsTemp3",sugs)
        sugsTemp.push(data);
        saveItemToLocalStorage(JSON.stringify(sugsTemp),"sugs-TS")
    }
    
    // sugs.push(data);
    // saveItemToLocalStorage(JSON.stringify(sugs),"sugs-TS")
    listeByStatutOffline(props,"TEMP_SAVED")
    props.etatChanged(false)

    notify("Bravo - Réclamation sauvegardée", "success")
  
}

export const getSuggeAudioApi = async (data, props) => {

    const config = {
        method: 'get',
        url: AUDIOS_CLAIM_API.replace("%s", data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {

            // notify("Bravo - Mesure de satisfaction effectuée", "success");
            // console.log("response data content",response.data)
            props.selectedItemAudioChanged(response.data)
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}

export const addSuggestionApiOffline = async (data, props) => {
    let sugs = loadItemFromLocalStorage("sugs-TS") !== undefined ? (JSON.parse(loadItemFromLocalStorage("sugs-TS"))): [];

    //date
    let datetmp = new Date();
    let jour = (datetmp.getDate()) < 10 ? "0"+(datetmp.getDate()) : datetmp.getDate()
    let mois = (datetmp.getMonth() + 1) < 10 ? "0"+(datetmp.getMonth() + 1) : datetmp.getMonth() + 1
    let heures = (datetmp.getHours() ) < 10 ? "0"+(datetmp.getHours()) : datetmp.getHours()
    let minutes = (datetmp.getMinutes() ) < 10 ? "0"+(datetmp.getMinutes()) : datetmp.getMinutes()
    let secondes = (datetmp.getSeconds() ) < 10 ? "0"+(datetmp.getSeconds()) :datetmp.getSeconds()
    let created_at = datetmp.getFullYear()+ "-" + mois + "-" + jour + "T" + heures + ":" + minutes + ":" + secondes
    // console.log("datee",created_at)

    //code
    let code = "sug" + uuidv4().substring(0, 5)+'-'+(JSON.parse(loadItemFromSessionStorage('app-user'))).servicePointDto.uuid +'-'+(JSON.parse(loadItemFromSessionStorage('app-user')).code)
    // console.log("codeeee",code)
    

    //données
    data["status"]="SAVED"
    data["createdAt"]= created_at

    if (data["code"] === "") {
        data["code"]= code

        // console.log("dataasave",data)
        sugs.push(data);
        saveItemToLocalStorage(JSON.stringify(sugs),"sugs-TS")


    }else{
        let sugsTemp = sugs.filter((e) => {return e.code !== data["code"] })
        let sugsF = sugs.filter((e) => {return e.code === data["code"] })
        data["id"] = sugsF[0].id

        sugsTemp.push(data);
        saveItemToLocalStorage(JSON.stringify(sugsTemp),"sugs-TS")
    }
    

    listeByStatutOffline(props,"TEMP_SAVED")
    props.etat2Changed(false)

    notify("Bravo - Réclamation enregistrée", "success")
}